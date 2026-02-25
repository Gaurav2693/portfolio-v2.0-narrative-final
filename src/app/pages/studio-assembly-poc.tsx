import { useRef, useEffect, useState, useCallback } from 'react';
import { createTimeline } from 'animejs';
import LivingRoomPiece from '@/imports/LivingRoomPiece-15281-1786';

/* ═══════════════════════════════════════════════════════════════════════
   STUDIO ASSEMBLY POC  —  v4: Asteroid Field + Mouse Reactive
   ──────────────────────────────────────────────────────────────────────
   Scattered phase = blown-up asteroid in space:
     • Fragments scattered across the ENTIRE viewport
     • Each piece fully visible (scale ~0.85, opacity ~0.9)
     • Gentle zero-gravity drift with slow rotation
     • Mouse cursor = gravitational repulsor field — fragments flee
     • Ambient space dust particles on canvas

   Assembly = velocity-adaptive spring pulls debris into formation.
   Lock-in pulse on completion.
   ═══════════════════════════════════════════════════════════════════════ */

const ROOM_W = 805;
const ROOM_H = 609;
const TOTAL_TICKS = 15;
const TIMELINE_DURATION = 3000;

/* ── Skip the first 2 ticks (laggy full-scatter "asteroid" state) ── */
const MIN_TICK = 2;

/* ── Velocity-adaptive spring ── */
const BASE_STIFFNESS = 0.025;
const MAX_STIFFNESS = 0.22;
const BASE_DAMPING = 0.78;
const FAST_DAMPING = 0.82;
const VELOCITY_WINDOW = 1200;
const WHEEL_THRESHOLD = 15;

/* ── Mouse repulsion ── */
const MOUSE_RADIUS = 180;          // px — repulsion influence radius
const MOUSE_STRENGTH = 60;         // max push in px
const MOUSE_DECAY_ZONE = 0.20;     // progress 0→0.20 = mouse effect fades out

/* ── Drift ── */
const DRIFT_SPEED = 0.15;          // base drift px/frame
const DRIFT_ROTATION = 0.03;       // deg/frame rotation drift

/* ── Canvas particles ── */
const MAX_TRAIL_PARTICLES = 800;
const TRAIL_LIFETIME = 45;
const TRAIL_BASE_SIZE = 3;
const SPACE_DUST_COUNT = 80;       // ambient space dust motes
const TRAIL_COLORS = [
  { r: 0, g: 234, b: 255 },
  { r: 64, g: 240, b: 170 },
  { r: 0, g: 168, b: 255 },
];

/* ── Lock-in pulse ── */
const LOCKIN_DURATION = 1400;
const LOCKIN_RING_COUNT = 3;

interface TrailParticle {
  x: number; y: number;
  size: number;
  life: number;
  maxLife: number;
  color: typeof TRAIL_COLORS[0];
  vx: number; vy: number;
}

