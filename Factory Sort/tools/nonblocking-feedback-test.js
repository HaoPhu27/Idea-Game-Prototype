import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Instantiate the real UI prototype without starting a browser or level generator.
const source = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const classSource = source.slice(source.indexOf('class UIManager {'), source.indexOf('// Bootstrap'));
const timers = [];
const classes = () => ({ add() {}, remove() {}, contains: () => false });
const ghost = { style: {}, classList: classes() };
const document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => ghost,
    body: { classList: classes(), appendChild() {} },
};
const UI = vm.runInNewContext(`(${classSource})`, {
    document, navigator: {}, performance: { now: () => 1000 },
    setTimeout: fn => { timers.push(fn); }, requestAnimationFrame: fn => fn(),
    getItemEmoji: item => item, getCategoryConfig: () => null,
});

function harness() {
    const ui = Object.create(UI.prototype);
    const calls = [];
    const boxes = new Map(['A', 'B', 'C', 'D'].map(id => [id, {
        id, isWrapped: false, slots: ['penguin'], items: ['penguin'],
    }]));
    Object.assign(ui, {
        _busyBoxes: new Set(['A', 'B']), _deliveryAnimating: true,
        _queueFlightActive: true, _pendingQueueBoxes: [], _animationEpoch: 1,
        dragState: { isDragging: false }, itemDragState: { isDragging: false },
        tutorialManager: { active: false },
        engine: {
            gameState: 'PLAYING', selectedSource: null,
            startClock: () => false,
            hasPendingTrayExits: () => false,
            getBox: id => boxes.get(String(id)), isAccessible: () => true,
            selectSource(id) { calls.push(['select', id]); return true; },
            selectTarget(id) { calls.push(['place', id]); return false; },
            deselectSource() {},
        },
        audio: { tap() {}, reject() {} }, updateRender() { calls.push(['render']); },
    });
    return { ui, calls, boxes };
}

{
    const { ui, calls } = harness();
    ui.handleSlotTap('A', 0);
    assert.equal(calls.length, 0, 'a box being animated cannot be selected');
    ui.handleSlotTap('C', 0);
    assert.ok(calls.some(c => c[0] === 'select' && c[1] === 'C'),
        'other boxes remain selectable while packing and conveyor delivery run');
    calls.length = 0;
    ui.engine.selectedSource = { boxId: 'C' };
    ui.handleSlotTap('B', null);
    assert.equal(calls.length, 0, 'a box being packed cannot receive another item');
    ui.engine.selectedSource = { boxId: 'A' };
    ui.handleSlotTap('D', null);
    assert.equal(calls.length, 0, 'a busy source cannot be transferred through an idle target');
}

{
    const { ui } = harness();
    const slot = { classList: classes() };
    ui.handleItemDragStart('A', 0, slot);
    assert.equal(ui.itemDragState.isDragging, false, 'busy box cannot start an item drag');
    ui.handleItemDragStart('C', 0, slot);
    assert.equal(ui.itemDragState.isDragging, true, 'unrelated item can be dragged during background animations');
    assert.equal(ui.itemDragState.sourceBoxId, 'C');
}

{
    const { ui, calls } = harness();
    const oldEpoch = ui._animationEpoch;
    ui._resetAnimationState();
    assert.ok(ui._animationEpoch > oldEpoch, 'reset invalidates callbacks from the old level');
    assert.equal(ui._busyBoxes.size, 0);
    assert.equal(ui._queueFlightActive, false);
    assert.equal(ui._deliveryAnimating, false);
    ui._finalizeMoveAfterDrag('A', 'B', false, { id: 'B', isWrapped: true }, oldEpoch);
    assert.equal(calls.length, 0, 'old transfer callback cannot update the next level');
}

