import { useCallback, useState, useRef, useEffect } from 'react';
import HeroParticles from './hero-particles';
import HeroDataTicker from './hero-data-ticker';
import { downloadResumePdf } from './resume-download';

/* ═══════════════════════════════════════════════════════════════════════
   OUTRO SECTION — Act 4  (The Close)
   ────────────────────────────────────
   Full hero visual treatment: grid overlay, particles, scanlines,
   HUD corners, vignette, data ticker, glitch animations.
   
   Content: closing statement, email CTA, social links, brand mark.
   ═══════════════════════════════════════════════════════════════════════ */

const EMAIL = 'imgaurav2693@gmail.com';

const _P2 = 'M69.8048 25.2791C84.8387 22.848 103.795 30.4535 113.206 42.2806C110.328 44.8994 106.807 47.2957 103.633 49.5864C88.1453 36.9311 70.9495 32.6921 53.3869 45.054C44.2655 51.4747 39.46 61.7984 37.6886 72.6206C36.7517 85.4841 39.1451 90.4692 45.2795 101.361C43.0389 103.558 38.3924 107.389 35.859 109.094C11.5777 77.5883 29.8882 30.9284 69.8048 25.2791Z';
const _P3 = 'M117.333 52.2982L118.862 52.3487C120.013 52.945 120.802 53.6644 121.395 54.8397C141.422 94.5457 106.234 140.06 62.6689 128.867C54.1348 126.354 58.1657 121.336 60.855 114.895C70.6078 117.706 80.3024 119.126 89.8521 114.967C114.861 104.076 118.611 80.5794 109.799 57.7204C112.449 55.0511 113.952 53.8726 117.334 52.2966L117.333 52.2982Z';
const _P5 = 'M152.746 12.455C156.374 11.6693 159.964 13.9379 160.816 17.5584C161.669 21.179 159.471 24.8184 155.876 25.7413C153.489 26.3534 150.957 25.6261 149.257 23.8403C147.556 22.0529 146.95 19.4846 147.675 17.1246C148.397 14.7645 150.337 12.9787 152.746 12.4565V12.455Z';

const SOCIALS = [
  { label: 'LinkedIn', url: 'https://linkedin.com/in/gauravmishra2693' },
  { label: 'Resume', url: '/resume.pdf', download: true },
];

const OUTRO_TICKER = [
  '■ TRANSMISSION.OPEN',
  '▸ SIGNAL.STRENGTH: 100%',
  '◆ CHANNEL: SECURE',
  '▹ AWAITING.INPUT',
  '■ HANDSHAKE.READY',
  '▸ COLLABORATION.MODE: ON',
  '◇ LATENCY: 0.01ms',
  '▹ BANDWIDTH: UNLIMITED',
  '■ PROTOCOL: TCP/HUMAN',
  '▸ CONNECTION.TYPE: CREATIVE',
  '◆ ENCRYPTION: NONE_NEEDED',
  '▹ STATUS: LISTENING',
];

