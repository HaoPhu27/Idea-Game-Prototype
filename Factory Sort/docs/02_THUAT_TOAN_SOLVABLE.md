# Thuật toán sinh level đảm bảo giải được — Goods Sort (Tray & Conveyor)

**v2 (9/2026) — sinh ngược TRỰC TIẾP trên bố cục cột.**

```
src/generator/SolvableLevelGenerator.js   sinh level  (buildDeep + replayReal)
src/generator/Solver.js                   mô phỏng lớp Thùng + IDA* + hint kiến thiết
src/generator/GameSim.js                  mô phỏng TOÀN BỘ trận đấu (cột + hàng chờ + Khay)
tools/selftest.js                         bộ kiểm chứng   (node tools/selftest.js)
tools/curate50.mjs                        tuyển seed cho 50 màn (node tools/curate50.mjs)
tools/demo.js                             in thử 1 màn    (node tools/demo.js 25)
```

---

## 0. Vì sao phải viết lại (v1 → v2)

v1 sinh một dãy Thùng "phẳng" rồi **mới** xếp vào cột (`assignLayout`) và lọc lại bằng
`simulateWithLayout`. Cách đó chỉ sống được khi gần hết Thùng đều nhìn thấy.

Yêu cầu sản phẩm mới: màn **hard có 50–70 Thùng**, **super hard 72–80**, nhưng lúc nào
cũng chỉ **3 × 4 = 12 Thùng** nhìn thấy được. Với 60 Thùng thì 48 Thùng bị che, và xác
suất một lời giải sinh ngẫu nhiên không bao giờ chạm vào Thùng bị che là ~0. v1 sẽ quay
hết `maxAttempts` rồi ném lỗi.

v2 làm bố cục thành **một phần của phép sinh**, không phải một bộ lọc sau đó.

---

## 1. Nguyên lý: sinh ngược, và bố cục nằm trong bất biến

Bất biến cốt lõi:

> Trạng thái ngược tại bước **τ**  ==  trạng thái xuôi tại thời điểm **(T − τ)**.

Vì vậy chỉ cần **mọi nước đi ngược chỉ chạm vào Thùng đang hiện** (index `< visibleRows`
trong cột của nó) thì khi phát lại xuôi, mọi nước đều hợp lệ. Cả *tính giải được* lẫn
*tính chơi được* đều là bất biến cấu trúc, không phải kết quả của tìm kiếm.

### Ba phép đi ngược — nghịch đảo đúng ba sự kiện xuôi của `GameEngine`

| | phép ngược | sự kiện xuôi tương ứng |
|---|---|---|
| **R1** | `un-deliver` — tạo Thùng mới chứa 3 item cùng loại, **chèn** vào cột ở vị trí `p < visibleRows`; thêm 1 Khay vào **đầu** hàng đợi Khay | Thùng gói xong → rời cột → vào hàng chờ → giao cho Khay |
| **R2** | `un-move` — rút 1 item từ Thùng `from` bỏ sang Thùng `to` (cả hai đều đang hiện) | người chơi kéo 1 item `to → from` |
| **R3** | `un-vanish` — tạo Thùng mới **chỉ có 1 item** (rút từ một Thùng đang hiện) rồi chèn vào cột | người chơi kéo nốt item cuối đi → Thùng rỗng biến mất → cột tụt xuống |

Phép chèn của R1/R3 đẩy các Thùng từ vị trí chèn trở lên **1 nấc** — đó chính là nghịch
đảo của "cột tụt xuống khi một Thùng rời cột".

Hai bất biến an toàn giữ nguyên từ v1: nguồn của R2 không được là Thùng đã gói (trừ Thùng
"pristine" chưa bị đụng tới), và đích không được thành 3-cùng-loại (sẽ gói sai thời điểm).

---

## 2. Hai hệ quả định lượng

### (1) Số ô trống là một HẰNG SỐ CỤC BỘ, không phụ thuộc kích cỡ bàn

