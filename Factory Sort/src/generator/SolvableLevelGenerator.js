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

// So loai item nhieu nhat trong MOT nhom hang, va tong so loai cua ca catalog.
// Cham diem va clamp phai doc hai so nay chu khong hardcode "3" / "12": catalog da
// mo rong tu 4 nhom x 3 loai len 8 nhom x 4 loai (9/2026) va con co the doi tiep.
export const MAX_TYPES_PER_CAT = Math.max(...CATEGORIES.map((c) => c.items.length));
export const TOTAL_TYPES = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

export const DEFAULTS = {
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
  maxAttempts: 80,
  verify: true,           // luon replay lai loi giai qua engine sim truoc khi tra ve
  computeOptimal: 'auto', // 'auto' | true | false  -> co chay IDA* gan minMoves khong
};

// Cac preset deu theo LUAT MOI: khong Thung rong luc spawn (noEmptyBoxes mac dinh
// true trong DEFAULTS), numSets = numBoxes - 1, va cua so bang chuyen ROI RA theo
// do kho dung nhu configForLevelNumber.
export const PRESETS = {
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

export function generateLevelFromPreset(presetName, overrides = {}) {
  const preset = PRESETS[presetName];
  if (!preset) throw new Error(`Preset khong ton tai: ${presetName}`);
  return generateLevel({ ...preset, ...overrides });
}

/**
 * Lo trinh do kho theo level number — nguon su that DUY NHAT cho cau hoi
 * "level N kho the nao" (UIManager chi truyen levelNumber vao day).
 *
 * ==== BAN THIET KE 9/2026: duong cong ep vao 30 LEVEL ====
 *
 * Truoc day duong cong keo toi ~L70 va doan sau gan nhu phang. Ban moi dat toan bo
 * do kho vao 30 level va chia lam hai chang:
 *
 *   L1..L10   LAM QUEN. Ban co nho, 1-3 nhom hang, Khay chi doi dung NHOM (khong
 *             doi dung loai), khong gioi han nuoc di/thoi gian trong 4 level dau,
 *             o trong gom lai cho de dan xep. Muc tieu la day duoc luat choi vao
 *             dau nguoi choi, khong phai thu thach ho.
 *
 *   L11..L30  HARD / SUPER HARD xen ke DEU. Level le = HARD, level chan = SUPER
 *             HARD (L11 hard, L12 super, L13 hard, ...) — 10 man moi loai. Xen ke
 *             thay vi hai khoi lien nhau de nhip cua chang khong bi mot chieu:
 *             nguoi choi luon co mot man de tho giua hai man nghet.
 *
 *   L31+      Giu nguyen tran cua L30 (van xen ke hard/super hard). Bo luat khong
 *             con don bay nao chua dung.
 *
 * BANG CHUYEN — nguoc voi truc giac cu:
 *
 *     chang        | Khay chay cung luc
 *     L1..L5       |  3
 *     L6..L10      |  4
 *     L11..L30 le  |  5   (hard)
 *     L11..L30 chan|  6 hoac 7 (super hard, luan phien)
 *
 * O ban truoc, cua so HEP duoc coi la kho (it cho giao hang => ton kho Khay cao).
 * Ban nay lam nguoc: cua so RONG hon cho level kho hon. Hai hieu ung that su nguoc
 * chieu nhau va deu co that:
 *   - rong hon => de GIAO hang hon  (giam ap luc ton kho)
 *   - rong hon => nhieu muc tieu phai doi chieu cung luc hon (tang tai doc vi)
 * Vi vay cham diem da tach lam hai truc rieng: trayBacklog (ton kho) va trayLoad
 * (tai doc vi) — xem finalize(). Dung gop hai thu nay lai lam mot lan nua.
 *
 * Luu y: day van la GIA THIET THIET KE, phai hieu chinh lai khi co telemetry that.
 */
export function configForLevelNumber(level, overrides = {}) {
  const L = Math.max(1, Math.floor(level));
  // Chang 2 bat dau tu L11. Trong chang 2, level LE = hard, level CHAN = super hard.
  const isRamp = L <= 10;
  const isSuperHard = !isRamp && L % 2 === 0;
  // t = tien do trong chang, 0..1. Dung de noi suy moi tham so lien tuc.
  const t = isRamp ? (L - 1) / 9 : clamp((L - 11) / 19, 0, 1);
  const lerp = (a, b, x) => a + (b - a) * x;

  /* --- Quy mo ban choi --- */
  // Khu Thung la 3 cot x 4 hang = 12 o HIEN. Thung thu 13 tro di bi che o dinh cot
  // va chi lo ra khi mot Thung phia duoi duoc giao xong.
  //
  //   chang 1  N = 5..12   (vung hien dan day, chua co Thung an)
  //   hard     N = 12..16  (an 0 -> 4)
  //   super    N = 13..18  (an 1 -> 6)
  //
  // Do ti le sinh man thanh cong theo N (40 seed moi muc, 9/2026): 100% tu N=8 den
  // N=20; chi phi la so lan xay lai (0.1 lan o N<=13, 2.2 o N=18, 7.8 o N=20). Do
  // la ly do tran dat o 18 chu khong cao hon — tren nua thi thoi gian sinh man bat
  // dau thay duoc tren may yeu.
  const numBoxes = isRamp
    ? Math.round(lerp(5, 12, t))
    : isSuperHard
      ? Math.round(lerp(13, 18, t))
      : Math.round(lerp(12, 16, t));
  const numEmptyBoxes = 0;                                     // LUAT MOI
  const numSets = numBoxes - 1;

  /* --- Item pool --- */
  // Catalog co 8 nhom x 4 loai = 32 loai. Hai vai tro khac nhau, dung lan lon:
  //
  //   BIEN DO (chong nham chan) den tu viec MOI MAN RUT MOT LAT CAT KHAC NHAU tu
  //   8 nhom: chon 3 trong 8 nhom da co 56 to hop, chon 4 co 70 — 30 man khong bao
  //   gio phai lap lai bang mau/emoji.
  //
  //   DO KHO den tu viec rut lat cat do cho DAC: it nhom nhung nhieu loai trong
  //   moi nhom. 9 bo trai deu tren 8 nhom thi moi mau gan nhu chi co mot loai —
  //   nguoi choi phan loai bang mau la xong, khong can nhin emoji. Nguoc lai 9 bo
  //   don vao 2 nhom x 4 loai thi mau vo dung, buoc phai doc emoji.
  //
  // Vi vay so nhom GIAM dan trong chang 2 trong khi so loai/nhom TANG.
  //
  // Ban co lon hon (toi 17 bo) buoc pool phai rong hon truoc: 3 nhom x 4 loai = 12
  // loai, moi loai dung toi 2 bo, vua du 17 bo. Khong the ep ve 2 nhom nhu ban 10
  // Thung nua — do la cai gia phai tra cho khu Thung 3x4.
  const numCategories = isRamp
    ? Math.min(1 + Math.round(t * 2), 3)
    : isSuperHard
      ? Math.round(lerp(4, 3, t))
      : Math.round(lerp(5, 4, t));
  const itemTypesPerCategory = isRamp
    ? 2
    : isSuperHard
      ? MAX_TYPES_PER_CAT
      : Math.min(3, MAX_TYPES_PER_CAT);
  const poolSize = numCategories * itemTypesPerCategory;

  /* --- Do phan tan --- */
  const ratio21 = isRamp ? lerp(1.0, 0.65, t) : lerp(0.6, 0.15, t);
  // extraScramble = 0 O MOI LEVEL. Hai ly do cong lai:
  //   1. Chinh file nay da do va ghi lai (xem DEFAULTS): xao them chi keo dai loi
  //      giai THAM CHIEU, con loi giai TOI UU hau nhu khong doi — no la can gat DO
  //      NHIEU chu khong phai do kho, va cham diem chuan hoa theo parMoves nen no
  //      khong dong gop gi vao diem.
  //   2. Tu khi co khu Thung 3x4, no con PHA sinh man: xao them lam loi giai cham
  //      vao MOI Thung ngay tu dau, nen khong Thung nao du dieu kien nam o vung an.
  //      Do o L30 (N=18, 12 seed): extraScramble 0 -> 3.6 lan xay lai trung binh;
  //      0.1 -> 38; 0.3 -> 51; 0.5 -> khong sinh noi trong 80 lan thu.
  // Tham so van con trong DEFAULTS cho nhanh debug khong dung bo cuc cot.
  const extraScramble = 0;
  const trayOrder = L <= 4 ? 'wrapOrder' : isRamp ? 'shuffled' : 'reverse';
  const maxSetsPerType = Math.max(
    Math.ceil(numSets / poolSize),
    isRamp ? 3 : isSuperHard ? 1 : 2
  );
  if (poolSize * maxSetsPerType < numSets) {
    // Chan an toan: neu lat cat qua hep cho so bo can thiet thi noi so loai/nhom
    // truoc khi noi so nhom (giu do "dac" cua mau).
    throw new Error(`configForLevelNumber(${L}): pool ${poolSize} qua nho cho ${numSets} bo`);
  }

  /* --- O trong: 3 o chia lam may Thung --- */
  // 2 => 2+1 (con mot Thung chi 1 vat, de dan xep) | 3 => 1+1+1 (nghet)
  const freeSlotBoxes = isRamp ? 2 : isSuperHard ? 3 : 2;

  /* --- Bang chuyen: SAN 3, hard 5, super hard 6/7 --- */
  // Super hard luan phien 6 va 7 de hai man super hard lien tiep khong giong het
  // nhau; 7 roi vao cac level chia het cho 4.
  // Chan tren numSets-1: phai LUON con it nhat mot Khay nam ngoai cua so, neu khong
  // thi bang chuyen khong con la bang chuyen — nguoi choi nhin thay ca hang doi va
  // moi Thung wrapped deu giao duoc ngay (do lai o L12 ban truoc: wrap = 1.00 tuyet
  // doi, truc ton kho chet han). Chi cac level onboarding dau moi cham chan nay.
  const conveyorMaxActive = Math.min(
    isRamp ? (L <= 5 ? 3 : 4) : isSuperHard ? (L % 4 === 0 ? 7 : 6) : 5,
    Math.max(2, numSets - 1)
  );

  /* --- Luat Khay & ap luc meta --- */
  // Chang 1 khong bao gio doi khop dung loai item — do la thu cua chang 2.
  const strictTrayRatio = isRamp ? 0 : isSuperHard ? lerp(0.5, 1.0, t) : lerp(0.15, 0.6, t);
  const trayMatchMode = strictTrayRatio >= 0.5 ? 'itemType' : 'category';
  const moveLimitSlack = L <= 4 ? null : isRamp ? lerp(1.9, 1.5, t) : lerp(1.4, 1.05, t);
  const secondsPerMove = isRamp ? null : lerp(7.5, 3.5, t);
  const undoCount = isRamp ? 3 : isSuperHard ? 1 : 2;

  return {
    seed: (L * 2654435761) % 2147483647,
    numBoxes,
    numEmptyBoxes,
    noEmptyBoxes: true,
    numSets,
    numCategories,
    itemTypesPerCategory,
    maxSetsPerType,
    freeSlotBoxes,
    ratio21,
    extraScramble,
    trayOrder,
    trayMatchMode,
    strictTrayRatio,
    conveyorMaxActive,
    moveLimitSlack,
    secondsPerMove,
    undoCount,
    columns: 3,
    visibleRows: 4,
    tier: isRamp ? 'ramp' : isSuperHard ? 'superhard' : 'hard',
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

  // Diem do kho 1..100 — 6 truc chuan hoa ve [0,1] roi tron theo trong so.
  //
  // DUONG CONG 30 LEVEL (do 9/2026, 20 seed moi level, sau khi doi sang luat
  // khong-Thung-rong va bang chuyen rong dan):
  //
  //   level | tier      | box | Khay | cuaSo | par  | wrapped | score
  //      1  | ramp      |  4  |  3   |   2   |  3.6 |  1.00   |  21
  //      5  | ramp      |  6  |  5   |   3   |  6.2 |  1.05   |  30
  //     10  | ramp      |  8  |  7   |   4   |  8.9 |  1.25   |  38
  //     11  | hard      |  9  |  8   |   5   | 10.9 |  2.05   |  51
  //     12  | superhard |  9  |  8   |   7   | 10.9 |  1.70   |  61
  //     21  | hard      | 10  |  9   |   5   | 15.1 |  3.00   |  66
  //     26  | superhard | 10  |  9   |   6   | 15.7 |  3.25   |  83
  //     29  | hard      | 10  |  9   |   5   | 15.5 |  3.20   |  74
  //     30  | superhard | 10  |  9   |   6   | 15.8 |  3.15   |  84
  //
  // Hai DUONG rieng biet chu khong phai mot: hard 51 -> 74, super hard 61 -> 84,
  // xen ke tung level. Khoang cach ~10 diem giua hai tier chinh la nhip nghi ma
  // ban thiet ke muon. Ca hai deu cham tran o L30, dung nhu yeu cau.
  //
  // Luu y cot 'wrapped': super hard co ton kho Khay THAP hon hard (1.7 vs 2.05 o
  // L11-12) vi cua so rong hon giao hang de hon. Do la ly do truc trayBacklog bi ha
  // trong so tu 0.20 xuong 0.10 va truc trayLoad ra doi — xem phan cham diem.
  // Moi chi so CAU TRUC cua ban co deu cham tran quanh level 40: quy mo bi chan boi
  // 10 Thung (gioi han ban choi trong GDD) va 4 nhom hang x 3 loai (toan bo
  // ITEM_CATALOG). Voi numSets = numBoxes - 1 thi F = 3N - 3S = 3 la HANG SO, nghia
  // la truc "ap luc o trong" cu (parMoves / freeSlots) chi la ban sao ti le cua truc
  // khoi luong — 24% trong so cham diem cho cung mot thong tin hai lan. No duoc thay
  // bang do PHAN TAN (spread), thu that su thay doi theo ratio21 tu 2.00 den 2.89.
  //
  // Ket luan thiet ke: quy mo ban co (par ~15.8) cham tran o L21 khi numBoxes = 10.
  // Tu do den L30, do kho di len bang DO DAC CUA POOL (it nhom hang hon, nhieu loai
  // trong moi nhom hon => mau sac vo dung, phai doc emoji), do nghiem ngat cua Khay,
  // tai doc vi bang chuyen, va o trong bi xe le 1+1+1. Tat ca deu cham tran o L30 —
  // do la CO Y, vi ban thiet ke chi dat 30 level. L31+ lap lai muc L29/L30.
  // Mau so 30: khu Thung 3x4 keo par tu ~16 (ban 10 Thung cu) len ~29 o L30. Giu
  // mau so 24 cu thi moi level tu L24 tro len deu bao hoa truc nay va khong con
  // phan biet duoc nhau.
  const nm = Math.min(parMoves / 30, 1);                                   // khoi luong
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
  // Tai doc vi: moi lan wrap xong mot Thung, nguoi choi phai doi chieu no voi TAT CA
  // Khay dang chay. 3 Khay lam mot liec mat; 7 Khay la mot bai quet. Truc nay nguoc
  // chieu voi nw — do la CO Y, xem comment o configForLevelNumber.
  const nt = clamp((cfg.conveyorMaxActive - 3) / 4, 0, 1);                 // tai doc vi Khay
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
    confusion: +nc.toFixed(3), trayBacklog: +nw.toFixed(3), trayLoad: +nt.toFixed(3),
    strictness: +ns.toFixed(3),
  };
  // Trong so doi 9/2026 cung voi ban thiet ke 30 level:
  //   - volume 0.30 -> 0.26: quy mo ban co cham tran tu L20, bot phu thuoc vao no.
  //   - confusion 0.08 -> 0.12: catalog 32 loai cho truc nay du dia that su.
  //   - trayBacklog 0.20 -> 0.10 va tach ra truc trayLoad 0.10: cua so bang chuyen
  //     gio RONG dan theo do kho nen mot minh trayBacklog se cham nguoc dau.
  difficulty.score = clamp(
    Math.round(
      100 *
        (0.26 * nm + 0.14 * nd + 0.10 * nx + 0.12 * nc +
         0.10 * nw + 0.10 * nt + 0.18 * ns)
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

export const SolvableLevelGenerator = {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
  DEFAULTS,
};
