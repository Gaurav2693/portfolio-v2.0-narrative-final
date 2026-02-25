import { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   WALL WELCOME — Right-Wall Isometric Welcome Panel
   ──────────────────────────────────────────────────
   Welcome text painted directly on the dark wall surface.
   Always uses light-on-dark palette (white text + accent highlights).
   The `dimmed` prop (lamp off or object clicked) reduces brightness
   and adds subtle glow to the accent color for atmosphere.

   Font sizes are 1.5× the original for prominence on the wall.

   Animation phases:
     1. Glitch-decode the studio label (accent color)
     2. Large "WELCOME" block letters blur-to-sharp (white)
     3. Subtitle typewriter reveal (gray)
     4. Idle breathing pulse
   ═══════════════════════════════════════════════════════════════════════ */

const GLITCH_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:!@#$%&*';
const LABEL = 'THE DESIGN STUDIO';
const WELCOME_LINE1 = 'WELCOME';
const WELCOME_LINE2 = 'EXPLORER';
const SUBTITLE = 'EVERY OBJECT HOLDS A CHAPTER · CLICK TO DISCOVER';

/* Transition duration for the dim colour swap */
const CLR_T = '500ms';
const CLR_EASE = 'ease-out';

/* ── Color helpers ───────────────────────────────────────────────── */
function brighten(hex: string, amt: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

interface WallWelcomeProps {
  entered: boolean;
  discoveredCount: number;
  /** true when the scene is dimmed (lamp off or object clicked) */
  dimmed?: boolean;
  /** Override the glitch-decode label text */
  label?: string;
  /** Override the large welcome line */
  title1?: string;
  /** Override the secondary line (green) */
  title2?: string;
  /** Override the typewriter subtitle */
  subtitle?: string;
  /** Override the total discoverable count */
  totalDiscoverable?: number;
  /** Accent color override (default: #00A87C) */
  accent?: string;
  /** Render title1 + title2 on a single line (two-color) at a smaller size */
  inlineTitle?: boolean;
}

export function WallWelcome({
  entered, discoveredCount, dimmed = false,
  label = LABEL,
  title1 = WELCOME_LINE1,
  title2 = WELCOME_LINE2,
  subtitle = SUBTITLE,
  totalDiscoverable = 8,
  accent = '#00A87C',
  inlineTitle = false,
}: WallWelcomeProps) {
  const [glitchText, setGlitchText] = useState('');
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'revealing' | 'done'>('idle');

  const glitchIv = useRef<ReturnType<typeof setInterval>>();
  const typeIv = useRef<ReturnType<typeof setInterval>>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    if (glitchIv.current) clearInterval(glitchIv.current);
    if (typeIv.current) clearInterval(typeIv.current);
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
  };

  /* ── Entrance animation ─────────────────────────────────────── */
  useEffect(() => {
    if (!entered) return;
    setPhase('revealing');

    /* Phase 1: Glitch-decode the label */
    const resolved = new Array(label.length).fill(false);
    let frame = 0;
    glitchIv.current = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < label.length; i++) {
        if (resolved[i]) {
          out += label[i];
        } else if (label[i] === ' ') {
          resolved[i] = true;
          out += ' ';
        } else if (frame > i * 1.8 + 3) {
          resolved[i] = true;
          out += label[i];
        } else {
          out += GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
        }
      }
      setGlitchText(out);
      if (resolved.every(Boolean)) clearInterval(glitchIv.current);
    }, 45);

    /* Phase 2: Welcome blur-to-sharp */
    const t1 = setTimeout(() => setWelcomeVisible(true), 650);
    timers.current.push(t1);

    /* Phase 3: Subtitle typewriter */
    const t2 = setTimeout(() => {
      let idx = 0;
      typeIv.current = setInterval(() => {
        idx++;
        setSubtitleText(subtitle.slice(0, idx));
        if (idx >= subtitle.length) {
          clearInterval(typeIv.current);
          setPhase('done');
        }
      }, 28);
    }, 1100);
    timers.current.push(t2);

    return clearAll;
  }, [entered]);

  const progressLabel = discoveredCount === 0
    ? ''
    : discoveredCount >= totalDiscoverable
      ? 'ALL DISCOVERED'
      : `${discoveredCount}/${totalDiscoverable}`;

  /* ── Dim-reactive colours ────────────────────────────────────── */
  /* dimmed=true  → dark walls  → light text (white + glowing accent)
     dimmed=false → light walls → dark text  (black + muted accent) */
  const c = {
    label:     dimmed ? brighten(accent, 80) : accent,
    welcome:   dimmed ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)',
    explorer:  dimmed ? brighten(accent, 80) : brighten(accent, 20),
    divider:   dimmed ? brighten(accent, 80) : accent,
    subtitle:  dimmed ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.40)',
    progress:  dimmed
      ? (discoveredCount >= totalDiscoverable ? brighten(accent, 80) : 'rgba(255,255,255,0.12)')
      : (discoveredCount >= totalDiscoverable ? accent : 'rgba(0,0,0,0.15)'),
    cursor:    dimmed ? brighten(accent, 80) : accent,
    labelShadow: dimmed ? `0 0 8px ${hexToRgba(accent, 0.4)}` : 'none',
  };

  const ct = `color ${CLR_T} ${CLR_EASE}`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ── Content area ───────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '6px 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pointerEvents: 'none',
        }}
      >
        {/* Label — glitch decode (green, 1.5×: 10px) */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 10,
            letterSpacing: 3.5,
            color: c.label,
            textShadow: c.labelShadow,
            minHeight: 12,
            opacity: entered ? 1 : 0,
            transition: `opacity 400ms ease, ${ct}, text-shadow ${CLR_T} ${CLR_EASE}`,
          }}
        >
          {glitchText}
        </div>

        {/* Title block — inline mode puts title1 + title2 on one line */}
        {inlineTitle ? (
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 26,
              letterSpacing: 1,
              lineHeight: 0.95,
              whiteSpace: 'nowrap',
              filter: welcomeVisible ? 'blur(0px)' : 'blur(10px)',
              opacity: welcomeVisible ? 1 : 0,
              transform: welcomeVisible ? 'translateY(0)' : 'translateY(4px)',
              transition:
                `filter 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease-out, transform 600ms cubic-bezier(0.22,1,0.36,1)`,
            }}
          >
            <span style={{ color: c.welcome, transition: ct }}>{title1} </span>
            <span style={{ color: c.explorer, transition: ct }}>{title2}</span>
          </div>
        ) : (
          <>
            {/* WELCOME — blur → sharp (black ↔ white, 1.5×: 38px) */}
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 38,
                letterSpacing: 1.5,
                lineHeight: 0.88,
                color: c.welcome,
                filter: welcomeVisible ? 'blur(0px)' : 'blur(10px)',
                opacity: welcomeVisible ? 1 : 0,
                transform: welcomeVisible ? 'translateY(0)' : 'translateY(4px)',
                transition:
                  `filter 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease-out, transform 600ms cubic-bezier(0.22,1,0.36,1), ${ct}`,
              }}
            >
              {title1}
            </div>

            {/* EXPLORER — staggered reveal (green, 1.5×: 22px) */}
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: 4,
                lineHeight: 0.95,
                color: c.explorer,
                filter: welcomeVisible ? 'blur(0px)' : 'blur(8px)',
                opacity: welcomeVisible ? 1 : 0,
                transform: welcomeVisible ? 'translateY(0)' : 'translateY(3px)',
                transition:
                  `filter 700ms cubic-bezier(0.22,1,0.36,1) 120ms, opacity 500ms ease-out 120ms, transform 600ms cubic-bezier(0.22,1,0.36,1) 120ms, ${ct}`,
              }}
            >
              {title2}
            </div>
          </>
        )}

        {/* Accent divider (green, 1.5×: 38px target width) */}
        <div
          style={{
            width: welcomeVisible ? 38 : 0,
            height: 1.5,
            background: `linear-gradient(90deg, ${c.divider}, transparent)`,
            transition: `width 500ms cubic-bezier(0.22,1,0.36,1) 200ms, background ${CLR_T} ${CLR_EASE}`,
            marginTop: 2,
            marginBottom: 2,
          }}
        />

        {/* Subtitle — typewriter (dark ↔ light, 1.5×: 7px) */}
        <div
          style={{
            fontFamily: "'Cambay', sans-serif",
            fontSize: 7,
            letterSpacing: 0.6,
            lineHeight: 1.5,
            color: c.subtitle,
            minHeight: 18,
            overflow: 'hidden',
            transition: ct,
          }}
        >
          {subtitleText}
          {subtitleText.length > 0 && subtitleText.length < subtitle.length && (
            <span
              className="wall-cursor-blink"
              style={{
                display: 'inline-block',
                width: 2.5,
                height: 6,
                background: c.cursor,
                marginLeft: 1,
                verticalAlign: 'text-bottom',
                transition: `background ${CLR_T} ${CLR_EASE}`,
              }}
            />
          )}
        </div>

        {/* Progress counter (1.5×: 9px) */}
        {progressLabel && (
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 9,
              letterSpacing: 2.5,
              color: c.progress,
              marginTop: 'auto',
              transition: ct,
            }}
          >
            {progressLabel}
          </div>
        )}
      </div>

      {/* ── Breathing idle pulse (after reveal) ────────────────── */}
      {phase === 'done' && (
        <div
          className="wall-idle-breathe"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 40% 30%, ${hexToRgba(accent, 0.06)} 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}