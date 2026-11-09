import { boosterSnapshot, boosterMatchingInvariant, boosterProveSolvable } from './BoosterSolver.js';
import { Box } from './Box.js';
import { Conveyor } from './Conveyor.js';
import { Tray } from './Tray.js';
import { installBlockerRules } from './BlockerRules.js';

export class GameEngine {
    constructor() {
        this.boxes = [];
        this.queue = [];
        this.maxQueueSize = 5;
        this.conveyor = new Conveyor();
        this.selectedBoxId = null;
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.moveLimit = null;   // null = khong gioi han
        this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
        this.loseReason = '';
        this.timeLimitSeconds = null;
        this.timeRemainingSeconds = null;
        this.elapsedPlaySeconds = 0;
        this.clockStarted = false;
        this.freezeRemainingSeconds = 0;
        this.extraTrayUsed = false;
        this.lastBoosterError = '';
        
        // Callbacks for UI
        this.onBoxUpdated = null;
        this.onBoxWrapped = null;
        this.onQueueUpdated = null;
        this.onTrayExited = null;
        this.onTrayDelivered = null;
        this.onGameStateChanged = null;
        this.onMoveCountUpdated = null;

        installBlockerRules(this);
    }

    startLevel(levelConfig) {
        this.boosterReferenceSolution = (levelConfig.referenceSolution || []).map(m => ({ ...m }));
        this.boxes = levelConfig.boxes.map((boxData, idx) => {
            const box = new Box(idx);
            box.items = boxData.items;
            box.checkWrapped(); // Just in case it starts wrapped
            return box;
        });

        const trayInstances = levelConfig.trays.map(
            t => new Tray(t.id, t.categoryId, t.targetItemId, t.matchMode));

        // So Khay hien dien cung luc la mot don bay do kho cua bo sinh man
        // (conveyorMaxActive). Truoc day Conveyor luon giu mac dinh 4 va gia tri
        // trong level bi bo qua hoan toan, nen do kho mo phong khi sinh man
        // (simulateDelivery) khong khop voi tran dau that.
        if (levelConfig.maxActiveTrays > 0) this.conveyor.maxActive = levelConfig.maxActiveTrays;
        this.conveyor.initialize(trayInstances);

        // --- Khu Thung theo COT ---
        // layout.columns[c] = danh sach ID Thung trong cot c, phan tu 0 la o duoi
        // cung. Chi `visibleRows` phan tu dau moi cot la CHAM DUOC; phan tren bi che
        // va khoa cung. Khi mot Thung duoc giao cho Khay, no bi go khoi mang cua cot
        // => cot tut xuong => Thung ke tiep lo ra.
        //
        // Level cu (khong co layout) rot ve mot cot duy nhat chua tat ca va
        // visibleRows = Infinity, tuc giu nguyen hanh vi luoi phang truoc day.
        if (levelConfig.layout) {
            this.columns = levelConfig.layout.columns.map(c => c.slice());
            this.visibleRows = levelConfig.layout.visibleRows;
        } else {
            this.columns = [this.boxes.map(b => b.id)];
            this.visibleRows = Infinity;
        }

        // Luat moi: Thung rong tu dong bien mat. Neu co thung rong luc start thi loai bo ngay.
        const emptyBoxes = this.boxes.filter(b => b.isEmpty() && !this._isBlockerStuckBox(b.id));
        for (const eb of emptyBoxes) {
            this._removeFromColumn(eb.id);
        }
        this.boxes = this.boxes.filter(b => !b.isEmpty() || this._isBlockerStuckBox(b.id));

        // Với những level không có box ẩn (không có cột nào vượt quá visibleRows),
        // tính effectiveRows theo chiều cao cột lớn nhất ban đầu để đẩy box lên sát conveyor.
        const hasHidden = this.columns.some(col => col.length > this.visibleRows);
        if (!hasHidden && Number.isFinite(this.visibleRows)) {
            const maxColLen = Math.max(...this.columns.map(col => col.length), 1);
            this.effectiveRows = Math.min(this.visibleRows, maxColLen);
        } else {
            this.effectiveRows = this.visibleRows;
        }

        this.maxQueueSize = 5;
        this.extraTrayUsed = false;
        this.freezeRemainingSeconds = 0;
        this.lastBoosterError = '';

        // Reset hang cho (staging queue 5 slots)
        this.queue = [];
        this.loseReason = '';

        // Neu co thung wrapped san (hiem), dua vao queue
        const initialWrapped = this.boxes.filter(b => b.isWrapped && !this.blockerState?.enabled);
        for (const wb of initialWrapped) {
            this._removeFromColumn(wb.id);
            this.queue.push(wb);
        }
        this.boxes = this.boxes.filter(b => !b.isWrapped);

        this.selectedSource = null; // { boxId, itemIndex }
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.moveLimit = null; // Khong gioi han so nuoc di
        const timer = levelConfig.rules?.timeToPlay;
        this.timeLimitSeconds = Number.isFinite(timer) && timer > 0 ? timer : null;
        this.timeRemainingSeconds = this.timeLimitSeconds;
        this.elapsedPlaySeconds = 0;
        this.clockStarted = false;
        this.setGameState('PLAYING');
    }

