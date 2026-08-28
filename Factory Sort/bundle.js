// --- src/data/ItemCatalog.js ---
const ITEM_CATALOG = {
    categories: [
        {
            id: 'stuffed_animals',
            label: 'Thú nhồi bông',
            color: '#FFB6C1', // Pink
            items: [
                { id: 'bear', emoji: '🧸', label: 'Gấu bông' },
                { id: 'duck', emoji: '🦆', label: 'Vịt bông' },
                { id: 'bunny', emoji: '🐰', label: 'Thỏ bông' },
            ]
        },
        {
            id: 'food',
            label: 'Đồ ăn',
            color: '#FFDAB9', // Peach
            items: [
                { id: 'apple', emoji: '🍎', label: 'Táo' },
                { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                { id: 'donut', emoji: '🍩', label: 'Donut' },
            ]
        },
        {
            id: 'stationery',
            label: 'Văn phòng phẩm',
            color: '#ADD8E6', // Light Blue
            items: [
                { id: 'pencil', emoji: '✏️', label: 'Bút chì' },
                { id: 'paperclip', emoji: '📎', label: 'Kẹp giấy' },
                { id: 'scissors', emoji: '✂️', label: 'Kéo' },
            ]
        },
        {
            id: 'sports',
            label: 'Thể thao',
            color: '#90EE90', // Light Green
            items: [
                { id: 'soccer', emoji: '⚽', label: 'Bóng đá' },
                { id: 'basketball', emoji: '🏀', label: 'Bóng rổ' },
                { id: 'tennis', emoji: '🎾', label: 'Bóng tennis' }
            ]
        }
    ]
};

function getCategoryByItemId(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return cat.id;
            }
        }
    }
    return null;
}

function getItemEmoji(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return item.emoji;
            }
        }
    }
    return '❓';
}

function getCategoryConfig(categoryId) {
    return ITEM_CATALOG.categories.find(c => c.id === categoryId);
}


// --- src/core/Box.js ---

class Box {
    constructor(id) {
        this.id = id;
        this.items = []; // Stack of item IDs, max 3. items[0] is bottom, items[items.length-1] is top.
        this.isWrapped = false;
        this.maxSize = 3;
    }

    removeItem(index) {
        if (this.isWrapped || this.items.length === 0 || index < 0 || index >= this.items.length) {
            return null;
        }
        // Remove item at index and shift rest down
        return this.items.splice(index, 1)[0];
    }

    push(itemId) {
        if (this.canAccept()) {
            this.items.push(itemId);
            return true;
        }
        return false;
    }

    canAccept() {
        // GDD v0.3: Target box only needs to have at least 1 empty slot. No type restriction.
        return this.items.length < this.maxSize && !this.isWrapped;
    }

    isFull() {
        return this.items.length === this.maxSize;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    checkWrapped() {
        if (this.isFull() && !this.isWrapped) {
            const firstId = this.items[0];
            const allSame = this.items.every(id => id === firstId);
            if (allSame) {
                this.isWrapped = true;
                return true;
            }
        }
        return false;
    }

    getCategory() {
        if (!this.isWrapped || this.items.length === 0) return null;
        return getCategoryByItemId(this.items[0]);
    }
    
    clone() {
        const cloned = new Box(this.id);
        cloned.items = [...this.items];
        cloned.isWrapped = this.isWrapped;
        return cloned;
    }
}


// --- src/core/Tray.js ---
class Tray {
    constructor(id, categoryId, targetItemId) {
        this.id = id;
        this.categoryId = categoryId;
        this.targetItemId = targetItemId; // Optional, for display purposes if we want to show specifically what the tray wants
        this.slot = null; // Holds the wrapped Box when received
    }

    canAccept(box) {
        if (!box) return false;
        return box.isWrapped && box.getCategory() === this.categoryId && this.slot === null;
    }

    receiveBox(box) {
        if (this.canAccept(box)) {
            this.slot = box;
            return true;
        }
        return false;
    }

    isFull() {
        return this.slot !== null;
    }
}


// --- src/core/Conveyor.js ---
class Conveyor {
    constructor(maxActive = 4) {
        this.maxActive = maxActive;
        this.allTrays = [];
        this.windowStart = 0;
    }

    initialize(trays) {
        this.allTrays = [...trays];
        this.windowStart = 0;
    }

