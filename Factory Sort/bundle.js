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
            color: '#FFB6C1', // Pink
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
            color: '#FFDAB9', // Peach
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
            color: '#ADD8E6', // Light Blue
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
            color: '#90EE90', // Light Green
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
            color: '#C8B7A6', // Warm grey
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
            color: '#DDA0DD', // Plum
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
            color: '#F5E07A', // Soft yellow
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
            color: '#7FD1C1', // Teal
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
        if (this.matchMode === 'itemType') {
            return box.getItemType() === this.targetItemId;
        }
        return box.getCategory() === this.categoryId;
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
        this.conveyor = new Conveyor();
        this.selectedBoxId = null;
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.moveLimit = null;   // null = khong gioi han
        this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
        
        // Callbacks for UI
        this.onBoxUpdated = null;
        this.onBoxWrapped = null;
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
        return this.boxes.find(b => b.id === id);
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
        
        // Notify UI of box updates
        if (this.onBoxUpdated) {
            this.onBoxUpdated(sourceBox);
            this.onBoxUpdated(targetBox);
        }

        // Check if wrapped
        if (targetBox.checkWrapped()) {
            if (this.onBoxWrapped) this.onBoxWrapped(targetBox);
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
        
        // Remove box from play area + cho cot tut xuong
        this.boxes = this.boxes.filter(b => b.id !== box.id);
        this._removeFromColumn(box.id);
        
        this.draggedBoxId = null;

        if (this.onTrayDelivered) {
            // Che do UI: Khay chua box tiep tuc chay tren bang chuyen ve cua OUT.
            // Chi khi khay vao trong cua OUT thi khay moi moi duoc go va sinh ra tu cua IN.
            this.onTrayDelivered(trayId);
        } else {
            // Che do khong UI (test / headless): go khay ngay lap tuc
            this.conveyor.removeTray(trayId);
            if (this.onTrayExited) this.onTrayExited(trayId);
            this.checkConditions();
        }
        
        if (this.onBoxUpdated) this.onBoxUpdated(box, true); // True flag for 'removed'

        return true;
    }

    /** Goi boi UI khi Khay chua box da di vao trong cua OUT */
    completeTrayExit(trayId) {
        this.conveyor.removeTray(trayId);
        if (this.onTrayExited) this.onTrayExited(trayId);
        this.checkConditions();
    }

    checkConditions() {
        if (this.gameState !== 'PLAYING') return;

        // Check Win
        // All trays cleared, no items left
        const noItemsLeft = this.boxes.every(b => b.isEmpty());
        if (!this.conveyor.hasRemainingTrays() && noItemsLeft) {
            this.setGameState('WON');
            return;
        }

        // Het nuoc di. Chi ket thuc khi nguoi choi THUC SU khong con gi lam duoc:
        // moveCount chi dem nuoc CHUYEN MON, con keo Thung da wrap len Khay thi
        // khong ton nuoc di. Neu ket thuc ngay khi cham gioi han thi mot van hoan
        // hao — nuoc cuoi cung wrap not Thung cuoi — se bi xu THUA truoc khi nguoi
        // choi kip giao no, tuc la dung dung par thi khong bao gio thang duoc.
        if (this.moveLimit && this.moveCount >= this.moveLimit) {
            const canStillDeliver = this.boxes.some(
                (b) => b && b.isWrapped && this.isAccessible(b.id) && this.conveyor.findMatchingTray(b)
            );
            if (!canStillDeliver) {
                this.setGameState('LOST');
                return;
            }
        }

        // Check Lose
        // Chi tinh tren Thung TRONG TAM VOI. O trong nam trong Thung bi che thi
        // nguoi choi khong dung duoc, nen dem ca chung vao la game se tuong nguoi
        // choi con duong di trong khi ho da ket cung.
        const reachable = this.boxes.filter(b => this.isAccessible(b.id));
        const activeBoxes = reachable.filter(b => !b.isWrapped && !b.isEmpty());
        const hasEmptySlots = activeBoxes.length === 0 || reachable.some(b => !b.isWrapped && !b.isFull());
        
        // Edge case: if we have wrapped boxes but no active trays match them, we might be stuck
        // But let's stick to the GDD rule first: Lose when no empty slots.
        if (!hasEmptySlots) {
            this.setGameState('LOST');
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
 * NGUYEN LY: REVERSE GENERATION (xay nguoc tu trang thai thang)
 * ============================================================================
 *
 * GDD muc 8.2: BFS forward no branching factor -> freeze UI -> solver bi skip.
 * Cach fix khong phai la solver manh hon, ma la DOI CHIEU SINH LEVEL:
 *
 *   1. Bat dau tu trang thai THANG:  S box moi box = 1 bo 3 item cung loai,
 *      cong E box rong.
 *   2. Ap dung K "nuoc di nguoc" hop le -> ra trang thai roi S_K.
 *   3. Loi giai forward CHINH LA day nuoc di dao nguoc: S_K -> S_{K-1} -> ... -> S_0.
 *
 * => Solvability la BAT BIEN CUA CAU TRUC, khong phai ket qua cua search.
 *    Chi phi sinh level: O(K), khong phai O(b^d).
 *
 * BAT BIEN AN TOAN (quan trong):
 *   Trong game that, box du 3 item cung loai se TU DONG wrapped va KHOA CUNG.
 *   Neu trong luc scramble ta tao ra mot box 3-item-cung-loai "ngoai y muon",
 *   thi khi replay forward, box do se wrap som va chan mat nuoc di tiep theo.
 *   => Bat bien: sau MOI nuoc di nguoc, box duy nhat duoc phep la 3-cung-loai
 *      la box "pristine" (box goc chua he bi dung toi).
 *   Bat bien nay duoc kiem tra trong canReverseMove().
 *
 * DIEU KIEN THUA cung tu dong duoc thoa: tren duong di S_K -> S_0, moi buoc
 * deu ton tai it nhat 1 o trong (chinh la o vua tao ra o box dich), nen
 * hasEmptySlots luon true -> khong bao gio LOST giua chung.
 *
 * ============================================================================
 * DIEU CHINH DO KHO BANG THAM SO (xem DEFAULTS + PRESETS)
 * ============================================================================
 */


/* ------------------------------------------------------------------ */
/* Item Catalog (khop GDD 9.2 / ItemCatalog.js)                        */
/* ------------------------------------------------------------------ */

// Catalog duy nhat cua game la ItemCatalog.js. Truoc day file nay giu mot ban
// sao rieng va da troi khoi ban goc ('rabbit' vs 'bunny', 'clip' vs 'paperclip').
// Hau qua: getCategoryByItemId() tra ve null cho item sinh ra tu day => Box.getCategory()
// null => Tray.canAccept() luon false => Thung wrapped KHONG BAO GIO giao duoc.
// Nay derive truc tiep, khong con kha nang lech.
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

// So loai item nhieu nhat trong MOT nhom hang, va tong so loai cua ca catalog.
// Cham diem va clamp phai doc hai so nay chu khong hardcode "3" / "12": catalog da
// mo rong tu 4 nhom x 3 loai len 8 nhom x 4 loai (9/2026) va con co the doi tiep.
const MAX_TYPES_PER_CAT = Math.max(...CATEGORIES.map((c) => c.items.length));
const TOTAL_TYPES = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  seed: 1,

  // --- Quy mo ban choi ---
  numBoxes: 6,            // tong so Thung
  boxCapacity: 3,         // GDD: co dinh 3
  numEmptyBoxes: 0,       // so Thung RONG hoan toan luc bat dau.
                          // LUAT MOI (9/2026): = 0. Luc spawn KHONG duoc co Thung
                          // rong nao, moi Thung phai co it nhat 1 vat. Xem
                          // noEmptyBoxes ben duoi va buoc 5 trong buildOnce().
  numSets: null,          // so bo 3 item = so Tray. null => numBoxes - 1

  // Luc spawn moi Thung phai co >= 1 vat. Voi cap=3 va S = N-1 thi con dung
  // 3 o trong, va vi khong Thung nao duoc rong nen mot Thung giu toi da 2 o trong.
  // Bat buoc voi moi man choi that; chi tat khi debug.
  noEmptyBoxes: true,

  // --- BO CUC KHU THUNG: cot doc, co Thung bi che ---
  // Khu Thung la `columns` cot; moi cot chi hien `visibleRows` Thung duoi cung,
  // phan tren BI CHE va KHOA HOAN TOAN (khong keo item vao/ra duoc). Khi mot Thung
  // duoc giao cho Khay, no roi khoi cot, ca cot tut xuong va lo them 1 Thung.
  //
  // Toan bo noi dung — ke ca phan an — duoc chot ngay luc spawn, nen bo sinh man
  // van chung minh duoc tinh giai duoc. Nhung loi giai tham chieu PHAI khong dung
  // toi Thung nao dang bi che: xem assignLayout() va simulateWithLayout().
  columns: 3,
  visibleRows: 4,
  // Khi noEmptyBoxes: 3 o trong nam o MAY Thung khac nhau.
  //   2 => phan bo 2+1 (co mot Thung 2 o trong = cho dan xep rong rai) -> DE hon
  //   3 => phan bo 1+1+1 (khong Thung nao co qua 1 o trong)            -> KHO hon
  // Day la can gat thay the cho compactFreeSlots cu, von vo nghia khi khong con
  // Thung rong de gom o trong vao.
  freeSlotBoxes: 2,

  // --- Item pool ---
  numCategories: 2,       // 1..CATEGORIES.length (hien tai 8)
  itemTypesPerCategory: 2,// 1..MAX_TYPES_PER_CAT (hien tai 4)
  maxSetsPerType: 3,      // 1 loai item co the chiem toi da may bo (=> may Tray)

  // --- DO KHO: do phan tan ---
  ratio21: 0.6,           // ti le bo kieu "2+1" (2 item chung box, 1 tach ra).
                          // Con lai la "1+1+1" (3 item o 3 box khac nhau).
                          // Lay tu phan tich 4501 level: 60.3% / 39.7%.
                          // 1.0 = de nhat, 0.0 = kho nhat.

  // --- DO KHO: do roi them ---
  extraScramble: 0.0,     // He so nuoc di nguoc BO SUNG (0..2).
                          //
                          // DAY LA CAN GAT DO NHIEU, KHONG PHAI CAN GAT DO KHO.
                          // Do tren N=10 S=9, 40 seed moi muc (9/2026):
                          //
                          //   extraScramble | refMoves | IDA* toi uu | lowerBound
                          //         0       |   18.6   |    16.0     |   15.0
                          //         2       |   52.5   |    17.1     |   16.1
                          //         8       |  154.4   |    17.1     |   16.1
                          //
                          // Xao them 8 lan keo dai loi giai THAM CHIEU gap 8, nhung
                          // loi giai TOI UU chi dai them 1 nuoc — va bao hoa ngay tu
                          // muc 2. Ly do: moi nuoc di nguoc chi co the tang can duoi
                          // h them nhieu nhat 1, va h da gan cham tran cua cau hinh.
                          //
                          // Vi vay dung no de ban co trong "roi" hon (item cua cung
                          // mot loai nam tan mat, kho doc bang mat), dung ki vong no
                          // lam man kho hon that su. Cham diem do kho chuan hoa theo
                          // parMoves nen extraScramble gan nhu khong anh huong diem.

  // --- DO KHO: khong gian xoay xo ---
  // CHI CON HIEU LUC KHI noEmptyBoxes = false (nhanh debug). Voi luat moi thi o
  // trong duoc rai theo freeSlotBoxes o tren, khong con Thung rong de gom vao.
  compactFreeSlots: true, // true  => don het o trong ve dung numEmptyBoxes box rong
                          //           (chat, giong LevelGenerator hien tai)
                          // false => de o trong rai rac (thoang, de hon)

  // --- Tray / Conveyor ---
  trayMatchMode: 'category', // 'category' (dung code hien tai) | 'itemType' (chat hon)
  // Ti le Khay chay che do 'itemType'. null = suy ra tu trayMatchMode (0 hoac 1).
  // Cho phep BAT DAN luat chat thay vi lat cong tac ca ban: xem configForLevelNumber.
  strictTrayRatio: null,
  trayOrder: 'wrapOrder',    // 'wrapOrder' (de) | 'shuffled' | 'reverse' (kho)
  conveyorMaxActive: 4,
  conveyorType: 'oval',

  // --- Ap luc meta (GDD muc 9.3 - chua implement) ---
  moveLimitSlack: null,   // null = khong gioi han. 1.6 = de, 1.15 = kho
  secondsPerMove: null,   // null = khong gioi han. VD 6 => timeToPlay = refMoves*6
  undoCount: 3,

  // --- Van hanh ---
  // 400 chu khong phai 80. Mot vai cau hinh chat (super hard: cua so bang chuyen 1,
  // 13 Thung, 3 hang hien) chi vua khuon sau hon 80 lan xay lai — man 29 can toi 120.
  // Voi maxAttempts 80, generateLevel nem loi, LevelGenerator bat lay roi NOI LONG
  // numSets, va nguoi choi nhan mot man DE HON han man da tuyen chon. Sinh man ton
  // ~15 ms o truong hop nang nhat nen tran cao khong phai la van de hieu nang.
  maxAttempts: 400,
  verify: true,           // luon replay lai loi giai qua engine sim truoc khi tra ve
  computeOptimal: 'auto', // 'auto' | true | false  -> co chay IDA* gan minMoves khong
};

// Cac preset deu theo LUAT MOI: khong Thung rong luc spawn (noEmptyBoxes mac dinh
// true trong DEFAULTS), numSets = numBoxes - 1, va cua so bang chuyen ROI RA theo
// do kho dung nhu configForLevelNumber.
const PRESETS = {
  //          box  cat  type/cat  ratio21  oTrong  bangChuyen ...
  tutorial: { numBoxes: 4, numCategories: 1, itemTypesPerCategory: 2, ratio21: 1.0,  freeSlotBoxes: 2, conveyorMaxActive: 3 },
  easy:     { numBoxes: 6, numCategories: 2, itemTypesPerCategory: 2, ratio21: 0.85, freeSlotBoxes: 2, conveyorMaxActive: 4, moveLimitSlack: 1.8 },
  normal:   { numBoxes: 8, numCategories: 4, itemTypesPerCategory: 2, ratio21: 0.60, freeSlotBoxes: 2, conveyorMaxActive: 4, moveLimitSlack: 1.5 },
  hard:     { numBoxes: 9, numCategories: 4, itemTypesPerCategory: 3, ratio21: 0.35, freeSlotBoxes: 2, conveyorMaxActive: 5, extraScramble: 0.5, trayOrder: 'shuffled', moveLimitSlack: 1.25, strictTrayRatio: 0.4, undoCount: 2 },
  expert:   { numBoxes: 10, numCategories: 2, itemTypesPerCategory: 4, ratio21: 0.15, freeSlotBoxes: 3, conveyorMaxActive: 7, extraScramble: 1.2, trayOrder: 'reverse', moveLimitSlack: 1.05, secondsPerMove: 3.5, strictTrayRatio: 1.0, undoCount: 1 },
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

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    const rng = makeRng(cfg.seed + attempt * 7919);
    const built = buildOnce(cfg, rng);
    if (!built) continue;

    if (cfg.verify) {
      const sim = simulate(built.boxes, built.solution, cfg.boxCapacity);
      if (!sim.ok) continue; // khong bao gio nen xay ra; giu lai lam luoi an toan
      built.wrapOrder = sim.wrapOrder;
    }

    // finalize() co the tra ve null khi khong xep duoc bo cuc cot nao ma loi giai
    // khong cham vao Thung bi che — khi do thu lai voi lan xay khac.
    const level = finalize(cfg, built, attempt);
    if (level) return level;
  }

  throw new Error(
    `generateLevel: khong sinh duoc level hop le sau ${cfg.maxAttempts} lan thu. ` +
      `Kiem tra rang buoc (numBoxes/numSets/numEmptyBoxes/numCategories).`
  );
}

