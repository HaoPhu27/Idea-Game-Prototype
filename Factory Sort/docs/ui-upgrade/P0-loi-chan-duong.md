# Phase 0 — Bốn lỗi hiển thị đang chặn đường người chơi

**Mức độ đổi gameplay: 0%.** Không đụng file nào trong `src/core/`, `src/generator/`, `src/data/`.
**Ưu tiên: cao nhất.** Lỗi 0.1 làm hai nút trên HUD không bấm được ở máy 360px.

Phase này không thiết kế lại gì cả. Nó chỉ đưa bản hiện tại về trạng thái **hiển thị đúng
như tác giả đã định**. Làm xong P0 game vẫn trông y hệt — chỉ là không còn mất nút, không
còn mất món hàng, không còn trượt ngang.

---

## 0.1. HUD tràn 73px — nút *Chọn màn* và *Chơi lại* nằm ngoài màn hình

### Triệu chứng
Ở 360×640: `#game-header` có `scrollWidth = 407`, `clientWidth = 334`. Hai nút cuối
(`#btn-select-level` `right = 377px`, `#btn-new-game` `right = 420px`) nằm hoàn toàn
ngoài viewport 360px. Người chơi **không thể chọn màn và không thể chơi lại**.
Ở 390×844 vẫn tràn 41px — nút *Chơi lại* bị cắt.

### Nguyên nhân
`style.css:174` `#game-header` là flex `justify-content: space-between`, không có
`min-width: 0` ở hai cụm con và không có chiến lược thu gọn. Nội dung cố định:

- `.hud-left`: 2 pill (`MÀN 25 ▾` + `NƯỚC 0`), mỗi pill có icon 14px + nhãn chữ 10px + số 16px
- `.hud-right`: 4 nút tròn 36px + gap 7px = **165px**
- padding 2×10px + gap giữa hai cụm

Ở 360px, chỉ riêng `.hud-right` đã 165px, `.hud-left` cần ~200px → tràn.

### Sửa

**Bước 1 — cho phép cụm trái co lại (`style.css:191`):**

```css
.hud-left, .hud-right {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;          /* THÊM: cho phép co dưới kích thước nội dung */
}
.hud-left  { flex: 1 1 auto; overflow: hidden; }
.hud-right { flex: 0 0 auto; }
```

**Bước 2 — ẩn nhãn chữ khi chật, giữ icon + số (`style.css`, cuối khối HUD):**

```css
/* Dưới 400px: pill chỉ còn icon + số. Vẫn đọc được, hết tràn. */
@media (max-width: 400px) {
    .hud-pill .hud-label { display: none; }
    .hud-pill { padding: 4px 8px; gap: 4px; }
    .round-btn { width: 32px; height: 32px; }
    .round-btn svg { width: 16px; height: 16px; }
    .hud-left, .hud-right { gap: 5px; }
}
```

`4 × 32 + 3 × 5 = 143px` cho cụm phải, `~120px` cho cụm trái → tổng 263 + padding 20 = **283px**,
dư 77px ở máy 360px.

**Bước 3 — chốt an toàn, không bao giờ tràn nữa (`style.css:174`):**

```css
#game-header {
    /* ...giữ nguyên phần còn lại... */
    overflow: hidden;      /* THÊM: chốt cứng */
}
```

> ⚠️ `overflow: hidden` là **lưới an toàn, không phải cách sửa**. Nếu sau khi làm bước 1–2
> mà vẫn thấy nút bị cắt thì nghĩa là bước 1–2 chưa đủ — sửa tiếp, đừng dựa vào bước 3.

### Nghiệm thu
Ở 320, 360, 390, 430px: `header.scrollWidth === header.clientWidth`, và cả 4 nút tròn
đều có `getBoundingClientRect().right <= innerWidth`.

---

## 0.2. Ô hàng thứ 3 bị vẽ ra ngoài Thùng

### Triệu chứng
Số đo ở 390×844, màn 25, cột giữa:

| | vị trí |
|---|---|
| Thùng | `x = 138 → 252` (rộng 114px) |
| Ô 1 | `x = 147`, rộng 39 |
| Ô 2 | `x = 192`, rộng 39 |
| Ô 3 | `x = 238`, rộng 38 → **phải = 276** |

Ô thứ 3 kết thúc ở **276px trong khi Thùng kết thúc ở 252px** — tràn **24px** ra ngoài,
đè lên vùng cột số 3 và chui xuống dưới thanh nhôm `.conveyor-side-beam` (`z-index: 5`,
`style.css:509`). Ở 360px con số là 19px. Kết quả trên màn hình: món hàng thứ 3 của
phần lớn Thùng bị che một nửa hoặc che hoàn toàn.

### Nguyên nhân — hai lỗi cộng dồn

**(a) `min-width: auto` mặc định của flex item.** `style.css:994`:

