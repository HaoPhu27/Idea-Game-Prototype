// src/ui/ConveyorRenderer.js

export class ConveyorRenderer {
    constructor(containerId) {
        this.track = document.getElementById(containerId);
        this.clustersData = new Map(); // id -> { data, el, t }
        
        this.getPathMetrics = () => {
            const straightW = 120; // hw(180) - cr(60)
            const r = 38; // cr(60) - innerOffset(22)
            const topLen = straightW * 2;
            const rightArc = Math.PI * r;
            const botLen = straightW * 2;
            const leftArc = Math.PI * r;
            const total = topLen + rightArc + botLen + leftArc;
            
            return {
                straightW, r,
                topFrac: topLen / total,
                rightFrac: rightArc / total,
                botFrac: botLen / total,
                leftFrac: leftArc / total
            };
        };

        this.getPathPosition = (t) => {
            t = ((t % 1) + 1) % 1;
            const { straightW, r, topFrac, rightFrac, botFrac, leftFrac } = this.getPathMetrics();
            const cx = 180;
            const cy = 60;
            const hh = 60;
            const innerOffset = 22;
            
            let x, y;
            if (t < topFrac) {
                const frac = t / topFrac;
                x = cx - straightW + frac * 2 * straightW;
                y = cy - hh + innerOffset;
            } else if (t < topFrac + rightFrac) {
                const frac = (t - topFrac) / rightFrac;
                const angle = -Math.PI / 2 + frac * Math.PI;
                x = cx + straightW + r * Math.cos(angle);
                y = cy + r * Math.sin(angle);
            } else if (t < topFrac + rightFrac + botFrac) {
                const frac = (t - topFrac - rightFrac) / botFrac;
                x = cx + straightW - frac * 2 * straightW;
                y = cy + hh - innerOffset;
            } else {
                const frac = (t - topFrac - rightFrac - botFrac) / leftFrac;
                const angle = Math.PI / 2 + frac * Math.PI;
                x = cx - straightW + r * Math.cos(angle);
                y = cy + r * Math.sin(angle);
            }
            return { x, y };
        };

        const trayXPositions = [75, 180, 285]; // Center X of each tray relative to conveyor track
        const absorbRadius = 15;

        const animate = () => {
            this.clustersData.forEach(item => {
                if (item.docked) return; // Skip if it's already docking
                
                item.t += 0.003; // speed
                
                // Reset flag when a new lap starts
                if (item.t >= 1) {
                    item.t -= 1;
                    item.checkedTrays = new Set();
                }
                
                const pos = this.getPathPosition(item.t);
                if (item.el) {
                    item.el.style.left = `${pos.x - 22}px`; // -22 for center offset (44/2)
                    item.el.style.top = `${pos.y - 22}px`;
                }
                
                // Check docking when at bottom path
                if (item.t >= 0.5 && item.t <= 0.84) {
                    if (!item.checkedTrays) item.checkedTrays = new Set();
                    
                    // It moves right to left on the bottom, so it approaches tray 2, then 1, then 0
                    for (let i = 2; i >= 0; i--) {
                        if (!item.checkedTrays.has(i)) {
                            const tx = trayXPositions[i];
                            if (Math.abs(pos.x - tx) < absorbRadius) {
                                item.checkedTrays.add(i);
                                
                                if (this.onClusterReachedTray) {
                                    const success = this.onClusterReachedTray(item.data.id, i);
                                    if (success) {
                                        item.docked = true;
                                        // Remove from tracking so update() doesn't delete it instantly
                                        this.clustersData.delete(item.data.id);
                                        
                                        // Play absorb animation
                                        const el = item.el;
                                        el.style.transition = 'all 0.35s cubic-bezier(0.5, 0, 1, 0.5)';
                                        el.style.left = `${tx - 22}px`;
                                        el.style.top = `220px`; // Move completely down into the tray
                                        el.style.transform = 'scale(0.3) rotate(90deg)';
                                        el.style.opacity = '0';
                                        
                                        setTimeout(() => {
                                            if (el && el.parentNode) el.parentNode.removeChild(el);
                                        }, 350);
                                        
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            });
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    init(onConveyorClick, onClusterReachedTray) {
        this.onClusterReachedTray = onClusterReachedTray;
        const container = this.track.parentElement;
        container.onclick = (e) => {
            onConveyorClick();
        };
        this.track.innerHTML = '';
        this.clustersData.clear();
    }

    update(clusters, capacity = 7, fromTubeIndex = undefined) {
        // Update Progress Bar
        const totalUnits = clusters.reduce((sum, c) => sum + c.size, 0);
        const progressContainer = document.getElementById('conveyor-progress-container');
        if (progressContainer) {
            const progressBar = document.getElementById('conveyor-progress-bar');
            const progressText = document.getElementById('conveyor-progress-text');
            const percent = (totalUnits / capacity) * 100;
            progressBar.style.width = `${Math.min(100, percent)}%`;
            progressText.innerText = `${totalUnits} / ${capacity}`;
            
            if (totalUnits >= capacity) {
                progressBar.classList.add('full');
            } else {
                progressBar.classList.remove('full');
            }
        }

        const currentIds = new Set(clusters.map(c => c.id));
        for (const [id, item] of this.clustersData.entries()) {
            if (!currentIds.has(id)) {
                if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
                this.clustersData.delete(id);
            }
        }

        clusters.forEach((cluster) => {
            if (!this.clustersData.has(cluster.id)) {
                const el = document.createElement('div');
                el.className = `conveyor-cluster color-${cluster.color}`;
                el.dataset.id = cluster.id;
                // No text content needed since we separated the slimes
                

                const { topFrac } = this.getPathMetrics();
                let startT = topFrac / 2; // Center of top edge
                
                // Tránh overlap nếu đã có item
                let overlap = true;
                let attempts = 0;
                while (overlap && attempts < 20) {
                    overlap = false;
                    attempts++;
                    for (const item of this.clustersData.values()) {
                        let t = item.t % 1;
                        let s = startT % 1;
                        let dist = Math.min(Math.abs(t - s), 1 - Math.abs(t - s));
                        if (dist < 0.08) {
                            overlap = true;
                            startT -= 0.10;
                            if (startT < 0) startT += 1;
                            break;
                        }
                    }
                }
                
                if (fromTubeIndex !== undefined && cluster.id === clusters[clusters.length - 1].id) {
                    el.classList.add('newly-dropped');
                    setTimeout(() => { if (el) el.classList.remove('newly-dropped'); }, 300);
                }
                
                this.track.appendChild(el);
                this.clustersData.set(cluster.id, { data: cluster, el, t: startT });
            } else {
                const item = this.clustersData.get(cluster.id);
                item.data = cluster;
                // No text content needed
            }
        });
    }
}
