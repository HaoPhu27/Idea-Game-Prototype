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
export function configForLevelNumber(level, overrides = {}) {
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

export const SolvableLevelGenerator = {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
  DEFAULTS,
};
