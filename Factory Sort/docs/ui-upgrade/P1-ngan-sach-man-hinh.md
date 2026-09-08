# Phase 1 — Ngân sách màn hình: trả pixel về cho bàn chơi

**Mức độ đổi gameplay: 0%, NHƯNG có rủi ro thật.**
Phase này chạm vào các biến hình học mà `checkQueuePickup()` đang phụ thuộc. **Bắt buộc
làm §1.4 trước §1.5.** Làm sai thứ tự sẽ đổi nhịp giao hàng và đổi tỉ lệ thua ở màn khó.

---

## 1.1. Ngân sách hiện tại — số đo, không phải cảm tính

Máy 360×640 (Android phổ thông), màn 25:

| Khu | Cao | % màn hình | Thông tin thật sự chứa |
|---|---|---|---|
| `#game-header` | 64px | 10% | Số màn, số nước đi, 4 nút |
| `#tray-area` (băng chuyền) | **230px** | **36%** | **1 Khay đơn hàng** + hàng chờ 5 ô |
| `#boxes-area` (bàn chơi) | 344px | 54% | **12 Thùng** (trên tổng 52) |

Máy 390×844, màn 25:

| Khu | Cao | % |
|---|---|---|
| Header | 64px | 8% |
| Băng chuyền | 230px | 27% |
| Bàn chơi | 548px | 65% |

**Vấn đề:** `#tray-area` bị khoá cứng ở 230px bởi `ab_test/index.html:26-41`:

```css
#tray-area {
    flex: 0 0 230px !important;
    --belt-h: 215px !important;
    height: 230px !important;
    min-height: 230px !important;
    max-height: 230px !important;
}
```

Năm chỗ `!important` đè lên `style.css:1228` (`flex: 50`). Khu này **không co theo màn
hình**. Ở máy 640px nó ăn 36%; ở máy 900px nó vẫn 230px và bàn chơi được nhiều hơn.
Người chơi máy yếu — đúng đối tượng của thể loại này — bị thiệt nhất.

**Bên trong 230px đó có gì:** một hình chữ nhật bo góc 366×215 với viền nét đứt, chứa
- bảng hàng chờ 260×71 (=18.460 px²)
- trung bình **1 Khay** 68×72 (=4.896 px²)

Tổng nội dung = 23.356 px² trên 78.690 px² khung = **29,7%**. **70% khu quan trọng nhất
màn hình là nền trống có viền nét đứt.**

---

## 1.2. Mục tiêu

| Chỉ số | Hiện tại (360×640) | Mục tiêu |
|---|---|---|
| Khu đơn hàng | 230px cố định (36%) | **co giãn, tối đa 22%** (≈140px ở 640px) |
| Bàn chơi | 344px (54%) | **≥ 434px (68%)** |
| Khay nhìn thấy | 1/4 | **4/4** |
| Nội dung / diện tích khu đơn hàng | 29,7% | **≥ 60%** |

Ràng buộc: **không được hiện quá `maxActive` Khay** (bất biến §1 README). Mục tiêu là
hiện **đủ** `maxActive`, không phải hiện nhiều hơn.

---

## 1.3. Ý tưởng: NÉN vòng chạy, đừng bỏ nó

> **⚠️ Sửa ngày 8/9/2026 — bản đầu của mục này đã SAI và đã làm hỏng conveyor.**
> Bản đầu đề xuất thay vòng chạy bằng **một làn thẳng một chiều**. Đã cài đặt
> (commit `d18e48e`) và hỏng. Hai lý do, đều đo được, đều không sửa được bằng
> cách chỉnh tham số:
>
> 1. **Làn thẳng không bao giờ hiện đủ `maxActive` Khay.** Khay phải trượt vào và
>    ra ở hai đầu, nên mỗi Khay chỉ "đọc được" ~78% thời gian. Ở màn 1 (2 Khay)
>    chỉ **57% số khung hình** thấy đủ cả hai.
> 2. **Ở màn 50, `maxActive` lên 6–7.** 7 Khay × 62px = **434px**, trong khi làn
>    chỉ rộng ~340px ở máy 360px. Không đủ chỗ, chấm hết.
>
> Vòng chạy của bản delivery **không mắc cả hai lỗi này**: chu vi ≈ 2× bề rộng
> làn nên chứa được cả 7 Khay và không Khay nào phải rời khung. Đó là lý do
> delivery làm vậy ngay từ đầu — không phải thiếu suy nghĩ.

Điều **vẫn đúng** trong phân tích ban đầu: khu đơn hàng đang cao **quá mức cần
thiết**. Nhưng cách thu là **nén vòng chạy**, không phải bỏ nó.

Vòng chạy chỉ cần đủ cao cho **hai nhánh Khay xếp chồng**:

