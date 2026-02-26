import { useRef, useEffect, useState, useCallback, type ComponentType, type MutableRefObject, type LazyExoticComponent } from 'react';
import { createTimeline } from 'animejs';

/* ═══════════════════════════════════════════════════════════════════════
   ROOM ASSEMBLY VIEW  —  Scroll-driven SVG fragment assembly
   ────────────────────────────────────────────────────────────
   Renders a Figma-exported room SVG and animates its fragments from a
   scattered state to assembled, driven by an external progress ref.
   
   The room is rendered at the SAME zoom / centering / PAD structure as
   InteractiveRoomBg so the swap from assembly → interactive is
   pixel-seamless.

   Features:
     • Anime.js timeline seeked by internally-smoothed progress
     • Mouse repulsion on fragments (fades as assembly progresses)
     • Glow trail particles on canvas
     • Space dust ambient particles
     • Cursor glow in scattered phase
     • Internal velocity-smoothed progress for slow, satisfying assembly
   ═══════════════════════════════════════════════════════════════════════ */

const TOTAL_TICKS = 15;
const TIMELINE_DURATION = 3000;
const MIN_TICK = 2;  // Skip the full-scatter "asteroid" state

/* ── Internal smoothing (decouples assembly speed from journey spring) ── */
const SMOOTH_FACTOR = 0.035;    // lerp speed per frame — lower = slower assembly
const SMOOTH_ACCEL  = 0.12;     // faster lerp when progress > 0.85 (snap the tail)
const SMOOTH_EXIT   = 0.09;     // faster lerp during exit/disassembly (matches crossfade timing)
const SMOOTH_THRESHOLD = 0.002; // close enough to snap

/* ── Mouse repulsion ── */
const MOUSE_RADIUS = 220;
const MOUSE_STRENGTH = 70;
const MOUSE_DECAY_PROGRESS = 0.55;   // mouse effect fades over this progress range

/* ── Drift ── */
const DRIFT_SPEED = 0.15;
const DRIFT_ROTATION = 0.03;

/* ── Canvas particles ── */
const MAX_TRAIL_PARTICLES = 120;
const TRAIL_LIFETIME = 55;
const TRAIL_BASE_SIZE = 3.5;
const SPACE_DUST_COUNT = 45;
const TRAIL_COLORS = [
  { r: 0, g: 234, b: 255 },
  { r: 64, g: 240, b: 170 },
  { r: 0, g: 168, b: 255 },
];

/* ── Room layout (matches InteractiveRoomBg) ── */
const PARALLAX_RANGE = 14;
const PAD = PARALLAX_RANGE * 3;  // 42px bleed for parallax

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
  el: HTMLElement | SVGElement;
  lastX: number;
  lastY: number;
  scatterX: number;
  scatterY: number;
  scatterR: number;
  tier: number;
  driftVx: number;
  driftVy: number;
  driftRv: number;
  driftOffsetX: number;
  driftOffsetY: number;
  driftOffsetR: number;
  mouseOffsetX: number;
  mouseOffsetY: number;
}

interface Props {
  /** The Figma-exported room component */
  RoomComponent: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  /** Room intrinsic dimensions */
  roomWidth: number;
  roomHeight: number;
  /** Zoom scale to match InteractiveRoomBg (default 2.0) */
  zoom?: number;
  /** External progress ref: 0 = scattered, 1 = assembled */
  progressRef: MutableRefObject<number>;
  /** Called once when internal smoothed progress reaches >= 0.97 */
  onAssembled?: () => void;
  /** Called when smoothed progress drops back below 0.05 after having been assembled */
  onDisassembled?: () => void;
}

