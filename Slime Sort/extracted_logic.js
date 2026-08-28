
// ============================================================
// Block Blast Flow! — Game Configuration
// Global namespace: window.CONFIG, window.COLORS, window.THEME
// ============================================================

window.CONFIG = {
    // --- Canvas & Layout ---
    GAME_WIDTH: 450,
    GAME_HEIGHT: 800,

    // --- Grid ---
    GRID_COLS: 6,
    GRID_ROWS: 6,
    CELL_SIZE: 42,
    CELL_DRAW: 39,
    CELL_RADIUS: 5,
    BOARD_OFFSET_X: 99,
    BOARD_OFFSET_Y: 135,

    // --- Board Container ---
    CONTAINER_X: 225,
    CONTAINER_TOP: 120,
    CONTAINER_WIDTH: 300,
    CONTAINER_GRID_BOTTOM: 400,
    CONTAINER_FUNNEL_BOTTOM: 455,
    FUNNEL_DRAIN_WIDTH: 40,
    CONTAINER_RADIUS: 16,
    CONTAINER_BORDER: 4,

    // --- Conveyor ---
    CONVEYOR_CENTER_X: 225,
    CONVEYOR_CENTER_Y: 490,
    CONVEYOR_WIDTH: 340,
    CONVEYOR_HEIGHT: 40,
    CONVEYOR_CORNER_R: 20,
    CONVEYOR_CAPACITY: 80,
    CONVEYOR_SPEED: 0.2,
    CLEANUP_SPEED_MULT: 2,
    CAR_ABSORB_RADIUS: 80,     // pixel radius around car that pulls cubes off the belt
    CUBE_ABSORB_DURATION: 200, // ms for cube tween into car

    // --- Warning ---
    CONV_WARNING: 0.75,
    CONV_DANGER: 0.90,

    // --- Road ---
    ROAD_Y: 526,
    ROAD_HEIGHT: 22,

    // --- Cars ---
    CAR_ROW1_Y: 585,
    CAR_ROW2_Y: 660,
    CAR_WIDTH: 90,
    CAR_HEIGHT: 55,
    CAR_ROW2_SCALE: 0.7,
    CAR_ROW2_ALPHA: 0.6,
    CAR_COL_POSITIONS: [82, 190, 298],
    CAR_UNLOCK_X: 390,

    // --- Cubes ---
    CUBE_SIZE: 10,
    CUBES_PER_CELL: 8,
    CUBE_POOL_SIZE: 200,

    // --- Funnel ---
    FUNNEL_CAPACITY: 64,
    DRAIN_INTERVAL: 120,

    // --- Physics ---
    GRAVITY_Y: 2,
    CUBE_RESTITUTION: 0.1,
    CUBE_FRICTION: 0.5,
    CUBE_FRICTION_STATIC: 1,
    CUBE_FRICTION_AIR: 0.05,
    CUBE_DENSITY: 0.001,
    CUBE_LINEAR_DAMPING: 0.05,

    // --- Animation ---
    SHAKE_DURATION: 50,
    SHAKE_INTENSITY: 6,
    SHAKE_REPEATS: 1,
    LIFT_DURATION: 150,
    LIFT_DISTANCE: 120,
    BLAST_SCALE_UP: 1.2,
    BLAST_DURATION: 100,
    CUBE_BURST_DELAY: 50,
    CAR_EXIT_DURATION: 500,
    CAR_ADVANCE_DURATION: 300,
    REVIVE_FLY_DURATION_1: 320,  // ms: cube arcs to screen center (was 180)
    REVIVE_FLY_DURATION_2: 420,  // ms: cube zooms into car (was 260)
    REVIVE_GATHER_X: 225,        // X of the gather point (screen center)
    REVIVE_GATHER_Y: 360,        // Y of the gather point (upper-center)

    // --- Boosters ---
    BOOSTER_START_COUNT: 10,

    // --- Header & Boosters ---
    HEADER_HEIGHT: 50,
    BOOSTER_AREA_Y: 58,
    BOOSTER_BTN_SIZE: 52,

    // --- Layer ---
    LAYER_OVERLAYS: [0.0, 0.25, 0.45],
    MAX_INTERACTION_DEPTH: 3,
    XRAY_TOP_ALPHA: 0,           // opacity of top-layer blocks when X-Ray is active (0 = fully invisible)
    XRAY_LOWER_OVERLAY: 0.02,   // dark overlay remaining on sub-layers in X-Ray mode
    XRAY_HOLD_DELAY: 300,        // ms user must hold a block before X-Ray peek activates
};

// ============================================================
// Color Definitions
// ============================================================
window.COLORS = {
    red: { hex: 0xE74C3C, css: '#E74C3C', light: 0xF1948A, dark: 0xC0392B },
    blue: { hex: 0x3498DB, css: '#3498DB', light: 0x85C1E9, dark: 0x2471A3 },
    green: { hex: 0x2ECC71, css: '#2ECC71', light: 0x82E0AA, dark: 0x1E8449 },
    yellow: { hex: 0xF1C40F, css: '#F1C40F', light: 0xF7DC6F, dark: 0xD4AC0D },
    orange: { hex: 0xE67E22, css: '#E67E22', light: 0xF0B27A, dark: 0xCA6F1E },
    purple: { hex: 0x9B59B6, css: '#9B59B6', light: 0xC39BD3, dark: 0x7D3C98 },
    pink: { hex: 0xE91E8A, css: '#E91E8A', light: 0xF48FB1, dark: 0xC2185B },
    cyan: { hex: 0x1ABC9C, css: '#1ABC9C', light: 0x76D7C4, dark: 0x148F77 },
};

window.COLOR_NAMES = Object.keys(window.COLORS);

// ============================================================
// Theme / UI Colors
// ============================================================
window.THEME = {
    BG: 0x2D2D3D,
    BG_CSS: '#2D2D3D',
    CONTAINER_FILL: 0x3A3A4A,
    CONTAINER_STROKE: 0x555568,
    GRID_EMPTY: 0x353545,
    GRID_EMPTY_LIGHT: 0x404055,
    ROAD_SURFACE: 0x555568,
    ROAD_DASH: 0xF1C40F,
    ROAD_EDGE: 0x888899,
    BOOSTER_BG: 0x4A7BD9,
    BOOSTER_BG_LIGHT: 0x5B8CE6,
    HEADER_TEXT: 0xFFFFFF,
    HEADER_SUB: 0xBBBBCC,
    UI_PANEL: 0x3A3A4A,
    UI_PANEL_BORDER: 0x555568,
    OVERLAY_DIM: 0x000000,
    WARNING_ORANGE: 0xE67E22,
    DANGER_RED: 0xE74C3C,
    SUCCESS_GREEN: 0x2ECC71,
    COIN_GOLD: 0xF1C40F,
    WHITE: 0xFFFFFF,
    TEXT_DARK: 0x2D2D3D,
};




// ============================================================
// Block Shape Definitions — window.SHAPES
// Each shape: array of [row, col] offsets from anchor (0,0)
// ============================================================

window.SHAPES = {
    // --- Simple shapes (early levels) ---
    DOT:  { name: 'DOT',  cells: [[0,0]], unitCount: 1 },
    I2:   { name: 'I2',   cells: [[0,0],[0,1]], unitCount: 2 },
    I2V:  { name: 'I2V',  cells: [[0,0],[1,0]], unitCount: 2 },
    I3:   { name: 'I3',   cells: [[0,0],[0,1],[0,2]], unitCount: 3 },
    I3V:  { name: 'I3V',  cells: [[0,0],[1,0],[2,0]], unitCount: 3 },
    L2:   { name: 'L2',   cells: [[0,0],[1,0],[1,1]], unitCount: 3 },
    L2R:  { name: 'L2R',  cells: [[0,1],[1,0],[1,1]], unitCount: 3 },
    L2TL: { name: 'L2TL', cells: [[0,0],[0,1],[1,0]], unitCount: 3 },
    L2TR: { name: 'L2TR', cells: [[0,0],[0,1],[1,1]], unitCount: 3 },

    // --- Tetrominos ---
    O:    { name: 'O',    cells: [[0,0],[0,1],[1,0],[1,1]], unitCount: 4 },
    I4:   { name: 'I4',   cells: [[0,0],[0,1],[0,2],[0,3]], unitCount: 4 },
    I4V:  { name: 'I4V',  cells: [[0,0],[1,0],[2,0],[3,0]], unitCount: 4 },
    T:    { name: 'T',    cells: [[0,0],[0,1],[0,2],[1,1]], unitCount: 4 },
    TD:   { name: 'TD',   cells: [[0,1],[1,0],[1,1],[1,2]], unitCount: 4 },
    TL:   { name: 'TL',   cells: [[0,0],[1,0],[1,1],[2,0]], unitCount: 4 },
    TR:   { name: 'TR',   cells: [[0,1],[1,0],[1,1],[2,1]], unitCount: 4 },
    L:    { name: 'L',    cells: [[0,0],[1,0],[2,0],[2,1]], unitCount: 4 },
    LR:   { name: 'LR',   cells: [[0,0],[0,1],[1,0],[2,0]], unitCount: 4 },
    J:    { name: 'J',    cells: [[0,1],[1,1],[2,0],[2,1]], unitCount: 4 },
    JR:   { name: 'JR',   cells: [[0,0],[0,1],[1,1],[2,1]], unitCount: 4 },
    LH1:  { name: 'LH1',  cells: [[0,0],[1,0],[1,1],[1,2]], unitCount: 4 },
    LH2:  { name: 'LH2',  cells: [[0,2],[1,0],[1,1],[1,2]], unitCount: 4 },
    JH1:  { name: 'JH1',  cells: [[0,0],[0,1],[0,2],[1,0]], unitCount: 4 },
    JH2:  { name: 'JH2',  cells: [[0,0],[0,1],[0,2],[1,2]], unitCount: 4 },
    S:    { name: 'S',    cells: [[0,1],[0,2],[1,0],[1,1]], unitCount: 4 },
    SV:   { name: 'SV',   cells: [[0,0],[1,0],[1,1],[2,1]], unitCount: 4 },
    Z:    { name: 'Z',    cells: [[0,0],[0,1],[1,1],[1,2]], unitCount: 4 },
    ZV:   { name: 'ZV',   cells: [[0,1],[1,0],[1,1],[2,0]], unitCount: 4 },
};

window.ShapeUtils = {
    getBounds(shapeName) {
        const shape = window.SHAPES[shapeName];
        if (!shape) return null;
        let maxR = 0, maxC = 0;
        for (const [r, c] of shape.cells) {
            if (r > maxR) maxR = r;
            if (c > maxC) maxC = c;
        }
        return { rows: maxR + 1, cols: maxC + 1 };
    },
    getCubeCount(shapeName) {
        const shape = window.SHAPES[shapeName];
        if (!shape) return 0;
        return shape.unitCount * CONFIG.CUBES_PER_CELL;
    }
};




// ============================================================
// Level Definitions — window.LEVELS
// Auto-generated by Level Editor on 2026-06-29T06:51:34.428Z
// ============================================================

window.LEVELS = [
    {
        "id": 1,
        "name": "Tutorials GamePlay",
        "difficulty": "Tutorial",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b32",
                        "shape": "DOT",
                        "color": "red",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b35",
                        "shape": "DOT",
                        "color": "blue",
                        "row": 2,
                        "col": 3
                    },
                    {
                        "id": "b36",
                        "shape": "DOT",
                        "color": "blue",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b37",
                        "shape": "DOT",
                        "color": "red",
                        "row": 3,
                        "col": 2
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "red",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 8,
                "queueOrder": 1
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 2,
        "name": "New Level",
        "difficulty": "Easy",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b34",
                        "shape": "L2",
                        "color": "red",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b35",
                        "shape": "L2TR",
                        "color": "blue",
                        "row": 3,
                        "col": 1
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 0
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 3,
        "name": "New Level",
        "difficulty": "Normal",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b36",
                        "shape": "T",
                        "color": "green",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b37",
                        "shape": "L2R",
                        "color": "red",
                        "row": 0,
                        "col": 2
                    },
                    {
                        "id": "b38",
                        "shape": "LR",
                        "color": "blue",
                        "row": 0,
                        "col": 4
                    },
                    {
                        "id": "b39",
                        "shape": "I4V",
                        "color": "green",
                        "row": 1,
                        "col": 5
                    },
                    {
                        "id": "b40",
                        "shape": "TD",
                        "color": "red",
                        "row": 4,
                        "col": 3
                    },
                    {
                        "id": "b41",
                        "shape": "S",
                        "color": "yellow",
                        "row": 3,
                        "col": 2
                    },
                    {
                        "id": "b42",
                        "shape": "L2TL",
                        "color": "green",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b43",
                        "shape": "JR",
                        "color": "blue",
                        "row": 3,
                        "col": 0
                    },
                    {
                        "id": "b44",
                        "shape": "DOT",
                        "color": "green",
                        "row": 5,
                        "col": 2
                    },
                    {
                        "id": "b45",
                        "shape": "L2",
                        "color": "yellow",
                        "row": 1,
                        "col": 0
                    },
                    {
                        "id": "b46",
                        "shape": "I2V",
                        "color": "red",
                        "row": 4,
                        "col": 0
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "green",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 8,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 8,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 8,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 8,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 8,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 8,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 9
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 10
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 4,
        "name": "New Level",
        "difficulty": "Easy",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b1",
                        "shape": "L2R",
                        "color": "purple",
                        "row": 4,
                        "col": 4
                    },
                    {
                        "id": "b2",
                        "shape": "L2TL",
                        "color": "purple",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b3",
                        "shape": "L2TR",
                        "color": "purple",
                        "row": 0,
                        "col": 4
                    },
                    {
                        "id": "b5",
                        "shape": "L2",
                        "color": "purple",
                        "row": 4,
                        "col": 0
                    },
                    {
                        "id": "b6",
                        "shape": "L2R",
                        "color": "pink",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b7",
                        "shape": "L2",
                        "color": "pink",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b8",
                        "shape": "L2TL",
                        "color": "pink",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b9",
                        "shape": "L2TR",
                        "color": "pink",
                        "row": 3,
                        "col": 1
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 3
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 5,
        "name": "Tutorial Layer",
        "difficulty": "Tutorial",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b3",
                        "shape": "I2",
                        "color": "green",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b4",
                        "shape": "L2",
                        "color": "red",
                        "row": 2,
                        "col": 1
                    },
                    {
                        "id": "b5",
                        "shape": "L2R",
                        "color": "blue",
                        "row": 2,
                        "col": 3
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b6",
                        "shape": "O",
                        "color": "yellow",
                        "row": 2,
                        "col": 2
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 8,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 1
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 6,
        "name": "Unlock Magnet",
        "difficulty": "Normal",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b39",
                        "shape": "O",
                        "color": "cyan",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b40",
                        "shape": "O",
                        "color": "cyan",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b41",
                        "shape": "O",
                        "color": "cyan",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b42",
                        "shape": "O",
                        "color": "cyan",
                        "row": 3,
                        "col": 1
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b35",
                        "shape": "L2R",
                        "color": "orange",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b36",
                        "shape": "L2",
                        "color": "orange",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b37",
                        "shape": "L2TL",
                        "color": "orange",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b38",
                        "shape": "L2TR",
                        "color": "orange",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b43",
                        "shape": "O",
                        "color": "orange",
                        "row": 2,
                        "col": 2
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b17",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 3,
                        "col": 2
                    },
                    {
                        "id": "b18",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 2,
                        "col": 3
                    },
                    {
                        "id": "b19",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 2,
                        "col": 1
                    },
                    {
                        "id": "b20",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 4,
                        "col": 3
                    },
                    {
                        "id": "b21",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 4,
                        "col": 1
                    },
                    {
                        "id": "b22",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 1,
                        "col": 4
                    },
                    {
                        "id": "b23",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 3,
                        "col": 4
                    },
                    {
                        "id": "b24",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 5,
                        "col": 4
                    },
                    {
                        "id": "b25",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 1,
                        "col": 2
                    },
                    {
                        "id": "b26",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 1,
                        "col": 0
                    },
                    {
                        "id": "b27",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 3,
                        "col": 0
                    },
                    {
                        "id": "b28",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 5,
                        "col": 0
                    },
                    {
                        "id": "b29",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 5,
                        "col": 2
                    },
                    {
                        "id": "b30",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 4,
                        "col": 5
                    },
                    {
                        "id": "b31",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 2,
                        "col": 5
                    },
                    {
                        "id": "b32",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 0,
                        "col": 5
                    },
                    {
                        "id": "b33",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 0,
                        "col": 3
                    },
                    {
                        "id": "b34",
                        "shape": "DOT",
                        "color": "pink",
                        "row": 0,
                        "col": 1
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 8,
                "queueOrder": 5
            },
            {
                "column": 0,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 0,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 7,
        "name": "Unlock Magnet",
        "difficulty": "Hard",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b52",
                        "shape": "O",
                        "color": "blue",
                        "row": 2,
                        "col": 1
                    },
                    {
                        "id": "b53",
                        "shape": "JH2",
                        "color": "yellow",
                        "row": 1,
                        "col": 2
                    },
                    {
                        "id": "b54",
                        "shape": "LH2",
                        "color": "red",
                        "row": 3,
                        "col": 2
                    },
                    {
                        "id": "b55",
                        "shape": "L2",
                        "color": "pink",
                        "row": 4,
                        "col": 1
                    },
                    {
                        "id": "b56",
                        "shape": "L2TL",
                        "color": "purple",
                        "row": 1,
                        "col": 0
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b48",
                        "shape": "L2TR",
                        "color": "orange",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b49",
                        "shape": "SV",
                        "color": "purple",
                        "row": 2,
                        "col": 3
                    },
                    {
                        "id": "b50",
                        "shape": "TD",
                        "color": "pink",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b51",
                        "shape": "O",
                        "color": "cyan",
                        "row": 1,
                        "col": 1
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b44",
                        "shape": "LH2",
                        "color": "red",
                        "row": 3,
                        "col": 2
                    },
                    {
                        "id": "b45",
                        "shape": "JH1",
                        "color": "blue",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b46",
                        "shape": "ZV",
                        "color": "yellow",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b47",
                        "shape": "ZV",
                        "color": "green",
                        "row": 2,
                        "col": 1
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 8,
                "queueOrder": 7
            },
            {
                "column": 0,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 8,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 8,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 7
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 9,
        "name": "New Level",
        "difficulty": "Hard",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b16",
                        "shape": "O",
                        "color": "orange",
                        "row": 2,
                        "col": 0
                    },
                    {
                        "id": "b17",
                        "shape": "O",
                        "color": "orange",
                        "row": 2,
                        "col": 4
                    },
                    {
                        "id": "b18",
                        "shape": "I4V",
                        "color": "purple",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b19",
                        "shape": "I4V",
                        "color": "pink",
                        "row": 2,
                        "col": 3
                    },
                    {
                        "id": "b20",
                        "shape": "L2R",
                        "color": "blue",
                        "row": 0,
                        "col": 1
                    },
                    {
                        "id": "b21",
                        "shape": "L2",
                        "color": "red",
                        "row": 0,
                        "col": 3
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b11",
                        "shape": "L2TL",
                        "color": "green",
                        "row": 2,
                        "col": 4
                    },
                    {
                        "id": "b12",
                        "shape": "L2TR",
                        "color": "green",
                        "row": 2,
                        "col": 0
                    },
                    {
                        "id": "b13",
                        "shape": "O",
                        "color": "green",
                        "row": 4,
                        "col": 2
                    },
                    {
                        "id": "b14",
                        "shape": "JR",
                        "color": "yellow",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b15",
                        "shape": "LR",
                        "color": "yellow",
                        "row": 1,
                        "col": 3
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b3",
                        "shape": "SV",
                        "color": "red",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b4",
                        "shape": "ZV",
                        "color": "red",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b6",
                        "shape": "L2",
                        "color": "blue",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b7",
                        "shape": "L2R",
                        "color": "blue",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b8",
                        "shape": "LR",
                        "color": "blue",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b9",
                        "shape": "JR",
                        "color": "blue",
                        "row": 0,
                        "col": 4
                    },
                    {
                        "id": "b10",
                        "shape": "I2",
                        "color": "blue",
                        "row": 1,
                        "col": 2
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 0,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 8,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 9
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 10
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 11
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 12
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 13
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 9
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 10,
        "name": "Unlock Frozen Block",
        "difficulty": "Tutorial",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b22",
                        "shape": "I2",
                        "color": "red",
                        "row": 2,
                        "col": 2,
                        "frozenCount": 2
                    },
                    {
                        "id": "b23",
                        "shape": "LH1",
                        "color": "blue",
                        "row": 2,
                        "col": 1
                    },
                    {
                        "id": "b24",
                        "shape": "JH2",
                        "color": "green",
                        "row": 1,
                        "col": 2
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 1
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 11,
        "name": "Unlock Paint Gun",
        "difficulty": "Normal",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 40,
        "funnelCapacity": 40,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b14",
                        "shape": "L2TL",
                        "color": "yellow",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b15",
                        "shape": "L2R",
                        "color": "green",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b16",
                        "shape": "L2TR",
                        "color": "blue",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b17",
                        "shape": "L2",
                        "color": "red",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b18",
                        "shape": "DOT",
                        "color": "green",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b19",
                        "shape": "DOT",
                        "color": "red",
                        "row": 2,
                        "col": 3
                    },
                    {
                        "id": "b20",
                        "shape": "DOT",
                        "color": "blue",
                        "row": 3,
                        "col": 2
                    },
                    {
                        "id": "b21",
                        "shape": "DOT",
                        "color": "yellow",
                        "row": 3,
                        "col": 3
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b6",
                        "shape": "I2V",
                        "color": "purple",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b7",
                        "shape": "I2V",
                        "color": "purple",
                        "row": 3,
                        "col": 4
                    },
                    {
                        "id": "b8",
                        "shape": "I2",
                        "color": "purple",
                        "row": 1,
                        "col": 2
                    },
                    {
                        "id": "b9",
                        "shape": "I2",
                        "color": "purple",
                        "row": 4,
                        "col": 2
                    },
                    {
                        "id": "b10",
                        "shape": "L2TL",
                        "color": "purple",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b11",
                        "shape": "L2R",
                        "color": "purple",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b12",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b13",
                        "shape": "DOT",
                        "color": "purple",
                        "row": 2,
                        "col": 2
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b22",
                        "shape": "O",
                        "color": "red",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b23",
                        "shape": "O",
                        "color": "yellow",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b24",
                        "shape": "O",
                        "color": "green",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b26",
                        "shape": "O",
                        "color": "blue",
                        "row": 3,
                        "col": 3
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 8
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 12,
        "name": "New Level",
        "difficulty": "Normal",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b30",
                        "shape": "O",
                        "color": "pink",
                        "row": 2,
                        "col": 2,
                        "frozenCount": 2
                    },
                    {
                        "id": "b35",
                        "shape": "JH1",
                        "color": "purple",
                        "row": 1,
                        "col": 1
                    },
                    {
                        "id": "b36",
                        "shape": "LH2",
                        "color": "purple",
                        "row": 3,
                        "col": 2
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b25",
                        "shape": "O",
                        "color": "green",
                        "row": 1,
                        "col": 1,
                        "frozenCount": 4
                    },
                    {
                        "id": "b26",
                        "shape": "TR",
                        "color": "blue",
                        "row": 2,
                        "col": 2
                    },
                    {
                        "id": "b27",
                        "shape": "JR",
                        "color": "red",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b28",
                        "shape": "L2",
                        "color": "yellow",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b29",
                        "shape": "DOT",
                        "color": "yellow",
                        "row": 4,
                        "col": 4
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 13,
        "name": "Unlock Key/Lock Block",
        "difficulty": "Tutorial",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b43",
                        "shape": "L2TR",
                        "color": "purple",
                        "row": 1,
                        "col": 1,
                        "frozenCount": 2
                    },
                    {
                        "id": "b44",
                        "shape": "L2TL",
                        "color": "purple",
                        "row": 3,
                        "col": 1,
                        "frozenCount": 1
                    },
                    {
                        "id": "b45",
                        "shape": "L2",
                        "color": "purple",
                        "row": 3,
                        "col": 3
                    },
                    {
                        "id": "b46",
                        "shape": "L2R",
                        "color": "purple",
                        "row": 1,
                        "col": 3,
                        "frozenCount": 3
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b37",
                        "shape": "O",
                        "color": "blue",
                        "row": 2,
                        "col": 2,
                        "lockColor": "yellow"
                    },
                    {
                        "id": "b39",
                        "shape": "L2R",
                        "color": "red",
                        "row": 3,
                        "col": 3,
                        "keyColor": "yellow"
                    },
                    {
                        "id": "b40",
                        "shape": "L2",
                        "color": "red",
                        "row": 3,
                        "col": 1
                    },
                    {
                        "id": "b41",
                        "shape": "L2TR",
                        "color": "red",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b42",
                        "shape": "L2TL",
                        "color": "red",
                        "row": 1,
                        "col": 1
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 4
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 17,
        "name": "New Level",
        "difficulty": "Hard",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b48",
                        "shape": "O",
                        "color": "blue",
                        "row": 4,
                        "col": 0
                    },
                    {
                        "id": "b49",
                        "shape": "O",
                        "color": "red",
                        "row": 4,
                        "col": 2
                    },
                    {
                        "id": "b50",
                        "shape": "O",
                        "color": "blue",
                        "row": 4,
                        "col": 4
                    },
                    {
                        "id": "b51",
                        "shape": "O",
                        "color": "blue",
                        "row": 2,
                        "col": 2,
                        "frozenCount": 4
                    },
                    {
                        "id": "b52",
                        "shape": "O",
                        "color": "blue",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b53",
                        "shape": "O",
                        "color": "blue",
                        "row": 0,
                        "col": 4
                    },
                    {
                        "id": "b54",
                        "shape": "O",
                        "color": "red",
                        "row": 0,
                        "col": 2
                    },
                    {
                        "id": "b55",
                        "shape": "O",
                        "color": "red",
                        "row": 2,
                        "col": 4
                    },
                    {
                        "id": "b56",
                        "shape": "O",
                        "color": "red",
                        "row": 2,
                        "col": 0
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b57",
                        "shape": "O",
                        "color": "purple",
                        "row": 1,
                        "col": 1,
                        "keyColor": "blue"
                    },
                    {
                        "id": "b58",
                        "shape": "O",
                        "color": "purple",
                        "row": 3,
                        "col": 3,
                        "lockColor": "red"
                    },
                    {
                        "id": "b59",
                        "shape": "O",
                        "color": "pink",
                        "row": 1,
                        "col": 3,
                        "keyColor": "red"
                    },
                    {
                        "id": "b60",
                        "shape": "O",
                        "color": "pink",
                        "row": 3,
                        "col": 1,
                        "lockColor": "blue"
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 1,
                "hidden": true
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 3,
                "hidden": true
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5,
                "hidden": true
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 7,
                "hidden": true
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1,
                "hidden": true
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 3,
                "hidden": true
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5,
                "hidden": true
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 7,
                "hidden": true
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 1,
                "hidden": true
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 3,
                "hidden": true
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 5,
                "hidden": true
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 7,
                "hidden": true
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    },
    {
        "id": 20,
        "name": "Supper Hard",
        "difficulty": "Super Hard",
        "boardSize": {
            "cols": 6,
            "rows": 6
        },
        "conveyorCapacity": 64,
        "funnelCapacity": 48,
        "layers": [
            {
                "index": 0,
                "blocks": [
                    {
                        "id": "b1",
                        "shape": "TL",
                        "color": "blue",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b2",
                        "shape": "TR",
                        "color": "blue",
                        "row": 3,
                        "col": 4
                    },
                    {
                        "id": "b3",
                        "shape": "LH1",
                        "color": "yellow",
                        "row": 4,
                        "col": 0
                    },
                    {
                        "id": "b4",
                        "shape": "JH2",
                        "color": "yellow",
                        "row": 0,
                        "col": 3
                    },
                    {
                        "id": "b5",
                        "shape": "Z",
                        "color": "green",
                        "row": 0,
                        "col": 1
                    },
                    {
                        "id": "b6",
                        "shape": "Z",
                        "color": "green",
                        "row": 4,
                        "col": 2
                    },
                    {
                        "id": "b7",
                        "shape": "TR",
                        "color": "red",
                        "row": 2,
                        "col": 0,
                        "keyColor": "purple"
                    },
                    {
                        "id": "b8",
                        "shape": "TL",
                        "color": "red",
                        "row": 1,
                        "col": 4
                    },
                    {
                        "id": "b9",
                        "shape": "O",
                        "color": "blue",
                        "row": 2,
                        "col": 2,
                        "lockColor": "purple"
                    }
                ]
            },
            {
                "index": 1,
                "blocks": [
                    {
                        "id": "b10",
                        "shape": "Z",
                        "color": "pink",
                        "row": 0,
                        "col": 0
                    },
                    {
                        "id": "b11",
                        "shape": "Z",
                        "color": "pink",
                        "row": 4,
                        "col": 3
                    },
                    {
                        "id": "b12",
                        "shape": "S",
                        "color": "orange",
                        "row": 4,
                        "col": 0
                    },
                    {
                        "id": "b13",
                        "shape": "S",
                        "color": "orange",
                        "row": 0,
                        "col": 3
                    },
                    {
                        "id": "b14",
                        "shape": "JH1",
                        "color": "pink",
                        "row": 3,
                        "col": 0
                    },
                    {
                        "id": "b15",
                        "shape": "JH2",
                        "color": "cyan",
                        "row": 3,
                        "col": 3,
                        "frozenCount": 1
                    },
                    {
                        "id": "b16",
                        "shape": "LH2",
                        "color": "pink",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b17",
                        "shape": "LH1",
                        "color": "cyan",
                        "row": 1,
                        "col": 0,
                        "frozenCount": 1
                    },
                    {
                        "id": "b18",
                        "shape": "I2",
                        "color": "purple",
                        "row": 0,
                        "col": 2,
                        "frozenCount": 2
                    },
                    {
                        "id": "b19",
                        "shape": "I2",
                        "color": "purple",
                        "row": 5,
                        "col": 2,
                        "frozenCount": 2
                    }
                ]
            },
            {
                "index": 2,
                "blocks": [
                    {
                        "id": "b20",
                        "shape": "I2V",
                        "color": "red",
                        "row": 1,
                        "col": 1,
                        "frozenCount": 5
                    },
                    {
                        "id": "b21",
                        "shape": "I2V",
                        "color": "red",
                        "row": 2,
                        "col": 4,
                        "frozenCount": 3
                    },
                    {
                        "id": "b22",
                        "shape": "I3",
                        "color": "red",
                        "row": 5,
                        "col": 1,
                        "frozenCount": 2
                    },
                    {
                        "id": "b23",
                        "shape": "I2",
                        "color": "blue",
                        "row": 3,
                        "col": 0
                    },
                    {
                        "id": "b24",
                        "shape": "L2TL",
                        "color": "blue",
                        "row": 1,
                        "col": 3
                    },
                    {
                        "id": "b25",
                        "shape": "L2TR",
                        "color": "blue",
                        "row": 4,
                        "col": 3
                    },
                    {
                        "id": "b26",
                        "shape": "I2",
                        "color": "green",
                        "row": 3,
                        "col": 2,
                        "keyColor": "blue"
                    },
                    {
                        "id": "b27",
                        "shape": "I3",
                        "color": "green",
                        "row": 0,
                        "col": 1,
                        "frozenCount": 3
                    },
                    {
                        "id": "b28",
                        "shape": "I2V",
                        "color": "yellow",
                        "row": 1,
                        "col": 2,
                        "lockColor": "blue"
                    },
                    {
                        "id": "b29",
                        "shape": "I3",
                        "color": "yellow",
                        "row": 4,
                        "col": 0,
                        "frozenCount": 3
                    }
                ]
            }
        ],
        "cars": [
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1,
                "hidden": true
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 3
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 4,
                "hidden": true
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 5,
                "hidden": true
            },
            {
                "column": 0,
                "color": "red",
                "capacity": 16,
                "queueOrder": 6
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 0,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8,
                "hidden": true
            },
            {
                "column": 0,
                "color": "green",
                "capacity": 8,
                "queueOrder": 9
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 10
            },
            {
                "column": 0,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 11
            },
            {
                "column": 0,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 12,
                "hidden": true
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 13
            },
            {
                "column": 0,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 14,
                "hidden": true
            },
            {
                "column": 0,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 15
            },
            {
                "column": 0,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 16
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 1,
                "hidden": true
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 1,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 3,
                "hidden": true
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 4
            },
            {
                "column": 1,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 1,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 6,
                "hidden": true
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 9
            },
            {
                "column": 1,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 10
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 11,
                "hidden": true
            },
            {
                "column": 1,
                "color": "red",
                "capacity": 16,
                "queueOrder": 12,
                "hidden": true
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 13,
                "hidden": true
            },
            {
                "column": 1,
                "color": "green",
                "capacity": 16,
                "queueOrder": 14
            },
            {
                "column": 1,
                "color": "yellow",
                "capacity": 8,
                "queueOrder": 15
            },
            {
                "column": 1,
                "color": "purple",
                "capacity": 16,
                "queueOrder": 16
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 0
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 16,
                "queueOrder": 1
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 2
            },
            {
                "column": 2,
                "color": "red",
                "capacity": 8,
                "queueOrder": 3
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 4,
                "hidden": true
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 5
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 6,
                "hidden": true
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 7
            },
            {
                "column": 2,
                "color": "orange",
                "capacity": 16,
                "queueOrder": 8
            },
            {
                "column": 2,
                "color": "cyan",
                "capacity": 16,
                "queueOrder": 9,
                "hidden": true
            },
            {
                "column": 2,
                "color": "green",
                "capacity": 16,
                "queueOrder": 10
            },
            {
                "column": 2,
                "color": "yellow",
                "capacity": 16,
                "queueOrder": 11
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 12,
                "hidden": true
            },
            {
                "column": 2,
                "color": "pink",
                "capacity": 16,
                "queueOrder": 13
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 14
            },
            {
                "column": 2,
                "color": "blue",
                "capacity": 16,
                "queueOrder": 15
            }
        ],
        "boosters": {
            "magnet": 10,
            "shuffle": 10,
            "paintGun": 10
        }
    }
];




// ============================================================
// Level Validator — window.LevelValidator
// Validates level data for cube/car balance, bounds, overlaps
// ============================================================

window.LevelValidator = {

    /**
     * Validate a single level data object.
     * @param {object} levelData — A level definition from window.LEVELS
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validate(levelData) {
        const errors = [];

        if (!levelData) {
            return { valid: false, errors: ['Level data is null or undefined'] };
        }

        const { boardSize, layers, cars } = levelData;
        const cols = boardSize ? boardSize.cols : CONFIG.GRID_COLS;
        const rows = boardSize ? boardSize.rows : CONFIG.GRID_ROWS;

        // ----- 1. Cube count per color === Car capacity per color -----
        const cubesPerColor = {};  // total cubes produced by blocks
        const capacityPerColor = {}; // total car capacity

        if (layers) {
            for (const layer of layers) {
                if (!layer.blocks) continue;
                for (const block of layer.blocks) {
                    const shape = window.SHAPES[block.shape];
                    if (!shape) {
                        errors.push(`Block "${block.id}" references unknown shape "${block.shape}"`);
                        continue;
                    }
                    const cubeCount = shape.unitCount * CONFIG.CUBES_PER_CELL;
                    cubesPerColor[block.color] = (cubesPerColor[block.color] || 0) + cubeCount;
                }
            }
        }

        if (cars) {
            for (const car of cars) {
                capacityPerColor[car.color] = (capacityPerColor[car.color] || 0) + car.capacity;
            }
        }

        // Compare cube totals to car capacity totals
        const allColors = new Set([...Object.keys(cubesPerColor), ...Object.keys(capacityPerColor)]);
        for (const color of allColors) {
            const cubes = cubesPerColor[color] || 0;
            const capacity = capacityPerColor[color] || 0;
            if (cubes !== capacity) {
                errors.push(
                    `Color "${color}": cube count (${cubes}) !== car capacity (${capacity})`
                );
            }
        }

        // ----- 2. All blocks fit within grid bounds -----
        if (layers) {
            for (const layer of layers) {
                if (!layer.blocks) continue;
                for (const block of layer.blocks) {
                    const shape = window.SHAPES[block.shape];
                    if (!shape) continue; // already reported above

                    for (const [dr, dc] of shape.cells) {
                        const r = block.row + dr;
                        const c = block.col + dc;
                        if (r < 0 || r >= rows || c < 0 || c >= cols) {
                            errors.push(
                                `Block "${block.id}" (shape ${block.shape}) at (${block.row},${block.col}): ` +
                                `cell offset [${dr},${dc}] goes out of bounds at (${r},${c})`
                            );
                        }
                    }
                }
            }
        }

        // ----- 3. No same-layer block overlaps -----
        if (layers) {
            for (const layer of layers) {
                if (!layer.blocks) continue;

                const occupied = new Set();
                for (const block of layer.blocks) {
                    const shape = window.SHAPES[block.shape];
                    if (!shape) continue;

                    for (const [dr, dc] of shape.cells) {
                        const r = block.row + dr;
                        const c = block.col + dc;
                        const key = `${r},${c}`;
                        if (occupied.has(key)) {
                            errors.push(
                                `Layer ${layer.index}: overlap at (${r},${c}) — ` +
                                `block "${block.id}" conflicts with another block`
                            );
                        }
                        occupied.add(key);
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },

    /**
     * Validate all levels in window.LEVELS and log results.
     * @returns {boolean} true if all levels are valid
     */
    validateAll() {
        if (!window.LEVELS || !Array.isArray(window.LEVELS)) {
            console.error('[LevelValidator] window.LEVELS is not defined or not an array');
            return false;
        }

        let allValid = true;
        for (const level of window.LEVELS) {
            const result = this.validate(level);
            if (!result.valid) {
                allValid = false;
                console.error(`[LevelValidator] Level ${level.id} ("${level.name}") FAILED:`);
                for (const err of result.errors) {
                    console.error(`  - ${err}`);
                }
            } else {
                console.log(`[LevelValidator] Level ${level.id} ("${level.name}") — OK`);
            }
        }
        return allValid;
    },
};




// ============================================================
// Region progression + Car customization catalogs
// Global namespace: window.REGIONS, window.CAR_PARTS, window.CAR_CATALOG
// ============================================================

