import { GameRules, DIRECTIONS } from '../engine/GameRules.js';
import { IsometricRenderer } from '../renderer/IsometricRenderer.js';

// Thời gian tay chỉ dẫn chạy 2 vòng trước khi mở bảng 3 bước.
const HAND_LOOP_MS = 3200;
// Chờ ngắn sau khi vẽ đồng bộ trước khi chụp ảnh canvas.
const TWEEN_SETTLE_MS = 0;
// Kích thước canvas ảnh thu nhỏ của 3 bước.
const STEP_W = 400;
const STEP_H = 300;
const STEP_COUNT = 3;

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
 * Hướng dẫn tương tác cho Level 1: bàn tay chỉ hướng đi + bảng 3 ảnh chụp
 * trạng thái bàn cờ sau từng nước.
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
        this.handTimer = null;
        this.generation = 0;
        this.okBound = false;

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
        const gen = this.generation;

        // Hiện tay trước rồi mới đo vị trí: updateHandPosition thoát sớm khi tay
        // còn class 'hidden' nên --hx0/--hy0/--hx1/--hy1 sẽ không được đặt.
        this._show(this._el('tutorial-hand'));
        this._show(this._el('tutorial-tip'));
        this.updateHandPosition();
        this.bindOkButton();

        this.clearTimer();
        this.handTimer = setTimeout(() => {
            this.handTimer = null;
            if (gen !== this.generation || this.cancelled || !this.active) return;
            this.showSteps();
        }, HAND_LOOP_MS);
    }

    /** Dừng hẳn (đổi màn): ẩn tay, tip, bảng bước và huỷ timer. */
    stop() {
        this.generation++;
        this.active = false;
        this.cancelled = true;
        this.stepsOpen = false;
        this.clearTimer();
        this._hide(this._el('tutorial-hand'));
        this._hide(this._el('tutorial-tip'));
        this.hideSteps();
    }

    /** Người chơi đã đi nước đầu: ẩn tay + tip, không mở bảng bước nữa. */
    onMove() {
        this.cancelled = true;
        this.clearTimer();
        this._hide(this._el('tutorial-hand'));
        this._hide(this._el('tutorial-tip'));
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
     * Chụp 3 trạng thái bàn cờ (ban đầu, sau RIGHT, sau RIGHT nữa) bằng renderer thật
     * vào 3 thẻ img.step-img rồi mở bảng #tutorial-steps.
     */
    async showSteps() {
        if (!this.active || this.cancelled || this.stepsOpen) return;

        const stepsEl = this._el('tutorial-steps');
        if (!stepsEl) return;

        const imgs = stepsEl.querySelectorAll('img.step-img');
        if (!imgs || imgs.length === 0) return;

        this.stepsOpen = true;
        const gen = this.generation;

        const states = this.buildStepStates();
        const holder = document.createElement('div');
        holder.style.position = 'fixed';
        holder.style.left = '-10000px';
        holder.style.top = '0';
        holder.style.width = `${STEP_W}px`;
        holder.style.height = `${STEP_H}px`;
        holder.style.overflow = 'hidden';
        holder.style.pointerEvents = 'none';

        const canvas = document.createElement('canvas');
        holder.appendChild(canvas);
        document.body.appendChild(holder);

        let renderer = null;
        try {
            renderer = new IsometricRenderer(canvas, holder);
            // Tắt trang trí khi chụp ảnh để bàn cờ chiếm nhiều khung hơn.
            if (typeof renderer.setDecorEnabled === 'function') {
                renderer.setDecorEnabled(false);
            }

            const count = Math.min(states.length, imgs.length, STEP_COUNT);
            for (let i = 0; i < count; i++) {
                if (gen !== this.generation || this.cancelled) break;

                // Chặn renderer tự xếp rAF: nếu rAF bị trình duyệt hoãn (tab nền,
                // khung bị ẩn) thì canvas sẽ trắng khi chụp.
                renderer.isAnimating = true;
                renderer.render(states[i]);
                snapVisualsToTargets(renderer);
                if (typeof renderer.drawFrame === 'function') {
                    renderer.drawFrame();
                }
                await this.wait(TWEEN_SETTLE_MS);

                if (gen !== this.generation || this.cancelled) break;

                let dataUrl = '';
                try {
                    dataUrl = canvas.toDataURL('image/png');
                } catch (err) {
                    dataUrl = '';
                }
                if (dataUrl) imgs[i].src = dataUrl;
            }
        } catch (err) {
            // Không chụp được ảnh thì vẫn mở bảng bước với ảnh trống — không ném lỗi.
        } finally {
            if (renderer) {
                if (typeof renderer.setDecorEnabled === 'function') {
                    // Tắt decor để vòng lặp mây dừng trước khi gỡ div.
                    renderer.setDecorEnabled(false);
                }
                if (typeof renderer.stopCloudLoop === 'function') {
                    renderer.stopCloudLoop();
                }
            }
            if (holder.parentNode) holder.parentNode.removeChild(holder);
        }

        if (gen !== this.generation || this.cancelled) {
            this.stepsOpen = false;
            return;
        }

        stepsEl.classList.remove('hidden');
        // Ép reflow để transition của class 'show' chạy lại từ đầu.
        void stepsEl.offsetWidth;
        stepsEl.classList.add('show');
        this.bindOkButton();
    }

    /** Ẩn bảng 3 bước; tay và tip vẫn hiện tới khi có nước đi đầu tiên. */
    hideSteps() {
        this.stepsOpen = false;
        const stepsEl = this._el('tutorial-steps');
        if (!stepsEl) return;
        stepsEl.classList.remove('show');
        stepsEl.classList.add('hidden');
    }

    buildStepStates() {
        const state = this.app ? this.app.state : null;
        const states = [];
        if (!state) return states;

        let current = state.clone();
        states.push(current);

        for (let i = 1; i < STEP_COUNT; i++) {
            const result = GameRules.applyMove(current, DIRECTIONS.RIGHT);
            if (!result || !result.newState) break;
            current = result.newState;
            states.push(current);
        }

        return states;
    }

    bindOkButton() {
        if (this.okBound) return;
        const btn = this._el('btn-steps-ok');
        if (!btn) return;
        btn.addEventListener('click', () => this.hideSteps());
        this.okBound = true;
    }

    clearTimer() {
        if (this.handTimer) {
            clearTimeout(this.handTimer);
            this.handTimer = null;
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
