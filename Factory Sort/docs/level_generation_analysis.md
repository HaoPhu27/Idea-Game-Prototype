# Cẩm nang chỉnh độ khó — Factory Sort

> **Mục đích của file này:** "tôi muốn màn khó hơn/dễ hơn — vặn cái gì, và vặn xong thì
> phải làm gì tiếp?" Đây là tài liệu **thao tác**, không phải tài liệu nguyên lý.
>
> | cần gì | đọc file nào |
> |---|---|
> | *vì sao* thuật toán hoạt động | [`02_THUAT_TOAN_SOLVABLE.md`](02_THUAT_TOAN_SOLVABLE.md) |
> | mã giả, tham số, công thức chấm điểm | [`Algorithm.md`](Algorithm.md) |
> | luật chơi | [`GDD_GoodsSort_TrayConveyor_v2.md`](GDD_GoodsSort_TrayConveyor_v2.md) |
> | số liệu từng màn trong 50 màn | [`50_level_design_report.md`](50_level_design_report.md) |
> | **vặn núm nào** | file này |
>
> **v2 (9/2026).** Bản trước của file này mô tả bộ sinh v1 (`numEmptyBoxes`,
> `extraScramble`, `compactFreeSlots`, `trayOrder`) — **không một tham số nào trong số đó
> còn tồn tại**.

---

## 1. Quy tắc số một: điểm số không phải độ khó

`difficulty.score` chỉ để **xếp hạng và hiển thị**. Thước đo sự thật là **tỷ lệ thua của
người chơi mô phỏng** trong `GameSim.js`, chính sách `planner`:

```javascript
import * as G from '../src/generator/GameSim.js';
const ci = G.buildCatIndex(lv), rng = G.mulberry32(777);
let lost = 0;
for (let i = 0; i < 40; i++)
  if (!G.playout(G.stateFromLevel(lv), ci, 'planner', rng, lv.boxes.length * 12).won) lost++;
console.log(lost / 40);
```

`planner` nhìn cửa sổ Khay và số slot hàng chờ còn trống — hai thứ hiện ngay trên màn
hình — không bao giờ phạm lỗi hiển nhiên, nhưng **không** nhìn được Thùng bị che và
**không** tìm kiếm. Ván nào nó vẫn thua là ván đòi hỏi lập kế hoạch thật.

Dải mục tiêu đang dùng (`tools/curate50.mjs`, hàm `band()`):

| tier | tỷ lệ thua mục tiêu | đo được (9/2026) |
|---|---|---|
| tutorial | 0% | 0% |
| onboarding | 0–5% | 0–10% ⚠️ |
| acclimation | 0 → 18% | 0–23% ⚠️ |
| normal | 12–28% → 22–42% | 13–57% ⚠️ |
| **hard** | **60–80%** | **70%** |
| **super hard** | **88–98%** | **93%** |

> ⚠️ **Ba tier đầu đang LỆCH khỏi dải mục tiêu.** Nguyên nhân: thay đổi 9/2026 bắt **mọi
> Khay ở mọi tier khớp đúng loại item** (trước đó tutorial → acclimation chỉ cần đúng nhóm
> hàng). Điều đó làm các tier thấp khó hơn hẳn, trong khi `LEVEL_SEEDS` vẫn là bộ seed
> được tuyển dưới luật cũ. **Cách sửa: chạy lại `node tools/curate50.mjs`** (mục 3).

---

## 2. Bảng núm vặn, xếp theo sức mạnh đo được

### 2.1. `numBoxes` — số Thùng bị che ⇒ **đòn bẩy mạnh nhất**

Vùng nhìn thấy cố định 3×4 = 12 ô, nên `hiddenBoxes = numBoxes − 12`. Đây là đòn bẩy
**duy nhất** vừa tỉ lệ thuận với `numBoxes` vừa làm khó *mà không* làm rối: người chơi
không bị bắt bấm thêm nước đi, họ bị bắt lập kế hoạch với thông tin không đầy đủ.

| `numBoxes` | bị che | dùng cho |
|---:|---:|---|
| 4–12 | 0 | tutorial — cả bàn nhìn thấy được |
| 14–34 | 2–22 | onboarding + acclimation |
| 34–46 | 22–34 | normal |
| **52–68** | **40–56** | **hard** |
| **72–80** | **60–68** | **super hard** |

**Cảnh báo:** phóng to bàn cũng làm **dài** ra tuyến tính (`par ≈ numBoxes × 1.4`). Bàn 80
Thùng có par 112 nước + 77 lượt giao ≈ 10–15 phút/ván. Đừng dùng `numBoxes` để bù cho việc
không vặn được núm khác.

### 2.2. `conveyorMaxActive` — cửa sổ Khay ⇒ đòn bẩy mạnh thứ hai

