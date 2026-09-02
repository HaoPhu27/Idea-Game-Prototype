# Phase 0 — Game gốc thực sự là gì

Tài liệu này **không yêu cầu sửa gì**. Nó là bản chụp chính xác prototype hiện tại,
đọc trực tiếp từ mã nguồn. Mọi phase sau đều phải đối chiếu ngược về đây.

---

## 1. Cấu trúc màn hình (`index.html`, 64 dòng)

```
#game-container
├── #game-header        (60px)  → "Level: <span id=level-display>Random</span>"
│                                 "Moves: <span id=move-display>0</span>"
│                                 <button id=btn-new-game>New Game</button>
├── #play-area
│   ├── #boxes-area     (flex 65) → #boxes-grid   ← lưới 3 cột chứa các thùng
│   └── #tray-area      (flex 35) → #conveyor-belt (.port-in "IN ⬇", .port-out "⬇ OUT")
│                                   #trays-container ← các khay được đặt tuyệt đối
├── #drag-ghost         (display:none, bản sao của thùng khi kéo)
├── #overlay-win        "Level Complete!" / "All items delivered successfully." / #btn-next-level
├── #overlay-lose       "Out of Space!"   / "No more empty slots to move items."  / #btn-retry
└── #overlay-loading    "Generating level..." trên nền assets/loading_bg.png
```

Entry point: `<script type="module" src="src/ui/UIManager.js">`.

## 2. Dữ liệu item (`src/data/ItemCatalog.js`)

4 nhóm × 3 item = 12 emoji. Màu nhóm dùng cho nhãn khay.

| Nhóm | `id` | Màu | Item |
|---|---|---|---|
| Thú nhồi bông | `stuffed_animals` | `#FFB6C1` | 🧸 `bear`, 🦆 `duck`, 🐰 `bunny` |
| Đồ ăn | `food` | `#FFDAB9` | 🍎 `apple`, 🍕 `pizza`, 🍩 `donut` |
| Văn phòng phẩm | `stationery` | `#ADD8E6` | ✏️ `pencil`, 📎 `paperclip`, ✂️ `scissors` |
| Thể thao | `sports` | `#90EE90` | ⚽ `soccer`, 🏀 `basketball`, 🎾 `tennis` |

Emoji **là** phần nhận diện thị giác của game. Không thay bằng ảnh sprite.

## 3. Luật chơi (`src/core/`)

### Thùng — `Box.js`
- `maxSize = 3`, `items[]` là ngăn xếp phẳng.
- `canAccept()` → `items.length < 3 && !isWrapped`. **Không kiểm tra loại item.**
  Đây là điểm dễ hiểu nhầm nhất: thùng nhận mọi thứ, miễn còn chỗ.
- `checkWrapped()` → khi đầy 3 ô **và** cả 3 cùng `itemId` thì `isWrapped = true`.
- `getCategory()` / `getItemType()` chỉ trả giá trị khi đã `isWrapped`.

### Khay — `Tray.js`
- Mỗi khay giữ 1 thùng (`slot`), có `categoryId`, `targetItemId`, `matchMode`.
- `matchMode === 'itemType'` → chỉ nhận đúng 1 loại item (đòn bẩy độ khó từ level 40).
- `matchMode === 'category'` → nhận mọi thùng thuộc nhóm đó (mặc định).
- `canAccept(box)` yêu cầu: `box.isWrapped === true` **và** khay còn trống.

### Băng chuyền — `Conveyor.js`
- Không phải băng chuyền vật lý. Là **cửa sổ trượt**: `allTrays[]` + `windowStart` + `maxActive`.
- `getAllActiveTrays()` trả về `maxActive` khay kể từ `windowStart`, quay vòng bằng modulo.
- `maxActive` mặc định 4, có thể bị level ghi đè qua `levelConfig.maxActiveTrays`.
- `rotateLeft/rotateRight` là no-op khi tổng số khay ≤ `maxActive`.

### Engine — `GameEngine.js`
- Callback phát ra ngoài (đây là **toàn bộ** sự kiện mà UI được phép phản hồi):
  `onBoxUpdated(box, isRemoved)`, `onBoxWrapped(box)`, `onTrayExited(trayId)`,
  `onGameStateChanged(state)`, `onMoveCountUpdated(count)`.
- **Tầng 1 (chạm):** `selectSource(boxId, itemIndex)` → `selectTarget(boxId)`.
  Chạm lại chính thùng nguồn = bỏ chọn. Mỗi lần chuyển thành công `moveCount++`.
