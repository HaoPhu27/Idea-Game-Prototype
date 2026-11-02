import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

const source = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const classSource = source.slice(source.indexOf('class UIManager {'), source.indexOf('// Bootstrap'));
const timers = [];
const UI = vm.runInNewContext(`(${classSource})`, {
    performance: { now: () => 1000 },
    setTimeout: fn => { timers.push(fn); },
});
const engine = new GameEngine();
engine.startLevel({
    boxes: [{ items: ['penguin', 'penguin', 'penguin'] }],
    trays: [{ id: 'old-order', targetItemId: 'penguin' }],
});
const stateChanges = [];
engine.onGameStateChanged = state => stateChanges.push(state);
const ui = Object.create(UI.prototype);
let resetCalls = 0;
Object.assign(ui, {
    engine, _animationEpoch: 10,
    _resetAnimationState() { this._animationEpoch++; resetCalls++; },
    overlayWin: { classList: { add() {} } },
    overlayLose: { classList: { add() {} } },
    overlayLoading: { classList: { remove() {} } },
});

// Leave the loading timeout unresolved, exactly the vulnerable browser interval.
const pendingReset = ui.startNewLevel(true);
assert.ok(pendingReset && typeof pendingReset.then === 'function');
assert.equal(timers.length, 1, 'reset is waiting to paint its loading overlay');
assert.equal(resetCalls, 1);
assert.equal(ui._animationEpoch, 11, 'old animation callbacks are invalidated before the await');
assert.equal(engine.gameState, 'IDLE', 'the old level must stop immediately before yielding');
assert.deepEqual(stateChanges, ['IDLE']);
assert.equal(engine.queue.length, 1, 'old goods remain present until the new level is generated');

// Any conveyor tick during the await must return before touching the old queue.
ui._drainQueueFlights = () => { throw new Error('old queue was processed while loading'); };
ui.triggerQueueDelivery = () => { throw new Error('old delivery acquired the new epoch'); };
ui.checkQueuePickup(1001);
assert.equal(engine.queue.length, 1);
assert.equal(engine.startClock(), false, 'player input cannot start old gameplay during loading');
assert.equal(engine.selectSource(0, 0), false);
console.log('Level reset race: loading freezes old gameplay before yielding and invalidates callbacks');
