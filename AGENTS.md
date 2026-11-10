# Quy tắc làm việc

- Sau mỗi cập nhật hoàn tất, agent chính chạy build và kiểm tra phù hợp, rồi commit và push lên GitHub để cập nhật GitHub Pages.
- ChatGPT/agent chính trực tiếp kiểm tra, chẩn đoán, lập kế hoạch, điều phối, tích hợp và xác minh kết quả trước khi triển khai.
- Giao phần viết/sửa code và tạo ảnh cho các workers; workers chỉ thực hiện coding hoặc imagegen, không đảm nhiệm kiểm tra, lập kế hoạch hay triển khai.
- Chia các phần coding/imagegen độc lập cho workers cùng thực hiện; agent chính không ôm phần thực thi này.
- Chỉ commit các thay đổi thuộc nhiệm vụ, giữ nguyên thay đổi không liên quan.

## Quy tắc API áp dụng cho mọi dự án

- Chỉ được phép gọi model DeepSeek qua API trong tất cả dự án và mọi worker (bao gồm River, Lite, Lite2 và worker tạo thêm).
- Cấm gọi Kimi/Moonshot, Claude/Opus, Gemini, GPT hoặc bất kỳ model không thuộc DeepSeek qua API. Không có ngoại lệ hoặc tự động fallback sang nhà cung cấp/model khác.
- Khi DeepSeek không khả dụng, dừng yêu cầu API đó và báo người dùng; không tự đổi model.
- Kiểm tra model thực tế trước khi gửi yêu cầu; tên worker hoặc API key không quyết định model được phép dùng.
- Quy tắc này được lưu lâu dài và chỉ được sửa hoặc bỏ khi chính người dùng yêu cầu thay đổi rõ ràng.
