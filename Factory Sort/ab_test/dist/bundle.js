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
        this.slots = [null, null, null]; // Fixed 3 visual & logical slots
        this.isWrapped = false;
        this.maxSize = 3;
    }

    get items() {
        return this.slots.filter(s => s !== null && s !== undefined);
    }

    set items(arr) {
        this.slots = [null, null, null];
        if (Array.isArray(arr)) {
            arr.forEach((it, idx) => {
                if (idx < 3) this.slots[idx] = it;
            });
        }
    }

    removeItem(slotIndex) {
        if (this.isWrapped || slotIndex < 0 || slotIndex >= this.maxSize) {
            return null;
        }
        const item = this.slots[slotIndex];
        this.slots[slotIndex] = null;
        return item;
    }

    push(itemId, targetSlotIndex = null) {
        if (!this.canAccept(targetSlotIndex)) {
            return false;
        }
        if (targetSlotIndex !== null && targetSlotIndex >= 0 && targetSlotIndex < this.maxSize && this.slots[targetSlotIndex] === null) {
            this.slots[targetSlotIndex] = itemId;
            return true;
        }
        const emptyIdx = this.slots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
            this.slots[emptyIdx] = itemId;
            return true;
        }
        return false;
    }

    canAccept(targetSlotIndex = null) {
        if (this.isWrapped) return false;
        if (targetSlotIndex !== null && targetSlotIndex >= 0 && targetSlotIndex < this.maxSize) {
            return this.slots[targetSlotIndex] === null;
        }
        return this.slots.some(s => s === null);
    }

    isFull() {
        return this.slots.every(s => s !== null && s !== undefined);
    }

    isEmpty() {
        return this.slots.every(s => s === null || s === undefined);
    }

    checkWrapped() {
        if (this.isFull() && !this.isWrapped) {
            const firstId = this.slots[0];
            if (firstId !== null && this.slots[1] === firstId && this.slots[2] === firstId) {
                this.isWrapped = true;
                return true;
            }
        }
        return false;
    }

    getCategory() {
        if (!this.isWrapped || this.isEmpty()) return null;
        const nonNull = this.items;
        return nonNull.length > 0 ? getCategoryByItemId(nonNull[0]) : null;
    }

    /** Loai item cua Thung da wrapped (ca 3 o giong nhau). Dung cho Khay che do 'itemType'. */
    getItemType() {
        if (!this.isWrapped || this.isEmpty()) return null;
        const nonNull = this.items;
        return nonNull.length > 0 ? nonNull[0] : null;
    }
    
    clone() {
        const cloned = new Box(this.id);
        cloned.slots = [...this.slots];
        cloned.isWrapped = this.isWrapped;
        return cloned;
    }
}


