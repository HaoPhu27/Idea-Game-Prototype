# Phase 2 — Thùng & ô hàng: làm cho đọc được ở 360px

**Mức độ đổi gameplay: 0%.** Chỉ sửa `style.css` và `BoxRenderer.js`.
Không đổi số ô (luôn 3), không đổi luật nhận hàng, không lộ Thùng bị che.

---

## 2.1. Vấn đề: khung nuốt mất chỗ, ô sai hình dạng, chữ bị cắt

Đo ở 390×844, màn 25 (12 Thùng nhìn thấy, `.box` = 114×116):

| Thành phần | Kích thước | Ghi chú |
|---|---|---|
| `.front-face` (dải nâu đặc) | 114 × 33 | **28,5% chiều cao Thùng, 0 thông tin** |
| `.top-face` viền + padding | 4 + 8 px | |
| Ô hàng (đo thực) | **39 × 69** | cao gấp **1,8×** rộng |
| Glyph emoji | ~27 × 27 | vuông |
| Ô thứ 3 tràn ra ngoài Thùng | **+24 px** | xem P0 §0.2 |

Ba lãng phí, theo thứ tự nặng dần:

**(a) `.front-face` ăn 28,5% chiều cao mỗi Thùng để không nói gì.**
`style.css:844` — một dải màu `#c08e5c` đặc, cao `28.572%`, chỉ để tạo cảm giác "mặt
trước hộp 3D". Với 12 Thùng, đó là **1/4 khối bàn chơi**.

**(b) Ô hàng cao gấp 1,8 lần rộng, để chứa một glyph vuông.**
Mỗi emoji nổi giữa hai dải trống 21px trên và dưới. Nhân 36 ô. Đồng thời **bề ngang thì
thiếu** — đây chính là chiều đang gây tràn.

**(c) Cỡ chữ tính theo `vw`, nhưng bề rộng thật của ô do SỐ CỘT quyết định.**
`style.css:994`: `min(clamp(20px, 7vw, 32px), calc(var(--box-h) * 0.36))` — công thức
không hề biết bàn chơi có mấy cột. Ở 390px nó cho `27,3px`, trong khi bề rộng cấp phát
cho một ô chỉ là `(114 − 4 − 8 − 18)/3 = 28px`.

> **Vì sao chỉ dư 0,7px mà lại tràn tận 24px?** Vì `font-size` **không phải** bề rộng
> glyph. Emoji có *advance width* ≈ **1,16em** — ở 27,3px là ~31,7px, cộng 6px margin
> thành ~38px. Đó chính là con số đo được (39px). Ba ô × 39 + 8 padding + 4 viền = 129px
> trong một Thùng 114px → **tràn 15–24px** tuỳ ô là item hay ô trống.
>
> Ghi nhớ con số **1,16** này: mọi công thức cỡ chữ cho emoji phải chia cho nó.
> Đây là lý do lỗi P0 §0.2 tồn tại được lâu — nhìn công thức thì tưởng vừa.

---

## 2.2. Thiết kế mới: Thùng nhìn từ trên xuống, ô vuông

Bỏ ẩn dụ "hộp 3D nhìn nghiêng" (đang tốn 28,5% chiều cao cho mặt trước) → chuyển sang
**"khay hàng nhìn từ trên xuống"**: một khung gỗ/carton mỏng chứa đúng 3 ô vuông.

```
TRƯỚC  (117 × 116)                     SAU  (117 × 84)
┌──────────────────────────────┐      ┌──────────────────────────────┐
│┌────┐ ┌────┐ ┌───▓▓          │      │ ┌──────┐┌──────┐┌──────┐     │
││    │ │    │ │   ▓▓ ô 39×69  │      │ │      ││      ││      │     │
││ 🍕 │ │ 🍕 │ │ 🧸▓▓ ô thứ 3  │      │ │  🍕  ││  🍕  ││  🧸  │     │  ô 32×32
││    │ │    │ │   ▓▓ BỊ CẮT   │      │ │      ││      ││      │     │  vuông
│└────┘ └────┘ └───▓▓          │      │ └──────┘└──────┘└──────┘     │
├──────────────────────────────┤      └──────────────────────────────┘
│  front-face — 33px, trống    │        ▔▔ mép đáy 7px ▔▔
└──────────────────────────────┘
   ▓▓ = thanh nhôm đè lên ô              Thùng thấp hơn 28%, ô vuông,
                                          không còn ô nào bị cắt
```

