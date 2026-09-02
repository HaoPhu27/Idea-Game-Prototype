# Phase 4 — Phản hồi cho người chơi

**Mức độ đổi gameplay: 0%.** Không thêm điểm, combo, sao, gợi ý hay bất kỳ hệ thống nào.
Phase này chỉ **bật lên những phản hồi đã được viết sẵn trong code nhưng chưa bao giờ chạy**,
cộng thêm 2 phản hồi tối thiểu cho hành động sai.

---

## 1. Bốn chỗ code đã có sẵn mà không dùng

### 1.1. `.box.selected` — CSS có, không ai gắn class

`style.css:113-117` đã định nghĩa:
```css
.box.selected { transform: translateY(-8px); }
.box.selected .front-face, .box.selected .flap { border-color: #38bdf8; }
```
Nhưng `BoxRenderer.render()` chỉ gắn `.selected` cho **ô nhỏ** bên trong:
```js
// src/ui/BoxRenderer.js:34-35
if (selectedSource && selectedSource.boxId === box.id && selectedSource.itemIndex === i) {
    slotEl.classList.add('selected');
}
```
Hộp cha không bao giờ nhận class. Kết quả: chọn một món hàng thì chỉ có emoji phóng to 1.4 lần,
còn hộp nguồn không nhô lên — người chơi khó thấy mình đang cầm gì.

**Sửa** — trong `BoxRenderer.render()`, cạnh chỗ gắn `valid-target`:
```js
if (selectedSource && selectedSource.boxId === box.id) boxEl.classList.add('selected');
```
Một dòng. CSS đã sẵn sàng từ đầu.

### 1.2. `.item-animating` — CSS có, không code nào dùng

`style.css:244-250`:
```css
.item-animating { position: fixed; z-index: 100; font-size: 24px;
                  transition: transform 0.3s cubic-bezier(...); pointer-events: none; }
```
`grep -rn "item-animating" src/` cho ra **0 kết quả**.

Hiện tại `BoxRenderer.animateItemTransfer()` chỉ nháy hộp đích:
```js
targetEl.style.transform = 'scale(1.1)';
setTimeout(() => { targetEl.style.transform = ''; onComplete(); }, 150);
```
Món hàng **không bay** từ hộp nguồn sang hộp đích. Người chơi mất dấu vật phẩm giữa hai lần vẽ lại.

**Sửa** — dùng đúng class đã có, không thêm CSS mới:
```js
animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
    const srcSlot = document.querySelector(
        `.box[data-box-id="${sourceBoxId}"] .slot.selected`);
    const targetEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);
    if (!srcSlot || !targetEl) { onComplete(); return; }

    const from = srcSlot.getBoundingClientRect();
    const to   = targetEl.getBoundingClientRect();

    const fly = document.createElement('div');
    fly.className = 'item-animating';
    fly.textContent = srcSlot.textContent;
    fly.style.left = `${from.left}px`;
    fly.style.top  = `${from.top}px`;
    document.body.appendChild(fly);

    const dx = (to.left + to.width / 2 - 12) - from.left;
    const dy = (to.top  + to.height / 2 - 12) - from.top;

    requestAnimationFrame(() => {
        fly.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
    });

    setTimeout(() => {
        fly.remove();
        targetEl.style.transform = 'scale(1.08)';
        setTimeout(() => { targetEl.style.transform = ''; onComplete(); }, 90);
    }, 300);   // khop voi transition 0.3s cua .item-animating
}
```
Tổng thời gian 390ms, chỉ hơn bản cũ 240ms. Không đổi luật, không đổi số nước đi.

#### ⚠️ Bắt buộc kèm theo: chặn tap trong lúc animation

Đây là **lỗi đã có sẵn**, không phải do đoạn code trên sinh ra — nhưng đoạn code
trên nới rộng nó nên phải vá cùng lúc.

`UIManager.handleSlotTap()` gọi `engine.selectTarget(boxId)` **đồng bộ trước**,
rồi mới vẽ lại DOM trong callback của `animateItemTransfer`
([UIManager.js:157-173](../../src/ui/UIManager.js)). Guard duy nhất hiện có là
`if (this.dragState.isDragging) return;` ([UIManager.js:145](../../src/ui/UIManager.js))
— **không có guard cho animation**.

Trong cửa sổ đó, engine đi trước DOM. Ví dụ cụ thể:

| | Hộp nguồn |
|---|---|
| Trước nước đi | `[🍎, 🍎, 🌏]` |
| Engine sau `removeItem(0)` | `[🍎, 🌏]` |
| DOM vẫn đang hiện | `[🍎, 🍎, 🌏]` |

Người chơi tap ô đang hiện 🍎 (vị trí 1) → engine `selectSource(box, 1)` = **🌏**.
**Chọn sai vật phẩm.**

