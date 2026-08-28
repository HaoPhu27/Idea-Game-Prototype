// src/generator/TrayGenerator.js

import { 
    assignTargets, estimateExtractionOrder, totalDiff, 
    wouldOverflow, trayShortfallScore, weightedChoice, measureM
} from './DifficultyUtils.js';
import { simulateFull } from './Simulator.js';

const UNABLE_TRAY_SLOT = 2; // index cố định

function pickSlotToChange(trays, targets, currentM, exhaustedColors) {
    // Ưu tiên 1: slot đang là null
    const nullSlot = trays.findIndex(c => c === null);
    if (nullSlot >= 0) return nullSlot;
    
    // Ưu tiên 2: slot có màu đã "hết nhiệm vụ"
    const exhaustedSlot = trays.findIndex(c => exhaustedColors.has(c));
    if (exhaustedSlot >= 0) return exhaustedSlot;
    
    // Ưu tiên 3: slot có màu đã đạt target_m
    return trays.reduce((best, color, i) => {
        const surplus = (currentM[color] || 0) - (targets[color] || 0);
        return surplus > (best.surplus || -Infinity) ? { i, surplus } : best;
    }, { i: -1, surplus: -Infinity }).i;
}

export function buildTrayScript(extractionOrder, targets, numTrays = 3, maxEvents = 200) {
    const trays = Array(numTrays).fill(null);
    const script = [];
    
    const currentM = {};
    for (const c of Object.keys(targets)) currentM[c] = 0;
    
    const queue = [...extractionOrder];
    const exhaustedColors = new Set();
    const colors = Object.keys(targets);
    const inFlightColors = new Set();
    
    function totalInFlightUnits() {
        // Simplified estimate: each in flight color takes ~2-3 units
        return inFlightColors.size * 2;
    }
    
    for (let event = 0; event < maxEvents; event++) {
        if (queue.length === 0) break;
        const c = queue[0];
        
        if (trays.includes(c)) {
            exhaustedColors.add(c);
            queue.shift();
            inFlightColors.delete(c);
            continue;
        }

        const slot = pickSlotToChange(trays, targets, currentM, exhaustedColors);
        const weights = colors.map(x => trayShortfallScore(x, targets, currentM, inFlightColors));
        let color = weightedChoice(colors, weights);

        // Guard overflow conveyor
        // In prototype, we assume average cluster size is ~2
        if (wouldOverflow(totalInFlightUnits(), 2, 7)) {
            color = queue[0]; // Ép chọn màu đang cần ngay
        }

        trays[slot] = color;
        script.push({ slot, color });

        if (color !== c) {
            currentM[c] = (currentM[c] || 0) + 1;
            inFlightColors.add(c);
        }
    }
    
    return script;
}

export function generateTrayScript(tubes, colors, points, delayPerUnit = 1, tolerance = 1, maxTries = 30) {
    const order = estimateExtractionOrder(tubes, colors);
    const targets = assignTargets(order, points, delayPerUnit);
    let best = null;
    
    for (let attempt = 0; attempt < maxTries; attempt++) {
        const script = buildTrayScript(order, targets);
        const result = simulateFull(tubes, script);
        
        if (result.deadlock) continue;
        
        // Note: actualM from simulateFull is ticks on conveyor. 
        // We compare it with targets loosely, or we can use measureM analytical to compare.
        // Let's use analytical measureM for the target matching, and simulateFull just for deadlock.
        // Wait, the plan says: "err = totalDiff(result.actualM, targets);"
        // Actually, actualM from simulator is just ticks, not "tray changes".
        // Let's implement analytical measureM to compute err properly.
        const analyticalM = measureM(order, script);
        
        const err = totalDiff(analyticalM, targets);
        if (err <= tolerance) return { script, result, targets };
        
        if (best === null || err < best.err) {
            best = { script, result, targets, err };
        }
    }
    
    return best;
}