**Điều thu được là ô thứ 3 hiện trọn vẹn và Thùng gọn lại 28% chiều cao**, không phải
emoji to hơn. Số hàng (`visibleRows`) và số cột đều là tham số gameplay — **không được
đổi** — nên bề rộng một ô là trần cứng. Xem §2.4 để biết con số thật.

### Bỏ `.front-face` mà vẫn giữ được chất "thùng carton"

Cảm giác vật lý không đến từ dải nâu 33px, nó đến từ **viền, bóng đổ và nắp gập**. Giữ:
- `.flap.top` / `.flap.bottom` — hiệu ứng gập nắp khi đóng gói (giữ nguyên 100%)
- `.tape` — băng keo dán khi wrapped (giữ nguyên)
- `.box-logo` — huy hiệu loại hàng (giữ nguyên)
- bóng đổ `filter: drop-shadow(...)`

Chỉ bỏ dải màu đặc không mang thông tin.

```css
/* style.css:844 — .front-face: từ dải 33px xuống viền đáy 6px */
.front-face {
    top: auto;
    bottom: 0;
    height: 7px;                    /* SỬA: 28.572% → 7px, chỉ còn là mép thùng */
    background: linear-gradient(180deg, #a9764a, #8c6239);
    border: 2px solid #6b4a2a;
    border-top: none;
    border-radius: 0 0 8px 8px;
}

/* style.css:858 — .top-face: chiếm gần trọn Thùng */
.top-face {
    height: calc(100% - 7px);       /* SỬA: 71.428% → trừ đúng mép đáy */
    gap: 5px;
    padding: 5px;
    overflow: hidden;               /* từ P0 §0.2 */
    box-shadow: inset 0 4px 10px rgba(0,0,0,.42);   /* SỬA: nhẹ hơn, 20px quá nặng */
}

/* Các phần tử neo theo 71.428% cũ phải neo lại theo mốc mới */
.flap.top    { top: -34%; height: 34%; }
.flap.bottom { top: calc(100% - 7px); height: 34%; }
.tape        { top: 50%; height: 16%; }
.box-logo    { top: 50%; }
```

> Kiểm tra kỹ 4 dòng cuối. `style.css` hiện có **7 chỗ** hardcode `71.428%` hoặc `35.714%`
> (`.front-face`, `.top-face`, `.flap.top`, `.flap.bottom`, `.tape`, `.box-logo`, và
> `.box.selected` dùng `translateY(-11.428%)`). Sót một chỗ là hiệu ứng gập nắp lệch.
> Tìm hết bằng: `grep -n "428%\|714%" ab_test/style.css`

---

## 2.3. Ô hàng: vuông, không cắt

```css
/* style.css:994 — .slot */
.slot {
    flex: 1 1 0;
    min-width: 0;                          /* P0 §0.2 */
    /* KHÔNG dùng `aspect-ratio: 1/1` — đã thử và nó bị ghi đè âm thầm.
       `min-height: auto` mặc định của flex item suy từ nội dung (emoji + line-height)
       LỚN HƠN cạnh vuông, nên ô ra 31×38 chứ không phải 31×31. Đặt thẳng chiều cao
       theo bề rộng ô thì vừa chắc chắn vừa lấp được phần chiều cao dư của Thùng. */
    height: min(100%, calc(var(--slot-size, 30px) * 1.5));
    min-height: 0;
    align-self: center;
    margin: 0;

    display: grid;
    place-items: center;
    line-height: 1;

    /* Cỡ emoji bám bề rộng ô THẬT, đã chia cho advance width 1,16 của emoji.
       0.86 ≈ 1/1.16 — đây là trần cứng, KHÔNG được nâng lên "cho to". */
    font-size: min(var(--slot-size, 30px) * 0.86, var(--box-h, 105px) * 0.44);

    border-radius: 9px;
    background: rgba(0, 0, 0, 0.22);
    box-shadow: inset 0 1px 3px rgba(0,0,0,.45);
    border: 1px solid rgba(255,255,255,.06);
}
```