    rotateRight() { // View shifts right (trays move left visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart + 1) % this.allTrays.length;
    }

    rotateLeft() { // View shifts left (trays move right visually)
        if (this.allTrays.length <= this.maxActive) return;
        this.windowStart = (this.windowStart - 1 + this.allTrays.length) % this.allTrays.length;
    }

    removeTray(trayId) {
        const index = this.allTrays.findIndex(t => t.id === trayId);
        if (index !== -1) {
            this.allTrays.splice(index, 1);
            if (this.allTrays.length > 0) {
                this.windowStart = this.windowStart % this.allTrays.length;
            } else {
                this.windowStart = 0;
            }
            return true;
        }
        return false;
    }

    hasRemainingTrays() {
        return this.allTrays.length > 0;
    }

    getAllActiveTrays() {
        if (this.allTrays.length === 0) return [];
        const result = [];
        for (let i = 0; i < Math.min(this.maxActive, this.allTrays.length); i++) {
            result.push(this.allTrays[(this.windowStart + i) % this.allTrays.length]);
        }
        return result;
    }

    findMatchingTray(categoryId) {
        return this.getAllActiveTrays().find(t => !t.isFull() && t.categoryId === categoryId);
    }
}


// --- src/core/GameEngine.js ---

class GameEngine {
    constructor() {
        this.boxes = [];
        this.conveyor = new Conveyor();
        this.selectedBoxId = null;
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.gameState = 'IDLE'; // IDLE, PLAYING, WON, LOST
        
        // Callbacks for UI
        this.onBoxUpdated = null;
        this.onBoxWrapped = null;
        this.onTrayExited = null;
        this.onGameStateChanged = null;
        this.onMoveCountUpdated = null;
    }

    startLevel(levelConfig) {
        this.boxes = levelConfig.boxes.map((boxData, idx) => {
            const box = new Box(idx);
            boxData.items.forEach(item => box.push(item));
            box.checkWrapped(); // Just in case it starts wrapped
            return box;
        });

        const trayInstances = levelConfig.trays.map(t => new Tray(t.id, t.categoryId, t.targetItemId));
        this.conveyor.initialize(trayInstances);
        this.selectedSource = null; // { boxId, itemIndex }
        this.draggedBoxId = null;
        this.moveCount = 0;
        this.setGameState('PLAYING');
    }
    
    setGameState(newState) {
        this.gameState = newState;
        if (this.onGameStateChanged) this.onGameStateChanged(newState);
    }

    getBox(id) {
        return this.boxes.find(b => b.id === id);
    }

    // Layer 1: Tap source item
    selectSource(boxId, itemIndex) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
        if (!box || box.isWrapped || box.isEmpty() || itemIndex < 0 || itemIndex >= box.items.length) {
            return false;
        }
        
        this.selectedSource = { boxId, itemIndex };
        return true;
    }
    
    deselectSource() {
        this.selectedSource = null;
    }

    // Layer 1: Tap target
    selectTarget(boxId) {
        if (this.gameState !== 'PLAYING' || !this.selectedSource) return false;
        
        // If clicking the same box, just deselect for now (or could allow sorting within same box if needed, but usually we just deselect)
        if (this.selectedSource.boxId === boxId) {
            this.deselectSource();
            return false;
        }

        const sourceBox = this.getBox(this.selectedSource.boxId);
        const targetBox = this.getBox(boxId);

        if (!sourceBox || !targetBox || !targetBox.canAccept()) {
            return false;
        }

        // Perform move
        const item = sourceBox.removeItem(this.selectedSource.itemIndex);
        if (item === null) return false;
        
        targetBox.push(item);
        
        this.moveCount++;
        if (this.onMoveCountUpdated) this.onMoveCountUpdated(this.moveCount);
        
        this.deselectSource();
        
        // Notify UI of box updates
        if (this.onBoxUpdated) {
            this.onBoxUpdated(sourceBox);
            this.onBoxUpdated(targetBox);
        }

        // Check if wrapped
        if (targetBox.checkWrapped()) {
            if (this.onBoxWrapped) this.onBoxWrapped(targetBox);
        }

        this.checkConditions();
        return true;
    }

    getValidTargets(sourceBoxId) {
        const sourceBox = this.getBox(sourceBoxId);
        if (!sourceBox || sourceBox.isWrapped || sourceBox.isEmpty()) return [];
        
        // Any box that can accept
        return this.boxes.filter(b => b.id !== sourceBoxId && b.canAccept()).map(b => b.id);
    }