function generateLevelFromPreset(presetName, overrides = {}) {
  const preset = PRESETS[presetName];
  if (!preset) throw new Error(`Preset khong ton tai: ${presetName}`);
  return generateLevel({ ...preset, ...overrides });
}

// Seed da TUYEN CHON cho 50 level chinh thuc (tools/curate50.mjs, 9/2026).
//
// Cau hinh chi quyet dinh KHUNG cua mot man (bao nhieu Thung, cua so bang chuyen
// rong bao nhieu, may hang duoc nhin thay). Nhung hai man cung khung ma khac seed
// co the lech nhau 40 diem phan tram ty le thua: seed moi la thu quyet dinh cac
// item bi rai the nao va Khay doi theo thu tu nao. Vi vay 50 man nay khong duoc
// sinh ngau nhien luc chay: moi man da duoc quet 72 seed, do bang 16 van thu va
// 60 van xac nhan duoi chinh sach "smart", roi chot lai seed nao roi dung vao dai
// ty le thua muc tieu cua tier do. Ca 50 man deu dat fit = 1.00.
//
// Doi mot so o day = doi han man choi do. Neu sua, chay lai tools/curate50.mjs
// va cap nhat ca tools/levels50.json.
const LEVEL_SEEDS = {
   1: 506952114,  2: 1013904228,  3: 1520888018,  4: 2027848051,  5: 387284842,   // onboarding
   6: 894229037,  7: 1401204908,  8: 1908133265,  9: 267625489, 10: 774561765,   // onboarding
  11: 1281513879, 12: 1788648130, 13: 148053245, 14: 655227091, 15: 1161949554,   // acclimation
  16: 1668893749, 17: 28663138, 18: 535306411, 19: 1042377310, 20: 1549321505,   // acclimation
  21: 2056115239, 22: 416066765, 23: 922694200, 24: 1429986831, 25: 1939457187,   // normal/hard
  26: 296858795, 27: 803209065, 28: 1310422506, 29: 1818538713, 30: 176217486,   // normal/superhard
  31: 683391332, 32: 1190185066, 33: 1697121342, 34: 56819460, 35: 565418726,   // normal/hard
  36: 1070969177, 37: 1577430313, 38: 2084437860, 39: 445363423, 40: 950866360,   // normal/superhard
  41: 1457842231, 42: 1964643884, 43: 324199460, 44: 831397063, 45: 1338040336,   // normal/hard
  46: 1845332967, 47: 204967733, 48: 711927766, 49: 1221382284, 50: 1725317259,   // normal/superhard
};

