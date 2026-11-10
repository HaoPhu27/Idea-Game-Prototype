import assert from 'node:assert/strict';
import { GameEngine } from '../ab_test/src/core/GameEngine.js';
import { COMBO_SCENARIOS, createMechanicComboLevel, replayMechanicComboLevel } from '../ab_test/src/generator/MechanicComboLevels.js';
import { LevelGenerator } from '../ab_test/src/generator/LevelGenerator.js';
import { BLOCKER_SCENARIOS, createBlockerLevel } from '../ab_test/src/generator/BlockerLevels.js';

const categories = ['stuffed_animals'];
const normalLevel = () => ({ id: 'normal-reference', name: 'Normal reference', solvable: false,
    boxes: [['bear', 'bear'], ['bear'], ['duck', 'duck'], ['duck']].map(items => ({ items: items.slice() })),
    trays: [{ id: 'bear-order', categoryId: 'stuffed_animals', targetItemId: 'bear', matchMode: 'itemType' },
        { id: 'duck-order', categoryId: 'stuffed_animals', targetItemId: 'duck', matchMode: 'itemType' }],
    maxActiveTrays: 2, layout: { columns: [[0, 2], [1], [3]], visibleRows: 4 }, rules: { timeToPlay: 120 } });
const clone = value => JSON.parse(JSON.stringify(value));
const bytes = value => JSON.stringify(value);
const metadataBefore = bytes(COMBO_SCENARIOS);
const blockerBefore = bytes(BLOCKER_SCENARIOS);
const blockerActionsBefore = bytes(BLOCKER_SCENARIOS.map(s => createBlockerLevel(s.id).referenceActions));
const board = engine => bytes({ boxes: engine.boxes.map(b => [b.id, b.slots, b.isWrapped]),
    queue: engine.queue.map(b => b.id), columns: engine.columns, moves: engine.moveCount,
    state: engine.gameState, combo: engine.getMechanicComboView() });
const start = level => { const engine = new GameEngine(); engine.startLevel(level); engine.startClock(); return engine; };
const active = engine => engine.conveyor.getAllActiveTrays();
const trayFor = (engine, item) => active(engine).find(t => t.targetItemId === item);
function invariant(engine, label) {
    const actual = {};
    for (const box of [...engine.boxes, ...engine.queue]) for (const item of box.items) actual[item] = (actual[item] || 0) + 1;
    const demand = {};
    for (const tray of engine.conveyor.allTrays) {
        if (tray.isFull()) continue;
        demand[tray.targetItemId] = (demand[tray.targetItemId] || 0) + 3;
    }
    const items = new Set([...Object.keys(actual), ...Object.keys(demand)]);
    const completeActual = {}, completeDemand = {};
    for (const item of items) {
        completeActual[item] = actual[item] || 0;
        completeDemand[item] = demand[item] || 0;
    }
    assert.deepEqual(completeActual, completeDemand, `${label}: demand/actual item totals diverge`);
    return actual;
}
function drain(engine, label) {
    for (let pass = 0; pass < 64 && engine.gameState === 'PLAYING'; pass++) {
        let changed = false;
        for (const box of [...engine.boxes]) if (box.isWrapped && engine.canQueueBlockerBox(box.id) && engine.moveBoxToQueue(box)) {
            changed = true; invariant(engine, label);
        }
        for (let n = 0; n < 64 && engine.gameState === 'PLAYING'; n++) {
            if (!engine.tryAutoFillTray()) break;
            changed = true; invariant(engine, label);
        }
        if (!changed) break;
    }
}
function action(engine, level, spec) {
    if (engine.gameState !== 'PLAYING') return;
    if (spec.type === 'wait') engine.advanceClock(spec.seconds);
    else assert.equal(engine.moveItem(spec.from, spec.slot, spec.to), true,
        `${level.id}: rejected ${bytes(spec)}: ${engine.lastComboError || engine.lastBlockerError}`);
    invariant(engine, `${level.id}/${spec.type}`); drain(engine, level.id);
}
const levels = Object.fromEntries(COMBO_SCENARIOS.map(s => [s.id, createMechanicComboLevel(s.id)]));
assert.equal(COMBO_SCENARIOS.length, 6);
const completed = {};
for (const scenario of COMBO_SCENARIOS) {
    const level = levels[scenario.id];
    assert.equal(level.solvable, false); assert.ok(level.name && level.description);
    assert.deepEqual(level.layout.columns, scenario.id === 'combo-stuck-priority' ? [[4, 2], [0, 1], [3]] : [[0, 2], [1], [3]]);
    assert.ok(level.trays.every(t => categories.includes(t.categoryId) && t.matchMode === 'itemType'));
    assert.equal(level.referenceActions.filter(a => a.type === 'move').length, 2);
    const engine = start(level);
    assert.equal(engine.moveCount, 0); invariant(engine, scenario.id);
    for (const spec of level.referenceActions) action(engine, level, spec);
    if (engine.gameState === 'PLAYING') engine.checkConditions();
    assert.equal(engine.gameState, 'WON', `${scenario.id}: ${engine.loseReason}`);
    completed[scenario.id] = engine;
    const replay = replayMechanicComboLevel(GameEngine, createMechanicComboLevel(scenario.id));
    assert.equal(replay.solved, true, `${scenario.id} replay: ${replay.failure}`); assert.equal(replay.state, 'WON');
}
assert.equal(completed['combo-key'].mechanicComboState.keyUsed, true);
assert.equal(completed['combo-hidden-urgent'].mechanicComboState.urgent.completed, true);
assert.equal(completed['combo-frozen-colors'].mechanicComboState.swap.status, 'completed');
assert.equal(completed['combo-stuck-priority'].mechanicComboState.priority.fulfilled, true);

