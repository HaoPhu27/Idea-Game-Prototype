# Cross-check: GDD v0.4 ⟷ implementation_plan.md

## Kết luận ngắn

**Hai tài liệu KHÔNG match — và không phải vì sai lệch chi tiết, mà vì chúng mô tả hai game khác nhau.**

- `GDD_GoodsSort_TrayConveyor_v2.md` mô tả **prototype của bạn**: Thùng phẳng 3 ô, tap-tap, Tray 1 slot trên băng chuyền oval, 4 category × 3 item type.
- `implementation_plan.md` là **kết quả reverse-engineering 4501 file level của một game thương mại khác**: cell có toạ độ `posX/posY`, mỗi cell là một **chồng nhiều layer**, có feeder, conveyor có hướng và tốc độ, cell khoá, item ẩn, wildcard, `timeToPlay`, pool item ID 1–609.

Không có một field nào trong output của `implementation_plan` (`cells`, `itemsLayer`, `cellType`, `moveType`, `speed`, `isLock`, `itemHiden`, `mechanics`, `numberCellLock`) tồn tại trong data model của GDD. Ngược lại, không có khái niệm nào của GDD (`isWrapped`, `categoryId`, `targetItemId`, Tray, điều kiện Thắng/Thua) tồn tại trong plan đó.

Nên câu hỏi đúng không phải "sửa cái nào cho khớp cái nào", mà là: **cái gì từ bản phân tích 4501 level đáng mang sang game của bạn?** Mục 3 dưới đây trả lời việc đó.

---

## 1. Bảng đối chiếu

