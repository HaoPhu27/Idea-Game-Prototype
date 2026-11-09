# Factory Sort — Blocker implementation plan

Status: implementation started 2026-11-09. Owner: ChatGPT reviews/integrates/tests; River and Lite write code. Stop all work at Codex 5h usedPercent >= 50 (user override of AGENTS 60%). Initial usage 9%.

## Rules and reasons
- Locked Box: cannot take/place/dispatch until N real shipments OR a named box is shipped. A displayed dependency must resolve; validation rejects missing/self/cyclic dependencies.
- Frozen Item: countdown begins on becoming visible after play starts; item cannot move until thawed. Countdown follows the item if necessary (normally cannot move before thaw). Expiry thaws, never destroys items or loses the level.
- Stuck Box: sealed board obstacle released and removed after a displayed real-shipment condition. Contains zero items and creates no order; preserve its slot during initial empty-box cleanup. No random rescue.
- Defective Box: normal sorting, but on queue entry a hold timer prevents dispatch for N seconds. Occupies exactly one queue slot. Distinct from a stuck board obstacle.
- Connector Box: pair of real boxes retained on board until both are wrapped, then enter queue together atomically with capacity checks. No half-pair dispatch or direct-drag bypass. Start with ordinary paired boxes; stuck+eating variant deferred until independently validated.
- Hidden Box: contents unavailable until box reaches column index 0, reveal permanently. No emoji, category, logo, title, CSS-art or peek leaks.
- Hidden Item: at most one masked slot per itemId; behaves as the real item for legal sorting. Show a deduction clue identifying which item type is missing from the visible pair/order inventory; reveal permanently on matching triple. Never random guessing.
- Urgent Box: countdown starts when visible after first player action, succeeds on queue entry (not conveyor delivery). Expiry loses with a specific reason. Generous authored budget independent of global timer.
- Freeze Time affects global level clock only; local blocker timers continue. Help/hidden tab pauses both by withholding advanceClock. Defective timers continue during automatic delivery-only phase.
- Extra Tray remains 5 -> 6. Shuffle/Remove must not rely on the old blocker-unaware solver. Conservatively reject with an explicit message while blocker restrictions exist; permit after cleared. No silent invariant break or fake solvability proof. Extension to blocker-aware mutation search is a separate bounded milestone.

## Schema and shared contract
Top-level level.blockers array, one record per box: {boxId, locked?:{shipCount?|boxId?}, stuck?:{shipCount?|boxId?}, frozen?:[{slot,seconds}], defective?:{seconds}, connector?:{group}, hiddenBox?:true, hiddenItems?:[slot], urgent?:{seconds}}.
Engine API getBlockerView(boxId) -> {badges:string[],concealed:boolean,hiddenSlots:number[],frozenSlots:number[],blocked:boolean,queueHeld:boolean}; canMoveBlockerItem(boxId,slot); canDispatchBlockerBox(boxId); onBlockerUpdated optional event; lastBlockerError specific denial reason. No blocker metadata on normal levels, no change to normal behavior.
Validate before replacing current level: IDs, slots, finite positive durations, groups exactly two, incompatible combinations, dependencies and item-count/order invariant. Preserve canonical numeric IDs across DOM string input.

## Execution tasks
### River B1 — core rules (independent module + minimal engine/build edits)
Implement schema validation, lifecycle guards on every engine entry point, timer event splitting, atomic connector queue admission, true shipped IDs, terminal/reset isolation. Use common guards for select/move/validTargets/direct drag/auto queue dispatch/boosters/checkConditions. No timer stalls reported as deadlock. Empty Stuck boxes survive startup and cannot accidentally win. No metadata mutation of config.
### River B2 — authored levels and replay verification
Create eight reproducible playable scenarios from known valid item/tray sets, explicit action traces including waits; replay on the real GameEngine, including UI-style delayed callbacks where feasible. Expose scenario config API without altering normal campaign generator guarantees. Reject unverified custom blocker layouts instead of calling ordinary solver proof sufficient.
### Lite B3 — UI
Render distinct compact badges, numbered dependencies/linked partner, visible local seconds, ice overlay, sealed cover, question mark and explicit deduction clues. Cream/paper/wood reference theme, icons + text, not color only. Mask all content channels for hidden boxes/items including peeks and drag ghosts. Wire engine event to coalesced render, enforce drag start guards and dispatch guards before flight. Accessible scenario chooser available from help/level controls, retry repeats scenario. Normal campaign remains usable. No per-frame full-board redraw.
### Lite B4 — regression tests authored from coordinator cases
Code tests for denial paths, each mechanic, startup/reset, timers while global frozen, pause via no tick, hidden activation, defective-only waiting, connector capacity 5/6, dependency cycles, booster atomic refusal, matching count invariants, real-engine replay and UI concealment. Tests run/reviewed by ChatGPT, never claimed run by workers.

