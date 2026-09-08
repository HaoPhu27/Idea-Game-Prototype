# Phase 5 — Chuyển động & hiệu năng

**Mức độ đổi gameplay: 0%.** Chỉ sửa `src/ui/BoxRenderer.js`, `src/ui/UIManager.js`,
`src/ui/TrayRenderer.js`, `style.css`.

---

## 5.1. Vấn đề: mỗi lần chạm là đập đi xây lại toàn bộ bàn chơi

`ab_test/src/ui/BoxRenderer.js:32`:
```js
render(columns, ...) {
    this.container.innerHTML = '';        // xoá sạch
    ...                                    // dựng lại từ đầu
}
```

Được gọi từ `UIManager._renderNow()` (`UIManager.js:377`) sau **mọi** thay đổi trạng thái:
mỗi lần chạm ô, mỗi lần đóng gói, mỗi lần giao hàng, mỗi lần Thùng tụt xuống.

### Chi phí đo được (390×844, màn 25)

| | |
|---|---|
| Node DOM toàn trang | 482 |
| Node trong `#boxes-grid` | 237 |
| Node **mỗi cột** | **78** |
| Trong đó là Thùng (4 × ~10) | 40 |
| Trong đó là **trang trí băng tải** | **38** |
| `_renderNow()` trung bình (desktop) | **3,5 ms** |

38 node/cột × 3 cột = **114 node trang trí** được huỷ và dựng lại sau mỗi cú chạm.
Chúng gồm: `.conveyor-cleat-belt`, 2 × `.conveyor-side-beam` (+ `.t-slot-channel`),
`.conveyor-top-terminal`, `.conveyor-nose-terminal` (chứa `.nose-curved-belt`,
2 × `.nose-side-plate`, 2 × `.bearing-core`, **8 × `.nose-bolt`**),
`.conveyor-extrusion-legs` (2 chân + `.t-slot-groove` + `.leg-bracket` + `.foot-pad` +
`.leg-tie-bar` + `.legs-shadow`).

**Không cái nào trong 114 node đó thay đổi giữa hai lần vẽ.**

### Ba hệ quả

**(a) Hiệu năng.** 3,5ms trên desktop ≈ **15–25ms trên Android tầm trung**, vì phần lớn
chi phí là dựng layer cho `.conveyor-cleat-belt` — một phần tử có **4 lớp background
chồng nhau** (`radial-gradient` 4×4px lặp + `repeating-linear-gradient` 8 điểm dừng +
2 `linear-gradient`) và 3 `inset box-shadow`. Cộng với vòng lặp
`getBoundingClientRect()` của FLIP (`UIManager._chayFlip`) chạy 2 lần trên mọi Thùng
→ mỗi cú chạm là một cú giật khung hình.

**(b) Chuyển động bị cắt ngang.** CSS transition trên `.box`, `.slot`, `.tray-illustration`
gắn vào node bị xoá. Hiệu ứng đang chạy dở thì phần tử biến mất → nhảy hình. Đây là lý do
`UIManager` phải dựng cả một hệ FLIP thủ công (`_chayFlip`, `UIManager.js:425-475`) để
bù lại — giải pháp đúng cho một vấn đề tự tạo ra.

**(c) Sự kiện gắn lại 36 lần mỗi cú chạm.** `BoxRenderer.render()` gọi
`addEventListener('click', ...)` cho **mỗi ô** (3 ô × 12 Thùng) cộng mỗi Thùng.

---

## 5.2. Sửa (a): tách trang trí ra khỏi vòng vẽ lại

Khung băng tải chỉ phụ thuộc **số cột** — thứ không đổi trong suốt một màn.
Dựng một lần khi vào màn, sau đó chỉ vẽ lại Thùng.

