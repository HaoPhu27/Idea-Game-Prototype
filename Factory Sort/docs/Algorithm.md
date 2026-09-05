# Thuật toán sinh màn chơi — Factory Sort (tham chiếu cài đặt)

> File này là **tham chiếu cài đặt**: tham số, mã giả, công thức, hình dạng output.
> Phần *nguyên lý và vì sao* nằm ở [`02_THUAT_TOAN_SOLVABLE.md`](02_THUAT_TOAN_SOLVABLE.md);
> luật chơi nằm ở [`GDD_GoodsSort_TrayConveyor_v2.md`](GDD_GoodsSort_TrayConveyor_v2.md);
> số liệu 50 màn nằm ở [`50_level_design_report.md`](50_level_design_report.md).
>
> **v2 (9/2026)** — bộ sinh xây ngược **trực tiếp trên bố cục cột**. Mọi mô tả về
> `buildOnce` / `assignLayout` / `simulateWithLayout` / `extraScramble` / `numEmptyBoxes` /
> `compactFreeSlots` / `trayOrder` trong bản trước đã **không còn tồn tại trong code**.

---

## 1. Luật chơi, tóm tắt vừa đủ để hiểu thuật toán

- Bàn chơi có `N` **Thùng**, mỗi Thùng đúng **3 slot** (`boxCapacity = 3`).
- Item chuyển được sang **BẤT KỲ** Thùng nào còn slot trống — không giới hạn theo loại.
- Thùng đủ **3 item giống nhau** → `wrapped` → khoá cứng, **rời khỏi cột ngay** và rơi
  xuống **hàng chờ 5 slot**. Hàng chờ đầy là **THUA**.
- Hàng chờ tự động giao cho Khay khi có Khay khớp trong `conveyorMaxActive` Khay đầu
  hàng đợi. Khay khớp theo **đúng loại item** (`targetItemId`) — Khay hiện emoji nào thì
  chỉ nhận Thùng cùng emoji đó.
- Thùng hết item cũng **rời khỏi cột** (biến mất).
- Khu Thùng là `columns` cột; chỉ `visibleRows` Thùng dưới cùng mỗi cột là chạm được.
  Một Thùng rời cột ⇒ cột tụt xuống ⇒ lộ thêm đúng 1 Thùng.
- Thắng khi mọi bộ đã gói và giao hết, hàng chờ rỗng, cột rỗng.

| Ký hiệu | Ý nghĩa |
|---|---|
| `N` | số Thùng (`numBoxes`) |
| `S` | số bộ item = số Khay (`numSets`) |
| `E` | số Thùng "chuyển tiếp" (`carrierBoxes`), `N = S + E` |
| `cap` | sức chứa Thùng = 3 |
| `C × R` | `columns × visibleRows` — vùng nhìn thấy, mặc định 3 × 4 = 12 ô |

---

## 2. `buildDeep(cfg, rng)` — sinh ngược trên cột

