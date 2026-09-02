# Phase 6 — Hiệu năng trên máy Android tầm trung

**Mức độ đổi gameplay: 0%.** Không đổi luật, không đổi hình. Chỉ đổi *cách* trình duyệt vẽ.

Mục tiêu: giữ 60fps khi băng chuyền quay, và không hao pin khi màn hình đứng yên.

---

## 1. Vòng lặp animation không bao giờ dừng

`src/ui/TrayRenderer.js` gọi `requestAnimationFrame(this.animate)` **ngay trong constructor**
(dòng 13) và cuối mỗi lần `animate()` lại gọi tiếp — **vô điều kiện**.

Hậu quả: kể cả khi
- màn chơi chưa sinh xong (đang hiện `#overlay-loading`),
- đã thắng và `#overlay-win` che kín màn hình,
- băng chuyền không còn khay nào,

vòng lặp vẫn chạy 60 lần/giây, mỗi lần đều gọi `updatePositions()`.

**Sửa** — cho vòng lặp tự tắt khi không có gì để vẽ:
```js
// constructor: thay requestAnimationFrame(this.animate) bang
this.running = false;

start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();      // tranh nhay mot buoc lon sau khi dung lau
    requestAnimationFrame(this.animate);
}

animate(now) {
    if (!this.running) return;
    ...                                      // giu nguyen toan bo than ham
    this.updatePositions();
    if (this.trayElements.length === 0) { this.running = false; return; }
    requestAnimationFrame(this.animate);
}
```
Trong `render()`, sau khi đồng bộ xong danh sách khay:
```js
if (this.trayElements.length > 0) this.start();
```
`this.lastTime = performance.now()` khi khởi động lại là bắt buộc: nếu không,
`now - this.lastTime` sẽ là một con số khổng lồ. Bản gốc đã có `Math.min(dt, 50)` chặn,
nhưng gán lại vẫn sạch hơn.

**Không** cần xử lý `document.hidden` — trình duyệt tự dừng `requestAnimationFrame`
khi tab/app xuống nền.

---

## 2. Mỗi khung hình đều gây reflow

### 2.1. Đọc `clientWidth` mỗi frame
Đã xử lý ở [Phase 3 mục 2.1](P3-conveyor.md) bằng `ResizeObserver`. Không lặp lại ở đây.

### 2.2. Ghi `left` và `bottom` mỗi frame

`updatePositions()` hiện đặt vị trí bằng thuộc tính bố cục:
```js
item.el.style.left   = `${x}px`;
item.el.style.bottom = `${y}px`;
```
`left`/`bottom` buộc trình duyệt **tính lại bố cục (layout)** cho từng khay, từng khung hình.
Với 4 khay đang chạy là 240 lần reflow mỗi giây.

**Sửa** — chuyển hẳn sang `transform`, thứ chạy trên GPU và bỏ qua bước layout.
Gộp luôn với `scale` mà [Phase 3](P3-conveyor.md) đã thêm:
```js
// dat mot lan duy nhat luc tao khay trong render():
trayEl.style.left = '0px';
trayEl.style.bottom = '0px';

// trong updatePositions(), thay hai dong left/bottom bang:
item.el.style.transform =
    `translate3d(${(x - 40).toFixed(1)}px, ${(-(y - 12)).toFixed(1)}px, 0)` +
    ` scale(calc(${scale.toFixed(3)} * var(--hl)))`;
```
Dấu trừ ở trục Y vì `bottom` tăng lên trên, còn `translate3d` tăng xuống dưới.
Điểm neo là góc dưới-trái của `#trays-container`, nên `bottom: 0` là gốc toạ độ.

```css
.tray { will-change: transform; }
```
Chỉ đặt `will-change` cho `.tray` — đây là thứ duy nhất chuyển động liên tục.
Đặt tràn lan sẽ ngốn bộ nhớ GPU.

⚠️ Phải làm **sau** hoặc **cùng lúc** với Phase 3, vì Phase 3 là nơi đưa `scale`
và biến `--hl` vào. Làm riêng lẻ sẽ mất hiệu ứng `highlight-match`.

---

## 3. `innerHTML = ''` — vẽ lại toàn bộ sau mỗi thao tác

`BoxRenderer.render()` mở đầu bằng:
```js
this.container.innerHTML = '';
```
rồi dựng lại **toàn bộ** hộp, mặt hộp, nắp, băng keo và **gắn lại mọi event listener**.

