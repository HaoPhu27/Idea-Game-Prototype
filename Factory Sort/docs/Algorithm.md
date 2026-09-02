# Thuật toán sinh màn chơi — Factory Sort

> File này mô tả thuật toán **đang chạy thật** trong `src/generator/SolvableLevelGenerator.js`
> và `src/generator/Solver.js`. Phiên bản trước của tài liệu này mô tả một game khác
> (lưới cell nhiều layer, feeder column, wildcard, pool 609 item) — không có khái niệm nào
> trong số đó tồn tại trong prototype. Xem `GDD_GoodsSort_TrayConveyor_v2.md` cho luật chơi.

---

## 1. Luật chơi, tóm tắt vừa đủ để hiểu thuật toán

- Bàn chơi có `N` **Thùng** (Box). Mỗi Thùng có đúng **3 slot** (`boxCapacity = 3`).
- Item có thể chuyển sang **BẤT KỲ** Thùng nào còn slot trống — không giới hạn theo loại
  (đây là khác biệt lớn nhất so với Water Sort).
- Thùng đủ **3 item giống nhau** → `wrapped` → **khoá cứng**, không lấy item ra được nữa.
- Người chơi kéo Thùng `wrapped` lên **Khay** (Tray) đang chạy trên băng chuyền.
  Khay khớp theo **nhóm hàng** (`category`) hoặc theo **đúng loại item** (`itemType`),
  tuỳ `matchMode` của **từng** Khay.
- Thắng khi mọi bộ item đều đã được gói và giao hết.

Ký hiệu dùng xuyên suốt:

| Ký hiệu | Ý nghĩa |
|---|---|
| `N` | số Thùng (`numBoxes`) |
| `S` | số bộ item (`numSets`), mỗi bộ = 3 item cùng loại |
| `cap` | sức chứa Thùng = 3 |
| `F` | số slot trống = `3N − 3S` |

---

## 2. Ý tưởng cốt lõi: sinh ngược (Reverse Generation)

Sinh xuôi rồi kiểm tra bằng solver là cách làm sai ở đây: không gian trạng thái phân
nhánh rất rộng (mọi item đi được vào mọi Thùng còn chỗ), nên chi phí là `O(b^d)` cho
**mỗi** màn bị loại. Thay vào đó:

> Bắt đầu từ **trạng thái THẮNG**, đi `K` **nước đi ngược** hợp lệ. Trạng thái xuất phát
> của người chơi chính là kết quả cuối. Lời giải tham chiếu = danh sách nước đi ngược,
> **đảo thứ tự**.

Nhờ vậy **tính giải được trở thành bất biến cấu trúc**, không phải thứ phải đi kiểm tra:
chi phí là `O(K)`, và mỗi màn sinh ra đều kèm sẵn một lời giải.

### 2.1. Bất biến an toàn khi đi ngược

Một nước đi ngược `(from, index) → to` chỉ hợp lệ khi:

1. `from ≠ to`, `boxes[from]` không rỗng, `boxes[to]` còn chỗ.
2. **Nguồn không phải Thùng đã wrapped "giả"**: nếu `boxes[from]` đang là 3-cùng-loại
   *nhưng* không còn `pristine` (tức nó đã bị chạm tới trong quá trình xáo), thì khi
   replay xuôi nó đã bị khoá từ trước → không thể lấy item ra. Bị cấm.
3. **Đích không được thành 3-cùng-loại** sau khi nhận item — nếu không, khi replay xuôi
   nó sẽ `wrapped` sớm hơn dự định và các nước sau đó gãy.

Cờ `pristine[i]` = "Thùng `i` vẫn nguyên trạng như lúc ở trạng thái thắng". Chỉ Thùng
`pristine` mới được phép là 3-cùng-loại. Đây là toàn bộ lý do các màn sinh ra không bao
giờ có Thùng khoá sẵn lúc bắt đầu (`buildOnce` bước 6 kiểm tra lại lần cuối).

---

## 3. Định lý tính giải được

> Với `F = 3N − 3S` slot trống, nếu **`F ≥ 3`** thì bàn cờ **luôn** giải được trong
> **≤ 4S** nước đi.

**Chứng minh phác thảo (cũng chính là thuật toán `solveConstructive`):**

`F` là **bất biến** — nó không đổi qua mọi nước đi (item chỉ chuyển chỗ) *và* qua mọi lần
giao hàng (Thùng wrapped rời bàn mang theo 3 item + 3 slot). Với `F ≥ 3` luôn tồn tại ít
nhất một Thùng rỗng hoàn toàn hoặc đủ chỗ trống rải rác để làm vùng đệm:

