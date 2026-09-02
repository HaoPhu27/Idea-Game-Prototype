# KIỂM CHỨNG — "vẫn đúng là game gốc"

> Tài liệu cuối cùng. Chạy sau khi áp dụng **bất kỳ** phase nào, và bắt buộc chạy
> đầy đủ sau khi áp dụng xong toàn bộ 6 phase.
>
> Mục tiêu duy nhất: chứng minh phần **luật chơi** không đổi một chút nào.

---

## 0. Quy tắc bất di bất dịch

1. **Không bao giờ sửa tay `FactorySort_Standalone.html`.** Đó là file sinh ra.
   Sửa `src/`, `index.html`, `style.css` rồi build lại.
2. Không sửa file nào trong `src/core/` và `src/generator/`.
   Toàn bộ 6 phase chỉ đụng tới `src/ui/`, `index.html`, `style.css`.
   Nếu một thay đổi bắt buộc phải sửa `src/core/` — thay đổi đó sai, bỏ đi.
3. Mỗi phase = một commit riêng. Hỏng thì `git revert` đúng một cái.

---

## 1. Build

```bash
node tools/build.mjs
```
Kỳ vọng:
- Không lỗi. `node --check` trong script phải qua.
- `bundle.js` và `FactorySort_Standalone.html` cùng được ghi lại.
- `git diff --stat` chỉ hiện các file bạn thực sự sửa + 2 file sinh ra ở trên.

Nếu build báo trùng định danh: bạn đã khai báo lại một tên đã có ở file khác —
bundler dùng chung một phạm vi toàn cục.

---

## 2. Đối chiếu luật chơi (làm thủ công, ~5 phút)

Mở `FactorySort_Standalone.html` bằng cách nhấp đúp (không qua server) và xác nhận:

| # | Điểm kiểm tra | Kỳ vọng |
|---|---|---|
| 1 | Chạm một vật phẩm rồi chạm hộp khác | Vật phẩm chuyển sang, y như cũ |
| 2 | Chạm vật phẩm rồi chạm lại chính nó | Bỏ chọn |
| 3 | Đủ 3 vật phẩm giống nhau trong một hộp | Hộp tự dán băng keo, đổi sang trạng thái kéo được |
| 4 | Kéo hộp đã dán lên khay **đúng** loại | Khay nhận, khay rời băng chuyền, **hộp biến mất khỏi lưới** |
| 5 | Kéo hộp đã dán lên khay **sai** loại | Bị từ chối, hộp về chỗ cũ, **không** mất lượt |
| 6 | Kéo hộp **chưa** dán | Không kéo được |
| 7 | Bộ đếm nước đi | Tăng đúng bằng số lần chuyển vật phẩm thành công, không hơn |
| 8 | Hết khay + mọi hộp trống | Overlay THẮNG |
| 9 | Mọi hộp chưa dán đều đầy, không còn chỗ trống | Overlay THUA |
| 10 | Băng chuyền | Tối đa 4 khay hiện cùng lúc, khay mới trượt vào khi có khay rời đi |

Bất kỳ dòng nào lệch ⇒ **revert phase vừa áp dụng**, đừng vá chồng lên.

---

## 3. Đối chiếu bằng số nước đi

Cách kiểm chứng khách quan nhất và không tốn công viết test:

1. Trước khi sửa: mở game, chơi một màn tới thắng, **ghi lại chuỗi thao tác**
   (ví dụ: `hộp1 khe0 → hộp2`, `hộp2 khe1 → hộp3`, `kéo hộp3 → khay A`, ...)
   và ghi lại số nước đi cuối cùng.
2. Sau khi sửa: chơi **đúng chuỗi đó** trên cùng một màn (cùng seed).
3. Số nước đi cuối cùng phải **giống hệt**, và trạng thái thắng/thua phải giống hệt.

Nếu `src/generator/` có tham số seed, hãy cố định seed để hai lần chơi cùng màn.