// Region unlock ladder. Stars are earned 1-per-level-win (GameStateManager.enterWin).
// `cost` is spent (deducted) from the player's star balance to unlock.
// `unlockLevel` is informational pacing context only — under the "1 star per
// level" rule, reaching `cost` stars already implies having played that many
// levels, so it is not enforced separately as a gate.
window.REGIONS = [
    {
        id: 1,
        name: 'Khởi Đầu',
        cost: 0,
        unlockLevel: 1,
        bgColor: 0x180F40,
        desc: 'Khu vực đầu tiên — học cách chơi.',
        reward: null,
    },
    {
        id: 2,
        name: 'Vùng Đất Mới',
        cost: 10,
        unlockLevel: 10,
        bgColor: 0x123B52,
        desc: 'Mở Frozen Block.',
        reward: { coin: 200 },
    },
    {
        id: 3,
        name: 'Thung Lũng Khoá',
        cost: 15,
        unlockLevel: 25,
        bgColor: 0x4A2466,
        desc: 'Mở Key & Lock, nhiều Layer hơn.',
        reward: { coin: 400, booster: 1 },
    },
    {
        id: 4,
        name: 'Sắc Màu Rực Rỡ',
        cost: 20,
        unlockLevel: 45,
        bgColor: 0x6E4A12,
        desc: 'Nhiều màu & Special Block hơn.',
        reward: { coin: 600, booster: 1 },
    },
    {
        id: 5,
        name: 'Đỉnh Cao Thử Thách',
        cost: 25,
        unlockLevel: 70,
        bgColor: 0x5C1F1A,
        desc: 'Nội dung khó hơn, nhiều mục tiêu sưu tầm.',
        reward: { coin: 800, cosmetic: true },
    },
    {
        id: 6,
        name: 'Huyền Thoại',
        cost: 30,
        unlockLevel: 100,
        bgColor: 0x14181C,
        desc: 'Nội dung late-game cao cấp.',
        reward: { coin: 1000, cosmetic: true, boosterPack: true },
    },
];

// Car customization — drawn procedurally (Phaser Graphics), no external art.
// Reuses window.COLORS for body paint so swatches match the in-game palette.
window.CAR_PARTS = {
    bodyColor: [
        { id: 'red', label: 'Đỏ', cost: 0 },
        { id: 'blue', label: 'Xanh', cost: 50 },
        { id: 'green', label: 'Lá', cost: 50 },
        { id: 'yellow', label: 'Vàng', cost: 80 },
        { id: 'orange', label: 'Cam', cost: 80 },
        { id: 'purple', label: 'Tím', cost: 100 },
        { id: 'pink', label: 'Hồng', cost: 100 },
        { id: 'cyan', label: 'Ngọc', cost: 120 },
    ],
    wheel: [
        { id: 'classic', label: 'Cổ điển', cost: 0 },
        { id: 'sport', label: 'Thể thao', cost: 60 },
        { id: 'offroad', label: 'Địa hình', cost: 90 },
    ],
    door: [
        { id: 'plain', label: 'Thường', cost: 0 },
        { id: 'racing', label: 'Đua xe', cost: 70 },
        { id: 'armor', label: 'Giáp', cost: 120 },
    ],
    decal: [
        { id: 'none', label: 'Không', emoji: null, cost: 0 },
        { id: 'star', label: 'Sao', emoji: '⭐', cost: 50 },
        { id: 'flame', label: 'Lửa', emoji: '🔥', cost: 90 },
        { id: 'heart', label: 'Tim', emoji: '💖', cost: 90 },
    ],
};

// Default equipped part per group — always owned, zero cost.
window.CAR_PARTS_DEFAULT = { bodyColor: 'red', wheel: 'classic', door: 'plain', decal: 'none' };

// Whole-new-car catalog (separate from per-part customization).
window.CAR_CATALOG = [
    { id: 'classic', name: 'Xe Cổ Điển', cost: 0, bodyColor: 'red' },
    { id: 'pickup', name: 'Xe Tải Nhỏ', cost: 500, bodyColor: 'orange' },
    { id: 'sport', name: 'Xe Thể Thao', cost: 1200, bodyColor: 'blue' },
    { id: 'limo', name: 'Limousine', cost: 2500, bodyColor: 'purple' },
];




// ============================================================
// Block — Individual puzzle block composed of colored cells
// window.Block
// Visual:
// - Cell sprites remain lightweight.
// - outlineGraphics removed.
// - connectorGraphics draws same-color bridges between cells of the SAME block.
// - connectorOverlayGraphics dims those bridges when the block is on lower layers / blocked.
// - Layer overlay is based on visualLayerDepth, not raw layer index.
// ============================================================

window.Block = class Block {
    /**
     * @param {Phaser.Scene} scene
     * @param {{ id: number, shape: string, color: string, row: number, col: number, frozenCount?: number, keyColor?: string, lockColor?: string }} blockData
     * @param {number} layerIndex
     */
    constructor(scene, blockData, layerIndex) {
        this.id = blockData.id;
        this.color = blockData.color;
        this.shapeName = blockData.shape;
        this.layer = layerIndex;
        this.originRow = blockData.row;
        this.originCol = blockData.col;

        // Frozen Countdown Block:
        // - frozenCount > 0 means this block is locked by ice.
        // - The block cannot be tapped / Magneted / Paint-Gunned while frozen.
        // - Board.decreaseFrozenCounts() reduces this value whenever another block blasts.
        this.frozenCount = Math.max(0, parseInt(blockData.frozenCount || 0, 10) || 0);
        this.keyColor = blockData.keyColor || null;
        this.lockColor = blockData.lockColor || null;
        this.isLocked = !!this.lockColor;

        // 0 = top visible layer, 1 = one layer below, etc.
        // Board recalculates this after all block states are known.
        this.visualLayerDepth = 0;

        this.cells = [];
        this.setCellPositions();

        this.state = 'pullable';

        this.baseDepth = 10 + this.layer;
        this.resolveDepth = 45 + this.layer;

        this.container = null;
        this.cellSprites = [];
        this.glowSprites = [];
        this.overlaySprites = [];
        this.frozenOverlaySprites = [];
        this.frozenBadgeBg = null;
        this.frozenText = null;
        this.keyBadgeBg = null;
        this.keyIcon = null;
        this.lockBadgeBg = null;
        this.lockIcon = null;

        this.shadowGraphics = null;
        this.connectorGraphics = null;
        this.connectorOverlayGraphics = null;

        this.createVisuals(scene);
    }

    // ----------------------------------------------------------
    // Cell position calculation
    // ----------------------------------------------------------

    setCellPositions() {
        const shapeDef = window.SHAPES[this.shapeName];

        if (!shapeDef) {
            console.warn(`Block: unknown shape "${this.shapeName}"`);
            this.cells = [{ row: this.originRow, col: this.originCol }];
            return;
        }

        this.cells = shapeDef.cells.map(([dr, dc]) => ({
            row: this.originRow + dr,
            col: this.originCol + dc,
        }));
    }

    // ----------------------------------------------------------
    // Visual creation
    // ----------------------------------------------------------

    createVisuals(scene) {
        const C = window.CONFIG;

        const sprites = [];
        const firstCell = this.cells[0];

        const anchorX = C.BOARD_OFFSET_X + firstCell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
        const anchorY = C.BOARD_OFFSET_Y + firstCell.row * C.CELL_SIZE + C.CELL_SIZE / 2;

        this.cellSprites = [];
        this.glowSprites = [];
        this.overlaySprites = [];

        this.shadowGraphics = scene.add.graphics();
        this.drawBlockShadow(C, anchorX, anchorY);
        sprites.push(this.shadowGraphics);

        this.connectorGraphics = scene.add.graphics();
        this.drawBlockConnector(C, anchorX, anchorY);
        sprites.push(this.connectorGraphics);

        this.connectorOverlayGraphics = scene.add.graphics();
        this.drawBlockConnectorOverlay(C, anchorX, anchorY, 0);
        sprites.push(this.connectorOverlayGraphics);

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            const cellSprite = scene.add.image(cx, cy, `cell_${this.color}`);
            cellSprite.setDisplaySize(C.CELL_DRAW, C.CELL_DRAW);
            this.cellSprites.push(cellSprite);
            sprites.push(cellSprite);

            const glow = scene.add.image(cx, cy, `cell_${this.color}`);
            glow.setDisplaySize(C.CELL_DRAW + 4, C.CELL_DRAW + 4);
            glow.setAlpha(0.15);
            glow.setBlendMode(Phaser.BlendModes.ADD);
            this.glowSprites.push(glow);
            sprites.push(glow);

            const overlay = scene.add.rectangle(cx, cy, C.CELL_DRAW, C.CELL_DRAW, 0x000000);
            overlay.setAlpha(0);
            this.overlaySprites.push(overlay);
            sprites.push(overlay);

            const frozenOverlay = scene.add.rectangle(cx, cy, C.CELL_DRAW, C.CELL_DRAW, 0xBDEEFF);
            frozenOverlay.setAlpha(0);
            this.frozenOverlaySprites.push(frozenOverlay);
            sprites.push(frozenOverlay);
        }

        this.createFrozenBadge(scene, C, anchorX, anchorY, sprites);
        this.createLockBadge(scene, C, anchorX, anchorY, sprites);
        this.createKeyBadge(scene, C, anchorX, anchorY, sprites);

        this.container = scene.add.container(anchorX, anchorY, sprites);

        const layerDim = this.getLayerOverlayAlpha();

        if (layerDim > 0) {
            for (const overlay of this.overlaySprites) {
                overlay.setAlpha(layerDim);
            }

            this.updateConnectorOverlay(layerDim);
        }

        this.container.setDepth(this.getBaseDepth());

        this.updateFrozenVisuals(false);
        this.updateLockVisuals(false);
        this.updateKeyVisuals(false);

        this._setupInteractive(scene);
    }

    getMetaColor(colorName, fallback = 0xFFFFFF) {
        return (window.COLORS[colorName] && window.COLORS[colorName].hex) || fallback;
    }

    createFrozenBadge(scene, C, anchorX, anchorY, sprites) {
        const center = this.getLocalShapeCenter(C, anchorX, anchorY);
        const badgeRadius = Math.max(11, Math.floor(C.CELL_DRAW * 0.32));

        this.frozenBadgeBg = scene.add.circle(center.x, center.y, badgeRadius, 0xDDF8FF, 0.96);
        this.frozenBadgeBg.setStrokeStyle(3, 0xFFFFFF, 0.98);
        this.frozenBadgeBg.setAlpha(0);
        sprites.push(this.frozenBadgeBg);

        this.frozenText = scene.add.text(center.x, center.y + 1, '', {
            fontFamily: 'Outfit, Arial, sans-serif',
            fontSize: `${Math.max(17, Math.floor(C.CELL_DRAW * 0.46))}px`,
            fontStyle: '800',
            color: '#1E5A78',
            stroke: '#FFFFFF',
            strokeThickness: 4,
            align: 'center',
        });
        this.frozenText.setOrigin(0.5);
        this.frozenText.setAlpha(0);
        sprites.push(this.frozenText);
    }

    createLockBadge(scene, C, anchorX, anchorY, sprites) {
        const center = this.getLocalShapeCenter(C, anchorX, anchorY);
        const radius = Math.max(11, Math.floor(C.CELL_DRAW * 0.32));

        this.lockBadgeBg = scene.add.circle(center.x, center.y, radius, this.getMetaColor(this.lockColor, 0x888888), 0.96);
        this.lockBadgeBg.setStrokeStyle(3, 0xFFFFFF, 0.98);
        this.lockBadgeBg.setAlpha(0);
        sprites.push(this.lockBadgeBg);

        this.lockIcon = scene.add.text(center.x, center.y + 1, '🔒', {
            fontSize: `${Math.max(13, Math.floor(C.CELL_DRAW * 0.36))}px`,
            align: 'center',
        });
        this.lockIcon.setOrigin(0.5);
        this.lockIcon.setTintFill(0xFFFFFF);
        this.lockIcon.setAlpha(0);
        sprites.push(this.lockIcon);
    }

    createKeyBadge(scene, C, anchorX, anchorY, sprites) {
        const center = this.getLocalShapeCenter(C, anchorX, anchorY);
        const radius = Math.max(11, Math.floor(C.CELL_DRAW * 0.32));

        this.keyBadgeBg = scene.add.circle(center.x, center.y, radius, this.getMetaColor(this.keyColor, 0xF1C40F), 0.96);
        this.keyBadgeBg.setStrokeStyle(3, 0xF7DC6F, 0.98);
        this.keyBadgeBg.setAlpha(0);
        sprites.push(this.keyBadgeBg);

        this.keyIcon = scene.add.text(center.x, center.y + 1, '🔑', {
            fontSize: `${Math.max(12, Math.floor(C.CELL_DRAW * 0.33))}px`,
            align: 'center',
        });
        this.keyIcon.setOrigin(0.5);
        this.keyIcon.setTintFill(0xFFFFFF);
        this.keyIcon.setAlpha(0);
        sprites.push(this.keyIcon);
    }

    getLocalShapeCenter(C, anchorX, anchorY) {
        let sumX = 0;
        let sumY = 0;

        for (const cell of this.cells) {
            sumX += C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            sumY += C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;
        }

        const count = Math.max(1, this.cells.length);
        return {
            x: sumX / count,
            y: sumY / count,
        };
    }

    getLocalShapeBounds(C, anchorX, anchorY) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            minX = Math.min(minX, cx - C.CELL_DRAW / 2);
            minY = Math.min(minY, cy - C.CELL_DRAW / 2);
            maxX = Math.max(maxX, cx + C.CELL_DRAW / 2);
            maxY = Math.max(maxY, cy + C.CELL_DRAW / 2);
        }

        return { minX, minY, maxX, maxY };
    }

    drawBlockShadow(C, anchorX, anchorY) {
        if (!this.shadowGraphics) return;

        const g = this.shadowGraphics;
        const s = C.CELL_DRAW;
        const r = Math.max(5, Math.floor(s * 0.18));

        g.clear();

        g.fillStyle(0x000000, 0.14);

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            g.fillRoundedRect(
                cx - s / 2 + 1,
                cy - s / 2 + 2,
                s,
                s,
                r
            );
        }

        g.fillStyle(0x000000, 0.07);

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            g.fillRoundedRect(
                cx - s / 2 + 5,
                cy + s / 2 - 4,
                s - 10,
                4,
                2
            );
        }
    }

    drawBlockConnector(C, anchorX, anchorY) {
        if (!this.connectorGraphics) return;

        const g = this.connectorGraphics;
        const colorData = window.COLORS[this.color] || window.COLORS.blue || {
            hex: 0x4A7BD9,
            dark: 0x2F57A5,
            light: 0x7FA7FF,
        };

        const mainColor = colorData.hex;
        const darkColor = colorData.dark ?? mainColor;
        const lightColor = colorData.light ?? mainColor;

        const { rects, s, bridgeLength } = this.getConnectorBridgeRects(C, anchorX, anchorY);

        g.clear();

        g.fillStyle(darkColor, 0.26);

        for (const rect of rects) {
            g.fillRoundedRect(
                rect.x + (rect.orientation === 'v' ? 2 : 0),
                rect.y + (rect.orientation === 'h' ? 2 : 0),
                rect.w,
                rect.h,
                rect.r
            );
        }

        g.fillStyle(mainColor, 0.96);

        for (const rect of rects) {
            g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, rect.r);
        }

        g.fillStyle(lightColor, 0.14);

        for (const rect of rects) {
            if (rect.orientation === 'h') {
                g.fillRoundedRect(
                    rect.x + 3,
                    rect.y + 4,
                    Math.max(2, bridgeLength - 6),
                    Math.max(3, s * 0.16),
                    3
                );
            } else {
                g.fillRoundedRect(
                    rect.x + 4,
                    rect.y + 3,
                    Math.max(3, s * 0.16),
                    Math.max(2, bridgeLength - 6),
                    3
                );
            }
        }
    }

    getConnectorBridgeRects(C, anchorX, anchorY) {
        const cellKeys = new Set(this.cells.map(cell => `${cell.row},${cell.col}`));

        const s = C.CELL_DRAW;
        const bridgeThickness = s;
        const gap = Math.max(0, C.CELL_SIZE - s);

        const overlap = 4;
        const bridgeLength = gap + overlap * 2;
        const radius = Math.max(4, Math.floor(s * 0.18));

        const rects = [];

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            const hasRight = cellKeys.has(`${cell.row},${cell.col + 1}`);
            const hasDown = cellKeys.has(`${cell.row + 1},${cell.col}`);

            if (hasRight) {
                rects.push({
                    orientation: 'h',
                    x: cx + s / 2 - overlap,
                    y: cy - bridgeThickness / 2,
                    w: bridgeLength,
                    h: bridgeThickness,
                    r: radius,
                });
            }

            if (hasDown) {
                rects.push({
                    orientation: 'v',
                    x: cx - bridgeThickness / 2,
                    y: cy + s / 2 - overlap,
                    w: bridgeThickness,
                    h: bridgeLength,
                    r: radius,
                });
            }
        }

        return {
            rects,
            s,
            bridgeLength,
            overlap,
            radius,
        };
    }

    drawBlockConnectorOverlay(C, anchorX, anchorY, alpha) {
        if (!this.connectorOverlayGraphics) return;

        const g = this.connectorOverlayGraphics;

        g.clear();

        if (alpha <= 0) return;

        const { rects } = this.getConnectorBridgeRects(C, anchorX, anchorY);

        g.fillStyle(0x000000, alpha);

        for (const rect of rects) {
            g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, rect.r);
        }
    }

    updateConnectorOverlay(alpha) {
        if (!this.connectorOverlayGraphics) return;

        const C = window.CONFIG;
        const firstCell = this.cells[0];

        const anchorX = C.BOARD_OFFSET_X + firstCell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
        const anchorY = C.BOARD_OFFSET_Y + firstCell.row * C.CELL_SIZE + C.CELL_SIZE / 2;

        this.drawBlockConnectorOverlay(C, anchorX, anchorY, alpha);
    }

    _setupInteractive(scene) {
        const C = window.CONFIG;
        const firstCell = this.cells[0];

        const anchorX = C.BOARD_OFFSET_X + firstCell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
        const anchorY = C.BOARD_OFFSET_Y + firstCell.row * C.CELL_SIZE + C.CELL_SIZE / 2;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const cell of this.cells) {
            const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorX;
            const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - anchorY;

            minX = Math.min(minX, cx - C.CELL_SIZE / 2);
            minY = Math.min(minY, cy - C.CELL_SIZE / 2);
            maxX = Math.max(maxX, cx + C.CELL_SIZE / 2);
            maxY = Math.max(maxY, cy + C.CELL_SIZE / 2);
        }

        const w = maxX - minX;
        const h = maxY - minY;

        const hitArea = new Phaser.Geom.Rectangle(minX, minY, w, h);
        const self = this;

        this.container.setInteractive(hitArea, function (hitArea, localX, localY) {
            const C = window.CONFIG;
            const firstCell = self.cells[0];

            const ax = C.BOARD_OFFSET_X + firstCell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
            const ay = C.BOARD_OFFSET_Y + firstCell.row * C.CELL_SIZE + C.CELL_SIZE / 2;

            for (const cell of self.cells) {
                const cx = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2 - ax;
                const cy = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2 - ay;
                const halfSize = C.CELL_SIZE / 2;

                if (
                    localX >= cx - halfSize &&
                    localX <= cx + halfSize &&
                    localY >= cy - halfSize &&
                    localY <= cy + halfSize
                ) {
                    return true;
                }
            }

            return false;
        });

        this.container.setData('blockRef', this);
    }

    // ----------------------------------------------------------
    // Layer overlay helpers
    // ----------------------------------------------------------

    getLayerOverlayAlpha() {
        const C = window.CONFIG;
        const overlays = C.LAYER_OVERLAYS || [];

        const depth = typeof this.visualLayerDepth === 'number'
            ? this.visualLayerDepth
            : 0;
        const index = Phaser.Math.Clamp(Math.floor(depth), 0, Math.max(0, overlays.length - 1));

        return overlays[index] || 0;
    }

    getBlockedOverlayAlpha() {
        const layerDim = this.getLayerOverlayAlpha();

        // Increase this if blocked blocks appear too dark.
        return Math.max(layerDim, 0.16);
    }

    resetTransientVisualFlags() {
        this._xRay = false;
        this._xRayHeld = false;
        this._xRayPeek = false;
        this._xRayRevealedCovered = false;
        this._xRayPeekWasCovered = false;
    }

    // ----------------------------------------------------------
    // Frozen Countdown helpers
    // ----------------------------------------------------------

    isFrozen() {
        return (this.frozenCount || 0) > 0;
    }

    isBlockLocked() {
        return this.isLocked;
    }

    setFrozenCount(value, options = {}) {
        const oldValue = this.frozenCount || 0;
        const nextValue = Math.max(0, parseInt(value || 0, 10) || 0);

        this.frozenCount = nextValue;
        this.updateFrozenVisuals(options.animate === true);

        if (oldValue > 0 && nextValue <= 0) {
            this.playFrozenUnlockEffect();
            return true;
        }

        return false;
    }

    decreaseFrozenCount(amount = 1, options = {}) {
        if (!this.isFrozen()) return false;

        const nextValue = Math.max(0, this.frozenCount - Math.max(1, amount || 1));
        return this.setFrozenCount(nextValue, {
            animate: options.animate !== false,
        });
    }

    updateFrozenVisuals(animate = false) {
        const frozen = this.isFrozen();
        const visible = frozen && this.state !== 'covered';

        for (const overlay of this.frozenOverlaySprites || []) {
            if (!overlay) continue;
            overlay.setAlpha(visible ? 0.42 : 0);
        }

        if (this.frozenBadgeBg) {
            this.frozenBadgeBg.setVisible(visible);
            this.frozenBadgeBg.setAlpha(visible ? 0.96 : 0);
        }

        if (this.frozenText) {
            this.frozenText.setVisible(visible);
            this.frozenText.setAlpha(visible ? 1 : 0);
            this.frozenText.setText(visible ? String(this.frozenCount) : '');
        }

        if (animate && visible && this.container?.scene) {
            const targets = [];
            if (this.frozenBadgeBg) targets.push(this.frozenBadgeBg);
            if (this.frozenText) targets.push(this.frozenText);

            if (targets.length > 0) {
                this.container.scene.tweens.add({
                    targets,
                    scaleX: 1.24,
                    scaleY: 1.24,
                    duration: 80,
                    yoyo: true,
                    ease: 'Back.easeOut',
                });
            }
        }
    }

    updateLockVisuals(animate = false) {
        const visible = this.isLocked && this.state !== 'covered';

        if (this.lockBadgeBg) {
            this.lockBadgeBg.setVisible(visible);
            this.lockBadgeBg.setAlpha(visible ? 0.96 : 0);
            this.lockBadgeBg.setFillStyle(this.getMetaColor(this.lockColor, 0x888888), 0.96);
        }

        if (this.lockIcon) {
            this.lockIcon.setVisible(visible);
            this.lockIcon.setAlpha(visible ? 1 : 0);
        }

        if (animate && visible && this.container?.scene) {
            const targets = [this.lockBadgeBg, this.lockIcon].filter(Boolean);
            this.container.scene.tweens.add({
                targets,
                scaleX: 1.22,
                scaleY: 1.22,
                duration: 80,
                yoyo: true,
                repeat: 1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    updateKeyVisuals(animate = false) {
        const visible = !!this.keyColor && this.state !== 'covered';

        if (this.keyBadgeBg) {
            this.keyBadgeBg.setVisible(visible);
            this.keyBadgeBg.setAlpha(visible ? 0.96 : 0);
            this.keyBadgeBg.setFillStyle(this.getMetaColor(this.keyColor, 0xF1C40F), 0.96);
        }

        if (this.keyIcon) {
            this.keyIcon.setVisible(visible);
            this.keyIcon.setAlpha(visible ? 1 : 0);
        }

        if (animate && visible && this.container?.scene) {
            const targets = [this.keyBadgeBg, this.keyIcon].filter(Boolean);
            this.container.scene.tweens.add({
                targets,
                angle: { from: -5, to: 5 },
                duration: 650,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }
    }

    unlock() {
        if (!this.isLocked) return false;

        const unlockColor = this.lockColor;
        this.lockColor = null;
        this.isLocked = false;
        this.updateLockVisuals(false);
        this.playLockUnlockEffect(unlockColor);
        return true;
    }

    playFrozenUnlockEffect() {
        if (!this.container || !this.container.scene) return;

        const scene = this.container.scene;
        const center = this.getScreenCenter();

        const particles = scene.add.particles(center.x, center.y, 'particle_star', {
            speed: { min: 45, max: 125 },
            scale: { start: 0.75, end: 0 },
            lifespan: 450,
            quantity: 14,
            tint: 0xBDEEFF,
        });

        particles.setDepth(80);

        scene.time.delayedCall(500, () => {
            if (particles && particles.destroy) particles.destroy();
        });

        scene.tweens.add({
            targets: this.container,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 95,
            yoyo: true,
            ease: 'Back.easeOut',
        });
    }

    playLockUnlockEffect(lockColor) {
        if (!this.container || !this.container.scene) return;

        const scene = this.container.scene;
        const center = this.getScreenCenter();

        const particles = scene.add.particles(center.x, center.y, 'particle_star', {
            speed: { min: 55, max: 145 },
            scale: { start: 0.72, end: 0 },
            lifespan: 430,
            quantity: 16,
            tint: this.getMetaColor(lockColor, 0xFFFFFF),
        });

        particles.setDepth(82);

        scene.time.delayedCall(480, () => {
            if (particles && particles.destroy) particles.destroy();
        });

        scene.tweens.add({
            targets: this.container,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 90,
            yoyo: true,
            ease: 'Back.easeOut',
        });
    }

    shakeLocked() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            this.updateLockVisuals(true);
            this.shake().then(resolve);
        });
    }

    shakeFrozen() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            const targets = [];
            if (this.frozenBadgeBg) targets.push(this.frozenBadgeBg);
            if (this.frozenText) targets.push(this.frozenText);

            if (targets.length > 0) {
                this.container.scene.tweens.add({
                    targets,
                    scaleX: 1.18,
                    scaleY: 1.18,
                    duration: 80,
                    yoyo: true,
                    repeat: 1,
                    ease: 'Sine.easeInOut',
                });
            }

            this.shake().then(resolve);
        });
    }

    restoreVisualState() {
        this.resetTransientVisualFlags();
        this.setState(this.state, true);
    }

    // ----------------------------------------------------------
    // State management
    // ----------------------------------------------------------

    /**
     * @param {'pullable'|'blocked'|'covered'} newState
     * @param {boolean} force Force visual refresh even if state is unchanged.
     */
    setState(newState, force = false) {
        if (this.state === newState && !force) return;

        this.state = newState;

        if (!this.container || !this.container.scene) return;

        const layerDim = this.getLayerOverlayAlpha();

        switch (newState) {
            case 'pullable':
                this.container.setVisible(true);
                this.updateAlpha();
                this.container.setDepth(this.getBaseDepth());

                for (const sprite of this.cellSprites) {
                    sprite.clearTint();
                    sprite.setAlpha(1);
                }

                for (const glow of this.glowSprites) {
                    glow.setAlpha(0.15);
                }

                for (const overlay of this.overlaySprites) {
                    overlay.setAlpha(layerDim);
                }

                this.updateConnectorOverlay(layerDim);

                if (this.shadowGraphics) {
                    this.shadowGraphics.setAlpha(1);
                }

                if (this.connectorGraphics) {
                    this.connectorGraphics.setAlpha(1);
                }

                break;

            case 'blocked':
                this.container.setVisible(true);
                this.updateAlpha();
                this.container.setDepth(this.getBaseDepth());

                for (const sprite of this.cellSprites) {
                    sprite.setTint(0x888888);
                    sprite.setAlpha(0.85);
                }

                for (const glow of this.glowSprites) {
                    glow.setAlpha(0);
                }

                {
                    const blockedDim = this.getBlockedOverlayAlpha();

                    for (const overlay of this.overlaySprites) {
                        overlay.setAlpha(blockedDim);
                    }

                    this.updateConnectorOverlay(blockedDim);
                }

                if (this.shadowGraphics) {
                    this.shadowGraphics.setAlpha(0.65);
                }

                if (this.connectorGraphics) {
                    this.connectorGraphics.setAlpha(0.72);
                }

                break;

            case 'covered':
                this.container.setVisible(false);
                break;
        }

        this.updateFrozenVisuals(false);
        this.updateLockVisuals(false);
        this.updateKeyVisuals(false);
    }

    /** Called by Board.setXRayMode — makes top-layer blocks transparent so user can see below. */
    setXRay(isOn) {
        this._xRay = isOn;
        this.updateAlpha();
        this.updateOverlayAlpha();
    }

    /** Container opacity: top layer fades in X-Ray mode. */
    updateAlpha() {
        if (!this.container || !this.container.scene || this.state === 'covered') return;
        const xRayFade = this._xRay && this.visualLayerDepth === 0;
        this.container.setAlpha(xRayFade ? (CONFIG.XRAY_TOP_ALPHA ?? 0.15) : 1);
    }

    /**
     * Cell overlay (dark dim) alpha: in X-Ray mode reduce overlay on lower layers
     * so they become clearly visible while the top layer is faded out.
     */
    updateOverlayAlpha() {
        if (!this.container || !this.container.scene || this.state === 'covered') return;
        if (this.visualLayerDepth === 0) return; // top layer has no overlay to adjust

        let alpha;
        if (this._xRay) {
            // X-Ray: lift the dim so sub-layers are bright and easy to read
            alpha = CONFIG.XRAY_LOWER_OVERLAY ?? 0.02;
        } else {
            // Normal mode: restore standard dim based on state
            alpha = this.state === 'blocked'
                ? this.getBlockedOverlayAlpha()
                : this.getLayerOverlayAlpha();
        }

        for (const overlay of this.overlaySprites) {
            overlay.setAlpha(alpha);
        }
        this.updateConnectorOverlay(alpha);
    }

    // ----------------------------------------------------------
    // Depth / resolve visual helpers
    // ----------------------------------------------------------

    getBaseDepth() {
        return this.baseDepth ?? (10 + this.layer);
    }

    getResolveDepth() {
        return this.resolveDepth ?? (45 + this.layer);
    }

    bringToResolveDepth(options = {}) {
        if (!this.container || !this.container.scene) return;

        const restoreColor = options.restoreColor !== false;

        this.container.setVisible(true);
        this.container.setAlpha(1);
        this.container.setDepth(this.getResolveDepth());

        if (!restoreColor) return;

        for (const sprite of this.cellSprites) {
            sprite.clearTint();
            sprite.setAlpha(1);
        }

        for (const glow of this.glowSprites) {
            glow.setAlpha(0.22);
        }

        for (const overlay of this.overlaySprites) {
            overlay.setAlpha(0);
        }

        if (this.connectorOverlayGraphics) {
            this.connectorOverlayGraphics.clear();
        }

        if (this.shadowGraphics) {
            this.shadowGraphics.setAlpha(1);
        }

        if (this.connectorGraphics) {
            this.connectorGraphics.setAlpha(1);
        }

        this.updateFrozenVisuals(false);
        this.updateLockVisuals(false);
        this.updateKeyVisuals(false);
    }

    restoreBaseDepth() {
        if (!this.container || !this.container.scene) return;

        this.container.setDepth(this.getBaseDepth());
    }

    // ----------------------------------------------------------
    // Position helpers
    // ----------------------------------------------------------

    getScreenCenter() {
        const C = window.CONFIG;

        let sumX = 0;
        let sumY = 0;

        for (const cell of this.cells) {
            sumX += C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
            sumY += C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2;
        }

        return {
            x: sumX / this.cells.length,
            y: sumY / this.cells.length,
        };
    }

    getCubeSpawnPositions() {
        const C = window.CONFIG;
        const positions = [];
        const cubesPerCell = C.CUBES_PER_CELL || 4;

        for (const cell of this.cells) {
            const centerX = C.BOARD_OFFSET_X + cell.col * C.CELL_SIZE + C.CELL_SIZE / 2;
            const centerY = C.BOARD_OFFSET_Y + cell.row * C.CELL_SIZE + C.CELL_SIZE / 2;

            if (cubesPerCell === 1) {
                positions.push({ x: centerX, y: centerY });
                continue;
            }

            const spread = C.CELL_SIZE * 0.22;

            if (cubesPerCell === 4) {
                positions.push(
                    { x: centerX - spread, y: centerY - spread },
                    { x: centerX + spread, y: centerY - spread },
                    { x: centerX - spread, y: centerY + spread },
                    { x: centerX + spread, y: centerY + spread }
                );
            } else {
                for (let i = 0; i < cubesPerCell; i++) {
                    const angle = (Math.PI * 2 * i) / cubesPerCell;

                    positions.push({
                        x: centerX + Math.cos(angle) * spread,
                        y: centerY + Math.sin(angle) * spread,
                    });
                }
            }
        }

        return positions;
    }

    // ----------------------------------------------------------
    // Animations
    // ----------------------------------------------------------

    shake() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            const C = window.CONFIG;
            const scene = this.container.scene;
            const startX = this.container.x;

            scene.tweens.add({
                targets: this.container,
                x: startX + C.SHAKE_INTENSITY,
                duration: C.SHAKE_DURATION,
                yoyo: true,
                repeat: C.SHAKE_REPEATS,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    if (this.container) {
                        this.container.x = startX;
                    }

                    resolve();
                },
            });
        });
    }

    shakeBlocked() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            for (const sprite of this.cellSprites) {
                sprite.setTint(0xFF4444);
            }

            this.shake().then(() => {
                if (this.state === 'blocked') {
                    for (const sprite of this.cellSprites) {
                        sprite.setTint(0x888888);
                    }
                } else {
                    for (const sprite of this.cellSprites) {
                        sprite.clearTint();
                    }
                }

                resolve();
            });
        });
    }

    liftUp() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            this.bringToResolveDepth({ restoreColor: true });

            const C = window.CONFIG;
            const scene = this.container.scene;

            scene.tweens.add({
                targets: this.container,
                y: this.container.y - C.LIFT_DISTANCE,
                rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-5, 5)),
                duration: C.LIFT_DURATION,
                ease: 'Power2',
                onComplete: () => resolve(),
            });
        });
    }

    blast() {
        return new Promise((resolve) => {
            if (!this.container || !this.container.scene) {
                resolve();
                return;
            }

            this.bringToResolveDepth({ restoreColor: true });

            const C = window.CONFIG;
            const scene = this.container.scene;
            const halfDuration = C.BLAST_DURATION / 2;

            scene.tweens.add({
                targets: this.container,
                scaleX: C.BLAST_SCALE_UP,
                scaleY: C.BLAST_SCALE_UP,
                duration: halfDuration,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    if (!this.container || !this.container.scene) {
                        resolve();
                        return;
                    }

                    scene.tweens.add({
                        targets: this.container,
                        scaleX: 0,
                        scaleY: 0,
                        alpha: 0,
                        duration: halfDuration,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            this.destroy();
                            resolve();
                        },
                    });
                },
            });
        });
    }

    hoverPulse() {
        if (!this.container || !this.container.scene) return;

        this.container.scene.tweens.add({
            targets: this.container,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 90,
            yoyo: true,
            ease: 'Sine.easeInOut',
        });
    }

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------

    destroy() {
        this.resetTransientVisualFlags();

        if (this.container) {
            this.container.removeInteractive();
            this.container.destroy();
            this.container = null;
        }

        this.cellSprites = [];
        this.glowSprites = [];
        this.overlaySprites = [];
        this.frozenOverlaySprites = [];
        this.frozenBadgeBg = null;
        this.frozenText = null;
        this.keyBadgeBg = null;
        this.keyIcon = null;
        this.lockBadgeBg = null;
        this.lockIcon = null;

        this.shadowGraphics = null;
        this.connectorGraphics = null;
        this.connectorOverlayGraphics = null;
    }
};




// ============================================================
// Board — 8×8 grid with multi-layer blocks + funnel container shape
// ============================================================