| Khía cạnh | GDD v0.4 (prototype của bạn) | implementation_plan.md | Khớp? |
|---|---|---|---|
| Đơn vị chứa | `Box`, mảng phẳng, `maxSize = 3` | `cell` có `itemsLayer[]`, mỗi cell 1–15 layer | ✗ |
| Truy cập item | Grid mở — tap bất kỳ ô nào (Phương án B) | Có layer che nhau, layer 0 trên cùng | ✗ — plan giả định Phương án C mà GDD đã loại |
| Toạ độ | Không có (layout do CSS) | `posX/posY`, `gridStepX=6`, `gridStepY=4` | ✗ |
| Pool item | 4 category × 3 type = **12 type**; mỗi level dùng ≤ 8 | **67 unique ID/level**, dải 1–609 | ✗ — lệch ~8× |
| Luật "3 item" | 3 item cùng loại trong 1 Thùng → wrapped | Mỗi item ID xuất hiện **đúng 3 lần** trong level | ✓ **cùng nguyên lý** |
| Rải 3 bản sao | Không có luật; `LevelGenerator` shuffle rồi chia đều | 60.3% kiểu **2+1**, 39.7% kiểu **1+1+1**, không bao giờ 3-trong-1-layer | ✗ — GDD thiếu luật này |
| Tổng item chia hết 3 | Đúng theo cấu trúc (numFilledBoxes × 3) | 98.4% file (73 file lệch là do wildcard) | ✓ |
| Tỉ lệ ô trống | Cứng: đúng **1 Thùng rỗng** (3 ô) | `emptySlotRatio` median **22.3%**, rải rác | ✗ — khác bản chất, xem mục 3.2 |
| Tray | 1 slot, match theo `categoryId`, quay trên ellipse | `cellType=2` "khay đơn": 1 slot/layer, nằm cố định trên bàn, **không có category** | ✗ |
| Conveyor | Ellipse, `maxActive=4`, chở **Tray** | `cellType=1/3` + `moveType 2..5` + `speed`, chở **item/cell** | ✗ |
| Feeder / spawn | Không có | `cellType=0, moveType=1, speed=0` (34k cell) | ✗ |
| Điều kiện Thắng | Hết Tray **và** mọi Box còn lại rỗng | Không định nghĩa (plan chỉ sinh format) | n/a |
| Điều kiện Thua | Mọi Box chưa wrapped đều đầy | Không có; game kia dùng `timeToPlay` | ✗ |
| Giới hạn thời gian | **Chưa implement** (câu hỏi mở #11) | `timeToPlay` 0–550s, phổ biến 200–400 | ✗ — GDD thiếu |
| Ô khoá | Không có | `isLock`, ~15% cell | ✗ |
| Item ẩn | Không có (Grid mở, tất cả nhìn thấy) | `itemHiden` 0–9 + mechanics type 12/13 | ✗ |
| Wildcard | Không có | `id = -1`, 132 slot / 73 file | ✗ |
| Solvability | Solver BFS **bị skip**, không verify | Open Question #2: **cũng không đảm bảo**, hỏi chọn (A) bỏ qua hay (B) forward simulation | ✓ **cùng bị bỏ ngỏ** |

---

## 2. Ba mâu thuẫn nằm ngay bên trong GDD/prototype (không liên quan tới file kia)

Đây là phần tôi nghĩ đáng giá hơn cả việc so sánh hai tài liệu.

### 2.1 Tray match theo `categoryId` nhưng UI hiển thị `targetItemId`

GDD 4.2 tự ghi nhận: `canAccept(box)` so `box.getCategory() === this.categoryId`, còn UI vẽ `getItemEmoji(tray.targetItemId)`.

Từ level demo tôi sinh ra (level 9, 3 category):

```
#2 🎾  category=sports  target=tennis
#3 🏀  category=sports  target=basketball
```

Người chơi thấy hai Tray khác nhau, nhưng **thùng tennis thả vào Tray bóng rổ vẫn được nhận**. Đây là lời hứa thị giác bị luật chơi phản bội — nó vừa làm hỏng feedback, vừa xoá một tầng quyết định mà chính USP ở mục 1 của GDD nói là điểm khác biệt.

Hai lối thoát, chọn một:
- Đổi `canAccept` sang so `targetItemId` (chặt hơn, khó hơn, khớp UI). Trong code tôi viết đây là `trayMatchMode: 'itemType'`.
- Hoặc bỏ emoji item trên Tray, chỉ hiện nhãn + màu category.

### 2.2 LevelGenerator hiện tại phát Thùng wrapped miễn phí

`LevelGenerator` tạo pool `numFilledBoxes` bộ × 3, shuffle, chia đều 3 item/Thùng. Không có gì ngăn 3 item cùng loại rơi vào cùng một Thùng.

Tôi đã tái hiện đúng thuật toán đó và chạy 300 seed mỗi cấu hình:

| Cấu hình | Level có Thùng wrapped sẵn |
|---|---|
| Level 1 (6 Thùng, 2 cat × 2 type = 4 loại) | **69/300 = 23.0%** |
| Level 9 (9 Thùng, 4 cat × 2 type = 8 loại) | 7/300 = 2.3% |

Gần **1/4 level đầu game** tặng không một thùng đã đóng gói. Đây chính là hiện tượng mà `implementation_plan` bắt được ở phía game thương mại và loại bỏ bằng luật "không dồn cả 3 vào 1 layer" (99.9% tuân thủ). Đây là luật đáng mang sang ngay.

### 2.3 Tầng Tray/Conveyor hiện không tạo ràng buộc nào

Thùng wrapped nằm tại chỗ, đã đầy, `canAccept()` trả false — nó không chiếm và cũng không nhả ô trống nào. Khi giao vào Tray, Box bị `filter` khỏi mảng, cũng không trả lại ô trống. Nên **thời điểm giao hàng hoàn toàn không ảnh hưởng tới bài toán dồn hàng**. `maxActive=4` chỉ làm người chơi phải chờ, không làm họ phải nghĩ.

Nếu muốn tầng vĩ mô thật sự có sức nặng, cần một trong các thay đổi: Bến chờ có sức chứa giới hạn (GDD 3.5), hoặc Thùng wrapped chưa giao thì khoá luôn ô của nó khỏi bàn, hoặc Tray hết hạn sau N nước đi.

---

## 3. Cái gì từ bản phân tích 4501 level nên mang sang

### 3.1 Luật 2+1 / 1+1+1 — mang sang nguyên vẹn, đây là núm vặn độ khó tốt nhất

Phát hiện 60.3% / 39.7% ánh xạ trực tiếp sang game của bạn:

- **2+1**: hai bản sao nằm chung một Thùng, bản thứ ba ở Thùng khác → cần **1 nước** để gom.
- **1+1+1**: ba bản sao ở ba Thùng khác nhau → cần **2 nước**.

Nghĩa là số nước đi tối thiểu của cả level chính là `Σ(số Thùng chứa loại t − 1)`. Đây vừa là thang đo độ khó vừa là heuristic admissible cho solver. Trong code là tham số `ratio21`: 1.0 = dễ nhất, 0.0 = khó nhất.

### 3.2 `emptySlotRatio` — mang sang nhưng phải đổi cách hiểu

Trong game kia, ô trống rải rác trong các layer nên "22% trống" là một con số mềm. Trong game của bạn có một tính chất mạnh hơn nhiều:

> **Tổng số ô trống F là bất biến.** Mỗi nước đi lấy 1 item khỏi Thùng này và đặt vào Thùng kia → F không đổi. Wrap cũng không đổi F (Thùng wrapped vốn đã đầy).

Và vì tổng item luôn là 3S, F = 3N − 3S **luôn là bội số của 3**. Không tồn tại level có F = 1 hay F = 2. Nên `emptySlotRatio` với game của bạn không phải một dải liên tục 18–26% — nó là một số nguyên: bạn có 1, 2 hay 3 "Thùng rỗng đáng giá" để xoay xở. Hardcode `numEmptyBoxes: 1` tương đương F = 3, tức mức chật nhất còn giải được.

### 3.3 `timeToPlay` — mang sang, đây là thứ GDD đang thiếu

GDD mục 6 và 9.3 tự thừa nhận điều kiện Thua gần như không xảy ra, và câu hỏi mở #11 để ngỏ chuyện giới hạn thời gian/nước đi. Mục 2 của tôi ở dưới chứng minh vì sao: **không phải "khó xảy ra" mà là "không thể xảy ra" khi F ≥ 3**. Vậy giới hạn nước đi/thời gian không phải lever bổ sung — nó là lever *duy nhất*.

Heuristic của plan (`timeToPlay ≈ 1.5 × totalLayers + 180`, R² = 0.15) thì không nên mang sang: R² 0.15 nghĩa là công thức đó gần như vô nghĩa. Thay bằng neo vào `refMoves` mà generator biết chính xác: `moveLimit = ceil(refMoves × slack)`.

### 3.4 Mang sang được về sau

| Từ plan | Ánh xạ sang game của bạn | Ghi chú |
|---|---|---|
| `id = -1` wildcard | Item 🃏 đếm như bất kỳ loại nào khi tính wrapped | Booster/monetization tự nhiên |
| `isLock` | Thùng khoá tới khi giao đủ N Tray | Ép thứ tự giải |
| mechanics 12/13 (`itemHiden`) | Item hiện dấu "?" tới khi Thùng bên trên vơi | **Cảnh báo:** phá vỡ đảm bảo giải được — chỉ còn "giải được dưới thông tin đầy đủ" |
| mechanics 2 (`listCloseCellEndIndex`) | Thùng đóng lại ở cuối màn | Ít giá trị với 1-slot Tray |
| Feeder / conveyor cell | Băng chuyền tiếp item mới vào bàn | Đây là thay đổi thể loại, không phải tinh chỉnh |

### 3.5 Không nên mang sang

`numberCellLock` (19.6% file sai — chỉ là bug data của game kia), `gridStepX/Y`, toàn bộ hệ toạ độ cell, `numberLayer` (placeholder luôn = 0), và dải item ID 1–609.

---

## 4. Vấn đề solvability — cả hai tài liệu đều bỏ ngỏ, và cả hai đều lo sai chỗ

GDD 8.2: solver BFS bị skip vì branching factor quá lớn làm freeze UI; giả định "có 1 Box rỗng → giải được" được ghi là *chưa chứng minh chặt chẽ*.
implementation_plan Open Question #2: cũng không đảm bảo solvable, hỏi chọn (A) bỏ qua hay (B) forward simulation.

Cả hai đều mặc định solvability là thứ phải **tìm** bằng search. Với luật chơi của bạn thì không cần — nó **chứng minh được**.

### Định lý

Xét bàn chơi: N Thùng sức chứa 3, tổng item = 3S (S bộ, mỗi bộ 3 item cùng loại), đặt item không ràng buộc loại. Gọi F = tổng số ô trống.

1. F = 3N − 3S, luôn là bội của 3.
2. F là bất biến qua mọi nước đi và mọi lần wrap.
3. **Nếu F ≥ 3 thì bàn chơi luôn giải được, trong tối đa 4S nước.**

**Chứng minh (3)** — quy nạp theo S, kèm thuật toán:

- Chọn loại `t` còn dở bất kỳ, chọn Thùng `X` (chưa wrapped) đang giữ nhiều bản sao `t` nhất.
- *Dọn nhà*: đẩy từng item khác loại `t` ra khỏi `X` sang Thùng khác còn ô trống. `X` có tối đa 2 item khác `t` → tối đa 2 nước. Luôn tồn tại ô trống ngoài `X`: mỗi lần đẩy tiêu 1 ô ngoài và trả lại 1 ô trong `X`, nên số ô trống ngoài `X` giảm nhiều nhất 1 mỗi lần, xuất phát từ ≥ 3 nên luôn còn ≥ 1 cho lần sau.
- *Gom*: kéo các bản sao `t` còn lại vào `X` (tối đa 2 nước). `X` đủ 3 item cùng loại → wrapped, khoá cứng, rời khỏi bài toán.
- Còn lại: S−1 bộ trên N−1 Thùng, F không đổi. Quy nạp. ∎

Hệ quả:
- **a)** Giả định trong `LevelGenerator.js` là đúng, và còn mạnh hơn: chỉ cần F ≥ 3, tức N ≥ S+1. Không cần solver để verify solvability nữa.
- **b)** Điều kiện Thua của GDD mục 6 **không thể kích hoạt** khi F ≥ 3 (thuật toán trên luôn có nước đi hợp lệ). Nên "Thua khó xảy ra" thực ra là "không bao giờ xảy ra". Xác nhận: giới hạn nước đi/thời gian là lever duy nhất.
- **c)** Thuật toán trong chứng minh chạy O(S), không phải O(b^d) — dùng luôn làm **hệ thống gợi ý (hint)** và lưới an toàn chống kẹt, không bao giờ freeze UI.

