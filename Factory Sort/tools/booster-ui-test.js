import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { QueueRenderer } from '../ab_test/src/ui/QueueRenderer.js';

const source = readFileSync(new URL('../ab_test/src/ui/UIManager.js', import.meta.url), 'utf8');
const classSource = source.slice(source.indexOf('class UIManager {'), source.indexOf('// Bootstrap'));
const classList = () => ({ add() {}, remove() {}, toggle() {} });
const events = new Map();
const trayElement = { dataset: { trayId: 'tray' } };
const node = () => ({ addEventListener(type, fn) { events.set(`${this.id || 'node'}:${type}`, fn); }, classList: classList() });
const trayContainer = Object.assign(node(), { id: 'trays' });
const document = {
    hidden: false,
    getElementById: id => id === 'trays-container' ? trayContainer : null,
    querySelectorAll: () => [],
    addEventListener(type, fn) { events.set(`document:${type}`, fn); },
    removeEventListener() {},
};
const UI = vm.runInNewContext(`(${classSource})`, { document, performance: { now: () => 1000 } });
const ui = Object.create(UI.prototype);
let boostCalls = 0;
let clockSyncs = 0;
let status = '';
const tray = { id: 'tray', isFull: () => false };
Object.assign(ui, {
    engine: {
        gameState: 'PLAYING', draggedBoxId: null, timeRemainingSeconds: 40,
        hasPendingTrayExits: () => false, deselectSource() {},
        conveyor: { getAllActiveTrays: () => [tray] },
        freezeTime() { boostCalls++; return true; },
        shuffleItems() { this.lastBoosterError = 'Không tìm thấy lời giải được chứng minh.'; return false; },
        removeTray() { boostCalls++; return true; },
    },
    itemDragState: { isDragging: false }, dragState: { isDragging: false },
    tutorialManager: { active: false }, _busyBoxes: new Set(), _pendingQueueBoxes: [],
    audio: { tap() {} }, isClockPaused: () => false,
    updateLevelClock() { clockSyncs++; }, updateRender() {}, renderTimer() {}, renderBoosters() {},
    setBoosterStatus(message) { status = message; },
});

// Every mutable transaction window must reject booster execution.
for (const field of ['_queueFlightActive', '_deliveryAnimating']) {
    ui[field] = true;
    ui.useBooster('freeze');
    ui[field] = false;
}
ui._busyBoxes.add('box'); ui.useBooster('freeze'); ui._busyBoxes.clear();
ui._pendingQueueBoxes.push({}); ui.useBooster('freeze'); ui._pendingQueueBoxes.length = 0;
ui.itemDragState.isDragging = true; ui.useBooster('freeze'); ui.itemDragState.isDragging = false;
ui.dragState.isDragging = true; ui.useBooster('freeze'); ui.dragState.isDragging = false;
ui.tutorialManager.active = true; ui.useBooster('freeze'); ui.tutorialManager.active = false;
assert.equal(boostCalls, 0, 'busy or tutorial state cannot execute a booster');
ui.useBooster('freeze');
assert.equal(boostCalls, 1);
assert.ok(clockSyncs > 0, 'trigger settles the clock before applying a boost');
ui.useBooster('shuffle');
assert.equal(status, ui.engine.lastBoosterError, 'solver rejection has a concrete explanation');
ui.useBooster('remove');
assert.equal(ui.removeTrayMode, true);
ui.useBooster('remove');
assert.equal(ui.removeTrayMode, false, 'same button cancels targeting without consuming booster');
assert.equal(boostCalls, 1);

// Bind real keyboard handlers using inert navigation buttons.
for (const name of ['btnNewGame', 'btnCloseLevelSelect', 'btnNextLevel', 'btnRetry']) ui[name] = node();
ui.bindEvents();
const keyEvent = key => ({ type: 'keydown', key, target: { closest: () => trayElement }, preventDefault() {} });
ui.removeTrayMode = true;
events.get('trays:keydown')(keyEvent('ArrowRight'));
assert.equal(boostCalls, 1, 'navigation key must not remove a tray');
events.get('trays:keydown')(keyEvent('Enter'));
assert.equal(boostCalls, 2, 'Enter selects the active empty tray');
assert.equal(ui.removeTrayMode, false);
ui.removeTrayMode = true;
events.get('document:keydown')({ key: 'Escape' });
assert.equal(ui.removeTrayMode, false);
ui.removeTrayMode = true;
ui.updateLevelClock = () => { ui.engine.gameState = 'LOST'; };
events.get('trays:keydown')(keyEvent(' '));
assert.equal(boostCalls, 2, 'deadline reached between ticks rejects removal before mutation');

// Queue renderer adds a sixth slot and restores five on the next level.
const slotsContainer = {
    children: [], appendChild(slot) { slot.remove = () => this.children.splice(this.children.indexOf(slot), 1); this.children.push(slot); },
    get lastElementChild() { return this.children.at(-1); },
    querySelectorAll() { return this.children; },
};
globalThis.document = { createElement: () => ({ dataset: {}, classList: classList(), style: { removeProperty() {} } }) };
const renderer = Object.create(QueueRenderer.prototype);
Object.assign(renderer, { slotsContainer, maxSlots: 5 });
renderer.render([], 6);
assert.equal(slotsContainer.children.length, 6);
assert.equal(renderer.maxSlots, 6);
renderer.render([], 5);
assert.equal(slotsContainer.children.length, 5, 'level reset removes the temporary extra slot');
assert.equal(renderer.maxSlots, 5);
console.log('Booster UI guards, clock ordering, keyboard selection, cancellation and capacity reset passed');