1. **Dọn nhà** — chọn một Thùng đích cho mỗi loại; đẩy mọi item lạc sang vùng đệm.
2. **Gom** — kéo 3 item cùng loại về Thùng đích của nó → `wrapped` → giao đi → hoàn `F`.

Mỗi bộ tốn nhiều nhất 4 nước, nên cận trên `4S`. Đo thực tế: `N=16 S=15`, 500 seed →
giải được **500/500**, trung bình **35.2** nước, xấu nhất **2.80 nước/bộ**
(cận trên lý thuyết 4.00).

> ⚠️ **`F` là HẰNG SỐ trong đường cong đang ship.** Vì `numSets = numBoxes − 1` với
> `L ≥ 7`, ta có `F = 3` ở mọi level (và `F = 6` với `L ≤ 6`). Đây là lý do trục chấm
> điểm `pressure = parMoves / freeSlots` cũ bị thoái hoá thành bản sao tỉ lệ của trục
> khối lượng — nó đã bị gỡ bỏ, xem §7.

---

## 4. `buildOnce(cfg, rng)` — 7 bước

```
FUNCTION buildOnce(cfg, rng):

  # --- 1. Chọn loại item cho từng bộ ---
  cats = shuffle(CATEGORIES)[:numCategories]
  pool = flatten( shuffle(c.items)[:itemTypesPerCategory] for c in cats )
  # Rải đều: mỗi loại dùng <= maxSetsPerType lần, ưu tiên phủ hết pool trước
  setType = []
  FOR s in 0..S-1:
    eligible = [t in pool if usage[t] < maxSetsPerType]
    best     = argmin_usage(eligible)          # chọn ngẫu nhiên trong nhóm ít dùng nhất
    setType.push(pick(best)); usage[t] += 1

  # --- 2. Trạng thái THẮNG S_0 ---
  boxes    = [ [setType[s]] * 3  for s in 0..S-1 ] + [ [] ] * (N - S)
  pristine = [ i < S  for i in 0..N-1 ]

  # --- 3. Xáo tối thiểu: quyết định d cho từng bộ ---
  # d = 2  ->  kiểu "2+1"   (2 item chung Thùng, 1 tách ra)
  # d = 3  ->  kiểu "1+1+1" (3 item ở 3 Thùng khác nhau)
  n21  = round(ratio21 * S)
  dSet = [3] * S;  FOR s in shuffle(range(S))[:n21]: dSet[s] = 2

  tasks = [ s  lặp (dSet[s] - 1) lần,  với mỗi s ]      # tổng (d-1) lần "kéo item ra"
  FOR s in shuffle(tasks):
    home = s
    to   = chooseTarget(item, from=home, forbidden = strayTargets[s] ∪ {home})
    tryReverse(home, randomIndex, to)      # thất bại => bỏ seed, thử attempt kế
    strayTargets[s].add(to)

  # --- 4. Xáo bổ sung (tuỳ chọn — đây là cần gạt ĐỘ NHIỄU, xem §8) ---
  FOR e in 0 .. round(extraScramble * len(reverseMoves)):
    chọn (from, idx) hợp lệ bất kỳ và tryReverse tới chooseTarget(...)

  # --- 5. Compaction: ép đúng số Thùng RỖNG ---
  targetEmpty = compactFreeSlots ? (N - S) : min(numEmptyBoxes, N - S)
  mustEmpty   = argsort_by_load(boxes)[:targetEmpty]
  FOR src in mustEmpty:  đẩy hết item của src sang nơi khác (forbidden = mustEmpty)

  # --- 6. Kiểm tra trạng thái xuất phát ---
  ASSERT không Thùng nào wrapped         # nếu có => bỏ seed
  ASSERT count(Thùng rỗng) >= numEmptyBoxes

  # --- 7. Lời giải xuôi = đảo ngược danh sách nước đi ngược ---
  spec     = [ {from: m.to, to: m.from, itemId: m.itemId}  for m in reversed(reverseMoves) ]
  solution = materializeSolution(boxes, spec, cap)
  RETURN { boxes, solution, setType, dSet, cats, pool }
```

`generateLevel` gọi `buildOnce` tối đa `maxAttempts` lần với seed `seed + attempt*7919`,
rồi (nếu `cfg.verify`) **replay xuôi** lời giải bằng `simulate()` như một lưới an toàn —
lần replay này cũng thu luôn `wrapOrder`, thứ tự các bộ được gói, dùng để xếp Khay ở §6.

