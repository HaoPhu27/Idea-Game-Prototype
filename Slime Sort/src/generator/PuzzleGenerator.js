// src/generator/PuzzleGenerator.js

import { 
    assignTargets, shuffle, sumValues, 
    getAllWaterSortMoves, waterSortPour, measureN, 
    pourShortfallScore, weightedChoice, totalDiff 
} from './DifficultyUtils.js';

function generateBase(K, E, C) {
    const tubes = Array.from({ length: K }, (_, i) => Array(C).fill(i.toString()));
    for (let e = 0; e < E; e++) tubes.push([]);
    return tubes;
}

function pickSolveOrder(K) {
    return shuffle(Array.from({ length: K }, (_, i) => i.toString()));
}

function weightedScramble(tubes, C, targets, steps) {
    let currentN = measureN(tubes);
    let lastMove = null;
    
    for (let s = 0; s < steps; s++) {
        let moves = getAllWaterSortMoves(tubes, C);
        
        // Anti-oscillation
        if (lastMove !== null) {
            const filtered = moves.filter(m => !(m.a === lastMove.b && m.b === lastMove.a));
            moves = filtered.length > 0 ? filtered : moves;
        }
        
        if (moves.length === 0) break;
        
        const weights = moves.map(m => pourShortfallScore(tubes, m, targets, currentN));
        const chosen = weightedChoice(moves, weights);
        
        waterSortPour(tubes, chosen.a, chosen.b, C);
        currentN = measureN(tubes);
        lastMove = chosen;
    }
}

export function generatePuzzle(K, E, C, points, unitsPerDiffPoint = 1, tolerance = 1, maxTries = 30) {
    const order = pickSolveOrder(K);
    const targets = assignTargets(order, points, unitsPerDiffPoint);
    let best = null;
    
    for (let attempt = 0; attempt < maxTries; attempt++) {
        const tubes = generateBase(K, E, C);
        // Copy tubes for safe modification inside loop
        const tubesCopy = tubes.map(t => [...t]);
        
        weightedScramble(tubesCopy, C, targets, sumValues(targets) + attempt * 2);
        
        const actual = measureN(tubesCopy);
        const err = totalDiff(actual, targets);
        
        if (err <= tolerance) return { tubes: tubesCopy, actual, targets };
        
        if (best === null || err < best.err) {
            best = { tubes: tubesCopy, actual, targets, err };
        }
    }
    
    return best;
}
