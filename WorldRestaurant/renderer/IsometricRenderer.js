import { CELL_TYPES } from '../engine/GameState.js';

export class IsometricRenderer {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = container;
        
        // High-Angle 2.5D Diorama Settings (Zero Occlusion, Clear Visibility)
        this.cellSize = 56;
        this.offsetX = 0;
        this.offsetY = 0;
        this.lastState = null;
        
        // Tweening properties
        this.visualRestaurants = new Map();
        this.isAnimating = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2 - 10;
        
        if (this.lastState) {
            this.computeDimensions(this.lastState);
            this.render(this.lastState);
        }
    }

    computeDimensions(state) {
        const maxDim = Math.max(state.width, state.height, 5);
        const availW = this.canvas.width - 60;
        const availH = this.canvas.height - 150;
        
        this.cellSize = Math.min(Math.floor(availW / maxDim), Math.floor(availH / maxDim), 68);
    }

    getScreenCoords(gridX, gridY) {
        if (!this.lastState) return { x: 0, y: 0 };
        const sx = (gridX - this.lastState.width / 2 + 0.5) * this.cellSize + this.offsetX;
        const sy = (gridY - this.lastState.height / 2 + 0.5) * this.cellSize + this.offsetY;
        return { x: sx, y: sy };
    }

    render(state) {
        this.lastState = state;
        this.computeDimensions(state);
        
        const now = performance.now();
        // Update visual targets
        for (const rest of state.restaurants) {
            let vis = this.visualRestaurants.get(rest.id);
            if (!vis) {
                // New restaurant (split). Start from parent's target position if available.
                let parentVis = rest.parentId ? this.visualRestaurants.get(rest.parentId) : null;
                vis = {
                    id: rest.id,
                    x: parentVis ? parentVis.targetX : rest.x,
                    y: parentVis ? parentVis.targetY : rest.y,
                    startX: parentVis ? parentVis.targetX : rest.x,
                    startY: parentVis ? parentVis.targetY : rest.y,
                    targetX: rest.x,
                    targetY: rest.y,
                    startTime: now,
                    floors: rest.floors,
                    startFloors: rest.floors,
                    targetFloors: rest.floors
                };
                this.visualRestaurants.set(rest.id, vis);
            } else {
                // Update existing
                if (vis.targetX !== rest.x || vis.targetY !== rest.y || vis.targetFloors !== rest.floors) {
                    vis.startX = vis.x; 
                    vis.startY = vis.y;
                    vis.targetX = rest.x;
                    vis.targetY = rest.y;
                    vis.startFloors = vis.floors;
                    vis.targetFloors = rest.floors;
                    vis.startTime = now;
                }
            }
        }
        
        // Remove stale restaurants (e.g. after undo)
        for (const id of this.visualRestaurants.keys()) {
            if (!state.restaurants.some(r => r.id === id)) {
                this.visualRestaurants.delete(id);
            }
        }

        if (!this.isAnimating) {
            this.isAnimating = true;
            requestAnimationFrame(this.animationLoop.bind(this));
        }
    }

    animationLoop(time) {
        if (!this.lastState) return;
        
        let needsUpdate = false;
        const DURATION = 150; // ms
        
        for (const [id, vis] of this.visualRestaurants.entries()) {
            const elapsed = time - vis.startTime;
            if (elapsed < DURATION) {
                let p = elapsed / DURATION;
                p = 1 - Math.pow(1 - p, 3); // ease-out cubic
                vis.x = vis.startX + (vis.targetX - vis.startX) * p;
                vis.y = vis.startY + (vis.targetY - vis.startY) * p;
                vis.floors = vis.startFloors + (vis.targetFloors - vis.startFloors) * p;
                needsUpdate = true;
            } else {
                vis.x = vis.targetX;
                vis.y = vis.targetY;
                vis.floors = vis.targetFloors;
            }
        }
        
        this.drawFrame();
        
        if (needsUpdate) {
            requestAnimationFrame(this.animationLoop.bind(this));
        } else {
            this.isAnimating = false;
        }
    }

    drawFrame() {
        const state = this.lastState;
        const ctx = this.ctx;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw 3D Wooden Diorama Base Table underneath the board
        this.drawBoardBase(state);

        // 2. Draw Grid Tiles (Grass, Road, Target)
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                this.drawTile(x, y, state.grid[y][x]);
            }
        }

        // 3. Draw Target / Serving Blueprints
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                if (state.grid[y][x] === CELL_TYPES.TARGET) {
                    this.drawTargetIndicator(x, y);
                }
            }
        }

        // 4. Draw Map Boundary Grid
        this.drawMapBoundaries(state);

        // 5. Draw Tiered Restaurant Towers (Zero occlusion guaranteed)
        const sortedRestaurants = Array.from(this.visualRestaurants.values()).sort((a, b) => a.y - b.y || a.x - b.x);

        for (const vis of sortedRestaurants) {
            this.drawRestaurant(vis);
        }
    }

    drawBoardBase(state) {
        const ctx = this.ctx;
        const w = state.width;
        const h = state.height;
        const halfSize = this.cellSize / 2;
        const pad = 10;
        const thickness = 14;

        const pTopLeft = this.getScreenCoords(0, 0);
        const leftX = pTopLeft.x - halfSize - pad;
        const topY = pTopLeft.y - halfSize - pad;
        const totalW = w * this.cellSize + pad * 2;
        const totalH = h * this.cellSize + pad * 2;

        // Base bottom 3D shadow rim
        ctx.fillStyle = '#1e1b18';
        ctx.beginPath();
        ctx.roundRect(leftX, topY + thickness, totalW, totalH, 12);
        ctx.fill();

        // Base wooden board border
        const boardGrad = ctx.createLinearGradient(leftX, topY, leftX, topY + totalH);
        boardGrad.addColorStop(0, '#3e2723');
        boardGrad.addColorStop(1, '#271711');
        ctx.fillStyle = boardGrad;
        ctx.beginPath();
        ctx.roundRect(leftX, topY, totalW, totalH, 12);
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner shadow inset
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(leftX + 4, topY + 4, totalW - 8, totalH - 8, 8);
        ctx.fill();
    }

    drawTile(x, y, type) {
        const ctx = this.ctx;
        const p = this.getScreenCoords(x, y);
        const half = this.cellSize / 2;
        const gap = 1.5;
        const tx = p.x - half + gap;
        const ty = p.y - half + gap;
        const tSize = this.cellSize - gap * 2;

        if (type === CELL_TYPES.ROAD) {
            // Cobblestone Asphalt Road
            const grad = ctx.createLinearGradient(tx, ty, tx + tSize, ty + tSize);
            grad.addColorStop(0, '#475569');
            grad.addColorStop(1, '#334155');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tSize, tSize, 4);
            ctx.fill();

            // Curb border
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Continuous lane markings (Connecting smoothly to neighbor road cells)
            ctx.save();
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);

            const state = this.lastState;
            if (state) {
                // North connection
                if (y === 0 || (y > 0 && state.grid[y - 1][x] === CELL_TYPES.ROAD)) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, ty);
                    ctx.stroke();
                }
                // South connection
                if (y === state.height - 1 || (y < state.height - 1 && state.grid[y + 1][x] === CELL_TYPES.ROAD)) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, ty + tSize);
                    ctx.stroke();
                }
                // West connection
                if (x === 0 || (x > 0 && state.grid[y][x - 1] === CELL_TYPES.ROAD)) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(tx, p.y);
                    ctx.stroke();
                }
                // East connection
                if (x === state.width - 1 || (x < state.width - 1 && state.grid[y][x + 1] === CELL_TYPES.ROAD)) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(tx + tSize, p.y);
                    ctx.stroke();
                }
            }
            ctx.restore();

        } else if (type === CELL_TYPES.TARGET) {
            // Golden Dining Patio / Target Blueprint Zone
            const isAlt = (x + y) % 2 === 0;
            const grad = ctx.createLinearGradient(tx, ty, tx + tSize, ty + tSize);
            if (isAlt) {
                grad.addColorStop(0, '#f59e0b');
                grad.addColorStop(1, '#d97706');
            } else {
                grad.addColorStop(0, '#fbbf24');
                grad.addColorStop(1, '#f59e0b');
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tSize, tSize, 4);
            ctx.fill();

            // Gold border with subtle glow
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.stroke();

        } else {
            // Lush Grass Land (Alternating checkerboard lawn tiles)
            const isAlt = (x + y) % 2 === 0;
            const grad = ctx.createLinearGradient(tx, ty, tx, ty + tSize);
            if (isAlt) {
                grad.addColorStop(0, '#4ade80');
                grad.addColorStop(1, '#22c55e');
            } else {
                grad.addColorStop(0, '#86efac');
                grad.addColorStop(1, '#4ade80');
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(tx, ty, tSize, tSize, 4);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Grass tufts / flowers
            if ((x * 7 + y * 13) % 4 === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(p.x - 2, p.y - 2, 2, 2);
                ctx.fillRect(p.x + 3, p.y + 2, 2, 2);
            }
        }
    }

    drawTargetIndicator(x, y) {
        const ctx = this.ctx;
        const p = this.getScreenCoords(x, y);
        const half = this.cellSize / 2;
        const offset = 6;
        const innerSize = this.cellSize - offset * 2;

        // Inner glowing dashed blueprint frame
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(p.x - half + offset, p.y - half + offset, innerSize, innerSize);
        ctx.restore();

        // Cute Golden Serving Cloche Plate in center
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y - 1, 3, Math.PI, 0);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
    }

    drawMapBoundaries(state) {
        const ctx = this.ctx;
        const half = this.cellSize / 2;
        const pTopLeft = this.getScreenCoords(0, 0);
        const leftX = pTopLeft.x - half;
        const topY = pTopLeft.y - half;
        const totalW = state.width * this.cellSize;
        const totalH = state.height * this.cellSize;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(leftX, topY, totalW, totalH);
    }

    drawRestaurant(rest) {
        const ctx = this.ctx;
        const p = this.getScreenCoords(rest.x, rest.y);
        const half = this.cellSize / 2;
        const pad = 4;
        const baseSize = this.cellSize - pad * 2;

        const baseX = p.x - half + pad;
        const baseY = p.y - half + pad;

        // 1. Soft Ambient Ground Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.roundRect(baseX + 2, baseY + 3, baseSize, baseSize, 8);
        ctx.fill();

        // 2. Draw Multi-Tiered Concentric Floors (Stacking inwards + subtle 3px elevation)
        // High stages taper inwards so they look like a grand architectural tower
        // and NEVER obstruct or overlap neighbor tiles!
        const totalFloors = Math.max(1, Math.round(rest.floors));

        for (let f = 0; f < totalFloors; f++) {
            // Concentric Inset per floor (3px each tier)
            const inset = f * 3;
            const floorElevY = f * 3.5; // Slight upward elevation, strictly contained within tile
            const floorX = baseX + inset;
            const floorY = baseY + inset - floorElevY;
            const floorSize = baseSize - inset * 2;

            if (floorSize <= 10) break; // Safety bound

            // Floor Tier Base (Terracotta Bistro Red)
            const isTopFloor = (f === totalFloors - 1);
            
            const tierGrad = ctx.createLinearGradient(floorX, floorY, floorX + floorSize, floorY + floorSize);
            tierGrad.addColorStop(0, '#e53935');
            tierGrad.addColorStop(1, '#b71c1c');
            ctx.fillStyle = tierGrad;
            ctx.beginPath();
            ctx.roundRect(floorX, floorY, floorSize, floorSize, 6);
            ctx.fill();

            // Floor Cornice / Balcony Rim
            ctx.strokeStyle = '#ffebee';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Floor drop shadow onto the floor below
            if (f > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.beginPath();
                ctx.roundRect(floorX, floorY + floorSize - 4, floorSize, 4, [0, 0, 4, 4]);
                ctx.fill();
            }

            // 3. TOP ROOF (Striped French Awning & ID Badge on highest tier)
            if (isTopFloor) {
                // Striped Awning pattern on rooftop
                const stripes = 5;
                const stripeW = floorSize / stripes;
                ctx.fillStyle = '#ffffff';
                for (let s = 1; s < stripes; s += 2) {
                    ctx.fillRect(floorX + s * stripeW, floorY, stripeW, floorSize);
                }

                // Roof outer rim
                ctx.strokeStyle = '#7f1d1d';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(floorX, floorY, floorSize, floorSize, 6);
                ctx.stroke();

                // Glowing ID Badge Pill in Center
                const centerX = floorX + floorSize / 2;
                const centerY = floorY + floorSize / 2;
                const badgeW = Math.min(floorSize - 6, 36);
                const badgeH = Math.min(floorSize - 6, 18);

                ctx.save();
                ctx.beginPath();
                ctx.roundRect(centerX - badgeW / 2, centerY - badgeH / 2, badgeW, badgeH, 5);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(0,0,0,0.6)';
                ctx.shadowBlur = 4;
                ctx.stroke();

                // ID text + Floor level indicator (e.g. #1 [4F])
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 11px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`#${rest.id}`, centerX, centerY);
                ctx.restore();

                // Height dots / Stage tier pips indicator on corners
                if (totalFloors > 1) {
                    this.drawStagePips(floorX, floorY, floorSize, totalFloors);
                }
            }
        }
    }

    drawStagePips(rx, ry, size, floors) {
        const ctx = this.ctx;
        // Draw cute little glowing golden stars/dots at the corners to indicate height
        const pips = Math.min(floors, 6);
        ctx.fillStyle = '#facc15';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;

        // Bottom right corner stage count badge
        const badgeSize = 14;
        const bx = rx + size - badgeSize / 2;
        const by = ry + size - badgeSize / 2;

        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#7c2d12';
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${floors}F`, bx, by);
    }
}