Cửa sổ là **tiền tố cố định** của hàng đợi Khay, không xoay được. Thùng gói xong không
khớp Khay nào sẽ chiếm 1 trong 5 slot hàng chờ; hết slot là thua.

Đo trên bàn hard 60 Thùng (30 ván, `planner`):

| cửa sổ | 2 | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|
| tỷ lệ thua | 77% | 77% | 57% | 23% | 20% |

Bậc thang, không tuyến tính — bước nhảy lớn nhất nằm giữa **4 và 5**. Hiện dùng: 5 ở
tutorial/onboarding, 4 ở acclimation/normal/hard, 3 ở super hard.

> **Bẫy lịch sử:** bản v1 tin rằng cửa sổ 1–2 là "khó vừa" và dùng nó cho hard/super hard.
> Sai, vì `GameSim` cũ **không mô hình hoá hàng chờ**. Với luật thật, cửa sổ 1–2 trên bàn
> lớn cho tỷ lệ thua ~100% kể cả với người chơi có kế hoạch — không chơi được.

### 2.3. `carrierBoxes` (`E`) — không gian xoay xở

**Tổng ô trống = `3 × E`, và con số này KHÔNG đổi theo `numBoxes`.** Đây là hệ quả cấu
trúc của phép sinh ngược, không phải một quy ước.

| `E` | ô trống | cảm giác |
|---:|---:|---|
| 1 | 3 | ngạt thở |
| 2 | 6 | chật (normal + hard) |
| 3 | 9 | vừa (tutorial → acclimation, super hard) |
| 4 | 12 | rộng rãi |

> **Nghịch lý cần biết:** trên bàn ≥ 68 Thùng, `E = 2` khiến pha ngược **chết đói** 25–65%
> số seed (ô trống sinh ra ở vùng hiện rồi bị đẩy lên vùng che trước khi dùng hết). Đổi
> sang `E = 3` **không** làm màn dễ hơn — số ô trống *nhìn thấy được* lúc spawn vẫn ≈ 3 ở
> cả hai mức — nhưng bộ sinh chạy trơn. Đó là lý do super hard dùng `E = 3` còn hard dùng 2.

### 2.4. `bottomBias` — bao nhiêu bộ giải được ngay lúc mở màn

Xác suất Thùng mới được chèn thẳng xuống **đáy** cột. **Càng thấp càng khó.**

Đo trên bàn hard 60 Thùng, 25 seed, số bộ gom đủ 3 item ngay trong 12 ô nhìn thấy:

| `bottomBias` | min / trung bình / max |
|---:|---|
| 0.20 | 4 / 4.8 / 5 |
| 0.45 | 5 / 6.0 / 7 |
| 0.70 | 6 / 7.9 / 10 |
| 0.95 | 6 / 8.0 / 10 |

Cơ chế: Thùng "nhà" được chèn cao thì chỉ vài lần chèn nữa là nó chìm vào vùng bị che,
trong khi các item lạc của nó (nằm ở cột khác, vị trí thấp) vẫn còn hiện ⇒ người chơi nhìn
thấy một đống đồ lạc mà **chưa có Thùng nào để gom chúng vào**.

Kèm theo là trần cứng `maxOpeningSets` (loại thẳng lần xây nào vượt). Hard/super hard đặt
trần 4.

### 2.5. `ratio21` — độ phân tán, và cũng là ĐỘ DÀI

Tỉ lệ bộ kiểu "2+1" (2 item chung Thùng, 1 tách ra); phần còn lại là "1+1+1".
`refMoves = S × (2 − ratio21)`, nên hạ `ratio21` vừa làm khó vừa làm **dài**.

> **Bắt buộc: `ratio21` phải LIÊN TỤC qua ranh giới tier.** Bản đầu để onboarding kết thúc
> ở 0.70 còn acclimation bắt đầu lại ở 0.78 (dễ hơn) — L11 chấm điểm thấp hơn L10 dù nhiều
> Thùng bị che hơn, một bước lùi hiện ngay trên bảng xếp hạng. Hiện tại:
> `1.00 → 0.88 → 0.80 → 0.68 → 0.60` liền mạch.

### 2.6. Khay đòi đúng loại — KHÔNG CÒN LÀ NÚM VẶN [đổi 9/2026]

`Tray.canAccept()` nay luôn so `targetItemId`: Khay hiện emoji nào thì chỉ nhận Thùng cùng
emoji đó, ở **mọi** tier. Chế độ `'category'` đã bị bỏ hẳn vì nó phản bội đúng thứ người
chơi đang nhìn trên Khay.

`trayMatchMode` / `strictTrayRatio` vẫn còn trong config vì tương thích ngược nhưng
**không còn tác dụng**. Hệ quả cần biết: các tier thấp mất một bậc thang độ khó — trước
đây chúng được "nới" bằng cách chỉ đòi đúng nhóm hàng. Nếu cần làm tutorial dễ lại, phải
vặn núm khác (pool item nhỏ hơn, cửa sổ Khay rộng hơn, `E` lớn hơn).