```
FUNCTION buildDeep(cfg, rng):

  # --- 1. Chọn loại item cho từng bộ (đánh chỉ số theo THỨ TỰ GIAO HÀNG XUÔI) ---
  cats    = shuffle(CATEGORIES)[:numCategories]
  pool    = flatten( shuffle(c.items)[:itemTypesPerCategory] for c in cats )
  setType = []                                    # setType[0] được giao đầu tiên
  FOR s in 0..S-1:
    eligible = [t in pool if usage[t] < maxSetsPerType]
    setType.push( pick(argmin_usage(eligible)) )  # rải đều, phủ hết pool trước

  # --- 2. Độ phân tán của từng bộ ---
  # d = 2 -> "2+1"   (2 item chung Thùng, 1 tách ra)   -> 1 item lạc
  # d = 3 -> "1+1+1" (3 item ở 3 Thùng khác nhau)      -> 2 item lạc
  dSet = [3] * S;  FOR s in shuffle(range(S))[:round(ratio21 * S)]: dSet[s] = 2
  totalStrays = Σ (dSet[s] - 1)

  # --- 3. Pha ngược: s = S-1 -> 0  (ngược với thứ tự giao hàng) ---
  boxes = [];  cols = [[] for _ in range(C)];  revMoves = []
  carriersLeft = E;  straysLeft = totalStrays

  FOR s FROM S-1 DOWNTO 0:
    t    = setType[s]
    home = insertBox([t,t,t], atBottom=false)      # R1: un-deliver
    used = {home}

    FOR k in 1 .. dSet[s]-1:
      idx     = last index of boxes[home]           # mọi item trong home cùng loại
      forced  = (candidates(t, used) rỗng)
      volunt  = carriersLeft > 0 AND rng() < carriersLeft / straysLeft

      IF forced OR volunt:                          # R3: un-vanish
        made = revMoveToNew(home, idx)              # tạo Thùng 1-item, chèn ĐÁY cột
        IF made >= 0: carriersLeft -= 1; used.add(made)
        ELSE IF forced: FAIL
        ELSE: placeStray(home, idx, t, used)        # R2
      ELSE:
        placeStray(home, idx, t, used)              # R2
      straysLeft -= 1

  # --- 4. Kiểm tra trạng thái xuất phát ---
  ASSERT len(boxes) == N  AND  carriersLeft == 0
  ASSERT không Thùng nào rỗng, không Thùng nào wrapped

  # --- 5. Lời giải xuôi = đảo ngược danh sách nước đi ngược ---
  spec     = [ {from: m.to, to: m.from, itemId: m.itemId} for m in reversed(revMoves) ]
  solution = materializeSolution(boxes, spec, cap)
  RETURN { boxes, cols, setType, dSet, solution }
```

### 2.1. Ba phép đi ngược — điều kiện hợp lệ

| | hàm | điều kiện |
|---|---|---|
| **R1** | `insertBox([t,t,t])` | chèn vào cột **ngắn nhất**, vị trí `p = 0` với xác suất `bottomBias`, ngược lại `p ∈ [1, min(R-1, len)]`. Thùng từ `p` trở lên bị đẩy lên 1 nấc. |
| **R2** | `revMove(from, idx, to)` | `from ≠ to` · `len(boxes[from]) ≥ 2` (xuôi thì Thùng này phải còn item) · `boxes[to]` còn chỗ · **cả hai đang hiện** · `from` không phải Thùng wrapped-không-pristine · `to` không thành 3-cùng-loại |
| **R3** | `revMoveToNew(from, idx)` | như R2, nhưng đích là Thùng mới chèn **xuống đáy cột** (`atBottom = true`). Nếu chính phép chèn đẩy `from` ra ngoài tầm với → **hoàn tác và báo thất bại**. |

`atBottom` cho R3 là bắt buộc: Thùng chuyển tiếp mang theo 2 ô trống, mà ô trống chỉ
dùng được khi còn trong tầm với. Để nó chịu `bottomBias` như Thùng thường thì ô trống bị
đẩy lên vùng bị che và pha ngược chết đói vì hết chỗ đặt item lạc.

Cờ `pristine[i]` = "Thùng `i` vẫn nguyên trạng như lúc mới sinh ra". Chỉ Thùng `pristine`
mới được phép là 3-cùng-loại — đây là toàn bộ lý do màn sinh ra không bao giờ có Thùng
khoá sẵn lúc bắt đầu.

### 2.2. `placeStray` — vì sao bàn cờ trông "lẫn lộn" và tài nguyên nằm ở tầng trên

Trọng số chọn Thùng nhận item lạc, trong số các Thùng **đang hiện**:

```
w(i, at) = (1 + 3·buryBias)^at  ×  (1.8 nếu boxes[i] đã lẫn lộn, ngược lại 1)
                                 ×  (1.4 nếu boxes[i] chỉ còn đúng 1 chỗ, ngược lại 1)
```

- `at` = vị trí trong cột. Hàm **mũ** chứ không tuyến tính: hàm tuyến tính (trọng số
  `1 : 2.2 : 3.4 : 4.6`) rải item lạc đều cả bốn hàng.
