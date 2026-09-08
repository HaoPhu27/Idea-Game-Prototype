# Nâng cấp UI cho bản A/B Test (Inverted Layout) — Bộ tài liệu thực thi

> **Đối tượng:** lập trình viên / designer nhận việc, chưa từng đọc code Factory Sort.
> **Phạm vi:** chỉ `ab_test/` (bản Inverted). Không đụng `delivery/`.
> **Mức độ đổi gameplay: 0%.** Mọi phase dưới đây chỉ sửa *trình bày, bố cục, màu,
> chuyển động và hiệu năng*. Luật chơi, bộ sinh màn, độ khó giữ nguyên bit-for-bit.

Bộ tài liệu này viết sau khi đo trực tiếp bản chạy tại `http://localhost:8080/ab_test/`
trên hai khung máy thật (390×844 và 360×640) và đọc toàn bộ `ab_test/src/`, `ab_test/style.css`,
`ab_test/index.html`. Mọi con số trong tài liệu là **số đo thật**, không phải ước lượng.

---

## 0. Đọc 3 phút: hiện trạng đang sai ở đâu

Bản A/B hiện tại có phần "chất liệu" rất tốt — âm thanh Web Audio tự tổng hợp, VFX combo
ladder, hiệu ứng gập nắp thùng, băng tải nhôm định hình vẽ hoàn toàn bằng CSS. Vấn đề
**không nằm ở thiếu đồ hoạ, mà nằm ở phân bổ sai chỗ**: những pixel đẹp nhất đang được
tiêu vào phần ít thông tin nhất, còn phần người chơi phải nhìn để ra quyết định thì bị
bóp, bị che, hoặc tràn ra ngoài.

Bốn kết luận, kèm bằng chứng đo được:

**(1) Có lỗi bố cục chặn đường, không phải chuyện thẩm mỹ.**
Ở 360×640 (Android phổ thông), thanh HUD tràn ngang **73px**: nút *Chọn màn* và nút
*Chơi lại* nằm hoàn toàn ngoài màn hình, người chơi **không bấm được**. Toàn trang tràn
ngang **60px**, nên một cú vuốt ngang làm cả game trượt đi.

**(2) Ô hàng thứ 3 của Thùng bị vẽ ra ngoài Thùng.**
Ở 390×844, Thùng rộng 114px nhưng 3 ô hàng chiếm 129px (đo thực: ô rộng 39px, vì glyph
emoji rộng ~1,16em chứ không phải bằng `font-size`). Do `.slot { flex: 1 }` thiếu
`min-width: 0` và `.top-face` thiếu `overflow: hidden`, ô thứ 3 **tràn 19–24px ra khỏi
Thùng**, đè lên cột bên cạnh và chui xuống dưới thanh nhôm `.conveyor-side-beam`
(`z-index: 5`). Kết quả: món hàng thứ 3 của phần lớn Thùng **nhìn không rõ hoặc không
nhìn thấy** — trong khi đó là thông tin đầu vào trực tiếp của mọi nước đi.

**(3) Ngân sách màn hình bị đảo ngược.**
Khu băng chuyền trên cùng chiếm **cố định 230px** — **36% chiều cao máy 640px** — để hiển
thị trung bình **1 Khay đơn hàng**. Trong khi đó ở màn 25, engine có **50 Khay** và
người chơi cần biết đơn nào đang chờ để quyết định gói gì trước. Cùng lúc, bàn chơi chỉ
được 344px cho **12 Thùng nhìn thấy trên tổng 52 Thùng**.

**(4) Một phần tư mỗi Thùng là dải màu không chứa gì.**
`.front-face` (`style.css:844`) — dải nâu đặc mô phỏng "mặt trước hộp 3D" — chiếm
**28,5% chiều cao mỗi Thùng**. Ở màn 25 / 390×844 đó là ~45.000 px², tức **25% khối bàn
chơi**, dành cho một mảng màu phẳng. Cùng lúc, ô hàng có tỉ lệ 39×69 (cao gấp 1,8 lần
rộng) để chứa một glyph vuông 27×27 — mỗi ô thừa hai dải trống 21px trên và dưới.

Nói ngắn: **game đang tiêu phần lớn pixel vào khung, và cắt mất thứ người chơi cần đọc.**

---

## 1. Nguyên tắc bất biến — đọc trước khi sửa bất kỳ dòng nào

