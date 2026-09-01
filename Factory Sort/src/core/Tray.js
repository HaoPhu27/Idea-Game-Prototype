export class Tray {
    /**
     * @param {string} id
     * @param {string} categoryId   nhom hang Khay nhan (che do 'category')
     * @param {string} targetItemId loai item cu the Khay nhan (che do 'itemType')
     * @param {'category'|'itemType'} matchMode
     *
     * matchMode la mot don bay do kho: 'category' cho phep bat ky Thung nao cung
     * nhom hang; 'itemType' bat dung mot loai. Bo sinh man da phat matchMode tren
     * moi Khay (configForLevelNumber dat 'itemType' tu level 40), nhung truoc day
     * Tray bo qua no va luon so sanh theo categoryId — nghia la level >= 40 duoc
     * hien thi nhu doi item cu the nhung lai nhan bat ky item cung nhom.
     */
    constructor(id, categoryId, targetItemId, matchMode = 'category') {
        this.id = id;
        this.categoryId = categoryId;
        this.targetItemId = targetItemId;
        this.matchMode = matchMode === 'itemType' ? 'itemType' : 'category';
        this.slot = null; // Holds the wrapped Box when received
    }

    canAccept(box) {
        if (!box || !box.isWrapped || this.slot !== null) return false;
        if (this.matchMode === 'itemType') {
            return box.getItemType() === this.targetItemId;
        }
        return box.getCategory() === this.categoryId;
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
