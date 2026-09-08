# Phase 4 — Hệ màu & thứ bậc thị giác

**Mức độ đổi gameplay: 0%.** Chỉ sửa `style.css` và bảng màu trong `ItemCatalog.js`
(**chỉ trường `color`** — không đổi `id`, `emoji`, `label`, không đổi thứ tự nhóm/loại).

> ⚠️ `ItemCatalog.js` nằm trong `src/data/`, vốn là vùng cấm theo quy tắc chung.
> Ngoại lệ duy nhất được cấp là **trường `color`**, vì nó thuần trình bày.
>
> Đã kiểm chứng đường đi của nó:
> ```
> ab_test/src/core/**                                  → 0 chỗ đọc `.color`
> SolvableLevelGenerator.js:98, 105, 940               → 3 chỗ, ĐỀU LÀ CHUYỀN TAY
> ```
> Ba chỗ trong bộ sinh màn chỉ sao chép `color` từ catalog vào cấu hình Khay
> (`CATEGORIES`, `TYPE_INDEX`, `trays[].color`) rồi giao thẳng cho UI. **Không có
> nhánh chấm điểm, clamp hay so sánh nào đọc tới nó** — độ khó chỉ tính trên
> `categoryId`, `targetItemId`, `matchMode`.
>
> Trước khi sửa, chạy lại để tự xác nhận:
> ```bash
> grep -rn "\.color" ab_test/src/core ab_test/src/generator
> ```
> Nếu ra **nhiều hơn 3 dòng**, hoặc một trong ba dòng đó không còn là phép gán chuyền tay,
> **dừng lại và báo** — nghĩa là màu đã bị kéo vào logic.

---

## 4.1. Vấn đề 1: màu xanh cyan vừa là khung, vừa là tín hiệu

`--factory-cyan: #38bdf8` hiện được dùng ở **9 vai trò khác nhau**:

| Nơi dùng | Vai trò | File |
|---|---|---|
| Viền `#game-header` | trang trí | `style.css:174` |
| Mũi tên pill chọn màn | affordance | `style.css:230` |
| Viền `.round-btn` | trang trí | `style.css:281` |
| Cổng IN / OUT | nhãn tĩnh | `style.css:1258` |
| Viền nét đứt trong lòng băng chuyền | trang trí | `style.css:1249` |
| `.queue-counter` | dữ liệu | `style.css:1105` |
| `.queue-slot.occupied` | trạng thái | `style.css:1163` |
| `.column-hidden-count` | dữ liệu | `style.css:777` |
| **`.box.selected` / `.slot.selected`** | **tín hiệu hành động** | `style.css:824, 1019` |

Khi mọi thứ đều cyan, việc "món hàng này đang được cầm" — thông tin **quan trọng nhất tại
thời điểm đó** — không nổi hơn cái viền header. Người chơi mất dấu vật đang cầm.

## 4.2. Vấn đề 2: 8 màu nhóm hàng đều là pastel sáng, gần như không phân biệt được

`ItemCatalog.js` (`categories[].color`):

| Nhóm | Màu | Vấn đề |
|---|---|---|
| Thú nhồi bông | `#FFB6C1` hồng nhạt | |
| Đồ ăn | `#FFDAB9` đào nhạt | ~ trùng hồng nhạt trên nền tối |
| Văn phòng phẩm | `#ADD8E6` xanh nhạt | |
| Thể thao | `#90EE90` lục nhạt | |
| Dụng cụ | `#C8B7A6` xám ấm | ~ trùng đào nhạt |
| Nhạc cụ | `#DDA0DD` mận | ~ trùng hồng nhạt |
| Đồ bếp | `#F5E07A` vàng nhạt | |
| Cây cảnh | `#7FD1C1` xanh mòng két | |

Cả 8 đều có độ sáng 70–90%. Trên nền `#0f172a`, mắt đọc chúng thành **"tám sắc thái của
sáng"**. Ba cặp gần như trùng nhau.

Tệ hơn: màu nhóm chỉ xuất hiện trên **dải cap 8px** của Khay và **viền 2px** của huy hiệu.
Diện tích quá nhỏ để màu làm được việc gì. Với 32 loại item, người chơi cần màu nhóm để
lọc thô trước khi đọc emoji — hiện tại nó không giúp được.

## 4.3. Vấn đề 3: modal chọn màn nói một ngôn ngữ khác hẳn

Toàn game là "công nghiệp tối, kim loại, neon lạnh". Riêng `.level-btn` (`style.css:1820`)
là nút kẹo phẳng bão hoà (lục `#22c55e`, lam `#3b82f6`, cam `#f97316`, tím `#a855f7`) trên
thẻ tối. Trông như dán từ một game khác vào. Chi tiết ở Phase 6.

---

## 4.4. Sửa: đặt lại vai trò cho từng màu

Quy tắc: **một màu = một ý nghĩa. Màu tín hiệu không bao giờ dùng để trang trí.**

