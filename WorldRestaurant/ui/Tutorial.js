import { GameRules, DIRECTIONS } from '../engine/GameRules.js';
import { IsometricRenderer } from '../renderer/IsometricRenderer.js';

// Khung ẩn lớn để render bàn cờ ở kích thước thoải mái trước khi cắt cận cảnh.
const CAPTURE_W = 900;
const CAPTURE_H = 700;
// Kích thước ảnh cuối cùng đưa vào 3 thẻ img.step-img.
const STEP_W = 480;
const STEP_H = 360;
const STEP_COUNT = 3;
// Lề quanh bàn cờ khi cắt (theo cellSize) để không đụng sát mép tile.
const MARGIN_CELLS = 0.15;
// Hệ số chiều cao mỗi tầng (khớp floorH = cellSize * 0.25).
const ROOF_FACTOR = 0.25;
// Độ dày đế bàn (chân đế hình thoi) cộng thêm ở mép dưới.
const BASE_DEPTH_CELLS = 0.35;
// Mái + huy hiệu số tầng ở đỉnh toà nhà, cộng thêm ở mép trên.
const ROOF_CAP_CELLS = 0.45;

/**
 * Đẩy mọi toà nhà về đúng vị trí đích (bỏ qua tween) để vẽ được ngay trong
 * một frame, không phụ thuộc requestAnimationFrame.
 */
function snapVisualsToTargets(renderer) {
    const visuals = renderer ? renderer.visualRestaurants : null;
    if (!visuals || typeof visuals.values !== 'function') return;

    for (const vis of visuals.values()) {
        if (!vis) continue;
        if (vis.targetX !== undefined) vis.x = vis.targetX;
        if (vis.targetY !== undefined) vis.y = vis.targetY;
        if (vis.targetFloors !== undefined) vis.floors = vis.targetFloors;
        // startTime rất âm để nếu animationLoop có chạy cũng coi như tween xong.
        vis.startTime = -1e9;
    }
}

/**
 * Hướng dẫn tương tác cho Level 1:
 *  - Hiện bàn tay chỉ hướng đi ngay khi vào màn.
 *  - Chụp sẵn 3 ảnh trạng thái bàn cờ (ban đầu, sau RIGHT, sau RIGHT nữa).
 *  - Khi người chơi đi nước đầu tiên: ẩn tay + tip, mở bảng 3 ảnh một lần duy nhất.
 *  - Bấm OK: đóng bảng, tutorial kết thúc.
 *
 * Mọi phần tử DOM đều có thể không tồn tại (HTML do phần khác chèn vào),
 * nên toàn bộ truy cập đều qua hàm có kiểm tra null.
 */
export class Tutorial {
    constructor(app) {
        this.app = app;

        this.active = false;
        this.cancelled = false;
        this.stepsOpen = false;
        this.stepsShown = false;
        this.handTimer = null;
        this.generation = 0;
        this.okBound = false;

        // Trạng thái bàn cờ lúc bắt đầu + ảnh chụp sẵn cho 3 bước.
        this.startState = null;
        this.stepImages = [];
        this.capturePromise = null;

        this._onResize = () => this.updateHandPosition();
        window.addEventListener('resize', this._onResize);

        this.bindOkButton();
    }

    /** Chặn nước đi khi bảng 3 bước đang mở. */
    get isBlocking() {
        return this.stepsOpen;
    }

    /** Bắt đầu hướng dẫn — chỉ chạy ở level 1 và khi splash đã ẩn. */
    start() {
        this.stop();

        // Splash còn che thì chưa chạy: tay và bảng bước sẽ nằm sau tấm phủ.
        const splash = this._el('splash-screen');
        if (splash && !splash.classList.contains('hidden')) return;

        const state = this.app ? this.app.state : null;
        if (!state) return;
        if (parseInt(state.id, 10) !== 1) return;

        this.active = true;
        this.cancelled = false;
        this.stepsOpen = false;
        this.stepsShown = false;
        this.stepImages = [];
        this.startState = typeof state.clone === 'function' ? state.clone() : state;

        // Hiện tay trước rồi mới đo vị trí: updateHandPosition thoát sớm khi tay
        // còn class 'hidden' nên --hx0/--hy0/--hx1/--hy1 sẽ không được đặt.
        this._show(this._el('tutorial-hand'));
        this._show(this._el('tutorial-tip'));
        this.updateHandPosition();
        this.bindOkButton();

        this.clearTimer();

        // Chụp sẵn 3 ảnh ngay từ đầu (chưa hiện bảng) để lúc người chơi đi nước
        // đầu tiên là có ảnh dùng được ngay; nếu chưa xong thì onMove sẽ await.
        const gen = this.generation;
        this.capturePromise = this.captureSteps(gen)
            .then(images => {
                if (gen === this.generation && !this.cancelled) this.stepImages = images;
                return images;
            })
            .catch(() => []);
    }

