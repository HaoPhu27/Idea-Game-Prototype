import { GameEngine } from '../core/GameEngine.js';
import { LevelGenerator } from '../generator/LevelGenerator.js';
import { configForLevelNumber } from '../generator/SolvableLevelGenerator.js';
import { BoxRenderer } from './BoxRenderer.js';
import { TrayRenderer } from './TrayRenderer.js';
import { ConveyorRenderer } from './ConveyorRenderer.js';
import { QueueRenderer } from './QueueRenderer.js';
import { TutorialManager } from './TutorialManager.js';
import { AudioManager } from './AudioManager.js';
import { VFXManager } from './VFXManager.js';
import { getCategoryConfig, getItemEmoji } from '../data/ItemCatalog.js';

class UIManager {
    constructor() {
        this.engine = new GameEngine();
        
        // Audio & Visual Effects
        this.audio = new AudioManager();
        this.vfx = new VFXManager();
        
        // Renderers
        this.boxRenderer = new BoxRenderer(
            'boxes-grid',
            this.handleSlotTap.bind(this),
            this.handleDragStart.bind(this),
            this.handleItemDragStart.bind(this)
        );
        this.trayRenderer = new TrayRenderer('trays-container');
        this.trayRenderer.onTick = this.checkQueuePickup.bind(this);
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        this.queueRenderer = new QueueRenderer();
        this.tutorialManager = new TutorialManager(this, this.engine);
        
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.btnHeaderLevel = document.getElementById('btn-header-level');
        this.moveDisplay = document.getElementById('move-display');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnSelectLevel = document.getElementById('btn-select-level');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnSound = document.getElementById('btn-sound');
        this.soundIconOn = document.getElementById('sound-icon-on');
        this.soundIconOff = document.getElementById('sound-icon-off');
        this.btnWinReplay = document.getElementById('btn-win-replay');
        this.btnLoseLevels = document.getElementById('btn-lose-levels');
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.loseReason = document.getElementById('lose-reason');
        this.moveLimitDisplay = document.getElementById('move-limit');
        this.overlayLoading = document.getElementById('overlay-loading');
        this.overlayLevelSelect = document.getElementById('overlay-level-select');
        this.levelGrid = document.getElementById('level-grid');
        this.btnCloseLevelSelect = document.getElementById('btn-close-level-select');
        
        this.winStarsEl = document.getElementById('win-stars');
        this.winStatMoves = document.getElementById('win-stat-moves');
        this.winStatTime = document.getElementById('win-stat-time');
        this.winStatEff = document.getElementById('win-stat-eff');
        
        this.dragGhost = document.getElementById('drag-ghost');
        
        // State
        this.currentLevel = 1;
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        this.dragState = {
            isDragging: false,
            boxId: null,
            targetTrayId: null,
            ghostW: 0,
            ghostH: 0
        };
        this.itemDragState = {
            isDragging: false,
            sourceBoxId: null,
            sourceSlotIndex: null,
            itemId: null,
            targetBoxId: null,
            targetSlotIndex: null,
            pointerId: null,
            pointerTarget: null,
            sourceSlotEl: null,
            ghostEl: null,
            startX: 0,
            startY: 0
        };
        this._animating = false;
        this.GHOST_LIFT = 28;
        this._renderQueued = false;
        this._boLuotFlip = false;
        this._lastAffectedColIndex = null;
        
        this.bindEvents();
        this.bindEngineCallbacks();
        this.renderLevelMenu();
        this.updateSoundUI();
        
        // Start
        this.startNewLevel();
    }
    
    updateSoundUI() {
        if (!this.soundIconOn || !this.soundIconOff) return;
        if (this.audio.on) {
            this.soundIconOn.classList.remove('hidden');
            this.soundIconOff.classList.add('hidden');
        } else {
            this.soundIconOn.classList.add('hidden');
            this.soundIconOff.classList.remove('hidden');
        }
    }

