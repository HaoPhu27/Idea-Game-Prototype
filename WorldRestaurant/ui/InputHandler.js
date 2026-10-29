import { DIRECTIONS } from '../engine/GameRules.js';

const DRAG_THRESHOLD = 24; // px trước khi được coi là kéo

export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {{
     *   onMove?: (dir: {x:number,y:number}) => void,
     *   onPreview?: (dirKey: 'UP'|'RIGHT'|'DOWN'|'LEFT'|null) => void,
     *   getArrowAt?: (clientX:number, clientY:number) => ('UP'|'RIGHT'|'DOWN'|'LEFT'|null),
     *   onHover?: (dirKey: 'UP'|'RIGHT'|'DOWN'|'LEFT'|null) => void
     * }} callbacks
     */
    constructor(canvas, callbacks = {}) {
        this.canvas = canvas;
        this.onMove = callbacks.onMove || (() => {});
        this.onPreview = callbacks.onPreview || (() => {});
        this.getArrowAt = callbacks.getArrowAt || (() => null);
        this.onHover = callbacks.onHover || (() => {});
        this.enabled = true;

        // Trạng thái pointer
        this.pointerId = null;
        this.startX = 0;
        this.startY = 0;
        this.arrowAtStart = null;   // mũi tên dưới điểm nhấn (nếu có)
        this.dragDirKey = null;     // hướng đang xem trước ở chế độ kéo
        this.hoverDir = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handlePointerCancel = this.handlePointerCancel.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);

        if (this.canvas) {
            this.canvas.style.touchAction = 'none';
            this.canvas.addEventListener('pointerdown', this.handlePointerDown);
            this.canvas.addEventListener('pointermove', this.handlePointerMove);
            this.canvas.addEventListener('pointerup', this.handlePointerUp);
            this.canvas.addEventListener('pointercancel', this.handlePointerCancel);
        }
    }

    // ---------- Bàn phím ----------

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            // Escape luôn huỷ thao tác đang dở
            this.cancelDrag();
            return;
        }

        if (!this.enabled) return;

        let direction = null;
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                direction = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                direction = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                direction = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                direction = DIRECTIONS.RIGHT;
                break;
        }

        if (direction) {
            this.onMove(direction);
        }
    }

    // ---------- Pointer ----------

    arrowAt(clientX, clientY) {
        const dir = this.getArrowAt(clientX, clientY);
        return (dir === 'UP' || dir === 'RIGHT' || dir === 'DOWN' || dir === 'LEFT') ? dir : null;
    }

    quadrantFor(dx, dy) {
        if (dx >= 0 && dy < 0) return 'UP';
        if (dx >= 0 && dy >= 0) return 'RIGHT';
        if (dx < 0 && dy >= 0) return 'DOWN';
        if (dx < 0 && dy < 0) return 'LEFT';
        return null;
    }

    setCursor(value) {
        if (this.canvas && this.canvas.style.cursor !== value) {
            this.canvas.style.cursor = value;
        }
    }

    handlePointerDown(e) {
        if (!this.enabled) return;

        this.pointerId = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.dragDirKey = null;
        this.arrowAtStart = this.arrowAt(e.clientX, e.clientY);

        if (this.canvas && this.canvas.setPointerCapture) {
            try {
                this.canvas.setPointerCapture(e.pointerId);
            } catch (err) {
                // Một số trình duyệt cũ không hỗ trợ; bỏ qua.
            }
        }

        if (this.arrowAtStart) {
            this.setCursor('pointer');
            this.onPreview(this.arrowAtStart);
        } else {
            this.setCursor('grabbing');
        }
    }

    handlePointerMove(e) {
        // Không nhấn: chỉ cập nhật hover
        if (this.pointerId === null) {
            if (!this.enabled) return;
            const dir = this.arrowAt(e.clientX, e.clientY);
            if (dir !== this.hoverDir) {
                this.hoverDir = dir;
                this.onHover(dir);
            }
            this.setCursor(dir ? 'pointer' : 'grab');
            return;
        }

        if (e.pointerId !== this.pointerId) return;

        // Nhấn trên mũi tên: không có chế độ kéo
        if (this.arrowAtStart) return;

        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= DRAG_THRESHOLD) {
            const dirKey = this.quadrantFor(dx, dy);
            if (dirKey && dirKey !== this.dragDirKey) {
                this.dragDirKey = dirKey;
                this.onPreview(dirKey);
            }
        } else if (this.dragDirKey !== null) {
            // Kéo ngược lại gần điểm bắt đầu -> huỷ xem trước
            this.dragDirKey = null;
            this.onPreview(null);
        }
    }

    handlePointerUp(e) {
        if (this.pointerId === null) return;
        if (e.pointerId !== this.pointerId) return;

        const arrowAtStart = this.arrowAtStart;
        const dragDirKey = this.dragDirKey;

        this.releaseCapture(e.pointerId);
        this.pointerId = null;

        if (arrowAtStart) {
            const arrowNow = this.arrowAt(e.clientX, e.clientY);
            this.arrowAtStart = null;
            if (arrowNow === arrowAtStart) {
                this.onPreview(null);
                this.onMove(DIRECTIONS[arrowAtStart]);
            } else {
                this.onPreview(null);
            }
        } else {
            this.dragDirKey = null;
            this.onPreview(null);
            if (dragDirKey) {
                this.onMove(DIRECTIONS[dragDirKey]);
            }
        }

        this.refreshHover(e.clientX, e.clientY);
    }

    handlePointerCancel(e) {
        if (this.pointerId !== null && e.pointerId !== this.pointerId) return;
        this.releaseCapture(e.pointerId);
        this.cancelDrag();
        this.setCursor('grab');
    }

    cancelDrag() {
        const wasActive = this.pointerId !== null || this.dragDirKey !== null || this.arrowAtStart !== null;
        if (this.pointerId !== null) this.releaseCapture(this.pointerId);
        this.pointerId = null;
        this.arrowAtStart = null;
        this.dragDirKey = null;
        if (wasActive) this.onPreview(null);
    }

    refreshHover(clientX, clientY) {
        const dir = this.arrowAt(clientX, clientY);
        if (dir !== this.hoverDir) {
            this.hoverDir = dir;
            this.onHover(dir);
        }
        this.setCursor(dir ? 'pointer' : 'grab');
    }

    releaseCapture(pointerId) {
        if (this.canvas && this.canvas.releasePointerCapture && pointerId !== undefined && pointerId !== null) {
            try {
                if (!this.canvas.hasPointerCapture || this.canvas.hasPointerCapture(pointerId)) {
                    this.canvas.releasePointerCapture(pointerId);
                }
            } catch (err) {
                // Bỏ qua: pointer đã được nhả.
            }
        }
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.canvas) {
            this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
            this.canvas.removeEventListener('pointermove', this.handlePointerMove);
            this.canvas.removeEventListener('pointerup', this.handlePointerUp);
            this.canvas.removeEventListener('pointercancel', this.handlePointerCancel);
        }
        this.pointerId = null;
        this.arrowAtStart = null;
        this.dragDirKey = null;
    }
}