Gọi `S` = số bộ 3 item (= số Khay), `E` = số Thùng "chuyển tiếp" sinh bởi R3.

```
N = S + E                          tổng số Thùng
tổng item = 3S,  tổng ô = 3N   ⇒   tổng ô trống = 3(N − S) = 3E
```

R2 không tạo cũng không xoá ô trống (bịt ô bên này, mở ô bên kia) nên **3E là bất biến**
suốt cả quá trình. Và vì R2 chỉ chạm được Thùng đang hiện, số ô trống *dùng được* luôn
quanh quẩn trong cửa sổ 12 Thùng.

⇒ `carrierBoxes` (E) là cần gạt **độ chật không gian xoay xở**, **độc lập với N**:
E=1 → 3 ô (ngạt thở) · E=2 → 6 ô (chật) · E=3 → 9 ô (vừa) · E=4 → 12 ô (rộng).

⇒ **Phóng to bàn không làm màn dễ hơn, cũng không làm khó hơn — chỉ làm dài hơn.**
Đo được: cùng E=2/E=3 trên bàn 80 Thùng, số ô trống *nhìn thấy được* lúc spawn đều ≈ 3.

### (2) `parMoves = refMoves` = số nước đi **tối ưu** (không cần chạy IDA*)

Mỗi bộ `s` được rải ra `d_s ∈ {2,3}` Thùng bằng đúng `d_s − 1` lần R2/R3, và **không item
nào bị di chuyển hai lần**. Xuôi, mỗi item lạc phải được kéo về ít nhất 1 lần, nên
`Σ(d_s − 1)` vừa là **chặn dưới** vừa là độ dài lời giải tham chiếu ⇒ nó **chính là** tối ưu.

v1 phải chạy IDA* (và chỉ chạy nổi khi `N ≤ 10`) rồi đoán par từ `lowerBound + 1`. v2 có
con số chính xác ở **mọi** kích cỡ bàn, nên `moveLimit = ceil(par × slack)` cuối cùng cũng
đúng nghĩa. TEST 2 kiểm lại điều này bằng solver đầy đủ trên bàn nhỏ: 60/60 khớp.

---

## 3. Độ khó đến từ đâu

Màn hard/super hard **không** khó vì dài, mà vì **thông tin bị giấu**:

- 50–70 Thùng (hard) / 72–80 (super hard) trên bàn, nhưng lúc nào cũng chỉ 12 Thùng
  chạm được; phần còn lại bị che **hoàn toàn** (không kéo item vào/ra, không giao).
- Vùng nhìn thấy ở dưới đáy dày đặc item lẫn lộn của nhiều bộ khác nhau; thường chỉ
  **3–4 bộ** gom đủ 3 item ngay trong vùng đó (`difficulty.openingSets`).
- Item còn thiếu của các bộ khác nằm trong Thùng **bị che phía trên**. Muốn lộ ra thì
  phải giao/dọn bớt Thùng phía dưới cho cột tụt xuống.

Vòng lặp thật của người chơi: *gói được bộ nào trước → giao → cột tụt → lộ tài nguyên
mới → gói tiếp bộ nào*. Sai thứ tự là kẹt.

### Hai chính sách chọn vị trí cài đặt điều đó

| tham số | ý nghĩa | đo được (bàn hard 60 Thùng, 25 seed) |
|---|---|---|
| `bottomBias` | xác suất Thùng mới được chèn thẳng xuống **đáy** cột (`p = 0`) | **càng thấp càng khó**: 0.20 → 4–5 bộ mở đầu · 0.45 → 5–7 · 0.70 → 6–10 · 0.95 → 6–10 |
| `buryBias` | độ thiên vị khi chọn Thùng nhận item lạc — trọng số của hàng `at` là `(1 + 3·buryBias)^at` | yếu hơn nhiều: 0.05 → 0.9 chỉ làm số bộ mở đầu nhúc nhích ±1 |

