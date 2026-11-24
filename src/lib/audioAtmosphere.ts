// Procedural Luxury Atelier Audio Atmosphere using Web Audio API
// Self-contained: creates soothing Parisian atelier rain ambiance and gentle crystal chime tones.

class AtelierAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private rainGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private listeners: ((playing: boolean) => void)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.isPlaying) return;

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      // Procedural soft rain / warm atmosphere buffer
      const bufferSize = this.ctx.sampleRate * 4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate brown/pink noise (soft, warm, like rain on glass)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      // Dual filters for soothing warmth
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(550, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(80, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      this.noiseSource.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);

      this.noiseSource.start();
      this.isPlaying = true;
      this.notify();

      // Play introductory gentle crystal chime
      this.playChime(528, 0.15);
    } catch {
      this.isPlaying = false;
      this.notify();
    }
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) {
      this.isPlaying = false;
      this.notify();
      return;
    }
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      setTimeout(() => {
        try {
          if (this.noiseSource) {
            this.noiseSource.stop();
            this.noiseSource.disconnect();
            this.noiseSource = null;
          }
        } catch {
          // ignore
        }
        this.isPlaying = false;
        this.notify();
      }, 1250);
    } catch {
      this.isPlaying = false;
      this.notify();
    }
  }

  public playChime(freq = 528, volume = 0.12) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.502, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 2.9);
      osc2.stop(now + 2.9);
    } catch {
      // ignore
    }
  }
}

export const atelierAudio = new AtelierAudioEngine();
