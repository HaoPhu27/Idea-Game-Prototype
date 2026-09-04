/**
 * GameSim.js - mo hinh TRUNG THUC cua tran dau that (GameEngine + Conveyor + Tray + Box).
 *
 * TAI SAO FILE NAY TON TAI
 * ------------------------
 * Solver.js chi mo phong lop THUNG (di chuyen item, wrap). O lop do, tham lam gan nhu
 * luon toi uu: so o trong bi ghim o 3E va voi mot ban do du, gom bo 3 truoc la du.
 * => KHONG mot tham so nao o lop Thung tao ra duoc do sau suy tinh.
 *
 * Do kho that nam o cho GHEP LOP:
 *   - Bang chuyen chi mo `maxActive` Khay DAU TIEN (cua so tien to co dinh, Conveyor.js).
 *   - Thung goi xong ROI KHOI COT NGAY va roi xuong HANG CHO 5 slot
 *     (GameEngine.moveBoxToQueue). Khay khop thi giao luon, khong thi nam lai.
 *     HANG CHO DAY LA THUA. Day la luat quan trong nhat cua game va ban truoc cua
 *     file nay khong he mo hinh no: no giu Thung goi xong NAM LAI TRONG COT, tuc vua
 *     khoa cot qua muc vua khong bao gio thua vi hang cho.
 *   - Cot chi tut xuong khi mot Thung roi khoi cot (goi xong hoac het item).
 *   - Nen khi N > columns * visibleRows, THU TU GOI tro thanh bai toan lap lich that:
 *     goi nham thu tu => hang cho day => thua; hoac cot khong tut => khoa vinh vien.
 * Do la "kho chu khong dai": van tung ay item, nhung phai nhin truoc.
 *
 * GIAO HANG LA TU DONG, KHONG PHAI MOT NUOC DI
 * --------------------------------------------
 * UIManager goi checkAndAutoFill() sau moi lan goi Thung va sau moi lan Khay roi bang
 * chuyen; GameEngine.findQueueMatch() duyet hang cho theo thu tu roi lay Khay dang hoat
 * dong DAU TIEN nhan duoc. Nguoi choi khong chon gi ca. Vi vay o day giao hang khong
 * phai mot phan tu cua legalMoves() nua — no chay ngay trong applyMove(), y het game.
 *
 * BAT BIEN QUAN TRONG
 * -------------------
 * GameEngine.startLevel dung `new Box(idx)` => ID cua Thung CHINH LA chi so mang,
 * nen layout.columns (bo sinh phat ra chi so) khop truc tiep. Khong can doi kieu.
 */

import { getCategoryByItemId } from '../data/ItemCatalog.js';

export const CAP = 3;
export const QUEUE_CAP = 5;      // = GameEngine.maxQueueSize

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
  const queueCap = (level.rules && level.rules.queueCapacity) || QUEUE_CAP;
  return { boxes, columns, visibleRows, trays, maxActive, queue: [], queueCap, moves: 0, dead: false };
}