window.Board = class Board {
    constructor(scene, levelData) {
        this.scene = scene;
        this.grid = [];
        this.blocks = new Map();
        this.layerMap = new Map();
        this.containerGfx = null;
        this.gridBgSprites = [];
        this.arrowGfx = null;

        // Initialize empty grid
        for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
            this.grid[r] = [];

            for (let c = 0; c < CONFIG.GRID_COLS; c++) {
                this.grid[r][c] = null;
            }
        }

        this.drawContainerShape();
        this.drawGridBackground();
        this.drawFlowArrows();
        this.createFromLevelData(levelData);
    }

    // ----------------------------------------------------------
    // Drawing
    // ----------------------------------------------------------

    drawContainerShape() {
        const g = this.scene.add.graphics();
        this.containerGfx = g;

        const cx = CONFIG.CONTAINER_X;
        const top = CONFIG.CONTAINER_TOP;
        const w = CONFIG.CONTAINER_WIDTH;
        const gridBot = CONFIG.CONTAINER_GRID_BOTTOM;
        const funBot = CONFIG.CONTAINER_FUNNEL_BOTTOM;
        const drainW = CONFIG.FUNNEL_DRAIN_WIDTH;
        const rad = CONFIG.CONTAINER_RADIUS;
        const bw = CONFIG.CONTAINER_BORDER;

        const left = cx - w / 2;
        const right = cx + w / 2;
        const drainLeft = cx - drainW / 2;
        const drainRight = cx + drainW / 2;

        // Fill
        g.fillStyle(THEME.CONTAINER_FILL, 1);
        g.beginPath();
        g.moveTo(left + rad, top);
        g.lineTo(right - rad, top);
        g.arc(right - rad, top + rad, rad, -Math.PI / 2, 0);
        g.lineTo(right, gridBot);
        g.lineTo(drainRight, funBot);
        g.lineTo(drainLeft, funBot);
        g.lineTo(left, gridBot);
        g.arc(left + rad, top + rad, rad, Math.PI, -Math.PI / 2);
        g.closePath();
        g.fillPath();

        // Stroke
        g.lineStyle(bw, THEME.CONTAINER_STROKE, 1);
        g.beginPath();
        g.moveTo(left + rad, top);
        g.lineTo(right - rad, top);
        g.arc(right - rad, top + rad, rad, -Math.PI / 2, 0);
        g.lineTo(right, gridBot);
        g.lineTo(drainRight, funBot);
        g.lineTo(drainLeft, funBot);
        g.lineTo(left, gridBot);
        g.arc(left + rad, top + rad, rad, Math.PI, -Math.PI / 2);
        g.closePath();
        g.strokePath();

        g.setDepth(0);
    }

    drawGridBackground() {
        for (let r = 0; r < CONFIG.GRID_ROWS; r++) {
            for (let c = 0; c < CONFIG.GRID_COLS; c++) {
                const x = CONFIG.BOARD_OFFSET_X + c * CONFIG.CELL_SIZE + CONFIG.CELL_DRAW / 2;
                const y = CONFIG.BOARD_OFFSET_Y + r * CONFIG.CELL_SIZE + CONFIG.CELL_DRAW / 2;

                const sprite = this.scene.add.image(x, y, 'grid_cell_empty');
                sprite.setDepth(1);

                this.gridBgSprites.push(sprite);
            }
        }
    }

    drawFlowArrows() {
        const g = this.scene.add.graphics();
        this.arrowGfx = g;

        g.setDepth(2);

        const cx = CONFIG.CONTAINER_X;
        const funTop = CONFIG.CONTAINER_GRID_BOTTOM + 5;
        const funBot = CONFIG.CONTAINER_FUNNEL_BOTTOM - 10;
        const midY = (funTop + funBot) / 2;

        g.lineStyle(2, THEME.CONTAINER_STROKE, 0.5);

        // Top row: spreading arrows
        this.drawArrow(g, cx - 30, funTop + 8, cx - 55, funTop + 8);
        this.drawArrow(g, cx + 30, funTop + 8, cx + 55, funTop + 8);

        // Middle: converging arrows
        this.drawArrow(g, cx - 40, midY, cx - 15, midY + 10);
        this.drawArrow(g, cx + 40, midY, cx + 15, midY + 10);

        // Bottom: down arrows
        this.drawArrow(g, cx, midY + 5, cx, funBot);
    }

    drawArrow(g, x1, y1, x2, y2) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 5;

        g.beginPath();
        g.moveTo(x2, y2);
        g.lineTo(
            x2 - headLen * Math.cos(angle - 0.4),
            y2 - headLen * Math.sin(angle - 0.4)
        );
        g.moveTo(x2, y2);
        g.lineTo(
            x2 - headLen * Math.cos(angle + 0.4),
            y2 - headLen * Math.sin(angle + 0.4)
        );
        g.strokePath();
    }

    // ----------------------------------------------------------
    // Level Data
    // ----------------------------------------------------------

    createFromLevelData(levelData) {
        for (const layerData of levelData.layers) {
            const layerIndex = layerData.index;
            const layerBlocks = [];

            for (const blockData of layerData.blocks) {
                const block = new Block(this.scene, blockData, layerIndex);

                this.blocks.set(blockData.id, block);
                layerBlocks.push(block);

                for (const cell of block.cells) {
                    if (
                        cell.row >= 0 &&
                        cell.row < CONFIG.GRID_ROWS &&
                        cell.col >= 0 &&
                        cell.col < CONFIG.GRID_COLS
                    ) {
                        this.grid[cell.row][cell.col] = {
                            blockId: blockData.id,
                            layerIndex,
                        };
                    }
                }
            }

            this.layerMap.set(layerIndex, layerBlocks);
        }

        this.recalculateAllStates();
    }

    // ----------------------------------------------------------
    // State Management
    // ----------------------------------------------------------

    getBlockState(block) {
        let coveredCells = 0;
        const totalCells = block.cells.length;

        for (const cell of block.cells) {
            let coveredThisCell = false;

            for (const [layerIdx, layerBlocks] of this.layerMap) {
                if (layerIdx <= block.layer) continue;

                for (const otherBlock of layerBlocks) {
                    if (!this.blocks.has(otherBlock.id)) continue;

                    for (const otherCell of otherBlock.cells) {
                        if (otherCell.row === cell.row && otherCell.col === cell.col) {
                            coveredThisCell = true;
                            break;
                        }
                    }

                    if (coveredThisCell) break;
                }

                if (coveredThisCell) break;
            }

            if (coveredThisCell) {
                coveredCells++;
            }
        }

        if (coveredCells === 0) return 'pullable';
        if (coveredCells >= totalCells) return 'covered';

        return 'blocked';
    }

    /**
     * Important:
     * Overlay must be based on visual depth relative to the current top visible layer,
     * not the raw layer index from level data.
     *
     * Example:
     * - Level has only one layer with index 2.
     * - Raw layer index = 2 would incorrectly use LAYER_OVERLAYS[2].
     * - Relative visual depth = 0, so no dark overlay.
     */
    updateVisualLayerDepths(stateMap = null) {
        const visibleBlocks = [];

        for (const [id, block] of this.blocks) {
            if (!block) continue;

            const state = stateMap ? stateMap.get(block) : block.state;

            if (state === 'covered') continue;

            visibleBlocks.push(block);
        }

        if (visibleBlocks.length === 0) return;

        const topLayer = Math.max(...visibleBlocks.map(block => block.layer || 0));

        for (const block of visibleBlocks) {
            block.visualLayerDepth = Math.max(0, topLayer - (block.layer || 0));
        }

        // Covered blocks can keep any value, but 0 is safer when they become visible later.
        for (const [id, block] of this.blocks) {
            if (!visibleBlocks.includes(block)) {
                block.visualLayerDepth = 0;
            }
        }
    }

    recalculateAllStates() {
        const stateMap = new Map();

        for (const [id, block] of this.blocks) {
            const newState = this.getBlockState(block);
            stateMap.set(block, newState);
        }

        this.updateVisualLayerDepths(stateMap);

        for (const [id, block] of this.blocks) {
            const newState = stateMap.get(block);

            block.resetTransientVisualFlags();

            // force = true so the overlay refreshes even when state hasn't changed.
            block.setState(newState, true);
        }
    }

    getTopVisibleLayerIndex() {
        let topLayerIdx = -1;

        for (const [, block] of this.blocks) {
            if (block.state !== 'covered' && block.layer > topLayerIdx) {
                topLayerIdx = block.layer;
            }
        }

        return topLayerIdx;
    }

    resetLayerPreview() {
        for (const [, block] of this.blocks) {
            if (!block?.container) continue;
            block.restoreVisualState();
        }
    }

    applyLayerPeekVisual(block, depth, coveredFlagName) {
        if (!block?.container) return;

        const safeDepth = Math.max(1, depth);
        const containerAlpha = safeDepth === 1 ? 0.95 : safeDepth === 2 ? 0.35 : 0.15;
        const overlayAlpha = safeDepth === 1
            ? (CONFIG.XRAY_LOWER_OVERLAY ?? 0.02)
            : Math.min(0.55, 0.18 * (safeDepth - 1));

        block[coveredFlagName] = (block.state === 'covered');
        block.container.setVisible(true);
        block.container.setAlpha(containerAlpha);
        block.container.setDepth(block.getBaseDepth());

        for (const sprite of block.cellSprites) {
            if (safeDepth === 1) {
                sprite.clearTint();
                sprite.setAlpha(1);
            } else {
                sprite.setAlpha(containerAlpha);
            }
        }

        for (const glow of block.glowSprites) {
            glow.setAlpha(safeDepth === 1 ? 0.12 : 0);
        }

        for (const overlay of block.overlaySprites) {
            overlay.setAlpha(overlayAlpha);
        }

        block.updateConnectorOverlay(overlayAlpha);

        if (block.connectorGraphics) {
            block.connectorGraphics.setAlpha(containerAlpha);
        }

        if (block.shadowGraphics) {
            block.shadowGraphics.setAlpha(safeDepth === 1 ? 1 : 0);
        }
    }

    /**
     * X-Ray mode:
     * ON fades the current top layer; lower layers become readable by depth.
     * OFF restores every block through the normal state renderer.
     */
    setXRayMode(isOn) {
        this.resetLayerPreview();
        if (!isOn) return;

        const topLayerIdx = this.getTopVisibleLayerIndex();
        if (topLayerIdx < 0) return;

        for (const [, block] of this.blocks) {
            if (!block.container || block.layer > topLayerIdx) continue;

            if (block.layer === topLayerIdx) {
                block._xRay = true;
                block.container.setVisible(true);
                block.container.setAlpha(CONFIG.XRAY_TOP_ALPHA ?? 0);
                block.container.setDepth(block.getBaseDepth());
                continue;
            }

            this.applyLayerPeekVisual(block, topLayerIdx - block.layer, '_xRayRevealedCovered');
        }
    }

    /**
     * X-Ray peek for one held block.
     * Only lower blocks sharing at least one cell are revealed.
     */
    setXRayModeForBlock(heldBlock, isOn) {
        this.resetLayerPreview();

        if (!isOn || !heldBlock?.container) return;

        heldBlock._xRayHeld = true;
        heldBlock.container.setVisible(true);
        heldBlock.container.setAlpha(CONFIG.XRAY_TOP_ALPHA ?? 0);
        heldBlock.container.setDepth(heldBlock.getBaseDepth());

        const cellKeys = new Set(heldBlock.cells.map(cell => `${cell.row},${cell.col}`));

        for (const [, other] of this.blocks) {
            if (other === heldBlock || !other.container) continue;
            if (other.layer >= heldBlock.layer) continue;
            if (!other.cells.some(cell => cellKeys.has(`${cell.row},${cell.col}`))) continue;

            other._xRayPeek = true;
            this.applyLayerPeekVisual(other, heldBlock.layer - other.layer, '_xRayPeekWasCovered');
        }
    }

    removeBlock(block) {
        for (const cell of block.cells) {
            if (
                cell.row >= 0 &&
                cell.row < CONFIG.GRID_ROWS &&
                cell.col >= 0 &&
                cell.col < CONFIG.GRID_COLS
            ) {
                const gridCell = this.grid[cell.row][cell.col];

                if (gridCell && gridCell.blockId === block.id) {
                    this.grid[cell.row][cell.col] = null;
                }
            }
        }

        const layerBlocks = this.layerMap.get(block.layer);

        if (layerBlocks) {
            const idx = layerBlocks.indexOf(block);

            if (idx !== -1) {
                layerBlocks.splice(idx, 1);
            }
        }

        this.blocks.delete(block.id);

        this.recalculateAllStates();
    }

    // ----------------------------------------------------------
    // Queries
    // ----------------------------------------------------------

    getPullableBlocks() {
        const result = [];

        for (const [id, block] of this.blocks) {
            if (block.state === 'pullable' &&
                !(block.isFrozen && block.isFrozen()) &&
                !block.isLocked) {
                result.push(block);
            }
        }

        return result;
    }

    getFrozenBlocks() {
    const result = [];

    for (const [id, block] of this.blocks) {
        if (block && block.isFrozen && block.isFrozen()) {
            result.push(block);
        }
    }

    return result;
}

getFrozenCountdownTargets(forBlock = null) {
    const result = [];
    const sameLayer = forBlock != null ? forBlock.layer : -1;
    if (sameLayer < 0) return result;

    for (const [id, block] of this.blocks) {
        if (!block || !block.isFrozen || !block.isFrozen()) continue;
        if (block.isLocked) continue;
        if (block.layer === sameLayer && block.state !== 'covered') result.push(block);
    }

    return result;
}

/**
 * Frozen Countdown rule:
 * Each time a block blasts, only frozen blocks that were eligible BEFORE this
 * remove/blast turn have their count decremented.
 *
 * options.targets:
 * - Snapshot of frozen blocks allowed to count down this turn.
 * - Must be taken BEFORE the current block is removed from the board.
 *
 * Rationale:
 * If the blasted block reveals a frozen block on a lower layer, that newly
 * revealed block does not decrement in the same turn — it starts counting
 * from the next blast.
 */
decreaseFrozenCounts(amount = 1, options = {}) {
    const unlocked = [];
    const step = Math.max(1, amount || 1);

    const targets = Array.isArray(options.targets)
        ? options.targets
        : this.getFrozenCountdownTargets();

    for (const block of targets) {
        if (!block) continue;

        // Block may have been removed by other logic.
        if (!this.blocks.has(block.id)) continue;

        if (!block.isFrozen || !block.isFrozen()) continue;

        if (block.state === 'covered') continue;

        const didUnlock = block.decreaseFrozenCount
            ? block.decreaseFrozenCount(step, { animate: options.animate !== false })
            : false;

        if (didUnlock) {
            unlocked.push(block);
        }
    }

    return unlocked;
}

    activateKey(keyColor, sourceBlock) {
        if (!keyColor) return [];

        const unlockedBlocks = [];

        for (const [id, block] of this.blocks) {
            if (!block || block.isExiting) continue;

            if (block.lockColor === keyColor && block.unlock && block.unlock()) {
                unlockedBlocks.push(block);
            }
        }

        if (unlockedBlocks.length > 0) {
            this.playKeyActivationEffect(keyColor, sourceBlock, unlockedBlocks);
            this.recalculateAllStates();
        }

        return unlockedBlocks;
    }

    playKeyActivationEffect(keyColor, sourceBlock, unlockedBlocks) {
        if (!this.scene || !sourceBlock) return;

        const color = (window.COLORS[keyColor] && window.COLORS[keyColor].hex) || 0xFFFFFF;
        const source = sourceBlock.getScreenCenter ? sourceBlock.getScreenCenter() : null;
        if (!source) return;

        const flash = this.scene.add.circle(source.x, source.y, 14, 0xFFFFFF, 0.9);
        flash.setDepth(86);

        this.scene.tweens.add({
            targets: flash,
            scaleX: 2.2,
            scaleY: 2.2,
            alpha: 0,
            duration: 220,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy(),
        });

        const particles = this.scene.add.particles(source.x, source.y, 'particle_star', {
            speed: { min: 80, max: 190 },
            scale: { start: 0.6, end: 0 },
            lifespan: 360,
            quantity: 18,
            tint: color,
        });

        particles.setDepth(85);
        this.scene.time.delayedCall(420, () => {
            if (particles && particles.destroy) particles.destroy();
        });

        unlockedBlocks.forEach((block, index) => {
            if (!block || !block.getScreenCenter) return;
            const target = block.getScreenCenter();
            const line = this.scene.add.graphics();
            line.setDepth(84);
            line.lineStyle(3, color, 0.85);
            line.beginPath();
            line.moveTo(source.x, source.y);
            line.lineTo(target.x, target.y);
            line.strokePath();

            this.scene.tweens.add({
                targets: line,
                alpha: 0,
                duration: 280,
                delay: 70 + index * 45,
                ease: 'Quad.easeOut',
                onComplete: () => line.destroy(),
            });
        });
    }

    getVisibleBlocks() {
        const result = [];

        for (const [id, block] of this.blocks) {
            if (block.state === 'pullable' || block.state === 'blocked') {
                result.push(block);
            }
        }

        return result;
    }

    getBlockAt(row, col) {
        let topBlock = null;
        let topLayer = -Infinity;

        for (const [id, block] of this.blocks) {
            if (block.state === 'covered') continue;

            for (const cell of block.cells) {
                if (cell.row === row && cell.col === col && block.layer > topLayer) {
                    topBlock = block;
                    topLayer = block.layer;
                }
            }
        }

        return topBlock;
    }

    isEmpty() {
        return this.blocks.size === 0;
    }

    destroy() {
        if (this.containerGfx) {
            this.containerGfx.destroy();
            this.containerGfx = null;
        }

        if (this.arrowGfx) {
            this.arrowGfx.destroy();
            this.arrowGfx = null;
        }

        for (const sprite of this.gridBgSprites) {
            sprite.destroy();
        }

        this.gridBgSprites = [];

        for (const [id, block] of this.blocks) {
            block.destroy();
        }

        this.blocks.clear();
        this.layerMap.clear();
    }
};




// ============================================================
// CubeManager — Object pool for physics cubes
// ============================================================

window.CubeManager = class CubeManager {
    constructor(scene) {
        this.scene = scene;
        this.active = [];
        this.inactive = [];
    }

    preAllocate(count) {
        for (let i = 0; i < count; i++) {
            const sprite = this.scene.add.image(0, 0, 'cube_red');
            sprite.setVisible(false);
            sprite.setDepth(15);

            this.inactive.push({
                sprite,
                body: null,
                color: null,
                state: 'INACTIVE',
                stateTime: 0,
                vx: 0,
                vy: 0,
            });
        }
    }

    acquire(color) {
        let cube;

        if (this.inactive.length > 0) {
            cube = this.inactive.pop();
        } else {
            const sprite = this.scene.add.image(0, 0, 'cube_red');
            sprite.setDepth(15);

            cube = {
                sprite,
                body: null,
                color: null,
                state: 'INACTIVE',
                stateTime: 0,
                vx: 0,
                vy: 0,
            };
        }

        cube.color = color;
        cube.sprite.setTexture('cube_' + color);
        cube.sprite.setVisible(true);
        cube.sprite.setAlpha(1);
        cube.sprite.setScale(1);
        cube.state = 'SPAWNING';
        cube.stateTime = Date.now();
        cube.vx = 0;
        cube.vy = 0;

        this.active.push(cube);

        return cube;
    }

    release(cube) {
        if (!cube) return;

        // Kill all tweens that may still move this cube into conveyor/car.
        if (cube.sprite && cube.sprite.scene) {
            this.scene.tweens.killTweensOf(cube.sprite);
        }

        if (cube.body) {
            this.scene.matter.world.remove(cube.body);
            cube.body = null;
        }

        if (cube.sprite) {
            cube.sprite.setVisible(false);
            cube.sprite.setAlpha(1);
            cube.sprite.setScale(1);
            cube.sprite.setPosition(-9999, -9999);
        }

        cube.state = 'INACTIVE';
        cube.color = null;
        cube.vx = 0;
        cube.vy = 0;
        cube.stateTime = 0;

        const idx = this.active.indexOf(cube);

        if (idx !== -1) {
            this.active.splice(idx, 1);
        }

        if (!this.inactive.includes(cube)) {
            this.inactive.push(cube);
        }
    }

    spawnFromBlock(block) {
        const cubes = [];

        // Apply the container's lift offset so cubes spawn at the block's
        // current visual position, not the original grid position.
        let offsetX = 0;
        let offsetY = 0;
        if (block.container && block.cells.length > 0) {
            const fc = block.cells[0];
            const anchorX = CONFIG.BOARD_OFFSET_X + fc.col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
            const anchorY = CONFIG.BOARD_OFFSET_Y + fc.row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
            offsetX = block.container.x - anchorX;
            offsetY = block.container.y - anchorY;
        }

        for (const cell of block.cells) {
            const cellX = CONFIG.BOARD_OFFSET_X + cell.col * CONFIG.CELL_SIZE + CONFIG.CELL_DRAW / 2 + offsetX;
            const cellY = CONFIG.BOARD_OFFSET_Y + cell.row * CONFIG.CELL_SIZE + CONFIG.CELL_DRAW / 2 + offsetY;

            const cubesPerCell = CONFIG.CUBES_PER_CELL || 4;
            const burstRadius = Math.max(5, CONFIG.CELL_SIZE * 0.22);

            for (let i = 0; i < cubesPerCell; i++) {
                const cube = this.acquire(block.color);

                const angle = (Math.PI * 2 * i) / cubesPerCell;
                const jitter = 0.75 + Math.random() * 0.35;
                const offX = Math.cos(angle) * burstRadius * jitter;
                const offY = Math.sin(angle) * burstRadius * jitter;

                cube.sprite.setPosition(cellX + offX, cellY + offY);

                cube.vx = Math.cos(angle) * 120 + (Math.random() - 0.5) * 45;
                cube.vy = Math.sin(angle) * 80 - (70 + Math.random() * 70);

                this.scene.time.delayedCall(CONFIG.CUBE_BURST_DELAY, () => {
                    if (!cube || cube.state === 'INACTIVE') return;
                    this.createPhysicsBody(cube);
                });

                cubes.push(cube);
            }
        }

        return cubes;
    }

    createPhysicsBody(cube) {
        if (!cube || cube.state === 'INACTIVE') return;
        if (!cube.sprite || !cube.sprite.scene) return;

        const x = cube.sprite.x;
        const y = cube.sprite.y;
        const cs = CONFIG.CUBE_SIZE;

        const body = this.scene.matter.add.rectangle(x, y, cs, cs, {
            restitution: CONFIG.CUBE_RESTITUTION,
            friction: CONFIG.CUBE_FRICTION,
            frictionStatic: CONFIG.CUBE_FRICTION_STATIC,
            frictionAir: CONFIG.CUBE_FRICTION_AIR,
            density: CONFIG.CUBE_DENSITY,
            linearDamping: CONFIG.CUBE_LINEAR_DAMPING,
            collisionFilter: {
                group: -1,
                category: 0x0002,
                mask: 0x0001,
            },
        });

        this.scene.matter.body.setVelocity(body, {
            x: cube.vx * 0.016,
            y: cube.vy * 0.016,
        });

        cube.body = body;
        cube.state = 'PHYSICS';
        cube.stateTime = Date.now();
    }

    update() {
        const now = Date.now();

        for (let i = this.active.length - 1; i >= 0; i--) {
            const cube = this.active[i];

            if (cube.state === 'SPAWNING') {
                const dt = 0.016;

                cube.sprite.x += cube.vx * dt;
                cube.sprite.y += cube.vy * dt;
                cube.vy += 200 * dt;
            }

            else if (cube.state === 'PHYSICS' && cube.body) {
                cube.sprite.setPosition(cube.body.position.x, cube.body.position.y);

                if (cube.body.position.y > CONFIG.CONTAINER_FUNNEL_BOTTOM + 20) {
                    this.scene.matter.body.setPosition(cube.body, {
                        x: CONFIG.CONTAINER_X,
                        y: CONFIG.CONTAINER_FUNNEL_BOTTOM - 5,
                    });

                    this.scene.matter.body.setVelocity(cube.body, {
                        x: 0,
                        y: 0,
                    });
                }
            }

            else if (cube.state === 'ON_CONVEYOR') {
                // Conveyor controls the position.
            }

            else if (cube.state === 'DONE') {
                this.release(cube);
            }
        }
    }

    getActiveCubes() {
        return this.active;
    }

    getCubesByState(state) {
        return this.active.filter(cube => cube.state === state);
    }

    /**
     * Revive / cleanup hard clear.
     *
     * This clears:
     * - falling cubes
     * - physics cubes
     * - funnel cubes
     * - draining cubes
     * - conveyor cubes
     * - matching cubes flying into cars
     */
    clear() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            this.release(this.active[i]);
        }
    }
};




// ============================================================
// Funnel — Deterministic queue funnel
// Cubes still fall with Matter.js for visual feel, but the funnel
// captures them into a stable buffer and drains them to Conveyor.
// ============================================================

window.Funnel = class Funnel {
    constructor(scene, capacity = CONFIG.FUNNEL_CAPACITY) {
        this.scene = scene;
        this.capacity = capacity ?? CONFIG.FUNNEL_CAPACITY;

        // Main buffer. A cube in this array is already owned by Funnel.
        this.cubesInFunnel = [];

        // Cubes currently tweening from Funnel to Conveyor.
        this.drainingCubes = new Set();

        // Kept for compatibility with older Revive/GameState code.
        this.drainTimer = null;
        this.isDraining = false;

        this.nextDrainAt = 0;
        this.overflowed = false;
        this.destroyed = false;

        // Cached layout values.
        this.cx = CONFIG.CONTAINER_X;
        this.gridBottom = CONFIG.CONTAINER_GRID_BOTTOM;
        this.funnelBottom = CONFIG.CONTAINER_FUNNEL_BOTTOM;
        this.containerWidth = CONFIG.CONTAINER_WIDTH;
        this.drainWidth = CONFIG.FUNNEL_DRAIN_WIDTH;

        this.catchTop = this.gridBottom - 4;
        this.catchBottom = this.funnelBottom + 26;
        this.drainX = this.cx;
        this.drainY = this.funnelBottom - 8;

        this.bodies = [];
        this.gfx = null;

        this.createVisuals();
        this.createWalls();
    }

    // ───────────────────────────────────────
    // Visual + physics walls
    // ───────────────────────────────────────

    createVisuals() {
        const g = this.scene.add.graphics();
        g.setDepth(4);
        this.gfx = g;

        const left = this.cx - this.containerWidth / 2;
        const right = this.cx + this.containerWidth / 2;
        const drainLeft = this.cx - this.drainWidth / 2;
        const drainRight = this.cx + this.drainWidth / 2;
        const topY = this.gridBottom;
        const bottomY = this.funnelBottom;

        // Soft translucent funnel body.
        g.fillStyle(THEME.CONTAINER_FILL, 0.55);
        g.lineStyle(3, THEME.CONTAINER_STROKE, 0.9);
        g.beginPath();
        g.moveTo(left, topY);
        g.lineTo(right, topY);
        g.lineTo(drainRight, bottomY);
        g.lineTo(drainLeft, bottomY);
        g.closePath();
        g.fillPath();
        g.strokePath();

        // Drain mouth.
        g.fillStyle(0x252535, 0.95);
        g.lineStyle(2, THEME.CONTAINER_STROKE, 0.8);
        g.fillRoundedRect(drainLeft - 5, bottomY - 5, this.drainWidth + 10, 14, 6);
        g.strokeRoundedRect(drainLeft - 5, bottomY - 5, this.drainWidth + 10, 14, 6);
    }

    createWalls() {
        const cx = this.cx;
        const w = this.containerWidth;
        const gridBot = this.gridBottom;
        const funBot = this.funnelBottom;
        const drainW = this.drainWidth;

        const left = cx - w / 2;
        const right = cx + w / 2;
        const drainLeft = cx - drainW / 2;
        const drainRight = cx + drainW / 2;

        const wallOptions = {
            isStatic: true,
            friction: 0.2,
            frictionStatic: 0.7,
            restitution: 0,
            collisionFilter: { category: 0x0001, mask: 0x0002 },
        };

        // Top side walls keep cubes inside the board container before they enter the funnel.
        const topY = CONFIG.BOARD_OFFSET_Y;
        this.addWall(left - 3, (topY + gridBot) / 2, 6, gridBot - topY, 0, wallOptions);
        this.addWall(right + 3, (topY + gridBot) / 2, 6, gridBot - topY, 0, wallOptions);

        // Sloped funnel walls.
        this.addSegmentWall(left, gridBot, drainLeft, funBot, 7, wallOptions);
        this.addSegmentWall(right, gridBot, drainRight, funBot, 7, wallOptions);

        // Invisible stopper under the drain.
        // It prevents physics bodies from tunneling out before Funnel.update() captures them.
        this.addWall(cx, funBot + 8, drainW + 18, 8, 0, wallOptions);
    }

    addWall(x, y, width, height, angle, options) {
        const body = this.scene.matter.add.rectangle(x, y, width, height, {
            ...options,
            angle,
        });

        this.bodies.push(body);
        return body;
    }

    addSegmentWall(x1, y1, x2, y2, thickness, options) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        return this.addWall(midX, midY, len, thickness, angle, options);
    }

    // ───────────────────────────────────────
    // Capture logic
    // ───────────────────────────────────────

    update(conveyor) {
        if (this.destroyed) return;

        this.purgeInvalidDrainingCubes();
        this.capturePhysicsCubes();
        this.arrangeQueuedCubes(false);
        this.tryDrain(conveyor);
    }

    capturePhysicsCubes() {
        const cubeManager = this.scene.cubeManager;
        if (!cubeManager) return;

        const now = Date.now();
        const active = cubeManager.getActiveCubes
            ? cubeManager.getActiveCubes()
            : cubeManager.active;

        if (!active) return;

        for (let i = active.length - 1; i >= 0; i--) {
            const cube = active[i];

            if (!cube || cube.state !== 'PHYSICS' || !cube.body) continue;

            const pos = cube.body.position;

            // Gently guide cubes toward the center as they enter the funnel.
            if (pos.y > this.gridBottom - 18) {
                const dx = this.cx - pos.x;

                this.scene.matter.body.applyForce(cube.body, pos, {
                    x: Phaser.Math.Clamp(dx, -80, 80) * 0.00008,
                    y: 0.00003,
                });
            }

            const insideFunnel = this.isPointInsideFunnel(pos.x, pos.y);
            const belowSafetyLine = pos.y > this.catchBottom;
            const timedOut = now - cube.stateTime > 2200;

            if (insideFunnel || belowSafetyLine || timedOut) {
                this.addCube(cube);
            }
        }
    }

    isPointInsideFunnel(x, y) {
        if (y < this.catchTop || y > this.catchBottom) return false;

        const t = Phaser.Math.Clamp(
            (y - this.gridBottom) / Math.max(1, this.funnelBottom - this.gridBottom),
            0,
            1
        );

        // Funnel width narrows from container width to drain width.
        const widthAtY = Phaser.Math.Linear(this.containerWidth, this.drainWidth + 16, t);

        return Math.abs(x - this.cx) <= widthAtY / 2 + 8;
    }

    addCube(cube) {
        if (!cube || this.destroyed) return false;

        if (this.cubesInFunnel.includes(cube) || this.drainingCubes.has(cube)) {
            return true;
        }

        if (this.isFull()) {
            this.overflowed = true;
            return false;
        }

        if (cube.body) {
            cube.sprite.setPosition(cube.body.position.x, cube.body.position.y);
            this.scene.matter.world.remove(cube.body);
            cube.body = null;
        }

        this.scene.tweens.killTweensOf(cube.sprite);

        cube.state = 'IN_FUNNEL';
        cube.stateTime = Date.now();
        cube.funnelSlotIndex = null;
        cube.sprite.setVisible(true);
        cube.sprite.setAlpha(1);
        cube.sprite.setScale(0.95);

        this.cubesInFunnel.push(cube);
        this.arrangeQueuedCubes(true);

        return true;
    }

    // ───────────────────────────────────────
    // Queue layout + drain
    // ───────────────────────────────────────

    arrangeQueuedCubes(animated) {
        for (let i = 0; i < this.cubesInFunnel.length; i++) {
            const cube = this.cubesInFunnel[i];

            if (!cube || cube.state !== 'IN_FUNNEL') continue;

            const slot = this.getSlotPosition(i);

            if (cube.funnelSlotIndex === i && !animated) continue;

            cube.funnelSlotIndex = i;

            if (animated) {
                this.scene.tweens.killTweensOf(cube.sprite);

                this.scene.tweens.add({
                    targets: cube.sprite,
                    x: slot.x,
                    y: slot.y,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 110,
                    ease: 'Sine.easeOut',
                });
            } else {
                cube.sprite.setPosition(slot.x, slot.y);
                cube.sprite.setScale(0.9);
            }
        }
    }

    getSlotPosition(index) {
        // Compact storage inside the funnel:
        // 8 cubes per row, up to 5 rows for 40 cap.
        const perRow = 8;
        const spacingX = 11;
        const spacingY = 10;

        const row = Math.floor(index / perRow);
        const col = index % perRow;

        const itemsInRow = Math.min(
            perRow,
            this.capacity - row * perRow,
            this.cubesInFunnel.length - row * perRow
        );

        const rowWidth = Math.max(0, (itemsInRow - 1) * spacingX);

        // Bottom row is closest to drain. Newer rows stack upward.
        return {
            x: this.cx - rowWidth / 2 + col * spacingX,
            y: this.funnelBottom - 14 - row * spacingY,
        };
    }

    tryDrain(conveyor) {
        if (!conveyor) return;
        if (this.cubesInFunnel.length === 0) return;
        if (conveyor.isFull()) return;

        const now = Date.now();

        if (now < this.nextDrainAt) return;

        const cube = this.cubesInFunnel.shift();

        if (!cube || cube.state === 'INACTIVE' || cube.state === 'DONE') {
            this.arrangeQueuedCubes(true);
            return;
        }

        cube.state = 'DRAINING';
        cube.stateTime = now;
        cube.funnelSlotIndex = null;

        this.drainingCubes.add(cube);

        this.nextDrainAt = now + (CONFIG.DRAIN_INTERVAL || 40);

        this.arrangeQueuedCubes(true);

        const entryT = conveyor.getEntryT();
        const entryPos = conveyor.getPathPosition(entryT);

        this.scene.tweens.killTweensOf(cube.sprite);

        this.scene.tweens.add({
            targets: cube.sprite,
            x: entryPos.x,
            y: entryPos.y,
            scaleX: 0.82,
            scaleY: 0.82,
            duration: 140,
            ease: 'Power2',
            onComplete: () => {
                this.drainingCubes.delete(cube);

                if (this.destroyed || cube.state === 'INACTIVE' || cube.state === 'DONE' || cube.state === 'REVIVING') {
                    return;
                }

                // Conveyor may have become full while the tween was running.
                // Put the cube back at the front instead of losing it.
                if (conveyor.isFull()) {
                    cube.state = 'IN_FUNNEL';
                    cube.stateTime = Date.now();

                    this.cubesInFunnel.unshift(cube);
                    this.arrangeQueuedCubes(true);

                    return;
                }

                cube.sprite.setScale(1);
                conveyor.addCube(cube);
            },
        });
    }

    // Kept for compatibility with old code.
    // Draining is now update-driven.
    startDraining(conveyor) {
        this.tryDrain(conveyor);
    }

    drainOne(conveyor) {
        this.tryDrain(conveyor);
    }

    // ───────────────────────────────────────
    // Queries / cleanup
    // ───────────────────────────────────────

    purgeInvalidDrainingCubes() {
        for (const cube of Array.from(this.drainingCubes)) {
            if (
                !cube ||
                cube.state === 'INACTIVE' ||
                cube.state === 'DONE' ||
                cube.state === 'REVIVING' ||
                !cube.sprite ||
                !cube.sprite.scene
            ) {
                this.drainingCubes.delete(cube);
            }
        }
    }

    getCubeCount() {
        this.purgeInvalidDrainingCubes();
        return this.cubesInFunnel.length + this.drainingCubes.size;
    }

    getLoadPercent() {
        if (this.capacity <= 0) return 1;

        return this.getCubeCount() / this.capacity;
    }

    isFull() {
        return this.getCubeCount() >= this.capacity;
    }

    // Flash red to signal the player that the Funnel is full and no more blocks can be tapped.
    flashFull() {
        if (this._flashTween) return;

        const midY = (this.gridBottom + this.funnelBottom) / 2;
        const flash = this.scene.add.rectangle(
            this.cx,
            midY,
            this.containerWidth,
            this.funnelBottom - this.gridBottom + 20,
            0xFF3333,
            0.38
        );
        flash.setDepth(30);

        this._flashTween = this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 380,
            ease: 'Quad.easeOut',
            onComplete: () => {
                flash.destroy();
                this._flashTween = null;
            },
        });
    }

    hasOverflowed() {
        return this.overflowed;
    }

    clear() {
        if (this.drainTimer) {
            this.drainTimer.remove(false);
            this.drainTimer = null;
        }

        this.isDraining = false;

        for (const cube of this.cubesInFunnel) {
            this.releaseFunnelCube(cube);
        }

        for (const cube of this.drainingCubes) {
            this.releaseFunnelCube(cube);
        }

        this.cubesInFunnel = [];
        this.drainingCubes.clear();
        this.overflowed = false;
    }

    releaseFunnelCube(cube) {
        if (!cube) return;

        if (cube.sprite && cube.sprite.scene) {
            this.scene.tweens.killTweensOf(cube.sprite);
        }

        if (cube.body) {
            this.scene.matter.world.remove(cube.body);
            cube.body = null;
        }

        cube.funnelSlotIndex = null;
        cube.state = 'DONE';
    }

    destroy() {
        this.destroyed = true;

        this.clear();

        for (const body of this.bodies) {
            if (body) {
                this.scene.matter.world.remove(body);
            }
        }

        this.bodies = [];

        if (this.gfx) {
            this.gfx.destroy();
            this.gfx = null;
        }
    }
};



// ============================================================
// Conveyor — Horizontal oval/stadium loop conveyor belt
// ============================================================

