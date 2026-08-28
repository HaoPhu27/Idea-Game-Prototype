# Thuật toán sinh Tray theo độ khó Tube (Slime Sort)

> Mở rộng từ `puzzle-difficulty-algorithm.md` (Water Sort). Cùng triết lý — dùng 1 chỉ số "che phủ" nhanh thay cho search đầy đủ, rồi tune bằng curve — nhưng chuyển trục từ **không gian** (layer trong Tube) sang **thời gian** (kịch bản Tray/Conveyor).

## 0. Insight nền: gánh nặng "đảm bảo giải được" chuyển từ Tube sang Tray

Ở Water Sort, `valid_pour` bắt buộc trùng màu (hoặc tube đích rỗng), nên trạng thái ngẫu nhiên gần như luôn **không giải được** — đó là lý do §3 tài liệu gốc phải sinh ngược từ trạng thái đã giải.

Ở Slime Sort, mục 4.2 GDD nói rõ: *"Tube đích không bắt buộc phải trống hoặc có màu trên cùng trùng... có thể đổ vào bất kỳ Tube nào còn đủ chỗ trống."* Nghĩa là xét riêng phần Tube, **mọi layout luôn dọn được** — không có màu nào thực sự "bị chôn" theo nghĩa chặn cứng như Water Sort, chỉ có tốn công gom cụm nhiều hay ít. Không cần reverse-construction để đảm bảo Tube giải được.

Rủi ro "không giải được" vì vậy nằm hoàn toàn ở Conveyor + Tray: nếu kịch bản Tray không bao giờ khớp màu của 1 cụm đang kẹt trên Conveyor và Conveyor đầy 7 unit → deadlock, thua chắc, bất kể Tube dễ hay khó. Đây là lý do câu hỏi "sinh Tray theo độ khó Tube" là đúng hướng: Tray vừa phải *đảm bảo giải được*, vừa là *đòn bẩy độ khó chính*.

## 1. Bảng tương ứng khái niệm

| Water Sort (`puzzle-difficulty-algorithm.md`) | Slime Sort (tài liệu này) |
|---|---|
| Covering index `n` — số layer che 1 màu, đọc từ layout Tube | Độ trễ Tray `m` — số lần đổi Tray trước khi có Tray đúng màu, đọc từ kịch bản Tray |
| Trục không gian: màu bị chôn dưới màu khác trong tube | Trục thời gian: cụm màu bị delay vì Tray đang mở sai màu |
| Solve length `L`, đo bằng BFS | Tổng dock-event / tải Conveyor đỉnh điểm, đo bằng simulate |
| `weighted_scramble` — xáo trọng số để đạt `target_n` | `build_tray_script` — chọn màu Tray trọng số để đạt `target_m` |
| ≥2 Order song song trong 1 box (Screw) | Nhiều màu cùng "in-flight" trên Conveyor (capacity 7) |
| Reverse-construction đảm bảo giải được | Simulate + validate đảm bảo không deadlock |

## 2. Input cần có

- Layout Tube (K màu, mỗi tube là list slime đáy→đỉnh). Tube có thể sinh độc lập, không cần thuật toán đảm bảo-giải-được kiểu Water Sort.
- Curve độ khó theo progression, cùng định dạng §5 tài liệu gốc.
- Tham số game cố định: sức chứa Conveyor `C_conv = 7`, số slot/Tray = 3, số Tray hiển thị = 3 (2 Able + 1 Unable).

## 3. Ước lượng thứ tự xuất ra Conveyor (thay cho `pick_solve_order`)

Vì không có ràng buộc màu khi đổ Tube→Tube, thứ tự thật sự do người chơi quyết — thuật toán chỉ cần một **ước lượng dự kiến**, làm input cho bước gán target. Dùng lại đúng tinh thần "layer" của tài liệu gốc, chỉ đổi đơn vị đếm từ layer-đơn-vị sang layer-block (vì 1 block liền màu di chuyển được trong 1 nước đổ):

```python
def tube_layers(tube):
    """Nén tube thành các block liền màu (đáy -> đỉnh)."""
    layers = []
    for slime in tube:
        if layers and layers[-1][0] == slime:
            layers[-1] = (slime, layers[-1][1] + 1)
        else:
            layers.append((slime, 1))
    return layers

def color_cover_count(tubes, color):
    """Với mỗi block của `color`, đếm số block màu KHÁC nằm phía trên nó
    (cùng tube). Proxy chi phí gom cụm — song song covering index n,
    nhưng ở đây không chặn cứng, chỉ tốn thêm nước đổ trung gian."""
    total = 0
    for tube in tubes:
        layers = tube_layers(tube)
        for i, (c, _) in enumerate(layers):
            if c == color:
                total += sum(1 for c2, _ in layers[i + 1:] if c2 != color)
    return total

def estimate_extraction_order(tubes, colors):
    return sorted(colors, key=lambda c: color_cover_count(tubes, c))
```

