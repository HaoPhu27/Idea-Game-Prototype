/**
 * demo.js — chay: node tools/demo.js [levelNumber]
 * In ra 1 level de mat nguoi doc duoc + JSON day du.
 */
import { generateLevel, configForLevelNumber, getTypeInfo } from '../src/generator/SolvableLevelGenerator.js';
import { simulate, solveConstructive } from '../src/generator/Solver.js';

const levelNumber = Number(process.argv[2] || 9);
const lvl = generateLevel(configForLevelNumber(levelNumber));

const em = (id) => getTypeInfo(id).emoji;

console.log(`\n===== LEVEL ${levelNumber} =====`);
console.log(`seed=${lvl.seed}  ${lvl.config.numBoxes} Thung  ${lvl.config.numSets} bo  ` +
            `${lvl.config.numCategories} category  ratio21=${lvl.config.ratio21.toFixed(2)}`);

// Ve theo COT, vi bo cuc cot MOI la ban choi that: chi `visibleRows` Thung duoi cung
// cua moi cot la cham duoc, phan tren bi che hoan toan.
console.log('\n-- Khu Thung theo COT (duoi cung = day cot, "==" la mep tam voi) --');
const rows = lvl.layout.visibleRows;
lvl.layout.columns.forEach((col, c) => {
  console.log(`  cot ${c}: ${col.length} Thung, ${Math.max(0, col.length - rows)} bi che`);
  for (let at = col.length - 1; at >= 0; at--) {
    const b = lvl.boxes[col[at]];
    const slots = Array.from({ length: b.maxSize }, (_, k) => (b.items[k] ? em(b.items[k]) : '· '));
    console.log(`    ${at === rows - 1 ? '==' : '  '} [${String(at).padStart(2)}] box_${String(col[at]).padStart(2)} ` +
      `[ ${slots.join(' ')} ]${at < rows ? '' : '  (bi che)'}`);
  }
});

console.log('\n-- Hang doi Tray tren Conveyor (maxActive=' + lvl.conveyor.maxActive + ') --');
lvl.trays.forEach((t, i) => {
  const active = i < lvl.conveyor.maxActive ? ' <= dang hien' : '';
  console.log(`  #${i} ${em(t.targetItemId)}  category=${t.categoryId.padEnd(16)} target=${t.targetItemId}${active}`);
});

console.log('\n-- Do kho --');
const d = lvl.difficulty;
console.log(`  score=${d.score}/100   refMoves=${d.refMoves}  lowerBound=${d.lowerBound}` +
            (d.optimalMoves ? `  optimal=${d.optimalMoves}` : ''));
console.log(`  freeSlots=${d.freeSlots}  fillRatio=${d.fillRatio}  avgSpread=${d.avgSpread}`);
console.log(`  hiddenBoxes=${d.hiddenBoxes}  openingSets=${d.openingSets}  visibleFreeSlots=${d.visibleFreeSlots}  deepestColumn=${d.deepestColumn}`);
console.log(`  mixedBoxRatio=${d.mixedBoxRatio}  categoryConfusion=${d.categoryConfusion}  maxQueueHeld=${d.maxQueueHeld}`);
console.log(`  components=`, d.components);
console.log(`  rules=`, lvl.rules);

console.log('\n-- Loi giai tham chieu (bang chung solvability) --');
lvl.referenceSolution.forEach((m, i) => {
  console.log(`  ${String(i + 1).padStart(2)}. box_${m.from}[${m.index}] ${em(m.itemId)} -> box_${m.to}`);
});

const sim = simulate(lvl.boxes.map((b) => b.items), lvl.referenceSolution);
console.log(`\n  Replay qua engine sim: ${sim.ok ? 'THANG ✓' : 'THAT BAI ✗ ' + sim.error}`);
console.log(`  Thu tu wrap: ${sim.wrapOrder.map((w) => em(w.itemId)).join(' ')}`);

const hint = solveConstructive(lvl.boxes.map((b) => b.items));
console.log(`  Loi giai kien thiet (hint system): ${hint.moves.length} nuoc, hop luat = ${simulate(lvl.boxes.map((b) => b.items), hint.moves).ok}`);

console.log('\n-- JSON (rut gon) --');
console.log(JSON.stringify({
  seed: lvl.seed,
  boxes: lvl.boxes,
  trays: lvl.trays.map(({ id, categoryId, targetItemId }) => ({ id, categoryId, targetItemId })),
  conveyor: lvl.conveyor,
  difficulty: { score: d.score, refMoves: d.refMoves, freeSlots: d.freeSlots },
  rules: lvl.rules,
  solvable: lvl.solvable,
}, null, 2));
