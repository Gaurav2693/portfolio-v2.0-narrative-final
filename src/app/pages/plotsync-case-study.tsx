import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties, ReactNode, ElementType } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ExternalLink, Clock, Users, Layers, Shield, Zap, Target,
  ChevronRight, AlertTriangle, CheckCircle2, TrendingDown, BarChart3,
  Lightbulb, ArrowRight, Sun, Moon, Mail, X, MapPin, Smartphone,
  Eye, Activity, Map, Database, Wifi, WifiOff, FileSpreadsheet,
  MessageSquare, Camera, BarChart, LineChart, Settings, Monitor, ChevronLeft, ZoomIn,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  GlassCard, SectionHeading, FadeIn, MetricCard, NarrativeQuote,
} from '../components/case-study';
import { PlotSyncResearchSection } from '../components/plotsync-research-section';
import { PlotSyncHandoffSection } from '../components/plotsync-handoff-section';

/* ── Mobile screen assets ────────────────────────────────────────── */
import wfSplashImg from "figma:asset/2d35626d0b6b76bca45c31f9094d28f171251791.png";
import wfDashboardImg from "figma:asset/1239d2cd0ba149b1e21790dd98d663c216bcb753.png";
import wfMapImg from "figma:asset/7ffe7a9d05bf42b1f7f8037a1309674fd64e7f31.png";
/* ── Wireframe sheet assets (used in Wireframes carousel) ────────── */
import wfSheet1Img from "figma:asset/dce7df1ad1b09171ff65ecacfecc3288bea638ec.png";
import wfSheet2Img from "figma:asset/e25d740ed64e92108985666d92bb54dfb627ef1c.png";
import wfSheet3Img from "figma:asset/451ea576763e6c694e888e9dba76445d21c75a09.png";
/* ── Admin portal wireframe sheet assets ─────────────────────────── */
import wfAdmin3dMapImg from "figma:asset/a6837d0512365aa237f123ed841b566273d90c0a.png";
import wfAdminGridImg from "figma:asset/a874dcbc4e3c3f8ea96814cf8367f51f770f67da.png";
import wfAdminJourneyImg from "figma:asset/779b83c513d561a55ad334c2f73746ee784990c8.png";
/* ── Hi-fi mobile screen assets (used in Solution section) ──────── */
import wfProjectBrowseImg from "figma:asset/41f381ee22646ed8aa83bf5d1a884740fcc2556c.png";
import wfMapInventoryImg from "figma:asset/6e5498db32c1f6a69ad040c5f46bb5ac8390ee56.png";
import wfVisitCaptureImg from "figma:asset/6ffd706790e4eb06636eeb9c83dcf1a518d057f3.png";
import wfLeadMgmtImg from "figma:asset/8368b1c7809b51f4ff09c3b360c4b75127b16f4c.png";
import wfLensAnalyticsImg from "figma:asset/f02d8ab87e807662ec0a1516d6a2d74a58b5279d.png";
/* ── Hi-fi admin portal screen assets ────────────────────────────── */
import hifiAdmin3dMapImg from "figma:asset/57b45adc7c983633e14e06a5be81a9b0ba19adce.png";
import hifiAdminGridImg from "figma:asset/069b49ca369155aec4e3d39fb32c3e61c520cca2.png";
import hifiAdminJourneyImg from "figma:asset/086043c192d8fa80da92573529c7eb7a2ccfa398.png";
import hifiAdminProjectImg from "figma:asset/202bee785363900efda85689ebae5470b9497f66.png";

/* ═══════════════════════════════════════════════════════════════════════
   PLOTSYNC CASE STUDY
   ────────────────────────────────────
   Standalone FAANG-style narrative case study page.
   Dark glass aesthetic with orange/red accent system.
   Mobile-first product + web admin portal dual-surface story.
   Rebuilt to clear bundler cache.
   ═══════════════════════════════════════════════════════════════════════ */

const ACCENT = '#E8552D';
const ACCENT_SOFT = '#F2734F';
const ACCENT_DIM = 'var(--cpq-accent-dim)';
const GLASS = 'var(--cpq-glass)';
const GLASS_BORDER = 'var(--cpq-glass-border)';
const GLASS_HOVER = 'var(--cpq-glass-hover)';

/* ── Section IDs for scroll-spy ──────────────────────────────────── */
const SECTIONS = [
  { id: 'hero', label: 'Overview' },
  { id: 'context', label: 'Context' },
  { id: 'problem', label: 'Problem' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'approach', label: 'Approach' },
  { id: 'research', label: 'Research' },
  { id: 'wireframes', label: 'Wireframes' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'solution', label: 'Solution' },
  { id: 'journey', label: 'Process' },
  { id: 'impact', label: 'Impact' },
  { id: 'reflection', label: 'Reflection' },
];

/* ── Phone Mockup Frame ──────────────────────────────────────────── */
function PhoneMockup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-[36px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1E1E24 0%, #16161B 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(232,85,45,0.08)`,
          padding: '12px 6px',
          width: 220,
        }}
      >
        {/* Notch */}
        <div className="flex justify-center mb-2">
          <div className="w-[80px] h-[22px] rounded-b-2xl" style={{ background: '#0A0A0F' }} />
        </div>
        {/* Screen area */}
        <div className="rounded-[20px] overflow-hidden" style={{ background: '#0D1117', aspectRatio: '9/19.5' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-[100px] h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
        </div>
      </div>
      {label && <p className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] text-white/25 mt-3 text-center">{label}</p>}
    </div>
  );
}

/* ── Phone Screen Placeholder ────────────────────────────────────── */
function PhoneScreenPlaceholder({ title, icon: Icon, items }: { title: string; icon: ElementType; items: string[] }) {
  return (
    <div className="w-full h-full flex flex-col p-3" style={{ background: 'linear-gradient(180deg, #111318, #0D0F14)' }}>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-['Cambay',sans-serif] text-[7px] text-white/25">9:41</span>
        <div className="flex gap-1">
          <Wifi size={7} className="text-white/20" />
          <Activity size={7} className="text-white/20" />
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
          <Icon size={9} style={{ color: ACCENT }} />
        </div>
        <span className="font-['Bebas_Neue',sans-serif] text-[8px] tracking-[1.5px] text-white/60">{title}</span>
      </div>
      {/* Content lines */}
      <div className="flex flex-col gap-1.5 flex-1">
        {items.map((item, i) => (
          <div key={i} className="rounded-md py-1.5 px-2 flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-1 h-1 rounded-full shrink-0" style={{ background: `${ACCENT}60` }} />
            <span className="font-['Cambay',sans-serif] text-[6px] text-white/35">{item}</span>
          </div>
        ))}
      </div>
      {/* Bottom nav */}
      <div className="flex items-center justify-around pt-2 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {[Map, Camera, Users, BarChart].map((NavIcon, i) => (
          <NavIcon key={i} size={9} style={{ color: i === 0 ? ACCENT : 'rgba(255,255,255,0.18)' }} />
        ))}
      </div>
    </div>
  );
}

