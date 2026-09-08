// --- src/data/ItemCatalog.js ---
const ITEM_CATALOG = {
    // 8 nhom hang x 4 loai = 32 loai item.
    //
    // Vi sao mo rong tu 4x3=12 len 8x4=32 (9/2026): duong cong do kho gio ep vao
    // 30 level, va tu L11 tro di ban co luon 9-10 Thung. Voi pool 12 loai thi mot
    // man 9 bo phai dung >= 9/12 pool -> cac man lien tiep gan nhu trung nhau,
    // nguoi choi nhin thay dung mot rem emoji suot ca chang. Pool 32 loai cho phep
    // moi man rut mot lat cat khac han.
    //
    // LUU Y: so loai/nhom KHONG con la hang so 3. Moi cho cham diem hoac clamp
    // dua tren "3 loai" hay "12 loai" phai doc tu catalog (xem MAX_TYPES_PER_CAT
    // trong SolvableLevelGenerator.js), khong duoc hardcode lai.
    categories: [
        {
            id: 'stuffed_animals',
            label: 'Thú nhồi bông',
            icon: '🧸',
            color: '#F26D8C', // Pink
            items: [
                { id: 'bear', emoji: '🧸', label: 'Gấu bông' },
                { id: 'duck', emoji: '🦆', label: 'Vịt bông' },
                { id: 'bunny', emoji: '🐰', label: 'Thỏ bông' },
                { id: 'penguin', emoji: '🐧', label: 'Chim cánh cụt bông' },
            ]
        },
        {
            id: 'food',
            label: 'Đồ ăn',
            icon: '🍔',
            color: '#F59E3C', // Peach / Orange
            items: [
                { id: 'apple', emoji: '🍎', label: 'Táo' },
                { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                { id: 'donut', emoji: '🍩', label: 'Donut' },
                { id: 'burger', emoji: '🍔', label: 'Bánh mì kẹp' },
            ]
        },
        {
            id: 'stationery',
            label: 'Văn phòng phẩm',
            icon: '✏️',
            color: '#4FA8F5', // Light Blue
            items: [
                { id: 'pencil', emoji: '✏️', label: 'Bút chì' },
                { id: 'paperclip', emoji: '📎', label: 'Kẹp giấy' },
                { id: 'scissors', emoji: '✂️', label: 'Kéo' },
                { id: 'ruler', emoji: '📐', label: 'Thước ê ke' },
            ]
        },
        {
            id: 'sports',
            label: 'Thể thao',
            icon: '🏆',
            color: '#3FBF6F', // Light Green
            items: [
                { id: 'soccer', emoji: '⚽', label: 'Bóng đá' },
                { id: 'basketball', emoji: '🏀', label: 'Bóng rổ' },
                { id: 'tennis', emoji: '🎾', label: 'Bóng tennis' },
                { id: 'volleyball', emoji: '🏐', label: 'Bóng chuyền' },
            ]
        },
        {
            id: 'tools',
            label: 'Dụng cụ',
            icon: '🛠️',
            color: '#9AA6B8', // Steel grey
            items: [
                { id: 'hammer', emoji: '🔨', label: 'Búa' },
                { id: 'wrench', emoji: '🔧', label: 'Cờ lê' },
                { id: 'nut_and_bolt', emoji: '🔩', label: 'Ốc vít' },
                { id: 'gear', emoji: '⚙️', label: 'Bánh răng' },
            ]
        },
        {
            id: 'music',
            label: 'Nhạc cụ',
            icon: '🎵',
            color: '#A96BE8', // Plum / Purple
            items: [
                { id: 'guitar', emoji: '🎸', label: 'Đàn ghi ta' },
                { id: 'trumpet', emoji: '🎺', label: 'Kèn trumpet' },
                { id: 'drum', emoji: '🥁', label: 'Trống' },
                { id: 'piano', emoji: '🎹', label: 'Đàn phím' },
            ]
        },
        {
            id: 'kitchen',
            label: 'Đồ bếp',
            icon: '🍳',
            color: '#EFCB3A', // Soft yellow
            items: [
                { id: 'pan', emoji: '🍳', label: 'Chảo' },
                { id: 'cutlery', emoji: '🍴', label: 'Dao dĩa' },
                { id: 'cup', emoji: '☕', label: 'Tách' },
                { id: 'knife', emoji: '🔪', label: 'Dao bếp' },
            ]
        },
        {
            id: 'garden',
            label: 'Cây cảnh',
            icon: '🪴',
            color: '#2FC3AE', // Teal
            items: [
                { id: 'cactus', emoji: '🌵', label: 'Xương rồng' },
                { id: 'sunflower', emoji: '🌻', label: 'Hướng dương' },
                { id: 'mushroom', emoji: '🍄', label: 'Nấm' },
                { id: 'pine', emoji: '🌲', label: 'Cây thông' },
            ]
        }
    ]
};

function getCategoryByItemId(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return cat.id;
            }
        }
    }
    return null;
}

function getItemEmoji(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return item.emoji;
            }
        }
    }
    return '❓';
}

function getCategoryConfig(categoryId) {
    return ITEM_CATALOG.categories.find(c => c.id === categoryId);
}

function getCategoryIcon(categoryId) {
    const cat = getCategoryConfig(categoryId);
    return cat ? cat.icon : '📦';
}


// --- src/core/Box.js ---

class Box {
    constructor(id) {
        this.id = id;
        this.items = []; // Stack of item IDs, max 3. items[0] is bottom, items[items.length-1] is top.
        this.isWrapped = false;
        this.maxSize = 3;
    }

    removeItem(index) {
        if (this.isWrapped || this.items.length === 0 || index < 0 || index >= this.items.length) {
            return null;
        }
        // Remove item at index and shift rest down
        return this.items.splice(index, 1)[0];
    }

    push(itemId) {
        if (this.canAccept()) {
            this.items.push(itemId);
            return true;
        }
        return false;
    }

    canAccept() {
        // GDD v0.3: Target box only needs to have at least 1 empty slot. No type restriction.
        return this.items.length < this.maxSize && !this.isWrapped;
    }

    isFull() {
        return this.items.length === this.maxSize;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    checkWrapped() {
        if (this.isFull() && !this.isWrapped) {
            const firstId = this.items[0];
            const allSame = this.items.every(id => id === firstId);
            if (allSame) {
                this.isWrapped = true;
                return true;
            }
        }
        return false;
    }

    getCategory() {
        if (!this.isWrapped || this.items.length === 0) return null;
        return getCategoryByItemId(this.items[0]);
    }

    /** Loai item cua Thung da wrapped (ca 3 o giong nhau). Dung cho Khay che do 'itemType'. */
    getItemType() {
        if (!this.isWrapped || this.items.length === 0) return null;
        return this.items[0];
    }
    
    clone() {
        const cloned = new Box(this.id);
        cloned.items = [...this.items];
        cloned.isWrapped = this.isWrapped;
        return cloned;
    }
}


// --- src/core/Tray.js ---
class Tray {
    /**
     * @param {string} id
     * @param {string} categoryId   nhom hang Khay nhan (che do 'category')
     * @param {string} targetItemId loai item cu the Khay nhan (che do 'itemType')
     * @param {'category'|'itemType'} matchMode
     *
     * matchMode la mot don bay do kho: 'category' cho phep bat ky Thung nao cung
     * nhom hang; 'itemType' bat dung mot loai. Bo sinh man da phat matchMode tren
     * moi Khay (configForLevelNumber dat 'itemType' tu level 40), nhung truoc day
     * Tray bo qua no va luon so sanh theo categoryId — nghia la level >= 40 duoc
     * hien thi nhu doi item cu the nhung lai nhan bat ky item cung nhom.
     */
    constructor(id, categoryId, targetItemId, matchMode = 'category') {
        this.id = id;
        this.categoryId = categoryId;
        this.targetItemId = targetItemId;
        this.matchMode = matchMode === 'itemType' ? 'itemType' : 'category';
        this.slot = null; // Holds the wrapped Box when received
    }

    canAccept(box) {
        if (!box || !box.isWrapped || this.slot !== null) return false;
        // Luon so sanh theo LOAI ITEM cu the (targetItemId) — khong dung category.
        // Tray hien emoji nao thi CHI nhan box cung emoji do.
        return box.getItemType() === this.targetItemId;
    }

    receiveBox(box) {
        if (this.canAccept(box)) {
            this.slot = box;
            return true;
        }
        return false;
    }

    isFull() {
        return this.slot !== null;
    }
}


// --- src/core/Conveyor.js ---
class Conveyor {
    /**
     * Bang chuyen Khay.
     *
     * CUA SO LA MOT PREFIX CO DINH, KHONG XOAY DUOC — day la mot quyet dinh thiet
     * ke, khong phai thieu sot. Nguoi choi nhin thay maxActive Khay dau hang doi;
     * Khay ke tiep chi troi vao khi mot Khay phia truoc duoc giao xong.
     *
     * Lich su: lop nay tung co rotateLeft()/rotateRight() va mot con tro windowStart.
     * Ca ba deu la DEAD CODE — khong mot cho nao trong game goi toi, windowStart
     * vinh vien bang 0. Chung da bi xoa (9/2026) vi gay hieu nham nghiem trong: doc
     * code thi tuong nguoi choi tiep can duoc moi Khay, thuc te thi khong.
     *
     * DUNG THEM LAI CHUC NANG XOAY neu chua sua bo sinh man: simulateDelivery()
     * trong SolvableLevelGenerator.js cham diem truc trayBacklog dua tren gia dinh
     * prefix co dinh (pending.slice(0, maxActive)). Cho xoay se lam moi Khay deu
     * tiep can duoc, ton kho Khay tut ve gan 0, va toan bo thang diem do kho sai.
     * Neu muon nguoi choi thay truoc hang doi, hay lam mot khu "sap toi" CHI DE XEM
     * thay vi cho xoay cua so — no khong dong toi mo hinh do kho.
     *
     * @param {number} maxActive so Khay hien dien cung luc (bo sinh man quyet dinh:
     *        3 o level lam quen, 5 o hard, 6-7 o super hard).
     */
    constructor(maxActive = 4) {
        this.maxActive = maxActive;
        this.allTrays = [];
    }

    initialize(trays) {
        this.allTrays = [...trays];
    }

    removeTray(trayId) {
        const index = this.allTrays.findIndex(t => t.id === trayId);
        if (index === -1) return false;
        this.allTrays.splice(index, 1);
        return true;
    }

    hasRemainingTrays() {
        return this.allTrays.length > 0;
    }

    /** maxActive Khay dau hang doi. Ngan hon neu con it Khay hon the. */
    getAllActiveTrays() {
        return this.allTrays.slice(0, this.maxActive);
    }

    /**
     * Khay dang hoat dong nhan duoc Thung nay.
     * Nhan ca Thung chu khong chi categoryId, vi Khay che do 'itemType' con
     * phai doi chieu targetItemId — chi so sanh nhom hang la sai o cac level
     * super hard (strictTrayRatio > 0).
     */
    findMatchingTray(box) {
        return this.getAllActiveTrays().find(t => t.canAccept(box));
    }
}


// --- src/core/GameEngine.js ---

class GameEngine {
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

        // Với những level không có box ẩn (không có cột nào vượt quá visibleRows),
        // tính effectiveRows theo chiều cao cột lớn nhất ban đầu để đẩy box lên sát conveyor.
        const hasHidden = this.columns.some(col => col.length > this.visibleRows);
        if (!hasHidden && Number.isFinite(this.visibleRows)) {
            const maxColLen = Math.max(...this.columns.map(col => col.length), 1);
            this.effectiveRows = Math.min(this.visibleRows, maxColLen);
        } else {
            this.effectiveRows = this.visibleRows;
        }

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
        this.moveLimit = null; // Khong gioi han so nuoc di
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
                this.loseReason = 'Hàng chờ đã đầy (5/5 slots)!';
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
                this.checkConditions();
            }
        } else {
            this.checkConditions();
        }

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


        // 2. Kiem tra tran hang cho
        if (this.queue.length > this.maxQueueSize) {
            this.loseReason = 'Hàng chờ đã đầy (5/5 slots)!';
            this.setGameState('LOST');
            return;
        }

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
                this.loseReason = 'Hàng chờ đã đầy (5/5 slots)!';
            } else {
                this.loseReason = 'Không còn ô trống để hoán đổi đồ vật.';
            }
            this.setGameState('LOST');
            return;
        }
    }
}


// --- src/generator/Solver.js ---
/**
 * Solver.js — Kiem chung & do do kho cho Goods Sort (Tray & Conveyor)
 *
 * Thay the BFS cu (Solver.js v0.4) vi BFS bi no branching factor.
 * Cung cap 3 thu:
 *   1. simulate()  — mo phong dung luat GameEngine/Box (nguon su that de verify)
 *   2. heuristic() — can duoi ADMISSIBLE cho so nuoc di con lai
 *   3. solveIDA()  — IDA* tim loi giai TOI UU (dung cho level nho, gan nhan minMoves)
 *
 * Mo hinh state: mang cac box, moi box la mang itemId (do dai 0..capacity).
 * Box "wrapped" <=> box day va 3 item giong nhau (tinh chat cua state, khong can co).
 */

const CAPACITY = 3;

/* ------------------------------------------------------------------ */
/* Luat co ban (khop Box.js / GameEngine.js)                           */
/* ------------------------------------------------------------------ */

function isWrapped(box, cap = CAPACITY) {
  if (box.length !== cap) return false;
  for (let i = 1; i < box.length; i++) if (box[i] !== box[0]) return false;
  return true;
}

/** canAccept() = items.length < maxSize && !isWrapped */
function canAccept(box, cap = CAPACITY) {
  return box.length < cap && !isWrapped(box, cap);
}

/** Dieu kien THUA cua GameEngine: khong con o trong nao tren box chua wrapped */
function isDeadlocked(state, cap = CAPACITY) {
  const active = state.filter((b) => !isWrapped(b, cap) && b.length > 0);
  if (active.length === 0) return false;
  return !state.some((b) => !isWrapped(b, cap) && b.length < cap);
}

/** Thang (tang consolidation): moi box hoac rong hoac wrapped */
function isWinState(state, cap = CAPACITY) {
  return state.every((b) => b.length === 0 || isWrapped(b, cap));
}

/* ------------------------------------------------------------------ */
/* 1. Mo phong — nguon su that de verify solvability                   */
/* ------------------------------------------------------------------ */

/**
 * Chay mot chuoi nuoc di qua dung luat engine.
 * moves: [{ from, index, to }]
 * Tra ve { ok, state, wrapOrder, error, step }
 */
function simulate(initialState, moves, cap = CAPACITY) {
  const state = initialState.map((b) => b.slice());
  const wrapped = new Set();
  const wrapOrder = [];

  for (let s = 0; s < moves.length; s++) {
    const { from, index, to } = moves[s];

    if (from === to) return fail(s, 'from === to');
    if (!state[from] || !state[to]) return fail(s, 'box index ngoai pham vi');
    if (wrapped.has(from)) return fail(s, `box ${from} da wrapped, khong lay item ra duoc`);
    if (index < 0 || index >= state[from].length) return fail(s, 'item index khong hop le');
    if (!canAccept(state[to], cap)) return fail(s, `box ${to} khong nhan them (day hoac wrapped)`);
    if (isDeadlocked(state, cap)) return fail(s, 'state da o trang thai THUA truoc khi di');

    const [item] = state[from].splice(index, 1);
    state[to].push(item);

    // checkWrapped() chi chay tren box dich
    if (!wrapped.has(to) && isWrapped(state[to], cap)) {
      wrapped.add(to);
      wrapOrder.push({ box: to, itemId: state[to][0], step: s });
    }
  }

  return {
    ok: isWinState(state, cap),
    state,
    wrapOrder,
    error: isWinState(state, cap) ? null : 'chuoi nuoc di chay het nhung chua ve win state',
    step: moves.length,
  };

  function fail(step, error) {
    return { ok: false, state, wrapOrder, error, step };
  }
}

/* ------------------------------------------------------------------ */
/* 2. Heuristic admissible                                             */
/* ------------------------------------------------------------------ */

/**
 * h(state) = SUM_t ( soBoxChua(t) - soBoDaySeTaoRa(t) )
 *
 * Chung minh admissible: moi nuoc di doi vi tri DUNG 1 item, nen chi co the
 * giam soBoxChua(t) cua dung 1 loai t di toi da 1, va khong lam giam cua loai
 * khac. Trang thai thang doi hoi soBoxChua(t) === ceil(count(t)/3). Vay h la
 * can duoi hop le, va cung consistent (moi buoc giam toi da 1).
 */
function heuristic(state, cap = CAPACITY) {
  const boxesPerType = new Map();
  const countPerType = new Map();

  for (const box of state) {
    const seen = new Set();
    for (const item of box) {
      countPerType.set(item, (countPerType.get(item) || 0) + 1);
      if (!seen.has(item)) {
        seen.add(item);
        boxesPerType.set(item, (boxesPerType.get(item) || 0) + 1);
      }
    }
  }

  let h = 0;
  for (const [type, nBoxes] of boxesPerType) {
    const target = Math.ceil(countPerType.get(type) / cap);
    h += Math.max(0, nBoxes - target);
  }
  return h;
}

/* ------------------------------------------------------------------ */
/* 3. IDA* — tim loi giai toi uu                                       */
/* ------------------------------------------------------------------ */

function hashState(state) {
  // Hai muc tuong duong can chuan hoa truoc khi hash:
  //   1. Thu tu item TRONG mot box khong co y nghia luat choi (removeItem cho phep
  //      rut o bat ky index nao, wrap chi xet "ca 3 giong nhau") => sort items.
  //   2. Hoan vi giua cac box la tuong duong (box khong co ban sac rieng) => sort boxes.
  // Truoc day chi lam (2), nen ['a','b','a'] va ['a','a','b'] — CUNG mot trang thai —
  // lai ra 2 hash khac nhau, pha vo transposition table va lam IDA*/greedy no node.
  const boxes = new Array(state.length);
  for (let i = 0; i < state.length; i++) boxes[i] = state[i].slice().sort().join(',');
  return boxes.sort().join('|');
}

/**
 * Min-heap nhi phan cho hang doi uu tien cua solveGreedy.
 * Truoc day frontier duoc sort() lai TOAN BO moi vong lap roi shift() —
 * O(n log n) cho moi lan pop va O(n) cho moi lan shift. Voi frontier vai chuc
 * nghin node, day la diem nghen chinh. Heap cho push/pop O(log n).
 */
