import { useRef, useEffect, useCallback, useState } from 'react';
import { animate, stagger } from 'animejs';
import Bike from '../../imports/Bike';

/* ═══════════════════════════════════════════════════════════════════════
   BIKE PLAYGROUND — Anime.js v4 × 4 Animation Modes
   ─────────────────────────────────────────────────
   350+ SVG paths = 350 individually animatable fragments.

   MODES:
     🌀 PARTICLE SWARM  — paths scatter into ambient particle field,
                           float on sine/cosine orbits, converge back
     🌊 STAGGER WAVE    — domino ripple cascades through all paths
     🎨 COLOR CASCADE   — chromatic hue wave sweeps through the bike
     🏭 FACTORY LINE    — parts fly in from off-screen and snap into place
   ═══════════════════════════════════════════════════════════════════════ */

type Mode = 'idle' | 'swarm' | 'wave' | 'color' | 'assembly';

export default function BikePlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animsRef = useRef<any[]>([]);
  const fillsRef = useRef<string[]>([]);
  const [mode, setMode] = useState<Mode>('idle');
  const [subState, setSubState] = useState('');

  // ─── SETUP: overflow visible, index paths, store fills ─────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.style.overflow = 'visible';
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
    const paths = containerRef.current.querySelectorAll<SVGPathElement>('path');
    const fills: string[] = [];
    paths.forEach((p, i) => {
      p.setAttribute('data-i', String(i));
      fills.push(p.getAttribute('fill') || '#333');
    });
    fillsRef.current = fills;

    // Start idle breathing
    startIdle();
    return () => killAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────
  const getPaths = useCallback(() => {
    return containerRef.current?.querySelectorAll<SVGPathElement>('path') || [];
  }, []);

  const killAll = useCallback(() => {
    animsRef.current.forEach(a => { try { a.pause(); } catch {} });
    animsRef.current = [];
  }, []);

  const resetTransforms = useCallback(() => {
    const paths = getPaths();
    paths.forEach((p, i) => {
      p.style.transform = '';
      p.style.opacity = '';
      p.setAttribute('fill', fillsRef.current[i] || '#333');
    });
  }, [getPaths]);

  // ─── IDLE: gentle breathing pulse ──────────────────────────────────
  const startIdle = useCallback(() => {
    killAll();
    resetTransforms();
    const paths = getPaths();
    if (!paths.length) return;

    const a = animate(paths, {
      opacity: [1, 0.88, 1],
      duration: 3500,
      delay: stagger(6, { from: 'center' }),
      loop: true,
      alternate: true,
      ease: 'inOutSine',
    });
    animsRef.current.push(a);
    setMode('idle');
    setSubState('breathing');
  }, [killAll, resetTransforms, getPaths]);

  /* ═══════════════════════════════════════════════════════════════════
     MODE 1: PARTICLE SWARM — scatter → float → converge
     ═══════════════════════════════════════════════════════════════════ */
  const startSwarm = useCallback(() => {
    killAll();
    resetTransforms();
    setMode('swarm');
    setSubState('scattering');

    const paths = getPaths();
    const count = paths.length;

    // Phase 1: Scatter explosion
    const scatter = animate(paths, {
      translateX: (_el: any, i: number) => Math.sin(i * 0.47) * 320 + (Math.random() - 0.5) * 180,
      translateY: (_el: any, i: number) => Math.cos(i * 0.61) * 280 + (Math.random() - 0.5) * 160,
      rotate: (_el: any, i: number) => Math.sin(i * 0.23) * 120,
      scale: [1, () => 0.15 + Math.random() * 0.45],
      opacity: [1, () => 0.25 + Math.random() * 0.55],
      duration: 2200,
      delay: stagger(5, { from: 'center' }),
      ease: 'outExpo',
      onComplete: () => {
        setSubState('floating');
        // Phase 2: Continuous orbit float
        const float = animate(paths, {
          translateX: (_el: any, i: number) => {
            const base = Math.sin(i * 0.47) * 320 + (Math.random() - 0.5) * 180;
            return [base - 15, base + 15];
          },
          translateY: (_el: any, i: number) => {
            const base = Math.cos(i * 0.61) * 280 + (Math.random() - 0.5) * 160;
            return [base - 12, base + 12];
          },
          duration: () => 2500 + Math.random() * 2000,
          loop: true,
          alternate: true,
          ease: 'inOutSine',
          delay: stagger(3),
        });
        animsRef.current.push(float);
      },
    });
    animsRef.current.push(scatter);
  }, [killAll, resetTransforms, getPaths]);

  const convergeSwarm = useCallback(() => {
    killAll();
    setSubState('converging');

    const paths = getPaths();
    const converge = animate(paths, {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      duration: 1800,
      delay: stagger(4, { from: 'center' }),
      ease: 'outElastic(1, .7)',
      onComplete: () => startIdle(),
    });
    animsRef.current.push(converge);
  }, [killAll, getPaths, startIdle]);

  /* ═══════════════════════════════════════════════════════════════════
     MODE 2: STAGGER WAVE — domino ripple cascade
     ═══════════════════════════════════════════════════════════════════ */
  const startWave = useCallback(() => {
    killAll();
    resetTransforms();
    setMode('wave');
    setSubState('rippling');

    const paths = getPaths();

    // Vertical ripple wave
    const wave = animate(paths, {
      translateY: [0, -10, 0],
      scale: [1, 1.08, 1],
      opacity: [1, 0.7, 1],
      duration: 900,
      delay: stagger(12, { from: 'first' }),
      loop: true,
      ease: 'inOutSine',
    });
    animsRef.current.push(wave);

    // Secondary horizontal shimmer (offset timing)
    const shimmer = animate(paths, {
      translateX: [0, 3, -3, 0],
      duration: 1200,
      delay: stagger(12, { from: 'last' }),
      loop: true,
      ease: 'inOutQuad',
    });
    animsRef.current.push(shimmer);
  }, [killAll, resetTransforms, getPaths]);

  /* ═══════════════════════════════════════════════════════════════════
     MODE 3: COLOR CASCADE — chromatic hue wave
     ═══════════════════════════════════════════════════════════════════ */
  const startColor = useCallback(() => {
    killAll();
    resetTransforms();
    setMode('color');
    setSubState('cascading');

    const paths = getPaths();
    const fills = fillsRef.current;

    // Accent palette: mint → cyan → orange → back to original
    const accents = ['#40F0AA', '#00EAFF', '#FF8563', '#F59E0B'];

    paths.forEach((p, i) => {
      const accent = accents[i % accents.length];
      const a = animate(p, {
        fill: [fills[i], accent, fills[i]],
        duration: 2000,
        delay: i * 10 + Math.sin(i * 0.3) * 200,
        loop: true,
        ease: 'inOutSine',
      });
      animsRef.current.push(a);
    });

    // Subtle scale pulse synchronized with color
    const pulse = animate(paths, {
      scale: [1, 1.02, 1],
      duration: 2000,
      delay: stagger(10),
      loop: true,
      ease: 'inOutSine',
    });
    animsRef.current.push(pulse);
  }, [killAll, resetTransforms, getPaths]);

  /* ═══════════════════════════════════════════════════════════════════
     MODE 4: FACTORY ASSEMBLY — mechanical build sequence
     ═══════════════════════════════════════════════════════════════════ */
  const startAssembly = useCallback(() => {
    killAll();
    resetTransforms();
    setMode('assembly');
    setSubState('disassembling');

    const paths = getPaths();
    const count = paths.length;

    // Pre-compute scatter offsets per-path (deterministic per index)
    const offsets = Array.from(paths).map((_, i) => {
      const quarter = Math.floor((i / count) * 4);
      const baseX = quarter === 0 ? -550 : quarter === 1 ? 500 : quarter === 2 ? -400 : 480;
      const baseY = quarter === 0 ? 350 : quarter === 1 ? -400 : quarter === 2 ? -300 : 320;
      const seed = Math.sin(i * 7.31) * 0.5 + 0.5; // deterministic pseudo-random
      const seed2 = Math.cos(i * 3.17) * 0.5 + 0.5;
      return {
        x: baseX + (seed - 0.5) * 250,
        y: baseY + (seed2 - 0.5) * 250,
        r: (seed - 0.5) * 90,
      };
    });

    // Phase 1: Quick scatter OUT using Anime.js (so it owns the transform)
    const scatter = animate(paths, {
      translateX: (_el: any, i: number) => [0, offsets[i].x],
      translateY: (_el: any, i: number) => [0, offsets[i].y],
      rotate: (_el: any, i: number) => [0, offsets[i].r],
      scale: [1, 0.2],
      opacity: [1, 0],
      duration: 800,
      delay: stagger(3, { from: 'center' }),
      ease: 'inQuad',
      onComplete: () => {
        setSubState('assembling');

        // Phase 2: Assemble back — fly in from scattered positions
        const assemble = animate(paths, {
          translateX: (_el: any, i: number) => [offsets[i].x, 0],
          translateY: (_el: any, i: number) => [offsets[i].y, 0],
          rotate: (_el: any, i: number) => [offsets[i].r, 0],
          scale: [0.2, 1],
          opacity: [0, 1],
          duration: 1200,
          delay: stagger(6, { from: 'first' }),
          ease: 'outExpo',
          onComplete: () => {
            setSubState('complete');
            // Snap flash on completion
            const flash = animate(paths, {
              opacity: [1, 0.4, 1],
              scale: [1, 1.015, 1],
              duration: 600,
              delay: stagger(3, { from: 'center' }),
              ease: 'outQuad',
              onComplete: () => startIdle(),
            });
            animsRef.current.push(flash);
          },
        });
        animsRef.current.push(assemble);
      },
    });
    animsRef.current.push(scatter);
  }, [killAll, resetTransforms, getPaths, startIdle]);

  // ─── RESET ─────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    startIdle();
  }, [startIdle]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '1') startSwarm();
      if (e.key === '2') startWave();
      if (e.key === '3') startColor();
      if (e.key === '4') startAssembly();
      if (e.key === ' ' && mode === 'swarm') { e.preventDefault(); convergeSwarm(); }
      if (e.key === 'Escape') handleReset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [startSwarm, startWave, startColor, startAssembly, convergeSwarm, handleReset, mode]);

  // ─── Status text ──────────────────────────────────────────────────
  const statusText = (() => {
    if (mode === 'idle') return 'IDLE — 350+ FRAGMENTS LOCKED';
    if (mode === 'swarm' && subState === 'scattering') return 'SCATTERING FRAGMENTS...';
    if (mode === 'swarm' && subState === 'floating') return 'PARTICLE FIELD ACTIVE — PRESS SPACE TO CONVERGE';
    if (mode === 'swarm' && subState === 'converging') return 'CONVERGING...';
    if (mode === 'wave') return 'STAGGER WAVE — DOMINO CASCADE ACTIVE';
    if (mode === 'color') return 'COLOR CASCADE — CHROMATIC SWEEP ACTIVE';
    if (mode === 'assembly' && subState === 'disassembling') return 'SCATTERING FOR ASSEMBLY...';
    if (mode === 'assembly' && subState === 'assembling') return 'FACTORY LINE — ASSEMBLING...';
    if (mode === 'assembly' && subState === 'complete') return 'ASSEMBLY COMPLETE';
    return '';
  })();

  const statusColor = mode === 'idle' ? '#40F0AA'
    : mode === 'swarm' ? '#00EAFF'
    : mode === 'wave' ? '#FF8563'
    : mode === 'color' ? '#F59E0B'
    : '#40F0AA';

  return (
    <div className="relative w-full h-screen overflow-hidden select-none" style={{ backgroundColor: '#08080E' }}>
      {/* ── Ambient grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(64,240,170,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64,240,170,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />

      {/* ── Radial glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,234,255,0.035) 0%, transparent 70%)',
      }} />

      {/* ── Title ── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(24px, 3.5vw, 44px)',
          letterSpacing: '0.08em',
          color: '#FFFFFF',
          margin: 0,
        }}>
          BIKE ANIMATION LAB
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.3em',
          color: '#00EAFF',
          textTransform: 'uppercase',
          marginTop: 2,
          opacity: 0.6,
        }}>
          350+ SVG FRAGMENTS &times; 4 ANIMATION MODES
        </p>
      </div>

      {/* ── Bike Container ── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(70vw, 55vh)',
          height: 'min(70vw, 55vh)',
        }}
      >
        <div ref={containerRef} className="w-full h-full">
          <Bike />
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-2.5">
        <ModeButton
          label="PARTICLE SWARM"
          shortcut="1"
          accent="#00EAFF"
          active={mode === 'swarm'}
          onClick={startSwarm}
        />
        {mode === 'swarm' && subState === 'floating' && (
          <ModeButton
            label="CONVERGE"
            shortcut="SPC"
            accent="#40F0AA"
            active={false}
            onClick={convergeSwarm}
            pulse
          />
        )}
        <ModeButton
          label="STAGGER WAVE"
          shortcut="2"
          accent="#FF8563"
          active={mode === 'wave'}
          onClick={startWave}
        />
        <ModeButton
          label="COLOR CASCADE"
          shortcut="3"
          accent="#F59E0B"
          active={mode === 'color'}
          onClick={startColor}
        />
        <ModeButton
          label="FACTORY LINE"
          shortcut="4"
          accent="#40F0AA"
          active={mode === 'assembly'}
          onClick={startAssembly}
        />
        <ModeButton
          label="RESET"
          shortcut="ESC"
          accent="#7A7A90"
          active={false}
          onClick={handleReset}
        />
      </div>

      {/* ── Status bar ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.2em',
        color: statusColor,
        textTransform: 'uppercase',
        opacity: 0.5,
      }}>
        {statusText}
      </div>

      {/* ── Fragment counter ── */}
      <div className="absolute top-6 right-8 z-20 pointer-events-none text-right">
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase',
        }}>
          FRAGMENTS
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          color: 'rgba(255,255,255,0.08)',
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}>
          350+
        </div>
      </div>

      {/* ── Mode indicator pips ── */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col gap-3">
        {(['swarm', 'wave', 'color', 'assembly'] as Mode[]).map(m => (
          <div key={m} className="flex items-center gap-2">
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: mode === m
                ? (m === 'swarm' ? '#00EAFF' : m === 'wave' ? '#FF8563' : m === 'color' ? '#F59E0B' : '#40F0AA')
                : 'rgba(255,255,255,0.08)',
              transition: 'background-color 0.4s ease',
              boxShadow: mode === m ? `0 0 8px ${m === 'swarm' ? '#00EAFF' : m === 'wave' ? '#FF8563' : m === 'color' ? '#F59E0B' : '#40F0AA'}44` : 'none',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              letterSpacing: '0.2em',
              color: mode === m ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
              textTransform: 'uppercase',
              transition: 'color 0.4s ease',
            }}>
              {m === 'swarm' ? 'SWARM' : m === 'wave' ? 'WAVE' : m === 'color' ? 'COLOR' : 'BUILD'}
            </span>
          </div>
        ))}
      </div>

      {/* ── Back link ── */}
      <a
        href="/"
        className="absolute top-6 left-8 z-20 no-underline"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.25)',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
      >
        &larr; BACK
      </a>
    </div>
  );
}