export default function OutroSection() {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);
  const glitchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     ENTRY ANIMATIONS — staggered fade-in with glitch accents
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const root = containerRef.current;
    if (!root || animatedRef.current) return;
    animatedRef.current = true;

    const els = root.querySelectorAll<HTMLElement>('[data-animate]');
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'none';
    });

    // Stagger reveal
    els.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 300 + i * 150);
    });

    // Title glitch loop
    const titleEl = root.querySelector('[data-glitch-target]') as HTMLElement;
    if (titleEl) {
      const fire = () => {
        titleEl.style.textShadow = '3px 0 #00EAFF, -3px 0 #FF0040';
        titleEl.style.transform = `translateX(${(Math.random() - 0.5) * 5}px) skewX(${(Math.random() - 0.5) * 2}deg)`;
        setTimeout(() => {
          titleEl.style.textShadow = '-2px 0 #40F0AA, 2px 0 #00EAFF';
          titleEl.style.transform = `translateX(${(Math.random() - 0.5) * 3}px)`;
        }, 60);
        setTimeout(() => {
          titleEl.style.textShadow = '0 0 40px rgba(64,240,170,0.12)';
          titleEl.style.transform = 'translateX(0) skewX(0)';
        }, 140);
        glitchTimerRef.current = setTimeout(fire, 7000 + Math.random() * 6000);
      };
      glitchTimerRef.current = setTimeout(fire, 4000 + Math.random() * 3000);
    }

    return () => clearTimeout(glitchTimerRef.current);
  }, []);

  const tickerText = OUTRO_TICKER.join('    //    ');
  const doubled = tickerText + '    //    ' + tickerText;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#08080E',
      }}
    >
      {/* ═══ LAYER 1: Subtle grid ═══════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(64,240,170,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(64,240,170,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 50%, black 10%, transparent 70%)',
        opacity: 0.5,
      }} />

      {/* ═══ LAYER 2: Ambient glow ══════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 35% at 50% 45%, rgba(64,240,170,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 50% 80%, rgba(0,234,255,0.03) 0%, transparent 60%)
        `,
      }} />

      {/* ═══ LAYER 3: Particle constellation ════════════════════════ */}
      <HeroParticles />

      {/* ═══ LAYER 4: Scanline overlay ══════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-50" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        mixBlendMode: 'multiply',
      }} />

      {/* ═══ HUD Corners ════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <svg className="absolute" style={{ top: 24, left: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 14V2C0 0.9 0.9 0 2 0H14" stroke="#40F0AA" strokeWidth="1" strokeOpacity="0.3" />
          <circle cx="2" cy="2" r="1.5" fill="#40F0AA" fillOpacity="0.4" />
        </svg>
        <svg className="absolute" style={{ top: 24, right: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 14V2C40 0.9 39.1 0 38 0H26" stroke="#00EAFF" strokeWidth="1" strokeOpacity="0.2" />
          <circle cx="38" cy="2" r="1.5" fill="#00EAFF" fillOpacity="0.3" />
        </svg>
        <svg className="absolute" style={{ bottom: 24, left: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 26V38C0 39.1 0.9 40 2 40H14" stroke="#00EAFF" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
        <svg className="absolute" style={{ bottom: 24, right: 24 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 26V38C40 39.1 39.1 40 38 40H26" stroke="#40F0AA" strokeWidth="1" strokeOpacity="0.15" />
        </svg>
      </div>

      {/* ═══ HUD Labels ═════════════════════════════════════════════ */}
      <div className="absolute z-40 pointer-events-none" style={{ top: 38, left: 42 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', backgroundColor: '#00EAFF',
            boxShadow: '0 0 8px rgba(0,234,255,0.8)',
            animation: 'outro-dot-pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em',
            color: 'rgba(0,234,255,0.5)', textTransform: 'uppercase',
          }}>CHANNEL.OPEN</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            color: 'rgba(255,255,255,0.15)',
          }}>//</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.22)',
          }}>CONTACT.v1</span>
        </div>
      </div>

      <div className="absolute z-40 pointer-events-none" style={{ top: 38, right: 42 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.1em',
          color: 'rgba(64,240,170,0.3)',
        }}>SIGNAL.STRENGTH: ████████</span>
      </div>

      {/* ═══ Side accent lines ══════════════════════════════════════ */}
      <div className="absolute pointer-events-none z-40" style={{
        left: 24, top: '20%', bottom: '20%', width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(0,234,255,0.08) 30%, rgba(0,234,255,0.08) 70%, transparent)',
      }} />
      <div className="absolute pointer-events-none z-40" style={{
        right: 24, top: '20%', bottom: '20%', width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(64,240,170,0.06) 30%, rgba(64,240,170,0.06) 70%, transparent)',
      }} />

      {/* ═══ Vignette ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-30" style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(8,8,14,0.6) 100%)',
      }} />

      {/* ═══════════════════════════════════════════════════════════════
         MAIN CONTENT
         ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-[15] flex flex-col items-center max-w-[560px] px-6">

        {/* Radar rings behind logo */}
        <div className="relative mb-8" data-animate>
          <style>{`
            @keyframes outro-radar {
              0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0.4; }
              70% { opacity: 0.08; }
              100% { transform: translate(-50%,-50%) scale(3); opacity: 0; }
            }
            @keyframes outro-dot-pulse {
              0%, 100% { opacity: 0.8; box-shadow: 0 0 8px rgba(0,234,255,0.8); }
              50% { opacity: 0.3; box-shadow: 0 0 4px rgba(0,234,255,0.4); }
            }
          `}</style>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 80, height: 80, borderRadius: '50%',
              border: '1px solid rgba(64,240,170,0.15)',
              transform: 'translate(-50%,-50%) scale(0.2)',
              animation: `outro-radar 4.5s ease-out ${i * 1.5}s infinite`,
              pointerEvents: 'none',
            }} />
          ))}
          <svg width={32} height={30} viewBox="0 0 161 155" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <path d={_P2} fill="#40F0AA" />
            <path d={_P3} fill="#40F0AA" />
            <path d={_P5} fill="#29CFD8" />
          </svg>
        </div>

        {/* Closing tagline */}
        <span data-animate style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.3em',
          color: '#00EAFF', textTransform: 'uppercase', marginBottom: 16, opacity: 0.7,
        }}>
          Transmission Open
        </span>

        {/* Main heading with glitch target */}
        <h2 data-animate data-glitch-target style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(38px, 6vw, 60px)',
          letterSpacing: '0.04em', color: '#FFFFFF', lineHeight: 1, textAlign: 'center',
          margin: 0, marginBottom: 16,
          textShadow: '0 0 40px rgba(64,240,170,0.12)',
          transition: 'text-shadow 0.08s, transform 0.08s',
        }}>
          HAVE SOMETHING IN MIND?
        </h2>

        {/* Description */}
        <p data-animate style={{
          fontFamily: "'Cambay', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.35)',
          textAlign: 'center', margin: 0, lineHeight: 1.7, marginBottom: 40, maxWidth: 380,
        }}>
          I'm always open to exploring interesting problems,
          collaborations, and new challenges.
        </p>

        {/* Email CTA — mint glow style matching hero */}
        <button
          data-animate
          onClick={copyEmail}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.06em',
            color: copied ? '#08080E' : '#40F0AA',
            backgroundColor: copied ? '#40F0AA' : 'transparent',
            border: `1px solid ${copied ? '#40F0AA' : 'rgba(64,240,170,0.25)'}`,
            borderRadius: 6, padding: '14px 36px', cursor: 'pointer',
            transition: 'all 0.25s ease',
            minWidth: 280, textAlign: 'center',
            boxShadow: copied
              ? '0 0 30px rgba(64,240,170,0.4), 0 0 60px rgba(64,240,170,0.15)'
              : '0 0 20px rgba(64,240,170,0.06)',
          }}
          onMouseEnter={e => {
            if (!copied) {
              e.currentTarget.style.borderColor = 'rgba(64,240,170,0.5)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(64,240,170,0.15), 0 0 60px rgba(64,240,170,0.06)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.color = '#5AFFC0';
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              e.currentTarget.style.borderColor = 'rgba(64,240,170,0.25)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(64,240,170,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.color = '#40F0AA';
            }
          }}
        >
          {copied ? '// COPIED TO CLIPBOARD' : EMAIL}
        </button>

        {/* Social links — with separator dots */}
        <div data-animate className="flex items-center gap-4 mt-10">
          {SOCIALS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4">
              {i > 0 && (
                <div style={{
                  width: 3, height: 3, borderRadius: '50%',
                  backgroundColor: 'rgba(64,240,170,0.2)',
                }} />
              )}
              <a
                href={(s as any).download ? '#' : s.url}
                target={(s as any).download ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={(s as any).download ? (e: React.MouseEvent) => { e.preventDefault(); downloadResumePdf(); } : undefined}
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.25)', textDecoration: 'none', textTransform: 'uppercase',
                  transition: 'color 0.2s ease, text-shadow 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#40F0AA';
                  e.currentTarget.style.textShadow = '0 0 12px rgba(64,240,170,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                {s.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Data ticker (outro variant) ════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 48, left: 0, right: 0, zIndex: 35,
          overflow: 'hidden', height: 20,
          maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <style>{`
          @keyframes outro-ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={{
          display: 'inline-block', whiteSpace: 'nowrap',
          animation: 'outro-ticker-scroll 45s linear infinite',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: '0.12em',
          color: 'rgba(0,234,255,0.2)',
        }}>
          {doubled}
        </div>
      </div>

      {/* ═══ Footer line ════════════════════════════════════════════ */}
      <div className="absolute bottom-6 left-[50%] -translate-x-1/2 z-40">
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase',
        }}>
          Designed & built by Gaurav
        </span>
      </div>

      {/* ═══ Top + Bottom accent lines ══════════════════════════════ */}
      <div className="absolute top-0 left-[5%] right-[5%] h-px z-40" style={{
        background: 'linear-gradient(90deg, transparent, rgba(0,234,255,0.08), rgba(64,240,170,0.06), transparent)',
      }} />
      <div className="absolute bottom-0 left-[5%] right-[5%] h-px z-40" style={{
        background: 'linear-gradient(90deg, transparent, rgba(64,240,170,0.06), rgba(0,234,255,0.08), rgba(64,240,170,0.06), transparent)',
      }} />
    </div>
  );
}