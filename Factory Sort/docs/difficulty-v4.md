# Định nghĩa độ khó Factory Sort v4

## Mục tiêu

Normal cho phép thử và sửa sai; Hard đòi hỏi chọn thứ tự đóng gói và quản lý hàng chờ; Super Hard đòi hỏi cùng lúc lập kế hoạch, giữ chỗ và quyết định nhanh. Màn khó phải có đường thắng được kiểm chứng, đồng thời có đường đi sai dẫn tới thua thật. Không dùng lỗi animation, đồ vô hình hoặc khóa cả bàn để tạo khó.

Các mức và con số dưới đây là lựa chọn thiết kế của dự án. Chưa có số liệu thử nghiệm người chơi để xem chúng là tỷ lệ thắng/thua thực tế.

## Những yếu tố thực sự tạo khó

| Yếu tố | Đại lượng kiểm tra | Tác dụng và giới hạn |
| --- | --- | --- |
| Chỗ xoay xở | `visibleFreeSlots`, số box còn chỗ trong vùng 3×4 | Ít ô trống nhìn thấy làm một lần đặt sai khó sửa hơn. `3 × carrierBoxes` là tổng ô trống toàn màn, không phải toàn bộ đều dùng được ngay. |
| Tài nguyên bị che | `hiddenBoxes`, độ sâu từng cột, `openingSets` | Phải dọn/giao box để lộ vật phẩm còn thiếu. Chỉ biết tổng số box bị che không mô tả đủ quan hệ phụ thuộc. |
| Phân tán bộ ba | `ratio21`, `avgSpread`, số nước lời giải tham chiếu | Bộ 2+1 thường dễ nhận ra hơn 1+1+1. Số thao tác tăng là một phần độ dài; chưa đủ kết luận độ khó. |
| Nhiều loại vật phẩm | Số item khác nhau và box trộn | Tăng lượng thông tin cần đọc. Cùng màu/category không có nghĩa là tray nhận; emoji phải khớp chính xác. |
| Thứ tự đơn và hàng chờ | Số tray hoạt động ở đầu danh sách, mức chiếm hàng chờ 5 slot | Đóng gói nhầm thứ tự có thể chiếm hết chỗ trước khi đơn đúng xuất hiện. Tray đang chở hàng ra OUT vẫn là tiến triển, chưa được kết luận thua. |
| Tốc độ quyết định | Ngân sách giây trên mỗi nước tham chiếu | Tạo điều kiện thua do hết giờ, độc lập với bế tắc logic. Timer không được phạt đoạn cuối chỉ còn animation tự động. |
| Độ dài màn | Số box, số bộ và số nước tham chiếu | Chủ yếu quyết định thời lượng. Tăng số box đơn thuần không chứng minh màn khó hơn. |

`openingSets` là chỉ số khởi đầu, không phải số lựa chọn an toàn tại mọi thời điểm. `difficulty.score` là điểm cấu trúc để mô tả, không phải xác suất người chơi thua. Lời giải tham chiếu chứng minh có đường thắng; với loại item lặp nhiều lần, không tự nhận đó là tối ưu toàn cục nếu chưa có bằng chứng solver.

## Nhịp áp lực theo tham khảo Fish Sort

Phần áp dụng từ Fish Sort là author các đoạn siết/nhả áp lực hàng chờ. Thứ tự đơn được sinh theo seed trong các khối lookahead có giới hạn: Normal chủ yếu trôi chảy, Hard có sóng áp lực, Super Hard có hai đỉnh và đoạn hồi phục. Khối vẫn phải qua replay lời giải; không đổi đơn bí mật theo chuỗi thua hoặc thao tác đang chơi.

Áp lực được báo bằng trace hàng chờ khi phát lại, tách khỏi profile mong muốn. Khi không đạt schedule đề xuất và phải quay về thứ tự an toàn, metadata ghi fallback thay vì coi mục tiêu đã đạt. Chi tiết bằng chứng và giới hạn đối chiếu nằm ở [fish-sort-reference-review.md](fish-sort-reference-review.md).

## Ba mức độ khó

Vùng chơi vẫn là 3 cột × 4 box nhìn thấy; hàng chờ vẫn có 5 slot. Giữ vị trí Hard ở màn đuôi 5 và Super Hard ở màn đuôi 9 trong dải 21–50.

| Mức | Box toàn màn | Carrier E | Tray hoạt động | Giây/nước tham chiếu | Mục tiêu bot bế tắc thật |
| --- | ---: | ---: | ---: | ---: | ---: |
| Normal | 34–46 | 2 | 4 | 6,5 → 6,0 | 10–35% |
| Hard | 52–68 | 2 | 3 | 4,2 → 3,8 | 50–80% |
| Super Hard | 72–80 | 3 | 3 | 3,0 → 2,7 | 82–96% |

Super Hard có E=3 để phép xây ngược không phải nới lỏng mạnh hoặc thất bại liên tục. Phải đọc `visibleFreeSlots` thực tế trước khi kết luận nó rộng hơn Hard. Không giảm xuống 2 tray chỉ để ép thua gần như mọi lần chơi; kết hợp độ sâu, seed, độ phân tán và thời gian để tạo thử thách còn có thể vượt qua.

Màn 1–10 không có hạn giờ để học luật. Màn 11–20 dùng ngân sách nhẹ 10 → 8 giây/nước trước khi bước vào ba mức chính.

## Ngân sách timer

Với `M` nước lời giải tham chiếu, `S` bộ ba cần giao, `A` tray hoạt động và `p` giây/nước của tier:

`T = làm tròn lên bội 5 giây (M × p + 20 + S × 7 / A)`