    /** Reading the board is free; the first valid pickup starts active play. */
    startClock() {
        if (this.gameState !== 'PLAYING') return false;
        const started = !this.clockStarted;
        this.clockStarted = true;
        return started;
    }

    hasPlayerWorkRemaining() {
        return this.boxes.some(box => !box.isWrapped && !box.isEmpty());
    }

    /** The UI supplies visible, unpaused wall-clock seconds, never frame counts. */
    advanceClock(deltaSeconds) {
        if (this.gameState !== 'PLAYING' || !this.clockStarted ||
            !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || !this.hasPlayerWorkRemaining()) return;
        const frozen = Math.min(deltaSeconds, this.freezeRemainingSeconds);
        this.freezeRemainingSeconds -= frozen;
        deltaSeconds -= frozen;
        const charged = this.timeRemainingSeconds === null
            ? deltaSeconds : Math.min(deltaSeconds, this.timeRemainingSeconds);
        this.elapsedPlaySeconds += charged;
        if (this.timeRemainingSeconds === null) return;
        this.timeRemainingSeconds = Math.max(0, this.timeRemainingSeconds - charged);
        if (this.timeRemainingSeconds === 0) {
            this.checkConditions();
            if (this.gameState === 'PLAYING' && this.hasPlayerWorkRemaining()) {
                this.loseReason = 'Hết thời gian! Hãy thử lại và ưu tiên các kiện có Khay đang chờ.';
                this.setGameState('LOST');
            }
        }
    }
    
    _boosterFail(reason) { this.lastBoosterError = reason; return false; }

    _boosterReady() {
        return this.gameState === 'PLAYING' && !this.hasPendingTrayExits();
    }

    _boosterChanged() {
        this.lastBoosterError = '';
        this.deselectSource(); this.cancelDrag();
        if (this.onBoosterUpdated) this.onBoosterUpdated();
    }

    freezeTime() {
        if (!this._boosterReady() || this.timeRemainingSeconds === null || this.freezeRemainingSeconds > 0 || !this.hasPlayerWorkRemaining())
            return this._boosterFail('Không thể đóng băng lúc này.');
        this.startClock();
        this.freezeRemainingSeconds = 30;
        this._boosterChanged(); return true;
    }

    addExtraTray() {
        if (!this._boosterReady() || this.extraTrayUsed) return this._boosterFail('Đã thêm ô chờ ở màn này.');
        this.extraTrayUsed = true; this.maxQueueSize = 6;
        if (this.onQueueUpdated) this.onQueueUpdated(this.queue);
        this._boosterChanged(); return true;
    }

