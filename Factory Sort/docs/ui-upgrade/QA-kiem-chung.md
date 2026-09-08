# Phụ lục — Bộ kiểm chứng dùng chung cho mọi phase

Gom mọi script và ma trận kiểm thử vào một chỗ, để không phải lục lại từng file phase.

---

## A. Ma trận thiết bị & màn chơi

Mỗi phase phải chạy **toàn bộ** ma trận này trước khi mở PR.

| Khung | Vì sao có trong danh sách |
|---|---|
| **320 × 568** | máy nhỏ nhất còn phải hỗ trợ; mọi lỗi tràn lộ ra đây trước |
| **360 × 640** | Android phổ thông; khung **chật nhất theo chiều dọc** — kích hoạt `@media (max-height: 700px)` |
| **390 × 844** | iPhone hiện đại; khung tham chiếu của tài liệu |
| **430 × 932** | máy lớn; kiểm tra `max-width: 600px` và việc căn giữa |

| Màn | Vì sao |
|---|---|
| **1** | `visibleRows` nhỏ nhất, ít Thùng nhất → lộ lỗi "kéo giãn cột rỗng"; có tutorial |
| **12** | tier làm quen, `maxActive` nhỏ |
| **25** | tier khó, 3×4 Thùng đầy, 50 Khay — khung tham chiếu của mọi số đo |
| **39** | siêu khó, hàng chờ là ràng buộc sống còn → bắt lỗi lệch nhịp giao |
| **50** | `maxActive` lớn nhất, nhiều Khay hiện cùng lúc |

Thêm: xoay ngang, bật/tắt `prefers-reduced-motion`, và một lần chạy với
`Ctrl+Shift+P → Rendering → Emulate CSS prefers-color-scheme` (game chỉ có một theme,
nhưng phải không vỡ).

---

## B. Script kiểm tra bố cục (chạy trong Console)

```js
// ===== FACTORY SORT — KIỂM TRA BỐ CỤC =====
(function () {
  const out = {};
  const vw = innerWidth, vh = innerHeight;

  // 1. Tràn ngang
  out['Trang tràn ngang (px)'] = document.body.scrollWidth - document.body.clientWidth;
  const h = document.getElementById('game-header');
  out['HUD tràn ngang (px)']   = h.scrollWidth - h.clientWidth;

  // 2. Nút HUD nằm ngoài màn hình
  out['Nút HUD mất'] = [...h.querySelectorAll('.round-btn, .hud-pill')]
    .filter(b => { const r = b.getBoundingClientRect();
                   return r.right > vw + 0.5 || r.left < -0.5; })
    .map(b => b.id || b.className).join(', ') || '—';

  // 3. Ô hàng tràn khỏi Thùng
  const tran = [];
  document.querySelectorAll('.box').forEach(b => {
    const br = b.getBoundingClientRect();
    b.querySelectorAll('.slot').forEach((s, i) => {
      const sr = s.getBoundingClientRect();
      const d = Math.max(sr.right - br.right, br.left - sr.left);
      if (d > 0.5) tran.push(`box${b.dataset.boxId}/ô${i}: +${d.toFixed(0)}px`);
    });
  });
  out['Ô tràn khỏi Thùng'] = tran.length ? tran.join(' | ') : '—';

  // 4. Ngân sách chiều cao
  const ta = document.getElementById('tray-area').getBoundingClientRect();
  const ba = document.getElementById('boxes-area').getBoundingClientRect();
  out['Khu đơn hàng (%)'] = Math.round(ta.height / vh * 100);
  out['Bàn chơi (%)']     = Math.round(ba.height / vh * 100);

  // 5. Khay hiển thị vs engine cho phép
  const shown = [...document.querySelectorAll('#trays-container .tray')]
    .filter(t => getComputedStyle(t).display !== 'none').length;
  const allow = window.gameUI.engine.conveyor.getAllActiveTrays().length;
  out['Khay hiện / cho phép'] = `${shown} / ${allow}` + (shown === allow ? ' ✓' : ' ✗');
  out['Hiện QUÁ maxActive?']  = shown > window.gameUI.engine.conveyor.maxActive ? '✗ VI PHẠM' : '—';

  // 6. Kích thước đọc được
  const slot = document.querySelector('.slot:not(.placeholder)');
  out['Cỡ emoji (px)'] = slot ? parseFloat(getComputedStyle(slot).fontSize).toFixed(1) : 'n/a';
  out['--box-h']       = getComputedStyle(document.getElementById('boxes-grid'))
                           .getPropertyValue('--box-h').trim();

  // 7. Vùng chạm dưới 44px
  out['Vùng chạm < 44px'] = [...document.querySelectorAll(
      '.round-btn, .hud-pill, .btn, .tutorial-skip-btn, .level-btn')]
    .filter(e => { const r = e.getBoundingClientRect();
                   return r.height > 0 && Math.min(r.width, r.height) < 44; })
    .map(e => e.id || e.className.split(' ')[0])
    .filter((v, i, a) => a.indexOf(v) === i).join(', ') || '—';

  console.log(`=== ${vw}×${vh} — màn ${window.gameUI.currentLevel} ===`);
  console.table(out);
})();
```

