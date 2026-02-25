import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════
   DOODLE JOURNEY MAP — CPQ Price Quotation Engine
   ────────────────────────────────────────────────
   Light paper / whiteboard aesthetic.
   Feels hand-drawn, annotated, used — a real design artifact.
   Contrasts with the dark glass page aesthetics intentionally.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Palette: warm paper + pencil ─────────────────────────────────── */
const PAPER          = '#FBF8F3';
const PAPER_LINES    = '#EDE8DF';
const PENCIL         = '#3D3A36';
const PENCIL_LIGHT   = '#8A857C';
const PENCIL_FAINT   = '#C4BFB5';
const INK_BLUE       = '#2D5F8A';
const INK_RED        = '#B84233';
const HIGHLIGHT_Y    = 'rgba(252,211,77,0.35)';
const HIGHLIGHT_G    = 'rgba(74,222,128,0.22)';
const HIGHLIGHT_B    = 'rgba(96,165,250,0.2)';
const HIGHLIGHT_P    = 'rgba(192,132,252,0.2)';

const STAGE_COLORS = {
  green:  { fill: '#4ADE80', bg: HIGHLIGHT_G, border: '#34D399', label: '#166534' },
  amber:  { fill: '#FBBF24', bg: HIGHLIGHT_Y, border: '#F59E0B', label: '#78350F' },
  blue:   { fill: '#60A5FA', bg: HIGHLIGHT_B, border: '#3B82F6', label: '#1E3A5F' },
  purple: { fill: '#C084FC', bg: HIGHLIGHT_P, border: '#A855F7', label: '#581C87' },
};

/* ── Seeded random for consistent sketch strokes ─────────────────── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Hand-drawn line (wobbly) ────────────────────────────────────── */
function wobbleLine(x1: number, y1: number, x2: number, y2: number, seed: number, wobble: number = 1.8): string {
  const rand = seededRandom(seed);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const segments = Math.max(3, Math.floor(len / 14));
  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const px = x1 + dx * t + (rand() - 0.5) * wobble * (i < segments ? 1 : 0);
    const py = y1 + dy * t + (rand() - 0.5) * wobble * (i < segments ? 1 : 0);
    d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return d;
}

/* ── Sketchy rectangle ───────────────────────────────────────────── */
function sketchRect(x: number, y: number, w: number, h: number, seed: number, wobble: number = 1.2): string {
  return [
    wobbleLine(x, y, x + w, y, seed, wobble),
    wobbleLine(x + w, y, x + w, y + h, seed + 100, wobble),
    wobbleLine(x + w, y + h, x, y + h, seed + 200, wobble),
    wobbleLine(x, y + h, x, y, seed + 300, wobble),
  ].join(' ');
}

