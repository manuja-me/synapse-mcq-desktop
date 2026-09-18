// High-performance synthesized Web Audio API sound effects
// 0 audio files, 0 network requests, 0 asset footprint, <0.01 MB RAM

class AudioFxEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    const saved = localStorage.getItem('synapse_sound_muted');
    this.muted = saved === 'true';
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('synapse_sound_muted', String(this.muted));
    return this.muted;
  }

  public setMute(muted: boolean) {
    this.muted = muted;
    localStorage.setItem('synapse_sound_muted', String(this.muted));
  }

  /**
   * Tactile micro-click for snappy UI navigation (10ms)
   */
  public playTick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.015);
    } catch {
      // Audio context policy safe fallback
    }
  }

  /**
   * Ascending harmonic chime for correct answers, scaling in pitch with streak level
   */
  public playCorrect(streakLevel: number = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = streakLevel >= 5 ? 659.25 : streakLevel >= 3 ? 587.33 : 523.25; // C5, D5, E5
      const highFreq = baseFreq * 1.5; // Perfect fifth / octave harmonic

      // Primary tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(highFreq, now + 0.08);

      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Sparkle overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(highFreq, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(highFreq * 1.33, now + 0.18);

      gain2.gain.setValueAtTime(0.06, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.18);
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Soft, muted double-thud for incorrect answers
   */
  public playWrong() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Celebratory ascending arpeggio for combo milestones (3x, 5x, 10x streaks)
   */
  public playStreakMilestone() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const start = now + i * 0.045;
        const dur = 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Victory fanfare on exam completion
   */
  public playVictory() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25], time: 0, dur: 0.15 },
        { freqs: [659.25, 783.99], time: 0.15, dur: 0.15 },
        { freqs: [783.99, 1046.5], time: 0.3, dur: 0.35 },
      ];

      chords.forEach((chord) => {
        chord.freqs.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          const start = now + chord.time;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.1, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(start);
          osc.stop(start + chord.dur);
        });
      });
    } catch {
      // Audio policy safe
    }
  }
}

export const audioFx = new AudioFxEngine();