```
chiều cao vòng ≥ 2 × chiều cao Khay + lề
```

Với Khay 50px → **112px là đủ**, so với **242px** của delivery. Vẫn tiết kiệm
130px mà không mất gì.

```
DELIVERY (242px)                       SAU KHI NÉN (112px + hàng chờ 68px)
┌───────────────────────────────┐      ┌───────────────────────────────┐
│ ← OUT                  IN ↓   │      │[OUT]  🐧      🐰      🍕 [IN] │ nhánh trước
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │      │       ⚽             🔨       │ nhánh sau
│ │        (trống)            │ │      └───────────────────────────────┘
│ │   ┌─────────────────┐     │ │      ┌───────────────────────────────┐
│ │   │  hàng chờ 1/5   │     │ │      │ HÀNG CHỜ            1/5        │
│ │   └─────────────────┘     │ │      │ [📦][  ][  ][  ][  ]          │
│ │        [🐰] ← 1 Khay      │ │      └───────────────────────────────┘
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└───────────────────────────────┘        Tiết kiệm ~62px, và hàng chờ
                                          KHÔNG còn nằm trong lòng vòng chạy
```

Hai thay đổi so với delivery, cả hai đều bắt buộc:

**(a) Hàng chờ ra khỏi lòng vòng chạy, thành hàng riêng bên dưới.**
Ở delivery, hàng chờ là "sàn tập kết" giữa vòng — hợp lý khi vòng cao 242px.
Khi nén xuống 112px, khoảng giữa hai nhánh chỉ còn ~12px, không chứa nổi hàng
chờ 68px. Bắt nó nằm trong đó chính là lỗi đã xảy ra: bảng hàng chờ bị nền băng
tải đè lên và **biến mất hoàn toàn**.

**(b) Kích thước Khay phải co giãn theo `slotCount`.**
Khay 62px cố định sẽ chồng lên nhau khi vòng thấp, và tràn chu vi khi `maxActive`
lớn. Ràng buộc hai phía:

```js
trayH ≤ (chiều cao vòng − lề) / 2          // hai nhánh xếp chồng
n × (trayW + 6) ≤ chu vi vòng               // đủ chỗ trên chu vi
```

Đây là **trình bày thuần tuý** — không đổi `maxActive`, không đổi thứ tự Khay,
không đổi luật nhận hàng.

---

## 1.4. ⚠️ BƯỚC BẮT BUỘC LÀM TRƯỚC: tách giao hàng khỏi hình học

**Không được đổi một pixel bố cục nào trước khi làm xong mục này.**

### Vấn đề

`ab_test/src/ui/UIManager.js:756-805`, `checkQueuePickup()`:

```js
// UIManager.js:787-790
const g  = this.trayRenderer.geom;
const pt = this.trayRenderer.getTrackPoint(trayObj.currentTheta);
const isFrontTrack = Math.abs(pt.y - (g.cy - g.hy)) < 22;   // "Khay ở nhánh trước?"
if (!isFrontTrack) continue;

// UIManager.js:795-800
const slotCenterX = slotRect.left + slotRect.width / 2;
const trayCenterX = trayRect.left + trayRect.width / 2;
if (Math.abs(trayCenterX - slotCenterX) <= 28) {            // "Khay trùng ô hàng chờ?"
    this.triggerQueueDelivery(box, matchingTray, slotEl, trayEl);
```

Sự kiện "giao hàng" đang là hàm của `g.cy`, `g.hy`, `getTrackPoint()`, `slotRect`, `trayRect`.
Đổi `--belt-h` từ 215 → 120 làm `hy` đổi từ 100,5 → 53 → ngưỡng `< 22` bắt sai nhánh;
đổi bề rộng bảng hàng chờ làm `slotCenterX` dịch → thời điểm giao lệch. Hệ quả: hàng chờ
giải toả chậm hơn hoặc nhanh hơn → **ở màn 39/49 (siêu khó, `maxQueueSize` là ràng buộc
sống còn) có thể đổi kết quả thắng/thua.**

### Cách tách

Thay điều kiện hình học bằng **một vùng giao khai báo được**, do renderer tự công bố.

**Bước 1** — `TrayRenderer` công bố "Khay này đang ở vùng giao hay không", tính bằng
**tham số vòng chạy đã chuẩn hoá (`0…1`)**, không bằng pixel:

