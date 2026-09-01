# Danh sách Asset có thể tái sử dụng cho HTML Prototype

Dưới đây là danh sách các hình ảnh (asset) 2D chất lượng từ dữ liệu cào về có thể copy vào thư mục `assets/` của bản HTML để làm giao diện (UI) sinh động hơn. 

> [!NOTE]
> **Về các vật phẩm (Goods/Items):** 
> Đa số các game thể loại này dùng **mô hình 3D** cho vật phẩm (như táo, lon nước, đồ chơi,...) để tạo hiệu ứng ánh sáng chân thực. Các mô hình này đang bị nén trong file Unity AssetBundles và chưa được trích xuất thành ảnh 2D PNG trong thư mục này. Do đó, với bản HTML Prototype, anh có thể dùng ảnh placeholder tự tải trên mạng (icon vuông) ghép vào trước.

## 1. Biểu tượng Power-up (Booster)
Các nút kỹ năng hỗ trợ trong lúc chơi.
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_icon_PowerUp_Freeze.png` (Đóng băng thời gian)
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_icon_PowerUp_Hammer.png` (Búa đập)
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_icon_PowerUp_MagicWand.png` (Đũa thần)
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_icon_PowerUp_Swap.png` (Hoán đổi vị trí)

## 2. Nền màn chơi & Loading Screen (Backgrounds)
Hình nền để làm background cho container HTML.
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_LoadingScreen_background.png`
- `ScrapedData\src level\Assets\Texture2D\2D_Ingame_LoadingScreen_background_0.png`
- `ScrapedData\src level\Assets\Texture2D\Background.png`
- `ScrapedData\src level\Assets\Texture2D\2D_Outgame_Start_scene_background.png`

## 3. UI Elements (Giao diện chung)
Các thành phần nút bấm, khung viền, bảng thông báo.
- `ScrapedData\src level\Assets\Texture2D\2D_Default_toast.png` (Nền thông báo nhỏ)
- `ScrapedData\src level\Assets\Texture2D\2D_Default_avatar_frame.png` (Khung avatar)
- `ScrapedData\src level\Assets\Texture2D\2D_UI_GoldenGift_collect_item.png` (Icon hộp quà/vật phẩm sự kiện)

## 4. Asset ngoài luồng (Outgame UI)
Dùng cho màn hình menu, cửa hàng.
- `ScrapedData\src level\Assets\Texture2D\2D_Outgame_icon_Booster_Giant_Hammer.png`
- `ScrapedData\src level\Assets\Texture2D\2D_Outgame_icon_Booster_Time.png` (Biểu tượng thêm thời gian)
- `ScrapedData\src level\Assets\Texture2D\2D_Outgame_Digging_shovel_icon.png` (Xẻng đào)
- `ScrapedData\src level\Assets\Texture2D\2D_Outgame_Title_game.png` (Logo tựa game)

---
**Hướng dẫn sử dụng:**
Anh có thể tìm các file này theo đường dẫn trên, copy chúng dán vào thư mục `assets/` ở thư mục gốc của project, và nhúng vào `index.html` thông qua thẻ `<img src="assets/tên_file.png">`.
