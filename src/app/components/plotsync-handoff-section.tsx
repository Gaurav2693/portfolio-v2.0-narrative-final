import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════
   PLOTSYNC HANDOFF SECTION
   ───────────────────────────────────────
   Clean, professional design — no doodle aesthetic.
   Consistent SVG icons, auto-switching carousel, precise alignment.
   ═══════════════════════════════════════════════════════════════════════ */

const ACCENT = '#E8501A';
const MINT = '#40F0AA';

/* ── Clean SVG Icon Components ────────────────────────────────────────── */

function IconFigma({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="4" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function IconCode({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 18L2 12L8 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6L22 12L16 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14.5" y1="4" x2="9.5" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTerminal({ size = 24, color = MINT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M6 9L10 12L6 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="15" x2="18" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe({ size = 24, color = MINT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4.5" ry="10" stroke={color} strokeWidth="1.5" />
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5" />
      <path d="M4 7.5H20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M4 16.5H20" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function IconGit({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="18" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="18" r="2.5" stroke={color} strokeWidth="1.5" />
      <circle cx="16" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
      <line x1="16" y1="10.5" x2="16" y2="15.5" stroke={color} strokeWidth="1.5" />
      <path d="M8 15.5V14C8 12 10 10.5 13.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconUser({ size = 24, color = '#7A7A90' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
      <path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCodeBrackets({ size = 24, color = '#7A7A90' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4L4 7.5C3 8.5 3 9.5 4 10.5L7 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 4L20 7.5C21 8.5 21 9.5 20 10.5L17 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="17" x2="15" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="20" x2="17" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBuilding({ size = 24, color = '#7A7A90' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="16" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M3 6L12 2L21 6" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="7" y="10" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.2" />
      <rect x="14" y="10" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.2" />
      <rect x="10" y="17" width="4" height="5" rx="0.5" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function IconCrown({ size = 24, color = '#7A7A90' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="14" r="4" stroke={color} strokeWidth="1.5" />
      <path d="M5 22C5 19.2386 8.13401 17 12 17C15.866 17 19 19.2386 19 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 6L12 3L16 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconExpand({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="9" x2="12" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 4L21 3V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4L3 3V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 20L21 21V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 20L3 21V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconConstraint({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="3" width="2" height="18" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M14 7C17 5 20 7 20 10C20 13 17 15 14 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 12L20 14L18 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconParallel({ size = 24, color = MINT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 5L19 8L16 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 13L19 16L16 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="2" cy="8" r="1" fill={color} />
      <circle cx="2" cy="16" r="1" fill={color} />
    </svg>
  );
}

function IconCheck({ size = 16, color = MINT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="14" height="14" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDiamond({ size = 10, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="0.5" width="6.36" height="6.36" rx="1" transform="rotate(45 5 0.5)" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

/* ── FadeIn wrapper (reused from page) ──────────────────────────────── */
function FadeInLocal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Pipeline Arrow ──────────────────────────────────────────────────── */
function PipelineArrow({ label, vertical }: { label: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-1 py-1">
        <svg width="2" height="28" viewBox="0 0 2 28" fill="none">
          <line x1="1" y1="0" x2="1" y2="22" stroke={`${ACCENT}66`} strokeWidth="1.5" />
          <path d="M1 28L3.5 22H-1.5L1 28Z" fill={`${ACCENT}66`} />
        </svg>
        <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: '#6A6A80' }}>{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 px-1">
      <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
        <line x1="0" y1="6" x2="42" y2="6" stroke={`${ACCENT}55`} strokeWidth="1.5" />
        <path d="M48 6L42 9V3L48 6Z" fill={`${ACCENT}55`} />
      </svg>
      <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: '#6A6A80' }}>{label}</span>
    </div>
  );
}

/* ── Stage Carousel Card Data ────────────────────────────────────────── */
const STAGE_CARDS = [
  {
    num: '01',
    title: 'Figma Design',
    subtitle: 'The single source of truth',
    icon: <IconFigma size={32} color={ACCENT} />,
    body: 'Every screen, state, and edge case was designed in Figma before a single line of code was generated. Components were built with handoff in mind — named layers, consistent spacing tokens, explicit state variants. The design file wasn\'t a sketch. It was a spec.',
    details: [
      'Auto Layout used throughout — responsive behavior built into the design, not patched in code',
      'Component variants for every interactive state: default / hover / active / disabled / loading',
      'Spacing and color tokens named to match intended CSS variables',
    ],
    tags: ['Auto Layout', 'Component Variants', 'Token-Named Layers'],
    accentColor: ACCENT,
    extra: null as ReactNode,
  },
  {
    num: '02',
    title: 'Figma Make',
    subtitle: 'Design to React, without the translation tax',
    icon: <IconCode size={32} color={ACCENT} />,
    body: 'Figma Make converted the design directly into React component output. The goal wasn\'t perfection from the generator — it was a clean 80% baseline that reduced handoff ambiguity to near zero. What used to require a developer to interpret spacing, font weights, and breakpoints was now structural and explicit.',
    details: [],
    tags: ['Figma Make', 'React Output', 'Zero-Ambiguity Spec'],
    accentColor: ACCENT,
    extra: (
      <div className="rounded-lg p-4 mb-4" style={{ background: '#0E0E16', border: '1px solid #1E1E2E' }}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-3" style={{ color: '#6A6A80' }}>WHAT THIS ELIMINATED</div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-0 gap-y-1.5">
          <div className="font-['Cambay',sans-serif] text-[11px] tracking-[1px] pb-1" style={{ color: '#7A7A90' }}>BEFORE</div>
          <div />
          <div className="font-['Cambay',sans-serif] text-[11px] tracking-[1px] pb-1" style={{ color: '#7A7A90' }}>AFTER</div>
          {[
            ['Verbal spacing specs', 'Auto Layout → direct CSS flex'],
            ['Color hex in Zeplin', 'Token names in code output'],
            ['State interpretation', 'Variant props in component'],
            ['Breakpoint guessing', 'Responsive constraints baked in'],
          ].map(([before, after], i) => (
            <div key={i} className="contents">
              <span className="font-['Cambay',sans-serif] text-[13px] py-0.5" style={{ color: '#9A9AB0', textDecoration: 'line-through' }}>{before}</span>
              <div className="flex items-center justify-center px-3">
                <svg width="14" height="8" viewBox="0 0 14 8"><path d="M0 4h10M10 1l3 3-3 3" stroke={`${ACCENT}80`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              </div>
              <span className="font-['Cambay',sans-serif] text-[13px] py-0.5" style={{ color: MINT }}>{after}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '03',
    title: 'Codex — Build QA & Route Validation',
    subtitle: 'Ship what works. Catch what doesn\'t.',
    icon: <IconTerminal size={32} color={MINT} />,
    body: 'Figma Make gets you to a working build. Codex kept it honest. Before any push, every route was verified, every broken link surfaced, and every console error cleared. This wasn\'t a code review — it was a deployment checklist run by an AI that doesn\'t miss edge cases.',
    details: [],
    tags: ['Codex', 'Route QA', 'Pre-Deploy Check'],
    accentColor: MINT,
    extra: (
      <div className="rounded-lg p-4 mb-4" style={{ background: '#0A0E0D', border: '1px solid #1A2A25' }}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-3" style={{ color: '#6A6A80' }}>PRE-PUSH CHECKLIST</div>
        <div className="flex flex-col gap-2.5">
          {[
            { text: 'All navigation routes resolve — no 404s, no undefined paths', chip: 'VERIFIED' },
            { text: 'Console error log cleared — no failed imports, no missing dependencies', chip: 'CLEARED' },
            { text: 'Responsive breakpoints tested — mobile, tablet, desktop each render correctly', chip: 'TESTED' },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <IconCheck size={15} color={MINT} />
              <span className="font-['Cambay',sans-serif] text-[13px] leading-[1.5] flex-1" style={{ color: '#9A9AB0' }}>{row.text}</span>
              <span className="font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2 py-0.5 rounded-full shrink-0" style={{ border: `1px solid ${MINT}99`, color: `${MINT}99` }}>{row.chip}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '04',
    title: 'Git Push — From File to Live',
    subtitle: 'One command closes the loop',
    icon: <IconGit size={32} color={ACCENT} />,
    body: 'After Codex sign-off, deployment was a single git push. No manual FTP transfers. No staging environment confusion. No \'works on my machine\' conversations. The pipeline meant the deployed build matched what was designed — not an approximation of it.',
    details: [],
    tags: ['Git', 'CI/CD', 'Deployed Build'],
    accentColor: ACCENT,
    extra: (
      <>
        {/* Timeline */}
        <div className="relative flex items-center justify-between py-5 px-2 mb-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px" style={{ background: `${ACCENT}40` }} />
          {[
            { label: 'Design Final', color: ACCENT },
            { label: 'Make Output', color: ACCENT },
            { label: 'Codex Pass', color: ACCENT },
            { label: 'Pushed', color: MINT },
          ].map((m, i) => (
            <div key={m.label} className="relative z-10 flex flex-col items-center">
              {i === 3 && (
                <span className="font-['Cambay',sans-serif] text-[10px] absolute -top-5" style={{ color: '#6A6A80' }}>git push origin main</span>
              )}
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color, boxShadow: i === 3 ? `0 0 8px ${MINT}44` : undefined }} />
              <span className="font-['Cambay',sans-serif] text-[11px] mt-2 whitespace-nowrap" style={{ color: '#7A7A90' }}>{m.label}</span>
            </div>
          ))}
        </div>
        {/* Note */}
        <div className="rounded-lg p-3.5 mb-4" style={{ background: '#0E0E16', borderLeft: `3px solid ${MINT}` }}>
          <p className="font-['Cambay',sans-serif] text-[13px] italic leading-[1.6]" style={{ color: '#8A8AA0' }}>
            The portfolio you're reading right now went through this exact pipeline. The PlotSync prototype included.
          </p>
        </div>
      </>
    ),
  },
];

/* ── Auto-Switching Carousel ─────────────────────────────────────────── */
function StageCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = STAGE_CARDS.length;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive(p => (p + 1) % count);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, count]);

  const card = STAGE_CARDS[active];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#111118', border: '1px solid #222232' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tab bar */}
      <div className="flex border-b" style={{ borderColor: '#1E1E2E' }}>
        {STAGE_CARDS.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setActive(i)}
            className="flex-1 relative py-3.5 px-2 cursor-pointer transition-colors duration-200"
            style={{
              background: i === active ? '#16161F' : 'transparent',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="font-['Bebas_Neue',sans-serif] text-[14px]" style={{ color: i === active ? s.accentColor : '#4A4A60' }}>{s.num}</span>
              <span className="font-['Cambay',sans-serif] text-[12px] hidden sm:inline" style={{ color: i === active ? '#E8E8F0' : '#4A4A60' }}>{s.title.split('—')[0].trim()}</span>
            </div>
            {/* Progress bar */}
            {i === active && (
              <motion.div
                className="absolute bottom-0 left-0 h-[2px]"
                style={{ background: s.accentColor }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: paused ? 99999 : 6, ease: 'linear' }}
                key={`progress-${i}-${paused}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Card content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: icon + number */}
            <div className="flex md:flex-col items-center gap-3 md:gap-2 shrink-0 md:w-[72px]">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${card.accentColor}10`, border: `1px solid ${card.accentColor}25` }}>
                {card.icon}
              </div>
            </div>
            {/* Separator */}
            <div className="hidden md:block w-px self-stretch" style={{ background: '#1E1E2E' }} />
            {/* Right: content */}
            <div className="flex-1 min-w-0">
              <div className="font-['Cambay',sans-serif] text-[20px] text-white/90 mb-1" style={{ fontWeight: 700 }}>{card.title}</div>
              <div className="font-['Cambay',sans-serif] text-[14px] italic mb-4" style={{ color: '#9A9AB0' }}>{card.subtitle}</div>
              <p className="font-['Cambay',sans-serif] text-[15px] leading-[1.7] mb-4" style={{ color: '#9A9AB0' }}>{card.body}</p>
              
              {/* Detail items */}
              {card.details.length > 0 && (
                <div className="flex flex-col gap-2.5 mb-4">
                  {card.details.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-1.5"><IconDiamond size={8} color={card.accentColor} /></div>
                      <span className="font-['Cambay',sans-serif] text-[14px] leading-[1.6]" style={{ color: '#8A8AA0' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Extra content */}
              {card.extra}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 justify-end mt-2">
                {card.tags.map(t => (
                  <span key={t} className="font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${card.accentColor}55`, color: `${card.accentColor}aa` }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════ */

export function PlotSyncHandoffSection() {
  return (
    <div>
      {/* ── Section Opener ────────────────────────────────────────── */}
      <FadeInLocal>
        <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[0.1em] mb-3" style={{ color: ACCENT, textTransform: 'uppercase' as const }}>
          09 — THE HANDOFF
        </div>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[36px] sm:text-[44px] text-white/95 tracking-[1px] leading-[1.05] mb-4">
          Collaboration & Design Handoff
        </h2>
        <p className="font-['Caladea',serif] text-[16px] sm:text-[18px] italic leading-[1.7] mb-6" style={{ color: '#9A9AB0', maxWidth: 680 }}>
          This wasn't thrown over a wall. The design file was the source of truth — and the pipeline kept it that way from first frame to deployed build.
        </p>
        <div className="w-full h-px mb-3" style={{ background: '#222232' }} />
        <p className="font-['Cambay',sans-serif] text-[12px] mb-10" style={{ color: '#6A6A80' }}>
          Solo designer. Collaborative pipeline. Figma → Figma Make → Codex → Git.
        </p>
      </FadeInLocal>

      {/* ── BLOCK 1 — PIPELINE DIAGRAM ────────────────────────────── */}
      <FadeInLocal delay={0.08}>
        <div className="rounded-xl mb-8" style={{ background: '#0D0D15', border: '1px solid #222232', padding: '32px 40px' }}>
          <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] mb-6" style={{ color: '#6A6A80' }}>
            END-TO-END PIPELINE
          </div>

          {/* Desktop pipeline */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Node 1 */}
            <div className="flex flex-col items-center text-center rounded-xl px-5 py-4 flex-1 max-w-[170px]" style={{ background: '#16161F', border: `1px solid ${ACCENT}30` }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${ACCENT}0a` }}>
                <IconFigma size={24} color={ACCENT} />
              </div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Figma</div>
              <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Design & Components</div>
            </div>
            <PipelineArrow label="auto-generate" />
            {/* Node 2 */}
            <div className="flex flex-col items-center text-center rounded-xl px-5 py-4 flex-1 max-w-[170px]" style={{ background: '#16161F', border: `1px solid ${ACCENT}30` }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${ACCENT}0a` }}>
                <IconCode size={24} color={ACCENT} />
              </div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Figma Make</div>
              <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Code Generation</div>
            </div>
            <PipelineArrow label="deploy prep" />
            {/* Node 3 */}
            <div className="flex flex-col items-center text-center rounded-xl px-5 py-4 flex-1 max-w-[170px]" style={{ background: '#16161F', border: `1px solid ${MINT}30` }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${MINT}08` }}>
                <IconTerminal size={24} color={MINT} />
              </div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Codex</div>
              <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>QA & Route Check</div>
            </div>
            <PipelineArrow label="git push" />
            {/* Node 4 */}
            <div className="relative flex flex-col items-center text-center rounded-xl px-5 py-4 flex-1 max-w-[170px]" style={{ background: '#0F1A14', border: `1px solid ${MINT}50` }}>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: MINT, boxShadow: `0 0 6px ${MINT}66` }} />
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${MINT}0a` }}>
                <IconGlobe size={24} color={MINT} />
              </div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Live Build</div>
              <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Deployed</div>
            </div>
          </div>

          {/* Mobile pipeline (vertical) */}
          <div className="flex lg:hidden flex-col items-center gap-0">
            <div className="flex items-center gap-4 w-full rounded-xl px-5 py-4" style={{ background: '#16161F', border: `1px solid ${ACCENT}30` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}0a` }}><IconFigma size={22} color={ACCENT} /></div>
              <div><div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Figma</div><div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Design & Components</div></div>
            </div>
            <PipelineArrow label="auto-generate" vertical />
            <div className="flex items-center gap-4 w-full rounded-xl px-5 py-4" style={{ background: '#16161F', border: `1px solid ${ACCENT}30` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}0a` }}><IconCode size={22} color={ACCENT} /></div>
              <div><div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Figma Make</div><div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Code Generation</div></div>
            </div>
            <PipelineArrow label="deploy prep" vertical />
            <div className="flex items-center gap-4 w-full rounded-xl px-5 py-4" style={{ background: '#16161F', border: `1px solid ${MINT}30` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${MINT}08` }}><IconTerminal size={22} color={MINT} /></div>
              <div><div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Codex</div><div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>QA & Route Check</div></div>
            </div>
            <PipelineArrow label="git push" vertical />
            <div className="relative flex items-center gap-4 w-full rounded-xl px-5 py-4" style={{ background: '#0F1A14', border: `1px solid ${MINT}50` }}>
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: MINT, boxShadow: `0 0 6px ${MINT}66` }} />
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${MINT}0a` }}><IconGlobe size={22} color={MINT} /></div>
              <div><div className="font-['Cambay',sans-serif] text-[14px] text-white/90" style={{ fontWeight: 700 }}>Live Build</div><div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>Deployed</div></div>
            </div>
          </div>

          {/* Annotations */}
          <div className="w-full h-px my-5" style={{ background: '#1E1E2E' }} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              'Components translated to clean React output with minimal override',
              'All routes, broken links, and console errors resolved before push',
              'One command. No FTP. No manual deploy steps.',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 mt-1"><circle cx="5" cy="5" r="2" fill={i === 2 ? `${MINT}55` : `${ACCENT}44`} /></svg>
                <span className="font-['Cambay',sans-serif] text-[12px]" style={{ color: '#6A6A80' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeInLocal>

      {/* ── BLOCK 2 — STAGE CAROUSEL ──────────────────────────────── */}
      <FadeInLocal delay={0.1}>
        <div className="mb-8">
          <StageCarousel />
        </div>
      </FadeInLocal>

      {/* ── BLOCK 3 — WHAT THIS PIPELINE MEANS ───────────────────── */}
      <FadeInLocal delay={0.1}>
        <div className="rounded-xl mb-8" style={{ background: '#0E0E16', border: '1px solid #222232', padding: '32px 40px' }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left */}
            <div className="flex-1">
              <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] mb-4" style={{ color: `${ACCENT}88` }}>
                WHY THIS MATTERS FOR PRODUCT TEAMS
              </div>
              <p className="font-['Cambay',sans-serif] text-[18px] text-white/90 leading-[1.5] mb-5" style={{ fontWeight: 500 }}>
                A designer who can own the handoff pipeline isn't just faster. They remove an entire category of misalignment from the team.
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  'Engineers receive components, not comp files — structural output, not visual reference.',
                  'Reviewers see the actual deployed build, not a prototype — no fidelity gap between what was shown and what shipped.',
                  'Iteration cycles compress — a design change propagates through Make into a new build without a handoff meeting.',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="shrink-0 mt-1.5"><IconDiamond size={8} color={ACCENT} /></div>
                    <span className="font-['Cambay',sans-serif] text-[14px] leading-[1.6]" style={{ color: '#9A9AB0' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Divider */}
            <div className="hidden lg:block w-px self-stretch" style={{ background: '#1E1E2E' }} />
            {/* Right */}
            <div className="flex-1">
              <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] mb-4" style={{ color: '#6A6A80' }}>
                PIPELINE BUILT WITH
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Figma', role: 'Design & component system', icon: <IconFigma size={22} color={ACCENT} /> },
                  { name: 'Figma Make', role: 'React code generation', icon: <IconCode size={22} color={ACCENT} /> },
                  { name: 'Codex', role: 'QA, routes, build validation', icon: <IconTerminal size={22} color={MINT} /> },
                  { name: 'Git', role: 'Version control & deployment', icon: <IconGit size={22} color={ACCENT} /> },
                ].map(tool => (
                  <div key={tool.name} className="rounded-lg p-3.5" style={{ background: '#16161F', border: '1px solid #2A2A3A' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: '#1E1E28' }}>
                      {tool.icon}
                    </div>
                    <div className="font-['Cambay',sans-serif] text-[14px] text-white/85" style={{ fontWeight: 700 }}>{tool.name}</div>
                    <div className="font-['Cambay',sans-serif] text-[12px]" style={{ color: '#7A7A90' }}>{tool.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeInLocal>

      {/* ── BLOCK 4 — PULL QUOTE ──────────────────────────────────── */}
      <FadeInLocal delay={0.1}>
        <div className="py-6 mb-6" style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: 20, marginLeft: 4 }}>
          <p className="font-['Caladea',serif] text-[18px] sm:text-[20px] italic leading-[1.7]" style={{ color: '#C8C8D8' }}>
            "The handoff isn't the end of design. It's proof that the design was real enough to survive contact with a browser."
          </p>
          <span className="font-['Cambay',sans-serif] text-[12px] mt-2.5 inline-block" style={{ color: '#6A6A80' }}>
            — Design process note, PlotSync AI
          </span>
        </div>
      </FadeInLocal>

      {/* ── STAT ROW ──────────────────────────────────────────────── */}
      <div className="w-full h-px mb-8" style={{ background: '#1E1E2E' }} />
      <FadeInLocal delay={0.1}>
        <div className="flex items-center justify-center py-4 mb-12">
          {[
            { value: '4', label: 'Pipeline stages', sub: 'from design to deploy' },
            { value: '0', label: 'Handoff meetings', sub: 'required' },
            { value: '1', label: 'Deployed build', sub: 'matches the design file' },
          ].map((stat, i) => (
            <div key={stat.value + stat.label} className="contents">
              {i > 0 && <div className="w-px h-16 mx-4 sm:mx-8" style={{ background: '#222232' }} />}
              <div className="text-center flex-1">
                <div className="font-['Bebas_Neue',sans-serif] text-[40px] text-white/90 leading-none mb-1">{stat.value}</div>
                <div className="font-['Cambay',sans-serif] text-[12px] tracking-[1px]" style={{ color: '#7A7A90', textTransform: 'uppercase' as const }}>{stat.label}<br />{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </FadeInLocal>

      {/* ════════════════════════════════════════════════════════════════
          IMPLEMENTATION & COLLABORATION (moved below)
         ════════════════════════════════════════════════════════════════ */}

      <div className="w-full h-px mb-3" style={{ background: '#222232' }} />
      <div className="text-center py-3 mb-8">
        <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px]" style={{ color: '#6A6A80', textTransform: 'uppercase' as const }}>
          THE PEOPLE IN THE ROOM
        </span>
      </div>

      <FadeInLocal delay={0.08}>
        <div className="rounded-xl" style={{ background: '#111118', border: '1px solid #222232', padding: '32px 40px' }}>
          {/* ROW A: Roles */}
          <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] mb-5" style={{ color: `${ACCENT}88` }}>
            CROSS-FUNCTIONAL TEAM
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0">
            {[
              { icon: <IconUser size={24} color="#7A7A90" />, role: 'Product Designer', sub: 'You — sole designer' },
              { icon: <IconCodeBrackets size={24} color="#7A7A90" />, role: 'Frontend Engineer', sub: 'React Native + Web' },
              { icon: <IconBuilding size={24} color="#7A7A90" />, role: 'Domain Stakeholders', sub: 'Real estate ops & sales' },
              { icon: <IconCrown size={24} color="#7A7A90" />, role: 'Senior Management', sub: '5 executive interviews' },
            ].map((chip, i, arr) => (
              <div key={chip.role} className="contents">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: '#16161F', border: '1px solid #2A2A3A' }}>
                    {chip.icon}
                  </div>
                  <div className="font-['Cambay',sans-serif] text-[13px] text-white/85" style={{ fontWeight: 700 }}>{chip.role}</div>
                  <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#7A7A90' }}>{chip.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block w-px h-10 shrink-0" style={{ background: '#2A2A3A' }} />
                )}
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="w-full h-px my-6" style={{ background: '#1E1E2E' }} />

          {/* ROW B: Collaboration */}
          <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] mb-5" style={{ color: '#6A6A80', textTransform: 'uppercase' as const }}>
            WHERE COLLABORATION ACTUALLY HAPPENED
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Card A */}
            <div className="rounded-lg p-5" style={{ background: '#0E0E16', border: '1px solid #1E1E2E' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
                <IconExpand size={20} color={`${ACCENT}99`} />
              </div>
              <div className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] mb-2" style={{ color: '#6A6A80' }}>SCOPE EXPANSION</div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/85 mb-2" style={{ fontWeight: 700 }}>Manager Mode Wasn't in the Brief</div>
              <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: '#9A9AB0' }}>
                Five stakeholder interviews surfaced a visibility gap that the original scope hadn't accounted for. The decision to add a dedicated manager surface was made collaboratively — research evidence, not designer preference, drove the expansion.
              </p>
              <span className="inline-block font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${ACCENT}66`, color: `${ACCENT}aa` }}>
                RESEARCH-DRIVEN SCOPE CHANGE
              </span>
            </div>

            {/* Card B */}
            <div className="rounded-lg p-5" style={{ background: '#0E0E16', border: '1px solid #1E1E2E' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}18` }}>
                <IconConstraint size={20} color={`${ACCENT}99`} />
              </div>
              <div className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] mb-2" style={{ color: '#6A6A80' }}>ENGINEERING CONSTRAINT ABSORBED</div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/85 mb-2" style={{ fontWeight: 700 }}>The Offline Requirement Changed the Architecture</div>
              <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: '#9A9AB0' }}>
                The frontend engineer flagged early that true offline capability required a local queue system the initial designs hadn't accounted for. The sync-state indicator and queue visibility UI came directly from that engineering conversation — not a design decision made in isolation.
              </p>
              <span className="inline-block font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${ACCENT}66`, color: `${ACCENT}aa` }}>
                ENGINEERING FEEDBACK → DESIGN CHANGE
              </span>
            </div>

            {/* Card C */}
            <div className="rounded-lg p-5" style={{ background: '#0E0E16', border: '1px solid #1E1E2E' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${MINT}08`, border: `1px solid ${MINT}18` }}>
                <IconParallel size={20} color={`${MINT}99`} />
              </div>
              <div className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] mb-2" style={{ color: '#6A6A80' }}>PIPELINE AS FRICTION REDUCER</div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/85 mb-2" style={{ fontWeight: 700 }}>The Pipeline Removed Me as a Bottleneck</div>
              <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: '#9A9AB0' }}>
                By owning the Figma → Make → Codex → Git pipeline, implementation questions that would normally require designer involvement — spacing edge cases, state behavior, responsive breakpoints — were resolved before they reached the engineering conversation. Collaboration improved because fewer interruptions were needed.
              </p>
              <span className="inline-block font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${MINT}55`, color: `${MINT}99` }}>
                PIPELINE REDUCED HANDOFF FRICTION
              </span>
            </div>
          </div>

          {/* ROW C: Quote */}
          <div className="w-full h-px mt-6" style={{ background: '#1E1E2E' }} />
          <div className="mt-5" style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: 20 }}>
            <p className="font-['Caladea',serif] text-[18px] italic leading-[1.7]" style={{ color: '#C8C8D8' }}>
              "Working solo doesn't mean working in isolation. Every constraint that shaped this system came from a conversation — with an agent in the field, an engineer in a call, or a manager in an interview."
            </p>
          </div>
        </div>
      </FadeInLocal>
    </div>
  );
}
