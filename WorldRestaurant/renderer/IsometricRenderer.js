import { CELL_TYPES } from '../engine/GameState.js';

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
 * 6 Handcrafted Restaurant Types (Diorama flat style, no external images, no emoji).
 */
const RESTAURANT_TYPES = [
    {
        key: 'pho',
        wall: '#F3E3C3',
        wallDark: adjustBrightness('#F3E3C3', -0.22),
        trim: '#7C4A32',
        awningA: '#C9432F',
        awningB: '#F5B324',
        prop: 'lantern'
    },
    {
        key: 'sushi',
        wall: '#F7F4EE',
        wallDark: adjustBrightness('#F7F4EE', -0.22),
        trim: '#6B4A35',
        awningA: '#2F4C8C',
        awningB: '#FFFFFF',
        prop: 'noren'
    },
    {
        key: 'pizza',
        wall: '#E9C9A0',
        wallDark: adjustBrightness('#E9C9A0', -0.22),
        trim: '#7A482F',
        awningA: '#3FA968',
        awningB: '#FFFFFF',
        awningC: '#D9534F',
        prop: 'chimney'
    },
    {
        key: 'cafe',
        wall: '#D9B99B',
        wallDark: adjustBrightness('#D9B99B', -0.22),
        trim: '#5A3E2B',
        awningA: '#8A5A3B',
        awningB: '#F3E3C3',
        prop: 'coffee'
    },
    {
        key: 'burger',
        wall: '#FFD36E',
        wallDark: adjustBrightness('#FFD36E', -0.22),
        trim: '#8B5A2B',
        awningA: '#D9534F',
        awningB: '#FFFFFF',
        prop: 'burger'
    },
    {
        key: 'taco',
        wall: '#F2A65A',
        wallDark: adjustBrightness('#F2A65A', -0.22),
        trim: '#6E4028',
        awningA: '#9B6BD6',
        awningB: '#F5B324',
        prop: 'cactus'
    }
];

/**
 * Project coordinates on the isometric Left face to pixel coordinates.
 * Left face runs horizontally from Left corner (u=0) to Bottom corner (u=1).
 * v runs vertically from floor bottom (v=0) to floor top (v=1).
 */
function faceLeft(p, u, v, elev = 0, bW = p.bW, bH = p.bH, floorH = p.floorH) {
    const width = bW !== undefined ? bW : (p.bW || 0);
    const height = bH !== undefined ? bH : (p.bH || 0);
    const flH = floorH !== undefined ? floorH : (p.floorH || 0);
    return {
        x: p.x - (1 - u) * (width / 2),
        y: (p.y - elev) + u * (height / 2) - v * flH
    };
}

/**
 * Project coordinates on the isometric Right face to pixel coordinates.
 * Right face runs horizontally from Bottom corner (u=0) to Right corner (u=1).
 * v runs vertically from floor bottom (v=0) to floor top (v=1).
 */
function faceRight(p, u, v, elev = 0, bW = p.bW, bH = p.bH, floorH = p.floorH) {
    const width = bW !== undefined ? bW : (p.bW || 0);
    const height = bH !== undefined ? bH : (p.bH || 0);
    const flH = floorH !== undefined ? floorH : (p.floorH || 0);
    return {
        x: p.x + u * (width / 2),
        y: (p.y - elev) + (1 - u) * (height / 2) - v * flH
    };
}

/**
 * Draw a filled and stroked 4-point isometric polygon.
 */