// --- src/core/Tray.js ---
class Tray {
    /**
     * @param {string} id
     * @param {string} categoryId   nhom hang dung de hien thi mau
     * @param {string} targetItemId loai item cu the Khay nhan (emoji hien tren Khay)
     * @param {'category'|'itemType'} matchMode
     *
     * Khay luon nhan dung loai item hien tren Khay, khong ghep theo ID cua Thung
     * hay chi theo mau/category. matchMode duoc giu de doc du lieu level cu;
     * no khong noi long dieu kien nhan hang. Moi Khay cung targetItemId deu co
     * the nhan bat ky Thung da goi cung loai, moi Khay toi da mot Thung.
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


// --- src/core/BoosterSolver.js ---
// Booster proof model: only accepts a candidate after finding an actual winning path.
// A search cutoff is inconclusive, never proof of solvability.
function boosterSnapshot(engine) {
    const all = [...engine.boxes, ...engine.queue];
    const indices = new Map(all.map((b, i) => [String(b.id), i]));
    return {
        b: all.map(b => b.items.slice()),
        c: engine.columns.map(c => c.map(id => indices.get(String(id))).filter(i => i !== undefined)),
        q: engine.queue.map(b => indices.get(String(b.id))),
        t: engine.conveyor.allTrays.filter(t => !t.isFull()).map(t => t.targetItemId),
        rows: engine.visibleRows, cap: engine.maxQueueSize, active: engine.conveyor.maxActive,
        reference: (engine.boosterReferenceSolution || []).map(m => ({ f: indices.get(String(m.from)), t: indices.get(String(m.to)), it: m.itemId })),
    };
}

function boosterClone(s) { return { ...s, b: s.b.map(b => b && b.slice()), c: s.c.map(c => c.slice()), q: s.q.slice(), t: s.t.slice() }; }
function boosterWrapped(b) { return b && b.length === 3 && b.every(it => it === b[0]); }
function boosterNormalize(s) {
    // Free accepted wrapped boxes and reveal their column successors, as runtime does.
    let progress = true;
    while (progress) {
        progress = false;
        for (const col of s.c) {
            for (const id of col.slice(0, s.rows)) {
                if (!boosterWrapped(s.b[id])) continue;
                col.splice(col.indexOf(id), 1); s.q.push(id); progress = true;
            }
        }
        for (let qi = 0; qi < s.q.length;) {
            const id = s.q[qi];
            const ti = s.t.slice(0, s.active).indexOf(s.b[id][0]);
            if (ti < 0) { qi++; continue; }
            s.t.splice(ti, 1); s.b[id] = null; s.q.splice(qi, 1); progress = true;
        }
        if (s.q.length > s.cap) return false;
    }
    return true;
}
function boosterWon(s) { return !s.t.length && !s.q.length && s.b.every(b => !b || !b.length); }
function boosterMoves(s) {
    const ids = s.c.flatMap(c => c.slice(0, s.rows));
    const moves = [];
    for (const f of ids) {
        const src = s.b[f];
        if (!src || boosterWrapped(src)) continue;
        for (const it of new Set(src)) for (const t of ids) {
            const dst = s.b[t];
            if (t === f || !dst || dst.length >= 3 || boosterWrapped(dst)) continue;
            const same = dst.filter(x => x === it).length;
            const wanted = s.t.slice(0, s.active).includes(it);
            const score = same === 2 ? (wanted ? 1000 : 300 - s.q.length * 70)
                : dst.length === 2 ? -1000 : same === 1 ? (wanted ? 110 : 70) : -20 - dst.length * 5;
            moves.push({ f, t, it, score: score + (src.length === 1 ? (same === 2 ? 20 : -80) : 0) });
        }
    }
    return moves.sort((a, b) => b.score - a.score);
}
function boosterStep(s, m) {
    const n = boosterClone(s); n.b[m.f].splice(n.b[m.f].indexOf(m.it), 1); n.b[m.t].push(m.it);
    if (!n.b[m.f].length) {
        n.b[m.f] = null;
        for (const col of n.c) { const at = col.indexOf(m.f); if (at >= 0) col.splice(at, 1); }
    }
    return boosterNormalize(n) ? n : null;
}
function boosterKey(s) { return JSON.stringify([s.c.map(c => c.map(i => s.b[i].slice().sort())), s.q.map(i => s.b[i][0]).sort(), s.t]); }
function boosterMatchingInvariant(s) {
    const counts = new Map();
    for (const b of s.b) for (const it of b || []) counts.set(it, (counts.get(it) || 0) + 1);
    for (const it of s.t) counts.set(it, (counts.get(it) || 0) - 3);
    return [...counts.values()].every(n => n === 0);
}
// Group one complete visible triple using only legal simulated moves. Moving
// contaminants first makes the plan reason about a whole set instead of cycling
// between locally attractive pairs. Every returned child carries a real path.
function boosterMacroChildren(s, deadline, maxPlans = 24) {
    const ids = s.c.flatMap(c => c.slice(0, s.rows));
    const counts = new Map();
    for (const id of ids) for (const it of s.b[id] || []) counts.set(it, (counts.get(it) || 0) + 1);
    const desired = s.t.slice(0, s.active);
    const plans = [];
    for (const [it, count] of counts) {
        if (count < 3) continue;
        for (const target of ids) {
            const b = s.b[target];
            if (!b || boosterWrapped(b) || !b.includes(it)) continue;
            const same = b.filter(x => x === it).length;
            plans.push({ it, target, score: (desired.includes(it) ? 1000 : 0) + same * 100 - b.length * 10 - s.q.length * (desired.includes(it) ? 0 : 80) });
        }
    }
    plans.sort((a, b) => b.score - a.score);
    const children = [];
    for (const plan of plans.slice(0, maxPlans)) {
        if (Date.now() >= deadline) break;
        // Different buffer choices preserve alternatives where a future reveal
        // depends on keeping a particular almost-empty box alive.
        for (let variant = 0; variant < 2; variant++) {
            let n = boosterClone(s), valid = true;
            const target = plan.target, it = plan.it;
            while (n.b[target] && n.b[target].some(x => x !== it)) {
                const bad = n.b[target].find(x => x !== it);
                const acc = n.c.flatMap(c => c.slice(0, n.rows));
                const buffers = acc.filter(i => i !== target && n.b[i] && n.b[i].length < 3 && !boosterWrapped(n.b[i]));
                buffers.sort((a, b) => {
                    const score = i => n.b[i].filter(x => x === bad).length * 20 + n.b[i].length * (variant ? -1 : 1) - (n.b[i].includes(it) ? 50 : 0);
                    return score(b) - score(a);
                });
                const buffer = buffers[0];
                if (buffer === undefined) { valid = false; break; }
                n = boosterStep(n, { f: target, t: buffer, it: bad });
                if (!n || !n.b[target]) { valid = false; break; }
            }
            if (!valid) continue;
            while (n.b[target] && n.b[target].length < 3) {
                const acc = n.c.flatMap(c => c.slice(0, n.rows));
                const sources = acc.filter(i => i !== target && n.b[i] && !boosterWrapped(n.b[i]) && n.b[i].includes(it));
                sources.sort((a, b) => variant ? n.b[a].length - n.b[b].length : n.b[b].length - n.b[a].length);
                if (!sources.length) { valid = false; break; }
                n = boosterStep(n, { f: sources[0], t: target, it });
                if (!n) { valid = false; break; }
            }
            if (valid && n && (!n.b[target] || boosterWrapped(n.b[target]))) children.push(n);
        }
    }
    return children;
}
function boosterMacroProof(initial, deadline) {
    for (let variant = 0; variant < 3 && Date.now() < deadline; variant++) {
        let state = initial;
        for (let depth = 0; depth <= initial.t.length && Date.now() < deadline; depth++) {
            const children = boosterMacroChildren(state, deadline, 3);
            if (!children.length) break;
            children.sort((a, b) => a.t.length - b.t.length || a.q.length - b.q.length);
            state = children[Math.min(variant % 2, children.length - 1)];
            if (boosterWon(state)) return true;
        }
    }
    let beam = [initial]; const seen = new Set([boosterKey(initial)]);
    const limit = initial.t.length + 1;
    for (let depth = 0; depth < limit && beam.length && Date.now() < deadline; depth++) {
        const next = [];
        for (const state of beam) {
            for (const child of boosterMacroChildren(state, deadline)) {
                if (boosterWon(child)) return true;
                const key = boosterKey(child); if (seen.has(key)) continue;
                seen.add(key); next.push(child);
            }
            if (Date.now() >= deadline) break;
        }
        // Prefer delivered orders, then exposed free capacity. Keep several
        // alternate completion sequences instead of assuming one greedy route.
        const score = st => st.t.length * 10000 + st.q.length * 100 + st.c.flatMap(c => c.slice(0, st.rows)).reduce((sum, id) => sum + st.b[id].length, 0);
        next.sort((a, b) => score(a) - score(b));
        beam = next.slice(0, 6);
    }
    return false;
}

function boosterProveSolvable(snapshot, deadline = Date.now() + 120) {
    if (!boosterMatchingInvariant(snapshot)) return false;
    const initial = boosterClone(snapshot);
    if (!boosterNormalize(initial)) return false;
    if (boosterWon(initial)) return true;
    // The authored route is a useful execution order after a booster too, but
    // it is never trusted blindly: replay only moves legal in this exact state.
    let referenceState = boosterClone(initial);
    for (const m of initial.reference || []) {
        if (Date.now() >= deadline) return false;
        const visible = referenceState.c.flatMap(c => c.slice(0, referenceState.rows));
        const src = referenceState.b[m.f], dst = referenceState.b[m.t];
        if (!visible.includes(m.f) || !visible.includes(m.t) || !src || !dst || boosterWrapped(src) || boosterWrapped(dst) || dst.length >= 3 || !src.includes(m.it)) continue;
        const next = boosterStep(referenceState, m);
        if (!next) break;
        referenceState = next;
        if (boosterWon(referenceState)) return true;
    }
    if (referenceState.t.length < initial.t.length && boosterMacroProof(referenceState, Math.min(deadline, Date.now() + 30))) return true;
    // Reserve a bounded portion for set-level beam planning before the smaller
    // item-level fallback. Both prove by replay, rather than by a heuristic score.
    const macroDeadline = Math.min(deadline, Date.now() + Math.max(30, (deadline - Date.now()) * 0.65));
    if (boosterMacroProof(initial, macroDeadline)) return true;
    // Multiple deterministic constructive attempts are cheap on large levels.
    for (let variant = 0; variant < 8; variant++) {
        if (Date.now() >= deadline) return false;
        let s = boosterClone(initial); const seen = new Set();
        for (let step = 0; step < Math.max(60, s.b.length * 18); step++) {
            if (Date.now() >= deadline) return false;
            const key = boosterKey(s); if (seen.has(key)) break; seen.add(key);
            const moves = boosterMoves(s); if (!moves.length) break;
            let candidates = moves;
            if (variant) candidates = moves.slice().sort((a, b) =>
                (b.score + ((b.f * 31 + b.t * 17 + step * 13 + variant * 7) % (variant * 35))) -
                (a.score + ((a.f * 31 + a.t * 17 + step * 13 + variant * 7) % (variant * 35))));
            let next = null;
            for (const m of candidates) {
                const n = boosterStep(s, m);
                if (n && !seen.has(boosterKey(n))) { next = n; break; }
            }
            if (!next) break; s = next;
            if (boosterWon(s)) return true;
        }
    }
    if (initial.b.filter(Boolean).length > 16) return false;
    let budget = 6000; const seen = new Map();
    function search(s, depth) {
        if (boosterWon(s)) return true;
        if (budget <= 0 || depth > 100 || Date.now() >= deadline) return false;
        budget--;
        const key = boosterKey(s); if ((seen.get(key) ?? Infinity) <= depth) return false; seen.set(key, depth);
        for (const m of boosterMoves(s)) {
            if (budget <= 0 || Date.now() >= deadline) break;
            const n = boosterStep(s, m); if (n && search(n, depth + 1)) return true;
        }
        return false;
    }
    return search(initial, 0);
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

        this.maxQueueSize = 5;
        this.extraTrayUsed = false;
        this.freezeRemainingSeconds = 0;
        this.lastBoosterError = '';

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


// --- src/generator/CuratedLevelSeeds.js ---
// Offline-selected seeds; see tools/levels50.json for independent holdout outcomes.
const LEVEL_SEEDS = {
  "1": 506952114,
  "2": 14911768,
  "3": 14911768,
  "4": 78084259,
  "5": 14911768,
  "6": 134586959,
  "7": 28251350,
  "8": 317434641,
  "9": 134586959,
  "10": 613287723,
  "11": 254262150,
  "12": 169508100,
  "13": 493612532,
  "14": 585036373,
  "15": 585036373,
  "16": 972313296,
  "17": 2077641365,
  "18": 106335609,
  "19": 1655443301,
  "20": 585036373,
  "21": 676460214,
  "22": 1479265410,
  "23": 1028815996,
  "24": 1775118492,
  "25": 1331338869,
  "26": 2077641365,
  "27": 254262150,
  "28": 880889455,
  "29": 1957966174,
  "30": 134586959,
  "31": 1268166378,
  "32": 1451014060,
  "33": 1028815996,
  "34": 585036373,
  "35": 493612532,
  "36": 1387841569,
  "37": 1148491187,
  "38": 437109832,
  "39": 2134144065,
  "40": 1746867142,
  "41": 373937341,
  "42": 944061946,
  "43": 2077641365,
  "44": 972313296,
  "45": 1718615792,
  "46": 49832909,
  "47": 373937341,
  "48": 169508100,
  "49": 1690364442,
  "50": 437109832
};


// --- src/generator/OrderPacing.js ---
/**
 * Offline order pacing inspired by pressure/release authoring in Fish Sort.
 * These blocks are authored against the reference completion sequence, not the
 * player's live progress. No orders or difficulty are changed during a game.
 */
const ORDER_PACING_PROFILES = {
  normal: { name: 'flow', extras: [0, 1, 1, 1, 0] },
  hard: { name: 'wave', extras: [1, 2, 1, 2, 1] },
  superhard: { name: 'double', extras: [2, 3, 1, 3, 1] },
};

function pacingShuffle(values, rng) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * In a block of B orders with A active trays, at most B-A completions can wait
 * before one of the active requests is reached. The next completion adds one
 * transient queue entry. For Q >= 2 (the game uses Q=5), B <= A + Q - 2 reserves
 * at least one queue slot in the instant-delivery reference replay. This is not
 * a bound for every player path or physical OUT timing: outgoing full trays can
 * temporarily retain active positions, and the real engine waits for their exit.
 * Full replay remains the final check of the authored reference route.
 */
function createOrderSchedule(referenceTypes, cfg, rng) {
  const total = referenceTypes.length;
  const active = Math.max(1, Math.floor(cfg.conveyorMaxActive || 1));
  const capacity = Math.max(1, Math.floor(cfg.queueCapacity || 5));
  const profile = cfg.trayJitter === false ? null : ORDER_PACING_PROFILES[cfg.tier];
  const trayTypes = [];
  const authoredBlocks = [];
  let guaranteedQueueUpperBound = total ? 1 : 0;

  for (let from = 0; from < total;) {
    const phase = Math.min(4, Math.floor(from / total * 5));
    const desiredExtra = profile ? profile.extras[phase] : 0;
    const extra = Math.min(desiredExtra, Math.max(0, capacity - 2));
    const size = Math.min(total - from, cfg.trayJitter === false ? 1 : active + extra);
    const values = referenceTypes.slice(from, from + size);
    let ordered;
    if (extra > 0 && size > active) {
      // Delay the earliest completion beyond the initially active prefix. The
      // remaining requests vary with the seed; repeated types can soften the
      // effective pressure, so consumers must inspect the replay measurements.
      ordered = pacingShuffle(values.slice(1), rng).concat(values[0]);
    } else {
      ordered = cfg.trayJitter === false ? values : pacingShuffle(values, rng);
    }
    const queueUpperBound = Math.max(1, size - active + 1);
    guaranteedQueueUpperBound = Math.max(guaranteedQueueUpperBound, queueUpperBound);
    authoredBlocks.push({
      from, to: from + size,
      fromProgress: from / total, toProgress: (from + size) / total,
      phase, desiredExtra, appliedExtra: extra,
      queueUpperBound,
    });
    trayTypes.push(...ordered);
    from += size;
  }
  return {
    trayTypes,
    profile: profile ? profile.name : 'legacy',
    authoredProgressBasis: 'reference-completions',
    authoredBlocks,
    guaranteedQueueUpperBound,
    authoringFallback: false,
  };
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
 * (1) TONG O TRONG BAN DAU DUOC QUYET DINH BOI carrierBoxes.
 *     Goi S = so bo 3 item (= so Khay), E = so Thung "chuyen tiep" sinh boi R3.
 *     Tong so Thung N = S + E, tong item = 3S, nen tong o trong = 3(N − S) = 3E.
 *     R2 khong tao cung khong xoa o trong (bit o ben nay, mo o ben kia) nen 3E la
 *     bat bien qua cac phep R2. Mot phan o trong co the bi che trong cot; phai do
 *     visibleFreeSlots rieng de biet bao nhieu o dung duoc ngay luc spawn.
 *     => carrierBoxes (E) la can gat DO CHAT khong gian xoay xo, DOC LAP voi N:
 *        E=1 (3 o trong) ngat tho, E=2 (6 o) chat, E=3 (9 o) vua, E=4 (12 o) rong.
 *     => Tang so Thung chu yeu tang do dai; do kho con phu thuoc do che khuat,
 *        thu tu don, ap luc hang cho va timer.
 *
 * (2) parMoves = refMoves = DO DAI LOI GIAI THAM CHIEU DA KIEM CHUNG.
 *     referenceSolution duoc phat lai tren dung cot, item, hang cho va Khay.
 *     Do dai cua no chung minh mot duong di kha thi, khong chung minh chan duoi
 *     hay toi uu toan cuc: cac bo trung item co the duoc gom theo duong ngan hon.
 *     Timer duoc tinh theo refMoves va phu phi van chuyen; khong ap gioi han nuoc di.
 *
 * Cau hinh hien tai: Normal 4 Khay, Hard 3, Super Hard 3. Nhac don hang co dinh
 * theo seed duoc tao boi OrderPacing.js, sau do phat lai de kiem chung.
 * Dinh nghia va ket qua do moi nhat: docs/difficulty-v4.md, tools/levels50.json.
 * Ty le bot thua la ket qua thuc nghiem, khong phai bao dam ve nguoi choi that.
 *
 * ============================================================================
 * THIET KE DO KHO (9/2026) — KHO VI THONG TIN BI GIAU, KHONG VI DAI
 * ============================================================================
 *
 * Yeu cau san pham cho tier hard:
 *   - 50-70 Thung tren ca ban, nhung LUC NAO cung chi 3 x 4 = 12 Thung nhin thay
 *     duoc; phan con lai bi che HOAN TOAN (khong keo item vao/ra, khong giao).
 *   - Vung nhin thay o duoi day dac item lan lon cua nhieu bo khac nhau. So bo
 *     gom duoc ngay duoc do bang openingSets, khong co bao dam cung 1-2 bo.
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
  // Tran muc tieu so bo giai duoc NGAY trong vung hien luc spawn. null = khong loc.
  // Co the noi long sau mot so lan thu; generationQuality ghi ro co dat muc tieu.
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
  // Thu tu Khay duoc tao ngoai runtime theo cac khoi nhac ap luc/giai phong.
  // Khoi co the lon hon cua so Khay, nhung replay loi giai phai giu dung 5 o hang cho.
  // Khong thay doi don theo ket qua hay toc do nguoi choi trong luc choi.
  trayJitter: true,
  conveyorMaxActive: 3,
  conveyorType: 'oval',
  queueCapacity: 5,          // = GameEngine.maxQueueSize; mo phong dung luat thua

  // --- Timer pacing; legacy move/undo metadata is not an enforced mechanic ---
  moveLimitSlack: null,   // legacy input only; rules.moveLimit is always null
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
  normal:    { numBoxes: 30, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 3, ratio21: 0.65, conveyorMaxActive: 4, secondsPerMove: 6.5 },
  hard:      { numBoxes: 56, carrierBoxes: 2, numCategories: 5, itemTypesPerCategory: 3, ratio21: 0.62, conveyorMaxActive: 3, trayMatchMode: 'itemType', secondsPerMove: 4.2, undoCount: 2 },
  superhard: { numBoxes: 76, carrierBoxes: 3, numCategories: 6, itemTypesPerCategory: 3, ratio21: 0.55, conveyorMaxActive: 3, trayMatchMode: 'itemType', secondsPerMove: 3.0, undoCount: 1 },
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
    const level = finalize(relaxed, built, attempt, cfg.maxOpeningSets);
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
  return generateLevel({ ...preset, tier: presetName, ...overrides });
}

/**
 * Campaign tiers use offline-selected seeds from CuratedLevelSeeds.js.
 * Recalibrate with tools/calibrate-difficulty.mjs --write; independent holdout
 * outcomes and target misses are recorded in tools/levels50.json.
 *
 * L1..5 tutorial, L6..10 onboarding, L11..20 acclimation; after that:
 * endings 5 => Hard, endings 9 => Super Hard, otherwise Normal.
 * Normal: 34..46 boxes / 4 active orders / 6.5..6 sec per reference move.
 * Hard: 52..68 boxes / 3 active orders / 4.2..3.8 sec per reference move.
 * Super Hard: 72..80 boxes / 3 active orders / 3..2.7 sec per reference move.
 * Every tier requires exact displayed emoji. All have 3 columns x 4 reachable
 * rows and five queue slots. Carrier count measures global holes; visibleFreeSlots
 * is the usable opening space and must be measured separately.
 * Reference-solution replay proves solvability, not minimum solution length.
 * The score is a heuristic descriptor; bot dead/win/unresolved outcomes are
 * empirical screening metrics, not measured human failure probabilities.
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
      maxOpeningSets: 4,                           // muc tieu; generationQuality ghi nhan noi long
      numCategories: 5, itemTypesPerCategory: 3,   // 15 loai item => vung hien rat lan lon
      ratio21: lerp(0.64, 0.58, u),
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 3,
      buryBias: 0.1, bottomBias: lerp(0.40, 0.35, u),
      moveLimitSlack: lerp(1.40, 1.30, u),
      secondsPerMove: lerp(4.2, 3.8, clamp(u, 0, 1)),
      undoCount: 2,
    };
  } else if (tier === 'superhard') {
    // More hidden dependencies/types than Hard, same three active orders, tighter timer.
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
      secondsPerMove: lerp(3.0, 2.7, clamp(u, 0, 1)),
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
      trayMatchMode: 'itemType', strictTrayRatio: 1.0,
      conveyorMaxActive: 4,
      buryBias: 0.15, bottomBias: lerp(0.45, 0.36, t),
      moveLimitSlack: lerp(1.55, 1.42, t),
      secondsPerMove: lerp(6.5, 6, t),
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
  let completions = 0;
  const queueEvents = [];

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
      completions++;
      const before = queue.length;
      const deliveredBefore = deliveries;
      autoDeliver();
      queueEvents.push({
        completion: completions,
        completionProgress: completions / trays.length,
        deliveredProgressBefore: deliveredBefore / trays.length,
        deliveredProgressAfter: deliveries / trays.length,
        before, after: queue.length,
        released: deliveries - deliveredBefore,
      });
    }
  }

  if (queue.length !== 0 || pending.length !== 0) return null;
  if (cols.some((c) => c.length > 0)) return null;
  const phaseSummaries = Array.from({ length: 5 }, (_, phase) => {
    const events = queueEvents.filter(event => Math.min(4, Math.floor((event.completion - 1) / trays.length * 5)) === phase);
    return {
      phase, fromProgress: phase / 5, toProgress: (phase + 1) / 5,
      completions: events.length,
      peakBefore: events.reduce((max, event) => Math.max(max, event.before), 0),
      peakAfter: events.reduce((max, event) => Math.max(max, event.after), 0),
      meanAfter: events.length ? events.reduce((sum, event) => sum + event.after, 0) / events.length : 0,
      released: events.reduce((sum, event) => sum + event.released, 0),
      releaseEvents: events.filter(event => event.released > 0).length,
    };
  });
  return { maxQueue, reveals, deliveries, queueEvents, phaseSummaries };
}

/* ------------------------------------------------------------------ */
/* Dong goi output + Khay + do kho                                     */
/* ------------------------------------------------------------------ */

function finalize(cfg, built, attempt, targetOpeningSets = cfg.maxOpeningSets) {
  const cap = cfg.boxCapacity;
  const { boxes, cols, setType, dSet, solution } = built;
  const S = cfg.numSets;
  const N = cfg.numBoxes;

  /* --- Author fixed order pressure/release against reference completions. --- */
  const rngT = makeRng(cfg.seed + 104729 + attempt);
  let schedule = createOrderSchedule(setType, cfg, rngT);

  // Tat ca Khay deu khop theo LOAI ITEM cu the (targetItemId). Tray hien emoji nao
  // thi CHI nhan box cung emoji do — khong con che do 'category' gay nham lan.
  const makeTrays = (types) => types.map((typeId, i) => {
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
  let trays = makeTrays(schedule.trayTypes);

  /* --- Kiem chung: phat lai loi giai duoi DUNG luat cua GameEngine --- */
  const catOf = (typeId) => getTypeInfo(typeId).categoryId;
  let sim = null;
  if (cfg.verify) {
    sim = replayReal(cfg, boxes, cols, trays, solution, catOf);
    if (!sim && schedule.profile !== 'legacy') {
      schedule = {
        ...createOrderSchedule(setType, { ...cfg, tier: 'legacy' }, rngT),
        authoringFallback: true,
        requestedProfile: schedule.profile,
      };
      trays = makeTrays(schedule.trayTypes);
      sim = replayReal(cfg, boxes, cols, trays, solution, catOf);
    }
    if (!sim) return null;
  }
  const strictRatio = trays.length ? 1 : 0;

  /* --- So do kho --- */
  // Reference length is verified feasible; duplicate types can permit shorter routes.
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

  // So bo gom duoc NGAY trong vung hien luc spawn: chi so mo dau do duoc,
  // khong phai so lua chon an toan tai moi thoi diem cua man.
  const openingSets = countOpeningSets(boxes, solution, visibleAtSpawn, cap);
  // Bo lan xay vuot tran dang ap dung; neu pha sinh da noi long thi ghi nhan ben duoi.
  if (cfg.maxOpeningSets != null && openingSets > cfg.maxOpeningSets) return null;

  const difficulty = {
    refMoves,
    parMoves,
    optimalMoves: null,        // duplicate item types can admit a shorter route
    parSource: 'verified-reference-solution',
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
    generationQuality: { targetOpeningSets, openingTargetMet: targetOpeningSets == null || openingSets <= targetOpeningSets },
    orderPacing: {
      profile: schedule.profile,
      requestedProfile: schedule.requestedProfile || schedule.profile,
      authoredProgressBasis: schedule.authoredProgressBasis,
      authoredBlocks: schedule.authoredBlocks,
      guaranteedQueueUpperBound: schedule.guaranteedQueueUpperBound,
      authoringFallback: schedule.authoringFallback,
      replayVerified: Boolean(sim),
      actualPeakQueue: sim ? sim.maxQueue : null,
      queueEvents: sim ? sim.queueEvents : [],
      phaseSummaries: sim ? sim.phaseSummaries : [],
    },
    score: 0,
  };

  /* --- Diem do kho 1..100: heuristic descriptor, NOT predicted player loss. --- */
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
  //   timePressure  0.07  ap luc timer thuc te (khong tinh moveLimitSlack cu)
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
  // Time pressure is real; legacy move-limit slack is not enforced in gameplay.
  const nTime = cfg.secondsPerMove == null ? 0 : clamp((10 - cfg.secondsPerMove) / 7.3, 0, 1);

  difficulty.components = {
    hiddenDepth: +nHidden.toFixed(3), windowTightness: +nWindow.toFixed(3),
    slotPressure: +nSlot.toFixed(3), opening: +nOpen.toFixed(3),
    volume: +nVol.toFixed(3), spread: +nSpread.toFixed(3),
    confusion: +nConf.toFixed(3), interleave: +nInter.toFixed(3),
    timePressure: +nTime.toFixed(3),
  };
  difficulty.score = clamp(
    Math.round(100 * (
      0.22 * nHidden + 0.16 * nWindow + 0.12 * nSlot + 0.10 * nOpen +
      0.10 * nVol + 0.08 * nSpread + 0.08 * nConf + 0.07 * nInter + 0.07 * nTime
    )), 1, 100);

  /* --- Meta: gioi han nuoc di / thoi gian --- */
  const moveLimit = null;
  const automationAllowanceSeconds = Math.ceil(S * 7 / cfg.conveyorMaxActive);
  const timeToPlay = cfg.secondsPerMove == null ? null
    : Math.ceil((parMoves * cfg.secondsPerMove + 20 + automationAllowanceSeconds) / 5) * 5;
  const timerBudget = timeToPlay == null ? null : {
    actionSecondsPerMove: cfg.secondsPerMove, automationAllowanceSeconds,
    baseSeconds: 20, referenceMoves: parMoves, totalSeconds: timeToPlay,
  };

  return {
    version: 'solvable-gen-2.1-timed',
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
      timerBudget,
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


// --- src/ui/ItemArt.js ---
// ItemArt.js — vector illustration helper for the 32 catalog item ids.
// Renders a flat, outlined SVG (stroke #3b2a20, candy fills, white highlight)
// as a data:image/svg+xml CSS variable on elements marked .item-art.
// The emoji/text content stays intact as the accessible fallback.

const STROKE = '#3b2a20';
const STROKE_W = '2.2';
const VB = '0 0 40 40';

function svgWrap(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="40" height="40" fill="none" stroke="${STROKE}" stroke-width="${STROKE_W}" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`;
}

// Shared primitives
function hl(cx, cy, r) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="none" opacity="0.85"/>`;
}
function fill(path, color) {
    return `<path d="${path}" fill="${color}"/>`;
}

const BUILDERS = {
    // ---- Stuffed animals ----
    bear: () => svgWrap(
        fill('M11 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', '#C98B5E') +
        fill('M29 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', '#C98B5E') +
        fill('M20 10c-6 0-10 4-10 9s4 9 10 9 10-4 10-9-4-9-10-9z', '#D69A6C') +
        `<circle cx="16" cy="17" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="24" cy="17" r="1.4" fill="#3b2a20" stroke="none"/>` +
        fill('M17 22h6l-3 3z', '#3b2a20') +
        hl(16, 14.2, 1.3)
    ),
    duck: () => svgWrap(
        fill('M14 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0z', '#F7C948') +
        fill('M10 20c0-4 5-7 10-7s10 3 10 7-5 7-10 7-10-3-10-7z', '#FFD84D') +
        fill('M29 19l6 2-6 2z', '#F2A03D') +
        `<circle cx="18" cy="17" r="1.3" fill="#3b2a20" stroke="none"/>` +
        hl(16, 14, 1.4)
    ),
    bunny: () => svgWrap(
        fill('M14 5a3 8 0 0 1 4 0 3 8 0 0 1-4 0z', '#F5E1E9') +
        fill('M22 5a3 8 0 0 0 4 0 3 8 0 0 0-4 0z', '#F5E1E9') +
        fill('M20 12c-6 0-10 5-10 10s4 9 10 9 10-4 10-9-4-10-10-10z', '#FBE9F0') +
        `<circle cx="16" cy="21" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="24" cy="21" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="20" cy="25" r="1.2" fill="#F26D8C" stroke="none"/>` +
        hl(15, 17, 1.4)
    ),
    penguin: () => svgWrap(
        fill('M20 6c-6 0-10 5-10 12s4 15 10 15 10-8 10-15-4-12-10-12z', '#2E3A4F') +
        fill('M20 11c-4 0-6 4-6 9s2 9 6 9 6-4 6-9-2-9-6-9z', '#F7F3EE') +
        `<circle cx="18" cy="16" r="1.2" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="22" cy="16" r="1.2" fill="#3b2a20" stroke="none"/>` +
        fill('M19 20h2l-1 2z', '#F2A03D') +
        hl(16, 13, 1.2)
    ),

    // ---- Food ----
    apple: () => svgWrap(
        fill('M20 12c-7 0-11 5-11 11s5 10 11 10 11-4 11-10-4-11-11-11z', '#E8453C') +
        fill('M18 8c0-3 2-5 4-5-1 2-1 4-1 6z', '#3FBF6F') +
        fill('M20 6c1 1 3 1 4 0 0 2-1 3-2 3s-2-1-2-3z', '#3FBF6F') +
        hl(15, 18, 2.2)
    ),
    pizza: () => svgWrap(
        fill('M20 8L34 32H6z', '#F2B04C') +
        fill('M20 13l8 15H12z', '#E8453C') +
        `<circle cx="20" cy="22" r="1.8" fill="#F7E7C1" stroke="none"/>` +
        `<circle cx="16" cy="26" r="1.6" fill="#F7E7C1" stroke="none"/>` +
        `<circle cx="24" cy="26" r="1.6" fill="#F7E7C1" stroke="none"/>` +
        hl(18, 18, 1.3)
    ),
    donut: () => svgWrap(
        fill('M20 8a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12z', '#E8A98B') +
        fill('M20 9.5a10.5 10.5 0 0 0-4 20.2l1-2.3A8 8 0 0 1 20 12z', '#F26D8C') +
        fill('M20 9.5a10.5 10.5 0 0 1 4 20.2l-1-2.3A8 8 0 0 0 20 12z', '#F26D8C') +
        `<path d="M14 15l2-1 1 2-2 1z" fill="#4FA8F5" stroke="none"/>` +
        `<path d="M25 24l2-1 1 2-2 1z" fill="#3FBF6F" stroke="none"/>` +
        hl(15, 13, 1.2)
    ),
    burger: () => svgWrap(
        fill('M8 14c0-6 5-8 12-8s12 2 12 8z', '#E8A15C') +
        fill('M7 17h26v3H7z', '#3FBF6F') +
        fill('M7 20h26v4H7z', '#8B4B2E') +
        fill('M7 24h26v3H7z', '#F2B04C') +
        fill('M7 27h26c0 3-2 5-5 5H12c-3 0-5-2-5-5z', '#E8A15C') +
        hl(13, 12, 1.3)
    ),

    // ---- Stationery ----
    pencil: () => svgWrap(
        fill('M8 30l3-10 18-18 7 7-18 18z', '#F2B04C') +
        fill('M29 2l7 7-3 3-7-7z', '#E87B8A') +
        fill('M8 30l2-6 4 4z', '#3b2a20') +
        `<line x1="12" y1="26" x2="26" y2="12" stroke="#8B4B2E" stroke-width="1"/>` +
        hl(11, 27, 1)
    ),
    paperclip: () => svgWrap(
        `<path d="M14 9v18a6 6 0 0 0 12 0V11a4 4 0 0 0-8 0v16" fill="none" stroke="#3b2a20" stroke-width="2.6"/>` +
        `<path d="M14 9v18a6 6 0 0 0 12 0V11a4 4 0 0 0-8 0v16" fill="none" stroke="#C8CCD4" stroke-width="2"/>` +
        hl(15, 12, 1.2)
    ),
    scissors: () => svgWrap(
        `<line x1="10" y1="8" x2="30" y2="30" stroke="#B7BEC9" stroke-width="3"/>` +
        `<line x1="30" y1="8" x2="10" y2="30" stroke="#B7BEC9" stroke-width="3"/>` +
        `<circle cx="10" cy="32" r="3" fill="#E8453C"/>` +
        `<circle cx="30" cy="32" r="3" fill="#E8453C"/>` +
        hl(13, 11, 1.1)
    ),
    ruler: () => svgWrap(
        fill('M6 14h28v12H6z', '#F2E3A1') +
        `<line x1="11" y1="14" x2="11" y2="19" stroke="#8B7A3E"/>` +
        `<line x1="16" y1="14" x2="16" y2="21" stroke="#8B7A3E"/>` +
        `<line x1="21" y1="14" x2="21" y2="19" stroke="#8B7A3E"/>` +
        `<line x1="26" y1="14" x2="26" y2="21" stroke="#8B7A3E"/>` +
        hl(9, 16, 1.1)
    ),

    // ---- Sports ----
    soccer: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#F7F3EE"/>` +
        fill('M20 15l4 3-1.5 5h-5L16 18z', '#2E3A4F') +
        fill('M20 7v4l3 2 -3 2 -3-2 3-2z', '#2E3A4F') +
        fill('M8 17l3-2 3 2 -1 4 -3 1z', '#2E3A4F') +
        fill('M32 17l-3-2 -3 2 1 4 3 1z', '#2E3A4F') +
        hl(15, 14, 1.4)
    ),
    basketball: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#E8803D"/>` +
        `<path d="M20 7v26M7 20h26" stroke="#3b2a20" stroke-width="2"/>` +
        `<path d="M11 11a16 16 0 0 1 18 0M11 29a16 16 0 0 0 18 0" fill="none"/>` +
        hl(15, 14, 1.6)
    ),
    tennis: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#D7F24E"/>` +
        `<path d="M11 12c6 4 12 4 18 0M11 28c6-4 12-4 18 0" fill="none"/>` +
        hl(15, 14, 1.6)
    ),
    volleyball: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#F7F3EE"/>` +
        `<path d="M20 7c-4 8-4 18 0 26" fill="none"/>` +
        `<path d="M7 20c8-4 18-4 26 0" fill="none"/>` +
        `<path d="M11 11c3 6 9 12 18 14" fill="none"/>` +
        hl(15, 14, 1.4)
    ),

    // ---- Tools ----
    hammer: () => svgWrap(
        fill('M8 12h20v4H8z', '#B7BEC9') +
        fill('M22 12l6-2 4 4 -4 4 -6-2z', '#8891A0') +
        fill('M17 16h4v20h-4z', '#8B4B2E') +
        hl(11, 13.5, 1.2)
    ),
    wrench: () => svgWrap(
        `<path d="M30 8a7 7 0 0 0-9 9L9 29l3 3 12-12a7 7 0 0 0 9-9l-4 4-3-3z" fill="#B7BEC9"/>` +
        `<circle cx="10.5" cy="30.5" r="2.5" fill="#8891A0"/>` +
        hl(28, 11, 1.3)
    ),
    nut_and_bolt: () => svgWrap(
        fill('M10 15l6-3 6 3v8l-6 3-6-3z', '#B7BEC9') +
        `<circle cx="16" cy="19" r="2.2" fill="#2E3A4F" stroke="none"/>` +
        fill('M22 17h10v4H22z', '#8891A0') +
        fill('M32 17l4-2 4 2v4l-4 2-4-2z', '#8891A0') +
        hl(12, 16, 1.2)
    ),
    gear: () => svgWrap(
        `<path d="M20 8l2 3 4-1 1 4 4 1-1 4 3 2-3 2 1 4-4 1-1 4-4-1-2 3-2-3-4 1-1-4-4-1 1-4-3-2 3-2-1-4 4-1 1-4 4 1z" fill="#B7BEC9"/>` +
        `<circle cx="20" cy="20" r="4" fill="#2E3A4F" stroke="none"/>` +
        hl(16, 16, 1.4)
    ),

    // ---- Music ----
    guitar: () => svgWrap(
        fill('M13 21a7 7 0 1 0 14 0 7 7 0 0 0-14 0z', '#E8803D') +
        fill('M20 16l-2-10h4z', '#8B4B2E') +
        fill('M19 16l-2-6 3-1 3 1-1 6z', '#8B4B2E') +
        `<line x1="20" y1="14" x2="20" y2="26" stroke="#3b2a20" stroke-width="1.2"/>` +
        `<circle cx="20" cy="23" r="2" fill="#3b2a20" stroke="none"/>` +
        hl(15, 19, 1.5)
    ),
    trumpet: () => svgWrap(
        fill('M8 18h14v4H8z', '#F2B04C') +
        fill('M22 16l10-4v16l-10-4z', '#E8A132') +
        fill('M6 17l3-1 0 8 -3-1z', '#B7BEC9') +
        fill('M10 16l2-4 4 0 -2 4z', '#F2B04C') +
        hl(12, 19, 1.2)
    ),
    drum: () => svgWrap(
        `<ellipse cx="20" cy="15" rx="12" ry="4" fill="#F7F3EE"/>` +
        fill('M8 15v12c0 2 5 4 12 4s12-2 12-4V15c0 2-5 4-12 4s-12-2-12-4z', '#E8453C') +
        `<line x1="8" y1="15" x2="8" y2="27" stroke="#3b2a20"/>` +
        `<line x1="32" y1="15" x2="32" y2="27" stroke="#3b2a20"/>` +
        `<line x1="14" y1="15" x2="14" y2="30" stroke="#3b2a20"/>` +
        `<line x1="26" y1="15" x2="26" y2="30" stroke="#3b2a20"/>` +
        hl(14, 14, 1.4)
    ),
    piano: () => svgWrap(
        fill('M6 14h28v14H6z', '#2E3A4F') +
        fill('M7 15h6v12H7z', '#F7F3EE') +
        fill('M14 15h5v12h-5z', '#F7F3EE') +
        fill('M20 15h5v12h-5z', '#F7F3EE') +
        fill('M26 15h7v12h-7z', '#F7F3EE') +
        fill('M11 15h2v7h-2z', '#2E3A4F') +
        fill('M16 15h2v7h-2z', '#2E3A4F') +
        fill('M24 15h2v7h-2z', '#2E3A4F') +
        hl(9, 17, 1)
    ),

    // ---- Kitchen ----
    pan: () => svgWrap(
        fill('M8 18h20v6a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z', '#2E3A4F') +
        fill('M6 18h24v3H6z', '#B7BEC9') +
        fill('M28 18l10-3v4l-10 3z', '#8891A0') +
        fill('M11 20h14v4H11z', '#F2B04C') +
        hl(13, 20, 1.4)
    ),
    cutlery: () => svgWrap(
        fill('M12 8h2v22h-2z', '#B7BEC9') +
        `<circle cx="13" cy="9" r="3" fill="#8891A0"/>` +
        fill('M26 8h2v10l-2 1z', '#B7BEC9') +
        fill('M24 8h2v10l-2 1z', '#8891A0') +
        fill('M28 19h1v11h-1z', '#B7BEC9') +
        hl(13, 13, 1)
    ),
    cup: () => svgWrap(
        fill('M10 12h18v18a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z', '#F7F3EE') +
        fill('M28 16h4a3 3 0 0 1 0 6h-4z', '#F7F3EE') +
        fill('M12 15h14v4H12z', '#8B4B2E') +
        `<path d="M16 8c0-2 2-3 4-3s4 1 4 3" fill="none"/>` +
        hl(14, 20, 1.3)
    ),
    knife: () => svgWrap(
        fill('M12 30l14-22 4 3-12 21z', '#B7BEC9') +
        fill('M12 12l2 2 3-3-2-2z', '#F2B04C') +
        fill('M14 32l6-2 2-4-8 1z', '#8B4B2E') +
        hl(20, 15, 1.2)
    ),

    // ---- Garden ----
    cactus: () => svgWrap(
        fill('M17 8h6v22h-6z', '#3FBF6F') +
        fill('M10 14h5v10h-5z', '#3FBF6F') +
        fill('M10 14h7v3h-7z', '#3FBF6F') +
        fill('M25 18h5v10h-5z', '#3FBF6F') +
        fill('M23 18h7v3h-7z', '#3FBF6F') +
        fill('M14 30h12v4H14z', '#8B4B2E') +
        hl(19, 12, 1.1)
    ),
    sunflower: () => svgWrap(
        `<circle cx="20" cy="16" r="6" fill="#8B4B2E"/>` +
        fill('M20 7l2 4-2 1-2-1z', '#F2B04C') +
        fill('M20 25l2-4-2-1-2 1z', '#F2B04C') +
        fill('M11 16l4 2 1-2-1-2z', '#F2B04C') +
        fill('M29 16l-4 2-1-2 1-2z', '#F2B04C') +
        fill('M20 22v14', '#3FBF6F') +
        `<path d="M20 22v14" stroke="#3FBF6F" stroke-width="2.4"/>` +
        fill('M14 26l6-2v3l-6 2z', '#3FBF6F') +
        hl(18, 14, 1.2)
    ),
    mushroom: () => svgWrap(
        fill('M20 8c-8 0-13 6-13 11h26c0-5-5-11-13-11z', '#E8453C') +
        `<circle cx="14" cy="14" r="2" fill="#F7F3EE" stroke="none"/>` +
        `<circle cx="24" cy="13" r="1.6" fill="#F7F3EE" stroke="none"/>` +
        `<circle cx="27" cy="16" r="1.2" fill="#F7F3EE" stroke="none"/>` +
        fill('M15 19h10v11a5 5 0 0 1-10 0z', '#F7F3EE') +
        hl(13, 12, 1.4)
    ),
    pine: () => svgWrap(
        fill('M20 6l8 12h-4l6 9h-8v5h-4v-5h-8l6-9h-4z', '#2FA35A') +
        fill('M19 32h2v4h-2z', '#8B4B2E') +
        hl(17, 13, 1.1)
    ),
};

function encodeSvg(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const URI_CACHE = new Map();

// Returns the data:image/svg+xml URL for a known item id, else null.
function getItemArtDataUri(itemId) {
    if (!itemId || !Object.prototype.hasOwnProperty.call(BUILDERS, itemId)) return null;
    if (!URI_CACHE.has(itemId)) URI_CACHE.set(itemId, encodeSvg(BUILDERS[itemId]()));
    return URI_CACHE.get(itemId);
}

// Applies the vector illustration to an element while keeping the text
// (emoji/label) as the accessible fallback. Unknown/null clears stale art
// so reused DOM slots never inherit a previous identity's drawing.
function applyItemArt(element, itemId) {
    if (!element || !element.style || !element.classList) return;
    if (typeof element.style.setProperty !== 'function' ||
        typeof element.style.removeProperty !== 'function' ||
        typeof element.classList.add !== 'function' ||
        typeof element.classList.remove !== 'function') {
        return;
    }
    const uri = getItemArtDataUri(itemId);
    if (uri) {
        element.classList.add('item-art');
        element.style.setProperty('--item-art', `url("${uri}")`);
    } else {
        element.classList.remove('item-art');
        element.style.removeProperty('--item-art');
    }
}


// --- src/ui/AudioManager.js ---
/**
 * AudioManager.js
 * Hệ thống âm thanh tổng hợp 100% bằng Web Audio API thuần (Zero external files).
 * Presentation layer only - no game state, callbacks, input or timers here.
 * Reference feedback palette recreates the Sort&Ship feel.
 *
 * Reference sound mappings:
 *   tap            -> 900Hz square .06s gain .08
 *   swap           -> 220->140 triangle .09s .2 (drop)  [+ tiny noise optional]
 *   reject         -> 200->150 saw .14s .12
 *   wrap           -> 320->1000 sine .16s .25 + 1300 triangle .08s .1 delayed .12
 *   deliver/combo  -> [523,659,784,1046] triangle .28s spaced .08 (combo pitch scales, max 6)
 *   win            -> [523,659,784,1046,784,1046,1318] triangle .3s spaced .11
 *   lose           -> 420->140 saw .5s .18 + 300->90 triangle .6s .14 at .1
 *   star           -> 1568 sine .3s .2
 * No autoplay BGM. ctx / sfxGain kept safe.
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

    /**
     * Tap / pickup: click tone 900Hz square .06s gain .08 (reference)
     */
    tap() {
        this.blip(900, 0.06, 'square', 0.08);
    }

    /**
     * Swap / drop: 220->140 triangle .09s .2 (reference) + tiny noise sparkle
     */
    swap() {
        this.blip(220, 0.09, 'triangle', 0.2, 0, 140);
        this.blip(1500, 0.02, 'square', 0.02, 0.01);
    }

    /**
     * Reject: 200->150 saw .14s .12 (reference)
     */
    reject() {
        this.blip(200, 0.14, 'sawtooth', 0.12, 0, 150);
    }

    /**
     * Wrap: 320->1000 sine .16s .25 + 1300 triangle .08s .1 delayed .12 (reference)
     */
    wrap() {
        this.blip(320, 0.16, 'sine', 0.25, 0, 1000);
        this.blip(1300, 0.08, 'triangle', 0.1, 0.12);
    }

    /**
     * Deliver / order done: [523,659,784,1046] triangle .28s spaced .08 (reference)
     */
    deliver() {
        const notes = [523, 659, 784, 1046];
        notes.forEach((f, i) => {
            this.blip(f, 0.28, 'triangle', 0.18, i * 0.08);
        });
    }

    /**
     * Tiếng băng chuyền cơ khí chạy đưa thùng hàng trượt lên (presentation)
     */
    conveyorRoll() {
        this.blip(160, 0.75, 'triangle', 0.05, 0, 120);
        this.blip(220, 0.60, 'sawtooth', 0.02, 0.04, 180);
    }

    /**
     * Combo: deliver order-done chord with slight pitch scale, max 6 (reference acceptable)
     */
    combo(step = 1) {
        const k = Math.min(Math.max(1, step), 6);
        const scale = 1 + (k - 1) * 0.06;
        const base = [523, 659, 784, 1046];
        base.forEach((f, i) => {
            this.blip(f * scale, 0.28, 'triangle', 0.18, i * 0.08);
        });
    }

    /**
     * Star: 1568 sine .3s .2 (reference)
     */
    star(idx = 0) {
        const delay = (idx || 0) * 0.12;
        this.blip(1568, 0.3, 'sine', 0.2, delay);
    }

    /**
     * Win: [523,659,784,1046,784,1046,1318] triangle .3s spaced .11 (reference)
     */
    win() {
        const seq = [523, 659, 784, 1046, 784, 1046, 1318];
        seq.forEach((f, i) => {
            this.blip(f, 0.3, 'triangle', 0.18, i * 0.11);
        });
    }

    /**
     * Lose: 420->140 saw .5s .18 + 300->90 triangle .6s .14 at .1 (reference)
     */
    lose() {
        this.blip(420, 0.5, 'sawtooth', 0.18, 0, 140);
        this.blip(300, 0.6, 'triangle', 0.14, 0.1, 90);
    }
}


// --- src/ui/VFXManager.js ---
/**
 * VFXManager.js
 * Presentation-only visual feedback for the Sort&Ship feel.
 * Warm reference palette: #ffd15c / #ff8a3d / #fffdf7 / #4fae5a / #e4574b
 * No neon rings/glow, no mechanical emoji ladder, no fabricated score/coin.
 * Effects only self-remove nodes. No game callbacks/state/input/timers.
 */

class VFXManager {
    constructor() {
        this.container = document.getElementById('play-area') || document.body;
        this.gameContainer = document.getElementById('game-container') || document.body;
        this.PALETTE = ['#ffd15c', '#ff8a3d', '#fffdf7', '#4fae5a', '#e4574b'];
    }

