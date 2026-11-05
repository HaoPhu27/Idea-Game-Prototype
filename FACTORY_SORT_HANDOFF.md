# Factory Sort — bàn giao tiến trình feedback/UI

**Dừng theo yêu cầu người dùng:** 05/11/2026, khoảng 17:39 (UTC+7).
**Trạng thái:** WIP, chưa nghiệm thu xong, không coi đây là bản phát hành hoàn tất.
**Nhánh để tiếp tục:** `main`. Trước lần bàn giao này repository chỉ có nhánh mặc định `master`; `main` được tạo từ `master` tại `a019d29` theo yêu cầu push thẳng lên main. Không force-push hoặc đổi nhánh mặc định/nguồn GitHub Pages.

## Yêu cầu đang làm

Clone triệt để feedback/hiệu ứng và sửa UI còn tồn đọng theo mẫu Sort & Ship. Chỉ thay trình bày/input UI, giữ nguyên core, solver, bộ sinh màn, matching và hành vi bốn booster. Agent chính trực tiếp kiểm tra/lập task/review; River và Lite thực hiện coding. Quy tắc dừng theo usage đã được người dùng hủy.

Tài liệu task chi tiết: [feedback-parity-tasks.md](Factory%20Sort/docs/feedback-parity-tasks.md).
Mẫu đã được lưu kèm để máy khác vẫn đối chiếu được: [sort-ship-v0.10-standalone.html](Factory%20Sort/docs/reference/sort-ship-v0.10-standalone.html).

## Đã tích hợp, chưa phải tất cả đã nghiệm thu

- `VFXManager.js`: thay hạt DOM bằng canvas particles; burst/puff/trail/confetti theo vật lý mẫu, cap240, DPR-aware, rAF khi còn hạt; thêm pickup/land/invalid/pack/delivery/booster/warning/lose/toast/reset. Giữ API cũ. Đã sửa lỗi worker đặt lại `lastTs` mỗi frame khiến hạt không chạy; sửa tọa độ theo client size, DOMRect và xử lý canvas không hỗ trợ.
- `AudioManager.js`: thêm pickup/drop/land/whoosh/ting/warn/noise. Noise dùng decay trong buffer, không còn hàng nghìn gain automation mỗi lần gọi. `swap()` gọi `drop()`, nên test mapping đổi từ `[220,1500]` thành `[220]`.
- `UIManager.js`: nối FX vào pickup, landing, queue landing, delivery, booster thành công/thất bại, warning và lose; deferred pack feedback qua `_pendingPackFeedback` và `_playPackFeedback` để không phát trùng; giữ icon SVG khi wrapped; reset FX cùng epoch.
- Lite sửa ngưỡng drag6px: pointerdown chỉ là pending press; dưới ngưỡng là tap; synthetic click được chặn đúng một lần; pointercancel không commit; snap-back180ms có epoch/session; chạm lại box nguồn bỏ chọn im lặng.
- `BoxRenderer.js`: truyền native click event vào UI; đã có render art và sizing shelf từ task trước.
- Sửa mới nhất, **chưa review lại trên browser**: canonicalize `boxId` ở `handleSlotTap` và `handleItemDragStart` vì DOM string ID so với numeric Box.id làm mất `.slot.selected` và tô source như valid target. CSS ô trống valid-target đổi từ nền xanh cũ về giấy + viền cam.
- CSS thêm các trạng thái FX, canvas/toast, target, ghost, wrapped stamp, header tier, status footer cố định. Vẫn cần dọn cascade và so kỹ screenshot.

## Kiểm tra đã chạy / bằng chứng

- Build mới nhất `npm run build` **PASS**, sau khi tích hợp canonical ID và sửa optional DOM anchor.
- `tools/nonblocking-feedback-test.js` **PASS** sau sửa tap/drag.
- `tools/item-art-test.js` **PASS** sau cập nhật mapping âm thanh.
- `tools/booster-ui-test.js` mới nhất **PASS**. Trước đó fail do mock thiếu `document.querySelector`; các anchor FX mới đã chuyển sang optional calls, rect remove cũng optional.
- `npm test` trước các sửa cuối: selftest/generator và booster engine pass; booster UI từng fail dependency mock như trên, đã sửa nhưng **chưa chạy lại toàn bộ suite lần cuối**.
- Browser bản ESM đã quan sát sau một tap: canvas được tạo460×720, particles10, ghost ẩn và không toast reject. Tuy nhiên `.slot.selected` bằng0 và source bị tô valid; đây là lý do sửa canonical ID mới nhất. **Cần reload và xác nhận selected=1, source không còn valid-target.**
- Các lượt kiểm tra browser trên bản mẫu/skin trước đã chơi hết level1 và kiểm tra level49 mobile; lượt feedback mới chưa hoàn tất ma trận nghiệm thu.

