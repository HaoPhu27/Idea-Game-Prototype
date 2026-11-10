const BASE_ITEMS = [['bear', 'bear'], ['bear'], ['duck', 'duck'], ['duck']];
const move = (from, slot, to) => ({ type: 'move', from, slot, to });
const wait = seconds => ({ type: 'wait', seconds });

export const COMBO_SCENARIOS = [
    { id: 'combo-key', label: 'Chìa khóa phụ thuộc', tier: 'Normal / Hard', name: 'Chìa khóa phụ thuộc', description: 'Đóng gói hộp chìa khóa để mở đúng hộp khóa có tên.' },
    { id: 'combo-sticky-oneway', label: 'Cặp dính và hộp một chiều', tier: 'Hard', name: 'Cặp dính và hộp một chiều', description: 'Chuyển nguyên cặp hai vật vào hai ô trống; hộp một chiều chỉ nhận vật.' },
    { id: 'combo-hidden-urgent', label: 'Hộp ẩn khẩn cấp', tier: 'Hard', name: 'Hộp ẩn khẩn cấp', description: 'Đồng hồ khẩn cấp chạy khi hộp tiếp cận được, kể cả khi vật bên trong còn bị che.' },
    { id: 'combo-connector-queue', label: 'Liên kết và hàng chờ hẹp', tier: 'Super Hard', name: 'Liên kết và hàng chờ hẹp', description: 'Hai hộp liên kết phải vào hàng chờ nguyên cặp với sức chứa giới hạn.' },
    { id: 'combo-frozen-colors', label: 'Băng giá đổi màu vật', tier: 'Super Hard', name: 'Băng giá đổi màu vật', description: 'Hai vật được theo dõi đổi loại đồng thời sau bốn giây, không làm thay đổi tổng số mỗi loại.' },
    { id: 'combo-stuck-priority', label: 'Hộp kẹt và đơn ưu tiên', tier: 'Hard', name: 'Hộp kẹt và đơn ưu tiên', description: 'Giải phóng hộp kẹt để mở khay ưu tiên và chặn các đơn khác cho tới khi hoàn tất.' }
];
const SCENARIOS = Object.freeze(COMBO_SCENARIOS.map(scenario => Object.freeze({ ...scenario })));
const copy = value => JSON.parse(JSON.stringify(value));
const tray = (id, item) => ({ id, categoryId: 'stuffed_animals', targetItemId: item, matchMode: 'itemType' });
function assertRealEngineGameplay(engine, level) {
    const actual = {};
    for (const box of [...engine.boxes, ...engine.queue]) {
        for (const item of box.items) actual[item] = (actual[item] || 0) + 1;
    }
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
    const same = JSON.stringify(Object.keys(completeActual).sort()) === JSON.stringify(Object.keys(completeDemand).sort())
        && Object.keys(completeActual).every(item => completeActual[item] === completeDemand[item]);
    if (!same) {
        throw new Error(`${level.id}: demand ${JSON.stringify(completeDemand)} != actual ${JSON.stringify(completeActual)}.`);
    }
}
function drainReplay(engine, level) {
    for (let pass = 0; pass < 64 && engine.gameState === 'PLAYING'; pass++) {
        let changed = false;
        for (const box of [...engine.boxes]) {
            if (box.isWrapped && engine.canQueueBlockerBox(box.id) && engine.moveBoxToQueue(box)) {
                changed = true;
                assertRealEngineGameplay(engine, level);
            }
        }
        for (let delivery = 0; delivery < 64 && engine.gameState === 'PLAYING'; delivery++) {
            if (!engine.tryAutoFillTray()) break;
            changed = true;
            assertRealEngineGameplay(engine, level);
        }
        if (!changed) break;
    }
}
/** Replay only authored actions and actual engine operations; solved never means merely accepted moves. */
export function replayMechanicComboLevel(GameEngineClass, level) {
    const engine = new GameEngineClass();
    engine.startLevel(level);
    engine.startClock();
    let failure = '';
    try {
        assertRealEngineGameplay(engine, level);
        for (const action of level.referenceActions || []) {
            if (engine.gameState !== 'PLAYING') break;
            if (action.type === 'wait') engine.advanceClock(action.seconds);
            else if (action.type === 'move') {
                if (!engine.moveItem(action.from, action.slot, action.to, action.targetSlot ?? null)) {
                    failure = `Reference move ${action.from}:${action.slot} -> ${action.to} was rejected: ${engine.lastComboError || engine.lastBlockerError}`;
                    break;
                }
            } else {
                failure = `Unknown reference action ${action.type}.`;
                break;
            }
            assertRealEngineGameplay(engine, level);
            drainReplay(engine, level);
        }
        if (!failure && engine.gameState === 'PLAYING') {
            drainReplay(engine, level);
            engine.checkConditions();
        }
    } catch (error) {
        failure = error.message;
    }
    return { solved: engine.gameState === 'WON', state: engine.gameState,
        failure: failure || engine.loseReason, moveCount: engine.moveCount, engine };
}
/** Authored diagnostics only. No campaign seed, pacing curve, or generator data is consulted. */
export function createMechanicComboLevel(levelId) {
    const scenario = SCENARIOS.find(candidate => candidate.id === levelId);
    if (!scenario) throw new Error(`Unknown mechanic combo scenario: ${levelId}`);
    const boxes = BASE_ITEMS.map(items => ({ items: items.slice() }));
    let blockers = [], mechanicCombo, referenceActions;
    const ordinaryTrace = () => [move(1, 0, 0), move(3, 0, 2)];
    if (levelId === 'combo-key') {
        blockers = [{ id: 'combo-key-lock', type: 'locked', boxId: 2, dependsOnBoxId: 0 }];
        mechanicCombo = { type: levelId, label: scenario.label, keyBoxId: 0, lockedBoxId: 2 };
        referenceActions = ordinaryTrace();
    } else if (levelId === 'combo-sticky-oneway') {
        mechanicCombo = { type: levelId, label: scenario.label,
            sticky: { boxId: 0, slots: [0, 1] }, oneWayBoxId: 1 };
        referenceActions = [move(0, 0, 1), move(3, 0, 2)];
    } else if (levelId === 'combo-hidden-urgent') {
        blockers = [{ id: 'combo-hidden-face', type: 'hidden-box', boxId: 2 }];
        mechanicCombo = { type: levelId, label: scenario.label, urgentBoxId: 2, duration: 30 };
        referenceActions = ordinaryTrace();
    } else if (levelId === 'combo-connector-queue') {
        blockers = [{ id: 'combo-linked-pair', type: 'connector', boxIds: [0, 2], groupId: 'COMBO-A' }];
        mechanicCombo = { type: levelId, label: scenario.label, boxIds: [0, 2], queueCapacity: 2 };
        referenceActions = ordinaryTrace();
    } else if (levelId === 'combo-frozen-colors') {
        blockers = [{ id: 'combo-color-freeze', type: 'frozen', boxId: 1, slot: 0, duration: 3 }];
        mechanicCombo = { type: levelId, label: scenario.label, swapAt: 4, tooltip: 'đổi loại sau4s',
            first: { boxId: 1, slot: 0 }, second: { boxId: 3, slot: 0 } };
        referenceActions = [wait(4), move(3, 0, 0), move(1, 0, 2)];
    } else if (levelId === 'combo-stuck-priority') {
        boxes.push({ items: [] });
        blockers = [{ id: 'combo-priority-stuck', type: 'stuck', boxId: 4, shipCount: 1 }];
        mechanicCombo = { type: levelId, label: scenario.label, stuckBoxId: 4,
            priorityTrayId: 'duck-order', priorityItemId: 'duck' };
        referenceActions = ordinaryTrace();
    } else {
        throw new Error(`Unimplemented mechanic combo scenario: ${levelId}`);
    }
    const columns = levelId === 'combo-stuck-priority' ? [[4, 2], [0, 1], [3]] : [[0, 2], [1], [3]];
    return {
        id: levelId, name: scenario.name, label: scenario.label, tier: scenario.tier,
        description: scenario.description, solvable: false, boxes,
        trays: [tray('bear-order', 'bear'), tray('duck-order', 'duck')], maxActiveTrays: 2,
        layout: { columns: columns.map(column => column.slice()), visibleRows: 4 },
        rules: { timeToPlay: 120 },
        blockers: blockers.map(record => copy(record)), mechanicCombo: copy(mechanicCombo),
        referenceActions: referenceActions.map(action => ({ ...action })),
        referenceSolution: referenceActions.filter(action => action.type === 'move')
            .map(action => ({ from: action.from, index: action.slot, to: action.to }))
    };
}
