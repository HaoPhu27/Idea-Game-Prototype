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

import { simulate, heuristic, isWrapped, solveIDA, CAPACITY } from './Solver.js';
import { ITEM_CATALOG } from '../data/ItemCatalog.js';

/* ------------------------------------------------------------------ */
/* Item Catalog (khop GDD 9.2 / ItemCatalog.js)                        */
/* ------------------------------------------------------------------ */

// Catalog duy nhat cua game la ItemCatalog.js. Truoc day file nay giu mot ban
// sao rieng va da troi khoi ban goc ('rabbit' vs 'bunny', 'clip' vs 'paperclip').
// Hau qua: getCategoryByItemId() tra ve null cho item sinh ra tu day => Box.getCategory()
// null => Tray.canAccept() luon false => Thung wrapped KHONG BAO GIO giao duoc.
// Nay derive truc tiep, khong con kha nang lech.
export const CATEGORIES = ITEM_CATALOG.categories.map((c) => ({
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
export const getTypeInfo = (id) => TYPE_INDEX.get(id);

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

export const DEFAULTS = {
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

export const PRESETS = {
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

export function makeRng(seed) {
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

export function generateLevel(userConfig = {}) {
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

export function generateLevelFromPreset(presetName, overrides = {}) {
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
export function configForLevelNumber(level, overrides = {}) {
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

export const SolvableLevelGenerator = {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
  DEFAULTS,
};
