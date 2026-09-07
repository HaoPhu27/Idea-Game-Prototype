/**
 * VFXManager.js
 * Hệ thống hiệu ứng hình ảnh động (Juicy visual effects) học hỏi từ Hexameow:
 * - Floating praise text (Chữ nổi khen thưởng + Combo ladder)
 * - Shockwave ring & Spark bursts (Vòng năng lượng & tia sáng cơ khí)
 * - HUD Bump animations (Nảy số chỉ số mượt mà)
 * - Confetti mừng thắng lợi ca làm việc
 */

export class VFXManager {
    constructor() {
        this.container = document.getElementById('play-area') || document.body;
        this.gameContainer = document.getElementById('game-container') || document.body;
    }

    /**
     * Bảng bậc thang Combo (Combo Ladder)
     * Thang bậc càng cao -> Font càng lớn, màu càng rực và phát sáng neon
     */
    static get COMBO_TIERS() {
        return [
            { at: 1, scale: 1.00, color: '#38bdf8', glow: '8px',  tag: '' },
            { at: 2, scale: 1.15, color: '#f59e0b', glow: '12px', tag: '⚡' },
            { at: 3, scale: 1.32, color: '#10b981', glow: '16px', tag: '🔥' },
            { at: 4, scale: 1.52, color: '#f97316', glow: '22px', tag: '🚀' },
            { at: 5, scale: 1.76, color: '#ec4899', glow: '28px', tag: '👑' },
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
     * Hiển thị chữ khen thưởng bay lên tại tọa độ của một DOM element hoặc Rect
     * @param {HTMLElement|DOMRect} target
     * @param {string} text Nội dung hiển thị (vd: "ĐÓNG GÓI! 📦", "XUẤT XƯỞNG! 🚚")
     * @param {number} combo Số chuỗi combo
     */
    praise(target, text, combo = 1) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const n = Math.max(1, combo || 1);
        const tier = this.getTier(n);

        const el = document.createElement('div');
        el.className = `factory-praise praise-t${Math.min(n, 5)}`;
        el.textContent = tier.tag ? `${text} ${tier.tag}` : text;

        el.style.setProperty('--pz', tier.scale);
        el.style.setProperty('--pc', tier.color);
        el.style.setProperty('--pg', tier.glow);

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;

        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;

        this.gameContainer.appendChild(el);
        setTimeout(() => el.remove(), 1100);
    }

    /**
     * Vòng xung kích sóng lan tỏa (Shockwave ring) + tia sáng (Sparks)
     * @param {HTMLElement|DOMRect} target
     * @param {string} color Mã màu viền và tia sáng
     * @param {number} count Số lượng tia sáng
     */
    burst(target, color = '#38bdf8', count = 12) {
        if (!target) return;
        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : target;
        const parentRect = this.gameContainer.getBoundingClientRect();

        const cx = (rect.left - parentRect.left) + rect.width / 2;
        const cy = (rect.top - parentRect.top) + rect.height / 2;
        const radius = Math.max(26, Math.min(rect.width, rect.height) * 0.45);

        // 1. Shockwave Ring
        const ring = document.createElement('div');
        ring.className = 'vfx-ring';
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        ring.style.borderColor = color;
        this.gameContainer.appendChild(ring);
        setTimeout(() => ring.remove(), 650);

        // 2. Radial Sparks
        const N = count || 12;
        for (let k = 0; k < N; k++) {
            const angle = (Math.PI * 2 * k) / N + (Math.random() * 0.4 - 0.2);
            const dist = radius * (1.2 + Math.random() * 0.9);
            const dx = (Math.cos(angle) * dist).toFixed(1);
            const dy = (Math.sin(angle) * dist).toFixed(1);
            const size = (4 + Math.random() * 4).toFixed(1);

            const spark = document.createElement('div');
            spark.className = 'vfx-spark';
            spark.style.left = `${cx}px`;
            spark.style.top = `${cy}px`;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            spark.style.backgroundColor = color;
            spark.style.setProperty('--dx', `${dx}px`);
            spark.style.setProperty('--dy', `${dy}px`);
            spark.style.animationDelay = `${(Math.random() * 0.05).toFixed(2)}s`;

            this.gameContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 750);
        }
    }

    /**
     * Hiệu ứng nảy đàn hồi (Bump) cho các chỉ số HUD
     * @param {HTMLElement|string} elOrId
     */
    bump(elOrId) {
        const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
        if (!el) return;
        el.classList.remove('bump');
        void el.offsetWidth; // Force reflow
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 260);
    }

    /**
     * Mưa giấy màu / pháo hoa ăn mừng khi hoàn thành ca làm việc (Win Screen)
     */
    confetti(container = null) {
        const parent = container || this.gameContainer || document.body;
        const colors = ['#f59e0b', '#38bdf8', '#10b981', '#ec4899', '#f97316', '#a855f7'];
        const COUNT = 36;

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

            parent.appendChild(conf);
            setTimeout(() => conf.remove(), (duration + delay) * 1000 + 100);
        }
    }
}
