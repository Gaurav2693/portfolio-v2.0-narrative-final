import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle2, Lightbulb, FileText, Search,
  Shield, Bot, Users, Activity, GitBranch, Clock,
  LayoutDashboard, Settings, Workflow, Eye, Brain,
  MessageSquare, Headphones, Target, TrendingUp, X,
} from 'lucide-react';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════════════════════════════════
   EXIRO AI — UX AUDIT RESEARCH ARTIFACT
   ────────────────────────────────────────
   NOT a case study. This is a presentation-format audit report.
   Slide-based navigation. Paper-light background. Purple accent.
   Completely different visual system from CPQ / PlotSync.
   Rebuilt to clear bundler cache.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Design tokens ────────────────────────────────────────────────── */
const P = {
  accent: '#7C3AED',
  accentLight: '#A78BFA',
  accentBg: 'rgba(124,58,237,0.06)',
  accentBorder: 'rgba(124,58,237,0.15)',
  paper: '#FAFAF8',
  paperAlt: '#F5F4F0',
  ink: '#1A1625',
  inkSoft: '#3D3651',
  inkMuted: '#6B6580',
  inkFaint: '#9C97A8',
  inkGhost: '#CBC7D4',
  border: '#E8E6E1',
  borderLight: '#F0EEEA',
  red: '#DC2626',
  redBg: 'rgba(220,38,38,0.06)',
  redBorder: 'rgba(220,38,38,0.15)',
  amber: '#D97706',
  amberBg: 'rgba(217,119,6,0.06)',
  amberBorder: 'rgba(217,119,6,0.15)',
  green: '#059669',
  greenBg: 'rgba(5,150,105,0.06)',
  greenBorder: 'rgba(5,150,105,0.15)',
};

/* ── Font helpers ────────────────────────────────────────────────── */
const mono = "'Space Mono', monospace";
const serif = "'Caladea', serif";
const sans = "'Cambay', sans-serif";

/* ── Severity Badge ──────────────────────────────────────────────── */
function Severity({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const map = {
    HIGH: { bg: P.redBg, border: P.redBorder, color: P.red },
    MEDIUM: { bg: P.amberBg, border: P.amberBorder, color: P.amber },
    LOW: { bg: P.greenBg, border: P.greenBorder, color: P.green },
  };
  const s = map[level];
  return (
    <span
      style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1.5, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 3 }}
    >
      {level}
    </span>
  );
}

/* ── Reference code ──────────────────────────────────────────────── */
function Ref({ code }: { code: string }) {
  return (
    <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: P.accent, background: P.accentBg, border: `1px solid ${P.accentBorder}`, padding: '2px 7px', borderRadius: 3 }}>
      {code}
    </span>
  );
}

