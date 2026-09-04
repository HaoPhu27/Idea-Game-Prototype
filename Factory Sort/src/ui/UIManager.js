import { GameEngine } from '../core/GameEngine.js';
import { LevelGenerator } from '../generator/LevelGenerator.js';
import { configForLevelNumber } from '../generator/SolvableLevelGenerator.js';
import { BoxRenderer } from './BoxRenderer.js';
import { TrayRenderer } from './TrayRenderer.js';
import { ConveyorRenderer } from './ConveyorRenderer.js';
import { QueueRenderer } from './QueueRenderer.js';
import { getCategoryConfig, getItemEmoji } from '../data/ItemCatalog.js';

class UIManager {
    constructor() {
        this.engine = new GameEngine();
        
        // Renderers
        this.boxRenderer = new BoxRenderer(
            'boxes-grid',
            this.handleSlotTap.bind(this),
            this.handleDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        this.queueRenderer = new QueueRenderer();
        
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.moveDisplay = document.getElementById('move-display');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnSelectLevel = document.getElementById('btn-select-level');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.loseReason = document.getElementById('lose-reason');
        this.moveLimitDisplay = document.getElementById('move-limit');
        this.overlayLoading = document.getElementById('overlay-loading');
        this.overlayLevelSelect = document.getElementById('overlay-level-select');
        this.levelGrid = document.getElementById('level-grid');
        this.btnCloseLevelSelect = document.getElementById('btn-close-level-select');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
        this.dragState = {
            isDragging: false,
            boxId: null,
            targetTrayId: null,
            ghostW: 0,
            ghostH: 0
        };
        this._animating = false;
        this.GHOST_LIFT = 28;
        this._renderQueued = false;
        this._boLuotFlip = false;
        
        this.bindEvents();
        this.bindEngineCallbacks();
        this.renderLevelMenu();
        
        // Start
        this.startNewLevel();
    }
    
    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.currentLevel = 1;
            this.startNewLevel();
        });
        
        this.btnSelectLevel.addEventListener('click', () => {
            this.renderLevelMenu(); // Re-render to update active level class
            this.overlayLevelSelect.classList.remove('hidden');
        });

        this.btnCloseLevelSelect.addEventListener('click', () => {
            this.overlayLevelSelect.classList.add('hidden');
        });
        
        this.btnNextLevel.addEventListener('click', () => {
            this.currentLevel++;
            this.startNewLevel();
        });
        
        this.btnRetry.addEventListener('click', () => {
            this.startNewLevel(true); // pass flag to retry same? for now just generate new
        });

        // Global pointer events for dragging
        document.addEventListener('pointermove', this.handleDragMove.bind(this));
        document.addEventListener('pointerup', this.handleDragEnd.bind(this));
        document.addEventListener('pointercancel', this.handleDragEnd.bind(this));
    }
    
    // Gioi han nuoc di chi la rang buoc that neu nguoi choi NHIN THAY no con
    // bao nhieu — neu khong thi thua vi het nuoc chi la mot cu bat ngo.
    renderMoveLimit() {
        if (!this.moveLimitDisplay) return;
        const lim = this.engine.moveLimit;
        this.moveLimitDisplay.textContent = lim ? ` / ${lim}` : '';
        const left = lim ? lim - this.engine.moveCount : Infinity;
        this.moveLimitDisplay.classList.toggle('low', left <= 5);
    }

    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                this.overlayWin.classList.remove('hidden');
            } else if (state === 'LOST') {
                if (this.loseReason) {
                    this.loseReason.textContent = this.engine.loseReason || 'No more empty slots to move items.';
                }
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
        };
        
        this.engine.onMoveCountUpdated = (count) => {
            this.moveDisplay.textContent = count;
            this.renderMoveLimit();
        };

        this.engine.onQueueUpdated = (queue) => {
            this.queueRenderer.render(queue);
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayDelivered = (trayId, box) => {
            this.trayRenderer.animateTrayExit(trayId, () => {
                // Khay chua box da vao trong cua OUT -> hoan tat exit tren engine va cho phep khay moi di ra tu cua IN
                this.engine.completeTrayExit(trayId);
                this.conveyorRenderer.animateShift();
                this.trayRenderer.animateShift();
                this.updateRender();

                // Kiem tra tiep xem cac thung con lai trong hang cho co khop voi khay moi khong
                setTimeout(() => {
                    this.checkAndAutoFill();
                }, 280);
            });
            if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        };

        this.engine.onBoxWrapped = (box) => {
            const el = document.querySelector(`.box[data-box-id="${box.id}"]`);
            if (!el) return;
            const catConfig = getCategoryConfig(box.getCategory());
            const itemType = box.getItemType() || (box.items.length > 0 ? box.items[0] : null);
            const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
            if (catConfig) {
                el.style.setProperty('--cat-color', catConfig.color);
                let logo = el.querySelector('.box-logo');
                if (!logo) {
                    logo = document.createElement('div');
                    logo.className = 'box-logo';
                    el.appendChild(logo);
                }
                logo.style.setProperty('--cat-color', catConfig.color);
                logo.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
            }
            el.classList.add('wrapped');
            if (navigator.vibrate) navigator.vibrate(35);
        };
    }
    
    async renderLevelMenu() {
        this.levelGrid.innerHTML = '';
        const TOTAL_LEVELS = 50; // Render up to 50 levels for now
        
        for (let i = 1; i <= TOTAL_LEVELS; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = i;
            
            // Mau cua nut phai noi dung tier that. Truoc day UI tu bia ra
            // ("chan = super hard") va no khong lien quan gi den do kho ma bo sinh
            // man thuc su tao ra: level 22, 24, 26... deu duoc to mau super hard
            // trong khi chung la level thuong. configForLevelNumber la nguon su that
            // duy nhat cho cau hoi "level N thuoc tier nao".
            const tier = configForLevelNumber(i).tier;
            btn.classList.add(
                tier === 'hard' ? 'level-hard' :
                tier === 'superhard' ? 'level-super-hard' :
                tier === 'normal' ? 'level-normal' : 'level-easy');
            
            if (i === this.currentLevel) {
                btn.classList.add('active-level');
            }
            
            btn.addEventListener('click', () => {
                this.currentLevel = i;
                this.overlayLevelSelect.classList.add('hidden');
                this.startNewLevel();
            });
            
            this.levelGrid.appendChild(btn);
        }
    }

    async startNewLevel(isRetry = false) {
        this.overlayWin.classList.add('hidden');
        this.overlayLose.classList.add('hidden');
        this.overlayLoading.classList.remove('hidden');
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
        // Truoc day UI tu tinh mot bo tham so rieng (numBoxes/numCategories/...) khac
        // han duong cong cua bo sinh => co ba nguon su that cho cung mot khai niem
        // "level 7 kho the nao". Nay UI chi noi minh dang o level nao.
        const levelData = LevelGenerator.generateLevel({ levelNumber: this.currentLevel });
        
        this.queueRenderer.render([]);
        this.trayRenderer.reset();
        this.engine.startLevel(levelData);
        this.levelDisplay.textContent = this.currentLevel;
        this.moveDisplay.textContent = "0";
        this.renderMoveLimit();
        this._boLuotFlip = true;
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
    }
    
    updateRender() {
        if (this._renderQueued) return;
        this._renderQueued = true;
        requestAnimationFrame(() => {
            this._renderQueued = false;
            if (this._animating) return;
            this._renderNow();
        });
    }

    _renderNow() {
        const validTargets = this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : [];
        // Chi ve Thung TRONG TAM VOI, theo dung cot. Thung bi che khong vao DOM —
        // khong co phan tu nao de cham nham, va cung khong ton chi phi render.
        const hiddenCounts = this.engine.columns.map(
            col => Math.max(0, col.length - this.engine.visibleRows));
            
        const grid = document.getElementById('boxes-grid');
        const truoc = new Map();
        if (!this._boLuotFlip && grid) {
            for (const el of grid.querySelectorAll('.box[data-box-id]')) {
                truoc.set(el.dataset.boxId, el.getBoundingClientRect());
            }
        }

        this.boxRenderer.render(
            this.engine.getVisibleBoxes(), this.engine.selectedSource, validTargets, hiddenCounts, this.engine.visibleRows);
            
        this._chayFlip(grid, truoc);
        this._boLuotFlip = false;
        
        // Ensure the original box remains hidden if it's currently being dragged
        if (this.dragState.isDragging && this.dragState.boxId) {
            const dragBoxEl = document.querySelector(`.box[data-box-id="${this.dragState.boxId}"]`);
            if (dragBoxEl) dragBoxEl.classList.add('dragging');
        }
        
        let highlightTray = null;
        let rejectTray = null;
        if (this.dragState.isDragging && this.dragState.targetTrayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === this.dragState.targetTrayId);
            const box = this.engine.getBox(this.dragState.boxId);
            if (tray && box) {
                if (tray.canAccept(box)) highlightTray = tray.id;
                else rejectTray = tray.id;
            }
        }
        
        this.queueRenderer.render(this.engine.getQueue());
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
    }
    
    _chayFlip(grid, truoc) {
        if (!grid) return;
        const itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (itMotion || this._boLuotFlip) return;

        const THOI_LUONG = 260;
        const NHIP = 'cubic-bezier(.22,.61,.36,1)';

        for (const el of grid.querySelectorAll('.box[data-box-id]')) {
            if (el.classList.contains('dragging')) continue;

            const cu = truoc.get(el.dataset.boxId);
            const moi = el.getBoundingClientRect();

            if (!cu) {
                el.animate(
                    [ { transform: `translateY(${-(moi.height + 14)}px)`, opacity: 0 },
                      { transform: 'none', opacity: 1 } ],
                    { duration: THOI_LUONG, easing: NHIP, delay: 60, fill: 'backwards' }
                );
                continue;
            }

            const dx = cu.left - moi.left;
            const dy = cu.top - moi.top;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

            el.animate(
                [ { transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' } ],
                { duration: THOI_LUONG, easing: NHIP }
            );
        }
    }

    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging) return;
        if (this._animating) return;
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    if (navigator.vibrate) navigator.vibrate(12);
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            const sourceBoxBefore = this.engine.getBox(sourceId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            if (this.engine.selectTarget(boxId)) {
                this._animating = true;
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    const finishTransfer = () => {
                        if (targetBox.isWrapped) {
                            // Apply wrapped class to existing DOM to trigger transition
                            const domBox = document.querySelector(`.box[data-box-id="${boxId}"]`);
                            if (domBox) {
                                const catConfig = getCategoryConfig(targetBox.getCategory());
                                const itemType = targetBox.getItemType() || (targetBox.items.length > 0 ? targetBox.items[0] : null);
                                const displayEmoji = itemType ? getItemEmoji(itemType) : (catConfig ? catConfig.icon : '📦');
                                if (catConfig) {
                                    domBox.style.setProperty('--cat-color', catConfig.color);
                                    let logo = domBox.querySelector('.box-logo');
                                    if (!logo) {
                                        logo = document.createElement('div');
                                        logo.className = 'box-logo';
                                        domBox.appendChild(logo);
                                    }
                                    logo.style.setProperty('--cat-color', catConfig.color);
                                    logo.innerHTML = `<span class="box-logo-icon">${displayEmoji}</span>`;
                                }
                                domBox.classList.add('wrapped');
                            }
                            
                            // Doi flap gop lai va dan bang keo (0.5s) -> sau do bay xuong hang cho
                            setTimeout(() => {
                                const currentQueue = this.engine.getQueue();
                                const nextSlotIdx = currentQueue.length;
                                const domBoxCurrent = document.querySelector(`.box[data-box-id="${boxId}"]`);

                                this.queueRenderer.animateBoxToQueue(targetBox, nextSlotIdx, domBoxCurrent, () => {
                                    this.engine.moveBoxToQueue(targetBox);
                                    this._animating = false;
                                    this.updateRender();

                                    // Sau khi vao hang cho, kiem tra ngay xem co khay tren bang chuyen nhan duoc khong
                                    setTimeout(() => {
                                        this.checkAndAutoFill();
                                    }, 180);
                                });
                            }, 550);
                        } else {
                            this._animating = false;
                            this.updateRender();
                        }
                    };

                    if (willEmpty) {
                        // Thung nguon da rong -> hieu ung bien mat nhe nhang truoc khi cot tut xuong
                        const srcDom = document.querySelector(`.box[data-box-id="${sourceId}"]`);
                        if (srcDom) {
                            srcDom.classList.add('disappearing');
                            if (navigator.vibrate) navigator.vibrate(20);
                            setTimeout(() => {
                                finishTransfer();
                            }, 200);
                        } else {
                            finishTransfer();
                        }
                    } else {
                        finishTransfer();
                    }
                });
            } else {
                // Invalid or deselected
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    this.engine.selectSource(boxId, itemIndex);
                }
                
                const el = document.querySelector(`.box[data-box-id="${boxId}"]`);
                if (el) {
                    el.classList.add('reject');
                    setTimeout(() => el.classList.remove('reject'), 220);
                }
                if (navigator.vibrate) navigator.vibrate(18);
                
                this.updateRender();
            }
        }
    }
    
    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (!this.engine.startDragWrappedBox(boxId)) return;
        
        this.dragState.isDragging = true;
        this.dragState.boxId = boxId;
        this.dragState.targetTrayId = null;
        
        // Add dragging class to original box
        const boxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
        if (boxEl) boxEl.classList.add('dragging');
        
        document.body.classList.add('is-dragging');
        
        // Setup ghost — capture the actual rendered size BEFORE changing className
        const boxRect = boxEl.getBoundingClientRect();
        this.dragState.ghostW = boxRect.width;
        this.dragState.ghostH = boxRect.height;
        this.dragGhost.className = boxEl.className; // Copy .box .wrapped etc.
        this.dragGhost.classList.remove('dragging'); // Ensure ghost is visible
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.position = 'fixed';
        this.dragGhost.style.width = `${boxRect.width}px`;
        this.dragGhost.style.height = `${boxRect.height}px`;
        this.dragGhost.style.zIndex = '1000';
        this.dragGhost.style.pointerEvents = 'none';
        this.dragGhost.style.margin = '0';
        this.dragGhost.innerHTML = boxEl.innerHTML; // Clone visual
        this.moveGhost(e.clientX, e.clientY);
        
        this.updateRender();
    }
    
    handleDragMove(e) {
        if (!this.dragState.isDragging) return;
        e.preventDefault();
        
        this.moveGhost(e.clientX, e.clientY);
        
        // Hit test against trays
        const hitY = e.clientY - this.GHOST_LIFT;
        const elementsUnder = document.elementsFromPoint(e.clientX, hitY);
        const trayEl = elementsUnder.find(el => el.classList && el.classList.contains('tray'));
        
        const newTargetTrayId = trayEl ? trayEl.dataset.trayId : null;
        
        if (this.dragState.targetTrayId !== newTargetTrayId) {
            this.dragState.targetTrayId = newTargetTrayId;
            this.updateRender();
        }
    }
    
    handleDragEnd(e) {
        if (!this.dragState.isDragging) return;
        
        const boxId = this.dragState.boxId;
        const trayId = this.dragState.targetTrayId;
        
        this.dragState.isDragging = false;
        this.dragState.boxId = null;
        this.dragState.targetTrayId = null;
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.remove('is-dragging'));
        });
        
        if (trayId) {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => t.id === trayId);
            const box = this.engine.getBox(boxId);
            
            if (tray && box && tray.canAccept(box)) {
                // Animate ghost dropping into tray
                const trayEl = document.querySelector(`.tray[data-tray-id="${trayId}"]`);
                if (trayEl) {
                    const rect = trayEl.getBoundingClientRect();
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;
                    
                    this.dragGhost.style.transition = 'all 0.3s ease-in';
                    const ghostW = this.dragGhost.offsetWidth;
                    const ghostH = this.dragGhost.offsetHeight;
                    this.dragGhost.style.left = `${targetX - ghostW / 2}px`;
                    this.dragGhost.style.top = `${targetY - ghostH / 2}px`
                    this.dragGhost.style.transform = 'scale(0.5)';
                    this.dragGhost.style.opacity = '0';
                    
                    setTimeout(() => {
                        this.dragGhost.style.display = 'none';
                        this.dragGhost.style.transition = '';
                        this.dragGhost.style.transform = '';
                        this.dragGhost.style.opacity = '';
                        this.dragGhost.style.width = '';
                        this.dragGhost.style.height = '';
                        this.engine.dropOnTray(trayId);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
            }
        }
        
        this.dragGhost.style.display = 'none';
        this.dragGhost.style.width = '';
        this.dragGhost.style.height = '';
        this.engine.cancelDrag();
        this.updateRender();
    }
    
    moveGhost(x, y) {
        const w = this.dragState.ghostW || 120;
        const h = this.dragState.ghostH || 70;
        this.dragGhost.style.left = `${x - w / 2}px`;
        this.dragGhost.style.top = `${y - h / 2 - this.GHOST_LIFT}px`;
    }

    /**
     * Kiem tra xem co hop nao trong hang cho khop voi khay tren conveyor khong, neu co thi tu dong fill
     */
    checkAndAutoFill() {
        if (this.engine.gameState !== 'PLAYING') return;
        if (this._animating) return;

        const match = this.engine.findQueueMatch();
        if (!match) return;

        const { box, tray } = match;
        const trayEl = document.querySelector(`.tray[data-tray-id="${tray.id}"]`);
        const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);

        if (!trayEl || !slotEl) {
            this.engine.deliverQueueBox(box.id, tray.id);
            return;
        }

        this._animating = true;
        this.queueRenderer.animateBoxToTray(box, slotEl, trayEl, () => {
            this._animating = false;
            this.engine.deliverQueueBox(box.id, tray.id);
        });
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new UIManager();
});