interface SpaceDust {
  x: number; y: number;
  size: number;
  alpha: number;
  vx: number; vy: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface FragmentMeta {
  el: HTMLElement;
  lastX: number;
  lastY: number;
  // Scatter position (relative to room center, viewport-scale)
  scatterX: number;
  scatterY: number;
  scatterR: number;
  tier: number;
  // Drift state
  driftVx: number;
  driftVy: number;
  driftRv: number;            // rotational drift velocity
  driftOffsetX: number;       // accumulated drift offset
  driftOffsetY: number;
  driftOffsetR: number;
  // Mouse repulsion offset (smoothed)
  mouseOffsetX: number;
  mouseOffsetY: number;
}

export default function StudioAssemblyPoc() {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<any>(null);
  const fragmentsRef = useRef<FragmentMeta[]>([]);
  const trailParticlesRef = useRef<TrailParticle[]>([]);
  const spaceDustRef = useRef<SpaceDust[]>([]);
  const rafRef = useRef(0);
  const canvasRafRef = useRef(0);
  const prevProgressRef = useRef(0);
  const assembledFiredRef = useRef(false);

  /* ── Mouse tracking ── */
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  /* ── Velocity-adaptive spring state ── */
  const targetTickRef = useRef(MIN_TICK);
  const currentFloatRef = useRef(MIN_TICK);
  const springVelRef = useRef(0);
  const scrollTimestamps = useRef<number[]>([]);
  const scrollVelocityRef = useRef(0);
  const cooldownRef = useRef(false);

  const [fragmentCount, setFragmentCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(MIN_TICK);
  const [targetIndex, setTargetIndex] = useState(MIN_TICK);
  const [isAnimating, setIsAnimating] = useState(false);

  /* ═══════════════════════════════════════════════════════════════════
     MOUSE TRACKING
     ═══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SCROLL VELOCITY
     ═══════════════════════════════════════════════════════════════════ */
  const computeScrollVelocity = useCallback(() => {
    const now = performance.now();
    const stamps = scrollTimestamps.current;
    while (stamps.length > 0 && now - stamps[0] > VELOCITY_WINDOW) stamps.shift();
    if (stamps.length < 2) return 0;
    const elapsed = stamps[stamps.length - 1] - stamps[0];
    if (elapsed < 10) return stamps.length * 5;
    return ((stamps.length - 1) / elapsed) * 1000;
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SPRING LOOP  —  Drives timeline + mouse repulsion + drift
     ═══════════════════════════════════════════════════════════════════ */
  const startSpringLoop = useCallback(() => {
    const SETTLE_THRESHOLD = 0.001;
    let wasAnimating = false;

    const tick = () => {
      const target = targetTickRef.current;
      const curr = currentFloatRef.current;
      const diff = target - curr;

      const sv = scrollVelocityRef.current;
      const velocityT = Math.min(1, sv / 8);
      const stiffness = BASE_STIFFNESS + (MAX_STIFFNESS - BASE_STIFFNESS) * velocityT * velocityT;
      const damping = BASE_DAMPING + (FAST_DAMPING - BASE_DAMPING) * velocityT;

      springVelRef.current += diff * stiffness;
      springVelRef.current *= damping;
      currentFloatRef.current += springVelRef.current;

      const moving = Math.abs(diff) > SETTLE_THRESHOLD || Math.abs(springVelRef.current) > SETTLE_THRESHOLD;

      if (!moving) {
        currentFloatRef.current = target;
        springVelRef.current = 0;
        if (wasAnimating) { wasAnimating = false; setIsAnimating(false); setActiveIndex(target); }
      } else {
        if (!wasAnimating) { wasAnimating = true; setIsAnimating(true); }
      }

      const progress = Math.max(0, Math.min(1, currentFloatRef.current / TOTAL_TICKS));

      // ── Seek timeline ──
      if (timelineRef.current) {
        timelineRef.current.seek(progress * timelineRef.current.duration);
      }

      // ── Apply drift + mouse repulsion in scattered phase ──
      applyScatteredPhysics(progress);

      // ── Glow trails ──
      const delta = Math.abs(progress - prevProgressRef.current);
      if (delta > 0.0003) emitTrailParticles(sv);
      prevProgressRef.current = progress;

      // ── Lock-in ──
      if (progress >= 0.995 && !assembledFiredRef.current) {
        assembledFiredRef.current = true;
        setAssembled(true);
        setActiveIndex(TOTAL_TICKS);
        fireLockInPulse();
      } else if (progress < 0.9 && assembledFiredRef.current) {
        assembledFiredRef.current = false;
        setAssembled(false);
      }

      scrollVelocityRef.current *= 0.97;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SCATTERED PHYSICS  —  Drift + Mouse Repulsion
     ─────────────────────────────────────────────────────────────────
     When progress < MOUSE_DECAY_ZONE, each fragment:
       1. Drifts slowly (zero-gravity float)
       2. Gets pushed away from mouse cursor
       3. Offsets are applied ON TOP of the timeline position
     Effect fades linearly as progress approaches MOUSE_DECAY_ZONE.
     ═══════════════════════════════════════════════════════════════════ */
  const applyScatteredPhysics = useCallback((progress: number) => {
    const fragments = fragmentsRef.current;
    if (fragments.length === 0) return;

    // How much "scattered mode" influence remains (1 = full, 0 = none)
    const influence = progress < MOUSE_DECAY_ZONE
      ? 1 - (progress / MOUSE_DECAY_ZONE)
      : 0;

    if (influence <= 0) {
      // Reset any residual offsets
      fragments.forEach(f => {
        f.mouseOffsetX *= 0.85;
        f.mouseOffsetY *= 0.85;
        if (Math.abs(f.mouseOffsetX) < 0.01 && Math.abs(f.mouseOffsetY) < 0.01) {
          f.mouseOffsetX = 0;
          f.mouseOffsetY = 0;
        }
      });
      // Still need to apply residual offsets during fade-out
      const hasResidual = fragments.some(f => Math.abs(f.mouseOffsetX) > 0.01 || Math.abs(f.mouseOffsetY) > 0.01);
      if (!hasResidual) return;
    }

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const mouseActive = mouseRef.current.active;
    const container = containerRef.current;
    if (!container) return;

    for (const frag of fragments) {
      // ── Drift (accumulates while in scattered mode) ──
      if (influence > 0.5) {
        frag.driftOffsetX += frag.driftVx * DRIFT_SPEED;
        frag.driftOffsetY += frag.driftVy * DRIFT_SPEED;
        frag.driftOffsetR += frag.driftRv * DRIFT_ROTATION;

        // Wrap drift so fragments don't leave viewport too far
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (Math.abs(frag.driftOffsetX) > vw * 0.15) frag.driftVx *= -0.5;
        if (Math.abs(frag.driftOffsetY) > vh * 0.15) frag.driftVy *= -0.5;
      } else {
        // Decay drift as we leave scattered phase
        frag.driftOffsetX *= 0.92;
        frag.driftOffsetY *= 0.92;
        frag.driftOffsetR *= 0.92;
      }

      // ── Mouse repulsion ──
      if (mouseActive && influence > 0) {
        const rect = frag.el.getBoundingClientRect();
        const fcx = rect.left + rect.width / 2;
        const fcy = rect.top + rect.height / 2;

        const dx = fcx - mx;
        const dy = fcy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH * influence;
          const nx = dx / dist;
          const ny = dy / dist;
          frag.mouseOffsetX += nx * force * 0.15;
          frag.mouseOffsetY += ny * force * 0.15;
        }
      }

      // Decay mouse offset (springy return)
      frag.mouseOffsetX *= 0.92;
      frag.mouseOffsetY *= 0.92;

      // ── Apply combined offset via CSS transform modification ──
      const totalDx = (frag.driftOffsetX + frag.mouseOffsetX) * influence;
      const totalDy = (frag.driftOffsetY + frag.mouseOffsetY) * influence;
      const totalDr = frag.driftOffsetR * influence;

      if (Math.abs(totalDx) > 0.05 || Math.abs(totalDy) > 0.05 || Math.abs(totalDr) > 0.01) {
        // Read current transform set by anime, append our offset
        const current = frag.el.style.transform || '';
        frag.el.style.transform = current + ` translate(${totalDx}px, ${totalDy}px) rotate(${totalDr}deg)`;
      }
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     BUILD TIMELINE
     ═══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!roomRef.current) return;
    const initTimer = setTimeout(() => {
      buildTimeline();
      initSpaceDust();
      startSpringLoop();
    }, 120);
    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(canvasRafRef.current);
      if (timelineRef.current) { try { timelineRef.current.pause(); } catch {} }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildTimeline = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const roomRoot = room.querySelector('[data-name="living room piece"]') as HTMLElement;
    if (roomRoot) {
      roomRoot.style.overflow = 'visible';
      roomRoot.style.background = 'none';
    }
    room.querySelectorAll('svg').forEach(svg => { svg.style.overflow = 'visible'; });
    room.querySelectorAll('div').forEach(div => { div.style.overflow = 'visible'; });

    const allNamed = room.querySelectorAll<HTMLElement>('[data-name]');
    const fragments: { el: HTMLElement; cx: number; cy: number; dist: number }[] = [];

    const roomRect = room.getBoundingClientRect();
    const roomCX = roomRect.left + roomRect.width / 2;
    const roomCY = roomRect.top + roomRect.height / 2;

    allNamed.forEach(el => {
      if (el.dataset.name === 'living room piece') return;
      if (el.classList.contains('contents')) return;
      if (!el.classList.contains('absolute')) return;
      const hasSvg = el.querySelector(':scope > svg');
      const hasPositionedChild = el.querySelector(':scope > [data-name].absolute:not(.contents)');
      if (!hasSvg && hasPositionedChild) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - roomCX;
      const dy = cy - roomCY;
      fragments.push({ el, cx, cy, dist: Math.sqrt(dx * dx + dy * dy) });
    });

    if (fragments.length === 0) return;
    setFragmentCount(fragments.length);

    fragments.sort((a, b) => a.dist - b.dist);

    // ── Compute viewport-spanning scatter positions ──
    // Use golden-angle distribution for even spread across viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padX = vw * 0.08;
    const padY = vh * 0.08;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

    const metas: FragmentMeta[] = fragments.map((frag, i) => {
      const t = i / fragments.length;

      // Golden-angle spiral scattered across viewport
      const angle = i * goldenAngle + Math.sin(i * 2.37) * 0.5;
      const radius = 0.3 + Math.sqrt(t) * 0.7; // 0.3→1.0 normalized radius
      const spreadX = Math.cos(angle) * radius * (vw / 2 - padX);
      const spreadY = Math.sin(angle) * radius * (vh / 2 - padY);

      // Add jitter for natural feel
      const jitterX = (Math.sin(i * 7.13) - 0.5) * vw * 0.12;
      const jitterY = (Math.cos(i * 4.91) - 0.5) * vh * 0.12;

      const scatterX = spreadX + jitterX;
      const scatterY = spreadY + jitterY;
      const scatterR = (Math.sin(i * 3.17) - 0.5) * 25; // ±12.5° — mild rotation

      // Random drift velocity (zero-gravity float direction)
      const driftAngle = Math.random() * Math.PI * 2;
      const driftSpeed = 0.3 + Math.random() * 0.7;

      return {
        el: frag.el,
        lastX: frag.cx,
        lastY: frag.cy,
        scatterX,
        scatterY,
        scatterR,
        tier: t,
        driftVx: Math.cos(driftAngle) * driftSpeed,
        driftVy: Math.sin(driftAngle) * driftSpeed,
        driftRv: (Math.random() - 0.5) * 2,
        driftOffsetX: 0,
        driftOffsetY: 0,
        driftOffsetR: 0,
        mouseOffsetX: 0,
        mouseOffsetY: 0,
      };
    });
    fragmentsRef.current = metas;

    // ── Build Anime.js timeline ──
    // Fragments start scattered at full visibility, assemble to origin
    const tl = createTimeline({
      autoplay: false,
      defaults: { ease: 'inOutCubic' },
    });

    metas.forEach((frag) => {
      const timeOffset = frag.tier * (TIMELINE_DURATION * 0.6);
      const duration = TIMELINE_DURATION * 0.5;

      tl.add(frag.el, {
        translateX: [frag.scatterX, 0],
        translateY: [frag.scatterY, 0],
        rotate: [frag.scatterR, 0],
        scale: [0.88, 1],          // nearly full size when scattered
        opacity: [0.92, 1],        // clearly visible when scattered
        duration,
      }, timeOffset);
    });

    timelineRef.current = tl;
    // Spring starts at MIN_TICK so initial seek happens automatically via the rAF loop
    setReady(true);

    startCanvasLoop();
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     SPACE DUST — Ambient floating particles
     ═══════════════════════════════════════════════════════════════════ */
  const initSpaceDust = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dust: SpaceDust[] = [];
    for (let i = 0; i < SPACE_DUST_COUNT; i++) {
      dust.push({
        x: Math.random() * vw,
        y: Math.random() * vh,
        size: 0.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    spaceDustRef.current = dust;
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     WHEEL / KEY HANDLERS
     ═══════════════════════════════════════════════════════════════════ */
  const advanceTick = useCallback((direction: 1 | -1) => {
    const newTick = Math.max(MIN_TICK, Math.min(TOTAL_TICKS, targetTickRef.current + direction));
    if (newTick === targetTickRef.current) return;
    targetTickRef.current = newTick;
    setTargetIndex(newTick);
    scrollTimestamps.current.push(performance.now());
    scrollVelocityRef.current = computeScrollVelocity();
  }, [computeScrollVelocity]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      e.preventDefault();
      const sv = scrollVelocityRef.current;
      const cooldownMs = Math.max(60, 220 - sv * 25);
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      setTimeout(() => { cooldownRef.current = false; }, cooldownMs);
      advanceTick(e.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [advanceTick]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); advanceTick(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); advanceTick(-1); }
      if (e.key === 'Home') {
        e.preventDefault(); targetTickRef.current = MIN_TICK; setTargetIndex(MIN_TICK);
        scrollTimestamps.current.push(performance.now()); scrollVelocityRef.current = 10;
      }
      if (e.key === 'End') {
        e.preventDefault(); targetTickRef.current = TOTAL_TICKS; setTargetIndex(TOTAL_TICKS);
        scrollTimestamps.current.push(performance.now()); scrollVelocityRef.current = 10;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advanceTick]);

  /* ═══════════════════════════════════════════════════════════════════
     GLOW TRAIL EMITTER
     ═══════════════════════════════════════════════════════════════════ */
  const emitTrailParticles = useCallback((scrollVel: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const fragments = fragmentsRef.current;
    const particles = trailParticlesRef.current;
    const sampleRate = Math.max(1, Math.floor(fragments.length / (10 + scrollVel * 3)));

    for (let i = 0; i < fragments.length; i += sampleRate) {
      const frag = fragments[i];
      const rect = frag.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - canvasRect.left;
      const cy = rect.top + rect.height / 2 - canvasRect.top;
      const prevCX = frag.lastX - canvasRect.left;
      const prevCY = frag.lastY - canvasRect.top;
      const moved = Math.abs(cx - prevCX) > 0.3 || Math.abs(cy - prevCY) > 0.3;

      if (moved && particles.length < MAX_TRAIL_PARTICLES) {
        const color = TRAIL_COLORS[i % TRAIL_COLORS.length];
        const speed = Math.sqrt((cx - prevCX) ** 2 + (cy - prevCY) ** 2);
        const sizeMult = Math.min(2.5, 0.5 + speed * 0.04);
        particles.push({
          x: cx + (Math.random() - 0.5) * 4,
          y: cy + (Math.random() - 0.5) * 4,
          size: TRAIL_BASE_SIZE * sizeMult * (0.7 + Math.random() * 0.6),
          life: 0, maxLife: TRAIL_LIFETIME + Math.random() * 20,
          color,
          vx: (cx - prevCX) * 0.05 + (Math.random() - 0.5) * 0.2,
          vy: (cy - prevCY) * 0.05 + (Math.random() - 0.5) * 0.2,
        });
      }
      frag.lastX = rect.left + rect.width / 2;
      frag.lastY = rect.top + rect.height / 2;
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     CANVAS RENDER LOOP
     ═══════════════════════════════════════════════════════════════════ */
  const lockInParticlesRef = useRef<TrailParticle[]>([]);
  const lockInRingsRef = useRef<{ t: number; maxT: number; delay: number }[]>([]);
  const lockInActiveRef = useRef(false);
  const lockInStartRef = useRef(0);
  const lockInGlowProgressRef = useRef(0);
  const frameCountRef = useRef(0);

  const startCanvasLoop = useCallback(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) { canvasRafRef.current = requestAnimationFrame(render); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { canvasRafRef.current = requestAnimationFrame(render); return; }

      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, cw, ch);
      frameCountRef.current++;

      const progress = Math.max(0, Math.min(1, currentFloatRef.current / TOTAL_TICKS));

      // ── Space dust (always visible, stronger when scattered) ──
      const dustAlphaScale = 0.3 + (1 - progress) * 0.7;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const dust of spaceDustRef.current) {
        dust.x += dust.vx;
        dust.y += dust.vy;
        // Wrap around
        if (dust.x < -10) dust.x = cw + 10;
        if (dust.x > cw + 10) dust.x = -10;
        if (dust.y < -10) dust.y = ch + 10;
        if (dust.y > ch + 10) dust.y = -10;

        // Mouse parallax on dust
        if (mouseRef.current.active && progress < 0.3) {
          const ddx = dust.x - mx;
          const ddy = dust.y - my;
          const dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < 200 && dd > 1) {
            dust.x += (ddx / dd) * 0.15;
            dust.y += (ddy / dd) * 0.15;
          }
        }

        const twinkle = 0.5 + 0.5 * Math.sin(frameCountRef.current * dust.twinkleSpeed + dust.twinkleOffset);
        const alpha = dust.alpha * twinkle * dustAlphaScale;

        ctx.fillStyle = `rgba(200,230,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();

        // Tiny glow
        if (dust.size > 1) {
          ctx.fillStyle = `rgba(200,230,255,${alpha * 0.15})`;
          ctx.beginPath();
          ctx.arc(dust.x, dust.y, dust.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Trail particles ──
      const particles = trailParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
        const lr = p.life / p.maxLife;
        const alpha = (1 - lr) * 0.65;
        const size = p.size * (1 - lr * 0.4);

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        g.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.25})`);
        g.addColorStop(0.6, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.05})`);
        g.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2); ctx.fill();
      }

      // ── Lock-in burst particles ──
      const lp = lockInParticlesRef.current;
      for (let i = lp.length - 1; i >= 0; i--) {
        const p = lp[i];
        p.life++; p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.vy *= 0.98;
        if (p.life >= p.maxLife) { lp.splice(i, 1); continue; }
        const lr = p.life / p.maxLife;
        const alpha = Math.sin(lr * Math.PI) * 0.8;
        const size = p.size * (1 + lr * 0.5);

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
        g.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.4})`);
        g.addColorStop(0.4, `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha * 0.1})`);
        g.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.3, 0, Math.PI * 2); ctx.fill();
      }

      // ── Lock-in shockwave rings ──
      if (lockInActiveRef.current) {
        const now = performance.now();
        const elapsed = now - lockInStartRef.current;
        const ccx = cw / 2, ccy = ch / 2;

        for (const ring of lockInRingsRef.current) {
          const re = elapsed - ring.delay;
          if (re < 0) continue;
          ring.t = Math.min(1, re / ring.maxT);
          const radius = ring.t * Math.max(cw, ch) * 0.6;
          const alpha = (1 - ring.t) * 0.35;
          ctx.strokeStyle = `rgba(64,240,170,${alpha})`;
          ctx.lineWidth = 1.5 * (1 - ring.t) + 0.5;
          ctx.beginPath(); ctx.arc(ccx, ccy, radius, 0, Math.PI * 2); ctx.stroke();

          const gRing = ctx.createRadialGradient(ccx, ccy, radius * 0.9, ccx, ccy, radius);
          gRing.addColorStop(0, `rgba(64,240,170,0)`);
          gRing.addColorStop(1, `rgba(64,240,170,${alpha * 0.08})`);
          ctx.fillStyle = gRing;
          ctx.beginPath(); ctx.arc(ccx, ccy, radius, 0, Math.PI * 2); ctx.fill();
        }

        // Edge glow scan
        const glowT = lockInGlowProgressRef.current;
        if (glowT > 0 && glowT < 1) {
          const frags = fragmentsRef.current;
          const cr = canvas.getBoundingClientRect();
          for (const frag of frags) {
            const fragGlow = 1 - Math.min(1, Math.abs(glowT - frag.tier) * 5);
            if (fragGlow <= 0) continue;
            const rect = frag.el.getBoundingClientRect();
            const fx = rect.left + rect.width / 2 - cr.left;
            const fy = rect.top + rect.height / 2 - cr.top;
            const fSize = Math.max(rect.width, rect.height) * 0.6;

            const gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fSize);
            gg.addColorStop(0, `rgba(64,240,170,${fragGlow * 0.15})`);
            gg.addColorStop(0.5, `rgba(0,234,255,${fragGlow * 0.06})`);
            gg.addColorStop(1, `rgba(0,234,255,0)`);
            ctx.fillStyle = gg;
            ctx.beginPath(); ctx.arc(fx, fy, fSize, 0, Math.PI * 2); ctx.fill();
          }
        }

        if (lockInRingsRef.current.every(r => r.t >= 1) && lp.length === 0 && glowT >= 1) {
          lockInActiveRef.current = false;
          lockInRingsRef.current = [];
        }
      }

      // ── Mouse cursor glow (scattered phase only) ──
      if (mouseRef.current.active && progress < 0.25) {
        const cursorAlpha = (1 - progress / 0.25) * 0.12;
        const cg = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
        cg.addColorStop(0, `rgba(0,234,255,${cursorAlpha})`);
        cg.addColorStop(0.3, `rgba(0,234,255,${cursorAlpha * 0.3})`);
        cg.addColorStop(1, `rgba(0,234,255,0)`);
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(mx, my, MOUSE_RADIUS, 0, Math.PI * 2); ctx.fill();
      }

      canvasRafRef.current = requestAnimationFrame(render);
    };
    canvasRafRef.current = requestAnimationFrame(render);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     LOCK-IN PULSE
     ═══════════════════════════════════════════════════════════════════ */
  const fireLockInPulse = useCallback(() => {
    const canvas = canvasRef.current;
    const room = roomRef.current;
    if (!canvas || !room) return;

    lockInActiveRef.current = true;
    lockInStartRef.current = performance.now();
    lockInGlowProgressRef.current = 0;

    lockInRingsRef.current = Array.from({ length: LOCKIN_RING_COUNT }, (_, i) => ({
      t: 0, maxT: 900 + i * 200, delay: i * 150,
    }));

    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const burst = lockInParticlesRef.current;
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      burst.push({
        x: cx + (Math.random() - 0.5) * 10, y: cy + (Math.random() - 0.5) * 10,
        size: 2 + Math.random() * 3, life: 0, maxLife: 50 + Math.random() * 40,
        color: TRAIL_COLORS[i % TRAIL_COLORS.length],
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      });
    }

    const glowStart = performance.now();
    const animateGlow = () => {
      const t = Math.min(1, (performance.now() - glowStart) / LOCKIN_DURATION);
      lockInGlowProgressRef.current = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      if (t < 1) requestAnimationFrame(animateGlow);
    };
    requestAnimationFrame(animateGlow);

    const roomRoot = room.querySelector('[data-name="living room piece"]') as HTMLElement;
    if (roomRoot) {
      const pulseStart = performance.now();
      const animatePulse = () => {
        const pt = Math.min(1, (performance.now() - pulseStart) / 800);
        roomRoot.style.filter = `brightness(${1 + Math.sin(pt * Math.PI) * 0.12})`;
        if (pt < 1) requestAnimationFrame(animatePulse);
        else roomRoot.style.filter = '';
      };
      requestAnimationFrame(animatePulse);
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  const progress = activeIndex / TOTAL_TICKS;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ backgroundColor: '#08080E', cursor: progress < 0.2 ? 'none' : 'default' }}
    >
      {/* ── Ambient grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,234,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,234,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: 0.4 + progress * 0.6,
      }} />

      {/* ── Radial glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,234,255,0.03) 0%, transparent 70%)',
        opacity: 0.2 + progress * 0.8,
        transition: 'opacity 0.5s',
      }} />

      {/* ── Title ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(22px, 3vw, 40px)',
          letterSpacing: '0.08em',
          color: '#FFFFFF',
          margin: 0,
        }}>
          STUDIO ASSEMBLY
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.25em',
          color: '#00EAFF',
          textTransform: 'uppercase',
          marginTop: 2,
          opacity: 0.5,
        }}>
          ASTEROID FIELD &bull; MOUSE REACTIVE &bull; {fragmentCount} FRAGMENTS
        </p>
      </div>

      {/* ── Room Container ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: ROOM_W, height: ROOM_H, overflow: 'visible' }}
      >
        <div ref={roomRef} className="w-full h-full" style={{ overflow: 'visible' }}>
          <LivingRoomPiece />
        </div>
      </div>

      {/* ── Canvas overlay ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ── Progress Bar ── */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-72">
        <div className="relative w-full h-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: assembled ? '#40F0AA' : '#00EAFF',
              boxShadow: `0 0 12px ${assembled ? 'rgba(64,240,170,0.5)' : 'rgba(0,234,255,0.4)'}`,
              transition: 'background-color 0.5s, box-shadow 0.5s',
            }}
          />
          <div className="absolute top-0 left-0 w-full h-full flex justify-between pointer-events-none">
            {Array.from({ length: TOTAL_TICKS + 1 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 1,
                  height: i === 0 || i === TOTAL_TICKS ? 8 : 4,
                  marginTop: i === 0 || i === TOTAL_TICKS ? -3 : -1,
                  backgroundColor: i <= activeIndex
                    ? (assembled ? 'rgba(64,240,170,0.5)' : 'rgba(0,234,255,0.5)')
                    : 'rgba(255,255,255,0.08)',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-2">
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: '0.15em',
            color: activeIndex === MIN_TICK ? '#00EAFF' : 'rgba(255,255,255,0.15)',
            textTransform: 'uppercase',
          }}>
            SCATTERED
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: '0.15em',
            color: isAnimating ? '#00EAFF' : 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', transition: 'color 0.3s',
          }}>
            {activeIndex} / {TOTAL_TICKS}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8, letterSpacing: '0.15em',
            color: assembled ? '#40F0AA' : 'rgba(255,255,255,0.15)',
            textTransform: 'uppercase',
          }}>
            ASSEMBLED
          </span>
        </div>
      </div>

      {/* ── Status ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: '0.2em',
        color: activeIndex === MIN_TICK ? '#00EAFF' : assembled ? '#40F0AA' : 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase', opacity: 0.5,
      }}>
        {!ready ? 'INITIALIZING...'
          : activeIndex === MIN_TICK ? 'MOVE YOUR MOUSE — SCROLL TO ASSEMBLE'
          : assembled ? 'ROOM ASSEMBLED — LOCKED IN'
          : 'ASSEMBLING...'}
      </div>

      {/* ── Scroll hint ── */}
      {activeIndex === MIN_TICK && ready && !isAnimating && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <rect x="1" y="1" width="18" height="26" rx="9" stroke="rgba(0,234,255,0.3)" strokeWidth="1" />
            <circle cx="10" cy="8" r="2" fill="rgba(0,234,255,0.5)">
              <animate attributeName="cy" values="8;18;8" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      )}

