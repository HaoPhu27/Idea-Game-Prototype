# 🏭 Factory Sort — Game Prototype

> 💡 Có thể mở mọi game trong kho từ menu chung tại [`../index.html`](../index.html).

Dự án nguyên mẫu game **Factory Sort** (Goods Sort với cơ chế Khay & Băng Chuyền). Dự án bao gồm bộ sinh màn chơi luôn giải được (**Solvable Level Generator**), thuật toán giải (**Solver**), và giao diện HTML5 Canvas/DOM tối ưu cho thiết bị di động.

---

## 🚀 MỞ GAME NGAY (DÀNH CHO NGƯỜI CHƠI & TESTER)

Các bản game dưới đây là **file HTML độc lập 100% (Standalone)**: không cần cài đặt Node.js, không cần internet, chỉ cần nhấp đúp để chơi ngay trên máy tính hoặc điện thoại:

| Phiên bản | Đường dẫn tệp | Mô tả |
| :--- | :--- | :--- |
| **🎮 Bản Chuẩn (Delivery)** | [`delivery/dist/FactorySort_Standard_Delivery.html`](delivery/dist/FactorySort_Standard_Delivery.html) | Bản chính thức giao cho người chơi: Thùng hàng ở trên, Băng chuyền ở dưới. |
| **🧪 Bản A/B Test Đảo Layout** | [`ab_test/dist/FactorySort_ABTest_Inverted.html`](ab_test/dist/FactorySort_ABTest_Inverted.html) | Bản thử nghiệm UX: Đẩy Băng chuyền lên trên, Thùng hàng xuống dưới để dễ với ngón tay cái khi chơi 1 tay (theo ý Jun iKame). |

---

## 📂 BẢN ĐỒ CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Factory Sort/
│
├── 📁 delivery/                                 # BẢN CHUẨN (Standard) — bản đang dùng
│   ├── index.html                               # Trang dev giao diện chuẩn (cần server)
│   ├── src/                                     # Mã nguồn chính (core/, generator/, ui/, data/)
│   ├── style.css                                # Định kiểu CSS của bản chuẩn
│   └── 📁 dist/                                 # Bản thành phẩm standalone
│       ├── FactorySort_Standard_Delivery.html   # Bản game chuẩn giao cho người chơi / QA
│       └── bundle.js                            # Bundle mã nguồn JS đóng gói
│
├── 📁 ab_test/                                  # BẢN A/B TEST (Inverted) — bản đang dùng
│   ├── index.html                               # Trang dev layout đảo ngược (cần server)
│   ├── src/                                     # Mã nguồn riêng của bản A/B
│   ├── style.css                                # Định kiểu CSS của bản A/B
│   └── 📁 dist/                                 # Bản thành phẩm standalone
│       ├── FactorySort_ABTest_Inverted.html     # Bản game A/B test layout đảo ngược
│       └── bundle.js                            # Bundle mã nguồn JS đóng gói
│
├── 📁 src/                                      # ⚠️ BẢN CŨ — không dùng nữa (xem ghi chú dưới)
│   ├── core/                                    # Engine logic (GameEngine, Box, Tray, Conveyor)
│   ├── generator/                               # Thuật toán sinh màn solvable (SolvableLevelGenerator, Solver)
│   ├── ui/                                      # Giao diện & Renderers (UIManager, TutorialManager, TrayRenderer...)
│   └── data/                                    # Dữ liệu vật phẩm & nhóm (ItemCatalog)
│
├── 📁 tools/                                    # Bộ công cụ phục vụ phát triển & kiểm thử
│   ├── build.mjs                                # Script đóng gói source ra dist/
│   ├── server.mjs                               # Local dev server hỗ trợ LAN Mobile
│   ├── selftest.js                              # Bộ 8 bài test logic và tỷ lệ sinh màn
│   ├── curate50.mjs & levels50.json             # Tuyển tập 50 màn chơi chất lượng cao
│   ├── demo.js                                  # Script chạy mô phỏng game trên console
│   ├── verify.html & verify_build.html          # Trang test trực quan cho logic engine
│   └── 📁 data/                                 # Dữ liệu phân tích chuyên sâu (extracted_level_100.json...)
│
├── 📁 docs/                                     # Toàn bộ tài liệu thiết kế & kỹ thuật
│   ├── GDD_GoodsSort_TrayConveyor_v2.md         # Game Design Document chính thức
│   ├── 02_THUAT_TOAN_SOLVABLE.md                # Tài liệu thuật toán sinh màn solvable
│   ├── mobile-optimization/                     # Tài liệu các pha tối ưu hóa di động
│   └── 50_level_design_report.md                # Báo cáo thiết kế 50 level
│
├── 📁 assets/                                   # Tài nguyên đồ họa, âm thanh, font chữ nhúng
├── 📁 archive/                                  # Lưu trữ các bản zip và file cũ
│
├── style.css                                    # ⚠️ BẢN CŨ — không dùng nữa
└── package.json                                 # Cấu hình scripts & npm package
```

> ⚠️ **Lưu ý:** `src/` và `style.css` ở gốc `Factory Sort/` là **bản cũ**, không còn được dùng.
> Bản đang dùng nằm trong [`delivery/`](delivery/) và [`ab_test/`](ab_test/) — mỗi thư mục có
> `index.html`, `src/`, `style.css` và `dist/` riêng.

---

## 💻 DÀNH CHO LẬP TRÌNH VIÊN (DEVELOPMENT)

### 1. Khởi động Dev Server (xem trực tiếp trên PC hoặc Điện thoại):
```bash
npm start
# Hoặc: node tools/server.mjs
```
Server sẽ cung cấp đường dẫn Localhost và IP LAN để bạn mở trực tiếp trên điện thoại kết nối cùng Wi-Fi.

### 2. Chạy bộ Unit Tests:
```bash
npm test
# Hoặc: node tools/selftest.js
```
Kiểm tra tính bất biến, thuật toán sinh màn chơi và độ phân giải của tất cả 50 màn.

### 3. Đóng gói lại các bản Delivery:
```bash
npm run build
# Hoặc: node tools/build.mjs
```
Script sẽ tự động gộp JS/CSS/Assets thành các tệp Standalone trong thư mục `dist/`.
