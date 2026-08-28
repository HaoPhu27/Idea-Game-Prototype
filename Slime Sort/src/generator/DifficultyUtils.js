// src/generator/DifficultyUtils.js

// ─── SHARED MATH ───────────────────────────────────────────────────────────

export function curve(p, points) {
    for (let i = 0; i < points.length - 1; i++) {
        const [p0, d0] = points[i];
        const [p1, d1] = points[i + 1];
        if (p >= p0 && p <= p1) {
            if (p0 === p1) return d0;
            const t = (p - p0) / (p1 - p0);
            return d0 + t * (d1 - d0);
        }
    }
    return points[points.length - 1][1];
}

export function assignTargets(colorsInOrder, points, unitsPerDiffPoint = 1) {
    const n = colorsInOrder.length;
    const targets = {};
    for (let i = 0; i < n; i++) {
        const p = n > 1 ? i / (n - 1) : 0;
        targets[colorsInOrder[i]] = Math.round(curve(p, points) * unitsPerDiffPoint);
    }
    return targets;
}

export function totalDiff(actual, targets) {
    let sum = 0;
    for (const c in targets) {
        sum += Math.abs((actual[c] || 0) - (targets[c] || 0));
    }
    return sum;
}

export function weightedChoice(items, weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
}

export function shuffle(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

export function sumValues(obj) {
    return Object.values(obj).reduce((sum, val) => sum + val, 0);
}

// ─── WATER SORT RULES (CHỈ DÙNG TRONG PuzzleGenerator) ────────────────────

export function waterSortValidPour(tubes, a, b, C) {
    if (a === b || tubes[a].length === 0) return false;
    if (tubes[b].length >= C) return false;
    return tubes[b].length === 0 || tubes[b].at(-1) === tubes[a].at(-1);
}

export function waterSortPour(tubes, a, b, C) {
    const color = tubes[a].at(-1);
    let space = C - tubes[b].length;
    while (tubes[a].length > 0 && tubes[a].at(-1) === color && space > 0) {
        tubes[b].push(tubes[a].pop());
        space--;
    }
}

export function getAllWaterSortMoves(tubes, C) {
    const moves = [];
    for (let a = 0; a < tubes.length; a++) {
        for (let b = 0; b < tubes.length; b++) {
            if (waterSortValidPour(tubes, a, b, C)) {
                moves.push({ a, b });
            }
        }
    }
    return moves;
}

// ─── COVERING INDEX (Tube layout analysis) ────────────────────────────────

export function tubeLayers(tube) {
    const layers = [];
    for (const slime of tube) {
        if (layers.length > 0 && layers[layers.length - 1].color === slime) {
            layers[layers.length - 1].size++;
        } else {
            layers.push({ color: slime, size: 1 });
        }
    }
    return layers;
}

export function colorCoverCount(tubes, color) {
    let total = 0;
    for (const tube of tubes) {
        const layers = tubeLayers(tube);
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].color === color) {
                for (let j = i + 1; j < layers.length; j++) {
                    if (layers[j].color !== color) total++;
                }
            }
        }
    }
    return total;
}

export function measureN(tubes) {
    const colors = new Set();
    for (const tube of tubes) {
        for (const c of tube) colors.add(c);
    }
    const currentN = {};
    for (const c of colors) {
        currentN[c] = colorCoverCount(tubes, c);
    }
    return currentN;
}

// ─── TRAY DELAY (Tray script analysis) ────────────────────────────────────

export function estimateExtractionOrder(tubes, colors) {
    return [...colors].sort((a, b) => colorCoverCount(tubes, a) - colorCoverCount(tubes, b));
}

export function measureM(extractionOrder, trayScript, numTrays = 3) {
    const trays = Array(numTrays).fill(null);
    const m = {};
    const queue = [...extractionOrder];
    
    for (const event of trayScript) {
        trays[event.slot] = event.color;
        
        while (queue.length > 0 && trays.includes(queue[0])) {
            queue.shift();
        }
        
        if (queue.length > 0) {
            const c = queue[0];
            m[c] = (m[c] || 0) + 1;
        }
    }
    return m;
}

export function wouldOverflow(inFlightUnits, incomingClusterSize, cConv = 7) {
    return inFlightUnits + incomingClusterSize > cConv;
}

// ─── SHORTFALL SCORES ─────────────────────────────────────────────────────

export function pourShortfallScore(tubes, move, targets, currentN) {
    // Clone tubes and apply move
    const tempTubes = tubes.map(t => [...t]);
    waterSortPour(tempTubes, move.a, move.b, 999); // C value here doesn't matter much as valid check is done
    
    const newN = measureN(tempTubes);
    let score = 0;
    for (const c in targets) {
        if (newN[c] > currentN[c]) {
            score += Math.max(targets[c] - currentN[c], 0);
        }
    }
    return score + 0.01; // epsilon
}

export function trayShortfallScore(color, targets, currentM, inFlightColors) {
    const base = Math.max((targets[color] || 0) - (currentM[color] || 0), 0);
    return base + 0.01;
}