```css
/* style.css :root — THAY khối token màu hiện có */
:root {
    /* ---- Nền & khung (không bao giờ mang ý nghĩa) ---- */
    --ink-900: #080d17;   /* nền sâu nhất */
    --ink-800: #0f172a;   /* nền khung */
    --ink-700: #1b2536;   /* mặt thẻ */
    --ink-600: #2b3a52;   /* viền khung */
    --ink-500: #47597a;   /* viền nhấn nhẹ */

    /* ---- Chữ ---- */
    --text-100: #f8fafc;  /* chữ chính */
    --text-300: #b6c2d4;  /* chữ phụ  — SỬA từ #94a3b8, nâng tương phản */
    --text-500: #7c8ba2;  /* chữ mờ   — chỉ dùng cho nhãn không quan trọng */

    /* ---- MÀU TÍN HIỆU: dành riêng, cấm dùng cho trang trí ---- */
    --sig-select: #38bdf8;  /* CYAN  = "bạn đang cầm cái này"        */
    --sig-valid : #4ade80;  /* LỤC   = "thả được vào đây"            */
    --sig-reject: #f87171;  /* ĐỎ    = "không hợp lệ"                */
    --sig-danger: #ef4444;  /* ĐỎ ĐẬM= "hàng chờ sắp đầy / thua"     */
    --sig-ready : #f59e0b;  /* HỔ PHÁCH = "sắp gói được / đơn cuối"  */

    /* ---- Trang trí: dùng thép, KHÔNG dùng cyan ---- */
    --chrome-line : rgba(120, 145, 180, .28);
    --chrome-glow : rgba(120, 145, 180, .18);
}
```

Rồi đổi **6 chỗ trang trí** từ cyan sang `--chrome-line`:

| Dòng | Trước | Sau |
|---|---|---|
| `style.css:174` `#game-header` border | `rgba(56,189,248,.25)` | `var(--chrome-line)` |
| `style.css:281` `.round-btn` border | `rgba(56,189,248,.32)` | `var(--chrome-line)` |
| `style.css:1249` `#conveyor-belt::after` | `rgba(56,189,248,.18)` | `rgba(120,145,180,.14)` |
| `style.css:1258` `.port-in/.port-out` | `#3b82f6` + cyan chữ | `--ink-500` + `--text-300` |
| `style.css:777` `.column-hidden-count` | cyan | `--text-300` trên `--ink-800` |
| `style.css:1105` `.queue-counter` (bình thường) | cyan | `--text-100` |

Sau đó cyan chỉ còn xuất hiện ở **đúng một chỗ**: thứ người chơi vừa chạm. Nó sẽ nổi bật
mà không cần to hơn hay sáng hơn.

---

## 4.5. Bảng màu nhóm mới: tách theo cả sắc độ lẫn độ sáng

Tiêu chí: 8 màu, mỗi cặp phải khác nhau **hoặc ≥ 40° sắc độ, hoặc ≥ 18% độ sáng**, và tất
cả đều đạt tương phản ≥ 3:1 trên nền `#0f172a`.

```js
// ab_test/src/data/ItemCatalog.js — CHỈ đổi trường `color`
stuffed_animals : '#F26D8C'   // hồng đậm     (trước #FFB6C1)
food            : '#F59E3C'   // cam          (trước #FFDAB9)
stationery      : '#4FA8F5'   // lam          (trước #ADD8E6)
sports          : '#3FBF6F'   // lục          (trước #90EE90)
tools           : '#9AA6B8'   // xám thép     (trước #C8B7A6)
music           : '#A96BE8'   // tím          (trước #DDA0DD)
kitchen         : '#EFCB3A'   // vàng         (trước #F5E07A)
garden          : '#2FC3AE'   // mòng két     (trước #7FD1C1)
```

Kiểm chứng nhanh — dán vào Console, cả 28 cặp phải đạt:

```js
const cs = ['#F26D8C','#F59E3C','#4FA8F5','#3FBF6F','#9AA6B8','#A96BE8','#EFCB3A','#2FC3AE'];
const hsl = h => { const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn; let H=0;
  if(d){H = mx===r?60*(((g-b)/d)%6) : mx===g?60*((b-r)/d+2) : 60*((r-g)/d+4);}
  return {H:(H+360)%360, L:(mx+mn)/2}; };
const bad=[];
cs.forEach((a,i)=>cs.slice(i+1).forEach(b=>{
  const A=hsl(a),B=hsl(b);
  let dH=Math.abs(A.H-B.H); if(dH>180) dH=360-dH;
  if(dH<40 && Math.abs(A.L-B.L)<0.18) bad.push([a,b,Math.round(dH),+(A.L-B.L).toFixed(2)]);
}));
console.log(bad.length ? bad : 'ĐẠT: 28/28 cặp phân biệt được');
```

### Cho màu nhóm đủ diện tích để làm việc

Màu nhóm hiện chỉ nằm trên cap 8px + viền 2px. Mở rộng sang những chỗ mắt thật sự quét:

