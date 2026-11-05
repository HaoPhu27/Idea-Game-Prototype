/**
 * AudioManager.js
 * Hệ thống âm thanh tổng hợp 100% bằng Web Audio API thuần (Zero external files).
 * Presentation layer only - no game state, callbacks, input or timers here.
 * Reference feedback palette recreates the Sort&Ship feel.
 *
 * Reference sound mappings:
 *   tap            -> 900Hz square .06s gain .08
 *   swap           -> 220->140 triangle .09s .2 (drop)  [+ tiny noise optional]
 *   reject         -> 200->150 saw .14s .12
 *   wrap           -> 320->1000 sine .16s .25 + 1300 triangle .08s .1 delayed .12
 *   deliver/combo  -> [523,659,784,1046] triangle .28s spaced .08 (combo pitch scales, max 6)
 *   win            -> [523,659,784,1046,784,1046,1318] triangle .3s spaced .11
 *   lose           -> 420->140 saw .5s .18 + 300->90 triangle .6s .14 at .1
 *   star           -> 1568 sine .3s .2
 * No autoplay BGM. ctx / sfxGain kept safe.
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

    /**
     * Tap / pickup: click tone 900Hz square .06s gain .08 (reference)
     */
    tap() {
        this.blip(900, 0.06, 'square', 0.08);
    }

    /**
     * Swap / drop: 220->140 triangle .09s .2 (reference) + tiny noise sparkle
     */
    swap() {
        this.blip(220, 0.09, 'triangle', 0.2, 0, 140);
        this.blip(1500, 0.02, 'square', 0.02, 0.01);
    }

    /**
     * Reject: 200->150 saw .14s .12 (reference)
     */
    reject() {
        this.blip(200, 0.14, 'sawtooth', 0.12, 0, 150);
    }

    /**
     * Wrap: 320->1000 sine .16s .25 + 1300 triangle .08s .1 delayed .12 (reference)
     */
    wrap() {
        this.blip(320, 0.16, 'sine', 0.25, 0, 1000);
        this.blip(1300, 0.08, 'triangle', 0.1, 0.12);
    }

    /**
     * Deliver / order done: [523,659,784,1046] triangle .28s spaced .08 (reference)
     */
    deliver() {
        const notes = [523, 659, 784, 1046];
        notes.forEach((f, i) => {
            this.blip(f, 0.28, 'triangle', 0.18, i * 0.08);
        });
    }

    /**
     * Tiếng băng chuyền cơ khí chạy đưa thùng hàng trượt lên (presentation)
     */
    conveyorRoll() {
        this.blip(160, 0.75, 'triangle', 0.05, 0, 120);
        this.blip(220, 0.60, 'sawtooth', 0.02, 0.04, 180);
    }

    /**
     * Combo: deliver order-done chord with slight pitch scale, max 6 (reference acceptable)
     */
    combo(step = 1) {
        const k = Math.min(Math.max(1, step), 6);
        const scale = 1 + (k - 1) * 0.06;
        const base = [523, 659, 784, 1046];
        base.forEach((f, i) => {
            this.blip(f * scale, 0.28, 'triangle', 0.18, i * 0.08);
        });
    }

    /**
     * Star: 1568 sine .3s .2 (reference)
     */
    star(idx = 0) {
        const delay = (idx || 0) * 0.12;
        this.blip(1568, 0.3, 'sine', 0.2, delay);
    }

    /**
     * Win: [523,659,784,1046,784,1046,1318] triangle .3s spaced .11 (reference)
     */
    win() {
        const seq = [523, 659, 784, 1046, 784, 1046, 1318];
        seq.forEach((f, i) => {
            this.blip(f, 0.3, 'triangle', 0.18, i * 0.11);
        });
    }

    /**
     * Lose: 420->140 saw .5s .18 + 300->90 triangle .6s .14 at .1 (reference)
     */
    lose() {
        this.blip(420, 0.5, 'sawtooth', 0.18, 0, 140);
        this.blip(300, 0.6, 'triangle', 0.14, 0.1, 90);
    }
}
