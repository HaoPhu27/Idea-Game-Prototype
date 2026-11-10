# Factory Sort — Art Asset Manifest & Production Specification (Agy)

**Date**: 2026-11-10  
**Author**: Agy (Independent Production)  
**Target Scope**: CANDY & FOOD Complete Theme Packs + 500-Level Scaling Architecture  
**Directory**: `D:/game idea prototype/Factory Sort/assets/retheme-review/2026-11-10/agy/`  
**License & Provenance**: Bespoke original generation for Factory Sort. No copyrighted third-party brands, logos, or trademarks.

---

## 1. Executive Summary & Production Status

This delivery package provides two complete, independent theme packs (**Candy** and **Food**) authored by Agy for *Factory Sort*.

### 1.1 Art Style & Visual Identity
- **Agy Direction**: Charming sculpted matte-toy aesthetic with tactile soft bevels, clear central masses, and gentle directional top-left studio lighting.
  - **Candy Palette**: Soft cream, berry pink, pistachio mint, delicate lilac, and honey amber.
  - **Food Palette**: Cozy bakery/market warm cream, coral salmon, fresh leaf green, and golden toasted crust.
- **Micro-Readability**: Every item silhouette is engineered and tested for instant distinction at 40×40 px thumbnail resolution.
- **Quiet Backdrops**: Pastel and neutral warm surfaces keep the focus squarely on sorting targets.
- **Fair Independent Comparison**: Authoring was performed completely independently from GPT (GPT authored glossy/tactile mobile styling).

### 1.2 QA & Format Transparency (Honest Engineering Status)
> [!IMPORTANT]
> **Production & Alpha Extraction Realities**:
> 1. **Source Generation Masters**: All 6 primary source generation masters delivered into `agy/` are high-resolution **opaque JPEGs**. They are **not** pre-keyed runtime transparent PNGs.
> 2. **Alpha Extraction is Heuristic**: The border-connected floodfill implemented in `pack_assets.py` is an edge-based heuristic. **It cannot guarantee zero interior white alterations.** All light-colored assets (such as onigiri rice, dairy carton milk, fried egg white, vanilla ice cream scoop, and cupcake frosting) carry the status **`needs visual edge/white-object inspection`**.
> 3. **UI Sheets are Review Masters**: Environment/UI boards are **review masters**, designed as composite evaluation sheets rather than sliced, isolated runtime components.
> 4. **Decorative Relief Notice**: The chocolate sandwich cookie (`candy_19`) features an embossed "CREAM" lettering detail. This is a generic decorative relief texture depicting the filling type, not a trademarked brand name or commercial logo.
> 5. **Gameplay Mockups**: 9:16 portrait views are visual concept representations demonstrating readability and contrast; they are not playable game rethemes.

---

## 2. Source Master Files Registry

All 6 source master images are located directly inside `agy/`:

| Theme | Asset Type | Source Filename | Resolution | Description |
|:---|:---|:---|:---:|:---|
| **Candy** | Items Atlas (8×4) | `candy_items_atlas_1794278920398.jpg` | 1376×768 | 32 items, 8 families × 4 silhouettes, generous cell padding |
| **Candy** | Modular UI Sheet | `candy_environment_ui_1794278946705.jpg` | 1376×768 | Review master: tracks, boxes, trays, HUD, 4 boosters, blockers |
| **Candy** | Gameplay Mockup | `candy_gameplay_mockup_1794278972590.jpg` | 768×1376 | 9:16 portrait concept (3 columns, 5+1 queue slots) |
| **Food** | Items Atlas (8×4) | `food_items_atlas_1794278929764.jpg` | 1376×768 | 32 items, 8 families × 4 silhouettes, generous cell padding |
| **Food** | Modular UI Sheet | `food_environment_ui_1794278951537.jpg` | 1376×768 | Review master: tracks, wooden crates, trays, HUD, 4 boosters, blockers |
| **Food** | Gameplay Mockup | `food_gameplay_mockup_1794278976183.jpg` | 768×1376 | 9:16 portrait concept (3 columns, 5+1 queue slots) |

