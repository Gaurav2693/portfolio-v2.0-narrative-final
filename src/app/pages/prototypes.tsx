import {
  ArrowLeft, ExternalLink, ChevronRight, ChevronLeft,
  Box, Cpu, Gamepad2, Map, RefreshCw,
  Maximize2, Minimize2, AlertCircle, Palette,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSound } from '@/app/context/sound-context';
import NavigationSidebar from '@/app/components/navigation-sidebar';
import Header from '@/app/components/header';

/* ═══════════════════════════════════════════════════════════════════════
   PROTOTYPES PAGE — Engineering & Prototyping Room
   ─────────────────────────────────────────────────
   Split-panel layout:
     Left  → description, purpose, tech stack, context
     Right → live iframe window to the prototype

   5 prototypes, selectable from a vertical menu on the left.
   Follows the same dark-glass aesthetic as the rest of the portfolio.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Design tokens ──────────────────────────────────────────────────── */
const T = {
  accent:      '#00A87C',
  accentSoft:  'rgba(0,168,124,0.12)',
  accentBorder:'rgba(0,168,124,0.20)',
  accentGlow:  'rgba(0,168,124,0.06)',
  bg:          '#0A0E14',
  card:        'rgba(12,16,24,0.92)',
  cardBorder:  'rgba(255,255,255,0.06)',
  ink:         '#FFFFFF',
  inkSoft:     'rgba(255,255,255,0.70)',
  inkMuted:    'rgba(255,255,255,0.45)',
  inkFaint:    'rgba(255,255,255,0.25)',
  inkGhost:    'rgba(255,255,255,0.10)',
  divider:     'rgba(255,255,255,0.06)',
  surfaceHover:'rgba(255,255,255,0.04)',
};

/* ── Prototype data ──────────────────────────────────────────────── */
interface Prototype {
  id: string;
  title: string;
  domain: string;
  domainColor: string;
  description: string;
  purpose: string;
  stack: string[];
  liveUrl: string;
  icon: typeof Box;
  status: 'live' | 'beta' | 'demo' | 'archived';
}

const PROTOTYPES: Prototype[] = [
  {
    id: 'cpq-dashboard',
    title: 'CPQ Dashboard v2',
    domain: 'ENTERPRISE PRICING',
    domainColor: '#00A87C',
    description:
      'A fully interactive React prototype of the CPQ pricing engine dashboard. Built to validate configuration workflows, pricing rule hierarchies, and approval chains with real stakeholders before committing to production code.',
    purpose:
      'Prove that a complex multi-step pricing configuration can feel fast and forgiving. The prototype surfaces edge cases around discount stacking, margin guardrails, and quote approval routing that static mockups cannot capture.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Motion'],
    liveUrl: 'https://cpq-dashboard-v2.vercel.app/',
    icon: Cpu,
    status: 'live',
  },
  {
    id: 'plotsync-platform',
    title: 'PlotSync Decision Platform',
    domain: 'REAL ESTATE AI',
    domainColor: '#FFB033',
    description:
      'An interactive platform prototype for evaluating and comparing land parcels. Integrates spatial map views, ownership verification layers, and multi-criteria scoring into a single decision interface.',
    purpose:
      'Test whether combining map-based spatial selection with tabular comparison reduces decision time for land buyers. The prototype validates that trust signals (ownership docs, zoning overlays) can be surfaced contextually without overloading the primary evaluation flow.',
    stack: ['React', 'TypeScript', 'Mapbox GL', 'Tailwind CSS', 'Motion'],
    liveUrl: 'https://projects-mauve-one.vercel.app/',
    icon: Map,
    status: 'beta',
  },
  {
    id: 'exiro-ai',
    title: 'Exiro AI Automation',
    domain: 'AI OPERATIONS',
    domainColor: '#8B5CF6',
    description:
      'A prototype of the Exiro AI operator console, where AI agents handle routine decisions and escalate ambiguous ones to human operators. Focused on making AI behavior transparent and controllable.',
    purpose:
      'Validate that operators can maintain situational awareness when AI is acting autonomously. The prototype tests whether real-time confidence scores, decision audit trails, and manual override affordances build sufficient trust for hands-off operation.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Motion', 'Recharts'],
    liveUrl: 'https://exiro-ai-console.vercel.app/',
    icon: Box,
    status: 'demo',
  },
  {
    id: 'stillroom',
    title: 'Stillroom Thinking Canvas',
    domain: 'SPATIAL TOOL',
    domainColor: '#00EAFF',
    description:
      'An infinite spatial canvas for structured thinking and mental model mapping. Built to explore how freeform spatial layouts can support reasoning, note-taking, and idea synthesis in ways linear documents cannot.',
    purpose:
      'Validate whether a spatial canvas with structured primitives (cards, connectors, zones) helps designers and researchers externalize complex mental models faster than traditional outlining tools.',
    stack: ['React', 'TypeScript', 'Canvas API', 'Tailwind CSS', 'Motion'],
    liveUrl: 'https://stillroom-thinking-canvas.vercel.app/',
    icon: Palette,
    status: 'live',
  },
  {
    id: 'inertia-game',
    title: 'INERTIA',
    domain: 'GAME DESIGN',
    domainColor: '#FF6B6B',
    description:
      'A side-scrolling game featuring weather physics, color signal systems, and dynamic environmental layers. Designed to explore how game design thinking translates to interaction design decisions.',
    purpose:
      'Explore state machines, animation choreography, and player feedback loops, concepts directly transferable to complex UI state management. The project is a playground for experimenting with motion design principles at interactive speeds.',
    stack: ['React', 'TypeScript', 'Canvas API', 'Custom Physics', 'State Machines'],
    liveUrl: 'https://inertia-game-environment.vercel.app/',
    icon: Gamepad2,
    status: 'beta',
  },
];

