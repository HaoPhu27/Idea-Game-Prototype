"""
Factory Sort — GPT Asset Packing & Slicing Script
=================================================
Author: Agy (for GPT Asset Pipeline Integration)
Date: 2026-11-10
Purpose:
  1. Ingests existing clean RGBA transparent atlases from GPT:
     - candy-items-v2.png (Candy 32 items, 8x4 regular grid)
     - food-items-v1.png (Food 32 items, 8x4 regular grid)
  2. Slices each atlas into 32 individual RGBA PNG sprites:
     - gpt/candy/items/candy_01_spiral_lollipop.png ... candy_32_marshmallow_twist.png
     - gpt/food/items/food_01_apple.png ... food_32_smoothie_glass.png
  3. Preserves existing alpha channels and pixel data without redraw or re-keying.
  4. Generates gpt/manifest.json containing exact coordinates, dimensions,
     bounding boxes, item names, and source metadata.

Usage:
  python pack_gpt_assets.py
"""

import os
import sys
import json
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCES = {
    "candy_items": os.path.join(SCRIPT_DIR, "candy-items-v2.png"),
    "food_items": os.path.join(SCRIPT_DIR, "food-items-v1.png"),
    "candy_ui": os.path.join(SCRIPT_DIR, "candy-ui-v2.png"),
    "food_ui": os.path.join(SCRIPT_DIR, "food-ui-v2.png"),
    "candy_mockup": os.path.join(SCRIPT_DIR, "candy-gameplay-v1.png"),
    "food_mockup": os.path.join(SCRIPT_DIR, "food-gameplay-v1.png")
}

CANDY_CATALOG = [
    ("candy_01", "spiral_lollipop", 0, 0, "Lollipops", "Spiral swirled round lollipop on stick"),
    ("candy_02", "heart_lollipop", 0, 1, "Lollipops", "Glossy heart-shaped candy on stick"),
    ("candy_03", "star_lollipop", 0, 2, "Lollipops", "Five-pointed rounded star candy on stick"),
    ("candy_04", "candy_cane", 0, 3, "Lollipops", "Hooked peppermint cane with red/white stripes"),
    ("candy_05", "twistwrapped_bonbon", 0, 4, "Hard Candy", "Oval candy with pinched twisted ends"),
    ("candy_06", "round_truffle", 0, 5, "Hard Candy", "Spherical chocolate truffle with dusting"),
    ("candy_07", "square_praline", 0, 6, "Hard Candy", "Square chocolate praline with swirl"),
    ("candy_08", "striped_toffee", 0, 7, "Hard Candy", "Layered two-tone chewy toffee rectangle"),
    ("candy_09", "gummy_bear", 1, 0, "Gummies", "Translucent gummy bear with cute ears"),
    ("candy_10", "gummy_ring", 1, 1, "Gummies", "Two-tone gummy donut ring"),
    ("candy_11", "gummy_worm", 1, 2, "Gummies", "Segmented wavy gummy worm"),
    ("candy_12", "gummy_peach", 1, 3, "Gummies", "Sugared heart-shaped gummy peach slice"),
    ("candy_13", "jelly_bean", 1, 4, "Drops", "Kidney bean shaped glossy jelly chew"),
    ("candy_14", "sugar_drop", 1, 5, "Drops", "Teardrop sugar drop with facets"),
    ("candy_15", "candy_corn", 1, 6, "Drops", "Tri-band triangular candy corn"),
    ("candy_16", "mint_disc", 1, 7, "Drops", "Circular mint lozenge with embossed motif"),
    ("candy_17", "pink_macaron", 2, 0, "Bakery", "Glossy pink macaron with cream filling"),
    ("candy_18", "cream_wafer", 2, 1, "Bakery", "Layered vanilla wafer bar"),
    ("candy_19", "chocolate_sandwich_cookie", 2, 2, "Bakery", "Dark scalloped cookie with white cream"),
    ("candy_20", "butter_biscuit", 2, 3, "Bakery", "Golden rectangular butter biscuit"),
    ("candy_21", "sprinkle_donut", 2, 4, "Pastry", "Pink frosted donut with rainbow sprinkles"),
    ("candy_22", "strawberry_cupcake", 2, 5, "Pastry", "Swirled frosting cupcake with cherry"),
    ("candy_23", "cake_roll", 2, 6, "Pastry", "Spiral cream roll cake slice"),
    ("candy_24", "berry_tart", 2, 7, "Pastry", "Glazed blueberry/blackberry tart"),
    ("candy_25", "popsicle", 3, 0, "Frozen", "Frozen twin-stick fruit popsicle"),
    ("candy_26", "icecream_cone", 3, 1, "Frozen", "Waffle cone with ice cream scoop"),
    ("candy_27", "sundae_cup", 3, 2, "Frozen", "Fluted sundae cup with swirl cream"),
    ("candy_28", "mochi_ball", 3, 3, "Frozen", "Pillowy matcha dusted mochi sphere"),
    ("candy_29", "chocolate_bar", 3, 4, "Confection", "Segmented rectangular chocolate block"),
    ("candy_30", "peanut_brittle", 3, 5, "Confection", "Amber caramel peanut brittle slab"),
    ("candy_31", "fudge_cube", 3, 6, "Confection", "Dense chocolate fudge cube"),
    ("candy_32", "marshmallow_twist", 3, 7, "Confection", "Pastel braided marshmallow cord")
]