```js
// ab_test/src/ui/TrayRenderer.js — thêm hằng số và hàm mới

/**
 * Vùng giao hàng, tính theo TIẾN ĐỘ CHUẨN HOÁ trên vòng chạy (0 = cổng IN, 1 = quay lại IN).
 *
 * ĐÂY LÀ HỢP ĐỒNG GAMEPLAY, KHÔNG PHẢI THAM SỐ TRÌNH BÀY.
 * Bề rộng cửa sổ 0.055 được chọn để tái lập ĐÚNG hành vi cũ: ở hình học cũ
 * (belt 366×215, khay 68px, ngưỡng ±28px) cửa sổ giao chiếm 28×2 / chu vi ≈ 5,5%.
 * Nếu đổi số này, nhịp giao hàng đổi -> ĐỔI GAMEPLAY. Không đổi khi làm việc UI.
 */
static get DELIVERY_WINDOW() { return 0.055; }

/** Tiến độ 0..1 của một Khay trên vòng chạy, 0 tại cổng IN. */
getTrackProgress(theta) {
    return (((-theta) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
}

/**
 * Khay có đang nằm trong cửa sổ giao ứng với ô hàng chờ thứ slotIdx không.
 * slotCount ô hàng chờ chia đều trên đoạn chạy đọc được của vòng.
 */
isInDeliveryZone(trayObj, slotIdx, queueLength) {
    const p = this.getTrackProgress(trayObj.currentTheta);
    // Tâm cửa sổ giao của ô slotIdx: giữ nguyên phân bố cũ (ô 0 gặp Khay trước tiên).
    const center = this.deliveryCenterForSlot(slotIdx, queueLength);
    let d = Math.abs(p - center);
    if (d > 0.5) d = 1 - d;                       // vòng tròn
    return d <= TrayRenderer.DELIVERY_WINDOW / 2;
}
```

**Bước 2** — `deliveryCenterForSlot()` là **chỗ duy nhất** biết bố cục. Hôm nay nó suy ra
từ vị trí DOM của ô hàng chờ; ngày mai đổi bố cục thì chỉ sửa đúng hàm này:

```js
deliveryCenterForSlot(slotIdx, queueLength) {
    const slotEl = document.querySelectorAll('.queue-slot')[slotIdx];
    if (!slotEl) return 0.5;
    // Ánh xạ tâm ô hàng chờ (px) sang tiến độ vòng chạy (0..1) trên nhánh đọc được.
    return this._progressAtScreenX(slotEl.getBoundingClientRect().left
                                 + slotEl.getBoundingClientRect().width / 2);
}
```

**Bước 3** — `UIManager.checkQueuePickup()` không còn biết gì về pixel:

```js
// ab_test/src/ui/UIManager.js:787-801 — THAY TOÀN BỘ khối hình học bằng:
if (!this.trayRenderer.isInDeliveryZone(trayObj, slotIdx, queue.length)) continue;
this.triggerQueueDelivery(box, matchingTray, slotEl, trayEl);
break;
```

### Chứng minh không đổi gameplay

Trước khi merge, chạy **kiểm chứng A/B nhịp giao** trên bản cũ và bản mới:

```js
// Dán vào Console, chạy trên CẢ HAI bản, so sánh mảng kết quả.
window.__deliveryLog = [];
const orig = window.gameUI.triggerQueueDelivery.bind(window.gameUI);
window.gameUI.triggerQueueDelivery = function (box, tray, s, t) {
    window.__deliveryLog.push({
        t: Math.round(performance.now()),
        box: box.id, tray: tray.id,
        theta: +window.gameUI.trayRenderer.trayElements
                  .find(x => x.id === tray.id).currentTheta.toFixed(3),
    });
    return orig(box, tray, s, t);
};
// Chơi 30 nước ở màn 39, rồi: copy(JSON.stringify(window.__deliveryLog))
```

**Tiêu chí đạt:** cùng chuỗi nước đi → cùng dãy `(box, tray)` theo đúng thứ tự, và
`theta` tại thời điểm giao lệch **≤ 0,05 rad**. Nếu thứ tự khác nhau dù chỉ một cặp,
`DELIVERY_WINDOW` đã bị chỉnh sai — quay lại tinh chỉnh, đừng merge.

---

## 1.5. Tái phân bổ chiều cao

Chỉ làm sau khi §1.4 đạt.

### Bước 1 — dọn `!important` khỏi `index.html`

Xoá toàn bộ khối `<style>` ở `ab_test/index.html:10-104`. Chuyển sang `style.css` dưới một
selector gốc, để `style.css` là nguồn sự thật duy nhất:

```html
<!-- ab_test/index.html -->
<body data-layout="inverted">
```

```css
/* style.css — cuối file, khối riêng cho bản A/B */
[data-layout="inverted"] #play-area  { display: flex; flex-direction: column; }
[data-layout="inverted"] #tray-area  { order: 1; }
[data-layout="inverted"] #boxes-area { order: 2; }
[data-layout="inverted"] .tutorial-banner {
    top: auto;
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}
```

