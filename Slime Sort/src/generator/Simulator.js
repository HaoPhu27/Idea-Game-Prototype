// src/generator/Simulator.js

import { estimateExtractionOrder } from './DifficultyUtils.js';
import { Conveyor } from '../core/Conveyor.js';
import { Tray } from '../core/Tray.js';
import { getTopCluster, pourToConveyor } from '../core/Tube.js';

export function simulateFull(tubes, trayScript, C = 7) {
    const tubesCopy = tubes.map(t => [...t]);
    const conveyor = new Conveyor(C);
    
    // Khởi tạo trays từ 3 sự kiện đầu
    const trays = [
        new Tray(null, 'unable'),
        new Tray(null, 'unable'),
        new Tray(null, 'unable')
    ];
    
    let pointer = 0;
    for (let i = 0; i < 3 && pointer < trayScript.length; i++) {
        const event = trayScript[pointer++];
        trays[event.slot] = new Tray(event.color, event.color === null ? 'unable' : 'able');
    }
    
    // Để cho an toàn và theo tuỳ chọn prototype: coi unable tray như được click ngay.
    for (const t of trays) {
        if (t && t.color !== null && t.state === 'unable') {
            t.activate();
        }
    }

    const colors = new Set();
    tubesCopy.forEach(t => t.forEach(c => colors.add(c)));
    const extractionOrder = estimateExtractionOrder(tubesCopy, colors);

    const actualM = {};
    const loopCount = {};
    let peakConveyorLoad = 0;
    let totalDockEvents = 0;
    let totalTicks = 0;
    
    // Helper to find next tube to pour
    function findNextPour() {
        for (const color of extractionOrder) {
            for (let i = 0; i < tubesCopy.length; i++) {
                if (tubesCopy[i].length > 0 && tubesCopy[i].at(-1) === color) {
                    const cluster = getTopCluster(tubesCopy[i]);
                    if (conveyor.canReceive(cluster.size)) {
                        return i;
                    }
                }
            }
        }
        
        // Nếu extractionOrder không lấy được (vì kẹt), lấy bất kỳ tube nào có thể
        for (let i = 0; i < tubesCopy.length; i++) {
            if (tubesCopy[i].length > 0) {
                const cluster = getTopCluster(tubesCopy[i]);
                if (conveyor.canReceive(cluster.size)) {
                    return i;
                }
            }
        }
        return -1;
    }

    let consecutiveIdleTicks = 0;

    // Simulation loop
    while (true) {
        totalTicks++;
        
        // Cố gắng đổ từ tube ra conveyor
        let poured = false;
        let nextTube = findNextPour();
        while (nextTube !== -1) {
            pourToConveyor(tubesCopy[nextTube], conveyor);
            poured = true;
            nextTube = findNextPour();
        }

        const currentLoad = conveyor.totalUnits();
        if (currentLoad > peakConveyorLoad) peakConveyorLoad = currentLoad;

        // Tick conveyor
        const preTickClusters = conveyor.clusters.map(c => ({...c}));
        const dockEvents = conveyor.tick(trays);
        totalDockEvents += dockEvents.length;

        // Tính m (actualM) - đơn giản hoá: đếm số tick mỗi cluster tồn tại trên conveyor mà chưa được dock
        // (Đây là xấp xỉ cho M: delay time)
        for (const c of conveyor.clusters) {
            actualM[c.color] = (actualM[c.color] || 0) + 1;
        }

        // Check harvest
        for (let i = 0; i < trays.length; i++) {
            if (trays[i].state === 'able' && trays[i].isFull()) {
                trays[i].harvest();
                if (pointer < trayScript.length) {
                    const event = trayScript[pointer++];
                    trays[i].reset(event.color);
                    // Activate immediately for prototype sim
                    if (trays[i].state === 'unable' && trays[i].color !== null) {
                        trays[i].activate();
                    }
                }
            }
        }

        // Deadlock check
        if (conveyor.isDeadlock(trays)) {
            return { deadlock: true, actualM, peakConveyorLoad, totalDockEvents, loopCount, totalTicks };
        }

        // Win check
        const allEmpty = tubesCopy.every(t => t.length === 0) && conveyor.totalUnits() === 0;
        if (allEmpty) {
            return { deadlock: false, actualM, peakConveyorLoad, totalDockEvents, loopCount, totalTicks };
        }

        // Infinite loop prevention
        if (dockEvents.length === 0 && !poured) {
            consecutiveIdleTicks++;
            if (consecutiveIdleTicks > 100) {
                return { deadlock: true, actualM, peakConveyorLoad, totalDockEvents, loopCount, totalTicks }; // Bị kẹt
            }
        } else {
            consecutiveIdleTicks = 0;
        }
    }
}
