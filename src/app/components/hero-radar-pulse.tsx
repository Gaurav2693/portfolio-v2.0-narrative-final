import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   RADAR PULSE — Expanding rings from logo position
   ────────────────────────────────────────────────
   Concentric rings that pulse outward from behind the logo icon,
   giving a "signal broadcast" / sonar effect.
   
   Rendered inside the scaled Figma container, positioned in
   design-space coordinates (1728×1117 canvas).
   Logo center ≈ (872, 211) in design coords.
   ═══════════════════════════════════════════════════════════════════════ */

// Logo inset: top 14.5%, right 46.58%, bottom 76.72%, left 47.51%
// → center X = 1728 * (0.4751 + (1 - 0.4751 - 0.4658) / 2) ≈ 872
// → center Y = 1117 * (0.145 + (1 - 0.145 - 0.7672) / 2) ≈ 211
const LOGO_CX = 872;
const LOGO_CY = 211;

export default function HeroRadarPulse() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = '0';
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 1.5s ease-out';
      el.style.opacity = '1';
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const RING_SIZE = 160;

  return (
    <>
      <style>{`
        @keyframes hero-radar-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.15);
            opacity: 0.5;
          }
          60% {
            opacity: 0.12;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.8);
            opacity: 0;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute pointer-events-none"
        style={{
          left: LOGO_CX,
          top: LOGO_CY,
          width: 0,
          height: 0,
          zIndex: 3,
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: '50%',
              border: '1px solid rgba(64,240,170,0.18)',
              boxShadow: '0 0 8px rgba(64,240,170,0.06)',
              transform: 'translate(-50%, -50%) scale(0.15)',
              animation: `hero-radar-ring 4.5s ease-out ${i * 1.5}s infinite`,
            }}
          />
        ))}
        {/* Static inner glow at logo center */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(64,240,170,0.06) 0%, transparent 70%)',
        }} />
      </div>
    </>
  );
}
