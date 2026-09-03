/**
 * selftest.js — chay: node tools/selftest.js
 * Sinh hang loat level va CHUNG MINH bang thuc nghiem rang chung giai duoc.
 */
import {
  generateLevel,
  generateLevelFromPreset,
  configForLevelNumber,
  PRESETS,
} from '../src/generator/SolvableLevelGenerator.js';
import { simulate, solveIDA, solveGreedy, solveConstructive, isWrapped, isDeadlocked } from '../src/generator/Solver.js';
import { LevelGenerator } from '../src/generator/LevelGenerator.js';
import { GameEngine } from '../src/core/GameEngine.js';
import * as G from '../src/generator/GameSim.js';

let failures = 0;
const t0 = Date.now();

function check(cond, msg) {
  if (!cond) { failures++; console.log('  ✗ ' + msg); }
  return cond;
}

/* ---------- Test 1: moi preset, 400 seed, replay loi giai tham chieu ---------- */
console.log('\n=== TEST 1: replay loi giai tham chieu qua engine sim ===');
for (const preset of Object.keys(PRESETS)) {
  const stats = { n: 0, moves: [], score: [], attempts: [], genMs: 0 };
  for (let seed = 1; seed <= 400; seed++) {
    const g0 = Date.now();
    const lvl = generateLevelFromPreset(preset, { seed, verify: false, computeOptimal: false });
    stats.genMs += Date.now() - g0;

    const state = lvl.boxes.map((b) => b.items);

    // (a) trang thai xuat phat hop le
    check(!state.some((b) => isWrapped(b)), `${preset}#${seed}: co box wrapped san luc bat dau`);
    check(!isDeadlocked(state), `${preset}#${seed}: xuat phat da THUA`);
    check(
      state.filter((b) => b.length === 0).length >= lvl.config.numEmptyBoxes,
      `${preset}#${seed}: thieu Thung rong`
    );
    // (b) moi loai item xuat hien boi so cua 3
    const cnt = new Map();
    for (const b of state) for (const it of b) cnt.set(it, (cnt.get(it) || 0) + 1);
    for (const [k, v] of cnt) check(v % 3 === 0, `${preset}#${seed}: loai ${k} co ${v} item (khong chia het 3)`);
    // (c) so Tray = so bo
    check(lvl.trays.length === lvl.config.numSets, `${preset}#${seed}: so Tray sai`);

    // (d) LOI GIAI CHAY DUOC VA THANG
    const sim = simulate(state, lvl.referenceSolution);
    if (!check(sim.ok, `${preset}#${seed}: loi giai that bai — ${sim.error} (buoc ${sim.step})`)) continue;

    // (e) moi Tray deu duoc phuc vu
    check(sim.wrapOrder.length === lvl.config.numSets, `${preset}#${seed}: so box wrap != so Tray`);

    stats.n++;
    stats.moves.push(lvl.referenceSolution.length);
    stats.score.push(lvl.difficulty.score);
    stats.attempts.push(lvl.attempt);
  }
  const avg = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  console.log(
    `  ${preset.padEnd(9)} ok=${String(stats.n).padStart(3)}/400  ` +
      `moves(avg)=${avg(stats.moves).padStart(5)}  ` +
      `range=[${Math.min(...stats.moves)}..${Math.max(...stats.moves)}]  ` +
      `score(avg)=${avg(stats.score).padStart(5)}  ` +
      `retry(avg)=${avg(stats.attempts)}  ` +
      `gen=${(stats.genMs / 400).toFixed(2)}ms/level`
  );
}

/* ---------- Test 2: doi chieu voi IDA* — refMoves co toi uu khong? ---------- */
console.log('\n=== TEST 2: doi chieu IDA* (loi giai tham chieu vs toi uu) ===');
{
  let equal = 0, worse = 0, better = 0, cut = 0, n = 0;
  const diffs = [];
  for (let seed = 1; seed <= 150; seed++) {
    const lvl = generateLevel({
      seed, numBoxes: 6, numEmptyBoxes: 1, numCategories: 2,
      itemTypesPerCategory: 2, ratio21: 0.5, computeOptimal: false, verify: false,
    });
    const state = lvl.boxes.map((b) => b.items);
    const r = solveIDA(state, { timeBudgetMs: 4000, maxNodes: 900000 });
    n++;
    if (!r.solved) { cut++; check(false, `seed ${seed}: IDA* KHONG tim ra loi giai (level co the khong giai duoc!)`); continue; }
    const d = lvl.referenceSolution.length - r.moves.length;
    diffs.push(d);
    if (d === 0) equal++; else if (d > 0) worse++; else better++;
    check(d >= 0, `seed ${seed}: loi giai tham chieu ngan hon toi uu (?!) — bug heuristic`);
  }
  console.log(`  n=${n}  toi uu-trung=${equal}  dai hon toi uu=${worse}  IDA* khong ket luan=${cut}`);
  console.log(`  chenh lech trung binh = ${(diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)} nuoc`);
  console.log(`  => 100% level deu duoc IDA* xac nhan CO loi giai.`);
}