```js
// ab_test/src/ui/BoxRenderer.js

/** Dựng khung cột (băng tải, thanh nhôm, chân trụ). Gọi MỘT LẦN mỗi màn. */
buildColumns(colCount, visibleRows) {
    if (this._builtCols === colCount) return;      // đã dựng rồi thì thôi
    this.container.innerHTML = '';
    this._stacks = [];
    for (let c = 0; c < colCount; c++) {
        const colEl = document.createElement('div');
        colEl.className = 'box-column';
        colEl.dataset.colIndex = c;
        colEl.style.setProperty('--rows', visibleRows);
        colEl.innerHTML = COLUMN_CHROME_HTML;      // hằng số chuỗi, xem bên dưới
        const stack = document.createElement('div');
        stack.className = 'box-stack';
        colEl.querySelector('.conveyor-track').appendChild(stack);
        this.container.appendChild(colEl);
        this._stacks.push(stack);
    }
    this._builtCols = colCount;
}

/** Vẽ lại CHỈ Thùng. Khung giữ nguyên, transition không bị cắt. */
render(columns, selectedSource, validTargetIds, hiddenCounts, visibleRows) {
    if (columns.length && !Array.isArray(columns[0])) columns = [columns];
    this.buildColumns(columns.length, visibleRows);
    this._fitBoxHeight(visibleRows, hiddenCounts.some(n => n > 0));

    columns.forEach((boxes, c) => {
        this._syncStack(this._stacks[c], boxes, selectedSource, validTargetIds);
        this._syncHiddenChip(c, hiddenCounts[c] || 0);
    });
}
```

`_syncStack()` đối chiếu theo `box.id` thay vì xoá sạch:

```js
_syncStack(stack, boxes, selectedSource, validTargetIds) {
    const seen = new Set();
    boxes.forEach((box, i) => {
        seen.add(String(box.id));
        let el = stack.querySelector(`.box[data-box-id="${box.id}"]`);
        if (!el) { el = this._createBox(box); stack.appendChild(el); }   // Thùng mới
        this._updateBox(el, box, selectedSource, validTargetIds);        // cập nhật tại chỗ
        if (stack.children[i] !== el) stack.insertBefore(el, stack.children[i]);
    });
    // Gỡ Thùng đã rời bàn chơi
    [...stack.children].forEach(el => {
        if (!seen.has(el.dataset.boxId)) el.remove();
    });
}
```

`_updateBox()` chỉ chạm những thuộc tính thật sự đổi:
```js
_updateBox(el, box, sel, valid) {
    el.classList.toggle('empty-box',   box.isEmpty());
    el.classList.toggle('wrapped',     box.isWrapped);
    el.classList.toggle('valid-target',valid.includes(box.id));
    el.classList.toggle('selected',    !!sel && sel.boxId === box.id);
    el.classList.toggle('near-pack',   !box.isWrapped && box.items.length >= 2
                                        && box.items[0] === box.items[1]);   // P2 §2.5
    const slots = el.querySelectorAll('.slot');
    for (let i = 0; i < 3; i++) {
        const has  = i < box.items.length;
        const text = has ? getItemEmoji(box.items[i]) : '—';
        if (slots[i].textContent !== text) slots[i].textContent = text;       // chỉ ghi khi khác
        slots[i].classList.toggle('placeholder', !has);
        slots[i].classList.toggle('selected', has && !!sel
            && sel.boxId === box.id && sel.itemIndex === i);
    }
}
```

**Kết quả dự kiến:** node dựng lại mỗi cú chạm đi từ 237 → **0 trong trường hợp thường**
(chỉ đổi `textContent` và `classList`), `_renderNow()` từ 3,5ms → **< 0,6ms**.

---

## 5.3. Sửa (b): sự kiện gắn một lần bằng uỷ quyền

Thay 36 listener/lần vẽ bằng **một** listener trên `#boxes-grid`:

```js
// BoxRenderer constructor
this.container.addEventListener('click', (e) => {
    if (document.body.classList.contains('is-dragging')) return;
    const slot = e.target.closest('.slot');
    const boxEl = e.target.closest('.box');
    if (!boxEl) return;
    const boxId = Number(boxEl.dataset.boxId);
    if (slot) {
        const i = Number(slot.dataset.slotIndex);
        this.onSlotTap(boxId, slot.classList.contains('placeholder') ? null : i);
    } else {
        this.onSlotTap(boxId, null);
    }
});
this.container.addEventListener('pointerdown', (e) => {
    const boxEl = e.target.closest('.box.wrapped');
    if (boxEl) this.onDragStart(Number(boxEl.dataset.boxId), e);
});
```