class MinHeap {
  constructor(cmp) {
    this.cmp = cmp;
    this.a = [];
  }
  get size() {
    return this.a.length;
  }
  push(v) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

/**
 * IDA* tim so nuoc di toi uu. Dung cho level nho (<= ~9 box) de gan nhan do kho.
 * opts: { maxNodes, maxDepth, timeBudgetMs }
 * Tra ve { solved, moves, nodes, cutoff }
 *   cutoff = true nghia la het ngan sach, KHONG ket luan duoc.
 */
function solveIDA(initialState, opts = {}) {
  const cap = opts.capacity ?? CAPACITY;
  const maxNodes = opts.maxNodes ?? 400000;
  const maxDepth = opts.maxDepth ?? 40;
  const deadline = Date.now() + (opts.timeBudgetMs ?? 3000);

  let nodes = 0;
  let cutoff = false;
  let bound = heuristic(initialState, cap);
  const path = [];

  while (bound <= maxDepth) {
    const visited = new Map();
    const t = dfs(initialState.map((b) => b.slice()), 0, bound, visited);
    if (t === 'FOUND') return { solved: true, moves: path.slice(), nodes, cutoff: false, optimal: true };
    if (t === Infinity) return { solved: false, moves: null, nodes, cutoff, optimal: false };
    if (cutoff) return { solved: false, moves: null, nodes, cutoff: true, optimal: false };
    bound = t;
  }
  return { solved: false, moves: null, nodes, cutoff: true, optimal: false };

  function dfs(state, g, bound, visited) {
    if (++nodes > maxNodes || Date.now() > deadline) {
      cutoff = true;
      return Infinity;
    }
    const h = heuristic(state, cap);
    const f = g + h;
    if (f > bound) return f;
    if (h === 0 && isWinState(state, cap)) return 'FOUND';

    const key = hashState(state);
    const prev = visited.get(key);
    if (prev !== undefined && prev <= g) return Infinity;
    visited.set(key, g);

    let min = Infinity;
    for (const mv of generateMoves(state, cap)) {
      const [item] = state[mv.from].splice(mv.index, 1);
      state[mv.to].push(item);
      path.push(mv);

      const t = dfs(state, g + 1, bound, visited);

      if (t === 'FOUND') return 'FOUND';
      if (t < min) min = t;

      path.pop();
      state[mv.to].pop();
      state[mv.from].splice(mv.index, 0, item);

      if (cutoff) return Infinity;
    }
    return min;
  }
}

/**
 * Sinh nuoc di co PRUNING manh (day la cho BFS cu chet):
 *  - Bo qua box nguon wrapped / rong.
 *  - Trong 1 box nguon, moi LOAI item chi thu 1 lan (cac ban sao la tuong duong).
 *  - Trong cac box dich RONG, chi thu 1 cai (cac box rong la tuong duong).
 *  - Bo nuoc di lam "phang" (dua item ra khoi box ma no dang o cung dong loai
 *    voi >= 2 ban sao) — huu ich nhung KHONG dung cho IDA* toi uu, nen tat.
 */
function generateMoves(state, cap = CAPACITY) {
  const moves = [];
  const emptyTargets = [];
  const openTargets = [];

  for (let i = 0; i < state.length; i++) {
    if (!canAccept(state[i], cap)) continue;
    if (state[i].length === 0) emptyTargets.push(i);
    else openTargets.push(i);
  }
  const targets = openTargets.concat(emptyTargets.length ? [emptyTargets[0]] : []);

  for (let from = 0; from < state.length; from++) {
    const box = state[from];
    if (box.length === 0 || isWrapped(box, cap)) continue;

    const seenType = new Set();
    for (let index = 0; index < box.length; index++) {
      const item = box[index];
      if (seenType.has(item)) continue; // cac ban sao trong cung box la tuong duong
      seenType.add(item);

      for (const to of targets) {
        if (to === from) continue;
        // Khong dua item duy nhat ra khoi box rong roi (vo nghia)
        if (box.length === 1 && state[to].length === 0) continue;
        moves.push({ from, index, to });
      }
    }
  }
  return moves;
}

/* ------------------------------------------------------------------ */
/* Greedy fallback: kiem tra nhanh "co giai duoc khong" khong can toi uu */
/* ------------------------------------------------------------------ */

/**
 * Best-first (greedy) theo h. Nhanh, dung de sanity-check level lon.
 * Khong dam bao toi uu, khong dam bao tim ra loi giai neu co.
 */
function solveGreedy(initialState, opts = {}) {
  const cap = opts.capacity ?? CAPACITY;
  const maxNodes = opts.maxNodes ?? 60000;
  const start = initialState.map((b) => b.slice());
  const visited = new Set([hashState(start)]);
  const frontier = new MinHeap((a, b) => a.f - b.f || a.moves.length - b.moves.length);
  frontier.push({ state: start, moves: [], f: heuristic(start, cap) });
  let nodes = 0;

  while (frontier.size && nodes < maxNodes) {
    const cur = frontier.pop();
    nodes++;
    if (isWinState(cur.state, cap)) return { solved: true, moves: cur.moves, nodes };

    for (const mv of generateMoves(cur.state, cap)) {
      const ns = cur.state.map((b) => b.slice());
      const [item] = ns[mv.from].splice(mv.index, 1);
      ns[mv.to].push(item);
      const key = hashState(ns);
      if (visited.has(key)) continue;
      visited.add(key);
      frontier.push({
        state: ns,
        moves: cur.moves.concat(mv),
        f: cur.moves.length + 1 + heuristic(ns, cap) * 1.5, // weighted A*
      });
    }
  }
  return { solved: false, moves: null, nodes };
}

/* ------------------------------------------------------------------ */
/* 4. Loi giai KIEN THIET — tra loi cau hoi mo GDD 8.2 / #15           */
/* ------------------------------------------------------------------ */

/**
 * DINH LY (giai duoc)
 * -------------------
 * Xet ban choi: N Thung suc chua 3, tong so item = 3*S (S bo, moi bo 3 item
 * cung loai), luat dat item KHONG rang buoc loai. Goi F = tong so o trong.
 *
 *   (1) F la boi so cua 3  (vi F = 3N - 3S).
 *   (2) F la BAT BIEN: moi nuoc di lay 1 item khoi box nay va dat vao box kia,
 *       nen tong so o trong khong doi. Wrap cung khong doi F (box wrapped da day).
 *   (3) Neu F >= 3 thi ban choi LUON giai duoc, va giai duoc trong <= 4*S nuoc.
 *
 * Chung minh (3) bang quy nap theo S, kem thuat toan duoi day:
 *   - Chon loai t bat ky con dang do, chon Thung X (chua wrapped) dang giu
 *     nhieu ban sao t nhat.
 *   - "Don nha" X: day tung item khac loai t ra khoi X sang mot Thung khac con
 *     o trong. Moi lan day, F khong doi; vi X ban dau co toi da 2 item khac t,
 *     nen can toi da 2 nuoc, va luon ton tai o trong ngoai X:
 *         F = 3 => truoc khi don, o trong ngoai X >= 3 - (o trong trong X);
 *         moi lan day chi tieu 1 o ngoai va tra lai 1 o trong X, nen tong o
 *         trong ngoai X giam nhieu nhat 1 moi lan, luon con >= 1 cho lan sau.
 *   - "Gom": keo cac ban sao t con lai vao X (toi da 2 nuoc). X day 3 item
 *     cung loai => wrapped, khoa cung, khong con tham gia.
 *   - Bo t da xong. Con lai la ban choi voi S-1 bo tren N-1 Thung, F van = F.
 *     Ap dung quy nap.
 *   => Tong <= 4 nuoc / bo.
 *
 * HE QUA THIET KE:
 *   a) Gia dinh trong LevelGenerator.js ("co 1 Box rong => giai duoc") la DUNG,
 *      va con manh hon: chi can F >= 3, tuc N >= S + 1. Khong can solver de
 *      verify solvability nua.
 *   b) Nguoc lai: dieu kien THUA cua GDD gan nhu khong the xay ra khi F >= 3
 *      => bang chung cho thay can lever do kho khac (gioi han nuoc di/thoi gian).
 *   c) Ham nay dung lam HE THONG GOI Y (hint) va luoi an toan chong ket:
 *      chay O(S) chu khong phai O(b^d), khong bao gio freeze UI.
 *
 * Tra ve { solved, moves, reason }
 */
function solveConstructive(initialState, cap = CAPACITY) {
  const state = initialState.map((b) => b.slice());
  const moves = [];
  const done = new Set(); // index box da wrapped

  for (let i = 0; i < state.length; i++) if (isWrapped(state[i], cap)) done.add(i);

  const guardMax = state.length * cap * 8;
  let guard = 0;

  while (!isWinState(state, cap)) {
    if (++guard > guardMax) return { solved: false, moves, reason: 'vuot gioi han vong lap' };

    // 1. Chon (loai t, Thung X): Thung chua wrapped dang giu nhieu ban sao t nhat.
    //    Tong so ban sao moi loai duoc dem MOT LAN cho ca vong lap (O(N*cap)).
    //    Truoc day total duoc dem lai bang mot quet toan cuc BEN TRONG vong lap
    //    (loai t) BEN TRONG vong lap (box i) => O(N^2 * cap^2) moi buoc.
    const totals = new Map();
    for (let j = 0; j < state.length; j++) {
      if (done.has(j)) continue;
      for (const it of state[j]) totals.set(it, (totals.get(it) || 0) + 1);
    }

    let best = null;
    const cnt = new Map();
    for (let i = 0; i < state.length; i++) {
      if (done.has(i) || state[i].length === 0) continue;
      cnt.clear();
      for (const it of state[i]) cnt.set(it, (cnt.get(it) || 0) + 1);
      for (const [t, c] of cnt) {
        // chi chon t neu tong ban sao t o cac box CHUA wrapped >= cap
        if ((totals.get(t) || 0) < cap) continue;
        const score = c * 10 - state[i].length; // nhieu t + it rac = tot
        if (!best || score > best.score) best = { box: i, type: t, have: c, score };
      }
    }
    if (!best) return { solved: false, moves, reason: 'khong tim duoc bo nao con hoan thanh duoc' };

    const X = best.box;
    const t = best.type;

    // 2. Don nha: day item khac loai t ra khoi X
    for (let k = state[X].length - 1; k >= 0; k--) {
      if (state[X][k] === t) continue;
      const to = pickRoom(state, X, done, cap);
      if (to == null) return { solved: false, moves, reason: `khong con o trong ngoai Thung ${X} de don rac` };
      const [item] = state[X].splice(k, 1);
      state[to].push(item);
      moves.push({ from: X, index: k, to, itemId: item });
      if (isWrapped(state[to], cap)) done.add(to);
    }

    // 3. Gom cac ban sao t con lai vao X
    while (state[X].length < cap) {
      let src = -1, idx = -1;
      for (let j = 0; j < state.length && src < 0; j++) {
        if (j === X || done.has(j)) continue;
        const k = state[j].indexOf(t);
        if (k >= 0) { src = j; idx = k; }
      }
      if (src < 0) return { solved: false, moves, reason: `thieu ban sao loai ${t}` };
      const [item] = state[src].splice(idx, 1);
      state[X].push(item);
      moves.push({ from: src, index: idx, to: X, itemId: item });
    }
    done.add(X); // X gio la 3 item cung loai => wrapped
  }

  return { solved: true, moves, reason: null };

  function pickRoom(st, exclude, doneSet, capacity) {
    let bestIdx = null, bestLoad = -1;
    for (let i = 0; i < st.length; i++) {
      if (i === exclude || doneSet.has(i)) continue;
      if (st[i].length >= capacity) continue;
      // uu tien box dang DAY nhat (dồn rac lai, giu box rong cho viec quan trong)
      if (st[i].length > bestLoad) { bestLoad = st[i].length; bestIdx = i; }
    }
    return bestIdx;
  }
}


// --- src/generator/SolvableLevelGenerator.js ---
/**
 * SolvableLevelGenerator.js
 * Sinh level Goods Sort (Tray & Conveyor) DAM BAO GIAI DUOC theo cau truc.
 *
 * ============================================================================
 * v2 (9/2026) — SINH NGUOC TRUC TIEP TREN BO CUC COT
 * ============================================================================
 *
 * Ban truoc sinh mot dong Thung "phang" roi MOI xep vao cot (assignLayout) va loc
 * lai bang simulateWithLayout. Cach do chi song duoc khi gan het Thung deu nhin
 * thay: voi 3 cot x 4 hang = 12 o hien, mot ban 60 Thung co 48 Thung bi che, va xac
 * suat mot loi giai sinh ngau nhien khong bao gio cham vao Thung bi che la ~0. Bo
 * sinh se quay het maxAttempts roi nem loi.
 *
 * NAY BO CUC LA MOT PHAN CUA PHEP SINH. Ta xay nguoc tu trang thai THANG va moi
 * "nuoc di nguoc" deu duoc kiem tra tren dung cot/hang cua no:
 *
 *   Trang thai nguoc tai buoc τ  ==  trang thai xuoi tai thoi diem (T − τ).
 *
 * Vi vay chi can moi nuoc di nguoc chi cham vao Thung DANG HIEN (index < visibleRows
 * trong cot cua no) thi khi phat lai xuoi, moi nuoc deu hop le. Tinh giai duoc VA
 * tinh choi duoc deu la BAT BIEN CAU TRUC, khong phai ket qua cua search.
 *
 * BA PHEP DI NGUOC (nghich dao dung ba su kien xuoi cua GameEngine):
 *
 *   R1. un-deliver — nghich dao cua "Thung goi xong -> vao hang cho -> giao Khay".
 *       Tao mot Thung MOI chua 3 item cung loai, CHEN vao cot o vi tri p < visibleRows,
 *       va them mot Khay vao DAU hang doi Khay. Cac Thung tu p tro len bi day len 1
 *       nac — chinh la nghich dao cua "cot tut xuong khi mot Thung roi khoi cot".
 *
 *   R2. un-move — nghich dao cua "keo 1 item tu Thung A sang Thung B".
 *       Rut 1 item tu Thung `from` bo sang Thung `to`; ca hai deu phai dang hien.
 *       Nuoc xuoi tuong ung la `to -> from`.
 *
 *   R3. un-vanish — nghich dao cua "Thung het item thi bien mat, cot tut xuong".
 *       Tao mot Thung MOI chi co 1 item (rut tu mot Thung dang hien) roi chen vao cot.
 *       Xuoi: nguoi choi keo item duy nhat do di, Thung rong -> bien mat -> cot tut.
 *       Day la NGUON DUY NHAT sinh ra o trong: moi lan dung tang tong o trong len 3.
 *
 * ============================================================================
 * HAI HE QUA DINH LUONG QUAN TRONG
 * ============================================================================
 *
 * (1) SO O TRONG LA MOT HANG SO CUC BO, KHONG PHU THUOC KICH CO BAN.
 *     Goi S = so bo 3 item (= so Khay), E = so Thung "chuyen tiep" sinh boi R3.
 *     Tong so Thung N = S + E, tong item = 3S, nen tong o trong = 3(N − S) = 3E.
 *     R2 khong tao cung khong xoa o trong (bit o ben nay, mo o ben kia) nen 3E la
 *     bat bien suot ca qua trinh. Va vi R2 chi cham duoc Thung DANG HIEN, so o trong
 *     "dung duoc" luon quanh quan trong cua so 12 Thung.
 *     => carrierBoxes (E) la can gat DO CHAT khong gian xoay xo, DOC LAP voi N:
 *        E=1 (3 o trong) ngat tho, E=2 (6 o) chat, E=3 (9 o) vua, E=4 (12 o) rong.
 *     => Phong to ban KHONG lam man de hon, cung khong lam kho hon — chi dai hon.
 *        Do kho phai den tu cho khac: xem phan THIET KE DO KHO ben duoi.
 *
 * (2) parMoves = refMoves = SO NUOC DI TOI UU (khong can chay IDA*).
 *     Moi bo s duoc rai ra d_s Thung (d ∈ {2,3}) bang dung d_s − 1 lan R2/R3, va
 *     khong item nao bi di chuyen hai lan. Xuoi, moi item lac phai duoc keo ve it
 *     nhat 1 lan, nen Σ(d_s − 1) vua la CHAN DUOI vua la do dai loi giai tham chieu
 *     => no CHINH LA toi uu. Ban truoc phai chay IDA* (va chi chay noi khi N ≤ 10)
 *     roi doan par tu lowerBound+1; nay par la con so chinh xac o MOI kich co ban,
 *     nen `moveLimit = ceil(par * slack)` cuoi cung cung dung nghia.
 *
 * ============================================================================
 * THIET KE DO KHO (9/2026) — KHO VI THONG TIN BI GIAU, KHONG VI DAI
 * ============================================================================
 *
 * Yeu cau san pham cho tier hard:
 *   - 50-70 Thung tren ca ban, nhung LUC NAO cung chi 3 x 4 = 12 Thung nhin thay
 *     duoc; phan con lai bi che HOAN TOAN (khong keo item vao/ra, khong giao).
 *   - Vung nhin thay o duoi day dac item lan lon cua nhieu bo khac nhau; thuong chi
 *     1-2 bo gom du 3 item ngay trong vung do.
 *   - Item con thieu cua cac bo khac nam trong Thung BI CHE phia tren. Muon lo ra
 *     thi phai giao/don bot Thung phia duoi cho cot tut xuong.
 *   => Vong lap that su: "goi duoc bo nao truoc -> giao -> cot tut -> lo tai nguyen
 *      moi -> goi tiep bo nao". Sai thu tu la ket.
 *
 * Bo sinh cai dat dieu do bang hai chinh sach chon vi tri (xem buildDeep):
 *   - bottomBias: Thung moi thien ve chen o DAY cot => Thung sinh SOM trong pha nguoc
 *     (tuc giai MUON khi choi) bi day len cao => bi che luc spawn.
 *   - buryBias: item lac uu tien do vao Thung dang SAT MEP tam voi (index gan
 *     visibleRows−1), tuc Thung sap bi che => xuoi la "tai nguyen nam tang tren,
 *     phai khoi thong moi lay duoc".
 *
 * Cac tier con lai deu la MOT DIEM tren cung mot truc do, xem configForLevelNumber.
 */


/* ------------------------------------------------------------------ */
/* Item Catalog (khop GDD 9.2 / ItemCatalog.js)                        */
/* ------------------------------------------------------------------ */

// Catalog duy nhat cua game la ItemCatalog.js — derive truc tiep de khong the lech.
const CATEGORIES = ITEM_CATALOG.categories.map((c) => ({
  id: c.id,
  name: c.label,
  color: c.color,
  items: c.items.map((i) => ({ id: i.id, emoji: i.emoji })),
}));

const TYPE_INDEX = new Map();
for (const cat of CATEGORIES) {
  for (const it of cat.items) {
    TYPE_INDEX.set(it.id, { ...it, categoryId: cat.id, color: cat.color });
  }
}
const getTypeInfo = (id) => TYPE_INDEX.get(id);

const MAX_TYPES_PER_CAT = Math.max(...CATEGORIES.map((c) => c.items.length));
const TOTAL_TYPES = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  seed: 1,

  // --- Quy mo ban choi ---
  numBoxes: 12,           // tong so Thung tren ca ban, KE CA phan bi che
  boxCapacity: 3,         // GDD: co dinh 3
  numSets: null,          // so bo 3 item = so Khay. null => numBoxes - carrierBoxes

  // So Thung "chuyen tiep" (sinh boi R3). Xem he qua (1) o dau file:
  // tong o trong = 3 * carrierBoxes, va con so nay KHONG doi theo numBoxes.
  carrierBoxes: 3,

  // --- BO CUC KHU THUNG ---
  // `columns` cot; moi cot chi hien `visibleRows` Thung duoi cung, phan tren BI CHE
  // va KHOA HOAN TOAN. Thung roi khoi cot khi duoc giao cho Khay HOAC khi het item.
  columns: 3,
  visibleRows: 4,

  // --- Item pool ---
  numCategories: 3,        // 1..CATEGORIES.length
  itemTypesPerCategory: 2, // 1..MAX_TYPES_PER_CAT
  maxSetsPerType: null,    // null => tu tinh tu numSets / poolSize

  // --- DO KHO: do phan tan cua tung bo ---
  // LUU Y KHI CHINH LO TRINH: ratio21 phai LIEN TUC qua ranh gioi tier. Ban dau
  // onboarding ket thuc o 0.70 con acclimation bat dau lai o 0.78 (DE hon), nen L11 cham
  // diem THAP hon L10 du no nhieu Thung bi che hon — mot buoc lui hien ra ngay tren
  // bang xep hang do kho.
  ratio21: 0.6,           // ti le bo kieu "2+1" (2 item chung Thung, 1 tach ra); con
                          // lai la "1+1+1". Phan tich 4501 level that: 60.3%/39.7%.
                          // 1.0 = de nhat. Cung la can gat DO DAI:
                          // refMoves = S * (2 − ratio21).

  // --- DO KHO: chon vi tri (dac trung cua v2) ---
  //
  // BAT BIEN CAU TRUC cua phep sinh nguoc: mot item lac luon duoc dat vao Thung DA CO
  // tren ban tai thoi diem Thung "nha" cua no vua duoc chen. Vi phep chen khong bao gio
  // dao thu tu cac Thung san co TRONG CUNG MOT COT, item lac luon nam TREN nha cua no
  // neu hai Thung cung cot. Do la ly do man choi co dang "tai nguyen o tang tren".
  // Khi hai Thung khac cot thi thu tu lo ra do toc do lon cua tung cot quyet dinh —
  // day chinh la cho bottomBias can thiep.
  // Tran so bo giai duoc NGAY trong vung nhin thay luc spawn ("cua mo dau"). Yeu cau
  // san pham cho hard/super hard la 1-2; man de hon can nhieu cua hon de khong bi ket
  // ngay tu dau. null = khong loc. Bo sinh xay lai voi seed khac cho toi khi dat.
  maxOpeningSets: null,
  buryBias: 0.2,          // do THIEN VI khi chon Thung nhan item lac: trong so cua mot
                          // Thung o hang `at` la (1 + 3*buryBias)^at, tuc cang cao thi
                          // item lac cang don len hang tren cung cua tam voi.
                          // Do duoc: can gat nay YEU hon bottomBias nhieu (thay doi
                          // 0.05 -> 0.9 chi lam so bo mo dau nhuc nhich ±1), vi item lac
                          // dat o hang nao thi cung se bi day len khi cot moc them.
                          // Giu thap de item lac trai deu ca vung nhin thay — trong mat
                          // nguoi choi la "day Thung duoi lan lon du thu".
  bottomBias: 0.35,       // xac suat Thung moi duoc chen thang xuong DAY cot (p = 0);
                          // phan con lai chen len p = 1..visibleRows−1.
                          //
                          // CANG THAP CANG KHO, va day la don bay manh nhat doi voi
                          // "so bo giai duoc ngay trong vung nhin thay". Thung "nha"
                          // duoc chen cao thi chi can vai lan chen nua la no chim vao
                          // vung bi che, trong khi cac item lac cua no (nam o cot khac,
                          // vi tri thap) van con hien => nguoi choi nhin thay mot dong
                          // do lac ma CHUA co Thung nao de gom chung vao.
                          // Do tren cau hinh hard (60 Thung, 25 seed):
                          //   bottomBias | so bo giai duoc ngay (min/tb/max)
                          //      0.20    |        4 / 4.8 / 5
                          //      0.45    |        5 / 6.0 / 7
                          //      0.70    |        6 / 7.9 / 10
                          //      0.95    |        6 / 8.0 / 10

  // --- Tray / Conveyor ---
  trayMatchMode: 'category', // 'category' | 'itemType'
  strictTrayRatio: null,     // null = suy ra tu trayMatchMode (0 hoac 1)
  // Thu tu Khay BAT BUOC bam theo thu tu giao hang cua loi giai tham chieu — neu
  // khong, mot Thung goi xong se khong co Khay nao nhan va nam lai chiem hang cho.
  // Chi duoc hoan vi TRONG TUNG KHOI kich thuoc <= conveyorMaxActive: khi do Khay can
  // toi luon con trong cua so, nhung nguoi choi van khong doan duoc thu tu chinh xac.
  trayJitter: true,
  conveyorMaxActive: 3,
  conveyorType: 'oval',
  queueCapacity: 5,          // = GameEngine.maxQueueSize; mo phong dung luat thua

  // --- Ap luc meta ---
  moveLimitSlack: null,   // null = khong gioi han. 1.6 = de, 1.15 = kho
  secondsPerMove: null,   // null = khong gioi han
  undoCount: 3,

  // --- Van hanh ---
  maxAttempts: 250,
  verify: true,           // replay loi giai qua mo phong DAY DU truoc khi tra ve
};

// Preset "khung" cho test/demo. Lo trinh 50 man chinh thuc o configForLevelNumber.
const PRESETS = {
  tutorial:  { numBoxes: 6,  carrierBoxes: 3, numCategories: 1, itemTypesPerCategory: 2, ratio21: 1.0,  conveyorMaxActive: 4 },
  easy:      { numBoxes: 12, carrierBoxes: 3, numCategories: 2, itemTypesPerCategory: 2, ratio21: 0.85, conveyorMaxActive: 4, moveLimitSlack: 1.8 },
  normal:    { numBoxes: 30, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 3, ratio21: 0.65, conveyorMaxActive: 3, moveLimitSlack: 1.5 },
  hard:      { numBoxes: 56, carrierBoxes: 2, numCategories: 5, itemTypesPerCategory: 3, ratio21: 0.62, conveyorMaxActive: 2, trayMatchMode: 'itemType', moveLimitSlack: 1.35, undoCount: 2 },
  superhard: { numBoxes: 76, carrierBoxes: 2, numCategories: 6, itemTypesPerCategory: 3, ratio21: 0.55, conveyorMaxActive: 1, trayMatchMode: 'itemType', moveLimitSlack: 1.25, undoCount: 1 },
};

/* ------------------------------------------------------------------ */
/* RNG co seed (mulberry32) — level tai lap duoc                       */
/* ------------------------------------------------------------------ */