- Ưu tiên Thùng đã lẫn lộn ⇒ vùng nhìn thấy dày đặc đồ của nhiều bộ khác nhau.
- Ưu tiên Thùng gần đầy ⇒ ô trống được tái sử dụng thay vì bị chôn cùng Thùng.

**Bất biến cấu trúc:** item lạc luôn được đặt vào Thùng **đã có trên bàn** tại thời điểm
Thùng "nhà" vừa được chèn. Phép chèn không bao giờ đảo thứ tự các Thùng sẵn có *trong
cùng một cột*, nên item lạc luôn nằm **trên** nhà của nó nếu hai Thùng cùng cột. Đó là lý
do màn chơi có dạng "tài nguyên ở tầng trên". Khi hai Thùng khác cột thì thứ tự lộ ra do
tốc độ lớn của từng cột quyết định — đây chính là chỗ `bottomBias` can thiệp.

### 2.3. `materializeSolution` — vì sao không tái dùng index cũ

`push()` đặt item vào **cuối** mảng còn `splice()` lấy ra ở **giữa**, nên sau khi đảo
ngược, *thứ tự* trong từng Thùng có thể khác trạng thái gốc (dù **nội dung** — xét như
multiset — giống hệt). Mọi item cùng `itemId` là tương đương, nên index được giải lại
**tại thời điểm chạy** bằng `indexOf(itemId)` trên bản sao state.

### 2.4. `generateLevel` — vòng thử hai pha

```
phase1 = ceil(maxAttempts * 0.6)
FOR attempt in 0 .. maxAttempts-1:
    built = buildDeep(cfg, makeRng(seed + attempt*7919))
    cfg'  = (attempt >= phase1) ? {...cfg, maxOpeningSets: null} : cfg
    level = finalize(cfg', built, attempt);  IF level: RETURN level
THROW
```

Pha 2 bỏ trần `maxOpeningSets` thay vì ném lỗi. Đây là **nhượng bộ có chủ ý**: một màn có
5 bộ mở đầu thay vì 4 vẫn giữ nguyên số Thùng bị che, cửa sổ Khay và độ chặt ô trống —
còn ném lỗi thì `LevelGenerator.generateWithRelaxedConfig` sẽ nới `carrierBoxes`, tức đổi
ra một màn **dễ hơn hẳn**. Nhượng một đơn vị ở trục yếu nhất còn hơn nhượng cả trục mạnh nhất.

### 2.5. `replayReal` — lưới an toàn cuối cùng

`finalize` phát lại lời giải dưới **đúng** luật `GameEngine`: tầm với theo cột, Thùng rỗng
biến mất, Thùng gói xong rời cột vào hàng chờ `queueCapacity` slot, tự động giao khi có
Khay khớp trong cửa sổ. Trả `null` (bỏ lần xây này) nếu vi phạm bất cứ luật nào, kể cả
hàng chờ tràn. Nó cũng trả về `maxQueue` và `reveals` để chấm điểm.

---

## 3. Bảng tham số (`DEFAULTS` trong `SolvableLevelGenerator.js`)