## Việc phải làm tiếp, theo thứ tự

1. **Chạy và hoàn thiện `tools/feedback-engine-test.js`.** Đây là test mới do River viết, fixture đang dở; lỗi cuối quan sát: `transient nodes registered` vì kiểm tra `>2` trong khi toast replacement + praise thực tế đúng2 node. Không bỏ các lời gọi effect/reset để làm test pass.
   - Fixture đã sửa className/classList và thêm `makeFx()` reset manager cũ giữa các ca.
   - Còn assertion canvas không hỗ trợ đòi toàn stage không có canvas; sửa để so số canvas trước/sau (canvas được hỗ trợ cũ giữ lại sau reset là chủ ý).
   - Phần audio noise còn nhánh soft-skip và assert thời gian quá lỏng; đổi thành assert `noise` tồn tại, một source bắt đầu đúng2.04, buffer dài140 và tail decay; không được giữ `assert.ok(true)` để bỏ qua.
   - Thêm assert drain về0 hạt/0 rAF thực sự. Kiểm tra reset warning-only/bump-only, không chỉ target đã được `pack()` đăng ký.
2. **Kiểm tra cleanup trong `VFXManager.bump()`:** target của bump-only có thể chưa được `_trackTarget` vì một patch worker không khớp đã bị từ chối. Warning stage và confetti parent đã được track qua patch mới hơn. Không để timer bị hủy khi reset mà class cũ còn sót.
3. **Hoàn thiện animation tap-transfer.** `handleSlotTap()` hiện commit engine rồi `animateItemTransfer()` mới tìm `.slot.selected`; source có thể đã biến mất/deselect nên animation trả callback ngay, thiếu item bay. Cần chụp source/target rect + item ID trước commit và truyền snapshot tùy chọn vào renderer; không thay engine move hay queue callback.
4. Thêm test input thực tế cho tap1 lần/synthetic click, tap vào ô trống, silent deselect, threshold6px, cancel item/wrapped, stale snap-back khi đổi màn hoặc reuse ghost, canonical numeric ID. Có thể dựa fixture `tools/nonblocking-feedback-test.js` và dùng real UI class qua VM.
5. Rà stylesheet phần cuối: có nhiều lượt append. Đã loại một block correction sai bằng marker, nhưng cần kiểm tra không còn selector vô tác dụng/giá trị không hợp lệ. Kiểm tra `factory-praise` chỉ căn giữa một lần (transform + translate không cộng hai lần), animation có forwards, palette cam/nâu/giấy; source item drag không hiện trùng.
6. Nghiệm thu browser ở360×640 và390×844: pickup → hover target → valid drop/invalid snapback → pack → queue land → tray delivery → win; thử từng booster, lỗi/timeout/queue warning, retry giữa animation. Xác nhận particles di chuyển/decay, toast thay thế, hiệu ứng sạch sau reset, console không lỗi, không khóa thao tác không liên quan.
7. Chạy toàn bộ `npm test`, `npm run test:ui`, mọi `tools/*-test.js`, build; kiểm tra diff core/generator không thay đổi. Chỉ sau khi đạt mới phát hành/đưa vào nhánh Pages đang dùng.

## Tiếp tục trên máy khác

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
cd "Factory Sort"
npm test
npm run test:ui
node tools/feedback-engine-test.js
npm run build
npm start
```

Mở `http://localhost:8080/ab_test/` để debug ESM và `/ab_test/dist/FactorySort_ABTest_Inverted.html` để kiểm tra standalone. Mẫu nằm trong `docs/reference/`.

River/Lite ở máy cũ gọi qua helper ngoài repo `C:/Users/XGame/Documents/Codex/2026-11-02/set/outputs/ai-workers/worker.ps1`. Máy mới cần cấu hình provider/key riêng; **không commit khóa API**. Lite Opus từng trả content rỗng khi8192 token bị dùng hết cho reasoning; lần gọi F4 đã thành công khi orchestration nâng `max_tokens=24000`. Đây là giới hạn output của worker, không phải rule usage đã hủy.

Các prompt/phản hồi nháp trong `.ai-logs/feedback-parity/` của máy cũ bị gitignore và không cần cho việc tiếp tục: code đã tích hợp cùng lỗi/công việc còn lại được ghi ở đây. Một số output worker có placeholder/selector sai đã bị từ chối, không áp dụng lại chúng.

## Những thứ đã dừng / không thuộc task

- Không còn River/Lite request đang chạy; các Codex subagent cũ đều đã hoàn tất từ trước. Local server đã được dừng khi bàn giao.
- `WorldRestaurant/.ai-tasks/` là thay đổi không liên quan, giữ nguyên và không commit.
- Snapshot này cố ý giữ test WIP để tiếp tục, không tuyên bố regression suite xanh hoặc feedback đã clone hoàn tất.
