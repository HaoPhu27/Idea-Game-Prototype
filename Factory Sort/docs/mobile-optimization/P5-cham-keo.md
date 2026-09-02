# Phase 5 — Chạm & kéo trên điện thoại

**Mức độ đổi gameplay: 0%.** Luật chơi, số nước đi, điều kiện thắng/thua giữ nguyên.
Phase này chỉ sửa **độ tin cậy của thao tác**: hiện tại có 5 lỗi khiến người chơi
chạm mà máy không nhận, hoặc kéo mà hộp nhảy lung tung.

---

## 1. Bóng kéo (drag ghost) lệch khỏi ngón tay

`UIManager.moveGhost()`:
```js
moveGhost(x, y) {
    this.dragGhost.style.left = `${x}px`;
    this.dragGhost.style.top  = `${y}px`;
}
```
Đặt **góc trên-trái** của bóng ngay tại đầu ngón tay. Hộp 120×70 nên toàn bộ hình
nằm chéo xuống dưới-phải, và **ngón tay che mất góc duy nhất đang bám vào con trỏ**.

Bằng chứng đây là lỗi chứ không phải chủ ý: chính đoạn thả trong `handleDragEnd`
lại tính theo tâm hộp:
```js
this.dragGhost.style.left = `${targetX - 60}px`;   // 120/2
this.dragGhost.style.top  = `${targetY - 35}px`;   // 70/2
```
Hai công thức mâu thuẫn nhau ⇒ ngay khoảnh khắc nhả tay, bóng **nhảy giật (60px, 35px)**
trước khi bay vào khay.

**Sửa** — đo hộp gốc một lần lúc bắt đầu kéo, dùng chung cho cả kéo lẫn thả:
```js
// trong handleDragStart, sau khi lay boxEl
const r = boxEl.getBoundingClientRect();
this.dragState.ghostW = r.width;
this.dragState.ghostH = r.height;
this.dragGhost.style.width  = `${r.width}px`;
this.dragGhost.style.height = `${r.height}px`;
```
```js
moveGhost(x, y) {
    const w = this.dragState.ghostW || 120;
    const h = this.dragState.ghostH || 70;
    this.dragGhost.style.left = `${x - w / 2}px`;
    this.dragGhost.style.top  = `${y - h / 2 - this.GHOST_LIFT}px`;
}
```
với `this.GHOST_LIFT = 28;` khai báo trong constructor — nâng hộp lên trên ngón tay
28px để người chơi **nhìn thấy thứ mình đang cầm**. Đây là quy ước chuẩn của
mọi game kéo-thả trên di động, không đổi luật gì.

Trong `handleDragEnd`, thay `- 60` / `- 35` bằng `- w/2` / `- h/2` để hai bên khớp nhau.

### 1.1. ⚠️ Bắt buộc làm cùng lúc với Phase 2

`handleDragStart` sao chép class: `this.dragGhost.className = boxEl.className;`
nên bóng nhận toàn bộ style của `.box`. Sau khi [Phase 2](P2-khung-hinh-mobile.md)
đổi `.box` thành `width: 100%; aspect-ratio: 12/7`, mà `#drag-ghost` lại
`position: fixed` (block chứa là **viewport**) ⇒ bóng sẽ rộng bằng cả màn hình.

Đoạn đo `getBoundingClientRect()` ở trên đã ghi đè `width`/`height` bằng pixel tuyệt đối
nên chặn được lỗi này. **Không được bỏ qua.** Thêm vào `style.css`:
```css
#drag-ghost { box-sizing: border-box; }
```

---

## 2. Cú chạm "ma" sau mỗi lần kéo

`BoxRenderer` chặn chạm nhầm bằng:
```js
if (document.body.classList.contains('is-dragging')) return;
```
Nhưng `handleDragEnd` gỡ class **đồng bộ** ngay trong `pointerup`:
```js
document.body.classList.remove('is-dragging');
```
Trình duyệt bắn `click` **sau** `pointerup`. Lúc đó class đã biến mất ⇒ lá chắn vô dụng,
và mỗi lần kéo xong lại kèm một `onSlotTap()` không ai mong muốn.

**Sửa** — gỡ class ở khung hình kế tiếp, sau khi `click` đã đi qua:
```js
requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.remove('is-dragging'));
});
```
Hoặc gọn hơn: `setTimeout(() => document.body.classList.remove('is-dragging'), 0);`

---

## 3. `click` thay vì pointer — trễ và dễ trượt

`BoxRenderer` dùng `slotEl.addEventListener('click', ...)`. Trên Android, `click`
sinh ra từ chuỗi `touchstart → touchend → click` và có thể trễ tới 300ms nếu
trình duyệt còn chờ xem người dùng có nháy đúp để zoom hay không.

