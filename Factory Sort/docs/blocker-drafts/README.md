# Unaccepted worker drafts — STOP at 50%

These files are archived for continuation, NOT imported by the game or build. Do not treat their presence as accepted features.

- combo-clean.json: complete first three worker files and three minimal replacements recovered from a truncated JSON response. Primary reviewed core and identified urgent timer/Extra queue capacity/booster proof problems. NOT integrated. Missing final build entry must come from fixes. Tests not yet run.
- combo-fixes.json: worker follow-up for those bugs; NOT reviewed or applied.
- lab-ui-clean.json: dedicated Mechanic Lab overlay/cards, nine singles/six combos; reviewed draft, NOT applied because combo module is not accepted. Paths src/ui/* need mapping to ab_test/src/ui/*. Samefrom/to CSS no-op can skip. Its z-index120 is below existing overlays2000; apply only reviewed fix.
- lab-css.json: follow-up z-index/font patch. Contains unused invented selectors in one media rule; review rather than blindly apply.
- header-fix.json: proposed two-row header layout to keep timer visible beside added Lab button. Not applied or browser-tested.

Next: inspect/apply necessary combo fixes, review full combo transaction/timer behavior, integrate on new-mechanic, run all six traces and dedicated tests, then integrate Lab UI and verify desktop/320px. Existing campaign must not change. Do not merge main/master or deploy Pages.

No worker credentials or request headers are archived here. Actual API configuration remains outside repository.