| Tham số | Mặc định | Ý nghĩa |
|---|---|---|
| `numBoxes` | 12 | tổng số Thùng, **kể cả** phần bị che |
| `carrierBoxes` (`E`) | 3 | Thùng chuyển tiếp. **Tổng ô trống = 3E**, không phụ thuộc `N` |
| `numSets` | `null` | `null` ⇒ `numBoxes − carrierBoxes` |
| `boxCapacity` | 3 | cố định theo GDD |
| `columns` / `visibleRows` | 3 / 4 | vùng nhìn thấy = 12 ô ở **mọi** tier |
| `numCategories` | 3 | 1..8 (kích thước `ITEM_CATALOG`) |
| `itemTypesPerCategory` | 2 | 1..4 |
| `maxSetsPerType` | `null` | `null` ⇒ `max(2, ceil(numSets / poolSize))` |
| `ratio21` | 0.6 | tỉ lệ bộ "2+1". Cũng là cần gạt **độ dài**: `refMoves = S·(2 − ratio21)` |
| `maxOpeningSets` | `null` | trần số bộ giải được ngay trong vùng nhìn thấy |
| `buryBias` | 0.2 | độ dồn item lạc lên hàng trên cùng của tầm với |
| `bottomBias` | 0.35 | xác suất Thùng mới chèn xuống đáy cột. **Càng thấp càng khó** |
| `trayMatchMode` | `'category'` | *(còn lại vì tương thích; `Tray.canAccept` nay luôn so `targetItemId`)* |
| `strictTrayRatio` | `null` | *(vô hiệu — mọi Khay đều `itemType`; `rules.strictTrayRatio` luôn báo 1.0)* |
| `trayJitter` | `true` | hoán vị Khay trong từng khối `≤ conveyorMaxActive` |
| `conveyorMaxActive` | 3 | cửa sổ Khay (tiền tố cố định của hàng đợi) |
| `queueCapacity` | 5 | = `GameEngine.maxQueueSize` |
| `moveLimitSlack` | `null` | `moveLimit = ceil(par · slack)`; `null` = không giới hạn |
| `secondsPerMove` | `null` | `timeToPlay = round((par·s + 20)/5)·5` |
| `undoCount` | 3 | **chưa implement trong engine** |
| `maxAttempts` | 250 | sinh một màn 80 Thùng tốn ~1–15 ms nên trần cao không tốn kém |
| `verify` | `true` | chạy `replayReal` trước khi trả về |

### 3.1. Ràng buộc khả thi (`normalizeConfig`)

```
1 <= numSets <= numBoxes - 1                  # phải còn >= 1 Thùng chuyển tiếp
carrierBoxes <= floor(numSets * (2 - ratio21)) # mỗi carrier tiêu đúng 1 item lạc
                                               # (vượt thì tự đổi bớt sang numSets)
poolSize * maxSetsPerType >= numSets           # nếu không: throw "Pool item qua nho"
conveyorMaxActive ∈ [1, numSets]
```

### 3.2. `PRESETS` (khung cho test/demo, không phải lộ trình 50 màn)

| preset | `numBoxes` | `E` | pool | `ratio21` | cửa sổ | Khay |
|---|---:|---:|---|---:|---:|---|
| `tutorial` | 6 | 3 | 1 × 2 | 1.00 | 4 | category |
| `easy` | 12 | 3 | 2 × 2 | 0.85 | 4 | category |
| `normal` | 30 | 3 | 3 × 3 | 0.65 | 3 | category |
| `hard` | 56 | 2 | 5 × 3 | 0.62 | 2 | itemType |
| `superhard` | 76 | 2 | 6 × 3 | 0.55 | 1 | itemType |

Lộ trình 50 màn chính thức nằm ở `configForLevelNumber` + `LEVEL_SEEDS`.

---

## 4. Solver (`src/generator/Solver.js`) và `GameSim.js`

Hai lớp mô phỏng khác nhau, **đừng nhầm**:

| file | mô phỏng gì | dùng để |
|---|---|---|
| `Solver.js` | chỉ **lớp Thùng** (di chuyển item, wrap). Không biết cột, hàng chờ, Khay | heuristic, hint kiến thiết, `simulate()` replay |
| `GameSim.js` | **toàn bộ trận đấu**: cột bị che, Thùng rỗng biến mất, hàng chờ 5 slot, cửa sổ Khay, giao hàng tự động | đo độ khó (`trapRate`), solver đầy đủ (`solveFull`) |

### 4.1. Heuristic (dùng chung ở cả hai)

```javascript
h(state) = Σ_type ( numBoxesContaining(t) − ceil(count(t) / 3) )
```

Mỗi loại nằm rải ở `b` Thùng nhưng chỉ cần `ceil(count/3)` Thùng đích ⇒ tốn ít nhất
`b − ceil(count/3)` nước gom. **Admissible.**

### 4.2. Ba solver của `Solver.js`

| Hàm | Thuật toán | Dùng để |
|---|---|---|
| `solveIDA` | IDA* + transposition table + ngân sách node/thời gian | đối chiếu, chỉ khả thi ở bàn nhỏ |
| `solveGreedy` | weighted A* (`f = g + 1.5·h`), min-heap | dự phòng |
| `solveConstructive` | "dọn nhà rồi gom", `O(S)` | hệ thống **gợi ý** (≈2.5× tối ưu) |

