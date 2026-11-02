# Quy tắc làm việc

- Sau mỗi cập nhật hoàn tất, agent chính chạy build và kiểm tra phù hợp, rồi commit và push lên GitHub để cập nhật GitHub Pages.
- ChatGPT/agent chính trực tiếp kiểm tra, chẩn đoán, lập kế hoạch, điều phối, tích hợp và xác minh kết quả trước khi triển khai.
- Giao phần viết/sửa code và tạo ảnh cho các workers; workers chỉ thực hiện coding hoặc imagegen, không đảm nhiệm kiểm tra, lập kế hoạch hay triển khai.
- Chia các phần coding/imagegen độc lập cho workers cùng thực hiện; agent chính không ôm phần thực thi này.
- Chỉ commit các thay đổi thuộc nhiệm vụ, giữ nguyên thay đổi không liên quan.
- Với công việc hiện tại, dừng toàn bộ công việc và workers khi usage phiên 5 giờ đã dùng đạt 60% (usedPercent >= 60, tức còn 40%); quy tắc này thay ngưỡng còn 20% trước đó. Agent chính đọc get_usage_limits giữa các chặng để canh ngưỡng dừng.