    _reducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (_) {
            return false;
        }
    }

    /**
     * Bảng bậc thang Combo (Combo Ladder)
     * Warm reference palette, no neon glow, no emoji tags.
     */
    static get COMBO_TIERS() {
        return [
            { at: 1, scale: 1.00, color: '#fffdf7' },
            { at: 2, scale: 1.14, color: '#ffd15c' },
            { at: 3, scale: 1.30, color: '#ff8a3d' },
            { at: 4, scale: 1.48, color: '#4fae5a' },
            { at: 5, scale: 1.68, color: '#e4574b' },
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
     * Chữ khen thưởng bay lên (outlined brown/orange floating text).
     * No score/coin fabricated, no emoji tier tags appended.
     */
    praise(target, text, combo = 1) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const n = Math.max(1, combo || 1);
        const tier = this.getTier(n);

        const el = document.createElement('div');
        el.className = 'factory-praise';
        el.textContent = text || '';

        el.style.setProperty('--pz', tier.scale);
        el.style.setProperty('--pc', tier.color);

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;

        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;

        if (this._reducedMotion()) {
            el.style.animation = 'none';
            el.style.opacity = '1';
        }

        this.gameContainer.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    /**
     * Round paper particle burst (8-14 particles) from actual target.
     * Soft/simple thin ring only - no neon glow ring.
     * Uses custom --dx/--dy props, sizes 3-6px, bounded count, cleanup 750ms.
     */
    burst(target, color = '#ffd15c', count = 10) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;
        const radius = Math.max(22, Math.min(rect.width, rect.height) * 0.45);

        const reduced = this._reducedMotion();

        // Soft simple thin ring (not flashy / not neon glow)
        if (!reduced) {
            const ring = document.createElement('div');
            ring.className = 'vfx-ring';
            ring.style.left = `${cx}px`;
            ring.style.top = `${cy}px`;
            ring.style.width = `${radius}px`;
            ring.style.height = `${radius}px`;
            ring.style.border = '2px solid #ffd15c';
            ring.style.opacity = '0.5';
            this.gameContainer.appendChild(ring);
            setTimeout(() => ring.remove(), 750);
        }

        // Bounded round paper particles (8-14)
        const raw = Math.round(count || 10);
        const N = Math.max(8, Math.min(14, raw));
        const palette = (color && this.PALETTE.includes(color)) ? [color] : this.PALETTE;

        for (let k = 0; k < N; k++) {
            const angle = (Math.PI * 2 * k) / N + (Math.random() * 0.4 - 0.2);
            const dist = radius * (1.2 + Math.random() * 0.9);
            const dx = (Math.cos(angle) * dist).toFixed(1);
            const dy = (Math.sin(angle) * dist).toFixed(1);
            const size = (3 + Math.random() * 3).toFixed(1);

            const spark = document.createElement('div');
            spark.className = 'vfx-spark';
            spark.style.left = `${cx}px`;
            spark.style.top = `${cy}px`;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.borderRadius = '50%';
            spark.style.backgroundColor = palette[k % palette.length];
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);

            if (reduced) {
                spark.style.animation = 'none';
                spark.style.opacity = '0';
            } else {
                spark.style.animationDelay = `${(Math.random() * 0.05).toFixed(2)}s`;
            }

            this.gameContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 750);
        }
    }

    /**
     * Hiệu ứng nảy đàn hồi (Bump) ~ .45s, respects prefers-reduced-motion.
     */
    bump(elOrId) {
        const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) return;
        el.classList.remove('bump');
        void el.offsetWidth; // Force reflow
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 450);
    }

    /**
     * Warm paper confetti (36 rectangles), safe cleanup unchanged.
     */
    confetti(container = null) {
        const parent = container || this.gameContainer || document.body;
        const colors = ['#ffd15c', '#ff8a3d', '#fffdf7', '#4fae5a', '#e4574b'];
        const COUNT = 36;
        const reduced = this._reducedMotion();

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

            if (reduced) {
                conf.style.animation = 'none';
                conf.style.opacity = '0';
            }

            parent.appendChild(conf);
            setTimeout(() => conf.remove(), (duration + delay) * 1000 + 100);
        }
    }
}


