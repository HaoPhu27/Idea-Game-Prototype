/**
 * curate50.mjs — chon 50 seed chinh thuc: voi moi level, quet nhieu seed va giu seed
 * nao rot dung vao BANG DO KHO MUC TIEU cua tier do.
 *
 * Chay: node tools/curate50.mjs [> tools/levels50.json]
 *
 * VI SAO CAN BUOC NAY
 * -------------------
 * configForLevelNumber chi quyet dinh KHUNG cua mot man (bao nhieu Thung, cua so Khay
 * rong bao nhieu, may hang duoc nhin thay). Hai man cung khung ma khac seed lech nhau
 * rat xa: do tren khung hard (52 Thung), 16 seed cho ty le thua tu 25% den 85%.
 * Seed moi la thu quyet dinh item bi rai the nao va Khay doi theo thu tu nao.
 *
 * THUOC DO DO KHO = TY LE THUA CUA CHINH SACH "planner" (GameSim)
 * --------------------------------------------------------------
 * `planner` la nguoi choi cham chi nhung KHONG tim kiem: no nhin cua so Khay dang chay
 * va so slot con trong cua hang cho (hai thu hien ngay tren man hinh), khong bao gio
 * pham loi hien nhien, nhung KHONG nhin duoc Thung bi che va KHONG suy luan nhieu buoc.
 * Van nao no van thua la van doi hoi LAP KE HOACH THAT.
 *
 * (Ban truoc do bang chinh sach "smart" — khong biet gi ve hang cho. Ke tu khi GameSim
 * mo hinh dung luat "Thung goi xong roi khoi cot va chiem 1 trong 5 slot hang cho",
 * smart thua gan 100% o moi man lon nen khong con phan biet duoc tier nua.)
 *
 * Tie-break luon uu tien PAR NHO HON: kho chu khong phai ton thoi gian.
 */
import { generateLevel, configForLevelNumber } from '../src/generator/SolvableLevelGenerator.js';
import * as G from '../src/generator/GameSim.js';

const SEEDS = Number(process.env.SEEDS || 40);    // so seed quet moi level
const SCREEN = Number(process.env.SCREEN || 16);  // so van o vong so loai
const CONFIRM = Number(process.env.CONFIRM || 40);// so van o vong xac nhan

// Quet lai chi mot vai level voi be seed rong hon:
//   LEVELS=25,35,45 SEEDS=400 node tools/curate50.mjs
// (Cac level khong duoc liet ke van in ra seed dang dung de bang ket qua con day du.)
const ONLY = process.env.LEVELS
  ? new Set(process.env.LEVELS.split(',').map((x) => Number(x.trim())))
  : null;

/** [thap, cao] ty le thua mong muon. Diem cang cao khi cang gan giua khoang. */
function band(L, tier) {
  if (tier === 'tutorial') return [0, 0];
  if (tier === 'onboarding') return [0, 0.05];
  if (tier === 'acclimation') { const t = (L - 11) / 9; return [0, 0.06 + 0.12 * t]; }
  if (tier === 'normal') { const t = Math.min(1, (L - 21) / 28); return [0.12 + 0.10 * t, 0.28 + 0.14 * t]; }
  if (tier === 'hard') return [0.60, 0.80];
  return [0.88, 0.98];   // superhard
}

function lossRate(lv, trials, seed) {
  const ci = G.buildCatIndex(lv), rng = G.mulberry32(seed);
  const maxSteps = Math.max(600, lv.boxes.length * 12);
  let lost = 0;
  for (let i = 0; i < trials; i++) {
    if (!G.playout(G.stateFromLevel(lv), ci, 'planner', rng, maxSteps).won) lost++;
  }
  return lost / trials;
}

/** 0 = ngoai khoang, 1 = dung giua khoang. */
function fit(rate, [lo, hi]) {
  if (rate < lo || rate > hi) return 0;
  if (hi === lo) return 1;
  const mid = (lo + hi) / 2;
  return 1 - Math.abs(rate - mid) / ((hi - lo) / 2) * 0.5;
}

const chosen = {};
const report = [];
const t0 = Date.now();

for (let L = 1; L <= 50; L++) {
  const base = configForLevelNumber(L);
  const target = band(L, base.tier);
  let best = null;

  for (let k = 0; ONLY && !ONLY.has(L) ? false : k < SEEDS; k++) {
    const seed = ((k + 1) * 2654435761) % 2147483647;
    let lv;
    try { lv = generateLevel({ ...base, seed }); } catch { continue; }

    const screen = lossRate(lv, SCREEN, 4242);
    // Bo som cac seed lech han khoi khoang (tiet kiem vong xac nhan dat tien).
    if (screen < target[0] - 0.2 || screen > target[1] + 0.2) continue;

    const rate = lossRate(lv, CONFIRM, 777);
    const f = fit(rate, target);
    const cand = { seed, rate, f, par: lv.difficulty.parMoves, score: lv.difficulty.score,
                   open: lv.difficulty.openingSets };
    if (!best || f > best.f || (f === best.f && cand.par < best.par)) best = cand;
    if (best.f > 0.97) break;   // du tot roi, khong can quet tiep
  }

  if (!best) {
    // Khong quet (bi LEVELS loc ra) hoac khong seed nao vao khoang: do lai seed dang
    // dung — base.seed chinh la seed trong LEVEL_SEEDS — de bang ket qua van day du.
    const lv = generateLevel(base);
    const rate = lossRate(lv, CONFIRM, 777);
    best = { seed: base.seed, rate, f: fit(rate, target),
             par: lv.difficulty.parMoves, score: lv.difficulty.score,
             open: lv.difficulty.openingSets };
  }

  chosen[L] = best.seed;
  report.push({ L, tier: base.tier, box: base.numBoxes, ...best, target });
  console.error(
    `L${String(L).padStart(2)} ${base.tier.padEnd(11)} box=${String(base.numBoxes).padStart(2)} ` +
    `thua=${(best.rate * 100).toFixed(0).padStart(3)}% muc tieu=[${(target[0] * 100).toFixed(0)}-${(target[1] * 100).toFixed(0)}] ` +
    `fit=${best.f.toFixed(2)} par=${String(best.par).padStart(3)} open=${best.open} seed=${best.seed}`
  );
}

console.error(`\nxong sau ${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.error('\n--- dan doan vao LEVEL_SEEDS trong SolvableLevelGenerator.js ---');
const lines = [];
for (let L = 1; L <= 50; L++) {
  if (L % 5 === 1) lines.push('  ');
  lines[lines.length - 1] += `${L}: ${chosen[L]}, `;
}
console.error(lines.map((x) => x.trimEnd()).join('\n'));

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), policy: 'planner',
                             seeds: chosen, report }, null, 2));
