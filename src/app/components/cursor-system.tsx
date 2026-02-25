import { useRef, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   CURSOR SYSTEM  —  Premium Portfolio Cursor
   ────────────────────────────────────────────
   Canvas-based custom cursor with spring physics, glassmorphism
   appearance, room-aware contextual behaviors, and interaction states.

   Architecture:
   - Single fixed canvas overlay (pointer-events: none)
   - Inner dot + outer ring with independent spring physics
   - Room-specific ambient effects (trail, jitter, crosshair, magnetic)
   - Click ripple, hover scale, text caret morph
   - Event delegation for zero-config interaction detection

   Room personalities:
     studio  — precision: crosshair hints, accent glow near objects
     garage  — energy: faint motion trail, warm tint
     room3   — ideation: micro-jitter, pencil halo, warm sepia glow
     default — calm baseline for all other pages
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Dimensions & Physics ─────────────────────────────────────── */
const DOT_RADIUS = 4;
const RING_RADIUS = 18;
const GLOW_RADIUS = 50;

// Spring: stiffness, damping (lower stiff = more inertia, higher damp = less overshoot)
// Tuned ~30% softer than v1 for a calmer, more premium feel
const DOT_SPRING  = { k: 0.095, d: 0.82 };
const RING_SPRING = { k: 0.045, d: 0.84 };

// Interaction animation speeds (lerp per frame) — slowed to match softer springs
const LERP_HOVER = 0.055;
const LERP_CARET = 0.06;
const LERP_ACCENT = 0.04;

// Click ripple
const RIPPLE_DURATION = 28; // frames (~460ms at 60fps)
const RIPPLE_EXPAND = 28;   // px expansion
const MAX_RIPPLES = 4;

// Trail (garage room)
const TRAIL_LENGTH = 7;
const TRAIL_SAMPLE_INTERVAL = 3; // record every N frames

// Magnetic pull
const MAGNETIC_RANGE = 100;    // px detection radius
const MAGNETIC_STRENGTH = 0.12; // max pull factor

/* ── Colors ───────────────────────────────────────────────────── */
const WHITE = (a: number) => `rgba(255,255,255,${a})`;
const ACCENT = (a: number) => `rgba(0,168,124,${a})`;
const WARM = (a: number) => `rgba(255,238,210,${a})`;

/* ── Types ────────────────────────────────────────────────────── */
interface Vec2 { x: number; y: number }
interface SpringBody extends Vec2 { vx: number; vy: number }
interface Ripple { x: number; y: number; age: number }
type InteractionKind = 'none' | 'clickable' | 'text' | 'draggable';

/* ── Global room setter ───────────────────────────────────────── */
let _currentRoom = 'default';
export function setCursorRoom(room: string) { _currentRoom = room; }

/* ── Helpers ──────────────────────────────────────────────────── */
function springStep(body: SpringBody, target: Vec2, k: number, d: number) {
  body.vx = (body.vx + (target.x - body.x) * k) * d;
  body.vy = (body.vy + (target.y - body.y) * k) * d;
  body.x += body.vx;
  body.y += body.vy;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function classifyElement(el: Element | null): InteractionKind {
  if (!el) return 'none';
  // Fast: check computed cursor on target element (inherits from ancestors)
  try {
    const cs = window.getComputedStyle(el as HTMLElement).cursor;
    if (cs === 'text') return 'text';
  } catch { /* ignore */ }
  let node: Element | null = el;
  let depth = 0;
  while (node && depth < 8) {
    const tag = node.tagName;
    // Text inputs
    if (tag === 'INPUT') {
      const t = (node as HTMLInputElement).type;
      if (['text', 'email', 'password', 'search', 'url', 'tel', 'number'].includes(t)) return 'text';
    }
    if (tag === 'TEXTAREA') return 'text';
    if ((node as HTMLElement).contentEditable === 'true') return 'text';
    // Draggable
    if ((node as HTMLElement).draggable || node.hasAttribute('data-draggable')) return 'draggable';
    // Clickable
    if (tag === 'BUTTON' || tag === 'A') return 'clickable';
    if (node.getAttribute('role') === 'button') return 'clickable';
    if (node.hasAttribute('data-hitzone')) return 'clickable';
    if ((node as HTMLElement).classList?.contains('cursor-pointer')) return 'clickable';
    node = node.parentElement;
    depth++;
  }
  return 'none';
}

/* ── Touch detection ──────────────────────────────────────────── */
function isFinePointer() {
  return window.matchMedia('(pointer: fine)').matches;
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function CursorSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const activeRef = useRef(false);

  // Mouse state (updated from events, read in rAF)
  const mouse = useRef<Vec2>({ x: -100, y: -100 });
  const mouseVel = useRef<Vec2>({ x: 0, y: 0 });
  const prevMouse = useRef<Vec2>({ x: -100, y: -100 });
  const mouseDown = useRef(false);
  const mouseVisible = useRef(false);

  // Spring bodies
  const dot = useRef<SpringBody>({ x: -100, y: -100, vx: 0, vy: 0 });
  const ring = useRef<SpringBody>({ x: -100, y: -100, vx: 0, vy: 0 });

  // Interaction state
  const interactionKind = useRef<InteractionKind>('none');
  const hoveredEl = useRef<Element | null>(null);

  // Animated values (lerped each frame)
  const hoverFactor = useRef(0);    // 0 = default, 1 = hovering interactive
  const caretFactor = useRef(0);    // 0 = circle, 1 = text caret
  const accentFactor = useRef(0);   // 0 = white, 1 = accent-tinted glow
  const pressScale = useRef(1);     // momentary press shrink
  const crosshairAlpha = useRef(0); // studio crosshair lines

  // Click ripples
  const ripples = useRef<Ripple[]>([]);

  // Trail (garage)
  const trail = useRef<Vec2[]>([]);
  const trailCounter = useRef(0);

  // Magnetic pull target
  const magneticOffset = useRef<Vec2>({ x: 0, y: 0 });

  // Frame counter
  const frame = useRef(0);

  /* ── Event handlers ──────────────────────────────────────── */
  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    if (!mouseVisible.current) mouseVisible.current = true;
  }, []);

  const onMouseDown = useCallback((e: MouseEvent) => {
    mouseDown.current = true;
    // Spawn ripple
    if (ripples.current.length < MAX_RIPPLES) {
      ripples.current.push({ x: e.clientX, y: e.clientY, age: 0 });
    }
  }, []);

  const onMouseUp = useCallback(() => { mouseDown.current = false; }, []);

  const onMouseLeave = useCallback(() => { mouseVisible.current = false; }, []);
  const onMouseEnter = useCallback(() => { mouseVisible.current = true; }, []);

  const onMouseOver = useCallback((e: MouseEvent) => {
    hoveredEl.current = e.target as Element;
    interactionKind.current = classifyElement(e.target as Element);
  }, []);

  /* ── Main render loop ───────────────────────────────────── */
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(renderLoop); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { rafRef.current = requestAnimationFrame(renderLoop); return; }

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Resize canvas if needed
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, w, h);

    // Don't render if mouse hasn't appeared
    if (!mouseVisible.current) {
      rafRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    frame.current++;
    const room = _currentRoom;
    const mx = mouse.current.x;
    const my = mouse.current.y;

    // Mouse velocity
    mouseVel.current.x = mx - prevMouse.current.x;
    mouseVel.current.y = my - prevMouse.current.y;
    prevMouse.current.x = mx;
    prevMouse.current.y = my;

    /* ── Spring physics ─────────────────────────────────── */
    springStep(dot.current, mouse.current, DOT_SPRING.k, DOT_SPRING.d);
    springStep(ring.current, dot.current, RING_SPRING.k, RING_SPRING.d);

    /* ── Interaction targets ────────────────────────────── */
    const kind = interactionKind.current;
    const isClickable = kind === 'clickable';
    const isText = kind === 'text';
    const isDrag = kind === 'draggable';

    const targetHover = (isClickable || isDrag) ? 1 : 0;
    const targetCaret = isText ? 1 : 0;
    const targetAccent = isClickable ? 1 : 0;

    hoverFactor.current = lerp(hoverFactor.current, targetHover, LERP_HOVER);
    caretFactor.current = lerp(caretFactor.current, targetCaret, LERP_CARET);
    accentFactor.current = lerp(accentFactor.current, targetAccent, LERP_ACCENT);

    // Press animation
    const targetPress = mouseDown.current ? 0.88 : 1;
    pressScale.current = lerp(pressScale.current, targetPress, 0.11);

    // Studio crosshair
    const targetCrosshair = (room === 'studio' && isClickable) ? 1 : 0;
    crosshairAlpha.current = lerp(crosshairAlpha.current, targetCrosshair, 0.05);

    /* ── Magnetic pull (subtle offset on ring toward hovered element center) ─── */
    let magTx = 0, magTy = 0;
    if (isClickable && hoveredEl.current) {
      try {
        // Find the actual interactive ancestor for bounding rect
        let target = hoveredEl.current;
        let node: Element | null = hoveredEl.current;
        while (node) {
          if (node.tagName === 'BUTTON' || node.tagName === 'A' || node.hasAttribute('data-hitzone') || node.getAttribute('role') === 'button') {
            target = node; break;
          }
          node = node.parentElement;
        }
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - ring.current.x;
        const dy = cy - ring.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAGNETIC_RANGE && dist > 1) {
          const pull = MAGNETIC_STRENGTH * (1 - dist / MAGNETIC_RANGE);
          magTx = dx * pull;
          magTy = dy * pull;
        }
      } catch { /* ignore */ }
    }
    magneticOffset.current.x = lerp(magneticOffset.current.x, magTx, 0.06);
    magneticOffset.current.y = lerp(magneticOffset.current.y, magTy, 0.06);

    /* ── Derived positions ─────────────────────────────── */
    const dx = dot.current.x;
    const dy = dot.current.y;
    const rx = ring.current.x + magneticOffset.current.x;
    const ry = ring.current.y + magneticOffset.current.y;

    const hf = hoverFactor.current;
    const cf = caretFactor.current;
    const af = accentFactor.current;
    const ps = pressScale.current;

    // Ring scale: hover grows, press shrinks, caret elongates
    const ringScale = (1 + hf * 0.18) * ps;
    const ringRx = RING_RADIUS * ringScale * (1 - cf * 0.35);  // narrower for caret
    const ringRy = RING_RADIUS * ringScale * (1 + cf * 0.25);  // taller for caret

    /* ── Room: Garage trail ───────────────────────────── */
    if (room === 'garage') {
      trailCounter.current++;
      if (trailCounter.current % TRAIL_SAMPLE_INTERVAL === 0) {
        trail.current.unshift({ x: rx, y: ry });
        if (trail.current.length > TRAIL_LENGTH) trail.current.pop();
      }
      // Draw trail
      for (let i = trail.current.length - 1; i >= 0; i--) {
        const t = trail.current[i];
        const progress = i / TRAIL_LENGTH;
        const alpha = (1 - progress) * 0.07;
        const r = RING_RADIUS * (1 - progress * 0.35);
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = WARM(alpha);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    } else {
      trail.current.length = 0;
      trailCounter.current = 0;
    }

    /* ── Glow aura ───────────────────────────────────── */
    const glowIntensity = 1 + hf * 1.2;
    const glowR = GLOW_RADIUS * (1 + hf * 0.3);
    const baseGlowA = 0.05 * glowIntensity;
    const accentGlowA = 0.10 * af * glowIntensity;

    // White glow
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, glowR);
    grad.addColorStop(0, WHITE(baseGlowA));
    grad.addColorStop(0.4, WHITE(baseGlowA * 0.5));
    grad.addColorStop(1, WHITE(0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Accent glow overlay
    if (af > 0.01) {
      const aGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, glowR * 0.85);
      aGrad.addColorStop(0, ACCENT(accentGlowA));
      aGrad.addColorStop(0.5, ACCENT(accentGlowA * 0.4));
      aGrad.addColorStop(1, ACCENT(0));
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, glowR * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Room3 warm sepia glow
    if (room === 'room3') {
      const sGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, glowR * 0.7);
      sGrad.addColorStop(0, WARM(0.04));
      sGrad.addColorStop(1, WARM(0));
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, glowR * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Studio crosshair hints ─────────────────────── */
    if (crosshairAlpha.current > 0.01) {
      const ca = crosshairAlpha.current;
      const lineLen = 7;
      const gap = ringRx + 4;
      ctx.save();
      ctx.strokeStyle = WHITE(0.18 * ca);
      ctx.lineWidth = 0.7;
      ctx.lineCap = 'round';
      // Four lines extending from ring edge
      ctx.beginPath();
      ctx.moveTo(rx, ry - gap); ctx.lineTo(rx, ry - gap - lineLen);
      ctx.moveTo(rx, ry + gap); ctx.lineTo(rx, ry + gap + lineLen);
      ctx.moveTo(rx - gap, ry); ctx.lineTo(rx - gap - lineLen, ry);
      ctx.moveTo(rx + gap, ry); ctx.lineTo(rx + gap + lineLen, ry);
      ctx.stroke();
      ctx.restore();
    }

    /* ── Outer ring (glass) ──────────────────────────── */
    ctx.save();
    ctx.beginPath();
    if (Math.abs(cf) < 0.01) {
      // Perfect circle (fast path)
      ctx.arc(rx, ry, RING_RADIUS * ringScale, 0, Math.PI * 2);
    } else {
      // Ellipse for caret morph
      ctx.ellipse(rx, ry, ringRx, ringRy, 0, 0, Math.PI * 2);
    }
    // Glass fill
    const fillA = 0.025 + hf * 0.035;
    ctx.fillStyle = WHITE(fillA);
    ctx.fill();
    // Stroke
    const strokeA = 0.18 + hf * 0.14 + af * 0.06;
    ctx.strokeStyle = af > 0.1 ? `rgba(${Math.round(lerp(255, 0, af * 0.5))},${Math.round(lerp(255, 168, af * 0.5))},${Math.round(lerp(255, 124, af * 0.5))},${strokeA})` : WHITE(strokeA);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    /* ── Inner dot / caret ───────────────────────────── */
    ctx.save();
    // Room3 jitter
    let jx = 0, jy = 0;
    if (room === 'room3') {
      jx = (Math.random() - 0.5) * 0.6;
      jy = (Math.random() - 0.5) * 0.6;
    }

    const dotX = dx + jx;
    const dotY = dy + jy;

    if (cf < 0.1) {
      // Circle dot
      const dr = DOT_RADIUS * ps * (1 + hf * 0.08);
      ctx.beginPath();
      ctx.arc(dotX, dotY, dr, 0, Math.PI * 2);
      ctx.fillStyle = WHITE(0.88);
      ctx.fill();
    } else {
      // Morph toward caret
      const caretW = lerp(DOT_RADIUS * 2, 1.8, cf);
      const caretH = lerp(DOT_RADIUS * 2, 18, cf);
      const cornerR = lerp(DOT_RADIUS, 0.8, cf);
      ctx.beginPath();
      ctx.roundRect(dotX - caretW / 2, dotY - caretH / 2, caretW, caretH, cornerR);
      ctx.fillStyle = WHITE(0.88);
      ctx.fill();
    }
    ctx.restore();

    /* ── Click ripples ───────────────────────────────── */
    for (let i = ripples.current.length - 1; i >= 0; i--) {
      const r = ripples.current[i];
      r.age++;
      if (r.age > RIPPLE_DURATION) { ripples.current.splice(i, 1); continue; }
      const progress = r.age / RIPPLE_DURATION;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const radius = RING_RADIUS + eased * RIPPLE_EXPAND;
      const alpha = (1 - progress) * 0.28;
      const lw = 1.4 * (1 - progress * 0.6);

      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      if (af > 0.1) {
        ctx.strokeStyle = ACCENT(alpha * 0.7);
      } else {
        ctx.strokeStyle = WHITE(alpha);
      }
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    /* ── Drag grip indicator ─────────────────────────── */
    if (isDrag && hf > 0.3) {
      const gripA = hf * 0.3;
      const spacing = 4;
      ctx.fillStyle = WHITE(gripA);
      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          if (row === 0 && col === 0) continue;
          ctx.beginPath();
          ctx.arc(rx + col * spacing, ry + row * spacing, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    rafRef.current = requestAnimationFrame(renderLoop);
  }, []);

  /* ── Lifecycle ──────────────────────────────────────── */
  useEffect(() => {
    // Skip on touch devices
    if (!isFinePointer()) return;
    activeRef.current = true;

    // Hide native cursor globally
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    // Event listeners
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // Start render loop
    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [onMouseMove, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter, onMouseOver, renderLoop]);

  // Don't render canvas on touch devices
  if (typeof window !== 'undefined' && !isFinePointer()) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
