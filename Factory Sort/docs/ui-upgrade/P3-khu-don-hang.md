# Phase 3 — Khu đơn hàng: từ vòng quay trang trí thành bảng đọc được

**Mức độ đổi gameplay: 0%** — *với điều kiện Phase 1 §1.4 đã xong.*
Nếu chưa tách giao hàng khỏi hình học, **dừng lại và làm P1 trước.**

---

## 3.1. Vấn đề: thông tin quan trọng nhất là thứ khó đọc nhất

Ở màn 25, engine giữ **50 Khay**, `maxActive = 4`. Người chơi được phép biết 4 Khay đầu
hàng đợi — đó là toàn bộ cơ sở để quyết định "gói loại nào trước". Thực tế đo được:

| | Engine cho phép | UI hiển thị |
|---|---|---|
| Ngay khi vào màn | 4 Khay | **1 Khay** |
| Sau 2 giây | 4 Khay | 1–2 Khay |
| Sau ~7 giây (trọn 1 vòng) | 4 Khay | 4 Khay |

### Nguyên nhân 1 — Khay bị giấu tới khi trôi qua cổng IN

`ab_test/src/ui/TrayRenderer.js:231`:
```js
trayEl.style.display = hasSpawned ? '' : 'none';  // ẩn cho tới khi qua cổng IN
```
Vào màn, `isStartOfLevel === true` → `hasSpawned = false` cho **mọi** Khay → cả 4 Khay bị
`display: none`, lộ dần theo vòng chạy. Vòng chạy mất `2π / 0.9 rad·s⁻¹ ≈ 7 giây`
(`TrayRenderer.js:7`, `baseSpeed = 0.015 rad/frame @60fps`).

Đoạn code này được viết để giải quyết một vấn đề **khác và có thật**: Khay *thay thế*
(sau khi giao hàng) từng bị nhét vào slot trống ở giữa vòng, "bụp" ra giữa băng chuyền.
Bình luận trong file giải thích rất rõ. Nhưng nó áp cả cho lúc **vào màn**, nơi không có
vấn đề gì để giải quyết.

### Nguyên nhân 2 — thông tin quyết định đang chuyển động

Ngay cả khi thấy đủ 4 Khay, chúng **trôi liên tục quanh chu vi**. Muốn biết "đơn nào đang
chờ" người chơi phải bám mắt theo vật thể chuyển động, đọc emoji 22px trong huy hiệu
tròn 42px. Ở màn ≥ 40, `matchMode = 'itemType'` — Khay đòi **đúng một loại**, không phải
nhóm — nên đọc nhầm 🎾 thành 🏐 là mất một Thùng.

### Nguyên nhân 3 — không có "sắp tới"

`Conveyor` là **prefix cố định** (`Conveyor.js`), Khay thứ 5 chỉ vào khi một Khay trước
đó được giao xong. Bình luận trong `Conveyor.js` đã nêu thẳng giải pháp đúng:

> *"Neu muon nguoi choi thay truoc hang doi, hay lam mot khu 'sap toi' CHI DE XEM
> thay vi cho xoay cua so — no khong dong toi mo hinh do kho."*

Hiện chưa có khu đó. Người chơi không biết còn 50 hay 5 đơn.

---

## 3.2. Thiết kế mới

```
┌─────────────────────────────────────────────────────────────┐
│ [OUT]  ▓▓▓▓▓▓▓▓ băng tải gờ chắn ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  [IN]   │
│          🐰        🍕        ⚽        🔨       · còn 46 ·   │  nhánh trước
│              ⚙️              🎸                              │  nhánh sau
├─────────────────────────────────────────────────────────────┤
│  HÀNG CHỜ                                            1/5     │
│  [📦]  [  ]  [  ]  [  ]  [  ]                                │
└─────────────────────────────────────────────────────────────┘
       vòng chạy NÉN còn ~112px (delivery: 242px)
```

Bốn thay đổi, không cái nào cấp thêm thông tin ngoài `maxActive`:

1. **Giữ vòng chạy** như delivery, chỉ nén chiều cao xuống còn đủ hai nhánh Khay
   (xem P1 §1.3 — bản đầu đề xuất bỏ vòng chạy và **đã sai**)
