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

import { heuristic, isWrapped, CAPACITY } from './Solver.js';
import { ITEM_CATALOG } from '../data/ItemCatalog.js';

/* ------------------------------------------------------------------ */
/* Item Catalog (khop GDD 9.2 / ItemCatalog.js)                        */
/* ------------------------------------------------------------------ */

// Catalog duy nhat cua game la ItemCatalog.js — derive truc tiep de khong the lech.
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

export const MAX_TYPES_PER_CAT = Math.max(...CATEGORIES.map((c) => c.items.length));
export const TOTAL_TYPES = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/* ------------------------------------------------------------------ */
/* Tham so                                                             */
/* ------------------------------------------------------------------ */

export const DEFAULTS = {
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
export const PRESETS = {
  tutorial:  { numBoxes: 6,  carrierBoxes: 3, numCategories: 1, itemTypesPerCategory: 2, ratio21: 1.0,  conveyorMaxActive: 4 },
  easy:      { numBoxes: 12, carrierBoxes: 3, numCategories: 2, itemTypesPerCategory: 2, ratio21: 0.85, conveyorMaxActive: 4, moveLimitSlack: 1.8 },
  normal:    { numBoxes: 30, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 3, ratio21: 0.65, conveyorMaxActive: 3, moveLimitSlack: 1.5 },
  hard:      { numBoxes: 56, carrierBoxes: 2, numCategories: 5, itemTypesPerCategory: 3, ratio21: 0.62, conveyorMaxActive: 2, trayMatchMode: 'itemType', moveLimitSlack: 1.35, undoCount: 2 },
  superhard: { numBoxes: 76, carrierBoxes: 2, numCategories: 6, itemTypesPerCategory: 3, ratio21: 0.55, conveyorMaxActive: 1, trayMatchMode: 'itemType', moveLimitSlack: 1.25, undoCount: 1 },
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

export function generateLevel(userConfig = {}) {
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

export function generateLevelFromPreset(presetName, overrides = {}) {
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
export function configForLevelNumber(level, overrides = {}) {
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
      trayMatchMode: 'category',
      strictTrayRatio: 0,
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
      trayMatchMode: 'category',
      strictTrayRatio: 0,
      conveyorMaxActive: L <= 8 ? 5 : 4,
      buryBias: 0.2, bottomBias: lerp(0.65, 0.58, t),
      moveLimitSlack: lerp(1.9, 1.7, t),
      secondsPerMove: null,
      undoCount: 4,
    };
  } else if (tier === 'acclimation') {
    // Phan bi che thanh phan chinh cua ban. Tu L16 Khay doi dung LOAI item.
    const t = (L - 11) / 9;
    const strict = L >= 16;
    c = {
      numBoxes: Math.round(lerp(22, 34, t)),
      carrierBoxes: 3,
      maxOpeningSets: 5,
      numCategories: strict ? 4 : 3,
      itemTypesPerCategory: strict ? 3 : 2,
      ratio21: lerp(0.80, 0.68, t),
      trayMatchMode: strict ? 'itemType' : 'category',
      strictTrayRatio: strict ? lerp(0.4, 0.6, (L - 16) / 4) : 0,
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
    const typeId = state[boxIdx][0];
    return tray.matchMode === 'itemType'
      ? tray.targetItemId === typeId
      : tray.categoryId === catOf(typeId);
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

  // Che do khop cua Khay phai dong nhat TRONG TUNG NHOM HANG. Tron hai che do trong
  // cung mot nhom co the ket cung: Khay che do 'category' nuot mat Thung ma Khay che do
  // 'itemType' dang doi, va Thung con lai khong con Khay nao nhan.
  const wantStrict =
    cfg.strictTrayRatio == null
      ? (cfg.trayMatchMode === 'itemType' ? 1 : 0)
      : clamp(cfg.strictTrayRatio, 0, 1);
  const trayCats = [...new Set(trayTypes.map((t) => getTypeInfo(t).categoryId))];
  const strictCats = new Set(
    shuffle(makeRng(cfg.seed + 7919), trayCats.slice())
      .slice(0, Math.round(wantStrict * trayCats.length))
  );
  const trays = trayTypes.map((typeId, i) => {
    const info = getTypeInfo(typeId);
    return {
      id: `tray_${i}`,
      queueIndex: i,
      categoryId: info.categoryId,
      targetItemId: typeId,
      emoji: info.emoji,
      color: info.color,
      matchMode: strictCats.has(info.categoryId) ? 'itemType' : 'category',
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

export const SolvableLevelGenerator = {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
  DEFAULTS,
};