    // Layer 2: Drag wrapped box
    startDragWrappedBox(boxId) {
        if (this.gameState !== 'PLAYING') return false;
        
        const box = this.getBox(boxId);
        if (!box || !box.isWrapped) return false;
        
        this.draggedBoxId = boxId;
        return true;
    }
    
    cancelDrag() {
        this.draggedBoxId = null;
    }

    // Layer 2: Drop on tray
    dropOnTray(trayId) {
        if (this.gameState !== 'PLAYING' || this.draggedBoxId === null) return false;

        const box = this.getBox(this.draggedBoxId);
        const tray = this.conveyor.getAllActiveTrays().find(t => t.id === trayId);

        if (!tray || !tray.canAccept(box)) {
            return false; // Invalid drop
        }

        // Valid drop
        tray.receiveBox(box);
        
        // Remove box from play area
        this.boxes = this.boxes.filter(b => b.id !== box.id);
        
        this.draggedBoxId = null;
        
        // Handle Tray exit & Conveyor shift
        this.conveyor.removeTray(trayId);
        
        if (this.onTrayExited) this.onTrayExited(trayId);
        if (this.onBoxUpdated) this.onBoxUpdated(box, true); // True flag for 'removed'

        this.checkConditions();
        return true;
    }

    checkConditions() {
        if (this.gameState !== 'PLAYING') return;

        // Check Win
        // All trays cleared, no items left
        const noItemsLeft = this.boxes.every(b => b.isEmpty());
        if (!this.conveyor.hasRemainingTrays() && noItemsLeft) {
            this.setGameState('WON');
            return;
        }

        // Check Lose
        // All non-wrapped boxes are full -> no empty slots available
        const activeBoxes = this.boxes.filter(b => !b.isWrapped && !b.isEmpty());
        const hasEmptySlots = activeBoxes.length === 0 || this.boxes.some(b => !b.isWrapped && !b.isFull());
        
        // Edge case: if we have wrapped boxes but no active trays match them, we might be stuck
        // But let's stick to the GDD rule first: Lose when no empty slots.
        if (!hasEmptySlots) {
            this.setGameState('LOST');
        }
    }
}


// --- src/generator/Solver.js ---
class Solver {
    /**
     * Solves a given initial state using BFS.
     * State representation: Array of boxes. Each box is an array of item IDs.
     * @param {Array<Array<string>>} initialBoxes 
     * @returns {Object} { solvable: boolean, minMoves: number }
     */
    static solve(initialBoxes, maxDepth = 25) {
        // Queue stores { state: [[...], [...]], depth: 0 }
        const queue = [{ state: this.cloneState(initialBoxes), depth: 0 }];
        const visited = new Set();
        
        visited.add(this.hashState(initialBoxes));

        let nodesExplored = 0;
        const MAX_NODES = 10000; // Failsafe to prevent browser freeze

        while (queue.length > 0) {
            const current = queue.shift();
            nodesExplored++;

            if (this.isWinState(current.state)) {
                // console.log(`Solver found solution in ${current.depth} moves. Nodes explored: ${nodesExplored}`);
                return { solvable: true, minMoves: current.depth };
            }

            if (current.depth >= maxDepth || nodesExplored > MAX_NODES) {
                continue;
            }

            const nextStates = this.generateNextStates(current.state);

            for (const nextState of nextStates) {
                const hash = this.hashState(nextState);
                if (!visited.has(hash)) {
                    visited.add(hash);
                    queue.push({ state: nextState, depth: current.depth + 1 });
                }
            }
        }

        // console.log(`Solver failed after ${nodesExplored} nodes.`);
        return { solvable: false, minMoves: -1 };
    }

    static cloneState(state) {
        return state.map(box => [...box]);
    }

    // Hash state by sorting boxes to treat permutations of identical boxes as same state
    static hashState(state) {
        const strBoxes = state.map(box => box.join(','));
        strBoxes.sort();
        return strBoxes.join('|');
    }

    static isWinState(state) {
        for (const box of state) {
            if (box.length > 0) {
                if (box.length !== 3) return false;
                if (box[0] !== box[1] || box[1] !== box[2]) return false;
            }
        }
        return true;
    }
    
