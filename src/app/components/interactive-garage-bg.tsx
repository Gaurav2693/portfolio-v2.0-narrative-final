import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Lightbulb, Move } from 'lucide-react';
import GarageRoom from '@/imports/GarrageRoomPiece';
import { WallNarrative } from './wall-narrative';
import { WallWelcome } from './wall-welcome';
import { BikeCinematic } from './bike-cinematic';
import { WallPhotoFrames } from './wall-photo-frames';
import { WallBikeCarousel } from './wall-bike-carousel';
import { StudioRadio } from './studio-radio';
import { WallIdleNarrative } from './wall-idle-narrative';
import { ForceFieldCanvas } from './ForceField';

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE GARAGE BACKGROUND  —  The Garage (Room 02)
   ──────────────────────────────────────────────────────
   Full Workshop/Garage room interaction engine for use as a living backdrop.
   Mirrors the Design Studio background but with Garage-specific objects,
   wall color transitions, bike cinematic, photo frames, etc.
   ═══════════════════════════════════════════════════════════════════════ */

const AW = 805;
const AH = 609;
const VB_W = 1610;
const VB_H = 1218;
const SX = AW / VB_W;
const SY = AH / VB_H;
const PARALLAX_RANGE = 14;
const PAD = PARALLAX_RANGE * 3;
const HOVER_LIFT = 5;
const CLICK_LIFT = 26;
const DUR = '350ms';
const EASE_HOVER = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_CLICK = 'cubic-bezier(0.16, 1, 0.3, 1)';
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3.0;
const ZOOM_STEP = 0.25;

interface ObjCfg { id: string; svgId: string; label: string; hoverHz: number; clickHz: number }
const OBJECTS: ObjCfg[] = [
  { id: 'ball',        svgId: 'Ball',          label: 'Basketball',     hoverHz: 523, clickHz: 262 },
  { id: 'bed',         svgId: 'Bed',           label: 'Daybed',         hoverHz: 587, clickHz: 294 },
  { id: 'ridingshoes', svgId: 'Riding shoes',  label: 'Riding Shoes',   hoverHz: 659, clickHz: 330 },
  { id: 'jacket',      svgId: 'Jacket stand',  label: 'Jacket Stand',   hoverHz: 698, clickHz: 349 },
  { id: 'bike',        svgId: 'Bike',          label: 'Adventure Bike', hoverHz: 440, clickHz: 220 },
  { id: 'bookshelf',   svgId: 'Bookshelf',     label: 'Bookshelf',      hoverHz: 1100, clickHz: 550 },
];
const DISCOVERY_IDS = ['ball', 'bed', 'ridingshoes', 'jacket', 'bike'];

const GARAGE_CHAPTERS: Record<string, { time: string; teaser: string; narrative: string }> = {
  ball:        { time: '7:30 PM', teaser: 'THE\nBOUNCE', narrative: 'THE ECHO OF RUBBER ON CONCRETE. A RHYTHM THAT CLEARS THE MIND. BEFORE THE RIDE, THERE IS ALWAYS THE GAME.' },
  jacket:      { time: '8:00 PM', teaser: 'THE\nARMOR', narrative: 'LEATHER AND KEVLAR. THE JACKET IS NOT PROTECTION. IT IS RITUAL. THE LAST THING ON BEFORE THE ENGINE ROARS.' },
  ridingshoes: { time: '8:30 PM', teaser: 'THE\nGRIP', narrative: 'WORN SOLES AND SCUFFED TOE CAPS. EVERY MARK A ROAD REMEMBERED. EVERY MILE A STORY THAT NEVER NEEDED WORDS.' },
  bed:         { time: '11:00 PM', teaser: 'THE\nSTILL', narrative: 'THE ENGINE COOLS. THE HELMET HANGS. THE DAYBED HOLDS WHAT THE ROAD GAVE BACK. TOMORROW IT STARTS AGAIN.' },
  bike:        { time: '9:00 PM', teaser: 'THE\nRIDE', narrative: 'ASPHALT. GRAVEL. MUD. SNOW. SAND. THE MACHINE DOES NOT ASK WHERE. IT ASKS WHEN.' },
};
const GARAGE_FINALE = { time: '11:59 PM', teaser: 'A NIGHT\nIN THE\nGARAGE', narrative: 'THE GARAGE REMEMBERS EVERY RIDE. EVERY DENT. EVERY LATE NIGHT. IT IS NOT JUST A ROOM. IT IS A LIFE.' };

const WALL_DARK = { bg: '#08080E', wallR: '#352a1e', wallL: '#2a2118', base: '#3d3225', carpet: '#504538' };
const WALL_LIGHT = { bg: '#08080E', wallR: '#E8E0D4', wallL: '#DDD5C8', base: '#8A7F72', carpet: '#BAA898' };

interface Spr { x: number; y: number; vx: number; vy: number; tx: number; ty: number }
function step(s: Spr, k: number, d: number) { s.vx = (s.vx + (s.tx - s.x) * k) * d; s.vy = (s.vy + (s.ty - s.y) * k) * d; s.x += s.vx; s.y += s.vy; }

interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number }
function makeParticle(): Particle {
  return { x: Math.random() * AW * 0.6 + AW * 0.03, y: Math.random() * AH * 0.4 + AH * 0.05, vx: (Math.random() - 0.3) * 0.12, vy: Math.random() * 0.1 + 0.02, size: Math.random() * 1.5 + 0.4, opacity: 0, life: 0, maxLife: 220 + Math.random() * 300 };
}
interface Bounds { x: number; y: number; w: number; h: number }

