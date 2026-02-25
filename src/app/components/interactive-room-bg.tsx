import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Lightbulb, Move } from 'lucide-react';
import LivingRoomPiece from '@/imports/LivingRoomPiece-15281-1786';
import { WallNarrative } from './wall-narrative';
import { WallWelcome } from './wall-welcome';
import { PackedBag } from './packed-bag';
import { StudioRadio } from './studio-radio';
import { ForceFieldCanvas } from './ForceField';

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE ROOM BACKGROUND  —  Design Studio (Room 01)
   ────────────────────────────────────────────────────────
   Complete Design Studio interaction engine for use as a living backdrop.
   Contains: base SVG, clone layer, FX canvas, hit zones, parallax,
   pop-in, hover/click lift, spotlight, wall narrative, wall welcome,
   dust particles, zoom/pan, lamp toggle, studio radio, portal CTA.
   ══════════════════════════════════════════════════════════════════════ */

const AW = 805;
const AH = 609;
const PARALLAX_RANGE = 14;
const PAD = PARALLAX_RANGE * 3;
const HOVER_LIFT = 5;
const CLICK_LIFT = 26;
const DUR = '350ms';
const EASE_HOVER = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_CLICK = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.25;

const WALL_PANEL = { x: 419.5, y: 62.75, w: 67, h: 149 };

/* ── Wall color palettes — white derivatives for Design Studio ──── */
const WALL_DARK = { bg: '#08080E', wallR: '#CDD2DC', wallL: '#C4C9D4', base: '#B0B5C0', carpet: '#A5AAB5' };
const WALL_LIGHT = { bg: '#08080E', wallR: '#EDEFF4', wallL: '#E8EAF0', base: '#D5D9E2', carpet: '#CCCED6' };

interface ObjCfg {
  id: string; dataName: string;
  top: number; right: number; bottom: number; left: number;
  isContents: boolean; hoverHz: number; clickHz: number;
}
const OBJECTS: ObjCfg[] = [
  { id: 'laptop',     dataName: 'Laptop',              top: 37.22, right: 53.17, bottom: 52.16, left: 38.4,  isContents: false, hoverHz: 523,  clickHz: 262 },
  { id: 'chair',      dataName: 'Chair',               top: 47.14, right: 43.36, bottom: 36.24, left: 44.99, isContents: true,  hoverHz: 587,  clickHz: 294 },
  { id: 'diary',      dataName: 'Diary',               top: 48.06, right: 62.44, bottom: 47.85, left: 32.94, isContents: false, hoverHz: 659,  clickHz: 330 },
  { id: 'phone',      dataName: 'Phone',               top: 47.99, right: 61.56, bottom: 50.09, left: 36.14, isContents: false, hoverHz: 698,  clickHz: 349 },
  { id: 'printer',    dataName: 'Printer',             top: 46.83, right: 68.64, bottom: 43.52, left: 23.55, isContents: true,  hoverHz: 784,  clickHz: 392 },
  { id: 'coffeemug',  dataName: 'Coffeemug',           top: 36.67, right: 47.47, bottom: 60.68, left: 50.97, isContents: true,  hoverHz: 880,  clickHz: 440 },
  { id: 'headphones', dataName: 'Headphones and wire', top: 45.84, right: 56.17, bottom: 45.79, left: 37.55, isContents: true,  hoverHz: 988,  clickHz: 494 },
  { id: 'radio',      dataName: 'RADIO',               top: 32.68, right: 23.73, bottom: 60.1,  left: 71.55, isContents: true,  hoverHz: 1047, clickHz: 523 },
  { id: 'packedbag',  dataName: 'Packed bag',          top: 34.65, right: 37.69, bottom: 59.77, left: 57.14, isContents: false, hoverHz: 1100, clickHz: 550 },
];

interface ObjPx { x: number; y: number; w: number; h: number }
const OBJ_PX: Record<string, ObjPx> = {};
OBJECTS.forEach(o => {
  OBJ_PX[o.id] = { x: (o.left / 100) * AW, y: (o.top / 100) * AH, w: ((100 - o.right - o.left) / 100) * AW, h: ((100 - o.top - o.bottom) / 100) * AH };
});

interface Spr { x: number; y: number; vx: number; vy: number; tx: number; ty: number }
function step(s: Spr, k: number, d: number) { s.vx = (s.vx + (s.tx - s.x) * k) * d; s.vy = (s.vy + (s.ty - s.y) * k) * d; s.x += s.vx; s.y += s.vy; }

interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number }
function makeParticle(): Particle {
  return { x: Math.random() * AW * 0.6 + AW * 0.03, y: Math.random() * AH * 0.4 + AH * 0.05, vx: (Math.random() - 0.3) * 0.12, vy: Math.random() * 0.1 + 0.02, size: Math.random() * 1.5 + 0.4, opacity: 0, life: 0, maxLife: 220 + Math.random() * 300 };
}

/* ── Firefly system ──────────────────────────────────────────────── */
const NUM_FIREFLIES = 3;
const FF_SCATTER_RADIUS = 80;  // mouse scatter zone (room-space px)
const FF_IDLE_DELAY = 120;     // frames of inactivity before fireflies wake (~2s at 60fps)

type FFState = 'idle' | 'drift' | 'seek' | 'perch';

interface Firefly {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;       // current waypoint target
  size: number;                 // body radius 1.2–2.5
  glowPhase: number;            // where in the glow cycle (radians)
  glowSpeed: number;            // radians per frame
  glowHold: number;             // frames to stay lit after peak (lingering glow)
  holdCounter: number;          // current hold countdown
  hue: number;                  // ±6° hue jitter around #00A87C accent
  driftPhase: number;           // sinusoidal perpendicular drift
  driftFreq: number;
  driftAmp: number;
  restTimer: number;            // frames of hovering near waypoint before picking new one
  /* Phase 2: state machine */
  state: FFState;
  targetObjId: string | null;   // which object this firefly is seeking/perched on
  stateTimer: number;           // countdown frames in current state
  perchGlow: number;            // 0–1 animated glow for object outline
  fadeIn: number;               // 0–1 overall fade when waking from idle
}

function makeFirefly(): Firefly {
  return {
    x: Math.random() * AW * 0.8 + AW * 0.1,
    y: Math.random() * AH * 0.7 + AH * 0.05,
    vx: 0, vy: 0,
    tx: Math.random() * AW * 0.8 + AW * 0.1,
    ty: Math.random() * AH * 0.65 + AH * 0.05,
    size: 1.4 + Math.random() * 1.4,
    glowPhase: Math.random() * Math.PI * 2,
    glowSpeed: 0.006 + Math.random() * 0.01,
    glowHold: 8 + Math.floor(Math.random() * 20),
    holdCounter: 0,
    hue: 160 + (Math.random() - 0.5) * 12,
    driftPhase: Math.random() * Math.PI * 2,
    driftFreq: 0.001 + Math.random() * 0.002,
    driftAmp: 0.04 + Math.random() * 0.06,
    restTimer: 0,
    /* Phase 2 defaults */
    state: 'idle',
    targetObjId: null,
    stateTimer: 0,
    perchGlow: 0,
    fadeIn: 0,
  };
}

