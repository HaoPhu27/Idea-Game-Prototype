/**
 * VFXManager.js
 * Presentation-only visual feedback (canvas particles + DOM text/toast).
 * Warm reference palette: #ffd15c / #ff8a3d / #fffdf7 / #4fae5a / #e4574b
 * No neon rings, no fabricated score/coin, no game callbacks/state/input.
 */

const PALETTE = ['#ffd15c', '#ff8a3d', '#fffdf7', '#4fae5a', '#e4574b'];
const MAX_PARTICLES = 240;
const TRAIL_THROTTLE = 32;

export class VFXManager {
    constructor() {
        this.container = document.getElementById('play-area') || document.body;
        this.gameContainer = document.getElementById('game-container') || document.body;
        this.PALETTE = PALETTE;

        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.rafId = null;
        this.lastTs = 0;
        this.lastTrail = 0;
        this.timers = new Set();
        this.nodes = new Set();
        this.anims = new Set();
        this.effectTargets = new Set();
        this._resizeObserver = null;
        this._reduced = false;
        try {
            this._reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        } catch (_) {
            this._reduced = false;
        }
    }

    _reducedMotion() {
        return this._reduced;
    }

    _setTimeout(fn, ms) {
        const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
        this.timers.add(id);
        return id;
    }

    _track(el) {
        this.nodes.add(el);
        return el;
    }

    _trackTarget(el) {
        if (el && el.classList) this.effectTargets.add(el);
        return el;
    }

    /** Lazily create canvas inside #game-container. */
    _ensureCanvas() {
        if (this.canvas) return this.canvas;
        if (typeof document === 'undefined' || !this.gameContainer) return null;
        try {
            const cv = document.createElement('canvas');
            cv.className = 'fx-canvas';
            cv.setAttribute('aria-hidden', 'true');
            cv.style.position = 'absolute';
            cv.style.inset = '0';
            cv.style.pointerEvents = 'none';
            this.gameContainer.appendChild(cv);
            this.canvas = cv;
            this.ctx = cv.getContext ? cv.getContext('2d') : null;
            if (this.ctx) {
                this._sizeCanvas();
                if (typeof ResizeObserver === 'function') {
                    try {
                        this._resizeObserver = new ResizeObserver(() => this._sizeCanvas());
                        this._resizeObserver.observe(this.gameContainer);
                    } catch (_) { this._resizeObserver = null; }
                }
            } else {
                try { cv.remove && cv.remove(); } catch (_) {}
                this.canvas = null;
            }
        } catch (_) {
            this.canvas = null;
            this.ctx = null;
        }
        return this.canvas;
    }

    _sizeCanvas() {
        if (!this.canvas) return;
        const cw = this.gameContainer.clientWidth || 0;
        const ch = this.gameContainer.clientHeight || 0;
        const rect = (!cw || !ch) && this.gameContainer.getBoundingClientRect ? this.gameContainer.getBoundingClientRect() : { width: cw, height: ch };
        const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
        const w = Math.max(1, Math.round(cw || rect.width || 1));
        const h = Math.max(1, Math.round(ch || rect.height || 1));
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        if (this.ctx) {
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        this._stageW = w;
        this._stageH = h;
    }

    /** Convert viewport/client coords to canvas-local stage coords. */
    _toLocal(clientX, clientY) {
        const rect = this.gameContainer.getBoundingClientRect ? this.gameContainer.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 };
        const sx = rect.width ? (this._stageW || rect.width) / rect.width : 1;
        const sy = rect.height ? (this._stageH || rect.height) / rect.height : 1;
        return [
            (clientX - rect.left) * sx,
            (clientY - rect.top) * sy,
        ];
    }

    _targetCenter(target) {
        if (!target) return [(this._stageW || 0) / 2, (this._stageH || 0) / 2];
        const r = (target.getBoundingClientRect && typeof target.getBoundingClientRect === 'function') ? target.getBoundingClientRect() : target;
        if (!r || !isFinite(r.left) || !isFinite(r.top) || !isFinite(r.width) || !isFinite(r.height)) {
            return [(this._stageW || 0) / 2, (this._stageH || 0) / 2];
        }
        this._trackTarget(target);
        return this._toLocal(r.left + r.width / 2, r.top + r.height / 2);
    }

    _bumpCount() {
        if (this.canvas) this.canvas.dataset.particles = String(this.particles.length);
    }

    _emit(p) {
        if (this._reduced) return;
        if (!this.ctx) return;
        if (this.particles.length >= MAX_PARTICLES) return;
        this.particles.push(Object.assign({
            life: 1, decay: 1.6, g: 600, size: 4, shape: 'c', rot: 0, vr: 0, color: '#fff',
            x: 0, y: 0, vx: 0, vy: 0,
        }, p));
        this._bumpCount();
        this._ensureRaf();
    }