Nhánh `isWrapped` còn nặng hơn: [UIManager.js:167](../../src/ui/UIManager.js) đợi
`setTimeout(..., 800)` — cửa sổ 800ms đã tồn tại từ trước, dài gấp đôi 390ms ở trên.

**Sửa** — cờ khoá quanh toàn bộ chuỗi animation, trong `UIManager`:
```js
handleSlotTap(boxId, itemIndex) {
    if (this.dragState.isDragging) return;
    if (this._animating) return;              // <== THEM DONG NAY
    ...
```
và bật/tắt cờ đúng ở hai nhánh của callback:
```js
if (this.engine.selectTarget(boxId)) {
    this._animating = true;                   // <== bat truoc khi animate
    const targetBox = this.engine.getBox(boxId);
    this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
        if (targetBox.isWrapped) {
            const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
            if (domBox) domBox.classList.add('wrapped');
            setTimeout(() => {
                this.updateRender();
                this._animating = false;      // <== tat sau khi ve xong
            }, 800);
        } else {
            this.updateRender();
            this._animating = false;          // <== tat sau khi ve xong
        }
    });
}
```
Khởi tạo `this._animating = false;` trong `constructor`.

⚠️ Cờ **phải** được tắt trong *mọi* đường thoát. `animateItemTransfer` có nhánh
`if (!srcSlot || !targetEl) { onComplete(); return; }` — nhánh đó vẫn gọi
`onComplete()` nên cờ vẫn được tắt. Nếu sửa lại hàm này về sau, giữ nguyên bất biến:
**mọi đường đi đều gọi `onComplete()` đúng một lần.** Bỏ sót ⇒ game khoá cứng.

Không đổi luật, không đổi `moveCount`: guard chỉ **bỏ qua** tap trong ~390ms,
mà tap đó vốn dĩ đang cho ra kết quả sai.

#### ⚠️ Ghi nhận: overlay thắng/thua hiện sớm hơn lưới hộp

Cùng gốc rễ, nhưng **không** sửa trong phase này. `checkConditions()` chạy ở cuối
`selectTarget()` nên `onGameStateChanged` bật overlay
([UIManager.js:70-74](../../src/ui/UIManager.js)) **trước khi animation bắt đầu**
⇒ overlay hiện sớm hơn lưới hộp 150ms (hoặc 800ms ở nhánh wrapped). Đây là hành vi
có sẵn của bản gốc; sửa nó là đổi cảm giác game, nên để nguyên. Ghi ở đây để người
đọc [P6 §3.1](P6-hieu-nang.md) không quy nhầm độ trễ này cho `requestAnimationFrame`.

### 1.3. `engine.onBoxWrapped` — có trong engine, UIManager không đăng ký

`src/core/GameEngine.js:16` khai báo và dòng 107 gọi:
```js
if (this.onBoxWrapped) this.onBoxWrapped(targetBox);
```
`UIManager.bindEngineCallbacks()` đăng ký 4 callback (`onGameStateChanged`, `onMoveCountUpdated`,
`onBoxUpdated`, `onTrayExited`) và **bỏ sót cái thứ 5**.

Hiện `UIManager.handleSlotTap()` phải tự đoán bằng tay:
```js
if (targetBox.isWrapped) {
    const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
    if (domBox) domBox.classList.add('wrapped');
    setTimeout(() => { this.updateRender(); }, 800);
}
```
Cách này chỉ chạy đúng ở nhánh tap. Nếu sau này có đường nào khác làm hộp đầy,
hiệu ứng gói sẽ không hiện.

**Sửa** — đăng ký callback, giữ nguyên thời lượng 800ms đã cân:
```js
this.engine.onBoxWrapped = (box) => {
    const el = document.querySelector(`.box[data-box-id="${box.id}"]`);
    if (!el) return;
    el.classList.add('wrapped');            // kich hoat gap nap + dan bang keo + bounce
    if (navigator.vibrate) navigator.vibrate(35);
};
```
`.box.wrapped` trong `style.css:181-212` đã có sẵn hiệu ứng gấp nắp (0.5s), băng keo (0.3s)
và `animation: bounce 1s infinite 0.8s`. Không cần viết CSS mới.

### 1.4. Băng chuyền không nháy khi khay rời đi

Đã xử lý ở [Phase 3](P3-conveyor.md) mục 2.4 (`@keyframes moveBelt` bị thiếu).

---

## 2. Hai phản hồi còn thiếu hoàn toàn

### 2.1. Nước đi sai — hiện tại im lặng tuyệt đối

