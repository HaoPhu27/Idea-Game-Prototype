import { getItemEmoji, getCategoryConfig, getCategoryByItemId } from '../data/ItemCatalog.js';

export class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;

        // Chieu cao kha dung doi khi xoay man hinh, khi thanh dia chi cua trinh duyet
        // di dong an/hien, va ngay sau khi lop phu "dang tai" tat. Bam theo no thay vi
        // chi do mot lan luc render.
        this._fitRows = null;
        this._fitChip = false;
        if (typeof ResizeObserver !== 'undefined' && this.container && this.container.parentElement) {
            new ResizeObserver(() => this._fitBoxHeight()).observe(this.container.parentElement);
        }
    }

    /**
     * Ve khu Thung theo COT.
     *
     * @param {Array<Array<Box>>} columns  columns[c] = Thung DANG HIEN cua cot c,
     *        phan tu 0 la o duoi cung. Chi truyen vao Thung trong tam voi — Thung
     *        bi che khong duoc ve, va cung khong duoc gan su kien nao.
     * @param {Array<number>} hiddenCounts  so Thung con bi che tren dinh moi cot,
     *        chi de hien mot chip dem. Noi dung cua chung van bi giau hoan toan.
     *
     * Van chap nhan mot mang Thung phang (level cu / debug): khi do gom het vao
     * mot cot duy nhat.
     */
    render(columns, selectedSource = null, validTargetIds = [], hiddenCounts = [], visibleRows = 5) {
        this.container.innerHTML = '';
        if (columns.length && !Array.isArray(columns[0])) columns = [columns];

        this._fitBoxHeight(visibleRows, hiddenCounts.some(n => n > 0));

        columns.forEach((boxes, colIndex) => {
        const colEl = document.createElement('div');
        colEl.className = 'box-column';
        colEl.style.setProperty('--rows', visibleRows);

        const boxStack = document.createElement('div');
        boxStack.className = 'box-stack';

        boxes.forEach(box => {
            const boxEl = document.createElement('div');
            boxEl.className = 'box';
            boxEl.dataset.boxId = box.id;
            
            if (box.isEmpty()) boxEl.classList.add('empty-box');
            if (validTargetIds.includes(box.id)) boxEl.classList.add('valid-target');
            if (box.isWrapped) boxEl.classList.add('wrapped');
            if (selectedSource && selectedSource.boxId === box.id) boxEl.classList.add('selected');

            // 1. Top Face (contains slots)
            const topFace = document.createElement('div');
            topFace.className = 'top-face';

            // Render slots (3 slots max)
            for (let i = 0; i < 3; i++) {
                const slotEl = document.createElement('div');
                slotEl.className = 'slot';
                
                if (i < box.items.length) {
                    slotEl.textContent = getItemEmoji(box.items[i]);
                    // Highlight specifically selected item
                    if (selectedSource && selectedSource.boxId === box.id && selectedSource.itemIndex === i) {
                        slotEl.classList.add('selected');
                    }
                } else {
                    slotEl.classList.add('placeholder');
                    slotEl.textContent = '—';
                }
                
                slotEl.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent box click
                    if (document.body.classList.contains('is-dragging')) return;
                    this.onSlotTap(box.id, i < box.items.length ? i : null);
                });
                
                topFace.appendChild(slotEl);
            }

            // 2. Front Face
            const frontFace = document.createElement('div');
            frontFace.className = 'front-face';

            // 3. Flaps (Top and Bottom edges)
            const flapTop = document.createElement('div'); flapTop.className = 'flap top';
            const flapBottom = document.createElement('div'); flapBottom.className = 'flap bottom';

            // 4. Tape
            const tape = document.createElement('div');
            tape.className = 'tape';

            // 5. Category Logo (shown when box is packed/wrapped)
            const logoEl = document.createElement('div');
            logoEl.className = 'box-logo';
            const catId = box.getCategory() || (box.items.length > 0 ? getCategoryByItemId(box.items[0]) : null);
            const catConfig = catId ? getCategoryConfig(catId) : null;
            const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
            const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
            if (catConfig) {
                boxEl.style.setProperty('--cat-color', catConfig.color);
                logoEl.style.setProperty('--cat-color', catConfig.color);
                logoEl.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
            }

            boxEl.appendChild(topFace);
            boxEl.appendChild(frontFace);
            boxEl.appendChild(flapTop);
            boxEl.appendChild(flapBottom);
            boxEl.appendChild(tape);
            boxEl.appendChild(logoEl);

            // Events for tapping the box itself (like tapping an empty area)
            boxEl.addEventListener('click', (e) => {
                // Ignore clicks if we are dragging
                if (document.body.classList.contains('is-dragging')) return;
                this.onSlotTap(box.id, null);
            });

            // Drag events for wrapped boxes
            if (box.isWrapped) {
                boxEl.style.cursor = 'grab';
                boxEl.addEventListener('pointerdown', (e) => {
                    this.onDragStart(box.id, e);
                });
            }

            boxStack.appendChild(boxEl);
        });

        colEl.appendChild(boxStack);

        // Chip dem Thung con bi che. Chi la SO LUONG — khong he lo noi dung, nen
        // khong dung toi mo hinh do kho (von gia dinh Thung an la bi mat hoan toan).
        // Them SAU CUNG vi cot dung flex-direction: column-reverse, nen phan tu
        // cuoi trong DOM moi nam tren cung tren man hinh.
        const hidden = hiddenCounts[colIndex] || 0;
        if (hidden > 0) {
            const chip = document.createElement('div');
            chip.className = 'column-hidden-count';
            chip.textContent = `+${hidden}`;
            chip.title = `Còn ${hidden} Thùng bị che phía trên cột này`;
            colEl.appendChild(chip);
        }

        this.container.appendChild(colEl);
        });
    }

    /**
     * Chieu cao mot Thung phai vua khit so hang DANG HIEN, khong duoc co dinh.
     *
     * Truoc day .box cao cung 75px va .box-stack cao `rows*75 + (rows-1)*gap`. Voi
     * visibleRows = 4 (moi tier tu 9/2026 deu hien 3x4) thi cot cao ~400px trong mot
     * khu Thung chi cao ~330px: HANG TREN CUNG BI CAT, nguoi choi khong nhin thay
     * Thung ma engine noi la dang hien va khong cham vao no duoc.
     *
     * O day ta do chieu cao thuc con lai roi ha --box-h xuong cho vua. San duoi 44px
     * la kich thuoc vung cham toi thieu; duoi muc do thi tha de trong scroll con hon
     * la lam Thung khong bam duoc.
     */
    _fitBoxHeight(visibleRows, hasHiddenChip) {
        if (Number.isFinite(visibleRows)) this._fitRows = visibleRows;
        if (hasHiddenChip !== undefined) this._fitChip = hasHiddenChip;
        const rows = this._fitRows;
        const area = this.container.parentElement;
        if (!area || !Number.isFinite(rows)) return;

        // Trong luc lop phu "dang tai" con hien, khu Thung bi ep xuong con vai pixel.
        // Do o thoi diem do roi ghi lai se khoa Thung o san 44px cho ca van dau, du
        // sau do co thua cho. Bo qua nhung phep do vo nghia va cho ResizeObserver goi lai.
        const avail = area.clientHeight;
        if (avail < 120) return;

        const cs = getComputedStyle(this.container);
        const gap = parseFloat(cs.columnGap || cs.gap) || 10;
        // Chip "+N" nam trong .box-column, va cot ay CO gap giua chip va chong Thung
        // (cung bang `gap`) — quen phan gap do la ly do phep tinh dau tien van tran
        // ra khoi khu Thung 14px.
        const chip = this._fitChip ? 20 + gap : 0;
        const room = avail - chip - (rows - 1) * gap - 2;   // 2px de danh cho drop-shadow
        const h = Math.max(44, Math.min(75, Math.floor(room / rows)));
        this.container.style.setProperty('--box-h', `${h}px`);
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        const srcSlot = document.querySelector(`.box[data-box-id="${sourceBoxId}"] .slot.selected`);
        const targetEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);
        
        if (!srcSlot || !targetEl) {
            onComplete();
            return;
        }

        const from = srcSlot.getBoundingClientRect();
        const to   = targetEl.getBoundingClientRect();

        const fly = document.createElement('div');
        fly.className = 'item-animating';
        fly.textContent = srcSlot.textContent;
        fly.style.left = `${from.left}px`;
        fly.style.top  = `${from.top}px`;
        document.body.appendChild(fly);

        const dx = (to.left + to.width / 2 - 12) - from.left;
        const dy = (to.top  + to.height / 2 - 12) - from.top;

        requestAnimationFrame(() => {
            fly.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
        });

        setTimeout(() => {
            fly.remove();
            targetEl.style.transform = 'scale(1.08)';
            setTimeout(() => { targetEl.style.transform = ''; onComplete(); }, 90);
        }, 300);
    }
}
