import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════
   CLOSING JOURNEY DOODLE — Animated Story
   ────────────────────────────────────────
   A single contained viewport that auto-plays through 6 design process
   phases as animated scenes, then closes with a horizontal journey strip
   connecting all milestones. Loops infinitely.
   ═══════════════════════════════════════════════════════════════════════ */

const ACCENT     = '#00A87C';
const ACCENT_DIM = 'var(--cpq-accent-dim, rgba(0,168,124,0.15))';
const GLASS      = 'var(--cpq-glass, rgba(255,255,255,0.055))';
const GLASS_BORDER = 'var(--cpq-glass-border, rgba(255,255,255,0.10))';
const PAPER      = '#F8F4EF';
const INK        = '#3D3229';

/* ── Phase data ─────────────────────────────────────────────────── */
interface Phase {
  num: string;
  label: string;
  color: string;
  title: string;
  brief: string;
}

const PHASES: Phase[] = [
  { num: '01', label: 'MOODBOARDS',    color: '#F59E0B', title: 'Setting the Visual Direction',    brief: 'Gathering visual references and establishing the design language for enterprise CPQ' },
  { num: '02', label: 'RESEARCH',      color: '#E68A30', title: 'Mapping Agent Pain Points',       brief: 'Contextual interviews and journey mapping revealed three critical failure zones' },
  { num: '03', label: 'IDEATION',      color: '#B07D4A', title: 'Exploring Concepts',              brief: 'Sketching 12+ layout concepts — Live Snapshot and cart flow emerged here' },
  { num: '04', label: 'ARCHITECTURE',  color: '#5A9B7D', title: 'Restructuring the Cognitive Model', brief: 'Information architecture built on a 4-step cognitive load distribution' },
  { num: '05', label: '23 ITERATIONS', color: '#28A98B', title: 'Refining Through Repetition',     brief: 'Each round surfaced a new edge case in product configuration' },
  { num: '06', label: 'SHIPPED',       color: '#00A87C', title: 'Delivering Measurable Impact',    brief: 'Live Snapshot, cart flow, step progression, and inline approvals — shipped' },
];

/* ── Timing ─────────────────────────────────────────────────────── */
const PHASE_DURS = [3600, 3600, 3600, 3600, 3600, 4200, 9500]; // ms per scene
const TOTAL_SCENES = PHASES.length + 1; // 0-5 = process, 6 = journey strip

/* ── Journey strip path ─────────────────────────────────────────── */
const NODE_XS = [80, 240, 400, 560, 720, 880];
const PATH_Y  = 175;
const DRAW_DUR = 4.5;
const NODE_STAGGER = 0.6;
const NODE_START   = 0.4;

const PATH_D = (() => {
  const amp = 30;
  let d = `M ${NODE_XS[0]},${PATH_Y}`;
  for (let i = 0; i < NODE_XS.length - 1; i++) {
    const x0 = NODE_XS[i], x1 = NODE_XS[i + 1];
    const cpy = PATH_Y + (i % 2 === 0 ? -amp : amp);
    d += ` C ${x0 + 50},${cpy} ${x1 - 50},${cpy} ${x1},${PATH_Y}`;
  }
  return d;
})();

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function ClosingJourneyDoodle() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapRef, { once: true, margin: '-60px' });
  const [scene, setScene] = useState(-1);

  /* Start on scroll into view */
  useEffect(() => {
    if (isInView && scene === -1) setScene(0);
  }, [isInView, scene]);

  /* Auto-advance scenes */
  useEffect(() => {
    if (scene < 0) return;
    const timer = setTimeout(() => {
      setScene(s => (s + 1) % TOTAL_SCENES);
    }, PHASE_DURS[scene]);
    return () => clearTimeout(timer);
  }, [scene]);

  const activeColor = scene >= 0 && scene < 6 ? PHASES[scene].color : ACCENT;

  return (
    <div
      ref={wrapRef}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: GLASS, border: `1px solid ${GLASS_BORDER}` }}
    >
      {/* ── Glass header ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: ACCENT_DIM }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M3 3h10M3 8h6M3 13h8" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] text-white/40">
            DESIGN PROCESS
          </span>
        </div>

        {/* Scene counter */}
        <AnimatePresence mode="wait">
          {scene >= 0 && scene < 6 && (
            <motion.span
              key={scene}
              className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px]"
              style={{ color: `${activeColor}80` }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            >
              {PHASES[scene].num} / 06
            </motion.span>
          )}
          {scene === 6 && (
            <motion.span
              key="strip"
              className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] text-white/25"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            >
              THE COMPLETE JOURNEY
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Canvas ── */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '5 / 2', background: PAPER }}
      >
        <AnimatePresence mode="wait">
          {scene >= 0 && (
            <motion.div
              key={scene}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            >
              {scene < 6
                ? <ProcessScene index={scene} />
                : <JourneyStripScene />
              }
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress bar ── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {Array.from({ length: TOTAL_SCENES }, (_, i) => {
            const c = i < 6 ? PHASES[i].color : ACCENT;
            const active = i === scene;
            return (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: active ? 18 : 6,
                  height: 6,
                  background: active ? c : `${INK}15`,
                }}
              />
            );
          })}
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{ boxShadow: 'inset 0 0 50px rgba(0,0,0,0.04)' }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROCESS SCENE — one animated scene per design phase
   ═══════════════════════════════════════════════════════════════════ */