---

## 3. Item Catalog & Grid Coordinates (8×4 Atlas)

### 3.1 Candy Catalog (32 Items)

| Row | Col | Logical ID | Item Name | Family | Distinguishing Feature | Alpha QA Status |
|:---:|:---:|:-----------|:----------|:-------|:-----------------------|:----------------|
| 0 | 0 | `candy_01` | Spiral Lollipop | Lollipops | Swirled two-tone circular disc on stick | Sliced / Standard |
| 0 | 1 | `candy_02` | Heart Lollipop | Lollipops | Symmetrical puffy ruby berry heart | Sliced / Standard |
| 0 | 2 | `candy_03` | Star Lollipop | Lollipops | Chunky honey-amber five-point star | Sliced / Standard |
| 0 | 3 | `candy_04` | Candy Cane | Lollipops | Peppermint red/white striped crook | needs visual edge inspection |
| 0 | 4 | `candy_05` | Twistwrapped Bonbon | Hard Candy | Pinched cellophane fanned ends | Sliced / Standard |
| 0 | 5 | `candy_06` | Round Truffle | Hard Candy | Spherical cocoa-dusted truffle | Sliced / Standard |
| 0 | 6 | `candy_07` | Square Praline | Hard Candy | Sculpted pistachio cube with drizzle | needs visual edge inspection |
| 0 | 7 | `candy_08` | Striped Toffee | Hard Candy | Horizontal caramel layered block | Sliced / Standard |
| 1 | 0 | `candy_09` | Gummy Bear | Gummies | Translucent strawberry bear silhouette | Sliced / Standard |
| 1 | 1 | `candy_10` | Gummy Ring | Gummies | Split dual-color lemon-lime torus | Sliced / Standard |
| 1 | 2 | `candy_11` | Gummy Worm | Gummies | Ribbed undulating S-curve crawler | Sliced / Standard |
| 1 | 3 | `candy_12` | Gummy Peach | Gummies | Sugar-dusted warm coral peach slice | Sliced / Standard |
| 1 | 4 | `candy_13` | Jelly Bean | Drops | Glossy purple grape kidney bean form | Sliced / Standard |
| 1 | 5 | `candy_14` | Sugar Drop | Drops | Teardrop cone with crystalline facets | needs visual edge inspection |
| 1 | 6 | `candy_15` | Candy Corn | Drops | White, orange, yellow tri-band pyramid | needs visual edge inspection |
| 1 | 7 | `candy_16` | Mint Disc | Drops | Pale pistachio disc with leaf imprint | Sliced / Standard |
| 2 | 0 | `candy_17` | Pink Macaron | Bakery | Smooth rose dome with ruffled foot | needs visual edge inspection |
| 2 | 1 | `candy_18` | Cream Wafer | Bakery | Multi-layered vanilla cream wafer | needs visual edge inspection |
| 2 | 2 | `candy_19` | Choc Sandwich Cookie | Bakery | Dark scalloped biscuit with CREAM relief texture | needs visual edge inspection |
| 2 | 3 | `candy_20` | Butter Biscuit | Bakery | Fluted golden tea biscuit with dock holes | Sliced / Standard |
| 2 | 4 | `candy_21` | Sprinkle Donut | Pastry | Torus pastry with pink glaze & jimmies | Sliced / Standard |
| 2 | 5 | `candy_22` | Strawberry Cupcake | Pastry | Swirled buttercream swirl with cherry | needs visual edge inspection |
| 2 | 6 | `candy_23` | Cake Roll | Pastry | Golden sponge cake with chocolate spiral | needs visual edge inspection |
| 2 | 7 | `candy_24` | Berry Tart | Pastry | Fluted pastry shell with glazed berries | Sliced / Standard |
| 3 | 0 | `candy_25` | Popsicle | Frozen | Twin-stick frozen raspberry bar | Sliced / Standard |
| 3 | 1 | `candy_26` | Ice Cream Cone | Frozen | Cross-hatched waffle cone with scoop | Sliced / Standard |
| 3 | 2 | `candy_27` | Sundae Cup | Frozen | Fluted glass with soft serve & drizzle | needs visual edge inspection |
| 3 | 3 | `candy_28` | Mochi Ball | Frozen | Soft matcha dusted rice cake sphere | Sliced / Standard |
| 3 | 4 | `candy_29` | Chocolate Bar | Confection | 3×2 segmented snap-bar slab | Sliced / Standard |
| 3 | 5 | `candy_30` | Peanut Brittle | Confection | Angular honey caramel slab with nuts | Sliced / Standard |
| 3 | 6 | `candy_31` | Fudge Cube | Confection | Dense matte espresso fudge block | Sliced / Standard |
| 3 | 7 | `candy_32` | Marshmallow Twist | Confection | Pastel pink & cyan braided cylinder | needs visual edge inspection |

