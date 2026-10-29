import { LevelLoader } from '../engine/LevelLoader.js';
import { GameRules, DIRECTIONS } from '../engine/GameRules.js';
import { IsometricRenderer } from '../renderer/IsometricRenderer.js';
import { InputHandler } from './InputHandler.js';
import { CommandHistory } from '../engine/CommandHistory.js';
import { AudioManager } from '../engine/AudioManager.js';
import { Tutorial } from './Tutorial.js';

class GameApp {
    constructor() {
        this.state = null;
        this.renderer = null;
        this.inputHandler = null;
        this.history = null;
        this.tutorial = null;
        this.audio = new AudioManager();

        // UI elements
        this.levelNameEl = document.getElementById('level-name');
        this.cloudLimitEl = document.getElementById('cloud-limit');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.levelMenu = document.getElementById('level-menu');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnViewBoard = document.getElementById('btn-view-board');
        this.btnBackToResults = document.getElementById('btn-back-to-results');
        this.btnMenuFromGameOver = document.getElementById('btn-menu-from-gameover');
        
        // Splash & Guide elements
        this.splashScreen = document.getElementById('splash-screen');
        this.splashLoadingBarContainer = document.getElementById('splash-loading-bar-container');
        this.splashLoadingBar = document.getElementById('splash-loading-bar');
        this.splashLoadingText = document.getElementById('splash-loading-text');
        this.splashActionButtons = document.getElementById('splash-action-buttons');
        this.btnSplashPlay = document.getElementById('btn-splash-play');
        this.btnSplashGuide = document.getElementById('btn-splash-guide');
        this.btnSplashLevels = document.getElementById('btn-splash-levels');
        
        this.guideModal = document.getElementById('guide-modal');
        this.btnCloseGuide = document.getElementById('btn-close-guide');
        this.btnCloseGuideX = document.getElementById('btn-close-guide-x');
        this.btnOpenGuide = document.getElementById('btn-open-guide');
        
        this.btnNextLevel.addEventListener('click', () => this.nextLevel());
        this.btnRetry.addEventListener('click', () => this.retryLevel());
        this.btnMenuFromGameOver.addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.openMenu();
        });
        this.btnViewBoard.addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.btnBackToResults.classList.remove('hidden');
        });
        this.btnBackToResults.addEventListener('click', () => {
            this.btnBackToResults.classList.add('hidden');
            this.gameOverScreen.classList.remove('hidden');
        });
        document.getElementById('btn-open-menu').addEventListener('click', () => this.openMenu());
        document.getElementById('btn-close-menu').addEventListener('click', () => this.closeMenu());
        
        if (this.btnOpenGuide) this.btnOpenGuide.addEventListener('click', () => this.openGuide());
        if (this.btnCloseGuide) this.btnCloseGuide.addEventListener('click', () => this.closeGuide());
        if (this.btnCloseGuideX) this.btnCloseGuideX.addEventListener('click', () => this.closeGuide());
        
        if (this.btnSplashPlay) {
            this.btnSplashPlay.addEventListener('click', () => {
                this.splashScreen.classList.add('hidden');
                if (this.tutorial) this.tutorial.start();
            });
        }
        if (this.btnSplashGuide) {
            this.btnSplashGuide.addEventListener('click', () => {
                this.openGuide();
            });
        }
        if (this.btnSplashLevels) {
            this.btnSplashLevels.addEventListener('click', () => {
                this.splashScreen.classList.add('hidden');
                if (this.tutorial) this.tutorial.start();
                this.openMenu();
            });
        }

        this.btnToggleView = document.getElementById('btn-toggle-view');
        if (this.btnToggleView) {
            this.btnToggleView.addEventListener('click', () => {
                const newMode = this.renderer.toggleViewMode();
                this.updateViewModeUI(newMode);
            });
        }

        // Virtual D-Pad buttons
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dirKey = e.currentTarget.dataset.dir;
                const dir = DIRECTIONS[dirKey];
                if (dir) this.handleMove(dir);
            });
        });

        document.querySelectorAll('.btn-level').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lvl = parseInt(e.target.dataset.level, 10);
                const padded = String(lvl).padStart(3, '0');
                this.loadLevel(`levels/level_${padded}.json`);
                this.closeMenu();
                if (this.splashScreen) this.splashScreen.classList.add('hidden');
            });
        });
        
        // Add Undo Button to HUD dynamically
        this.undoBtn = document.createElement('button');
        this.undoBtn.textContent = 'Undo (3)';
        this.undoBtn.style.margin = '0';
        this.undoBtn.style.padding = '6px 12px';
        this.undoBtn.style.fontSize = '14px';
        this.undoBtn.onclick = () => this.handleUndo();
        document.querySelector('#hud > div:nth-child(2)').appendChild(this.undoBtn);

        // Add Decor Toggle Button to HUD dynamically
        this.decorEnabled = this.loadDecorState();
        this.decorBtn = document.createElement('button');
        this.decorBtn.style.margin = '0';
        this.decorBtn.style.padding = '6px 12px';
        this.decorBtn.style.fontSize = '14px';
        this.decorBtn.title = 'Bật/tắt cây cối, mây trang trí (giúp máy yếu chạy mượt hơn)';
        this.updateDecorBtnUI();
        this.decorBtn.onclick = (e) => {
            this.decorEnabled = !this.decorEnabled;
            this.saveDecorState(this.decorEnabled);
            if (this.renderer && typeof this.renderer.setDecorEnabled === 'function') {
                this.renderer.setDecorEnabled(this.decorEnabled);
            }
            this.updateDecorBtnUI();
            if (e && e.currentTarget) e.currentTarget.blur();
        };
        document.querySelector('#hud > div:nth-child(2)').appendChild(this.decorBtn);

        this.currentLevelUrl = 'levels/level_001.json';
        this.init();
    }

    loadDecorState() {
        try {
            const saved = localStorage.getItem('wr_decor');
            if (saved === '0') return false;
            return true;
        } catch (err) {
            return true;
        }
    }

    saveDecorState(enabled) {
        try {
            localStorage.setItem('wr_decor', enabled ? '1' : '0');
        } catch (err) {
            // localStorage unavailable — ignore, state stays in memory
        }
    }

    updateDecorBtnUI() {
        if (!this.decorBtn) return;
        this.decorBtn.textContent = this.decorEnabled ? '🌳 Cảnh: Bật' : '🌳 Cảnh: Tắt';
    }

    openGuide() {
        if (this.guideModal) this.guideModal.classList.remove('hidden');
    }

    closeGuide() {
        if (this.guideModal) this.guideModal.classList.add('hidden');
    }

    updateViewModeUI(mode) {
        if (!this.btnToggleView) return;
        const upBtn = document.querySelector('.dpad-up');
        const leftBtn = document.querySelector('.dpad-left');
        const downBtn = document.querySelector('.dpad-down');
        const rightBtn = document.querySelector('.dpad-right');

        if (mode === 'topdown') {
            this.btnToggleView.textContent = '🔲 2D Top';
            this.btnToggleView.style.backgroundColor = '#10b981';
            if (upBtn) upBtn.textContent = '⬆';
            if (leftBtn) leftBtn.textContent = '⬅';
            if (downBtn) downBtn.textContent = '⬇';
            if (rightBtn) rightBtn.textContent = '➡';
        } else {
            this.btnToggleView.textContent = '📐 3D Iso';
            this.btnToggleView.style.backgroundColor = '#3b82f6';
            if (upBtn) upBtn.textContent = '↗';
            if (leftBtn) leftBtn.textContent = '↖';
            if (downBtn) downBtn.textContent = '↙';
            if (rightBtn) rightBtn.textContent = '↘';
        }
    }

    async init() {
        const canvas = document.getElementById('game-canvas');
        const container = document.getElementById('game-container');
        
        this.renderer = new IsometricRenderer(canvas, container);

        if (typeof this.renderer.setDecorEnabled === 'function') {
            this.renderer.setDecorEnabled(this.decorEnabled);
        }

        this.tutorial = new Tutorial(this);

        const hasRendererApi = (name) => this.renderer && typeof this.renderer[name] === 'function';

        this.inputHandler = new InputHandler(canvas, {
            onMove: (dir) => this.handleMove(dir),
            onPreview: (dirKey) => {
                if (!hasRendererApi('setPreview')) return;
                if (!dirKey || !this.state || this.state.phase !== 'moving') {
                    this.renderer.setPreview(null, null, false);
                    return;
                }
                const res = GameRules.applyMove(this.state, DIRECTIONS[dirKey]);
                this.renderer.setPreview(res ? res.newState : null, dirKey, !res);
            },
            getArrowAt: (clientX, clientY) => {
                if (!hasRendererApi('getEdgeArrowAt')) return null;
                return this.renderer.getEdgeArrowAt(clientX, clientY);
            },
            onHover: (dirKey) => {
                if (!hasRendererApi('setHoverArrow')) return;
                this.renderer.setHoverArrow(dirKey);
            }
        });
        
        // Run loading animation
        this.simulateLoading();

        await this.loadLevel(this.currentLevelUrl);
    }

    simulateLoading() {
        if (!this.splashLoadingBar) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 25) + 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.splashLoadingBar.style.width = '100%';
                this.splashLoadingText.textContent = 'Bếp đã sẵn sàng!';
                setTimeout(() => {
                    if (this.splashLoadingBarContainer) this.splashLoadingBarContainer.style.display = 'none';
                    if (this.splashLoadingText) this.splashLoadingText.style.display = 'none';
                    if (this.splashActionButtons) this.splashActionButtons.classList.remove('hidden');
                }, 300);
            } else {
                this.splashLoadingBar.style.width = `${progress}%`;
                if (progress > 50) this.splashLoadingText.textContent = 'Đang tải 20 công thức bàn cờ...';
            }
        }, 80);
    }

    async loadLevel(url) {
        this.currentLevelUrl = url;
        this.state = await LevelLoader.loadLevelJSON(url);
        this.history = new CommandHistory(3); // Allow 3 undos per level

        if (this.state) {
            this.gameOverScreen.classList.add('hidden');
            this.updateHUD();
            this.render();
            if (this.tutorial) {
                this.tutorial.stop();
                this.tutorial.start();
            }
        }
    }

    openMenu() {
        this.levelMenu.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    closeMenu() {
        this.levelMenu.classList.add('hidden');
    }

    nextLevel() {
        const currentMatch = this.currentLevelUrl.match(/level_(\d+)/);
        if (currentMatch) {
            let nextNum = parseInt(currentMatch[1], 10) + 1;
            if (nextNum <= 20) {
                const padded = String(nextNum).padStart(3, '0');
                this.loadLevel(`levels/level_${padded}.json`);
                return;
            }
        }
        this.gameOverTitle.textContent = 'You beat all 20 levels! 🎉';
    }

    retryLevel() {
        this.loadLevel(this.currentLevelUrl);
    }

    handleMove(direction) {
        if (this.tutorial && this.tutorial.isBlocking) return;
        if (this.renderer && typeof this.renderer.setPreview === 'function') {
            this.renderer.setPreview(null, null, false);
        }
        if (!this.state || this.state.phase !== 'moving') return;
        
        // Resume audio context on first interaction
        this.audio.init();

        const oldState = this.state.clone();
        const result = GameRules.applyMove(this.state, direction);
        
        if (result) {
            if (this.tutorial) this.tutorial.onMove();

            // Save history
            this.history.push({ stateBefore: oldState, direction });
            
            this.state = result.newState;
            
            // Process Audio and Feedback Events
            let didSplit = false;
            let didGrow = false;
            let newFloors = 0;
            let eventRest = null;
            
            for (const ev of result.events) {
                if (ev.type === 'SPLIT') {
                    didSplit = true;
                    eventRest = ev.child;
                }
                if (ev.type === 'GROW') {
                    didGrow = true;
                    newFloors = ev.newFloors;
                    eventRest = this.state.restaurants.find(r => r.id === ev.restaurantId);
                }
            }
            
            if (this.state.phase === 'win') {
                this.audio.playWin();
                this.spawnFloatingText("BẾP HOÀN THÀNH! 🎉", this.state.width/2 - 0.5, this.state.height/2 - 0.5, '#4ade80');
            } else if (didSplit) {
                this.audio.playSplit();
                if (eventRest) this.spawnFloatingText("TÁCH! ⚡", eventRest.x, eventRest.y, '#f43f5e');
            } else if (didGrow) {
                this.audio.playGrow(newFloors);
                if (eventRest) this.spawnFloatingText(`+1 TẦNG!`, eventRest.x, eventRest.y, '#facc15');
            } else {
                this.audio.playMove();
            }
            
            this.updateHUD();
            this.render();
            this.checkGameEnd();
        } else {
            console.log("Invalid move!");
            this.audio.playBump();
            // Simple visual bump effect on container
            const container = document.getElementById('game-container');
            if (container) {
                container.classList.add('bump-shake');
                setTimeout(() => container.classList.remove('bump-shake'), 200);
            }
        }
    }

    spawnFloatingText(text, gridX, gridY, color = '#fbbf24') {
        if (!this.renderer) return;
        const coords = this.renderer.getScreenCoords(gridX, gridY);
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        // Center text on the tile
        el.style.left = `${coords.x}px`;
        el.style.top = `${coords.y - 30}px`;
        el.style.color = color;
        el.style.transform = 'translateX(-50%)';
        
        container.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1000);
    }

    handleUndo() {
        if (this.history && this.history.canUndo()) {
            const prevState = this.history.undo();
            if (prevState) {
                this.state = prevState;
                this.gameOverScreen.classList.add('hidden'); // Hide if we undid from a lose state
                this.updateHUD();
                this.render();
            }
        }
    }

    checkGameEnd() {
        if (this.state.phase === 'win') {
            this.gameOverTitle.textContent = 'Level Complete!';
            this.gameOverTitle.style.color = '#ffd700';
            if (this.btnRetry) this.btnRetry.style.display = '';
            this.gameOverScreen.classList.remove('hidden');
        } else if (this.state.phase === 'lose') {
            this.gameOverTitle.textContent = 'Game Over';
            this.gameOverTitle.style.color = '#ff5555';
            if (this.btnRetry) this.btnRetry.style.display = 'none';
            this.gameOverScreen.classList.remove('hidden');
        }
    }

    updateHUD() {
        if (!this.state) return;
        this.levelNameEl.textContent = "Level " + parseInt(this.state.id || "1", 10);
        this.cloudLimitEl.textContent = this.state.cloudLimit;
        this.undoBtn.disabled = !this.history.canUndo();
        this.undoBtn.textContent = `Undo (${this.history.undosLeft})`;
    }

    render() {
        if (this.state && this.renderer) {
            this.renderer.render(this.state);
        }
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => new GameApp());
} else {
    new GameApp();
}
