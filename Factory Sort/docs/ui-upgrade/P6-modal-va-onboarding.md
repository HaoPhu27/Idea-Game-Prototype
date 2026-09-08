# Phase 6 — Modal, chọn màn & onboarding: nói chung một ngôn ngữ

**Mức độ đổi gameplay: 0%.** Chỉ sửa `style.css`, `index.html`, và `UIManager.renderLevelMenu()`.
Không đổi nội dung hướng dẫn, không đổi số bước tutorial, không đổi phân tier độ khó.

---

## 6.1. Vấn đề: hai ngôn ngữ thị giác trong cùng một game

Game có **hai bộ mặt tách rời**:

| | Trong màn chơi | Modal chọn màn |
|---|---|---|
| Nền | `#0f172a` → `#080d17`, kim loại | thẻ tối, nhưng nút phẳng |
| Nút | gradient tối + viền neon + `box-shadow` 3 lớp | **màu kẹo phẳng**, `box-shadow: 0 4px 0` |
| Bảng màu | cyan / hổ phách / thép | lục `#22c55e`, ngọc `#06b6d4`, lam `#3b82f6`, cam `#f97316`, tím `#a855f7` |
| Chữ | `Baloo 2` 800, hoa, letter-spacing | `bold`, không letter-spacing |
| Bo góc | 12–24px | 8px |

`style.css:1820-1873` (`.level-btn` và 5 biến thể tier) trông như lấy từ một game
match-3 casual khác. Đặt cạnh modal thắng cuộc — vốn được làm rất tốt với `qc-badge`,
`win-stats-grid`, `btn-primary-industrial` — sự vênh rất rõ.

**Vì sao đáng sửa:** người chơi mở modal chọn màn ở **mọi lần chuyển màn**. Nó là màn hình
được nhìn nhiều thứ hai sau bàn chơi. Một game "nhà máy công nghiệp" mà bảng chọn màn
trông như kẹo dẻo thì cả không khí sụp.

---

## 6.2. Chọn màn: chuyển sang ngôn ngữ bảng điều khiển ca làm việc

Giữ nguyên **hoàn toàn** logic phân tier (`UIManager.renderLevelMenu()`,
`UIManager.js:286-330`) — cùng 5 nhóm, cùng số màn, cùng chú thích. Chỉ đổi cách vẽ.

```css
/* style.css:1820 — THAY toàn bộ khối .level-btn và 5 biến thể */

.level-btn {
    padding: 12px 6px;
    font-family: 'Baloo 2', sans-serif;
    font-size: 17px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--text-100);
    background: linear-gradient(180deg, var(--ink-700), var(--ink-800));
    border: 1.5px solid var(--tier, var(--ink-600));
    border-radius: 12px;
    box-shadow: 0 2px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);
    cursor: pointer;
    position: relative;
    transition: transform .12s var(--spring-bounce), border-color .18s, box-shadow .18s;
}

/* Tier nói bằng một dải màu MỎNG ở mép trên — giống dải cap trên Khay đơn hàng.
   Cùng một quy ước "màu = phân loại" đã dùng ở bàn chơi. */
.level-btn::before {
    content: '';
    position: absolute; inset: 0 0 auto 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    background: var(--tier, var(--ink-500));
}

.level-btn.level-tutorial,
.level-btn.level-easy        { --tier: #3FBF6F; }
.level-btn.level-acclimation { --tier: #2FC3AE; }
.level-btn.level-normal      { --tier: #4FA8F5; }
.level-btn.level-hard        { --tier: #F59E3C; }
.level-btn.level-super-hard  { --tier: #A96BE8; }

.level-btn:active { transform: scale(.95); box-shadow: 0 1px 0 rgba(0,0,0,.5); }

.level-btn.active-level {
    border-color: var(--sig-select);
    box-shadow: 0 0 0 1px var(--sig-select), 0 0 14px rgba(56,189,248,.45),
                inset 0 1px 0 rgba(255,255,255,.1);
}
```

Cùng 5 màu tier, nhưng lấy **đúng từ bảng màu nhóm hàng ở Phase 4** — nên chọn màn và bàn
chơi dùng chung một hệ. Nút thành thẻ kim loại có dải phân loại, hợp với `.hud-pill` và
`.round-btn` sẵn có.

Chú thích cũng đồng bộ:
```css
.legend-dot.tutorial     { background: #3FBF6F; }
.legend-dot.acclimation  { background: #2FC3AE; }
.legend-dot.normal       { background: #4FA8F5; }
.legend-dot.hard         { background: #F59E3C; }
.legend-dot.super-hard   { background: #A96BE8; }
.legend-dot { box-shadow: none; }        /* bỏ glow, đây là tầng 3 */
```

