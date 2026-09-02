# Thuật toán sinh level đảm bảo giải được — Goods Sort (Tray & Conveyor)

Thay thế cho `LevelGenerator.js` + `Solver.js` hiện tại. Viết theo đúng data model trong GDD v0.4: Thùng 3 ô phẳng, Grid mở, không ràng buộc loại, Tray 1 slot, conveyor oval.

```
src/generator/SolvableLevelGenerator.js   sinh level
src/generator/Solver.js                   mô phỏng luật + IDA* + hint
tools/selftest.js                         bộ kiểm chứng (node tools/selftest.js)
tools/demo.js                             in thử 1 level (node tools/demo.js 9)
```

---

## 1. Nguyên lý: sinh ngược từ trạng thái thắng

Vấn đề của GDD 8.2 là **hướng của bài toán**, không phải sức mạnh của solver. Sinh trước rồi tìm lời giải là O(b^d) với b rất lớn (Grid mở + không ràng buộc loại ⇒ hàng trăm nước đi hợp lệ mỗi lượt). Nên BFS chết, nên solver bị skip.

Đảo ngược lại:

```
S₀ = trạng thái THẮNG:  S Thùng, mỗi Thùng = 1 bộ 3 item cùng loại  +  E Thùng rỗng
        │  áp dụng K nước đi NGƯỢC hợp lệ
        ▼
S_K = trạng thái xuất phát của level

Lời giải forward = chính dãy đó đảo chiều:  S_K → S_{K−1} → … → S₀
```

Solvability trở thành **bất biến của cấu trúc**, không còn là kết quả của tìm kiếm. Chi phí sinh: **O(K)**. Đo được: **0.07–0.43 ms/level** (xem mục 5).

### Bất biến an toàn — chỗ dễ sai nhất

Trong game thật, Thùng đủ 3 item cùng loại sẽ **tự động wrapped và khoá cứng**. Nếu lúc scramble ta vô tình tạo ra một Thùng 3-cùng-loại ngoài ý muốn, thì khi replay forward, Thùng đó wrap sớm và chặn mất nước đi kế tiếp — lời giải gãy.

Bất biến bắt buộc:

> Sau **mỗi** nước đi ngược, Thùng duy nhất được phép là 3-cùng-loại là Thùng "pristine" (Thùng gốc chưa hề bị đụng tới).

Cài trong `tryReverse()`. Đây là lý do hàm này từ chối một số nước đi và generator phải retry (trung bình 0.0–0.1 lần retry/level).

### Bẫy thứ hai: index không tái dùng được

`push()` luôn đặt item vào **cuối** mảng, còn `splice()` lấy ra ở **giữa**. Nên sau khi đảo chiều, thứ tự bên trong từng Thùng có thể khác trạng thái gốc — dù nội dung, xét như multiset, thì giống hệt. Vì các item cùng `itemId` hoàn toàn tương đương nhau, `materializeSolution()` giải lại index tại thời điểm chạy bằng `indexOf(itemId)`. (Bug này bị `selftest.js` bắt được, không phải suy đoán.)

### Điều kiện Thua tự động được thoả

Trên đường S_K → S₀, mỗi bước đều tồn tại ít nhất một ô trống — chính ô vừa được tạo ra ở Thùng đích. Nên `hasEmptySlots` luôn true, người chơi không bao giờ bị engine tuyên Thua giữa chừng khi đi theo lời giải tham chiếu.

---

## 2. Tham số điều chỉnh độ khó

```js
import { generateLevel } from './src/generator/SolvableLevelGenerator.js';

const level = generateLevel({
  seed: 1234,
  numBoxes: 8,
  numEmptyBoxes: 1,
  numCategories: 3,
  itemTypesPerCategory: 3,
  ratio21: 0.4,
  extraScramble: 0.5,
  trayOrder: 'shuffled',
  moveLimitSlack: 1.25,
});
```

### Quy mô bàn chơi

| Tham số | Mặc định | Tác dụng |
|---|---|---|
| `numBoxes` | 6 | Tổng số Thùng |
| `numSets` | `numBoxes − numEmptyBoxes` | Số bộ 3 item = **số Tray**. Giảm xuống để bàn thoáng hơn |
| `numEmptyBoxes` | 1 | Số Thùng rỗng hoàn toàn lúc bắt đầu. Luật cứng ≥ 1 |
| `numCategories` | 2 | 1–4 |
| `itemTypesPerCategory` | 2 | 1–3 |
| `maxSetsPerType` | 3 | Một loại item được chiếm tối đa mấy bộ (⇒ mấy Tray) |

### Độ khó lõi

| Tham số | Dải | Tác dụng |
|---|---|---|
| **`ratio21`** | 0.0–1.0, mặc định **0.60** | Tỉ lệ bộ kiểu "2+1" (2 item chung Thùng, 1 tách ra → 1 nước để gom). Phần còn lại là "1+1+1" (3 Thùng khác nhau → 2 nước). **1.0 = dễ nhất, 0.0 = khó nhất.** Giá trị 0.60 lấy từ phân tích 4501 level (60.3%/39.7%) |
| `extraScramble` | 0.0–2.0, mặc định 0 | Hệ số nước đi ngược bổ sung. Không làm tăng cận dưới lý thuyết nhưng làm bàn "bẩn" hơn và ép người chơi đi đường vòng |
| `compactFreeSlots` | `true` | `true` → dồn hết ô trống vào đúng các Thùng rỗng, mọi Thùng có item đều **đầy** (chật, khó). `false` → để lỗ rải rác (thoáng, dễ) |

