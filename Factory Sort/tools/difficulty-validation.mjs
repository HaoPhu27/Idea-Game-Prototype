import assert from 'node:assert/strict';
import { LevelGenerator } from '../ab_test/src/generator/LevelGenerator.js';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

// Real engine integration, including column visibility and exact item matching.
// This is separate from bot calibration: a difficult level must still be solvable.
const report = [];

// Browser-mode integration: accepting a box and exiting OUT are separate events.
// Advance those events explicitly instead of relying on the headless shortcut.
function replayWithDelayedExits(level, L) {
    const engine = new GameEngine();
    const wrapped = [], outgoing = [], states = [];
    engine.onBoxWrapped = box => wrapped.push(box);
    engine.onTrayDelivered = trayId => outgoing.push(trayId);
    engine.onGameStateChanged = state => states.push(state);
    engine.startLevel(level);
    let maxQueue = engine.queue.length;
    let deliveryCount = 0;
    const settle = () => {
        for (let guard = 0; guard < level.trays.length * 3 + 10; guard++) {
            const match = engine.findQueueMatch();
            if (match) {
                assert.equal(engine.deliverQueueBox(match.box.id, match.tray.id), true, `L${L}: delayed-mode delivery`);
                deliveryCount++;
                engine.checkConditions();
                assert.notEqual(engine.gameState, 'LOST', `L${L}: accepted goods awaiting OUT are progress`);
                continue;
            }
            if (outgoing.length) {
                // LIFO makes the test differ from the reference tray-order list.
                engine.completeTrayExit(outgoing.pop());
                assert.notEqual(engine.gameState, 'LOST', `L${L}: staggered OUT must not create a false loss`);
                continue;
            }
            return;
        }
        assert.fail(`L${L}: delayed delivery loop did not settle`);
    };
    settle();
    for (const [index, move] of level.referenceSolution.entries()) {
        assert.equal(engine.gameState, 'PLAYING', `L${L} delayed step${index}: route not terminal`);
        assert.ok(engine.isAccessible(move.from) && engine.isAccessible(move.to), `L${L}: delayed-mode visibility`);
        const slot = engine.getBox(move.from).slots.findIndex(item => item === move.itemId);
        assert.ok(slot >= 0, `L${L}: delayed-mode source item exists`);
        assert.equal(engine.selectSource(move.from, slot), true);
        if (level.rules.timerBudget) engine.advanceClock(level.rules.timerBudget.actionSecondsPerMove);
        assert.equal(engine.selectTarget(move.to), true);
        for (const box of wrapped.splice(0)) {
            assert.equal(engine.moveBoxToQueue(box), true, `L${L}: packed box enters physical staging queue`);
            maxQueue = Math.max(maxQueue, engine.queue.length);
            assert.ok(maxQueue <= engine.maxQueueSize, `L${L}: delayed-mode queue never overflows`);
        }
        settle();
        assert.notEqual(engine.gameState, 'LOST', `L${L}: legal delayed route remains solvable`);
    }
    settle();
    assert.equal(engine.gameState, 'WON', `L${L}: delayed OUT route wins`);
    assert.deepEqual(states, ['PLAYING', 'WON'], `L${L}: delayed route has exactly one win and no false loss`);
    assert.equal(deliveryCount, level.trays.length, `L${L}: every order receives exactly one box`);
    assert.equal(engine.queue.length, 0);
    assert.equal(engine.conveyor.allTrays.length, 0);
    return { maxQueue, deliveryCount, moves: engine.moveCount };
}
for (let L = 1; L <= 50; L++) {
    const level = LevelGenerator.generateLevel({ levelNumber: L });
    const repeat = LevelGenerator.generateLevel({ levelNumber: L });
    assert.deepEqual(level, repeat, `L${L}: deterministic generation`);
    assert.ok(level.solvable, `L${L}: constructive proof retained`);
    assert.equal(level.rules.moveLimit, null, `L${L}: no advertised inactive move limit`);
    assert.ok(level.trays.every(t => t.matchMode === 'itemType'), `L${L}: exact emoji matching`);
    const tier = level.config.tier;
    if (L <= 10) assert.equal(level.rules.timeToPlay, null, `L${L}: untimed introduction`);
    else {
        assert.ok(Number.isFinite(level.rules.timeToPlay) && level.rules.timeToPlay > 0, `L${L}: finite timer`);
        const budget = level.rules.timerBudget;
        assert.ok(budget && budget.actionSecondsPerMove > 0, `L${L}: explainable timer budget`);
        assert.equal(budget.totalSeconds, level.rules.timeToPlay, `L${L}: timer metadata matches enforced budget`);
        assert.ok(level.rules.timeToPlay >= level.referenceSolution.length * budget.actionSecondsPerMove,
            `L${L}: reference action allowance fits budget`);
    }
    if (tier === 'normal') {
        assert.equal(level.maxActiveTrays, 4);
        assert.ok(level.rules.timerBudget.actionSecondsPerMove >= 6);
    } else if (tier === 'hard') {
        assert.equal(level.maxActiveTrays, 3);
        assert.ok(level.rules.timerBudget.actionSecondsPerMove >= 3.8 && level.rules.timerBudget.actionSecondsPerMove <= 4.2);
    } else if (tier === 'superhard') {
        assert.equal(level.maxActiveTrays, 3);
        assert.ok(level.rules.timerBudget.actionSecondsPerMove >= 2.7 && level.rules.timerBudget.actionSecondsPerMove <= 3);
    }
    const engine = new GameEngine();
    const states = [];
    engine.onGameStateChanged = state => states.push(state);
    engine.startLevel(level);
    let maxQueue = engine.queue.length;
    for (const [index, move] of level.referenceSolution.entries()) {
        assert.equal(engine.gameState, 'PLAYING', `L${L} step${index}: no early terminal state`);
        assert.ok(engine.isAccessible(move.from) && engine.isAccessible(move.to), `L${L}: no hidden-box shortcut`);
        // Reference indices use compact arrays; Box keeps fixed visual holes.
        const slot = engine.getBox(move.from).slots.findIndex(item => item === move.itemId);
        assert.ok(slot >= 0, `L${L}: reference source contains the correct item`);
        assert.equal(engine.selectSource(move.from, slot), true, `L${L}: legal pick`);
        if (L > 10) engine.advanceClock(level.rules.timerBudget.actionSecondsPerMove);
        assert.equal(engine.selectTarget(move.to), true, `L${L}: legal placement`);
        assert.notEqual(engine.gameState, 'LOST', `L${L}: reference route stays winnable (${engine.loseReason})`);
        maxQueue = Math.max(maxQueue, engine.queue.length);
        assert.ok(maxQueue <= engine.maxQueueSize, `L${L}: queue capacity preserved`);
    }
    assert.equal(engine.gameState, 'WON', `L${L}: real engine reference route wins`);
    assert.deepEqual(states, ['PLAYING', 'WON'], `L${L}: no false loss before win`);
    const delayed = replayWithDelayedExits(level, L);
    report.push({ level: L, tier, moves: engine.moveCount, maxQueue, delayed, timeToPlay: level.rules.timeToPlay });
}
console.log(JSON.stringify({ validatedLevels: report.length, report }, null, 2));
