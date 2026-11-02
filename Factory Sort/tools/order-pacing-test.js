import assert from 'node:assert/strict';
import { createOrderSchedule } from '../ab_test/src/generator/OrderPacing.js';
import { configForLevelNumber, generateLevel, makeRng } from '../ab_test/src/generator/SolvableLevelGenerator.js';

// Treat the scheduler as a black box. Complete goods in the known reference
// order, then let the currently visible prefix accept any matching queued box.
function replayOrders(reference, orders, active) {
    const pending = orders.slice(), queue = [];
    let peak = 0, releases = 0;
    for (const item of reference) {
        queue.push(item);
        peak = Math.max(peak, queue.length);
        for (let progress = true; progress;) {
            progress = false;
            for (let qi = 0; qi < queue.length && !progress; qi++) {
                const ti = pending.slice(0, active).indexOf(queue[qi]);
                if (ti < 0) continue;
                pending.splice(ti, 1);
                queue.splice(qi, 1);
                releases++;
                progress = true;
            }
        }
    }
    return { peak, releases, pending, queue };
}

function* permutations(values) {
    if (values.length <= 1) {
        yield values.slice();
        return;
    }
    for (let i = 0; i < values.length; i++) {
        const rest = values.slice(0, i).concat(values.slice(i + 1));
        for (const suffix of permutations(rest)) yield [values[i], ...suffix];
    }
}

// Exercise the abstract bound independently of the scheduler's chosen shuffle.
// Each finite block can be in ANY order, not merely one generated profile.
let exhaustiveCases = 0;
for (let active = 1; active <= 4; active++) {
    for (let queueCapacity = 2; queueCapacity <= 5; queueCapacity++) {
        for (let blockSize = 1; blockSize <= Math.min(6, active + queueCapacity - 2); blockSize++) {
            const bound = Math.min(queueCapacity - 1, Math.max(1, blockSize - active + 1));
            const indices = Array.from({ length: blockSize }, (_, i) => i);
            const shortSize = Math.max(0, blockSize - 1);
            const total = blockSize * 2 + shortSize;
            const reference = Array.from({ length: total }, (_, i) => `abstract-${i}`);
            for (const permutation of permutations(indices)) {
                const orderIndices = [
                    ...permutation,
                    ...permutation.slice().reverse().map(i => blockSize + i),
                    ...Array.from({ length: shortSize }, (_, i) => blockSize * 2 + shortSize - 1 - i),
                ];
                for (const fixture of [
                    { name: 'unique', item: index => reference[index] },
                    { name: 'repeated-three', item: index => `repeat-${index % 3}` },
                    { name: 'repeated-pairs', item: index => `pair-${Math.floor(index / 2) % 3}` },
                ]) {
                    const inputs = reference.map((_, i) => fixture.item(i));
                    const outputs = orderIndices.map(i => fixture.item(i));
                    const result = replayOrders(inputs, outputs, active);
                    const context = `A=${active} Q=${queueCapacity} B=${blockSize} ${fixture.name}`;
                    assert.ok(result.peak <= bound, `${context}: transient peak ${result.peak} exceeds ${bound}`);
                    assert.equal(result.releases, total, `${context}: two blocks and short tail drain every completion`);
                    assert.equal(result.pending.length, 0, `${context}: no unfulfilled order remains`);
                    assert.equal(result.queue.length, 0, `${context}: no staged box remains`);
                    exhaustiveCases++;
                }
            }
        }
    }
}

