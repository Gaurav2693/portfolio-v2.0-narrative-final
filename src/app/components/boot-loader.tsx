import { useEffect, useRef, useCallback, useState } from 'react';
import { animate, stagger } from 'animejs';
import svgPaths from '../../imports/svg-edbg8runsy';
import { getAmbientSoundscape } from './ambient-soundscape';
import { ReactorSoundEngine } from './reactor-sound';

/* ═══════════════════════════════════════════════════════════════════════
   BOOT LOADER — SVG Morph Sequence  (v5 — Loading-Animation design)
   ──────────────────────────────────────────────────────────────────────
   Matches the finalised Loading-Animation test bench:
   • Clean minimal pill bar (no ornate Figma bar)
   • 800ms enter, 800ms hold, 600ms exit, 100/70 stagger, 300ms overlap
   • No percentage counter
   • Reactor sound engine + servo hits per shape
   • 10 second total duration.  Click to skip.
   ═══════════════════════════════════════════════════════════════════════ */

const TOTAL_DURATION = 10000;
const BG = '#08080E';
const MINT = '#40F0AA';
const CYAN = '#00EAFF';

/* ── Bar geometry (simple pill) ──────────────────────────────────────── */
const BAR_W = 400;
const BAR_H = 6;
const BAR_R = 3;
const BAR_DURATION = 9200; // bar fills over 9.2s

/* ── Shape data ──────────────────────────────────────────────────────── */
interface PathDef { d: string; fill: string }
interface ShapeGroup { viewBox: string; paths: PathDef[] }

const SHAPES: ShapeGroup[] = [
  {
    viewBox: '0 0 168.016 167.995',
    paths: [
      { d: svgPaths.p360eb900, fill: '#FAF9F7' },
      { d: svgPaths.p1086c500, fill: '#1E2665' },
      { d: svgPaths.p219b2000, fill: CYAN },
      { d: svgPaths.p31324c80, fill: '#4CCFE1' },
      { d: svgPaths.p6ddff80, fill: '#3964A2' },
      { d: svgPaths.p29b06e00, fill: '#F4A95B' },
      { d: svgPaths.p1facf2b0, fill: '#F4A95B' },
      { d: svgPaths.pfc62700, fill: '#E93278' },
    ],
  },
  {
    viewBox: '0 0 151.498 159.406',
    paths: [
      { d: svgPaths.p2bcc4f00, fill: '#1E2665' },
      { d: svgPaths.p38b39080, fill: '#1E2665' },
      { d: svgPaths.p5121180, fill: '#5154BF' },
      { d: svgPaths.p3e26a100, fill: CYAN },
      { d: svgPaths.p1717e580, fill: '#39418D' },
      { d: svgPaths.p2eeefd80, fill: '#1E2665' },
      { d: svgPaths.pd80cc30, fill: '#5154BF' },
    ],
  },
  {
    viewBox: '0 0 158.686 159.034',
    paths: [
      { d: svgPaths.p3a762300, fill: CYAN },
      { d: svgPaths.p12cf580, fill: '#F4A95B' },
      { d: svgPaths.p16d56c00, fill: '#FAF9F7' },
      { d: svgPaths.p6da9080, fill: '#1E2665' },
      { d: svgPaths.p19e21c00, fill: '#1E2665' },
      { d: svgPaths.p18f1bc80, fill: '#1E2665' },
      { d: svgPaths.p1f377580, fill: '#1E2665' },
    ],
  },
  {
    viewBox: '0 0 189.078 181.619',
    paths: [
      { d: svgPaths.p3ff16600, fill: '#FAF9F7' },
      { d: svgPaths.p2948e700, fill: MINT },
      { d: svgPaths.p12491e00, fill: MINT },
      { d: svgPaths.pa532740, fill: '#FAF9F7' },
      { d: svgPaths.p1a7e6900, fill: CYAN },
    ],
  },
  {
    viewBox: '0 0 157.061 158.417',
    paths: [
      { d: svgPaths.p28266f00, fill: MINT },
      { d: svgPaths.p16b5c600, fill: '#F4A95B' },
      { d: svgPaths.p2da1e800, fill: '#F4A95B' },
      { d: svgPaths.p2509f390, fill: '#FED24D' },
      { d: svgPaths.pdeefa80, fill: '#FAF9F7' },
      { d: svgPaths.p2f8c6a00, fill: '#FAF9F7' },
      { d: svgPaths.p2a505340, fill: '#FAF9F7' },
    ],
  },
];

