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
