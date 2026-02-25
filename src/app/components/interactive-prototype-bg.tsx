import { memo, useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Lightbulb, Move } from 'lucide-react';
import { useNavigate } from 'react-router';
import PrototypeRoom from '@/imports/PrototypeRoom';
import { WallNarrative } from './wall-narrative';
import { WallWelcome } from './wall-welcome';
import { StudioRadio } from './studio-radio';

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE PROTOTYPE BG
   ─────────────────────────────────────────────────────────────────
   Full interaction engine for the Prototype Lab room.
   Contains: base Figma artwork, clone layer for hover/click lift,
   invisible hit zones for Proto 1–4, wall narrative (left wall),
   wall welcome (right wall), and discovery progress tracking.

   Performance rules:
   • CSS `contain: strict` on the room container
   • `pointer-events: none` on artwork to skip hit-testing
   • Zero parallax / rAF loops
   • Zero `willChange: 'transform'` on containers with thousands of elements
   • Opacity-only entry animation
   ═══════════════════════════════════════════════════════════════════════ */

const MemoRoom = memo(PrototypeRoom);

/* ── Artwork dimensions (matches Figma frame & other rooms) ────────── */
const AW = 805;
const AH = 609;

/* ── Interaction tuning ───────────────────────────────────────────── */
const HOVER_LIFT = 6;
const CLICK_LIFT = 22;
const DUR = '380ms';
const EASE_HOVER = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_CLICK = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.25;

/* ── Neon sign position (the standalone "Vector" hanging sign) ──── */
/* inset-[23.15%_49.19%_60.23%_42.86%] → (345, 141, 64×101) in 805×609 */
const SIGN_POS = { x: 345, y: 141, w: 64, h: 101 };
/* Front panel face region (within the 64×101 bounding box)
   The panel face follows right-wall isometric angle → skewY(30deg) */
const SIGN_PANEL = { x: 7, y: 30, w: 44, h: 44 };

/* ── Neon sign timing constants ───────────────────────────────── */
const SIGN_ACT1_END = 1.5;   // seconds — dead sign phase
const SIGN_ACT2_END = 4.0;   // seconds — glitch phase ends
const SIGN_ACT2_DUR = SIGN_ACT2_END - SIGN_ACT1_END; // 2.5s of glitch

/* ── Accent ───────────────────────────────────────────────────────── */
const WALL_ACCENT = '#E8501A';

/* ── Screen face coordinates (local to each proto's 65.252×152.824 space) ── */
const SCR = { x: 1.5, y: 6.55, w: 54.0, h: 89.5 };

/* ── Proto screen metadata (cyberpunk callouts for each prototype) ── */
interface ProtoMeta {
  name: string;
  tagline: string;
  accent: string;
  accentDim: string;
  route: string;
  version: string;
  metrics: { label: string; value: number }[];
}

const PROTO_META: Record<string, ProtoMeta> = {
  proto1: {
    name: 'STILLROOM',
    tagline: 'REFLECTIVE CREATIVE CANVAS',
    accent: '#00EAFF',
    accentDim: 'rgba(0,234,255,0.12)',
    route: 'https://stillroom-thinking-canvas.vercel.app/',
    version: 'v2.1',
    metrics: [
      { label: 'UX', value: 92 },
      { label: 'PERF', value: 87 },
    ],
  },
  proto2: {
    name: 'INERTIA',
    tagline: 'MOTION-DRIVEN INTERACTION LAB',
    accent: '#40F0AA',
    accentDim: 'rgba(64,240,170,0.12)',
    route: 'https://inertia-game-environment.vercel.app/',
    version: 'v1.4',
    metrics: [
      { label: 'FLOW', value: 94 },
      { label: 'RESP', value: 91 },
    ],
  },
  proto3: {
    name: 'PQE',
    tagline: 'ENTERPRISE PRICING ENGINE',
    accent: '#FF2D6B',
    accentDim: 'rgba(255,45,107,0.12)',
    route: 'https://cpq-dashboard-v2.vercel.app/',
    version: 'v3.0',
    metrics: [
      { label: 'QUAL', value: 96 },
      { label: 'OPT', value: 89 },
    ],
  },
  proto4: {
    name: 'PLOTSYNC',
    tagline: 'PLOT LIFECYCLE INTELLIGENCE',
    accent: '#A855F7',
    accentDim: 'rgba(168,85,247,0.12)',
    route: 'https://projects-mauve-one.vercel.app/',
    version: 'v1.0',
    metrics: [
      { label: 'VIZ', value: 91 },
      { label: 'SYNC', value: 88 },
    ],
  },
};

/* ── Cyberpunk screen content renderer ────────────────────────────── */
function renderProtoScreen(objId: string, idx: number, isActive: boolean, isClicked: boolean) {
  const meta = PROTO_META[objId];
  if (!meta) return null;
  const { name, tagline, accent, accentDim, version, metrics } = meta;

  return (
    <>
      {/* Subtle cyber grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${accent}08 1px, transparent 1px), linear-gradient(90deg, ${accent}08 1px, transparent 1px)`,
        backgroundSize: '4px 4px',
        opacity: isActive ? 1 : 0.4,
        transition: 'opacity 400ms ease',
      }} />

      {/* Animated scan line */}
      <div style={{
        position: 'absolute', left: 0, width: '100%', height: '1.5px',
        background: `linear-gradient(90deg, transparent 0%, ${accent} 20%, ${accent} 80%, transparent 100%)`,
        opacity: 0.3,
        boxShadow: `0 0 4px ${accent}, 0 0 8px ${accentDim}`,
        animation: `pscr-scan 3.5s ${idx * 0.8}s ease-in-out infinite`,
      }} />

      {/* Content stack */}
      <div style={{
        position: 'relative', padding: '3px 3px 2px', height: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Status dot + version */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5px', marginBottom: '2px' }}>
          <div style={{
            width: '2px', height: '2px', borderRadius: '50%',
            backgroundColor: accent,
            boxShadow: `0 0 3px ${accent}`,
            animation: `pscr-pulse 2s ${idx * 0.3}s ease-in-out infinite`,
          }} />
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.23px',
            letterSpacing: '0.8px', color: accent, opacity: 0.9,
          }}>{name}</span>
          <span style={{
            fontFamily: "'Cambay', sans-serif", fontSize: '3.06px',
            color: 'rgba(255,255,255,0.2)', marginLeft: 'auto',
          }}>{version}</span>
        </div>

        {/* Divider */}
        <div style={{
          height: '0.3px', marginBottom: '2.5px',
          background: `linear-gradient(90deg, ${accent}55, ${accent}11)`,
        }} />

        {/* Title — large */}
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '9.3px',
          letterSpacing: '1.5px', color: '#fff', lineHeight: 1,
          display: 'block', marginBottom: '1px',
          textShadow: isActive ? `0 0 6px ${accentDim}` : `0 0 2px ${accentDim}`,
          transition: 'text-shadow 300ms ease',
        }}>{name}</span>

        {/* Tagline */}
        <span style={{
          fontFamily: "'Cambay', sans-serif", fontSize: '3.38px',
          color: accent, letterSpacing: '0.4px', opacity: 0.7,
          display: 'block', marginBottom: '3px',
        }}>{tagline}</span>

        {/* Metric bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', marginBottom: '3px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5px' }}>
              <span style={{
                fontFamily: "'Cambay', sans-serif", fontSize: '2.7px',
                color: 'rgba(255,255,255,0.25)', width: '8px',
              }}>{m.label}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '0.5px' }}>
                <div style={{
                  width: `${m.value}%`, height: '100%', borderRadius: '0.5px',
                  background: `linear-gradient(90deg, ${accent}88, ${accent}33)`,
                  animation: isActive ? `pscr-bar-fill 1.2s ${i * 0.15}s cubic-bezier(0.22,1,0.36,1) both` : 'none',
                }} />
              </div>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.38px',
                color: accent, opacity: 0.6,
              }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA button zone */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1px',
          padding: '1.2px 2px', borderRadius: '0.5px',
          borderWidth: '0.3px', borderStyle: 'solid',
          borderColor: isClicked ? `${accent}88` : `${accent}33`,
          backgroundColor: isClicked ? `${accent}15` : `${accent}08`,
          marginBottom: '2px',
          transition: 'all 300ms ease',
          ...(isClicked ? { boxShadow: `0 0 3px ${accentDim}, inset 0 0 2px ${accentDim}` } : {}),
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.72px',
            letterSpacing: '0.6px', color: isClicked ? '#fff' : accent,
            opacity: isClicked ? 1 : 0.8, transition: 'all 300ms ease',
          }}>
            {isClicked ? 'CLICK TO OPEN' : 'VIEW PROTOTYPE'}
          </span>
          <span style={{
            fontSize: '3.38px', color: accent,
            opacity: 0.6, marginLeft: 'auto',
            animation: isClicked ? 'pscr-arrow-pulse 1s ease-in-out infinite' : 'none',
          }}>→</span>
        </div>

        {/* Bottom status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <div style={{
            width: '1.5px', height: '1.5px', borderRadius: '50%',
            backgroundColor: '#40F0AA',
            boxShadow: '0 0 2px #40F0AA',
            animation: `pscr-pulse 2s ${idx * 0.3 + 0.5}s ease-in-out infinite`,
          }} />
          <span style={{
            fontFamily: "'Cambay', sans-serif", fontSize: '2.7px',
            color: 'rgba(64,240,170,0.5)', letterSpacing: '0.3px',
          }}>READY</span>
        </div>
      </div>

      {/* Edge glow frame */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '0.5px',
        boxShadow: isActive
          ? `inset 0 0 4px ${accent}33, 0 0 3px ${accent}22`
          : `inset 0 0 2px ${accent}11, 0 0 1px ${accent}08`,
        transition: 'box-shadow 400ms ease',
      }} />

      {/* Top-edge neon strip */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '0.4px',
        background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
        opacity: isActive ? 1 : 0.3,
        transition: 'opacity 400ms ease',
      }} />
    </>
  );
}

/* ── Wall color palettes (dark mode default) ─────────────────────── */
const WALL_DARK = {
  bg: '#08080E',       // match site background
  wallL: '#1c1c28',    // left wall → dark indigo-gray
  wallR: '#2a2a38',    // right wall → muted blue-gray
  floor: '#1e1e2a',    // floor → dark navy
  floorMat: 0.06,      // floor mat opacity
};
const WALL_LIGHT = {
  bg: '#08080E',       // match site background
  wallL: '#3C3C3C',    // original left wall
  wallR: '#E2E2E2',    // original right wall
  floor: '#ffffff',    // original floor
  floorMat: 0.15,      // original floor mat opacity
};

