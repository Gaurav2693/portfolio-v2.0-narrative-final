import { useRef, useEffect, useCallback, useState } from 'react';
import { animate, createTimeline, stagger } from 'animejs';
import svgPaths from '../../imports/svg-36gu1e8en1';

/* ═══════════════════════════════════════════════════════════════════════
   ROCKET PLAYGROUND — Anime.js v4 Destruction/Reconstruction Lab
   ─────────────────────────────────────────────────────────────────
   The assembled Figma rocket, restructured into 6 animatable stages:
     1. Nose Cone (tip + cone)
     2. Upper Body (capsule, fairings, rings)
     3. Core Body (main tube, stripes, lower body)
     4–6. Three independent boosters (left, right, center)

   Container is 1728×1117 (matching original Figma frame). CSS transform
   crops/scales to center just the rocket in the viewport.
   ═══════════════════════════════════════════════════════════════════════ */

// ─── Gradient definitions used across multiple stages ────────────────
function SharedDefs() {
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="rk-grad-orange" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FF8563" />
          <stop stopColor="#B34D2D" offset="100%" />
        </linearGradient>
        <linearGradient id="rk-grad-cream" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#F2EFE6" />
          <stop stopColor="#C4BFB0" offset="100%" />
        </linearGradient>
        <linearGradient id="rk-grad-dark" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#6C6D69" />
          <stop stopColor="#2C2A26" offset="100%" />
        </linearGradient>
        <linearGradient id="rk-grad-nose" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0.33" stopColor="#F2EEE8" />
          <stop offset="0.54" stopColor="#ECE7DE" />
          <stop offset="0.88" stopColor="#DCD6C4" />
          <stop offset="1" stopColor="#D6CFBA" />
        </linearGradient>
        <linearGradient id="rk-grad-body" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#E7E4DB" />
          <stop stopColor="#C4BFB0" offset="100%" />
        </linearGradient>
        <linearGradient id="rk-grad-flame" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#FFF584" />
          <stop offset="0.18" stopColor="#FDE673" />
          <stop offset="0.52" stopColor="#FBC047" />
          <stop offset="1" stopColor="#F78402" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── SVG Part: renders a single SVG within an absolutely-positioned div ──
function Part({ inset, viewBox, children }: {
  inset: string;
  viewBox: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute" style={{ inset }}>
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox={viewBox}
      >
        {children}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAGE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function StageNose() {
  return (
    <div data-stage="nose" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      {/* Nose tip cap */}
      <Part inset="15.04% 69.67% 82.92% 29.32%" viewBox="0 0 17.4395 22.8195">
        <path d={svgPaths.p1c8fa670} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p24cb2c80} fill="#7B7A76" />
      </Part>
      {/* Nose cone body */}
      <Part inset="16.57% 68.8% 78.92% 28.46%" viewBox="0 0 47.3109 50.29">
        <path d={svgPaths.p1158e600} fill="url(#rk-grad-cream)" />
      </Part>
      {/* Side detail left */}
      <Part inset="18.15% 70.96% 79.28% 28.46%" viewBox="0 0 10.0362 28.6376">
        <path d={svgPaths.p2c4a1a40} fill="#5B534F" />
      </Part>
      {/* Side detail right */}
      <Part inset="18.15% 68.8% 79.28% 30.62%" viewBox="0 0 10.0363 28.6376">
        <path d={svgPaths.p19e39200} fill="#2D2926" />
      </Part>
    </div>
  );
}

function StageUpper() {
  return (
    <div data-stage="upper" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      {/* Nose ellipse (white ring) */}
      <Part inset="19.63% 68.8% 78.9% 28.46%" viewBox="0 0 47.3507 27.4182">
        <path d={svgPaths.p6c28200} fill="#F9F4F0" />
      </Part>
      {/* Nose ellipse 2 */}
      <Part inset="18.64% 68.8% 78.9% 28.46%" viewBox="0 0 47.3507 27.4182">
        <path d={svgPaths.p6c28200} fill="#F9F4F0" />
      </Part>
      {/* Nose ring (orange) */}
      <Part inset="19.84% 68.8% 77.92% 28.46%" viewBox="0 0 47.3855 24.9969">
        <path d={svgPaths.p3274b400} fill="url(#rk-grad-orange)" />
      </Part>
      {/* Support ring (dark) */}
      <Part inset="20.97% 68.95% 77.04% 28.61%" viewBox="0 0 42.105 22.2272">
        <path d={svgPaths.p3ae72c40} fill="url(#rk-grad-dark)" />
      </Part>
      {/* Upper fairing */}
      <Part inset="21.8% 68.53% 74.06% 28.18%" viewBox="0 0 56.9459 46.2661">
        <path d={svgPaths.p2b93f500} fill="url(#rk-grad-cream)" />
      </Part>
      {/* Upper ring (orange) */}
      <Part inset="24.48% 68.53% 73.39% 28.18%" viewBox="0 0 56.9043 23.8298">
        <path d={svgPaths.p2dd59000} fill="url(#rk-grad-orange)" />
      </Part>
      {/* Upper body with bands — Group20 */}
      <Part inset="23.44% 68.53% 69.7% 28.18%" viewBox="0 0 56.9043 76.7153">
        <path d={svgPaths.p184132f0} fill="#F9F4F0" />
        <path d={svgPaths.p308a2400} fill="url(#rk-grad-cream)" />
        <path d={svgPaths.p28eb1930} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p64c7b80} fill="url(#rk-grad-dark)" />
      </Part>
      {/* Nose base ring (orange) */}
      <Part inset="28.97% 68.53% 68.48% 28.19%" viewBox="0 0 56.6958 28.446">
        <path d={svgPaths.p10c03480} fill="url(#rk-grad-orange)" />
      </Part>
      {/* Mid body — Group19 */}
      <Part inset="32.99% 68.76% 60.69% 28.42%" viewBox="0 0 48.7056 70.5488">
        <path d={svgPaths.p1bfe7880} fill="#2D2926" />
        <path d={svgPaths.p8e126c0} fill="#5B534F" />
        <path d={svgPaths.pf087b00} fill="url(#rk-grad-dark)" />
      </Part>
    </div>
  );
}

function StageCore() {
  return (
    <div data-stage="core" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      {/* Upper body tube */}
      <Part inset="30.34% 68.76% 58.03% 28.42%" viewBox="0 0 48.7056 129.967">
        <path d={svgPaths.p45b5570} fill="url(#rk-grad-cream)" />
      </Part>
      {/* Lower fairing */}
      <Part inset="40.46% 68.44% 56.25% 28.1%" viewBox="0 0 59.7844 36.7725">
        <path d={svgPaths.p1f50d780} fill="url(#rk-grad-orange)" />
      </Part>
      {/* Main body tube */}
      <Part inset="42.2% 68.44% 44.51% 28.1%" viewBox="0 0 59.753 148.396">
        <path d={svgPaths.p19b09700} fill="url(#rk-grad-cream)" />
      </Part>
      {/* Side stripe 1 */}
      <Part inset="42.72% 68.44% 55.31% 28.1%" viewBox="0 0 59.753 22.0182">
        <path d={svgPaths.p28e23d80} fill="#2D2926" />
        <path d={svgPaths.p28034680} fill="#5B534F" />
      </Part>
      {/* Side stripe 2 */}
      <Part inset="45.03% 68.44% 53% 28.1%" viewBox="0 0 59.753 22.0879">
        <path d={svgPaths.p28e23d80} fill="#2D2926" />
        <path d={svgPaths.p1aef9800} fill="#5B534F" />
      </Part>
      {/* Side stripe 3 */}
      <Part inset="47.34% 68.44% 50.69% 28.1%" viewBox="0 0 59.753 22.0182">
        <path d={svgPaths.p10fee880} fill="#2D2926" />
        <path d={svgPaths.p2ef94140} fill="#5B534F" />
      </Part>
      {/* Lower body cylinder — Group14 */}
      <Part inset="53.27% 68.44% 37.86% 28.1%" viewBox="0 0 59.753 99.047">
        <path d={svgPaths.p1d759480} fill="#F9F4F0" />
        <path d={svgPaths.p2ce7c400} fill="url(#rk-grad-cream)" />
      </Part>
      {/* Lower orange ring — Group15 */}
      <Part inset="52.5% 68.37% 43.55% 28.03%" viewBox="0 0 62.15 44.1409">
        <path d={svgPaths.pfa39400} fill="#FF997D" />
        <path d={svgPaths.p1904980} fill="url(#rk-grad-orange)" />
      </Part>
    </div>
  );
}

// ─── Individual boosters ─────────────────────────────────────────────

function BoosterLeft() {
  return (
    <div data-stage="booster-1" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      <Part inset="63.87% 66.27% 25.28% 30.98%" viewBox="0 0 47.5939 121.239">
        <path d={svgPaths.pcd37980} fill="url(#rk-grad-flame)" />
        <path d={svgPaths.p3be26980} fill="#FCC503" />
        <path d={svgPaths.p36ad6800} fill="#FFF788" />
      </Part>
      <Part inset="39.93% 66.27% 34.95% 30.98%" viewBox="0 0 47.6076 280.523">
        <path d={svgPaths.p247faf00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p33e57200} fill="#F9F4F0" />
        <path d={svgPaths.p3007c580} fill="url(#rk-grad-body)" />
        <path d={svgPaths.p32605b70} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p2292d00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p60caa00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p21427f0} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p2d21b800} fill="url(#rk-grad-orange)" />
        <path d={svgPaths.p2d601210} fill="#FF997D" />
      </Part>
    </div>
  );
}