Không còn `!important` nào. Nếu vẫn cần, nghĩa là độ ưu tiên selector sai — sửa selector.

### Bước 2 — khu đơn hàng co giãn có trần

```css
[data-layout="inverted"] #tray-area {
    /* Co theo màn hình, nhưng không bao giờ vượt 22% và không dưới 108px */
    flex: 0 0 clamp(108px, 20vh, 152px);
    height: auto;
    min-height: 0;
    max-height: none;

    --belt-inset : 10px;
    --belt-h     : clamp(96px, 18vh, 138px);
    --belt-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
    --belt-radius: 18px;
}
```

Kết quả theo máy:

| Máy | `#tray-area` cũ | mới | Bàn chơi được thêm |
|---|---|---|---|
| 360×640 | 230px (36%) | **128px (20%)** | **+102px** |
| 390×844 | 230px (27%) | **152px (18%)** | **+78px** |
| 430×932 | 230px (25%) | **152px (16%)** | **+78px** |

### Bước 3 — bàn chơi ăn hết phần dư

```css
[data-layout="inverted"] #boxes-area {
    flex: 1 1 auto;
    min-height: 0;
    padding: 6px 24px calc(10px + env(safe-area-inset-bottom, 0px)) 24px;
}
```

Chú ý padding dưới: bản hiện tại để `42px` cứng (`index.html:45`) cho phần chân băng tải
`.conveyor-extrusion-legs`. Sau khi P5 bỏ bớt trang trí, con số này còn 10px.

### Bước 4 — kiểm tra `_fitBoxHeight` ăn theo đúng

`ab_test/src/ui/BoxRenderer.js:261` chia chiều cao khả dụng cho `visibleRows`. Nó đã có
`ResizeObserver` (`BoxRenderer.js:15`) nên tự cập nhật — **không cần sửa ở phase này**.
Chỉ cần xác nhận số ra đúng:

```js
// Sau khi đổi bố cục, ở 360×640 màn 25:
getComputedStyle(document.getElementById('boxes-grid')).getPropertyValue('--box-h')
// Kỳ vọng: ~104px  (trước: ~66px)
```

> **Chiều cao thu được không phải lúc nào cũng nên đổ hết vào Thùng.**
> Ở máy ngắn (≤ 700px) thì có — bàn chơi đang chật thật. Ở máy cao (≥ 800px) thì bàn chơi
> vốn đã **thừa** chiều cao: 4 hàng trong 576px là 144px/hàng, trong khi một Thùng chỉ cần
> ~84px. Kéo giãn thêm chỉ tạo ra khoảng trống bên trong Thùng và những đoạn ray băng tải
> rỗng — đúng thứ đang xấu ở màn 1.
>
> Phase 2 §2.4b sẽ đặt trần cho `--box-h` và căn giữa khối bàn chơi. **Ở P1 chưa làm việc
> đó**, nên tạm thời máy cao sẽ thấy Thùng hơi phình — đó là trạng thái trung gian, chấp
> nhận được trong một PR.

---

## 1.6. Vì sao không đơn giản là "làm băng chuyền nhỏ lại"

Từng thử và sẽ hỏng: `--belt-h` nhỏ lại làm `hy` nhỏ lại, hai nhánh chạy sát nhau, Khay
ở nhánh sau lọt vào ngưỡng `Math.abs(pt.y − (cy − hy)) < 22` của nhánh trước →
`checkQueuePickup()` **giao hàng cho Khay đang chạy ngược về**. Người chơi thấy Thùng bay
ngược chiều băng tải. Đó chính là lý do §1.4 phải làm trước, và là lý do §1.3 bỏ hẳn
nhánh chạy khuất thay vì bóp nó lại.

---

## Checklist nghiệm thu Phase 1

- [ ] `ab_test/index.html` không còn khối `<style>` nội tuyến, không còn `!important`
- [ ] Ở 360×640: `#tray-area` ≤ 22% chiều cao, `#boxes-area` ≥ 66%
- [ ] `--box-h` ở màn 25 / 360×640 tăng từ ~66px lên ≥ 100px
- [ ] Đủ `maxActive` Khay nhìn thấy trong vòng 1 giây sau khi vào màn (xem P3)
- [ ] **Kiểm chứng A/B nhịp giao (§1.4) đạt**: cùng dãy `(box, tray)`, `theta` lệch ≤ 0,05 rad
- [ ] Chơi màn 39 và 49 (siêu khó) 5 lần mỗi màn ở cả hai bản: **tỉ lệ thua như nhau**
- [ ] `npm test` xanh
- [ ] Không file nào trong `src/core/`, `src/generator/`, `src/data/` bị sửa (`git diff --stat`)