### Kiểm chứng thực nghiệm

Đã cài đặt trong `Solver.js` (`solveConstructive`) và chạy:

| Cấu hình | Số state ngẫu nhiên | Giải được | Nước đi TB | Max nước/bộ (cận lý thuyết 4.00) |
|---|---|---|---|---|
| N=6, S=5 | 500 | 500 | 8.4 | 2.60 |
| N=10, S=9 | 500 | 500 | 19.4 | 2.67 |
| N=16, S=15 | 500 | 500 | 35.2 | 2.80 |

3000 state ngẫu nhiên, 100% giải được, mọi lời giải đều được replay lại qua mô phỏng đúng luật `GameEngine`/`Box`.

Riêng với thuật toán sinh level **hiện tại** của bạn: 600/600 level (cả cấu hình level 1 lẫn level 9) được IDA* xác nhận có lời giải, không có level nào không kết luận được. **Vấn đề của prototype không phải solvability** — mà là 23% level đầu game có thùng miễn phí (mục 2.2) và không có cách nào đo được độ khó.

---

## 5. Việc cần chốt

| # | Việc | Nguồn |
|---|---|---|
| 1 | Chốt `trayMatchMode`: `category` (hiện tại, và bỏ emoji trên Tray) hay `itemType` (giữ emoji, khó hơn) | Mục 2.1 / GDD 4.2 |
| 2 | Bật luật cấm Thùng wrapped sẵn khi sinh level | Mục 2.2 / plan Rule 2.1 |
| 3 | Chốt `moveLimit` (và/hoặc `timeToPlay`) — không có nó thì không có thất bại | Mục 4b / GDD câu hỏi mở #11 |
| 4 | Quyết định tầng Tray có nên tạo ràng buộc thật không | Mục 2.3 / GDD 3.5 |
| 5 | Bỏ solver BFS trong `LevelGenerator.js`, thay bằng reverse generation | GDD câu hỏi mở #15 |
| 6 | Số item type hiện chỉ 8 cho tới 9 bộ ở level cao → loại bị lặp. Có mở `itemTypesPerCategory` lên 3 không? | GDD 9.1 vs 9.2 |
