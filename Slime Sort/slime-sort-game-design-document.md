# GAME DESIGN DOCUMENT: SLIME SORT (Working Title)

## 1. TỔNG QUAN GAME

**Thể loại:** Puzzle sorting, lấy cảm hứng từ Water Sort / Ball Sort / Magic Sort, kết hợp thêm lớp cơ chế Conveyor + Tray độc đáo.

**Nền tảng dự kiến:** Mobile (iOS/Android), thiết kế theo hướng tap-based, không cần drag.

**Core loop:**
1. Người chơi sắp xếp/di chuyển slime giữa các Tube để gộp (merge) các slime cùng màu thành cụm lớn hơn.
2. Đổ cụm slime cùng màu ra Conveyor.
3. Slime trên Conveyor tự động di chuyển và tìm Tray đúng màu để "nộp" vào.
4. Khi Tray đầy, nó tự harvest (thu hoạch), sinh ra Tray mới.
5. Lặp lại cho đến khi dọn sạch toàn bộ Tube và không còn Tray nào xuất hiện nữa → Thắng level.

**Mục tiêu chiến lược của người chơi:** Quản lý thứ tự đổ slime giữa các Tube sao cho không "chôn" màu cần dùng, đồng thời canh thời điểm đổ ra Conveyor để không làm đầy Conveyor (gây thua).

---

## 2. THUẬT NGỮ (GLOSSARY)

| Thuật ngữ | Định nghĩa |
|---|---|
| **Tube** | Ống chứa slime, xếp chồng theo chiều dọc. |
| **Slime** | Đơn vị màu sắc cơ bản, đơn vị đo lường dung lượng (capacity) của Tube và Conveyor. |
| **Merge / Cụm slime** | Nhiều slime cùng màu, liền kề nhau (không bị ngăn cách bởi màu khác) tự động dính liền thành 1 khối dài hơn. |
| **Conveyor** | Băng chuyền tự động chạy, nơi slime di chuyển tìm Tray đúng màu. |
| **Tray** | Khay nhận slime theo màu cố định, dùng để "nộp" và ghi điểm. |
| **Tray slot** | Ô trống bên trong 1 Tray (mỗi Tray có 3 tray slot). |
| **Able tray** | Tray đã mở sẵn, hoạt động ngay từ đầu level. |
| **Unable tray** | Tray bị khóa, cần người chơi tap để kích hoạt (tương lai gắn booster/xem quảng cáo). |
| **Harvest** | Hành động Tray tự động biến mất + tính điểm khi đã đầy 3 tray slot cùng màu. |

---

## 3. THÀNH PHẦN CHÍNH

### 3.1. Tube
- Sức chứa: **5–10 slime**, tùy độ khó của level (do level design quy định).
- Có thể chứa **nhiều màu xen kẽ tự do** trong cùng 1 tube — **không bắt buộc đơn sắc** như game Water Sort truyền thống.
- Slime cùng màu **liền kề nhau theo chiều dọc** (không bị màu khác chen giữa) sẽ **tự động merge** thành 1 cụm liền, coi như 1 khối duy nhất khi thao tác.

### 3.2. Conveyor
- Là 1 băng chuyền chạy tự động, liên tục, theo hướng **trái → phải**, theo đường đi dạng **oval nằm ngang** (giống hình số "0" nằm ngang) — slime chạy vòng lặp (loop) liên tục trên đường này cho đến khi được xử lý.
- **Sức chứa tối đa: 7 đơn vị slime**, tính theo **đơn vị (unit)**, không tính theo vật thể/cụm. Ví dụ: 1 cụm đã merge gồm 3 slime khi đổ xuống Conveyor sẽ chiếm **3/7** chỗ.
- Slime cứ loop vòng quanh Conveyor cho đến khi gặp đúng Tray màu tương ứng.

### 3.3. Tray & Tray Slot
- Tối đa **3 Tray** hiển thị cùng lúc trên màn hình:
  - **2 Able Tray**: mở sẵn, hoạt động ngay từ đầu level.
  - **1 Unable Tray**: bị khóa mặc định, người chơi phải **tap vào để kích hoạt**. (Ghi chú monetization: trong tương lai việc active tray này sẽ gắn với hệ thống booster hoặc xem quảng cáo để mở khóa; ở giai đoạn prototype có thể để tap là active free.)
- Mỗi Tray có **3 Tray Slot** (ô trống), mỗi slot chứa đúng **1 đơn vị slime**.
- **Nhiều Tray có thể cùng màu tại cùng 1 thời điểm** — level design có thể chủ động sắp xếp trùng màu để tăng tốc độ xử lý màu đó khi cần.
- Màu sắc của Tray (kể cả Tray mới sinh ra sau khi harvest) được xác định **theo kịch bản của level design**, không phải random hoàn toàn — cho phép nhà thiết kế kiểm soát độ khó và nhịp độ của màn chơi.

---

## 4. CƠ CHẾ TƯƠNG TÁC CỦA NGƯỜI CHƠI

### 4.1. Chọn Tube (Select)
- Người chơi **tap vào 1 Tube** → Tube đó chuyển sang trạng thái **selected** (hiển thị bằng animation "nhấc lên").
- Nếu người chơi **tap lại chính Tube đang selected** → **hủy chọn**, Tube trở về trạng thái ban đầu (đặt xuống).