---

### 3.2 Food Catalog (32 Items)

| Row | Col | Logical ID | Item Name | Family | Distinguishing Feature | Alpha QA Status |
|:---:|:---:|:-----------|:----------|:-------|:-----------------------|:----------------|
| 0 | 0 | `food_01` | Apple | Fruits | Sculpted red apple with leaf stem | Sliced / Standard |
| 0 | 1 | `food_02` | Orange | Fruits | Textured citrus ball with leafy calyx | Sliced / Standard |
| 0 | 2 | `food_03` | Strawberry | Fruits | Conical berry with yellow seed dimples | Sliced / Standard |
| 0 | 3 | `food_04` | Pear | Fruits | Bell-shaped olive-yellow silhouette | Sliced / Standard |
| 0 | 4 | `food_05` | Broccoli | Veggies | Dense rounded floret cluster on stalk | Sliced / Standard |
| 0 | 5 | `food_06` | Carrot | Veggies | Tapered orange root with feathery top | Sliced / Standard |
| 0 | 6 | `food_07` | Corn Cob | Veggies | Golden kernel ear in partially peeled husk | Sliced / Standard |
| 0 | 7 | `food_08` | Mushroom | Veggies | Chunky brown dome cap with white stem | needs visual edge inspection |
| 1 | 0 | `food_09` | Fried Egg | Breakfast | Irregular white with domed yolk | needs visual edge inspection |
| 1 | 1 | `food_10` | Croissant | Breakfast | Golden-brown layered crescent | Sliced / Standard |
| 1 | 2 | `food_11` | Pancake Stack | Breakfast | Trio of golden hotcakes with butter pat | Sliced / Standard |
| 1 | 3 | `food_12` | Toast | Breakfast | Loaf slice with dark crust and grill marks | Sliced / Standard |
| 1 | 4 | `food_13` | Burger | Fast Food | Sesame bun, grilled patty, lettuce frill | Sliced / Standard |
| 1 | 5 | `food_14` | Pizza Slice | Fast Food | Cheese wedge with pepperoni slices | Sliced / Standard |
| 1 | 6 | `food_15` | Taco | Fast Food | Folded crispy corn shell with filings | Sliced / Standard |
| 1 | 7 | `food_16` | Hotdog | Fast Food | Split bun with sausage & mustard ribbon | Sliced / Standard |
| 2 | 0 | `food_17` | Sushi Roll | Asian | Black nori, white sushi rice, coral salmon | needs visual edge inspection |
| 2 | 1 | `food_18` | Dumpling | Asian | Pleated crescent potsticker seam | needs visual edge inspection |
| 2 | 2 | `food_19` | Rice Ball (Onigiri) | Asian | Triangle pearl rice wrapped with nori | needs visual edge inspection |
| 2 | 2 | `food_20` | Noodle Bowl | Asian | Ceramic bowl with broth, ramen, chopsticks | Sliced / Standard |
| 2 | 4 | `food_21` | Chicken Drumstick | Mains | Crisp golden-fried drumstick with bone | needs visual edge inspection |
| 2 | 5 | `food_22` | Steak | Mains | Thick seared steak with cross grill marks | Sliced / Standard |
| 2 | 6 | `food_23` | Shrimp | Mains | Curved blanched coral prawn with tail | Sliced / Standard |
| 2 | 7 | `food_24` | Salmon Fillet | Mains | Rectangular coral steak with white lines | needs visual edge inspection |
| 3 | 0 | `food_25` | Fries Carton | Sides | Red carton sleeve with tall golden fries | Sliced / Standard |
| 3 | 1 | `food_26` | Pretzel | Sides | Interlooped pretzel dough with salt | Sliced / Standard |
| 3 | 2 | `food_27` | Sandwich | Sides | Diagonal cut layered club sandwich | Sliced / Standard |
| 3 | 3 | `food_28` | Soup Bowl | Sides | Wide ceramic bowl with steaming broth | Sliced / Standard |
| 3 | 4 | `food_29` | Milk Carton | Drinks | Gable-top carton with dairy cow graphic | needs visual edge inspection |
| 3 | 5 | `food_30` | Juice Bottle | Drinks | Clear bottle filled with orange juice | Sliced / Standard |
| 3 | 6 | `food_31` | Tea Cup | Drinks | Pastel teacup and saucer with steam | needs visual edge inspection |
| 3 | 7 | `food_32` | Smoothie Glass | Drinks | Tall faceted glass with cream & straw | needs visual edge inspection |

