// src/core/Tray.js

export class Tray {
    /**
     * @param {string|null} color 
     * @param {'able'|'unable'|'harvested'} state 
     * @param {number} totalSlots 
     */
    constructor(color, state = 'able', totalSlots = 3) {
        this.color = color;
        this.state = state; // 'able', 'unable', 'harvested'
        this.totalSlots = totalSlots;
        this.slots = Array(totalSlots).fill(false); // true = filled
    }

    /**
     * @returns {number} Số slot còn trống
     */
    remainingSlots() {
        if (this.state !== 'able') return 0;
        return this.slots.filter(s => !s).length;
    }

    /**
     * Điền slime vào tray.
     * @param {number} count - Số lượng slime cần điền
     * @returns {number} - Số lượng slime đã điền thực tế
     */
    fill(count) {
        if (this.state !== 'able') return 0;

        let filledCount = 0;
        for (let i = 0; i < this.slots.length && filledCount < count; i++) {
            if (!this.slots[i]) {
                this.slots[i] = true;
                filledCount++;
            }
        }
        return filledCount;
    }

    /**
     * Kiểm tra xem tray đã đầy chưa.
     * @returns {boolean}
     */
    isFull() {
        return this.slots.every(s => s === true);
    }

    /**
     * Đánh dấu tray đã được harvest.
     * Note: Hàm này chỉ đổi state, GameEngine sẽ phụ trách thay tray mới.
     */
    harvest() {
        this.state = 'harvested';
    }

    /**
     * Kích hoạt tray.
     */
    activate() {
        if (this.state === 'unable') {
            this.state = 'able';
        }
    }

    /**
     * Đặt lại tray với màu mới (sử dụng khi harvest xong)
     * @param {string|null} newColor 
     */
    reset(newColor) {
        this.color = newColor;
        this.state = newColor === null ? 'unable' : 'able';
        this.slots = Array(this.totalSlots).fill(false);
    }
}