function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (rng, n) => Math.floor(rng() * n);
const pick = (rng, arr) => arr[randInt(rng, arr.length)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const range = (n) => Array.from({ length: n }, (_, i) => i);

function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPick(rng, items, weightFn) {
  let total = 0;
  const w = items.map((it) => {
    const x = Math.max(0, weightFn(it));
    total += x;
    return x;
  });
  if (total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= w[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/* ------------------------------------------------------------------ */
/* API chinh                                                           */
/* ------------------------------------------------------------------ */

function generateLevel(userConfig = {}) {
  const cfg = normalizeConfig(userConfig);

  // HAI PHA. Pha 1 ep dung tran `maxOpeningSets` (so bo giai duoc ngay trong vung nhin
  // thay). Voi ban 68-80 Thung, tran do khong phai lan xay nao cung dat: do tren khung
  // hard, phan bo la 2..9 bo mo dau nen tran 4 truot khoang 1/3 seed.
  //
  // Pha 2 bo tran do di. Do la NHUONG BO CO CHU Y: mot man co 5 bo mo dau thay vi 4 van
  // giu nguyen so Thung bi che, cua so Khay va do chat o trong — con nem loi thi
  // LevelGenerator se bat lay va noi long carrierBoxes, tuc doi ra mot man DE HON HAN.
  // Nhuong mot don vi o truc yeu nhat con hon nhuong ca truc manh nhat.
  const phase1 = Math.ceil(cfg.maxAttempts * 0.6);

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    const rng = makeRng(cfg.seed + attempt * 7919);
    const built = buildDeep(cfg, rng);
    if (!built) continue;

    const relaxed = attempt >= phase1 ? { ...cfg, maxOpeningSets: null } : cfg;
    const level = finalize(relaxed, built, attempt);
    if (level) return level;
  }

  throw new Error(
    `generateLevel: khong sinh duoc level hop le sau ${cfg.maxAttempts} lan thu ` +
      `(numBoxes=${cfg.numBoxes} numSets=${cfg.numSets} carrierBoxes=${cfg.carrierBoxes} ` +
      `layout=${cfg.columns}x${cfg.visibleRows}).`
  );
}

function generateLevelFromPreset(presetName, overrides = {}) {
  const preset = PRESETS[presetName];
  if (!preset) throw new Error(`Preset khong ton tai: ${presetName}`);
  return generateLevel({ ...preset, ...overrides });
}

/**
 * Seed da TUYEN CHON cho 50 level chinh thuc (tools/curate50.mjs, 9/2026).
 *
 * configForLevelNumber chi quyet dinh KHUNG cua mot man. Hai man cung khung ma khac
 * seed lech nhau rat xa: do tren khung hard (52 Thung), 16 seed cho ty le thua tu 25%
 * den 85%. Vi vay 50 man nay khong duoc sinh ngau nhien luc chay: moi man da duoc quet
 * 40 seed, do bang 16 van sang loc va 40 van xac nhan duoi chinh sach "planner"
 * (GameSim: nguoi choi nhin cua so Khay + hang cho, khong nhin Thung bi che, khong tim
 * kiem), roi chot lai seed nao roi dung vao dai ty le thua muc tieu cua tier do.
 *
 *   tier        | ty le thua do duoc
 *   tutorial    |   0%
 *   onboarding  |   3%
 *   acclimation |  3-10%
 *   normal      | 18-33%
 *   hard        |  70%
 *   super hard  |  93%
 *
 * Doi mot so o day = doi han man choi do. Neu sua, chay lai tools/curate50.mjs va cap
 * nhat ca tools/levels50.json.
 */
const LEVEL_SEEDS = {
  1: 506952114, 2: 506952114, 3: 506952114, 4: 506952114, 5: 1013904228,
  6: 267601732, 7: 1520856342, 8: 387276923, 9: 1520856342, 10: 2027808456,
  11: 1013904228, 12: 1908133265, 13: 415528273, 14: 506952114, 15: 506952114,
  16: 2027808456, 17: 1520856342, 18: 1788458074, 19: 1520856342, 20: 1281505960,
  21: 267601732, 22: 267601732, 23: 1429432501, 24: 1429432501, 25: 1161830769,
  26: 1549107692, 27: 387276923, 28: 387276923, 29: 1520856342, 30: 535203464,
  31: 1042155578, 32: 1520856342, 33: 1520856342, 34: 1281505960, 35: 1908133265,
  36: 950731737, 37: 654878655, 38: 1668782883, 39: 1281505960, 40: 1577359042,
  41: 1520856342, 42: 1936384615, 43: 563454814, 44: 415528273, 45: 1281505960,
  46: 654878655, 47: 1013904228, 48: 894229037, 49: 387276923, 50: 802805196,
};

/**
 * Lo trinh do kho theo level number — nguon su that DUY NHAT cho cau hoi
 * "level N kho the nao" (UIManager chi truyen levelNumber vao day).
 *
 * ==== BAN THIET KE 9/2026 (v3): DO KHO = SO THUNG BI CHE ====
 *
 *   L1..L5    TUTORIAL.    Toan bo ban nam gon trong 3x4 o hien. Khong co gi bi che,
 *                          Khay chi doi dung NHOM hang, o trong rong rai (E = 3..4).
 *   L6..L10   ONBOARDING.  Ban vua trum qua 12 o -> lan dau tien co Thung bi che,
 *                          nhung chi vai Thung va cua so Khay con rong (4 -> 3).
 *   L11..L20  LAM QUEN.    Phan bi che lon dan (10 -> 22 Thung). Tu L16 Khay bat dau
 *                          doi dung LOAI item, gioi han nuoc di siet lai.
 *   L21..L49  Duoi 5 = HARD (25/35/45). Duoi 9 = SUPER HARD (29/39/49). Con lai thuong.
 *
 * BANG CHOT (columns = 3, visibleRows = 4 o MOI tier — vung nhin thay luon la 12 o):
 *
 *     tier        | Thung   | bi che | E | cua so | Khay        | par
 *     tutorial    |  4-12   |   0    | 3 |   4    | nhom        |   2-11
 *     onboarding  | 14-20   |  2-8   | 3 |  4->3  | nhom        |  13-21
 *     acclimation | 22-34   | 10-22  | 3 |   3    | nhom -> loai|  23-40
 *     normal      | 34-46   | 22-34  | 2 |   3    | 55-90% loai |  40-60
 *     hard        | 52-68   | 40-56  | 2 |   2    | 100% loai   |  63-90
 *     super hard  | 72-80   | 60-68  | 2 |   1    | 100% loai   |  95-115
 *
 * VI SAO BA CAN GAT NAY, KHONG PHAI CAI KHAC:
 *
 *   - SO THUNG BI CHE la don bay chinh va la don bay DUY NHAT ti le thuan voi
 *     numBoxes. No lam kho MA KHONG lam roi: nguoi choi khong bi bat bam them nuoc
 *     di, ho bi bat lap ke hoach voi thong tin khong day du.
 *   - CUA SO KHAY (conveyorMaxActive) la mot TIEN TO CO DINH cua hang doi Khay, khong
 *     xoay vong duoc. Cua so 1 nghia la ca man chi mot Khay voi toi: moi Thung goi ra
 *     ma khong khop deu nam lai hang cho (toi da 5 slot) => het slot la thua.
 *   - E (carrierBoxes) khoa cung so o trong o 3E. Day la thu duy nhat quyet dinh
 *     "co con cho ma xoay xo khong", va no khong loang ra khi ban to len (he qua (1)).
 *
 * Con `numBoxes` mot minh thi KHONG lam kho, chi lam DAI: do la ly do par o bang tren
 * tang gan tuyen tinh theo so Thung, con diem do kho thi khong.
 */
function configForLevelNumber(level, overrides = {}) {
  const L = Math.max(1, Math.floor(level));
  const lerp = (a, b, x) => a + (b - a) * x;

  const tier =
    L <= 5 ? 'tutorial' :
    L <= 10 ? 'onboarding' :
    L <= 20 ? 'acclimation' :
    L % 10 === 9 ? 'superhard' :
    L % 10 === 5 ? 'hard' : 'normal';

  let c;
  if (tier === 'tutorial') {
    // Ca ban nam trong 12 o hien => khong Thung nao bi che. Day luat, khong thu thach.
    const t = (L - 1) / 4;
    c = {
      numBoxes: [4, 6, 8, 10, 12][L - 1],
      carrierBoxes: [2, 3, 3, 3, 3][L - 1],
      maxOpeningSets: null,          // ca ban deu nhin thay, khong co gi de loc
      numCategories: L <= 2 ? 1 : 2,
      itemTypesPerCategory: 2,
      ratio21: lerp(1.0, 0.88, t),
      trayMatchMode: 'itemType',
      strictTrayRatio: 1.0,
      conveyorMaxActive: 5,
      buryBias: 0.2, bottomBias: 0.7,
      moveLimitSlack: L <= 2 ? null : lerp(2.2, 1.9, t),
      secondsPerMove: null,
      undoCount: 5,
    };
  } else if (tier === 'onboarding') {
    // Ban vua trum qua 12 o: 2..8 Thung bi che. Day khai niem "con hang o tang tren".
    const t = (L - 6) / 4;
    c = {
      numBoxes: Math.round(lerp(14, 20, t)),
      carrierBoxes: 3,
      maxOpeningSets: 6,
      numCategories: Math.round(lerp(2, 3, t)),
      itemTypesPerCategory: 2,
      ratio21: lerp(0.88, 0.80, t),
      trayMatchMode: 'itemType',
      strictTrayRatio: 1.0,
      conveyorMaxActive: L <= 8 ? 5 : 4,
      buryBias: 0.2, bottomBias: lerp(0.65, 0.58, t),
      moveLimitSlack: lerp(1.9, 1.7, t),
      secondsPerMove: null,
      undoCount: 4,
    };
  } else if (tier === 'acclimation') {
    // Phan bi che thanh phan chinh cua ban.
    const t = (L - 11) / 9;
    c = {
      numBoxes: Math.round(lerp(22, 34, t)),
      carrierBoxes: 3,
      maxOpeningSets: 5,
      numCategories: L >= 16 ? 4 : 3,
      itemTypesPerCategory: L >= 16 ? 3 : 2,
      ratio21: lerp(0.80, 0.68, t),
      trayMatchMode: 'itemType',
      strictTrayRatio: 1.0,
      conveyorMaxActive: 4,
      buryBias: 0.2, bottomBias: lerp(0.55, 0.45, t),
      moveLimitSlack: lerp(1.7, 1.5, t),
      secondsPerMove: lerp(10, 8, t),
      undoCount: 4,
    };
  } else if (tier === 'hard') {
    // ==== YEU CAU SAN PHAM: 50-70 Thung ca map, chi 3x4 = 12 o hien ====
    // 25 -> 52 Thung (40 bi che); 35 -> 60 (48 che); 45 -> 68 (56 che).
    const u = (L - 25) / 20;                       // 25, 35, 45 -> 0, 0.5, 1
    c = {
      numBoxes: Math.round(lerp(52, 68, u)),
      carrierBoxes: 2,                             // 6 o trong tren CA ban
      maxOpeningSets: 4,                           // gan sat yeu cau "chi 1-2 bo giai ngay";
                                                   // 4 la san thap nhat ma cau truc dat toi
      numCategories: 5, itemTypesPerCategory: 3,   // 15 loai item => vung hien rat lan lon
      ratio21: lerp(0.64, 0.58, u),
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 4,
      buryBias: 0.1, bottomBias: lerp(0.40, 0.35, u),
      moveLimitSlack: lerp(1.40, 1.30, u),
      secondsPerMove: lerp(7, 6, u),
      undoCount: 2,
    };
  } else if (tier === 'superhard') {
    // Nhu hard nhung: ban to hon, cua so Khay chi 1 Khay (thu tu giao gan nhu bi ep
    // cung), va nhieu nhom hang hon nen mau sac khong con giup phan loai.
    const u = (L - 29) / 20;                       // 29, 39, 49 -> 0, 0.5, 1
    c = {
      numBoxes: Math.round(lerp(72, 80, u)),
      // E = 3 (khong phai 2 nhu hard): tren ban 72-80 Thung, o trong sinh ra o vung
      // hien roi bi day len vung che truoc khi dung het, nen E=2 lam pha nguoc chet
      // doi 25-65% so seed. Do duoc: E=3 khong lam man de hon — so O TRONG NHIN THAY
      // van la ~3 o ca hai muc (phan con lai nam trong Thung bi che).
      carrierBoxes: 3,
      maxOpeningSets: 4,
      numCategories: 6, itemTypesPerCategory: 3,   // 18 loai item
      ratio21: lerp(0.60, 0.54, u),
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 3,
      buryBias: 0.05, bottomBias: lerp(0.36, 0.30, u),
      moveLimitSlack: lerp(1.30, 1.22, u),
      secondsPerMove: lerp(6, 5, u),
      undoCount: 1,
    };
  } else {
    const t = clamp((L - 21) / 28, 0, 1);
    c = {
      numBoxes: Math.round(lerp(34, 46, t)),
      carrierBoxes: 2,
      maxOpeningSets: 5,
      numCategories: 4, itemTypesPerCategory: 3,
      ratio21: lerp(0.68, 0.60, t),
      trayMatchMode: 'itemType', strictTrayRatio: lerp(0.55, 0.9, t),
      conveyorMaxActive: 4,
      buryBias: 0.15, bottomBias: lerp(0.45, 0.36, t),
      moveLimitSlack: lerp(1.55, 1.42, t),
      secondsPerMove: lerp(8, 7, t),
      undoCount: 3,
    };
  }

  const numSets = c.numBoxes - c.carrierBoxes;
  const poolSize = c.numCategories * c.itemTypesPerCategory;
  const maxSetsPerType = Math.max(2, Math.ceil(numSets / poolSize));

  return {
    // Man 1-50 dung seed da tuyen chon; ngoai pham vi do thi quay ve seed suy ra.
    seed: LEVEL_SEEDS[L] ?? ((L * 2654435761) % 2147483647),
    numBoxes: c.numBoxes,
    numSets,
    carrierBoxes: c.carrierBoxes,
    numCategories: c.numCategories,
    itemTypesPerCategory: c.itemTypesPerCategory,
    maxSetsPerType,
    ratio21: c.ratio21,
    maxOpeningSets: c.maxOpeningSets,
    buryBias: c.buryBias,
    bottomBias: c.bottomBias,
    trayMatchMode: c.trayMatchMode,
    strictTrayRatio: c.strictTrayRatio,
    trayJitter: true,
    conveyorMaxActive: Math.max(1, Math.min(c.conveyorMaxActive, numSets)),
    moveLimitSlack: c.moveLimitSlack,
    secondsPerMove: c.secondsPerMove,
    undoCount: c.undoCount,
    columns: 3,
    visibleRows: 4,
    tier,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* Chuan hoa & kiem tra tham so                                        */
/* ------------------------------------------------------------------ */

function normalizeConfig(user) {
  const cfg = { ...DEFAULTS, ...user };
  cfg.boxCapacity = cfg.boxCapacity || CAPACITY;
  cfg.numCategories = clamp(cfg.numCategories, 1, CATEGORIES.length);
  cfg.itemTypesPerCategory = clamp(cfg.itemTypesPerCategory, 1, MAX_TYPES_PER_CAT);
  cfg.columns = Math.max(1, Math.floor(cfg.columns));
  cfg.visibleRows = Math.max(1, Math.floor(cfg.visibleRows));
  cfg.numBoxes = Math.max(2, Math.floor(cfg.numBoxes));

  // E >= 1 la BAT BUOC: buoc nguoc dau tien (rut item ra khoi Thung 3-cung-loai dau
  // tien) chua co Thung nao khac de nhan, nen phai sinh mot Thung chuyen tiep.
  if (cfg.numSets == null) {
    cfg.carrierBoxes = clamp(Math.floor(cfg.carrierBoxes), 1, cfg.numBoxes - 1);
    cfg.numSets = cfg.numBoxes - cfg.carrierBoxes;
  } else {
    cfg.numSets = clamp(Math.floor(cfg.numSets), 1, cfg.numBoxes - 1);
    cfg.carrierBoxes = cfg.numBoxes - cfg.numSets;
  }
  if (cfg.numSets < 1) throw new Error('numSets phai >= 1');
  if (cfg.carrierBoxes < 1)
    throw new Error('Phai co it nhat 1 Thung chuyen tiep: numSets <= numBoxes - 1');

  // Moi Thung chuyen tiep tieu ton dung 1 "item lac", va tong so item lac chi la
  // Σ(d_s − 1) ≈ numSets * (2 − ratio21). Neu doi nhieu Thung chuyen tiep hon the thi
  // khong lan xay nao thanh cong — doi bot sang numSets thay vi de bo sinh nem loi.
  for (let guard = 0; guard < 64; guard++) {
    const maxStrays = Math.floor(cfg.numSets * (2 - cfg.ratio21));
    if (cfg.carrierBoxes <= maxStrays || cfg.carrierBoxes <= 1) break;
    cfg.carrierBoxes--;
    cfg.numSets++;
  }

  const poolSize = cfg.numCategories * cfg.itemTypesPerCategory;
  if (cfg.maxSetsPerType == null) {
    cfg.maxSetsPerType = Math.max(2, Math.ceil(cfg.numSets / poolSize));
  }
  if (poolSize * cfg.maxSetsPerType < cfg.numSets) {
    throw new Error(
      `Pool item qua nho: ${poolSize} loai x ${cfg.maxSetsPerType} bo < ${cfg.numSets} bo can thiet. ` +
        `Tang numCategories hoac itemTypesPerCategory.`
    );
  }

  cfg.ratio21 = clamp(cfg.ratio21, 0, 1);
  cfg.buryBias = clamp(cfg.buryBias, 0, 1);
  cfg.bottomBias = clamp(cfg.bottomBias, 0, 1);
  cfg.conveyorMaxActive = clamp(Math.floor(cfg.conveyorMaxActive), 1, cfg.numSets);
  return cfg;
}

/* ------------------------------------------------------------------ */
/* Loi: xay nguoc TRUC TIEP tren bo cuc cot                            */
/* ------------------------------------------------------------------ */

/**
 * Tra ve { boxes, cols, setType, dSet, solution } hoac null neu lan xay nay hong.
 *
 * `setType[s]` la loai item cua bo thu s, danh chi so theo THU TU GIAO HANG XUOI:
 * bo 0 duoc giao dau tien. Pha nguoc chay s = S−1 -> 0.
 */
function buildDeep(cfg, rng) {
  const cap = cfg.boxCapacity;
  const C = cfg.columns;
  const R = cfg.visibleRows;
  const S = cfg.numSets;
  const N = cfg.numBoxes;

  /* --- 1. Chon loai item cho tung bo --- */
  const cats = shuffle(rng, CATEGORIES).slice(0, cfg.numCategories);
  const pool = [];
  for (const c of cats) {
    for (const it of shuffle(rng, c.items).slice(0, cfg.itemTypesPerCategory)) pool.push(it.id);
  }
  const setType = [];
  const usage = new Map(pool.map((t) => [t, 0]));
  for (let s = 0; s < S; s++) {
    const eligible = pool.filter((t) => usage.get(t) < cfg.maxSetsPerType);
    if (!eligible.length) return null;
    const minUse = Math.min(...eligible.map((t) => usage.get(t)));
    const t = pick(rng, eligible.filter((x) => usage.get(x) === minUse));
    usage.set(t, usage.get(t) + 1);
    setType.push(t);
  }

  /* --- 2. Do phan tan cua tung bo: 2+1 hay 1+1+1 --- */
  const dSet = Array(S).fill(3);
  for (const s of shuffle(rng, range(S)).slice(0, Math.round(cfg.ratio21 * S))) dSet[s] = 2;
  const totalStrays = dSet.reduce((a, d) => a + d - 1, 0);
  if (cfg.carrierBoxes > totalStrays) return null;

  /* --- 3. Trang thai nguoc --- */
  const boxes = [];      // boxes[id] = mang item
  const pristine = [];   // Thung goc chua bi dung toi (duoc phep 3-cung-loai)
  const cols = Array.from({ length: C }, () => []);  // cols[c][0] = DAY cot
  const revMoves = [];   // { from, to, itemId } theo thu tu NGUOC

  const posOf = (id) => {
    for (let c = 0; c < C; c++) {
      const at = cols[c].indexOf(id);
      if (at !== -1) return { c, at };
    }
    return null;
  };
  const isVisible = (id) => {
    const p = posOf(id);
    return p !== null && p.at < R;
  };
  const isFullSame = (arr) => arr.length === cap && arr.every((x) => x === arr[0]);

  /**
   * Chen mot Thung MOI vao cot. Thung tu vi tri chen tro len bi day len 1 nac.
   *
   * `atBottom` = true danh cho Thung chuyen tiep (R3): no mang theo 2 o trong, va o
   * trong chi dung duoc khi con nam trong tam voi. Chen no xuong day cot la cach giu
   * o trong o lai lau nhat. Neu de no cung chiu bottomBias nhu Thung "nha" thi o
   * trong bi day len vung bi che va pha nguoc chet doi vi het cho dat item lac.
   */
  function insertBox(items, atBottom = false) {
    const id = boxes.length;
    boxes.push(items);
    pristine.push(true);
    // Uu tien cot thap nhat de ba cot deu nhau (khong cot nao qua sau).
    const c = shuffle(rng, range(C)).sort((a, b) => cols[a].length - cols[b].length)[0];
    const maxPos = Math.min(R - 1, cols[c].length);
    let p = 0;
    if (!atBottom && maxPos > 0 && rng() >= cfg.bottomBias) p = 1 + randInt(rng, maxPos);
    cols[c].splice(p, 0, id);
    return id;
  }

  /**
   * R2 — rut 1 item tu `from` bo sang `to`; ca hai deu phai dang hien.
   * Nuoc xuoi la `to -> from`, va `to` khong duoc rong sau do (Thung rong da bien mat).
   */
  function revMove(from, fromIdx, to) {
    if (from === to) return false;
    if (boxes[from].length <= 1) return false;            // xuoi: Thung nay phai con item
    if (boxes[to].length >= cap) return false;
    if (!isVisible(from) || !isVisible(to)) return false;
    if (!pristine[from] && isWrapped(boxes[from], cap)) return false;
    const item = boxes[from][fromIdx];
    if (isFullSame(boxes[to].concat([item]))) return false;  // se goi sai thoi diem
    boxes[from].splice(fromIdx, 1);
    boxes[to].push(item);
    pristine[from] = false;
    pristine[to] = false;
    revMoves.push({ from, to, itemId: item });
    return true;
  }

  /**
   * R3 — rut 1 item tu `from` sang mot Thung MOI vua chen vao cot.
   * Xuoi: nguoi choi keo item duy nhat do ra, Thung moi het item -> bien mat -> cot
   * tut xuong. Day la nguon duy nhat sinh o trong (+3 moi lan goi).
   */
  function revMoveToNew(from, fromIdx) {
    if (boxes[from].length <= 1) return -1;
    if (!isVisible(from)) return -1;
    if (!pristine[from] && isWrapped(boxes[from], cap)) return -1;
    const item = boxes[from][fromIdx];
    const id = insertBox([item], true);
    // Chinh phep chen co the day `from` ra ngoai tam voi; khi do nuoc xuoi tuong ung
    // khong hop le. Hoan tac va bao that bai.
    if (!isVisible(from) || !isVisible(id)) {
      const p = posOf(id);
      cols[p.c].splice(p.at, 1);
      boxes.pop();
      pristine.pop();
      return -1;
    }
    boxes[from].splice(fromIdx, 1);
    pristine[from] = false;
    revMoves.push({ from, to: id, itemId: item });
    return id;
  }

  /** Cac Thung dang hien co the nhan `item` ma khong goi sai thoi diem. */
  function candidates(item, forbidden) {
    const out = [];
    for (let c = 0; c < C; c++) {
      for (let at = 0; at < Math.min(R, cols[c].length); at++) {
        const i = cols[c][at];
        if (forbidden.has(i)) continue;
        if (boxes[i].length >= cap) continue;
        if (!pristine[i] && isWrapped(boxes[i], cap)) continue;
        if (isFullSame(boxes[i].concat([item]))) continue;
        out.push({ i, at });
      }
    }
    return out;
  }

  /**
   * Do item lac vao mot Thung dang hien. Trong so:
   *   - buryBias: uu tien Thung SAT MEP tam voi (at gan R−1) => xuoi thi tai nguyen
   *     nay bi che, phai khoi thong moi lay duoc.
   *   - uu tien Thung da co san item KHAC loai => vung nhin thay lan lon, kho doc.
   */
  function placeStray(home, idx, item, used) {
    const cands = candidates(item, used);
    if (!cands.length) return false;
    const chosen = weightedPick(rng, cands, ({ i, at }) => {
      // Ham MU chu khong tuyen tinh: item lac phai DON vao hang tren cung cua tam
      // voi (at = R−1), tuc Thung sap bi che sau mot vai lan chen nua. Voi ham tuyen
      // tinh (trong so 1 : 2.2 : 3.4 : 4.6) item lac rai deu ca bon hang, va do la
      // ly do ban do dau tien co toi 7-8 bo giai duoc ngay trong vung nhin thay.
      const depthW = Math.pow(1 + 3 * cfg.buryBias, at);
      const mixed = new Set(boxes[i]).size > 1 ? 1.8 : 1;
      const nearFull = cap - boxes[i].length === 1 ? 1.4 : 1;
      return depthW * mixed * nearFull;
    });
    if (!chosen) return false;
    if (!revMove(home, idx, chosen.i)) return false;
    used.add(chosen.i);
    return true;
  }

  /* --- 4. Pha nguoc: s = S−1 -> 0 --- */
  let carriersLeft = cfg.carrierBoxes;
  let straysLeft = totalStrays;

  for (let s = S - 1; s >= 0; s--) {
    const t = setType[s];
    const home = insertBox([t, t, t]);   // R1: un-deliver
    const used = new Set([home]);        // moi item lac cua bo nay phai o Thung khac nhau

    for (let k = 0; k < dSet[s] - 1; k++) {
      // Luon rut item cuoi — moi item trong `home` cung loai nen tuong duong nhau.
      const idx = boxes[home].length - 1;
      if (idx < 0) return null;

      // Sinh Thung chuyen tiep khi (a) khong con cho nao nhan, hoac (b) den luot theo
      // lich rai deu. Thung chuyen tiep sinh MUON trong pha nguoc se nam o day cot =>
      // o trong nam trong vung nhin thay luc spawn (nguoi choi co cho ma xoay xo).
      const forced = candidates(t, used).length === 0;
      const voluntary = carriersLeft > 0 && straysLeft > 0 && rng() < carriersLeft / straysLeft;

      if (forced || voluntary) {
        if (carriersLeft === 0) return null;
        const made = revMoveToNew(home, idx);
        if (made >= 0) {
          carriersLeft--;
          used.add(made);
        } else if (forced || !placeStray(home, idx, t, used)) {
          return null;
        }
      } else if (!placeStray(home, idx, t, used)) {
        return null;
      }
      straysLeft--;
    }
  }

  /* --- 5. Kiem tra trang thai xuat phat --- */
  if (boxes.length !== N) return null;
  if (carriersLeft !== 0) return null;
  for (let i = 0; i < N; i++) {
    if (boxes[i].length === 0) return null;        // khong Thung rong luc spawn
    if (isWrapped(boxes[i], cap)) return null;     // khong Thung goi san
  }

  /* --- 6. Loi giai xuoi = dao nguoc danh sach nuoc di nguoc --- */
  const spec = [];
  for (let k = revMoves.length - 1; k >= 0; k--) {
    spec.push({ from: revMoves[k].to, to: revMoves[k].from, itemId: revMoves[k].itemId });
  }
  const solution = materializeSolution(boxes, spec, cap);
  if (!solution) return null;

  return { boxes, cols, setType, dSet, solution };
}

/**
 * Gan index cu the cho tung nuoc bang cach chay thu tren ban sao state.
 * (push() dat item vao cuoi mang con splice() lay o giua, nen thu tu trong Thung sau
 * khi dao nguoc co the khac — cac item cung itemId thi tuong duong nhau.)
 */
function materializeSolution(initialBoxes, spec, cap) {
  const state = initialBoxes.map((b) => b.slice());
  const out = [];
  for (const mv of spec) {
    const index = state[mv.from].indexOf(mv.itemId);
    if (index < 0) return null;
    if (state[mv.to].length >= cap) return null;
    state[mv.from].splice(index, 1);
    state[mv.to].push(mv.itemId);
    out.push({ from: mv.from, index, to: mv.to, itemId: mv.itemId });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Mo phong TRUNG THUC mot van (kiem chung + do do kho)                */
/* ------------------------------------------------------------------ */

/**
 * Phat lai `solution` dung theo luat GameEngine:
 *   - chi cham duoc Thung co index < visibleRows trong cot cua no;
 *   - Thung het item -> bien mat -> cot tut xuong;
 *   - Thung goi xong -> ROI KHOI COT ngay -> vao hang cho (toi da queueCapacity slot);
 *   - hang cho tu dong giao khi co Khay khop trong `conveyorMaxActive` Khay dau hang.
 *
 * Tra ve null neu vi pham bat ky luat nao (bo loc an toan cuoi cung), hoac
 * { maxQueue, reveals, deliveries } neu van ket thuc THANG.
 */
function replayReal(cfg, boxesInit, colsInit, trays, solution, catOf) {
  const cap = cfg.boxCapacity;
  const R = cfg.visibleRows;
  const state = boxesInit.map((b) => b.slice());
  const cols = colsInit.map((c) => c.slice());
  const pending = trays.slice();
  const queue = [];
  let maxQueue = 0;
  let reveals = 0;
  let deliveries = 0;

  const visible = (id) => {
    for (const c of cols) {
      const at = c.indexOf(id);
      if (at !== -1) return at < R;
    }
    return false;
  };

  function dropFromColumn(id) {
    for (const c of cols) {
      const at = c.indexOf(id);
      if (at === -1) continue;
      const wasDeep = c.length > R;
      c.splice(at, 1);
      if (wasDeep) reveals++;
      return;
    }
  }

  const accepts = (tray, boxIdx) => {
    // Luon so sanh theo loai item cu the — khop voi Tray.canAccept() da sua.
    return tray.targetItemId === state[boxIdx][0];
  };

  function autoDeliver() {
    for (let progress = true; progress; ) {
      progress = false;
      const win = pending.slice(0, cfg.conveyorMaxActive);
      for (let qi = 0; qi < queue.length && !progress; qi++) {
        for (let wi = 0; wi < win.length; wi++) {
          if (!accepts(win[wi], queue[qi])) continue;
          pending.splice(wi, 1);
          queue.splice(qi, 1);
          deliveries++;
          progress = true;
          break;
        }
      }
    }
  }

  for (const mv of solution) {
    if (!visible(mv.from) || !visible(mv.to)) return null;
    if (state[mv.to].length >= cap) return null;
    if (state[mv.from][mv.index] !== mv.itemId) return null;
    state[mv.from].splice(mv.index, 1);
    state[mv.to].push(mv.itemId);
    if (state[mv.from].length === 0) dropFromColumn(mv.from);
    if (isWrapped(state[mv.to], cap)) {
      // Luat that: Thung goi xong roi khoi cot NGAY va nam trong hang cho.
      dropFromColumn(mv.to);
      queue.push(mv.to);
      maxQueue = Math.max(maxQueue, queue.length);
      if (queue.length > cfg.queueCapacity) return null;   // xuoi la THUA
      autoDeliver();
    }
  }

  if (queue.length !== 0 || pending.length !== 0) return null;
  if (cols.some((c) => c.length > 0)) return null;
  return { maxQueue, reveals, deliveries };
}

/* ------------------------------------------------------------------ */
/* Dong goi output + Khay + do kho                                     */
/* ------------------------------------------------------------------ */

function finalize(cfg, built, attempt) {
  const cap = cfg.boxCapacity;
  const { boxes, cols, setType, dSet, solution } = built;
  const S = cfg.numSets;
  const N = cfg.numBoxes;

  /* --- Khay: 1 Khay / 1 bo, dung THU TU GIAO HANG cua loi giai tham chieu --- */
  // Chi hoan vi trong tung KHOI <= conveyorMaxActive: Khay can toi luon con trong
  // cua so nen khong bao gio ket, nhung nguoi choi van khong doan duoc thu tu chinh xac.
  const rngT = makeRng(cfg.seed + 104729 + attempt);
  const trayTypes = [];
  const block = cfg.trayJitter ? Math.max(1, cfg.conveyorMaxActive) : 1;
  for (let i = 0; i < S; i += block) {
    trayTypes.push(...shuffle(rngT, setType.slice(i, i + block)));
  }

  // Tat ca Khay deu khop theo LOAI ITEM cu the (targetItemId). Tray hien emoji nao
  // thi CHI nhan box cung emoji do — khong con che do 'category' gay nham lan.
  const trays = trayTypes.map((typeId, i) => {
    const info = getTypeInfo(typeId);
    return {
      id: `tray_${i}`,
      queueIndex: i,
      categoryId: info.categoryId,
      targetItemId: typeId,
      emoji: info.emoji,
      color: info.color,
      matchMode: 'itemType',
    };
  });
  const strictRatio = trays.length
    ? trays.filter((t) => t.matchMode === 'itemType').length / trays.length
    : 0;

  /* --- Kiem chung: phat lai loi giai duoi DUNG luat cua GameEngine --- */
  const catOf = (typeId) => getTypeInfo(typeId).categoryId;
  let sim = null;
  if (cfg.verify) {
    sim = replayReal(cfg, boxes, cols, trays, solution, catOf);
    if (!sim) return null;
  }

  /* --- So do kho --- */
  // refMoves = Σ(d_s − 1) vua la chan duoi vua la do dai loi giai => TOI UU (he qua 2).
  const refMoves = solution.length;
  const parMoves = refMoves;
  const lowerBound = heuristic(boxes, cap);
  const freeSlots = boxes.reduce((n, b) => n + (cap - b.length), 0);
  const mixedBoxes = boxes.filter((b) => new Set(b).size > 1).length;
  const catsUsed = new Set(setType.map((t) => getTypeInfo(t).categoryId)).size;
  const typesUsed = new Set(setType).size;
  const hiddenBoxes = Math.max(0, N - cfg.columns * cfg.visibleRows);

  const visibleAtSpawn = new Set();
  for (const c of cols) {
    for (let i = 0; i < Math.min(cfg.visibleRows, c.length); i++) visibleAtSpawn.add(c[i]);
  }
  const visibleFreeSlots = [...visibleAtSpawn].reduce((n, i) => n + (cap - boxes[i].length), 0);

  // Bo nao gom du 3 item NGAY trong vung nhin thay luc spawn? Day la so "cua mo dau"
  // — yeu cau san pham la 1-2 bo; phan con lai bat buoc phai khoi thong tang tren.
  const openingSets = countOpeningSets(boxes, solution, visibleAtSpawn, cap);
  // Yeu cau san pham: vung nhin thay chi duoc cho san 1-2 bo hoan chinh; muon giai het
  // thi BUOC PHAI khoi thong tang tren. Lan xay nao vuot tran thi bo, thu seed khac.
  if (cfg.maxOpeningSets != null && openingSets > cfg.maxOpeningSets) return null;

  const difficulty = {
    refMoves,
    parMoves,
    optimalMoves: parMoves,     // xem he qua (2): refMoves CHINH LA toi uu
    lowerBound,
    freeSlots,
    visibleFreeSlots,
    hiddenBoxes,
    openingSets,
    deepestColumn: Math.max(...cols.map((c) => c.length)),
    maxQueueHeld: sim ? sim.maxQueue : null,
    reveals: sim ? sim.reveals : null,
    fillRatio: +(1 - freeSlots / (N * cap)).toFixed(3),
    avgSpread: +(dSet.reduce((a, b) => a + b, 0) / dSet.length).toFixed(2),
    mixedBoxRatio: +(mixedBoxes / Math.max(1, N)).toFixed(3),
    categoryConfusion: +(typesUsed / Math.max(1, catsUsed)).toFixed(2),
    score: 0,
  };

  /* --- Diem do kho 1..100 --- */
  //
  // CHIN TRUC chuan hoa ve [0,1]. Trong so bam theo THIET KE MOI: do kho den tu
  // THONG TIN BI GIAU va KHONG GIAN XOAY XO CHAT, khong tu do dai van dau.
  //
  //   hiddenDepth   0.22  so Thung bi che — don bay chinh cua ban thiet ke moi
  //   window        0.16  cua so Khay cang hep cang phai goi dung thu tu
  //   slotPressure  0.12  3E o trong; HANG SO cuc bo, khong loang khi ban to (he qua 1)
  //   opening       0.10  co bao nhieu bo giai duoc ngay trong vung nhin thay
  //   volume        0.10  do dai van dau — co tinh, nhung nhe nhat co the
  //   spread        0.08  ti le bo 1+1+1
  //   confusion     0.08  nhieu loai item trong cung mot nhom hang
  //   interleave    0.07  ti le Thung chua item lan lon
  //   strictness    0.07  Khay khop dung loai + gioi han nuoc di
  const nHidden = clamp(hiddenBoxes / 60, 0, 1);
  // Cua so Khay: bac thang chu khong tuyen tinh (do duoc: buoc nhay ty le thua nam
  // giua cua so 3 va 2, roi giua 2 va 1). Nhan them do PHU: neu cua so da om gan het
  // hang doi Khay (man tutorial 2-3 Khay) thi no chang siet gi ca.
  const WINDOW_TIGHTNESS = { 1: 1, 2: 0.85, 3: 0.55, 4: 0.30, 5: 0.12, 6: 0.04 };
  const nWindow = (WINDOW_TIGHTNESS[cfg.conveyorMaxActive] ?? 0) *
    clamp(1 - cfg.conveyorMaxActive / Math.max(1, S), 0, 1);
  // O trong tinh THEO VUNG NHIN THAY, khong theo ca ban: 3E o trong deu nam quanh
  // cua so 12 Thung (he qua (1)), nen mau so la so Thung nhin thay duoc.
  const holesPerVisible = (3 * cfg.carrierBoxes) / Math.max(1, Math.min(N, cfg.columns * cfg.visibleRows));
  const nSlot = clamp((1.0 - holesPerVisible) / 0.75, 0, 1);
  // "Cua mo dau" chi la mot rang buoc that khi no NHO so voi tong so bo — man 4 Thung
  // co 2 bo va ca hai deu mo thi do khong phai la kho.
  const nOpen = clamp(1 - (openingSets - 1) / 4, 0, 1) *
    clamp(1 - openingSets / Math.max(1, S), 0, 1);
  const nVol = clamp(parMoves / 120, 0, 1);
  const nSpread = clamp(difficulty.avgSpread - 2, 0, 1);
  const nConf =
    clamp((typesUsed - 1) / Math.max(1, S - 1), 0, 1) *
    clamp((difficulty.categoryConfusion - 1) / Math.max(1, MAX_TYPES_PER_CAT - 1), 0, 1);
  const nInter = difficulty.mixedBoxRatio;
  const nStrict = clamp(
    strictRatio * 0.6 +
      (cfg.moveLimitSlack == null ? 0 : clamp((1.8 - cfg.moveLimitSlack) / 0.75, 0, 1) * 0.4),
    0, 1
  );

  difficulty.components = {
    hiddenDepth: +nHidden.toFixed(3), windowTightness: +nWindow.toFixed(3),
    slotPressure: +nSlot.toFixed(3), opening: +nOpen.toFixed(3),
    volume: +nVol.toFixed(3), spread: +nSpread.toFixed(3),
    confusion: +nConf.toFixed(3), interleave: +nInter.toFixed(3),
    strictness: +nStrict.toFixed(3),
  };
  difficulty.score = clamp(
    Math.round(100 * (
      0.22 * nHidden + 0.16 * nWindow + 0.12 * nSlot + 0.10 * nOpen +
      0.10 * nVol + 0.08 * nSpread + 0.08 * nConf + 0.07 * nInter + 0.07 * nStrict
    )), 1, 100);

  /* --- Meta: gioi han nuoc di / thoi gian --- */
  const moveLimit = cfg.moveLimitSlack == null ? null : Math.ceil(parMoves * cfg.moveLimitSlack);
  const timeToPlay =
    cfg.secondsPerMove == null ? null : Math.round((parMoves * cfg.secondsPerMove + 20) / 5) * 5;

  return {
    version: 'solvable-gen-2.0',
    seed: cfg.seed,
    attempt,
    config: cfg,

    boxes: boxes.map((items, i) => ({ id: `box_${i}`, items: items.slice(), maxSize: cap })),
    trays,

    // Bo cuc khu Thung. columns[c] = danh sach CHI SO Thung trong cot c, phan tu 0 la
    // o duoi cung. `visibleRows` phan tu dau moi cot la vung nguoi choi cham duoc;
    // phan con lai bi che va khoa. Khi mot Thung roi khoi cot (duoc giao hoac het
    // item), cot tut xuong va lo them mot Thung.
    layout: {
      columns: cols.map((c) => c.slice()),
      visibleRows: cfg.visibleRows,
      hiddenBoxes,
    },
    conveyor: { type: cfg.conveyorType, maxActive: cfg.conveyorMaxActive },

    referenceSolution: solution,
    solvable: true,
    solvabilityProof: 'reverse-construction-on-layout + full forward replay verified',

    difficulty,
    rules: {
      moveLimit,
      timeToPlay,
      undoCount: cfg.undoCount,
      queueCapacity: cfg.queueCapacity,
      trayMatchMode: cfg.trayMatchMode,
      strictTrayRatio: +strictRatio.toFixed(3),
    },
  };
}

/**
 * Dem so bo ma CA BA item deu nam trong vung nhin thay luc spawn — tuc so bo nguoi
 * choi co the goi ma khong can khoi thong gi. Chay lai loi giai tham chieu de biet
 * moi bo gom item tu nhung Thung nao.
 */
function countOpeningSets(boxes, solution, visibleAtSpawn, cap) {
  const acc = boxes.map((b) => b.slice());
  let donors = [];
  let count = 0;
  for (const mv of solution) {
    donors.push(mv.from);
    acc[mv.from].splice(acc[mv.from].indexOf(mv.itemId), 1);
    acc[mv.to].push(mv.itemId);
    if (isWrapped(acc[mv.to], cap)) {
      if (visibleAtSpawn.has(mv.to) && donors.every((d) => visibleAtSpawn.has(d))) count++;
      acc[mv.to] = [];
      donors = [];
    }
  }
  return count;
}

const SolvableLevelGenerator = {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
  DEFAULTS,
};


// --- src/generator/LevelGenerator.js ---

/**
 * LevelGenerator — lop adapter mong giua UI va bo sinh man nguoc.
 *
 * TRUOC DAY file nay tu sinh man theo huong THUAN:
 *   - Math.random() khong seed  => khong tai lap duoc level de debug/bao loi.
 *   - sort(() => 0.5 - Math.random()) => comparator khong nhat quan, phan phoi
 *     lech nang (khong phai Fisher-Yates).
 *   - Solver bi bo qua hoan toan (`while (!levelData && attempts < 1)`), nen
 *     KHONG co bao dam giai duoc nao — chi la mot gia dinh.
 *   - Vi tron ngau nhien, 23% level 1 sinh ra da co san mot Thung WRAPPED
 *     (3 mon giong nhau roi vao cung Thung) => nguoi choi duoc thung mien phi,
 *     duong cong do kho vo nghia (do bang tools/selftest.js TEST 5).
 *   - `import { Solver }` tro toi mot export khong con ton tai => ban ESM cua
 *     index.html nem loi ngay khi load.
 *
 * NAY uy quyen cho SolvableLevelGenerator (sinh NGUOC tu trang thai THANG):
 *   - solvability la bat bien cau truc, khong phai ket qua tim kiem;
 *   - kem `referenceSolution` da duoc replay kiem chung;
 *   - RNG co seed => cung levelNumber luon ra cung man choi.
 */
class LevelGenerator {
  /**
   * @param {object} config
   *   Dang moi (uu tien): { levelNumber: 7, ...overrides }
   *   Dang cu (tuong thich nguoc): { numBoxes, numEmptyBoxes, numCategories, itemTypesPerCat }
   * @returns level object dung duoc truc tiep boi GameEngine.startLevel()
   */
  static generateLevel(config = {}) {
    const cfg = LevelGenerator.toGeneratorConfig(config);

    let level;
    try {
      level = generateLevel(cfg);
    } catch (err) {
      // Cau hinh bat kha thi (vd: so bo > so o chua duoc). Noi long dan cho
      // toi khi hop le thay vi nem loi ra UI.
      console.warn('[LevelGenerator] cau hinh khong hop le, dang noi long:', err.message);
      level = LevelGenerator.generateWithRelaxedConfig(cfg);
    }

    return LevelGenerator.toEngineLevel(level);
  }

  /** Chuyen config cua UI thanh config cua bo sinh nguoc. */
  static toGeneratorConfig(config) {
    if (config.levelNumber != null) {
      const { levelNumber, ...overrides } = config;
      return configForLevelNumber(levelNumber, overrides);
    }

    // --- Duong tuong thich nguoc cho loi goi cu ---
    // `numEmptyBoxes` khong con ton tai: luat hien hanh la KHONG Thung rong luc spawn,
    // va so o trong duoc quyet dinh boi `carrierBoxes` (tong o trong = 3 * carrierBoxes,
    // xem he qua (1) trong SolvableLevelGenerator.js). Loi goi cu nao con truyen no thi
    // duoc quy doi thanh so Thung chuyen tiep tuong duong.
    const {
      numBoxes = 12,
      numEmptyBoxes = 1,
      numCategories = 2,
      itemTypesPerCat = 2,
      ...rest
    } = config;
    return configForLevelNumber(1, {
      numBoxes,
      carrierBoxes: Math.max(1, Math.min(numEmptyBoxes || 1, numBoxes - 1)),
      numSets: null,
      numCategories,
      itemTypesPerCategory: itemTypesPerCat,
      seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0,
      ...rest,
    });
  }

  /**
   * Noi long dan cho toi khi cau hinh kha thi: moi buoc doi mot bo lay them mot Thung
   * chuyen tiep, tuc them 3 o trong. Cang nhieu o trong thi pha xay nguoc cang de tim
   * duoc cho dat item lac — day la chieu noi long dung, khong phai giam numBoxes
   * (giam numBoxes se pha vo hop dong quy mo cua tier).
   */
  static generateWithRelaxedConfig(cfg) {
    const N = cfg.numBoxes;
    for (let carriers = Math.max(1, cfg.carrierBoxes || 1); carriers <= N - 1; carriers++) {
      try {
        return generateLevel({ ...cfg, carrierBoxes: carriers, numSets: null, maxOpeningSets: null });
      } catch (_) { /* thu tiep */ }
    }
    throw new Error(`[LevelGenerator] khong sinh duoc man choi tu config: ${JSON.stringify(cfg)}`);
  }

  /** Dat lai ten truong cho khop hop dong ma GameEngine.startLevel() doc. */
  static toEngineLevel(level) {
    return {
      id: `lv_${level.seed}`,
      boxes: level.boxes,
      trays: level.trays,
      conveyorType: level.conveyor.type,
      maxActiveTrays: level.conveyor.maxActive,
      layout: level.layout,        // bo cuc cot + so hang hien (khu Thung 3x4)

      // Bang chung + sieu du lieu, cho HUD / hint / phan tich.
      solvable: level.solvable,
      referenceSolution: level.referenceSolution,
      difficulty: level.difficulty,
      rules: level.rules,
      config: level.config,
    };
  }

  /**
   * Goi y nuoc di ke tiep tu trang thai HIEN TAI (khong phai tu trang thai dau).
   * Dung loi giai kien thiet O(S) — luon tra ve ket qua tuc thi, khong search,
   * nen dung duoc lam nut "Hint" va luoi chan ket cuc "nguoi choi tuong minh ket".
   * @param {Array<{items:string[]}>|string[][]} boxes trang thai hien tai
   * @returns {{from:number,index:number,to:number}|null}
   */
  static hint(boxes) {
    const state = boxes.map((b) => (Array.isArray(b) ? b.slice() : b.items.slice()));
    const r = solveConstructive(state);
    return r.solved && r.moves.length ? r.moves[0] : null;
  }
}


// --- src/ui/AudioManager.js ---
/**
 * AudioManager.js
 * Hệ thống âm thanh tổng hợp 100% bằng Web Audio API thuần (Zero external files).
 * Mô phỏng âm thanh cơ khí nhà máy, băng chuyền, đóng gói và chuông xuất xưởng.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.on = this._loadPref();
        this._initialized = false;
    }

    _loadPref() {
        try {
            const saved = localStorage.getItem('fs_sound');
            return saved === null ? true : saved === 'true';
        } catch (_) {
            return true;
        }
    }

    _savePref(val) {
        try {
            localStorage.setItem('fs_sound', val ? 'true' : 'false');
        } catch (_) {}
    }

    ensure() {
        if (!this.ctx) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.85;
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = this.on ? 1 : 0;
                this.sfxGain.connect(this.masterGain);
                this._initialized = true;
            } catch (e) {
                console.warn('AudioContext not supported or blocked:', e);
                return;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    setSound(val) {
        this.on = !!val;
        this._savePref(this.on);
        this.ensure();
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.on ? 1 : 0, this.ctx.currentTime, 0.04);
        }
    }

    toggle() {
        this.setSound(!this.on);
        return this.on;
    }

    /**
     * Phát 1 xung âm với tần số, thời lượng, dạng sóng và trượt tần số tuỳ biến
     */
    blip(freq, duration, type = 'sine', gain = 0.08, delay = 0, slideTo = null) {
        if (!this.on) return;
        this.ensure();
        if (!this.ctx || !this.sfxGain) return;

        const t = this.ctx.currentTime + (delay || 0);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + duration);
        }

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration + 0.03);
    }

    /** Chạm vào món đồ trong thùng (Click cơ khí nhẹ) */
    tap() {
        this.blip(520, 0.05, 'triangle', 0.06);
        this.blip(1040, 0.03, 'sine', 0.03);
    }

    /** Đặt món đồ vào thùng đích thành công (Servo cơ khí trượt) */
    swap() {
        this.blip(380, 0.08, 'triangle', 0.07, 0, 560);
        this.blip(820, 0.06, 'sine', 0.03, 0.02);
    }

    /** Thùng đủ 3 món -> Đóng gói & dán băng keo (Tiếng pop áp suất khí nén) */
    wrap() {
        this.blip(450, 0.12, 'sawtooth', 0.05, 0, 220);
        this.blip(720, 0.16, 'triangle', 0.09, 0.04, 1150);
        this.blip(1440, 0.18, 'sine', 0.04, 0.08);
    }

    /** Thao tác sai hoặc ô không thể thả (Buzzer cảnh báo xưởng) */
    reject() {
        this.blip(180, 0.16, 'sawtooth', 0.07, 0, 110);
        this.blip(130, 0.22, 'triangle', 0.08, 0.04);
    }

    /** Khay trên băng chuyền nhận thùng hàng (Tiếng chốt khóa & chuông xuất xưởng) */
    deliver() {
        this.blip(660, 0.12, 'triangle', 0.08);
        this.blip(1320, 0.22, 'sine', 0.07, 0.04);
    }

    /** Tiếng băng chuyền chạy đưa thùng hàng trượt xuống */
    conveyorRoll() {
        this.blip(180, 0.18, 'triangle', 0.05, 0, 120);
        this.blip(280, 0.12, 'sawtooth', 0.02, 0.02, 200);
    }

    /**
     * Dãy chuông combo khi xuất hàng liên tiếp
     * Càng nhiều combo, nốt nhạc càng cao và trong trẻo
     */
    combo(step = 1) {
        const k = Math.min(Math.max(1, step), 6);
        const freqs = [1046.5, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3];
        const f = freqs[k - 1] || 1568.0;

        this.blip(f * 0.5, 0.22, 'triangle', 0.08);
        this.blip(f, 0.32, 'sine', 0.08, 0.03);
        this.blip(f * 1.5, 0.26, 'sine', 0.04, 0.08);
    }

    /** Sao thưởng chiến thắng (Chime kim loại rực rỡ) */
    star(idx = 0) {
        const f = [784, 988, 1319][idx] || 1319;
        this.blip(f, 0.26, 'sine', 0.09, idx * 0.12);
        this.blip(f * 1.5, 0.24, 'triangle', 0.04, idx * 0.12 + 0.04);
    }

    /** Thắng toàn màn - Khúc hoan ca xuất xưởng 5 nốt + hồi còi ngân vang */
    win() {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((f, i) => {
            this.blip(f, 0.32, 'triangle', 0.07, i * 0.09);
            this.blip(f * 2, 0.38, 'sine', 0.04, i * 0.09 + 0.03);
        });
        this.blip(2093, 0.6, 'sine', 0.06, 0.5);
        this.blip(2637, 0.7, 'sine', 0.04, 0.6);
    }

    /** Thua - Dây chuyền quá tải tắt máy (Hợp âm hạ dần) */
    lose() {
        [370, 311, 247].forEach((f, i) => {
            this.blip(f, 0.38, 'sawtooth', 0.06, i * 0.18, f * 0.85);
        });
    }
}


// --- src/ui/VFXManager.js ---
/**
 * VFXManager.js
 * Hệ thống hiệu ứng hình ảnh động (Juicy visual effects) học hỏi từ Hexameow:
 * - Floating praise text (Chữ nổi khen thưởng + Combo ladder)
 * - Shockwave ring & Spark bursts (Vòng năng lượng & tia sáng cơ khí)
 * - HUD Bump animations (Nảy số chỉ số mượt mà)
 * - Confetti mừng thắng lợi ca làm việc
 */

class VFXManager {
    constructor() {
        this.container = document.getElementById('play-area') || document.body;
        this.gameContainer = document.getElementById('game-container') || document.body;
    }

    /**
     * Bảng bậc thang Combo (Combo Ladder)
     * Thang bậc càng cao -> Font càng lớn, màu càng rực và phát sáng neon
     */
    static get COMBO_TIERS() {
        return [
            { at: 1, scale: 1.00, color: '#38bdf8', glow: '8px',  tag: '' },
            { at: 2, scale: 1.15, color: '#f59e0b', glow: '12px', tag: '⚡' },
            { at: 3, scale: 1.32, color: '#10b981', glow: '16px', tag: '🔥' },
            { at: 4, scale: 1.52, color: '#f97316', glow: '22px', tag: '🚀' },
            { at: 5, scale: 1.76, color: '#ec4899', glow: '28px', tag: '👑' },
        ];
    }

    getTier(combo) {
        const tiers = VFXManager.COMBO_TIERS;
        let t = tiers[0];
        for (const item of tiers) {
            if (combo >= item.at) t = item;
        }
        return t;
    }

    /**
     * Hiển thị chữ khen thưởng bay lên tại tọa độ của một DOM element hoặc Rect
     * @param {HTMLElement|DOMRect} target
     * @param {string} text Nội dung hiển thị (vd: "ĐÓNG GÓI! 📦", "XUẤT XƯỞNG! 🚚")
     * @param {number} combo Số chuỗi combo
     */
    praise(target, text, combo = 1) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const n = Math.max(1, combo || 1);
        const tier = this.getTier(n);

        const el = document.createElement('div');
        el.className = `factory-praise praise-t${Math.min(n, 5)}`;
        el.textContent = tier.tag ? `${text} ${tier.tag}` : text;

        el.style.setProperty('--pz', tier.scale);
        el.style.setProperty('--pc', tier.color);
        el.style.setProperty('--pg', tier.glow);

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;

        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;

        this.gameContainer.appendChild(el);
        setTimeout(() => el.remove(), 1100);
    }

    /**
     * Vòng xung kích sóng lan tỏa (Shockwave ring) + tia sáng (Sparks)
     * @param {HTMLElement|DOMRect} target
     * @param {string} color Mã màu viền và tia sáng
     * @param {number} count Số lượng tia sáng
     */
    burst(target, color = '#38bdf8', count = 12) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;
        const radius = Math.max(26, Math.min(rect.width, rect.height) * 0.45);

        // 1. Shockwave Ring
        const ring = document.createElement('div');
        ring.className = 'vfx-ring';
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        ring.style.borderColor = color;
        this.gameContainer.appendChild(ring);
        setTimeout(() => ring.remove(), 650);

        // 2. Radial Sparks
        const N = count || 12;
        for (let k = 0; k < N; k++) {
            const angle = (Math.PI * 2 * k) / N + (Math.random() * 0.4 - 0.2);
            const dist = radius * (1.2 + Math.random() * 0.9);
            const dx = (Math.cos(angle) * dist).toFixed(1);
            const dy = (Math.sin(angle) * dist).toFixed(1);
            const size = (4 + Math.random() * 4).toFixed(1);

            const spark = document.createElement('div');
            spark.className = 'vfx-spark';
            spark.style.left = `${cx}px`;
            spark.style.top = `${cy}px`;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.backgroundColor = color;
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);
            spark.style.animationDelay = `${(Math.random() * 0.05).toFixed(2)}s`;

            this.gameContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 750);
        }
    }

    /**
     * Hiệu ứng nảy đàn hồi (Bump) cho các chỉ số HUD
     * @param {HTMLElement|string} elOrId
     */
    bump(elOrId) {
        const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) return;
        el.classList.remove('bump');
        void el.offsetWidth; // Force reflow
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 260);
    }

    /**
     * Mưa giấy màu / pháo hoa ăn mừng khi hoàn thành ca làm việc (Win Screen)
     */
    confetti(container = null) {
        const parent = container || this.gameContainer || document.body;
        const colors = ['#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#f97316', '#a855f7'];
        const COUNT = 36;

        for (let i = 0; i < COUNT; i++) {
            const conf = document.createElement('div');
            conf.className = 'vfx-confetti';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.6;
            const duration = 1.4 + Math.random() * 1.0;
            const sizeW = 6 + Math.random() * 6;
            const sizeH = 10 + Math.random() * 8;

            conf.style.left = `${left}%`;
            conf.style.top = '-20px';
            conf.style.width = `${sizeW}px`;
            conf.style.height = `${sizeH}px`;
            conf.style.backgroundColor = color;
            conf.style.animationDuration = `${duration}s`;
            conf.style.animationDelay = `${delay}s`;
            conf.style.transform = `rotate(${Math.random() * 360}deg)`;

            parent.appendChild(conf);
            setTimeout(() => conf.remove(), (duration + delay) * 1000 + 100);
        }
    }
}


