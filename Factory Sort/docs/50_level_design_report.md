# Báo cáo thiết kế 50 màn — Factory Sort

Sinh bởi `node tools/curate50.mjs` + đo lại bằng `GameSim` (40 ván/màn, chính sách
`greedy` và `planner`). Thuật toán: xem `docs/02_THUAT_TOAN_SOLVABLE.md`.

## Cách đọc

- **Thùng / bị che** — tổng số Thùng trên bàn và số Thùng nằm ngoài vùng nhìn thấy.
  Vùng nhìn thấy **luôn** là 3 cột × 4 hàng = 12 Thùng ở **mọi** tier.
- **E** — số Thùng "chuyển tiếp". Tổng ô trống của cả bàn = `3E`, và con số này
  *không* loãng ra khi bàn to lên (xem hệ quả (1) trong tài liệu thuật toán).
- **cửa sổ** — `conveyorMaxActive`: số Khay đầu hàng đợi mà người chơi với tới được.
  Thùng gói xong không khớp Khay nào sẽ chiếm 1 trong 5 slot hàng chờ; hết slot là thua.
- **par** — số nước di chuyển item **tối ưu** (chứng minh được, không phải ước lượng).
- **mở đầu** — số bộ gom đủ 3 item ngay trong vùng nhìn thấy lúc spawn. Càng nhỏ thì
  càng bắt buộc phải khơi thông tầng trên mới giải tiếp được.
- **ô trống hiện** — bao nhiêu trong `3E` ô trống đang nằm trong tầm với lúc spawn.
- **thua(greedy)** — người chơi mới, chỉ nhìn Thùng.
  **thua(planner)** — người chơi chăm chỉ: nhìn cửa sổ Khay và hàng chờ, không bao giờ
  phạm lỗi hiển nhiên, nhưng **không** nhìn được Thùng bị che và **không** tìm kiếm.
  Đây là thước đo độ khó chính thức.

| Lv | tier | Thùng | bị che | E | cửa sổ | Khay loại | par | limit | mở đầu | ô trống hiện | điểm | thua(greedy) | thua(planner) |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | tutorial | 4 | 0 | 2 | 2 | 0% | 2 | — | 2 | 6 | 3 | 0% | 0% |
| 2 | tutorial | 6 | 0 | 3 | 3 | 0% | 3 | — | 3 | 9 | 2 | 0% | 0% |
| 3 | tutorial | 8 | 0 | 3 | 5 | 0% | 5 | 11 | 5 | 9 | 3 | 0% | 0% |
| 4 | tutorial | 10 | 0 | 3 | 5 | 0% | 8 | 16 | 7 | 9 | 7 | 0% | 0% |
| 5 | tutorial | 12 | 0 | 3 | 5 | 0% | 10 | 19 | 9 | 9 | 10 | 0% | 0% |
| 6 | onboarding | 14 | 2 | 3 | 5 | 0% | 12 | 23 | 6 | 9 | 12 | 78% | 3% |
| 7 | onboarding | 16 | 4 | 3 | 5 | 0% | 15 | 28 | 6 | 9 | 14 | 95% | 3% |
| 8 | onboarding | 17 | 5 | 3 | 5 | 0% | 16 | 29 | 6 | 8 | 15 | 50% | 3% |
| 9 | onboarding | 19 | 7 | 3 | 4 | 0% | 19 | 34 | 5 | 7 | 19 | 78% | 3% |
| 10 | onboarding | 20 | 8 | 3 | 4 | 0% | 20 | 34 | 6 | 9 | 19 | 95% | 3% |
| 11 | acclimation | 22 | 10 | 3 | 4 | 0% | 23 | 40 | 5 | 8 | 21 | 70% | 3% |
| 12 | acclimation | 23 | 11 | 3 | 4 | 0% | 24 | 41 | 4 | 7 | 24 | 78% | 3% |
| 13 | acclimation | 25 | 13 | 3 | 4 | 0% | 27 | 45 | 4 | 5 | 25 | 68% | 5% |
| 14 | acclimation | 26 | 14 | 3 | 4 | 0% | 29 | 48 | 4 | 6 | 27 | 85% | 5% |
| 15 | acclimation | 27 | 15 | 3 | 4 | 0% | 30 | 49 | 4 | 7 | 27 | 75% | 5% |
| 16 | acclimation | 29 | 17 | 3 | 4 | 50% | 33 | 53 | 5 | 5 | 30 | 63% | 8% |
| 17 | acclimation | 30 | 18 | 3 | 4 | 48% | 35 | 55 | 4 | 6 | 33 | 75% | 8% |
| 18 | acclimation | 31 | 19 | 3 | 4 | 50% | 36 | 56 | 5 | 8 | 31 | 43% | 8% |
| 19 | acclimation | 33 | 21 | 3 | 4 | 47% | 39 | 60 | 5 | 6 | 32 | 68% | 8% |
| 20 | acclimation | 34 | 22 | 3 | 4 | 52% | 41 | 62 | 4 | 6 | 36 | 75% | 10% |
| 21 | normal | 34 | 22 | 2 | 4 | 50% | 42 | 66 | 5 | 3 | 37 | 60% | 15% |
| 22 | normal | 34 | 22 | 2 | 4 | 50% | 42 | 65 | 5 | 3 | 37 | 60% | 15% |
| 23 | normal | 35 | 23 | 2 | 4 | 48% | 44 | 68 | 5 | 4 | 38 | 95% | 23% |
| 24 | normal | 35 | 23 | 2 | 4 | 48% | 44 | 68 | 5 | 4 | 38 | 95% | 23% |
| 25 | hard | 52 | 40 | 2 | 4 | 100% | 68 | 96 | 4 | 2 | 52 | 98% | 70% |
| 26 | normal | 36 | 24 | 2 | 4 | 53% | 45 | 69 | 4 | 4 | 41 | 85% | 23% |
| 27 | normal | 37 | 25 | 2 | 4 | 74% | 47 | 72 | 5 | 3 | 40 | 75% | 23% |
| 28 | normal | 37 | 25 | 2 | 4 | 74% | 47 | 72 | 5 | 3 | 40 | 75% | 23% |
| 29 | superhard | 72 | 60 | 3 | 3 | 100% | 97 | 127 | 2 | 4 | 67 | 100% | 93% |
| 30 | normal | 38 | 26 | 2 | 4 | 75% | 48 | 73 | 5 | 4 | 41 | 57% | 25% |
| 31 | normal | 38 | 26 | 2 | 4 | 75% | 49 | 74 | 5 | 3 | 41 | 65% | 25% |
| 32 | normal | 39 | 27 | 2 | 4 | 76% | 50 | 75 | 4 | 3 | 44 | 85% | 25% |
| 33 | normal | 39 | 27 | 2 | 4 | 76% | 50 | 75 | 4 | 3 | 44 | 85% | 25% |
| 34 | normal | 40 | 28 | 2 | 4 | 76% | 52 | 78 | 4 | 3 | 45 | 70% | 25% |
| 35 | hard | 60 | 48 | 2 | 4 | 100% | 81 | 110 | 4 | 3 | 56 | 90% | 70% |
| 36 | normal | 40 | 28 | 2 | 4 | 76% | 52 | 77 | 5 | 6 | 42 | 88% | 28% |
| 37 | normal | 41 | 29 | 2 | 4 | 74% | 53 | 79 | 5 | 4 | 43 | 70% | 28% |
| 38 | normal | 41 | 29 | 2 | 4 | 77% | 53 | 78 | 5 | 4 | 43 | 53% | 28% |
| 39 | superhard | 76 | 64 | 3 | 3 | 100% | 104 | 132 | 4 | 3 | 63 | 100% | 93% |
| 40 | normal | 42 | 30 | 2 | 4 | 78% | 55 | 81 | 5 | 4 | 44 | 68% | 30% |
| 41 | normal | 43 | 31 | 2 | 4 | 71% | 56 | 82 | 5 | 3 | 44 | 95% | 28% |
| 42 | normal | 43 | 31 | 2 | 4 | 76% | 57 | 83 | 3 | 1 | 48 | 57% | 30% |
| 43 | normal | 43 | 31 | 2 | 4 | 76% | 57 | 83 | 5 | 2 | 44 | 55% | 28% |
| 44 | normal | 44 | 32 | 2 | 4 | 74% | 58 | 84 | 5 | 2 | 45 | 73% | 30% |
| 45 | hard | 68 | 56 | 2 | 4 | 100% | 94 | 123 | 4 | 5 | 60 | 98% | 70% |
| 46 | normal | 45 | 33 | 2 | 4 | 74% | 60 | 87 | 4 | 2 | 47 | 68% | 30% |
| 47 | normal | 45 | 33 | 2 | 4 | 100% | 60 | 86 | 5 | 3 | 46 | 60% | 30% |
| 48 | normal | 46 | 34 | 2 | 4 | 100% | 61 | 87 | 5 | 4 | 46 | 75% | 33% |
| 49 | superhard | 80 | 68 | 3 | 3 | 100% | 112 | 137 | 3 | 3 | 66 | 98% | 93% |
| 50 | normal | 46 | 34 | 2 | 4 | 100% | 62 | 89 | 3 | 4 | 51 | 85% | 33% |

