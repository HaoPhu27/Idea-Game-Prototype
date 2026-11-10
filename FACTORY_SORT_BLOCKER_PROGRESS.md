# Factory Sort blocker checkpoint — 2026-11-09

Branch: new-mechanic. Do NOT merge main/master or deploy Pages. User explicitly forbids adding mechanics to existing campaign levels.

## Ready for continued verification
- Eight blocker mechanics with nine single scenarios (two Locked variants), new BlockerRules.js and BlockerLevels.js.
- UI masking/badges/ice/held queue, help chooser, retry scenario retention; upcoming dedicated Mechanic Lab overlay in worker task.
- Nested public schema normalized to typed runtime. One frozen/hidden slot per box in initial contract; reject unsupported combinations rather than silently drop metadata.
- All nine real GameEngine reference replays WON after core fixes.
- Existing npm test, build, art/audio, nonblocking-feedback and booster UI checks passed. Browser Hidden Item completed; Connector pair played through dispatch with no console errors.
- Campaign generator, curve and curated seed files unchanged.

## Not yet accepted
- Dedicated blocker regression test: prior worker outputs rejected for invalid format/wrong fixtures. Corrected compact test in progress.
- Six combinations requested by user are in coding, not accepted: combo-key; combo-sticky-oneway; combo-hidden-urgent; combo-connector-queue; combo-frozen-colors; combo-stuck-priority.
- Dedicated Mechanic Lab menu for singles/combos in coding. Current temporary chooser is in Help.
- Combo tests, full browser/phone checks and final build required after integration.
- Original feedback-engine-test.js still fails its inherited transient-nodes fixture (not introduced here). See FACTORY_SORT_HANDOFF.md for previous feedback WIP.

## Workers and continuation
Actual River/Lite API wrapper/config are outside repository under C:/Users/XGame/Documents/Codex/2026-11-02/set/outputs/ai-workers/. Never commit keys. Lite key updated from user, but gateway returns service failure even for one-line request; River implementing fallback.

Ignored prompts/responses: Factory Sort/.ai-logs/blockers/. Rejected core v1/v2 and initial test outputs must NOT be integrated. Integrated core: core-v4-clean.json plus core-fixes-clean.json; render-v2-clean.json; ui-v2-clean.json; ui-fixes-clean.json (skip invalid index.html replacement).

Pending results: combo.json (core/levels/tests), lab-ui.json (dedicated overlay), test-final.js (compact ESM regression suite). Primary must read/diagnose every output, apply with strict path/unique match guards, run actual tests; worker does not test/review.

Stop instruction: check get_usage_limits between stages; stop ALL work/workers at 5h usedPercent>=50. Latest checkpoint 37%. Save progress and push ONLY new-mechanic. main/master must remain unchanged.

## STOP checkpoint — reached 50% of 5h window
Feature work and workers stopped at usedPercent=50. Local test server stopped. No background coding workers remain.

- NEW verified: tools/blocker-test.js passes all 10 groups, including all9 independent real-engine replays, matching conservation, both locks, freeze/local timers, stuck, defective-only waiting, atomic connector, hidden token tracking, urgent/reset, invalid start rollback, booster refusal and nested schema. package test now includes this suite; test:blockers provided.
- Browser verified Hidden Item WON, Connector WON, and Frozen thawed while global timer remained02:00 duringFreeze; no consoleerrors in those checks.
- Application source/build remains the tested single-blocker checkpoint. Dedicated Lab overlay and six combos are NOT integrated/accepted. Their portable drafts and exact continuation cautions are under Factory Sort/docs/blocker-drafts/README.md.
- No campaign generator/curve/seed edits. main remains0ed76f0; master remainsa019d29. Onlynew-mechanic pushed. Never merge/deploy until user authorizes.
- Originalfeedback-engine fixture failure remains separate. Full combined npm test should be rerun nextsession after anyadditionalappchanges; appbuild alreadypassed beforehalt, onlytests/docs addedafterthatbuild.

## 2026-11-10 — Theme integration and separate Pages preview

DeepSeek-only API policy is persisted globally and in repository AGENTS.md. River, Lite and Lite2 authored implementation through their external DeepSeek API providers. Main agent reviewed, integrated and tested.

Implemented Candy/Food runtime switch with persistence, 32 mapped item assets per theme, themed environment, tutorial names and standalone embedded PNGs. The asset review folder includes GPT and Agy Candy/Food alternatives (128 individual item PNGs). Runtime selects the coherent GPT set.

Mechanic Lab remains separate from existing campaign levels: nine single scenarios and six authored combination demonstrations. No campaign generator/seed/curve changes. Combo tier labels are design targets; no claim of calibrated 500-level progression.

Publication uses gh-pages based on master with only previews/new-mechanic/FactorySort.html and launcher entry additions. Source stays new-mechanic; main/master are not merged. Existing game artifacts on the publishing branch are preserved.

Verified: source and standalone theme switch/persistence, tutorial names, PNG embedding, 320px width without horizontal overflow, preview loaded through launcher; theme/booster/blocker regression and build. Remaining state and exact commits are recorded in Git history; public deployment is checked at handoff. Existing optional feedback-engine-test previously failed and is outside required regression; not represented as resolved.

Final required checks PASS: npm test, node tools/theme-test.js, npm run test:ui, npm run build (2026-11-10).