/* ── Bike idle glow particles — rising embers when screen idle 2s ── */
interface BikeGlowP {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; life: number; maxLife: number;
  hue: number; /* warm hue variation 25-50 */
}
function makeBikeGlowP(bk: Bounds): BikeGlowP {
  /* Spawn along the bottom edge of the bike, slightly wider */
  const spread = bk.w * 1.3;
  const cx = bk.x + bk.w / 2;
  return {
    x: cx + (Math.random() - 0.5) * spread,
    y: bk.y + bk.h + Math.random() * 6,           /* just below bike */
    vx: (Math.random() - 0.5) * 0.25,              /* gentle drift */
    vy: -(0.25 + Math.random() * 0.45),            /* rise upward */
    size: 1.8 + Math.random() * 3.2,               /* 1.8-5px — clearly visible */
    opacity: 0,
    life: 0,
    maxLife: 120 + Math.random() * 180,             /* 2-5 seconds */
    hue: 25 + Math.random() * 25,                  /* warm amber 25-50 */
  };
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx() { if (!_audioCtx) _audioCtx = new AudioContext(); return _audioCtx; }
function playHoverSound(hz: number) { try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.type = 'sine'; osc.frequency.value = hz; g.gain.setValueAtTime(0.025, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12); osc.start(); osc.stop(ctx.currentTime + 0.12); } catch { /* */ } }
function playClickSound(hz: number) { try { const ctx = getAudioCtx(); const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain(); o1.connect(g); o2.connect(g); g.connect(ctx.destination); o1.type = 'triangle'; o1.frequency.value = hz; o2.type = 'sine'; o2.frequency.value = hz * 2; g.gain.setValueAtTime(0.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25); o1.start(); o2.start(); o1.stop(ctx.currentTime + 0.25); o2.stop(ctx.currentTime + 0.25); } catch { /* */ } }

/* ═══════════════════════════════════════════════════════════════════ */

interface Props { onNavigateBack?: () => void; onNavigateNext?: () => void; preview?: boolean; skipEntrance?: boolean }

