# Đối chiếu tài liệu Fish Sort và áp dụng vào Factory Sort

## Phạm vi bằng chứng

Tài liệu được đối chiếu là `FishSortDiffQuick.html` và `Thuat_Toan_Tao_Kho_Fish_Sort.md` do người dùng cung cấp. HTML là công cụ thiết kế/xuất cấu hình, không phải mã nguồn runtime đầy đủ hoặc bản game Fish Sort có thể chơi. Vì vậy không thể dùng hai file này để xác nhận toàn bộ thuật toán của game đã phát hành.

| Nội dung trong tài liệu AI | Bằng chứng trong HTML | Kết luận |
| --- | --- | --- |
| Trộn phân bổ nền và độ nhấn, chặn O5, chuyển trọng số tier không khả dụng, áp sàn O1, làm tròn | Hàm `weights`, `round2`, `RULES`, `BASE`, `EMPH` khoảng dòng 1335–1460 | Có mã authoring để kiểm chứng. |
| Chia đoạn ở mốc 40% | `with40` và các hàm tạo segment | Có trong công cụ. Lý do runtime đổi fallback tại 40% được mô tả trong lời giải thích, không có implementation runtime để xác nhận. |
| Chuỗi thua chọn D, score cá, cascade chọn đơn | Bảng giải thích, chú thích nhắc `OrderSelector`, `MatchOrder`, `CascadeSelect` | Chỉ xác nhận công cụ mô tả hợp đồng này; chưa xác nhận mã game thực hiện đúng hợp đồng. |
| DDA tự nhân trọng số theo phong độ người chơi | Cờ xuất `isDynamicDiff` và văn bản nhắc `DynamicDifficultyService` | Có cờ cấu hình; thiếu service và thuật toán đo phong độ nên không xác nhận công thức runtime. |
| Tự cân bằng từ win rate | `easeMap`, `targetT`, `pick`, `runPlan` | Có bước authoring dùng CSV và chọn kịch bản. Đây không tự chứng minh việc đổi đơn giữa một lượt chơi. |

Một số điểm cần đọc chính xác:

- Ở `tempCount=0`, công cụ **chặn trần** O1 ở 20%, không xóa hẳn O1. Khi không có cá trong khay, trọng số này vẫn cần fallback nếu runtime rút trúng.
- Sàn xác suất O1 không phải cam kết đơn tiếp theo sẽ cứu được khay; còn phụ thuộc ứng viên thực tế và cách fallback.
- `FS_DIRS.EMPH_AMT` dùng 0,3/0,5/0,7 cho phần đường cong; hàm authoring `weights` nhận `EMPH` 0,40/0,55/0,70. Không gộp hai bộ hệ số thành một.
- Tổng xác suất bằng 1 và có sàn cứu khay không chứng minh màn có lời giải. Tính giải được phải kiểm tra trên trạng thái và luật gameplay cụ thể.

## Phần có thể chuyển sang Factory Sort

Ý tưởng sử dụng được là thiết kế các đoạn **tích áp lực → giải phóng → tích áp lực**, thay vì chỉ tăng số lượng vật phẩm hoặc ép thời gian từ đầu tới cuối. Factory Sort áp dụng ý tưởng đó ở bước sinh màn, thông qua thứ tự đơn đã được cố định theo seed.

Không sao chép trực tiếp công thức score cá: Fish Sort mô tả khay chứa từng con cá; hàng chờ của Factory Sort chứa box đã đóng gói đủ ba vật phẩm. Số ô trống có ý nghĩa khác nhau. Các nhãn O1–O5 và mốc 40% không trở thành luật bắt buộc của Factory Sort.

## Thiết kế được áp dụng

