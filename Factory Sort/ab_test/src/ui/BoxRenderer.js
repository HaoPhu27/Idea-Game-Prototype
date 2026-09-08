import { getItemEmoji, getCategoryConfig, getCategoryByItemId } from '../data/ItemCatalog.js';

export class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart, onItemDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;
        this.onItemDragStart = onItemDragStart;

        this._fitRows = null;
        this._fitChip = false;
        this._builtCols = 0;
        this._stacks = [];
        this._peekSlots = [];

        if (typeof ResizeObserver !== 'undefined' && this.container && this.container.parentElement) {
            new ResizeObserver(() => this._fitBoxHeight()).observe(this.container.parentElement);
        }

        // Phase 5 §5.3: Event delegation gắn 1 lần trên container
        if (this.container) {
            this.container.addEventListener('click', (e) => {
                if (document.body.classList.contains('is-dragging') || document.body.classList.contains('is-item-dragging')) return;
                const slot = e.target.closest('.slot');
                const boxEl = e.target.closest('.box:not(.peek-box)');
                if (!boxEl) return;
                const boxId = boxEl.dataset.boxId;
                if (slot) {
                    const i = Number(slot.dataset.slotIndex);
                    this.onSlotTap(boxId, slot.classList.contains('placeholder') ? null : i);
                } else {
                    this.onSlotTap(boxId, null);
                }
            });

            this.container.addEventListener('pointerdown', (e) => {
                const boxEl = e.target.closest('.box:not(.peek-box)');
                if (!boxEl) return;
                const boxId = boxEl.dataset.boxId;

                // 1. Keo Thung da wrapped (che do drag to tray)
                if (boxEl.classList.contains('wrapped')) {
                    if (this.onDragStart) {
                        this.onDragStart(boxId, e);
                    }
                    return;
                }

                // 2. Keo Tha tung mon item trong o slot
                const slot = e.target.closest('.slot');
                if (slot && !slot.classList.contains('placeholder')) {
                    const slotIndex = Number(slot.dataset.slotIndex);
                    if (this.onItemDragStart) {
                        this.onItemDragStart(boxId, slotIndex, slot, e);
                    }
                }
            });
        }
    }

    reset() {
        if (this.container) this.container.innerHTML = '';
        this._builtCols = 0;
        this._stacks = [];
        this._peekSlots = [];
    }

    /**
     * Dựng khung cột (băng tải, thanh nhôm, đầu nạp, đáy peeking).
     */
    buildColumns(colCount, visibleRows) {
        if (this._builtCols === colCount) return;
        this.container.innerHTML = '';
        this._stacks = [];
        this._peekSlots = [];

        this.container.style.setProperty('--rows', visibleRows);

        for (let c = 0; c < colCount; c++) {
            const colEl = document.createElement('div');
            colEl.className = 'box-column';
            colEl.dataset.colIndex = c;
            colEl.style.setProperty('--rows', visibleRows);

            const trackEl = document.createElement('div');
            trackEl.className = 'conveyor-track';
            trackEl.style.setProperty('--rows', visibleRows);

            const beltSurface = document.createElement('div');
            beltSurface.className = 'conveyor-cleat-belt';
            beltSurface.dataset.colIndex = c;

            const beamLeft = document.createElement('div');
            beamLeft.className = 'conveyor-side-beam beam-left';
            beamLeft.innerHTML = '<div class="t-slot-channel"></div>';

            const beamRight = document.createElement('div');
            beamRight.className = 'conveyor-side-beam beam-right';
            beamRight.innerHTML = '<div class="t-slot-channel"></div>';

            const entryEl = document.createElement('div');
            entryEl.className = 'conveyor-top-terminal';

            const boxStack = document.createElement('div');
            boxStack.className = 'box-stack';

            const peekSlot = document.createElement('div');
            peekSlot.className = 'conveyor-bottom-peek';

            const bottomTerminal = document.createElement('div');
            bottomTerminal.className = 'conveyor-bottom-terminal';

            trackEl.appendChild(beltSurface);
            trackEl.appendChild(beamLeft);
            trackEl.appendChild(beamRight);
            trackEl.appendChild(entryEl);
            trackEl.appendChild(boxStack);
            trackEl.appendChild(peekSlot);
            trackEl.appendChild(bottomTerminal);

            colEl.appendChild(trackEl);
            this.container.appendChild(colEl);
            this._stacks.push(boxStack);
            this._peekSlots.push(peekSlot);
        }

        this._builtCols = colCount;
    }

    /**
     * Vẽ lại Thùng tăng dần: không xoá khung, chỉ cập nhật Thùng và Thùng peek ở đáy.
     */
    render(columns, selectedSource = null, validTargetIds = [], hiddenCounts = [], visibleRows = 5, peekingBoxes = []) {
        if (columns.length && !Array.isArray(columns[0])) columns = [columns];
        this.buildColumns(columns.length, visibleRows);
        this._fitBoxHeight(visibleRows, hiddenCounts.some(n => n > 0));

        columns.forEach((boxes, c) => {
            if (this._stacks[c]) {
                this._syncStack(this._stacks[c], boxes, selectedSource, validTargetIds);
                this._syncHiddenChip(c, hiddenCounts[c] || 0);
                this._syncPeekBox(c, peekingBoxes ? peekingBoxes[c] : null);
            }
        });
    }

    _syncStack(stack, boxes, selectedSource, validTargetIds) {
        const seen = new Set();
        boxes.forEach((box, i) => {
            seen.add(String(box.id));
            let el = stack.querySelector(`.box[data-box-id="${box.id}"]`);
            if (!el) {
                el = this._createBox(box);
                stack.appendChild(el);
            }
            this._updateBox(el, box, selectedSource, validTargetIds);
            if (stack.children[i] !== el) {
                stack.insertBefore(el, stack.children[i]);
            }
        });

        // Gỡ Thùng đã rời bàn chơi
        [...stack.children].forEach(el => {
            if (!seen.has(el.dataset.boxId)) el.remove();
        });
    }

    _createBox(box) {
        const boxEl = document.createElement('div');
        boxEl.className = 'box';
        boxEl.dataset.boxId = box.id;

        const topFace = document.createElement('div');
        topFace.className = 'top-face';

        for (let i = 0; i < 3; i++) {
            const slotEl = document.createElement('div');
            slotEl.className = 'slot';
            slotEl.dataset.slotIndex = i;
            topFace.appendChild(slotEl);
        }

        const frontFace = document.createElement('div');
        frontFace.className = 'front-face';

        const flapTop = document.createElement('div');
        flapTop.className = 'flap top';

        const flapBottom = document.createElement('div');
        flapBottom.className = 'flap bottom';

        const tape = document.createElement('div');
        tape.className = 'tape';

        const logoEl = document.createElement('div');
        logoEl.className = 'box-logo';

        boxEl.appendChild(topFace);
        boxEl.appendChild(frontFace);
        boxEl.appendChild(flapTop);
        boxEl.appendChild(flapBottom);
        boxEl.appendChild(tape);
        boxEl.appendChild(logoEl);

        return boxEl;
    }

    _updateBox(el, box, selectedSource, validTargetIds) {
        el.classList.toggle('empty-box', box.isEmpty());
        el.classList.toggle('wrapped', box.isWrapped);
        el.classList.toggle('valid-target', !box.isWrapped && validTargetIds.includes(box.id));
        el.classList.toggle('selected', !box.isWrapped && !!selectedSource && selectedSource.boxId === box.id);
        el.classList.toggle('near-pack', !box.isWrapped && box.items.length >= 2 && box.items[0] === box.items[1]);

        el.style.cursor = box.isWrapped ? 'grab' : '';

        const catId = box.getCategory() || (box.items.length > 0 ? getCategoryByItemId(box.items[0]) : null);
        const catConfig = catId ? getCategoryConfig(catId) : null;
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        if (catConfig) {
            el.style.setProperty('--cat-color', catConfig.color);
        }

        const logoEl = el.querySelector('.box-logo');
        if (logoEl) {
            if (catConfig) logoEl.style.setProperty('--cat-color', catConfig.color);
            logoEl.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
        }

        const slots = el.querySelectorAll('.slot');
        for (let i = 0; i < 3; i++) {
            const item = box.slots ? box.slots[i] : (i < box.items.length ? box.items[i] : null);
            const has = item !== null && item !== undefined;
            const text = has ? getItemEmoji(item) : '—';
            if (slots[i].textContent !== text) {
                slots[i].textContent = text;
            }
            slots[i].classList.toggle('placeholder', !has);
            slots[i].dataset.slotIndex = i;
            slots[i].dataset.hasItem = has ? 'true' : 'false';
            slots[i].classList.toggle('selected', has && !!selectedSource && selectedSource.boxId === box.id && selectedSource.itemIndex === i);
        }
    }

    _syncHiddenChip(colIndex, hidden) {
        const colEl = this.container.children[colIndex];
        if (!colEl) return;
        let chip = colEl.querySelector('.column-hidden-count');
        if (hidden > 0) {
            if (!chip) {
                chip = document.createElement('div');
                chip.className = 'column-hidden-count';
                colEl.appendChild(chip);
            }
            chip.textContent = `+${hidden}`;
            chip.title = `Còn ${hidden} Thùng đang chờ bên dưới cột này`;
        } else if (chip) {
            chip.remove();
        }
    }

    triggerRollAnimation(colIndex) {
        const cls = 'rolling-up';
        if (colIndex !== undefined && colIndex !== null) {
            const belt = this.container.querySelector(`.conveyor-cleat-belt[data-col-index="${colIndex}"]`);
            if (belt) {
                belt.classList.remove(cls, 'rolling-down');
                void belt.offsetWidth;
                belt.classList.add(cls);
                setTimeout(() => belt.classList.remove(cls), 2450);
            }
        } else {
            const belts = this.container.querySelectorAll('.conveyor-cleat-belt');
            belts.forEach(belt => {
                belt.classList.remove(cls, 'rolling-down');
                void belt.offsetWidth;
                belt.classList.add(cls);
                setTimeout(() => belt.classList.remove(cls), 2450);
            });
        }
    }

    _syncPeekBox(colIndex, box) {
        const slot = this._peekSlots[colIndex];
        if (!slot) return;

        if (!box) {
            slot.innerHTML = '';
            slot.dataset.boxId = '';
            return;
        }

        let peekBoxEl = slot.querySelector('.box.peek-box');
        if (!peekBoxEl || peekBoxEl.dataset.peekBoxId !== String(box.id)) {
            slot.innerHTML = '';
            peekBoxEl = this._createBox(box);
            peekBoxEl.classList.add('peek-box');
            peekBoxEl.dataset.peekBoxId = String(box.id);
            peekBoxEl.removeAttribute('data-box-id'); // Không thể click chọn hay kéo thả
            slot.appendChild(peekBoxEl);
        }
        this._updateBox(peekBoxEl, box, null, []);
    }

    _fitBoxHeight(visibleRows, hasHiddenChip) {
        if (Number.isFinite(visibleRows)) this._fitRows = visibleRows;
        if (hasHiddenChip !== undefined) this._fitChip = hasHiddenChip;
        const rows = this._fitRows || 4;
        const area = this.container.parentElement;
        if (!area || !Number.isFinite(rows)) return;

        const avail = area.clientHeight;
        if (avail < 120) return;

        const cs = getComputedStyle(this.container);
        const gap = parseFloat(cs.columnGap || cs.gap) || 8;

        const colW = this.container.firstElementChild
            ? this.container.firstElementChild.getBoundingClientRect().width
            : this.container.clientWidth / (this._builtCols || 3);
        const slotW = Math.max(18, (colW - 4 /*border*/ - 8 /*padding*/ - 8 /*2x gap*/) / 3);
        this.container.style.setProperty('--slot-size', `${slotW.toFixed(1)}px`);

        const peekH = 34;
        const room = avail - 16 - peekH - (rows - 1) * gap;
        const h = Math.max(50, Math.floor(room / rows));

        // Tỉ lệ hộp 3D cân đối, chiều cao thoải mái không bị ép dẹp
        const capped = Math.min(h, Math.round(slotW * 3.2), 104);
        this.container.style.setProperty('--box-h', `${Math.max(50, capped)}px`);
        this.container.style.setProperty('--stack-gap', `${gap}px`);
        this.container.style.setProperty('--peek-h', `${peekH}px`);
        this.container.style.setProperty('--rows', `${rows}`);
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        const srcSlot = document.querySelector(`.box[data-box-id="${sourceBoxId}"] .slot.selected`);
        const targetEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);

        if (!srcSlot || !targetEl) {
            onComplete();
            return;
        }

        const from = srcSlot.getBoundingClientRect();
        const to = targetEl.getBoundingClientRect();

        const fly = document.createElement('div');
        fly.className = 'item-animating';
        fly.textContent = srcSlot.textContent;
        fly.style.left = `${from.left}px`;
        fly.style.top = `${from.top}px`;
        document.body.appendChild(fly);

        const dx = (to.left + to.width / 2 - 12) - from.left;
        const dy = (to.top + to.height / 2 - 12) - from.top;

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
