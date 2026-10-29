import { DIRECTIONS } from '../engine/GameRules.js';

export class InputHandler {
    constructor(onMove) {
        this.onMove = onMove;
        this.enabled = true;
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.touchStartX = 0;
        this.touchStartY = 0;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    handleKeyDown(e) {
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

    handleTouchStart(e) {
        if (e.touches && e.touches.length > 0) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
    }

    handleTouchEnd(e) {
        if (!this.enabled || !e.changedTouches || e.changedTouches.length === 0) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;
        const minSwipeDistance = 25;

        if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
            return;
        }

        let direction = null;
        if (dx >= 0 && dy < 0) {
            direction = DIRECTIONS.UP;
        } else if (dx >= 0 && dy >= 0) {
            direction = DIRECTIONS.RIGHT;
        } else if (dx < 0 && dy >= 0) {
            direction = DIRECTIONS.DOWN;
        } else if (dx < 0 && dy < 0) {
            direction = DIRECTIONS.LEFT;
        }

        if (direction) {
            this.onMove(direction);
        }
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchend', this.handleTouchEnd);
    }
}