// --- src/ui/BoxRenderer.js ---

class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;

        this._fitRows = null;
        this._fitChip = false;
        this._builtCols = 0;
        this._stacks = [];

        if (typeof ResizeObserver !== 'undefined' && this.container && this.container.parentElement) {
            new ResizeObserver(() => this._fitBoxHeight()).observe(this.container.parentElement);
        }

        // Phase 5 §5.3: Event delegation gắn 1 lần trên container
        if (this.container) {
            this.container.addEventListener('click', (e) => {
                if (document.body.classList.contains('is-dragging')) return;
                const slot = e.target.closest('.slot');
                const boxEl = e.target.closest('.box');
                if (!boxEl) return;
                const boxId = Number(boxEl.dataset.boxId);
                if (slot) {
                    const i = Number(slot.dataset.slotIndex);
                    this.onSlotTap(boxId, slot.classList.contains('placeholder') ? null : i);
                } else {
                    this.onSlotTap(boxId, null);
                }
            });

            this.container.addEventListener('pointerdown', (e) => {
                const boxEl = e.target.closest('.box.wrapped');
                if (boxEl) {
                    this.onDragStart(Number(boxEl.dataset.boxId), e);
                }
            });
        }
    }

    reset() {
        if (this.container) this.container.innerHTML = '';
        this._builtCols = 0;
        this._stacks = [];
    }

    /**
     * Dựng khung cột (băng tải, thanh nhôm, đầu nạp). Gọi khi số cột thay đổi.
     * Bỏ các chi tiết phụ không cần thiết (chân trụ, bu lông) để giảm 38 node/cột.
     */
    buildColumns(colCount, visibleRows) {
        if (this._builtCols === colCount) return;
        this.container.innerHTML = '';
        this._stacks = [];

        for (let c = 0; c < colCount; c++) {
            const colEl = document.createElement('div');
            colEl.className = 'box-column';
            colEl.dataset.colIndex = c;
            colEl.style.setProperty('--rows', visibleRows);

            const trackEl = document.createElement('div');
            trackEl.className = 'conveyor-track';

            const beltSurface = document.createElement('div');
            beltSurface.className = 'conveyor-cleat-belt';
            beltSurface.dataset.colIndex = c;

            const beamLeft = document.createElement('div');
            beamLeft.className = 'conveyor-side-beam beam-left';
            beamLeft.innerHTML = '<div class="t-slot-channel"></div>';

            const beamRight = document.createElement('div');
            beamRight.className = 'conveyor-side-beam beam-right';
            beamRight.innerHTML = '<div class="t-slot-channel"></div>';

            const entryEl = document.createElement('div');
            entryEl.className = 'conveyor-top-terminal';

            const boxStack = document.createElement('div');
            boxStack.className = 'box-stack';

            trackEl.appendChild(beltSurface);
            trackEl.appendChild(beamLeft);
            trackEl.appendChild(beamRight);
            trackEl.appendChild(entryEl);
            trackEl.appendChild(boxStack);

            colEl.appendChild(trackEl);
            this.container.appendChild(colEl);
            this._stacks.push(boxStack);
        }

        this._builtCols = colCount;
    }

    /**
     * Vẽ lại Thùng tăng dần: không xoá khung, chỉ cập nhật Thùng.
     */
    render(columns, selectedSource = null, validTargetIds = [], hiddenCounts = [], visibleRows = 5) {
        if (columns.length && !Array.isArray(columns[0])) columns = [columns];
        this.buildColumns(columns.length, visibleRows);
        this._fitBoxHeight(visibleRows, hiddenCounts.some(n => n > 0));

        columns.forEach((boxes, c) => {
            if (this._stacks[c]) {
                this._syncStack(this._stacks[c], boxes, selectedSource, validTargetIds);
                this._syncHiddenChip(c, hiddenCounts[c] || 0);
            }
        });
    }

    _syncStack(stack, boxes, selectedSource, validTargetIds) {
        const seen = new Set();
        boxes.forEach((box, i) => {
            seen.add(String(box.id));
            let el = stack.querySelector(`.box[data-box-id="${box.id}"]`);
            if (!el) {
                el = this._createBox(box);
                stack.appendChild(el);
            }
            this._updateBox(el, box, selectedSource, validTargetIds);
            if (stack.children[i] !== el) {
                stack.insertBefore(el, stack.children[i]);
            }
        });

        // Gỡ Thùng đã rời bàn chơi
        [...stack.children].forEach(el => {
            if (!seen.has(el.dataset.boxId)) el.remove();
        });
    }

    _createBox(box) {
        const boxEl = document.createElement('div');
        boxEl.className = 'box';
        boxEl.dataset.boxId = box.id;

        const topFace = document.createElement('div');
        topFace.className = 'top-face';

        for (let i = 0; i < 3; i++) {
            const slotEl = document.createElement('div');
            slotEl.className = 'slot';
            slotEl.dataset.slotIndex = i;
            topFace.appendChild(slotEl);
        }

        const frontFace = document.createElement('div');
        frontFace.className = 'front-face';

        const flapTop = document.createElement('div');
        flapTop.className = 'flap top';

        const flapBottom = document.createElement('div');
        flapBottom.className = 'flap bottom';

        const tape = document.createElement('div');
        tape.className = 'tape';

        const logoEl = document.createElement('div');
        logoEl.className = 'box-logo';

        boxEl.appendChild(topFace);
        boxEl.appendChild(frontFace);
        boxEl.appendChild(flapTop);
        boxEl.appendChild(flapBottom);
        boxEl.appendChild(tape);
        boxEl.appendChild(logoEl);

        return boxEl;
    }

    _updateBox(el, box, selectedSource, validTargetIds) {
        el.classList.toggle('empty-box', box.isEmpty());
        el.classList.toggle('wrapped', box.isWrapped);
        el.classList.toggle('valid-target', validTargetIds.includes(box.id));
        el.classList.toggle('selected', !!selectedSource && selectedSource.boxId === box.id);
        el.classList.toggle('near-pack', !box.isWrapped && box.items.length >= 2 && box.items[0] === box.items[1]);

        el.style.cursor = box.isWrapped ? 'grab' : '';

        const catId = box.getCategory() || (box.items.length > 0 ? getCategoryByItemId(box.items[0]) : null);
        const catConfig = catId ? getCategoryConfig(catId) : null;
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        if (catConfig) {
            el.style.setProperty('--cat-color', catConfig.color);
        }

        const logoEl = el.querySelector('.box-logo');
        if (logoEl) {
            if (catConfig) logoEl.style.setProperty('--cat-color', catConfig.color);
            logoEl.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
        }

        const slots = el.querySelectorAll('.slot');
        for (let i = 0; i < 3; i++) {
            const has = i < box.items.length;
            const text = has ? getItemEmoji(box.items[i]) : '—';
            if (slots[i].textContent !== text) {
                slots[i].textContent = text;
            }
            slots[i].classList.toggle('placeholder', !has);
            slots[i].classList.toggle('selected', has && !!selectedSource && selectedSource.boxId === box.id && selectedSource.itemIndex === i);
        }
    }

    _syncHiddenChip(colIndex, hidden) {
        const colEl = this.container.children[colIndex];
        if (!colEl) return;
        let chip = colEl.querySelector('.column-hidden-count');
        if (hidden > 0) {
            if (!chip) {
                chip = document.createElement('div');
                chip.className = 'column-hidden-count';
                colEl.appendChild(chip);
            }
            chip.textContent = `+${hidden}`;
            chip.title = `Còn ${hidden} Thùng bị che phía trên cột này`;
        } else if (chip) {
            chip.remove();
        }
    }

    triggerRollAnimation(colIndex) {
        if (colIndex !== undefined && colIndex !== null) {
            const belt = this.container.querySelector(`.conveyor-cleat-belt[data-col-index="${colIndex}"]`);
            if (belt) {
                belt.classList.remove('rolling-down');
                void belt.offsetWidth;
                belt.classList.add('rolling-down');
                setTimeout(() => belt.classList.remove('rolling-down'), 450);
            }
        } else {
            const belts = this.container.querySelectorAll('.conveyor-cleat-belt');
            belts.forEach(belt => {
                belt.classList.remove('rolling-down');
                void belt.offsetWidth;
                belt.classList.add('rolling-down');
                setTimeout(() => belt.classList.remove('rolling-down'), 450);
            });
        }
    }

    _fitBoxHeight(visibleRows, hasHiddenChip) {
        if (Number.isFinite(visibleRows)) this._fitRows = visibleRows;
        if (hasHiddenChip !== undefined) this._fitChip = hasHiddenChip;
        const rows = this._fitRows || 4;
        const area = this.container.parentElement;
        if (!area || !Number.isFinite(rows)) return;

        const avail = (this.container && this.container.clientHeight >= 120) ? this.container.clientHeight : area.clientHeight;
        if (avail < 120) return;

        const cs = getComputedStyle(this.container);
        const gap = parseFloat(cs.columnGap || cs.gap) || 8;

        const colW = this.container.firstElementChild
            ? this.container.firstElementChild.getBoundingClientRect().width
            : this.container.clientWidth / (this._builtCols || 3);
        const slotW = Math.max(18, (colW - 4 /*border*/ - 8 /*padding*/ - 8 /*2x gap*/) / 3);
        this.container.style.setProperty('--slot-size', `${slotW.toFixed(1)}px`);

        const room = avail - 8 - (rows - 1) * gap;
        const h = Math.max(50, Math.floor(room / rows));

        // Tran chieu cao Thung theo be rong o hang.
        //
        // He so 3.0 (truoc: 2.6) — chon lai sau khi nhin bo cuc that:
        //  - 2.6 cho Thung 84px o may 390px, chong Thung chi cao 366/583 -> con ~220px
        //    ray bang tai TRONG duoi cung, doc ra nhu "cai thang rong".
        //  - 3.0 cho Thung ~93px, chong Thung ~400/583, phan ray con lai vua du de lam
        //    diem tua thi giac chu khong con la khoang trong.
        // Khong nang cao hon: qua 3.0-3.4 thi Thung thanh hinh dung, trong khi noi dung cua
        // no la 3 o VUONG nam ngang — ti le sai se lo ngay.
        const capped = Math.min(h, Math.round(slotW * 3.0));
        this.container.style.setProperty('--box-h', `${Math.max(50, capped)}px`);
        this.container.style.setProperty('--stack-gap', `${gap}px`);
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        const srcSlot = document.querySelector(`.box[data-box-id="${sourceBoxId}"] .slot.selected`);
        const targetEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);

        if (!srcSlot || !targetEl) {
            onComplete();
            return;
        }

        const from = srcSlot.getBoundingClientRect();
        const to = targetEl.getBoundingClientRect();

        const fly = document.createElement('div');
        fly.className = 'item-animating';
        fly.textContent = srcSlot.textContent;
        fly.style.left = `${from.left}px`;
        fly.style.top = `${from.top}px`;
        document.body.appendChild(fly);

        const dx = (to.left + to.width / 2 - 12) - from.left;
        const dy = (to.top + to.height / 2 - 12) - from.top;

        requestAnimationFrame(() => {
            fly.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
        });

        setTimeout(() => {
            fly.remove();
            targetEl.style.transform = 'scale(1.08)';
            setTimeout(() => { targetEl.style.transform = ''; onComplete(); }, 90);
        }, 300);
    }
}


