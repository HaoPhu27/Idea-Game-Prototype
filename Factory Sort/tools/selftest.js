/**
 * selftest.js — chay: node tools/selftest.js
 * Sinh hang loat level va CHUNG MINH bang thuc nghiem rang chung giai duoc VA
 * duong cong do kho dung nhu ban thiet ke.
 */
import {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
} from '../src/generator/SolvableLevelGenerator.js';
import { simulate, solveIDA, solveConstructive, isWrapped, isDeadlocked } from '../src/generator/Solver.js';
import { LevelGenerator } from '../src/generator/LevelGenerator.js';
import { GameEngine } from '../src/core/GameEngine.js';
import * as G from '../src/generator/GameSim.js';

let failures = 0;
const t0 = Date.now();

function check(cond, msg) {
  if (!cond) { failures++; console.log('  ✗ ' + msg); }
  return cond;
}

/** Ty le THUA cua nguoi choi mo phong. Xem GameSim: 'planner' la thuoc do chinh. */
function lossRate(lv, trials = 30, policy = 'planner', seed = 4242) {
  const ci = G.buildCatIndex(lv), rng = G.mulberry32(seed);
  const maxSteps = Math.max(600, lv.boxes.length * 12);
  let lost = 0;
  for (let i = 0; i < trials; i++) {
    if (!G.playout(G.stateFromLevel(lv), ci, policy, rng, maxSteps).won) lost++;
  }
  return lost / trials;
}

/* ---------- Test 1: bat bien cua trang thai xuat phat + loi giai tham chieu ---------- */
console.log('\n=== TEST 1: bat bien trang thai xuat phat + replay loi giai tham chieu ===');
for (const preset of Object.keys(PRESETS)) {
  const stats = { n: 0, moves: [], score: [], attempts: [], genMs: 0 };
  const N = preset === 'superhard' || preset === 'hard' ? 60 : 150;
  for (let seed = 1; seed <= N; seed++) {
    const g0 = Date.now();
    const lvl = generateLevelFromPreset(preset, { seed });
    stats.genMs += Date.now() - g0;

    const state = lvl.boxes.map((b) => b.items);
    const cfg = lvl.config;

    // (a) trang thai xuat phat hop le
    check(!state.some((b) => isWrapped(b)), `${preset}#${seed}: co Thung wrapped san luc bat dau`);
    check(!state.some((b) => b.length === 0), `${preset}#${seed}: co Thung RONG luc bat dau`);
    check(!isDeadlocked(state), `${preset}#${seed}: xuat phat da THUA`);

    // (b) HE QUA (1): tong o trong = 3 * carrierBoxes, bat ke ban to co nao
    const free = state.reduce((n, b) => n + (cfg.boxCapacity - b.length), 0);
    check(free === 3 * cfg.carrierBoxes,
      `${preset}#${seed}: ${free} o trong, phai la ${3 * cfg.carrierBoxes} (= 3 * carrierBoxes)`);

    // (c) moi loai item xuat hien boi so cua 3
    const cnt = new Map();
    for (const b of state) for (const it of b) cnt.set(it, (cnt.get(it) || 0) + 1);
    for (const [k, v] of cnt) check(v % 3 === 0, `${preset}#${seed}: loai ${k} co ${v} item (khong chia het 3)`);

    // (d) so Khay = so bo, va bo cuc cot chua dung numBoxes Thung
    check(lvl.trays.length === cfg.numSets, `${preset}#${seed}: so Khay sai`);
    const inCols = lvl.layout.columns.reduce((n, c) => n + c.length, 0);
    check(inCols === cfg.numBoxes, `${preset}#${seed}: cot chua ${inCols} Thung, phai la ${cfg.numBoxes}`);

    // (e) loi giai chay duoc o lop Thung (lop cot da duoc replayReal kiem trong generateLevel)
    const sim = simulate(state, lvl.referenceSolution);
    if (!check(sim.ok, `${preset}#${seed}: loi giai that bai — ${sim.error} (buoc ${sim.step})`)) continue;
    check(sim.wrapOrder.length === cfg.numSets, `${preset}#${seed}: so Thung goi != so Khay`);

    stats.n++;
    stats.moves.push(lvl.referenceSolution.length);
    stats.score.push(lvl.difficulty.score);
    stats.attempts.push(lvl.attempt);
  }
  const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(
    `  ${preset.padEnd(9)} ok=${String(stats.n).padStart(3)}/${N}  ` +
      `moves(avg)=${avg(stats.moves).padStart(5)}  ` +
      `range=[${Math.min(...stats.moves)}..${Math.max(...stats.moves)}]  ` +
      `score(avg)=${avg(stats.score).padStart(5)}  ` +
      `retry(avg)=${avg(stats.attempts)}  ` +
      `gen=${(stats.genMs / N).toFixed(2)}ms/level`
  );
}