window.Conveyor = class Conveyor {
    constructor(scene, capacity = CONFIG.CONVEYOR_CAPACITY) {
        this.scene = scene;
        this.cubesOnBelt = [];
        this.capacity = capacity ?? CONFIG.CONVEYOR_CAPACITY;
        this.speedMultiplier = 1;
        this.trackGfx = null;
        this.warningOverlay = null;
        this.warningState = 'none'; // 'none' | 'warning' | 'danger'
        this.warningTween = null;
        this.dashGfx = null;
        this.dashPhase = 0;
        this.dashSpacing = 0.05; // t-distance between dashes (~20 around the loop)

        // Cleanup speed-boost visual (blue glow + energy sparks) — active while speedMultiplier > 1
        this._boosting = false;
        this.boostGfx = null;
        this.boostTween = null;
        this._boostSparkTimer = null;

        // Path parameters
        this.cx = CONFIG.CONVEYOR_CENTER_X;
        this.cy = CONFIG.CONVEYOR_CENTER_Y;
        this.hw = CONFIG.CONVEYOR_WIDTH / 2;   // half width
        this.hh = CONFIG.CONVEYOR_HEIGHT / 2;  // half height
        this.cr = CONFIG.CONVEYOR_CORNER_R;

        // Stations on the bottom belt, aligned directly above each car column.
        this.stations = CONFIG.CAR_COL_POSITIONS.map((x, column) => ({
            t: this.getBottomPathTForX(x),
            column,
        }));

        this.drawTrack();
    }

    drawTrack() {
        const g = this.scene.add.graphics();
        this.trackGfx = g;
        g.setDepth(5);

        // Track outline (stadium/pill shape)
        g.lineStyle(3, THEME.CONTAINER_STROKE, 1);
        g.fillStyle(THEME.CONTAINER_FILL, 1);

        const x = this.cx - this.hw;
        const y = this.cy - this.hh;
        const w = CONFIG.CONVEYOR_WIDTH;
        const h = CONFIG.CONVEYOR_HEIGHT;

        g.fillRoundedRect(x, y, w, h, this.cr);
        g.strokeRoundedRect(x, y, w, h, this.cr);

        // Inner track (darker)
        g.fillStyle(0x252535, 1);
        g.fillRoundedRect(x + 6, y + 6, w - 12, h - 12, this.cr - 4);

        // Animated moving dashes to sell the belt-running motion
        const dg = this.scene.add.graphics();
        dg.setDepth(5.5);
        this.dashGfx = dg;
        this.renderBeltDashes();

        this._initWarningOverlay();
    }

    renderBeltDashes() {
        const g = this.dashGfx;
        if (!g) return;
        g.clear();

        if (this._boosting) {
            // Streaking cyan-blue light trails — sells the "supercharged" cleanup speed
            g.lineStyle(4, 0x29D7FF, 0.9);
        } else {
            g.lineStyle(3, THEME.CONTAINER_STROKE, 0.5);
        }

        const dashLen = this._boosting ? 0.022 : 0.012; // t-length of each dash mark (longer streaks when boosting)
        for (let t = this.dashPhase; t < 1; t += this.dashSpacing) {
            const p1 = this.getPathPosition(t);
            const p2 = this.getPathPosition(t + dashLen);
            g.beginPath();
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
            g.strokePath();
        }
    }

    _initWarningOverlay() {
        const g = this.scene.add.graphics();
        g.setDepth(6); // above trackGfx
        g.setAlpha(0);
        this.warningOverlay = g;
    }

    _drawOverlay(color) {
        const g = this.warningOverlay;
        g.clear();
        g.fillStyle(color, 1);
        g.fillRoundedRect(
            this.cx - this.hw,
            this.cy - this.hh,
            this.hw * 2,
            this.hh * 2,
            this.cr
        );
    }

    getPathMetrics() {
        const straightW = this.hw - this.cr;
        const r = this.cr;
        const innerOffset = 10;

        const totalPerimeter = 2 * straightW * 2 + 2 * Math.PI * (r - innerOffset / 2);
        const topLen = straightW * 2;
        const rightArc = Math.PI * (r - innerOffset / 2);
        const botLen = straightW * 2;
        const leftArc = Math.PI * (r - innerOffset / 2);

        return {
            straightW,
            r,
            innerOffset,
            topFrac: topLen / totalPerimeter,
            rightFrac: rightArc / totalPerimeter,
            botFrac: botLen / totalPerimeter,
            leftFrac: leftArc / totalPerimeter,
        };
    }

    getBottomPathTForX(x) {
        const metrics = this.getPathMetrics();
        const rightX = this.cx + metrics.straightW;
        const bottomFrac = Phaser.Math.Clamp(
            (rightX - x) / (metrics.straightW * 2),
            0,
            1
        );

        return metrics.topFrac + metrics.rightFrac + bottomFrac * metrics.botFrac;
    }

    getTopPathTForX(x) {
        const metrics = this.getPathMetrics();
        const leftX = this.cx - metrics.straightW;
        const topFrac = Phaser.Math.Clamp(
            (x - leftX) / (metrics.straightW * 2),
            0,
            1
        );

        return topFrac * metrics.topFrac;
    }

    /** Returns the t value for the center of the top edge (entry point from Funnel). */
    getEntryT() {
        const { topFrac } = this.getPathMetrics();
        return topFrac / 2;
    }

    /**
     * Convert t (0-1) to screen position on the oval path.
     * Path: stadium shape going clockwise from top-center.
     * 
     * Segments:
     * 0.0-0.25: Top edge, left to right (adjusted: start from center-top going right)
     * 0.25-0.30: Right semicircle
     * 0.30-0.80: Bottom edge, right to left
     * 0.80-0.85: Left semicircle  
     * 0.85-1.0: Top edge continues to start
     * 
     * Simplified: Use parametric oval (rounded rect approximation)
     */
    getPathPosition(t) {
        // Normalize t to 0-1
        t = ((t % 1) + 1) % 1;

        const cx = this.cx;
        const cy = this.cy;
        const {
            straightW,
            r,
            innerOffset,
            topFrac,
            rightFrac,
            botFrac,
            leftFrac,
        } = this.getPathMetrics();

        let x, y;

        if (t < topFrac) {
            // Top edge: left to right
            const frac = t / topFrac;
            x = cx - straightW + frac * 2 * straightW;
            y = cy - this.hh + innerOffset;
        } else if (t < topFrac + rightFrac) {
            // Right semicircle
            const frac = (t - topFrac) / rightFrac;
            const angle = -Math.PI / 2 + frac * Math.PI;
            x = cx + straightW + (r - innerOffset) * Math.cos(angle);
            y = cy + (r - innerOffset) * Math.sin(angle);
        } else if (t < topFrac + rightFrac + botFrac) {
            // Bottom edge: right to left
            const frac = (t - topFrac - rightFrac) / botFrac;
            x = cx + straightW - frac * 2 * straightW;
            y = cy + this.hh - innerOffset;
        } else {
            // Left semicircle
            const frac = (t - topFrac - rightFrac - botFrac) / leftFrac;
            const angle = Math.PI / 2 + frac * Math.PI;
            x = cx - straightW + (r - innerOffset) * Math.cos(angle);
            y = cy + (r - innerOffset) * Math.sin(angle);
        }

        return { x, y };
    }

    addCube(cube) {
        cube.state = 'ON_CONVEYOR';
        cube.stateTime = Date.now();
        const entryT = this.getEntryT();
        const entry = this.getPathPosition(entryT);
        cube.sprite.setPosition(entry.x, entry.y);

        this.cubesOnBelt.push({
            cube: cube,
            pathT: entryT,
            color: cube.color,
            absorbedByCars: new Set(), // cars already tried this lap
        });
    }

    removeCube(cubeEntry) {
        const idx = this.cubesOnBelt.indexOf(cubeEntry);
        if (idx !== -1) this.cubesOnBelt.splice(idx, 1);
    }

    update(delta, carManager) {
        if (!carManager) return;

        const speed = CONFIG.CONVEYOR_SPEED * this.speedMultiplier * (delta / 1000);
        const absorbRadius = CONFIG.CAR_ABSORB_RADIUS;
        const metrics = this.getPathMetrics();
        const botStart = metrics.topFrac + metrics.rightFrac;
        const botEnd = botStart + metrics.botFrac;

        for (let i = this.cubesOnBelt.length - 1; i >= 0; i--) {
            const entry = this.cubesOnBelt[i];
            if (entry.cube.state !== 'ON_CONVEYOR') continue;

            entry.pathT += speed;
            if (entry.pathT >= 1) {
                entry.pathT -= 1;
                entry.absorbedByCars = new Set();
            }

            const pos = this.getPathPosition(entry.pathT);
            entry.cube.sprite.setPosition(pos.x, pos.y);

            const t = entry.pathT;
            const onBottom = (t >= botStart && t <= botEnd);
            if (!onBottom) continue;

            const activeCars = carManager.getActiveCars();

            for (const car of activeCars) {
                if (!entry.absorbedByCars) entry.absorbedByCars = new Set();
                if (entry.absorbedByCars.has(car)) continue;
                if (car.color !== entry.color) continue;

                const carPos = car.getAbsorbPosition();
                const dx = Math.abs(pos.x - carPos.x);

                if (dx <= absorbRadius) {
                    if (car.reserveCube(entry.color)) {
                        entry.absorbedByCars.add(car);
                        this.matchCubeWithCar(entry, car);
                        break;
                    } else {
                        entry.absorbedByCars.add(car);
                    }
                }
            }
        }

        this.dashPhase = (this.dashPhase + speed) % this.dashSpacing;
        this.renderBeltDashes();
        this.updateWarningVisual();
    }

    matchCubeWithCar(entry, car) {
        entry.cube.state = 'MATCHING';
        this.removeCube(entry);

        const sprite = entry.cube.sprite;
        const carPos = car.getAbsorbPosition();
        const scatterX = (Math.random() - 0.5) * (CONFIG.CAR_WIDTH * 0.65);
        const scatterY = (Math.random() - 0.5) * 14;

        window.SoundMgr?.cubeAbsorb(Math.random());

        const fromX = sprite.x;
        const fromY = sprite.y;
        const toX = carPos.x + scatterX;
        const toY = carPos.y + scatterY;

        // Quadratic Bezier control point: above the midpoint for a jump arc
        const cpX = (fromX + toX) * 0.5;
        const cpY = Math.min(fromY, toY) - 65;

        const duration = CONFIG.CUBE_ABSORB_DURATION ?? 200;
        const progress = { t: 0 };

        // Arc position tween via Bezier
        this.scene.tweens.add({
            targets: progress,
            t: 1,
            duration,
            ease: 'Quad.easeIn',
            onUpdate: () => {
                const t = progress.t;
                const mt = 1 - t;
                sprite.x = mt * mt * fromX + 2 * mt * t * cpX + t * t * toX;
                sprite.y = mt * mt * fromY + 2 * mt * t * cpY + t * t * toY;
            },
            onComplete: () => {
                sprite.setVisible(false);
                entry.cube.state = 'DONE';
                const isFull = car.addCube();
                if (isFull && !car.isExiting) {
                    this.scene.events.emit('carFull', car);
                }
            },
        });

        // Spin while flying, shrink only at the very end
        const spinAngle = Phaser.Math.Between(60, 120) * (Math.random() > 0.5 ? 1 : -1);
        this.scene.tweens.add({
            targets: sprite,
            angle: spinAngle,
            duration: duration * 0.75,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: sprite,
                    scaleX: 0.4,
                    scaleY: 0.4,
                    alpha: 0,
                    duration: duration * 0.25,
                    ease: 'Quad.easeIn',
                });
            },
        });
    }

    updateWarningVisual() {
        const pct = this.getLoadPercent();

        if (pct >= CONFIG.CONV_DANGER) {
            if (this.warningState !== 'danger') {
                this.warningState = 'danger';
                this._stopWarningTween();
                this._drawOverlay(THEME.DANGER_RED);
                // Fast pulse: 0.15 → 0.55 → 0.15
                this.warningTween = this.scene.tweens.add({
                    targets: this.warningOverlay,
                    alpha: { from: 0.15, to: 0.55 },
                    duration: 250,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        } else if (pct >= CONFIG.CONV_WARNING) {
            if (this.warningState !== 'warning') {
                this.warningState = 'warning';
                this._stopWarningTween();
                this._drawOverlay(THEME.WARNING_ORANGE);
                // Slow pulse: 0.08 → 0.28 → 0.08
                this.warningTween = this.scene.tweens.add({
                    targets: this.warningOverlay,
                    alpha: { from: 0.08, to: 0.28 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }
        } else {
            if (this.warningState !== 'none') {
                this.warningState = 'none';
                this._stopWarningTween();
                if (this.warningOverlay) this.warningOverlay.setAlpha(0);
            }
        }
    }

    _stopWarningTween() {
        if (this.warningTween) {
            this.warningTween.stop();
            this.warningTween = null;
        }
    }

    resetWarningVisual() {
        this._stopWarningTween();
        this.warningState = 'none';
        if (this.warningOverlay) this.warningOverlay.setAlpha(0);
        if (this.trackGfx) this.trackGfx.setAlpha(1);
    }

    getCurrentLoad() {
        return this.cubesOnBelt.filter(e => e.cube.state === 'ON_CONVEYOR').length;
    }

    getLoadPercent() {
        return this.getCurrentLoad() / this.capacity;
    }

    setSpeedMultiplier(mult) {
        this.speedMultiplier = mult;

        const boosting = mult > 1;
        if (boosting === this._boosting) return;
        this._boosting = boosting;
        if (boosting) this._startCleanupBoost();
        else this._stopCleanupBoost();
    }

    // ── Cleanup speed-boost visual ──────────────────────────────────────
    // Triggered when the conveyor accelerates to sweep remaining cubes into
    // cars (CLEANUP state) — a strong blue glow + energy sparks to make the
    // payoff moment feel powerful, not just "faster".

    _startCleanupBoost() {
        if (!this.boostGfx) {
            this.boostGfx = this.scene.add.graphics();
            this.boostGfx.setDepth(5.6);
        }
        this._drawBoostGlow();

        this.scene.tweens.killTweensOf(this.boostGfx);
        this.boostGfx.setAlpha(0.35);
        this.boostTween = this.scene.tweens.add({
            targets: this.boostGfx,
            alpha: { from: 0.35, to: 0.95 },
            duration: 260,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        if (this._boostSparkTimer) this._boostSparkTimer.remove();
        this._boostSparkTimer = this.scene.time.addEvent({
            delay: 110, loop: true, callback: () => this._spawnBoostSpark(),
        });
    }

    _stopCleanupBoost() {
        if (this.boostTween) { this.boostTween.stop(); this.boostTween = null; }
        if (this.boostGfx) { this.boostGfx.clear(); this.boostGfx.setAlpha(0); }
        if (this._boostSparkTimer) { this._boostSparkTimer.remove(); this._boostSparkTimer = null; }
    }

    _drawBoostGlow() {
        const g = this.boostGfx;
        g.clear();
        const x = this.cx - this.hw, y = this.cy - this.hh;
        const w = this.hw * 2, h = this.hh * 2;

        // Layered strokes (wide+faint → tight+bright) fake a soft glow with plain Graphics
        const layers = [
            { pad: 10, width: 6, alpha: 0.18 },
            { pad: 5,  width: 5, alpha: 0.35 },
            { pad: 0,  width: 4, alpha: 0.9 },
        ];
        for (const L of layers) {
            g.lineStyle(L.width, 0x29D7FF, L.alpha);
            g.strokeRoundedRect(x - L.pad, y - L.pad, w + L.pad * 2, h + L.pad * 2, this.cr + L.pad);
        }
    }

    _spawnBoostSpark() {
        if (!this.scene || !this.scene.add) return;
        const pos = this.getPathPosition(Math.random());
        const e = this.scene.add.particles(pos.x, pos.y, 'particle_star', {
            speed: { min: 60, max: 170 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.9, end: 0 },
            lifespan: 280,
            quantity: 3,
            tint: [0x29D7FF, 0x7FE8FF, 0xFFFFFF],
        });
        e.setDepth(5.7);
        this.scene.time.delayedCall(60, () => { if (e && e.stop) e.stop(); });
        this.scene.time.delayedCall(400, () => { if (e && e.destroy) e.destroy(); });
    }

    getCubeColors() {
        const colors = new Set();
        for (const entry of this.cubesOnBelt) {
            if (entry.cube.state === 'ON_CONVEYOR') {
                colors.add(entry.color);
            }
        }
        return colors;
    }

    isFull() {
        return this.getCurrentLoad() >= this.capacity;
    }

    clear() {
    for (const entry of this.cubesOnBelt) {
        if (!entry || !entry.cube) continue;

        const cube = entry.cube;

        if (cube.sprite && cube.sprite.scene) {
            this.scene.tweens.killTweensOf(cube.sprite);
            cube.sprite.setVisible(false);
        }

        if (cube.body) {
            this.scene.matter.world.remove(cube.body);
            cube.body = null;
        }

        cube.state = 'DONE';
    }

    this.cubesOnBelt = [];

    this.setSpeedMultiplier(1);
    this.resetWarningVisual();
}

    destroy() {
        this.clear();

        if (this.warningOverlay) {
            this.warningOverlay.destroy();
            this.warningOverlay = null;
        }

        if (this.trackGfx) {
            this.trackGfx.destroy();
            this.trackGfx = null;
        }

        if (this.dashGfx) {
            this.dashGfx.destroy();
            this.dashGfx = null;
        }

        if (this.boostGfx) {
            this.boostGfx.destroy();
            this.boostGfx = null;
        }
    }
};




// ============================================================
// Car — Toy car that receives colored cubes
// ============================================================

window.Car = class Car {
    constructor(scene, carData) {
        this.scene = scene;
        this.color = carData.color;
        this.capacity = carData.capacity;
        this.column = carData.column;
        this.queueOrder = carData.queueOrder;

        // Mystery/Hidden mechanic
        this.hidden = carData.hidden === true;
        this.isRevealed = !this.hidden; // if not hidden, always revealed

        this.filledCount = 0;
        this.reservedCount = 0;
        this.isActive = (carData.queueOrder === 0);
        this.isExiting = false;

        this.container = null;
        this.fillBar = null;
        this.fillBarBg = null;
        this.capacityText = null;
        this.capacityTextShadow = null;

        // Mystery visual refs
        this._mysteryGraphics = null;
        this._mysteryText = null;
        this._normalGroup = []; // refs to normal car visuals that get hidden when mystery

        this.x = CONFIG.CAR_COL_POSITIONS[this.column];
        this.y = this.isActive ? CONFIG.CAR_ROW1_Y : CONFIG.CAR_ROW2_Y;

        this.createVisuals();
        if (!this.isActive) {
            this.container.setScale(CONFIG.CAR_ROW2_SCALE);
            this.container.setAlpha(CONFIG.CAR_ROW2_ALPHA);
        }

        // Apply initial mystery state
        this._applyMysteryState();
    }

    createVisuals() {
        const scene = this.scene;
        const w = CONFIG.CAR_WIDTH;
        const h = CONFIG.CAR_HEIGHT;
        const colorData = COLORS[this.color];

        this.container = scene.add.container(this.x, this.y);
        this.container.setDepth(20);

        // ── Normal car graphics ──────────────────────────────
        const g = scene.add.graphics();

        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w, h, 10);

        // Body
        g.fillStyle(colorData.hex, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

        // Hood/roof (top darker area)
        g.fillStyle(colorData.dark, 1);
        g.fillRoundedRect(-w / 2 + 5, -h / 2, w - 10, h * 0.35, { tl: 8, tr: 8, bl: 0, br: 0 });

        // Cargo area (lighter, where cubes go)
        const cargoY = -h / 2 + h * 0.38;
        const cargoH = h * 0.50;
        g.fillStyle(colorData.light, 0.3);
        g.fillRect(-w / 2 + 8, cargoY, w - 16, cargoH);

        // Cargo border
        g.lineStyle(1.5, colorData.dark, 0.5);
        g.strokeRect(-w / 2 + 8, cargoY, w - 16, cargoH);

        // Wheels (4 corners)
        const wheelR = 5;
        const wx = w / 2 - 8;
        const wy = h / 2 - 4;
        g.fillStyle(0x222222, 1);
        g.fillCircle(-wx, -wy, wheelR);
        g.fillCircle(wx, -wy, wheelR);
        g.fillCircle(-wx, wy, wheelR);
        g.fillCircle(wx, wy, wheelR);

        // Wheel highlight
        g.fillStyle(0x444444, 1);
        g.fillCircle(-wx, -wy, wheelR - 2);
        g.fillCircle(wx, -wy, wheelR - 2);
        g.fillCircle(-wx, wy, wheelR - 2);
        g.fillCircle(wx, wy, wheelR - 2);

        // Shine on top
        g.fillStyle(0xFFFFFF, 0.15);
        g.fillRoundedRect(-w / 2 + 5, -h / 2 + 3, w - 10, h * 0.2, 5);

        this.container.add(g);
        this.carGraphics = g;
        this._normalGroup.push(g);

        // ── Fill bar ─────────────────────────────────────────
        const barX = -w / 2 + 9;
        const barW = w - 18;
        const barMaxH = cargoH - 2;

        this.fillBarBg = scene.add.graphics();
        this.fillBarBg.fillStyle(0x000000, 0.2);
        this.fillBarBg.fillRect(barX, cargoY + 1, barW, barMaxH);
        this.container.add(this.fillBarBg);
        this._normalGroup.push(this.fillBarBg);

        this.fillBar = scene.add.graphics();
        this.container.add(this.fillBar);
        this._normalGroup.push(this.fillBar);

        // Capacity label
        this.capacityTextShadow = scene.add.text(1, cargoY + cargoH / 2 + 1, '', {
            fontFamily: 'Outfit, Arial, sans-serif',
            fontSize: '15px',
            fontStyle: '800',
            color: '#000000',
            align: 'center',
        }).setOrigin(0.5);
        this.capacityTextShadow.setAlpha(0.5);
        this.container.add(this.capacityTextShadow);
        this._normalGroup.push(this.capacityTextShadow);

        this.capacityText = scene.add.text(0, cargoY + cargoH / 2, '', {
            fontFamily: 'Outfit, Arial, sans-serif',
            fontSize: '15px',
            fontStyle: '800',
            color: '#FFFFFF',
            stroke: '#111111',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);
        this.container.add(this.capacityText);
        this._normalGroup.push(this.capacityText);

        this._cargoY = cargoY;
        this._cargoH = cargoH;
        this._barX = barX;
        this._barW = barW;
        this._barMaxH = barMaxH;

        this.updateFillVisual();

        // ── Mystery overlay (drawn on top of normal car) ─────
        this._createMysteryOverlay(w, h);
    }

    _createMysteryOverlay(w, h) {
        const scene = this.scene;
        const mg = scene.add.graphics();

        // Mystery body shadow
        mg.fillStyle(0x000000, 0.3);
        mg.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w, h, 10);

        // Mystery body — dark grey/purple, no colour hint
        mg.fillStyle(0x3A3A55, 1);
        mg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

        // Roof darker
        mg.fillStyle(0x26263A, 1);
        mg.fillRoundedRect(-w / 2 + 5, -h / 2, w - 10, h * 0.35, { tl: 8, tr: 8, bl: 0, br: 0 });

        // Cargo area — even darker
        const cargoY = -h / 2 + h * 0.38;
        const cargoH = h * 0.50;
        mg.fillStyle(0x1E1E30, 0.8);
        mg.fillRect(-w / 2 + 8, cargoY, w - 16, cargoH);
        mg.lineStyle(1.5, 0x555580, 0.5);
        mg.strokeRect(-w / 2 + 8, cargoY, w - 16, cargoH);

        // Wheels
        const wheelR = 5;
        const wx = w / 2 - 8;
        const wy = h / 2 - 4;
        mg.fillStyle(0x222222, 1);
        mg.fillCircle(-wx, -wy, wheelR);
        mg.fillCircle(wx, -wy, wheelR);
        mg.fillCircle(-wx, wy, wheelR);
        mg.fillCircle(wx, wy, wheelR);
        mg.fillStyle(0x333344, 1);
        mg.fillCircle(-wx, -wy, wheelR - 2);
        mg.fillCircle(wx, -wy, wheelR - 2);
        mg.fillCircle(-wx, wy, wheelR - 2);
        mg.fillCircle(wx, wy, wheelR - 2);

        // Shine
        mg.fillStyle(0xFFFFFF, 0.08);
        mg.fillRoundedRect(-w / 2 + 5, -h / 2 + 3, w - 10, h * 0.2, 5);

        this.container.add(mg);
        this._mysteryGraphics = mg;

        // "?" text — big, centred in cargo area
        const qText = scene.add.text(0, cargoY + cargoH / 2 - 2, '?', {
            fontFamily: 'Outfit, Arial Black, sans-serif',
            fontSize: '28px',
            fontStyle: '900',
            color: '#FFFFFF',
            stroke: '#7B6CF6',
            strokeThickness: 6,
            align: 'center',
        }).setOrigin(0.5);

        // Idle pulse on the "?"
        scene.tweens.add({
            targets: qText,
            alpha: { from: 0.7, to: 1 },
            scaleX: { from: 0.9, to: 1.05 },
            scaleY: { from: 0.9, to: 1.05 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.container.add(qText);
        this._mysteryText = qText;
    }

    // Apply or remove mystery visual state without animation
    _applyMysteryState() {
        const isMystery = this.hidden && !this.isRevealed;
        const isNormal = !isMystery;

        // Show/hide normal car visuals
        for (const obj of this._normalGroup) {
            if (obj && obj.setVisible) {
                obj.setVisible(isNormal);
            }
        }

        // Show/hide mystery overlay
        if (this._mysteryGraphics) this._mysteryGraphics.setVisible(isMystery);
        if (this._mysteryText) this._mysteryText.setVisible(isMystery);
    }

    // ────────────────────────────────────────────────────────
    // Reveal animation: mystery → normal car
    // ────────────────────────────────────────────────────────
    reveal() {
        if (this.isRevealed) return Promise.resolve();

        return new Promise(resolve => {
            this.isRevealed = true;

            const scene = this.scene;
            const cx = this.container.x;
            const cy = this.container.y;

            // Particle burst (stars)
            const particles = scene.add.particles(cx, cy, 'particle_star', {
                speed: { min: 60, max: 160 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.9, end: 0 },
                lifespan: 550,
                quantity: 14,
                gravityY: 100,
                tint: [0xFFE66D, 0xFFFFFF, 0x7B6CF6],
            });
            particles.setDepth(60);
            scene.time.delayedCall(650, () => {
                if (particles && particles.destroy) particles.destroy();
            });

            // Complete any pending slideForward promise so onCarFull can show peekCar
            this._completeSlide();

            // Snap to active row and kill remaining tweens
            scene.tweens.killTweensOf(this.container);
            this.container.setY(CONFIG.CAR_ROW1_Y);
            this.container.setAlpha(1);

            const origScaleX = this.container.scaleX;
            const origScaleY = this.container.scaleY;

            // Flash: scale up slightly while swapping visuals
            scene.tweens.add({
                targets: this.container,
                scaleX: origScaleX * 1.18,
                scaleY: origScaleY * 1.18,
                duration: 100,
                ease: 'Power2',
                onComplete: () => {
                    // Swap visuals mid-animation
                    this._applyMysteryState(); // isRevealed=true now, shows normal

                    scene.tweens.add({
                        targets: this.container,
                        scaleX: origScaleX,
                        scaleY: origScaleY,
                        duration: 220,
                        ease: 'Back.easeOut',
                        onComplete: () => resolve(),
                    });
                },
            });

            // Camera micro-shake
            if (scene.cameras && scene.cameras.main) {
                scene.cameras.main.shake(80, 0.004);
            }
        });
    }

    updateFillVisual() {
        if (!this.fillBar) return;

        const pct = this.capacity > 0
            ? Phaser.Math.Clamp(this.filledCount / this.capacity, 0, 1)
            : 0;

        const colorData = COLORS[this.color];

        this.fillBar.clear();
        this.updateCapacityText();

        if (pct <= 0) return;

        const fillH = Math.max(2, this._barMaxH * pct);
        const fillY = this._cargoY + 1 + (this._barMaxH - fillH);

        this.fillBar.fillStyle(colorData.hex, 1);
        this.fillBar.fillRoundedRect(this._barX, fillY, this._barW, fillH, 3);

        // Shine
        this.fillBar.fillStyle(0xFFFFFF, 0.2);
        this.fillBar.fillRoundedRect(this._barX, fillY, this._barW, Math.min(4, fillH / 2), 2);
    }

    updateCapacityText() {
        if (!this.capacityText) return;

        const safeCapacity = Math.max(0, this.capacity || 0);
        const safeFilled = safeCapacity > 0
            ? Phaser.Math.Clamp(this.filledCount, 0, safeCapacity)
            : Math.max(0, this.filledCount || 0);

        const label = `${safeFilled}/${safeCapacity}`;

        this.capacityText.setText(label);

        if (this.capacityTextShadow) {
            this.capacityTextShadow.setText(label);
        }

        // Full car gets a yellow capacity label.
        if (safeCapacity > 0 && safeFilled >= safeCapacity) {
            this.capacityText.setColor('#FFE66D');
        } else {
            this.capacityText.setColor('#FFFFFF');
        }
    }

    addCube() {
        if (this.reservedCount > 0) {
            this.reservedCount--;
        }

        if (this.isFull()) return true;

        this.filledCount++;
        this.updateFillVisual();

        // Text pop effect when a cube enters the car.
        if (this.capacityText) {
            this.scene.tweens.killTweensOf(this.capacityText);
            this.capacityText.setScale(1.18);
            this.scene.tweens.add({
                targets: this.capacityText,
                scaleX: 1,
                scaleY: 1,
                duration: 120,
                ease: 'Back.easeOut',
            });
        }

        // Car pop effect
        this.scene.tweens.add({
            targets: this.container,
            scaleX: this.isActive ? 1.05 : CONFIG.CAR_ROW2_SCALE * 1.05,
            scaleY: this.isActive ? 1.05 : CONFIG.CAR_ROW2_SCALE * 1.05,
            duration: 60,
            yoyo: true,
            ease: 'Power2',
        });

        return this.isFull();
    }

    getAbsorbPosition() {
        return {
            x: this.container.x,
            y: this.container.y,
        };
    }

    isFull() {
        return this.filledCount >= this.capacity;
    }

    canAccept(cubeColor) {
        return this.color === cubeColor
            && (this.filledCount + this.reservedCount) < this.capacity
            && !this.isExiting;
    }

    reserveCube(cubeColor) {
        if (this.canAccept(cubeColor)) {
            this.reservedCount++;
            return true;
        }

        return false;
    }

    setActive(active) {
        this.isActive = active;

        if (active) {
            this.container.setScale(1);
            this.container.setAlpha(1);
        } else {
            this.container.setScale(CONFIG.CAR_ROW2_SCALE);
            this.container.setAlpha(CONFIG.CAR_ROW2_ALPHA);
        }
    }

    exitAnimation() {
        return new Promise(resolve => {
            this.isExiting = true;

            // Sparkle particles
            const particles = this.scene.add.particles(
                this.container.x,
                this.container.y,
                'particle_star',
                {
                    speed: { min: 80, max: 180 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 0.8, end: 0 },
                    lifespan: 500,
                    quantity: 12,
                    gravityY: 150,
                }
            );

            particles.setDepth(50);
            this.scene.time.delayedCall(600, () => particles.destroy());

            // Bounce
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 120,
                yoyo: true,
                ease: 'Power2',
                onComplete: () => {
                    // Drive off right
                    this.scene.tweens.add({
                        targets: this.container,
                        x: CONFIG.GAME_WIDTH + 100,
                        duration: CONFIG.CAR_EXIT_DURATION,
                        ease: 'Back.easeIn',
                        onComplete: () => {
                            this.container.setVisible(false);
                            resolve();
                        },
                    });
                },
            });
        });
    }

    slideForward(targetX, targetY) {
        return new Promise(resolve => {
            this._pendingSlideResolve = resolve;

            this.container.setPosition(targetX, CONFIG.CAR_ROW2_Y);
            this.container.setScale(CONFIG.CAR_ROW2_SCALE);
            this.container.setAlpha(CONFIG.CAR_ROW2_ALPHA);

            this.scene.tweens.add({
                targets: this.container,
                x: targetX,
                y: CONFIG.CAR_ROW1_Y,
                scaleX: 1,
                scaleY: 1,
                alpha: 1,
                duration: CONFIG.CAR_ADVANCE_DURATION,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.isActive = true;
                    this._pendingSlideResolve = null;
                    resolve();
                },
            });
        });
    }

    _completeSlide() {
        if (this._pendingSlideResolve) {
            const done = this._pendingSlideResolve;
            this._pendingSlideResolve = null;
            this.isActive = true;
            done();
        }
    }

    setPosition(x, y) {
        if (this.container) {
            this.container.setPosition(x, y);
        }

        this.x = x;
        this.y = y;
    }

    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
};



// ============================================================
// CarManager — 3 car columns with queues
// ============================================================

window.CarManager = class CarManager {
    constructor(scene, carsData) {
        this.scene = scene;

        this.columns = [
            { active: null, queue: [] },
            { active: null, queue: [] },
            { active: null, queue: [] },
        ];

        this.layoutVersion = 0;
        this.isShuffling = false;
        this.isResolvingPaintGun = false;

        this.createCars(carsData);
    }

    createCars(carsData) {
        const byColumn = this.columns.map(() => []);

        carsData.forEach((carData, index) => {
            const col = this.columns[carData.column];
            if (!col) return;

            byColumn[carData.column].push({
                ...carData,
                _sourceIndex: index,
            });
        });

        byColumn.forEach((columnCars, columnIndex) => {
            columnCars.sort((a, b) => {
                if (a.queueOrder !== b.queueOrder) return a.queueOrder - b.queueOrder;
                return a._sourceIndex - b._sourceIndex;
            });

            columnCars.forEach((carData, queueIndex) => {
                const car = new Car(this.scene, carData);
                const col = this.columns[columnIndex];

                car.column = columnIndex;

                if (queueIndex === 0) {
                    col.active = car;
                    car.setActive(true);
                    car.setPosition(CONFIG.CAR_COL_POSITIONS[columnIndex], CONFIG.CAR_ROW1_Y);
                    car.container.setVisible(true);
                    car.container.setAlpha(1);
                } else {
                    col.queue.push(car);
                    car.setActive(false);
                    car.setPosition(CONFIG.CAR_COL_POSITIONS[columnIndex], CONFIG.CAR_ROW2_Y);

                    const visible = queueIndex === 1;
                    car.container.setVisible(visible);
                    car.container.setAlpha(visible ? 1 : 0);
                }
            });
        });
    }

    getActiveCars() {
        return this.columns
            .map(col => col.active)
            .filter(car => car && !car.isExiting);
    }

    getActiveCarColors() {
        const colors = new Set();

        for (const car of this.getActiveCars()) {
            if (car.canAccept(car.color)) {
                colors.add(car.color);
            }
        }

        return colors;
    }

    findMatchingActiveCar(cubeColor, preferredColumn) {
        if (preferredColumn !== undefined) {
            const col = this.columns[preferredColumn];

            if (col && col.active && col.active.canAccept(cubeColor)) {
                return col.active;
            }
        }

        for (const col of this.columns) {
            if (col.active && col.active.canAccept(cubeColor)) {
                return col.active;
            }
        }

        return null;
    }

    async onCarFull(car) {
        if (!car || car.isExiting) return;

        const colIdx = car.column;
        const col = this.columns[colIdx];

        if (!col) return;

        window.SoundMgr?.carFull();
        await car.exitAnimation();
        window.SoundMgr?.carExit();

        col.active = null;

        if (col.queue.length > 0) {
            const nextCar = col.queue.shift();

            col.active = nextCar;
            nextCar.column = colIdx;

            const targetX = CONFIG.CAR_COL_POSITIONS[colIdx];

            nextCar.container.setVisible(true);
            nextCar.container.setAlpha(1);
            nextCar.setActive(true);

            // Reveal hidden car before/during slide into active row
            if (nextCar.hidden && !nextCar.isRevealed) {
                // Start reveal mid-slide for a dramatic effect
                const slidePromise = nextCar.slideForward(targetX, CONFIG.CAR_ROW1_Y);
                // Trigger reveal partway through the slide
                this.scene.time.delayedCall(CONFIG.CAR_ADVANCE_DURATION * 0.45, () => {
                    nextCar.reveal();
                });
                await slidePromise;
            } else {
                await nextCar.slideForward(targetX, CONFIG.CAR_ROW1_Y);
            }

            if (col.queue.length > 0) {
                const peekCar = col.queue[0];

                peekCar.container.setVisible(true);
                peekCar.container.setAlpha(1);
                peekCar.setPosition(CONFIG.CAR_COL_POSITIONS[colIdx], CONFIG.CAR_ROW2_Y);
                peekCar.setActive(false);
            }
        }
    }

    allCarsComplete() {
        for (const col of this.columns) {
            if (col.active) return false;
            if (col.queue.length > 0) return false;
        }

        return true;
    }

    hasTransitioningCars() {
        if (this.isShuffling) return true;
        if (this.isResolvingPaintGun) return true;

        for (const col of this.columns) {
            if (col.active && col.active.isExiting) return true;

            for (const car of col.queue) {
                if (car.isExiting) return true;
            }
        }

        return false;
    }

    hasReservedActiveCubes() {
        for (const car of this.getActiveCars()) {
            if ((car.reservedCount || 0) > 0) return true;
        }

        return false;
    }

    canMatchAnyColor(colorSet) {
        for (const color of colorSet) {
            if (this.findMatchingActiveCar(color) !== null) {
                return true;
            }
        }

        return false;
    }

    // Check if ANY car — active or still in queue — will ever accept one of these colors.
    // Used for board-level deadlock detection before cubes even reach the conveyor.
    canAnyCarEverAccept(colorSet) {
        for (const color of colorSet) {
            for (const col of this.columns) {
                if (col.active && col.active.canAccept(color)) return true;

                for (const car of col.queue) {
                    if (car.canAccept(color)) return true;
                }
            }
        }

        return false;
    }

    // ----------------------------------------------------------
    // Shuffle Booster
    // ----------------------------------------------------------

    shuffleForPullableBlocks(pullableBlocks) {
        if (this.isShuffling || this.isResolvingPaintGun) {
            return false;
        }

        if (!Array.isArray(pullableBlocks) || pullableBlocks.length === 0) {
            return false;
        }

        const allCars = this.collectAllRemainingCars();

        if (allCars.length < 2) return false;

        for (const car of allCars) {
            if ((car.reservedCount || 0) > 0) {
                return false;
            }

            if (car.isExiting) {
                return false;
            }
        }

        const oldSignature = this.getCarOrderSignature();

        const FRONT_LAYER_INDEX = 0;

        const layer1PullableBlocks = pullableBlocks.filter(block => {
            return block &&
                block.state === 'pullable' &&
                block.layer === FRONT_LAYER_INDEX;
        });

        const priorityColors = this.pickPriorityColorsFromLayer1(layer1PullableBlocks, 3);
        const finalCars = this.buildShuffleCarOrder(allCars, priorityColors);

        this.redistributeCarsToColumns(finalCars);

        const newSignature = this.getCarOrderSignature();

        if (oldSignature === newSignature) {
            return false;
        }

        this.animateCarLayout();

        return true;
    }

    pickPriorityColorsFromLayer1(layer1PullableBlocks, maxColors = 3) {
        if (!Array.isArray(layer1PullableBlocks) || layer1PullableBlocks.length === 0) {
            return [];
        }

        const shuffledBlocks = this.shuffleArray([...layer1PullableBlocks]);
        const result = [];
        const usedColors = new Set();

        for (const block of shuffledBlocks) {
            if (!block || !block.color) continue;
            if (usedColors.has(block.color)) continue;

            usedColors.add(block.color);
            result.push(block.color);

            if (result.length >= maxColors) break;
        }

        return result;
    }

    buildShuffleCarOrder(allCars, priorityColors) {
        const remainingCars = [...allCars];
        const frontCars = [];

        for (const color of priorityColors) {
            const index = remainingCars.findIndex(car => car.color === color);

            if (index === -1) continue;

            const [car] = remainingCars.splice(index, 1);
            frontCars.push(car);

            if (frontCars.length >= this.columns.length) break;
        }

        const randomCars = this.shuffleArray(remainingCars);

        while (frontCars.length < this.columns.length && randomCars.length > 0) {
            frontCars.push(randomCars.shift());
        }

        return [...frontCars, ...randomCars];
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Phaser.Math.Between(0, i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    }

    collectAllRemainingCars() {
        const cars = [];

        for (const col of this.columns) {
            if (col.active) {
                cars.push(col.active);
            }

            for (const car of col.queue) {
                cars.push(car);
            }
        }

        return cars;
    }

    redistributeCarsToColumns(finalCars) {
        for (const col of this.columns) {
            col.active = null;
            col.queue = [];
        }

        for (let i = 0; i < finalCars.length; i++) {
            const car = finalCars[i];
            const columnIndex = i % this.columns.length;
            const rowIndex = Math.floor(i / this.columns.length);
            const col = this.columns[columnIndex];

            car.column = columnIndex;

            if (rowIndex === 0) {
                col.active = car;
                car.setActive(true);
            } else {
                col.queue.push(car);
                car.setActive(false);
            }
        }

        this.applyCarVisibilityImmediately();
    }

    applyCarVisibilityImmediately() {
        for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
            const col = this.columns[columnIndex];

            if (col.active) {
                const car = col.active;

                car.column = columnIndex;
                car.setActive(true);
                car.container.setVisible(true);
                car.container.setAlpha(1);
                car.container.setScale(1);
                car.container.setDepth(20);

                // Reveal hidden car that has been shuffled/advanced to active slot
                if (car.hidden && !car.isRevealed) {
                    car.reveal();
                }
            }

            for (let queueIndex = 0; queueIndex < col.queue.length; queueIndex++) {
                const car = col.queue[queueIndex];
                const visible = queueIndex === 0;

                car.column = columnIndex;
                car.setActive(false);
                car.container.setVisible(visible);
                car.container.setAlpha(visible ? 1 : 0);
                car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
                car.container.setDepth(18);
            }
        }
    }

    animateCarLayout() {
        this.layoutVersion++;
        const version = this.layoutVersion;

        this.isShuffling = true;

        let pendingTweens = 0;

        const finishTween = () => {
            pendingTweens--;

            if (pendingTweens <= 0 && this.layoutVersion === version) {
                this.isShuffling = false;
                this.applyCarVisibilityImmediately();
            }
        };

        const addTween = (car, tweenConfig) => {
            if (!car || !car.container || !car.container.scene) return;

            pendingTweens++;

            this.scene.tweens.killTweensOf(car.container);

            this.scene.tweens.add({
                ...tweenConfig,
                targets: car.container,
                onComplete: () => {
                    if (this.layoutVersion !== version) return;

                    if (typeof tweenConfig._safeComplete === 'function') {
                        tweenConfig._safeComplete();
                    }

                    finishTween();
                },
            });
        };

        for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
            const col = this.columns[columnIndex];
            const x = CONFIG.CAR_COL_POSITIONS[columnIndex];

            if (col.active) {
                const car = col.active;

                car.column = columnIndex;
                car.setActive(true);
                car.container.setVisible(true);
                car.container.setAlpha(1);
                car.container.setDepth(20);

                addTween(car, {
                    x,
                    y: CONFIG.CAR_ROW1_Y,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    alpha: 1,
                    duration: 160,
                    ease: 'Quad.easeOut',
                    _safeComplete: () => {
                        if (this.isCarCurrentActive(car)) {
                            car.container.setVisible(true);
                            car.container.setAlpha(1);

                            this.scene.tweens.add({
                                targets: car.container,
                                scaleX: 1,
                                scaleY: 1,
                                duration: 160,
                                ease: 'Back.easeOut',
                            });
                        }
                    },
                });
            }

            for (let queueIndex = 0; queueIndex < col.queue.length; queueIndex++) {
                const car = col.queue[queueIndex];
                const visible = queueIndex === 0;

                car.column = columnIndex;
                car.setActive(false);
                car.container.setVisible(true);
                car.container.setDepth(18);

                addTween(car, {
                    x,
                    y: CONFIG.CAR_ROW2_Y,
                    scaleX: CONFIG.CAR_ROW2_SCALE || 0.82,
                    scaleY: CONFIG.CAR_ROW2_SCALE || 0.82,
                    alpha: visible ? 1 : 0,
                    duration: 240,
                    ease: 'Back.easeOut',
                    _safeComplete: () => {
                        if (this.layoutVersion !== version) return;

                        if (this.isCarCurrentActive(car)) {
                            car.container.setVisible(true);
                            car.container.setAlpha(1);
                            car.container.setScale(1);
                            return;
                        }

                        if (this.isCarCurrentQueue(car, columnIndex, queueIndex)) {
                            car.container.setVisible(visible);
                            car.container.setAlpha(visible ? 1 : 0);
                            car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
                        }
                    },
                });
            }
        }

        if (pendingTweens === 0) {
            this.isShuffling = false;
            this.applyCarVisibilityImmediately();
        }

        this.scene.time.delayedCall(420, () => {
            if (this.layoutVersion !== version) return;

            this.isShuffling = false;
            this.applyCarVisibilityImmediately();
        });
    }

    isCarCurrentActive(car) {
        for (const col of this.columns) {
            if (col.active === car) return true;
        }

        return false;
    }

    isCarCurrentQueue(car, columnIndex, queueIndex) {
        const col = this.columns[columnIndex];
        if (!col) return false;

        return col.queue[queueIndex] === car;
    }

    getCarOrderSignature() {
        const parts = [];

        for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
            const col = this.columns[columnIndex];

            const activeId = col.active ? col.active.id : 'none';
            parts.push(`C${columnIndex}:A:${activeId}`);

            for (let i = 0; i < col.queue.length; i++) {
                parts.push(`C${columnIndex}:Q${i}:${col.queue[i].id}`);
            }
        }

        return parts.join('|');
    }

    // ----------------------------------------------------------
    // Paint Gun Direct Burst Fill
    // ----------------------------------------------------------

    getPaintGunCandidateCars(color) {
        const cars = [];

        // 1. Active row first.
        for (const col of this.columns) {
            if (this.canPaintGunFillCar(col.active, color)) {
                cars.push(col.active);
            }
        }

        // 2. Queue[0] visible row.
        for (const col of this.columns) {
            const car = col.queue[0];

            if (this.canPaintGunFillCar(car, color)) {
                cars.push(car);
            }
        }

        // 3. Deeper queue cars.
        for (const col of this.columns) {
            for (let i = 1; i < col.queue.length; i++) {
                const car = col.queue[i];

                if (this.canPaintGunFillCar(car, color)) {
                    cars.push(car);
                }
            }
        }

        return cars;
    }

    getPaintGunAvailableCapacity(color) {
        let total = 0;

        for (const car of this.getPaintGunCandidateCars(color)) {
            total += Math.max(0, car.capacity - car.filledCount);
        }

        return total;
    }

    canPaintGunFillCar(car, color) {
        if (!car) return false;
        if (car.color !== color) return false;
        if (car.isExiting) return false;
        if (car.filledCount >= car.capacity) return false;

        return true;
    }

    /**
     * Allocate cubes across all same-color cars.
     *
     * This allows active and non-active cars to fill together.
     * The distribution is round-robin so the visual looks like many cars
     * receiving cubes at the same time.
     */
    allocatePaintGunCubes(color, cubeCount) {
        const candidates = this.getPaintGunCandidateCars(color);

        if (candidates.length === 0 || cubeCount <= 0) return [];

        const allocationMap = new Map();

        for (const car of candidates) {
            allocationMap.set(car, 0);
        }

        let remaining = cubeCount;

        while (remaining > 0) {
            let addedThisRound = false;

            for (const car of candidates) {
                if (remaining <= 0) break;

                const alreadyAllocated = allocationMap.get(car) || 0;
                const free = car.capacity - car.filledCount - alreadyAllocated;

                if (free <= 0) continue;

                allocationMap.set(car, alreadyAllocated + 1);
                remaining--;
                addedThisRound = true;
            }

            if (!addedThisRound) break;
        }

        return candidates
            .map(car => ({
                car,
                amount: allocationMap.get(car) || 0,
            }))
            .filter(item => item.amount > 0);
    }

    prepareCarForPaintGunFill(car) {
        if (!car || !car.container) return;

        const location = this.getCarLocation(car);

        if (!location) return;

        if (location.type === 'active') {
            car.container.setVisible(true);
            car.container.setAlpha(1);
            car.container.setScale(1);
            car.container.setDepth(24);
            return;
        }

        if (location.type === 'queue') {
            const x = CONFIG.CAR_COL_POSITIONS[location.column];
            const y = CONFIG.CAR_ROW2_Y;

            car.setActive(false);
            car.setPosition(x, y);
            car.container.setVisible(true);

            // Deep-queue cars are temporarily shown so the player sees cubes flying in.
            car.container.setAlpha(CONFIG.CAR_ROW2_ALPHA || 0.72);
            car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
            car.container.setDepth(22);

            // Reveal hidden car immediately when Paint Gun is going to fill it
            if (car.hidden && !car.isRevealed) {
                car.reveal();
            }
        }
    }

    async resolvePaintGunFullCars(color) {
        this.isResolvingPaintGun = true;

        // Refresh fill visuals to make sure they're up to date.
        for (const car of this.getPaintGunCandidateCars(color)) {
            if (car.updateFillVisual) {
                car.updateFillVisual();
            }
        }

        // Process one at a time to prevent queue/active advancing simultaneously — fill already happened simultaneously.
        let loopGuard = 0;

        while (loopGuard < 50) {
            loopGuard++;

            const fullCar = this.findNextFullPaintGunCar(color);

            if (!fullCar) break;

            await this.handlePaintGunFilledCarFull(fullCar);
            await this.delay(80);
        }

        this.refreshQueueVisibility();
        this.isResolvingPaintGun = false;
    }

    findNextFullPaintGunCar(color) {
        // Active cars exit first so the queue advances correctly.
        for (const col of this.columns) {
            const car = col.active;

            if (car &&
                car.color === color &&
                !car.isExiting &&
                car.filledCount >= car.capacity) {
                return car;
            }
        }

        // Then handle full queue cars.
        for (const col of this.columns) {
            for (const car of col.queue) {
                if (car &&
                    car.color === color &&
                    !car.isExiting &&
                    car.filledCount >= car.capacity) {
                    return car;
                }
            }
        }

        return null;
    }

    async handlePaintGunFilledCarFull(car) {
        if (!car || car.isExiting) return;

        const location = this.getCarLocation(car);

        if (!location) return;

        if (location.type === 'active') {
            await this.onCarFull(car);
            this.refreshQueueVisibility();
            return;
        }

        if (location.type === 'queue') {
            const col = this.columns[location.column];

            if (!col) return;

            const idx = col.queue.indexOf(car);

            if (idx !== -1) {
                col.queue.splice(idx, 1);
            }

            car.setActive(false);

            if (car.container) {
                car.container.setVisible(true);
                car.container.setAlpha(CONFIG.CAR_ROW2_ALPHA || 0.72);
                car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
                car.container.setDepth(22);
            }

            await car.exitAnimation();

            this.refreshQueueVisibility();
        }
    }

    getCarLocation(car) {
        for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
            const col = this.columns[columnIndex];

            if (col.active === car) {
                return {
                    type: 'active',
                    column: columnIndex,
                    queueIndex: -1,
                };
            }

            const queueIndex = col.queue.indexOf(car);

            if (queueIndex !== -1) {
                return {
                    type: 'queue',
                    column: columnIndex,
                    queueIndex,
                };
            }
        }

        return null;
    }

    refreshQueueVisibility() {
        for (let columnIndex = 0; columnIndex < this.columns.length; columnIndex++) {
            const col = this.columns[columnIndex];
            const x = CONFIG.CAR_COL_POSITIONS[columnIndex];

            if (col.active && col.active.container && !col.active.isExiting) {
                col.active.column = columnIndex;
                col.active.setActive(true);
                col.active.container.setVisible(true);
                col.active.container.setAlpha(1);
                col.active.container.setScale(1);
                col.active.container.setDepth(20);
                col.active.setPosition(x, CONFIG.CAR_ROW1_Y);
            }

            for (let queueIndex = 0; queueIndex < col.queue.length; queueIndex++) {
                const car = col.queue[queueIndex];
                const visible = queueIndex === 0;

                car.column = columnIndex;
                car.setActive(false);
                car.setPosition(x, CONFIG.CAR_ROW2_Y);

                if (car.container && !car.isExiting) {
                    car.container.setVisible(visible);
                    car.container.setAlpha(visible ? (CONFIG.CAR_ROW2_ALPHA || 0.72) : 0);
                    car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
                    car.container.setDepth(18);
                }
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => {
            this.scene.time.delayedCall(ms, resolve);
        });
    }

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------

    destroy() {
        this.layoutVersion++;
        this.isShuffling = false;
        this.isResolvingPaintGun = false;

        for (const col of this.columns) {
            if (col.active) {
                col.active.destroy();
            }

            for (const car of col.queue) {
                car.destroy();
            }
        }
    }
};



// ============================================================
// Road — Horizontal road between conveyor and cars
// ============================================================

window.Road = class Road {
    constructor(scene) {
        this.scene = scene;
        this.graphics = null;
        this.draw();
    }

    draw() {
        const g = this.scene.add.graphics();
        this.graphics = g;
        g.setDepth(4);

        const y = CONFIG.ROAD_Y;
        const h = CONFIG.ROAD_HEIGHT;
        const w = CONFIG.GAME_WIDTH;

        // Road surface
        g.fillStyle(THEME.ROAD_SURFACE, 1);
        g.fillRect(0, y, w, h);

        // Edge lines
        g.lineStyle(1.5, THEME.ROAD_EDGE, 0.6);
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(w, y);
        g.strokePath();
        g.beginPath();
        g.moveTo(0, y + h);
        g.lineTo(w, y + h);
        g.strokePath();

        // Dashed center line
        const dashLen = 18;
        const gapLen = 12;
        const dashY = y + h / 2 - 1;
        g.fillStyle(THEME.ROAD_DASH, 0.8);
        for (let x = 5; x < w; x += dashLen + gapLen) {
            g.fillRect(x, dashY, dashLen, 2.5);
        }

        // Exit label
        const exitText = this.scene.add.text(8, y + h / 2, 'Exit', {
            fontFamily: 'Outfit',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            resolution: 2,
        }).setOrigin(0, 0.5).setDepth(5);

        // Arrow
        const arrow = this.scene.add.text(35, y + h / 2, '→', {
            fontFamily: 'Outfit',
            fontSize: '12px',
            color: '#FFFFFF',
            resolution: 2,
        }).setOrigin(0, 0.5).setDepth(5).setAlpha(0.6);

        this._exitText = exitText;
        this._arrow = arrow;
    }

    destroy() {
        if (this.graphics) this.graphics.destroy();
        if (this._exitText) this._exitText.destroy();
        if (this._arrow) this._arrow.destroy();
    }
};




// ============================================================
// PlayerHearts — persistent Life/Heart balance + timed regen
// Global singleton: window.PlayerHearts
// ============================================================

window.PlayerHearts = {
    MAX: 5,
    REGEN_MS: 30 * 60 * 1000, // 1 Heart every 30 minutes

    get() {
        try {
            const v = parseInt(localStorage.getItem('bbf_hearts'), 10);
            return isNaN(v) ? this.MAX : Math.max(0, Math.min(this.MAX, v));
        } catch { return this.MAX; }
    },

    _set(n) {
        try { localStorage.setItem('bbf_hearts', String(Math.max(0, Math.min(this.MAX, n)))); } catch {}
    },

    getRefillAt() {
        try {
            const v = parseInt(localStorage.getItem('bbf_heartRefillAt'), 10);
            return isNaN(v) ? null : v;
        } catch { return null; }
    },

    _setRefillAt(ts) {
        try {
            if (ts === null) localStorage.removeItem('bbf_heartRefillAt');
            else localStorage.setItem('bbf_heartRefillAt', String(ts));
        } catch {}
    },

    /** Deduct `n` Hearts (on Lose / Quit Level); starts the regen timer if not already running. */
    spend(n = 1) {
        const next = Math.max(0, this.get() - n);
        this._set(next);
        if (next < this.MAX && this.getRefillAt() === null) {
            this._setRefillAt(Date.now() + this.REGEN_MS);
        }
        return next;
    },

    /** Grant `n` Hearts (RV / Coin refill). */
    add(n = 1) {
        const next = Math.min(this.MAX, this.get() + n);
        this._set(next);
        if (next >= this.MAX) this._setRefillAt(null);
        return next;
    },

    refillFull() {
        this._set(this.MAX);
        this._setRefillAt(null);
    },

    /** Catch up on any regen that elapsed while the game was closed. Call on Home load. */
    tickRegen() {
        let cur = this.get();
        if (cur >= this.MAX) { this._setRefillAt(null); return cur; }

        let refillAt = this.getRefillAt();
        if (refillAt === null) { this._setRefillAt(Date.now() + this.REGEN_MS); return cur; }

        const now = Date.now();
        while (refillAt !== null && now >= refillAt && cur < this.MAX) {
            cur++;
            refillAt = cur < this.MAX ? refillAt + this.REGEN_MS : null;
        }
        this._set(cur);
        this._setRefillAt(cur < this.MAX ? refillAt : null);
        return cur;
    },

    /** Milliseconds until the next Heart regenerates (0 if already full or unscheduled). */
    msUntilNext() {
        const refillAt = this.getRefillAt();
        if (refillAt === null) return 0;
        return Math.max(0, refillAt - Date.now());
    },
};




// ============================================================
// SoundManager — Procedural audio via Web Audio API (no files)
// Global singleton: window.SoundMgr
// ============================================================

window.SoundManager = class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;

        this._muted = false;
        this._musicPlaying = false;
        this._musicTrack = 'game'; // 'home' | 'game'
        this._musicTimer = null;
        this._musicStep = 0;
        this._nextNoteTime = 0;
        this._lastAbsorbTime = 0;
        this._lastWarnTime = 0;
        this._lastCollideTime = 0;

        // Load saved preferences (volumes: 0.0–1.0 float; 0.5 = old default = 50% of max range)
        try { this._muted = localStorage.getItem('bbf_muted') === '1'; } catch {}
        try { const sv = parseFloat(localStorage.getItem('bbf_sfxvol3'));   this._sfxVol   = isNaN(sv) ? 0.5 : Math.max(0, Math.min(1, sv)); } catch { this._sfxVol   = 0.5; }
        try { const mv = parseFloat(localStorage.getItem('bbf_musicvol3')); this._musicVol = isNaN(mv) ? 0.7 : Math.max(0, Math.min(1, mv)); } catch { this._musicVol = 0.7; }

        this._init();
    }

    _init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Master
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this._muted ? 0 : 0.85;
            this.masterGain.connect(this.ctx.destination);
            // SFX bus
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = (this._sfxVol ?? 0.5) * 4.0;   // 0→0  0.5→2.0  1→4.0
            this.sfxGain.connect(this.masterGain);
            // Music bus
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = (this._musicVol ?? 0.7) * 1.32; // 0→0  0.5→0.66  1→1.32
            this.musicGain.connect(this.masterGain);

            // Browser autoplay policy: AudioContext starts suspended.
            // Must resume from a synchronous DOM event handler — Phaser's
            // input system runs inside requestAnimationFrame, which some
            // browsers don't accept as a valid user-gesture context.
            const _resume = () => {
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            };
            document.addEventListener('pointerdown', _resume, { passive: true });
            document.addEventListener('touchstart',  _resume, { passive: true });
            document.addEventListener('keydown',     _resume, { passive: true });
        } catch (e) {
            console.warn('[SoundManager] Web Audio not available');
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _canPlay() {
        if (!this.ctx) return false;
        if (this.ctx.state !== 'running') { this.ctx.resume(); return false; }
        return true;
    }

    get muted() { return this._muted; }

    // Volume: 0.0–1.0 float.  0.5 = "old full volume".  1.0 = 2× louder.
    get sfxVolume()   { return this._sfxVol   ?? 0.5; }
    get musicVolume() { return this._musicVol ?? 0.5; }

    setSfxVolume(v) {   // v: 0.0 – 1.0
        this._sfxVol = Math.max(0, Math.min(1, v));
        try { localStorage.setItem('bbf_sfxvol3', this._sfxVol); } catch {}
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this._sfxVol * 4.0, this.ctx.currentTime, 0.04);
        }
    }

    setMusicVolume(v) { // v: 0.0 – 1.0
        this._musicVol = Math.max(0, Math.min(1, v));
        try { localStorage.setItem('bbf_musicvol3', this._musicVol); } catch {}
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this._musicVol * 1.32, this.ctx.currentTime, 0.04);
        }
    }

    toggleMute() {
        this._muted = !this._muted;
        try { localStorage.setItem('bbf_muted', this._muted ? '1' : '0'); } catch {}
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(
                this._muted ? 0 : 0.85,
                this.ctx.currentTime, 0.06
            );
        }
        return this._muted;
    }

    // ── Low-level helpers ────────────────────────────────────────────────

    _osc(freq, gainPeak, t, dur, type = 'sine', bus = null) {
        if (!this.ctx) return;
        bus = bus || this.sfxGain;
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gainPeak, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(bus);
        osc.start(t); osc.stop(t + dur + 0.01);
    }

    _noise(t, dur, gainPeak, filterType, filterFreq, Q = 1, bus = null) {
        if (!this.ctx) return;
        bus = bus || this.sfxGain;
        const sr  = this.ctx.sampleRate;
        const len = Math.ceil(sr * dur);
        const buf = this.ctx.createBuffer(1, len, sr);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src  = this.ctx.createBufferSource();
        src.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = filterType;
        filt.frequency.value = filterFreq;
        filt.Q.value = Q;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gainPeak, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(filt); filt.connect(g); g.connect(bus);
        src.start(t); src.stop(t + dur + 0.01);
    }

    // ── SFX ─────────────────────────────────────────────────────────────

    blockTap() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // Soft pop: sine drop
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(960, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.075);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        osc.connect(g); g.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.08);
    }

    cubeBurst() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // Impact click
        this._osc(200, 0.4, t, 0.04, 'triangle');
        // Noise crunch body
        this._noise(t, 0.14, 0.45, 'bandpass', 700, 1.5);
        // High crack
        this._noise(t, 0.07, 0.25, 'highpass', 3500, 1);
    }

    cubeCollide(speed = 2) {
        if (!this._canPlay()) return;
        const now = performance.now();
        if (now - this._lastCollideTime < 38) return;
        this._lastCollideTime = now;
        const t = this.ctx.currentTime;
        const freq = 700 + Math.random() * 500;
        const gain = Math.min(0.10, 0.03 + speed * 0.012);
        this._osc(freq, gain, t, 0.038, 'sine');
    }

    cubeAbsorb(pitchRand = 0) {
        if (!this._canPlay()) return;
        const now = performance.now();
        if (now - this._lastAbsorbTime < 35) return;
        this._lastAbsorbTime = now;
        const t = this.ctx.currentTime;
        const freq = 1500 + pitchRand * 600;
        this._osc(freq, 0.09, t, 0.055, 'sine');
    }

    carFull() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // C5 - E5 - G5 ascending ding
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((f, i) => {
            this._osc(f, 0.28, t + i * 0.10, 0.38, 'sine');
            // subtle octave shimmer
            this._osc(f * 2, 0.08, t + i * 0.10, 0.2, 'sine');
        });
        this._noise(t + 0.05, 0.18, 0.10, 'bandpass', 350, 2);
    }

    carExit() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // Downward engine whoosh
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.4);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(g); g.connect(this.sfxGain);
        osc.start(t); osc.stop(t + 0.41);
        this._noise(t, 0.22, 0.12, 'lowpass', 600, 1);
    }

    conveyorWarn() {
        if (!this._canPlay()) return;
        const now = performance.now();
        if (now - this._lastWarnTime < 1800) return;
        this._lastWarnTime = now;
        const t = this.ctx.currentTime;
        this._osc(440, 0.12, t,        0.09, 'square');
        this._osc(440, 0.12, t + 0.16, 0.09, 'square');
    }

    buttonClick() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        this._osc(1100, 0.10, t, 0.045, 'sine');
    }

    boosterActivate() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        this._osc(880,  0.18, t,        0.06, 'sine');
        this._osc(1320, 0.18, t + 0.07, 0.10, 'sine');
        this._osc(1760, 0.22, t + 0.14, 0.14, 'sine');
    }

    winJingle() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // C4-E4-G4-C5-E5 ascending fanfare
        const mel = [261.63, 329.63, 392, 523.25, 659.25];
        mel.forEach((f, i) => {
            this._osc(f,     0.32, t + i * 0.13, 0.55, 'triangle');
            this._osc(f * 2, 0.10, t + i * 0.13, 0.35, 'sine');
        });
        // Shimmer noise burst at peak
        this._noise(t + 0.5, 0.3, 0.12, 'bandpass', 2000, 3);
    }

    loseSfx() {
        if (!this._canPlay()) return;
        const t = this.ctx.currentTime;
        // G4 - Eb4 - C4 - Bb3 descending with pitch slide
        const mel = [392, 311.13, 261.63, 233.08];
        mel.forEach((f, i) => {
            const ts = t + i * 0.22;
            const osc = this.ctx.createOscillator();
            const g   = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, ts);
            osc.frequency.exponentialRampToValueAtTime(f * 0.88, ts + 0.2);
            g.gain.setValueAtTime(0, ts);
            g.gain.linearRampToValueAtTime(0.22, ts + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, ts + 0.42);
            osc.connect(g); g.connect(this.sfxGain);
            osc.start(ts); osc.stop(ts + 0.43);
        });
    }

    // ── Background Music ─────────────────────────────────────────────────
    //
    // Two gentle G-major pentatonic loops, swapped by scene:
    //  'home' — slow ambient pad + sparse melody, no percussion
    //  'game' — soft marimba melody + pad + a light shaker, still calm
    //
    // Pentatonic index table (freq in Hz):
    //  0=G2  1=A2  2=B2  3=D3  4=E3
    //  5=G3  6=A3  7=B3  8=D4  9=E4
    // 10=G4 11=A4 12=B4 13=D5 14=E5
    // 15=G5 16=A5 17=B5 18=D6 19=E6

    startMusic(track = 'game') {
        if (!this.ctx) return;
        if (this._musicPlaying) {
            if (this._musicTrack !== track) {
                this._musicTrack = track;
                this._musicStep  = 0; // restart pattern cleanly on track switch
            }
            return;
        }
        if (this.ctx.state !== 'running') {
            const retry = () => {
                this.ctx.resume().then(() => this.startMusic(track));
                document.removeEventListener('pointerdown', retry);
            };
            document.addEventListener('pointerdown', retry, { once: true, passive: true });
            return;
        }
        this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0.66, this.ctx.currentTime + 2.0);
        this._musicPlaying = true;
        this._musicTrack   = track;
        this._musicStep    = 0;
        this._nextNoteTime = this.ctx.currentTime + 0.1;
        this._scheduleMusic();
    }

    stopMusic(fadeDur = 0.8) {
        this._musicPlaying = false;
        if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; }
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, fadeDur / 4);
            setTimeout(() => {
                if (this.musicGain) this.musicGain.gain.value = 0.66;
            }, fadeDur * 1000 + 200);
        }
    }

    _getMusicPatterns(track) {
        if (track === 'home') {
            return {
                bpm: 100,
                // Calm pentatonic phrase, one note per beat — audible melody, no rush
                melody: [
                    10,-1,-1,-1, 12,-1,-1,-1,  11,-1,-1,-1, 8,-1,-1,-1,
                    10,-1,-1,-1, 13,-1,-1,-1,  12,-1,-1,-1, 10,-1,-1,-1,
                ],
                // Sustained pad chords overlap note-to-note for a continuous bed (no gaps)
                chord: [
                     5,-1,-1,-1,  5,-1,-1,-1,  7,-1,-1,-1,  7,-1,-1,-1,
                     8,-1,-1,-1,  8,-1,-1,-1,  7,-1,-1,-1,  7,-1,-1,-1,
                ],
                // Soft bass root, twice per loop
                bass: [
                     0,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
                     3,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
                ],
                shaker: null, // no percussion — pure ambient
            };
        }
        // 'game' — a touch more flowing, still gentle
        return {
            bpm: 116,
            melody: [
                10,-1,12,-1, -1,-1,11,-1, 10,-1,-1,-1,  8,-1,-1,-1,
                13,-1,12,-1, -1,-1,11,-1, 10,-1,-1,-1, -1,-1,-1,-1,
            ],
            chord: [
                 5,-1,-1,-1,  7,-1,-1,-1,  8,-1,-1,-1,  7,-1,-1,-1,
                 8,-1,-1,-1,  9,-1,-1,-1,  8,-1,-1,-1,  7,-1,-1,-1,
            ],
            bass: [
                 0,-1,-1,-1, -1,-1,-1,-1,  3,-1,-1,-1, -1,-1,-1,-1,
                 4,-1,-1,-1, -1,-1,-1,-1,  0,-1,-1,-1, -1,-1,-1,-1,
            ],
            // Very soft shaker on the beat only — keeps light momentum, no drums
            shaker: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        };
    }

    _scheduleMusic() {
        if (!this._musicPlaying || !this.ctx) return;

        const LOOK_AHEAD = 0.14;
        const pat  = this._getMusicPatterns(this._musicTrack);
        const step = 60 / pat.bpm / 4; // 16th note

        const penta = [
             98.00, 110.00, 123.47, 146.83, 164.81,  // G2..E3 (0-4)
            196.00, 220.00, 246.94, 293.66, 329.63,  // G3..E4 (5-9)
            392.00, 440.00, 493.88, 587.33, 659.25,  // G4..E5 (10-14)
            783.99, 880.00, 987.77,1174.66,1318.51,  // G5..E6 (15-19)
        ];

        const { melody, chord, bass, shaker } = pat;
        const LEN = melody.length;

        while (this._nextNoteTime < this.ctx.currentTime + LOOK_AHEAD) {
            const s = this._musicStep % LEN;
            const t = this._nextNoteTime;

            // Melody — soft, gently sustained (triangle)
            if (melody[s] >= 0) {
                this._mNote(penta[melody[s]], 0.06, t, step * 1.4, 'triangle');
            }

            // Chord pad (sine, long sustain, very quiet)
            if (chord[s] >= 0) {
                this._mNote(penta[chord[s]], 0.034, t, step * 4.2, 'sine');
            }

            // Bass (sine, soft and long)
            if (bass[s] >= 0) {
                this._mNote(penta[bass[s]] * 0.5, 0.13, t, step * 3.6, 'sine');
            }

            // Light shaker — only present on the 'game' track
            if (shaker && shaker[s]) this._mHat(t);

            this._musicStep++;
            this._nextNoteTime += step;
        }

        this._musicTimer = setTimeout(() => this._scheduleMusic(), 22);
    }

    _mNote(freq, gain, t, dur, type) {
        const osc = this.ctx.createOscillator();
        const g   = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(this.musicGain);
        osc.start(t); osc.stop(t + dur + 0.01);
    }

    _mHat(t) {
        // Soft shaker tick — quieter than a real hi-hat to stay gentle
        this._mNoise(t, 0.016, 0.05, 'highpass', 7000, 1);
    }

    _mNoise(t, gain, dur, filterType, filterFreq, Q) {
        const sr  = this.ctx.sampleRate;
        const len = Math.ceil(sr * dur);
        const buf = this.ctx.createBuffer(1, len, sr);
        const d   = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src  = this.ctx.createBufferSource();
        src.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = filterType;
        filt.frequency.value = filterFreq;
        filt.Q.value = Q || 1;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(filt); filt.connect(g); g.connect(this.musicGain);
        src.start(t); src.stop(t + dur + 0.01);
    }
};

