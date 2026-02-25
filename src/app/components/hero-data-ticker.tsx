import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   DATA TICKER — Scrolling cyberpunk status bar
   ────────────────────────────────────────────
   Horizontally scrolling monospace text stream near the bottom.
   Mimics a terminal/data feed with system status messages.
   ═══════════════════════════════════════════════════════════════════════ */

const TICKER_ITEMS = [
  '■ SYS.BOOT COMPLETE',
  '▸ PORTFOLIO.RENDER → OK',
  '◆ DESIGN_SYSTEMS: LOADED',
  '▹ UX.AUDIT.ENGINE: STANDBY',
  '■ NODE_COUNT: 2,847',
  '▸ FIGMA.SYNC: 99.7%',
  '◇ ACCESSIBILITY.SCORE: AAA',
  '▹ RESPONSE_TIME: 0.3ms',
  '■ FRAMEWORKS: REACT • NEXT • SWIFT',
  '▸ PROJECTS.SHIPPED: 40+',
  '◆ COFFEE.CONSUMED: ∞',
  '▹ PIXELS.PUSHED: 12.4M',
  '■ LATENCY: 0.02ms',
  '▸ UPTIME: 99.99%',
  '◇ BUILD.STATUS: PASSING',
  '▹ DEPLOY.TARGET: PRODUCTION',
];

export default function HeroDataTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Start hidden, fade in after hero animations
    el.style.opacity = '0';
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 1.2s ease-out';
      el.style.opacity = '1';
    }, 3600);

    return () => clearTimeout(timer);
  }, []);

  const tickerText = TICKER_ITEMS.join('    //    ');
  // Duplicate for seamless loop
  const doubled = tickerText + '    //    ' + tickerText;

  return (
    <>
      <style>{`
        @keyframes hero-ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute pointer-events-none"
        style={{
          bottom: 48,
          left: 0,
          right: 0,
          zIndex: 35,
          overflow: 'hidden',
          height: 20,
          maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div
          ref={innerRef}
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            animation: 'hero-ticker-scroll 60s linear infinite',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'rgba(64,240,170,0.25)',
          }}
        >
          {doubled}
        </div>
      </div>
    </>
  );
}