const STATUS_MESSAGES = [
  'Initializing design systems',
  'Loading room assemblies',
  'Compiling interaction layers',
  'Calibrating scroll physics',
  'Systems ready',
];

/* ── Animation timings (matching Loading-Animation test bench) ─────── */
const ENTER_DUR = 800;
const HOLD_DUR = 800;
const EXIT_DUR = 600;
const ENTER_STAGGER = 100;
const EXIT_STAGGER = 70;
const OVERLAP = 300;

/* ═══════════════════════════════════════════════════════════════════════ */

export default function BootLoader({ onComplete }: { onComplete: () => void }) {
  const [activeShape, setActiveShape] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [dissolving, setDissolving] = useState(false);

  const shapeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const barRectRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const animsRef = useRef<any[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reactorRef = useRef<ReactorSoundEngine | null>(null);

  const skip = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    animsRef.current.forEach(a => { try { a.pause(); } catch {} });
    timeoutsRef.current.forEach(clearTimeout);
    if (reactorRef.current) { reactorRef.current.stop(); reactorRef.current = null; }
    onComplete();
  }, [onComplete]);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  /* ── Main animation sequence ─────────────────────────────────────── */
  useEffect(() => {
    if (completedRef.current) return;

    // Start ambient soundscape (persists beyond boot into hero/rooms)
    const ambient = getAmbientSoundscape();
    if (!ambient.isRunning) ambient.start();

    // Start reactor sound engine (10s duration)
    const reactorSound = new ReactorSoundEngine();
    reactorSound.start(10);
    reactorRef.current = reactorSound;

    /* ── Progress bar fill ─────────────────────────────────────────── */
    if (barRectRef.current) {
      const a = animate(barRectRef.current, {
        width: [0, BAR_W],
        duration: BAR_DURATION,
        ease: 'inOutQuad',
      });
      animsRef.current.push(a);
    }

    // Reset all shape paths to hidden
    shapeRefs.current.forEach(svg => {
      if (!svg) return;
      svg.querySelectorAll<SVGPathElement>('path').forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'scale(0.3)';
      });
    });

    /* ── Shape cycling (matching Loading-Animation timings) ─────── */
    function enterShape(idx: number) {
      if (completedRef.current) return;

      setActiveShape(idx);
      setStatusIdx(idx);

      addTimeout(() => {
        if (completedRef.current) return;
        const svg = shapeRefs.current[idx];
        if (!svg) return;

        const paths = svg.querySelectorAll<SVGPathElement>('path');
        if (!paths.length) return;

        // Reset paths
        paths.forEach(p => {
          p.style.opacity = '0';
          p.style.transform = 'scale(0.3)';
        });

        // Servo hit sound on each shape transition
        if (reactorRef.current) reactorRef.current.playServoHit(idx);

        const a = animate(paths, {
          opacity: [0, 1],
          scale: [0.3, 1],
          duration: ENTER_DUR,
          delay: stagger(ENTER_STAGGER, { from: 'center' }),
          ease: 'outCubic',
        });
        animsRef.current.push(a);

        // Glow pulse
        if (glowRef.current) {
          const g = animate(glowRef.current, {
            opacity: [0, 0.7, 0],
            scale: [0.8, 1.3],
            duration: ENTER_DUR + 200,
            ease: 'outQuad',
          });
          animsRef.current.push(g);
        }

        // Schedule exit
        addTimeout(() => exitShape(idx), ENTER_DUR + HOLD_DUR);
      }, 50);
    }

    function exitShape(idx: number) {
      if (completedRef.current) return;
      const svg = shapeRefs.current[idx];
      if (!svg) return;

      const paths = svg.querySelectorAll<SVGPathElement>('path');
      if (!paths.length) return;

      const a = animate(paths, {
        opacity: [1, 0],
        scale: [1, 0.5],
        duration: EXIT_DUR,
        delay: stagger(EXIT_STAGGER, { from: 'center' }),
        ease: 'inCubic',
      });
      animsRef.current.push(a);

      const nextIdx = idx + 1;
      if (nextIdx < SHAPES.length) {
        // Overlap: start next before current fully exits
        addTimeout(() => enterShape(nextIdx), EXIT_DUR - OVERLAP);
      } else {
        // All shapes done → dissolve out
        addTimeout(() => {
          if (completedRef.current) return;
          setDissolving(true);
          addTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true;
              if (reactorRef.current) { reactorRef.current.stop(); reactorRef.current = null; }
              onComplete();
            }
          }, 650);
        }, EXIT_DUR + 200);
      }
    }

    // Kick off sequence
    addTimeout(() => enterShape(0), 500);

    // Safety net — force complete at 10s no matter what
    addTimeout(() => {
      if (!completedRef.current) {
        setDissolving(true);
        addTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            if (reactorRef.current) { reactorRef.current.stop(); reactorRef.current = null; }
            onComplete();
          }
        }, 650);
      }
    }, TOTAL_DURATION);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      animsRef.current.forEach(a => { try { a.pause(); } catch {} });
      if (reactorRef.current) { reactorRef.current.stop(); reactorRef.current = null; }
    };
  }, [onComplete, addTimeout]);

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: dissolving ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
        overflow: 'hidden',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(64,240,170,0.015) 2px,rgba(64,240,170,0.015) 4px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Glow backdrop */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${MINT}22 0%, ${CYAN}11 40%, transparent 70%)`,
          opacity: 0,
          pointerEvents: 'none',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* ── All 5 Shape SVGs (visibility-toggled) ─────────────────── */}
      <div
        style={{
          width: 150,
          height: 150,
          position: 'relative',
          marginBottom: 28,
        }}
      >
        {SHAPES.map((shape, si) => (
          <svg
            key={si}
            ref={el => { shapeRefs.current[si] = el; }}
            viewBox={shape.viewBox}
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
              visibility: si === activeShape ? 'visible' : 'hidden',
            }}
          >
            {shape.paths.map((p, pi) => (
              <path
                key={pi}
                d={p.d}
                fill={p.fill}
                style={{
                  opacity: 0,
                  transformOrigin: 'center center',
                  transformBox: 'fill-box' as any,
                }}
              />
            ))}
          </svg>
        ))}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          letterSpacing: 2,
          color: '#FFFFFF',
          textTransform: 'uppercase',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        Portfolio Systems Loading...
      </div>

      {/* Sub-status */}
      <div
        key={statusIdx}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: '#7A7A90',
          textTransform: 'uppercase',
          marginBottom: 32,
          animation: 'bootStatusFade 0.4s ease-out forwards',
        }}
      >
        {STATUS_MESSAGES[statusIdx]}
      </div>

      {/* ── Loading Bar (clean minimal pill — matches Loading-Animation) ── */}
      <div style={{ width: 420, maxWidth: '80vw', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${BAR_W} ${BAR_H}`}
          fill="none"
          style={{ width: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="bootBarGrad"
              x1="0"
              y1="0"
              x2={String(BAR_W)}
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={MINT} />
              <stop offset="100%" stopColor={CYAN} />
            </linearGradient>
          </defs>

          {/* Track background */}
          <rect
            x={0} y={0}
            width={BAR_W} height={BAR_H}
            rx={BAR_R} ry={BAR_R}
            fill="#FAF9F7"
            opacity={0.06}
          />

          {/* Animated fill */}
          <rect
            ref={barRectRef}
            x={0} y={0}
            width={0}
            height={BAR_H}
            rx={BAR_R} ry={BAR_R}
            fill="url(#bootBarGrad)"
          />
        </svg>

        {/* Under-glow */}
        <div
          style={{
            position: 'absolute',
            bottom: -4,
            left: 0,
            right: 0,
            height: 10,
            background: `linear-gradient(90deg, ${MINT}22, ${CYAN}22)`,
            filter: 'blur(10px)',
            borderRadius: 20,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Skip hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: 3,
          color: '#7A7A9044',
          textTransform: 'uppercase',
          animation: 'bootStatusFade 2s ease-out forwards',
        }}
      >
        click to skip
      </div>

      <style>{`
        @keyframes bootStatusFade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