/* ---------- Test 2: par CO DUNG LA toi uu khong? ---------- */
/*
 * He qua (2) o dau SolvableLevelGenerator.js khang dinh refMoves = Σ(d_s − 1) chinh la
 * so nuoc di TOI UU, va toan bo `moveLimit` duoc tinh tren khang dinh do. Day la mot
 * lap luan, khong phai mot phep do — nen o day ta do lai bang solver day du tren ban
 * nho (solveFull co ca cot bi che, hang cho va cua so Khay).
 */
console.log('\n=== TEST 2: par co dung la toi uu khong (solver day du, ban nho) ===');
{
  let n = 0, equal = 0, cut = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const lvl = generateLevel({
      seed, numBoxes: 9, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 2,
      ratio21: 0.5, conveyorMaxActive: 3,
    });
    const r = G.solveFull(G.stateFromLevel(lvl), G.buildCatIndex(lvl), { maxNodes: 400000 });
    n++;
    if (!r.solved) { cut++; continue; }
    const opt = r.moves.length;               // solveFull chi tra ve nuoc CHUYEN ITEM
    check(opt <= lvl.difficulty.parMoves,
      `seed ${seed}: solver tim duoc ${opt} nuoc < par ${lvl.difficulty.parMoves} — par KHONG toi uu`);
    check(opt >= lvl.difficulty.parMoves,
      `seed ${seed}: solver can ${opt} nuoc > par ${lvl.difficulty.parMoves} — par qua lac quan, moveLimit se bat kha thi`);
    if (opt === lvl.difficulty.parMoves) equal++;
  }
  console.log(`  n=${n}  par == toi uu: ${equal}  solver het ngan sach: ${cut}`);
  check(cut === 0, `${cut} level solver khong ket luan duoc`);
}