// --- src/ui/TrayRenderer.js ---

class TrayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.offset = 0;
        this.baseSpeed = 0.015; // radians per frame at 60fps
        this.trayElements = [];
        this.slotCount = 4;
        // Hang so thoi gian cua buoc dan deu lai vong Khay sau moi lan Khay ra/vao.
        this.respaceTau = 260; // ms
        this.shiftDecayTime = 0;
        this.lastTime = performance.now();
        this.highlightedTrayId = null;
        this.rejectTrayId = null;
        this.animate = this.animate.bind(this);
        this.onTick = null;
        
        this.geom = this.readBeltGeometry();
        this._ro = new ResizeObserver(() => { this.geom = this.readBeltGeometry(); });
        this._ro.observe(this.container);

        this.running = false;
    }

    reset() {
        this.container.innerHTML = '';
        this.trayElements = [];
        this.slotCount = 4;
        this.offset = 0;
        this.shiftDecayTime = 0;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.animate);
    }

    /**
     * Ban kinh vung giao hang, tinh bang PIXEL tren lan chay.
     *
     * DAY LA HOP DONG GAMEPLAY. 28px la ngưỡng nguyen ban cua UIManager truoc khi
     * tach khoi hinh hoc:
     *     if (Math.abs(trayCenterX - slotCenterX) <= 28) triggerQueueDelivery(...)
     *
     * Giu don vi PIXEL chu khong phai ti le vong chay: chieu dai hanh trinh doi theo
     * be rong may (432px o 390px, 402px o 360px...), nen mot ti le co dinh se lam
     * nhip giao NHANH CHAM KHAC NHAU tuy may — dung thu can tranh nhat. Doi sang ti
     * le ngay tai cho dung, dua tren hinh hoc thuc.
     */
    static get DELIVERY_RADIUS_PX() { return 28; }

    /** Tiến độ 0..1 của một Khay trên vòng chạy, 0 tại cổng IN. */
    getTrackProgress(theta) {
        return (((-theta) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
    }

    /**
     * Khay có đang nằm trong cửa sổ giao ứng với ô hàng chờ thứ slotIdx không.
     */
    /**
     * Khay co dang o vung giao cua o hang cho thu slotIdx khong.
     *
     * DAY LA HOP DONG GAMEPLAY — tai lap DUNG phep thu nguyen ban cua UIManager:
     *     isFrontTrack: |pt.y - (cy - hy)| < 22
     *     trung o     : |trayCenterX - slotCenterX| <= 28
     * Chi khac mot diem: toa do doc tu he cua #trays-container thay vi tu
     * getBoundingClientRect() cua hai phan tu, nen doi bo cuc khong lam lech nhip giao.
     */
    isInDeliveryZone(trayObj, slotIdx, queueLength) {
        const g = this.geom;
        const pt = this.getTrackPoint(trayObj.currentTheta);
        if (Math.abs(pt.y - g.frontY) >= 22) return false;   // phai o nhanh chay truoc

        const slotEl = document.querySelectorAll('.queue-slot')[slotIdx];
        if (!slotEl) return false;
        const cRect = this.container.getBoundingClientRect();
        const sRect = slotEl.getBoundingClientRect();
        const slotLocalX = (sRect.left + sRect.width / 2) - cRect.left;

        return Math.abs(pt.x - slotLocalX) <= TrayRenderer.DELIVERY_RADIUS_PX;
    }



    /**
     * Hinh hoc VONG CHAY — do truc tiep tu DOM.
     *
     * Vi sao quay lai vong chay (sau khi thu lan thang mot chieu):
     *   Lan thang KHONG THE dam bao hien du maxActive Khay, va day la rang buoc bat
     *   bien cua khu don hang. Hai ly do do duoc bang so:
     *     - Khay phai truot vao/ra hai dau, nen moi Khay chi "doc duoc" khoang 78%
     *       thoi gian. O man 1 (2 Khay) chi 57% so khung hinh thay du ca hai.
     *     - O man 50, maxActive len 6-7. 7 Khay x 62px = 434px, trong khi lan chi rong
     *       ~340px o may 360px. Khong du cho, du co lam gi voi quy dao.
     *   Vong chay co chu vi ~2x be rong lan nen chua duoc ca 7 Khay va khong Khay nao
     *   phai roi khung. Day dung la ly do ban delivery dung vong chay ngay tu dau.
     *
     * Cai VAN GIU lai tu ban lan thang: chieu cao. Vong chay o day cao ~118px thay vi
     * 242px cua delivery — van tra ve cho ban choi hon 120px.
     */
    readBeltGeometry() {
        const cRect = this.container.getBoundingClientRect();
        const belt  = document.getElementById('conveyor-belt');
        const bRect = (belt && belt.getBoundingClientRect().width > 40)
            ? belt.getBoundingClientRect() : cRect;

        const W     = this.container.clientWidth || cRect.width || 600;
        const beltW = Math.max(80, cRect.width || bRect.width);
        const beltH = Math.max(60, cRect.height || bRect.height);

        // Kich thuoc Khay bi RANG BUOC HAI PHIA. Sizing o day thuan TRINH BAY: khong
        // doi maxActive, khong doi thu tu Khay, khong doi luat nhan hang.
        //
        //  (1) Chieu cao: vong chay co HAI nhanh xep chong theo chieu doc, nen
        //      trayH <= (beltH - le) / 2. Bo qua rang buoc nay thi hai nhanh dam vao
        //      nhau va Khay chong len nhau — dung loi vua thay o ban thu truoc.
        //  (2) Chu vi: o man 50 maxActive len 6-7; n Khay phai vua chu vi vong chay.
        const n = Math.max(1, this.slotCount || 4);
        const margin = 4;

        let trayH = Math.max(36, Math.min(58, Math.floor((beltH - margin * 2 - 4) / 2)));
        let trayW = Math.round(trayH * 0.94);

        const perim = 2 * Math.max(0, beltW - trayW) + 2 * Math.max(0, beltH - trayH);
        const need  = n * (trayW + 6);
        if (need > perim && need > 0) {
            trayW = Math.max(32, Math.round(trayW * (perim / need)));
            trayH = Math.round(trayW * 1.06);
        }

        const cx = W / 2;
        const cy = beltH / 2;                       // do tu DAY #trays-container len

        const hx = Math.max(20, beltW / 2 - trayW / 2 - margin);
        const hy = Math.max(16, beltH / 2 - trayH / 2 - margin);
        const radius = Math.min(18, hx * 0.45, hy * 0.45);

        return {
            cx, cy, beltW, beltH, hx, hy, r: radius, trayW, trayH,
            frontY: cy - hy,                        // nhanh chay TRUOC (Khay di phai->trai)
        };
    }

    getTrackPoint(theta) {
        const g = this.geom;
        const Lx = Math.max(0, 2 * (g.hx - g.r));
        const Ly = Math.max(0, 2 * (g.hy - g.r));
        const C = (Math.PI / 2) * g.r;
        const P = 2 * Lx + 2 * Ly + 4 * C;

        if (P <= 0) return { x: g.cx, y: g.cy };

        // Chuyen doi theta (dang giam dan khi troi) ve khoang cach d tang dan theo chieu kim dong ho
        let norm = ((-theta) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
        let d = (norm / (2 * Math.PI)) * P;

        const d1 = Ly / 2;
        const d2 = d1 + C;
        const d3 = d2 + Lx;
        const d4 = d3 + C;
        const d5 = d4 + Ly;
        const d6 = d5 + C;
        const d7 = d6 + Lx;
        const d8 = d7 + C;

        let x, y;

        if (d < d1) {
            // Canh phai di xuong tu tam cy den bat dau goc bo duoi
            x = g.cx + g.hx;
            y = g.cy - d;
        } else if (d < d2) {
            // Goc bo duoi-phai
            const t = (d - d1) / C;
            const ang = -t * (Math.PI / 2);
            x = g.cx + g.hx - g.r + g.r * Math.cos(ang);
            y = g.cy - g.hy + g.r + g.r * Math.sin(ang);
        } else if (d < d3) {
            // Canh day di tu phai sang trai
            const t = d - d2;
            x = g.cx + g.hx - g.r - t;
            y = g.cy - g.hy;
        } else if (d < d4) {
            // Goc bo duoi-trai
            const t = (d - d3) / C;
            const ang = -Math.PI / 2 - t * (Math.PI / 2);
            x = g.cx - g.hx + g.r + g.r * Math.cos(ang);
            y = g.cy - g.hy + g.r + g.r * Math.sin(ang);
        } else if (d < d5) {
            // Canh trai di len qua cong OUT den bat dau goc bo tren
            const t = d - d4;
            x = g.cx - g.hx;
            y = g.cy - g.hy + g.r + t;
        } else if (d < d6) {
            // Goc bo tren-trai
            const t = (d - d5) / C;
            const ang = Math.PI - t * (Math.PI / 2);
            x = g.cx - g.hx + g.r + g.r * Math.cos(ang);
            y = g.cy + g.hy - g.r + g.r * Math.sin(ang);
        } else if (d < d7) {
            // Canh dinh di tu trai sang phai
            const t = d - d6;
            x = g.cx - g.hx + g.r + t;
            y = g.cy + g.hy;
        } else if (d < d8) {
            // Goc bo tren-phai
            const t = (d - d7) / C;
            const ang = Math.PI / 2 - t * (Math.PI / 2);
            x = g.cx + g.hx - g.r + g.r * Math.cos(ang);
            y = g.cy + g.hy - g.r + g.r * Math.sin(ang);
        } else {
            // Canh phai di xuong tu dinh ve lai tam cy (cong IN)
            const t = d - d8;
            x = g.cx + g.hx;
            y = g.cy + g.hy - g.r - t;
        }

        return { x, y };
    }


    render(activeTrays, highlightedTrayId = null, rejectTrayId = null) {
        this.highlightedTrayId = highlightedTrayId;
        this.rejectTrayId = rejectTrayId;
        
        let maxActive = 4;
        if (window.gameUI && window.gameUI.engine) {
            maxActive = window.gameUI.engine.conveyor.maxActive || 4;
        }
        const totalTrays = (window.gameUI && window.gameUI.engine && window.gameUI.engine.conveyor.allTrays.length) || activeTrays.length;
        const slotCount = Math.max(1, Math.min(totalTrays, maxActive));
        const prevDelta = (2 * Math.PI) / (this.slotCount || 4);
        const slotCountChanged = slotCount !== this.slotCount;
        this.slotCount = slotCount;
        // trayW/trayH phu thuoc slotCount -> phai do lai hinh hoc sau khi doi.
        this.geom = this.readBeltGeometry();
        this.container.style.setProperty('--tray-w', `${this.geom.trayW}px`);
        this.container.style.setProperty('--tray-h', `${this.geom.trayH}px`);

        const isStartOfLevel = !activeTrays.some(tray => this.trayElements.some(t => t.id === tray.id));

        if (isStartOfLevel) {
            this.offset = 0;
            this.trayElements.forEach(t => t.el.remove());
            this.trayElements = [];
        } else if (slotCountChanged) {
            // Cuoi man, so Khay con lai tut xuong duoi maxActive nen delta doi. Quy doi
            // slotPos sang he moi de GOC hien tai cua tung Khay khong doi; viec dan ra
            // khoang cach moi de _respace() lam dan trong vai frame.
            this.trayElements.forEach(t => {
                const theta = t.slotPos * prevDelta + this.offset;
                t.slotPos = (theta - this.offset) / ((2 * Math.PI) / slotCount);
                t.targetSlotPos = t.slotPos;
            });
        }

        const delta = (2 * Math.PI) / this.slotCount;
        let newcomerIndex = 0;

        // Sync activeTrays with trayElements & slots
        activeTrays.forEach((tray, index) => {
            let existing = this.trayElements.find(t => t.id === tray.id);
            let trayEl;
            
            if (!existing) {
                // Vi tri tren vong, tinh bang DON VI SLOT (so thuc, khong phai chi so
                // nguyen). theta = slotPos * delta + offset.
                let slotPos;
                let spawnTargetTheta = 0;
                let hasSpawned = false;
                let spawnStartTime = 0;

                if (isStartOfLevel) {
                    // Vao man: maxActive Khay xep san deu vong, lo ra ngay lap tuc.
                    slotPos = index;
                    spawnTargetTheta = 0;
                    hasSpawned = true;
                } else {
                    // Giao hang xong: Khay thay the VAO NGAY TAI CONG IN.
                    //
                    // Truoc day Khay moi ke thua dung slot cua Khay vua duoc giao — ma
                    // slot do duoc giai phong o BAT KY dau tren vong (cho nguoi choi tha
                    // Thung), roi Khay moi bi giau cho toi khi slot ay troi den cong IN.
                    // Do o level 50 (6 Khay, ~7s/vong): 0 den 3.42s moi hien ra, nen bang
                    // chuyen chi con 5 Khay du conveyor.getAllActiveTrays() van tra ve 6.
                    // Tha nhanh lien tiep thi tut xuong 4 hoac 3. Van xa "cho hon nua vong
                    // thi hien ngay" con lam Khay bup ra giua bang chuyen.
                    const gateTheta = Math.round(this.offset / (2 * Math.PI)) * 2 * Math.PI;
                    // newcomerIndex: neu hai Khay cung vao trong mot lan render thi Khay
                    // thu hai dung lui mot slot phia sau cong, khong chong len Khay dau.
                    slotPos = (gateTheta - this.offset) / delta + newcomerIndex;
                    hasSpawned = true;
                    spawnStartTime = performance.now();
                    newcomerIndex++;
                }

                trayEl = document.createElement('div');
                trayEl.className = 'tray';
                trayEl.dataset.trayId = tray.id;
                trayEl.style.position = 'absolute';
                trayEl.style.left = '0px';
                trayEl.style.bottom = '0px';
                trayEl.style.display = hasSpawned ? '' : 'none'; // an cho toi khi qua cong IN
                
                // Base structure: sleek colored cap, no explicit text label
                const capEl = document.createElement('div');
                capEl.className = 'tray-cap';
                trayEl.appendChild(capEl);
                
                this.container.appendChild(trayEl);
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    trayEl.style.setProperty('--cat-color', catConfig.color);
                    capEl.style.backgroundColor = catConfig.color;
                    trayEl.title = catConfig.label;
                }
                
                const newTrayObj = {
                    id: tray.id,
                    el: trayEl,
                    slotPos: slotPos,
                    targetSlotPos: slotPos,
                    isExiting: false,
                    currentTheta: slotPos * delta + this.offset,
                    fadingOut: false,
                    spawnTargetTheta: spawnTargetTheta,
                    hasSpawned: hasSpawned,
                    spawnStartTime: spawnStartTime
                };
                this.trayElements.push(newTrayObj);
                existing = newTrayObj;
            } else {
                trayEl = existing.el;
            }
            
            // Only update visuals if it's not exiting (exiting trays manage their own visuals)
            if (!existing.isExiting) {
                trayEl.classList.remove('highlight-match', 'highlight-reject', 'exiting');
                trayEl.classList.toggle('tray-strict', tray.matchMode === 'itemType');
                if (tray.id === highlightedTrayId) trayEl.classList.add('highlight-match');
                if (tray.id === rejectTrayId) trayEl.classList.add('highlight-reject');
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    trayEl.style.setProperty('--cat-color', catConfig.color);
                }

                // Category illustration emblem (visual hint without text)
                let illustEl = trayEl.querySelector('.tray-illustration');
                if (!tray.isFull()) {
                    if (!illustEl) {
                        illustEl = document.createElement('div');
                        illustEl.className = 'tray-illustration';
                        trayEl.appendChild(illustEl);
                    }
                    const icon = tray.targetItemId
                        ? getItemEmoji(tray.targetItemId)
                        : (catConfig ? catConfig.icon : getCategoryIcon(tray.categoryId));
                    illustEl.textContent = icon;
                } else if (illustEl) {
                    illustEl.remove();
                }
                
                // Full visual (simplified)
                let fullEl = trayEl.querySelector('.tray-full');
                if (tray.isFull()) {
                    if (!fullEl) {
                        fullEl = document.createElement('div');
                        fullEl.className = 'tray-full';
                        fullEl.style.fontSize = '40px';
                        fullEl.style.marginTop = '10px';
                        fullEl.textContent = '📦';
                        trayEl.appendChild(fullEl);
                    }
                } else if (fullEl) {
                    fullEl.remove();
                }
            }
        });
        
        // Remove trays that are not in activeTrays AND not isExiting
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const t = this.trayElements[i];
            if (!t.isExiting) {
                const stillActive = activeTrays.some(a => a.id === t.id);
                if (!stillActive) {
                    t.el.remove();
                    this.trayElements.splice(i, 1);
                }
            }
        }
        
        this._respace();
        this.updatePositions(performance.now());

        // Phase 3 §3.6: Chỉ báo "còn lại N đơn"
        if (window.gameUI && window.gameUI.engine && window.gameUI.engine.conveyor) {
            const conveyor = window.gameUI.engine.conveyor;
            const allCount = conveyor.allTrays ? conveyor.allTrays.length : 0;
            const activeCount = conveyor.getAllActiveTrays ? conveyor.getAllActiveTrays().length : 0;
            const remain = allCount - activeCount;
            const remainEl = document.getElementById('tray-remaining');
            if (remainEl) {
                remainEl.textContent = remain > 0 ? `còn ${remain}` : 'đơn cuối';
                remainEl.classList.toggle('is-last', remain === 0);
            }
        }

        if (this.trayElements.length > 0) this.start();
    }

    animate(now) {
        if (!this.running) return;
        
        const dt = Math.min(now - this.lastTime, 50); // cap dt to avoid huge jumps
        this.lastTime = now;
        
        let speed = this.baseSpeed;
        if (now < this.shiftDecayTime) {
            const remain = (this.shiftDecayTime - now) / 1200;
            speed *= (1 + 0.6 * remain);
        }
        
        // speed in radians per frame (negative so front track moves right-to-left)
        const deltaTheta = -speed * (dt / 16.66);
        this.offset += deltaTheta;
        
        // Exiting trays update their own theta
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const item = this.trayElements[i];
            if (item.isExiting) {
                item.currentTheta += deltaTheta;
                
                // Out port is at left edge (cos approaches -1). Front track (sin <= 0).
                if (!item.fadingOut && Math.cos(item.currentTheta) < -0.88 && Math.sin(item.currentTheta) <= 0.08) {
                    item.fadingOut = true;
                    item.el.classList.add('exiting'); // Trigger CSS fade out
                    item.el.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
                    const curTransform = item.el.style.transform;
                    item.el.style.transform = `${curTransform} translateX(-60px) scale(0.6)`;
                    item.el.style.opacity = '0';
                    setTimeout(() => {
                        const idx = this.trayElements.indexOf(item);
                        if (idx > -1) this.trayElements.splice(idx, 1);
                        if (item.el.parentNode) item.el.remove();
                        if (item.onComplete) item.onComplete();
                    }, 350);
                }
            }
        }
        
        // Keo tung Khay ve vi tri dan deu muc tieu (xem _respace).
        const kEase = 1 - Math.exp(-dt / this.respaceTau);
        for (const item of this.trayElements) {
            if (item.isExiting) continue;
            const d = item.targetSlotPos - item.slotPos;
            if (Math.abs(d) < 0.0005) item.slotPos = item.targetSlotPos;
            else item.slotPos += d * kEase;
        }

        this.updatePositions(now);
        if (this.onTick) this.onTick(now);
        if (this.trayElements.length === 0) { this.running = false; return; }
        requestAnimationFrame(this.animate);
    }

    animateShift() {
        this.shiftDecayTime = performance.now() + 1200;
    }

    updatePositions(now = performance.now()) {
        if (!this.container || this.trayElements.length === 0) return;
        
        const g = this.geom;
        const delta = (2 * Math.PI) / (this.slotCount || 4);
        
        this.trayElements.forEach(item => {
            if (item.fadingOut) return;

            let theta;
            if (!item.isExiting) {
                const rawTheta = item.slotPos * delta + this.offset;
                
                // Check if ready to emerge at IN gate
                if (!item.hasSpawned) {
                    if (rawTheta <= item.spawnTargetTheta) {
                        item.hasSpawned = true;
                        item.spawnStartTime = now;
                        item.el.style.display = '';
                    } else {
                        item.el.style.display = 'none';
                        return;
                    }
                }
                
                theta = rawTheta;
                item.currentTheta = theta;
            } else {
                theta = item.currentTheta;
            }
            
            // Emergence animation at IN gate ("hiện lên trên cổng rồi đi ra"):
            // Opacity fades in, scale expands, rises up 16px onto the gate surface
            let spawnOpacity = 1;
            let spawnScale = 1;
            let riseY = 0;
            
            const SPAWN_DURATION = 450; // ms
            if (item.spawnStartTime && (now - item.spawnStartTime < SPAWN_DURATION)) {
                const p = Math.max(0, Math.min(1, (now - item.spawnStartTime) / SPAWN_DURATION));
                const ease = 1 - Math.pow(1 - p, 2); // ease-out quad
                spawnOpacity = ease;
                spawnScale = 0.70 + 0.30 * ease;
                riseY = (1 - ease) * 16;
            }
            
            const pt = this.getTrackPoint(theta);
            const x = pt.x;
            const y = pt.y;
            
            const finalScale = spawnScale;
            const finalY = y - riseY;
            
            item.el.style.opacity = spawnOpacity.toFixed(3);
            item.el.style.transformOrigin = 'center center';
            item.el.style.transform = 
                `translate3d(${(x - g.trayW / 2).toFixed(1)}px, ${(-finalY + g.trayH / 2).toFixed(1)}px, 0) ` +
                `scale(calc(${finalScale.toFixed(3)} * var(--hl)))`;
            item.el.style.filter = '';
            item.el.style.zIndex = '6';
        });
    }

    /**
     * Dat lai MUC TIEU vi tri cho vong Khay sao cho chung cach deu nhau, giu nguyen
     * thu tu vong tron va di chuyen it nhat (neo vao vi tri trung binh hien tai).
     * Chi dat muc tieu — animate() moi keo slotPos toi do, nen viec dan deu la mot cu
     * truot muot chu khong phai mot cu nhay.
     *
     * Day la thu thay the cho ring slot nguyen cu: Khay moi vao THANG o cong IN (nen so
     * Khay tren bang chuyen LUON bang conveyor.maxActive), roi ca vong tu dan lai cho
     * deu trong khoang 0.3s.
     */
    _respace() {
        const ring = this.trayElements.filter(t => !t.fadingOut);
        const n = ring.length;
        if (n === 0) return;

        const S = this.slotCount;
        const modS = v => ((v % S) + S) % S;
        const gap = S / n;

        // Mo vong tron thanh duong thang theo dung thu tu hien tai.
        const sorted = ring.slice().sort((a, b) => modS(a.slotPos) - modS(b.slotPos));
        const v = new Array(n);
        v[0] = modS(sorted[0].slotPos);
        for (let i = 1; i < n; i++) {
            v[i] = v[i - 1] + modS(modS(sorted[i].slotPos) - v[i - 1]);
        }

        // Neo = trung binh cua (v_i - i*gap) => tong quang duong phai dich la nho nhat.
        let anchor = 0;
        for (let i = 0; i < n; i++) anchor += v[i] - i * gap;
        anchor /= n;

        for (let i = 0; i < n; i++) {
            sorted[i].targetSlotPos = sorted[i].slotPos + (anchor + i * gap - v[i]);
        }
    }

    animateTrayExit(trayId, onComplete) {
        const trayData = this.trayElements.find(t => t.id === trayId);
        if (!trayData) {
            if (onComplete) onComplete();
            return;
        }
        
        trayData.isExiting = true;
        trayData.onComplete = onComplete;
        
        // Khay dang di ra khong con nam trong vong dan deu nua (xem _respace): no giu
        // currentTheta rieng va troi tiep toi cong OUT. Khay thay the khong doi no —
        // render() ke tiep dua Khay moi vao thang o cong IN.

        // Remove 'exiting' class just in case it was incorrectly added
        trayData.el.classList.remove('exiting');
        
        // Ensure visual shows a box
        let illustEl = trayData.el.querySelector('.tray-illustration');
        if (illustEl) illustEl.remove();
        let targetEl = trayData.el.querySelector('.tray-target');
        if (targetEl) targetEl.remove();
        
        let fullEl = trayData.el.querySelector('.tray-full');
        if (!fullEl) {
            fullEl = document.createElement('div');
            fullEl.className = 'tray-full';
            fullEl.style.fontSize = '40px';
            fullEl.style.marginTop = '10px';
            fullEl.textContent = '📦';
            trayData.el.appendChild(fullEl);
        }
    }
}


