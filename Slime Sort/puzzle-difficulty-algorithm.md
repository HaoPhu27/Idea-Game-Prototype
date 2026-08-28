# Thuật toán sinh màn Water Sort theo độ khó

## 1. Luật cơ bản

- N ống, sức chứa C mỗi ống, K màu (mỗi màu đúng C đơn vị), E ống rỗng ban đầu (N = K + E, cần E ≥ 1).
- Đổ từ ống `a` sang `b` hợp lệ khi: `a` không rỗng, `b` chưa đầy, và (`b` rỗng hoặc màu đỉnh `b` == màu đỉnh `a`).
- Khi đổ: toàn bộ khối liên tiếp cùng màu ở đỉnh `a` chuyển sang `b`, giới hạn bởi chỗ trống còn lại của `b`.
- Thắng khi mọi ống hoặc rỗng, hoặc chỉ chứa 1 màu.

```python
def valid_pour(tubes, a, b, C):
    if a == b or not tubes[a]: return False
    if len(tubes[b]) >= C: return False
    return not tubes[b] or tubes[b][-1] == tubes[a][-1]

def pour(tubes, a, b, C):
    color = tubes[a][-1]
    space = C - len(tubes[b])
    while tubes[a] and tubes[a][-1] == color and space > 0:
        tubes[b].append(tubes[a].pop())
        space -= 1

def is_solved(tubes, C):
    return all(len(t) == 0 or (len(t) == C and len(set(t)) == 1) for t in tubes)
```

## 2. Hai bài toán con

1. **Solver** — cho 1 trạng thái, tìm số nước đi tối thiểu để giải (L) bằng BFS trên không gian trạng thái. Dùng để *validate* độ khó thực tế, hoặc khi K lớn thì giới hạn số node duyệt / chuyển sang IDA* với heuristic.
2. **Generator** — sinh 1 màn đảm bảo giải được, có độ khó theo ý muốn. Đây là phần chính bên dưới.

## 3. Vì sao sinh ngược (reverse construction)

Sinh trạng thái ngẫu nhiên rồi kiểm tra "có giải được không" rất tốn kém vì đa số không giải được. Cách chuẩn: xuất phát từ trạng thái **đã giải** (mỗi ống 1 màu), rồi thực hiện các nước đổ hợp lệ để xáo trộn dần — vì mỗi bước xáo tự nó đúng luật nên luôn đảo ngược được, màn sinh ra luôn đảm bảo giải được.

```python
def generate_base(K, E, C):
    tubes = [[color] * C for color in range(K)]
    tubes += [[] for _ in range(E)]
    return tubes
```

## 4. Chọn tham số độ khó chính

Nhiều yếu tố ảnh hưởng độ khó: K, E, C, mức xáo trộn, **độ dài lời giải tối thiểu (L)**. Bốn cái đầu chỉ là nguyên nhân gián tiếp; L mới là định nghĩa trực tiếp của độ khó. Nhưng đo L cần chạy BFS, tốn kém khi sinh hàng loạt màn — nên dùng một proxy nhanh hơn:

**Covering index n**: một màu bị che bởi n *layer* (lớp màu khác) phía trên thì có chỉ số khó = n. Tính trực tiếp từ layout, không cần search — xấp xỉ tốt cho L vì mỗi layer chặn thường tốn ~1 nước đổ để dọn.

## 5. Đường cong độ khó theo Progression

Thay vì chỉ 1 con số độ khó cho cả màn, kiểm soát *khi nào trong màn* độ khó tăng, bằng 1 curve progression (0→1) → độ khó (0-10). Ví dụ:

| Progression | 0 | 0.4 | 0.7 | 1 |
|---|---|---|---|---|
| Độ khó | 0 | 2 | 3.5 | 0 |

Nội suy tuyến tính giữa các mốc này.

## 6. Pha 1 — Từ curve suy ra target_n cho từng màu

Giả định: màu n thấp được giải sớm (progression thấp), màu n cao giải muộn. Sắp màu theo thứ tự dự kiến giải, tra curve tại vị trí progression tương ứng.