```css
.slot {
    flex: 1;                  /* = flex: 1 1 0%, nhưng min-width vẫn là auto */
    margin: 5px 3px;
    font-size: min(clamp(20px, 7vw, 32px), calc(var(--box-h, 105px) * 0.36));
}
```
Ô không chịu co xuống dưới kích thước nội dung (emoji 27,3px ở 390px). Ba ô cần
`3 × (27,3 + 6 margin) + 8 padding + 4 border = 108px` **chiều rộng chữ**, nhưng chỗ thật
chỉ có 102px → tràn.

**(b) Cỡ chữ tính theo `vw`, không theo bề rộng Thùng.**
`7vw` ở 390px = 27,3px. Nhưng bề rộng thật của một ô là
`(114 − 4 − 8 − 18) / 3 = 28px`. Công thức không hề biết bàn chơi có mấy cột.

**(c) `.top-face` không cắt phần tràn.** `style.css:858` không có `overflow: hidden`,
nên phần tràn được vẽ ra ngoài thay vì bị giấu.

### Sửa

```css
/* style.css:858 — .top-face */
.top-face {
    /* ...giữ nguyên... */
    overflow: hidden;          /* THÊM */
    gap: 4px;                  /* THÊM: thay margin ngang của .slot */
    padding: 0 4px;
}

/* style.css:994 — .slot */
.slot {
    flex: 1 1 0;
    min-width: 0;              /* THÊM: điểm mấu chốt, cho phép ô co lại */
    margin: 5px 0;             /* SỬA: bỏ margin ngang, đã có gap ở cha */
    /* SỬA: cỡ chữ bám theo bề rộng thật của ô, không bám vw */
    font-size: min(
        var(--slot-size, 28px) * 0.86,
        var(--box-h, 105px) * 0.36
    );
}
```

Và cấp `--slot-size` từ JS, nơi duy nhất biết bề rộng thật.
`ab_test/src/ui/BoxRenderer.js:261` — trong `_fitBoxHeight()`, thêm sau dòng đặt `--box-h`:

```js
// Bề rộng thật của một ô hàng = (bề rộng cột − viền − padding − gap) / 3.
// Phải đo, không được suy từ vw: số cột do bộ sinh màn quyết định.
const colW = this.container.firstElementChild
    ? this.container.firstElementChild.getBoundingClientRect().width
    : this.container.clientWidth / 3;
const slotW = Math.max(18, (colW - 4 /*border*/ - 8 /*padding*/ - 8 /*2×gap*/) / 3);
this.container.style.setProperty('--slot-size', `${slotW.toFixed(1)}px`);
```

### Nghiệm thu
Với mọi màn từ 1 đến 50, ở 320/360/390/430px, đoạn sau phải in ra mảng rỗng:

```js
[...document.querySelectorAll('.box')].filter(b => {
  const br = b.getBoundingClientRect();
  return [...b.querySelectorAll('.slot')]
    .some(s => s.getBoundingClientRect().right > br.right + 0.5
            || s.getBoundingClientRect().left  < br.left  - 0.5);
});
```

Và mắt thường: **cả 3 emoji trong mọi Thùng đều nhìn rõ trọn vẹn**, không bị thanh nhôm cắt.

---

## 0.3. Cả trang trượt ngang 60px

### Triệu chứng
`document.body.scrollWidth − clientWidth = 60px` ở 360px (20px ở 390px). Vuốt ngang một
cái là toàn bộ game lệch sang trái và **không tự trả về**. Đo được `document.body.scrollLeft = 20`
sau một thao tác kéo Thùng bình thường.

### Nguyên nhân
Ba nguồn tràn cộng lại:
1. HUD tràn (lỗi 0.1) — 41→73px.
2. `.conveyor-side-beam` (`style.css:509`) đặt `left: -8px` / `right: -8px`, rộng 9px.
   Thanh của cột ngoài cùng bên phải thò **9px ra ngoài `#boxes-grid`**.
3. Ô hàng tràn (lỗi 0.2).

`body { overflow: hidden }` có ở `style.css` nhưng **không ngăn được cuộn bằng script/
`scrollIntoView`/focus**, và cũng không ngăn nội dung thật sự rộng hơn khung.

### Sửa
Sửa 0.1 và 0.2 xoá 2 trong 3 nguồn. Còn thanh nhôm:

```css
/* style.css:394 — #boxes-area: chừa chỗ cho thanh nhôm thò ra */
#boxes-area {
    padding: 8px 24px 42px 24px;   /* SỬA: 16px → 24px, đủ chứa 9px beam + 6px thở */
}

/* style.css:406 — #boxes-grid: chốt không cho tràn ra ngoài khung cha */
#boxes-grid {
    max-width: min(400px, 100%);   /* SỬA: thêm 100% */
}
```

Và chốt an toàn ở `#game-container` (`style.css` khối `#game-container`):