    shuffleItems(rng = Math.random) {
        if (!this._boosterReady()) return this._boosterFail('Chờ giao hàng hoàn tất.');
        const eligible = this.boxes.filter(b => !b.isWrapped && this.isAccessible(b.id));
        const positions = eligible.flatMap(b => b.slots.map((it, slot) => ({ b, slot, it })).filter(p => p.it !== null));
        if (positions.length < 2 || new Set(positions.map(p => p.it)).size < 2)
            return this._boosterFail('Không đủ vật phẩm để xáo trộn.');
        const originals = positions.map(p => p.it);
        const deadline = Date.now() + 180;
        for (let attempt = 0; attempt < 12 && Date.now() < deadline; attempt++) {
            const items = originals.slice();
            for (let i = items.length - 1; i > 0; i--) {
                const value = rng();
                const j = Math.floor(Math.min(0.999999999, Math.max(0, Number.isFinite(value) ? value : 0)) * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            if (items.every((it, i) => it === originals[i])) continue;
            positions.forEach((p, i) => { p.b.slots[p.slot] = items[i]; });
            // Shuffle never bypasses the normal wrap/flight transaction. Keep
            // new triples out of candidates; players finish them through normal moves.
            const createsWrapped = eligible.some(b => b.items.length === 3 && b.items.every(it => it === b.items[0]));
            // Explore several random candidates before spending the remaining
            // proof budget on one layout; an inconclusive proof never mutates play.
            const slices = [15, 15, 20, 25, 35];
            const proofDeadline = attempt < slices.length ? Math.min(deadline, Date.now() + slices[attempt]) : deadline;
            const solved = !createsWrapped && boosterProveSolvable(boosterSnapshot(this), proofDeadline);
            if (solved) {
                this._boosterChanged();
                for (const b of eligible) {
                    const wrapped = b.checkWrapped();
                    if (this.onBoxUpdated) this.onBoxUpdated(b);
                    if (wrapped) {
                        if (this.onBoxWrapped) this.onBoxWrapped(b);
                        else this.moveBoxToQueue(b);
                    }
                }
                this.checkConditions(); return true;
            }
            positions.forEach((p, i) => { p.b.slots[p.slot] = originals[i]; });
        }
        return this._boosterFail('Chưa tìm được cách xáo trộn bảo đảm giải được; bàn giữ nguyên.');
    }

    removeTray(trayId) {
        if (!this._boosterReady()) return this._boosterFail('Chờ giao hàng hoàn tất.');
        const tray = this.conveyor.getAllActiveTrays().find(t => t.id === trayId && !t.isFull());
        if (!tray || !tray.targetItemId) return this._boosterFail('Chọn khay trống đang trên băng chuyền.');
        const snapshot = boosterSnapshot(this);
        if (!boosterMatchingInvariant(snapshot)) return this._boosterFail('Số vật phẩm và đơn hàng không khớp.');
        const ordered = [];
        const maxRows = Math.max(0, ...this.columns.map(c => c.length));
        for (let row = maxRows - 1; row >= 0; row--) for (const col of this.columns) {
            const b = this.boxes.find(b => String(b.id) === String(col[row]));
            if (b) ordered.push(b);
        }
        ordered.push(...this.queue);
        const picks = [];
        for (const b of ordered) for (let slot = 0; slot < b.slots.length; slot++) {
            if (b.slots[slot] === tray.targetItemId && picks.length < 3) picks.push({ b, slot });
        }
        if (picks.length !== 3) return this._boosterFail('Không tìm thấy đủ 3 vật phẩm đúng loại.');
        const oldBoxes = this.boxes.slice(), oldQueue = this.queue.slice();
        const oldColumns = this.columns.map(c => c.slice());
        const oldTrays = this.conveyor.allTrays.slice();
        const affected = [...new Set(picks.map(p => p.b))];
        const originals = affected.map(b => ({ b, slots: b.slots.slice(), wrapped: b.isWrapped }));
        for (const { b, slot } of picks) { b.slots[slot] = null; b.isWrapped = false; }
        for (const b of affected) {
            if (b.isEmpty()) {
                this.boxes = this.boxes.filter(x => x !== b); this.queue = this.queue.filter(x => x !== b); this._removeFromColumn(b.id);
            } else if (this.queue.includes(b)) {
                // A partial pack is playable again; it cannot occupy a wrapped queue slot.
                this.queue = this.queue.filter(x => x !== b); this.boxes.push(b);
                const col = this.columns.reduce((a, c) => c.length < a.length ? c : a, this.columns[0]);
                if (col) col.unshift(b.id);
                else this.columns.push([b.id]);
            }
        }
        this.conveyor.removeTray(tray.id);
        if (!boosterProveSolvable(boosterSnapshot(this))) {
            this.boxes = oldBoxes; this.queue = oldQueue; this.columns = oldColumns; this.conveyor.allTrays = oldTrays;
            for (const o of originals) { o.b.slots = o.slots; o.b.isWrapped = o.wrapped; }
            return this._boosterFail('Chưa chứng minh được bàn còn giải được; chưa xóa khay hay vật phẩm.');
        }
        this._boosterChanged();
        for (const b of affected) if (this.onBoxUpdated) this.onBoxUpdated(b, b.isEmpty());
        if (this.onQueueUpdated) this.onQueueUpdated(this.queue);
        if (this.onTrayExited) this.onTrayExited(tray.id);
        if (!this.onTrayDelivered) while (this.tryAutoFillTray()) {}
        this.checkConditions(); return true;
    }

    setGameState(newState) {
        this.gameState = newState;
        if (this.onGameStateChanged) this.onGameStateChanged(newState);
    }

    _isBlockerStuckBox(boxId) {
        const record = this.blockerState?.enabled ? this.blockerState.records.get(boxId) : null;
        return record?.type === 'stuck' && !record.released;
    }

    getBox(id) {
        return this.boxes.find(b => String(b.id) === String(id)) || this.queue.find(b => String(b.id) === String(id));
    }

    /** Lay toan bo thung dang trong hang cho */
    getQueue() {
        return this.queue;
    }

    /** Hang cho da day (5 slots) */
    isQueueFull() {
        return this.queue.length >= this.maxQueueSize;
    }

    /** Chuyen mot Thung wrapped xuong hang cho */
    moveBoxToQueue(box) {
        if (!box) return false;
        this.boxes = this.boxes.filter(b => String(b.id) !== String(box.id));
        this._removeFromColumn(box.id);

        if (!this.onTrayDelivered) {
            // Che do headless / test khong co UI callback: giao luon neu co khay khop
            const activeTrays = this.conveyor.getAllActiveTrays();
            const matchTray = activeTrays.find(t => t.canAccept(box));
            if (matchTray) {
                matchTray.receiveBox(box);
                this.conveyor.removeTray(matchTray.id);
                if (this.onTrayExited) this.onTrayExited(matchTray.id);
                while (this.tryAutoFillTray()) {}
                if (this.onBoxUpdated) this.onBoxUpdated(box, true);
                this.checkConditions();
                return true;
            }
        }

        // Che do UI: Hop phai vao hang cho truoc, cho Khay di ngang qua moi duoc giao
        if (this.queue.length >= this.maxQueueSize) {
            const activeTrays = this.conveyor.getAllActiveTrays();
            const queueCanClear = this.queue.some(b => activeTrays.some(t => t.canAccept(b))) ||
                                  activeTrays.some(t => t.canAccept(box));
            if (!queueCanClear) {
                this.loseReason = `Hàng chờ đã đầy (${this.maxQueueSize}/${this.maxQueueSize} slots)!`;
                this.setGameState('LOST');
                return false;
            }
        }

        if (!this.queue.some(b => b.id === box.id)) {
            this.queue.push(box);
        }
        if (this.onQueueUpdated) this.onQueueUpdated(this.queue);
        if (this.onBoxUpdated) this.onBoxUpdated(box, true);
        this.checkConditions();
        return true;
    }

    /** Tim cap (box trong hang cho, tray tren conveyor) khop nhau */
    findQueueMatch() {
        const activeTrays = this.conveyor.getAllActiveTrays();
        for (const box of this.queue) {
            const tray = activeTrays.find(t => t.canAccept(box));
            if (tray) return { box, tray };
        }
        return null;
    }

    /** Giao 1 thung tu hang cho vao khay */
    deliverQueueBox(boxId, trayId) {
        const boxIndex = this.queue.findIndex(b => b.id === boxId);
        if (boxIndex === -1) return false;
        const box = this.queue[boxIndex];
        const tray = this.conveyor.getAllActiveTrays().find(t => t.id === trayId);
        if (!tray || !tray.canAccept(box)) return false;

        tray.receiveBox(box);
        this.queue.splice(boxIndex, 1);
        if (this.onQueueUpdated) this.onQueueUpdated(this.queue);

        if (this.onTrayDelivered) {
            this.onTrayDelivered(trayId, box);
        } else {
            this.conveyor.removeTray(trayId);
            if (this.onTrayExited) this.onTrayExited(trayId);
            this.checkConditions();
        }
        return true;
    }

    /** Kiem tra va tu dong fill tu hang cho vao khay */
    tryAutoFillTray() {
        const match = this.findQueueMatch();
        if (match) {
            return this.deliverQueueBox(match.box.id, match.tray.id);
        }
        return false;
    }

    /** ID cac Thung dang o trong tam voi (4 o duoi cung cua moi cot). */
    getVisibleBoxIds() {
        const ids = [];
        for (const col of this.columns) {
            for (let i = 0; i < Math.min(this.visibleRows, col.length); i++) ids.push(col[i]);
        }
        return ids;
    }

    /** Thung dang hien, theo dung thu tu cot/hang — day la thu UI nen ve. */
    getVisibleBoxes() {
        return this.columns.map(col =>
            col.slice(0, this.visibleRows).map(id => this.getBox(id)).filter(Boolean));
    }

    /**
     * Thung nay co cham duoc khong? Thung bi che khoa HOAN TOAN: khong nhac item ra,
     * khong tha item vao, khong keo sang Khay. Moi loi vao cua nguoi choi deu phai
     * di qua day, neu khong se co duong tat cham toi Thung an.
     */
    isAccessible(boxId) {
        for (const col of this.columns) {
            const at = col.findIndex(id => String(id) === String(boxId));
            if (at !== -1) return at < this.visibleRows;
        }
        return false;
    }

    /** Go Thung khoi cot sau khi giao => cot tut xuong, lo Thung ke tiep. */
    _removeFromColumn(boxId) {
        for (const col of this.columns) {
            const at = col.findIndex(id => String(id) === String(boxId));
            if (at !== -1) { col.splice(at, 1); return; }
        }
    }

    // Layer 1: Tap / Drag source item
    selectSource(boxId, slotIndex) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
        if (!this.isAccessible(boxId)) return false;   // Thung bi che
        if (!box || box.isWrapped || box.isEmpty() || slotIndex < 0 || slotIndex >= box.maxSize) {
            return false;
        }
        if (box.slots && box.slots[slotIndex] === null) {
            return false;
        }
        
        this.selectedSource = { boxId, itemIndex: slotIndex };
        this.startClock();
        return true;
    }
    
    deselectSource() {
        this.selectedSource = null;
    }

    /**
     * Di chuyen item truc tiep tu sourceBox (o sourceSlotIndex) sang targetBox (o targetSlotIndex tuy chon).
     */
    moveItem(sourceBoxId, sourceSlotIndex, targetBoxId, targetSlotIndex = null) {
        if (this.gameState !== 'PLAYING') return false;
        if (sourceBoxId === targetBoxId) return false;

        const sourceBox = this.getBox(sourceBoxId);
        const targetBox = this.getBox(targetBoxId);

        if (!sourceBox || !targetBox) return false;
        if (!this.isAccessible(sourceBoxId) || !this.isAccessible(targetBoxId)) return false;
        if (sourceBox.isWrapped || targetBox.isWrapped) return false;
        if (!targetBox.canAccept(targetSlotIndex)) return false;

        const item = sourceBox.removeItem(sourceSlotIndex);
        if (item === null) return false;

        const placed = targetBox.push(item, targetSlotIndex);
        if (!placed) {
            // Hoan tac neu khong dat duoc
            sourceBox.push(item, sourceSlotIndex);
            return false;
        }

        this.startClock();
        this.moveCount++;
        if (this.onMoveCountUpdated) this.onMoveCountUpdated(this.moveCount);

        this.deselectSource();

        // Luat: Thung rong tu dong bien mat, cac thung phia tren tut xuong
        const sourceEmptied = sourceBox.isEmpty();
        if (sourceEmptied) {
            this.boxes = this.boxes.filter(b => b.id !== sourceBox.id);
            this._removeFromColumn(sourceBox.id);
        }

        // Notify UI of box updates
        if (this.onBoxUpdated) {
            this.onBoxUpdated(sourceBox, sourceEmptied);
            this.onBoxUpdated(targetBox);
        }

        // Check if wrapped
        if (targetBox.checkWrapped()) {
            if (this.onBoxWrapped) {
                this.onBoxWrapped(targetBox);
            } else {
                // Che do headless / test khong co UI callback: dua ngay xuong queue va tu dong fill khay neu co
                this.moveBoxToQueue(targetBox);
                while (this.tryAutoFillTray()) {}
                this.checkConditions();
            }
        } else {
            this.checkConditions();
        }

        return true;
    }

    // Layer 1: Tap target
    selectTarget(boxId, targetSlotIndex = null) {
        if (this.gameState !== 'PLAYING' || !this.selectedSource) return false;
        
        // If clicking the same box, just deselect
        if (this.selectedSource.boxId === boxId) {
            this.deselectSource();
            return false;
        }

        return this.moveItem(this.selectedSource.boxId, this.selectedSource.itemIndex, boxId, targetSlotIndex);
    }

    getValidTargets(sourceBoxId) {
        const sourceBox = this.getBox(sourceBoxId);
        if (!sourceBox || sourceBox.isWrapped || sourceBox.isEmpty()) return [];
        
        // Bat ky Thung nao dang trong tam voi va con cho
        return this.boxes
            .filter(b => b.id !== sourceBoxId && b.canAccept() && this.isAccessible(b.id))
            .map(b => b.id);
    }

    // Layer 2: Drag wrapped box
    startDragWrappedBox(boxId) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
        if (!box || !box.isWrapped) return false;
        
        this.draggedBoxId = boxId;
        return true;
    }
    
