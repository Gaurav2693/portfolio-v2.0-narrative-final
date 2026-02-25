import { useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Radio, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   STUDIO RADIO — Procedural FM Ambient Generator (v2)
   ────────────────────────────────────────────────────
   Seven channels of crystal-clear procedural audio via Tone.js.
   All noise layers, crackle, hum, and wave distortion removed.
   Pure FM synthesis with low modulation indices for warm, clean tones.

     CH1  "Midnight Keys"     — gentle piano plinks + warm chord pads
     CH2  "Jazz Lounge"       — walking bass + clean Rhodes comping
     CH3  "Ambient Drift"     — slow FM drones + crystalline bells
     CH4  "Deep Focus"        — minimal harmonic pulses + sub bass tones
     CH5  "Sunset Piano"      — arpeggiated piano + lush pad layers
     CH6  "Crystal Garden"    — bright bell patterns + shimmering pads
     CH7  "Velvet Strings"    — bowed-string FM tones + gentle movement
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Musical data ─────────────────────────────────────────────────── */

const PENTATONIC = [
  'C3', 'D3', 'E3', 'G3', 'A3',
  'C4', 'D4', 'E4', 'G4', 'A4',
  'C5', 'D5', 'E5',
];

const JAZZ_CHORDS = [
  ['C3', 'E3', 'G3', 'B3'],
  ['D3', 'F3', 'A3', 'C4'],
  ['A2', 'C3', 'E3', 'G3'],
  ['F2', 'A2', 'C3', 'E3'],
  ['G2', 'B2', 'D3', 'F3'],
  ['E2', 'G2', 'B2', 'D3'],
];

const BASS_WALK = [
  ['C2', 'E2', 'G2', 'A2'],
  ['D2', 'F2', 'A2', 'C3'],
  ['G1', 'B1', 'D2', 'F2'],
  ['F1', 'A1', 'C2', 'E2'],
  ['A1', 'C2', 'E2', 'G2'],
  ['E1', 'G1', 'B1', 'D2'],
];

const RHODES_VOICINGS = [
  ['C4', 'E4', 'B4'],
  ['D4', 'F4', 'C5'],
  ['G3', 'B3', 'F4'],
  ['F3', 'A3', 'E4'],
  ['A3', 'C4', 'G4'],
  ['E3', 'G3', 'D4'],
];

const DRONE_NOTES = ['C2', 'G1', 'F2', 'D2'];

const BELL_NOTES = ['C5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6'];

/* Extended note sets for new channels */
const ARPEGGIO_NOTES = [
  'C4', 'E4', 'G4', 'B4', 'C5', 'E5', 'G5',
  'D4', 'F4', 'A4', 'C5', 'D5',
];

const FOCUS_TONES = ['C3', 'E3', 'G3', 'C4', 'G4'];

const GARDEN_BELLS = ['E5', 'G5', 'B5', 'D6', 'E6', 'G6', 'B6', 'D7'];

const GARDEN_PADS = [
  ['E3', 'G3', 'B3', 'D4'],
  ['C3', 'E3', 'G3', 'B3'],
  ['A2', 'C3', 'E3', 'G3'],
  ['F3', 'A3', 'C4', 'E4'],
];

const STRING_NOTES = [
  ['G3', 'B3', 'D4'],
  ['C3', 'E3', 'G3'],
  ['A3', 'C4', 'E4'],
  ['F3', 'A3', 'C4'],
  ['D3', 'F3', 'A3'],
  ['E3', 'G3', 'B3'],
];

const SUNSET_CHORDS = [
  ['C3', 'E3', 'G3', 'B3'],
  ['F3', 'A3', 'C4', 'E4'],
  ['G3', 'B3', 'D4', 'F4'],
  ['A2', 'C3', 'E3', 'G3'],
  ['D3', 'F3', 'A3', 'C4'],
];

/* ── Channel metadata ─────────────────────────────────────────────── */
interface ChannelDef {
  id: string;
  name: string;
  sub: string;
  freq: string;
}

const CHANNELS: ChannelDef[] = [
  { id: 'midnight',  name: 'Midnight Keys',   sub: 'gentle piano + warm pads',        freq: '87.9' },
  { id: 'jazz',      name: 'Jazz Lounge',     sub: 'walking bass + Rhodes comping',   freq: '91.3' },
  { id: 'ambient',   name: 'Ambient Drift',   sub: 'slow drones + crystal bells',     freq: '95.1' },
  { id: 'focus',     name: 'Deep Focus',      sub: 'harmonic pulses + sub tones',     freq: '98.7' },
  { id: 'sunset',    name: 'Sunset Piano',    sub: 'arpeggios + lush pad layers',     freq: '103.7' },
  { id: 'garden',    name: 'Crystal Garden',  sub: 'bright bells + shimmering pads',  freq: '107.3' },
  { id: 'strings',   name: 'Velvet Strings',  sub: 'bowed FM tones + gentle motion',  freq: '110.9' },
];

/* ── Utility ──────────────────────────────────────────────────────── */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rng(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

/* ═══════════════════════════════════════════════════════════════════ */

interface ChannelEngine {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  setVolume: (db: number) => void;
}

/* ── Channel 1: Midnight Keys ─────────────────────────────────────── */
function createMidnightChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Clean piano — low modulation index for pure, warm tone */
  const piano = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 4,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 2,
      modulationIndex: 0.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.03, release: 1.6 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.005, decay: 0.4, sustain: 0.05, release: 0.8 },
    },
  });
  const pianoFilter = new Tone.Filter(3000, 'lowpass', -12);
  const pianoReverb = new Tone.Reverb({ decay: 3.5, wet: 0.4 });
  const pianoDelay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.18, wet: 0.12 });
  piano.chain(pianoFilter, pianoDelay, pianoReverb, masterVol);

  /* Warm chord pads — very low modulation for pure sine-like tone */
  const pad = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 6,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 1,
      modulationIndex: 0.15,
      oscillator: { type: 'sine' },
      envelope: { attack: 2.0, decay: 2.0, sustain: 0.7, release: 3.5 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 2.5, decay: 1.5, sustain: 0.5, release: 3.0 },
    },
  });
  const padFilter = new Tone.Filter(1800, 'lowpass', -12);
  const padReverb = new Tone.Reverb({ decay: 5, wet: 0.55 });
  pad.chain(padFilter, padReverb, masterVol);
  pad.volume.value = -14;

  let plinkLoop: Tone.Loop | null = null;
  let chordLoop: Tone.Loop | null = null;
  let chordIdx = 0;

  return {
    start() {
      plinkLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.3) {
          const note = pick(PENTATONIC);
          piano.triggerAttackRelease(note, rng(0.15, 0.5), time, rng(0.15, 0.4));
        }
        if (Math.random() > 0.82) {
          const note2 = pick(PENTATONIC);
          piano.triggerAttackRelease(note2, rng(0.1, 0.25), time + 0.14, rng(0.1, 0.25));
        }
      }, '4n');
      plinkLoop.probability = 0.7;
      plinkLoop.humanize = '16n';
      plinkLoop.start(0);

      chordLoop = new Tone.Loop((time) => {
        pad.releaseAll(time);
        const chord = JAZZ_CHORDS[chordIdx % JAZZ_CHORDS.length];
        pad.triggerAttackRelease(chord, '1m', time + 0.05, rng(0.12, 0.25));
        chordIdx++;
      }, '2m');
      chordLoop.start(0);
    },
    stop() {
      plinkLoop?.stop();
      chordLoop?.stop();
      pad.releaseAll();
      piano.releaseAll();
    },
    dispose() {
      plinkLoop?.dispose(); chordLoop?.dispose();
      piano.dispose(); pad.dispose();
      pianoFilter.dispose(); pianoReverb.dispose(); pianoDelay.dispose();
      padFilter.dispose(); padReverb.dispose(); masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 2: Jazz Lounge ───────────────────────────────────────── */
function createJazzChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Clean walking bass — warm triangle oscillator */
  const bass = new Tone.FMSynth({
    harmonicity: 0.5,
    modulationIndex: 0.8,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.04, decay: 0.35, sustain: 0.5, release: 0.8 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.5 },
  });
  const bassFilter = new Tone.Filter(700, 'lowpass', -12);
  const bassComp = new Tone.Compressor(-20, 3);
  bass.chain(bassFilter, bassComp, masterVol);
  bass.volume.value = -4;

  /* Clean Rhodes — characteristic bell-like but not harsh */
  const rhodes = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 5,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 3.5,
      modulationIndex: 0.9,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.9, sustain: 0.12, release: 1.8 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.005, decay: 0.5, sustain: 0.08, release: 1.0 },
    },
  });
  const rhodesFilter = new Tone.Filter(3500, 'lowpass', -12);
  const rhodesChorus = new Tone.Chorus({ frequency: 0.6, delayTime: 3.5, depth: 0.3, wet: 0.25 });
  const rhodesReverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 });
  rhodes.chain(rhodesFilter, rhodesChorus, rhodesReverb, masterVol);
  rhodes.volume.value = -10;

  let bassLoop: Tone.Loop | null = null;
  let rhodesLoop: Tone.Loop | null = null;
  let walkIdx = 0;
  let beatIdx = 0;
  let voicingIdx = 0;

  return {
    start() {
      rhodesChorus.start();

      bassLoop = new Tone.Loop((time) => {
        const bar = BASS_WALK[walkIdx % BASS_WALK.length];
        const note = bar[beatIdx % 4];
        const swing = (beatIdx % 2 === 1) ? 0.03 : 0;
        bass.triggerAttackRelease(note, '8n', time + swing, rng(0.45, 0.7));
        beatIdx++;
        if (beatIdx % 4 === 0) walkIdx++;
      }, '4n');
      bassLoop.humanize = '32n';
      bassLoop.start(0);

      rhodesLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.25) {
          const voicing = RHODES_VOICINGS[voicingIdx % RHODES_VOICINGS.length];
          const dur = pick(['4n', '8n', '8n.']);
          rhodes.triggerAttackRelease(voicing, dur, time + rng(0, 0.04), rng(0.12, 0.3));
        }
        if (Math.random() > 0.6) voicingIdx++;
      }, '2n');
      rhodesLoop.humanize = '16n';
      rhodesLoop.start('8n');
    },
    stop() {
      bassLoop?.stop(); rhodesLoop?.stop();
      rhodes.releaseAll();
    },
    dispose() {
      bassLoop?.dispose(); rhodesLoop?.dispose();
      bass.dispose(); rhodes.dispose();
      bassFilter.dispose(); bassComp.dispose();
      rhodesFilter.dispose(); rhodesChorus.dispose(); rhodesReverb.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 3: Ambient Drift ─────────────────────────────────────── */
function createAmbientChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Deep drones — very low modulation for pure, clean sustains */
  const drone1 = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 0.1,
    oscillator: { type: 'sine' },
    envelope: { attack: 4.0, decay: 2.0, sustain: 0.9, release: 6.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 3.5, decay: 2.0, sustain: 0.8, release: 5.0 },
  });
  const drone2 = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 0.08,
    oscillator: { type: 'sine' },
    envelope: { attack: 5.0, decay: 2.0, sustain: 0.85, release: 7.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 4.0, decay: 2.0, sustain: 0.7, release: 6.0 },
  });
  const droneReverb = new Tone.Reverb({ decay: 8, wet: 0.65 });
  const droneFilter = new Tone.Filter(1000, 'lowpass', -12);
  drone1.chain(droneFilter, droneReverb, masterVol);
  drone2.chain(droneFilter, droneReverb, masterVol);
  drone1.volume.value = -10;
  drone2.volume.value = -12;

  /* Crystal bells — clean high FM, moderate mod index for bell timbre */
  const bell = new Tone.FMSynth({
    harmonicity: 5.07,
    modulationIndex: 3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 1.8, sustain: 0.01, release: 3.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.002, decay: 1.0, sustain: 0.02, release: 2.0 },
  });
  const bellReverb = new Tone.Reverb({ decay: 6, wet: 0.75 });
  const bellDelay = new Tone.FeedbackDelay({ delayTime: '4n.', feedback: 0.3, wet: 0.2 });
  const bellFilter = new Tone.Filter(6000, 'lowpass', -12);
  bell.chain(bellFilter, bellDelay, bellReverb, masterVol);
  bell.volume.value = -16;

  let droneLoop: Tone.Loop | null = null;
  let bellLoop: Tone.Loop | null = null;
  let droneIdx = 0;

  return {
    start() {
      droneLoop = new Tone.Loop((time) => {
        const note = DRONE_NOTES[droneIdx % DRONE_NOTES.length];
        drone1.triggerAttackRelease(note, '4m', time, 0.25);
        const idx = (droneIdx + 1) % DRONE_NOTES.length;
        drone2.triggerAttackRelease(DRONE_NOTES[idx], '4m', time + 0.5, 0.18);
        droneIdx++;
      }, '4m');
      droneLoop.start(0);

      bellLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.5) {
          bell.triggerAttackRelease(pick(BELL_NOTES), rng(0.05, 0.2), time, rng(0.06, 0.18));
        }
      }, '2n');
      bellLoop.humanize = '4n';
      bellLoop.start(0);
    },
    stop() {
      droneLoop?.stop(); bellLoop?.stop();
      drone1.triggerRelease(); drone2.triggerRelease();
    },
    dispose() {
      droneLoop?.dispose(); bellLoop?.dispose();
      drone1.dispose(); drone2.dispose(); bell.dispose();
      droneReverb.dispose(); droneFilter.dispose();
      bellReverb.dispose(); bellDelay.dispose(); bellFilter.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 4: Deep Focus ────────────────────────────────────────── */
function createFocusChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Slow harmonic pulses — very clean sine-based FM */
  const pulse = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 0.2,
    oscillator: { type: 'sine' },
    envelope: { attack: 1.2, decay: 1.5, sustain: 0.4, release: 2.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 1.0, decay: 1.0, sustain: 0.3, release: 2.0 },
  });
  const pulseFilter = new Tone.Filter(2000, 'lowpass', -12);
  const pulseReverb = new Tone.Reverb({ decay: 6, wet: 0.55 });
  pulse.chain(pulseFilter, pulseReverb, masterVol);
  pulse.volume.value = -8;

  /* Sub bass tones — pure sine, almost subliminal */
  const sub = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 0.05,
    oscillator: { type: 'sine' },
    envelope: { attack: 3.0, decay: 2.0, sustain: 0.8, release: 4.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 2.0, decay: 1.5, sustain: 0.7, release: 3.0 },
  });
  const subFilter = new Tone.Filter(250, 'lowpass', -12);
  sub.chain(subFilter, masterVol);
  sub.volume.value = -12;

  /* High shimmer — gentle high-register tones */
  const shimmer = new Tone.FMSynth({
    harmonicity: 4,
    modulationIndex: 0.3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.8, decay: 2.0, sustain: 0.1, release: 3.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.5, decay: 1.5, sustain: 0.1, release: 2.5 },
  });
  const shimmerReverb = new Tone.Reverb({ decay: 7, wet: 0.7 });
  const shimmerDelay = new Tone.FeedbackDelay({ delayTime: '2n.', feedback: 0.25, wet: 0.2 });
  shimmer.chain(shimmerDelay, shimmerReverb, masterVol);
  shimmer.volume.value = -18;

  let pulseLoop: Tone.Loop | null = null;
  let subLoop: Tone.Loop | null = null;
  let shimmerLoop: Tone.Loop | null = null;
  let subIdx = 0;

  return {
    start() {
      pulseLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.35) {
          const note = pick(FOCUS_TONES);
          pulse.triggerAttackRelease(note, rng(0.8, 2.0), time, rng(0.12, 0.25));
        }
      }, '1m');
      pulseLoop.humanize = '4n';
      pulseLoop.start(0);

      subLoop = new Tone.Loop((time) => {
        const note = DRONE_NOTES[subIdx % DRONE_NOTES.length];
        sub.triggerAttackRelease(note, '4m', time, 0.2);
        subIdx++;
      }, '4m');
      subLoop.start(0);

      shimmerLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.6) {
          shimmer.triggerAttackRelease(pick(BELL_NOTES), rng(0.3, 0.8), time, rng(0.04, 0.12));
        }
      }, '2n');
      shimmerLoop.humanize = '8n';
      shimmerLoop.start('1m');
    },
    stop() {
      pulseLoop?.stop(); subLoop?.stop(); shimmerLoop?.stop();
      pulse.triggerRelease(); sub.triggerRelease();
    },
    dispose() {
      pulseLoop?.dispose(); subLoop?.dispose(); shimmerLoop?.dispose();
      pulse.dispose(); sub.dispose(); shimmer.dispose();
      pulseFilter.dispose(); pulseReverb.dispose();
      subFilter.dispose();
      shimmerReverb.dispose(); shimmerDelay.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 5: Sunset Piano ──────────────────────────────────────── */
function createSunsetChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Arpeggiated piano — clean, bright FM */
  const arp = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 0.4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.008, decay: 0.6, sustain: 0.04, release: 1.4 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.005, decay: 0.3, sustain: 0.05, release: 0.8 },
  });
  const arpFilter = new Tone.Filter(3500, 'lowpass', -12);
  const arpReverb = new Tone.Reverb({ decay: 4, wet: 0.45 });
  const arpDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.22, wet: 0.15 });
  arp.chain(arpFilter, arpDelay, arpReverb, masterVol);
  arp.volume.value = -6;

  /* Lush pad layer */
  const pad = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 6,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 1,
      modulationIndex: 0.1,
      oscillator: { type: 'sine' },
      envelope: { attack: 2.5, decay: 2.0, sustain: 0.75, release: 4.0 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 3.0, decay: 2.0, sustain: 0.6, release: 3.5 },
    },
  });
  const padFilter = new Tone.Filter(2000, 'lowpass', -12);
  const padReverb = new Tone.Reverb({ decay: 6, wet: 0.6 });
  pad.chain(padFilter, padReverb, masterVol);
  pad.volume.value = -16;

  let arpLoop: Tone.Loop | null = null;
  let padLoop: Tone.Loop | null = null;
  let arpNoteIdx = 0;
  let chordIdx = 0;

  return {
    start() {
      arpLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.2) {
          const note = ARPEGGIO_NOTES[arpNoteIdx % ARPEGGIO_NOTES.length];
          arp.triggerAttackRelease(note, rng(0.1, 0.3), time, rng(0.15, 0.35));
          arpNoteIdx++;
        }
      }, '8n');
      arpLoop.humanize = '32n';
      arpLoop.probability = 0.75;
      arpLoop.start(0);

      padLoop = new Tone.Loop((time) => {
        pad.releaseAll(time);
        const chord = SUNSET_CHORDS[chordIdx % SUNSET_CHORDS.length];
        pad.triggerAttackRelease(chord, '2m', time + 0.05, rng(0.1, 0.2));
        chordIdx++;
      }, '2m');
      padLoop.start(0);
    },
    stop() {
      arpLoop?.stop(); padLoop?.stop();
      pad.releaseAll();
    },
    dispose() {
      arpLoop?.dispose(); padLoop?.dispose();
      arp.dispose(); pad.dispose();
      arpFilter.dispose(); arpReverb.dispose(); arpDelay.dispose();
      padFilter.dispose(); padReverb.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 6: Crystal Garden ────────────────────────────────────── */
function createGardenChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Bright bell patterns — controlled FM for metallic but clean tone */
  const bell = new Tone.FMSynth({
    harmonicity: 4.5,
    modulationIndex: 2.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 2.0, sustain: 0.01, release: 3.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.001, decay: 1.2, sustain: 0.02, release: 2.0 },
  });
  const bellFilter = new Tone.Filter(5000, 'lowpass', -12);
  const bellReverb = new Tone.Reverb({ decay: 5, wet: 0.65 });
  const bellDelay = new Tone.FeedbackDelay({ delayTime: '4n', feedback: 0.28, wet: 0.18 });
  bell.chain(bellFilter, bellDelay, bellReverb, masterVol);
  bell.volume.value = -10;

  /* Shimmering pad */
  const shimPad = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 6,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 2,
      modulationIndex: 0.2,
      oscillator: { type: 'sine' },
      envelope: { attack: 3.0, decay: 2.0, sustain: 0.7, release: 4.0 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 2.5, decay: 2.0, sustain: 0.5, release: 3.5 },
    },
  });
  const shimFilter = new Tone.Filter(2500, 'lowpass', -12);
  const shimReverb = new Tone.Reverb({ decay: 7, wet: 0.6 });
  shimPad.chain(shimFilter, shimReverb, masterVol);
  shimPad.volume.value = -14;

  /* Gentle high chime — octave above the bells, very quiet */
  const chime = new Tone.FMSynth({
    harmonicity: 6,
    modulationIndex: 1.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 1.0, sustain: 0.005, release: 2.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.001, decay: 0.6, sustain: 0.01, release: 1.5 },
  });
  const chimeReverb = new Tone.Reverb({ decay: 4, wet: 0.7 });
  chime.chain(chimeReverb, masterVol);
  chime.volume.value = -22;

  let bellLoop: Tone.Loop | null = null;
  let padLoop: Tone.Loop | null = null;
  let chimeLoop: Tone.Loop | null = null;
  let padIdx = 0;

  return {
    start() {
      bellLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.35) {
          bell.triggerAttackRelease(pick(GARDEN_BELLS), rng(0.05, 0.15), time, rng(0.08, 0.2));
        }
      }, '4n');
      bellLoop.humanize = '8n';
      bellLoop.start(0);

      padLoop = new Tone.Loop((time) => {
        shimPad.releaseAll(time);
        const chord = GARDEN_PADS[padIdx % GARDEN_PADS.length];
        shimPad.triggerAttackRelease(chord, '2m', time + 0.05, rng(0.1, 0.2));
        padIdx++;
      }, '2m');
      padLoop.start(0);

      chimeLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.7) {
          chime.triggerAttackRelease(pick(['C7', 'E7', 'G7', 'B6']), rng(0.03, 0.1), time, rng(0.03, 0.08));
        }
      }, '1m');
      chimeLoop.humanize = '2n';
      chimeLoop.start('2m');
    },
    stop() {
      bellLoop?.stop(); padLoop?.stop(); chimeLoop?.stop();
      shimPad.releaseAll();
    },
    dispose() {
      bellLoop?.dispose(); padLoop?.dispose(); chimeLoop?.dispose();
      bell.dispose(); shimPad.dispose(); chime.dispose();
      bellFilter.dispose(); bellReverb.dispose(); bellDelay.dispose();
      shimFilter.dispose(); shimReverb.dispose();
      chimeReverb.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel 7: Velvet Strings ────────────────────────────────────── */
function createStringsChannel(): ChannelEngine {
  const masterVol = new Tone.Volume(-6).toDestination();

  /* Bowed-string tone — long attack, moderate sustain FM */
  const strings = new Tone.PolySynth(Tone.FMSynth, {
    maxPolyphony: 5,
    voice: Tone.FMSynth as any,
    options: {
      harmonicity: 1.5,
      modulationIndex: 0.6,
      oscillator: { type: 'sine' },
      envelope: { attack: 2.0, decay: 1.5, sustain: 0.7, release: 3.0 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 1.5, decay: 1.0, sustain: 0.5, release: 2.5 },
    },
  });
  const strFilter = new Tone.Filter(2800, 'lowpass', -12);
  const strChorus = new Tone.Chorus({ frequency: 0.3, delayTime: 4.5, depth: 0.25, wet: 0.2 });
  const strReverb = new Tone.Reverb({ decay: 5, wet: 0.5 });
  strings.chain(strFilter, strChorus, strReverb, masterVol);
  strings.volume.value = -6;

  /* Gentle pizzicato accent — short pluck */
  const pizz = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 0.3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.02, release: 0.8 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.003, decay: 0.2, sustain: 0.02, release: 0.5 },
  });
  const pizzReverb = new Tone.Reverb({ decay: 3, wet: 0.4 });
  pizz.chain(pizzReverb, masterVol);
  pizz.volume.value = -14;

  let strLoop: Tone.Loop | null = null;
  let pizzLoop: Tone.Loop | null = null;
  let chordIdx = 0;

  return {
    start() {
      strChorus.start();

      strLoop = new Tone.Loop((time) => {
        strings.releaseAll(time);
        const chord = STRING_NOTES[chordIdx % STRING_NOTES.length];
        strings.triggerAttackRelease(chord, '2m', time + 0.05, rng(0.15, 0.3));
        chordIdx++;
      }, '2m');
      strLoop.start(0);

      pizzLoop = new Tone.Loop((time) => {
        if (Math.random() > 0.45) {
          const note = pick(PENTATONIC);
          pizz.triggerAttackRelease(note, rng(0.08, 0.2), time, rng(0.1, 0.25));
        }
      }, '4n');
      pizzLoop.humanize = '16n';
      pizzLoop.probability = 0.5;
      pizzLoop.start('1m');
    },
    stop() {
      strLoop?.stop(); pizzLoop?.stop();
      strings.releaseAll();
    },
    dispose() {
      strLoop?.dispose(); pizzLoop?.dispose();
      strings.dispose(); pizz.dispose();
      strFilter.dispose(); strChorus.dispose(); strReverb.dispose();
      pizzReverb.dispose();
      masterVol.dispose();
    },
    setVolume(db: number) { masterVol.volume.value = db; },
  };
}