// --- src/ui/BoxRenderer.js ---

class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart, onItemDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;
        this.onItemDragStart = onItemDragStart;

        this._fitRows = null;
        this._fitChip = false;
        this._builtCols = 0;
        this._stacks = [];
        this._peekSlots = [];

        if (typeof ResizeObserver !== 'undefined' && this.container && this.container.parentElement) {
            new ResizeObserver(() => this._fitBoxHeight()).observe(this.container.parentElement);
        }

        // Phase 5 §5.3: Event delegation gắn 1 lần trên container
        if (this.container) {
            this.container.addEventListener('click', (e) => {
                if (document.body.classList.contains('is-dragging') || document.body.classList.contains('is-item-dragging')) return;
                const slot = e.target.closest('.slot');
                const boxEl = e.target.closest('.box:not(.peek-box)');
                if (!boxEl) return;
                const boxId = boxEl.dataset.boxId;
                if (slot) {
                    const i = Number(slot.dataset.slotIndex);
                    this.onSlotTap(boxId, slot.classList.contains('placeholder') ? null : i);
                } else {
                    this.onSlotTap(boxId, null);
                }
            });

            this.container.addEventListener('pointerdown', (e) => {
                const boxEl = e.target.closest('.box:not(.peek-box)');
                if (!boxEl) return;
                const boxId = boxEl.dataset.boxId;

                // 1. Keo Thung da wrapped (che do drag to tray)
                if (boxEl.classList.contains('wrapped')) {
                    if (this.onDragStart) {
                        this.onDragStart(boxId, e);
                    }
                    return;
                }

                // 2. Keo Tha tung mon item trong o slot
                const slot = e.target.closest('.slot');
                if (slot && !slot.classList.contains('placeholder')) {
                    const slotIndex = Number(slot.dataset.slotIndex);
                    if (this.onItemDragStart) {
                        this.onItemDragStart(boxId, slotIndex, slot, e);
                    }
                }
            });
        }
    }

    reset() {
        if (this.container) this.container.innerHTML = '';
        this._builtCols = 0;
        this._stacks = [];
        this._peekSlots = [];
    }

    /**
     * Dựng khung cột (băng tải, thanh nhôm, đầu nạp, đáy peeking).
     */
    buildColumns(colCount, visibleRows) {
        if (this._builtCols === colCount) return;
        this.container.innerHTML = '';
        this._stacks = [];
        this._peekSlots = [];

        this.container.style.setProperty('--rows', visibleRows);

        for (let c = 0; c < colCount; c++) {
            const colEl = document.createElement('div');
            colEl.className = 'box-column';
            colEl.dataset.colIndex = c;
            colEl.style.setProperty('--rows', visibleRows);

            const trackEl = document.createElement('div');
            trackEl.className = 'conveyor-track';
            trackEl.style.setProperty('--rows', visibleRows);

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

            const peekSlot = document.createElement('div');
            peekSlot.className = 'conveyor-bottom-peek';

            const bottomTerminal = document.createElement('div');
            bottomTerminal.className = 'conveyor-bottom-terminal';

            trackEl.appendChild(beltSurface);
            trackEl.appendChild(beamLeft);
            trackEl.appendChild(beamRight);
            trackEl.appendChild(entryEl);
            trackEl.appendChild(boxStack);
            trackEl.appendChild(peekSlot);
            trackEl.appendChild(bottomTerminal);

            colEl.appendChild(trackEl);
            this.container.appendChild(colEl);
            this._stacks.push(boxStack);
            this._peekSlots.push(peekSlot);
        }

        this._builtCols = colCount;
    }

    /**
     * Vẽ lại Thùng tăng dần: không xoá khung, chỉ cập nhật Thùng và Thùng peek ở đáy.
     */
    render(columns, selectedSource = null, validTargetIds = [], hiddenCounts = [], visibleRows = 5, peekingBoxes = []) {
        if (columns.length && !Array.isArray(columns[0])) columns = [columns];
        this.buildColumns(columns.length, visibleRows);
        this._fitBoxHeight(visibleRows, hiddenCounts.some(n => n > 0));

        columns.forEach((boxes, c) => {
            if (this._stacks[c]) {
                this._syncStack(this._stacks[c], boxes, selectedSource, validTargetIds);
                this._syncHiddenChip(c, hiddenCounts[c] || 0);
                this._syncPeekBox(c, peekingBoxes ? peekingBoxes[c] : null);
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
        el.classList.toggle('valid-target', !box.isWrapped && validTargetIds.includes(box.id));
        el.classList.toggle('selected', !box.isWrapped && !!selectedSource && selectedSource.boxId === box.id);
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
            applyItemArt(logoEl.querySelector('.box-logo-icon'), itemType);
        }

        const slots = el.querySelectorAll('.slot');
        for (let i = 0; i < 3; i++) {
            const item = box.slots ? box.slots[i] : (i < box.items.length ? box.items[i] : null);
            const has = item !== null && item !== undefined;
            const text = has ? getItemEmoji(item) : '—';
            if (slots[i].textContent !== text) {
                slots[i].textContent = text;
            }
            slots[i].classList.toggle('placeholder', !has);
            slots[i].dataset.slotIndex = i;
            slots[i].dataset.hasItem = has ? 'true' : 'false';
            applyItemArt(slots[i], has ? item : null);
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
            chip.title = `Còn ${hidden} Thùng đang chờ bên dưới cột này`;
        } else if (chip) {
            chip.remove();
        }
    }

    triggerRollAnimation(colIndex) {
        const cls = 'rolling-up';
        if (colIndex !== undefined && colIndex !== null) {
            const belt = this.container.querySelector(`.conveyor-cleat-belt[data-col-index="${colIndex}"]`);
            if (belt) {
                belt.classList.remove(cls, 'rolling-down');
                void belt.offsetWidth;
                belt.classList.add(cls);
                setTimeout(() => belt.classList.remove(cls), 2450);
            }
        } else {
            const belts = this.container.querySelectorAll('.conveyor-cleat-belt');
            belts.forEach(belt => {
                belt.classList.remove(cls, 'rolling-down');
                void belt.offsetWidth;
                belt.classList.add(cls);
                setTimeout(() => belt.classList.remove(cls), 2450);
            });
        }
    }

    _syncPeekBox(colIndex, box) {
        const slot = this._peekSlots[colIndex];
        if (!slot) return;

        if (!box) {
            slot.innerHTML = '';
            slot.dataset.boxId = '';
            return;
        }

        let peekBoxEl = slot.querySelector('.box.peek-box');
        if (!peekBoxEl || peekBoxEl.dataset.peekBoxId !== String(box.id)) {
            slot.innerHTML = '';
            peekBoxEl = this._createBox(box);
            peekBoxEl.classList.add('peek-box');
            peekBoxEl.dataset.peekBoxId = String(box.id);
            peekBoxEl.removeAttribute('data-box-id'); // Không thể click chọn hay kéo thả
            slot.appendChild(peekBoxEl);
        }
        this._updateBox(peekBoxEl, box, null, []);
    }

    _fitBoxHeight(visibleRows, hasHiddenChip) {
        if (Number.isFinite(visibleRows)) this._fitRows = visibleRows;
        if (hasHiddenChip !== undefined) this._fitChip = hasHiddenChip;
        const rows = this._fitRows || 4;
        const area = this.container.parentElement;
        if (!area || !Number.isFinite(rows)) return;

        const avail = area.clientHeight;
        if (avail < 120) return;

        const cs = getComputedStyle(this.container);
        const gap = parseFloat(cs.columnGap || cs.gap) || 8;

        const colW = this.container.firstElementChild
            ? this.container.firstElementChild.getBoundingClientRect().width
            : this.container.clientWidth / (this._builtCols || 3);
        const slotW = Math.max(18, (colW - 4 /*border*/ - 8 /*padding*/ - 8 /*2x gap*/) / 3);
        this.container.style.setProperty('--slot-size', `${slotW.toFixed(1)}px`);

        const peekH = 34;
        const room = avail - 16 - peekH - (rows - 1) * gap;
        const h = Math.max(50, Math.floor(room / rows));

        // Tỉ lệ hộp 3D cân đối, chiều cao thoải mái không bị ép dẹp
        // Reference-UI-only cap: keep cartons within a short wood-shelf band (~50-64px).
        const capped = Math.min(h, Math.round(slotW * 1.45), 64);
        this.container.style.setProperty('--box-h', `${Math.max(50, capped)}px`);
        this.container.style.setProperty('--stack-gap', `${gap}px`);
        this.container.style.setProperty('--peek-h', `${peekH}px`);
        this.container.style.setProperty('--rows', `${rows}`);
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
        fly.classList.toggle('item-art', srcSlot.classList.contains('item-art'));
        fly.style.setProperty('--item-art', srcSlot.style.getPropertyValue('--item-art'));
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
        this.speedMultiplier = 1;
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
        this._ro = new ResizeObserver(() => { this.geom = this.readBeltGeometry(); this._paintTrack(); });
        this._ro.observe(this.container);

        this.running = false;
    }

    reset() {
        this.speedMultiplier = 1;
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
    isInDeliveryZone(trayObj, slotRef, queueLength) {
        const g = this.geom;
        const pt = this.getTrackPoint(trayObj.currentTheta);
        if (Math.abs(pt.y - g.frontY) >= 22) return false;   // phai o nhanh chay truoc

        const slotEl = (slotRef && typeof slotRef === 'object' && slotRef.nodeType)
            ? slotRef
            : document.querySelectorAll('.queue-slot')[slotRef];
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

        // Chieu cao Khay phai chua duoc: 2 dai bang tai + mot khoang LONG VONG nhin
        // thay duoc. Khong con "lay toi da co the" nhu truoc — neu lay toi da thi hai
        // dai cham nhau, vong chay bien thanh mot khoi dac va mat het chat conveyor.
        //   beltH >= 2 x (trayH + BAND_PAD) + CORE_MIN
        const BAND_PAD = 8;   // le dai bang tai moi ben ngoai Khay
        const CORE_MIN = 16;  // long vong toi thieu, de con doc ra la mot VONG
        let trayH = Math.max(34, Math.min(70,
            Math.floor((beltH - CORE_MIN) / 2) - BAND_PAD));
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

        // Ban kinh goc = hy, tuc HAI DAU BO TRON HOAN TOAN (dang stadium/oval).
        //
        // Khong phai chon cho dep: mot `stroke` day bandW ve tren duong bo goc se TU
        // CAT o goc khi bandW > 2 x ban kinh — cac go chan bung ra thanh hinh nan quat.
        // Da thay dung loi do voi radius 16 / band 56. Lay radius = hy thi:
        //   - ban kinh trong = hy - bandW/2 > 0  -> khong bao gio tu cat;
        //   - va duong chay thanh dung dang bang tai oval: hai doan thang + hai nua
        //     duong tron, thay vi mot hinh chu nhat co goc hoi tron.
        const radius = hy;

        // Be rong dai bang tai: phu tron Khay, nhung khong duoc de hai dai cham nhau
        // (2*hy la khoang cach giua tim hai nhanh).
        const bandW = Math.max(20, Math.min(trayH + BAND_PAD * 2, 2 * hy - CORE_MIN));

        return {
            cx, cy, beltW, beltH, hx, hy, r: radius, trayW, trayH, bandW,
            frontY: cy - hy,                        // nhanh chay TRUOC (Khay di phai->trai)
        };
    }

    /** Chu vi duong chay. Dung chung cho ca Khay lan go chan tren dai bang tai. */
    _trackPerimeter() {
        const g = this.geom;
        const Lx = Math.max(0, 2 * (g.hx - g.r));
        const Ly = Math.max(0, 2 * (g.hy - g.r));
        return 2 * Lx + 2 * Ly + 4 * (Math.PI / 2) * g.r;
    }

    /**
     * Ve DUONG CHAY: mot hinh chu nhat ngang bo 4 goc, ke DUNG tren quy dao Khay.
     *
     * Ky thuat: mot <rect> bo goc voi `stroke-width` lon chinh la mot dai bang tai
     * khep kin. Go chan la CUNG duong do, ve de len bang `stroke-dasharray` — nho
     * vay go chan luon vuong goc voi huong chay, ke ca tren 4 goc cong (thu ma
     * gradient CSS khong the lam duoc).
     *
     * Toa do lay thang tu geom nen dai bang tai va Khay khong bao gio lech nhau:
     * geom.cy do tu DAY container len, con SVG do tu DINH xuong -> phai lat truc.
     */
    _paintTrack() {
        const svg = document.getElementById('belt-track');
        if (!svg) return;
        const g = this.geom;

        const x = g.cx - g.hx;
        const y = (g.beltH - g.cy) - g.hy;   // lat truc y sang he cua SVG
        const w = 2 * g.hx;
        const h = 2 * g.hy;
        if (w <= 0 || h <= 0) return;

        const half = g.bandW / 2;
        const set = (id, attrs) => {
            const el = document.getElementById(id);
            if (!el) return;
            for (const k in attrs) el.setAttribute(k, attrs[k]);
        };

        // 1. Mat dai cao su
        set('belt-band', { x, y, width: w, height: h, rx: g.r, ry: g.r,
                           'stroke-width': g.bandW });
        // 2. Go chan ngang, chu ky 22px
        set('belt-cleat', { x, y, width: w, height: h, rx: g.r, ry: g.r,
                            'stroke-width': g.bandW,
                            'stroke-dasharray': '2.5 19.5' });
        // 3. Hai thanh ray nhom vien trong / vien ngoai dai
        set('belt-rail-o', { x: x - half, y: y - half, width: w + g.bandW, height: h + g.bandW,
                             rx: g.r + half, ry: g.r + half, 'stroke-width': 1.5 });
        const ih = Math.max(0, h - g.bandW), iw = Math.max(0, w - g.bandW);
        set('belt-rail-i', { x: x + half, y: y + half, width: iw, height: ih,
                             rx: Math.max(1, g.r - half), ry: Math.max(1, g.r - half),
                             'stroke-width': 1.5 });
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
        this._paintTrack();

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
                    applyItemArt(illustEl, tray.targetItemId || null);
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
        
        let speed = this.baseSpeed * this.speedMultiplier;
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
        // Go chan tren dai bang tai troi cung mot quang duong voi Khay: cung `offset`,
        // cung chu vi. Neu tinh rieng thi dai bang tai va Khay se chay lech toc do —
        // mat mat cam giac Khay DUOC dai bang tai cho di.
        const cleat = document.getElementById('belt-cleat');
        if (cleat && this.geom) {
            const P = this._trackPerimeter();
            const d = (((-this.offset) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * P;
            cleat.setAttribute('stroke-dashoffset', (-d).toFixed(1));
        }

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

    render(queue = [], capacity = this.maxSlots) {
        if (!this.slotsContainer) return;

        this.maxSlots = capacity;
        // Capacity belongs to the engine and resets with each level.
        while (this.slotsContainer.children && this.slotsContainer.children.length < this.maxSlots) {
            const slot = document.createElement('div');
            slot.className = 'queue-slot';
            slot.dataset.slot = this.slotsContainer.children.length;
            this.slotsContainer.appendChild(slot);
        }
        while (this.slotsContainer.children && this.slotsContainer.children.length > this.maxSlots) this.slotsContainer.lastElementChild.remove();
        const count = queue.length;
        if (this.counterEl) {
            this.counterEl.textContent = `${count}/${this.maxSlots}`;
            this.counterEl.classList.toggle('warning', count === this.maxSlots - 1);
            this.counterEl.classList.toggle('danger', count >= this.maxSlots);
        }

        if (this.areaEl) {
            this.areaEl.classList.toggle('warning', count === this.maxSlots - 1);
            this.areaEl.classList.toggle('danger', count >= this.maxSlots);
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
                // Slots are reused when delivery shifts the queue left. Clear the
                // previous box's flight state before displaying its replacement.
                if (boxEl.dataset.boxId !== String(box.id)) {
                    boxEl.style.opacity = '';
                    boxEl.dataset.boxId = String(box.id);
                }
                boxEl.querySelector('.queue-box-icon').textContent = displayEmoji;
                applyItemArt(boxEl.querySelector('.queue-box-icon'), itemType);
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
        applyItemArt(ghost.querySelector?.('.queue-box-icon'), itemType);
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
        applyItemArt(ghost.querySelector?.('.queue-box-icon'), itemType);
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
     * Kiem tra xem thao tac tap/drag cua nguoi choi co dung voi muc tieu cua buoc hien tai khong.
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

    isAllowedDragStart(boxId) {
        if (!this.active || !this.currentStep) return true;
        const id = this._parseId(boxId);
        if (this.currentStep === 'STEP_1_PICK_PENGUIN' || this.currentStep === 'STEP_2_PLACE_PENGUIN') {
            return id === 1;
        }
        if (this.currentStep === 'STEP_4_PICK_BEAR' || this.currentStep === 'STEP_5_PLACE_BEAR') {
            return id === 3;
        }
        return false;
    }

    isAllowedDrop(sourceBoxId, targetBoxId) {
        if (!this.active || !this.currentStep) return true;
        const srcId = this._parseId(sourceBoxId);
        const tgtId = this._parseId(targetBoxId);

        if (this.currentStep === 'STEP_1_PICK_PENGUIN' || this.currentStep === 'STEP_2_PLACE_PENGUIN') {
            return srcId === 1 && tgtId === 0;
        }
        if (this.currentStep === 'STEP_4_PICK_BEAR' || this.currentStep === 'STEP_5_PLACE_BEAR') {
            return srcId === 3 && tgtId === 2;
        }
        return false;
    }

    onItemDropped(sourceBoxId, targetBoxId) {
        if (!this.active) return;
        this.hideHighlight();
        if (this.handPointer) this.handPointer.classList.add('hidden');
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
                    badge: 'BƯỚC 1 / 4 • KÉO THẢ MÓN ĐỒ',
                    text: '<b>Kéo</b> chú <b>Chim cánh cụt 🐧</b> thả vào <b>Thùng chim cánh cụt 🐧</b> bên cạnh!',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Kéo thả vào thùng 🐧',
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
                    text: 'Thả vào <b>Thùng chim cánh cụt 🐧</b> để gom đủ 3 món!',
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
                    text: 'Rất tốt! Giờ hãy <b>kéo</b> chú <b>Gấu bông 🧸</b> thả vào <b>Thùng gấu bông 🧸</b> phía trên!',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Kéo gấu bông 🧸',
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
                    text: 'Thả vào <b>Thùng gấu bông 🧸</b> phía trên để hoàn tất đóng gói!',
                    handOffset: { x: 0, y: 65 },
                    handDirection: 'up',
                    handText: 'Thả vào đây!',
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
            this.handleDragStart.bind(this),
            this.handleItemDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.trayRenderer.onTick = (now) => {
            this.updateConveyorSpeed();
            this.updateLevelClock(now);
            this.checkQueuePickup(now);
        };
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        this.queueRenderer = new QueueRenderer();
        this.tutorialManager = new TutorialManager(this, this.engine);
        
        this.removeTrayMode = false;
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.btnHeaderLevel = document.getElementById('btn-header-level');
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
        this.timerDisplay = document.getElementById('timer-display');
        this.timerPill = document.getElementById('stat-timer');
        this.tierDisplay = document.getElementById('tier-display');
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
        this.itemDragState = {
            isDragging: false,
            sourceBoxId: null,
            sourceSlotIndex: null,
            itemId: null,
            targetBoxId: null,
            targetSlotIndex: null,
            pointerId: null,
            pointerTarget: null,
            sourceSlotEl: null,
            ghostEl: null,
            startX: 0,
            startY: 0
        };
        this._resetAnimationState();
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
        document.querySelectorAll('[data-booster]').forEach(button => {
            button.addEventListener('click', () => this.useBooster(button.dataset.booster));
        });
        const selectRemoval = event => {
            if (!this.removeTrayMode) return;
            const element = event.target.closest('.tray[data-tray-id]');
            if (!element || (event.type === 'keydown' && !['Enter', ' '].includes(event.key))) return;
            event.preventDefault();
            this.updateLevelClock();
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => String(t.id) === element.dataset.trayId);
            if (!tray || tray.isFull() || this.boostersBlocked()) return;
            const removed = this.engine.removeTray(tray.id);
            if (removed) this.removeTrayMode = false;
            this.setBoosterStatus(removed ? 'Đã xóa khay và đúng 3 vật tương ứng.' : (this.engine.lastBoosterError || 'Chưa thể xóa an toàn khay này. Hãy thử khay khác.'));
            this.updateRender();
            this.renderBoosters();
        };
        document.getElementById('trays-container')?.addEventListener('click', selectRemoval);
        document.getElementById('trays-container')?.addEventListener('keydown', selectRemoval);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this.removeTrayMode) {
                this.removeTrayMode = false;
                this.setBoosterStatus('Đã hủy chọn khay.');
                this.renderBoosters();
            }
        });
        document.addEventListener('visibilitychange', () => {
            this._clockLastTime = performance.now();
            this._clockWasPaused = true;
            this.renderTimer();
        });
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

        // Global pointer events for dragging (wrapped boxes to trays & items between boxes)
        document.addEventListener('pointermove', (e) => {
            this.handleDragMove(e);
            this.handleItemDragMove(e);
        });
        document.addEventListener('pointerup', (e) => {
            this.handleDragEnd(e);
            this.handleItemDragEnd(e);
        });
        document.addEventListener('pointercancel', (e) => {
            this.handleDragEnd(e);
            this.handleItemDragEnd(e);
        });
    }
    
    updateConveyorSpeed() {
        const boardEmpty = !this.engine.boxes.some(box => !box.isEmpty());
        this.trayRenderer.speedMultiplier = this.engine.gameState === 'PLAYING' && boardEmpty ? 1.5 : 1;
    }

    isClockPaused() {
        return document.hidden || ['overlay-loading', 'overlay-help', 'overlay-level-select']
            .some(id => {
                const el = document.getElementById(id);
                return el && !el.classList.contains('hidden');
            });
    }

    updateLevelClock(now = performance.now()) {
        const paused = this.isClockPaused();
        if (!paused && !this._clockWasPaused && this._clockObservedStarted &&
            Number.isFinite(this._clockLastTime)) {
            this.engine.advanceClock(Math.max(0, now - this._clockLastTime) / 1000);
        }
        this._clockLastTime = now;
        this._clockWasPaused = paused;
        this._clockObservedStarted = this.engine.clockStarted;
        this.renderTimer();
        this.renderBoosters();
    }

    renderTimer() {
        if (!this.timerDisplay || !this.timerPill) return;
        const remaining = this.engine.timeRemainingSeconds;
        const timed = Number.isFinite(remaining);
        const secs = Math.max(0, Math.ceil(timed ? remaining : 0));
        this.timerDisplay.textContent = timed
            ? `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`
            : '∞';
        this.timerPill.classList.toggle('timer-frozen', this.engine.freezeRemainingSeconds > 0);
        this.timerPill.classList.toggle('timer-low', timed && remaining <= this.engine.timeLimitSeconds * 0.2);
        this.timerPill.classList.toggle('timer-critical', timed && remaining <= 10);
        const status = this.engine.gameState === 'WON' ? 'Hoàn thành'
            : this.engine.gameState === 'LOST' ? 'Đã kết thúc'
            : !this.engine.clockStarted ? 'Nhặt vật đầu tiên để bắt đầu'
            : this.isClockPaused() ? 'Tạm dừng'
            : !this.engine.hasPlayerWorkRemaining() ? 'Đang giao hàng — thời gian tạm dừng'
            : this.engine.freezeRemainingSeconds > 0 ? `Đóng băng ${Math.ceil(this.engine.freezeRemainingSeconds)}s`
            : 'Thời gian còn lại';
        const label = timed ? `${status}: ${this.timerDisplay.textContent}` : `${status} — không giới hạn thời gian`;
        this.timerPill.title = label;
        this.timerPill.setAttribute('aria-label', label);
    }

    setBoosterStatus(message) {
        const status = document.getElementById('booster-status');
        if (status) status.textContent = message;
    }

    boostersBlocked() {
        return this.engine.gameState !== 'PLAYING' || this.isClockPaused() || this.tutorialManager?.active ||
            this.itemDragState?.isDragging || this.dragState?.isDragging || this.engine.draggedBoxId !== null ||
            this._busyBoxes?.size > 0 || this._pendingQueueBoxes?.length > 0 ||
            this._queueFlightActive || this._deliveryAnimating || this.engine.hasPendingTrayExits();
    }

    useBooster(kind) {
        if (kind === 'remove' && this.removeTrayMode) {
            this.removeTrayMode = false;
            this.setBoosterStatus('Đã hủy chọn khay.');
            this.renderBoosters();
            return;
        }
        this.updateLevelClock();
        if (this.boostersBlocked()) return;
        this.engine.deselectSource();
        if (kind === 'remove') {
            this.removeTrayMode = true;
            this.setBoosterStatus('Chọn một khay trống trên băng chuyền. Bấm lại hoặc Esc để hủy.');
        } else {
            this.removeTrayMode = false;
            const methods = { freeze: 'freezeTime', shuffle: 'shuffleItems', extra: 'addExtraTray' };
            const success = this.engine[methods[kind]]?.();
            const messages = { freeze: 'Dừng đồng hồ 30 giây; băng chuyền vẫn chạy.',
                shuffle: 'Đã xáo vật trong các thùng đang hiện.', extra: 'Thêm 1 ô hàng chờ đến hết màn.' };
            this.setBoosterStatus(success ? messages[kind] : (this.engine.lastBoosterError || 'Chưa thể dùng booster an toàn ở trạng thái này.'));
            if (success) this.audio.tap();
        }
        this.updateRender();
        this.renderTimer();
        this.renderBoosters();
    }

    renderBoosters() {
        if (!document.querySelectorAll) return;
        const blocked = this.boostersBlocked();
        if (blocked && this.removeTrayMode) {
            this.removeTrayMode = false;
            this.setBoosterStatus('Đã hủy chọn khay.');
        }
        const frozen = this.engine.freezeRemainingSeconds > 0;
        document.querySelectorAll('[data-booster]').forEach(button => {
            const kind = button.dataset.booster;
            button.disabled = blocked || (kind === 'freeze' && (frozen || !Number.isFinite(this.engine.timeRemainingSeconds))) ||
                (kind === 'extra' && this.engine.extraTrayUsed) ||
                (kind === 'remove' && !this.engine.conveyor.getAllActiveTrays().some(t => !t.isFull()));
            button.classList.toggle('active', kind === 'remove' && this.removeTrayMode);
            if (kind === 'remove') button.setAttribute('aria-pressed', String(this.removeTrayMode));
            const detail = button.querySelector('.booster-detail');
            if (detail && kind === 'freeze') detail.textContent = frozen ? `${Math.ceil(this.engine.freezeRemainingSeconds)}s` : '30 giây';
            if (detail && kind === 'extra') detail.textContent = this.engine.extraTrayUsed ? 'Đã thêm' : '+1 ô chờ';
        });
        document.getElementById('trays-container')?.classList.toggle('remove-tray-mode', this.removeTrayMode);
        document.querySelectorAll('.tray[data-tray-id]').forEach(element => {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => String(t.id) === element.dataset.trayId);
            const selectable = this.removeTrayMode && tray && !tray.isFull();
            element.classList.toggle('removable-tray', !!selectable);
            if (selectable) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
                element.setAttribute('aria-label', `Xóa khay ${getItemEmoji(tray.targetItemId)} và 3 vật tương ứng`);
            } else {
                element.removeAttribute('role');
                element.removeAttribute('tabindex');
                element.removeAttribute('aria-label');
            }
        });
    }

    showWinCelebration() {
        const elapsedSec = Math.max(0, Math.floor(this.engine.elapsedPlaySeconds || 0));
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
                this.tutorialManager.skipTutorial();
                this.showWinCelebration();
            } else if (state === 'LOST') {
                this.tutorialManager.skipTutorial();
                this.audio.lose();
                if (this.loseReason) {
                    this.loseReason.textContent = this.engine.loseReason || 'Không còn nước đi hợp lệ. Hãy thử lại màn này.';
                }
                const timeout = this.engine.loseReason?.startsWith('Hết thời gian');
                const title = document.getElementById('lose-title');
                const banner = document.getElementById('lose-banner');
                if (title) title.textContent = timeout ? 'HẾT THỜI GIAN!' : 'HẾT CHỖ ĐIỀU PHỐI!';
                if (banner) banner.textContent = timeout ? '⏱ CA LÀM ĐÃ KẾT THÚC ⏱' : '⚠️ DÂY CHUYỀN QUÁ TẢI ⚠️';
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
            this.renderTimer();
        };
        
        this.engine.onQueueUpdated = (queue) => {
            this.queueRenderer.render(queue, this.engine.maxQueueSize);
            this.vfx.bump('queue-counter');
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayDelivered = (trayId, box) => {
            const epoch = this._animationEpoch;
            if (this.tutorialManager) this.tutorialManager.onTrayDelivered(trayId, box);
            this.trayRenderer.animateTrayExit(trayId, () => {
                if (epoch !== this._animationEpoch) return;
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
        this._resetAnimationState();
        // Freeze the previous level before yielding to paint the loading overlay.
        // Its conveyor ticks must not create deliveries using the new epoch.
        this.engine.setGameState('IDLE');
        this._clockLastTime = null;
        this._clockWasPaused = true;
        this._clockObservedStarted = false;
        const levelEpoch = this._animationEpoch;
        this.overlayWin.classList.add('hidden');
        this.overlayLose.classList.add('hidden');
        this.overlayLoading.classList.remove('hidden');
        
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        if (levelEpoch !== this._animationEpoch) return;
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
        const levelData = LevelGenerator.generateLevel({ levelNumber: this.currentLevel });
        
        this.queueRenderer.render([]);
        this.trayRenderer.reset();
        this.engine.startLevel(levelData);
        this._clockLastTime = performance.now();
        const tier = levelData.config?.tier || configForLevelNumber(this.currentLevel).tier;
        if (this.tierDisplay) {
            this.tierDisplay.textContent = ({ tutorial: 'HƯỚNG DẪN', onboarding: 'LÀM QUEN', acclimation: 'LUYỆN TẬP',
                normal: 'NORMAL', hard: 'HARD', superhard: 'SUPER HARD' })[tier] || 'NORMAL';
            this.tierDisplay.dataset.tier = tier;
        }
        this.levelDisplay.textContent = this.currentLevel;
        this._boLuotFlip = true;
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
        this.renderTimer();

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
            this._renderNow();
        });
    }

    _renderNow() {
        const validTargets = this.itemDragState.isDragging
            ? this.engine.getValidTargets(this.itemDragState.sourceBoxId)
            : (this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : []);
        const hiddenCounts = this.engine.columns.map(
            col => Math.max(0, col.length - this.engine.visibleRows));
            
        const peekingBoxes = this.engine.columns.map(col => {
            if (col.length > this.engine.visibleRows) {
                return this.engine.getBox(col[this.engine.visibleRows]);
            }
            return null;
        });

        const grid = document.getElementById('boxes-grid');
        const truoc = new Map();
        if (!this._boLuotFlip && grid) {
            for (const el of grid.querySelectorAll('.box:not(.peek-box)[data-box-id]')) {
                truoc.set(el.dataset.boxId, el.getBoundingClientRect());
            }
        }

        this.boxRenderer.render(
            this.engine.getVisibleBoxes(),
            this.engine.selectedSource,
            validTargets,
            hiddenCounts,
            this.engine.visibleRows,
            peekingBoxes
        );
            
        this._chayFlip(grid, truoc);
        this._boLuotFlip = false;
        
        // Ensure the original box remains hidden if it's currently being dragged
        if (this.dragState.isDragging && this.dragState.boxId) {
            const dragBoxEl = document.querySelector(`.box[data-box-id="${this.dragState.boxId}"]`);
            if (dragBoxEl) dragBoxEl.classList.add('dragging');
        }

        // Ensure slot-dragging class persists on rerender
        if (this.itemDragState.isDragging && this.itemDragState.sourceBoxId !== null) {
            const srcBoxEl = document.querySelector(`.box[data-box-id="${this.itemDragState.sourceBoxId}"]`);
            if (srcBoxEl) {
                const slotEl = srcBoxEl.querySelector(`.slot[data-slot-index="${this.itemDragState.sourceSlotIndex}"]`);
                if (slotEl) slotEl.classList.add('slot-dragging');
            }
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
        
        this.queueRenderer.render(this.engine.getQueue(), this.engine.maxQueueSize);
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
        this.renderBoosters();
        if (this.tutorialManager && this.tutorialManager.active) {
            this.tutorialManager.updatePositions();
        }
    }
    
    _chayFlip(grid, truoc) {
        if (!grid) return;
        const itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (itMotion || this._boLuotFlip) return;

        const THOI_LUONG = 2400;
        const NHIP = 'cubic-bezier(0.25, 1, 0.4, 1)';
        const animatedCols = new Set();

        const cs = getComputedStyle(grid);
        const gap = parseFloat(cs.rowGap || cs.gap) || 8;

        for (const el of grid.querySelectorAll('.box:not(.peek-box)[data-box-id]')) {
            if (el.classList.contains('dragging')) continue;

            const cu = truoc.get(el.dataset.boxId);
            const moi = el.getBoundingClientRect();
            const colEl = el.closest('.box-column');
            const colIndex = colEl && colEl.dataset.colIndex !== undefined ? Number(colEl.dataset.colIndex) : null;

            if (!cu) {
                // Thùng mới từ đáy trượt LÊN vị trí hàng dưới cùng
                const startY = moi.height + gap;
                el.animate(
                    [ { transform: `translateY(${startY}px)`, opacity: 0.72 },
                      { transform: 'none', opacity: 1 } ],
                    { duration: THOI_LUONG, easing: NHIP }
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

            // Băng chuyền đẩy các thùng trượt lên
            if (colIndex !== null && !animatedCols.has(colIndex)) {
                animatedCols.add(colIndex);
                this.boxRenderer.triggerRollAnimation(colIndex);
                this.audio.conveyorRoll();
            }
        }

        // Animate thùng trong ô peek ở đáy trượt lên từ từ
        for (const colIndex of animatedCols) {
            const peekSlot = this.boxRenderer._peekSlots ? this.boxRenderer._peekSlots[colIndex] : null;
            const peekBox = peekSlot ? peekSlot.querySelector('.box.peek-box') : null;
            if (peekBox) {
                const peekRect = peekBox.getBoundingClientRect();
                const startY = peekRect.height + gap;
                peekBox.animate(
                    [ { transform: `translateY(${startY}px)`, opacity: 0.25 },
                      { transform: 'none', opacity: 0.72 } ],
                    { duration: THOI_LUONG, easing: NHIP }
                );
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
        if (this.removeTrayMode) return;
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (this._isBoxBusy(boxId) || (this.engine.selectedSource && this._isBoxBusy(this.engine.selectedSource.boxId))) return;
        
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

            if (this.engine.selectTarget(boxId, itemIndex)) {
                this.audio.swap();
                this._busyBoxes.add(String(sourceId));
                this._busyBoxes.add(String(boxId));
                const epoch = this._animationEpoch;
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    this._finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox, epoch);
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

    // --- Layer 1 Input: Item Drag & Drop ---
    handleItemDragStart(boxId, slotIndex, slotEl, e) {
        if (this.removeTrayMode) return;
        if (this.engine.gameState !== 'PLAYING') return;
        if (this._isBoxBusy(boxId)) return;
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (!this.engine.isAccessible(boxId)) return;

        const box = this.engine.getBox(boxId);
        if (!box || box.isWrapped) return;

        const itemId = box.slots ? box.slots[slotIndex] : null;
        if (!itemId) return;

        // Tutorial check
        if (this.tutorialManager && this.tutorialManager.active) {
            if (this.tutorialManager.isAllowedDragStart && !this.tutorialManager.isAllowedDragStart(boxId)) {
                this.tutorialManager.onDisallowedTap(boxId);
                return;
            }
        }

        if (this.engine.startClock()) this._clockLastTime = performance.now();
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.pointerId !== undefined && slotEl && slotEl.setPointerCapture) {
                try { slotEl.setPointerCapture(e.pointerId); } catch (_) {}
            }
        }

        this.itemDragState.isDragging = true;
        this.itemDragState.sourceBoxId = boxId;
        this.itemDragState.sourceSlotIndex = slotIndex;
        this.itemDragState.itemId = itemId;
        this.itemDragState.targetBoxId = null;
        this.itemDragState.targetSlotIndex = null;
        this.itemDragState.pointerId = e ? e.pointerId : null;
        this.itemDragState.pointerTarget = slotEl;
        this.itemDragState.sourceSlotEl = slotEl;
        this.itemDragState.startX = e ? e.clientX : 0;
        this.itemDragState.startY = e ? e.clientY : 0;

        slotEl.classList.add('slot-dragging');
        document.body.classList.add('is-item-dragging');

        // Create or get ghost
        let ghost = document.getElementById('item-drag-ghost');
        if (!ghost) {
            ghost = document.createElement('div');
            ghost.id = 'item-drag-ghost';
            ghost.className = 'item-drag-ghost';
            document.body.appendChild(ghost);
        }
        ghost.textContent = getItemEmoji(itemId);
        applyItemArt(ghost, itemId);
        ghost.style.display = 'flex';
        ghost.style.transition = 'none';
        ghost.style.left = `${e ? e.clientX : 0}px`;
        ghost.style.top = `${(e ? e.clientY : 0) - 22}px`;
        ghost.style.transform = 'translate(-50%, -50%) scale(1.18)';
        ghost.style.opacity = '1';
        this.itemDragState.ghostEl = ghost;

        this.audio.tap();
        if (navigator.vibrate) navigator.vibrate(10);

        this.updateRender();
    }

    handleItemDragMove(e) {
        if (!this.itemDragState.isDragging) return;
        if (e.preventDefault) e.preventDefault();

        const ghost = this.itemDragState.ghostEl;
        if (ghost) {
            ghost.style.left = `${e.clientX}px`;
            ghost.style.top = `${e.clientY - 22}px`;
        }

        // Hit test: kiem tra ca diem cham va vi tri ghost
        let elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
        let boxEl = elementsUnder.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
        let slotEl = elementsUnder.find(el => el.classList && el.classList.contains('slot'));

        if (!boxEl) {
            const hitUnderGhost = document.elementsFromPoint(e.clientX, e.clientY - 22);
            boxEl = hitUnderGhost.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
            if (!slotEl) slotEl = hitUnderGhost.find(el => el.classList && el.classList.contains('slot'));
        }

        // Clear existing hover highlights
        document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
        document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));

        if (boxEl) {
            const hoverBoxId = boxEl.dataset.boxId;
            const targetBox = this.engine.getBox(hoverBoxId);
            const isSource = String(hoverBoxId) === String(this.itemDragState.sourceBoxId);
            const isValid = !isSource && targetBox && !targetBox.isWrapped && targetBox.canAccept() && this.engine.isAccessible(hoverBoxId);

            if (isValid) {
                boxEl.classList.add('drag-over');
                this.itemDragState.targetBoxId = hoverBoxId;

                if (slotEl && slotEl.closest('.box') === boxEl && slotEl.classList.contains('placeholder')) {
                    slotEl.classList.add('drop-target-active');
                    this.itemDragState.targetSlotIndex = Number(slotEl.dataset.slotIndex);
                } else {
                    this.itemDragState.targetSlotIndex = null;
                }
            } else {
                this.itemDragState.targetBoxId = null;
                this.itemDragState.targetSlotIndex = null;
            }
        } else {
            this.itemDragState.targetBoxId = null;
            this.itemDragState.targetSlotIndex = null;
        }
    }

    handleItemDragEnd(e) {
        if (!this.itemDragState.isDragging) return;

        if (this.itemDragState.pointerId !== null && this.itemDragState.pointerTarget && this.itemDragState.pointerTarget.releasePointerCapture) {
            try { this.itemDragState.pointerTarget.releasePointerCapture(this.itemDragState.pointerId); } catch (_) {}
        }
        this.itemDragState.pointerId = null;
        this.itemDragState.pointerTarget = null;

        document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
        document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));

        const srcBoxId = this.itemDragState.sourceBoxId;
        const srcSlotIndex = this.itemDragState.sourceSlotIndex;
        let targetBoxId = this.itemDragState.targetBoxId;
        let targetSlotIndex = this.itemDragState.targetSlotIndex;
        const ghost = this.itemDragState.ghostEl;
        const srcSlotEl = this.itemDragState.sourceSlotEl;

        // Neu targetBoxId chua co, kiem tra truc tiep tai toa do pointerup
        if (e && (targetBoxId === null || targetBoxId === undefined)) {
            const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
            const boxEl = elementsUnder.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
            const slotEl = elementsUnder.find(el => el.classList && el.classList.contains('slot'));
            if (boxEl) {
                const hoverBoxId = boxEl.dataset.boxId;
                const targetBox = this.engine.getBox(hoverBoxId);
                const isSource = String(hoverBoxId) === String(srcBoxId);
                if (!isSource && targetBox && !targetBox.isWrapped && targetBox.canAccept() && this.engine.isAccessible(hoverBoxId)) {
                    targetBoxId = hoverBoxId;
                    if (slotEl && slotEl.closest('.box') === boxEl && slotEl.classList.contains('placeholder')) {
                        targetSlotIndex = Number(slotEl.dataset.slotIndex);
                    }
                }
            }
        }

        this.itemDragState.isDragging = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.remove('is-item-dragging'));
        });

        // If targetBoxId is valid
        if (targetBoxId !== null && targetBoxId !== srcBoxId && !this._isBoxBusy(targetBoxId) && !this._isBoxBusy(srcBoxId)) {
            // Tutorial check
            if (this.tutorialManager && this.tutorialManager.active) {
                if (this.tutorialManager.isAllowedDrop && !this.tutorialManager.isAllowedDrop(srcBoxId, targetBoxId)) {
                    this.tutorialManager.onDisallowedTap(targetBoxId);
                    this._cancelItemDrag(ghost, srcSlotEl);
                    return;
                }
            }

            const targetBoxEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);
            let targetSlotEl = null;
            if (targetBoxEl) {
                if (targetSlotIndex !== null) {
                    targetSlotEl = targetBoxEl.querySelector(`.slot[data-slot-index="${targetSlotIndex}"]`);
                }
                if (!targetSlotEl || !targetSlotEl.classList.contains('placeholder')) {
                    targetSlotEl = targetBoxEl.querySelector('.slot.placeholder');
                }
            }

            const sourceBoxBefore = this.engine.getBox(srcBoxId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            const success = this.engine.moveItem(srcBoxId, srcSlotIndex, targetBoxId, targetSlotIndex);
            if (success) {
                this.audio.swap();
                this._busyBoxes.add(String(srcBoxId));
                this._busyBoxes.add(String(targetBoxId));
                const epoch = this._animationEpoch;
                if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');

                // Detach this flight from the reusable active-drag ghost.
                if (ghost) ghost.id = '';
                if (ghost && targetSlotEl) {
                    const targetRect = targetSlotEl.getBoundingClientRect();
                    ghost.style.transition = 'all 0.14s cubic-bezier(0.2, 0.9, 0.4, 1)';
                    ghost.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    ghost.style.top = `${targetRect.top + targetRect.height / 2}px`;
                    ghost.style.transform = 'translate(-50%, -50%) scale(1)';
                }

                if (this.tutorialManager && this.tutorialManager.active) {
                    this.tutorialManager.onItemDropped(srcBoxId, targetBoxId);
                }

                setTimeout(() => {
                    if (epoch !== this._animationEpoch) return;
                    if (ghost) ghost.remove();
                    const targetBox = this.engine.getBox(targetBoxId);
                    this._finalizeMoveAfterDrag(srcBoxId, targetBoxId, willEmpty, targetBox, epoch);
                }, 140);
                return;
            }
        }

        // Invalid target -> cancel & snap back
        this._cancelItemDrag(ghost, srcSlotEl);
    }

    _cancelItemDrag(ghost, srcSlotEl) {
        this.audio.reject();
        if (navigator.vibrate) navigator.vibrate(18);

        if (ghost && srcSlotEl) {
            const rect = srcSlotEl.getBoundingClientRect();
            ghost.style.transition = 'all 0.18s cubic-bezier(0.25, 1, 0.5, 1)';
            ghost.style.left = `${rect.left + rect.width / 2}px`;
            ghost.style.top = `${rect.top + rect.height / 2}px`;
            ghost.style.transform = 'translate(-50%, -50%) scale(0.95)';
            ghost.style.opacity = '0.7';

            setTimeout(() => {
                ghost.style.display = 'none';
                ghost.style.transition = '';
                ghost.style.transform = '';
                ghost.style.opacity = '';
                if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');
                this.updateRender();
            }, 180);
        } else {
            if (ghost) ghost.style.display = 'none';
            if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');
            this.updateRender();
        }
    }

    _isBoxBusy(id) {
        return this._busyBoxes.has(String(id));
    }

    _resetAnimationState() {
        this.removeTrayMode = false;
        this.setBoosterStatus('');
        if (this.trayRenderer) this.trayRenderer.speedMultiplier = 1;
        this._animationEpoch = (this._animationEpoch || 0) + 1;
        this._busyBoxes = new Set();
        this._pendingQueueBoxes = [];
        this._queueFlightActive = false;
        this._deliveryAnimating = false;
        document.querySelectorAll('.item-drag-ghost, .item-animating, .flying-queue-box').forEach(el => el.remove());
        document.body.classList.remove('is-dragging', 'is-item-dragging');
        if (this.itemDragState) this.itemDragState.isDragging = false;
        if (this.dragState) this.dragState.isDragging = false;
    }

    _drainQueueFlights() {
        if (this._queueFlightActive || this._deliveryAnimating || !this._pendingQueueBoxes.length || this.engine.gameState !== 'PLAYING') return;
        const box = this._pendingQueueBoxes[0];
        const queue = this.engine.getQueue();
        if (queue.length >= this.engine.maxQueueSize) {
            const trays = this.engine.conveyor.getAllActiveTrays();
            // An outgoing tray can expose the order needed to free a queue slot.
            if (this.engine.hasPendingTrayExits() || queue.some(b => trays.some(t => t.canAccept(b))) || this._deliveryAnimating) return;
            this.engine.loseReason = 'Hàng chờ đã đầy, không còn chỗ nhận thùng đã đóng gói.';
            this.engine.setGameState('LOST');
            return;
        }
        this._pendingQueueBoxes.shift();
        if (this.engine.getBox(box.id) !== box || queue.includes(box)) {
            this._busyBoxes.delete(String(box.id));
            this._drainQueueFlights();
            return;
        }
        const epoch = this._animationEpoch;
        this._queueFlightActive = true;
        const domBox = document.querySelector(`.box[data-box-id="${box.id}"]`);
        if (domBox) domBox.style.visibility = 'hidden';
        this.queueRenderer.animateBoxToQueue(box, queue.length, domBox, () => {
            if (epoch !== this._animationEpoch) return;
            this._queueFlightActive = false;
            this._busyBoxes.delete(String(box.id));
            if (this.engine.gameState === 'PLAYING') {
                box.queueEnteredTime = performance.now();
                this.engine.moveBoxToQueue(box);
            }
            this.updateRender();
            this._drainQueueFlights();
        });
    }

    _finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox, epoch = this._animationEpoch) {
        if (epoch !== this._animationEpoch) return;
        this._busyBoxes.delete(String(sourceId));
        // State already committed; let other boxes render and accept input now.
        this._busyBoxes.delete(String(boxId));
        this.updateRender();
        if (targetBox && targetBox.isWrapped) {
            this._busyBoxes.add(String(boxId));
            setTimeout(() => {
                if (epoch !== this._animationEpoch || this.engine.gameState !== 'PLAYING') return;
                if (!this._pendingQueueBoxes.includes(targetBox)) this._pendingQueueBoxes.push(targetBox);
                this._drainQueueFlights();
            }, 550);
        }
    }

    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (this.removeTrayMode) return;
        if (this._isBoxBusy(boxId)) return;
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
        if (this.removeTrayMode) return;
        if (this.engine.gameState !== 'PLAYING') return;
        this._drainQueueFlights();
        if (this._deliveryAnimating || this._queueFlightActive) return;

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

            const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);
            if (!slotEl) continue;

            // Evaluate every matching tray: the first matching tray may still be
            // on the far side while another is already passing this queue slot.
            for (const tray of activeTrays) {
                if (!tray.canAccept(box)) continue;
                const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
                if (!trayObj || !trayObj.el || trayObj.isExiting || trayObj.isReceiving || trayObj.fadingOut) continue;
                if (!this.trayRenderer.isInDeliveryZone(trayObj, slotEl, queue.length)) continue;

                this.triggerQueueDelivery(box, tray, slotEl, trayObj.el);
                return; // Keep delivery transactions serialized across frames.
            }
        }
    }

    triggerQueueDelivery(box, tray, slotEl, trayEl) {
        this._deliveryAnimating = true;
        const epoch = this._animationEpoch;

        const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
        if (trayObj) {
            trayObj.isReceiving = true;
        }

        slotEl.classList.add('dispatching');
        if (navigator.vibrate) navigator.vibrate(15);

        this.queueRenderer.animateBoxToTray(box, slotEl, trayEl, () => {
            if (epoch !== this._animationEpoch) return;
            slotEl.classList.remove('dispatching');
            this.engine.deliverQueueBox(box.id, tray.id);
            this._deliveryAnimating = false;
            this._drainQueueFlights();

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

