/**
 * Chon 50 level tot nhat: voi moi level, quet nhieu seed va giu seed nao rot
 * dung vao BANG DO KHO MUC TIEU cua tier do.
 *
 * Do kho = ty le THUA cua chinh sach "smart" (GameSim): nguoi choi khong bao gio
 * pham loi hien nhien nhung KHONG nhin truoc thu tu Khay va KHONG suy luan ve cot
 * bi che. Van nao no van thua la van doi hoi LAP KE HOACH THAT — dung thu "kho"
 * ma ta muon, khac han voi "ban to, choi lau".
 *
 * Tie-break luon uu tien PAR NHO HON: kho chu khong phai ton thoi gian.
 */
import { generateLevel, configForLevelNumber } from '../src/generator/SolvableLevelGenerator.js';
import * as G from '../src/generator/GameSim.js';

const SEEDS = 72;        // so seed quet moi level
const SCREEN = 16;       // so van o vong so loai
const CONFIRM = 60;      // so van o vong xac nhan

// [thap, cao] ty le thua mong muon. Diem cang cao khi cang gan giua khoang.
function band(L, tier) {
  if (tier === 'onboarding')  return [0, 0];
  if (tier === 'acclimation') { const t = (L - 11) / 9; return [0, 0.05 + 0.15 * t]; }
  if (tier === 'normal')      { const t = Math.min(1, (L - 21) / 28); return [0.08 + 0.05 * t, 0.15 + 0.15 * t]; }
  if (tier === 'hard')        return [0.55, 0.75];
  return [0.80, 0.95];     // superhard
}

function rate(lv, trials, seed) {
  const ci = G.buildCatIndex(lv), rng = G.mulberry32(seed);
  let lost = 0;
  for (let t = 0; t < trials; t++)
    if (!G.playout(G.stateFromLevel(lv), ci, 'smart', rng, 400).won) lost++;
  return lost / trials;
}

// Diem: trong bang = 1.0; ngoai bang giam dan. Thap hon can duoi bi phat nang hon
// vuot can tren, vi level de qua thi hong tier, con kho qua thi van "kho nhung hay".
function fit(r, [lo, hi]) {
  if (r >= lo && r <= hi) return 1;
  return r < lo ? Math.max(0, 1 - (lo - r) * 4) : Math.max(0, 1 - (r - hi) * 1.5);
}

const out = [];
for (let L = 1; L <= 50; L++) {
  const cfg = configForLevelNumber(L);
  const b = band(L, cfg.tier);
  const cands = [];
  for (let k = 0; k < SEEDS; k++) {
    const seed = (cfg.seed + k * 7919) % 2147483647;
    let lv;
    try { lv = generateLevel({ ...cfg, seed, computeOptimal: true, maxAttempts: 300 }); }
    catch (e) { continue; }
    const r = rate(lv, SCREEN, 101 + k);
    cands.push({ seed, r, par: lv.difficulty.parMoves, lv });
    if (cfg.tier === 'onboarding' && r === 0 && cands.length >= 6) break;
  }
  cands.sort((a, x) => fit(x.r, b) - fit(a.r, b) || a.par - x.par);
  const short = cands.slice(0, 6);
  for (const c of short) c.r = rate(c.lv, CONFIRM, 999);
  short.sort((a, x) => fit(x.r, b) - fit(a.r, b) || a.par - x.par);
  const w = short[0];
  out.push({ level: L, tier: cfg.tier, seed: w.seed, rate: w.r, par: w.par,
             numBoxes: cfg.numBoxes, visibleRows: cfg.visibleRows,
             conveyorMaxActive: cfg.conveyorMaxActive,
             moveLimit: w.lv.rules && w.lv.rules.moveLimit, fit: fit(w.r, b) });
  console.log(`L${String(L).padStart(2)} ${cfg.tier.padEnd(11)} seed=${String(w.seed).padStart(10)} par=${String(w.par).padStart(2)} thua=${(w.r*100).toFixed(0).padStart(3)}% (muc tieu ${(b[0]*100).toFixed(0)}-${(b[1]*100).toFixed(0)}%) fit=${fit(w.r,b).toFixed(2)} [${cands.length} seed]`);
}
import { writeFileSync } from 'fs';
writeFileSync('tools/levels50.json', JSON.stringify(out, null, 2));
console.log('DA GHI tools/levels50.json');
