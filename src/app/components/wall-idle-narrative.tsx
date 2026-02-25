import { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   WALL IDLE NARRATIVE — Ambient Looping Text on the Right Wall
   ──────────────────────────────────────────────────────────────
   Appears after 3 seconds of no interaction (no hover, no click).
   Cycles through atmospheric lines with a typewriter reveal + fade loop.
   Disappears instantly on any interaction. Rendered at zIndex 26
   (above objects, clones, hit zones, vignette) so it's always visible
   on the right wall — same position as the click-driven WallNarrative.
   ═══════════════════════════════════════════════════════════════════════ */

const IDLE_LINES = [
  'THE ROOM WAITS.',
  'ENGINES COOL. DUST SETTLES.',
  'EVERY SCRATCH TELLS A STORY.',
  'THE HELMET REMEMBERS EVERY ROAD.',
  'OIL AND RUBBER. THE SCENT OF FREEDOM.',
  'SOME NIGHTS, THE GARAGE TALKS BACK.',
  'THE TOOLS KNOW YOUR HANDS.',
  'GRAVEL UNDER BOOTS. KEYS IN POCKET.',
  'BETWEEN RIDES, THERE IS SILENCE.',
  'THE CHAIN LINKS HOLD MILES.',
  'A CORNER FOR EVERY SEASON.',
  'THE ROAD NEVER ASKS WHY.',
];

interface WallIdleNarrativeProps {
  isIdle: boolean;
  accent?: string;
  /** Override default idle lines */
  lines?: string[];
}

export function WallIdleNarrative({ isIdle, accent = '#CE302E', lines = IDLE_LINES }: WallIdleNarrativeProps) {
  const [visible, setVisible] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<'typing' | 'hold' | 'fading'>('typing');
  const intervalRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);
  const prevIdle = useRef(false);

  /* On idle start → begin cycle; on idle end → hide immediately */
  useEffect(() => {
    if (isIdle && !prevIdle.current) {
      setVisible(true);
      setLineIdx(Math.floor(Math.random() * lines.length));
      setTyped('');
      setPhase('typing');
    }
    if (!isIdle && prevIdle.current) {
      setVisible(false);
      setTyped('');
      setPhase('typing');
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    }
    prevIdle.current = isIdle;
  }, [isIdle, lines]);

  /* Typewriter effect */
  useEffect(() => {
    if (!visible || phase !== 'typing') return;
    const line = lines[lineIdx];
    let charIdx = 0;
    setTyped('');

    intervalRef.current = window.setInterval(() => {
      charIdx++;
      setTyped(line.slice(0, charIdx));
      if (charIdx >= line.length) {
        clearInterval(intervalRef.current);
        setPhase('hold');
      }
    }, 65);

    return () => clearInterval(intervalRef.current);
  }, [visible, phase, lineIdx, lines]);

  /* Hold → fade → next line */
  useEffect(() => {
    if (!visible || phase !== 'hold') return;
    timeoutRef.current = window.setTimeout(() => {
      setPhase('fading');
      /* After fade-out, advance to next line */
      timeoutRef.current = window.setTimeout(() => {
        setLineIdx(i => (i + 1) % lines.length);
        setTyped('');
        setPhase('typing');
      }, 900);
    }, 2800);

    return () => clearTimeout(timeoutRef.current);
  }, [visible, phase, lines]);

  if (!visible) return null;

  const textOpacity = phase === 'fading' ? 0 : phase === 'hold' ? 1 : 0.9;

  return (
    <div
      className="absolute inset-0 flex items-end justify-start"
      style={{ padding: '0 8px 12px 6px' }}
    >
      <div
        style={{
          transition: 'opacity 800ms ease',
          opacity: textOpacity,
        }}
      >
        {/* Subtle line accent */}
        <div
          style={{
            width: 20,
            height: 1.5,
            background: accent,
            opacity: 0.45,
            marginBottom: 6,
          }}
        />
        {/* Typed text */}
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 9,
            letterSpacing: 2.8,
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            overflow: 'hidden',
            textShadow: '0 0 8px rgba(0,0,0,0.6)',
          }}
        >
          {typed}
          <span
            className="wall-cursor-blink"
            style={{
              display: 'inline-block',
              width: 4,
              height: 9,
              background: accent,
              opacity: phase === 'typing' ? 0.6 : 0,
              marginLeft: 2,
              verticalAlign: 'middle',
              transition: 'opacity 300ms ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}