// --- src/ui/ConveyorRenderer.js ---
class ConveyorRenderer {
    constructor(beltId) {
        this.belt = document.getElementById(beltId);
    }
    
    // In a more complex version, this would handle belt animation speed, etc.
    // For this prototype, CSS handles the static repeating background.
    
    animateShift() {
        // E.g., speed up the belt temporarily
        this.belt.style.animation = 'moveBelt 0.5s linear';
        setTimeout(() => {
            this.belt.style.animation = '';
        }, 500);
    }
}


// --- src/ui/QueueRenderer.js ---

class QueueRenderer {
    constructor() {
        this.areaEl = document.getElementById('queue-area');
        this.slotsContainer = document.getElementById('queue-slots');
        this.counterEl = document.getElementById('queue-counter');
        this.maxSlots = 5;
    }

    render(queue = []) {
        if (!this.slotsContainer) return;

        const count = queue.length;
        if (this.counterEl) {
            this.counterEl.textContent = `${count}/${this.maxSlots}`;
            this.counterEl.classList.toggle('warning', count === 4);
            this.counterEl.classList.toggle('danger', count >= 5);
        }

        if (this.areaEl) {
            this.areaEl.classList.toggle('warning', count === 4);
            this.areaEl.classList.toggle('danger', count >= 5);
        }

        const slotEls = this.slotsContainer.querySelectorAll('.queue-slot');
        slotEls.forEach((slotEl, idx) => {
            const box = queue[idx];
            if (box) {
                slotEl.classList.add('occupied');
                slotEl.dataset.boxId = box.id;

                const catConfig = getCategoryConfig(box.getCategory());
                const catColor = catConfig ? catConfig.color : '#f59e0b';
                slotEl.style.setProperty('--cat-color', catColor);
                const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
                const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

                // Check if already rendered
                let boxEl = slotEl.querySelector('.queue-box');
                if (!boxEl) {
                    boxEl = document.createElement('div');
                    boxEl.className = 'queue-box';
                    boxEl.innerHTML = `<span class="queue-box-icon">${displayEmoji}</span>`;
                    slotEl.innerHTML = '';
                    slotEl.appendChild(boxEl);
                }
                boxEl.style.setProperty('--cat-color', catColor);
                boxEl.title = catConfig ? catConfig.label : '';
            } else {
                slotEl.classList.remove('occupied');
                slotEl.style.removeProperty('--cat-color');
                delete slotEl.dataset.boxId;
                slotEl.innerHTML = '';
            }
        });
    }

    /**
     * Bay hop tu vi tri tren cot xuong slot trong hang cho
     */
    animateBoxToQueue(box, targetSlotIndex, fromEl, onComplete) {
        if (!fromEl || !this.slotsContainer) {
            if (onComplete) onComplete();
            return;
        }

        const slotEls = this.slotsContainer.querySelectorAll('.queue-slot');
        const targetSlot = slotEls[targetSlotIndex];
        if (!targetSlot) {
            if (onComplete) onComplete();
            return;
        }

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = targetSlot.getBoundingClientRect();

        const catConfig = getCategoryConfig(box.getCategory());
        const catColor = catConfig ? catConfig.color : '#f59e0b';
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        const ghost = document.createElement('div');
        ghost.className = 'flying-queue-box queue-box';
        ghost.style.setProperty('--cat-color', catColor);
        ghost.style.width = `${fromRect.width}px`;
        ghost.style.height = `${fromRect.height}px`;
        ghost.style.left = `${fromRect.left}px`;
        ghost.style.top = `${fromRect.top}px`;
        ghost.style.transformOrigin = 'center center';
        ghost.innerHTML = `<span class="queue-box-icon" style="font-size:28px;">${displayEmoji}</span>`;
        document.body.appendChild(ghost);

        const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
        const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
        const scaleX = toRect.width / fromRect.width;
        const scaleY = toRect.height / fromRect.height;
        const targetScale = Math.min(scaleX, scaleY);

        requestAnimationFrame(() => {
            ghost.style.transform = `translate(${dx}px, ${dy}px) scale(${targetScale})`;
        });

        setTimeout(() => {
            ghost.remove();
            if (onComplete) onComplete();
        }, 360);
    }