      {/* ── Tier legend ── */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col gap-4">
        {[
          { label: 'STRUCTURAL', color: '#00EAFF' },
          { label: 'FURNITURE', color: '#F59E0B' },
          { label: 'DETAILS', color: '#40F0AA' },
        ].map((tier, i) => {
          const tierActive = i === 0 ? progress > 0.05 : i === 1 ? progress > 0.35 : progress > 0.65;
          return (
            <div key={tier.label} className="flex items-center gap-2">
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                backgroundColor: tierActive ? tier.color : 'rgba(255,255,255,0.08)',
                transition: 'all 0.5s ease',
                boxShadow: tierActive ? `0 0 6px ${tier.color}44` : 'none',
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 7, letterSpacing: '0.2em',
                color: tierActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)',
                textTransform: 'uppercase', transition: 'color 0.5s ease',
              }}>
                {tier.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Top-right info ── */}
      <div className="absolute top-6 right-8 z-20 pointer-events-none text-right">
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase',
        }}>
          SPRING → {targetIndex}
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          color: isAnimating ? 'rgba(0,234,255,0.3)' : 'rgba(255,255,255,0.08)',
          letterSpacing: '0.05em', lineHeight: 1, transition: 'color 0.3s',
        }}>
          {fragmentCount}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 7, color: 'rgba(255,255,255,0.1)',
          marginTop: 4, textTransform: 'uppercase',
        }}>
          FRAGMENTS
        </div>
      </div>

      {/* ── Back link ── */}
      <a
        href="/"
        className="absolute top-6 left-6 z-20 no-underline"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.25)',
          textDecoration: 'none', textTransform: 'uppercase',
        }}
      >
        &larr; BACK
      </a>
    </div>
  );
}