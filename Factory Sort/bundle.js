// --- src/data/ItemCatalog.js ---
const ITEM_CATALOG = {
    categories: [
        {
            id: 'stuffed_animals',
            label: 'Thú nhồi bông',
            color: '#FFB6C1', // Pink
            items: [
                { id: 'bear', emoji: '🧸', label: 'Gấu bông' },
                { id: 'duck', emoji: '🦆', label: 'Vịt bông' },
                { id: 'bunny', emoji: '🐰', label: 'Thỏ bông' },
            ]
        },
        {
            id: 'food',
            label: 'Đồ ăn',
            color: '#FFDAB9', // Peach
            items: [
                { id: 'apple', emoji: '🍎', label: 'Táo' },
                { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                { id: 'donut', emoji: '🍩', label: 'Donut' },
            ]
        },
        {
            id: 'stationery',
            label: 'Văn phòng phẩm',
            color: '#ADD8E6', // Light Blue
            items: [
                { id: 'pencil', emoji: '✏️', label: 'Bút chì' },
                { id: 'paperclip', emoji: '📎', label: 'Kẹp giấy' },
                { id: 'scissors', emoji: '✂️', label: 'Kéo' },
            ]
        },
        {
            id: 'sports',
            label: 'Thể thao',
            color: '#90EE90', // Light Green
            items: [
                { id: 'soccer', emoji: '⚽', label: 'Bóng đá' },
                { id: 'basketball', emoji: '🏀', label: 'Bóng rổ' },
                { id: 'tennis', emoji: '🎾', label: 'Bóng tennis' }
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
    constructor(maxActive = 4) {
        this.maxActive = maxActive;
        this.allTrays = [];
        this.windowStart = 0;
    }

    initialize(trays) {
        this.allTrays = [...trays];
        this.windowStart = 0;
    }

    rotateRight() { // View shifts right (trays move left visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart + 1) % this.allTrays.length;
    }

    rotateLeft() { // View shifts left (trays move right visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart - 1 + this.allTrays.length) % this.allTrays.length;
    }

    removeTray(trayId) {
        const index = this.allTrays.findIndex(t => t.id === trayId);
        if (index !== -1) {
            this.allTrays.splice(index, 1);
            if (this.allTrays.length > 0) {
                this.windowStart = this.windowStart % this.allTrays.length;
            } else {
                this.windowStart = 0;
            }
            return true;
        }
        return false;
    }

    hasRemainingTrays() {
        return this.allTrays.length > 0;
    }

    getAllActiveTrays() {
        if (this.allTrays.length === 0) return [];
        const result = [];
        for (let i = 0; i < Math.min(this.maxActive, this.allTrays.length); i++) {
            result.push(this.allTrays[(this.windowStart + i) % this.allTrays.length]);
        }
        return result;
    }

    /**
     * Khay dang hoat dong nhan duoc Thung nay.
     * Nhan ca Thung chu khong chi categoryId, vi Khay che do 'itemType' con
     * phai doi chieu targetItemId — chi so sanh nhom hang la sai o level >= 40.
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
        this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
        
        // Callbacks for UI
        this.onBoxUpdated = null;
        this.onBoxWrapped = null;
        this.onTrayExited = null;
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
        this.selectedSource = null; // { boxId, itemIndex }
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.setGameState('PLAYING');
    }
    
    setGameState(newState) {
        this.gameState = newState;
        if (this.onGameStateChanged) this.onGameStateChanged(newState);
    }

    getBox(id) {
        return this.boxes.find(b => b.id === id);
    }

    // Layer 1: Tap source item
    selectSource(boxId, itemIndex) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
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
        
        // Any box that can accept
        return this.boxes.filter(b => b.id !== sourceBoxId && b.canAccept()).map(b => b.id);
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
        
        // Remove box from play area
        this.boxes = this.boxes.filter(b => b.id !== box.id);
        
        this.draggedBoxId = null;
        
        // Handle Tray exit & Conveyor shift
        this.conveyor.removeTray(trayId);
        
        if (this.onTrayExited) this.onTrayExited(trayId);
        if (this.onBoxUpdated) this.onBoxUpdated(box, true); // True flag for 'removed'

        this.checkConditions();
        return true;
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

        // Check Lose
        // All non-wrapped boxes are full -> no empty slots available
        const activeBoxes = this.boxes.filter(b => !b.isWrapped && !b.isEmpty());
        const hasEmptySlots = activeBoxes.length === 0 || this.boxes.some(b => !b.isWrapped && !b.isFull());
        
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

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  seed: 1,

  // --- Quy mo ban choi ---
  numBoxes: 6,            // tong so Thung
  boxCapacity: 3,         // GDD: co dinh 3
  numEmptyBoxes: 1,       // so Thung RONG hoan toan luc bat dau (luat cung >= 1)
  numSets: null,          // so bo 3 item = so Tray. null => numBoxes - numEmptyBoxes

  // --- Item pool ---
  numCategories: 2,       // 1..4
  itemTypesPerCategory: 2,// 1..3
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
  maxAttempts: 80,
  verify: true,           // luon replay lai loi giai qua engine sim truoc khi tra ve
  computeOptimal: 'auto', // 'auto' | true | false  -> co chay IDA* gan minMoves khong
};

const PRESETS = {
  //          box  rong  bo   cat  type/cat  ratio21  ...
  tutorial: { numBoxes: 4, numEmptyBoxes: 1, numSets: 2, numCategories: 1, itemTypesPerCategory: 2, ratio21: 1.0,  compactFreeSlots: false },
  easy:     { numBoxes: 6, numEmptyBoxes: 1, numSets: 4, numCategories: 2, itemTypesPerCategory: 2, ratio21: 0.85, compactFreeSlots: false, moveLimitSlack: 1.8 },
  normal:   { numBoxes: 7, numEmptyBoxes: 1,             numCategories: 3, itemTypesPerCategory: 2, ratio21: 0.60, moveLimitSlack: 1.5 },
  hard:     { numBoxes: 9, numEmptyBoxes: 1,             numCategories: 3, itemTypesPerCategory: 3, ratio21: 0.35, extraScramble: 0.5, trayOrder: 'shuffled', moveLimitSlack: 1.25 },
  expert:   { numBoxes: 10, numEmptyBoxes: 1,            numCategories: 4, itemTypesPerCategory: 3, ratio21: 0.10, extraScramble: 1.0, trayOrder: 'reverse', moveLimitSlack: 1.10, secondsPerMove: 5 },
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

    return finalize(cfg, built, attempt);
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

/**
 * Lo trinh do kho theo level number — nguon su that DUY NHAT cho cau hoi
 * "level N kho the nao" (UIManager chi truyen levelNumber vao day).
 *
 * Duong cong chia lam ba giai doan, vi cac lever KHONG cung tuoi tho:
 *
 *   GD1  L1..~20   Quy mo:      numBoxes 4->10, numCategories 1->4, itemTypes 2->3.
 *                  Day la nguon do kho re nhat va de doc nhat cho nguoi choi.
 *   GD2  ~20..40   Phan tan:    quy mo da CHAM TRAN (10 Thung la gioi han ban choi,
 *                  4 la toan bo so nhom hang co that trong ITEM_CATALOG), nen do kho
 *                  chuyen sang ratio21 giam, extraScramble tang, maxSetsPerType giam
 *                  (it bo trung loai hon => moi item chi co dung 2 ban sao anh em,
 *                  it duong gom hon).
 *   GD3  40+       Luat & ap luc: Khay doi khop dung LOAI ITEM chu khong chi nhom
 *                  hang, cua so bang chuyen hep lai, gioi han nuoc di / thoi gian /
 *                  undo siet dan.
 *
 * Truoc day moi lever deu pin het truoc level ~19 va level 20..90 gan nhu giong het
 * nhau; cac moc duoi day duoc gian ra de duong cong con song toi khoang level 90.
 * Luu y: day van la GIA THIET THIET KE, phai hieu chinh lai khi co telemetry that.
 */
function configForLevelNumber(level, overrides = {}) {
  const L = Math.max(1, Math.floor(level));

  /* --- GD1: quy mo --- */
  const numBoxes = Math.min(4 + Math.floor(L / 3), 10);       // tran o L=18
  const numEmptyBoxes = 1;                                     // luat cung GDD muc 6
  // Level dau: bot 1 bo item -> ban co thoang hon (nhieu o trong hon)
  const numSets = L <= 6 ? numBoxes - 2 : numBoxes - 1;
  const numCategories = Math.min(1 + Math.floor(L / 4), 4);    // tran o L=12
  const itemTypesPerCategory = Math.min(2 + Math.floor(L / 12), 3);
  const poolSize = numCategories * itemTypesPerCategory;

  /* --- GD2: do phan tan --- */
  // ratio21 giam dan 1.0 -> 0.15: bo item bi xe le nhieu hon theo level.
  // He so 0.028 (truoc la 0.045) keo diem cham day tu L=19 sang L=30, de GD2
  // con viec de lam sau khi quy mo da het du dia.
  const ratio21 = Math.max(0.15, 1.0 - L * 0.028);
  const extraScramble = Math.min(2.0, Math.max(0, (L - 12) * 0.05));
  const trayOrder = L < 8 ? 'wrapOrder' : L < 20 ? 'shuffled' : 'reverse';
  // Cang it bo DUNG CHUNG mot loai item thi cang kho: moi item chi co dung 2 ban
  // sao anh em, khong con nhieu cach gom thay the. Chan duoi = so bo toi thieu ma
  // pool hien tai buoc phai gom, de khong bao gio vi pham kiem tra o normalizeConfig.
  const maxSetsPerType = Math.max(
    Math.ceil(numSets / poolSize),
    L < 35 ? 3 : L < 60 ? 2 : 1
  );

  /* --- GD3: luat chat hon & ap luc meta --- */
  // Luat Khay chat dan: khong lat cong tac ca ban o dung level 40 (lam diem do kho
  // nhay 16 diem trong mot level), ma tang dan ti le Khay doi dung LOAI ITEM tu
  // L34 den L52. Tung Khay mang matchMode rieng — engine da ho tro san (Tray.js).
  const strictTrayRatio = clamp((L - 34) / 18, 0, 1);
  const trayMatchMode = strictTrayRatio >= 0.5 ? 'itemType' : 'category'; // nhan tong quat
  // Cua so Khay hep => phai wrapped DUNG loai dang co mat, giu nhieu Thung wrapped
  // tren tay hon. Khong de doa solvability: F = 3N - 3S bat bien qua ca nuoc di lan
  // luot giao hang, nen luon con o trong o mot Thung chua wrapped.
  const conveyorMaxActive = L < 28 ? 4 : L < 55 ? 3 : 2;
  const moveLimitSlack = L < 5 ? null : Math.max(1.05, 2.0 - L * 0.018);
  const secondsPerMove = L < 25 ? null : Math.max(3.5, 8 - (L - 25) * 0.05);
  const undoCount = L < 30 ? 3 : L < 60 ? 2 : 1;

  return {
    seed: (L * 2654435761) % 2147483647,
    numBoxes,
    numEmptyBoxes,
    numSets,
    numCategories,
    itemTypesPerCategory,
    maxSetsPerType,
    ratio21,
    extraScramble,
    trayOrder,
    trayMatchMode,
    strictTrayRatio,
    conveyorMaxActive,
    moveLimitSlack,
    secondsPerMove,
    undoCount,
    compactFreeSlots: L > 6,
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* Chuan hoa & kiem tra tham so                                        */
/* ------------------------------------------------------------------ */

function normalizeConfig(user) {
  const cfg = { ...DEFAULTS, ...user };
  cfg.numCategories = clamp(cfg.numCategories, 1, CATEGORIES.length);
  cfg.itemTypesPerCategory = clamp(cfg.itemTypesPerCategory, 1, 3);
  cfg.boxCapacity = cfg.boxCapacity || CAPACITY;
  cfg.numEmptyBoxes = Math.max(1, cfg.numEmptyBoxes); // luat cung GDD muc 6
  if (cfg.numSets == null) cfg.numSets = cfg.numBoxes - cfg.numEmptyBoxes;

  if (cfg.numSets < 1) throw new Error('numSets phai >= 1');
  if (cfg.numSets > cfg.numBoxes - 1)
    throw new Error('Phai chua it nhat 1 Thung rong: numSets <= numBoxes - 1');

  const poolSize = cfg.numCategories * cfg.itemTypesPerCategory;
  if (poolSize * cfg.maxSetsPerType < cfg.numSets) {
    throw new Error(
      `Pool item qua nho: ${poolSize} loai x ${cfg.maxSetsPerType} bo < ${cfg.numSets} bo can thiet. ` +
        `Tang numCategories hoac itemTypesPerCategory.`
    );
  }
  // Kha thi? Neu moi Thung co item deu buoc phai DAY (compaction gom het o trong
  // vao cac Thung rong), thi 1 loai item khong duoc chiem qua 2 o trong 1 Thung
  // (neu khong se thanh 3-cung-loai = wrapped san). Suy ra dieu kien dem:
  //     3 * (so bo toi da cua 1 loai) <= 2 * numSets
  const emptyBoxesAfterCompaction = cfg.compactFreeSlots
    ? cfg.numBoxes - cfg.numSets
    : Math.min(cfg.numEmptyBoxes, cfg.numBoxes - cfg.numSets);
  const boxesForcedFull = emptyBoxesAfterCompaction === cfg.numBoxes - cfg.numSets;
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

  // --- 5. Compaction: dam bao dung so Thung RONG hoan toan ---
  // compactFreeSlots = true  -> don TOAN BO o trong vao (N - S) box rong  (ban chat, kho)
  //                  = false -> chi dam bao numEmptyBoxes box rong, phan con lai
  //                             de lam "lo" rai rac trong cac box khac       (thoang, de)
  {
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
  if (emptyCount < cfg.numEmptyBoxes) return null;

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
  const maxWrappedHeld = simulateDelivery(boxes, solution, trays, cfg);

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

  // Diem do kho 1..100 — 6 truc chuan hoa ve [0,1] roi tron theo trong so.
  //
  // TRAN DO KHO CUA BO LUAT (do thang 9/2026, 30 seed moi level):
  //   level |  par | spread | wrapped | free
  //      8  |  7.3 |  2.20  |   1.0   |  3
  //     20  | 15.1 |  2.56  |   2.5   |  3
  //     40  | 17.2 |  2.89  |   7.0   |  3
  //     90  | 17.0 |  2.89  |   8.0   |  3
  // Moi chi so CAU TRUC cua ban co deu cham tran quanh level 40: quy mo bi chan boi
  // 10 Thung (gioi han ban choi trong GDD) va 4 nhom hang x 3 loai (toan bo
  // ITEM_CATALOG). Voi numSets = numBoxes - 1 thi F = 3N - 3S = 3 la HANG SO, nghia
  // la truc "ap luc o trong" cu (parMoves / freeSlots) chi la ban sao ti le cua truc
  // khoi luong — 24% trong so cham diem cho cung mot thong tin hai lan. No duoc thay
  // bang do PHAN TAN (spread), thu that su thay doi theo ratio21 tu 2.00 den 2.89.
  //
  // Ket luan thiet ke: sau level ~40, do kho KHONG the tang bang cau truc ban co nua,
  // chi con tang bang ton kho Khay (wrapped phai giu tren tay) va do nghiem ngat cua
  // luat. Diem so phan anh dung dieu do thay vi nguy tao them do kho gia.
  const nm = Math.min(parMoves / 24, 1);                                   // khoi luong
  const nd = clamp((difficulty.avgSpread - 1) / 2, 0, 1);                  // phan tan bo item
  const nx = difficulty.mixedBoxRatio;                                     // do dan xen
  // Nhieu thi giac = vua phai co nhieu loai item, VUA co nhieu loai cung mot nhom hang.
  // Chi dung ti le types/cats la sai: level 1 co 1 nhom x 2 loai cho ti le 2.0 (cao)
  // du ban co chi vo ven 2 loai item — de nhu cho.
  const nc = Math.min(typesUsed / 12, 1) * clamp(difficulty.categoryConfusion / 3, 0, 1);
  const nw = Math.min(maxWrappedHeld / 8, 1);                              // suc ep tang Tray
  // Do NGHIEM NGAT cua luat choi. Truoc day cu buoc nhay lon nhat cua duong cong
  // (level 40: Khay doi khop dung loai item) hoan toan vo hinh voi diem so, vi no
  // khong lam thay doi bat ky chi so nao cua ban co ban dau.
  const ns = clamp(
    strictRatio * 0.3 +
      (cfg.trayOrder === 'reverse' ? 0.2 : cfg.trayOrder === 'shuffled' ? 0.1 : 0) +
      (cfg.moveLimitSlack == null ? 0 : clamp((1.8 - cfg.moveLimitSlack) / 0.75, 0, 1) * 0.2) +
      (cfg.secondsPerMove == null ? 0 : clamp((8 - cfg.secondsPerMove) / 4.5, 0, 1) * 0.15) +
      clamp((3 - cfg.undoCount) / 2, 0, 1) * 0.15,
    0,
    1
  );
  difficulty.components = {
    volume: +nm.toFixed(3), spread: +nd.toFixed(3), interleave: +nx.toFixed(3),
    confusion: +nc.toFixed(3), trayBacklog: +nw.toFixed(3), strictness: +ns.toFixed(3),
  };
  difficulty.score = clamp(
    Math.round(
      100 *
        (0.30 * nm + 0.14 * nd + 0.10 * nx + 0.08 * nc + 0.20 * nw + 0.18 * ns)
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
function simulateDelivery(boxes, solution, trays, cfg) {
  const cap = cfg.boxCapacity;
  const state = boxes.map((b) => b.slice());
  const pending = trays.map((t) => ({ ...t }));  // hang doi Tray theo thu tu, chua duoc phuc vu
  const held = [];                               // box wrapped dang phai giu tren ban
  let maxHeld = 0;
  const wrappedSet = new Set();

  // Doc che do cua TUNG Khay, khong phai che do chung cua man — tu ban 0.5.1 mot man
  // co the tron ca hai loai Khay.
  const matches = (tray, box) =>
    tray.matchMode === 'itemType'
      ? tray.targetItemId === box.typeId
      : tray.categoryId === box.categoryId;

  function tryDeliver() {
    let progress = true;
    while (progress) {
      progress = false;
      const window = pending.slice(0, cfg.conveyorMaxActive); // maxActive Tray dau hang doi
      outer: for (let hi = 0; hi < held.length; hi++) {
        for (let wi = 0; wi < window.length; wi++) {
          if (matches(window[wi], held[hi])) {
            pending.splice(wi, 1);
            held.splice(hi, 1);
            progress = true;
            break outer;
          }
        }
      }
    }
  }

  for (const mv of solution) {
    const [item] = state[mv.from].splice(mv.index, 1);
    state[mv.to].push(item);
    if (!wrappedSet.has(mv.to) && isWrapped(state[mv.to], cap)) {
      wrappedSet.add(mv.to);
      const typeId = state[mv.to][0];
      held.push({ boxIdx: mv.to, typeId, categoryId: getTypeInfo(typeId).categoryId });
      maxHeld = Math.max(maxHeld, held.length);
      tryDeliver();
    }
  }
  // Cuoi van: moi Tray con lai deu khop 1 box wrapped dang giu -> luon giao het duoc
  return maxHeld;
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
      level = generateSolvableLevel(cfg);
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
        return generateSolvableLevel({ ...cfg, numSets: sets });
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

    render(boxes, selectedSource = null, validTargetIds = []) {
        this.container.innerHTML = '';
        
        boxes.forEach(box => {
            const boxEl = document.createElement('div');
            boxEl.className = 'box';
            boxEl.dataset.boxId = box.id;
            
            if (box.isEmpty()) boxEl.classList.add('empty-box');
            if (validTargetIds.includes(box.id)) boxEl.classList.add('valid-target');
            if (box.isWrapped) boxEl.classList.add('wrapped');

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

            boxEl.appendChild(topFace);
            boxEl.appendChild(frontFace);
            boxEl.appendChild(flapTop);
            boxEl.appendChild(flapBottom);
            boxEl.appendChild(tape);

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

            this.container.appendChild(boxEl);
        });
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        // Find DOM elements
        const sourceEl = this.container.querySelector(`.box[data-box-id="${sourceBoxId}"]`);
        const targetEl = this.container.querySelector(`.box[data-box-id="${targetBoxId}"]`);
        
        if (!sourceEl || !targetEl) {
            onComplete();
            return;
        }

        // We assume the top-most item in source is moving to the next empty slot in target.
        // For prototype, we'll just do a quick generic animation or call onComplete directly.
        // Let's do a simple flash for now to keep it robust.
        targetEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            targetEl.style.transform = '';
            onComplete();
        }, 150);
    }
}


// --- src/ui/TrayRenderer.js ---

class TrayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.offset = 0;
        this.speed = 1.5; // pixels per frame
        this.trayElements = []; // { id, el, isExiting, currentTheta, fadingOut, onComplete }
        this.lastTime = performance.now();
        this.highlightedTrayId = null;
        this.rejectTrayId = null;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    render(activeTrays, highlightedTrayId = null, rejectTrayId = null) {
        this.highlightedTrayId = highlightedTrayId;
        this.rejectTrayId = rejectTrayId;
        
        // Sync activeTrays with trayElements
        activeTrays.forEach((tray, index) => {
            let existing = this.trayElements.find(t => t.id === tray.id);
            let trayEl;
            
            if (!existing) {
                trayEl = document.createElement('div');
                trayEl.className = 'tray';
                trayEl.dataset.trayId = tray.id;
                trayEl.style.position = 'absolute';
                trayEl.style.bottom = '25px';
                
                // Base structure
                const labelEl = document.createElement('div');
                labelEl.className = 'tray-label';
                trayEl.appendChild(labelEl);
                
                this.container.appendChild(trayEl);
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    labelEl.textContent = catConfig.label;
                    labelEl.style.backgroundColor = catConfig.color;
                }
                
                const newTrayObj = { 
                    id: tray.id, 
                    el: trayEl, 
                    isExiting: false, 
                    currentTheta: 0,
                    fadingOut: false
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
                
                // Target item (visual hint)
                let targetEl = trayEl.querySelector('.tray-target');
                if (!tray.isFull() && tray.targetItemId) {
                    if (!targetEl) {
                        targetEl = document.createElement('div');
                        targetEl.className = 'tray-target';
                        trayEl.appendChild(targetEl);
                    }
                    targetEl.textContent = getItemEmoji(tray.targetItemId);
                } else if (targetEl) {
                    targetEl.remove();
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
        
        this.updatePositions();
    }

    animate(now) {
        const dt = Math.min(now - this.lastTime, 50); // cap dt to avoid huge jumps
        this.lastTime = now;
        
        // speed in radians per frame (negative so front track moves right-to-left)
        const deltaTheta = -0.015 * (dt / 16.66);
        this.offset += deltaTheta;
        
        // Exiting trays update their own theta
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const item = this.trayElements[i];
            if (item.isExiting) {
                item.currentTheta += deltaTheta;
                
                // Out port is at left edge (cos approaches -1). Front track (sin < 0).
                if (!item.fadingOut && Math.cos(item.currentTheta) < -0.90 && Math.sin(item.currentTheta) < 0) {
                    item.fadingOut = true;
                    item.el.classList.add('exiting'); // Trigger CSS fade out
                    setTimeout(() => {
                        if (item.onComplete) item.onComplete();
                        if (item.el.parentNode) item.el.remove();
                        const idx = this.trayElements.indexOf(item);
                        if (idx > -1) this.trayElements.splice(idx, 1);
                    }, 300);
                }
            }
        }
        
        this.updatePositions();
        requestAnimationFrame(this.animate);
    }

    updatePositions() {
        if (!this.container || this.trayElements.length === 0) return;
        
        const containerWidth = this.container.clientWidth || 600;
        const cx = containerWidth / 2;
        const cy = 110;
        const rx = (containerWidth - 90) / 2;
        const ry = 80;
        
        const activeTrays = this.trayElements.filter(t => !t.isExiting);
        const totalActive = activeTrays.length;
        
        let activeIndex = 0;
        
        this.trayElements.forEach(item => {
            let theta;
            if (!item.isExiting) {
                // Active trays space out evenly based on offset
                theta = (activeIndex / totalActive) * Math.PI * 2 + this.offset;
                item.currentTheta = theta;
                activeIndex++;
            } else {
                theta = item.currentTheta;
            }
            
            let x = cx + rx * Math.cos(theta) - 40;
            let y = cy + ry * Math.sin(theta) - 15;
            
            item.el.style.left = `${x}px`;
            item.el.style.bottom = `${y}px`;
            
            if (Math.sin(theta) <= 0) {
                item.el.style.zIndex = 10;
            } else {
                item.el.style.zIndex = 5;
            }
        });
    }

    animateTrayExit(trayId, onComplete) {
        const trayData = this.trayElements.find(t => t.id === trayId);
        if (!trayData) {
            if(onComplete) onComplete();
            return;
        }
        
        trayData.isExiting = true;
        trayData.onComplete = onComplete;
        
        // Remove 'exiting' class just in case it was incorrectly added
        trayData.el.classList.remove('exiting');
        
        // Ensure visual shows a box
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
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.overlayLoading = document.getElementById('overlay-loading');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
        this.dragState = {
            isDragging: false,
            boxId: null,
            targetTrayId: null
        };
        
        this.bindEvents();
        this.bindEngineCallbacks();
        
        // Start
        this.startNewLevel();
    }
    
    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.currentLevel = 1;
            this.startNewLevel();
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
    
    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                this.overlayWin.classList.remove('hidden');
            } else if (state === 'LOST') {
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
        };
        
        this.engine.onMoveCountUpdated = (count) => {
            this.moveDisplay.textContent = count;
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayExited = (trayId) => {
            this.trayRenderer.animateTrayExit(trayId, () => {
                this.updateRender();
            });
            this.conveyorRenderer.animateShift();
        };
    }
    
    async startNewLevel(retry = false) {
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
        
        this.engine.startLevel(levelData);
        this.levelDisplay.textContent = this.currentLevel;
        this.moveDisplay.textContent = "0";
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
    }
    
    updateRender() {
        const validTargets = this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : [];
        this.boxRenderer.render(this.engine.boxes, this.engine.selectedSource, validTargets);
        
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
    
    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging) return;
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            if (this.engine.selectTarget(boxId)) {
                // Animate then update
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    if (targetBox.isWrapped) {
                        // Apply wrapped class to existing DOM to trigger transition
                        const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
                        if (domBox) domBox.classList.add('wrapped');
                        
                        // Wait for flap animation (0.5s) + tape (0.3s) = 0.8s
                        setTimeout(() => {
                            this.updateRender();
                        }, 800);
                    } else {
                        this.updateRender();
                    }
                });
            } else {
                // Invalid or deselected
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    this.engine.selectSource(boxId, itemIndex);
                }
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
        
        // Setup ghost
        this.dragGhost.className = boxEl.className; // Copy .box .wrapped etc.
        this.dragGhost.classList.remove('dragging'); // Ensure ghost is visible
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.position = 'fixed';
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
        const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
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
        
        document.body.classList.remove('is-dragging');
        
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
                    this.dragGhost.style.left = `${targetX - 60}px`; // 120/2
                    this.dragGhost.style.top = `${targetY - 35}px`; // 70/2
                    this.dragGhost.style.transform = 'scale(0.5)';
                    this.dragGhost.style.opacity = '0';
                    
                    setTimeout(() => {
                        this.dragGhost.style.display = 'none';
                        this.dragGhost.style.transition = '';
                        this.dragGhost.style.transform = '';
                        this.dragGhost.style.opacity = '';
                        this.engine.dropOnTray(trayId);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
            }
        }
        
        this.dragGhost.style.display = 'none';
        this.engine.cancelDrag();
        this.updateRender();
    }
    
    moveGhost(x, y) {
        this.dragGhost.style.left = `${x}px`;
        this.dragGhost.style.top = `${y}px`;
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new UIManager();
});