function pickNewWaypoint(f: Firefly) {
  const range = 40 + Math.random() * 20;
  f.tx = Math.max(AW * 0.05, Math.min(AW * 0.95, f.x + (Math.random() - 0.5) * range * 2));
  f.ty = Math.max(AH * 0.03, Math.min(AH * 0.7, f.y + (Math.random() - 0.5) * range * 2));
  f.restTimer = 0;
}

/** Pick an unoccupied object — packed bag gets 3× weight as discovery hint */
function pickObjectTarget(ffs: Firefly[], selfIdx: number): string | null {
  const occupied = new Set<string>();
  for (let i = 0; i < ffs.length; i++) {
    if (i === selfIdx) continue;
    const fi = ffs[i];
    if ((fi.state === 'seek' || fi.state === 'perch') && fi.targetObjId) occupied.add(fi.targetObjId);
  }
  const available = OBJECTS.filter(o => !occupied.has(o.id));
  if (available.length === 0) return null;
  const weighted: string[] = [];
  for (const obj of available) {
    weighted.push(obj.id);
    if (obj.id === 'packedbag') { weighted.push(obj.id); weighted.push(obj.id); }
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

/** Tiny micro-orbit near object center while perched */
function pickPerchMicroDrift(f: Firefly) {
  if (!f.targetObjId) return;
  const px = OBJ_PX[f.targetObjId];
  const cx = px.x + px.w / 2;
  const cy = px.y + px.h / 2;
  f.tx = cx + (Math.random() - 0.5) * 8;
  f.ty = cy + (Math.random() - 0.5) * 6;
}

/** Canvas rounded-rect helper */
function canvasRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function stepFirefly(f: Firefly, k: number, d: number) {
  // Move toward target
  f.vx = (f.vx + (f.tx - f.x) * k) * d;
  f.vy = (f.vy + (f.ty - f.y) * k) * d;
  f.x += f.vx;
  f.y += f.vy;

  // Update glow phase
  f.glowPhase += f.glowSpeed;
  if (f.glowPhase > Math.PI * 2) f.glowPhase -= Math.PI * 2;

  // Update drift phase
  f.driftPhase += f.driftFreq;
  if (f.driftPhase > Math.PI * 2) f.driftPhase -= Math.PI * 2;

  // Update rest timer
  if (f.restTimer > 0) f.restTimer--;

  // If near target during drift, pick a new drift waypoint
  if (f.state === 'drift') {
    const dx = f.tx - f.x;
    const dy = f.ty - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10 && f.restTimer <= 0) pickNewWaypoint(f);
  }

  // Update hold counter
  if (f.holdCounter > 0) f.holdCounter--;
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx() { if (!_audioCtx) _audioCtx = new AudioContext(); return _audioCtx; }
function playHoverSound(hz: number) { try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = hz; gain.gain.setValueAtTime(0.03, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12); osc.start(); osc.stop(ctx.currentTime + 0.12); } catch { /* */ } }
function playClickSound(hz: number) { try { const ctx = getAudioCtx(); const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain(); o1.connect(g); o2.connect(g); g.connect(ctx.destination); o1.type = 'triangle'; o1.frequency.value = hz; o2.type = 'sine'; o2.frequency.value = hz * 2; g.gain.setValueAtTime(0.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25); o1.start(); o2.start(); o1.stop(ctx.currentTime + 0.25); o2.stop(ctx.currentTime + 0.25); } catch { /* */ } }

function collectHideableEls(el: Element, out: HTMLElement[]) {
  if (el.classList.contains('contents')) { Array.from(el.children).forEach(c => collectHideableEls(c, out)); } else { out.push(el as HTMLElement); }
}

/* ═══════════════════════════════════════════════════════════════════ */

interface Props { onNavigateNext?: () => void; preview?: boolean; skipEntrance?: boolean }

export default function InteractiveRoomBg({ onNavigateNext, preview, skipEntrance }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const wallTextRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const spring = useRef<Spr>({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  const rafId = useRef(0);
  const particles = useRef<Particle[]>([]);
  const fireflies = useRef<Firefly[]>([]);
  const mouseRoom = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });
  const reduced = useRef(false);
  const tick = useRef(0);
  const idleCounter = useRef(0);          // frames since last mouse activity
  const firefliesAwake = useRef(false);   // true once idle threshold crossed

  const cloneContentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hideableCache = useRef<Record<string, HTMLElement[]>>({});
  const popDone = useRef(false);
  const popTimers = useRef<number[]>([]);

  /* Wall color refs for palette switching */
  const wallRefs = useRef<{ bg: HTMLElement | null; wallR: SVGPathElement | null; wallL: SVGPathElement | null; base: SVGPathElement | null; carpets: SVGPathElement[] }>({ bg: null, wallR: null, wallL: null, base: null, carpets: [] });

  /* Lamp */
  const [lampOn, setLampOn] = useState(false);
  const lampOnRef = useRef(false);
  const lampSpr = useRef({ v: 0, cur: 0, tgt: 0 });
  const flickerEnd = useRef(0);
  const flickerDir = useRef<'on' | 'off'>('on');
  useEffect(() => { lampOnRef.current = lampOn; }, [lampOn]);

  /* Wall color transition on lamp toggle */
  useEffect(() => {
    const w = wallRefs.current;
    const pal = lampOn ? WALL_LIGHT : WALL_DARK;
    if (w.bg) w.bg.style.background = pal.bg;
    if (w.wallR) w.wallR.style.fill = pal.wallR;
    if (w.wallL) w.wallL.style.fill = pal.wallL;
    if (w.base) w.base.style.fill = pal.base;
    w.carpets.forEach(c => { c.style.fill = pal.carpet; });
  }, [lampOn]);

  /* Interaction */
  const hovIdRef = useRef<string | null>(null);
  const clkIdRef = useRef<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [discoveredSet, setDiscoveredSet] = useState<Set<string>>(new Set());
  const [portalReady, setPortalReady] = useState(false);
  const portalTimer = useRef<ReturnType<typeof setTimeout>>();

  /* Printer paper animation — rAF physics system (Room 03 style) */
  interface FlyingPaper {
    id: number; x: number; y: number;
    vx: number; vy: number;
    angle: number; va: number;       // rotation angle + angular velocity
    wobblePhase: number;             // sinusoidal drift phase
    driftAmp: number; driftFreq: number;
    size: number;                    // scale factor
    life: number; maxLife: number;   // frames alive
    spawned: boolean;                // delay gate
    delay: number;                   // frames to wait before spawning
  }
  const flyingPapersRef = useRef<FlyingPaper[]>([]);
  const [paperRenderTick, setPaperRenderTick] = useState(0);
  const paperRafRef = useRef(0);
  const paperIdCounter = useRef(0);
  const printerBusy = useRef(false);

  const playPrinterSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      for (let i = 0; i < 7; i++) {
        const t = ctx.currentTime + i * 0.09;
        const noise = ctx.createOscillator();
        const g = ctx.createGain();
        noise.connect(g); g.connect(ctx.destination);
        noise.type = 'square';
        noise.frequency.value = 180 + Math.random() * 60;
        g.gain.setValueAtTime(0.015, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        noise.start(t); noise.stop(t + 0.06);
      }
    } catch { /* */ }
  }, []);

  const startPaperLoop = useCallback(() => {
    let frameTick = 0;
    const loop = () => {
      frameTick++;
      const papers = flyingPapersRef.current;
      let alive = false;
      for (let i = papers.length - 1; i >= 0; i--) {
        const p = papers[i];
        if (!p.spawned) {
          if (frameTick >= p.delay) p.spawned = true;
          else { alive = true; continue; }
        }
        p.life++;
        // Physics: drag + gentle gravity + sinusoidal drift
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.vy += 0.012; // gentle gravity
        p.x += p.vx + Math.sin(p.life * p.driftFreq + p.wobblePhase) * p.driftAmp;
        p.y += p.vy + Math.cos(p.life * p.driftFreq * 0.7 + p.wobblePhase) * p.driftAmp * 0.5;
        // Rotation
        p.va *= 0.992;
        p.va += Math.sin(p.life * 0.03 + p.wobblePhase) * 0.001; // tumble wobble
        p.angle += p.va;
        // Wrap horizontally (bounce off room edges gently)
        if (p.x < -20) { p.x = -20; p.vx = Math.abs(p.vx) * 0.5; }
        if (p.x > AW + 20) { p.x = AW + 20; p.vx = -Math.abs(p.vx) * 0.5; }
        if (p.y < -30) { p.y = -30; p.vy = Math.abs(p.vy) * 0.3; }

        if (p.life >= p.maxLife) { papers.splice(i, 1); }
        else alive = true;
      }
      setPaperRenderTick(t => t + 1);
      if (alive) {
        paperRafRef.current = requestAnimationFrame(loop);
      } else {
        paperRafRef.current = 0;
      }
    };
    paperRafRef.current = requestAnimationFrame(loop);
  }, []);

  const spawnPrinterPapers = useCallback(() => {
    if (printerBusy.current) return;
    printerBusy.current = true;
    playPrinterSound();
    const px = OBJ_PX['printer'];
    const count = 6 + Math.floor(Math.random() * 3); // 6-8 papers
    const EJECT_SPEED = 3.5;
    const ANGLE_45 = Math.PI / 4; // 45 degrees — equal X and Y

    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.35; // ±10° spread around 45°
      const ejectAngle = ANGLE_45 + spread;
      const speed = EJECT_SPEED + Math.random() * 1.5;
      flyingPapersRef.current.push({
        id: ++paperIdCounter.current,
        x: px.x + px.w * 0.8,
        y: px.y + px.h * 0.2 + Math.random() * px.h * 0.2,
        vx: Math.cos(ejectAngle) * speed,
        vy: -Math.sin(ejectAngle) * speed, // negative Y = upward
        angle: (Math.random() - 0.5) * 0.4,
        va: (Math.random() - 0.5) * 0.08,
        wobblePhase: Math.random() * Math.PI * 2,
        driftAmp: 0.2 + Math.random() * 0.25,
        driftFreq: 0.015 + Math.random() * 0.012,
        size: 0.85 + Math.random() * 0.3,
        life: 0,
        maxLife: 320 + Math.floor(Math.random() * 180), // ~5-8 seconds at 60fps
        spawned: false,
        delay: i * 6, // stagger ~100ms at 60fps
      });
    }
    // start the paper physics loop if not already running
    if (!paperRafRef.current) startPaperLoop();
    setTimeout(() => { printerBusy.current = false; }, count * 100 + 500);
  }, [playPrinterSound, startPaperLoop]);

  // Cleanup on unmount
  useEffect(() => () => { if (paperRafRef.current) cancelAnimationFrame(paperRafRef.current); }, []);

  /* Zoom / Pan */
  const [zoom, setZoom] = useState(2.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + ZOOM_STEP, ZOOM_MAX)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - ZOOM_STEP, ZOOM_MIN)), []);
  const zoomReset = useCallback(() => { setZoom(1.75); setPanX(0); setPanY(0); }, []);

  useEffect(() => { hovIdRef.current = hoveredId; }, [hoveredId]);
  useEffect(() => { clkIdRef.current = clickedId; }, [clickedId]);

  const fxSpr = useRef({ v: 0, cur: 0, tgt: 0 });
  const ambientSpr = useRef({ v: 0, cur: 1, tgt: 1 });

  /* Entrance */
  useEffect(() => {
    if (skipEntrance) { setEntered(true); return; }
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, [skipEntrance]);

  /* Auto-select radio on room load → starts music */
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => {
      setClickedId(prev => {
        if (prev) return prev;
        clkIdRef.current = 'radio';
        return 'radio';
      });
    }, 800);
    return () => clearTimeout(t);
  }, [entered]);

  /* Reduced motion */
  useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); reduced.current = mq.matches; const h = (e: MediaQueryListEvent) => { reduced.current = e.matches; }; mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, []);

  /* Scroll-wheel zoom */
  useEffect(() => { const el = wrapperRef.current; if (!el) return; const handler = (e: WheelEvent) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(z => { const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP; return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + d)); }); }; el.addEventListener('wheel', handler, { passive: false }); return () => el.removeEventListener('wheel', handler); }, []);

  /* Escape */
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && clkIdRef.current) { setClickedId(null); setHoveredId(null); if (portalTimer.current) clearTimeout(portalTimer.current); setPortalReady(false); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);

  /* Pan */
  const onPanStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-hitzone]')) return;
    e.preventDefault(); isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: panX, y: panY };
    if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
  }, [panX, panY]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (!isPanning.current) return; setPanX(panOrigin.current.x + e.clientX - panStart.current.x); setPanY(panOrigin.current.y + e.clientY - panStart.current.y); };
    const onUp = (e: MouseEvent) => { if (!isPanning.current) return; isPanning.current = false; if (viewportRef.current) viewportRef.current.style.cursor = ''; const dx = e.clientX - panStart.current.x; const dy = e.clientY - panStart.current.y; if (Math.abs(dx) < 4 && Math.abs(dy) < 4 && clkIdRef.current) { setClickedId(null); setHoveredId(null); if (portalTimer.current) clearTimeout(portalTimer.current); setPortalReady(false); } };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  /* Clone + pop-in */
  useEffect(() => {
    if (preview || !entered) return;
    const timer = setTimeout(() => {
      const roomEl = roomRef.current; if (!roomEl) return;

      /* ── Wall palette override ──────────────────────────────────── */
      const initPal = lampOnRef.current ? WALL_LIGHT : WALL_DARK;
      const bgDiv = roomEl.querySelector('[data-name="living room piece"]') as HTMLElement | null;
      if (bgDiv) { bgDiv.style.background = initPal.bg; bgDiv.style.transition = 'background 800ms ease'; wallRefs.current.bg = bgDiv; }
      const wallsSvg = roomEl.querySelector('[data-name="Walls"] svg');
      if (wallsSvg) {
        const paths = wallsSvg.querySelectorAll(':scope > g > path');
        if (paths[0]) { (paths[0] as SVGPathElement).style.fill = initPal.base; (paths[0] as SVGPathElement).style.transition = 'fill 800ms ease'; wallRefs.current.base = paths[0] as SVGPathElement; }
        if (paths[1]) { (paths[1] as SVGPathElement).style.fill = initPal.wallR; (paths[1] as SVGPathElement).style.transition = 'fill 800ms ease'; wallRefs.current.wallR = paths[1] as SVGPathElement; }
        if (paths[2]) { (paths[2] as SVGPathElement).style.fill = initPal.wallL; (paths[2] as SVGPathElement).style.transition = 'fill 800ms ease'; wallRefs.current.wallL = paths[2] as SVGPathElement; }
      }
      const carpetSvg = roomEl.querySelector('[data-name="Carpet"] svg');
      if (carpetSvg) {
        const cPaths = carpetSvg.querySelectorAll('path');
        const carpetEls: SVGPathElement[] = [];
        cPaths.forEach(p => { (p as SVGPathElement).style.fill = initPal.carpet; (p as SVGPathElement).style.transition = 'fill 800ms ease'; carpetEls.push(p as SVGPathElement); });
        wallRefs.current.carpets = carpetEls;
      }

      /* ── Object clones ──────────────────────────────────────────── */
      OBJECTS.forEach(obj => {
        const container = cloneContentRefs.current[obj.id];
        if (!container || container.children.length > 0) return;
        const base = roomEl.querySelector(`[data-name="${obj.dataName}"]`); if (!base) return;
        const hideables: HTMLElement[] = []; collectHideableEls(base, hideables); hideableCache.current[obj.id] = hideables;
        const addTS = (el: Element) => { el.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon').forEach(s => s.setAttribute('stroke', 'transparent')); };
        const stripDA = (el: Element) => { el.querySelectorAll('[data-name]').forEach(d => d.removeAttribute('data-name')); el.querySelectorAll('[data-ambient]').forEach(d => d.removeAttribute('data-ambient')); };
        const stripB = (el: Element) => { el.querySelectorAll('.mix-blend-multiply').forEach(d => { (d as HTMLElement).style.mixBlendMode = 'normal'; (d as HTMLElement).style.opacity = '0'; }); };
        if (obj.isContents) { Array.from(base.children).forEach(child => { const c = child.cloneNode(true) as HTMLElement; stripDA(c); addTS(c); stripB(c); container.appendChild(c); }); }
        else { const svg = base.querySelector('svg'); if (!svg) return; const c = svg.cloneNode(true) as SVGElement; addTS(c); c.style.display = 'block'; c.style.width = '100%'; c.style.height = '100%'; container.appendChild(c); }
      });
      OBJECTS.forEach(obj => { const els = hideableCache.current[obj.id]; if (!els) return; els.forEach(el => { el.style.transform = 'scale(0)'; el.style.opacity = '0'; el.style.transformOrigin = 'center center'; }); });
      const S = 100, I = 250, D = 480;
      OBJECTS.forEach((obj, i) => { const t = window.setTimeout(() => { const els = hideableCache.current[obj.id]; if (!els) return; els.forEach(el => { el.style.transition = `transform ${D}ms cubic-bezier(0.34,1.56,0.64,1), opacity ${D * 0.55}ms ease-out`; el.style.transform = ''; el.style.opacity = ''; }); }, I + i * S); popTimers.current.push(t); });
      const ct = window.setTimeout(() => { popDone.current = true; OBJECTS.forEach(obj => { const els = hideableCache.current[obj.id]; if (!els) return; els.forEach(el => { el.style.transition = 'opacity 200ms ease'; el.style.transformOrigin = ''; }); }); }, I + OBJECTS.length * S + D + 50);
      popTimers.current.push(ct);
    }, 120);
    return () => { clearTimeout(timer); popTimers.current.forEach(t => clearTimeout(t)); };
  }, [entered]);

  /* Mouse → parallax + room-space tracking for firefly scatter */
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced.current) return;
    const r = wrapperRef.current?.getBoundingClientRect();
    if (!r) return;
    spring.current.tx = -(((e.clientX - r.left) / r.width) * 2 - 1) * PARALLAX_RANGE;
    spring.current.ty = -(((e.clientY - r.top) / r.height) * 2 - 1) * PARALLAX_RANGE;
    /* Approximate room-space mouse position for firefly scatter */
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    mouseRoom.current.x = (e.clientX - cx) / zoom + AW / 2 - panX / zoom;
    mouseRoom.current.y = (e.clientY - cy) / zoom + AH / 2 - panY / zoom;
    mouseRoom.current.active = true;
    /* Reset idle counter for firefly wake system */
    idleCounter.current = 0;
  }, [zoom, panX, panY]);

  /* Handlers */
  const onObjEnter = useCallback((id: string) => { setHoveredId(id); const obj = OBJECTS.find(o => o.id === id); if (obj) playHoverSound(obj.hoverHz); }, []);
  const onObjLeave = useCallback(() => { if (!clkIdRef.current) setHoveredId(null); }, []);
  const onObjClick = useCallback((id: string) => {
    const was = clkIdRef.current === id;
    setClickedId(prev => {
      const next = prev === id ? null : id;
      if (next) { const obj = OBJECTS.find(o => o.id === id); if (obj) playClickSound(obj.clickHz); if (id !== 'packedbag') { setDiscoveredSet(p => { if (p.has(id)) return p; const n = new Set(p); n.add(id); return n; }); } if (id === 'packedbag') { if (portalTimer.current) clearTimeout(portalTimer.current); portalTimer.current = setTimeout(() => setPortalReady(true), 600); } if (id === 'printer') { spawnPrinterPapers(); } }
      else { if (portalTimer.current) clearTimeout(portalTimer.current); setPortalReady(false); }
      return next;
    });
    if (was) setHoveredId(null);
  }, [spawnPrinterPapers]);

  /* Lamp toggle */
  const toggleLamp = useCallback(() => {
    const goingOn = !lampOnRef.current;
    flickerDir.current = goingOn ? 'on' : 'off';
    flickerEnd.current = tick.current + 14;
    setLampOn(goingOn); lampSpr.current.tgt = goingOn ? 1 : 0;
    try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.type = 'square'; osc.frequency.value = goingOn ? 1800 : 900; gain.gain.setValueAtTime(0.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06); osc.start(); osc.stop(ctx.currentTime + 0.06); } catch { /* */ }
  }, []);

  /* Main rAF */
  useEffect(() => {
    if (preview) return;
    const s = spring.current; const pts = particles.current; const ls = fxSpr.current; const as = ambientSpr.current;
    for (let i = 0; i < 26; i++) pts.push(makeParticle());
    const ffs = fireflies.current;
    for (let i = 0; i < NUM_FIREFLIES; i++) ffs.push(makeFirefly());
    const loop = () => {
      tick.current++; const t = tick.current; const rd = reduced.current; const clkId = clkIdRef.current; const hovId = hovIdRef.current; const actId = clkId ?? hovId;
      if (!rd) { step(s, 0.04, 0.84); const xf = `translate3d(${s.x}px,${s.y}px,0)`; if (roomRef.current) roomRef.current.style.transform = xf; if (cloneRef.current) cloneRef.current.style.transform = xf; if (wallTextRef.current) wallTextRef.current.style.transform = xf; }
      ls.tgt = clkId ? 1 : 0; ls.v = (ls.v + (ls.tgt - ls.cur) * 0.08) * 0.78; ls.cur += ls.v; const fx = ls.cur;
      as.tgt = clkId ? 0 : 1; as.v = (as.v + (as.tgt - as.cur) * 0.06) * 0.82; as.cur += as.v; const ambientAlpha = as.cur;
      const lmp = lampSpr.current; lmp.v = (lmp.v + (lmp.tgt - lmp.cur) * 0.05) * 0.80; lmp.cur += lmp.v;
      let lampAlpha = lmp.cur;
      if (t < flickerEnd.current) { const rem = flickerEnd.current - t; const int = rem / 14; const flk = Math.sin(t * 2.8) * 0.5 + 0.5; if (flickerDir.current === 'off') lampAlpha = lampAlpha * (1 - flk * int * 0.85); else lampAlpha = lampAlpha + (1 - lampAlpha) * flk * int * 0.6; }
      lampAlpha = Math.max(0, Math.min(1, lampAlpha));
      const sceneAmbient = ambientAlpha * lampAlpha;
      const roomEl = roomRef.current;
      if (roomEl) { roomEl.querySelectorAll<HTMLElement>('[data-ambient]').forEach(el => { el.style.opacity = String(sceneAmbient); }); if (popDone.current) { OBJECTS.forEach(obj => { const els = hideableCache.current[obj.id]; if (!els) return; for (let i = 0; i < els.length; i++) els[i].style.opacity = actId === obj.id ? '0' : ''; }); } }
      /* Dust */
      const dc = dustRef.current;
      if (dc && !rd) { const ctx = dc.getContext('2d'); if (ctx) { const dpr = window.devicePixelRatio || 1; if (dc.width !== AW * dpr) { dc.width = AW * dpr; dc.height = AH * dpr; dc.style.width = `${AW}px`; dc.style.height = `${AH}px`; ctx.scale(dpr, dpr); } ctx.clearRect(0, 0, AW, AH); const da = 0.22 * sceneAmbient; for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; p.x += p.vx; p.y += p.vy; p.life++; const lr = p.life / p.maxLife; p.opacity = lr < 0.12 ? lr / 0.12 : lr > 0.8 ? (1 - lr) / 0.2 : 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,248,225,${p.opacity * da})`; ctx.fill(); if (p.life >= p.maxLife || p.y > AH || p.x < 0 || p.x > AW) pts[i] = makeParticle(); }

        /* ═══ FIREFLIES — Phase 2: State-machine driven ═════════ */
        /* Idle detection — increment counter each frame, wake fireflies after threshold */
        idleCounter.current++;
        if (!firefliesAwake.current && idleCounter.current >= FF_IDLE_DELAY) {
          firefliesAwake.current = true;
        }
        const mr = mouseRoom.current;
        const ffBaseBright = 0.5 + (1 - lampAlpha) * 0.5;
        const ffAwake = firefliesAwake.current;
        for (let fi = 0; fi < ffs.length; fi++) {
          const f = ffs[fi];

          /* ── State machine transitions ───────────────────────── */
          if (f.state === 'idle') {
            if (ffAwake) {
              // Stagger wake: firefly 0 immediately, 1 after ~3s, 2 after ~6s
              const wakeDelay = fi * 180; // 3s apart at 60fps
              if (idleCounter.current >= FF_IDLE_DELAY + wakeDelay) {
                f.state = 'drift';
                f.stateTimer = 360 + Math.floor(Math.random() * 480);
                f.fadeIn = 0; // start invisible, fade up
              } else {
                continue; // not yet time for this firefly
              }
            } else {
              continue; // skip all processing while idle
            }
          }

          // Smooth fade-in when waking
          if (f.fadeIn < 1) f.fadeIn = Math.min(f.fadeIn + 0.008, 1); // ~2s fade

          if (f.state === 'drift') {
            stepFirefly(f, 0.0003, 0.992);
            // Clear targetObjId once outline glow has fully faded
            if (f.targetObjId && f.perchGlow <= 0.01) f.targetObjId = null;
            // Perpendicular drift sway
            const toTargDx = f.tx - f.x; const toTargDy = f.ty - f.y;
            const toTargLen = Math.sqrt(toTargDx * toTargDx + toTargDy * toTargDy) || 1;
            f.x += (-toTargDy / toTargLen) * Math.sin(f.driftPhase) * f.driftAmp;
            f.y += (toTargDx / toTargLen) * Math.sin(f.driftPhase) * f.driftAmp;
            f.stateTimer--;
            if (f.stateTimer <= 0) {
              // Only 1 firefly may seek/perch at a time — others keep drifting
              const anyoneTargeting = ffs.some((o, oi) => oi !== fi && (o.state === 'seek' || o.state === 'perch'));
              if (anyoneTargeting) {
                // Back off — drift longer and re-check later
                f.stateTimer = 180 + Math.floor(Math.random() * 240);
                pickNewWaypoint(f);
              } else {
                const target = pickObjectTarget(ffs, fi);
                if (target) {
                  f.state = 'seek';
                  f.targetObjId = target;
                  const px = OBJ_PX[target];
                  f.tx = px.x + px.w / 2;
                  f.ty = px.y + px.h / 2;
                } else {
                  // All objects occupied — keep drifting
                  f.stateTimer = 120 + Math.floor(Math.random() * 180);
                  pickNewWaypoint(f);
                }
              }
            }
          } else if (f.state === 'seek') {
            // Gentle spring — only slightly stronger than drift so movement feels unhurried
            stepFirefly(f, 0.00045, 0.991);
            // Check arrival
            if (f.targetObjId) {
              const px = OBJ_PX[f.targetObjId];
              const cx = px.x + px.w / 2; const cy = px.y + px.h / 2;
              const dx = cx - f.x; const dy = cy - f.y;
              if (Math.sqrt(dx * dx + dy * dy) < 10) {
                f.state = 'perch';
                f.stateTimer = 300 + Math.floor(Math.random() * 420); // 5–12s perched
                pickPerchMicroDrift(f);
              }
            }
          } else if (f.state === 'perch') {
            // Gentle micro-orbit around object — match original drift feel
            stepFirefly(f, 0.0003, 0.992);
            f.stateTimer--;
            // Pick new micro-drift every ~90 frames
            if (f.stateTimer % 90 === 0) pickPerchMicroDrift(f);
            if (f.stateTimer <= 0) {
              f.state = 'drift';
              // Keep targetObjId alive so spotlight can fade smoothly
              f.stateTimer = 360 + Math.floor(Math.random() * 480);
              pickNewWaypoint(f);
            }
          }

          // Animate perchGlow smoothly
          if (f.state === 'perch') {
            f.perchGlow = Math.min(f.perchGlow + 0.025, 1);
          } else {
            f.perchGlow = Math.max(f.perchGlow - 0.02, 0);
          }

          // Mouse scatter (all states)
          if (mr.active) {
            const sdx = f.x - mr.x; const sdy = f.y - mr.y;
            const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sDist < FF_SCATTER_RADIUS && sDist > 1) {
              const push = (1 - sDist / FF_SCATTER_RADIUS) * 1.2;
              f.vx += (sdx / sDist) * push * 0.06;
              f.vy += (sdy / sDist) * push * 0.06;
              f.holdCounter = Math.max(f.holdCounter, 12);
            }
          }

          /* ── Rendering ───────────────────────────────────────── */
          const rawGlow = Math.sin(f.glowPhase);
          const glowOn = rawGlow > 0.0 ? rawGlow : 0;
          const holdBoost = f.holdCounter > 0 ? 0.5 : 0;
          // Brighter glow while perched
          const perchBoost = f.state === 'perch' ? 0.35 : 0;
          const glow = Math.min(glowOn + holdBoost + perchBoost, 1);
          const ffAlpha = (0.08 + glow * 0.92) * ffBaseBright * ambientAlpha * f.fadeIn;
          if (ffAlpha < 0.005) continue;

          /* Outer halo */
          const haloR = f.size * 8 + glow * 6;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = ffAlpha * 0.7;
          const hg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, haloR);
          hg.addColorStop(0, `hsla(${f.hue},100%,55%,0.8)`);
          hg.addColorStop(0.25, `hsla(${f.hue},95%,45%,0.35)`);
          hg.addColorStop(0.55, `hsla(${f.hue},90%,40%,0.1)`);
          hg.addColorStop(1, 'transparent');
          ctx.fillStyle = hg;
          ctx.beginPath(); ctx.arc(f.x, f.y, haloR, 0, Math.PI * 2); ctx.fill();
          /* Bright core */
          ctx.globalAlpha = ffAlpha;
          const coreR = f.size * 1.8;
          const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, coreR);
          cg.addColorStop(0, `hsla(${f.hue},80%,88%,1)`);
          cg.addColorStop(0.4, `hsla(${f.hue},95%,60%,0.7)`);
          cg.addColorStop(1, 'transparent');
          ctx.fillStyle = cg;
          ctx.beginPath(); ctx.arc(f.x, f.y, coreR, 0, Math.PI * 2); ctx.fill();
          /* Solid body dot */
          ctx.globalAlpha = ffAlpha;
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = `hsl(${f.hue},90%,82%)`;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.size * 0.45, 0, Math.PI * 2); ctx.fill();
          ctx.restore();

          /* ── Soft green accent spotlight on perched object ──── */
          if (f.perchGlow > 0.01 && f.targetObjId) {
            const px = OBJ_PX[f.targetObjId];
            const ocx = px.x + px.w / 2;
            const ocy = px.y + px.h / 2;
            const pg = f.perchGlow;
            const baseA = pg * ffBaseBright * ambientAlpha;

            /* Layer 1: wide ambient wash — broad, clearly visible */
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = baseA * 0.35;
            const wideR = Math.max(px.w, px.h) * 3.0;
            const wg = ctx.createRadialGradient(ocx, ocy, 0, ocx, ocy, wideR);
            wg.addColorStop(0, 'rgba(0,168,124,0.50)');
            wg.addColorStop(0.25, 'rgba(0,168,124,0.25)');
            wg.addColorStop(0.55, 'rgba(0,168,124,0.08)');
            wg.addColorStop(1, 'transparent');
            ctx.fillStyle = wg;
            ctx.beginPath(); ctx.arc(ocx, ocy, wideR, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            /* Layer 2: focused core spotlight — strong center pool */
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = baseA * 0.55;
            const coreR2 = Math.max(px.w, px.h) * 1.5;
            const cg2 = ctx.createRadialGradient(ocx, ocy, 0, ocx, ocy, coreR2);
            cg2.addColorStop(0, 'rgba(0,168,124,0.70)');
            cg2.addColorStop(0.3, 'rgba(0,168,124,0.35)');
            cg2.addColorStop(0.65, 'rgba(0,168,124,0.10)');
            cg2.addColorStop(1, 'transparent');
            ctx.fillStyle = cg2;
            ctx.beginPath(); ctx.arc(ocx, ocy, coreR2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            /* Layer 3: bright hotspot center — vivid punch */
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = baseA * 0.45;
            const hotR = Math.max(px.w, px.h) * 0.7;
            const hg2 = ctx.createRadialGradient(ocx, ocy, 0, ocx, ocy, hotR);
            hg2.addColorStop(0, 'rgba(0,220,160,0.85)');
            hg2.addColorStop(0.35, 'rgba(0,190,140,0.35)');
            hg2.addColorStop(0.7, 'rgba(0,168,124,0.10)');
            hg2.addColorStop(1, 'transparent');
            ctx.fillStyle = hg2;
            ctx.beginPath(); ctx.arc(ocx, ocy, hotR, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        }
      } }
      /* FX */
      const fc = fxRef.current;
      if (fc) { const ctx = fc.getContext('2d'); if (ctx) { const dpr = window.devicePixelRatio || 1; if (fc.width !== AW * dpr) { fc.width = AW * dpr; fc.height = AH * dpr; fc.style.width = `${AW}px`; fc.style.height = `${AH}px`; ctx.scale(dpr, dpr); } ctx.clearRect(0, 0, AW, AH);
        const lapPx = OBJ_PX['laptop'];
        if (!rd && ambientAlpha > 0.01) { const mx = lapPx.x + 9, my = lapPx.y + 5, mw = 48, mh = 26; const hue = (t * 0.3) % 360; const mb = 1 + (1 - lampAlpha) * 1.5; const fl = (0.05 + Math.sin(t * 0.05) * 0.02) * mb; ctx.save(); ctx.globalAlpha = Math.min(fl * ambientAlpha, 1); const sg = ctx.createLinearGradient(mx, my, mx, my + mh); sg.addColorStop(0, `hsl(${hue},40%,50%)`); sg.addColorStop(1, `hsl(${(hue + 40) % 360},35%,40%)`); ctx.fillStyle = sg; ctx.fillRect(mx, my, mw, mh); ctx.globalAlpha = (0.04 + (1 - lampAlpha) * 0.06) * ambientAlpha; ctx.fillStyle = '#fff'; ctx.fillRect(mx, my + ((t * 0.6) % mh), mw, 1); ctx.restore(); }
        if (lampAlpha < 0.99 && !clkId) { ctx.save(); ctx.globalAlpha = (1 - lampAlpha) * 0.55; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, AW, AH); ctx.restore(); }
        if (clkId && fx > 0.005) { const cp = OBJ_PX[clkId]; if (cp) { const cx = cp.x + cp.w / 2; const cy = cp.y + cp.h / 2; const aw = cp.w; const ah = cp.h; const isPacked = clkId === 'packedbag'; ctx.save(); ctx.globalAlpha = (0.55 + fx * 0.2) * Math.min(fx / 0.15, 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, AW, AH); ctx.restore();
          if (isPacked) {
            /* ── Packed-bag: punch soft hole + linear spread ──────── */
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            const holeR = Math.max(aw, ah) * 2.2;
            const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR);
            holeGrad.addColorStop(0, 'rgba(0,0,0,1)');
            holeGrad.addColorStop(0.45, 'rgba(0,0,0,0.8)');
            holeGrad.addColorStop(0.75, 'rgba(0,0,0,0.25)');
            holeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = holeGrad;
            ctx.fillRect(cx - holeR, cy - holeR, holeR * 2, holeR * 2);
            ctx.restore();
            /* Soft linear vertical band of warm light */
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = (0.15 + fx * 0.2);
            const spreadW = aw * 4;
            const lg = ctx.createLinearGradient(cx - spreadW / 2, 0, cx + spreadW / 2, 0);
            lg.addColorStop(0, 'transparent');
            lg.addColorStop(0.25, 'rgba(255,252,240,0.06)');
            lg.addColorStop(0.5, 'rgba(255,252,240,0.14)');
            lg.addColorStop(0.75, 'rgba(255,252,240,0.06)');
            lg.addColorStop(1, 'transparent');
            ctx.fillStyle = lg;
            ctx.fillRect(cx - spreadW / 2, 0, spreadW, AH);
            ctx.restore();
          } else {
            /* ── Standard cone spotlight for other objects ────────── */
            const spotX = cx; const cht = 6; const chb = aw * 0.85 + fx * 30; const cb = cy + ah * 0.7; ctx.save(); ctx.globalAlpha = 0.3 + fx * 0.35; ctx.beginPath(); ctx.moveTo(spotX - cht, -30); ctx.lineTo(spotX + cht, -30); ctx.lineTo(spotX + chb, cb); ctx.lineTo(spotX - chb, cb); ctx.closePath(); const sg = ctx.createRadialGradient(spotX, cy - 10, 8, spotX, cy - 10, chb * 1.3); sg.addColorStop(0, 'rgba(255,252,240,0.35)'); sg.addColorStop(0.3, 'rgba(255,250,235,0.15)'); sg.addColorStop(0.6, 'rgba(255,248,230,0.05)'); sg.addColorStop(1, 'transparent'); ctx.fillStyle = sg; ctx.fill(); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.18 * fx; const pg = ctx.createRadialGradient(cx, cy, 4, cx, cy, aw * 0.9); pg.addColorStop(0, 'rgba(255,252,242,0.5)'); pg.addColorStop(0.4, 'rgba(255,250,238,0.15)'); pg.addColorStop(1, 'transparent'); ctx.fillStyle = pg; ctx.fillRect(cx - aw * 2, cy - ah * 2, aw * 4, ah * 4); ctx.restore();
          }
        } }
      } }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const zoomPct = Math.round(zoom * 100);

  /* ── Preview mode: artwork only, no interaction layers ── */
  if (preview) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ contain: 'strict' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: AW, height: AH }}>
            <LivingRoomPiece />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden" onMouseMove={onMouseMove} onMouseLeave={() => { spring.current.tx = 0; spring.current.ty = 0; mouseRoom.current.active = false; if (!clickedId) setHoveredId(null); }}>

      {/* ═══ Room viewport ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative transition-transform duration-300 ease-out" style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}>
          <div className="relative transition-all duration-[1400ms] ease-out" style={{ width: AW, height: AH, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'scale(0.97) translateY(12px)' }}>
            <div ref={viewportRef} className="absolute inset-0 overflow-hidden cursor-grab" onMouseDown={onPanStart}>

              {/* Layer 1: Base room */}
              <div ref={roomRef} className="absolute" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform' }}>
                <div className="absolute" style={{ width: AW, height: AH, left: PAD, top: PAD }}>
                  <LivingRoomPiece />
                  {/* Force field BEHIND packed bag (DOM order = behind) */}
                  <div className="absolute inset-0 pointer-events-none">
                    <ForceFieldCanvas
                      width={AW}
                      height={AH}
                      targets={OBJECTS.filter(o => o.id === 'packedbag').map(obj => {
                        const px = OBJ_PX[obj.id];
                        return {
                          cx: px.x + px.w / 2,
                          cy: px.y + px.h / 2,
                          w: px.w,
                          h: px.h,
                          hovered: hoveredId === obj.id,
                          clicked: clickedId === obj.id,
                          color: '#00A87C',
                        };
                      })}
                    />
                  </div>
                  <div className="absolute pointer-events-none" data-name="Packed bag" style={{ left: '57.14%', top: '34.65%', width: 41.6, height: 34 }}><PackedBag /></div>
                </div>
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 100, top: PAD + 60, width: 280, height: 380, background: 'linear-gradient(140deg, rgba(255,248,220,0.08) 0%, rgba(255,248,220,0.02) 35%, transparent 65%)', filter: 'blur(20px)', animation: 'irb-breathe 8s ease-in-out infinite' }} />
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 150, top: PAD + 120, width: 160, height: 280, background: 'linear-gradient(155deg, rgba(255,250,230,0.05) 0%, transparent 50%)', filter: 'blur(14px)', animation: 'irb-breathe 10s ease-in-out infinite 3s', transform: 'skewX(-8deg)' }} />
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 160, top: PAD + 180, width: 65, height: 90, background: 'radial-gradient(ellipse at 50% 20%, rgba(255,230,150,0.07) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'irb-lamp 6s ease-in-out infinite' }} />
                <canvas ref={dustRef} className="absolute pointer-events-none" style={{ left: PAD, top: PAD, width: AW, height: AH }} />
              </div>

              {/* Layer 2: FX canvas */}
              <canvas ref={fxRef} className="absolute inset-0 pointer-events-none" style={{ width: AW, height: AH, zIndex: 10 }} />

              {/* Layer 2.5: Wall text */}
              <div ref={wallTextRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 12 }}>
                <div data-name="NARRATIVE-FRAME" className="absolute" style={{ left: PAD + WALL_PANEL.x, top: PAD + WALL_PANEL.y, width: WALL_PANEL.w, height: WALL_PANEL.h }}>
                  <svg className="absolute pointer-events-none" style={{ left: '-1.49%', top: '-1.19%', width: '103.02%', height: '102.31%' }} viewBox="0 0 69.027 152.449" fill="none" preserveAspectRatio="none">
                    <defs><linearGradient id="irb-bg" x1="0.5" y1="0" x2="0.48" y2="1"><stop offset="0%" stopColor="rgb(30,30,30)" stopOpacity="0.35" /><stop offset="100%" stopColor="rgb(22,22,22)" stopOpacity="0.22" /></linearGradient></defs>
                    <path d="M66.258 115.778L67.9997 1.77796L1 41.778V150.778L66.258 115.778Z" fill="url(#irb-bg)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                  </svg>
                  <div className="absolute" style={{ inset: 0, clipPath: 'polygon(0% 26.8%, 100% 0%, 97.4% 76.5%, 0% 100%)' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(-30deg) skewX(0.5deg)', transformOrigin: '0% 26.8%' }}>
                      <div style={{ position: 'absolute', left: 0, top: '26.8%', width: '100%', height: '73.2%' }}>
                        <WallNarrative clickedId={clickedId} entered={entered} discoveredSet={discoveredSet} compact />
                      </div>
                    </div>
                  </div>
                </div>
                <div data-name="WELCOME-FRAME" className="absolute" style={{ left: PAD + 503, top: PAD + 42, width: 200, height: 220 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 200, height: 105, transform: 'skewY(30deg)', transformOrigin: '0 0' }}>
                    <WallWelcome entered={entered} discoveredCount={discoveredSet.size} dimmed={!lampOn || !!clickedId} />
                  </div>
                </div>
              </div>

              {/* Layer 3: Clone layer */}
              <div ref={cloneRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 15 }}>
                {OBJECTS.map(obj => {
                  const px = OBJ_PX[obj.id]; const isHov = hoveredId === obj.id; const isClk = clickedId === obj.id; const active = isHov || isClk;
                  const liftPx = isClk ? CLICK_LIFT : isHov ? HOVER_LIFT : 0; const scale = isClk ? 1.3 : isHov ? 1.2 : 1; const ease = isClk ? EASE_CLICK : EASE_HOVER;
                  return (<div key={obj.id}><div className="absolute" style={{ left: PAD + px.x, top: PAD + px.y, width: px.w, height: px.h, transform: `scale(${scale})`, transformOrigin: 'center center', transition: `transform ${DUR} ${ease}, opacity ${DUR} ${ease}`, opacity: active ? 1 : 0 }}>
                    <div className="absolute" style={{ ...(obj.isContents ? { left: -px.x, top: -px.y, width: AW, height: AH } : { inset: 0 }), transform: `translateY(-${liftPx}px)`, transition: `transform ${DUR} ${ease}` }} ref={el => { cloneContentRefs.current[obj.id] = el; }} />
                  </div></div>);
                })}
              </div>

              {/* Layer 4: Hit zones */}
              {OBJECTS.map(obj => { const px = OBJ_PX[obj.id]; return (<div key={obj.id} data-hitzone className="absolute cursor-pointer" style={{ left: px.x - 4, top: px.y - 4, width: px.w + 8, height: px.h + 8, zIndex: 20 }} onMouseEnter={() => onObjEnter(obj.id)} onMouseLeave={onObjLeave} onClick={() => onObjClick(obj.id)} />); })}

              {/* Layer 4.5: Printer paper animation */}
              {flyingPapersRef.current.length > 0 && paperRenderTick >= 0 && (
                <div className="absolute pointer-events-none" style={{ width: AW, height: AH, zIndex: 22 }}>
                  {flyingPapersRef.current.filter(p => p.spawned).map(paper => {
                    const lifeRatio = paper.life / paper.maxLife;
                    // Fade in during first 5%, fully visible middle, fade out last 25%
                    const fadeIn = Math.min(paper.life / 8, 1);
                    const fadeOut = lifeRatio > 0.75 ? 1 - (lifeRatio - 0.75) / 0.25 : 1;
                    const opacity = fadeIn * fadeOut;
                    return (
                      <div
                        key={paper.id}
                        className="absolute"
                        style={{
                          left: paper.x - 15,
                          top: paper.y - 11,
                          width: 30,
                          height: 22,
                          transform: `rotate(${paper.angle}rad) scale(${paper.size})`,
                          opacity,
                          willChange: 'transform',
                        }}
                      >
                        <svg viewBox="0 0 30 22" className="w-full h-full" style={{ filter: `drop-shadow(1px 2px 3px rgba(0,0,0,${0.15 + opacity * 0.1}))` }}>
                          <polygon points="1,2 28,0 29,20 2,22" fill="#F5F3EE" stroke="#D8D4CC" strokeWidth="0.5" />
                          <line x1="5" y1="5" x2="24" y2="4" stroke="#D0CBBF" strokeWidth="0.4" opacity="0.6" />
                          <line x1="5" y1="8.5" x2="24" y2="7.5" stroke="#D0CBBF" strokeWidth="0.4" opacity="0.5" />
                          <line x1="5" y1="12" x2="22" y2="11" stroke="#D0CBBF" strokeWidth="0.4" opacity="0.4" />
                          <line x1="5" y1="15.5" x2="20" y2="14.5" stroke="#D0CBBF" strokeWidth="0.4" opacity="0.3" />
                          <rect x="5" y="4" width="8" height="3" rx="0.5" fill="rgba(45,95,138,0.08)" stroke="none" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Layer 5: Vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%)', zIndex: 25 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Room label ═══════════════════════════════════════════════ */}
      <div className="absolute top-4 left-5 z-[28] transition-all duration-[1200ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[5px] mb-0.5" style={{ color: 'rgba(0,168,124,0.5)' }}>ROOM 01</div>
        <h1 className="font-['Caladea',serif] text-[20px] text-white/80 tracking-[0.5px] leading-tight">The Design Studio</h1>
      </div>

      {/* ═══ Portal CTA (packed bag) ═════════════════════════════════ */}
      {portalReady && clickedId === 'packedbag' && onNavigateNext && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[28] flex items-center justify-center transition-all duration-500 ease-out" style={{ opacity: portalReady ? 1 : 0 }}>
          <button onClick={onNavigateNext} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(206,48,46,0.12) 0%, rgba(206,48,46,0.04) 100%)', border: '1px solid rgba(206,48,46,0.2)', boxShadow: '0 0 20px rgba(206,48,46,0.08), 0 4px 12px rgba(0,0,0,0.3)' }}>
            <div className="absolute inset-0 rounded-xl irb-portal-pulse" style={{ border: '1px solid rgba(206,48,46,0.3)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#CE302E', boxShadow: '0 0 8px rgba(206,48,46,0.6)' }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px]" style={{ color: 'rgba(206,48,46,0.8)' }}>EXPLORE NEXT ROOM</span>
            <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(206,48,46,0.5)' }}>&rarr;</span>
          </button>
        </div>
      )}

      {/* ═══ Controls bar ═════════════════════════════════════════════ */}
      <div className="absolute bottom-4 right-5 z-[28] flex items-center gap-2 transition-all duration-[1600ms] ease-out bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/[0.06]" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}>
        <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed" title="Zoom Out"><ZoomOut size={14} /></button>
        <button onClick={zoomReset} className="h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 font-['Cambay',sans-serif] text-[11px] tracking-[0.5px] transition-all duration-150" title="Reset View"><RotateCcw size={10} /><span>{zoomPct}%</span></button>
        <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed" title="Zoom In"><ZoomIn size={14} /></button>
        <div className="w-px h-5 bg-white/[0.06] mx-1" />
        <button onClick={toggleLamp} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200" style={{ background: lampOn ? 'rgba(255,217,102,0.08)' : 'rgba(255,255,255,0.04)', borderColor: lampOn ? 'rgba(255,217,102,0.15)' : 'rgba(255,255,255,0.06)', color: lampOn ? 'rgba(255,217,102,0.7)' : 'rgba(255,255,255,0.25)' }} title={lampOn ? 'Dim Room' : 'Brighten Room'}><Lightbulb size={14} /></button>
        <div className="h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.03] border border-white/[0.04]" title="Click & drag to pan"><Move size={10} className="text-white/25" /><span className="font-['Cambay',sans-serif] text-[10px] text-white/20 tracking-[0.3px]">Drag to pan</span></div>
        {/* Inline Studio Radio */}
        <StudioRadio inline radioClicked={clickedId === 'radio'} />
      </div>

      {/* ═══ Status pill ══════════════════════════════════════════════ */}
      <div className="absolute bottom-4 left-5 z-[28] flex items-center gap-1.5 transition-all duration-[1600ms] ease-out bg-black/30 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/[0.04]" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}>
        <div className="w-[5px] h-[5px] rounded-full bg-[#00A87C]" />
        <span className="font-['Cambay',sans-serif] text-[11px] text-white/30 tracking-[0.5px]">Design Studio &middot; Room 01 &middot; {discoveredSet.size}/8 Discovered</span>
      </div>

      <style>{`
        @keyframes irb-breathe { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes irb-lamp { 0%,100% { opacity:0.5; } 40% { opacity:1; } 60% { opacity:0.85; } }
        @keyframes irb-portal-pulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.02); } }
        .irb-portal-pulse { animation: irb-portal-pulse 2s ease-in-out infinite; }
        .wall-idle-breathe { animation: wall-breathe 4s ease-in-out infinite; }
        @keyframes wall-breathe { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .wall-cursor-blink { animation: wall-cursor 0.6s step-end infinite; }
        @keyframes wall-cursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
      `}</style>
    </div>
  );
}