function BoosterRight() {
  return (
    <div data-stage="booster-2" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      <Part inset="63.87% 71.32% 25.28% 25.93%" viewBox="0 0 47.5939 121.239">
        <path d={svgPaths.pefdc940} fill="url(#rk-grad-flame)" />
        <path d={svgPaths.p3ff1a700} fill="#FCC503" />
        <path d={svgPaths.p1f698300} fill="#FFF788" />
      </Part>
      <Part inset="40.07% 71.32% 34.81% 25.93%" viewBox="0 0 47.6076 280.592">
        <path d={svgPaths.p3b3c95f0} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.pd8b5480} fill="#F9F4F0" />
        <path d={svgPaths.p94c31f0} fill="url(#rk-grad-body)" />
        <path d={svgPaths.p1e3d5080} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p2d814200} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p29d38d00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p128fd800} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p2832f00} fill="url(#rk-grad-orange)" />
        <path d={svgPaths.p3106fb80} fill="#FF997D" />
      </Part>
    </div>
  );
}

function BoosterCenter() {
  return (
    <div data-stage="booster-3" className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
      <Part inset="67.3% 68.79% 21.84% 28.45%" viewBox="0 0 47.5939 121.239">
        <path d={svgPaths.p20429b00} fill="url(#rk-grad-flame)" />
        <path d={svgPaths.p274fe480} fill="#FCC503" />
        <path d={svgPaths.p856d900} fill="#FFF788" />
      </Part>
      <Part inset="43.33% 68.8% 31.55% 28.45%" viewBox="0 0 47.6076 280.593">
        <path d={svgPaths.pc589c00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p33e57200} fill="#F9F4F0" />
        <path d={svgPaths.p3007c580} fill="url(#rk-grad-body)" />
        <path d={svgPaths.p2fe46e40} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p20dea600} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p60caa00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p11a48f00} fill="url(#rk-grad-dark)" />
        <path d={svgPaths.p2d21b800} fill="url(#rk-grad-orange)" />
        <path d={svgPaths.p1cae4b00} fill="#FF997D" />
      </Part>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROCKET PLAYGROUND PAGE
   ═══════════════════════════════════════════════════════════════════════ */