{
    const { ui, boxes } = harness();
    const queue = [];
    const flights = [];
    const moved = [];
    ui._deliveryAnimating = false;
    ui._queueFlightActive = false;
    ui.engine.maxQueueSize = 5;
    ui.engine.getQueue = () => queue;
    ui.engine.conveyor = { getAllActiveTrays: () => [] };
    ui.engine.setGameState = state => { ui.engine.gameState = state; };
    ui.engine.moveBoxToQueue = box => {
        moved.push(box.id);
        queue.push(box);
        boxes.delete(box.id);
        return true;
    };
    ui.queueRenderer = {
        animateBoxToQueue(box, index, element, done) { flights.push({ box, index, done }); },
    };
    const first = boxes.get('A');
    const second = boxes.get('B');
    first.isWrapped = second.isWrapped = true;
    ui._pendingQueueBoxes = [first, second];
    ui._drainQueueFlights();
    assert.equal(flights.length, 1, 'only one box flies to the queue at a time');
    ui._drainQueueFlights();
    assert.equal(flights.length, 1, 'repeated drains cannot duplicate the active flight');
    assert.equal(flights[0].index, 0);
    flights[0].done();
    assert.equal(flights.length, 2, 'next packed box starts after the first arrives');
    assert.equal(flights[1].index, 1, 'next destination accounts for the committed queue entry');
    flights[1].done();
    assert.deepEqual(moved, ['A', 'B']);
    assert.equal(ui._queueFlightActive, false);
    assert.equal(ui._busyBoxes.size, 0);

    const third = boxes.get('C');
    third.isWrapped = true;
    ui._pendingQueueBoxes.push(third);
    ui._drainQueueFlights();
    const staleFlight = flights[2];
    ui._resetAnimationState();
    staleFlight.done();
    assert.deepEqual(moved, ['A', 'B'], 'an old flight callback cannot add a box after reset');
}

{
    const { ui, boxes } = harness();
    const queue = Array.from({ length: 5 }, (_, id) => ({ id: `queued-${id}` }));
    const pending = boxes.get('C');
    pending.isWrapped = true;
    let outgoing = true;
    const flights = [];
    ui._deliveryAnimating = false;
    ui._queueFlightActive = false;
    ui._pendingQueueBoxes = [pending];
    Object.assign(ui.engine, {
        maxQueueSize: 5,
        getQueue: () => queue,
        hasPendingTrayExits: () => outgoing,
        conveyor: { getAllActiveTrays: () => [{ canAccept: () => false }] },
        setGameState(state) { this.gameState = state; },
        moveBoxToQueue(box) { queue.push(box); boxes.delete(box.id); return true; },
    });
    ui.queueRenderer = {
        animateBoxToQueue(box, index, element, done) { flights.push({ box, index, done }); },
    };
    ui._drainQueueFlights();
    assert.equal(ui.engine.gameState, 'PLAYING', 'outgoing orders defer full-queue deadlock until backlog advances');
    assert.equal(ui._pendingQueueBoxes.length, 1, 'waiting box must remain pending');
    assert.equal(flights.length, 0, 'a full queue has no free physical destination');
    outgoing = false;
    queue.shift(); // Next order accepted a queued box after OUT exposed it.
    ui._drainQueueFlights();
    assert.equal(flights.length, 1);
    assert.equal(flights[0].index, 4);
    flights[0].done();
    assert.equal(queue.length, 5);
    assert.equal(ui.engine.gameState, 'PLAYING');
    assert.equal(ui._pendingQueueBoxes.length, 0);
}

{
    const { ui, boxes } = harness();
    ui._deliveryAnimating = false;
    ui._queueFlightActive = false;
    ui._pendingQueueBoxes = [boxes.get('C')];
    Object.assign(ui.engine, {
        maxQueueSize: 5,
        getQueue: () => Array.from({ length: 5 }, (_, id) => ({ id })),
        conveyor: { getAllActiveTrays: () => [{ canAccept: () => false }] },
        setGameState(state) { this.gameState = state; },
    });
    ui._drainQueueFlights();
    assert.equal(ui.engine.gameState, 'LOST', 'full queue without delivery or outgoing progress remains a real loss');
}

console.log('Nonblocking feedback: unrelated input, busy guards, serialized flights, pending OUT and stale callbacks passed');