`compactFreeSlots` là công tắc chất/thoáng: `true` dồn **toàn bộ** ô trống vào đúng
`N − S` Thùng rỗng (bàn chật, khó); `false` chỉ đảm bảo `numEmptyBoxes` Thùng rỗng và để
phần ô trống còn lại làm "lỗ" rải rác (thoáng, dễ). Đường cong bật nó từ `L > 6`.

### 4.1. `chooseTarget` — vì sao bàn cờ trông "đan xen"

Trọng số chọn Thùng đích: Thùng **rỗng** ăn trọng số **1**, Thùng đã có item **hỗn hợp**
ăn **5**, Thùng đồng nhất ăn **4**. Nghĩa là bộ sinh **né dùng Thùng rỗng** và ưu tiên
nhồi item lạc vào Thùng đã lộn xộn sẵn. Không có bước này thì mọi item lạc sẽ dồn hết vào
vùng đệm và bàn cờ nhìn như đã sắp xong.

`chooseTarget` cũng lọc sẵn cùng ba điều kiện của `tryReverse` (còn chỗ, không tạo
3-cùng-loại, không phải Thùng wrapped-không-pristine), nên nó chỉ trả về ứng viên hợp lệ.

### 4.2. `materializeSolution` — vì sao không tái dùng index cũ

`push()` luôn đặt item vào **cuối** mảng còn `splice()` lấy ra ở **giữa**, nên sau khi đảo
ngược, *thứ tự* trong từng Thùng có thể khác trạng thái gốc (dù **nội dung** — xét như
multiset — thì giống hệt). Vì mọi item cùng `itemId` là hoàn toàn tương đương, index được
giải lại **tại thời điểm chạy** bằng `indexOf(itemId)` trên bản sao state.

---

## 5. Solver (`src/generator/Solver.js`)

### 5.1. Heuristic

```javascript
h(state) = Σ_type ( numBoxesContaining(t) − ceil(count(t) / 3) )
```

Mỗi loại item nằm rải ở `b` Thùng nhưng chỉ cần `ceil(count/3)` Thùng đích, nên phải tốn
ít nhất `b − ceil(count/3)` nước gom. Heuristic này **admissible**.

Quan trọng hơn: đo thực nghiệm ở `N = 6, 8, 10, 12` cho thấy nó bằng **đúng `optimal − 1.0`**
ở mọi kích cỡ bàn cờ. Nghĩa là `lowerBound + 1` là phương án thay thế **gần như miễn phí**
cho par khi IDA* hết ngân sách.

### 5.2. Ba solver, ba mục đích

| Hàm | Thuật toán | Dùng để |
|---|---|---|
| `solveIDA` | IDA* + transposition table + ngân sách node/thời gian | tính `optimalMoves` để chấm điểm |
| `solveGreedy` | weighted A* (`f = g + 1.5·h`), min-heap | dự phòng khi IDA* hết ngân sách |
| `solveConstructive` | "dọn nhà rồi gom", `O(S)` | hệ thống gợi ý (dài ~2.5× tối ưu) |

Tiện ích đi kèm: `simulate` (replay + thu `wrapOrder`), `isWinState`, `isDeadlocked`,
`isWrapped`, `canAccept`, `generateMoves`.

Chi phí IDA* trên bàn 10 Thùng: **13 ms trung bình**, xấu nhất **445 ms**, giải được
39/40 trong ngân sách. Vì vậy cổng `computeOptimal: 'auto'` mở tới **hết phạm vi bàn chơi
thật** (`numBoxes ≤ 10`) thay vì điều kiện cũ `numBoxes ≤ 8 && refMoves ≤ 16` (gần như
không bao giờ bật).

---

## 6. Khay và băng chuyền

Thứ tự Khay suy ra từ `wrapOrder` của lời giải tham chiếu, rồi biến đổi theo `trayOrder`:
`'wrapOrder'` (khớp y hệt — dễ nhất) → `'shuffled'` → `'reverse'` (khó nhất).

Cửa sổ Khay là hàng đợi **FIFO dạng prefix**: `getAllActiveTrays()` ≡
`allTrays.slice(0, conveyorMaxActive)`, khớp đúng với `simulateDelivery` lúc sinh màn.

### 6.1. `matchMode` phải chọn theo NHÓM HÀNG, không theo từng Khay

Đây là một cái bẫy có thật, bị `TEST 7` bắt được (level 45 chỉ thắng **19/60**):