```css
/* Khay: nền huy hiệu mang một lớp màu nhóm rất nhạt */
.tray-illustration {
    background:
        radial-gradient(circle at 35% 30%, #ffffff, #e6ecf3),
        var(--cat-color, #64748b);
    background-blend-mode: normal, normal;
    box-shadow: 0 0 10px var(--cat-color), inset 0 -2px 4px rgba(0,0,0,.18);
}
.tray { border-color: var(--cat-color, #64748b); }

/* Thùng đã đóng gói: băng keo mang màu nhóm thay vì luôn màu be */
.box.wrapped .tape {
    background: color-mix(in srgb, var(--cat-color, #e6c896) 70%, #f4e6cd);
}

/* Ô hàng chờ đã chiếm: viền theo màu nhóm, không phải cyan */
.queue-slot.occupied { border-color: var(--cat-color, var(--ink-500)); }
```
```js
// ab_test/src/ui/QueueRenderer.js — khi dựng .queue-box, truyền màu lên cả .queue-slot
slotEl.style.setProperty('--cat-color', catConfig ? catConfig.color : '');
```

Bây giờ màu nhóm xuất hiện trên **Khay → hàng chờ → băng keo Thùng**, tức là suốt cả
đường đi của một kiện hàng. Đó là lúc màu bắt đầu có ích thật sự.

---

## 4.6. Thứ bậc thị giác: ba tầng

Xếp mọi phần tử vào đúng một tầng. Đang lẫn lộn là dấu hiệu thiết kế sai.

| Tầng | Ai ở đây | Quy tắc |
|---|---|---|
| **1 — Quyết định** | emoji trong Thùng, emoji trên Khay, ô hàng chờ trống/đầy | Tương phản cao nhất, chi tiết sắc nét nhất, được phép chuyển động |
| **2 — Trạng thái** | `.selected`, `.valid-target`, `.near-pack`, `.danger`, chip `+N`, số nước đi | Chỉ dùng màu tín hiệu; xuất hiện **khi có việc**, còn lại im lặng |
| **3 — Khung cảnh** | băng tải, thanh nhôm, chân trụ, viền nét đứt, cổng IN/OUT, nền | Không bao giờ dùng màu tín hiệu; độ sáng ≤ 35%; không chuyển động |

Áp dụng ngay được ba điều:

```css
/* (a) Hạ toàn bộ khung cảnh xuống một bậc để tầng 1 tự nổi lên */
.conveyor-cleat-belt, .conveyor-roller-bed { filter: brightness(.82) saturate(.85); }
.conveyor-side-beam { filter: brightness(.7); }        /* thanh nhôm đang chói nhất màn hình */

/* (b) Thùng đã gói (chờ bay lên hàng chờ) là tầng 1 — cho nó sáng hơn nền */
.box.wrapped { filter: drop-shadow(0 0 10px color-mix(in srgb, var(--cat-color) 60%, transparent)); }

/* (c) Cổng IN/OUT là tầng 3, không được sáng hơn Khay */
.port-in, .port-out {
    background: rgba(15,23,42,.85);
    color: var(--text-500);
    border: 1px solid var(--chrome-line);
    box-shadow: none;
    font-size: 10px;
}
```

`.conveyor-side-beam` đang là vật thể sáng nhất trên bàn chơi
(`linear-gradient(... #ffffff 50% ...)`, `style.css:509`) — nghĩa là **thứ chói nhất màn
hình là thứ không mang thông tin gì**. Đây là nghịch lý thị giác lớn nhất của bản hiện tại,
và một dòng `filter: brightness(.7)` sửa được ngay.

---

## Checklist nghiệm thu Phase 4

- [ ] `grep -n "38bdf8\|56, *189, *248" ab_test/style.css` → chỉ còn ở `--sig-select`
      và các selector `.selected`
- [ ] Script kiểm chứng ở §4.5 in `ĐẠT: 28/28`
- [ ] Mọi màu nhóm đạt ≥ 3:1 trên `#0f172a` (dùng bất kỳ contrast checker nào)
- [ ] `--text-300` trên `--ink-800` đạt ≥ 4,5:1
- [ ] Chụp ảnh bàn chơi màn 25 rồi chuyển sang **grayscale**: emoji vẫn phải là thứ
      tương phản nhất khung hình, thanh nhôm phải chìm xuống
- [ ] Mô phỏng mù màu deuteranopia + protanopia: không cặp nhóm nào trùng nhau hoàn toàn
      (nếu có, phân biệt vẫn còn nhờ emoji — nhưng ghi lại trong PR)
- [ ] `grep -rn "\.color" ab_test/src/core ab_test/src/generator` → đúng **3 dòng chuyền tay**
      (`SolvableLevelGenerator.js:98, 105, 940`), không phát sinh dòng mới
- [ ] So sánh 50 màn sinh ra trước/sau đổi màu: `tools/levels50.json` hoặc output của
      `node tools/selftest.js` phải **giống hệt** ở mọi trường trừ `color`
- [ ] `npm test` xanh
