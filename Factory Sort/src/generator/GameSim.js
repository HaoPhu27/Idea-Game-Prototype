/**
 * GameSim.js - mo hinh TRUNG THUC cua tran dau that (GameEngine + Conveyor + Tray + Box).
 *
 * TAI SAO FILE NAY TON TAI
 * ------------------------
 * Solver.js chi mo phong lop THUNG (di chuyen item, wrap). Do kho no do duoc
 * (optimal - heuristic) da duoc do thuc nghiem tren 12 bien the cau hinh x 60 seed:
 * excess = 0 o ~97% truong hop, max 1, trung binh 0.00-0.07. Ly do co cau:
 * numSets = numBoxes - 1 ghim so o trong F = 3N - 3S = 3, va F luon la boi cua 3
 * nen khong the thap hon. Voi tron mot Thung do du, tham lam la toi uu.
 * => KHONG mot tham so nao o lop Thung tao ra duoc do sau suy tinh.
 *    Tang numBoxes chi lam man DAI hon, khong lam KHO hon.
 *
 * Do kho that nam o cho GHEP LOP:
 *   - Bang chuyen chi mo `maxActive` Khay DAU TIEN (cua so tien to co dinh, Conveyor.js).
 *     Thung da goi ma Khay cua no con ngoai cua so thi phai GIU lai.
 *   - Thung dang giu chiem cho trong COT. Cot chi tut xuong khi co Thung duoc GIAO
 *     (_removeFromColumn chi duoc goi tu dropOnTray). => Thung bi che van khoa cung.
 *   - Nen khi N > columns * visibleRows, THU TU GOI tro thanh bai toan lap lich that:
 *     goi nham thu tu => cot khong bao gio tut => khoa vinh vien => thua.
 * Do la "kho chu khong dai": van tung ay item, nhung phai nhin truoc.
 *
 * BAT BIEN QUAN TRONG
 * -------------------
 * GameEngine.startLevel dung `new Box(idx)` => ID cua Thung CHINH LA chi so mang,
 * nen layout.columns (bo sinh phat ra chi so) khop truc tiep. Khong can doi kieu.
 */

import { getCategoryByItemId } from '../data/ItemCatalog.js';

export const CAP = 3;

/** Ban do itemId -> categoryId, lay tu ItemCatalog (nguon su that duy nhat). */
export function buildCatIndex(level) {
  const m = new Map();
  for (const b of level.boxes) for (const it of b.items) if (!m.has(it)) m.set(it, getCategoryByItemId(it));
  for (const t of level.trays) if (t.targetItemId && !m.has(t.targetItemId)) m.set(t.targetItemId, getCategoryByItemId(t.targetItemId));
  return m;
}

const isWrappedItems = (items) =>
  items.length === CAP && items[0] === items[1] && items[1] === items[2];

/** Dung state noi bo tu mot level do bo sinh phat ra. */
export function stateFromLevel(level) {
  const boxes = level.boxes.map(b => ({ items: b.items.slice(), w: isWrappedItems(b.items) }));
  const columns = level.layout
    ? level.layout.columns.map(c => c.slice())
    : [level.boxes.map((_, i) => i)];
  const visibleRows = level.layout ? level.layout.visibleRows : Infinity;
  const trays = level.trays.map(t => ({
    cat: t.categoryId, type: t.targetItemId, mode: t.matchMode || 'category',
  }));
  const maxActive = (level.conveyor && level.conveyor.maxActive) || level.maxActiveTrays || 4;
  return { boxes, columns, visibleRows, trays, maxActive, moves: 0 };
}

export function cloneState(s) {
  return {
    boxes: s.boxes.map(b => (b === null ? null : { items: b.items.slice(), w: b.w })),
    columns: s.columns.map(c => c.slice()),
    visibleRows: s.visibleRows,
    trays: s.trays.slice(),          // moi tray la immutable => chia se duoc
    maxActive: s.maxActive,
    moves: s.moves,
  };
}

/** Chi `visibleRows` phan tu dau moi cot moi cham duoc (GameEngine.isAccessible). */
export function isAccessible(s, i) {
  for (const col of s.columns) {
    const at = col.indexOf(i);
    if (at !== -1) return at < s.visibleRows;
  }
  return false;
}

/** Tray.canAccept: 'itemType' so khop dung loai item, nguoc lai so khop nhom. */
function trayAccepts(tray, box, catIndex) {
  if (!box || !box.w) return false;
  if (tray.mode === 'itemType') return box.items[0] === tray.type;
  return catIndex.get(box.items[0]) === tray.cat;
}