```python
def curve(p, points):  # points: [(0,0),(0.4,2),(0.7,3.5),(1,0)]
    for (p0, d0), (p1, d1) in zip(points, points[1:]):
        if p0 <= p <= p1:
            t = (p - p0) / (p1 - p0)
            return d0 + t * (d1 - d0)

def assign_targets(colors_in_solve_order, points, layers_per_unit=1):
    n = len(colors_in_solve_order)
    targets = {}
    for i, color in enumerate(colors_in_solve_order):
        p = i / (n - 1) if n > 1 else 0
        targets[color] = round(curve(p, points) * layers_per_unit)
    return targets
```

`layers_per_unit`: hệ số quy đổi "độ khó 0-10" sang số layer thật, tune bằng tay theo C và K.

*Lưu ý:* progression ở đây xấp xỉ bằng thứ tự màu (i/K). Chính xác hơn nên đo bằng tỉ lệ số nước đi đã dùng / tổng số nước đi dự kiến, vì các màu không tốn số nước như nhau.

## 7. Pha 2 — Hiện thực target_n bằng scramble có trọng số

Xếp layout sao cho n thực tế khớp target là bài toán constraint-satisfaction (không giải đóng được). Cách thực dụng: vẫn reverse-scramble, nhưng thay random đều bằng random có trọng số — ưu tiên nước đổ làm tăng n cho màu đang "thiếu" so với target, hạ trọng số về 0 cho màu đã đạt target.

```python
def weighted_scramble(tubes, C, targets, steps):
    current_n = {c: 0 for c in targets}
    last = None
    for _ in range(steps):
        moves = [(a, b) for a in range(len(tubes)) for b in range(len(tubes))
                 if valid_pour(tubes, a, b, C)]
        if last:
            moves = [m for m in moves if m != (last[1], last[0])] or moves
        if not moves: break
        weights = [shortfall_score(tubes, m, targets, current_n) for m in moves]
        a, b = weighted_choice(moves, weights)
        pour(tubes, a, b, C)
        update_n(current_n, tubes, a, b)
        last = (a, b)
```

`shortfall_score` = tổng `(target_n[c] - current_n[c])` của các màu bị nước đổ này che thêm — điểm càng cao càng ưu tiên.

## 8. Vòng lặp đo & hiệu chỉnh

```python
def generate_puzzle(K, E, C, points, layers_per_unit=1, tolerance=1, max_tries=30):
    order = pick_solve_order(K)          # thứ tự màu dự kiến giải
    targets = assign_targets(order, points, layers_per_unit)
    best = None
    for attempt in range(max_tries):
        tubes = generate_base(K, E, C)
        weighted_scramble(tubes, C, targets, steps=sum(targets.values()) + attempt * 2)
        actual = measure_n(tubes)         # đo current_n thật sự sau khi xáo
        err = total_diff(actual, targets)
        if err <= tolerance:
            return tubes
        if best is None or err < best[1]:
            best = (tubes, err)
    return best[0] if best else None
```

Dùng BFS (`min_solve_length`) để validate L thực tế trên vài màn mẫu, vì n không tính được các trường hợp blocker "dọn cùng lúc" hoặc bị kẹt do thiếu chỗ đổ.

## 9. Khi có ≥2 Order song song (ví dụ Screw)

Một box/tube thường chứa layer của cả 2 track cùng lúc, nên chôn 1 layer cho track A tự động ảnh hưởng track B trong cùng box → không sinh box độc lập được.

Cách xử lý: giữ 1 state chạy xuyên suốt = `current_n` theo **từng track**, truyền từ box[i-1] sang box[i]. Khi sinh box[i], `shortfall_score` cộng gộp độ thiếu-hụt của **tất cả track đang active**, không chỉ 1 track — đây chính là ràng buộc giữa box hiện tại và box trước.

## 10. Những phần chưa thuộc thuật toán này

- **Chọn K, E, C** — tầng vĩ mô quyết định quy mô màn, thường gắn theo world/chương; curve ở trên giả định các số này đã cố định.
- **Validate cuối bằng solver thật (BFS)** — n chỉ là proxy nhanh, không phải L chính xác.
- **Constraint vật lý khi build** — target_n cao mà E ít có thể không hiện thực được 100%; cần fallback (nới target hoặc tăng steps).
- **Meta-progression** — curve ở đây là *trong 1 màn*; việc K/E/C tăng dần qua nhiều world là 1 curve khác, ở tầng cao hơn.
- **UI/presentation** — ví dụ ẩn/hiện gợi ý Order theo độ khó là quyết định hiển thị, không thuộc thuật toán sinh.
