import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════════════════════════════════
   WALL NARRATIVE — Isometric Wall Text Animations
   ────────────────────────────────────────────────
   Block-letter story text projected onto the left wall of the
   design studio. Each interactive object maps to a narrative chapter
   revealed through three animation phases:
     1. Time code  → glitch-decode (random chars settle left-to-right)
     2. Teaser     → blur-to-sharp block letters with spring slide
     3. Narrative   → typewriter reveal with blinking cursor
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Chapter data ────────────────────────────────────────────────── */
interface Chapter {
  time: string;
  teaser: string;
  narrative: string;
  ctaLabel?: string;
  ctaRoute?: string;
}

const DEFAULT_CHAPTERS: Record<string, Chapter> = {
  coffeemug: {
    time: '5:47 AM',
    teaser: 'THE\nRITUAL',
    narrative: 'EVERY MORNING STARTS THE SAME WAY. THE KETTLE. THE POUR. THE FIRST QUIET SIP BEFORE THE SCREEN LIGHTS UP.',
  },
  chair: {
    time: '6:12 AM',
    teaser: 'SETTLE\nIN',
    narrative: 'THIS CHAIR HAS HELD A THOUSAND IDEAS. MOST OF THEM TERRIBLE. BUT THE GOOD ONES ALWAYS CAME AFTER SITTING LONG ENOUGH.',
  },
  laptop: {
    time: '7:30 AM',
    teaser: 'THE\nCRAFT',
    narrative: 'THE CURSOR BLINKS. AN EMPTY CANVAS. THE MOST TERRIFYING AND BEAUTIFUL THING IN THE WORLD.',
  },
  diary: {
    time: '10:15 AM',
    teaser: 'UN\nFILTERED',
    narrative: 'NOT EVERY THOUGHT DESERVES A PIXEL. SOME NEED PAPER FIRST. THE ROUGH ONES. THE HONEST ONES.',
  },
  headphones: {
    time: '1:00 PM',
    teaser: 'DIS\nAPPEAR',
    narrative: 'THERE IS A PLACE BETWEEN THE SECOND AND THIRD HOUR WHERE MUSIC STOPS BEING MUSIC AND BECOMES ARCHITECTURE.',
  },
  phone: {
    time: '3:45 PM',
    teaser: 'THE\nOUTSIDE',
    narrative: 'A MESSAGE FROM A COLLABORATOR. THREE WORDS THAT CHANGE THE ENTIRE DIRECTION.',
  },
  printer: {
    time: '6:00 PM',
    teaser: 'MAKE\nIT REAL',
    narrative: 'DIGITAL IS INFINITE. BUT THERE IS SOMETHING ABOUT HOLDING IT IN YOUR HANDS THAT MAKES IT FINAL.',
  },
  radio: {
    time: '8:30 PM',
    teaser: 'THE\nSOUND',
    narrative: 'LATE HOURS NEED A SOUNDTRACK. FM STATIC FADING INTO JAZZ. THE ROOM HUMS ALONG.',
  },
  packedbag: {
    time: '11:59 PM',
    teaser: 'THE\nDEPARTURE',
    narrative: 'THE BAG IS PACKED. THE ROOM IS STILL. SOME STORIES CAN ONLY BE TOLD BY LEAVING.',
  },
};

/* ── Finale chapter (all 8 discovered) ──────────────────────────── */
const DEFAULT_FINALE: Chapter = {
  time: '11:59 PM',
  teaser: 'A DAY\nIN THE\nSTUDIO',
  narrative: 'EVERY OBJECT TELLS A STORY. EVERY STORY IS A PIECE OF THE WHOLE. THE ROOM REMEMBERS.',
};

const DEFAULT_OBJECT_IDS = ['coffeemug', 'chair', 'laptop', 'diary', 'headphones', 'phone', 'printer', 'radio'];
const GLITCH_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:!@#$%&*';

/* ── Hex color helpers ───────────────────────────────────────────── */
function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ═══════════════════════════════════════════════════════════════════ */