Nút thắt là **bề rộng cột**, không phải chiều cao — xem §2.4.

---

## 2.4. Nút thắt thật: bề rộng cột

Số cột do bộ sinh màn quyết định (`layout.columns`) và **không được đổi**. Nên bề rộng
một ô là `(bề rộng máy − padding − gap) / 3 cột / 3 ô`, một trần vật lý. Ba đòn bẩy duy
nhất còn lại, dùng cả ba:

**(a) Thu padding ngang của khu Thùng, và làm thanh nhôm mảnh lại:**
```css
[data-layout="inverted"] #boxes-area { padding-left: 14px; padding-right: 14px; }
.conveyor-side-beam { width: 5px; }          /* SỬA: 9px → 5px */
.conveyor-side-beam.beam-left  { left:  -5px; }
.conveyor-side-beam.beam-right { right: -5px; }
```
(P0 §0.3 đã nới lên 24px để chứa beam 9px; nay beam còn 5px nên 14px là đủ và an toàn.)

**(b) Thu gap giữa cột và padding trong Thùng:**
```css
#boxes-grid  { gap: clamp(5px, 1.4vw, 12px); }   /* SỬA: clamp(6px, 2vw, 20px) */
.top-face    { gap: 4px; padding: 4px; }          /* SỬA: gap thay margin 3px của .slot */
```

**(c) Bỏ margin ngang của `.slot`** — đã làm ở §2.3, `gap` của `.top-face` lo việc này,
tiết kiệm `18px → 8px` mỗi Thùng.

### Bảng kích thước sau P2 (đã tính advance width 1,16)

| Máy | cột cũ → mới | ô cũ → mới | emoji cũ → mới | Ô thứ 3 tràn |
|---|---|---|---|---|
| 320 | 91,7 → **94,0** | 20,6 → **24,7** | 22,4 → **21,2** | 1,8px → **0** |
| 360 | 104,5 → **107,3** | 24,8 → **29,1** | 25,2 → **25,0** | 0,4px → **0** |
| 390 | 114,1 → **117,0** | 28,0 → **32,3** | 27,3 → **27,8** | −0,7px* → **0** |
| 430 | 126,9 → **130,0** | 32,3 → **36,7** | 30,1 → **31,6** | −2,2px* → **0** |

\* Cột "tràn" ở đây tính theo `font-size`. Số đo thực tế trên máy lớn hơn nhiều
(**+24px ở 390px**) vì glyph rộng 1,16em chứ không phải 1em — xem §2.1(c).

### Nói thẳng về kỳ vọng

**`font-size` của emoji gần như không tăng** (−5% đến +5%). Trần vật lý do số cột đặt ra,
mà số cột là tham số gameplay. Ai kỳ vọng "emoji to gấp rưỡi" sẽ thất vọng.

Cái thật sự thu được từ Phase 2, theo thứ tự giá trị:

1. **Emoji hiện trọn vẹn.** Hiện tại ô thứ 3 của 2/3 số cột bị thanh nhôm cắt mất một
   phần hoặc toàn bộ. Sau P2: 0 cột bị cắt. Đây là thay đổi lớn nhất và nó không nằm ở
   con số `font-size` nào cả.
2. **Bỏ dải trống 28,5%** của mỗi Thùng → Thùng gọn lại, khối bàn chơi bớt nặng.
3. **Ô vuông đúng hình glyph** → hết hai dải trống 21px trên/dưới mỗi ô, mắt quét nhanh hơn.
4. Ba tín hiệu trạng thái ở §2.5 giúp giảm số lần phải đếm bằng mắt.

---