/**
 * Nuoc di hop le.
 *
 * TOI UU AN TOAN: neu co the GIAO thi CHI xet cac nuoc giao.
 * Giao la don dieu tot - no khong bao gio lam mat lua chon:
 *   - do voi cua Thung chi TANG (cot tut xuong),
 *   - cua so Khay chi tien len,
 *   - khong nuoc di item nao huy duoc mot co hoi giao (khong the un-wrap,
 *     khong doi do voi, khong doi cua so Khay).
 * Nen giao va di-chuyen giao hoan; hoan giao khong bao gio co loi.
 * Van con phan nhanh khi mot Thung goi khop NHIEU Khay khac nhau trong cua so.
 */
export function legalMoves(s, catIndex) {
  const out = [];
  const win = Math.min(s.maxActive, s.trays.length);
  for (let bi = 0; bi < s.boxes.length; bi++) {
    const b = s.boxes[bi];
    if (!b || !b.w || !isAccessible(s, bi)) continue;
    for (let ti = 0; ti < win; ti++) {
      if (trayAccepts(s.trays[ti], b, catIndex)) out.push({ k: 'd', b: bi, t: ti });
    }
  }
  if (out.length) return out;

  const acc = [];
  for (let i = 0; i < s.boxes.length; i++) if (s.boxes[i] && isAccessible(s, i)) acc.push(i);

  for (const f of acc) {
    const src = s.boxes[f];
    if (src.w || src.items.length === 0) continue;
    const seenItem = new Set();
    for (const it of src.items) {
      if (seenItem.has(it)) continue;   // rut item nao trong so cac item giong nhau deu nhu nhau
      seenItem.add(it);
      const seenDst = new Set();
      for (const t of acc) {
        if (t === f) continue;
        const dst = s.boxes[t];
        if (dst.w || dst.items.length >= CAP) continue;
        const sig = dst.items.slice().sort().join(',');
        if (seenDst.has(sig)) continue; // Thung dich cung noi dung thi tuong duong nhau
        seenDst.add(sig);
        out.push({ k: 'm', f, t, it });
      }
    }
  }
  return out;
}

/** Ap dung tai cho. moves chi tang khi di chuyen item (giong GameEngine.selectTarget). */
export function applyMove(s, mv) {
  if (mv.k === 'd') {
    const id = mv.b;
    s.boxes[id] = null;
    for (const col of s.columns) {
      const at = col.indexOf(id);
      if (at !== -1) { col.splice(at, 1); break; }
    }
    s.trays.splice(mv.t, 1);
  } else {
    const src = s.boxes[mv.f];
    src.items.splice(src.items.indexOf(mv.it), 1);
    const dst = s.boxes[mv.t];
    dst.items.push(mv.it);
    if (isWrappedItems(dst.items)) dst.w = true;
    s.moves++;
  }
  return s;
}

export const isWin = (s) =>
  s.trays.length === 0 && s.boxes.every(b => b === null || b.items.length === 0);

export const isDead = (s, catIndex) => !isWin(s) && legalMoves(s, catIndex).length === 0;

/** Chan duoi so nuoc di item con lai (chap nhan duoc, giong Solver.heuristic). */
export function heuristic(s) {
  const spread = new Map(); // itemId -> so Thung dang chua
  const total = new Map();
  for (const b of s.boxes) {
    if (!b || b.w) continue;          // Thung da goi khong con phai dong gi nua
    const seen = new Set();
    for (const it of b.items) {
      total.set(it, (total.get(it) || 0) + 1);
      if (!seen.has(it)) { seen.add(it); spread.set(it, (spread.get(it) || 0) + 1); }
    }
  }
  let h = 0;
  for (const [it, sp] of spread) h += Math.max(0, sp - Math.ceil(total.get(it) / CAP));
  return h;
}

/** Chuan hoa: item trong Thung khong co thu tu, cot thi CO thu tu (che khuat). */
export function hashState(s) {
  const cols = s.columns.map(col =>
    col.map(i => {
      const b = s.boxes[i];
      return (b.w ? '*' : '') + b.items.slice().sort().join('.');
    }).join('|')
  ).sort().join('#');
  const trays = s.trays.map(t => (t.mode === 'itemType' ? 't:' + t.type : 'c:' + t.cat)).join(',');
  return cols + '~' + trays + '~' + s.visibleRows + '/' + s.maxActive;
}

/**
 * Giai TOAN BO tran dau (Thung + Khay + cot bi che) bang IDA* theo so nuoc di item.
 * Tra ve { solved, moves, nodes, cutoff }. cutoff = true nghia la HET NGAN SACH,
 * chua ket luan duoc - khong duoc coi la "khong giai duoc".
 */