// Global singleton — available everywhere
window.SoundMgr = new SoundManager();




// ============================================================
// GameStateManager — State machine for game flow
// ============================================================

window.GameStateManager = class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.state = 'IDLE';
        this.previousState = null;
        this.isReviving = false;
        this.loseReason = null; // 'CONVEYOR_FULL' | 'CLEANUP_DEADLOCK' | 'BOARD_DEADLOCK'
    }

    setState(newState) {
        const validTransitions = {
            'IDLE': ['PLAYING'],
            'PLAYING': ['ANIMATING', 'CLEANUP', 'WIN', 'LOSE', 'PAUSED'],
            'ANIMATING': ['PLAYING', 'CLEANUP', 'WIN', 'LOSE'],
            'CLEANUP': ['WIN', 'LOSE', 'PLAYING'],
            'WIN': ['IDLE'],
            'LOSE': ['PLAYING', 'IDLE'],
            'PAUSED': ['PLAYING'],
        };

        const allowed = validTransitions[this.state];

        if (!allowed || !allowed.includes(newState)) {
            console.warn(`State transition ${this.state} → ${newState} (non-standard)`);
        }

        this.previousState = this.state;
        this.state = newState;
        this.scene.events.emit('stateChange', newState, this.previousState);
    }

    getState() {
        return this.state;
    }

    isInputLocked() {
        return this.state !== 'PLAYING';
    }

    pause() {
        if (this.state !== 'PLAYING') return false;
        this.setState('PAUSED');
        return true;
    }

    resume() {
        if (this.state !== 'PAUSED') return false;
        this.setState('PLAYING');
        return true;
    }

    /**
     * GDD Win Condition:
     * WIN only when Board is empty AND all Cars are complete.
     */
    checkWinCondition(board, carManager) {
        if (!board || !carManager) return false;
        if (!board.isEmpty()) return false;
        if (!carManager.allCarsComplete()) return false;

        this.enterWin();
        return true;
    }

    /**
     * Lose can happen during PLAYING or CLEANUP.
     */
    checkLoseCondition(conveyor, carManager, board = null, funnel = null, cubeManager = null) {
        if (this.isReviving) return false;
        if (this.state === 'WIN' || this.state === 'LOSE' || this.state === 'IDLE') return false;
        if (!conveyor || !carManager) return false;

        const flowBusy = this.isFlowBusy(funnel, cubeManager, carManager);

        // Normal lose:
        // Conveyor full + no cube can be handled by active cars.
        if (conveyor.isFull()) {
            if (flowBusy) return false;

            const cubeColors = conveyor.getCubeColors();

            if (!carManager.canMatchAnyColor(cubeColors)) {
                this.loseReason = 'CONVEYOR_FULL';
                this.enterLose();
                return true;
            }
        }

        // Cleanup deadlock:
        // Board empty, no cubes left, but cars still not cleared.
        if (this.state === 'CLEANUP' && board && board.isEmpty() && !carManager.allCarsComplete()) {
            const conveyorEmpty = conveyor.getCurrentLoad() === 0;
            const funnelEmpty = !funnel || funnel.getCubeCount() === 0;
            const noActiveCubes = !cubeManager || cubeManager.getActiveCubes().length === 0;

            if (conveyorEmpty && funnelEmpty && noActiveCubes && !flowBusy) {
                this.loseReason = 'CLEANUP_DEADLOCK';
                this.enterLose();
                return true;
            }
        }

        // Board-level deadlock (only meaningful during PLAYING, when board still has blocks).
        if (this.state === 'PLAYING' && board && !board.isEmpty() && !flowBusy) {
            const conveyorIdle = conveyor.getCurrentLoad() === 0;
            const funnelIdle = !funnel || funnel.getCubeCount() === 0;
            const noCubes = !cubeManager || cubeManager.getActiveCubes().length === 0;

            if (conveyorIdle && funnelIdle && noCubes) {
                const pullableBlocks = board.getPullableBlocks ? board.getPullableBlocks() : [];

                // No pullable blocks at all — complete deadlock, nothing to tap.
                if (pullableBlocks.length === 0) {
                    this.loseReason = 'BOARD_DEADLOCK';
                    this.enterLose();
                    return true;
                }

                // All pullable block colors have no matching car anywhere (active or queue).
                const pullableColors = new Set(pullableBlocks.map(b => b.color));

                if (!carManager.canAnyCarEverAccept(pullableColors)) {
                    this.loseReason = 'BOARD_DEADLOCK';
                    this.enterLose();
                    return true;
                }
            }
        }

        return false;
    }

    isFlowBusy(funnel = null, cubeManager = null, carManager = null) {
        if (carManager && carManager.hasTransitioningCars && carManager.hasTransitioningCars()) {
            return true;
        }

        if (!cubeManager) return false;

        return cubeManager.getActiveCubes().some(cube =>
            cube.state === 'SPAWNING' ||
            cube.state === 'PHYSICS' ||
            cube.state === 'DRAINING' ||
            cube.state === 'MATCHING' ||
            cube.state === 'REVIVING'
        );
    }

    enterCleanup(conveyor) {
        if (this.state !== 'CLEANUP') {
            this.setState('CLEANUP');
        }

        if (conveyor) {
            conveyor.setSpeedMultiplier(CONFIG.CLEANUP_SPEED_MULT);
        }
    }

    enterWin() {
        this.setState('WIN');
        window.SoundMgr?.stopMusic(0.6);
        window.SoundMgr?.winJingle();

        // Region progression: 1 Star per level, but only on its FIRST completion ever
        // (prevents farming Stars by replaying an already-cleared easy level).
        try {
            const levelData = LEVELS?.[this.scene?.currentLevel];
            const levelKey = String(levelData?.id ?? this.scene?.currentLevel ?? '');
            let completed = [];
            try {
                const parsed = JSON.parse(localStorage.getItem('bbf_completedLevels'));
                if (Array.isArray(parsed)) completed = parsed;
            } catch {}

            if (levelKey && !completed.includes(levelKey)) {
                completed.push(levelKey);
                localStorage.setItem('bbf_completedLevels', JSON.stringify(completed));

                const stars = (parseInt(localStorage.getItem('bbf_stars'), 10) || 0) + 1;
                localStorage.setItem('bbf_stars', String(stars));
                this.starAwarded = true;
            } else {
                this.starAwarded = false;
            }

            // Coin reward — granted on every win (replays included), scaled by difficulty.
            const COIN_REWARD = { Tutorial: 20, Easy: 30, Normal: 50, Hard: 80, 'Super Hard': 120 };
            this.coinAwarded = COIN_REWARD[levelData?.difficulty] ?? 30;
            const coins = (parseInt(localStorage.getItem('bbf_coins'), 10) || 0) + this.coinAwarded;
            localStorage.setItem('bbf_coins', String(coins));
        } catch {}

        this.scene.cameras.main.flash(420, 255, 255, 255, true);
        this.scene.cameras.main.shake(180, 0.008);

        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;

        const spawnBurst = (x, y, delay, tints) => {
            this.scene.time.delayedCall(delay, () => {
                if (!this.scene || !this.scene.add) return;
                const e = this.scene.add.particles(x, y, 'particle_star', {
                    speed: { min: 170, max: 460 },
                    angle: { min: 0, max: 360 },
                    scale: { start: 1.1, end: 0 },
                    lifespan: 1300,
                    quantity: 22,
                    gravityY: 250,
                    tint: tints,
                });
                e.setDepth(85);
                this.scene.time.delayedCall(400, () => { if (e && e.stop) e.stop(); });
                this.scene.time.delayedCall(2100, () => { if (e && e.destroy) e.destroy(); });
            });
        };

        spawnBurst(cx,      cy - 50,  0,   [0xFFD700, 0xFFFFFF, 0xFFAFD2]);
        spawnBurst(cx - 90, cy + 40, 190,  [0x2ECC71, 0x3498DB, 0xFFFFFF]);
        spawnBurst(cx + 90, cy + 40, 360,  [0xE74C3C, 0xF1C40F, 0x9B59B6]);
    }

    enterLose() {
        this.setState('LOSE');
        window.SoundMgr?.stopMusic(0.4);
        window.SoundMgr?.loseSfx();
        this.scene.cameras.main.flash(240, 210, 25, 25, true);
        this.scene.cameras.main.shake(340, 0.022);
        window.PlayerHearts?.spend(1);
    }

    // ----------------------------------------------------------
    // Revive
    // ----------------------------------------------------------

    /**
     * Revive logic:
     * - Does NOT destroy Blocks.
     * - Does NOT reset Board.
     * - Does NOT delete Cubes instantly.
     * - Collects every existing Cube and sends them directly into Cars,
     *   similar to Paint Gun / Booster 3.
     *
     * Accepts:
     * revive({
     *   conveyor,
     *   funnel,
     *   cubeManager,
     *   carManager,
     *   boosterManager
     * })
     */
    async revive(systems) {
        if (this.isReviving) return false;

        const conveyor = systems?.conveyor;
        const funnel = systems?.funnel;
        const cubeManager = systems?.cubeManager;
        const carManager = systems?.carManager;
        const boosterManager = systems?.boosterManager;

        if (!cubeManager || !carManager) {
            console.warn('[Revive] Missing cubeManager or carManager.');
            this.setState('PLAYING');
            return false;
        }

        this.isReviving = true;

        if (boosterManager && boosterManager.cancelTargeting) {
            boosterManager.cancelTargeting();
        }

        this.scene.cameras.main.flash(160, 120, 220, 255, true);

        // Cubes still in flight from the Conveyor may hold virtual reserved slots — reset before re-allocating.
        this.resetAllCarReservations(carManager);

        // Gather all cubes currently alive in the gameplay systems.
        const reviveCubes = this.collectAllReviveCubes({
            conveyor,
            funnel,
            cubeManager,
        });

        // Reset Conveyor/Funnel state after cubes have been extracted.
        if (conveyor) {
            if (conveyor.setSpeedMultiplier) {
                conveyor.setSpeedMultiplier(1);
            }

            if (conveyor.resetWarningVisual) {
                conveyor.resetWarningVisual();
            }
        }

        if (reviveCubes.length === 0) {
            this.setState('PLAYING');
            this.isReviving = false;
            return true;
        }

        // Send all cubes bursting into cars simultaneously.
        await this.sendReviveCubesToCarsBurst(reviveCubes, carManager, cubeManager);

        this.setState('PLAYING');

        this.scene.time.delayedCall(100, () => {
            this.isReviving = false;
        });

        return true;
    }

    /**
     * Collect cubes from:
     * - Conveyor
     * - Funnel
     * - CubeManager active cubes
     *
     * Cubes are not destroyed here.
     * They are marked REVIVING and later fly into cars.
     */
    collectAllReviveCubes({ conveyor, funnel, cubeManager }) {
        const result = [];

        // 1. Conveyor cubes
        if (conveyor && Array.isArray(conveyor.cubesOnBelt)) {
            for (const entry of conveyor.cubesOnBelt) {
                if (!entry || !entry.cube) continue;

                const cube = entry.cube;

                this.prepareCubeForRevive(cube);

                result.push({
                    cube,
                    color: cube.color,
                    x: cube.sprite ? cube.sprite.x : CONFIG.CONTAINER_X,
                    y: cube.sprite ? cube.sprite.y : CONFIG.CONTAINER_FUNNEL_BOTTOM,
                });
            }

            conveyor.cubesOnBelt = [];
        }

        // 2. Funnel cubes
        if (funnel) {
            if (funnel.drainTimer) {
                funnel.drainTimer.remove(false);
                funnel.drainTimer = null;
            }

            funnel.isDraining = false;

            if (Array.isArray(funnel.cubesInFunnel)) {
                for (const cube of funnel.cubesInFunnel) {
                    if (!cube) continue;
                    if (cube.state === 'REVIVING') continue;

                    this.prepareCubeForRevive(cube);

                    result.push({
                        cube,
                        color: cube.color,
                        x: cube.sprite ? cube.sprite.x : CONFIG.CONTAINER_X,
                        y: cube.sprite ? cube.sprite.y : CONFIG.CONTAINER_FUNNEL_BOTTOM,
                    });
                }

                funnel.cubesInFunnel = [];
            }
        }

        // 3. Any remaining active cubes:
        // spawning / physics / draining / matching.
        if (cubeManager && Array.isArray(cubeManager.active)) {
            for (const cube of cubeManager.active) {
                if (!cube) continue;
                if (cube.state === 'INACTIVE') continue;
                if (cube.state === 'DONE') continue;
                if (cube.state === 'REVIVING') continue;

                this.prepareCubeForRevive(cube);

                result.push({
                    cube,
                    color: cube.color,
                    x: cube.sprite ? cube.sprite.x : CONFIG.CONTAINER_X,
                    y: cube.sprite ? cube.sprite.y : CONFIG.CONTAINER_FUNNEL_BOTTOM,
                });
            }
        }

        return result.filter(item => item && item.cube && item.color);
    }

    prepareCubeForRevive(cube) {
        if (!cube) return;

        if (cube.sprite && cube.sprite.scene) {
            this.scene.tweens.killTweensOf(cube.sprite);
            cube.sprite.setVisible(true);
            cube.sprite.setAlpha(1);
            cube.sprite.setScale(1);
            cube.sprite.setDepth(95);
        }

        if (cube.body) {
            this.scene.matter.world.remove(cube.body);
            cube.body = null;
        }

        cube.state = 'REVIVING';
        cube.stateTime = Date.now();
    }

    async sendReviveCubesToCarsBurst(reviveCubes, carManager, cubeManager) {
        if (!Array.isArray(reviveCubes) || reviveCubes.length === 0) return;

        const byColor = new Map();

        for (const item of reviveCubes) {
            if (!byColor.has(item.color)) {
                byColor.set(item.color, []);
            }

            byColor.get(item.color).push(item);
        }

        const allFlyPromises = [];
        const colorsToResolve = new Set();

        for (const [color, cubes] of byColor.entries()) {
            const allocations = this.allocateReviveCubesToCars(color, cubes.length, carManager);

            if (allocations.length === 0) {
                console.warn(`[Revive] No matching car capacity for ${color}.`);
                continue;
            }

            let cubeIndex = 0;

            for (const allocation of allocations) {
                const car = allocation.car;
                const amount = allocation.amount;

                if (!car || amount <= 0) continue;

                this.prepareCarForReviveFill(car, carManager);

                for (let i = 0; i < amount; i++) {
                    const item = cubes[cubeIndex];

                    if (!item) break;

                    const globalIndex = allFlyPromises.length;

                    const startDelay =
                        Math.floor(globalIndex / 8) * 10 +
                        Phaser.Math.Between(0, 18);

                    allFlyPromises.push(
                        this.flyReviveCubeToCar(item, car, startDelay)
                            .then(() => {
                                this.addDirectCubeToCar(car);

                                if (cubeManager && cubeManager.release) {
                                    cubeManager.release(item.cube);
                                } else {
                                    if (item.cube.sprite) {
                                        item.cube.sprite.setVisible(false);
                                    }

                                    item.cube.state = 'DONE';
                                }
                            })
                    );

                    cubeIndex++;
                    colorsToResolve.add(color);
                }
            }

            // Release any unallocated cubes to avoid stale pooled objects.
            // This path only runs when level data has insufficient car capacity.
            for (let i = cubeIndex; i < cubes.length; i++) {
                const item = cubes[i];

                console.warn(`[Revive] Unallocated cube ${item.color}. Check car capacity data.`);

                if (item.cube && item.cube.sprite && item.cube.sprite.scene) {
                    this.scene.tweens.add({
                        targets: item.cube.sprite,
                        alpha: 0,
                        scaleX: 0.2,
                        scaleY: 0.2,
                        duration: 180,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            if (cubeManager && cubeManager.release) {
                                cubeManager.release(item.cube);
                            }
                        },
                    });
                }
            }
        }

        await Promise.all(allFlyPromises);

        // Resolve full cars after the whole burst lands. Fill is simultaneous; exits are sequential to preserve queue order.
        for (const color of colorsToResolve) {
            await this.resolveFullCarsAfterRevive(color, carManager);
        }
    }

    /**
     * Allocate revive cubes round-robin across all same-color cars,
     * including active and non-active queue cars.
     */
    allocateReviveCubesToCars(color, cubeCount, carManager) {
        const candidates = this.getReviveCandidateCars(color, carManager);

        if (candidates.length === 0 || cubeCount <= 0) return [];

        const allocationMap = new Map();

        for (const car of candidates) {
            allocationMap.set(car, 0);
        }

        let remaining = cubeCount;

        while (remaining > 0) {
            let addedThisRound = false;

            for (const car of candidates) {
                if (remaining <= 0) break;

                const alreadyAllocated = allocationMap.get(car) || 0;
                const free = car.capacity - car.filledCount - alreadyAllocated;

                if (free <= 0) continue;

                allocationMap.set(car, alreadyAllocated + 1);
                remaining--;
                addedThisRound = true;
            }

            if (!addedThisRound) break;
        }

        return candidates
            .map(car => ({
                car,
                amount: allocationMap.get(car) || 0,
            }))
            .filter(item => item.amount > 0);
    }

    getReviveCandidateCars(color, carManager) {
        const cars = [];

        if (!carManager || !Array.isArray(carManager.columns)) return cars;

        // Active row first.
        for (const col of carManager.columns) {
            if (this.canReviveFillCar(col.active, color)) {
                cars.push(col.active);
            }
        }

        // Queue[0] next.
        for (const col of carManager.columns) {
            const car = col.queue && col.queue[0];

            if (this.canReviveFillCar(car, color)) {
                cars.push(car);
            }
        }

        // Deeper queue cars.
        for (const col of carManager.columns) {
            if (!Array.isArray(col.queue)) continue;

            for (let i = 1; i < col.queue.length; i++) {
                const car = col.queue[i];

                if (this.canReviveFillCar(car, color)) {
                    cars.push(car);
                }
            }
        }

        return cars;
    }

    canReviveFillCar(car, color) {
        if (!car) return false;
        if (car.color !== color) return false;
        if (car.isExiting) return false;
        if (car.filledCount >= car.capacity) return false;

        return true;
    }

    prepareCarForReviveFill(car, carManager) {
        if (!car || !car.container) return;

        const location = this.getCarLocation(car, carManager);

        if (!location) return;

        if (location.type === 'active') {
            car.setActive(true);
            car.container.setVisible(true);
            car.container.setAlpha(1);
            car.container.setScale(1);
            car.container.setDepth(28);
            return;
        }

        if (location.type === 'queue') {
            const x = CONFIG.CAR_COL_POSITIONS[location.column];
            const y = CONFIG.CAR_ROW2_Y;

            car.setActive(false);
            car.setPosition(x, y);
            car.container.setVisible(true);
            car.container.setAlpha(CONFIG.CAR_ROW2_ALPHA || 0.72);
            car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
            car.container.setDepth(26);
        }
    }

    flyReviveCubeToCar(item, car, startDelay = 0) {
        return new Promise(resolve => {
            if (!item || !item.cube || !item.cube.sprite || !car || !car.container) {
                resolve();
                return;
            }

            this.scene.time.delayedCall(startDelay, () => {
                const sprite = item.cube.sprite;

                if (!sprite || !sprite.scene || !car.container || !car.container.scene) {
                    resolve();
                    return;
                }

                const target = car.getAbsorbPosition
                    ? car.getAbsorbPosition()
                    : { x: car.container.x, y: car.container.y };

                sprite.setVisible(true);
                sprite.setAlpha(1);
                sprite.setScale(0.88);
                sprite.setDepth(100);

                const fromX = sprite.x;
                const fromY = sprite.y;

                // Phase 1: float straight up from current position (zero-gravity feel)
                const floatY = fromY - (CONFIG.REVIVE_LIFT_HEIGHT ?? 220);

                const jitterX = Phaser.Math.Between(-6, 6);
                const jitterY = Phaser.Math.Between(-4, 4);

                this.scene.tweens.add({
                    targets: sprite,
                    x: fromX,
                    y: floatY,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: CONFIG.REVIVE_FLY_DURATION_1 ?? 320,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        if (!sprite || !sprite.scene) {
                            resolve();
                            return;
                        }

                        // Phase 2: fly from elevated position down to car
                        this.scene.tweens.add({
                            targets: sprite,
                            x: target.x + jitterX,
                            y: target.y + jitterY,
                            scaleX: 0.45,
                            scaleY: 0.45,
                            alpha: 0.96,
                            duration: CONFIG.REVIVE_FLY_DURATION_2 ?? 420,
                            ease: 'Cubic.easeIn',
                            onComplete: () => {
                                resolve();
                            },
                        });
                    },
                });

            });
        });
    }

    addDirectCubeToCar(car) {
        if (!car) return false;

        car.filledCount = Math.min(car.capacity, car.filledCount + 1);

        if (car.updateFillVisual) {
            car.updateFillVisual();
        }

        if (car.container && car.container.scene) {
            const targetScale = car.isActive
                ? 1.06
                : (CONFIG.CAR_ROW2_SCALE || 0.82) * 1.06;

            this.scene.tweens.add({
                targets: car.container,
                scaleX: targetScale,
                scaleY: targetScale,
                duration: 45,
                yoyo: true,
                ease: 'Power2',
            });
        }

        return car.isFull ? car.isFull() : car.filledCount >= car.capacity;
    }

    async resolveFullCarsAfterRevive(color, carManager) {
        if (!carManager) return;

        // Reuse PaintGun's full-car resolution if available.
        if (carManager.resolvePaintGunFullCars) {
            await carManager.resolvePaintGunFullCars(color);
            return;
        }

        // Safe fallback.
        let guard = 0;

        while (guard < 50) {
            guard++;

            const fullCar = this.findNextFullReviveCar(color, carManager);

            if (!fullCar) break;

            await this.handleFullReviveCar(fullCar, carManager);
            await this.delay(80);
        }

        if (carManager.refreshQueueVisibility) {
            carManager.refreshQueueVisibility();
        }
    }

    findNextFullReviveCar(color, carManager) {
        if (!carManager || !Array.isArray(carManager.columns)) return null;

        for (const col of carManager.columns) {
            const car = col.active;

            if (
                car &&
                car.color === color &&
                !car.isExiting &&
                car.filledCount >= car.capacity
            ) {
                return car;
            }
        }

        for (const col of carManager.columns) {
            if (!Array.isArray(col.queue)) continue;

            for (const car of col.queue) {
                if (
                    car &&
                    car.color === color &&
                    !car.isExiting &&
                    car.filledCount >= car.capacity
                ) {
                    return car;
                }
            }
        }

        return null;
    }

    async handleFullReviveCar(car, carManager) {
        const location = this.getCarLocation(car, carManager);

        if (!location) return;

        if (location.type === 'active') {
            if (carManager.onCarFull) {
                await carManager.onCarFull(car);
            }

            return;
        }

        if (location.type === 'queue') {
            const col = carManager.columns[location.column];

            if (!col) return;

            const index = col.queue.indexOf(car);

            if (index !== -1) {
                col.queue.splice(index, 1);
            }

            car.setActive(false);

            if (car.container) {
                car.container.setVisible(true);
                car.container.setAlpha(CONFIG.CAR_ROW2_ALPHA || 0.72);
                car.container.setScale(CONFIG.CAR_ROW2_SCALE || 0.82);
            }

            if (car.exitAnimation) {
                await car.exitAnimation();
            }
        }
    }

    getCarLocation(car, carManager) {
        if (!carManager || !Array.isArray(carManager.columns)) return null;

        for (let columnIndex = 0; columnIndex < carManager.columns.length; columnIndex++) {
            const col = carManager.columns[columnIndex];

            if (col.active === car) {
                return {
                    type: 'active',
                    column: columnIndex,
                    queueIndex: -1,
                };
            }

            if (Array.isArray(col.queue)) {
                const queueIndex = col.queue.indexOf(car);

                if (queueIndex !== -1) {
                    return {
                        type: 'queue',
                        column: columnIndex,
                        queueIndex,
                    };
                }
            }
        }

        return null;
    }

    resetAllCarReservations(carManager) {
        if (!carManager || !Array.isArray(carManager.columns)) return;

        for (const col of carManager.columns) {
            if (col.active) {
                col.active.reservedCount = 0;
            }

            if (Array.isArray(col.queue)) {
                for (const car of col.queue) {
                    car.reservedCount = 0;
                }
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => {
            this.scene.time.delayedCall(ms, resolve);
        });
    }
};



