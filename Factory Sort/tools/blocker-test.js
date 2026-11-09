import assert from 'node:assert/strict';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';
import { BLOCKER_SCENARIOS, createBlockerLevel, replayBlockerLevel } from '../ab_test/src/generator/BlockerLevels.js';
import { validateBlockerLevel } from '../ab_test/src/core/BlockerRules.js';

let passed = 0;
function test(name, fn) {
    fn();
    passed++;
    console.log(`ok ${passed} - ${name}`);
}

function snapshot(engine) {
    return JSON.stringify({
        state: engine.gameState, reason: engine.loseReason, moves: engine.moveCount,
        boxes: engine.boxes.map(box => [box.id, box.slots, box.isWrapped]),
        queue: engine.queue.map(box => box.id), columns: engine.columns,
        time: engine.timeRemainingSeconds, local: engine.blockerState.localTime,
        records: [...engine.blockerState.records], shipped: [...engine.blockerState.shipped]
    });
}

function drain(engine) {
    let progressed = true;
    for (let pass = 0; pass < 64 && progressed && engine.gameState === 'PLAYING'; pass++) {
        progressed = false;
        for (const box of [...engine.boxes]) {
            if (!box.isWrapped || !engine.canQueueBlockerBox(box.id)) continue;
            if (engine.moveBoxToQueue(box)) progressed = true;
        }
        for (let delivery = 0; delivery < 64 && engine.gameState === 'PLAYING'; delivery++) {
            if (!engine.tryAutoFillTray()) break;
            progressed = true;
        }
    }
}

// Board plus queue conserves three items per unshipped order; full trays are excluded.
function conserve(engine, level) {
    const expected = {}, actual = {};
    for (const tray of level.trays) {
        expected[tray.targetItemId] = (expected[tray.targetItemId] || 0) + 3;
        actual[tray.targetItemId] = 0;
    }
    for (const box of [...engine.boxes, ...engine.queue]) {
        for (const item of box.items) actual[item] = (actual[item] || 0) + 1;
    }
    for (const id of engine.blockerState.shipped) {
        const items = level.boxes[id].items;
        if (items.length) expected[items[0]] -= 3;
    }
    assert.deepEqual(actual, expected);
}

function independentReplay(level) {
    const engine = new GameEngine();
    engine.startLevel(level);
    engine.startClock();
    conserve(engine, level);
    for (const action of level.referenceActions) {
        conserve(engine, level);
        if (action.type === 'wait') engine.advanceClock(action.seconds);
        else assert.equal(engine.moveItem(action.from, action.slot ?? action.index, action.to, action.targetSlot ?? null), true);
        drain(engine);
        conserve(engine, level);
    }
    drain(engine);
    engine.checkConditions();
    conserve(engine, level);
    assert.equal(engine.gameState, 'WON');
    return engine;
}

test('all nine scenario helpers and independent reference replays', () => {
    assert.equal(BLOCKER_SCENARIOS.length, 9);
    for (const scenario of BLOCKER_SCENARIOS) {
        const level = createBlockerLevel(scenario.id);
        assert.equal(validateBlockerLevel(level), true);
        const replay = replayBlockerLevel(GameEngine, createBlockerLevel(scenario.id));
        assert.equal(replay.solved, true, `${scenario.id}: ${replay.failure}`);
        assert.equal(replay.engine.gameState, 'WON');
        assert.equal(independentReplay(level).gameState, 'WON');
    }
});

test('counted and named locks deny source and target until a real shipment', () => {
    for (const id of ['locked', 'locked-named']) {
        const engine = new GameEngine();
        engine.startLevel(createBlockerLevel(id));
        assert.equal(engine.moveItem(2, 0, 3), false);
        assert.equal(engine.moveItem(3, 0, 2), false);
        assert.equal(engine.moveItem(1, 0, 0), true);
        assert.equal(engine.blockerState.shipped.has(0), true);
        assert.equal(engine.blockerState.records.get(2).unlocked, true);
        assert.equal(engine.getBlockerView(2).blocked, false);
        assert.equal(engine.moveItem(3, 0, 2), true);
        drain(engine);
        assert.equal(engine.gameState, 'WON');
    }
});

test('frozen slot waits for its clock while Freeze preserves global time', () => {
    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('frozen'));
    engine.advanceClock(3);
    const record = engine.blockerState.records.get(1);
    assert.equal(engine.blockerState.localTime, 0);
    assert.equal(record.activated, false);
    engine.freezeRemainingSeconds = 30;
    engine.startClock();
    assert.equal(engine.timeRemainingSeconds, 120);
    engine.advanceClock(2.9);
    assert.equal(engine.moveItem(1, 0, 0), false);
    engine.advanceClock(0.1);
    assert.equal(record.thawed, true);
    assert.equal(engine.timeRemainingSeconds, 120);
    assert.equal(engine.moveItem(1, 0, 0), true);
});

