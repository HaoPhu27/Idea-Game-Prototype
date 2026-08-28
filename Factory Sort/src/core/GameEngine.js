import { Box } from './Box.js';
import { Conveyor } from './Conveyor.js';
import { Tray } from './Tray.js';

export class GameEngine {
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