```css
#game-container {
    /* ...giữ nguyên... */
    overflow-x: clip;      /* clip, KHÔNG dùng hidden: hidden tạo scroll container */
}
```

> `overflow-x: clip` khác `hidden`: `clip` không tạo scroll container nên `scrollLeft`
> không thể khác 0, còn `hidden` thì script vẫn cuộn được. Đây chính là lý do bản hiện
> tại vẫn trượt dù đã có `overflow: hidden` trên `body`.

### Nghiệm thu
`document.body.scrollWidth === document.body.clientWidth` ở 320/360/390/430px.
Vuốt ngang mạnh trên máy thật: bố cục **không nhúc nhích**.

---

## 0.4. Khay đơn hàng chạy đè lên bảng hàng chờ

### Triệu chứng
Số đo ở 390×844, màn 25:

```
#queue-area : x 65 → 325,  y 147 → 218
.tray       : x 267 → 338, y 210 → 284      →  CHỒNG LẤN
```

Khay quay quanh chu vi băng chuyền (`TrayRenderer.getTrackPoint`), và quỹ đạo đó **cắt
qua bảng hàng chờ**. `#queue-area` có `z-index: 50` (`style.css:1038`), `#trays-container`
không có `z-index` → Khay **chui xuống dưới** bảng hàng chờ ở một đoạn của vòng chạy.
Người chơi mất dấu đơn hàng đúng lúc nó đang tiến vào vùng giao.

### Nguyên nhân
`TrayRenderer.readBeltGeometry()` tính nửa-biên quỹ đạo:

```js
// TrayRenderer.js — hx, hy chỉ đảm bảo Khay nằm TRONG băng chuyền,
// không hề biết bảng hàng chờ đang chiếm giữa băng chuyền.
const hx = Math.max(20, beltW / 2 - trayW / 2 - margin);
const hy = Math.max(20, beltH / 2 - trayH / 2 - margin);
```
Với `beltW = 366`, `beltH = 215`, `trayH = 72`, `margin = 7` → `hy = 100,5`.
Nhánh chạy trước ở `y = cy − hy`, nhánh sau ở `y = cy + hy`; khoảng hở giữa hai nhánh là
`2 × hy − trayH = 129px`, trong khi bảng hàng chờ cao **71px + 2×8 padding**. Đủ chỗ về
lý thuyết, nhưng bảng hàng chờ được căn giữa theo `--belt-h` còn quỹ đạo căn theo `hy` →
hai hệ toạ độ lệch nhau.

### Sửa (tạm thời, gọn — bản đúng nằm ở Phase 3)

```css
/* style.css:1038 — hạ z-index bảng hàng chờ xuống dưới Khay */
#queue-area { z-index: 4; }

/* style.css — nâng lớp Khay lên trên */
#trays-container { z-index: 6; }
```

Khay luôn vẽ trên bảng hàng chờ → không còn "biến mất". Đồng thời thu bảng hàng chờ lại
để giảm chồng lấn thực tế:

```css
#queue-area {
    width: min(calc(100% - 160px), 300px);   /* SỬA: 130px → 160px */
    max-width: 300px;                         /* SỬA: 320 → 300 */
}
```

> **Không được đổi `--belt-h`, `--belt-inset`, `--belt-bottom` ở phase này.** Ba biến đó
> đi thẳng vào `readBeltGeometry()` → đổi quỹ đạo → đổi nhịp `checkQueuePickup()` →
> đổi gameplay. Việc đó thuộc Phase 1, sau khi đã tách sự kiện giao hàng khỏi hình học.

### Nghiệm thu
Chạy màn 25, để yên 15 giây (2 vòng Khay). Quay màn hình lại và xem: **Khay không lúc
nào bị bảng hàng chờ nuốt mất**. Số nước đi và nhịp giao hàng không đổi so với trước
(so sánh bằng cách đếm số lần giao trong 30 giây với cùng một hàng chờ).

---

## Checklist nghiệm thu Phase 0

Chạy ở **320×568, 360×640, 390×844, 430×932**, mỗi khung thử **màn 1, 12, 25, 39, 50**:

- [ ] `document.body.scrollWidth === document.body.clientWidth`
- [ ] `header.scrollWidth === header.clientWidth`
- [ ] Cả 4 nút tròn trên HUD bấm được, không nút nào `right > innerWidth`
- [ ] Không ô hàng nào vượt ra ngoài Thùng chứa nó (script ở §0.2)
- [ ] Cả 3 emoji trong mọi Thùng đều nhìn rõ, không bị thanh nhôm cắt
- [ ] Khay không bị bảng hàng chờ che trong suốt 2 vòng chạy
- [ ] `npm test` xanh toàn bộ
- [ ] Chơi hết màn 25 trong bản cũ và bản mới, số nước đi tối thiểu **không đổi**
- [ ] Ảnh chụp trước/sau ở 360×640 đính kèm PR
