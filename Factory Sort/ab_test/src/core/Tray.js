export class Tray {
    /**
     * @param {string} id
     * @param {string} categoryId   nhom hang dung de hien thi mau
     * @param {string} targetItemId loai item cu the Khay nhan (emoji hien tren Khay)
     * @param {'category'|'itemType'} matchMode
     *
     * Khay luon nhan dung loai item hien tren Khay, khong ghep theo ID cua Thung
     * hay chi theo mau/category. matchMode duoc giu de doc du lieu level cu;
     * no khong noi long dieu kien nhan hang. Moi Khay cung targetItemId deu co
     * the nhan bat ky Thung da goi cung loai, moi Khay toi da mot Thung.
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
        // Luon so sanh theo LOAI ITEM cu the (targetItemId) — khong dung category.
        // Tray hien emoji nao thi CHI nhan box cung emoji do.
        return box.getItemType() === this.targetItemId;
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
