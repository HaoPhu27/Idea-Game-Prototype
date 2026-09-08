# 🧪 Bản Thử Nghiệm A/B (Inverted Layout)

Thư mục này chứa toàn bộ mã nguồn và bản build của **Bản Thử Nghiệm A/B (Ý tưởng Jun iKame)**:
- **Bố cục (Layout):** Băng chuyền ở TRÊN, Thùng hàng ở DƯỚI.
- **Tính năng riêng:** Băng chuyền cột thùng hàng luôn kéo dài xuống dưới để chứa trọn vẹn các hàng thùng (`visibleRows`) và bảo toàn logic cấp thùng ẩn từ trên xuống.
- **Mã nguồn:** Nằm độc lập trong `ab_test/src/`, thoải mái chỉnh sửa mà không bao giờ ảnh hưởng tới `delivery/`.

## 🛠 Cách Thao Tác
- **Chạy thử nghiệm dev:** Mở `ab_test/index.html` hoặc chạy `npm start` rồi truy cập `/ab_test`.
- **Đóng gói file Standalone:** 
  ```bash
  npm run build:abtest
  ```
  File xuất xưởng sẽ được tạo tại: `ab_test/dist/FactorySort_ABTest_Inverted.html`


---

## 📐 Tài liệu nâng cấp UI

Bộ hướng dẫn thực thi cải thiện giao diện cho **chính bản A/B này** nằm ở
[`docs/ui-upgrade/`](../docs/ui-upgrade/README.md) — 7 phase, mỗi phase là một PR độc lập,
**mức độ đổi gameplay 0%**, kèm số đo thực tế và checklist nghiệm thu.

Bắt đầu từ [`docs/ui-upgrade/README.md`](../docs/ui-upgrade/README.md).
Phase 0 sửa 4 lỗi đang chặn người chơi (ở máy 360px có 2 nút HUD nằm ngoài màn hình) —
nên làm và merge trước tiên.