---

## 6.3. Modal thắng: sửa 3 lỗi trình bày

Modal thắng (`index.html`, `.win-card`) về cấu trúc là tốt nhất trong game. Ba lỗi nhỏ,
quan sát được ở 390×844:

**(a) Nhãn QC bị ngắt dòng, để rơi một dấu `★` xuống dòng hai.**
Chuỗi `★ QC PASSED • ĐẠT CHUẨN XUẤT XƯỞNG ★` dài 34 ký tự trong pill 420px.
```html
<!-- index.html — bỏ hai dấu sao viền, chuyển thành phần tử riêng -->
<span class="qc-badge"><b class="qc-mark">★</b> QC PASSED • ĐẠT CHUẨN XUẤT XƯỞNG</span>
```
```css
.qc-badge { font-size: 10.5px; letter-spacing: .06em; white-space: nowrap; }
.qc-mark  { color: var(--sig-ready); }
```

**(b) Tiêu đề `XUẤT XƯỞNG THÀNH CÔNG!` xuống 2 dòng ở 390px.**
```css
.overlay-card h2 { font-size: clamp(20px, 5.6vw, 26px); line-height: 1.1; }
```

**(c) Sao chưa sáng có màu `#334155` — gần như tàng hình trên nền `#111d2e`.**
```css
.win-stars .star { color: #3d4d66; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
.win-stars .star.on {
    color: var(--sig-ready);
    text-shadow: 0 0 16px rgba(245,158,11,.8);
}
```

Giữ nguyên: `win-stats-grid`, hiệu ứng sao lần lượt sáng (`UIManager.showWinCelebration`,
`UIManager.js:179-211`), confetti, âm thanh.

---

## 6.4. Modal thua: nói rõ **vì sao** thua

`#lose-reason` hiện in một câu tĩnh trong `index.html`:
> *"Hàng chờ đã đầy 5/5 thùng, không còn chỗ trống để luân chuyển hàng hóa."*

Nhưng `GameEngine.checkConditions()` có **hai** đường thua khác nhau:
1. Hàng chờ đầy 5/5 và không Khay nào đang hoạt động nhận được (`GameEngine.js:133-140`)
2. Không còn ô trống ở bất kỳ Thùng chưa gói nào

Người chơi thua vì lý do (2) vẫn đọc câu về hàng chờ → không học được gì từ thất bại.

```js
// ab_test/src/ui/UIManager.js — trong callback onGameStateChanged, nhánh 'LOST'
// Chỉ ĐỌC trạng thái đã hiển thị trên màn hình. Không lộ thông tin mới.
const queueFull = this.engine.getQueue().length >= this.engine.maxQueueSize;
document.getElementById('lose-reason').textContent = queueFull
    ? `Hàng chờ đầy ${this.engine.maxQueueSize}/${this.engine.maxQueueSize} và không Khay nào đang chạy nhận được các kiện này.`
    : 'Mọi Thùng đang hiện đều đã kín 3 ô mà không có Thùng nào gom đủ 3 món cùng loại.';
```

> Đây **không phải** gợi ý nước đi. Nó chỉ diễn đạt lại điều kiện thua mà engine vừa
> kiểm tra, bằng chữ. Tuyệt đối **không** thêm câu kiểu "lẽ ra bạn nên..." hay chỉ ra
> nước đi đúng — đó mới là đổi gameplay.

---

## 6.5. Banner hướng dẫn: dừng che bàn chơi

Ở bản Inverted, `index.html:72-85` đẩy `.tutorial-banner` xuống đáy để không che băng
chuyền. Nhưng ở đáy nó **che 2 hàng Thùng dưới cùng** — đúng chỗ người chơi phải chạm.
Xem lại ảnh chụp màn 1: banner phủ kín từ y=730 đến y=844.

Sửa: banner không nổi trên bàn chơi nữa, mà **chiếm chỗ của chính nó** trong luồng bố cục.

```css
[data-layout="inverted"] .tutorial-banner {
    position: static;               /* SỬA: absolute → static */
    margin: 4px 12px 0;
    animation: slide-up-fade .3s var(--spring-snappy);
}
[data-layout="inverted"] #play-area.is-tutoring #boxes-area {
    /* Bàn chơi tự co lại nhường chỗ, không bị che */
    flex: 1 1 auto;
}
```
```js
// TutorialManager — bật/tắt class khi vào/ra tutorial
document.getElementById('play-area').classList.toggle('is-tutoring', this.active);
```