2. Bỏ cổng ẩn lúc vào màn — hiện ngay đủ `maxActive`
3. Hàng chờ tách thành **hàng riêng bên dưới**, không còn nằm trong lòng vòng chạy
4. Thêm chỉ báo **`còn lại N`** — chỉ là con số `allTrays.length`, không lộ nội dung

---

## 3.3. Bỏ cổng ẩn lúc vào màn

```js
// ab_test/src/ui/TrayRenderer.js:200-232 — trong nhánh `if (!existing)`

if (isStartOfLevel) {
    slotPos = index;
    spawnTargetTheta = 0;
    hasSpawned = true;          // SỬA: false → true
    //
    // Vào màn thì KHÔNG có gì phải giấu: engine đã công bố đúng maxActive Khay
    // qua getAllActiveTrays(). Cổng ẩn (display:none tới khi trôi qua IN) sinh ra
    // để chặn Khay THAY THẾ bụp ra giữa băng chuyền sau mỗi lần giao — nó vẫn giữ
    // nguyên ở nhánh else bên dưới. Áp cổng đó cho lúc vào màn chỉ khiến người chơi
    // mù 7 giây đầu (1 vòng chạy) mà không đổi được gì về độ khó.
} else {
    // ...giữ nguyên toàn bộ nhánh Khay thay thế...
}
```

Một dòng. Số Khay hiển thị vẫn đúng bằng `conveyor.getAllActiveTrays().length`.

**Kiểm tra:** vào màn 25, trong 1 giây đầu:
```js
[...document.querySelectorAll('#trays-container .tray')]
  .filter(t => getComputedStyle(t).display !== 'none').length
=== window.gameUI.engine.conveyor.getAllActiveTrays().length   // phải true
```

---

## 3.4. Khay dễ đọc hơn

`style.css:1304` — Khay hiện là card 68×72 với huy hiệu tròn 42px chứa emoji 22px, trên
nền `radial-gradient` tối. Emoji 22px trên nền tối, đang chuyển động, là ngưỡng dưới của
khả năng đọc.

```css
.tray {
    /* KHÔNG hardcode kích thước: TrayRenderer cấp --tray-w/--tray-h theo slotCount
       và theo chiều cao vòng chạy (xem §3.7). Khay 62px cố định sẽ chồng lên nhau
       khi vòng thấp, và tràn chu vi khi maxActive lên 6-7 ở màn 50. */
    width: var(--tray-w, 56px);
    height: var(--tray-h, 60px);
    border-radius: 12px;
    border: 2px solid var(--cat-color, #64748b);   /* SỬA: viền mang màu nhóm luôn */
    background: linear-gradient(180deg, #33415a, #1b2536);
}

.tray-cap {
    height: 6px;                                    /* SỬA: 8 → 6 */
}

.tray-illustration {
    width: 46px;                                    /* SỬA: 42 → 46 */
    height: 46px;
    margin-top: 3px;
    font-size: 30px;                                /* SỬA: 22 → 30, +36% */
    /* Nền SÁNG để emoji nổi lên, thay vì radial tối nuốt mất emoji */
    background: radial-gradient(circle at 35% 30%, #ffffff, #dbe3ec);
    border: 2px solid var(--cat-color, #64748b);
    box-shadow: 0 0 8px var(--cat-color), inset 0 -2px 4px rgba(0,0,0,.18);
}
```

> **Vì sao đổi nền huy hiệu từ tối sang sáng:** emoji hệ thống được thiết kế để đọc trên
> nền sáng — phần lớn có viền tối và vùng sáng ở giữa. Đặt lên `rgba(15,23,42,.95)` như
> hiện tại làm mất hết đường viền. Đây cũng là lý do emoji trong ô Thùng (nền
> `rgba(0,0,0,.18)`, khá nhạt) đọc dễ hơn emoji trên Khay dù nhỏ hơn.

### Khay chế độ `itemType` (từ màn 40) phải khác Khay chế độ `category`

`Tray.canAccept()` **luôn** so theo `targetItemId`. Nhưng ở màn < 40, bộ sinh màn chỉ tạo
một loại/nhóm nên hai chế độ trùng nhau. Từ màn 40 thì không. UI hiện vẽ **giống hệt
nhau**, người chơi không có cách nào biết mình đang ở chế độ nào.

