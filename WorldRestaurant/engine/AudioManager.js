export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(frequency, type, duration, vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playMove() {
        this.init();
        if (!this.ctx) return;
        this.playTone(150, 'triangle', 0.1, 0.05);
    }

    playBump() {
        this.init();
        if (!this.ctx) return;
        this.playTone(80, 'square', 0.15, 0.1);
        if (navigator.vibrate) navigator.vibrate(30);
    }

    playGrow(level) {
        this.init();
        if (!this.ctx) return;
        // Pitch goes up as level increases
        const freq = 300 + (level * 150);
        this.playTone(freq, 'sine', 0.15, 0.1);
        
        // Slight delay for a 'bloop' effect
        setTimeout(() => {
            this.playTone(freq * 1.2, 'sine', 0.15, 0.1);
        }, 50);
        
        if (navigator.vibrate) navigator.vibrate(15);
    }

    playSplit() {
        this.init();
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
        
        if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
    }

    playWin() {
        this.init();
        if (!this.ctx) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        let time = this.ctx.currentTime;
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + 0.3);
            
            time += 0.15;
        });
        
        if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 150]);
    }
}
