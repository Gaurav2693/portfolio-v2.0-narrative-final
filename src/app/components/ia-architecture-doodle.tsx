import { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════
   IA ARCHITECTURE DOODLE — Before / After
   ────────────────────────────────────────
   Paper artifact showing information & app architecture transformation.
   "Before" = legacy CPQ flow from real system   "After" = structured layered system
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Palette: same warm paper as journey map ──────────────────────── */
const PAPER         = '#FBF8F3';
const PAPER_LINES   = '#EDE8DF';
const PENCIL        = '#3D3A36';
const PENCIL_LIGHT  = '#8A857C';
const PENCIL_FAINT  = '#C4BFB5';
const INK_BLUE      = '#2D5F8A';
const INK_RED       = '#B84233';
const INK_RED_BG    = 'rgba(184,66,51,0.06)';
const INK_BLUE_BG   = 'rgba(45,95,138,0.06)';
const HIGHLIGHT_Y   = 'rgba(252,211,77,0.35)';
const HIGHLIGHT_G   = 'rgba(74,222,128,0.22)';

/* ── Seeded random ───────────────────────────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/* ── Sketch primitives ───────────────────────────────────────────── */
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

function sketchRoundRect(x: number, y: number, w: number, h: number, seed: number, wobble = 0.8): string {
  const r = Math.min(6, w / 6, h / 6);
  return [
    wobbleLine(x + r, y, x + w - r, y, seed, wobble),
    wobbleLine(x + w, y + r, x + w, y + h - r, seed + 100, wobble),
    wobbleLine(x + w - r, y + h, x + r, y + h, seed + 200, wobble),
    wobbleLine(x, y + h - r, x, y + r, seed + 300, wobble),
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

function sketchCircle(cx: number, cy: number, radius: number, seed: number): string {
  const r = seededRand(seed);
  let d = '';
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const wr = radius + (r() - 0.5) * 2;
    d += (i === 0 ? 'M ' : ' L ') + `${(cx + Math.cos(a) * wr).toFixed(1)} ${(cy + Math.sin(a) * wr).toFixed(1)}`;
  }
  return d + ' Z';
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  BEFORE STATE — Legacy CPQ Architecture (from real system)         */
/* ═══════════════════════════════════════════════════════════════════ */

/* Main flow steps inside the CPQ block */
const CPQ_STEPS = [
  { id: 'accept', label: 'Accept\nOpportunity', shortLabel: 'Accept Opp.', x: 94, y: 175, w: 56, h: 36 },
  { id: 'addr', label: 'Address\nValidation', shortLabel: 'Addr Valid.', x: 158, y: 175, w: 56, h: 36 },
  { id: 'sqe', label: 'Service\nQualification', shortLabel: 'Svc Qual.', x: 222, y: 175, w: 56, h: 36 },
  { id: 'addprod', label: 'Adding\nProducts', shortLabel: 'Add Prod.', x: 286, y: 175, w: 56, h: 36 },
  { id: 'tnval', label: 'TN\nValidation', shortLabel: 'TN Valid.', x: 350, y: 175, w: 56, h: 36 },
  { id: 'genquote', label: 'Generate\nQuote', shortLabel: 'Gen Quote', x: 414, y: 175, w: 56, h: 36 },
  { id: 'credit', label: 'Credit\nCheck', shortLabel: 'Credit Chk', x: 478, y: 175, w: 56, h: 36 },
  { id: 'gencontract', label: 'Generate\nContract', shortLabel: 'Gen Contract', x: 542, y: 175, w: 56, h: 36 },
  { id: 'ban', label: 'BAN\nAssociation', shortLabel: 'BAN Assoc.', x: 606, y: 175, w: 56, h: 36 },
  { id: 'createorder', label: 'Create Order\n& Decompose', shortLabel: 'Create Ord.', x: 670, y: 175, w: 60, h: 36 },
  { id: 'schedule', label: 'Schedule\nAppointment', shortLabel: 'Schedule', x: 738, y: 175, w: 56, h: 36 },
];

/* Top integration systems */
const TOP_INTEGRATIONS = [
  { label: 'AMS', x: 158, y: 60, w: 42, h: 26 },
  { label: 'SQE', x: 210, y: 60, w: 42, h: 26 },
  { label: 'C360', x: 262, y: 60, w: 42, h: 26 },
  { label: 'O2', x: 314, y: 60, w: 42, h: 26 },
  { label: 'SAP\nBRIM', x: 476, y: 60, w: 48, h: 26 },
  { label: 'Docu\nSign', x: 534, y: 60, w: 48, h: 26 },
  { label: 'SAP\nBRIM', x: 592, y: 60, w: 48, h: 26 },
];

/* Customer Account Table */
const CUST_TABLE = { label: 'Customer\nAccount Table', x: 580, y: 110, w: 82, h: 28 };

/* Bottom integration systems */
const BOTTOM_INTEGRATIONS = [
  { label: 'CT', x: 300, y: 290, w: 40, h: 26 },
  { label: 'Neustar', x: 350, y: 290, w: 56, h: 26 },
  { label: 'Dispatch\nSystem', x: 720, y: 290, w: 66, h: 30 },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  AFTER STATE DATA                                                   */
/* ═══════════════════════════════════════════════════════════════════ */

/* 4 progressive layers with node data + positioning */
const AFTER_LAYERS = [
  {
    id: 'L1',
    label: 'LAYER 1 — Foundational Accuracy',
    shortLabel: 'Foundation',
    loadPct: 40,
    color: '#4ADE80',
    colorBg: 'rgba(74,222,128,0.10)',
    colorBorder: 'rgba(74,222,128,0.35)',
    nodes: ['Address Validation', 'Customer Capture', 'Service Feasibility', 'Eligibility Check'],
    gate: 'Address & service confirmed',
    y: 42,
  },
  {
    id: 'L2',
    label: 'LAYER 2 — Configuration',
    shortLabel: 'Configuration',
    loadPct: 20,
    color: '#FBBF24',
    colorBg: 'rgba(252,211,77,0.10)',
    colorBorder: 'rgba(252,211,77,0.35)',
    nodes: ['Product Filters', 'Service Setup', 'Cart Model', 'Dependency Engine'],
    gate: 'Products configured & validated',
    y: 132,
  },
  {
    id: 'L3',
    label: 'LAYER 3 — Pricing & Approval',
    shortLabel: 'Pricing',
    loadPct: 20,
    color: '#60A5FA',
    colorBg: 'rgba(96,165,250,0.10)',
    colorBorder: 'rgba(96,165,250,0.35)',
    nodes: ['Discount Rules', 'Approval Routing', 'OMT Inline', 'Live Snapshot'],
    gate: 'Pricing approved inline',
    y: 222,
  },
  {
    id: 'L4',
    label: 'LAYER 4 — Review & Lock',
    shortLabel: 'Review',
    loadPct: 20,
    color: '#C084FC',
    colorBg: 'rgba(192,132,252,0.10)',
    colorBorder: 'rgba(192,132,252,0.35)',
    nodes: ['Quote Summary', 'Final Verify', 'DocuSign', 'Order Handoff'],
    gate: 'Quote locked for execution',
    y: 312,
  },
];

/* Ghost integrations — same systems as Before, now absorbed */
const GHOST_INTEGRATIONS = [
  'AMS', 'SQE', 'C360', 'O2', 'SAP BRIM', 'DocuSign', 'SAP BRIM',
  'CT', 'Neustar', 'Dispatch',
];

const AFTER_PRINCIPLES = [
  'Progressive disclosure between layers',
  'State persisted across navigation',
  'Cognitive load balanced by design',
  'System complexity absorbed behind UX',
];

/* ═══════════════════════════════════════════════════════════════════ */
export default function IAArchitectureDoodle() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [activePanel, setActivePanel] = useState<'before' | 'after'>('before');

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealed(true); },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  /* ── Stable sketch paths ───────────────────────────────────── */
  const paths = useMemo(() => {
    const p: Record<string, string | string[]> = {};

    /* ── BEFORE paths ── */
    // CPQ Block outer boundary
    p['cpq_block'] = sketchRect(80, 152, 726, 76, 5000, 1.2);

    // SFDC entry box
    p['sfdc'] = sketchRoundRect(8, 178, 52, 30, 5050);

    // CPQ step boxes
    CPQ_STEPS.forEach((s, i) => {
      p[`step_${i}`] = sketchRoundRect(s.x, s.y, s.w, s.h, 5100 + i * 37);
    });

    // Top integration boxes
    TOP_INTEGRATIONS.forEach((t, i) => {
      p[`top_${i}`] = sketchRoundRect(t.x, t.y, t.w, t.h, 5500 + i * 43);
    });

    // Customer Account Table
    p['cust_table'] = sketchRoundRect(CUST_TABLE.x, CUST_TABLE.y, CUST_TABLE.w, CUST_TABLE.h, 5700);

    // Bottom integration boxes
    BOTTOM_INTEGRATIONS.forEach((b, i) => {
      p[`bot_${i}`] = sketchRoundRect(b.x, b.y, b.w, b.h, 5800 + i * 31);
    });

    // BOSS OM box
    p['boss_om'] = sketchRect(830, 162, 100, 56, 5900, 1.0);

    // R22 Payload connector
    p['r22'] = sketchRoundRect(800, 183, 28, 20, 5950);

    // Flow arrows between CPQ steps
    for (let i = 0; i < CPQ_STEPS.length - 1; i++) {
      const a = CPQ_STEPS[i], b = CPQ_STEPS[i + 1];
      p[`flow_${i}`] = sketchArrow(a.x + a.w, a.y + a.h / 2, b.x, b.y + b.h / 2, 6000 + i * 29, 0);
    }

    // Arrow from SFDC to first CPQ step
    p['sfdc_arrow'] = sketchArrow(60, 193, 94, 193, 6300, 0);

    // Arrow from last step to R22
    p['to_r22'] = sketchArrow(794, 193, 800, 193, 6310, 0);

    // Arrow from R22 to BOSS OM
    p['r22_to_boss'] = sketchArrow(828, 193, 830, 193, 6320, 0);

    // Top integration arrows (down to CPQ block)
    const topTargets = [1, 2, 2, 2, 6, 7, 8]; // which CPQ step each top integration feeds
    TOP_INTEGRATIONS.forEach((t, i) => {
      const target = CPQ_STEPS[topTargets[i]];
      p[`top_arrow_${i}`] = sketchArrow(
        t.x + t.w / 2, t.y + t.h,
        target ? target.x + target.w / 2 : t.x + t.w / 2, 152,
        6400 + i * 37, 0
      );
    });

    // Customer table arrow down to BAN
    p['cust_to_ban'] = sketchArrow(CUST_TABLE.x + CUST_TABLE.w / 2, CUST_TABLE.y + CUST_TABLE.h, 634, 175, 6500, 0);

    // SAP BRIM (last one) arrow up to customer table
    p['sap_to_cust'] = sketchArrow(616, 86, 621, 110, 6510, 0);

    // Bottom integration arrows (from CPQ block down)
    p['to_ct'] = sketchArrow(308, 228, 320, 290, 6600, 4);
    p['to_neustar'] = sketchArrow(372, 228, 378, 290, 6610, 4);
    p['to_dispatch'] = sketchArrow(766, 228, 753, 290, 6620, 4);

    // Cross-wired dependency lines (messy red ones)
    p['cross1'] = sketchArrow(190, 211, 446, 175, 6700, -20); // Addr Val → Credit Check
    p['cross2'] = sketchArrow(318, 211, 190, 175, 6710, 12); // Add Products → Addr Val
    p['cross3'] = sketchArrow(510, 211, 318, 175, 6720, -15); // Credit → Add Products

    // Danger circle around the approval black hole area
    p['danger_circle'] = sketchCircle(510, 193, 58, 6800);

    /* ── AFTER paths (compact viewBox for ~70%+ zoom increase) ── */
    const ALX = 28;   // layer x start
    const ALW = 430;  // layer width
    const ALH = 65;   // layer height
    AFTER_LAYERS.forEach((l, i) => {
      p[`a_layer_${i}`] = sketchRect(ALX, l.y, ALW, ALH, 8000 + i * 67, 1.2);
      // 4 node chips per layer
      l.nodes.forEach((_, ni) => {
        const nw = 92;
        const nh = 26;
        const nx = ALX + 13 + ni * (nw + 12);
        const ny = l.y + 30;
        p[`a_node_${i}_${ni}`] = sketchRoundRect(nx, ny, nw, nh, 8500 + i * 100 + ni * 23);
      });
      // Validation gate circle after each layer
      p[`a_gate_${i}`] = sketchCircle(ALX + ALW / 2, l.y + ALH + 11, 8, 8800 + i * 31);
    });
    // Vertical arrows between layers
    for (let i = 0; i < AFTER_LAYERS.length - 1; i++) {
      const ly = AFTER_LAYERS[i].y + ALH + 21;
      const ny = AFTER_LAYERS[i + 1].y - 2;
      p[`a_arrow_${i}`] = sketchArrow(ALX + ALW / 2, ly, ALX + ALW / 2, ny, 9000 + i * 41, 0);
    }
    // SFDC entry box for After
    p['a_sfdc'] = sketchRoundRect(10, 10, 52, 26, 9100);
    // BOSS OM exit box for After
    p['a_boss'] = sketchRoundRect(ALX + ALW / 2 - 42, AFTER_LAYERS[3].y + ALH + 26, 84, 26, 9150);
    // Ghost integration zone
    const GY = AFTER_LAYERS[3].y + ALH + 62;
    p['a_ghost_zone'] = sketchRect(ALX - 20, GY, ALW + 44, 46, 9200, 1.0);
    GHOST_INTEGRATIONS.forEach((_, gi) => {
      const gx = ALX - 10 + gi * 46;
      p[`a_ghost_${gi}`] = sketchRoundRect(gx, GY + 13, 40, 20, 9300 + gi * 19);
    });

    return p;
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: PAPER,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 0 60px rgba(0,0,0,0.015)',
      }}
    >
      {/* ── Tape strip ───────────────────────────────────────────── */}
      <div className="absolute top-0 left-6 w-14 h-4 rounded-b-sm opacity-35" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.5), rgba(252,211,77,0.15))' }} />
      <div className="absolute top-0 right-10 w-10 h-3.5 rounded-b-sm opacity-25" style={{ background: 'linear-gradient(180deg, rgba(252,211,77,0.4), rgba(252,211,77,0.1))' }} />

      {/* ── Faint ruled lines ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.3 }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="w-full h-px absolute" style={{ top: 24 + i * 22, background: PAPER_LINES }} />
        ))}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: 42, background: 'rgba(220,100,100,0.12)' }} />
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="relative px-6 pt-4 pb-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderBottom: `1px solid ${PAPER_LINES}` }}>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>🏗️</span>
            <h3 className="font-['Cambay',sans-serif] text-[15px]" style={{ color: PENCIL }}>
              Information & App Architecture
            </h3>
          </div>
          <p className="font-['Cambay',sans-serif] text-[12px] mt-0.5" style={{ color: PENCIL_LIGHT }}>
            How the system was restructured — not just screens, but the architecture itself
          </p>
        </div>
        {/* Before / After toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${PAPER_LINES}` }}>
          {(['before', 'after'] as const).map(panel => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className="px-4 py-1.5 font-['Cambay',sans-serif] text-[12px] transition-all cursor-pointer"
              style={{
                background: activePanel === panel
                  ? (panel === 'before' ? INK_RED_BG : INK_BLUE_BG)
                  : 'transparent',
                color: activePanel === panel
                  ? (panel === 'before' ? INK_RED : INK_BLUE)
                  : PENCIL_FAINT,
                fontWeight: activePanel === panel ? 700 : 400,
              }}
            >
              {panel === 'before' ? '✕ Before' : '✓ After'}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BEFORE PANEL — Legacy CPQ Architecture Flow                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activePanel === 'before' && (
        <motion.div
          className="relative p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title + subtitle */}
          <div className="font-['Cambay',sans-serif] text-[13px] mb-1" style={{ color: INK_RED, fontWeight: 700 }}>
            CPQ 1.0 — Legacy System Architecture
          </div>
          <div className="font-['Cambay',sans-serif] text-[11px] mb-4 italic" style={{ color: PENCIL_LIGHT }}>
            Flat, monolithic pipeline — every integration surface exposed to the user
          </div>

          {/* Scrollable diagram */}
          <div className="relative rounded-xl overflow-x-auto" style={{ background: INK_RED_BG, border: `1px dashed rgba(184,66,51,0.15)` }}>
            <motion.div
              className="min-w-[680px] p-3"
              initial={{ opacity: 0, x: -12 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 940 340" className="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="ia-sketch-b" x="-2%" y="-2%" width="104%" height="104%">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" seed="7" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
                  </filter>
                </defs>

                {/* ── CPQ BLOCK boundary ── */}
                <motion.path
                  d={paths['cpq_block'] as string}
                  fill="rgba(252,211,77,0.04)"
                  stroke={PENCIL_FAINT}
                  strokeWidth="1"
                  strokeDasharray="6 4"
                  filter="url(#ia-sketch-b)"
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4 }}
                />
                <text x="86" y="166" fontSize="8" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif" fontWeight="700" letterSpacing="2">
                  CPQ BLOCK
                </text>

                {/* ── SFDC Entry ── */}
                <motion.g
                  initial={{ opacity: 0, x: -10 }}
                  animate={revealed ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <path d={paths['sfdc'] as string} fill="#E8F5E9" stroke="#66BB6A" strokeWidth="1" filter="url(#ia-sketch-b)" />
                  <text x="34" y="190" textAnchor="middle" fontSize="9" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="700">SFDC</text>
                  <text x="34" y="200" textAnchor="middle" fontSize="6.5" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">(Salesforce)</text>
                </motion.g>

                {/* SFDC → CPQ arrow */}
                <motion.path
                  d={paths['sfdc_arrow'] as string}
                  fill="none" stroke={PENCIL_FAINT} strokeWidth="1"
                  filter="url(#ia-sketch-b)"
                  initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />

                {/* ── Top Integration Systems ── */}
                {TOP_INTEGRATIONS.map((t, i) => (
                  <motion.g
                    key={`top-${i}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={revealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.15 + i * 0.04 }}
                  >
                    <path d={paths[`top_${i}`] as string} fill="rgba(255,165,0,0.08)" stroke="#E5A04C" strokeWidth="0.8" filter="url(#ia-sketch-b)" />
                    {t.label.includes('\n') ? (
                      t.label.split('\n').map((line, li) => (
                        <text key={li} x={t.x + t.w / 2} y={t.y + 11 + li * 10} textAnchor="middle" fontSize="7.5" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="600">{line}</text>
                      ))
                    ) : (
                      <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 3} textAnchor="middle" fontSize="8.5" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="600">{t.label}</text>
                    )}
                  </motion.g>
                ))}

                {/* Arrows from top integrations down to CPQ block */}
                {TOP_INTEGRATIONS.map((_, i) => (
                  <motion.path
                    key={`ta-${i}`}
                    d={paths[`top_arrow_${i}`] as string}
                    fill="none" stroke={PENCIL_FAINT} strokeWidth="0.7"
                    filter="url(#ia-sketch-b)"
                    initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.03 }}
                  />
                ))}

                {/* Penciled annotations on top arrows */}
                <text x="205" y="100" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" transform="rotate(-12, 205, 100)" fontStyle="italic">Fetching customer data</text>
                <text x="290" y="105" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" transform="rotate(-8, 290, 105)" fontStyle="italic">Pushing file to qualification</text>
                <text x="490" y="118" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" transform="rotate(-5, 490, 118)" fontStyle="italic">Creates Base BAN</text>

                {/* ── Customer Account Table ── */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ duration: 0.35, delay: 0.35 }}
                >
                  <path d={paths['cust_table'] as string} fill="rgba(255,255,255,0.5)" stroke={PENCIL_FAINT} strokeWidth="0.8" filter="url(#ia-sketch-b)" />
                  <text x={CUST_TABLE.x + CUST_TABLE.w / 2} y={CUST_TABLE.y + 12} textAnchor="middle" fontSize="6.5" fill={PENCIL} fontFamily="'Cambay', sans-serif">Customer</text>
                  <text x={CUST_TABLE.x + CUST_TABLE.w / 2} y={CUST_TABLE.y + 22} textAnchor="middle" fontSize="6.5" fill={PENCIL} fontFamily="'Cambay', sans-serif">Account Table</text>
                </motion.g>
                <motion.path
                  d={paths['sap_to_cust'] as string}
                  fill="none" stroke={PENCIL_FAINT} strokeWidth="0.6"
                  initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.4 }}
                />
                <motion.path
                  d={paths['cust_to_ban'] as string}
                  fill="none" stroke={PENCIL_FAINT} strokeWidth="0.6"
                  initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.42 }}
                />

                {/* ── CPQ Step Boxes ── */}
                {CPQ_STEPS.map((s, i) => (
                  <motion.g
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={revealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.2 + i * 0.04 }}
                  >
                    <path d={paths[`step_${i}`] as string} fill="rgba(255,255,255,0.65)" stroke="#D4A843" strokeWidth="0.8" filter="url(#ia-sketch-b)" />
                    {s.label.split('\n').map((line, li) => (
                      <text
                        key={li}
                        x={s.x + s.w / 2}
                        y={s.y + 14 + li * 10}
                        textAnchor="middle"
                        fontSize="7"
                        fill={PENCIL}
                        fontFamily="'Cambay', sans-serif"
                      >
                        {line}
                      </text>
                    ))}
                  </motion.g>
                ))}

                {/* Flow arrows between CPQ steps */}
                {Array.from({ length: CPQ_STEPS.length - 1 }, (_, i) => (
                  <motion.path
                    key={`fa-${i}`}
                    d={paths[`flow_${i}`] as string}
                    fill="none" stroke={PENCIL_FAINT} strokeWidth="0.7"
                    filter="url(#ia-sketch-b)"
                    initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
                  />
                ))}

                {/* ── Cross-wired dependency lines (RED — the mess) ── */}
                {['cross1', 'cross2', 'cross3'].map((key, i) => (
                  <motion.path
                    key={key}
                    d={paths[key] as string}
                    fill="none"
                    stroke={INK_RED}
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity={0.35}
                    filter="url(#ia-sketch-b)"
                    initial={{ pathLength: 0 }}
                    animate={revealed ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  />
                ))}

                {/* Danger circle around credit/quote area */}
                <motion.path
                  d={paths['danger_circle'] as string}
                  fill="none"
                  stroke={INK_RED}
                  strokeWidth="1"
                  strokeDasharray="5 4"
                  opacity={0.25}
                  filter="url(#ia-sketch-b)"
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 0.25 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 }}
                />
                <text x="510" y="240" textAnchor="middle" fontSize="7" fill={INK_RED} opacity={0.5} fontFamily="'Cambay', sans-serif" fontStyle="italic" transform="rotate(-3, 510, 240)">
                  ← tangled cross-wires!
                </text>

                {/* ── Bottom Integration Systems ── */}
                {BOTTOM_INTEGRATIONS.map((b, i) => (
                  <motion.g
                    key={`bot-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={revealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.06 }}
                  >
                    <path d={paths[`bot_${i}`] as string} fill="rgba(255,165,0,0.06)" stroke="#E5A04C" strokeWidth="0.8" filter="url(#ia-sketch-b)" />
                    {b.label.includes('\n') ? (
                      b.label.split('\n').map((line, li) => (
                        <text key={li} x={b.x + b.w / 2} y={b.y + 12 + li * 10} textAnchor="middle" fontSize="7.5" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="600">{line}</text>
                      ))
                    ) : (
                      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 3} textAnchor="middle" fontSize="8.5" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="600">{b.label}</text>
                    )}
                  </motion.g>
                ))}

                {/* Arrows from CPQ block to bottom integrations */}
                {['to_ct', 'to_neustar', 'to_dispatch'].map((key, i) => (
                  <motion.path
                    key={key}
                    d={paths[key] as string}
                    fill="none" stroke={PENCIL_FAINT} strokeWidth="0.7"
                    filter="url(#ia-sketch-b)"
                    initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.55 + i * 0.05 }}
                  />
                ))}
                {/* Small arrow annotations for bottom */}
                <text x="275" y="262" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontStyle="italic">Fetching product data</text>
                <text x="350" y="270" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontStyle="italic">Fetching port/s eligibility</text>
                <text x="710" y="260" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontStyle="italic">Send Opportunity</text>
                <text x="710" y="268" fontSize="6" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontStyle="italic">Won Status</text>

                {/* ── R22 Payload & BOSS OM ── */}
                <motion.g
                  initial={{ opacity: 0, x: 10 }}
                  animate={revealed ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  {/* Arrow from last step → R22 */}
                  <path d={wobbleLine(794, 193, 800, 193, 6310)} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.8" />

                  {/* R22 Payload */}
                  <path d={paths['r22'] as string} fill="rgba(255,255,255,0.5)" stroke={PENCIL_FAINT} strokeWidth="0.8" filter="url(#ia-sketch-b)" />
                  <text x="814" y="195" textAnchor="middle" fontSize="6.5" fill={PENCIL} fontFamily="'Cambay', sans-serif">R22</text>
                  <text x="814" y="202" textAnchor="middle" fontSize="5.5" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">Payload</text>

                  {/* Arrow R22 → BOSS */}
                  <polygon points="826,193 832,190 832,196" fill={PENCIL_FAINT} />

                  {/* BOSS OM box */}
                  <path d={paths['boss_om'] as string} fill="rgba(255,193,7,0.12)" stroke="#D4A843" strokeWidth="1.2" filter="url(#ia-sketch-b)" />
                  <text x="880" y="183" textAnchor="middle" fontSize="7" fill="#B8860B" fontFamily="'Cambay', sans-serif" fontWeight="700">★ BOSS OM</text>
                  <text x="880" y="196" textAnchor="middle" fontSize="6" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">Order Management</text>
                  <text x="880" y="206" textAnchor="middle" fontSize="6" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">System</text>
                </motion.g>

                {/* ── Red annotation: approval black hole ── */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                >
                  <line x1="446" y1="228" x2="446" y2="325" stroke={INK_RED} strokeWidth="0.5" strokeDasharray="3 3" opacity={0.3} />
                  <text x="370" y="332" fontSize="7.5" fill={INK_RED} fontFamily="'Cambay', sans-serif" fontWeight="700" opacity={0.6}>
                    ← 3–5 day approval black hole →
                  </text>
                </motion.g>
              </svg>
            </motion.div>
          </div>

          {/* ── Side annotations (below on mobile, beside on desktop) ── */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5"
            initial={{ opacity: 0, y: 12 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Why this failed */}
            <div className="rounded-xl p-4" style={{ background: INK_RED_BG, border: `1px dashed rgba(184,66,51,0.15)`, transform: 'rotate(0.3deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: INK_RED, letterSpacing: '0.5px', fontWeight: 700 }}>✕ WHY THIS FAILED</div>
              {[
                { issue: 'Flat navigation', detail: 'Everything visible at once — no hierarchy' },
                { issue: 'No feedback loops', detail: 'Config errors surfaced days later at approval' },
                { issue: 'Tangled dependencies', detail: 'Pricing ↔ Approval ↔ Config all cross-wired' },
                { issue: 'No state persistence', detail: 'Navigate away = lose your work' },
                { issue: 'Raw complexity', detail: 'System integrations exposed directly to users' },
              ].map((item, i) => (
                <div key={i} className="mb-2.5 last:mb-0">
                  <div className="font-['Cambay',sans-serif] text-[12px]" style={{ color: INK_RED, fontWeight: 700 }}>{item.issue}</div>
                  <div className="font-['Cambay',sans-serif] text-[11px] leading-[1.5]" style={{ color: PENCIL_LIGHT }}>{item.detail}</div>
                </div>
              ))}
            </div>

            {/* Consequence */}
            <div className="rounded-xl p-4" style={{ background: HIGHLIGHT_Y, border: `1px dashed rgba(252,211,77,0.4)`, transform: 'rotate(-0.5deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-1.5" style={{ color: '#78350F', letterSpacing: '0.5px', fontWeight: 700 }}>⚠️ CONSEQUENCE</div>
              <div className="font-['Cambay',sans-serif] text-[12px] leading-[1.6]" style={{ color: '#78350F' }}>
                Configuration decisions made in isolation triggered approval failures <strong>3–5 days later</strong>, requiring complete quote regeneration.
              </div>
              <div className="font-['Cambay',sans-serif] text-[12px] leading-[1.6] mt-3" style={{ color: '#78350F' }}>
                Every step's output was consumed by multiple downstream consumers with <strong>no validation</strong> at the point of entry.
              </div>
            </div>

            {/* Key numbers */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.02)', border: `1px solid ${PAPER_LINES}`, transform: 'rotate(0.6deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px', fontWeight: 700 }}>📊 BY THE NUMBERS</div>
              {[
                { metric: '11', desc: 'sequential pipeline steps' },
                { metric: '7', desc: 'external integration surfaces' },
                { metric: '3', desc: 'cross-wired hidden dependencies' },
                { metric: '3–5 days', desc: 'approval turnaround (black hole)' },
                { metric: '0', desc: 'inline validation or feedback' },
              ].map((item, i) => (
                <div key={i} className="flex items-baseline gap-2 mb-1.5 last:mb-0">
                  <span className="font-['Cambay',sans-serif] text-[14px] shrink-0" style={{ color: INK_RED, fontWeight: 700 }}>{item.metric}</span>
                  <span className="font-['Cambay',sans-serif] text-[11px] leading-[1.4]" style={{ color: PENCIL }}>{item.desc}</span>
                </div>
              ))}
              <div className="mt-3 pt-2" style={{ borderTop: `1px dashed ${PAPER_LINES}` }}>
                <div className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: PENCIL_FAINT }}>
                  ✏️ "The system itself was becoming a reason deals were lost."
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transition prompt */}
          <motion.div
            className="mt-5 flex items-center justify-center gap-2 py-2"
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
            <button
              onClick={() => setActivePanel('after')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-['Cambay',sans-serif] text-[11px] transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: INK_BLUE_BG, color: INK_BLUE, border: `1px solid rgba(45,95,138,0.15)` }}
            >
              See the redesigned architecture →
            </button>
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
          </motion.div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AFTER PANEL — Redesigned Wide-Format Architecture            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activePanel === 'after' && (
        <motion.div
          className="relative p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title + subtitle */}
          <div className="font-['Cambay',sans-serif] text-[13px] mb-1" style={{ color: INK_BLUE, fontWeight: 700 }}>
            CPQ 2.0 — Redesigned Architecture
          </div>
          <div className="font-['Cambay',sans-serif] text-[11px] mb-4 italic" style={{ color: PENCIL_LIGHT }}>
            Layered, progressive, load-balanced — system complexity absorbed behind UX
          </div>

          {/* Full-width SVG diagram — compact viewBox for ~70%+ zoom */}
          <div className="relative rounded-xl overflow-x-auto" style={{ background: INK_BLUE_BG, border: `1px dashed rgba(45,95,138,0.15)` }}>
            <motion.div
              className="min-w-[530px] p-4"
              initial={{ opacity: 0, x: -12 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 500 500" className="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="ia-sketch2" x="-2%" y="-2%" width="104%" height="104%">
                    <feTurbulence baseFrequency="0.04" numOctaves="3" seed="12" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.6" />
                  </filter>
                </defs>

                {/* ── SFDC Entry ── */}
                <motion.g
                  initial={{ opacity: 0, x: -10 }}
                  animate={revealed ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <path d={paths['a_sfdc'] as string} fill="#E8F5E9" stroke="#66BB6A" strokeWidth="1" filter="url(#ia-sketch2)" />
                  <text x="36" y="21" textAnchor="middle" fontSize="9" fill={PENCIL} fontFamily="'Cambay', sans-serif" fontWeight="700">SFDC</text>
                  <text x="36" y="31" textAnchor="middle" fontSize="6.5" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">(Salesforce)</text>
                  <path d={wobbleLine(62, 23, 82, 23, 9101)} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.8" />
                  <text x="74" y="17" fontSize="6.5" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontStyle="italic">Opportunity</text>
                </motion.g>

                {/* ── "USER-FACING UX" label ── */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <text x="243" y="14" textAnchor="middle" fontSize="7" fill={INK_BLUE} fontFamily="'Cambay', sans-serif" fontWeight="700" letterSpacing="2.5" opacity={0.5}>
                    USER-FACING UX LAYER
                  </text>
                  <path d={wobbleLine(100, 19, 386, 19, 9080, 0.5)} fill="none" stroke={INK_BLUE} strokeWidth="0.4" opacity={0.2} />
                </motion.g>

                {/* ── 4 Progressive Layers ── */}
                {AFTER_LAYERS.map((layer, li) => {
                  const ALX = 28, ALW = 430, ALH = 65;
                  return (
                    <motion.g
                      key={`layer-${li}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={revealed ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.12 + li * 0.12 }}
                    >
                      <path d={paths[`a_layer_${li}`] as string} fill={layer.colorBg} stroke={layer.color} strokeWidth="0.8" opacity={0.7} filter="url(#ia-sketch2)" />
                      <text x={ALX + 8} y={layer.y + 13} fontSize="8" fill={layer.color} fontFamily="'Cambay', sans-serif" fontWeight="700" opacity={0.9}>{layer.label}</text>
                      <text x={ALX + ALW - 8} y={layer.y + 13} textAnchor="end" fontSize="7" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">{layer.loadPct}% cognitive load</text>
                      <rect x={ALX + ALW - 85} y={layer.y + 18} width={75} height={3} rx={1.5} fill="rgba(0,0,0,0.04)" />
                      <motion.rect x={ALX + ALW - 85} y={layer.y + 18} height={3} rx={1.5} fill={layer.color} opacity={0.5} initial={{ width: 0 }} animate={revealed ? { width: (layer.loadPct / 100) * 75 } : { width: 0 }} transition={{ duration: 0.7, delay: 0.3 + li * 0.12 }} />

                      {/* 4 node chips */}
                      {layer.nodes.map((node, ni) => {
                        const nw = 92, nh = 26;
                        const nx = ALX + 13 + ni * (nw + 12);
                        const ny = layer.y + 30;
                        return (
                          <g key={`n-${li}-${ni}`}>
                            <path d={paths[`a_node_${li}_${ni}`] as string} fill="rgba(255,255,255,0.55)" stroke={layer.color} strokeWidth="0.6" opacity={0.6} filter="url(#ia-sketch2)" />
                            <text x={nx + nw / 2} y={ny + nh / 2 + 3} textAnchor="middle" fontSize="7.5" fill={PENCIL} fontFamily="'Cambay', sans-serif">{node}</text>
                          </g>
                        );
                      })}

                      {/* Validation gate */}
                      <path d={paths[`a_gate_${li}`] as string} fill="#fff" stroke={layer.color} strokeWidth="1" filter="url(#ia-sketch2)" />
                      <text x={ALX + ALW / 2} y={layer.y + ALH + 14} textAnchor="middle" fontSize="8" fill={layer.color} fontFamily="'Cambay', sans-serif" fontWeight="700">✓</text>
                      <text x={ALX + ALW / 2 + 14} y={layer.y + ALH + 14} fontSize="6" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif" fontStyle="italic">{layer.gate}</text>
                    </motion.g>
                  );
                })}

                {/* ── Vertical flow arrows ── */}
                {[0, 1, 2].map(i => (
                  <motion.path key={`va-${i}`} d={paths[`a_arrow_${i}`] as string} fill="none" stroke={INK_BLUE} strokeWidth="1" opacity={0.3} filter="url(#ia-sketch2)" initial={{ pathLength: 0 }} animate={revealed ? { pathLength: 1 } : {}} transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }} />
                ))}

                {/* ── Progressive disclosure brace (left) ── */}
                <motion.g initial={{ opacity: 0 }} animate={revealed ? { opacity: 1 } : {}} transition={{ delay: 0.9 }}>
                  <path d={`M 20 ${AFTER_LAYERS[0].y + 6} Q 10 ${(AFTER_LAYERS[0].y + AFTER_LAYERS[3].y + 65) / 2} 20 ${AFTER_LAYERS[3].y + 59}`} fill="none" stroke={PENCIL_FAINT} strokeWidth="0.8" strokeDasharray="2 3" />
                  <text x="8" y={(AFTER_LAYERS[0].y + AFTER_LAYERS[3].y + 65) / 2} fontSize="6.5" fill={INK_BLUE} fontFamily="'Cambay', sans-serif" writingMode="vertical-rl" textAnchor="middle" opacity={0.45}>Progressive Disclosure ↓</text>
                </motion.g>

                {/* ── BOSS OM Exit ── */}
                <motion.g initial={{ opacity: 0, y: 8 }} animate={revealed ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay: 0.7 }}>
                  <polygon points="241,394 243,398 245,394" fill={PENCIL_FAINT} />
                  <path d={paths['a_boss'] as string} fill="rgba(74,222,128,0.08)" stroke="#4ADE80" strokeWidth="1" filter="url(#ia-sketch2)" />
                  <text x="243" y="416" textAnchor="middle" fontSize="7.5" fill="#166534" fontFamily="'Cambay', sans-serif" fontWeight="700">✓ BOSS OM → Order Execution</text>
                  <text x="243" y="425" textAnchor="middle" fontSize="6" fill={PENCIL_LIGHT} fontFamily="'Cambay', sans-serif">Clean handoff — deal closed</text>
                </motion.g>

                {/* ── Ghost Integration Zone ── */}
                <motion.g initial={{ opacity: 0 }} animate={revealed ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.8 }}>
                  <path d={paths['a_ghost_zone'] as string} fill="rgba(0,0,0,0.015)" stroke={PENCIL_FAINT} strokeWidth="0.7" strokeDasharray="6 4" opacity={0.4} filter="url(#ia-sketch2)" />
                  <text x="250" y={AFTER_LAYERS[3].y + 65 + 62 + 9} textAnchor="middle" fontSize="6.5" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" fontWeight="700" letterSpacing="1.5">SYSTEM COMPLEXITY — ABSORBED BEHIND UX</text>
                  {GHOST_INTEGRATIONS.map((name, gi) => {
                    const ghostY = AFTER_LAYERS[3].y + 65 + 62;
                    const gx = 18 + gi * 46;
                    return (
                      <g key={`ghost-${gi}`}>
                        <path d={paths[`a_ghost_${gi}`] as string} fill="rgba(0,0,0,0.02)" stroke={PENCIL_FAINT} strokeWidth="0.5" strokeDasharray="3 3" opacity={0.4} filter="url(#ia-sketch2)" />
                        <text x={gx + 20} y={ghostY + 26} textAnchor="middle" fontSize="5.5" fill={PENCIL_FAINT} fontFamily="'Cambay', sans-serif" opacity={0.5}>{name}</text>
                        <line x1={gx + 4} y1={ghostY + 24} x2={gx + 36} y2={ghostY + 24} stroke={PENCIL_FAINT} strokeWidth="0.4" opacity={0.25} />
                      </g>
                    );
                  })}
                  <text x="250" y={AFTER_LAYERS[3].y + 65 + 62 + 42} textAnchor="middle" fontSize="5.5" fill={INK_BLUE} fontFamily="'Cambay', sans-serif" fontStyle="italic" opacity={0.5}>Same 10 integrations — now invisible to the user</text>
                </motion.g>
              </svg>
            </motion.div>
          </div>

          {/* ── Annotation cards below (3 columns matching Before) ── */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5"
            initial={{ opacity: 0, y: 12 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Before → After direct comparison */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.015)', border: `1px solid ${PAPER_LINES}`, transform: 'rotate(0.3deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: PENCIL_LIGHT, letterSpacing: '0.5px', fontWeight: 700 }}>🔄 BEFORE → AFTER</div>
              {[
                { from: '11 flat steps', to: '4 progressive layers', color: '#4ADE80' },
                { from: '7 exposed integrations', to: '0 user-facing integrations', color: '#60A5FA' },
                { from: '3 cross-wired dependencies', to: 'Vertical-only flow', color: '#FBBF24' },
                { from: '0 validation gates', to: '4 inline validation gates', color: '#C084FC' },
                { from: '3-5 day approval wait', to: 'Inline approval (Layer 3)', color: '#4ADE80' },
              ].map((item, i) => (
                <div key={i} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-['Cambay',sans-serif] text-[11px] line-through" style={{ color: INK_RED, opacity: 0.5 }}>{item.from}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: INK_BLUE }}>{item.to}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Architectural principles */}
            <div className="rounded-xl p-4" style={{ background: INK_BLUE_BG, border: `1px dashed rgba(45,95,138,0.15)`, transform: 'rotate(-0.3deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: INK_BLUE, letterSpacing: '0.5px', fontWeight: 700 }}>✓ ARCHITECTURAL PRINCIPLES</div>
              {AFTER_PRINCIPLES.map((p, i) => (
                <div key={i} className="flex items-start gap-1.5 mb-2 last:mb-0">
                  <span className="font-['Cambay',sans-serif] text-[12px] shrink-0" style={{ color: '#4ADE80' }}>✓</span>
                  <span className="font-['Cambay',sans-serif] text-[12px] leading-[1.5]" style={{ color: PENCIL }}>{p}</span>
                </div>
              ))}
              <div className="mt-3 pt-2" style={{ borderTop: `1px dashed rgba(45,95,138,0.15)` }}>
                <div className="font-['Cambay',sans-serif] text-[11px] italic" style={{ color: INK_BLUE, opacity: 0.7 }}>
                  ✏️ "Complexity doesn't disappear — it gets placed where the system can handle it, not the user."
                </div>
              </div>
            </div>

            {/* Impact / Results */}
            <div className="rounded-xl p-4" style={{ background: HIGHLIGHT_G, border: `1px dashed rgba(74,222,128,0.3)`, transform: 'rotate(-0.6deg)' }}>
              <div className="font-['Cambay',sans-serif] text-[11px] mb-2.5" style={{ color: '#166534', letterSpacing: '0.5px', fontWeight: 700 }}>💡 MEASURABLE IMPACT</div>
              {[
                { metric: '4 gates', desc: 'inline validation — errors caught at source' },
                { metric: '~20%', desc: 'cognitive load per layer (vs 100% spike)' },
                { metric: '0 days', desc: 'approval wait (inline at Layer 3)' },
                { metric: '10 → 0', desc: 'integrations exposed to user' },
              ].map((item, i) => (
                <div key={i} className="flex items-baseline gap-2 mb-1.5 last:mb-0">
                  <span className="font-['Cambay',sans-serif] text-[14px] shrink-0" style={{ color: '#166534', fontWeight: 700 }}>{item.metric}</span>
                  <span className="font-['Cambay',sans-serif] text-[11px] leading-[1.4]" style={{ color: '#166534' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Back to before link */}
          <motion.div
            className="mt-5 flex items-center justify-center gap-2 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
            <button
              onClick={() => setActivePanel('before')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-['Cambay',sans-serif] text-[11px] transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: INK_RED_BG, color: INK_RED, border: `1px solid rgba(184,66,51,0.15)` }}
            >
              ← Compare with legacy architecture
            </button>
            <div className="h-px flex-1" style={{ background: PAPER_LINES }} />
          </motion.div>
        </motion.div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="px-6 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${PAPER_LINES}` }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: INK_RED, opacity: 0.4 }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: INK_BLUE, opacity: 0.4 }} />
          </div>
          <span className="font-['Cambay',sans-serif] text-[11px]" style={{ color: PENCIL_FAINT }}>
            {activePanel === 'before' ? '11 steps · 7 integrations · 3 hidden cross-wires' : '4 layers · 4 validation gates · 10 integrations absorbed · vertical flow only'}
          </span>
        </div>
        <span className="font-['Cambay',sans-serif] text-[10px]" style={{ color: PENCIL_FAINT, opacity: 0.5 }}>
          architecture comparison — before / after
        </span>
      </div>
    </div>
  );
}