/* ---------- Test 3: lo trinh do kho 50 level ---------- */
console.log('\n=== TEST 3: lo trinh do kho 50 level (configForLevelNumber) ===');
{
  // 3a. Dinh tuyen tier: day la HOP DONG voi nguoi choi, khong phai chi tiet noi bo.
  for (let L = 1; L <= 50; L++) {
    const want = L <= 5 ? 'tutorial'
               : L <= 10 ? 'onboarding'
               : L <= 20 ? 'acclimation'
               : L % 10 === 9 ? 'superhard'
               : L % 10 === 5 ? 'hard'
               : 'normal';
    const got = configForLevelNumber(L).tier;
    check(got === want, `level ${L}: tier '${got}' nhung phai la '${want}'`);
  }
  console.log('  ✓ dinh tuyen tier dung cho ca 50 level');

  // 3b. HOP DONG QUY MO — day la yeu cau san pham, khong phai tuy chinh:
  //     hard 50-70 Thung, super hard 72-96, va vung nhin thay LUON la 3x4 = 12 o.
  for (let L = 21; L <= 50; L++) {
    const c = configForLevelNumber(L);
    check(c.columns === 3 && c.visibleRows === 4,
      `level ${L}: vung nhin thay ${c.columns}x${c.visibleRows}, phai la 3x4`);
    if (c.tier === 'hard') {
      check(c.numBoxes >= 50 && c.numBoxes <= 70, `level ${L} (hard): ${c.numBoxes} Thung, phai trong [50,70]`);
    } else if (c.tier === 'superhard') {
      check(c.numBoxes >= 72 && c.numBoxes <= 96, `level ${L} (superhard): ${c.numBoxes} Thung, phai trong [72,96]`);
    }
  }
  console.log('  ✓ hard 50-70 Thung, super hard 72-96 Thung, vung nhin thay 3x4 o moi tier');

  // 3c. Do kho THAT = ty le thua cua chinh sach "planner" (GameSim): nguoi choi nhin
  // cua so Khay va hang cho — hai thu hien tren man hinh — nhung KHONG nhin duoc Thung
  // bi che va KHONG tim kiem. Van nao no van thua la van doi hoi LAP KE HOACH THAT.
  const PROBE = [1, 3, 5, 8, 10, 13, 16, 20, 21, 25, 27, 29, 33, 35, 40, 39, 45, 49, 50];
  const rows = [];
  for (const L of PROBE) {
    const cfg = configForLevelNumber(L);
    const l = generateLevel(cfg);
    const d = l.difficulty;
    check(simulate(l.boxes.map((b) => b.items), l.referenceSolution).ok,
      `level ${L}: loi giai tham chieu that bai`);
    check(d.hiddenBoxes === Math.max(0, cfg.numBoxes - 12),
      `level ${L}: hiddenBoxes=${d.hiddenBoxes} khong khop numBoxes-12`);
    rows.push({
      L, tier: cfg.tier, box: cfg.numBoxes, hid: d.hiddenBoxes, cma: cfg.conveyorMaxActive,
      par: d.parMoves, lim: l.rules.moveLimit ?? '-', open: d.openingSets,
      score: d.score, loss: lossRate(l),
    });
  }
  console.log('  lv | tier        box  che | cma | par  limit | mo dau | diem | thua(planner)');
  for (const r of rows)
    console.log(`  ${String(r.L).padStart(2)} | ${r.tier.padEnd(11)} ${String(r.box).padStart(3)} ${String(r.hid).padStart(4)} | ` +
      ` ${r.cma}  | ${String(r.par).padStart(3)}  ${String(r.lim).padStart(5)} | ${String(r.open).padStart(6)} | ` +
      `${String(r.score).padStart(4)} | ${(r.loss * 100).toFixed(0).padStart(3)}%`);

  // 3d. Thu tu do kho phai dung. Neu hard khong kho hon normal thi nhan hard la noi doi.
  const by = (t) => rows.filter((r) => r.tier === t);
  const lo = (a) => Math.min(...a.map((r) => r.loss));
  const hi = (a) => Math.max(...a.map((r) => r.loss));
  check(hi(by('tutorial')) === 0, 'level tutorial phai khong the thua');
  check(hi(by('onboarding')) <= 0.10, 'level onboarding thua qua nhieu');
  check(hi(by('acclimation')) <= 0.25, 'level lam quen thua qua nhieu');
  check(lo(by('hard')) > hi(by('normal')), 'hard phai kho hon MOI level normal');
  check(lo(by('superhard')) > hi(by('hard')), 'super hard phai kho hon MOI level hard');
  check(lo(by('hard')) >= 0.5, 'hard phai thua >= 50% duoi chinh sach planner');
  check(lo(by('superhard')) >= 0.8, 'super hard phai thua >= 80% duoi chinh sach planner');

  // 3e. Diem do kho phai DI CUNG CHIEU voi ty le thua do duoc, neu khong no dang noi doi.
  const tiers = ['tutorial', 'onboarding', 'acclimation', 'normal', 'hard', 'superhard'];
  for (let i = 1; i < tiers.length; i++) {
    const a = by(tiers[i - 1]), b = by(tiers[i]);
    if (!a.length || !b.length) continue;
    check(Math.min(...b.map((r) => r.score)) > Math.max(...a.map((r) => r.score)) - 1,
      `diem do kho: tier '${tiers[i]}' khong cao hon '${tiers[i - 1]}'`);
  }
  console.log('  ✓ ty le thua VA diem do kho deu tang dan theo tier');
}

