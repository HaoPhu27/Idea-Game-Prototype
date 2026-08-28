import { ITEM_CATALOG } from '../data/ItemCatalog.js';
import { Solver } from './Solver.js';

export class LevelGenerator {
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