---

## 4. Kiểm tra "không thêm gì mới"

Lệnh sau phải trả về **đúng 1 kết quả**, và kết quả đó phải là dòng chú thích có sẵn
`src/ui/TrayRenderer.js:64:  // Target item (visual hint)`:

```bash
grep -rniE "score|combo|multiplier|booster|undo|hint|tutorial" src/ui/ src/core/ index.html style.css
```

Xuất hiện thêm bất kỳ dòng nào ⇒ một cơ chế bịa thêm đã lọt vào phần giao diện hoặc
phần lõi. Game gốc không có thứ nào trong số đó — xem [00-GAME-GOC.md](00-GAME-GOC.md).

⚠️ **Chỉ quét `src/ui/`, `src/core/`, `index.html`, `style.css`. Đừng quét cả `src/`.**
`src/generator/` vốn đã có sẵn `score`, `undoCount`, `hint()`, `tutorial` từ trước
(`SolvableLevelGenerator.js:126,136,279,645,729`, `LevelGenerator.js:115`, `Solver.js:404`).
Đó là **siêu dữ liệu chấm độ khó và bộ giải màn**, không phải cơ chế người chơi thấy được,
và không phase nào được đụng vào chúng.

Ngược lại, ba lệnh sau hiện đang trả về **0 kết quả** — sau [Phase 4](P4-feedback.md)
mỗi lệnh phải trả về **ít nhất 1**:

```bash
grep -rn "item-animating" src/ui/
grep -rn "boxEl.classList.add('selected')" src/ui/BoxRenderer.js
grep -rn "onBoxWrapped" src/ui/UIManager.js
```

Chính con số 0 đó là bằng chứng cho Phase 4: phần phản hồi đã được viết sẵn trong
`style.css` và đã được `GameEngine` bắn ra, nhưng chưa hề được nối dây.

---

## 4b. Hai bẫy đồng bộ DOM ↔ Engine (bắt buộc thử tay)

Hai lỗi này **đã có sẵn trong bản gốc**, nhưng P4 và P6 nới rộng cửa sổ xảy ra
nên phải thử lại sau khi làm hai phase đó.

### 4b.1. Tap nhanh trong lúc animation (sau Phase 4)

1. Dựng một hộp nguồn có **3 món khác nhau**, ví dụ `[🍎, 🍎, 🌏]`.
2. Tap món ở ô 0, tap hộp đích để chuyển.
3. **Trong lúc món đang bay** (~390ms), tap ngay ô đang hiện 🍎 ở hộp nguồn.

| | Kết quả |
|---|---|
| ❌ Chưa vá | Ô được chọn nhấp nháy ở vị trí khác cái vừa chạm, hoặc chọn trúng 🌏 |
| ✅ Đã vá | Tap bị bỏ qua hoàn toàn, không có gì được chọn |

Sau đó **bắt buộc** kiểm tra không bị khoá cứng: chờ animation xong, tap lại phải
chọn được bình thường. Nếu game đơ ⇒ cờ `_animating` bị bỏ sót ở một đường thoát,
xem [P4 §1.2](P4-feedback.md).

Lặp lại đúng phép thử trên với nước đi làm hộp **wrapped** (cửa sổ 800ms, dễ tái hiện hơn).

### 4b.2. Sang màn mới với cùng số hộp (sau Phase 6 §3.2)

Chỉ áp dụng nếu đã làm bước tuỳ chọn §3.2. Bỏ qua nếu chỉ làm §3.1.

1. Thắng một màn, bấm sang màn tiếp theo.
2. Tìm hai màn liền nhau có **cùng số hộp** (nếu không có, sửa tạm level data để thử).
3. Ở màn mới, tap từng ô của từng hộp.

| | Kết quả |
|---|---|
| ❌ Chưa vá | Tap vào ô trống lại bị coi là có món, hoặc ngược lại |
| ✅ Đã vá | Lưới được dựng lại hoàn toàn, mọi tap đúng |