export default function InteractiveGarageBg({ onNavigateBack, onNavigateNext, preview, skipEntrance }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const wallTextRef = useRef<HTMLDivElement>(null);
  const idleNarrRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const spring = useRef<Spr>({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  const rafId = useRef(0);
  const particles = useRef<Particle[]>([]);
  const reduced = useRef(false);
  const tick = useRef(0);

  /* ── Bike idle glow particles — rising embers when screen idle 2s ── */
  const bikeGlowPts = useRef<BikeGlowP[]>([]);
  const bikeGlowActive = useRef(false);
  const bikeGlowFade = useRef(0); /* 0-1 smooth fade-in/out */
  const bikeIdleTimer = useRef<number>(0);
  const resetBikeIdle = useCallback(() => {
    bikeGlowActive.current = false;
    clearTimeout(bikeIdleTimer.current);
    bikeIdleTimer.current = window.setTimeout(() => {
      bikeGlowActive.current = true;
    }, 2000);
  }, []);

  const cloneContentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const origElRefs = useRef<Record<string, SVGGElement>>({});
  const objBoundsRef = useRef<Record<string, Bounds>>({});
  const rightTextBounds = useRef<Bounds | null>(null);
  const leftTextBounds = useRef<Bounds | null>(null);
  const popDone = useRef(false);
  const popTimers = useRef<number[]>([]);
  const wallRefs = useRef<{ bg: SVGElement | null; wallR: SVGElement | null; wallL: SVGElement | null; base: SVGElement | null; carpet: SVGElement | null }>({ bg: null, wallR: null, wallL: null, base: null, carpet: null });

  const [lampOn, setLampOn] = useState(false);
  const lampOnRef = useRef(false);
  const lampSpr = useRef({ v: 0, cur: 0, tgt: 0 });
  const flickerEnd = useRef(0);
  const flickerDir = useRef<'on' | 'off'>('on');
  useEffect(() => { lampOnRef.current = lampOn; }, [lampOn]);
  useEffect(() => { const w = wallRefs.current; const pal = lampOn ? WALL_LIGHT : WALL_DARK; if (w.bg) w.bg.style.fill = pal.bg; if (w.wallR) w.wallR.style.fill = pal.wallR; if (w.wallL) w.wallL.style.fill = pal.wallL; if (w.base) w.base.style.fill = pal.base; if (w.carpet) w.carpet.style.fill = pal.carpet; }, [lampOn]);

  const hovIdRef = useRef<string | null>(null);
  const clkIdRef = useRef<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [boundsReady, setBoundsReady] = useState(false);
  const [discoveredSet, setDiscoveredSet] = useState<Set<string>>(new Set());
  const [portalReady, setPortalReady] = useState(false);
  const portalTimer = useRef<ReturnType<typeof setTimeout>>();

  /* Idle detection — triggers ambient narrative after 3s of no interaction */
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number>(0);
  const resetIdle = useCallback(() => {
    setIsIdle(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => setIsIdle(true), 3000);
  }, []);
  useEffect(() => {
    /* Start the first idle timer once entered */
    if (entered) resetIdle();
    return () => clearTimeout(idleTimerRef.current);
  }, [entered, resetIdle]);

  /* Start bike idle timer once entered; clean up on unmount */
  useEffect(() => {
    if (entered) resetBikeIdle();
    return () => clearTimeout(bikeIdleTimer.current);
  }, [entered, resetBikeIdle]);

  const [zoom, setZoom] = useState(1.75);
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

  useEffect(() => { if (skipEntrance) { setEntered(true); return; } const t = setTimeout(() => setEntered(true), 80); return () => clearTimeout(t); }, [skipEntrance]);
  useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); reduced.current = mq.matches; const h = (e: MediaQueryListEvent) => { reduced.current = e.matches; }; mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, []);
  useEffect(() => { const el = wrapperRef.current; if (!el) return; const h = (e: WheelEvent) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); setZoom(z => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)))); }; el.addEventListener('wheel', h, { passive: false }); return () => el.removeEventListener('wheel', h); }, []);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && clkIdRef.current) { setClickedId(null); setHoveredId(null); if (portalTimer.current) clearTimeout(portalTimer.current); setPortalReady(false); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, []);

  const onPanStart = useCallback((e: React.MouseEvent) => { if ((e.target as HTMLElement).closest('[data-hitzone]')) return; e.preventDefault(); isPanning.current = true; panStart.current = { x: e.clientX, y: e.clientY }; panOrigin.current = { x: panX, y: panY }; if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing'; }, [panX, panY]);
  useEffect(() => { const onMove = (e: MouseEvent) => { if (!isPanning.current) return; setPanX(panOrigin.current.x + e.clientX - panStart.current.x); setPanY(panOrigin.current.y + e.clientY - panStart.current.y); }; const onUp = (e: MouseEvent) => { if (!isPanning.current) return; isPanning.current = false; if (viewportRef.current) viewportRef.current.style.cursor = ''; if (Math.abs(e.clientX - panStart.current.x) < 4 && Math.abs(e.clientY - panStart.current.y) < 4 && clkIdRef.current) { setClickedId(null); setHoveredId(null); if (portalTimer.current) clearTimeout(portalTimer.current); setPortalReady(false); } }; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }; }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => { if (reduced.current) return; const r = wrapperRef.current?.getBoundingClientRect(); if (!r) return; spring.current.tx = -(((e.clientX - r.left) / r.width) * 2 - 1) * PARALLAX_RANGE; spring.current.ty = -(((e.clientY - r.top) / r.height) * 2 - 1) * PARALLAX_RANGE; resetBikeIdle(); }, [resetBikeIdle]);

  const onObjEnter = useCallback((id: string) => { setHoveredId(id); resetIdle(); resetBikeIdle(); const obj = OBJECTS.find(o => o.id === id); if (obj) playHoverSound(obj.hoverHz); }, [resetIdle, resetBikeIdle]);
  const onObjLeave = useCallback(() => { if (!clkIdRef.current) setHoveredId(null); resetIdle(); resetBikeIdle(); }, [resetIdle, resetBikeIdle]);
  const onObjClick = useCallback((id: string) => {
    resetIdle();
    resetBikeIdle();
    const was = clkIdRef.current === id;
    setClickedId(prev => {
      const next = prev === id ? null : id;
      if (next) {
        const obj = OBJECTS.find(o => o.id === id);
        if (obj) playClickSound(obj.clickHz);
        if (id !== 'bookshelf') {
          setDiscoveredSet(p => { if (p.has(id)) return p; const n = new Set(p); n.add(id); return n; });
        }
        if (id === 'bookshelf') {
          if (portalTimer.current) clearTimeout(portalTimer.current);
          portalTimer.current = setTimeout(() => setPortalReady(true), 600);
        }
      } else {
        if (portalTimer.current) clearTimeout(portalTimer.current);
        setPortalReady(false);
      }
      return next;
    });
    if (was) setHoveredId(null);
  }, [resetIdle, resetBikeIdle]);

  const toggleLamp = useCallback(() => { const goingOn = !lampOnRef.current; flickerDir.current = goingOn ? 'on' : 'off'; flickerEnd.current = tick.current + 14; setLampOn(goingOn); lampSpr.current.tgt = goingOn ? 1 : 0; try { const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.type = 'square'; osc.frequency.value = goingOn ? 1800 : 900; g.gain.setValueAtTime(0.04, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06); osc.start(); osc.stop(ctx.currentTime + 0.06); } catch { /* */ } }, []);

  /* Compute bounds + clone + pop-in */
  useEffect(() => {
    if (preview || !entered) return;
    const timer = setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const roomEl = roomRef.current; if (!roomEl) return;
        const svgEl = roomEl.querySelector('svg'); if (!svgEl) return;

        /* Override blue background */
        const initPal = lampOnRef.current ? WALL_LIGHT : WALL_DARK;
        const bgRect = svgEl.querySelector('rect[fill="#08080E"]');
        if (bgRect) { (bgRect as SVGElement).style.fill = initPal.bg; (bgRect as SVGElement).style.transition = 'fill 800ms ease'; wallRefs.current.bg = bgRect as SVGElement; }
        const wallRight = svgEl.querySelector('#wallright') as SVGElement | null;
        if (wallRight) { wallRight.style.fill = initPal.wallR; wallRight.style.transition = 'fill 800ms ease'; wallRefs.current.wallR = wallRight; }
        const wallLeft = svgEl.querySelector('#wallleft') as SVGElement | null;
        if (wallLeft) { wallLeft.style.fill = initPal.wallL; wallLeft.style.transition = 'fill 800ms ease'; wallRefs.current.wallL = wallLeft; }
        const baseSurface = svgEl.querySelector('#basesurface') as SVGElement | null;
        if (baseSurface) { baseSurface.style.fill = initPal.base; baseSurface.style.transition = 'fill 800ms ease'; wallRefs.current.base = baseSurface; }
        const carpet = svgEl.querySelector('#Carpet') as SVGElement | null;
        if (carpet) { carpet.style.fill = initPal.carpet; carpet.style.transition = 'fill 800ms ease'; wallRefs.current.carpet = carpet; }

        /* Hide text area guides */
        const textArea2 = svgEl.querySelector('[id="Text area 2"]') as SVGGraphicsElement | null;
        if (textArea2) { textArea2.setAttribute('fill-opacity', '0'); textArea2.setAttribute('stroke', 'none'); }
        const welcomeG = svgEl.querySelector('[id="Welcome text area"]') as SVGGraphicsElement | null;
        const welcomeRect = welcomeG?.querySelector('rect');
        if (welcomeRect) { (welcomeRect as SVGElement).setAttribute('fill-opacity', '0'); (welcomeRect as SVGElement).setAttribute('stroke', 'none'); }

        /* Text area bounds */
        if (textArea2) { try { const b = textArea2.getBBox(); if (b.width > 0) rightTextBounds.current = { x: b.x * SX, y: b.y * SY, w: b.width * SX, h: b.height * SY }; } catch { /* */ } }
        if (welcomeG) { try { const b = welcomeG.getBBox(); if (b.width > 0) leftTextBounds.current = { x: b.x * SX, y: b.y * SY, w: b.width * SX, h: b.height * SY }; } catch { /* */ } }

        /* Object bounds + clones */
        OBJECTS.forEach(obj => {
          const gEl = svgEl.querySelector(`[id="${obj.svgId}"]`) as SVGGElement | null; if (!gEl) return;
          try {
            const b = (gEl as SVGGraphicsElement).getBBox(); if (b.width < 1) return;
            objBoundsRef.current[obj.id] = { x: b.x * SX, y: b.y * SY, w: b.width * SX, h: b.height * SY };
            origElRefs.current[obj.id] = gEl;
            const container = cloneContentRefs.current[obj.id]; if (!container || container.children.length > 0) return;
            const cloneSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            cloneSvg.setAttribute('viewBox', `${b.x} ${b.y} ${b.width} ${b.height}`);
            cloneSvg.setAttribute('fill', 'none'); cloneSvg.setAttribute('preserveAspectRatio', 'none');
            cloneSvg.style.display = 'block'; cloneSvg.style.width = '100%'; cloneSvg.style.height = '100%'; cloneSvg.style.overflow = 'visible';
            cloneSvg.appendChild(gEl.cloneNode(true) as SVGGElement);
            container.appendChild(cloneSvg);
          } catch { /* */ }
        });
        setBoundsReady(true);

        /* Pop entrance */
        OBJECTS.forEach(obj => { const g = origElRefs.current[obj.id]; if (!g) return; const s = (g as HTMLElement).style; s.transformBox = 'fill-box'; s.transformOrigin = 'center center'; s.transform = 'scale(0)'; s.opacity = '0'; });
        const S = 100, I = 250, D = 480;
        OBJECTS.forEach((obj, i) => { const t = window.setTimeout(() => { const g = origElRefs.current[obj.id]; if (!g) return; const s = (g as HTMLElement).style; s.transition = `transform ${D}ms cubic-bezier(0.34,1.56,0.64,1), opacity ${D * 0.55}ms ease-out`; s.transform = ''; s.opacity = ''; }, I + i * S); popTimers.current.push(t); });
        const ct = window.setTimeout(() => { popDone.current = true; OBJECTS.forEach(obj => { const g = origElRefs.current[obj.id]; if (!g) return; const s = (g as HTMLElement).style; s.transition = 'opacity 200ms ease'; s.transformOrigin = ''; s.transformBox = ''; }); }, I + OBJECTS.length * S + D + 50);
        popTimers.current.push(ct);
      }));
    }, 80);
    return () => { clearTimeout(timer); popTimers.current.forEach(t => clearTimeout(t)); };
  }, [entered, preview]);

  /* Main rAF */
  useEffect(() => {
    if (preview) return;
    const s = spring.current; const pts = particles.current; const ls = fxSpr.current; const as = ambientSpr.current;
    for (let i = 0; i < 26; i++) pts.push(makeParticle());
    const loop = () => {
      tick.current++; const t = tick.current; const rd = reduced.current; const clkId = clkIdRef.current; const hovId = hovIdRef.current; const actId = clkId ?? hovId;
      if (!rd) { step(s, 0.04, 0.84); const xf = `translate3d(${s.x}px,${s.y}px,0)`; if (roomRef.current) roomRef.current.style.transform = xf; if (cloneRef.current) cloneRef.current.style.transform = xf; if (wallTextRef.current) wallTextRef.current.style.transform = xf; if (idleNarrRef.current) idleNarrRef.current.style.transform = xf; }
      ls.tgt = clkId ? 1 : 0; ls.v = (ls.v + (ls.tgt - ls.cur) * 0.08) * 0.78; ls.cur += ls.v; const fx = ls.cur;
      as.tgt = clkId ? 0 : 1; as.v = (as.v + (as.tgt - as.cur) * 0.06) * 0.82; as.cur += as.v;
      const lmp = lampSpr.current; lmp.v = (lmp.v + (lmp.tgt - lmp.cur) * 0.05) * 0.80; lmp.cur += lmp.v;
      let lampAlpha = lmp.cur;
      if (t < flickerEnd.current) { const rem = flickerEnd.current - t; const int = rem / 14; const flk = Math.sin(t * 2.8) * 0.5 + 0.5; if (flickerDir.current === 'off') lampAlpha *= (1 - flk * int * 0.85); else lampAlpha += (1 - lampAlpha) * flk * int * 0.6; }
      lampAlpha = Math.max(0, Math.min(1, lampAlpha));
      const sceneAmbient = as.cur * lampAlpha;
      if (popDone.current) { OBJECTS.forEach(obj => { const g = origElRefs.current[obj.id]; if (!g) return; (g as HTMLElement).style.opacity = actId === obj.id ? '0' : ''; }); }
      /* Dust */
      const dc = dustRef.current;
      if (dc && !rd) { const ctx = dc.getContext('2d'); if (ctx) { const dpr = window.devicePixelRatio || 1; if (dc.width !== AW * dpr) { dc.width = AW * dpr; dc.height = AH * dpr; dc.style.width = `${AW}px`; dc.style.height = `${AH}px`; ctx.scale(dpr, dpr); } ctx.clearRect(0, 0, AW, AH); const da = 0.22 * sceneAmbient; for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; p.x += p.vx; p.y += p.vy; p.life++; const lr = p.life / p.maxLife; p.opacity = lr < 0.12 ? lr / 0.12 : lr > 0.8 ? (1 - lr) / 0.2 : 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,248,225,${p.opacity * da})`; ctx.fill(); if (p.life >= p.maxLife || p.y > AH || p.x < 0 || p.x > AW) pts[i] = makeParticle(); } } }
      /* FX */
      const fc = fxRef.current;
      if (fc) { const ctx = fc.getContext('2d'); if (ctx) { const dpr = window.devicePixelRatio || 1; if (fc.width !== AW * dpr) { fc.width = AW * dpr; fc.height = AH * dpr; fc.style.width = `${AW}px`; fc.style.height = `${AH}px`; ctx.scale(dpr, dpr); } ctx.clearRect(0, 0, AW, AH);
        if (lampAlpha > 0.01 && !clkId) { ctx.save(); ctx.globalAlpha = lampAlpha * 0.06; const lg = ctx.createRadialGradient(AW * 0.35, AH * 0.25, 20, AW * 0.35, AH * 0.25, AW * 0.7); lg.addColorStop(0, 'rgba(255,250,235,0.4)'); lg.addColorStop(0.5, 'rgba(255,248,220,0.12)'); lg.addColorStop(1, 'transparent'); ctx.fillStyle = lg; ctx.fillRect(0, 0, AW, AH); ctx.restore(); }
        if (clkId && fx > 0.005) { const cp = objBoundsRef.current[clkId]; if (cp) { const cx = cp.x + cp.w / 2; const cy = cp.y + cp.h / 2; const aw = cp.w; const ah = cp.h;
          if (clkId === 'bike') { ctx.save(); ctx.globalAlpha = 0.2 * Math.min(fx / 0.15, 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, AW, AH); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.14 * fx; const wg = ctx.createRadialGradient(AW * 0.5, AH * 0.4, 20, AW * 0.5, AH * 0.4, AW * 0.85); wg.addColorStop(0, 'rgba(255,180,80,0.35)'); wg.addColorStop(0.4, 'rgba(255,150,50,0.12)'); wg.addColorStop(0.8, 'rgba(255,120,30,0.04)'); wg.addColorStop(1, 'transparent'); ctx.fillStyle = wg; ctx.fillRect(0, 0, AW, AH); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.16 * fx; const bp = ctx.createRadialGradient(cx, cy, 4, cx, cy, aw * 1.3); bp.addColorStop(0, 'rgba(255,200,120,0.5)'); bp.addColorStop(0.4, 'rgba(255,170,80,0.15)'); bp.addColorStop(1, 'transparent'); ctx.fillStyle = bp; ctx.fillRect(cx - aw * 2, cy - ah * 2, aw * 4, ah * 4); ctx.restore(); }
          else if (clkId === 'bookshelf') {
            /* ── Bookshelf: dark overlay + punch soft hole + linear spread ── */
            ctx.save(); ctx.globalAlpha = (0.55 + fx * 0.2) * Math.min(fx / 0.15, 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, AW, AH); ctx.restore();
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
          }
          else { const d = 0.55 + fx * 0.2; ctx.save(); ctx.globalAlpha = d * Math.min(fx / 0.15, 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, AW, AH); ctx.restore(); const spotX = cx; ctx.save(); ctx.globalAlpha = 0.3 + fx * 0.35; ctx.beginPath(); ctx.moveTo(spotX - 6, -30); ctx.lineTo(spotX + 6, -30); ctx.lineTo(spotX + aw * 0.85 + fx * 30, cy + ah * 0.7); ctx.lineTo(spotX - aw * 0.85 - fx * 30, cy + ah * 0.7); ctx.closePath(); const sg = ctx.createRadialGradient(spotX, cy - 10, 8, spotX, cy - 10, (aw * 0.85 + fx * 30) * 1.3); sg.addColorStop(0, 'rgba(255,252,240,0.35)'); sg.addColorStop(0.3, 'rgba(255,250,235,0.15)'); sg.addColorStop(0.6, 'rgba(255,248,230,0.05)'); sg.addColorStop(1, 'transparent'); ctx.fillStyle = sg; ctx.fill(); ctx.restore(); ctx.save(); ctx.globalAlpha = 0.18 * fx; const pg = ctx.createRadialGradient(cx, cy, 4, cx, cy, aw * 0.9); pg.addColorStop(0, 'rgba(255,252,242,0.5)'); pg.addColorStop(0.4, 'rgba(255,250,238,0.15)'); pg.addColorStop(1, 'transparent'); ctx.fillStyle = pg; ctx.fillRect(cx - aw * 2, cy - ah * 2, aw * 4, ah * 4); ctx.restore(); }
        } }

        /* ── Bike idle glow particles — rising warm embers ─────────── */
        const bk = objBoundsRef.current['bike'];
        if (bk && !rd) {
          const bgf = bikeGlowFade.current;
          const tgtFade = (bikeGlowActive.current && !clkId) ? 1 : 0;
          bikeGlowFade.current += (tgtFade - bgf) * 0.035; /* smooth ~0.6s ramp */
          const fade = bikeGlowFade.current;
          const bgp = bikeGlowPts.current;

          /* Spawn: keep ~18 particles alive when active */
          if (fade > 0.01 && bgp.length < 18 && t % 3 === 0) {
            bgp.push(makeBikeGlowP(bk));
          }

          /* Update + draw on FX canvas */
          if (bgp.length > 0 && fc) {
            const ctx2 = fc.getContext('2d');
            if (ctx2) {
              ctx2.save();
              ctx2.globalCompositeOperation = 'lighter';
              for (let i = bgp.length - 1; i >= 0; i--) {
                const p = bgp[i];
                p.x += p.vx + Math.sin(t * 0.03 + i) * 0.08; /* gentle sway */
                p.y += p.vy;
                p.vy *= 0.998; /* slight deceleration */
                p.life++;
                const lr = p.life / p.maxLife;
                /* Fade-in 15%, sustain, fade-out 25% */
                p.opacity = lr < 0.15 ? lr / 0.15 : lr > 0.75 ? (1 - lr) / 0.25 : 1;

                const alpha = p.opacity * fade * 0.85;
                if (alpha > 0.005) {
                  /* Outer glow halo */
                  const gr = ctx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
                  gr.addColorStop(0, `hsla(${p.hue},90%,60%,${alpha * 0.7})`);
                  gr.addColorStop(0.4, `hsla(${p.hue},85%,50%,${alpha * 0.3})`);
                  gr.addColorStop(1, `hsla(${p.hue},80%,40%,0)`);
                  ctx2.fillStyle = gr;
                  ctx2.fillRect(p.x - p.size * 2.5, p.y - p.size * 2.5, p.size * 5, p.size * 5);

                  /* Bright core */
                  ctx2.globalAlpha = alpha;
                  ctx2.beginPath();
                  ctx2.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
                  ctx2.fillStyle = `hsla(${p.hue},95%,72%,1)`;
                  ctx2.fill();
                  ctx2.globalAlpha = 1;
                }

                /* Remove dead particles */
                if (p.life >= p.maxLife || p.y < bk.y - bk.h * 1.5) {
                  bgp.splice(i, 1);
                }
              }
              ctx2.restore();
            }
          }
        }
      } }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const zoomPct = Math.round(zoom * 100);
  const bikeActive = clickedId === 'bike';
  const wallAccent = bikeActive ? '#FF9500' : '#00A87C';

  /* ── Preview mode: artwork only, no interaction layers ── */
  if (preview) {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ contain: 'strict' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ width: AW, height: AH }}>
            <GarageRoom />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden" onMouseMove={onMouseMove} onMouseLeave={() => { spring.current.tx = 0; spring.current.ty = 0; if (!clickedId) setHoveredId(null); }}>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative transition-transform duration-300 ease-out" style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}>
          <div className="relative transition-all duration-[1400ms] ease-out" style={{ width: AW, height: AH, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'scale(0.97) translateY(12px)' }}>
            <div ref={viewportRef} className="absolute inset-0 overflow-hidden cursor-grab" onMouseDown={onPanStart}>

              {/* Layer 1: Base room */}
              <div ref={roomRef} className="absolute" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform' }}>
                <div className="absolute" style={{ width: AW, height: AH, left: PAD, top: PAD }}>
                  <GarageRoom />
                  {/* Force field on isometric floor beneath bookshelf */}
                  {boundsReady && objBoundsRef.current['bookshelf'] && (() => {
                    const bs = objBoundsRef.current['bookshelf'];
                    const fieldSize = Math.max(bs.w, bs.h) * 3 * 0.3;
                    return (
                      <div className="absolute pointer-events-none" style={{
                        left: bs.x + bs.w * 0.5 - fieldSize / 2,
                        top: bs.y + bs.h * 0.7 - fieldSize / 2,
                        width: fieldSize,
                        height: fieldSize,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        transform: 'rotateX(60deg) rotateZ(45deg)',
                        transformOrigin: 'center center',
                      }}>
                        <ForceFieldCanvas
                          width={fieldSize}
                          height={fieldSize}
                          targets={[{
                            cx: fieldSize / 2,
                            cy: fieldSize / 2,
                            w: fieldSize * 0.85,
                            h: fieldSize * 0.85,
                            hovered: hoveredId === 'bookshelf',
                            clicked: clickedId === 'bookshelf',
                            color: '#00A87C',
                          }]}
                        />
                      </div>
                    );
                  })()}
                </div>
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 100, top: PAD + 60, width: 280, height: 380, background: 'linear-gradient(140deg, rgba(255,248,220,0.06) 0%, rgba(255,248,220,0.015) 35%, transparent 65%)', filter: 'blur(20px)', animation: 'grb-breathe 8s ease-in-out infinite' }} />
                <canvas ref={dustRef} className="absolute pointer-events-none" style={{ left: PAD, top: PAD, width: AW, height: AH }} />
              </div>

              {/* Layer 2: FX canvas */}
              <canvas ref={fxRef} className="absolute inset-0 pointer-events-none" style={{ width: AW, height: AH, zIndex: 10 }} />

              {/* Layer 2.3: Bike Cinematic */}
              {boundsReady && objBoundsRef.current['bike'] && <BikeCinematic active={clickedId === 'bike'} bikeBounds={objBoundsRef.current['bike']} canvasWidth={AW} canvasHeight={AH} />}

              {/* Layer 2.5: Wall text overlays */}
              <div ref={wallTextRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 12 }}>
                {boundsReady && rightTextBounds.current && (
                  <div className="absolute" style={{ left: PAD + rightTextBounds.current.x, top: PAD + rightTextBounds.current.y, width: rightTextBounds.current.w, height: rightTextBounds.current.h }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(30deg)', transformOrigin: '0 0' }}>
                      <WallNarrative clickedId={clickedId} entered={entered} discoveredSet={discoveredSet} compact chapters={GARAGE_CHAPTERS} objectIds={DISCOVERY_IDS} finale={GARAGE_FINALE} accent={wallAccent} />
                    </div>
                  </div>
                )}
                {boundsReady && leftTextBounds.current && (
                  <div className="absolute" style={{ left: PAD + leftTextBounds.current.x + leftTextBounds.current.w * 0.05, top: PAD + leftTextBounds.current.y + leftTextBounds.current.h * 0.525, width: Math.min(leftTextBounds.current.w * 0.55, 200), height: Math.min(leftTextBounds.current.h * 0.35, 120) }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(-30deg)', transformOrigin: '0 0' }}>
                      <WallWelcome entered={entered} discoveredCount={discoveredSet.size} dimmed={!lampOn || !!clickedId} label="THE GARAGE" title1="WELCOME" title2="RIDER" subtitle="EVERY CORNER HOLDS A MEMORY · CLICK TO EXPLORE" totalDiscoverable={5} accent={wallAccent} />
                    </div>
                  </div>
                )}
                {boundsReady && leftTextBounds.current && (() => { const lb = leftTextBounds.current!; const fw = Math.min(lb.h * 0.44, 125); const fh = fw * 0.75; return (
                  <div className="absolute" style={{ left: PAD + lb.x + lb.w * 0.68, top: PAD + lb.y + lb.h * 0.22, width: fw, height: fh + 12 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(-30deg)', transformOrigin: '0 0' }}>
                      <WallPhotoFrames clickedId={clickedId} entered={entered} accent={wallAccent} caption1="THE ARMOR" caption2="THE GRIP" />
                    </div>
                  </div>); })()}
                {boundsReady && leftTextBounds.current && (() => { const lb = leftTextBounds.current!; const fs = Math.min(lb.h * 0.42, 115); return (
                  <div className="absolute" style={{ left: PAD + lb.x + lb.w * 0.62, top: PAD + lb.y + lb.h * 0.22, width: fs, height: fs + 14 }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(-30deg)', transformOrigin: '0 0' }}>
                      <WallBikeCarousel active={clickedId === 'bike'} entered={entered} accent={wallAccent} />
                    </div>
                  </div>); })()}
              </div>

              {/* Layer 3: Clone layer */}
              <div ref={cloneRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 15 }}>
                {OBJECTS.map(obj => {
                  const px = objBoundsRef.current[obj.id] ?? null; const has = boundsReady && !!px;
                  const isHov = hoveredId === obj.id; const isClk = clickedId === obj.id; const active = has && (isHov || isClk);
                  const lift = isClk ? CLICK_LIFT : isHov ? HOVER_LIFT : 0; const sc = isClk ? 1.3 : isHov ? 1.2 : 1; const ease = isClk ? EASE_CLICK : EASE_HOVER;
                  const isBike = obj.id === 'bike' && isClk;
                  return (<div key={obj.id}><div className="absolute" style={{ left: has ? PAD + px!.x : -9999, top: has ? PAD + px!.y : -9999, width: has ? px!.w : 1, height: has ? px!.h : 1, transform: `scale(${active ? sc : 1})`, transformOrigin: 'center center', transition: has ? `transform ${DUR} ${ease}, opacity ${DUR} ${ease}` : 'none', opacity: active ? 1 : 0 }}>
                    <div className="absolute" style={{ inset: 0, transform: `translateY(-${lift}px)`, transition: has ? `transform ${DUR} ${ease}` : 'none' }}>
                      <div className="absolute" style={{ inset: 0, animation: isBike ? 'bike-vibe 0.12s linear infinite' : 'none' }} ref={el => { cloneContentRefs.current[obj.id] = el; }} />
                    </div>
                  </div></div>);
                })}
              </div>

              {/* Layer 4: Hit zones */}
              {boundsReady && OBJECTS.map(obj => { const px = objBoundsRef.current[obj.id]; if (!px) return null; return (<div key={obj.id} data-hitzone className="absolute cursor-pointer" title={obj.label} style={{ left: px.x - 4, top: px.y - 4, width: px.w + 8, height: px.h + 8, zIndex: 20 }} onMouseEnter={() => onObjEnter(obj.id)} onMouseLeave={onObjLeave} onClick={() => onObjClick(obj.id)} />); })}

              {/* Hover label */}
              {boundsReady && hoveredId && !clickedId && (() => { const obj = OBJECTS.find(o => o.id === hoveredId); const px = obj ? objBoundsRef.current[obj.id] : null; if (!obj || !px) return null; return (<div className="absolute pointer-events-none" style={{ left: px.x + px.w / 2, top: px.y - 16, transform: 'translate(-50%,-100%)', zIndex: 22 }}><div className="px-2.5 py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: "'Cambay', sans-serif", fontSize: 10, letterSpacing: 0.8, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>{obj.label}</div></div>); })()}

              {/* Layer 5: Vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%)', zIndex: 25 }} />

              {/* Layer 5.5: Idle narrative — floats above all room objects, on right wall */}
              {boundsReady && rightTextBounds.current && !clickedId && (
                <div ref={idleNarrRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 26 }}>
                  <div className="absolute" style={{ left: PAD + rightTextBounds.current.x, top: PAD + rightTextBounds.current.y - rightTextBounds.current.h * 0.65, width: rightTextBounds.current.w, height: rightTextBounds.current.h }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(30deg)', transformOrigin: '0 0' }}>
                      <WallIdleNarrative isIdle={isIdle && !clickedId && !hoveredId} accent={wallAccent} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room label */}
      <div className="absolute top-4 left-5 z-[28] transition-all duration-[1200ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[5px] mb-0.5" style={{ color: 'rgba(206,48,46,0.5)' }}>ROOM 02</div>
        <h1 className="font-['Caladea',serif] text-[20px] text-white/80 tracking-[0.5px] leading-tight">The Garage</h1>
      </div>

      {/* Back navigation */}
      {onNavigateBack && (
        <div className="absolute top-4 right-5 z-[28] transition-all duration-[1600ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
          <button onClick={onNavigateBack} className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer">
            <span className="text-[12px] transition-transform duration-300 group-hover:-translate-x-1" style={{ color: 'rgba(255,255,255,0.35)' }}>&larr;</span>
            <span className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[2px] text-white/40">BACK TO STUDIO</span>
          </button>
        </div>
      )}

      {/* Next navigation */}
      {onNavigateNext && (
        <div className="absolute top-14 right-5 z-[28] transition-all duration-[1600ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
          <button onClick={onNavigateNext} className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer">
            <span className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[2px] text-white/40">NEXT ROOM</span>
            <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(255,255,255,0.35)' }}>&rarr;</span>
          </button>
        </div>
      )}

      {/* Portal CTA (bookshelf → Room 03) */}
      {portalReady && clickedId === 'bookshelf' && onNavigateNext && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[28] flex items-center justify-center transition-all duration-500 ease-out" style={{ opacity: portalReady ? 1 : 0 }}>
          <button onClick={onNavigateNext} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,168,124,0.12) 0%, rgba(0,168,124,0.04) 100%)', border: '1px solid rgba(0,168,124,0.2)', boxShadow: '0 0 20px rgba(0,168,124,0.08), 0 4px 12px rgba(0,0,0,0.3)' }}>
            <div className="absolute inset-0 rounded-xl grb-portal-pulse" style={{ border: '1px solid rgba(0,168,124,0.3)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#00A87C', boxShadow: '0 0 8px rgba(0,168,124,0.6)' }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px]" style={{ color: 'rgba(0,168,124,0.8)' }}>EXPLORE NEXT ROOM</span>
            <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(0,168,124,0.5)' }}>&rarr;</span>
          </button>
        </div>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-4 right-5 z-[28] flex items-center gap-2 transition-all duration-[1600ms] ease-out bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/[0.06]" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}>
        <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20" title="Zoom Out"><ZoomOut size={14} /></button>
        <button onClick={zoomReset} className="h-8 px-3 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 font-['Cambay',sans-serif] text-[11px] tracking-[0.5px] transition-all duration-150" title="Reset View"><RotateCcw size={10} /><span>{zoomPct}%</span></button>
        <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150 disabled:opacity-20" title="Zoom In"><ZoomIn size={14} /></button>
        <div className="w-px h-5 bg-white/[0.06] mx-1" />
        <button onClick={toggleLamp} className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200" style={{ background: lampOn ? 'rgba(255,217,102,0.08)' : 'rgba(255,255,255,0.04)', borderColor: lampOn ? 'rgba(255,217,102,0.15)' : 'rgba(255,255,255,0.06)', color: lampOn ? 'rgba(255,217,102,0.7)' : 'rgba(255,255,255,0.25)' }} title={lampOn ? 'Lights Off' : 'Lights On'}><Lightbulb size={14} /></button>
        <div className="h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 bg-white/[0.03] border border-white/[0.04]" title="Click & drag to pan"><Move size={10} className="text-white/25" /><span className="font-['Cambay',sans-serif] text-[10px] text-white/20 tracking-[0.3px]">Drag to pan</span></div>
        {/* Inline Studio Radio */}
        <StudioRadio inline />
      </div>

      {/* Status pill */}
      <div className="absolute bottom-4 left-5 z-[28] flex items-center gap-1.5 transition-all duration-[1600ms] ease-out bg-black/30 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/[0.04]" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}>
        <div className="w-[5px] h-[5px] rounded-full bg-[#CE302E]" />
        <span className="font-['Cambay',sans-serif] text-[11px] text-white/30 tracking-[0.5px]">Garage &middot; Room 02 &middot; {discoveredSet.size}/{DISCOVERY_IDS.length} Discovered</span>
      </div>

      <style>{`
        @keyframes grb-breathe { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes bike-vibe { 0%,100% { transform:translate(0,0) rotate(0deg); } 20% { transform:translate(0.4px,-0.3px) rotate(0.3deg); } 40% { transform:translate(-0.3px,0.4px) rotate(-0.2deg); } 60% { transform:translate(0.3px,-0.2px) rotate(0.2deg); } 80% { transform:translate(-0.4px,0.3px) rotate(-0.3deg); } }
        .wall-idle-breathe { animation: wall-breathe 4s ease-in-out infinite; }
        @keyframes wall-breathe { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .wall-cursor-blink { animation: wall-cursor 0.6s step-end infinite; }
        @keyframes wall-cursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes grb-portal-pulse { 0%,100% { opacity:0.3; box-shadow: 0 0 8px rgba(0,168,124,0.1); } 50% { opacity:1; box-shadow: 0 0 16px rgba(0,168,124,0.25); } }
        .grb-portal-pulse { animation: grb-portal-pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}