type RocketState = 'assembled' | 'exploding' | 'exploded' | 'reconstructing';

export default function RocketPlayground() {
  const rocketRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RocketState>('assembled');
  const activeAnimsRef = useRef<any[]>([]);
  const [scale, setScale] = useState(1.2);

  // ─── Responsive scale ──────────────────────────────────────────────
  useEffect(() => {
    const updateScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Rocket is ~135px wide, ~705px tall at 1728×1117 scale
      const scaleByHeight = (vh * 0.78) / 705;
      const scaleByWidth = (vw * 0.4) / 135;
      setScale(Math.min(scaleByHeight, scaleByWidth));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // ─── Kill all running animations ───────────────────────────────────
  const killAll = useCallback(() => {
    activeAnimsRef.current.forEach(a => {
      try { a.pause(); } catch {}
    });
    activeAnimsRef.current = [];
  }, []);

  // ─── Idle breathing animation ──────────────────────────────────────
  const startIdle = useCallback(() => {
    if (!rocketRef.current) return;
    killAll();
    const stages = rocketRef.current.querySelectorAll<HTMLElement>('[data-stage]');
    stages.forEach((el, i) => {
      el.style.transform = '';
      el.style.opacity = '';
    });
    stages.forEach((el, i) => {
      const a = animate(el, {
        translateY: [-2 + i * 0.8, 2 - i * 0.8],
        duration: 2200 + i * 400,
        loop: true,
        alternate: true,
        ease: 'inOutSine',
        autoplay: true,
      });
      activeAnimsRef.current.push(a);
    });
  }, [killAll]);

  useEffect(() => {
    const timer = setTimeout(startIdle, 300);
    return () => { clearTimeout(timer); killAll(); };
  }, [startIdle, killAll]);

  // ─── STAGE SEPARATE (cinematic timeline) ───────────────────────────
  const handleStageSeparate = useCallback(() => {
    if (state !== 'assembled') return;
    setState('exploding');
    killAll();

    const tl = createTimeline({
      defaults: { ease: 'outExpo' },
      autoplay: false,
      onComplete: () => setState('exploded'),
    });

    // Phase 1: Boosters detach and spread (0ms)
    tl.add('[data-stage="booster-1"]', {
      translateX: -140,
      translateY: 100,
      rotate: -18,
      opacity: [1, 0.5],
      duration: 1400,
    }, 0);

    tl.add('[data-stage="booster-2"]', {
      translateX: 140,
      translateY: 100,
      rotate: 18,
      opacity: [1, 0.5],
      duration: 1400,
    }, 50);

    tl.add('[data-stage="booster-3"]', {
      translateY: 220,
      scale: [1, 0.8],
      opacity: [1, 0.3],
      duration: 1600,
    }, 100);

    // Phase 2: Core body drops (400ms)
    tl.add('[data-stage="core"]', {
      translateY: 160,
      rotate: 4,
      scale: [1, 0.88],
      opacity: [1, 0.45],
      duration: 1500,
      ease: 'outQuart',
    }, 400);

    // Phase 3: Upper body drifts (600ms)
    tl.add('[data-stage="upper"]', {
      translateY: -140,
      translateX: 50,
      rotate: -6,
      scale: [1, 0.92],
      opacity: [1, 0.6],
      duration: 1400,
      ease: 'outQuart',
    }, 600);

    // Phase 4: Nose cone shoots up (800ms)
    tl.add('[data-stage="nose"]', {
      translateY: -260,
      translateX: -30,
      rotate: -15,
      scale: [1, 0.85],
      opacity: [1, 0.7],
      duration: 1600,
      ease: 'outQuart',
    }, 800);

    activeAnimsRef.current.push(tl);
    tl.play();
  }, [state, killAll]);

  // ─── STAGGER BURST (chaotic particle-like explosion) ───────────────
  const handleStaggerBurst = useCallback(() => {
    if (state !== 'assembled') return;
    setState('exploding');
    killAll();

    if (!rocketRef.current) return;
    const allParts = rocketRef.current.querySelectorAll('[data-stage] > div');

    const anim = animate(allParts, {
      translateX: (_el: any, i: number) => (Math.sin(i * 1.7) * 300 + (Math.random() - 0.5) * 200),
      translateY: (_el: any, i: number) => (Math.cos(i * 2.3) * 350 + (Math.random() - 0.5) * 200),
      rotate: (_el: any, i: number) => (Math.sin(i * 0.8) * 60),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 2000,
      delay: stagger(40, { from: 'center' }),
      ease: 'outExpo',
      onComplete: () => setState('exploded'),
    });

    activeAnimsRef.current.push(anim);
  }, [state, killAll]);

  // ─── RECONSTRUCT ───────────────────────────────────────────────────
  const handleReconstruct = useCallback(() => {
    if (state !== 'exploded') return;
    setState('reconstructing');
    killAll();

    if (!rocketRef.current) return;

    // Animate all stage wrappers and inner parts back to origin
    const stages = rocketRef.current.querySelectorAll<HTMLElement>('[data-stage]');
    const innerParts = rocketRef.current.querySelectorAll('[data-stage] > div');

    const a1 = animate(stages, {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      duration: 1800,
      delay: stagger(80, { from: 'last' }),
      ease: 'outElastic(1, .6)',
    });

    const a2 = animate(innerParts, {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      duration: 1600,
      delay: stagger(50, { from: 'center' }),
      ease: 'outElastic(1, .8)',
      onComplete: () => {
        setState('assembled');
        startIdle();
      },
    });

    activeAnimsRef.current.push(a1, a2);
  }, [state, killAll, startIdle]);

  // ─── RESET (emergency) ────────────────────────────────────────────
  const handleReset = useCallback(() => {
    killAll();
    if (!rocketRef.current) return;
    const allEls = rocketRef.current.querySelectorAll<HTMLElement>('[data-stage], [data-stage] > div');
    allEls.forEach(el => {
      el.style.transform = '';
      el.style.opacity = '';
    });
    setState('assembled');
    setTimeout(startIdle, 100);
  }, [killAll, startIdle]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 's') handleStageSeparate();
      if (e.key === '2' || e.key === 'b') handleStaggerBurst();
      if (e.key === '3' || e.key === 'r') handleReconstruct();
      if (e.key === 'Escape') handleReset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleStageSeparate, handleStaggerBurst, handleReconstruct, handleReset]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: '#08080E' }}
    >
      {/* ── Ambient grid ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(64,240,170,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64,240,170,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* ── Ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,234,255,0.04) 0%, transparent 70%)',
      }} />

      {/* ── Title ── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(28px, 4vw, 48px)',
          letterSpacing: '0.08em',
          color: '#FFFFFF',
          margin: 0,
        }}>
          ROCKET ENGINE LAB
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: '#40F0AA',
          textTransform: 'uppercase',
          marginTop: 4,
          opacity: 0.7,
        }}>
          ANIME.JS V4 &times; DESTRUCTION TIMELINE
        </p>
      </div>

      {/* ── Rocket Container ── */}
      {/* 
        The 1728×1117 frame holds all rocket parts via absolute inset positioning.
        We scale and translate so the rocket center (~515, 520) sits at viewport center.
      */}
      <div
        className="absolute"
        style={{
          width: 1728,
          height: 1117,
          left: '50%',
          top: '50%',
          transformOrigin: '515px 520px',
          transform: `translate(-515px, -520px) scale(${scale})`,
        }}
      >
        <div ref={rocketRef} className="relative w-full h-full">
          <SharedDefs />
          {/* Render stages back-to-front for proper z-order */}
          <BoosterCenter />
          <BoosterLeft />
          <BoosterRight />
          <StageCore />
          <StageUpper />
          <StageNose />
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-3">
        <ControlButton
          label="STAGE SEPARATE"
          shortcut="1"
          accent="#FF8563"
          onClick={handleStageSeparate}
          disabled={state !== 'assembled'}
        />
        <ControlButton
          label="STAGGER BURST"
          shortcut="2"
          accent="#00EAFF"
          onClick={handleStaggerBurst}
          disabled={state !== 'assembled'}
        />
        <ControlButton
          label="RECONSTRUCT"
          shortcut="3"
          accent="#40F0AA"
          onClick={handleReconstruct}
          disabled={state !== 'exploded'}
        />
        <ControlButton
          label="RESET"
          shortcut="ESC"
          accent="#7A7A90"
          onClick={handleReset}
          disabled={state === 'assembled'}
        />
      </div>

      {/* ── State indicator ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.2em',
        color: state === 'assembled' ? '#40F0AA' : state === 'exploded' ? '#FF8563' : '#00EAFF',
        textTransform: 'uppercase',
        opacity: 0.5,
      }}>
        {state === 'assembled' && 'NOMINAL — ALL STAGES LOCKED'}
        {state === 'exploding' && 'SEPARATING...'}
        {state === 'exploded' && 'STAGES SEPARATED — AWAITING RECONSTRUCTION'}
        {state === 'reconstructing' && 'REASSEMBLING...'}
      </div>

      {/* ── Back link ── */}
      <a
        href="/"
        className="absolute top-8 left-8 z-20 no-underline"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.3)',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}
      >
        &larr; BACK
      </a>

      {/* ── HUD labels on stages ── */}
      <StageLabel x="50%" y="12%" label="NOSE CONE" sub="GUIDANCE SYSTEM" color="#00EAFF" visible={state === 'assembled'} />
      <StageLabel x="50%" y="30%" label="PAYLOAD" sub="CAPSULE MODULE" color="#40F0AA" visible={state === 'assembled'} />
      <StageLabel x="50%" y="53%" label="CORE STAGE" sub="PRIMARY STRUCTURE" color="#FF8563" visible={state === 'assembled'} />
      <StageLabel x="50%" y="76%" label="BOOSTERS" sub="PROPULSION ARRAY" color="#F59E0B" visible={state === 'assembled'} />
    </div>
  );
}