Bằng chứng trong code: điều kiện `needRebuild` **phải** so cả danh sách `boxId`,
không được rút gọn còn phép so số lượng — xem [P6 §3.2](P6-hieu-nang.md).

### 4b.3. Điều **không** phải lỗi

Overlay thắng/thua hiện **trước** khi lưới hộp cập nhật (150ms, hoặc 800ms ở nhánh
wrapped). Đây là hành vi có sẵn của bản gốc, do `checkConditions()` chạy đồng bộ ở
cuối `selectTarget()`. `requestAnimationFrame` của [P6 §3.1](P6-hieu-nang.md) chỉ
thêm ≤16ms vào khoảng đó. **Không sửa** — sửa là đổi cảm giác game.

---

## 5. Kiểm tra trên điện thoại thật

Bắt buộc phải là máy thật, không phải chế độ giả lập của DevTools.

- [ ] Chép đúng **một** file `FactorySort_Standalone.html` sang máy, mở bằng trình
      duyệt → game chạy đủ, không thiếu ảnh, **không cần mạng** (bật chế độ máy bay để thử).
- [ ] Xoay dọc: toàn bộ băng chuyền + lưới hộp nằm gọn trong màn hình,
      **không** phải cuộn, **không** có thanh cuộn ngang.
- [ ] Máy có tai thỏ / thanh gạt dưới: không có phần tử nào bị che.
- [ ] Nhấp đúp vào hộp: trang **không** phóng to.
- [ ] Kéo hộp ra ngoài mép màn hình rồi thả: hộp về chỗ cũ, không kẹt trạng thái kéo.
- [ ] Kéo xong, thả tay: **không** có ô nào bị chọn ngoài ý muốn (lỗi "chạm ma" — Phase 5 §2).
- [ ] Ảo ảnh khi kéo nằm ngay dưới ngón tay, không nhảy giật lúc thả.
- [ ] Băng chuyền quay mượt, không giật khi có 4 khay.
- [ ] Thắng màn, để yên overlay 1 phút: máy không nóng lên (Phase 6 §1).

---

## 6. Nếu phải quay lui

```bash
git log --oneline
git revert <hash-cua-phase-hong>
node tools/build.mjs
```
Vì mỗi phase là một commit độc lập và không phase nào đụng vào `src/core/`,
việc quay lui một phase không kéo theo phase khác.

Ngoại lệ duy nhất cần nhớ:
- **Phase 6 §2.2** (chuyển sang `transform`) phụ thuộc Phase 3. Revert Phase 3 thì
  phải revert cả Phase 6 §2.2.
- **Phase 5 §1.1** (ép kích thước px cho ảo ảnh kéo) tồn tại chính là để đỡ cho
  Phase 2. Đừng revert riêng nó nếu Phase 2 còn.

---

## 7. Tổng kết 6 phase

| Phase | Nội dung | Đổi luật chơi |
|---|---|---|
| [P1](P1-standalone-offline.md) | Gói thành một file chạy offline | 0% |
| [P2](P2-khung-hinh-mobile.md) | Khung hình vừa màn hình điện thoại | 0% |
| [P3](P3-conveyor.md) | Băng chuyền: quỹ đạo, chiều sâu, viền sáng | 0% |
| [P4](P4-feedback.md) | Nối dây phản hồi đã viết sẵn nhưng chưa dùng | 0% |
| [P5](P5-cham-keo.md) | Chạm & kéo chính xác trên màn cảm ứng | 0% |
| [P6](P6-hieu-nang.md) | Hiệu năng: vòng lặp, reflow, vẽ lại | 0% |

Không phase nào thêm cơ chế mới. Tất cả chỉ làm cho những gì game gốc **đã có**
hiển thị đúng, phản hồi đúng và chạy mượt trên điện thoại.