### 2.7. Pool item (`numCategories × itemTypesPerCategory`)

Catalog có 8 nhóm × 4 loại = 32 loại. Hard dùng 5×3 = 15 loại, super hard 6×3 = 18 —
đủ nhiều để **màu sắc không còn giúp phân loại**, người chơi phải đọc từng emoji.

### 2.8. `moveLimitSlack`

`moveLimit = ceil(par × slack)`, với `par` là số nước **tối ưu chứng minh được**. Dư địa
hiện tại: 2.20× (tutorial) → 1.23× (super hard). Đây là núm vặn **yếu** — nó chỉ phạt
người chơi đi vòng, không tạo ra quyết định mới.

### 2.9. Núm KHÔNG có tác dụng

| tham số | vì sao |
|---|---|
| `undoCount` | engine **chưa cài đặt** undo |
| `secondsPerMove` / `timeToPlay` | engine **chưa có đồng hồ** |

Cả hai vẫn được sinh ra trong `rules` để dành cho sau, và **cố tình không** được tính vào
`difficulty.score` — chấm điểm cho một luật không tồn tại là tự nói dối.

---

## 3. Quy trình chuẩn khi đổi lộ trình

Đổi `configForLevelNumber` **luôn** làm hỏng `LEVEL_SEEDS` (seed cũ được tuyển cho khung
cũ). Trình tự bắt buộc:

```bash
# 1. Sửa configForLevelNumber trong src/generator/SolvableLevelGenerator.js

# 2. Kiểm nhanh: 50 màn còn sinh được không, khung có đúng không
node tools/selftest.js

# 3. Tuyển lại seed (~220 s). stderr in bảng + khối LEVEL_SEEDS để dán
node tools/curate50.mjs > tools/levels50.json

# 4. Dán khối LEVEL_SEEDS in ra ở cuối stderr vào SolvableLevelGenerator.js

# 5. Chạy lại toàn bộ + build lại bundle
node tools/selftest.js
node tools/build.mjs

# 6. Mở tools/verify_build.html trong trình duyệt, bấm "Chạy kiểm tra"
```

Quét sâu vài màn khó chiều:

```bash
LEVELS=25,35,45 SEEDS=400 node tools/curate50.mjs > tools/levels50.json
```

---

## 4. Checklist khi sửa bộ sinh màn

Bất biến mà `tools/selftest.js` TEST 1 kiểm ở **mọi** preset, **mọi** seed:

- [ ] Lúc spawn **không Thùng nào rỗng** (mọi Thùng có ≥1 vật)
- [ ] Lúc spawn **không Thùng nào wrapped sẵn**
- [ ] **Tổng ô trống == `3 × carrierBoxes`** — nếu lệch là phép sinh đã hỏng bất biến
- [ ] Mỗi loại item xuất hiện **đúng bội số của 3**
- [ ] `trays.length == numSets`
- [ ] `layout.columns` chứa **đúng** `numBoxes` Thùng, không Thùng nào ở hai cột
- [ ] Vùng nhìn thấy lúc spawn **còn ít nhất 1 ô trống**
- [ ] Lời giải tham chiếu replay được qua `Solver.simulate()`
- [ ] Và replay được qua `replayReal()` — **đầy đủ** cột bị che, hàng chờ 5 slot, cửa sổ Khay
- [ ] TEST 7: chơi hết ván qua `GameEngine` thật, kết thúc `WON`, `moveCount ≤ moveLimit`

---

## 5. Ba sai lầm đã mắc, đừng lặp lại

1. **Đo độ khó bằng một mô hình không đúng luật.** `GameSim` v1 giữ Thùng gói xong nằm lại
   trong cột và không có hàng chờ. Hệ quả: cửa sổ Khay 1–2 bị chấm là "khó vừa" trong khi
   thực tế gần như bất khả thi, và mọi seed được tuyển theo con số sai đó.

2. **Xếp bố cục cột sau khi đã sinh xong bàn cờ.** v1 sinh dãy Thùng "phẳng" rồi mới xếp
   vào cột và lọc lại. Với 48 Thùng bị che, xác suất lọt lưới là ~0 — bộ sinh quay hết
   `maxAttempts` rồi ném lỗi. Bố cục phải nằm **trong** phép sinh.

3. **Để UI tự tính độ khó song song với bộ sinh.** Từng có ba nguồn sự thật cho câu hỏi
   "level 7 khó thế nào": `UIManager` tự tính `numBoxes`, `configForLevelNumber` tính kiểu
   khác, và nút chọn màn tô màu theo `i % 2`. Nay chỉ còn **một**:
   `configForLevelNumber(L)`. UI chỉ được truyền `levelNumber`.
