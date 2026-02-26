/* ═══════════════════════════════════════════════════════════════════════
   AMBIENT SOUNDSCAPE ENGINE — Procedural cyberpunk atmosphere
   ──────────────────────────────────────────────────────────────────────
   A layered Web Audio API synthesizer that creates an evolving,
   atmospheric cyberpunk ambient pad. Designed to start during boot
   and run continuously, ducking when room assembly sounds play.

   Layers:
   ┌────────────────────────────────────────────────────────────────────┐
   │ L1  Sub-bass drone        55Hz sine + 55.2Hz (beating)           │
   │ L2  Dark pad chord        Am7 voicing (A2,C3,E3,G3) saw→LP      │
   │ L3  Shimmer pad           High octave A5,E5 triangle, slow LFO   │
   │ L4  Digital rain           Random pentatonic pings, sine plucks   │
   │ L5  Noise floor           Band-filtered white noise (city hum)   │
   │ L6  Data blips            Occasional high sine bursts             │
   │ L7  Breath LFO            Master volume slow-breathe modulation  │
   └────────────────────────────────────────────────────────────────────┘

   API:
     const ambient = new AmbientSoundscape();
     ambient.start();        // Begin playback (handles autoplay)
     ambient.duck();         // Reduce volume for room transitions
     ambient.unduck();       // Restore volume
     ambient.fadeOut(2);     // Fade to silence over 2s
     ambient.stop();         // Kill everything immediately

   Key design decisions:
   • Master volume is LOW (~0.12) — felt more than heard
   • Uses a shared AudioContext that persists
   • All oscillators loop indefinitely until stopped
   • Duck/unduck uses smooth 1.5s gain ramps (no clicks)
   • Pentatonic scale in A minor for safe dissonance-free randomness
   ═══════════════════════════════════════════════════════════════════════ */

// A minor pentatonic: A, C, D, E, G across octaves 3–6
const PENTA_FREQS = [
  // Octave 3
  220.00, 261.63, 293.66, 329.63, 392.00,
  // Octave 4
  440.00, 523.25, 587.33, 659.25, 783.99,
  // Octave 5
  880.00, 1046.50, 1174.66, 1318.51, 1567.98,
  // Octave 6 (sparkle)
  1760.00, 2093.00,
];