## Acceptance / verification performed by primary
1. Establish baseline tests/build; inherited feedback parity WIP may have separate known failing optional test (see FACTORY_SORT_HANDOFF.md).
2. Read every returned worker diff; strict path allowlist; never accept worker claims of test execution.
3. Exercise each mechanic through real engine, generated scenario trace and delayed UI flows. Assert exact item/order conservation, no illegal direct-drag bypass, terminal and restart isolation.
4. Run existing generator/booster/UI tests plus blocker regression suite and build standalone. Browser inspect desktop/mobile if tools permit. Record limitations honestly.
5. Update GDD and progress, commit only task paths and push main. Pages currently tracks master: verify settings/deployment rather than assume main publishes.

## Open / deferred scope
Old feedback parity WIP is not automatically accepted by this blocker task. The connector stuck+eating variant and unconstrained random combinations require separate proofs. Authored scenarios are the initial playable rollout; no random blocker injection into 50 verified campaign seeds. Any incomplete tasks must stay explicitly marked before stop/handoff.

## Primary review checklist (before acceptance)
- Existing UI `_drainQueueFlights` animates/hides a single wrapped box BEFORE calling moveBoxToQueue. For connector held on board, denial must restore visibility and busy state, and not falsely lose when pair capacity insufficient. Need group-aware admission/flight: no first box disappear while partner incomplete; dispatch guards alone insufficient. Distinguish queue dispatch guard from board queue admission: add canQueueBlockerBox(boxId) if needed, core/UI agree. When admission sends both boxes, second stale animation must be discarded. Empty space insufficient for pair should wait only if queue can genuinely clear; otherwise report real deadlock.
- Auto pickup uses tray.canAccept independently of engine. UI must consult engine canDispatch before animating. Core findQueueMatch and deadlock queueCanDeliver must not count held defects as deliverable, but finite defect hold counts as future progress.
- Core moveBoxToQueue headless fast path bypasses deliverQueueBox. Shipment bookkeeping must count actual successful tray acceptance exactly once regardless path and callbacks. Removing tray is not a shipment.
- Concealed Hidden Box peek may be rendered through _createBox then manual slot fill in _syncPeekBox. Inspect both code paths, never just normal _updateBox. Hidden Item can be carried, so masking must follow item to new slot rather than stay at old coordinate, or reveal rule must explicitly be changed and documented. Type+one-hidden token persistent mapping required.
- Initial callback setGameState(PLAYING) runs before startLevel returns: initialize rule state before callbacks; no old-level views briefly displayed.
- Urgent expiry at 0 must not lose when an admission already committed that frame. Timers start only when clock started AND box visible; no charge for time before a hidden box becomes visible. Frozen/urgent local dt must not receive retroactive elapsed time on activation.
- Explicitly reject invalid metadata / absent IDs / NaN / duplicate slot / connector size !=2 / named dependency cycle / all-zero item inventory with orders. Validate no empty blocker can disappear in startup cleanup. Clone ignores blocker state: snapshots must not claim proof for active blockers.
- Local timers must advance while global time null or only queue left, preserve global freeze30 semantics, pause on modal no-tick, reset and terminal freeze all updates.
- Cannot leave empty stuck obstacle after final tray causing unwinnable board; shipment release resolves before win check. No phantom orders for stuck slots.

## Quy tắc nghiệm thu và các quyết định thiết kế

| Cơ chế | Điều kiện kích hoạt/kết thúc | Dấu hiệu phải hiện trên UI |
|---|---|---|
| Locked Box | Giao đủ số kiện hoặc giao đúng box được chỉ định; chỉ giao thật mới tính | Số kiện còn thiếu hoặc mã box cần giao |
| Frozen Item | Bắt đầu đếm khi item lộ ra và người chơi bắt đầu chơi; hết giờ tan băng | Lớp băng, số giây còn lại trên item/box |
| Stuck Box | Box rỗng đóng nắp chiếm vị trí; giao đủ điều kiện thì thu đi | Điều kiện thu box, không hiển thị đơn hàng giả |
| Defective Box | Gom bình thường; vào queue bị giữ N giây rồi mới giao được | Dấu lỗi và số giây giữ chỗ trên queue |
| Connector Box | Cả hai box phải gom xong; cần đủ hai chỗ queue, chuyển cả cặp nguyên tử | Mã box đối tác, trạng thái đang chờ đối tác/chỗ trống |
| Hidden Box | Chỉ mở khi đến vị trí index 0 của cột; đã mở thì không giấu lại | Nắp kín, không lộ ảnh/item/category qua peek hay tooltip |
| Hidden Item | Một item ẩn tối đa mỗi loại; dấu ? đi theo item, hiện khi tạo triple | Dấu ? và manh mối suy luận, không lộ ảnh khi kéo |
| Urgent Box | Đếm khi box lộ ra sau lúc bắt đầu chơi; vào queue đúng hạn là hoàn tất | Số giây, thông báo hết hạn riêng nếu chưa vào queue |

