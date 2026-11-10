"""
Factory Sort — Asset Packing & Processing Script (Agy)
======================================================
Author: Agy
Date: 2026-11-10
Purpose:
  1. Ingests original JPEG source masters from the agy folder.
  2. Converts masters to PNG format without modifying original source JPGs.
  3. Performs border-connected floodfill alpha extraction for 8x4 item atlases.
     Note: Near-white floodfill is a heuristic and cannot guarantee zero interior
     color alteration. All white/light items (rice, egg white, milk, vanilla scoop)
     require visual edge/white-object inspection.
  4. Slices each atlas into 32 individual item sprites with standard cell canvas
     and calculates pixel-level alpha metrics.
  5. Documents that UI/environment sheets are REVIEW MASTERS, not sliced runtime components.
  6. Emits agy/manifest.json containing exact coordinates, bounding boxes,
     alpha stats, 8-chapter progression plan, and honest 14-mechanic coverage audits.

Usage:
  python pack_assets.py
"""

import os
import sys
import json
import math
from collections import deque
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCES = {
    "candy_items": "candy_items_atlas_1794278920398.jpg",
    "candy_ui": "candy_environment_ui_1794278946705.jpg",
    "candy_mockup": "candy_gameplay_mockup_1794278972590.jpg",
    "food_items": "food_items_atlas_1794278929764.jpg",
    "food_ui": "food_environment_ui_1794278951537.jpg",
    "food_mockup": "food_gameplay_mockup_1794278976183.jpg"
}

CANDY_CATALOG = [
    ("candy_01", "spiral_lollipop", 0, 0, "Lollipop & Hard Candy", "Berry Pink / Cream swirl"),
    ("candy_02", "heart_lollipop", 0, 1, "Lollipop & Hard Candy", "Ruby Berry Red"),
    ("candy_03", "star_lollipop", 0, 2, "Lollipop & Hard Candy", "Honey Amber Gold"),
    ("candy_04", "candy_cane", 0, 3, "Lollipop & Hard Candy", "Peppermint Red / White"),
    ("candy_05", "twistwrapped_bonbon", 0, 4, "Lollipop & Hard Candy", "Turquoise Mint"),
    ("candy_06", "round_truffle", 0, 5, "Lollipop & Hard Candy", "Cocoa Bronze"),
    ("candy_07", "square_praline", 0, 6, "Lollipop & Hard Candy", "Pistachio / Cream Drizzle"),
    ("candy_08", "striped_toffee", 0, 7, "Lollipop & Hard Candy", "Warm Caramel Ochre"),
    ("candy_09", "gummy_bear", 1, 0, "Gummies & Drops", "Translucent Strawberry Red"),
    ("candy_10", "gummy_ring", 1, 1, "Gummies & Drops", "Lemon Yellow / Lime"),
    ("candy_11", "gummy_worm", 1, 2, "Gummies & Drops", "Tropical Orange / Cyan"),
    ("candy_12", "gummy_peach", 1, 3, "Gummies & Drops", "Coral / Sugar Crystal"),
    ("candy_13", "jelly_bean", 1, 4, "Gummies & Drops", "Grape Purple Berry"),
    ("candy_14", "sugar_drop", 1, 5, "Gummies & Drops", "Icy Crystalline Sky Blue"),
    ("candy_15", "candy_corn", 1, 6, "Gummies & Drops", "White / Orange / Yellow tri-band"),
    ("candy_16", "mint_disc", 1, 7, "Gummies & Drops", "Pale Pistachio Mint"),
    ("candy_17", "pink_macaron", 2, 0, "Bakery & Cookies", "Pastel Rose Pink / White Cream"),
    ("candy_18", "cream_wafer", 2, 1, "Bakery & Cookies", "Laminated Golden Wafer"),
    ("candy_19", "chocolate_sandwich_cookie", 2, 2, "Bakery & Cookies", "Dark Cookie with CREAM texture imprint (stylistic detail, not trademark)"),
    ("candy_20", "butter_biscuit", 2, 3, "Bakery & Cookies", "Fluted Golden Butter Biscuit"),
    ("candy_21", "sprinkle_donut", 2, 4, "Bakery & Cookies", "Glazed Pink Donut / Sprinkles"),
    ("candy_22", "strawberry_cupcake", 2, 5, "Bakery & Cookies", "Swirled Cream / Cherry"),
    ("candy_23", "cake_roll", 2, 6, "Bakery & Cookies", "Golden Roll / Chocolate Swirl"),
    ("candy_24", "berry_tart", 2, 7, "Bakery & Cookies", "Blueberry / Pastry Shell"),
    ("candy_25", "popsicle", 3, 0, "Frozen & Sweets", "Electric Raspberry Twin Stick"),
    ("candy_26", "icecream_cone", 3, 1, "Frozen & Sweets", "Waffle Cone / Pistachio Scoop"),
    ("candy_27", "sundae_cup", 3, 2, "Frozen & Sweets", "Glass Cup / Vanilla Swirl"),
    ("candy_28", "mochi_ball", 3, 3, "Frozen & Sweets", "Soft Matcha Pistachio"),
    ("candy_29", "chocolate_bar", 3, 4, "Frozen & Sweets", "Segmented Milk Chocolate"),
    ("candy_30", "peanut_brittle", 3, 5, "Frozen & Sweets", "Honey Caramel Nut Slab"),
    ("candy_31", "fudge_cube", 3, 6, "Frozen & Sweets", "Dark Cocoa Fudge Cube"),
    ("candy_32", "marshmallow_twist", 3, 7, "Frozen & Sweets", "Pastel Pink / Cyan Braid")
]

