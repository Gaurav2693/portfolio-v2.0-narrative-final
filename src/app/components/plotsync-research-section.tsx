import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import {
  SectionHeading, FadeIn, NarrativeQuote,
} from './case-study';

/* ═══════════════════════════════════════════════════════════════════════
   PLOTSYNC — 03 THE RESEARCH  (Research & Discovery section)
   ─────────────────────────────────────────────────────────────────────
   5 phases. Inserted between "Mental Model & Strategy" and "Wireframes".
   Doodle boards use the warm-paper whiteboard aesthetic from CPQ doodles.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Page-level dark palette (section structure) ──────────────────── */
const ACCENT = '#E8552D';
const ACCENT_2 = '#40F0AA';
const CARD_BG = '#111118';
const BORDER = '#222232';
const MUTED = '#7A7A90';
const BODY_TEXT = '#9A9AB0';

/* ── Paper doodle palette (matches CPQ journey-map / legacy-ui) ───── */
const PAPER       = '#FBF8F3';
const PAPER_LINES = '#EDE8DF';
const PENCIL      = '#3D3A36';
const PENCIL_LIGHT = '#8A857C';
const PENCIL_FAINT = '#C4BFB5';
const INK_RED     = '#B84233';
const INK_BLUE    = '#2D5F8A';
const HIGHLIGHT_Y = 'rgba(252,211,77,0.35)';
const HIGHLIGHT_R = 'rgba(184,66,51,0.06)';
const HIGHLIGHT_B = 'rgba(45,95,138,0.06)';

/* ── Seeded random (no re-render jitter) ──────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ── Sketch primitives ────────────────────────────────────────────── */
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

function sketchRect(x: number, y: number, w: number, h: number, seed: number, wobble = 1.0): string {
  return [
    wobbleLine(x, y, x + w, y, seed, wobble),
    wobbleLine(x + w, y, x + w, y + h, seed + 100, wobble),
    wobbleLine(x + w, y + h, x, y + h, seed + 200, wobble),
    wobbleLine(x, y + h, x, y, seed + 300, wobble),
  ].join(' ');
}

function sketchArrow(x1: number, y1: number, x2: number, y2: number, seed: number, curve = 0): string {
  const r = seededRand(seed);
  const mx = (x1 + x2) / 2 + (r() - 0.5) * 3;
  const my = (y1 + y2) / 2 + curve + (r() - 0.5) * 2;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  const a = Math.atan2(y2 - my, x2 - mx);
  const hl = 6;
  return `${d} M ${(x2 - Math.cos(a - 0.45) * hl).toFixed(1)} ${(y2 - Math.sin(a - 0.45) * hl).toFixed(1)} L ${x2} ${y2} L ${(x2 - Math.cos(a + 0.45) * hl).toFixed(1)} ${(y2 - Math.sin(a + 0.45) * hl).toFixed(1)}`;
}

/* ── Tiny section-level helpers ────────────────────────────────────── */

function PhaseLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[5px] mb-3"
      style={{ color: ACCENT }}
    >
      {children}
    </div>
  );
}

function PhaseTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-['Bebas_Neue',sans-serif] text-[30px] sm:text-[36px] text-white/95 tracking-[1px] leading-[1.1] mb-4">
      {children}
    </h3>
  );
}

function BodyCopy({ children }: { children: ReactNode }) {
  return (
    <p className="font-['Cambay',sans-serif] text-[15px] sm:text-[16px] leading-[1.7] mb-6" style={{ color: BODY_TEXT }}>
      {children}
    </p>
  );
}

