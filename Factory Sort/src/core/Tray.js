export class Tray {
    constructor(id, categoryId, targetItemId) {
        this.id = id;
        this.categoryId = categoryId;
        this.targetItemId = targetItemId; // Optional, for display purposes if we want to show specifically what the tray wants
        this.slot = null; // Holds the wrapped Box when received
    }

    canAccept(box) {
        if (!box) return false;
        return box.isWrapped && box.getCategory() === this.categoryId && this.slot === null;
    }

    receiveBox(box) {
        if (this.canAccept(box)) {
            this.slot = box;
            return true;
        }
        return false;
    }

    isFull() {
        return this.slot !== null;
    }
}
