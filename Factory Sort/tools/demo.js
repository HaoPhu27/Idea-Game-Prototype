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

console.log('\n-- Khu Thung --');
lvl.boxes.forEach((b, i) => {
  const slots = Array.from({ length: b.maxSize }, (_, k) => (b.items[k] ? em(b.items[k]) : '· '));
  console.log(`  box_${String(i).padStart(2)} [ ${slots.join(' ')} ]`);
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
console.log(`  mixedBoxRatio=${d.mixedBoxRatio}  categoryConfusion=${d.categoryConfusion}  maxWrappedHeld=${d.maxWrappedHeld}`);
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
