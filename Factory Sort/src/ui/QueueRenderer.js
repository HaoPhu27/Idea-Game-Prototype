import { getCategoryConfig, getItemEmoji, getCategoryIcon } from '../data/ItemCatalog.js';

export class QueueRenderer {
    constructor() {
        this.areaEl = document.getElementById('queue-area');
        this.slotsContainer = document.getElementById('queue-slots');
        this.counterEl = document.getElementById('queue-counter');
        this.maxSlots = 5;
    }

    render(queue = []) {
        if (!this.slotsContainer) return;

        const count = queue.length;
        if (this.counterEl) {
            this.counterEl.textContent = `${count}/${this.maxSlots}`;
            this.counterEl.classList.toggle('warning', count === 4);
            this.counterEl.classList.toggle('danger', count >= 5);
        }

        if (this.areaEl) {
            this.areaEl.classList.toggle('warning', count === 4);
            this.areaEl.classList.toggle('danger', count >= 5);
        }

        const slotEls = this.slotsContainer.querySelectorAll('.queue-slot');
        slotEls.forEach((slotEl, idx) => {
            const box = queue[idx];
            if (box) {
                slotEl.classList.add('occupied');
                slotEl.dataset.boxId = box.id;

                const catConfig = getCategoryConfig(box.getCategory());
                const catColor = catConfig ? catConfig.color : '#f59e0b';
                const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
                const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

                // Check if already rendered
                let boxEl = slotEl.querySelector('.queue-box');
                if (!boxEl) {
                    boxEl = document.createElement('div');
                    boxEl.className = 'queue-box';
                    boxEl.innerHTML = `<span class="queue-box-icon">${displayEmoji}</span>`;
                    slotEl.innerHTML = '';
                    slotEl.appendChild(boxEl);
                }
                boxEl.style.setProperty('--cat-color', catColor);
                boxEl.title = catConfig ? catConfig.label : '';
            } else {
                slotEl.classList.remove('occupied');
                delete slotEl.dataset.boxId;
                slotEl.innerHTML = '';
            }
        });
    }

    /**
     * Bay hop tu vi tri tren cot xuong slot trong hang cho
     */
    animateBoxToQueue(box, targetSlotIndex, fromEl, onComplete) {
        if (!fromEl || !this.slotsContainer) {
            if (onComplete) onComplete();
            return;
        }

        const slotEls = this.slotsContainer.querySelectorAll('.queue-slot');
        const targetSlot = slotEls[targetSlotIndex];
        if (!targetSlot) {
            if (onComplete) onComplete();
            return;
        }

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = targetSlot.getBoundingClientRect();

        const catConfig = getCategoryConfig(box.getCategory());
        const catColor = catConfig ? catConfig.color : '#f59e0b';
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        const ghost = document.createElement('div');
        ghost.className = 'flying-queue-box queue-box';
        ghost.style.setProperty('--cat-color', catColor);
        ghost.style.width = `${fromRect.width}px`;
        ghost.style.height = `${fromRect.height}px`;
        ghost.style.left = `${fromRect.left}px`;
        ghost.style.top = `${fromRect.top}px`;
        ghost.style.transformOrigin = 'center center';
        ghost.innerHTML = `<span class="queue-box-icon" style="font-size:28px;">${displayEmoji}</span>`;
        document.body.appendChild(ghost);

        const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
        const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
        const scaleX = toRect.width / fromRect.width;
        const scaleY = toRect.height / fromRect.height;
        const targetScale = Math.min(scaleX, scaleY);

        requestAnimationFrame(() => {
            ghost.style.transform = `translate(${dx}px, ${dy}px) scale(${targetScale})`;
        });

        setTimeout(() => {
            ghost.remove();
            if (onComplete) onComplete();
        }, 360);
    }

    /**
     * Bay hop tu slot hang cho vao tray tren conveyor
     */
    animateBoxToTray(box, fromSlotEl, trayEl, onComplete) {
        if (!fromSlotEl || !trayEl) {
            if (onComplete) onComplete();
            return;
        }

        const fromRect = fromSlotEl.getBoundingClientRect();
        const toRect = trayEl.getBoundingClientRect();

        const catConfig = getCategoryConfig(box.getCategory());
        const catColor = catConfig ? catConfig.color : '#f59e0b';
        const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
        const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');

        const ghost = document.createElement('div');
        ghost.className = 'flying-queue-box queue-box';
        ghost.style.setProperty('--cat-color', catColor);
        ghost.style.width = `${fromRect.width}px`;
        ghost.style.height = `${fromRect.height}px`;
        ghost.style.left = `${fromRect.left}px`;
        ghost.style.top = `${fromRect.top}px`;
        ghost.style.transformOrigin = 'center center';
        ghost.innerHTML = `<span class="queue-box-icon">${displayEmoji}</span>`;
        document.body.appendChild(ghost);

        // Hide source slot box during flight
        const innerBox = fromSlotEl.querySelector('.queue-box');
        if (innerBox) innerBox.style.opacity = '0';

        const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
        const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);

        requestAnimationFrame(() => {
            ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.6)`;
            ghost.style.opacity = '0.4';
        });

        setTimeout(() => {
            ghost.remove();
            if (onComplete) onComplete();
        }, 360);
    }
}