    /** Dừng hẳn (đổi màn): ẩn tay, tip, bảng bước và huỷ timer. */
    stop() {
        this.generation++;
        this.active = false;
        this.cancelled = true;
        this.stepsOpen = false;
        this.clearTimer();
        this.stepImages = [];
        this.capturePromise = null;
        this.startState = null;
        this._hide(this._el('tutorial-hand'));
        this._hide(this._el('tutorial-tip'));
        this.hideSteps();
    }

    /**
     * Người chơi đã đi nước đầu tiên: ẩn tay + tip rồi mở bảng 3 bước.
     * Bảng chỉ hiện đúng một lần mỗi lần vào level 1; các nước đi sau không làm gì.
     */
    onMove() {
        if (!this.active || this.cancelled || this.stepsShown) return;

        this._hide(this._el('tutorial-hand'));
        this._hide(this._el('tutorial-tip'));
        this.stepsShown = true;

        const gen = this.generation;
        const pending = this.capturePromise;
        if (pending && typeof pending.then === 'function') {
            // Ảnh chưa chụp xong thì chờ, nhưng vẫn phải kiểm tra còn hiệu lực.
            pending.then(() => {
                if (gen !== this.generation || this.cancelled || !this.active) return;
                return this.showSteps();
            }).catch(() => {});
            return;
        }

        Promise.resolve(this.showSteps()).catch(() => {});
    }

    /** Cập nhật lại vị trí tay khi cửa sổ đổi kích thước. */
    updateHandPosition() {
        if (!this.active) return;
        const hand = this._el('tutorial-hand');
        if (!hand || hand.classList.contains('hidden')) return;

        const path = this.computeHandPath();
        if (!path) return;

        hand.style.setProperty('--hx0', `${path.from.x}px`);
        hand.style.setProperty('--hy0', `${path.from.y}px`);
        hand.style.setProperty('--hx1', `${path.to.x}px`);
        hand.style.setProperty('--hy1', `${path.to.y}px`);
    }

    /**
     * Toạ độ tay so với #game-container: điểm bắt đầu là tâm ô của toà đầu tiên,
     * điểm kết thúc là ô cách nó +2 theo trục x (ô vàng của level 1).
     */
    computeHandPath() {
        const app = this.app;
        const state = app ? app.state : null;
        const renderer = app ? app.renderer : null;
        if (!state || !renderer || typeof renderer.getScreenCoords !== 'function') return null;

        const restaurants = state.restaurants || [];
        const first = restaurants[0];
        if (!first) return null;

        let p0;
        let p1;
        try {
            p0 = renderer.getScreenCoords(first.x, first.y);
            p1 = renderer.getScreenCoords(first.x + 2, first.y);
        } catch (err) {
            return null;
        }
        if (!p0 || !p1) return null;

        // getScreenCoords trả toạ độ CSS trong canvas; cộng offset canvas so với container.
        let offsetX = 0;
        let offsetY = 0;
        const canvas = renderer.canvas || this._el('game-canvas');
        const container = this._el('game-container');
        if (canvas && container && canvas.getBoundingClientRect && container.getBoundingClientRect) {
            const cRect = canvas.getBoundingClientRect();
            const kRect = container.getBoundingClientRect();
            offsetX = cRect.left - kRect.left;
            offsetY = cRect.top - kRect.top;
        }

        return {
            from: { x: p0.x + offsetX, y: p0.y + offsetY },
            to: { x: p1.x + offsetX, y: p1.y + offsetY }
        };
    }