// ─── Stage HUD Label ─────────────────────────────────────────────────
function StageLabel({ x, y, label, sub, color, visible }: {
  x: string; y: string; label: string; sub: string; color: string; visible: boolean;
}) {
  return (
    <div
      className="absolute z-10 pointer-events-none transition-opacity duration-700"
      style={{
        left: x,
        top: y,
        transform: 'translate(80px, -50%)',
        opacity: visible ? 0.35 : 0,
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.25em',
        color,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 8,
        letterSpacing: '0.15em',
        color: 'rgba(255,255,255,0.15)',
        textTransform: 'uppercase',
        marginTop: 2,
      }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Control Button ──────────────────────────────────────────────────
function ControlButton({
  label, shortcut, accent, onClick, disabled,
}: {
  label: string;
  shortcut: string;
  accent: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const rgb = hexToRgb(accent);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative px-5 py-2.5 transition-all duration-200"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.15em',
        color: disabled ? 'rgba(255,255,255,0.15)' : accent,
        background: disabled ? 'rgba(255,255,255,0.02)' : `rgba(${rgb}, 0.06)`,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : `rgba(${rgb}, 0.25)`}`,
        borderRadius: 6,
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span>{label}</span>
      <span style={{
        marginLeft: 8,
        fontSize: 8,
        opacity: 0.4,
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