function ProcessScene({ index }: { index: number }) {
  const p = PHASES[index];
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pt-3 pb-8">
      {/* Phase label */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="mb-1"
      >
        <span
          className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[5px]"
          style={{ color: p.color }}
        >
          {p.num} · {p.label}
        </span>
      </motion.div>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="w-full max-w-[460px] flex-1 min-h-0"
      >
        <svg
          viewBox="0 0 460 155"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <SceneIllustration index={index} color={p.color} />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="font-['Bebas_Neue',sans-serif] text-[18px] sm:text-[22px] tracking-[1px] text-center mb-0.5"
        style={{ color: INK }}
      >
        {p.title}
      </motion.h3>

      {/* Brief */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.35, delay: 0.4 }}
        className="font-['Cambay',sans-serif] text-[10px] sm:text-[11px] text-center max-w-[380px] leading-[1.6]"
        style={{ color: INK }}
      >
        {p.brief}
      </motion.p>
    </div>
  );
}

/* ── Scene illustrations ────────────────────────────────────────── */
function SceneIllustration({ index, color }: { index: number; color: string }) {
  switch (index) {
    case 0: return <IllMoodboard color={color} />;
    case 1: return <IllResearch color={color} />;
    case 2: return <IllIdeation color={color} />;
    case 3: return <IllArchitecture color={color} />;
    case 4: return <IllIterations color={color} />;
    case 5: return <IllShipped color={color} />;
    default: return null;
  }
}

/* ── 01 MOODBOARDS — board with color swatches ─────────────────── */
function IllMoodboard({ color }: { color: string }) {
  const swatches = PHASES.map((p, i) => ({
    x: 140 + (i % 3) * 62,
    y: 20 + Math.floor(i / 3) * 58,
    w: 50, h: 46,
    c: p.color,
  }));
  return (
    <>
      {/* Board frame */}
      <motion.rect
        x="120" y="8" width="220" height="138" rx="6"
        stroke={color} strokeWidth="1.5" fill="none" opacity={0.2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Swatches */}
      {swatches.map((s, i) => (
        <motion.rect
          key={i}
          x={s.x} y={s.y} width={s.w} height={s.h} rx="4"
          fill={s.c}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 + i * 0.13, duration: 0.4, ease: 'easeOut' }}
        />
      ))}
      {/* Pin dots */}
      {swatches.map((s, i) => (
        <motion.circle
          key={`p${i}`}
          cx={s.x + s.w / 2} cy={s.y + 3} r="1.5"
          fill={INK} opacity={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 0.7 + i * 0.13, duration: 0.3 }}
        />
      ))}
      {/* Connecting thread lines between pin dots */}
      <motion.path
        d={`M${swatches[0].x + 25},${swatches[0].y + 3} L${swatches[1].x + 25},${swatches[1].y + 3} L${swatches[2].x + 25},${swatches[2].y + 3}`}
        stroke={INK} strokeWidth="0.5" fill="none" opacity={0}
        strokeDasharray="2 3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      />
    </>
  );
}

