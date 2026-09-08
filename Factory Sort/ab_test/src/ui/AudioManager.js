/**
 * AudioManager.js
 * Hệ thống âm thanh tổng hợp 100% bằng Web Audio API thuần (Zero external files).
 * Mô phỏng âm thanh cơ khí nhà máy, băng chuyền, đóng gói và chuông xuất xưởng.
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.on = this._loadPref();
        this._initialized = false;
    }

    _loadPref() {
        try {
            const saved = localStorage.getItem('fs_sound');
            return saved === null ? true : saved === 'true';
        } catch (_) {
            return true;
        }
    }

    _savePref(val) {
        try {
            localStorage.setItem('fs_sound', val ? 'true' : 'false');
        } catch (_) {}
    }

    ensure() {
        if (!this.ctx) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.85;
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.value = this.on ? 1 : 0;
                this.sfxGain.connect(this.masterGain);
                this._initialized = true;
            } catch (e) {
                console.warn('AudioContext not supported or blocked:', e);
                return;
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    setSound(val) {
        this.on = !!val;
        this._savePref(this.on);
        this.ensure();
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.on ? 1 : 0, this.ctx.currentTime, 0.04);
        }
    }

    toggle() {
        this.setSound(!this.on);
        return this.on;
    }

    /**
     * Phát 1 xung âm với tần số, thời lượng, dạng sóng và trượt tần số tuỳ biến
     */
    blip(freq, duration, type = 'sine', gain = 0.08, delay = 0, slideTo = null) {
        if (!this.on) return;
        this.ensure();
        if (!this.ctx || !this.sfxGain) return;

        const t = this.ctx.currentTime + (delay || 0);
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + duration);
        }

        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + duration + 0.03);
    }

    /** Chạm vào món đồ trong thùng (Click cơ khí nhẹ) */
    tap() {
        this.blip(520, 0.05, 'triangle', 0.06);
        this.blip(1040, 0.03, 'sine', 0.03);
    }

    /** Đặt món đồ vào thùng đích thành công (Servo cơ khí trượt) */
    swap() {
        this.blip(380, 0.08, 'triangle', 0.07, 0, 560);
        this.blip(820, 0.06, 'sine', 0.03, 0.02);
    }

    /** Thùng đủ 3 món -> Đóng gói & dán băng keo (Tiếng pop áp suất khí nén) */
    wrap() {
        this.blip(450, 0.12, 'sawtooth', 0.05, 0, 220);
        this.blip(720, 0.16, 'triangle', 0.09, 0.04, 1150);
        this.blip(1440, 0.18, 'sine', 0.04, 0.08);
    }

    /** Thao tác sai hoặc ô không thể thả (Buzzer cảnh báo xưởng) */
    reject() {
        this.blip(180, 0.16, 'sawtooth', 0.07, 0, 110);
        this.blip(130, 0.22, 'triangle', 0.08, 0.04);
    }

    /** Khay trên băng chuyền nhận thùng hàng (Tiếng chốt khóa & chuông xuất xưởng) */
    deliver() {
        this.blip(660, 0.12, 'triangle', 0.08);
        this.blip(1320, 0.22, 'sine', 0.07, 0.04);
    }

    /** Tiếng băng chuyền chạy đưa thùng hàng trượt xuống */
    conveyorRoll() {
        this.blip(180, 0.18, 'triangle', 0.05, 0, 120);
        this.blip(280, 0.12, 'sawtooth', 0.02, 0.02, 200);
    }

    /**
     * Dãy chuông combo khi xuất hàng liên tiếp
     * Càng nhiều combo, nốt nhạc càng cao và trong trẻo
     */
    combo(step = 1) {
        const k = Math.min(Math.max(1, step), 6);
        const freqs = [1046.5, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3];
        const f = freqs[k - 1] || 1568.0;

        this.blip(f * 0.5, 0.22, 'triangle', 0.08);
        this.blip(f, 0.32, 'sine', 0.08, 0.03);
        this.blip(f * 1.5, 0.26, 'sine', 0.04, 0.08);
    }

    /** Sao thưởng chiến thắng (Chime kim loại rực rỡ) */
    star(idx = 0) {
        const f = [784, 988, 1319][idx] || 1319;
        this.blip(f, 0.26, 'sine', 0.09, idx * 0.12);
        this.blip(f * 1.5, 0.24, 'triangle', 0.04, idx * 0.12 + 0.04);
    }

    /** Thắng toàn màn - Khúc hoan ca xuất xưởng 5 nốt + hồi còi ngân vang */
    win() {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((f, i) => {
            this.blip(f, 0.32, 'triangle', 0.07, i * 0.09);
            this.blip(f * 2, 0.38, 'sine', 0.04, i * 0.09 + 0.03);
        });
        this.blip(2093, 0.6, 'sine', 0.06, 0.5);
        this.blip(2637, 0.7, 'sine', 0.04, 0.6);
    }

    /** Thua - Dây chuyền quá tải tắt máy (Hợp âm hạ dần) */
    lose() {
        [370, 311, 247].forEach((f, i) => {
            this.blip(f, 0.38, 'sawtooth', 0.06, i * 0.18, f * 0.85);
        });
    }
}