Vì tổng ô trống F = 3(N − S) là bất biến và luôn là bội của 3, **cách duy nhất để nới không gian xoay xở là giảm `numSets` xuống dưới `numBoxes − numEmptyBoxes`**, không phải chỉnh một tỉ lệ phần trăm.

### Tầng Tray / Conveyor

| Tham số | Mặc định | Tác dụng |
|---|---|---|
| `trayMatchMode` | `'category'` | `'category'` = luật hiện tại. `'itemType'` = khớp UI, chặt hơn (xem cross-check 2.1) |
| `trayOrder` | `'wrapOrder'` | `'wrapOrder'` = thứ tự Tray trùng thứ tự wrap tự nhiên → giao ngay, không phải giữ. `'shuffled'` / `'reverse'` = phải ôm nhiều Thùng wrapped chờ → khó hơn |
| `conveyorMaxActive` | 4 | Số Tray hiện cùng lúc |

### Áp lực meta — thứ GDD đang thiếu

| Tham số | Mặc định | Tác dụng |
|---|---|---|
| `moveLimitSlack` | `null` | `null` = không giới hạn. `1.8` = dễ, `1.10` = rất chặt. `moveLimit = ceil(refMoves × slack)` |
| `secondsPerMove` | `null` | `timeToPlay = round((refMoves × secondsPerMove + 20) / 5) × 5` |
| `undoCount` | 3 | |

Neo vào `refMoves` — con số generator **biết chính xác** — chứ không vào hồi quy R²=0.15 của plan.

### Preset & lộ trình theo level

```js
generateLevelFromPreset('hard', { seed: 42 });
generateLevel(configForLevelNumber(37));   // thay cho UIManager.startNewLevel()
```

`configForLevelNumber` tăng dần theo thứ tự: số Thùng → số category → `ratio21` giảm → `extraScramble` tăng → `trayOrder` nghịch → `moveLimit` siết → `trayMatchMode: 'itemType'` từ level 40.

---

## 3. Output

```jsonc
{
  "boxes":  [{ "id": "box_0", "items": ["bear","pizza"], "maxSize": 3 }, ...],
  "trays":  [{ "id": "tray_0", "queueIndex": 0, "categoryId": "food",
               "targetItemId": "pizza", "emoji": "🍕", "matchMode": "category" }, ...],
  "conveyor": { "type": "oval", "maxActive": 4 },

  "referenceSolution": [{ "from": 3, "index": 2, "to": 0, "itemId": "pizza" }, ...],
  "solvable": true,
  "solvabilityProof": "reverse-construction + forward replay verified",

  "difficulty": {
    "refMoves": 10,        // độ dài lời giải tham chiếu (cận trên đảm bảo đạt được)
    "lowerBound": 8,       // Σ(số Thùng chứa loại t − số bộ của t) — cận dưới admissible
    "optimalMoves": 9,     // IDA* thật, chỉ tính khi level đủ nhỏ
    "freeSlots": 3,
    "avgSpread": 2.33,     // 2.0 = toàn 2+1, 3.0 = toàn 1+1+1
    "mixedBoxRatio": 1,
    "categoryConfusion": 2,
    "maxWrappedHeld": 1,   // số Thùng wrapped phải ôm cùng lúc nhiều nhất
    "components": { "volume": 0.25, "pressure": 0.278, "interleave": 1,
                    "confusion": 0.667, "trayBacklog": 0.25 },
    "score": 41            // 1..100
  },
  "rules": { "moveLimit": 18, "timeToPlay": null, "undoCount": 3 }
}
```

`score` là tổ hợp có trọng số của 5 thành phần đã chuẩn hoá về [0,1]: `0.38·volume + 0.27·pressure + 0.15·interleave + 0.10·confusion + 0.10·trayBacklog`. **Trọng số là giả định thiết kế** — hiệu chỉnh lại khi có telemetry thật (tỉ lệ fail, số nước đi trung bình của người chơi).

---

## 4. Tích hợp vào code hiện tại

Trong `LevelGenerator.js`, bỏ vòng `while (!levelData && attempts < 1)` và lời gọi Solver, thay bằng:

```js
import { generateLevel, configForLevelNumber } from './SolvableLevelGenerator.js';

export function generate(currentLevel) {
  const lvl = generateLevel(configForLevelNumber(currentLevel));
  return {
    boxes:      lvl.boxes,
    trays:      lvl.trays,
    conveyorType: lvl.conveyor.type,
    difficulty: lvl.difficulty,   // thay cho { minMoves: 0 }
    rules:      lvl.rules,
    _solution:  lvl.referenceSolution,  // giữ lại cho hint / QA
  };
}
```