    cancelDrag() {
        this.draggedBoxId = null;
    }

    // Layer 2: Drop on tray
    dropOnTray(trayId) {
        if (this.gameState !== 'PLAYING' || this.draggedBoxId === null) return false;

        const box = this.getBox(this.draggedBoxId);
        const tray = this.conveyor.getAllActiveTrays().find(t => t.id === trayId);

        if (!tray || !tray.canAccept(box)) {
            return false; // Invalid drop
        }

        // Valid drop
        tray.receiveBox(box);
        
        // Remove box from play area + queue + cho cot tut xuong
        this.boxes = this.boxes.filter(b => b.id !== box.id);
        this.queue = this.queue.filter(b => b.id !== box.id);
        this._removeFromColumn(box.id);
        if (this.onQueueUpdated) this.onQueueUpdated(this.queue);
        
        this.draggedBoxId = null;

        if (this.onTrayDelivered) {
            // Che do UI: Khay chua box tiep tuc chay tren bang chuyen ve cua OUT.
            // Chi khi khay vao trong cua OUT thi khay moi moi duoc go va sinh ra tu cua IN.
            this.onTrayDelivered(trayId, box);
        } else {
            // Che do khong UI (test / headless): go khay ngay lap tuc
            this.conveyor.removeTray(trayId);
            if (this.onTrayExited) this.onTrayExited(trayId);
            while (this.tryAutoFillTray()) {}
            this.checkConditions();
        }
        
        if (this.onBoxUpdated) this.onBoxUpdated(box, true); // True flag for 'removed'

        return true;
    }