    static isWrapped(box) {
        return box.length === 3 && box[0] === box[1] && box[1] === box[2];
    }

    static generateNextStates(state) {
        const nextStates = [];
        
        for (let i = 0; i < state.length; i++) {
            const sourceBox = state[i];
            
            // Can't pick if empty or wrapped
            if (sourceBox.length === 0 || this.isWrapped(sourceBox)) continue;
            
            // Pick any item from the box
            for (let itemIndex = 0; itemIndex < sourceBox.length; itemIndex++) {
                for (let j = 0; j < state.length; j++) {
                    if (i === j) continue;
                    const targetBox = state[j];
                    
                    // Can't push if full or wrapped
                    if (targetBox.length === 3 || this.isWrapped(targetBox)) continue;
                    
                    // Valid move! Create new state
                    const newState = this.cloneState(state);
                    const item = newState[i].splice(itemIndex, 1)[0];
                    newState[j].push(item);
                    
                    nextStates.push(newState);
                }
            }
        }
        
        return nextStates;
    }
}


// --- src/generator/LevelGenerator.js ---

class LevelGenerator {
    static generateLevel(config) {
        const {
            numBoxes = 6,
            numEmptyBoxes = 1,
            numCategories = 2,
            itemTypesPerCat = 2
        } = config;

        let levelData = null;
        let attempts = 0;
        const maxAttempts = 50;

        while (!levelData && attempts < 1) { // Only need 1 attempt now
            attempts++;
            const candidate = this.createCandidate(numBoxes, numEmptyBoxes, numCategories, itemTypesPerCat);
            
            // With Open Grid, any configuration is theoretically solvable as long as there is 1 empty box.
            // Solver BFS hits node limit due to massive branching factor, causing UI freeze.
            // Skipping solver for prototype performance.
            candidate.difficulty = { minMoves: 0 };
            levelData = candidate;
            console.log(`Generated level instantly (Solver skipped for Open Grid)`);
        }

        if (!levelData) {
            console.warn(`Failed to generate solvable level after ${maxAttempts} attempts. Falling back to naive candidate.`);
            levelData = this.createCandidate(numBoxes, numEmptyBoxes, numCategories, itemTypesPerCat);
            levelData.difficulty = { minMoves: -1 };
        }

        return levelData;
    }

    static createCandidate(numBoxes, numEmptyBoxes, numCategories, itemTypesPerCat) {
        // 1. Pick random categories
        const availableCats = [...ITEM_CATALOG.categories].sort(() => 0.5 - Math.random());
        const selectedCats = availableCats.slice(0, Math.min(numCategories, availableCats.length));
        
        // 2. Pick item types
        const selectedItems = [];
        selectedCats.forEach(cat => {
            const shuffledItems = [...cat.items].sort(() => 0.5 - Math.random());
            const picked = shuffledItems.slice(0, Math.min(itemTypesPerCat, shuffledItems.length));
            picked.forEach(p => {
                selectedItems.push({ categoryId: cat.id, itemId: p.id });
            });
        });
        
        // 3. We need exactly enough items to fill the non-empty boxes
        const numFilledBoxes = numBoxes - numEmptyBoxes;
        const totalItemsNeeded = numFilledBoxes * 3;
        
        const itemPool = [];
        let typeIndex = 0;
        
        // Each chosen type needs to be added in multiples of 3 to form complete wrapped boxes eventually
        // We will randomly assign sets of 3 to the pool from our selected types
        while (itemPool.length < totalItemsNeeded) {
            const type = selectedItems[typeIndex % selectedItems.length];
            itemPool.push(type.itemId, type.itemId, type.itemId);
            typeIndex++;
        }
        
        // If we have excess (due to multiples of 3), we'll trim (though logic above should ideally match if numFilledBoxes == selectedItems.length)
        // Actually, to ensure every item in the pool has exactly 3 instances, we should just use the exact pool
        // This implies numFilledBoxes must equal typeIndex.
        // Let's ensure selectedItems length is exactly numFilledBoxes by sampling with replacement if needed
        const finalTypes = [];
        for (let i = 0; i < numFilledBoxes; i++) {
            finalTypes.push(selectedItems[i % selectedItems.length]);
        }
        
        const strictPool = [];
        const trays = [];
        finalTypes.forEach(t => {
            strictPool.push(t.itemId, t.itemId, t.itemId);
            trays.push({ categoryId: t.categoryId, targetItemId: t.itemId });
        });
        
        // Shuffle strictPool
        strictPool.sort(() => 0.5 - Math.random());
        
        // 4. Fill boxes
        const boxes = [];
        for (let i = 0; i < numBoxes; i++) {
            if (i < numFilledBoxes) {
                boxes.push({ items: [strictPool.pop(), strictPool.pop(), strictPool.pop()] });
            } else {
                boxes.push({ items: [] });
            }
        }
        
        // Shuffle boxes so empty ones aren't always at the end
        boxes.sort(() => 0.5 - Math.random());
        
        // Shuffle trays so they appear in random order on conveyor
        trays.sort(() => 0.5 - Math.random());
        
        // Add IDs to trays
        trays.forEach((t, i) => t.id = `tray_${i}`);

        return {
            id: `gen_${Date.now()}`,
            boxes: boxes,
            trays: trays,
            conveyorType: 'oval',
            maxActiveTrays: 4
        };
    }
}