Vì `#boxes-area` là `flex: 1 1 auto` và `BoxRenderer._fitBoxHeight` bám `ResizeObserver`,
Thùng tự thấp lại vừa khít. **Không Thùng nào bị che.** Đây là lý do phải làm P1 (dọn
`!important`) trước — với `height: 230px !important` trên `#tray-area`, flex không co được.

Đồng thời tăng vùng chạm nút *Bỏ qua*. Hiện `style.css:2073` cho `padding: 5px 10px`,
`font-size: 13px` → chiều cao thực ~28px, dưới ngưỡng vùng chạm tối thiểu 44px:
```css
.tutorial-skip-btn { min-height: 40px; padding: 8px 14px; }
```

---

## 6.6. Modal trợ giúp & tổng kết tutorial: rút ngắn

`#overlay-help` và `#overlay-tutorial-win` đang là **4 thẻ quy tắc, mỗi thẻ 2–3 dòng chữ**.
Ở 360×640 chúng tràn ra ngoài `max-height: 85dvh` và phải cuộn — người chơi cuộn qua
là mất luôn quy tắc thứ 4.

Không viết lại nội dung (đó là quyết định thiết kế game, không phải UI). Chỉ nén trình bày:

```css
.rules-summary { display: grid; gap: 8px; }
.rule-card {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 10px;
    align-items: start;
    padding: 9px 11px;
    background: var(--ink-700);
    border: 1px solid var(--ink-600);
    border-radius: 12px;
    text-align: left;
}
.rule-icon { width: 40px; height: 40px; font-size: 22px; display: grid; place-items: center;
             background: var(--ink-800); border-radius: 10px; }
.rule-text strong { font-size: 14px; display: block; margin-bottom: 2px; }
.rule-text p      { font-size: 12.5px; line-height: 1.35; color: var(--text-300); }

.help-modal, .tutorial-win-modal { max-height: min(88dvh, 640px); }
```

Đo lại: 4 thẻ × ~74px + tiêu đề + nút = **~420px**, vừa trọn ở 360×640 mà không cuộn.

---

## 6.7. Ba chi tiết nhỏ nhưng đáng làm

**(a) Overlay `Generating level...` đang là tiếng Anh** giữa một game hoàn toàn tiếng Việt
(`index.html`, `#overlay-loading`). Đổi thành `Đang chuẩn bị ca làm...`.

**(b) `#overlay-loading` không có chỉ báo tiến trình.** Sinh màn khó mất 200–800ms.
Thêm một thanh cuộn vô tận, tái dùng chính hoạ tiết băng tải:
```css
.loading-bg::after {
    content: ''; display: block; height: 6px; width: 160px; margin: 12px auto 0;
    border-radius: 3px; overflow: hidden;
    background: repeating-linear-gradient(90deg, var(--ink-500) 0 12px, transparent 12px 24px);
    animation: beltMarch .6s linear infinite;
}
@keyframes beltMarch { to { background-position: 24px 0; } }
```

**(c) Nút *Đóng ✕* của modal chọn màn dùng `.btn.primary`** — một class không tồn tại
trong `style.css` (chỉ có `.btn-primary-industrial`). Nó đang rơi về `.btn` mặc định
màu `#38bdf8` phẳng. Đổi thành `btn btn-ghost`, và tương tự cho `#btn-close-help`,
`#btn-tutorial-next`.
```
grep -n 'class="btn primary' ab_test/index.html    # 3 chỗ cần sửa
```

---

## Checklist nghiệm thu Phase 6

- [ ] Chụp modal chọn màn và bàn chơi cạnh nhau: **cùng một ngôn ngữ thị giác**
      (bo góc, viền, gradient, chữ)
- [ ] 5 màu tier lấy đúng từ bảng màu Phase 4, `.legend-dot` khớp `.level-btn::before`
- [ ] Phân tier màn chơi (`renderLevelMenu`) không đổi một màn nào — so `git diff`
- [ ] Nhãn QC không ngắt dòng ở 320/360/390px
- [ ] Tiêu đề modal thắng nằm 1 dòng ở ≥ 360px
- [ ] Thua vì hàng chờ đầy và thua vì hết ô trống hiện **hai câu khác nhau**, đúng nguyên nhân
- [ ] Bật tutorial màn 1: banner **không che Thùng nào**, Thùng tự thấp lại
- [ ] Nút *Bỏ qua* có vùng chạm ≥ 40×40px
- [ ] Modal trợ giúp không phải cuộn ở 360×640
- [ ] `grep -n 'class="btn primary' ab_test/index.html` → 0 kết quả
- [ ] Không còn chuỗi tiếng Anh nào lộ ra cho người chơi
- [ ] `npm test` xanh
