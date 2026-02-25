import { useRef, useEffect, useCallback, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   EYE ATTENTION SYSTEM — Premium Portfolio Mascot
   ─────────────────────────────────────────────────
   Intelligent eye pair that tracks interactive elements.
   
   Behavior:
     • Detects hover on interactive elements → locks gaze on center
     • Falls back to soft cursor following over non-interactive areas
     • Drifts to center after 3s idle
     • Scroll → eyes glance downward
   
   Microinteractions:
     • Random blink every 6–10s
     • Pupil dilation when focused on interactive
     • Subtle green AI glow when locked
     • Micro-saccade (tiny random flick) when idle
   
   Performance:
     • All iris/pupil via translate transforms in rAF
     • Single animation loop, zero re-renders during tracking
     • Respects prefers-reduced-motion
   ═══════════════════════════════════════════════════════════════════════ */

const INTERACTIVE = 'button, a, [role="button"], input, select, textarea, [data-interactive]';

/* ── Spring ────────────────────────────────────────────────────────── */
interface Spr { x: number; y: number; vx: number; vy: number; tx: number; ty: number }
function step(s: Spr, k: number, d: number) {
  s.vx = (s.vx + (s.tx - s.x) * k) * d;
  s.vy = (s.vy + (s.ty - s.y) * k) * d;
  s.x += s.vx; s.y += s.vy;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/* ── Sizing ────────────────────────────────────────────────────────── */
const R       = 10.5;    // eye radius
const GAP     = 7;
const IR      = 5;       // iris radius
const PB      = 2.6;     // pupil base radius
const PD      = 3.5;     // pupil dilated radius
const MT      = 3.8;     // max iris travel px
const K       = 0.055;   // spring stiffness
const D       = 0.78;    // spring damping
const IDLE    = 3000;
const BK_LO   = 6000;
const BK_HI   = 10000;
const BK_DUR  = 150;

export default function EyeAttentionSystem() {
  const rootRef  = useRef<HTMLDivElement>(null);
  const lIris    = useRef<HTMLDivElement>(null);
  const rIris    = useRef<HTMLDivElement>(null);
  const lPup     = useRef<HTMLDivElement>(null);
  const rPup     = useRef<HTMLDivElement>(null);
  const lHi      = useRef<HTMLDivElement>(null);
  const rHi      = useRef<HTMLDivElement>(null);
  const glowEl   = useRef<HTMLDivElement>(null);

  const sL       = useRef<Spr>({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  const sR       = useRef<Spr>({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
  const focused  = useRef(false);
  const lastMove = useRef(Date.now());
  const reduced  = useRef(false);
  const dil      = useRef(0);
  const glow     = useRef(0);
  const raf      = useRef(0);
  const sacc     = useRef({ x: 0, y: 0, t: 0 });

  const [blinking, setBlinking] = useState(false);

  /* ── Gaze offset ─────────────────────────────────────────────────── */
  const gaze = useCallback((px: number, py: number) => {
    const el = rootRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    const dx = px - (b.left + b.width / 2);
    const dy = py - (b.top + b.height / 2);
    const d = Math.hypot(dx, dy);
    if (d < 1) return { x: 0, y: 0 };
    const n = Math.min(d / 280, 1);
    return { x: (dx / d) * n * MT, y: (dy / d) * n * MT };
  }, []);

  /* ── Blink ───────────────────────────────────────────────────────── */
  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>;
    const go = () => {
      tid = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), BK_DUR);
        go();
      }, BK_LO + Math.random() * (BK_HI - BK_LO));
    };
    go();
    return () => clearTimeout(tid);
  }, []);

  /* ── Reduced motion ──────────────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = mq.matches;
    const h = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  /* ── Mouse / scroll ──────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced.current) return;
    const sl = sL.current, sr = sR.current;

    const onMove = (e: MouseEvent) => {
      lastMove.current = Date.now();
      const t = (e.target as HTMLElement).closest(INTERACTIVE);
      if (t) {
        const r = t.getBoundingClientRect();
        const o = gaze(r.left + r.width / 2, r.top + r.height / 2);
        sl.tx = o.x; sl.ty = o.y;
        sr.tx = o.x * 0.88; sr.ty = o.y * 0.93;
        focused.current = true;
      } else {
        const o = gaze(e.clientX, e.clientY);
        sl.tx = o.x * 0.55; sl.ty = o.y * 0.55;
        sr.tx = o.x * 0.48; sr.ty = o.y * 0.50;
        focused.current = false;
      }
    };

    const onScroll = () => {
      lastMove.current = Date.now();
      sl.ty = MT * 0.55; sl.tx *= 0.3;
      sr.ty = MT * 0.50; sr.tx *= 0.3;
      focused.current = false;
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [gaze]);

  /* ── Animation loop ──────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced.current) return;
    const sl = sL.current, sr = sR.current, sc = sacc.current;

    const tick = () => {
      // Idle → center
      if (Date.now() - lastMove.current > IDLE) {
        sl.tx = 0; sl.ty = 0; sr.tx = 0; sr.ty = 0;
        focused.current = false;
      }

      // Micro-saccade
      sc.t++;
      if (sc.t > 240 && !focused.current && Math.random() < 0.008) {
        sc.x = (Math.random() - 0.5) * 1.2;
        sc.y = (Math.random() - 0.5) * 0.8;
        sc.t = 0;
      }
      sc.x *= 0.92; sc.y *= 0.92;

      // Springs
      step(sl, K, D); step(sr, K, D);

      const lx = clamp(sl.x + sc.x, -MT, MT);
      const ly = clamp(sl.y + sc.y, -MT, MT);
      const rx = clamp(sr.x + sc.x * 0.8, -MT, MT);
      const ry = clamp(sr.y + sc.y * 0.8, -MT, MT);

      // Dilation / glow
      const dt = focused.current ? 1 : 0;
      dil.current = lerp(dil.current, dt, 0.05);
      glow.current = lerp(glow.current, dt, 0.035);
      const ps = lerp(PB, PD, dil.current) * 2;

      // Apply
      if (lIris.current) lIris.current.style.transform = `translate(${lx}px,${ly}px)`;
      if (rIris.current) rIris.current.style.transform = `translate(${rx}px,${ry}px)`;
      if (lPup.current) { lPup.current.style.transform = `translate(${lx}px,${ly}px)`; lPup.current.style.width = lPup.current.style.height = `${ps}px`; }
      if (rPup.current) { rPup.current.style.transform = `translate(${rx}px,${ry}px)`; rPup.current.style.width = rPup.current.style.height = `${ps}px`; }
      if (lHi.current) lHi.current.style.transform = `translate(${-lx * 0.15}px,${-ly * 0.15}px)`;
      if (rHi.current) rHi.current.style.transform = `translate(${-rx * 0.15}px,${-ry * 0.15}px)`;
      if (glowEl.current) glowEl.current.style.opacity = `${glow.current * 0.5}`;

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  /* ── Shared styles ───────────────────────────────────────────────── */
  const scleraStyle: React.CSSProperties = {
    width: R * 2, height: R * 2,
    background: 'radial-gradient(ellipse at 42% 36%, #f7f7f7 0%, #e8e8e8 50%, #d0d0d0 85%, #bbb 100%)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.06)',
  };
  const irisStyle: React.CSSProperties = {
    width: IR * 2, height: IR * 2,
    top: R - IR, left: R - IR,
    background: 'radial-gradient(circle at 42% 38%, #2dd4a0 0%, #00A87C 30%, #007a5a 65%, #005540 100%)',
    boxShadow: 'inset 0 0 3px rgba(0,0,0,0.35), 0 0 1px rgba(0,168,124,0.3)',
    willChange: 'transform',
  };
  const pupilStyle: React.CSSProperties = {
    width: PB * 2, height: PB * 2,
    top: R - PB, left: R - PB,
    background: 'radial-gradient(circle at 38% 38%, #222 0%, #0a0a0a 50%, #000 100%)',
    willChange: 'transform', zIndex: 2,
  };
  const lidTransform = blinking ? 'scaleY(1)' : 'scaleY(0)';
  const lidStyle: React.CSSProperties = {
    background: '#0d0d0d',
    transformOrigin: 'center top',
    transform: lidTransform,
    transition: `transform ${BK_DUR / 2}ms cubic-bezier(0.4,0,0.2,1)`,
    willChange: 'transform', zIndex: 4,
  };
  const lidShadow: React.CSSProperties = {
    height: '38%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, transparent 100%)',
    zIndex: 3,
  };

  return (
    <div
      ref={rootRef}
      className="relative flex items-center select-none"
      style={{ width: R * 4 + GAP, height: R * 2 + 4, padding: '2px 0' }}
      aria-hidden="true"
    >
      {/* AI glow */}
      <div
        ref={glowEl}
        className="absolute pointer-events-none"
        style={{
          inset: -8, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,168,124,0.22) 0%, rgba(0,168,124,0.06) 50%, transparent 75%)',
          filter: 'blur(5px)', opacity: 0, willChange: 'opacity',
        }}
      />

      {/* ── Left eye ──────────────────────────────────────────────── */}
      <div style={{ marginRight: GAP / 2 }}>
        <div className="relative rounded-full overflow-hidden" style={scleraStyle}>
          <div ref={lIris} className="absolute rounded-full" style={irisStyle}>
            <div className="absolute inset-[1px] rounded-full" style={{ border: '0.5px solid rgba(0,0,0,0.1)', background: 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.08) 70%, transparent 85%)' }} />
          </div>
          <div ref={lPup} className="absolute rounded-full" style={pupilStyle} />
          <div ref={lHi} className="absolute rounded-full" style={{ width: 2.5, height: 2.5, top: R - 3.2, left: R - 1, background: 'radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)', willChange: 'transform', zIndex: 3 }} />
          <div className="absolute rounded-full" style={{ width: 1.2, height: 1.2, bottom: R - 2, right: R - 2.5, background: 'rgba(255,255,255,0.25)', zIndex: 3 }} />
          <div className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none" style={lidShadow} />
          <div className="absolute inset-0 rounded-full" style={lidStyle} />
        </div>
      </div>

      {/* ── Right eye ─────────────────────────────────────────────── */}
      <div style={{ marginLeft: GAP / 2 }}>
        <div className="relative rounded-full overflow-hidden" style={scleraStyle}>
          <div ref={rIris} className="absolute rounded-full" style={irisStyle}>
            <div className="absolute inset-[1px] rounded-full" style={{ border: '0.5px solid rgba(0,0,0,0.1)', background: 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.08) 70%, transparent 85%)' }} />
          </div>
          <div ref={rPup} className="absolute rounded-full" style={pupilStyle} />
          <div ref={rHi} className="absolute rounded-full" style={{ width: 2.5, height: 2.5, top: R - 3.2, left: R - 0.5, background: 'radial-gradient(circle, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)', willChange: 'transform', zIndex: 3 }} />
          <div className="absolute rounded-full" style={{ width: 1.2, height: 1.2, bottom: R - 2, right: R - 2, background: 'rgba(255,255,255,0.25)', zIndex: 3 }} />
          <div className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none" style={lidShadow} />
          <div className="absolute inset-0 rounded-full" style={lidStyle} />
        </div>
      </div>
    </div>
  );
}