Vì sao `bottomBias` thấp lại khó: Thùng "nhà" được chèn cao thì chỉ vài lần chèn nữa là
nó chìm vào vùng bị che, trong khi các item lạc của nó (nằm ở cột khác, vị trí thấp) vẫn
còn hiện ⇒ **người chơi nhìn thấy một đống đồ lạc mà chưa có Thùng nào để gom chúng vào.**

`maxOpeningSets` chốt lại bằng cách loại thẳng những lần xây vượt trần (bộ sinh thử seed
khác); sinh một màn 80 Thùng tốn ~1–15 ms nên trần 250 lần thử là thoải mái.

### Cửa sổ Khay (`conveyorMaxActive`) — cần gạt mạnh thứ hai

Băng chuyền chỉ mở `maxActive` Khay **đầu tiên** (tiền tố cố định, không xoay được), và
Thùng gói xong mà chưa có Khay khớp thì **rời cột ngay** và chiếm 1 trong **5 slot hàng
chờ** — hết slot là **thua**. Đo trên bàn hard 60 Thùng (chính sách `planner`):

| cửa sổ | 2 | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|
| tỷ lệ thua | 77% | 77% | 57% | 23% | 20% |

Đây là chỗ v1 sai nặng nhất: `GameSim` cũ **không hề mô hình hoá hàng chờ** (nó giữ Thùng
gói xong nằm lại trong cột), nên mọi tỷ lệ thua đo được đều chỉ đến từ deadlock và cửa sổ
1–2 Khay bị coi là "khó vừa" trong khi thực tế nó gần như bất khả thi.

---

## 4. Đo độ khó: `GameSim.trapRate` với chính sách `planner`

Thước đo sự thật **không phải** `difficulty.score` mà là **tỷ lệ thua của người chơi mô
phỏng**. `GameSim` mô phỏng đúng luật `GameEngine`: cột bị che, Thùng rỗng biến mất, Thùng
gói xong rời cột vào hàng chờ 5 slot, giao hàng **tự động** theo `findQueueMatch()`.

Ba chính sách:

| | nhìn thấy gì | dùng để |
|---|---|---|
| `greedy` | chỉ nhìn Thùng | mô phỏng người chơi mới |
| `smart` | Thùng + tránh mọi nước sai hiển nhiên | so sánh lịch sử |
| `planner` | thêm **cửa sổ Khay** và **số slot hàng chờ còn trống** — hai thứ hiện ngay trên màn hình | **thước đo chính** |

`planner` vẫn **không** nhìn được Thùng bị che và **không** tìm kiếm. Ván nào nó vẫn thua
là ván đòi hỏi *lập kế hoạch thật*.

---

## 5. Lộ trình 50 màn (đo trên chính seed đã chốt, 40 ván/màn)

| tier | Lv | Thùng | bị che | E | cửa sổ | pool item | par | mở đầu | điểm | thua (`planner`) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tutorial | 1–5 | 4–12 | 0 | 2–3 | 5 | 1–2 × 2 | 2–10 | 2–9 | 6–15 | **0%** |
| onboarding | 6–10 | 14–20 | 2–8 | 3 | 5→4 | 2–3 × 2 | 12–20 | 5–6 | 16–24 | **0–10%** |
| acclimation | 11–20 | 22–34 | 10–22 | 3 | 4 | 3×2 → 4×3 | 23–41 | 4–5 | 25–38 | **0–23%** |
| normal | 21–49 | 34–46 | 22–34 | 2 | 4 | 4 × 3 | 42–62 | 3–5 | 39–51 | **13–57%** |
| **hard** | 25/35/45 | **52–68** | **40–56** | 2 | 4 | 5 × 3 | 68–94 | 4 | 52–60 | **70%** |
| **super hard** | 29/39/49 | **72–80** | **60–68** | 3 | 3 | 6 × 3 | 97–112 | 2–4 | 63–67 | **93%** |

