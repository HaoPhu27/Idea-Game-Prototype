import { CELL_TYPES } from '../engine/GameState.js';

const BUILDING_PALETTE = ['#3FA968', '#4F86E8', '#E07A3F', '#9B6BD6', '#D9534F', '#2BB3A3'];

/**
 * Adjust hex color brightness. Positive percent lightens towards white; negative darkens towards black.
 * Always returns a hex string '#rrggbb' with 2-digit channels.
 */
function adjustBrightness(hex, percent) {
    let clean = String(hex).replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    if (percent > 0) {
        r = Math.min(255, Math.round(r + (255 - r) * percent));
        g = Math.min(255, Math.round(g + (255 - g) * percent));
        b = Math.min(255, Math.round(b + (255 - b) * percent));
    } else if (percent < 0) {
        const factor = 1 + percent;
        r = Math.max(0, Math.round(r * factor));
        g = Math.max(0, Math.round(g * factor));
        b = Math.max(0, Math.round(b * factor));
    }

    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get the 6 vertices of the true outer hexagonal silhouette of an isometric building block.
 */
function getBuildingSilhouette(p, bW, bH, H) {
    return [
        { x: p.x - bW / 2, y: p.y },
        { x: p.x,          y: p.y + bH / 2 },
        { x: p.x + bW / 2, y: p.y },
        { x: p.x + bW / 2, y: p.y - H },
        { x: p.x,          y: p.y - H - bH / 2 },
        { x: p.x - bW / 2, y: p.y - H }
    ];
}

/**
 * Ray-casting algorithm to test whether point (px, py) is inside polygon.
 */
function pointInPolygon(px, py, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const xi = vertices[i].x, yi = vertices[i].y;
        const xj = vertices[j].x, yj = vertices[j].y;
        const intersect = ((yi > py) !== (yj > py))
            && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

export class IsometricRenderer {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = container;

        this.dpr = 1;
        this.viewW = 0;
        this.viewH = 0;

        // Isometric board geometry
        this.cellSize = 56;
        this.originX = 0;
        this.originY = 0;
        this.lastState = null;

        // Offscreen background canvas cache
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.lastBgKey = null;

        // Offscreen building canvas cache
        this.bldCanvas = document.createElement('canvas');
        this.bldCtx = this.bldCanvas.getContext('2d');

        // Palette assignment by order of appearance
        this.buildingColorMap = new Map();
        this.currentLevelId = null;

        // Restaurant tweening
        this.visualRestaurants = new Map();
        this.isAnimating = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    toggleViewMode() {
        return 'iso';
    }

    resize() {
        this.viewW = this.container.clientWidth;
        this.viewH = this.container.clientHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = Math.round(this.viewW * this.dpr);
        this.canvas.height = Math.round(this.viewH * this.dpr);
        this.canvas.style.width = this.viewW + 'px';
        this.canvas.style.height = this.viewH + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.bldCanvas.width = Math.round(this.viewW * this.dpr);
        this.bldCanvas.height = Math.round(this.viewH * this.dpr);
        this.bldCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.lastBgKey = null;

        if (this.lastState) {
            this.computeDimensions(this.lastState);
            this.render(this.lastState);
        }
    }

    computeDimensions(state) {
        const W = state.width || 1;
        const H = state.height || 1;

        // Determine max possible building height for vertical clearance
        let maxFloors = state.cloudLimit || 6;
        if (state.restaurants && state.restaurants.length > 0) {
            for (const r of state.restaurants) {
                if (r.floors > maxFloors) maxFloors = r.floors;
            }
        }
        maxFloors = Math.max(maxFloors, 4);

        // Reserve 70px at top for HUD and 110px at bottom for controls
        const topReserve = 70;
        const bottomReserve = 110;
        const availW = Math.max(100, this.viewW - 40);
        const availH = Math.max(100, this.viewH - topReserve - bottomReserve);

        // Base thickness (18px) + badge margin
        const baseThickness = 18;
        const badgeMargin = 24;

        // Horizontal constraint: (W + H) * cellSize / 2 <= availW
        const cellFromW = (2 * availW) / (W + H);

        // Vertical constraint: (W + H + maxFloors) * (cellSize / 4) + (baseThickness + badgeMargin) <= availH
        const cellFromH = (4 * (availH - baseThickness - badgeMargin)) / (W + H + maxFloors);

        this.cellSize = Math.min(Math.floor(cellFromW), Math.floor(cellFromH), 96);
        this.cellSize = Math.max(24, this.cellSize);

        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const floorH = tileH * 0.5;

        // Horizontally center the isometric grid
        this.originX = this.viewW / 2 - ((W - H) * tileW) / 4;

        // Vertically center the entire scene (towers + ground + diorama base)
        const topExtent = tileH / 2 + maxFloors * floorH + badgeMargin;
        const bottomExtent = (W + H - 1) * (tileH / 2) + baseThickness;
        const targetCenterY = (topReserve + (this.viewH - bottomReserve)) / 2;
        this.originY = targetCenterY - (bottomExtent - topExtent) / 2;
    }

    getScreenCoords(gridX, gridY) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const sx = (gridX - gridY) * (tileW / 2) + this.originX;
        const sy = (gridX + gridY) * (tileH / 2) + this.originY;
        return { x: sx, y: sy };
    }

    getBuildingColor(id) {
        if (!this.buildingColorMap.has(id)) {
            const idx = this.buildingColorMap.size % BUILDING_PALETTE.length;
            this.buildingColorMap.set(id, BUILDING_PALETTE[idx]);
        }
        return this.buildingColorMap.get(id);
    }

    render(state) {
        if (!this.lastState || this.lastState.id !== state.id) {
            this.buildingColorMap.clear();
        }

        this.lastState = state;
        this.computeDimensions(state);

        // Register colors for initial restaurants in order of appearance
        for (const rest of state.restaurants) {
            this.getBuildingColor(rest.id);
        }

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

        for (const vis of this.visualRestaurants.values()) {
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
        if (!state) return;

        // Check offscreen background cache key
        const bgKey = `${this.viewW}_${this.viewH}_${this.dpr}_${this.cellSize}_${this.originX}_${this.originY}_${state.width}_${state.height}_` +
            state.grid.map(row => row.join('')).join('|');

        if (this.lastBgKey !== bgKey) {
            this.renderBackgroundToOffscreen(state);
            this.lastBgKey = bgKey;
        }

        // 1. Draw cached board background
        this.ctx.clearRect(0, 0, this.viewW, this.viewH);
        this.ctx.drawImage(this.bgCanvas, 0, 0, this.viewW, this.viewH);

        // 2. Sort restaurants by (x + y) ascending, ties broken by x
        const sortedRestaurants = Array.from(this.visualRestaurants.values()).sort((a, b) => {
            const sumA = a.x + a.y;
            const sumB = b.x + b.y;
            if (Math.abs(sumA - sumB) > 0.0001) return sumA - sumB;
            return a.x - b.x;
        });

        // 3. Draw restaurants with occlusion transparency
        for (const vis of sortedRestaurants) {
            const occluding = this.isOccluding(vis, state);
            this.drawBuilding(vis, occluding);
        }

        // 4. Draw top overlay layer (target dashed borders + floor badges)
        this.drawTargetOverlays(state);
        this.drawFloorBadges(sortedRestaurants);
    }

    renderBackgroundToOffscreen(state) {
        this.bgCanvas.width = Math.round(this.viewW * this.dpr);
        this.bgCanvas.height = Math.round(this.viewH * this.dpr);
        this.bgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.bgCtx.clearRect(0, 0, this.viewW, this.viewH);

        // 1. Diorama base block
        this.drawDioramaBase(this.bgCtx, state);

        // 2. Ground grid tiles
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                this.drawTile(this.bgCtx, x, y, state.grid[y][x], state);
            }
        }
    }

    drawDioramaBase(ctx, state) {
        const W = state.width;
        const H = state.height;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const depth = 18;

        const T = { x: this.originX, y: this.originY - tileH / 2 };
        const R = { x: this.originX + W * (tileW / 2), y: this.originY + (W - 1) * (tileH / 2) };
        const B = { x: this.originX + (W - H) * (tileW / 2), y: this.originY + (W + H - 1) * (tileH / 2) };
        const L = { x: this.originX - H * (tileW / 2), y: this.originY + (H - 1) * (tileH / 2) };

        // Base top face under tiles
        ctx.beginPath();
        ctx.moveTo(T.x, T.y);
        ctx.lineTo(R.x, R.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(L.x, L.y);
        ctx.closePath();
        ctx.fillStyle = '#553A29';
        ctx.fill();

        // Left side face (L -> B)
        ctx.beginPath();
        ctx.moveTo(L.x, L.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(B.x, B.y + depth);
        ctx.lineTo(L.x, L.y + depth);
        ctx.closePath();
        ctx.fillStyle = '#6B4A35';
        ctx.fill();
        ctx.strokeStyle = '#4A3325';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right side face (B -> R)
        ctx.beginPath();
        ctx.moveTo(B.x, B.y);
        ctx.lineTo(R.x, R.y);
        ctx.lineTo(R.x, R.y + depth);
        ctx.lineTo(B.x, B.y + depth);
        ctx.closePath();
        ctx.fillStyle = '#553A29';
        ctx.fill();
        ctx.strokeStyle = '#3D281D';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawTile(ctx, x, y, type, state) {
        const p = this.getScreenCoords(x, y);
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;

        this.drawRhombus(ctx, p.x, p.y, tileW, tileH);

        if (type === CELL_TYPES.ROAD) {
            ctx.fillStyle = '#5B6577';
            ctx.fill();
            ctx.strokeStyle = '#46505F';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Dashed lane markings connecting to neighboring road cells
            ctx.save();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);

            let connected = false;
            if (y > 0 && state.grid[y - 1][x] === CELL_TYPES.ROAD) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + tileW / 4, p.y - tileH / 4);
                ctx.stroke();
                connected = true;
            }
            if (y < state.height - 1 && state.grid[y + 1][x] === CELL_TYPES.ROAD) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - tileW / 4, p.y + tileH / 4);
                ctx.stroke();
                connected = true;
            }
            if (x > 0 && state.grid[y][x - 1] === CELL_TYPES.ROAD) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - tileW / 4, p.y - tileH / 4);
                ctx.stroke();
                connected = true;
            }
            if (x < state.width - 1 && state.grid[y][x + 1] === CELL_TYPES.ROAD) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + tileW / 4, p.y + tileH / 4);
                ctx.stroke();
                connected = true;
            }

            if (!connected) {
                ctx.beginPath();
                ctx.moveTo(p.x - tileW / 6, p.y - tileH / 6);
                ctx.lineTo(p.x + tileW / 6, p.y + tileH / 6);
                ctx.stroke();
            }
            ctx.restore();

        } else if (type === CELL_TYPES.TARGET) {
            ctx.fillStyle = '#F5B324';
            ctx.fill();
            ctx.strokeStyle = '#D48F0C';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Small diamond mark at center
            this.drawRhombus(ctx, p.x, p.y, tileW * 0.35, tileH * 0.35);
            ctx.fillStyle = '#FFF275';
            ctx.fill();
            ctx.strokeStyle = '#D48F0C';
            ctx.lineWidth = 1;
            ctx.stroke();

        } else if (type === CELL_TYPES.BLOCKER) {
            ctx.fillStyle = '#3E2723';
            ctx.fill();
            ctx.strokeStyle = '#271711';
            ctx.lineWidth = 1;
            ctx.stroke();

        } else {
            // Default land
            ctx.fillStyle = '#8FBF5A';
            ctx.fill();
            ctx.strokeStyle = '#6D9A40';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawRhombus(ctx, cx, cy, w, h) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - h / 2);
        ctx.lineTo(cx + w / 2, cy);
        ctx.lineTo(cx, cy + h / 2);
        ctx.lineTo(cx - w / 2, cy);
        ctx.closePath();
    }

    isOccluding(buildingA, state) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const bW = tileW * 0.7;
        const bH = tileH * 0.7;
        const floorH = tileH * 0.5;

        const floorsA = Math.max(1, Math.round(buildingA.floors));
        const totalHA = floorsA * floorH;
        const p = this.getScreenCoords(buildingA.x, buildingA.y);

        const polyA = getBuildingSilhouette(p, bW, bH, totalHA);

        const ax = buildingA.targetX !== undefined ? buildingA.targetX : buildingA.x;
        const ay = buildingA.targetY !== undefined ? buildingA.targetY : buildingA.y;
        const sumA = ax + ay;

        // 1. Check target cells behind building A
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                if (state.grid[y][x] === CELL_TYPES.TARGET) {
                    if ((x + y) < sumA - 0.001) {
                        const sQ = this.getScreenCoords(x, y);
                        if (pointInPolygon(sQ.x, sQ.y, polyA)) {
                            return true;
                        }
                    }
                }
            }
        }

        // 2. Check other restaurants behind building A
        for (const other of this.visualRestaurants.values()) {
            if (other.id !== buildingA.id) {
                const qx = other.targetX !== undefined ? other.targetX : other.x;
                const qy = other.targetY !== undefined ? other.targetY : other.y;
                if ((qx + qy) < sumA - 0.001) {
                    const sQ = this.getScreenCoords(qx, qy);
                    if (pointInPolygon(sQ.x, sQ.y, polyA)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    drawBuilding(vis, occluding = false) {
        const p = this.getScreenCoords(vis.x, vis.y);
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const bW = tileW * 0.7;
        const bH = tileH * 0.7;
        const floorH = tileH * 0.5;

        // 1. Ground shadow: black rhombus with alpha 0.25 (drawn directly on main canvas)
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.drawRhombus(this.ctx, p.x, p.y, bW * 1.05, bH * 1.05);
        this.ctx.fill();
        this.ctx.restore();

        const totalFloors = Math.max(1, Math.round(vis.floors));

        if (occluding) {
            // Draw body + awning into shared offscreen canvas
            this.bldCtx.clearRect(0, 0, this.viewW, this.viewH);
            this.drawBuildingBody(this.bldCtx, vis, p, bW, bH, floorH, totalFloors);

            // Composite onto main canvas with globalAlpha 0.35
            this.ctx.save();
            this.ctx.globalAlpha = 0.35;
            this.ctx.drawImage(this.bldCanvas, 0, 0, this.viewW, this.viewH);
            this.ctx.restore();

            // Draw outer silhouette (white outline, alpha 0.6, lineWidth 1.5)
            const poly = getBuildingSilhouette(p, bW, bH, totalFloors * floorH);
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(poly[0].x, poly[0].y);
            for (let i = 1; i < poly.length; i++) {
                this.ctx.lineTo(poly[i].x, poly[i].y);
            }
            this.ctx.closePath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            this.ctx.restore();
        } else {
            // Draw body directly on main canvas
            this.drawBuildingBody(this.ctx, vis, p, bW, bH, floorH, totalFloors);
        }
    }

    drawBuildingBody(ctx, vis, p, bW, bH, floorH, totalFloors) {
        const baseColor = this.getBuildingColor(vis.id);

        for (let f = 0; f < totalFloors; f++) {
            const isOdd = (f % 2 === 1);
            const floorBase = isOdd ? adjustBrightness(baseColor, -0.12) : baseColor;
            const leftColor = adjustBrightness(floorBase, 0.0);
            const rightColor = adjustBrightness(floorBase, -0.25);
            const topColor = adjustBrightness(floorBase, 0.22);
            const strokeColor = adjustBrightness(floorBase, -0.35);

            const elevBottom = f * floorH;
            const elevTop = (f + 1) * floorH;

            // Left face (medium)
            ctx.beginPath();
            ctx.moveTo(p.x - bW / 2, p.y - elevBottom);
            ctx.lineTo(p.x, p.y - elevBottom + bH / 2);
            ctx.lineTo(p.x, p.y - elevTop + bH / 2);
            ctx.lineTo(p.x - bW / 2, p.y - elevTop);
            ctx.closePath();
            ctx.fillStyle = leftColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Right face (dark)
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - elevBottom + bH / 2);
            ctx.lineTo(p.x + bW / 2, p.y - elevBottom);
            ctx.lineTo(p.x + bW / 2, p.y - elevTop);
            ctx.lineTo(p.x, p.y - elevTop + bH / 2);
            ctx.closePath();
            ctx.fillStyle = rightColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Top face (light)
            const T = { x: p.x, y: p.y - elevTop - bH / 2 };
            const R = { x: p.x + bW / 2, y: p.y - elevTop };
            const B = { x: p.x, y: p.y - elevTop + bH / 2 };
            const L = { x: p.x - bW / 2, y: p.y - elevTop };

            if (f === totalFloors - 1) {
                // Top roof: striped French awning (#C9432F & #FFFFFF)
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(T.x, T.y);
                ctx.lineTo(R.x, R.y);
                ctx.lineTo(B.x, B.y);
                ctx.lineTo(L.x, L.y);
                ctx.closePath();
                ctx.clip();

                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                ctx.fillStyle = '#C9432F';
                const stripes = 6;
                for (let s = 0; s < stripes; s += 2) {
                    const t0 = s / stripes;
                    const t1 = (s + 1) / stripes;
                    const p1 = { x: L.x + (T.x - L.x) * t0, y: L.y + (T.y - L.y) * t0 };
                    const p2 = { x: L.x + (T.x - L.x) * t1, y: L.y + (T.y - L.y) * t1 };
                    const p3 = { x: B.x + (R.x - B.x) * t1, y: B.y + (R.y - B.y) * t1 };
                    const p4 = { x: B.x + (R.x - B.x) * t0, y: B.y + (R.y - B.y) * t0 };

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.restore();

                ctx.beginPath();
                ctx.moveTo(T.x, T.y);
                ctx.lineTo(R.x, R.y);
                ctx.lineTo(B.x, B.y);
                ctx.lineTo(L.x, L.y);
                ctx.closePath();
                ctx.strokeStyle = '#8E2819';
                ctx.lineWidth = 1.2;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(T.x, T.y);
                ctx.lineTo(R.x, R.y);
                ctx.lineTo(B.x, B.y);
                ctx.lineTo(L.x, L.y);
                ctx.closePath();
                ctx.fillStyle = topColor;
                ctx.fill();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    drawTargetOverlays(state) {
        const ctx = this.ctx;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;

        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);

        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                if (state.grid[y][x] === CELL_TYPES.TARGET) {
                    const p = this.getScreenCoords(x, y);
                    this.drawRhombus(ctx, p.x, p.y, tileW, tileH);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
    }

    drawFloorBadges(sortedRestaurants) {
        const ctx = this.ctx;
        const tileH = this.cellSize / 2;
        const floorH = tileH * 0.5;

        const radius = Math.max(10, this.cellSize * 0.16);
        const fontSize = Math.max(14, Math.round(this.cellSize * 0.22));

        ctx.save();
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const vis of sortedRestaurants) {
            const floorsCount = Math.max(1, Math.round(vis.floors));
            const totalHeight = floorsCount * floorH;
            const p = this.getScreenCoords(vis.x, vis.y);

            const badgeX = p.x;
            const badgeY = p.y - totalHeight;

            // White circular badge
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Badge border #2A211B
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Bold floor number #2A211B
            ctx.fillStyle = '#2A211B';
            ctx.fillText(String(floorsCount), badgeX, badgeY);
        }
        ctx.restore();
    }
}