> `solveConstructive` chỉ nhìn lớp Thùng — nó cho "nước kế tiếp hợp lý", **không** phải
> lời giải chơi được trên bàn có cột bị che. Dùng làm hint thì đúng, dùng làm bằng chứng
> giải được thì sai.

**Định lý kiến thiết:** với `F = 3E ≥ 3` ô trống, bàn cờ (bỏ qua lớp cột) luôn giải được
trong `≤ 4S` nước. Đo: `N=16 S=15`, 400 seed → 400/400, trung bình 35.1 nước, xấu nhất
**2.73 nước/bộ** (cận trên lý thuyết 4.00).

### 4.3. `GameSim.solveFull` — solver đầy đủ

IDA* trên state có `boxes / columns / queue / trays`. Dùng để **chứng minh `par` là tối
ưu** (TEST 2: 60/60 khớp trên bàn 9 Thùng). **Chỉ khả thi ở bàn nhỏ** — từ ~20 Thùng trở
lên không gian trạng thái vượt mọi ngân sách hợp lý, khi đó phải dùng `trapRate`.

### 4.4. `GameSim` — ba chính sách người chơi

| | nhìn thấy gì | dùng để |
|---|---|---|
| `greedy` | chỉ Thùng | người chơi mới |
| `smart` | Thùng + tránh mọi nước sai hiển nhiên | so sánh lịch sử |
| `planner` | thêm **cửa sổ Khay** và **slot hàng chờ còn trống** | **thước đo độ khó chính thức** |

Cả ba đều **không** nhìn được Thùng bị che và **không** tìm kiếm.

---

## 5. Khay và băng chuyền

Thứ tự Khay **bắt buộc** bám theo thứ tự giao hàng của lời giải tham chiếu (`setType`).
Chỉ được hoán vị **trong từng khối kích thước `≤ conveyorMaxActive`** (`trayJitter`) — khi
đó Khay cần tới luôn còn trong cửa sổ, nhưng người chơi vẫn không đoán được thứ tự chính xác.

> Khối lớn hơn cửa sổ là **bế tắc chắc chắn**: với cửa sổ 2 và khối `[A,B,C] → [C,B,A]`,
> người chơi gói A trước, cửa sổ là `[C,B]`, A vào hàng chờ; gói B → giao; gói C → giao;
> A không bao giờ có Khay.

Cửa sổ Khay là hàng đợi **FIFO dạng prefix**: `getAllActiveTrays()` ≡
`allTrays.slice(0, conveyorMaxActive)`, **không xoay được**.

### 5.1. Mọi Khay đều khớp theo LOẠI ITEM [đổi 9/2026]

`Tray.canAccept()` nay chỉ so `box.getItemType() === this.targetItemId`. Chế độ
`'category'` đã bị **bỏ hẳn** ở mọi tier: Khay hiện emoji nào thì chỉ nhận Thùng cùng
emoji đó. Lý do là một lời hứa thị giác — UI luôn vẽ `targetItemId`, nên nhận cả Thùng
khác loại cùng nhóm là phản bội đúng thứ người chơi đang nhìn.

`trayMatchMode` / `strictTrayRatio` vẫn còn trong config vì tương thích ngược, nhưng
**không còn tác dụng**; `rules.strictTrayRatio` luôn báo 1.0.

> **Bẫy đã biến mất cùng chế độ đó** (giữ lại làm ghi chú lịch sử): khi trộn hai chế độ
> *trong cùng một nhóm hàng*, Khay chế độ `category` sẽ **nuốt** mất Thùng mà Khay chế độ
> `itemType` đang đợi, và Thùng còn lại không còn Khay nào nhận → bế tắc. `TEST 7` từng
> bắt được đúng lỗi này (level 45 chỉ thắng 19/60). Nếu có ngày ai đó muốn dựng lại chế độ
> `category`, ràng buộc bắt buộc là: **cả một nhóm hàng phải cùng chế độ**.

