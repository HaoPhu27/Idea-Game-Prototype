/**
 * VFXManager.js
 * Presentation-only visual feedback for the Sort&Ship feel.
 * Warm reference palette: #ffd15c / #ff8a3d / #fffdf7 / #4fae5a / #e4574b
 * No neon rings/glow, no mechanical emoji ladder, no fabricated score/coin.
 * Effects only self-remove nodes. No game callbacks/state/input/timers.
 */

export class VFXManager {
    constructor() {
        this.container = document.getElementById('play-area') || document.body;
        this.gameContainer = document.getElementById('game-container') || document.body;
        this.PALETTE = ['#ffd15c', '#ff8a3d', '#fffdf7', '#4fae5a', '#e4574b'];
    }

    _reducedMotion() {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (_) {
            return false;
        }
    }

    /**
     * Bảng bậc thang Combo (Combo Ladder)
     * Warm reference palette, no neon glow, no emoji tags.
     */
    static get COMBO_TIERS() {
        return [
            { at: 1, scale: 1.00, color: '#fffdf7' },
            { at: 2, scale: 1.14, color: '#ffd15c' },
            { at: 3, scale: 1.30, color: '#ff8a3d' },
            { at: 4, scale: 1.48, color: '#4fae5a' },
            { at: 5, scale: 1.68, color: '#e4574b' },
        ];
    }

    getTier(combo) {
        const tiers = VFXManager.COMBO_TIERS;
        let t = tiers[0];
        for (const item of tiers) {
            if (combo >= item.at) t = item;
        }
        return t;
    }

    /**
     * Chữ khen thưởng bay lên (outlined brown/orange floating text).
     * No score/coin fabricated, no emoji tier tags appended.
     */
    praise(target, text, combo = 1) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const n = Math.max(1, combo || 1);
        const tier = this.getTier(n);

        const el = document.createElement('div');
        el.className = 'factory-praise';
        el.textContent = text || '';

        el.style.setProperty('--pz', tier.scale);
        el.style.setProperty('--pc', tier.color);

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;

        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;

        if (this._reducedMotion()) {
            el.style.animation = 'none';
            el.style.opacity = '1';
        }

        this.gameContainer.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    /**
     * Round paper particle burst (8-14 particles) from actual target.
     * Soft/simple thin ring only - no neon glow ring.
     * Uses custom --dx/--dy props, sizes 3-6px, bounded count, cleanup 750ms.
     */
    burst(target, color = '#ffd15c', count = 10) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;
        const radius = Math.max(22, Math.min(rect.width, rect.height) * 0.45);

        const reduced = this._reducedMotion();

        // Soft simple thin ring (not flashy / not neon glow)
        if (!reduced) {
            const ring = document.createElement('div');
            ring.className = 'vfx-ring';
            ring.style.left = `${cx}px`;
            ring.style.top = `${cy}px`;
            ring.style.width = `${radius}px`;
            ring.style.height = `${radius}px`;
            ring.style.border = '2px solid #ffd15c';
            ring.style.opacity = '0.5';
            this.gameContainer.appendChild(ring);
            setTimeout(() => ring.remove(), 750);
        }

        // Bounded round paper particles (8-14)
        const raw = Math.round(count || 10);
        const N = Math.max(8, Math.min(14, raw));
        const palette = (color && this.PALETTE.includes(color)) ? [color] : this.PALETTE;

        for (let k = 0; k < N; k++) {
            const angle = (Math.PI * 2 * k) / N + (Math.random() * 0.4 - 0.2);
            const dist = radius * (1.2 + Math.random() * 0.9);
            const dx = (Math.cos(angle) * dist).toFixed(1);
            const dy = (Math.sin(angle) * dist).toFixed(1);
            const size = (3 + Math.random() * 3).toFixed(1);

            const spark = document.createElement('div');
            spark.className = 'vfx-spark';
            spark.style.left = `${cx}px`;
            spark.style.top = `${cy}px`;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.borderRadius = '50%';
            spark.style.backgroundColor = palette[k % palette.length];
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);

            if (reduced) {
                spark.style.animation = 'none';
                spark.style.opacity = '0';
            } else {
                spark.style.animationDelay = `${(Math.random() * 0.05).toFixed(2)}s`;
            }

            this.gameContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 750);
        }
    }

    /**
     * Hiệu ứng nảy đàn hồi (Bump) ~ .45s, respects prefers-reduced-motion.
     */
    bump(elOrId) {
        const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) return;
        el.classList.remove('bump');
        void el.offsetWidth; // Force reflow
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 450);
    }

    /**
     * Warm paper confetti (36 rectangles), safe cleanup unchanged.
     */
    confetti(container = null) {
        const parent = container || this.gameContainer || document.body;
        const colors = ['#ffd15c', '#ff8a3d', '#fffdf7', '#4fae5a', '#e4574b'];
        const COUNT = 36;
        const reduced = this._reducedMotion();

        for (let i = 0; i < COUNT; i++) {
            const conf = document.createElement('div');
            conf.className = 'vfx-confetti';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.6;
            const duration = 1.4 + Math.random() * 1.0;
            const sizeW = 6 + Math.random() * 6;
            const sizeH = 10 + Math.random() * 8;

            conf.style.left = `${left}%`;
            conf.style.top = '-20px';
            conf.style.width = `${sizeW}px`;
            conf.style.height = `${sizeH}px`;
            conf.style.backgroundColor = color;
            conf.style.animationDuration = `${duration}s`;
            conf.style.animationDelay = `${delay}s`;
            conf.style.transform = `rotate(${Math.random() * 360}deg)`;

            if (reduced) {
                conf.style.animation = 'none';
                conf.style.opacity = '0';
            }

            parent.appendChild(conf);
            setTimeout(() => conf.remove(), (duration + delay) * 1000 + 100);
        }
    }
}
