/**
 * Compatibility entry point. Uses the current calibration/report schema.
 * node tools/curate50.mjs --write [--candidates=64 --screen=24 --confirm=128 --confirm2=96 --holdout=256]
 * Reports independent win/dead/unresolved outcomes; use --write to update both
 * CuratedLevelSeeds.js and levels50.json together. Do not redirect over the report.
 * --evaluate-only --write measures existing seeds without modifying the seed module.
 * Independent streams can be set with --screen-seed, --confirm-seed,
 * --confirm2-seed and --holdout-seed; --seed-offset broadens the candidate pool.
 */
console.error('[curate50] Delegating to calibrate-difficulty.mjs; use --write to update campaign seeds/report.');
await import('./calibrate-difficulty.mjs');