---

## 4. Honest 14-Mechanics & Blockers Audit

The current UI review sheet contains **12 graphical asset representations**, with certain pairs sharing a visual asset:

| # | Mechanic ID | Display Name | Mechanism Category | Review Sheet State | Detailed Audit Notes |
|---|:---|:---|:---|:---:|:---|
| 1 | `lock` | Padlock | Container Gate | **COMBINED (Lock + Key)** | Rendered as a paired graphic with the key; requires manual slicing to produce independent gate overlay |
| 2 | `key` | Golden Key | Unlocker Item | **COMBINED (Key + Lock)** | Depicted beside lock badge rather than an isolated inventory sprite |
| 3 | `ice` | Ice Block | Cell Enclosure | **PRESENT** | Frosted ice cube with crack states clearly rendered |
| 4 | `stucklid` | Stuck Lid | Box State | **PRESENT** | Crossed packaging tape over box lid |
| 5 | `defect` | Defect / Hazard | Sort Hazard | **PRESENT** | Cracked candy / spoiled hazard mark |
| 6 | `connector` | Connector Chain | Coupling | **PRESENT** | Steel links physically chaining 2 boxes together |
| 7 | `hiddenbox` | Hidden Box | Container Cover | **SHARED COVER** | Represented by wrapped gift crate; shares conceptual cover role with hidden item |
| 8 | `hiddenitem` | Hidden Item (?) | Item Cover | **SHARED COVER** | Mystery dome / cloche with question mark; dedicated overlay requires separate slice |
| 9 | `urgent` | Urgent Timer | Countdown | **PRESENT** | Ticking alarm clock badge with warning indicator |
| 10 | `sticky` | Sticky Pair | Item Coupling | **PRESENT** | Viscous honey / sauce globule bonding two items |
| 11 | `oneway` | One-Way Arrow | Flow Restriction | **PRESENT** | Directional chevron track segment |
| 12 | `restricted` | Restricted Queue | Dock Gate | **PRESENT** | Warning hazard barrier over queue slot |
| 13 | `colorswap` | Color Swap Badge | Mutator | **PRESENT** | Orbital twin arrows mutation badge |
| 14 | `priority` | Priority Star | Bonus Goal | **PRESENT** | Golden star pinned to target container/item |