FOOD_CATALOG = [
    ("food_01", "apple", 0, 0, "Fruits & Veggies", "Crisp Crimson Red with Stem"),
    ("food_02", "orange", 0, 1, "Fruits & Veggies", "Pebbled Citrus Orange"),
    ("food_03", "strawberry", 0, 2, "Fruits & Veggies", "Conical Red Berry with Calyx"),
    ("food_04", "pear", 0, 3, "Fruits & Veggies", "Teardrop Olive / Yellow Pear"),
    ("food_05", "broccoli", 0, 4, "Fruits & Veggies", "Forest Green Floret Cluster"),
    ("food_06", "carrot", 0, 5, "Fruits & Veggies", "Tapered Orange Cone / Green Frills"),
    ("food_07", "corn_cob", 0, 6, "Fruits & Veggies", "Golden Kernel Cob / Husk"),
    ("food_08", "mushroom", 0, 7, "Fruits & Veggies", "Chestnut Brown Dome / White Stem"),
    ("food_09", "fried_egg", 1, 0, "Breakfast & Fast Food", "Sunny White / Golden Spherical Yolk"),
    ("food_10", "croissant", 1, 1, "Breakfast & Fast Food", "Layered Toasted Crescent"),
    ("food_11", "pancake_stack", 1, 2, "Breakfast & Fast Food", "Three Golden Cakes / Butter Pat"),
    ("food_12", "toast", 1, 3, "Breakfast & Fast Food", "Square Wheat Slice / Grill Marks"),
    ("food_13", "burger", 1, 4, "Fast Food", "Sesame Bun / Patty / Lettuce"),
    ("food_14", "pizza_slice", 1, 5, "Fast Food", "Cheese Wedge / Pepperoni Discs"),
    ("food_15", "taco", 1, 6, "Fast Food", "Folded Corn Shell / Fillings"),
    ("food_16", "hotdog", 1, 7, "Fast Food", "Bun / Sausage / Mustard Stripe"),
    ("food_17", "sushi_roll", 2, 0, "Asian & Entrees", "Black Nori / White Rice / Salmon"),
    ("food_18", "dumpling", 2, 1, "Asian & Entrees", "Pleated Steamed Dumpling"),
    ("food_19", "rice_ball", 2, 2, "Asian & Entrees", "Onigiri Triangle / Nori Wrap"),
    ("food_20", "noodle_bowl", 2, 3, "Asian & Entrees", "Ramen Bowl / Broth / Chopsticks"),
    ("food_21", "chicken_drumstick", 2, 4, "Asian & Entrees", "Meaty Golden Fried Drumstick"),
    ("food_22", "steak", 2, 5, "Asian & Entrees", "Seared Cut / Diamond Grill Marks"),
    ("food_23", "shrimp", 2, 6, "Asian & Entrees", "Curved Blanched Coral Prawn"),
    ("food_24", "salmon_fillet", 2, 7, "Asian & Entrees", "Coral Steak with White Striations"),
    ("food_25", "fries_carton", 3, 0, "Sides & Drinks", "Paper Sleeve / Golden Fries"),
    ("food_26", "pretzel", 3, 1, "Sides & Drinks", "Knotted Dough / Salt Grains"),
    ("food_27", "sandwich", 3, 2, "Sides & Drinks", "Club Sandwich / Triangle Layers"),
    ("food_28", "soup_bowl", 3, 3, "Sides & Drinks", "Ceramic Bowl / Vegetable Soup"),
    ("food_29", "milk_carton", 3, 4, "Sides & Drinks", "Gable-top Dairy Carton with generic cow icon"),
    ("food_30", "juice_bottle", 3, 5, "Sides & Drinks", "Glass Bottle / Orange Juice"),
    ("food_31", "tea_cup", 3, 6, "Sides & Drinks", "Ceramic Cup / Saucer / Steam"),
    ("food_32", "smoothie_glass", 3, 7, "Sides & Drinks", "Faceted Glass / Swirl Cream")
]