const delayed = new GameEngine(), wrapped = [], delivered = [];
delayed.onBoxWrapped = box => wrapped.push(box.id);
delayed.onTrayDelivered = (tray, box) => delivered.push([tray?.id, box?.id]);
delayed.startLevel(createMechanicComboLevel('combo-connector-queue')); delayed.startClock();
assert.equal(delayed.moveItem(1, 0, 0), true);
assert.equal(delayed.moveItem(3, 0, 2), true);
assert.deepEqual(wrapped, [0, 2]); assert.equal(delayed.queue.length, 0);
assert.equal(delayed.moveBoxToQueue(0), true); assert.equal(delayed.moveBoxToQueue(2), false);
assert.equal(delayed.queue.length, 2); assert.deepEqual(delayed.queue.map(b => b.id).sort(), [0, 2]);
assert.equal(new Set(delayed.queue.map(b => b.id)).size, 2); assert.deepEqual(delivered, []);
for (const id of [0, 2]) {
    const box = delayed.getBox(id);
    assert.equal(delayed.deliverQueueBox(id, trayFor(delayed, box.items[0]).id), true);
    delayed.completeTrayExit(trayFor(delayed, box.items[0])?.id || (box.items[0] === 'bear' ? 'bear-order' : 'duck-order'));
}
delayed.checkConditions(); assert.equal(delayed.gameState, 'WON');
let urgentWrapped = 0, urgentDelivered = 0;
const urgentUI = new GameEngine(); urgentUI.onBoxWrapped = () => { urgentWrapped++; }; urgentUI.onTrayDelivered = () => { urgentDelivered++; };
urgentUI.startLevel(createMechanicComboLevel('combo-hidden-urgent')); urgentUI.startClock();
assert.equal(urgentUI.moveItem(1, 0, 0), true);
assert.equal(urgentUI.moveBoxToQueue(0), true);
assert.equal(urgentUI.deliverQueueBox(0, trayFor(urgentUI, 'bear').id), true);
urgentUI.completeTrayExit('bear-order');
assert.equal(urgentWrapped, 1); assert.equal(urgentDelivered, 1);
assert.equal(urgentUI.queue.length, 0);
assert.equal(urgentUI.moveItem(3, 0, 2), true);
assert.equal(urgentWrapped, 2); assert.equal(urgentUI.mechanicComboState.urgent.completed, false);
assert.equal(urgentUI.queue.length, 0); assert.equal(urgentDelivered, 1);
assert.equal(urgentUI.startDragWrappedBox(2), false); urgentUI.advanceClock(30);
assert.equal(urgentUI.gameState, 'LOST'); assert.match(urgentUI.loseReason, /khẩn cấp/i);

