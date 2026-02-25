import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════
   DECISION FRAMEWORK DOODLE — "The Enterprise Clarity Framework"
   ───────────────────────────────────────────────────────────────
   7-layer decision pipeline used to make every CPQ UX trade-off.
   Paper/whiteboard doodle aesthetic — warm cream, pencil strokes,
   hand-drawn pipeline connecting numbered filter nodes.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Palette ──────────────────────────────────────────────────── */
const PAPER       = '#FBF8F3';
const PAPER_LINES = '#EDE8DF';
const PENCIL      = '#3D3A36';
const PENCIL_LIGHT = '#8A857C';
const PENCIL_FAINT = '#C4BFB5';
const INK_RED     = '#B84233';
const INK_BLUE    = '#2D5F8A';

/* ── Layer color coding ──────────────────────────────────────── */
const LAYER_COLORS = [
  { fill: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  label: '#991B1B',  tag: '🎯' }, // Business Criticality
  { fill: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', label: '#78350F',  tag: '🧠' }, // Cognitive Load
  { fill: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  label: '#1E3A5F',  tag: '⚙️' }, // System Reality
  { fill: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  label: '#065F46',  tag: '🛡️' }, // Confidence
  { fill: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  label: '#4C1D95',  tag: '⚖️' }, // Safety vs Flex
  { fill: '#F97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',  label: '#7C2D12',  tag: '🚫' }, // Error Prevention
  { fill: '#06B6D4', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)',   label: '#155E75',  tag: '📐' }, // Scalability
];

/* ── Framework data ──────────────────────────────────────────── */
const LAYERS = [
  {
    num: 1,
    title: 'Business Criticality Filter',
    question: '"Will this decision reduce revenue risk?"',
    context: 'CPQ is revenue-generating infrastructure — directly tied to deal closures with a high cost of error.',
    applied: [
      'Accuracy prioritized over visual polish',
      'Approval visibility added to prevent deal failures',
      'Real-time validation introduced',
    ],
    insight: 'Business alignment',
  },
  {
    num: 2,
    title: 'Cognitive Load Optimization',
    question: '"Can the user think clearly under pressure?"',
    context: 'Sales agents operate under targets, time pressure, and complex pricing structures.',
    applied: [
      'Progressive disclosure',
      'Step chunking (Intake → Qualification → Quote → Scheduling)',
      'Clear CTAs + contextual education',
    ],
    insight: 'Reduced decision density',
  },
  {
    num: 3,
    title: 'System Reality Alignment',
    question: '"Does this survive real-world system constraints?"',
    context: 'Enterprise CPQ isn\'t pure UX — Salesforce CRM, SAP BRIM, legacy APIs, approval pipelines, security compliance.',
    applied: [
      'UI adapted to system latency',
      'Feedback loops added for API delays',
      'Error states gracefully handled',
    ],
    insight: 'Enterprise maturity',
  },
  {
    num: 4,
    title: 'Confidence Engineering',
    question: '"Does the user trust the system?"',
    context: 'In CPQ 1.0 users didn\'t trust pricing, discounts were unclear, approval states invisible.',
    applied: [
      'Live snapshot window added',
      'Discount visibility introduced',
      'Approval comments surfaced',
    ],
    insight: 'Behavioral design, not just UI',
  },
  {
    num: 5,
    title: 'Safety vs Flexibility Trade-Off',
    question: '"Where do we allow freedom vs enforce guardrails?"',
    context: 'Critical balance between protecting users from errors and giving them room to explore.',
    applied: [
      'Safety: Approval workflows, validation checks, controlled edits',
      'Flexibility: Step navigation, cart-based review, config exploration',
    ],
    insight: 'Senior-level thinking',
    isTradeoff: true,
    safety: ['Approval workflows', 'Validation checks', 'Controlled edits'],
    flexibility: ['Step navigation', 'Cart-based review', 'Config exploration'],
  },
  {
    num: 6,
    title: 'Error Prevention Strategy',
    question: '"Prevent errors instead of fixing them later."',
    context: 'Shifted from reactive error handling to proactive error prevention.',
    applied: [
      'Inline validation',
      'Contextual warnings',
      'Configuration visibility + clear escalation paths',
    ],
    insight: 'Reduced rework cycles & training effort',
  },
  {
    num: 7,
    title: 'Enterprise Scalability Lens',
    question: '"Will this work across product categories?"',
    context: 'Designed for adaptability — Install / Disconnect / Change / Add flows.',
    applied: [
      'Modular UI components',
      'Configurable fields',
      'Scenario adaptability',
    ],
    insight: 'Future-proofing',
  },
];

/* ── Seeded random ───────────────────────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

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

function sketchCircle(cx: number, cy: number, radius: number, seed: number): string {
  const r = seededRand(seed);
  let d = '';
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const wr = radius + (r() - 0.5) * 2;
    d += (i === 0 ? 'M ' : ' L ') + `${(cx + Math.cos(a) * wr).toFixed(1)} ${(cy + Math.sin(a) * wr).toFixed(1)}`;
  }
  return d + ' Z';
}

/* ═══════════════════════════════════════════════════════════════ */
export default function DecisionFrameworkDoodle() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealed(true); },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  /* Pre-compute SVG paths */
  const paths = useMemo(() => {
    const p: Record<string, string> = {};
    // Pipeline node circles
    for (let i = 0; i < 7; i++) {
      p[`node_${i}`] = sketchCircle(0, 0, 18, 5000 + i * 37);
    }
    // Arrow connectors between nodes
    for (let i = 0; i < 6; i++) {
      p[`arrow_${i}`] = wobbleLine(0, 0, 38, 0, 6000 + i * 23);
    }
    return p;
  }, []);

  /* Pipeline SVG dimensions */
  const pipeW = 720;
  const pipeH = 60;
  const nodeR = 18;
  const gap = (pipeW - 80) / 6; // spacing between node centers
  const startX = 40;
  const cy = 30;

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
      <div className="absolute top-0 left-10 w-14 h-4 rounded-b-sm opacity-35 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.5), rgba(252,211,77,0.15))' }} />
      <div className="absolute top-0 right-14 w-12 h-3.5 rounded-b-sm opacity-25 z-10" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.4), rgba(252,211,77,0.1))' }} />

      {/* ── Faint ruled lines ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.22 }}>
        {Array.from({ length: 80 }, (_, i) => (
          <div key={i} className="w-full h-px absolute" style={{ top: 24 + i * 22, background: PAPER_LINES }} />
        ))}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: 42, background: 'rgba(220,100,100,0.10)' }} />
      </div>

      {/* ── Header ── */}
      <div className="relative px-6 pt-5 pb-3" style={{ borderBottom: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: 15 }}>⚡</span>
          <h3 className="font-['Cambay',sans-serif] text-[16px]" style={{ color: PENCIL }}>
            The Enterprise Clarity Framework
          </h3>
        </div>
        <p className="font-['Cambay',sans-serif] text-[12px]" style={{ color: PENCIL_LIGHT }}>
          Balancing accuracy, speed, system constraints, and user confidence — the 7-layer decision filter behind every CPQ UX trade-off
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="relative px-6 pt-5 pb-4">

        {/* ══════════════════════════════════════════════════════════ */}
        {/* PIPELINE VISUALIZATION — horizontal flow diagram           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.div
          className="w-full overflow-x-auto mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ minWidth: pipeW + 20 }} className="mx-auto">
            <svg
              viewBox={`0 0 ${pipeW} ${pipeH + 30}`}
              className="w-full"
              style={{ maxHeight: 100 }}
            >
              {/* Connector arrows between nodes */}
              {Array.from({ length: 6 }, (_, i) => {
                const x1 = startX + i * gap + nodeR + 3;
                const x2 = startX + (i + 1) * gap - nodeR - 3;
                return (
                  <g key={`conn-${i}`}>
                    <motion.path
                      d={wobbleLine(x1, cy, x2, cy, 8000 + i * 41, 1)}
                      fill="none"
                      stroke={PENCIL_FAINT}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      initial={{ pathLength: 0 }}
                      animate={revealed ? { pathLength: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    />
                    {/* Arrowhead */}
                    <motion.polygon
                      points={`${x2 - 1},${cy - 3.5} ${x2 + 4},${cy} ${x2 - 1},${cy + 3.5}`}
                      fill={PENCIL_FAINT}
                      initial={{ opacity: 0 }}
                      animate={revealed ? { opacity: 0.7 } : {}}
                      transition={{ delay: 0.5 + i * 0.08 }}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {LAYERS.map((layer, i) => {
                const cx = startX + i * gap;
                const isActive = activeLayer === i;
                const color = LAYER_COLORS[i];
                return (
                  <g
                    key={`node-${i}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveLayer(i)}
                    onMouseLeave={() => setActiveLayer(null)}
                    onClick={() => setActiveLayer(activeLayer === i ? null : i)}
                  >
                    {/* Glow ring on hover */}
                    {isActive && (
                      <circle cx={cx} cy={cy} r={nodeR + 5} fill="none" stroke={color.fill} strokeWidth="1.5" opacity={0.3} />
                    )}
                    {/* Sketchy circle */}
                    <motion.path
                      d={sketchCircle(cx, cy, nodeR, 5000 + i * 37)}
                      fill={isActive ? color.bg : 'rgba(255,255,255,0.6)'}
                      stroke={isActive ? color.fill : PENCIL_LIGHT}
                      strokeWidth={isActive ? 2 : 1.3}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={revealed ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.35, delay: 0.2 + i * 0.07, type: 'spring', stiffness: 300 }}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                    />
                    {/* Number */}
                    <text
                      x={cx}
                      y={cy + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Cambay', sans-serif"
                      fontSize="13"
                      fontWeight="700"
                      fill={isActive ? color.fill : PENCIL}
                    >
                      {layer.num}
                    </text>
                    {/* Label below */}
                    <text
                      x={cx}
                      y={cy + nodeR + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="'Cambay', sans-serif"
                      fontSize="9"
                      fill={isActive ? color.label : PENCIL_FAINT}
                      fontWeight={isActive ? '700' : '400'}
                    >
                      {['Biz Risk', 'Cog Load', 'System', 'Confidence', 'Safety', 'Errors', 'Scale'][i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* LAYER DETAIL CARDS — 2 rows (4 + 3)                        */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3"
          initial={{ opacity: 0, y: 12 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {LAYERS.slice(0, 4).map((layer, i) => (
            <LayerCard
              key={i}
              layer={layer}
              color={LAYER_COLORS[i]}
              index={i}
              isActive={activeLayer === i}
              onHover={setActiveLayer}
              revealed={revealed}
            />
          ))}
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {LAYERS.slice(4).map((layer, i) => (
            <LayerCard
              key={i + 4}
              layer={layer}
              color={LAYER_COLORS[i + 4]}
              index={i + 4}
              isActive={activeLayer === i + 4}
              onHover={setActiveLayer}
              revealed={revealed}
            />
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SUMMARY PIPELINE STRIP                                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.div
          className="rounded-xl px-5 py-3.5 overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.025)', border: `1px solid ${PAPER_LINES}`, transform: 'rotate(-0.15deg)' }}
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <div className="font-['Cambay',sans-serif] text-[10px] tracking-[1px] mb-2" style={{ color: PENCIL_FAINT, fontWeight: 700 }}>
            ⭐ CPQ UX DECISION MODEL
          </div>
          <div className="flex items-center gap-1.5 flex-wrap" style={{ minWidth: 'fit-content' }}>
            {[
              { label: 'Business Risk', color: LAYER_COLORS[0] },
              { label: 'Cognitive Load', color: LAYER_COLORS[1] },
              { label: 'System Constraints', color: LAYER_COLORS[2] },
              { label: 'User Confidence', color: LAYER_COLORS[3] },
              { label: 'Safety Balance', color: LAYER_COLORS[4] },
              { label: 'Error Prevention', color: LAYER_COLORS[5] },
              { label: 'Scalability', color: LAYER_COLORS[6] },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className="inline-block px-2 py-0.5 rounded-full font-['Cambay',sans-serif] text-[11px] shrink-0"
                  style={{ background: item.color.bg, border: `1px solid ${item.color.border}`, color: item.color.label, fontWeight: 700 }}
                >
                  {item.label}
                </span>
                {i < 6 && (
                  <span className="font-['Cambay',sans-serif] text-[12px] shrink-0" style={{ color: PENCIL_FAINT }}>→</span>
                )}
              </span>
            ))}
          </div>
          <div className="font-['Cambay',sans-serif] text-[11px] mt-2 italic" style={{ color: PENCIL_LIGHT }}>
            Every design decision was passed through all 7 filters. This is the narrative backbone of the CPQ redesign.
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: INK_BLUE, opacity: 0.5 }} />
          <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: PENCIL_FAINT }}>
            7 layers · hover to explore · the enterprise clarity framework
          </span>
        </div>
        <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT, opacity: 0.5 }}>
          decision framework
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* LAYER CARD — individual framework layer detail                      */
/* ═══════════════════════════════════════════════════════════════════ */
function LayerCard({
  layer,
  color,
  index,
  isActive,
  onHover,
  revealed,
}: {
  layer: typeof LAYERS[number];
  color: typeof LAYER_COLORS[number];
  index: number;
  isActive: boolean;
  onHover: (i: number | null) => void;
  revealed: boolean;
}) {
  const rotations = [-0.4, 0.3, -0.2, 0.5, -0.3, 0.4, -0.15];
  return (
    <motion.div
      className="rounded-xl p-4 transition-all duration-200 cursor-default h-full flex flex-col"
      style={{
        background: isActive ? color.bg : 'rgba(0,0,0,0.01)',
        border: `1px ${isActive ? 'solid' : 'dashed'} ${isActive ? color.border : PAPER_LINES}`,
        transform: `rotate(${rotations[index]}deg)`,
        boxShadow: isActive ? `0 2px 12px ${color.border}` : 'none',
      }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, y: 8 }}
      animate={revealed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: 0.55 + index * 0.06 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: color.bg, border: `1px solid ${color.border}` }}
        >
          <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: color.fill, fontWeight: 700 }}>{layer.num}</span>
        </div>
        <div className="font-['Cambay',sans-serif] text-[12px]" style={{ color: isActive ? color.label : PENCIL, fontWeight: 700 }}>
          {layer.title}
        </div>
      </div>

      {/* Filter question */}
      <div
        className="font-['Cambay',sans-serif] text-[11px] italic mb-2.5 px-2.5 py-1.5 rounded-lg"
        style={{ color: isActive ? color.label : INK_BLUE, background: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(45,95,138,0.04)' }}
      >
        {layer.question}
      </div>

      {/* Context */}
      <div className="font-['Cambay',sans-serif] text-[11px] leading-[1.55] mb-2.5" style={{ color: PENCIL_LIGHT }}>
        {layer.context}
      </div>

      {/* Applied / trade-off table */}
      {'isTradeoff' in layer && layer.isTradeoff ? (
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-1.5 mb-1">
            <div className="font-['Cambay',sans-serif] text-[9px] tracking-[0.5px]" style={{ color: INK_RED, fontWeight: 700 }}>SAFETY</div>
            <div className="font-['Cambay',sans-serif] text-[9px] tracking-[0.5px]" style={{ color: INK_BLUE, fontWeight: 700 }}>FLEXIBILITY</div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col gap-1">
              {(layer as any).safety?.map((s: string, j: number) => (
                <div key={j} className="font-['Cambay',sans-serif] text-[10px] leading-[1.4] flex items-start gap-1" style={{ color: PENCIL }}>
                  <span style={{ color: INK_RED, opacity: 0.6 }}>▸</span> {s}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {(layer as any).flexibility?.map((f: string, j: number) => (
                <div key={j} className="font-['Cambay',sans-serif] text-[10px] leading-[1.4] flex items-start gap-1" style={{ color: PENCIL }}>
                  <span style={{ color: INK_BLUE, opacity: 0.6 }}>▸</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1">
          {layer.applied.map((a, j) => (
            <div key={j} className="font-['Cambay',sans-serif] text-[10px] leading-[1.45] flex items-start gap-1.5" style={{ color: PENCIL }}>
              <span className="shrink-0 mt-px" style={{ color: color.fill, opacity: 0.7 }}>●</span>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Insight tag */}
      <div className="mt-2.5 pt-2" style={{ borderTop: `1px dashed ${PAPER_LINES}` }}>
        <div className="flex items-center gap-1.5">
          <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT }}>👉</span>
          <span className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: isActive ? color.label : PENCIL_LIGHT, fontWeight: 600 }}>
            {layer.insight}
          </span>
        </div>
      </div>
    </motion.div>
  );
}