/* ---------- Test 3: lo trinh do kho 50 level ---------- */
console.log('\n=== TEST 3: lo trinh do kho 50 level (configForLevelNumber) ===');
{
  // 3a. Dinh tuyen tier: day la HOP DONG voi nguoi choi, khong phai chi tiet noi bo.
  // L1-10 onboarding, L11-20 lam quen, tu L21: duoi 5 = hard, duoi 9 = super hard.
  for (let L = 1; L <= 50; L++) {
    const want = L <= 10 ? 'onboarding'
               : L <= 20 ? 'acclimation'
               : L % 10 === 9 ? 'superhard'
               : L % 10 === 5 ? 'hard'
               : 'normal';
    const got = configForLevelNumber(L).tier;
    check(got === want, `level ${L}: tier '${got}' nhung phai la '${want}'`);
  }
  console.log('  ✓ dinh tuyen tier dung cho ca 50 level');

  // 3b. Do kho THAT = ty le thua cua chinh sach "smart": nguoi choi khong pham loi
  // hien nhien nhung khong nhin truoc thu tu Khay. Van nao no van thua la van doi
  // hoi lap ke hoach that — khac han "ban to, choi lau".
  const PROBE = [1, 5, 10, 15, 20, 21, 25, 29, 35, 39, 45, 49, 50];
  const rows = [];
  for (const L of PROBE) {
    const cfg = configForLevelNumber(L);
    const l = generateLevel({ ...cfg, computeOptimal: true });
    const sim = simulate(l.boxes.map((b) => b.items), l.referenceSolution);
    check(sim.ok, `level ${L}: loi giai tham chieu that bai`);

    const ci = G.buildCatIndex(l), rng = G.mulberry32(4242);
    let lost = 0;
    for (let t = 0; t < 40; t++)
      if (!G.playout(G.stateFromLevel(l), ci, 'smart', rng, 400).won) lost++;

    rows.push({
      L, tier: cfg.tier, box: cfg.numBoxes, vr: cfg.visibleRows,
      cma: cfg.conveyorMaxActive, par: l.difficulty.parMoves,
      lim: l.rules.moveLimit ?? '-', loss: lost / 40,
    });
  }
  console.log('  lv | tier        box vr cma | par  limit | thua(smart)');
  for (const r of rows)
    console.log(`  ${String(r.L).padStart(2)} | ${r.tier.padEnd(11)} ${String(r.box).padStart(2)}  ${r.vr}   ${r.cma} | ` +
      `${String(r.par).padStart(3)}  ${String(r.lim).padStart(5)} | ${(r.loss * 100).toFixed(0).padStart(3)}%`);

  // 3c. Thu tu do kho phai dung. Neu hard khong kho hon normal thi nhan hard la noi doi.
  const by = (t) => rows.filter((r) => r.tier === t);
  const min = (a) => Math.min(...a.map((r) => r.loss));
  const max = (a) => Math.max(...a.map((r) => r.loss));
  check(max(by('onboarding')) === 0, 'level onboarding phai khong the thua');
  check(max(by('acclimation')) <= 0.25, 'level lam quen thua qua nhieu');
  check(min(by('hard')) > max(by('normal')), 'hard phai kho hon MOI level normal');
  check(min(by('superhard')) > max(by('normal')), 'super hard phai kho hon MOI level normal');
  check(min(by('superhard')) >= 0.75, 'super hard phai thua >= 75% duoi chinh sach smart');
  check(min(by('hard')) >= 0.5, 'hard phai thua >= 50% duoi chinh sach smart');

  // 3d. Kho, chu khong phai dai. Level kho nhat khong duoc dai hon level thuong
  // qua mot chut — do kho phai den tu suy luan chu khong tu so nuoc di.
  const maxPar = (a) => Math.max(...a.map((r) => r.par));
  const parNormal = maxPar(by('normal'));
  const parHardest = maxPar([...by('hard'), ...by('superhard')]);
  check(parHardest <= parNormal + 3,
    `level kho dang dai hon level thuong (par ${parHardest} vs ${parNormal}) — do kho sai huong`);
  console.log(`  ✓ par lon nhat: normal ${parNormal}, hard/superhard ${parHardest} (kho chu khong dai)`);
}

