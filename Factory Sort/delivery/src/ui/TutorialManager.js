export class TutorialManager {
    constructor(uiManager, gameEngine) {
        this.ui = uiManager;
        this.engine = gameEngine;
        
        // DOM Elements
        this.container = document.getElementById('game-container');
        this.overlay = document.getElementById('tutorial-overlay');
        this.spotlightCutout = document.getElementById('spotlight-cutout');
        this.handPointer = document.getElementById('tutorial-hand');
        this.banner = document.getElementById('tutorial-banner');
        this.badgeEl = document.getElementById('tutorial-badge');
        this.textEl = document.getElementById('tutorial-text');
        this.btnSkip = document.getElementById('btn-skip-tutorial');
        this.targetHighlight = document.getElementById('tutorial-target-highlight');
        
        // Help modal elements
        this.btnHelp = document.getElementById('btn-help');
        this.overlayHelp = document.getElementById('overlay-help');
        this.btnCloseHelp = document.getElementById('btn-close-help');

        // Victory tutorial summary modal
        this.overlayTutorialWin = document.getElementById('overlay-tutorial-win');
        this.btnTutorialNext = document.getElementById('btn-tutorial-next');

        // State Machine
        // 'STEP_1_PICK_PENGUIN' -> Tap penguin in box 1
        // 'STEP_2_PLACE_PENGUIN' -> Tap penguin box 0
        // 'STEP_3_QUEUE_EXPLAIN' -> Watch box 0 wrap, go to queue, delivered by penguin tray
        // 'STEP_4_PICK_BEAR' -> Tap bear in box 3
        // 'STEP_5_PLACE_BEAR' -> Tap bear box 2
        // 'STEP_6_BEAR_QUEUE' -> Watch box 2 deliver
        // 'STEP_COMPLETE' -> Show 3 golden rules
        this.active = false;
        this.currentStep = null;
        this.currentTargetEl = null;
        this._currentPadding = 10;
        this._currentHandOffset = { x: 0, y: 55 };
        this._currentHandDirection = 'up';
        this._currentHandText = '';
        this._resizeHandler = this.updatePositions.bind(this);

        this.bindEvents();
    }

    bindEvents() {
        if (this.btnSkip) {
            const handleSkip = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.skipTutorial();
            };
            this.btnSkip.addEventListener('click', handleSkip);
            this.btnSkip.addEventListener('pointerdown', handleSkip);
        }

        if (this.btnHelp) {
            this.btnHelp.addEventListener('click', () => {
                if (this.overlayHelp) this.overlayHelp.classList.remove('hidden');
            });
        }

        if (this.btnCloseHelp) {
            this.btnCloseHelp.addEventListener('click', () => {
                if (this.overlayHelp) this.overlayHelp.classList.add('hidden');
            });
        }

        if (this.btnTutorialNext) {
            this.btnTutorialNext.addEventListener('click', () => {
                if (this.overlayTutorialWin) this.overlayTutorialWin.classList.add('hidden');
                this.ui.currentLevel = 2;
                this.ui.startNewLevel();
            });
        }

        window.addEventListener('resize', this._resizeHandler);
    }

    _parseId(id) {
        return Number(String(id).replace(/^box_/, ''));
    }

    findBoxElement(id) {
        return document.querySelector(`.box[data-box-id="${id}"]`) ||
               document.querySelector(`.box[data-box-id="box_${id}"]`);
    }

    startLevel1Tutorial() {
        this.active = true;
        this.hideHighlight();
        if (this.overlay) this.overlay.classList.remove('hidden');
        if (this.overlayTutorialWin) this.overlayTutorialWin.classList.add('hidden');

        // Allow DOM to settle before calculating coordinates
        setTimeout(() => {
            this.setStep('STEP_1_PICK_PENGUIN');
        }, 180);
    }

    skipTutorial() {
        this.active = false;
        this.currentStep = null;
        this.currentTargetEl = null;
        this.clearSpotlight();
        this.hideHighlight();
        if (this.overlay) this.overlay.classList.add('hidden');
        if (this.handPointer) this.handPointer.classList.add('hidden');
    }

    hideHighlight() {
        if (this.targetHighlight) {
            this.targetHighlight.classList.add('hidden');
            this.targetHighlight.style.display = 'none';
        }
    }

    wiggleBanner() {
        if (!this.banner) return;
        this.banner.classList.add('wiggle');
        setTimeout(() => {
            if (this.banner) this.banner.classList.remove('wiggle');
        }, 350);
        if (navigator.vibrate) navigator.vibrate(15);
    }

    /**
     * Kiem tra xem thao tac tap cua nguoi choi co dung voi muc tieu cua buoc hien tai khong.
     * Ngan tuyet doi viec de item di nham vao thung khac loai trong qua trinh tutorial!
     */
    isAllowedTap(boxId, itemIndex) {
        if (!this.active || !this.currentStep) return true;
        const id = this._parseId(boxId);

        switch (this.currentStep) {
            case 'STEP_1_PICK_PENGUIN':
                return id === 1; // Chi duoc chon chim canh cut o Thung 1
            case 'STEP_2_PLACE_PENGUIN':
                return id === 0; // Chi duoc tha vao Thung 0 (thung chim canh cut)
            case 'STEP_3_QUEUE_EXPLAIN':
                return false; // Dang giai thich hang cho va cho khay nhan
            case 'STEP_4_PICK_BEAR':
                return id === 3; // Chi duoc chon gau bong o Thung 3
            case 'STEP_5_PLACE_BEAR':
                return id === 2; // Chi duoc tha vao Thung 2 (thung gau bong)
            case 'STEP_6_BEAR_QUEUE':
                return false;
            default:
                return true;
        }
    }

    /**
     * Xu ly khi nguoi choi bam nham vao thung khong duoc phep trong tutorial.
     */
    onDisallowedTap(boxId) {
        this.wiggleBanner();
        const id = this._parseId(boxId);
        const wrongBoxEl = this.findBoxElement(id);
        if (wrongBoxEl) {
            wrongBoxEl.classList.add('reject');
            setTimeout(() => wrongBoxEl.classList.remove('reject'), 220);
        }

        // Nhac nho muc tieu dung
        if (this.targetHighlight && this.targetHighlight.style.display !== 'none') {
            this.targetHighlight.style.animation = 'none';
            void this.targetHighlight.offsetWidth;
            this.targetHighlight.style.animation = 'tutorial-pulse 0.6s 2 ease-in-out';
        }
    }

    setStep(step) {
        if (!this.active) return;
        this.currentStep = step;

        switch (step) {
            case 'STEP_1_PICK_PENGUIN': {
                // Muc tieu: Chim canh cut o Thung 1
                const box1El = this.findBoxElement(1);
                const slot0 = box1El ? box1El.querySelector('.slot[data-slot-index="0"]') : null;
                const target = slot0 || box1El;

                this.showStep({
                    targetEl: target,
                    badge: 'BƯỚC 1 / 4 • CHỌN MÓN ĐỒ',
                    text: 'Chạm vào chú <b>Chim cánh cụt 🐧</b> để lấy ra khỏi thùng.',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Chạm vào đây!',
                    padding: 8,
                    pulse: true
                });
                break;
            }

            case 'STEP_2_PLACE_PENGUIN': {
                // Muc tieu: Thung 0 (dang co 2 con chim canh cut)
                const box0El = this.findBoxElement(0);

                this.showStep({
                    targetEl: box0El,
                    badge: 'BƯỚC 2 / 4 • GOM 3 MÓN CÙNG LOẠI',
                    text: 'Chạm vào <b>Thùng chim cánh cụt 🐧</b> để gom đủ 3 món!',
                    handOffset: { x: 0, y: 65 },
                    handDirection: 'up',
                    handText: 'Thả vào đây!',
                    padding: 12,
                    pulse: true
                });
                break;
            }

            case 'STEP_3_QUEUE_EXPLAIN': {
                // Spotlight khu vuc Hang cho & Bang chuyen
                this.hideHighlight(); // Khong de lai highlight thua o vi tri Thung 0!
                const queueArea = document.getElementById('queue-area');
                const conveyor = document.getElementById('conveyor-belt');
                const targetArea = queueArea || conveyor;

                this.showStep({
                    targetEl: targetArea,
                    badge: 'BƯỚC 3 / 4 • ĐÓNG GÓI & XUẤT HÀNG',
                    text: '📦 <b>Đóng gói thành công!</b> Thùng đủ 3 món dán kín và bay xuống <b>Hàng chờ</b>.<br>Khay 🐧 trên băng chuyền sẽ <b>tự động nhận hàng</b> khi chạy ngang qua!',
                    handOffset: { x: 0, y: -45 },
                    handDirection: 'down',
                    handText: 'Băng chuyền tự nhận hàng',
                    padding: 10,
                    pulse: false
                });
                break;
            }

            case 'STEP_4_PICK_BEAR': {
                // Muc tieu: Gau bong o Thung 3 (duoi cung cua cot phai)
                const box3El = this.findBoxElement(3);
                const slot0 = box3El ? box3El.querySelector('.slot[data-slot-index="0"]') : null;
                const target = slot0 || box3El;

                this.showStep({
                    targetEl: target,
                    badge: 'BƯỚC 4 / 4 • GOM GẤU BÔNG 🧸',
                    text: 'Rất tốt! Giờ hãy chạm vào chú <b>Gấu bông 🧸</b> ở thùng bên dưới để lấy ra.',
                    handOffset: { x: 0, y: 55 },
                    handDirection: 'up',
                    handText: 'Lấy gấu bông 🧸',
                    padding: 8,
                    pulse: true
                });
                break;
            }

            case 'STEP_5_PLACE_BEAR': {
                // Muc tieu: Thung 2 (dang co 2 con gau bong o tren)
                const box2El = this.findBoxElement(2);

                this.showStep({
                    targetEl: box2El,
                    badge: 'HOÀN THÀNH • GOM ĐỦ 3 GẤU BÔNG',
                    text: 'Chạm vào <b>Thùng gấu bông 🧸</b> phía trên để hoàn tất đóng gói!',
                    handOffset: { x: 0, y: 65 },
                    handDirection: 'up',
                    handText: 'Gom vào đây!',
                    padding: 12,
                    pulse: true
                });
                break;
            }

            case 'STEP_6_BEAR_QUEUE': {
                this.hideHighlight(); // Khong de lai highlight thua o vi tri Thung 2!
                const queueArea = document.getElementById('queue-area');
                this.showStep({
                    targetEl: queueArea,
                    badge: 'XUẤT HÀNG CUỐI CÙNG 🚚',
                    text: 'Thùng gấu bông đã đóng gói! Chờ Khay 🧸 nhận hàng để hoàn thành màn chơi...',
                    handOffset: { x: 0, y: -45 },
                    handDirection: 'down',
                    handText: 'Xuất kho thành công',
                    padding: 10,
                    pulse: false
                });
                break;
            }

            case 'STEP_COMPLETE': {
                this.active = false;
                this.clearSpotlight();
                this.hideHighlight();
                if (this.overlay) this.overlay.classList.add('hidden');
                if (this.handPointer) this.handPointer.classList.add('hidden');
                
                // Hien thi modal chien thang kem 3 quy tac vang
                if (this.overlayTutorialWin) {
                    this.overlayTutorialWin.classList.remove('hidden');
                }
                break;
            }
        }
    }

    showStep({ targetEl, badge, text, handOffset = { x: 0, y: 50 }, handDirection = 'up', handText = '', padding = 8, pulse = true }) {
        this.currentTargetEl = targetEl;
        this._currentPadding = padding;
        this._currentHandOffset = handOffset;
        this._currentHandDirection = handDirection;
        this._currentHandText = handText;

        if (this.badgeEl) this.badgeEl.innerHTML = `<span class="tutorial-badge-dot"></span> ${badge}`;
        if (this.textEl) this.textEl.innerHTML = text;

        if (!targetEl) {
            this.clearSpotlight();
            this.hideHighlight();
            return;
        }

        this.updateCutout(targetEl, padding);
        this.updateHandPointer(targetEl, handOffset, handDirection, handText);

        if (this.targetHighlight) {
            if (pulse) {
                const containerRect = this.container.getBoundingClientRect();
                const rect = targetEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    this.targetHighlight.style.left = `${rect.left - containerRect.left - padding}px`;
                    this.targetHighlight.style.top = `${rect.top - containerRect.top - padding}px`;
                    this.targetHighlight.style.width = `${rect.width + padding * 2}px`;
                    this.targetHighlight.style.height = `${rect.height + padding * 2}px`;
                    this.targetHighlight.style.animation = 'tutorial-pulse 1.3s infinite ease-in-out';
                    this.targetHighlight.style.display = 'block';
                    this.targetHighlight.classList.remove('hidden');
                } else {
                    this.hideHighlight();
                }
            } else {
                this.hideHighlight();
            }
        }
    }

    updateCutout(el, padding = 8) {
        if (!el || !this.spotlightCutout || !this.container) return;
        const containerRect = this.container.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        const x = Math.max(0, rect.left - containerRect.left - padding);
        const y = Math.max(0, rect.top - containerRect.top - padding);
        const w = rect.width + padding * 2;
        const h = rect.height + padding * 2;

        this.spotlightCutout.setAttribute('x', x);
        this.spotlightCutout.setAttribute('y', y);
        this.spotlightCutout.setAttribute('width', w);
        this.spotlightCutout.setAttribute('height', h);
    }

    clearSpotlight() {
        if (this.spotlightCutout) {
            this.spotlightCutout.setAttribute('x', 0);
            this.spotlightCutout.setAttribute('y', 0);
            this.spotlightCutout.setAttribute('width', 0);
            this.spotlightCutout.setAttribute('height', 0);
        }
        this.hideHighlight();
    }

    updateHandPointer(el, offset = { x: 0, y: 50 }, direction = 'up', text = '') {
        if (!el || !this.handPointer || !this.container) return;

        const containerRect = this.container.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) return;

        const targetCenterX = rect.left + rect.width / 2 - containerRect.left;
        const targetCenterY = rect.top + rect.height / 2 - containerRect.top;

        this.handPointer.style.left = `${targetCenterX + offset.x}px`;
        this.handPointer.style.top = `${targetCenterY + offset.y}px`;

        const handIcon = this.handPointer.querySelector('.hand-icon');
        if (handIcon) {
            handIcon.textContent = direction === 'down' ? '👇' : '👆';
        }

        const handLabel = this.handPointer.querySelector('.hand-label');
        if (handLabel) {
            handLabel.textContent = text;
            handLabel.style.display = text ? 'block' : 'none';
        }

        this.handPointer.classList.remove('hidden');
    }

    updatePositions() {
        if (!this.active || !this.currentTargetEl) return;
        this.updateCutout(this.currentTargetEl, this._currentPadding);
        this.updateHandPointer(this.currentTargetEl, this._currentHandOffset, this._currentHandDirection, this._currentHandText);

        if (this.targetHighlight && this.targetHighlight.style.display !== 'none' && !this.targetHighlight.classList.contains('hidden')) {
            const containerRect = this.container.getBoundingClientRect();
            const rect = this.currentTargetEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const padding = this._currentPadding;
                this.targetHighlight.style.left = `${rect.left - containerRect.left - padding}px`;
                this.targetHighlight.style.top = `${rect.top - containerRect.top - padding}px`;
                this.targetHighlight.style.width = `${rect.width + padding * 2}px`;
                this.targetHighlight.style.height = `${rect.height + padding * 2}px`;
            } else {
                this.hideHighlight();
            }
        }
    }

    // Callbacks from UIManager
    onSlotTapped(boxId, itemIndex) {
        if (!this.active) return;
        const id = this._parseId(boxId);

        if (this.currentStep === 'STEP_1_PICK_PENGUIN') {
            if (id === 1) {
                // Chim canh cut o Thung 1 da duoc nhac len -> an highlight cu va chuyen sang chi Thung 0
                this.hideHighlight();
                setTimeout(() => {
                    this.setStep('STEP_2_PLACE_PENGUIN');
                }, 50);
            }
        } else if (this.currentStep === 'STEP_4_PICK_BEAR') {
            if (id === 3) {
                // Gau bong o Thung 3 da duoc nhac len -> an highlight cu va chuyen sang chi Thung 2
                this.hideHighlight();
                setTimeout(() => {
                    this.setStep('STEP_5_PLACE_BEAR');
                }, 50);
            }
        }
    }

    onBoxWrapped(box) {
        if (!this.active) return;
        // Xoa bo ngay lap tuc highlight va hand cu khi thung bat dau dong goi
        this.hideHighlight();
        if (this.handPointer) this.handPointer.classList.add('hidden');

        if (this.currentStep === 'STEP_2_PLACE_PENGUIN' || this.currentStep === 'STEP_1_PICK_PENGUIN') {
            setTimeout(() => {
                this.setStep('STEP_3_QUEUE_EXPLAIN');
            }, 550);
        } else if (this.currentStep === 'STEP_5_PLACE_BEAR' || this.currentStep === 'STEP_4_PICK_BEAR') {
            setTimeout(() => {
                this.setStep('STEP_6_BEAR_QUEUE');
            }, 550);
        }
    }

    onTrayDelivered(trayId, box) {
        if (!this.active) return;
        if (this.currentStep === 'STEP_3_QUEUE_EXPLAIN') {
            // Sau khi khay chim canh cut giao xong, bat dau buoc huong dan cho Gau bong 🧸
            setTimeout(() => {
                this.setStep('STEP_4_PICK_BEAR');
            }, 750);
        }
    }

    onGameStateWon() {
        if (this.ui.currentLevel === 1) {
            this.setStep('STEP_COMPLETE');
        }
    }
}
