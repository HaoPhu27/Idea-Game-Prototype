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
| 1 | tutorial | 4 | 0 | 2 | 2 | 100% | 2 | — | 2 | 6 | 7 | 0% | 0% |
| 2 | tutorial | 6 | 0 | 3 | 3 | 100% | 3 | — | 3 | 9 | 6 | 0% | 0% |
| 3 | tutorial | 8 | 0 | 3 | 5 | 100% | 5 | 11 | 5 | 9 | 7 | 0% | 0% |
| 4 | tutorial | 10 | 0 | 3 | 5 | 100% | 8 | 16 | 7 | 9 | 12 | 0% | 0% |
| 5 | tutorial | 12 | 0 | 3 | 5 | 100% | 10 | 19 | 9 | 9 | 15 | 0% | 0% |
| 6 | onboarding | 14 | 2 | 3 | 5 | 100% | 12 | 23 | 6 | 9 | 16 | 78% | 0% |
| 7 | onboarding | 16 | 4 | 3 | 5 | 100% | 15 | 28 | 6 | 9 | 18 | 95% | 10% |
| 8 | onboarding | 17 | 5 | 3 | 5 | 100% | 16 | 29 | 6 | 8 | 19 | 50% | 5% |
| 9 | onboarding | 19 | 7 | 3 | 4 | 100% | 19 | 34 | 5 | 7 | 23 | 78% | 3% |
| 10 | onboarding | 20 | 8 | 3 | 4 | 100% | 20 | 34 | 6 | 9 | 24 | 95% | 3% |
| 11 | acclimation | 22 | 10 | 3 | 4 | 100% | 23 | 40 | 5 | 8 | 25 | 70% | 3% |
| 12 | acclimation | 23 | 11 | 3 | 4 | 100% | 24 | 41 | 4 | 7 | 28 | 78% | 0% |
| 13 | acclimation | 25 | 13 | 3 | 4 | 100% | 27 | 45 | 4 | 5 | 30 | 68% | 3% |
| 14 | acclimation | 26 | 14 | 3 | 4 | 100% | 29 | 48 | 4 | 6 | 31 | 85% | 5% |
| 15 | acclimation | 27 | 15 | 3 | 4 | 100% | 30 | 49 | 4 | 7 | 31 | 75% | 5% |
| 16 | acclimation | 29 | 17 | 3 | 4 | 100% | 33 | 53 | 5 | 5 | 32 | 70% | 18% |
| 17 | acclimation | 30 | 18 | 3 | 4 | 100% | 35 | 55 | 4 | 6 | 35 | 83% | 13% |
| 18 | acclimation | 31 | 19 | 3 | 4 | 100% | 36 | 56 | 5 | 8 | 33 | 38% | 23% |
| 19 | acclimation | 33 | 21 | 3 | 4 | 100% | 39 | 60 | 5 | 6 | 35 | 70% | 8% |
| 20 | acclimation | 34 | 22 | 3 | 4 | 100% | 41 | 62 | 4 | 6 | 38 | 75% | 15% |
| 21 | normal | 34 | 22 | 2 | 4 | 100% | 42 | 66 | 5 | 3 | 39 | 65% | 15% |
| 22 | normal | 34 | 22 | 2 | 4 | 100% | 42 | 65 | 5 | 3 | 39 | 65% | 15% |
| 23 | normal | 35 | 23 | 2 | 4 | 100% | 44 | 68 | 5 | 4 | 40 | 98% | 15% |
| 24 | normal | 35 | 23 | 2 | 4 | 100% | 44 | 68 | 5 | 4 | 40 | 98% | 15% |
| 25 | hard | 52 | 40 | 2 | 4 | 100% | 68 | 96 | 4 | 2 | 52 | 98% | 70% |
| 26 | normal | 36 | 24 | 2 | 4 | 100% | 45 | 69 | 4 | 4 | 43 | 83% | 28% |
| 27 | normal | 37 | 25 | 2 | 4 | 100% | 47 | 72 | 5 | 3 | 41 | 75% | 33% |
| 28 | normal | 37 | 25 | 2 | 4 | 100% | 47 | 72 | 5 | 3 | 41 | 75% | 33% |
| 29 | superhard | 72 | 60 | 3 | 3 | 100% | 97 | 127 | 2 | 4 | 67 | 100% | 93% |
| 30 | normal | 38 | 26 | 2 | 4 | 100% | 48 | 73 | 5 | 4 | 42 | 68% | 25% |
| 31 | normal | 38 | 26 | 2 | 4 | 100% | 49 | 74 | 5 | 3 | 42 | 70% | 28% |
| 32 | normal | 39 | 27 | 2 | 4 | 100% | 50 | 75 | 4 | 3 | 45 | 88% | 35% |
| 33 | normal | 39 | 27 | 2 | 4 | 100% | 50 | 75 | 4 | 3 | 45 | 88% | 35% |
| 34 | normal | 40 | 28 | 2 | 4 | 100% | 52 | 78 | 4 | 3 | 46 | 68% | 35% |
| 35 | hard | 60 | 48 | 2 | 4 | 100% | 81 | 110 | 4 | 3 | 56 | 90% | 70% |
| 36 | normal | 40 | 28 | 2 | 4 | 100% | 52 | 77 | 5 | 6 | 43 | 93% | 57% |
| 37 | normal | 41 | 29 | 2 | 4 | 100% | 53 | 79 | 5 | 4 | 44 | 78% | 50% |
| 38 | normal | 41 | 29 | 2 | 4 | 100% | 53 | 78 | 5 | 4 | 44 | 80% | 28% |
| 39 | superhard | 76 | 64 | 3 | 3 | 100% | 104 | 132 | 4 | 3 | 63 | 100% | 93% |
| 40 | normal | 42 | 30 | 2 | 4 | 100% | 55 | 81 | 5 | 4 | 45 | 88% | 48% |
| 41 | normal | 43 | 31 | 2 | 4 | 100% | 56 | 82 | 5 | 3 | 45 | 95% | 13% |
| 42 | normal | 43 | 31 | 2 | 4 | 100% | 57 | 83 | 3 | 1 | 50 | 78% | 45% |
| 43 | normal | 43 | 31 | 2 | 4 | 100% | 57 | 83 | 5 | 2 | 45 | 68% | 48% |
| 44 | normal | 44 | 32 | 2 | 4 | 100% | 58 | 84 | 5 | 2 | 46 | 78% | 35% |
| 45 | hard | 68 | 56 | 2 | 4 | 100% | 94 | 123 | 4 | 5 | 60 | 98% | 70% |
| 46 | normal | 45 | 33 | 2 | 4 | 100% | 60 | 87 | 4 | 2 | 48 | 83% | 43% |
| 47 | normal | 45 | 33 | 2 | 4 | 100% | 60 | 86 | 5 | 3 | 46 | 60% | 30% |
| 48 | normal | 46 | 34 | 2 | 4 | 100% | 61 | 87 | 5 | 4 | 46 | 75% | 33% |
| 49 | superhard | 80 | 68 | 3 | 3 | 100% | 112 | 137 | 3 | 3 | 66 | 98% | 93% |
| 50 | normal | 46 | 34 | 2 | 4 | 100% | 62 | 89 | 3 | 4 | 51 | 85% | 33% |