/**
 * Lo trinh do kho theo level number — nguon su that DUY NHAT cho cau hoi
 * "level N kho the nao" (UIManager chi truyen levelNumber vao day).
 *
 * ==== BAN THIET KE 9/2026 (v2): 50 LEVEL, DO KHO DO BANG TY LE THUA ====
 *
 *   L1..L10    ONBOARDING. Day luat choi, khong thu thach. Ban nho, Khay chi doi
 *              dung NHOM, khong co Thung bi che, khong gioi han nuoc di 4 man dau.
 *   L11..L20   LAM QUEN DO KHO. Ban lon dan; L16 lan dau tien co Thung BI CHE;
 *              Khay bat dau doi dung LOAI.
 *   L21..L49   Duoi 5 = HARD (25/35/45). Duoi 9 = SUPER HARD (29/39/49).
 *              Con lai = thuong.
 *
 * ==== VI SAO CAC CON SO NAY: do bang mo phong, khong phai doan ====
 *
 * Do kho o day duoc do bang TY LE THUA cua chinh sach "smart" trong GameSim.js —
 * mot nguoi choi khong bao gio pham loi hien nhien (khong tu tao Thung day lan
 * lon, luon gom bo 3 truoc) nhung KHONG nhin truoc thu tu Khay va KHONG suy luan
 * ve cot bi che. Van nao no van thua la van doi hoi LAP KE HOACH THAT.
 *
 * Quet 384 cau hinh (336 sinh duoc 100%) cho ba ket luan, va ca ba deu di nguoc
 * ban thiet ke truoc:
 *
 *   1. visibleRows la don bay MANH NHAT. Cung mot ban N=12: vr4 thua 0%, vr3 thua
 *      22%. Chi can giau mot hang la doi han ban chat man choi — Thung rong khong
 *      bao giờ roi cot, nen giai phong nham mot Thung o hang tren la khoa vinh vien
 *      Thung ben duoi. Ban cu de cung visibleRows: 4 cho MOI level, tuc la duoi
 *      N=13 khong bao gio co Thung bi che — do la ly do lon nhat khien level "kho"
 *      truoc day khong he kho.
 *
 *   2. BANG CHUYEN HEP MOI LA KHO — nguoc han ban truoc (ban truoc noi rong hon
 *      moi kho, va da noi rong len 5..7). So do:
 *
 *        Khay chay cung luc |  1     2     3
 *        ty le thua         | 55-74% 45-51% 0-17%
 *
 *      Moi cau hinh 0% trong quet deu la cma=3; hau het cau hinh >55% deu la cma=1.
 *      Cua so hep ep nguoi choi phai GOI DUNG THU TU Khay se toi, khong duoc phep
 *      gom bo 3 tuy y — do la rang buoc lap ke hoach, khong phai rang buoc thao tac.
 *
 *   3. PHONG TO BAN KHONG LAM KHO THEM, chi lam DAI THEM. N18 vr4 chi thua 9%
 *      trong khi N12 vr3 thua 22% voi it hon 1/3 so nuoc di. Vi vay tier hard/super
 *      hard o day GIU BAN NHO (N12..N14, par 13..24 nuoc) va don toan bo do kho
 *      vao vr3 + cma hep + Khay dung loai. Dung "kho chu khong phai choi lau".
 *
 * Bang cau hinh chot cua ba tier cuoi (do voi 8 seed x 12 van moi cau hinh):
 *
 *     tier       | N     | vr | cma | Khay        | ty le thua do duoc
 *     thuong     | 11-13 |  3 |  3  | 60-90% loai |  8-28%
 *     hard       | 12-14 |  3 |  2  | 100% loai   |  63-70%
 *     super hard |  13   |  3 |  1  | 100% loai   |  80-91%
 *
 * So o cot cuoi la do THAT SU tren 50 man da chot (60 van/man, chinh sach
 * "smart"), khong phai muc tieu thiet ke. Cao hon dang ke so uoc luong truoc
 * day (~45-51% / ~55-74%) vi hai ly do: seed cua tung man da duoc tuyen chon
 * thay vi lay ngau nhien, va super hard nay ghim N = 13 thay vi noi den 14 —
 * ban to hon chi lam man DAI hon chu khong kho hon.
 *
 * Luu y: van la GIA THIET THIET KE do bang bot, phai hieu chinh khi co telemetry
 * that. Nhung khac ban truoc, moi con so o tren deu truy nguoc duoc ve mot phep do.
 */