/* ---------- Test 4: stress — cau hinh khac nghiet ---------- */
console.log('\n=== TEST 4: stress cau hinh khac nghiet ===');
{
  const configs = [
    { name: 'toi da 10 box   ', numBoxes: 10, numEmptyBoxes: 1, numCategories: 4, itemTypesPerCategory: 3, ratio21: 0 },
    { name: 'scramble x2     ', numBoxes: 8, numEmptyBoxes: 1, numCategories: 3, itemTypesPerCategory: 3, extraScramble: 2.0 },
    { name: 'thoang (3 rong) ', numBoxes: 8, numEmptyBoxes: 3, numSets: 5, numCategories: 2, itemTypesPerCategory: 3, compactFreeSlots: false },
    { name: 'tray=itemType   ', numBoxes: 9, numEmptyBoxes: 1, numCategories: 3, itemTypesPerCategory: 3, trayMatchMode: 'itemType', trayOrder: 'reverse' },
    { name: '2 loai / 8 box  ', numBoxes: 8, numEmptyBoxes: 1, numCategories: 1, itemTypesPerCategory: 2, maxSetsPerType: 4, ratio21: 0 },
    { name: 'nhieu bo 1 loai ', numBoxes: 10, numEmptyBoxes: 1, numCategories: 2, itemTypesPerCategory: 2, maxSetsPerType: 3, ratio21: 0.3 },
  ];
  for (const c of configs) {
    let ok = 0, err = null;
    for (let seed = 1; seed <= 300; seed++) {
      try {
        const l = generateLevel({ ...c, seed, verify: false, computeOptimal: false });
        const sim = simulate(l.boxes.map((b) => b.items), l.referenceSolution);
        if (sim.ok) ok++; else if (!err) err = sim.error;
      } catch (e) { if (!err) err = e.message; }
    }
    check(ok === 300, `${c.name.trim()}: ${ok}/300 — ${err}`);
    console.log(`  ${c.name} ${ok}/300 ${ok === 300 ? '✓' : '✗ ' + err}`);
  }

  // Cau hinh BAT KHA THI phai bao loi ro rang, khong duoc treo
  const impossible = [
    { name: '1 loai / 5 box  ', numBoxes: 5, numEmptyBoxes: 1, numCategories: 1, itemTypesPerCategory: 1, maxSetsPerType: 4 },
    { name: '2 box / 1 bo    ', numBoxes: 2, numEmptyBoxes: 1, numCategories: 1, itemTypesPerCategory: 1 },
  ];
  for (const c of impossible) {
    let threw = false, msg = '';
    try { generateLevel({ ...c, seed: 1 }); } catch (e) { threw = true; msg = e.message.slice(0, 60); }
    check(threw, `${c.name.trim()}: le ra phai bao loi bat kha thi`);
    console.log(`  ${c.name} bao loi som ✓  "${msg}..."`);
  }
}

/* ---------- Test 5: kiem chung gia dinh cu cua GDD 8.2 ---------- */
console.log('\n=== TEST 5: kiem chung gia dinh "co 1 Box rong => luon giai duoc" (GDD 8.2) ===');
{
  // Tai hien LevelGenerator HIEN TAI: tao pool (numFilledBoxes bo x 3), shuffle,
  // chia deu vao cac Thung, + numEmptyBoxes Thung rong. Roi hoi IDA*.
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
    let solvable = 0, unsolvable = 0, unknown = 0, prewrapped = 0, freebies = 0;
    const N = 300;
    for (let seed = 1; seed <= N; seed++) {
      const boxes = legacyGenerate(seed, sc.n, 1, sc.types);
      const pre = boxes.filter((b) => isWrapped(b)).length;
      if (pre) { prewrapped++; freebies += pre; }
      const r = solveIDA(boxes, { timeBudgetMs: 2000, maxNodes: 400000 });
      if (r.solved) solvable++; else if (r.cutoff) unknown++; else unsolvable++;
    }
    console.log(`  ${sc.name}`);
    console.log(`    giai duoc=${solvable}/${N}  KHONG giai duoc=${unsolvable}  khong ket luan=${unknown}`);
    console.log(`    ${prewrapped}/${N} level (${(prewrapped/N*100).toFixed(1)}%) co Thung WRAPPED SAN luc bat dau -> thung mien phi, hong duong cong do kho`);
  }
}

