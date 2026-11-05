# Feedback parity và sửa UI — task thực thi

## Agent chính chẩn đoán / phạm vi

Mẫu: `D:/Downloads/sort-ship-v0.10-standalone.html`, đặc biệt FX particles, AU.sfx, ghost, shelfpop, shake, floatText, toast và modal. Bản hiện tại mới đổi skin/audio cơ bản, chưa nối đủ chuỗi feedback. Không thay core, solver, level, matching, queue capacity hay hành vi booster.

Lỗi đã đọc từ source: pointerdown luôn bắt đầu drag nên tap có thể thành snap-back/reject; callback snap-back180ms thiếu epoch; logo wrapped thay SVG bằng emoji; text nổi mất căn giữa vì keyframes ghi đè transform; FX không có puff/trail/gravity như mẫu; feedback booster/invalid/queue landing/reveal chưa đầy đủ; selector UI chồng nhau gây feedback khó nhìn.

## F1 — River: FX và âm thanh (file riêng)

- `VFXManager.js`: canvas overlay DPR-aware nằm đúng hệ tọa độ stage, burst/puff/trail/confetti dùng vật lý mẫu (gravity600, puff-60, decay, vận tốc); giới hạn240 hạt, rAF chỉ chạy khi có hạt, pointer-events:none.
- API cũ giữ nguyên; thêm `pickup`, `land`, `invalid`, `pack`, `delivery`, `booster`, `warning`, `lose`, `toast`, `reset`, `trail`. FX chỉ trình bày, không điều khiển game callback hay thời gian gameplay.
- Chữ nổi900ms căn giữa và clamp trong stage, toast1500ms thay nội dung cũ, không giả điểm/coin. Reduced motion giữ tín hiệu tĩnh nhẹ. `reset` hủy hạt/rAF/timer/transient nodes và animation do manager tạo.
- `AudioManager.js`: thêm pickup/drop/land/whoosh/ting/warn/noise theo đúng mapping mẫu; giữ preference và API cũ. Không tự bật BGM.

## F2 — Lite: trạng thái UI / CSS (không sửa JS ở lượt đầu)

- Style canvas/toast/lift/target/landing/invalid/pack/dispatch/booster/freeze/shuffle/remove và keyframes duy nhất; nền/viền palette mẫu, không neon.
- Target hợp lệ viền cam và nhịp nhẹ, không transform hit target; ghost nổi bóng mềm; item đích nảy khi hạ; shelf pack squash35%; invalid shake450ms; reset không còn class/hạt.
- Header360px không đè timer/tier, label nhỏ vẫn đọc được; peek/hidden chip rõ, footer status không làm nhảy layout, focus và reduced motion đầy đủ. Không đổi vị trí tray đang chạy hay wrap/flight callback duration.

## F3 — River: nối feedback (chỉ UIManager, sau khi F1 API chốt)

- Nhặt → pickup âm + lift; rê → trail có throttle; hạ item thành công → land/bump/puff ở slot đích; sai → shake/snáp về + thông báo ngắn có lý do.
- Wrap → SVG stamp giữ nguyên, bụi và burst tại box; landing queue → puff/land; giao khay → whoosh/ting + burst/order bump; không phát trùng.
- Freeze/shuffle/extra/remove có hiệu ứng riêng + status, chỉ phát khi engine trả thành công. Thao tác thất bại không phát hiệu ứng thành công.
- Terminal win/lose, queue warning và level reset nối vào FX. Epoch và guards giữ nguyên; optional calls tương thích headless tests.

## F4 — Lite: sửa tap/drag và stale UI (thực thi sau F3)

- Ngưỡng6px: tap chọn/đặt đúng một lần, drag mới nhấc ghost và ẩn source; không reject khi chỉ chạm hoặc hủy pointer.
- Pointer cancel không commit move. Callback snap-back không chạm màn mới/ghost đang tái sử dụng. Mọi input khác vẫn mở khi chỉ có feedback trang trí.
- Không thay luật nhận item, thứ tự queue, cơ chế wrap, callback360/220ms hay thời gian550ms chờ gói. Tests mock được nâng đúng dependency, không bỏ assertion.

## F5 — River/Lite coding tests; agent chính chạy và nghiệm thu

- Test matrix: tap chính xác1 lần, drag/drop hợp lệ/sai/cancel, reset trong snap-back, particle bounds/coordinates/DPR/reset, toast replace, reduced motion, booster success/failure, SVG wrapped, không double feedback.
- Agent chính chạy full tests/build, so trực tiếp mẫu và đích, chơi hết level1, thử level49 ở360×640 và390×844. Kiểm tra ghost/hạt/class sạch khi retry, không tràn ngang, không lỗi console. Chỉ commit file của task, push và theo dõi Pages.