function drawFaceQuad(ctx, p1, p2, p3, p4, fillStyle, strokeStyle, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

/**
 * Draw a rectangular region on Left face in isometric perspective.
 */
function drawLeftRect(ctx, p, bW, bH, floorH, u1, u2, v1, v2, elev, fill, stroke, lineWidth = 1) {
    const p1 = faceLeft(p, u1, v1, elev, bW, bH, floorH);
    const p2 = faceLeft(p, u2, v1, elev, bW, bH, floorH);
    const p3 = faceLeft(p, u2, v2, elev, bW, bH, floorH);
    const p4 = faceLeft(p, u1, v2, elev, bW, bH, floorH);
    drawFaceQuad(ctx, p1, p2, p3, p4, fill, stroke, lineWidth);
}

/**
 * Draw a rectangular region on Right face in isometric perspective.
 */
function drawRightRect(ctx, p, bW, bH, floorH, u1, u2, v1, v2, elev, fill, stroke, lineWidth = 1) {
    const p1 = faceRight(p, u1, v1, elev, bW, bH, floorH);
    const p2 = faceRight(p, u2, v1, elev, bW, bH, floorH);
    const p3 = faceRight(p, u2, v2, elev, bW, bH, floorH);
    const p4 = faceRight(p, u1, v2, elev, bW, bH, floorH);
    drawFaceQuad(ctx, p1, p2, p3, p4, fill, stroke, lineWidth);
}

/**
 * Draw an overhanging striped awning with small bottom teeth or solid LOD block.
 */
function drawAwning(ctx, pTop1, pTop2, pBot1, pBot2, type, isLOD) {
    if (isLOD) {
        drawFaceQuad(ctx, pTop1, pTop2, pBot2, pBot1, type.awningA, '#2A211B', 1);
        return;
    }

    const stripes = 6;
    for (let s = 0; s < stripes; s++) {
        const t1 = s / stripes;
        const t2 = (s + 1) / stripes;
        const pt1 = { x: pTop1.x + (pTop2.x - pTop1.x) * t1, y: pTop1.y + (pTop2.y - pTop1.y) * t1 };
        const pt2 = { x: pTop1.x + (pTop2.x - pTop1.x) * t2, y: pTop1.y + (pTop2.y - pTop1.y) * t2 };
        const pb1 = { x: pBot1.x + (pBot2.x - pBot1.x) * t1, y: pBot1.y + (pBot2.y - pBot1.y) * t1 };
        const pb2 = { x: pBot1.x + (pBot2.x - pBot1.x) * t2, y: pBot1.y + (pBot2.y - pBot1.y) * t2 };

        let color;
        if (type.key === 'pizza') {
            const pizzaColors = [type.awningA, type.awningB, type.awningC || '#D9534F'];
            color = pizzaColors[s % 3];
        } else {
            color = (s % 2 === 0) ? type.awningA : type.awningB;
        }

        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.lineTo(pb2.x, pb2.y);
        ctx.lineTo(pb1.x, pb1.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Small bottom tooth / scallop
        const pMid = {
            x: (pb1.x + pb2.x) / 2,
            y: (pb1.y + pb2.y) / 2 + 2
        };
        ctx.beginPath();
        ctx.moveTo(pb1.x, pb1.y);
        ctx.lineTo(pb2.x, pb2.y);
        ctx.lineTo(pMid.x, pMid.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Outer 1px perimeter outline
    ctx.beginPath();
    ctx.moveTo(pTop1.x, pTop1.y);
    ctx.lineTo(pTop2.x, pTop2.y);
    ctx.lineTo(pBot2.x, pBot2.y);
    ctx.lineTo(pBot1.x, pBot1.y);
    ctx.closePath();
    ctx.strokeStyle = '#2A211B';
    ctx.lineWidth = 1;
    ctx.stroke();
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

        // Offscreen building canvas cache (used for occlusion pass)
        this.bldCanvas = document.createElement('canvas');
        this.bldCtx = this.bldCanvas.getContext('2d');

        // Restaurant type assignment by order of appearance
        this.buildingTypeMap = new Map();
        this.currentLevelId = null;

        // Sprite cache: Map<key, {canvas, anchorX, anchorY, w, h}>
        this.spriteCache = new Map();
        this.lastCacheCellSize = null;
        this.lastCacheDpr = null;

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
        const newDpr = Math.min(window.devicePixelRatio || 1, 2);

        if (this.lastCacheDpr !== newDpr) {
            this.spriteCache.clear();
            this.lastCacheDpr = newDpr;
        }
        this.dpr = newDpr;

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
        const badgeMargin = 26;

        // Horizontal constraint: (W + H) * cellSize / 2 <= availW
        const cellFromW = (2 * availW) / (W + H);

        // Vertical constraint: (W + H + maxFloors) * (cellSize / 4) + (baseThickness + badgeMargin) <= availH
        const cellFromH = (4 * (availH - baseThickness - badgeMargin)) / (W + H + maxFloors);

        const newCellSize = Math.max(24, Math.min(Math.floor(cellFromW), Math.floor(cellFromH), 96));
        if (this.lastCacheCellSize !== newCellSize) {
            this.spriteCache.clear();
            this.lastCacheCellSize = newCellSize;
        }
        this.cellSize = newCellSize;

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

    /**
     * Get restaurant type object by restaurant ID (assigned by order of appearance).
     */
    getBuildingType(id) {
        if (!this.buildingTypeMap.has(id)) {
            const idx = this.buildingTypeMap.size % RESTAURANT_TYPES.length;
            this.buildingTypeMap.set(id, RESTAURANT_TYPES[idx]);
        }
        return this.buildingTypeMap.get(id);
    }

    /**
     * Public API compatibility: returns wall base color for restaurant ID.
     */
    getBuildingColor(id) {
        return this.getBuildingType(id).wall;
    }

    render(state) {
        if (!this.lastState || this.lastState.id !== state.id) {
            this.buildingTypeMap.clear();
        }

        this.lastState = state;
        this.computeDimensions(state);

        // Register restaurant types for initial restaurants in order of appearance
        for (const rest of state.restaurants) {
            this.getBuildingType(rest.id);
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

        const typeA = this.getBuildingType(buildingA.id);
        const hasRoofProp = (typeA.prop === 'chimney' || typeA.prop === 'coffee' || typeA.prop === 'burger');
        const propHA = hasRoofProp ? 0.6 * floorH : 0;

        const floorsA = Math.max(1, Math.round(buildingA.floors));
        const totalHA = floorsA * floorH + propHA;
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
            // Draw body into shared offscreen canvas
            this.bldCtx.clearRect(0, 0, this.viewW, this.viewH);
            this.drawBuildingBody(this.bldCtx, vis, p, bW, bH, floorH, totalFloors);

            // Composite onto main canvas with globalAlpha 0.35
            this.ctx.save();
            this.ctx.globalAlpha = 0.35;
            this.ctx.drawImage(this.bldCanvas, 0, 0, this.viewW, this.viewH);
            this.ctx.restore();

            // Draw outer silhouette (white outline, alpha 0.6, lineWidth 1.5)
            const type = this.getBuildingType(vis.id);
            const hasRoofProp = (type.prop === 'chimney' || type.prop === 'coffee' || type.prop === 'burger');
            const propH = hasRoofProp ? 0.6 * floorH : 0;
            const poly = getBuildingSilhouette(p, bW, bH, totalFloors * floorH + propH);

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

    /**
     * Draw building body via offscreen sprite cache.
     */
    drawBuildingBody(ctx, vis, p, bW, bH, floorH, totalFloors) {
        const type = this.getBuildingType(vis.id);
        const sprite = this.getBuildingSprite(type, totalFloors);
        ctx.drawImage(sprite.canvas, p.x - sprite.anchorX, p.y - sprite.anchorY, sprite.w, sprite.h);
    }

    /**
     * Retrieve or generate cached offscreen sprite for (typeKey, floors, cellSize, dpr).
     */
    getBuildingSprite(type, floors) {
        const cacheKey = `${type.key}_${floors}_${this.cellSize}_${this.dpr}`;
        let cached = this.spriteCache.get(cacheKey);
        if (cached) return cached;

        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const bW = tileW * 0.7;
        const bH = tileH * 0.7;
        const floorH = tileH * 0.5;

        const hasRoofProp = (type.prop === 'chimney' || type.prop === 'coffee' || type.prop === 'burger');
        const propH = hasRoofProp ? 0.6 * floorH : 0;

        const padX = 14;
        const padY = 14;

        const w = Math.ceil(bW + padX * 2);
        const h = Math.ceil(floors * floorH + bH + propH + padY * 2);
        const anchorX = Math.round(padX + bW / 2);
        const anchorY = Math.round(h - padY - bH / 2);

        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(w * this.dpr);
        canvas.height = Math.ceil(h * this.dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        const p = { x: anchorX, y: anchorY };
        const isLOD = this.cellSize < 40;

        this.renderBuildingToContext(ctx, type, p, bW, bH, floorH, floors, isLOD);

        cached = { canvas, anchorX, anchorY, w, h };
        this.spriteCache.set(cacheKey, cached);
        return cached;
    }

    /**
     * Render complete diorama restaurant structure onto given context.
     */
    renderBuildingToContext(ctx, type, p, bW, bH, floorH, totalFloors, isLOD) {
        const strokeColor = '#2A211B';
        const topColor = adjustBrightness(type.wall, 0.15);

        // 1. Draw floors from ground up
        for (let f = 0; f < totalFloors; f++) {
            const elev = f * floorH;

            // Left face (wall)
            drawLeftRect(ctx, p, bW, bH, floorH, 0, 1, 0, 1, elev, type.wall, strokeColor, 1);

            // Right face (dark wall = -22%)
            drawRightRect(ctx, p, bW, bH, floorH, 0, 1, 0, 1, elev, type.wallDark, strokeColor, 1);

            // Floor horizontal trim divider (f >= 1)
            if (f >= 1) {
                ctx.strokeStyle = type.trim;
                ctx.lineWidth = 1.5;
                const l1 = faceLeft(p, 0, 0, elev, bW, bH, floorH);
                const l2 = faceLeft(p, 1, 0, elev, bW, bH, floorH);
                ctx.beginPath();
                ctx.moveTo(l1.x, l1.y);
                ctx.lineTo(l2.x, l2.y);
                ctx.stroke();

                const r1 = faceRight(p, 0, 0, elev, bW, bH, floorH);
                const r2 = faceRight(p, 1, 0, elev, bW, bH, floorH);
                ctx.beginPath();
                ctx.moveTo(r1.x, r1.y);
                ctx.lineTo(r2.x, r2.y);
                ctx.stroke();
            }

            // Ground floor details (f = 0)
            if (f === 0) {
                // Entrance door on left face (dark #2A211B, width ~30%, height ~75%)
                drawLeftRect(ctx, p, bW, bH, floorH, 0.35, 0.65, 0.0, 0.75, elev, '#2A211B', type.trim, 1);

                if (!isLOD) {
                    // Door knob
                    const knob = faceLeft(p, 0.60, 0.40, elev, bW, bH, floorH);
                    ctx.fillStyle = '#F5B324';
                    ctx.beginPath();
                    ctx.arc(knob.x, knob.y, 1.2, 0, Math.PI * 2);
                    ctx.fill();

                    // Large glass window on right face (#9FD3E6 framed with trim)
                    drawRightRect(ctx, p, bW, bH, floorH, 0.15, 0.85, 0.20, 0.78, elev, '#9FD3E6', type.trim, 1.5);
                    const wmTop = faceRight(p, 0.50, 0.78, elev, bW, bH, floorH);
                    const wmBot = faceRight(p, 0.50, 0.20, elev, bW, bH, floorH);
                    ctx.beginPath();
                    ctx.moveTo(wmTop.x, wmTop.y);
                    ctx.lineTo(wmBot.x, wmBot.y);
                    ctx.strokeStyle = type.trim;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Striped Awnings above ground floor
                const overhang = Math.max(4, Math.min(6, Math.round(this.cellSize * 0.1)));
                const dx = overhang * 0.55;
                const dy = overhang;

                // Left awning
                const lTop1 = faceLeft(p, 0.12, 0.86, elev, bW, bH, floorH);
                const lTop2 = faceLeft(p, 0.88, 0.86, elev, bW, bH, floorH);
                const lBot1 = { x: lTop1.x - dx, y: lTop1.y + dy };
                const lBot2 = { x: lTop2.x - dx, y: lTop2.y + dy };
                drawAwning(ctx, lTop1, lTop2, lBot1, lBot2, type, isLOD);

                // Right awning
                const rTop1 = faceRight(p, 0.12, 0.86, elev, bW, bH, floorH);
                const rTop2 = faceRight(p, 0.88, 0.86, elev, bW, bH, floorH);
                const rBot1 = { x: rTop1.x + dx, y: rTop1.y + dy };
                const rBot2 = { x: rTop2.x + dx, y: rTop2.y + dy };
                drawAwning(ctx, rTop1, rTop2, rBot1, rBot2, type, isLOD);

            } else {
                // Upper floors (f >= 1): 2 small windows on each face
                if (!isLOD) {
                    const strokeTrim = type.trim;
                    const glassColor = '#9FD3E6';
                    // Left face windows
                    drawLeftRect(ctx, p, bW, bH, floorH, 0.15, 0.45, 0.25, 0.75, elev, glassColor, strokeTrim, 1);
                    drawLeftRect(ctx, p, bW, bH, floorH, 0.55, 0.85, 0.25, 0.75, elev, glassColor, strokeTrim, 1);

                    // Right face windows
                    drawRightRect(ctx, p, bW, bH, floorH, 0.15, 0.45, 0.25, 0.75, elev, glassColor, strokeTrim, 1);
                    drawRightRect(ctx, p, bW, bH, floorH, 0.55, 0.85, 0.25, 0.75, elev, glassColor, strokeTrim, 1);
                }
            }
        }

        // 2. Roof face (light wall color +15%)
        const roofElev = totalFloors * floorH;
        const T = { x: p.x, y: p.y - roofElev - bH / 2 };
        const R = { x: p.x + bW / 2, y: p.y - roofElev };
        const B = { x: p.x, y: p.y - roofElev + bH / 2 };
        const L = { x: p.x - bW / 2, y: p.y - roofElev };

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

        // Parapet railing rim in trim color
        ctx.beginPath();
        ctx.moveTo(T.x, T.y);
        ctx.lineTo(R.x, R.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(L.x, L.y);
        ctx.closePath();
        ctx.strokeStyle = type.trim;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Ground and Roof Props
        this.drawProps(ctx, type, p, bW, bH, floorH, totalFloors, isLOD);
    }

    /**
     * Draw distinctive restaurant prop (lanterns, noren, chimney, cafe sign, burger sign, cactus).
     */
    drawProps(ctx, type, p, bW, bH, floorH, totalFloors, isLOD) {
        if (type.prop === 'lantern') {
            // Pho: red lanterns hung on both sides of entrance door
            if (isLOD) return;
            const uList = [0.20, 0.80];
            for (const u of uList) {
                const pHang = faceLeft(p, u, 0.82, 0, bW, bH, floorH);
                const pLantern = faceLeft(p, u, 0.65, 0, bW, bH, floorH);

                ctx.beginPath();
                ctx.moveTo(pHang.x, pHang.y);
                ctx.lineTo(pLantern.x, pLantern.y);
                ctx.strokeStyle = '#2A211B';
                ctx.lineWidth = 1;
                ctx.stroke();

                const rw = Math.max(2, Math.round(bW * 0.05));
                const rh = Math.max(3, Math.round(floorH * 0.22));

                ctx.fillStyle = '#C9432F';
                ctx.strokeStyle = '#2A211B';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(pLantern.x - rw, pLantern.y, rw * 2, rh);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#F5B324';
                ctx.fillRect(pLantern.x - rw, pLantern.y, rw * 2, 1.5);
                ctx.fillRect(pLantern.x - rw, pLantern.y + rh - 1.5, rw * 2, 1.5);

                ctx.beginPath();
                ctx.moveTo(pLantern.x, pLantern.y + rh);
                ctx.lineTo(pLantern.x, pLantern.y + rh + 2.5);
                ctx.strokeStyle = '#F5B324';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

        } else if (type.prop === 'noren') {
            // Sushi: 3 blue fabric noren strips across door entrance
            const rodP1 = faceLeft(p, 0.32, 0.77, 0, bW, bH, floorH);
            const rodP2 = faceLeft(p, 0.68, 0.77, 0, bW, bH, floorH);
            ctx.beginPath();
            ctx.moveTo(rodP1.x, rodP1.y);
            ctx.lineTo(rodP2.x, rodP2.y);
            ctx.strokeStyle = type.trim;
            ctx.lineWidth = 2;
            ctx.stroke();

            const uStrips = [
                [0.35, 0.43],
                [0.46, 0.54],
                [0.57, 0.65]
            ];
            for (const [u1, u2] of uStrips) {
                drawLeftRect(ctx, p, bW, bH, floorH, u1, u2, 0.46, 0.75, 0, '#2F4C8C', '#1D2E54', 1);
                if (!isLOD) {
                    const center = faceLeft(p, (u1 + u2) / 2, 0.60, 0, bW, bH, floorH);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(center.x, center.y, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

        } else if (type.prop === 'chimney') {
            // Pizza: brick chimney on roof (max height 0.6 * floorH)
            const roofElev = totalFloors * floorH;
            const chimH = 0.6 * floorH;
            const chimW = bW * 0.20;
            const chimD = bH * 0.20;
            const chimP = {
                x: p.x - bW * 0.12,
                y: p.y - roofElev - bH * 0.10
            };

            // Left face
            ctx.beginPath();
            ctx.moveTo(chimP.x - chimW / 2, chimP.y);
            ctx.lineTo(chimP.x, chimP.y + chimD / 2);
            ctx.lineTo(chimP.x, chimP.y + chimD / 2 - chimH);
            ctx.lineTo(chimP.x - chimW / 2, chimP.y - chimH);
            ctx.closePath();
            ctx.fillStyle = '#C2593F';
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Right face
            ctx.beginPath();
            ctx.moveTo(chimP.x, chimP.y + chimD / 2);
            ctx.lineTo(chimP.x + chimW / 2, chimP.y);
            ctx.lineTo(chimP.x + chimW / 2, chimP.y - chimH);
            ctx.lineTo(chimP.x, chimP.y + chimD / 2 - chimH);
            ctx.closePath();
            ctx.fillStyle = '#9B3D28';
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Top flue opening
            ctx.beginPath();
            ctx.moveTo(chimP.x, chimP.y - chimH - chimD / 2);
            ctx.lineTo(chimP.x + chimW / 2, chimP.y - chimH);
            ctx.lineTo(chimP.x, chimP.y - chimH + chimD / 2);
            ctx.lineTo(chimP.x - chimW / 2, chimP.y - chimH);
            ctx.closePath();
            ctx.fillStyle = '#2A211B';
            ctx.fill();
            ctx.strokeStyle = '#D67055';
            ctx.lineWidth = 1;
            ctx.stroke();

        } else if (type.prop === 'coffee') {
            // Cafe: circular coffee cup sign on roof (max height 0.6 * floorH)
            const roofElev = totalFloors * floorH;
            const signTotalH = 0.6 * floorH;
            const baseP = { x: p.x, y: p.y - roofElev };

            // Stand pole
            ctx.beginPath();
            ctx.moveTo(baseP.x, baseP.y);
            ctx.lineTo(baseP.x, baseP.y - signTotalH * 0.4);
            ctx.strokeStyle = type.trim;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Circular sign disc
            const signCenterY = baseP.y - signTotalH * 0.65;
            const signR = Math.max(5, signTotalH * 0.35);
            ctx.beginPath();
            ctx.arc(baseP.x, signCenterY, signR, 0, Math.PI * 2);
            ctx.fillStyle = '#F3E3C3';
            ctx.fill();
            ctx.strokeStyle = type.trim;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (!isLOD) {
                const cw = signR * 0.9;
                const ch = signR * 0.6;
                ctx.fillStyle = '#5A3E2B';
                ctx.beginPath();
                ctx.moveTo(baseP.x - cw / 2, signCenterY - ch / 3);
                ctx.lineTo(baseP.x + cw / 2, signCenterY - ch / 3);
                ctx.lineTo(baseP.x + cw * 0.35, signCenterY + ch / 2);
                ctx.lineTo(baseP.x - cw * 0.35, signCenterY + ch / 2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.arc(baseP.x + cw * 0.45, signCenterY + ch * 0.05, ch * 0.25, 0, Math.PI * 2);
                ctx.strokeStyle = '#5A3E2B';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

        } else if (type.prop === 'burger') {
            // Burger: 3-layer burger sign on roof (max height 0.6 * floorH)
            const roofElev = totalFloors * floorH;
            const signTotalH = 0.6 * floorH;
            const baseP = { x: p.x, y: p.y - roofElev };

            // Stand pole
            ctx.beginPath();
            ctx.moveTo(baseP.x, baseP.y);
            ctx.lineTo(baseP.x, baseP.y - signTotalH * 0.3);
            ctx.strokeStyle = type.trim;
            ctx.lineWidth = 2;
            ctx.stroke();

            const signY = baseP.y - signTotalH * 0.38;
            const bw = Math.max(10, bW * 0.26);
            const bh = Math.max(2, signTotalH * 0.16);

            // Bottom bun (brown)
            ctx.fillStyle = '#B5651D';
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(baseP.x - bw / 2, signY - bh, bw, bh);
            ctx.fill();
            ctx.stroke();

            // Middle layer (lettuce & patty)
            ctx.fillStyle = '#3FA968';
            ctx.beginPath();
            ctx.rect(baseP.x - bw * 0.55, signY - bh * 2, bw * 1.1, bh);
            ctx.fill();
            ctx.stroke();

            // Top bun dome (golden bun)
            ctx.fillStyle = '#D97724';
            ctx.beginPath();
            ctx.arc(baseP.x, signY - bh * 2, bw / 2, Math.PI, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

        } else if (type.prop === 'cactus') {
            // Taco: small potted cactus beside entrance on ground floor
            const potPos = faceLeft(p, 0.18, 0, 0, bW, bH, floorH);
            const potW = Math.max(4, Math.round(bW * 0.08));
            const potH = Math.max(4, Math.round(floorH * 0.25));

            ctx.beginPath();
            ctx.moveTo(potPos.x - potW / 2, potPos.y);
            ctx.lineTo(potPos.x + potW / 2, potPos.y);
            ctx.lineTo(potPos.x + potW * 0.4, potPos.y + potH);
            ctx.lineTo(potPos.x - potW * 0.4, potPos.y + potH);
            ctx.closePath();
            ctx.fillStyle = '#D96B43';
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();

            const cactH = Math.max(6, Math.round(floorH * 0.45));
            const cactW = Math.max(3, Math.round(potW * 0.5));
            ctx.fillStyle = '#4E9B48';
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(potPos.x - cactW / 2, potPos.y - cactH, cactW, cactH);
            ctx.fill();
            ctx.stroke();

            if (!isLOD) {
                ctx.beginPath();
                ctx.rect(potPos.x + cactW / 2, potPos.y - cactH * 0.75, cactW * 0.8, cactH * 0.4);
                ctx.fill();
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
            const type = this.getBuildingType(vis.id);
            const hasRoofProp = (type.prop === 'chimney' || type.prop === 'coffee' || type.prop === 'burger');
            const propH = hasRoofProp ? 0.6 * floorH : 0;
            const p = this.getScreenCoords(vis.x, vis.y);

            const badgeX = p.x;
            const badgeY = p.y - totalHeight - propH;

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
