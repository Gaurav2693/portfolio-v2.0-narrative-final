import { useEffect, useRef, useState, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import svgPaths from '../../imports/svg-edbg8runsy';
import { ReactorSoundEngine } from '../components/reactor-sound';

/* ═══════════════════════════════════════════════════════════════════════
   LOADING ANIMATION — Isolated Test Bench
   ─────────────────────────────────────────
   All 5 icon shapes + loading bar on one page.
   Top section: static renders of all 5 shapes for visual verification.
   Bottom section: full animated sequence with debug controls.
   Slow timings so every frame is clearly visible.
   ═══════════════════════════════════════════════════════════════════════ */

const BG = '#08080E';
const MINT = '#40F0AA';
const CYAN = '#00EAFF';
const MUTED = '#7A7A90';

interface PathDef { d: string; fill: string }
interface ShapeGroup { label: string; viewBox: string; paths: PathDef[] }

const SHAPES: ShapeGroup[] = [
  {
    label: 'Compass',
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
    label: 'Concentric',
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
    label: 'Split Circle',
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
    label: 'Brand Logo',
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
    label: 'Dial',
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

/* ── Single bar geometry ─────────────────────────────────────────────── */
const BAR_W = 400;
const BAR_H = 6;
const BAR_R = 3;

/* ── Reusable single loading bar SVG ─────────────────────────────────── */
function LoadingBarSvg({
  barRef,
  gradientId,
  width,
}: {
  barRef: React.Ref<SVGRectElement>;
  gradientId: string;
  width?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${BAR_W} ${BAR_H}`}
      fill="none"
      style={{ width: width || '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0" y1="0"
          x2={String(BAR_W)} y2="0"
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
        ref={barRef}
        x={0} y={0}
        width={0}
        height={BAR_H}
        rx={BAR_R} ry={BAR_R}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function LoadingAnimation() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#FAF9F7', padding: '40px 24px' }}>
      <style>{`
        @keyframes bootStatusFade {
          0%   { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3, color: MINT, marginBottom: 8 }}>
          Loading Animation Test Bench
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 48 }}>
          All 5 SVG icon groups + loading bar. Static renders above, animated sequence below.
        </p>

        {/* ── SECTION 1: Static Shape Gallery ─────────────────────────── */}
        <SectionLabel>1. Static Shape Gallery — verify all paths render</SectionLabel>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 64 }}>
          {SHAPES.map((shape, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 140, height: 140,
                background: '#111118',
                borderRadius: 12,
                border: '1px solid #1E2665',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
                marginBottom: 8,
              }}>
                <svg viewBox={shape.viewBox} fill="none" style={{ width: '100%', height: '100%' }}>
                  {shape.paths.map((p, pi) => (
                    <path key={pi} d={p.d} fill={p.fill} />
                  ))}
                </svg>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: MUTED, letterSpacing: 1 }}>
                {shape.label} ({shape.paths.length} paths)
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 2: Single Shape Animator ────────────────────────── */}
        <SectionLabel>2. Single Shape Animator — test enter/exit on individual shapes</SectionLabel>
        <SingleShapeTest />

        {/* ── SECTION 3: Loading Bar Test ─────────────────────────────── */}
        <SectionLabel>3. Loading Bar — single pill bar</SectionLabel>
        <LoadingBarTest />

        {/* ── SECTION 4: Full Sequence ────────────────────────────────── */}
        <SectionLabel>4. Full Sequence Preview — 10s boot animation</SectionLabel>
        <FullSequencePreview />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
      letterSpacing: 2,
      color: CYAN,
      textTransform: 'uppercase',
      marginBottom: 20,
      paddingBottom: 8,
      borderBottom: `1px solid ${CYAN}22`,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SINGLE SHAPE ANIMATOR
   ══════════════════════════��════════════════════════════════════════════ */