// --- src/ui/BoxRenderer.js ---

class BoxRenderer {
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


// --- src/ui/TrayRenderer.js ---

class TrayRenderer {
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


// --- src/ui/ConveyorRenderer.js ---
class ConveyorRenderer {
    constructor(beltId) {
        this.belt = document.getElementById(beltId);
    }
    
    // In a more complex version, this would handle belt animation speed, etc.
    // For this prototype, CSS handles the static repeating background.
    
    animateShift() {
        // E.g., speed up the belt temporarily
        this.belt.style.animation = 'moveBelt 0.5s linear';
        setTimeout(() => {
            this.belt.style.animation = '';
        }, 500);
    }
}


// --- src/ui/UIManager.js ---

class UIManager {
    constructor() {
        this.engine = new GameEngine();
        
        // Renderers
        this.boxRenderer = new BoxRenderer(
            'boxes-grid',
            this.handleSlotTap.bind(this),
            this.handleDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.moveDisplay = document.getElementById('move-display');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.overlayLoading = document.getElementById('overlay-loading');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
        this.dragState = {
            isDragging: false,
            boxId: null,
            targetTrayId: null
        };
        
        this.bindEvents();
        this.bindEngineCallbacks();
        
        // Start
        this.startNewLevel();
    }
    
    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.currentLevel = 1;
            this.startNewLevel();
        });
        
        this.btnNextLevel.addEventListener('click', () => {
            this.currentLevel++;
            this.startNewLevel();
        });
        
        this.btnRetry.addEventListener('click', () => {
            this.startNewLevel(true); // pass flag to retry same? for now just generate new
        });

