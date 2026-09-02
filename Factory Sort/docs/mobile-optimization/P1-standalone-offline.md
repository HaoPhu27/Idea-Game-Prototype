# Phase 1 — Làm cho bản standalone chạy được offline

**Mức độ đổi gameplay: 0%.** Không chạm vào `src/core/`.
**Đây là phase bắt buộc.** Không có nó thì bản Android hiện tại đang hỏng thật.

---

## 1. Vấn đề (đã xác minh bằng lệnh)

```bash
grep -no "https\?://[^\"')]*" FactorySort_Standalone.html
# 7:https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&display=swap

grep -no "assets/[a-z_]*\.png" FactorySort_Standalone.html
# 27:assets/background.png
# 406:assets/loading_bg.png

grep -c "data:image" FactorySort_Standalone.html
# 0
```

File tên là "Standalone" nhưng còn **3 phụ thuộc ngoài**. Khi đóng vào APK hoặc mở
bằng `file://` mà không có mạng:

- Font Baloo 2 không tải được → toàn bộ chữ rơi về `sans-serif`, game trông khác hẳn.
- `assets/background.png` không tải được → nền đen trơn thay vì nền nhà máy.
- `assets/loading_bg.png` không tải được → màn "Generating level..." thành ô đen.

`tools/build.mjs` hiện chỉ nội tuyến CSS và JS (dòng ~98–101), không xử lý ảnh và font.

## 2. Cách sửa — thêm bước nội tuyến tài nguyên vào `tools/build.mjs`

### 2.1. Nội tuyến ảnh PNG thành `data:` URI

Chèn đoạn sau **sau** khi đọc `css`, **trước** khi tạo biến `standalone`:

```js
// --- Noi tuyen tai nguyen anh vao CSS ---
// Ly do: ban standalone phai chay duoc bang file:// va trong WebView cua APK,
// noi khong co thu muc assets/ ben canh file HTML.
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

function inlineAssets(cssText) {
  return cssText.replace(/url\(\s*['"]?(assets\/[^'")]+)['"]?\s*\)/g, (m, rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) throw new Error(`CSS tro toi file khong ton tai: ${rel}`);
    const ext = path.extname(rel).toLowerCase();
    const mime = MIME[ext];
    if (!mime) throw new Error(`Khong biet MIME cho ${rel}`);
    const b64 = fs.readFileSync(abs).toString('base64');
    return `url("data:${mime};base64,${b64}")`;
  });
}

const cssInlined = inlineAssets(css);
```

Rồi đổi dòng nối CSS:

```js
.replace(LINK, `<style>\n${cssInlined}\n</style>`)
```

**Lưu ý:** `index.html` (bản dev) vẫn dùng `assets/` bình thường — không đổi gì ở đó.
Chỉ file build ra mới được nội tuyến. Đây là điều đúng: dev vẫn sửa nhanh, bản phát hành vẫn kín.

### 2.2. Nội tuyến font

Có hai lựa chọn. **Chọn A nếu muốn giữ đúng diện mạo game gốc.**

#### A. Nhúng Baloo 2 dưới dạng woff2 base64 (khuyến nghị)

1. Tải một lần về máy dev, đặt tại `assets/fonts/`:
   - `Baloo2-Regular.woff2` (weight 400)
   - `Baloo2-SemiBold.woff2` (600)
   - `Baloo2-ExtraBold.woff2` (800)
2. Cắt bớt bộ ký tự để giảm dung lượng (font gốc chứa cả Devanagari, rất nặng):
   ```bash
   pip install fonttools brotli
   pyftsubset Baloo2-Regular.ttf \
     --unicodes="U+0020-007E,U+00C0-024F,U+1EA0-1EF9" \
     --flavor=woff2 --output-file=assets/fonts/Baloo2-Regular.woff2
   ```
   Dải trên đủ cho tiếng Anh + tiếng Việt có dấu (nhãn nhóm là tiếng Việt:
   "Thú nhồi bông", "Văn phòng phẩm"). Mỗi weight sau khi cắt còn khoảng 25–40 KB.