FOOD_CATALOG = [
    ("food_01", "apple", 0, 0, "Fruits", "Red apple with green leaf stem"),
    ("food_02", "orange", 0, 1, "Fruits", "Spherical citrus orange with texture"),
    ("food_03", "strawberry", 0, 2, "Fruits", "Conical red berry with yellow seeds and calyx"),
    ("food_04", "pear", 0, 3, "Fruits", "Teardrop shaped olive-yellow pear"),
    ("food_05", "broccoli", 0, 4, "Veggies", "Cluster of deep green broccoli florets"),
    ("food_06", "carrot", 0, 5, "Veggies", "Tapered orange carrot with green frills"),
    ("food_07", "corn_cob", 0, 6, "Veggies", "Golden sweetcorn ear with partial husk"),
    ("food_08", "mushroom", 0, 7, "Veggies", "Brown button mushroom with white stem"),
    ("food_09", "fried_egg", 1, 0, "Breakfast", "Sunny-side egg with glossy yellow yolk"),
    ("food_10", "croissant", 1, 1, "Breakfast", "Buttery flaky crescent croissant"),
    ("food_11", "pancake_stack", 1, 2, "Breakfast", "Stack of pancakes with butter pat"),
    ("food_12", "toast", 1, 3, "Breakfast", "Square toasted bread with crust"),
    ("food_13", "burger", 1, 4, "Fast Food", "Layered burger with patty, cheese, lettuce"),
    ("food_14", "pizza_slice", 1, 5, "Fast Food", "Triangular pizza slice with pepperoni"),
    ("food_15", "taco", 1, 6, "Fast Food", "Folded crisp corn taco with fillings"),
    ("food_16", "hotdog", 1, 7, "Fast Food", "Sausage in bun with mustard swirl"),
    ("food_17", "sushi_roll", 2, 0, "Asian", "Maki sushi slice with nori, rice, salmon"),
    ("food_18", "dumpling", 2, 1, "Asian", "Steamed potsticker dumpling with pleats"),
    ("food_19", "rice_ball", 2, 2, "Asian", "Onigiri triangle rice ball with nori strip"),
    ("food_20", "noodle_bowl", 2, 3, "Asian", "Ramen bowl with chopsticks and broth"),
    ("food_21", "chicken_drumstick", 2, 4, "Mains", "Fried crispy chicken drumstick"),
    ("food_22", "steak", 2, 5, "Mains", "Seared steak cut with grill marks"),
    ("food_23", "shrimp", 2, 6, "Mains", "Pink cooked shrimp with curled tail"),
    ("food_24", "salmon_fillet", 2, 7, "Mains", "Fresh salmon steak with white striations"),
    ("food_25", "fries_carton", 3, 0, "Sides", "Red sleeve with golden potato fries"),
    ("food_26", "pretzel", 3, 1, "Sides", "Baked knotted pretzel with salt crystals"),
    ("food_27", "sandwich", 3, 2, "Sides", "Club sandwich cut into triangle layers"),
    ("food_28", "soup_bowl", 3, 3, "Sides", "Warm ceramic bowl with vegetable soup"),
    ("food_29", "milk_carton", 3, 4, "Drinks", "Classic carton with milk packaging"),
    ("food_30", "juice_bottle", 3, 5, "Drinks", "Glass bottle filled with orange juice"),
    ("food_31", "tea_cup", 3, 6, "Drinks", "Ceramic teacup on saucer with steam"),
    ("food_32", "smoothie_glass", 3, 7, "Drinks", "Tall glass with berry smoothie and straw")
]