/* ---------- Test 4: stress — cau hinh khac nghiet ---------- */
console.log('\n=== TEST 4: stress cau hinh khac nghiet ===');
{
  const configs = [
    { name: 'ngat tho E=1    ', numBoxes: 20, carrierBoxes: 1, numCategories: 4, itemTypesPerCategory: 2, ratio21: 0.7 },
    { name: 'khong 2+1       ', numBoxes: 24, carrierBoxes: 3, numCategories: 4, itemTypesPerCategory: 3, ratio21: 0 },
    { name: 'toan 2+1        ', numBoxes: 24, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 2, ratio21: 1 },
    { name: 'ban 90 Thung    ', numBoxes: 90, carrierBoxes: 3, numCategories: 6, itemTypesPerCategory: 3, ratio21: 0.6, conveyorMaxActive: 4 },
    { name: '2 cot, 3 hang   ', numBoxes: 20, carrierBoxes: 3, columns: 2, visibleRows: 3, numCategories: 3, itemTypesPerCategory: 2 },
    { name: 'cua so Khay = 1 ', numBoxes: 24, carrierBoxes: 3, numCategories: 3, itemTypesPerCategory: 3, conveyorMaxActive: 1 },
    { name: 'tray=itemType   ', numBoxes: 30, carrierBoxes: 2, numCategories: 4, itemTypesPerCategory: 3, trayMatchMode: 'itemType' },
    { name: '2 loai / 12 box ', numBoxes: 12, carrierBoxes: 3, numCategories: 1, itemTypesPerCategory: 2, maxSetsPerType: 6, ratio21: 0.5 },
  ];
  for (const c of configs) {
    let ok = 0, err = null;
    const N = c.numBoxes >= 60 ? 25 : 120;
    for (let seed = 1; seed <= N; seed++) {
      try {
        const l = generateLevel({ ...c, seed });
        const sim = simulate(l.boxes.map((b) => b.items), l.referenceSolution);
        if (sim.ok) ok++; else if (!err) err = sim.error;
      } catch (e) { if (!err) err = e.message; }
    }
    check(ok === N, `${c.name.trim()}: ${ok}/${N} — ${err}`);
    console.log(`  ${c.name} ${ok}/${N} ${ok === N ? '✓' : '✗ ' + err}`);
  }

  // Cau hinh BAT KHA THI phai bao loi ro rang, khong duoc treo.
  // Cau hinh KHONG THE sua duoc phai bao loi ro rang, khong duoc treo.
  const impossible = [
    { name: '1 loai / 12 box ', numBoxes: 12, carrierBoxes: 3, numCategories: 1, itemTypesPerCategory: 1, maxSetsPerType: 2 },
  ];
  for (const c of impossible) {
    let threw = false, msg = '';
    try { generateLevel({ ...c, seed: 1 }); } catch (e) { threw = true; msg = e.message.slice(0, 60); }
    check(threw, `${c.name.trim()}: le ra phai bao loi bat kha thi`);
    console.log(`  ${c.name} bao loi som ✓  "${msg}..."`);
  }

  // Cau hinh SUA DUOC thi phai duoc sua im lang, khong nem loi ra UI. numSets = numBoxes
  // la vo nghia (khong con Thung chuyen tiep => khong co o trong nao), normalizeConfig
  // keo no ve numBoxes-1. Duong tuong thich nguoc cua LevelGenerator dua vao hanh vi nay.
  {
    const l = generateLevel({ numBoxes: 8, numSets: 8, numCategories: 3, itemTypesPerCategory: 2, seed: 1 });
    check(l.config.carrierBoxes >= 1 && l.config.numSets === l.config.numBoxes - l.config.carrierBoxes,
      `numSets = numBoxes le ra phai duoc keo ve ${8 - 1}, nhan duoc numSets=${l.config.numSets}`);
    console.log(`  numSets=numBoxes   tu keo ve numSets=${l.config.numSets} carrierBoxes=${l.config.carrierBoxes} ✓`);
  }
}

