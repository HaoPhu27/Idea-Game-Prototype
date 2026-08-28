import { getCategoryConfig, getItemEmoji } from '../data/ItemCatalog.js';

export class TrayRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.offset = 0;
        this.speed = 1.5; // pixels per frame
        this.trayElements = []; // { id, el, isExiting, currentTheta, fadingOut, onComplete }
        this.lastTime = performance.now();
        this.highlightedTrayId = null;
        this.rejectTrayId = null;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    render(activeTrays, highlightedTrayId = null, rejectTrayId = null) {
        this.highlightedTrayId = highlightedTrayId;
        this.rejectTrayId = rejectTrayId;
        
        // Sync activeTrays with trayElements
        activeTrays.forEach((tray, index) => {
            let existing = this.trayElements.find(t => t.id === tray.id);
            let trayEl;
            
            if (!existing) {
                trayEl = document.createElement('div');
                trayEl.className = 'tray';
                trayEl.dataset.trayId = tray.id;
                trayEl.style.position = 'absolute';
                trayEl.style.bottom = '25px';
                
                // Base structure
                const labelEl = document.createElement('div');
                labelEl.className = 'tray-label';
                trayEl.appendChild(labelEl);
                
                this.container.appendChild(trayEl);
                
                const catConfig = getCategoryConfig(tray.categoryId);
                if (catConfig) {
                    labelEl.textContent = catConfig.label;
                    labelEl.style.backgroundColor = catConfig.color;
                }
                
                const newTrayObj = { 
                    id: tray.id, 
                    el: trayEl, 
                    isExiting: false, 
                    currentTheta: 0,
                    fadingOut: false
                };
                this.trayElements.push(newTrayObj);
                existing = newTrayObj;
            } else {
                trayEl = existing.el;
            }
            
            // Only update visuals if it's not exiting (exiting trays manage their own visuals)
            if (!existing.isExiting) {
                trayEl.classList.remove('highlight-match', 'highlight-reject', 'exiting');
                if (tray.id === highlightedTrayId) trayEl.classList.add('highlight-match');
                if (tray.id === rejectTrayId) trayEl.classList.add('highlight-reject');
                
                // Target item (visual hint)
                let targetEl = trayEl.querySelector('.tray-target');
                if (!tray.isFull() && tray.targetItemId) {
                    if (!targetEl) {
                        targetEl = document.createElement('div');
                        targetEl.className = 'tray-target';
                        trayEl.appendChild(targetEl);
                    }
                    targetEl.textContent = getItemEmoji(tray.targetItemId);
                } else if (targetEl) {
                    targetEl.remove();
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
                if (!stillActive) {
                    t.el.remove();
                    this.trayElements.splice(i, 1);
                }
            }
        }
        
        this.updatePositions();
    }

    animate(now) {
        const dt = Math.min(now - this.lastTime, 50); // cap dt to avoid huge jumps
        this.lastTime = now;
        
        // speed in radians per frame (negative so front track moves right-to-left)
        const deltaTheta = -0.015 * (dt / 16.66);
        this.offset += deltaTheta;
        
        // Exiting trays update their own theta
        for (let i = this.trayElements.length - 1; i >= 0; i--) {
            const item = this.trayElements[i];
            if (item.isExiting) {
                item.currentTheta += deltaTheta;
                
                // Out port is at left edge (cos approaches -1). Front track (sin < 0).
                if (!item.fadingOut && Math.cos(item.currentTheta) < -0.90 && Math.sin(item.currentTheta) < 0) {
                    item.fadingOut = true;
                    item.el.classList.add('exiting'); // Trigger CSS fade out
                    setTimeout(() => {
                        if (item.onComplete) item.onComplete();
                        if (item.el.parentNode) item.el.remove();
                        const idx = this.trayElements.indexOf(item);
                        if (idx > -1) this.trayElements.splice(idx, 1);
                    }, 300);
                }
            }
        }
        
        this.updatePositions();
        requestAnimationFrame(this.animate);
    }

    updatePositions() {
        if (!this.container || this.trayElements.length === 0) return;
        
        const containerWidth = this.container.clientWidth || 600;
        const cx = containerWidth / 2;
        const cy = 110;
        const rx = (containerWidth - 90) / 2;
        const ry = 80;
        
        const activeTrays = this.trayElements.filter(t => !t.isExiting);
        const totalActive = activeTrays.length;
        
        let activeIndex = 0;
        
        this.trayElements.forEach(item => {
            let theta;
            if (!item.isExiting) {
                // Active trays space out evenly based on offset
                theta = (activeIndex / totalActive) * Math.PI * 2 + this.offset;
                item.currentTheta = theta;
                activeIndex++;
            } else {
                theta = item.currentTheta;
            }
            
            let x = cx + rx * Math.cos(theta) - 40;
            let y = cy + ry * Math.sin(theta) - 15;
            
            item.el.style.left = `${x}px`;
            item.el.style.bottom = `${y}px`;
            
            if (Math.sin(theta) <= 0) {
                item.el.style.zIndex = 10;
            } else {
                item.el.style.zIndex = 5;
            }
        });
    }

    animateTrayExit(trayId, onComplete) {
        const trayData = this.trayElements.find(t => t.id === trayId);
        if (!trayData) {
            if(onComplete) onComplete();
            return;
        }
        
        trayData.isExiting = true;
        trayData.onComplete = onComplete;
        
        // Remove 'exiting' class just in case it was incorrectly added
        trayData.el.classList.remove('exiting');
        
        // Ensure visual shows a box
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