Ba thứ dùng được ngay:

- **Hệ thống gợi ý**: `solveConstructive(state)` cho lời giải ≤ 4S nước từ **bất kỳ** trạng thái nào người chơi đang ở, chạy O(S). Không cần `_solution`, không freeze UI. Đây cũng là lưới an toàn nếu về sau bạn thêm mechanics phá vỡ đảm bảo (item ẩn, Thùng khoá).
- **Undo/booster định giá được**: `moveLimit − refMoves` là biên độ sai sót cho phép, biết trước.
- **QA hồi quy**: `simulate(state, moves)` mô phỏng đúng luật `GameEngine`/`Box`, dùng làm test cho chính engine.

---

## 5. Kết quả kiểm chứng (`node tools/selftest.js`)

Toàn bộ số dưới đây là output thật, không phải ước lượng.

### Sinh level + replay lời giải qua mô phỏng đúng luật engine

| Preset | Thành công | Nước đi TB | Dải | Score TB | Retry TB | Thời gian sinh |
|---|---|---|---|---|---|---|
| tutorial | 400/400 | 2.1 | 2–3 | 17 | 0.0 | 0.15 ms |
| easy | 400/400 | 5.4 | 5–7 | 26 | 0.0 | 0.12 ms |
| normal | 400/400 | 9.7 | 9–10 | 41 | 0.1 | 0.24 ms |
| hard | 400/400 | 21.5 | 20–22 | 64 | 0.1 | 0.43 ms |
| expert | 400/400 | 35.5 | 34–36 | 88 | 0.1 | 0.30 ms |

Mỗi level còn được kiểm: không có Thùng wrapped sẵn, không xuất phát ở trạng thái Thua, đủ số Thùng rỗng, mọi loại item có số lượng chia hết 3, số Tray = số bộ, mọi Tray đều được phục vụ.

### Đối chiếu với IDA* (150 level, 6 Thùng)

- 150/150 được IDA* xác nhận **có lời giải**, 0 trường hợp không kết luận được.
- Lời giải tham chiếu dài hơn tối ưu trung bình **1.31 nước** (24/150 trùng đúng tối ưu). Nên `refMoves` là cận trên chặt — dùng làm neo cho `moveLimit` là hợp lý.

### Lộ trình độ khó theo level

```
  lv | box sets cat  r21 | moves free held | score  moveLimit
   1 |  4    2   1  0.95 |   2.1  6.0  1.0 |    17  -
   5 |  5    3   2  0.78 |   4.3  6.0  1.0 |    22  8
   8 |  6    5   3  0.64 |   8.5  3.0  1.0 |    38  15
  12 |  8    7   4  0.46 |  12.7  3.0  1.4 |    46  23
  16 |  9    8   4  0.28 |  18.6  3.0  1.6 |    57  29
  20 | 10    9   4  0.15 |  25.6  3.0  1.9 |    71  38
  30 | 10    9   4  0.15 |  33.5  3.0  1.7 |    84  43
  45 | 10    9   4  0.15 |  46.6  3.0  2.9 |    95  49
  60 | 10    9   4  0.15 |  52.5  3.0  3.0 |    95  55
```

Bàn chơi chạm trần ở level ~20 (10 Thùng, 4 category — giới hạn của GDD 9.1/9.2). Từ đó trở đi độ khó chỉ còn đến từ `extraScramble`, `trayOrder` và `moveLimit`. Nếu muốn đường cong đi tiếp sau level 60, cần mở thêm nội dung: `itemTypesPerCategory: 3`, category thứ 5, hoặc mechanics mới.

### Stress test

| Cấu hình | Kết quả |
|---|---|
| 10 Thùng, 4 cat × 3 type, `ratio21 = 0` | 300/300 ✓ |
| `extraScramble = 2.0` | 300/300 ✓ |
| 3 Thùng rỗng, `compactFreeSlots = false` | 300/300 ✓ |
| `trayMatchMode: 'itemType'` + `trayOrder: 'reverse'` | 300/300 ✓ |
| Chỉ 2 loại item / 8 Thùng | 300/300 ✓ |
| 1 loại item / 5 Thùng (**bất khả thi**) | Báo lỗi ngay, có hướng sửa ✓ |

Cấu hình bất khả thi được chặn từ đầu bằng điều kiện đếm `3·⌈numSets/poolSize⌉ ≤ 2·numSets` — nếu mọi Thùng có item đều phải đầy thì một loại không được chiếm quá 2 ô trong một Thùng.

### Lời giải kiến thiết (định lý F ≥ 3)

3000 trạng thái ngẫu nhiên, N từ 6 đến 16:

| Cấu hình | Giải được | Nước đi TB | Max nước/bộ (cận lý thuyết 4.00) |
|---|---|---|---|
| N=6, S=5 | 500/500 | 8.4 | 2.60 |
| N=10, S=9 | 500/500 | 19.4 | 2.67 |
| N=16, S=15 | 500/500 | 35.2 | 2.80 |

Mọi lời giải đều được replay lại qua mô phỏng đúng luật engine. Áp lên chính level preset `expert`: 300/300 ✓.