/* ---------- Test 5: kiem chung gia dinh cu cua GDD 8.2 ---------- */
console.log('\n=== TEST 5: kiem chung gia dinh "co 1 Box rong => luon giai duoc" (GDD 8.2) ===');
{
  // Tai hien bo sinh THUAN cu: tao pool (numFilledBoxes bo x 3), shuffle, chia deu vao
  // cac Thung, + numEmptyBoxes Thung rong. Roi hoi IDA*.
  function legacyGenerate(seed, numBoxes, numEmpty, types) {
    let a = seed >>> 0 || 1;
    const rnd = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const filled = numBoxes - numEmpty;
    const pool = [];
    for (let i = 0; i < filled; i++) { const t = types[i % types.length]; pool.push(t, t, t); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const boxes = [];
    for (let i = 0; i < filled; i++) boxes.push(pool.slice(i * 3, i * 3 + 3));
    for (let i = 0; i < numEmpty; i++) boxes.push([]);
    return boxes;
  }
  const scenarios = [
    { name: 'GDD level 1  (6 box, 2 cat x 2 type = 4 loai)', n: 6, types: ['bear','duck','apple','pizza'] },
    { name: 'GDD level 9  (9 box, 4 cat x 2 type = 8 loai)', n: 9, types: ['bear','duck','apple','pizza','pencil','paperclip','soccer','basketball'] },
  ];
  for (const sc of scenarios) {
    let solvable = 0, unsolvable = 0, unknown = 0, prewrapped = 0;
    const N = 200;
    for (let seed = 1; seed <= N; seed++) {
      const boxes = legacyGenerate(seed, sc.n, 1, sc.types);
      if (boxes.some((b) => isWrapped(b))) prewrapped++;
      const r = solveIDA(boxes, { timeBudgetMs: 2000, maxNodes: 400000 });
      if (r.solved) solvable++; else if (r.cutoff) unknown++; else unsolvable++;
    }
    console.log(`  ${sc.name}`);
    console.log(`    giai duoc=${solvable}/${N}  KHONG giai duoc=${unsolvable}  khong ket luan=${unknown}`);
    console.log(`    ${prewrapped}/${N} level (${(prewrapped/N*100).toFixed(1)}%) co Thung WRAPPED SAN luc bat dau`);
  }
}

/* ---------- Test 6: loi giai KIEN THIET (dung lam hint) ---------- */
console.log('\n=== TEST 6: loi giai kien thiet — <= 4 nuoc/bo, khong can search ===');
{
  function randState(seed, N, S, nTypes) {
    let a = seed >>> 0 || 1;
    const rnd = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const pool = [];
    for (let i = 0; i < S; i++) { const ty = 'T' + (i % nTypes); pool.push(ty, ty, ty); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const boxes = Array.from({ length: N }, () => []);
    for (const it of pool) {
      let tries = 0, k;
      do { k = Math.floor(rnd() * N); } while (boxes[k].length >= 3 && ++tries < 200);
      boxes[k].push(it);
    }
    return boxes;
  }

  const cases = [[6,5,4],[8,7,6],[10,9,8],[10,9,3],[12,11,8],[16,15,12]];
  for (const [N,S,ty] of cases) {
    let ok = 0, maxRatio = 0, sumMoves = 0, n = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const st = randState(seed, N, S, ty);
      if (st.reduce((a,b)=>a+b.length,0) !== S*3) continue;
      const r = solveConstructive(st);
      n++;
      if (!r.solved) { check(false, `N=${N} S=${S} seed=${seed}: kien thiet that bai — ${r.reason}`); continue; }
      const sim = simulate(st, r.moves);
      if (!check(sim.ok, `N=${N} S=${S} seed=${seed}: loi giai kien thiet khong hop luat — ${sim.error}`)) continue;
      ok++; sumMoves += r.moves.length;
      maxRatio = Math.max(maxRatio, r.moves.length / S);
      check(r.moves.length <= 4 * S, `N=${N} S=${S} seed=${seed}: ${r.moves.length} nuoc > 4*S=${4*S}`);
    }
    console.log(`  N=${String(N).padStart(2)} S=${String(S).padStart(2)} types=${String(ty).padStart(2)} | giai duoc ${ok}/${n} | tb ${(sumMoves/ok).toFixed(1)} nuoc | max ${maxRatio.toFixed(2)} nuoc/bo (can tren ly thuyet 4.00)`);
  }

  // Ap dung len chinh level do generator sinh ra (dung lam hint system).
  // LUU Y: solveConstructive chi nhin lop THUNG, khong biet cot bi che — no la goi y
  // "nuoc ke tiep hop ly", khong phai loi giai choi duoc. Test nay chi doi no khong sap.
  let ok2 = 0;
  for (let seed = 1; seed <= 150; seed++) {
    const l = generateLevelFromPreset('normal', { seed });
    const st = l.boxes.map((b) => b.items);
    const r = solveConstructive(st);
    if (r.solved && simulate(st, r.moves).ok) ok2++;
  }
  check(ok2 === 150, `hint system tren preset normal: ${ok2}/150`);
  console.log(`  Ap dung lam hint tren preset "normal": ${ok2}/150 ✓`);
}

/* ---------- Test 7: tich hop that — LevelGenerator -> GameEngine -> WON ---------- */
/*
 * Test 1-6 chay tren engine MO PHONG: chung minh thuat toan dung ve ly thuyet, nhung
 * khong noi gi ve code ma nguoi choi thuc su cham vao. O day ta lai loi giai tham chieu
 * qua DUNG cac API ma UI goi (selectSource / selectTarget), voi DAY DU luat that:
 * hang cho 5 slot, gioi han nuoc di, cot bi che. Ket qua phai la 'WON'.
 *
 * KHONG tat maxQueueSize va KHONG tat moveLimit nhu ban truoc: par bay gio la so toi uu
 * that su nen loi giai tham chieu PHAI vua khit moi rang buoc cua man choi.
 */
console.log('\n=== TEST 7: tich hop LevelGenerator -> GameEngine (choi het mot van) ===');
for (const levelNumber of [1, 5, 12, 21, 25, 29, 35, 45, 49, 70]) {
  let won = 0, n = 0, itemTypeTrays = 0, maxQ = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const level = LevelGenerator.generateLevel({ levelNumber, seed });
    n++;
    itemTypeTrays += level.trays.filter((t) => t.matchMode === 'itemType').length;

    const engine = new GameEngine();
    engine.startLevel(level);
    check(engine.conveyor.maxActive === level.maxActiveTrays,
      `level ${levelNumber} seed ${seed}: conveyor.maxActive=${engine.conveyor.maxActive} khac level ${level.maxActiveTrays}`);

    let bad = null;
    for (const mv of level.referenceSolution) {
      if (!engine.selectSource(mv.from, mv.index) || !engine.selectTarget(mv.to)) { bad = mv; break; }
      maxQ = Math.max(maxQ, engine.queue.length);
      if (engine.gameState === 'LOST') { bad = { lost: engine.loseReason }; break; }
    }
    if (bad) {
      check(false, `level ${levelNumber} seed ${seed}: engine tu choi ${JSON.stringify(bad)}`);
      continue;
    }
    check(engine.moveCount <= (level.rules.moveLimit ?? Infinity),
      `level ${levelNumber} seed ${seed}: loi giai toi uu ton ${engine.moveCount} nuoc > gioi han ${level.rules.moveLimit}`);
    if (engine.gameState === 'WON') won++;
    else check(false,
      `level ${levelNumber} seed ${seed}: ket thuc o ${engine.gameState} — con ` +
      `${engine.boxes.filter((b) => !b.isEmpty()).length} Thung, ` +
      `${engine.conveyor.allTrays.length} Khay chua giao`);
  }
  console.log(`  level ${String(levelNumber).padStart(2)} | thang ${won}/${n} | Khay che do itemType: ${itemTypeTrays} | hang cho sau nhat: ${maxQ}/5`);
}