export function solveFull(state, catIndex, opt = {}) {
  const maxNodes = opt.maxNodes ?? 200000;
  const maxDepth = opt.maxDepth ?? 60;
  let nodes = 0, cutoff = false, seen = null;
  const path = [];

  const dfs = (s) => {
    const f = s.moves + heuristic(s);
    if (f > bound) return f;
    if (isWin(s)) return 'FOUND';
    if (++nodes > maxNodes) { cutoff = true; return Infinity; }
    if (s.moves > maxDepth) return Infinity;

    let min = Infinity;
    for (const mv of legalMoves(s, catIndex)) {
      const ns = applyMove(cloneState(s), mv);
      const key = hashState(ns);
      const prev = seen.get(key);
      if (prev !== undefined && prev <= ns.moves) continue;
      seen.set(key, ns.moves);
      path.push(mv);
      const r = dfs(ns);
      if (r === 'FOUND') return 'FOUND';
      path.pop();
      if (cutoff) return Infinity;
      if (r < min) min = r;
    }
    return min;
  };

  let bound = heuristic(state);
  while (bound <= maxDepth) {
    seen = new Map();
    path.length = 0;
    const r = dfs(cloneState(state));
    if (r === 'FOUND') return { solved: true, moves: path.slice(), nodes, cutoff: false };
    if (cutoff) return { solved: false, moves: null, nodes, cutoff: true };
    if (r === Infinity) return { solved: false, moves: null, nodes, cutoff: false };
    bound = r;
  }
  return { solved: false, moves: null, nodes, cutoff: false };
}

export const isWinnable = (s, catIndex, opt) => solveFull(s, catIndex, opt).solved;

/* ------------------------------------------------------------------ *
 * DO KHO THUC NGHIEM: TY LE SA BAY (trap rate)
 *
 * Man co bao nhieu nuoc di khong quan trong. Cai quan trong la: nguoi choi
 * choi mot cach HOP LY co bi dan vao the khong the thang khong.
 * Do la dinh nghia "kho chu khong dai".
 *
 * Tinh don dieu: khi mot the co da KHONG THE thang thi moi nuoc di sau do
 * cung khong the thang (nuoc di khong khoi phuc duoc gi). Nho do co the
 * TIM NHI PHAN diem sa bay dau tien => chi ton log2(do dai) lan goi solver.
 * ------------------------------------------------------------------ */

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Nguoi choi "hop ly" (greedy): uu tien gom item ve Thung da co san item cung loai,
 * cho Thung nao gan goi nhat truoc. Day la cach da so nguoi choi that su choi.
 * Khong he nhin truoc thu tu Khay hay cot bi che - dung cho ma bay giang ra.
 */
function pickGreedy(s, mvs, rng) {
  let best = null, bestScore = -1e9;
  for (const mv of mvs) {
    if (mv.k === 'd') return mv;
    const dst = s.boxes[mv.t];
    const same = dst.items.filter(x => x === mv.it).length;
    const src = s.boxes[mv.f];
    let sc = same * 10 + dst.items.length;
    if (same === 0) sc = -5 - dst.items.length;          // do vao Thung la = lam ban them
    if (src.items.length === 1) sc += 3;                 // don not Thung sap rong
    sc += rng() * 0.9;
    if (sc > bestScore) { bestScore = sc; best = mv; }
  }
  return best;
}

/**
 * Nguoi choi "tinh y" (smart): choi dung moi nuoc HIEN NHIEN dung ma bat ky
 * nguoi choi co kinh nghiem nao cung thay:
 *   - Khong bao gio tao Thung DAY 3 item LAN LOAN (Thung do chet vinh vien).
 *   - Uu tien nuoc lam tron bo 3 (goi ngay).
 *   - Uu tien gom ve dong cung loai lon nhat.
 *   - Uu tien don not Thung chi con 1 item de giai phong o trong.
 * Chinh sach nay KHONG nhin truoc thu tu Khay va KHONG suy luan ve cot bi che.
 * Vi vay: van nao no van thua la van doi hoi LAP KE HOACH THAT - do moi la
 * "kho chu khong dai".
 */