// ============================================================
// BoosterManager — Magnet, Shuffle, Paint Gun
// ============================================================

window.BoosterManager = class BoosterManager {
    constructor(scene, boosterCounts) {
        this.scene = scene;

        this.counts = {
            magnet: boosterCounts?.magnet || 0,
            shuffle: boosterCounts?.shuffle || 0,
            paintGun: boosterCounts?.paintGun || 0,
        };

        // null | 'magnet' | 'paintGun'
        this.activeBooster = null;

        this.highlightedBlocks = [];
        this.highlightTweens = new Map();
    }

    // ----------------------------------------------------------
    // Target helpers
    // ----------------------------------------------------------

    getMagnetTargets(board) {
        if (!board || !board.blocks) return [];

        const result = [];

        for (const [id, block] of board.blocks) {
            if (block &&
                block.state === 'blocked' &&
                !(block.isFrozen && block.isFrozen()) &&
                !block.isLocked) {
                result.push(block);
            }
        }

        return result;
    }

    getPaintGunTopLayerTargets(board) {
        if (!board || !board.getPullableBlocks) return [];

        const pullable = board.getPullableBlocks().filter(block => {
            return block &&
                block.state === 'pullable' &&
                !(block.isFrozen && block.isFrozen()) &&
                !block.isLocked &&
                !block.isResolving;
        });

        if (pullable.length === 0) return [];

        // Higher layer index = visually on top.
        const topLayer = Math.max(...pullable.map(block => block.layer || 0));

        return pullable.filter(block => block.layer === topLayer);
    }

    highlightBlocks(blocks, options = {}) {
        const alpha = options.alpha ?? 0.72;
        const duration = options.duration ?? 350;

        this.highlightedBlocks = blocks;

        for (const block of blocks) {
            if (!block || !block.container || !block.container.scene) continue;

            this.scene.tweens.killTweensOf(block.container);
            block.container.setAlpha(1);

            const tween = this.scene.tweens.add({
                targets: block.container,
                alpha,
                duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });

            this.highlightTweens.set(block, tween);
        }
    }

    delay(ms) {
        return new Promise(resolve => {
            this.scene.time.delayedCall(ms, resolve);
        });
    }

    // ----------------------------------------------------------
    // Magnet
    // ----------------------------------------------------------

    activateMagnet(board) {
        if (this.counts.magnet <= 0) return false;

        if (this.activeBooster === 'magnet') {
            this.cancelTargeting();
            return false;
        }

        if (this.activeBooster) {
            this.cancelTargeting();
        }

        const targets = this.getMagnetTargets(board);

        if (targets.length === 0) {
            this.scene.events.emit('boosterFailed', 'magnet', 'noTargets');
            return false;
        }

        this.activeBooster = 'magnet';

        this.highlightBlocks(targets, {
            alpha: 0.70,
            duration: 400,
        });

        this.scene.events.emit('boosterTargeting', 'magnet');
        return true;
    }

    async useMagnetOn(block, board) {
        if (this.activeBooster !== 'magnet') return false;
        if (block && block.isLocked) {
            if (block.shakeLocked) await block.shakeLocked();
            return false;
        }
        if (block && block.isFrozen && block.isFrozen()) {
            if (block.shakeFrozen) await block.shakeFrozen();
            return false;
        }
        if (!block || block.state !== 'blocked') return false;
        if (this.counts.magnet <= 0) return false;

        // Magnet cubes flow through Funnel — block if Funnel is at capacity.
        if (this.scene.funnel && this.scene.funnel.isFull()) {
            this.scene.funnel.flashFull();
            return false;
        }

        this.counts.magnet--;
        this.cancelTargeting();

        block.isResolving = true;
        this.scene.gameState.setState('ANIMATING');

        const center = block.getScreenCenter();

        const particles = this.scene.add.particles(center.x, center.y, 'particle_star', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.6, end: 0 },
            lifespan: 400,
            quantity: 8,
            tint: 0x9B59B6,
        });

        particles.setDepth(60);

        this.scene.time.delayedCall(500, () => {
            if (particles && particles.destroy) particles.destroy();
        });

        // Snapshot before removing so only already-revealed blocks count down.
        const frozenCountdownTargets = board.getFrozenCountdownTargets
            ? board.getFrozenCountdownTargets(block)
            : [];

        await block.shake();
        await block.liftUp();

        window.SoundMgr?.cubeBurst();
        // Cubes still flow through Funnel/Conveyor per GDD.
        this.scene.cubeManager.spawnFromBlock(block);

        board.removeBlock(block);
        if (block.keyColor && board.activateKey) {
            board.activateKey(block.keyColor, block);
        }
        block.blast();

        if (board.decreaseFrozenCounts) {
            board.decreaseFrozenCounts(1, {
                animate: true,
                targets: frozenCountdownTargets,
            });
        }

        this.scene.cameras.main.shake(80, 0.005);
        this.scene.resolvePostBoardChange();

        this.scene.events.emit('boosterUsed', 'magnet', this.counts.magnet);
        return true;
    }

    // ----------------------------------------------------------
    // Shuffle
    // ----------------------------------------------------------

    activateShuffle(board, carManager) {
        if (this.counts.shuffle <= 0) return false;

        if (this.activeBooster) {
            this.cancelTargeting();
        }

        board = board || this.scene.board;
        carManager = carManager || this.scene.carManager;

        if (!board || !carManager) return false;

        const pullableBlocks = board.getPullableBlocks
            ? board.getPullableBlocks()
            : [];

        if (pullableBlocks.length === 0) {
            this.scene.events.emit('boosterFailed', 'shuffle', 'noPullableBlocks');
            return false;
        }

        const didShuffle = carManager.shuffleForPullableBlocks(pullableBlocks);

        if (!didShuffle) {
            this.scene.events.emit('boosterFailed', 'shuffle', 'noChange');
            return false;
        }

        this.counts.shuffle--;

        this.scene.events.emit('boosterUsed', 'shuffle', this.counts.shuffle);
        return true;
    }

    // ----------------------------------------------------------
    // Paint Gun
    // ----------------------------------------------------------

    activatePaintGun(board) {
        if (this.counts.paintGun <= 0) return false;

        if (this.activeBooster === 'paintGun') {
            this.cancelTargeting();
            return false;
        }

        if (this.activeBooster) {
            this.cancelTargeting();
        }

        const targets = this.getPaintGunTopLayerTargets(board);

        if (targets.length === 0) {
            this.scene.events.emit('boosterFailed', 'paintGun', 'noTargets');
            return false;
        }

        this.activeBooster = 'paintGun';

        this.highlightBlocks(targets, {
            alpha: 0.72,
            duration: 300,
        });

        this.scene.events.emit('boosterTargeting', 'paintGun');
        return true;
    }

    async usePaintGunOn(block, board, carManager, cubeManager) {
        if (this.activeBooster !== 'paintGun') return false;
        if (block && block.isLocked) {
            if (block.shakeLocked) await block.shakeLocked();
            return false;
        }
        if (block && block.isFrozen && block.isFrozen()) {
            if (block.shakeFrozen) await block.shakeFrozen();
            return false;
        }
        if (!block || block.state !== 'pullable') return false;
        if (this.counts.paintGun <= 0) return false;

        const topLayerTargets = this.getPaintGunTopLayerTargets(board);
        // Snapshot before Paint Gun removes blocks — newly revealed frozen blocks won't count down yet.
        const frozenCountdownTargets = board.getFrozenCountdownTargets
            ? board.getFrozenCountdownTargets(block)
            : [];

        let resolvedBlastCount = 0;

        // Only allow targeting blocks on the current top layer.
        if (!topLayerTargets.includes(block)) {
            if (block.shake) await block.shake();
            return false;
        }

        const targetColor = block.color;

        // Only blast same-color blocks on the current top layer that are pullable.
        const targets = topLayerTargets.filter(b => {
            return b &&
                b.color === targetColor &&
                b.state === 'pullable' &&
                !(b.isFrozen && b.isFrozen()) &&
                !b.isLocked &&
                !b.isResolving;
        });

        if (targets.length === 0) return false;

        const availableSlots = carManager.getPaintGunAvailableCapacity
            ? carManager.getPaintGunAvailableCapacity(targetColor)
            : 0;

        if (availableSlots <= 0) {
            this.scene.events.emit('boosterFailed', 'paintGun', 'noMatchingCar');
            return false;
        }

        this.counts.paintGun--;
        this.cancelTargeting();

        this.scene.gameState.setState('ANIMATING');

        const sourcePositions = [];
        let totalCubeCount = 0;

        for (const b of targets) {
            b.isResolving = true;

            const positions = b.getCubeSpawnPositions
                ? b.getCubeSpawnPositions()
                : [b.getScreenCenter()];

            sourcePositions.push(...positions);

            const unitCount = Array.isArray(b.cells) ? b.cells.length : 1;
            totalCubeCount += unitCount * (CONFIG.CUBES_PER_CELL || 4);
        }

        // Cap to available slots in case level data has insufficient car capacity.
        const cubeCountToSend = Math.min(totalCubeCount, availableSlots);

        // Slight stagger between blasts for a chain-reaction feel.
        const PAINT_BLOCK_STAGGER = 55;

        const blastPromises = targets.map((b, index) => {
            return this.delay(index * PAINT_BLOCK_STAGGER).then(async () => {
                if (!b || !board.blocks.has(b.id)) return;

                const center = b.getScreenCenter();

                const particles = this.scene.add.particles(center.x, center.y, 'particle_' + targetColor, {
                    speed: { min: 120, max: 280 },
                    scale: { start: 1, end: 0 },
                    lifespan: 600,
                    quantity: 18,
                });

                particles.setDepth(70);

                this.scene.time.delayedCall(650, () => {
                    if (particles && particles.destroy) particles.destroy();
                });

                await b.shake();
                await b.liftUp();

                window.SoundMgr?.cubeBurst();
                board.removeBlock(b);
                if (b.keyColor && board.activateKey) {
                    board.activateKey(b.keyColor, b);
                }

                // Paint Gun does not spawn cubes into Funnel/Conveyor.
                b.blast();

                resolvedBlastCount++;

                this.scene.cameras.main.shake(50, 0.004);
            });
        });

        await Promise.all(blastPromises);
        // Each blasted block counts as one frozen-count decrement,
        // but only for blocks that were already revealed before Paint Gun fired.
        if (board.decreaseFrozenCounts && resolvedBlastCount > 0) {
            board.decreaseFrozenCounts(resolvedBlastCount, {
                animate: true,
                targets: frozenCountdownTargets,
            });
        }

        await this.sendPaintGunCubesBurstToCars(
            targetColor,
            cubeCountToSend,
            sourcePositions,
            carManager
        );

        this.scene.resolvePostBoardChange();
        this.scene.events.emit('boosterUsed', 'paintGun', this.counts.paintGun);

        return true;
    }

    /**
     * Paint Gun direct burst:
     * - Allocate cubes to all same-color cars with free capacity.
     * - Active and non-active queue cars can all receive cubes.
     * - Cubes fly almost at the same time, not one-by-one.
     */
    async sendPaintGunCubesBurstToCars(color, cubeCount, sourcePositions, carManager) {
        if (cubeCount <= 0) return;

        const sources = sourcePositions && sourcePositions.length > 0
            ? sourcePositions
            : [{ x: CONFIG.CONTAINER_X, y: CONFIG.CONTAINER_GRID_BOTTOM }];

        const allocations = carManager.allocatePaintGunCubes
            ? carManager.allocatePaintGunCubes(color, cubeCount)
            : [];

        if (allocations.length === 0) return;

        const flyPromises = [];
        let globalIndex = 0;

        // Count total cubes to split into 2 rows
        const totalCubes = allocations.reduce((sum, a) => sum + (a && a.amount > 0 ? a.amount : 0), 0);
        const ROW_SIZE = Math.ceil(totalCubes / 2);
        const INTRA_STAGGER = 55;  // ms between each cube within a row
        const ROW_GAP = 320;       // ms before the second row starts

        for (const allocation of allocations) {
            const car = allocation.car;
            const amount = allocation.amount;

            if (!car || amount <= 0) continue;

            if (carManager.prepareCarForPaintGunFill) {
                carManager.prepareCarForPaintGunFill(car);
            }

            for (let i = 0; i < amount; i++) {
                const source = sources[globalIndex % sources.length];

                // Row 1 flies first, Row 2 starts after ROW_GAP
                const startDelay = globalIndex < ROW_SIZE
                    ? globalIndex * INTRA_STAGGER
                    : ROW_GAP + (globalIndex - ROW_SIZE) * INTRA_STAGGER;

                flyPromises.push(
                    this.flyPaintCubeToCarBurst(color, source, car, globalIndex, startDelay)
                        .then(() => {
                            this.addDirectCubeToCar(car);
                        })
                );

                globalIndex++;
            }
        }

        await Promise.all(flyPromises);

        // Resolve full cars only after the entire burst lands, so all cars appear to fill simultaneously.
        if (carManager.resolvePaintGunFullCars) {
            await carManager.resolvePaintGunFullCars(color);
        }
    }

    flyPaintCubeToCarBurst(color, from, car, index = 0, startDelay = 0) {
        return new Promise(resolve => {
            if (!car || !car.container || !car.container.scene) {
                resolve();
                return;
            }

            this.scene.time.delayedCall(startDelay, () => {
                if (!car || !car.container || !car.container.scene) {
                    resolve();
                    return;
                }

                const target = car.getAbsorbPosition
                    ? car.getAbsorbPosition()
                    : { x: car.container.x, y: car.container.y };

                const sprite = this.scene.add.image(from.x, from.y, 'cube_' + color);
                sprite.setDepth(90);
                sprite.setScale(0.86);
                sprite.setAlpha(1);

                const jitterX = Phaser.Math.Between(-12, 12);
                const jitterY = Phaser.Math.Between(-8, 8);

                const midX = (from.x + target.x) / 2 + Phaser.Math.Between(-25, 25);
                const midY = (from.y + target.y) / 2 - Phaser.Math.Between(20, 55);

                this.scene.tweens.add({
                    targets: sprite,
                    x: midX,
                    y: midY,
                    scaleX: 0.78,
                    scaleY: 0.78,
                    duration: 160,
                    ease: 'Quad.easeOut',
                    onComplete: () => {
                        if (!sprite || !sprite.scene) {
                            resolve();
                            return;
                        }

                        this.scene.tweens.add({
                            targets: sprite,
                            x: target.x + jitterX,
                            y: target.y + jitterY,
                            scaleX: 0.48,
                            scaleY: 0.48,
                            alpha: 0.95,
                            duration: 220 + (index % 5) * 12,
                            ease: 'Cubic.easeIn',
                            onComplete: () => {
                                if (sprite && sprite.destroy) sprite.destroy();
                                resolve();
                            },
                        });
                    },
                });
            });
        });
    }

    addDirectCubeToCar(car) {
        if (!car) return false;
        if (car.isFull && car.isFull()) return true;

        car.filledCount = Math.min(car.capacity, car.filledCount + 1);

        if (car.updateFillVisual) {
            car.updateFillVisual();
        }

        if (car.container && car.container.scene) {
            const targetScale = car.isActive
                ? 1.06
                : (CONFIG.CAR_ROW2_SCALE || 0.82) * 1.06;

            this.scene.tweens.add({
                targets: car.container,
                scaleX: targetScale,
                scaleY: targetScale,
                duration: 45,
                yoyo: true,
                ease: 'Power2',
            });
        }

        return car.isFull ? car.isFull() : car.filledCount >= car.capacity;
    }

    // ----------------------------------------------------------
    // Common
    // ----------------------------------------------------------

    cancelTargeting() {
        for (const tween of this.highlightTweens.values()) {
            if (tween && tween.stop) {
                tween.stop();
            }
        }

        this.highlightTweens.clear();

        for (const block of this.highlightedBlocks) {
            if (block && block.container && block.container.scene) {
                block.container.setAlpha(1);
            }
        }

        this.highlightedBlocks = [];
        this.activeBooster = null;

        this.scene.events.emit('boosterTargeting', null);
    }

    getCount(type) {
        return this.counts[type] || 0;
    }

    isTargeting() {
        return this.activeBooster !== null;
    }

    getActiveBooster() {
        return this.activeBooster;
    }
};




// ============================================================
// BootScene — Generates all game textures programmatically
// Global namespace: window.BootScene
// ============================================================