*Lưu ý:* đây là proxy thô hơn `n` gốc, vì gom cụm ở Slime Sort là bài toán staging (cần tube trống tạm chứa màu khác trong lúc đào màu đích) chứ không chỉ đếm layer chặn. Coi đây là input hợp lý, không phải chân lý — giống cách tài liệu gốc coi `n` là proxy cho `L`, không phải `L`.

## 4. Định nghĩa "độ trễ Tray" `m(c)` — proxy độ khó chính

`m(c)` = số lần Tray đổi màu (do harvest + Tray mới) xảy ra *trước khi* có ít nhất 1 Tray đúng màu `c`, tính từ lúc cụm màu `c` tới lượt theo `extraction_order`.

```python
def measure_m(extraction_order, tray_script, num_trays=3):
    """tray_script: list các sự kiện (slot, màu) theo đúng thứ tự xảy ra
    (gồm cả 3 màu Tray ban đầu, coi là index 0..2)."""
    trays = [None] * num_trays
    m = {}
    queue = list(extraction_order)
    for slot, color in tray_script:
        trays[slot] = color
        while queue and queue[0] in trays:
            queue.pop(0)
        if queue:
            c = queue[0]
            m[c] = m.get(c, 0) + 1
    return m
```

Đây là bản dịch trực tiếp của `measure_n` bên Water Sort, chỉ thay "đo từ layout" bằng "đo từ kịch bản".

## 5. Pha 1 — Curve → `target_m` cho từng màu

Giữ nguyên hàm `curve()` gốc, chỉ đổi tên biến — không cần viết lại. `layers_per_unit` ở đây nên hiểu là "số lần đổi Tray mỗi điểm độ khó", tune theo nhịp harvest trung bình của level.

```python
def assign_targets(colors_by_extraction_order, points, delay_per_unit=1):
    n = len(colors_by_extraction_order)
    targets = {}
    for i, color in enumerate(colors_by_extraction_order):
        p = i / (n - 1) if n > 1 else 0
        targets[color] = round(curve(p, points) * delay_per_unit)
    return targets
```

## 6. Pha 2 — Sinh kịch bản Tray bằng weighted assignment

Thay vì "xáo trạng thái đã giải" như Water Sort, ở đây ta **dựng thuận** kịch bản Tray theo thời gian thực của game (đúng với mục 3.3 GDD: *"màu sắc Tray... theo kịch bản của level design, không phải random"* — nghĩa là engine này chính là cách sinh "kịch bản" đó).

```python
def build_tray_script(extraction_order, targets, num_trays=3, max_events=200):
    trays = [None] * num_trays
    script = []
    current_m = {c: 0 for c in targets}
    queue = list(extraction_order)
    colors = list(targets.keys())

    for _ in range(max_events):
        if not queue:
            break
        c = queue[0]
        if c in trays:
            queue.pop(0)
            continue

        slot = pick_slot_to_change(trays, targets, current_m)  # ưu tiên slot None,
                                                                 # rồi slot có màu đã "hết nhiệm vụ"
        weights = [shortfall_score(x, targets, current_m) for x in colors]
        color = weighted_choice(colors, weights)

        trays[slot] = color
        script.append((slot, color))
        if color == c:
            queue.pop(0)
        else:
            current_m[c] += 1
    return script
```

`shortfall_score(x, targets, current_m)` = `max(target_m[x] - current_m[x], 0) + ε` — càng thiếu so với target càng ưu tiên bị "phớt lờ" thêm; màu đã đạt target thì trọng số rơi về gần 0, nghĩa là ưu tiên gán đúng màu đó cho Tray sớm.

## 7. Ràng buộc cứng: sức chứa Conveyor = 7

`m` cao không được phép tự do — mỗi lần `m(c)` tăng nghĩa là cụm màu `c` (và mọi cụm khác đang chờ) tiếp tục chiếm chỗ trên Conveyor. Nếu tổng unit in-flight vượt 7 → deadlock ngoài ý muốn, tức là "không giải được" chứ không phải "khó". Bước 6 cần một guard:

```python
def would_overflow(in_flight_units, incoming_cluster_size, C_conv=7):
    return in_flight_units + incoming_cluster_size > C_conv
```

Khi `pick_slot_to_change` / `weighted_choice` sắp tạo ra lựa chọn khiến `would_overflow` đúng, phải ép chọn màu đang chờ lâu nhất (giảm shortfall cưỡng bức) thay vì theo trọng số thuần — tương đương "an toàn" luôn thắng "đúng target" khi hai cái xung đột.

## 8. Nhiều màu cùng in-flight trên Conveyor — cộng gộp shortfall

