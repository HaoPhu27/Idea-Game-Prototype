import { getCategoryConfig, getItemEmoji, getCategoryIcon } from '../data/ItemCatalog.js';
import { applyItemArt } from './ItemArt.js';
import { GripperRenderer } from './GripperRenderer.js';

export class TrayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.offset = 0;
        this.baseSpeed = 0.015; // radians per frame at 60fps
        this.speedMultiplier = 1;
        this.trayElements = [];
        this.slotCount = 4;
        // Hang so thoi gian cua buoc dan deu lai vong Khay sau moi lan Khay ra/vao.
        this.respaceTau = 260; // ms
        this.shiftDecayTime = 0;
        this.lastTime = performance.now();
        this.highlightedTrayId = null;
        this.rejectTrayId = null;
        this.animate = this.animate.bind(this);
        this.onTick = null;

        // Lop phu co cau kep. Khong giu trang thai thoi gian: TrayRenderer day job
        // moi trong updatePositions() tu dung tam Khay that su.
        this.gripperRenderer = new GripperRenderer(this.container);

        // Thoi luong vat ly cua mot luot kep: ha xuong -> mang di -> dat -> nha.
        // Dung chung cho ca cong IN (nang Khay moi) va cong OUT (nhac Khay di).
        this.HANDLE_DURATION = 700; // ms

        this.geom = this.readBeltGeometry();
        this._ro = new ResizeObserver(() => { this.geom = this.readBeltGeometry(); this._paintTrack(); });
        this._ro.observe(this.container);

        this.running = false;
    }

    reset() {
        this.speedMultiplier = 1;
        this.container.innerHTML = '';
        this.trayElements = [];
        this.slotCount = 4;
        this.offset = 0;
        this.shiftDecayTime = 0;
        this._skipRespaceOnce = false;

        // container.innerHTML = '' cung xoa luon lop phu kep. GripperRenderer._ensureRoot()
        // tu gan lai root vao container o lan render() ke tiep, nen chi can xoa job o day.
        // destroy() la tuy chon: khong phai ban GripperRenderer nao cung co.
        if (this.gripperRenderer) {
            this.gripperRenderer.reset();
            if (typeof this.gripperRenderer.destroy === 'function') {
                this.gripperRenderer.destroy();
                this.gripperRenderer = new GripperRenderer(this.container);
            }
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.animate);
    }

    /**
     * Ban kinh vung giao hang, tinh bang PIXEL tren lan chay.
     *
     * DAY LA HOP DONG GAMEPLAY. 28px la ngưỡng nguyen ban cua UIManager truoc khi
     * tach khoi hinh hoc:
     *     if (Math.abs(trayCenterX - slotCenterX) <= 28) triggerQueueDelivery(...)
     *
     * Giu don vi PIXEL chu khong phai ti le vong chay: chieu dai hanh trinh doi theo
     * be rong may (432px o 390px, 402px o 360px...), nen mot ti le co dinh se lam
     * nhip giao NHANH CHAM KHAC NHAU tuy may — dung thu can tranh nhat. Doi sang ti
     * le ngay tai cho dung, dua tren hinh hoc thuc.
     */
    static get DELIVERY_RADIUS_PX() { return 28; }

    /** Tiến độ 0..1 của một Khay trên vòng chạy, 0 tại cổng IN. */
    getTrackProgress(theta) {
        return (((-theta) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
    }

    /**
     * Khay có đang nằm trong cửa sổ giao ứng với ô hàng chờ thứ slotIdx không.
     */
    /**
     * Khay co dang o vung giao cua o hang cho thu slotIdx khong.
     *
     * DAY LA HOP DONG GAMEPLAY — tai lap DUNG phep thu nguyen ban cua UIManager:
     *     isFrontTrack: |pt.y - (cy - hy)| < 22
     *     trung o     : |trayCenterX - slotCenterX| <= 28
     * Chi khac mot diem: toa do doc tu he cua #trays-container thay vi tu
     * getBoundingClientRect() cua hai phan tu, nen doi bo cuc khong lam lech nhip giao.
     */
    isInDeliveryZone(trayObj, slotRef, queueLength) {
        const g = this.geom;
        const pt = this.getTrackPoint(trayObj.currentTheta);
        if (Math.abs(pt.y - g.frontY) >= 22) return false;   // phai o nhanh chay truoc

        const slotEl = (slotRef && typeof slotRef === 'object' && slotRef.nodeType)
            ? slotRef
            : document.querySelectorAll('.queue-slot')[slotRef];
        if (!slotEl) return false;
        const cRect = this.container.getBoundingClientRect();
        const sRect = slotEl.getBoundingClientRect();
        const slotLocalX = (sRect.left + sRect.width / 2) - cRect.left;

        return Math.abs(pt.x - slotLocalX) <= TrayRenderer.DELIVERY_RADIUS_PX;
    }



    /**
     * Hinh hoc VONG CHAY — do truc tiep tu DOM.
     *
     * Vi sao quay lai vong chay (sau khi thu lan thang mot chieu):
     *   Lan thang KHONG THE dam bao hien du maxActive Khay, va day la rang buoc bat
     *   bien cua khu don hang. Hai ly do do duoc bang so:
     *     - Khay phai truot vao/ra hai dau, nen moi Khay chi "doc duoc" khoang 78%
     *       thoi gian. O man 1 (2 Khay) chi 57% so khung hinh thay du ca hai.
     *     - O man 50, maxActive len 6-7. 7 Khay x 62px = 434px, trong khi lan chi rong
     *       ~340px o may 360px. Khong du cho, du co lam gi voi quy dao.
     *   Vong chay co chu vi ~2x be rong lan nen chua duoc ca 7 Khay va khong Khay nao
     *   phai roi khung. Day dung la ly do ban delivery dung vong chay ngay tu dau.
     *
     * Cai VAN GIU lai tu ban lan thang: chieu cao. Vong chay o day cao ~118px thay vi
     * 242px cua delivery — van tra ve cho ban choi hon 120px.
     */
    readBeltGeometry() {
        const cRect = this.container.getBoundingClientRect();
        const belt  = document.getElementById('conveyor-belt');
        const bRect = (belt && belt.getBoundingClientRect().width > 40)
            ? belt.getBoundingClientRect() : cRect;

        const W     = this.container.clientWidth || cRect.width || 600;
        const beltW = Math.max(80, cRect.width || bRect.width);
        const beltH = Math.max(60, cRect.height || bRect.height);

        // Kich thuoc Khay bi RANG BUOC HAI PHIA. Sizing o day thuan TRINH BAY: khong
        // doi maxActive, khong doi thu tu Khay, khong doi luat nhan hang.
        //
        //  (1) Chieu cao: vong chay co HAI nhanh xep chong theo chieu doc, nen
        //      trayH <= (beltH - le) / 2. Bo qua rang buoc nay thi hai nhanh dam vao
        //      nhau va Khay chong len nhau — dung loi vua thay o ban thu truoc.
        //  (2) Chu vi: o man 50 maxActive len 6-7; n Khay phai vua chu vi vong chay.
        const n = Math.max(1, this.slotCount || 4);
        const margin = 4;

        // Chieu cao Khay phai chua duoc: 2 dai bang tai + mot khoang LONG VONG nhin
        // thay duoc. Khong con "lay toi da co the" nhu truoc — neu lay toi da thi hai
        // dai cham nhau, vong chay bien thanh mot khoi dac va mat het chat conveyor.
        //   beltH >= 2 x (trayH + BAND_PAD) + CORE_MIN
        const BAND_PAD = 8;   // le dai bang tai moi ben ngoai Khay
        const CORE_MIN = 16;  // long vong toi thieu, de con doc ra la mot VONG
        let trayH = Math.max(34, Math.min(70,
            Math.floor((beltH - CORE_MIN) / 2) - BAND_PAD));
        let trayW = Math.round(trayH * 0.94);

        const perim = 2 * Math.max(0, beltW - trayW) + 2 * Math.max(0, beltH - trayH);
        const need  = n * (trayW + 6);
        if (need > perim && need > 0) {
            trayW = Math.max(32, Math.round(trayW * (perim / need)));
            trayH = Math.round(trayW * 1.06);
        }

        const cx = W / 2;
        const cy = beltH / 2;                       // do tu DAY #trays-container len

        const hx = Math.max(20, beltW / 2 - trayW / 2 - margin);
        const hy = Math.max(16, beltH / 2 - trayH / 2 - margin);

        // Ban kinh goc = hy, tuc HAI DAU BO TRON HOAN TOAN (dang stadium/oval).
        //
        // Khong phai chon cho dep: mot `stroke` day bandW ve tren duong bo goc se TU
        // CAT o goc khi bandW > 2 x ban kinh — cac go chan bung ra thanh hinh nan quat.
        // Da thay dung loi do voi radius 16 / band 56. Lay radius = hy thi:
        //   - ban kinh trong = hy - bandW/2 > 0  -> khong bao gio tu cat;
        //   - va duong chay thanh dung dang bang tai oval: hai doan thang + hai nua
        //     duong tron, thay vi mot hinh chu nhat co goc hoi tron.
        const radius = hy;

        // Be rong dai bang tai: phu tron Khay, nhung khong duoc de hai dai cham nhau
        // (2*hy la khoang cach giua tim hai nhanh).
        const bandW = Math.max(20, Math.min(34, 2 * hy - CORE_MIN));

        return {
            cx, cy, beltW, beltH, hx, hy, r: radius, trayW, trayH, bandW,
            frontY: cy - hy,                        // nhanh chay TRUOC (Khay di phai->trai)
        };
    }

    /** Chu vi duong chay. Dung chung cho ca Khay lan go chan tren dai bang tai. */
    _trackPerimeter() {
        const g = this.geom;
        const Lx = Math.max(0, 2 * (g.hx - g.r));
        const Ly = Math.max(0, 2 * (g.hy - g.r));
        return 2 * Lx + 2 * Ly + 4 * (Math.PI / 2) * g.r;
    }

    /**
     * Ve DUONG CHAY: mot hinh chu nhat ngang bo 4 goc, ke DUNG tren quy dao Khay.
     *
     * Ky thuat: mot <rect> bo goc voi `stroke-width` lon chinh la mot dai bang tai
     * khep kin. Go chan la CUNG duong do, ve de len bang `stroke-dasharray` — nho
     * vay go chan luon vuong goc voi huong chay, ke ca tren 4 goc cong (thu ma
     * gradient CSS khong the lam duoc).
     *
     * Toa do lay thang tu geom nen dai bang tai va Khay khong bao gio lech nhau:
     * geom.cy do tu DAY container len, con SVG do tu DINH xuong -> phai lat truc.
     */
    _paintTrack() {
        const svg = document.getElementById('belt-track');
        if (!svg) return;
        const g = this.geom;

        const x = g.cx - g.hx;
        const y = (g.beltH - g.cy) - g.hy;   // lat truc y sang he cua SVG
        const w = 2 * g.hx;
        const h = 2 * g.hy;
        if (w <= 0 || h <= 0) return;

        const half = g.bandW / 2;
        const set = (id, attrs) => {
            const el = document.getElementById(id);
            if (!el) return;
            for (const k in attrs) el.setAttribute(k, attrs[k]);
        };

        // 1. Mat dai cao su
        set('belt-band', { x, y, width: w, height: h, rx: g.r, ry: g.r,
                           'stroke-width': g.bandW });
        // 2. Go chan ngang, chu ky 22px
        set('belt-cleat', { x, y, width: w, height: h, rx: g.r, ry: g.r,
                            'stroke-width': g.bandW,
                            'stroke-dasharray': '2.5 19.5' });
        // 3. Hai thanh ray nhom vien trong / vien ngoai dai
        set('belt-rail-o', { x: x - half, y: y - half, width: w + g.bandW, height: h + g.bandW,
                             rx: g.r + half, ry: g.r + half, 'stroke-width': 1.5 });
        const ih = Math.max(0, h - g.bandW), iw = Math.max(0, w - g.bandW);
        set('belt-rail-i', { x: x + half, y: y + half, width: iw, height: ih,
                             rx: Math.max(1, g.r - half), ry: Math.max(1, g.r - half),
                             'stroke-width': 1.5 });
    }

    getTrackPoint(theta) {
        const g = this.geom;
        const Lx = Math.max(0, 2 * (g.hx - g.r));
        const Ly = Math.max(0, 2 * (g.hy - g.r));
        const C = (Math.PI / 2) * g.r;
        const P = 2 * Lx + 2 * Ly + 4 * C;

        if (P <= 0) return { x: g.cx, y: g.cy };

        // Chuyen doi theta (dang giam dan khi troi) ve khoang cach d tang dan theo chieu kim dong ho
        let norm = ((-theta) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
        let d = (norm / (2 * Math.PI)) * P;

        const d1 = Ly / 2;
        const d2 = d1 + C;
        const d3 = d2 + Lx;
        const d4 = d3 + C;
        const d5 = d4 + Ly;
        const d6 = d5 + C;
        const d7 = d6 + Lx;
        const d8 = d7 + C;

        let x, y;

        if (d < d1) {
            // Canh phai di xuong tu tam cy den bat dau goc bo duoi
            x = g.cx + g.hx;
            y = g.cy - d;
        } else if (d < d2) {
            // Goc bo duoi-phai
            const t = (d - d1) / C;
            const ang = -t * (Math.PI / 2);
            x = g.cx + g.hx - g.r + g.r * Math.cos(ang);
            y = g.cy - g.hy + g.r + g.r * Math.sin(ang);
        } else if (d < d3) {
            // Canh day di tu phai sang trai
            const t = d - d2;
            x = g.cx + g.hx - g.r - t;
            y = g.cy - g.hy;
        } else if (d < d4) {
            // Goc bo duoi-trai
            const t = (d - d3) / C;
            const ang = -Math.PI / 2 - t * (Math.PI / 2);
            x = g.cx - g.hx + g.r + g.r * Math.cos(ang);
            y = g.cy - g.hy + g.r + g.r * Math.sin(ang);
        } else if (d < d5) {
            // Canh trai di len qua cong OUT den bat dau goc bo tren
            const t = d - d4;
            x = g.cx - g.hx;
            y = g.cy - g.hy + g.r + t;
        } else if (d < d6) {
            // Goc bo tren-trai
            const t = (d - d5) / C;
            const ang = Math.PI - t * (Math.PI / 2);
            x = g.cx - g.hx + g.r + g.r * Math.cos(ang);
            y = g.cy + g.hy - g.r + g.r * Math.sin(ang);
        } else if (d < d7) {
            // Canh dinh di tu trai sang phai
            const t = d - d6;
            x = g.cx - g.hx + g.r + t;
            y = g.cy + g.hy;
        } else if (d < d8) {
            // Goc bo tren-phai
            const t = (d - d7) / C;
            const ang = Math.PI / 2 - t * (Math.PI / 2);
            x = g.cx + g.hx - g.r + g.r * Math.cos(ang);
            y = g.cy + g.hy - g.r + g.r * Math.sin(ang);
        } else {
            // Canh phai di xuong tu dinh ve lai tam cy (cong IN)
            const t = d - d8;
            x = g.cx + g.hx;
            y = g.cy + g.hy - g.r - t;
        }

        return { x, y };
    }


    render(activeTrays, highlightedTrayId = null, rejectTrayId = null) {
        this.highlightedTrayId = highlightedTrayId;
        this.rejectTrayId = rejectTrayId;
        
        let maxActive = 4;
        if (window.gameUI && window.gameUI.engine) {
            maxActive = window.gameUI.engine.conveyor.maxActive || 4;
        }
        const totalTrays = (window.gameUI && window.gameUI.engine && window.gameUI.engine.conveyor.allTrays.length) || activeTrays.length;
        const slotCount = Math.max(1, Math.min(totalTrays, maxActive));
        const prevDelta = (2 * Math.PI) / (this.slotCount || 4);
        const slotCountChanged = slotCount !== this.slotCount;
        this.slotCount = slotCount;
        // trayW/trayH phu thuoc slotCount -> phai do lai hinh hoc sau khi doi.
        this.geom = this.readBeltGeometry();
        this.container.style.setProperty('--tray-w', `${this.geom.trayW}px`);
        this.container.style.setProperty('--tray-h', `${this.geom.trayH}px`);
        this._paintTrack();

        const isStartOfLevel = !activeTrays.some(tray => this.trayElements.some(t => t.id === tray.id));

        if (isStartOfLevel) {
            this.offset = 0;
            this.trayElements.forEach(t => t.el.remove());
            this.trayElements = [];
            // Dau man: Khay xep san san -> khong co luot kep nao. Xoa lop phu cu de
            // khong con canh tay "treo" tu man truoc.
            if (this.gripperRenderer) this.gripperRenderer.reset();
            this._skipRespaceOnce = false;
        } else if (slotCountChanged) {
            // Cuoi man, so Khay con lai tut xuong duoi maxActive nen delta doi. Quy doi
            // slotPos sang he moi de GOC hien tai cua tung Khay khong doi; viec dan ra
            // khoang cach moi de _respace() lam dan trong vai frame.
            this.trayElements.forEach(t => {
                const theta = t.slotPos * prevDelta + this.offset;
                t.slotPos = (theta - this.offset) / ((2 * Math.PI) / slotCount);
                t.targetSlotPos = t.slotPos;
            });
        }

        const delta = (2 * Math.PI) / this.slotCount;
        let newcomerIndex = 0;

        // Sync activeTrays with trayElements & slots
        activeTrays.forEach((tray, index) => {
            let existing = this.trayElements.find(t => t.id === tray.id);
            let trayEl;
            
            if (!existing) {
                // Vi tri tren vong, tinh bang DON VI SLOT (so thuc, khong phai chi so
                // nguyen). theta = slotPos * delta + offset.
                let slotPos;
                let spawnTargetTheta = 0;
                let hasSpawned = false;
                let spawnStartTime = 0;
                // Thu tu cua Khay moi trong lan render nay (0 = khay vao truoc tien).
                let newcomerSlot = 0;

                // Khay moi trong man (khong phai dau man): KHONG hien ngay tai cong IN.
                // No duoc co cau kep nang tu TREN XUONG (xem updatePositions), nen phai
                // giu theta = 0 co dinh trong luc dang ha — chua duoc tham gia vong chay.
                const entering = !isStartOfLevel;

                if (isStartOfLevel) {
                    // Vao man: maxActive Khay xep san deu vong, lo ra ngay lap tuc.
                    slotPos = index;
                    spawnTargetTheta = 0;
                    hasSpawned = true;
                } else {
                    // Giao hang xong: Khay thay the VAO NGAY TAI CONG IN.
                    //
                    // Truoc day Khay moi ke thua dung slot cua Khay vua duoc giao — ma
                    // slot do duoc giai phong o BAT KY dau tren vong (cho nguoi choi tha
                    // Thung), roi Khay moi bi giau cho toi khi slot ay troi den cong IN.
                    // Do o level 50 (6 Khay, ~7s/vong): 0 den 3.42s moi hien ra, nen bang
                    // chuyen chi con 5 Khay du conveyor.getAllActiveTrays() van tra ve 6.
                    // Tha nhanh lien tiep thi tut xuong 4 hoac 3. Van xa "cho hon nua vong
                    // thi hien ngay" con lam Khay bup ra giua bang chuyen.
                    const gateTheta = Math.round(this.offset / (2 * Math.PI)) * 2 * Math.PI;
                    // newcomerIndex: neu hai Khay cung vao trong mot lan render thi Khay
                    // thu hai vao SAU mot nhip kep, khong chong len Khay dau tai cong IN
                    // (ca hai deu bi ghim theta = 0 trong suot luot ha).
                    slotPos = (gateTheta - this.offset) / delta + newcomerIndex;
                    hasSpawned = true;
                    newcomerSlot = newcomerIndex;
                    newcomerIndex++;
                }

                trayEl = document.createElement('div');
                trayEl.className = 'tray';
                trayEl.dataset.trayId = tray.id;
                trayEl.style.position = 'absolute';
                trayEl.style.left = '0px';
                // Goc toa do la TRAI-TREN (giong GripperRenderer): transform translate3d
                // o updatePositions dung y tu dinh xuong, nen bottom:0 se lech nguoc chieu.
                trayEl.style.top = '0px';
                trayEl.style.bottom = 'auto';
                trayEl.style.display = hasSpawned ? '' : 'none'; // an cho toi khi qua cong IN
                
                // Base structure: sleek colored cap, no explicit text label
                const capEl = document.createElement('div');
                capEl.className = 'tray-cap';
                trayEl.appendChild(capEl);
                
                this.container.appendChild(trayEl);
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    trayEl.style.setProperty('--cat-color', catConfig.color);
                    capEl.style.backgroundColor = catConfig.color;
                    trayEl.title = catConfig.label;
                }
                
                const newTrayObj = {
                    id: tray.id,
                    el: trayEl,
                    slotPos: slotPos,
                    targetSlotPos: slotPos,
                    isExiting: false,
                    currentTheta: slotPos * delta + this.offset,
                    fadingOut: false,
                    spawnTargetTheta: spawnTargetTheta,
                    hasSpawned: hasSpawned,
                    spawnStartTime: spawnStartTime,
                    // Trang thai luot kep o cong IN. `isEntering` chan checkQueuePickup
                    // (UIManager) — Khay dang duoc ha xuong thi chua phai khay tren bang
                    // chuyen nen khong duoc nhan hang tu hang cho.
                    isEntering: entering,
                    // Khay thu hai trong cung mot lan render vao sau mot nhip kep de
                    // khong chong len Khay thu nhat tai cong IN.
                    enterStartTime: entering ? performance.now() + newcomerSlot * 760 : 0
                };
                this.trayElements.push(newTrayObj);
                existing = newTrayObj;
            } else {
                trayEl = existing.el;
            }
            
            // Only update visuals if it's not exiting (exiting trays manage their own visuals)
            if (!existing.isExiting) {
                trayEl.classList.remove('highlight-match', 'highlight-reject', 'exiting');
                trayEl.classList.toggle('tray-strict', tray.matchMode === 'itemType');
                if (tray.id === highlightedTrayId) trayEl.classList.add('highlight-match');
                if (tray.id === rejectTrayId) trayEl.classList.add('highlight-reject');
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    trayEl.style.setProperty('--cat-color', catConfig.color);
                }

                // Category illustration emblem (visual hint without text)
                let illustEl = trayEl.querySelector('.tray-illustration');
                if (!tray.isFull()) {
                    if (!illustEl) {
                        illustEl = document.createElement('div');
                        illustEl.className = 'tray-illustration';
                        trayEl.appendChild(illustEl);
                    }
                    const icon = tray.targetItemId
                        ? getItemEmoji(tray.targetItemId)
                        : (catConfig ? catConfig.icon : getCategoryIcon(tray.categoryId));
                    illustEl.textContent = icon;
                    applyItemArt(illustEl, tray.targetItemId || null);
                } else if (illustEl) {
                    illustEl.remove();
                }
                
                // Full visual (simplified)
                let fullEl = trayEl.querySelector('.tray-full');
                if (tray.isFull()) {
                    if (!fullEl) {
                        fullEl = document.createElement('div');
                        fullEl.className = 'tray-full';
                        fullEl.style.fontSize = '40px';
                        fullEl.style.marginTop = '10px';
                        fullEl.textContent = '📦';
                        trayEl.appendChild(fullEl);
                    }
                } else if (fullEl) {
                    fullEl.remove();
                }
            }
        });
        
        // Remove trays that are not in activeTrays AND not isExiting
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const t = this.trayElements[i];
            if (!t.isExiting) {
                const stillActive = activeTrays.some(a => a.id === t.id);
                // Khay dang duoc co cau nang vao van hien trong activeTrays, nen o day
                // chi con lai truong hop engine da bo Khay (booster xoa / reset man).
                if (!stillActive) {
                    t.el.remove();
                    this.trayElements.splice(i, 1);
                }
            }
        }
        
        // _skipRespaceOnce: Khay vua duoc NHA khoi co cau vua duoc gan slotPos dung
        // theo offset hien tai. Dan lai ngay frame do se keo no khoi diem IN ngay
        // (mot cu giat); de khung HINH KE TIEP moi dan ra deu.
        if (this._skipRespaceOnce) this._skipRespaceOnce = false;
        else this._respace();
        this.updatePositions(performance.now());

        // Phase 3 §3.6: Chỉ báo "còn lại N đơn"
        if (window.gameUI && window.gameUI.engine && window.gameUI.engine.conveyor) {
            const conveyor = window.gameUI.engine.conveyor;
            const allCount = conveyor.allTrays ? conveyor.allTrays.length : 0;
            const activeCount = conveyor.getAllActiveTrays ? conveyor.getAllActiveTrays().length : 0;
            const remain = allCount - activeCount;
            const remainEl = document.getElementById('tray-remaining');
            if (remainEl) {
                remainEl.textContent = remain > 0 ? `còn ${remain}` : 'đơn cuối';
                remainEl.classList.toggle('is-last', remain === 0);
            }
        }

        if (this.trayElements.length > 0) this.start();
    }

    animate(now) {
        if (!this.running) return;
        
        const dt = Math.min(now - this.lastTime, 50); // cap dt to avoid huge jumps
        this.lastTime = now;
        
        let speed = this.baseSpeed * this.speedMultiplier;
        if (now < this.shiftDecayTime) {
            const remain = (this.shiftDecayTime - now) / 1200;
            speed *= (1 + 0.6 * remain);
        }
        
        // speed in radians per frame (negative so front track moves right-to-left)
        const deltaTheta = -speed * (dt / 16.66);
        this.offset += deltaTheta;
        
        // Exiting trays update their own theta
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const item = this.trayElements[i];
            if (item.isExiting) {
                item.currentTheta += deltaTheta;
                
                // Out port is at left edge (cos approaches -1). Front track (sin <= 0).
                if (!item.fadingOut && !item.pickupStartTime &&
                    Math.cos(item.currentTheta) < -0.88 && Math.sin(item.currentTheta) <= 0.08) {
                    // DONG BANG tai DUNG diem quy dao hien tai (khong nhay ve mot moc
                    // "gan dung"), roi bat dau luot nhac vat ly 700ms. Khong con
                    // fade/scale: Khay duoc co cau nang len that su.
                    const pt = this.getTrackPoint(item.currentTheta);
                    item.pickupStartTime = now;
                    // Lat truc y sang he CSS (goc trai-tren) NGAY tai day va giu lai toa do
                    // tuyet doi: luot nhac khong con phu thuoc geom neu man hinh doi kich
                    // thuoc giua chung.
                    item.pickupAnchor = {
                        x: pt.x,
                        y: (this.geom ? this.geom.beltH : 0) - pt.y
                    };
                    item.el.classList.remove('exiting');
                }
            }
        }
        
        // Keo tung Khay ve vi tri dan deu muc tieu (xem _respace).
        const kEase = 1 - Math.exp(-dt / this.respaceTau);
        for (const item of this.trayElements) {
            if (item.isExiting) continue;
            const d = item.targetSlotPos - item.slotPos;
            if (Math.abs(d) < 0.0005) item.slotPos = item.targetSlotPos;
            else item.slotPos += d * kEase;
        }

        this.updatePositions(now);
        if (this.onTick) this.onTick(now);
        if (this.trayElements.length === 0) { this.running = false; return; }
        requestAnimationFrame(this.animate);
    }

    animateShift() {
        this.shiftDecayTime = performance.now() + 1200;
    }

    updatePositions(now = performance.now()) {
        // Go chan tren dai bang tai troi cung mot quang duong voi Khay: cung `offset`,
        // cung chu vi. Neu tinh rieng thi dai bang tai va Khay se chay lech toc do —
        // mat mat cam giac Khay DUOC dai bang tai cho di.
        const cleat = document.getElementById('belt-cleat');
        if (cleat && this.geom) {
            const P = this._trackPerimeter();
            const d = (((-this.offset) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * P;
            cleat.setAttribute('stroke-dashoffset', (-d).toFixed(1));
        }

        if (!this.container || this.trayElements.length === 0) {
            if (this.gripperRenderer) this.gripperRenderer.render([]);
            return;
        }

        const g = this.geom;
        const delta = (2 * Math.PI) / (this.slotCount || 4);
        const HANDLE = this.HANDLE_DURATION || 700;

        // Moi job = mot canh tay kep dang ve. Gom trong CUNG vong lap dat transform
        // ben duoi, nen tam kep truyen cho GripperRenderer luon la tam Khay THAT SU
        // cua khung hinh nay (khong phai vi tri du kien).
        const jobs = [];

        this.trayElements.forEach(item => {
            // Khay da hoan tat luot nha (`fadingOut`) da duoc nha callback go khoi mang;
            // neu con thi bo qua de khong ve de len luot kep ke tiep.
            if (item.fadingOut) return;

            // Toa do theo HE CSS cua #trays-container: goc trai-tren, y huong xuong.
            // getTrackPoint() tra y do tu DAY container len -> phai lat truc.
            const containerH = g.beltH;
            const toCssY = trackY => containerH - trackY;

            let x;              // tam Khay theo x
            let y;              // tam Khay theo y (he CSS)
            let theta;

            if (item.isExiting) {
                theta = item.currentTheta;

                if (item.pickupStartTime) {
                    // ---- Luot NHAC khay tai cong OUT (700ms, thuan vat ly) ----
                    // Khong con fade/scale: co cau nhac Khay len roi moi ghi nhan
                    // giao hang. Moc thoi gian lay tu `now`, khong dung setTimeout.
                    const p = Math.max(0, Math.min(1, (now - item.pickupStartTime) / HANDLE));
                    const pt = this.getTrackPoint(theta);
                    const startX = item.pickupAnchor ? item.pickupAnchor.x : pt.x;
                    const startY = item.pickupAnchor ? item.pickupAnchor.y : toCssY(pt.y);

                    // "len 25 roi sang trai 20": y CSS giam = di len.
                    x = startX - 20 * p;
                    y = startY - 25 * p;
                    item.el.style.opacity = '1';

                    if (p >= 1) {
                        this._finishExit(item);
                        return;
                    }
                    jobs.push({ side: 'out', x, y, w: g.trayW, h: g.trayH, progress: p });
                } else {
                    // Dang cho Khay troi toi cong OUT. Chua co co cau: cong OUT chi nhac
                    // Khay khi no da toi dung cua (dieu kien da co san trong animate()).
                    const pt = this.getTrackPoint(theta);
                    x = pt.x;
                    y = toCssY(pt.y);
                    item.el.style.opacity = '1';
                }
            } else {
                const rawTheta = item.slotPos * delta + this.offset;

                // Check if ready to emerge at IN gate
                if (!item.hasSpawned) {
                    if (rawTheta <= item.spawnTargetTheta) {
                        item.hasSpawned = true;
                        item.el.style.display = '';
                    } else {
                        item.el.style.display = 'none';
                        return;
                    }
                }

                theta = rawTheta;

                if (item.isEntering) {
                    // ---- Luot NANG khay moi vao tai cong IN (700ms) ----
                    // Theta bi GHIM o cong IN trong suot luot ha: Khay chua thuc su nam
                    // tren bang chuyen, nen tra ve vong chay luc nay se lam no truot di
                    // ngay duoi tay kep.
                    const p = Math.max(0, Math.min(1, (now - item.enterStartTime) / HANDLE));
                    if (p <= 0) {
                        // Khay xep hang cho luot kep cua no: chua ve gi, chua co job.
                        // (Truong hop hai Khay moi trong cung mot lan render.)
                        item.el.style.display = 'none';
                        return;
                    }
                    // Da toi luot: hien lai (co the vua bi an o tren) va bat dau luot kep.
                    if (item.el.style.display === 'none') item.el.style.display = '';
                    const gate = this.getTrackPoint(item.spawnTargetTheta || 0);
                    const anchorX = gate.x;
                    const anchorY = toCssY(gate.y);

                    // 4 chang cua mot luot vat ly, cung nhip voi ngon kep:
                    //   0.00..0.25  giu tai diem kep (GRIP_X, GRIP_Y) - ngon kep dong lai
                    //   0.25..0.65  mang di   - tu diem kep ve dung ANCHOR (cong IN)
                    //   0.65..0.80  dat xuong - da o anchor, khong doi vi tri
                    //   0.80..1.00  nha      - giu nguyen, cho ngon kep mo ra
                    const GRIP_X = anchorX + 20;
                    const GRIP_Y = anchorY - 25;
                    if (p < 0.25) {
                        // Giu yen tai diem kep trong luc ngon kep dong lai. Khong di
                        // chuyen o chang nay, de chang sau bat dau DUNG tai (GRIP_X,
                        // GRIP_Y) — truoc day p=.25 nhay ve GRIP_Y.
                        x = GRIP_X;
                        y = GRIP_Y;
                    } else if (p < 0.65) {
                        // Mang di: tu diem kep ve dung ANCHOR (cong IN), ca x lan y.
                        const t = (p - 0.25) / 0.40;
                        const ease = t * t * (3 - 2 * t); // smoothstep: khong giat dau/cuoi
                        x = GRIP_X + (anchorX - GRIP_X) * ease;
                        y = GRIP_Y + (anchorY - GRIP_Y) * ease;
                    } else {
                        // Dat/nha: dung yen tai anchor de cu dat khong bi "truot".
                        x = anchorX;
                        y = anchorY;
                    }
                    item.el.style.opacity = '1';

                    jobs.push({ side: 'in', x, y, w: g.trayW, h: g.trayH, progress: p });

                    if (p >= 1) {
                        // NHA khay: ban giao tu cong IN sang vong chay ma KHONG nhay.
                        // slotPos duoc chon theo offset HIEN TAI sao cho
                        // slotPos*delta + offset == spawnTargetTheta, tuc goc hien tai
                        // dung bang goc cong IN; tu day Khay chi con troi theo offset.
                        item.isEntering = false;
                        item.enterStartTime = 0;
                        item.slotPos = (item.spawnTargetTheta - this.offset) / delta;
                        item.targetSlotPos = item.slotPos;
                        // Chua dua vao _respace: no se dan ra deu ngay trong khung ke tiep.
                        this._skipRespaceOnce = true;
                    }
                } else {
                    const pt = this.getTrackPoint(theta);
                    x = pt.x;
                    y = toCssY(pt.y);
                    item.el.style.opacity = '1';
                }

                item.currentTheta = theta;
            }

            item.el.style.transformOrigin = 'center center';
            item.el.style.transform =
                `translate3d(${(x - g.trayW / 2).toFixed(1)}px, ${(y - g.trayH / 2).toFixed(1)}px, 0) ` +
                `scale(var(--hl))`;
            item.el.style.filter = '';
            item.el.style.zIndex = '6';
        });

        // Ve co cau SAU KHI transform cua Khay da duoc dat -> tam kep khop tuyet doi.
        if (this.gripperRenderer) this.gripperRenderer.render(jobs);
    }

    /**
     * Ket thuc luot nhac o cong OUT: go Khay va bao engine DUNG MOT LAN.
     * Co the bi goi lai tu nhieu khung hinh, nen `exitDone` bao dam callback chi chay mot lan.
     */
    _finishExit(item) {
        if (item.exitDone) return;
        item.exitDone = true;
        item.fadingOut = true;
        const idx = this.trayElements.indexOf(item);
        if (idx > -1) this.trayElements.splice(idx, 1);
        if (item.el && item.el.parentNode) item.el.remove();
        if (item.onComplete) item.onComplete();
    }

    /**
     * Dat lai MUC TIEU vi tri cho vong Khay sao cho chung cach deu nhau, giu nguyen
     * thu tu vong tron va di chuyen it nhat (neo vao vi tri trung binh hien tai).
     * Chi dat muc tieu — animate() moi keo slotPos toi do, nen viec dan deu la mot cu
     * truot muot chu khong phai mot cu nhay.
     *
     * Day la thu thay the cho ring slot nguyen cu: Khay moi vao THANG o cong IN (nen so
     * Khay tren bang chuyen LUON bang conveyor.maxActive), roi ca vong tu dan lai cho
     * deu trong khoang 0.3s.
     */
    _respace() {
        // Khay dang duoc kep nang vao (`isEntering`) CHUA nam tren vong chay: dua no
        // vao day se keo cac Khay khac danh cho mot o khong ton tai. No duoc nha ve
        // dung slotPos cua no (xem updatePositions) o khung hinh ket thuc luot.
        const ring = this.trayElements.filter(t => !t.fadingOut && !t.isEntering);
        const n = ring.length;
        if (n === 0) return;

        const S = this.slotCount;
        const modS = v => ((v % S) + S) % S;
        const gap = S / n;

        // Mo vong tron thanh duong thang theo dung thu tu hien tai.
        const sorted = ring.slice().sort((a, b) => modS(a.slotPos) - modS(b.slotPos));
        const v = new Array(n);
        v[0] = modS(sorted[0].slotPos);
        for (let i = 1; i < n; i++) {
            v[i] = v[i - 1] + modS(modS(sorted[i].slotPos) - v[i - 1]);
        }

        // Neo = trung binh cua (v_i - i*gap) => tong quang duong phai dich la nho nhat.
        let anchor = 0;
        for (let i = 0; i < n; i++) anchor += v[i] - i * gap;
        anchor /= n;

        for (let i = 0; i < n; i++) {
            sorted[i].targetSlotPos = sorted[i].slotPos + (anchor + i * gap - v[i]);
        }
    }

    animateTrayExit(trayId, onComplete) {
        const trayData = this.trayElements.find(t => t.id === trayId);
        if (!trayData) {
            if (onComplete) onComplete();
            return;
        }
        
        trayData.isExiting = true;
        trayData.onComplete = onComplete;

        // Khay dang di ra khong con nam trong vong dan deu nua (xem _respace): no giu
        // currentTheta rieng va troi tiep toi cong OUT. Khay thay the khong doi no —
        // render() ke tiep dua Khay moi vao thang o cong IN.
        //
        // Khong bat dau luot nhac o day: Khay con phai TROI toi cong OUT truoc (xem
        // animate()). .exiting (CSS fade + scale) bi loai bo hoan toan — luot di ra
        // gio do co cau kep thuc hien, nen khay phai giu opacity 1.

        // Remove 'exiting' class just in case it was incorrectly added
        trayData.el.classList.remove('exiting');
        
        // Ensure visual shows a box
        let illustEl = trayData.el.querySelector('.tray-illustration');
        if (illustEl) illustEl.remove();
        let targetEl = trayData.el.querySelector('.tray-target');
        if (targetEl) targetEl.remove();
        
        let fullEl = trayData.el.querySelector('.tray-full');
        if (!fullEl) {
            fullEl = document.createElement('div');
            fullEl.className = 'tray-full';
            fullEl.style.fontSize = '40px';
            fullEl.style.marginTop = '10px';
            fullEl.textContent = '📦';
            trayData.el.appendChild(fullEl);
        }
    }
}