window.BootScene = class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this._generateColorTextures();
        this._generateGeneralTextures();

        // Editor play-test: skip splash + home, jump straight into the game
        const params = new URLSearchParams(window.location.search);
        if (params.get('testLevel')) {
            this.scene.start('GameScene');
            return;
        }

        this.scene.start('LoadingScene');
    }

    // ----------------------------------------------------------
    // Per-color textures: cell, cell_dim, cube, particle
    // ----------------------------------------------------------
    _generateColorTextures() {
        const { CELL_DRAW, CELL_RADIUS, CUBE_SIZE } = CONFIG;

        for (const colorName of COLOR_NAMES) {
            const color = COLORS[colorName];

            // --- cell_{colorName} — 39x39 plastic rounded rect ---
            this._generateCellTexture(`cell_${colorName}`, CELL_DRAW, CELL_DRAW, CELL_RADIUS, color, false);

            // --- cell_{colorName}_dim — same with 40% black overlay ---
            this._generateCellTexture(`cell_${colorName}_dim`, CELL_DRAW, CELL_DRAW, CELL_RADIUS, color, true);

            // --- cube_{colorName} — 10x10 small rounded square ---
            this._generateCubeTexture(`cube_${colorName}`, CUBE_SIZE, color);

            // --- particle_{colorName} — 6x6 circle ---
            this._generateParticleTexture(`particle_${colorName}`, 6, color);
        }
    }

    // ----------------------------------------------------------
    // General textures: grid_cell_empty, booster_bg, particle_star, coin_icon
    // ----------------------------------------------------------
    _generateGeneralTextures() {
        this._generateGridCellEmpty();
        this._generateBoosterBg();
        this._generateStarParticle();
        this._generateCoinIcon();
        this._generateHeartIcon();
        this._generateSettingsIcon();
    }

    // ----------------------------------------------------------
    // Cell texture with plastic look: highlight + shadow
    // ----------------------------------------------------------
    _generateCellTexture(key, w, h, radius, color, isDim) {
        const gfx = this.make.graphics({ add: false });

        // Base fill
        gfx.fillStyle(color.hex, 1);
        gfx.fillRoundedRect(0, 0, w, h, radius);

        // Top-left highlight (lighter edge, 2px)
        gfx.fillStyle(color.light, 0.6);
        gfx.fillRoundedRect(0, 0, w - 2, 2, { tl: radius, tr: 0, bl: 0, br: 0 }); // top edge
        gfx.fillRoundedRect(0, 0, 2, h - 2, { tl: radius, tr: 0, bl: 0, br: 0 }); // left edge

        // Bottom-right shadow (darker edge, 2px)
        gfx.fillStyle(color.dark, 0.7);
        gfx.fillRoundedRect(2, h - 2, w - 2, 2, { tl: 0, tr: 0, bl: 0, br: radius }); // bottom edge
        gfx.fillRoundedRect(w - 2, 2, 2, h - 2, { tl: 0, tr: 0, bl: 0, br: radius }); // right edge

        // Inner shine — small white ellipse near top-left
        gfx.fillStyle(0xFFFFFF, 0.15);
        gfx.fillRoundedRect(4, 4, 14, 8, 3);

        // Dim overlay (40% black)
        if (isDim) {
            gfx.fillStyle(0x000000, 0.4);
            gfx.fillRoundedRect(0, 0, w, h, radius);
        }

        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Cube texture — 10x10 tiny rounded square with shine dot
    // ----------------------------------------------------------
    _generateCubeTexture(key, size, color) {
        const gfx = this.make.graphics({ add: false });
        const r = 2;

        // Fill
        gfx.fillStyle(color.hex, 1);
        gfx.fillRoundedRect(0, 0, size, size, r);

        // Subtle border shadow
        gfx.lineStyle(1, color.dark, 0.5);
        gfx.strokeRoundedRect(0, 0, size, size, r);

        // White shine dot at top-left
        gfx.fillStyle(0xFFFFFF, 0.5);
        gfx.fillCircle(3, 3, 1.5);

        gfx.generateTexture(key, size, size);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Particle texture — 6x6 solid circle
    // ----------------------------------------------------------
    _generateParticleTexture(key, size, color) {
        const gfx = this.make.graphics({ add: false });
        const half = size / 2;

        gfx.fillStyle(color.hex, 1);
        gfx.fillCircle(half, half, half);

        gfx.generateTexture(key, size, size);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Grid cell empty — 39x39 rounded rect
    // ----------------------------------------------------------
    _generateGridCellEmpty() {
        const { CELL_DRAW, CELL_RADIUS } = CONFIG;
        const gfx = this.make.graphics({ add: false });

        // Fill
        gfx.fillStyle(THEME.GRID_EMPTY, 1);
        gfx.fillRoundedRect(0, 0, CELL_DRAW, CELL_DRAW, CELL_RADIUS);

        // Subtle lighter border
        gfx.lineStyle(1, THEME.GRID_EMPTY_LIGHT, 0.6);
        gfx.strokeRoundedRect(0.5, 0.5, CELL_DRAW - 1, CELL_DRAW - 1, CELL_RADIUS);

        gfx.generateTexture('grid_cell_empty', CELL_DRAW, CELL_DRAW);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Booster button background — rounded square with gradient-like fill
    // ----------------------------------------------------------
    _generateBoosterBg() {
        const size = CONFIG.BOOSTER_BTN_SIZE;
        const r = 12;
        const gfx = this.make.graphics({ add: false });

        // Base fill
        gfx.fillStyle(THEME.BOOSTER_BG, 1);
        gfx.fillRoundedRect(0, 0, size, size, r);

        // Lighter top half for gradient effect
        gfx.fillStyle(THEME.BOOSTER_BG_LIGHT, 0.5);
        gfx.fillRoundedRect(0, 0, size, size / 2, { tl: r, tr: r, bl: 0, br: 0 });

        // Subtle white shine on top
        gfx.fillStyle(0xFFFFFF, 0.1);
        gfx.fillRoundedRect(4, 2, size - 8, 6, 3);

        // Border
        gfx.lineStyle(1.5, 0xFFFFFF, 0.15);
        gfx.strokeRoundedRect(0, 0, size, size, r);

        gfx.generateTexture('booster_bg', size, size);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Star particle — 12x12 white 4-pointed star
    // ----------------------------------------------------------
    _generateStarParticle() {
        const size = 12;
        const cx = size / 2;
        const cy = size / 2;
        const outerR = 6;
        const innerR = 2;
        const gfx = this.make.graphics({ add: false });

        gfx.fillStyle(0xFFFFFF, 1);
        gfx.beginPath();

        const points = 4;
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) {
                gfx.moveTo(x, y);
            } else {
                gfx.lineTo(x, y);
            }
        }

        gfx.closePath();
        gfx.fillPath();

        gfx.generateTexture('particle_star', size, size);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Coin icon — 20x20 yellow circle with darker inner circle
    // ----------------------------------------------------------
    _generateCoinIcon() {
        const size = 20;
        const cx = size / 2;
        const cy = size / 2;
        const gfx = this.make.graphics({ add: false });

        // Outer gold circle
        gfx.fillStyle(THEME.COIN_GOLD, 1);
        gfx.fillCircle(cx, cy, 9);

        // Darker inner circle
        gfx.fillStyle(0xD4AC0D, 1);
        gfx.fillCircle(cx, cy, 6);

        // Small white highlight
        gfx.fillStyle(0xFFFFFF, 0.35);
        gfx.fillCircle(cx - 2, cy - 2, 2.5);

        gfx.generateTexture('coin_icon', size, size);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Heart icon — 20x20 red heart shape
    // ----------------------------------------------------------
    _generateHeartIcon() {
        const s = 20;
        const gfx = this.make.graphics({ add: false });
        gfx.fillStyle(0xE74C3C, 1);
        gfx.fillCircle(s * 0.30, s * 0.34, s * 0.24);
        gfx.fillCircle(s * 0.70, s * 0.34, s * 0.24);
        gfx.fillTriangle(s * 0.04, s * 0.42, s * 0.96, s * 0.42, s * 0.50, s * 0.90);
        gfx.generateTexture('heart_icon', s, s);
        gfx.destroy();
    }

    // ----------------------------------------------------------
    // Settings icon - 24x24 simple gear-like button glyph
    // ----------------------------------------------------------
    _generateSettingsIcon() {
        const size = 24;
        const cx = size / 2;
        const cy = size / 2;
        const gfx = this.make.graphics({ add: false });

        gfx.lineStyle(3, THEME.HEADER_SUB, 1);
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = cx + Math.cos(angle) * 7;
            const y1 = cy + Math.sin(angle) * 7;
            const x2 = cx + Math.cos(angle) * 10;
            const y2 = cy + Math.sin(angle) * 10;
            gfx.beginPath();
            gfx.moveTo(x1, y1);
            gfx.lineTo(x2, y2);
            gfx.strokePath();
        }

        gfx.lineStyle(2.5, THEME.HEADER_SUB, 1);
        gfx.strokeCircle(cx, cy, 7);
        gfx.fillStyle(THEME.HEADER_SUB, 1);
        gfx.fillCircle(cx, cy, 2.5);

        gfx.generateTexture('settings_icon', size, size);
        gfx.destroy();
    }
};




// ============================================================
// LoadingScene — Splash screen shown once after textures are ready
// ============================================================

window.LoadingScene = class LoadingScene extends Phaser.Scene {
    constructor() { super('LoadingScene'); }

    /** data: { next, nextData, totalMs, sub } — lets any scene route through this Loading
     *  screen before continuing (e.g. Home → GameScene on PLAY), not just the boot splash. */
    init(data) {
        this._next = (data && data.next) || 'HomeScene';
        this._nextData = (data && data.nextData) || undefined;
        this._totalMs = (data && data.totalMs) || 1800;
        this._subLabel = (data && data.sub) || 'A satisfying puzzle experience';
    }

    create() {
        const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT, cx = W / 2, cy = H / 2;

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x09091A, 1);
        bg.fillRect(0, 0, W, H);
        bg.fillStyle(0x160E3A, 0.6);
        bg.fillCircle(cx, cy - 40, 320);

        // Floating decorative blocks
        this._spawnFloatingBlocks(W, H);

        // Soft light sweep behind the logo
        const sweep = this.add.graphics().setAlpha(0);
        sweep.fillStyle(0xFFFFFF, 0.06);
        sweep.fillEllipse(cx, cy - 95, 260, 90);
        this.tweens.add({ targets: sweep, alpha: 1, duration: 900, delay: 100, ease: 'Quad.easeOut' });
        this.tweens.add({
            targets: sweep, scaleX: 1.08, scaleY: 1.12,
            duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        // Logo — fade + slide up
        const logo = this.add.text(cx, cy - 95, 'BLOCK BLAST\nFLOW!', {
            fontFamily: 'Outfit', fontSize: '50px', fontStyle: 'bold',
            color: '#FFFFFF',
            stroke: '#4B3CCF', strokeThickness: 8,
            shadow: { offsetX: 0, offsetY: 0, color: '#7B6CF6', blur: 32, fill: true },
            align: 'center', resolution: 2,
        }).setOrigin(0.5).setAlpha(0).setY(cy - 75).setScale(0.85);

        this.tweens.add({
            targets: logo, alpha: 1, y: cy - 95, scale: 1,
            duration: 700, ease: 'Back.easeOut',
        });

        // Hero toy car — same procedural style as the Home screen car
        const car = this.add.graphics().setAlpha(0).setScale(0.7);
        const carCy = cy + 6;
        this._drawHeroCar(car, cx, carCy, 1.3);
        this.tweens.add({
            targets: car, alpha: 1, scale: 1,
            duration: 600, delay: 250, ease: 'Back.easeOut',
        });
        this.tweens.add({
            targets: car, y: '+=6',
            duration: 1400, delay: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        // Sparkles popping around the car once it lands
        this.time.delayedCall(800, () => this._spawnSparkles(cx, carCy));

        // Sub-label
        const sub = this.add.text(cx, cy + 70, this._subLabel, {
            fontFamily: 'Outfit', fontSize: '14px', color: '#6666AA', resolution: 2,
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 500, ease: 'Quad.easeOut' });

        // Version tag
        this.add.text(W - 14, H - 12, 'v1.0', {
            fontFamily: 'Outfit', fontSize: '11px', color: '#33335A', resolution: 2,
        }).setOrigin(1, 1).setAlpha(0.7);

        // Progress bar
        const barW = 220, barH = 7, barX = cx - barW / 2, barY = cy + 160;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1E1E33, 1);
        barBg.fillRoundedRect(barX, barY, barW, barH, 4);
        barBg.setAlpha(0);
        this.tweens.add({ targets: barBg, alpha: 1, delay: 300, duration: 300 });

        const barFill = this.add.graphics();
        barFill.setAlpha(0);
        this.tweens.add({ targets: barFill, alpha: 1, delay: 300, duration: 300 });

        const loadTxt = this.add.text(cx, barY + 22, 'Loading…', {
            fontFamily: 'Outfit', fontSize: '12px', color: '#444466', resolution: 2,
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: loadTxt, alpha: 1, delay: 400, duration: 300 });

        // Drive progress value, then fade out into the next scene
        const TOTAL_MS = this._totalMs;
        const start = this.time.now;
        this._tick = () => {
            const t = Math.min(1, (this.time.now - start) / TOTAL_MS);
            const eased = 1 - Math.pow(1 - t, 2.2);
            barFill.clear();
            barFill.fillStyle(0x7B6CF6, 1);
            const fw = barW * eased;
            if (fw > 0) barFill.fillRoundedRect(barX, barY, fw, barH, 4);
        };

        this.time.delayedCall(TOTAL_MS + 400, () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this._next, this._nextData));
        });
    }

    /** Lightweight standalone copy of HomeScene._drawToyCar — Loading runs before HomeScene exists. */
    _drawHeroCar(g, cx, cy, scale = 1) {
        const colorData = COLORS.blue || Object.values(COLORS)[0];
        const w = 86 * scale, h = 50 * scale;

        g.fillStyle(0x000000, 0.25);
        g.fillEllipse(cx, cy + h / 2 + 6 * scale, w * 0.9, 10 * scale);

        g.fillStyle(colorData.hex, 1);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10 * scale);

        g.fillStyle(colorData.dark, 1);
        g.fillRoundedRect(cx - w / 2 + 5 * scale, cy - h / 2, w - 10 * scale, h * 0.35,
            { tl: 8 * scale, tr: 8 * scale, bl: 0, br: 0 });

        g.fillStyle(colorData.light, 0.3);
        g.fillRect(cx - w / 2 + 8 * scale, cy - h * 0.06, w - 16 * scale, h * 0.42);

        const wheelR = 6 * scale;
        const wx = w / 2 - 10 * scale, wy = h / 2 - 2 * scale;
        for (const [dx, dy] of [[-wx, wy], [wx, wy]]) {
            g.fillStyle(0x1A1A1A, 1);
            g.fillCircle(cx + dx, cy + dy, wheelR);
            g.fillStyle(0x666666, 1);
            g.fillCircle(cx + dx, cy + dy, wheelR * 0.4);
        }

        g.fillStyle(0xFFFFFF, 0.18);
        g.fillRoundedRect(cx - w / 2 + 6 * scale, cy - h / 2 + 3 * scale, w * 0.3, 4 * scale, 2 * scale);
    }

    _spawnSparkles(cx, cy) {
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const dist = 70;
            const sx = cx + Math.cos(ang) * dist * 0.6;
            const sy = cy + Math.sin(ang) * dist * 0.35 - 10;
            const s = this.add.text(sx, sy, '✨', { fontSize: '16px' }).setOrigin(0.5).setAlpha(0).setScale(0.4);
            this.tweens.add({
                targets: s, alpha: 1, scale: 1,
                x: sx + Math.cos(ang) * 18, y: sy + Math.sin(ang) * 18,
                duration: 450, delay: i * 70, ease: 'Quad.easeOut',
                onComplete: () => this.tweens.add({
                    targets: s, alpha: 0, duration: 350,
                    onComplete: () => s.destroy(),
                }),
            });
        }
    }

    _spawnFloatingBlocks(W, H) {
        const colors = Object.values(COLORS).map(c => c.hex);
        for (let i = 0; i < 18; i++) {
            const color = colors[i % colors.length];
            const size  = Phaser.Math.Between(18, 40);
            const x     = Phaser.Math.Between(10, W - 10);
            const y     = Phaser.Math.Between(0, H);
            const alpha = Phaser.Math.FloatBetween(0.06, 0.18);
            const rot   = Phaser.Math.FloatBetween(-0.6, 0.6);

            const g = this.add.graphics();
            g.fillStyle(color, 1);
            g.fillRoundedRect(-size / 2, -size / 2, size, size, 5);
            g.setPosition(x, y).setRotation(rot).setAlpha(0);

            this.tweens.add({ targets: g, alpha, duration: 800, delay: i * 60, ease: 'Quad.easeOut' });
            this.tweens.add({
                targets: g,
                y: y + Phaser.Math.Between(-70, 70),
                rotation: rot + Phaser.Math.FloatBetween(-0.4, 0.4),
                duration: Phaser.Math.Between(3500, 7000),
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2500),
            });
        }
    }

    update() {
        if (this._tick) this._tick();
    }
};




// ============================================================
// GameScene — Main gameplay scene orchestrating all systems
// ============================================================

window.GameScene = class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.currentLevel = (data && data.levelIndex !== undefined) ? data.levelIndex : 0;
    }

    create() {
        // Check if launched from editor play-test
        const params = new URLSearchParams(window.location.search);

        if (params.get('testLevel')) {
            try {
                const json = localStorage.getItem('editorTestLevel');

                if (json) {
                    const testLevel = JSON.parse(json);
                    console.log('[GameScene] Loading test level from editor:', testLevel.name);
                    this.loadLevel(testLevel);
                    return;
                }
            } catch (e) {
                console.warn('[GameScene] Failed to load test level:', e);
            }
        }

        // Check if custom levels exist in localStorage
        try {
            const customLevels = localStorage.getItem('customLevels');

            if (customLevels) {
                const parsed = JSON.parse(customLevels);

                if (Array.isArray(parsed) && parsed.length > 0) {
                    window.LEVELS = parsed;
                    console.log('[GameScene] Loaded', parsed.length, 'custom levels from localStorage');
                }
            }
        } catch (e) {
            // ignore
        }

        // Check if specific level index is requested via URL (?level=N)
        const levelParam = params.get('level');

        if (levelParam !== null) {
            const parsedLevel = parseInt(levelParam, 10);

            if (!isNaN(parsedLevel) && parsedLevel >= 0 && parsedLevel < LEVELS.length) {
                this.currentLevel = parsedLevel;
            }
        }

        this.loadLevel(LEVELS[this.currentLevel]);
    }

    loadLevel(levelData) {
        if (!levelData) {
            console.error('No level data for index', this.currentLevel);
            return;
        }

        // Validate level
        const validation = LevelValidator.validate(levelData);

        if (!validation.valid) {
            console.error('Level validation failed:', validation.errors);
        }

        // Create systems in order
        this.board = new Board(this, levelData);
        this.funnel = new Funnel(this, levelData.funnelCapacity);
        this.conveyor = new Conveyor(this, levelData.conveyorCapacity);
        this.road = new Road(this);
        this.carManager = new CarManager(this, levelData.cars);
        this.cubeManager = new CubeManager(this);
        this.cubeManager.preAllocate(CONFIG.CUBE_POOL_SIZE);
        this.gameState = new GameStateManager(this);
        this.boosterManager = new BoosterManager(this, levelData.boosters);

        // Listen for car full events
        this.events.on('carFull', (car) => {
            this.carManager.onCarFull(car);
        });

        // Setup input
        this.setupInput();

        // Cube collision SFX — play a tick when a physics cube hits a funnel wall
        this._cubeCollisionHandler = (event) => {
            if (!event.pairs || event.pairs.length === 0) return;
            let maxSpeed = 0;
            for (const pair of event.pairs) {
                const v = pair.bodyA.speed ?? Math.hypot(pair.bodyA.velocity.x, pair.bodyA.velocity.y);
                const w = pair.bodyB.speed ?? Math.hypot(pair.bodyB.velocity.x, pair.bodyB.velocity.y);
                if (v > maxSpeed) maxSpeed = v;
                if (w > maxSpeed) maxSpeed = w;
            }
            if (maxSpeed > 1.2) window.SoundMgr?.cubeCollide(maxSpeed);
        };
        this.matter.world.on('collisionstart', this._cubeCollisionHandler);

        // Start audio (resume context on first interaction, then start music)
        window.SoundMgr?.startMusic('game');

        // Save progress and start playing
        try { localStorage.setItem('bbf_currentLevel', this.currentLevel); } catch {}
        this.gameState.setState('PLAYING');

        // Launch UI overlay
        this.scene.launch('UIScene', { gameScene: this });
    }

    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            window.SoundMgr?.resume();
            if (this.gameState.isInputLocked()) return;

            const gridPos = this.screenToGrid(pointer.x, pointer.y);

            if (!gridPos) {
                if (this.boosterManager?.isTargeting()) {
                    this.boosterManager.cancelTargeting();
                }
                return;
            }

            const block = this.board.getBlockAt(gridPos.row, gridPos.col);

            if (!block) {
                if (this.boosterManager?.isTargeting()) {
                    this.boosterManager.cancelTargeting();
                }
                return;
            }

            // Booster targeting: always immediate tap, no hold
            if (this.boosterManager?.isTargeting()) {
                this.handleBlockTap(block);
                return;
            }

            // Track for tap-vs-hold distinction
            this._heldBlock    = block;
            this._holdXRayOn   = false;

            // After delay → activate X-Ray peek on this block
            this._holdTimer = this.time.delayedCall(
                CONFIG.XRAY_HOLD_DELAY ?? 280,
                () => {
                    if (this._heldBlock === block) {
                        this._holdXRayOn = true;
                        this.board.setXRayModeForBlock(block, true);
                    }
                }
            );
        });

        this.input.on('pointerup', () => {
            if (this._holdTimer) {
                this._holdTimer.remove();
                this._holdTimer = null;
            }

            const block = this._heldBlock;
            this._heldBlock = null;

            if (this._holdXRayOn) {
                // Long hold: restore X-Ray, no tap
                this._holdXRayOn = false;
                if (block) this.board.setXRayModeForBlock(block, false);
            } else if (block) {
                // Quick tap: handle normally
                this.handleBlockTap(block);
            }
        });

        // Cancel hold if pointer leaves the canvas
        this.input.on('pointerout', () => {
            if (this._holdTimer) {
                this._holdTimer.remove();
                this._holdTimer = null;
            }
            if (this._holdXRayOn && this._heldBlock) {
                this._holdXRayOn = false;
                this.board.setXRayModeForBlock(this._heldBlock, false);
            }
            this._heldBlock = null;
        });
    }

    async handleBlockTap(block) {
        if (!block || block.isResolving) return;

        // Handle booster targeting
        if (this.boosterManager.isTargeting()) {
            const booster = this.boosterManager.getActiveBooster();

            if (booster === 'magnet') {
                await this.boosterManager.useMagnetOn(block, this.board);
            } else if (booster === 'paintGun') {
                await this.boosterManager.usePaintGunOn(
                    block,
                    this.board,
                    this.carManager,
                    this.cubeManager
                );
            }

            return;
        }

        if (block.state === 'covered') return;

        if (block.isLocked) {
            this._maybeTutorial('key_lock', 'Phá Block "Key" cùng màu để mở khoá Block "Lock" này!', block);
            await block.shakeLocked();
            return;
        }

        if (block.isFrozen && block.isFrozen()) {
            this._maybeTutorial('frozen_block', 'Block đóng băng cần bị phá vài lần trước khi rút ra được.', block);
            await block.shakeFrozen();
            return;
        }

        if (block.state === 'blocked') {
            this._maybeTutorial('layer_block', 'Block bị Layer trên che sẽ chặn lại — hãy giải phóng Layer trên trước!', block);
            await block.shakeBlocked();
            return;
        }

        if (block.state === 'pullable') {
            if (this.funnel && this.funnel.isFull()) {
                this.funnel.flashFull();
                return;
            }

            block.isResolving = true;
            this.gameState.setState('ANIMATING');
            window.SoundMgr?.blockTap();

            // Snapshot before removing so only blocks already revealed count down.
            const frozenCountdownTargets = this.board.getFrozenCountdownTargets
                ? this.board.getFrozenCountdownTargets(block)
                : [];

            await block.liftUp();

            // Spawn cubes before blast completes for visual overlap
            window.SoundMgr?.cubeBurst();
            this.cubeManager.spawnFromBlock(block);

            this.board.removeBlock(block);
            if (block.keyColor && this.board.activateKey) {
                this.board.activateKey(block.keyColor, block);
            }
            block.blast();

            // Only decrement frozen blocks that were already revealed before this blast.
            if (this.board.decreaseFrozenCounts) {
                this.board.decreaseFrozenCounts(1, {
                    animate: true,
                    targets: frozenCountdownTargets,
                });
            }

            // Camera micro-shake
            this.cameras.main.shake(80, 0.005);

            this.resolvePostBoardChange();
        }
    }

    setXRayMode(isOn) {
        if (this.board) this.board.setXRayMode(isOn);
    }

    /** Bounding screen rect (in CELL_SIZE units) covering all of a block's cells. */
    _blockScreenRect(block) {
        const rows = block.cells.map(c => c.row);
        const cols = block.cells.map(c => c.col);
        const minR = Math.min(...rows), maxR = Math.max(...rows);
        const minC = Math.min(...cols), maxC = Math.max(...cols);
        return {
            x: CONFIG.BOARD_OFFSET_X + minC * CONFIG.CELL_SIZE,
            y: CONFIG.BOARD_OFFSET_Y + minR * CONFIG.CELL_SIZE,
            w: (maxC - minC + 1) * CONFIG.CELL_SIZE,
            h: (maxR - minR + 1) * CONFIG.CELL_SIZE,
        };
    }

    /** Show a first-encounter hint overlay (UIScene) for a block-related mechanic, if not seen yet. */
    _maybeTutorial(key, text, block) {
        const ui = this.scene.get('UIScene');
        if (!ui || !ui.showTutorial) return;
        ui.showTutorial(key, { text, rect: this._blockScreenRect(block) });
    }

    resolvePostBoardChange() {
        if (!this.gameState ||
            this.gameState.getState() === 'WIN' ||
            this.gameState.getState() === 'LOSE') {
            return;
        }

        if (this.board.isEmpty()) {
            if (!this.gameState.checkWinCondition(this.board, this.carManager)) {
                this.gameState.enterCleanup(this.conveyor);
            }

            return;
        }

        this.gameState.setState('PLAYING');
    }

    screenToGrid(screenX, screenY) {
        const col = Math.floor((screenX - CONFIG.BOARD_OFFSET_X) / CONFIG.CELL_SIZE);
        const row = Math.floor((screenY - CONFIG.BOARD_OFFSET_Y) / CONFIG.CELL_SIZE);

        if (row < 0 || row >= CONFIG.GRID_ROWS ||
            col < 0 || col >= CONFIG.GRID_COLS) {
            return null;
        }

        return { row, col };
    }

    pauseGame() {
        if (!this.gameState.pause()) return false;
        this.tweens.pauseAll();
        this.time.paused = true;
        if (this.matter?.world) this.matter.world.enabled = false;
        return true;
    }

    resumeGame() {
        if (!this.gameState.resume()) return false;
        this.tweens.resumeAll();
        this.time.paused = false;
        if (this.matter?.world) this.matter.world.enabled = true;
        return true;
    }

    update(time, delta) {
        const state = this.gameState.getState();

        if (state === 'WIN' || state === 'IDLE' || state === 'PAUSED') return;

        // Update systems (conveyor keeps running even on LOSE so player can watch)
        if (this.cubeManager) this.cubeManager.update();
        if (this.funnel) this.funnel.update(this.conveyor);
        if (this.conveyor) this.conveyor.update(delta, this.carManager);

        if (state === 'LOSE') return;

        // GDD: WIN = Board empty + Cars clear.
        // When the board is empty, input stays locked in CLEANUP while remaining cubes fill cars.
        if (this.board.isEmpty()) {
            if (this.gameState.checkWinCondition(this.board, this.carManager)) return;

            if (state !== 'CLEANUP') {
                this.gameState.enterCleanup(this.conveyor);
                return;
            }
        }

        // Lose can happen in PLAYING or CLEANUP if the cube/car flow is stuck.
        if (state === 'PLAYING' || state === 'CLEANUP') {
            this.gameState.checkLoseCondition(
                this.conveyor,
                this.carManager,
                this.board,
                this.funnel,
                this.cubeManager
            );
        }
    }

    nextLevel() {
        this.cleanup();
        this.currentLevel++;

        if (this.currentLevel < LEVELS.length) {
            this.scene.restart({ levelIndex: this.currentLevel });
        } else {
            this.currentLevel = LEVELS.length - 1;
            this.scene.restart({ levelIndex: this.currentLevel });
        }
    }

    retryLevel() {
        this.cleanup();
        this.scene.restart({ levelIndex: this.currentLevel });
    }

    selectLevel(index) {
        if (index < 0 || index >= LEVELS.length) return;
        this.cleanup();
        this.currentLevel = index;
        this.scene.restart({ levelIndex: index });
    }

    async revive() {
        await this.gameState.revive({
            conveyor: this.conveyor,
            funnel: this.funnel,
            cubeManager: this.cubeManager,
            carManager: this.carManager,
            boosterManager: this.boosterManager,
        });
    }

    cleanup() {
        this.scene.stop('UIScene');
        this.events.removeAllListeners('carFull');

        window.SoundMgr?.stopMusic();
        if (this._cubeCollisionHandler) {
            this.matter.world.off('collisionstart', this._cubeCollisionHandler);
            this._cubeCollisionHandler = null;
        }
        if (this.board) this.board.destroy();
        if (this.funnel) this.funnel.destroy();
        if (this.conveyor) this.conveyor.destroy();
        if (this.road) this.road.destroy();
        if (this.carManager) this.carManager.destroy();
        if (this.cubeManager) this.cubeManager.clear();
    }

    shutdown() {
        this.cleanup();
    }
};




// ============================================================
// UIScene — HUD overlay (runs parallel to GameScene)
// ============================================================

