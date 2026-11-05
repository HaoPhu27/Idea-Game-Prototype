# Factory Sort

Prototype chính dùng bố cục **băng chuyền ở trên, thùng hàng ở dưới**.

- [Chơi ngay](https://haophu27.github.io/Idea-Game-Prototype/Factory%20Sort/ab_test/dist/FactorySort_ABTest_Inverted.html)
- Mã nguồn và tài nguyên: [ab_test/](ab_test/README.md). Giữ tên thư mục để các liên kết hiện có tiếp tục hoạt động.
- Tài liệu thiết kế và kỹ thuật: [docs/](docs/).

Chạy từ thư mục `Factory Sort`:

```sh
npm start
npm test
npm run build
```

Server dev: http://localhost:8080/ (hỗ trợ điện thoại cùng Wi-Fi).
Build tạo `ab_test/dist/FactorySort_ABTest_Inverted.html`, chứa sẵn JS, CSS, ảnh và font để chơi offline.
Các công cụ trong `tools/` sử dụng mã nguồn của prototype chính.

Kiểm tra riêng bốn booster:

```sh
npm run test:boosters
# Hoặc chạy riêng:
node tools/booster-test.js
node tools/booster-ui-test.js
```

Hợp đồng Freeze Time, Shuffle, Extra Tray và Remove Tray được ghi ở mục 14 của GDD. Shuffle/Remove chỉ commit trạng thái khi bảo toàn matching và có chứng nhận giải được; không chứng minh kịp thì giữ nguyên bàn.

`npm test` chạy selftest sinh màn, sau đó kiểm tra booster core và UI. Kiểm tra UI bao gồm chế độ chọn/hủy Remove Tray, khóa tương tác và dung lượng queue động.