    bindEvents() {
        this.btnNewGame.addEventListener('click', () => {
            this.audio.tap();
            this.currentLevel = 1;
            this.startNewLevel();
        });
        
        const openLevelMenu = () => {
            this.audio.tap();
            this.renderLevelMenu(); // Re-render to update active level class
            this.overlayLevelSelect.classList.remove('hidden');
        };

        if (this.btnSelectLevel) {
            this.btnSelectLevel.addEventListener('click', openLevelMenu);
        }
        if (this.btnHeaderLevel) {
            this.btnHeaderLevel.addEventListener('click', openLevelMenu);
        }

        this.btnCloseLevelSelect.addEventListener('click', () => {
            this.audio.tap();
            this.overlayLevelSelect.classList.add('hidden');
        });
        
        this.btnNextLevel.addEventListener('click', () => {
            this.audio.tap();
            this.currentLevel++;
            this.startNewLevel();
        });
        
        this.btnRetry.addEventListener('click', () => {
            this.audio.tap();
            this.startNewLevel(true);
        });

        if (this.btnSound) {
            this.btnSound.addEventListener('click', () => {
                this.audio.toggle();
                this.updateSoundUI();
            });
        }

        if (this.btnWinReplay) {
            this.btnWinReplay.addEventListener('click', () => {
                this.audio.tap();
                this.startNewLevel(true);
            });
        }

        if (this.btnLoseLevels) {
            this.btnLoseLevels.addEventListener('click', () => {
                this.audio.tap();
                this.overlayLose.classList.add('hidden');
                this.renderLevelMenu();
                this.overlayLevelSelect.classList.remove('hidden');
            });
        }

        // Global unlock on first user gesture for Web Audio API
        const unlockAudio = () => {
            this.audio.ensure();
            document.removeEventListener('pointerdown', unlockAudio);
        };
        document.addEventListener('pointerdown', unlockAudio);

        // Global pointer events for dragging (wrapped boxes to trays & items between boxes)
        document.addEventListener('pointermove', (e) => {
            this.handleDragMove(e);
            this.handleItemDragMove(e);
        });
        document.addEventListener('pointerup', (e) => {
            this.handleDragEnd(e);
            this.handleItemDragEnd(e);
        });
        document.addEventListener('pointercancel', (e) => {
            this.handleDragEnd(e);
            this.handleItemDragEnd(e);
        });
    }
    
    renderMoveLimit() {
        if (!this.moveLimitDisplay) return;
        this.moveLimitDisplay.textContent = '';
        this.moveLimitDisplay.classList.remove('low');
    }

    showWinCelebration() {
        const elapsedSec = Math.max(1, Math.floor((performance.now() - this.levelStartTime) / 1000));
        const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const secs = (elapsedSec % 60).toString().padStart(2, '0');

        if (this.winStatMoves) this.winStatMoves.textContent = this.engine.moveCount;
        if (this.winStatTime) this.winStatTime.textContent = `${mins}:${secs}`;
        if (this.winStatEff) this.winStatEff.textContent = '100%';

        // Tính sao dựa trên độ tối ưu nước đi (1, 2, hoặc 3 sao)
        const cfg = configForLevelNumber(this.currentLevel);
        const par = cfg.par || Math.max(4, Math.floor((cfg.numBoxes || 6) * 1.5));
        let stars = 3;
        if (this.engine.moveCount > par * 1.5) stars = 2;
        if (this.engine.moveCount > par * 2.3) stars = 1;

        if (this.winStarsEl) {
            const starSpans = this.winStarsEl.querySelectorAll('.star');
            starSpans.forEach((s, idx) => {
                s.classList.remove('on');
                if (idx < stars) {
                    setTimeout(() => {
                        s.classList.add('on');
                        this.audio.star(idx);
                    }, 280 + idx * 220);
                }
            });
        }

        this.audio.win();
        this.vfx.confetti(this.overlayWin);
        this.overlayWin.classList.remove('hidden');
    }