/* ── Wireframe Monitor Carousel — real wireframe sheets ──────────── */
const WF_SLIDES = [
  {
    id: 'core-flows',
    title: 'CORE FLOWS',
    subtitle: 'Intelligence View · Dashboard · Sales Map · Customer Management · Splash',
    img: wfSheet1Img,
  },
  {
    id: 'inventory-leads',
    title: 'INVENTORY & LEADS',
    subtitle: 'Task Manager · Plot Inventory · Filters · Lead Profile · Reports · Lead Actions',
    img: wfSheet2Img,
  },
  {
    id: 'operations',
    title: 'OPERATIONS & OVERSIGHT',
    subtitle: 'Agent Dashboard · Calendar · Schedule · Leaderboards · Contact · Project Overview',
    img: wfSheet3Img,
  },
];

function WireframeMonitorCarousel() {
  const [active, setActive] = useState(0);
  const total = WF_SLIDES.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((p) => (p + 1) % total), 5000);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const go = (idx: number) => { setActive(idx); resetTimer(); };
  const prev = () => go((active - 1 + total) % total);
  const next = () => go((active + 1) % total);

  const slide = WF_SLIDES[active];

  return (
    <div className="relative w-full">
      {/* Monitor body */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #18181F 0%, #111116 100%)',
          border: `1px solid ${ACCENT}15`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 60px ${ACCENT}06`,
        }}
      >
        {/* ── Top bezel — macOS-style bar ── */}
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="px-6 py-1 rounded-lg flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Monitor size={10} className="text-white/20" />
              <span className="font-['Cambay',sans-serif] text-[9px] text-white/25">
                wireframes / {slide.id}
              </span>
            </div>
          </div>
          <span className="font-['Cambay',sans-serif] text-[9px] text-white/20">
            {active + 1} / {total}
          </span>
        </div>

        {/* ── Screen content ── */}
        <div className="relative overflow-hidden" style={{ background: '#F7F5F0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="w-full"
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-auto block"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Bottom gradient overlay with title */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(20,20,26,0.92) 0%, rgba(20,20,26,0.5) 50%, transparent 100%)' }}
          >
            <div className="px-4 sm:px-6 pb-4 pt-10 sm:pt-14">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-['Bebas_Neue',sans-serif] text-[13px] sm:text-[15px] tracking-[3px]"
                  style={{ color: ACCENT }}
                >
                  {slide.title}
                </span>
              </div>
              <p className="font-['Cambay',sans-serif] text-[10px] sm:text-[12px] text-white/45 max-w-lg">
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* ── Nav arrows ── */}
          <button
            onClick={prev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} className="text-white/70" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            aria-label="Next slide"
          >
            <ChevronRight size={16} className="text-white/70" />
          </button>
        </div>

        {/* ── Progress bar inside monitor ── */}
        <div className="px-4 py-2" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="h-[2px] w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}60)` }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              key={`bar-${active}`}
            />
          </div>
        </div>
      </div>

      {/* ── Monitor stand ── */}
      <div className="flex flex-col items-center -mt-px">
        <div className="w-16 h-6 sm:w-20 sm:h-8" style={{ background: 'linear-gradient(180deg, #18181F, #111116)', borderLeft: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }} />
        <div
          className="w-28 h-2 sm:w-36 sm:h-2.5 rounded-b-lg"
          style={{ background: 'linear-gradient(180deg, #16161D, #0F0F14)', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none' }}
        />
      </div>

      {/* ── Dot nav below stand ── */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {WF_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => go(i)}
            className="group flex flex-col items-center gap-1.5"
            aria-label={`Go to ${s.title}`}
          >
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i === active ? ACCENT : 'rgba(255,255,255,0.12)',
                transform: i === active ? 'scale(1.4)' : 'scale(1)',
                boxShadow: i === active ? `0 0 10px ${ACCENT}50` : 'none',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Fragmented Workflow Doodle ───────────────────────────────────── */
function FragmentedWorkflowDoodle() {
  const tools = [
    { icon: FileSpreadsheet, label: 'Excel', x: 8, y: 15 },
    { icon: MessageSquare, label: 'WhatsApp', x: 30, y: 55 },
    { icon: FileSpreadsheet, label: 'PDF Layouts', x: 55, y: 20 },
    { icon: Database, label: 'Informal CRM', x: 78, y: 50 },
    { icon: WifiOff, label: 'Manual Reports', x: 15, y: 72 },
    { icon: Eye, label: 'No Visibility', x: 65, y: 75 },
  ];
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        aspectRatio: '16/7',
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        border: `1px solid ${ACCENT}15`,
      }}
    >
      {/* Scattered disconnected tools */}
      {tools.map((t, i) => (
        <motion.div
          key={t.label}
          className="absolute flex flex-col items-center gap-1"
          style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <t.icon size={14} className="text-white/25" />
          </div>
          <span className="font-['Cambay',sans-serif] text-[8px] sm:text-[9px] text-white/20 text-center whitespace-nowrap">{t.label}</span>
        </motion.div>
      ))}
      {/* Broken connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="15" y1="20" x2="30" y2="50" stroke="rgba(232,85,45,0.08)" strokeWidth="0.3" strokeDasharray="2,3" />
        <line x1="55" y1="25" x2="78" y2="45" stroke="rgba(232,85,45,0.08)" strokeWidth="0.3" strokeDasharray="2,3" />
        <line x1="30" y1="60" x2="65" y2="70" stroke="rgba(232,85,45,0.08)" strokeWidth="0.3" strokeDasharray="2,3" />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="px-4 py-2 rounded-xl" style={{ background: 'rgba(232,85,45,0.06)', border: `1px dashed ${ACCENT}25` }}>
          <span className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[4px]" style={{ color: `${ACCENT}50` }}>NO UNIFIED SYSTEM</span>
        </div>
      </div>
    </div>
  );
}

/* ── Sales Workflow Doodle ────────────────────────────────────────── */
function SalesWorkflowDoodle() {
  const steps = [
    { icon: MapPin, label: 'Site Visit', sub: 'Field capture' },
    { icon: Camera, label: 'Verification', sub: 'Photo proof' },
    { icon: Users, label: 'Lead Capture', sub: 'Customer data' },
    { icon: Map, label: 'Plot Mapping', sub: 'Inventory sync' },
    { icon: BarChart, label: 'Analytics', sub: 'Admin dashboard' },
  ];
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-6 sm:p-8"
      style={{
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        border: `1px solid ${ACCENT}15`,
      }}
    >
      <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] text-white/15 mb-6">PLOTSYNC OPERATIONAL FLOW</div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between relative">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 sm:gap-0 sm:flex-col sm:items-center relative z-10">
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{ background: i === 0 ? `${ACCENT}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? `${ACCENT}30` : 'rgba(255,255,255,0.06)'}` }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <s.icon size={16} style={{ color: i === 0 ? ACCENT : 'rgba(255,255,255,0.25)' }} />
            </motion.div>
            <div className="sm:text-center sm:mt-2">
              <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[1.5px] text-white/45">{s.label}</div>
              <div className="font-['Cambay',sans-serif] text-[9px] text-white/20">{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden sm:block absolute top-1/2 -translate-y-1/2" style={{ left: 'calc(100% + 4px)', width: 'calc(100% - 60px)' }}>
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}20, rgba(255,255,255,0.04))` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Desktop Browser Frame ───────────────────────────────────────── */
function BrowserFrame({ children, url, variant = 'wireframe' }: { children: ReactNode; url?: string; variant?: 'wireframe' | 'hifi' }) {
  const isWf = variant === 'wireframe';
  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{
        border: isWf ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${ACCENT}15`,
        background: isWf ? 'rgba(255,255,255,0.02)' : 'linear-gradient(180deg, #0D1117, #0A0D12)',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${isWf ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}` }}>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: isWf ? 'rgba(255,255,255,0.08)' : '#FF5F57' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: isWf ? 'rgba(255,255,255,0.08)' : '#FEBC2E' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: isWf ? 'rgba(255,255,255,0.08)' : '#28C840' }} />
        </div>
        {url && (
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-0.5 rounded-md" style={{ background: isWf ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="font-['Cambay',sans-serif] text-[8px] text-white/20">{url}</span>
            </div>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-3 sm:p-4" style={isWf ? undefined : { aspectRatio: '16/9' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Zoomable Wireframe Card — hover hint + lightbox ─────────────── */
function ZoomableWireframeCard({ img, url, label }: { img: string; url: string; label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <BrowserFrame url={url} variant="wireframe">
        <div
          className="h-full -m-3 sm:-m-4 relative overflow-hidden cursor-zoom-in group"
          onClick={() => setOpen(true)}
        >
          <img
            src={img}
            alt={label}
            className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            draggable={false}
          />
          {/* Bottom label fade */}
          <div
            className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-8 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(14,14,18,0.85), transparent)' }}
          >
            <span
              className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2.5px]"
              style={{ color: `${ACCENT}70` }}
            >
              {label}
            </span>
          </div>
          {/* Hover zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <ZoomIn size={14} className="text-white/70" />
            </div>
          </div>
          {/* Hover border glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"
            style={{ boxShadow: `inset 0 0 0 1px ${ACCENT}20, 0 0 20px ${ACCENT}08` }}
          />
        </div>
      </BrowserFrame>

      {/* ── Lightbox overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(6,6,10,0.92)', backdropFilter: 'blur(16px)' }} />

            {/* Close hint */}
            <div className="absolute top-5 right-5 z-10">
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Label */}
            <div className="absolute top-5 left-5 z-10">
              <span
                className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[3px]"
                style={{ color: `${ACCENT}90` }}
              >
                {label}
              </span>
              <div className="font-['Cambay',sans-serif] text-[11px] text-white/30 mt-0.5">Click anywhere or press Esc to close</div>
            </div>

            {/* Image container — scrollable for large images */}
            <motion.div
              className="relative z-[1] max-w-[92vw] max-h-[88vh] overflow-auto rounded-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ border: `1px solid ${ACCENT}20`, boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 80px ${ACCENT}08` }}
            >
              <img
                src={img}
                alt={label}
                className="block max-w-none cursor-zoom-out"
                style={{ width: 'max(90vw, 1200px)' }}
                draggable={false}
                onClick={() => setOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Zoomable Hi-Fi Card — hover hint + lightbox (mirrors wireframe zoom) ── */
function ZoomableHiFiCard({ img, url, label }: { img: string; url: string; label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <BrowserFrame url={url} variant="hifi">
        <div
          className="h-full -m-3 sm:-m-4 relative overflow-hidden cursor-zoom-in group"
          onClick={() => setOpen(true)}
        >
          <img
            src={img}
            alt={label}
            className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            draggable={false}
          />
          {/* Bottom label fade */}
          <div
            className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-8 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(10,13,18,0.88), transparent)' }}
          >
            <span
              className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2.5px]"
              style={{ color: `${ACCENT}80` }}
            >
              {label}
            </span>
          </div>
          {/* Hover zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <ZoomIn size={14} className="text-white/70" />
            </div>
          </div>
          {/* Hover border glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"
            style={{ boxShadow: `inset 0 0 0 1px ${ACCENT}25, 0 0 24px ${ACCENT}0a` }}
          />
        </div>
      </BrowserFrame>

      {/* ── Lightbox overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(6,6,10,0.92)', backdropFilter: 'blur(16px)' }} />

            {/* Close hint */}
            <div className="absolute top-5 right-5 z-10">
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Label */}
            <div className="absolute top-5 left-5 z-10">
              <span
                className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[3px]"
                style={{ color: `${ACCENT}90` }}
              >
                {label}
              </span>
              <div className="font-['Cambay',sans-serif] text-[11px] text-white/30 mt-0.5">Click anywhere or press Esc to close</div>
            </div>

            {/* Image container — scrollable for large images */}
            <motion.div
              className="relative z-[1] max-w-[92vw] max-h-[88vh] overflow-auto rounded-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{ border: `1px solid ${ACCENT}20`, boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 80px ${ACCENT}08` }}
            >
              <img
                src={img}
                alt={label}
                className="block max-w-none cursor-zoom-out"
                style={{ width: 'max(90vw, 1200px)' }}
                draggable={false}
                onClick={() => setOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* (Legacy wireframe functions removed — real images rendered inline) */

/* ══════════════════════════════════════════════════════════════════════
   HI-FI ADMIN SCREENS — now using ZoomableHiFiCard with real images
   ══════════════════════════════════════════════════════════════════════ */

const HIFI_ADMIN_SCREENS = [
  { img: hifiAdmin3dMapImg, url: 'app.plotsync.io/inventory/3d-map', label: '3D PLOT MAP' },
  { img: hifiAdminGridImg, url: 'app.plotsync.io/inventory/grid', label: 'PLOT INVENTORY' },
  { img: hifiAdminJourneyImg, url: 'app.plotsync.io/customers/journey', label: 'CUSTOMER JOURNEY' },
  { img: hifiAdminProjectImg, url: 'app.plotsync.io/projects/dashboard', label: 'PROJECT DASHBOARD' },
];

/* ── Unified Architecture Doodle ─────────────────────────────────── */
function UnifiedArchitectureDoodle() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-6 sm:p-8"
      style={{
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        border: `1px solid ${ACCENT}15`,
      }}
    >
      <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] text-white/15 mb-6">INFORMATION ARCHITECTURE — DUAL SURFACE</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mobile layer */}
        <div className="rounded-xl p-4" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}>
          <div className="flex items-center gap-2 mb-3">
            <Smartphone size={12} style={{ color: ACCENT }} />
            <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px]" style={{ color: `${ACCENT}90` }}>MOBILE — FIELD</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {['Plot browsing', 'Visit capture', 'Lead entry', 'Status checks'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ background: `${ACCENT}50` }} />
                <span className="font-['Cambay',sans-serif] text-[10px] text-white/30">{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Data layer */}
        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
          <Database size={18} className="text-white/15 mb-2" />
          <span className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[2px] text-white/20">UNIFIED DATA</span>
          <div className="flex gap-1 mt-2">
            <div className="w-6 h-0.5 rounded-full" style={{ background: `${ACCENT}30` }} />
            <div className="w-4 h-0.5 rounded-full bg-white/8" />
            <div className="w-6 h-0.5 rounded-full" style={{ background: `${ACCENT}30` }} />
          </div>
        </div>
        {/* Admin layer */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={12} className="text-white/30" />
            <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] text-white/35">ADMIN — DESKTOP</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {['Inventory map', 'Sales velocity', 'Visit verification', 'Demand analytics'].map(f => (
              <div key={f} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-white/15" />
                <span className="font-['Cambay',sans-serif] text-[10px] text-white/30">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Decision Framework Doodle ───────────────────────────────────── */