- `M × p`: ngân sách thao tác và suy nghĩ.
- `20`: thời gian đọc và ổn định ban đầu.
- `S × 7 / A`: khoản dự phòng vận chuyển theo một vòng conveyor khoảng 7 giây và số tray chạy song song. Đây là mô hình ngân sách, không phải thời gian vận chuyển chính xác của từng đường chơi.

Timer bắt đầu ở tương tác lấy vật phẩm hợp lệ đầu tiên; không đếm lúc còn đọc màn ban đầu. Game dùng thời gian thực đơn điệu, không đếm số frame. Ẩn tab, mở trợ giúp/chọn màn hoặc loading thì tạm dừng; khi trở lại không truy thu khoảng thời gian tạm dừng. Khi chỉ còn box đã gói và tự động giao/ra OUT, đồng hồ đóng băng. Hết giờ chỉ xử thua nếu game vẫn đang chơi và còn công việc cần người chơi; retry/màn mới đặt lại hoàn toàn.

Timer dùng riêng `rules.timeToPlay`; không quảng cáo giới hạn nước đi chưa được engine thực thi. Thắng/thua do hết giờ dùng lý do riêng, không hiện thông báo “hết chỗ” cho mọi trường hợp.

## Tuyển và kiểm chứng bộ màn

1. Sinh ngược trên đúng bố cục cột, chỉ cho lời giải tham chiếu chạm box trong tầm với.
2. Phát lại dưới luật box–tray chính xác theo emoji, hàng chờ 5 slot và tiền tố tray đang hoạt động.
3. Tuyển seed bằng bot có quan sát tray và hàng chờ; dùng RNG độc lập cho sàng lọc, xác nhận và holdout.
4. Ghi riêng **won**, **dead**, **loop**. `dead / trials` là tỷ lệ bế tắc thật; `loop` chỉ là chưa kết luận do bot hết ngân sách bước, không được tự đổi thành một ván thua chắc chắn.
5. Ghi rõ seed có đạt dải mục tiêu không. Nếu không có ứng viên phù hợp, công cụ phải báo sai lệch; không âm thầm đổi nhãn Hard thành màn dễ.
6. Phát lại cả 50 màn qua `GameEngine` thật và kiểm tra ngân sách thời gian của đường tham chiếu. Báo cáo bot không thay cho thử nghiệm người chơi thật; timer cần hiệu chỉnh tiếp bằng thời gian và số lần retry thực tế.

7. Phát lại thêm chế độ callback UI: box đã gói vào hàng chờ, tray nhận hàng rồi hoàn tất OUT ở các thời điểm riêng. Đo mức hàng chờ thật và kiểm tra không có thua giả giữa các callback.

Khi giới hạn `maxOpeningSets` phải nới lỏng để sinh được màn, ghi `generationQuality` thay vì giả vờ đã đạt giới hạn gốc. Cùng seed phải sinh cùng màn để tái hiện lỗi; không điều chỉnh ngầm theo kết quả người chơi trong lúc chơi.

## Kết quả bộ 50 màn sau hiệu chỉnh

Agent chính đã thực thi sàng lọc tối đa 64 ứng viên/màn với 24 lượt bot, hai luồng xác nhận độc lập 128/96 lượt và 256 lượt holdout/màn. Tổng holdout là 12.800 lượt. Các seed RNG dùng cho bốn chặng là 63023/74017/85133/96209; candidate seed offset 100. Holdout không tham gia chọn seed.

Cả 50 màn đạt dải mục tiêu trên holdout và điều kiện xác nhận; không có board trùng lặp hoặc lịch đơn phải fallback. Phát lại lời giải tham chiếu của cả 50 màn bằng engine thật đã qua ở cả chế độ giao tức thời và callback OUT trễ, bao gồm ngân sách timer.

| Mức | Thắng / bế tắc / chưa kết luận | Bế tắc thật | Chưa kết luận | Đỉnh hàng chờ tham chiếu | Hạn giờ |
| --- | ---: | ---: | ---: | ---: | ---: |
| Normal | 4.461 / 1.377 / 306 trên 6.144 lượt | 22,412% | 4,980% | 2/5 slot | 350–470 giây |
| Hard | 170 / 559 / 39 trên 768 lượt | 72,786% | 5,078% | 2–3/5 slot | 425–535 giây |
| Super Hard | 79 / 667 / 22 trên 768 lượt | 86,849% | 2,865% | 3–4/5 slot | 475–505 giây |

Các kết quả bot này **không tính timer**, không chuyển lượt chưa kết luận thành thua và không đại diện cho tỷ lệ thua người chơi thật. Hạn giờ trong bảng là ngân sách được engine áp dụng và được kiểm tra riêng. Báo cáo từng màn cùng trace áp lực nằm trong `tools/levels50.json`.

Kiểm tra engine và UI clock tự động đã qua. Chưa hoàn tất kiểm tra hình ảnh trực tiếp: công cụ điều khiển trình duyệt không thiết lập được URL game, nên chưa khẳng định bố cục đã được kiểm tra trực tiếp trên trình duyệt. Xem thêm [đối chiếu Fish Sort](fish-sort-reference-review.md).

## Tài liệu tham khảo

- [Statistical Modelling of Level Difficulty in Puzzle Games](https://arxiv.org/abs/2107.03305): đánh giá độ khó puzzle cần xem cả phân bố hành động, không chỉ tỷ lệ hoàn thành.
- [Xbox Accessibility Guideline 108: Game difficulty options](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/108): độ khó có nhiều thành phần và phụ thuộc kỹ năng người chơi; thử thách logic và áp lực thời gian là các trục khác nhau.

Các khoảng mục tiêu và công thức timer trong tài liệu này do dự án lựa chọn; hai nguồn trên không xác nhận những con số cụ thể này.