export class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private nodes: AudioNode[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private pingTimer: ReturnType<typeof setTimeout> | null = null;
  private blipTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private ducked = false;
  private normalGain = 0.12;
  private duckedGain = 0.02;
  private noiseSrc: AudioBufferSourceNode | null = null;
  private visibilityHandler: (() => void) | null = null;

  /* ── Helpers ─────────────────────────────────────────────────────── */
  private gain(value = 0): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    g.connect(this.masterGain!);
    this.nodes.push(g);
    return g;
  }

  private osc(type: OscillatorType, freq: number, output: GainNode, detune = 0): OscillatorNode {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(output);
    o.start();
    this.oscillators.push(o);
    return o;
  }

  private noiseBuffer(duration: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const len = sr * duration;
    const buf = this.ctx!.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ═════════════════════════════════════════════════════════════════
     START — Create all layers
     ═════════════════════════════════════════════════════════════════ */
  start() {
    if (this.running) return;
    this.running = true;

    try {
      this.ctx = new AudioContext();
    } catch {
      this.running = false;
      return;
    }

    const now = this.ctx.currentTime;

    // Master gain → compressor → destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    // Fade in over 4s
    this.masterGain.gain.linearRampToValueAtTime(this.normalGain, now + 4);

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);
    this.nodes.push(this.compressor);
    this.attachVisibilityHandler();

    /* ───────────────────────────────────────────────────────────────
       LAYER 1: Sub-bass drone — two slightly detuned sine waves
       Creates a slow 0.2Hz "beating" effect at 55Hz (A1)
       ─────────────────────────────────────────────────────────────── */
    const droneG = this.gain(0.35);
    this.osc('sine', 55, droneG);
    this.osc('sine', 55.18, droneG);   // 0.18Hz beat
    // Sub-sub at octave below
    const subG = this.gain(0.18);
    this.osc('sine', 27.5, subG);      // A0

    /* ───────────────────────────────────────────────────────────────
       LAYER 2: Dark pad chord — Am7 (A2, C3, E3, G3)
       Sawtooth → low-pass filter with slow LFO sweep
       ─────────────────────────────────────────────────────────────── */
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 400;
    padFilter.Q.value = 2;
    this.nodes.push(padFilter);

    // LFO to sweep the filter cutoff 300–900Hz over ~12s
    const padLFO = this.ctx.createOscillator();
    padLFO.type = 'sine';
    padLFO.frequency.value = 0.08;  // One cycle per ~12s
    const padLFOGain = this.ctx.createGain();
    padLFOGain.gain.value = 300;    // ±300Hz modulation
    padLFO.connect(padLFOGain);
    padLFOGain.connect(padFilter.frequency);
    padLFO.start();
    this.oscillators.push(padLFO);
    this.nodes.push(padLFOGain);

    const padG = this.ctx.createGain();
    padG.gain.value = 0.06;
    padFilter.connect(padG);
    padG.connect(this.masterGain);
    this.nodes.push(padG);

    const chordFreqs = [110, 130.81, 164.81, 196]; // A2, C3, E3, G3
    chordFreqs.forEach((f, i) => {
      const o = this.ctx!.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4; // slight spread
      o.connect(padFilter);
      o.start();
      this.oscillators.push(o);
    });

    /* ───────────────────────────────────────────────────────────────
       LAYER 3: Shimmer pad — high triangle waves with slow tremolo
       A5 (880) + E5 (659) — ethereal, airy
       ─────────────────────────────────────────────────────────────── */
    const shimmerG = this.gain(0);
    // Fade shimmer in after 6s
    shimmerG.gain.setValueAtTime(0, now);
    shimmerG.gain.linearRampToValueAtTime(0.025, now + 8);

    const shimmerLFO = this.ctx.createOscillator();
    shimmerLFO.type = 'sine';
    shimmerLFO.frequency.value = 0.15; // Slow tremolo
    const shimmerLFOG = this.ctx.createGain();
    shimmerLFOG.gain.value = 0.012;
    shimmerLFO.connect(shimmerLFOG);
    shimmerLFOG.connect(shimmerG.gain);
    shimmerLFO.start();
    this.oscillators.push(shimmerLFO);
    this.nodes.push(shimmerLFOG);

    this.osc('triangle', 880, shimmerG, 5);
    this.osc('triangle', 659.25, shimmerG, -5);

    /* ───────────────────────────────────────────────────────────────
       LAYER 4: Noise floor — bandpass-filtered white noise
       Simulates distant city hum / rain static
       ─────────────────────────────────────────────────────────────── */
    const noiseBuf = this.noiseBuffer(4); // 4s looped
    this.noiseSrc = this.ctx.createBufferSource();
    this.noiseSrc.buffer = noiseBuf;
    this.noiseSrc.loop = true;

    const noiseBPF = this.ctx.createBiquadFilter();
    noiseBPF.type = 'bandpass';
    noiseBPF.frequency.value = 800;
    noiseBPF.Q.value = 0.8;
    this.nodes.push(noiseBPF);

    // Noise LFO — sweeps bandpass center 400–1200Hz
    const noiseLFO = this.ctx.createOscillator();
    noiseLFO.type = 'sine';
    noiseLFO.frequency.value = 0.04; // Very slow
    const noiseLFOG = this.ctx.createGain();
    noiseLFOG.gain.value = 400;
    noiseLFO.connect(noiseLFOG);
    noiseLFOG.connect(noiseBPF.frequency);
    noiseLFO.start();
    this.oscillators.push(noiseLFO);
    this.nodes.push(noiseLFOG);

    const noiseG = this.ctx.createGain();
    noiseG.gain.value = 0.04;
    this.nodes.push(noiseG);

    this.noiseSrc.connect(noiseBPF);
    noiseBPF.connect(noiseG);
    noiseG.connect(this.masterGain);
    this.noiseSrc.start();

    /* ───────────────────────────────────────────────────────────────
       LAYER 5: Digital rain — random pentatonic sine pings
       Short, reverb-ish decay, sporadic timing
       ─────────────────────────────────────────────────────────────── */
    const schedulePing = () => {
      if (!this.running || !this.ctx) return;
      const t = this.ctx.currentTime;

      const freq = PENTA_FREQS[Math.floor(Math.random() * PENTA_FREQS.length)];
      const dur = 0.8 + Math.random() * 1.5;
      const vol = 0.015 + Math.random() * 0.03;

      const pingG = this.ctx.createGain();
      pingG.gain.setValueAtTime(vol, t);
      pingG.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      pingG.connect(this.masterGain!);
      this.nodes.push(pingG);

      const pingO = this.ctx.createOscillator();
      pingO.type = 'sine';
      pingO.frequency.value = freq;
      pingO.connect(pingG);
      pingO.start(t);
      pingO.stop(t + dur + 0.05);

      // Sometimes play a second harmonic ping
      if (Math.random() > 0.6) {
        const harm = freq * (Math.random() > 0.5 ? 1.5 : 2);
        const hG = this.ctx.createGain();
        hG.gain.setValueAtTime(vol * 0.4, t + 0.05);
        hG.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
        hG.connect(this.masterGain!);
        this.nodes.push(hG);

        const hO = this.ctx.createOscillator();
        hO.type = 'sine';
        hO.frequency.value = harm;
        hO.connect(hG);
        hO.start(t + 0.05);
        hO.stop(t + dur * 0.7 + 0.05);
      }

      // Next ping in 1.2–4s
      const delay = 1200 + Math.random() * 2800;
      this.pingTimer = setTimeout(schedulePing, delay);
    };

    // Start pings after 3s
    this.timers.push(setTimeout(schedulePing, 3000));

    /* ───────────────────────────────────────────────────────────────
       LAYER 6: Data blips — short hi-freq bursts (digital texture)
       Like data packets transmitting in the background
       ─────────────────────────────────────────────────────────────── */
    const scheduleBlip = () => {
      if (!this.running || !this.ctx) return;
      const t = this.ctx.currentTime;

      // 2-3 rapid blips in succession
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const blipTime = t + i * 0.06;
        const freq = 1800 + Math.random() * 2400;
        const bG = this.ctx.createGain();
        bG.gain.setValueAtTime(0.008, blipTime);
        bG.gain.exponentialRampToValueAtTime(0.0001, blipTime + 0.04);
        bG.connect(this.masterGain!);
        this.nodes.push(bG);

        const bO = this.ctx.createOscillator();
        bO.type = Math.random() > 0.5 ? 'square' : 'sine';
        bO.frequency.value = freq;
        bO.connect(bG);
        bO.start(blipTime);
        bO.stop(blipTime + 0.05);
      }

      // Next burst in 4–10s
      const delay = 4000 + Math.random() * 6000;
      this.blipTimer = setTimeout(scheduleBlip, delay);
    };

    // Start blips after 5s
    this.timers.push(setTimeout(scheduleBlip, 5000));

    /* ───────────────────────────────────────────────────────────────
       LAYER 7: Master breath LFO — very slow volume modulation
       Creates a living, breathing quality to the entire soundscape
       ─────────────────────────────────────────────────────────────── */
    const breathLFO = this.ctx.createOscillator();
    breathLFO.type = 'sine';
    breathLFO.frequency.value = 0.05; // ~20s cycle
    const breathG = this.ctx.createGain();
    breathG.gain.value = 0.025; // ±0.025 on master
    breathLFO.connect(breathG);
    breathG.connect(this.masterGain.gain);
    breathLFO.start();
    this.oscillators.push(breathLFO);
    this.nodes.push(breathG);

    /* ── Handle autoplay policy ──────────────────────────────────── */
    if (this.ctx.state === 'suspended') {
      const resume = () => {
        this.ctx?.resume();
        document.removeEventListener('pointerdown', resume);
        document.removeEventListener('click', resume);
        document.removeEventListener('touchstart', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('pointerdown', resume, { once: true });
      document.addEventListener('click', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });
      document.addEventListener('keydown', resume, { once: true });
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     DUCK — Reduce volume for room transition sounds
     ═════════════════════════════════════════════════════════════════ */
  duck() {
    if (!this.ctx || !this.masterGain || this.ducked) return;
    this.ducked = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(this.duckedGain, now + 1.5);
  }

  /* ═════════════════════════════════════════════════════════════════
     UNDUCK — Restore volume
     ═════════════════════════════════════════════════════════════════ */
  unduck() {
    if (!this.ctx || !this.masterGain || !this.ducked) return;
    this.ducked = false;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(this.normalGain, now + 2);
  }

  /* ═════════════════════════════════════════════════════════════════
     FADE OUT — Smooth exit over `duration` seconds
     ═════════════════════════════════════════════════════════════════ */
  fadeOut(duration = 2) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + duration);

    // Auto-stop after fade
    this.timers.push(setTimeout(() => this.stop(), duration * 1000 + 200));
  }

  /* ═════════════════════════════════════════════════════════════════
     STOP — Kill everything immediately
     ═════════════════════════════════════════════════════════════════ */
  stop() {
    this.running = false;
    this.detachVisibilityHandler();

    if (this.pingTimer) clearTimeout(this.pingTimer);
    if (this.blipTimer) clearTimeout(this.blipTimer);
    this.timers.forEach(clearTimeout);
    this.timers = [];

    this.oscillators.forEach(o => {
      try { o.stop(); } catch {}
      try { o.disconnect(); } catch {}
    });
    this.oscillators = [];

    if (this.noiseSrc) {
      try { this.noiseSrc.stop(); } catch {}
      try { this.noiseSrc.disconnect(); } catch {}
      this.noiseSrc = null;
    }

    this.nodes.forEach(n => {
      try { n.disconnect(); } catch {}
    });
    this.nodes = [];

    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch {}
      this.masterGain = null;
    }

    if (this.ctx) {
      try { this.ctx.close(); } catch {}
      this.ctx = null;
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     IS RUNNING
     ═════════════════════════════════════════════════════════════════ */
  get isRunning() { return this.running; }

  private attachVisibilityHandler() {
    if (this.visibilityHandler) return;

    this.visibilityHandler = () => {
      if (!this.ctx) return;
      if (document.hidden) {
        if (this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
        return;
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler, { passive: true });
  }

  private detachVisibilityHandler() {
    if (!this.visibilityHandler) return;
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.visibilityHandler = null;
  }
}

/* ── Singleton instance ──────────────────────────────────────────── */
let _instance: AmbientSoundscape | null = null;

export function getAmbientSoundscape(): AmbientSoundscape {
  if (!_instance) _instance = new AmbientSoundscape();
  return _instance;
}
