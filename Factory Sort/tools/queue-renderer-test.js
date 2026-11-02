import assert from 'node:assert/strict';
import { QueueRenderer } from '../ab_test/src/ui/QueueRenderer.js';
import { getItemEmoji } from '../ab_test/src/data/ItemCatalog.js';

// Reproduce the actual queue transition: delivery hides A, then B reuses A's slot.
const icon = { textContent: '' };
const boxEl = {
    dataset: { boxId: 'A' },
    style: { opacity: '0', setProperty() {} },
    querySelector: () => icon,
};
const slot = {
    dataset: {}, classList: { add() {}, remove() {} },
    style: { setProperty() {}, removeProperty() {} },
    querySelector: () => boxEl,
};
const renderer = Object.create(QueueRenderer.prototype);
renderer.slotsContainer = { querySelectorAll: () => [slot] };
const box = (id, item) => ({ id, items: [item], getCategory: () => null, getItemType: () => item });
renderer.render([box('A', 'bear')]);
assert.equal(boxEl.style.opacity, '0', 'rerender during flight must preserve hiding');
renderer.render([box('B', 'duck')]);
assert.equal(slot.dataset.boxId, 'B');
assert.equal(boxEl.style.opacity, '', 'replacement box must be visible');
assert.equal(boxEl.dataset.boxId, 'B');
assert.equal(icon.textContent, getItemEmoji('duck'));
console.log('Queue renderer delivery regression passed');


// Run the real animation callback and engine transaction with adjacent identical boxes.
const { GameEngine } = await import('../ab_test/src/core/GameEngine.js');
const { Tray } = await import('../ab_test/src/core/Tray.js');
const frames = [];
const ghosts = [];
const rect = { left: 0, top: 0, width: 100, height: 50 };
globalThis.requestAnimationFrame = callback => frames.push(callback);
globalThis.document = {
    createElement() {
        const ghost = { style: { setProperty() {} }, remove() { this.removed = true; } };
        ghosts.push(ghost);
        return ghost;
    },
    body: { appendChild() {} },
};
slot.getBoundingClientRect = () => rect;
const trayEl = { style: {}, getBoundingClientRect: () => rect, animate() {} };
const engine = new GameEngine();
const first = box('same-A', 'penguin');
const second = box('same-B', 'penguin');
first.isWrapped = second.isWrapped = true;
const trayA = new Tray('tray-A', 'stuffed_animals', 'penguin');
const trayB = new Tray('tray-B', 'stuffed_animals', 'penguin');
engine.queue = [first, second];
engine.conveyor = { getAllActiveTrays: () => [trayA, trayB] };
engine.onQueueUpdated = queue => renderer.render(queue);
engine.onTrayDelivered = () => {};
renderer.render(engine.queue);
renderer.animateBoxToTray(first, slot, trayEl, () => {
    assert.equal(engine.deliverQueueBox(first.id, trayA.id), true);
});
assert.equal(boxEl.style.opacity, '0');
renderer.render(engine.queue); // Unrelated render while flight is in progress.
assert.equal(boxEl.style.opacity, '0');
frames.shift()(performance.now() + 300);
assert.deepEqual(engine.queue.map(b => b.id), ['same-B']);
assert.equal(trayA.slot, first);
assert.equal(trayB.slot, null, 'one pickup must not consume the adjacent identical box');
assert.equal(boxEl.style.opacity, '', 'the remaining identical box must be visible');
assert.equal(slot.dataset.boxId, second.id);
assert.equal(engine.deliverQueueBox(second.id, trayA.id), false, 'filled tray rejects a second box');
assert.equal(engine.queue.length, 1);
renderer.animateBoxToTray(second, slot, trayEl, () => {
    assert.equal(engine.deliverQueueBox(second.id, trayB.id), true);
});
frames.shift()(performance.now() + 300);
assert.equal(engine.queue.length, 0);
assert.equal(trayB.slot, second);
assert.equal(slot.innerHTML, '', 'delivered box must no longer be drawn');
assert.ok(ghosts.every(ghost => ghost.removed), 'no flying box may remain after delivery');
console.log('Adjacent identical boxes: animation, queue identity, single-tray capacity and cleanup passed');