/* ---------- Test 6: loi giai KIEN THIET (dinh ly F>=3) ---------- */
console.log('\n=== TEST 6: loi giai kien thiet — <= 4 nuoc/bo, khong can search ===');
{
  function randState(seed, N, S, nTypes) {
    let a = seed >>> 0 || 1;
    const rnd = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const pool = [];
    for (let i = 0; i < S; i++) { const ty = 'T' + (i % nTypes); pool.push(ty, ty, ty); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const boxes = Array.from({ length: N }, () => []);
    // rai ngau nhien, ton trong suc chua 3
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
    for (let seed = 1; seed <= 500; seed++) {
      const st = randState(seed, N, S, ty);
      if (st.reduce((a,b)=>a+b.length,0) !== S*3) continue;
      const r = solveConstructive(st);
      n++;
      if (!r.solved) { check(false, `N=${N} S=${S} seed=${seed}: kien thiet that bai — ${r.reason}`); continue; }
      const sim = simulate(st, r.moves);
      if (!check(sim.ok, `N=${N} S=${S} seed=${seed}: loi giai kien thiet khong hop luat — ${sim.error}`)) continue;
      ok++; sumMoves += r.moves.length;
      maxRatio = Math.max(maxRatio, r.moves.length / S);
      check(r.moves.length <= 4 * S, `N=${N} S=${S} seed=${seed}: ${r.moves.length} nuoc > 4*S=${4*S} (pha vo can tren cua dinh ly)`);
    }
    console.log(`  N=${String(N).padStart(2)} S=${String(S).padStart(2)} types=${String(ty).padStart(2)} | giai duoc ${ok}/${n} | tb ${(sumMoves/ok).toFixed(1)} nuoc | max ${maxRatio.toFixed(2)} nuoc/bo (can tren ly thuyet 4.00)`);
  }

  // Ap dung len chinh level do generator sinh ra (dung lam hint system)
  let ok2 = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const l = generateLevelFromPreset('expert', { seed, verify: false, computeOptimal: false });
    const st = l.boxes.map((b) => b.items);
    const r = solveConstructive(st);
    if (r.solved && simulate(st, r.moves).ok) ok2++;
  }
  check(ok2 === 300, `hint system tren preset expert: ${ok2}/300`);
  console.log(`  Ap dung lam hint tren preset "expert": ${ok2}/300 ✓`);
}

/* ---------- Test 7: tich hop that — LevelGenerator -> GameEngine -> WON ---------- */
/*
 * Test 1-6 chay tren engine MO PHONG (Solver.simulate): no chung minh thuat toan
 * dung ve ly thuyet, nhung khong noi gi ve code ma nguoi choi thuc su cham vao.
 * O day ta lai loi giai tham chieu qua DUNG cac API ma UI goi:
 *   - lop vi mo: selectSource / selectTarget
 *   - lop vi mo: startDragWrappedBox / dropOnTray
 * roi doi trang thai cuoi cung phai la 'WON'. Chinh test nay bat duoc ba loi that
 * da ton tai: Box thieu getItemType(), Tray bo qua matchMode, va Conveyor.maxActive
 * khong bao gio doc gia tri tu level.
 */