/* ── 02 RESEARCH — journey line with pain markers ──────────────── */
function IllResearch({ color }: { color: string }) {
  const points = [
    { x: 130, label: 'Config errors', vy: -28 },
    { x: 230, label: 'Invisible approvals', vy: 28 },
    { x: 330, label: 'No real-time feedback', vy: -24 },
  ];
  return (
    <>
      {/* Baseline */}
      <line x1="50" y1="78" x2="410" y2="78" stroke={INK} strokeWidth="0.5" opacity={0.06} />
      {/* Journey wave */}
      <motion.path
        d="M50,78 Q90,50 130,78 Q170,106 210,78 Q250,50 290,78 Q330,106 370,78 Q390,64 410,78"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Magnifying glass */}
      <motion.g
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <circle cx="56" cy="38" r="14" stroke={color} strokeWidth="1.5" fill="none" />
        <line x1="66" y1="48" x2="78" y2="60" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      {/* Pain markers */}
      {points.map((pp, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + i * 0.3, duration: 0.45 }}
        >
          <circle cx={pp.x} cy={78} r="5" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
          <line
            x1={pp.x} y1={78 + (pp.vy > 0 ? 5 : -5)}
            x2={pp.x} y2={78 + pp.vy}
            stroke="rgba(239,68,68,0.25)" strokeWidth="0.5" strokeDasharray="2 2"
          />
          <text
            x={pp.x} y={78 + pp.vy + (pp.vy > 0 ? 11 : -5)}
            textAnchor="middle" fill="rgba(239,68,68,0.55)" fontSize="7"
            fontFamily="'Cambay', sans-serif"
          >
            {pp.label}
          </text>
        </motion.g>
      ))}
    </>
  );
}

/* ── 03 IDEATION — overlapping concept cards ───────────────────── */
function IllIdeation({ color }: { color: string }) {
  const concepts = [
    { x: 100, y: 30, w: 110, h: 80, label: 'Step Progression', delay: 0.4 },
    { x: 160, y: 20, w: 110, h: 80, label: 'Cart Flow', delay: 0.6 },
    { x: 220, y: 35, w: 130, h: 90, label: 'Live Snapshot', delay: 0.8, highlight: true },
  ];
  return (
    <>
      {/* Sketch pencil lines (background texture) */}
      {[40, 65, 90, 115].map(y => (
        <motion.line
          key={y}
          x1="80" y1={y} x2="380" y2={y}
          stroke={INK} strokeWidth="0.3" opacity={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
      ))}
      {/* Concept cards */}
      {concepts.map((c, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: c.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <rect
            x={c.x} y={c.y} width={c.w} height={c.h} rx="4"
            fill="white" stroke={c.highlight ? color : INK}
            strokeWidth={c.highlight ? 2 : 1}
            opacity={c.highlight ? 1 : 0.15}
          />
          {/* Card "content" lines */}
          <rect x={c.x + 8} y={c.y + 10} width={c.w * 0.6} height="3" rx="1" fill={c.highlight ? color : INK} opacity={c.highlight ? 0.3 : 0.06} />
          <rect x={c.x + 8} y={c.y + 18} width={c.w * 0.4} height="3" rx="1" fill={c.highlight ? color : INK} opacity={c.highlight ? 0.2 : 0.04} />
          {/* Sidebar indicator on highlighted */}
          {c.highlight && (
            <rect x={c.x + c.w - 30} y={c.y + 8} width="22" height={c.h - 16} rx="2" fill={color} opacity={0.12} />
          )}
          {/* Label */}
          <text
            x={c.x + c.w / 2} y={c.y + c.h + 14}
            textAnchor="middle" fontSize="7"
            fontFamily="'Cambay', sans-serif"
            fill={c.highlight ? color : INK}
            opacity={c.highlight ? 0.7 : 0.3}
          >
            {c.label}
          </text>
        </motion.g>
      ))}
      {/* Star on winner */}
      <motion.text
        x="285" y="32"
        fill={color} fontSize="14" opacity={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.3, duration: 0.3 }}
      >
        ★
      </motion.text>
    </>
  );
}