---

## 6. Chấm điểm độ khó

`difficulty.score ∈ [1,100]` trộn **chín trục** đã chuẩn hoá về `[0,1]`:

| Trục | Công thức | Trọng số |
|---|---|---:|
| `hiddenDepth` | `clamp(hiddenBoxes / 60, 0, 1)` | **0.22** |
| `windowTightness` | `WINDOW[cma] · clamp(1 − cma/S, 0, 1)`, `WINDOW = {1:1, 2:.85, 3:.55, 4:.30, 5:.12, 6:.04}` | **0.16** |
| `slotPressure` | `clamp((1 − 3E/min(N, C·R)) / 0.75, 0, 1)` | 0.12 |
| `opening` | `clamp(1 − (open−1)/4, 0, 1) · clamp(1 − open/S, 0, 1)` | 0.10 |
| `volume` | `clamp(parMoves / 120, 0, 1)` | 0.10 |
| `spread` | `clamp(avgSpread − 2, 0, 1)` | 0.08 |
| `confusion` | `clamp((typesUsed−1)/(S−1)) · clamp((catConfusion−1)/(MAX_TYPES_PER_CAT−1))` | 0.08 |
| `interleave` | `mixedBoxRatio` | 0.07 |
| `strictness` | `strictRatio·0.6 + clamp((1.8 − moveLimitSlack)/0.75)·0.4` — `strictRatio` nay luôn 1 nên trục này chỉ còn phản ánh `moveLimitSlack` | 0.07 |

Bốn quyết định đằng sau bảng này:

1. **`hiddenDepth` là trục nặng nhất** — đó là đòn bẩy chính của thiết kế, và là đòn bẩy
   duy nhất tỉ lệ thuận với `numBoxes` mà vẫn làm khó *mà không* làm dài.
2. **`windowTightness` nhân thêm độ phủ.** Cửa sổ 2 trên bàn 2 Khay (màn tutorial) không
   siết gì cả; không nhân `1 − cma/S` thì màn 4 Thùng chấm 29 điểm.
3. **`slotPressure` tính theo vùng nhìn thấy**, không theo cả bàn — `3E` ô trống đều quanh
   quẩn trong cửa sổ 12 Thùng nên mẫu số phải là số Thùng nhìn thấy được.
4. **`volume` nhẹ nhất có thể (0.10).** Bàn to chỉ làm màn dài. Yêu cầu thiết kế là "khó
   chứ không phải chơi lâu".

Điểm này chỉ để **xếp hạng và hiển thị**. Thước đo sự thật là **tỷ lệ thua của `planner`**;
ràng buộc bắt buộc là điểm phải **đi cùng chiều** với nó (TEST 3e kiểm điều này).

Hai luật dẫn xuất: `moveLimit = ceil(parMoves · moveLimitSlack)` và
`timeToPlay = round((parMoves · secondsPerMove + 20) / 5) · 5`.

> **`parMoves = refMoves` và nó là TỐI ƯU** (chứng minh ở `02_THUAT_TOAN_SOLVABLE.md` §2).
> Không còn phải chạy IDA* để có `par`, và `difficulty.optimalMoves == parMoves`.

---

## 7. `configForLevelNumber(L)` — lộ trình 50 màn

Nguồn sự thật **duy nhất** cho câu hỏi "level N khó thế nào". UI chỉ truyền `levelNumber`.

| tier | Lv | `numBoxes` | bị che | `E` | cửa sổ | pool item | `moveLimitSlack` |
|---|---|---:|---:|---:|---:|---:|---:|
| `tutorial` | 1–5 | 4, 6, 8, 10, 12 | 0 | 2–3 | 5 (kẹp về `min(cma, numSets)`) | 1–2 × 2 | — → 1.9 |
| `onboarding` | 6–10 | 14 → 20 | 2–8 | 3 | 5 → 4 | 2–3 × 2 | 1.9 → 1.7 |
| `acclimation` | 11–20 | 22 → 34 | 10–22 | 3 | 4 | 3 × 2 → 4 × 3 | 1.7 → 1.5 |
| `normal` | 21–49 | 34 → 46 | 22–34 | 2 | 4 | 4 × 3 | 1.55 → 1.42 |
| `hard` | 25/35/45 | 52 → 68 | 40–56 | 2 | 4 | 5 × 3 | 1.40 → 1.30 |
| `superhard` | 29/39/49 | 72 → 80 | 60–68 | 3 | 3 | 6 × 3 | 1.30 → 1.22 |