## 2.4b. Đừng kéo giãn Thùng cho đầy màn hình

Sau P1, ở máy cao (390×844 trở lên) bàn chơi có **thừa** chiều cao: 4 hàng Thùng trong
~576px nghĩa là 144px mỗi hàng, trong khi một Thùng 117px rộng chứa 3 ô vuông 32px chỉ
cần ~84px. Hiện tại `#boxes-grid { align-items: stretch }` và `.conveyor-track { flex: 1 }`
**kéo giãn cột xuống hết đáy** — đó chính là hình ảnh "cái thang rỗng" nhìn thấy ở màn 1
và ở nửa dưới màn 25: hàng chục pixel băng tải trống không chứa gì.

Đừng bù bằng cách phình Thùng ra. Hãy cho khối bàn chơi **đúng kích thước nội dung rồi
căn giữa**:

> **⚠️ Sửa ngày 8/9/2026 — bản đầu của mục này đã SAI.**
> Bản đầu bảo `#boxes-grid { align-items: center }` và cho cột cao bằng nội dung.
> Kết quả thực tế ở 390×844: bàn chơi **trôi lơ lửng giữa hai khoảng đen ~115px**
> trên và dưới — nhìn như trang bị lỗi, tệ hơn hẳn cái "thang rỗng" nó định chữa.
>
> Cách đúng: **ray kéo xuống đáy** (bố cục có điểm tựa), **chồng Thùng neo lên trên**
> (Thùng không bị kéo giãn), và **nâng trần chiều cao Thùng** để phần ray trống còn
> lại chỉ vừa đủ đọc như "băng tải chạy tiếp".

```js
// ab_test/src/ui/BoxRenderer.js:261 — trong _fitBoxHeight(), sau khi tính `h`
// Trần theo bề rộng ô. Hệ số 3.0 (KHÔNG phải 2.6):
//   2.6 -> Thùng 84px, chồng Thùng 366/583 -> còn ~220px ray trống, đọc ra như
//          "cái thang rỗng".
//   3.0 -> Thùng ~93px, chồng Thùng ~400/583, phần ray còn lại vừa đủ làm điểm tựa.
// Không nâng cao hơn: quá 3.0-3.4 thì Thùng thành hình đứng, trong khi nội dung của
// nó là 3 ô VUÔNG nằm ngang — tỉ lệ sai sẽ lộ ngay.
const slotW  = parseFloat(this.container.style.getPropertyValue('--slot-size')) || 28;
const capped = Math.min(h, Math.round(slotW * 3.0));
this.container.style.setProperty('--box-h', `${Math.max(50, capped)}px`);
```
```css
#boxes-grid     { align-items: stretch; height: 100%; }  /* cột cao hết khung */
.box-column     { height: 100%; }
.conveyor-track { flex: 1 1 auto; height: 100%; }        /* ray chạm "sàn nhà máy" */
.box-stack      { height: auto; flex: 0 0 auto; }        /* Thùng KHÔNG bị kéo giãn */
```

Ray chạy tới đáy nên bố cục có điểm tựa, còn chồng Thùng vẫn đúng tỉ lệ.

> Ở bản Inverted, `index.html:48-56` đang ép ngược lại
> (`align-items: stretch !important`, `#boxes-grid { height: 100% !important }`) với
> chú thích *"Cột kéo dài xuống đáy"*. Đó là chủ ý ban đầu — nhưng nó chỉ đẹp khi cột
> gần đầy Thùng. Ở màn 1 (2 Thùng) và ở mọi màn có `visibleRows` nhỏ, nó phản tác dụng.
> P1 đã xoá khối `!important` này, nên chỉ cần không dựng lại.

---

## 2.5. Ba tín hiệu trạng thái đang thiếu

Người chơi phải quét 12 Thùng × 3 ô mỗi nước đi. Ba tín hiệu sau **không thêm thông tin
mới** (đều suy ra được bằng mắt trong 100% trường hợp), chỉ giúp quét nhanh hơn:

### (a) Thùng đã có 2/3 cùng loại — "sắp gói được"

