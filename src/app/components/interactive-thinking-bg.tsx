import { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Lightbulb, Move } from 'lucide-react';
import { useNavigate } from 'react-router';
import LivingRoomPiece from '@/imports/LivingRoomPiece';
import { WallNarrative } from './wall-narrative';
import { WallWelcome } from './wall-welcome';
import { PaperFlyingFx } from './paper-flying-fx';
import { LightControlsPanel, LIGHT_DEFAULTS } from './paper-flying-fx';
import type { LightCtrl } from './paper-flying-fx';
import { ForceFieldCanvas } from './ForceField';

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE THINKING BACKGROUND  —  How I Think (Room 03)
   ─────────────────────────────────────────────────────────
   Isometric "How I Think" room: a living room / study with a thinking
   board, telescope, research papers, coffee machine, article stand,
   laptop, and gaming chair. Adapted from the LivingRoomPiece Figma
   export with dark-theme wall colors and the standard room interaction
   engine (parallax, zoom/pan, dust particles, lamp, hit zones, pop-in).

   Wall text layers:
   - Left wall  (Text Area 2): WallNarrative — chapters per clicked object
   - Right wall (Text Area 1): WallWelcome — glitch-decoded welcome text
   ═══════════════════════════════════════════════════════════════════════ */

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

/* ── Wall color palettes ──────────────────────────────────────────── */
const WALL_DARK = { bg: '#08080E', wallR: '#1e3530', wallL: '#162a26', base: '#2a403a', carpet: '#3a4a42' };
const WALL_LIGHT = { bg: '#08080E', wallR: '#D5E5E0', wallL: '#CAD8D4', base: '#728A82', carpet: '#A8B8A5' };

/* ── Interactive objects ──────────────────────────────────────────── */
interface ObjCfg {
  id: string; dataName: string;
  top: number; right: number; bottom: number; left: number;
  isContents: boolean; hoverHz: number; clickHz: number;
}

const OBJECTS: ObjCfg[] = [
  { id: 'thinkingboard', dataName: 'Thinking Board',  top: 29.56, right: 63.86, bottom: 48.60, left: 22.48, isContents: true,  hoverHz: 523,  clickHz: 262 },
  { id: 'laptop',        dataName: 'Laptop',           top: 44.99, right: 62.00, bottom: 44.38, left: 29.57, isContents: false, hoverHz: 587,  clickHz: 294 },
  { id: 'telescope',     dataName: 'Telescope',        top: 35.47, right: 43.23, bottom: 55.01, left: 49.07, isContents: false, hoverHz: 698,  clickHz: 349 },
  { id: 'articlestand',  dataName: 'Article stand',    top: 49.26, right: 79.35, bottom: 25.53, left: 14.16, isContents: false, hoverHz: 784,  clickHz: 392 },
  { id: 'diary',         dataName: 'Diary 1',          top: 54.52, right: 69.32, bottom: 43.79, left: 28.49, isContents: false, hoverHz: 880,  clickHz: 440 },
  { id: 'notepad',       dataName: 'Notepad',          top: 55.67, right: 70.20, bottom: 42.20, left: 27.04, isContents: false, hoverHz: 988,  clickHz: 494 },
];

/* ── Chair rolling constants (separate from OBJECTS) ──────────────── */
const CHAIR_HOME = { x: 479, y: 234, w: 113, h: 113 }; /* px in 805×609 space */
const CARPET_ZONE = { x: 162, y: 241, w: 482, h: 281 }; /* from Figma inset-[39.57%_20%_14.23%_20.12%] */
const CHAIR_ROLL_RANGE = 28; /* max px displacement */

/* ── Wall text area positions (from Figma px in 805×609 space) ─────── */
/* Text Area 2 at (423,61) maps to the LEFT wall  — same position as Studio's WALL_PANEL (419,63).
   Text Area 1 'Welcome' centre ≈ (613,155) maps to the RIGHT wall. */
const NARR_PANEL = { x: 423, y: 61, w: 59, h: 155 };   /* LEFT wall — WallNarrative */
const WELCOME_POS = { x: 530, y: 45, w: 190, h: 160 };  /* RIGHT wall — WallWelcome  */
const WALL_ACCENT = '#00A87C';

/* ── Narrative chapters per object ────────────────────────────────── */
const THINKING_CHAPTERS: Record<string, { time: string; teaser: string; narrative: string }> = {
  thinkingboard: {
    time: '4:15 AM',
    teaser: 'THE\nBOARD',
    narrative: 'EVERY PROBLEM STARTS HERE. STICKY NOTES. RED STRING. THE MESS BEFORE THE MAP.',
  },
  laptop: {
    time: '7:30 AM',
    teaser: 'THE\nCRAFT',
    narrative: 'PROTOTYPING AT THE SPEED OF THOUGHT. PIXELS BEFORE PROPOSALS. THE CURSOR KNOWS THE WAY.',
  },
  telescope: {
    time: '10:00 PM',
    teaser: 'ZOOM\nOUT',
    narrative: 'SOMETIMES THE ANSWER IS NOT IN THE DETAILS. STEP BACK. SEE THE SYSTEM. FIND THE SEAMS.',
  },
  articlestand: {
    time: '11:45 AM',
    teaser: 'THE\nSTACK',
    narrative: 'STANDING ON THE SHOULDERS OF PAPERS. RESEARCH IS NOT READING. IT IS CONNECTING.',
  },
  diary: {
    time: '6:00 AM',
    teaser: 'UN\nFILTERED',
    narrative: 'THE FIRST DRAFT OF EVERY IDEA IS UGLY AND HONEST. THAT IS WHY IT MATTERS.',
  },
  notepad: {
    time: '2:30 PM',
    teaser: 'THE\nLOG',
    narrative: 'DECISIONS NEED PAPER TRAILS. NOT EVERY THOUGHT SURVIVES. THE GOOD ONES LEAVE MARKS.',
  },
};

const THINKING_FINALE = {
  time: '11:59 PM',
  teaser: 'THE\nMETHOD',
  narrative: 'OBSERVE. QUESTION. CONNECT. PROTOTYPE. REFLECT. THE ROOM REMEMBERS THE PROCESS.',
};

const DISCOVERY_IDS = ['thinkingboard', 'laptop', 'telescope', 'articlestand', 'diary', 'notepad'];

interface ObjPx { x: number; y: number; w: number; h: number }
const OBJ_PX: Record<string, ObjPx> = {};
OBJECTS.forEach(o => {
  OBJ_PX[o.id] = {
    x: (o.left / 100) * AW,
    y: (o.top / 100) * AH,
    w: ((100 - o.right - o.left) / 100) * AW,
    h: ((100 - o.top - o.bottom) / 100) * AH,
  };
});

interface Spr { x: number; y: number; vx: number; vy: number; tx: number; ty: number }
function step(s: Spr, k: number, d: number) {
  s.vx = (s.vx + (s.tx - s.x) * k) * d;
  s.vy = (s.vy + (s.ty - s.y) * k) * d;
  s.x += s.vx;
  s.y += s.vy;
}

interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number }
function makeParticle(): Particle {
  return {
    x: Math.random() * AW * 0.6 + AW * 0.03,
    y: Math.random() * AH * 0.4 + AH * 0.05,
    vx: (Math.random() - 0.3) * 0.12,
    vy: Math.random() * 0.1 + 0.02,
    size: Math.random() * 1.5 + 0.4,
    opacity: 0, life: 0,
    maxLife: 220 + Math.random() * 300,
  };
}