    bindEngineCallbacks() {
        this.engine.onGameStateChanged = (state) => {
            if (state === 'WON') {
                if (this.currentLevel === 1) {
                    this.tutorialManager.onGameStateWon();
                } else {
                    this.showWinCelebration();
                }
            } else if (state === 'LOST') {
                this.audio.lose();
                if (this.loseReason) {
                    const queueFull = this.engine.getQueue().length >= this.engine.maxQueueSize;
                    this.loseReason.textContent = queueFull
                        ? `Hàng chờ đầy ${this.engine.maxQueueSize}/${this.engine.maxQueueSize} và không Khay nào đang chạy nhận được các kiện này.`
                        : 'Mọi Thùng đang hiện đều đã kín 3 ô mà không có Thùng nào gom đủ 3 món cùng loại.';
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
            this.vfx.bump('stat-moves');
        };

        this.engine.onQueueUpdated = (queue) => {
            this.queueRenderer.render(queue);
            this.vfx.bump('queue-counter');
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };
        
        this.engine.onTrayDelivered = (trayId, box) => {
            if (this.tutorialManager) this.tutorialManager.onTrayDelivered(trayId, box);
            this.trayRenderer.animateTrayExit(trayId, () => {
                // Khay chua box da vao trong cua OUT -> hoan tat exit tren engine va cho phep khay moi di ra tu cua IN
                this.engine.completeTrayExit(trayId);
                this.conveyorRenderer.animateShift();
                this.trayRenderer.animateShift();
                this.updateRender();
            });
            if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
        };

        this.engine.onBoxWrapped = (box) => {
            if (this.tutorialManager) this.tutorialManager.onBoxWrapped(box);
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
            this.audio.wrap();
            this.vfx.burst(el, catConfig ? catConfig.color : '#f59e0b', 16);
            this.vfx.praise(el, 'ĐÓNG GÓI! 📦', 1);
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
            
            const cfg = configForLevelNumber(i);
            const tier = cfg.tier;

            let tierClass = 'level-normal';
            let tierDesc = 'Thường';

            if (tier === 'tutorial') {
                tierClass = 'level-tutorial';
                tierDesc = `Hướng dẫn (${cfg.numBoxes} thùng)`;
            } else if (tier === 'onboarding' || tier === 'acclimation') {
                tierClass = 'level-acclimation';
                tierDesc = `Làm quen (${cfg.numBoxes} thùng)`;
            } else if (tier === 'hard') {
                tierClass = 'level-hard';
                tierDesc = `Khó (${cfg.numBoxes} thùng)`;
            } else if (tier === 'superhard') {
                tierClass = 'level-super-hard';
                tierDesc = `Siêu khó (${cfg.numBoxes} thùng)`;
            } else {
                tierDesc = `Thường (${cfg.numBoxes} thùng)`;
            }

            btn.classList.add(tierClass);
            btn.title = `Level ${i} • ${tierDesc}`;
            
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
        
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
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

        if (this.currentLevel === 1) {
            this.tutorialManager.startLevel1Tutorial();
        } else {
            this.tutorialManager.skipTutorial();
        }
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
        const validTargets = this.itemDragState.isDragging
            ? this.engine.getValidTargets(this.itemDragState.sourceBoxId)
            : (this.engine.selectedSource ? this.engine.getValidTargets(this.engine.selectedSource.boxId) : []);
        const hiddenCounts = this.engine.columns.map(
            col => Math.max(0, col.length - this.engine.visibleRows));
            
        const peekingBoxes = this.engine.columns.map(col => {
            if (col.length > this.engine.visibleRows) {
                return this.engine.getBox(col[this.engine.visibleRows]);
            }
            return null;
        });

        const grid = document.getElementById('boxes-grid');
        const truoc = new Map();
        if (!this._boLuotFlip && grid) {
            for (const el of grid.querySelectorAll('.box:not(.peek-box)[data-box-id]')) {
                truoc.set(el.dataset.boxId, el.getBoundingClientRect());
            }
        }

        this.boxRenderer.render(
            this.engine.getVisibleBoxes(),
            this.engine.selectedSource,
            validTargets,
            hiddenCounts,
            this.engine.visibleRows,
            peekingBoxes
        );
            
        this._chayFlip(grid, truoc);
        this._boLuotFlip = false;
        
        // Ensure the original box remains hidden if it's currently being dragged
        if (this.dragState.isDragging && this.dragState.boxId) {
            const dragBoxEl = document.querySelector(`.box[data-box-id="${this.dragState.boxId}"]`);
            if (dragBoxEl) dragBoxEl.classList.add('dragging');
        }

        // Ensure slot-dragging class persists on rerender
        if (this.itemDragState.isDragging && this.itemDragState.sourceBoxId !== null) {
            const srcBoxEl = document.querySelector(`.box[data-box-id="${this.itemDragState.sourceBoxId}"]`);
            if (srcBoxEl) {
                const slotEl = srcBoxEl.querySelector(`.slot[data-slot-index="${this.itemDragState.sourceSlotIndex}"]`);
                if (slotEl) slotEl.classList.add('slot-dragging');
            }
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
        if (this.tutorialManager && this.tutorialManager.active) {
            this.tutorialManager.updatePositions();
        }
    }
    
    _chayFlip(grid, truoc) {
        if (!grid) return;
        const itMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (itMotion || this._boLuotFlip) return;

        const THOI_LUONG = 2400;
        const NHIP = 'cubic-bezier(0.25, 1, 0.4, 1)';
        const animatedCols = new Set();

        const cs = getComputedStyle(grid);
        const gap = parseFloat(cs.rowGap || cs.gap) || 8;

        for (const el of grid.querySelectorAll('.box:not(.peek-box)[data-box-id]')) {
            if (el.classList.contains('dragging')) continue;

            const cu = truoc.get(el.dataset.boxId);
            const moi = el.getBoundingClientRect();
            const colEl = el.closest('.box-column');
            const colIndex = colEl && colEl.dataset.colIndex !== undefined ? Number(colEl.dataset.colIndex) : null;

            if (!cu) {
                // Thùng mới từ đáy trượt LÊN vị trí hàng dưới cùng
                const startY = moi.height + gap;
                el.animate(
                    [ { transform: `translateY(${startY}px)`, opacity: 0.72 },
                      { transform: 'none', opacity: 1 } ],
                    { duration: THOI_LUONG, easing: NHIP }
                );
                if (colIndex !== null && !animatedCols.has(colIndex)) {
                    animatedCols.add(colIndex);
                    this.boxRenderer.triggerRollAnimation(colIndex);
                    this.audio.conveyorRoll();
                }
                continue;
            }

            const dx = cu.left - moi.left;
            const dy = cu.top - moi.top;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;

            el.animate(
                [ { transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' } ],
                { duration: THOI_LUONG, easing: NHIP }
            );

            // Băng chuyền đẩy các thùng trượt lên
            if (colIndex !== null && !animatedCols.has(colIndex)) {
                animatedCols.add(colIndex);
                this.boxRenderer.triggerRollAnimation(colIndex);
                this.audio.conveyorRoll();
            }
        }

        // Animate thùng trong ô peek ở đáy trượt lên từ từ
        for (const colIndex of animatedCols) {
            const peekSlot = this.boxRenderer._peekSlots ? this.boxRenderer._peekSlots[colIndex] : null;
            const peekBox = peekSlot ? peekSlot.querySelector('.box.peek-box') : null;
            if (peekBox) {
                const peekRect = peekBox.getBoundingClientRect();
                const startY = peekRect.height + gap;
                peekBox.animate(
                    [ { transform: `translateY(${startY}px)`, opacity: 0.25 },
                      { transform: 'none', opacity: 0.72 } ],
                    { duration: THOI_LUONG, easing: NHIP }
                );
            }
        }

        // Đảm bảo cột có thùng vừa biến mất hoặc bay vào hàng chờ luôn chạy cuộn băng chuyền
        if (this._lastAffectedColIndex !== null) {
            if (!animatedCols.has(this._lastAffectedColIndex)) {
                this.boxRenderer.triggerRollAnimation(this._lastAffectedColIndex);
                this.audio.conveyorRoll();
            }
            this._lastAffectedColIndex = null;
        }
    }

    // --- Layer 1 Input (Tap) ---
    handleSlotTap(boxId, itemIndex) {
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (this._animating) return;
        
        // During tutorial, enforce allowed target to prevent accidental wrong placement
        if (this.tutorialManager && this.tutorialManager.active) {
            if (!this.tutorialManager.isAllowedTap(boxId, itemIndex)) {
                this.tutorialManager.onDisallowedTap(boxId);
                return;
            }
            this.tutorialManager.onSlotTapped(boxId, itemIndex);
        }
        
        if (this.engine.selectedSource === null) {
            // Select source - must tap an actual item
            if (itemIndex !== null) {
                if (this.engine.selectSource(boxId, itemIndex)) {
                    this.audio.tap();
                    if (navigator.vibrate) navigator.vibrate(12);
                    this.updateRender();
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            const sourceBoxBefore = this.engine.getBox(sourceId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            if (this.engine.selectTarget(boxId, itemIndex)) {
                this.audio.swap();
                this._animating = true;
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    this._finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox);
                });
            } else {
                // Invalid or deselected
                this.audio.reject();
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    if (this.engine.selectSource(boxId, itemIndex)) {
                        this.audio.tap();
                    }
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

    // --- Layer 1 Input: Item Drag & Drop ---
    handleItemDragStart(boxId, slotIndex, slotEl, e) {
        if (this._animating) return;
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (!this.engine.isAccessible(boxId)) return;

        const box = this.engine.getBox(boxId);
        if (!box || box.isWrapped) return;

        const itemId = box.slots ? box.slots[slotIndex] : null;
        if (!itemId) return;

        // Tutorial check
        if (this.tutorialManager && this.tutorialManager.active) {
            if (this.tutorialManager.isAllowedDragStart && !this.tutorialManager.isAllowedDragStart(boxId)) {
                this.tutorialManager.onDisallowedTap(boxId);
                return;
            }
        }

        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.pointerId !== undefined && slotEl && slotEl.setPointerCapture) {
                try { slotEl.setPointerCapture(e.pointerId); } catch (_) {}
            }
        }

        this.itemDragState.isDragging = true;
        this.itemDragState.sourceBoxId = boxId;
        this.itemDragState.sourceSlotIndex = slotIndex;
        this.itemDragState.itemId = itemId;
        this.itemDragState.targetBoxId = null;
        this.itemDragState.targetSlotIndex = null;
        this.itemDragState.pointerId = e ? e.pointerId : null;
        this.itemDragState.pointerTarget = slotEl;
        this.itemDragState.sourceSlotEl = slotEl;
        this.itemDragState.startX = e ? e.clientX : 0;
        this.itemDragState.startY = e ? e.clientY : 0;

        slotEl.classList.add('slot-dragging');
        document.body.classList.add('is-item-dragging');

        // Create or get ghost
        let ghost = document.getElementById('item-drag-ghost');
        if (!ghost) {
            ghost = document.createElement('div');
            ghost.id = 'item-drag-ghost';
            ghost.className = 'item-drag-ghost';
            document.body.appendChild(ghost);
        }
        ghost.textContent = getItemEmoji(itemId);
        ghost.style.display = 'flex';
        ghost.style.transition = 'none';
        ghost.style.left = `${e ? e.clientX : 0}px`;
        ghost.style.top = `${(e ? e.clientY : 0) - 22}px`;
        ghost.style.transform = 'translate(-50%, -50%) scale(1.18)';
        ghost.style.opacity = '1';
        this.itemDragState.ghostEl = ghost;

        this.audio.tap();
        if (navigator.vibrate) navigator.vibrate(10);

        this.updateRender();
    }

    handleItemDragMove(e) {
        if (!this.itemDragState.isDragging) return;
        if (e.preventDefault) e.preventDefault();

        const ghost = this.itemDragState.ghostEl;
        if (ghost) {
            ghost.style.left = `${e.clientX}px`;
            ghost.style.top = `${e.clientY - 22}px`;
        }

        // Hit test: kiem tra ca diem cham va vi tri ghost
        let elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
        let boxEl = elementsUnder.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
        let slotEl = elementsUnder.find(el => el.classList && el.classList.contains('slot'));

        if (!boxEl) {
            const hitUnderGhost = document.elementsFromPoint(e.clientX, e.clientY - 22);
            boxEl = hitUnderGhost.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
            if (!slotEl) slotEl = hitUnderGhost.find(el => el.classList && el.classList.contains('slot'));
        }

        // Clear existing hover highlights
        document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
        document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));

        if (boxEl) {
            const hoverBoxId = boxEl.dataset.boxId;
            const targetBox = this.engine.getBox(hoverBoxId);
            const isSource = String(hoverBoxId) === String(this.itemDragState.sourceBoxId);
            const isValid = !isSource && targetBox && !targetBox.isWrapped && targetBox.canAccept() && this.engine.isAccessible(hoverBoxId);

            if (isValid) {
                boxEl.classList.add('drag-over');
                this.itemDragState.targetBoxId = hoverBoxId;

                if (slotEl && slotEl.closest('.box') === boxEl && slotEl.classList.contains('placeholder')) {
                    slotEl.classList.add('drop-target-active');
                    this.itemDragState.targetSlotIndex = Number(slotEl.dataset.slotIndex);
                } else {
                    this.itemDragState.targetSlotIndex = null;
                }
            } else {
                this.itemDragState.targetBoxId = null;
                this.itemDragState.targetSlotIndex = null;
            }
        } else {
            this.itemDragState.targetBoxId = null;
            this.itemDragState.targetSlotIndex = null;
        }
    }

    handleItemDragEnd(e) {
        if (!this.itemDragState.isDragging) return;

        if (this.itemDragState.pointerId !== null && this.itemDragState.pointerTarget && this.itemDragState.pointerTarget.releasePointerCapture) {
            try { this.itemDragState.pointerTarget.releasePointerCapture(this.itemDragState.pointerId); } catch (_) {}
        }
        this.itemDragState.pointerId = null;
        this.itemDragState.pointerTarget = null;

        document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
        document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));

        const srcBoxId = this.itemDragState.sourceBoxId;
        const srcSlotIndex = this.itemDragState.sourceSlotIndex;
        let targetBoxId = this.itemDragState.targetBoxId;
        let targetSlotIndex = this.itemDragState.targetSlotIndex;
        const ghost = this.itemDragState.ghostEl;
        const srcSlotEl = this.itemDragState.sourceSlotEl;

        // Neu targetBoxId chua co, kiem tra truc tiep tai toa do pointerup
        if (e && (targetBoxId === null || targetBoxId === undefined)) {
            const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
            const boxEl = elementsUnder.find(el => el.classList && el.classList.contains('box') && !el.classList.contains('peek-box'));
            const slotEl = elementsUnder.find(el => el.classList && el.classList.contains('slot'));
            if (boxEl) {
                const hoverBoxId = boxEl.dataset.boxId;
                const targetBox = this.engine.getBox(hoverBoxId);
                const isSource = String(hoverBoxId) === String(srcBoxId);
                if (!isSource && targetBox && !targetBox.isWrapped && targetBox.canAccept() && this.engine.isAccessible(hoverBoxId)) {
                    targetBoxId = hoverBoxId;
                    if (slotEl && slotEl.closest('.box') === boxEl && slotEl.classList.contains('placeholder')) {
                        targetSlotIndex = Number(slotEl.dataset.slotIndex);
                    }
                }
            }
        }

        this.itemDragState.isDragging = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => document.body.classList.remove('is-item-dragging'));
        });

        // If targetBoxId is valid
        if (targetBoxId !== null && targetBoxId !== srcBoxId) {
            // Tutorial check
            if (this.tutorialManager && this.tutorialManager.active) {
                if (this.tutorialManager.isAllowedDrop && !this.tutorialManager.isAllowedDrop(srcBoxId, targetBoxId)) {
                    this.tutorialManager.onDisallowedTap(targetBoxId);
                    this._cancelItemDrag(ghost, srcSlotEl);
                    return;
                }
            }

            const targetBoxEl = document.querySelector(`.box[data-box-id="${targetBoxId}"]`);
            let targetSlotEl = null;
            if (targetBoxEl) {
                if (targetSlotIndex !== null) {
                    targetSlotEl = targetBoxEl.querySelector(`.slot[data-slot-index="${targetSlotIndex}"]`);
                }
                if (!targetSlotEl || !targetSlotEl.classList.contains('placeholder')) {
                    targetSlotEl = targetBoxEl.querySelector('.slot.placeholder');
                }
            }

            const sourceBoxBefore = this.engine.getBox(srcBoxId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            const success = this.engine.moveItem(srcBoxId, srcSlotIndex, targetBoxId, targetSlotIndex);
            if (success) {
                this.audio.swap();
                this._animating = true;
                if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');

                if (ghost && targetSlotEl) {
                    const targetRect = targetSlotEl.getBoundingClientRect();
                    ghost.style.transition = 'all 0.14s cubic-bezier(0.2, 0.9, 0.4, 1)';
                    ghost.style.left = `${targetRect.left + targetRect.width / 2}px`;
                    ghost.style.top = `${targetRect.top + targetRect.height / 2}px`;
                    ghost.style.transform = 'translate(-50%, -50%) scale(1)';
                }

                if (this.tutorialManager && this.tutorialManager.active) {
                    this.tutorialManager.onItemDropped(srcBoxId, targetBoxId);
                }

                setTimeout(() => {
                    if (ghost) ghost.style.display = 'none';
                    const targetBox = this.engine.getBox(targetBoxId);
                    this._finalizeMoveAfterDrag(srcBoxId, targetBoxId, willEmpty, targetBox);
                }, 140);
                return;
            }
        }

        // Invalid target -> cancel & snap back
        this._cancelItemDrag(ghost, srcSlotEl);
    }

    _cancelItemDrag(ghost, srcSlotEl) {
        this.audio.reject();
        if (navigator.vibrate) navigator.vibrate(18);

        if (ghost && srcSlotEl) {
            const rect = srcSlotEl.getBoundingClientRect();
            ghost.style.transition = 'all 0.18s cubic-bezier(0.25, 1, 0.5, 1)';
            ghost.style.left = `${rect.left + rect.width / 2}px`;
            ghost.style.top = `${rect.top + rect.height / 2}px`;
            ghost.style.transform = 'translate(-50%, -50%) scale(0.95)';
            ghost.style.opacity = '0.7';

            setTimeout(() => {
                ghost.style.display = 'none';
                ghost.style.transition = '';
                ghost.style.transform = '';
                ghost.style.opacity = '';
                if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');
                this.updateRender();
            }, 180);
        } else {
            if (ghost) ghost.style.display = 'none';
            if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');
            this.updateRender();
        }
    }

    _finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox) {
        const finishTransfer = () => {
            if (targetBox && targetBox.isWrapped) {
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
                
                setTimeout(() => {
                    const currentQueue = this.engine.getQueue();
                    const nextSlotIdx = currentQueue.length;
                    const domBoxCurrent = document.querySelector(`.box[data-box-id="${boxId}"]`);
                    const wrapColEl = domBoxCurrent ? domBoxCurrent.closest('.box-column') : null;
                    if (wrapColEl && wrapColEl.dataset.colIndex !== undefined) {
                        this._lastAffectedColIndex = Number(wrapColEl.dataset.colIndex);
                    }

                    this.queueRenderer.animateBoxToQueue(targetBox, nextSlotIdx, domBoxCurrent, () => {
                        targetBox.queueEnteredTime = performance.now();
                        this.engine.moveBoxToQueue(targetBox);
                        this._animating = false;
                        this.updateRender();
                    });
                }, 550);
            } else {
                this._animating = false;
                this.updateRender();
            }
        };

        if (willEmpty) {
            const srcDom = document.querySelector(`.box[data-box-id="${sourceId}"]`);
            if (srcDom) {
                const emptyColEl = srcDom.closest('.box-column');
                if (emptyColEl && emptyColEl.dataset.colIndex !== undefined) {
                    this._lastAffectedColIndex = Number(emptyColEl.dataset.colIndex);
                }
                this.vfx.praise(srcDom, 'DỌN GỌN! 🧹', 1);
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
    }
    
    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (!this.engine.startDragWrappedBox(boxId)) return;
        
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.pointerId !== undefined && e.target && e.target.setPointerCapture) {
                try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
            }
            this.dragState.pointerId = e.pointerId;
            this.dragState.pointerTarget = e.target;
        }

