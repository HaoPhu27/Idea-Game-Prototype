import { getCategoryByItemId } from '../data/ItemCatalog.js';

export class Box {
    constructor(id) {
        this.id = id;
        this.slots = [null, null, null]; // Fixed 3 visual & logical slots
        this.isWrapped = false;
        this.maxSize = 3;
    }

    get items() {
        return this.slots.filter(s => s !== null && s !== undefined);
    }

    set items(arr) {
        this.slots = [null, null, null];
        if (Array.isArray(arr)) {
            arr.forEach((it, idx) => {
                if (idx < 3) this.slots[idx] = it;
            });
        }
    }

    removeItem(slotIndex) {
        if (this.isWrapped || slotIndex < 0 || slotIndex >= this.maxSize) {
            return null;
        }
        const item = this.slots[slotIndex];
        this.slots[slotIndex] = null;
        return item;
    }

    push(itemId, targetSlotIndex = null) {
        if (!this.canAccept(targetSlotIndex)) {
            return false;
        }
        if (targetSlotIndex !== null && targetSlotIndex >= 0 && targetSlotIndex < this.maxSize && this.slots[targetSlotIndex] === null) {
            this.slots[targetSlotIndex] = itemId;
            return true;
        }
        const emptyIdx = this.slots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
            this.slots[emptyIdx] = itemId;
            return true;
        }
        return false;
    }

    canAccept(targetSlotIndex = null) {
        if (this.isWrapped) return false;
        if (targetSlotIndex !== null && targetSlotIndex >= 0 && targetSlotIndex < this.maxSize) {
            return this.slots[targetSlotIndex] === null;
        }
        return this.slots.some(s => s === null);
    }

    isFull() {
        return this.slots.every(s => s !== null && s !== undefined);
    }

    isEmpty() {
        return this.slots.every(s => s === null || s === undefined);
    }

    checkWrapped() {
        if (this.isFull() && !this.isWrapped) {
            const firstId = this.slots[0];
            if (firstId !== null && this.slots[1] === firstId && this.slots[2] === firstId) {
                this.isWrapped = true;
                return true;
            }
        }
        return false;
    }

    getCategory() {
        if (!this.isWrapped || this.isEmpty()) return null;
        const nonNull = this.items;
        return nonNull.length > 0 ? getCategoryByItemId(nonNull[0]) : null;
    }

    /** Loai item cua Thung da wrapped (ca 3 o giong nhau). Dung cho Khay che do 'itemType'. */
    getItemType() {
        if (!this.isWrapped || this.isEmpty()) return null;
        const nonNull = this.items;
        return nonNull.length > 0 ? nonNull[0] : null;
    }
    
    clone() {
        const cloned = new Box(this.id);
        cloned.slots = [...this.slots];
        cloned.isWrapped = this.isWrapped;
        return cloned;
    }
}