        // Global pointer events for dragging
        document.addEventListener('pointermove', this.handleDragMove.bind(this));
        document.addEventListener('pointerup', this.handleDragEnd.bind(this));
        document.addEventListener('pointercancel', this.handleDragEnd.bind(this));
    }
    
    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                this.overlayWin.classList.remove('hidden');
            } else if (state === 'LOST') {
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
        };
        
        this.engine.onMoveCountUpdated = (count) => {
            this.moveDisplay.textContent = count;
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayExited = (trayId) => {
            this.trayRenderer.animateTrayExit(trayId, () => {
                this.updateRender();
            });
            this.conveyorRenderer.animateShift();
        };
    }
    
    async startNewLevel(retry = false) {
        this.overlayWin.classList.add('hidden');
        this.overlayLose.classList.add('hidden');
        this.overlayLoading.classList.remove('hidden');
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        // Increase difficulty slightly with level
        const config = {
            numBoxes: Math.min(6 + Math.floor(this.currentLevel / 3), 10),
            numEmptyBoxes: 1, // Fixed for now
            numCategories: Math.min(2 + Math.floor(this.currentLevel / 2), 4),
            itemTypesPerCat: 2
        };
        
        const levelData = LevelGenerator.generateLevel(config);
        
        this.engine.startLevel(levelData);
        this.levelDisplay.textContent = this.currentLevel;
        this.moveDisplay.textContent = "0";
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
    }
    
    updateRender() {
        const validTargets = this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : [];
        this.boxRenderer.render(this.engine.boxes, this.engine.selectedSource, validTargets);
        
        // Ensure the original box remains hidden if it's currently being dragged
        if (this.dragState.isDragging && this.dragState.boxId) {
            const dragBoxEl = document.querySelector(`.box[data-box-id="${this.dragState.boxId}"]`);
            if (dragBoxEl) dragBoxEl.classList.add('dragging');
        }
        
        let highlightTray = null;
        let rejectTray = null;
        if (this.dragState.isDragging && this.dragState.targetTrayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === this.dragState.targetTrayId);
            const box = this.engine.getBox(this.dragState.boxId);
            if (tray && box) {
                if (tray.canAccept(box)) highlightTray = tray.id;
                else rejectTray = tray.id;
            }
        }
        
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
    }
    
    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging) return;
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            if (this.engine.selectTarget(boxId)) {
                // Animate then update
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    if (targetBox.isWrapped) {
                        // Apply wrapped class to existing DOM to trigger transition
                        const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
                        if (domBox) domBox.classList.add('wrapped');
                        
                        // Wait for flap animation (0.5s) + tape (0.3s) = 0.8s
                        setTimeout(() => {
                            this.updateRender();
                        }, 800);
                    } else {
                        this.updateRender();
                    }
                });
            } else {
                // Invalid or deselected
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    this.engine.selectSource(boxId, itemIndex);
                }
                this.updateRender();
            }
        }
    }
    
    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (!this.engine.startDragWrappedBox(boxId)) return;
        
        this.dragState.isDragging = true;
        this.dragState.boxId = boxId;
        this.dragState.targetTrayId = null;
        
        // Add dragging class to original box
        const boxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
        if (boxEl) boxEl.classList.add('dragging');
        
        document.body.classList.add('is-dragging');
        
        // Setup ghost
        this.dragGhost.className = boxEl.className; // Copy .box .wrapped etc.
        this.dragGhost.classList.remove('dragging'); // Ensure ghost is visible
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.position = 'fixed';
        this.dragGhost.style.zIndex = '1000';
        this.dragGhost.style.pointerEvents = 'none';
        this.dragGhost.style.margin = '0';
        this.dragGhost.innerHTML = boxEl.innerHTML; // Clone visual
        this.moveGhost(e.clientX, e.clientY);
        
        this.updateRender();
    }
    
    handleDragMove(e) {
        if (!this.dragState.isDragging) return;
        e.preventDefault();
        
        this.moveGhost(e.clientX, e.clientY);
        
        // Hit test against trays
        const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
        const trayEl = elementsUnder.find(el => el.classList && el.classList.contains('tray'));
        
        const newTargetTrayId = trayEl ? trayEl.dataset.trayId : null;
        
        if (this.dragState.targetTrayId !== newTargetTrayId) {
            this.dragState.targetTrayId = newTargetTrayId;
            this.updateRender();
        }
    }
    
    handleDragEnd(e) {
        if (!this.dragState.isDragging) return;
        
        const boxId = this.dragState.boxId;
        const trayId = this.dragState.targetTrayId;
        
        this.dragState.isDragging = false;
        this.dragState.boxId = null;
        this.dragState.targetTrayId = null;
        
        document.body.classList.remove('is-dragging');
        
        if (trayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === trayId);
            const box = this.engine.getBox(boxId);
            
            if (tray && box && tray.canAccept(box)) {
                // Animate ghost dropping into tray
                const trayEl = document.querySelector(`.tray[data-tray-id="${trayId}"]`);
                if (trayEl) {
                    const rect = trayEl.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;
                    
                    this.dragGhost.style.transition = 'all 0.3s ease-in';
                    this.dragGhost.style.left = `${targetX - 60}px`; // 120/2
                    this.dragGhost.style.top = `${targetY - 35}px`; // 70/2
                    this.dragGhost.style.transform = 'scale(0.5)';
                    this.dragGhost.style.opacity = '0';
                    
                    setTimeout(() => {
                        this.dragGhost.style.display = 'none';
                        this.dragGhost.style.transition = '';
                        this.dragGhost.style.transform = '';
                        this.dragGhost.style.opacity = '';
                        this.engine.dropOnTray(trayId);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
            }
        }
        
        this.dragGhost.style.display = 'none';
        this.engine.cancelDrag();
        this.updateRender();
    }
    
    moveGhost(x, y) {
        this.dragGhost.style.left = `${x}px`;
        this.dragGhost.style.top = `${y}px`;
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new UIManager();
});


