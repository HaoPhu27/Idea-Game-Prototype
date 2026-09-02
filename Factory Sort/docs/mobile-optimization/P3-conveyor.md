# Phase 3 — Băng chuyền (phần bị chê xấu nhất)

**Mức độ đổi gameplay: 0%.** Vẫn là ellipse, vẫn cổng IN bên phải / OUT bên trái,
vẫn cửa sổ `maxActive` khay, vẫn nhãn nhóm và emoji mục tiêu mờ.
Chỉ sửa **hình học bị lệch**, **thiếu chiều sâu** và **hai animation sai/thiếu**.

---

## 1. Vì sao nó đang xấu — 4 nguyên nhân đã xác minh

### 1.1. Hai ellipse khác nhau, khay chạy lệch khỏi mặt băng

`style.css:259-271` vẽ băng chuyền:
```css
#conveyor-belt { bottom: 30px; height: 160px; width: calc(100% - 90px);
                 border: 30px solid #1e293b; border-radius: 50%; }
```
`src/ui/TrayRenderer.js:141-146` tính quỹ đạo khay:
```js
const cx = containerWidth / 2;  const cy = 110;
const rx = (containerWidth - 90) / 2;  const ry = 80;
```

Số khớp nhau **là do gõ tay trùng**: `cy = 30 + 160/2 = 110`, `ry = 160/2 = 80`,
`rx = (W - 90)/2`. Nhưng đó là ellipse **mép ngoài** của viền. Mặt băng thật —
đường giữa của viền 30px — nhỏ hơn 15px mỗi chiều. Vì vậy mọi khay đang chạy
**lệch 15px ra ngoài mặt băng**, trông như lơ lửng bên rìa chứ không nằm trên băng.

Tệ hơn: đổi bất kỳ số nào trong CSS (ví dụ hạ chiều cao băng cho máy màn thấp)
thì JS không biết, khay bay hẳn ra khỏi băng.

### 1.2. Không có chiều sâu — ellipse trông bẹt

`TrayRenderer.updatePositions()` chỉ đổi `zIndex` giữa 10 và 5:
```js
if (Math.sin(theta) <= 0) { item.el.style.zIndex = 10; } else { item.el.style.zIndex = 5; }
```
Khay ở nửa sau ellipse **to bằng đúng** khay ở nửa trước. Mắt người không đọc ra
đó là vòng chạy nằm ngang; nó trông như 4 hộp xếp lộn xộn theo hình bầu dục.
Đây là lý do lớn nhất khiến băng chuyền bị chê.

### 1.3. Khay ra khỏi băng chạy ngược hướng cổng OUT

`TrayRenderer.animate()` bắt đầu mờ khi khay tới **mép trái**:
```js
if (!item.fadingOut && Math.cos(item.currentTheta) < -0.90 && Math.sin(item.currentTheta) < 0)
```
và cổng OUT đúng là ở bên trái (`style.css:288  .port-out { left: 50px; }`).
Nhưng CSS lại hất khay sang **phải**:
```css
.tray.exiting { transform: translateX(200%); opacity: 0; }   /* style.css:348 */
```
Khay đi tới cửa ra rồi bật ngược lại. Nhìn rất sai.

### 1.4. `moveBelt` không tồn tại

`src/ui/ConveyorRenderer.js`:
```js
this.belt.style.animation = 'moveBelt 0.5s linear';
```
`grep -c "moveBelt" style.css` cho ra **0**. Băng chuyền **chưa bao giờ** có phản hồi
khi một khay rời đi. `bounce` là keyframes duy nhất trong toàn bộ file CSS.

## 2. Cách sửa

### 2.1. Một nguồn sự thật cho hình học (quan trọng nhất)

Khai báo kích thước băng bằng CSS custom property, rồi để JS **đọc lại** chúng.

`style.css`:
```css
#tray-area {
  --belt-inset: 45px;    /* le trai + le phai; width = 100% - 2*inset */
  --belt-h: 160px;       /* chieu cao ngoai cua ellipse */
  --belt-bottom: 30px;   /* cach day #tray-area */
  --belt-band: 30px;     /* do day mat bang = do day border */
}

#conveyor-belt {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: var(--belt-bottom);
  width: calc(100% - var(--belt-inset) * 2);
  height: var(--belt-h);
  border: var(--belt-band) solid var(--conveyor-bg);
  border-radius: 50%;
  background: transparent;
  z-index: 1;
  box-shadow: inset 0 0 15px #000, 0 10px 20px rgba(0,0,0,.5), 0 0 0 2px #334155;
}
```

`src/ui/TrayRenderer.js` — thay khối hằng số bằng hàm đọc CSS:

```js
readBeltGeometry() {
    const area = this.container.parentElement;          // #tray-area
    const cs = getComputedStyle(area);
    const num = (name, fallback) => {
        const v = parseFloat(cs.getPropertyValue(name));
        return Number.isFinite(v) ? v : fallback;
    };
    const W      = this.container.clientWidth || 600;
    const inset  = num('--belt-inset', 45);
    const h      = num('--belt-h', 160);
    const bottom = num('--belt-bottom', 30);
    const band   = num('--belt-band', 30);

    // Duong GIUA cua mat bang, khong phai mep ngoai:
    // ban kinh ngoai tru di nua do day vien.
    return {
        cx: W / 2,
        cy: bottom + h / 2,
        rx: (W - inset * 2) / 2 - band / 2,
        ry: h / 2 - band / 2,
    };
}
```