Từ 9/2026 **mọi Khay ở mọi tier đều khớp đúng loại item** (`Tray.canAccept` chỉ so
`targetItemId`), nên "Khay đúng loại" không còn là biến số của lộ trình. Thay đổi đó làm
ba tier đầu khó hơn dải mục tiêu mà `LEVEL_SEEDS` được tuyển cho — cần chạy lại
`tools/curate50.mjs` để hiệu chỉnh, xem `level_generation_analysis.md` §1.

Bảng đầy đủ từng màn: `docs/50_level_design_report.md`.

Seed của 50 màn **không** sinh ngẫu nhiên lúc chạy: mỗi màn được quét 40 seed, sàng bằng
16 ván rồi xác nhận bằng 40 ván, và chốt seed nào rơi đúng dải mục tiêu của tier
(`tools/curate50.mjs` → `LEVEL_SEEDS` trong `SolvableLevelGenerator.js`). Cần thiết vì
cùng một khung hard, 16 seed khác nhau cho tỷ lệ thua từ **25% đến 85%**.

---

## 6. Điểm độ khó `difficulty.score` (1–100)

Chín trục chuẩn hoá về [0,1] rồi trộn theo trọng số. Nó chỉ để **xếp hạng và hiển thị**;
ràng buộc là nó phải **đi cùng chiều** với tỷ lệ thua đo được (TEST 3e kiểm điều này).

| trục | trọng số | nội dung |
|---|---:|---|
| `hiddenDepth` | 0.22 | số Thùng bị che — đòn bẩy chính của bản thiết kế mới |
| `windowTightness` | 0.16 | cửa sổ Khay càng hẹp càng phải gói đúng thứ tự (× độ phủ so với tổng số Khay) |
| `slotPressure` | 0.12 | `3E` ô trống, tính **theo vùng nhìn thấy** chứ không theo cả bàn |
| `opening` | 0.10 | bao nhiêu bộ giải được ngay trong vùng nhìn thấy |
| `volume` | 0.10 | độ dài ván đấu — có tính, nhưng nhẹ nhất có thể |
| `spread` | 0.08 | tỷ lệ bộ 1+1+1 |
| `confusion` | 0.08 | nhiều loại item trong cùng một nhóm hàng |
| `interleave` | 0.07 | tỷ lệ Thùng chứa item lẫn lộn |
| `strictness` | 0.07 | Khay khớp đúng loại + giới hạn nước đi |

---

## 7. Bộ kiểm chứng (`node tools/selftest.js`, ~4 s)

| test | kiểm gì |
|---|---|
| 1 | bất biến trạng thái xuất phát (không Thùng rỗng, không Thùng gói sẵn, **ô trống == 3E**, mọi loại item chia hết 3, số Khay == số bộ, cột chứa đủ `numBoxes`) + replay lời giải |
| 2 | **par có đúng là tối ưu không** — solver đầy đủ (`GameSim.solveFull`, có cột + hàng chờ + Khay) trên bàn nhỏ |
| 3 | định tuyến tier · **hợp đồng quy mô** (hard 50–70, super hard 72–96, vùng nhìn thấy luôn 3×4) · thứ tự tỷ lệ thua · điểm đi cùng chiều |
| 4 | stress cấu hình khắc nghiệt (E=1, bàn 90 Thùng, 1 Khay, 2 cột…) + cấu hình bất khả thi phải báo lỗi sớm |
| 5 | tái hiện bộ sinh xuôi cũ để cho thấy vì sao nó hỏng (23.5% màn có Thùng gói sẵn) |
| 6 | lời giải kiến thiết ≤ 4 nước/bộ (dùng làm hint) |
| 7 | **tích hợp thật**: `LevelGenerator → GameEngine`, đầy đủ hàng chờ 5 slot và `moveLimit`, phải kết thúc `WON` |
| 8 | `moveLimit ≥ par` ở cả 50 màn, và dư địa giảm dần theo tier (2.20× → 1.23×) |
