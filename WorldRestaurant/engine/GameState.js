export const CELL_TYPES = {
    LAND: 'L',
    ROAD: 'R',
    BLOCKER: 'B',
    TARGET: 'T'
};

export class GameState {
    constructor() {
        this.grid = []; // 2D array: grid[y][x]
        this.restaurants = []; // Array of {id, x, y, floors, parentId}
        this.cloudLimit = 0;
        this.phase = 'moving'; // moving, growing, splitting, win, lose
        this.isSplittingCycle = false;
    }

    // Creates a deep clone of the current state, useful for undo and processing moves safely
    clone() {
        const clonedState = new GameState();

        // Grid is static per level, so shallow copy of rows is usually fine, 
        // but let's deep copy just in case we add mutable elements later
        clonedState.grid = this.grid.map(row => [...row]);

        // Deep copy restaurants
        clonedState.restaurants = this.restaurants.map(r => ({ ...r }));

        clonedState.cloudLimit = this.cloudLimit;
        clonedState.phase = this.phase;
        clonedState.isSplittingCycle = this.isSplittingCycle;

        return clonedState;
    }

    get width() {
        return this.grid[0]?.length || 0;
    }

    get height() {
        return this.grid.length;
    }
}