Mục tiêu: **chơi lên phải giống hệt bản hiện tại**, chỉ đẹp hơn và đọc được hơn.
Nếu một thay đổi UI làm lệch một trong các dòng dưới đây thì thay đổi đó **sai**, không
cần bàn thêm.

| Bất biến | Nguồn sự thật |
|---|---|
| Thùng có đúng 3 ô; nhận item **bất kỳ loại nào** miễn còn ô trống | `ab_test/src/core/Box.js` → `canAccept()` |
| Đủ 3 item **giống hệt nhau** thì Thùng tự đóng gói (`isWrapped`) | `ab_test/src/core/Box.js` → `checkWrapped()` |
| Khay **chỉ** nhận Thùng có `getItemType() === targetItemId` | `ab_test/src/core/Tray.js` → `canAccept()` |
| Băng chuyền là **prefix cố định** `allTrays.slice(0, maxActive)`, KHÔNG xoay được | `ab_test/src/core/Conveyor.js` → `getAllActiveTrays()` |
| Hàng chờ tối đa **5** chỗ; đầy mà không giải toả được → thua | `ab_test/src/core/GameEngine.js` → `maxQueueSize` |
| Mỗi cột chỉ `visibleRows` Thùng dưới cùng là chạm được; phần trên bị che tuyệt đối | `GameEngine.js` → `getVisibleBoxes()`, `columns` |
| Chip `+N` chỉ được để lộ **số lượng**, tuyệt đối không lộ nội dung Thùng bị che | `BoxRenderer.render()` |
| Số Khay hiện cùng lúc do bộ sinh màn quyết định (`maxActiveTrays`) | `GameEngine.js:43` |
| Chỉ số duy nhất đếm là `moveCount` | `GameEngine.js` |
| 8 nhóm × 4 loại = 32 item emoji, mỗi nhóm 1 màu | `ab_test/src/data/ItemCatalog.js` |

**Không được thêm:** booster, undo, gợi ý nước đi, đồng hồ đếm ngược, tiền tệ, bất kỳ
thứ gì cho người chơi thông tin mà engine đang cố tình giấu (đặc biệt: **không** hé lộ
Thùng bị che, **không** hé lộ Khay ngoài `maxActive`).

**Không được bỏ:** cổng IN/OUT, emoji mục tiêu trên Khay, hiệu ứng gập nắp Thùng,
combo ladder, âm thanh Web Audio.

---

## 2. ⚠️ Một cái bẫy phải biết trước khi động vào bố cục

**Việc giao hàng tự động đang được quyết định bằng toạ độ DOM, không phải bằng logic.**

`ab_test/src/ui/UIManager.js:756-805` — `checkQueuePickup()` chạy mỗi frame và kích hoạt
giao hàng khi:

```js
// UIManager.js:789 — Khay phải đang ở nhánh chạy phía trước
const isFrontTrack = Math.abs(pt.y - (g.cy - g.hy)) < 22;
// UIManager.js:799 — và tâm Khay phải trùng tâm slot hàng chờ trong 28px
if (Math.abs(trayCenterX - slotCenterX) <= 28) { ... }
```

Nghĩa là: **đổi kích thước băng chuyền, đổi vị trí hàng chờ, hay đổi tốc độ vòng chạy
đều làm đổi nhịp giao hàng** → đổi cảm giác chơi, và ở màn khó có thể đổi cả kết quả
thắng/thua (hàng chờ đầy 5/5 sớm hơn).

Bắt buộc làm theo **Phase 1 §1.4**: tách sự kiện giao hàng ra khỏi hình học **trước**,
rồi mới đổi bố cục. Không được đảo thứ tự.

Hai chỗ khác cũng phụ thuộc hình học, kiểm tra lại sau mỗi phase:
- `TrayRenderer.readBeltGeometry()` đọc `--belt-inset / --belt-h / --belt-bottom / --belt-radius`
  từ `#tray-area`. Đổi các biến này là đổi quỹ đạo Khay.
- `TrayRenderer.js:231` — Khay mới **bị `display:none` cho tới khi trôi qua cổng IN**.
  Đây là lý do đầu màn 25 người chơi chỉ thấy **1 Khay** dù `maxActive = 4`.

---

## 3. Lộ trình