for (const tier of ['normal', 'hard', 'superhard']) {
    for (const seed of [1, 2, 7919, 20261102]) {
        const reference = Array.from({ length: 64 }, (_, i) => `type-${i}`);
        const cfg = { tier, conveyorMaxActive: tier === 'normal' ? 4 : 3, queueCapacity: 5, trayJitter: true };
        const schedule = createOrderSchedule(reference, cfg, makeRng(seed));
        const repeat = createOrderSchedule(reference, cfg, makeRng(seed));
        assert.deepEqual(schedule, repeat, `${tier}: seed must reproduce complete authored schedule`);
        assert.deepEqual(schedule.trayTypes.slice().sort(), reference.slice().sort(), `${tier}: preserve order multiset`);
        assert.equal(schedule.authoredProgressBasis, 'reference-completions');
        assert.equal(schedule.authoringFallback, false);
        assert.ok(schedule.guaranteedQueueUpperBound <= cfg.queueCapacity - 1, `${tier}: reserve one queue slot`);
        assert.ok(schedule.authoredBlocks.length > 2);
        const extras = schedule.authoredBlocks.map(block => block.appliedExtra);
        assert.ok(Math.max(...extras) > Math.min(...extras), `${tier}: pressure and recovery must be distinct authored blocks`);
        let next = 0;
        for (const block of schedule.authoredBlocks) {
            assert.equal(block.from, next, 'authored blocks cover reference exactly once');
            assert.ok(block.to > block.from);
            assert.ok(block.queueUpperBound <= cfg.queueCapacity - 1);
            assert.ok(block.appliedExtra >= 0 && block.appliedExtra <= cfg.queueCapacity - 2);
            assert.ok(block.fromProgress >= 0 && block.toProgress <= 1);
            next = block.to;
        }
        assert.equal(next, reference.length);
        const replay = replayOrders(reference, schedule.trayTypes, cfg.conveyorMaxActive);
        assert.equal(replay.releases, reference.length, 'every generated order receives one completion');
        assert.deepEqual(replay.pending, []);
        assert.deepEqual(replay.queue, []);
        assert.ok(replay.peak <= schedule.guaranteedQueueUpperBound, 'measured peak respects declared bound');
        assert.ok(replay.peak > 1, `${tier}: unique-type fixture actually exercises waiting`);
    }
}

{
    const reference = ['A', 'A', 'B', 'C', 'B', 'A', 'C', 'C', 'B'];
    const cfg = { tier: 'superhard', conveyorMaxActive: 3, queueCapacity: 5, trayJitter: true };
    const schedule = createOrderSchedule(reference, cfg, makeRng(99));
    const replay = replayOrders(reference, schedule.trayTypes, 3);
    assert.equal(replay.releases, reference.length, 'repeated emojis are counts, not paired box IDs');
    assert.equal(replay.queue.length, 0);
    assert.equal(replay.pending.length, 0);
    const identity = createOrderSchedule(reference, { ...cfg, trayJitter: false }, makeRng(99));
    assert.deepEqual(identity.trayTypes, reference, 'explicitly disabled jitter preserves reference order');
}

for (const L of [5, 21, 25, 29, 35, 39, 45, 49]) {
    const level = generateLevel(configForLevelNumber(L));
    const pacing = level.difficulty.orderPacing;
    assert.ok(pacing, `L${L}: effective pacing metadata exists`);
    assert.equal(typeof pacing.authoringFallback, 'boolean', 'fallback cannot be silently omitted');
    assert.equal(pacing.replayVerified, true, 'metadata is backed by a successful full replay');
    assert.equal(pacing.actualPeakQueue, level.difficulty.maxQueueHeld);
    assert.ok(pacing.actualPeakQueue <= level.rules.queueCapacity - 1, 'measured reference queue retains headroom');
    assert.equal(pacing.queueEvents.length, level.trays.length, 'one queue event per completed reference set');
    assert.equal(pacing.phaseSummaries.reduce((sum, phase) => sum + phase.completions, 0), level.trays.length);
    for (const event of pacing.queueEvents) {
        assert.ok(event.before >= event.after);
        assert.equal(event.released, event.before - event.after, 'release counts come from actual queue changes');
        assert.ok(event.deliveredProgressAfter >= event.deliveredProgressBefore);
    }
    if (pacing.authoringFallback) {
        assert.equal(pacing.profile, 'legacy');
        assert.ok(pacing.requestedProfile, 'fallback preserves original authoring intent');
    }
}

console.log(`Order pacing: ${exhaustiveCases} abstract block-bound cases plus seeded profiles and measured reference traces passed`);
