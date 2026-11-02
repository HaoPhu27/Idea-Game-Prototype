# Quy tắc làm việc

- Sau mỗi cập nhật hoàn tất, agent chính chạy build và kiểm tra phù hợp, rồi commit và push lên GitHub để cập nhật GitHub Pages.
- ChatGPT/agent chính trực tiếp kiểm tra, chẩn đoán, lập kế hoạch, điều phối, tích hợp và xác minh kết quả trước khi triển khai.
- Giao phần viết/sửa code và tạo ảnh cho các workers; workers chỉ thực hiện coding hoặc imagegen, không đảm nhiệm kiểm tra, lập kế hoạch hay triển khai.
- Chia các phần coding/imagegen độc lập cho workers cùng thực hiện; agent chính không ôm phần thực thi này.
- Chỉ commit các thay đổi thuộc nhiệm vụ, giữ nguyên thay đổi không liên quan.
