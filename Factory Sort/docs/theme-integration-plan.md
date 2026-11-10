# Factory Sort — Candy/Food integration

## Implementation plan and ownership

The coordinator inspected the renderer, asset manifests, standalone builder and Pages source before dispatching independent implementation to DeepSeek API workers.

1. River: add ThemeManager, map the 32 existing ItemCatalog IDs in catalog order to the 32 Candy PNGs and 32 Food PNGs in the GPT manifest; preserve all engine IDs. Route ItemArt through the selected theme and embed all 64 PNGs in the standalone build.
2. Lite: add accessible Kẹo / Đồ ăn controls and theme palettes for the background, cartons, conveyor, queue, HUD and modals. Preserve blocker covers and hit areas.
3. Lite2: connect controls and persistence events; retain item identity in animation/drag elements; update tutorial labels and add a separate launcher preview entry.
4. Coordinator: review literal worker changes, run automated checks, inspect source/standalone/320px layout and publish a separate preview.

## Runtime contract

Default theme is Candy. Selection is stored under factory-sort-theme. Switching updates presentation in place, including data-item-id elements; it does not regenerate the level, reset moves, change the timer or mutate the engine. Masked and concealed content remains concealed. Existing SVG artwork remains a fallback for legacy non-DOM callers.

Runtime item artwork uses GPT Candy v2 and Food v1 individual PNG exports. Agy alternatives remain in the review gallery. UI atlas sheets and gameplay concept images are review material; they are not pasted over the interactive board. Environment surfaces are styled with CSS. Existing booster icons and mechanic badges are retained.

## Level isolation

Mechanics remain in Mechanic Lab (nine single scenarios and six combinations). Campaign generator, seeds and difficulty curve remain unchanged. The six combination levels are introductory demonstrations; their tier labels are design targets, not a measured difficulty calibration. Reusable art supports future content expansion; this update does not create or balance 500 levels.

## Publication

Source work stays on new-mechanic. Existing Pages was master/root. A separate gh-pages publication branch is based on master and adds only the preview standalone plus its launcher menu entry. Existing game artifacts remain unchanged; neither main nor master receives a mechanic merge. Preview path: previews/new-mechanic/FactorySort.html.

## Coordinator verification

Verified theme mapping and persistence tests, booster UI tests, source and standalone switches, embedded PNG data URLs, tutorial labels, responsive width 320px without horizontal overflow, and launcher loading the preview in its iframe. Full regression/build and the public Pages URL are checked before final handoff. Broader mobile/device and in-flight animation stress testing remain follow-up coverage, not claimed here.
