import { getItemEmoji } from '../data/ItemCatalog.js';

export class BoxRenderer {
    constructor(containerId, onSlotTap, onDragStart) {
        this.container = document.getElementById(containerId);
        this.onSlotTap = onSlotTap;
        this.onDragStart = onDragStart;
    }

    render(boxes, selectedSource = null, validTargetIds = []) {
        this.container.innerHTML = '';
        
        boxes.forEach(box => {
            const boxEl = document.createElement('div');
            boxEl.className = 'box';
            boxEl.dataset.boxId = box.id;
            
            if (box.isEmpty()) boxEl.classList.add('empty-box');
            if (validTargetIds.includes(box.id)) boxEl.classList.add('valid-target');
            if (box.isWrapped) boxEl.classList.add('wrapped');

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

            boxEl.appendChild(topFace);
            boxEl.appendChild(frontFace);
            boxEl.appendChild(flapTop);
            boxEl.appendChild(flapBottom);
            boxEl.appendChild(tape);

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

            this.container.appendChild(boxEl);
        });
    }

    animateItemTransfer(sourceBoxId, targetBoxId, onComplete) {
        // Find DOM elements
        const sourceEl = this.container.querySelector(`.box[data-box-id="${sourceBoxId}"]`);
        const targetEl = this.container.querySelector(`.box[data-box-id="${targetBoxId}"]`);
        
        if (!sourceEl || !targetEl) {
            onComplete();
            return;
        }

        // We assume the top-most item in source is moving to the next empty slot in target.
        // For prototype, we'll just do a quick generic animation or call onComplete directly.
        // Let's do a simple flash for now to keep it robust.
        targetEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            targetEl.style.transform = '';
            onComplete();
        }, 150);
    }
}