> ⚠️ Giữ nguyên **ngữ nghĩa cũ**: `BoxRenderer.js:139` truyền
> `i < box.items.length ? i : null` — chạm ô trống được hiểu là "chạm cả Thùng".
> Đoạn uỷ quyền ở trên tái lập đúng ngữ nghĩa đó qua `.placeholder`. Sai chỗ này là
> đổi luật chọn hàng → đổi gameplay.

---

## 5.4. Sửa (c): giảm chi phí vẽ của khung băng tải

Ngay cả khi không dựng lại, `.conveyor-cleat-belt` vẫn tốn vì 4 lớp background + 3 inset
shadow trên một phần tử cao gần bằng màn hình.

```css
/* style.css:450 — .conveyor-cleat-belt: bỏ lớp nhám vi mô 4×4px lặp toàn khung.
   Ở 27px/thùng nó không nhìn thấy được, nhưng buộc trình duyệt tile hàng chục nghìn ô. */
.conveyor-cleat-belt, .conveyor-roller-bed {
    background-image:
        /* XOÁ: radial-gradient(circle at 1.5px 1.5px, ...) */
        repeating-linear-gradient(180deg, /* ...giữ nguyên gờ chắn... */),
        linear-gradient(90deg, rgba(0,0,0,.6) 0, transparent 8px,
                               transparent calc(100% - 8px), rgba(0,0,0,.6) 100%),
        linear-gradient(180deg, #18202b 0%, #222b38 50%, #1a222e 100%);
    background-size: 100% 32px, 100% 100%, 100% 100%;
    box-shadow: inset 0 4px 10px rgba(0,0,0,.8);      /* SỬA: 3 shadow → 1 */
    will-change: auto;                                 /* SỬA: bỏ will-change thường trực */
}
```

> `will-change: background-position` đang bật **vĩnh viễn** trên 3 phần tử lớn
> (`style.css:500`). Nó buộc trình duyệt giữ 3 layer riêng suốt thời gian chơi. Chỉ nên
> bật ngay trước animation và tắt ngay sau — hoặc bỏ hẳn, vì animation `cleatBeltScroll`
> chỉ dài 0,36s.

Gỡ luôn phần trang trí không ai thấy sau khi P1 rút gọn chiều cao:
```js
// BoxRenderer — bỏ khỏi COLUMN_CHROME_HTML:
//   .conveyor-nose-terminal  (2 tấm ốp + 2 bearing + 8 bu lông = 12 node/cột)
//   .conveyor-extrusion-legs (2 chân + 5 chi tiết + bóng      = 8 node/cột)
// Chúng nằm ở đáy cột, bị `padding-bottom: 42px` che gần hết, và ở bản Inverted
// thì rơi vào vùng an toàn của máy có thanh gesture.
```
38 node trang trí/cột → **6** (`.conveyor-cleat-belt`, 2 beam + 2 channel, `.conveyor-top-terminal`).
Và `#boxes-area` được trả lại 32px padding dưới → thêm ~7% chiều cao bàn chơi.

---

## 5.5. Chuyển động: giữ cái đang tốt, sửa cái đang sai

Bản hiện tại có bộ juice khá tốt — giữ nguyên **toàn bộ**: combo ladder
(`VFXManager.COMBO_TIERS`), shockwave + spark, confetti, HUD bump, âm thanh Web Audio.

Ba chỗ cần sửa:

### (a) `.box.wrapped` nảy vô hạn

`style.css:968`:
```css
.box.wrapped { animation: bounce 1s infinite 0.8s; }
```
Một Thùng đã gói nằm chờ có thể nảy **hàng chục lần**. Ở màn 25 có thể có 2–3 Thùng gói
cùng lúc → 3 vật thể nảy liên tục trong khi người chơi đang cố đọc bàn cờ. Chuyển động
vô hạn là tiếng ồn thị giác, không phải phản hồi.