        this.dragState.isDragging = true;
        this.dragState.boxId = boxId;
        this.dragState.targetTrayId = null;
        
        // Add dragging class to original box
        const boxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
        if (boxEl) boxEl.classList.add('dragging');
        const colEl = boxEl ? boxEl.closest('.box-column') : null;
        this.dragState.colIndex = (colEl && colEl.dataset.colIndex !== undefined) ? Number(colEl.dataset.colIndex) : null;
        
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
        
        if (this.dragState.pointerId !== undefined && this.dragState.pointerTarget && this.dragState.pointerTarget.releasePointerCapture) {
            try { this.dragState.pointerTarget.releasePointerCapture(this.dragState.pointerId); } catch (_) {}
        }
        this.dragState.pointerId = null;
        this.dragState.pointerTarget = null;

        const boxId = this.dragState.boxId;
        const trayId = this.dragState.targetTrayId;
        const sourceColIndex = this.dragState.colIndex;
        
        this.dragState.isDragging = false;
        this.dragState.boxId = null;
        this.dragState.targetTrayId = null;
        this.dragState.colIndex = null;
        
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
                        if (sourceColIndex !== null) {
                            this._lastAffectedColIndex = sourceColIndex;
                        }
                        this.engine.dropOnTray(trayId);

                        const catConfig = getCategoryConfig(box.getCategory());
                        const color = catConfig ? catConfig.color : '#38bdf8';
                        this.audio.combo(1);
                        this.vfx.burst(trayEl, color, 14);
                        this.vfx.praise(trayEl, 'XUẤT XƯỞNG! 🚚', 1);
                    }, 300);
                    return;
                }
            } else {
                console.log("Invalid tray");
                this.audio.reject();
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
     * Kiem tra theo thoi gian thuc tren tung frame: khi Khay tren bang chuyen
     * di ngang qua dung vi tri slot cua Thung trong hang cho thi moi bat dau giao hang.
     */
    checkQueuePickup(now = performance.now()) {
        if (this.engine.gameState !== 'PLAYING') return;
        if (this._animating) return;

        const queue = this.engine.getQueue();
        if (queue.length === 0) return;

        const activeTrays = this.engine.conveyor.getAllActiveTrays();
        if (activeTrays.length === 0) return;

        for (let slotIdx = 0; slotIdx < queue.length; slotIdx++) {
            const box = queue[slotIdx];
            if (!box) continue;

            // Cho thung nam yen trong slot it nhat 250ms sau khi bay xuong hang cho
            if (box.queueEnteredTime && (now - box.queueEnteredTime < 250)) {
                continue;
            }

            // Tim khay phu hop dang hoat dong
            const matchingTray = activeTrays.find(t => t.canAccept(box));
            if (!matchingTray) continue;

            const trayObj = this.trayRenderer.trayElements.find(t => t.id === matchingTray.id);
            if (!trayObj || trayObj.isExiting || trayObj.isReceiving || trayObj.fadingOut) continue;

            const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);
            const trayEl = trayObj.el;
            if (!slotEl || !trayEl) continue;

            // Phase 1 §1.4: Tách giao hàng khỏi toạ độ hình học
            if (!this.trayRenderer.isInDeliveryZone(trayObj, slotEl, queue.length)) continue;

            this.triggerQueueDelivery(box, matchingTray, slotEl, trayEl);
            break; // Giao 1 thung moi lan
        }
    }

    triggerQueueDelivery(box, tray, slotEl, trayEl) {
        this._animating = true;

        const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
        if (trayObj) {
            trayObj.isReceiving = true;
        }

        slotEl.classList.add('dispatching');
        if (navigator.vibrate) navigator.vibrate(15);

        this.queueRenderer.animateBoxToTray(box, slotEl, trayEl, () => {
            slotEl.classList.remove('dispatching');
            this.engine.deliverQueueBox(box.id, tray.id);
            this._animating = false;

            const now = performance.now();
            if (this.lastDeliveryTime && (now - this.lastDeliveryTime < 3400)) {
                this.comboStreak++;
            } else {
                this.comboStreak = 1;
            }
            this.lastDeliveryTime = now;

            const catConfig = getCategoryConfig(box.getCategory());
            const color = catConfig ? catConfig.color : '#38bdf8';
            this.audio.combo(this.comboStreak);
            this.vfx.burst(trayEl, color, 14);
            const slogan = this.comboStreak >= 2 ? `COMBO X${this.comboStreak}! ⚡` : 'XUẤT XƯỞNG! 🚚';
            this.vfx.praise(trayEl, slogan, this.comboStreak);
            this.vfx.bump('queue-counter');

            this.updateRender();
        });
    }
}

// Bootstrap
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        window.gameUI = new UIManager();
    });
} else {
    window.gameUI = new UIManager();
}
