import { GameState, CELL_TYPES } from './GameState.js';

export class LevelLoader {
    static async loadLevelJSON(urlOrId) {
        if (typeof EMBEDDED_LEVELS !== 'undefined' && EMBEDDED_LEVELS) {
            let key = String(urlOrId);
            const match = key.match(/level_(\d+)/);
            if (match) key = match[1];
            const numKey = String(parseInt(key, 10)).padStart(3, '0');
            const data = EMBEDDED_LEVELS[numKey] || EMBEDDED_LEVELS[key] || EMBEDDED_LEVELS[parseInt(key, 10)];
            if (data) {
                return this.parseLevelData(data);
            }
        }
        try {
            const response = await fetch(urlOrId);
            const data = await response.json();
            return this.parseLevelData(data);
        } catch (error) {
            console.error(`Error loading level ${urlOrId}:`, error);
            return null;
        }
    }

    static parseLevelData(data) {
        const state = new GameState();
        state.id = data.id || '1';
        state.name = data.name || `Level ${data.id}`;
        state.cloudLimit = data.cloudLimit;
        state.movesRemaining = data.moveBudget;
        
        // Setup Grid
        state.grid = [];
        let spawnPos = data.spawnPosition;
        
        for (let y = 0; y < data.grid.length; y++) {
            const row = [];
            for (let x = 0; x < data.grid[y].length; x++) {
                let cellType = data.grid[y][x];
                
                // If S is found, it's a LAND cell + initial spawn point
                if (cellType === 'S') {
                    spawnPos = { x, y };
                    cellType = CELL_TYPES.LAND; 
                }
                
                row.push(cellType);
            }
            state.grid.push(row);
        }

        // Initialize first restaurant
        if (spawnPos) {
            state.restaurants.push({
                id: 1,
                x: spawnPos.x,
                y: spawnPos.y,
                floors: 1, // 1-indexed
                parentId: null
            });
        } else {
            console.warn("No spawn position 'S' found or defined in level data.");
        }

        return state;
    }
}
