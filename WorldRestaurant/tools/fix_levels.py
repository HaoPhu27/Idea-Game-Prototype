import json
import os

LEVELS_DIR = r"d:\Linh tinh\WorldRestaurant\levels"

levels = {}

# Level 1: 5x5, CL=4, Tutorial. Target on border.
levels["001"] = {
    "id": "001", "name": "Level 1 - First Steps [TUTORIAL]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "T"],
        ["L", "L", "L", "L", "L"],
        ["L", "L", "S", "L", "L"],
        ["L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 2, "y": 3 }
}

# Level 2: 6x6, CL=6, Tutorial. Road from top edge (3,0) -> (3,1) -> (3,2). Target at (2,2) adj R(3,2).
levels["002"] = {
    "id": "002", "name": "Level 2 - Follow the Road [TUTORIAL]",
    "cloudLimit": 6,
    "grid": [
        ["L", "L", "L", "R", "L", "L"],
        ["L", "L", "L", "R", "L", "L"],
        ["L", "L", "T", "R", "L", "L"],
        ["L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 4 }
}

# Level 3: 5x5, CL=2, Tutorial Split. 2 Targets: T(0,1) border, T(1,1) adj R(2,1). Road from top (2,0)->(2,1).
levels["003"] = {
    "id": "003", "name": "Level 3 - The First Split [TUTORIAL]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "R", "L", "L"],
        ["T", "T", "R", "L", "L"],
        ["L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 4 }
}

# Level 4: 6x6, CL=2, Tutorial Road. Road runs from bottom edge (2,5)->(2,4)->(2,3)->(2,2). Targets T(1,2), T(1,3) adj Road.
levels["004"] = {
    "id": "004", "name": "Level 4 - Road Guide [TUTORIAL]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L"],
        ["L", "T", "R", "L", "L", "L"],
        ["L", "T", "R", "L", "L", "L"],
        ["L", "L", "R", "L", "L", "L"],
        ["L", "L", "R", "L", "S", "L"]
    ],
    "spawnPosition": { "x": 4, "y": 5 }
}

# Level 5: 7x7, CL=4, Tutorial. 4 Targets 2x2 on top-left border.
levels["005"] = {
    "id": "005", "name": "Level 5 - Four In A Row [TUTORIAL]",
    "cloudLimit": 4,
    "grid": [
        ["T", "T", "L", "L", "L", "L", "L"],
        ["T", "T", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "S", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 3, "y": 4 }
}

# Level 6: 6x6, CL=2, Beginner. Road from top edge (3,0)->(3,1)->(3,2)->(3,3). Targets T(2,2), T(2,3) adj Road.
levels["006"] = {
    "id": "006", "name": "Level 6 - Street Front [BEGINNER]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "L", "R", "L", "L"],
        ["L", "L", "L", "R", "L", "L"],
        ["L", "L", "T", "R", "L", "L"],
        ["L", "L", "T", "R", "L", "L"],
        ["L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 5 }
}

# Level 7: 6x6, CL=2, Beginner. Road from left edge (0,2)->(1,2)->(2,2). Targets T(1,1), T(2,1) adj Road.
levels["007"] = {
    "id": "007", "name": "Level 7 - Left Wall [BEGINNER]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "L", "L", "L", "L"],
        ["L", "T", "T", "L", "L", "L"],
        ["R", "R", "R", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "S", "L"],
        ["L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 4, "y": 4 }
}

# Level 8: 7x7, CL=4, Beginner. Road from top edge (4,0)->(4,1)->(4,2)->(4,3). Targets 2x2 at (2,2),(3,2),(2,3),(3,3). (2,2) adj border/R, (3,2),(3,3) adj R.
levels["008"] = {
    "id": "008", "name": "Level 8 - The Square [BEGINNER]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "L", "L", "R", "L", "L"],
        ["L", "L", "L", "L", "R", "L", "L"],
        ["L", "L", "T", "T", "R", "L", "L"],
        ["L", "L", "T", "T", "R", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 5 }
}

# Level 9: 7x7, CL=4, Beginner. Targets 2x2 on right border (5,2),(6,2),(5,3),(6,3). Road from bottom edge (4,6)->(4,5)->(4,4)->(4,3)->(4,2).
levels["009"] = {
    "id": "009", "name": "Level 9 - Right Side [BEGINNER]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "R", "T", "T"],
        ["L", "L", "L", "L", "R", "T", "T"],
        ["L", "L", "L", "L", "R", "L", "L"],
        ["L", "L", "L", "L", "R", "L", "L"],
        ["L", "S", "L", "L", "R", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 6 }
}

# Level 10: 7x7, CL=4, Beginner. Road from bottom edge (3,6)->(3,5)->(3,4). Targets T(1,3),(2,3),(1,4),(2,4) with (2,4) adj R(3,4) and (2,3) adj R(2,2)<-road from top (2,0)->(2,1)->(2,2).
levels["010"] = {
    "id": "010", "name": "Level 10 - Bottom Corner [BEGINNER]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "R", "L", "L", "L", "L"],
        ["L", "L", "R", "L", "L", "L", "L"],
        ["L", "L", "R", "L", "L", "L", "L"],
        ["L", "T", "T", "L", "L", "L", "L"],
        ["L", "T", "T", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "L", "S", "L"]
    ],
    "spawnPosition": { "x": 5, "y": 6 }
}

# Level 11: 7x7, CL=4, Normal. Road from left edge (0,2)->(1,2)->(2,2)->(3,2)->(4,2). Targets 2x2 at (2,0),(3,0),(2,1),(3,1) on top border and adj R(2,2),(3,2).
levels["011"] = {
    "id": "011", "name": "Level 11 - Top Avenue [NORMAL]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "T", "T", "L", "L", "L"],
        ["L", "L", "T", "T", "L", "L", "L"],
        ["R", "R", "R", "R", "R", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "S", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 4, "y": 5 }
}

# Level 12: 7x7, CL=6, Normal. Cross Avenue from top edge (3,0) to bottom (3,6) and left (0,3) to right (6,3). Targets 2x2 at (1,1),(2,1),(1,2),(2,2) adj R(3,1),(3,2),(1,3),(2,3).
levels["012"] = {
    "id": "012", "name": "Level 12 - Central Park [NORMAL]",
    "cloudLimit": 6,
    "grid": [
        ["L", "L", "L", "R", "L", "L", "L"],
        ["L", "T", "T", "R", "L", "L", "L"],
        ["L", "T", "T", "R", "L", "L", "L"],
        ["R", "R", "R", "R", "R", "R", "R"],
        ["L", "L", "L", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "L", "S", "L"],
        ["L", "L", "L", "R", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 5, "y": 5 }
}

# Level 13: 7x7, CL=4, Hard. Road from left edge (0,2)->(4,2), then (2,3)->(2,6) to bottom. Targets 2x2 at (0,3),(1,3),(0,4),(1,4) on left border and adj R.
levels["013"] = {
    "id": "013", "name": "Level 13 - Narrow Alley [HARD]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["R", "R", "R", "R", "R", "L", "L"],
        ["T", "T", "R", "L", "L", "L", "L"],
        ["T", "T", "R", "L", "L", "L", "L"],
        ["L", "L", "R", "L", "L", "L", "L"],
        ["L", "L", "R", "L", "L", "S", "L"]
    ],
    "spawnPosition": { "x": 5, "y": 6 }
}

# Level 14: 7x7, CL=2, Super Hard. 1x4 horizontal line T(1,3)(2,3)(3,3)(4,3). Road connected from left edge (0,2)->(5,2) and (0,4)->(5,4), and (5,3).
levels["014"] = {
    "id": "014", "name": "Level 14 - Four In Line [SUPER HARD]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["R", "R", "R", "R", "R", "R", "L"],
        ["L", "T", "T", "T", "T", "R", "L"],
        ["R", "R", "R", "R", "R", "R", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 6 }
}

# Level 15: 7x7, CL=6, Normal. Road from top edge (3,0)->(3,6) and left (0,3)->(6,3). Targets 2x2 at (4,1),(5,1),(4,2),(5,2) adj R.
levels["015"] = {
    "id": "015", "name": "Level 15 - The Moat [NORMAL]",
    "cloudLimit": 6,
    "grid": [
        ["L", "L", "L", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "T", "T", "L"],
        ["L", "L", "L", "R", "T", "T", "L"],
        ["R", "R", "R", "R", "R", "R", "R"],
        ["L", "L", "L", "R", "L", "L", "L"],
        ["L", "S", "L", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 5 }
}

# Level 16: 8x8, CL=4, Hard. 4x1 vertical line on right border col 7: T(7,0)(7,1)(7,2)(7,3). Road at col 6 from top edge (6,0)->(6,5).
levels["016"] = {
    "id": "016", "name": "Level 16 - The Tower [HARD]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "L", "L", "L", "L", "R", "T"],
        ["L", "L", "L", "L", "L", "L", "R", "T"],
        ["L", "L", "L", "L", "L", "L", "R", "T"],
        ["L", "L", "L", "L", "L", "L", "R", "T"],
        ["L", "L", "L", "L", "L", "L", "R", "L"],
        ["L", "L", "L", "L", "L", "L", "R", "L"],
        ["L", "L", "L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 7 }
}

# Level 17: 7x7, CL=2, Super Hard. S-tetromino T(0,1), T(0,2), T(1,2), T(1,3). Road from left border (0,0)->(1,0)->(1,1) and (0,4)->(1,4)->(2,4) and (2,1)->(2,2)->(2,3).
levels["017"] = {
    "id": "017", "name": "Level 17 - The Serpent [SUPER HARD]",
    "cloudLimit": 2,
    "grid": [
        ["R", "R", "L", "L", "L", "L", "L"],
        ["T", "R", "R", "L", "L", "L", "L"],
        ["T", "T", "R", "L", "L", "L", "L"],
        ["L", "T", "R", "L", "L", "L", "L"],
        ["R", "R", "R", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "S", "L"]
    ],
    "spawnPosition": { "x": 5, "y": 6 }
}

# Level 18: 8x8, CL=6, Normal. Grand Avenue from top (3,0)->(3,7) and bottom (4,0)->(4,7). Targets 2x2 at (1,2),(2,2),(1,3),(2,3) adj R.
levels["018"] = {
    "id": "018", "name": "Level 18 - Grand Avenue [NORMAL]",
    "cloudLimit": 6,
    "grid": [
        ["L", "L", "L", "R", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "R", "L", "L", "L"],
        ["L", "T", "T", "R", "R", "L", "L", "L"],
        ["L", "T", "T", "R", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "R", "L", "L", "L"],
        ["L", "L", "L", "R", "R", "L", "L", "L"],
        ["L", "S", "L", "R", "R", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 7 }
}

# Level 19: 8x8, CL=4, Hard. L-tetromino T(2,2)(3,2)(4,2) and T(2,3). Road connected from top edge (2,0)->(5,0), (2,1)->(5,1) and (5,2)->(5,3) and (1,3)->(1,4)->(0,4) to left edge.
levels["019"] = {
    "id": "019", "name": "Level 19 - The Boot [HARD]",
    "cloudLimit": 4,
    "grid": [
        ["L", "L", "R", "R", "R", "R", "L", "L"],
        ["L", "L", "R", "R", "R", "R", "L", "L"],
        ["L", "L", "T", "T", "T", "R", "L", "L"],
        ["L", "R", "T", "R", "R", "R", "L", "L"],
        ["R", "R", "R", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L", "L"],
        ["L", "S", "L", "L", "L", "L", "L", "L"]
    ],
    "spawnPosition": { "x": 1, "y": 7 }
}

# Level 20: 8x8, CL=2, Super Hard. Z-tetromino T(2,3)(3,3)(3,4)(4,4). Road connected from top edge (2,0)->(2,2) and (5,0)->(5,5) and left edge (0,5)->(5,5).
levels["020"] = {
    "id": "020", "name": "Level 20 - The Final Zigzag [SUPER HARD]",
    "cloudLimit": 2,
    "grid": [
        ["L", "L", "R", "L", "L", "R", "L", "L"],
        ["L", "L", "R", "L", "L", "R", "L", "L"],
        ["L", "L", "R", "R", "R", "R", "L", "L"],
        ["L", "L", "T", "T", "R", "R", "L", "L"],
        ["L", "L", "R", "T", "T", "R", "L", "L"],
        ["R", "R", "R", "R", "R", "R", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "L", "L"],
        ["L", "L", "L", "L", "L", "L", "S", "L"]
    ],
    "spawnPosition": { "x": 6, "y": 7 }
}

for num_key, lvl_data in levels.items():
    file_path = os.path.join(LEVELS_DIR, f"level_{num_key}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(lvl_data, f, indent=4, ensure_ascii=False)
    print(f"Updated {file_path}")