**Audit Conclusion**: 10 distinct standalone assets + 2 combined pairs = 12 graphical symbols present on review board. 2 dedicated runtime overlays (`key` isolated, `hiddenbox` container mask) require secondary extraction.

---

## 5. 500-Level Scaling Architecture & 8-Chapter Progression Plan

### 5.1 Architecture Principle: Permutations vs. Hand-Drawn Backgrounds
> [!NOTE]
> **500 Level Capacity ≠ 500 Hand-Drawn Backgrounds**  
> Factory Sort generates 500 playable levels algorithmically through topological permutations:
> $$\text{500 Levels} = 32 \text{ Stable Item IDs} \times \text{Conveyor Topologies} \times \text{Blocker Configurations} \times \text{Queue Capacities}$$
> Stable logical IDs guarantee solver solvability and preserve player muscle memory.

### 5.2 8-Chapter Progression & Palette Specification
- **Chapter 1** represents the **Base Rendered Master** delivered in this asset pack.
- **Chapters 2–8** are specified as non-destructive palette/LUT variations:

| Chapter | Level Range | Setting Name | Candy Palette Variation | Food Palette Variation | Key Mechanical Focus | Delivery Status |
|:---:|:---:|:---|:---|:---|:---|:---:|
| **Ch. 1** | 1–50 | Morning Sunrise | Warm vanilla cream, blush berry, buttercup gold | Warm sourdough cream, terracotta, butter | Baseline conveyor, Ice Block, Lock & Key | **Base Rendered** |
| **Ch. 2** | 51–110 | Orchard Blossom | Pistachio leaf green, wild raspberry, lilac mist | Celery green, carrot coral, chalk white | Sticky Pairs & Connector Chains | Palette Spec (LUT) |
| **Ch. 3** | 111–175 | Neon Carnival | Electric grape, spun sugar cyan, lemon glaze | Midnight charcoal, neon tomato, mustard | One-Way Arrows, Urgent Timers | Palette Spec (LUT) |
| **Ch. 4** | 176–240 | Winter Frost | Glacier blue, peppermint red, marshmallow white | Snowy pine, smoked cedar, roasted chestnut | Deep Ice, Stuck Lids, Freeze Booster | Palette Spec (LUT) |
| **Ch. 5** | 241–305 | Golden Harvest | Amber caramel, almond bronze, molasses brown | Pumpkin orange, golden wheat, sage olive | Heavy boxes, Color Swap, Restricted Dock | Palette Spec (LUT) |
| **Ch. 6** | 306–370 | Tropical Lagoon | Mango yellow, guava pink, coconut milk white | Turquoise wave, charred bamboo, grilled coral | Split conveyors, Hidden Cloches (?) | Palette Spec (LUT) |
| **Ch. 7** | 371–440 | Royal Confection | Royal velvet purple, gilded gold trim, ivory | Parisian navy, polished copper, warm baguette | Priority Stars, Defect Items, Dual-layers | Palette Spec (LUT) |
| **Ch. 8** | 441–500 | Cosmic Sugar | Deep indigo, iridescent crystal, starlight mint | Deep slate, chrome steel, botanical green | Master tier: 4 simultaneous blockers | Palette Spec (LUT) |

---

## 6. Comparison Gallery & Slicing Tools

- **Visual Review Gallery (Vietnamese & English QA)**: [`index.html`](file:///D:/game%20idea%20prototype/Factory%20Sort/assets/retheme-review/2026-11-10/index.html)
- **Agy Slicing & Packing Script**: [`agy/pack_assets.py`](file:///D:/game%20idea%20prototype/Factory%20Sort/assets/retheme-review/2026-11-10/agy/pack_assets.py)
- **GPT Slicing & Packing Script**: [`gpt/pack_gpt_assets.py`](file:///D:/game%20idea%20prototype/Factory%20Sort/assets/retheme-review/2026-11-10/gpt/pack_gpt_assets.py)
