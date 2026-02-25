import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import legacyScreenshot from 'figma:asset/1a549153a3b3d53642b959bd67aae532cac85dad.png';

/* ═══════════════════════════════════════════════════════════════════════
   LEGACY UI DOODLE — "Before State"
   ──────────────────────────────────
   Actual legacy CPQ screenshot — large, centered, prominent.
   Only 2–3 light annotations on the image itself.
   All detailed critique lives in cards below.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Palette ──────────────────────────────────────────────────── */
const PAPER       = '#FBF8F3';
const PAPER_LINES = '#EDE8DF';
const PENCIL      = '#3D3A36';
const PENCIL_LIGHT = '#8A857C';
const PENCIL_FAINT = '#C4BFB5';
const INK_RED     = '#B84233';
const INK_BLUE    = '#2D5F8A';

/* ── Seeded random ───────────────────────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ── Sketch primitives ───────────────────────────────────────── */
function wobbleLine(x1: number, y1: number, x2: number, y2: number, seed: number, w = 1.5): string {
  const r = seededRand(seed);
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const segs = Math.max(3, Math.floor(len / 12));
  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const end = i === segs;
    d += ` L ${(x1 + dx * t + (end ? 0 : (r() - 0.5) * w)).toFixed(1)} ${(y1 + dy * t + (end ? 0 : (r() - 0.5) * w)).toFixed(1)}`;
  }
  return d;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function LegacyUIDoodle() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealed(true); },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  /* Stable corner marks */
  const corners = useMemo(() => ({
    tl: [wobbleLine(0, 14, 0, 0, 7500), wobbleLine(0, 0, 14, 0, 7501)].join(' '),
    tr: [wobbleLine(-14, 0, 0, 0, 7510), wobbleLine(0, 0, 0, 14, 7511)].join(' '),
    bl: [wobbleLine(0, -14, 0, 0, 7520), wobbleLine(0, 0, 14, 0, 7521)].join(' '),
    br: [wobbleLine(-14, 0, 0, 0, 7530), wobbleLine(0, -14, 0, 0, 7531)].join(' '),
  }), []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: PAPER,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 0 60px rgba(0,0,0,0.015)',
      }}
    >
      {/* ── Tape strips ── */}
      <div className="absolute top-0 left-8 w-16 h-4 rounded-b-sm opacity-35 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.5), rgba(252,211,77,0.15))' }} />
      <div className="absolute top-0 right-12 w-12 h-3.5 rounded-b-sm opacity-25 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.4), rgba(252,211,77,0.1))' }} />

      {/* ── Faint ruled lines ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.25 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="w-full h-px absolute" style={{ top: 24 + i * 22, background: PAPER_LINES }} />
        ))}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: 42, background: 'rgba(220,100,100,0.10)' }} />
      </div>

      {/* ── Header ── */}
      <div className="relative px-6 pt-4 pb-2.5" style={{ borderBottom: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span style={{ fontSize: 14 }}>🖥️</span>
          <h3 className="font-['Cambay',sans-serif] text-[15px]" style={{ color: PENCIL }}>
            The Before State — Legacy CPQ Interface
          </h3>
        </div>
        <p className="font-['Cambay',sans-serif] text-[12px]" style={{ color: PENCIL_LIGHT }}>
          Actual production screenshot · BOSS CPQ Enterprise Sales · annotated with design critique
        </p>
      </div>

      {/* ── Main content — screenshot centered + cards below ── */}
      <div className="relative px-6 pt-6 pb-4">

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CENTERED SCREENSHOT — full width, prominent                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative mx-auto"
          style={{ maxWidth: 720 }}
          initial={{ opacity: 0, y: 14 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Paper photo frame */}
          <div className="relative" style={{ transform: 'rotate(-0.3deg)' }}>
            {/* Shadow */}
            <div
              className="absolute -inset-3 rounded-xl -z-10"
              style={{ boxShadow: '0 6px 32px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)' }}
            />

            {/* Screenshot image */}
            <div className="relative rounded-lg overflow-hidden" style={{ border: `2px solid ${PAPER_LINES}` }}>
              <img
                src={legacyScreenshot}
                alt="Legacy BOSS CPQ Enterprise Sales interface — Sites tab with 20+ form fields"
                className="w-full h-auto block"
                style={{ filter: 'saturate(0.85) contrast(1.05)' }}
              />

              {/* Subtle red vignette to signal "problem" */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(184,66,51,0.04) 100%)' }}
              />
            </div>

            {/* Hand-drawn corner marks */}
            <svg className="absolute -top-1.5 -left-1.5 w-5 h-5 pointer-events-none" viewBox="-1 -1 16 16">
              <path d={corners.tl} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
            </svg>
            <svg className="absolute -top-1.5 -right-1.5 w-5 h-5 pointer-events-none" viewBox="-15 -1 16 16">
              <path d={corners.tr} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
            </svg>
            <svg className="absolute -bottom-1.5 -left-1.5 w-5 h-5 pointer-events-none" viewBox="-1 -15 16 16">
              <path d={corners.bl} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
            </svg>
            <svg className="absolute -bottom-1.5 -right-1.5 w-5 h-5 pointer-events-none" viewBox="-15 -15 16 16">
              <path d={corners.br} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
            </svg>

            {/* ── Only 3 lightweight callouts ON the image ── */}

            {/* Callout 1 — Tab bar (top-left area) */}
            <motion.div
              className="absolute z-20 pointer-events-none"
              style={{ top: '-8px', left: '3%' }}
              initial={{ opacity: 0, y: 6 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(184,66,51,0.85)', boxShadow: '0 2px 8px rgba(184,66,51,0.25)' }}>
                <span className="font-['Cambay',sans-serif] text-[10px] text-white" style={{ fontWeight: 700 }}>7 tabs — all visible at once</span>
              </div>
            </motion.div>

            {/* Callout 2 — Form density (center-left) */}
            <motion.div
              className="absolute z-20 pointer-events-none"
              style={{ top: '42%', left: '2%' }}
              initial={{ opacity: 0, x: -8 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(184,66,51,0.85)', boxShadow: '0 2px 8px rgba(184,66,51,0.25)' }}>
                <span className="font-['Cambay',sans-serif] text-[10px] text-white" style={{ fontWeight: 700 }}>20+ fields — zero hierarchy</span>
              </div>
            </motion.div>

            {/* Callout 3 — Irrelevant fields (right side) */}
            <motion.div
              className="absolute z-20 pointer-events-none"
              style={{ top: '22%', right: '2%' }}
              initial={{ opacity: 0, x: 8 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(184,66,51,0.85)', boxShadow: '0 2px 8px rgba(184,66,51,0.25)' }}>
                <span className="font-['Cambay',sans-serif] text-[10px] text-white" style={{ fontWeight: 700 }}>Irrelevant fields mixed in</span>
              </div>
            </motion.div>
          </div>

          {/* ── Caption ── */}
          <motion.div
            className="mt-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
            <span className="font-['Cambay',sans-serif] text-[11px] italic shrink-0" style={{ color: INK_BLUE, opacity: 0.6 }}>
              ✏️ BOSS CPQ · Enterprise Sales · QUO00012658 — actual production UI
            </span>
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SPECIFICATION CARDS — 3 columns below screenshot           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6"
          initial={{ opacity: 0, y: 12 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Card 1 — Usability Audit */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(184,66,51,0.06)', border: `1px dashed rgba(184,66,51,0.15)`, transform: 'rotate(-0.3deg)' }}>
            <div className="font-['Cambay',sans-serif] text-[11px] mb-3" style={{ color: INK_RED, letterSpacing: '0.5px', fontWeight: 700 }}>✕ USABILITY AUDIT</div>
            {[
              { metric: '7', desc: 'navigation tabs — all visible, no contextual grouping' },
              { metric: '20+', desc: 'form fields exposed — zero hierarchy or visual weight' },
              { metric: '0', desc: 'inline validation — errors found 3–5 days downstream' },
              { metric: '0', desc: 'progressive disclosure — every integration surface exposed' },
              { metric: '0', desc: 'draft or undo — navigate away = lose your work' },
              { metric: '2', desc: 'actions available — only Save & Cancel Quote' },
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-2 mb-2 last:mb-0">
                <span className="font-['Cambay',sans-serif] text-[15px] shrink-0" style={{ color: INK_RED, fontWeight: 700 }}>{item.metric}</span>
                <span className="font-['Cambay',sans-serif] text-[11px] leading-[1.5]" style={{ color: PENCIL }}>{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Card 2 — Cognitive Load */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(252,211,77,0.12)', border: `1px dashed rgba(252,211,77,0.3)`, transform: 'rotate(0.4deg)' }}>
            <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: '#78350F', letterSpacing: '0.5px', fontWeight: 700 }}>🔥 COGNITIVE LOAD</div>
            <div className="font-['Cambay',sans-serif] text-[12px] leading-[1.6] mb-3" style={{ color: '#78350F' }}>
              Every field, tab, and pricing value is visible simultaneously — demanding <strong>100% cognitive processing</strong> upfront with no guidance on where to start.
            </div>
            {/* Load bar */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-['Cambay',sans-serif] text-[10px] shrink-0" style={{ color: '#78350F' }}>Load:</span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${INK_RED}, #D4553F)` }}
                  initial={{ width: 0 }}
                  animate={revealed ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: INK_RED, fontWeight: 700 }}>100%</span>
            </div>
            <div className="pt-2.5" style={{ borderTop: `1px dashed rgba(120,53,15,0.15)` }}>
              <div className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: '#78350F', opacity: 0.7 }}>
                ✏️ "Users reported form fatigue within 30 seconds of opening any quote."
              </div>
            </div>
          </div>

          {/* Card 3 — User Impact */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.02)', border: `1px solid ${PAPER_LINES}`, transform: 'rotate(-0.5deg)' }}>
            <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px', fontWeight: 700 }}>😰 USER IMPACT</div>
            {[
              { issue: 'Decision paralysis', detail: 'Too many inputs with no clear starting point' },
              { issue: 'No feedback loops', detail: 'Configuration errors discovered only at approval stage' },
              { issue: 'Rework cycles on 40% of quotes', detail: 'Pricing and config had to be regenerated from scratch' },
              { issue: 'Escalation dependency', detail: 'Agents escalated to supervisors for basic configuration tasks' },
              { issue: 'Lost work', detail: 'No state persistence — navigating away meant starting over' },
            ].map((item, i) => (
              <div key={i} className="mb-2.5 last:mb-0">
                <div className="font-['Cambay',sans-serif] text-[12px]" style={{ color: INK_RED, fontWeight: 700 }}>{item.issue}</div>
                <div className="font-['Cambay',sans-serif] text-[11px] leading-[1.5]" style={{ color: PENCIL_LIGHT }}>{item.detail}</div>
              </div>
            ))}
            <div className="mt-3 pt-2" style={{ borderTop: `1px dashed ${PAPER_LINES}` }}>
              <div className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: PENCIL_FAINT }}>
                ✏️ "The interface made experts feel like beginners."
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: INK_RED, opacity: 0.5 }} />
          <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: PENCIL_FAINT }}>
            7 tabs · 20+ fields · 0 validation · 0 progressive disclosure — legacy before state
          </span>
        </div>
        <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT, opacity: 0.5 }}>
          annotated production screenshot
        </span>
      </div>
    </div>
  );
}