> Nhóm "văn phòng" có Khay A (`category`) và Khay B (`itemType`, đợi đúng loại "bút").
> Thùng wrapped loại "bút" đến trước → Khay A (không kén loại) **nuốt** nó → Thùng "kẹp
> giấy" còn lại không còn Khay nào nhận → **BẾ TẮC**, kết thúc ở `PLAYING` với
> "1 thùng còn hàng, 1 khay chưa giao".

Khi **cả một nhóm hàng cùng chế độ** thì luôn có song ánh: `category` → mọi Thùng trong
nhóm vừa mọi Khay trong nhóm (số lượng bằng nhau); `itemType` → khớp đúng theo loại, cũng
bằng nhau. Các nhóm hàng không bao giờ tranh Khay của nhau. Vì vậy `strictTrayRatio` chọn
một **tập nhóm hàng** ngẫu nhiên theo seed, và mọi Khay của nhóm đó cùng chạy `'itemType'`.

Hệ quả: cần phân biệt hai con số — `wantStrict` (tỉ lệ **yêu cầu**) và `strictRatio`
(tỉ lệ **thực tế** sau khi làm tròn theo nhóm hàng). `strictRatio` mới là con số dùng để
chấm điểm và ghi vào `rules.strictTrayRatio`. Với 4 nhóm hàng, nó chỉ nhận 5 mức
`0, 0.25, 0.5, 0.75, 1.0` — thô hơn mong muốn, nhưng vẫn mượt hơn nhiều so với lật công
tắc cả bàn ở đúng level 40 (xem §7.2).

---

## 7. Chấm điểm độ khó

Điểm `1..100` trộn 6 trục đã chuẩn hoá về `[0,1]`:

| Trục | Công thức | Trọng số |
|---|---|---|
| `volume` | `min(parMoves / 24, 1)` | 0.30 |
| `spread` | `clamp((avgSpread − 1) / 2, 0, 1)` | 0.14 |
| `interleave` | `mixedBoxRatio` | 0.10 |
| `confusion` | `min(typesUsed/12, 1) · clamp(categoryConfusion/3, 0, 1)` | 0.08 |
| `trayBacklog` | `min(maxWrappedHeld / 8, 1)` | 0.20 |
| `strictness` | luật Khay + `moveLimitSlack` + `secondsPerMove` + `undoCount` | 0.18 |

Ba quyết định quan trọng đằng sau bảng này:

1. **Chuẩn hoá theo `parMoves`, không theo `refMoves`.** `refMoves` là **công sức của bộ
   sinh màn**, không phải của người chơi — xáo thêm 8 lần làm nó dài gấp 8 nhưng bàn cờ chỉ
   khó hơn **đúng 1 nước**. Chấm điểm trên `refMoves` là thưởng cho bộ sinh vì đã đi đường
   vòng, và tệ hơn nữa là làm `moveLimit` **lật ngược** đường cong áp lực.
   `parMoves = difficulty.optimalMoves ?? lowerBound + 1`.
2. **Trục `pressure` cũ đã bị gỡ.** Vì `F ≡ 3` (§3), `parMoves / freeSlots` chỉ là bản sao
   tỉ lệ của `volume` — 24% trọng số đếm cùng một thông tin hai lần. Thay bằng `spread`,
   thứ thật sự biến thiên `0.50 → 0.945` khi `ratio21` giảm.
3. **`confusion` từng bị đảo ngược ở level thấp.** `typesUsed/catsUsed` cho level 1
   (1 nhóm × 2 loại) tỉ lệ 2.0 — "rất rối" trên bàn cờ chỉ vỏn vẹn 2 loại item. Nay có
   thêm cổng theo kích thước palette.

Hai luật dẫn xuất: `moveLimit = ceil(parMoves · moveLimitSlack)` và
`timeToPlay = round((parMoves · secondsPerMove + 20) / 5) · 5`.

### 7.1. Trần độ khó của bộ luật

```
level |  par | spread | wrapped | free
   8  |  7.3 |  2.20  |   1.0   |  3
  20  | 15.1 |  2.56  |   2.5   |  3
  40  | 17.2 |  2.89  |   7.0   |  3
  90  | 17.0 |  2.89  |   8.0   |  3
```

Mọi chỉ số **cấu trúc** đều chạm trần quanh level 40: quy mô bị chặn bởi 10 Thùng (giới
hạn bàn chơi trong GDD) và 4 nhóm × 3 loại (toàn bộ `ITEM_CATALOG`), còn `F` là hằng số.