`UIManager.handleSlotTap()` nhánh else:
```js
} else {
    this.engine.deselectSource();
    if (itemIndex !== null && sourceId !== boxId) this.engine.selectSource(boxId, itemIndex);
    this.updateRender();
}
```
Khi `engine.selectTarget()` trả về `false` (hộp đích đã gói, đã đầy, hoặc khác loại),
lựa chọn bị huỷ **không một dấu hiệu nào**. Người chơi tưởng máy không nhận cú chạm.

**Sửa** — thêm 1 keyframes + 1 class, dùng lại đúng bảng màu `--highlight-reject` đã có
trong `:root` (`style.css:8`):
```css
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%      { transform: translateX(-5px); }
    75%      { transform: translateX(5px); }
}
.box.reject { animation: shake 0.22s ease-in-out; }
.box.reject .front-face, .box.reject .flap { border-color: var(--highlight-reject); }
```
```js
// trong nhanh else cua handleSlotTap, truoc updateRender()
const el = document.querySelector(`.box[data-box-id="${boxId}"]`);
if (el) {
    el.classList.add('reject');
    setTimeout(() => el.classList.remove('reject'), 220);
}
if (navigator.vibrate) navigator.vibrate(18);
```
Lưu ý: `updateRender()` vẽ lại DOM nên phải gắn class **sau** khi render xong,
hoặc gọi `requestAnimationFrame` một nhịp. Xem P6 mục DOM diff — sau khi bỏ
`innerHTML = ''` thì vấn đề này tự hết.

### 2.2. Rung (haptic) — 4 điểm, tổng cộng 4 dòng

`navigator.vibrate` có sẵn trên Android WebView/Chrome, không cần thư viện,
không cần asset, không đổi luật chơi. Nếu thiết bị không hỗ trợ thì lệnh bị bỏ qua.

| Sự kiện | Vị trí | Độ dài |
|---|---|---|
| Chọn món hàng thành công | `handleSlotTap`, sau `selectSource` | `12` |
| Nước đi sai | mục 2.1 | `18` |
| Hộp được gói | `onBoxWrapped`, mục 1.3 | `35` |
| Khay rời băng chuyền | `onTrayExited` | `[20, 40, 20]` |

Không rung khi thắng/thua — hai overlay đã có sẵn là đủ mạnh.

---

## 3. Âm thanh — chưa làm ở phase này

Game gốc **không có âm thanh nào**. Thêm tiếng kêu sẽ kéo theo:
- file `.mp3`/`.ogg` nhúng base64 → bản standalone phình thêm 100-300 KB (xem ngân sách P1),
- một nút tắt tiếng trên `#game-header` → thay đổi bố cục HUD gốc,
- xử lý `AudioContext` bị treo cho tới cú chạm đầu tiên trên iOS/Android.

Ba thứ đó đều vi phạm nguyên tắc "giống hệt game gốc". Nếu muốn có âm thanh,
hãy coi đó là một phase riêng và quyết định trước về nút tắt tiếng.

---

## 4. Những thứ **không** được thêm

Đây là những thứ bản hướng dẫn cũ (v1) đã đề xuất sai và nay bị loại bỏ:

- ❌ Điểm số, hệ số combo, chuỗi liên hoàn — `GameEngine` không có khái niệm điểm.
- ❌ Xếp hạng sao khi thắng — `onGameStateChanged` chỉ có `'won'` / `'lost'`.
- ❌ Cảnh báo sắp thua, gợi ý nước đi, nút hoàn tác — không có trong engine.
- ❌ Hoạt ảnh ăn mừng toàn màn hình, pháo hoa — không có trong game gốc.
- ❌ Thay emoji bằng sprite sheet — 12 emoji là art direction có chủ đích.

Mọi thứ trong Phase 4 đều **chỉ làm hiện ra thứ đã tồn tại**.

---

## 5. Danh sách kiểm tra

- [ ] `BoxRenderer.render()` gắn `.selected` cho hộp nguồn — hộp nhô lên 8px, viền xanh `#38bdf8`.
- [ ] Chạm món hàng rồi chạm hộp đích: thấy emoji **bay** từ hộp này sang hộp kia.
- [ ] `grep -rn "item-animating" src/` giờ phải ra ≥ 1 kết quả.
- [ ] Hộp thứ 3 vào hộp: nắp gấp, băng keo chạy, hộp nảy — không phụ thuộc `setTimeout` thủ công.
- [ ] `grep -n "onBoxWrapped" src/ui/UIManager.js` phải ra kết quả.
- [ ] Chạm vào hộp đích sai loại: hộp rung ngang, viền đỏ 0.22s, máy rung nhẹ.
- [ ] Số nước đi trên HUD **không** đổi so với trước khi sửa (chạy lại cùng một màn).
- [ ] Bật DevTools → Rendering → không có `layout shift` mới khi vật phẩm bay.

---

**Tiếp theo:** [P5 — Chạm & kéo](P5-cham-keo.md)
