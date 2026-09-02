# Tối ưu Factory Sort cho Android — Bộ tài liệu bám sát game gốc

> **Phiên bản 2.** Bộ tài liệu cũ (8 phase) đã bị gỡ bỏ vì nó thêm vào những hệ thống
> **không hề tồn tại** trong prototype: điểm số, combo, sao, booster, undo, gợi ý,
> tutorial, cảnh báo sắp thua, và thay toàn bộ emoji bằng sprite sheet.
> Bộ này viết lại từ đầu sau khi đọc kỹ `src/core/`, `src/ui/`, `style.css`,
> `index.html` và file build `FactorySort_Standalone.html`.

---

## 1. Nguyên tắc bất biến (đọc trước khi làm bất kỳ phase nào)

Mục tiêu là **game chơi lên phải giống hệt game gốc**. Chỉ sửa phần *trình bày,
phản hồi, thao tác chạm, khung hình và hiệu năng*. Tuyệt đối không đụng tới luật chơi.

| Bất biến | Nguồn sự thật |
|---|---|
| Hộp có đúng 3 ô; nhận item **bất kỳ loại nào** miễn còn ô trống | `src/core/Box.js` → `canAccept()` |
| Đủ 3 item **giống hệt nhau** thì hộp tự đóng gói (`isWrapped`) | `src/core/Box.js` → `checkWrapped()` |
| Chỉ hộp đã đóng gói mới kéo được | `src/core/GameEngine.js` → `startDragWrappedBox()` |
| Khay nhận theo `category` hoặc theo `itemType` (từ level 40) | `src/core/Tray.js` → `canAccept()` |
| Băng chuyền là **cửa sổ trượt** trên `allTrays`, mặc định 4 khay hiện | `src/core/Conveyor.js` → `getAllActiveTrays()` |
| Thắng = hết khay **và** mọi hộp rỗng | `src/core/GameEngine.js` → `checkConditions()` |
| Thua = không còn ô trống ở bất kỳ hộp chưa gói nào | `src/core/GameEngine.js` → `checkConditions()` |
| Chỉ số duy nhất được đếm là **số nước đi** (`moveCount`) | `src/core/GameEngine.js` |
| 12 item dạng **emoji**, 4 nhóm, mỗi nhóm 1 màu | `src/data/ItemCatalog.js` |
| Băng chuyền hình **elip** với cổng `IN ⬇` bên phải và `⬇ OUT` bên trái | `index.html` + `style.css` |
| 3 overlay: Thắng / Thua / Đang tạo màn | `index.html` |

**Không được thêm:** điểm số, combo, sao, hệ sao, booster, power-up, undo, gợi ý,
đồng hồ đếm giờ, màn hướng dẫn, hệ thống tiền tệ, hay bất kỳ nút mới nào trên HUD.

**Không được bỏ:** cổng IN/OUT, nhãn nhóm trên khay, emoji mục tiêu mờ trên khay,
hiệu ứng gập nắp thùng, hiệu ứng nảy của thùng đã gói.

## 2. Quy tắc sửa code

1. **Không bao giờ sửa tay `FactorySort_Standalone.html`** — đây là file build ra.
   Sửa `index.html`, `style.css`, `src/**/*.js` rồi chạy lại `node tools/build.mjs`.
2. Bundler là dạng phẳng (mọi file dùng chung một scope):
   - không được trùng tên biến/hàm/class giữa các file;
   - cấm `export default` và `export { ... }` — chỉ `export class` / `export function` / `export const`;
   - file mới phải thêm vào mảng `JS_FILES` trong `tools/build.mjs` **đúng thứ tự phụ thuộc**.
3. Sau mỗi phase: chạy build, mở bằng trình duyệt, đối chiếu bảng bất biến ở mục 1.

## 3. Thứ tự thực hiện

| Phase | File | Nội dung | Rủi ro đổi gameplay |
|---|---|---|---|
| 0 | `00-GAME-GOC.md` | Bản mô tả chính xác game gốc — dùng để đối chiếu | — |
| 1 | `P1-standalone-offline.md` | Làm file standalone thật sự chạy offline | Không |
| 2 | `P2-khung-hinh-mobile.md` | Viewport, safe-area, lỗi tràn lưới hộp ở màn 360px | Không |
| 3 | `P3-conveyor.md` | Sửa băng chuyền: khớp hình học, làm sạch thị giác | Không |
| 4 | `P4-feedback.md` | Phản hồi chỉ dựa trên callback engine đã có | Không |
| 5 | `P5-cham-keo.md` | Độ tin cậy của chạm và kéo-thả | Không |
| 6 | `P6-hieu-nang.md` | rAF, render lại DOM, hiệu ứng nặng | Không |
| — | `KIEM-CHUNG.md` | Danh sách kiểm chứng "vẫn là game cũ" + QA build | — |

Phase 1 và 2 là bắt buộc; nếu thiếu chúng thì bản Android **hỏng thật sự**
(mất font, mất ảnh nền, hộp tràn ra ngoài màn hình nhỏ), không phải chuyện thẩm mỹ.
