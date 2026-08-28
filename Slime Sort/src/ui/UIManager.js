// src/ui/UIManager.js

import { TubeRenderer } from './TubeRenderer.js';
import { ConveyorRenderer } from './ConveyorRenderer.js';
import { TrayRenderer } from './TrayRenderer.js';

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        
        this.tubeRenderer = new TubeRenderer('tubes-container', 0); // capacity updated in init
        this.conveyorRenderer = new ConveyorRenderer('conveyor-track');
        this.trayRenderer = new TrayRenderer('trays-container');
        
        this.overlay = document.getElementById('overlay');
        this.overlayMessage = document.getElementById('overlay-message');
        
        this.bindEvents();
    }

    bindEvents() {
        this.engine.on('TUBE_SELECTED', ({ tubeIndex }) => {
            this.tubeRenderer.setSelected(tubeIndex);
        });

        this.engine.on('TUBE_DESELECTED', () => {
            this.tubeRenderer.clearSelected();
        });

        this.engine.on('POUR_SUCCESS', ({ from, to }) => {
            this.tubeRenderer.updateTube(from, this.engine.tubes[from]);
            this.tubeRenderer.updateTube(to, this.engine.tubes[to]);
        });

        this.engine.on('POUR_INVALID', ({ tubeIndex }) => {
            if (tubeIndex >= 0) {
                this.tubeRenderer.shake(tubeIndex);
            }
            // If -1, it means conveyor was full (we can add screen shake or just ignore)
        });

        this.engine.on('CONVEYOR_UPDATED', ({ clusters, fromTube }) => {
            this.conveyorRenderer.update(clusters, this.engine.conveyor.capacity, fromTube);
            if (this.engine.selectedTubeIndex === -1 && fromTube !== undefined) {
                this.updateAllTubes();
            }
        });

        this.engine.on('TRAY_FILLED', ({ trayIndex }) => {
            this.trayRenderer.updateTray(trayIndex, this.engine.trays[trayIndex]);
        });

        this.engine.on('TRAY_HARVESTED', ({ trayIndex, newColor }) => {
            // Cập nhật state thành harvested để css chạy anim
            this.trayRenderer.updateTray(trayIndex, this.engine.trays[trayIndex]); 
            
            this.trayRenderer.playHarvestAnimation(trayIndex, newColor, () => {
                // Sau khi anim xong, update lại với màu mới
                this.trayRenderer.updateTray(trayIndex, this.engine.trays[trayIndex]);
            });
        });

        this.engine.on('TRAY_ACTIVATED', ({ trayIndex }) => {
            this.trayRenderer.updateTray(trayIndex, this.engine.trays[trayIndex]);
        });

        this.engine.on('WIN', () => {
            this.showOverlay("You Win! 🎉");
        });

        this.engine.on('LOSE', () => {
            this.showOverlay("Deadlock! You Lose 💀");
        });
    }

    init() {
        this.tubeRenderer.capacity = this.engine.capacity;
        
        this.tubeRenderer.init(this.engine.tubes, (index) => {
            this.engine.selectTube(index);
        });
        
        this.conveyorRenderer.init(
            // onClick: pour to conveyor
            () => {
                this.engine.pourToConveyor();
            },
            // onClusterReachedTray: attempt to dock
            (clusterId, trayIndex) => {
                return this.engine.tryDockCluster(clusterId, trayIndex);
            }
        );
        
        this.trayRenderer.init(this.engine.trays, (index) => {
            this.engine.activateTray(index);
        });

        this.hideOverlay();
        this.conveyorRenderer.update(this.engine.conveyor.clusters, this.engine.conveyor.capacity);
    }

    updateAllTubes() {
        this.engine.tubes.forEach((tube, i) => {
            this.tubeRenderer.updateTube(i, tube);
        });
    }

    showOverlay(msg) {
        this.overlayMessage.textContent = msg;
        this.overlay.classList.remove('hidden');
    }

    hideOverlay() {
        this.overlay.classList.add('hidden');
    }
}
