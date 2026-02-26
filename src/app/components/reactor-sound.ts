/* ═══════════════════════════════════════════════════════════════════════
   REACTOR SOUND ENGINE — Web Audio API procedural synthesis
   ──────────────────────────────────────────────────────────
   Iron Man arc reactor power-up sequence:
   
   Phase 1 (0–2s)    "Cold Start"
     – Deep sub-bass drone fades in (40Hz)
     – Electrical crackle noise bursts
     – Mechanical pre-ignition click
   
   Phase 2 (2–7s)    "Core Spin-Up"
     – Bass drone rises in pitch (40→80Hz) and volume
     – High-frequency sweep climbs (200→3000Hz) through resonant filter
     – Each shape transition triggers a servo "chunk" hit
     – Harmonic overtones layer in progressively
   
   Phase 3 (7–9s)    "Reactor Convergence"
     – All frequencies converge toward a bright harmonic chord
     – Pulsing intensity increases
     – Sweep reaches peak frequency
   
   Phase 4 (9–10s)   "Online"
     – Sharp impact transient (the "thunk" of the plate locking)
     – Bright sustained reactor hum chord (fundamental + 3rd + 5th)
     – Quick fade to warm idle tone
   
   All synthesis is procedural — no audio files needed.
   ═══════════════════════════════════════════════════════════════════════ */