/* ── 04 ARCHITECTURE — hierarchy tree + load bars ──────────────── */
function IllArchitecture({ color }: { color: string }) {
  const steps = [
    { x: 120, pct: 40, label: 'Step 1' },
    { x: 200, pct: 20, label: 'Step 2' },
    { x: 280, pct: 20, label: 'Step 3' },
    { x: 340, pct: 20, label: 'Step 4' },
  ];
  return (
    <>
      {/* Root node */}
      <motion.rect
        x="200" y="8" width="60" height="24" rx="4"
        stroke={color} strokeWidth="1.5" fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      />
      <motion.text
        x="230" y="24" textAnchor="middle" fill={color} fontSize="9"
        fontFamily="'Bebas Neue', sans-serif" letterSpacing="1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        CPQ
      </motion.text>
      {/* Connector lines from root to children */}
      <motion.path
        d={`M230,32 L230,44 M${steps[0].x},44 L${steps[3].x},44`}
        stroke={color} strokeWidth="1" fill="none" opacity={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />
      {/* Child nodes + load bars */}
      {steps.map((s, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
        >
          {/* Vertical connector */}
          <line x1={s.x} y1={44} x2={s.x} y2={52} stroke={color} strokeWidth="1" opacity={0.25} />
          {/* Node box */}
          <rect
            x={s.x - 25} y={52} width="50" height="20" rx="3"
            stroke={color} strokeWidth="1" fill="white" opacity={0.9}
          />
          <text
            x={s.x} y={65} textAnchor="middle" fill={INK} fontSize="7"
            fontFamily="'Cambay', sans-serif" opacity={0.5}
          >
            {s.label}
          </text>
          {/* Load bar */}
          <rect
            x={s.x - 20} y={82} width="40" height={4} rx="2"
            fill={INK} opacity={0.05}
          />
          <motion.rect
            x={s.x - 20} y={82} height={4} rx="2"
            fill={color}
            initial={{ width: 0 }}
            animate={{ width: s.pct }}
            transition={{ delay: 1.0 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            opacity={0.45}
          />
          {/* Percentage */}
          <motion.text
            x={s.x} y={98} textAnchor="middle"
            fill={color} fontSize="9"
            fontFamily="'Bebas Neue', sans-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.2 + i * 0.12, duration: 0.3 }}
          >
            {s.pct}%
          </motion.text>
        </motion.g>
      ))}
      {/* Arrow label */}
      <motion.text
        x="230" y="118" textAnchor="middle"
        fill={INK} fontSize="6.5" fontFamily="'Cambay', sans-serif" opacity={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ delay: 1.8, duration: 0.3 }}
      >
        Front-loaded validation catches errors early
      </motion.text>
    </>
  );
}

/* ── 05 ITERATIONS — stacking layers with counter ──────────────── */
function IllIterations({ color }: { color: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= 23) return;
    const t = setTimeout(() => setCount(c => c + 1), 42);
    return () => clearTimeout(t);
  }, [count]);

  const layers = Math.min(count, 10);
  return (
    <>
      {/* Stacking wireframe layers */}
      {Array.from({ length: layers }, (_, i) => (
        <rect
          key={i}
          x={155 + i * 2.5} y={18 + i * 4}
          width="120" height="75" rx="3"
          stroke={color} strokeWidth="0.8" fill="white"
          opacity={0.08 + (i / 10) * 0.25}
        />
      ))}
      {/* Topmost frame (the "current" iteration) */}
      <motion.rect
        x={155 + layers * 2.5} y={18 + layers * 4}
        width="120" height="75" rx="3"
        stroke={color} strokeWidth="1.5" fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      />
      {/* Content lines in top frame */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <rect x={163 + layers * 2.5} y={28 + layers * 4} width="50" height="3" rx="1" fill={color} />
        <rect x={163 + layers * 2.5} y={36 + layers * 4} width="35" height="3" rx="1" fill={color} />
        <rect x={163 + layers * 2.5} y={50 + layers * 4} width="100" height="15" rx="2" fill={color} opacity={0.5} />
        <rect x={163 + layers * 2.5} y={70 + layers * 4} width="40" height="10" rx="5" fill={color} />
      </motion.g>
      {/* Large counter */}
      <motion.text
        x="340" y="82"
        textAnchor="middle" fill={color}
        fontSize="56" fontFamily="'Bebas Neue', sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {count}
      </motion.text>
      {/* Circular arrow around counter */}
      <motion.path
        d="M368,50 A30,30 0 1,1 350,30"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M368,46 L368,54 L375,51"
        stroke={color} strokeWidth="1.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 0.3 }}
      />
      {/* Subtitle */}
      <motion.text
        x="340" y="105" textAnchor="middle"
        fill={INK} fontSize="7" fontFamily="'Cambay', sans-serif" opacity={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.3, duration: 0.3 }}
      >
        rounds on product details
      </motion.text>
    </>
  );
}

