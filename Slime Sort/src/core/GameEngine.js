// src/core/GameEngine.js

import { canPourInto, pourTube, pourToConveyor, isEmpty } from './Tube.js';
import { Conveyor } from './Conveyor.js';
import { Tray } from './Tray.js';

export class GameEngine {
    constructor() {
        this.listeners = {};
        this.tubes = [];
        this.trays = [];
        this.conveyor = null;
        this.trayScript = [];
        this.trayScriptPointer = 0;
        this.capacity = 0;
        
        this.selectedTubeIndex = -1;
        this.gameOver = false;
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, payload) {
        if (this.listeners[event]) {
            for (const cb of this.listeners[event]) cb(payload);
        }
    }

    /**
     * Khởi tạo game từ level object
     * @param {object} level 
     */
    init(level) {
        this.capacity = level.metadata.C;
        
        // Clone tubes
        this.tubes = level.tubes.map(tube => [...tube]);
        
        this.conveyor = new Conveyor(7);
        
        this.trayScript = level.tray_script;
        this.trayScriptPointer = 0;
        
        // Khởi tạo 3 trays từ 3 sự kiện đầu tiên của tray_script
        this.trays = [null, null, null];
        for (let i = 0; i < 3; i++) {
            if (this.trayScriptPointer < this.trayScript.length) {
                const event = this.trayScript[this.trayScriptPointer++];
                this.trays[event.slot] = new Tray(event.color, event.color === null ? 'unable' : 'able');
            }
        }
        // Điền các tray còn lại nếu script không đủ 3 (phòng ngừa)
        for (let i = 0; i < 3; i++) {
            if (!this.trays[i]) this.trays[i] = new Tray(null, 'unable');
        }

        this.selectedTubeIndex = -1;
        this.gameOver = false;
    }

    selectTube(index) {
        if (this.gameOver) return;

        if (this.selectedTubeIndex === index) {
            // Deselect
            this.selectedTubeIndex = -1;
            this.emit('TUBE_DESELECTED');
        } else if (this.selectedTubeIndex !== -1) {
            // Đã chọn 1 tube, giờ tap tube khác -> Pour
            this.pourTo(index);
        } else {
            // Chưa chọn, giờ chọn
            if (!isEmpty(this.tubes[index])) {
                this.selectedTubeIndex = index;
                this.emit('TUBE_SELECTED', { tubeIndex: index });
            }
        }
    }

    pourTo(targetIndex) {
        if (this.gameOver || this.selectedTubeIndex === -1) return;

        const src = this.tubes[this.selectedTubeIndex];
        const dst = this.tubes[targetIndex];

        if (canPourInto(src, dst, this.capacity)) {
            const color = src[src.length - 1]; // màu trước khi pour
            const size = pourTube(src, dst, this.capacity);
            
            const fromIndex = this.selectedTubeIndex;
            this.selectedTubeIndex = -1;
            this.emit('TUBE_DESELECTED');
            this.emit('POUR_SUCCESS', { from: fromIndex, to: targetIndex, clusterSize: size, color });
            
            this.checkWinLose(); // tube đã đổi, có thể hết tube
        } else {
            this.emit('POUR_INVALID', { tubeIndex: targetIndex });
        }
    }

    pourToConveyor() {
        if (this.gameOver || this.selectedTubeIndex === -1) return;

        const src = this.tubes[this.selectedTubeIndex];
        
        if (pourToConveyor(src, this.conveyor)) {
            const fromIndex = this.selectedTubeIndex;
            this.selectedTubeIndex = -1;
            this.emit('TUBE_DESELECTED');
            this.emit('CONVEYOR_UPDATED', { clusters: [...this.conveyor.clusters], fromTube: fromIndex });
            
            this.checkWinLose();
        } else {
            // Conveyor không đủ chỗ
            this.emit('POUR_INVALID', { tubeIndex: -1 }); // -1 có thể hiểu là conveyor invalid
        }
    }

    activateTray(index) {
        if (this.gameOver) return;
        
        const tray = this.trays[index];
        if (tray && tray.state === 'unable') {
            tray.activate();
            this.emit('TRAY_ACTIVATED', { trayIndex: index });
            this.checkWinLose();
        }
    }

    tryDockCluster(id, trayIndex) {
        if (this.gameOver) return false;
        const event = this.conveyor.tryDockCluster(id, trayIndex, this.trays);
        if (event) {
            this.emit('CONVEYOR_UPDATED', { clusters: [...this.conveyor.clusters] });
            this.emit('TRAY_FILLED', { 
                trayIndex: event.trayIndex, 
                filledSlots: event.docked 
            });
            this.checkWinLose();
            return true;
        }
        return false;
    }

    tick() {
        if (this.gameOver) return;

        // Note: tick no longer processes dock events, they are UI-driven now.
        // We still need to check harvest just in case.
        for (let i = 0; i < this.trays.length; i++) {
            const tray = this.trays[i];
            if (tray.state === 'able' && tray.isFull()) {
                tray.harvest();
                
                // Lấy tray mới
                let newColor = null; // Mặc định nếu hết script là unable
                // Tìm sự kiện tiếp theo cho slot này (hoặc có thể script không chỉ định slot mà chỉ định màu, 
                // nhưng theo plan tray_script là {slot, color})
                
                // Ở đây assume tray_script events đến theo thứ tự harvest thực tế.
                // Nếu tray_script có slot cứng thì phải tìm event kế tiếp cho slot đó? 
                // Không, theo plan: màu Tray mới sau harvest = theo tray_script (do TrayGenerator sinh).
                if (this.trayScriptPointer < this.trayScript.length) {
                    const nextEvent = this.trayScript[this.trayScriptPointer++];
                    newColor = nextEvent.color;
                    // Note: trong implementation plan ghi tray_script là (slot, color). 
                    // Generator có assign slot, nên ta nên gán đúng slot đó, nhưng wait - nếu slot sinh ra không khớp tray đang harvest?
                    // Trông cậy vào generator đảm bảo slot kế tiếp trong script chính là slot vừa harvest!
                }

                tray.reset(newColor);
                this.emit('TRAY_HARVESTED', { trayIndex: i, newColor });
            }
        }

        this.checkWinLose();
    }

    checkWinLose() {
        if (this.gameOver) return;

        // 1. Kiểm tra Lose
        if (this.conveyor.isDeadlock(this.trays)) {
            this.gameOver = true;
            this.emit('LOSE');
            return;
        }

        // 2. Kiểm tra Win
        const allTubesEmpty = this.tubes.every(tube => isEmpty(tube));
        const conveyorEmpty = this.conveyor.totalUnits() === 0;
        const scriptEnded = this.trayScriptPointer >= this.trayScript.length;
        
        // Kiểm tra xem có tray nào còn có thể nhận thêm slime không
        // (để đảm bảo không có slime nào vừa rơi xuống đang chờ xử lý)
        const noAbleTrayWithSpace = !this.trays.some(tray => tray.state === 'able' && tray.remainingSlots() > 0);

        if (allTubesEmpty && conveyorEmpty && scriptEnded && noAbleTrayWithSpace) {
            this.gameOver = true;
            this.emit('WIN');
        }
    }
}
