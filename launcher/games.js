// Danh sách game cho trang launcher.
//
// CÁCH THÊM GAME MỚI:
//   1. Copy một object bên dưới, dán vào cuối mảng (giữ nguyên dấu phẩy giữa các object).
//   2. id: kebab-case, không dấu, không trùng với game khác.
//   3. play: đường dẫn TƯƠNG ĐỐI từ thư mục gốc tới file HTML standalone.
//      Giữ nguyên dấu cách, KHÔNG encode (%20). Ví dụ: "Factory Sort/delivery/dist/FactorySort_Standard_Delivery.html"
//   4. dev: đường dẫn bản dev để tiện sửa, hoặc null nếu không có.
//   5. thumb: ảnh thumbnail, ví dụ "launcher/thumbs/ten-game.svg".
//   6. updated: ngày cập nhật dạng YYYY-MM-DD.
//
// File này là JavaScript thường (không import/export) để chạy được khi mở trực tiếp bằng file://.

window.GAMES = [
  {
    id: "factory-sort",
    title: "Factory Sort",
    description: "Xếp hàng hóa bằng khay và băng chuyền.",
    genre: "Sort / Puzzle",
    status: "Prototype",
    play: "Factory Sort/delivery/dist/FactorySort_Standard_Delivery.html",
    dev: "Factory Sort/delivery/index.html",
    thumb: "launcher/thumbs/factory-sort.svg",
    updated: "2026-09-08"
  },
  {
    id: "factory-sort-ab",
    title: "Factory Sort – Đảo layout",
    description: "Băng chuyền ở trên, thùng hàng ở dưới cho chơi một tay.",
    genre: "Sort / Puzzle",
    status: "A/B test",
    play: "Factory Sort/ab_test/dist/FactorySort_ABTest_Inverted.html",
    dev: "Factory Sort/ab_test/index.html",
    thumb: "launcher/thumbs/factory-sort-ab.svg",
    updated: "2026-09-08"
  },
  {
    id: "slime-sort",
    title: "Slime Sort",
    description: "Phân loại slime theo màu qua ống, khay và băng chuyền.",
    genre: "Sort / Puzzle",
    status: "Prototype",
    play: "Slime Sort/SlimeSort_Standalone.html",
    dev: "Slime Sort/index.html",
    thumb: "launcher/thumbs/slime-sort.svg",
    updated: "2026-08-25"
  },
  {
    id: "world-restaurant",
    title: "World Restaurant",
    description: "Puzzle nhà hàng isometric với 20 màn chơi.",
    genre: "Puzzle / Isometric",
    status: "Prototype",
    play: "WorldRestaurant/dist/WorldRestaurant.html",
    dev: "WorldRestaurant/index.html",
    thumb: "launcher/thumbs/world-restaurant.svg",
    updated: "2026-08-20"
  }
];