`GameEngine.js:100-102` bắn `onBoxUpdated` **hai lần liên tiếp** cho một nước đi
(một cho hộp nguồn, một cho hộp đích), mà `UIManager` lại nối cả hai vào `updateRender()`
⇒ **hai lần dựng lại toàn bộ lưới hộp cho mỗi nước đi**.

### 3.1. Bước 1 — gộp lời gọi (rẻ, an toàn, làm trước)

Không đụng vào `BoxRenderer`. Chỉ chặn việc vẽ trùng trong `UIManager`:
```js
updateRender() {
    if (this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
        this._renderQueued = false;
        this._renderNow();
    });
}

_renderNow() {
    // toan bo than ham updateRender() cu, khong sua gi
}
```
Một dòng gọi `updateRender()` ở bất kỳ đâu vẫn hoạt động y hệt, chỉ khác là
nhiều lời gọi trong cùng một khung hình gộp lại thành một.
Giảm ngay 50% khối lượng dựng DOM.

⚠️ Kiểm tra lại `UIManager.handleSlotTap()`: nó gọi `updateRender()` bên trong
callback của `animateItemTransfer`. Sau khi gộp, lần vẽ đó lùi lại tối đa 16ms — vô hại.

### 3.2. Bước 2 — cập nhật tại chỗ (tuỳ chọn, làm khi còn giật)

Chỉ dựng lại hộp khi **cấu trúc** đổi (số hộp thay đổi). Còn lại thì sửa tại chỗ:
```js
render(boxes, selectedSource = null, validTargetIds = []) {
    // Dung lai khi so hop doi HOAC khi danh sach id doi (sang man moi)
    const needRebuild = this.container.children.length !== boxes.length
        || boxes.some((b, i) => this.container.children[i]?.dataset.boxId != b.id);
    if (needRebuild) { this.container.innerHTML = ''; /* ...dung lai nhu cu... */ return; }

    boxes.forEach(box => {
        const boxEl = this.container.querySelector(`.box[data-box-id="${box.id}"]`);
        if (!boxEl) return;
        boxEl.classList.toggle('empty-box',   box.isEmpty());
        boxEl.classList.toggle('valid-target', validTargetIds.includes(box.id));
        boxEl.classList.toggle('wrapped',     box.isWrapped);
        boxEl.classList.toggle('selected',    !!selectedSource && selectedSource.boxId === box.id);

        const slots = boxEl.querySelectorAll('.slot');
        for (let i = 0; i < 3; i++) {
            const s = slots[i];
            const has = i < box.items.length;
            s.textContent = has ? getItemEmoji(box.items[i]) : '—';
            s.classList.toggle('placeholder', !has);
            s.classList.toggle('selected',
                has && !!selectedSource && selectedSource.boxId === box.id
                   && selectedSource.itemIndex === i);
        }
    });
}
```
Lợi ích kéo theo: **hiệu ứng CSS không còn bị cắt ngang**. Hiện tại mọi
`transition` và `animation` đang chạy đều bị xoá sạch bởi `innerHTML = ''`.
Đó cũng là lý do vật phẩm bay ở [Phase 4](P4-feedback.md) phải gắn vào `document.body`
chứ không phải vào `#boxes-grid`.

Lưu ý: khi hộp `isWrapped` chuyển từ `false` sang `true`, cần gắn thêm listener
`pointerdown` cho nó (bản cũ gắn lúc dựng). Dùng cờ để không gắn trùng:
```js
if (box.isWrapped && !boxEl.dataset.dragBound) {
    boxEl.dataset.dragBound = '1';
    boxEl.style.cursor = 'grab';
    boxEl.addEventListener('pointerdown', (e) => this.onDragStart(box.id, e));
}
```

#### Vì sao chỉ gắn lại listener kéo, không gắn lại listener tap?

Listener tap ở [BoxRenderer.js:42-46](../../src/ui/BoxRenderer.js) là:
```js
this.onSlotTap(box.id, i < box.items.length ? i : null);
```
`i` là **vị trí ô** (0/1/2) — hằng số của vòng lặp, không bao giờ "cũ" được.
`box.items.length` được đọc **tại thời điểm click**, từ object sống. Và trong suốt
một màn, `GameEngine` chỉ `this.boxes.filter(...)` nên **reference của Box không đổi**
⇒ closure cũ vẫn trỏ đúng object hiện tại. Listener tap **không cần** gắn lại.

