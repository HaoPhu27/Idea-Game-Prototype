/**
 * Quet lai MOT SO level voi be seed rong hon (400 thay vi 72), roi vá thang vao
 * tools/levels50.json. Dung khi vong quet 72 seed roi vao mot cua so xui va khong
 * tim duoc seed nao dat bang do kho muc tieu.
 */
import { generateLevel, configForLevelNumber } from '../src/generator/SolvableLevelGenerator.js';
import * as G from '../src/generator/GameSim.js';
import { readFileSync, writeFileSync } from 'fs';

const SEEDS = 400, SCREEN = 20, CONFIRM = 100;
const TARGETS = process.argv.slice(2).map(Number);

function band(L, tier) {
  if (tier === 'onboarding')  return [0, 0];
  if (tier === 'acclimation') { const t = (L - 11) / 9; return [0, 0.05 + 0.15 * t]; }
  if (tier === 'normal')      { const t = Math.min(1, (L - 21) / 28); return [0.08 + 0.05 * t, 0.15 + 0.15 * t]; }
  if (tier === 'hard')        return [0.55, 0.75];
  return [0.80, 0.95];
}
function fit(r, [lo, hi]) {
  if (r >= lo && r <= hi) return 1;
  return r < lo ? Math.max(0, 1 - (lo - r) * 4) : Math.max(0, 1 - (r - hi) * 1.5);
}
function rate(lv, trials, seed) {
  const ci = G.buildCatIndex(lv), rng = G.mulberry32(seed);
  let lost = 0;
  for (let t = 0; t < trials; t++)
    if (!G.playout(G.stateFromLevel(lv), ci, 'smart', rng, 400).won) lost++;
  return lost / trials;
}

const table = JSON.parse(readFileSync('tools/levels50.json', 'utf8'));
for (const L of TARGETS) {
  const cfg = configForLevelNumber(L);
  const b = band(L, cfg.tier);
  const cands = [];
  for (let k = 0; k < SEEDS; k++) {
    const seed = (cfg.seed + k * 7919) % 2147483647;
    let lv; try { lv = generateLevel({ ...cfg, seed, computeOptimal: true, maxAttempts: 300 }); }
    catch (e) { continue; }
    const r = rate(lv, SCREEN, 101 + k);
    if (fit(r, b) < 0.9) continue;             // bo som cho re
    cands.push({ seed, r, par: lv.difficulty.parMoves, lv });
  }
  // Xac nhan ky tren nhung ung vien qua vong so loai; par nho hon luon thang.
  const short = cands.sort((a, x) => a.par - x.par).slice(0, 14);
  for (const c of short) c.r = rate(c.lv, CONFIRM, 999);
  short.sort((a, x) => fit(x.r, b) - fit(a.r, b) || a.par - x.par);
  const w = short[0];
  if (!w) { console.log(`L${L}: KHONG tim duoc ung vien nao`); continue; }
  const row = table.find((t) => t.level === L);
  console.log(`L${L} ${cfg.tier}: cu seed=${row.seed} par=${row.par} thua=${(row.rate*100).toFixed(0)}% fit=${row.fit.toFixed(2)}`
            + `  ->  moi seed=${w.seed} par=${w.par} thua=${(w.r*100).toFixed(0)}% fit=${fit(w.r,b).toFixed(2)}  [${cands.length}/${SEEDS} qua so loai]`);
  const better = fit(w.r, b) > row.fit + 1e-9 || (fit(w.r, b) >= row.fit - 1e-9 && w.par < row.par);
  if (better) {
    Object.assign(row, { seed: w.seed, rate: w.r, par: w.par,
      moveLimit: w.lv.rules && w.lv.rules.moveLimit, fit: fit(w.r, b) });
    console.log(`   -> nhan seed moi`);
  } else console.log(`   -> giu seed cu`);
}
writeFileSync('tools/levels50.json', JSON.stringify(table, null, 2));
console.log('DA CAP NHAT tools/levels50.json');