/* ── Object definitions (px in 805×609 space) ─────────────────────── */
interface ObjCfg {
  id: string;
  dataName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hoverHz: number;
  clickHz: number;
  type: 'proto' | 'desk';
}

const OBJECTS: ObjCfg[] = [
  { id: 'proto1', dataName: 'Proto 1', x: 525, y: 252, w: 65.252, h: 152.824, hoverHz: 523, clickHz: 262, type: 'proto' },
  { id: 'proto2', dataName: 'Proto 2', x: 457, y: 288, w: 65.252, h: 152.824, hoverHz: 587, clickHz: 294, type: 'proto' },
  { id: 'proto3', dataName: 'Proto 3', x: 387, y: 329, w: 65.252, h: 152.824, hoverHz: 659, clickHz: 330, type: 'proto' },
  { id: 'proto4', dataName: 'Proto 4', x: 319, y: 368, w: 65.252, h: 152.824, hoverHz: 698, clickHz: 349, type: 'proto' },
  /* ── Desk / environment objects ──────────────────────────────────── */
  { id: 'keyboard',  dataName: 'keyboard',  x: 242, y: 320, w: 39,    h: 22.65, hoverHz: 784,  clickHz: 392, type: 'desk' },
  { id: 'camera',    dataName: 'Camera',     x: 242, y: 319, w: 14.17, h: 10.23, hoverHz: 880,  clickHz: 440, type: 'desk' },
  { id: 'juice',     dataName: 'Juice',      x: 232, y: 338, w: 4.51,  h: 9.20,  hoverHz: 988,  clickHz: 494, type: 'desk' },
  { id: 'dispenser', dataName: 'Dispenser',  x: 157, y: 326, w: 36.06, h: 105,   hoverHz: 1047, clickHz: 523, type: 'desk' },
  { id: 'plant',     dataName: 'Plant',      x: 303, y: 255, w: 60,    h: 77,    hoverHz: 1100, clickHz: 550, type: 'desk' },
];

/* Desk-object accent colors for shadows & glow */
const DESK_ACCENTS: Record<string, { accent: string; accentDim: string }> = {
  keyboard:  { accent: '#00EAFF', accentDim: 'rgba(0,234,255,0.12)' },
  camera:    { accent: '#FF6B35', accentDim: 'rgba(255,107,53,0.12)' },
  juice:     { accent: '#40F0AA', accentDim: 'rgba(64,240,170,0.12)' },
  dispenser: { accent: '#A855F7', accentDim: 'rgba(168,85,247,0.12)' },
  plant:     { accent: '#34D399', accentDim: 'rgba(52,211,153,0.12)' },
};

const DISCOVERY_IDS = OBJECTS.map(o => o.id);

/* ── Wall text positions (px in 805×609 space) ────────────────────── */
/*  Sub text placeholder at (417, 69, 69×157) → LEFT wall = WallNarrative
    Welcome text placeholder at (519, 68, 169.5×195.7) → RIGHT wall = WallWelcome */
const NARR_PANEL = { x: 417, y: 69, w: 69, h: 157 };
const WELCOME_POS = { x: 519, y: 45, w: 170, h: 200 };

/* ── Wall poster panel coordinates (left wall, 3 stacked panels) ─── 
   Calculated from Figma inset percentages within the 805×609 room.
   Panel 1 = top-right (user's "left"), Panel 3 = bottom-left (user's "right").
   Middle panel (Panel 2) left untouched. ─────────────────────────── */
const POSTER_LEFT  = { x: 242, y: 161, w: 70, h: 92 };
const POSTER_RIGHT = { x: 106, y: 240, w: 71, h: 91 };

/* ── Terminal deploy commands for poster overlays ────────────────── */
const TERM_LEFT_LINES = [
  { t: '$', cmd: ' git init' },
  { t: '>', cmd: ' Initialized empty repo' },
  { t: '$', cmd: ' git add .' },
  { t: '$', cmd: ' git commit -m "init"' },
  { t: '>', cmd: ' [main 3a7f2c1] init' },
  { t: '$', cmd: ' git remote add origin' },
  { t: '$', cmd: ' git push -u main' },
  { t: '\u2713', cmd: ' Branch pushed' },
  { t: '$', cmd: ' npm run build' },
  { t: '>', cmd: ' Building prod...' },
  { t: '\u2713', cmd: ' Build OK (2.1s)' },
  { t: '$', cmd: ' npm run deploy' },
  { t: '>', cmd: ' Uploading...' },
  { t: '\u2713', cmd: ' Deployed to prod' },
  { t: '$', cmd: ' git tag v2.1.0' },
  { t: '$', cmd: ' git push --tags' },
  { t: '\u2713', cmd: ' Tag v2.1.0 pushed' },
];

const TERM_RIGHT_LINES = [
  { t: '$', cmd: ' docker build -t app' },
  { t: '>', cmd: ' FROM node:20-alpine' },
  { t: '>', cmd: ' EXPOSE 3000' },
  { t: '\u2713', cmd: ' Built [app:latest]' },
  { t: '$', cmd: ' docker push reg/app' },
  { t: '>', cmd: ' Pushing layers...' },
  { t: '$', cmd: ' kubectl apply -f k8s' },
  { t: '>', cmd: ' deploy.apps/created' },
  { t: '$', cmd: ' kubectl rollout' },
  { t: '\u2713', cmd: ' Ready (3/3 pods)' },
  { t: '$', cmd: ' curl /api/health' },
  { t: '>', cmd: ' 200 {"up":true}' },
  { t: '$', cmd: ' ssh deploy@prod' },
  { t: '>', cmd: ' Connected 10.0.1.42' },
  { t: '$', cmd: ' systemctl status' },
  { t: '\u2713', cmd: ' active (running)' },
  { t: '$', cmd: ' tail -f /var/log' },
];

/* ── Chapter data for wall narrative ──────────────────────────────── */
interface Chapter {
  time: string;
  teaser: string;
  narrative: string;
  ctaLabel?: string;
  ctaRoute?: string;
}

const PROTO_CHAPTERS: Record<string, Chapter> = {
  proto1: {
    time: '9:00 AM',
    teaser: 'STILL\nROOM',
    narrative: 'SOUND HAS SHAPE. STILLROOM MAPS SPATIAL AUDIO INTO TANGIBLE EXPERIENCE — WHERE SILENCE BECOMES ARCHITECTURE AND EVERY FREQUENCY FINDS ITS PLACE IN THE ROOM.',
    ctaLabel: 'EXPLORE STILLROOM →',
    ctaRoute: 'https://stillroom-thinking-canvas.vercel.app/',
  },
  proto2: {
    time: '11:30 AM',
    teaser: 'INER\nTIA',
    narrative: 'PHYSICS-BASED MOTION THAT FEELS ALIVE. INERTIA IS A DESIGN SYSTEM WHERE EVERY TRANSITION CARRIES WEIGHT, MOMENTUM, AND INTENTION — NOTHING MOVES WITHOUT REASON.',
    ctaLabel: 'EXPLORE INERTIA →',
    ctaRoute: 'https://inertia-game-environment.vercel.app/',
  },
  proto3: {
    time: '2:15 PM',
    teaser: 'PQE\nENGINE',
    narrative: 'PERFORMANCE IS NOT AN AFTERTHOUGHT. PQE STRESS-TESTS EVERY PIXEL AND INTERACTION — MEASURING QUALITY AT SCALE SO NOTHING BREAKS WHEN IT MATTERS MOST.',
    ctaLabel: 'EXPLORE PQE →',
    ctaRoute: '/cpq-case-study',
  },
  proto4: {
    time: '5:45 PM',
    teaser: 'PLOT\nSYNC',
    narrative: 'DATA TELLS STORIES IF YOU KNOW HOW TO LISTEN. PLOTSYNC TRANSFORMS RAW NUMBERS INTO LIVING VISUALIZATIONS — SYNCING INSIGHT WITH INTUITION IN REAL TIME.',
    ctaLabel: 'EXPLORE PLOTSYNC →',
    ctaRoute: '/plotsync-case-study',
  },
  /* ── Desk / environment object chapters ──────────────────────────── */
  keyboard: {
    time: '7:15 AM',
    teaser: 'THE\nINPUT',
    narrative: 'EVERY KEY IS A DECISION. EVERY SHORTCUT A MUSCLE MEMORY BUILT OVER YEARS. THE FASTEST PATH FROM THOUGHT TO PROTOTYPE RUNS THROUGH THESE SIXTY-FIVE SWITCHES.',
  },
  camera: {
    time: '10:30 AM',
    teaser: 'CAP\nTURE',
    narrative: 'NOT EVERY BREAKTHROUGH SURVIVES THE SCREEN. SOME NEED TO BE PHOTOGRAPHED MID-PROCESS — THE WHITEBOARD SCRAWL, THE WIRE TANGLE, THE ACCIDENTAL BEAUTY.',
  },
  juice: {
    time: '2:45 PM',
    teaser: 'THE\nFUEL',
    narrative: 'THREE HOURS DEEP INTO A DEBUGGING SESSION. THE COLD GLASS SWEATS. SUGAR AND CAFFEINE AND THE STUBBORN BELIEF THAT THE NEXT ATTEMPT WILL WORK.',
  },
  dispenser: {
    time: '4:00 PM',
    teaser: 'RE\nSOURCE',
    narrative: 'THE LAB RUNS ON CONSUMABLES. FILAMENT SPOOLS, SOLDER WIRE, THERMAL PASTE. THE DISPENSER KNOWS WHAT YOU NEED BEFORE YOU DO.',
  },
  plant: {
    time: '6:30 PM',
    teaser: 'STILL\nGROWING',
    narrative: 'THE ONLY LIVING THING IN A ROOM FULL OF MACHINES. IT DOESN\'T CARE ABOUT DEADLINES. IT JUST GROWS. SLOWLY. PERSISTENTLY. A REMINDER.',
  },
};

const PROTO_FINALE: Chapter = {
  time: '11:59 PM',
  teaser: 'THE\nLAB\nSPEAKS',
  narrative: 'NINE OBJECTS. NINE STORIES. PROTOTYPES AND TOOLS AND QUIET COMPANIONS — EACH ONE A WITNESS TO THE WORK THAT HAPPENS WHEN NO ONE IS WATCHING.',
};