Listener kéo thì khác: nó gắn **có điều kiện** (`if (box.isWrapped)`), nên hộp mới
chuyển sang `wrapped` sau khi dựng sẽ không có nó.

#### ⚠️ Bẫy sang màn mới — lý do phải so cả `boxId`

`startLevel()` tạo **Box object hoàn toàn mới**. Nếu chỉ so số lượng
(`children.length !== boxes.length`) mà màn mới tình cờ có **cùng số hộp**, thì
`needRebuild` là `false` ⇒ lưới không dựng lại ⇒ **mọi closure còn giữ Box của màn
trước**. Đây là lỗi im lặng: `box.id` có thể trùng nên tap vẫn "chạy", nhưng nhánh
`i < box.items.length ? i : null` lại tính trên hộp cũ.

Điều kiện `needRebuild` ở trên đã bao gồm phép so danh sách `boxId` để chặn đúng
trường hợp này. **Không được rút gọn nó lại chỉ còn phép so số lượng.**

---

## 4. Hai bộ lọc nền (`backdrop-filter`)

| Vị trí | Giá trị | Xử lý |
|---|---|---|
| `#game-header` (`style.css:45`) | `blur(10px)` | **Nên bỏ.** Luôn hiển thị, buộc trình duyệt tạo một lớp vẽ riêng và làm mờ lại mỗi lần vùng bên dưới thay đổi. |
| `.overlay` (`style.css:370`) | `blur(5px)` | **Giữ.** Chỉ xuất hiện lúc thắng/thua, khi băng chuyền đã dừng. |

Thay thế cho header, gần như không phân biệt được bằng mắt vì nền phía sau là
ảnh tĩnh `assets/background.png`:
```css
#game-header {
    background: rgba(30, 41, 59, 0.55);   /* thay cho rgba(255,255,255,0.05) + blur */
    /* backdrop-filter: blur(10px);  <- xoa dong nay */
}
```
Đây là thay đổi **có nhìn thấy được** (mất độ mờ hậu cảnh) — khác với mọi mục còn lại
trong tài liệu này. Nếu ưu tiên tuyệt đối "giống hệt game gốc", hãy **đo trước**
bằng DevTools → Performance trên máy thật, chỉ bỏ khi thực sự thấy tụt khung hình.

---

## 5. `background-attachment: fixed`

`style.css:19`:
```css
background: url('assets/background.png') no-repeat center center fixed;
```
Từ khoá `fixed` là nguyên nhân giật kinh điển trên di động: nó buộc trình duyệt
vẽ lại ảnh nền theo viewport thay vì cache thành một lớp.

Ở game này nó **hoàn toàn vô nghĩa**: `body` có `overflow: hidden` và cao đúng bằng
viewport, không có gì cuộn cả.

**Sửa** — xoá đúng một từ, ảnh hiển thị y hệt:
```css
background: url('assets/background.png') no-repeat center center;
```
Đây là thay đổi hiệu năng duy nhất trong tài liệu này có chi phí bằng 0 và rủi ro bằng 0.
Làm đầu tiên.

---

## 6. Thứ tự thực hiện

1. Mục 5 — xoá `fixed` (1 từ, 0 rủi ro).
2. Mục 1 — vòng lặp tự tắt.
3. Mục 3.1 — gộp lời gọi vẽ.
4. Mục 2.2 — chuyển sang `transform` (**sau** Phase 3).
5. Đo lại. Chỉ làm mục 3.2 và mục 4 nếu vẫn chưa đạt 60fps.

---

## 7. Danh sách kiểm tra

- [ ] Mở màn chơi, thắng, để nguyên overlay 30 giây → DevTools → Performance:
      **không** có khung hình nào được vẽ.
- [ ] `grep -n "background-attachment\|center fixed" style.css` → không còn kết quả.
- [ ] Băng chuyền quay: Performance → mục *Layout* gần như bằng 0 (trước đây có
      một vạch mỗi khung hình).
- [ ] Một nước đi = **một** lần dựng lại lưới hộp (đặt `console.count` tạm trong `render`).
- [ ] Khay vẫn quay đúng quỹ đạo elip, vẫn sáng viền khi kéo hộp tới (Phase 3 không hỏng).
- [ ] Số nước đi, điều kiện thắng/thua **không** đổi.

---

**Tiếp theo:** [KIEM-CHUNG.md](KIEM-CHUNG.md)