/* ── 06 SHIPPED — monitor + checkmark + metrics ────────────────── */
function IllShipped({ color }: { color: string }) {
  const metrics = [
    { x: 140, v: '\u221981%', l: 'Errors' },
    { x: 230, v: '\u221942%', l: 'Quote Time' },
    { x: 320, v: '\u221960%', l: 'Training' },
  ];
  return (
    <>
      {/* Monitor frame */}
      <motion.rect
        x="145" y="4" width="170" height="95" rx="5"
        stroke={color} strokeWidth="2" fill="white" fillOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Stand */}
      <motion.path
        d="M230,99 L230,112 M215,112 L245,112"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      />
      {/* Screen content */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {/* Sidebar */}
        <rect x="153" y="14" width="32" height="77" rx="2" fill={color} opacity={0.2} />
        {/* Content blocks */}
        <rect x="190" y="14" width="118" height="16" rx="2" fill={INK} opacity={0.08} />
        <rect x="190" y="35" width="85" height="10" rx="2" fill={INK} opacity={0.05} />
        <rect x="190" y="50" width="100" height="10" rx="2" fill={INK} opacity={0.05} />
        <rect x="190" y="65" width="70" height="10" rx="2" fill={INK} opacity={0.05} />
        {/* Button */}
        <rect x="190" y="80" width="40" height="8" rx="4" fill={color} opacity={0.3} />
      </motion.g>
      {/* Big checkmark */}
      <motion.path
        d="M210,48 L222,60 L250,32"
        stroke={color} strokeWidth="4" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.7 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Glow behind checkmark */}
      <motion.circle
        cx="230" cy="48" r="22"
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.1, 0.05, 0.1, 0.05] }}
        transition={{ delay: 1.6, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(10px)' }}
      />
      {/* Metric badges */}
      {metrics.map((m, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 + i * 0.15, duration: 0.4 }}
        >
          <rect x={m.x - 30} y="122" width="60" height="22" rx="11" fill={color} opacity={0.08} stroke={color} strokeWidth="0.5" strokeOpacity={0.15} />
          <text x={m.x} y="136" textAnchor="middle" fill={color} fontSize="10" fontFamily="'Bebas Neue', sans-serif">
            {m.v}
          </text>
          <text x={m.x} y="150" textAnchor="middle" fill={INK} fontSize="6" fontFamily="'Cambay', sans-serif" opacity={0.3}>
            {m.l}
          </text>
        </motion.g>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   JOURNEY STRIP SCENE — finale with all milestones
   ═══════════════════════════════════════════════════════════════════ */
function JourneyStripScene() {
  const pathRef  = useRef<SVGPathElement>(null);
  const sparkRef = useRef<SVGCircleElement>(null);
  const [pathLen, setPathLen] = useState(920);

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  /* Spark follows path tip */
  useEffect(() => {
    if (!pathRef.current || !sparkRef.current) return;
    const path = pathRef.current;
    const spark = sparkRef.current;
    const total = path.getTotalLength();
    const dur = DRAW_DUR * 1000;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const raw = Math.min((now - t0) / dur, 1);
      const pt = path.getPointAtLength(easeOutCubic(raw) * total);
      spark.setAttribute('cx', String(pt.x));
      spark.setAttribute('cy', String(pt.y));
      spark.setAttribute('opacity', raw < 0.01 || raw > 0.97 ? '0' : '0.85');
      if (raw < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pathLen]);

  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 960 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="jGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="25%" stopColor="#D08640" />
            <stop offset="55%" stopColor="#5A9B7D" />
            <stop offset="100%" stopColor="#00A87C" />
          </linearGradient>
          <filter id="aGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="sGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Dot grid */}
        {Array.from({ length: 23 }, (_, xi) =>
          Array.from({ length: 8 }, (_, yi) => (
            <circle key={`d${xi}${yi}`} cx={40 + xi * 40} cy={20 + yi * 40} r="0.7" fill={INK} opacity={0.05} />
          )),
        )}

        {/* Measurement path */}
        <path ref={pathRef} d={PATH_D} fill="none" stroke="none" />

        {/* Shadow path */}
        <motion.path
          d={PATH_D} fill="none"
          stroke="rgba(61,50,41,0.04)" strokeWidth="10" strokeLinecap="round"
          style={{ filter: 'blur(6px)' }}
          initial={{ strokeDasharray: pathLen, strokeDashoffset: pathLen }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: DRAW_DUR, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Main gradient path */}
        <motion.path
          d={PATH_D} fill="none"
          stroke="url(#jGrad)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ strokeDasharray: pathLen, strokeDashoffset: pathLen }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: DRAW_DUR, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Spark */}
        <circle ref={sparkRef} r="5" fill="white" opacity="0" filter="url(#sGlow)" />

        {/* Nodes */}
        {PHASES.map((p, i) => {
          const d = NODE_START + i * NODE_STAGGER;
          const x = NODE_XS[i];
          return (
            <g key={i}>
              {/* Glow */}
              <motion.circle
                cx={x} cy={PATH_Y} r="26" fill={p.color} filter="url(#aGlow)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.28, 0.1, 0.28, 0.1, 0.28] }}
                transition={{ duration: 4.5, delay: d + 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Dot */}
              <motion.circle
                cx={x} cy={PATH_Y} r="7" fill={p.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: d }}
              />
              <motion.circle
                cx={x} cy={PATH_Y} r="3" fill={PAPER}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: d + 0.1 }}
              />
              {/* Dashed connector */}
              <motion.line
                x1={x} y1={PATH_Y - 7} x2={x} y2={PATH_Y - 42}
                stroke={p.color} strokeWidth="1" strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 0.4, delay: d + 0.1 }}
              />
              {/* Icon medallion */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: d + 0.15 }}
              >
                <circle cx={x} cy={PATH_Y - 65} r="22" fill="white" opacity={0.95} />
                <circle cx={x} cy={PATH_Y - 65} r="22" fill="none" stroke={p.color} strokeWidth="1.5" opacity={0.4} />
                <g transform={`translate(${x},${PATH_Y - 65})`}>
                  <PhaseIcon index={i} color={p.color} />
                </g>
              </motion.g>
              {/* Label */}
              <motion.text
                x={x} y={PATH_Y + 28} textAnchor="middle"
                fill={INK} fontSize="10" fontFamily="'Bebas Neue', sans-serif" letterSpacing="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                transition={{ duration: 0.4, delay: d + 0.2 }}
              >
                {p.label}
              </motion.text>
              <motion.text
                x={x} y={PATH_Y + 44} textAnchor="middle"
                fill={INK} fontSize="7.5" fontFamily="'Cambay', sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.4, delay: d + 0.25 }}
              >
                {p.title}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PHASE ICONS — small SVG doodles (used in journey strip nodes)
   ═══════════════════════════════════════════════════════════════════ */
function PhaseIcon({ index, color }: { index: number; color: string }) {
  const s = {
    stroke: color, strokeWidth: 1.5,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (index) {
    case 0: return (
      <g>
        <rect x="-10" y="-8" width="20" height="16" rx="2" {...s} />
        <rect x="-6" y="-4" width="5" height="4" rx="1" fill={color} opacity={0.25} />
        <rect x="-6" y="2" width="5" height="4" rx="1" fill={color} opacity={0.15} />
        <rect x="1" y="-4" width="5" height="10" rx="1" fill={color} opacity={0.2} />
      </g>
    );
    case 1: return (
      <g>
        <circle cx="-2" cy="-2" r="6" {...s} />
        <line x1="2" y1="2" x2="8" y2="8" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <path d="M-8,10 Q-2,7 4,10" {...s} strokeWidth={1} opacity={0.3} />
      </g>
    );
    case 2: return (
      <g>
        <path d="M0,-9 C-5,-9 -7,-5 -7,0 C-7,3 -4,6 -4,8 L4,8 C4,6 7,3 7,0 C7,-5 5,-9 0,-9Z" {...s} />
        <line x1="-2" y1="10" x2="2" y2="10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
    case 3: return (
      <g>
        <rect x="-4" y="-11" width="8" height="6" rx="1.5" {...s} />
        <rect x="-13" y="1" width="8" height="6" rx="1.5" {...s} />
        <rect x="5" y="1" width="8" height="6" rx="1.5" {...s} />
        <path d="M0,-5 L0,0 M-9,0 L9,0 M-9,0 L-9,1 M9,0 L9,1" stroke={color} strokeWidth={0.8} opacity={0.3} />
      </g>
    );
    case 4: return (
      <g>
        <path d="M7,-2 A7,7 0 1,0 1,-7" {...s} />
        <path d="M7,-5 L7,0 L11,-1" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
        <text x="0" y="3" textAnchor="middle" fill={color} fontSize="8" fontFamily="'Bebas Neue', sans-serif">23</text>
      </g>
    );
    case 5: return (
      <g>
        <rect x="-10" y="-8" width="20" height="13" rx="2" {...s} />
        <line x1="0" y1="5" x2="0" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <line x1="-4" y1="8" x2="4" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M-3,-3 L-1,0 L4,-5" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
    default: return null;
  }
}