/* ── Annotation callout ──────────────────────────────────────────── */
function Annotation({ num, children }: { num: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 my-3">
      <div
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
        style={{ background: P.accent, color: '#fff', fontFamily: mono, fontSize: 9 }}
      >
        {num}
      </div>
      <div style={{ fontFamily: sans, fontSize: 13, color: P.inkSoft, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

/* ── Section divider with label ──────────────────────────────────── */
function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: P.border }} />
      {label && <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: P.inkGhost }}>{label}</span>}
      <div className="flex-1 h-px" style={{ background: P.border }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIDE DEFINITIONS
   Each slide is a function returning JSX. Pure content, no navigation.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── 00: COVER ───────────────────────────────────────────────────── */
function SlideCover() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      {/* Classification stamp */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
        style={{
          border: `2px solid ${P.accentBorder}`,
          borderRadius: 4,
          padding: '6px 20px',
        }}
      >
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 4, color: P.accent }}>UX AUDIT REPORT</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        style={{ fontFamily: serif, fontSize: 56, color: P.ink, lineHeight: 1.05, marginBottom: 12 }}
        className="md:text-[64px]"
      >
        Exiro AI Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ fontFamily: sans, fontSize: 16, color: P.inkMuted, maxWidth: 480, lineHeight: 1.65, marginBottom: 40 }}
      >
        Enterprise voice automation UX evaluation — trust, explainability, and human-AI oversight patterns.
      </motion.p>

      {/* Metadata row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-6"
      >
        {[
          { label: 'EVALUATOR', value: 'UX / Product Designer' },
          { label: 'DURATION', value: '4 Months' },
          { label: 'METHODOLOGY', value: 'Expert Review' },
          { label: 'FINDINGS', value: '4 Critical' },
        ].map(m => (
          <div key={m.label} className="text-center">
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 3, color: P.inkGhost, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontFamily: sans, fontSize: 13, color: P.inkSoft }}>{m.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Scope notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 max-w-[520px] px-5 py-3 rounded-md"
        style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}
      >
        <p style={{ fontFamily: sans, fontSize: 11, color: P.inkFaint, lineHeight: 1.6 }}>
          This report represents a UX/UI audit and product experience analysis. It does not represent original end-to-end product ownership.
        </p>
      </motion.div>
    </div>
  );
}

/* ── 01: TABLE OF CONTENTS ───────────────────────────────────────── */
function SlideTOC({ goTo }: { goTo: (i: number) => void }) {
  const items = [
    { num: '02', title: 'Executive Summary', desc: 'Scope, context, and top-line findings' },
    { num: '03', title: 'Platform Context', desc: 'Users, system model, and human-AI loop' },
    { num: '04', title: 'Methodology', desc: 'Evaluation framework and heuristics' },
    { num: '05', title: 'Finding F-01: Ingestion Transparency', desc: 'Knowledge base processing visibility gap' },
    { num: '06', title: 'Finding F-02: Decision Explainability', desc: 'AI reasoning absent from transcripts' },
    { num: '07', title: 'Finding F-03: Configuration Load', desc: 'Agent setup cognitive overhead' },
    { num: '08', title: 'Finding F-04: Analytics Fragmentation', desc: 'Distributed insights without synthesis' },
    { num: '09', title: 'Recommendations Matrix', desc: 'Priority and effort mapping' },
    { num: '10', title: 'Reflection & Scope', desc: 'Judgment calls and future validation' },
  ];
  return (
    <div className="h-full flex flex-col justify-center max-w-[600px] mx-auto px-6">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>01 — CONTENTS</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 32 }}>Table of Contents</h2>
      <div className="space-y-0">
        {items.map((item, i) => (
          <motion.button
            key={item.num}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            onClick={() => goTo(parseInt(item.num))}
            className="w-full text-left flex items-start gap-4 py-3 cursor-pointer group border-b"
            style={{ borderColor: P.borderLight }}
          >
            <span style={{ fontFamily: mono, fontSize: 11, color: P.accent, minWidth: 24, marginTop: 2 }}>{item.num}</span>
            <div className="flex-1">
              <div style={{ fontFamily: sans, fontSize: 14, color: P.ink }} className="group-hover:underline transition-all">{item.title}</div>
              <div style={{ fontFamily: sans, fontSize: 11, color: P.inkFaint, marginTop: 1 }}>{item.desc}</div>
            </div>
            <ChevronRight size={14} style={{ color: P.inkGhost, marginTop: 3 }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── 02: EXECUTIVE SUMMARY ───────────────────────────────────────── */
function SlideExecutiveSummary() {
  return (
    <div className="h-full flex flex-col justify-center max-w-[680px] mx-auto px-6">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>02 — EXECUTIVE SUMMARY</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 20 }}>Executive Summary</h2>
      <p style={{ fontFamily: serif, fontSize: 15, color: P.inkSoft, lineHeight: 1.8, marginBottom: 24 }}>
        Exiro AI is an enterprise voice automation platform where AI agents handle large volumes of customer communications. The system interprets spoken intent, executes conversational workflows, and logs outcomes into operational dashboards — closing the loop between automated interactions and human oversight.
      </p>
      <p style={{ fontFamily: serif, fontSize: 15, color: P.inkSoft, lineHeight: 1.8, marginBottom: 32 }}>
        This audit evaluated whether the platform's UX adequately supported the balance between automation efficiency and human control — specifically around <strong style={{ color: P.accent }}>transparency</strong>, <strong style={{ color: P.accent }}>workflow clarity</strong>, and <strong style={{ color: P.accent }}>operational decision support</strong>.
      </p>
      <Divider label="KEY FINDINGS" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {[
          { ref: 'F-01', title: 'Ingestion Transparency', severity: 'HIGH' as const },
          { ref: 'F-02', title: 'Decision Explainability', severity: 'HIGH' as const },
          { ref: 'F-03', title: 'Configuration Complexity', severity: 'MEDIUM' as const },
          { ref: 'F-04', title: 'Analytics Fragmentation', severity: 'MEDIUM' as const },
        ].map((f, i) => (
          <motion.div
            key={f.ref}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center gap-3 px-4 py-3 rounded-md"
            style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}
          >
            <Ref code={f.ref} />
            <span style={{ fontFamily: sans, fontSize: 13, color: P.inkSoft, flex: 1 }}>{f.title}</span>
            <Severity level={f.severity} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── 03: PLATFORM CONTEXT ────────────────────────────────────────── */
function SlidePlatformContext() {
  return (
    <div className="h-full flex flex-col justify-center max-w-[720px] mx-auto px-6">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>03 — PLATFORM CONTEXT</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 24 }}>The System & Its Users</h2>

      {/* System model — 3 nodes */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Bot, label: 'AI Voice Agents', desc: 'Interpret intent, execute workflows, generate responses' },
          { icon: Users, label: 'Human Operators', desc: 'Monitor performance, review transcripts, maintain oversight' },
          { icon: Activity, label: 'Feedback Loop', desc: 'Outcomes logged, enabling continuous refinement' },
        ].map((n, i) => {
          const Icon = n.icon;
          return (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="text-center px-3 py-5 rounded-md"
              style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}
            >
              <Icon size={20} style={{ color: P.accent, margin: '0 auto 10px' }} />
              <div style={{ fontFamily: sans, fontSize: 13, color: P.ink, marginBottom: 4 }}>{n.label}</div>
              <div style={{ fontFamily: sans, fontSize: 11, color: P.inkFaint, lineHeight: 1.5 }}>{n.desc}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Connecting flow */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="h-px w-16" style={{ background: P.border }} />
        <Workflow size={14} style={{ color: P.inkGhost }} />
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: P.inkGhost }}>HUMAN-IN-THE-LOOP</span>
        <Workflow size={14} style={{ color: P.inkGhost }} />
        <div className="h-px w-16" style={{ background: P.border }} />
      </div>

      {/* User archetypes */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'PRIMARY', title: 'Ops / Collections Managers', desc: 'Monitor call volume, outcomes, and AI performance. Review transcripts and dashboards.' },
          { label: 'SECONDARY', title: 'Product Ops / Config Teams', desc: 'Configure agents, upload knowledge bases, define workflows, test before deployment.' },
        ].map((u, i) => (
          <motion.div
            key={u.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="px-4 py-4 rounded-md"
            style={{ border: `1px solid ${P.border}` }}
          >
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 3, color: P.inkGhost, marginBottom: 6 }}>{u.label}</div>
            <div style={{ fontFamily: sans, fontSize: 14, color: P.ink, marginBottom: 4 }}>{u.title}</div>
            <div style={{ fontFamily: sans, fontSize: 12, color: P.inkFaint, lineHeight: 1.55 }}>{u.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Context quote */}
      <div className="mt-6 pl-4" style={{ borderLeft: `2px solid ${P.accentBorder}` }}>
        <p style={{ fontFamily: serif, fontSize: 13, color: P.inkMuted, fontStyle: 'italic', lineHeight: 1.7 }}>
          "The platform wasn't broken — it had inherent complexity typical of enterprise AI tools. My focus was identifying where usability clarity and trust signals could improve."
        </p>
      </div>
    </div>
  );
}

/* ── 04: METHODOLOGY ─────────────────────────────────────────────── */
function SlideMethodology() {
  return (
    <div className="h-full flex flex-col justify-center max-w-[700px] mx-auto px-6">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>04 — METHODOLOGY</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 8 }}>Evaluation Framework</h2>
      <p style={{ fontFamily: sans, fontSize: 13, color: P.inkFaint, marginBottom: 28 }}>
        Structured expert review grounded in three evaluation lenses.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Eye, title: 'Usability Heuristics',
            items: ['Visibility of system status', 'Error prevention & recovery', 'Feedback clarity', 'Mental model alignment'],
          },
          {
            icon: Brain, title: 'AI-Specific UX',
            items: ['Explainability signals', 'Trust calibration', 'Human-in-the-loop oversight', 'Delegation model clarity'],
          },
          {
            icon: LayoutDashboard, title: 'Enterprise Dashboard',
            items: ['Cognitive load assessment', 'Decision efficiency', 'Information architecture', 'Progressive disclosure'],
          },
        ].map((col, i) => {
          const Icon = col.icon;
          return (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="px-4 py-5 rounded-md"
              style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}
            >
              <Icon size={18} style={{ color: P.accent, marginBottom: 12 }} />
              <div style={{ fontFamily: sans, fontSize: 14, color: P.ink, marginBottom: 10 }}>{col.title}</div>
              <div className="space-y-2">
                {col.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full shrink-0" style={{ background: P.accent }} />
                    <span style={{ fontFamily: sans, fontSize: 11, color: P.inkMuted }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="px-4 py-3 rounded-md" style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}>
        <p style={{ fontFamily: sans, fontSize: 11, color: P.inkFaint, lineHeight: 1.65 }}>
          <strong style={{ color: P.inkMuted }}>Note:</strong> This engagement applied systematic UX frameworks rather than informal critique. Primary user research was not in scope — the evaluation was grounded in established heuristics, AI-specific design principles, and enterprise platform patterns.
        </p>
      </div>
    </div>
  );
}

/* ── FINDING SLIDE TEMPLATE ──────────────────────────────────────── */
function SlideFinding({ slideNum, refCode, title, severity, observation, annotations, diagram, recommendations }: {
  slideNum: string;
  refCode: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  observation: string;
  annotations: string[];
  diagram: ReactNode;
  recommendations: string[];
}) {
  return (
    <div className="h-full overflow-y-auto flex flex-col justify-start max-w-[740px] mx-auto px-6 py-8 md:py-0 md:justify-center">
      <div className="flex items-center gap-3 mb-5">
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost }}>{slideNum}</span>
        <Ref code={refCode} />
        <Severity level={severity} />
      </div>

      <h2 style={{ fontFamily: serif, fontSize: 26, color: P.ink, marginBottom: 14, lineHeight: 1.2 }}>{title}</h2>

      {/* Observation */}
      <div className="mb-5 px-4 py-3 rounded-md" style={{ borderLeft: `3px solid ${severity === 'HIGH' ? P.red : P.amber}`, background: severity === 'HIGH' ? P.redBg : P.amberBg }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={12} style={{ color: severity === 'HIGH' ? P.red : P.amber }} />
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: severity === 'HIGH' ? P.red : P.amber }}>OBSERVATION</span>
        </div>
        <p style={{ fontFamily: serif, fontSize: 13, color: P.inkSoft, lineHeight: 1.7 }}>{observation}</p>
      </div>

      {/* Annotations */}
      <div className="mb-5">
        {annotations.map((a, i) => <Annotation key={i} num={i + 1}>{a}</Annotation>)}
      </div>

      {/* Diagram */}
      <div className="mb-5 px-4 py-4 rounded-md" style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}>
        {diagram}
      </div>

      {/* Recommendations */}
      <div className="px-4 py-3 rounded-md" style={{ borderLeft: `3px solid ${P.accent}`, background: P.accentBg }}>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={12} style={{ color: P.accent }} />
          <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.accent }}>RECOMMENDATIONS</span>
        </div>
        <div className="space-y-1.5">
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: P.accent }} />
              <span style={{ fontFamily: sans, fontSize: 12, color: P.inkSoft, lineHeight: 1.55 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── F-01 Diagram: Ingestion Flow ────────────────────────────────── */
function DiagramIngestion() {
  const stages = [
    { label: 'UPLOAD', icon: FileText, ok: true },
    { label: 'PARSING', icon: Search, ok: false },
    { label: 'VALIDATION', icon: Shield, ok: false },
    { label: 'AI READY', icon: Bot, ok: true },
  ];
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkGhost, marginBottom: 12 }}>INGESTION STATE DIAGRAM</div>
      <div className="flex items-center justify-between gap-2 relative">
        <div className="absolute top-[18px] left-[30px] right-[30px] h-px" style={{ background: P.border }} />
        {stages.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: s.ok ? P.paperAlt : P.redBg,
                  border: `1.5px ${s.ok ? 'solid' : 'dashed'} ${s.ok ? P.border : P.redBorder}`,
                }}
              >
                <Icon size={14} style={{ color: s.ok ? P.inkMuted : P.red }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 1.5, color: s.ok ? P.inkFaint : P.red }}>{s.label}</span>
              {!s.ok && <span style={{ fontFamily: mono, fontSize: 7, color: P.red, opacity: 0.6 }}>INVISIBLE</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── F-02 Diagram: Transcript with decision markers ──────────────── */
function DiagramTranscript() {
  const lines = [
    { role: 'AI', text: '"I understand you\'d like to discuss your account balance."' },
    { role: 'USER', text: '"Yes, I received a notice about an overdue amount."' },
    { role: 'AI', text: '"Let me pull up your account details."', branch: 'Account Lookup → Balance Review', conf: '92%' },
    { role: 'AI', text: '"Would you like to set up a payment plan?"', branch: 'Offer Payment Plan (rule-based)', conf: '87%' },
  ];
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkGhost, marginBottom: 12 }}>TRANSCRIPT WITH PROPOSED DECISION MARKERS</div>
      <div className="space-y-2.5">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span
              className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
              style={{
                fontFamily: mono, fontSize: 8, letterSpacing: 1,
                background: l.role === 'AI' ? P.accentBg : P.paperAlt,
                color: l.role === 'AI' ? P.accent : P.inkFaint,
                border: `1px solid ${l.role === 'AI' ? P.accentBorder : P.border}`,
              }}
            >
              {l.role}
            </span>
            <div className="flex-1">
              <span style={{ fontFamily: serif, fontSize: 12, color: P.inkMuted }}>{l.text}</span>
              {l.branch && (
                <div className="mt-1 flex items-center gap-2 px-2 py-1 rounded" style={{ background: P.accentBg, border: `1px dashed ${P.accentBorder}` }}>
                  <GitBranch size={10} style={{ color: P.accent }} />
                  <span style={{ fontFamily: mono, fontSize: 9, color: P.accent }}>{l.branch}</span>
                  <span className="ml-auto" style={{ fontFamily: mono, fontSize: 9, color: P.accentLight }}>{l.conf}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── F-03 Diagram: Cognitive Load ────────────────────────────────── */
function DiagramCogLoad() {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkGhost, marginBottom: 12 }}>COGNITIVE LOAD COMPARISON</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkFaint, marginBottom: 8 }}>CURRENT — FLAT</div>
          <div className="flex flex-wrap gap-1.5">
            {['Knowledge', 'Workflows', 'Voice', 'Testing', 'Deploy', 'Analytics'].map(p => (
              <span key={p} className="px-2 py-1 rounded" style={{ fontFamily: sans, fontSize: 9, color: P.inkFaint, background: P.paperAlt, border: `1px solid ${P.border}` }}>{p}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: P.border }}>
              <div className="h-full rounded-full" style={{ width: '85%', background: `linear-gradient(90deg, ${P.red}40, ${P.red}80)` }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 8, color: P.red }}>HIGH</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkFaint, marginBottom: 8 }}>PROPOSED — STEPPED</div>
          <div className="space-y-1.5">
            {['01 Identity & Voice', '02 Knowledge', '03 Workflows', '04 Test & Deploy'].map(s => (
              <div key={s} className="px-2 py-1 rounded" style={{ fontFamily: mono, fontSize: 9, color: P.accent, background: P.accentBg, border: `1px solid ${P.accentBorder}` }}>{s}</div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: P.border }}>
              <div className="h-full rounded-full" style={{ width: '30%', background: `linear-gradient(90deg, ${P.accent}40, ${P.accent}80)` }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 8, color: P.accent }}>LOW</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── F-04 Diagram: Dashboard ─────────────────────────────────────── */