const extra = start(createMechanicComboLevel('combo-connector-queue'));
assert.equal(extra.maxQueueSize, 2); const queueSizes = []; extra.onQueueUpdated = () => { queueSizes.push(extra.maxQueueSize); };
assert.equal(extra.addExtraTray(), true); assert.equal(extra.maxQueueSize, 3);
assert.equal(extra.addExtraTray(), false); assert.equal(extra.maxQueueSize, 3); assert.equal(extra.extraTrayUsed, true);
assert.ok(queueSizes.length > 0, 'Extra tray produced no queue callbacks');
assert.ok(queueSizes.every(size => size <= 3), `Extra tray over-admitted queue capacity: ${queueSizes.join(',')}`);
assert.ok(queueSizes.every(size => size === 3), `Extra tray callbacks not at capacity 3: ${queueSizes.join(',')}`);
assert.equal(extra.startLevel(normalLevel()), undefined); assert.equal(extra.maxQueueSize, 5);
assert.equal(extra.addExtraTray(), true); assert.equal(extra.maxQueueSize, 6);
extra.startLevel(createMechanicComboLevel('combo-connector-queue')); assert.equal(extra.maxQueueSize, 2);

for (const scenario of COMBO_SCENARIOS) {
    for (const method of ['shuffleItems', 'removeTray']) {
        const engine = new GameEngine(); engine.startLevel(createMechanicComboLevel(scenario.id));
        const before = board(engine); assert.equal(engine[method](), false, `${scenario.id}/${method} before clock`);
        assert.equal(board(engine), before); engine.startClock(); const playing = board(engine);
        assert.equal(engine[method](), false, `${scenario.id}/${method} while active`); assert.equal(board(engine), playing);
    }
}
const sticky = start(createMechanicComboLevel('combo-sticky-oneway'));
const counts = [], boxEvents = []; sticky.onMoveCountUpdated = n => counts.push(n);
sticky.onBoxUpdated = (...args) => boxEvents.push(args);
assert.equal(sticky.canMoveBlockerItem(1, 0), false); assert.equal(sticky.selectSource(1, 0), false);
assert.equal(sticky.startDragWrappedBox(1), false); assert.equal(sticky.getValidTargets(1).length, 0);
assert.equal(sticky.moveItem(0, 0, 2), false); const badPair = board(sticky);
assert.equal(sticky.moveItem(0, 0, 2), false); assert.equal(sticky.moveItem(1, 0, 0), false); assert.equal(board(sticky), badPair);
assert.equal(sticky.moveItem(0, 0, 1), true); assert.equal(sticky.moveCount, 1);
assert.deepEqual(counts, [1]); assert.ok(boxEvents.length >= 2);
const stickyBoxes = bytes(sticky.boxes.map(b => [b.id, b.slots, b.isWrapped])); assert.deepEqual(counts, [1]);
assert.equal(sticky.moveItem(3, 0, 2), true); assert.equal(sticky.gameState, 'WON'); assert.deepEqual(counts, [1, 2]);
const selective = start(createMechanicComboLevel('combo-sticky-oneway'));
assert.equal(selective.moveItem(1, 0, 2), false); assert.equal(selective.canMoveBlockerItem(0, 0, 2), false);
const selectiveBefore = board(selective); assert.equal(selective.moveItem(0, 0, 2), false); assert.equal(board(selective), selectiveBefore);

