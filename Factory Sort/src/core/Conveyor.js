export class Conveyor {
    constructor(maxActive = 4) {
        this.maxActive = maxActive;
        this.allTrays = [];
        this.windowStart = 0;
    }

    initialize(trays) {
        this.allTrays = [...trays];
        this.windowStart = 0;
    }

    rotateRight() { // View shifts right (trays move left visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart + 1) % this.allTrays.length;
    }

    rotateLeft() { // View shifts left (trays move right visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart - 1 + this.allTrays.length) % this.allTrays.length;
    }

    removeTray(trayId) {
        const index = this.allTrays.findIndex(t => t.id === trayId);
        if (index !== -1) {
            this.allTrays.splice(index, 1);
            if (this.allTrays.length > 0) {
                this.windowStart = this.windowStart % this.allTrays.length;
            } else {
                this.windowStart = 0;
            }
            return true;
        }
        return false;
    }

    hasRemainingTrays() {
        return this.allTrays.length > 0;
    }

    getAllActiveTrays() {
        if (this.allTrays.length === 0) return [];
        const result = [];
        for (let i = 0; i < Math.min(this.maxActive, this.allTrays.length); i++) {
            result.push(this.allTrays[(this.windowStart + i) % this.allTrays.length]);
        }
        return result;
    }

    /**
     * Khay dang hoat dong nhan duoc Thung nay.
     * Nhan ca Thung chu khong chi categoryId, vi Khay che do 'itemType' con
     * phai doi chieu targetItemId — chi so sanh nhom hang la sai o level >= 40.
     */
    findMatchingTray(box) {
        return this.getAllActiveTrays().find(t => t.canAccept(box));
    }
}