// ─── Mode Button ─────────────────────────────────────────────────────

function ModeButton({
  label, shortcut, accent, active, onClick, pulse,
}: {
  label: string;
  shortcut: string;
  accent: string;
  active: boolean;
  onClick: () => void;
  pulse?: boolean;
}) {
  const rgb = hexToRgb(accent);
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 transition-all duration-300"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.15em',
        color: active ? '#fff' : accent,
        background: active ? `rgba(${rgb}, 0.15)` : `rgba(${rgb}, 0.04)`,
        border: `1px solid ${active ? `rgba(${rgb}, 0.5)` : `rgba(${rgb}, 0.2)`}`,
        borderRadius: 5,
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: active ? `0 0 20px rgba(${rgb}, 0.15), inset 0 0 20px rgba(${rgb}, 0.05)` : 'none',
        animation: pulse ? 'btnPulse 1.5s ease infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(${rgb}, 0.2); }
          50% { box-shadow: 0 0 20px rgba(${rgb}, 0.5); }
        }
      `}</style>
      <span>{label}</span>
      <span style={{
        marginLeft: 6,
        fontSize: 7,
        opacity: 0.35,
        color: 'rgba(255,255,255,0.3)',
      }}>
        [{shortcut}]
      </span>
    </button>
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`;
}