const colors = start(createMechanicComboLevel('combo-frozen-colors'));
assert.equal(colors.canMoveBlockerItem(1, 0), false);
assert.equal(colors.moveCount, 0); assert.equal(colors.moveItem(1, 0, 0), false);
assert.equal(colors.moveCount, 0);
colors.advanceClock(2.9);
assert.equal(colors.canMoveBlockerItem(1, 0), false);
assert.equal(colors.moveItem(1, 0, 0), false);
assert.equal(colors.moveCount, 0);
colors.advanceClock(0.1);
assert.equal(colors.canMoveBlockerItem(1, 0), true);
assert.equal(colors.getBox(1).slots[0], 'bear');
assert.equal(colors.moveCount, 0);
colors.advanceClock(1); assert.equal(colors.getBox(1).slots[0], 'duck');
assert.equal(colors.getBox(3).slots[0], 'bear'); assert.equal(colors.mechanicComboState.swap.status, 'completed');
const totalsAfterMove = colors.boxes.flatMap(b => b.items).reduce((o, x) => ({ ...o, [x]: (o[x] || 0) + 1 }), {});
assert.deepEqual(totalsAfterMove, { bear: 3, duck: 3 });
const swapped = start(createMechanicComboLevel('combo-frozen-colors'));
assert.equal(swapped.getMechanicComboView().swap.tokens[0].boxId, 1); swapped.advanceClock(4);
assert.equal(swapped.getBox(1).slots[0], 'duck'); assert.equal(swapped.getBox(3).slots[0], 'bear');
const cancelled = start(createMechanicComboLevel('combo-frozen-colors'));
cancelled.advanceClock(3);
assert.equal(cancelled.canMoveBlockerItem(1, 0), true);
assert.equal(cancelled.moveItem(1, 0, 0), true); assert.equal(cancelled.moveCount, 1);
cancelled.advanceClock(1);
assert.equal(cancelled.mechanicComboState.swap.status, 'cancelled');
const cancelledActual = invariant(cancelled, 'cancelled-swap');
assert.equal(cancelledActual.bear, undefined); assert.equal(cancelledActual.duck, 3);
assert.equal(cancelled.getBox(3).slots[0], 'duck'); assert.equal(cancelled.moveItem(3, 0, 2), true);
assert.equal(cancelled.gameState, 'WON');

const auto = start(createMechanicComboLevel('combo-stuck-priority'));
assert.equal(auto.moveItem(3, 0, 2), true); assert.ok(auto.queue.some(b => b.id === 2));
assert.equal(auto.tryAutoFillTray(), false); assert.equal(auto.deliverQueueBox(2, trayFor(auto, 'duck').id), false);
assert.ok(auto.queue.some(b => b.id === 2));
const manual = start(createMechanicComboLevel('combo-stuck-priority')); manual.onBoxWrapped = () => {};
assert.equal(manual.moveItem(3, 0, 2), true); assert.equal(manual.startDragWrappedBox(2), true);
assert.equal(manual.dropOnTray(trayFor(manual, 'duck').id), false); assert.equal(manual.getBox(2).isWrapped, true); manual.cancelDrag();
assert.equal(manual.moveItem(1, 0, 0), true); assert.equal(manual.moveBoxToQueue(0), true);
assert.equal(manual.mechanicComboState.priority.gateOpen, true);
const duckTrayId = trayFor(manual, 'duck').id;
const manualDeliveries = [];
manual.onTrayDelivered = (trayId, box) => { manualDeliveries.push({ trayId, box }); };
assert.equal(manual.moveBoxToQueue(2), true);
assert.ok(manual.queue.some(box => box.id === 2));
assert.equal(manual.deliverQueueBox(2, duckTrayId), true);
assert.equal(manualDeliveries.length, 1);
assert.equal(manualDeliveries[0].trayId, duckTrayId);
assert.equal(manualDeliveries[0].box.id, 2);
assert.equal(manual.deliverQueueBox(2, duckTrayId), false);
assert.equal(manualDeliveries.length, 1);
assert.equal(manual.mechanicComboState.priority.fulfilled, true);
manual.completeTrayExit(duckTrayId);
drain(manual, 'manual-priority');
manual.checkConditions(); assert.equal(manual.gameState, 'WON');

