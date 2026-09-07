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

export const CAPACITY = 3;

/* ------------------------------------------------------------------ */
/* Luat co ban (khop Box.js / GameEngine.js)                           */
/* ------------------------------------------------------------------ */

export function isWrapped(box, cap = CAPACITY) {
  if (box.length !== cap) return false;
  for (let i = 1; i < box.length; i++) if (box[i] !== box[0]) return false;
  return true;
}

/** canAccept() = items.length < maxSize && !isWrapped */
export function canAccept(box, cap = CAPACITY) {
  return box.length < cap && !isWrapped(box, cap);
}

/** Dieu kien THUA cua GameEngine: khong con o trong nao tren box chua wrapped */
export function isDeadlocked(state, cap = CAPACITY) {
  const active = state.filter((b) => !isWrapped(b, cap) && b.length > 0);
  if (active.length === 0) return false;
  return !state.some((b) => !isWrapped(b, cap) && b.length < cap);
}

/** Thang (tang consolidation): moi box hoac rong hoac wrapped */
export function isWinState(state, cap = CAPACITY) {
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
export function simulate(initialState, moves, cap = CAPACITY) {
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
export function heuristic(state, cap = CAPACITY) {
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
export function solveIDA(initialState, opts = {}) {
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
export function generateMoves(state, cap = CAPACITY) {
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
export function solveGreedy(initialState, opts = {}) {
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
export function solveConstructive(initialState, cap = CAPACITY) {
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