3. Bỏ dòng 7 trong `index.html`:
   ```html
   <!-- XÓA -->
   <link href="https://fonts.googleapis.com/css2?family=Baloo+2:..." rel="stylesheet">
   ```
4. Thêm vào đầu `style.css`:
   ```css
   @font-face {
     font-family: 'Baloo 2';
     src: url('assets/fonts/Baloo2-Regular.woff2') format('woff2');
     font-weight: 400; font-display: swap;
   }
   @font-face {
     font-family: 'Baloo 2';
     src: url('assets/fonts/Baloo2-SemiBold.woff2') format('woff2');
     font-weight: 600; font-display: swap;
   }
   @font-face {
     font-family: 'Baloo 2';
     src: url('assets/fonts/Baloo2-ExtraBold.woff2') format('woff2');
     font-weight: 800; font-display: swap;
   }
   ```
5. Mở rộng `inlineAssets()` ở mục 2.1 để bắt luôn `.woff2`:
   ```js
   const MIME = {
     '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
     '.woff2': 'font/woff2',
   };
   // va doi regex thanh:  /url\(\s*['"]?(assets\/[^'")]+)['"]?\s*\)/g   (da bao gom fonts/)
   ```

#### B. Bỏ font ngoài, dùng chồng font hệ thống (nhanh, nhưng đổi diện mạo)

```css
body, .btn {
  font-family: 'Baloo 2', system-ui, -apple-system, 'Roboto', 'Segoe UI', sans-serif;
}
```
Chỉ dùng nếu chấp nhận chữ trên Android thành Roboto. Vì yêu cầu là "giống hệt game gốc",
**nên chọn A**.

### 2.3. Chốt bằng kiểm tra tự động trong build

Thêm ngay trước `fs.writeFileSync(... 'FactorySort_Standalone.html' ...)`:

```js
// Ban standalone khong duoc phu thuoc mang.
const externals = standalone.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+/g);
if (externals) {
  throw new Error('Ban standalone con phu thuoc ngoai:\n  ' + externals.join('\n  '));
}
if (/url\(\s*['"]?assets\//.test(standalone)) {
  throw new Error('Ban standalone con tro toi assets/ bang duong dan tuong doi.');
}
```

Từ nay build sẽ **thất bại** nếu ai đó vô tình thêm lại một CDN. Đây là cách rẻ nhất
để lỗi này không quay lại.

## 3. Ngân sách dung lượng

| Tài nguyên | Gốc | Sau base64 (×1.37) |
|---|---|---|
| `background.png` | 0.9 KB | ~1.3 KB |
| `loading_bg.png` | 319 KB | ~437 KB |
| 3 font woff2 đã cắt | ~100 KB | ~137 KB |
| HTML + CSS + JS hiện tại | 106 KB | 106 KB |
| **Tổng** | | **~680 KB** |

Hoàn toàn chấp nhận được. Nếu muốn nhỏ hơn: chuyển `loading_bg.png` sang WebP
chất lượng 80 (thường còn ~60 KB) — ảnh này bị phủ chữ và chỉ hiện chớp nhoáng.
Các file `booster_*.png`, `powerup_*.png`, `shovel.png` trong `assets/`
**không được code nào dùng** — đừng nhúng chúng, và cũng đừng vì thấy chúng
mà thêm cơ chế booster vào game.

## 4. Nghiệm thu

```bash
node tools/build.mjs
grep -c "https\?://" FactorySort_Standalone.html   # phai ra 0
grep -c "data:image" FactorySort_Standalone.html   # phai >= 2
```

Sau đó: **ngắt Wi-Fi và dữ liệu di động**, copy đúng một file `FactorySort_Standalone.html`
sang điện thoại, mở bằng Chrome. Phải thấy: nền nhà máy, chữ Baloo 2, màn loading có ảnh.
Chơi thử một màn từ đầu đến thắng — luật chơi không được khác gì bản dev.