/* ---------- Test 8: gioi han nuoc di co CONG BANG khong? ---------- */
/*
 * `moveLimit = ceil(par * moveLimitSlack)` va par = refMoves. Test 2 da chung minh
 * par == toi uu tren ban nho bang solver day du; test 7 da chung minh loi giai do CHAY
 * DUOC qua engine that duoi dung moveLimit. Con lai o day chi la mot rang buoc so hoc:
 * gioi han khong bao gio duoc thap hon par, va do du dia phai giam dan theo do kho.
 */
console.log('\n=== TEST 8: gioi han nuoc di vs par (50 level) ===');
{
  let minSlack = Infinity, worst = null, withLimit = 0;
  const bySlack = {};
  for (let L = 1; L <= 50; L++) {
    const lv = LevelGenerator.generateLevel({ levelNumber: L });
    const lim = lv.rules && lv.rules.moveLimit;
    const par = lv.difficulty.parMoves;
    if (!lim) continue;
    withLimit++;
    check(lim >= par, `level ${L}: gioi han ${lim} < par ${par} — KHONG THE THANG`);
    const slack = lim / par;
    const tier = lv.config.tier || '?';
    (bySlack[tier] = bySlack[tier] || []).push(slack);
    if (lim - par < minSlack) { minSlack = lim - par; worst = L; }
  }
  for (const [t, a] of Object.entries(bySlack)) {
    console.log(`  ${t.padEnd(11)} du dia = ${(Math.min(...a)).toFixed(2)}x .. ${(Math.max(...a)).toFixed(2)}x par`);
  }
  console.log(`  da kiem ${withLimit} level co gioi han | du dia hep nhat: ${minSlack} nuoc (level ${worst})`);
}

console.log(`\n${failures === 0 ? '✅ TAT CA TEST PASS' : '❌ ' + failures + ' LOI'}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(failures ? 1 : 0);