Đây **không phải** thêm thông tin — `matchMode` đã được phản ánh qua emoji cụ thể trên
Khay từ đầu; ta chỉ làm cho nó nhìn thấy được:

```js
// TrayRenderer.render(), cạnh chỗ đặt --cat-color
trayEl.classList.toggle('tray-strict', tray.matchMode === 'itemType');
```
```css
/* Khay "đúng loại": viền kép, báo cho mắt rằng ràng buộc chặt hơn */
.tray.tray-strict {
    box-shadow: 0 0 0 2px rgba(15,23,42,.9), 0 0 0 4px var(--cat-color), 0 4px 12px rgba(0,0,0,.5);
}
```

---

## 3.5. Hàng chờ: tách khỏi quỹ đạo, đọc rõ mức nguy hiểm

`style.css:1038` `#queue-area` đang `position: absolute` **giữa lòng băng chuyền** — nguồn
gốc của lỗi chồng lấn P0 §0.4. Sau P1, nó thành một dải riêng.

> **⚠️ Sửa ngày 8/9/2026 — bản đầu của mục này THIẾU một nửa và đã làm mất hàng chờ.**
> Bản đầu chỉ nói `#queue-area { position: static }` mà **không đụng gì tới
> `#conveyor-belt`**. Băng tải vẫn là `position: absolute` phủ kín `#tray-area`, có
> nền mờ đục và `z-index: 1` — nên nó **vẽ đè lên hàng chờ**. Kết quả: chỉ số `0/5`
> biến mất hoàn toàn khỏi màn hình, đúng thứ người chơi cần để biết mình sắp thua.
>
> Đổi một phần tử sang `static` là chưa đủ. **Phải đưa cả hai vào cùng một luồng**:

```css
/* Khu đơn hàng = HAI HÀNG xếp chồng, không phải một hộp có thứ nổi bên trong */
[data-layout="inverted"] #tray-area {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 0 0 auto;
    height: auto; min-height: 0; max-height: none;
    padding: 12px 10px calc(4px + env(safe-area-inset-bottom, 0px)) 10px;
    --lane-h: clamp(112px, 17vh, 128px);   /* đủ cho HAI nhánh Khay */
}

/* Hàng 1 — làn chạy: băng tải VÀO LUỒNG, không còn absolute */
[data-layout="inverted"] #conveyor-belt {
    position: relative;
    left: auto; bottom: auto; transform: none;
    width: 100%;
    height: var(--lane-h);
    flex: 0 0 var(--lane-h);
}

/* Lớp Khay phủ KHÍT lên làn chạy và cắt ở hai đầu */
[data-layout="inverted"] #trays-container {
    position: absolute;
    left: var(--belt-inset); right: var(--belt-inset);
    top: 12px; width: auto; height: var(--lane-h);
    overflow: hidden; border-radius: var(--belt-radius); z-index: 6;
}

/* Hàng 2 — hàng chờ: hàng riêng, không bao giờ bị băng tải đè nữa */
[data-layout="inverted"] #queue-area {
    position: static;
    transform: none;
    width: 100%;
    max-width: none;
    margin-top: 0;
    padding: 4px 8px 6px;
    z-index: auto;
    flex: 0 0 auto;
}

.queue-slot { height: 38px; border-radius: 8px; }
.queue-box .queue-box-icon { font-size: 21px; }   /* SỬA: 18 → 21 */
```

Ba mức cảnh báo đã có sẵn trong code (`.warning` ở `style.css:1118`, `.danger` ở `:1123`)
nhưng chỉ đổi màu số đếm. Cho nó đổi cả **ô trống còn lại** — đó mới là thứ người chơi
đang đếm:

```css
#queue-area.warning .queue-slot:not(.occupied) { border-color: rgba(245,158,11,.5); }
#queue-area.danger  .queue-slot:not(.occupied) {
    border-color: rgba(239,68,68,.75);
    background: rgba(239,68,68,.08);
}
```

Đây là **hiển thị lại `queue.length` vs `maxQueueSize`** — hai con số đã in sẵn ở
`#queue-counter`. Không có thông tin mới.

---

## 3.6. Chỉ báo "còn lại N đơn"

