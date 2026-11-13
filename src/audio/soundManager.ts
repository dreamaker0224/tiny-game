/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Check saved mute preference
    const savedMute = localStorage.getItem('sweet_stack_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('sweet_stack_muted', muted ? 'true' : 'false');
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Sound played when pendulum drops dessert
   */
  public playDropSwoosh() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played when dessert lands (Perfect or Sliced)
   */
  public playLand(isPerfect: boolean, combo: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (isPerfect) {
        // Pentatonic scale frequencies for escalating chimes
        const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
        const freq = scale[Math.min(combo, scale.length - 1)];

        // Main bell chime
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.01, now); // sparkling overtone

        gain.gain.setValueAtTime(0.35 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);

        // Extra twinkle if high combo
        if (combo >= 4) {
          const osc3 = this.ctx.createOscillator();
          const gain3 = this.ctx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(freq * 1.5, now + 0.05);
          gain3.gain.setValueAtTime(0.15 * this.volume, now + 0.05);
          gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc3.connect(gain3);
          gain3.connect(this.ctx.destination);
          osc3.start(now + 0.05);
          osc3.stop(now + 0.36);
        }
      } else {
        // Crisp slice "snip-pop"
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

        gain.gain.setValueAtTime(0.28 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);

        // Soft thump
        const thump = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(140, now);
        thump.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        thumpGain.gain.setValueAtTime(0.2 * this.volume, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        thump.connect(thumpGain);
        thumpGain.connect(this.ctx.destination);
        thump.start(now);
        thump.stop(now + 0.16);
      }
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played when entering Fever Mode
   */
  public playFever() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C major celebratory arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const time = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.25 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(time);
        osc.stop(time + 0.45);
      });
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played when the block completely misses
   */
  public playMiss() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Descending whistle/slide
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);

      // Low crash thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(110, now + 0.2);
      thud.frequency.exponentialRampToValueAtTime(40, now + 0.55);
      thudGain.gain.setValueAtTime(0.4 * this.volume, now + 0.2);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(now + 0.2);
      thud.stop(now + 0.6);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played for UI buttons
   */
  public playTap() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(290, now + 0.05);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played when activating a power-up item
   */
  public playPowerUp(type: 'slow' | 'magnet' | 'widen') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'slow') {
        // Time-warp descending shimmer
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
        gain.gain.setValueAtTime(0.25 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === 'magnet') {
        // Futuristic magnetic lock-on double beep
        [660, 990].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + i * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.22 * this.volume, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t);
          osc.stop(t + 0.18);
        });
      } else {
        // Steel expansion hydraulic boost
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.24);
        gain.gain.setValueAtTime(0.26 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.27);
      }
    } catch {
      // Audio safety fallback
    }
  }

  /**
   * Sound played when collecting a bonus item
   */
  public playItemGet() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [784, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.055;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.22 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch {
      // Audio safety fallback
    }
  }
}

export const soundManager = new SoundManager();