/* ── Status badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Prototype['status'] }) {
  const map = {
    live: { label: 'LIVE', color: '#00A87C', bg: 'rgba(0,168,124,0.10)', border: 'rgba(0,168,124,0.20)' },
    beta: { label: 'BETA', color: '#FFB033', bg: 'rgba(255,176,51,0.10)', border: 'rgba(255,176,51,0.20)' },
    demo: { label: 'DEMO', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)' },
    archived: { label: 'ARCHIVED', color: '#FF5F57', bg: 'rgba(255,95,87,0.10)', border: 'rgba(255,95,87,0.20)' },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-[4px]"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 10,
        letterSpacing: 2,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full"
        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
      />
      {s.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════ */

export default function Prototypes() {
  const navigate = useNavigate();
  const { playClick } = useSound();

  const [activeIdx, setActiveIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const proto = PROTOTYPES[activeIdx];

  const selectProto = useCallback((idx: number) => {
    if (idx === activeIdx) return;
    playClick();
    setActiveIdx(idx);
    setIframeLoading(true);
    setIframeError(false);
    setIframeKey(k => k + 1);
  }, [activeIdx, playClick]);

  const reloadIframe = useCallback(() => {
    playClick();
    setIframeLoading(true);
    setIframeError(false);
    setIframeKey(k => k + 1);
  }, [playClick]);

  const toggleFullscreen = useCallback(() => {
    playClick();
    setIsFullscreen(f => !f);
  }, [playClick]);

  /* ── Keyboard nav ───────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveIdx(i => {
          const next = Math.max(0, i - 1);
          if (next !== i) {
            setIframeLoading(true);
            setIframeError(false);
            setIframeKey(k => k + 1);
          }
          return next;
        });
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveIdx(i => {
          const next = Math.min(PROTOTYPES.length - 1, i + 1);
          if (next !== i) {
            setIframeLoading(true);
            setIframeError(false);
            setIframeKey(k => k + 1);
          }
          return next;
        });
      }
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          navigate('/');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, isFullscreen]);

  /* ── Iframe load/error handlers ─────────────────────────── */
  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError(true);
  }, []);

  /* ── Check if URL is internal (same-origin) ─────────────── */
  const isInternal = proto.liveUrl.startsWith('/');

  return (
    <div className="relative min-h-screen w-full" style={{ background: T.bg }}>
      {/* Header + Nav */}
      <Header />
      <NavigationSidebar />

      {/* Main content area */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <AnimatePresence mode="wait">
          {isFullscreen ? (
            /* ═══ FULLSCREEN IFRAME ═══════════════════════════════ */
            <motion.div
              key="fullscreen"
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: T.bg }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Fullscreen toolbar */}
              <div
                className="flex items-center justify-between px-6 h-[48px] shrink-0"
                style={{ background: T.card, borderBottom: `1px solid ${T.cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: proto.domainColor, boxShadow: `0 0 8px ${proto.domainColor}` }}
                  />
                  <span
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: 1.5, color: T.inkSoft }}
                  >
                    {proto.title}
                  </span>
                  <StatusBadge status={proto.status} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={reloadIframe}
                    className="flex items-center justify-center size-[30px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <RefreshCw size={14} style={{ color: T.inkMuted }} />
                  </button>
                  {!isInternal && (
                    <a
                      href={proto.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center size-[30px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <ExternalLink size={14} style={{ color: T.inkMuted }} />
                    </a>
                  )}
                  <button
                    onClick={toggleFullscreen}
                    className="flex items-center justify-center size-[30px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <Minimize2 size={14} style={{ color: T.inkMuted }} />
                  </button>
                </div>
              </div>

              {/* Iframe */}
              <div className="flex-1 relative">
                {iframeLoading && <IframeLoader color={proto.domainColor} />}
                {iframeError && <IframeErrorState onRetry={reloadIframe} />}
                <iframe
                  key={iframeKey}
                  src={proto.liveUrl}
                  className="w-full h-full border-0"
                  style={{ opacity: iframeLoading || iframeError ? 0 : 1, transition: 'opacity 0.4s ease' }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={proto.title}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </motion.div>
          ) : (
            /* ═══ SPLIT PANEL VIEW ═══════════════════════════════ */
            <motion.div
              key="split"
              className="flex gap-0 w-full max-w-[1400px]"
              style={{ height: 'calc(100vh - 120px)', minHeight: 600, maxHeight: 860 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ─── LEFT PANEL ──────────────────────────────── */}
              <div
                className="flex flex-col w-[380px] shrink-0 rounded-l-[20px] overflow-hidden"
                style={{
                  background: `linear-gradient(165deg, ${T.card} 0%, rgba(8,12,20,0.96) 100%)`,
                  borderTop: `1px solid ${T.cardBorder}`,
                  borderLeft: `1px solid ${T.cardBorder}`,
                  borderBottom: `1px solid ${T.cardBorder}`,
                }}
              >
                {/* Back button + title */}
                <div className="px-6 pt-6 pb-4 shrink-0">
                  <button
                    onClick={() => { playClick(); navigate('/'); }}
                    className="flex items-center gap-2 cursor-pointer group mb-5"
                  >
                    <ArrowLeft size={14} style={{ color: T.inkFaint }} className="group-hover:translate-x-[-2px] transition-transform" />
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, color: T.inkFaint }} className="group-hover:text-white/40 transition-colors">
                      Command Center
                    </span>
                  </button>

                  <div className="flex items-center gap-3 mb-1">
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 10,
                        letterSpacing: 3,
                        color: T.accent,
                      }}
                    >
                      ENGINEERING & PROTOTYPING
                    </span>
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 36,
                      lineHeight: '34px',
                      letterSpacing: 0.5,
                      color: T.ink,
                    }}
                  >
                    Live Prototypes
                  </h1>
                  <p
                    className="mt-2"
                    style={{
                      fontFamily: "'Cambay', sans-serif",
                      fontSize: 12,
                      lineHeight: '19px',
                      color: T.inkMuted,
                    }}
                  >
                    Interactive builds shipped to validate design decisions before production commitment.
                  </p>
                </div>

                {/* Divider */}
                <div className="px-6">
                  <div className="h-px" style={{ background: T.divider }} />
                </div>

                {/* ── Prototype menu ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-custom">
                  <div className="flex flex-col gap-[2px]">
                    {PROTOTYPES.map((p, i) => {
                      const active = i === activeIdx;
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          onClick={() => selectProto(i)}
                          className="flex items-start gap-3 w-full text-left px-3 py-[10px] rounded-[10px] cursor-pointer transition-all group"
                          style={{
                            background: active ? T.accentSoft : 'transparent',
                            border: active ? `1px solid ${T.accentBorder}` : '1px solid transparent',
                          }}
                        >
                          {/* Numbered icon */}
                          <div
                            className="shrink-0 w-[32px] h-[32px] rounded-[8px] flex items-center justify-center mt-[1px] transition-colors"
                            style={{
                              background: active ? T.accent : T.inkGhost,
                            }}
                          >
                            <Icon size={15} style={{ color: active ? '#fff' : T.inkMuted }} strokeWidth={1.8} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-[1px]">
                              <span
                                style={{
                                  fontFamily: "'Bebas Neue', sans-serif",
                                  fontSize: 8,
                                  letterSpacing: 2,
                                  color: p.domainColor,
                                  opacity: active ? 1 : 0.6,
                                }}
                              >
                                {p.domain}
                              </span>
                              <StatusBadge status={p.status} />
                            </div>
                            <p
                              className="truncate"
                              style={{
                                fontFamily: "'Cambay', sans-serif",
                                fontSize: 13,
                                color: active ? T.ink : T.inkSoft,
                              }}
                            >
                              {p.title}
                            </p>
                            <p
                              className="line-clamp-1 mt-[1px]"
                              style={{
                                fontFamily: "'Cambay', sans-serif",
                                fontSize: 11,
                                color: T.inkFaint,
                              }}
                            >
                              {p.stack.join(' / ')}
                            </p>
                          </div>

                          {/* Active arrow */}
                          <ChevronRight
                            size={14}
                            className="shrink-0 mt-[9px] transition-opacity"
                            style={{
                              color: T.accent,
                              opacity: active ? 1 : 0,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom nav hint */}
                <div className="px-6 py-3 shrink-0" style={{ borderTop: `1px solid ${T.divider}` }}>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <kbd className="px-[5px] py-[1px] rounded-[3px] text-[9px]" style={{ background: T.inkGhost, color: T.inkFaint, fontFamily: "'Space Mono', monospace" }}>&uarr;</kbd>
                      <kbd className="px-[5px] py-[1px] rounded-[3px] text-[9px]" style={{ background: T.inkGhost, color: T.inkFaint, fontFamily: "'Space Mono', monospace" }}>&darr;</kbd>
                    </span>
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 10, color: T.inkFaint }}>
                      Navigate
                    </span>
                    <span className="mx-1" style={{ color: T.divider }}>|</span>
                    <kbd className="px-[5px] py-[1px] rounded-[3px] text-[9px]" style={{ background: T.inkGhost, color: T.inkFaint, fontFamily: "'Space Mono', monospace" }}>Esc</kbd>
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 10, color: T.inkFaint }}>
                      Back
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── RIGHT PANEL — Iframe ────────────────────── */}
              <div
                ref={iframeContainerRef}
                className="flex-1 flex flex-col rounded-r-[20px] overflow-hidden"
                style={{
                  background: 'rgba(6,10,18,0.96)',
                  borderTop: `1px solid ${T.cardBorder}`,
                  borderRight: `1px solid ${T.cardBorder}`,
                  borderBottom: `1px solid ${T.cardBorder}`,
                }}
              >
                {/* Toolbar */}
                <div
                  className="flex items-center justify-between px-5 h-[44px] shrink-0"
                  style={{ borderBottom: `1px solid ${T.divider}` }}
                >
                  <div className="flex items-center gap-3">
                    {/* Traffic lights */}
                    <div className="flex items-center gap-[6px]">
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#FF5F57' }} />
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#FEBC2E' }} />
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#28C840' }} />
                    </div>

                    {/* URL bar */}
                    <div
                      className="flex items-center gap-2 px-3 py-[3px] rounded-[6px] min-w-[200px]"
                      style={{ background: T.inkGhost }}
                    >
                      <div
                        className="w-[5px] h-[5px] rounded-full shrink-0"
                        style={{ background: proto.domainColor }}
                      />
                      <span
                        className="truncate"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: T.inkFaint,
                          maxWidth: 320,
                        }}
                      >
                        {proto.liveUrl}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={reloadIframe}
                      className="flex items-center justify-center size-[28px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                      title="Reload"
                    >
                      <RefreshCw size={13} style={{ color: T.inkMuted }} />
                    </button>
                    {!isInternal && (
                      <a
                        href={proto.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center size-[28px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                        title="Open in new tab"
                      >
                        <ExternalLink size={13} style={{ color: T.inkMuted }} />
                      </a>
                    )}
                    <button
                      onClick={toggleFullscreen}
                      className="flex items-center justify-center size-[28px] rounded-[6px] cursor-pointer transition-colors hover:bg-white/5"
                      title="Fullscreen"
                    >
                      <Maximize2 size={13} style={{ color: T.inkMuted }} />
                    </button>
                  </div>
                </div>

                {/* Iframe area */}
                <div className="flex-1 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`detail-${activeIdx}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Description overlay (top strip inside iframe) */}
                      <div
                        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
                        style={{
                          background: `linear-gradient(to bottom, rgba(6,10,18,0.95) 0%, rgba(6,10,18,0.80) 60%, transparent 100%)`,
                          padding: '20px 24px 32px',
                        }}
                      >
                        <div className="flex items-start gap-4 pointer-events-auto">
                          <div className="flex-1">
                            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: '24px', letterSpacing: 0.5, color: T.ink }}>
                              {proto.title}
                            </h2>
                            <p className="mt-2 max-w-[560px]" style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: '19px', color: T.inkMuted }}>
                              {proto.purpose}
                            </p>
                          </div>

                          {/* Stack chips */}
                          <div className="flex flex-wrap gap-[4px] shrink-0 max-w-[200px] justify-end">
                            {proto.stack.map(s => (
                              <span
                                key={s}
                                className="px-[7px] py-[2px] rounded-[4px]"
                                style={{
                                  fontFamily: "'Space Mono', monospace",
                                  fontSize: 9,
                                  letterSpacing: 0.5,
                                  color: T.inkFaint,
                                  background: T.inkGhost,
                                  border: `1px solid ${T.divider}`,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Loading state */}
                      {iframeLoading && <IframeLoader color={proto.domainColor} />}

                      {/* Error state */}
                      {iframeError && <IframeErrorState onRetry={reloadIframe} />}

                      {/* Iframe */}
                      <iframe
                        key={iframeKey}
                        src={proto.liveUrl}
                        className="w-full h-full border-0"
                        style={{
                          opacity: iframeLoading || iframeError ? 0 : 1,
                          transition: 'opacity 0.5s ease',
                          background: '#000',
                        }}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        title={proto.title}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom bar: pagination */}
                <div
                  className="flex items-center justify-between px-5 h-[38px] shrink-0"
                  style={{ borderTop: `1px solid ${T.divider}` }}
                >
                  <button
                    onClick={() => selectProto(Math.max(0, activeIdx - 1))}
                    disabled={activeIdx === 0}
                    className="flex items-center gap-1 cursor-pointer disabled:opacity-20 disabled:cursor-default transition-opacity"
                  >
                    <ChevronLeft size={14} style={{ color: T.inkMuted }} />
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: T.inkFaint }}>Prev</span>
                  </button>

                  <div className="flex items-center gap-[6px]">
                    {PROTOTYPES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => selectProto(i)}
                        className="cursor-pointer transition-all"
                      >
                        <div
                          className="h-[4px] rounded-full transition-all duration-300"
                          style={{
                            width: activeIdx === i ? 22 : 6,
                            background: activeIdx === i ? proto.domainColor : T.inkGhost,
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => selectProto(Math.min(PROTOTYPES.length - 1, activeIdx + 1))}
                    disabled={activeIdx === PROTOTYPES.length - 1}
                    className="flex items-center gap-1 cursor-pointer disabled:opacity-20 disabled:cursor-default transition-opacity"
                  >
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: T.inkFaint }}>Next</span>
                    <ChevronRight size={14} style={{ color: T.inkMuted }} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Iframe loading spinner ──────────────────────────────────── */
function IframeLoader({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[5]" style={{ background: 'rgba(6,10,18,0.9)' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-[28px] h-[28px] rounded-full"
          style={{
            border: `2px solid ${T.inkGhost}`,
            borderTopColor: color,
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, color: T.inkFaint }}>
          Loading prototype...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

/* ── Iframe error state ──────────────────────────────────────── */
function IframeErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[5]" style={{ background: 'rgba(6,10,18,0.95)' }}>
      <div className="flex flex-col items-center gap-3 max-w-[300px] text-center">
        <AlertCircle size={28} style={{ color: T.inkMuted }} />
        <p style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, color: T.inkSoft }}>
          Could not load the prototype
        </p>
        <p style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: T.inkFaint, lineHeight: '17px' }}>
          The external site may be blocking iframe embedding, or may be temporarily unavailable.
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] cursor-pointer transition-colors hover:brightness-110 mt-1"
          style={{ background: T.accent }}
        >
          <RefreshCw size={12} style={{ color: '#fff' }} />
          <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, color: '#fff' }}>Retry</span>
        </button>
      </div>
    </div>
  );
}