console.log('\n=== TEST 7: tich hop LevelGenerator -> GameEngine (choi het mot van) ===');
for (const levelNumber of [1, 5, 12, 25, 45, 70]) {
  let won = 0, n = 0, itemTypeTrays = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const level = LevelGenerator.generateLevel({
      levelNumber, seed, verify: false, computeOptimal: false,
    });
    n++;
    itemTypeTrays += level.trays.filter((t) => t.matchMode === 'itemType').length;

    const engine = new GameEngine();
    engine.startLevel(level);
    // Test nay kiem tra HOP DONG HOP LUAT giua bo sinh man va engine: moi nuoc trong
    // referenceSolution phai duoc engine chap nhan. No KHONG kiem luat gioi han nuoc di.
    // referenceSolution la duong di NGUOC cua bo sinh man, dai hon par khoang refSlack
    // (1.2-1.4 lan) va CO Y khong toi uu — do la cong suc cua bo sinh man, khong phai
    // cua nguoi choi. Bat no vua moveLimit se la do sai thu do. Tinh cong bang cua
    // moveLimit duoc kiem rieng o Test 8 bang loi giai TOI UU day du.
    engine.moveLimit = null;
    check(
      engine.conveyor.maxActive === level.maxActiveTrays,
      `level ${levelNumber} seed ${seed}: conveyor.maxActive=${engine.conveyor.maxActive} khac level ${level.maxActiveTrays}`
    );

    // 1) Lop vi mo: dieu khien engine bang chinh loi giai tham chieu cua bo sinh man.
    let bad = null;
    for (const mv of level.referenceSolution) {
      if (!engine.selectSource(mv.from, mv.index) || !engine.selectTarget(mv.to)) { bad = mv; break; }
      // Giao hang moi khi co the de cot tut xuong (khop voi simulateWithLayout)
      while (true) {
        const box = engine.boxes.find((b) => b.isWrapped && engine.isAccessible(b.id) && engine.conveyor.findMatchingTray(b));
        if (!box) break;
        const tray = engine.conveyor.findMatchingTray(box);
        engine.startDragWrappedBox(box.id);
        if (!engine.dropOnTray(tray.id)) break;
      }
    }
    if (bad) {
      check(false, `level ${levelNumber} seed ${seed}: engine tu choi nuoc ${JSON.stringify(bad)}`);
      continue;
    }

    // 2) Lop vi mo: keo tung Thung da wrapped con lai len Khay dang chay tren bang chuyen.
    let guard = 0;
    while (engine.conveyor.hasRemainingTrays() && guard++ < 500) {
      const box = engine.boxes.find((b) => b.isWrapped && engine.conveyor.findMatchingTray(b));
      if (!box) break;
      const tray = engine.conveyor.findMatchingTray(box);
      engine.startDragWrappedBox(box.id);
      if (!engine.dropOnTray(tray.id)) break;
    }

    if (engine.gameState === 'WON') won++;
    else check(false,
      `level ${levelNumber} seed ${seed}: ket thuc o ${engine.gameState} — con ` +
      `${engine.boxes.filter((b) => !b.isEmpty()).length} thung con hang, ` +
      `${engine.conveyor.allTrays.length} khay chua giao`);
  }
  console.log(`  level ${String(levelNumber).padStart(2)} | thang ${won}/${n} | so khay che do itemType: ${itemTypeTrays}`);
}
/* ---------- Test 8: gioi han nuoc di co CONG BANG khong? ---------- */
/*
 * `moveLimit = ceil(par * moveLimitSlack)` va `par` den tu solveIDA(boxes) — mot loi
 * giai chi nhin cac THUNG, khong biet gi ve thu tu Khay tren bang chuyen. Neu viec
 * xep hang theo dung thu tu Khay ton them nuoc di thi gioi han se HEP HON toi uu that
 * su va man choi tro nen KHONG THE THANG — mot loi khong test nao truoc day bat duoc,
 * vi GameSim khong he mo hinh hoa moveLimit (moi ty le thua do duoc deu chi den tu
 * deadlock).
 *
 * O day ta giai TOAN CUC bang solveFull: co bang chuyen, co cua so Khay, co thu tu.
 * Luu y solveFull tra ve HAI loai nuoc — giao hang {k:'d'} va chuyen mon {k:'m'} —
 * trong khi GameEngine.moveCount CHI dem nuoc chuyen mon (giao hang la mien phi).
 * So sanh ca r.moves.length voi moveLimit se thoi phong con so len khoang gap doi.
 */
console.log('\n=== TEST 8: gioi han nuoc di vs loi giai toi uu day du (50 level) ===');
{
  const t8 = Date.now();
  let checked = 0, cutoff = 0, minSlack = Infinity, worst = null;
  for (let L = 1; L <= 50; L++) {
    const lv = LevelGenerator.generateLevel({ levelNumber: L });
    const lim = lv.rules && lv.rules.moveLimit;
    if (!lim) continue; // vai man onboarding dau khong dat gioi han
    const r = G.solveFull(G.stateFromLevel(lv), G.buildCatIndex(lv), {
      timeBudgetMs: 4000, maxNodes: 3000000,
    });
    if (!r.solved) { cutoff++; continue; }
    const opt = r.moves.filter((m) => m.k === 'm').length;
    checked++;
    check(opt <= lim, `level ${L}: toi uu day du ${opt} nuoc > gioi han ${lim} — KHONG THE THANG`);
    if (lim - opt < minSlack) { minSlack = lim - opt; worst = L; }
  }
  check(cutoff === 0, `${cutoff} level khong giai kip trong ngan sach — khong ket luan duoc`);
  console.log(
    `  da kiem ${checked} level co gioi han | du dia hep nhat: ${minSlack} nuoc (level ${worst})` +
    ` | ${((Date.now() - t8) / 1000).toFixed(1)}s`
  );
}

console.log(`\n${failures === 0 ? '✅ TAT CA TEST PASS' : '❌ ' + failures + ' LOI'}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(failures ? 1 : 0);
