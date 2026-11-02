/**
 * WorldRestaurant - CustomerRush.js
 * High-polish diorama-style customer rush victory celebration animation.
 *
 * Requirements & Specifications:
 * - Standalone ES module exporting class CustomerRush (named and default).
 * - constructor(app): stores app reference.
 * - play(): returns Promise<boolean> resolving true after ~1500ms (or ~400ms reduced motion).
 * - cancel(): immediately resolves pending promise false and cleans up RAF, timers, DOM.
 * - Overlay canvas within game-container, pointer-events: none, z-index: 5.
 * - Uses renderer getScreenCoords, visualRestaurants, cellSize for exact door geometry.
 * - Door position: Center of LEFT face ground floor.
 * - Draws cute colorful actual people using canvas heads, hair, shirts, alternating legs/arms, shadows (no emoji).
 * - Staggered waves approaching front doors, disappearing into entrance with arrival sparkles.
 * - Avoids moving across roofs or other buildings.
 * - Customers visible at mobile scale, total crowd bounded <= 36.
 * - Board stays visible. DPR <= 2, handles window resize.
 * - Total duration 1500ms including initial house tween 150ms.
 * - Respects prefers-reduced-motion (gentle short transition ~400ms).
 * - Independent of decor settings.
 * - Safe on missing renderer / state.
 * - Repeated play cancels previous.
 * - Fallback timer ensures completion if RAF is throttled/paused in background tabs.
 */

const DIVERSE_SKIN_TONES = [
    '#FFDFBA', '#FFE4C4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'
];

const BRIGHT_SHIRT_COLORS = [
    '#FF5E57', '#FF9F43', '#FECA57', '#10AC84', '#0ABDE3',
    '#54A0FF', '#5F27CD', '#FF6B8B', '#EE5253', '#00D2D3',
    '#FFA801', '#34E7E4', '#FF3838', '#2ED573', '#1E90FF'
];

const PANTS_COLORS = [
    '#2C3E50', '#34495E', '#1E272E', '#485460', '#57606F',
    '#2F3542', '#3B3B98', '#1B1464', '#333333'
];

const HAIR_COLORS = [
    '#2C1A0E', '#4A2810', '#1A1A1A', '#C0392B', '#E58E26',
    '#F39C12', '#6C5CE7', '#2D3436', '#D63031'
];

const SPARKLE_PALETTE = [
    '#FFD700', '#FFF176', '#FF6B8B', '#48DBFB', '#FFAAA6',
    '#FFFFFF', '#FFD166', '#00F2FE', '#FF9FF3'
];

/**
 * Ray-casting algorithm to test whether point (px, py) is inside polygon.
 */