Gọi lại khi kích thước đổi, **không gọi mỗi khung hình**:
```js
// trong constructor
this.geom = this.readBeltGeometry();
this._ro = new ResizeObserver(() => { this.geom = this.readBeltGeometry(); });
this._ro.observe(this.container);
```
Đọc `clientWidth` mỗi frame như hiện nay ép trình duyệt tính lại layout 60 lần/giây.
Xử lý luôn ở đây để khỏi phải sửa hai lần (xem thêm Phase 6).

### 2.2. Thêm chiều sâu — thay đổi tạo khác biệt lớn nhất về thẩm mỹ

Trong `updatePositions()`, sau khi có `theta`:

```js
const g = this.geom;
const x = g.cx + g.rx * Math.cos(theta);
const y = g.cy + g.ry * Math.sin(theta);

// sin(theta) = -1 : sat truoc (gan nguoi choi) | +1 : sat sau (xa)
const depth = (Math.sin(theta) + 1) / 2;        // 0 = truoc, 1 = sau
const scale = 1.06 - 0.30 * depth;              // truoc 1.06 -> sau 0.76
const dim   = 1.00 - 0.35 * depth;              // sau toi hon

item.el.style.left   = `${x - 40}px`;           // 40 = nua be rong khay
item.el.style.bottom = `${y - 12}px`;
item.el.style.transformOrigin = 'bottom center';
item.el.style.transform = `scale(${scale.toFixed(3)})`;
item.el.style.filter = `brightness(${dim.toFixed(2)})`;
item.el.style.zIndex = Math.round(100 - depth * 90);
```

`zIndex` liên tục thay vì nhảy 10/5 nên khay nửa sau xếp lớp đúng khi đi ngang nhau.
`transformOrigin: bottom center` giữ chân khay luôn dính mặt băng khi thu nhỏ.

**Xung đột cần biết:** `.tray.highlight-match` cũng đặt `transform: scale(1.05) translateY(-5px)`.
JS ghi `style.transform` (inline) nên inline thắng, hiệu ứng nhấn mạnh khi kéo trúng sẽ mất.
Sửa bằng biến CSS:
```css
.tray { --hl: 1; }
.tray.highlight-match { --hl: 1.10; border-color: var(--highlight-color);
                        box-shadow: 0 0 20px rgba(74,222,128,.6); }
```
```js
item.el.style.transform = `scale(calc(${scale.toFixed(3)} * var(--hl)))`;
```

### 2.3. Cho khay đi ra đúng phía cổng OUT

```css
.tray.exiting {
  transform: translateX(-120%) scale(.7);   /* -120% = di sang TRAI, ve phia OUT */
  opacity: 0;
  transition: transform .3s ease-in, opacity .3s ease-in;
}
```
Vì mục 2.2 đã ghi `transform` inline, class này sẽ không thắng. Hai cách, chọn một:
- **Cách nên dùng:** trong `updatePositions()`, bỏ qua khay đang mờ dần —
  thêm `if (item.fadingOut) return;` ở đầu vòng `forEach`, để CSS lo phần còn lại.
- Cách khác: thêm `!important` vào `.tray.exiting`. Chạy được nhưng bẩn.

### 2.4. Bổ sung `@keyframes moveBelt` còn thiếu

Thêm vào cuối `style.css`, cạnh `@keyframes bounce`:

```css
@keyframes moveBelt {
  0%   { filter: brightness(1); }
  35%  { filter: brightness(1.35); }
  100% { filter: brightness(1); }
}
```

Một nhịp sáng mặt băng khi khay rời đi — đúng ý đồ ban đầu của `animateShift()`,
không thêm cơ chế nào. Dùng `filter` thay vì `box-shadow` vì `box-shadow` bắt trình
duyệt vẽ lại cả vùng, còn `filter` chạy trên GPU.

### 2.5. Hai chi tiết nhỏ làm băng ra dáng băng chuyền

```css
/* Vach chia chay quanh vanh */
#conveyor-belt::after {
  content: '';
  position: absolute;
  inset: calc(var(--belt-band) * -1);
  border-radius: 50%;
  border: var(--belt-band) dashed rgba(255,255,255,.05);
  pointer-events: none;
}

/* Cong IN/OUT bam dung hai dau ellipse thay vi lo lung phia tren */
.port-in, .port-out { top: 50%; transform: translateY(-50%); }
.port-in  { right: -18px; }
.port-out { left:  -18px; }
```

## 3. Những gì KHÔNG được đổi

- Không đổi ellipse thành đường thẳng hay lưới. Ellipse là bản sắc của game gốc.
- Không đổi chiều quay (`deltaTheta` âm, mặt trước chạy phải sang trái) vì IN ở phải, OUT ở trái.
- Không đụng `maxActive` / `windowStart` — đó là logic `Conveyor.js`, không phải hiển thị.
- Không bỏ nhãn nhóm hay emoji mục tiêu mờ (`opacity: .3`) trên khay. Người chơi đọc luật qua chúng.
- Không thay emoji bằng ảnh sprite.

## 4. Nghiệm thu

```bash
node tools/build.mjs
```
```bash
grep -c "moveBelt" style.css
```
(phải ra ít nhất 1)

Bằng mắt:
1. Khay **nằm trên** mặt băng, không lơ lửng ngoài rìa.
2. Khay nửa sau nhỏ và tối hơn rõ ràng; vòng chạy đọc ra ngay là nằm ngang.
3. Khay hoàn thành đi về **bên trái**, phía chữ OUT, rồi mờ dần.
4. Băng nháy một nhịp mỗi lần khay rời đi.
5. Xoay ngang máy hoặc đổi cỡ cửa sổ: khay bám lại đúng mặt băng, không văng ra.
6. Kéo hộp trúng khay hợp lệ vẫn thấy khay phóng to và viền xanh.