function SingleShapeTest() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [log, setLog] = useState<string[]>(['Ready — select a shape and click Enter or Exit']);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<any>(null);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const shape = SHAPES[selectedIdx];

  const resetPaths = useCallback(() => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('path');
    paths.forEach(p => { p.style.opacity = '1'; p.style.transform = ''; });
    addLog(`Reset ${paths.length} paths to visible`);
  }, [addLog]);

  const hidePaths = useCallback(() => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('path');
    paths.forEach(p => { p.style.opacity = '0'; p.style.transform = 'scale(0.3)'; });
    addLog(`Hid ${paths.length} paths`);
  }, [addLog]);

  const enterAnim = useCallback(() => {
    if (!svgRef.current) return;
    if (animRef.current) { try { animRef.current.pause(); } catch {} }
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('path');
    paths.forEach(p => { p.style.opacity = '0'; p.style.transform = 'scale(0.3)'; });
    addLog(`Entering "${SHAPES[selectedIdx].label}" — ${paths.length} paths, 1200ms, stagger 120ms`);
    animRef.current = animate(paths, {
      opacity: [0, 1], scale: [0.3, 1],
      duration: 1200, delay: stagger(120, { from: 'center' }),
      ease: 'outCubic', onComplete: () => addLog('Enter complete'),
    });
  }, [selectedIdx, addLog]);

  const exitAnim = useCallback(() => {
    if (!svgRef.current) return;
    if (animRef.current) { try { animRef.current.pause(); } catch {} }
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('path');
    addLog(`Exiting "${SHAPES[selectedIdx].label}" — ${paths.length} paths, 900ms, stagger 80ms`);
    animRef.current = animate(paths, {
      opacity: [1, 0], scale: [1, 0.5],
      duration: 900, delay: stagger(80, { from: 'center' }),
      ease: 'inCubic', onComplete: () => addLog('Exit complete'),
    });
  }, [selectedIdx, addLog]);

  useEffect(() => {
    const t = requestAnimationFrame(() => resetPaths());
    return () => cancelAnimationFrame(t);
  }, [selectedIdx, resetPaths]);

  return (
    <div style={{ display: 'flex', gap: 32, marginBottom: 64, flexWrap: 'wrap' }}>
      <div style={{
        width: 260, height: 260, background: '#111118', borderRadius: 16,
        border: '1px solid #1E2665', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 32, position: 'relative', overflow: 'visible',
      }}>
        <svg ref={svgRef} viewBox={shape.viewBox} fill="none"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {shape.paths.map((p, pi) => (
            <path key={`${selectedIdx}-${pi}`} d={p.d} fill={p.fill}
              style={{ transformOrigin: 'center center', transformBox: 'fill-box' as any }} />
          ))}
        </svg>
        <div style={{
          position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: MUTED, letterSpacing: 1,
        }}>
          {shape.label} — {shape.paths.length} paths
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {SHAPES.map((s, i) => (
            <button key={i} onClick={() => setSelectedIdx(i)} style={{
              padding: '6px 14px',
              background: i === selectedIdx ? MINT : '#1A1A28',
              color: i === selectedIdx ? BG : '#AAA',
              border: `1px solid ${i === selectedIdx ? MINT : '#333'}`,
              borderRadius: 6, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1,
            }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <ActionButton color={MINT} onClick={enterAnim}>Enter (1.2s)</ActionButton>
          <ActionButton color="#FF6B6B" onClick={exitAnim}>Exit (0.9s)</ActionButton>
          <ActionButton color="#888" onClick={resetPaths}>Reset</ActionButton>
          <ActionButton color="#555" onClick={hidePaths}>Hide</ActionButton>
        </div>

        <div style={{
          background: '#0A0A12', border: '1px solid #1E2665', borderRadius: 8,
          padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: '#7A7A90', lineHeight: 1.8, maxHeight: 180, overflow: 'auto',
        }}>
          {log.map((line, i) => (
            <div key={i} style={{ color: line.includes('complete') ? MINT : line.includes('Error') ? '#FF6B6B' : '#7A7A90' }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LOADING BAR TEST
   ═══════════════════════════════════════════════════════════════════════ */
function LoadingBarTest() {
  const barRectRef = useRef<SVGRectElement>(null);
  const animRef = useRef<any>(null);
  const [pct, setPct] = useState(0);

  const runBar = useCallback(() => {
    if (animRef.current) { try { animRef.current.pause(); } catch {} }
    const rect = barRectRef.current;
    if (!rect) return;
    rect.setAttribute('width', '0');
    setPct(0);

    animRef.current = animate(rect, {
      width: [0, BAR_W],
      duration: 5000,
      ease: 'inOutQuad',
      onUpdate: () => {
        const w = parseFloat(rect.getAttribute('width') || '0');
        setPct(Math.round((w / BAR_W) * 100));
      },
    });
  }, []);

  const resetBar = useCallback(() => {
    if (animRef.current) { try { animRef.current.pause(); } catch {} }
    if (barRectRef.current) barRectRef.current.setAttribute('width', '0');
    setPct(0);
  }, []);

  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <ActionButton color={MINT} onClick={runBar}>Fill (5s)</ActionButton>
        <ActionButton color="#888" onClick={resetBar}>Reset</ActionButton>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
          color: MINT, marginLeft: 16, alignSelf: 'center',
        }}>
          {pct}%
        </span>
      </div>

      <div style={{ width: 500, maxWidth: '90vw', position: 'relative' }}>
        <LoadingBarSvg barRef={barRectRef} gradientId="testBarGrad" />
        <div style={{
          position: 'absolute', bottom: -4, left: 0, right: 0, height: 10,
          background: `linear-gradient(90deg, ${MINT}22, ${CYAN}22)`,
          filter: 'blur(10px)', borderRadius: 20, pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FULL SEQUENCE PREVIEW
   ═══════════════════════════════════════════════════════════════════════ */
function FullSequencePreview() {
  const [running, setRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [statusIdx, setStatusIdx] = useState(0);
  const [debugMsg, setDebugMsg] = useState('Click "Play" to start the full 10s sequence');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const shapeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const barRectRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const animsRef = useRef<any[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stoppedRef = useRef(false);
  const soundRef = useRef<ReactorSoundEngine | null>(null);

  const killAll = useCallback(() => {
    stoppedRef.current = true;
    animsRef.current.forEach(a => { try { a.pause(); } catch {} });
    animsRef.current = [];
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  const play = useCallback(() => {
    killAll();
    stoppedRef.current = false;
    setRunning(true);
    setActiveIdx(0);
    setStatusIdx(0);
    setDebugMsg('Starting sequence...');

    // Start reactor sound
    if (soundEnabled) {
      soundRef.current = new ReactorSoundEngine();
      soundRef.current.start(10);
    }

    if (barRectRef.current) barRectRef.current.setAttribute('width', '0');

    shapeRefs.current.forEach(svg => {
      if (!svg) return;
      svg.querySelectorAll<SVGPathElement>('path').forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'scale(0.3)';
      });
    });

    /* ── Bar fill — 9.2s ─────────────────────────────────────────── */
    if (barRectRef.current) {
      const a = animate(barRectRef.current, {
        width: [0, BAR_W], duration: 9200, ease: 'inOutQuad',
      });
      animsRef.current.push(a);
    }

    /* ── Shape sequence timings (10s total) ───────────────────────── */
    const ENTER_DUR = 800;
    const HOLD_DUR = 800;
    const EXIT_DUR = 600;
    const ENTER_STAGGER = 100;
    const EXIT_STAGGER = 70;
    const OVERLAP = 300;

    function enterShape(idx: number) {
      if (stoppedRef.current) return;
      setActiveIdx(idx);
      setStatusIdx(idx);
      setDebugMsg(`Entering shape ${idx + 1}/5: ${SHAPES[idx].label}`);

      addTimeout(() => {
        if (stoppedRef.current) return;
        const svg = shapeRefs.current[idx];
        if (!svg) { setDebugMsg(`ERROR: No SVG ref for shape ${idx}`); return; }

        const paths = svg.querySelectorAll<SVGPathElement>('path');
        if (!paths.length) { setDebugMsg(`ERROR: No paths in shape ${idx}`); return; }

        paths.forEach(p => { p.style.opacity = '0'; p.style.transform = 'scale(0.3)'; });
        setDebugMsg(`Animating ${paths.length} paths for "${SHAPES[idx].label}" — ${ENTER_DUR}ms`);

        // Servo hit sound on each shape enter
        if (soundRef.current) soundRef.current.playServoHit(idx);

        const a = animate(paths, {
          opacity: [0, 1], scale: [0.3, 1],
          duration: ENTER_DUR, delay: stagger(ENTER_STAGGER, { from: 'center' }),
          ease: 'outCubic',
          onComplete: () => {
            if (!stoppedRef.current) setDebugMsg(`"${SHAPES[idx].label}" visible — holding ${HOLD_DUR}ms`);
          },
        });
        animsRef.current.push(a);

        if (glowRef.current) {
          const g = animate(glowRef.current, {
            opacity: [0, 0.7, 0], scale: [0.8, 1.3],
            duration: ENTER_DUR + 200, ease: 'outQuad',
          });
          animsRef.current.push(g);
        }

        addTimeout(() => exitShape(idx), ENTER_DUR + HOLD_DUR);
      }, 50);
    }

    function exitShape(idx: number) {
      if (stoppedRef.current) return;
      const svg = shapeRefs.current[idx];
      if (!svg) return;
      const paths = svg.querySelectorAll<SVGPathElement>('path');
      if (!paths.length) return;

      setDebugMsg(`Exiting "${SHAPES[idx].label}" — ${EXIT_DUR}ms`);
      const a = animate(paths, {
        opacity: [1, 0], scale: [1, 0.5],
        duration: EXIT_DUR, delay: stagger(EXIT_STAGGER, { from: 'center' }),
        ease: 'inCubic',
      });
      animsRef.current.push(a);

      const nextIdx = idx + 1;
      if (nextIdx < SHAPES.length) {
        addTimeout(() => enterShape(nextIdx), EXIT_DUR - OVERLAP);
      } else {
        addTimeout(() => {
          setDebugMsg('Sequence complete!');
          setRunning(false);
          // Sound engine will self-complete, but clean up ref
          if (soundRef.current) { soundRef.current.stop(); soundRef.current = null; }
        }, EXIT_DUR + 200);
      }
    }

    addTimeout(() => enterShape(0), 500);
  }, [killAll, addTimeout, soundEnabled]);

  const stop = useCallback(() => {
    killAll();
    setRunning(false);
    setActiveIdx(-1);
    setDebugMsg('Stopped');
  }, [killAll]);

  useEffect(() => () => killAll(), [killAll]);

  return (
    <div style={{ marginBottom: 80 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <ActionButton color={MINT} onClick={play} disabled={running}>
          {running ? 'Playing...' : 'Play Sequence'}
        </ActionButton>
        <ActionButton color="#FF6B6B" onClick={stop} disabled={!running}>Stop</ActionButton>
        <ActionButton
          color={soundEnabled ? CYAN : '#555'}
          onClick={() => setSoundEnabled(s => !s)}
          disabled={running}
        >
          {soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
        </ActionButton>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: MUTED, marginLeft: 16,
        }}>
          {debugMsg}
        </span>
      </div>

      {/* Preview viewport */}
      <div style={{
        width: '100%', maxWidth: 600, aspectRatio: '16 / 9',
        background: BG, borderRadius: 16, border: `1px solid ${CYAN}33`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(64,240,170,0.015) 2px,rgba(64,240,170,0.015) 4px)`,
          pointerEvents: 'none',
        }} />

        {/* Glow */}
        <div ref={glowRef} style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: `radial-gradient(circle, ${MINT}22 0%, ${CYAN}11 40%, transparent 70%)`,
          opacity: 0, pointerEvents: 'none',
          top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />

        {/* All 5 shapes */}
        <div style={{ width: 120, height: 120, position: 'relative', marginBottom: 20 }}>
          {SHAPES.map((shape, si) => (
            <svg
              key={si}
              ref={el => { shapeRefs.current[si] = el; }}
              viewBox={shape.viewBox}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                overflow: 'visible',
                visibility: si === activeIdx ? 'visible' : 'hidden',
              }}
            >
              {shape.paths.map((p, pi) => (
                <path key={pi} d={p.d} fill={p.fill}
                  style={{ opacity: 0, transformOrigin: 'center center', transformBox: 'fill-box' as any }} />
              ))}
            </svg>
          ))}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2,
          color: '#FFFFFF', textTransform: 'uppercase', marginBottom: 4,
        }}>
          Portfolio Systems Loading...
        </div>

        {/* Status */}
        <div key={statusIdx} style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: 2,
          color: MUTED, textTransform: 'uppercase', marginBottom: 20,
          animation: 'bootStatusFade 0.4s ease-out forwards',
        }}>
          {STATUS_MESSAGES[statusIdx]}
        </div>

        {/* Single loading bar */}
        <div style={{ width: '70%', position: 'relative' }}>
          <LoadingBarSvg barRef={barRectRef} gradientId="seqBarGrad" />
          <div style={{
            position: 'absolute', bottom: -4, left: 0, right: 0, height: 10,
            background: `linear-gradient(90deg, ${MINT}22, ${CYAN}22)`,
            filter: 'blur(10px)', borderRadius: 20, pointerEvents: 'none',
          }} />
        </div>

        {/* Shape indicator */}
        <div style={{
          position: 'absolute', top: 12, right: 16,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: CYAN, letterSpacing: 1,
        }}>
          {activeIdx >= 0 ? `Shape ${activeIdx + 1}/5` : 'Idle'}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function ActionButton({ color, onClick, disabled, children }: {
  color: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '7px 16px',
      background: disabled ? '#1A1A28' : `${color}18`,
      color: disabled ? '#555' : color,
      border: `1px solid ${disabled ? '#333' : color}44`,
      borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1,
      transition: 'all 0.15s ease',
    }}>
      {children}
    </button>
  );
}