import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

const config = timeToPlay => ({
    boxes: [{ items: ['penguin', 'penguin'] }, { items: ['penguin'] }],
    trays: [{ id: 'order', targetItemId: 'penguin', matchMode: 'itemType' }],
    rules: { timeToPlay },
});
function create(timeToPlay) {
    const engine = new GameEngine();
    const states = [];
    engine.onGameStateChanged = state => states.push(state);
    engine.startLevel(config(arguments.length ? timeToPlay : 10));
    return { engine, states };
}

{
    const { engine } = create();
    engine.advanceClock(500);
    assert.equal(engine.timeRemainingSeconds, 10, 'reading the untouched board is free');
    assert.equal(engine.elapsedPlaySeconds, 0);
    assert.equal(engine.selectSource(123, 0), false);
    assert.equal(engine.clockStarted, false, 'invalid pickup cannot start the timer');
    assert.equal(engine.selectSource(1, 0), true);
    assert.equal(engine.clockStarted, true, 'first valid pickup starts active play');
    engine.advanceClock(1.25);
    assert.equal(engine.timeRemainingSeconds, 8.75);
    assert.equal(engine.elapsedPlaySeconds, 1.25, 'fractional real seconds are charged');
    for (const value of [-1, 0, NaN, Infinity, undefined]) engine.advanceClock(value);
    assert.equal(engine.timeRemainingSeconds, 8.75, 'invalid deltas cannot add time or drain the timer');
}

{
    const { engine, states } = create(2);
    engine.startClock();
    engine.advanceClock(2.5);
    assert.equal(engine.gameState, 'LOST');
    assert.equal(engine.timeRemainingSeconds, 0);
    assert.match(engine.loseReason, /Hết thời gian/);
    assert.equal(engine.elapsedPlaySeconds, 2, 'deadline clamps charged seconds');
    engine.advanceClock(100);
    assert.deepEqual(states, ['PLAYING', 'LOST'], 'timeout fires once');
    engine.startLevel(config(2));
    assert.equal(engine.gameState, 'PLAYING');
    assert.equal(engine.clockStarted, false);
    assert.equal(engine.timeRemainingSeconds, 2);
    assert.equal(engine.elapsedPlaySeconds, 0);
    assert.equal(engine.loseReason, '', 'retry clears old failure reason');
}

for (const limit of [null, undefined, 0, -2, NaN, Infinity]) {
    const { engine } = create(limit);
    engine.startClock();
    engine.advanceClock(500);
    assert.equal(engine.timeLimitSeconds, null, 'nonpositive/nonfinite or absent limit is untimed');
    assert.equal(engine.timeRemainingSeconds, null);
    assert.equal(engine.gameState, 'PLAYING');
    assert.equal(engine.elapsedPlaySeconds, 500, 'untimed levels still record active elapsed time');
}

{
    const { engine, states } = create(0.1);
    engine.onBoxWrapped = () => {}; // Browser packaging delay.
    engine.onTrayDelivered = () => {}; // Browser OUT delay.
    engine.selectSource(1, 0);
    engine.advanceClock(0.05);
    assert.equal(engine.selectTarget(0), true);
    assert.equal(engine.hasPlayerWorkRemaining(), false);
    engine.advanceClock(1000);
    assert.equal(engine.timeRemainingSeconds, 0.05, 'packaging-only completion cannot time out');
    engine.moveBoxToQueue(engine.getBox(0));
    engine.advanceClock(1000);
    assert.equal(engine.gameState, 'PLAYING', 'last box waiting for tray remains safe');
    assert.equal(engine.deliverQueueBox(0, 'order'), true);
    engine.advanceClock(1000);
    assert.equal(engine.gameState, 'PLAYING', 'last OUT animation cannot time out');
    engine.completeTrayExit('order');
    assert.equal(engine.gameState, 'WON');
    engine.advanceClock(1000);
    assert.deepEqual(states, ['PLAYING', 'WON']);
    assert.equal(engine.elapsedPlaySeconds, 0.05);
}

// Exercise actual pause/time-delta UI methods without constructing DOM renderers.
const source = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const classSource = source.slice(source.indexOf('class UIManager {'), source.indexOf('// Bootstrap'));
const overlays = new Map();
const document = { hidden: false, getElementById: id => overlays.get(id) || null };
const UI = vm.runInNewContext(`(${classSource})`, { document, performance: { now: () => 0 } });
{
    const { engine } = create(100);
    const ui = Object.create(UI.prototype);
    Object.assign(ui, { engine, renderTimer() {}, _clockLastTime: 0, _clockWasPaused: false, _clockObservedStarted: false });
    ui.updateLevelClock(1000);
    assert.equal(engine.elapsedPlaySeconds, 0);
    engine.startClock();
    ui.updateLevelClock(2000); // First observed start establishes a baseline.
    ui.updateLevelClock(3500);
    assert.equal(engine.elapsedPlaySeconds, 1.5);
    document.hidden = true;
    ui.updateLevelClock(100000);
    document.hidden = false;
    ui.updateLevelClock(200000);
    assert.equal(engine.elapsedPlaySeconds, 1.5, 'background/resume interval is never backcharged');
    ui.updateLevelClock(201000);
    assert.equal(engine.elapsedPlaySeconds, 2.5);
    for (const id of ['overlay-loading', 'overlay-help', 'overlay-level-select']) {
        overlays.set(id, { classList: { contains: () => false } });
        ui.updateLevelClock(300000);
        overlays.clear();
        ui.updateLevelClock(400000);
        assert.equal(engine.elapsedPlaySeconds, 2.5, `${id}: pause/resume does not drain time`);
    }
    ui.updateLevelClock(420000);
    assert.equal(engine.elapsedPlaySeconds, 22.5, 'a slow visible frame charges actual seconds, not a fixed frame duration');
}

console.log('Difficulty timer: first interaction, deterministic seconds, timeout, retry, untimed, final delivery and UI pauses passed');
