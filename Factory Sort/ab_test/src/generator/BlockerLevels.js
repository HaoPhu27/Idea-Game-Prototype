const BLOCKER_BASE_BOXES = [
    ['bear', 'bear'],
    ['bear'],
    ['duck', 'duck'],
    ['duck']
];
const BLOCKER_MOVES = [
    { from: 1, index: 0, to: 0 },
    { from: 3, index: 0, to: 2 }
];
const blockerMoveAction = move => ({ type: 'move', from: move.from, slot: move.index, to: move.to });
const blockerMovesOnly = () => BLOCKER_MOVES.map(blockerMoveAction);

export const BLOCKER_SCENARIOS = [
    {
        id: 'locked',
        name: 'Khoá sau một đơn',
        description: 'Giao một đơn để mở khoá hộp còn lại.',
        blockers: [{ id: 'lock-count', type: 'locked', boxId: 2, shipCount: 1 }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'locked-named',
        name: 'Khoá theo hộp đã giao',
        description: 'Giao hộp gấu #0 để mở khoá hộp vịt #2.',
        blockers: [{ id: 'lock-named', type: 'locked', boxId: 2, dependsOnBoxId: 0 }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'frozen',
        name: 'Băng ở ô món',
        description: 'Chờ 3 giây để băng tan trước khi lấy món gấu.',
        blockers: [{ id: 'freeze-slot', type: 'frozen', boxId: 1, slot: 0, duration: 3 }],
        referenceActions: [{ type: 'wait', seconds: 3 }, ...blockerMovesOnly()]
    },
    {
        id: 'stuck',
        name: 'Hộp rỗng bị kẹt',
        description: 'Giao một đơn để dọn hộp rỗng đang kẹt trên bàn.',
        extraEmptyBox: true,
        layout: { columns: [[4, 2], [0, 1], [3]], visibleRows: 4 },
        blockers: [{ id: 'stuck-empty', type: 'stuck', boxId: 4, shipCount: 1 }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'defective',
        name: 'Hộp cần kiểm tra lỗi',
        description: 'Hộp gấu bị giữ 3 giây trong hàng chờ trước khi giao.',
        blockers: [{ id: 'defect-hold', type: 'defective', boxId: 0, holdSeconds: 3 }],
        referenceActions: [blockerMoveAction(BLOCKER_MOVES[0]), { type: 'wait', seconds: 3 }, blockerMoveAction(BLOCKER_MOVES[1])]
    },
    {
        id: 'connector',
        name: 'Hộp nối đôi',
        description: 'Đóng gói cả hai hộp rồi đưa cặp #0 và #2 vào hàng chờ.',
        blockers: [{ id: 'connector-a', type: 'connector', boxIds: [0, 2], groupId: 'A' }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'hidden-box',
        name: 'Hộp giấu nội dung',
        description: 'Đưa hộp giấu lên đầu cột để xem nội dung.',
        layout: { columns: [[0, 2], [1], [3]], visibleRows: 4 },
        blockers: [{ id: 'concealed-box', type: 'hidden-box', boxId: 2 }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'hidden-item',
        name: 'Món giấu trong hộp',
        description: 'Đối chiếu gợi ý và đơn hàng để tìm món bị giấu.',
        blockers: [{ id: 'concealed-item', type: 'hidden-item', boxId: 1, slot: 0 }],
        referenceActions: blockerMovesOnly()
    },
    {
        id: 'urgent',
        name: 'Hộp gấp',
        description: 'Đưa hộp gấu vào hàng chờ trong 30 giây.',
        blockers: [{ id: 'urgent-pack', type: 'urgent', boxId: 0, duration: 30 }],
        referenceActions: blockerMovesOnly()
    }
];

/** Return a fresh config so replay, UI state, and retries never share authored arrays. */
export function createBlockerLevel(levelId) {
    const scenario = BLOCKER_SCENARIOS.find(candidate => candidate.id === levelId);
    if (!scenario) throw new Error(`Unknown blocker scenario: ${levelId}`);
    const boxes = BLOCKER_BASE_BOXES.map(items => ({ items: items.slice() }));
    if (scenario.extraEmptyBox) boxes.push({ items: [] });
    const config = {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        solvable: false,
        boxes,
        trays: [
            { id: 'bear-order', categoryId: 'stuffed_animals', targetItemId: 'bear', matchMode: 'itemType' },
            { id: 'duck-order', categoryId: 'stuffed_animals', targetItemId: 'duck', matchMode: 'itemType' }
        ],
        maxActiveTrays: 2,
        layout: scenario.layout
            ? { columns: scenario.layout.columns.map(column => column.slice()), visibleRows: scenario.layout.visibleRows }
            : { columns: [[0, 2], [1], [3]], visibleRows: 4 },
        rules: { timeToPlay: 120 },
        blockers: scenario.blockers.map(record => ({ ...record, ...(record.boxIds ? { boxIds: record.boxIds.slice() } : {}) })),
        referenceActions: scenario.referenceActions.map(action => ({ ...action })),
        referenceSolution: BLOCKER_MOVES.map(move => ({ ...move }))
    };
    return config;
}

function drainBlockerReplay(engine) {
    let progressed = true;
    for (let pass = 0; pass < 64 && progressed && engine.gameState === 'PLAYING'; pass++) {
        progressed = false;
        for (const box of [...engine.boxes]) {
            if (box.isWrapped && engine.canQueueBlockerBox(box.id)) {
                if (engine.moveBoxToQueue(box)) progressed = true;
            }
        }
        for (let delivery = 0; delivery < 64 && engine.gameState === 'PLAYING'; delivery++) {
            if (!engine.tryAutoFillTray()) break;
            progressed = true;
        }
    }
}

/** Replay with the real engine; only its terminal WON state counts as solved. */
export function replayBlockerLevel(GameEngineClass, level) {
    const engine = new GameEngineClass();
    engine.startLevel(level);
    engine.startClock();
    let failure = '';
    for (const action of level.referenceActions || []) {
        if (engine.gameState !== 'PLAYING') break;
        if (action.type === 'wait') {
            engine.advanceClock(action.seconds);
        } else if (action.type === 'move') {
            const slot = action.slot ?? action.index;
            if (!engine.moveItem(action.from, slot, action.to, action.targetSlot ?? null)) {
                failure = `Reference move ${action.from}:${slot} -> ${action.to} was rejected.`;
                break;
            }
        } else {
            failure = `Unknown reference action ${action.type}.`;
            break;
        }
        drainBlockerReplay(engine);
    }
    if (!failure && engine.gameState === 'PLAYING') {
        drainBlockerReplay(engine);
        engine.checkConditions();
    }
    return {
        solved: engine.gameState === 'WON',
        state: engine.gameState,
        failure: failure || engine.loseReason,
        moveCount: engine.moveCount,
        shipped: engine.blockerState ? [...engine.blockerState.shipped] : [],
        engine
    };
}
