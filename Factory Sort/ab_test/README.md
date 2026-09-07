# 🧪 Bản Thử Nghiệm A/B (Inverted Layout)

Thư mục này chứa toàn bộ mã nguồn và bản build của **Bản Thử Nghiệm A/B (Ý tưởng Jun iKame)**:
- **Bố cục (Layout):** Băng chuyền ở TRÊN, Thùng hàng ở DƯỚI.
- **Tính năng riêng:** Tự động co gọn chiều cao cột (`effectiveRows`) để đẩy thùng hàng lên sát ngay dưới băng chuyền với những màn chơi không có thùng ẩn.
- **Mã nguồn:** Nằm độc lập trong `ab_test/src/`, thoải mái chỉnh sửa mà không bao giờ ảnh hưởng tới `delivery/`.

## 🛠 Cách Thao Tác
- **Chạy thử nghiệm dev:** Mở `ab_test/index.html` hoặc chạy `npm start` rồi truy cập `/ab_test`.
- **Đóng gói file Standalone:** 
  ```bash
  npm run build:abtest
  ```
  File xuất xưởng sẽ được tạo tại: `ab_test/dist/FactorySort_ABTest_Inverted.html`