Đây là nước đi có giá trị nhất và hiện đang phải tự đếm.

```js
// ab_test/src/ui/BoxRenderer.js — trong render(), sau khi gắn 'wrapped'
// Chỉ ĐỌC dữ liệu đã hiển thị. Không lộ gì mới.
if (!box.isWrapped && box.items.length >= 2) {
    const [a, b] = box.items;
    if (a === b) boxEl.classList.add('near-pack');
}
```
```css
.box.near-pack .top-face {
    border-color: rgba(245, 158, 11, .55);
    box-shadow: inset 0 4px 10px rgba(0,0,0,.42), 0 0 0 1px rgba(245,158,11,.28);
}
```
Viền hổ phách mảnh. Không nhấp nháy, không icon — nếu không nhìn thì cũng không phiền.

### (b) Ô đích hợp lệ khi đang cầm hàng

`style.css:834` đã có `.box.valid-target` và `UIManager` đã truyền `validTargetIds` — hiện
chỉ đổi màu viền, rất khó thấy trên nền tối. Nâng lên:

```css
.box.valid-target .slot.placeholder {
    background: rgba(74, 222, 128, .18);
    border: 1px dashed rgba(74, 222, 128, .55);
    animation: slotBreathe 1.1s ease-in-out infinite;
}
@keyframes slotBreathe {
    50% { background: rgba(74, 222, 128, .3); }
}
@media (prefers-reduced-motion: reduce) {
    .box.valid-target .slot.placeholder { animation: none; }
}
```
Chỉ **ô trống** sáng lên, không phải cả Thùng → mắt biết chính xác hàng sẽ rơi vào đâu.

### (c) Thùng nguồn đang được chọn

`style.css:824` `.box.selected { transform: translateY(-11.428%) }` — nhưng `-11.428%`
được tính theo mốc 3D cũ. Sau khi bỏ `.front-face`, đổi sang giá trị tuyệt đối:

```css
.box.selected { transform: translateY(-8px); }
```

---

## 2.6. Chip `+N` Thùng bị che

`style.css:777` `.column-hidden-count` đang đặt `top: -10px` — đè lên đầu băng tải và, ở
bản Inverted, chồng vào đường phân cách với khu đơn hàng. Đưa vào trong cột:

```css
.column-hidden-count {
    top: 4px;                       /* SỬA: -10px → 4px */
    font-size: 10px;
    padding: 2px 8px;
    background: rgba(15, 23, 42, .92);
    border-width: 1px;
    box-shadow: 0 2px 6px rgba(0,0,0,.6);
}
```
Vẫn chỉ hiện **số lượng**, đúng bất biến. Không thêm tooltip nội dung.

---

## Checklist nghiệm thu Phase 2

- [ ] `grep -n "428%\|714%" ab_test/style.css` → chỉ còn các chỗ đã cố ý giữ, và
      hiệu ứng gập nắp Thùng khi đóng gói vẫn khớp mép (quay video so sánh)
- [ ] `.front-face` ≤ 9% chiều cao Thùng (7px trên `--box-h` ≥ 78px)
- [ ] Emoji ≥ 21px ở 320px, ≥ 25px ở 360px, **và nhìn trọn vẹn** — chụp ảnh cả 3 ô của
      cả 3 cột ở màn 25 để đối chiếu
- [ ] Không ô nào tràn khỏi Thùng (script P0 §0.2), ở cả 5 màn thử
- [ ] Không còn đoạn băng tải trống dưới Thùng cuối cùng (thử màn 1, `visibleRows` nhỏ nhất)
- [ ] `.near-pack` chỉ bật khi `items[0] === items[1]` và chưa wrapped — không bao giờ
      bật cho Thùng ở phần bị che
- [ ] `prefers-reduced-motion: reduce` tắt hết animation thở
- [ ] Băng keo, huy hiệu nhóm, hiệu ứng nảy của Thùng đã gói: giữ nguyên
- [ ] `npm test` xanh; `git diff --stat` không chạm `src/core|generator|data`