## Tổng hợp theo tier

| tier | số màn | Thùng | bị che | par | mở đầu | điểm | thua (`planner`) |
|---|---:|---:|---:|---:|---:|---:|---:|
| tutorial | 5 | 4-12 | 0-0 | 2-10 | 2-9 | 6-15 | 0-0% |
| onboarding | 5 | 14-20 | 2-8 | 12-20 | 5-6 | 16-24 | 0-10% |
| acclimation | 10 | 22-34 | 10-22 | 23-41 | 4-5 | 25-38 | 0-23% |
| normal | 24 | 34-46 | 22-34 | 42-62 | 3-5 | 39-51 | 13-57% |
| hard | 3 | 52-68 | 40-56 | 68-94 | 4-4 | 52-60 | 70-70% |
| superhard | 3 | 72-80 | 60-68 | 97-112 | 2-4 | 63-67 | 93-93% |

## Ghi chú

- **Hard (25/35/45)** đúng theo yêu cầu sản phẩm: 52–68 Thùng cả bản đồ, 40–56 Thùng bị
  che hoàn toàn, chỉ 3–4 bộ giải được ngay trong 12 ô nhìn thấy — phần còn lại bắt buộc
  phải giao bớt hàng cho cột tụt xuống mới lấy được tài nguyên ở tầng trên.
- **Super hard (29/39/49)** giữ nguyên cơ chế nhưng đẩy lên 72–80 Thùng, siết cửa sổ Khay
  xuống 3 và dùng 6 nhóm hàng × 3 loại (18 loại item) nên màu sắc không còn giúp phân loại.
- **Normal** trải từ 34 đến 46 Thùng, cửa sổ 4 Khay.
- **Mọi Khay ở mọi tier đều khớp đúng loại item** (đổi 9/2026) — cột "Khay loai" luôn là 100%.
- **Tutorial (1–5)** nằm gọn trong 12 ô hiện: không có gì bị che, không thể thua. Level 1 có
  tutorial 6 bước (`TutorialManager`).
- ⚠️ **Ba tier đầu đang lệch khỏi dải mục tiêu của `curate50.mjs`** (onboarding muốn 0–5%
  nhưng đo được 0–10%; acclimation muốn 0–18%, đo 0–23%; normal muốn 12–42%, đo 13–57%).
  Nguyên nhân: thay đổi 9/2026 bắt mọi Khay khớp đúng loại item làm các tier thấp khó hơn
  hẳn, trong khi `LEVEL_SEEDS` vẫn là bộ seed tuyển dưới luật cũ. Sửa bằng
  `node tools/curate50.mjs`.
- Seed của từng màn đã được tuyển chọn; đổi seed = đổi hẳn màn chơi đó. Nếu sửa
  `configForLevelNumber`, phải chạy lại `node tools/curate50.mjs` và cập nhật
  `LEVEL_SEEDS` trong `src/generator/SolvableLevelGenerator.js`.
