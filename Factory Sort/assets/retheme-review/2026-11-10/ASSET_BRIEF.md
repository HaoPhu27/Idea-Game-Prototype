# Asset brief — Candy and Food, two independent authors

Date: 2026-11-10. User requests BOTH GPT and Agy create BOTH Candy and Food themes, complete reusable game asset sets and visual review. Do not retheme live game before visual review. Existing mechanic work remains assigned to River/Lite. Only new-mechanic may be pushed; campaign/main/master/Pages unchanged.

## Deliverable matrix
Each author produces Candy + Food. For EACH theme:
1. 32 distinct readable item sprites (8 families x4 silhouettes), transparent item atlas, no text/logos/brands. Not palette-only duplicates. Consistent front/top 3/4 camera, upper-left light, readable at40px, generous padding, central mass. Catalog remains32 logical IDs; cosmetic mapping must not change matching or solver.
2. Environment/UI asset sheet: quiet background, conveyor straight/corner/oval components, queue normal/extra slots, open3slot box, wrappedbox, tray empty/filled, top HUD/buttons/panels, win/lose, selected/invalid/disabled states, four booster icons Freeze/Shuffle/Extra/Remove; all blocker overlays (lock/key, ice, stuck lid, defect, connector, hidden cover/item?, urgent timer, sticky pair, one-way arrow, restricted queue, swap, priority star). Reusable modular elements, not baked gameplay text.
3. Theme/gameplay view showing actual3columns and5queue(+extra) layout, highcontrast items againstquietbackground, timer notobscured. Optional reviewboard can arrange assets; do not mislabel a board as runtime-readyindividualsprites.
4. Manifest with filenames, item names, state coverage, palette, mapping/proposed atlascoordinates, source prompts, license/provenance own-generation, QA status. No missing blocker needed byLab.

## Scaling 500 levels
500 levels do NOT require500unique backgrounds. Use32 distinguishable itemtypes x500 board permutations; maintain stable logicalIDs. Author at least8 background/palette chapter variants or a modular variation specification (explicitly label which variants actuallyrendered). Chaptervariants mustnotreplace silhouettes with merecolorchanges as itemidentity. Core assets reusable; global/cellstates overlays independent. Level balance/solvability and content for500levels are separate from artpack capacity; do not claim500levels generated/tested.

## Item catalog common for fair comparison
Candy32: spiral lollipop, heart lollipop, star lollipop, candy cane; twistwrapped bonbon, round truffle, square praline, striped toffee; gummy bear, gummy ring, gummy worm, gummy peach; jelly bean, sugar drop, candy corn, mint disc; pink macaron, cream wafer, chocolate sandwich cookie, butter biscuit; sprinkle donut, strawberry cupcake, cake roll, berry tart; popsicle, icecream cone, sundae cup, mochi ball; chocolate bar, peanut brittle, fudge cube, marshmallow twist.
Food32: apple, orange, strawberry, pear; broccoli, carrot, corn cob, mushroom; fried egg, croissant, pancake stack, toast; burger, pizza slice, taco, hotdog; sushi roll, dumpling, rice ball, noodle bowl; chicken drumstick, steak, shrimp, salmon fillet; fries carton, pretzel, sandwich, soup bowl; milk carton, juice bottle, tea cup, smoothie glass.

## Art directions
GPT: polished soft3D casual mobile style, tactile glossy confectionery, boldclean silhouettes, controlled highlights, cream/mint/raspberry Candy; warmcream/tomato/basil Food.
Agy: independent premium casual direction, charming sculpted/matte-toy forms, softbevels, cream/berry/pistachio Candy; cozy bakery/market warmcream/coral/leaf Food. Do not copy GPT outputs; compare independentchoices.

Production notes: atlas alignment/alpha and small-size recognizability must be checked. Only rendered/exported files count as delivered. Record conceptreview vs sliced/runtime-ready honestly. No code authored byGPT; gallery/packing scripts ifneeded must be written by workers. Image generation byGPT andAgy explicitly requested byuser.
