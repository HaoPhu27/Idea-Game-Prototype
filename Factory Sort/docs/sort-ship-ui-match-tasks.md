# UI match — Sort & Ship v0.10

## Mẫu và ranh giới

Mẫu người dùng: `D:/Downloads/sort-ship-v0.10-standalone.html`. Agent chính đã đọc CSS, SVG, audio và mở gameplay mẫu. Chỉ chuyển ngôn ngữ UI/feedback; không chuyển core, level, luật swap, layer-item, đơn nhiều bộ, currency, quảng cáo, auto-play hoặc thời gian animation điều khiển gameplay.

## Tokens lấy từ mẫu

`ink #3b2a20`, `ink2 #6b4f3f`, `cream #f7ecd9`, `cream2 #efdfc6`, `paper #fffdf7`, `wood #c98b4e`, `wood2 #a86a34`, `wood3 #7d4b22`, `belt #4b4b55`, `belt2 #33333b`, `chev #ffd15c`, `accent #ff8a3d`, `accent2 #ffb347`, `good #4fae5a`, `bad #e4574b`, `blue #4f8de0`. Bóng cứng `0 6px 0 rgba(59,42,32,.18)`. Nền dot 1.2px / chu kỳ14px. Baloo 2 display, Nunito body nếu có font local.

## Task R1 — River: minh họa item và wiring trình bày

- 32 item ID hiện tại phải giữ nguyên và phân biệt được. Tạo SVG nét nâu 2–2.2px, hình phẳng màu kẹo theo mẫu, không emoji raster, không neon.
- Helper chỉ gắn background art + class trên DOM có sẵn; không thay item identity, text truy cập, handler hay hit target. Vẽ nhất quán trên item, logo box wrapped, queue, tray, drag ghost.
- Bundler chứa helper trước renderers. Không thay logic matching/conveyor/độ khó.
- Ghi chú từng nhóm item và các điểm nối UI-only; chỉ trả code để agent chính tích hợp.

## Task L1 — Lite: skin, layout và trạng thái

- Thay theme daylight cũ bằng reference skin riêng: nền giấy kem/dot, gutter nâu, HUD pill giấy viền nâu, rail matte charcoal có điểm vàng, khay dạng ticket giấy/carton, cột dạng tủ gỗ và ô trắng.
- Bỏ chrome, glow neon, nền xanh, box face tối; áp dụng border2–2.5px và bóng cứng giống mẫu.
- Giữ 3 cột/visibleRows/cửa sổ khay theo engine, queue5/6, timer, bốn booster và mọi ID DOM. Có thể thay chi tiết trang trí nhưng không ẩn thông tin gameplay. Không thêm badge số lượng giả.
- Skin đầy đủ level menu, win/lose/help/tutorial, nút, focus, selected/valid/reject/wrapped, peek hidden. Status màu cam/xanh/đỏ đúng palette.
- Bản mobile360×640 vẫn đủ thao tác; không ép fixed390×844 làm biến dạng hit target.

## Task R2 — River: feedback thị giác và audio

- Giữ API VFXManager/AudioManager và tất cả thời điểm callback cũ. Chỉ thay cách thể hiện: text nâu/cam viền nâu, hạt tròn giấy vàng/trắng, bump450ms, float900ms, shake450ms, modal400ms.
- Audio map cùng mẫu: click900Hz square60ms; drop220→140 triangle90ms; invalid200→150 saw140ms; pack320→1000 sine160ms + chime1300; orderDone523/659/784/1046; win523/659/784/1046/784/1046/1318; lose420→140 +300→90.
- Không thêm nhạc nền tự bật hay delay gameplay. Reduced motion tắt bớt presentation; không chặn input bằng feedback.

## Agent chính nghiệm thu

Đối chiếu screenshot mẫu / đích ở cùng viewport, lần lượt: palette+dot, nét viền/bóng, HUD, conveyor, kệ/slot, item, booster, modal và feedback. Kiểm tra source core/generator không đổi; chạy toàn bộ regression, build; xác nhận item art/callback/queue capacity hoạt động. Push commit riêng và theo dõi Pages.

## Kết quả thực thi và review

- River: minh họa32ID, wiringDOM, audio/VFX, modal và các lượt sửa fidelity. Lite: skin gameplay giấy/wood/slot/HUD/booster. Agent chính trực tiếp so mẫu, tích hợp và chạy kiểm tra; không giao worker nghiệm thu.
- Đã đối chiếu mẫu và đích ở390×844, kiểm tra màn49 tại360×640. Nềnkem#f7ecd9/dot14px, ôpaper#fffdf7, viềnnâu#3b2a20, gỗ#c98b4e→#a86a34, primarycam#ff8a3d. Không giữ blur/neon/chrome của skin cũ.
- Các điểm review đã sửa: hộp quá cao→shelf50–64px; chânray/peeknâu rỗng; strokeSVG; fontBaloo2sai tên; modalstatstối/nútprimarytrắng/backdropblur. Nunito700 được nhúng local, có OFL đi kèm.
- Chơi hết màn1 bằng hai thao tác kéo thả: wrap→queue→delivery→win hoạt động. Các biến timer, queue5/6, bốnbooster và khóa hiddenbox giữ nguyên.
- `npm test`, `npm run test:ui`, toàn bộ `tools/*-test.js`, build đều qua. Test mới xác nhận32artkhácnhau/đúngID, textfallbackkhôngđổi, staleartđượcxóa và audiofrequency mappings.
- Browser360: scrollWidth=360, boxHeight=50, cả4buttonbottom=621<640, consoleerrors=[]; modalprimary rgb(255,138,61), stats rgb(239,223,198), backdrop-filter none.
- Core và generator diff trống. Khác bố cục do cơ chế được giữ có chủ ý: traydiđộng, queue5/6,3cột và4booster; không sao chép stationarymulti-order/swap/ads của mẫu.
