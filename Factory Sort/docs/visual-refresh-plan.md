# Factory Sort — visual refresh

## Chẩn đoán và hướng chốt

Ảnh nền bitmap đang kéo phủ toàn bộ màn làm vùng trống thành mảng xám mờ, lệch với máy tối và thùng carton. Những ray kim loại tương phản mạnh tranh sự chú ý với item. Bốn icon booster còn bị vỡ trong standalone: build chỉ nhúng URL trong CSS, bỏ sót src của img.

Hướng visual: **xưởng đồ chơi ban ngày**. Máy sơn xanh dầu, nền xanh sương sạch, thùng carton ấm và item nhiều màu là tâm điểm. Giữ nguyên luật, kích thước vùng chạm và hình học đường conveyor; không thêm chi tiết nền dưới item.

## Tokens và phân cấp

- Sương xưởng `#DCECEE`: nền phẳng, không blur/ảnh phóng lớn.
- Xanh máy `#315B69`: khung máy/HUD.
- Cao su `#28434D`: mặt conveyor và các cột.
- Ray sơn `#7FA6AE`: viền mảnh; bỏ chrome đen bóng.
- Carton mật ong `#D7A15F`: giữ thùng hàng ấm làm foreground.
- Mực `#173D4B`: chữ trên nền sáng; chữ trắng trên xanh máy.
- Font Baloo 2 đã có, không tải font ngoài. Nút booster tối thiểu 44px, nhãn 11–12px; focus rõ, trạng thái disabled vẫn đọc được.

## Bố cục

HUD → vòng đơn hàng → queue → 3 cột hàng → thanh booster. Không đổi tọa độ renderer, thứ tự layer hay cơ chế giao hàng. Nền sáng liên tục; ray và máy là một hệ vật liệu, footer là bảng điều khiển gắn vào máy. Trên mobile 360×640 vẫn nhìn đủ bốn booster, không tràn ngang.

## Asset manifest / phân việc

| Asset | Quy cách | Ý nghĩa | Người thực thi |
|---|---|---|---|
| `assets/factory-stage.svg` | 600×1000, SVG ít chi tiết, opaque, không chữ | Nền xanh sương, đường panel mảnh chỉ ở rìa, vùng giữa yên | River |
| `assets/booster-freeze.svg` | 64×64, nền trong, stroke 3px | Đồng hồ + bông tuyết xanh | River |
| `assets/booster-shuffle.svg` | cùng bộ | Hai mũi tên giao nhau, xanh lá | River |
| `assets/booster-extra.svg` | cùng bộ | Ô queue + dấu cộng, vàng | River |
| `assets/booster-remove.svg` | cùng bộ | Khay + dấu trừ, cam san hô | River |
| Theme CSS / wiring HTML | ghi đè có phạm vi rõ, không sửa gameplay | Đồng bộ HUD, cột, conveyor, queue, booster; thay 4 src ảnh | Lite |
| Inline HTML assets | build script | Nhúng img SVG thành data URI; phát hiện asset thiếu/tương đối còn sót | River |

SVG phù hợp vì các asset này là hình khối, biểu tượng và nền panel phẳng cần sắc nét ở kích thước nhỏ. Không cần ảnh raster/phong cảnh nhiều chi tiết. River/Lite chỉ tạo code/asset theo brief; agent chính đọc, tích hợp, kiểm tra và triển khai.

## Nghiệm thu của agent chính

1. Kiểm tra code và phạm vi thay đổi, không đụng state/solver/input.
2. Chạy build, tests hiện có; xác minh standalone không còn img src tương đối, mọi ảnh decode được.
3. Soi trực tiếp desktop và 360×640: nền không mờ, item nổi bật, đủ 4 nút, queue 5/6, focus và disabled rõ.
4. Chỉ commit thay đổi nhiệm vụ, push và theo dõi Pages đến thành công.
5. Đọc usage giữa chặng; dừng mọi worker khi phiên 5 giờ usedPercent ≥60.

## Kết quả nghiệm thu

- River thực thi 5 SVG + sửa build nhúng img + MIME SVG + lượt polish; Lite thực thi theme và thay liên kết icon. Các phản hồi worker được agent chính đọc/tích hợp, không giao worker kiểm tra.
- `npm test`: qua selftest và cả hai bộ booster. `npm run build`: qua; 4 icon SVG đều nhúng data URI, bỏ dependency wallpaper cũ.
- Trình duyệt standalone: cả 4 ảnh complete, naturalWidth=64; không có console error.
- Mobile 360×640: scrollWidth=360, header=52px, cả bốn nút nằm trong viewport; Extra Tray tạo đủ 6 slot.
- Đã soi screenshot desktop/mobile và màn 49 nhiều item. Giữ nguyên logic, solver và hình học conveyor.