**Ngưỡng đạt** (sau P0–P3, mọi khung, mọi màn):

| Dòng | Đạt |
|---|---|
| Trang tràn ngang | `0` |
| HUD tràn ngang | `0` |
| Nút HUD mất | `—` |
| Ô tràn khỏi Thùng | `—` |
| Khu đơn hàng (%) | `≤ 22` |
| Khay hiện / cho phép | `n / n ✓` |
| Hiện QUÁ maxActive? | `—` |
| Cỡ emoji | `≥ 21` (320px) / `≥ 25` (≥360px) |
| Vùng chạm < 44px | `—` (trừ `.level-btn`, chấp nhận ≥ 40) |

---

## C. Kiểm chứng "gameplay không đổi" — bắt buộc cho P1 và P3

### C.1. Nhật ký nhịp giao hàng

```js
// Chạy trên CẢ hai bản (trước & sau), cùng một chuỗi nước đi.
window.__log = [];
const orig = window.gameUI.triggerQueueDelivery.bind(window.gameUI);
window.gameUI.triggerQueueDelivery = function (box, tray, s, t) {
  const to = window.gameUI.trayRenderer.trayElements.find(x => x.id === tray.id);
  window.__log.push({ n: window.gameUI.engine.moveCount, box: box.id, tray: tray.id,
                      theta: +to.currentTheta.toFixed(3) });
  return orig(box, tray, s, t);
};
// Chơi 30 nước ở màn 39 → copy(JSON.stringify(window.__log))
```

**Đạt khi:** dãy `(n, box, tray)` **giống hệt** theo thứ tự; `theta` lệch **≤ 0,05 rad**.
Một cặp lệch thứ tự = nhịp giao đã đổi = **không được merge**.

### C.2. Bất biến engine không bị UI chạm vào

```bash
git diff --stat -- ab_test/src/core ab_test/src/generator ab_test/src/data
# Kỳ vọng: rỗng. Ngoại lệ DUY NHẤT: trường `color` trong ItemCatalog.js ở Phase 4.
```

### C.3. Bộ test logic

```bash
npm test
```
Phải xanh toàn bộ sau **mỗi** phase, không chỉ ở cuối.

### C.4. Đối chứng tỉ lệ thua ở màn siêu khó

Chơi màn **39** và **49**, mỗi màn **5 lần**, trên bản trước và bản sau, cùng một người
chơi trong cùng một buổi. Ghi lại số lần thua. Chênh lệch > 1/5 ở bất kỳ màn nào →
điều tra trước khi merge.

---

## D. Bảng ánh xạ file → phase

Dùng khi review PR: một PR chạm file ngoài cột của nó là dấu hiệu lệch phạm vi.

| File | P0 | P1 | P2 | P3 | P4 | P5 | P6 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `ab_test/index.html` | ✔ | ✔ | | ✔ | | | ✔ |
| `ab_test/style.css` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| `src/ui/BoxRenderer.js` | ✔ | | ✔ | | | ✔ | |
| `src/ui/TrayRenderer.js` | | ✔ | | ✔ | ✔ | ✔ | |
| `src/ui/QueueRenderer.js` | | | | ✔ | ✔ | | |
| `src/ui/UIManager.js` | | ✔ | | | | ✔ | ✔ |
| `src/ui/TutorialManager.js` | | | | | | | ✔ |
| `src/data/ItemCatalog.js` | | | | | ✔¹ | | |
| `src/core/**` · `src/generator/**` | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ | ✘ |

¹ **Chỉ** trường `color` — xem cảnh báo đầu file P4.

---

## E. Trình tự đóng gói & bàn giao

```bash
npm test                 # 1. logic phải xanh
npm run build:abtest     # 2. dựng lại bản standalone
npm start                # 3. mở http://localhost:8080/ab_test/ kiểm tra lần cuối
```

Bản standalone ra tại `ab_test/dist/FactorySort_ABTest_Inverted.html`.
**Không bao giờ sửa tay file này hay `ab_test/dist/bundle.js`.**

Mỗi PR đính kèm:
- Ảnh chụp **trước / sau** ở **360×640** và **390×844**, màn **1** và **25**
- Kết quả `console.table` của script §B ở cả 4 khung
- Với P1 và P3: nhật ký §C.1 của cả hai bản