test('stuck empty box remains until shipment then is removed', () => {
    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('stuck'));
    assert.ok(engine.getBox(4));
    assert.equal(engine.getBox(4).isEmpty(), true);
    assert.equal(engine.moveBoxToQueue(4), false);
    assert.equal(engine.moveItem(1, 0, 0), true);
    assert.equal(engine.blockerState.shipped.has(0), true);
    assert.ok(!engine.getBox(4));
    assert.equal(engine.boxes.some(box => box.id === 4), false);
    assert.equal(engine.moveItem(3, 0, 2), true);
    drain(engine);
    assert.equal(engine.gameState, 'WON');
});

test('defective queue hold blocks dispatch without a false loss', () => {
    const level = createBlockerLevel('defective');
    level.boxes = level.boxes.slice(0, 2);
    level.trays = level.trays.slice(0, 1);
    level.layout = { columns: [[0], [1]], visibleRows: 4 };
    assert.equal(validateBlockerLevel(level), true);
    const engine = new GameEngine();
    engine.startLevel(level);
    engine.onTrayDelivered = () => {};
    engine.startClock();
    engine.freezeRemainingSeconds = 30;
    assert.equal(engine.moveItem(1, 0, 0), true);
    assert.equal(engine.queue.length, 1);
    assert.equal(engine.boxes.every(box => box.isEmpty()), true);
    assert.equal(engine.conveyor.getAllActiveTrays().length, 1);
    const record = engine.blockerState.records.get(0);
    assert.equal(record.holdRemaining, 3);
    assert.equal(engine.findQueueMatch(), null);
    assert.equal(engine.deliverQueueBox(0, 'bear-order'), false);
    assert.equal(engine.startDragWrappedBox(0), false);
    assert.equal(engine.gameState, 'PLAYING');
    engine.advanceClock(3);
    assert.equal(record.holdRemaining, 0);
    assert.equal(engine.timeRemainingSeconds, 120);
    assert.ok(engine.findQueueMatch());
    assert.equal(engine.deliverQueueBox(0, 'bear-order'), true);
    assert.equal(engine.gameState, 'PLAYING');
    engine.completeTrayExit('bear-order');
    assert.equal(engine.gameState, 'WON');
});

test('connector capacity is atomic and a requested ready pair queues together', () => {
    const blocked = new GameEngine();
    blocked.startLevel(createBlockerLevel('connector'));
    blocked.onBoxWrapped = () => {};
    assert.equal(blocked.moveItem(1, 0, 0), true);
    assert.equal(blocked.moveBoxToQueue(0), false);
    blocked.maxQueueSize = 1;
    assert.equal(blocked.moveItem(3, 0, 2), true);
    assert.equal(blocked.queue.length, 0);
    assert.equal(blocked.boxes.filter(box => box.isWrapped).length, 2);
    assert.equal(blocked.startDragWrappedBox(0), false);
    assert.equal(blocked.startDragWrappedBox(2), false);

    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('connector'));
    engine.onBoxWrapped = () => {};
    engine.onTrayDelivered = () => {};
    assert.equal(engine.addExtraTray(), true);
    assert.equal(engine.maxQueueSize, 6);
    assert.equal(engine.moveItem(1, 0, 0), true);
    const stale = engine.getBox(0);
    assert.equal(engine.moveBoxToQueue(0), false);
    assert.equal(engine.moveItem(3, 0, 2), true);
    assert.deepEqual(engine.queue.map(box => box.id).sort(), [0, 2]);
    assert.equal(engine.moveBoxToQueue(stale), false);
    assert.equal(engine.moveBoxToQueue(0), false);
    assert.equal(engine.deliverQueueBox(0, 'bear-order'), true);
    assert.equal(engine.deliverQueueBox(2, 'duck-order'), true);
    assert.equal(engine.blockerState.shipped.size, 2);
    engine.completeTrayExit('bear-order');
    engine.completeTrayExit('duck-order');
    assert.equal(engine.gameState, 'WON');
});