Làm theo đúng thứ tự. Mỗi phase là một PR độc lập, chơi được, có checklist nghiệm thu riêng.

| Phase | Nội dung | Rủi ro gameplay | Công sức |
|---|---|---|---|
| [P0](P0-loi-chan-duong.md) | Sửa 4 lỗi hiển thị chặn đường (nút mất, ô thứ 3 tràn, trang trượt ngang, Khay đè hàng chờ) | Không | ~0,5 ngày |
| [P1](P1-ngan-sach-man-hinh.md) | Tách giao hàng khỏi hình học, rồi tái phân bổ ngân sách chiều cao | **Có — đọc kỹ §1.4** | ~1,5 ngày |
| [P2](P2-thung-va-o-hang.md) | Thiết kế lại Thùng & ô hàng để đọc được ở 360px | Không | ~1,5 ngày |
| [P3](P3-khu-don-hang.md) | Biến vòng quay trang trí thành bảng đơn hàng đọc được | Không (nếu đã xong P1) | ~1 ngày |
| [P4](P4-he-mau-va-thu-bac.md) | Hệ token màu, tương phản, màu tín hiệu dành riêng | Không | ~1 ngày |
| [P5](P5-chuyen-dong-va-hieu-nang.md) | Vẽ lại tăng dần thay vì đập đi xây lại; giảm 38 node trang trí/cột | Không | ~1,5 ngày |
| [P6](P6-modal-va-onboarding.md) | Đồng bộ ngôn ngữ thị giác cho modal, chọn màn, tutorial | Không | ~1 ngày |

Kèm theo: **[Phụ lục QA & kiểm chứng](QA-kiem-chung.md)** — ma trận thiết bị/màn chơi,
script đo bố cục, quy trình chứng minh gameplay không đổi, và bảng ánh xạ file → phase.
Đọc phụ lục này **trước khi mở PR đầu tiên**.

Tổng: **~8 ngày công**. P0 nên vào nhánh riêng và merge ngay — nó đang chặn người chơi.

---

## 3b. ⚠️ Ba chỗ bản đầu của tài liệu này đã SAI

Bộ tài liệu này đã được cài đặt một lần (commit `d18e48e`) và **làm hỏng khu băng
chuyền**. Đã sửa (commit `ea819db`) và đã sửa lại tài liệu. Ghi ở đây để không ai
lặp lại:

| Chỗ sai | Hậu quả thực tế | Đã sửa ở |
|---|---|---|
| **P1 §1.3 / P3 §3.7** — đề xuất thay vòng chạy bằng *làn thẳng một chiều* | Không bao giờ hiện đủ `maxActive` Khay (màn 1: chỉ 57% khung hình thấy đủ 2 Khay). Ở màn 50, 7 Khay × 62px **không thể vừa** làn 340px. | P1 §1.3, P3 §3.7 — **giữ vòng chạy**, chỉ nén chiều cao 242px → ~112px |
| **P3 §3.5** — chỉ nói `#queue-area { position: static }` | Băng tải vẫn `absolute` phủ kín `#tray-area`, nền mờ đục đè lên → **hàng chờ `0/5` biến mất hoàn toàn** | P3 §3.5 — `#tray-area` thành flex column **hai hàng** |
| **P2 §2.4b** — bảo căn giữa lưới Thùng | Bàn chơi trôi giữa **hai khoảng đen ~115px** | P2 §2.4b — ray kéo xuống đáy, chồng Thùng neo trên, trần `--box-h` 2.6 → 3.0 |

**Bài học chung:** ba lỗi đều là *đề xuất nghe hợp lý trên giấy nhưng chưa từng
được dựng thử*. Trước khi viết một mục "thiết kế mới" vào tài liệu, hãy dựng thử
ở 360×640 **và** 390×844, ở màn 1 (ít Thùng nhất) **và** màn 50 (`maxActive` lớn
nhất). Ràng buộc chết người luôn nằm ở hai đầu cực đó.

**Bẫy kiểm thử:** `TrayRenderer` chạy trên `requestAnimationFrame`, mà **tab ẩn thì
rAF đứng** — `trayElements` rỗng và giao hàng không bao giờ kích hoạt, trông y hệt
"code hỏng". Dùng mô phỏng frame tất định (P3 §3.7) thay vì chờ thời gian thực.

---

## 4. Quy tắc sửa code