```js
// ab_test/src/ui/TrayRenderer.js — cuối render()
const remain = window.gameUI.engine.conveyor.allTrays.length
             - window.gameUI.engine.conveyor.getAllActiveTrays().length;
const el = document.getElementById('tray-remaining');
if (el) {
    el.textContent = remain > 0 ? `còn ${remain}` : 'đơn cuối';
    el.classList.toggle('is-last', remain === 0);
}
```
```html
<!-- ab_test/index.html — trong #tray-area, cạnh cổng IN -->
<div id="tray-remaining" class="tray-remaining">còn 46</div>
```
```css
.tray-remaining {
    position: absolute; right: 12px; bottom: 8px;
    font-size: 10px; font-weight: 800; letter-spacing: .04em;
    color: #64748b; pointer-events: none;
}
.tray-remaining.is-last { color: var(--factory-amber); }
```

> **Đây có lộ thông tin không?** Không. `allTrays.length` là **số đơn còn lại**, không phải
> **nội dung** đơn. Nó tương đương với `+N` trên cột Thùng — thứ đã được duyệt là an toàn.
> Bộ sinh màn chấm điểm `trayBacklog` dựa trên prefix `pending.slice(0, maxActive)`
> (`SolvableLevelGenerator.simulateDelivery`), không dựa trên việc người chơi có biết tổng
> số hay không. **Tuyệt đối không** hiện emoji/loại của các Khay ngoài `maxActive`.

---

## 3.7. Quỹ đạo: GIỮ vòng chạy, chỉ đo lại hình học

> **⚠️ Sửa ngày 8/9/2026 — bản đầu của mục này đã SAI.**
> Bản đầu thay `getTrackPoint()` bằng một quỹ đạo **tuyến tính** với
> `xIn = cx + beltW/2 + trayW`, `xOut = cx − beltW/2 − trayW`. Hai đầu bị đẩy ra
> ngoài băng tải **cả một bề rộng Khay**, ăn mất ~25% hành trình — nên ở màn 25
> chỉ thấy **1–2 Khay** dù `maxActive = 4`. Và như P1 §1.3 đã nêu, làn thẳng
> **về nguyên tắc** không chứa nổi 7 Khay ở màn 50.
>
> **Giữ nguyên `getTrackPoint()` của bản delivery.** Nó đúng và đã được kiểm chứng.

Chỉ sửa **một chỗ**: `readBeltGeometry()` phải đo hình học **từ DOM thật**, không
suy từ biến CSS.

```js
/**
 * Trước đây: laneY = --belt-bottom + --belt-h / 2, tức giả định #conveyor-belt luôn
 * là absolute neo đáy #tray-area. Khi P1 đưa băng tải VÀO LUỒNG thì giả định đó sai
 * và Khay bị đặt lệch ra ngoài làn. Đo rect thật thì mọi thay đổi bố cục về sau đều
 * tự đúng.
 */
readBeltGeometry() {
    const cRect = this.container.getBoundingClientRect();
    const belt  = document.getElementById('conveyor-belt');
    const bRect = (belt && belt.getBoundingClientRect().width > 40)
        ? belt.getBoundingClientRect() : cRect;

    const beltW = Math.max(80, cRect.width  || bRect.width);
    const beltH = Math.max(60, cRect.height || bRect.height);

    // Kích thước Khay bị RÀNG BUỘC HAI PHÍA (xem P1 §1.3b)
    const n = Math.max(1, this.slotCount || 4);
    const margin = 4;
    let trayH = Math.max(36, Math.min(58, Math.floor((beltH - margin * 2 - 4) / 2)));
    let trayW = Math.round(trayH * 0.94);
    const perim = 2 * (beltW - trayW) + 2 * (beltH - trayH);
    const need  = n * (trayW + 6);
    if (need > perim) {
        trayW = Math.max(32, Math.round(trayW * (perim / need)));
        trayH = Math.round(trayW * 1.06);
    }

    const cx = (this.container.clientWidth || beltW) / 2;
    const cy = beltH / 2;                       // đo từ ĐÁY #trays-container lên
    const hx = Math.max(20, beltW / 2 - trayW / 2 - margin);
    const hy = Math.max(16, beltH / 2 - trayH / 2 - margin);
    return { cx, cy, beltW, beltH, hx, hy, r: Math.min(18, hx * 0.45, hy * 0.45),
             trayW, trayH, frontY: cy - hy };
}
```