- `getValidTargets(sourceBoxId)` = mọi thùng khác đang `canAccept()`.
- **Tầng 2 (kéo):** `startDragWrappedBox(boxId)` → `dropOnTray(trayId)`.
  Khi thả đúng: khay nhận thùng, thùng bị **xóa khỏi `this.boxes`**, khay rời băng chuyền.
- `checkConditions()`:
  - THẮNG khi `!conveyor.hasRemainingTrays()` **và** mọi thùng đều rỗng.
  - THUA khi không còn thùng chưa-gói nào còn ô trống.
- Trạng thái: `PLAYING` / `WON` / `LOST`. **Không có điểm, sao, combo, giờ.**

## 4. Lớp giao diện (`src/ui/`)

| File | Vai trò | Ghi chú quan trọng |
|---|---|---|
| `UIManager.js` (290) | Nối engine ↔ renderer, xử lý chạm và kéo | `updateRender()` vẽ lại **toàn bộ** sau mỗi thay đổi |
| `BoxRenderer.js` (107) | Vẽ thùng: `.top-face` (3 `.slot`), `.front-face`, 2 `.flap`, `.tape` | `render()` bắt đầu bằng `container.innerHTML = ''` |
| `TrayRenderer.js` (207) | Đặt khay lên quỹ đạo elip, tự chạy `requestAnimationFrame` vô hạn | Hình học elip nằm **trong JS**, tách rời CSS |
| `ConveyorRenderer.js` (16) | Chỉ có `animateShift()` gắn animation `moveBelt 0.5s` | **`@keyframes moveBelt` không tồn tại trong `style.css`** → không có hiệu ứng nào |

## 5. Những thứ đã có sẵn nhưng chưa được dùng (mỏ vàng cho Phase 4)

| Tài nguyên | Trạng thái |
|---|---|
| CSS `.box.selected` (nhấc thùng lên 8px, viền xanh) | Có trong `style.css:113`, **BoxRenderer không bao giờ gắn class này** |
| CSS `.item-animating` (bay item giữa 2 thùng) | Có trong `style.css:244`, **không code nào dùng** |
| `engine.onBoxWrapped` | Engine có gọi, **UIManager không đăng ký** |
| `@keyframes moveBelt` | **Bị gọi mà không tồn tại** |
| `Solver.hint(boxes)` | Có sẵn nhưng chưa nối — *cố ý bỏ qua, vì gợi ý là cơ chế mới* |

→ Phase 4 chỉ cần **bật những thứ này lên**, không phát minh gì mới.

## 6. Bảng lỗi thực tế đã xác minh (không phải ý kiến thẩm mỹ)

| # | Lỗi | Bằng chứng | Phase xử lý |
|---|---|---|---|
| 1 | Bản "standalone" vẫn tải font từ Internet | `FactorySort_Standalone.html:7` trỏ tới `fonts.googleapis.com` | P1 |
| 2 | Bản standalone vẫn trỏ tới `assets/*.png` bằng đường dẫn tương đối | dòng 27 và 406, `grep -c "data:image"` = **0** | P1 |
| 3 | Lưới hộp tràn màn hình nhỏ | 3×120px + 2×20px gap = **400px**, mà `#boxes-area` padding 20px → chỉ còn 320px trên máy 360px | P2 |
| 4 | `height: 100vh` + thanh địa chỉ Android → cắt mất đáy | `style.css:22` | P2 |
| 5 | Không có `viewport-fit=cover` / safe-area → đè tai thỏ và thanh cử chỉ | `index.html:5` | P2 |
| 6 | Elip của CSS và elip của JS **không cùng thông số** | CSS: `bottom:30px; height:160px; border:30px`. JS: `cy=110, ry=80, rx=(w-90)/2` | P3 |
| 7 | Vòng `requestAnimationFrame` chạy mãi kể cả khi không có khay | `TrayRenderer.js:138` gọi vô điều kiện | P6 |
| 8 | Mỗi nước đi xóa và dựng lại toàn bộ DOM thùng | `BoxRenderer.js:11` | P6 |
| 9 | Ảnh ma khi kéo đặt góc trên-trái ngay tại ngón tay → thùng nằm dưới ngón, che khay | `UIManager.js:282` | P5 |
| 10 | Không `setPointerCapture` → kéo ra ngoài phần tử là mất sự kiện | `UIManager.js:187` | P5 |
| 11 | `backdrop-filter: blur()` ở header và overlay + `background-attachment: fixed` | `style.css:46, 370, 19` | P6 |
| 12 | Không có `overscroll-behavior` → kéo xuống làm trình duyệt refresh | `style.css` body | P2 |