export class ReactorSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private oscillators: OscillatorNode[] = [];
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private stopped = false;
  private unlockHandler: (() => void) | null = null;

  /* ── Gain helper ────────────────────────────────────────────────── */
  private createGain(value = 0): GainNode {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    g.connect(this.masterGain!);
    this.nodes.push(g);
    return g;
  }

  /* ── Oscillator helper ─────────────────────────────────────────── */
  private createOsc(
    type: OscillatorType,
    freq: number,
    output: GainNode,
    detune = 0,
  ): OscillatorNode {
    const osc = this.ctx!.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(output);
    osc.start();
    this.oscillators.push(osc);
    return osc;
  }

  /* ── Noise buffer ──────────────────────────────────────────────── */
  private createNoise(duration: number): AudioBuffer {
    const sr = this.ctx!.sampleRate;
    const len = sr * duration;
    const buf = this.ctx!.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  /* ── Play a noise burst (electrical crackle) ───────────────────── */
  private playCrackle(time: number, duration: number, volume: number) {
    if (!this.ctx || this.stopped) return;
    const buf = this.createNoise(duration);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 2;
    src.connect(filter);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    src.start(time);
    src.stop(time + duration);
    this.nodes.push(filter, gain);
  }

  /* ── Servo "chunk" impact ──────────────────────────────────────── */
  playServoHit(shapeIndex: number) {
    if (!this.ctx || this.stopped) return;
    const now = this.ctx.currentTime;

    // Metallic click — short sine burst
    const clickGain = this.createGain(0);
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    const clickOsc = this.ctx.createOscillator();
    clickOsc.type = 'square';
    clickOsc.frequency.value = 800 + shapeIndex * 200; // Rising pitch per shape
    clickOsc.connect(clickGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.08);

    // Sub-thump
    const thumpGain = this.createGain(0);
    thumpGain.gain.setValueAtTime(0.12, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    const thumpOsc = this.ctx.createOscillator();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(150, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    thumpOsc.connect(thumpGain);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.15);

    // Tiny crackle
    this.playCrackle(now, 0.06, 0.08);
  }

  /* ── Full sequence ─────────────────────────────────────────────── */
  start(totalDuration = 10) {
    this.stop();
    this.stopped = false;

    this.ctx = new AudioContext();
    this.armAutoplayUnlock();
    const now = this.ctx.currentTime;
    const end = now + totalDuration;

    // Master gain with limiter-style compression
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.35;

    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    this.masterGain.connect(compressor);
    compressor.connect(this.ctx.destination);
    this.nodes.push(compressor);

    /* ─────────────────────────────────────────────────────────────
       LAYER 0: Ignition Transient (t=0)
       The initial "thump" — reactor core engaging, capacitor discharge
       A deep sine punch + broadband noise burst + metallic ping
       ──────────────────────────────────────────────────────────── */

    // Deep ignition punch — sine sweep 150Hz→25Hz
    const ignGain = this.createGain(0);
    ignGain.gain.setValueAtTime(0.22, now);
    ignGain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
    ignGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const ignOsc = this.ctx.createOscillator();
    ignOsc.type = 'sine';
    ignOsc.frequency.setValueAtTime(150, now);
    ignOsc.frequency.exponentialRampToValueAtTime(25, now + 0.4);
    ignOsc.connect(ignGain);
    ignOsc.start(now);
    ignOsc.stop(now + 0.5);
    this.oscillators.push(ignOsc);

    // Capacitor discharge — filtered noise burst
    this.playCrackle(now, 0.12, 0.14);
    this.playCrackle(now + 0.03, 0.08, 0.10);

    // Metallic ping — high sine that decays fast (the "click" of engaging)
    const pingGain = this.createGain(0);
    pingGain.gain.setValueAtTime(0.08, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    const pingOsc = this.ctx.createOscillator();
    pingOsc.type = 'sine';
    pingOsc.frequency.value = 4200;
    pingOsc.connect(pingGain);
    pingOsc.start(now);
    pingOsc.stop(now + 0.15);
    this.oscillators.push(pingOsc);

    /* ─────────────────────────────────────────────────────────────
       LAYER 1: Deep Sub-Bass Drone (entire duration)
       IMMEDIATELY present — felt from the first frame.
       Rises from 38Hz → 80Hz, builds in volume throughout.
       ──────────────────────────────────────────────────────────── */
    const droneGain = this.createGain(0);
    droneGain.gain.setValueAtTime(0.10, now);               // Immediately audible
    droneGain.gain.linearRampToValueAtTime(0.14, now + 1.5); // Build early
    droneGain.gain.linearRampToValueAtTime(0.18, now + 4);   // Stronger
    droneGain.gain.linearRampToValueAtTime(0.22, now + 7);   // Peak approach
    droneGain.gain.linearRampToValueAtTime(0.08, end - 0.3); // Settle
    droneGain.gain.linearRampToValueAtTime(0, end);          // Out

    const droneOsc = this.createOsc('sine', 38, droneGain);
    droneOsc.frequency.setValueAtTime(38, now);
    droneOsc.frequency.linearRampToValueAtTime(48, now + 2);
    droneOsc.frequency.linearRampToValueAtTime(60, now + 5);
    droneOsc.frequency.linearRampToValueAtTime(80, now + 8);
    droneOsc.frequency.linearRampToValueAtTime(60, end);
    droneOsc.stop(end + 0.5);

    // Drone second voice — slightly detuned for thickness
    const drone2Gain = this.createGain(0);
    drone2Gain.gain.setValueAtTime(0.06, now);
    drone2Gain.gain.linearRampToValueAtTime(0.09, now + 3);
    drone2Gain.gain.linearRampToValueAtTime(0.12, now + 7);
    drone2Gain.gain.linearRampToValueAtTime(0, end);

    const drone2Osc = this.createOsc('sine', 38, drone2Gain, 7); // +7 cents detune
    drone2Osc.frequency.setValueAtTime(38, now);
    drone2Osc.frequency.linearRampToValueAtTime(60, now + 5);
    drone2Osc.frequency.linearRampToValueAtTime(80, now + 8);
    drone2Osc.frequency.linearRampToValueAtTime(60, end);
    drone2Osc.stop(end + 0.5);

    // Sub-harmonic for chest-rattling weight — immediate
    const subGain = this.createGain(0);
    subGain.gain.setValueAtTime(0.07, now);                  // Present from start
    subGain.gain.linearRampToValueAtTime(0.10, now + 2);
    subGain.gain.linearRampToValueAtTime(0.14, now + 7);
    subGain.gain.linearRampToValueAtTime(0, end);

    const subOsc = this.createOsc('sine', 20, subGain);
    subOsc.frequency.setValueAtTime(20, now);
    subOsc.frequency.linearRampToValueAtTime(30, now + 4);
    subOsc.frequency.linearRampToValueAtTime(40, end);
    subOsc.stop(end + 0.5);

    /* ─────────────────────────────────────────────────────────────
       LAYER 1.5: Core Resonance Bed (0s → 9s)
       Low-passed noise gives that mechanical turbine texture —
       the sound of the reactor housing vibrating from the start
       ──────────────────────────────────────────────────────────── */
    const noiseBuf = this.createNoise(totalDuration);
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const noiseLPF = this.ctx.createBiquadFilter();
    noiseLPF.type = 'lowpass';
    noiseLPF.frequency.setValueAtTime(120, now);            // Very low — just rumble
    noiseLPF.frequency.linearRampToValueAtTime(250, now + 4);
    noiseLPF.frequency.linearRampToValueAtTime(500, now + 8);
    noiseLPF.frequency.linearRampToValueAtTime(200, end);
    noiseLPF.Q.value = 3;
    this.nodes.push(noiseLPF);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);               // Immediate texture
    noiseGain.gain.linearRampToValueAtTime(0.08, now + 2);
    noiseGain.gain.linearRampToValueAtTime(0.10, now + 6);
    noiseGain.gain.linearRampToValueAtTime(0.03, now + 9);
    noiseGain.gain.linearRampToValueAtTime(0, end);
    this.nodes.push(noiseGain);

    noiseSrc.connect(noiseLPF);
    noiseLPF.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSrc.start(now);
    noiseSrc.stop(end);

    /* ─────────────────────────────────────────────────────────────
       LAYER 2: Rising Electrical Sweep (0.15s → 8.5s)
       Starts almost immediately — low filtered whine climbing up
       ──────────────────────────────────────────────────────────── */
    const sweepFilter = this.ctx.createBiquadFilter();
    sweepFilter.type = 'bandpass';
    sweepFilter.frequency.setValueAtTime(120, now + 0.15);
    sweepFilter.frequency.exponentialRampToValueAtTime(400, now + 2);
    sweepFilter.frequency.exponentialRampToValueAtTime(1200, now + 5);
    sweepFilter.frequency.exponentialRampToValueAtTime(3000, now + 8.5);
    sweepFilter.Q.setValueAtTime(10, now + 0.15);
    sweepFilter.Q.linearRampToValueAtTime(5, now + 4);
    sweepFilter.Q.linearRampToValueAtTime(3, now + 8);
    this.nodes.push(sweepFilter);

    const sweepGain = this.ctx.createGain();
    sweepGain.gain.setValueAtTime(0.03, now + 0.15);        // Audible immediately
    sweepGain.gain.linearRampToValueAtTime(0.06, now + 1);
    sweepGain.gain.linearRampToValueAtTime(0.10, now + 3);
    sweepGain.gain.linearRampToValueAtTime(0.13, now + 6);
    sweepGain.gain.linearRampToValueAtTime(0.15, now + 8);
    sweepGain.gain.linearRampToValueAtTime(0, now + 9.2);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.masterGain);
    this.nodes.push(sweepGain);

    // Sawtooth source for rich harmonic content to filter
    const sweepOsc = this.ctx.createOscillator();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.value = 80;
    sweepOsc.connect(sweepFilter);
    sweepOsc.start(now + 0.15);
    sweepOsc.stop(end);
    this.oscillators.push(sweepOsc);

    /* ─────────────────────────────────────────────────────────────
       LAYER 3: Harmonic Overtones (stagger in from 1.5s)
       Earlier entry — the reactor's harmonic signature builds sooner
       ──────────────────────────────────────────────────────────── */
    const harmonics = [
      { ratio: 2, start: 1.5, peakVol: 0.04 },   // Octave — early
      { ratio: 3, start: 3.0, peakVol: 0.03 },   // 5th
      { ratio: 5, start: 4.5, peakVol: 0.018 },   // Major 3rd (two octaves up)
      { ratio: 7, start: 6.0, peakVol: 0.012 },   // Harmonic 7th
    ];

    harmonics.forEach(h => {
      const hGain = this.createGain(0);
      hGain.gain.setValueAtTime(0, now + h.start);
      hGain.gain.linearRampToValueAtTime(h.peakVol, now + h.start + 1.2);
      hGain.gain.linearRampToValueAtTime(h.peakVol * 0.7, end - 1);
      hGain.gain.linearRampToValueAtTime(0, end);

      const hOsc = this.createOsc('sine', 38 * h.ratio, hGain, Math.random() * 6 - 3);
      hOsc.frequency.setValueAtTime(38 * h.ratio, now + h.start);
      hOsc.frequency.linearRampToValueAtTime(60 * h.ratio, end);
      hOsc.stop(end + 0.5);
    });

    /* ─────────────────────────────────────────────────────────────
       LAYER 4: Electrical Crackle Bursts (denser, from the start)
       ──────────────────────────────────────────────────────────── */
    const crackles = [0.08, 0.2, 0.5, 0.9, 1.4, 2.0, 2.7, 3.5, 4.3, 5.2, 6.0, 6.8, 7.5, 8.2];
    crackles.forEach(t => {
      this.playCrackle(now + t, 0.03 + Math.random() * 0.06, 0.04 + Math.random() * 0.05);
    });

    /* ─────────────────────────────────────────────────────────────
       LAYER 5: Pulsing Hum (3s → 9s, accelerating pulse rate)
       Starts earlier — reactor core heartbeat building speed
       ──────────────────────────────────────────────────────────── */
    const pulseGain = this.createGain(0);
    const pulseLFO = this.ctx.createOscillator();
    pulseLFO.type = 'sine';
    pulseLFO.frequency.setValueAtTime(1.5, now + 3);     // Slow heartbeat
    pulseLFO.frequency.linearRampToValueAtTime(4, now + 5);
    pulseLFO.frequency.linearRampToValueAtTime(12, now + 8.5); // Accelerates
    pulseLFO.frequency.linearRampToValueAtTime(0, now + 9.5);

    const pulseLFOGain = this.ctx.createGain();
    pulseLFOGain.gain.value = 0.04;
    pulseLFO.connect(pulseLFOGain);
    pulseLFOGain.connect(pulseGain.gain);
    pulseLFO.start(now + 3);
    pulseLFO.stop(end);
    this.oscillators.push(pulseLFO);
    this.nodes.push(pulseLFOGain);

    pulseGain.gain.setValueAtTime(0.04, now + 3);
    pulseGain.gain.linearRampToValueAtTime(0.08, now + 6);
    pulseGain.gain.linearRampToValueAtTime(0.12, now + 8);
    pulseGain.gain.linearRampToValueAtTime(0, now + 9.5);

    const pulseOsc = this.createOsc('triangle', 100, pulseGain);
    pulseOsc.frequency.setValueAtTime(100, now + 3);
    pulseOsc.frequency.linearRampToValueAtTime(200, now + 9);
    pulseOsc.stop(end);

    /* ─────────────────────────────────────────────────────────────
       LAYER 6: Reactor "ONLINE" Impact (at ~9s)
       The iconic breastplate-lock THUNK + bright harmonic chord
       ──────────────────────────────────────────────────────────── */
    const impactTime = now + totalDuration - 1.2;

    const scheduleImpact = () => {
      if (this.stopped || !this.ctx) return;
      const t = impactTime;

      // Deep impact thunk
      const impactGain = this.createGain(0);
      impactGain.gain.setValueAtTime(0.28, t);
      impactGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      const impactOsc = this.ctx.createOscillator();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(200, t);
      impactOsc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
      impactOsc.connect(impactGain);
      impactOsc.start(t);
      impactOsc.stop(t + 0.4);
      this.oscillators.push(impactOsc);

      // Metallic transient
      const metalGain = this.createGain(0);
      metalGain.gain.setValueAtTime(0.14, t);
      metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      const metalOsc = this.ctx.createOscillator();
      metalOsc.type = 'square';
      metalOsc.frequency.value = 2400;
      metalOsc.connect(metalGain);
      metalOsc.start(t);
      metalOsc.stop(t + 0.12);
      this.oscillators.push(metalOsc);

      // Bright reactor hum chord (fundamental C3 + E4 + G4)
      const chordFreqs = [130.81, 329.63, 392.00];
      chordFreqs.forEach((f, i) => {
        const cGain = this.createGain(0);
        cGain.gain.setValueAtTime(0, t + 0.05);
        cGain.gain.linearRampToValueAtTime(0.07, t + 0.15);
        cGain.gain.linearRampToValueAtTime(0.04, t + 0.8);
        cGain.gain.linearRampToValueAtTime(0, end + 0.3);

        const cOsc = this.createOsc('sine', f, cGain, i * 3);
        cOsc.stop(end + 0.5);
      });

      // Impact noise burst
      this.playCrackle(t, 0.1, 0.18);
      this.playCrackle(t + 0.02, 0.08, 0.12);
    };

    const impactDelay = (totalDuration - 1.5) * 1000;
    this.timeouts.push(setTimeout(scheduleImpact, Math.max(0, impactDelay)));

    /* ─────────────────────────────────────────────────────────────
       LAYER 7: Warm Idle Hum (last 0.5s)
       The gentle reactor-is-running background tone
       ──────────────────────────────────────────────────────────── */
    const idleStart = end - 0.5;
    const idleGain = this.createGain(0);
    idleGain.gain.setValueAtTime(0, idleStart);
    idleGain.gain.linearRampToValueAtTime(0.035, idleStart + 0.2);
    idleGain.gain.linearRampToValueAtTime(0, end + 0.3);

    const idleOsc = this.createOsc('sine', 60, idleGain);
    idleOsc.stop(end + 0.5);
  }

  private armAutoplayUnlock() {
    if (!this.ctx) return;

    const tryResume = () => {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.ctx.state === 'running') {
        this.detachAutoplayUnlock();
      }
    };

    // Attempt immediately in case browser already allows autoplay.
    tryResume();

    if (this.ctx.state === 'suspended') {
      this.unlockHandler = tryResume;
      const opts: AddEventListenerOptions = { capture: true, passive: true };
      document.addEventListener('pointerdown', tryResume, opts);
      document.addEventListener('touchstart', tryResume, opts);
      document.addEventListener('keydown', tryResume, opts);
      document.addEventListener('click', tryResume, opts);
    }
  }

  private detachAutoplayUnlock() {
    if (!this.unlockHandler) return;
    document.removeEventListener('pointerdown', this.unlockHandler, true);
    document.removeEventListener('touchstart', this.unlockHandler, true);
    document.removeEventListener('keydown', this.unlockHandler, true);
    document.removeEventListener('click', this.unlockHandler, true);
    this.unlockHandler = null;
  }

  /* ── Stop everything ───────────────────────────────────────────── */
  stop() {
    this.stopped = true;
    this.detachAutoplayUnlock();
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];

    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
      try { osc.disconnect(); } catch {}
    });
    this.oscillators = [];

    this.nodes.forEach(node => {
      try { node.disconnect(); } catch {}
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
}