function PlotSyncDecisionDoodle() {
  const decisions = [
    { chose: 'Map-First', over: 'Table-First', verdict: 'Clarity' },
    { chose: 'Lightweight CRM', over: 'Full CRM', verdict: 'Focus' },
    { chose: 'Mobile-First', over: 'Desktop-First', verdict: 'Reality' },
    { chose: 'Lens Analytics', over: 'Dense Dashboards', verdict: 'Cognition' },
  ];
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden p-6 sm:p-8"
      style={{
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        border: `1px solid ${ACCENT}15`,
      }}
    >
      <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[4px] text-white/15 mb-5">DECISION FRAMEWORK</div>
      <div className="flex flex-col gap-3">
        {decisions.map((d, i) => (
          <motion.div
            key={d.chose}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}12` }}>
              <CheckCircle2 size={11} style={{ color: ACCENT }} />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <span className="font-['Cambay',sans-serif] text-[12px] text-white/50">{d.chose}</span>
              <span className="font-['Cambay',sans-serif] text-[10px] text-white/15">over</span>
              <span className="font-['Cambay',sans-serif] text-[12px] text-white/25 line-through">{d.over}</span>
            </div>
            <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2px] shrink-0" style={{ color: `${ACCENT}60` }}>{d.verdict}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
interface PlotSyncCaseStudyProps {
  embedded?: boolean;
  onClose?: () => void;
}

export default function PlotSyncCaseStudy({ embedded = false, onClose }: PlotSyncCaseStudyProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isLight, setIsLight] = useState(false);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  /* ── Theme tokens ─────────────────────────────────────────────── */
  const themeVars: Record<string, string> = isLight ? {
    '--cpq-glass': 'rgba(255,255,255,0.7)',
    '--cpq-glass-border': 'rgba(0,0,0,0.06)',
    '--cpq-glass-hover': 'rgba(255,255,255,0.85)',
    '--cpq-accent-dim': 'rgba(232,85,45,0.08)',
    '--cpq-subtle': 'rgba(0,0,0,0.03)',
  } : {
    '--cpq-glass': 'rgba(255,255,255,0.055)',
    '--cpq-glass-border': 'rgba(255,255,255,0.10)',
    '--cpq-glass-hover': 'rgba(255,255,255,0.08)',
    '--cpq-accent-dim': 'rgba(232,85,45,0.15)',
    '--cpq-subtle': 'rgba(255,255,255,0.04)',
  };
  const pageBg = isLight
    ? 'linear-gradient(165deg, #F6F3EE 0%, #EDE9E2 40%, #F2EEE8 100%)'
    : 'linear-gradient(165deg, #0F1318 0%, #0B1019 40%, #0D0F16 100%)';
  const tx = (o: number) => isLight ? `rgba(42,38,33,${o})` : `rgba(255,255,255,${o})`;

  /* ── Scroll spy ────────────────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const sections = SECTIONS.map(s => {
        const node = document.getElementById(s.id);
        if (!node) return { id: s.id, top: Infinity };
        return { id: s.id, top: node.getBoundingClientRect().top };
      });
      const visible = sections.filter(s => s.top < 300);
      if (visible.length > 0) {
        setActiveSection(visible[visible.length - 1].id);
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className={`${embedded ? 'w-full h-full' : 'fixed inset-0'} flex ${isLight ? 'cpq-light' : ''}`} style={{ background: embedded ? 'transparent' : pageBg, ...themeVars } as CSSProperties}>

      {/* ═══ LEFT NAV — minimal rail with persistent labels ════════════ */}
      {!embedded && (
      <div className="hidden lg:flex flex-col w-[140px] shrink-0 py-6 pl-5 pr-3 relative z-10">
        {/* Back arrow */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 cursor-pointer group"
        >
          <ArrowLeft size={12} style={{ color: tx(0.25) }} className="group-hover:translate-x-[-2px] transition-transform shrink-0" />
          <span className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] transition-colors" style={{ color: tx(0.2) }}>BACK</span>
        </button>

        {/* Section list */}
        <nav className="flex-1 flex flex-col relative">
          {/* Track line */}
          <div
            className="absolute left-[3px] top-0 bottom-0 w-px"
            style={{ background: tx(0.05) }}
          />
          {/* Active progress fill */}
          <div
            className="absolute left-[3px] top-0 w-px transition-all duration-500 ease-out"
            style={{
              height: `${(SECTIONS.findIndex(s => s.id === activeSection) / Math.max(SECTIONS.length - 1, 1)) * 100}%`,
              background: `linear-gradient(180deg, ${ACCENT}30, ${ACCENT})`,
            }}
          />

          {SECTIONS.map((s, i) => {
            const isActive = activeSection === s.id;
            const isPast = SECTIONS.findIndex(sec => sec.id === activeSection) >= i;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="relative flex items-center gap-3 cursor-pointer text-left transition-all duration-200"
                style={{ flex: 1, minHeight: 24 }}
              >
                {/* Dot on the track */}
                <div
                  className="relative z-10 rounded-full shrink-0 transition-all duration-300"
                  style={{
                    width: isActive ? 7 : 3,
                    height: isActive ? 7 : 3,
                    background: isActive ? ACCENT : isPast ? `${ACCENT}50` : tx(0.10),
                    boxShadow: isActive ? `0 0 6px ${ACCENT}40` : 'none',
                  }}
                />
                {/* Label */}
                <span
                  className="font-['Cambay',sans-serif] text-[10px] tracking-[0.3px] transition-all duration-300"
                  style={{
                    color: isActive ? ACCENT : isPast ? tx(0.35) : tx(0.18),
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex items-center gap-1.5 mt-5 pl-0.5">
          <button
            onClick={() => setIsLight(l => !l)}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{ background: tx(0.04) }}
            title={isLight ? 'Dark mode' : 'Light mode'}
          >
            {isLight ? <Moon size={11} style={{ color: tx(0.35) }} /> : <Sun size={11} style={{ color: tx(0.35) }} />}
          </button>
          <a
            href="https://projects-mauve-one.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{ background: `${ACCENT}15` }}
            title="View Admin Panel Live Preview"
          >
            <ExternalLink size={11} style={{ color: ACCENT }} />
          </a>
        </div>
      </div>
      )}

      {/* ═══ MAIN SCROLLABLE CONTENT ═════════════════════════════════ */}
      <div ref={containerRef} className="flex-1 overflow-y-auto scrollbar-custom cpq-scroll relative">

        {/* Progress bar */}
        <div className="sticky top-0 z-50 h-[2px]" style={{ background: 'var(--cpq-subtle)' }}>
          <motion.div className="h-full" style={{ width: progressWidth, background: ACCENT }} />
        </div>

        {/* Embedded header bar */}
        {embedded && (
          <div className="sticky top-[2px] z-40 flex items-center justify-between px-5 py-3" style={{ background: 'rgba(12,16,24,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={13} className="text-white/45" />
              </button>
              <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[2px] text-white/35">PLOTSYNC</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://projects-mauve-one.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ExternalLink size={11} className="text-white/40" />
                <span className="font-['Cambay',sans-serif] text-[11px] text-white/40">Live Preview</span>
              </a>
              <button
                onClick={() => navigate('/plotsync-case-study')}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:brightness-110"
                style={{ background: ACCENT }}
              >
                <ArrowRight size={11} className="text-white" />
                <span className="font-['Cambay',sans-serif] text-[11px] text-white">Full Page</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile back button */}
        {!embedded && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button onClick={() => navigate('/')} className="dark-zone flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${GLASS_BORDER}` }}>
            <ArrowLeft size={14} className="text-white/50 shrink-0" />
            <span className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[2px] leading-none relative top-[0.1em] text-white/40">BACK</span>
          </button>
        </div>
        )}

        {/* Mobile theme toggle */}
        {!embedded && (
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsLight(l => !l)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: `1px solid rgba(255,255,255,0.1)` }}
          >
            {isLight ? <Moon size={14} color="white" /> : <Sun size={14} color="white" />}
          </button>
        </div>
        )}

        <div className="max-w-[860px] mx-auto px-6 lg:px-10">

          {/* ═══ HERO ════════════════════════════════════════════════ */}
          <section id="hero" className={`pb-16 ${embedded ? 'pt-8 lg:pt-10' : 'pt-20 lg:pt-28'} lg:pb-24`}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['REAL ESTATE SAAS', 'MOBILE-FIRST', 'SALES INTELLIGENCE', 'PROPTECH'].map(tag => (
                  <span key={tag} className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] py-1 px-3 rounded-full" style={{ color: ACCENT, background: ACCENT_DIM, border: `1px solid ${ACCENT}20` }}>{tag}</span>
                ))}
              </div>

              {/* Title block */}
              <h1 className="font-['Bebas_Neue',sans-serif] text-[52px] lg:text-[72px] text-white/95 tracking-[2px] leading-[0.95] mb-4">
                PLOTSYNC
              </h1>
              <p className="font-['Caladea',serif] text-[18px] lg:text-[20px] text-white/55 leading-[1.7] max-w-[600px] mb-8">
                Designing a map-driven sales intelligence platform to replace fragmented spreadsheets
                and bring operational clarity to plotted real estate developments.
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 mb-10">
                {[
                  { icon: Users, label: 'Role', value: 'Product Designer' },
                  { icon: Clock, label: 'Platform', value: 'Mobile + Web Admin' },
                  { icon: Layers, label: 'Industry', value: 'PropTech / Real Estate' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon size={14} className="text-white/35" />
                    <div>
                      <div className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[3px] text-white/35">{label}</div>
                      <div className="font-['Cambay',sans-serif] text-[13px] text-white/65">{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hero — Phone mockups trio */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Glow backdrop */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[400px] h-[400px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${ACCENT}30, transparent 70%)` }} />
                </div>

                <div className="flex items-end justify-center gap-4 sm:gap-6 lg:gap-8 relative z-10">
                  {/* Left phone — smaller, tilted */}
                  <div className="hidden sm:block transform -rotate-3 translate-y-4 opacity-70 scale-90">
                    <PhoneMockup label="PLOT MAP">
                      <img src={wfMapImg} alt="PlotSync map view" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  {/* Center phone — hero */}
                  <div className="transform scale-100 sm:scale-105">
                    <PhoneMockup label="SPLASH">
                      <img src={wfSplashImg} alt="PlotSync splash screen" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  {/* Right phone — smaller, tilted */}
                  <div className="hidden sm:block transform rotate-3 translate-y-4 opacity-70 scale-90">
                    <PhoneMockup label="PROJECT DASHBOARD">
                      <img src={wfDashboardImg} alt="PlotSync dashboard" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ═══ CONTEXT ═════════════════════════════════════════════ */}
          <section id="context" className="pb-20">
            <SectionHeading
              chapter="01 — THE STAGE"
              title="System Context & Users"
              subtitle="A real estate sales intelligence platform for plotted developments — replacing spreadsheets, WhatsApp, and manual reporting with map-driven workflows and centralized analytics."
              accent={ACCENT}
            />

            <FadeIn>
              <NarrativeQuote accent={ACCENT}>
                Deals were being lost not because of bad salesmanship — but because of operational opacity.
              </NarrativeQuote>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="font-['Cambay',sans-serif] text-[15px] text-white/55 leading-[1.8] mb-8">
                PlotSync AI combines inventory visualization via interactive plot maps, field sales
                verification workflows, lightweight CRM functionality, sales intelligence dashboards,
                and admin command-center tracking. Its goal: replace fragmented tools with a unified
                operational system for the entire plotted real estate sales lifecycle.
              </p>
            </FadeIn>

            {/* User role cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                {
                  role: 'Sales Agents',
                  resp: 'Site visits, lead capture, plot availability, visit status',
                  ctx: 'Mobile-first, on-site, time-constrained. Often offline or in patchy network zones.',
                  icon: Smartphone,
                },
                {
                  role: 'Admin Managers',
                  resp: 'Inventory monitoring, agent tracking, visit verification, demand analysis',
                  ctx: 'Desktop dashboards, decision-making, operational oversight.',
                  icon: Layers,
                },
                {
                  role: 'Stakeholders',
                  resp: 'Sales forecasting, inventory planning, channel partner oversight',
                  ctx: 'Analytics-heavy, periodic strategic review and reporting.',
                  icon: LineChart,
                },
              ].map((u, i) => (
                <FadeIn key={u.role} delay={i * 0.1}>
                  <GlassCard className="h-full">
                    <div className="flex items-center gap-2.5 mb-3">
                      <u.icon size={14} style={{ color: ACCENT }} />
                      <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[2px] text-white/80">{u.role}</span>
                    </div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/50 mb-2">{u.resp}</p>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/55 leading-[1.6]">{u.ctx}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            {/* Risk zone callout */}
            <FadeIn delay={0.2}>
              <GlassCard style={{ borderColor: `${ACCENT}20`, backgroundColor: `${ACCENT}04` }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} style={{ color: `${ACCENT}80` }} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] mb-1" style={{ color: `${ACCENT}70` }}>CRITICAL RISK ZONE</div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/55 leading-[1.6] mb-3">
                      Without unified operational visibility, the sales ecosystem was hemorrhaging value:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Double booking risk', 'Misreported inventory', 'Fake site visits', 'Poor forecasting', 'Developer mistrust'].map(r => (
                        <div key={r} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `${ACCENT}50` }} />
                          <span className="font-['Cambay',sans-serif] text-[11px] text-white/40">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Sales workflow doodle */}
            <FadeIn delay={0.3} className="mt-8">
              <SalesWorkflowDoodle />
            </FadeIn>
          </section>

          {/* ═══ THE PROBLEM ═════════════════════════════════════════ */}
          <section id="problem" className="pb-20">
            <SectionHeading
              chapter="02 — THE FRACTURE"
              title="The Core Problem"
              subtitle="What looked like inefficiency was actually an infrastructure void — tools designed for documentation, not decision-making."
              accent={ACCENT}
            />

            {/* Surface vs root */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FadeIn>
                <GlassCard className="h-full">
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">SURFACE SYMPTOMS</div>
                  <div className="flex flex-col gap-3">
                    {['Fragmented', 'Unreliable', 'Opaque'].map((s, i) => (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-['Bebas_Neue',sans-serif]" style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.6)' }}>{i + 1}</div>
                        <span className="font-['Cambay',sans-serif] text-[14px] text-white/50">{s}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
              <FadeIn delay={0.1}>
                <GlassCard className="h-full" style={{ borderColor: 'rgba(239,68,68,0.10)', backgroundColor: 'rgba(239,68,68,0.02)' }}>
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-red-400/40 mb-4">ROOT CAUSE</div>
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white/50 leading-[1.7] mb-3">
                    Inventory scattered across formats. Field updates delayed or inconsistent.
                    No centralized intelligence layer.
                  </p>
                  <div className="flex flex-col gap-2">
                    {['Spreadsheet-dependent inventory', 'Unverifiable field reports', 'Zero real-time visibility'].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/40" />
                        <span className="font-['Cambay',sans-serif] text-[12px] text-red-400/50">{f}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            <FadeIn delay={0.15}>
              <NarrativeQuote accent={ACCENT}>
                Sales teams weren't inefficient — the system simply never gave them operational clarity.
              </NarrativeQuote>
            </FadeIn>

            {/* Before state doodle */}
            <FadeIn delay={0.2} className="mt-4">
              <FragmentedWorkflowDoodle />
            </FadeIn>
          </section>

          {/* ═══ CONSTRAINTS ═════════════════════════════════════════ */}
          <section id="constraints" className="pb-20">
            <SectionHeading
              chapter="03 — THE BOUNDARIES"
              title="Constraints & Non-Negotiables"
              subtitle="Mobile-first deployment, evolving backend, mixed data sources — UX had to unify the experience despite shifting ground."
              accent={ACCENT}
            />

            {/* Integration grid */}
            <FadeIn>
              <GlassCard className="mb-6">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">INTEGRATION SURFACE</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['CRM Tools', 'Developer Dashboards', 'WhatsApp/Email', 'GIS/CAD Imports', 'Analytics Tools', 'CRM APIs'].map(s => (
                    <span key={s} className="font-['Cambay',sans-serif] text-[12px] py-1.5 px-3 rounded-lg text-white/40" style={{ background: 'var(--cpq-subtle)', border: `1px solid ${GLASS_BORDER}` }}>{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--cpq-glass-border)' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                    <ArrowRight size={8} style={{ color: ACCENT }} />
                  </div>
                  <span className="font-['Cambay',sans-serif] text-[11px] text-white/30">Future: CRM APIs, GIS/CAD imports, analytics platform integrations</span>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Non-negotiables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Smartphone, label: 'Mobile-First Deploy', desc: 'Primary interface for field sales — must work in patchy network zones' },
                { icon: Shield, label: 'RERA Compliance', desc: 'Real estate regulatory requirements. Approval-driven inventory changes' },
                { icon: Database, label: 'Evolving Backend', desc: 'Backend still maturing. Mixed data sources — manual and digital' },
              ].map((c, i) => (
                <FadeIn key={c.label} delay={i * 0.08}>
                  <GlassCard className="h-full">
                    <c.icon size={16} className="text-white/20 mb-3" />
                    <div className="font-['Bebas_Neue',sans-serif] text-[13px] tracking-[1px] text-white/60 mb-1">{c.label}</div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/45 leading-[1.5]">{c.desc}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.15}>
              <NarrativeQuote attribution="— Design positioning" accent={ACCENT}>
                The platform needed to absorb operational chaos — not expose it. UX became the unification layer.
              </NarrativeQuote>
            </FadeIn>
          </section>

          {/* ═══ APPROACH ════════════════════════════════════════════ */}
          <section id="approach" className="pb-20">
            <SectionHeading
              chapter="04 — THE METHOD"
              title="Mental Model & Strategy"
              subtitle="We approached PlotSync as a workflow unification problem — breaking it into field capture clarity, inventory visualization, and manager oversight."
              accent={ACCENT}
            />

            {/* Strategy breakdown */}
            <FadeIn>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-6">WORKFLOW UNIFICATION — THREE PILLARS</div>
                <div className="flex flex-col gap-4">
                  {[
                    { step: 1, load: 45, label: 'Field Capture Clarity', desc: 'Visit verification, lead entry, GPS-confirmed check-ins — all from mobile' },
                    { step: 2, load: 30, label: 'Inventory Visualization', desc: 'Interactive plot maps replace spreadsheets — see what\'s available, booked, held in real time' },
                    { step: 3, load: 25, label: 'Manager Oversight', desc: 'Centralized analytics, visit verification monitoring, sales velocity tracking' },
                  ].map(item => (
                    <div key={item.step} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-['Bebas_Neue',sans-serif] text-[14px]" style={{ background: ACCENT_DIM, color: ACCENT }}>
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-['Cambay',sans-serif] text-[13px] text-white/55">{item.label}</span>
                          <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[1px]" style={{ color: ACCENT }}>{item.load}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--cpq-subtle)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: ACCENT }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.load}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <p className="font-['Cambay',sans-serif] text-[11px] text-white/25 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {[
                { title: 'Visual Clarity Over Data Density', desc: 'Maps replace spreadsheets where possible. Show, don\'t tell.' },
                { title: 'Field-First Reality', desc: 'Design assumes mobile usage first. Patchy networks, bright sunlight, one-handed use.' },
                { title: 'Decision Support, Not Documentation', desc: 'Focus on operational intelligence — not filing cabinets.' },
              ].map((p, i) => (
                <FadeIn key={p.title} delay={i * 0.08}>
                  <GlassCard className="text-center py-5">
                    <div className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center font-['Bebas_Neue',sans-serif] text-[12px]" style={{ background: ACCENT_DIM, color: ACCENT }}>
                      {i + 1}
                    </div>
                    <div className="font-['Cambay',sans-serif] text-[13px] text-white/60 mb-1">{p.title}</div>
                    <p className="font-['Cambay',sans-serif] text-[12px] text-white/35 leading-[1.5]">{p.desc}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.2}>
              <NarrativeQuote accent={ACCENT}>
                Desktop-only solutions were impractical. Sales activity happens on site, during customer interactions, in transit. The tool had to meet agents where they already were.
              </NarrativeQuote>
            </FadeIn>

            {/* Architecture doodle */}
            <FadeIn delay={0.25} className="mt-4">
              <UnifiedArchitectureDoodle />
            </FadeIn>
          </section>

          {/* ═══ RESEARCH & DISCOVERY ══════════════════════════════════ */}
          <PlotSyncResearchSection />

          {/* ═══ WIREFRAMES ══════════════════════════════════════════ */}
          <section id="wireframes" className="pb-20">
            <SectionHeading
              chapter="05 — THE SKETCHES"
              title="Wireframes & Iterations"
              subtitle="15–20 mobile screens. 6–8 admin dashboards. Two surfaces, one unified experience."
              accent={ACCENT}
            />

            {/* ── Mobile Wireframes Zone ─── */}
            <FadeIn>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-5">
                  <Monitor size={14} style={{ color: ACCENT }} />
                  <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[3px]" style={{ color: `${ACCENT}80` }}>MOBILE WIREFRAMES — PRESENTATION</span>
                </div>
                <WireframeMonitorCarousel />
              </div>
            </FadeIn>

            {/* ── Admin Portal Wireframes Zone ─── */}
            <FadeIn delay={0.15}>
              <div className="mb-8 mt-8">
                <div className="flex items-center gap-2 mb-5">
                  <Layers size={14} className="text-white/35" />
                  <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[3px] text-white/35">ADMIN PORTAL WIREFRAMES</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <ZoomableWireframeCard img={wfAdmin3dMapImg} url="admin.plotsync.io/inventory/3d-map" label="3D PLOT MAP — INVENTORY" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ZoomableWireframeCard img={wfAdminGridImg} url="admin.plotsync.io/inventory/grid" label="PLOT GRID VIEW" />
                    <ZoomableWireframeCard img={wfAdminJourneyImg} url="admin.plotsync.io/journey" label="CUSTOMER JOURNEY" />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Iteration callout */}
            <FadeIn delay={0.25}>
              <GlassCard>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ACCENT_DIM }}>
                    <Camera size={24} style={{ color: ACCENT }} />
                  </div>
                  <div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[2px] text-white/60 mb-1">VISIT CAPTURE — MOST ITERATED FLOW</div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/50 leading-[1.6]">
                      The visit capture workflow went through multiple revisions — camera UX, customer
                      onboarding flow, verification confirmation states. Each round surfaced a new edge
                      case from field reality that the previous version missed.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          </section>

          {/* ═══ DECISIONS ═══════════════════════════════════════════ */}
          <section id="decisions" className="pb-20">
            <SectionHeading
              chapter="06 — THE TRADE-OFFS"
              title="Key UX Decisions"
              subtitle="Every design decision was a bet. Here's what I chose and why."
              accent={ACCENT}
            />

            {/* Decision cards */}
            <div className="flex flex-col gap-4 mb-8">
              {[
                {
                  title: 'Map-first inventory view over table-first',
                  rationale: 'Immediate spatial clarity. Sales agents think in plots and sectors, not rows and columns. Trade-off: higher initial design complexity and performance considerations for map rendering.',
                },
                {
                  title: 'Lightweight CRM over full-featured CRM',
                  rationale: 'Focus on real estate-specific workflows rather than generic CRM features. Lead capture, follow-ups, and visit history — not contact management theatrics. Trade-off: limited general CRM capabilities.',
                },
                {
                  title: 'Mobile-first architecture over desktop-first',
                  rationale: 'Field usage reality demanded it. Sales activity happens on site, during customer interactions, in transit. Desktop analytics evolved as a secondary surface. Trade-off: admin portal matured later.',
                },
                {
                  title: 'Lens-based analytics abstraction over dense dashboards',
                  rationale: 'Reduce cognitive overload by letting users view data through focused "lenses" — demand, velocity, verification — rather than one overwhelming dashboard. Trade-off: requires onboarding clarity.',
                },
              ].map((d, i) => (
                <FadeIn key={d.title} delay={i * 0.08}>
                  <GlassCard hover>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: ACCENT_DIM }}>
                        <ChevronRight size={12} style={{ color: ACCENT }} />
                      </div>
                      <div>
                        <div className="font-['Cambay',sans-serif] text-[14px] text-white/60 mb-1">{d.title}</div>
                        <p className="font-['Cambay',sans-serif] text-[13px] text-white/45 leading-[1.6]">{d.rationale}</p>
                      </div>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            {/* Decision doodle */}
            <FadeIn delay={0.3}>
              <PlotSyncDecisionDoodle />
            </FadeIn>
          </section>

          {/* ═══ SOLUTION ════════════════════════════════════════════ */}
          <section id="solution" className="pb-20">
            <SectionHeading
              chapter="07 — THE CRAFT"
              title="The Solution: Before → After"
              subtitle="From static PDFs and spreadsheets to interactive maps and verified workflows."
              accent={ACCENT}
            />

            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FadeIn>
                <GlassCard className="h-full" style={{ borderColor: 'rgba(239,68,68,0.10)' }}>
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-red-400/40 mb-4">BEFORE</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      'Static PDF plot layouts — no real-time availability',
                      'Spreadsheet inventory with version conflicts',
                      'Unverifiable site visits — no proof of field activity',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400/40 shrink-0 mt-1.5" />
                        <span className="font-['Cambay',sans-serif] text-[13px] text-white/55 leading-[1.5]">{item}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
              <FadeIn delay={0.1}>
                <GlassCard className="h-full" style={{ borderColor: `${ACCENT}20` }}>
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] mb-4" style={{ color: `${ACCENT}99` }}>AFTER</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      'Interactive plot maps with live availability status',
                      'Centralized inventory view — single source of truth',
                      'GPS-verified visit workflow with photo proof',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 size={12} style={{ color: ACCENT }} className="shrink-0 mt-1" />
                        <span className="font-['Cambay',sans-serif] text-[13px] text-white/50 leading-[1.5]">{item}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            {/* Mobile ↔ Admin connection */}
            <FadeIn delay={0.12}>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">MOBILE ↔ ADMIN DATA FLOW</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Visit verification', 'Lead updates', 'Inventory changes', 'Analytics sync'].map(item => (
                    <div key={item} className="py-2.5 px-3 rounded-xl text-center" style={{ background: 'var(--cpq-subtle)', border: `1px solid ${GLASS_BORDER}` }}>
                      <span className="font-['Cambay',sans-serif] text-[12px] text-white/42">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="font-['Cambay',sans-serif] text-[12px] text-white/30 mt-4 leading-[1.5]">
                  Field data captured on mobile feeds directly into admin analytics — visit verification,
                  lead updates, and inventory changes flow in real time to the oversight layer.
                </p>
              </GlassCard>
            </FadeIn>

            {/* ── Hi-Fi Mobile Screens ─── */}
            <FadeIn delay={0.18}>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Smartphone size={14} style={{ color: ACCENT }} />
                  <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[3px]" style={{ color: `${ACCENT}80` }}>HIGH-FIDELITY — MOBILE SCREENS</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom -mx-2 px-2">
                  <div className="shrink-0">
                    <PhoneMockup label="HI-FI — DASHBOARD">
                      <img src={wfProjectBrowseImg} alt="PlotSync hi-fi dashboard" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  <div className="shrink-0">
                    <PhoneMockup label="HI-FI — PLOT MAP">
                      <img src={wfMapInventoryImg} alt="PlotSync hi-fi plot map" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  <div className="shrink-0">
                    <PhoneMockup label="HI-FI — VISIT FLOW">
                      <img src={wfVisitCaptureImg} alt="PlotSync hi-fi visit flow" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  <div className="shrink-0">
                    <PhoneMockup label="HI-FI — CRM VIEW">
                      <img src={wfLeadMgmtImg} alt="PlotSync hi-fi CRM view" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                  <div className="shrink-0">
                    <PhoneMockup label="HI-FI — ANALYTICS">
                      <img src={wfLensAnalyticsImg} alt="PlotSync hi-fi analytics" className="w-full h-full object-cover" />
                    </PhoneMockup>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ── Hi-Fi Admin Portal Screens ─── */}
            <FadeIn delay={0.22}>
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Layers size={14} className="text-white/35" />
                  <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[3px] text-white/35">HIGH-FIDELITY — ADMIN PORTAL</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {HIFI_ADMIN_SCREENS.map((screen) => (
                    <ZoomableHiFiCard
                      key={screen.label}
                      img={screen.img}
                      url={screen.url}
                      label={screen.label}
                    />
                  ))}
                </div>
              </div>
            </FadeIn>
          </section>

          {/* ═══ PROCESS ════════════════════════════════════════════ */}
          <section id="journey" className="pb-20">
            <FadeIn>
              <NarrativeQuote accent={ACCENT}>
                Every phase answered a question the previous one raised — from "how do agents actually work" to "why does this flow feel right now."
              </NarrativeQuote>
            </FadeIn>
          </section>

          {/* ═══ IMPACT ══════════════════════════════════════════════ */}
          <section id="impact" className="pb-20">
            <SectionHeading
              chapter="09 — THE PROOF"
              title="Early Indicators & Impact"
              subtitle="Early-stage product — framed responsibly. These are signals from prototype testing, internal simulations, and stakeholder feedback."
              accent={ACCENT}
            />

            {/* Responsible framing note */}
            <FadeIn>
              <GlassCard className="mb-8" style={{ borderColor: `${ACCENT}15`, backgroundColor: `${ACCENT}04` }}>
                <div className="flex items-start gap-3">
                  <Activity size={14} style={{ color: `${ACCENT}60` }} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] mb-1" style={{ color: `${ACCENT}60` }}>EARLY-STAGE DISCLOSURE</div>
                    <p className="font-['Cambay',sans-serif] text-[12px] text-white/40 leading-[1.5]">
                      Metrics below are derived from prototype usability sessions, internal simulations,
                      and stakeholder feedback loops — not production analytics.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Big metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <MetricCard value="~40%" label="Faster Inventory Lookup" icon={TrendingDown} delay={0} attribution="Prototype usability sessions" accent={ACCENT} accentDim={`${ACCENT}15`} />
              <MetricCard value="↓ AMB" label="Reduced Availability Ambiguity" icon={BarChart3} delay={0.1} attribution="Internal simulation feedback" accent={ACCENT} accentDim={`${ACCENT}15`} />
              <MetricCard value="↑ CONS" label="Visit Documentation Consistency" icon={Zap} delay={0.2} attribution="Stakeholder feedback loops" accent={ACCENT} accentDim={`${ACCENT}15`} />
            </div>

            {/* Behavioral shift */}
            <FadeIn>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">BEHAVIORAL SHIFT</div>
                <div className="flex flex-col gap-3">
                  {[
                    'Sales teams rely less on spreadsheets for inventory checks',
                    'Managers gain visibility into field activity earlier in the cycle',
                    'Inventory discussions become visual and spatial — not tabular',
                  ].map((c) => (
                    <div key={c} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: ACCENT_DIM }}>
                        <CheckCircle2 size={12} style={{ color: ACCENT }} />
                      </div>
                      <span className="font-['Cambay',sans-serif] text-[13px] text-white/55">{c}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Business impact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Target, label: 'Stronger developer interest in the platform' },
                { icon: Shield, label: 'Improved internal operational alignment' },
                { icon: ArrowRight, label: 'Clear product roadmap foundation established' },
              ].map((b, i) => (
                <FadeIn key={b.label} delay={i * 0.08}>
                  <GlassCard className="text-center py-5">
                    <b.icon size={18} className="mx-auto mb-3" style={{ color: ACCENT }} />
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/50">{b.label}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            <FadeIn>
              <NarrativeQuote accent={ACCENT}>
                The map didn't just visualize inventory — it changed how teams talked about availability.
              </NarrativeQuote>
            </FadeIn>
          </section>

          {/* ═══ REFLECTION ══════════════════════════════════════════ */}
          <section id="reflection" className="pb-24">
            <SectionHeading
              chapter="10 — THE MIRROR"
              title="Reflection & Learnings"
              subtitle="PropTech UX isn't about digitizing paper — it's about making field reality visible to everyone in the chain."
              accent={ACCENT}
            />

            {/* What worked / what could improve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FadeIn>
                <GlassCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={14} style={{ color: ACCENT }} />
                    <div className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[2px]" style={{ color: `${ACCENT}99` }}>WHAT WORKED</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Map-first strategy', impact: 'Created immediate spatial clarity for inventory — agents stopped asking "which plots are left?"' },
                      { label: 'Visit verification workflow', impact: 'Built operational trust between field teams and management through GPS + photo proof' },
                      { label: 'Unified sales intelligence vision', impact: 'Aligned stakeholders around a single system instead of competing spreadsheets' },
                    ].map(w => (
                      <div key={w.label}>
                        <div className="font-['Cambay',sans-serif] text-[13px] text-white/55 mb-0.5">{w.label}</div>
                        <p className="font-['Cambay',sans-serif] text-[11px] text-white/25 leading-[1.5]">{w.impact}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
              <FadeIn delay={0.1}>
                <GlassCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={14} className="text-amber-400/50" />
                    <div className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[2px] text-amber-400/50">WHAT COULD IMPROVE</div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Backend integration earlier', note: 'Would have accelerated validation and caught data model issues sooner' },
                      { label: 'Admin portal parallel design', note: 'Mobile-first was correct, but delaying the oversight surface created a visibility gap for managers' },
                      { label: 'Deeper field testing', note: 'More on-site testing with real agents in real conditions — patchy networks, bright sunlight, multitasking' },
                    ].map(w => (
                      <div key={w.label}>
                        <div className="font-['Cambay',sans-serif] text-[13px] text-white/55 mb-0.5">{w.label}</div>
                        <p className="font-['Cambay',sans-serif] text-[11px] text-white/25 leading-[1.5]">{w.note}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>

            {/* Design system & scalability note */}
            <FadeIn delay={0.15}>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-3">DESIGN SYSTEM & SCALABILITY</div>
                <p className="font-['Cambay',sans-serif] text-[13px] text-white/50 leading-[1.7] mb-4">
                  Component patterns developed include map interaction modules, visit capture flow components,
                  and inventory visualization elements. These are now evolving into a reusable experience
                  library that can extend to new project types and developer partnerships.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Map interaction modules', 'Visit capture components', 'Inventory visualization', 'Reusable experience library'].map(b => (
                    <span key={b} className="font-['Cambay',sans-serif] text-[11px] py-1 px-3 rounded-full" style={{ color: ACCENT, background: ACCENT_DIM }}>{b}</span>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* ═══ HANDOFF SECTION (component) ═══════════════════════ */}
            <div style={{ marginTop: 80 }}>
              <PlotSyncHandoffSection />
            </div>
            <div style={{ height: 80 }} />
            {/* ── Closing CTA ────────────────────────────────────────── */}
            <FadeIn delay={0.2} className="mt-6">
              <div className="text-center py-16">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[5px] mb-5" style={{ color: ACCENT }}>WANT THE FULL STORY?</div>
                <h3 className="font-['Bebas_Neue',sans-serif] text-[32px] lg:text-[40px] text-white/95 tracking-[1px] leading-[1.05] mb-4">
                  Let's discuss this<br />in detail
                </h3>
                <p className="font-['Caladea',serif] text-[16px] lg:text-[18px] text-white/55 italic leading-[1.7] max-w-[480px] mx-auto mb-10">
                  Happy to walk you through the map-first strategy, visit verification
                  flows, and how field data shapes admin intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Primary CTA — Contact */}
                  <a
                    href="mailto:imgaurav2693@gmail.com"
                    className="flex items-center gap-2.5 py-3 px-7 rounded-xl transition-all duration-200 cursor-pointer hover:brightness-110"
                    style={{ background: ACCENT }}
                  >
                    <Mail size={14} className="text-white shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[13px] leading-none relative top-[0.1em] text-white">Contact Me</span>
                  </a>

                  {/* Secondary — Live Preview */}
                  <a
                    href="https://projects-mauve-one.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-3 px-7 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <ExternalLink size={14} className="text-white/50 shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[13px] leading-none relative top-[0.1em] text-white/50">View Admin Panel Live Preview</span>
                  </a>

                  {/* Tertiary — Back */}
                  <button
                    onClick={() => embedded && onClose ? onClose() : navigate('/')}
                    className="flex items-center gap-2 py-3 px-5 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <ArrowLeft size={13} className="text-white/25 shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[12px] leading-none relative top-[0.1em] text-white/25">{embedded ? 'Close Preview' : 'Back to Portfolio'}</span>
                  </button>
                </div>
              </div>
            </FadeIn>
          </section>

        </div>
      </div>
    </div>
  );
}