window.UIScene = class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create(data) {
        this.gameScene = data?.gameScene || this.scene.get('GameScene');
        this._wasTargeting = false;
        this._activeBoosterKey = null;

        this.createHeader();
        this.createBoosterButtons();
        this.createConveyorBar();
        this.createModals();
        this.createConfirmModal();
        this.createPauseModal();
        this.createSettingsModal();
        this.createLevelSelectModal();
        this.createTutorialOverlay();
        this.setupEventListeners();
        this.maybeShowEntryTutorials();
    }

    // ─── Helpers ────────────────────────────────────────────────

    // Press feedback: alpha flash for all targets; also scale for Image objects.
    _addBtnPress(zone, targets) {
        const arr = Array.isArray(targets) ? targets : [targets];
        zone.on('pointerdown', () => {
            arr.forEach(t => {
                t.__pa = t.alpha;
                t.setAlpha(Math.max(0.08, t.alpha * 0.55));
                if (t.type === 'Image') {
                    t.__ps = { x: t.scaleX, y: t.scaleY };
                    t.setScale(t.scaleX * 0.88, t.scaleY * 0.88);
                }
            });
        });
        const restore = () => {
            arr.forEach(t => {
                if (t.__pa !== undefined) { t.setAlpha(t.__pa); delete t.__pa; }
                if (t.__ps) { t.setScale(t.__ps.x, t.__ps.y); delete t.__ps; }
            });
        };
        zone.on('pointerup', restore);
        zone.on('pointerout', restore);
    }

    // Slide up + fade in.
    _openModal(container) {
        container.setVisible(true).setAlpha(0).setY(28);
        this.tweens.add({ targets: container, alpha: 1, y: 0, duration: 300, ease: 'Back.easeOut' });
    }

    // Fade + slide down, then hide. Calls onDone when complete.
    _closeModal(container, onDone) {
        this.tweens.add({
            targets: container, alpha: 0, y: 18, duration: 180, ease: 'Quad.easeIn',
            onComplete: () => {
                container.setVisible(false).setY(0);
                if (onDone) onDone();
            },
        });
    }

    // ─── Header ─────────────────────────────────────────────────

    createHeader() {
        const W = CONFIG.GAME_WIDTH;
        const H = CONFIG.HEADER_HEIGHT;

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x16162A, 1);
        bg.fillRect(0, 0, W, H);
        bg.lineStyle(1, 0x44445A, 0.6);
        bg.lineBetween(0, H, W, H);

        // Pause button (was Settings gear — Settings now lives inside the Pause popup)
        const settingsBtn = this.add.image(28, H / 2, 'settings_icon')
            .setInteractive({ useHandCursor: true }).setDepth(101);
        settingsBtn.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this.openPauseModal();
        });
        this._addBtnPress(settingsBtn, settingsBtn);

        // Level select button
        const lvlX = 66;
        const lvlBtnBg = this.add.graphics().setDepth(100);
        lvlBtnBg.fillStyle(THEME.BOOSTER_BG, 1);
        lvlBtnBg.fillRoundedRect(lvlX - 15, H / 2 - 13, 30, 26, 7);
        const lvlIcon = this.add.text(lvlX, H / 2, '📋', {
            fontSize: '15px', resolution: 2,
        }).setOrigin(0.5).setDepth(101);
        const lvlZone = this.add.zone(lvlX, H / 2, 30, 26)
            .setInteractive({ useHandCursor: true }).setDepth(102);
        lvlZone.on('pointerdown', () => { window.SoundMgr?.buttonClick(); this.openLevelSelect(); });
        this._addBtnPress(lvlZone, [lvlBtnBg, lvlIcon]);

        // (Mute moved to Settings modal)

        // Level info (center)
        const levelData = LEVELS[this.gameScene.currentLevel];
        const difficulty = levelData?.difficulty || 'Tutorial';
        const diffHex = { Tutorial: '#2ECC71', Easy: '#3498DB', Normal: '#F1C40F', Hard: '#E74C3C', 'Super Hard': '#9B59B6' }[difficulty] || '#AAAACC';

        this.add.text(W / 2, H / 2 - 9, difficulty.toUpperCase(), {
            fontFamily: 'Outfit', fontSize: '9px', fontStyle: 'bold',
            color: diffHex, resolution: 2,
        }).setOrigin(0.5).setDepth(101);

        const levelBadge = this.add.graphics().setDepth(100);
        levelBadge.fillStyle(THEME.BOOSTER_BG, 1);
        levelBadge.fillRoundedRect(W / 2 - 40, H / 2 + 1, 80, 22, 11);

        this.add.text(W / 2, H / 2 + 12, `Level ${levelData?.id || 1}`, {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5).setDepth(101);

        // Coin display (right)
        const coinPill = this.add.graphics().setDepth(100);
        coinPill.fillStyle(0x221E14, 1);
        coinPill.fillRoundedRect(W - 104, H / 2 - 13, 76, 26, 13);
        coinPill.lineStyle(1, 0xAA8800, 0.5);
        coinPill.strokeRoundedRect(W - 104, H / 2 - 13, 76, 26, 13);

        this.add.image(W - 89, H / 2, 'coin_icon').setDepth(101);
        this.add.text(W - 73, H / 2, '1200', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold',
            color: '#F1C40F', resolution: 2,
        }).setOrigin(0, 0.5).setDepth(101);

        const plusBg = this.add.graphics().setDepth(100);
        plusBg.fillStyle(THEME.SUCCESS_GREEN, 1);
        plusBg.fillCircle(W - 16, H / 2, 10);
        this.add.text(W - 16, H / 2, '+', {
            fontFamily: 'Outfit', fontSize: '16px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5).setDepth(101);
    }

    // ─── Boosters ───────────────────────────────────────────────

    createBoosterButtons() {
        const y = CONFIG.BOOSTER_AREA_Y + CONFIG.BOOSTER_BTN_SIZE / 2;
        const spacing = 70;
        const startX = CONFIG.GAME_WIDTH / 2 - spacing;
        const size = CONFIG.BOOSTER_BTN_SIZE;

        this.boosterBtns = {};

        const defs = [
            { key: 'magnet',   icon: '🧲', x: startX },
            { key: 'shuffle',  icon: '🔀', x: startX + spacing },
            { key: 'paintGun', icon: '🎨', x: startX + spacing * 2 },
        ];

        for (const b of defs) {
            const bg = this.add.image(b.x, y, 'booster_bg').setDepth(100);
            bg.setInteractive({ useHandCursor: true });

            const icon = this.add.text(b.x, y - 3, b.icon, {
                fontSize: '22px', resolution: 2,
            }).setOrigin(0.5).setDepth(101);

            const count = this.gameScene.boosterManager?.getCount(b.key) || 0;
            const badge = this.add.text(b.x + size / 2 - 6, y + size / 2 - 8, `${count}`, {
                fontFamily: 'Outfit', fontSize: '11px', fontStyle: 'bold',
                color: '#FFFFFF',
                backgroundColor: count > 0 ? '#E74C3C' : '#555566',
                padding: { x: 3, y: 1 }, resolution: 2,
            }).setOrigin(0.5).setDepth(102);

            const baseAlpha = count > 0 ? 1 : 0.4;
            if (count === 0) { bg.setAlpha(0.4); icon.setAlpha(0.4); }

            bg.on('pointerdown', () => this.onBoosterTap(b.key));
            this._addBtnPress(bg, [bg, icon]);

            this.boosterBtns[b.key] = { bg, badge, icon, _baseAlpha: baseAlpha };
        }
    }

    onBoosterTap(key) {
        const gs = this.gameScene;
        if (!gs || gs.gameState.isInputLocked()) return;

        const TUT = {
            magnet:   { key: 'booster_magnet',   text: 'Magnet hút 1 Block bị Layer trên chặn ra khỏi bàn cờ.' },
            shuffle:  { key: 'booster_shuffle',  text: 'Shuffle xếp lại Car đang hoạt động để khớp màu Block có thể rút.' },
            paintGun: { key: 'booster_paintgun', text: 'Paint Gun phá toàn bộ Block cùng màu đang rút được — Cube bay thẳng vào Car.' },
        };
        const tut = TUT[key];
        const btn = this.boosterBtns[key];

        if (tut && btn?.bg) {
            const rect = {
                x: btn.bg.x - btn.bg.displayWidth / 2, y: btn.bg.y - btn.bg.displayHeight / 2,
                w: btn.bg.displayWidth, h: btn.bg.displayHeight,
            };
            const shown = this.showTutorial(tut.key, {
                text: tut.text, rect,
                onDismiss: () => this._activateBooster(key),
            });
            if (shown) return; // activation deferred until the hint is dismissed
        }

        this._activateBooster(key);
    }

    _activateBooster(key) {
        const gs = this.gameScene;
        if (!gs || gs.gameState.isInputLocked()) return;
        window.SoundMgr?.boosterActivate();
        if (key === 'magnet') gs.boosterManager.activateMagnet(gs.board);
        else if (key === 'shuffle') gs.boosterManager.activateShuffle(gs.board, gs.carManager);
        else if (key === 'paintGun') gs.boosterManager.activatePaintGun(gs.board);
    }

    // Called from update() to sync booster visual states with targeting mode.
    _updateBoosterStates() {
        const gs = this.gameScene;
        if (!gs?.boosterManager || !this.boosterBtns) return;
        const isTargeting = gs.boosterManager.isTargeting?.() ?? false;
        const activeKey = isTargeting ? (gs.boosterManager.getActiveBooster?.() ?? null) : null;

        if (isTargeting === this._wasTargeting && activeKey === this._activeBoosterKey) return;
        this._wasTargeting = isTargeting;
        this._activeBoosterKey = activeKey;

        for (const [key, btn] of Object.entries(this.boosterBtns)) {
            this.tweens.killTweensOf(btn.bg);
            if (!isTargeting) {
                btn.bg.clearTint();
                btn.bg.setAlpha(btn._baseAlpha ?? 1);
                btn.icon?.setAlpha(btn._baseAlpha ?? 1);
            } else if (key === activeKey) {
                btn.bg.setTint(0xFFCC66);
                btn.bg.setAlpha(1);
                btn.icon?.setAlpha(1);
                this.tweens.add({
                    targets: btn.bg, alpha: { from: 0.75, to: 1 },
                    duration: 320, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                });
            } else {
                btn.bg.clearTint();
                btn.bg.setAlpha(0.28);
                btn.icon?.setAlpha(0.28);
            }
        }
    }

    // ─── Conveyor Bar ───────────────────────────────────────────

    createConveyorBar() {
        const barX = 55;
        const barY = CONFIG.CONVEYOR_CENTER_Y + CONFIG.CONVEYOR_HEIGHT / 2 + 8;
        const barW = CONFIG.GAME_WIDTH - 110;
        const barH = 8;

        const bgG = this.add.graphics().setDepth(100);
        bgG.fillStyle(0x0F0F1A, 1);
        bgG.fillRoundedRect(barX - 1, barY - 1, barW + 2, barH + 2, 5);
        bgG.fillStyle(0x1E1E2E, 1);
        bgG.fillRoundedRect(barX, barY, barW, barH, 4);
        this.convBarBg = bgG;

        this.convBarFill = this.add.graphics().setDepth(101);

        this._barX = barX;
        this._barY = barY;
        this._barW = barW;
        this._barH = barH;
    }

    updateConveyorBar() {
        if (!this.gameScene?.conveyor) return;
        const pct = this.gameScene.conveyor.getLoadPercent();
        const fillW = Math.max(0, this._barW * Math.min(pct, 1));
        let color = THEME.SUCCESS_GREEN;
        if (pct >= CONFIG.CONV_DANGER) color = THEME.DANGER_RED;
        else if (pct >= CONFIG.CONV_WARNING) color = THEME.WARNING_ORANGE;
        this.convBarFill.clear();
        if (fillW > 0) {
            this.convBarFill.fillStyle(color, 1);
            this.convBarFill.fillRoundedRect(this._barX, this._barY, fillW, this._barH, 4);
        }
    }

    // ─── Modals (Win / Lose) ────────────────────────────────────

    createModals() {
        this.winModal  = this._buildWinModal();
        this.winModal.container.setVisible(false);

        this.loseModal = this._buildLoseModal();
        this.loseModal.container.setVisible(false);

        // Cleanup banner
        this.cleanupText = this.add.text(
            CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 - 50,
            '⚡ Clearing!', {
                fontFamily: 'Outfit', fontSize: '28px', fontStyle: 'bold',
                color: '#F1C40F', stroke: '#2D2D3D', strokeThickness: 4, resolution: 2,
            }
        ).setOrigin(0.5).setDepth(200).setVisible(false);
    }

    _buildWinModal() {
        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 340, ph = 280;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(500);

        // Dim overlay
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.72);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1C1A2E, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 20);
        panel.lineStyle(2, 0x7B6CF6, 0.9);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 20);
        // Accent stripe on top
        panel.fillStyle(0x7B6CF6, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, 5, { tl: 20, tr: 20, bl: 0, br: 0 });
        container.add(panel);

        // Pre-built stars (shown + animated when win triggers)
        this._winStars = [];
        const starOffsets = [-56, 0, 56];
        for (let i = 0; i < 3; i++) {
            const star = this.add.text(cx + starOffsets[i], pTop + 66, '⭐', {
                fontSize: '32px', resolution: 2,
            }).setOrigin(0.5).setAlpha(0).setScale(0.2);
            container.add(star);
            this._winStars.push(star);
        }

        // Title
        container.add(this.add.text(cx, pTop + 118, 'Level Complete!', {
            fontFamily: 'Outfit', fontSize: '26px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5));

        // Subtitle (text swapped in _showWinModal depending on whether a Star was awarded)
        const subText = this.add.text(cx, pTop + 150, 'Tuyệt vời! Bạn đã hoàn thành màn chơi.', {
            fontFamily: 'Outfit', fontSize: '12px', color: '#8888AA', resolution: 2,
        }).setOrigin(0.5);
        container.add(subText);

        // Reward row — "+Coin  +Star" pill, filled in by _showWinModal
        const rewardText = this.add.text(cx, pTop + 173, '', {
            fontFamily: 'Outfit', fontSize: '14px', fontStyle: 'bold', color: '#F1C40F', resolution: 2,
        }).setOrigin(0.5).setAlpha(0);
        container.add(rewardText);

        // Next Level button (accent purple)
        const btnY = pTop + ph - 56;
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x6C5CE7, 1);
        btnBg.fillRoundedRect(cx - 115, btnY - 22, 230, 44, 12);
        container.add(btnBg);

        const btnText = this.add.text(cx, btnY, '▶   Next Level', {
            fontFamily: 'Outfit', fontSize: '16px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        container.add(btnText);

        const btnZone = this.add.zone(cx, btnY, 230, 44).setInteractive({ useHandCursor: true });
        btnZone.on('pointerdown', () => { window.SoundMgr?.buttonClick(); this.gameScene.nextLevel(); });
        this._addBtnPress(btnZone, [btnBg, btnText]);
        container.add(btnZone);

        return { container, subText, rewardText };
    }

    _buildLoseModal() {
        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 320, ph = 300;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(500);

        // Dim overlay (darker for lose mood)
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.8);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1A1216, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 20);
        panel.lineStyle(2, 0xC0392B, 0.7);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 20);
        panel.fillStyle(0xC0392B, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, 5, { tl: 20, tr: 20, bl: 0, br: 0 });
        container.add(panel);

        // Icon + title (text content swapped per lose reason in _openLoseModal)
        const titleIcon = this.add.text(cx, pTop + 52, '😔', {
            fontSize: '32px', resolution: 2,
        }).setOrigin(0.5);
        const titleText = this.add.text(cx, pTop + 94, 'Game Over', {
            fontFamily: 'Outfit', fontSize: '24px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        const subText = this.add.text(cx, pTop + 122, 'Hãy thử lại để giải màn này!', {
            fontFamily: 'Outfit', fontSize: '12px', color: '#886688',
            align: 'center', wordWrap: { width: pw - 40 }, resolution: 2,
        }).setOrigin(0.5);
        container.add(titleIcon); container.add(titleText); container.add(subText);

        // Revive button (primary — purple)
        const reviveY = pTop + 168;
        const reviveBg = this.add.graphics();
        reviveBg.fillStyle(0x8E44AD, 1);
        reviveBg.fillRoundedRect(cx - 105, reviveY - 21, 210, 42, 11);
        container.add(reviveBg);
        const reviveText = this.add.text(cx, reviveY, '💖   Hồi sinh', {
            fontFamily: 'Outfit', fontSize: '15px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        container.add(reviveText);
        const reviveZone = this.add.zone(cx, reviveY, 210, 42).setInteractive({ useHandCursor: true });
        reviveZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this.gameScene.revive();
            this.loseModal.container.setVisible(false);
        });
        this._addBtnPress(reviveZone, [reviveBg, reviveText]);
        container.add(reviveZone);

        // Retry button (secondary — outlined)
        const retryY = pTop + 214;
        const retryBg = this.add.graphics();
        retryBg.lineStyle(2, 0x555566, 1);
        retryBg.strokeRoundedRect(cx - 90, retryY - 18, 180, 36, 10);
        container.add(retryBg);
        const retryText = this.add.text(cx, retryY, '🔄   Thử lại', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold',
            color: '#9999BB', resolution: 2,
        }).setOrigin(0.5);
        container.add(retryText);
        const retryZone = this.add.zone(cx, retryY, 180, 36).setInteractive({ useHandCursor: true });
        retryZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            // The Heart for this loss is already spent (GameStateManager.enterLose).
            // Out of Hearts — send the player Home, where the Over Lives popup gates PLAY.
            if ((window.PlayerHearts?.get() ?? 1) <= 0) {
                this.scene.stop('UIScene');
                this.gameScene.scene.start('HomeScene');
                return;
            }
            this.gameScene.retryLevel();
        });
        this._addBtnPress(retryZone, [retryText]);
        container.add(retryZone);

        // Back to Home (tertiary — plain text link)
        const homeY = pTop + 252;
        const homeText = this.add.text(cx, homeY, '🏠   Về màn hình chính', {
            fontFamily: 'Outfit', fontSize: '12px', fontStyle: 'bold',
            color: '#6666AA', resolution: 2,
        }).setOrigin(0.5);
        container.add(homeText);
        const homeZone = this.add.zone(cx, homeY, 200, 30).setInteractive({ useHandCursor: true });
        homeZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this.scene.stop('UIScene');
            this.gameScene.scene.start('HomeScene');
        });
        this._addBtnPress(homeZone, [homeText]);
        container.add(homeZone);

        // Hold-to-observe hint
        container.add(this.add.text(cx, pTop + ph + 18, '• Nhấn giữ màn hình để quan sát', {
            fontFamily: 'Outfit', fontSize: '11px', color: '#4A4A66', resolution: 2,
        }).setOrigin(0.5));

        return { container, titleIcon, titleText, subText };
    }

    _openLoseModal() {
        const LOSE_COPY = {
            CONVEYOR_FULL: {
                icon: '🚧', title: 'Conveyor đầy!',
                sub: 'Băng chuyền đã đầy và không Cube nào khớp được với Car đang hoạt động.',
            },
            CLEANUP_DEADLOCK: {
                icon: '😔', title: 'Game Over',
                sub: 'Không thể hoàn thành Car còn lại. Hãy thử lại để giải màn này!',
            },
            BOARD_DEADLOCK: {
                icon: '😔', title: 'Game Over',
                sub: 'Không còn Block nào có thể rút được khớp màu. Hãy thử lại nhé!',
            },
        };
        const reason = this.gameScene?.gameState?.loseReason;
        const copy = LOSE_COPY[reason] || LOSE_COPY.CLEANUP_DEADLOCK;
        this.loseModal.titleIcon.setText(copy.icon);
        this.loseModal.titleText.setText(copy.title);
        this.loseModal.subText.setText(copy.sub);

        this._openModal(this.loseModal.container);

        // Hold (> 350ms) hides the overlay so the player can inspect the board.
        // Quick taps (< 350ms) still fire button actions normally.
        let _hideTimer = null;
        const onDown = () => {
            if (!this.loseModal?.container?.visible) return;
            _hideTimer = this.time.delayedCall(350, () => {
                this.loseModal.container.setAlpha(0);
            });
        };
        const onUp = () => {
            if (_hideTimer) { _hideTimer.remove(); _hideTimer = null; }
            if (this.loseModal?.container?.visible) {
                this.loseModal.container.setAlpha(1);
            }
        };
        this.input.on('pointerdown', onDown);
        this.input.on('pointerup', onUp);
    }

    _showWinModal() {
        // Reset stars
        this._winStars.forEach(s => { s.setAlpha(0); s.setScale(0.2); });

        // Star is only granted on a level's FIRST-ever clear; Coin is granted on every win.
        const state = this.gameScene?.gameState;
        const starAwarded = state?.starAwarded !== false;
        const coinAwarded = state?.coinAwarded ?? 0;
        this.winModal.subText.setText(
            starAwarded
                ? 'Tuyệt vời! Bạn đã hoàn thành màn chơi.'
                : 'Tuyệt vời! Bạn đã hoàn thành màn chơi.\n(Màn này đã từng nhận Star trước đó)'
        );
        this.winModal.rewardText.setText(
            starAwarded ? `🪙 +${coinAwarded}    ⭐ +1` : `🪙 +${coinAwarded}`
        ).setAlpha(0).setScale(0.6);

        this._openModal(this.winModal.container);
        this.time.delayedCall(280, () => {
            this.tweens.add({
                targets: this.winModal.rewardText, alpha: 1, scale: 1,
                duration: 350, ease: 'Back.easeOut',
            });
        });
        // Stagger star pop-in after modal lands
        this._winStars.forEach((s, i) => {
            this.time.delayedCall(320 + i * 160, () => {
                this.tweens.add({
                    targets: s, alpha: 1, scaleX: 1, scaleY: 1,
                    duration: 300, ease: 'Back.easeOut',
                });
                window.SoundMgr?.buttonClick?.();
            });
        });
    }

    // ─── Confirm Modal (generic Yes/No, used by Pause → Restart/Quit) ────

    createConfirmModal() {
        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 280, ph = 178;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(700).setVisible(false);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.7);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        const panel = this.add.graphics();
        panel.fillStyle(0x1A1A2A, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 16);
        panel.lineStyle(2, THEME.UI_PANEL_BORDER, 1);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 16);
        container.add(panel);

        const titleTxt = this.add.text(cx, pTop + 36, '', {
            fontFamily: 'Outfit', fontSize: '16px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        container.add(titleTxt);

        const msgTxt = this.add.text(cx, pTop + 64, '', {
            fontFamily: 'Outfit', fontSize: '12px', color: '#9999BB',
            align: 'center', wordWrap: { width: pw - 40 }, resolution: 2,
        }).setOrigin(0.5);
        container.add(msgTxt);

        const btnY = pTop + ph - 34;

        const cancelBg = this.add.graphics();
        cancelBg.lineStyle(2, 0x555566, 1);
        cancelBg.strokeRoundedRect(cx - 122, btnY - 18, 116, 36, 10);
        const cancelText = this.add.text(cx - 64, btnY, 'Hủy', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold',
            color: '#9999BB', resolution: 2,
        }).setOrigin(0.5);
        const cancelZone = this.add.zone(cx - 64, btnY, 116, 36).setInteractive({ useHandCursor: true });
        cancelZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this._closeModal(container);
        });
        this._addBtnPress(cancelZone, [cancelText]);
        container.add(cancelBg); container.add(cancelText); container.add(cancelZone);

        const confirmBg = this.add.graphics();
        confirmBg.fillStyle(0xC0392B, 1);
        confirmBg.fillRoundedRect(cx + 6, btnY - 18, 116, 36, 10);
        const confirmText = this.add.text(cx + 64, btnY, 'Xác nhận', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        const confirmZone = this.add.zone(cx + 64, btnY, 116, 36).setInteractive({ useHandCursor: true });
        confirmZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            const cb = this._confirmModalCallback;
            this._confirmModalCallback = null;
            this._closeModal(container, () => { if (cb) cb(); });
        });
        this._addBtnPress(confirmZone, [confirmBg, confirmText]);
        container.add(confirmBg); container.add(confirmText); container.add(confirmZone);

        this.confirmModal = { container, titleTxt, msgTxt };
    }

    /** Show a generic Confirm/Cancel popup. onConfirm runs after the popup closes. */
    openConfirm(title, message, onConfirm) {
        if (!this.confirmModal) return;
        this.confirmModal.titleTxt.setText(title);
        this.confirmModal.msgTxt.setText(message);
        this._confirmModalCallback = onConfirm;
        this._openModal(this.confirmModal.container);
    }

    // ─── Pause Modal ──────────────────────────────────────────────

    openPauseModal() {
        if (!this.pauseModal) return;
        if (!this.gameScene?.pauseGame()) return; // only opens while actually PLAYING
        window.SoundMgr?.buttonClick();
        this.pauseModal.container.setScale(0.85);
        this._openModal(this.pauseModal.container);
        this.tweens.add({
            targets: this.pauseModal.container, scaleX: 1, scaleY: 1,
            duration: 300, ease: 'Back.easeOut',
        });
    }

    closePauseModal(andResume = true) {
        if (!this.pauseModal) return;
        this._closeModal(this.pauseModal.container, () => {
            if (andResume) this.gameScene?.resumeGame();
        });
    }

    createPauseModal() {
        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 280, ph = 320;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(600).setVisible(false);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.7);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        const panel = this.add.graphics();
        panel.fillStyle(0x1A1A2A, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 18);
        panel.lineStyle(2, THEME.UI_PANEL_BORDER, 1);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 18);
        container.add(panel);

        container.add(this.add.text(cx, pTop + 34, '⏸  Tạm dừng', {
            fontFamily: 'Outfit', fontSize: '18px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5));

        // Small settings icon — opens the Settings modal on top, Pause stays underneath
        const setX = pLeft + pw - 26, setY = pTop + 26;
        const setBg = this.add.graphics();
        setBg.fillStyle(0x3A3A4E, 1);
        setBg.fillCircle(setX, setY, 14);
        const setIcon = this.add.image(setX, setY, 'settings_icon').setScale(0.7);
        const setZone = this.add.zone(setX, setY, 30, 30).setInteractive({ useHandCursor: true });
        setZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this.openSettingsModal();
        });
        this._addBtnPress(setZone, [setBg, setIcon]);
        container.add(setBg); container.add(setIcon); container.add(setZone);

        const makeBtn = (y, label, bgColor, isOutline, onTap) => {
            const bg = this.add.graphics();
            if (isOutline) {
                bg.lineStyle(2, bgColor, 1);
                bg.strokeRoundedRect(cx - 110, y - 22, 220, 44, 12);
            } else {
                bg.fillStyle(bgColor, 1);
                bg.fillRoundedRect(cx - 110, y - 22, 220, 44, 12);
            }
            const text = this.add.text(cx, y, label, {
                fontFamily: 'Outfit', fontSize: '15px', fontStyle: 'bold',
                color: isOutline ? '#CCCCDD' : '#FFFFFF', resolution: 2,
            }).setOrigin(0.5);
            const zone = this.add.zone(cx, y, 220, 44).setInteractive({ useHandCursor: true });
            zone.on('pointerdown', () => { window.SoundMgr?.buttonClick(); onTap(); });
            this._addBtnPress(zone, [bg, text]);
            container.add(bg); container.add(text); container.add(zone);
        };

        makeBtn(pTop + 110, '▶  Resume', 0x27AE60, false, () => this.closePauseModal(true));

        makeBtn(pTop + 168, '🔄  Restart', 0xE67E22, false, () => {
            this.openConfirm(
                'Chơi lại màn này?',
                'Tiến trình hiện tại sẽ mất.',
                () => { this.closePauseModal(false); this.gameScene.retryLevel(); }
            );
        });

        makeBtn(pTop + 226, '🚪  Quit Level', 0xC0392B, false, () => {
            this.openConfirm(
                'Rời màn chơi?',
                'Bạn sẽ mất 1 Heart và quay về Trang chủ.',
                () => {
                    window.PlayerHearts?.spend(1);
                    this.closePauseModal(false);
                    this.scene.stop('UIScene');
                    this.gameScene.scene.start('HomeScene');
                }
            );
        });

        this.pauseModal = { container };
    }

    // ─── Tutorial Overlay (first-time mechanic hints) ────────────

    createTutorialOverlay() {
        const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        const container = this.add.container(0, 0).setDepth(800).setVisible(false);

        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.6);
        dim.fillRect(0, 0, W, H);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        const ring = this.add.graphics();
        container.add(ring);

        const textBox = this.add.text(W / 2, H / 2, '', {
            fontFamily: 'Outfit', fontSize: '14px', fontStyle: 'bold',
            color: '#FFFFFF', align: 'center', wordWrap: { width: W - 80 },
            resolution: 2,
        }).setOrigin(0.5);
        container.add(textBox);

        const okBg = this.add.graphics();
        const okText = this.add.text(0, 0, 'Đã hiểu', {
            fontFamily: 'Outfit', fontSize: '14px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5);
        const okZone = this.add.zone(0, 0, 120, 40).setInteractive({ useHandCursor: true });
        okZone.on('pointerdown', () => this._dismissTutorial());
        this._addBtnPress(okZone, [okBg, okText]);
        container.add(okBg); container.add(okText); container.add(okZone);

        this.tutorialOverlay = { container, ring, textBox, okBg, okText, okZone };
        this._tutorialActive = false;
        this._tutorialQueue = [];
    }

    /**
     * Show a one-time hint overlay for `key` (skipped forever once seen).
     * rect: optional {x,y,w,h} screen area to highlight with a glowing ring.
     * onDismiss: optional callback fired after the player taps OK.
     * Returns true if the overlay was shown (or queued), false if already seen.
     */
    showTutorial(key, { text, rect = null, onDismiss = null } = {}) {
        if (localStorage.getItem(`bbf_tut_${key}`) === '1') return false;

        if (this._tutorialActive) {
            this._tutorialQueue.push({ key, text, rect, onDismiss });
            return true;
        }

        this._tutorialActive = true;
        this.gameScene?.pauseGame();

        const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
        const { ring, textBox, okBg, okText, okZone } = this.tutorialOverlay;

        ring.clear();
        let textY = H / 2;
        if (rect) {
            const r = 14;
            ring.lineStyle(3, 0xF1C40F, 0.95);
            ring.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, r);
            ring.lineStyle(1.5, 0xF1C40F, 0.35);
            ring.strokeRoundedRect(rect.x - 5, rect.y - 5, rect.w + 10, rect.h + 10, r + 4);

            const isTop = (rect.y + rect.h / 2) < H / 2;
            textY = isTop ? Math.min(H - 90, rect.y + rect.h + 56) : Math.max(90, rect.y - 56);
        }

        textBox.setText(text || '').setPosition(W / 2, textY);
        const okY = textY + 40;
        okBg.clear();
        okBg.fillStyle(0x6C5CE7, 1);
        okBg.fillRoundedRect(W / 2 - 60, okY - 20, 120, 40, 12);
        okText.setPosition(W / 2, okY);
        okZone.setPosition(W / 2, okY);

        this._activeTutorialKey = key;
        this._pendingTutorialDismiss = onDismiss;
        this._openModal(this.tutorialOverlay.container);
        return true;
    }

    _dismissTutorial() {
        window.SoundMgr?.buttonClick();
        const key = this._activeTutorialKey;
        const cb = this._pendingTutorialDismiss;
        this._pendingTutorialDismiss = null;

        this._closeModal(this.tutorialOverlay.container, () => {
            this._tutorialActive = false;
            this.gameScene?.resumeGame();
            if (cb) cb();

            if (this._tutorialQueue.length > 0) {
                const next = this._tutorialQueue.shift();
                this.showTutorial(next.key, next);
            }
        });

        if (key) localStorage.setItem(`bbf_tut_${key}`, '1');
    }

    /** First-ever-level hint: explains the core "tap to pull" mechanic before any input. */
    maybeShowEntryTutorials() {
        const boardRect = {
            x: CONFIG.BOARD_OFFSET_X, y: CONFIG.BOARD_OFFSET_Y,
            w: CONFIG.GRID_COLS * CONFIG.CELL_SIZE, h: CONFIG.GRID_ROWS * CONFIG.CELL_SIZE,
        };
        this.showTutorial('tap_block', {
            text: 'Chạm vào một Block để rút nó ra khỏi bàn cờ và phá thành Cube!',
            rect: boardRect,
        });
    }

    // ─── Settings Modal ─────────────────────────────────────────

    openSettingsModal() {
        if (!this.settingsModal) return;
        this._openModal(this.settingsModal.container);
    }

    createSettingsModal() {
        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 304, ph = 348;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(650).setVisible(false);

        // Dim
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.65);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1A1A2A, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 20);
        panel.fillStyle(0x2A2448, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, 58, { tl: 20, tr: 20, bl: 0, br: 0 });
        panel.lineStyle(1.5, THEME.UI_PANEL_BORDER, 0.6);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 20);
        container.add(panel);

        // Title
        container.add(this.add.text(cx, pTop + 29, '⚙️  Tùy chọn', {
            fontFamily: 'Outfit', fontSize: '18px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5));

        // Close button
        const clX = pLeft + pw - 28, clY = pTop + 29;
        const closeBg = this.add.graphics();
        closeBg.fillStyle(0x3A3A4E, 1);
        closeBg.fillCircle(clX, clY, 13);
        const closeText = this.add.text(clX, clY, '✕', {
            fontFamily: 'Outfit', fontSize: '13px', color: '#CCCCDD', resolution: 2,
        }).setOrigin(0.5);
        const closeZone = this.add.zone(clX, clY, 28, 28).setInteractive({ useHandCursor: true });
        closeZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            this._closeModal(container);
        });
        this._addBtnPress(closeZone, [closeBg, closeText]);
        container.add(closeBg);
        container.add(closeText);
        container.add(closeZone);

        // Helper: thin section divider
        const addDivider = (y) => {
            const d = this.add.graphics();
            d.lineStyle(1, THEME.UI_PANEL_BORDER, 0.3);
            d.lineBetween(pLeft + 18, y, pLeft + pw - 18, y);
            container.add(d);
        };

        // Helper: small rounded icon badge
        const addBadge = (x, y, emoji, bg) => {
            const g = this.add.graphics();
            g.fillStyle(bg, 1);
            g.fillRoundedRect(x - 16, y - 16, 32, 32, 10);
            container.add(g);
            container.add(this.add.text(x, y, emoji, { fontSize: '15px', resolution: 2 }).setOrigin(0.5));
        };

        addDivider(pTop + 58);

        // ── Sound on/off toggle ──────────────────────────────────────
        const row1Y = pTop + 92;
        addBadge(pLeft + 34, row1Y, '🔊', 0x2E2A4A);
        container.add(this.add.text(pLeft + 60, row1Y, 'Âm thanh', {
            fontFamily: 'Outfit', fontSize: '14px', fontStyle: 'bold',
            color: '#DDDDEE', resolution: 2,
        }).setOrigin(0, 0.5));

        const TW = 48, TH = 26, TR = 13, KR = 10;
        const tgX = pLeft + pw - 46;
        const tgOffX = tgX - TW / 2 + TR, tgOnX = tgX + TW / 2 - TR;
        let soundOn = !(window.SoundMgr?.muted ?? false);

        const tgBg = this.add.graphics();
        const redrawToggle = (on) => {
            tgBg.clear();
            tgBg.fillStyle(on ? 0x27AE60 : 0x3A3A50, 1);
            tgBg.fillRoundedRect(tgX - TW / 2, row1Y - TH / 2, TW, TH, TR);
        };
        redrawToggle(soundOn);
        container.add(tgBg);

        const tgKnob = this.add.graphics();
        tgKnob.fillStyle(0xFFFFFF, 1);
        tgKnob.fillCircle(0, 0, KR);
        tgKnob.setPosition(soundOn ? tgOnX : tgOffX, row1Y);
        container.add(tgKnob);

        const tgZone = this.add.zone(tgX, row1Y, TW, TH).setInteractive({ useHandCursor: true });
        tgZone.on('pointerdown', () => {
            soundOn = !soundOn;
            redrawToggle(soundOn);
            this.tweens.add({ targets: tgKnob, x: soundOn ? tgOnX : tgOffX, duration: 160, ease: 'Quad.easeOut' });
            const muted = window.SoundMgr?.toggleMute();
            if (this.muteBtnIcon) this.muteBtnIcon.setText(muted ? '🔇' : '🔊');
            if (!muted) window.SoundMgr?.buttonClick();
        });
        container.add(tgZone);

        addDivider(pTop + 130);

        // ── Slider helper ────────────────────────────────────────────
        // Each slider: label row + track row.
        // Pointer coords are in world space; since container lives at (0,0)
        // after animation, local x = world x.
        const TRK_MARGIN = 24;
        const TRK_START  = pLeft + TRK_MARGIN;
        const TRK_END    = pLeft + pw - TRK_MARGIN;
        const TRK_W      = TRK_END - TRK_START;
        const TRK_H      = 6;
        const KNOB_R     = 12;

        const makeSlider = (badgeY, labelY, trackY, labelEmoji, labelStr, badgeBg, initV, accentColor, onChange) => {
            addBadge(pLeft + 34, badgeY, labelEmoji, badgeBg);
            container.add(this.add.text(pLeft + 60, labelY, labelStr, {
                fontFamily: 'Outfit', fontSize: '13px', color: '#9999BB', resolution: 2,
            }).setOrigin(0, 0.5));

            const pctTxt = this.add.text(TRK_END, labelY, '', {
                fontFamily: 'Outfit', fontSize: '12px', fontStyle: 'bold',
                color: '#7777AA', resolution: 2,
            }).setOrigin(1, 0.5);
            container.add(pctTxt);

            // Track background
            const trackBg = this.add.graphics();
            trackBg.fillStyle(0x1E1E2E, 1);
            trackBg.fillRoundedRect(TRK_START, trackY - TRK_H / 2, TRK_W, TRK_H, TRK_H / 2);
            container.add(trackBg);

            // Track fill (left portion, coloured)
            const trackFill = this.add.graphics();
            container.add(trackFill);

            // Knob
            const knob = this.add.graphics();
            container.add(knob);

            let value = initV;

            const redraw = (v) => {
                value = Math.max(0, Math.min(1, v));
                const kx = TRK_START + value * TRK_W;
                // Fill
                trackFill.clear();
                if (value > 0) {
                    trackFill.fillStyle(accentColor, 1);
                    trackFill.fillRoundedRect(TRK_START, trackY - TRK_H / 2, value * TRK_W, TRK_H, TRK_H / 2);
                }
                // Knob: glow ring + white circle
                knob.clear();
                knob.fillStyle(accentColor, 0.25);
                knob.fillCircle(kx, trackY, KNOB_R + 5);
                knob.fillStyle(0xFFFFFF, 1);
                knob.fillCircle(kx, trackY, KNOB_R);
                knob.lineStyle(2.5, accentColor, 1);
                knob.strokeCircle(kx, trackY, KNOB_R);
                // Label
                pctTxt.setText(`${Math.round(value * 100)}%`);
                onChange(value);
            };
            redraw(value);

            // Interaction: wide zone covering track + knob
            const zone = this.add.zone(
                TRK_START + TRK_W / 2, trackY,
                TRK_W + KNOB_R * 2, (KNOB_R + 5) * 2 + 4
            ).setInteractive({ useHandCursor: true });
            container.add(zone);

            let dragging = false;
            zone.on('pointerdown', (ptr) => {
                dragging = true;
                redraw((ptr.x - TRK_START) / TRK_W);
            });
            this.input.on('pointermove', (ptr) => {
                if (!dragging) return;
                redraw((ptr.x - TRK_START) / TRK_W);
            });
            this.input.on('pointerup', () => {
                if (dragging) { dragging = false; window.SoundMgr?.buttonClick(); }
            });
        };

        // ── Music volume ─────────────────────────────────────────────
        makeSlider(
            pTop + 160, pTop + 154, pTop + 178,
            '🎵', 'Nhạc nền', 0x2E2A4A,
            window.SoundMgr?.musicVolume ?? 0.7,
            0x7B6CF6,
            (v) => window.SoundMgr?.setMusicVolume(v)
        );

        // ── SFX volume ───────────────────────────────────────────────
        makeSlider(
            pTop + 218, pTop + 212, pTop + 236,
            '🎛', 'Hiệu ứng âm', 0x223A2E,
            window.SoundMgr?.sfxVolume ?? 0.5,
            0x27AE60,
            (v) => window.SoundMgr?.setSfxVolume(v)
        );

        addDivider(pTop + 268);

        // ── Reset Game (demo helper) — tap once to arm, tap again within 4s to confirm ──
        const rstY = pTop + 302;
        const rstW = pw - 40, rstH = 44;
        const rstBg = this.add.graphics(); container.add(rstBg);
        const rstLabel = this.add.text(cx, rstY - 7, '🗑  Reset dữ liệu game', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold', color: '#FF8A8A', resolution: 2,
        }).setOrigin(0.5); container.add(rstLabel);
        const rstHint = this.add.text(cx, rstY + 13, 'Xoá tiến trình, mở khoá & tuỳ chỉnh để demo lại', {
            fontFamily: 'Outfit', fontSize: '10px', color: '#8888AA', resolution: 2,
        }).setOrigin(0.5); container.add(rstHint);

        let rstArmed = false, rstArmTimer = null;
        const drawRst = (danger) => {
            rstBg.clear();
            rstBg.fillStyle(danger ? 0xB23A3A : 0x2A1E2E, 1);
            rstBg.fillRoundedRect(cx - rstW / 2, rstY - rstH / 2, rstW, rstH, 12);
            rstBg.lineStyle(1.5, danger ? 0xFF6B6B : 0x6A3A4A, 0.8);
            rstBg.strokeRoundedRect(cx - rstW / 2, rstY - rstH / 2, rstW, rstH, 12);
        };
        drawRst(false);

        const rstZone = this.add.zone(cx, rstY, rstW, rstH).setInteractive({ useHandCursor: true });
        container.add(rstZone);
        this._addBtnPress(rstZone, [rstLabel, rstHint]);
        rstZone.on('pointerdown', () => {
            window.SoundMgr?.buttonClick();
            if (!rstArmed) {
                rstArmed = true;
                drawRst(true);
                rstLabel.setText('⚠  Chạm lần nữa để xác nhận');
                if (rstArmTimer) rstArmTimer.remove();
                rstArmTimer = this.time.delayedCall(4000, () => {
                    rstArmed = false; drawRst(false); rstLabel.setText('🗑  Reset dữ liệu game');
                });
            } else {
                if (rstArmTimer) rstArmTimer.remove();
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('bbf_')) keys.push(k);
                }
                keys.forEach((k) => localStorage.removeItem(k));
                window.location.reload();
            }
        });

        this.settingsModal = { container };
    }

    // ─── Level Select ────────────────────────────────────────────

    openLevelSelect() {
        if (!this.levelSelectModal) return;
        const currentLevel = this.gameScene?.currentLevel || 0;
        this.levelSelectModal.setPage(Math.floor(currentLevel / 6));
        this._openModal(this.levelSelectModal.container);
    }

    createLevelSelectModal() {
        const LEVELS_PER_PAGE = 6;
        let currentPage = 0;
        let cardItems = [];

        const cx = CONFIG.GAME_WIDTH / 2;
        const cy = CONFIG.GAME_HEIGHT / 2;
        const pw = 340, ph = 460;
        const pLeft = cx - pw / 2, pTop = cy - ph / 2;

        const container = this.add.container(0, 0).setDepth(600).setVisible(false);

        // Dim overlay
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.75);
        dim.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
        container.add(dim);

        // Panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1E1E2E, 1);
        panel.fillRoundedRect(pLeft, pTop, pw, ph, 18);
        panel.lineStyle(2, THEME.UI_PANEL_BORDER, 1);
        panel.strokeRoundedRect(pLeft, pTop, pw, ph, 18);
        container.add(panel);

        // Title
        container.add(this.add.text(cx, pTop + 28, '🗺  Chọn Level', {
            fontFamily: 'Outfit', fontSize: '19px', fontStyle: 'bold',
            color: '#FFFFFF', resolution: 2,
        }).setOrigin(0.5));

        // Close button
        const clX = pLeft + pw - 24, clY = pTop + 24;
        const closeBg2 = this.add.graphics();
        closeBg2.fillStyle(0x3A3A4E, 1);
        closeBg2.fillCircle(clX, clY, 13);
        const closeText2 = this.add.text(clX, clY, '✕', {
            fontFamily: 'Outfit', fontSize: '14px', color: '#CCCCDD', resolution: 2,
        }).setOrigin(0.5);
        const closeZone2 = this.add.zone(clX, clY, 28, 28).setInteractive({ useHandCursor: true });
        closeZone2.on('pointerdown', () => this._closeModal(container));
        this._addBtnPress(closeZone2, [closeBg2, closeText2]);
        container.add(closeBg2);
        container.add(closeText2);
        container.add(closeZone2);

        // Pagination
        const pageY = pTop + ph - 30;
        const pageText = this.add.text(cx, pageY, '', {
            fontFamily: 'Outfit', fontSize: '12px', color: '#666677', resolution: 2,
        }).setOrigin(0.5);
        container.add(pageText);

        const prevText = this.add.text(pLeft + 44, pageY, '◀ Prev', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold', color: '#7B6CF6', resolution: 2,
        }).setOrigin(0.5);
        const prevZone = this.add.zone(pLeft + 44, pageY, 68, 30).setInteractive({ useHandCursor: true });
        prevZone.on('pointerdown', () => { if (currentPage > 0) { currentPage--; buildPage(currentPage); } });
        this._addBtnPress(prevZone, prevText);
        container.add(prevText);
        container.add(prevZone);

        const nextText = this.add.text(pLeft + pw - 44, pageY, 'Next ▶', {
            fontFamily: 'Outfit', fontSize: '13px', fontStyle: 'bold', color: '#7B6CF6', resolution: 2,
        }).setOrigin(0.5);
        const nextZone = this.add.zone(pLeft + pw - 44, pageY, 68, 30).setInteractive({ useHandCursor: true });
        nextZone.on('pointerdown', () => {
            const total = Math.ceil((window.LEVELS || []).length / LEVELS_PER_PAGE);
            if (currentPage < total - 1) { currentPage++; buildPage(currentPage); }
        });
        this._addBtnPress(nextZone, nextText);
        container.add(nextText);
        container.add(nextZone);

        // Card layout
        const cardAreaTop  = pTop + 55;
        const cardAreaLeft = pLeft + 15;
        const cardW = (pw - 30 - 10) / 2;
        const cardH = 82;
        const DIFF_BG  = { Tutorial: 0x1A7A4A, Easy: 0x1A487A, Normal: 0x7A6A1A, Hard: 0x7A1A1A, 'Super Hard': 0x5B2C6F };
        const DIFF_HEX = { Tutorial: '#2ECC71', Easy: '#3498DB', Normal: '#F1C40F', Hard: '#E74C3C', 'Super Hard': '#9B59B6' };

        const buildPage = (page) => {
            cardItems.forEach(item => container.remove(item, true));
            cardItems = [];

            const levels = window.LEVELS || [];
            const total = Math.ceil(levels.length / LEVELS_PER_PAGE);
            pageText.setText(total > 1 ? `${page + 1} / ${total}` : '');
            prevText.setAlpha(page > 0 ? 1 : 0.3);
            nextText.setAlpha(page < total - 1 ? 1 : 0.3);

            const startIdx = page * LEVELS_PER_PAGE;
            const endIdx   = Math.min(startIdx + LEVELS_PER_PAGE, levels.length);

            for (let i = startIdx; i < endIdx; i++) {
                const level = levels[i];
                const local = i - startIdx;
                const col   = local % 2;
                const row   = Math.floor(local / 2);
                const x = cardAreaLeft + col * (cardW + 10);
                const y = cardAreaTop  + row * (cardH + 10);
                const isCurrent = i === (this.gameScene?.currentLevel || 0);
                const diffBgColor  = DIFF_BG[level.difficulty]  || 0x2A2A3A;
                const diffHexColor = DIFF_HEX[level.difficulty] || '#AAAACC';

                // Card background
                const cardBg = this.add.graphics();
                cardBg.fillStyle(isCurrent ? 0x2C2A48 : 0x22222E, 1);
                cardBg.fillRoundedRect(x, y, cardW, cardH, 10);
                if (isCurrent) {
                    cardBg.lineStyle(2, 0x7B6CF6, 1);
                    cardBg.strokeRoundedRect(x, y, cardW, cardH, 10);
                }
                // Difficulty colour stripe (left edge, 5px wide)
                cardBg.fillStyle(diffBgColor, 1);
                cardBg.fillRoundedRect(x, y, 5, cardH, { tl: 10, tr: 0, bl: 10, br: 0 });
                container.add(cardBg);
                cardItems.push(cardBg);

                // If current, pulse the card border
                if (isCurrent) {
                    this.tweens.add({
                        targets: cardBg, alpha: { from: 0.65, to: 1 },
                        duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                    });
                }

                const numTxt = this.add.text(x + cardW / 2 + 3, y + 26, `Level ${level.id}`, {
                    fontFamily: 'Outfit', fontSize: '15px', fontStyle: 'bold',
                    color: isCurrent ? '#C8C0FF' : '#FFFFFF', resolution: 2,
                }).setOrigin(0.5);
                container.add(numTxt);
                cardItems.push(numTxt);

                const dTxt = this.add.text(x + cardW / 2 + 3, y + 50, level.difficulty, {
                    fontFamily: 'Outfit', fontSize: '11px', fontStyle: 'bold',
                    color: diffHexColor, resolution: 2,
                }).setOrigin(0.5);
                container.add(dTxt);
                cardItems.push(dTxt);

                // Star indicators (current = 1 star lit, else empty)
                const starStr   = isCurrent ? '★☆☆' : '☆☆☆';
                const starColor = isCurrent ? '#F1C40F' : '#33334A';
                const starTxt = this.add.text(x + cardW / 2 + 3, y + cardH - 14, starStr, {
                    fontFamily: 'Outfit', fontSize: '13px', color: starColor, resolution: 2,
                }).setOrigin(0.5);
                container.add(starTxt);
                cardItems.push(starTxt);

                const zone = this.add.zone(x + cardW / 2, y + cardH / 2, cardW, cardH)
                    .setInteractive({ useHandCursor: true });
                const idx = i;
                zone.on('pointerdown', () => {
                    this._closeModal(container, () => this.gameScene.selectLevel(idx));
                });
                this._addBtnPress(zone, cardBg);
                container.add(zone);
                cardItems.push(zone);
            }
        };

        buildPage(0);

        this.levelSelectModal = {
            container,
            setPage:  (page) => { currentPage = page; buildPage(page); },
            rebuild:  () => buildPage(currentPage),
        };
    }

    // ─── Event Listeners ────────────────────────────────────────

    setupEventListeners() {
        const gs = this.gameScene;
        if (!gs) return;

        gs.events.on('stateChange', (newState) => {
            if (newState === 'WIN') {
                this.cleanupText.setVisible(false);
                this.tweens.killTweensOf(this.cleanupText);
                // Let the win flash/shake/star-burst payoff (triggered right after this
                // listener returns) play out before the modal dims the screen.
                this.time.delayedCall(1100, () => this._showWinModal());
            } else if (newState === 'LOSE') {
                this.time.delayedCall(3000, () => this._openLoseModal());
            } else if (newState === 'CLEANUP') {
                this.cleanupText.setVisible(true);
                this.tweens.add({
                    targets: this.cleanupText,
                    scale: { from: 0.8, to: 1.1 },
                    alpha: { from: 0.7, to: 1 },
                    duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                });
            }
        });

        gs.events.on('boosterUsed', (type, remaining) => {
            const btn = this.boosterBtns[type];
            if (!btn) return;
            btn.badge.setText(`${remaining}`);
            btn.badge.setStyle({ backgroundColor: remaining > 0 ? '#E74C3C' : '#555566' });
            const base = remaining > 0 ? 1 : 0.4;
            btn._baseAlpha = base;
            btn.bg.setAlpha(base);
            btn.icon?.setAlpha(base);
        });
    }

    update() {
        this.updateConveyorBar();
        this._updateBoosterStates();
        const pct = this.gameScene?.conveyor?.getLoadPercent() ?? 0;
        if (pct >= CONFIG.CONV_DANGER) window.SoundMgr?.conveyorWarn();
    }
};




// ============================================================
// Block Blast Flow! — Main Entry Point
// Initializes Phaser 3 game with Matter.js physics
// ============================================================

window.addEventListener('load', () => {
    if (!window.Phaser) {
        const container = document.getElementById('game-container');
        if (container) {
            container.textContent = 'Unable to load the game engine.';
        }
        console.error('Phaser failed to load.');
        return;
    }

    const config = {
        type: Phaser.AUTO,
        width: CONFIG.GAME_WIDTH,
        height: CONFIG.GAME_HEIGHT,
        parent: 'game-container',
        backgroundColor: THEME.BG_CSS,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.NO_CENTER,
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: { y: CONFIG.GRAVITY_Y },
                debug: false,
            },
        },
        scene: [BootScene, LoadingScene, HomeScene, GameScene, UIScene],
    };

    window.game = new Phaser.Game(config);
});



