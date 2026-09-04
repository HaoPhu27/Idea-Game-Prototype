import { Box } from './Box.js';
import { Conveyor } from './Conveyor.js';
import { Tray } from './Tray.js';

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
        
        // Callbacks for UI
        this.onBoxUpdated = null;
        this.onBoxWrapped = null;
        this.onQueueUpdated = null;
        this.onTrayExited = null;
        this.onTrayDelivered = null;
        this.onGameStateChanged = null;
        this.onMoveCountUpdated = null;
    }

    startLevel(levelConfig) {
        this.boxes = levelConfig.boxes.map((boxData, idx) => {
            const box = new Box(idx);
            boxData.items.forEach(item => box.push(item));
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
        const emptyBoxes = this.boxes.filter(b => b.isEmpty());
        for (const eb of emptyBoxes) {
            this._removeFromColumn(eb.id);
        }
        this.boxes = this.boxes.filter(b => !b.isEmpty());

        // Reset hang cho (staging queue 5 slots)
        this.queue = [];
        this.loseReason = '';

        // Neu co thung wrapped san (hiem), dua vao queue
        const initialWrapped = this.boxes.filter(b => b.isWrapped);
        for (const wb of initialWrapped) {
            this._removeFromColumn(wb.id);
            this.queue.push(wb);
        }
        this.boxes = this.boxes.filter(b => !b.isWrapped);

        this.selectedSource = null; // { boxId, itemIndex }
        this.draggedBoxId = null;
        this.moveCount = 0;
        // Gioi han nuoc di la RANG BUOC THAT, khong phai trang tri: bo sinh man
        // tinh no tu par (moveLimit = ceil(par * slack)) va do kho cua man da
        // duoc cham diem VOI gia dinh no co hieu luc. Truoc day gia tri nay
        // duoc sinh ra roi bi bo qua, nen man "kho" that ra khong the thua.
        // LUU Y: moveCount chi dem nuoc CHUYEN MON, khong dem luot giao Khay
        // — dung dung nghia par cua bo giai.
        this.moveLimit = (levelConfig.rules && levelConfig.rules.moveLimit) || null;
        this.setGameState('PLAYING');
    }
    
    setGameState(newState) {
        this.gameState = newState;
        if (this.onGameStateChanged) this.onGameStateChanged(newState);
    }

    getBox(id) {
        return this.boxes.find(b => b.id === id) || this.queue.find(b => b.id === id);
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
        this.boxes = this.boxes.filter(b => b.id !== box.id);
        this._removeFromColumn(box.id);

        // Kiem tra neu co khay tren bang chuyen nhan duoc ngay thi giao luon
        const activeTrays = this.conveyor.getAllActiveTrays();
        const matchTray = activeTrays.find(t => t.canAccept(box));
        if (matchTray) {
            matchTray.receiveBox(box);
            if (this.onTrayDelivered) {
                this.onTrayDelivered(matchTray.id, box);
            } else {
                this.conveyor.removeTray(matchTray.id);
                if (this.onTrayExited) this.onTrayExited(matchTray.id);
                while (this.tryAutoFillTray()) {}
            }
            if (this.onBoxUpdated) this.onBoxUpdated(box, true);
            this.checkConditions();
            return true;
        }

        // Neu khong co khay nhan ngay -> phai vao hang cho
        if (this.queue.length >= this.maxQueueSize) {
            this.loseReason = 'Hàng chờ đã đầy (5/5 slots)!';
            this.setGameState('LOST');
            return false;
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
            const at = col.indexOf(boxId);
            if (at !== -1) return at < this.visibleRows;
        }
        return false;
    }

    /** Go Thung khoi cot sau khi giao => cot tut xuong, lo Thung ke tiep. */
    _removeFromColumn(boxId) {
        for (const col of this.columns) {
            const at = col.indexOf(boxId);
            if (at !== -1) { col.splice(at, 1); return; }
        }
    }

    // Layer 1: Tap source item
    selectSource(boxId, itemIndex) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
        if (!this.isAccessible(boxId)) return false;   // Thung bi che
        if (!box || box.isWrapped || box.isEmpty() || itemIndex < 0 || itemIndex >= box.items.length) {
            return false;
        }
        
        this.selectedSource = { boxId, itemIndex };
        return true;
    }
    
    deselectSource() {
        this.selectedSource = null;
    }

    // Layer 1: Tap target
    selectTarget(boxId) {
        if (this.gameState !== 'PLAYING' || !this.selectedSource) return false;
        
        // If clicking the same box, just deselect for now (or could allow sorting within same box if needed, but usually we just deselect)
        if (this.selectedSource.boxId === boxId) {
            this.deselectSource();
            return false;
        }

        const sourceBox = this.getBox(this.selectedSource.boxId);
        const targetBox = this.getBox(boxId);

        if (!sourceBox || !targetBox || !targetBox.canAccept()) {
            return false;
        }
        if (!this.isAccessible(boxId)) return false;   // khong tha vao Thung bi che

        // Perform move
        const item = sourceBox.removeItem(this.selectedSource.itemIndex);
        if (item === null) return false;
        
        targetBox.push(item);
        
        this.moveCount++;
        if (this.onMoveCountUpdated) this.onMoveCountUpdated(this.moveCount);
        
        this.deselectSource();
        
        // Luat moi: Thung rong tu dong bien mat, cac thung phia tren tut xuong
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
            }
        }

        this.checkConditions();
        return true;
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

    /** Goi boi UI khi Khay chua box da di vao trong cua OUT */
    completeTrayExit(trayId) {
        this.conveyor.removeTray(trayId);
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

        // Het nuoc di. Chi ket thuc khi nguoi choi THUC SU khong con gi lam duoc:
        if (this.moveLimit && this.moveCount >= this.moveLimit) {
            const canStillDeliver = this.queue.some(b => this.conveyor.findMatchingTray(b)) ||
                this.boxes.some(b => b && b.isWrapped && this.isAccessible(b.id) && this.conveyor.findMatchingTray(b));
            if (!canStillDeliver) {
                this.loseReason = `Out of moves — the limit is ${this.moveLimit}.`;
                this.setGameState('LOST');
                return;
            }
        }

        // Check Lose: Khong con o trong de hoan doi do vat o thung, HOAC hang cho day ma ban co ket cung
        const reachable = this.boxes.filter(b => this.isAccessible(b.id));
        const activeBoxes = reachable.filter(b => !b.isWrapped && !b.isEmpty());
        const hasEmptySlots = activeBoxes.length === 0 || reachable.some(b => !b.isWrapped && !b.isFull());
        const canDeliver = this.queue.some(b => this.conveyor.findMatchingTray(b)) ||
            reachable.some(b => b.isWrapped && this.conveyor.findMatchingTray(b));

        if (!canDeliver) {
            if (!hasEmptySlots) {
                this.loseReason = 'Không còn ô trống để hoán đổi đồ vật.';
                this.setGameState('LOST');
                return;
            }
            if (this.queue.length > this.maxQueueSize) {
                this.loseReason = 'Hàng chờ đã đầy (5/5 slots)!';
                this.setGameState('LOST');
                return;
            }
        }
    }
}