let _audioCtx: AudioContext | null = null;
function getAudioCtx() { if (!_audioCtx) _audioCtx = new AudioContext(); return _audioCtx; }
function playHoverSound(hz: number) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  } catch { /* */ }
}
function playClickSound(hz: number) {
  try {
    const ctx = getAudioCtx();
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator(); const g = ctx.createGain();
    o1.connect(g); o2.connect(g); g.connect(ctx.destination);
    o1.type = 'triangle'; o1.frequency.value = hz;
    o2.type = 'sine'; o2.frequency.value = hz * 2;
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    o1.start(); o2.start(); o1.stop(ctx.currentTime + 0.25); o2.stop(ctx.currentTime + 0.25);
  } catch { /* */ }
}

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
  exiting?: boolean;
  onExitComplete?: () => void;
  preview?: boolean;
  skipEntrance?: boolean;
}

export default function InteractiveThinkingBg({ onNavigateBack, onNavigateNext, exiting, onExitComplete, preview, skipEntrance }: Props) {
  const navigate = useNavigate();
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
  const reduced = useRef(false);
  const tick = useRef(0);

  const cloneContentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hideableCache = useRef<Record<string, HTMLElement[]>>({});
  const popDone = useRef(false);
  const popTimers = useRef<number[]>([]);
  const exitTimers = useRef<number[]>([]);

  /* Structural container refs for bloom entrance + wall collapse exit */
  const wallsContainerRef = useRef<HTMLElement | null>(null);
  const carpetContainerRef = useRef<HTMLElement | null>(null);
  const allFurnitureEls = useRef<HTMLElement[]>([]); /* non-interactive furniture for exit */

  /* Chair rolling — softer spring for wheeled feel (k=0.025, d=0.88) */
  const chairElRef = useRef<HTMLElement | null>(null);
  const chairSpr = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  const chairHovered = useRef(false);
  const chairDropped = useRef(false); /* true once user clicks to "place" the chair */
  const chairDropPos = useRef({ x: 0, y: 0 }); /* stored drop offset */
  const chairRedPaths = useRef<SVGPathElement[]>([]); /* red SVG paths for targeted glow */
  const chairGlowTick = useRef(0); /* throttle filter updates to every ~3 frames */

  /* Chair roll audio — persistent oscillators modulated by velocity */
  const chairRollNodes = useRef<{
    gain: GainNode; osc1: OscillatorNode; osc2: OscillatorNode; filter: BiquadFilterNode;
  } | null>(null);
  const initChairRollAudio = useCallback(() => {
    if (chairRollNodes.current) return;
    try {
      const ctx = getAudioCtx();
      /* Low rumble — sawtooth ~35 Hz (Deep Rubber preset) */
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 35;
      /* Mid wheel hum — triangle ~110 Hz */
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 110;
      /* Low-pass filter for muffled deep-rubber roll */
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      filter.Q.value = 2.0;
      /* Gain starts at 0 (silent) */
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      chairRollNodes.current = { gain, osc1, osc2, filter };
    } catch { /* */ }
  }, []);

  /* Wall color refs for palette switching */
  const wallRefs = useRef<{
    bg: HTMLElement | null;
    wallR: SVGPathElement | null;
    wallL: SVGPathElement | null;
    base: SVGPathElement | null;
    carpets: SVGPathElement[];
  }>({ bg: null, wallR: null, wallL: null, base: null, carpets: [] });

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
    if (w.bg) w.bg.style.backgroundColor = pal.bg;
    if (w.wallR) w.wallR.style.fill = pal.wallR;
    if (w.wallL) w.wallL.style.fill = pal.wallL;
    if (w.base) w.base.style.fill = pal.base;
    w.carpets.forEach(c => { c.style.fill = pal.carpet; });
  }, [lampOn]);

  /* Interaction state */
  const hovIdRef = useRef<string | null>(null);
  const clkIdRef = useRef<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [discoveredSet, setDiscoveredSet] = useState<Set<string>>(new Set());
  const discoveredRef = useRef<Set<string>>(new Set());
  const [portalReady, setPortalReady] = useState(false);
  const [laptopPortalReady, setLaptopPortalReady] = useState(false);
  const [boardPortalReady, setBoardPortalReady] = useState(false);
  const portalTimer = useRef<ReturnType<typeof setTimeout>>();
  const laptopPortalTimer = useRef<ReturnType<typeof setTimeout>>();
  const boardPortalTimer = useRef<ReturnType<typeof setTimeout>>();

  /* Light controls state (shared with PaperFlyingFx + LightControlsPanel) */
  const [lightCtrl, setLightCtrl] = useState<LightCtrl>(LIGHT_DEFAULTS);

  /* Zoom / Pan */
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
  useEffect(() => { discoveredRef.current = discoveredSet; }, [discoveredSet]);

  const fxSpr = useRef({ v: 0, cur: 0, tgt: 0 });
  const ambientSpr = useRef({ v: 0, cur: 1, tgt: 1 });

  /* Entrance */
  useEffect(() => { if (skipEntrance) { setEntered(true); return; } const t = setTimeout(() => setEntered(true), 80); return () => clearTimeout(t); }, [skipEntrance]);

  /* Reduced motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const h = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  /* Scroll-wheel zoom */
  useEffect(() => {
    const el = wrapperRef.current; if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; e.preventDefault();
      setZoom(z => { const d = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP; return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + d)); });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  /* Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && clkIdRef.current) {
        setClickedId(null); setHoveredId(null);
        if (portalTimer.current) clearTimeout(portalTimer.current);
        if (laptopPortalTimer.current) clearTimeout(laptopPortalTimer.current);
        if (boardPortalTimer.current) clearTimeout(boardPortalTimer.current);
        setPortalReady(false);
        setLaptopPortalReady(false);
        setBoardPortalReady(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* Pan */
  const onPanStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-hitzone]')) return;
    e.preventDefault(); isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: panX, y: panY };
    if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
  }, [panX, panY]);

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
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4 && clkIdRef.current) {
        setClickedId(null); setHoveredId(null);
        if (portalTimer.current) clearTimeout(portalTimer.current);
        if (laptopPortalTimer.current) clearTimeout(laptopPortalTimer.current);
        if (boardPortalTimer.current) clearTimeout(boardPortalTimer.current);
        setPortalReady(false);
        setLaptopPortalReady(false);
        setBoardPortalReady(false);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  /* Clone + pop-in */
  useEffect(() => {
    if (preview || !entered) return;
    const timer = setTimeout(() => {
      const roomEl = roomRef.current; if (!roomEl) return;

      /* ── Hide Figma text-area placeholder boxes ─────────────────── */
      /* These are the SVG panels exported from Figma that show as grey
         semi-transparent shapes on the walls. We render our own overlays. */
      const ta1 = roomEl.querySelector('[data-name="Text Area 1 \'Welcome\'"]');
      if (ta1) {
        /* Walk up to the absolutely-positioned flex container (2 levels up).
           Level 1 = flex-none rotated wrapper, Level 2 = inset-positioned container.
           (Level 3 would be the room root — do NOT hide that!) */
        const container = ta1.parentElement?.parentElement;
        if (container) (container as HTMLElement).style.display = 'none';
      }
      const ta2 = roomEl.querySelector('[data-name="Text Area 2"]');
      if (ta2) (ta2 as HTMLElement).style.display = 'none';

      /* ── Wall palette override ──────────────────────────────────── */
      const initPal = lampOnRef.current ? WALL_LIGHT : WALL_DARK;
      const bgDiv = roomEl.querySelector('[data-name="living room piece"]') as HTMLElement | null;
      if (bgDiv) {
        bgDiv.style.backgroundColor = initPal.bg;
        bgDiv.style.transition = 'background-color 800ms ease';
        wallRefs.current.bg = bgDiv;
      }

      const wallsSvg = roomEl.querySelector('[data-name="Walls"] svg');
      if (wallsSvg) {
        const paths = wallsSvg.querySelectorAll(':scope > g > path');
        if (paths[0]) {
          (paths[0] as SVGPathElement).style.fill = initPal.base;
          (paths[0] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.base = paths[0] as SVGPathElement;
        }
        if (paths[1]) {
          (paths[1] as SVGPathElement).style.fill = initPal.wallL;
          (paths[1] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.wallL = paths[1] as SVGPathElement;
        }
        if (paths[2]) {
          (paths[2] as SVGPathElement).style.fill = initPal.wallR;
          (paths[2] as SVGPathElement).style.transition = 'fill 800ms ease';
          wallRefs.current.wallR = paths[2] as SVGPathElement;
        }
      }

      const carpetSvg = roomEl.querySelector('[data-name="Carpet"] svg');
      if (carpetSvg) {
        const cPaths = carpetSvg.querySelectorAll('path');
        const carpetEls: SVGPathElement[] = [];
        cPaths.forEach(p => {
          (p as SVGPathElement).style.fill = initPal.carpet;
          (p as SVGPathElement).style.transition = 'fill 800ms ease';
          carpetEls.push(p as SVGPathElement);
        });
        wallRefs.current.carpets = carpetEls;
      }

      /* ── Object clones ──────────────────────────────────────────── */
      OBJECTS.forEach(obj => {
        const container = cloneContentRefs.current[obj.id];
        if (!container || container.children.length > 0) return;
        const base = roomEl.querySelector(`[data-name="${obj.dataName}"]`);
        if (!base) return;
        const hideables: HTMLElement[] = [];
        collectHideableEls(base, hideables);
        hideableCache.current[obj.id] = hideables;
        const addTS = (el: Element) => {
          el.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon').forEach(s => s.setAttribute('stroke', 'transparent'));
        };
        const stripDA = (el: Element) => {
          el.querySelectorAll('[data-name]').forEach(d => d.removeAttribute('data-name'));
          el.querySelectorAll('[data-ambient]').forEach(d => d.removeAttribute('data-ambient'));
        };
        const stripB = (el: Element) => {
          el.querySelectorAll('.mix-blend-multiply').forEach(d => {
            (d as HTMLElement).style.mixBlendMode = 'normal';
            (d as HTMLElement).style.opacity = '0';
          });
        };
        if (obj.isContents) {
          Array.from(base.children).forEach(child => {
            const c = child.cloneNode(true) as HTMLElement;
            stripDA(c); addTS(c); stripB(c); container.appendChild(c);
          });
        } else {
          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          wrapper.style.width = '100%';
          wrapper.style.height = '100%';
          wrapper.style.overflow = 'hidden';
          Array.from(base.children).forEach(child => {
            const c = child.cloneNode(true) as HTMLElement;
            stripDA(c); addTS(c); stripB(c);
            wrapper.appendChild(c);
          });
          container.appendChild(wrapper);
        }
      });

      /* ── Store structural refs for exit animation ───────────────── */
      const wallsEl = roomEl.querySelector('[data-name="Walls"]') as HTMLElement | null;
      if (wallsEl) wallsContainerRef.current = wallsEl;
      const carpetEl = roomEl.querySelector('[data-name="Carpet"]') as HTMLElement | null;
      if (carpetEl) carpetContainerRef.current = carpetEl;

      /* ── Bloom entrance: Walls build up from floor ─────────────── */
      if (wallsEl) {
        wallsEl.style.transform = 'scaleY(0.4) translateY(35%)';
        wallsEl.style.transformOrigin = 'center bottom';
        wallsEl.style.opacity = '0';
        const wt = window.setTimeout(() => {
          wallsEl.style.transition = 'transform 700ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 400ms ease-out';
          wallsEl.style.transform = '';
          wallsEl.style.opacity = '';
        }, 80);
        popTimers.current.push(wt);
        const wclear = window.setTimeout(() => {
          wallsEl.style.transition = '';
          wallsEl.style.transformOrigin = '';
        }, 880);
        popTimers.current.push(wclear);
      }

      /* ── Bloom entrance: Carpet unfolds ─────────────────────────── */
      if (carpetEl) {
        carpetEl.style.transform = 'scale(0.3) translateY(40%)';
        carpetEl.style.transformOrigin = 'center bottom';
        carpetEl.style.opacity = '0';
        const ct2 = window.setTimeout(() => {
          carpetEl.style.transition = 'transform 600ms cubic-bezier(0.22, 1.3, 0.36, 1), opacity 350ms ease-out';
          carpetEl.style.transform = '';
          carpetEl.style.opacity = '';
        }, 200);
        popTimers.current.push(ct2);
        const cclear = window.setTimeout(() => {
          carpetEl.style.transition = '';
          carpetEl.style.transformOrigin = '';
        }, 900);
        popTimers.current.push(cclear);
      }

      /* ── Bloom entrance: Objects rise from the ground ───────────── */
      /* Sort objects by vertical position — bottom-most bloom first
         (they're "closer" to the ground plane). */
      const sortedObjs = [...OBJECTS].sort((a, b) => {
        const ayCenter = (a.top + (100 - a.bottom)) / 2;
        const byCenter = (b.top + (100 - b.bottom)) / 2;
        return byCenter - ayCenter; /* highest bottom% first */
      });

      /* Hide originals with bloom-from-ground initial state */
      OBJECTS.forEach(obj => {
        const els = hideableCache.current[obj.id]; if (!els) return;
        els.forEach(el => {
          el.style.transform = 'translateY(55px) scale(0.35)';
          el.style.opacity = '0';
          el.style.transformOrigin = 'center bottom';
        });
      });

      const S = 90, I = 350, D = 550;
      const BLOOM_SPRING = 'cubic-bezier(0.22, 1.4, 0.36, 1)';
      sortedObjs.forEach((obj, i) => {
        const t = window.setTimeout(() => {
          const els = hideableCache.current[obj.id]; if (!els) return;
          els.forEach(el => {
            el.style.transition = `transform ${D}ms ${BLOOM_SPRING}, opacity ${D * 0.45}ms ease-out`;
            el.style.transform = '';
            el.style.opacity = '';
          });
        }, I + i * S);
        popTimers.current.push(t);
      });
      const ct = window.setTimeout(() => {
        popDone.current = true;
        OBJECTS.forEach(obj => {
          const els = hideableCache.current[obj.id]; if (!els) return;
          els.forEach(el => {
            el.style.transition = 'opacity 200ms ease';
            el.style.transformOrigin = '';
          });
        });
      }, I + OBJECTS.length * S + D + 50);
      popTimers.current.push(ct);

      /* ── Grab chair DOM element for rolling ────────────────────── */
      const chairEl = roomEl.querySelector('[data-name="chair"]') as HTMLElement | null;
      if (chairEl) {
        chairEl.style.willChange = 'transform';
        chairElRef.current = chairEl;
        /* Bloom entrance for the chair — rises from floor like other objects */
        chairEl.style.transform = 'translateY(55px) scale(0.35)';
        chairEl.style.opacity = '0';
        chairEl.style.transformOrigin = 'center bottom';
        const chairPopDelay = I + OBJECTS.length * S; /* after all other objects */
        const chairPopTimer = window.setTimeout(() => {
          chairEl.style.transition = `transform ${D}ms ${BLOOM_SPRING}, opacity ${D * 0.45}ms ease-out`;
          chairEl.style.transform = '';
          chairEl.style.opacity = '';
        }, chairPopDelay);
        popTimers.current.push(chairPopTimer);
        /* After pop-in completes, clear transitions so rAF can drive transform */
        const chairReadyTimer = window.setTimeout(() => {
          chairEl.style.transition = 'none';
          chairEl.style.transformOrigin = '';
        }, chairPopDelay + D + 50);
        popTimers.current.push(chairReadyTimer);

        /* ── Collect red SVG paths for targeted glow FX ────────── */
        /* Parse each path's fill attribute; red parts have R>140, G<80, B<80 */
        const svgEl = chairEl.querySelector('svg');
        if (svgEl) {
          const allPaths = svgEl.querySelectorAll<SVGPathElement>('path');
          const reds: SVGPathElement[] = [];
          allPaths.forEach(p => {
            const fill = p.getAttribute('fill') || '';
            const m = fill.match(/#([0-9A-Fa-f]{6})/);
            if (!m) return;
            const r = parseInt(m[1].slice(0, 2), 16);
            const g = parseInt(m[1].slice(2, 4), 16);
            const b = parseInt(m[1].slice(4, 6), 16);
            if (r > 140 && g < 80 && b < 80) {
              p.style.willChange = 'filter';
              reds.push(p);
            }
          });
          chairRedPaths.current = reds;
        }
      }
    }, 120);
    return () => { clearTimeout(timer); popTimers.current.forEach(t => clearTimeout(t)); };
  }, [entered]);

  /* Mouse -> parallax */
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced.current) return;
    const r = wrapperRef.current?.getBoundingClientRect(); if (!r) return;
    spring.current.tx = -(((e.clientX - r.left) / r.width) * 2 - 1) * PARALLAX_RANGE;
    spring.current.ty = -(((e.clientY - r.top) / r.height) * 2 - 1) * PARALLAX_RANGE;
  }, []);

  /* Handlers */
  const onObjEnter = useCallback((id: string) => {
    setHoveredId(id);
    const obj = OBJECTS.find(o => o.id === id);
    if (obj) playHoverSound(obj.hoverHz);
  }, []);
  const onObjLeave = useCallback(() => { if (!clkIdRef.current) setHoveredId(null); }, []);
  const onObjClick = useCallback((id: string) => {
    const was = clkIdRef.current === id;
    setClickedId(prev => {
      const next = prev === id ? null : id;
      if (next) {
        const obj = OBJECTS.find(o => o.id === id);
        if (obj) playClickSound(obj.clickHz);
        setDiscoveredSet(p => {
          if (p.has(id)) return p;
          const n = new Set(p); n.add(id); return n;
        });
        discoveredRef.current.add(id);
        /* Telescope = portal trigger (back to garage) */
        if (id === 'telescope') {
          if (portalTimer.current) clearTimeout(portalTimer.current);
          portalTimer.current = setTimeout(() => setPortalReady(true), 600);
        }
        /* Laptop = portal trigger (to design studio) */
        if (id === 'laptop') {
          if (laptopPortalTimer.current) clearTimeout(laptopPortalTimer.current);
          laptopPortalTimer.current = setTimeout(() => setLaptopPortalReady(true), 600);
        }
        /* Thinking Board = portal trigger (to article page) */
        if (id === 'thinkingboard') {
          if (boardPortalTimer.current) clearTimeout(boardPortalTimer.current);
          boardPortalTimer.current = setTimeout(() => setBoardPortalReady(true), 600);
        }
      } else {
        if (portalTimer.current) clearTimeout(portalTimer.current);
        if (laptopPortalTimer.current) clearTimeout(laptopPortalTimer.current);
        if (boardPortalTimer.current) clearTimeout(boardPortalTimer.current);
        setPortalReady(false);
        setLaptopPortalReady(false);
        setBoardPortalReady(false);
      }
      return next;
    });
    if (was) setHoveredId(null);
  }, []);

  /* Lamp toggle */
  const toggleLamp = useCallback(() => {
    const goingOn = !lampOnRef.current;
    flickerDir.current = goingOn ? 'on' : 'off';
    flickerEnd.current = tick.current + 14;
    setLampOn(goingOn); lampSpr.current.tgt = goingOn ? 1 : 0;
    try {
      const ctx = getAudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = goingOn ? 1800 : 900;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(); osc.stop(ctx.currentTime + 0.06);
    } catch { /* */ }
  }, []);

  /* Main rAF */
  useEffect(() => {
    if (preview) return;
    const s = spring.current;
    const pts = particles.current;
    const ls = fxSpr.current;
    const as = ambientSpr.current;
    for (let i = 0; i < 26; i++) pts.push(makeParticle());

    const loop = () => {
      tick.current++;
      const t = tick.current;
      const rd = reduced.current;
      const clkId = clkIdRef.current;
      const hovId = hovIdRef.current;
      const actId = clkId ?? hovId;

      /* Parallax spring */
      if (!rd) {
        step(s, 0.04, 0.84);
        const xf = `translate3d(${s.x}px,${s.y}px,0)`;
        if (roomRef.current) roomRef.current.style.transform = xf;
        if (cloneRef.current) cloneRef.current.style.transform = xf;
        if (wallTextRef.current) wallTextRef.current.style.transform = xf;
      }

      /* FX springs */
      ls.tgt = clkId ? 1 : 0;
      ls.v = (ls.v + (ls.tgt - ls.cur) * 0.08) * 0.78;
      ls.cur += ls.v;

      as.tgt = clkId ? 0 : 1;
      as.v = (as.v + (as.tgt - as.cur) * 0.06) * 0.82;
      as.cur += as.v;
      const ambientAlpha = as.cur;

      /* Lamp flicker */
      const lmp = lampSpr.current;
      lmp.v = (lmp.v + (lmp.tgt - lmp.cur) * 0.05) * 0.80;
      lmp.cur += lmp.v;
      let lampAlpha = lmp.cur;
      if (t < flickerEnd.current) {
        const rem = flickerEnd.current - t;
        const int = rem / 14;
        const flk = Math.sin(t * 2.8) * 0.5 + 0.5;
        if (flickerDir.current === 'off') lampAlpha = lampAlpha * (1 - flk * int * 0.85);
        else lampAlpha = lampAlpha + (1 - lampAlpha) * flk * int * 0.6;
      }
      lampAlpha = Math.max(0, Math.min(1, lampAlpha));
      const sceneAmbient = ambientAlpha * lampAlpha;

      /* Ambient elements */
      const roomEl = roomRef.current;
      if (roomEl) {
        roomEl.querySelectorAll<HTMLElement>('[data-ambient]').forEach(el => {
          el.style.opacity = String(sceneAmbient);
        });
        if (popDone.current) {
          OBJECTS.forEach(obj => {
            const els = hideableCache.current[obj.id]; if (!els) return;
            for (let i = 0; i < els.length; i++) els[i].style.opacity = actId === obj.id ? '0' : '';
          });
        }
      }

      /* Dust particles */
      const dc = dustRef.current;
      if (dc && !rd) {
        const ctx = dc.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          if (dc.width !== AW * dpr) {
            dc.width = AW * dpr; dc.height = AH * dpr;
            dc.style.width = `${AW}px`; dc.style.height = `${AH}px`;
            ctx.scale(dpr, dpr);
          }
          ctx.clearRect(0, 0, AW, AH);
          const da = 0.22 * sceneAmbient;
          for (let i = pts.length - 1; i >= 0; i--) {
            const p = pts[i];
            p.x += p.vx; p.y += p.vy; p.life++;
            const lr = p.life / p.maxLife;
            p.opacity = lr < 0.12 ? lr / 0.12 : lr > 0.8 ? (1 - lr) / 0.2 : 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,248,225,${p.opacity * da})`;
            ctx.fill();
            if (p.life >= p.maxLife || p.y > AH || p.x < 0 || p.x > AW) pts[i] = makeParticle();
          }
        }
      }

      /* FX canvas (spotlight + dim) */
      const fc = fxRef.current;
      if (fc) {
        const ctx = fc.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          if (fc.width !== AW * dpr) {
            fc.width = AW * dpr; fc.height = AH * dpr;
            fc.style.width = `${AW}px`; fc.style.height = `${AH}px`;
            ctx.scale(dpr, dpr);
          }
          ctx.clearRect(0, 0, AW, AH);

          /* Laptop screen glow */
          const lapPx = OBJ_PX['laptop'];
          if (lapPx && !rd && ambientAlpha > 0.01) {
            const mx = lapPx.x + 9, my = lapPx.y + 5, mw = 48, mh = 26;
            const hue = (t * 0.3) % 360;
            const mb = 1 + (1 - lampAlpha) * 1.5;
            const fl = (0.05 + Math.sin(t * 0.05) * 0.02) * mb;
            ctx.save();
            ctx.globalAlpha = Math.min(fl * ambientAlpha, 1);
            const sg = ctx.createLinearGradient(mx, my, mx, my + mh);
            sg.addColorStop(0, `hsl(${hue},40%,50%)`);
            sg.addColorStop(1, `hsl(${(hue + 40) % 360},35%,40%)`);
            ctx.fillStyle = sg;
            ctx.fillRect(mx, my, mw, mh);
            ctx.globalAlpha = (0.04 + (1 - lampAlpha) * 0.06) * ambientAlpha;
            ctx.fillStyle = '#fff';
            ctx.fillRect(mx, my + ((t * 0.6) % mh), mw, 1);
            ctx.restore();
          }

          /* Dim overlay when lamp off */
          if (lampAlpha < 0.99 && !clkId) {
            ctx.save();
            ctx.globalAlpha = (1 - lampAlpha) * 0.55;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, AW, AH);
            ctx.restore();

            /* Punch soft hole so the chair's DOM red-glow bleeds through
               the darkness — the FX canvas sits above the room SVG (z:10),
               so without this the dim rect would fully occlude the glow.  */
            if (chairRedPaths.current.length > 0) {
              const csp = chairSpr.current;
              const chx = CHAIR_HOME.x + CHAIR_HOME.w / 2 + csp.x;
              const chy = CHAIR_HOME.y + CHAIR_HOME.h / 2 + csp.y;
              const holeR = CHAIR_HOME.w * 0.75;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-out';
              const hg = ctx.createRadialGradient(chx, chy, 0, chx, chy, holeR);
              hg.addColorStop(0, `rgba(0,0,0,${(1 - lampAlpha) * 0.50})`);
              hg.addColorStop(0.55, `rgba(0,0,0,${(1 - lampAlpha) * 0.25})`);
              hg.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = hg;
              ctx.fillRect(chx - holeR, chy - holeR, holeR * 2, holeR * 2);
              ctx.restore();
            }
          }

          /* Spotlight on clicked object — hole-punch + linear spread (no shadow cone) */
          const fx = ls.cur;
          if (clkId && fx > 0.005) {
            const cp = OBJ_PX[clkId];
            if (cp) {
              const cx = cp.x + cp.w / 2;
              const cy = cp.y + cp.h / 2;
              const aw = cp.w;
              /* Dark overlay */
              ctx.save();
              ctx.globalAlpha = (0.55 + fx * 0.2) * Math.min(fx / 0.15, 1);
              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, AW, AH);
              ctx.restore();
              /* Soft radial hole punch — destination-out compositing */
              ctx.save();
              ctx.globalCompositeOperation = 'destination-out';
              const holeR = Math.max(aw, cp.h) * 2.2;
              const holeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR);
              holeGrad.addColorStop(0, 'rgba(0,0,0,1)');
              holeGrad.addColorStop(0.45, 'rgba(0,0,0,0.8)');
              holeGrad.addColorStop(0.75, 'rgba(0,0,0,0.25)');
              holeGrad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = holeGrad;
              ctx.fillRect(cx - holeR, cy - holeR, holeR * 2, holeR * 2);
              ctx.restore();
              /* Gentle horizontal warm-light gradient band */
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
              ctx.fillRect(0, cy - cp.h * 1.5, AW, cp.h * 3);
              ctx.restore();

              /* Also punch a hole for the chair red glow during spotlight */
              if (chairRedPaths.current.length > 0) {
                const csp = chairSpr.current;
                const chx2 = CHAIR_HOME.x + CHAIR_HOME.w / 2 + csp.x;
                const chy2 = CHAIR_HOME.y + CHAIR_HOME.h / 2 + csp.y;
                const holeR2 = CHAIR_HOME.w * 0.7;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                const hg2 = ctx.createRadialGradient(chx2, chy2, 0, chx2, chy2, holeR2);
                hg2.addColorStop(0, `rgba(0,0,0,${fx * 0.40})`);
                hg2.addColorStop(0.5, `rgba(0,0,0,${fx * 0.18})`);
                hg2.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = hg2;
                ctx.fillRect(chx2 - holeR2, chy2 - holeR2, holeR2 * 2, holeR2 * 2);
                ctx.restore();
              }
            }
          }
        }
      }

      /* Chair rolling */
      const chairEl = chairElRef.current;
      if (chairEl) {
        const cs = chairSpr.current;
        cs.vx = (cs.vx + (cs.tx - cs.x) * 0.025) * 0.88;
        cs.vy = (cs.vy + (cs.ty - cs.y) * 0.025) * 0.88;
        cs.x += cs.vx;
        cs.y += cs.vy;
        chairEl.style.transform = `translate3d(${cs.x}px,${cs.y}px,0)`;

        /* ── Chair roll sound: modulate gain + pitch by velocity ── */
        const rn = chairRollNodes.current;
        if (rn) {
          const speed = Math.sqrt(cs.vx * cs.vx + cs.vy * cs.vy);
          const ctx = getAudioCtx();
          const now = ctx.currentTime;
          const vol = Math.min(speed * 0.022, 0.04);
          rn.gain.gain.setTargetAtTime(vol, now, 0.04);
          /* Faster roll → higher pitch (Deep Rubber: gentler ramp) */
          rn.osc1.frequency.setTargetAtTime(35 + speed * 6, now, 0.06);
          rn.osc2.frequency.setTargetAtTime(110 + speed * 9, now, 0.06);
        }

        /* ── Red path glow — DOM-targeted drop-shadow on actual SVG paths ── */
        /* Multi-frequency breathing creates organic, never-repeating intensity.
           Throttled to every 3rd frame for performance (~20 DOM writes/sec).
           Tuning knobs: outer/inner multipliers and blur ranges (+25% bump). */
        const redPaths = chairRedPaths.current;
        if (redPaths.length > 0 && !rd) {
          chairGlowTick.current++;
          if (chairGlowTick.current % 3 === 0) {
            const b1 = Math.sin(t * 0.016) * 0.5 + 0.5;   // ~6.5s slow breathe
            const b2 = Math.sin(t * 0.041) * 0.3 + 0.5;   // ~2.5s medium pulse
            const b3 = Math.sin(t * 0.11)  * 0.1 + 0.5;   // ~0.95s micro flicker
            const gi = b1 * 0.50 + b2 * 0.35 + b3 * 0.15; // 0..1

            // Outer diffuse glow + tight core glow (+25% from v1)
            const blur1 = (2.5 + gi * 6.3).toFixed(1);     // 2.5–8.8px
            const alpha1 = (0.19 + gi * 0.56).toFixed(2);   // 0.19–0.75
            const blur2 = (0.6 + gi * 2.5).toFixed(1);     // 0.6–3.1px
            const alpha2 = (0.31 + gi * 0.63).toFixed(2);   // 0.31–0.94
            const f = `drop-shadow(0 0 ${blur1}px rgba(226,45,59,${alpha1})) drop-shadow(0 0 ${blur2}px rgba(220,40,50,${alpha2}))`;
            for (let i = 0; i < redPaths.length; i++) {
              redPaths[i].style.filter = f;
            }
          }
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId.current);
      /* Tear down chair roll audio */
      const rn = chairRollNodes.current;
      if (rn) {
        try { rn.osc1.stop(); } catch { /* */ }
        try { rn.osc2.stop(); } catch { /* */ }
        rn.osc1.disconnect(); rn.osc2.disconnect();
        rn.filter.disconnect(); rn.gain.disconnect();
        chairRollNodes.current = null;
      }
      /* Clear red path glow filters */
      chairRedPaths.current.forEach(p => { p.style.filter = ''; });
      chairRedPaths.current = [];
    };
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

  /* ═══ WALL COLLAPSE EXIT ANIMATION ═══════════════════════════════ */
  useEffect(() => {
    if (!exiting) return;
    const timers: number[] = [];
    const FALL_EASE = 'cubic-bezier(0.55, 0, 1, 0.45)';

    /* Phase 0: Immediately deselect any clicked object + disable interactions */
    setClickedId(null);
    setHoveredId(null);
    setBoardPortalReady(false);
    if (boardPortalTimer.current) clearTimeout(boardPortalTimer.current);

    /* Phase 1 (0-400ms): Objects fall down in reverse stagger */
    const reversedObjs = [...OBJECTS].reverse();
    reversedObjs.forEach((obj, i) => {
      timers.push(window.setTimeout(() => {
        const els = hideableCache.current[obj.id]; if (!els) return;
        els.forEach(el => {
          el.style.transition = `transform 420ms ${FALL_EASE}, opacity 320ms ease-in`;
          el.style.transformOrigin = 'center bottom';
          el.style.transform = `translateY(${45 + Math.random() * 25}px) rotate(${(Math.random() - 0.5) * 6}deg) scale(0.5)`;
          el.style.opacity = '0';
        });
      }, i * 55));
    });

    /* Phase 1b: Chair falls + kill red glow */
    timers.push(window.setTimeout(() => {
      const el = chairElRef.current;
      if (el) {
        el.style.transition = `transform 450ms ${FALL_EASE}, opacity 350ms ease-in`;
        el.style.transformOrigin = 'center bottom';
        el.style.transform = 'translateY(50px) rotate(-4deg) scale(0.4)';
        el.style.opacity = '0';
      }
      chairRedPaths.current.forEach(p => { p.style.filter = ''; });
    }, 80));

    /* Phase 2 (200ms): Walls collapse -- perspective fold forward + drop */
    timers.push(window.setTimeout(() => {
      const wallsEl = wallsContainerRef.current;
      if (wallsEl) {
        wallsEl.style.transition = `transform 650ms ${FALL_EASE}, opacity 550ms ease-in`;
        wallsEl.style.transformOrigin = 'center bottom';
        wallsEl.style.transform = 'perspective(500px) rotateX(25deg) translateY(30px) scaleY(0.3)';
        wallsEl.style.opacity = '0';
      }
    }, 200));

    /* Phase 2b (300ms): Carpet collapses */
    timers.push(window.setTimeout(() => {
      const carpetEl = carpetContainerRef.current;
      if (carpetEl) {
        carpetEl.style.transition = `transform 500ms ${FALL_EASE}, opacity 400ms ease-in`;
        carpetEl.style.transformOrigin = 'center center';
        carpetEl.style.transform = 'translateY(50px) scaleX(0.6) scaleY(0.2)';
        carpetEl.style.opacity = '0';
      }
    }, 300));

    /* Phase 3 (350ms): Background drops + fades */
    timers.push(window.setTimeout(() => {
      const bg = wallRefs.current.bg;
      if (bg) {
        bg.style.transition = 'transform 500ms ease-in, opacity 450ms ease-in';
        bg.style.transform = 'scale(0.94) translateY(15px)';
        bg.style.opacity = '0.2';
      }
    }, 350));

    /* Phase 3b (200ms): Wall text + clone layer fades out */
    timers.push(window.setTimeout(() => {
      if (wallTextRef.current) {
        wallTextRef.current.style.transition = 'opacity 300ms ease-in';
        wallTextRef.current.style.opacity = '0';
      }
      if (cloneRef.current) {
        cloneRef.current.style.transition = 'opacity 200ms ease-in';
        cloneRef.current.style.opacity = '0';
      }
    }, 200));

    /* Phase 4 (500ms): Whole wrapper fades to dark */
    timers.push(window.setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transition = 'opacity 500ms ease-in';
        wrapperRef.current.style.opacity = '0';
      }
    }, 500));

    /* Phase 5: Exit sound -- low rumble */
    timers.push(window.setTimeout(() => {
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.value = 55;
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch { /* */ }
    }, 100));

    /* Phase COMPLETE: Fire callback after all animations settle */
    timers.push(window.setTimeout(() => {
      onExitComplete?.();
    }, 1050));

    exitTimers.current = timers;
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, [exiting, onExitComplete]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden" onMouseMove={onMouseMove} onMouseLeave={() => { spring.current.tx = 0; spring.current.ty = 0; if (!clickedId) setHoveredId(null); }}>

      {/* ═══ Room viewport ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative transition-transform duration-300 ease-out" style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}>
          <div className="relative transition-all duration-[1400ms] ease-out" style={{ width: AW, height: AH, opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'scale(0.97) translateY(12px)' }}>
            <div ref={viewportRef} className="absolute inset-0 overflow-hidden cursor-grab" onMouseDown={onPanStart}>

              {/* Layer 1: Base room */}
              <div ref={roomRef} className="absolute" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform' }}>
                <div className="absolute" style={{ width: AW, height: AH, left: PAD, top: PAD }}>
                  <LivingRoomPiece />
                  {/* Force field on isometric table surface beneath laptop */}
                  {(() => {
                    const lp = OBJ_PX['laptop'];
                    const fieldSize = Math.max(lp.w, lp.h) * 3 * 0.3;
                    return (
                      <div className="absolute pointer-events-none" style={{
                        left: lp.x + lp.w * 0.5 - fieldSize / 2,
                        top: lp.y + lp.h * 0.7 - fieldSize / 2,
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
                            hovered: hoveredId === 'laptop',
                            clicked: clickedId === 'laptop',
                            color: '#00A87C',
                          }]}
                        />
                      </div>
                    );
                  })()}
                </div>
                {/* Ambient warm light from window area (right wall) */}
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 340, top: PAD + 100, width: 180, height: 200, background: 'linear-gradient(140deg, rgba(255,248,220,0.06) 0%, rgba(255,248,220,0.02) 35%, transparent 65%)', filter: 'blur(20px)', animation: 'itb-breathe 8s ease-in-out infinite' }} />
                {/* Ambient soft glow from thinking board area (left wall) */}
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 180, top: PAD + 170, width: 120, height: 140, background: 'radial-gradient(ellipse at 50% 30%, rgba(22,168,159,0.05) 0%, transparent 70%)', filter: 'blur(14px)', animation: 'itb-breathe 10s ease-in-out infinite 3s' }} />
                {/* Ambient lamp glow near article stand */}
                <div data-ambient className="absolute pointer-events-none" style={{ left: PAD + 120, top: PAD + 280, width: 65, height: 90, background: 'radial-gradient(ellipse at 50% 20%, rgba(255,207,77,0.06) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'itb-lamp 6s ease-in-out infinite' }} />
                <canvas ref={dustRef} className="absolute pointer-events-none" style={{ left: PAD, top: PAD, width: AW, height: AH }} />
              </div>

              {/* Layer 2: FX canvas */}
              <canvas ref={fxRef} className="absolute inset-0 pointer-events-none" style={{ width: AW, height: AH, zIndex: 10 }} />

              {/* Layer 2.3: Paper flying + volumetric ambience */}
              <PaperFlyingFx active={entered} lampOn={lampOn} ctrl={lightCtrl} />

              {/* Layer 2.5: Wall text overlays */}
              <div ref={wallTextRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 12 }}>
                {/* LEFT wall — Narrative (skewY -30deg)
                    NARR_PANEL at (423,61) sits on the left wall — same position as Studio's
                    WALL_PANEL (419,63). Uses identical clip-path + skew as the proven Studio pattern. */}
                <div className="absolute" style={{ left: PAD + NARR_PANEL.x, top: PAD + NARR_PANEL.y, width: NARR_PANEL.w, height: NARR_PANEL.h, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0% 26.8%, 100% 0%, 97.4% 76.5%, 0% 100%)' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transform: 'skewY(-30deg) skewX(0.5deg)', transformOrigin: '0% 26.8%' }}>
                      <div style={{ position: 'absolute', left: 0, top: '26.8%', width: '100%', height: '73.2%' }}>
                        <WallNarrative clickedId={clickedId} entered={entered} discoveredSet={discoveredSet} compact chapters={THINKING_CHAPTERS} objectIds={DISCOVERY_IDS} finale={THINKING_FINALE} accent={WALL_ACCENT} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* RIGHT wall — Welcome (skewY 30deg)
                    WELCOME_POS sits on the right wall. Uses the same skewY(30deg) + origin
                    pattern as the Studio's WELCOME-FRAME at (503,42). */}
                <div className="absolute" style={{ left: PAD + WELCOME_POS.x, top: PAD + WELCOME_POS.y, width: WELCOME_POS.w, height: WELCOME_POS.h }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: WELCOME_POS.w, height: 130, transform: 'skewY(30deg)', transformOrigin: '0 0', overflow: 'hidden' }}>
                    <WallWelcome entered={entered} discoveredCount={discoveredSet.size} dimmed={!lampOn || !!clickedId} label="THE THINKING ROOM" title1="HOW I" title2="THINK" subtitle="EVERY OBJECT HOLDS A METHOD · CLICK TO DISCOVER" totalDiscoverable={6} accent={WALL_ACCENT} inlineTitle />
                  </div>
                </div>
              </div>

              {/* Layer 3: Clone layer */}
              <div ref={cloneRef} className="absolute pointer-events-none" style={{ width: AW + PAD * 2, height: AH + PAD * 2, left: -PAD, top: -PAD, willChange: 'transform', zIndex: 15 }}>
                {OBJECTS.map(obj => {
                  const px = OBJ_PX[obj.id];
                  const isHov = hoveredId === obj.id;
                  const isClk = clickedId === obj.id;
                  const active = isHov || isClk;
                  const liftPx = isClk ? CLICK_LIFT : isHov ? HOVER_LIFT : 0;
                  const scale = isClk ? 1.3 : isHov ? 1.2 : 1;
                  const ease = isClk ? EASE_CLICK : EASE_HOVER;
                  return (
                    <div key={obj.id}>
                      <div className="absolute" style={{
                        left: PAD + px.x, top: PAD + px.y, width: px.w, height: px.h,
                        transform: `scale(${scale})`, transformOrigin: 'center center',
                        transition: `transform ${DUR} ${ease}, opacity ${DUR} ${ease}`,
                        opacity: active ? 1 : 0,
                      }}>
                        <div className="absolute" style={{
                          ...(obj.isContents ? { left: -px.x, top: -px.y, width: AW, height: AH } : { inset: 0 }),
                          transform: `translateY(-${liftPx}px)`,
                          transition: `transform ${DUR} ${ease}`,
                        }} ref={el => { cloneContentRefs.current[obj.id] = el; }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Layer 4: Hit zones */}
              {OBJECTS.map(obj => {
                const px = OBJ_PX[obj.id];
                return (
                  <div key={obj.id} data-hitzone className="absolute cursor-pointer"
                    style={{ left: px.x - 4, top: px.y - 4, width: px.w + 8, height: px.h + 8, zIndex: 20 }}
                    onMouseEnter={() => onObjEnter(obj.id)}
                    onMouseLeave={onObjLeave}
                    onClick={() => onObjClick(obj.id)}
                  />
                );
              })}

              {/* Layer 4b: Carpet zone — chair rolling interaction */}
              <div
                data-hitzone
                className="absolute"
                style={{
                  left: CARPET_ZONE.x, top: CARPET_ZONE.y,
                  width: CARPET_ZONE.w, height: CARPET_ZONE.h,
                  zIndex: 19, /* below object hit zones */
                  cursor: chairHovered.current ? 'grab' : 'default',
                }}
                onMouseMove={(e) => {
                  if (!chairElRef.current) return;
                  /* If chair was dropped, it stays put until re-hovered */
                  if (chairDropped.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  /* Mouse position in carpet-local 0..1 */
                  const mx01 = (e.clientX - rect.left) / rect.width;
                  const my01 = (e.clientY - rect.top) / rect.height;
                  /* Chair home center in carpet-local 0..1 */
                  const hx01 = (CHAIR_HOME.x + CHAIR_HOME.w / 2 - CARPET_ZONE.x) / CARPET_ZONE.w;
                  const hy01 = (CHAIR_HOME.y + CHAIR_HOME.h / 2 - CARPET_ZONE.y) / CARPET_ZONE.h;
                  /* Target: offset from home so the chair sticks close to cursor (×0.8 = 20% less reactive) */
                  const dx = (mx01 - hx01) * CARPET_ZONE.w * 0.8;
                  const dy = (my01 - hy01) * CARPET_ZONE.h * 0.8;
                  /* Clamp to carpet bounds (chair center stays within carpet) */
                  const maxDx = CARPET_ZONE.w * 0.35;
                  const maxDy = CARPET_ZONE.h * 0.35;
                  chairSpr.current.tx = Math.max(-maxDx, Math.min(maxDx, dx));
                  chairSpr.current.ty = Math.max(-maxDy, Math.min(maxDy, dy));
                  if (!chairHovered.current) {
                    chairHovered.current = true;
                    playHoverSound(659);
                    initChairRollAudio(); /* lazy-init rolling sound on first interaction */
                  }
                }}
                onClick={() => {
                  if (!chairElRef.current) return;
                  if (chairDropped.current) {
                    /* Second click: pick it back up (resume following cursor) */
                    chairDropped.current = false;
                    playClickSound(440);
                  } else {
                    /* First click: drop the chair at current position */
                    chairDropped.current = true;
                    chairDropPos.current = { x: chairSpr.current.x, y: chairSpr.current.y };
                    chairSpr.current.tx = chairDropPos.current.x;
                    chairSpr.current.ty = chairDropPos.current.y;
                    playClickSound(330);
                  }
                }}
                onMouseLeave={() => {
                  if (!chairDropped.current) {
                    /* Spring back to home if not dropped */
                    chairSpr.current.tx = 0;
                    chairSpr.current.ty = 0;
                  }
                  chairHovered.current = false;
                }}
              />

              {/* Layer 5: Vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.22) 100%)', zIndex: 25 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Room label ═══════════════════════════════════════════════ */}
      <div className="absolute top-4 left-5 z-[28] transition-all duration-[1200ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[5px] mb-0.5" style={{ color: 'rgba(0,168,124,0.5)' }}>ROOM 03</div>
        <h1 className="font-['Caladea',serif] text-[20px] text-white/80 tracking-[0.5px] leading-tight">How I Think</h1>
      </div>

      {/* ═══ Navigation buttons ═══════════════════════════════════════ */}
      {onNavigateBack && (
        <div className="absolute top-4 right-5 z-[28] transition-all duration-[1600ms] ease-out" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(-8px)' }}>
          <button onClick={onNavigateBack} className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 cursor-pointer">
            <span className="text-[12px] transition-transform duration-300 group-hover:-translate-x-1" style={{ color: 'rgba(255,255,255,0.35)' }}>&larr;</span>
            <span className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[2px] text-white/40">BACK TO GARAGE</span>
          </button>
        </div>
      )}

      {/* ═══ Portal CTA (telescope → back to garage) ═════════════════ */}
      {portalReady && clickedId === 'telescope' && onNavigateBack && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[28] flex items-center justify-center transition-all duration-500 ease-out" style={{ opacity: portalReady ? 1 : 0 }}>
          <button onClick={onNavigateBack} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,168,124,0.12) 0%, rgba(0,168,124,0.04) 100%)', border: '1px solid rgba(0,168,124,0.2)', boxShadow: '0 0 20px rgba(0,168,124,0.08), 0 4px 12px rgba(0,0,0,0.3)' }}>
            <div className="absolute inset-0 rounded-xl itb-portal-pulse" style={{ border: '1px solid rgba(0,168,124,0.3)' }} />
            <span className="text-[12px] transition-transform duration-300 group-hover:-translate-x-1" style={{ color: 'rgba(0,168,124,0.5)' }}>&larr;</span>
            <div className="w-2 h-2 rounded-full" style={{ background: '#00A87C', boxShadow: '0 0 8px rgba(0,168,124,0.6)' }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px]" style={{ color: 'rgba(0,168,124,0.8)' }}>BACK TO GARAGE</span>
          </button>
        </div>
      )}

      {/* ═══ Portal CTA (laptop → design studio) ═════════════════════ */}
      {laptopPortalReady && clickedId === 'laptop' && onNavigateNext && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[28] flex items-center justify-center transition-all duration-500 ease-out" style={{ opacity: laptopPortalReady ? 1 : 0 }}>
          <button onClick={onNavigateNext} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,168,124,0.12) 0%, rgba(0,168,124,0.04) 100%)', border: '1px solid rgba(0,168,124,0.2)', boxShadow: '0 0 20px rgba(0,168,124,0.08), 0 4px 12px rgba(0,0,0,0.3)' }}>
            <div className="absolute inset-0 rounded-xl itb-portal-pulse" style={{ border: '1px solid rgba(0,168,124,0.3)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#00A87C', boxShadow: '0 0 8px rgba(0,168,124,0.6)' }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px]" style={{ color: 'rgba(0,168,124,0.8)' }}>ENTER PROTOTYPE LAB</span>
            <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(0,168,124,0.5)' }}>&rarr;</span>
          </button>
        </div>
      )}

      {/* ═══ Portal CTA (thinking board → article page) ═══════════════ */}
      {boardPortalReady && clickedId === 'thinkingboard' && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[28] flex items-center justify-center transition-all duration-500 ease-out" style={{ opacity: boardPortalReady ? 1 : 0 }}>
          <button onClick={() => navigate('/how-i-build')} className="group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,168,124,0.12) 0%, rgba(0,168,124,0.04) 100%)', border: '1px solid rgba(0,168,124,0.2)', boxShadow: '0 0 20px rgba(0,168,124,0.08), 0 4px 12px rgba(0,0,0,0.3)' }}>
            <div className="absolute inset-0 rounded-xl itb-portal-pulse" style={{ border: '1px solid rgba(0,168,124,0.3)' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#00A87C', boxShadow: '0 0 8px rgba(0,168,124,0.6)' }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px]" style={{ color: 'rgba(0,168,124,0.8)' }}>OPEN THE BOARD</span>
            <span className="text-[12px] transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(0,168,124,0.5)' }}>&rarr;</span>
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
      </div>

      {/* ═══ Status pill ══════════════════════════════════════════════ */}
      <div className="absolute bottom-4 left-5 z-[28] flex items-center gap-1.5 transition-all duration-[1600ms] ease-out bg-black/30 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/[0.04]" style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}>
        <div className="w-[5px] h-[5px] rounded-full bg-[#00A87C]" />
        <span className="font-['Cambay',sans-serif] text-[11px] text-white/30 tracking-[0.5px]">How I Think &middot; Room 03 &middot; {discoveredSet.size}/{OBJECTS.length} Discovered</span>
      </div>

      {/* ═══ Light controls panel (above status pill) ═════════════════ */}
      <LightControlsPanel ctrl={lightCtrl} setCtrl={setLightCtrl} lampOn={lampOn} entered={entered} />

      <style>{`
        @keyframes itb-breathe { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes itb-lamp { 0%,100% { opacity:0.5; } 40% { opacity:1; } 60% { opacity:0.85; } }
        @keyframes itb-portal-pulse { 0%,100% { opacity:0.3; transform:scale(1); } 50% { opacity:0.8; transform:scale(1.02); } }
        .itb-portal-pulse { animation: itb-portal-pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}