function pickSmart(s, mvs, rng) {
  let best = null, bestScore = -1e9;
  for (const mv of mvs) {
    if (mv.k === 'd') return mv;
    const dst = s.boxes[mv.t], src = s.boxes[mv.f];
    const same = dst.items.filter(x => x === mv.it).length;
    const after = dst.items.length + 1;
    let sc;
    if (same === 2) sc = 100;                       // tron bo => goi ngay
    else if (after === CAP && same < 2) sc = -1000;  // se thanh Thung day lan loan
    else if (same === 1) sc = 40 - dst.items.length;
    else sc = -20 - dst.items.length * 5;            // do vao Thung la
    if (src.items.length === 1) sc += 6;             // don not => them o trong
    sc += rng() * 0.5;
    if (sc > bestScore) { bestScore = sc; best = mv; }
  }
  return best;
}

const pickRandom = (s, mvs, rng) => mvs[Math.floor(rng() * mvs.length)];

const POLICIES = { greedy: pickGreedy, smart: pickSmart, random: pickRandom };

/** Choi mot van tu dau den cuoi. Tra ve chuoi the co da di qua. */
export function playout(state, catIndex, policyName, rng, maxSteps = 400) {
  const pick = POLICIES[policyName] || pickGreedy;
  let s = cloneState(state);
  const trail = [cloneState(s)];
  for (let i = 0; i < maxSteps; i++) {
    if (isWin(s)) return { trail, won: true, dead: false };
    const mvs = legalMoves(s, catIndex);
    if (!mvs.length) return { trail, won: false, dead: true };
    s = applyMove(s, pick(s, mvs, rng));
    trail.push(cloneState(s));
  }
  return { trail, won: isWin(s), dead: false };
}

/**
 * Do ty le sa bay tren nhieu van. Tra ve:
 *   rate      - ty le van roi vao the KHONG THE thang (0..1)
 *   depth     - trung binh so nuoc di truoc khi sa bay (cang lon cang "am tham")
 *   frac      - trung binh vi tri sa bay theo % do dai van
 *   undecided - so van solver het ngan sach, khong ket luan duoc
 */
/**
 * Do TY LE THUA cua nguoi choi mo phong tren nhieu van.
 *
 * KHONG dung solver de do tung buoc. Ly do: chung minh mot the co KHONG THE
 * thang bat IDA* phai vet can toan bo khong gian - dat gap hang nghin lan mot
 * van choi. Ma cung khong can: mot van ket thuc o the co KHONG CON NUOC DI nao
 * la da thua chac chan, khong phai hoi solver.
 *
 * Ba ket cuc:
 *   won   - thang.
 *   dead  - het nuoc di => THUA chac chan (day chinh la "sa bay").
 *   loop  - cham tran maxSteps => chinh sach dang di vong. Chi luc nay moi hoi
 *           solver MOT lan o the co cuoi: neu con thang duoc (hoac solver het
 *           ngan sach) thi day la loi cua chinh sach chu khong phai cua man
 *           choi => BO trial. Neu khong thang duoc thi van tinh la sa bay.
 *
 * Tra ve:
 *   rate  - ty le van thua tren so van ket luan duoc (0..1)  <= DO KHO CHINH
 *   depth - trung binh so nuoc di item truoc khi ket thuc van thua
 *   frac  - vi tri sa bay trung binh theo % do dai van (chi khi opt.deep)
 */
export function trapRate(state, catIndex, opt = {}) {
  const trials = opt.trials ?? 40;
  const policy = opt.policy ?? "greedy";
  const solverOpt = { maxNodes: opt.maxNodes ?? 40000, maxDepth: opt.maxDepth ?? 60 };
  const rng = mulberry32(opt.seed ?? 12345);

  let lost = 0, decided = 0, discarded = 0, depthSum = 0, fracSum = 0, fracN = 0;
  for (let i = 0; i < trials; i++) {
    const { trail, won, dead } = playout(state, catIndex, policy, rng, opt.maxSteps ?? 300);
    if (won) { decided++; continue; }
    if (!dead) {
      const r = solveFull(trail[trail.length - 1], catIndex, solverOpt);
      if (r.cutoff || r.solved) { discarded++; continue; }
    }
    decided++; lost++;
    depthSum += trail[trail.length - 1].moves;
    if (opt.deep) {
      let lo = 0, hi = trail.length - 1, bail = false;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const r = solveFull(trail[mid], catIndex, solverOpt);
        if (r.cutoff) { bail = true; break; }
        if (r.solved) lo = mid + 1; else hi = mid;
      }
      if (!bail && trail.length > 1) { fracSum += lo / (trail.length - 1); fracN++; }
    }
  }
  return {
    rate: decided ? lost / decided : 0,
    depth: lost ? depthSum / lost : 0,
    frac: fracN ? fracSum / fracN : 0,
    lost, decided, discarded,
  };
}
