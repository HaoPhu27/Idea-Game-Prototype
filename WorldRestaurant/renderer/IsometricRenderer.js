import { CELL_TYPES } from '../engine/GameState.js';

/**
 * Mulberry32 32-bit seeded PRNG.
 */
function mulberry32(seed) {
    let s = seed >>> 0;
    return function() {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generate a deterministic 32-bit seed from level dimensions and grid contents.
 */
function getLevelSeed(state) {
    let hash = (state.width * 73856093) ^ (state.height * 19349663);
    if (state.grid) {
        for (let y = 0; y < state.height; y++) {
            const row = state.grid[y];
            if (!row) continue;
            for (let x = 0; x < state.width; x++) {
                const cell = row[x];
                const code = typeof cell === 'string' ? cell.charCodeAt(0) : (Number(cell) || 0);
                hash = Math.imul(hash ^ (code + 1), 16777619);
                hash = (hash << 5) | (hash >>> 27);
            }
        }
    }
    return hash >>> 0;
}

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
 * Normalize direction input (string or DIRECTIONS object) to uppercase direction string.
 */
function normalizeDirKey(dir) {
    if (!dir) return null;
    if (typeof dir === 'string') return dir.toUpperCase();
    if (typeof dir === 'object') {
        if (dir.x === 0 && dir.y === -1) return 'UP';
        if (dir.x === 1 && dir.y === 0) return 'RIGHT';
        if (dir.x === 0 && dir.y === 1) return 'DOWN';
        if (dir.x === -1 && dir.y === 0) return 'LEFT';
        if (dir.dir) return String(dir.dir).toUpperCase();
    }
    return String(dir).toUpperCase();
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

        // Edge arrows & preview drag state
        this.hoverArrow = null;
        this.previewState = null;
        this.previewDir = null;
        this.previewInvalid = false;

        // Shake animation state for invalid moves
        this.shakeOffsetX = 0;
        this.isShaking = false;
        this.shakeStartTime = 0;

        // Scenery decoration settings
        this.decorEnabled = true;
        this.clouds = [
            { x: 30, y: 35, scale: 0.9, speed: 10 },
            { x: 180, y: 65, scale: 1.25, speed: 14 },
            { x: 340, y: 48, scale: 0.85, speed: 9 }
        ];
        this.lastCloudFrameTime = 0;
        this.cloudRafId = null;
        this.isCloudLoopRunning = false;

        this.onVisibilityChange = () => {
            if (document.hidden) {
                this.stopCloudLoop();
            } else if (this.decorEnabled && this.lastState) {
                this.startCloudLoop();
            }
        };
        document.addEventListener('visibilitychange', this.onVisibilityChange);

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
        const availW = Math.max(100, this.viewW - 80);
        const availH = Math.max(100, this.viewH - topReserve - bottomReserve);

        // Base thickness (18px) + badge margin + edge arrows margin
        const baseThickness = 18;
        const badgeMargin = 26;
        const arrowMargin = 32;

        // Horizontal constraint: (W + H) * cellSize / 2 <= availW
        const cellFromW = (2 * availW) / (W + H);

        // Vertical constraint: (W + H + maxFloors) * (cellSize / 4) + (baseThickness + badgeMargin + arrowMargin) <= availH
        const cellFromH = (4 * (availH - baseThickness - badgeMargin - arrowMargin)) / (W + H + maxFloors);

        const baseCellSize = Math.max(24, Math.min(Math.floor(cellFromW), Math.floor(cellFromH), 96));

        let newCellSize = baseCellSize;
        if (this.decorEnabled) {
            // Expanded island adds 2 tiles margin on each side (total 4 tiles), cliff depth 26px
            const islandExtraTiles = 4;
            const islandExtraDepth = 26;
            const decorCellFromW = (2 * availW) / (W + H + islandExtraTiles);
            const decorCellFromH = (4 * (availH - (baseThickness + islandExtraDepth) - badgeMargin - arrowMargin)) / (W + H + islandExtraTiles + maxFloors);
            const decorDesired = Math.max(24, Math.min(Math.floor(decorCellFromW), Math.floor(decorCellFromH), 96));

            // Rule 7: prioritize large game grid, do not shrink grid by more than 12% compared to current
            const minAllowed = Math.floor(baseCellSize * 0.88);
            newCellSize = Math.max(minAllowed, Math.min(baseCellSize, decorDesired));
        }

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

        // Vertically center the entire scene (towers + ground + diorama base + arrows)
        const topExtent = tileH / 2 + maxFloors * floorH + badgeMargin;
        let bottomExtent = (W + H - 1) * (tileH / 2) + baseThickness + arrowMargin;
        if (this.decorEnabled) {
            // Incorporate island bottom depth to balance vertical centering
            const islandBottomExtra = 2 * (tileH / 2) + 26;
            bottomExtent += islandBottomExtra * 0.6;
        }

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

        this.previewState = null;
        this.previewDir = null;
        this.previewInvalid = false;
        this.shakeOffsetX = 0;
        this.isShaking = false;

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

        // Start cloud animation loop if decor is enabled
        if (this.decorEnabled && !this.isCloudLoopRunning && !document.hidden) {
            this.startCloudLoop();
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

        // Check offscreen background cache key (including decorEnabled)
        const bgKey = `${this.viewW}_${this.viewH}_${this.dpr}_${this.cellSize}_${this.originX}_${this.originY}_${state.width}_${state.height}_${this.decorEnabled}_` +
            state.grid.map(row => row.join('')).join('|');

        if (this.lastBgKey !== bgKey) {
            this.renderBackgroundToOffscreen(state);
            this.lastBgKey = bgKey;
        }

        // 1. Draw cached board background
        this.ctx.clearRect(0, 0, this.viewW, this.viewH);
        this.ctx.drawImage(this.bgCanvas, 0, 0, this.viewW, this.viewH);

        // 2. Drifting clouds (after background, before buildings)
        if (this.decorEnabled) {
            this.drawClouds();
        }

        // 3. Sort restaurants by (x + y) ascending, ties broken by x
        const sortedRestaurants = Array.from(this.visualRestaurants.values()).sort((a, b) => {
            const sumA = a.x + a.y;
            const sumB = b.x + b.y;
            if (Math.abs(sumA - sumB) > 0.0001) return sumA - sumB;
            return a.x - b.x;
        });

        // 4. Draw restaurants with occlusion transparency
        for (const vis of sortedRestaurants) {
            const occluding = this.isOccluding(vis, state);
            this.drawBuilding(vis, occluding);
        }

        // 5. Draw ghost buildings for preview drag (after real buildings, before overlay)
        if (this.previewState && !this.previewInvalid) {
            this.drawGhostBuildings(this.previewState, state);
        }

        // 6. Draw top overlay layer (target dashed borders + floor badges)
        this.drawTargetOverlays(state);
        this.drawFloorBadges(sortedRestaurants);

        // NOTE: Edge arrows are no longer drawn. Tapping outside the board still
        // navigates via getEdgeArrowAt(). Call this.drawEdgeArrows(state) to bring
        // the visual arrows back.
    }

    renderBackgroundToOffscreen(state) {
        this.bgCanvas.width = Math.round(this.viewW * this.dpr);
        this.bgCanvas.height = Math.round(this.viewH * this.dpr);
        this.bgCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.bgCtx.clearRect(0, 0, this.viewW, this.viewH);

        if (!this.decorEnabled) {
            // Revert to original plain background and diorama base
            this.drawDioramaBase(this.bgCtx, state);
            for (let y = 0; y < state.height; y++) {
                for (let x = 0; x < state.width; x++) {
                    this.drawTile(this.bgCtx, x, y, state.grid[y][x], state);
                }
            }
            return;
        }

        // 1. Soft vertical sky gradient
        const skyGrad = this.bgCtx.createLinearGradient(0, 0, 0, this.viewH);
        skyGrad.addColorStop(0, '#CFE8E4');
        skyGrad.addColorStop(1, '#A9D3C4');
        this.bgCtx.fillStyle = skyGrad;
        this.bgCtx.fillRect(0, 0, this.viewW, this.viewH);

        // 2. Expanded island and water ring
        this.drawExpandedIsland(this.bgCtx, state);

        // 3. Generate decorative objects along island margin
        const { backDecorations, frontDecorations } = this.generateDecorations(state);

        // 4. Draw back edge decorations (behind the board)
        for (const decor of backDecorations) {
            this.drawDecorationObject(this.bgCtx, decor);
        }

        // 5. Board pedestal (sidewalk + curb + soft shadow) sitting on top of the island
        this.drawBoardPedestal(this.bgCtx, state);

        // 6. Ground grid tiles
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                this.drawTile(this.bgCtx, x, y, state.grid[y][x], state);
            }
        }

        // 7. Draw front edge decorations (in front of board base)
        for (const decor of frontDecorations) {
            this.drawDecorationObject(this.bgCtx, decor);
        }
    }

    /**
     * Draw board stone pedestal / sidewalk surrounding the game grid.
     * Viền vỉa hè rộng 0.18 ô (#D8D2C4 mặt trên), mặt bên #B4AC9B dày 8px,
     * đổ bóng mềm lên đảo (hình thoi đen alpha 0.18 lệch xuống 6px).
     */
    drawBoardPedestal(ctx, state) {
        const W = state.width;
        const H = state.height;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const pad = 0.18; // 0.18 ô
        const depth = 8; // dày 8px

        const T = { x: this.originX, y: this.originY - tileH / 2 };
        const R = { x: this.originX + W * (tileW / 2), y: this.originY + (W - 1) * (tileH / 2) };
        const B = { x: this.originX + (W - H) * (tileW / 2), y: this.originY + (W + H - 1) * (tileH / 2) };
        const L = { x: this.originX - H * (tileW / 2), y: this.originY + (H - 1) * (tileH / 2) };

        // 4 corners of sidewalk top face
        const padT = { x: T.x, y: T.y - pad * tileH };
        const padR = { x: R.x + pad * tileW, y: R.y };
        const padB = { x: B.x, y: B.y + pad * tileH };
        const padL = { x: L.x - pad * tileW, y: L.y };

        // 1. Soft shadow of plinth on island: hình thoi đen alpha 0.18 lệch xuống 6px
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.moveTo(padT.x, padT.y + 6);
        ctx.lineTo(padR.x, padR.y + 6);
        ctx.lineTo(padB.x, padB.y + depth + 6);
        ctx.lineTo(padL.x, padL.y + depth + 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 2. Left side face (padL -> padB) #B4AC9B, 8px high
        ctx.beginPath();
        ctx.moveTo(padL.x, padL.y);
        ctx.lineTo(padB.x, padB.y);
        ctx.lineTo(padB.x, padB.y + depth);
        ctx.lineTo(padL.x, padL.y + depth);
        ctx.closePath();
        ctx.fillStyle = '#B4AC9B';
        ctx.fill();
        ctx.strokeStyle = '#9E9686';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Right side face (padB -> padR) #B4AC9B slightly shaded, 8px high
        ctx.beginPath();
        ctx.moveTo(padB.x, padB.y);
        ctx.lineTo(padR.x, padR.y);
        ctx.lineTo(padR.x, padR.y + depth);
        ctx.lineTo(padB.x, padB.y + depth);
        ctx.closePath();
        ctx.fillStyle = adjustBrightness('#B4AC9B', -0.08);
        ctx.fill();
        ctx.strokeStyle = '#8E8779';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 4. Sidewalk top face (padT -> padR -> padB -> padL) #D8D2C4
        ctx.beginPath();
        ctx.moveTo(padT.x, padT.y);
        ctx.lineTo(padR.x, padR.y);
        ctx.lineTo(padB.x, padB.y);
        ctx.lineTo(padL.x, padL.y);
        ctx.closePath();
        ctx.fillStyle = '#D8D2C4';
        ctx.fill();
        ctx.strokeStyle = '#B4AC9B';
        ctx.lineWidth = 1;
        ctx.stroke();
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

            // Subtle crosswalk markings bordering land tiles
            if (this.decorEnabled) {
                this.drawRoadCrosswalks(ctx, p, x, y, state, tileW, tileH);
            }

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

            // Subtle flat in-grid details (grass tufts or tiny flower dots)
            if (this.decorEnabled) {
                const tileSeed = (state.width * 10007 + state.height * 30011 + x * 65537 + y * 49157) ^ getLevelSeed(state);
                const tileRng = mulberry32(tileSeed);
                const roll = tileRng();

                if (roll < 0.30) {
                    if (roll < 0.18) {
                        // 2-4 small grass tufts (V-shape darker green ~10%)
                        const numTufts = 2 + Math.floor(tileRng() * 3);
                        ctx.save();
                        ctx.strokeStyle = '#658C3B';
                        ctx.lineWidth = 1;
                        for (let i = 0; i < numTufts; i++) {
                            const u = (tileRng() - 0.5) * 0.45;
                            const v = (tileRng() - 0.5) * 0.45;
                            const tx = p.x + u * tileW;
                            const ty = p.y + v * tileH;
                            ctx.beginPath();
                            ctx.moveTo(tx - 2, ty - 2);
                            ctx.lineTo(tx, ty);
                            ctx.lineTo(tx + 2, ty - 2);
                            ctx.stroke();
                        }
                        ctx.restore();
                    } else {
                        // 1-3 tiny flower dots (radius 1.5px) - NO yellow #F5B324
                        const numFlowers = 1 + Math.floor(tileRng() * 3);
                        const flowerColors = ['#FFFFFF', '#F08080', '#CE93D8', '#98D8AA'];
                        ctx.save();
                        for (let i = 0; i < numFlowers; i++) {
                            const u = (tileRng() - 0.5) * 0.45;
                            const v = (tileRng() - 0.5) * 0.45;
                            const tx = p.x + u * tileW;
                            const ty = p.y + v * tileH;
                            const col = flowerColors[Math.floor(tileRng() * flowerColors.length)];
                            ctx.fillStyle = col;
                            ctx.beginPath();
                            ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.restore();
                    }
                }
            }
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
        p.x += this.shakeOffsetX;
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
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const floorH = tileH * 0.5;
        const bW = tileW * 0.7;

        const radius = Math.max(10, this.cellSize * 0.16);
        const fontSize = Math.max(14, Math.round(this.cellSize * 0.22));
        const r = radius;
        const viewW = this.viewW;

        ctx.save();
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const vis of sortedRestaurants) {
            const floorsCount = Math.max(1, Math.round(vis.floors));
            const H = floorsCount * floorH;
            const p = this.getScreenCoords(vis.x, vis.y);
            p.x += this.shakeOffsetX;

            // Right corner of roof: x = p.x + bW/2, y = p.y - H
            let cornerX = p.x + bW / 2;
            const cornerY = p.y - H;
            let badgeX = cornerX;
            const badgeY = cornerY - r * 0.6;

            // Ensure badge stays within canvas: if x + r > viewW - 4, place at left corner of roof
            if (badgeX + r > viewW - 4) {
                cornerX = p.x - bW / 2;
                badgeX = cornerX;
            }

            // 1px connecting line in #2A211B alpha 0.4 from badge down to roof corner (like a pin)
            ctx.beginPath();
            ctx.moveTo(badgeX, badgeY);
            ctx.lineTo(cornerX, cornerY);
            ctx.strokeStyle = 'rgba(42, 33, 27, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

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

    /**
     * Compute positions, radii, and angles for the 4 edge navigation arrows.
     * @param {Object} state - Current GameState
     * @returns {Object|null}
     */
    getEdgeArrowPositions(state) {
        if (!state) return null;

        const W = state.width;
        const H = state.height;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;

        const T = { x: this.originX, y: this.originY - tileH / 2 };
        const R = { x: this.originX + W * (tileW / 2), y: this.originY + (W - 1) * (tileH / 2) };
        const B = { x: this.originX + (W - H) * (tileW / 2), y: this.originY + (W + H - 1) * (tileH / 2) };
        const L = { x: this.originX - H * (tileW / 2), y: this.originY + (H - 1) * (tileH / 2) };

        const r = Math.max(18, this.cellSize * 0.28);
        const offset = 22;
        const invSqrt5 = 1 / Math.sqrt(5);

        // Edge midpoints and outward unit normal vectors:
        // UP: top-right edge (T -> R), normal points up-right
        // RIGHT: bottom-right edge (R -> B), normal points down-right
        // DOWN: bottom-left edge (B -> L), normal points down-left
        // LEFT: top-left edge (L -> T), normal points up-left
        const edges = {
            UP: {
                midX: (T.x + R.x) / 2,
                midY: (T.y + R.y) / 2,
                nx: invSqrt5,
                ny: -2 * invSqrt5
            },
            RIGHT: {
                midX: (R.x + B.x) / 2,
                midY: (R.y + B.y) / 2,
                nx: invSqrt5,
                ny: 2 * invSqrt5
            },
            DOWN: {
                midX: (B.x + L.x) / 2,
                midY: (B.y + L.y) / 2,
                nx: -invSqrt5,
                ny: 2 * invSqrt5
            },
            LEFT: {
                midX: (L.x + T.x) / 2,
                midY: (L.y + T.y) / 2,
                nx: -invSqrt5,
                ny: -2 * invSqrt5
            }
        };

        const arrows = {};
        const padding = 4;
        const maxR = r * 1.1;

        for (const [dir, edge] of Object.entries(edges)) {
            let ax = edge.midX + offset * edge.nx;
            let ay = edge.midY + offset * edge.ny;

            // Pull arrow inside if it exceeds the drawing area
            ax = Math.max(maxR + padding, Math.min(this.viewW - maxR - padding, ax));
            ay = Math.max(maxR + padding, Math.min(this.viewH - maxR - padding, ay));

            arrows[dir] = {
                dir,
                x: ax,
                y: ay,
                r,
                angle: Math.atan2(edge.ny, edge.nx)
            };
        }

        return arrows;
    }

    /**
     * Draw 4 edge navigation arrows positioned along the diorama base perimeter.
     * @param {Object} state - Current GameState
     */
    drawEdgeArrows(state) {
        const arrows = this.getEdgeArrowPositions(state);
        if (!arrows) return;

        for (const arrow of Object.values(arrows)) {
            this.drawArrow(this.ctx, arrow);
        }
    }

    /**
     * Render a single edge arrow button with circular background and directional arrow.
     * @param {CanvasRenderingContext2D} ctx - Context to draw onto
     * @param {Object} arrow - Arrow properties {x, y, r, angle, dir}
     */
    drawArrow(ctx, arrow) {
        const { x, y, r, angle, dir } = arrow;
        const isHovered = this.hoverArrow === dir;
        const isPreviewActive = this.previewDir === dir;
        const isInvalid = this.previewInvalid && isPreviewActive;

        // Hover or active preview: scale 10% larger
        const scale = (isHovered || (isPreviewActive && !isInvalid)) ? 1.1 : 1.0;
        const currentR = r * scale;

        ctx.save();
        ctx.translate(x, y);

        // 1. Circular background (white alpha 0.92, brighter on hover/active)
        ctx.beginPath();
        ctx.arc(0, 0, currentR, 0, Math.PI * 2);
        ctx.fillStyle = (isHovered || isPreviewActive) ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)';
        ctx.fill();

        // 2. Circular border #2A211B 2px
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Arrow (triangle head + stem) pointing outward along diagonal edge normal
        ctx.rotate(angle);

        let arrowColor = '#E8772E';
        if (isInvalid) {
            arrowColor = '#D9534F'; // Invalid direction: red
        } else if (isHovered || isPreviewActive) {
            arrowColor = adjustBrightness('#E8772E', 0.25); // Brighter orange
        }

        const stemHalfW = currentR * 0.16;
        const stemLeft = -currentR * 0.44;
        const headBase = currentR * 0.08;
        const headWing = currentR * 0.42;
        const headTip = currentR * 0.56;

        ctx.fillStyle = arrowColor;
        ctx.beginPath();
        ctx.moveTo(stemLeft, -stemHalfW);
        ctx.lineTo(headBase, -stemHalfW);
        ctx.lineTo(headBase, -headWing);
        ctx.lineTo(headTip, 0);
        ctx.lineTo(headBase, headWing);
        ctx.lineTo(headBase, stemHalfW);
        ctx.lineTo(stemLeft, stemHalfW);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw preview ghost buildings with transparent sprites and dashed footprint.
     * @param {Object} previewState - Simulated state
     * @param {Object} currentState - Real GameState
     */
    drawGhostBuildings(previewState, currentState) {
        if (!previewState || !previewState.restaurants) return;

        const ctx = this.ctx;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const bW = tileW * 0.7;
        const bH = tileH * 0.7;

        // Sort preview restaurants by (x + y) ascending, ties broken by x
        const sortedPreview = [...previewState.restaurants].sort((a, b) => {
            const sumA = a.x + a.y;
            const sumB = b.x + b.y;
            if (Math.abs(sumA - sumB) > 0.0001) return sumA - sumB;
            return a.x - b.x;
        });

        // 1. Footprint rhombus with dashed border (purple #C4B5FD if newly split, white otherwise)
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);

        for (const rest of sortedPreview) {
            const p = this.getScreenCoords(rest.x, rest.y);
            const isSplitNew = currentState && currentState.restaurants
                ? !currentState.restaurants.some(r => r.id === rest.id)
                : false;

            ctx.strokeStyle = isSplitNew ? '#C4B5FD' : '#FFFFFF';
            this.drawRhombus(ctx, p.x, p.y, bW, bH);
            ctx.stroke();
        }
        ctx.restore();

        // 2. Ghost building sprites with globalAlpha 0.4 composited via bldCanvas
        for (const rest of sortedPreview) {
            const p = this.getScreenCoords(rest.x, rest.y);
            const totalFloors = Math.max(1, Math.round(rest.floors));
            const type = this.getBuildingType(rest.id);
            const sprite = this.getBuildingSprite(type, totalFloors);

            this.bldCtx.clearRect(0, 0, this.viewW, this.viewH);
            this.bldCtx.drawImage(sprite.canvas, p.x - sprite.anchorX, p.y - sprite.anchorY, sprite.w, sprite.h);

            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.drawImage(this.bldCanvas, 0, 0, this.viewW, this.viewH);
            ctx.restore();
        }
    }

    /**
     * Resolve a tap/click outside the board into a navigation direction.
     *
     * The 4 edge arrows are no longer drawn; instead any touch in the empty area
     * beyond a board edge navigates towards that direction. Touches inside the
     * board return null so drag-to-pan keeps working.
     *
     * @param {number} clientX - Event clientX
     * @param {number} clientY - Event clientY
     * @returns {'UP'|'RIGHT'|'DOWN'|'LEFT'|null}
     */
    getEdgeArrowAt(clientX, clientY) {
        if (!this.lastState) return null;

        const rect = this.canvas.getBoundingClientRect();
        const cssX = clientX - rect.left;
        const cssY = clientY - rect.top;

        // Ignore taps on the HUD strip at the top of the canvas
        if (cssY < 60) return null;

        const W = this.lastState.width;
        const H = this.lastState.height;

        // Invert the isometric projection generically: build the local basis from
        // getScreenCoords so this stays correct if the projection ever changes.
        const o = this.getScreenCoords(0, 0);
        const ex = { x: this.getScreenCoords(1, 0).x - o.x, y: this.getScreenCoords(1, 0).y - o.y };
        const ey = { x: this.getScreenCoords(0, 1).x - o.x, y: this.getScreenCoords(0, 1).y - o.y };

        const dx = cssX - o.x;
        const dy = cssY - o.y;

        const det = ex.x * ey.y - ex.y * ey.x;
        if (Math.abs(det) < 1e-6) return null;

        // Solve (dx, dy) = gx * ex + gy * ey
        let gx = (dx * ey.y - dy * ey.x) / det;
        let gy = (ex.x * dy - ex.y * dx) / det;

        // getScreenCoords returns cell centers, so shift to edge-based coordinates
        // where the board occupies 0 <= gx < W and 0 <= gy < H.
        gx += 0.5;
        gy += 0.5;

        if (gx >= 0 && gx < W && gy >= 0 && gy < H) {
            return null; // Inside the board: let drag-to-pan handle it
        }

        // Overshoot beyond each edge (positive values only)
        const overshoot = {
            UP: -gy,
            DOWN: gy - H,
            LEFT: -gx,
            RIGHT: gx - W
        };

        let bestDir = null;
        let bestAmount = 0;
        for (const [dir, amount] of Object.entries(overshoot)) {
            if (amount > bestAmount) {
                bestAmount = amount;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    /**
     * Set the currently hovered edge arrow and redraw frame.
     * @param {'UP'|'RIGHT'|'DOWN'|'LEFT'|null} dirKey
     */
    setHoverArrow(dirKey) {
        const normalized = normalizeDirKey(dirKey);
        if (this.hoverArrow === normalized) return;
        this.hoverArrow = normalized;
        if (!this.isAnimating && !this.isShaking) {
            this.drawFrame();
        }
    }

    /**
     * Set preview drag state and redraw frame.
     * @param {Object|null} previewState - Simulated state after move
     * @param {'UP'|'RIGHT'|'DOWN'|'LEFT'|null} dirKey - Direction key
     * @param {boolean} invalid - Whether the move is invalid
     */
    setPreview(previewState = null, dirKey = null, invalid = false) {
        this.previewState = previewState;
        this.previewDir = normalizeDirKey(dirKey);
        this.previewInvalid = Boolean(invalid);

        if (this.previewInvalid) {
            // Shake real buildings horizontally ±2px via sine wave for 250ms
            this.shakeStartTime = performance.now();
            if (!this.isShaking) {
                this.isShaking = true;
                requestAnimationFrame(this.shakeLoop.bind(this));
            }
        } else {
            this.shakeOffsetX = 0;
            this.isShaking = false;
            if (!this.isAnimating) {
                this.drawFrame();
            }
        }
    }

    /**
     * Shake animation loop for invalid moves (±2px sine oscillation over 250ms).
     * @param {number} time - Animation timestamp
     */
    shakeLoop(time) {
        if (!this.isShaking) return;
        const elapsed = time - this.shakeStartTime;
        const DURATION = 250; // ms

        if (elapsed < DURATION) {
            const progress = elapsed / DURATION;
            this.shakeOffsetX = Math.sin(progress * Math.PI * 6) * 2;
            this.drawFrame();
            requestAnimationFrame(this.shakeLoop.bind(this));
        } else {
            this.shakeOffsetX = 0;
            this.isShaking = false;
            this.drawFrame();
        }
    }

    /**
     * Enable or disable diorama scenery decorations.
     * @param {boolean} enabled
     */
    setDecorEnabled(enabled) {
        const val = Boolean(enabled);
        if (this.decorEnabled === val) return;
        this.decorEnabled = val;
        this.lastBgKey = null;
        if (this.lastState) {
            this.computeDimensions(this.lastState);
            this.renderBackgroundToOffscreen(this.lastState);
            this.drawFrame();
        }
        if (this.decorEnabled) {
            this.startCloudLoop();
        } else {
            this.stopCloudLoop();
        }
    }

    /**
     * Start the cloud animation loop capped at ~30fps.
     */
    startCloudLoop() {
        if (!this.decorEnabled || document.hidden || this.isCloudLoopRunning) return;
        this.isCloudLoopRunning = true;
        this.lastCloudFrameTime = performance.now();
        this.cloudRafId = requestAnimationFrame(this.cloudLoop.bind(this));
    }

    /**
     * Stop the cloud animation loop.
     */
    stopCloudLoop() {
        this.isCloudLoopRunning = false;
        if (this.cloudRafId) {
            cancelAnimationFrame(this.cloudRafId);
            this.cloudRafId = null;
        }
    }

    /**
     * Cloud animation frame loop capped at ~30fps.
     */
    cloudLoop(time) {
        if (!this.decorEnabled || document.hidden || !this.lastState) {
            this.isCloudLoopRunning = false;
            this.cloudRafId = null;
            return;
        }

        const delta = time - this.lastCloudFrameTime;
        if (delta >= 32) { // ~30 fps cap
            this.lastCloudFrameTime = time - (delta % 32);
            const dt = Math.min(delta / 1000, 0.1);

            for (const c of this.clouds) {
                c.x += c.speed * dt;
                if (c.x > this.viewW + 70) {
                    c.x = -80;
                }
            }

            // Only redraw if not already being drawn by active tween or shake
            if (!this.isAnimating && !this.isShaking) {
                this.drawFrame();
            }
        }

        this.cloudRafId = requestAnimationFrame(this.cloudLoop.bind(this));
    }

    /**
     * Draw clouds on main canvas.
     */
    drawClouds() {
        if (!this.decorEnabled || !this.clouds) return;
        for (const cloud of this.clouds) {
            this.drawCloud(this.ctx, cloud.x, cloud.y, cloud.scale);
        }
    }

    /**
     * Render a single minimalist white cloud (alpha 0.5).
     */
    drawCloud(ctx, cx, cy, scale) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        const r1 = 12 * scale;
        const r2 = 18 * scale;
        const r3 = 13 * scale;
        ctx.beginPath();
        ctx.arc(cx - 14 * scale, cy, r1, 0, Math.PI * 2);
        ctx.arc(cx + 2 * scale, cy - 4 * scale, r2, 0, Math.PI * 2);
        ctx.arc(cx + 18 * scale, cy, r3, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy + 4 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draw expanded diorama island larger by 2 tiles with water ring and textured grass.
     */
    drawExpandedIsland(ctx, state) {
        const W = state.width;
        const H = state.height;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const baseDepth = 8; // matches 8px sidewalk plinth height
        const islandDepth = 26;
        const M = 2; // 2 tiles margin on each side

        // 4 corners of the board base top
        const T = { x: this.originX, y: this.originY - tileH / 2 };
        const R = { x: this.originX + W * (tileW / 2), y: this.originY + (W - 1) * (tileH / 2) };
        const B = { x: this.originX + (W - H) * (tileW / 2), y: this.originY + (W + H - 1) * (tileH / 2) };
        const L = { x: this.originX - H * (tileW / 2), y: this.originY + (H - 1) * (tileH / 2) };

        // 4 corners of the island top surface (at vertical offset baseDepth = 8px)
        const islandT = { x: T.x, y: T.y + baseDepth - M * tileH };
        const islandR = { x: R.x + M * tileW, y: R.y + baseDepth };
        const islandB = { x: B.x, y: B.y + baseDepth + M * tileH };
        const islandL = { x: L.x - M * tileW, y: L.y + baseDepth };

        // Bottom corners of island cliff
        const botT = { x: islandT.x, y: islandT.y + islandDepth };
        const botR = { x: islandR.x, y: islandR.y + islandDepth };
        const botB = { x: islandB.x, y: islandB.y + islandDepth };
        const botL = { x: islandL.x, y: islandL.y + islandDepth };

        // 1. Water ring (flat rhombus, larger than island by 0.6 tiles)
        const wM = 0.6;
        const waterW = wM * tileW;
        const waterH = wM * tileH;
        const waterT = { x: botT.x, y: Math.min(botT.y - waterH, islandT.y - 6) };
        const waterR = { x: botR.x + waterW, y: botR.y };
        const waterB = { x: botB.x, y: botB.y + waterH };
        const waterL = { x: botL.x - waterW, y: botL.y };

        ctx.beginPath();
        ctx.moveTo(waterT.x, waterT.y);
        ctx.lineTo(waterR.x, waterR.y);
        ctx.lineTo(waterB.x, waterB.y);
        ctx.lineTo(waterL.x, waterL.y);
        ctx.closePath();
        ctx.fillStyle = '#8CCFE0';
        ctx.fill();
        ctx.strokeStyle = '#71BCCF';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle white wave outline 3px inside water rim
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(waterT.x, waterT.y + 3);
        ctx.lineTo(waterR.x - 3, waterR.y);
        ctx.lineTo(waterB.x, waterB.y - 3);
        ctx.lineTo(waterL.x + 3, waterL.y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // 2. Island left dirt face (L -> B)
        ctx.beginPath();
        ctx.moveTo(islandL.x, islandL.y);
        ctx.lineTo(islandB.x, islandB.y);
        ctx.lineTo(botB.x, botB.y);
        ctx.lineTo(botL.x, botL.y);
        ctx.closePath();
        ctx.fillStyle = '#6B4A35';
        ctx.fill();
        ctx.strokeStyle = '#4A3325';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Island right dirt face (B -> R)
        ctx.beginPath();
        ctx.moveTo(islandB.x, islandB.y);
        ctx.lineTo(islandR.x, islandR.y);
        ctx.lineTo(botR.x, botR.y);
        ctx.lineTo(botB.x, botB.y);
        ctx.closePath();
        ctx.fillStyle = '#553A29';
        ctx.fill();
        ctx.strokeStyle = '#3D281D';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 4. Island top grass face: darker yellow-olive #6E9F45
        ctx.beginPath();
        ctx.moveTo(islandT.x, islandT.y);
        ctx.lineTo(islandR.x, islandR.y);
        ctx.lineTo(islandB.x, islandB.y);
        ctx.lineTo(islandL.x, islandL.y);
        ctx.closePath();
        ctx.fillStyle = '#6E9F45';
        ctx.fill();
        ctx.strokeStyle = '#5E8C3A';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 5. Chấm cỏ #5E8C3A across the island margin
        this.drawIslandGrassDots(ctx, state);
    }

    /**
     * Draw textured grass tufts and dots (#5E8C3A) across the island grass margin.
     */
    drawIslandGrassDots(ctx, state) {
        const W = state.width;
        const H = state.height;
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const baseDepth = 8;
        const seed = (getLevelSeed(state) ^ 0x5E8C3A5E) >>> 0;
        const rng = mulberry32(seed);

        const toScreen = (gx, gy) => ({
            x: (gx - gy) * (tileW / 2) + this.originX,
            y: (gx + gy) * (tileH / 2) + this.originY + baseDepth
        });

        ctx.save();
        ctx.strokeStyle = '#5E8C3A';
        ctx.fillStyle = '#5E8C3A';
        ctx.lineWidth = 1.2;

        const points = [];
        // Back-Left margin
        for (let gy = -1.2; gy < H + 0.8; gy += 0.7) {
            for (let gx = -1.8; gx < -0.3; gx += 0.6) {
                points.push({ gx: gx + (rng() - 0.5) * 0.25, gy: gy + (rng() - 0.5) * 0.25 });
            }
        }
        // Back-Right margin
        for (let gx = -0.3; gx < W + 0.8; gx += 0.7) {
            for (let gy = -1.8; gy < -0.3; gy += 0.6) {
                points.push({ gx: gx + (rng() - 0.5) * 0.25, gy: gy + (rng() - 0.5) * 0.25 });
            }
        }
        // Front-Right margin
        for (let gy = -0.3; gy < H + 1.8; gy += 0.7) {
            for (let gx = W + 0.3; gx < W + 1.8; gx += 0.6) {
                points.push({ gx: gx + (rng() - 0.5) * 0.25, gy: gy + (rng() - 0.5) * 0.25 });
            }
        }
        // Front-Left margin
        for (let gx = -1.8; gx < W + 0.3; gx += 0.7) {
            for (let gy = H + 0.3; gy < H + 1.8; gy += 0.6) {
                points.push({ gx: gx + (rng() - 0.5) * 0.25, gy: gy + (rng() - 0.5) * 0.25 });
            }
        }

        for (const pt of points) {
            if (rng() < 0.55) {
                const p = toScreen(pt.gx, pt.gy);
                const roll = rng();
                if (roll < 0.5) {
                    // Small V-shape tuft
                    ctx.beginPath();
                    ctx.moveTo(p.x - 2, p.y - 2);
                    ctx.lineTo(p.x, p.y);
                    ctx.lineTo(p.x + 2, p.y - 2);
                    ctx.stroke();
                } else {
                    // 2 tiny dots
                    ctx.beginPath();
                    ctx.arc(p.x - 1.5, p.y, 1.2, 0, Math.PI * 2);
                    ctx.arc(p.x + 1.5, p.y - 1, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    }

    /**
     * Generate deterministic decorative objects along island margin.
     * Features:
     * - 3-5 tree clusters on the 2 back edges (2-4 trees overlapping, bushes/flowers at foot)
     * - Front edges: low bushes, flower beds, benches, street lamps (~1 object per 0.8 tiles)
     * - 1 focal pond at a back corner (rounded rhombus #8CCFE0 border #6FB6CB, 2 lily pads)
     * - 1 food / ice cream cart with striped awning at a front corner
     * - All items strictly outside sidewalk and sorted by (x + y)
     */
    generateDecorations(state) {
        const seed = getLevelSeed(state);
        const rng = mulberry32(seed);

        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const baseDepth = 8;
        const W = state.width;
        const H = state.height;

        const toScreen = (gx, gy) => ({
            x: (gx - gy) * (tileW / 2) + this.originX,
            y: (gx + gy) * (tileH / 2) + this.originY + baseDepth
        });

        const backDecorations = [];
        const frontDecorations = [];

        // 1. Accent 1: Small pond (ao nhỏ) in a back corner
        const pondInBackLeft = rng() < 0.5;
        const pondGx = pondInBackLeft ? -1.15 : (W - 0.6);
        const pondGy = pondInBackLeft ? (H - 0.6) : -1.15;
        const pondPos = toScreen(pondGx, pondGy);
        backDecorations.push({
            type: 'pond',
            x: pondPos.x,
            y: pondPos.y,
            depthKey: pondGx + pondGy,
            scale: 1.0
        });

        // 2. Accent 2: Food cart / ice cream cart (xe bán hàng/quầy kem có mái sọc) in a front corner
        const cartInFrontRight = pondInBackLeft; // balance opposite corner
        const cartGx = cartInFrontRight ? (W + 0.65) : 0.2;
        const cartGy = cartInFrontRight ? 0.2 : (H + 0.65);
        const cartPos = toScreen(cartGx, cartGy);
        frontDecorations.push({
            type: 'foodCart',
            x: cartPos.x,
            y: cartPos.y,
            depthKey: cartGx + cartGy,
            scale: 1.0
        });

        // 3. Tree clusters along the 2 back edges (3-5 clusters in total)
        const totalClusters = Math.min(5, Math.max(3, Math.round(2 + (W + H) * 0.35)));
        const numBackLeftClusters = Math.max(1, Math.floor(totalClusters / 2));
        const numBackRightClusters = totalClusters - numBackLeftClusters;

        // Back-Left clusters (along edge gx ~ -1.2, gy from 0 to H)
        for (let c = 0; c < numBackLeftClusters; c++) {
            const frac = (c + 0.5) / numBackLeftClusters;
            const cgx = -1.25 + (rng() - 0.5) * 0.2;
            const cgy = (frac * H) - 0.2 + (rng() - 0.5) * 0.3;

            // Skip if overlapping pond
            if (Math.hypot(cgx - pondGx, cgy - pondGy) < 0.9) continue;

            const treeCount = 2 + Math.floor(rng() * 3); // 2-4 trees
            for (let t = 0; t < treeCount; t++) {
                const tgx = cgx + (rng() - 0.5) * 0.4;
                const tgy = cgy + (rng() - 0.5) * 0.4;
                const p = toScreen(tgx, tgy);
                const treeType = rng() < 0.55 ? 'roundTree' : 'pineTree';
                backDecorations.push({
                    type: treeType,
                    x: p.x,
                    y: p.y,
                    depthKey: tgx + tgy,
                    scale: 0.95 + rng() * 0.2
                });
            }

            // Undergrowth (bushes and flowers at the foot of the cluster)
            const underCount = 1 + Math.floor(rng() * 2);
            for (let u = 0; u < underCount; u++) {
                const ugx = cgx + (rng() - 0.5) * 0.35 + 0.08;
                const ugy = cgy + (rng() - 0.5) * 0.35 + 0.08;
                const p = toScreen(ugx, ugy);
                const uType = rng() < 0.55 ? 'bush' : 'flower';
                backDecorations.push({
                    type: uType,
                    x: p.x,
                    y: p.y,
                    depthKey: ugx + ugy + 0.05, // slightly in front of trees
                    scale: 0.85 + rng() * 0.2
                });
            }
        }

        // Back-Right clusters (along edge gy ~ -1.2, gx from 0 to W)
        for (let c = 0; c < numBackRightClusters; c++) {
            const frac = (c + 0.5) / numBackRightClusters;
            const cgx = (frac * W) - 0.2 + (rng() - 0.5) * 0.3;
            const cgy = -1.25 + (rng() - 0.5) * 0.2;

            if (Math.hypot(cgx - pondGx, cgy - pondGy) < 0.9) continue;

            const treeCount = 2 + Math.floor(rng() * 3); // 2-4 trees
            for (let t = 0; t < treeCount; t++) {
                const tgx = cgx + (rng() - 0.5) * 0.4;
                const tgy = cgy + (rng() - 0.5) * 0.4;
                const p = toScreen(tgx, tgy);
                const treeType = rng() < 0.55 ? 'roundTree' : 'pineTree';
                backDecorations.push({
                    type: treeType,
                    x: p.x,
                    y: p.y,
                    depthKey: tgx + tgy,
                    scale: 0.95 + rng() * 0.2
                });
            }

            // Undergrowth at foot of cluster
            const underCount = 1 + Math.floor(rng() * 2);
            for (let u = 0; u < underCount; u++) {
                const ugx = cgx + (rng() - 0.5) * 0.35 + 0.08;
                const ugy = cgy + (rng() - 0.5) * 0.35 + 0.08;
                const p = toScreen(ugx, ugy);
                const uType = rng() < 0.55 ? 'bush' : 'flower';
                backDecorations.push({
                    type: uType,
                    x: p.x,
                    y: p.y,
                    depthKey: ugx + ugy + 0.05,
                    scale: 0.85 + rng() * 0.2
                });
            }
        }

        // 4. Two Front edges: low bushes, flower beds, benches, street lamps (~1 item per 0.8 tiles)
        const frontCycle = ['bush', 'flower', 'bench', 'streetLamp', 'bush', 'flower'];
        let cycleIdx = Math.floor(rng() * frontCycle.length);

        // Front-Right edge (gx outside board: gx ~ W + 0.55, gy from 0.1 to H + 0.4, step 0.8)
        for (let gy = 0.1; gy < H + 0.4; gy += 0.8) {
            const fgx = W + 0.55 + (rng() - 0.5) * 0.15;
            const fgy = gy + (rng() - 0.5) * 0.15;

            // Leave clearance for food cart
            if (Math.hypot(fgx - cartGx, fgy - cartGy) < 0.75) continue;

            const itemType = frontCycle[cycleIdx % frontCycle.length];
            cycleIdx++;
            const p = toScreen(fgx, fgy);
            frontDecorations.push({
                type: itemType,
                x: p.x,
                y: p.y,
                depthKey: fgx + fgy,
                scale: 0.9 + rng() * 0.2
            });
        }

        // Front-Left edge (gy outside board: gy ~ H + 0.55, gx from 0.1 to W + 0.4, step 0.8)
        for (let gx = 0.1; gx < W + 0.4; gx += 0.8) {
            const fgx = gx + (rng() - 0.5) * 0.15;
            const fgy = H + 0.55 + (rng() - 0.5) * 0.15;

            // Leave clearance for food cart
            if (Math.hypot(fgx - cartGx, fgy - cartGy) < 0.75) continue;

            const itemType = frontCycle[cycleIdx % frontCycle.length];
            cycleIdx++;
            const p = toScreen(fgx, fgy);
            frontDecorations.push({
                type: itemType,
                x: p.x,
                y: p.y,
                depthKey: fgx + fgy,
                scale: 0.9 + rng() * 0.2
            });
        }

        // Sort both by depthKey (x + y) ascending for proper isometric painter's algorithm
        backDecorations.sort((a, b) => a.depthKey - b.depthKey);
        frontDecorations.sort((a, b) => a.depthKey - b.depthKey);

        return { backDecorations, frontDecorations };
    }

    /**
     * Dispatch drawing for a single decorative object.
     */
    drawDecorationObject(ctx, decor) {
        const { type, x, y, scale = 1.0, dir = 'x' } = decor;
        switch (type) {
            case 'roundTree':
                this.drawRoundTree(ctx, x, y, scale);
                break;
            case 'pineTree':
                this.drawPineTree(ctx, x, y, scale);
                break;
            case 'bush':
                this.drawBush(ctx, x, y, scale);
                break;
            case 'flower':
                this.drawFlowerCluster(ctx, x, y, scale);
                break;
            case 'streetLamp':
                this.drawStreetLamp(ctx, x, y, scale);
                break;
            case 'bench':
                this.drawWoodenBench(ctx, x, y, scale);
                break;
            case 'fence':
                this.drawFence(ctx, x, y, scale, dir);
                break;
            case 'foodCart':
                this.drawFoodCart(ctx, x, y, scale);
                break;
            case 'pond':
                this.drawPond(ctx, x, y, scale);
                break;
            case 'rocks':
                this.drawRocks(ctx, x, y, scale);
                break;
        }
    }

    /**
     * Draw round tree: chiều cao tổng ~1.1 tileH, tán rộng ~0.55 tileW.
     */
    drawRoundTree(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const canopyR = Math.round(0.275 * tileW * scale); // canopy width = 0.55 tileW
        const trunkH = Math.round(tileH * 0.22 * scale);
        const trunkW = Math.max(3, Math.round(tileW * 0.08 * scale));
        const cy = y - trunkH - canopyR * 0.6; // total height to top = trunkH + 1.6*canopyR ≈ 1.1 tileH

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, canopyR * 0.85, canopyR * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fill();

        // Brown trunk
        ctx.fillStyle = '#6B4A35';
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
        ctx.fill();
        ctx.stroke();

        // Dark half (left)
        ctx.beginPath();
        ctx.arc(x, cy, canopyR, Math.PI * 0.5, Math.PI * 1.5);
        ctx.closePath();
        ctx.fillStyle = '#3E8E4A';
        ctx.fill();

        // Light half (right)
        ctx.beginPath();
        ctx.arc(x, cy, canopyR, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.fillStyle = '#5DAE5B';
        ctx.fill();

        // Outer outline
        ctx.beginPath();
        ctx.arc(x, cy, canopyR, 0, Math.PI * 2);
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle highlight arc on top-right
        ctx.beginPath();
        ctx.arc(x, cy, canopyR * 0.75, -Math.PI * 0.35, -Math.PI * 0.05);
        ctx.strokeStyle = '#74C268';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw pine tree: chiều cao tổng ~1.3 tileH, base width ~0.52 tileW.
     */
    drawPineTree(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const targetH = 1.3 * tileH * scale;
        const trunkH = Math.round(targetH * 0.16);
        const trunkW = Math.max(3, Math.round(tileW * 0.08 * scale));
        const baseW = Math.round(0.52 * tileW * scale);
        const tierH = Math.round(targetH * 0.35);

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, baseW * 0.48, baseW * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fill();

        // Brown trunk
        ctx.fillStyle = '#6B4A35';
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - trunkW / 2, y - trunkH, trunkW, trunkH);
        ctx.fill();
        ctx.stroke();

        const tiers = [
            { y: y - trunkH, w: baseW, h: tierH * 1.1, c: '#265C2F' },
            { y: y - trunkH - tierH * 0.65, w: baseW * 0.78, h: tierH, c: '#35773F' },
            { y: y - trunkH - tierH * 1.3, w: baseW * 0.55, h: tierH * 0.95, c: '#489452' }
        ];

        for (const t of tiers) {
            ctx.beginPath();
            ctx.moveTo(x - t.w / 2, t.y);
            ctx.lineTo(x, t.y - t.h);
            ctx.lineTo(x + t.w / 2, t.y);
            ctx.closePath();
            ctx.fillStyle = t.c;
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Draw low green bush: rộng ~0.35 tileW.
     */
    drawBush(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const bushW = 0.35 * tileW * scale;
        const r = bushW / 2.8;

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, bushW * 0.45, bushW * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();

        const circles = [
            { ox: -r * 0.75, oy: -r * 0.4, r: r * 0.85, c: '#3E8E4A' },
            { ox: r * 0.75, oy: -r * 0.4, r: r * 0.80, c: '#489E50' },
            { ox: 0, oy: -r * 0.75, r: r * 1.0, c: '#5DAE5B' }
        ];
        for (const c of circles) {
            ctx.beginPath();
            ctx.arc(x + c.ox, y + c.oy, c.r, 0, Math.PI * 2);
            ctx.fillStyle = c.c;
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Draw flower cluster patch / bồn hoa with colorful dots (NO #F5B324).
     */
    drawFlowerCluster(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const rw = 0.22 * tileW * scale;
        const rh = 0.14 * tileH * scale;

        ctx.save();
        // Foliage base
        ctx.beginPath();
        ctx.ellipse(x, y - rh / 2, rw, rh, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#4E9B48';
        ctx.fill();
        ctx.strokeStyle = '#3E8E4A';
        ctx.lineWidth = 1;
        ctx.stroke();

        const dots = [
            { ox: -rw * 0.5, oy: -rh * 0.6, c: '#FFFFFF' },
            { ox: rw * 0.4, oy: -rh * 0.7, c: '#F06565' },
            { ox: 0, oy: -rh * 0.4, c: '#BA68C8' },
            { ox: -rw * 0.35, oy: -rh * 0.2, c: '#FF8DA1' },
            { ox: rw * 0.5, oy: -rh * 0.3, c: '#FFFFFF' }
        ];
        for (const d of dots) {
            ctx.beginPath();
            ctx.arc(x + d.ox, y + d.oy, 1.5 * scale, 0, Math.PI * 2);
            ctx.fillStyle = d.c;
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * Draw slender street lamp: chiều cao ~1.0 tileH, soft yellow bulb (#FFEAA7).
     */
    drawStreetLamp(ctx, x, y, scale = 1.0) {
        const tileH = this.cellSize / 2;
        const lampH = 1.0 * tileH * scale;

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, 4 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // Dark slender post & gooseneck arm
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - lampH);
        ctx.lineTo(x + 5 * scale, y - lampH);
        ctx.stroke();

        // Lamp hood cap
        ctx.fillStyle = '#1F2937';
        ctx.beginPath();
        ctx.arc(x + 5 * scale, y - lampH + 1, 3.5 * scale, Math.PI, 0);
        ctx.fill();

        // Soft yellow bulb
        ctx.fillStyle = '#FFEAA7';
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 5 * scale, y - lampH + 3.5 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Soft glow halo
        ctx.fillStyle = 'rgba(255, 234, 167, 0.25)';
        ctx.beginPath();
        ctx.arc(x + 5 * scale, y - lampH + 3.5 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw low wooden park bench.
     */
    drawWoodenBench(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const bw = 0.32 * tileW * scale;
        const bh = 0.22 * tileH * scale;

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, bw * 0.48, bw * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#4A3325';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - bw * 0.4, y);
        ctx.lineTo(x - bw * 0.4, y - bh * 0.6);
        ctx.moveTo(x + bw * 0.4, y);
        ctx.lineTo(x + bw * 0.4, y - bh * 0.6);
        ctx.stroke();

        // Seat
        ctx.fillStyle = '#A06A42';
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - bw / 2, y - bh * 0.75, bw, bh * 0.32);
        ctx.fill();
        ctx.stroke();

        // Backrest
        ctx.fillStyle = '#B57B4F';
        ctx.beginPath();
        ctx.rect(x - bw / 2, y - bh * 1.35, bw, bh * 0.35);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw small pond: hình thoi bo tròn #8CCFE0 viền #6FB6CB, có 2 lá sen.
     */
    drawPond(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const pw = 0.82 * tileW * scale;
        const ph = 0.52 * tileH * scale;

        ctx.save();
        // Pond water body (rounded isometric rhombus)
        ctx.beginPath();
        ctx.ellipse(x, y, pw / 2, ph / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#8CCFE0';
        ctx.fill();
        ctx.strokeStyle = '#6FB6CB';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Water specular shine arc
        ctx.beginPath();
        ctx.ellipse(x, y - 2, pw * 0.32, ph * 0.32, 0, Math.PI * 0.8, Math.PI * 1.8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Lily pad 1 (lá sen 1) with tiny pink blossom
        const p1x = x - pw * 0.22;
        const p1y = y - ph * 0.12;
        ctx.beginPath();
        ctx.ellipse(p1x, p1y, 4.5 * scale, 2.5 * scale, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#2E7D32';
        ctx.fill();
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p1x + 1, p1y - 1, 1.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8DA1';
        ctx.fill();

        // Lily pad 2 (lá sen 2)
        const p2x = x + pw * 0.20;
        const p2y = y + ph * 0.14;
        ctx.beginPath();
        ctx.ellipse(p2x, p2y, 3.8 * scale, 2.2 * scale, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#388E3C';
        ctx.fill();
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw section of low wooden fence.
     */
    drawFence(ctx, x, y, scale = 1.0, dir = 'x') {
        const len = 13 * scale;
        const postH = 8 * scale;
        const dx = dir === 'x' ? len * 0.89 : -len * 0.89;
        const dy = len * 0.44;

        ctx.save();
        ctx.strokeStyle = '#A9713C';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - postH * 0.35);
        ctx.lineTo(x + dx, y + dy - postH * 0.35);
        ctx.moveTo(x, y - postH * 0.75);
        ctx.lineTo(x + dx, y + dy - postH * 0.75);
        ctx.stroke();

        const posts = [
            { px: x, py: y },
            { px: x + dx, py: y + dy }
        ];
        for (const p of posts) {
            ctx.fillStyle = '#8B5A2B';
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(p.px - 1.5, p.py - postH, 3, postH);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Draw food cart / ice cream cart with striped roof at front corner (NO #F5B324).
     */
    drawFoodCart(ctx, x, y, scale = 1.0) {
        const tileW = this.cellSize;
        const tileH = this.cellSize / 2;
        const w = 0.42 * tileW * scale;
        const bodyH = 0.28 * tileH * scale;
        const totalH = 0.80 * tileH * scale;

        ctx.save();
        // Ground shadow
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.55, w * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // 2 dark wooden wheels
        ctx.fillStyle = '#4A3325';
        ctx.beginPath();
        ctx.arc(x - w * 0.28, y - 2, 3.5 * scale, 0, Math.PI * 2);
        ctx.arc(x + w * 0.28, y - 2, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Cart counter body
        ctx.fillStyle = '#F4ECE1';
        ctx.strokeStyle = '#7A482F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(x - w / 2, y - 4 - bodyH, w, bodyH);
        ctx.fill();
        ctx.stroke();

        // Counter glass window
        ctx.fillStyle = '#9FD3E6';
        ctx.fillRect(x - w * 0.38, y - 3 - bodyH * 0.75, w * 0.76, bodyH * 0.5);
        ctx.strokeStyle = '#7A482F';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - w * 0.38, y - 3 - bodyH * 0.75, w * 0.76, bodyH * 0.5);

        // Canopy support posts
        ctx.strokeStyle = '#4A3325';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.42, y - 4 - bodyH);
        ctx.lineTo(x - w * 0.42, y - totalH);
        ctx.moveTo(x + w * 0.42, y - 4 - bodyH);
        ctx.lineTo(x + w * 0.42, y - totalH);
        ctx.stroke();

        // Striped awning (mái sọc coral red & white)
        const cw = w * 1.15;
        const ch = 0.22 * tileH * scale;
        const stripes = 5;
        for (let s = 0; s < stripes; s++) {
            const sx = (x - cw / 2) + (s * cw) / stripes;
            ctx.fillStyle = s % 2 === 0 ? '#D9534F' : '#FFFFFF';
            ctx.fillRect(sx, y - totalH - ch, cw / stripes, ch);
        }
        ctx.strokeStyle = '#2A211B';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - cw / 2, y - totalH - ch, cw, ch);

        // Tiny ice cream cone sign on side
        const coneX = x + w * 0.32;
        const coneY = y - 4 - bodyH * 0.5;
        ctx.fillStyle = '#D4A373';
        ctx.beginPath();
        ctx.moveTo(coneX - 2.5 * scale, coneY);
        ctx.lineTo(coneX + 2.5 * scale, coneY);
        ctx.lineTo(coneX, coneY + 4 * scale);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FF8DA1';
        ctx.beginPath();
        ctx.arc(coneX, coneY - 1 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw small rocks.
     */
    drawRocks(ctx, x, y, scale = 1.0) {
        ctx.save();
        const stones = [
            { ox: -3 * scale, oy: -2 * scale, rx: 3.5 * scale, ry: 2.2 * scale, c: '#8D99AE' },
            { ox: 2 * scale, oy: -1 * scale, rx: 2.5 * scale, ry: 1.8 * scale, c: '#6C757D' }
        ];
        for (const st of stones) {
            ctx.beginPath();
            ctx.ellipse(x + st.ox, y + st.oy, st.rx, st.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = st.c;
            ctx.fill();
            ctx.strokeStyle = '#2A211B';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Draw subtle crosswalk dashed markings on road borders adjacent to land tiles.
     */
    drawRoadCrosswalks(ctx, p, x, y, state, tileW, tileH) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;

        const isLand = (gx, gy) => {
            if (gx < 0 || gx >= state.width || gy < 0 || gy >= state.height) return false;
            return state.grid[gy][gx] === CELL_TYPES.LAND;
        };

        // Edge UP-RIGHT (y - 1)
        if (isLand(x, y - 1)) {
            for (let i = 1; i <= 3; i++) {
                const t = i / 4;
                const ex = p.x + (t * tileW) / 2;
                const ey = (p.y - tileH / 2) + (t * tileH) / 2;
                ctx.beginPath();
                ctx.moveTo(ex - 2, ey + 1);
                ctx.lineTo(ex + 2, ey - 1);
                ctx.stroke();
            }
        }
        // Edge DOWN-LEFT (y + 1)
        if (isLand(x, y + 1)) {
            for (let i = 1; i <= 3; i++) {
                const t = i / 4;
                const ex = (p.x - tileW / 2) + (t * tileW) / 2;
                const ey = p.y + (t * tileH) / 2;
                ctx.beginPath();
                ctx.moveTo(ex - 2, ey + 1);
                ctx.lineTo(ex + 2, ey - 1);
                ctx.stroke();
            }
        }
        // Edge UP-LEFT (x - 1)
        if (isLand(x - 1, y)) {
            for (let i = 1; i <= 3; i++) {
                const t = i / 4;
                const ex = (p.x - tileW / 2) + (t * tileW) / 2;
                const ey = p.y - (t * tileH) / 2;
                ctx.beginPath();
                ctx.moveTo(ex - 2, ey - 1);
                ctx.lineTo(ex + 2, ey + 1);
                ctx.stroke();
            }
        }
        // Edge DOWN-RIGHT (x + 1)
        if (isLand(x + 1, y)) {
            for (let i = 1; i <= 3; i++) {
                const t = i / 4;
                const ex = p.x + (t * tileW) / 2;
                const ey = (p.y + tileH / 2) - (t * tileH) / 2;
                ctx.beginPath();
                ctx.moveTo(ex - 2, ey - 1);
                ctx.lineTo(ex + 2, ey + 1);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    /**
     * Clean up timers and listeners when renderer is destroyed.
     */
    destroy() {
        this.stopCloudLoop();
        if (this.onVisibilityChange) {
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
        }
    }
}