`trayW/trayH` phụ thuộc `slotCount`, nên **phải đo lại hình học mỗi khi `slotCount`
đổi** (trong `render()`, ngay sau khi gán `this.slotCount`), rồi đẩy xuống CSS:

```js
this.geom = this.readBeltGeometry();
this.container.style.setProperty('--tray-w', `${this.geom.trayW}px`);
this.container.style.setProperty('--tray-h', `${this.geom.trayH}px`);
```
```css
.tray { width: var(--tray-w, 62px); height: var(--tray-h, 66px); }
```

### Vùng giao hàng: tái lập đúng phép thử gốc

Vì vẫn là vòng chạy, `isInDeliveryZone()` chỉ cần viết lại **đúng** điều kiện cũ,
khác mỗi chỗ đọc toạ độ trong hệ của `#trays-container`:

```js
static get DELIVERY_RADIUS_PX() { return 28; }   // hằng số gốc của UIManager

isInDeliveryZone(trayObj, slotIdx) {
    const g = this.geom;
    const pt = this.getTrackPoint(trayObj.currentTheta);
    if (Math.abs(pt.y - g.frontY) >= 22) return false;      // phải ở nhánh chạy trước
    const slotEl = document.querySelectorAll('.queue-slot')[slotIdx];
    if (!slotEl) return false;
    const cRect = this.container.getBoundingClientRect();
    const sRect = slotEl.getBoundingClientRect();
    const slotLocalX = (sRect.left + sRect.width / 2) - cRect.left;
    return Math.abs(pt.x - slotLocalX) <= TrayRenderer.DELIVERY_RADIUS_PX;
}
```

> Giữ đơn vị **pixel**, không đổi sang tỉ lệ vòng chạy: chu vi đổi theo bề rộng máy,
> nên một tỉ lệ cố định sẽ làm nhịp giao **nhanh chậm khác nhau tuỳ máy** — đúng thứ
> cần tránh nhất.

### ⚠️ Cạm bẫy khi tự kiểm thử

`TrayRenderer` chạy trên `requestAnimationFrame`. **Tab ẩn thì rAF đứng**, nên
`_renderNow()` không chạy, `trayElements` rỗng, và `checkQueuePickup()` không bao giờ
tìm thấy Khay — trông y hệt "giao hàng hỏng" dù code đúng. Đã mất khá nhiều thời gian
vì bẫy này. Kiểm thử bằng **mô phỏng frame tất định**:

```js
const u = window.gameUI, tr = u.trayRenderer;
u._renderNow();                        // ép vẽ đồng bộ, không đợi rAF
let now = performance.now(), fired = null;
for (let f = 0; f < 1600; f++) {
    tr.offset += -tr.baseSpeed;        // đúng công thức của animate()
    tr.updatePositions(now);
    u.checkQueuePickup(now);
    if (u.__deliv.length) { fired = { frame: f, sec: +(f / 60).toFixed(2) }; break; }
    now += 16.66;
}
```

---

## Checklist nghiệm thu Phase 3

- [ ] Trong 1 giây sau khi vào màn: số Khay nhìn thấy `=== conveyor.getAllActiveTrays().length`
      (thử màn 5, 25, 39, 50)
- [ ] Không bao giờ hiện quá `maxActive` Khay
- [ ] Không có emoji/nhãn nào lộ nội dung Khay thứ `maxActive + 1` trở đi
- [ ] Khay không bị bảng hàng chờ che ở bất kỳ thời điểm nào (`#queue-area` đã `static`)
- [ ] Emoji trên Khay ≥ 28px, đọc rõ khi đang trôi (quay video 60fps, tua chậm 0.25×)
- [ ] Màn 40+: Khay `tray-strict` nhìn khác Khay thường
- [ ] `còn N` khớp `allTrays.length − getAllActiveTrays().length`, về `đơn cuối` đúng lúc
- [ ] **Kiểm chứng A/B nhịp giao (P1 §1.4) chạy lại và đạt**
- [ ] Chơi màn 39 & 49 mỗi màn 5 lần trước/sau: tỉ lệ thua như nhau
- [ ] `npm test` xanh