/* ── Sketchy underline ───────────────────────────────────────────── */
function sketchUnderline(x: number, y: number, w: number, seed: number): string {
  const rand = seededRandom(seed);
  const segments = 6;
  let d = `M ${x} ${y}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const px = x + w * t;
    const py = y + (rand() - 0.5) * 2;
    d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return d;
}

/* ── Curvy arrow ─────────────────────────────────────────────────── */
function sketchArrow(x1: number, y1: number, x2: number, y2: number, seed: number, curve: number = 0): string {
  const rand = seededRandom(seed);
  const midX = (x1 + x2) / 2 + (rand() - 0.5) * 4;
  const midY = (y1 + y2) / 2 + curve + (rand() - 0.5) * 2;
  const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  const angle = Math.atan2(y2 - midY, x2 - midX);
  const hl = 7;
  const h1x = x2 - Math.cos(angle - 0.5) * hl;
  const h1y = y2 - Math.sin(angle - 0.5) * hl;
  const h2x = x2 - Math.cos(angle + 0.5) * hl;
  const h2y = y2 - Math.sin(angle + 0.5) * hl;
  return `${d} M ${h1x.toFixed(1)} ${h1y.toFixed(1)} L ${x2} ${y2} L ${h2x.toFixed(1)} ${h2y.toFixed(1)}`;
}

/* ── Wobbly circle ───────────────────────────────────────────────── */
function sketchCircle(cx: number, cy: number, r: number, seed: number): string {
  const rand = seededRandom(seed);
  const pts = 20;
  let d = '';
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const wr = r + (rand() - 0.5) * 2.4;
    const px = cx + Math.cos(a) * wr;
    const py = cy + Math.sin(a) * wr;
    d += (i === 0 ? 'M ' : ' L ') + `${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return d + ' Z';
}

/* ── Journey data ─────────────────────────────────────────────────── */
interface JourneyStage {
  id: string;
  number: number;
  emoji: string;
  label: string;
  subtitle: string;
  color: keyof typeof STAGE_COLORS;
  cogLoad: 'High' | 'Highest' | 'Moderate' | 'Low';
  cogPercent: number;
  userGoals: string[];
  systemIntegrations: string[];
  painPointsLegacy?: string[];
  designInterventions: string[];
  emotionalArc: string[];
}

const ENTRY_CONTEXT = {
  trigger: 'Sales agent receives enterprise customer request',
  types: ['New installation', 'Upgrade', 'Disconnect', 'Add-on'],
  system: 'Salesforce CRM → Opportunity logging',
  mindset: ['Performance pressure', 'Fear of pricing errors', 'Need for speed + accuracy'],
};

const STAGES: JourneyStage[] = [
  {
    id: 'intake',
    number: 1,
    emoji: '🟢',
    label: 'Order Intake & Address Validation',
    subtitle: '"Foundation of Accuracy"',
    color: 'green',
    cogLoad: 'High',
    cogPercent: 70,
    userGoals: ['Capture customer correctly', 'Validate service availability', 'Ensure address/service feasibility'],
    systemIntegrations: ['Salesforce', 'Address APIs', 'Eligibility DBs'],
    painPointsLegacy: ['Address mismatch', 'Incorrect opportunity creation', 'Rework cycles'],
    designInterventions: ['Progressive disclosure', 'Validation feedback', 'Real-time system responses', 'Clear progression indicators'],
    emotionalArc: ['Alert but cautious', 'Wants reassurance system is correct'],
  },
  {
    id: 'config',
    number: 2,
    emoji: '🟡',
    label: 'Service Qualification & Product Config',
    subtitle: '"Decision Density Zone"',
    color: 'amber',
    cogLoad: 'Highest',
    cogPercent: 95,
    userGoals: ['Identify eligible services', 'Configure pricing & add-ons', 'Understand discounts/approvals'],
    systemIntegrations: ['Product Catalog', 'Offer Mgmt', 'Discount Approval', 'Credit Checks'],
    painPointsLegacy: ['No discount visibility', 'Poor eligibility clarity', 'Hidden approval states', 'Confusing navigation'],
    designInterventions: ['Categorized product filters', 'Cart mental model', 'Discount approval visibility', 'Live Snapshot window', 'Step progression clarity'],
    emotionalArc: ['Anxiety → Confidence transition', 'Needs system trust'],
  },
  {
    id: 'quote',
    number: 3,
    emoji: '🔵',
    label: 'Quote Generation & Contract Readiness',
    subtitle: '"Commitment Phase"',
    color: 'blue',
    cogLoad: 'Moderate',
    cogPercent: 45,
    userGoals: ['Finalize pricing', 'Generate accurate quote', 'Prepare contract-ready config'],
    systemIntegrations: ['SAP BRIM', 'Contract Gen', 'Credit Verification', 'Account Linkage'],
    painPointsLegacy: ['API latency', 'Contract mismatches', 'Pricing misalignment'],
    designInterventions: ['Quote summary visibility', 'Clear approval tracking', 'Error feedback loops', 'Reduced ambiguity'],
    emotionalArc: ['Relief starting', 'Still cautious'],
  },
  {
    id: 'schedule',
    number: 4,
    emoji: '🟣',
    label: 'Scheduling & Order Execution',
    subtitle: '"Operational Transition"',
    color: 'purple',
    cogLoad: 'Low',
    cogPercent: 20,
    userGoals: ['Move quote to execution', 'Schedule installation/activation', 'Ensure order accuracy downstream'],
    systemIntegrations: ['Order Mgmt', 'Dispatch System', 'Scheduling Workflows'],
    designInterventions: ['Clear system handoff', 'Reduced manual tracking', 'Status transparency'],
    emotionalArc: ['Confidence', 'Closure'],
  },
];

const CROSS_LAYERS = [
  {
    icon: '🧠',
    label: 'Cognitive Load Curve',
    desc: 'Structured load management from High → Highest → Moderate → Low',
  },
  {
    icon: '🔄',
    label: 'System Complexity',
    desc: 'Salesforce · SAP BRIM · Offer Mgmt · Order Mgmt · DocuSign · Dispatch',
  },
  {
    icon: '💡',
    label: 'Decision Density',
    desc: 'Errors reduced at: product selection, discount approvals, quote validation',
  },
  {
    icon: '👥',
    label: 'Behavioral Shift',
    desc: 'Hesitation → Confidence · Rework → Completion · Escalations → Clarity',
  },
];

const BUSINESS_IMPACT = [
  'Faster quoting cycle',
  'Reduced training time',
  'Lower system dependency errors',
  'Faster deal closure',
  'Improved enterprise trust',
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function JourneyMapDoodle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journey' | 'layers'>('journey');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.08 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Stable sketch paths (seeded randomness, no re-render jitter) */
  const sketchPaths = useMemo(() => {
    const paths: Record<string, string> = {};
    STAGES.forEach((s, i) => {
      paths[`card_${s.id}`] = sketchRect(0, 0, 230, 340, 1000 + i * 137, 1.0);
      paths[`circle_${s.id}`] = sketchCircle(0, 0, 14, 2000 + i * 97);
      paths[`underline_${s.id}`] = sketchUnderline(0, 0, 120, 3000 + i * 53);
      if (i < STAGES.length - 1) {
        paths[`arrow_${i}`] = sketchArrow(0, 0, 36, 0, 4000 + i * 71, -6);
      }
    });
    paths['entry_box'] = sketchRect(0, 0, 200, 100, 5000, 1.0);
    paths['entry_arrow'] = sketchArrow(0, 0, 30, 0, 5100, -4);
    return paths;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: PAPER,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 0 60px rgba(0,0,0,0.015)',
      }}
    >
      {/* ── Top "tape" strips for that artifact feel ────────────── */}
      <div className="absolute top-0 left-8 w-16 h-5 rounded-b-sm opacity-40" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.5), rgba(252,211,77,0.2))' }} />
      <div className="absolute top-0 right-12 w-12 h-4 rounded-b-sm opacity-30" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.4), rgba(252,211,77,0.15))' }} />

      {/* ── Paper ruling lines ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.35 }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="w-full h-px absolute" style={{ top: 28 + i * 24, background: PAPER_LINES }} />
        ))}
        {/* Left margin line */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: 44, background: 'rgba(220,100,100,0.15)' }} />
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative px-6 pt-5 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderBottom: `1px solid ${PAPER_LINES}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16 }}>🚀</span>
            <h3 className="font-['Cambay',sans-serif] text-[15px]" style={{ color: PENCIL }}>
              Strategic User Journey Map
            </h3>
          </div>
          <p className="font-['Cambay',sans-serif] text-[11px] mt-0.5" style={{ color: PENCIL_LIGHT }}>
            Price Quotation Engine — Enterprise Sales Quoting · <span style={{ color: INK_BLUE }}>v2.0</span>
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1 rounded-lg p-0.5" style={{ background: PAPER_LINES }}>
          {(['journey', 'layers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-1 rounded-md font-['Cambay',sans-serif] text-[11px] transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? PENCIL : PENCIL_LIGHT,
                boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab === 'journey' ? '🧭 Journey' : '📊 Layers'}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* JOURNEY TAB                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'journey' && (
        <div className="relative overflow-x-auto scrollbar-custom">
          <div className="min-w-[1120px] p-6 pb-8">

            {/* ── Entry Context ──────────────────────────────────── */}
            <motion.div
              className="flex items-start gap-4 mb-6"
              initial={{ opacity: 0, x: -16 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="shrink-0 rounded-xl p-4 relative"
                style={{ width: 210, background: 'rgba(0,0,0,0.015)', border: `1px solid ${PAPER_LINES}` }}
              >
                {/* Sketch overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 210 110">
                  <path d={sketchPaths['entry_box']} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.7" opacity="0.4" />
                </svg>
                <div className="font-['Cambay',sans-serif] text-[10px] mb-1.5" style={{ color: PENCIL_LIGHT }}>🧭 ENTRY CONTEXT</div>
                <div className="font-['Cambay',sans-serif] text-[11px] mb-2" style={{ color: PENCIL }}>{ENTRY_CONTEXT.trigger}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {ENTRY_CONTEXT.types.map(t => (
                    <span key={t} className="font-['Cambay',sans-serif] text-[11px] px-1.5 py-0.5 rounded" style={{ background: HIGHLIGHT_Y, color: '#78350F' }}>{t}</span>
                  ))}
                </div>
                <div className="font-['Cambay',sans-serif] text-[11px]" style={{ color: PENCIL_LIGHT }}>{ENTRY_CONTEXT.system}</div>
              </div>

              {/* Arrow from entry to Stage 1 */}
              <div className="flex items-center pt-10 shrink-0" style={{ width: 44 }}>
                <svg viewBox="0 0 40 20" width="40" height="20">
                  <path d={sketchPaths['entry_arrow']} fill="none" stroke={PENCIL_LIGHT} strokeWidth="1.2" transform="translate(2,10)" />
                </svg>
              </div>

              {/* Mindset annotation */}
              <div className="shrink-0 pt-1" style={{ width: 160 }}>
                <div
                  className="rounded-lg p-2.5 relative"
                  style={{
                    background: 'rgba(252,211,77,0.08)',
                    border: `1px dashed rgba(252,211,77,0.3)`,
                    transform: 'rotate(-0.8deg)',
                  }}
                >
                  <div className="font-['Cambay',sans-serif] text-[9px] mb-1" style={{ color: PENCIL_LIGHT }}>✏️ User Mindset</div>
                  {ENTRY_CONTEXT.mindset.map(m => (
                    <div key={m} className="font-['Cambay',sans-serif] text-[11px]" style={{ color: '#78350F' }}>• {m}</div>
                  ))}
                  <div className="font-['Cambay',sans-serif] text-[9px] mt-1.5 italic" style={{ color: INK_RED }}>
                    👉 This sets the emotional baseline.
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Stage cards row ─────────────────────────────────── */}
            <div className="flex items-start gap-3">
              {STAGES.map((stage, i) => {
                const sc = STAGE_COLORS[stage.color];
                const isHovered = hoveredStage === stage.id;

                return (
                  <motion.div
                    key={stage.id}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={revealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Stage card */}
                    <div
                      className="relative rounded-xl p-4 transition-all duration-200"
                      style={{
                        width: 234,
                        background: isHovered ? sc.bg : 'rgba(0,0,0,0.01)',
                        border: `1px solid ${isHovered ? sc.border + '44' : PAPER_LINES}`,
                        transform: isHovered ? 'translateY(-2px)' : 'none',
                        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredStage(stage.id)}
                      onMouseLeave={() => setHoveredStage(null)}
                    >
                      {/* Sketch border overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 230 340">
                        <path d={sketchPaths[`card_${stage.id}`]} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.5" opacity="0.3" />
                      </svg>

                      {/* Stage header */}
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="28" height="28" viewBox="-14 -14 28 28">
                          <path d={sketchPaths[`circle_${stage.id}`]} fill={sc.bg} stroke={sc.fill} strokeWidth="1.2" />
                          <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill={sc.label} fontFamily="'Cambay', sans-serif" fontWeight="700">{stage.number}</text>
                        </svg>
                        <div>
                          <div className="font-['Cambay',sans-serif] text-[10px]" style={{ color: sc.label }}>{stage.emoji} STAGE {stage.number}</div>
                        </div>
                      </div>

                      {/* Title + subtitle */}
                      <div className="relative mb-2">
                        <div className="font-['Cambay',sans-serif] text-[12px]" style={{ color: PENCIL, fontWeight: 700, lineHeight: '1.3' }}>
                          {stage.label}
                        </div>
                        <svg className="absolute -bottom-1 left-0 pointer-events-none" width="120" height="4" viewBox="0 0 120 4">
                          <path d={sketchPaths[`underline_${stage.id}`]} fill="none" stroke={sc.fill} strokeWidth="1.5" opacity="0.4" />
                        </svg>
                      </div>
                      <div className="font-['Cambay',sans-serif] text-[10px] italic mb-3" style={{ color: PENCIL_LIGHT }}>
                        {stage.subtitle}
                      </div>

                      {/* Cognitive load indicator */}
                      <div className="flex items-center gap-2 mb-3 py-1.5 px-2 rounded-lg" style={{ background: sc.bg }}>
                        <div className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_LIGHT }}>🔥 Cog Load:</div>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: sc.fill }}
                            initial={{ width: 0 }}
                            animate={revealed ? { width: `${stage.cogPercent}%` } : { width: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <div className="font-['Cambay',sans-serif] text-[10px]" style={{ color: sc.label, fontWeight: 700 }}>{stage.cogLoad}</div>
                      </div>

                      {/* User Goals */}
                      <div className="mb-2.5">
                        <div className="font-['Cambay',sans-serif] text-[10px] mb-1" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px' }}>USER GOALS</div>
                        {stage.userGoals.map(g => (
                          <div key={g} className="font-['Cambay',sans-serif] text-[11px] leading-[1.5]" style={{ color: PENCIL }}>
                            <span style={{ color: sc.fill }}>→</span> {g}
                          </div>
                        ))}
                      </div>

                      {/* System Integrations */}
                      <div className="mb-2.5">
                        <div className="font-['Cambay',sans-serif] text-[10px] mb-1" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px' }}>SYSTEMS</div>
                        <div className="flex flex-wrap gap-1">
                          {stage.systemIntegrations.map(s => (
                            <span key={s} className="font-['Cambay',sans-serif] text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.03)', color: PENCIL_LIGHT, border: `0.5px solid ${PAPER_LINES}` }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pain Points (legacy) */}
                      {stage.painPointsLegacy && (
                        <div className="mb-2.5 p-2 rounded-lg" style={{ background: 'rgba(184,66,51,0.04)', border: `1px dashed rgba(184,66,51,0.15)` }}>
                          <div className="font-['Cambay',sans-serif] text-[10px] mb-1" style={{ color: INK_RED, letterSpacing: '0.5px' }}>✕ LEGACY PAIN POINTS</div>
                          {stage.painPointsLegacy.map(p => (
                            <div key={p} className="font-['Cambay',sans-serif] text-[10px] leading-[1.5]" style={{ color: INK_RED, opacity: 0.7 }}>
                              – {p}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Design Interventions */}
                      <div className="mb-2.5 p-2 rounded-lg" style={{ background: 'rgba(45,95,138,0.04)', border: `1px dashed rgba(45,95,138,0.15)` }}>
                        <div className="font-['Cambay',sans-serif] text-[10px] mb-1" style={{ color: INK_BLUE, letterSpacing: '0.5px' }}>✔ DESIGN INTERVENTIONS</div>
                        {stage.designInterventions.map(d => (
                          <div key={d} className="font-['Cambay',sans-serif] text-[10px] leading-[1.5]" style={{ color: INK_BLUE, opacity: 0.8 }}>
                            ✓ {d}
                          </div>
                        ))}
                      </div>

                      {/* Emotional State */}
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background: sc.bg,
                          transform: `rotate(${(i % 2 === 0 ? -0.5 : 0.5)}deg)`,
                        }}
                      >
                        <div className="font-['Cambay',sans-serif] text-[10px] mb-0.5" style={{ color: PENCIL_LIGHT }}>✏️ Emotional State</div>
                        {stage.emotionalArc.map(e => (
                          <div key={e} className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: sc.label }}>
                            👉 {e}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrow to next */}
                    {i < STAGES.length - 1 && (
                      <div className="flex items-center pt-40 shrink-0" style={{ width: 24 }}>
                        <motion.svg
                          viewBox="0 0 40 20"
                          width="36"
                          height="18"
                          initial={{ opacity: 0 }}
                          animate={revealed ? { opacity: 1 } : {}}
                          transition={{ duration: 0.3, delay: 0.4 + i * 0.12 }}
                        >
                          <path d={sketchPaths[`arrow_${i}`]} fill="none" stroke={PENCIL_LIGHT} strokeWidth="1.2" transform="translate(2,10)" />
                        </motion.svg>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* ── Emotional arc summary line ──────────────────────── */}
            <motion.div
              className="mt-6 flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.015)', border: `1px solid ${PAPER_LINES}` }}
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_LIGHT }}>Emotional Arc:</span>
              <div className="flex items-center gap-2">
                {[
                  { emoji: '😰', label: 'Alert', color: STAGE_COLORS.green.fill },
                  { emoji: '→', label: '', color: PENCIL_FAINT },
                  { emoji: '😤', label: 'Anxiety', color: STAGE_COLORS.amber.fill },
                  { emoji: '→', label: '', color: PENCIL_FAINT },
                  { emoji: '😌', label: 'Relief', color: STAGE_COLORS.blue.fill },
                  { emoji: '→', label: '', color: PENCIL_FAINT },
                  { emoji: '😊', label: 'Confidence', color: STAGE_COLORS.purple.fill },
                ].map((item, i) => (
                  <span key={i} className="font-['Cambay',sans-serif] text-[10px]" style={{ color: item.color }}>
                    {item.emoji} {item.label}
                  </span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-3 h-1 rounded-full" style={{ background: STAGE_COLORS.green.fill }} />
                <div className="w-5 h-1 rounded-full" style={{ background: STAGE_COLORS.amber.fill }} />
                <div className="w-3 h-1 rounded-full" style={{ background: STAGE_COLORS.blue.fill }} />
                <div className="w-2 h-1 rounded-full" style={{ background: STAGE_COLORS.purple.fill }} />
                <span className="font-['Cambay',sans-serif] text-[8px] ml-1" style={{ color: PENCIL_FAINT }}>cog. load curve</span>
              </div>
            </motion.div>

            {/* ── "Scribbled" annotation in margin ────────────────── */}
            <motion.div
              className="absolute top-[70px] right-6"
              style={{ transform: 'rotate(2deg)', maxWidth: 150 }}
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <div
                className="font-['Cambay',sans-serif] text-[9px] p-2 rounded"
                style={{
                  color: INK_RED,
                  background: 'rgba(184,66,51,0.03)',
                  border: `1px dashed rgba(184,66,51,0.12)`,
                }}
              >
                ← Key insight: 80% of errors originated in Stages 1 & 2. Design effort concentrated here.
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LAYERS TAB                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === 'layers' && (
        <motion.div
          className="p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="font-['Cambay',sans-serif] text-[10px] mb-4" style={{ color: PENCIL_LIGHT, letterSpacing: '1px' }}>
            📊 CROSS-STAGE EXPERIENCE LAYERS — <span style={{ color: INK_BLUE }}>Important for FAANG storytelling</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {CROSS_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.label}
                className="rounded-xl p-4 relative"
                style={{
                  background: 'rgba(0,0,0,0.01)',
                  border: `1px solid ${PAPER_LINES}`,
                  transform: `rotate(${(i % 2 === 0 ? -0.3 : 0.3)}deg)`,
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 14 }}>{layer.icon}</span>
                  <span className="font-['Cambay',sans-serif] text-[12px]" style={{ color: PENCIL, fontWeight: 700 }}>{layer.label}</span>
                </div>
                <p className="font-['Cambay',sans-serif] text-[11px] leading-[1.6]" style={{ color: PENCIL_LIGHT }}>{layer.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Behavioral transformation */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl p-4" style={{ background: 'rgba(184,66,51,0.03)', border: `1px dashed rgba(184,66,51,0.15)` }}>
              <div className="font-['Cambay',sans-serif] text-[10px] mb-2" style={{ color: INK_RED, letterSpacing: '0.5px' }}>BEFORE</div>
              {['Hesitation', 'Rework cycles', 'Escalations'].map(item => (
                <div key={item} className="font-['Cambay',sans-serif] text-[11px] leading-[1.6]" style={{ color: INK_RED, opacity: 0.7 }}>✕ {item}</div>
              ))}
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(45,95,138,0.04)', border: `1px dashed rgba(45,95,138,0.15)` }}>
              <div className="font-['Cambay',sans-serif] text-[10px] mb-2" style={{ color: INK_BLUE, letterSpacing: '0.5px' }}>AFTER</div>
              {['Confidence', 'Faster completion', 'Better decision clarity'].map(item => (
                <div key={item} className="font-['Cambay',sans-serif] text-[11px] leading-[1.6]" style={{ color: INK_BLUE, opacity: 0.8 }}>✓ {item}</div>
              ))}
            </div>
          </div>

          {/* Business Impact */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.015)', border: `1px solid ${PAPER_LINES}` }}>
            <div className="font-['Cambay',sans-serif] text-[10px] mb-2" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px' }}>💼 BUSINESS IMPACT (STRATEGIC)</div>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_IMPACT.map(item => (
                <span
                  key={item}
                  className="font-['Cambay',sans-serif] text-[10px] px-2.5 py-1 rounded-lg"
                  style={{ background: HIGHLIGHT_G, color: '#166534', border: `0.5px solid rgba(74,222,128,0.3)` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Footnote annotation */}
          <div className="mt-4 flex items-center gap-2" style={{ transform: 'rotate(-0.3deg)' }}>
            <div className="w-8 h-px" style={{ background: PENCIL_FAINT }} />
            <span className="font-['Cambay',sans-serif] text-[9px] italic" style={{ color: PENCIL_FAINT }}>
              "Enterprise UX is not about removing complexity — it's about placing it where humans can handle it best."
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Object.values(STAGE_COLORS).map((sc, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: sc.fill, opacity: 0.6 }} />
            ))}
          </div>
          <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT }}>
            4 stages · {STAGES.reduce((n, s) => n + (s.painPointsLegacy?.length || 0), 0)} pain points identified · {STAGES.reduce((n, s) => n + s.designInterventions.length, 0)} design interventions
          </span>
        </div>
        <span className="font-['Cambay',sans-serif] text-[9px]" style={{ color: PENCIL_FAINT, opacity: 0.5 }}>
          v2.0 — updated with complete journey data
        </span>
      </div>
    </div>
  );
}