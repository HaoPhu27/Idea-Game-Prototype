import assert from 'node:assert/strict';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

const order = (id, targetItemId) => ({ id, targetItemId, categoryId: 'stuffed_animals', matchMode: 'itemType' });
const level = (items, trays, layout = null, timeToPlay = 90) => ({
    boxes: items.map(items => ({ items })), trays,
    ...(layout ? { layout } : {}), rules: { timeToPlay },
});
function create(config) {
    const engine = new GameEngine();
    engine.startLevel(config);
    return engine;
}
const simple = () => level([['bear', 'bear'], ['bear']], [order('bear-order', 'bear')]);
const snapshot = engine => JSON.stringify({
    boxes: engine.boxes.map(b => ({ id: b.id, slots: b.slots, wrapped: b.isWrapped })),
    queue: engine.queue.map(b => ({ id: b.id, slots: b.slots, wrapped: b.isWrapped })),
    columns: engine.columns, trays: engine.conveyor.allTrays.map(t => ({ id: t.id, full: t.isFull() })),
    moves: engine.moveCount, state: engine.gameState,
});
function itemCounts(engine) {
    const counts = {};
    for (const box of [...engine.boxes, ...engine.queue]) {
        for (const item of box.items) counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
}
function matchingInvariant(engine) {
    const counts = itemCounts(engine);
    const demanded = {};
    for (const tray of engine.conveyor.allTrays.filter(t => !t.isFull())) {
        demanded[tray.targetItemId] = (demanded[tray.targetItemId] || 0) + 3;
    }
    assert.deepEqual(counts, demanded, 'every remaining order has exactly one matching triple');
    for (const box of [...engine.boxes, ...engine.queue]) {
        if (box.isWrapped) assert.ok(box.items.length === 3 && new Set(box.items).size === 1,
            'wrapped boxes are never left partially consumed');
    }
    for (const box of engine.queue) assert.equal(box.isWrapped, true, 'queue contains whole wrapped boxes only');
}

{
    const engine = create(simple());
    engine.startClock();
    assert.equal(engine.freezeTime(), true);
    assert.equal(engine.freezeRemainingSeconds, 30);
    const trays = engine.conveyor.allTrays.slice();
    engine.advanceClock(29.5);
    assert.equal(engine.timeRemainingSeconds, 90);
    assert.equal(engine.freezeRemainingSeconds, 0.5);
    assert.equal(engine.freezeTime(), false, 'freeze cannot stack while active');
    engine.advanceClock(1.25);
    assert.equal(engine.freezeRemainingSeconds, 0);
    assert.equal(engine.timeRemainingSeconds, 89.25, 'only the unfrozen tail of a frame is charged');
    assert.deepEqual(engine.conveyor.allTrays, trays, 'freeze does not mutate conveyor orders');
    assert.equal(engine.moveItem(1, 0, 0), true, 'sorting and delivery remain available while using boosters');
    assert.equal(engine.gameState, 'WON');
    assert.equal(engine.freezeTime(), false, 'terminal games reject boosters');
    engine.startLevel(simple());
    assert.equal(engine.freezeRemainingSeconds, 0, 'retry resets freeze');
    assert.equal(engine.clockStarted, false);
}
{
    const engine = create(simple());
    engine.startClock();
    assert.equal(engine.freezeTime(), true);
    assert.equal(engine.moveItem(1, 0, 0), true, 'gameplay works during the 30-second freeze');
    assert.equal(engine.gameState, 'WON', 'freeze does not pause matching or delivery');
}
{
    const engine = create(level([['bear', 'bear'], ['bear']], [order('x', 'bear')], null, null));
    assert.equal(engine.freezeTime(), false, 'untimed level has no timer to freeze');
}
{
    const engine = create(simple());
    const count = engine.conveyor.allTrays.length;
    assert.equal(engine.maxQueueSize, 5);
    assert.equal(engine.addExtraTray(), true);
    assert.equal(engine.maxQueueSize, 6);
    assert.equal(engine.extraTrayUsed, true);
    assert.equal(engine.addExtraTray(), false, 'one extra slot per level');
    assert.equal(engine.conveyor.allTrays.length, count, 'extra tray adds capacity, never an order');
    engine.startLevel(simple());
    assert.equal(engine.maxQueueSize, 5);
    assert.equal(engine.extraTrayUsed, false);
    assert.equal(engine.addExtraTray(), true);
}

// Both target types belong to the same category: removal must use item identity.
{
    const engine = create(level([
        ['bear', 'duck'], ['bear', 'duck'], ['bear', 'duck'],
    ], [order('b', 'bear'), order('d', 'duck')]));
    assert.equal(engine.removeTray('b'), true);
    assert.equal(itemCounts(engine).bear || 0, 0);
    assert.equal(itemCounts(engine).duck, 3);
    assert.equal(engine.conveyor.allTrays.some(t => t.id === 'b'), false);
    matchingInvariant(engine);
}
// Column index 0 is bottom. Global top row is consumed before lower rows,
// even when those top boxes are hidden from normal player interaction.
{
    const engine = create(level([
        ['bear'], ['bear'], ['bear'], ['bear'], ['bear'], ['bear'],
    ], [order('b1', 'bear'), order('b2', 'bear')], { columns: [[0, 2, 4], [1, 3, 5]], visibleRows: 1 }));
    assert.equal(engine.removeTray('b1'), true);
    assert.equal(engine.getBox(4), undefined, 'highest row in left column removed');
    assert.equal(engine.getBox(5), undefined, 'highest row in right column removed');
    assert.equal(engine.getBox(2), undefined, 'next row uses left-to-right tie break');
    assert.ok(engine.getBox(0));
    assert.ok(engine.getBox(1));
    matchingInvariant(engine);
}
{
    const engine = create(level([['bear', 'bear', 'bear']], [order('b', 'bear')]));
    assert.equal(engine.queue.length, 1);
    assert.equal(engine.removeTray('b'), true, 'whole queued triple can be consumed');
    assert.equal(engine.queue.length, 0);
    assert.equal(engine.gameState, 'WON', 'removing the final order and triple wins');
    matchingInvariant(engine);
}
{
    const engine = create(level([['bear', 'bear']], [order('b', 'bear')]));
    const before = snapshot(engine);
    assert.equal(engine.removeTray('b'), false, 'insufficient triple is rejected');
    assert.equal(snapshot(engine), before, 'failed removal is atomic');
}
{
    const engine = create(simple());
    const before = snapshot(engine);
    assert.equal(engine.removeTray('missing'), false);
    assert.equal(snapshot(engine), before);
    engine.conveyor.maxActive = 1;
    engine.conveyor.allTrays.push(new engine.conveyor.allTrays[0].constructor('hidden-order', null, 'bear'));
    const hiddenBefore = snapshot(engine);
    assert.equal(engine.removeTray('hidden-order'), false, 'cannot target an order outside the active conveyor window');
    assert.equal(snapshot(engine), hiddenBefore);
}
{
    const engine = create(level([['bear', 'bear', 'bear']], [order('b', 'bear')]));
    engine.onTrayDelivered = () => {};
    assert.equal(engine.deliverQueueBox(0, 'b'), true);
    const before = snapshot(engine);
    assert.equal(engine.removeTray('b'), false, 'an already fulfilled tray cannot consume another triple');
    assert.equal(snapshot(engine), before);
}
{
    const engine = create(level([
        ['bear', 'duck'], ['bear', 'duck'], ['bear'], ['duck'],
        ['bunny', 'bunny', 'bunny'],
    ], [order('b', 'bear'), order('d', 'duck'), order('r', 'bunny')],
    { columns: [[0, 2], [1, 3], [4]], visibleRows: 1 }));
    const hidden = [2, 3].map(id => ({ id, slots: engine.getBox(id).slots.slice() }));
    const queued = engine.queue.map(b => ({ id: b.id, slots: b.slots.slice() }));
    const counts = itemCounts(engine);
    const before = snapshot(engine);
    const accepted = engine.shuffleItems();
    assert.equal(typeof accepted, 'boolean');
    assert.deepEqual(itemCounts(engine), counts, 'shuffle preserves the complete item multiset');
    assert.deepEqual([2, 3].map(id => ({ id, slots: engine.getBox(id).slots })), hidden, 'hidden items do not shuffle');
    assert.deepEqual(engine.queue.map(b => ({ id: b.id, slots: b.slots })), queued, 'wrapped queue does not shuffle');
    if (!accepted) assert.equal(snapshot(engine), before, 'uncertified/no-op shuffle must roll back completely');
    matchingInvariant(engine);
}
{
    const engine = create(simple());
    engine.setGameState('IDLE'); // reset/loading interval
    const before = snapshot(engine);
    for (const action of [() => engine.freezeTime(), () => engine.addExtraTray(),
        () => engine.shuffleItems(), () => engine.removeTray('bear-order')]) assert.equal(action(), false);
    assert.equal(snapshot(engine), before, 'no booster can mutate old gameplay during level reset');
}


// Proof helpers must certify a complete live board, not just modulo-three counts.
{
    const { boosterSnapshot, boosterMatchingInvariant, boosterProveSolvable } =
        await import('../ab_test/src/core/BoosterSolver.js');
    const engine = create(simple());
    const state = boosterSnapshot(engine);
    const before = JSON.stringify(state);
    assert.equal(boosterMatchingInvariant(state), true);
    assert.equal(boosterProveSolvable(state), true);
    assert.equal(JSON.stringify(state), before, 'certification does not mutate its input');
    const broken = { ...state, t: ['duck'] };
    assert.equal(boosterMatchingInvariant(broken), false);
    assert.equal(boosterProveSolvable(broken), false, 'equal item totals cannot substitute another target type');
    const trapped = { b: [['bear', 'duck'], ['bear', 'duck'], ['bear', 'duck']],
        c: [[0], [1], [2]], q: [], t: ['bear', 'duck'], rows: 1, cap: 5, active: 1 };
    assert.equal(boosterMatchingInvariant(trapped), true);
    // Slots are available in this fixture; an accepted candidate must have an actual path.
    assert.equal(boosterProveSolvable(trapped), true);
    const shuffled = create(level([['bear', 'duck'], ['bear', 'duck'], ['bear', 'duck']],
        [order('b', 'bear'), order('d', 'duck')]));
    let seed = 7;
    const rng = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
    const original = snapshot(shuffled);
    assert.equal(shuffled.shuffleItems(rng), true, 'a small solvable shuffle is usable');
    assert.notEqual(snapshot(shuffled), original, 'accepted shuffle makes a real change');
    assert.equal(boosterProveSolvable(boosterSnapshot(shuffled)), true);
    matchingInvariant(shuffled);
}



// A partly consumed wrapped BOARD box is opened, never left falsely wrapped.
{
    const engine = create(level([['bear', 'bear'], ['bear', 'bear', 'bear'], ['bear']],
        [order('b1', 'bear'), order('b2', 'bear')],
        { columns: [[0, 1, 2]], visibleRows: 3 }));
    // Model the browser's brief packaging interval before wrapped board -> queue.
    const wrapped = engine.queue.shift();
    engine.boxes.push(wrapped);
    engine.columns = [[0, 1, 2]];
    assert.equal(engine.removeTray('b1'), true);
    assert.equal(engine.getBox(2), undefined, 'top singleton is consumed first');
    assert.deepEqual(engine.getBox(1).items, ['bear'], 'only two items taken from the next wrapped box');
    assert.equal(engine.getBox(1).isWrapped, false, 'partial board remainder opens for player moves');
    assert.equal(engine.queue.length, 0);
    matchingInvariant(engine);
    assert.equal(engine.moveItem(1, 2, 0) || engine.moveItem(1, 1, 0) || engine.moveItem(1, 0, 0), true);
    assert.equal(engine.gameState, 'WON', 'remaining triple still has an actual completion');
}
// Counts alone are insufficient: removal here leaves two full mixed boxes,
// which have no legal first move. The entire operation must roll back.
{
    const engine = create(level([
        ['duck', 'duck', 'penguin'], ['duck', 'penguin', 'penguin'], ['bear'], ['bear'], ['bear'],
    ], [order('b', 'bear'), order('d', 'duck'), order('p', 'penguin')],
    { columns: [[0], [1], [2], [3], [4]], visibleRows: 1 }));
    matchingInvariant(engine);
    const before = snapshot(engine);
    assert.equal(engine.removeTray('b'), false, 'invariant-valid but insoluble remainder is rejected');
    assert.equal(snapshot(engine), before, 'proof rejection restores boxes, slots, columns, orders and state');
}
// Independent GameSim solver checks seeded accepted shuffles on a small board.
// This checks the completion path with a separate implementation of movement.
{
    const G = await import('../ab_test/src/generator/GameSim.js');
    let accepted = 0;
    for (let trial = 1; trial <= 12; trial++) {
        const engine = create(level([['bear', 'duck'], ['bear', 'duck'], ['bear', 'duck']],
            [order('b', 'bear'), order('d', 'duck')]));
        let seed = trial;
        const rng = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
        const before = snapshot(engine);
        if (!engine.shuffleItems(rng)) {
            assert.equal(snapshot(engine), before);
            continue;
        }
        accepted++;
        const indices = new Map(engine.boxes.map((box, index) => [box.id, index]));
        const config = {
            boxes: engine.boxes.map(box => ({ items: box.items.slice() })),
            trays: engine.conveyor.allTrays.map(tray => ({ id: tray.id, targetItemId: tray.targetItemId })),
            layout: { columns: engine.columns.map(col => col.map(id => indices.get(id))), visibleRows: engine.visibleRows },
            maxActiveTrays: engine.conveyor.maxActive,
            rules: { queueCapacity: engine.maxQueueSize },
        };
        const state = G.stateFromLevel(config);
        const cats = G.buildCatIndex(config);
        const result = G.solveFull(state, cats, { maxNodes: 20000, maxDepth: 40 });
        assert.equal(result.solved, true, `seed ${trial}: independent solver finds a win after shuffle`);
        let replay = state;
        for (const move of result.moves) replay = G.applyMove(G.cloneState(replay), move, cats);
        assert.equal(G.isWin(replay), true, `seed ${trial}: replay reaches a complete win`);
        matchingInvariant(engine);
    }
    assert.ok(accepted > 0, 'seeded stress fixtures exercise accepted shuffles');
}

console.log('Boosters: freeze, capacity/reset, exact matching, hidden priority, wrapped partials, atomic rollback and independent solver stress passed');