[Phase 2](P2-khung-hinh-mobile.md) đã thêm `user-scalable=no` vào thẻ viewport,
việc đó **tự nó loại bỏ độ trễ 300ms** trên Chrome Android hiện đại.
Vì vậy **không cần đổi `click` sang `pointerup`** — giữ nguyên để tránh rủi ro
phá vỡ luồng đã hoạt động ổn định. Chỉ cần đảm bảo Phase 2 được áp dụng trước.

---

## 4. Ngón tay che mất khay đích

`handleDragMove` dò trúng đích ngay tại đầu ngón tay:
```js
const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
const trayEl = elementsUnder.find(el => el.classList && el.classList.contains('tray'));
```
Nhưng sau mục 1, thứ người chơi **nhìn thấy** lại nằm cao hơn 28px. Mắt và tay không khớp:
họ căn hộp vào khay thì máy lại dò ở chỗ khác.

**Sửa** — dò tại **tâm bóng**, đúng chỗ mắt đang nhìn:
```js
handleDragMove(e) {
    if (!this.dragState.isDragging) return;
    e.preventDefault();
    this.moveGhost(e.clientX, e.clientY);

    const hitY = e.clientY - this.GHOST_LIFT;          // cung diem ma moveGhost dung
    const under = document.elementsFromPoint(e.clientX, hitY);
    const trayEl = under.find(el => el.classList && el.classList.contains('tray'));
    ...
}
```
`handleDragEnd` **không** dùng toạ độ — nó đọc `this.dragState.targetTrayId` do
`handleDragMove` ghi lại — nên chỉ cần sửa một chỗ.

## 5. Khay quá nhỏ để chạm trúng

`.tray` là 80×100px, nhưng phần **nhìn thấy được** còn nhỏ hơn: khay ở nửa sau
băng chuyền bị [Phase 3](P3-conveyor.md) thu nhỏ còn `scale(0.76)` ⇒ vùng chạm thật
chỉ khoảng 61×76px, và `elementsFromPoint` dò theo hình đã biến đổi.

**Sửa** — nới vùng chạm bằng lớp đệm trong suốt, **không** đổi kích thước hiển thị:
```css
.tray::before {
    content: '';
    position: absolute;
    inset: -14px -10px -20px -10px;   /* rong them 10px moi ben, cao them 14/20px */
    border-radius: 12px;
}
```
Pseudo-element được tính vào vùng hit-test của phần tử cha, nên `elementsFromPoint`
vẫn trả về đúng `.tray`. Không thêm DOM node, không ảnh hưởng hình vẽ.

Lưu ý thứ tự: `.tray` đã có `position: relative` (`style.css:310`) nên `inset` neo đúng.

## 6. Ô trong hộp nhỏ hơn ngưỡng chạm

Hộp 120×70 chia 3 ô ⇒ mỗi ô rộng **40px**, cao 50px. Trên màn 360px sau Phase 2,
hộp còn ~106px ⇒ ô rộng **~35px**. Khuyến nghị của Android là 48dp.

Không thể nới ngang vì 3 ô phải nằm vừa trong một hộp — đó là bố cục gốc của game.
Hai cách bù, chọn **một**:

| Cách | Việc phải làm | Đánh đổi |
|---|---|---|
| **A (khuyến nghị)** | Giảm `gap` của `#boxes-grid` từ `clamp(8px,3vw,20px)` xuống `clamp(6px,2vw,20px)` | Ô rộng thêm ~2px, desktop không đổi vì `max-width:400px` vẫn chặn |
| B | Cho `.slot` `::after` đệm dọc `inset: -6px 0` | Chỉ nới chiều cao, chiều ngang vẫn 35px |

Cả hai đều **không** đổi số ô, số hộp hay cách xếp.

---

## 7. Danh sách kiểm tra

- [ ] Kéo một hộp đã gói: hình hộp nằm **trên** ngón tay, tâm hộp thẳng hàng với ngón.
- [ ] Nhả tay: hộp bay thẳng vào khay, **không** giật một nhịp sang phải-xuống.
- [ ] Kéo rồi thả ra chỗ trống: không có ô nào bị chọn ngoài ý muốn (lỗi mục 2).
- [ ] Trên máy 360px: bóng kéo vẫn là hình hộp nhỏ, **không** rộng bằng màn hình (mục 1.1).
- [ ] Rê hộp tới khay ở nửa sau băng chuyền: khay vẫn sáng viền được.
- [ ] Chạm nhanh 20 lần vào các ô: không lần nào bị bỏ qua, không zoom, không chọn chữ.
- [ ] `#move-display` tăng đúng như trước khi sửa (chạy lại cùng một màn).

---

**Tiếp theo:** [P6 — Hiệu năng](P6-hieu-nang.md)