    /**
     * Bay hop tu slot hang cho vao tray tren conveyor (theo thoi gian thuc khi khay di qua)
     */
    animateBoxToTray(box, fromSlotEl, trayEl, onComplete) {
        if (!fromSlotEl || !trayEl) {
            if (onComplete) onComplete();
            return;
        }

        const fromRect = fromSlotEl.getBoundingClientRect();

        const catConfig = getCategoryConfig(box.getCategory());
        const catColor = catConfig ? catConfig.color : '#f59e0b';
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        const ghost = document.createElement('div');
        ghost.className = 'flying-queue-box queue-box';
        ghost.style.transition = 'none';
        ghost.style.setProperty('--cat-color', catColor);
        ghost.style.width = `${fromRect.width}px`;
        ghost.style.height = `${fromRect.height}px`;
        ghost.style.left = `${fromRect.left}px`;
        ghost.style.top = `${fromRect.top}px`;
        ghost.style.transformOrigin = 'center center';
        ghost.innerHTML = `<span class="queue-box-icon">${displayEmoji}</span>`;
        document.body.appendChild(ghost);

        // Hide source slot box during flight
        const innerBox = fromSlotEl.querySelector('.queue-box');
        if (innerBox) innerBox.style.opacity = '0';

        const DURATION = 220; // ms
        const startTime = performance.now();
        const fromCenterX = fromRect.left + fromRect.width / 2;
        const fromCenterY = fromRect.top + fromRect.height / 2;

        const updateFlight = (now) => {
            const p = Math.min(1, (now - startTime) / DURATION);
            // Roi theo gia toc trong luc: bat dau cham, tang toc khi roi vao khay
            const ease = p * p;

            const trayRect = trayEl.getBoundingClientRect();
            const targetX = trayRect.left + trayRect.width / 2;
            const targetY = trayRect.top + trayRect.height / 2;

            const curX = fromCenterX + (targetX - fromCenterX) * ease;
            const curY = fromCenterY + (targetY - fromCenterY) * ease;
            const curScale = 1 - 0.35 * ease;

            ghost.style.left = `${curX - fromRect.width / 2}px`;
            ghost.style.top = `${curY - fromRect.height / 2}px`;
            ghost.style.transform = `scale(${curScale.toFixed(3)})`;
            ghost.style.opacity = `${(1 - 0.15 * ease).toFixed(2)}`;

            if (p < 1) {
                requestAnimationFrame(updateFlight);
            } else {
                ghost.remove();
                if (navigator.vibrate) navigator.vibrate(25);
                // Hieu ung nay nhe khi khay nhan hop
                try {
                    trayEl.animate([
                        { transform: `${trayEl.style.transform} scale(1.10)` },
                        { transform: trayEl.style.transform }
                    ], { duration: 150, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
                } catch (e) {}

                if (onComplete) onComplete();
            }
        };

        requestAnimationFrame(updateFlight);
    }
}


// --- src/ui/TutorialManager.js ---
class TutorialManager {
    constructor(uiManager, gameEngine) {
        this.ui = uiManager;
        this.engine = gameEngine;
        
        // DOM Elements
        this.container = document.getElementById('game-container');
        this.overlay = document.getElementById('tutorial-overlay');
        this.spotlightCutout = document.getElementById('spotlight-cutout');
        this.handPointer = document.getElementById('tutorial-hand');
        this.banner = document.getElementById('tutorial-banner');
        this.badgeEl = document.getElementById('tutorial-badge');
        this.textEl = document.getElementById('tutorial-text');
        this.btnSkip = document.getElementById('btn-skip-tutorial');
        this.targetHighlight = document.getElementById('tutorial-target-highlight');
        
        // Help modal elements
        this.btnHelp = document.getElementById('btn-help');
        this.overlayHelp = document.getElementById('overlay-help');
        this.btnCloseHelp = document.getElementById('btn-close-help');

        // Victory tutorial summary modal
        this.overlayTutorialWin = document.getElementById('overlay-tutorial-win');
        this.btnTutorialNext = document.getElementById('btn-tutorial-next');

        // State Machine
        // 'STEP_1_PICK_PENGUIN' -> Tap penguin in box 1
        // 'STEP_2_PLACE_PENGUIN' -> Tap penguin box 0
        // 'STEP_3_QUEUE_EXPLAIN' -> Watch box 0 wrap, go to queue, delivered by penguin tray
        // 'STEP_4_PICK_BEAR' -> Tap bear in box 3
        // 'STEP_5_PLACE_BEAR' -> Tap bear box 2
        // 'STEP_6_BEAR_QUEUE' -> Watch box 2 deliver
        // 'STEP_COMPLETE' -> Show 3 golden rules
        this.active = false;
        this.currentStep = null;
        this.currentTargetEl = null;
        this._currentPadding = 10;
        this._currentHandOffset = { x: 0, y: 55 };
        this._currentHandDirection = 'up';
        this._currentHandText = '';
        this._resizeHandler = this.updatePositions.bind(this);

        this.bindEvents();
    }

    bindEvents() {
        if (this.btnSkip) {
            const handleSkip = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.skipTutorial();
            };
            this.btnSkip.addEventListener('click', handleSkip);
            this.btnSkip.addEventListener('pointerdown', handleSkip);
        }

        if (this.btnHelp) {
            this.btnHelp.addEventListener('click', () => {
                if (this.overlayHelp) this.overlayHelp.classList.remove('hidden');
            });
        }

        if (this.btnCloseHelp) {
            this.btnCloseHelp.addEventListener('click', () => {
                if (this.overlayHelp) this.overlayHelp.classList.add('hidden');
            });
        }

        if (this.btnTutorialNext) {
            this.btnTutorialNext.addEventListener('click', () => {
                if (this.overlayTutorialWin) this.overlayTutorialWin.classList.add('hidden');
                this.ui.currentLevel = 2;
                this.ui.startNewLevel();
            });
        }

        window.addEventListener('resize', this._resizeHandler);
    }

    _parseId(id) {
        return Number(String(id).replace(/^box_/, ''));
    }

    findBoxElement(id) {
        return document.querySelector(`.box[data-box-id="${id}"]`) ||
               document.querySelector(`.box[data-box-id="box_${id}"]`);
    }

    startLevel1Tutorial() {
        this.active = true;
        document.getElementById('play-area')?.classList.add('is-tutoring');
        this.hideHighlight();
        if (this.overlay) this.overlay.classList.remove('hidden');
        if (this.overlayTutorialWin) this.overlayTutorialWin.classList.add('hidden');

        // Allow DOM to settle before calculating coordinates
        setTimeout(() => {
            this.setStep('STEP_1_PICK_PENGUIN');
        }, 180);
    }

    skipTutorial() {
        this.active = false;
        document.getElementById('play-area')?.classList.remove('is-tutoring');
        this.currentStep = null;
        this.currentTargetEl = null;
        this.clearSpotlight();
        this.hideHighlight();
        if (this.overlay) this.overlay.classList.add('hidden');
        if (this.handPointer) this.handPointer.classList.add('hidden');
    }

    hideHighlight() {
        if (this.targetHighlight) {
            this.targetHighlight.classList.add('hidden');
            this.targetHighlight.style.display = 'none';
        }
    }

    wiggleBanner() {
        if (!this.banner) return;
        this.banner.classList.add('wiggle');
        setTimeout(() => {
            if (this.banner) this.banner.classList.remove('wiggle');
        }, 350);
        if (navigator.vibrate) navigator.vibrate(15);
    }

    /**
     * Kiem tra xem thao tac tap cua nguoi choi co dung voi muc tieu cua buoc hien tai khong.
     * Ngan tuyet doi viec de item di nham vao thung khac loai trong qua trinh tutorial!
     */
    isAllowedTap(boxId, itemIndex) {
        if (!this.active || !this.currentStep) return true;
        const id = this._parseId(boxId);

        switch (this.currentStep) {
            case 'STEP_1_PICK_PENGUIN':
                return id === 1; // Chi duoc chon chim canh cut o Thung 1
            case 'STEP_2_PLACE_PENGUIN':
                return id === 0; // Chi duoc tha vao Thung 0 (thung chim canh cut)
            case 'STEP_3_QUEUE_EXPLAIN':
                return false; // Dang giai thich hang cho va cho khay nhan
            case 'STEP_4_PICK_BEAR':
                return id === 3; // Chi duoc chon gau bong o Thung 3
            case 'STEP_5_PLACE_BEAR':
                return id === 2; // Chi duoc tha vao Thung 2 (thung gau bong)
            case 'STEP_6_BEAR_QUEUE':
                return false;
            default:
                return true;
        }
    }

    /**
     * Xu ly khi nguoi choi bam nham vao thung khong duoc phep trong tutorial.
     */
    onDisallowedTap(boxId) {
        this.wiggleBanner();
        const id = this._parseId(boxId);
        const wrongBoxEl = this.findBoxElement(id);
        if (wrongBoxEl) {
            wrongBoxEl.classList.add('reject');
            setTimeout(() => wrongBoxEl.classList.remove('reject'), 220);
        }

        // Nhac nho muc tieu dung
        if (this.targetHighlight && this.targetHighlight.style.display !== 'none') {
            this.targetHighlight.style.animation = 'none';
            void this.targetHighlight.offsetWidth;
            this.targetHighlight.style.animation = 'tutorial-pulse 0.6s 2 ease-in-out';
        }
    }

    setStep(step) {
        if (!this.active) return;
        this.currentStep = step;

        switch (step) {
            case 'STEP_1_PICK_PENGUIN': {
                // Muc tieu: Chim canh cut o Thung 1
                const box1El = this.findBoxElement(1);
                const slot0 = box1El ? box1El.querySelector('.slot[data-slot-index="0"]') : null;
                const target = slot0 || box1El;

                this.showStep({
                    targetEl: target,
                    badge: 'BƯỚC 1 / 4 • CHỌN MÓN ĐỒ',
                    text: 'Chạm vào chú <b>Chim cánh cụt 🐧</b> để lấy ra khỏi thùng.',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Chạm vào đây!',
                    padding: 8,
                    pulse: true
                });
                break;
            }

            case 'STEP_2_PLACE_PENGUIN': {
                // Muc tieu: Thung 0 (dang co 2 con chim canh cut)
                const box0El = this.findBoxElement(0);

                this.showStep({
                    targetEl: box0El,
                    badge: 'BƯỚC 2 / 4 • GOM 3 MÓN CÙNG LOẠI',
                    text: 'Chạm vào <b>Thùng chim cánh cụt 🐧</b> để gom đủ 3 món!',
                    handOffset: { x: 0, y: 65 },
                    handDirection: 'up',
                    handText: 'Thả vào đây!',
                    padding: 12,
                    pulse: true
                });
                break;
            }

            case 'STEP_3_QUEUE_EXPLAIN': {
                // Spotlight khu vuc Hang cho & Bang chuyen
                this.hideHighlight(); // Khong de lai highlight thua o vi tri Thung 0!
                const queueArea = document.getElementById('queue-area');
                const conveyor = document.getElementById('conveyor-belt');
                const targetArea = queueArea || conveyor;

                this.showStep({
                    targetEl: targetArea,
                    badge: 'BƯỚC 3 / 4 • ĐÓNG GÓI & XUẤT HÀNG',
                    text: '📦 <b>Đóng gói thành công!</b> Thùng đủ 3 món dán kín và bay xuống <b>Hàng chờ</b>.<br>Khay 🐧 trên băng chuyền sẽ <b>tự động nhận hàng</b> khi chạy ngang qua!',
                    handOffset: { x: 0, y: -45 },
                    handDirection: 'down',
                    handText: 'Băng chuyền tự nhận hàng',
                    padding: 10,
                    pulse: false
                });
                break;
            }

            case 'STEP_4_PICK_BEAR': {
                // Muc tieu: Gau bong o Thung 3 (duoi cung cua cot phai)
                const box3El = this.findBoxElement(3);
                const slot0 = box3El ? box3El.querySelector('.slot[data-slot-index="0"]') : null;
                const target = slot0 || box3El;

                this.showStep({
                    targetEl: target,
                    badge: 'BƯỚC 4 / 4 • GOM GẤU BÔNG 🧸',
                    text: 'Rất tốt! Giờ hãy chạm vào chú <b>Gấu bông 🧸</b> ở thùng bên dưới để lấy ra.',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Lấy gấu bông 🧸',
                    padding: 8,
                    pulse: true
                });
                break;
            }

            case 'STEP_5_PLACE_BEAR': {
                // Muc tieu: Thung 2 (dang co 2 con gau bong o tren)
                const box2El = this.findBoxElement(2);

                this.showStep({
                    targetEl: box2El,
                    badge: 'HOÀN THÀNH • GOM ĐỦ 3 GẤU BÔNG',
                    text: 'Chạm vào <b>Thùng gấu bông 🧸</b> phía trên để hoàn tất đóng gói!',
                    handOffset: { x: 0, y: 65 },
                    handDirection: 'up',
                    handText: 'Gom vào đây!',
                    padding: 12,
                    pulse: true
                });
                break;
            }

            case 'STEP_6_BEAR_QUEUE': {
                this.hideHighlight(); // Khong de lai highlight thua o vi tri Thung 2!
                const queueArea = document.getElementById('queue-area');
                this.showStep({
                    targetEl: queueArea,
                    badge: 'XUẤT HÀNG CUỐI CÙNG 🚚',
                    text: 'Thùng gấu bông đã đóng gói! Chờ Khay 🧸 nhận hàng để hoàn thành màn chơi...',
                    handOffset: { x: 0, y: -45 },
                    handDirection: 'down',
                    handText: 'Xuất kho thành công',
                    padding: 10,
                    pulse: false
                });
                break;
            }

            case 'STEP_COMPLETE': {
                this.active = false;
                document.getElementById('play-area')?.classList.remove('is-tutoring');
                this.clearSpotlight();
                this.hideHighlight();
                if (this.overlay) this.overlay.classList.add('hidden');
                if (this.handPointer) this.handPointer.classList.add('hidden');
                
                // Hien thi modal chien thang kem 3 quy tac vang
                if (this.overlayTutorialWin) {
                    this.overlayTutorialWin.classList.remove('hidden');
                }
                break;
            }
        }
    }

    showStep({ targetEl, badge, text, handOffset = { x: 0, y: 50 }, handDirection = 'up', handText = '', padding = 8, pulse = true }) {
        this.currentTargetEl = targetEl;
        this._currentPadding = padding;
        this._currentHandOffset = handOffset;
        this._currentHandDirection = handDirection;
        this._currentHandText = handText;

        if (this.badgeEl) this.badgeEl.innerHTML = `<span class="tutorial-badge-dot"></span> ${badge}`;
        if (this.textEl) this.textEl.innerHTML = text;

        if (!targetEl) {
            this.clearSpotlight();
            this.hideHighlight();
            return;
        }

        this.updateCutout(targetEl, padding);
        this.updateHandPointer(targetEl, handOffset, handDirection, handText);

        if (this.targetHighlight) {
            if (pulse) {
                const containerRect = this.container.getBoundingClientRect();
                const rect = targetEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    this.targetHighlight.style.left = `${rect.left - containerRect.left - padding}px`;
                    this.targetHighlight.style.top = `${rect.top - containerRect.top - padding}px`;
                    this.targetHighlight.style.width = `${rect.width + padding * 2}px`;
                    this.targetHighlight.style.height = `${rect.height + padding * 2}px`;
                    this.targetHighlight.style.animation = 'tutorial-pulse 1.3s infinite ease-in-out';
                    this.targetHighlight.style.display = 'block';
                    this.targetHighlight.classList.remove('hidden');
                } else {
                    this.hideHighlight();
                }
            } else {
                this.hideHighlight();
            }
        }
    }

    updateCutout(el, padding = 8) {
        if (!el || !this.spotlightCutout || !this.container) return;
        const containerRect = this.container.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        const x = Math.max(0, rect.left - containerRect.left - padding);
        const y = Math.max(0, rect.top - containerRect.top - padding);
        const w = rect.width + padding * 2;
        const h = rect.height + padding * 2;

        this.spotlightCutout.setAttribute('x', x);
        this.spotlightCutout.setAttribute('y', y);
        this.spotlightCutout.setAttribute('width', w);
        this.spotlightCutout.setAttribute('height', h);
    }

    clearSpotlight() {
        if (this.spotlightCutout) {
            this.spotlightCutout.setAttribute('x', 0);
            this.spotlightCutout.setAttribute('y', 0);
            this.spotlightCutout.setAttribute('width', 0);
            this.spotlightCutout.setAttribute('height', 0);
        }
        this.hideHighlight();
    }

    updateHandPointer(el, offset = { x: 0, y: 50 }, direction = 'up', text = '') {
        if (!el || !this.handPointer || !this.container) return;

        const containerRect = this.container.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        const targetCenterX = rect.left + rect.width / 2 - containerRect.left;
        const targetCenterY = rect.top + rect.height / 2 - containerRect.top;

        this.handPointer.style.left = `${targetCenterX + offset.x}px`;
        this.handPointer.style.top = `${targetCenterY + offset.y}px`;

        const handIcon = this.handPointer.querySelector('.hand-icon');
        if (handIcon) {
            handIcon.textContent = direction === 'down' ? '👇' : '👆';
        }

        const handLabel = this.handPointer.querySelector('.hand-label');
        if (handLabel) {
            handLabel.textContent = text;
            handLabel.style.display = text ? 'block' : 'none';
        }

        this.handPointer.classList.remove('hidden');
    }

    updatePositions() {
        if (!this.active || !this.currentTargetEl) return;
        this.updateCutout(this.currentTargetEl, this._currentPadding);
        this.updateHandPointer(this.currentTargetEl, this._currentHandOffset, this._currentHandDirection, this._currentHandText);

        if (this.targetHighlight && this.targetHighlight.style.display !== 'none' && !this.targetHighlight.classList.contains('hidden')) {
            const containerRect = this.container.getBoundingClientRect();
            const rect = this.currentTargetEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const padding = this._currentPadding;
                this.targetHighlight.style.left = `${rect.left - containerRect.left - padding}px`;
                this.targetHighlight.style.top = `${rect.top - containerRect.top - padding}px`;
                this.targetHighlight.style.width = `${rect.width + padding * 2}px`;
                this.targetHighlight.style.height = `${rect.height + padding * 2}px`;
            } else {
                this.hideHighlight();
            }
        }
    }

    // Callbacks from UIManager
    onSlotTapped(boxId, itemIndex) {
        if (!this.active) return;
        const id = this._parseId(boxId);

        if (this.currentStep === 'STEP_1_PICK_PENGUIN') {
            if (id === 1) {
                // Chim canh cut o Thung 1 da duoc nhac len -> an highlight cu va chuyen sang chi Thung 0
                this.hideHighlight();
                setTimeout(() => {
                    this.setStep('STEP_2_PLACE_PENGUIN');
                }, 50);
            }
        } else if (this.currentStep === 'STEP_4_PICK_BEAR') {
            if (id === 3) {
                // Gau bong o Thung 3 da duoc nhac len -> an highlight cu va chuyen sang chi Thung 2
                this.hideHighlight();
                setTimeout(() => {
                    this.setStep('STEP_5_PLACE_BEAR');
                }, 50);
            }
        }
    }

    onBoxWrapped(box) {
        if (!this.active) return;
        // Xoa bo ngay lap tuc highlight va hand cu khi thung bat dau dong goi
        this.hideHighlight();
        if (this.handPointer) this.handPointer.classList.add('hidden');

        if (this.currentStep === 'STEP_2_PLACE_PENGUIN' || this.currentStep === 'STEP_1_PICK_PENGUIN') {
            setTimeout(() => {
                this.setStep('STEP_3_QUEUE_EXPLAIN');
            }, 550);
        } else if (this.currentStep === 'STEP_5_PLACE_BEAR' || this.currentStep === 'STEP_4_PICK_BEAR') {
            setTimeout(() => {
                this.setStep('STEP_6_BEAR_QUEUE');
            }, 550);
        }
    }

    onTrayDelivered(trayId, box) {
        if (!this.active) return;
        if (this.currentStep === 'STEP_3_QUEUE_EXPLAIN') {
            // Sau khi khay chim canh cut giao xong, bat dau buoc huong dan cho Gau bong 🧸
            setTimeout(() => {
                this.setStep('STEP_4_PICK_BEAR');
            }, 750);
        }
    }

    onGameStateWon() {
        if (this.ui.currentLevel === 1) {
            this.setStep('STEP_COMPLETE');
        }
    }
}


// --- src/ui/UIManager.js ---

