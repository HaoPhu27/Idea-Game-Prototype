# 📦 Bản Tiêu Chuẩn (Standard Delivery)

Thư mục này chứa toàn bộ mã nguồn và bản build của **Bản Tiêu Chuẩn (Standard Delivery)**:
- **Bố cục (Layout):** Thùng hàng ở TRÊN, Băng chuyền ở DƯỚI (theo đúng GDD gốc).
- **Mã nguồn:** Nằm độc lập trong `delivery/src/`, không bị ảnh hưởng khi chỉnh sửa `ab_test/`.

## 🛠 Cách Thao Tác
- **Chạy thử nghiệm dev:** Mở `delivery/index.html` hoặc chạy `npm start` rồi truy cập `/delivery`.
- **Đóng gói file Standalone:** 
  ```bash
  npm run build:delivery
  ```
  File xuất xưởng sẽ được tạo tại: `delivery/dist/FactorySort_Standard_Delivery.html`
