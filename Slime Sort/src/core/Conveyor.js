// src/core/Conveyor.js

export class Conveyor {
    constructor(capacity = 7) {
        this.capacity = capacity;
        this.clusters = []; // Mảng chứa các object { id, color, size }
        this.nextId = 1;
    }

    /**
     * Tổng số unit đang trên conveyor.
     * @returns {number}
     */
    totalUnits() {
        return this.clusters.reduce((sum, cluster) => sum + cluster.size, 0);
    }

    /**
     * Kiểm tra xem conveyor có đủ chỗ nhận thêm cụm không.
     * @param {number} clusterSize 
     * @returns {boolean}
     */
    canReceive(clusterSize) {
        return this.totalUnits() + clusterSize <= this.capacity;
    }

    /**
     * Thêm cụm mới vào conveyor.
     * @param {string} color 
     * @param {number} size 
     */
    enqueue(color, size) {
        for (let i = 0; i < size; i++) {
            this.clusters.push({ id: this.nextId++, color, size: 1 });
        }
    }

    /**
     * Xử lý 1 tick (1 vòng di chuyển).
     * @param {object[]} trays - Mảng các đối tượng Tray
     * @returns {object[]} - Danh sách các event dock ({ trayIndex, color, docked })
     */
    tick(trays) {
        // Auto-docking is removed. Docking is now triggered by the UI when the cluster reaches the bottom path.
        return [];
    }

    tryDockCluster(id, trayIndex, trays) {
        const clusterIndex = this.clusters.findIndex(c => c.id === id);
        if (clusterIndex === -1) return null;
        
        const cluster = this.clusters[clusterIndex];
        const tray = trays[trayIndex];
        
        if (tray && tray.state === 'able' && tray.color === cluster.color && tray.remainingSlots() > 0) {
            const docked = tray.fill(cluster.size);
            cluster.size -= docked;
            
            if (cluster.size === 0) {
                this.clusters.splice(clusterIndex, 1);
            }
            
            return { trayIndex, color: tray.color, docked };
        }
        
        return null;
    }

    /**
     * Kiểm tra trạng thái deadlock.
     * @param {object[]} trays 
     * @returns {boolean}
     */
    isDeadlock(trays) {
        // Deadlock khi đầy
        if (this.totalUnits() < this.capacity) {
            return false;
        }

        // Nếu có ít nhất 1 cluster có thể dock vào 1 able tray thì chưa deadlock
        for (const cluster of this.clusters) {
            for (const tray of trays) {
                if (tray.state === 'able' && tray.color === cluster.color && tray.remainingSlots() > 0) {
                    return false;
                }
            }
        }

        // Đầy và không thể dock = deadlock
        return true;
    }
}