function TagChip({ children, color = ACCENT }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-block font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full"
      style={{ border: `1px solid ${color}55`, color: `${color}cc` }}
    >
      {children}
    </span>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="font-['Bebas_Neue',sans-serif] text-[36px] sm:text-[42px] text-white/90 tracking-[1px] leading-none mb-1">
        {value}
      </div>
      <div className="font-['Cambay',sans-serif] text-[11px] tracking-[1px] uppercase" style={{ color: MUTED }}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAPER FINDING BOARD — warm paper artifact (matches CPQ doodles)
   ═══════════════════════════════════════════════════════════════════════ */

interface PaperFinding {
  emoji: string;
  title: string;
  body: string;
  tag: string;
  tagColor: 'red' | 'blue' | 'amber';
  rotate: number;
}

const TAG_STYLES = {
  red:   { bg: HIGHLIGHT_R, color: INK_RED, border: 'rgba(184,66,51,0.20)' },
  blue:  { bg: HIGHLIGHT_B, color: INK_BLUE, border: 'rgba(45,95,138,0.20)' },
  amber: { bg: HIGHLIGHT_Y, color: '#78350F', border: 'rgba(252,211,77,0.40)' },
};

function PaperFindingBoard({
  emoji,
  title,
  subtitle,
  findings,
  connectors,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  findings: PaperFinding[];
  connectors?: { from: number; to: number; label: string }[];
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealed(true); },
      { threshold: 0.08 },
    );
    if (boardRef.current) obs.observe(boardRef.current);
    return () => obs.disconnect();
  }, []);

  /* Stable sketch paths */
  const paths = useMemo(() => {
    const p: Record<string, string> = {};
    findings.forEach((_, i) => {
      p[`card_${i}`] = sketchRect(0, 0, 260, 160, 8000 + i * 137, 0.8);
    });
    /* Corner marks for the board */
    p.tl = [wobbleLine(0, 14, 0, 0, 7500), wobbleLine(0, 0, 14, 0, 7501)].join(' ');
    p.tr = [wobbleLine(-14, 0, 0, 0, 7510), wobbleLine(0, 0, 0, 14, 7511)].join(' ');
    p.bl = [wobbleLine(0, -14, 0, 0, 7520), wobbleLine(0, 0, 14, 0, 7521)].join(' ');
    p.br = [wobbleLine(-14, 0, 0, 0, 7530), wobbleLine(0, -14, 0, 0, 7531)].join(' ');
    /* Connector arrows */
    connectors?.forEach((c, i) => {
      p[`conn_${i}`] = sketchArrow(0, 0, 80, 40, 9000 + i * 73, -12);
    });
    return p;
  }, [findings.length, connectors?.length]);

  return (
    <div
      ref={boardRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: PAPER,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 0 60px rgba(0,0,0,0.015)',
      }}
    >
      {/* Tape strips */}
      <div className="absolute top-0 left-8 w-16 h-4 rounded-b-sm opacity-35 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.5), rgba(252,211,77,0.15))' }} />
      <div className="absolute top-0 right-12 w-12 h-3.5 rounded-b-sm opacity-25 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.4), rgba(252,211,77,0.1))' }} />

      {/* Ruled lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.25 }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="w-full h-px absolute" style={{ top: 24 + i * 22, background: PAPER_LINES }} />
        ))}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: 42, background: 'rgba(220,100,100,0.10)' }} />
      </div>

      {/* Corner marks */}
      <svg className="absolute -top-0.5 -left-0.5 w-5 h-5 pointer-events-none z-10" viewBox="-1 -1 16 16">
        <path d={paths.tl} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
      </svg>
      <svg className="absolute -top-0.5 -right-0.5 w-5 h-5 pointer-events-none z-10" viewBox="-15 -1 16 16">
        <path d={paths.tr} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
      </svg>
      <svg className="absolute -bottom-0.5 -left-0.5 w-5 h-5 pointer-events-none z-10" viewBox="-1 -15 16 16">
        <path d={paths.bl} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
      </svg>
      <svg className="absolute -bottom-0.5 -right-0.5 w-5 h-5 pointer-events-none z-10" viewBox="-15 -15 16 16">
        <path d={paths.br} fill="none" stroke={PENCIL_FAINT} strokeWidth="1.2" />
      </svg>

      {/* Header */}
      <div className="relative px-6 pt-4 pb-2.5" style={{ borderBottom: `1px solid ${PAPER_LINES}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{emoji}</span>
          <span className="font-['Cambay',sans-serif]" style={{ fontSize: 15, lineHeight: 1, color: PENCIL, fontWeight: 500 }}>
            {title}
          </span>
        </div>
        <p className="font-['Cambay',sans-serif]" style={{ fontSize: 12, lineHeight: 1.4, color: PENCIL_LIGHT, marginTop: 6, marginLeft: 26 }}>
          {subtitle}
        </p>
      </div>

      {/* Card grid */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {findings.map((f, i) => {
            const ts = TAG_STYLES[f.tagColor];
            return (
              <motion.div
                key={f.title}
                className="relative rounded-xl p-4"
                style={{
                  background: 'rgba(0,0,0,0.01)',
                  border: `1px solid ${PAPER_LINES}`,
                  transform: `rotate(${f.rotate}deg)`,
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Sketch rect overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 160" preserveAspectRatio="none">
                  <path d={paths[`card_${i}`]} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.5" opacity="0.35" />
                </svg>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{f.emoji}</span>
                  <span className="font-['Cambay',sans-serif]" style={{ fontSize: 13, lineHeight: 1.3, color: PENCIL, fontWeight: 700 }}>
                    {f.title}
                  </span>
                </div>
                <p className="font-['Cambay',sans-serif] text-[12px] leading-[1.6] mb-3" style={{ color: PENCIL_LIGHT }}>
                  {f.body}
                </p>
                <span
                  className="inline-block font-['Cambay',sans-serif] text-[9px] tracking-[0.5px] px-2 py-0.5 rounded"
                  style={{ background: ts.bg, color: ts.color, border: `1px dashed ${ts.border}`, fontWeight: 700, letterSpacing: '0.5px' }}
                >
                  {f.tag}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Hand-drawn connector annotations (desktop only) */}
        {connectors && connectors.length > 0 && (
          <motion.div
            className="hidden sm:block mt-4 pt-3"
            style={{ borderTop: `1px dashed ${PAPER_LINES}` }}
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            <div className="flex flex-wrap gap-4">
              {connectors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="60" height="20" viewBox="0 0 60 20">
                    <path d={sketchArrow(4, 10, 52, 10, 9500 + i * 71, -4)} fill="none" stroke={INK_RED} strokeWidth="1.2" opacity="0.4" />
                  </svg>
                  <span className="font-['Cambay',sans-serif] text-[10px] italic" style={{ color: PENCIL_LIGHT }}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: INK_RED, opacity: 0.5 }} />
          <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: PENCIL_FAINT }}>
            {findings.length} findings captured
          </span>
        </div>
        <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT, opacity: 0.5 }}>
          research artifact
        </span>
      </div>
    </div>
  );
}

/* ── Findings data — Phase 02 (Sales Agents) ──────────────────────── */

const AGENT_FINDINGS: PaperFinding[] = [
  {
    emoji: '📊',
    title: 'Spreadsheets Were the Enemy',
    body: 'Agents maintained 3–5 separate sheets for inventory, visits, and leads. Cross-referencing was done from memory.',
    tag: 'WORKFLOW PAIN',
    tagColor: 'red',
    rotate: -1.5,
  },
  {
    emoji: '📶',
    title: 'Connectivity Was Never Guaranteed',
    body: 'Site visits happen in areas with patchy or zero signal. Any tool that assumed internet access would fail in the field.',
    tag: 'TECHNICAL CONSTRAINT',
    tagColor: 'blue',
    rotate: 1.5,
  },
  {
    emoji: '💬',
    title: 'WhatsApp Was the Unofficial CRM',
    body: 'Agents shared plot availability, photos, and booking confirmations over WhatsApp threads. No audit trail, no searchability.',
    tag: 'WORKAROUND FOUND',
    tagColor: 'amber',
    rotate: -0.8,
  },
  {
    emoji: '⚠️',
    title: 'Booking Conflicts Were a Real Risk',
    body: 'Multiple agents could show the same plot to different buyers. Double-booking had happened. It damaged client trust.',
    tag: 'CRITICAL RISK',
    tagColor: 'red',
    rotate: 2,
  },
  {
    emoji: '🕐',
    title: 'Visit Documentation Was Retrospective',
    body: 'Agents logged visits hours or days later from memory. Data quality deteriorated with time delay.',
    tag: 'DATA INTEGRITY',
    tagColor: 'blue',
    rotate: -1.2,
  },
  {
    emoji: '🔍',
    title: 'No Visibility on Inventory Status',
    body: 'Agents had no live view of what was available, held, or sold. They learned by calling the office — interrupting their workflow.',
    tag: 'VISIBILITY GAP',
    tagColor: 'red',
    rotate: 0.8,
  },
];

const AGENT_CONNECTORS = [
  { from: 0, to: 2, label: 'same root: no single source of truth' },
  { from: 1, to: 4, label: 'both: field reality' },
];

/* ── Findings data — Phase 05 (Managers) ──────────────────────────── */

const MANAGER_FINDINGS: PaperFinding[] = [
  {
    emoji: '👁️',
    title: 'No Real-Time Field Visibility',
    body: 'Managers received reports retrospectively. By the time they saw agent activity, decisions had already been made — or missed.',
    tag: 'VISIBILITY PROBLEM',
    tagColor: 'red',
    rotate: -1.5,
  },
  {
    emoji: '📧',
    title: 'Reports Were Email Attachments',
    body: 'Weekly Excel exports, manually compiled. No drill-down, no filtering, no way to ask a follow-up question of the data.',
    tag: 'WORKFLOW PAIN',
    tagColor: 'red',
    rotate: 1.2,
  },
  {
    emoji: '📉',
    title: "They Couldn't See the Sales Funnel",
    body: 'How many visits converted to bookings? Which agents were most effective? Which plots were cold? None of this was answerable without manual calculation.',
    tag: 'ANALYTICS GAP',
    tagColor: 'blue',
    rotate: 0.8,
  },
  {
    emoji: '🔐',
    title: 'Approvals Had No Infrastructure',
    body: 'Booking approvals, pricing exceptions, and hold requests were handled by phone. One manager had missed an urgent booking because they were on another call.',
    tag: 'CRITICAL RISK',
    tagColor: 'red',
    rotate: -1,
  },
];

/* ── Small doodle surface icons (for Phase 01 cards) ──────────────── */
function DoodlePhone() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={`${ACCENT}77`} strokeWidth="1.5" />
      <line x1="5" y1="5" x2="19" y2="5" stroke={`${ACCENT}44`} strokeWidth="0.8" />
      <line x1="5" y1="19" x2="19" y2="19" stroke={`${ACCENT}44`} strokeWidth="0.8" />
      <circle cx="12" cy="21" r="0.8" fill={`${ACCENT}55`} />
    </svg>
  );
}

function DoodleMonitor() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="#8899CC88" strokeWidth="1.5" />
      <line x1="8" y1="20" x2="16" y2="20" stroke="#8899CC55" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="20" stroke="#8899CC55" strokeWidth="1.5" />
    </svg>
  );
}

function DoodleCycle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12 A8 8 0 0 1 20 12" stroke={`${ACCENT_2}88`} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20 12 A8 8 0 0 1 4 12" stroke={`${ACCENT_2}88`} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 9 L20 12 L23 10" stroke={`${ACCENT_2}88`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M6 15 L4 12 L1 14" stroke={`${ACCENT_2}88`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   THE SECTION COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function PlotSyncResearchSection() {
  return (
    <section id="research" className="pb-20">

      {/* ━━━ SECTION OPENER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <SectionHeading
        chapter="03 — THE RESEARCH"
        title="Research & Discovery"
        subtitle="Two user populations. Five phases. One system that had to work for all of them."
        accent={ACCENT}
      />
      <div className="w-full h-px mb-16" style={{ background: BORDER }} />

      {/* ━━━ PHASE 01 — THE SPLIT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <PhaseLabel>PHASE 01 — THE SPLIT</PhaseLabel>
        <PhaseTitle>Two Surfaces, One System</PhaseTitle>
        <BodyCopy>
          Before interviewing a single user, the technical reality set the frame.
          A mobile-only solution would leave managers blind. A desktop-only solution
          would miss the field entirely. The decision was architectural before it was visual.
        </BodyCopy>
      </FadeIn>

      <FadeIn delay={0.1}>
        <NarrativeQuote accent={ACCENT}>
          The UX problem was actually a deployment problem. Solve the surface split first.
        </NarrativeQuote>
      </FadeIn>

      {/* Two-column: Mobile + Admin + doodle arrow */}
      <FadeIn delay={0.15}>
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mobile card */}
          <div className="rounded-xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                <Smartphone size={18} style={{ color: ACCENT }} />
              </div>
              <div>
                <div className="font-['Cambay',sans-serif] text-[14px] text-white/85">Mobile Field App</div>
                <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: MUTED }}>React Native</div>
              </div>
            </div>
            <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: BODY_TEXT }}>
              Sales agents work on-site, in transit, in poor network. The mobile surface
              had to be fast, offline-capable, and fit one hand. Every tap had to earn its place.
            </p>
            <div className="flex flex-wrap gap-2">
              <TagChip>React Native</TagChip>
              <TagChip>Offline-first</TagChip>
              <TagChip>GPS-dependent</TagChip>
            </div>
          </div>

          {/* Admin card */}
          <div className="rounded-xl p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#8899CC12' }}>
                <Monitor size={18} style={{ color: '#8899CC' }} />
              </div>
              <div>
                <div className="font-['Cambay',sans-serif] text-[14px] text-white/85">Admin Web Portal</div>
                <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: MUTED }}>React (web)</div>
              </div>
            </div>
            <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: BODY_TEXT }}>
              Managers and operations teams need density — filterable tables, cross-agent analytics,
              inventory oversight. Desktop enabled the information architecture that mobile deliberately simplified away.
            </p>
            <div className="flex flex-wrap gap-2">
              <TagChip color="#8899CC">React</TagChip>
              <TagChip color="#8899CC">Data-dense</TagChip>
              <TagChip color="#8899CC">Multi-agent view</TagChip>
            </div>
          </div>

          {/* Doodle arrow between cards */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10 pointer-events-none">
            <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
              <path d="M8 14 Q20 12, 40 14 Q60 16, 72 14" stroke={`${ACCENT}99`} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M4 14 L10 10 M4 14 L10 18" stroke={`${ACCENT}99`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M76 14 L70 10 M76 14 L70 18" stroke={`${ACCENT}99`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-['Cambay',sans-serif] text-[10px] italic mt-0.5" style={{ color: MUTED }}>
              UNIFIED DATA LAYER
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Framework evaluation table */}
      <FadeIn delay={0.2}>
        <div className="rounded-xl p-5 mb-20" style={{ background: '#0E0E16', border: `1px dashed ${BORDER}` }}>
          <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-4" style={{ color: MUTED }}>
            FRAMEWORK EVALUATION
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['FRAMEWORK', 'VERDICT', 'REASON'].map(h => (
                    <th
                      key={h}
                      className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] pb-2 pr-4"
                      style={{ color: `${ACCENT}88`, borderBottom: `1px solid ${BORDER}` }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { fw: 'React Native', verdict: '✓ CHOSEN', reason: 'Field performance + team familiarity', chosen: true },
                  { fw: 'Flutter', verdict: 'Considered', reason: 'Strong UI, weaker ecosystem at the time', chosen: false },
                  { fw: 'Native iOS/Android', verdict: 'Rejected', reason: 'Dual maintenance cost too high', chosen: false },
                ].map((r, i) => (
                  <tr key={r.fw} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                    <td className="font-['Cambay',sans-serif] text-[13px] text-white/60 py-2.5 pr-4">{r.fw}</td>
                    <td className="font-['Cambay',sans-serif] text-[13px] py-2.5 pr-4" style={{ color: r.chosen ? ACCENT_2 : MUTED }}>
                      {r.verdict}
                    </td>
                    <td className="font-['Cambay',sans-serif] text-[12px] py-2.5" style={{ color: BODY_TEXT }}>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>


      {/* ━━━ PHASE 02 — THE FIELD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <PhaseLabel>PHASE 02 — THE FIELD</PhaseLabel>
        <PhaseTitle>10 Conversations with People Who Work in the Sun</PhaseTitle>
        <BodyCopy>
          We didn't start with assumptions. We started with 10 structured interviews with
          sales agents across 3 plotted development projects. What we expected to hear about
          features — we actually heard about survival strategies.
        </BodyCopy>
      </FadeIn>

      {/* Stat row */}
      <FadeIn delay={0.08}>
        <div className="flex items-center justify-center py-8 mb-8">
          <StatBox value="10" label="Sales agents interviewed" />
          <div className="w-px h-12 mx-4 sm:mx-8" style={{ background: BORDER }} />
          <StatBox value="3" label="Active projects represented" />
          <div className="w-px h-12 mx-4 sm:mx-8" style={{ background: BORDER }} />
          <StatBox value="~45 min" label="Per session" />
        </div>
      </FadeIn>

      {/* ── Paper findings board — Agents ── */}
      <FadeIn delay={0.12}>
        <PaperFindingBoard
          emoji="🗣️"
          title="What They Told Us — Sales Agent Interviews"
          subtitle="10 structured interviews · 3 active projects · field research artifact"
          findings={AGENT_FINDINGS}
          connectors={AGENT_CONNECTORS}
        />
      </FadeIn>

      <div className="mb-20" />


      {/* ━━━ PHASE 03 — THE MAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <PhaseLabel>PHASE 03 — THE MAP</PhaseLabel>
        <PhaseTitle>From Stories to Structure</PhaseTitle>
        <BodyCopy>
          Each interview produced a story. Each story produced a list. Each list got weighed
          against two questions: What needs to be in the system? Where does it live? The output
          was a feature map, not a feature list.
        </BodyCopy>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

          {/* Left — User stories (2/5 width) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-1" style={{ color: MUTED }}>
              USER STORIES CAPTURED
            </div>
            {[
              {
                initials: 'SA',
                quote: '"I need to show a client a plot right now, confirm it\'s available, and book it — before someone else does."',
                source: 'Agent, Project Harmony Phase 2',
              },
              {
                initials: 'SA',
                quote: '"If I\'m at a site and there\'s no signal, I can\'t look anything up. I just have to guess and call the office."',
                source: 'Agent, Riverside Plots',
              },
              {
                initials: 'SA',
                quote: '"My manager asks me for a visit report every Monday. I have to reconstruct the whole week from memory and WhatsApp."',
                source: 'Agent, Greenview Estates',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="rounded-xl p-5"
                style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-['Bebas_Neue',sans-serif] text-[11px] tracking-[1px] shrink-0"
                    style={{ background: `${ACCENT}15`, color: `${ACCENT}aa` }}
                  >
                    {s.initials}
                  </div>
                  <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: MUTED }}>{s.source}</span>
                </div>
                <p className="font-['Caladea',serif] text-[14px] text-white/65 italic leading-[1.6]">
                  {s.quote}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right — Feature map (3/5 width) */}
          <div className="lg:col-span-3">
            <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-3" style={{ color: MUTED }}>
              FEATURE MAPPING OUTPUT
            </div>
            <div
              className="rounded-xl p-6"
              style={{ background: '#0D0D15', border: `1px dashed #2A2A3A` }}
            >
              <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-5" style={{ color: MUTED }}>
                FEATURE MAPPING
              </div>

              {/* Row 1: Mobile */}
              <div className="flex items-start gap-3 mb-4 pb-4" style={{ borderBottom: `1px dashed #1E1E2E` }}>
                <div className="shrink-0 mt-0.5"><DoodlePhone /></div>
                <div>
                  <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] mb-2" style={{ color: `${ACCENT}88` }}>
                    MOBILE — FIELD
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Plot Browsing', 'Visit Capture', 'Lead Capture', 'Availability Lock', 'Status Check'].map(t => (
                      <span key={t} className="font-['Cambay',sans-serif] text-[11px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${ACCENT}55`, color: `${ACCENT}aa` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Admin */}
              <div className="flex items-start gap-3 mb-4 pb-4" style={{ borderBottom: `1px dashed #1E1E2E` }}>
                <div className="shrink-0 mt-0.5"><DoodleMonitor /></div>
                <div>
                  <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] mb-2" style={{ color: '#8899CC88' }}>
                    WEB — ADMIN
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Inventory Map', 'Sales Analytics', 'Agent Oversight', 'Booking Management', 'Lead Reports', 'Demand Heatmap'].map(t => (
                      <span key={t} className="font-['Cambay',sans-serif] text-[11px] px-2.5 py-1 rounded-full" style={{ border: '1px solid #8899CC55', color: '#8899CCaa' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Shared */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5"><DoodleCycle /></div>
                <div>
                  <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] mb-2" style={{ color: `${ACCENT_2}88` }}>
                    BOTH SURFACES — SHARED
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Inventory Status', 'Booking Confirmation', 'Client Records', 'Visit History'].map(t => (
                      <span key={t} className="font-['Cambay',sans-serif] text-[11px] px-2.5 py-1 rounded-full" style={{ border: `1px solid ${ACCENT_2}4d`, color: `${ACCENT_2}cc` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <NarrativeQuote accent={ACCENT} attribution="Design positioning">
          Every feature had to justify its surface. If an agent needed it in the field, it went
          mobile. If a manager needed to act on it in aggregate, it went to admin. Nothing lived
          in both unless it had to.
        </NarrativeQuote>
      </FadeIn>

      <div className="mb-20" />


      {/* ━━━ PHASE 04 — THE GAP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <PhaseLabel>PHASE 04 — THE GAP</PhaseLabel>
        <PhaseTitle>Beta Testing Taught Us What Research Couldn't</PhaseTitle>
        <BodyCopy>
          Structured research tells you what users say they need. Beta testing tells you what
          actually breaks. We ran a closed beta and tracked comprehension failures, drop-off
          points, and edge cases that never appeared in interviews.
        </BodyCopy>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-4" style={{ color: MUTED }}>
          GAPS FOUND IN BETA
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            {
              emoji: '🚦',
              title: 'Availability State Confusion',
              body: 'Users couldn\'t distinguish between \'On Hold\' and \'Reserved\'. Two visually identical states with legally different meanings. We redesigned the status system with explicit color + label + tooltip.',
              tag: 'REDESIGNED',
            },
            {
              emoji: '☁️',
              title: 'Offline Sync Anxiety',
              body: 'When agents went offline mid-session, they didn\'t know if their last action had saved. We added a persistent sync-state indicator and local queue visibility.',
              tag: 'NEW COMPONENT ADDED',
            },
            {
              emoji: '📝',
              title: 'Visit Log Abandonment',
              body: 'The original visit capture form was 7 fields. Beta users frequently abandoned it mid-entry. We cut it to 3 mandatory fields and moved the rest to optional post-visit enrichment.',
              tag: 'FLOW REDESIGNED',
            },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              className="rounded-xl p-6"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="mb-3"><span style={{ fontSize: 24 }}>{c.emoji}</span></div>
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/85 mb-2">{c.title}</div>
              <p className="font-['Cambay',sans-serif] text-[13px] leading-[1.6] mb-4" style={{ color: BODY_TEXT }}>
                {c.body}
              </p>
              <span
                className="inline-block font-['Cambay',sans-serif] text-[10px] tracking-[0.5px] px-2.5 py-1 rounded-full"
                style={{ background: `${ACCENT_2}15`, color: `${ACCENT_2}cc`, border: `1px solid ${ACCENT_2}30` }}
              >
                {c.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* Beta timeline doodle */}
      <FadeIn delay={0.15}>
        <div className="relative flex items-center justify-between px-4 sm:px-12 py-8 mb-20">
          {/* Background line */}
          <div className="absolute left-8 right-8 top-1/2 h-[2px]" style={{ background: `${ACCENT}55` }}>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 4">
              <path d="M0 2 Q50 0, 100 2 Q150 4, 200 2 Q250 0, 300 2 Q350 4, 400 2 Q450 0, 500 2 Q550 4, 600 2" stroke={`${ACCENT}80`} strokeWidth="2" fill="none" />
            </svg>
          </div>
          {[
            { label: 'Beta Launch', time: 'Wk 1–2' },
            { label: 'Gap Analysis', time: 'Wk 3' },
            { label: 'Resolved Build', time: 'Wk 4–5' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="font-['Cambay',sans-serif] text-[12px] text-white/80 mb-2 whitespace-nowrap">{m.label}</div>
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{ borderColor: ACCENT, background: i === 2 ? ACCENT : '#0A0A0A' }}
              />
              <div className="font-['Cambay',sans-serif] text-[10px] mt-2" style={{ color: MUTED }}>{m.time}</div>
            </motion.div>
          ))}
        </div>
      </FadeIn>


      {/* ━━━ PHASE 05 — THE TOP FLOOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <PhaseLabel>PHASE 05 — THE TOP FLOOR</PhaseLabel>
        <PhaseTitle>5 Managers. One Missing Surface.</PhaseTitle>
        <BodyCopy>
          After the agent-facing system took shape, we went to the other end of the chain.
          Five interviews with real estate owners, project managers, and senior sales
          stakeholders surfaced a consistent pattern: they were managing a system they couldn't see.
        </BodyCopy>
      </FadeIn>

      {/* Stat row */}
      <FadeIn delay={0.08}>
        <div className="flex items-center justify-center py-8 mb-8">
          <StatBox value="5" label="Senior stakeholders interviewed" />
          <div className="w-px h-12 mx-4 sm:mx-8" style={{ background: BORDER }} />
          <StatBox value="3" label="Ownership roles represented" />
          <div className="w-px h-12 mx-4 sm:mx-8" style={{ background: BORDER }} />
          <StatBox value="1" label="New surface born from this research" />
        </div>
      </FadeIn>

      {/* ── Paper findings board — Managers ── */}
      <FadeIn delay={0.12}>
        <PaperFindingBoard
          emoji="🏢"
          title="What Managers Couldn't See — Stakeholder Interviews"
          subtitle="5 senior stakeholders · 3 ownership roles · research artifact"
          findings={MANAGER_FINDINGS}
        />
      </FadeIn>

      {/* Manager Mode reveal */}
      <FadeIn delay={0.18}>
        <div
          className="rounded-xl p-6 sm:p-8 mt-8 mb-8"
          style={{ background: '#0E0E1A', borderLeft: `4px solid ${ACCENT}`, border: `1px solid ${BORDER}`, borderLeftWidth: '4px', borderLeftColor: ACCENT }}
        >
          <div className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] mb-3" style={{ color: MUTED }}>
            RESEARCH OUTCOME
          </div>
          <h4 className="font-['Bebas_Neue',sans-serif] text-[28px] text-white/95 tracking-[1px] leading-[1.1] mb-4">
            Manager Mode
          </h4>
          <p className="font-['Cambay',sans-serif] text-[15px] leading-[1.7] mb-6" style={{ color: BODY_TEXT }}>
            The five interviews didn't produce a feature list. They produced a surface.
            A dedicated manager mode — with inventory oversight, agent performance, sales
            funnel analytics, and approval workflows — was added to the admin portal as a
            direct outcome of this research phase. It wasn't in the original scope.
            The research earned it.
          </p>
          <NarrativeQuote accent={ACCENT}>
            We didn't find manager needs through assumption. We found them through listening —
            and they reframed what the system needed to be.
          </NarrativeQuote>
          <div className="flex justify-end gap-2 mt-4">
            <TagChip>SCOPE EXPANSION</TagChip>
            <TagChip>RESEARCH-DRIVEN FEATURE</TagChip>
          </div>
        </div>
      </FadeIn>

      <div className="mb-20" />


      {/* ━━━ SECTION CLOSE — RESEARCH SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <FadeIn>
        <div
          className="rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-start gap-6"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          {/* Left text */}
          <div className="flex-1">
            <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-2" style={{ color: MUTED }}>
              RESEARCH SUMMARY
            </div>
            <p className="font-['Cambay',sans-serif] text-[15px] text-white/70 leading-[1.7]">
              15 interviews. 2 user populations. 5 research phases. Every section of this
              case study traces back to something that was heard, not assumed.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch" style={{ background: BORDER }} />
          <div className="block lg:hidden w-full h-px" style={{ background: BORDER }} />

          {/* Right stat boxes */}
          <div className="flex gap-4 sm:gap-6 shrink-0">
            {[
              { val: '10', label: 'Sales agents interviewed' },
              { val: '5', label: 'Managers & stakeholders' },
              { val: '3', label: 'Beta-phase redesigns' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-['Bebas_Neue',sans-serif] text-[28px] text-white/90 leading-none mb-1">{s.val}</div>
                <div className="font-['Cambay',sans-serif] text-[10px] max-w-[90px]" style={{ color: MUTED }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}