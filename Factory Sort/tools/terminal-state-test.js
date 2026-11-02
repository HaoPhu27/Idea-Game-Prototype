import assert from 'node:assert/strict';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';

function level(boxItems, trayItems, maxActiveTrays = trayItems.length) {
    const engine = new GameEngine();
    const states = [];
    const exits = [];
    engine.onTrayDelivered = () => {}; // Browser mode: OUT animation finishes later.
    engine.onGameStateChanged = state => states.push(state);
    engine.onTrayExited = id => exits.push(id);
    engine.startLevel({
        boxes: boxItems.map(items => ({ items })),
        trays: trayItems.map((targetItemId, id) => ({ id, targetItemId })),
        maxActiveTrays,
    });
    return { engine, states, exits };
}
const packed = item => [item, item, item];

for (const order of [[0, 1, 2], [2, 1, 0], [1, 0, 2]]) {
    const { engine, states, exits } = level(
        ['penguin', 'bear', 'penguin'].map(packed), ['penguin', 'bear', 'penguin']);
    for (let id = 0; id < 3; id++) assert.equal(engine.deliverQueueBox(id, id), true);
    assert.equal(engine.queue.length, 0);
    engine.checkConditions();
    assert.equal(engine.gameState, 'PLAYING', 'delivery animation cannot count as a deadlock');
    assert.equal(engine.hasPendingTrayExits(), true);
    for (let i = 0; i < order.length; i++) {
        engine.completeTrayExit(order[i]);
        engine.checkConditions();
        assert.equal(engine.gameState, i === order.length - 1 ? 'WON' : 'PLAYING',
            'all staggered exit orders must win only after the last OUT callback');
    }
    assert.deepEqual(states, ['PLAYING', 'WON']);
    assert.equal(engine.hasPendingTrayExits(), false);
    const before = exits.length;
    engine.completeTrayExit(order[0]);
    assert.equal(exits.length, before, 'duplicate OUT callback must not fire exit events again');
    assert.deepEqual(states, ['PLAYING', 'WON']);
}

{
    const { engine } = level(['penguin', 'bear'].map(packed), ['penguin', 'bear'], 1);
    assert.equal(engine.deliverQueueBox(0, 0), true);
    engine.checkConditions();
    assert.equal(engine.gameState, 'PLAYING', 'hidden matching order will become active after OUT');
    assert.equal(engine.findQueueMatch(), null);
    engine.completeTrayExit(0);
    assert.equal(engine.gameState, 'PLAYING');
    assert.equal(engine.findQueueMatch().box.id, 1);
    assert.equal(engine.deliverQueueBox(1, 1), true);
    engine.checkConditions();
    assert.equal(engine.gameState, 'PLAYING');
    engine.completeTrayExit(1);
    assert.equal(engine.gameState, 'WON');
}

{
    const { engine } = level([packed('penguin'), ['a', 'b', 'c']], ['penguin', 'bear'], 1);
    engine.deliverQueueBox(0, 0);
    engine.checkConditions();
    assert.equal(engine.gameState, 'PLAYING', 'defer deadlock while an order still exits');
    engine.completeTrayExit(0);
    assert.equal(engine.gameState, 'LOST', 'a genuine blocked board must still lose once exits finish');
}

{
    const { engine } = level(Array.from({ length: 6 }, () => packed('penguin')),
        Array.from({ length: 6 }, () => 'penguin'));
    engine.deliverQueueBox(0, 0);
    // Keep an actual outgoing delivery while the queue is invalidly over capacity.
    engine.queue.push(engine.conveyor.allTrays[0].slot);
    engine.checkConditions();
    assert.equal(engine.gameState, 'LOST', 'pending exits must not hide a real queue overflow');
}

{
    const { engine } = level([packed('penguin')], ['penguin']);
    engine.checkConditions();
    assert.equal(engine.gameState, 'PLAYING', 'queued goods are not delivered yet');
    const undelivered = engine.queue.pop();
    engine.boxes.push(undelivered);
    engine.columns[0].push(undelivered.id);
    engine.checkConditions();
    assert.notEqual(engine.gameState, 'WON', 'goods still on the board prevent a win');
}

console.log('Terminal states: staggered OUT, backlog, duplicate callbacks, genuine deadlock and overflow passed');