function configForLevelNumber(level, overrides = {}) {
  const L = Math.max(1, Math.floor(level));
  const lerp = (a, b, x) => a + (b - a) * x;

  const tier =
    L <= 10 ? 'onboarding' :
    L <= 20 ? 'acclimation' :
    L % 10 === 9 ? 'superhard' :
    L % 10 === 5 ? 'hard' : 'normal';

  let c;
  if (tier === 'onboarding') {
    // Muc tieu: thua 0%. Khong Thung bi che, Khay rong rai, nhieu Thung gan xong.
    const t = (L - 1) / 9;
    c = {
      numBoxes: [4, 5, 5, 6, 6, 7, 7, 8, 9, 9][L - 1],
      numCategories: L <= 3 ? 1 : L <= 6 ? 2 : 3,
      itemTypesPerCategory: 2,
      visibleRows: 4,
      ratio21: lerp(1.0, 0.6, t),
      trayOrder: L <= 4 ? 'wrapOrder' : 'shuffled',
      trayMatchMode: 'category',
      strictTrayRatio: 0,
      conveyorMaxActive: L <= 3 ? 4 : 3,
      moveLimitSlack: L <= 4 ? null : lerp(2.2, 1.7, t),
      secondsPerMove: null,
      undoCount: 5,
    };
  } else if (tier === 'acclimation') {
    // Muc tieu: thua ~0->15%. L16 lan dau co Thung bi che va Khay doi dung loai.
    const t = (L - 11) / 9;
    const hidden = L >= 16;
    c = {
      numBoxes: Math.round(lerp(9, 12, t)),
      numCategories: hidden ? 4 : 3,
      itemTypesPerCategory: hidden ? 2 : 3,
      visibleRows: hidden ? 3 : 4,
      ratio21: lerp(0.55, 0.2, t),
      trayOrder: 'shuffled',
      trayMatchMode: hidden ? 'itemType' : 'category',
      strictTrayRatio: lerp(0, 0.6, t),
      conveyorMaxActive: 3,
      moveLimitSlack: lerp(1.7, 1.45, t),
      secondsPerMove: lerp(9, 6, t),
      undoCount: 4,
    };
  } else if (tier === 'hard') {
    const u = (L - 25) / 20;                        // 25,35,45 -> 0, 0.5, 1
    c = {
      numBoxes: Math.round(lerp(12, 14, u)),
      numCategories: 4, itemTypesPerCategory: 2,
      visibleRows: 3, ratio21: 0.4, trayOrder: 'reverse',
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 2,
      moveLimitSlack: lerp(1.40, 1.25, u),
      secondsPerMove: lerp(7, 5, u),
      undoCount: 2,
    };
  } else if (tier === 'superhard') {
    const u = (L - 29) / 20;                        // 29,39,49 -> 0, 0.5, 1
    c = {
      numBoxes: 13,   // do duoc: N13 kho hon HAN N14 o cma1 (90% vs 45%)
      numCategories: 4, itemTypesPerCategory: 2,
      visibleRows: 3, ratio21: 0.4, trayOrder: 'reverse',
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 1,
      moveLimitSlack: lerp(1.30, 1.15, u),
      secondsPerMove: lerp(6, 4.5, u),
      undoCount: 1,
    };
  } else {
    const t = clamp((L - 21) / 28, 0, 1);
    c = {
      numBoxes: Math.round(lerp(11, 13, t)),
      numCategories: 3, itemTypesPerCategory: 3,
      visibleRows: 3, ratio21: lerp(0.35, 0.1, t), trayOrder: 'shuffled',
      trayMatchMode: 'itemType', strictTrayRatio: lerp(0.6, 0.9, t),
      conveyorMaxActive: 3,
      moveLimitSlack: lerp(1.50, 1.35, t),
      secondsPerMove: lerp(8, 6, t),
      undoCount: 3,
    };
  }

  const numSets = c.numBoxes - 1;
  const poolSize = c.numCategories * c.itemTypesPerCategory;
  const maxSetsPerType = Math.max(3, Math.ceil(numSets / poolSize));
  if (poolSize * maxSetsPerType < numSets) {
    throw new Error(`configForLevelNumber(${L}): pool ${poolSize} qua nho cho ${numSets} bo`);
  }

  return {
    // Man 1-50 dung seed da tuyen chon; ngoai pham vi do thi quay ve seed suy ra.
    seed: LEVEL_SEEDS[L] ?? (L * 2654435761) % 2147483647,
    numBoxes: c.numBoxes,
    numEmptyBoxes: 0,
    noEmptyBoxes: true,
    numSets,
    numCategories: c.numCategories,
    itemTypesPerCategory: c.itemTypesPerCategory,
    maxSetsPerType,
    // O trong luon la 3 (numSets = numBoxes - 1), nen day chi la goi y phan bo.
    freeSlotBoxes: 2,
    ratio21: c.ratio21,
    extraScramble: 0,
    trayOrder: c.trayOrder,
    trayMatchMode: c.trayMatchMode,
    strictTrayRatio: c.strictTrayRatio,
    // cma = 1 la HOP LE va la don bay kho nhat: chi mot Khay voi toi duoc.
    conveyorMaxActive: Math.max(1, Math.min(c.conveyorMaxActive, numSets)),
    moveLimitSlack: c.moveLimitSlack,
    secondsPerMove: c.secondsPerMove,
    undoCount: c.undoCount,
    columns: 3,
    visibleRows: c.visibleRows,
    tier,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* Chuan hoa & kiem tra tham so                                        */
/* ------------------------------------------------------------------ */

function normalizeConfig(user) {
  const cfg = { ...DEFAULTS, ...user };
  cfg.numCategories = clamp(cfg.numCategories, 1, CATEGORIES.length);
  cfg.itemTypesPerCategory = clamp(cfg.itemTypesPerCategory, 1, MAX_TYPES_PER_CAT);
  cfg.boxCapacity = cfg.boxCapacity || CAPACITY;
  // LUAT MOI: khong Thung rong luc spawn => numEmptyBoxes = 0.
  cfg.numEmptyBoxes = cfg.noEmptyBoxes ? 0 : Math.max(0, cfg.numEmptyBoxes);
  if (cfg.numSets == null) cfg.numSets = cfg.numBoxes - 1;

  if (cfg.numSets < 1) throw new Error('numSets phai >= 1');
  if (cfg.numSets > cfg.numBoxes - 1)
    throw new Error('Phai con o trong de xoay xo: numSets <= numBoxes - 1');

  const poolSize = cfg.numCategories * cfg.itemTypesPerCategory;
  if (poolSize * cfg.maxSetsPerType < cfg.numSets) {
    throw new Error(
      `Pool item qua nho: ${poolSize} loai x ${cfg.maxSetsPerType} bo < ${cfg.numSets} bo can thiet. ` +
        `Tang numCategories hoac itemTypesPerCategory.`
    );
  }
  if (cfg.noEmptyBoxes) {
    // Dem o: N Thung, 3S vat, moi Thung >= 1 vat va <= cap vat.
    //   - du vat de phu het Thung:            3S >= N
    //   - du o trong de khong Thung nao day het: hien nhien voi S <= N-1
    if (cfg.boxCapacity * cfg.numSets < cfg.numBoxes) {
      throw new Error(
        `noEmptyBoxes: ${cfg.numSets} bo x ${cfg.boxCapacity} vat = ` +
          `${cfg.boxCapacity * cfg.numSets} vat, khong du de moi Thung trong ` +
          `${cfg.numBoxes} Thung co it nhat 1 vat. Giam numBoxes hoac tang numSets.`
      );
    }
    // So o trong = cap*(N - S). Moi Thung giu toi da cap-1 o trong (vi phai con
    // >= 1 vat), nen phai rai ra it nhat ceil(freeSlots / (cap-1)) Thung.
    const freeSlots = cfg.boxCapacity * (cfg.numBoxes - cfg.numSets);
    const minSpread = Math.ceil(freeSlots / (cfg.boxCapacity - 1));
    cfg.freeSlotBoxes = clamp(cfg.freeSlotBoxes ?? minSpread, minSpread, Math.min(freeSlots, cfg.numBoxes));
  }

  // Khi khong con Thung rong, gan nhu moi Thung deu DAY (chi freeSlotBoxes Thung
  // con o trong), nen dieu kien dem duoi day ap dung y het truong hop compaction cu.
  const boxesForcedFull = cfg.noEmptyBoxes || cfg.compactFreeSlots;
  if (boxesForcedFull) {
    const minMaxUsage = Math.ceil(cfg.numSets / poolSize);
    if (3 * minMaxUsage > 2 * cfg.numSets) {
      throw new Error(
        `Cau hinh bat kha thi: voi ${poolSize} loai item cho ${cfg.numSets} bo va moi Thung ` +
          `co item deu phai DAY, se luon ton tai Thung 3-item-cung-loai (wrapped san). ` +
          `Can 3*ceil(numSets/poolSize) <= 2*numSets. Cach sua: tang numCategories/` +
          `itemTypesPerCategory, hoac giam numSets, hoac dat compactFreeSlots=false ` +
          `kem numSets < numBoxes - numEmptyBoxes.`
      );
    }
  }

  cfg.ratio21 = clamp(cfg.ratio21, 0, 1);
  cfg.extraScramble = Math.max(0, cfg.extraScramble);
  return cfg;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ------------------------------------------------------------------ */
/* Loi: mot lan xay nguoc                                              */
/* ------------------------------------------------------------------ */

function buildOnce(cfg, rng) {
  const cap = cfg.boxCapacity;
  const N = cfg.numBoxes;
  const S = cfg.numSets;

  // --- 1. Chon loai item cho tung bo ---
  const cats = shuffle(rng, CATEGORIES).slice(0, cfg.numCategories);
  const pool = [];
  for (const c of cats) {
    for (const it of shuffle(rng, c.items).slice(0, cfg.itemTypesPerCategory)) {
      pool.push(it.id);
    }
  }
  // Rai deu: moi loai duoc dung <= maxSetsPerType lan, uu tien phu het pool truoc
  const setType = [];
  const usage = new Map(pool.map((t) => [t, 0]));
  for (let s = 0; s < S; s++) {
    const eligible = pool.filter((t) => usage.get(t) < cfg.maxSetsPerType);
    const minUse = Math.min(...eligible.map((t) => usage.get(t)));
    const best = eligible.filter((t) => usage.get(t) === minUse);
    const t = pick(rng, best);
    usage.set(t, usage.get(t) + 1);
    setType.push(t);
  }

  // --- 2. Trang thai THANG (S_0) ---
  const boxes = [];
  for (let s = 0; s < S; s++) boxes.push(Array(cap).fill(setType[s]));
  for (let i = S; i < N; i++) boxes.push([]);

  const pristine = boxes.map((_, i) => i < S); // box goc chua bi dung toi
  const homeOf = (s) => s;                     // box s la "nha" cua bo s
  const emptyBoxes = [];
  for (let i = S; i < N; i++) emptyBoxes.push(i);

  const reverseMoves = []; // moi phan tu: { from, index, to, toIndex, itemId }

  /** Kiem tra + thuc thi 1 nuoc di nguoc. Tra ve true neu thanh cong. */
  function tryReverse(from, index, to) {
    if (from === to) return false;
    if (boxes[from].length === 0) return false;
    if (boxes[to].length >= cap) return false;
    // Nguon: neu la box 3-cung-loai NHUNG khong pristine => trong game no da
    // wrapped tu truoc => khong the lay item ra khi replay forward.
    if (!pristine[from] && isWrapped(boxes[from], cap)) return false;
    // Dich: sau khi nhan item khong duoc thanh 3-cung-loai (se wrap sai thoi diem)
    const item = boxes[from][index];
    const after = boxes[to].concat([item]);
    if (after.length === cap && after.every((x) => x === after[0])) return false;

    boxes[from].splice(index, 1);
    boxes[to].push(item);
    pristine[from] = false;
    pristine[to] = false;
    reverseMoves.push({ from, index, to, itemId: item });
    return true;
  }

  const hasRoom = (i) => boxes[i].length < cap;

  /** Chon box dich cho 1 item stray. */
  function chooseTarget(item, from, forbidden) {
    const cands = [];
    for (let i = 0; i < N; i++) {
      if (i === from || forbidden.has(i)) continue;
      if (!hasRoom(i)) continue;
      // thu nghiem tinh hop le
      const after = boxes[i].concat([item]);
      if (after.length === cap && after.every((x) => x === after[0])) continue;
      if (!pristine[i] && isWrapped(boxes[i], cap)) continue;
      cands.push(i);
    }
    if (!cands.length) return null;

    // Trong so: uu tien lap "lo" o box nha khac (tao ban co dan xen, it dung box rong)
    return weightedPick(rng, cands, (i) => {
      if (boxes[i].length === 0) return 1;            // box rong: de danh
      const mixed = new Set(boxes[i]).size > 1;
      return mixed ? 5 : 4;
    });
  }

  // --- 3. Scramble toi thieu: quyet dinh d cho tung bo (2+1 hay 1+1+1) ---
  const n21 = Math.round(cfg.ratio21 * S);
  const dSet = Array(S).fill(3);
  for (const s of shuffle(rng, range(S)).slice(0, n21)) dSet[s] = 2;

  // Danh sach cong viec: moi bo can (d-1) lan "keo item ra"
  const tasks = [];
  for (let s = 0; s < S; s++) for (let k = 0; k < dSet[s] - 1; k++) tasks.push(s);
  const order = shuffle(rng, tasks);

  const strayTargets = new Map(); // setIndex -> Set(box da nhan stray cua bo nay)
  for (let s = 0; s < S; s++) strayTargets.set(s, new Set());

  for (const s of order) {
    const home = homeOf(s);
    if (boxes[home].length === 0) return null;
    const forbidden = new Set(strayTargets.get(s));
    forbidden.add(home);
    const idx = randInt(rng, boxes[home].length);
    const item = boxes[home][idx];
    const to = chooseTarget(item, home, forbidden);
    if (to == null) return null;
    if (!tryReverse(home, idx, to)) return null;
    strayTargets.get(s).add(to);
  }

  // --- 4. Scramble bo sung (khong bat buoc) ---
  const extra = Math.round(cfg.extraScramble * reverseMoves.length);
  for (let e = 0; e < extra; e++) {
    const froms = shuffle(rng, range(N)).filter(
      (i) => boxes[i].length > 0 && !(isWrapped(boxes[i], cap) && !pristine[i])
    );
    let done = false;
    for (const from of froms) {
      const idx = randInt(rng, boxes[from].length);
      const to = chooseTarget(boxes[from][idx], from, new Set());
      if (to != null && tryReverse(from, idx, to)) { done = true; break; }
    }
    if (!done) break;
  }

  // --- 5. Tao hinh o trong ---
  //
  // LUAT MOI (9/2026): luc spawn KHONG duoc co Thung rong — moi Thung phai co it
  // nhat 1 vat. Buoc compaction cu (don sach mot so Thung thanh rong) bi thay bang
  // buoc nay: rai dung H = cap*(N-S) o trong vao dung cfg.freeSlotBoxes Thung, moi
  // Thung khong qua cap-1 o trong.
  //
  //   freeSlotBoxes = 2 => 3 o trong chia 2+1  (co mot Thung chi 1 vat = cho dan xep)
  //   freeSlotBoxes = 3 => 3 o trong chia 1+1+1 (khong dau nao du cho de dan xep)
  //
  // Nhanh cu (co Thung rong) van giu lai cho debug: cfg.noEmptyBoxes = false.
  if (cfg.noEmptyBoxes) {
    const H = cap * (N - S);
    const k = cfg.freeSlotBoxes;

    // Chia H o trong vao k Thung cang deu cang tot, moi Thung <= cap-1.
    const holePlan = Array(k).fill(Math.floor(H / k));
    for (let i = 0; i < H % k; i++) holePlan[i]++;
    if (holePlan.some((h) => h > cap - 1)) return null;

    // Thung dang VOI nhat nhan phan o trong lon nhat => it phai di chuyen nhat.
    const byLoad = range(N).sort((a, b) => boxes[a].length - boxes[b].length);
    const targetLen = Array(N).fill(cap);
    holePlan.forEach((h, i) => { targetLen[byLoad[i]] = cap - h; });

    // Chuyen vat tu Thung thua sang Thung thieu cho toi khi khop targetLen.
    // Tong do dai khong doi (= 3S = tong targetLen) nen vong lap chac chan dung.
    let guard = 0;
    for (;;) {
      const donors = range(N).filter((i) => boxes[i].length > targetLen[i]);
      const receivers = range(N).filter((i) => boxes[i].length < targetLen[i]);
      if (!donors.length && !receivers.length) break;
      if (++guard > 800) return null;

      let moved = false;
      outer:
      for (const from of shuffle(rng, donors)) {
        for (const to of shuffle(rng, receivers)) {
          for (let j = boxes[from].length - 1; j >= 0; j--) {
            if (tryReverse(from, j, to)) { moved = true; break outer; }
          }
        }
      }
      if (!moved) return null;
    }
  } else {
    const targetEmpty = cfg.compactFreeSlots ? N - S : Math.min(cfg.numEmptyBoxes, N - S);
    const sortedByLoad = range(N).sort((a, b) => boxes[a].length - boxes[b].length);
    const mustEmpty = sortedByLoad.slice(0, targetEmpty);

    let guard = 0;
    for (const src of mustEmpty) {
      while (boxes[src].length > 0) {
        if (++guard > 500) return null;
        const idx = boxes[src].length - 1;
        const item = boxes[src][idx];
        const forbidden = new Set(mustEmpty);
        const to = chooseTarget(item, src, forbidden);
        if (to == null) {
          // thu item khac trong box truoc khi bo cuoc
          let moved = false;
          for (let j = boxes[src].length - 1; j >= 0; j--) {
            const alt = chooseTarget(boxes[src][j], src, forbidden);
            if (alt != null && tryReverse(src, j, alt)) { moved = true; break; }
          }
          if (!moved) return null;
        } else if (!tryReverse(src, idx, to)) {
          return null;
        }
      }
    }
  }

  // --- 6. Kiem tra trang thai xuat phat ---
  for (let i = 0; i < N; i++) {
    if (isWrapped(boxes[i], cap)) return null; // khong duoc co box wrapped san
  }
  const emptyCount = boxes.filter((b) => b.length === 0).length;
  if (cfg.noEmptyBoxes) {
    if (emptyCount > 0) return null;           // luat cung: khong Thung rong luc spawn
  } else if (emptyCount < cfg.numEmptyBoxes) {
    return null;
  }

  // --- 7. Loi giai forward = dao nguoc danh sach nuoc di nguoc ---
  //
  // LUU Y KY THUAT: khong the tai dung index da ghi luc scramble.
  // Ly do: push() luon dat item vao CUOI mang, con splice() lay ra o giua, nen
  // sau khi dao nguoc, THU TU trong tung box co the khac trang thai goc (du noi
  // dung — xet nhu multiset — la giong het). Vi cac item cung itemId hoan toan
  // tuong duong nhau, ta giai index tai thoi diem chay bang indexOf(itemId).
  const spec = [];
  for (let k = reverseMoves.length - 1; k >= 0; k--) {
    const m = reverseMoves[k];
    spec.push({ from: m.to, to: m.from, itemId: m.itemId });
  }
  const solution = materializeSolution(boxes, spec, cap);
  if (!solution) return null;

  return { boxes, solution, setType, dSet, cats, pool };
}

/** Gan index cu the cho tung nuoc di bang cach chay thu tren ban sao state. */
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

const range = (n) => Array.from({ length: n }, (_, i) => i);

/* ------------------------------------------------------------------ */
/* Dong goi output + Tray + do kho                                     */
/* ------------------------------------------------------------------ */

function finalize(cfg, built, attempt) {
  const cap = cfg.boxCapacity;
  const { boxes, solution, setType, dSet, wrapOrder } = built;

  // --- Tray: 1 Tray / 1 bo 3 item (GDD 4.4) ---
  // Thu tu Tray tren bang chuyen suy ra tu thu tu wrap cua loi giai tham chieu.
  const wrapSeq = (wrapOrder || []).map((w) => w.itemId);
  const remaining = setType.slice();
  const orderedTypes = [];
  for (const t of wrapSeq) {
    const i = remaining.indexOf(t);
    if (i >= 0) orderedTypes.push(remaining.splice(i, 1)[0]);
  }
  orderedTypes.push(...remaining);

  let trayTypes;
  const rngT = makeRng(cfg.seed + 104729);
  if (cfg.trayOrder === 'shuffled') trayTypes = shuffle(rngT, orderedTypes);
  else if (cfg.trayOrder === 'reverse') trayTypes = orderedTypes.slice().reverse();
  else trayTypes = orderedTypes;

  // Chon nhung Khay nao chay che do chat ('itemType').
  //
  // BAT BUOC chon theo NHOM HANG, khong phai theo tung Khay. Neu tron hai che do
  // trong cung mot nhom hang thi man co the ket cung: gia su nhom "van phong" co Khay A
  // (che do category) va Khay B (che do chat, doi dung loai "but"). Mot Thung wrapped
  // loai "kep giay" den truoc se bi Khay B tu choi nhung duoc Khay A nhan; ve sau
  // Thung "but" chi con Khay B... van khop. Nguoc lai neu Thung "but" den truoc, Khay A
  // (khong kkn loai) nuot no, va Thung "kep giay" con lai khong con Khay nao nhan —
  // BE TAC. TEST 7 bat duoc dung loi nay: level 45 chi thang 19/60.
  //
  // Khi ca mot nhom hang cung che do thi luon co song anh: che do category => moi Thung
  // trong nhom vua moi Khay trong nhom (so luong bang nhau); che do itemType => khop
  // dung theo loai, cung bang nhau. Cac nhom hang khong bao gio tranh Khay cua nhau.
  const wantStrict =
    cfg.strictTrayRatio == null
      ? cfg.trayMatchMode === 'itemType'
        ? 1
        : 0
      : clamp(cfg.strictTrayRatio, 0, 1);
  const trayCats = [...new Set(trayTypes.map((t) => getTypeInfo(t).categoryId))];
  const strictCats = new Set(
    shuffle(makeRng(cfg.seed + 7919), trayCats.slice()).slice(
      0,
      Math.round(wantStrict * trayCats.length)
    )
  );
  const strictIdx = new Set(
    trayTypes.map((t, i) => (strictCats.has(getTypeInfo(t).categoryId) ? i : -1)).filter((i) => i >= 0)
  );
  // Ti le THUC TE sau khi lam tron theo nhom hang — day moi la con so dung de cham diem.
  const strictRatio = trayTypes.length ? strictIdx.size / trayTypes.length : 0;

  const trays = trayTypes.map((typeId, i) => {
    const info = getTypeInfo(typeId);
    return {
      id: `tray_${i}`,
      queueIndex: i,
      categoryId: info.categoryId,
      targetItemId: typeId,
      emoji: info.emoji,
      color: info.color,
      matchMode: strictIdx.has(i) ? 'itemType' : 'category',
    };
  });

  // --- So do kho ---
  const refMoves = solution.length;
  const lowerBound = heuristic(boxes, cap);
  const freeSlots = boxes.reduce((n, b) => n + (cap - b.length), 0);
  const mixedBoxes = boxes.filter((b) => new Set(b).size > 1).length;
  const filledBoxes = boxes.filter((b) => b.length > 0).length;
  const catsUsed = new Set(setType.map((t) => getTypeInfo(t).categoryId)).size;
  const typesUsed = new Set(setType).size;
  // --- Bo cuc cot + kiem tra tam voi ---
  // Xep Thung vao cot roi CHAY THU ca van. Neu loi giai cham vao Thung dang bi che
  // thi bo cuc nay hong; thu lai vai lan roi bo ca lan sinh man (generateLevel se
  // sinh lai voi seed khac). Day la ly do finalize() co the tra ve null.
  const layoutRng = makeRng(cfg.seed + 104729 + attempt * 31);
  let columns = null, worstHeld = 0;
  for (let k = 0; k < 12 && !columns; k++) {
    const cand = assignLayout(cfg, boxes, solution, layoutRng);
    if (!cand) break;
    // Phai dung voi MOI chinh sach giao hang, khong chi mot. Lay ton kho lon nhat
    // trong cac chinh sach lam so cham diem — do la truong hop xau nhat nguoi choi
    // co the roi vao.
    let held = 0, allOk = true;
    for (let pol = 0; pol < 4; pol++) {
      const r = simulateWithLayout(boxes, solution, trays, cfg, cand, pol);
      if (!r) { allOk = false; break; }
      held = Math.max(held, r.maxWrappedHeld);
    }
    if (allOk) { columns = cand; worstHeld = held; }
  }
  if (!columns) return null;
  const maxWrappedHeld = worstHeld;

  const difficulty = {
    refMoves,
    lowerBound,
    optimalMoves: null, // duoc dien o duoi neu chay IDA*
    freeSlots,
    fillRatio: +(1 - freeSlots / (cfg.numBoxes * cap)).toFixed(3),
    avgSpread: +(dSet.reduce((a, b) => a + b, 0) / dSet.length).toFixed(2),
    mixedBoxRatio: +(mixedBoxes / Math.max(1, filledBoxes)).toFixed(3),
    categoryConfusion: +(typesUsed / Math.max(1, catsUsed)).toFixed(2),
    maxWrappedHeld,
    score: 0,
  };
  // --- minMoves that su ---
  // PHAI chay TRUOC khi cham diem: diem do kho bay gio dua tren do dai loi giai
  // TOI UU, khong phai do dai loi giai tham chieu.
  //
  // Do do: refMoves = so nuoc di NGUOC ma bo sinh man da thuc hien, tuc la CONG SUC
  // CUA BO SINH MAN, khong phai cong suc cua nguoi choi. Do lai tren cau hinh
  // N=10 S=9 (do vao thang 9/2026, 40 seed moi muc):
  //
  //     extraScramble | refMoves |  IDA* toi uu | lowerBound
  //           0       |   18.6   |     16.0     |    15.0
  //           2       |   52.5   |     17.1     |    16.1
  //           8       |  154.4   |     17.1     |    16.1
  //
  // Xao them 8 lan lam loi giai tham chieu dai gap 8, nhung ban co that su chi kho
  // hon DUNG MOT NUOC. Cham diem tren refMoves nghia la thuong cho bo sinh man vi da
  // di duong vong. Te hon: moveLimit = refMoves * slack, nen level "kho" (refMoves 52,
  // slack 1.05 -> 56 nuoc) that ra cho nguoi choi thoai mai gap 3 lan muc toi uu (17),
  // trong khi level 5 (refMoves 3, slack 1.9 -> 7 nuoc so voi toi uu 3) lai chat.
  // Duong cong ap luc bi LAT NGUOC. Tu day moi thu chuan hoa theo parMoves.
  //
  // Chi phi: IDA* tren ban 10 Thung mat 13ms trung binh (xau nhat 445ms), giai duoc
  // 39/40 — nen mo cong 'auto' toi het pham vi ban choi that (<= 10 Thung) thay vi
  // dieu kien cu numBoxes<=8 && refMoves<=16 (gan nhu khong bao gio bat).
  const wantOptimal =
    cfg.computeOptimal === true ||
    (cfg.computeOptimal === 'auto' && cfg.numBoxes <= 10);
  if (wantOptimal) {
    const r = solveIDA(boxes, { capacity: cap, timeBudgetMs: 600, maxNodes: 200000 });
    if (r.solved) difficulty.optimalMoves = r.moves.length;
  }

  // "Par" — so nuoc di ma mot nguoi choi gioi can. Do lai cho thay lowerBound bam rat
  // sat: luon = toi uu - 1 o moi kich co ban co, nen day la phuong an du phong tot khi
  // IDA* het ngan sach.
  const parMoves = difficulty.optimalMoves ?? lowerBound + 1;
  difficulty.parMoves = parMoves;
  // Do "phong" cua loi giai tham chieu so voi par — chi de chan doan bo sinh man,
  // khong dung de cham diem.
  difficulty.refSlack = +(refMoves / Math.max(1, parMoves)).toFixed(2);

  // Diem do kho 1..100 — 8 truc chuan hoa ve [0,1] roi tron theo trong so.
  //
  // HIEU CHUAN LAI 9/2026 CHO DUONG CONG 50 LEVEL. Thuoc do su that cua do kho
  // KHONG phai diem nay ma la TY LE THUA cua chinh sach "smart" (GameSim): mot
  // nguoi choi khong bao gio pham loi hien nhien nhung khong nhin truoc thu tu
  // Khay lan cac Thung bi che. Van nao no van thua la van doi hoi lap ke hoach
  // that. Diem so duoi day chi de XEP HANG va hien thi; no phai DI CUNG CHIEU voi
  // ty le thua do duoc, neu khong thi no dang noi doi.
  //
  //   tier        | box  | cuaSo | visibleRows | par   | thua(smart) | score
  //   onboarding  | 4-9  |  3-4  |      4      |  3-10 |     0%      | 20-37
  //   acclimation | 9-12 |   3   |     3-4     |  9-13 |     0%      | 40-53
  //   normal      | 11-13|   3   |      3      | 13-19 |    8-28%    | 55-66
  //   hard        | 12-14|   2   |      3      | 13-18 |    63-70%   | 66-74
  //   superhard   |  13  |   1   |      3      | 16-17 |    80-91%   | 78-79
  //
  // Hai phat hien bat buoc phai phan anh vao trong so:
  //
  // (1) PHONG TO BAN KHONG LAM KHO THEM, chi lam DAI THEM. N18/visibleRows4 chi
  //     thua 9% trong khi N12/visibleRows3 thua 22% voi mot phan ba so nuoc di.
  //     Vi vay truc volume bi ha tu 0.26 xuong 0.20: par dai khong con duoc
  //     thuong nhieu. Yeu cau thiet ke la "kho chu khong phai choi lau".
  //
  // (2) CUA SO BANG CHUYEN LA DON BAY MANH NHAT, va no NGUOC CHIEU voi truc
  //     trayLoad cu. Do la mot LOI THAT trong ban cham diem truoc: cong thuc cu
  //     clamp((conveyorMaxActive - 3) / 4) coi NHIEU Khay la kho hon, nen no cho
  //     0 diem cho moi level hard/super hard (cua so 1-2) va chi cho diem duong
  //     cho level onboarding (cua so 4). Do duoc: cua so 1 thua 55-74%, cua so 2
  //     thua 45-51%, cua so 3 thua 0-17%. Cua so la mot TIEN TO CO DINH cua bang
  //     chuyen, khong xoay vong duoc, nen cua so 1 nghia la chi mot Khay voi toi.
  //     Truc nay doi thanh DO CHAT cua cua so va nhan trong so lon thu hai.
  //
  // Them truc CHIEU SAU: Thung nam ngoai visibleRows bi che hoan toan va chi lo ra
  // khi mot lan giao hang lam sup cot. Thong tin an la nguon kho "hay" nhat vi no
  // phat nguoi choi khong lap ke hoach chu khong bat ho bam them nuoc di.
  //
  // Da BO tin dung cho secondsPerMove va undoCount: GameEngine khong cai dat dong
  // ho lan hoan tac (kiem chung bang grep 9/2026), nen cham diem cho chung la tinh
  // cong mot luat khong ton tai. Trong ba thu do, chi moveLimit la co that.
  const nm = Math.min(parMoves / 22, 1);                                   // khoi luong
  const nd = clamp((difficulty.avgSpread - 1) / 2, 0, 1);                  // phan tan bo item
  const nx = difficulty.mixedBoxRatio;                                     // do dan xen
  // Nhieu thi giac = vua phai co nhieu loai item, VUA co nhieu loai cung mot nhom hang.
  // Chi dung ti le types/cats la sai: level 1 co 1 nhom x 2 loai cho ti le 2.0 (cao)
  // du ban co chi vo ven 2 loai item — de nhu cho.
  // Nhieu thi giac. Hai thua so, ca hai chuan hoa theo CATALOG chu khong hardcode:
  //   (1) bao nhieu loai item khac nhau xuat hien, so voi so bo cua man;
  //   (2) trung binh moi NHOM HANG co bao nhieu loai — day moi la thu lam mau sac
  //       mat tac dung. 1 loai/nhom => phan loai bang mau la xong.
  const nc =
    clamp((typesUsed - 1) / Math.max(1, cfg.numSets - 1), 0, 1) *
    clamp((difficulty.categoryConfusion - 1) / Math.max(1, MAX_TYPES_PER_CAT - 1), 0, 1);
  // Ton kho Khay: bao nhieu Thung wrapped phai giu tren tay cung luc. Mau so la
  // tran THUC TE do duoc duoi luat hien hanh (xem bang trong comment ben tren),
  // khong phai mot so tron. Cua so bang chuyen rong hon => con so nay THAP hon.
  const nw = Math.min(maxWrappedHeld / 4, 1);                              // ton kho Khay
  // Do CHAT cua cua so bang chuyen. `allTrays.slice(0, conveyorMaxActive)` la mot
  // tien to CO DINH: cua so 1 nghia la ca man chi co dung mot Khay voi toi, moi
  // Thung wrap ra deu phai vua Khay do hoac nam lai chiem cho. Day la don bay do
  // kho manh nhat do duoc nen no giu trong so lon thu hai.
  // Bac thang, khong tuyen tinh: ty le thua do duoc nhay vot giua cua so 3 va 2
  // (0-17% -> 45-51%) roi nhay tiep o cua so 1 (55-74%). Mot ham tuyen tinh se lam
  // nhoe dung cho ranh gioi quan trong nhat cua game.
  const WINDOW_TIGHTNESS = { 1: 1, 2: 0.62, 3: 0.15, 4: 0.04 };
  const nq = WINDOW_TIGHTNESS[cfg.conveyorMaxActive] ?? 0;                 // cua so chat
  // Chieu sau thong tin an: so Thung nam ngoai vung hien. Chung chi lo ra khi mot
  // lan giao hang lam sup cot, nen nguoi choi phai suy luan ve thu minh chua thay.
  const nh = clamp(Math.max(0, cfg.numBoxes - cfg.columns * cfg.visibleRows) / 6, 0, 1);
  // Do NGHIEM NGAT cua luat choi. Truoc day cu buoc nhay lon nhat cua duong cong
  // (level 40: Khay doi khop dung loai item) hoan toan vo hinh voi diem so, vi no
  // khong lam thay doi bat ky chi so nao cua ban co ban dau.
  const ns = clamp(
    strictRatio * 0.45 +
      (cfg.trayOrder === 'reverse' ? 0.25 : cfg.trayOrder === 'shuffled' ? 0.12 : 0) +
      (cfg.moveLimitSlack == null ? 0 : clamp((1.8 - cfg.moveLimitSlack) / 0.75, 0, 1) * 0.3),
    0,
    1
  );
  difficulty.components = {
    volume: +nm.toFixed(3), spread: +nd.toFixed(3), interleave: +nx.toFixed(3),
    confusion: +nc.toFixed(3), trayBacklog: +nw.toFixed(3),
    windowTightness: +nq.toFixed(3), hiddenDepth: +nh.toFixed(3),
    strictness: +ns.toFixed(3),
  };
  // Trong so doi lai 9/2026 cho duong cong 50 level, can theo ty le thua do duoc:
  //   - volume 0.26 -> 0.20: par dai khong con duoc thuong nhieu ("kho chu khong dai").
  //   - trayLoad 0.10 -> windowTightness 0.20: sua truc bi NGUOC va tra no ve dung
  //     tam quan trong da do duoc (cua so 1 thua 55-74%, cua so 3 thua 0-17%).
  //   - them hiddenDepth 0.08: thong tin an lam kho ma khong ton them nuoc di.
  //   - strictness 0.18 -> 0.10: da bo hai thanh phan khong duoc cai dat.
  difficulty.score = clamp(
    Math.round(
      100 *
        (0.20 * nm + 0.12 * nd + 0.10 * nx + 0.12 * nc +
         0.08 * nw + 0.20 * nq + 0.08 * nh + 0.10 * ns)
    ),
    1,
    100
  );

  // --- Meta: gioi han nuoc di / thoi gian (GDD muc 9.3, cau hoi mo 11) ---
  // Chuan hoa theo parMoves chu khong phai refMoves — xem giai thich o tren.
  const moveLimit = cfg.moveLimitSlack == null ? null : Math.ceil(parMoves * cfg.moveLimitSlack);
  const timeToPlay =
    cfg.secondsPerMove == null
      ? null
      : Math.round((parMoves * cfg.secondsPerMove + 20) / 5) * 5;

  return {
    version: 'solvable-gen-1.0',
    seed: cfg.seed,
    attempt,
    config: cfg,

    boxes: boxes.map((items, i) => ({ id: `box_${i}`, items: items.slice(), maxSize: cap })),
    trays,

    // Bo cuc khu Thung. columns[c] = danh sach CHI SO Thung trong cot c, phan tu 0
    // la o duoi cung. `visibleRows` phan tu dau moi cot la vung nguoi choi cham
    // duoc; phan con lai bi che va khoa. Khi mot Thung duoc giao, no bi go khoi
    // mang cua cot => cot tut xuong => phan tu thu `visibleRows` lo ra.
    layout: {
      columns: columns.map((c) => c.slice()),
      visibleRows: cfg.visibleRows,
      hiddenBoxes: Math.max(0, cfg.numBoxes - cfg.columns * cfg.visibleRows),
    },
    conveyor: { type: cfg.conveyorType, maxActive: cfg.conveyorMaxActive },

    // Bang chung solvability — replay duoc bang Solver.simulate()
    referenceSolution: solution,
    solvable: true,
    solvabilityProof: 'reverse-construction + forward replay verified',

    difficulty,
    rules: {
      moveLimit,
      timeToPlay,
      undoCount: cfg.undoCount,
      trayMatchMode: cfg.trayMatchMode,
      strictTrayRatio: +strictRatio.toFixed(3),
    },
  };
}

/**
 * Mo phong tang giao hang: nguoi choi chay loi giai tham chieu, moi khi wrap
 * xong 1 box thi giao ngay neu Tray tuong ung dang nam trong cua so maxActive.
 * Tra ve so box wrapped phai GIU LAI cung luc nhieu nhat (0 = khong bao gio phai cho).
 */
/**
 * Mo phong mot van dau THAT: chay loi giai tham chieu tren bo cuc cot, giao hang
 * moi khi co the, va cho cot tut xuong sau moi lan giao.
 *
 * Tra ve null neu loi giai VI PHAM tam voi (cham vao Thung dang bi che) — day la
 * bo loc quan trong nhat cua ca ham: khong co no thi level sinh ra co bang chung
 * giai duoc tren giay nhung khong choi noi tren may.
 *
 * Neu hop le, tra ve { maxWrappedHeld, reveals } de cham diem.
 */
function simulateWithLayout(boxes, solution, trays, cfg, columns, policy = 0) {
  const cap = cfg.boxCapacity;
  const rows = cfg.visibleRows;
  const state = boxes.map((b) => b.slice());
  const cols = columns.map((c) => c.slice());
  const pending = trays.map((t) => ({ ...t })); // hang doi Khay chua duoc phuc vu
  const held = new Set();                       // chi so Thung wrapped dang phai giu
  let maxHeld = 0;
  let reveals = 0;

  // Chi so cac Thung dang NAM TRONG TAM VOI (4 o duoi cung cua moi cot).
  const visible = () => {
    const v = new Set();
    for (const c of cols) for (let i = 0; i < Math.min(rows, c.length); i++) v.add(c[i]);
    return v;
  };

  const matches = (tray, boxIdx) => {
    const typeId = state[boxIdx][0];
    return tray.matchMode === 'itemType'
      ? tray.targetItemId === typeId
      : tray.categoryId === getTypeInfo(typeId).categoryId;
  };

  /**
   * Thu tu XET cac Thung wrapped khi giao hang. Nguoi choi that co the giao theo
   * BAT KY thu tu nao, va thu tu ay quyet dinh Khay nao bien mat truoc => quyet
   * dinh Thung wrapped nao con giao duoc => quyet dinh cot tut xuong luc nao.
   *
   * Do do mot bo cuc chi duoc chap nhan khi no dung voi MOI chinh sach duoi day
   * (finalize chay het luot). Truoc day chi kiem mot chinh sach, va 4/525 man da
   * lot luoi: loi giai cham vao Thung con dang bi che.
   */
  const orderHeld = () => {
    const a = [...held];
    if (policy === 1) return a.sort((x, y) => x - y);
    if (policy === 2) return a.sort((x, y) => y - x);
    if (policy === 3) return a.sort((x, y) => state[x][0] < state[y][0] ? -1 : 1);
    return a; // 0 = thu tu wrap
  };

  /** Giao het nhung gi giao duoc; moi lan giao lam cot tut xuong 1 nac. */
  function tryDeliver() {
    let progress = true;
    while (progress) {
      progress = false;
      const window = pending.slice(0, cfg.conveyorMaxActive);
      outer: for (const boxIdx of orderHeld()) {
        for (let wi = 0; wi < window.length; wi++) {
          if (!matches(window[wi], boxIdx)) continue;
          pending.splice(wi, 1);
          held.delete(boxIdx);
          state[boxIdx] = [];
          // Thung roi khoi cot -> cot tut xuong -> lo Thung ke tiep (neu con)
          for (const c of cols) {
            const at = c.indexOf(boxIdx);
            if (at === -1) continue;
            const wasDeep = c.length > rows;
            c.splice(at, 1);
            if (wasDeep) reveals++;
            break;
          }
          progress = true;
          break outer;
        }
      }
    }
  }

  for (const mv of solution) {
    const vis = visible();
    // BO LOC TAM VOI
    if (!vis.has(mv.from) || !vis.has(mv.to)) return null;
    const [item] = state[mv.from].splice(mv.index, 1);
    state[mv.to].push(item);
    if (isWrapped(state[mv.to], cap)) {
      held.add(mv.to);
      maxHeld = Math.max(maxHeld, held.size);
      tryDeliver();
    }
  }
  // Cuoi van moi Khay con lai deu khop mot Thung wrapped dang giu -> giao het duoc.
  return { maxWrappedHeld: maxHeld, reveals };
}

/**
 * Xep N Thung vao `columns` cot. Cac o duoi cung cua moi cot la vung HIEN;
 * phan du day len tren thanh vung AN.
 *
 * Hai rang buoc, theo dung thu tu uu tien:
 *   1. Moi Thung con O TRONG phai nam trong vung hien luc spawn. Ca ban chi co 3 o
 *      trong (bat bien F = 3N - 3S); giau chung di la nguoi choi khong co nuoc di
 *      nao ngay tu dau.
 *   2. Thung bi che nen la Thung ma loi giai dung toi MUON NHAT, de no kip lo ra
 *      truoc khi can. Day chi la HEURISTIC — ket qua van phai qua
 *      simulateWithLayout() moi duoc chap nhan.
 */
function assignLayout(cfg, boxes, solution, rng) {
  const N = boxes.length;
  const cols = cfg.columns;
  const rows = cfg.visibleRows;
  const hiddenCount = Math.max(0, N - cols * rows);

  const firstTouch = Array(N).fill(Infinity);
  solution.forEach((mv, i) => {
    if (firstTouch[mv.from] === Infinity) firstTouch[mv.from] = i;
    if (firstTouch[mv.to] === Infinity) firstTouch[mv.to] = i;
  });

  const hasHole = (i) => boxes[i].length < cfg.boxCapacity;
  const canHide = range(N).filter((i) => !hasHole(i));
  if (canHide.length < hiddenCount) return null;

  // Giau nhung Thung duoc dung muon nhat.
  canHide.sort((a, b) => firstTouch[b] - firstTouch[a]);
  const hidden = new Set(canHide.slice(0, hiddenCount));
  const shown = range(N).filter((i) => !hidden.has(i));

  const columns = Array.from({ length: cols }, () => []);
  // Vung hien: rai deu, tron ngau nhien de bo cuc khong doan truoc duoc.
  shuffle(rng, shown).forEach((b, i) => columns[i % cols].push(b));
  // Vung an: Thung dung som nhat dat NONG nhat (lo ra truoc).
  [...hidden].sort((a, b) => firstTouch[a] - firstTouch[b])
    .forEach((b, i) => columns[i % cols].push(b));

  return columns;
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
    const {
      numBoxes = 6,
      numEmptyBoxes = 1,
      numCategories = 2,
      itemTypesPerCat = 2,
      ...rest
    } = config;
    return configForLevelNumber(1, {
      numBoxes,
      numEmptyBoxes,
      numSets: numBoxes - numEmptyBoxes,
      numCategories,
      itemTypesPerCategory: itemTypesPerCat,
      seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0,
      ...rest,
    });
  }

  /**
   * Ha dan so bo hang cho toi khi cau hinh kha thi.
   * So o trong toi thieu la 3 (dinh ly solvability: F = 3N - 3S >= 3),
   * nen numSets khong duoc vuot qua numBoxes - 1.
   */
  static generateWithRelaxedConfig(cfg) {
    for (let sets = Math.min(cfg.numSets, cfg.numBoxes - 1); sets >= 1; sets--) {
      try {
        return generateLevel({ ...cfg, numSets: sets });
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


// --- src/ui/BoxRenderer.js ---

class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;
    }

    /**
     * Ve khu Thung theo COT.
     *
     * @param {Array<Array<Box>>} columns  columns[c] = Thung DANG HIEN cua cot c,
     *        phan tu 0 la o duoi cung. Chi truyen vao Thung trong tam voi — Thung
     *        bi che khong duoc ve, va cung khong duoc gan su kien nao.
     * @param {Array<number>} hiddenCounts  so Thung con bi che tren dinh moi cot,
     *        chi de hien mot chip dem. Noi dung cua chung van bi giau hoan toan.
     *
     * Van chap nhan mot mang Thung phang (level cu / debug): khi do gom het vao
     * mot cot duy nhat.
     */
    render(columns, selectedSource = null, validTargetIds = [], hiddenCounts = [], visibleRows = 5) {
        this.container.innerHTML = '';
        if (columns.length && !Array.isArray(columns[0])) columns = [columns];

        columns.forEach((boxes, colIndex) => {
        const colEl = document.createElement('div');
        colEl.className = 'box-column';
        colEl.style.setProperty('--rows', visibleRows);

        const boxStack = document.createElement('div');
        boxStack.className = 'box-stack';

        boxes.forEach(box => {
            const boxEl = document.createElement('div');
            boxEl.className = 'box';
            boxEl.dataset.boxId = box.id;
            
            if (box.isEmpty()) boxEl.classList.add('empty-box');
            if (validTargetIds.includes(box.id)) boxEl.classList.add('valid-target');
            if (box.isWrapped) boxEl.classList.add('wrapped');
            if (selectedSource && selectedSource.boxId === box.id) boxEl.classList.add('selected');

            // 1. Top Face (contains slots)
            const topFace = document.createElement('div');
            topFace.className = 'top-face';

            // Render slots (3 slots max)
            for (let i = 0; i < 3; i++) {
                const slotEl = document.createElement('div');
                slotEl.className = 'slot';
                
                if (i < box.items.length) {
                    slotEl.textContent = getItemEmoji(box.items[i]);
                    // Highlight specifically selected item
                    if (selectedSource && selectedSource.boxId === box.id && selectedSource.itemIndex === i) {
                        slotEl.classList.add('selected');
                    }
                } else {
                    slotEl.classList.add('placeholder');
                    slotEl.textContent = '—';
                }
                
                slotEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent box click
                    if (document.body.classList.contains('is-dragging')) return;
                    this.onSlotTap(box.id, i < box.items.length ? i : null);
                });
                
                topFace.appendChild(slotEl);
            }

            // 2. Front Face
            const frontFace = document.createElement('div');
            frontFace.className = 'front-face';

            // 3. Flaps (Top and Bottom edges)
            const flapTop = document.createElement('div'); flapTop.className = 'flap top';
            const flapBottom = document.createElement('div'); flapBottom.className = 'flap bottom';

            // 4. Tape
            const tape = document.createElement('div');
            tape.className = 'tape';

            // 5. Category Logo (shown when box is packed/wrapped)
            const logoEl = document.createElement('div');
            logoEl.className = 'box-logo';
            const catId = box.getCategory() || (box.items.length > 0 ? getCategoryByItemId(box.items[0]) : null);
            const catConfig = catId ? getCategoryConfig(catId) : null;
            const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
            const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
            if (catConfig) {
                boxEl.style.setProperty('--cat-color', catConfig.color);
                logoEl.style.setProperty('--cat-color', catConfig.color);
                logoEl.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
            }

            boxEl.appendChild(topFace);
            boxEl.appendChild(frontFace);
            boxEl.appendChild(flapTop);
            boxEl.appendChild(flapBottom);
            boxEl.appendChild(tape);
            boxEl.appendChild(logoEl);

            // Events for tapping the box itself (like tapping an empty area)
            boxEl.addEventListener('click', (e) => {
                // Ignore clicks if we are dragging
                if (document.body.classList.contains('is-dragging')) return;
                this.onSlotTap(box.id, null);
            });

            // Drag events for wrapped boxes
            if (box.isWrapped) {
                boxEl.style.cursor = 'grab';
                boxEl.addEventListener('pointerdown', (e) => {
                    this.onDragStart(box.id, e);
                });
            }

            boxStack.appendChild(boxEl);
        });

        colEl.appendChild(boxStack);

        // Chip dem Thung con bi che. Chi la SO LUONG — khong he lo noi dung, nen
        // khong dung toi mo hinh do kho (von gia dinh Thung an la bi mat hoan toan).
        // Them SAU CUNG vi cot dung flex-direction: column-reverse, nen phan tu
        // cuoi trong DOM moi nam tren cung tren man hinh.
        const hidden = hiddenCounts[colIndex] || 0;
        if (hidden > 0) {
            const chip = document.createElement('div');
            chip.className = 'column-hidden-count';
            chip.textContent = `+${hidden}`;
            chip.title = `Còn ${hidden} Thùng bị che phía trên cột này`;
            colEl.appendChild(chip);
        }

        this.container.appendChild(colEl);
        });
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        const srcSlot = document.querySelector(`.box[data-box-id="${sourceBoxId}"] .slot.selected`);
        const targetEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);
        
        if (!srcSlot || !targetEl) {
            onComplete();
            return;
        }

        const from = srcSlot.getBoundingClientRect();
        const to   = targetEl.getBoundingClientRect();

        const fly = document.createElement('div');
        fly.className = 'item-animating';
        fly.textContent = srcSlot.textContent;
        fly.style.left = `${from.left}px`;
        fly.style.top  = `${from.top}px`;
        document.body.appendChild(fly);

        const dx = (to.left + to.width / 2 - 12) - from.left;
        const dy = (to.top  + to.height / 2 - 12) - from.top;

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

    readBeltGeometry() {
        const area = this.container.parentElement;
        const cs = getComputedStyle(area);
        const num = (name, fallback) => {
            const v = parseFloat(cs.getPropertyValue(name));
            return Number.isFinite(v) ? v : fallback;
        };
        const W      = this.container.clientWidth || 600;
        const inset  = num('--belt-inset', 45);
        const h      = num('--belt-h', 160);
        const bottom = num('--belt-bottom', 30);
        const band   = num('--belt-band', 30);

        return {
            cx: W / 2,
            cy: bottom + h / 2,
            rx: (W - inset * 2) / 2 - band / 2,
            ry: h / 2 - band / 2,
        };
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
                    // Vao man: maxActive Khay xep san deu vong, lan luot lo ra o cong IN.
                    slotPos = index;
                    spawnTargetTheta = 0;
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
            
            const x = g.cx + g.rx * Math.cos(theta);
            const y = g.cy + g.ry * Math.sin(theta);
            
            const depth = (Math.sin(theta) + 1) / 2;
            const baseScale = 1.06 - 0.30 * depth;
            const dim   = 1.00 - 0.35 * depth;
            
            const finalScale = baseScale * spawnScale;
            const finalY = y - 12 - riseY;
            
            item.el.style.opacity = spawnOpacity.toFixed(3);
            item.el.style.transformOrigin = 'bottom center';
            item.el.style.transform = 
                `translate3d(${(x - 40).toFixed(1)}px, ${(-finalY).toFixed(1)}px, 0) ` +
                `scale(calc(${finalScale.toFixed(3)} * var(--hl)))`;
            item.el.style.filter = `brightness(${dim.toFixed(2)})`;
            // IN gate is at depth = 0.5. Emerging trays sit cleanly on top of the gate portal
            item.el.style.zIndex = Math.round(100 - depth * 90);
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


// --- src/ui/UIManager.js ---

class UIManager {
    constructor() {
        this.engine = new GameEngine();
        
        // Renderers
        this.boxRenderer = new BoxRenderer(
            'boxes-grid',
            this.handleSlotTap.bind(this),
            this.handleDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.moveDisplay = document.getElementById('move-display');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnSelectLevel = document.getElementById('btn-select-level');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.loseReason = document.getElementById('lose-reason');
        this.moveLimitDisplay = document.getElementById('move-limit');
        this.overlayLoading = document.getElementById('overlay-loading');
        this.overlayLevelSelect = document.getElementById('overlay-level-select');
        this.levelGrid = document.getElementById('level-grid');
        this.btnCloseLevelSelect = document.getElementById('btn-close-level-select');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
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
        
        this.bindEvents();
        this.bindEngineCallbacks();
        this.renderLevelMenu();
        
        // Start
        this.startNewLevel();
    }
    
    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.currentLevel = 1;
            this.startNewLevel();
        });
        
        this.btnSelectLevel.addEventListener('click', () => {
            this.renderLevelMenu(); // Re-render to update active level class
            this.overlayLevelSelect.classList.remove('hidden');
        });

        this.btnCloseLevelSelect.addEventListener('click', () => {
            this.overlayLevelSelect.classList.add('hidden');
        });
        
        this.btnNextLevel.addEventListener('click', () => {
            this.currentLevel++;
            this.startNewLevel();
        });
        
        this.btnRetry.addEventListener('click', () => {
            this.startNewLevel(true); // pass flag to retry same? for now just generate new
        });

        // Global pointer events for dragging
        document.addEventListener('pointermove', this.handleDragMove.bind(this));
        document.addEventListener('pointerup', this.handleDragEnd.bind(this));
        document.addEventListener('pointercancel', this.handleDragEnd.bind(this));
    }
    
    // Gioi han nuoc di chi la rang buoc that neu nguoi choi NHIN THAY no con
    // bao nhieu — neu khong thi thua vi het nuoc chi la mot cu bat ngo.
    renderMoveLimit() {
        if (!this.moveLimitDisplay) return;
        const lim = this.engine.moveLimit;
        this.moveLimitDisplay.textContent = lim ? ` / ${lim}` : '';
        const left = lim ? lim - this.engine.moveCount : Infinity;
        this.moveLimitDisplay.classList.toggle('low', left <= 5);
    }

    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                this.overlayWin.classList.remove('hidden');
            } else if (state === 'LOST') {
                // Hai ly do thua khac han nhau, va nguoi choi phai biet minh
                // hong o dau thi moi hoc duoc gi tu van thua.
                if (this.loseReason) {
                    const e = this.engine;
                    this.loseReason.textContent = (e.moveLimit && e.moveCount >= e.moveLimit)
                        ? `Out of moves — the limit is ${e.moveLimit}.`
                        : 'No more empty slots to move items.';
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
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayDelivered = (trayId) => {
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
            
            // Apply difficulty classes based on SolvableLevelGenerator logic
            const isRamp = i <= 10;
            const isSuperHard = !isRamp && i % 2 === 0;
            
            if (isRamp) {
                btn.classList.add('level-easy');
            } else if (isSuperHard) {
                btn.classList.add('level-super-hard');
            } else {
                btn.classList.add('level-hard');
            }
            
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
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
        // Truoc day UI tu tinh mot bo tham so rieng (numBoxes/numCategories/...) khac
        // han duong cong cua bo sinh => co ba nguon su that cho cung mot khai niem
        // "level 7 kho the nao". Nay UI chi noi minh dang o level nao.
        const levelData = LevelGenerator.generateLevel({ levelNumber: this.currentLevel });
        
        this.trayRenderer.reset();
        this.engine.startLevel(levelData);
        this.levelDisplay.textContent = this.currentLevel;
        this.moveDisplay.textContent = "0";
        this.renderMoveLimit();
        this._boLuotFlip = true;
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
    }
    
    updateRender() {
        if (this._renderQueued) return;
        this._renderQueued = true;
        requestAnimationFrame(() => {
            this._renderQueued = false;
            this._renderNow();
        });
    }

    _renderNow() {
        const validTargets = this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : [];
        // Chi ve Thung TRONG TAM VOI, theo dung cot. Thung bi che khong vao DOM —
        // khong co phan tu nao de cham nham, va cung khong ton chi phi render.
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
            this.engine.getVisibleBoxes(), this.engine.selectedSource, validTargets, hiddenCounts, this.engine.visibleRows);
            
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
        
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
    }
    
    _chayFlip(grid, truoc) {
        if (!grid) return;
        const itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (itMotion || this._boLuotFlip) return;

        const THOI_LUONG = 260;
        const NHIP = 'cubic-bezier(.22,.61,.36,1)';

        for (const el of grid.querySelectorAll('.box[data-box-id]')) {
            if (el.classList.contains('dragging')) continue;

            const cu = truoc.get(el.dataset.boxId);
            const moi = el.getBoundingClientRect();

            if (!cu) {
                el.animate(
                    [ { transform: `translateY(${-(moi.height + 14)}px)`, opacity: 0 },
                      { transform: 'none', opacity: 1 } ],
                    { duration: THOI_LUONG, easing: NHIP, delay: 60, fill: 'backwards' }
                );
                continue;
            }

            const dx = cu.left - moi.left;
            const dy = cu.top - moi.top;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

            el.animate(
                [ { transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' } ],
                { duration: THOI_LUONG, easing: NHIP }
            );
        }
    }

    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging) return;
        if (this._animating) return;
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    if (navigator.vibrate) navigator.vibrate(12);
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            if (this.engine.selectTarget(boxId)) {
                this._animating = true;
                // Animate then update
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
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
                        
                        // Wait for flap animation (0.5s) + tape (0.3s) = 0.8s
                        setTimeout(() => {
                            this.updateRender();
                            this._animating = false;
                        }, 800);
                    } else {
                        this.updateRender();
                        this._animating = false;
                    }
                });
            } else {
                // Invalid or deselected
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    this.engine.selectSource(boxId, itemIndex);
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
        
        this.dragState.isDragging = true;
        this.dragState.boxId = boxId;
        this.dragState.targetTrayId = null;
        
        // Add dragging class to original box
        const boxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
        if (boxEl) boxEl.classList.add('dragging');
        
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
        
        const boxId = this.dragState.boxId;
        const trayId = this.dragState.targetTrayId;
        
        this.dragState.isDragging = false;
        this.dragState.boxId = null;
        this.dragState.targetTrayId = null;
        
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
                        this.engine.dropOnTray(trayId);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
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
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new UIManager();
});

