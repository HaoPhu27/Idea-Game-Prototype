# Phase 2 — Khung hình cho điện thoại

**Mức độ đổi gameplay: 0%.** Bố cục vẫn là: header trên, lưới hộp giữa, băng chuyền dưới.
**Phase bắt buộc.** Ở màn 360px hiện tại lưới hộp đang tràn ra ngoài màn hình.

---

## 1. Bốn lỗi đã xác minh

### 1.1. Lưới hộp rộng 400px trên màn 360px

`style.css`:
```css
#boxes-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 400px; }
.box        { width: 120px; height: 70px; }
#boxes-area { padding: 20px; }
```
3 × 120 + 2 × 20 = **400px**. Cộng `padding: 20px` hai bên → cần **440px**.
Điện thoại phổ biến nhất (360 × 800) chỉ có 360px. Cột thứ ba bị cắt hoặc lưới bị ép méo.

### 1.2. `height: 100vh` bị thanh URL của Chrome Android ăn mất

```css
body { height: 100vh; width: 100vw; }
```
Trên Chrome Android, `100vh` = chiều cao khi thanh URL **đã ẩn**. Lúc mới mở, thanh URL
còn hiện → phần dưới của `#tray-area` (chính là băng chuyền) bị đẩy khỏi màn hình.

### 1.3. Không có safe-area

`index.html:5`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
Thiếu `viewport-fit=cover`. Trên máy có tai thỏ / thanh gesture, header hoặc băng chuyền
nằm dưới phần khuyết.

### 1.4. Không chặn kéo-làm-mới (pull-to-refresh)

`body` có `touch-action: none` nhưng không có `overscroll-behavior`. Khi người chơi kéo
hộp từ trên xuống, Chrome Android có thể hiểu là pull-to-refresh và **tải lại trang,
mất sạch màn đang chơi**.

## 2. Cách sửa

### 2.1. `index.html` — thêm `viewport-fit=cover`

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0,
               user-scalable=no, viewport-fit=cover">
```

### 2.2. `style.css` — chiều cao và overscroll

```css
html, body {
  height: 100vh;          /* du phong cho trinh duyet cu */
  height: 100dvh;         /* dvh = chieu cao thuc te, tu dong co lai khi thanh URL hien */
  width: 100%;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: none;   /* chan pull-to-refresh */
}
```
Dùng `width: 100%` thay `100vw`: `100vw` tính cả thanh cuộn dọc ở một số WebView và gây
tràn ngang 15px.

### 2.3. `style.css` — safe-area cho header và khu băng chuyền

```css
#game-header {
  margin: 15px;
  margin-top: calc(15px + env(safe-area-inset-top, 0px));
}
#tray-area {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### 2.4. `style.css` — làm lưới hộp co giãn (thay đổi quan trọng nhất)

Bỏ chiều rộng cố định của `.box`, để lưới tự chia:

```css
#boxes-area {
  padding: 12px;                       /* 20px -> 12px */
}
#boxes-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(8px, 3vw, 20px);          /* 20px -> co gian */
  max-width: 400px;
  width: 100%;
}
.box {
  width: 100%;                         /* bo 120px cung */
  aspect-ratio: 12 / 7;                /* giu dung ti le 120x70 cua ban goc */
  height: auto;
}
.slot {
  width: 33.33%;
  height: 100%;
  font-size: clamp(18px, 7vw, 24px);   /* emoji co theo be rong hop */
}
```

Kết quả ở màn 360px: `(360 − 24 padding − 2×8 gap) / 3 = 106.6px` mỗi hộp,
cao `106.6 × 7/12 ≈ 62px`. Vừa khít, **tỉ lệ hộp không đổi**, emoji vẫn cân giữa ô.
Ở màn rộng, `max-width: 400px` giữ nguyên kích thước gốc 120×70 — máy tính bàn nhìn y hệt trước.

### 2.5. Header gọn lại một chút trên màn thấp

```css
@media (max-height: 700px) {
  #game-header { height: 52px; margin: 8px; }
  #boxes-area  { padding: 8px; }
}
```

## 3. Những gì KHÔNG được đổi ở phase này

- Không đổi số cột lưới (luôn 3 cột) — `LevelGenerator` sinh số hộp theo giả định này
  và người chơi nhìn quen bố cục đó.
- Không đổi tỉ lệ `flex: 65` / `flex: 35` giữa `#boxes-area` và `#tray-area`.
- Không bỏ `touch-action: none` — nó đang chặn cuộn và double-tap-zoom, cần cho thao tác kéo.
- Không thêm nút mới vào header.

## 4. Nghiệm thu

```bash
node tools/build.mjs
```

Trong Chrome DevTools, chế độ thiết bị, thử lần lượt:

| Thiết bị | Kích thước | Phải đạt |
|---|---|---|
| Galaxy S8 | 360 × 740 | 3 cột hộp nằm trọn, không cuộn ngang |
| iPhone SE | 375 × 667 | Băng chuyền hiện đủ, không bị cắt đáy |
| Pixel 7 | 412 × 915 | Header không đè lên thanh trạng thái |
| iPhone 14 Pro | 393 × 852 | Băng chuyền không nằm dưới thanh gesture |

Thử thật trên máy Android: kéo mạnh một hộp từ trên xuống → **trang không được tải lại**.