/* ── Channel factory ──────────────────────────────────────────────── */
const CHANNEL_FACTORIES: Record<string, () => ChannelEngine> = {
  midnight: createMidnightChannel,
  jazz:     createJazzChannel,
  ambient:  createAmbientChannel,
  focus:    createFocusChannel,
  sunset:   createSunsetChannel,
  garden:   createGardenChannel,
  strings:  createStringsChannel,
};

/* ═══════════════════════════════════════════════════════════════════ */
/* ── Component ────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════ */

interface StudioRadioProps {
  compact?: boolean;
  inline?: boolean;
  radioClicked?: boolean;
}

export function StudioRadio({ compact, inline, radioClicked }: StudioRadioProps) {
  const [playing, setPlaying] = useState(false);
  const [channelIdx, setChannelIdx] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [toneReady, setToneReady] = useState(false);

  const engineRef = useRef<ChannelEngine | null>(null);
  const channelIdxRef = useRef(channelIdx);
  channelIdxRef.current = channelIdx;

  const prevRadioClicked = useRef(false);

  const volDb = muted ? -Infinity : -40 + (volume / 100) * 40;

  const ensureTone = useCallback(async () => {
    if (!toneReady) {
      await Tone.start();
      Tone.getTransport().bpm.value = 72;
      setToneReady(true);
    }
  }, [toneReady]);

  const rebuildEngine = useCallback((chId: string, shouldPlay: boolean) => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.dispose();
      engineRef.current = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    if (!shouldPlay) return;

    const factory = CHANNEL_FACTORIES[chId];
    if (!factory) return;
    const eng = factory();
    eng.setVolume(volDb);
    eng.start();
    engineRef.current = eng;
    Tone.getTransport().start('+0.05');
  }, [volDb]);

  const togglePlay = useCallback(async () => {
    await ensureTone();
    if (playing) {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.dispose();
        engineRef.current = null;
      }
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      setPlaying(false);
    } else {
      rebuildEngine(CHANNELS[channelIdxRef.current].id, true);
      setPlaying(true);
    }
  }, [playing, ensureTone, rebuildEngine]);

  const nextChannel = useCallback(async () => {
    await ensureTone();
    const next = (channelIdxRef.current + 1) % CHANNELS.length;
    setChannelIdx(next);
    if (playing) rebuildEngine(CHANNELS[next].id, true);
  }, [playing, ensureTone, rebuildEngine]);

  const prevChannel = useCallback(async () => {
    await ensureTone();
    const prev = (channelIdxRef.current - 1 + CHANNELS.length) % CHANNELS.length;
    setChannelIdx(prev);
    if (playing) rebuildEngine(CHANNELS[prev].id, true);
  }, [playing, ensureTone, rebuildEngine]);

  useEffect(() => {
    if (radioClicked && !prevRadioClicked.current && !playing) {
      (async () => {
        await ensureTone();
        rebuildEngine(CHANNELS[channelIdxRef.current].id, true);
        setPlaying(true);
      })();
    }
    prevRadioClicked.current = !!radioClicked;
  }, [radioClicked, playing, ensureTone, rebuildEngine]);

  useEffect(() => {
    engineRef.current?.setVolume(volDb);
  }, [volDb]);

  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      engineRef.current?.dispose();
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    };
  }, []);

  const ch = CHANNELS[channelIdx];

  /* Visualizer dots */
  const [vizBeat, setVizBeat] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setVizBeat(v => (v + 1) % 8);
    }, 320);
    return () => clearInterval(iv);
  }, [playing]);

  /* ═════════════════════════════════════════════════════════════ */

  if (compact) {
    return (
      <div className="flex items-center gap-2 select-none">
        <button
          onClick={togglePlay}
          className="w-6 h-6 rounded-full flex items-center justify-center
                     bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08]
                     text-white/50 hover:text-white/80 transition-all duration-150"
        >
          {playing ? <Pause size={10} /> : <Play size={10} className="ml-[1px]" />}
        </button>
        <span className="text-[9px] text-white/40 font-['Cambay',sans-serif] tracking-[0.5px]">
          {ch.freq}
        </span>
      </div>
    );
  }

  if (inline) {
    return (
      <div className="flex items-center gap-[6px] select-none">
        {/* Separator */}
        <div className="w-px h-5 bg-white/[0.06] mx-0.5" />

        {/* Radio icon + label */}
        <Radio size={11} className="text-[#00A87C]/60 shrink-0" />

        {/* Prev */}
        <button
          onClick={prevChannel}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
                     text-white/40 hover:text-white/70 transition-all duration-150"
          title="Previous channel"
        >
          <SkipBack size={10} />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full flex items-center justify-center
                     border transition-all duration-200"
          style={{
            background: playing ? 'rgba(0,168,124,0.12)' : 'rgba(255,255,255,0.04)',
            borderColor: playing ? 'rgba(0,168,124,0.25)' : 'rgba(255,255,255,0.06)',
            color: playing ? '#00A87C' : 'rgba(255,255,255,0.4)',
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={11} /> : <Play size={11} className="ml-[1px]" />}
        </button>

        {/* Next */}
        <button
          onClick={nextChannel}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
                     text-white/40 hover:text-white/70 transition-all duration-150"
          title="Next channel"
        >
          <SkipForward size={10} />
        </button>

        {/* Channel name + freq */}
        <div className="flex flex-col leading-none min-w-[70px]">
          <span className="font-['Cambay',sans-serif] text-[10px] text-white/50 truncate">{ch.name}</span>
          <span className="font-['Cambay',sans-serif] text-[8px] text-[#00A87C]/50 tabular-nums">{ch.freq} FM</span>
        </div>

        {/* Mini visualizer (4 bars) */}
        <div className="flex items-end gap-[2px] h-[14px]">
          {Array.from({ length: 5 }).map((_, i) => {
            const h = playing ? 3 + Math.abs(Math.sin((vizBeat + i) * 1.1)) * 11 : 2;
            return (
              <div
                key={i}
                style={{
                  width: 2,
                  height: h,
                  borderRadius: 1,
                  background: playing
                    ? `rgba(0,168,124,${0.3 + Math.abs(Math.sin((vizBeat + i) * 0.7)) * 0.5})`
                    : 'rgba(255,255,255,0.08)',
                  transition: 'height 280ms ease',
                }}
              />
            );
          })}
        </div>

        {/* Mute */}
        <button
          onClick={() => setMuted(m => !m)}
          className="w-6 h-6 flex items-center justify-center
                     text-white/25 hover:text-white/55 transition-colors duration-150"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </div>
    );
  }

  return (
    <div
      className="select-none"
      style={{
        width: 280,
        background: 'linear-gradient(135deg, #1e1e1e 0%, #252525 100%)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        padding: '16px 18px 14px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Radio size={13} className="text-[#00A87C]/70" />
        <span className="text-[10px] text-white/30 tracking-[1.5px] uppercase font-['Cambay',sans-serif]">
          Studio Radio
        </span>
        <div className="flex-1" />
        <div
          className="px-2 py-0.5 rounded"
          style={{
            background: 'rgba(0,168,124,0.08)',
            border: '1px solid rgba(0,168,124,0.15)',
          }}
        >
          <span className="text-[11px] text-[#00A87C] font-['Cambay',sans-serif] tabular-nums">
            {ch.freq} <span className="text-[9px] text-[#00A87C]/50">FM</span>
          </span>
        </div>
      </div>

      {/* Channel name */}
      <div className="mb-1">
        <div className="text-[14px] text-white/85 font-['Cambay',sans-serif]">
          {ch.name}
        </div>
        <div className="text-[10px] text-white/30 font-['Cambay',sans-serif] tracking-[0.3px]">
          {ch.sub}
        </div>
      </div>

      {/* Visualizer */}
      <div className="flex items-end gap-[3px] h-[18px] my-3">
        {Array.from({ length: 16 }).map((_, i) => {
          const active = playing;
          const h = active
            ? 4 + Math.abs(Math.sin((vizBeat + i) * 0.9)) * 14
            : 3;
          return (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 1.5,
                background: active
                  ? `rgba(0, 168, 124, ${0.3 + Math.abs(Math.sin((vizBeat + i) * 0.7)) * 0.5})`
                  : 'rgba(255,255,255,0.08)',
                transition: 'height 280ms ease, background 280ms ease',
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevChannel}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
                     text-white/40 hover:text-white/70 transition-all duration-150"
          title="Previous channel"
        >
          <SkipBack size={12} />
        </button>

        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     border transition-all duration-200"
          style={{
            background: playing
              ? 'rgba(0, 168, 124, 0.15)'
              : 'rgba(255,255,255,0.06)',
            borderColor: playing
              ? 'rgba(0, 168, 124, 0.3)'
              : 'rgba(255,255,255,0.08)',
            color: playing ? '#00A87C' : 'rgba(255,255,255,0.5)',
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} className="ml-[1px]" />}
        </button>

        <button
          onClick={nextChannel}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]
                     text-white/40 hover:text-white/70 transition-all duration-150"
          title="Next channel"
        >
          <SkipForward size={12} />
        </button>

        <div className="flex-1" />

        {/* Volume */}
        <button
          onClick={() => setMuted(m => !m)}
          className="w-6 h-6 flex items-center justify-center
                     text-white/30 hover:text-white/60 transition-colors duration-150"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            if (muted) setMuted(false);
          }}
          className="w-[60px] h-[3px] appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(0,168,124,0.5) ${muted ? 0 : volume}%, rgba(255,255,255,0.08) ${muted ? 0 : volume}%)`,
            accentColor: '#00A87C',
          }}
          title={`Volume: ${volume}%`}
        />
      </div>

      {/* Channel dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {CHANNELS.map((c, i) => (
          <button
            key={c.id}
            onClick={async () => {
              await ensureTone();
              setChannelIdx(i);
              if (playing) rebuildEngine(c.id, true);
            }}
            className="w-[5px] h-[5px] rounded-full transition-all duration-200"
            style={{
              background: i === channelIdx ? '#00A87C' : 'rgba(255,255,255,0.12)',
              boxShadow: i === channelIdx ? '0 0 6px rgba(0,168,124,0.4)' : 'none',
              transform: i === channelIdx ? 'scale(1.3)' : 'scale(1)',
            }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}