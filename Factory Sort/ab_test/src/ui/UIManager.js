import { GameEngine } from '../core/GameEngine.js';
import { LevelGenerator } from '../generator/LevelGenerator.js';
import { BLOCKER_SCENARIOS, createBlockerLevel } from '../generator/BlockerLevels.js';
import { COMBO_SCENARIOS, createMechanicComboLevel } from '../generator/MechanicComboLevels.js';
import { configForLevelNumber } from '../generator/SolvableLevelGenerator.js';
import { BoxRenderer } from './BoxRenderer.js';
import { TrayRenderer } from './TrayRenderer.js';
import { ConveyorRenderer } from './ConveyorRenderer.js';
import { QueueRenderer } from './QueueRenderer.js';
import { TutorialManager } from './TutorialManager.js';
import { AudioManager } from './AudioManager.js';
import { VFXManager } from './VFXManager.js';
import { getCategoryConfig, getItemEmoji } from '../data/ItemCatalog.js';
import { applyItemArt } from './ItemArt.js';
import { getTheme, setTheme, getThemedItemLabel } from './ThemeManager.js';

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
        this.trayRenderer.onTick = (now) => {
            this.updateConveyorSpeed();
            this.updateLevelClock(now);
            this.checkQueuePickup(now);
        };
        this.conveyorRenderer = new ConveyorRenderer('conveyor-belt');
        this.queueRenderer = new QueueRenderer();
        const blockerView = id => typeof this.engine.getBlockerView === 'function'
            ? this.engine.getBlockerView(id)
            : null;
        this.boxRenderer.blockerView = blockerView;
        this.queueRenderer.blockerView = blockerView;
        this.tutorialManager = new TutorialManager(this, this.engine);
        this.activeBlockerScenario = null;
        this._blockerDrainQueued = false;
        
        this.removeTrayMode = false;
        // DOM Elements
        this.levelDisplay = document.getElementById('level-display');
        this.btnHeaderLevel = document.getElementById('btn-header-level');
        this.btnNewGame = document.getElementById('btn-new-game');
        this.btnSelectLevel = document.getElementById('btn-select-level');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnSound = document.getElementById('btn-sound');
        this.soundIconOn = document.getElementById('sound-icon-on');
        this.soundIconOff = document.getElementById('sound-icon-off');
        this.btnWinReplay = document.getElementById('btn-win-replay');
        this.btnLoseLevels = document.getElementById('btn-lose-levels');
        this.blockerScenarioSelect = document.getElementById('blocker-scenario');
        this.btnBlockerCampaign = document.getElementById('blocker-campaign');
        this.btnMechanicLab = document.getElementById('btn-mechanic-lab');
        this.btnHelpMechanicLab = document.getElementById('btn-help-mechanic-lab');
        this.overlayMechanicLab = document.getElementById('overlay-mechanic-lab');
        this.btnCloseMechanicLab = document.getElementById('btn-close-mechanic-lab');
        this.mechanicSingleGrid = document.getElementById('mechanic-single-grid');
        this.mechanicComboGrid = document.getElementById('mechanic-combo-grid');
        this._mechanicLabReturnFocus = null;
        this._mechanicLabPausedGameState = null;
        this._closeMechanicLab = null;
        
        this.overlayWin = document.getElementById('overlay-win');
        this.overlayLose = document.getElementById('overlay-lose');
        this.loseReason = document.getElementById('lose-reason');
        this.timerDisplay = document.getElementById('timer-display');
        this.timerPill = document.getElementById('stat-timer');
        this.tierDisplay = document.getElementById('tier-display');
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
            startY: 0,
            didMove: false,
            initialBlockerMask: false,
            blockerMaskToken: null,
            blockerHidden: false
        };
        this._resetAnimationState();
        this.GHOST_LIFT = 28;
        this._renderQueued = false;
        this._boLuotFlip = false;
        this._lastAffectedColIndex = null;
        
        this.populateBlockerScenarios();
        this.populateMechanicLab();
        // Extend the existing modal booster guard without changing the live level.
        const boostersBlockedWithoutLab = this.boostersBlocked.bind(this);
        this.boostersBlocked = () => {
            const labOpen = this.overlayMechanicLab &&
                !this.overlayMechanicLab.classList.contains('hidden');
            return !!labOpen || boostersBlockedWithoutLab();
        };
        this.bindEvents();
        this._bindThemeControls();
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

    _bindThemeControls() {
        this._themeButtons = Array.from(document.querySelectorAll('[data-theme-select]'));
        this._themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.themeSelect;
                if (id) setTheme(id);
            });
        });
        document.addEventListener('themechange', () => this._syncThemeControls());
        this._syncThemeControls();
    }

    _syncThemeControls() {
        if (!this._themeButtons) return;
        const theme = getTheme();
        this._themeButtons.forEach(button => {
            const selected = button.dataset.themeSelect === theme;
            button.setAttribute('aria-pressed', String(selected));
            button.classList.toggle('active', selected);
        });
        document.querySelectorAll('.tray.removable-tray[data-tray-id]').forEach(element => {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => String(t.id) === element.dataset.trayId);
            if (!tray) return;
            element.setAttribute('aria-label', `Xóa khay ${getThemedItemLabel(tray.targetItemId)} và 3 vật tương ứng`);
        });
    }

    bindEvents() {
        document.querySelectorAll('[data-booster]').forEach(button => {
            button.addEventListener('click', () => this.useBooster(button.dataset.booster));
        });
        const selectRemoval = event => {
            if (!this.removeTrayMode) return;
            const element = event.target.closest('.tray[data-tray-id]');
            if (!element || (event.type === 'keydown' && !['Enter', ' '].includes(event.key))) return;
            event.preventDefault();
            this.updateLevelClock();
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => String(t.id) === element.dataset.trayId);
            if (!tray || tray.isFull() || this.boostersBlocked()) return;
            const rect = element.getBoundingClientRect?.();
            const removed = this.engine.removeTray(tray.id);
            if (removed) {
                this.removeTrayMode = false;
                this._fx('booster', 'remove', rect);
                if (this.audio?.ting) this.audio.ting(); else this.audio.tap();
            } else {
                this._fx('toast', this.engine.lastBoosterError || 'Chưa thể xóa an toàn khay này. Hãy thử khay khác.');
            }
            this.setBoosterStatus(removed ? 'Đã xóa khay và đúng 3 vật tương ứng.' : (this.engine.lastBoosterError || 'Chưa thể xóa an toàn khay này. Hãy thử khay khác.'));
            this.updateRender();
            this.renderBoosters();
        };
        document.getElementById('trays-container')?.addEventListener('click', selectRemoval);
        document.getElementById('trays-container')?.addEventListener('keydown', selectRemoval);
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && this.removeTrayMode) {
                this.removeTrayMode = false;
                this.setBoosterStatus('Đã hủy chọn khay.');
                this.renderBoosters();
            }
        });
        document.addEventListener('visibilitychange', () => {
            this._clockLastTime = performance.now();
            this._clockWasPaused = true;
            this.renderTimer();
        });
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
            // A blocker scenario never advances the campaign. Its Next action simply
            // returns to the campaign level from which the scenario was opened.
            if (!this.activeBlockerScenario) this.currentLevel++;
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

        if (this.blockerScenarioSelect) {
            this.blockerScenarioSelect.addEventListener('change', () => {
                const id = this.blockerScenarioSelect.value;
                if (!id) return;
                this.audio.tap();
                this.activeBlockerScenario = id;
                document.getElementById('overlay-help')?.classList.add('hidden');
                this.startNewLevel(true);
            });
        }

        if (this.btnBlockerCampaign) {
            this.btnBlockerCampaign.addEventListener('click', () => {
                this.audio.tap();
                document.getElementById('overlay-help')?.classList.add('hidden');
                this.startNewLevel();
            });
        }

        const closeMechanicLab = (opts = {}) => {
            if (!this.overlayMechanicLab) return;
            this.overlayMechanicLab.classList.add('hidden');
            this.overlayMechanicLab.setAttribute('aria-hidden', 'true');
            this._mechanicLabOpen = false;
            this._mechanicLabPausedGameState = null;
            if (this._mechanicLabReturnHelpOpen) {
                this._mechanicLabReturnHelpOpen = false;
                document.getElementById('overlay-help')?.classList.remove('hidden');
            }
            if (!opts.forNewLevel) {
                // Lab only blocked new dispatch work. engine.gameState is never mutated,
                // so PLAYING/WON/LOST and in-flight callbacks stay intact.
                this._drainQueueFlights();
                this.updateRender();
            }
            const returnFocus = this._mechanicLabReturnFocus;
            this._mechanicLabReturnFocus = null;
            if (returnFocus?.isConnected && typeof returnFocus.focus === 'function') {
                returnFocus.focus({ preventScroll: true });
            }
        };
        this._closeMechanicLab = closeMechanicLab;
        const openMechanicLab = () => {
            if (!this.overlayMechanicLab) return;
            if (this._isMechanicLabOpen()) return;
            // Never interrupt an in-progress pointer drag or mutate its transaction.
            if (this.dragState?.isDragging || this.itemDragState?.isDragging) return;
            this.audio.tap();
            this._mechanicLabReturnFocus = document.activeElement;
            this._mechanicLabOpen = true;
            const helpOverlay = document.getElementById('overlay-help');
            this._mechanicLabReturnHelpOpen = !!(helpOverlay &&
                !helpOverlay.classList.contains('hidden'));
            helpOverlay?.classList.add('hidden');
            this._syncMechanicLabSelection();
            this.overlayMechanicLab.classList.remove('hidden');
            this.overlayMechanicLab.setAttribute('aria-hidden', 'false');
            this.btnCloseMechanicLab?.focus({ preventScroll: true });
        };
        this.btnMechanicLab?.addEventListener('click', openMechanicLab);
        this.btnHelpMechanicLab?.addEventListener('click', openMechanicLab);
        this.btnCloseMechanicLab?.addEventListener('click', () => {
            this.audio.tap();
            closeMechanicLab();
        });
        this.overlayMechanicLab?.addEventListener('click', event => {
            if (event.target === this.overlayMechanicLab) closeMechanicLab();
        });
        document.addEventListener('keydown', event => {
            if (!this.overlayMechanicLab ||
                this.overlayMechanicLab.classList.contains('hidden')) return;
            if (event.key === 'Tab') {
                this._trapMechanicLabTab(event);
                return;
            }
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            closeMechanicLab();
        });

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
    
    _isMechanicLabOpen() {
        return !!this._mechanicLabOpen && !!this.overlayMechanicLab &&
            !this.overlayMechanicLab.classList.contains('hidden');
    }

    _trapMechanicLabTab(event) {
        if (event.key !== 'Tab' || !this._isMechanicLabOpen()) return;
        const dialog = this.overlayMechanicLab.querySelector('[role="dialog"], .mechanic-lab-dialog, .modal-dialog') ||
            this.overlayMechanicLab;
        const focusables = Array.from(dialog.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => el.offsetParent !== null || el === document.activeElement);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!dialog.contains(active)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus({ preventScroll: true });
            return;
        }
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
        }
    }

    _concealedUrgencyBadge(coreBadges, view) {
        const candidates = [];
        if (view && typeof view.urgentBadge === 'string') candidates.push(view.urgentBadge);
        if (view && typeof view.urgency === 'string') candidates.push(view.urgency);
        if (Array.isArray(coreBadges)) {
            coreBadges.forEach(text => {
                if (typeof text === 'string') candidates.push(text);
            });
        }
        const allowed = [
            /^khẩn ẩn \d+s$/i,
            /^⏱️?\s*gấp:\s*vào hàng chờ trong\s*\d+s$/i
        ];
        for (const candidate of candidates) {
            const text = String(candidate).trim();
            if (!text) continue;
            if (allowed.some(pattern => pattern.test(text))) return text;
        }
        return '';
    }

    _mechanicComboEntries() {
        if (Array.isArray(COMBO_SCENARIOS)) {
            return COMBO_SCENARIOS.map(scenario => typeof scenario === 'string'
                ? { id: scenario, label: scenario }
                : scenario).filter(scenario => scenario && typeof scenario.id === 'string');
        }
        return Object.entries(COMBO_SCENARIOS || {}).map(([id, scenario]) => {
            if (typeof scenario === 'string') return { id, label: scenario };
            return { id, ...(scenario || {}) };
        }).filter(scenario => typeof scenario.id === 'string');
    }

    _mechanicScenarioLabel(id) {
        const combo = this._mechanicComboEntries().find(scenario => scenario.id === id);
        return combo?.label || this._blockerScenarioLabel(id);
    }

    _createMechanicScenarioCard(entry, kind) {
        const id = String(entry.id);
        const labelText = String(entry.hudLabel || entry.label || entry.name || entry.title || id);
        const tierText = String(entry.tier || (kind === 'combo' ? 'TỔ HỢP' : 'CƠ CHẾ'));
        const neutralizeDescription = (text) => {
            const replaceTerm = (value, pattern, target) => value.replace(pattern, (match, prefix, term) => {
                const first = term.charAt(0);
                const capitalized = first === first.toUpperCase() && first !== first.toLowerCase();
                const replacement = capitalized ? target.charAt(0).toUpperCase() + target.slice(1) : target;
                return `${prefix}${replacement}`;
            });
            let result = String(text);
            result = replaceTerm(result, /(^|[^\p{L}\p{N}])(gấu)(?=$|[^\p{L}\p{N}])/giu, 'loại A');
            result = replaceTerm(result, /(^|[^\p{L}\p{N}])(vịt)(?=$|[^\p{L}\p{N}])/giu, 'loại B');
            return result;
        };
        const descriptionText = neutralizeDescription(entry.description ||
            'Màn luyện tập riêng, không thay đổi tiến trình chiến dịch.');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mechanic-scenario-card';
        button.dataset.scenarioId = id;
        button.dataset.scenarioKind = kind;
        button.setAttribute('aria-pressed', String(this.activeBlockerScenario === id));
        button.setAttribute('aria-label', `${labelText}. ${tierText}. ${descriptionText}`);
        button.title = descriptionText;

        const label = document.createElement('span');
        label.className = 'mechanic-scenario-label';
        label.textContent = labelText;
        const tier = document.createElement('span');
        tier.className = 'mechanic-scenario-tier';
        tier.textContent = tierText;
        const description = document.createElement('span');
        description.className = 'mechanic-scenario-description';
        description.textContent = descriptionText;
        button.append(label, tier, description);

        button.addEventListener('click', () => {
            this.audio.tap();
            this.activeBlockerScenario = id;
            this._syncMechanicLabSelection();
            this._closeMechanicLab?.({ forNewLevel: true });
            document.getElementById('overlay-help')?.classList.add('hidden');
            this.startNewLevel(true);
        });
        return button;
    }

    populateMechanicLab() {
        if (!this.mechanicSingleGrid || !this.mechanicComboGrid) return;
        this.mechanicSingleGrid.textContent = '';
        this.mechanicComboGrid.textContent = '';
        this._blockerScenarioEntries().forEach(entry => {
            if (!entry?.id) return;
            this.mechanicSingleGrid.appendChild(this._createMechanicScenarioCard(entry, 'single'));
        });
        this._mechanicComboEntries().forEach(entry => {
            this.mechanicComboGrid.appendChild(this._createMechanicScenarioCard(entry, 'combo'));
        });
        this._syncMechanicLabSelection();
    }

    _syncMechanicLabSelection() {
        if (!this.overlayMechanicLab) return;
        this.overlayMechanicLab.querySelectorAll('.mechanic-scenario-card').forEach(button => {
            const selected = button.dataset.scenarioId === this.activeBlockerScenario;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    _blockerScenarioEntries() {
        if (Array.isArray(BLOCKER_SCENARIOS)) {
            return BLOCKER_SCENARIOS.map(scenario => typeof scenario === 'string'
                ? { id: scenario, name: scenario }
                : scenario);
        }
        if (BLOCKER_SCENARIOS && typeof BLOCKER_SCENARIOS === 'object') {
            return Object.entries(BLOCKER_SCENARIOS).map(([id, scenario]) => {
                if (typeof scenario === 'string') return { id, name: scenario };
                return { ...(scenario || {}), id: scenario?.id || id };
            });
        }
        return [];
    }

    _blockerScenario(id) {
        return this._blockerScenarioEntries().find(scenario => String(scenario?.id) === String(id)) || null;
    }

    _blockerScenarioLabel(id) {
        const scenario = this._blockerScenario(id);
        return String(scenario?.hudLabel || scenario?.label || scenario?.name || scenario?.title || scenario?.id || id);
    }

    populateBlockerScenarios() {
        const select = this.blockerScenarioSelect;
        if (!select) return;
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Chọn kịch bản cơ chế —';
        select.appendChild(placeholder);
        for (const scenario of this._blockerScenarioEntries()) {
            if (!scenario || scenario.id === undefined || scenario.id === null) continue;
            const option = document.createElement('option');
            option.value = String(scenario.id);
            option.textContent = String(scenario.label || scenario.name || scenario.title || scenario.id);
            select.appendChild(option);
        }
        select.value = this.activeBlockerScenario || '';
    }

    clearBlockerScenario() {
        this.activeBlockerScenario = null;
        if (this.blockerScenarioSelect) this.blockerScenarioSelect.value = '';
    }

    _getBlockerView(id) {
        return typeof this.engine.getBlockerView === 'function'
            ? (this.engine.getBlockerView(id) || null)
            : null;
    }

    _canMoveBlockerItem(id, slotIndex) {
        return typeof this.engine.canMoveBlockerItem !== 'function' ||
            this.engine.canMoveBlockerItem(id, slotIndex) !== false;
    }

    _canQueueBlockerBox(id) {
        return typeof this.engine.canQueueBlockerBox !== 'function' ||
            this.engine.canQueueBlockerBox(id) !== false;
    }

    _canDispatchBlockerBox(id) {
        return typeof this.engine.canDispatchBlockerBox !== 'function' ||
            this.engine.canDispatchBlockerBox(id) !== false;
    }

    _refuseBlocker(anchor, fallback) {
        const message = this.engine.lastBlockerError || fallback;
        this.audio?.reject?.();
        if (anchor) this._fx('invalid', anchor, message);
        this._fx('toast', message);
        if (navigator.vibrate) navigator.vibrate(18);
        return false;
    }

    _blockerSlotMask(view, slotIndex) {
        const empty = { hidden: false, token: null };
        const slots = view?.hiddenSlots;
        if (!slots) return empty;
        const index = Number(slotIndex);
        const masked = raw => {
            if (raw === undefined || raw === null || raw === false) return empty;
            if (typeof raw === 'object') {
                if (raw.hidden === false || raw.masked === false || raw.concealed === false) return empty;
                return { hidden: true, token: raw.token ?? raw.maskToken ?? raw.key ?? raw };
            }
            return { hidden: true, token: raw === true ? index : raw };
        };

        if (slots instanceof Set) {
            if (slots.has(index)) return masked(index);
            if (slots.has(String(index))) return masked(String(index));
            return empty;
        }
        if (slots instanceof Map) {
            if (slots.has(index)) return masked(slots.get(index));
            if (slots.has(String(index))) return masked(slots.get(String(index)));
            return empty;
        }
        if (Array.isArray(slots)) {
            const indexedEntry = slots.find(entry => entry && typeof entry === 'object' &&
                Number(entry.slotIndex ?? entry.slot ?? entry.index) === index);
            if (indexedEntry) return masked(indexedEntry);

            const numericIndexList = slots.every(value =>
                (typeof value === 'number' && Number.isInteger(value)) ||
                (typeof value === 'string' && /^\d+$/.test(value)));
            if (numericIndexList) {
                if (slots.includes(index)) return masked(index);
                if (slots.includes(String(index))) return masked(String(index));
                return empty;
            }

            const direct = slots[slotIndex];
            if (direct !== undefined) return masked(direct);
            if (slots.includes(index)) return masked(index);
            if (slots.includes(String(index))) return masked(String(index));
            return empty;
        }
        if (typeof slots === 'object') {
            if (Object.prototype.hasOwnProperty.call(slots, slotIndex)) return masked(slots[slotIndex]);
            if (Object.prototype.hasOwnProperty.call(slots, index)) return masked(slots[index]);
        }
        return empty;
    }

    _refreshItemDragGhost() {
        const state = this.itemDragState;
        if (!state?.isDragging || !state.ghostEl) return;
        const mask = this._blockerSlotMask(
            this._getBlockerView(state.sourceBoxId),
            state.sourceSlotIndex
        );
        state.blockerMaskToken = mask.token;
        // Once concealed at pickup, never expose the real artwork during that drag.
        // A slot can also become masked while it is being dragged.
        state.blockerHidden = !!state.initialBlockerMask || mask.hidden;
        applyItemArt(state.ghostEl, state.blockerHidden ? null : state.itemId);
        state.ghostEl.textContent = state.blockerHidden ? '?' : getItemEmoji(state.itemId);
        state.ghostEl.setAttribute('aria-label', state.blockerHidden ? '?' : getThemedItemLabel(state.itemId));
    }

    _cleanupPendingQueueBox(box) {
        if (!box) return;
        this._busyBoxes.delete(String(box.id));
        const element = document.querySelector(`.box[data-box-id="${box.id}"]`);
        if (element) element.style.visibility = '';
    }

    updateConveyorSpeed() {
        const boardEmpty = !this.engine.boxes.some(box => !box.isEmpty());
        this.trayRenderer.speedMultiplier = this.engine.gameState === 'PLAYING' && boardEmpty ? 1.5 : 1;
    }

    isClockPaused() {
        return document.hidden || ['overlay-loading', 'overlay-help', 'overlay-level-select', 'overlay-mechanic-lab']
            .some(id => {
                const el = document.getElementById(id);
                return el && !el.classList.contains('hidden');
            });
    }

    updateLevelClock(now = performance.now()) {
        const paused = this.isClockPaused();
        if (!paused && !this._clockWasPaused && this._clockObservedStarted &&
            Number.isFinite(this._clockLastTime)) {
            this.engine.advanceClock(Math.max(0, now - this._clockLastTime) / 1000);
        }
        this._clockLastTime = now;
        this._clockWasPaused = paused;
        this._clockObservedStarted = this.engine.clockStarted;
        this.renderTimer();
        this.renderBoosters();
    }

    renderTimer() {
        if (!this.timerDisplay || !this.timerPill) return;
        const remaining = this.engine.timeRemainingSeconds;
        const timed = Number.isFinite(remaining);
        const secs = Math.max(0, Math.ceil(timed ? remaining : 0));
        this.timerDisplay.textContent = timed
            ? `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`
            : '∞';
        this.timerPill.classList.toggle('timer-frozen', this.engine.freezeRemainingSeconds > 0);
        this.timerPill.classList.toggle('timer-low', timed && remaining <= this.engine.timeLimitSeconds * 0.2);
        this.timerPill.classList.toggle('timer-critical', timed && remaining <= 10);
        const status = this.engine.gameState === 'WON' ? 'Hoàn thành'
            : this.engine.gameState === 'LOST' ? 'Đã kết thúc'
            : !this.engine.clockStarted ? 'Nhặt vật đầu tiên để bắt đầu'
            : this.isClockPaused() ? 'Tạm dừng'
            : !this.engine.hasPlayerWorkRemaining() ? 'Đang giao hàng — thời gian tạm dừng'
            : this.engine.freezeRemainingSeconds > 0 ? `Đóng băng ${Math.ceil(this.engine.freezeRemainingSeconds)}s`
            : 'Thời gian còn lại';
        const label = timed ? `${status}: ${this.timerDisplay.textContent}` : `${status} — không giới hạn thời gian`;
        this.timerPill.title = label;
        this.timerPill.setAttribute('aria-label', label);
    }

    setBoosterStatus(message) {
        const status = document.getElementById('booster-status');
        if (status) status.textContent = message;
    }

    boostersBlocked() {
        return this.engine.gameState !== 'PLAYING' || this.isClockPaused() || this.tutorialManager?.active ||
            this.itemDragState?.isDragging || this.dragState?.isDragging || this.engine.draggedBoxId !== null ||
            this._busyBoxes?.size > 0 || this._pendingQueueBoxes?.length > 0 ||
            this._queueFlightActive || this._deliveryAnimating || this.engine.hasPendingTrayExits();
    }

    useBooster(kind) {
        if (kind === 'remove' && this.removeTrayMode) {
            this.removeTrayMode = false;
            this.setBoosterStatus('Đã hủy chọn khay.');
            this.renderBoosters();
            return;
        }
        this.updateLevelClock();
        if (this.boostersBlocked()) return;
        this.engine.deselectSource();
        if (kind === 'remove') {
            this.removeTrayMode = true;
            this.setBoosterStatus('Chọn một khay trống trên băng chuyền. Bấm lại hoặc Esc để hủy.');
        } else {
            this.removeTrayMode = false;
            const methods = { freeze: 'freezeTime', shuffle: 'shuffleItems', extra: 'addExtraTray' };
            const success = this.engine[methods[kind]]?.();
            const messages = { freeze: 'Dừng đồng hồ 30 giây; băng chuyền vẫn chạy.',
                shuffle: 'Đã xáo vật trong các thùng đang hiện.', extra: 'Thêm 1 ô hàng chờ đến hết màn.' };
            this.setBoosterStatus(success ? messages[kind] : (this.engine.lastBoosterError || 'Chưa thể dùng booster an toàn ở trạng thái này.'));
            if (success) {
                const anchor = kind === 'freeze' ? document.querySelector?.('.timer-pill') : document.querySelector?.(`[data-booster="${kind}"]`);
                this._fx('booster', kind, anchor);
                if (this.audio?.ting) this.audio.ting(); else this.audio.tap();
            } else {
                this._fx('toast', this.engine.lastBoosterError || 'Chưa thể dùng booster an toàn ở trạng thái này.');
            }
        }
        this.updateRender();
        this.renderTimer();
        this.renderBoosters();
    }

    renderBoosters() {
        if (!document.querySelectorAll) return;
        const blocked = this.boostersBlocked();
        if (blocked && this.removeTrayMode) {
            this.removeTrayMode = false;
            this.setBoosterStatus('Đã hủy chọn khay.');
        }
        const frozen = this.engine.freezeRemainingSeconds > 0;
        document.querySelectorAll('[data-booster]').forEach(button => {
            const kind = button.dataset.booster;
            button.disabled = blocked || (kind === 'freeze' && (frozen || !Number.isFinite(this.engine.timeRemainingSeconds))) ||
                (kind === 'extra' && this.engine.extraTrayUsed) ||
                (kind === 'remove' && !this.engine.conveyor.getAllActiveTrays().some(t => !t.isFull()));
            button.classList.toggle('active', kind === 'remove' && this.removeTrayMode);
            if (kind === 'remove') button.setAttribute('aria-pressed', String(this.removeTrayMode));
            const detail = button.querySelector('.booster-detail');
            if (detail && kind === 'freeze') detail.textContent = frozen ? `${Math.ceil(this.engine.freezeRemainingSeconds)}s` : '30 giây';
            if (detail && kind === 'extra') detail.textContent = this.engine.extraTrayUsed ? 'Đã thêm' : '+1 ô chờ';
        });
        document.getElementById('trays-container')?.classList.toggle('remove-tray-mode', this.removeTrayMode);
        document.querySelectorAll('.tray[data-tray-id]').forEach(element => {
            const tray = this.engine.conveyor.getAllActiveTrays().find(t => String(t.id) === element.dataset.trayId);
            const selectable = this.removeTrayMode && tray && !tray.isFull();
            element.classList.toggle('removable-tray', !!selectable);
            if (selectable) {
                element.setAttribute('role', 'button');
                element.setAttribute('tabindex', '0');
                element.setAttribute('aria-label', `Xóa khay ${getThemedItemLabel(tray.targetItemId)} và 3 vật tương ứng`);
            } else {
                element.removeAttribute('role');
                element.removeAttribute('tabindex');
                element.removeAttribute('aria-label');
            }
        });
    }

    showWinCelebration() {
        const elapsedSec = Math.max(0, Math.floor(this.engine.elapsedPlaySeconds || 0));
        const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
        const secs = (elapsedSec % 60).toString().padStart(2, '0');

        if (this.winStatMoves) this.winStatMoves.textContent = this.engine.moveCount;
        if (this.winStatTime) this.winStatTime.textContent = `${mins}:${secs}`;
        if (this.winStatEff) this.winStatEff.textContent = '100%';

        // Tính sao dựa trên độ tối ưu nước đi (1, 2, hoặc 3 sao)
        const cfg = this.activeBlockerScenario ? {} : configForLevelNumber(this.currentLevel);
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
                this.tutorialManager.skipTutorial();
                this.showWinCelebration();
            } else if (state === 'LOST') {
                this.tutorialManager.skipTutorial();
                this.audio.lose();
                this._fx('lose');
                this._fx('toast', this.engine.loseReason);
                if (this.loseReason) {
                    this.loseReason.textContent = this.engine.loseReason || 'Không còn nước đi hợp lệ. Hãy thử lại màn này.';
                }
                const timeout = this.engine.loseReason?.startsWith('Hết thời gian');
                const title = document.getElementById('lose-title');
                const banner = document.getElementById('lose-banner');
                if (title) title.textContent = timeout ? 'HẾT THỜI GIAN!' : 'HẾT CHỖ ĐIỀU PHỐI!';
                if (banner) banner.textContent = timeout ? '⏱ CA LÀM ĐÃ KẾT THÚC ⏱' : '⚠️ DÂY CHUYỀN QUÁ TẢI ⚠️';
                this.overlayLose.classList.remove('hidden');
            } else {
                this.overlayWin.classList.add('hidden');
                this.overlayLose.classList.add('hidden');
            }
            this.renderTimer();
        };
        
        this.engine.onQueueUpdated = (queue) => {
            this.queueRenderer.render(queue, this.engine.maxQueueSize);
            this._fx('bump', 'queue-counter');
            // F3 presentation-only: warn once when queue pressure escalates a level.
            const max = this.engine.maxQueueSize || 0;
            const count = queue ? queue.length : 0;
            const level = count >= max ? 2 : count >= max - 1 ? 1 : 0;
            if (level > (this._queueWarningLevel || 0) && level > 0) {
                this._fx('warning', document.getElementById('queue-area') || document.getElementById('queue-counter'));
                this.audio?.warn?.();
            }
            this._queueWarningLevel = level;
        };
        
        this.engine.onBoxUpdated = (box, isRemoved = false) => {
            this.updateRender();
        };

        const scheduleBlockerRefresh = () => {
            this.updateRender();
            if (this._blockerDrainQueued) return;
            this._blockerDrainQueued = true;
            const epoch = this._animationEpoch;
            const drain = () => {
                this._blockerDrainQueued = false;
                if (epoch !== this._animationEpoch || this.engine.gameState !== 'PLAYING') return;
                this._drainQueueFlights();
            };
            // Never mutate queue state synchronously from inside the core callback.
            if (typeof queueMicrotask === 'function') queueMicrotask(drain);
            else Promise.resolve().then(drain);
        };
        this.engine.onBlockerUpdated = scheduleBlockerRefresh;
        this.engine.onComboUpdated = scheduleBlockerRefresh;
        
        this.engine.onTrayDelivered = (trayId, box) => {
            const epoch = this._animationEpoch;
            if (this.tutorialManager) this.tutorialManager.onTrayDelivered(trayId, box);
            this.trayRenderer.animateTrayExit(trayId, () => {
                if (epoch !== this._animationEpoch) return;
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
            // F3 presentation-only: never leave the logo span empty/emoji-less.
            const logoIcon = el.querySelector('.box-logo span');
            if (logoIcon && itemType) applyItemArt(logoIcon, itemType);
            // Defer pack presentation until the box actually flies into the queue.
            this._pendingPackFeedback.add(String(box.id));
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
        if (!isRetry) this.clearBlockerScenario();
        const scenarioId = this.activeBlockerScenario;
        const isComboScenario = !!scenarioId && this._mechanicComboEntries()
            .some(scenario => scenario.id === scenarioId);
        const scenarioLabel = scenarioId ? this._mechanicScenarioLabel(scenarioId) : '';
        this._resetAnimationState();
        // Freeze the previous level before yielding to paint the loading overlay.
        // Its conveyor ticks must not create deliveries using the new epoch.
        this.engine.setGameState('IDLE');
        this._clockLastTime = null;
        this._clockWasPaused = true;
        this._clockObservedStarted = false;
        const levelEpoch = this._animationEpoch;
        this.overlayWin.classList.add('hidden');
        this.overlayLose.classList.add('hidden');
        this.overlayLoading.classList.remove('hidden');
        
        this.levelStartTime = performance.now();
        this.comboStreak = 0;
        this.lastDeliveryTime = 0;
        
        // Yield to browser to show loading
        await new Promise(r => setTimeout(r, 50));
        
        if (levelEpoch !== this._animationEpoch) return;
        // Duong cong do kho nam TRON VEN trong configForLevelNumber() cua bo sinh man.
        const levelData = scenarioId
            ? (isComboScenario
                ? createMechanicComboLevel(scenarioId)
                : createBlockerLevel(scenarioId))
            : LevelGenerator.generateLevel({ levelNumber: this.currentLevel });
        
        this.queueRenderer.render([]);
        this.trayRenderer.reset();
        this.engine.startLevel(levelData);
        this._clockLastTime = performance.now();
        const tier = scenarioId ? 'blocker' : (levelData.config?.tier || configForLevelNumber(this.currentLevel).tier);
        if (this.tierDisplay) {
            this.tierDisplay.textContent = scenarioId ? 'THỬ THÁCH' : (({ tutorial: 'HƯỚNG DẪN', onboarding: 'LÀM QUEN', acclimation: 'LUYỆN TẬP',
                normal: 'NORMAL', hard: 'HARD', superhard: 'SUPER HARD' })[tier] || 'NORMAL');
            this.tierDisplay.dataset.tier = tier;
        }
        this.levelDisplay.textContent = scenarioId ? `THỬ: ${scenarioLabel}` : this.currentLevel;
        this.levelDisplay.title = scenarioId ? `Kịch bản: ${scenarioLabel}` : `Màn ${this.currentLevel}`;
        if (this.btnNextLevel) {
            this.btnNextLevel.textContent = scenarioId ? 'VỀ MÀN THƯỜNG ➔' : 'TIẾP TỤC MÀN KẾ ➔';
        }
        this._boLuotFlip = true;
        
        this.updateRender();
        this.overlayLoading.classList.add('hidden');
        this.renderTimer();

        if (!scenarioId && this.currentLevel === 1) {
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
            this._renderNow();
        });
    }

    _renderNow() {
        this._refreshItemDragGhost();
        // F4 UI bugfix: pending press must not highlight targets before the move threshold.
        const validTargets = this.itemDragState.isDragging && this.itemDragState.didMove
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
        if (this.itemDragState.isDragging && this.itemDragState.didMove && this.itemDragState.sourceBoxId !== null) {
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
        
        this.queueRenderer.render(this.engine.getQueue(), this.engine.maxQueueSize);
        this.trayRenderer.render(this.engine.conveyor.getAllActiveTrays(), highlightTray, rejectTray);
        this.renderBoosters();
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
    handleSlotTap(boxId, itemIndex, event = null) {
        if (this._isMechanicLabOpen()) return;
        // Canonicalize numeric Box.id (DOM ids are strings; engine ids are numbers).
        boxId = this.engine.getBox(boxId)?.id ?? boxId;
        // F4 UI bugfix: a deliberate pointer tap already ran this method on pointerup;
        // consume the synthetic click the browser fires afterwards instead of
        // running the same action twice. Only matching events are swallowed.
        if (event && event.detail > 0 && this._suppressPointerClick) {
            const suppress = this._suppressPointerClick;
            if (performance.now() > suppress.until) {
                this._suppressPointerClick = null;
            } else if (String(suppress.boxId) === String(boxId) &&
                String(suppress.slotIndex) === String(itemIndex)) {
                this._suppressPointerClick = null;
                return;
            }
        }
        if (this.removeTrayMode) return;
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (this._isBoxBusy(boxId) || (this.engine.selectedSource && this._isBoxBusy(this.engine.selectedSource.boxId))) return;
        
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
                    if (this.audio.pickup) this.audio.pickup(); else this.audio.tap();
                    if (navigator.vibrate) navigator.vibrate(12);
                    this.updateRender();
                    // F3 presentation-only: pickup pop at the actual source slot.
                    const srcBoxEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
                    const srcSlotEl = srcBoxEl ? srcBoxEl.querySelector(`.slot[data-slot-index="${itemIndex}"]`) : null;
                    if (srcSlotEl) this._fx('pickup', srcSlotEl);
                }
            }
        } else {
            // Select target
            const sourceId = this.engine.selectedSource.boxId;
            // F4 UI bugfix: tapping the already-selected source deselects quietly.
            if (String(sourceId) === String(boxId)) {
                this.engine.deselectSource();
                this.updateRender();
                return;
            }
            const sourceBoxBefore = this.engine.getBox(sourceId);
            const willEmpty = sourceBoxBefore && sourceBoxBefore.items.length === 1;

            if (this.engine.selectTarget(boxId, itemIndex)) {
                this.audio.swap();
                this._busyBoxes.add(String(sourceId));
                this._busyBoxes.add(String(boxId));
                const epoch = this._animationEpoch;
                const targetBox = this.engine.getBox(boxId);
                this.boxRenderer.animateItemTransfer(sourceId, boxId, () => {
                    // F3 presentation-only: land FX on the target box for tap transfers.
                    const tapTargetEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
                    if (tapTargetEl) this._fx('land', tapTargetEl);
                    this.audio?.land?.();
                    this._finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox, epoch);
                });
            } else {
                // Invalid or deselected
                this.audio.reject();
                const invalidEl = document.querySelector(`.box[data-box-id="${boxId}"]`);
                if (invalidEl) this._fx('invalid', invalidEl, 'Ô này chưa thể nhận món đồ.');
                this.engine.deselectSource();
                // If they tapped a new source item, immediately select it
                if (itemIndex !== null && sourceId !== boxId) {
                    if (this.engine.selectSource(boxId, itemIndex)) {
                        this.audio.tap();
                    }
                }
                
                if (navigator.vibrate) navigator.vibrate(18);
                
                this.updateRender();
            }
        }
    }

    // --- Layer 1 Input: Item Drag & Drop ---
    handleItemDragStart(boxId, slotIndex, slotEl, e) {
        if (this._isMechanicLabOpen()) return;
        boxId = this.engine.getBox(boxId)?.id ?? boxId;
        if (this.removeTrayMode) return;
        if (this.engine.gameState !== 'PLAYING') return;
        if (this._isBoxBusy(boxId)) return;
        if (this.dragState.isDragging || this.itemDragState.isDragging) return;
        if (!this.engine.isAccessible(boxId)) return;

        const box = this.engine.getBox(boxId);
        if (!box || box.isWrapped) return;

        const itemId = box.slots ? box.slots[slotIndex] : null;
        if (!itemId) return;

        if (!this._canMoveBlockerItem(boxId, slotIndex)) {
            return this._refuseBlocker(slotEl, 'Vật này đang bị chặn và chưa thể di chuyển.');
        }
        // A mask is presentation-only: a concealed slot remains movable whenever
        // the core blocker rule explicitly allows the move.
        const initialMask = this._blockerSlotMask(this._getBlockerView(boxId), slotIndex);

        // Tutorial check
        if (this.tutorialManager && this.tutorialManager.active) {
            if (this.tutorialManager.isAllowedDragStart && !this.tutorialManager.isAllowedDragStart(boxId)) {
                this.tutorialManager.onDisallowedTap(boxId);
                return;
            }
        }

        if (this.engine.startClock()) this._clockLastTime = performance.now();
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.pointerId !== undefined && slotEl && slotEl.setPointerCapture) {
                try { slotEl.setPointerCapture(e.pointerId); } catch (_) {}
            }
        }

        // F4 UI bugfix: pointerdown is only a *pending* drag. Nothing visual, audible
        // or class-based happens until the 6px move threshold is crossed.
        this._dragSession = (this._dragSession || 0) + 1;
        this._suppressPointerClick = null;

        this.itemDragState.isDragging = true;
        this.itemDragState.didMove = false;
        this.itemDragState.sourceBoxId = boxId;
        this.itemDragState.sourceSlotIndex = slotIndex;
        this.itemDragState.itemId = itemId;
        this.itemDragState.initialBlockerMask = initialMask.hidden;
        this.itemDragState.blockerMaskToken = initialMask.token;
        this.itemDragState.blockerHidden = initialMask.hidden;
        this.itemDragState.targetBoxId = null;
        this.itemDragState.targetSlotIndex = null;
        this.itemDragState.pointerId = e ? e.pointerId : null;
        this.itemDragState.pointerTarget = slotEl;
        this.itemDragState.sourceSlotEl = slotEl;
        this.itemDragState.startX = e ? e.clientX : 0;
        this.itemDragState.startY = e ? e.clientY : 0;

        document.body.classList.add('is-item-dragging');

        // Create or get ghost, but keep it hidden until the threshold is crossed.
        let ghost = document.getElementById('item-drag-ghost');
        if (!ghost) {
            ghost = document.createElement('div');
            ghost.id = 'item-drag-ghost';
            ghost.className = 'item-drag-ghost';
            document.body.appendChild(ghost);
        }
        ghost.textContent = '';
        ghost.style.display = 'none';
        ghost.style.transition = '';
        ghost.style.transform = '';
        ghost.style.opacity = '';
        this.itemDragState.ghostEl = ghost;
        this._refreshItemDragGhost();

        this.updateRender();
    }

    handleItemDragMove(e) {
        if (!this.itemDragState.isDragging) return;
        if (e.preventDefault) e.preventDefault();
        this._refreshItemDragGhost();

        // F4 UI bugfix: below the 6px threshold this stays a silent tap.
        if (!this.itemDragState.didMove) {
            const dx = (e.clientX || 0) - (this.itemDragState.startX || 0);
            const dy = (e.clientY || 0) - (this.itemDragState.startY || 0);
            if (Math.sqrt(dx * dx + dy * dy) < 6) return;
            this.itemDragState.didMove = true;
            const srcSlot = this.itemDragState.sourceSlotEl;
            if (srcSlot) srcSlot.classList.add('slot-dragging');
            const startGhost = this.itemDragState.ghostEl;
            if (startGhost) {
                startGhost.style.display = 'flex';
                startGhost.style.transition = 'none';
                startGhost.style.transform = 'translate(-50%, -50%) scale(1.18)';
                startGhost.style.opacity = '1';
            }
            // Pickup feedback fires exactly once, on the crossing move.
            this.audio.pickup ? this.audio.pickup() : this.audio.tap();
            if (navigator.vibrate) navigator.vibrate(10);
            if (srcSlot) this._fx('pickup', srcSlot);
            this.updateRender();
        }

        // F3 presentation-only trail following the pointer ghost.
        this._fx('trail', e.clientX, e.clientY - 22);

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

        // F4 UI bugfix: pointercancel aborts silently - no moveItem, no reject audio/FX.
        if (e && e.type === 'pointercancel') {
            const cancelGhost = this.itemDragState.ghostEl;
            const cancelSlot = this.itemDragState.sourceSlotEl;
            this._releaseItemDragCapture();
            this._clearItemDragState();
            if (cancelGhost) cancelGhost.style.display = 'none';
            if (cancelSlot) cancelSlot.classList.remove('slot-dragging');
            document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
            document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));
            document.body.classList.remove('is-item-dragging');
            this.updateRender();
            return;
        }

        this._releaseItemDragCapture();

        // F4 UI bugfix: a press that never crossed the 6px threshold is a tap.
        if (!this.itemDragState.didMove) {
            const tapBoxId = this.itemDragState.sourceBoxId;
            const tapSlotIndex = this.itemDragState.sourceSlotIndex;
            const tapGhost = this.itemDragState.ghostEl;
            const tapSlotEl = this.itemDragState.sourceSlotEl;
            this._clearItemDragState();
            if (tapGhost) tapGhost.style.display = 'none';
            if (tapSlotEl) tapSlotEl.classList.remove('slot-dragging');
            document.querySelectorAll('.box.drag-over').forEach(b => b.classList.remove('drag-over'));
            document.querySelectorAll('.slot.drop-target-active').forEach(s => s.classList.remove('drop-target-active'));
            document.body.classList.remove('is-item-dragging');
            this.handleSlotTap(tapBoxId, tapSlotIndex);
            // Swallow the synthetic click the browser fires after this pointerup.
            this._suppressPointerClick = {
                boxId: String(tapBoxId),
                slotIndex: tapSlotIndex,
                until: performance.now() + 350
            };
            return;
        }

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
        this.itemDragState.didMove = false;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // F4 UI bugfix: a newer drag owns the body class now.
                if (!this.itemDragState.isDragging) document.body.classList.remove('is-item-dragging');
            });
        });

        // If targetBoxId is valid
        if (targetBoxId !== null && targetBoxId !== srcBoxId && !this._isBoxBusy(targetBoxId) && !this._isBoxBusy(srcBoxId)) {
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
                this._busyBoxes.add(String(srcBoxId));
                this._busyBoxes.add(String(targetBoxId));
                const epoch = this._animationEpoch;
                if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');

                // Detach this flight from the reusable active-drag ghost.
                if (ghost) ghost.id = '';
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
                    if (epoch !== this._animationEpoch) return;
                    if (ghost) ghost.remove();
                    const targetBox = this.engine.getBox(targetBoxId);
                    // F3 presentation-only: land FX at target slot/box before finalize.
                    this._fx('land', targetSlotEl || targetBoxEl);
                    this.audio?.land?.();
                    this._finalizeMoveAfterDrag(srcBoxId, targetBoxId, willEmpty, targetBox, epoch);
                }, 140);
                return;
            }
        }

        // Invalid target -> cancel & snap back
        this._cancelItemDrag(ghost, srcSlotEl);
    }

    // F4 UI bugfix helpers: pointer-capture release and local drag-state reset.
    _releaseItemDragCapture() {
        const state = this.itemDragState;
        if (!state) return;
        if (state.pointerId !== null && state.pointerId !== undefined && state.pointerTarget &&
            typeof state.pointerTarget.releasePointerCapture === 'function') {
            try { state.pointerTarget.releasePointerCapture(state.pointerId); } catch (_) {}
        }
        state.pointerId = null;
        state.pointerTarget = null;
    }

    _clearItemDragState() {
        const state = this.itemDragState;
        if (!state) return;
        state.isDragging = false;
        state.didMove = false;
        state.sourceBoxId = null;
        state.sourceSlotIndex = null;
        state.itemId = null;
        state.targetBoxId = null;
        state.targetSlotIndex = null;
        state.sourceSlotEl = null;
        state.ghostEl = null;
        state.initialBlockerMask = false;
        state.blockerMaskToken = null;
        state.blockerHidden = false;
    }

    _cancelItemDrag(ghost, srcSlotEl) {
        this.audio.reject();
        // F3 presentation-only: invalid-drop FX at source slot; snapback/epoch untouched.
        if (srcSlotEl) this._fx('invalid', srcSlotEl, 'Thả vào ô trống của thùng khác.');
        if (navigator.vibrate) navigator.vibrate(18);

        // F4 UI bugfix: snapshot epoch+session so the 180ms snap-back can never hide a
        // reused ghost or touch a newer drag/level. Source class is restored now.
        const epoch = this._animationEpoch;
        const session = this._dragSession;
        if (srcSlotEl) srcSlotEl.classList.remove('slot-dragging');

        const settle = () => {
            if (epoch !== this._animationEpoch || session !== this._dragSession) return;
            if (ghost) {
                ghost.style.display = 'none';
                ghost.style.transition = '';
                ghost.style.transform = '';
                ghost.style.opacity = '';
            }
            this.updateRender();
        };

        if (ghost && srcSlotEl) {
            const rect = srcSlotEl.getBoundingClientRect();
            ghost.style.transition = 'all 0.18s cubic-bezier(0.25, 1, 0.5, 1)';
            ghost.style.left = `${rect.left + rect.width / 2}px`;
            ghost.style.top = `${rect.top + rect.height / 2}px`;
            ghost.style.transform = 'translate(-50%, -50%) scale(0.95)';
            ghost.style.opacity = '0.7';
            setTimeout(settle, 180);
        } else {
            settle();
        }
    }

    _isBoxBusy(id) {
        return this._busyBoxes.has(String(id));
    }

    // F3 presentation-only: safe VFX dispatch so headless fixtures without vfx never throw.
    _fx(name, ...args) {
        return this.vfx?.[name]?.(...args);
    }

    _resetAnimationState() {
        this.removeTrayMode = false;
        this.setBoosterStatus('');
        if (this.trayRenderer) this.trayRenderer.speedMultiplier = 1;
        this._animationEpoch = (this._animationEpoch || 0) + 1;
        // F4 UI bugfix: bump the drag session so stale drag timers go inert, and drop
        // any pending click-suppression carried over from the previous level.
        this._dragSession = (this._dragSession || 0) + 1;
        this._suppressPointerClick = null;
        this._busyBoxes = new Set();
        this._pendingQueueBoxes = [];
        this._queueFlightActive = false;
        this._deliveryAnimating = false;
        this._blockerDrainQueued = false;
        // F3 presentation-only: reset FX-side bookkeeping (never gameplay timers).
        this._pendingPackFeedback = new Set();
        this._queueWarningLevel = 0;
        this._fx('reset');
        document.querySelectorAll('.item-drag-ghost, .item-animating, .flying-queue-box').forEach(el => el.remove());
        document.body.classList.remove('is-dragging', 'is-item-dragging');
        if (this.itemDragState) this.itemDragState.isDragging = false;
        if (this.dragState) this.dragState.isDragging = false;
    }

    _drainQueueFlights() {
        // Lab overlay defers NEW flights only. Pending wrapped requests stay queued and
        // already-running flights keep their callbacks (gameState is never changed).
        if (this._isMechanicLabOpen()) return;
        if (this._queueFlightActive || this._deliveryAnimating || !this._pendingQueueBoxes.length || this.engine.gameState !== 'PLAYING') return;
        const queue = this.engine.getQueue();
        let box = null;
        let boxIndex = -1;

        // A blocked connector must not prevent a later, independent box from flying.
        // Keep denied entries pending and busy so a later blocker update can retry them.
        for (let i = 0; i < this._pendingQueueBoxes.length;) {
            const candidate = this._pendingQueueBoxes[i];
            if (this.engine.getBox(candidate.id) !== candidate || queue.includes(candidate)) {
                this._pendingQueueBoxes.splice(i, 1);
                this._cleanupPendingQueueBox(candidate);
                continue;
            }
            if (!this._canQueueBlockerBox(candidate.id)) {
                i++;
                continue;
            }
            box = candidate;
            boxIndex = i;
            break;
        }
        if (!box) {
            // Denied connectors remain pending, but blocker logic must still evaluate
            // whether the current queue/tray state is an actual deadlock.
            if (this.engine.blockerState?.enabled && typeof this.engine.checkConditions === 'function') {
                this.engine.checkConditions();
            }
            return;
        }

        // Stale/admitted-pair cleanup above deliberately precedes capacity handling.
        if (queue.length >= this.engine.maxQueueSize) {
            if (this.engine.blockerState?.enabled) return;
            const trays = this.engine.conveyor.getAllActiveTrays();
            // An outgoing tray can expose the order needed to free a queue slot.
            if (this.engine.hasPendingTrayExits() || queue.some(b => trays.some(t => t.canAccept(b))) || this._deliveryAnimating) return;
            this.engine.loseReason = 'Hàng chờ đã đầy, không còn chỗ nhận thùng đã đóng gói.';
            this.engine.setGameState('LOST');
            return;
        }

        this._pendingQueueBoxes.splice(boxIndex, 1);
        const epoch = this._animationEpoch;
        this._queueFlightActive = true;
        const domBox = document.querySelector(`.box[data-box-id="${box.id}"]`);
        if (domBox) domBox.style.visibility = 'hidden';
        this.queueRenderer.animateBoxToQueue(box, queue.length, domBox, () => {
            if (epoch !== this._animationEpoch) return;
            this._queueFlightActive = false;
            this._busyBoxes.delete(String(box.id));

            // Atomic pair admission may have admitted this box while its flight was
            // already in progress. Never enqueue it twice or leave its board node hidden.
            if (this.engine.getBox(box.id) !== box || this.engine.getQueue().includes(box)) {
                if (domBox) domBox.style.visibility = '';
                this.updateRender();
                this._drainQueueFlights();
                return;
            }

            let admissionFailed = false;
            if (this.engine.gameState === 'PLAYING') {
                box.queueEnteredTime = performance.now();
                const moved = this.engine.moveBoxToQueue(box);
                if (moved === false && this.engine.getBox(box.id) === box && !this.engine.getQueue().includes(box)) {
                    admissionFailed = true;
                    if (domBox) domBox.style.visibility = '';
                    if (!this._pendingQueueBoxes.includes(box)) this._pendingQueueBoxes.unshift(box);
                    this._busyBoxes.add(String(box.id));
                }
            }
            this.updateRender();
            // F3 presentation-only: land FX only for boxes still present in queue this epoch.
            if (epoch === this._animationEpoch && this.engine.gameState === 'PLAYING' &&
                this.engine.getQueue().includes(box)) {
                const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);
                if (slotEl) {
                    this.audio?.land?.();
                    this._fx('land', slotEl);
                }
            }
            if (!admissionFailed) this._drainQueueFlights();
        });
    }

    _playPackFeedback(box) {
        if (!box || !this._pendingPackFeedback?.delete(String(box.id))) return;
        const el = document.querySelector(`.box[data-box-id="${box.id}"]`);
        if (!el) return;
        this.audio?.wrap?.();
        this._fx('pack', el);
        this._fx('praise', el, 'Đã đóng gói!', 1);
    }

    _finalizeMoveAfterDrag(sourceId, boxId, willEmpty, targetBox, epoch = this._animationEpoch) {
        if (epoch !== this._animationEpoch) return;
        this._busyBoxes.delete(String(sourceId));
        // State already committed; let other boxes render and accept input now.
        this._busyBoxes.delete(String(boxId));
        this.updateRender();
        if (targetBox && targetBox.isWrapped) {
            this._playPackFeedback(targetBox);
            this._busyBoxes.add(String(boxId));
            setTimeout(() => {
                if (epoch !== this._animationEpoch || this.engine.gameState !== 'PLAYING') return;
                if (!this._pendingQueueBoxes.includes(targetBox)) this._pendingQueueBoxes.push(targetBox);
                this._drainQueueFlights();
            }, 550);
        }
    }

    // --- Layer 2 Input (Drag) ---
    handleDragStart(boxId, e) {
        if (this._isMechanicLabOpen()) return;
        if (this.removeTrayMode) return;
        if (this._isBoxBusy(boxId)) return;
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

        // F4 UI bugfix: pointercancel ends the wrapped-box drag with no drop at all.
        if (e && e.type === 'pointercancel') {
            if (this.dragState.pointerId !== undefined && this.dragState.pointerId !== null &&
                this.dragState.pointerTarget && this.dragState.pointerTarget.releasePointerCapture) {
                try { this.dragState.pointerTarget.releasePointerCapture(this.dragState.pointerId); } catch (_) {}
            }
            this.dragState.pointerId = null;
            this.dragState.pointerTarget = null;
            this.dragState.isDragging = false;
            this.dragState.boxId = null;
            this.dragState.targetTrayId = null;
            this.dragState.colIndex = null;
            this.dragGhost.style.display = 'none';
            this.dragGhost.style.width = '';
            this.dragGhost.style.height = '';
            this.dragGhost.style.transition = '';
            this.dragGhost.style.transform = '';
            this.dragGhost.style.opacity = '';
            this.engine.cancelDrag();
            document.body.classList.remove('is-dragging');
            this.updateRender();
            return;
        }
        
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

                        this.audio.combo(1);
                        // F3 presentation-only: manual wrapped-tray route uses delivery VFX.
                        this._fx('delivery', trayEl);
                        this._fx('praise', trayEl, 'Đã giao hàng!', 1);
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
        if (this.removeTrayMode) return;
        if (this._isMechanicLabOpen()) return;
        if (this.engine.gameState !== 'PLAYING') return;
        this._drainQueueFlights();
        if (this._deliveryAnimating || this._queueFlightActive) return;

        const queue = this.engine.getQueue();
        if (queue.length === 0) return;

        const activeTrays = this.engine.conveyor.getAllActiveTrays();
        if (activeTrays.length === 0) return;

        for (let slotIdx = 0; slotIdx < queue.length; slotIdx++) {
            const box = queue[slotIdx];
            if (!box) continue;
            if (!this._canDispatchBlockerBox(box.id)) continue;

            // Cho thung nam yen trong slot it nhat 250ms sau khi bay xuong hang cho
            if (box.queueEnteredTime && (now - box.queueEnteredTime < 250)) {
                continue;
            }

            const slotEl = document.querySelector(`.queue-slot[data-box-id="${box.id}"]`);
            if (!slotEl) continue;

            // Evaluate every matching tray: the first matching tray may still be
            // on the far side while another is already passing this queue slot.
            for (const tray of activeTrays) {
                if (!tray.canAccept(box)) continue;
                const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
                if (!trayObj || !trayObj.el || trayObj.isExiting || trayObj.isReceiving || trayObj.fadingOut) continue;
                if (!this.trayRenderer.isInDeliveryZone(trayObj, slotEl, queue.length)) continue;

                this.triggerQueueDelivery(box, tray, slotEl, trayObj.el);
                return; // Keep delivery transactions serialized across frames.
            }
        }
    }

    triggerQueueDelivery(box, tray, slotEl, trayEl) {
        if (!this._canDispatchBlockerBox(box.id)) {
            return this._refuseBlocker(slotEl, 'Thùng này đang được giữ trong hàng chờ.');
        }
        this._deliveryAnimating = true;
        const epoch = this._animationEpoch;

        const trayObj = this.trayRenderer.trayElements.find(t => t.id === tray.id);
        const wasReceiving = trayObj ? trayObj.isReceiving : false;
        const slotClassName = slotEl.className;
        const slotOpacity = slotEl.style.opacity;
        const slotVisibility = slotEl.style.visibility;
        const queueBoxEl = slotEl.querySelector('.queue-box');
        const queueBoxOpacity = queueBoxEl ? queueBoxEl.style.opacity : '';
        if (trayObj) {
            trayObj.isReceiving = true;
        }

        slotEl.classList.add('dispatching');
        if (navigator.vibrate) navigator.vibrate(15);

        this.audio?.whoosh?.();

        this.queueRenderer.animateBoxToTray(box, slotEl, trayEl, () => {
            if (epoch !== this._animationEpoch) return;
            slotEl.classList.remove('dispatching');
            const delivered = this.engine.deliverQueueBox(box.id, tray.id);
            this._deliveryAnimating = false;

            if (delivered === false) {
                slotEl.className = slotClassName;
                slotEl.style.opacity = slotOpacity;
                slotEl.style.visibility = slotVisibility;
                if (queueBoxEl) queueBoxEl.style.opacity = queueBoxOpacity;
                if (trayObj) trayObj.isReceiving = wasReceiving;
                this._fx('toast', this.engine.lastBlockerError || 'Thùng chưa thể giao cho khay này.');
                this.updateRender();
                this._drainQueueFlights();
                return;
            }

            this._drainQueueFlights();

            const now = performance.now();
            if (this.lastDeliveryTime && (now - this.lastDeliveryTime < 3400)) {
                this.comboStreak++;
            } else {
                this.comboStreak = 1;
            }
            this.lastDeliveryTime = now;

            this.audio.combo(this.comboStreak);
            // F3 presentation-only: delivery/tray feedback via VFXManager.
            this._fx('delivery', trayEl);
            const slogan = this.comboStreak >= 2 ? `Liên tiếp x${this.comboStreak}` : 'Đã giao hàng!';
            this._fx('praise', trayEl, slogan, this.comboStreak);
            this._fx('bump', 'queue-counter');

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