function customerRushPointInPolygon(px, py, vertices) {
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

/**
 * 6 vertices of the outer hexagonal silhouette of an isometric building block.
 */
function customerRushBuildingSilhouette(p, bW, bH, totalH) {
    return [
        { x: p.x - bW / 2, y: p.y },
        { x: p.x,          y: p.y + bH / 2 },
        { x: p.x + bW / 2, y: p.y },
        { x: p.x + bW / 2, y: p.y - totalH },
        { x: p.x,          y: p.y - totalH - bH / 2 },
        { x: p.x - bW / 2, y: p.y - totalH }
    ];
}

export class CustomerRush {
    constructor(app) {
        this.app = app;

        this._pendingResolve = null;
        this._rafId = null;
        this._fallbackTimer = null;
        this._canvas = null;
        this._ctx = null;
        this._resizeHandler = null;

        this._customers = [];
        this._sparkles = [];
        this._doorArrivalEnergies = new Map(); // restId -> energy [0, 1]
        this._startTime = 0;
        this._lastFrameTime = 0;
        this._totalDuration = 1500;
        this._isPlaying = false;
        this._isReducedMotion = false;
    }

    /**
     * Start customer rush victory animation.
     * @returns {Promise<boolean>} Resolves true when animation finishes, or false if cancelled.
     */
    play() {
        // Cancel any active animation first
        if (this._isPlaying) {
            this.cancel();
        }

        // Safe fallback if renderer or state is missing
        const renderer = this.app?.renderer;
        const state = this.app?.state || renderer?.lastState;
        if (!renderer || typeof renderer.getScreenCoords !== 'function' || !state || !Array.isArray(state.restaurants) || state.restaurants.length === 0) {
            return Promise.resolve(true);
        }

        // Check prefers-reduced-motion
        this._isReducedMotion = typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this._totalDuration = this._isReducedMotion ? 400 : 1500;

        // Find container
        const container = renderer.container || (typeof document !== 'undefined' ? document.getElementById('game-container') : null);
        if (!container || typeof document === 'undefined') {
            return Promise.resolve(true);
        }

        this._isPlaying = true;

        return new Promise((resolve) => {
            this._pendingResolve = resolve;

            // Create overlay canvas
            this._setupCanvas(container);

            // Prepare customers & effects
            if (!this._isReducedMotion) {
                this._initCustomers(state);
            }

            // Fallback timer: guarantees resolution even if browser throttles/pauses RAF
            this._fallbackTimer = setTimeout(() => {
                this._finish(true);
            }, this._totalDuration + 150);

            // Start RAF loop
            this._startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            this._lastFrameTime = 0;
            this._rafId = requestAnimationFrame(this._loop.bind(this));
        });
    }

    /**
     * Cancel active celebration immediately:
     * Resolves pending promise with false, cleans up timers, RAF, effects, and DOM canvas.
     */
    cancel() {
        if (this._pendingResolve) {
            const resolve = this._pendingResolve;
            this._pendingResolve = null;
            try {
                resolve(false);
            } catch (e) {
                // Ignore resolution errors
            }
        }
        this._cleanup();
    }

    /**
     * Internal cleanup helper.
     */
    _cleanup() {
        this._isPlaying = false;

        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }

        if (this._fallbackTimer !== null) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }

        if (this._resizeHandler && typeof window !== 'undefined') {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        if (this._canvas && this._canvas.parentNode) {
            try {
                this._canvas.parentNode.removeChild(this._canvas);
            } catch (e) {
                // Ignore DOM remove errors
            }
        }

        this._canvas = null;
        this._ctx = null;
        this._customers = [];
        this._sparkles = [];
        this._doorArrivalEnergies.clear();
    }

    /**
     * Finish animation cleanly with result.
     */
    _finish(result = true) {
        if (!this._isPlaying) return;

        if (this._pendingResolve) {
            const resolve = this._pendingResolve;
            this._pendingResolve = null;
            try {
                resolve(result);
            } catch (e) {
                // Ignore errors
            }
        }
        this._cleanup();
    }

    /**
     * Setup overlay canvas in container.
     */
    _setupCanvas(container) {
        const canvas = document.createElement('canvas');
        canvas.className = 'customer-rush-overlay';
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '5'; // Above game-canvas (z-index 1), below HUD (z-index 10)

        container.appendChild(canvas);
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');

        const updateSize = () => {
            if (!this._canvas || !container) return;
            const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
            const w = container.clientWidth || 800;
            const h = container.clientHeight || 600;
            const pixelW = Math.round(w * dpr);
            const pixelH = Math.round(h * dpr);

            if (this._canvas.width !== pixelW || this._canvas.height !== pixelH) {
                this._canvas.width = pixelW;
                this._canvas.height = pixelH;
                this._canvas.style.width = `${w}px`;
                this._canvas.style.height = `${h}px`;
            }
            if (this._ctx) {
                this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        };

        updateSize();
        this._resizeHandler = updateSize;
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._resizeHandler);
        }
    }

    /**
     * Get canvas offset relative to container to ensure exact alignment.
     */
    _getCanvasOffset() {
        const renderer = this.app?.renderer;
        if (!renderer?.canvas || !renderer?.container) return { x: 0, y: 0 };
        try {
            const cRect = renderer.canvas.getBoundingClientRect();
            const pRect = renderer.container.getBoundingClientRect();
            return {
                x: cRect.left - pRect.left,
                y: cRect.top - pRect.top
            };
        } catch (e) {
            return { x: 0, y: 0 };
        }
    }

    /**
     * Calculate current door screen geometry for a restaurant building.
     * In IsometricRenderer:
     * - Building base center is p = getScreenCoords(rest.x, rest.y).
     * - Door is centered on LEFT face ground floor.
     * - Left face ground edge connects (p.x - bW/2, p.y) to (p.x, p.y + bH/2).
     * - Center of Left face ground threshold:
     *     doorX = p.x - 0.25 * bW
     *     doorGroundY = p.y + 0.25 * bH
     * - Center of entrance opening:
     *     doorCenterY = doorGroundY - 0.35 * floorH
     */
    _getDoorInfo(restaurantId) {
        const renderer = this.app?.renderer;
        if (!renderer || typeof renderer.getScreenCoords !== 'function') return null;

        // Check dynamic visual restaurant for smooth real-time tracking during 150ms tween
        const vis = renderer.visualRestaurants ? renderer.visualRestaurants.get(restaurantId) : null;
        let rx = 0;
        let ry = 0;
        if (vis) {
            rx = vis.x !== undefined ? vis.x : (vis.targetX !== undefined ? vis.targetX : 0);
            ry = vis.y !== undefined ? vis.y : (vis.targetY !== undefined ? vis.targetY : 0);
        } else {
            const r = this.app?.state?.restaurants?.find(item => item.id === restaurantId);
            if (r) {
                rx = r.x;
                ry = r.y;
            }
        }

        const p = renderer.getScreenCoords(rx, ry);
        const shakeX = renderer.shakeOffsetX || 0;
        const canvasOffset = this._getCanvasOffset();
        p.x += shakeX + canvasOffset.x;
        p.y += canvasOffset.y;

        const cellSize = renderer.cellSize || 56;
        const tileW = cellSize;
        const tileH = cellSize / 2;
        const bW = tileW * 0.7;
        const bH = tileH * 0.7;
        const floorH = tileH * 0.5;

        const doorX = p.x - 0.25 * bW;
        const doorGroundY = p.y + 0.25 * bH;
        const doorCenterY = doorGroundY - 0.35 * floorH;

        return {
            x: doorX,
            groundY: doorGroundY,
            centerY: doorCenterY,
            bW,
            bH,
            floorH,
            cellSize,
            restX: rx,
            restY: ry
        };
    }

    /**
     * Initialize customers approaching the front doors of winning restaurants.
     * Bounded <= 36 total, staggered in waves, avoiding roofs/other buildings.
     */
    _initCustomers(state) {
        this._customers = [];
        const restaurants = state.restaurants;
        if (!restaurants || restaurants.length === 0) return;

        const renderer = this.app?.renderer;
        const cellSize = renderer?.cellSize || 56;
        const numRests = restaurants.length;

        // Distribute bounded total <= 36 so every restaurant receives at least 1 when numRests <= 36
        // For 1 restaurant: 12 customers
        // For 2..4: scale smoothly (e.g. 2->14, 3->21, 4->28)
        // For 5..36: 36 total, base = floor(36 / N) >= 1, remainder distributed
        let totalBounded = 36;
        if (numRests === 1) {
            totalBounded = 12;
        } else if (numRests <= 4) {
            totalBounded = Math.min(36, numRests * 7);
        } else {
            totalBounded = 36;
        }

        const basePerRest = Math.floor(totalBounded / numRests);
        const remainder = totalBounded % numRests;

        // Precompute other restaurant base screen centers to avoid spawning inside buildings
        const canvasOffset = this._getCanvasOffset();
        const shakeX = renderer?.shakeOffsetX || 0;
        const restBases = restaurants.map(r => {
            const p = renderer?.getScreenCoords(r.x, r.y) || { x: 0, y: 0 };
            return {
                id: r.id,
                x: p.x + shakeX + canvasOffset.x,
                y: p.y + canvasOffset.y
            };
        });

        let custId = 0;

        for (let rIdx = 0; rIdx < numRests; rIdx++) {
            const rest = restaurants[rIdx];
            const door = this._getDoorInfo(rest.id);
            if (!door) continue;

            const customersForThisRest = basePerRest + (rIdx < remainder ? 1 : 0);
            if (customersForThisRest <= 0) continue;

            for (let i = 0; i < customersForThisRest; i++) {
                // Stagger waves:
                // Wave 0: ~90ms - 220ms start
                // Wave 1: ~280ms - 440ms start
                // Wave 2: ~480ms - 640ms start
                // Wave 3: ~680ms - 820ms start
                const wave = i % 4;
                const waveBase = 90 + wave * 200;
                const waveJitter = (Math.random() - 0.5) * 80;
                const startDelay = Math.max(70, waveBase + waveJitter);

                // Travel duration: 520ms - 660ms
                const travelDuration = 530 + Math.random() * 130;

                // Approach angles from the front of the Left Face:
                // Left Face faces South-West (down-left).
                // Outward angles facing camera/street/ground:
                // 35° (down-right path) to 150° (down-left along front street).
                // Screen Y is always positive relative to door (y_spawn > door.groundY),
                // ensuring customer is physically in the FOREGROUND and never on roofs!
                const angleDeg = 40 + Math.random() * 105; // 40° to 145°
                const angleRad = (angleDeg * Math.PI) / 180;
                const dist = (0.95 + Math.random() * 1.35) * cellSize; // 50px to 130px

                let spawnX = door.x + Math.cos(angleRad) * dist;
                let spawnY = door.groundY + Math.sin(angleRad) * dist;

                // Ensure spawn does not overlap another restaurant's center
                for (const base of restBases) {
                    if (base.id !== rest.id) {
                        const distToOther = Math.hypot(spawnX - base.x, spawnY - base.y);
                        if (distToOther < cellSize * 0.48) {
                            // Push further into foreground street
                            spawnY += cellSize * 0.42;
                        }
                    }
                }

                // Curved path control point (gentle sweep towards front entrance)
                const ctrlX = (spawnX + door.x) * 0.5 + (Math.random() - 0.5) * (cellSize * 0.3);
                const ctrlY = Math.max(spawnY, door.groundY) + cellSize * 0.18;

                // Visual characteristics
                const skinColor = DIVERSE_SKIN_TONES[Math.floor(Math.random() * DIVERSE_SKIN_TONES.length)];
                const shirtColor = BRIGHT_SHIRT_COLORS[Math.floor(Math.random() * BRIGHT_SHIRT_COLORS.length)];
                const pantsColor = PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
                const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
                const hairStyle = Math.floor(Math.random() * 5); // 0: crop, 1: ponytail, 2: bob, 3: curly, 4: cap
                const accentColor = BRIGHT_SHIRT_COLORS[Math.floor(Math.random() * BRIGHT_SHIRT_COLORS.length)];

                this._customers.push({
                    id: custId++,
                    restaurantId: rest.id,
                    startX: spawnX,
                    startY: spawnY,
                    ctrlX,
                    ctrlY,
                    startDelay,
                    travelDuration,
                    skinColor,
                    shirtColor,
                    pantsColor,
                    hairColor,
                    hairStyle,
                    accentColor,
                    phaseOffset: Math.random() * Math.PI * 2,
                    arrived: false,
                    currentX: spawnX,
                    currentY: spawnY
                });
            }
        }
    }

    /**
     * Main animation loop.
     */
    _loop(time) {
        if (!this._isPlaying) return;

        const elapsed = time - this._startTime;
        const dt = this._lastFrameTime === 0
            ? 16.67
            : Math.min(100, Math.max(1, time - this._lastFrameTime));
        this._lastFrameTime = time;

        const ctx = this._ctx;

        if (!ctx || !this._canvas) {
            this._finish(true);
            return;
        }

        const renderer = this.app?.renderer;
        const container = renderer?.container || (typeof document !== 'undefined' ? document.getElementById('game-container') : null);
        const w = container?.clientWidth || 800;
        const h = container?.clientHeight || 600;

        // Clear overlay canvas
        ctx.clearRect(0, 0, w, h);

        if (this._isReducedMotion) {
            this._renderReducedMotion(ctx, elapsed);
        } else {
            this._renderRushFrame(ctx, elapsed, dt);
        }

        if (elapsed >= this._totalDuration) {
            ctx.clearRect(0, 0, w, h);
            this._finish(true);
        } else {
            this._rafId = requestAnimationFrame(this._loop.bind(this));
        }
    }

    /**
     * Render reduced motion celebration:
     * Gentle warm victory glow and subtle soft sparkles at entrances (~400ms).
     */
    _renderReducedMotion(ctx, elapsed) {
        const state = this.app?.state;
        if (!state?.restaurants) return;

        const progress = Math.min(1, elapsed / this._totalDuration);
        // Soft sine pulse for gentle transition
        const alpha = Math.sin(progress * Math.PI);

        for (const rest of state.restaurants) {
            const door = this._getDoorInfo(rest.id);
            if (!door) continue;

            // Warm door entrance glow
            const glowR = door.cellSize * 0.45;
            const grad = ctx.createRadialGradient(door.x, door.centerY, 2, door.x, door.centerY, glowR);
            grad.addColorStop(0, `rgba(255, 220, 100, ${alpha * 0.7})`);
            grad.addColorStop(0.5, `rgba(255, 170, 50, ${alpha * 0.35})`);
            grad.addColorStop(1, 'rgba(255, 170, 50, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(door.x, door.centerY, glowR, 0, Math.PI * 2);
            ctx.fill();

            // 3 small gentle floating sparkles rising smoothly
            const sparkleOffsets = [
                { dx: -6, dy: -door.floorH * 0.2, phase: 0 },
                { dx: 0, dy: -door.floorH * 0.5, phase: 0.3 },
                { dx: 7, dy: -door.floorH * 0.3, phase: 0.6 }
            ];

            for (const sp of sparkleOffsets) {
                const spProgress = Math.max(0, Math.min(1, (progress - sp.phase * 0.3) / 0.7));
                const spAlpha = Math.sin(spProgress * Math.PI);
                if (spAlpha > 0.01) {
                    const sx = door.x + sp.dx;
                    const sy = door.centerY + sp.dy - spProgress * 18;
                    ctx.save();
                    ctx.globalAlpha = spAlpha;
                    ctx.fillStyle = '#FFD700';
                    this._drawStar(ctx, sx, sy, 3.5, spProgress * 2);
                    ctx.restore();
                }
            }
        }
    }

    /**
     * Render full dynamic customer rush frame.
     */
    _renderRushFrame(ctx, elapsed, dt) {
        const renderer = this.app?.renderer;

        // 1. Update door arrival energies (scale decay to dt: ~1.0 in 400ms)
        const energyDecay = 2.5 * (dt / 1000);
        for (const [restId, energy] of this._doorArrivalEnergies.entries()) {
            const newEnergy = Math.max(0, energy - energyDecay);
            if (newEnergy === 0) {
                this._doorArrivalEnergies.delete(restId);
            } else {
                this._doorArrivalEnergies.set(restId, newEnergy);
            }
        }

        // Compute projected wall/roof silhouettes of all other buildings
        const state = this.app?.state;
        const otherBuildingPolys = new Map();
        if (state?.restaurants && renderer) {
            const canvasOffset = this._getCanvasOffset();
            const shakeX = renderer.shakeOffsetX || 0;
            const tileW = renderer.cellSize || 56;
            const tileH = tileW / 2;
            const bW = tileW * 0.7;
            const bH = tileH * 0.7;
            const floorH = tileH * 0.5;

            for (const rest of state.restaurants) {
                const vis = renderer.visualRestaurants ? renderer.visualRestaurants.get(rest.id) : null;
                const rx = vis ? (vis.x !== undefined ? vis.x : vis.targetX) : rest.x;
                const ry = vis ? (vis.y !== undefined ? vis.y : vis.targetY) : rest.y;
                const floors = vis ? (vis.floors || rest.floors || 1) : (rest.floors || 1);
                const p = renderer.getScreenCoords(rx, ry);
                p.x += shakeX + canvasOffset.x;
                p.y += canvasOffset.y;

                const totalH = floors * floorH + floorH * 0.6; // includes roof/prop
                otherBuildingPolys.set(rest.id, customerRushBuildingSilhouette(p, bW, bH, totalH));
            }
        }

        // 2. Update & filter active customers
        const activeCustomers = [];

        for (const cust of this._customers) {
            const timeSinceStart = elapsed - cust.startDelay;
            if (timeSinceStart < 0) continue; // Not spawned yet

            const progress = Math.min(1, timeSinceStart / cust.travelDuration);
            const door = this._getDoorInfo(cust.restaurantId);
            if (!door) continue;

            if (progress >= 1.0) {
                if (!cust.arrived) {
                    cust.arrived = true;
                    // Trigger arrival sparkles at door center
                    this._spawnSparkles(door.x, door.centerY, cust.shirtColor);
                    // Boost door entrance glow energy
                    const currentEnergy = this._doorArrivalEnergies.get(cust.restaurantId) || 0;
                    this._doorArrivalEnergies.set(cust.restaurantId, Math.min(1.0, currentEnergy + 0.45));
                }
            } else {
                // Quadratic bezier interpolation:
                // B(t) = (1-t)^2 * start + 2(1-t)t * ctrl + t^2 * door
                const t = progress;
                const invT = 1 - t;
                const cx = invT * invT * cust.startX + 2 * invT * t * cust.ctrlX + t * t * door.x;
                const cy = invT * invT * cust.startY + 2 * invT * t * cust.ctrlY + t * t * door.groundY;

                cust.currentX = cx;
                cust.currentY = cy;
                cust.doorX = door.x;
                cust.doorGroundY = door.groundY;
                cust.doorCenterY = door.centerY;
                cust.cellSize = door.cellSize;
                cust.progress = progress;

                activeCustomers.push(cust);
            }
        }

        // 3. Render door entrance warm glows (drawn underneath approaching people)
        for (const [restId, energy] of this._doorArrivalEnergies.entries()) {
            const door = this._getDoorInfo(restId);
            if (!door || energy <= 0.01) continue;

            const glowR = door.cellSize * 0.42;
            const grad = ctx.createRadialGradient(door.x, door.centerY, 2, door.x, door.centerY, glowR);
            grad.addColorStop(0, `rgba(255, 235, 120, ${energy * 0.7})`);
            grad.addColorStop(0.5, `rgba(255, 175, 50, ${energy * 0.35})`);
            grad.addColorStop(1, 'rgba(255, 175, 50, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(door.x, door.centerY, glowR, 0, Math.PI * 2);
            ctx.fill();
        }

        // 4. Sort active customers by currentY ascending (isometric depth sorting: closer Y drawn on top)
        activeCustomers.sort((a, b) => a.currentY - b.currentY);

        // 5. Draw active customers (hide/clip when overlapping other buildings' wall/roof)
        for (const cust of activeCustomers) {
            // Disappearance fade/shrink right as customer enters doorway threshold (t >= 0.92)
            let scale = 1.0;
            let opacity = 1.0;

            if (cust.progress > 0.92) {
                const enterT = (cust.progress - 0.92) / 0.08;
                scale = Math.max(0.2, 1.0 - enterT * 0.55);
                opacity = Math.max(0, 1.0 - enterT);
            }

            const baseHeight = Math.max(14, Math.min(22, cust.cellSize * 0.32));
            const personH = baseHeight * scale;

            // Avoid customer sprites overlaying roofs/walls of other restaurants:
            // Check if silhouette overlaps another building's projected polygon (allow own entrance approach)
            let overlapsOther = false;
            for (const [otherId, poly] of otherBuildingPolys.entries()) {
                if (otherId === cust.restaurantId) continue; // Allow own entrance approach

                if (
                    customerRushPointInPolygon(cust.currentX, cust.currentY, poly) ||
                    customerRushPointInPolygon(cust.currentX, cust.currentY - personH * 0.5, poly) ||
                    customerRushPointInPolygon(cust.currentX, cust.currentY - personH, poly)
                ) {
                    overlapsOther = true;
                    break;
                }
            }

            if (overlapsOther) {
                continue; // Hide customer sprite while behind/overlapping another building wall/roof
            }

            ctx.save();
            if (opacity < 1.0) {
                ctx.globalAlpha = opacity;
            }
            this._drawCutePerson(ctx, cust, cust.currentX, cust.currentY, cust.doorX, cust.doorGroundY, cust.cellSize, scale, elapsed);
            ctx.restore();
        }

        // 6. Update and draw arrival sparkles (drawn in front of door)
        this._updateAndDrawSparkles(ctx, dt);
    }

    /**
     * Spawn arrival sparkles at doorway.
     */
    _spawnSparkles(x, y, accentColor) {
        const count = 5 + Math.floor(Math.random() * 3); // 5 to 7 sparkles
        for (let i = 0; i < count; i++) {
            const angle = Math.PI + (Math.random() * Math.PI); // Upward arc (180° to 360°)
            const speed = 25 + Math.random() * 45;
            const color = (i === 0 && accentColor) ? accentColor : SPARKLE_PALETTE[Math.floor(Math.random() * SPARKLE_PALETTE.length)];
            const isHeart = Math.random() < 0.22;
            const isStar = !isHeart && Math.random() < 0.65;

            this._sparkles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                gravity: 70, // downward gravity
                color,
                type: isHeart ? 'heart' : (isStar ? 'star' : 'dot'),
                size: 2.5 + Math.random() * 3.5,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: 1.0 / (280 + Math.random() * 140) // 280-420ms lifetime
            });
        }
    }

    /**
     * Update physics and render arrival sparkles.
     */
    _updateAndDrawSparkles(ctx, dt) {
        const dtSec = dt / 1000;
        const remaining = [];

        for (const sp of this._sparkles) {
            sp.life -= sp.decay * dt;
            if (sp.life <= 0) continue;

            sp.x += sp.vx * dtSec;
            sp.y += sp.vy * dtSec;
            sp.vy += sp.gravity * dtSec;
            sp.rot += sp.rotSpeed * dtSec;

            const alpha = Math.max(0, Math.min(1, sp.life));
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = sp.color;

            if (sp.type === 'star') {
                this._drawStar(ctx, sp.x, sp.y, sp.size * (0.5 + 0.5 * alpha), sp.rot);
            } else if (sp.type === 'heart') {
                this._drawHeart(ctx, sp.x, sp.y, sp.size * (0.6 + 0.4 * alpha));
            } else {
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size * 0.65 * alpha, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
            remaining.push(sp);
        }

        this._sparkles = remaining;
    }

    /**
     * Draw 4-point star.
     */
    _drawStar(ctx, cx, cy, r, rot = 0) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const a = rot + (i * Math.PI) / 4;
            const radius = (i % 2 === 0) ? r : r * 0.35;
            const px = cx + Math.cos(a) * radius;
            const py = cy + Math.sin(a) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw small cute heart.
     */
    _drawHeart(ctx, cx, cy, size) {
        ctx.beginPath();
        const topY = cy - size * 0.3;
        ctx.moveTo(cx, topY);
        ctx.bezierCurveTo(cx - size * 0.6, topY - size * 0.6, cx - size, topY + size * 0.3, cx, cy + size * 0.7);
        ctx.bezierCurveTo(cx + size, topY + size * 0.3, cx + size * 0.6, topY - size * 0.6, cx, topY);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw a cute colorful diorama person matching WorldRestaurant art style:
     * - Miniature proportion (14-22px tall at base cellSize).
     * - Soft ground contact shadow.
     * - Alternating running legs with pants & shoes.
     * - Colorful shirt with clean outline (#2A211B).
     * - Alternating swinging arms with hands.
     * - Head with skin tone, blush cheeks, tiny happy face.
     * - Stylized colorful hair (bouncing ponytail, bob, crop, cap).
     * - Natural running bounce & forward lean.
     */
    _drawCutePerson(ctx, person, currentX, currentY, targetX, targetY, cellSize, scaleMultiplier = 1.0, time = 0) {
        // Size scales smoothly with board cell size for mobile & desktop visibility
        const baseHeight = Math.max(14, Math.min(22, cellSize * 0.32));
        const personH = baseHeight * scaleMultiplier;
        const personW = personH * 0.5;

        // Facing direction based on movement towards door
        const dx = targetX - currentX;
        const facing = dx >= 0 ? 1 : -1;

        // Animated run cycle
        const runSpeed = 0.016;
        const phase = (time * runSpeed + person.phaseOffset);
        const legSwing = Math.sin(phase);
        const bounce = Math.abs(Math.sin(phase)) * (personH * 0.12);
        const armSwing = -legSwing;

        // 1. Soft ground contact shadow (drawn directly at ground coordinates)
        ctx.save();
        ctx.fillStyle = 'rgba(25, 20, 20, 0.28)';
        ctx.beginPath();
        ctx.ellipse(currentX, currentY, personW * 0.85, personW * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Character body (translated for running bounce & forward tilt)
        ctx.save();
        ctx.translate(currentX, currentY - bounce);
        ctx.rotate(facing * 0.09); // Eager forward tilt

        const strokeColor = '#2A211B';
        const legLen = personH * 0.38;
        const legW = Math.max(1.5, personH * 0.12);
        const hipY = -legLen;
        const leftLegX = -personW * 0.24;
        const rightLegX = personW * 0.24;

        // Legs (pants)
        ctx.strokeStyle = person.pantsColor;
        ctx.lineWidth = legW;
        ctx.lineCap = 'round';

        // Left leg
        const leftFootX = leftLegX + legSwing * (personH * 0.18);
        ctx.beginPath();
        ctx.moveTo(leftLegX, hipY);
        ctx.lineTo(leftFootX, 0);
        ctx.stroke();

        // Left shoe
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(leftFootX + facing * 0.8, 0, legW * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Right leg
        const rightFootX = rightLegX - legSwing * (personH * 0.18);
        ctx.beginPath();
        ctx.moveTo(rightLegX, hipY);
        ctx.lineTo(rightFootX, 0);
        ctx.stroke();

        // Right shoe
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(rightFootX + facing * 0.8, 0, legW * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // Torso / Shirt
        const torsoH = personH * 0.32;
        const neckY = hipY - torsoH;
        const shirtW = personW * 0.84;

        ctx.fillStyle = person.shirtColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-shirtW / 2, neckY, shirtW, torsoH, 2);
        } else {
            ctx.rect(-shirtW / 2, neckY, shirtW, torsoH);
        }
        ctx.fill();
        ctx.stroke();

        // Arms (swinging in opposition to legs)
        const armLen = personH * 0.30;
        const armW = Math.max(1.3, personH * 0.10);
        const shoulderY = neckY + 2;

        ctx.strokeStyle = person.shirtColor;
        ctx.lineWidth = armW;
        ctx.lineCap = 'round';

        // Back arm
        const backArmTipX = -facing * shirtW * 0.4 - armSwing * (personH * 0.16);
        const backArmTipY = shoulderY + armLen * 0.75;
        ctx.beginPath();
        ctx.moveTo(-facing * shirtW * 0.4, shoulderY);
        ctx.lineTo(backArmTipX, backArmTipY);
        ctx.stroke();

        // Front arm
        const frontArmTipX = facing * shirtW * 0.4 + armSwing * (personH * 0.16);
        const frontArmTipY = shoulderY + armLen * 0.75;
        ctx.beginPath();
        ctx.moveTo(facing * shirtW * 0.4, shoulderY);
        ctx.lineTo(frontArmTipX, frontArmTipY);
        ctx.stroke();

        // Hands (skin tone)
        ctx.fillStyle = person.skinColor;
        ctx.beginPath();
        ctx.arc(backArmTipX, backArmTipY, armW * 0.8, 0, Math.PI * 2);
        ctx.arc(frontArmTipX, frontArmTipY, armW * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headR = personH * 0.21;
        const headCenterY = neckY - headR;

        ctx.fillStyle = person.skinColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, headCenterY, headR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pink blush cheek
        ctx.fillStyle = 'rgba(255, 118, 117, 0.65)';
        ctx.beginPath();
        ctx.arc(facing * headR * 0.4, headCenterY + headR * 0.15, headR * 0.22, 0, Math.PI * 2);
        ctx.fill();

        // Tiny eye (facing restaurant)
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(facing * headR * 0.42, headCenterY - headR * 0.08, headR * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Happy smile arc
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(facing * headR * 0.25, headCenterY + headR * 0.14, headR * 0.2, 0.1 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // Hair styles
        ctx.fillStyle = person.hairColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.8;

        if (person.hairStyle === 0) {
            // Short side crop
            ctx.beginPath();
            ctx.arc(0, headCenterY - 0.5, headR * 1.05, Math.PI * 0.9, Math.PI * 2.1);
            ctx.lineTo(facing * headR * 0.6, headCenterY - headR * 0.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (person.hairStyle === 1) {
            // Bouncing ponytail
            ctx.beginPath();
            ctx.arc(0, headCenterY - 0.5, headR * 1.05, Math.PI * 0.85, Math.PI * 2.15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            const ponyBounce = Math.sin(phase * 1.5) * 1.8;
            const pX = -facing * headR * 0.85;
            const pY = headCenterY - headR * 0.5 + ponyBounce;
            ctx.beginPath();
            ctx.ellipse(pX, pY, headR * 0.6, headR * 0.38, -facing * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (person.hairStyle === 2) {
            // Bob with bangs
            ctx.beginPath();
            ctx.arc(0, headCenterY - 0.5, headR * 1.1, Math.PI * 0.75, Math.PI * 2.25);
            ctx.lineTo(-facing * headR * 0.9, headCenterY + headR * 0.35);
            ctx.lineTo(facing * headR * 0.7, headCenterY + headR * 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (person.hairStyle === 3) {
            // Fluffy / curly hair
            ctx.beginPath();
            ctx.arc(0, headCenterY - headR * 0.2, headR * 1.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Sporty baseball cap / beanie
            ctx.fillStyle = person.accentColor;
            ctx.beginPath();
            ctx.arc(0, headCenterY - headR * 0.15, headR * 1.05, Math.PI, 0);
            ctx.lineTo(facing * headR * 1.35, headCenterY);
            ctx.lineTo(0, headCenterY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

if (typeof window !== 'undefined') {
    window.CustomerRush = CustomerRush;
}