test('hidden box is inert until front and hidden item tokens follow slots', () => {
    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('hidden-box'));
    assert.equal(engine.getBlockerView(2).concealed, true);
    assert.equal(engine.moveItem(2, 0, 3), false);
    assert.equal(engine.moveItem(3, 0, 2), false);
    assert.equal(engine.moveBoxToQueue(2), false);
    assert.equal(engine.moveItem(1, 0, 0), true);
    assert.equal(engine.blockerState.records.get(2).revealed, true);
    assert.equal(engine.getBlockerView(2).concealed, false);
    assert.equal(engine.moveItem(3, 0, 2), true);
    drain(engine);
    assert.equal(engine.gameState, 'WON');

    const level = createBlockerLevel('hidden-item');
    level.boxes = [{ items: ['bear'] }, { items: ['bear'] }, { items: ['bear'] }, { items: ['duck', 'duck'] }, { items: ['duck'] }];
    level.layout = { columns: [[0], [1], [2], [3], [4]], visibleRows: 4 };
    assert.equal(validateBlockerLevel(level), true);
    const moved = new GameEngine();
    moved.startLevel(level);
    assert.equal(moved.moveItem(1, 0, 2, 2), true);
    const token = moved.blockerState.hiddenTokens[0];
    assert.equal(token.boxId, 2);
    assert.equal(token.slot, 2);
    assert.equal(moved.getBlockerView(2).hiddenSlots.includes(2), true);
    assert.equal(moved.getBlockerView(1).hiddenSlots.length, 0);
    assert.ok(!moved.getBox(1));
});

test('urgent expiry is chronological and retry starts fresh', () => {
    const early = new GameEngine();
    early.startLevel(createBlockerLevel('urgent'));
    early.startClock();
    assert.equal(early.moveItem(1, 0, 0), true);
    early.advanceClock(31);
    assert.notEqual(early.gameState, 'LOST');
    assert.equal(early.blockerState.records.get(0).completed, true);

    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('urgent'));
    engine.startClock();
    engine.advanceClock(30);
    assert.equal(engine.gameState, 'LOST');
    assert.equal(engine.loseReason, 'An urgent box expired before entering the staging queue.');
    const terminal = snapshot(engine);
    engine.advanceClock(5);
    assert.equal(snapshot(engine), terminal);
    engine.startLevel(createBlockerLevel('urgent'));
    assert.equal(engine.gameState, 'PLAYING');
    assert.equal(engine.blockerState.localTime, 0);
    assert.equal(engine.blockerState.shipped.size, 0);
    assert.equal(engine.queue.length, 0);
    assert.equal(engine.blockerState.records.get(0).activated, false);
    assert.equal(engine.timeRemainingSeconds, 120);
});

test('invalid blocker contracts throw without replacing active engine state', () => {
    const invalid = [
        ['locked', level => { level.blockers[0].boxId = 99; }],
        ['locked-named', level => { level.blockers.push({ id: 'cycle', type: 'locked', boxId: 0, dependsOnBoxId: 2 }); }],
        ['locked', level => { level.blockers[0].shipCount = 1.5; }],
        ['urgent', level => { level.blockers[0].duration = NaN; }],
        ['locked', level => { level.boxes[1].items = ['duck']; }],
        ['hidden-item', level => { level.blockers.push({ id: 'duplicate-hidden', type: 'hidden-item', boxId: 0, slot: 0 }); }]
    ];
    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('locked'));
    const before = snapshot(engine);
    for (const [id, mutate] of invalid) {
        const level = createBlockerLevel(id);
        mutate(level);
        assert.throws(() => validateBlockerLevel(level), /Invalid blocker level/);
        assert.throws(() => engine.startLevel(level), /Invalid blocker level/);
        assert.equal(snapshot(engine), before);
    }
});

test('booster restrictions, normal levels, and nested public fixtures', () => {
    const engine = new GameEngine();
    engine.startLevel(createBlockerLevel('locked'));
    engine.startClock();
    const before = snapshot(engine);
    assert.equal(engine.shuffleItems(), false);
    assert.equal(engine.removeTray(), false);
    assert.equal(snapshot(engine), before);
    engine.freezeRemainingSeconds = 30;
    engine.advanceClock(1);
    assert.equal(engine.timeRemainingSeconds, 120);
    assert.equal(engine.addExtraTray(), true);

    const normal = createBlockerLevel('locked');
    delete normal.blockers;
    const plain = new GameEngine();
    plain.startLevel(normal);
    assert.equal(plain.blockerState.enabled, false);
    assert.equal(plain.moveItem(1, 0, 0), true);
    assert.equal(plain.moveItem(3, 0, 2), true);
    drain(plain);
    plain.checkConditions();
    assert.equal(plain.gameState, 'WON');

    const locked = createBlockerLevel('locked');
    locked.blockers = [{ id: 'nested-lock', boxId: 2, locked: { shipCount: 1 } }];
    const connector = createBlockerLevel('connector');
    connector.blockers = [{ boxId: 0, connector: { group: 'A' } }, { boxId: 2, connector: { groupId: 'A' } }];
    for (const level of [locked, connector]) {
        assert.equal(validateBlockerLevel(level), true);
        const replay = replayBlockerLevel(GameEngine, level);
        assert.equal(replay.solved, true, replay.failure);
    }
});

console.log(`${passed} blocker test groups executed.`);
