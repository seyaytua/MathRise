/**
 * サウンドマネージャー
 * Switchの効果音を再現
 */
class SoundManager {
    constructor() {
        this.sounds = {
            select: this.createSound(800, 0.1, 'sine'),      // 選択音「ポン」
            hover: this.createSound(600, 0.05, 'sine'),      // ホバー音
            confirm: this.createSound(1000, 0.15, 'square'), // 決定音
            achievement: this.createMultiSound([523, 659, 784], 0.2), // 実績解除音
            error: this.createSound(200, 0.2, 'sawtooth'),   // エラー音
            theme: this.createSound(700, 0.1, 'triangle')    // テーマ切り替え音
        };
        
        this.enabled = this.loadSoundPreference();
        this.audioContext = null;
    }
    
    /**
     * Web Audio APIで音を生成
     */
    createSound(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + duration
            );
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    /**
     * 複数音を連続再生（実績用）
     */
    createMultiSound(frequencies, duration) {
        return () => {
            if (!this.enabled) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createSound(freq, duration / frequencies.length)();
                }, (duration * 1000 / frequencies.length) * index);
            });
        };
    }
    
    /**
     * 音を再生
     */
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    /**
     * サウンドのON/OFF切り替え
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('mathrise_sound_enabled', this.enabled);
        return this.enabled;
    }
    
    /**
     * サウンド設定を読み込み
     */
    loadSoundPreference() {
        const saved = localStorage.getItem('mathrise_sound_enabled');
        return saved === null ? true : saved === 'true';
    }
}

// グローバルインスタンス
const soundManager = new SoundManager();