/* ── Audio helpers (lightweight sine beeps) ────────────────────────── */
let _audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new AudioContext();
  return _audioCtx;
}
function playHoverSound(hz: number) {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = hz;
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(); o.stop(ctx.currentTime + 0.12);
  } catch { /* */ }
}
function playCyberHoverSound() {
  try {
    const ctx = getAudioCtx();
    /* Layered sci-fi sweep: two detuned sines + a noise burst */
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.type = 'sine';   o1.frequency.setValueAtTime(1200, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
    o2.type = 'sawtooth'; o2.frequency.setValueAtTime(600, ctx.currentTime);
    o2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.03, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    o1.start(); o2.start();
    o1.stop(ctx.currentTime + 0.18); o2.stop(ctx.currentTime + 0.18);
  } catch { /* */ }
}
function playCyberClickSound() {
  try {
    const ctx = getAudioCtx();
    /* Multi-layer "system engage" sound */
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const o3 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.connect(g); o2.connect(g); o3.connect(g); g.connect(ctx.destination);
    o1.type = 'sine';     o1.frequency.value = 440;
    o2.type = 'triangle';  o2.frequency.value = 880;
    o3.type = 'square';    o3.frequency.value = 220;
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.setValueAtTime(0.07, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o1.start(); o2.start(ctx.currentTime + 0.03); o3.start(ctx.currentTime + 0.06);
    o1.stop(ctx.currentTime + 0.35); o2.stop(ctx.currentTime + 0.35); o3.stop(ctx.currentTime + 0.35);
  } catch { /* */ }
}
function playClickSound(hz: number) {
  try {
    const ctx = getAudioCtx();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.type = 'triangle'; o1.frequency.value = hz;
    o2.type = 'sine'; o2.frequency.value = hz * 2;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o1.start(); o2.start();
    o1.stop(ctx.currentTime + 0.25); o2.stop(ctx.currentTime + 0.25);
  } catch { /* */ }
}

/* ── Neon sign audio engine ────────────────────────────────────────
   Three sound stages matching the visual animation:
   Act 1 (0 – 1.5s): silence — dead sign
   Act 2 (1.5 – 4s): electrical crackle bursts — glitch
   Act 3 (4s+): steady low neon hum — locked in
   All Web Audio API, no external files. ──────────────────────────── */

function playNeonSignAudio() {
  try {
    const ctx = getAudioCtx();
    const t0 = ctx.currentTime;
    const act1End = t0 + SIGN_ACT1_END;
    const act2End = t0 + SIGN_ACT2_END;

    /* ── Act 2: Glitch crackle bursts ──────────────────────────── */
    /* Schedule 6-8 short noise bursts during the glitch window */
    const burstTimes = [0, 0.25, 0.55, 0.9, 1.2, 1.6, 1.9, 2.2];
    burstTimes.forEach(offset => {
      const when = act1End + offset;
      if (when >= act2End) return;

      /* Noise burst via oscillator pair */
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 2000 + Math.random() * 3000;
      bpf.Q.value = 0.5;
      o1.connect(bpf); o2.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
      o1.type = 'sawtooth';
      o1.frequency.value = 60 + Math.random() * 80;
      o2.type = 'square';
      o2.frequency.value = 120 + Math.random() * 200;

      const dur = 0.05 + Math.random() * 0.08;
      const vol = 0.015 + Math.random() * 0.025;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(vol, when + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

      o1.start(when); o1.stop(when + dur + 0.01);
      o2.start(when); o2.stop(when + dur + 0.01);
    });

    /* Electrical pop at the start of glitch */
    const pop = ctx.createOscillator();
    const popG = ctx.createGain();
    pop.connect(popG); popG.connect(ctx.destination);
    pop.type = 'sawtooth';
    pop.frequency.setValueAtTime(150, act1End);
    pop.frequency.exponentialRampToValueAtTime(40, act1End + 0.15);
    popG.gain.setValueAtTime(0.04, act1End);
    popG.gain.exponentialRampToValueAtTime(0.0001, act1End + 0.2);
    pop.start(act1End); pop.stop(act1End + 0.25);

    /* ── Act 3: Steady neon hum (60Hz fundamental + harmonics) ── */
    const humGain = ctx.createGain();
    humGain.connect(ctx.destination);
    humGain.gain.setValueAtTime(0, act2End);
    humGain.gain.linearRampToValueAtTime(0.012, act2End + 0.3);
    /* Very slow subtle throb */
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.4; // slow throb
    lfo.connect(lfoGain);
    lfoGain.gain.value = 0.004;
    lfoGain.connect(humGain.gain);
    lfo.start(act2End);

    /* 60Hz fundamental */
    const hum1 = ctx.createOscillator();
    hum1.type = 'sine';
    hum1.frequency.value = 60;
    hum1.connect(humGain);
    hum1.start(act2End);

    /* 120Hz second harmonic (quieter) */
    const hum2 = ctx.createOscillator();
    const hum2g = ctx.createGain();
    hum2.type = 'sine';
    hum2.frequency.value = 120;
    hum2.connect(hum2g);
    hum2g.gain.value = 0.5;
    hum2g.connect(humGain);
    hum2.start(act2End);

    /* 180Hz third harmonic (very quiet) */
    const hum3 = ctx.createOscillator();
    const hum3g = ctx.createGain();
    hum3.type = 'sine';
    hum3.frequency.value = 180;
    hum3.connect(hum3g);
    hum3g.gain.value = 0.2;
    hum3g.connect(humGain);
    hum3.start(act2End);

    /* "Lock-in" chime at Act 3 start — satisfying confirmation */
    const chime = ctx.createOscillator();
    const chimeG = ctx.createGain();
    chime.connect(chimeG); chimeG.connect(ctx.destination);
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, act2End);
    chime.frequency.exponentialRampToValueAtTime(1320, act2End + 0.1);
    chimeG.gain.setValueAtTime(0.03, act2End);
    chimeG.gain.exponentialRampToValueAtTime(0.0001, act2End + 0.5);
    chime.start(act2End); chime.stop(act2End + 0.55);

    /* Auto-stop hum after 30s to avoid indefinite playback */
    const humStopTime = act2End + 30;
    humGain.gain.setValueAtTime(0.012, humStopTime - 2);
    humGain.gain.linearRampToValueAtTime(0, humStopTime);
    hum1.stop(humStopTime + 0.1);
    hum2.stop(humStopTime + 0.1);
    hum3.stop(humStopTime + 0.1);
    lfo.stop(humStopTime + 0.1);

    return { hum1, hum2, hum3, lfo, humGain };
  } catch { return null; }
}

/* ── DOM helpers ───────────────────────────────────────────────────── */
function collectHideableEls(el: Element, out: HTMLElement[]) {
  if (el.classList.contains('contents')) {
    Array.from(el.children).forEach(c => collectHideableEls(c, out));
  } else {
    out.push(el as HTMLElement);
  }
}

/* ═══════════════════════════════════════════════════════════════════ */

interface Props {
  onNavigateBack?: () => void;
  onNavigateNext?: () => void;
  preview?: boolean;
  skipEntrance?: boolean;
}

export default function InteractivePrototypeBg({ onNavigateBack, onNavigateNext, preview, skipEntrance }: Props) {
  /* ── State ──────────────────────────────────────────────────────── */
  const [entered, setEntered] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [discoveredSet, setDiscoveredSet] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1.75);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [lampOn, setLampOn] = useState(false);
  const [neonPhase, setNeonPhase] = useState<'dead' | 'glitch' | 'live'>('dead');
  const neonAudioRef = useRef<ReturnType<typeof playNeonSignAudio>>(null);
  const navigate = useNavigate();

  /* ── Refs ───────────────────────────────────────────────────────── */
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const cloneContentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hideableCache = useRef<Record<string, HTMLElement[]>>({});
  const clkIdRef = useRef<string | null>(null);
  const lampOnRef = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const wallRefs = useRef<{
    bg: HTMLElement | null;
    wallL: SVGPathElement | null;
    wallR: SVGPathElement | null;
    floor: SVGPathElement | null;
    floorMat: SVGGElement | null;
  }>({ bg: null, wallL: null, wallR: null, floor: null, floorMat: null });

  /* Keep refs in sync */
  useEffect(() => { clkIdRef.current = clickedId; }, [clickedId]);
  useEffect(() => { lampOnRef.current = lampOn; }, [lampOn]);

  /* ── Zoom / pan callbacks ──────────────────────────────────────── */
  const zoomIn = useCallback(() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN)), []);
  const zoomReset = useCallback(() => { setZoom(1.75); setPanX(0); setPanY(0); }, []);

  /* ── Lamp toggle ───────────────────────────────────────────────── */
  const toggleLamp = useCallback(() => {
    setLampOn(prev => !prev);
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = !lampOn ? 1800 : 900;
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } catch { /* */ }
  }, [lampOn]);

  /* ── Entry animation (opacity only) ─────────────────────────────── */
  useEffect(() => {
    if (skipEntrance) { setEntered(true); return; }
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, [skipEntrance]);

  /* ── Ctrl+Wheel zoom ───────────────────────────────────────────── */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))));
    };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, []);

  /* ── Escape key: deselect clicked object ───────────────────────── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && clkIdRef.current) {
        setClickedId(null);
        setHoveredId(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ── Pan: mousedown on viewport ────────────────────────────────── */
  const onPanStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-hitzone]')) return;
    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: panX, y: panY };
    if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
  }, [panX, panY]);

  /* ── Pan: global mousemove / mouseup ───────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      setPanX(panOrigin.current.x + e.clientX - panStart.current.x);
      setPanY(panOrigin.current.y + e.clientY - panStart.current.y);
    };
    const onUp = (e: MouseEvent) => {
      if (!isPanning.current) return;
      isPanning.current = false;
      if (viewportRef.current) viewportRef.current.style.cursor = '';
      /* Tiny drag = click on background → deselect */
      if (
        Math.abs(e.clientX - panStart.current.x) < 4 &&
        Math.abs(e.clientY - panStart.current.y) < 4 &&
        clkIdRef.current
      ) {
        setClickedId(null);
        setHoveredId(null);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  /* ── Post-enter setup: hide placeholders, clone objects ─────────── */
  useEffect(() => {
    if (preview || !entered) return;
    const timer = setTimeout(() => {
      const roomEl = roomRef.current;
      if (!roomEl) return;

      /* Hide Figma placeholder shapes so our overlays take over */
      const welcome = roomEl.querySelector('[data-name="Welcome text placeholder"]');
      if (welcome) (welcome as HTMLElement).style.opacity = '0';

      const subText = roomEl.querySelector('[data-name="Sub text placeholder"]');
      if (subText) {
        /* Walk up to the absolutely-positioned flex container (2 levels) */
        const container = subText.parentElement?.parentElement;
        if (container) (container as HTMLElement).style.opacity = '0';
      }

      /* ── Wall palette: find + cache structural SVG elements ────── */
      const initPal = lampOnRef.current ? WALL_LIGHT : WALL_DARK;

      /* Root bg div — data-name="Prototype room" has bg-[#00c8b3] */
      const bgDiv = roomEl.querySelector('[data-name="Prototype room"]') as HTMLElement | null;
      if (bgDiv) {
        bgDiv.style.backgroundColor = initPal.bg;
        bgDiv.style.transition = 'background-color 800ms ease';
        wallRefs.current.bg = bgDiv;
      }

      /* Main wall Vector — first child of the room, contains 3 paths:
         path[0] = #3C3C3C (left wall),  path[1] = #E2E2E2 (right wall),  path[2] = white (floor) */
      const wallSvg = roomEl.querySelector('[data-name="Prototype room"] > [data-name="Vector"] svg g');
      if (wallSvg) {
        const paths = wallSvg.querySelectorAll('path');
        if (paths[0]) {
          (paths[0] as SVGPathElement).style.fill = initPal.wallL;
          (paths[0] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.wallL = paths[0] as SVGPathElement;
        }
        if (paths[1]) {
          (paths[1] as SVGPathElement).style.fill = initPal.wallR;
          (paths[1] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.wallR = paths[1] as SVGPathElement;
        }
        if (paths[2]) {
          (paths[2] as SVGPathElement).style.fill = initPal.floor;
          (paths[2] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.floor = paths[2] as SVGPathElement;
        }
      }

      /* Floor mat — g with opacity 0.15 */
      const floorMatG = roomEl.querySelector('[data-name="Floor mat"] svg g') as SVGGElement | null;
      if (floorMatG) {
        floorMatG.style.opacity = String(initPal.floorMat);
        floorMatG.style.transition = 'opacity 800ms ease';
        wallRefs.current.floorMat = floorMatG;
      }

      /* Clone Proto objects into the overlay layer */
      OBJECTS.forEach(obj => {
        const container = cloneContentRefs.current[obj.id];
        if (!container || container.children.length > 0) return;

        const base = roomEl.querySelector(`[data-name="${obj.dataName}"]`);
        if (!base) return;

        /* Cache the original elements for hide/show on click */
        const hideables: HTMLElement[] = [];
        collectHideableEls(base, hideables);
        hideableCache.current[obj.id] = hideables;

        /* Clone and strip attributes that could cause interference */
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'hidden';

        Array.from(base.children).forEach(child => {
          const c = child.cloneNode(true) as HTMLElement;
          /* Strip data-name to avoid duplicate selectors */
          c.querySelectorAll('[data-name]').forEach(d => d.removeAttribute('data-name'));
          /* Make strokes transparent so clone edges don't double up */
          c.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon').forEach(s =>
            s.setAttribute('stroke', 'transparent')
          );
          wrapper.appendChild(c);
        });

        container.appendChild(wrapper);
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [entered]);

  /* ── Interaction handlers ───────────────────────────────────────── */
  const onObjEnter = useCallback((id: string) => {
    setHoveredId(id);
    const obj = OBJECTS.find(o => o.id === id);
    if (obj) {
      if (obj.type === 'desk') playHoverSound(obj.hoverHz);
      else if (id === 'proto4') playCyberHoverSound();
      else playHoverSound(obj.hoverHz);
    }
  }, []);

  const onObjLeave = useCallback(() => {
    if (!clkIdRef.current) setHoveredId(null);
  }, []);

  const onObjClick = useCallback((id: string) => {
    const obj = OBJECTS.find(o => o.id === id);
    /* Second click on already-selected proto → navigate to case study */
    if (clkIdRef.current === id) {
      if (obj?.type === 'proto') {
        const meta = PROTO_META[id];
        if (meta) {
          if (meta.route.startsWith('http')) {
            window.open(meta.route, '_blank', 'noopener,noreferrer');
          } else {
            navigate(meta.route);
          }
        }
        return;
      }
      /* Desk objects: toggle off on second click */
      setClickedId(null);
      setHoveredId(null);
      return;
    }
    /* First click → select + lift */
    setClickedId(id);
    if (obj) {
      if (obj.type === 'proto') playCyberClickSound();
      else playClickSound(obj.clickHz);
    }
    setDiscoveredSet(p => {
      if (p.has(id)) return p;
      const n = new Set(p);
      n.add(id);
      return n;
    });
  }, [navigate]);

  /* ── Hide/show original elements on hover/click ──────────────────── */
  useEffect(() => {
    OBJECTS.forEach(obj => {
      const els = hideableCache.current[obj.id];
      if (!els) return;
      /* Per-object: hide if THIS object is hovered OR clicked */
      const shouldHide = hoveredId === obj.id || clickedId === obj.id;
      els.forEach(el => {
        el.style.opacity = shouldHide ? '0' : '1';
        el.style.transition = `opacity ${DUR} ${EASE_HOVER}`;
      });
    });
  }, [clickedId, hoveredId]);

  /* ── Wall color transition on lamp toggle ──────────────────────── */
  useEffect(() => {
    const w = wallRefs.current;
    const pal = lampOn ? WALL_LIGHT : WALL_DARK;
    if (w.bg) w.bg.style.backgroundColor = pal.bg;
    if (w.wallL) w.wallL.style.fill = pal.wallL;
    if (w.wallR) w.wallR.style.fill = pal.wallR;
    if (w.floor) w.floor.style.fill = pal.floor;
    if (w.floorMat) w.floorMat.style.opacity = String(pal.floorMat);
  }, [lampOn]);

  /* ── Neon sign phase sequencer ─────────────────────────────────── */
  useEffect(() => {
    if (!entered) return;
    /* Act 1 → Act 2 transition */
    const t1 = setTimeout(() => {
      setNeonPhase('glitch');
      /* Kick off audio (glitch bursts are pre-scheduled in the future) */
      neonAudioRef.current = playNeonSignAudio();
    }, SIGN_ACT1_END * 1000);
    /* Act 2 → Act 3 transition */
    const t2 = setTimeout(() => {
      setNeonPhase('live');
    }, SIGN_ACT2_END * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [entered]);

  /* ── Compute wall accent based on lamp state ──────────────────── */
  const wallAccent = lampOn ? '#FF9500' : WALL_ACCENT;

  /* ── Zoom percentage for status pill ───────────────────────────── */
  const zoomPct = Math.round(zoom * 100);

  /* ── Preview mode: artwork only, no interaction layers ── */
  if (preview) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ contain: 'strict' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: AW, height: AH }}>
            <MemoRoom />
          </div>
        </div>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 overflow-hidden"
      style={{ contain: 'strict' }}
    >
      {/* ═══ Centered viewport ═══════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <div
            className="relative transition-all duration-[1400ms] ease-out"
            style={{
              width: AW,
              height: AH,
              opacity: entered ? 1 : 0,
              transform: entered ? 'translateY(0)' : 'scale(0.97) translateY(12px)',
            }}
          >
            <div ref={viewportRef} className="absolute inset-0 overflow-hidden cursor-grab" onMouseDown={onPanStart}>

              {/* ── Layer 1: Figma artwork (no hit-testing) ──────────── */}
              <div ref={roomRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <MemoRoom />
              </div>

              {/* ── Static dark screen overlays for protos only (covers white SVG screens at rest) ── */}
              {OBJECTS.filter(o => o.type === 'proto').map((obj, idx) => {
                const isActive = hoveredId === obj.id || clickedId === obj.id;
                return (
                  <div
                    key={`scr-${obj.id}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: obj.x + SCR.x,
                      top: obj.y + SCR.y,
                      width: SCR.w,
                      height: SCR.h,
                      zIndex: 1,
                      background: 'linear-gradient(180deg, #0a0a18 0%, #0E0E16 50%, #080814 100%)',
                      borderRadius: '0.5px',
                      transform: 'skewY(30deg)',
                      transformOrigin: '0 0',
                      overflow: 'hidden',
                      opacity: isActive ? 0 : 1,
                      transition: `opacity ${DUR} ${EASE_HOVER}`,
                    }}
                  >
                    {renderProtoScreen(obj.id, idx, false, false)}
                  </div>
                );
              })}

              {/* ── Lamp brightness overlay ────────────────────────────── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: lampOn
                    ? 'radial-gradient(ellipse at 50% 30%, rgba(255,240,200,0.12) 0%, rgba(255,220,160,0.06) 40%, transparent 70%)'
                    : 'none',
                  transition: 'opacity 800ms ease',
                  opacity: lampOn ? 1 : 0,
                  zIndex: 11,
                }}
              />

              {/* ── Neon "LIVE" sign overlay ────────────────────────────
                   Positioned over the standalone Vector hanging sign.
                   Skewed to match the right-wall isometric face (30deg).
                   3 phases: dead → glitch → live (steady glow).
                   pointerEvents: none — decorative only. ───────────── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: SIGN_POS.x,
                  top: SIGN_POS.y,
                  width: SIGN_POS.w,
                  height: SIGN_POS.h,
                  zIndex: 10,
                }}
              >
                {/* ── LAYER A: Massive ambient glow spill (no skew — atmospheric fog) ── */}
                <div style={{
                  position: 'absolute',
                  left: -50, top: -40, right: -50, bottom: -60,
                  opacity: neonPhase === 'live' ? 1 : neonPhase === 'glitch' ? 0.25 : 0,
                  transition: 'opacity 600ms ease',
                  animation: neonPhase === 'live' ? 'neon-ambient-pulse 3s ease-in-out infinite' : 'none',
                }}>
                  {/* Primary green fog */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(ellipse at 50% 45%, rgba(0,255,65,0.30) 0%, rgba(0,200,50,0.15) 25%, rgba(0,140,30,0.07) 45%, transparent 70%)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                  }} />
                  {/* Secondary cyan-green bloom */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(ellipse at 50% 55%, rgba(0,255,120,0.10) 0%, rgba(0,180,60,0.05) 35%, transparent 60%)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                  }} />
                </div>

                {/* ── LAYER B: Front panel — SKEWED to match isometric face ── */}
                <div style={{
                  position: 'absolute',
                  left: SIGN_PANEL.x,
                  top: SIGN_PANEL.y,
                  width: SIGN_PANEL.w,
                  height: SIGN_PANEL.h,
                  transform: 'skewY(30deg)',
                  transformOrigin: '0 0',
                  overflow: 'visible',
                }}>
                  {/* B1: Dark panel background */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: '#080E0A',
                    borderRadius: '1.5px',
                    overflow: 'hidden',
                    opacity: neonPhase === 'dead' ? 0 : 1,
                    transition: 'opacity 200ms ease',
                    animation: neonPhase === 'glitch'
                      ? `neon-bg-strobe ${SIGN_ACT2_DUR}s steps(1) both`
                      : neonPhase === 'live'
                      ? 'neon-bg-breathe 4s ease-in-out infinite'
                      : 'none',
                  }} />

                  {/* B2: NEON TUBE BORDER FRAME — glowing green border */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '2px',
                    border: neonPhase === 'live'
                      ? '1.2px solid rgba(0,255,65,0.85)'
                      : neonPhase === 'glitch'
                      ? '1px solid rgba(0,255,65,0.35)'
                      : '1px solid rgba(0,255,65,0)',
                    boxShadow: neonPhase === 'live'
                      ? [
                          'inset 0 0 3px rgba(0,255,65,0.6)',
                          'inset 0 0 6px rgba(0,200,50,0.35)',
                          'inset 0 0 12px rgba(0,160,40,0.15)',
                          '0 0 2px rgba(0,255,65,0.8)',
                          '0 0 5px rgba(0,240,60,0.6)',
                          '0 0 10px rgba(0,200,50,0.45)',
                          '0 0 18px rgba(0,180,40,0.3)',
                          '0 0 30px rgba(0,140,30,0.15)',
                          '0 0 45px rgba(0,100,20,0.08)',
                        ].join(', ')
                      : neonPhase === 'glitch'
                      ? [
                          'inset 0 0 2px rgba(0,255,65,0.3)',
                          '0 0 3px rgba(0,255,65,0.3)',
                          '0 0 8px rgba(0,180,40,0.15)',
                        ].join(', ')
                      : 'none',
                    transition: 'border-color 400ms ease, box-shadow 400ms ease',
                    animation: neonPhase === 'live' ? 'neon-border-breathe 3s ease-in-out infinite' : 'none',
                    zIndex: 3,
                  }} />

                  {/* B3: Content — LIVE text with mega green glow + micro-flicker in live */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: neonPhase === 'glitch'
                      ? `neon-flicker ${SIGN_ACT2_DUR}s steps(1) both`
                      : neonPhase === 'live'
                      ? 'neon-micro-flicker 9s ease-in-out infinite'
                      : 'none',
                    opacity: neonPhase === 'dead' ? 0 : 1,
                    transition: neonPhase === 'live' ? 'opacity 300ms ease' : 'none',
                    zIndex: 2,
                  }}>
                    {/* Chromatic aberration (glitch phase) */}
                    {neonPhase === 'glitch' && (
                      <>
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: `neon-chromatic-r ${SIGN_ACT2_DUR}s linear both`,
                        }}>
                          <span style={{
                            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                            fontSize: '14px', letterSpacing: '3px',
                            color: '#00FF41', lineHeight: 1,
                          }}>LIVE</span>
                        </div>
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: `neon-chromatic-c ${SIGN_ACT2_DUR}s linear both`,
                        }}>
                          <span style={{
                            fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                            fontSize: '14px', letterSpacing: '3px',
                            color: '#FF00FF', lineHeight: 1,
                          }}>LIVE</span>
                        </div>
                      </>
                    )}

                    {/* Main LIVE text with jitter */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: neonPhase === 'glitch'
                        ? `neon-jitter ${SIGN_ACT2_DUR}s linear both`
                        : 'none',
                    }}>
                      <span style={{
                        fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                        fontSize: '14px',
                        letterSpacing: '3px',
                        lineHeight: 1,
                        color: neonPhase === 'live' ? '#00FF41' : '#00FF4166',
                        textShadow: neonPhase === 'live'
                          ? [
                              '0 0 1px rgba(180,255,200,0.9)',
                              '0 0 2px rgba(100,255,140,0.8)',
                              '0 0 4px #00FF41',
                              '0 0 8px #00FF41',
                              '0 0 12px rgba(0,240,60,0.9)',
                              '0 0 18px rgba(0,200,50,0.7)',
                              '0 0 28px rgba(0,180,40,0.5)',
                              '0 0 40px rgba(0,160,30,0.35)',
                              '0 0 55px rgba(0,120,25,0.2)',
                              '0 0 75px rgba(0,80,15,0.1)',
                            ].join(', ')
                          : '0 0 2px #00FF4133',
                        transition: 'color 400ms ease, text-shadow 400ms ease',
                        animation: neonPhase === 'live' ? 'neon-text-breathe 3s ease-in-out infinite' : 'none',
                      }}>LIVE</span>
                    </div>

                    {/* Scan-line tear (glitch only) */}
                    {neonPhase === 'glitch' && (
                      <div style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        height: '2.5px',
                        backgroundImage: 'linear-gradient(90deg, transparent 5%, rgba(0,255,65,0.8) 20%, rgba(255,255,255,0.9) 50%, rgba(255,0,255,0.5) 80%, transparent 95%)',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 100%',
                        animation: `neon-scanline ${SIGN_ACT2_DUR}s linear both`,
                      }} />
                    )}
                  </div>

                  {/* B4: Inner diffuse green fill glow */}
                  <div style={{
                    position: 'absolute', inset: '2px',
                    borderRadius: '1px',
                    backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.10) 0%, rgba(0,200,50,0.04) 50%, transparent 80%)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '100% 100%',
                    opacity: neonPhase === 'live' ? 1 : 0,
                    transition: 'opacity 500ms ease',
                    animation: neonPhase === 'live' ? 'neon-ambient-pulse 3s ease-in-out infinite' : 'none',
                    zIndex: 1,
                  }} />
                </div>

                {/* ── LAYER C: Green tint wash over the sign body ── */}
                <div style={{
                  position: 'absolute', inset: -5,
                  backgroundImage: 'radial-gradient(ellipse at 50% 55%, rgba(0,255,65,0.15) 0%, rgba(0,180,40,0.06) 35%, transparent 60%)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: '100% 100%',
                  opacity: neonPhase === 'live' ? 1 : 0,
                  transition: 'opacity 800ms ease',
                }} />

                {/* ── LAYER D: Downward light spill onto wall below ── */}
                <div style={{
                  position: 'absolute',
                  left: 2, right: 2,
                  top: SIGN_PANEL.y + SIGN_PANEL.h + 4,
                  height: 40,
                  backgroundImage: 'linear-gradient(180deg, rgba(0,255,65,0.12) 0%, rgba(0,200,50,0.05) 30%, rgba(0,140,30,0.02) 60%, transparent 100%)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center top',
                  backgroundSize: '100% 100%',
                  transform: 'skewY(30deg)',
                  transformOrigin: '0 0',
                  opacity: neonPhase === 'live' ? 1 : 0,
                  transition: 'opacity 600ms ease',
                  animation: neonPhase === 'live' ? 'neon-ambient-pulse 3s ease-in-out infinite' : 'none',
                }} />

                {/* ── LAYER E: Dense sign-source smoke ── */}
                {neonPhase === 'live' && (
                  <div style={{
                    position: 'absolute',
                    left: SIGN_PANEL.x - 12,
                    top: SIGN_PANEL.y + SIGN_PANEL.h - 15,
                    width: SIGN_PANEL.w + 24,
                    height: 120,
                    transform: 'skewY(30deg)',
                    transformOrigin: '0 0',
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}>
                    {[
                      { left: '10%', w: 30, blur: 6, dur: 6, delay: 0, op: 0.35 },
                      { left: '40%', w: 22, blur: 5, dur: 4.5, delay: 1, op: 0.4 },
                      { left: '65%', w: 28, blur: 7, dur: 7, delay: 2.5, op: 0.3 },
                      { left: '25%', w: 18, blur: 4, dur: 5, delay: 3.5, op: 0.45 },
                      { left: '55%', w: 35, blur: 8, dur: 8, delay: 0.5, op: 0.25 },
                      { left: '80%', w: 20, blur: 5, dur: 5.5, delay: 4, op: 0.35 },
                    ].map((s, i) => (
                      <div key={`sign-smoke-${i}`} style={{
                        position: 'absolute',
                        bottom: 0, left: s.left,
                        width: s.w, height: s.w,
                        borderRadius: '50%',
                        backgroundImage: `radial-gradient(circle, rgba(0,255,65,${s.op}) 0%, rgba(100,255,150,${s.op * 0.4}) 40%, transparent 70%)`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: '100% 100%',
                        filter: `blur(${s.blur}px)`,
                        animation: `smoke-rise-${(i % 5) + 1} ${s.dur}s ease-out infinite`,
                        animationDelay: `${s.delay}s`,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Layer 2: Wall text overlays ───────────────────────── */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 12 }}>
                {/* LEFT wall — Narrative (skewY -30deg)
                    Sits on the back-left isometric wall at the same position
                    as the Sub text placeholder (417, 69, 69×157). Uses the
                    proven clip-path + skew pattern from Rooms 1–3. */}
                <div
                  className="absolute"
                  style={{
                    left: NARR_PANEL.x,
                    top: NARR_PANEL.y,
                    width: NARR_PANEL.w,
                    height: NARR_PANEL.h,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    clipPath: 'polygon(0% 26.8%, 100% 0%, 97.4% 76.5%, 0% 100%)',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      width: '100%', height: '100%',
                      transform: 'skewY(-30deg) skewX(0.5deg)',
                      transformOrigin: '0% 26.8%',
                    }}>
                      <div style={{ position: 'absolute', left: 0, top: '26.8%', width: '100%', height: '73.2%' }}>
                        <WallNarrative
                          clickedId={clickedId}
                          entered={entered}
                          discoveredSet={discoveredSet}
                          compact
                          chapters={PROTO_CHAPTERS}
                          objectIds={DISCOVERY_IDS}
                          finale={PROTO_FINALE}
                          accent={WALL_ACCENT}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT wall — Welcome (skewY 30deg)
                    Sits where the Welcome text placeholder was (519, 68). */}
                <div
                  className="absolute"
                  style={{
                    left: WELCOME_POS.x,
                    top: WELCOME_POS.y,
                    width: WELCOME_POS.w,
                    height: WELCOME_POS.h,
                  }}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0,
                    width: WELCOME_POS.w, height: 130,
                    transform: 'skewY(30deg)',
                    transformOrigin: '0 0',
                    overflow: 'hidden',
                  }}>
                    <WallWelcome
                      entered={entered}
                      discoveredCount={discoveredSet.size}
                      dimmed={!lampOn || !!clickedId}
                      label="THE PROTOTYPE LAB"
                      title1="BUILD"
                      title2="LEARN"
                      subtitle="EVERY PROTOTYPE HOLDS A LESSON · CLICK TO DISCOVER"
                      totalDiscoverable={DISCOVERY_IDS.length}
                      accent={wallAccent}
                      inlineTitle
                    />
                  </div>
                </div>

                {/* ── WALL POSTER terminal overlays (left wall, panels 1 & 3) ── */}
                {[
                  { panel: POSTER_LEFT, lines: TERM_LEFT_LINES, id: 'term-l' },
                  { panel: POSTER_RIGHT, lines: TERM_RIGHT_LINES, id: 'term-r' },
                ].map(({ panel, lines, id }) => {
                  const totalLines = lines.length;
                  const lineH = 5.5;
                  const cycleDur = totalLines * 1.8;
                  return (
                  <div
                    key={id}
                    className="absolute"
                    style={{
                      left: panel.x,
                      top: panel.y,
                      width: panel.w,
                      height: panel.h,
                      clipPath: 'polygon(0% 44%, 100% 0%, 100% 56%, 0% 100%)',
                      opacity: entered ? 1 : 0,
                      transition: 'opacity 1200ms ease 800ms',
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      transform: 'skewY(-30deg)',
                      transformOrigin: '100% 0%',
                      overflow: 'hidden',
                    }}>
                      {/* Dark terminal bg */}
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)' }} />
                      {/* CRT scanlines */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,255,65,0.03) 1px, rgba(0,255,65,0.03) 2px)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '100% 2px',
                        pointerEvents: 'none',
                      }} />
                      {/* CRT flicker */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        animation: 'crt-flicker 4s ease-in-out infinite',
                        pointerEvents: 'none',
                      }} />
                      {/* Typewriter scrolling lines */}
                      <div style={{
                        position: 'absolute', left: 3, right: 2, top: 3, bottom: 3,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          animation: `poster-scroll-${id} ${cycleDur}s steps(${totalLines}, end) infinite`,
                        }}>
                          {[...lines, ...lines].map((line, i) => (
                            <div key={`${id}-${i}`} style={{
                              fontFamily: "'Courier New', 'Consolas', monospace",
                              fontSize: '3.5px',
                              lineHeight: `${lineH}px`,
                              height: `${lineH}px`,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              color: line.t === '\u2713' ? '#40F0AA'
                                : line.t === '>' ? 'rgba(0,255,65,0.4)'
                                : 'rgba(0,255,65,0.75)',
                              textShadow: line.t === '\u2713' ? '0 0 3px rgba(64,240,170,0.5)'
                                : line.t === '$' ? '0 0 2px rgba(0,255,65,0.3)' : 'none',
                              animation: `typewriter-reveal ${(cycleDur / totalLines) * 0.7}s steps(20, end) ${(i % totalLines) * (cycleDur / totalLines)}s both infinite`,
                            }}>
                              <span style={{
                                color: line.t === '\u2713' ? '#40F0AA'
                                  : line.t === '$' ? '#00FF41' : 'rgba(0,255,65,0.3)',
                              }}>{line.t}</span>
                              {line.cmd}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Blinking cursor */}
                      <div style={{
                        position: 'absolute', left: 3, bottom: 5,
                        width: '2.5px', height: '4px',
                        backgroundColor: '#00FF41',
                        boxShadow: '0 0 3px #00FF41, 0 0 6px rgba(0,255,65,0.4)',
                        animation: 'cursor-blink 1s steps(2, start) infinite',
                      }} />
                      {/* Top/bottom fade */}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, top: 0, height: 8,
                        backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, transparent 100%)',
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'center top', backgroundSize: '100% 100%',
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0, height: 8,
                        backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%)',
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'center bottom', backgroundSize: '100% 100%',
                        pointerEvents: 'none',
                      }} />
                      {/* Border glow */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        borderWidth: '0.5px', borderStyle: 'solid',
                        borderColor: 'rgba(0,255,65,0.15)',
                        boxShadow: 'inset 0 0 4px rgba(0,255,65,0.05), 0 0 3px rgba(0,255,65,0.08)',
                        pointerEvents: 'none',
                      }} />
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* ── Layer 2b: Spotlight (CSS hole-punch dim overlay) ──── */}
              {(() => {
                const spotObj = clickedId ? OBJECTS.find(o => o.id === clickedId) : null;
                const isActive = !!spotObj;
                const cx = spotObj ? spotObj.x + spotObj.w / 2 : 0;
                const cy = spotObj ? spotObj.y + spotObj.h / 2 : 0;
                const isProto = spotObj?.type === 'proto';
                const meta = spotObj && isProto ? PROTO_META[spotObj.id] : null;
                const deskMeta = spotObj && !isProto ? DESK_ACCENTS[spotObj.id] : null;
                const accent = meta?.accent || deskMeta?.accent || '#E8501A';
                const holeR = spotObj
                  ? Math.max(spotObj.w, spotObj.h) * (isProto ? 2.2 : 2.8)
                  : 80;
                return (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      zIndex: 12,
                      opacity: isActive ? 1 : 0,
                      transition: `opacity ${DUR} ${EASE_CLICK}`,
                    }}
                  >
                    {/* Dark blanket with radial cutout */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isActive
                          ? `radial-gradient(circle ${holeR}px at ${cx}px ${cy}px, transparent 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.55) 100%)`
                          : 'transparent',
                        transition: `background ${DUR} ${EASE_CLICK}`,
                      }}
                    />
                    {/* Warm accent glow band around object */}
                    {isActive && (
                      <div
                        className="absolute"
                        style={{
                          left: cx - holeR * 1.5,
                          top: cy - holeR * 0.8,
                          width: holeR * 3,
                          height: holeR * 1.6,
                          background: `radial-gradient(ellipse at center, ${accent}18 0%, ${accent}08 40%, transparent 70%)`,
                        }}
                      />
                    )}
                  </div>
                );
              })()}

              {/* ── Layer 3: Clone layer (lifted copies) ─────────────��─ */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
                {OBJECTS.map((obj, idx) => {
                  const isHov = hoveredId === obj.id;
                  const isClk = clickedId === obj.id;
                  const active = isHov || isClk;
                  const isProto = obj.type === 'proto';
                  const meta = isProto ? PROTO_META[obj.id] : null;
                  const deskMeta = !isProto ? DESK_ACCENTS[obj.id] : null;
                  const accent = meta?.accent || deskMeta?.accent || '#E8501A';
                  const liftPx = isClk ? (isProto ? 24 : CLICK_LIFT) : isHov ? (isProto ? 8 : HOVER_LIFT) : 0;
                  const scale = isClk ? (isProto ? 1.28 : 1.25) : isHov ? (isProto ? 1.12 : 1.15) : 1;
                  const ease = isClk ? EASE_CLICK : EASE_HOVER;

                  return (
                    <div key={obj.id}>
                      {/* Outer: position + scale + visibility */}
                      <div
                        className="absolute"
                        style={{
                          left: obj.x,
                          top: obj.y,
                          width: obj.w,
                          height: obj.h,
                          transform: `scale(${scale})`,
                          transformOrigin: 'center center',
                          transition: `transform ${DUR} ${ease}, opacity ${DUR} ${ease}`,
                          opacity: active ? 1 : 0,
                        }}
                      >
                        {/* Inner: lift + shadow + clone content */}
                        <div
                          className="absolute"
                          style={{
                            inset: 0,
                            transform: `translateY(-${liftPx}px)`,
                            transition: `transform ${DUR} ${ease}`,
                            filter: isClk
                              ? `drop-shadow(0 ${isProto ? 24 : 18}px ${isProto ? 12 : 10}px ${accent}33) drop-shadow(0 4px 10px ${accent}1a)`
                              : isHov
                              ? `drop-shadow(0 ${isProto ? 8 : 6}px ${isProto ? 6 : 4}px ${accent}22) drop-shadow(0 2px 5px ${accent}11)`
                              : 'none',
                          }}
                        >
                          {/* Clone content target */}
                          <div
                            className="absolute"
                            style={{ inset: 0 }}
                            ref={el => { cloneContentRefs.current[obj.id] = el; }}
                          />
                          {/* Dark screen overlay — only for proto monitors */}
                          {isProto && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                left: SCR.x,
                                top: SCR.y,
                                width: SCR.w,
                                height: SCR.h,
                                background: 'linear-gradient(180deg, #0a0a18 0%, #0E0E16 50%, #080814 100%)',
                                borderRadius: '0.5px',
                                transform: 'skewY(30deg)',
                                transformOrigin: '0 0',
                                overflow: 'hidden',
                              }}
                            >
                              {/* Cyberpunk screen content — on the lifted clone */}
                              {renderProtoScreen(obj.id, idx, active, isClk)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Click glow ring — accent-colored */}
                      {isClk && (
                        <div
                          className="absolute rounded-full"
                          style={{
                            left: obj.x + obj.w / 2 - (isProto ? 50 : 30),
                            top: obj.y + obj.h - (isProto ? 20 : 10),
                            width: isProto ? 100 : 60,
                            height: isProto ? 40 : 24,
                            background: `radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%)`,
                            animation: 'proto-glow 2s ease-in-out infinite',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Layer 4: Hit zones ────────────────────────────────── */}
              {OBJECTS.map(obj => (
                <div
                  key={obj.id}
                  data-hitzone
                  className="absolute cursor-pointer"
                  style={{
                    left: obj.x - 6,
                    top: obj.y - 6,
                    width: obj.w + 12,
                    height: obj.h + 12,
                    zIndex: 20,
                  }}
                  onMouseEnter={() => onObjEnter(obj.id)}
                  onMouseLeave={onObjLeave}
                  onClick={() => onObjClick(obj.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ROOM-FILLING SMOKE / FOG OVERLAY ═══════════════════════
           Activates once the neon sign reaches live phase.
           Fades in over ~4s, then loops forever.
           pointerEvents:none so clicks pass through.
           z-index 24 — above artwork, below controls (28). ════════ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 24,
          opacity: neonPhase === 'live' ? 1 : 0,
          transition: 'opacity 4000ms ease-in',
        }}
      >
        {/* ── Ground-hugging haze band (bottom 40%) ── */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0, height: '45%',
          backgroundImage: 'linear-gradient(0deg, rgba(0,255,65,0.06) 0%, rgba(0,200,50,0.03) 40%, transparent 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          backgroundSize: '100% 100%',
          animation: 'fog-ground-pulse 8s ease-in-out infinite',
        }} />

        {/* ── Drifting fog patch 1 — large, slow, left-to-right ── */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '-20%',
          width: '70%', height: '40%',
          borderRadius: '50%',
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.07) 0%, rgba(0,200,60,0.035) 40%, transparent 70%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
          filter: 'blur(40px)',
          animation: 'fog-drift-lr 25s ease-in-out infinite',
        }} />

        {/* ── Drifting fog patch 2 — medium, right-to-left ── */}
        <div style={{
          position: 'absolute',
          top: '50%', right: '-15%',
          width: '55%', height: '35%',
          borderRadius: '50%',
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.06) 0%, rgba(0,180,50,0.03) 45%, transparent 70%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
          filter: 'blur(35px)',
          animation: 'fog-drift-rl 20s ease-in-out infinite',
          animationDelay: '3s',
        }} />

        {/* ── Drifting fog patch 3 — upper haze, slow diagonal ── */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '10%',
          width: '60%', height: '30%',
          borderRadius: '50%',
          backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,65,0.04) 0%, rgba(0,200,60,0.02) 40%, transparent 65%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
          filter: 'blur(45px)',
          animation: 'fog-drift-diag 30s ease-in-out infinite',
          animationDelay: '7s',
        }} />

        {/* ── Rising columns — 8 columns spread across the bottom ── */}
        {[
          { left: '8%', w: 80, h: 300, blur: 25, dur: 12, delay: 0, op: 0.08 },
          { left: '22%', w: 100, h: 350, blur: 30, dur: 15, delay: 2, op: 0.06 },
          { left: '38%', w: 70, h: 280, blur: 22, dur: 10, delay: 4, op: 0.09 },
          { left: '52%', w: 90, h: 320, blur: 28, dur: 14, delay: 1, op: 0.07 },
          { left: '65%', w: 110, h: 380, blur: 35, dur: 18, delay: 5, op: 0.05 },
          { left: '78%', w: 75, h: 260, blur: 20, dur: 11, delay: 3, op: 0.08 },
          { left: '88%', w: 95, h: 340, blur: 32, dur: 16, delay: 6, op: 0.06 },
          { left: '45%', w: 120, h: 400, blur: 40, dur: 20, delay: 8, op: 0.05 },
        ].map((col, i) => (
          <div key={`fog-col-${i}`} style={{
            position: 'absolute',
            bottom: 0,
            left: col.left,
            width: col.w,
            height: col.h,
            borderRadius: '50% 50% 0 0',
            backgroundImage: `radial-gradient(ellipse at 50% 90%, rgba(0,255,65,${col.op}) 0%, rgba(0,200,60,${col.op * 0.5}) 30%, rgba(0,160,40,${col.op * 0.2}) 55%, transparent 75%)`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center bottom',
            backgroundSize: '100% 100%',
            filter: `blur(${col.blur}px)`,
            animation: `fog-column-rise ${col.dur}s ease-in-out infinite`,
            animationDelay: `${col.delay}s`,
          }} />
        ))}

        {/* ── Thick mid-room fog bank (slowly pulses) ── */}
        <div style={{
          position: 'absolute',
          top: '35%', left: '-5%', right: '-5%', height: '35%',
          backgroundImage: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,65,0.05) 0%, rgba(0,200,50,0.025) 35%, transparent 65%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
          filter: 'blur(30px)',
          animation: 'fog-bank-pulse 12s ease-in-out infinite',
          animationDelay: '2s',
        }} />

        {/* ── Wispy tendrils — small fast-moving particles ── */}
        {[
          { left: '15%', top: '60%', w: 40, dur: 8, delay: 0 },
          { left: '35%', top: '70%', w: 30, dur: 6, delay: 2 },
          { left: '55%', top: '55%', w: 35, dur: 7, delay: 4 },
          { left: '75%', top: '65%', w: 45, dur: 9, delay: 1 },
          { left: '25%', top: '45%', w: 25, dur: 10, delay: 5 },
          { left: '60%', top: '40%', w: 30, dur: 8.5, delay: 3 },
          { left: '85%', top: '50%', w: 35, dur: 7.5, delay: 6 },
          { left: '10%', top: '35%', w: 28, dur: 11, delay: 7 },
          { left: '48%', top: '75%', w: 38, dur: 9, delay: 2.5 },
          { left: '70%', top: '30%', w: 32, dur: 12, delay: 4.5 },
        ].map((t, i) => (
          <div key={`fog-tendril-${i}`} style={{
            position: 'absolute',
            left: t.left, top: t.top,
            width: t.w, height: t.w,
            borderRadius: '50%',
            backgroundImage: 'radial-gradient(circle, rgba(0,255,65,0.08) 0%, rgba(0,200,60,0.03) 50%, transparent 75%)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '100% 100%',
            filter: 'blur(12px)',
            animation: `fog-tendril ${t.dur}s ease-in-out infinite`,
            animationDelay: `${t.delay}s`,
          }} />
        ))}
      </div>

      {/* ═══ Room label (top-left) ═══════════════════════════════════ */}
      <div
        className="absolute top-4 left-5 z-[28] transition-all duration-[1200ms] ease-out"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        <div
          className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[5px] mb-0.5"
          style={{ color: 'rgba(232,80,26,0.5)' }}
        >
          ROOM 04
        </div>
        <span
          className="font-['Caladea',serif] tracking-[0.5px]"
          style={{ fontSize: 20, lineHeight: 1.15, color: 'rgba(255,255,255,0.8)' }}
        >
          Prototype &amp; Engineering
        </span>
      </div>

      {/* ═══ Navigation buttons (top-right) ═══════════════════════════ */}
      {onNavigateBack && (
        <div
          className="absolute top-4 right-5 z-[28] transition-all duration-[1600ms] ease-out"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <button
            onClick={onNavigateBack}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer"
          >
            <span
              className="text-[12px] transition-transform duration-300 group-hover:-translate-x-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              &larr;
            </span>
            <span className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[2px] text-white/40">
              BACK TO THINKING
            </span>
          </button>
        </div>
      )}

      {onNavigateNext && (
        <div
          className="absolute top-14 right-5 z-[28] transition-all duration-[1600ms] ease-out"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          <button
            onClick={onNavigateNext}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer"
          >
            <span className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[2px] text-white/40">
              NEXT ROOM
            </span>
            <span
              className="text-[12px] transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              &rarr;
            </span>
          </button>
        </div>
      )}

      {/* ══ Status pill (bottom-left) ════════════════════════════════ */}
      <div
        className="absolute bottom-4 left-5 z-[28] flex items-center gap-1.5 transition-all duration-[1600ms] ease-out bg-black/30 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/[0.04]"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <div
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: WALL_ACCENT }}
        />
        <span
          className="font-['Cambay',sans-serif] text-[11px] text-white/30 tracking-[0.5px]"
        >
          Prototype Lab &middot; Room 04 &middot; {discoveredSet.size}/{OBJECTS.length} Discovered
        </span>
      </div>

      {/* ═══ Controls bar (bottom-right) ══════════════════════════════ */}
      <div
        className="absolute bottom-4 right-5 z-[28] flex items-center gap-2 transition-all duration-[1600ms] ease-out bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/[0.06]"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>

        {/* Zoom Reset / percentage */}
        <button
          onClick={zoomReset}
          className="h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 font-['Cambay',sans-serif] text-[11px] tracking-[0.5px] transition-all duration-150 cursor-pointer"
          title="Reset View"
        >
          <RotateCcw size={10} />
          <span>{zoomPct}%</span>
        </button>

        {/* Zoom In */}
        <button
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.06] mx-1" />

        {/* Lamp toggle */}
        <button
          onClick={toggleLamp}
          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200 cursor-pointer"
          style={{
            background: lampOn ? 'rgba(255,217,102,0.08)' : 'rgba(255,255,255,0.04)',
            borderColor: lampOn ? 'rgba(255,217,102,0.15)' : 'rgba(255,255,255,0.06)',
            color: lampOn ? 'rgba(255,217,102,0.7)' : 'rgba(255,255,255,0.25)',
          }}
          title={lampOn ? 'Lights Off' : 'Lights On'}
        >
          <Lightbulb size={14} />
        </button>

        {/* Pan indicator */}
        <div
          className="h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.03] border border-white/[0.04]"
          title="Click & drag to pan"
        >
          <Move size={10} className="text-white/25" />
          <span className="font-['Cambay',sans-serif] text-[10px] text-white/20 tracking-[0.3px]">Drag to pan</span>
        </div>

        {/* Studio Radio */}
        <StudioRadio inline />
      </div>

      {/* ── Glow animation keyframes ──────────────────────────────── */}
      <style>{`
        @keyframes proto-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes pscr-scan {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 0.4; }
          95%  { opacity: 0.4; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes pscr-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.4); }
        }
        @keyframes pscr-bar-fill {
          0%   { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
        @keyframes pscr-arrow-pulse {
          0%, 100% { opacity: 0.4; transform: translateX(0); }
          50%      { opacity: 1; transform: translateX(1px); }
        }

        /* ── Neon sign: background strobe (Act 2 glitch) ────────── */
        @keyframes neon-bg-strobe {
          0%   { background-color: #080E0A; }
          3%   { background-color: #d0f0d8; }
          5%   { background-color: #080E0A; }
          7%   { background-color: #c0e8c8; }
          9%   { background-color: #080E0A; }
          22%  { background-color: #080E0A; }
          24%  { background-color: #e0ffe8; }
          25%  { background-color: #0C1A0E; }
          27%  { background-color: #b8e0c0; }
          28%  { background-color: #080E0A; }
          42%  { background-color: #080E0A; }
          43%  { background-color: #d8f5e0; }
          45%  { background-color: #080E0A; }
          62%  { background-color: #080E0A; }
          63%  { background-color: #e0ffe8; }
          65%  { background-color: #c0e0c8; }
          68%  { background-color: #e0ffe8; }
          70%  { background-color: #080E0A; }
          84%  { background-color: #080E0A; }
          85%  { background-color: #e0ffe8; }
          87%  { background-color: #d0f8d8; }
          89%  { background-color: #e0ffe8; }
          100% { background-color: #080E0A; }
        }

        /* ── Neon sign: background breathe (Act 3 live) ──────────── */
        @keyframes neon-bg-breathe {
          0%, 100% { background-color: #080E0A; }
          15%      { background-color: #0A140C; }
          35%      { background-color: #0C1A0E; }
          50%      { background-color: #0A130B; }
          65%      { background-color: #091008; }
          85%      { background-color: #080E0A; }
        }

        /* ── Neon sign: flicker (Act 2 glitch) ───────────────────── */
        @keyframes neon-flicker {
          0%   { opacity: 0; }
          2%   { opacity: 1; }
          4%   { opacity: 0; }
          6%   { opacity: 0.9; }
          8%   { opacity: 0; }
          10%  { opacity: 0.4; }
          11%  { opacity: 0; }
          20%  { opacity: 0; }
          22%  { opacity: 1; }
          23%  { opacity: 0; }
          25%  { opacity: 0.7; }
          26%  { opacity: 0; }
          40%  { opacity: 0; }
          42%  { opacity: 1; }
          43%  { opacity: 0.3; }
          44%  { opacity: 1; }
          46%  { opacity: 0; }
          60%  { opacity: 0; }
          62%  { opacity: 1; }
          64%  { opacity: 0.8; }
          67%  { opacity: 1; }
          69%  { opacity: 0; }
          72%  { opacity: 0.5; }
          73%  { opacity: 0; }
          82%  { opacity: 0; }
          84%  { opacity: 1; }
          86%  { opacity: 0.9; }
          88%  { opacity: 1; }
          92%  { opacity: 1; }
          100% { opacity: 1; }
        }

        /* ── Neon sign: horizontal jitter (Act 2 glitch) ─────────── */
        @keyframes neon-jitter {
          0%, 100% { transform: translateX(0); }
          5%  { transform: translateX(1.2px); }
          10% { transform: translateX(-0.8px); }
          15% { transform: translateX(0); }
          25% { transform: translateX(0.6px); }
          30% { transform: translateX(-1px); }
          35% { transform: translateX(0); }
          45% { transform: translateX(-0.5px); }
          50% { transform: translateX(0.9px); }
          55% { transform: translateX(0); }
          65% { transform: translateX(1.1px); }
          70% { transform: translateX(-0.7px); }
          75% { transform: translateX(0); }
          85% { transform: translateX(0.3px); }
          90% { transform: translateX(0); }
        }

        /* ── Neon sign: chromatic aberration red channel ──────────── */
        @keyframes neon-chromatic-r {
          0%, 100% { transform: translateX(0.8px); opacity: 0.5; }
          10% { transform: translateX(1.5px); opacity: 0.7; }
          20% { transform: translateX(0.3px); opacity: 0.3; }
          40% { transform: translateX(1.8px); opacity: 0.8; }
          60% { transform: translateX(0.5px); opacity: 0.4; }
          80% { transform: translateX(1.2px); opacity: 0.6; }
          95% { transform: translateX(0); opacity: 0; }
        }

        /* ── Neon sign: chromatic aberration cyan channel ─────────── */
        @keyframes neon-chromatic-c {
          0%, 100% { transform: translateX(-0.8px); opacity: 0.4; }
          15% { transform: translateX(-1.6px); opacity: 0.6; }
          30% { transform: translateX(-0.2px); opacity: 0.2; }
          50% { transform: translateX(-2px); opacity: 0.7; }
          70% { transform: translateX(-0.4px); opacity: 0.3; }
          85% { transform: translateX(-1px); opacity: 0.5; }
          95% { transform: translateX(0); opacity: 0; }
        }

        /* ── Neon sign: scan line tear (Act 2 glitch) ────────────── */
        @keyframes neon-scanline {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 0.8; }
          15%  { top: 30%; opacity: 0; }
          25%  { top: 10%; opacity: 0.6; }
          35%  { top: 70%; opacity: 0; }
          50%  { top: 45%; opacity: 0.9; }
          60%  { top: 80%; opacity: 0; }
          75%  { top: 20%; opacity: 0.5; }
          85%  { top: 90%; opacity: 0; }
          100% { top: 50%; opacity: 0; }
        }

        /* ── Neon sign: border tube breathe (Act 3 live) ─────────── */
        @keyframes neon-border-breathe {
          0%, 100% {
            box-shadow:
              inset 0 0 3px rgba(0,255,65,0.5),
              inset 0 0 6px rgba(0,200,50,0.3),
              inset 0 0 12px rgba(0,160,40,0.12),
              0 0 2px rgba(0,255,65,0.7),
              0 0 5px rgba(0,240,60,0.5),
              0 0 10px rgba(0,200,50,0.4),
              0 0 18px rgba(0,180,40,0.25),
              0 0 30px rgba(0,140,30,0.12),
              0 0 45px rgba(0,100,20,0.06);
          }
          50% {
            box-shadow:
              inset 0 0 4px rgba(0,255,65,0.7),
              inset 0 0 8px rgba(0,200,50,0.45),
              inset 0 0 14px rgba(0,160,40,0.2),
              0 0 3px rgba(0,255,65,0.9),
              0 0 7px rgba(0,240,60,0.7),
              0 0 14px rgba(0,200,50,0.55),
              0 0 22px rgba(0,180,40,0.4),
              0 0 38px rgba(0,140,30,0.2),
              0 0 55px rgba(0,100,20,0.1);
          }
        }

        /* ── Neon sign: steady glow breath (Act 3 live) ──────────── */
        @keyframes neon-text-breathe {
          0%, 100% { opacity: 0.82; filter: brightness(0.9); }
          25%      { opacity: 1; filter: brightness(1.1); }
          50%      { opacity: 0.92; filter: brightness(1); }
          75%      { opacity: 1; filter: brightness(1.05); }
        }
        /* neon-dot-pulse removed — dot no longer used */
        @keyframes neon-ambient-pulse {
          0%, 100% { opacity: 0.6; }
          30%      { opacity: 1; }
          60%      { opacity: 0.75; }
          80%      { opacity: 0.95; }
        }

        /* ── Micro-flicker dropout every 9s cycle ────────────────── */
        @keyframes neon-micro-flicker {
          0%     { opacity: 1; }
          /* steady for most of the cycle */
          54%    { opacity: 1; }
          /* fast dropout — 3 rapid blinks */
          54.5%  { opacity: 0.15; }
          55%    { opacity: 0.9; }
          55.3%  { opacity: 0.05; }
          55.8%  { opacity: 0.7; }
          56.2%  { opacity: 0.1; }
          56.8%  { opacity: 1; }
          /* recovery */
          57.5%  { opacity: 0.95; }
          58%    { opacity: 1; }
          100%   { opacity: 1; }
        }

        /* ── Wall poster terminal animations ─────────────────────── */
        @keyframes poster-scroll-term-l {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes poster-scroll-term-r {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes typewriter-reveal {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          5%   { opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes crt-flicker {
          0%, 100% { opacity: 0; background: transparent; }
          4%  { opacity: 0.04; background: rgba(0,255,65,0.03); }
          8%  { opacity: 0; background: transparent; }
          52% { opacity: 0; background: transparent; }
          54% { opacity: 0.02; background: rgba(0,255,65,0.02); }
          56% { opacity: 0; background: transparent; }
          87% { opacity: 0; background: transparent; }
          89% { opacity: 0.06; background: rgba(255,255,255,0.02); }
          91% { opacity: 0; background: transparent; }
        }

        /* ── Room-filling fog animations ─────────────────────────── */
        @keyframes fog-ground-pulse {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50%      { opacity: 1; transform: scaleY(1.15); }
        }
        @keyframes fog-drift-lr {
          0%   { transform: translateX(0) translateY(0); opacity: 0.4; }
          25%  { transform: translateX(30%) translateY(-5%); opacity: 0.7; }
          50%  { transform: translateX(60%) translateY(3%); opacity: 0.5; }
          75%  { transform: translateX(90%) translateY(-2%); opacity: 0.8; }
          100% { transform: translateX(120%) translateY(0); opacity: 0.4; }
        }
        @keyframes fog-drift-rl {
          0%   { transform: translateX(0) translateY(0); opacity: 0.5; }
          25%  { transform: translateX(-25%) translateY(4%); opacity: 0.8; }
          50%  { transform: translateX(-55%) translateY(-3%); opacity: 0.6; }
          75%  { transform: translateX(-80%) translateY(2%); opacity: 0.7; }
          100% { transform: translateX(-110%) translateY(0); opacity: 0.5; }
        }
        @keyframes fog-drift-diag {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33%  { transform: translate(15%, 10%) scale(1.1); opacity: 0.7; }
          66%  { transform: translate(30%, -5%) scale(0.95); opacity: 0.5; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
        }
        @keyframes fog-column-rise {
          0%   { transform: translateY(20%) scaleY(0.8) scaleX(0.9); opacity: 0.3; }
          30%  { transform: translateY(-5%) scaleY(1.1) scaleX(1.05); opacity: 0.8; }
          60%  { transform: translateY(-15%) scaleY(1.2) scaleX(0.95); opacity: 0.5; }
          100% { transform: translateY(20%) scaleY(0.8) scaleX(0.9); opacity: 0.3; }
        }
        @keyframes fog-bank-pulse {
          0%, 100% { opacity: 0.4; transform: scaleX(1) scaleY(1); }
          30%      { opacity: 0.8; transform: scaleX(1.05) scaleY(1.1); }
          70%      { opacity: 0.6; transform: scaleX(0.98) scaleY(0.95); }
        }
        @keyframes fog-tendril {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          15%  { opacity: 0.6; }
          40%  { transform: translate(15px, -20px) scale(1.3); opacity: 0.8; }
          65%  { transform: translate(-10px, -35px) scale(1.5); opacity: 0.5; }
          85%  { transform: translate(5px, -50px) scale(1.8); opacity: 0.2; }
          100% { transform: translate(0px, -60px) scale(2); opacity: 0; }
        }

        /* ── Smoke rise animations (5 wisps, each unique) ────────── */
        @keyframes smoke-rise-1 {
          0%   { transform: translateY(0) translateX(0) scale(0.7); opacity: 0; }
          8%   { opacity: 0.9; }
          40%  { transform: translateY(-50px) translateX(6px) scale(1.8); opacity: 0.6; }
          70%  { transform: translateY(-85px) translateX(10px) scale(2.5); opacity: 0.3; }
          100% { transform: translateY(-110px) translateX(14px) scale(3); opacity: 0; }
        }
        @keyframes smoke-rise-2 {
          0%   { transform: translateY(0) translateX(0) scale(0.6); opacity: 0; }
          10%  { opacity: 0.85; }
          45%  { transform: translateY(-45px) translateX(-5px) scale(1.6); opacity: 0.55; }
          75%  { transform: translateY(-80px) translateX(-9px) scale(2.2); opacity: 0.25; }
          100% { transform: translateY(-100px) translateX(-12px) scale(2.8); opacity: 0; }
        }
        @keyframes smoke-rise-3 {
          0%   { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          7%   { opacity: 0.8; }
          35%  { transform: translateY(-55px) translateX(-8px) scale(2); opacity: 0.5; }
          65%  { transform: translateY(-90px) translateX(-14px) scale(2.8); opacity: 0.2; }
          100% { transform: translateY(-120px) translateX(-18px) scale(3.2); opacity: 0; }
        }
        @keyframes smoke-rise-4 {
          0%   { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
          12%  { opacity: 0.9; }
          40%  { transform: translateY(-40px) translateX(3px) scale(1.4); opacity: 0.5; }
          70%  { transform: translateY(-70px) translateX(7px) scale(2); opacity: 0.2; }
          100% { transform: translateY(-90px) translateX(10px) scale(2.5); opacity: 0; }
        }
        @keyframes smoke-rise-5 {
          0%   { transform: translateY(0) translateX(0) scale(0.7); opacity: 0; }
          6%   { opacity: 0.75; }
          30%  { transform: translateY(-60px) translateX(10px) scale(2); opacity: 0.45; }
          60%  { transform: translateY(-100px) translateX(16px) scale(3); opacity: 0.2; }
          100% { transform: translateY(-130px) translateX(20px) scale(3.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}