    /**
     * Mở bảng #tutorial-steps với 3 ảnh đã chụp sẵn (chụp bù nếu vì lý do nào đó
     * this.stepImages còn rỗng).
     */
    async showSteps() {
        if (!this.active || this.cancelled || this.stepsOpen) return;

        const stepsEl = this._el('tutorial-steps');
        if (!stepsEl) return;

        const imgs = stepsEl.querySelectorAll('img.step-img');
        if (!imgs || imgs.length === 0) return;

        this.stepsOpen = true;
        const gen = this.generation;

        let images = this.stepImages;
        if (!images || images.length === 0) {
            images = await this.captureSteps(gen);
            if (gen !== this.generation || this.cancelled) {
                this.stepsOpen = false;
                return;
            }
            this.stepImages = images;
        }

        if (gen !== this.generation || this.cancelled) {
            this.stepsOpen = false;
            return;
        }

        const count = Math.min(images.length, imgs.length, STEP_COUNT);
        for (let i = 0; i < count; i++) {
            if (images[i]) imgs[i].src = images[i];
        }

        stepsEl.classList.remove('hidden');
        // Ép reflow để transition của class 'show' chạy lại từ đầu.
        void stepsEl.offsetWidth;
        stepsEl.classList.add('show');
        this.bindOkButton();
    }

    /** Ẩn bảng 3 bước. */
    hideSteps() {
        this.stepsOpen = false;
        const stepsEl = this._el('tutorial-steps');
        if (!stepsEl) return;
        stepsEl.classList.remove('show');
        stepsEl.classList.add('hidden');
    }

    /**
     * Chụp 3 trạng thái bàn cờ và trả về mảng dataURL.
     *
     * Ảnh nhỏ vì renderer chừa lề lớn (HUD trên, điều khiển dưới, đảo trang trí).
     * Nên: render vào khung ẩn 900x700 với decor tắt, ép vẽ đồng bộ, rồi tự cắt
     * đúng hình bao của bàn chơi và vẽ vào canvas đích 480x360 (contain, canh giữa).
     * Cả 3 ảnh dùng chung một vùng cắt (hợp của 3 hình bao) nên khớp vị trí nhau.
     */
    async captureSteps(gen) {
        const states = this.buildStepStates();
        if (states.length === 0) return [];

        const holder = document.createElement('div');
        holder.style.position = 'fixed';
        holder.style.left = '-10000px';
        holder.style.top = '0';
        holder.style.width = `${CAPTURE_W}px`;
        holder.style.height = `${CAPTURE_H}px`;
        holder.style.overflow = 'hidden';
        holder.style.pointerEvents = 'none';

        const canvas = document.createElement('canvas');
        holder.appendChild(canvas);
        document.body.appendChild(holder);

        const images = [];
        // Vùng cắt chung cho cả 3 ảnh, tích luỹ dần thành hợp của 3 hình bao.
        const region = {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity
        };
        let renderer = null;
        try {
            renderer = new IsometricRenderer(canvas, holder);
            // Tắt trang trí khi chụp ảnh để bàn cờ chiếm nhiều khung hơn.
            if (typeof renderer.setDecorEnabled === 'function') {
                renderer.setDecorEnabled(false);
            }

            const count = Math.min(states.length, STEP_COUNT);

            // Lượt 1 chỉ đo: render từng state để lấy hình bao, chưa cắt. Phải
            // đo hết cả 3 rồi mới cắt được, vì cả 3 ảnh dùng chung một vùng cắt
            // (hợp của 3 hình bao) để khớp vị trí khi so sánh.
            for (let i = 0; i < count; i++) {
                if (gen !== this.generation || this.cancelled) break;
                this.renderState(renderer, states[i]);
                if (gen !== this.generation || this.cancelled) break;
                this.expandRegion(region, renderer, states[i]);
            }

            // Lượt 2: render lại từng state rồi cắt ngay bằng vùng cắt chung, vì
            // chỉ có một canvas nguồn và nó bị ghi đè ở mỗi lần render.
            for (let i = 0; i < count; i++) {
                if (gen !== this.generation || this.cancelled) break;
                this.renderState(renderer, states[i]);
                if (gen !== this.generation || this.cancelled) break;
                images.push(this.drawRegion(renderer, canvas, region));
            }
        } catch (err) {
            // Không chụp được ảnh thì trả về những gì đã có — không ném lỗi.
        } finally {
            if (renderer) {
                // Tắt decor để vòng lặp mây dừng trước khi gỡ div.
                if (typeof renderer.setDecorEnabled === 'function') {
                    renderer.setDecorEnabled(false);
                }
                if (typeof renderer.stopCloudLoop === 'function') {
                    renderer.stopCloudLoop();
                }
            }
            if (holder.parentNode) holder.parentNode.removeChild(holder);
        }

        return images;
    }