class UIManager {
    constructor() {
        this.engine = new GameEngine();
        
        // Audio & Visual Effects
        this.audio = new AudioManager();
        this.vfx = new VFXManager();
        
        // Renderers
        this.boxRenderer = new BoxRenderer(
            'boxes-grid',
            this.handleSlotTap.bind(this),
            this.handleDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.trayRenderer.onTick = this.checkQueuePickup.bind(this);
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        this.queueRenderer = new QueueRenderer();
        this.tutorialManager = new TutorialManager(this, this.engine);
        
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.btnHeaderLevel = document.getElementById('btn-header-level');
        this.moveDisplay = document.getElementById('move-display');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnSelectLevel = document.getElementById('btn-select-level');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnSound = document.getElementById('btn-sound');
        this.soundIconOn = document.getElementById('sound-icon-on');
        this.soundIconOff = document.getElementById('sound-icon-off');
        this.btnWinReplay = document.getElementById('btn-win-replay');
        this.btnLoseLevels = document.getElementById('btn-lose-levels');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.loseReason = document.getElementById('lose-reason');
        this.moveLimitDisplay = document.getElementById('move-limit');
        this.overlayLoading = document.getElementById('overlay-loading');
        this.overlayLevelSelect = document.getElementById('overlay-level-select');
        this.levelGrid = document.getElementById('level-grid');
        this.btnCloseLevelSelect = document.getElementById('btn-close-level-select');
        
        this.winStarsEl = document.getElementById('win-stars');
        this.winStatMoves = document.getElementById('win-stat-moves');
        this.winStatTime = document.getElementById('win-stat-time');
        this.winStatEff = document.getElementById('win-stat-eff');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        this.dragState = {
            isDragging: false,
            boxId: null,
            targetTrayId: null,
            ghostW: 0,
            ghostH: 0
        };
        this._animating = false;
        this.GHOST_LIFT = 28;
        this._renderQueued = false;
        this._boLuotFlip = false;
        this._lastAffectedColIndex = null;
        
        this.bindEvents();
        this.bindEngineCallbacks();
        this.renderLevelMenu();
        this.updateSoundUI();
        
        // Start
        this.startNewLevel();
    }
    
    updateSoundUI() {
        if (!this.soundIconOn || !this.soundIconOff) return;
        if (this.audio.on) {
            this.soundIconOn.classList.remove('hidden');
            this.soundIconOff.classList.add('hidden');
        } else {
            this.soundIconOn.classList.add('hidden');
            this.soundIconOff.classList.remove('hidden');
        }
    }

    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.audio.tap();
            this.currentLevel = 1;
            this.startNewLevel();
        });
        
        const openLevelMenu = () => {
            this.audio.tap();
            this.renderLevelMenu(); // Re-render to update active level class
            this.overlayLevelSelect.classList.remove('hidden');
        };

        if (this.btnSelectLevel) {
            this.btnSelectLevel.addEventListener('click', openLevelMenu);
        }
        if (this.btnHeaderLevel) {
            this.btnHeaderLevel.addEventListener('click', openLevelMenu);
        }

        this.btnCloseLevelSelect.addEventListener('click', () => {
            this.audio.tap();
            this.overlayLevelSelect.classList.add('hidden');
        });
        
        this.btnNextLevel.addEventListener('click', () => {
            this.audio.tap();
            this.currentLevel++;
            this.startNewLevel();
        });
        
        this.btnRetry.addEventListener('click', () => {
            this.audio.tap();
            this.startNewLevel(true);
        });

        if (this.btnSound) {
            this.btnSound.addEventListener('click', () => {
                this.audio.toggle();
                this.updateSoundUI();
            });
        }

        if (this.btnWinReplay) {
            this.btnWinReplay.addEventListener('click', () => {
                this.audio.tap();
                this.startNewLevel(true);
            });
        }

        if (this.btnLoseLevels) {
            this.btnLoseLevels.addEventListener('click', () => {
                this.audio.tap();
                this.overlayLose.classList.add('hidden');
                this.renderLevelMenu();
                this.overlayLevelSelect.classList.remove('hidden');
            });
        }

        // Global unlock on first user gesture for Web Audio API
        const unlockAudio = () => {
            this.audio.ensure();
            document.removeEventListener('pointerdown', unlockAudio);
        };
        document.addEventListener('pointerdown', unlockAudio);

        // Global pointer events for dragging
        document.addEventListener('pointermove', this.handleDragMove.bind(this));
        document.addEventListener('pointerup', this.handleDragEnd.bind(this));
        document.addEventListener('pointercancel', this.handleDragEnd.bind(this));
    }
    
    renderMoveLimit() {
        if (!this.moveLimitDisplay) return;
        this.moveLimitDisplay.textContent = '';
        this.moveLimitDisplay.classList.remove('low');
    }

    showWinCelebration() {
        const elapsedSec = Math.max(1, Math.floor((performance.now() - this.levelStartTime) / 1000));
        const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const secs = (elapsedSec % 60).toString().padStart(2, '0');

        if (this.winStatMoves) this.winStatMoves.textContent = this.engine.moveCount;
        if (this.winStatTime) this.winStatTime.textContent = `${mins}:${secs}`;
        if (this.winStatEff) this.winStatEff.textContent = '100%';

        // Tính sao dựa trên độ tối ưu nước đi (1, 2, hoặc 3 sao)
        const cfg = configForLevelNumber(this.currentLevel);
        const par = cfg.par || Math.max(4, Math.floor((cfg.numBoxes || 6) * 1.5));
        let stars = 3;
        if (this.engine.moveCount > par * 1.5) stars = 2;
        if (this.engine.moveCount > par * 2.3) stars = 1;

        if (this.winStarsEl) {
            const starSpans = this.winStarsEl.querySelectorAll('.star');
            starSpans.forEach((s, idx) => {
                s.classList.remove('on');
                if (idx < stars) {
                    setTimeout(() => {
                        s.classList.add('on');
                        this.audio.star(idx);
                    }, 280 + idx * 220);
                }
            });
        }

        this.audio.win();
        this.vfx.confetti(this.overlayWin);
        this.overlayWin.classList.remove('hidden');
    }

    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                if (this.currentLevel === 1) {
                    this.tutorialManager.onGameStateWon();
                } else {
                    this.showWinCelebration();
                }
            } else if (state === 'LOST') {
                this.audio.lose();
                if (this.loseReason) {
                    const queueFull = this.engine.getQueue().length >= this.engine.maxQueueSize;
                    this.loseReason.textContent = queueFull
                        ? `Hàng chờ đầy ${this.engine.maxQueueSize}/${this.engine.maxQueueSize} và không Khay nào đang chạy nhận được các kiện này.`
                        : 'Mọi Thùng đang hiện đều đã kín 3 ô mà không có Thùng nào gom đủ 3 món cùng loại.';
                }
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
        };
        
        this.engine.onMoveCountUpdated = (count) => {
            this.moveDisplay.textContent = count;
            this.renderMoveLimit();
            this.vfx.bump('stat-moves');
        };

        this.engine.onQueueUpdated = (queue) => {
            this.queueRenderer.render(queue);
            this.vfx.bump('queue-counter');
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayDelivered = (trayId, box) => {
            if (this.tutorialManager) this.tutorialManager.onTrayDelivered(trayId, box);
            this.trayRenderer.animateTrayExit(trayId, () => {
                // Khay chua box da vao trong cua OUT -> hoan tat exit tren engine va cho phep khay moi di ra tu cua IN
                this.engine.completeTrayExit(trayId);
                this.conveyorRenderer.animateShift();
                this.trayRenderer.animateShift();
                this.updateRender();
            });
            if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        };

        this.engine.onBoxWrapped = (box) => {
            if (this.tutorialManager) this.tutorialManager.onBoxWrapped(box);
            const el = document.querySelector(`.box[data-box-id="${box.id}"]`);
            if (!el) return;
            const catConfig = getCategoryConfig(box.getCategory());
            const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
            const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
            if (catConfig) {
                el.style.setProperty('--cat-color', catConfig.color);
                let logo = el.querySelector('.box-logo');
                if (!logo) {
                    logo = document.createElement('div');
                    logo.className = 'box-logo';
                    el.appendChild(logo);
                }
                logo.style.setProperty('--cat-color', catConfig.color);
                logo.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
            }
            el.classList.add('wrapped');
            this.audio.wrap();
            this.vfx.burst(el, catConfig ? catConfig.color : '#f59e0b', 16);
            this.vfx.praise(el, 'ĐÓNG GÓI! 📦', 1);
            if (navigator.vibrate) navigator.vibrate(35);
        };
    }
    
    async renderLevelMenu() {
        this.levelGrid.innerHTML = '';
        const TOTAL_LEVELS = 50; // Render up to 50 levels for now
        
        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            const cfg = configForLevelNumber(i);
            const tier = cfg.tier;

            let tierClass = 'level-normal';
            let tierDesc = 'Thường';

            if (tier === 'tutorial') {
                tierClass = 'level-tutorial';
                tierDesc = `Hướng dẫn (${cfg.numBoxes} thùng)`;
            } else if (tier === 'onboarding' || tier === 'acclimation') {
                tierClass = 'level-acclimation';
                tierDesc = `Làm quen (${cfg.numBoxes} thùng)`;
            } else if (tier === 'hard') {
                tierClass = 'level-hard';
                tierDesc = `Khó (${cfg.numBoxes} thùng)`;
            } else if (tier === 'superhard') {
                tierClass = 'level-super-hard';
                tierDesc = `Siêu khó (${cfg.numBoxes} thùng)`;
            } else {
                tierDesc = `Thường (${cfg.numBoxes} thùng)`;
            }

            btn.classList.add(tierClass);
            btn.title = `Level ${i} • ${tierDesc}`;
            
            if (i === this.currentLevel) {
                btn.classList.add('active-level');
            }
            
            btn.addEventListener('click', () => {
                this.currentLevel = i;
                this.overlayLevelSelect.classList.add('hidden');
                this.startNewLevel();
            });
            
            this.levelGrid.appendChild(btn);
        }
    }

    async startNewLevel(isRetry = false) {
        this.overlayWin.classList.add('hidden');
        this.overlayLose.classList.add('hidden');
        this.overlayLoading.classList.remove('hidden');
        
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
        const levelData = LevelGenerator.generateLevel({ levelNumber: this.currentLevel });
        
        this.queueRenderer.render([]);
        this.trayRenderer.reset();
        this.engine.startLevel(levelData);
        this.levelDisplay.textContent = this.currentLevel;
        this.moveDisplay.textContent = "0";
        this.renderMoveLimit();
        this._boLuotFlip = true;
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');

        if (this.currentLevel === 1) {
            this.tutorialManager.startLevel1Tutorial();
        } else {
            this.tutorialManager.skipTutorial();
        }
    }
    
    updateRender() {
        if (this._renderQueued) return;
        this._renderQueued = true;
        requestAnimationFrame(() => {
            this._renderQueued = false;
            if (this._animating) return;
            this._renderNow();
        });
    }

    _renderNow() {
        const validTargets = this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : [];
        const hiddenCounts = this.engine.columns.map(
            col => Math.max(0, col.length - this.engine.visibleRows));
            
        const grid = document.getElementById('boxes-grid');
        const truoc = new Map();
        if (!this._boLuotFlip && grid) {
            for (const el of grid.querySelectorAll('.box[data-box-id]')) {
                truoc.set(el.dataset.boxId, el.getBoundingClientRect());
            }
        }

        this.boxRenderer.render(
            this.engine.getVisibleBoxes(),
            this.engine.selectedSource,
            validTargets,
            hiddenCounts,
            this.engine.visibleRows
        );
            
        this._chayFlip(grid, truoc);
        this._boLuotFlip = false;
        
        // Ensure the original box remains hidden if it's currently being dragged
        if (this.dragState.isDragging && this.dragState.boxId) {
            const dragBoxEl = document.querySelector(`.box[data-box-id="${this.dragState.boxId}"]`);
            if (dragBoxEl) dragBoxEl.classList.add('dragging');
        }
        
        let highlightTray = null;
        let rejectTray = null;
        if (this.dragState.isDragging && this.dragState.targetTrayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === this.dragState.targetTrayId);
            const box = this.engine.getBox(this.dragState.boxId);
            if (tray && box) {
                if (tray.canAccept(box)) highlightTray = tray.id;
                else rejectTray = tray.id;
            }
        }
        
        this.queueRenderer.render(this.engine.getQueue());
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
        if (this.tutorialManager && this.tutorialManager.active) {
            this.tutorialManager.updatePositions();
        }
    }
    
    _chayFlip(grid, truoc) {
        if (!grid) return;
        const itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (itMotion || this._boLuotFlip) return;

        const THOI_LUONG = 340;
        const NHIP = 'cubic-bezier(.16, 1, .3, 1)';
        const animatedCols = new Set();

        for (const el of grid.querySelectorAll('.box[data-box-id]')) {
            if (el.classList.contains('dragging')) continue;

            const cu = truoc.get(el.dataset.boxId);
            const moi = el.getBoundingClientRect();
            const colEl = el.closest('.box-column');
            const colIndex = colEl && colEl.dataset.colIndex !== undefined ? Number(colEl.dataset.colIndex) : null;

            if (!cu) {
                // Thùng mới từ kho trên đỉnh trượt XUỐNG
                el.animate(
                    [ { transform: `translateY(${-(moi.height + 14)}px)`, opacity: 0 },
                      { transform: 'none', opacity: 1 } ],
                    { duration: THOI_LUONG, easing: NHIP, delay: 50, fill: 'backwards' }
                );
                if (colIndex !== null && !animatedCols.has(colIndex)) {
                    animatedCols.add(colIndex);
                    this.boxRenderer.triggerRollAnimation(colIndex);
                    this.audio.conveyorRoll();
                }
                continue;
            }

            const dx = cu.left - moi.left;
            const dy = cu.top - moi.top;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

            el.animate(
                [ { transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' } ],
                { duration: THOI_LUONG, easing: NHIP }
            );

            // Thùng trượt xuống theo dây chuyền băng tải
            if (colIndex !== null && !animatedCols.has(colIndex)) {
                animatedCols.add(colIndex);
                this.boxRenderer.triggerRollAnimation(colIndex);
                this.audio.conveyorRoll();
            }
        }

        // Đảm bảo cột có thùng vừa biến mất hoặc bay vào hàng chờ luôn chạy cuộn băng chuyền
        if (this._lastAffectedColIndex !== null) {
            if (!animatedCols.has(this._lastAffectedColIndex)) {
                this.boxRenderer.triggerRollAnimation(this._lastAffectedColIndex);
                this.audio.conveyorRoll();
            }
            this._lastAffectedColIndex = null;
        }
    }

    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging) return;
        if (this._animating) return;
        
        // During tutorial, enforce allowed target to prevent accidental wrong placement
        if (this.tutorialManager && this.tutorialManager.active) {
            if (!this.tutorialManager.isAllowedTap(boxId, itemIndex)) {
                this.tutorialManager.onDisallowedTap(boxId);
                return;
            }
            this.tutorialManager.onSlotTapped(boxId, itemIndex);
        }
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    this.audio.tap();
                    if (navigator.vibrate) navigator.vibrate(12);
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            const sourceBoxBefore = this.engine.getBox(sourceId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            if (this.engine.selectTarget(boxId)) {
                this.audio.swap();
                this._animating = true;
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    const finishTransfer = () => {
                        if (targetBox.isWrapped) {
                            // Apply wrapped class to existing DOM to trigger transition
                            const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
                            if (domBox) {
                                const catConfig = getCategoryConfig(targetBox.getCategory());
                                const itemType = targetBox.getItemType() || (targetBox.items.length > 0 ? targetBox.items[0] : null);
                                const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
                                if (catConfig) {
                                    domBox.style.setProperty('--cat-color', catConfig.color);
                                    let logo = domBox.querySelector('.box-logo');
                                    if (!logo) {
                                        logo = document.createElement('div');
                                        logo.className = 'box-logo';
                                        domBox.appendChild(logo);
                                    }
                                    logo.style.setProperty('--cat-color', catConfig.color);
                                    logo.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
                                }
                                domBox.classList.add('wrapped');
                            }
                            
                            // Doi flap gop lai va dan bang keo (0.5s) -> sau do bay xuong hang cho
                            setTimeout(() => {
                                const currentQueue = this.engine.getQueue();
                                const nextSlotIdx = currentQueue.length;
                                const domBoxCurrent = document.querySelector(`.box[data-box-id="${boxId}"]`);
                                const wrapColEl = domBoxCurrent ? domBoxCurrent.closest('.box-column') : null;
                                if (wrapColEl && wrapColEl.dataset.colIndex !== undefined) {
                                    this._lastAffectedColIndex = Number(wrapColEl.dataset.colIndex);
                                }

                                this.queueRenderer.animateBoxToQueue(targetBox, nextSlotIdx, domBoxCurrent, () => {
                                    targetBox.queueEnteredTime = performance.now();
                                    this.engine.moveBoxToQueue(targetBox);
                                    this._animating = false;
                                    this.updateRender();
                                });
                            }, 550);
                        } else {
                            this._animating = false;
                            this.updateRender();
                        }
                    };

                    if (willEmpty) {
                        // Thung nguon da rong -> hieu ung bien mat nhe nhang truoc khi cot tut xuong
                        const srcDom = document.querySelector(`.box[data-box-id="${sourceId}"]`);
                        if (srcDom) {
                            const emptyColEl = srcDom.closest('.box-column');
                            if (emptyColEl && emptyColEl.dataset.colIndex !== undefined) {
                                this._lastAffectedColIndex = Number(emptyColEl.dataset.colIndex);
                            }
                            this.vfx.praise(srcDom, 'DỌN GỌN! 🧹', 1);
                            srcDom.classList.add('disappearing');
                            if (navigator.vibrate) navigator.vibrate(20);
                            setTimeout(() => {
                                finishTransfer();
                            }, 200);
                        } else {
                            finishTransfer();
                        }
                    } else {
                        finishTransfer();
                    }
                });
            } else {
                // Invalid or deselected
                this.audio.reject();
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    if (this.engine.selectSource(boxId, itemIndex)) {
                        this.audio.tap();
                    }
                }
                
                const el = document.querySelector(`.box[data-box-id="${boxId}"]`);
                if (el) {
                    el.classList.add('reject');
                    setTimeout(() => el.classList.remove('reject'), 220);
                }
                if (navigator.vibrate) navigator.vibrate(18);
                
                this.updateRender();
            }
        }
    }
    
    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (!this.engine.startDragWrappedBox(boxId)) return;
        
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.pointerId !== undefined && e.target && e.target.setPointerCapture) {
                try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
            }
            this.dragState.pointerId = e.pointerId;
            this.dragState.pointerTarget = e.target;
        }

        this.dragState.isDragging = true;
        this.dragState.boxId = boxId;
        this.dragState.targetTrayId = null;
        
        // Add dragging class to original box
        const boxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
        if (boxEl) boxEl.classList.add('dragging');
        const colEl = boxEl ? boxEl.closest('.box-column') : null;
        this.dragState.colIndex = (colEl && colEl.dataset.colIndex !== undefined) ? Number(colEl.dataset.colIndex) : null;
        
        document.body.classList.add('is-dragging');
        
        // Setup ghost — capture the actual rendered size BEFORE changing className
        const boxRect = boxEl.getBoundingClientRect();
        this.dragState.ghostW = boxRect.width;
        this.dragState.ghostH = boxRect.height;
        this.dragGhost.className = boxEl.className; // Copy .box .wrapped etc.
        this.dragGhost.classList.remove('dragging'); // Ensure ghost is visible
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.position = 'fixed';
        this.dragGhost.style.width = `${boxRect.width}px`;
        this.dragGhost.style.height = `${boxRect.height}px`;
        this.dragGhost.style.zIndex = '1000';
        this.dragGhost.style.pointerEvents = 'none';
        this.dragGhost.style.margin = '0';
        this.dragGhost.innerHTML = boxEl.innerHTML; // Clone visual
        this.moveGhost(e.clientX, e.clientY);
        
        this.updateRender();
    }
    
    handleDragMove(e) {
        if (!this.dragState.isDragging) return;
        e.preventDefault();
        
        this.moveGhost(e.clientX, e.clientY);
        
        // Hit test against trays
        const hitY = e.clientY - this.GHOST_LIFT;
        const elementsUnder = document.elementsFromPoint(e.clientX, hitY);
        const trayEl = elementsUnder.find(el => el.classList && el.classList.contains('tray'));
        
        const newTargetTrayId = trayEl ? trayEl.dataset.trayId : null;
        
        if (this.dragState.targetTrayId !== newTargetTrayId) {
            this.dragState.targetTrayId = newTargetTrayId;
            this.updateRender();
        }
    }
    
    handleDragEnd(e) {
        if (!this.dragState.isDragging) return;
        
        if (this.dragState.pointerId !== undefined && this.dragState.pointerTarget && this.dragState.pointerTarget.releasePointerCapture) {
            try { this.dragState.pointerTarget.releasePointerCapture(this.dragState.pointerId); } catch (_) {}
        }
        this.dragState.pointerId = null;
        this.dragState.pointerTarget = null;

        const boxId = this.dragState.boxId;
        const trayId = this.dragState.targetTrayId;
        const sourceColIndex = this.dragState.colIndex;
        
        this.dragState.isDragging = false;
        this.dragState.boxId = null;
        this.dragState.targetTrayId = null;
        this.dragState.colIndex = null;
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.remove('is-dragging'));
        });
        
        if (trayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === trayId);
            const box = this.engine.getBox(boxId);
            
            if (tray && box && tray.canAccept(box)) {
                // Animate ghost dropping into tray
                const trayEl = document.querySelector(`.tray[data-tray-id="${trayId}"]`);
                if (trayEl) {
                    const rect = trayEl.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;
                    
                    this.dragGhost.style.transition = 'all 0.3s ease-in';
                    const ghostW = this.dragGhost.offsetWidth;
                    const ghostH = this.dragGhost.offsetHeight;
                    this.dragGhost.style.left = `${targetX - ghostW / 2}px`;
                    this.dragGhost.style.top = `${targetY - ghostH / 2}px`
                    this.dragGhost.style.transform = 'scale(0.5)';
                    this.dragGhost.style.opacity = '0';
                    
                    setTimeout(() => {
                        this.dragGhost.style.display = 'none';
                        this.dragGhost.style.transition = '';
                        this.dragGhost.style.transform = '';
                        this.dragGhost.style.opacity = '';
                        this.dragGhost.style.width = '';
                        this.dragGhost.style.height = '';
                        if (sourceColIndex !== null) {
                            this._lastAffectedColIndex = sourceColIndex;
                        }
                        this.engine.dropOnTray(trayId);

                        const catConfig = getCategoryConfig(box.getCategory());
                        const color = catConfig ? catConfig.color : '#38bdf8';
                        this.audio.combo(1);
                        this.vfx.burst(trayEl, color, 14);
                        this.vfx.praise(trayEl, 'XUẤT XƯỞNG! 🚚', 1);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
                this.audio.reject();
            }
        }
        
        this.dragGhost.style.display = 'none';
        this.dragGhost.style.width = '';
        this.dragGhost.style.height = '';
        this.engine.cancelDrag();
        this.updateRender();
    }
    
    moveGhost(x, y) {
        const w = this.dragState.ghostW || 120;
        const h = this.dragState.ghostH || 70;
        this.dragGhost.style.left = `${x - w / 2}px`;
        this.dragGhost.style.top = `${y - h / 2 - this.GHOST_LIFT}px`;
    }

    /**
     * Kiem tra theo thoi gian thuc tren tung frame: khi Khay tren bang chuyen
     * di ngang qua dung vi tri slot cua Thung trong hang cho thi moi bat dau giao hang.
     */
    checkQueuePickup(now = performance.now()) {
        if (this.engine.gameState !== 'PLAYING') return;
        if (this._animating) return;

        const queue = this.engine.getQueue();
        if (queue.length === 0) return;

        const activeTrays = this.engine.conveyor.getAllActiveTrays();
        if (activeTrays.length === 0) return;

        for (let slotIdx = 0; slotIdx < queue.length; slotIdx++) {
            const box = queue[slotIdx];
            if (!box) continue;

            // Cho thung nam yen trong slot it nhat 250ms sau khi bay xuong hang cho
            if (box.queueEnteredTime && (now - box.queueEnteredTime < 250)) {
                continue;
            }

            // Tim khay phu hop dang hoat dong
            const matchingTray = activeTrays.find(t => t.canAccept(box));
            if (!matchingTray) continue;

            const trayObj = this.trayRenderer.trayElements.find(t => t.id === matchingTray.id);
            if (!trayObj || trayObj.isExiting || trayObj.isReceiving || trayObj.fadingOut) continue;

            const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);
            const trayEl = trayObj.el;
            if (!slotEl || !trayEl) continue;

            // Phase 1 §1.4: Tách giao hàng khỏi toạ độ hình học
            if (!this.trayRenderer.isInDeliveryZone(trayObj, slotIdx, queue.length)) continue;

            this.triggerQueueDelivery(box, matchingTray, slotEl, trayEl);
            break; // Giao 1 thung moi lan
        }
    }

    triggerQueueDelivery(box, tray, slotEl, trayEl) {
        this._animating = true;

        const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
        if (trayObj) {
            trayObj.isReceiving = true;
        }

        slotEl.classList.add('dispatching');
        if (navigator.vibrate) navigator.vibrate(15);

        this.queueRenderer.animateBoxToTray(box, slotEl, trayEl, () => {
            slotEl.classList.remove('dispatching');
            this.engine.deliverQueueBox(box.id, tray.id);
            this._animating = false;

            const now = performance.now();
            if (this.lastDeliveryTime && (now - this.lastDeliveryTime < 3400)) {
                this.comboStreak++;
            } else {
                this.comboStreak = 1;
            }
            this.lastDeliveryTime = now;

            const catConfig = getCategoryConfig(box.getCategory());
            const color = catConfig ? catConfig.color : '#38bdf8';
            this.audio.combo(this.comboStreak);
            this.vfx.burst(trayEl, color, 14);
            const slogan = this.comboStreak >= 2 ? `COMBO X${this.comboStreak}! ⚡` : 'XUẤT XƯỞNG! 🚚';
            this.vfx.praise(trayEl, slogan, this.comboStreak);
            this.vfx.bump('queue-counter');

            this.updateRender();
        });
    }
}

// Bootstrap
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        window.gameUI = new UIManager();
    });
} else {
    window.gameUI = new UIManager();
}

