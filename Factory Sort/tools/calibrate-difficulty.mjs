/** Offline authoring only. Holdout outcomes never participate in seed selection. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { generateLevel, configForLevelNumber } from '../ab_test/src/generator/SolvableLevelGenerator.js';
import { LEVEL_SEEDS } from '../ab_test/src/generator/CuratedLevelSeeds.js';
import * as G from '../ab_test/src/generator/GameSim.js';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const value = argv.find(x => x.startsWith(`--${name}=`));
  return value ? value.slice(name.length + 3) : fallback;
};
const integer = (name, fallback, minimum = 1) => {
  const value = Number(arg(name, fallback));
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`--${name} must be an integer >= ${minimum}`);
  return value;
};
const candidates = integer('candidates', 64);
const screenTrials = integer('screen', 24);
const confirmTrials = integer('confirm', 128);
const confirm2Trials = integer('confirm2', 96);
const holdoutTrials = integer('holdout', 256);
const shortlistSize = integer('shortlist', 8);
const seedOffset = integer('seed-offset', 0, 0);
const screenSeed = integer('screen-seed', 4242, 0);
const confirmationSeed = integer('confirm-seed', 17777, 0);
const confirmation2Seed = integer('confirm2-seed', 117777, 0);
const holdoutSeed = integer('holdout-seed', 900091, 0);
if (new Set([screenSeed, confirmationSeed, confirmation2Seed, holdoutSeed]).size !== 4) {
  throw new Error('Screen, both confirmations and holdout require distinct RNG seeds.');
}
const selected = arg('levels', '').split(',').filter(Boolean).map(Number);
if (selected.some(x => !Number.isInteger(x) || x < 1 || x > 50)) throw new Error('--levels requires campaign levels 1..50');
const only = selected.length ? new Set(selected) : null;
const write = argv.includes('--write');
const evaluateOnly = argv.includes('--evaluate-only');
const baselinePath = arg('baseline-report', null);
const baseline = baselinePath ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;
const bands = {
  tutorial: [0, 0], onboarding: [0, 0.05], acclimation: [0, 0.25],
  normal: [0.10, 0.35], hard: [0.50, 0.80], superhard: [0.82, 0.96],
};
const loopLimit = tier => tier === 'superhard' ? 0.15 : 0.10;

function counts(trials, wins, dead, loops) {
  return { trials, wins, dead, loops, winRate: wins / trials,
    deadRate: dead / trials, unresolvedRate: loops / trials };
}
function measure(level, trials, seed) {
  const rng = G.mulberry32(seed), state = G.stateFromLevel(level), cat = G.buildCatIndex(level);
  const maxSteps = Math.max(600, level.boxes.length * 12);
  let wins = 0, dead = 0, loops = 0;
  for (let n = 0; n < trials; n++) {
    const r = G.playout(state, cat, 'planner', rng, maxSteps, { recordTrail: false });
    if (r.won) wins++;
    else if (r.dead) dead++;
    else loops++;
  }
  return counts(trials, wins, dead, loops);
}
const combine = (a, b) => counts(a.trials + b.trials, a.wins + b.wins, a.dead + b.dead, a.loops + b.loops);
function reasons(metrics, tier) {
  const [lo, hi] = bands[tier], out = [];
  if (metrics.deadRate < lo) out.push('true-dead-rate-below-band');
  if (metrics.deadRate > hi) out.push('true-dead-rate-above-band');
  if (metrics.unresolvedRate > loopLimit(tier)) out.push('unresolved-rate-above-limit');
  return out;
}
const targetMet = (metrics, tier) => reasons(metrics, tier).length === 0;
function fit(metrics, tier) {
  const [lo, hi] = bands[tier], mid = (lo + hi) / 2;
  const outside = Math.max(lo - metrics.deadRate, metrics.deadRate - hi, 0);
  // A loop is unresolved, never a proven failure. Penalize uncertainty separately.
  return outside * 10 + Math.abs(metrics.deadRate - mid) + metrics.unresolvedRate * 2
    + Math.max(0, metrics.unresolvedRate - loopLimit(tier)) * 10;
}
function fingerprint(level) {
  // Ignore IDs and timer changes: the same puzzle remains a duplicate board.
  return createHash('sha256').update(JSON.stringify({
    boxes: level.boxes.map(b => b.items),
    columns: level.layout.columns, visibleRows: level.layout.visibleRows,
    trays: level.trays.map(t => t.targetItemId), maxActive: level.conveyor.maxActive,
  })).digest('hex');
}
const seeds = { ...LEVEL_SEEDS }, report = [], seenBoards = new Map();
for (let L = 1; L <= 50; L++) {
  // TutorialManager explicitly teaches penguin 1->0, then bear 3->2.
  // Its seed is a gameplay contract, not a candidate for difficulty curation.
  const cfg = { ...configForLevelNumber(L), ...(L === 1 ? { seed: 506952114 } : {}) }, tier = cfg.tier;
  const existing = generateLevel(cfg);
  let chosen = { level: existing, seed: cfg.seed, fingerprint: fingerprint(existing) };
  let rejectedCandidates = 0, duplicateCandidates = 0, screenedCandidates = 0;
  let selectionReason = evaluateOnly ? 'evaluate-existing-seed-only' : 'unselected-level-existing-seed';
  const candidateReport = [];
  if (L === 1 || (!evaluateOnly && (!only || only.has(L)))) {
    const pool = [], seen = new Set();
    for (let k = 0; k < (L === 1 ? 1 : candidates); k++) {
      const seed = k === 0 ? cfg.seed : (((seedOffset + k) * 2654435761) % 2147483647);
      if (seen.has(seed)) continue;
      seen.add(seed);
      try {
        const level = k === 0 ? existing : generateLevel({ ...cfg, seed });
        const board = fingerprint(level);
        if (seenBoards.has(board)) { duplicateCandidates++; continue; }
        const screen = measure(level, screenTrials, screenSeed);
        screenedCandidates++;
        pool.push({ level, seed, fingerprint: board, screen, screenFit: fit(screen, tier) });
      } catch (error) {
        rejectedCandidates++;
        console.error(`L${L} rejected seed ${seed}: ${error.message}`);
      }
    }
    pool.sort((a, b) => a.screenFit - b.screenFit || a.seed - b.seed);
    // Two independent streams confirm candidates. Holdout is evaluated only later.
    for (const candidate of pool.slice(0, shortlistSize)) {
      candidate.confirm = measure(candidate.level, confirmTrials, confirmationSeed);
      candidate.confirm2 = measure(candidate.level, confirm2Trials, confirmation2Seed);
      candidate.confirmCombined = combine(candidate.confirm, candidate.confirm2);
      candidate.confirmFit = fit(candidate.confirmCombined, tier);
    }
    const shortlist = pool.filter(c => c.confirm);
    shortlist.sort((a, b) => Number(targetMet(b.confirmCombined, tier)) - Number(targetMet(a.confirmCombined, tier))
      || a.confirmFit - b.confirmFit || a.seed - b.seed);
    if (!shortlist.length) throw new Error(`L${L}: no distinct verified candidate; broaden --candidates or --seed-offset`);
    chosen = shortlist[0];
    selectionReason = L === 1 ? 'scripted-tutorial-contract'
      : targetMet(chosen.confirmCombined, tier)
        ? 'qualified-two-confirmation-streams-best-fit-distinct-board'
        : 'closest-unqualified-confirmation-explicitly-reported';
    for (const c of shortlist) candidateReport.push({ seed: c.seed, selected: c === chosen,
      fingerprint: c.fingerprint, screen: c.screen, confirmation: c.confirm, confirmation2: c.confirm2,
      confirmationCombined: c.confirmCombined, fit: c.confirmFit,
      qualified: targetMet(c.confirmCombined, tier), qualificationReasons: reasons(c.confirmCombined, tier) });
  }
  const duplicateOf = seenBoards.get(chosen.fingerprint) ?? null;
  if (duplicateOf === null) seenBoards.set(chosen.fingerprint, L);
  const holdout = measure(chosen.level, holdoutTrials, holdoutSeed);
  seeds[L] = chosen.seed;
  const lv = chosen.level;
  const before = baseline?.report?.find(r => (r.level ?? r.L) === L);
  const row = {
    level: L, tier, seed: chosen.seed, target: bands[tier],
    config: lv.config, difficulty: lv.difficulty, timerBudget: lv.rules.timerBudget,
    structuralPacing: lv.difficulty.orderPacing ?? null,
    visibleFreeSlots: lv.difficulty.visibleFreeSlots,
    referenceReplayVerified: lv.solvable && lv.solvabilityProof.includes('verified'),
    diversity: { fingerprint: chosen.fingerprint, duplicateOf, duplicateCandidates },
    selection: { reason: selectionReason, screenedCandidates, rejectedCandidates,
      confirmationQualified: chosen.confirmCombined ? targetMet(chosen.confirmCombined, tier) : null,
      confirmationQualificationReasons: chosen.confirmCombined ? reasons(chosen.confirmCombined, tier) : [],
      shortlist: candidateReport },
    screen: chosen.screen ?? null, confirmation: chosen.confirm ?? null,
    confirmation2: chosen.confirm2 ?? null, confirmationCombined: chosen.confirmCombined ?? null,
    holdout, targetMet: targetMet(holdout, tier), targetReasons: reasons(holdout, tier),
    ...(before ? { baseline: { seed: before.seed, holdout: before.holdout ?? null,
      note: 'Historical comparison only; differing generator or sampling settings are not controlled A/B evidence.' } } : {}),
  };
  report.push(row);
  console.error(`L${String(L).padStart(2)} ${tier.padEnd(11)} seed=${chosen.seed} `
    + `holdout won/dead/unresolved=${holdout.wins}/${holdout.dead}/${holdout.loops} `
    + `targetMet=${row.targetMet} distinct=${duplicateOf === null} timer=${lv.rules.timeToPlay ?? 'off'}s`);
}

const summary = {};
for (const row of report) {
  const s = summary[row.tier] ??= { levels: 0, trials: 0, wins: 0, dead: 0, unresolved: 0,
    targetsMet: 0, duplicateBoards: 0, confirmationQualified: 0 };
  s.levels++; s.trials += row.holdout.trials; s.wins += row.holdout.wins;
  s.dead += row.holdout.dead; s.unresolved += row.holdout.loops;
  s.targetsMet += Number(row.targetMet); s.duplicateBoards += Number(row.diversity.duplicateOf !== null);
  s.confirmationQualified += Number(row.selection.confirmationQualified === true);
}
for (const s of Object.values(summary)) {
  s.winRate = s.wins / s.trials; s.deadRate = s.dead / s.trials;
  s.unresolvedRate = s.unresolved / s.trials;
}
const result = {
  version: 'difficulty-calibration-v3-paced', generatedAt: new Date().toISOString(),
  policy: 'planner', notes: 'Bot outcomes without timer; not measured human loss rates. Unresolved runs are not losses. Holdout is not used to select seeds. Timer budgets remain separate design assumptions.',
  sampling: { evaluateOnly, selectedLevels: selected.length ? selected : 'all', candidates,
    shortlistSize, seedOffset, screenTrials, confirmTrials, confirm2Trials, holdoutTrials,
    screenSeed, confirmationSeed, confirmation2Seed, holdoutSeed },
  seeds, summary, report,
};
if (write) {
  if (!evaluateOnly) writeFileSync(new URL('../ab_test/src/generator/CuratedLevelSeeds.js', import.meta.url),
    '// Offline-selected seeds; see tools/levels50.json for independent holdout outcomes.\n'
    + `export const LEVEL_SEEDS = ${JSON.stringify(seeds, null, 2)};\n`);
  writeFileSync(new URL('./levels50.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
if (argv.includes('--strict') && report.some(r => !r.targetMet || r.diversity.duplicateOf !== null)) process.exitCode = 1;