    /**
     * Vẽ một state lên canvas nguồn một cách đồng bộ, không phụ thuộc rAF.
     */
    renderState(renderer, state) {
        if (!renderer) return;
        // Chặn renderer tự xếp rAF: nếu rAF bị trình duyệt hoãn (tab nền,
        // khung bị ẩn) thì canvas sẽ trắng khi chụp.
        renderer.isAnimating = true;
        renderer.render(state);
        snapVisualsToTargets(renderer);
        if (typeof renderer.drawFrame === 'function') {
            renderer.drawFrame();
        }
    }

    /**
     * Mở rộng vùng cắt chung bằng hình bao bàn chơi của một state.
     *
     * Hình bao lấy theo MÉP NGOÀI các ô, không phải tâm ô: mép trái/phải/trên/dưới
     * của hình thoi bàn = tâm ô góc ± nửa ô. Cụ thể 4 đỉnh của hình thoi bàn:
     *   - trên  : getScreenCoords(0, 0)      lùi lên  cellSize/4
     *   - phải  : getScreenCoords(W-1, 0)    sang phải cellSize/2
     *   - dưới  : getScreenCoords(W-1, H-1)  xuống    cellSize/4
     *   - trái  : getScreenCoords(0, H-1)    sang trái cellSize/2
     *
     * Lề: 0.15*cell mỗi phía; mép dưới cộng thêm độ dày đế bàn (0.35*cell).
     * Mép trên chỉ mở thêm đúng chiều cao thật của toà cao nhất trong state
     * (maxFloors * cell*0.25 + 0.45*cell cho mái + huy hiệu) và chỉ khi đỉnh toà
     * vượt lên trên đỉnh bàn; nếu không thì giữ nguyên đỉnh bàn.
     */
    expandRegion(region, renderer, state) {
        if (!renderer || typeof renderer.getScreenCoords !== 'function') return;

        const cell = renderer.cellSize || 56;
        const W = Math.max(1, state.width || 1);
        const H = Math.max(1, state.height || 1);

        let top = renderer.getScreenCoords(0, 0);
        let right = renderer.getScreenCoords(W - 1, 0);
        let bottom = renderer.getScreenCoords(W - 1, H - 1);
        let left = renderer.getScreenCoords(0, H - 1);
        if (!top || !right || !bottom || !left) return;

        const margin = cell * MARGIN_CELLS;

        const boardLeft = left.x - cell / 2;
        const boardRight = right.x + cell / 2;
        const boardTop = top.y - cell / 4;
        const boardBottom = bottom.y + cell / 4;

        // Đỉnh toà nhà: mỗi tầng cao cell*0.25, cộng mái + huy hiệu số tầng.
        let maxFloors = 0;
        if (state.restaurants && state.restaurants.length > 0) {
            for (const r of state.restaurants) {
                if (r && r.floors > maxFloors) maxFloors = r.floors;
            }
        }

        let cropTop = boardTop - margin;
        if (maxFloors > 0) {
            const towerTop = boardTop
                - maxFloors * cell * ROOF_FACTOR
                - cell * ROOF_CAP_CELLS;
            if (towerTop < boardTop) cropTop = towerTop - margin;
        }

        const cropLeft = boardLeft - cell * MARGIN_CELLS - margin;
        const cropRight = boardRight + cell * MARGIN_CELLS + margin;
        const cropBottom = boardBottom + cell * BASE_DEPTH_CELLS + margin;

        if (cropLeft < region.minX) region.minX = cropLeft;
        if (cropRight > region.maxX) region.maxX = cropRight;
        if (cropTop < region.minY) region.minY = cropTop;
        if (cropBottom > region.maxY) region.maxY = cropBottom;
    }