interface WallNarrativeProps {
  clickedId: string | null;
  entered: boolean;
  discoveredSet: Set<string>;
  compact?: boolean;
  /** Override chapter data (defaults to design-studio chapters) */
  chapters?: Record<string, Chapter>;
  /** Override list of discoverable object IDs (for progress dots) */
  objectIds?: string[];
  /** Override the "all discovered" finale chapter */
  finale?: Chapter;
  /** How many objects must be discovered for the finale (defaults to objectIds.length) */
  finaleThreshold?: number;
  /** Accent color override (default: #00A87C green) */
  accent?: string;
}

export function WallNarrative({
  clickedId, entered, discoveredSet, compact,
  chapters = DEFAULT_CHAPTERS,
  objectIds = DEFAULT_OBJECT_IDS,
  finale = DEFAULT_FINALE,
  finaleThreshold,
  accent = '#00A87C',
}: WallNarrativeProps) {
  const navigate = useNavigate();
  /* ── Animation state ────────────────────────────────────────── */
  const [activeId, setActiveId] = useState<string | null>(null);
  const [glitchText, setGlitchText] = useState('');
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'playing' | 'exiting'>('idle');
  const [finaleShown, setFinaleShown] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  /* Timers */
  const glitchIv = useRef(0);
  const typeIv = useRef(0);
  const phaseT = useRef(0);
  const teaserT = useRef(0);
  const typeStartT = useRef(0);

  const requiredCount = finaleThreshold ?? objectIds.length;
  const allDiscovered = discoveredSet.size >= requiredCount;

  /* ── Clear all timers ───────────────────────────────────────── */
  const clearTimers = () => {
    clearInterval(glitchIv.current);
    clearInterval(typeIv.current);
    clearTimeout(phaseT.current);
    clearTimeout(teaserT.current);
    clearTimeout(typeStartT.current);
  };

  /* ── Drive animations from clickedId changes ────────────────── */
  useEffect(() => {
    clearTimers();

    if (!clickedId || !chapters[clickedId]) {
      /* ── Exit ── */
      if (phase !== 'idle') {
        setPhase('exiting');
        phaseT.current = window.setTimeout(() => {
          setActiveId(null);
          setPhase('idle');
          setGlitchText('');
          setTypedText('');
          setTeaserVisible(false);
          setCtaVisible(false);
        }, 380);
      }
      return;
    }

    const chapter = chapters[clickedId];
    setActiveId(clickedId);
    setPhase('playing');
    setGlitchText('');
    setTypedText('');
    setTeaserVisible(false);
    setCtaVisible(false);

    /* Phase 1 — Glitch-decode time code */
    const timeStr = chapter.time;
    let frame = 0;
    const settlePerChar = 3;
    const totalFrames = timeStr.length * settlePerChar;

    glitchIv.current = window.setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < timeStr.length; i++) {
        if (timeStr[i] === ' ' || timeStr[i] === '\n') { out += timeStr[i]; continue; }
        const settle = (i + 1) * settlePerChar;
        out += frame >= settle
          ? timeStr[i]
          : GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
      }
      setGlitchText(out);
      if (frame >= totalFrames) clearInterval(glitchIv.current);
    }, 45);

    /* Phase 2 — Teaser blur-to-sharp (stagger in 250ms) */
    teaserT.current = window.setTimeout(() => {
      setTeaserVisible(true);
    }, 220);

    /* Phase 3 — Typewriter narrative (stagger in 800ms) */
    typeStartT.current = window.setTimeout(() => {
      const text = chapter.narrative;
      let idx = 0;
      typeIv.current = window.setInterval(() => {
        idx++;
        setTypedText(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(typeIv.current);
          /* Show CTA after typing finishes */
          if (chapter.ctaLabel) {
            setTimeout(() => setCtaVisible(true), 300);
          }
        }
      }, 28);
    }, 780);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedId]);

  /* ── Finale trigger ─────────────────────────────────────────── */
  useEffect(() => {
    if (allDiscovered && !finaleShown && phase === 'idle' && !clickedId) {
      setFinaleShown(true);
      /* Play finale as if it were a click */
      const fTimer = window.setTimeout(() => {
        setActiveId('__finale__');
        setPhase('playing');
        setGlitchText('');
        setTypedText('');
        setTeaserVisible(false);
        setCtaVisible(false);

        const ch = finale;
        let frame = 0;
        const timeStr = ch.time;
        const totalFrames = timeStr.length * 3;
        glitchIv.current = window.setInterval(() => {
          frame++;
          let out = '';
          for (let i = 0; i < timeStr.length; i++) {
            if (timeStr[i] === ' ') { out += ' '; continue; }
            out += frame >= (i + 1) * 3
              ? timeStr[i]
              : GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
          }
          setGlitchText(out);
          if (frame >= totalFrames) clearInterval(glitchIv.current);
        }, 45);

        teaserT.current = window.setTimeout(() => setTeaserVisible(true), 220);
        typeStartT.current = window.setTimeout(() => {
          let idx = 0;
          typeIv.current = window.setInterval(() => {
            idx++;
            setTypedText(ch.narrative.slice(0, idx));
            if (idx >= ch.narrative.length) clearInterval(typeIv.current);
          }, 40);
        }, 900);
      }, 600);
      return () => clearTimeout(fTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDiscovered, phase, clickedId]);

  /* ── Derived ────────────────────────────────────────────────── */
  const chapter = activeId === '__finale__' ? finale : (activeId ? chapters[activeId] : null);
  const isActive = !!chapter && phase !== 'idle';
  const isExiting = phase === 'exiting';

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        /* In compact (board-mounted) mode the parent container already
           applies the full isometric skewY/skewX, so no extra transform.
           In full-size mode keep the standalone wall-projection skew. */
        transform: compact ? 'none' : 'skewY(-6deg)',
        transformOrigin: 'top center',
        overflow: 'hidden',
      }}
    >
      {/* ── Glow wash ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: compact ? -8 : -30,
          background: `radial-gradient(ellipse at 55% 35%, ${hexToRgba(accent, 0.07)} 0%, transparent 70%)`,
          filter: compact ? 'blur(8px)' : 'blur(18px)',
          opacity: isActive && !isExiting ? 1 : 0,
          transition: 'opacity 700ms ease, background 500ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Active chapter ─────────────────────────────────────── */}
      {chapter && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: compact ? '6px 5px 12px' : '18px 12px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: compact ? 2 : 6,
            opacity: isExiting ? 0 : 1,
            transform: isExiting ? 'translateY(-6px)' : 'translateY(0)',
            transition: 'opacity 320ms ease, transform 320ms ease',
            pointerEvents: 'none',
          }}
        >
          {/* Time — glitch decode */}
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: compact ? 6 : 13,
              letterSpacing: compact ? 2.5 : 6,
              color: accent,
              minHeight: compact ? 8 : 16,
              textShadow: `0 0 12px ${hexToRgba(accent, 0.3)}`,
            }}
          >
            {glitchText}
          </div>

          {/* Teaser — blur → sharp block letters */}
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: compact ? 14 : 40,
              letterSpacing: compact ? 0.8 : 2,
              lineHeight: 0.92,
              color: 'rgba(255,255,255,0.95)',
              filter: teaserVisible ? 'blur(0px)' : (compact ? 'blur(6px)' : 'blur(14px)'),
              opacity: teaserVisible ? 1 : 0,
              transform: teaserVisible ? 'translateY(0)' : 'translateY(4px)',
              transition:
                'filter 650ms cubic-bezier(0.22,1,0.36,1), opacity 450ms ease-out, transform 550ms cubic-bezier(0.22,1,0.36,1)',
              whiteSpace: 'pre-line',
              textShadow: '0 1px 20px rgba(255,255,255,0.06)',
            }}
          >
            {chapter.teaser}
          </div>

          {/* Accent divider */}
          <div
            style={{
              width: teaserVisible ? (compact ? 14 : 36) : 0,
              height: compact ? 0.75 : 1.5,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              transition: 'width 500ms cubic-bezier(0.22,1,0.36,1) 180ms',
              marginTop: compact ? 1 : 2,
              marginBottom: compact ? 1 : 2,
            }}
          />

          {/* Narrative — typewriter */}
          <div
            style={{
              fontFamily: "'Cambay', sans-serif",
              fontSize: compact ? 4.5 : 8.5,
              letterSpacing: compact ? 0.5 : 1.2,
              lineHeight: compact ? 1.5 : 1.75,
              color: 'rgba(255,255,255,0.45)',
              minHeight: compact ? 20 : 60,
              overflow: 'hidden',
            }}
          >
            {typedText}
            {/* Blinking cursor */}
            {typedText.length > 0 && typedText.length < (chapter.narrative.length) && (
              <span
                className="wall-cursor-blink"
                style={{
                  display: 'inline-block',
                  width: compact ? 2 : 4,
                  height: compact ? 4 : 9,
                  background: accent,
                  marginLeft: 1,
                  verticalAlign: 'text-bottom',
                }}
              />
            )}
          </div>

          {/* CTA button */}
          {chapter.ctaLabel && (
            <button
              type="button"
              style={{
                pointerEvents: ctaVisible ? 'auto' : 'none',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: compact ? 4.2 : 10,
                letterSpacing: compact ? 1 : 2.5,
                lineHeight: 1,
                color: accent,
                padding: compact ? '2px 4px' : '6px 12px',
                marginTop: compact ? 2 : 6,
                background: hexToRgba(accent, 0.06),
                borderWidth: compact ? '0.4px' : '1px',
                borderStyle: 'solid',
                borderColor: hexToRgba(accent, 0.25),
                borderRadius: compact ? 1 : 4,
                cursor: 'pointer',
                textAlign: 'left',
                opacity: ctaVisible ? 1 : 0,
                transform: ctaVisible ? 'translateY(0)' : 'translateY(3px)',
                transition: 'opacity 500ms ease, transform 500ms cubic-bezier(0.22,1,0.36,1), background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
                textShadow: `0 0 8px ${hexToRgba(accent, 0.3)}`,
                boxShadow: `0 0 ${compact ? 3 : 8}px ${hexToRgba(accent, 0.08)}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = hexToRgba(accent, 0.14);
                e.currentTarget.style.borderColor = hexToRgba(accent, 0.45);
                e.currentTarget.style.boxShadow = `0 0 ${compact ? 6 : 14}px ${hexToRgba(accent, 0.2)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = hexToRgba(accent, 0.06);
                e.currentTarget.style.borderColor = hexToRgba(accent, 0.25);
                e.currentTarget.style.boxShadow = `0 0 ${compact ? 3 : 8}px ${hexToRgba(accent, 0.08)}`;
              }}
              onClick={() => {
                if (chapter.ctaRoute) {
                  if (chapter.ctaRoute.startsWith('http')) {
                    window.open(chapter.ctaRoute, '_blank', 'noopener,noreferrer');
                  } else {
                    navigate(chapter.ctaRoute);
                  }
                }
              }}
            >
              {chapter.ctaLabel}
            </button>
          )}
        </div>
      )}

      {/* ── Discovery progress dots ────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: compact ? 3 : 6,
          left: compact ? 5 : 12,
          display: 'flex',
          gap: compact ? 3 : 5,
          opacity: entered ? 1 : 0,
          transition: 'opacity 800ms ease 1200ms',
        }}
      >
        {objectIds.map(id => {
          const found = discoveredSet.has(id);
          return (
            <div
              key={id}
              style={{
                width: compact ? 2.5 : 4,
                height: compact ? 2.5 : 4,
                borderRadius: '50%',
                background: found ? accent : 'rgba(255,255,255,0.08)',
                transition: 'background 600ms ease, box-shadow 600ms ease',
                boxShadow: found
                  ? `0 0 4px ${hexToRgba(accent, 0.5)}, 0 0 2px ${hexToRgba(accent, 0.3)}`
                  : 'none',
              }}
            />
          );
        })}
        {/* Count */}
        {!compact && (
          <span
            style={{
              fontFamily: "'Cambay', sans-serif",
              fontSize: 7,
              letterSpacing: 1,
              color: allDiscovered ? accent : 'rgba(255,255,255,0.15)',
              marginLeft: 3,
              transition: 'color 600ms ease',
            }}
          >
            {discoveredSet.size}/{requiredCount}
          </span>
        )}
      </div>
    </div>
  );
}