1. Giữ phép sinh ngược và lời giải tham chiếu trên đúng cột/vùng nhìn thấy.
2. Tạo các khối đơn từ thứ tự hoàn thành tham chiếu. Kích thước khối là `A + extra`, với `A` là số tray hoạt động. Đổi thứ tự trong khối tạo thời điểm box cần chờ đơn phù hợp.
3. Giới hạn lookahead để lời giải tham chiếu không cần lấp hết năm slot hàng chờ. Mục tiêu thiết kế giữ ít nhất một slot dự phòng; replay thực tế vẫn là bước kiểm chứng cuối cùng.
4. Normal dùng nhịp nhẹ; Hard có sóng siết/nhả; Super Hard có nhiều đỉnh áp lực hơn nhưng vẫn có đoạn hồi phục. Đây là thứ tự được author từ tiến trình tham chiếu, không phải bộ điều khiển đọc bí mật trạng thái người chơi.
5. Ghi cả profile được yêu cầu và trace hàng chờ đo khi phát lại. Profile mong muốn không được báo như áp lực thực đã đạt. Nếu schedule đề xuất không qua replay và phải dùng lịch đơn an toàn, ghi rõ fallback.
6. Tuyển seed bằng kết quả bot, sau đó dùng tập độc lập để kiểm định. Bế tắc thật, thắng và hết ngân sách bước được báo riêng. Timer là trục khác, có kiểm tra bằng engine thật.

Không thêm DDA âm thầm sau khi người chơi thua. Cùng seed và phiên bản thuật toán phải cho cùng màn; bộ cấu hình có thể được chỉnh qua bước authoring và kiểm định rõ ràng.

## Điều kiện nghiệm thu

- Không mất/thêm loại đơn; mỗi tray chỉ nhận đúng một box cùng emoji.
- Seed tái lập được, có lời giải tham chiếu qua engine thật ở cả chế độ giao tức thời và callback OUT trễ.
- Không báo thua khi tray đã nhận hàng còn trên đường OUT.
- Không lấy loop của bot làm bế tắc chắc chắn; không quảng cáo bot rate là tỷ lệ thua người thật.
- Báo rõ màn nằm ngoài dải mục tiêu, mức dùng fallback và áp lực hàng chờ thực tế.

## Kết quả kiểm định

Agent chính đã chạy tuyển seed và kiểm định trên phiên bản thuật toán cuối. Chi tiết từng màn nằm trong `Factory Sort/tools/levels50.json`.

- Mỗi màn xét tối đa 64 ứng viên, sàng lọc 24 lượt, xác nhận bằng hai luồng RNG độc lập 128 và 96 lượt, rồi kiểm định bằng 256 lượt holdout không tham gia tuyển seed. Tổng holdout: 12.800 lượt trên 50 màn.
- RNG sàng lọc/xác nhận thứ nhất/xác nhận thứ hai/holdout lần lượt là 63023, 74017, 85133, 96209; candidate seed offset là 100.
- Cả 50 màn đạt dải mục tiêu trên holdout và đạt điều kiện xác nhận. Không có board trùng lặp và không có trường hợp phải quay về lịch đơn fallback.
- Phát lại cả 50 màn bằng engine thật đã qua ở hai chế độ giao tức thời và callback OUT trễ, bao gồm kiểm tra ngân sách timer. Các kiểm tra engine và UI clock tự động đã qua.

| Mức | Số lượt holdout | Thắng | Bế tắc thật | Chưa kết luận | Tỷ lệ bế tắc thật | Đỉnh hàng chờ tham chiếu | Timer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | 6.144 | 4.461 | 1.377 | 306 | 22,412% | 2/5 slot | 350–470 giây |
| Hard | 768 | 170 | 559 | 39 | 72,786% | 2–3/5 slot | 425–535 giây |
| Super Hard | 768 | 79 | 667 | 22 | 86,849% | 3–4/5 slot | 475–505 giây |

Tỷ lệ chưa kết luận tương ứng là 4,980%, 5,078% và 2,865%; các lượt này không bị tính thành bế tắc. Các số liệu bot trong bảng **không bao gồm timer** và **không phải tỷ lệ thua đo trên người chơi thật**. Đỉnh hàng chờ mô tả đường tham chiếu đã kiểm chứng; đường chơi khác vẫn có thể quản lý hàng chờ khác đi hoặc dẫn tới thua.

Kiểm tra hình ảnh trực tiếp chưa hoàn tất vì công cụ điều khiển trình duyệt không thiết lập được URL game. Kết quả tự động ở trên không được dùng để khẳng định đã kiểm tra hình ảnh hoặc bố cục trực tiếp trên trình duyệt.