def slice_theme(theme_name, source_path, catalog):
    print(f"\n[GPT-{theme_name.upper()}] Slicing RGBA atlas...")
    if not os.path.exists(source_path):
        print(f"  [ERROR] Source atlas not found: {source_path}")
        return None

    img = Image.open(source_path).convert("RGBA")
    w, h = img.size
    cols = 8
    rows = 4
    cell_w = w // cols
    cell_h = h // rows

    items_dir = os.path.join(SCRIPT_DIR, theme_name, "items")
    os.makedirs(items_dir, exist_ok=True)

    theme_meta = {
        "sourceAtlas": os.path.basename(source_path),
        "dimensions": [w, h],
        "grid": [cols, rows],
        "cellSize": [cell_w, cell_h],
        "items": []
    }

    for item_meta in catalog:
        item_id, item_name, row, col, family, notes = item_meta
        x1 = col * cell_w
        y1 = row * cell_h
        x2 = x1 + cell_w
        y2 = y1 + cell_h

        # Extract cell crop directly preserving RGBA alpha
        cell = img.crop((x1, y1, x2, y2))

        # Compute content bounding box based on alpha channel
        bbox = cell.getbbox()
        if bbox is None:
            bbox = (0, 0, cell_w, cell_h)

        sprite_filename = f"{item_id}_{item_name}.png"
        sprite_path = os.path.join(items_dir, sprite_filename)
        cell.save(sprite_path, "PNG", optimize=True)

        theme_meta["items"].append({
            "id": item_id,
            "name": item_name,
            "row": row,
            "col": col,
            "family": family,
            "notes": notes,
            "cellRect": [x1, y1, cell_w, cell_h],
            "contentBBox": list(bbox),
            "contentWidth": bbox[2] - bbox[0],
            "contentHeight": bbox[3] - bbox[1],
            "relativePath": f"gpt/{theme_name}/items/{sprite_filename}"
        })

    print(f"  -> Successfully sliced 32 {theme_name} sprites to gpt/{theme_name}/items/")
    return theme_meta


def main():
    print("=" * 60)
    print("Factory Sort — GPT Asset Packing & Slicing Pipeline")
    print("=" * 60)

    manifest = {
        "author": "GPT",
        "pipeline": "Direct RGBA Slicing (no redraw, preserved alpha)",
        "date": "2026-11-10",
        "sourceFiles": {
            "candyAtlas": os.path.basename(SOURCES["candy_items"]),
            "foodAtlas": os.path.basename(SOURCES["food_items"]),
            "candyUI": os.path.basename(SOURCES["candy_ui"]),
            "foodUI": os.path.basename(SOURCES["food_ui"]),
            "candyGameplay": os.path.basename(SOURCES["candy_mockup"]),
            "foodGameplay": os.path.basename(SOURCES["food_mockup"])
        },
        "themes": {}
    }

    candy_meta = slice_theme("candy", SOURCES["candy_items"], CANDY_CATALOG)
    if candy_meta:
        manifest["themes"]["candy"] = candy_meta

    food_meta = slice_theme("food", SOURCES["food_items"], FOOD_CATALOG)
    if food_meta:
        manifest["themes"]["food"] = food_meta

    manifest_path = os.path.join(SCRIPT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n[COMPLETE] Emitted GPT manifest: {manifest_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