for (const scenario of COMBO_SCENARIOS) {
    const good = createMechanicComboLevel(scenario.id);
    const invalid = clone(good); invalid.layout.columns = [[0], [1]];
    const engine = start(normalLevel()); const before = board(engine);
    assert.throws(() => engine.startLevel(invalid), /Invalid (?:mechanic combo|blocker level):/); assert.equal(board(engine), before);
    const accepted = new GameEngine(); accepted.startLevel(good);
    const boxesBefore = good.boxes.map(b => b.items.join('/')).join('|'); assert.equal(accepted.moveCount, 0);
    assert.equal(createMechanicComboLevel(scenario.id).boxes.map(b => b.items.join('/')).join('|'), boxesBefore);
}
{
    const invalid = createMechanicComboLevel('combo-sticky-oneway');
    invalid.mechanicCombo.sticky.slots = [0];
    assert.throws(() => new GameEngine().startLevel(invalid), /Invalid mechanic combo/);
}
{
    const invalid = createMechanicComboLevel('combo-sticky-oneway');
    invalid.layout.columns = [[0], [1], [2], [2]];
    assert.throws(() => new GameEngine().startLevel(invalid), /Invalid (?:mechanic combo|blocker level):/);
}
const reset = start(createMechanicComboLevel('combo-hidden-urgent')); reset.advanceClock(30);
assert.equal(reset.gameState, 'LOST'); reset.startLevel(createMechanicComboLevel('combo-key'));
assert.equal(reset.gameState, 'PLAYING'); assert.equal(reset.clockStarted, false); assert.equal(reset.moveCount, 0); assert.equal(reset.lastComboError, '');
assert.equal(reset.mechanicComboState.type, 'combo-key'); reset.startClock(); reset.shuffleItems();
assert.ok(reset.lastComboError); reset.startLevel(createMechanicComboLevel('combo-key')); assert.equal(reset.lastComboError, '');
const won = completed['combo-sticky-oneway']; const terminal = board(won);
won.advanceClock(20); assert.equal(won.moveItem(3, 0, 2), false); assert.equal(won.addExtraTray(), false); assert.equal(board(won), terminal);

const campaign = [];
for (let levelNumber = 1; levelNumber <= 50; levelNumber++) {
    const level = LevelGenerator.generateLevel({ levelNumber });
    campaign.push(bytes({ boxes: level.boxes, trays: level.trays, layout: level.layout, rules: level.rules, config: level.config }));
}
for (const scenario of COMBO_SCENARIOS) {
    const engine = start(createMechanicComboLevel(scenario.id));
    for (const spec of levels[scenario.id].referenceActions) action(engine, levels[scenario.id], spec);
}
const after = [];
for (let levelNumber = 1; levelNumber <= 50; levelNumber++) {
    const level = LevelGenerator.generateLevel({ levelNumber });
    after.push(bytes({ boxes: level.boxes, trays: level.trays, layout: level.layout, rules: level.rules, config: level.config }));
}
assert.deepEqual(after, campaign);
for (const scenario of COMBO_SCENARIOS) {
    const replay = replayMechanicComboLevel(GameEngine, createMechanicComboLevel(scenario.id));
    assert.equal(replay.state, 'WON', `${scenario.id} full trace: ${replay.failure}`);
}
const fresh = createMechanicComboLevel('combo-key'); fresh.boxes[0].items[0] = 'penguin'; fresh.trays[0].matchMode = 'exact';
assert.equal(createMechanicComboLevel('combo-key').boxes[0].items[0], 'bear');
assert.equal(createMechanicComboLevel('combo-key').trays[0].matchMode, 'itemType');
assert.equal(metadataBefore, bytes(COMBO_SCENARIOS)); assert.equal(blockerBefore, bytes(BLOCKER_SCENARIOS));
assert.equal(blockerActionsBefore, bytes(BLOCKER_SCENARIOS.map(s => createBlockerLevel(s.id).referenceActions)));
console.log('Combo checks: six WON traces, delayed UI, atomic pair/boosters/timers/priority, and 50 stable generated campaign snapshots.');