# Honest 14-Blocker Audit: Reflects actual 12 graphical symbols on sheet
BLOCKERS_AUDIT = [
    {"id": "lock", "name": "Lock", "status": "COMBINED_WITH_KEY", "type": "Container Gate", "notes": "Shown paired with key on UI sheet; lacks isolated standalone asset"},
    {"id": "key", "name": "Key", "status": "COMBINED_WITH_LOCK", "type": "Item / Unlocker", "notes": "Depicted alongside lock badge; separate unlocker sprite needs dedicated extraction"},
    {"id": "ice", "name": "Ice Block", "status": "PRESENT", "type": "Cell Enclosure", "notes": "Frosted crystalline casing overlay"},
    {"id": "stucklid", "name": "Stuck Lid", "status": "PRESENT", "type": "Box State", "notes": "Crossed tape/strap sealing box intake"},
    {"id": "defect", "name": "Defect Item", "status": "PRESENT", "type": "Sort Hazard", "notes": "Hazard symbol / crack mark on spoiled unit"},
    {"id": "connector", "name": "Connector Chain", "status": "PRESENT", "type": "Coupling", "notes": "Heavy iron link linking two boxes together"},
    {"id": "hiddenbox", "name": "Hidden Box", "status": "SHARED_COVER", "type": "Cover", "notes": "Wrapped gift box representation; shares concept role with hidden item"},
    {"id": "hiddenitem", "name": "Hidden Item (?)", "status": "SHARED_COVER", "type": "Cover", "notes": "Mystery question mark dome / cloche; distinct standalone overlay pending dedicated slicing"},
    {"id": "urgent", "name": "Urgent Timer", "status": "PRESENT", "type": "Countdown", "notes": "Ticking clock with fuse/alarm badge"},
    {"id": "sticky", "name": "Sticky Pair", "status": "PRESENT", "type": "Coupling", "notes": "Viscous honey/sauce globule bonding two items"},
    {"id": "oneway", "name": "One-Way Arrow", "status": "PRESENT", "type": "Flow Restriction", "notes": "Directional chevron track segment"},
    {"id": "restricted", "name": "Restricted Queue", "status": "PRESENT", "type": "Dock Gate", "notes": "Striped barrier blocking dock slot"},
    {"id": "colorswap", "name": "Color Swap Badge", "status": "PRESENT", "type": "Mutator", "notes": "Reciprocal orbital arrows mutator"},
    {"id": "priority", "name": "Priority Star", "status": "PRESENT", "type": "Score / Goal", "notes": "Golden star pinned for bonus target"}
]