export default function RoomAssemblyView({
  RoomComponent,
  roomWidth,
  roomHeight,
  zoom = 2.0,
  progressRef,
  onAssembled,
  onDisassembled,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<any>(null);
  const fragmentsRef = useRef<FragmentMeta[]>([]);
  const trailParticlesRef = useRef<TrailParticle[]>([]);
  const spaceDustRef = useRef<SpaceDust[]>([]);
  const rafRef = useRef(0);
  const assembledFiredRef = useRef(false);
  const frameCountRef = useRef(0);

  /* ── Internal smoothed progress (lerps toward progressRef slowly) ── */
  const smoothedRef = useRef(0);
  /* ── Tracks highest smoothed value seen (gates disassembled callback) ── */
  const peakRef = useRef(0);

  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const [ready, setReady] = useState(false);

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
     BUILD TIMELINE + START LOOP
     ═══════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!roomRef.current) return;
    const initTimer = setTimeout(() => {
      buildTimeline();
      initSpaceDust();
      startRenderLoop();
    }, 120);
    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(rafRef.current);
      if (timelineRef.current) { try { timelineRef.current.pause(); } catch {} }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildTimeline = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    // Make overflow visible for scattered fragments
    const roomRoot = room.querySelector('[data-name]') as HTMLElement;
    if (roomRoot) {
      roomRoot.style.overflow = 'visible';
      roomRoot.style.background = 'none';
    }
    room.querySelectorAll('svg').forEach(svg => { svg.style.overflow = 'visible'; });
    room.querySelectorAll('div').forEach(div => { div.style.overflow = 'visible'; });

    // Collect animatable fragments
    const allNamed = room.querySelectorAll<HTMLElement>('[data-name]');
    const fragments: { el: HTMLElement | SVGElement; cx: number; cy: number; dist: number }[] = [];

    const roomRect = room.getBoundingClientRect();
    const roomCX = roomRect.left + roomRect.width / 2;
    const roomCY = roomRect.top + roomRect.height / 2;

    allNamed.forEach(el => {
      const name = el.dataset.name;
      if (!name) return;
      if (el === roomRoot) return;
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

    // ── Fallback: monolithic SVG rooms (e.g. GarrageRoomPiece) ──
    // If no div-wrapped fragments found, discover SVG <g id="..."> groups
    if (fragments.length === 0) {
      // Find the top-level SVG group (the room root group)
      const rootG = room.querySelector('svg > g[id]');
      if (rootG) {
        // Make the root SVG and all groups overflow-visible
        const svg = rootG.closest('svg');
        if (svg) { svg.style.overflow = 'visible'; }

        // Hide the background <rect> (e.g. the #08080E fill) so it doesn't
        // render as a giant black slab during scatter
        const bgRect = rootG.querySelector(':scope > rect');
        if (bgRect) { (bgRect as SVGElement).style.display = 'none'; }

        // Collect direct child <g> and <path> with id (skip the background <rect>)
        const children = rootG.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as SVGElement;
          const tag = child.tagName.toLowerCase();
          // Skip background rect
          if (tag === 'rect') continue;
          // Only animate named groups and paths
          if (tag !== 'g' && tag !== 'path') continue;
          const id = child.getAttribute('id');
          if (!id) continue;

          // Make SVG groups overflow-visible for scattered state
          if (tag === 'g') {
            (child as SVGGElement).style.overflow = 'visible';
          }

          const rect = child.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - roomCX;
          const dy = cy - roomCY;
          fragments.push({ el: child, cx, cy, dist: Math.sqrt(dx * dx + dy * dy) });
        }
      }
    }

    if (fragments.length === 0) return;

    fragments.sort((a, b) => a.dist - b.dist);

    // Golden-angle scatter positions across viewport
    // Scatter distances are in SCREEN space, so divide by zoom since
    // translateX/Y on the element is in the zoomed coordinate space.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padX = vw * 0.06;
    const padY = vh * 0.06;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const metas: FragmentMeta[] = fragments.map((frag, i) => {
      const t = i / fragments.length;
      const angle = i * goldenAngle + Math.sin(i * 2.37) * 0.5;
      const radius = 0.3 + Math.sqrt(t) * 0.7;
      const spreadX = (Math.cos(angle) * radius * (vw / 2 - padX)) / zoom;
      const spreadY = (Math.sin(angle) * radius * (vh / 2 - padY)) / zoom;
      const jitterX = ((Math.sin(i * 7.13) - 0.5) * vw * 0.12) / zoom;
      const jitterY = ((Math.cos(i * 4.91) - 0.5) * vh * 0.12) / zoom;

      const driftAngle = Math.random() * Math.PI * 2;
      const driftSpeed = 0.3 + Math.random() * 0.7;

      return {
        el: frag.el,
        lastX: frag.cx,
        lastY: frag.cy,
        scatterX: spreadX + jitterX,
        scatterY: spreadY + jitterY,
        scatterR: 0,    // No rotation — preserves isometric angle integrity
        tier: t,
        driftVx: Math.cos(driftAngle) * driftSpeed,
        driftVy: Math.sin(driftAngle) * driftSpeed,
        driftRv: 0,     // No drift rotation — same reason
        driftOffsetX: 0,
        driftOffsetY: 0,
        driftOffsetR: 0,
        mouseOffsetX: 0,
        mouseOffsetY: 0,
      };
    });
    fragmentsRef.current = metas;

    // Build Anime.js timeline
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
        scale: [0.96, 1],     // Subtle scale — avoids distorting isometric proportions
        opacity: [0.7, 1],
        duration,
      }, timeOffset);
    });

    timelineRef.current = tl;
    setReady(true);
  }, [zoom]);

  /* ═══════════════════════════════════════════════════════════════════
     SPACE DUST
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
     SCATTERED PHYSICS  —  Drift + Mouse Repulsion
     ═══════════════════════════════════════════════════════════════════ */
  const applyScatteredPhysics = useCallback((progress: number) => {
    const fragments = fragmentsRef.current;
    if (fragments.length === 0) return;

    const influence = progress < MOUSE_DECAY_PROGRESS
      ? 1 - (progress / MOUSE_DECAY_PROGRESS)
      : 0;

    if (influence <= 0) {
      fragments.forEach(f => {
        f.mouseOffsetX *= 0.85;
        f.mouseOffsetY *= 0.85;
        if (Math.abs(f.mouseOffsetX) < 0.01 && Math.abs(f.mouseOffsetY) < 0.01) {
          f.mouseOffsetX = 0;
          f.mouseOffsetY = 0;
        }
      });
      const hasResidual = fragments.some(f => Math.abs(f.mouseOffsetX) > 0.01 || Math.abs(f.mouseOffsetY) > 0.01);
      if (!hasResidual) return;
    }

    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const mouseActive = mouseRef.current.active;

    for (const frag of fragments) {
      // Drift
      if (influence > 0.5) {
        frag.driftOffsetX += frag.driftVx * DRIFT_SPEED;
        frag.driftOffsetY += frag.driftVy * DRIFT_SPEED;
        frag.driftOffsetR += frag.driftRv * DRIFT_ROTATION;
        const vw = window.innerWidth / zoom;
        const vh = window.innerHeight / zoom;
        if (Math.abs(frag.driftOffsetX) > vw * 0.15) frag.driftVx *= -0.5;
        if (Math.abs(frag.driftOffsetY) > vh * 0.15) frag.driftVy *= -0.5;
      } else {
        frag.driftOffsetX *= 0.92;
        frag.driftOffsetY *= 0.92;
        frag.driftOffsetR *= 0.92;
      }

      // Mouse repulsion (in screen space, so divide force by zoom)
      if (mouseActive && influence > 0) {
        const rect = frag.el.getBoundingClientRect();
        const fcx = rect.left + rect.width / 2;
        const fcy = rect.top + rect.height / 2;
        const dx = fcx - mx;
        const dy = fcy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH * influence / zoom;
          const nx = dx / dist;
          const ny = dy / dist;
          frag.mouseOffsetX += nx * force * 0.15;
          frag.mouseOffsetY += ny * force * 0.15;
        }
      }

      frag.mouseOffsetX *= 0.92;
      frag.mouseOffsetY *= 0.92;

      // Apply combined offset (translation only — no rotation to preserve isometric angles)
      const totalDx = (frag.driftOffsetX + frag.mouseOffsetX) * influence;
      const totalDy = (frag.driftOffsetY + frag.mouseOffsetY) * influence;

      if (Math.abs(totalDx) > 0.05 || Math.abs(totalDy) > 0.05) {
        const current = frag.el.style.transform || '';
        frag.el.style.transform = current + ` translate(${totalDx}px, ${totalDy}px)`;
      }
    }
  }, [zoom]);

  /* ═══════════════════════════════════════════════════════════════════
     TRAIL EMITTER
     ═══════════════════════════════════════════════════════════════════ */
  const emitTrailParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const fragments = fragmentsRef.current;
    const particles = trailParticlesRef.current;
    const sampleRate = Math.max(1, Math.floor(fragments.length / 12));

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
     MAIN rAF LOOP  —  Smooths progressRef, seeks timeline, renders canvas
     ═══════════════════════════════════════════════════════════════════ */
  const startRenderLoop = useCallback(() => {
    const render = () => {
      // ── Smooth the external progress with a slow lerp ──
      const target = progressRef.current;
      const cur = smoothedRef.current;
      const diff = target - cur;

      // ── DORMANT CHECK ──
      // If smoothed progress is stable at extremes (fully assembled or fully scattered),
      // skip ALL expensive work. Just check if target has changed to wake up.
      const isDormant = Math.abs(diff) < SMOOTH_THRESHOLD &&
        (cur >= 0.97 || cur < 0.01);
      
      if (isDormant) {
        // Still need to fire callbacks if not yet fired
        if (cur >= 0.97 && !assembledFiredRef.current) {
          assembledFiredRef.current = true;
          onAssembled?.();
        }
        if (cur < 0.01 && peakRef.current > 0.15) {
          if (assembledFiredRef.current) assembledFiredRef.current = false;
          peakRef.current = 0;
          onDisassembled?.();
        }
        // Clear canvas and trail particles when dormant to free memory
        if (trailParticlesRef.current.length > 0) {
          trailParticlesRef.current.length = 0;
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (Math.abs(diff) > SMOOTH_THRESHOLD) {
        if (diff < 0) {
          // EXIT direction: target < current — progress decreasing
          // Use faster smoothing so scatter matches the interactive overlay crossfade
          smoothedRef.current += diff * SMOOTH_EXIT;
        } else if (cur > 0.85) {
          // ENTRY tail: snap the last 15% faster for satisfying lock-in
          smoothedRef.current += diff * SMOOTH_ACCEL;
        } else {
          // ENTRY body: slow, satisfying assembly
          smoothedRef.current += diff * SMOOTH_FACTOR;
        }
      } else {
        smoothedRef.current = target;
      }
      const smoothed = smoothedRef.current;

      // Track peak smoothed value (gates disassembled to prevent firing at init)
      if (smoothed > peakRef.current) {
        peakRef.current = smoothed;
      }

      // Map smoothed 0→1 to timeline ticks: MIN_TICK → TOTAL_TICKS
      const timelineTick = MIN_TICK + smoothed * (TOTAL_TICKS - MIN_TICK);
      const timelineProgress = timelineTick / TOTAL_TICKS;

      // Seek timeline
      if (timelineRef.current) {
        timelineRef.current.seek(timelineProgress * timelineRef.current.duration);
      }

      // Apply scattered physics (mouse repulsion + drift)
      applyScatteredPhysics(smoothed);

      // Emit trail particles when smoothed progress is actively changing
      const moving = Math.abs(diff) > 0.001;
      if (moving) emitTrailParticles();

      // ── Phase callbacks ──
      // Fire assembled when smoothed reaches near-1
      if (smoothed >= 0.97 && !assembledFiredRef.current) {
        assembledFiredRef.current = true;
        onAssembled?.();
      }

      // Fire disassembled when smoothed drops near 0 AND we've seen
      // meaningful progress (peak > 0.15). This handles BOTH:
      //   1. Normal exit: fully assembled → fully disassembled
      //   2. Interrupted: user scrolled through quickly, never fully assembled
      if (smoothed < 0.05 && peakRef.current > 0.15) {
        if (assembledFiredRef.current) {
          assembledFiredRef.current = false;
        }
        peakRef.current = 0;  // Reset for potential re-entry
        onDisassembled?.();
      }

      // ── Render canvas ──
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
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

          const mx = mouseRef.current.x;
          const my = mouseRef.current.y;

          // ── Space dust ──
          const dustAlphaScale = 0.3 + (1 - smoothed) * 0.7;
          for (const dust of spaceDustRef.current) {
            dust.x += dust.vx;
            dust.y += dust.vy;
            if (dust.x < -10) dust.x = cw + 10;
            if (dust.x > cw + 10) dust.x = -10;
            if (dust.y < -10) dust.y = ch + 10;
            if (dust.y > ch + 10) dust.y = -10;

            if (mouseRef.current.active && smoothed < 0.3) {
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
            const a = (1 - lr) * 0.65;
            const sz = p.size * (1 - lr * 0.4);

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 3);
            g.addColorStop(0, `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.25})`);
            g.addColorStop(0.6, `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.05})`);
            g.addColorStop(1, `rgba(${p.color.r},${p.color.g},${p.color.b},0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, sz * 3, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, sz * 0.4, 0, Math.PI * 2); ctx.fill();
          }

          // ── Cursor glow (scattered phase) ──
          if (mouseRef.current.active && smoothed < 0.5) {
            const cursorAlpha = (1 - smoothed / 0.5) * 0.12;
            const cg = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
            cg.addColorStop(0, `rgba(0,234,255,${cursorAlpha})`);
            cg.addColorStop(0.3, `rgba(0,234,255,${cursorAlpha * 0.3})`);
            cg.addColorStop(1, `rgba(0,234,255,0)`);
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.arc(mx, my, MOUSE_RADIUS, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
  }, [applyScatteredPhysics, emitTrailParticles, onAssembled, onDisassembled, progressRef, zoom]);

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ─────
     Uses the EXACT same centering / sizing / PAD structure as
     InteractiveRoomBg so the assembled position is pixel-identical.
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ backgroundColor: '#08080E', overflow: 'visible' }}
    >
      {/* ── Ambient grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,234,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,234,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: ready ? 0.5 : 0,
        transition: 'opacity 1s',
      }} />

      {/* ── Radial glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,234,255,0.03) 0%, transparent 70%)',
        opacity: ready ? 0.3 : 0,
        transition: 'opacity 1s',
      }} />

      {/* ── Room viewport (matches InteractiveRoomBg structure) ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className="relative"
            style={{
              width: roomWidth,
              height: roomHeight,
              overflow: 'visible',
              opacity: ready ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            {/* Parallax-pad wrapper (same as InteractiveRoomBg roomRef) */}
            <div
              className="absolute"
              style={{
                width: roomWidth + PAD * 2,
                height: roomHeight + PAD * 2,
                left: -PAD,
                top: -PAD,
                overflow: 'visible',
              }}
            >
              <div
                ref={roomRef}
                className="absolute"
                style={{
                  width: roomWidth,
                  height: roomHeight,
                  left: PAD,
                  top: PAD,
                  overflow: 'visible',
                }}
              >
                <RoomComponent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Canvas overlay (full viewport, not zoomed) ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
