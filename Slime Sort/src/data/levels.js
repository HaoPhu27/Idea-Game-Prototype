// src/data/levels.js
//
// TRAY SCRIPT RULES:
//   - Mỗi Tray có 3 slot. Fill đủ 3 slime cùng màu → harvest → pop event tiếp theo từ script.
//   - tray_script[0..2] = setup ban đầu cho 3 slot.
//   - Events[3+] = replacement sau mỗi harvest, theo đúng thứ tự harvest sẽ xảy ra.
//   - Tổng events = 3 (setup) + totalHarvests.  totalHarvests = totalSlime / 3.
//   - Điều kiện Win: tất cả tube rỗng + conveyor rỗng + script hết + không tray nào còn chỗ trống.
//   - { slot, color: null } = tray unable (khoá).
//   - Tray có color ≠ null nhưng state = unable: player phải click để mở khoá.

export const levels = [

    // =========================================================
    // LEVEL 1 — Tutorial 1: Cực đơn giản
    // 2 màu (R, G), 3 slime mỗi màu = 6 tổng → 2 harvests
    // Tray events: 3 setup + 2 replacements = 5 events
    //
    // Cách thắng: Đổ tube0 xuống conveyor → R dock slot0.
    //             Đổ tube1 xuống conveyor → G dock slot1. Win!
    // =========================================================
    {
        id: "tut_1",
        name: "Tutorial 1",
        metadata: { K: 2, E: 1, C: 5 },
        tubes: [
            ['R', 'R', 'R'],   // top = R×3
            ['G', 'G', 'G'],   // top = G×3
            [],                // empty buffer
        ],
        tray_script: [
            { slot: 0, color: 'R' },   // setup
            { slot: 1, color: 'G' },   // setup
            { slot: 2, color: null },  // setup — khoá
            // 2 replacements
            { slot: 0, color: null },  // h1: R→slot0 xong → khoá
            { slot: 1, color: null },  // h2: G→slot1 xong → khoá
        ]
    },

    // =========================================================
    // LEVEL 2 — Tutorial 2: Mỗi tube 2 màu, cần đổ đúng thứ tự
    // 2 màu (R, G), 6 slime mỗi màu = 12 tổng → 4 harvests
    // Tray events: 3 setup + 4 replacements = 7 events
    //
    // Cách thắng:
    //   Pour tube0 (top=R×3) → dock slot0(R) → harvest. slot0 → G
    //   Pour tube1 (top=G×3) → dock slot1(G) → harvest. slot1 → R
    //   Pour tube0 (còn G×3) → dock slot0(G) → harvest. slot0 → null
    //   Pour tube1 (còn R×3) → dock slot1(R) → harvest. slot1 → null. Win!
    // =========================================================
    {
        id: "tut_2",
        name: "Tutorial 2",
        metadata: { K: 2, E: 2, C: 5 },
        tubes: [
            ['G', 'G', 'G', 'R', 'R', 'R'],  // top = R×3, rồi G×3
            ['R', 'R', 'R', 'G', 'G', 'G'],  // top = G×3, rồi R×3
            [],
        ],
        tray_script: [
            { slot: 0, color: 'R' },   // setup
            { slot: 1, color: 'G' },   // setup
            { slot: 2, color: null },  // setup — khoá
            // 4 replacements
            { slot: 0, color: 'G' },   // h1: R→slot0 → slot0 thành G
            { slot: 1, color: 'R' },   // h2: G→slot1 → slot1 thành R
            { slot: 0, color: null },  // h3: G→slot0 xong → khoá
            { slot: 1, color: null },  // h4: R→slot1 xong → khoá
        ]
    },

    // =========================================================
    // LEVEL 3 — Tutorial 3: 3 màu, tube chồng sạch
    // 3 màu (R, G, B), 6 slime mỗi màu = 18 tổng → 6 harvests
    // Tray events: 3 setup + 6 replacements = 9 events
    //
    // Cách thắng:
    //   Pour tube0 (top=R×3) → slot0(R) → harvest. slot0→G
    //   Pour tube1 (top=G×3) → slot1(G) → harvest. slot1→B
    //   Pour tube2 (top=B×3) → slot2(B) → harvest. slot2→R
    //   Pour tube0 (còn B×3) → slot2(R)? KHÔNG. slot0=G,slot1=B,slot2=R. B → slot1(B). harvest. slot1→null
    //   Pour tube1 (còn R×3) → slot2(R) → harvest. slot2→null
    //   Pour tube2 (còn G×3) → slot0(G) → harvest. slot0→null. Win!
    // =========================================================
    {
        id: "tut_3",
        name: "Tutorial 3",
        metadata: { K: 3, E: 1, C: 6 },
        tubes: [
            ['B', 'B', 'B', 'R', 'R', 'R'],  // top = R×3, rồi B×3
            ['R', 'R', 'R', 'G', 'G', 'G'],  // top = G×3, rồi R×3  (Note: index 0 = bottom)
            ['G', 'G', 'G', 'B', 'B', 'B'],  // top = B×3, rồi G×3
            [],
        ],
        tray_script: [
            { slot: 0, color: 'R' },   // setup
            { slot: 1, color: 'G' },   // setup
            { slot: 2, color: 'B' },   // setup
            // 6 replacements
            { slot: 0, color: 'G' },   // h1: R→slot0 → slot0 thành G
            { slot: 1, color: 'B' },   // h2: G→slot1 → slot1 thành B
            { slot: 2, color: 'R' },   // h3: B→slot2 → slot2 thành R
            { slot: 1, color: null },  // h4: B→slot1(B) xong → khoá
            { slot: 2, color: null },  // h5: R→slot2(R) xong → khoá
            { slot: 0, color: null },  // h6: G→slot0(G) xong → khoá. Win!
        ]
    },

    // =========================================================
    // LEVEL 4 — Tutorial 4: 3 màu, tubes 9 slime, cần unlock tray
    // 3 màu (R, G, B), 9 slime mỗi màu = 27 tổng → 9 harvests
    // Tray events: 3 setup + 9 replacements = 12 events
    // slot2 bắt đầu là UNABLE (khoá B), player cần click để mở
    //
    // Cách thắng: Mỗi lần pour 3 slime cùng màu. Rotate slot0→R,slot1→G,slot2→B.
    //   Mỗi màu harvest 3 lần, lần cuối slot về null. Win!
    // =========================================================
    {
        id: "tut_4",
        name: "Tutorial 4",
        metadata: { K: 3, E: 1, C: 6 },
        tubes: [
            ['B', 'B', 'B', 'G', 'G', 'G', 'R', 'R', 'R'],  // top=R×3
            ['R', 'R', 'R', 'B', 'B', 'B', 'G', 'G', 'G'],  // top=G×3
            ['G', 'G', 'G', 'R', 'R', 'R', 'B', 'B', 'B'],  // top=B×3
            [],
        ],
        tray_script: [
            { slot: 0, color: 'R' },     // setup
            { slot: 1, color: 'G' },     // setup
            { slot: 2, color: 'B' },     // setup — KHOÁ (player click để mở)
            // 9 replacements
            { slot: 0, color: 'R' },     // h1: R→slot0 → giữ R
            { slot: 1, color: 'G' },     // h2: G→slot1 → giữ G
            { slot: 2, color: 'B' },     // h3: B→slot2 → giữ B
            { slot: 1, color: 'G' },     // h4: G→slot1 → giữ G
            { slot: 2, color: 'B' },     // h5: B→slot2 → giữ B
            { slot: 0, color: 'R' },     // h6: R→slot0 → giữ R
            { slot: 2, color: null },    // h7: B→slot2 xong → khoá
            { slot: 0, color: null },    // h8: R→slot0 xong → khoá
            { slot: 1, color: null },    // h9: G→slot1 xong → khoá. Win!
        ]
    },

    // =========================================================
    // LEVEL 5 — Tutorial 5: 4 màu, 6 tubes, cần unlock Y tray
    // 4 màu (R, G, B, Y), 9 slime mỗi màu = 36 tổng → 12 harvests
    // Tray events: 3 setup + 12 replacements = 15 events
    // slot2 khoá Y. slot1 handle G rồi chuyển sang B sau khi G xong.
    //
    // Pour order: tube0(R), tube1(G), tube3(Y), tube4(R), tube2(G), tube3(B-bottom),
    //             tube4(B), tube1(R), tube5(G), tube0(Y), tube5(Y), tube2(B)
    // =========================================================
    {
        id: "tut_5",
        name: "Tutorial 5",
        metadata: { K: 4, E: 1, C: 6 },
        tubes: [
            ['Y', 'Y', 'Y', 'R', 'R', 'R'],  // top=R×3, rồi Y×3
            ['R', 'R', 'R', 'G', 'G', 'G'],  // top=G×3, rồi R×3
            ['B', 'B', 'B', 'G', 'G', 'G'],  // top=G×3, rồi B×3
            ['B', 'B', 'B', 'Y', 'Y', 'Y'],  // top=Y×3, rồi B×3
            ['B', 'B', 'B', 'R', 'R', 'R'],  // top=R×3, rồi B×3
            ['Y', 'Y', 'Y', 'G', 'G', 'G'],  // top=G×3, rồi Y×3
            [],
        ],
        tray_script: [
            { slot: 0, color: 'R' },     // setup
            { slot: 1, color: 'G' },     // setup
            { slot: 2, color: 'Y' },     // setup — KHOÁ (click để mở)
            // 12 replacements. Harvest order: R,G,Y,R,G,Y,R,G,B,B,B,Y
            { slot: 0, color: 'R' },     // h1: R→slot0 → giữ R
            { slot: 1, color: 'G' },     // h2: G→slot1 → giữ G
            { slot: 2, color: 'Y' },     // h3: Y→slot2 → giữ Y
            { slot: 0, color: 'R' },     // h4: R→slot0 → giữ R
            { slot: 1, color: 'G' },     // h5: G→slot1 → giữ G
            { slot: 2, color: 'Y' },     // h6: Y→slot2 → giữ Y
            { slot: 0, color: null },    // h7: R→slot0 xong → khoá
            { slot: 1, color: 'B' },     // h8: G→slot1 xong → slot1 thành B
            { slot: 1, color: 'B' },     // h9: B→slot1 → giữ B
            { slot: 1, color: 'B' },     // h10: B→slot1 → giữ B
            { slot: 1, color: null },    // h11: B→slot1 xong → khoá
            { slot: 2, color: null },    // h12: Y→slot2 xong → khoá. Win!
        ]
    },

{
        id: "level_6",
        name: "Level 6",
        metadata: { K: 3, E: 1, C: 6 },
        tubes: [
            ['R', 'B', 'B', 'G', 'G'],
            ['G', 'G'],
            ['R', 'R', 'R', 'R', 'R'],
            ['G', 'G', 'B', 'B', 'B', 'B'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'B' },
            { slot: 2, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_7",
        name: "Level 7",
        metadata: { K: 3, E: 2, C: 6 },
        tubes: [
            ['G', 'G', 'G', 'R', 'R'],
            ['R', 'R', 'B', 'B'],
            ['B', 'R', 'R', 'B', 'B', 'B'],
            ['G', 'G'],
            ['G'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'G' },
            { slot: 2, color: 'R' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_8",
        name: "Level 8",
        metadata: { K: 3, E: 1, C: 9 },
        tubes: [
            ['R', 'B', 'B', 'B', 'B', 'B'],
            ['G', 'R', 'R', 'R'],
            ['R', 'G', 'G', 'G', 'G', 'G', 'B', 'B', 'B'],
            ['G', 'G', 'G', 'R', 'R', 'B', 'R', 'R'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'B' },
            { slot: 2, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_9",
        name: "Level 9",
        metadata: { K: 4, E: 2, C: 6 },
        tubes: [
            ['R', 'R', 'R', 'Y'],
            ['G', 'G', 'R'],
            [],
            ['R', 'R', 'G', 'B', 'B'],
            ['Y', 'Y', 'G', 'G', 'B', 'B'],
            ['G', 'B', 'B', 'Y', 'Y', 'Y'],
        ],
        tray_script: [
            { slot: 0, color: 'B' },
            { slot: 1, color: 'Y' },
            { slot: 2, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'R' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_10",
        name: "Level 10",
        metadata: { K: 4, E: 1, C: 9 },
        tubes: [
            ['R', 'B', 'G', 'Y', 'Y', 'B', 'B', 'B', 'G'],
            ['B', 'G', 'R', 'R', 'B', 'B'],
            ['Y', 'Y', 'R', 'G', 'G', 'Y', 'G', 'G'],
            ['Y', 'G', 'G', 'R', 'R', 'B', 'Y'],
            ['R', 'R', 'R', 'B', 'Y', 'Y'],
        ],
        tray_script: [
            { slot: 0, color: 'B' },
            { slot: 1, color: 'G' },
            { slot: 2, color: 'Y' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_11",
        name: "Level 11",
        metadata: { K: 5, E: 2, C: 6 },
        tubes: [
            ['Y', 'R', 'R', 'Y', 'Y', 'G'],
            ['G', 'P', 'P', 'B', 'R'],
            ['G', 'G', 'R', 'G', 'G', 'Y'],
            ['Y'],
            ['P', 'B', 'B', 'B', 'B'],
            ['R', 'R'],
            ['B', 'P', 'P', 'P', 'Y'],
        ],
        tray_script: [
            { slot: 0, color: 'B' },
            { slot: 1, color: 'G' },
            { slot: 2, color: 'P' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_12",
        name: "Level 12",
        metadata: { K: 4, E: 1, C: 9 },
        tubes: [
            ['B', 'B', 'G', 'Y', 'Y'],
            ['B', 'G', 'G', 'G', 'B', 'G', 'G', 'Y', 'Y'],
            ['B', 'R', 'R', 'Y', 'R', 'B', 'B'],
            ['Y', 'Y', 'Y', 'Y', 'R', 'R', 'B'],
            ['R', 'R', 'R', 'R', 'G', 'B', 'G', 'G'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'R' },
            { slot: 2, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_13",
        name: "Level 13",
        metadata: { K: 5, E: 2, C: 6 },
        tubes: [
            ['R', 'B'],
            ['Y'],
            ['B', 'P', 'P', 'G'],
            ['R', 'P', 'P', 'R', 'R'],
            ['P', 'P', 'Y', 'Y', 'G', 'G'],
            ['B', 'B', 'R', 'R', 'Y', 'B'],
            ['G', 'G', 'Y', 'Y', 'B', 'G'],
        ],
        tray_script: [
            { slot: 0, color: 'R' },
            { slot: 1, color: 'R' },
            { slot: 2, color: 'B' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'P' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_14",
        name: "Level 14",
        metadata: { K: 5, E: 2, C: 6 },
        tubes: [
            ['G', 'P', 'B', 'R', 'Y'],
            ['B', 'B', 'G'],
            ['P', 'P', 'Y', 'Y', 'Y', 'B'],
            ['B', 'B', 'G', 'G', 'P'],
            ['R', 'R', 'G', 'G'],
            ['Y', 'P', 'P', 'Y'],
            ['R', 'R', 'R'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'Y' },
            { slot: 2, color: 'P' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_15",
        name: "Level 15",
        metadata: { K: 5, E: 1, C: 9 },
        tubes: [
            ['P', 'R', 'R', 'B', 'B'],
            ['Y', 'Y', 'B', 'B', 'B', 'G', 'G', 'R', 'R'],
            ['P', 'B', 'B', 'Y', 'Y', 'G', 'G', 'P', 'P'],
            ['P', 'P', 'P', 'R', 'R', 'Y', 'Y', 'Y'],
            ['R', 'P', 'P', 'B', 'B', 'Y', 'Y', 'R', 'R'],
            ['G', 'G', 'G', 'G', 'G'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'P' },
            { slot: 2, color: 'B' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_16",
        name: "Level 16",
        metadata: { K: 6, E: 1, C: 9 },
        tubes: [
            ['P', 'Y', 'O', 'G', 'O', 'G', 'O', 'P', 'O'],
            ['B', 'Y', 'R', 'P', 'Y', 'R', 'B', 'R', 'G'],
            ['Y', 'B', 'P', 'B', 'Y', 'O', 'Y', 'G', 'P'],
            ['R', 'B', 'O', 'G', 'Y'],
            ['B', 'O', 'O', 'G', 'P', 'R'],
            ['Y', 'B', 'G', 'R', 'P', 'P', 'G', 'R', 'G'],
            ['P', 'R', 'R', 'B', 'O', 'Y', 'B'],
        ],
        tray_script: [
            { slot: 0, color: 'O' },
            { slot: 1, color: 'Y' },
            { slot: 2, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_17",
        name: "Level 17",
        metadata: { K: 6, E: 2, C: 6 },
        tubes: [
            ['R', 'Y', 'G', 'O', 'O'],
            ['Y', 'R'],
            ['G', 'P', 'P'],
            ['B', 'B', 'O', 'G'],
            ['P', 'P', 'G', 'P', 'B', 'G'],
            ['B', 'O', 'G', 'R', 'Y', 'P'],
            ['Y', 'O', 'Y', 'R', 'O', 'R'],
            ['B', 'R', 'B', 'Y'],
        ],
        tray_script: [
            { slot: 0, color: 'Y' },
            { slot: 1, color: 'G' },
            { slot: 2, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'B' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_18",
        name: "Level 18",
        metadata: { K: 5, E: 1, C: 9 },
        tubes: [
            ['B', 'G', 'B', 'R', 'G', 'B', 'B', 'R'],
            ['R', 'G', 'Y', 'B', 'Y', 'Y', 'R', 'P', 'P'],
            ['R', 'R', 'P', 'G', 'R', 'P', 'B', 'Y'],
            ['Y', 'P', 'R', 'G', 'G', 'P'],
            ['B', 'Y', 'Y', 'G', 'G'],
            ['P', 'R', 'B', 'G', 'P', 'P', 'Y', 'Y', 'B'],
        ],
        tray_script: [
            { slot: 0, color: 'B' },
            { slot: 1, color: 'B' },
            { slot: 2, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_19",
        name: "Level 19",
        metadata: { K: 5, E: 1, C: 9 },
        tubes: [
            ['Y', 'G', 'B', 'Y', 'P', 'B'],
            ['Y', 'Y', 'R', 'P', 'P', 'G'],
            ['R', 'Y', 'R', 'P', 'R', 'G', 'Y', 'G', 'R'],
            ['P', 'P', 'R', 'R', 'G', 'B', 'B', 'B', 'B'],
            ['B', 'Y', 'Y', 'G', 'P', 'G', 'B', 'R'],
            ['G', 'B', 'Y', 'R', 'G', 'P', 'P'],
        ],
        tray_script: [
            { slot: 0, color: 'G' },
            { slot: 1, color: 'R' },
            { slot: 2, color: 'Y' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'P' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    },

    {
        id: "level_20",
        name: "Level 20",
        metadata: { K: 6, E: 1, C: 9 },
        tubes: [
            ['B', 'O', 'R', 'R', 'P', 'R', 'Y', 'O', 'R'],
            ['B', 'Y', 'B', 'G', 'Y', 'G', 'P'],
            ['Y', 'O', 'G', 'G', 'P'],
            ['B', 'R', 'Y', 'P', 'B', 'O', 'B', 'R', 'B'],
            ['R', 'Y', 'G', 'O', 'P', 'G', 'G'],
            ['P', 'O', 'R', 'P', 'P', 'Y', 'G', 'R', 'B'],
            ['Y', 'P', 'O', 'B', 'Y', 'O', 'O', 'G'],
        ],
        tray_script: [
            { slot: 0, color: 'R' },
            { slot: 1, color: 'B' },
            { slot: 2, color: 'B' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'R' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'O' },
            { slot: 0, color: 'P' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'Y' },
            { slot: 0, color: 'G' },
            { slot: 0, color: 'B' },
            { slot: 0, color: 'P' },
            { slot: 0, color: null },
            { slot: 0, color: null },
            { slot: 0, color: null },
        ]
    }
];