Các bộ đếm cục bộ vẫn chạy khi dùng Freeze Time vì booster này chỉ dừng global timer. Mở trợ giúp hoặc ẩn tab thì tất cả cùng dừng. Không dùng đồng hồ hệ điều hành/setTimeout cho luật gameplay để tránh callback cũ khi retry.

Một số ý tưởng ban đầu cần điều chỉnh có chủ đích: Frozen hết giờ sẽ tan thay vì mất item; Stuck không thu ngẫu nhiên; Defective gây tắc queue thay vì tắc cột; Urgent hoàn thành ở queue để không phụ thuộc vị trí tray đang quay. Biến thể Connector kéo một thùng kẹt chưa thuộc đợt đầu vì cần thêm chứng nhận riêng về số slot/số bộ.

## Kết nối workers
- River đã nhận core/rules, màn mẫu, UI và test theo kế hoạch của agent chính.
- Lite đã được giao UI; key cũ hết hiệu lực, đã cập nhật key người dùng cung cấp ở cấu hình cục bộ ngoài repository. Key mới xác thực nhưng máy chủ Lite trả lỗi kể cả yêu cầu một dòng. Không đưa key hoặc cấu hình bí mật vào git.
- Đợt River đầu bị từ chối ở bước review (sai matching, admission cặp, urgent). Chưa tích hợp các bản bị từ chối. Các output/prompt trung gian nằm trong thư mục .ai-logs bị gitignore.
- Kiểm tra nền trước thay đổi: npm test, npm run build, nonblocking-feedback-test, item-art-test đều pass. Các lỗi feedback WIP riêng vẫn được theo dõi trong FACTORY_SORT_HANDOFF.md.

## Cập nhật yêu cầu nhánh (2026-11-09)
Người dùng yêu cầu tạo nhánh `new-mechanic` để commit/push, **chưa merge main**. Yêu cầu này thay thế bước triển khai trước đó: không cập nhật main/master hoặc GitHub Pages trong đợt blocker này. Kiểm thử/build vẫn bắt buộc trước khi commit thành phẩm. Tiến trình, mã và test blocker sẽ nằm trên nhánh mới.

## Bổ sung bắt buộc từ người dùng — 2026-11-09
**CẤM đưa mechanic vào level có sẵn.** Tạo mục riêng Mechanic Lab, gồm màn từng mechanic và sáu màn kết hợp. Không thay đổi configForLevelNumber, CuratedLevelSeeds hoặc nội dung campaign 1–50. Thêm kiểm tra snapshot campaign trước/sau để bảo đảm điều này.

| Tổ hợp | Tier đề xuất | Luật triển khai ban đầu |
|---|---|---|
| Locked + Key Box | Normal/Hard | Key Box là box ID thật; ship đúng box đó mở khóa, không phải vật phẩm chìa khóa mới |
| Sticky Item + One-Way Box | Hard | Hai item cùng itemId đi cùng nhau; cần đủ hai ô đích. One-Way chỉ nhận vào, không lấy ra; ghép triple vẫn ship bình thường |
| Hidden Box + Urgent Box | Hard | Box cấp bách bị che nội dung; timer bắt đầu khi box hiện trong vùng nhìn thấy và đã bắt đầu chơi, không đợi mở nắp; vào queue đúng hạn là thành công |
| Connector + Restricted Queue | Super Hard | Queue riêng màn mẫu chỉ có hai chỗ, vẫn nhận cả cặp nguyên tử; Extra Tray cộng một chỗ vào dung lượng riêng của màn |
| Frozen + Color-Changing Item | Super Hard | Sau tan băng có thời điểm đổi loại: hoán đổi nguyên tử hai token khác loại để bảo toàn tổng mỗi item và đơn hàng. Nếu token đã wrapped/ship thì hủy cả lần đổi, không đổi một nửa |
| Stuck + Priority Tray | Hard | Priority tray chỉ được giao sau khi giải phóng Stuck. Khi đã mở, ưu tiên hoàn thành tray đó trước đơn khác; trước khi mở vẫn cho giao kiện dùng để giải kẹt |

Tier trên là nhãn thiết kế theo yêu cầu, chưa phải kết quả cân bằng độ khó bằng người chơi. Mỗi màn kết hợp có referenceActions, kiểm tra invariant và replay trên engine thật; không coi solver cũ là chứng nhận cho luật mới.

### Task bổ sung
- River B5: module combo độc lập, luật sticky/one-way/queue/color/priority và sáu cấu hình riêng. Không sửa generator campaign. Chủ trì trực tiếp review các giao dịch nguyên tử và timer.
- River/Lite B6: mục Mechanic Lab có màn đơn và màn kết hợp, nhãn tier và mô tả; retry giữ màn mẫu, trở về campaign giữ nguyên số màn đang chơi. Lite hiện chưa thực thi được do máy chủ lỗi; River tiếp nhận phần coding theo điều phối.
- B7: kiểm thử combo, kiểm tra campaign không thay đổi, build riêng nhánh new-mechanic; không merge main/master/Pages.