CHAPTER_PROGRESSION_PLAN = [
    {"chapter": 1, "levels": "1-50", "name": "Morning Sunrise", "candyPalette": "Warm vanilla cream, blush berry, buttercup gold", "foodPalette": "Warm sourdough cream, terracotta, butter", "mechanics": "Basic conveyor, Ice Block, Lock & Key intro", "renderedStatus": "Base theme rendered"},
    {"chapter": 2, "levels": "51-110", "name": "Orchard Blossom", "candyPalette": "Pistachio leaf green, wild raspberry, lilac mist", "foodPalette": "Celery green, carrot coral, chalk white", "mechanics": "Sticky Pairs & Connector Chains", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 3, "levels": "111-175", "name": "Neon Carnival", "candyPalette": "Electric grape, spun sugar cyan, lemon glaze", "foodPalette": "Midnight charcoal, neon tomato, mustard yellow", "mechanics": "One-Way Arrows, Urgent Timers, Fast Conveyors", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 4, "levels": "176-240", "name": "Winter Frost", "candyPalette": "Glacier blue, peppermint red, marshmallow white", "foodPalette": "Snowy pine, smoked cedar, roasted chestnut", "mechanics": "Deep Ice Blocks, Stuck Lids, Freeze Boosters", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 5, "levels": "241-305", "name": "Golden Harvest", "candyPalette": "Amber caramel, almond bronze, molasses brown", "foodPalette": "Pumpkin orange, golden wheat, sage olive", "mechanics": "Heavy boxes, Color Swap, Restricted Queue", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 6, "levels": "306-370", "name": "Tropical Lagoon", "candyPalette": "Mango yellow, guava pink, coconut milk white", "foodPalette": "Turquoise wave, charred bamboo, grilled coral", "mechanics": "Multi-path split conveyors, Hidden Cloches (?)", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 7, "levels": "371-440", "name": "Royal Confection", "candyPalette": "Royal velvet purple, gilded gold trim, ivory", "foodPalette": "Parisian navy, polished copper, warm baguette", "mechanics": "Priority Stars, Defect Items, Dual-layer puzzles", "renderedStatus": "Palette specification (LUT)"},
    {"chapter": 8, "levels": "441-500", "name": "Cosmic Sugar", "candyPalette": "Deep indigo, iridescent crystal, starlight mint", "foodPalette": "Deep slate, chrome steel, botanical green", "mechanics": "Master tier: 4 simultaneous blockers", "renderedStatus": "Palette specification (LUT)"}
]


def color_dist(c1, c2):
    return math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2)