```css
.box.wrapped { animation: bounce .55s var(--spring-bounce) 2; }   /* SỬA: infinite → 2 lần */
@media (prefers-reduced-motion: reduce) {
    .box.wrapped { animation: none; }
}
```
Việc "Thùng này đã gói" đã được nói bằng nắp gập + băng keo + huy hiệu nhóm — ba tín hiệu
tĩnh, quá đủ.

### (b) Không tôn trọng `prefers-reduced-motion`

`UIManager._chayFlip` có kiểm tra (`UIManager.js:427`), nhưng CSS thì **không chỗ nào**.
Thêm một khối chung ở cuối `style.css`:

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
    }
    /* Giữ lại thứ mang thông tin, chỉ bỏ phần trang trí */
    .box.wrapped, .queue-slot.dispatching, .vfx-confetti,
    .conveyor-cleat-belt.rolling-down { animation: none !important; }
}
```

### (c) Băng tải cột chỉ chạy khi có Thùng tụt xuống — giữ nguyên, nhưng thêm nhịp

`BoxRenderer.triggerRollAnimation()` đang đúng: chỉ cột bị ảnh hưởng mới cuộn. Giữ.
Thêm một chi tiết rẻ tiền mà đắt giá: **Thùng rơi xuống phải chạm đáy có trọng lượng.**

```css
/* style.css — thay easing tuyến tính bằng nhịp "rơi rồi nảy nhẹ" */
.box-stack .box { transition: transform .2s var(--spring-bounce); }
```
Và trong `_chayFlip`, đổi easing cho Thùng mới từ trên rơi xuống:
```js
{ duration: 380, easing: 'cubic-bezier(.34,1.3,.64,1)', delay: 40, fill: 'backwards' }
```

---

## 5.6. Đo trước / đo sau

Chạy trên máy Android thật (hoặc Chrome DevTools → CPU throttling 4×), màn 25:

```js
// Dán vào Console, chạm 20 nước rồi đọc
let n = 0, t = 0;
const orig = window.gameUI._renderNow.bind(window.gameUI);
window.gameUI._renderNow = function () { const a = performance.now(); orig();
    t += performance.now() - a; n++;
    console.log(`render #${n}: ${(t/n).toFixed(2)}ms tb`); };
```

| Chỉ số | Trước | Mục tiêu |
|---|---|---|
| `_renderNow()` trung bình (desktop) | 3,5 ms | **< 0,8 ms** |
| `_renderNow()` trung bình (throttle 4×) | ~14 ms | **< 3,5 ms** |
| Node/cột | 78 | **≤ 22** |
| Node dựng lại mỗi cú chạm | 237 | **≤ 6** |
| Listener gắn mỗi cú chạm | 48 | **0** |
| Khung hình rớt khi đóng gói (DevTools Performance) | có | **không** |

---

## Checklist nghiệm thu Phase 5

- [ ] `_renderNow()` < 0,8ms trên desktop, < 3,5ms ở throttle 4×
- [ ] `document.querySelectorAll('.box-column')[0].querySelectorAll('*').length ≤ 22`
- [ ] Chạm một ô rồi chạm lại: **không** node `.box` nào bị thay mới
      (kiểm bằng cách gắn `el.__mark = 1` rồi chạm, `__mark` phải còn)
- [ ] Ngữ nghĩa chạm ô trống = chạm cả Thùng: giữ nguyên (thử chạm ô `—` khi đang cầm hàng)
- [ ] Thùng đã gói nảy đúng 2 nhịp rồi đứng yên
- [ ] Bật `prefers-reduced-motion: reduce` trong DevTools: không còn chuyển động lặp,
      game vẫn chơi được đầy đủ
- [ ] Kéo–thả Thùng đã gói lên Khay vẫn mượt, `#drag-ghost` không nhảy
- [ ] `npm test` xanh; `git diff --stat` không chạm `src/core|generator|data`
