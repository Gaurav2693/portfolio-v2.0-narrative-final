import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ExternalLink, Clock, Users, Layers, Shield, Zap, Target, ChevronRight, AlertTriangle, CheckCircle2, TrendingDown, BarChart3, Lightbulb, Sun, Moon, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GlassCard, SectionHeading, FadeIn, MetricCard, NarrativeQuote, WireframeCard } from '../components/case-study';
import JourneyMapDoodle from '../components/journey-map-doodle';
import IAArchitectureDoodle from '../components/ia-architecture-doodle';
import LegacyUIDoodle from '../components/legacy-ui-doodle';
import DecisionFrameworkDoodle from '../components/decision-framework-doodle';
import ClosingJourneyDoodle from '../components/closing-journey-doodle';
import cpqHeroImg from 'figma:asset/0aa2a2dcc50a10fc786338b36682ed4cf920b4f4.png';
import wireframeQuoteBuilder from 'figma:asset/e38a350362f465436a799592d23ffa303a585919.png';
import wireframeCartFlow from 'figma:asset/ec9842437a530f029de0ebc049bd89303af7c065.png';
import wireframeLiveSnapshot from 'figma:asset/bf950f07b1d83fbea6f3ed8cbc313d2420b3ee17.png';
import wireframeApprovalScreen from 'figma:asset/fb248752d3a5f604a359dc9942724f2f11ce70b8.png';
import wireframeProductDetails from 'figma:asset/3cd0a6869dec9ba4a0b145e85a735825de80f3ac.png';
import hifiOfferMgmt from 'figma:asset/702c7d7efa7e5d7056986984425133e934c59599.png';
import hifiCartReview from 'figma:asset/118738f9619a1d2f6a998e5809cf43bcfedf02e5.png';
import hifiWorkflow from 'figma:asset/50bea49b9018d1256952ac09eb1b75439fbbd4cd.png';

/* ═══════════════════════════════════════════════════════════════════════
   CPQ CASE STUDY — Price Quotation Engine
   ────────────────────────────────────────
   Standalone FAANG-style narrative case study page.
   Dark glass aesthetic matching the room design system.
   Rebuilt to clear bundler cache.
   ═══════════════════════════════════════════════════════════════════════ */

const ACCENT = '#00A87C';
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
  { id: 'wireframes', label: 'Wireframes' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'solution', label: 'Solution' },
  { id: 'journey', label: 'Process' },
  { id: 'impact', label: 'Impact' },
  { id: 'reflection', label: 'Reflection' },
];

/* ── Shared case study components imported from ../components/case-study ── */

/* ═══════════════════════════════════════════════════════════════════ */
interface CpqCaseStudyProps {
  embedded?: boolean;
  onClose?: () => void;
}