Cột "Khay đúng loại" đã bỏ khỏi bảng: từ 9/2026 **mọi Khay ở mọi tier đều khớp đúng loại
item** (§5.1), nên nó không còn là biến số của lộ trình.

Định tuyến: `L ≤ 5` tutorial · `L ≤ 10` onboarding · `L ≤ 20` acclimation ·
`L % 10 == 9` superhard · `L % 10 == 5` hard · còn lại normal.

`columns = 3`, `visibleRows = 4` ở **mọi** tier — vùng nhìn thấy luôn là 12 ô.

> **`ratio21` phải LIÊN TỤC qua ranh giới tier.** Bản đầu để onboarding kết thúc ở 0.70
> còn acclimation bắt đầu lại ở 0.78 (dễ hơn), nên L11 chấm điểm *thấp hơn* L10 dù nhiều
> Thùng bị che hơn — một bước lùi hiện ngay trên bảng xếp hạng. Hiện tại:
> `1.00 → 0.88 → 0.80 → 0.68 → 0.60` liền mạch qua các tier.

### 7.1. `LEVEL_SEEDS` — vì sao phải tuyển seed

Config chỉ quyết định **khung**. Cùng khung `hard` (52 Thùng), 16 seed khác nhau cho tỷ lệ
thua từ **25% đến 85%**. Vì vậy mỗi màn được quét 40 seed, sàng bằng 16 ván rồi xác nhận
bằng 40 ván dưới chính sách `planner`, chốt seed nào rơi đúng dải mục tiêu.

```bash
node tools/curate50.mjs > tools/levels50.json      # quét lại toàn bộ (~220 s)
LEVELS=25,35,45 SEEDS=400 node tools/curate50.mjs  # quét sâu vài màn
```

Rồi dán `LEVEL_SEEDS` in ra stderr vào `SolvableLevelGenerator.js`.

---

## 8. Kết quả trả về

```
version, seed, attempt, config, boxes, trays, layout, conveyor,
referenceSolution, solvable, solvabilityProof, difficulty, rules
```

- `layout = { columns: number[][], visibleRows, hiddenBoxes }` — `columns[c][0]` là **đáy**
  cột. `GameEngine.startLevel` đọc thẳng mảng này; ID Thùng **chính là** chỉ số mảng.
- `difficulty` gồm `refMoves, parMoves, optimalMoves, lowerBound, freeSlots,`
  `visibleFreeSlots, hiddenBoxes, openingSets, deepestColumn, maxQueueHeld, reveals,`
  `fillRatio, avgSpread, mixedBoxRatio, categoryConfusion, score, components`.
- `rules = { moveLimit, timeToPlay, undoCount, queueCapacity, trayMatchMode, strictTrayRatio }`
  — `moveLimit` nằm trong `rules`, **không** có khoá `meta`.
- `solvabilityProof = 'reverse-construction-on-layout + full forward replay verified'`.

---

## 9. Kiểm thử

```bash
node tools/selftest.js          # 8 test, ~4 s
node tools/demo.js 25           # in một màn ra terminal, vẽ theo cột
node tools/build.mjs            # bundle + standalone + verify_build.html
```

Quan trọng nhất là **TEST 7**: tích hợp `LevelGenerator → GameEngine` thật, chơi hết ván
bằng lời giải tham chiếu, với **đầy đủ** hàng chờ 5 slot và `moveLimit` — không nới lỏng
gì cả, vì `par` giờ là số tối ưu thật nên lời giải phải vừa khít mọi ràng buộc.

`tools/verify_build.html` chạy cùng bộ kiểm tra đó **trong trình duyệt** trên chính
`bundle.js` mà bản standalone dùng.