    /**
     * Vẽ vùng cắt chung từ canvas nguồn vào canvas đích STEP_W x STEP_H kiểu
     * contain, canh giữa cả hai chiều. Toạ độ getScreenCoords là px CSS, còn
     * canvas thật đã nhân dpr nên phải quy đổi.
     */
    drawRegion(renderer, sourceCanvas, region) {
        const { minX, maxX, minY, maxY } = region;
        if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
            return '';
        }
        if (!(maxX > minX) || !(maxY > minY)) return '';

        const viewW = renderer.viewW || CAPTURE_W;
        const viewH = renderer.viewH || CAPTURE_H;
        const scaleX = viewW > 0 ? sourceCanvas.width / viewW : 1;
        const scaleY = viewH > 0 ? sourceCanvas.height / viewH : 1;

        const srcX = minX * scaleX;
        const srcY = minY * scaleY;
        const srcW = (maxX - minX) * scaleX;
        const srcH = (maxY - minY) * scaleY;
        if (!(srcW > 0) || !(srcH > 0)) return '';

        const out = document.createElement('canvas');
        out.width = STEP_W;
        out.height = STEP_H;
        const ctx = out.getContext('2d');
        if (!ctx) return '';

        // Contain: giữ tỉ lệ, canh giữa, nền trong suốt.
        const scale = Math.min(STEP_W / srcW, STEP_H / srcH);
        const dstW = srcW * scale;
        const dstH = srcH * scale;
        const dstX = (STEP_W - dstW) / 2;
        const dstY = (STEP_H - dstH) / 2;

        // Nếu vùng cắt vượt ra ngoài canvas nguồn thì kẹp lại, đồng thời dịch
        // điểm vẽ tương ứng để ảnh không bị co lệch.
        const clipL = Math.max(0, srcX);
        const clipT = Math.max(0, srcY);
        const clipR = Math.min(sourceCanvas.width, srcX + srcW);
        const clipB = Math.min(sourceCanvas.height, srcY + srcH);
        if (!(clipR > clipL) || !(clipB > clipT)) return '';

        const offX = (clipL - srcX) * scale;
        const offY = (clipT - srcY) * scale;
        const clipW = clipR - clipL;
        const clipH = clipB - clipT;

        ctx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
            sourceCanvas,
            clipL, clipT, clipW, clipH,
            dstX + offX, dstY + offY, clipW * scale, clipH * scale
        );

        try {
            return out.toDataURL('image/png');
        } catch (err) {
            return '';
        }
    }

    /** Trạng thái cho 3 bước: ban đầu, sau RIGHT, sau RIGHT nữa. */
    buildStepStates() {
        // Ưu tiên trạng thái lúc bắt đầu tutorial để ảnh khớp với lúc mở bảng.
        const base = this.startState || (this.app ? this.app.state : null);
        const states = [];
        if (!base) return states;

        let current = typeof base.clone === 'function' ? base.clone() : base;
        states.push(current);

        for (let i = 1; i < STEP_COUNT; i++) {
            const result = GameRules.applyMove(current, DIRECTIONS.RIGHT);
            if (!result || !result.newState) break;
            current = result.newState;
            states.push(current);
        }

        return states;
    }

    /** Bấm OK: đóng bảng và kết thúc tutorial (không hiện lại tay). */
    bindOkButton() {
        if (this.okBound) return;
        const btn = this._el('btn-steps-ok');
        if (!btn) return;
        btn.addEventListener('click', () => {
            this.hideSteps();
            this.cancelled = true;
            this.active = false;
            this.clearTimer();
            this._hide(this._el('tutorial-hand'));
            this._hide(this._el('tutorial-tip'));
        });
        this.okBound = true;
    }

    clearTimer() {
        if (this.handTimer) {
            clearTimeout(this.handTimer);
            this.handTimer = null;
        }
    }

    _el(id) {
        return document.getElementById(id);
    }

    _show(el) {
        if (el) el.classList.remove('hidden');
    }

    _hide(el) {
        if (el) el.classList.add('hidden');
    }
}