def border_floodfill_alpha(pil_image, tolerance=30, feather=True):
    """
    Applies border-connected BFS floodfill to remove background pixels.
    Notice: This is a heuristic process. Needs visual edge/white-object inspection
    to verify edge feathering and interior white preservation.
    """
    img = pil_image.convert("RGB")
    w, h = img.size
    pixels = img.load()

    # Sample perimeter pixels
    perimeter_samples = []
    step_x = max(1, w // 20)
    step_y = max(1, h // 20)
    for x in range(0, w, step_x):
        perimeter_samples.append(pixels[x, 0])
        perimeter_samples.append(pixels[x, h - 1])
    for y in range(0, h, step_y):
        perimeter_samples.append(pixels[0, y])
        perimeter_samples.append(pixels[w - 1, y])

    avg_bg = (
        sum(p[0] for p in perimeter_samples) / len(perimeter_samples),
        sum(p[1] for p in perimeter_samples) / len(perimeter_samples),
        sum(p[2] for p in perimeter_samples) / len(perimeter_samples)
    )

    visited = bytearray(w * h)
    queue = deque()

    def check_seed(x, y):
        idx = y * w + x
        if visited[idx] == 0:
            if color_dist(pixels[x, y], avg_bg) <= tolerance * 1.3:
                visited[idx] = 1
                queue.append((x, y))

    for x in range(w):
        check_seed(x, 0)
        check_seed(x, h - 1)
    for y in range(h):
        check_seed(0, y)
        check_seed(w - 1, y)

    while queue:
        cx, cy = queue.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if visited[nidx] == 0:
                    if color_dist(pixels[nx, ny], avg_bg) <= tolerance:
                        visited[nidx] = 1
                        queue.append((nx, ny))

    rgba = img.convert("RGBA")
    rgba_pixels = rgba.load()

    bg_count = 0
    fg_count = 0
    min_x, min_y = w, h
    max_x, max_y = 0, 0

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if visited[idx] == 1:
                rgba_pixels[x, y] = (0, 0, 0, 0)
                bg_count += 1
            else:
                fg_count += 1
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y

    if min_x > max_x:
        min_x, min_y, max_x, max_y = 0, 0, w, h

    if feather:
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                idx = y * w + x
                if visited[idx] == 0:
                    has_bg_neighbor = (
                        visited[idx - 1] == 1 or visited[idx + 1] == 1 or
                        visited[idx - w] == 1 or visited[idx + w] == 1
                    )
                    if has_bg_neighbor:
                        r, g, b, a = rgba_pixels[x, y]
                        rgba_pixels[x, y] = (r, g, b, 160)

    stats = {
        "width": w,
        "height": h,
        "totalPixels": w * h,
        "bgTransparentPixels": bg_count,
        "fgOpaquePixels": fg_count,
        "transparencyRatio": round(bg_count / (w * h), 4),
        "contentBounds": [min_x, min_y, max_x, max_y],
        "contentWidth": max_x - min_x + 1,
        "contentHeight": max_y - min_y + 1,
        "qaNote": "Heuristic alpha extraction; needs visual edge/white-object inspection."
    }

    return rgba, stats


def process_theme(theme_name, atlas_filename, ui_filename, mockup_filename, catalog):
    print(f"\n[{theme_name.upper()}] Starting asset processing...")
    theme_dir = os.path.join(SCRIPT_DIR, theme_name)
    items_dir = os.path.join(theme_dir, "items")
    os.makedirs(theme_dir, exist_ok=True)
    os.makedirs(items_dir, exist_ok=True)

    atlas_path = os.path.join(SCRIPT_DIR, atlas_filename)
    ui_path = os.path.join(SCRIPT_DIR, ui_filename)
    mockup_path = os.path.join(SCRIPT_DIR, mockup_filename)

    results = {
        "theme": theme_name,
        "sourceFiles": {
            "atlasJpg": atlas_filename,
            "uiJpg": ui_filename,
            "mockupJpg": mockup_filename
        },
        "outputFiles": {},
        "items": []
    }

    # 1. UI Sheet and Mockup are REVIEW MASTERS (converted to PNG as-is)
    if os.path.exists(ui_path):
        ui_img = Image.open(ui_path)
        ui_png_path = os.path.join(theme_dir, f"{theme_name}_environment_ui.png")
        ui_img.save(ui_png_path, "PNG", optimize=True)
        results["outputFiles"]["environmentUI"] = f"{theme_name}/{theme_name}_environment_ui.png"
        results["environmentUIDimensions"] = list(ui_img.size)
        results["environmentUINote"] = "REVIEW MASTER (opaque presentation board, not sliced runtime components)"
        print(f"  -> Converted UI review master: {ui_png_path}")

    if os.path.exists(mockup_path):
        mockup_img = Image.open(mockup_path)
        mockup_png_path = os.path.join(theme_dir, f"{theme_name}_gameplay_mockup.png")
        mockup_img.save(mockup_png_path, "PNG", optimize=True)
        results["outputFiles"]["gameplayMockup"] = f"{theme_name}/{theme_name}_gameplay_mockup.png"
        results["gameplayMockupDimensions"] = list(mockup_img.size)
        results["gameplayMockupNote"] = "VISUAL CONCEPT ONLY (not a playable game retheme)"
        print(f"  -> Converted Gameplay mockup: {mockup_png_path}")

    # 2. Process Items Atlas
    if not os.path.exists(atlas_path):
        print(f"  [ERROR] Atlas file not found: {atlas_path}")
        return results

    atlas_img = Image.open(atlas_path)
    w, h = atlas_img.size
    cols = 8
    rows = 4
    cell_w = w // cols
    cell_h = h // rows

    # Save full opaque PNG
    opaque_png_path = os.path.join(theme_dir, f"{theme_name}_items_atlas.png")
    atlas_img.save(opaque_png_path, "PNG", optimize=True)
    results["outputFiles"]["itemsAtlasOpaque"] = f"{theme_name}/{theme_name}_items_atlas.png"

    # Save transparent atlas
    print(f"  -> Performing border floodfill on full atlas ({w}x{h})...")
    trans_atlas, atlas_stats = border_floodfill_alpha(atlas_img, tolerance=30, feather=True)
    trans_png_path = os.path.join(theme_dir, f"{theme_name}_items_atlas_transparent.png")
    trans_atlas.save(trans_png_path, "PNG", optimize=True)
    results["outputFiles"]["itemsAtlasTransparent"] = f"{theme_name}/{theme_name}_items_atlas_transparent.png"
    results["atlasDimensions"] = [w, h]
    results["cellSize"] = [cell_w, cell_h]
    results["atlasAlphaMetrics"] = atlas_stats

    # 3. Slice into 32 Individual Items
    print(f"  -> Slicing 8x4 grid into 32 items...")
    for item_meta in catalog:
        item_id, item_name, row, col, family, palette = item_meta
        x1 = col * cell_w
        y1 = row * cell_h
        x2 = x1 + cell_w
        y2 = y1 + cell_h

        cell_raw = atlas_img.crop((x1, y1, x2, y2))
        cell_rgba, cell_stats = border_floodfill_alpha(cell_raw, tolerance=28, feather=True)

        sprite_filename = f"{item_id}_{item_name}.png"
        sprite_path = os.path.join(items_dir, sprite_filename)
        cell_rgba.save(sprite_path, "PNG", optimize=True)

        results["items"].append({
            "id": item_id,
            "name": item_name,
            "row": row,
            "col": col,
            "family": family,
            "colorProfile": palette,
            "atlasRect": [x1, y1, cell_w, cell_h],
            "canvasDimensions": [cell_w, cell_h],
            "contentBounds": cell_stats["contentBounds"],
            "contentWidth": cell_stats["contentWidth"],
            "contentHeight": cell_stats["contentHeight"],
            "alphaRatio": cell_stats["transparencyRatio"],
            "filePath": f"{theme_name}/items/{sprite_filename}",
            "inspectionStatus": "needs visual edge/white-object inspection"
        })

    print(f"  -> Sliced and saved all 32 {theme_name} sprites.")
    return results


def main():
    print("=" * 60)
    print("Factory Sort — Agy Asset Packing & Processing")
    print("=" * 60)

    manifest_data = {
        "generator": "Agy (Independent Production)",
        "pipelineVersion": "2.1-raster-floodfill",
        "date": "2026-11-10",
        "artDirection": {
            "candy": "Premium casual, charming sculpted matte-toy forms, cream/berry/pistachio palette, soft bevels",
            "food": "Cozy bakery/market, warm cream/coral/leaf green palette, tactile forms, golden crust"
        },
        "themes": {},
        "blockersAudit": BLOCKERS_AUDIT,
        "chapterProgressionPlan": CHAPTER_PROGRESSION_PLAN,
        "qaAndInspectionNotes": [
            "UI/environment sheets are REVIEW MASTERS, not sliced runtime components.",
            "Near-white floodfill is a heuristic and cannot guarantee zero interior whites altered. All extracted items require visual edge/white-object inspection.",
            "Candy cookie asset features embossed 'CREAM' lettering as a stylized decorative relief, not a trademark or brand logo.",
            "14-Blocker coverage audit acknowledges combined lock+key and shared cover states on current sheet.",
            "Gameplay mockups are visual concept representations, not playable game rethemes."
        ]
    }

    candy_results = process_theme(
        "candy",
        SOURCES["candy_items"],
        SOURCES["candy_ui"],
        SOURCES["candy_mockup"],
        CANDY_CATALOG
    )
    manifest_data["themes"]["candy"] = candy_results

    food_results = process_theme(
        "food",
        SOURCES["food_items"],
        SOURCES["food_ui"],
        SOURCES["food_mockup"],
        FOOD_CATALOG
    )
    manifest_data["themes"]["food"] = food_results

    manifest_json_path = os.path.join(SCRIPT_DIR, "manifest.json")
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2)

    print(f"\n[COMPLETE] Emitted manifest: {manifest_json_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