    _ensureRaf() {
        if (this.rafId != null) return;
        if (this.particles.length === 0) return;
        if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') return;
        this.rafId = window.requestAnimationFrame((ts) => this._frame(ts));
    }

    _frame(ts) {
        this.rafId = null;
        const dt = Math.min(0.05, (ts - (this.lastTs || ts)) / 1000);
        this.lastTs = ts;
        this._tick(dt);
        this._draw();
        if (this.particles.length > 0) {
            this._ensureRaf();
        } else {
            this.lastTs = 0;
        }
    }

    _tick(dt) {
        const ps = this.particles;
        for (let i = 0; i < ps.length; i++) {
            const p = ps[i];
            p.vy += p.g * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            p.life -= p.decay * dt;
        }
        this.particles = ps.filter((p) => p.life > 0 && p.y < (this._stageH || 900) + 200);
        this._bumpCount();
    }

    _draw() {
        if (!this.ctx || !this.canvas) return;
        const w = this._stageW || this.canvas.width;
        const h = this._stageH || this.canvas.height;
        this.ctx.clearRect(0, 0, w, h);
        const ps = this.particles;
        if (!ps.length) return;
        for (let i = 0; i < ps.length; i++) {
            const p = ps[i];
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            this.ctx.fillStyle = p.color;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rot);
            if (p.shape === 'c') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, 7);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            }
            this.ctx.restore();
        }
        this.ctx.globalAlpha = 1;
    }

    _add(p) { this._emit(p); }
    _burst(x, y, colors, n = 14, speed = 220, opt = {}) {
        if (this._reduced) return;
        const cap = Math.min(n, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < cap; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = speed * (0.4 + Math.random() * 0.8);
            this._emit(Object.assign({
                x, y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v - 80,
                color: colors[i % colors.length],
                size: 3 + Math.random() * 4,
                shape: Math.random() < 0.5 ? 'c' : 'r',
                rot: Math.random() * 6,
                vr: (Math.random() - 0.5) * 10,
                decay: 1.4 + Math.random(),
            }, opt));
        }
    }
    _puff(x, y, color = 'rgba(255,255,255,.9)', n = 8) {
        if (this._reduced) return;
        const cap = Math.min(n, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < cap; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = 40 + Math.random() * 60;
            this._emit({
                x, y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v - 20,
                color,
                size: 5 + Math.random() * 6,
                shape: 'c',
                g: -60,
                decay: 2.2,
            });
        }
    }

    /**
     * Round particle burst (canvas). Kept API: burst(target, color, count).
     */
    burst(target, color = '#ffd15c', count = 10) {
        if (!target) return;
        this._ensureCanvas();
        const [x, y] = this._targetCenter(target);
        const colors = color ? [color] : PALETTE;
        const n = Math.max(4, Math.min(24, Math.round(count || 10)));
        this._burst(x, y, colors, n, 220);
    }

    /**
     * Praise text: sentence-case, centered, clamped into stage bounds. .9s lifetime.
     * No score/coin/emoji tier suffix.
     */
    praise(target, text, combo = 1) {
        if (!target || !text) return;
        const tier = this.getTier(combo);
        const el = document.createElement('div');
        el.className = 'factory-praise';
        this._ensureCanvas();
        const cleaned = String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
        const pretty = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : '';
        el.textContent = pretty;
        el.style.setProperty('--pz', tier.scale);
        el.style.setProperty('--pc', tier.color);
        el.style.position = 'absolute';
        el.style.transform = 'translate(-50%, -50%)';
        this._track(el);

        if (this._reducedMotion()) {
            el.style.animation = 'none';
            el.style.opacity = '1';
        }

        const c = this._targetCenter(target);
        let cx = c[0];
        const cy = c[1];
        el.style.left = cx + 'px';
        el.style.top = cy + 'px';

        this.gameContainer.appendChild(el);

        // Clamp horizontally by actual text width and stage bounds.
        try {
            const w = el.offsetWidth || 0;
            const half = w / 2 + 8;
            const stageW = this._stageW || this.gameContainer.clientWidth || half * 2;
            cx = Math.max(half, Math.min(stageW - half, cx));
            el.style.left = cx + 'px';
        } catch (_) {}

        this._setTimeout(() => this._removeNode(el), 900);
    }

    /**
     * Bump: avoids overwriting a moving tray's inline transform.
     * Uses class + WAAPI composite:add when available; never reassigns transform.
     */
    bump(elOrId) {
        const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el || !el.classList) return;
        el.classList.remove('bump');
        try { void el.offsetWidth; } catch (_) {}
        el.classList.add('bump');
        this._setTimeout(() => { if (el.classList) el.classList.remove('bump'); }, 450);
        if (!this._reducedMotion() && typeof el.animate === 'function') {
            try {
                const a = el.animate(
                    [{ scale: '1' }, { scale: '1.12' }, { scale: '1' }],
                    { duration: 450, easing: 'ease-out' }
                );
                if (a) {
                    this.anims.add(a);
                    const drop = () => this.anims.delete(a);
                    a.onfinish = drop;
                    a.oncancel = drop;
                }
            } catch (_) {}
        }
    }

    /**
     * Confetti falling into the full container (canvas).
     */
    confetti(container = null) {
        const parent = container || this.gameContainer || document.body;
        this._trackTarget(parent);
        if (parent !== this.gameContainer && parent.classList) {
            parent.classList.add('vfx-confetti-fallback');
            this._setTimeout(() => parent.classList && parent.classList.remove('vfx-confetti-fallback'), 1500);
        }
        this._ensureCanvas();
        const cols = ['#e4574b', '#4f8de0', '#f4d03f', '#5cb85c', '#9463c9', '#ef6fae', '#ff8a3d'];
        const n = 90;
        const cap = Math.min(n, MAX_PARTICLES - this.particles.length);
        for (let i = 0; i < cap; i++) {
            this._emit({
                x: Math.random() * (this._stageW || 390),
                y: -20 - Math.random() * 200,
                vx: (Math.random() - 0.5) * 120,
                vy: 80 + Math.random() * 120,
                color: cols[i % cols.length],
                size: 5 + Math.random() * 5,
                shape: 'r',
                rot: Math.random() * 6,
                vr: (Math.random() - 0.5) * 8,
                g: 180,
                decay: 0.32,
            });
        }
    }

    // ---------- context effects ----------
    pickup(target) {
        if (!target) return;
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        if (el.classList) {
            el.classList.remove('fx-pickup');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-pickup');
            this._setTimeout(() => el.classList && el.classList.remove('fx-pickup'), 250);
        }
        const [x, y] = this._targetCenter(el);
        this._puff(x, y, '#ffd15c', 5);
        this._puff(x, y, 'rgba(255,253,247,.9)', 5);
    }

    land(target) {
        if (!target) return;
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        if (el.classList) {
            el.classList.remove('fx-land');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-land');
            this._setTimeout(() => el.classList && el.classList.remove('fx-land'), 300);
        }
        const [x, y] = this._targetCenter(el);
        this._puff(x, y, 'rgba(255,255,255,.9)', 8);
    }

    invalid(target, message) {
        if (!target) return;
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        if (el.classList) {
            el.classList.remove('fx-invalid');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-invalid');
            this._setTimeout(() => el.classList && el.classList.remove('fx-invalid'), 450);
        }
        if (message) this.toast(message);
    }

    pack(target) {
        if (!target) return;
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        if (el.classList) {
            el.classList.remove('fx-pack');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-pack');
            this._setTimeout(() => el.classList && el.classList.remove('fx-pack'), 350);
        }
        const [x, y] = this._targetCenter(el);
        this._puff(x, y, 'rgba(255,255,255,.9)', 8);
        this._burst(x, y, ['#ffd15c', '#ff8a3d', '#fffdf7'], 12, 220);
    }

    delivery(target) {
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        if (el && el.classList) {
            el.classList.remove('fx-delivery');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-delivery');
            this._setTimeout(() => el.classList && el.classList.remove('fx-delivery'), 450);
        }
        let x = (this._stageW || 0) / 2;
        let y = (this._stageH || 0) / 2;
        if (el) {
            const c = this._targetCenter(el);
            x = c[0];
            y = c[1];
        }
        this._burst(x, y, ['#ffd15c', '#fffdf7', '#ff8a3d', '#4fae5a'], 14, 220);
    }

    booster(kind, target) {
        this._ensureCanvas();
        const el = target;
        this._trackTarget(el);
        const cls = 'fx-booster-' + String(kind || 'default').replace(/[^a-z0-9_-]/gi, '');
        if (el && el.classList) {
            el.classList.add(cls);
            this._setTimeout(() => el.classList && el.classList.remove(cls), 450);
        }
        let x = (this._stageW || 0) / 2;
        let y = (this._stageH || 0) / 2;
        if (el) {
            const c = this._targetCenter(el);
            x = c[0];
            y = c[1];
        }
        const colors = kind === 'freeze' ? ['#8fd0ff', '#cfeeff', '#fffdf7'] : kind === 'shuffle' ? ['#4fae5a', '#a8e6a3', '#fffdf7'] : kind === 'extra' ? ['#ffd15c', '#ffb347', '#fffdf7'] : kind === 'remove' ? ['#e4574b', '#ff8a3d', '#fffdf7'] : ['#ff8a3d', '#ffd15c', '#fffdf7'];
        this._burst(x, y, colors, 20, 220);
    }

    warning(target) {
        if (target) {
            const el = target;
            this._trackTarget(el);
            if (el.classList) {
                el.classList.remove('fx-warning');
                try { void el.offsetWidth; } catch (_) {}
                el.classList.add('fx-warning');
                this._setTimeout(() => el.classList && el.classList.remove('fx-warning'), 450);
            }
        }
        const el = this.gameContainer;
        this._trackTarget(el);
        if (el && el.classList) {
            el.classList.add('fx-warning-stage');
            this._setTimeout(() => el && el.classList.remove('fx-warning-stage'), 450);
        }
        this.toast('Hàng chờ sắp đầy — ưu tiên khay đang chờ.');
    }

    lose(reason) {
        const el = this.gameContainer;
        this._trackTarget(el);
        if (el && el.classList) {
            el.classList.remove('fx-quake');
            try { void el.offsetWidth; } catch (_) {}
            el.classList.add('fx-quake');
            this._setTimeout(() => el && el.classList.remove('fx-quake'), 250);
        }
        if (reason) this.toast(reason);
    }

    toast(message) {
        if (!message) return;
        const el = document.createElement('div');
        el.className = 'fx-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.textContent = String(message);
        const parent = this.gameContainer || document.body;
        parent.appendChild(el);
        this._track(el);
        if (this._toastTimer) { clearTimeout(this._toastTimer); this.timers.delete(this._toastTimer); }
        if (this._toastEl && this._toastEl !== el) this._removeNode(this._toastEl);
        this._toastEl = el;
        this._toastTimer = this._setTimeout(() => {
            this._removeNode(el);
            if (this._toastEl === el) { this._toastEl = null; this._toastTimer = null; }
        }, 1500);
    }

    trail(clientX, clientY, color = '#ffd15c') {
        if (this._reducedMotion()) return;
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - this.lastTrail < TRAIL_THROTTLE) return;
        this.lastTrail = now;
        this._ensureCanvas();
        const [x, y] = this._toLocal(clientX, clientY);
        this._emit({
            x, y,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            color,
            size: 3 + Math.random() * 3,
            g: 0,
            decay: 3,
        });
    }

    _removeNode(el) {
        if (!el) return;
        try { el.remove && el.remove(); } catch (_) {}
        this.nodes.delete(el);
        if (this._toastEl === el) this._toastEl = null;
    }

    reset() {
        if (this.rafId != null) {
            try { window.cancelAnimationFrame(this.rafId); } catch (_) {}
            this.rafId = null;
        }
        this.particles.length = 0;
        this.lastTs = 0;
        this.lastTrail = 0;
        if (this.ctx && this.canvas) {
            try { this.ctx.clearRect(0, 0, this._stageW || this.canvas.width, this._stageH || this.canvas.height); } catch (_) {}
        }
        this._bumpCount();
        for (const id of Array.from(this.timers)) {
            try { clearTimeout(id); } catch (_) {}
        }
        this.timers.clear();
        this._toastTimer = null;
        for (const a of Array.from(this.anims)) {
            try { a.cancel && a.cancel(); } catch (_) {}
        }
        this.anims.clear();
        for (const el of Array.from(this.effectTargets)) {
            if (el && el.classList) {
                el.classList.remove('bump', 'fx-pickup', 'fx-land', 'fx-invalid', 'fx-pack', 'fx-delivery', 'fx-warning', 'fx-warning-stage', 'fx-quake', 'fx-booster-freeze', 'fx-booster-shuffle', 'fx-booster-extra', 'fx-booster-remove', 'vfx-confetti-fallback');
            }
        }
        this.effectTargets.clear();
        for (const el of Array.from(this.nodes)) {
            if (el && el.classList) {
                el.classList.remove('factory-praise', 'fx-toast', 'fx-pickup', 'fx-land', 'fx-invalid', 'fx-pack', 'fx-delivery', 'fx-warning', 'bump');
            }
            this._removeNode(el);
        }
        this.nodes.clear();
        this._toastEl = null;
    }
}

/**
 * Combo ladder (unchanged tiers, warm palette, no emoji tags).
 */
VFXManager.COMBO_TIERS = [
    { at: 1, scale: 1.00, color: '#fffdf7' },
    { at: 2, scale: 1.14, color: '#ffd15c' },
    { at: 3, scale: 1.30, color: '#ff8a3d' },
    { at: 4, scale: 1.48, color: '#4fae5a' },
    { at: 5, scale: 1.68, color: '#e4574b' },
];

VFXManager.prototype.getTier = function (combo) {
    const tiers = VFXManager.COMBO_TIERS;
    let t = tiers[0];
    for (let i = 0; i < tiers.length; i++) {
        if (combo >= tiers[i].at) t = tiers[i];
    }
    return t;
};
