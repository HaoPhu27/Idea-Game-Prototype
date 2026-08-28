import { CELL_TYPES } from './GameState.js';

export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

export class GameRules {
    /**
     * Attempts to move the whole restaurant shape.
     * Returns { newState, events } if successful, or null if invalid move.
     */
    static applyMove(state, direction) {
        if (state.phase !== 'moving') return null;

        const newState = state.clone();
        const events = [];

        // 1. Translate shape
        const canTranslate = this.translateShape(newState, direction);
        if (!canTranslate) return null;

        // 2. Connectivity check
        if (!this.checkConnectivity(newState)) {
            return null;
        }

        events.push({ type: 'MOVE', direction });

        // 3. Process Splitting or Growth
        if (newState.isSplittingCycle) {
            // Find the restaurant with smallest ID that is at max limit
            const splitTarget = newState.restaurants
                .filter(r => r.floors >= newState.cloudLimit)
                .sort((a, b) => a.id - b.id)[0];

            if (splitTarget) {
                const splitEvents = this.applySingleSplit(newState, splitTarget, direction);
                if (!splitEvents) {
                    return null; // Move rejected if split cannot occur
                }
                events.push(...splitEvents);

                if (!this.checkConnectivity(newState)) {
                    return null; // Move rejected if split causes disconnect
                }

                // Check if cycle is over
                const anyAtMax = newState.restaurants.some(r => r.floors >= newState.cloudLimit);
                if (!anyAtMax) {
                    newState.isSplittingCycle = false;
                }
            } else {
                newState.isSplittingCycle = false; // Failsafe
            }
        } else {
            // Growth Phase
            const growthEvent = this.applyGrowth(newState);
            if (growthEvent) {
                events.push(growthEvent);
            }

            // Check if we need to start a splitting cycle next move
            const allAtMax = newState.restaurants.every(r => r.floors >= newState.cloudLimit);
            if (allAtMax) {
                newState.isSplittingCycle = true;
            }
        }

        // 4. Check Win / Lose
        if (this.checkLose(newState)) {
            newState.phase = 'lose';
            events.push({ type: 'LOSE' });
        } else if (this.checkWin(newState)) {
            newState.phase = 'win';
            events.push({ type: 'WIN' });
        }

        return { newState, events };
    }

    static translateShape(state, direction) {
        for (const rest of state.restaurants) {
            const nextX = rest.x + direction.x;
            const nextY = rest.y + direction.y;

            if (!this.isValidPosition(state, nextX, nextY)) {
                return false;
            }
        }

        for (const rest of state.restaurants) {
            rest.x += direction.x;
            rest.y += direction.y;
        }

        return true;
    }

    static applyGrowth(state) {
        let target = null;
        let minId = Infinity;

        for (const rest of state.restaurants) {
            if (rest.floors < state.cloudLimit && rest.id < minId) {
                minId = rest.id;
                target = rest;
            }
        }

        if (target) {
            target.floors += 1;
            return { type: 'GROW', restaurantId: target.id, newFloors: target.floors };
        }
        return null;
    }

    static applySingleSplit(state, rest, moveDirection) {
        let splitDir = moveDirection;
        let nextX = rest.x + splitDir.x;
        let nextY = rest.y + splitDir.y;

        if (!this.isValidPosition(state, nextX, nextY) || this.isOccupied(state, nextX, nextY)) {
            splitDir = { x: -moveDirection.x, y: -moveDirection.y }; // Bounce 180
            nextX = rest.x + splitDir.x;
            nextY = rest.y + splitDir.y;
        }

        if (!this.isValidPosition(state, nextX, nextY) || this.isOccupied(state, nextX, nextY)) {
            return null; // Cannot split
        }

        // Split floors in half
        const halfFloors = Math.floor(rest.floors / 2);
        rest.floors = halfFloors;

        let maxId = state.restaurants.reduce((max, r) => Math.max(max, r.id), 0);

        const newRest = {
            id: maxId + 1,
            x: nextX,
            y: nextY,
            floors: halfFloors,
            parentId: rest.id
        };
        state.restaurants.push(newRest);
        return [{ type: 'SPLIT', parentId: rest.id, child: newRest }];
    }

    static isOccupied(state, x, y) {
        return state.restaurants.some(r => r.x === x && r.y === y);
    }

    static checkConnectivity(state) {
        if (state.restaurants.length === 0) return true;

        // BFS to check if all restaurants form a single connected component
        const visited = new Set();
        const queue = [state.restaurants[0]];
        visited.add(state.restaurants[0].id);

        while (queue.length > 0) {
            const current = queue.shift();

            for (const other of state.restaurants) {
                if (!visited.has(other.id)) {
                    const dx = Math.abs(current.x - other.x);
                    const dy = Math.abs(current.y - other.y);
                    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                        visited.add(other.id);
                        queue.push(other);
                    }
                }
            }
        }

        return visited.size === state.restaurants.length;
    }

    static checkWin(state) {
        // Win: Exact footprint match
        let targetCellsCount = 0;
        let matchedCellsCount = 0;

        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                if (state.grid[y][x] === CELL_TYPES.TARGET) {
                    targetCellsCount++;
                    const hasRestaurant = state.restaurants.some(r => r.x === x && r.y === y);
                    if (hasRestaurant) matchedCellsCount++;
                }
            }
        }

        return targetCellsCount > 0 && targetCellsCount === matchedCellsCount && state.restaurants.length === targetCellsCount;
    }

    static checkLose(state) {
        // Collect target coordinates
        const targets = [];
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                if (state.grid[y][x] === CELL_TYPES.TARGET) {
                    targets.push({x, y});
                }
            }
        }

        // Lose 1: Total restaurant footprint > target footprint
        if (state.restaurants.length > targets.length) {
            return true;
        }

        // Lose 2: Current shape cannot fit inside target shape (not a subset of any translation)
        if (state.restaurants.length > 0 && targets.length > 0) {
            const refRest = state.restaurants[0];
            let canFit = false;

            // Try every possible translation that maps refRest to a target cell
            for (const t of targets) {
                const dx = t.x - refRest.x;
                const dy = t.y - refRest.y;

                let allMatch = true;
                for (const r of state.restaurants) {
                    const targetX = r.x + dx;
                    const targetY = r.y + dy;

                    const isTarget = targets.some(tgt => tgt.x === targetX && tgt.y === targetY);
                    if (!isTarget) {
                        allMatch = false;
                        break;
                    }
                }

                if (allMatch) {
                    canFit = true;
                    break;
                }
            }

            if (!canFit) return true;
        }

        return false;
    }

    static isValidPosition(state, x, y) {
        // Bounds check
        if (y < 0 || y >= state.height || x < 0 || x >= state.width) {
            return false;
        }

        // Blocker check
        const cellType = state.grid[y][x];
        if (cellType === CELL_TYPES.BLOCKER) {
            return false;
        }

        return true;
    }
}