export default function CpqCaseStudy({ embedded = false, onClose }: CpqCaseStudyProps) {
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
    '--cpq-accent-dim': 'rgba(0,168,124,0.08)',
    '--cpq-subtle': 'rgba(0,0,0,0.03)',
  } : {
    '--cpq-glass': 'rgba(255,255,255,0.055)',
    '--cpq-glass-border': 'rgba(255,255,255,0.10)',
    '--cpq-glass-hover': 'rgba(255,255,255,0.08)',
    '--cpq-accent-dim': 'rgba(0,168,124,0.15)',
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
                {/* Label — always visible */}
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

        {/* Bottom actions — compact row */}
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
            href="https://cpq-dashboard-v2.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{ background: `${ACCENT}15` }}
            title="Live Prototype"
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
              <span className="font-['Bebas_Neue',sans-serif] text-[12px] tracking-[2px] text-white/35">PRICE QUOTATION ENGINE</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://cpq-dashboard-v2.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ExternalLink size={11} className="text-white/40" />
                <span className="font-['Cambay',sans-serif] text-[11px] text-white/40">Prototype</span>
              </a>
              <button
                onClick={() => navigate('/cpq-case-study')}
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
                {['ENTERPRISE CPQ', 'UX DESIGN', 'B2B SaaS', '6 MONTHS'].map(tag => (
                  <span key={tag} className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] py-1 px-3 rounded-full" style={{ color: ACCENT, background: ACCENT_DIM, border: `1px solid rgba(0,168,124,0.15)` }}>{tag}</span>
                ))}
              </div>

              {/* Title block */}
              <h1 className="font-['Bebas_Neue',sans-serif] text-[52px] lg:text-[72px] text-white/95 tracking-[2px] leading-[0.95] mb-4">
                PRICE QUOTATION<br />
                <span style={{ color: ACCENT }}>ENGINE</span>
              </h1>
              <p className="font-['Caladea',serif] text-[18px] lg:text-[20px] text-white/55 leading-[1.7] max-w-[600px] mb-8">
                Redesigning an enterprise CPQ system to reduce pricing errors by 81%
                and transform how sales agents configure complex telecom offers.
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 mb-10">
                {[
                  { icon: Users, label: 'Role', value: 'UX Designer / Product Designer' },
                  { icon: Clock, label: 'Duration', value: '6 months' },
                  { icon: Layers, label: 'Industry', value: 'IT / B2B Telecom' },
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

              {/* Hero — monitor mockup */}
              <motion.div
                className="relative rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Monitor bezel */}
                <div
                  className="dark-zone rounded-2xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #1E1E24 0%, #16161B 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Title bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Traffic lights */}
                    <div className="flex gap-1.5">
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#FF5F57' }} />
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#FEBC2E' }} />
                      <div className="w-[10px] h-[10px] rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    {/* URL bar */}
                    <div className="flex-1 flex justify-center">
                      <a href="https://cpq-dashboard-v2.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all duration-200 hover:bg-white/[0.07] cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L6 1C3.23858 1 1 3.23858 1 6V6C1 8.76142 3.23858 11 6 11V11C8.76142 11 11 8.76142 11 6V6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="3.5" r="1" fill="rgba(255,255,255,0.15)"/></svg>
                        <span className="font-['Cambay',sans-serif] text-[10px] text-white/20 hover:text-white/40 transition-colors">cpq-dashboard-v2.vercel.app</span>
                      </a>
                    </div>
                    <div className="w-[46px]" />
                  </div>
                  {/* Screenshot */}
                  <div className="relative">
                    <img
                      src={cpqHeroImg}
                      alt="CPQ Dashboard — Address Sites & Products with Live Snapshot panel"
                      className="w-full block"
                      style={{ display: 'block' }}
                    />
                    {/* Subtle vignette overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(8,12,20,0.2) 100%)' }}
                    />
                  </div>
                </div>
                {/* Monitor stand */}
                <div className="flex flex-col items-center">
                  <div className="w-[60px] h-[18px]" style={{ background: 'linear-gradient(180deg, #1A1A20, #111115)', borderRadius: '0 0 4px 4px' }} />
                  <div className="w-[120px] h-[6px] rounded-b-lg" style={{ background: 'linear-gradient(180deg, #16161B, #0E0E12)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ═══ CONTEXT ═════════════════════════════════════════════ */}
          <section id="context" className="pb-20">
            <SectionHeading
              chapter="01 — THE STAGE"
              title="System Context & Users"
              subtitle="Enterprise CPQ system used by sales agents to configure Internet, VoIP, and Ethernet services for large customers including schools, hospitals, and enterprise campuses."
            />

            <FadeIn>
              <NarrativeQuote>
                If left unresolved, the system itself was becoming a reason deals were lost.
              </NarrativeQuote>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="font-['Cambay',sans-serif] text-[15px] text-white/55 leading-[1.8] mb-8">
                Agents generate, sign, and lock complex price configurations per customer premises.
                Legacy CPQ caused delays, pricing errors, and misconfigured orders — creating high risk
                of losing enterprise deals for a US-based ISP due to slow and error-prone workflows.
              </p>
            </FadeIn>

            {/* User role cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {[
                { role: 'Sales Executives', resp: 'Quote creation, deal closure', ctx: 'Used daily under time pressure with high accountability for pricing accuracy and configuration correctness' },
                { role: 'Admin / Approval Authorities', resp: 'Discounts, validations', ctx: 'Gate-keeping role ensuring compliance with business rules and pricing policies' },
              ].map((u, i) => (
                <FadeIn key={u.role} delay={i * 0.1}>
                  <GlassCard>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Users size={14} style={{ color: ACCENT }} />
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
              <GlassCard style={{ borderColor: 'rgba(245,158,11,0.15)', backgroundColor: 'rgba(245,158,11,0.03)' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-amber-400/50 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-amber-400/60 mb-1">CRITICAL RISK ZONE</div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/55 leading-[1.6]">
                      Configuration decisions made in isolation triggered approval failures 3–5 days later,
                      requiring complete quote regeneration.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Flow diagram placeholder */}
            <FadeIn delay={0.3} className="mt-8">
              <JourneyMapDoodle />
            </FadeIn>
          </section>

          {/* ═══ THE PROBLEM ═════════════════════════════════════════ */}
          <section id="problem" className="pb-20">
            <SectionHeading
              chapter="02 — THE FRACTURE"
              title="The Core Problem"
              subtitle="What looked like a UI problem was actually a cognitive architecture failure."
            />

            {/* Surface vs root */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FadeIn>
                <GlassCard className="h-full">
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">SURFACE SYMPTOMS</div>
                  <div className="flex flex-col gap-3">
                    {['Complex', 'Slow', 'Confusing'].map((s, i) => (
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
                    Excessive cognitive load and lack of system guidance during high-stakes decision making.
                  </p>
                  <div className="flex flex-col gap-2">
                    {['Wrong price', 'Wrong configuration', 'Wrong approvals'].map(f => (
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
              <NarrativeQuote>
                Users didn't fail because they were careless — they failed because the system
                was never designed to support human decision-making.
              </NarrativeQuote>
            </FadeIn>

            {/* Before state doodle */}
            <FadeIn delay={0.2} className="mt-4">
              <LegacyUIDoodle />
            </FadeIn>
          </section>

          {/* ═══ CONSTRAINTS ═════════════════════════════════════════ */}
          <section id="constraints" className="pb-20">
            <SectionHeading
              chapter="03 — THE BOUNDARIES"
              title="Constraints & Non-Negotiables"
              subtitle="The backend couldn't change. UX had to absorb the complexity instead of exposing it."
            />

            {/* Integration grid */}
            <FadeIn>
              <GlassCard className="mb-6">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">INTEGRATION SURFACE</div>
                <div className="flex flex-wrap gap-2">
                  {['Salesforce', 'SAP BRIM', 'Order Management', 'O2 / SQE / EOM', 'AMS / C360', 'DocuSign'].map(s => (
                    <span key={s} className="font-['Cambay',sans-serif] text-[12px] py-1.5 px-3 rounded-lg text-white/40" style={{ background: 'var(--cpq-subtle)', border: `1px solid ${GLASS_BORDER}` }}>{s}</span>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Non-negotiables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Shield, label: 'Legacy APIs', desc: 'Fixed response times and strict data contracts' },
                { icon: Target, label: 'Security & Compliance', desc: 'Non-negotiable regulatory requirements' },
                { icon: Layers, label: 'Approval Flows', desc: 'Mandatory multi-tier approval routing' },
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
              <NarrativeQuote attribution="— Design positioning">
                Backend constraints could not be changed. UX focused on absorbing complexity instead of exposing it.
              </NarrativeQuote>
            </FadeIn>
          </section>

          {/* ═══ APPROACH ════════════════════════════════════════════ */}
          <section id="approach" className="pb-20">
            <SectionHeading
              chapter="04 — THE METHOD"
              title="Mental Model & Strategy"
              subtitle="Workflow broken into 4 steps based on cognitive load and turnaround time. The system flexes — not the user."
            />

            {/* Cognitive load distribution */}
            <FadeIn>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-6">COGNITIVE LOAD DISTRIBUTION</div>
                <div className="flex flex-col gap-4">
                  {[
                    { step: 1, load: 40, label: 'Foundational Accuracy', desc: 'Heavy upfront validation to catch errors early' },
                    { step: 2, load: 20, label: 'Configuration', desc: 'Guided product and service setup' },
                    { step: 3, load: 20, label: 'Pricing', desc: 'Discount rules and approval routing' },
                    { step: 4, load: 20, label: 'Review & Lock', desc: 'Final verification with Live Snapshot' },
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
                'Linear progression for safety',
                'Progressive disclosure to reduce overwhelm',
                'Navigate freely without losing state',
              ].map((p, i) => (
                <FadeIn key={p} delay={i * 0.08}>
                  <GlassCard className="text-center py-5">
                    <div className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center font-['Bebas_Neue',sans-serif] text-[12px]" style={{ background: ACCENT_DIM, color: ACCENT }}>
                      {i + 1}
                    </div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/50 leading-[1.5]">{p}</p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.2}>
              <NarrativeQuote>
                The system flexes — not the user.
              </NarrativeQuote>
            </FadeIn>

            {/* Strategy sketch placeholder */}
            <FadeIn delay={0.25} className="mt-4">
              <IAArchitectureDoodle />
            </FadeIn>
          </section>

          {/* ═══ WIREFRAMES ══════════════════════════════════════════ */}
          <section id="wireframes" className="pb-20">
            <SectionHeading
              chapter="05 — THE SKETCHES"
              title="Wireframes & Iterations"
              subtitle="From rough sketches to polished screens — refining every detail through continuous iteration."
            />

            {/* Wireframe grid — 2-column asymmetric layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Left column: Quote Builder → Cart Flow → Approval Screen */}
              <div className="flex flex-col gap-4">
                <FadeIn>
                  <WireframeCard src={wireframeQuoteBuilder} label="WIREFRAME — QUOTE BUILDER" caption="Low-fi wireframe showing the step-by-step quote configuration flow" />
                </FadeIn>
                <FadeIn delay={0.1}>
                  <WireframeCard src={wireframeCartFlow} label="WIREFRAME — CART FLOW" caption="Cart introduction wireframe — a key defended decision that enabled full config review" />
                </FadeIn>
                <FadeIn delay={0.15}>
                  <WireframeCard src={wireframeApprovalScreen} label="WIREFRAME — APPROVAL SCREEN" caption="OMT approval screen with offer management, discount status per product, conditional approve/reject actions, and Live Snapshot sidebar" />
                </FadeIn>
              </div>
              {/* Right column: Live Snapshot → Placeholder */}
              <div className="flex flex-col gap-4">
                <FadeIn delay={0.08}>
                  <WireframeCard src={wireframeLiveSnapshot} label="WIREFRAME — LIVE SNAPSHOT" caption="Real-time snapshot panel showing opportunity details, site addresses, product categories, pricing, and discount validation status" />
                </FadeIn>
                <FadeIn delay={0.2}>
                  <WireframeCard src={wireframeProductDetails} label="WIREFRAME — PRODUCT DETAILS" caption="Product details section wireframe — the most iterated component with 23 rounds of refinement targeting error reduction in site eligibility, product type selection, and service validation" />
                </FadeIn>
              </div>
            </div>

            {/* Iteration callout */}
            <FadeIn delay={0.25}>
              <GlassCard>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ACCENT_DIM }}>
                    <span className="font-['Bebas_Neue',sans-serif] text-[28px]" style={{ color: ACCENT }}>23</span>
                  </div>
                  <div>
                    <div className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[2px] text-white/60 mb-1">ITERATIONS ON PRODUCT DETAILS</div>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-white/50 leading-[1.6]">
                      The product details section went through 23 design iterations with a single goal: reduce errors.
                      Each round surfaced a new edge case that the previous version missed.
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
            />

            {/* Decision cards */}
            <div className="flex flex-col gap-4 mb-8">
              {[
                {
                  title: 'Real-time visual feedback over static forms',
                  rationale: 'Static forms gave users no confidence in their choices. Live validation transformed the editing experience from "submit and pray" to "see and adjust."',
                },
                {
                  title: 'Embedded educational callouts without interrupting flow',
                  rationale: 'Users needed guidance but couldn\'t afford to be pulled out of context. Inline help reduced errors without adding friction.',
                },
                {
                  title: 'Introduction of cart and cart flow',
                  rationale: 'A defended decision that enabled full configuration review before finalizing. Borrowed from e-commerce mental models to reduce lock-in anxiety.',
                },
                {
                  title: 'Safety prioritized over flexibility',
                  rationale: 'Progressive disclosure prevented risky jumps. Navigation freedom was retained via the step progression bar — giving users control without exposing danger.',
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

            {/* Trade-off doodle */}
            <FadeIn delay={0.3}>
              <DecisionFrameworkDoodle />
            </FadeIn>
          </section>

          {/* ═══ SOLUTION ════════════════════════════════════════════ */}
          <section id="solution" className="pb-20">
            <SectionHeading
              chapter="07 — THE CRAFT"
              title="Key Flows: Before → After"
              subtitle="The Offer Management flow was where most value was created and most trust was earned."
            />

            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FadeIn>
                <GlassCard className="h-full" style={{ borderColor: 'rgba(239,68,68,0.10)' }}>
                  <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-red-400/40 mb-4">BEFORE</div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      'No visibility into discount approval status',
                      'No clarity on approved vs requested discounts',
                      'OMT comments lived outside the system',
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
                      'Live Snapshot shows discount status per product',
                      'Approved vs requested discounts clearly visible',
                      'OMT comments surfaced inline',
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

            {/* OMT experience */}
            <FadeIn delay={0.15}>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">OMT APPROVAL EXPERIENCE</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Conditional approval screens', 'Mandatory comments', 'Inline discount editing', 'Sales ↔ OMT view parity'].map(item => (
                    <div key={item} className="py-2.5 px-3 rounded-xl text-center" style={{ background: 'var(--cpq-subtle)', border: `1px solid ${GLASS_BORDER}` }}>
                      <span className="font-['Cambay',sans-serif] text-[12px] text-white/42">{item}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Solution screenshots */}
            <FadeIn delay={0.2}>
              <WireframeCard src={hifiOfferMgmt} label="HIGH-FIDELITY — OFFER MANAGEMENT" caption="Final offer management UI with discount approval table, Live Snapshot sidebar showing real-time MRC totals, product category badges, and current step progress — the core screen where sales agents and OMT approvers collaborate on pricing" />
            </FadeIn>

            <FadeIn delay={0.25} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WireframeCard src={hifiCartReview} label="HIGH-FIDELITY — CART REVIEW" caption="Service Cart Details modal with site-level configuration summary, product category breakdown, validated address status, primary services accordion, and total order amount with per-site edit controls" />
                <WireframeCard src={hifiWorkflow} label="HIGH-FIDELITY — WORKFLOW PROGRESSION" caption="Full CPQ workflow view showing step progression sidebar, quote generation flow with ready-to-generate state, and Live Snapshot panel with approval status, MRC totals, and product summary" />
              </div>
            </FadeIn>
          </section>

          {/* ═══ PROCESS ════════════════════════════════════════════ */}
          <section id="journey" className="pb-20">
            <SectionHeading
              chapter="08 — THE PROCESS"
              title="Design Process"
              subtitle="Six phases. One goal: transform how sales agents configure complex telecom offers."
            />

            {/* Process narrative */}
            <FadeIn>
              <p className="font-['Cambay',sans-serif] text-[15px] text-white/55 leading-[1.8] mb-4">
                The process began with moodboards and competitive audits — studying how enterprise tools
                like Salesforce CPQ, DealHub, and Zuora handled complex configuration flows — to establish
                a visual and interaction baseline. From there, I moved into deep user research: shadowing
                sales agents during live quoting sessions, mapping their pain points, and identifying
                where cognitive overload was highest.
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="font-['Cambay',sans-serif] text-[15px] text-white/55 leading-[1.8] mb-4">
                Ideation produced dozens of concepts for progressive disclosure, real-time feedback,
                and guided workflows. The strongest ideas were pressure-tested against the information
                architecture — restructuring the entire CPQ flow from a flat, monolithic form into a
                four-step cognitive-load-aware journey. Each step was scoped to match the mental model
                of the task at hand, not the data model of the backend.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="font-['Cambay',sans-serif] text-[15px] text-white/55 leading-[1.8] mb-8">
                What followed were 23 iterations on the product details section alone — each round
                eliminating one more source of error or confusion. Wireframes evolved into mid-fi
                prototypes, then high-fidelity screens validated through usability testing with real
                agents. The final shipped product wasn't the result of a single breakthrough — it was
                the accumulation of small, research-backed decisions made across every phase.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <NarrativeQuote>
                Every phase answered a question the previous one raised — from "what's broken" to "why does this work now."
              </NarrativeQuote>
            </FadeIn>

            {/* Process cards */}
            <FadeIn delay={0.2} className="mt-8">
              <ClosingJourneyDoodle />
            </FadeIn>
          </section>

          {/* ═══ IMPACT ══════════════════════════════════════════════ */}
          <section id="impact" className="pb-20">
            <SectionHeading
              chapter="09 — THE PROOF"
              title="Outcomes & Impact"
              subtitle="The system didn't just work better — it changed how people worked."
            />

            {/* Big metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <MetricCard value="↓ 42%" label="Reduced Quote Time" icon={TrendingDown} delay={0} attribution="Compared pre/post release" />
              <MetricCard value="↓ 81%" label="Lower Error Rate" icon={BarChart3} delay={0.1} attribution="Measured via internal QA + agent feedback cycles" />
              <MetricCard value="↓ 60%" label="Reduced Training Time" icon={Zap} delay={0.2} attribution="Derived from ticket volume / escalation reduction" />
            </div>

            {/* Behavioral shift */}
            <FadeIn>
              <GlassCard className="mb-8">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[3px] text-white/20 mb-4">BEHAVIORAL SHIFT</div>
                <div className="flex flex-col gap-3">
                  {[
                    'Sales agents gained confidence in system guidance',
                    'Fewer escalations and rework cycles',
                    'Users trusted real-time validation feedback',
                  ].map((c, i) => (
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
                { icon: Zap, label: 'Faster deal turnaround' },
                { icon: Shield, label: 'Fewer downstream issues' },
                { icon: ArrowRight, label: 'CPQ became an enabler, not a bottleneck' },
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
              <NarrativeQuote>
                Live Snapshot feedback changed user behavior from defensive to confident.
              </NarrativeQuote>
            </FadeIn>
          </section>

          {/* ═══ REFLECTION ══════════════════════════════════════════ */}
          <section id="reflection" className="pb-24">
            <SectionHeading
              chapter="10 — THE MIRROR"
              title="Reflection & Learnings"
              subtitle="Enterprise UX is not about removing complexity — it's about placing it where humans can handle it best."
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
                      { label: 'Cognitive-load-driven structure', impact: 'Reduced mental burden by distributing complexity across steps' },
                      { label: 'Live Snapshot as trust anchor', impact: 'Real-time feedback transformed user confidence' },
                      { label: 'Guardrails with flexibility', impact: 'Safety without sacrificing user autonomy' },
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
                      { label: 'Adaptive layouts earlier', note: 'Responsive design should have been prioritized from initial wireframes' },
                      { label: 'Role-based shortcuts for power users', note: 'Experienced users needed faster paths once they mastered the system' },
                      { label: 'Deeper decision analytics', note: 'More granular tracking of user decision patterns to inform future iterations' },
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
                  Built on Material Design principles with a modern React runtime. Core components reused
                  across product categories and scenarios (Install, Change, Disconnect, Add).
                  System adapts via configuration, not redesign.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Faster onboarding of new products', 'Lower maintenance cost', 'Predictable user experience'].map(b => (
                    <span key={b} className="font-['Cambay',sans-serif] text-[11px] py-1 px-3 rounded-full" style={{ color: ACCENT, background: ACCENT_DIM }}>{b}</span>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* ── Closing CTA ────────────────────────────────────────── */}
            <FadeIn delay={0.2} className="mt-6">
              <div className="text-center py-16">
                <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[5px] mb-5" style={{ color: ACCENT }}>WANT THE FULL STORY?</div>
                <h3 className="font-['Bebas_Neue',sans-serif] text-[32px] lg:text-[40px] text-white/95 tracking-[1px] leading-[1.05] mb-4">
                  Let's discuss this<br />in detail
                </h3>
                <p className="font-['Caladea',serif] text-[16px] lg:text-[18px] text-white/55 italic leading-[1.7] max-w-[480px] mx-auto mb-10">
                  Happy to walk you through the edge cases, approval loops,
                  and why Live Snapshot changed behavior.
                </p>

                {/* Cross-nav: Back to overview + Next */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => navigate('/lite')}
                    className="flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <ArrowLeft size={12} className="text-white/35 shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/40">Back to overview</span>
                  </button>
                  <span className="text-white/15">|</span>
                  <button
                    onClick={() => navigate('/plotsync-case-study')}
                    className="flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/40">Next: PlotSync</span>
                    <ArrowRight size={12} className="text-white/35 shrink-0" />
                  </button>
                </div>

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

                  {/* Secondary — Live Proto */}
                  <a
                    href="https://cpq-dashboard-v2.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer"
                    style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                  >
                    <ExternalLink size={14} className="text-white/40 shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[13px] leading-none relative top-[0.1em] text-white/40">View Live Prototype</span>
                  </a>

                  {/* Tertiary — Back */}
                  <button
                    onClick={() => embedded && onClose ? onClose() : navigate('/lite')}
                    className="flex items-center gap-2 py-3 px-5 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <ArrowLeft size={13} className="text-white/25 shrink-0" />
                    <span className="font-['Cambay',sans-serif] text-[12px] leading-none relative top-[0.1em] text-white/25">{embedded ? 'Close Preview' : 'Back to overview'}</span>
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