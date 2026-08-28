export class Solver {
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