### 4.2. Tube → Tube (chuyển slime giữa 2 tube)
- Sau khi 1 Tube đang selected, người chơi **tap vào 1 Tube khác còn chỗ trống** → thực hiện chuyển slime.
- Chỉ chuyển **cụm slime cùng màu, liên tục từ trên cùng của Tube nguồn xuống** (không tính các slime bị ngăn cách bởi màu khác ở dưới).
- Tube đích **không bắt buộc** phải trống hoặc có màu trên cùng trùng với cụm đang chuyển — có thể đổ vào bất kỳ Tube nào còn đủ chỗ trống, bất kể màu gì đang ở trên cùng. Slime mới sẽ **xếp chồng lên trên**; nếu trùng màu với slime trên cùng của Tube đích thì **tự động merge**, nếu khác màu thì chỉ xếp chồng (không merge).
- **Điều kiện hành động không hợp lệ (invalid action):** nếu số lượng slime trong cụm đang chuyển **lớn hơn** số chỗ trống còn lại của Tube đích → hành động bị từ chối.
  - **Phản hồi khi invalid:** Tube rung nhẹ (shake) + hiệu ứng báo lỗi màu đỏ, Tube nguồn **vẫn giữ trạng thái selected** để người chơi thử lại với lựa chọn khác.

### 4.3. Tube → Conveyor (đổ slime ra băng chuyền)
- Sau khi 1 Tube đang selected, người chơi **tap trực tiếp vào vùng Conveyor** → đổ cụm slime cùng màu, liên tục từ trên cùng Tube xuống Conveyor (áp dụng cùng quy tắc nhận diện cụm như mục 4.2).
- Cụm slime sau khi đổ xuống sẽ gia nhập vòng lặp của Conveyor và di chuyển tự động.

---

## 5. LUỒNG XỬ LÝ SLIME TRÊN CONVEYOR

1. Slime (đơn lẻ hoặc cụm đã merge) di chuyển liên tục theo chiều Conveyor.
2. Khi slime đi ngang qua 1 Tray:
   - **Nếu màu Tray khớp với màu slime:**
     - Cụm slime được **tách ra** thành từng đơn vị.
     - Lần lượt fill từng đơn vị vào các **tray slot còn trống** của Tray đó.
     - Nếu cụm slime có số lượng **lớn hơn** số tray slot còn trống (ví dụ cụm 4 nhưng Tray chỉ còn 3 chỗ trống) → phần **dư ra** sẽ **tiếp tục di chuyển/loop trên Conveyor**, tìm Tray khác cùng màu (có thể là Tray hiện có khác, hoặc chờ Tray mới cùng màu xuất hiện sau này).
   - **Nếu màu Tray không khớp:** slime **tự động đi qua**, tiếp tục di chuyển trên Conveyor, không dừng lại.
3. Khi 1 Tray được fill đầy **3/3 tray slot cùng màu** → Tray đó **tự động Harvest**: biến mất khỏi màn hình, tính điểm, và một **Tray mới** (màu do level design quy định) sẽ xuất hiện thay thế vị trí đó.

---

## 6. ĐIỀU KIỆN THẮNG / THUA

| | Điều kiện |
|---|---|
| **Thắng** | Toàn bộ Tube đã được dọn sạch (không còn slime nào trong Tube) **và** không còn Tray nào tiếp tục xuất hiện (đã hết kịch bản Tray của level). |
| **Thua** | Conveyor đã chứa đầy **7 đơn vị slime** và **không có slime nào** trong số đó có thể fill được vào bất kỳ Tray nào đang hoạt động (bế tắc/deadlock). |

---

## 7. YẾU TỐ MONETIZATION (định hướng tương lai)

- **Unable Tray** là điểm chạm monetization chính: ban đầu bị khóa, cần tap để kích hoạt.
- Trong bản đầy đủ (không phải prototype), việc kích hoạt Unable Tray dự kiến sẽ gắn với:
  - Xem quảng cáo (rewarded video), hoặc
  - Sử dụng booster/vật phẩm trong game.
- Ở giai đoạn prototype, có thể tạm thời cho phép tap để active miễn phí nhằm test luồng gameplay trước.

---

## 8. CÁC ĐIỂM CẦN LEVEL DESIGN QUYẾT ĐỊNH (chưa cố định, tùy biến theo từng màn)

- Số lượng Tube trên màn hình mỗi level.
- Sức chứa từng Tube (5–10 slime).
- Số lượng màu sắc slime sử dụng trong level.
- Kịch bản màu sắc của các Tray (bao gồm cả Tray xuất hiện sau khi harvest) — thứ tự, có trùng màu giữa 2 Tray hay không.
- Bố cục ban đầu của slime trong từng Tube.

---

## 9. CÁC ĐIỂM CHƯA ĐƯỢC XÁC NHẬN / CẦN BÀN THÊM (Open Questions)

- Hệ thống điểm số / currency cụ thể khi harvest Tray (điểm cố định hay theo combo/độ dài cụm).
- Có giới hạn số lượt di chuyển (move limit) hoặc thời gian (timer) cho mỗi level không.
- Vị trí slime nhập vào Conveyor (ngay tại vị trí Tube đổ xuống, hay luôn tại 1 điểm cố định).
- Tổng số màu sắc tối đa được thiết kế xuyên suốt toàn bộ game.
- Cơ chế cụ thể của hệ thống booster/quảng cáo cho Unable Tray (chưa thiết kế chi tiết, chỉ mới là định hướng).

---

*Tài liệu này được tổng hợp từ quá trình thảo luận và làm rõ ý tưởng theo hình thức hỏi-đáp từng bước, nhằm đảm bảo mọi cơ chế đều được xác nhận rõ ràng trước khi bước vào giai đoạn phát triển prototype.*