**Kết luận thiết kế:** sau level ~40, độ khó **không** thể tăng bằng cấu trúc bàn cờ nữa,
chỉ còn tăng bằng tồn kho Khay (`maxWrappedHeld`) và độ nghiêm ngặt của luật. Điểm số phản
ánh đúng điều đó thay vì nguỵ tạo thêm độ khó giả.

### 7.2. Đường cong hiện tại (30 seed/level)

```
L   | score | par   | strictness | strictTrayRatio
1   |  16.0 |  2.00 |    0.00    |  0.00
8   |  33.6 |  7.27 |    0.10    |  0.00
16  |  46.2 | 12.50 |    0.12    |  0.00
25  |  56.1 | 15.57 |    0.27    |  0.00
35  |  63.3 | 16.53 |    0.41    |  0.00
40  |  68.4 | 16.93 |    0.51    |  0.25
45  |  72.3 | 16.53 |    0.62    |  0.51
50  |  80.7 | 16.87 |    0.80    |  1.00
60  |  85.4 | 17.07 |    0.91    |  1.00
90  |  86.1 | 16.97 |    0.96    |  1.00
```

Đơn điệu tăng `16 → 86`, không có đoạn chững, bước nhảy lớn nhất là 4.6 điểm. Bước nhảy
16 điểm ở `L35 → L40` trước đây (do `trayMatchMode` lật cả bàn cùng lúc) đã được thay bằng
dốc thoải `strictTrayRatio = clamp((L − 34) / 18, 0, 1)`.

### 7.3. `configForLevelNumber` — ba giai đoạn

| Giai đoạn | Level | Tăng độ khó bằng |
|---|---|---|
| GĐ1 — Quy mô | 1 .. ~20 | `numBoxes` 4→10, `numCategories` 1→4, `itemTypesPerCategory` 2→3 |
| GĐ2 — Phân tán | ~20 .. 40 | `ratio21` giảm, `extraScramble` tăng, `maxSetsPerType` giảm |
| GĐ3 — Luật & áp lực | 40+ | Khay chế độ chặt, cửa sổ băng chuyền hẹp lại, siết `moveLimit` / `timeToPlay` / `undoCount` |

> Đây vẫn là **GIẢ THIẾT THIẾT KẾ**, phải hiệu chỉnh lại khi có telemetry thật.

---

## 8. `extraScramble` là cần gạt ĐỘ NHIỄU, không phải ĐỘ KHÓ

Đo trên `N=10 S=9`, 40 seed mỗi mức:

| `extraScramble` | `refMoves` | IDA* tối ưu | `lowerBound` |
|---|---|---|---|
| 0 | 18.6 | 16.0 | 15.0 |
| 2 | 52.5 | 17.1 | 16.1 |
| 8 | 154.4 | 17.1 | 16.1 |

Lời giải tối ưu chỉ dài thêm 1 nước, và **bão hoà ngay từ mức 2**. Lý do: mỗi nước đi ngược
chỉ có thể tăng cận dưới `h` thêm nhiều nhất 1, mà `h` đã gần chạm trần của cấu hình. Dùng
nó để bàn cờ trông "rối" hơn (item cùng loại nằm tản mát, khó đọc bằng mắt), đừng kỳ vọng
nó làm màn khó hơn thật sự.

---

## 9. Ràng buộc khả thi (`normalizeConfig`)

Mọi đường cong mới phải thoả:

```
numSets >= 1
numSets <= numBoxes - 1                       # phải còn ít nhất 1 Thùng rỗng
poolSize * maxSetsPerType >= numSets          # nếu không: throw "Pool item qua nho"
```

---

## 10. Kết quả trả về

`generateLevel` trả về object với các khoá:

```
version, seed, attempt, config, boxes, trays, conveyor,
referenceSolution, solvable, solvabilityProof, difficulty, rules
```

`solvabilityProof` = `'reverse-construction + forward replay verified'`.
`rules` = `{ moveLimit, timeToPlay, undoCount, trayMatchMode, strictTrayRatio }` —
lưu ý `moveLimit` nằm trong `rules`, **không** có khoá `meta` nào.

---

## 11. Kiểm thử

`tools/selftest.js` — 7 test. Quan trọng nhất là **TEST 7**: tích hợp
`LevelGenerator → GameEngine` thật, chơi hết một ván bằng lời giải tham chiếu, 60 seed ở
mỗi level `1 / 5 / 12 / 25 / 45 / 70`, yêu cầu kết thúc ở trạng thái `WON`. Đây chính là
test đã bắt được lỗi bế tắc Khay ở §6.1.

```bash
node tools/selftest.js
```