1. **Không bao giờ sửa tay `ab_test/dist/FactorySort_ABTest_Inverted.html` hay `dist/bundle.js`.**
   Đó là file build. Sửa nguồn rồi chạy:
   ```bash
   npm run build:abtest
   ```
2. Sửa nguồn ở đúng 3 nơi: `ab_test/index.html`, `ab_test/style.css`, `ab_test/src/ui/**`.
   **Không sửa** `ab_test/src/core/**`, `ab_test/src/generator/**`, `ab_test/src/data/**`.
   Nếu một phase buộc phải chạm vào `core/`, dừng lại và báo — nghĩa là phase đó đã lệch
   khỏi phạm vi "UI only".
3. Chạy dev server để xem trực tiếp:
   ```bash
   npm start
   ```
   rồi mở `http://localhost:8080/ab_test/`.
4. Sau mỗi phase, chạy bộ test logic để chứng minh gameplay không đổi:
   ```bash
   npm test
   ```
5. `ab_test/index.html` hiện đang ghi đè `style.css` bằng một khối `<style>` đầy `!important`
   (dòng 10–104). **Mỗi phase phải dọn bớt khối này**, đẩy giá trị về `style.css` dưới một
   selector gốc `[data-layout="inverted"]`. Đây là nguồn gốc của gần như mọi lỗi bố cục
   trong P0 — hai file đang tranh nhau quyết định cùng một thứ.

---

## 5. Cách tái lập số đo trong tài liệu

Mở `http://localhost:8080/ab_test/`, DevTools → device toolbar → 360×640, vào màn 25,
dán vào Console:

```js
const h = document.getElementById('game-header');
const box = document.querySelector('.box-column:nth-child(2) .box');
const slot3 = box.querySelectorAll('.slot')[2];
console.table({
  'Trang tràn ngang (px)':  document.body.scrollWidth - document.body.clientWidth,
  'HUD tràn ngang (px)':    h.scrollWidth - h.clientWidth,
  'Ô thứ 3 tràn khỏi Thùng (px)':
      Math.round(slot3.getBoundingClientRect().right - box.getBoundingClientRect().right),
  'Khu băng chuyền (% cao)':
      Math.round(document.getElementById('tray-area').getBoundingClientRect().height / innerHeight * 100),
  'Khay đang nhìn thấy':
      [...document.querySelectorAll('#trays-container .tray')]
        .filter(t => getComputedStyle(t).display !== 'none').length,
  'Khay engine cho phép': window.gameUI.engine.conveyor.maxActive,
});
```

Kết quả tham chiếu (bản hiện tại, 360×640, màn 25):

| Chỉ số | Hiện tại | Mục tiêu | Phase |
|---|---|---|---|
| Trang tràn ngang | 60px | **0px** | P0 |
| HUD tràn ngang (nút mất) | 73px (2 nút) | **0px (0 nút)** | P0 |
| Ô hàng thứ 3 tràn khỏi Thùng | 19px | **0px** | P0 |
| Emoji bị thanh nhôm cắt | 2/3 cột | **0/3 cột** | P0 |
| Khu băng chuyền chiếm | 36% | **≤ 22%** | P1 |
| Khay nhìn thấy / `maxActive` | 1 / 4 | **4 / 4** | P3 |
| `.front-face` (dải trống) / chiều cao Thùng | 28,5% | **≤ 9%** | P2 |
| Cỡ emoji nhỏ nhất (ở 360px) | 24,8px *nhưng bị cắt* | **≥ 24px, nhìn trọn vẹn** | P2 |
| `_renderNow()` (desktop) | 3,5 ms | **< 0,8 ms** | P5 |
| Node DOM mỗi cột | 78 | **≤ 22** | P5 |

> **Một lưu ý về cỡ emoji.** Đừng kỳ vọng emoji to lên nhiều: bề rộng cột do **số cột ×
> bề rộng máy** quyết định, mà số cột là tham số của bộ sinh màn — không được đổi.
> Ở 390px, trần vật lý của một ô là ~32px. Cái thu được từ P2 **không phải emoji to hơn
> nhiều, mà là emoji không còn bị cắt**, cộng với việc bỏ dải trống 28,5% và ô vuông
> đúng hình dạng của glyph. Ai hứa "emoji to gấp rưỡi" là đang hứa sai.