## Tổng hợp theo tier

| tier | số màn | Thùng | bị che | par | mở đầu | điểm | thua (`planner`) |
|---|---:|---:|---:|---:|---:|---:|---:|
| tutorial | 5 | 4-12 | 0-0 | 2-10 | 2-9 | 2-10 | 0-0% |
| onboarding | 5 | 14-20 | 2-8 | 12-20 | 5-6 | 12-19 | 3-3% |
| acclimation | 10 | 22-34 | 10-22 | 23-41 | 4-5 | 21-36 | 3-10% |
| normal | 24 | 34-46 | 22-34 | 42-62 | 3-5 | 37-51 | 15-33% |
| hard | 3 | 52-68 | 40-56 | 68-94 | 4-4 | 52-60 | 70-70% |
| superhard | 3 | 72-80 | 60-68 | 97-112 | 2-4 | 63-67 | 93-93% |

## Ghi chú

- **Hard (25/35/45)** đúng theo yêu cầu sản phẩm: 52–68 Thùng cả bản đồ, 40–56 Thùng bị
  che hoàn toàn, chỉ 3–4 bộ giải được ngay trong 12 ô nhìn thấy — phần còn lại bắt buộc
  phải giao bớt hàng cho cột tụt xuống mới lấy được tài nguyên ở tầng trên.
- **Super hard (29/39/49)** giữ nguyên cơ chế nhưng đẩy lên 72–80 Thùng, siết cửa sổ Khay
  xuống 3 và dùng 6 nhóm hàng × 3 loại (18 loại item) nên màu sắc không còn giúp phân loại.
- **Normal** trải từ 34 đến 46 Thùng, cửa sổ 4 Khay, tỷ lệ Khay đòi đúng loại tăng dần
  55% → 90%.
- **Tutorial (1–5)** nằm gọn trong 12 ô hiện: không có gì bị che, không thể thua.
- Seed của từng màn đã được tuyển chọn; đổi seed = đổi hẳn màn chơi đó. Nếu sửa
  `configForLevelNumber`, phải chạy lại `node tools/curate50.mjs` và cập nhật
  `LEVEL_SEEDS` trong `src/generator/SolvableLevelGenerator.js`.
