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

/* ---------- Test 3: gradient do kho theo level number ---------- */
console.log('\n=== TEST 3: lo trinh do kho theo level (configForLevelNumber) ===');
{
  const rows = [];
  for (const lv of [1, 3, 5, 8, 12, 16, 20, 30, 45, 60, 90]) {
    const samples = [];
    for (let k = 0; k < 60; k++) {
      const cfg = configForLevelNumber(lv, { seed: lv * 1000 + k, verify: false, computeOptimal: false });
      const l = generateLevel(cfg);
      const sim = simulate(l.boxes.map((b) => b.items), l.referenceSolution);
      check(sim.ok, `level ${lv} sample ${k}: loi giai that bai`);
      samples.push(l);
    }
    const m = (f) => (samples.reduce((a, s) => a + f(s), 0) / samples.length);
    rows.push({
      lv,
      box: samples[0].config.numBoxes,
      sets: samples[0].config.numSets,
      cat: samples[0].config.numCategories,
      r21: samples[0].config.ratio21.toFixed(2),
      moves: m((s) => s.referenceSolution.length).toFixed(1),
      free: m((s) => s.difficulty.freeSlots).toFixed(1),
      held: m((s) => s.difficulty.maxWrappedHeld).toFixed(1),
      score: m((s) => s.difficulty.score).toFixed(0),
      limit: samples[0].rules.moveLimit ?? '-',
    });
  }
  console.log('  lv | box sets cat  r21 | moves free held | score  moveLimit');
  for (const r of rows) {
    console.log(
      `  ${String(r.lv).padStart(2)} |  ${r.box}    ${String(r.sets).padStart(1)}   ${r.cat}  ${r.r21} | ` +
        `${r.moves.padStart(5)} ${r.free.padStart(4)} ${r.held.padStart(4)} | ${r.score.padStart(5)}  ${r.limit}`
    );
  }
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
    check(
      engine.conveyor.maxActive === level.maxActiveTrays,
      `level ${levelNumber} seed ${seed}: conveyor.maxActive=${engine.conveyor.maxActive} khac level ${level.maxActiveTrays}`
    );

    // 1) Lop vi mo: dieu khien engine bang chinh loi giai tham chieu cua bo sinh man.
    let bad = null;
    for (const mv of level.referenceSolution) {
      if (!engine.selectSource(mv.from, mv.index) || !engine.selectTarget(mv.to)) { bad = mv; break; }
    }
    if (bad) {
      check(false, `level ${levelNumber} seed ${seed}: engine tu choi nuoc ${JSON.stringify(bad)}`);
      continue;
    }

    // 2) Lop vi mo: keo tung Thung da wrapped len Khay dang chay tren bang chuyen.
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

console.log(`\n${failures === 0 ? '✅ TAT CA TEST PASS' : '❌ ' + failures + ' LOI'}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
process.exit(failures ? 1 : 0);
