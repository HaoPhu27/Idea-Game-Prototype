# 🎮 Kho Game Prototype

Kho chứa các bản **prototype game HTML5** (tự chứa, không cần cài đặt). Tất cả game được gom vào một trang menu chung ở [`index.html`](index.html).

---

## 🕹️ Danh sách game

| Game | Mô tả | File chơi |
| :--- | :--- | :--- |
| **Factory Sort** | Xếp hàng hóa bằng khay và băng chuyền. | `Factory Sort/delivery/dist/FactorySort_Standard_Delivery.html` |
| **Factory Sort – Đảo layout** | Băng chuyền ở trên, thùng hàng ở dưới cho chơi một tay. | `Factory Sort/ab_test/dist/FactorySort_ABTest_Inverted.html` |
| **Slime Sort** | Phân loại slime theo màu qua ống, khay và băng chuyền. | `Slime Sort/SlimeSort_Standalone.html` |
| **World Restaurant** | Puzzle nhà hàng isometric với 20 màn chơi. | `WorldRestaurant/dist/WorldRestaurant.html` |

Danh sách trên đọc từ [`launcher/games.js`](launcher/games.js) — đó là nguồn dữ liệu duy nhất của menu.

---

## 🚀 Mở menu

### Cách 1 — Nháy đúp `index.html` (không cần cài gì)

Mở trực tiếp file `index.html` bằng trình duyệt. Chơi được ngay, nhưng **nút "Bản dev" sẽ bị ẩn** (bản dev cần server vì dùng đường dẫn tương đối).

### Cách 2 — Chạy server (khuyến nghị, có nút "Bản dev")

```bash
node tools/serve.mjs
```

Không cần `npm install` — server chỉ dùng module thuần của Node. Khi chạy, terminal in ra:

- `http://localhost:8090` — mở trên máy tính.
- `http://<IP-LAN>:8090` — mở trên **điện thoại cùng Wi-Fi** để chơi bằng cảm ứng.

Đổi cổng nếu 8090 bị chiếm:

```bash
PORT=9000 node tools/serve.mjs
```

Khi chạy qua server, mỗi thẻ game có thêm nút **"Bản dev"** — mở bản chưa đóng gói (thư mục `src/`) để tiện sửa code và tải lại.

---

## ➕ Thêm game mới

1. **Thêm một object vào mảng trong [`launcher/games.js`](launcher/games.js)** (giữ dấu phẩy giữa các object):

   ```js
   {
     id: "ten-game",                       // kebab-case, không dấu, không trùng
     title: "Tên Game",
     description: "Mô tả ngắn một câu.",
     genre: "Sort / Puzzle",
     status: "Prototype",                  // hoặc "A/B test"
     play: "Ten Game/dist/Game_Standalone.html",
     dev: "Ten Game/index.html",           // hoặc null nếu không có bản dev
     thumb: "launcher/thumbs/ten-game.svg",
     updated: "2026-09-08"                 // YYYY-MM-DD
   }
   ```

   Lưu ý: viết đường dẫn **có dấu cách, không encode** (`%20`) — launcher tự encode khi mở.

2. **Thêm ảnh thumbnail SVG 320×200 vào [`launcher/thumbs/`](launcher/thumbs/)**, đặt tên trùng `id` (ví dụ `ten-game.svg`). Ảnh thiếu không làm hỏng menu — thẻ game chỉ hiện placeholder.

---

## 📂 Cấu trúc thư mục

```text
game idea prototype/
├── index.html              # Trang menu chọn game
├── launcher/
│   ├── games.js            # Danh sách game (sửa file này để thêm game)
│   ├── launcher.js         # Logic render menu + iframe
│   ├── launcher.css        # Giao diện menu
│   └── thumbs/             # Ảnh thumbnail 320x200 (SVG)
├── tools/
│   └── serve.mjs           # Static server cho menu + bản dev
├── Factory Sort/           # Game 1 (+ bản A/B test)
│   ├── delivery/           # Bản chuẩn (index.html, src/, style.css, dist/)
│   └── ab_test/            # Bản đảo layout (index.html, src/, style.css, dist/)
├── Slime Sort/             # Game 2
└── WorldRestaurant/        # Game 3
```

Mỗi thư mục game chứa bản standalone (một file HTML duy nhất, mở là chơi) và mã nguồn dev đi kèm.