function DiagramDashboard() {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkGhost, marginBottom: 12 }}>CONSOLIDATION MODEL</div>
      <div className="flex items-center gap-4">
        {/* Fragmented */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Activity, label: 'Calls' },
              { icon: MessageSquare, label: 'Transcripts' },
              { icon: Clock, label: 'Duration' },
              { icon: Headphones, label: 'Channels' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-1.5 px-2 py-1.5 rounded" style={{ background: P.paperAlt, border: `1px solid ${P.border}` }}>
                  <Icon size={10} style={{ color: P.inkGhost }} />
                  <span style={{ fontFamily: sans, fontSize: 9, color: P.inkFaint }}>{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Arrow */}
        <ArrowRight size={16} style={{ color: P.inkGhost, flexShrink: 0 }} />
        {/* Unified */}
        <div className="flex-1 px-3 py-3 rounded-md" style={{ background: P.accentBg, border: `1px solid ${P.accentBorder}` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <LayoutDashboard size={12} style={{ color: P.accent }} />
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.accent }}>UNIFIED</span>
          </div>
          {['Patterns', 'Anomalies', 'Summaries'].map(item => (
            <div key={item} className="px-2 py-1 rounded mb-1" style={{ background: '#fff', border: `1px solid ${P.accentBorder}` }}>
              <span style={{ fontFamily: sans, fontSize: 9, color: P.accent }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 09: RECOMMENDATIONS MATRIX ──────────────────────────────────── */
function SlideMatrix() {
  const rows = [
    { ref: 'F-01.1', rec: 'Staged ingestion feedback states', pri: 'HIGH' as const, eff: 'Medium' },
    { ref: 'F-01.2', rec: 'Source-level status indicators', pri: 'HIGH' as const, eff: 'Low' },
    { ref: 'F-02.1', rec: 'Decision markers in transcripts', pri: 'HIGH' as const, eff: 'High' },
    { ref: 'F-02.2', rec: 'Confidence/rationale layers', pri: 'MEDIUM' as const, eff: 'High' },
    { ref: 'F-03.1', rec: 'Step-based configuration flow', pri: 'HIGH' as const, eff: 'Medium' },
    { ref: 'F-03.2', rec: 'Progressive disclosure + guidance', pri: 'MEDIUM' as const, eff: 'Low' },
    { ref: 'F-04.1', rec: 'Unified operational overview', pri: 'MEDIUM' as const, eff: 'Medium' },
    { ref: 'F-04.2', rec: 'Pattern & anomaly surfacing', pri: 'LOW' as const, eff: 'High' },
  ];
  return (
    <div className="h-full flex flex-col justify-center max-w-[720px] mx-auto px-6">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>09 — RECOMMENDATIONS</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 24 }}>Recommendations Matrix</h2>

      {/* Table */}
      <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_80px_72px] gap-3 px-4 py-2.5" style={{ background: P.paperAlt, borderBottom: `1px solid ${P.border}` }}>
          {['REF', 'RECOMMENDATION', 'PRIORITY', 'EFFORT'].map(h => (
            <span key={h} style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.inkGhost }}>{h}</span>
          ))}
        </div>
        {rows.map((row, i) => (
          <motion.div
            key={row.ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[60px_1fr_80px_72px] gap-3 px-4 py-2.5 items-center"
            style={{ borderBottom: i < rows.length - 1 ? `1px solid ${P.borderLight}` : 'none' }}
          >
            <Ref code={row.ref} />
            <span style={{ fontFamily: sans, fontSize: 12, color: P.inkSoft }}>{row.rec}</span>
            <Severity level={row.pri} />
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, color: P.inkFaint }}>{row.eff}</span>
          </motion.div>
        ))}
      </div>

      <Divider label="DELIVERABLES" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: FileText, text: 'Annotated interface screenshots' },
          { icon: Target, text: 'Structured audit deck' },
          { icon: Workflow, text: 'Flow-mapped recommendations' },
          { icon: Shield, text: 'AI trust signal framework' },
        ].map((d, i) => {
          const Icon = d.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-md" style={{ border: `1px solid ${P.border}` }}>
              <Icon size={13} style={{ color: P.accent }} />
              <span style={{ fontFamily: sans, fontSize: 11, color: P.inkMuted }}>{d.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 10: REFLECTION ──────────────────────────────────────────────── */
function SlideReflection() {
  return (
    <div className="h-full overflow-y-auto flex flex-col justify-start max-w-[660px] mx-auto px-6 py-8 md:py-0 md:justify-center">
      <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, color: P.inkGhost, marginBottom: 20 }}>10 — REFLECTION</div>
      <h2 style={{ fontFamily: serif, fontSize: 32, color: P.ink, marginBottom: 20 }}>Reflection & Scope</h2>

      {/* Judgment call */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target size={13} style={{ color: P.accent }} />
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: P.accent }}>HARDEST JUDGMENT CALL</span>
        </div>
        <p style={{ fontFamily: serif, fontSize: 14, color: P.inkSoft, lineHeight: 1.75, marginBottom: 12 }}>
          The most significant tradeoff: recommend a fundamental restructuring of agent configuration, or propose incremental clarity improvements? A full redesign could reduce complexity but risk disrupting live enterprise workflows.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="px-3 py-3 rounded-md text-center" style={{ background: P.redBg, border: `1px solid ${P.redBorder}` }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.red, marginBottom: 3 }}>REJECTED</div>
            <div style={{ fontFamily: sans, fontSize: 12, color: P.inkSoft }}>Full structural redesign</div>
          </div>
          <div className="px-3 py-3 rounded-md text-center" style={{ background: P.accentBg, border: `1px solid ${P.accentBorder}` }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, color: P.accent, marginBottom: 3 }}>CHOSEN</div>
            <div style={{ fontFamily: sans, fontSize: 12, color: P.inkSoft }}>Progressive enhancement</div>
          </div>
        </div>
      </div>

      <Divider label="FUTURE VALIDATION" />

      {/* With more time */}
      <div className="space-y-2 mb-6">
        {[
          'Observational studies of operators monitoring live AI conversations',
          'Measuring dashboard insight interpretation speed',
          'Testing trust thresholds in AI automation decisions',
          'Evaluating onboarding success rates in agent configuration',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span style={{ fontFamily: mono, fontSize: 10, color: P.accent, minWidth: 16, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontFamily: sans, fontSize: 12, color: P.inkMuted, lineHeight: 1.55 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Impact */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: '~35%', label: 'Projected reduction in manual handling' },
          { value: '4', label: 'Critical findings identified' },
          { value: '8', label: 'Actionable recommendations' },
        ].map(m => (
          <div key={m.label} className="text-center px-3 py-3 rounded-md" style={{ background: P.accentBg, border: `1px solid ${P.accentBorder}` }}>
            <div style={{ fontFamily: serif, fontSize: 28, color: P.accent, marginBottom: 2 }}>{m.value}</div>
            <div style={{ fontFamily: sans, fontSize: 9, color: P.inkFaint, lineHeight: 1.4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 pl-4" style={{ borderLeft: `2px solid ${P.accentBorder}` }}>
        <p style={{ fontFamily: serif, fontSize: 12, color: P.inkFaint, fontStyle: 'italic', lineHeight: 1.7 }}>
          AI-driven enterprise systems benefit from longitudinal validation — particularly around adoption behavior and trust formation over time.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SLIDE ARRAY
   ═══════════════════════════════════════════════════════════════════════ */

const SLIDE_COUNT = 11;
const SLIDE_LABELS = [
  'Cover', 'Contents', 'Summary', 'Context', 'Method',
  'F-01', 'F-02', 'F-03', 'F-04', 'Matrix', 'Reflection',
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

interface ExiroCaseStudyProps {
  embedded?: boolean;
  onClose?: () => void;
}

export default function ExiroCaseStudy({ embedded = false, onClose }: ExiroCaseStudyProps) {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const goTo = useCallback((i: number) => setSlide(Math.max(0, Math.min(SLIDE_COUNT - 1, i))), []);
  const prev = useCallback(() => goTo(slide - 1), [slide, goTo]);
  const next = useCallback(() => goTo(slide + 1), [slide, goTo]);

  /* ── Keyboard navigation ───────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') { embedded && onClose ? onClose() : navigate('/lite'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, navigate, embedded, onClose]);

  /* ── Render current slide ──────────────────────────────────────── */
  function renderSlide(i: number) {
    switch (i) {
      case 0: return <SlideCover />;
      case 1: return <SlideTOC goTo={goTo} />;
      case 2: return <SlideExecutiveSummary />;
      case 3: return <SlidePlatformContext />;
      case 4: return <SlideMethodology />;
      case 5: return (
        <SlideFinding
          slideNum="05 — FINDING"
          refCode="F-01"
          title="Knowledge Base Ingestion Lacked Processing Transparency"
          severity="HIGH"
          observation="The knowledge base integration flow allowed users to upload documents or connect external websites as AI training sources. The interface did not communicate what happened between file upload and AI readiness — no ingestion state, parsing confirmation, or processing indication."
          annotations={[
            'Users upload a document but see no intermediate state before the AI becomes "ready."',
            'Failed or partial ingestions are invisible — no error surface or recovery path.',
            'This gap directly undermines confidence in AI output reliability.',
          ]}
          diagram={<DiagramIngestion />}
          recommendations={[
            'Introduce staged feedback: Upload → Parsing → Validation → AI Ready',
            'Display ingestion success indicators with source-level status',
            'Surface error recovery controls for failed or partial ingestion',
          ]}
        />
      );
      case 6: return (
        <SlideFinding
          slideNum="06 — FINDING"
          refCode="F-02"
          title="AI Decision Pathways Were Not Explicit in Transcript Views"
          severity="HIGH"
          observation="Conversation monitoring provided transcripts and metrics, but did not indicate why the AI selected specific workflow branches. Operators observed outcomes without understanding the reasoning — the difference between passive monitoring and informed oversight."
          annotations={[
            'Transcript views show dialogue but not the workflow logic that drove AI responses.',
            'Operators cannot assess whether the AI made appropriate decisions.',
            'This absence of explainability signals reduces trust in automation accuracy.',
          ]}
          diagram={<DiagramTranscript />}
          recommendations={[
            'Embed decision markers directly within transcript timelines',
            'Surface workflow branch indicators with visual differentiation',
            'Add confidence scores or rule-based explanations for AI transitions',
          ]}
        />
      );
      case 7: return (
        <SlideFinding
          slideNum="07 — FINDING"
          refCode="F-03"
          title="Agent Configuration Introduced High Cognitive Load"
          severity="MEDIUM"
          observation="The configuration environment combined knowledge management, workflow logic, and testing within a dense flat structure. The flow did not guide users through progressive setup — increasing cognitive load and onboarding friction, especially for first-time configuration."
          annotations={[
            'All configuration options visible simultaneously without structured sequencing.',
            'Advanced settings are not gated behind progressive disclosure.',
            'New agent creation lacks structured onboarding guidance.',
          ]}
          diagram={<DiagramCogLoad />}
          recommendations={[
            'Introduce step-based configuration architecture',
            'Use progressive disclosure for advanced settings',
            'Provide contextual guidance within each configuration stage',
          ]}
        />
      );
      case 8: return (
        <SlideFinding
          slideNum="08 — FINDING"
          refCode="F-04"
          title="Analytics Insights Were Fragmented Across Dashboards"
          severity="MEDIUM"
          observation="Metrics (call duration, captured minutes, inbound/outbound tracking, transcript history) were distributed across separate views without synthesis. Operators mentally connected performance indicators instead of receiving decision-oriented summaries."
          annotations={[
            'Four separate metric views require operators to context-switch repeatedly.',
            'No synthesized view connects performance patterns to operational decisions.',
            'Dashboard design reports metrics rather than supporting action.',
          ]}
          diagram={<DiagramDashboard />}
          recommendations={[
            'Introduce summary intelligence layers surfacing patterns and anomalies',
            'Consolidate operational indicators into unified overview panels',
            'Reposition analytics from descriptive reporting to operational intelligence',
          ]}
        />
      );
      case 9: return <SlideMatrix />;
      case 10: return <SlideReflection />;
      default: return <SlideCover />;
    }
  }

  return (
    <div className={`${embedded ? 'w-full h-full' : 'fixed inset-0'} flex flex-col`} style={{ background: P.paper }}>

      {/* ═══ TOP BAR — Document header ═══════════════════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-5 md:px-8 py-3" style={{ borderBottom: `1px solid ${P.border}` }}>
        {/* Left: back + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => embedded && onClose ? onClose() : navigate('/lite')}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <ArrowLeft size={14} style={{ color: P.inkFaint }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: P.inkGhost }} className="hidden md:inline">{embedded ? 'CLOSE' : 'BACK TO OVERVIEW'}</span>
          </button>
          <div className="h-4 w-px" style={{ background: P.border }} />
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, color: P.inkFaint }}>EXIRO AI — UX AUDIT REPORT</span>
        </div>

        {/* Right: page counter + classification */}
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: mono, fontSize: 11, color: P.inkMuted }}>
            {String(slide + 1).padStart(2, '0')}<span style={{ color: P.inkGhost }}> / {String(SLIDE_COUNT).padStart(2, '0')}</span>
          </span>
          <div
            className="hidden md:block px-2.5 py-1 rounded"
            style={{ border: `1.5px solid ${P.accentBorder}` }}
          >
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 3, color: P.accent }}>AUDIT REPORT</span>
          </div>
        </div>
      </div>

      {/* ═══ SLIDE AREA ══════════════════════════════════════════════ */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {renderSlide(slide)}
          </motion.div>
        </AnimatePresence>

        {/* Subtle grid underlay — only on cover */}
        {slide === 0 && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.35]" style={{
            backgroundImage: `radial-gradient(${P.inkGhost}30 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }} />
        )}
      </div>

      {/* ═══ BOTTOM BAR — Navigation ═════════════════════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-5 md:px-8 py-3" style={{ borderTop: `1px solid ${P.border}` }}>
        {/* Left: back to overview + prev */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lite')}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <ArrowLeft size={12} style={{ color: P.inkFaint }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline" style={{ fontFamily: sans, fontSize: 11, color: P.inkFaint }}>Back to overview</span>
          </button>
          <div className="h-3 w-px" style={{ background: P.border }} />
          <button
            onClick={prev}
            disabled={slide === 0}
            className="flex items-center gap-1.5 cursor-pointer disabled:opacity-20 disabled:cursor-default transition-opacity"
          >
            <ChevronLeft size={16} style={{ color: P.inkMuted }} />
            <span className="hidden md:inline" style={{ fontFamily: sans, fontSize: 12, color: P.inkFaint }}>Previous</span>
          </button>
        </div>

        {/* Center: dots + labels */}
        <div className="flex items-center gap-1.5">
          {SLIDE_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group cursor-pointer relative flex flex-col items-center"
              title={label}
            >
              <div
                className="rounded-full transition-all duration-200"
                style={{
                  width: slide === i ? 20 : 6,
                  height: 6,
                  background: slide === i ? P.accent : i < slide ? P.accentLight : P.inkGhost,
                  opacity: slide === i ? 1 : i < slide ? 0.5 : 0.3,
                }}
              />
            </button>
          ))}
        </div>

        {/* Right: next */}
        <button
          onClick={next}
          disabled={slide === SLIDE_COUNT - 1}
          className="flex items-center gap-1.5 cursor-pointer disabled:opacity-20 disabled:cursor-default transition-opacity"
        >
          <span className="hidden md:inline" style={{ fontFamily: sans, fontSize: 12, color: P.inkFaint }}>Next</span>
          <ChevronRight size={16} style={{ color: P.inkMuted }} />
        </button>
      </div>
    </div>
  );
}