export function cloneState(s) {
  return {
    boxes: s.boxes.map(b => (b === null ? null : { items: b.items.slice(), w: b.w })),
    columns: s.columns.map(c => c.slice()),
    visibleRows: s.visibleRows,
    trays: s.trays.slice(),          // moi tray la immutable => chia se duoc
    maxActive: s.maxActive,
    queue: s.queue.slice(),
    queueCap: s.queueCap,
    moves: s.moves,
    dead: s.dead,
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
function trayAccepts(tray, items, catIndex) {
  if (tray.mode === 'itemType') return items[0] === tray.type;
  return catIndex.get(items[0]) === tray.cat;
}

function removeFromColumn(s, id) {
  for (const col of s.columns) {
    const at = col.indexOf(id);
    if (at !== -1) { col.splice(at, 1); return; }
  }
}

/**
 * GameEngine.tryAutoFillTray() chay den khi khong con cap nao khop:
 * duyet hang cho theo thu tu, lay Khay DANG HOAT DONG dau tien nhan duoc.
 */
function autoFill(s, catIndex) {
  for (let progress = true; progress; ) {
    progress = false;
    const win = Math.min(s.maxActive, s.trays.length);
    for (let qi = 0; qi < s.queue.length && !progress; qi++) {
      const items = s.boxes[s.queue[qi]].items;
      for (let ti = 0; ti < win; ti++) {
        if (!trayAccepts(s.trays[ti], items, catIndex)) continue;
        s.trays.splice(ti, 1);
        s.boxes[s.queue[qi]] = null;
        s.queue.splice(qi, 1);
        progress = true;
        break;
      }
    }
  }
}

/**
 * Nuoc di hop le — CHI la nuoc chuyen item. Giao hang tu dong (xem dau file).
 */
export function legalMoves(s) {
  const out = [];
  if (s.dead) return out;

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

/**
 * Ap dung tai cho. moves chi tang khi di chuyen item (giong GameEngine.selectTarget).
 * Ba he qua tu dong duoc mo phong dung thu tu cua GameEngine:
 *   1. Thung nguon het item -> bien mat -> cot tut xuong.
 *   2. Thung dich du 3 item cung loai -> goi -> ROI KHOI COT -> vao hang cho.
 *   3. Hang cho tu dong giao cho Khay dang hoat dong; day qua 5 slot la THUA.
 */
export function applyMove(s, mv, catIndex) {
  const src = s.boxes[mv.f];
  src.items.splice(src.items.indexOf(mv.it), 1);
  const dst = s.boxes[mv.t];
  dst.items.push(mv.it);
  if (src.items.length === 0) { s.boxes[mv.f] = null; removeFromColumn(s, mv.f); }
  if (isWrappedItems(dst.items)) {
    dst.w = true;
    removeFromColumn(s, mv.t);
    s.queue.push(mv.t);
  }
  s.moves++;
  autoFill(s, catIndex);
  if (s.queue.length > s.queueCap) s.dead = true;   // GameEngine: 'Hang cho da day'
  return s;
}

export const isWin = (s) =>
  s.trays.length === 0 && s.queue.length === 0 && s.boxes.every(b => b === null || b.items.length === 0);

export const isDead = (s) => s.dead || (!isWin(s) && legalMoves(s).length === 0);

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
  const q = s.queue.map(i => s.boxes[i].items[0]).sort().join('.');
  const trays = s.trays.map(t => (t.mode === 'itemType' ? 't:' + t.type : 'c:' + t.cat)).join(',');
  return cols + '~' + q + '~' + trays + '~' + s.visibleRows + '/' + s.maxActive;
}

/**
 * Giai TOAN BO tran dau (Thung + hang cho + Khay + cot bi che) bang IDA* theo so nuoc
 * di item. Tra ve { solved, moves, nodes, cutoff }. cutoff = true nghia la HET NGAN
 * SACH, chua ket luan duoc - khong duoc coi la "khong giai duoc".
 *
 * CHI DUNG DUOC CHO BAN NHO. Tu ~20 Thung tro len thi khong gian trang thai vuot xa
 * moi ngan sach hop ly; do do kho cua ban lon phai dung trapRate() (mo phong nguoi
 * choi) chu khong phai solver.
 */
export function solveFull(state, catIndex, opt = {}) {
  const maxNodes = opt.maxNodes ?? 200000;
  const maxDepth = opt.maxDepth ?? 200;
  let nodes = 0, cutoff = false, seen = null;
  const path = [];

  const dfs = (s) => {
    const f = s.moves + heuristic(s);
    if (f > bound) return f;
    if (isWin(s)) return 'FOUND';
    if (s.dead) return Infinity;
    if (++nodes > maxNodes) { cutoff = true; return Infinity; }
    if (s.moves > maxDepth) return Infinity;

    let min = Infinity;
    for (const mv of legalMoves(s)) {
      const ns = applyMove(cloneState(s), mv, catIndex);
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
 * DO KHO THUC NGHIEM: TY LE THUA CUA NGUOI CHOI MO PHONG
 *
 * Man co bao nhieu nuoc di khong quan trong. Cai quan trong la: nguoi choi choi mot
 * cach HOP LY co bi dan vao the khong the thang khong. Do la "kho chu khong dai".
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
 * cho Thung nao gan goi nhat truoc. Khong nhin hang doi Khay, khong nhin cot bi che,
 * khong nghi den hang cho. Day la cach da so nguoi choi moi choi.
 */
function pickGreedy(s, mvs, rng) {
  let best = null, bestScore = -1e9;
  for (const mv of mvs) {
    const dst = s.boxes[mv.t], src = s.boxes[mv.f];
    const same = dst.items.filter(x => x === mv.it).length;
    let sc = same * 10 + dst.items.length;
    if (same === 0) sc = -5 - dst.items.length;          // do vao Thung la = lam ban them
    if (src.items.length === 1) sc += same === 2 ? 5 : -25;
    sc += rng() * 0.9;
    if (sc > bestScore) { bestScore = sc; best = mv; }
  }
  return best;
}

/**
 * Nguoi choi "tinh y" (smart): choi dung moi nuoc HIEN NHIEN dung ma bat ky nguoi choi
 * co kinh nghiem nao cung thay:
 *   - Khong bao gio tao Thung DAY 3 item LAN LOAN (Thung do chet vinh vien).
 *   - Uu tien nuoc lam tron bo 3 (goi ngay).
 *   - Uu tien gom ve dong cung loai lon nhat.
 *   - Tranh lam bien mat Thung khi khong wrap duoc bo (mat cho chua).
 * Chinh sach nay KHONG nhin truoc hang doi Khay, KHONG suy luan ve cot bi che va
 * KHONG dem hang cho. Van nao no van thua la van doi hoi LAP KE HOACH THAT.
 */
function pickSmart(s, mvs, rng) {
  let best = null, bestScore = -1e9;
  for (const mv of mvs) {
    const dst = s.boxes[mv.t], src = s.boxes[mv.f];
    const same = dst.items.filter(x => x === mv.it).length;
    const after = dst.items.length + 1;
    let sc;
    if (same === 2) sc = 100;                        // tron bo => goi ngay
    else if (after === CAP && same < 2) sc = -1000;   // se thanh Thung day lan loan
    else if (same === 1) sc = 40 - dst.items.length;
    else sc = -20 - dst.items.length * 5;            // do vao Thung la
    if (src.items.length === 1) {
      // Luat: Thung rong bien mat => mat cho chua.
      const others = s.boxes.filter((b, i) => b && i !== mv.f && i !== mv.t && !b.w);
      const freeOther = others.reduce((n, b) => n + (CAP - b.items.length), 0);
      if (same === 2) sc += others.length > 0 && freeOther === 0 ? -10000 : 15;
      else sc += freeOther + (CAP - after) === 0 ? -10000 : -40;
    }
    sc += rng() * 0.5;
    if (sc > bestScore) { bestScore = sc; best = mv; }
  }
  return best;
}

/**
 * Nguoi choi "co ke hoach" (planner): nhu smart, CONG THEM hai thu ma mot nguoi choi
 * cham chi that su nhin duoc tren man hinh — cua so Khay dang chay va so slot con
 * trong cua hang cho. No van KHONG nhin duoc Thung bi che va KHONG tim kiem.
 *
 * Day la thuoc do do kho dung cho cac tier lon: `smart` thua gan 100% moi man co
 * hang cho (vi no goi bua roi lam day hang cho), nen khong con phan biet duoc tier.
 */
function pickPlanner(s, mvs, rng, catIndex) {
  const win = s.trays.slice(0, Math.min(s.maxActive, s.trays.length));
  const room = s.queueCap - s.queue.length;

  // Loai item nao dang co Khay cho san trong cua so? Day la thu duy nhat nguoi choi
  // that su NHIN THAY tren bang chuyen, va la cau hoi dau tien ho tu dat ra:
  // "cai Khay dang toi can gi, minh gom duoc no khong?".
  const wanted = new Set();
  for (const t of win) {
    if (t.mode === 'itemType') wanted.add(t.type);
    else for (const b of s.boxes) if (b && catIndex.get(b.items[0]) === t.cat) wanted.add(b.items[0]);
  }

  let best = null, bestScore = -1e9;
  for (const mv of mvs) {
    const dst = s.boxes[mv.t], src = s.boxes[mv.f];
    const same = dst.items.filter(x => x === mv.it).length;
    const after = dst.items.length + 1;
    const want = wanted.has(mv.it);
    let sc;
    if (same === 2) {
      // Nuoc nay se GOI Thung. Tot khi co Khay nhan duoc ngay; neu khong, Thung se
      // chiem mot slot hang cho — van dang lam (no giai phong mot o trong cot, lam
      // cot tut xuong) nhung cang it slot con lai thi cang phai tiec.
      const deliverable = win.some(t => trayAccepts(t, [mv.it, mv.it, mv.it], catIndex));
      sc = deliverable ? 160 : (room <= 1 ? -800 : 70 - (s.queueCap - room) * 18);
    } else if (after === CAP && same < 2) sc = -1000;   // Thung day lan loan = chet
    else if (same === 1) sc = (want ? 70 : 35) - dst.items.length;
    else sc = (want ? -8 : -20) - dst.items.length * 5;
    if (src.items.length === 1) {
      const others = s.boxes.filter((b, i) => b && i !== mv.f && i !== mv.t && !b.w);
      const freeOther = others.reduce((n, b) => n + (CAP - b.items.length), 0);
      if (same === 2) sc += others.length > 0 && freeOther === 0 ? -10000 : 15;
      else sc += freeOther + (CAP - after) === 0 ? -10000 : -40;
    }
    sc += rng() * 0.5;
    if (sc > bestScore) { bestScore = sc; best = mv; }
  }
  return best;
}

const pickRandom = (s, mvs, rng) => mvs[Math.floor(rng() * mvs.length)];

const POLICIES = { greedy: pickGreedy, smart: pickSmart, planner: pickPlanner, random: pickRandom };

/** Choi mot van tu dau den cuoi. Tra ve chuoi the co da di qua. */
export function playout(state, catIndex, policyName, rng, maxSteps = 400) {
  const pick = POLICIES[policyName] || pickGreedy;
  let s = cloneState(state);
  const trail = [cloneState(s)];
  for (let i = 0; i < maxSteps; i++) {
    if (isWin(s)) return { trail, won: true, dead: false };
    if (s.dead) return { trail, won: false, dead: true };
    const mvs = legalMoves(s);
    if (!mvs.length) return { trail, won: false, dead: true };
    s = applyMove(s, pick(s, mvs, rng, catIndex), catIndex);
    trail.push(cloneState(s));
  }
  return { trail, won: isWin(s), dead: false };
}

/**
 * Do TY LE THUA cua nguoi choi mo phong tren nhieu van.
 *
 * Ba ket cuc:
 *   won   - thang.
 *   dead  - het nuoc di HOAC hang cho tran => THUA chac chan.
 *   loop  - cham tran maxSteps => chinh sach dang di vong. Voi ban nho ta hoi solver
 *           mot lan o the co cuoi (neu con thang duoc thi day la loi cua chinh sach,
 *           BO trial); voi ban lon solver khong kham noi nen tinh la khong ket luan.
 *
 * Tra ve:
 *   rate  - ty le van thua tren so van ket luan duoc (0..1)  <= DO KHO CHINH
 *   depth - trung binh so nuoc di item truoc khi ket thuc van thua
 */
export function trapRate(state, catIndex, opt = {}) {
  const trials = opt.trials ?? 40;
  const policy = opt.policy ?? 'planner';
  const useSolver = opt.useSolver ?? (state.boxes.length <= 14);
  const solverOpt = { maxNodes: opt.maxNodes ?? 40000, maxDepth: opt.maxDepth ?? 200 };
  const rng = mulberry32(opt.seed ?? 12345);
  const maxSteps = opt.maxSteps ?? Math.max(300, state.boxes.length * 8);

  let lost = 0, decided = 0, discarded = 0, depthSum = 0;
  for (let i = 0; i < trials; i++) {
    const { trail, won, dead } = playout(state, catIndex, policy, rng, maxSteps);
    if (won) { decided++; continue; }
    if (!dead) {
      if (!useSolver) { discarded++; continue; }
      const r = solveFull(trail[trail.length - 1], catIndex, solverOpt);
      if (r.cutoff || r.solved) { discarded++; continue; }
    }
    decided++; lost++;
    depthSum += trail[trail.length - 1].moves;
  }
  return {
    rate: decided ? lost / decided : 0,
    depth: lost ? depthSum / lost : 0,
    lost, decided, discarded,
  };
}
