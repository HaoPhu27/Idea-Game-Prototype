// src/ui/TrayRenderer.js

export class TrayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.trayElements = [];
    }

    init(traysData, onTrayClick) {
        this.container.innerHTML = '';
        this.trayElements = [];

        traysData.forEach((tray, index) => {
            const el = document.createElement('div');
            el.className = 'tray';
            el.dataset.index = index;

            el.addEventListener('click', (e) => {
                onTrayClick(index);
            });

            this.container.appendChild(el);
            this.trayElements.push(el);
            
            this.updateTray(index, tray);
        });
    }

    updateTray(index, trayData) {
        const el = this.trayElements[index];
        el.innerHTML = ''; // Clear slots

        // Update classes based on state
        el.className = 'tray';
        if (trayData.state === 'unable') {
            el.classList.add('unable');
        } else if (trayData.state === 'harvested') {
            el.classList.add('harvesting');
        } else if (trayData.color) {
            el.classList.add(`color-${trayData.color}`);
        }

        // Draw slots
        if (trayData.state !== 'unable') {
            for (let i = 0; i < trayData.totalSlots; i++) {
                const slotEl = document.createElement('div');
                slotEl.className = 'tray-slot';
                if (trayData.slots[i]) {
                    slotEl.classList.add('filled');
                    slotEl.classList.add(`color-${trayData.color}`);
                }
                el.appendChild(slotEl);
            }
        }
    }

    playHarvestAnimation(index, newColor, onComplete) {
        const el = this.trayElements[index];
        el.classList.add('harvesting');
        
        setTimeout(() => {
            el.classList.remove('harvesting');
            onComplete();
        }, 500); // 0.5s animation
    }
}