    /** Delivered trays still occupy the conveyor until their OUT animation ends. */
    hasPendingTrayExits() {
        return this.conveyor.allTrays.some(tray => tray.isFull());
    }

    /** Goi boi UI khi Khay chua box da di vao trong cua OUT */
    completeTrayExit(trayId) {
        if (!this.conveyor.removeTray(trayId)) return;
        if (this.onTrayExited) this.onTrayExited(trayId);
        if (!this.onTrayDelivered) {
            while (this.tryAutoFillTray()) {}
        }
        this.checkConditions();
    }

    checkConditions() {
        if (this.gameState !== 'PLAYING') return;

        // Check Win
        // All trays cleared, no items left in columns or queue
        const noItemsLeft = (this.boxes.length === 0 || this.boxes.every(b => b.isEmpty())) && this.queue.length === 0;
        if (!this.conveyor.hasRemainingTrays() && noItemsLeft) {
            this.setGameState('WON');
            return;
        }


        // 2. Kiem tra tran hang cho
        if (this.queue.length > this.maxQueueSize) {
            this.loseReason = `Hàng chờ đã đầy (${this.maxQueueSize}/${this.maxQueueSize} slots)!`;
            this.setGameState('LOST');
            return;
        }

        // An accepted delivery is progress, even when no player move remains.
        // Wait for every occupied tray to exit before judging a deadlock: its
        // removal may finish the level or expose the next matching order.
        if (this.hasPendingTrayExits()) return;

        // 3. Kiem tra kha nang giao hang tu hang cho vao khay dang hoat dong
        const activeTrays = this.conveyor.getAllActiveTrays();
        const queueCanDeliver = this.queue.some(b => activeTrays.some(t => t.canAccept(b)));

        // 4. Kiem tra cac thung da goi tren ban: co the giao cho khay HOAC chuyen xuong hang cho neu hang cho con cho
        const reachable = this.boxes.filter(b => this.isAccessible(b.id));
        const reachableWrapped = reachable.filter(b => b.isWrapped);
        const wrappedCanLeaveBoard = reachableWrapped.some(b => 
            activeTrays.some(t => t.canAccept(b)) || this.queue.length < this.maxQueueSize
        );

        // Neu van co thung co the roi ban (giao khay / xuong hang cho) hoac hang cho dang giai phong: game chua the thua
        if (queueCanDeliver || wrappedCanLeaveBoard) {
            return;
        }

        // 5. Kiem tra con nuoc di chuyen hop le nao tren ban co khong
        const unwrappedReachable = reachable.filter(b => !b.isWrapped);
        let canMoveOnBoard = false;
        for (const src of unwrappedReachable) {
            if (src.isEmpty()) continue;
            for (const dst of unwrappedReachable) {
                if (dst.id !== src.id && !dst.isFull()) {
                    canMoveOnBoard = true;
                    break;
                }
            }
            if (canMoveOnBoard) break;
        }

        // 6. Chi khi khong con nuoc di, khong giao duoc khay, va khong dua duoc thung xuong hang cho: moi xem la thua
        if (!canMoveOnBoard) {
            if (this.queue.length >= this.maxQueueSize) {
                this.loseReason = `Hàng chờ đã đầy (${this.maxQueueSize}/${this.maxQueueSize} slots)!`;
            } else {
                this.loseReason = 'Không còn ô trống để hoán đổi đồ vật.';
            }
            this.setGameState('LOST');
            return;
        }
    }
}