Song song §9 bản gốc (nhiều track trong 1 box của Screw): ở Slime Sort, Conveyor 7 unit thường chứa **nhiều màu cùng lúc**, không chỉ 1 màu đang chờ ở đầu hàng đợi. Vì vậy `shortfall_score` ở bước 6 không nên chỉ nhìn `queue[0]`, mà phải cộng gộp shortfall của **mọi màu đang in-flight** tại thời điểm đó:

```python
def shortfall_score(color, targets, current_m, in_flight_colors):
    base = max(targets[color] - current_m[color], 0)
    if color in in_flight_colors:
        base *= 1  # có thể nhân hệ số ưu tiên nếu muốn giải toả bớt Conveyor trước
    return base + 0.01
```

`current_m` đóng vai trò state xuyên suốt giống `current_n` truyền từ box[i-1] sang box[i] bên Water Sort — chỉ khác là ở đây truyền theo **thời gian** (từ sự kiện Tray này sang sự kiện Tray sau), không phải theo box vật lý.

## 9. Vòng lặp đo & hiệu chỉnh — `m` chỉ là proxy

Giống hệt tinh thần §8 gốc: `n` không thay được BFS validate `L` thật; ở đây `m` cũng không thay được simulate thật. Lý do `m` có thể sai lệch:

- Cụm màu lớn hơn 3 unit vẫn phải chờ thêm dù Tray *đã* đúng màu (phần dư loop tiếp — mục 5 GDD), việc này không nằm trong `m`.
- Nhiều màu in-flight cùng lúc có thể tương tác (giải toả màu A vô tình làm Conveyor đủ chỗ cho màu B tới sớm hơn dự kiến).

```python
def generate_tray_script(tubes, colors, points, delay_per_unit=1, tolerance=1, max_tries=30):
    order = estimate_extraction_order(tubes, colors)
    targets = assign_targets(order, points, delay_per_unit)
    best = None
    for attempt in range(max_tries):
        script = build_tray_script(order, targets)
        result = simulate_full(tubes, script)          # simulate thật: Tube + Conveyor + Tray
        if result.deadlock:
            continue                                     # loại thẳng, không phải "khó", là lỗi
        err = total_diff(result.actual_m, targets)
        if err <= tolerance:
            return script, result
        if best is None or err < best[2]:
            best = (script, result, err)
    return (best[0], best[1]) if best else None
```

`simulate_full` nên trả thêm các chỉ số thật để so với curve mong muốn: tải Conveyor đỉnh điểm theo thời gian, tổng số dock-event, số lần cụm phải loop lại — đây mới là "L thật" của Slime Sort, tương đương việc BFS đo `L` thật ở Water Sort.

## 10. Đòn bẩy độ khó khác — chưa nằm trong `m`

- **Cluster > 3 slot**: ngay cả khi Tray đúng màu có sẵn (`m = 0`), cụm lớn hơn 3 vẫn phải chờ Tray kế tiếp — level design/tube-generator có thể chủ động tạo cụm lớn như một trục khó độc lập với `m`.
- **Tray trùng màu (redundancy)**: 2 Tray cùng màu đồng thời làm giảm `m` thực tế dù kịch bản "danh nghĩa" như cũ — cần tính vào `simulate_full`, không tính tay bằng `measure_m`.
- **Unable Tray**: tray thứ 3 cần tap mới active. Đây là biến số *người chơi* kiểm soát, không phải kịch bản — nên xử lý bảo thủ: hoặc coi như luôn active ngay (giả định prototype "tap free" theo mục 7 GDD), hoặc mô phỏng độ trễ tap như hằng số margin an toàn thêm vào §7.
- **Vị trí slime nhập Conveyor** (open question §9 GDD): nếu chưa chốt, giả định nhập tại 1 điểm cố định, ảnh hưởng thời gian di chuyển tới Tray đầu tiên — chưa đưa vào `m` vì phụ thuộc quyết định chưa có.

## 11. Chưa thuộc thuật toán này

- Thuật toán sinh **layout Tube** cụ thể (bài toán staging/bin-packing để đạt `extraction_order` mong muốn) — phức tạp hơn reverse-construction Water Sort vì không có ràng buộc màu để lợi dụng; cần thuật toán riêng.
- Hệ thống điểm/currency khi harvest, move limit hay timer — vẫn là open question ở GDD §9, curve độ khó trên giả định các biến này đã cố định.
- Cơ chế booster/quảng cáo cho Unable Tray — chỉ ảnh hưởng gián tiếp qua margin an toàn ở §7/§10, không phải logic sinh Tray.
- Meta-progression giữa nhiều level (K/E/C hay số Tray tăng dần theo world) — nằm ở tầng cao hơn, ngoài scope tài liệu này.
