export class Conveyor {
    /**
     * Bang chuyen Khay.
     *
     * CUA SO LA MOT PREFIX CO DINH, KHONG XOAY DUOC — day la mot quyet dinh thiet
     * ke, khong phai thieu sot. Nguoi choi nhin thay maxActive Khay dau hang doi;
     * Khay ke tiep chi troi vao khi mot Khay phia truoc duoc giao xong.
     *
     * Lich su: lop nay tung co rotateLeft()/rotateRight() va mot con tro windowStart.
     * Ca ba deu la DEAD CODE — khong mot cho nao trong game goi toi, windowStart
     * vinh vien bang 0. Chung da bi xoa (9/2026) vi gay hieu nham nghiem trong: doc
     * code thi tuong nguoi choi tiep can duoc moi Khay, thuc te thi khong.
     *
     * DUNG THEM LAI CHUC NANG XOAY neu chua sua bo sinh man: simulateDelivery()
     * trong SolvableLevelGenerator.js cham diem truc trayBacklog dua tren gia dinh
     * prefix co dinh (pending.slice(0, maxActive)). Cho xoay se lam moi Khay deu
     * tiep can duoc, ton kho Khay tut ve gan 0, va toan bo thang diem do kho sai.
     * Neu muon nguoi choi thay truoc hang doi, hay lam mot khu "sap toi" CHI DE XEM
     * thay vi cho xoay cua so — no khong dong toi mo hinh do kho.
     *
     * @param {number} maxActive so Khay hien dien cung luc (bo sinh man quyet dinh:
     *        3 o level lam quen, 5 o hard, 6-7 o super hard).
     */
    constructor(maxActive = 4) {
        this.maxActive = maxActive;
        this.allTrays = [];
    }

    initialize(trays) {
        this.allTrays = [...trays];
    }

    removeTray(trayId) {
        const index = this.allTrays.findIndex(t => t.id === trayId);
        if (index === -1) return false;
        this.allTrays.splice(index, 1);
        return true;
    }

    hasRemainingTrays() {
        return this.allTrays.length > 0;
    }

    /** maxActive Khay dau hang doi. Ngan hon neu con it Khay hon the. */
    getAllActiveTrays() {
        return this.allTrays.slice(0, this.maxActive);
    }

    /**
     * Khay dang hoat dong nhan duoc Thung nay.
     * Nhan ca Thung chu khong chi categoryId, vi Khay che do 'itemType' con
     * phai doi chieu targetItemId — chi so sanh nhom hang la sai o cac level
     * super hard (strictTrayRatio > 0).
     */
    findMatchingTray(box) {
        return this.getAllActiveTrays().find(t => t.canAccept(box));
    }
}
