import {
  ExternalLink,
  ArrowRight,
  Mail,
  FileText,
  LayoutGrid,
  Cpu,
  Map,
  Bot,
  Activity,
  TrendingDown,
  BarChart3,
  Zap,
  Download,
} from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { downloadResumePdf } from "@/app/components/resume-download";

type CaseStudyCard = {
  id: "cpq" | "plotsync" | "exiro";
  title: string;
  domain: string;
  bullets: [string, string, string];
  caseStudyPath: string;
  prototypeUrl?: string;
  accent: string;
};

type PrototypeLink = {
  id: string;
  title: string;
  domain: string;
  liveUrl: string;
  accent: string;
  status: "LIVE" | "BETA" | "DEMO";
};

const T = {
  bg: "#0A0E14",
  card: "rgba(12,16,24,0.92)",
  cardBorder: "rgba(255,255,255,0.07)",
  ink: "rgba(255,255,255,0.92)",
  inkSoft: "rgba(255,255,255,0.70)",
  inkMuted: "rgba(255,255,255,0.48)",
  inkFaint: "rgba(255,255,255,0.30)",
  surfaceHover: "rgba(255,255,255,0.04)",
};

const ACCENT_GREEN = "#2EFB74";
const DARK_GREEN_TEXT = "#06361B";

const CASE_STUDIES: CaseStudyCard[] = [
  {
    id: "cpq",
    title: "Price Quotation Engine",
    domain: "ENTERPRISE CPQ",
    bullets: [
      "Re-architected a legacy CPQ flow into a guided 4-step decision path",
      "Designed for error prevention under strict backend constraints",
      "Outcome: ↓ 81% errors, ↓ 42% quote time (measured post-release)",
    ],
    caseStudyPath: "/cpq-case-study",
    prototypeUrl: "https://cpq-dashboard-v2.vercel.app/",
    accent: ACCENT_GREEN,
  },
  {
    id: "plotsync",
    title: "PlotSync Decision Platform",
    domain: "REAL ESTATE AI",
    bullets: [
      "Unified parcel selection, trust signals, and comparison into one workflow",
      "Tested map + table evaluation to reduce decision time and ambiguity",
      "Prototype validates contextual overlays without UI overload",
    ],
    caseStudyPath: "/plotsync-case-study",
    prototypeUrl: "https://projects-mauve-one.vercel.app/",
    accent: "#FFB033",
  },
  {
    id: "exiro",
    title: "Exiro AI Operator Console",
    domain: "AI OPERATIONS",
    bullets: [
      "Designed controls + transparency for autonomous agent decisions",
      "Focused on confidence, audit trails, and override affordances",
      "Prototype explores trust building for hands-off automation",
    ],
    caseStudyPath: "/exiro-case-study",
    prototypeUrl: "https://exiro-ai-console.vercel.app/",
    accent: "#8B5CF6",
  },
];

const PROTOTYPES: PrototypeLink[] = [
  {
    id: "cpq-dashboard-v2",
    title: "CPQ Dashboard v2",
    domain: "ENTERPRISE PRICING",
    liveUrl: "https://cpq-dashboard-v2.vercel.app/",
    accent: ACCENT_GREEN,
    status: "LIVE",
  },
  {
    id: "plotsync-platform",
    title: "PlotSync Platform",
    domain: "REAL ESTATE AI",
    liveUrl: "https://projects-mauve-one.vercel.app/",
    accent: "#FFB033",
    status: "BETA",
  },
  {
    id: "exiro-console",
    title: "Exiro AI Console",
    domain: "AI OPERATIONS",
    liveUrl: "https://exiro-ai-console.vercel.app/",
    accent: "#8B5CF6",
    status: "DEMO",
  },
  {
    id: "stillroom-canvas",
    title: "Stillroom Thinking Canvas",
    domain: "SPATIAL TOOL",
    liveUrl: "https://stillroom-thinking-canvas.vercel.app/",
    accent: "#00EAFF",
    status: "LIVE",
  },
  {
    id: "inertia-game",
    title: "INERTIA",
    domain: "GAME DESIGN",
    liveUrl: "https://inertia-game-environment.vercel.app/",
    accent: "#FF6B6B",
    status: "BETA",
  },
];

function Pill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 10,
        letterSpacing: 3,
        color: accent,
        background: `${accent}1A`,
        border: `1px solid ${accent}2A`,
      }}
    >
      {label}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  accent,
  textColor = "#fff",
}: {
  children: ReactNode;
  onClick?: () => void;
  accent: string;
  textColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:brightness-110 leading-none [&>span]:relative [&>span]:top-[2px]"
      style={{ background: accent, color: textColor }}
    >
      {children}
    </button>
  );
}

function SecondaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const isMailto = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMailto ? undefined : "_blank"}
      rel={isMailto ? undefined : "noopener noreferrer"}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.surfaceHover;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
      }}
    >
      {children}
    </a>
  );
}

const METRICS = [
  { value: "↓ 81%", label: "Fewer Errors", icon: BarChart3, accent: ACCENT_GREEN },
  { value: "↓ 42%", label: "Quote Time", icon: TrendingDown, accent: ACCENT_GREEN },
  { value: "↓ 60%", label: "Training Time", icon: Zap, accent: ACCENT_GREEN },
];

export default function LiteHome() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div className="min-h-screen w-full" style={{ background: T.bg, color: T.ink }}>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: "rgba(255,255,255,0.04)" }}>
        <motion.div className="h-full" style={{ width: progressWidth, background: ACCENT_GREEN }} />
      </div>

      <div className="max-w-[1040px] mx-auto px-6 lg:px-10 py-12 lg:py-16 text-left">
        {/* Top */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Pill label="LITE" accent="#9CA3AF" />
              <span
                className="text-[11px]"
                style={{ fontFamily: "'Space Mono', monospace", color: T.inkFaint }}
              >
                recruiter-friendly, case-studies-first
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SecondaryLinkButton href="mailto:imgaurav2693@gmail.com">
                <Mail size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: 1 }}>
                  Contact
                </span>
              </SecondaryLinkButton>
              <button
                onClick={() => navigate("/prototypes")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                }}
              >
                <LayoutGrid size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: 1 }}>
                  All prototypes (in-app)
                </span>
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-col lg:flex-row gap-8 lg:items-stretch">
            {/* Hero copy */}
            <div className="flex-1">
              <h1
                className="text-[44px] lg:text-[56px] leading-[0.95] tracking-[1px]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="kinetic-word" style={{ ["--d" as string]: "0ms" }}>PRODUCT</span>{" "}
                <span className="kinetic-word" style={{ ["--d" as string]: "80ms" }}>DESIGNER</span>{" "}
                <span className="kinetic-word" style={{ ["--d" as string]: "160ms" }}>WHO</span>{" "}
                <span className="kinetic-word" style={{ ["--d" as string]: "240ms" }}>SHIPS</span>{" "}
                <span className="kinetic-word kinetic-accent" style={{ ["--d" as string]: "320ms", color: ACCENT_GREEN }}>INTERACTIVE</span>{" "}
                <span className="kinetic-word kinetic-accent" style={{ ["--d" as string]: "400ms", color: ACCENT_GREEN }}>PROOF.</span>
              </h1>
              <p
                className="mt-4 max-w-[640px] text-[15px] leading-[1.8]"
                style={{ fontFamily: "'Cambay', sans-serif", color: T.inkMuted }}
              >
                I design decision-heavy systems (B2B, AI, complex workflows) and build high-fidelity
                prototypes to validate behavior before production.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 flex-wrap">
                <PrimaryButton
                  accent={ACCENT_GREEN}
                  textColor={DARK_GREEN_TEXT}
                  onClick={() =>
                    document.getElementById("case-studies")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <FileText size={14} className="shrink-0" />
                  <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, lineHeight: 1 }}>
                    View case studies
                  </span>
                  <ArrowRight size={14} className="shrink-0" />
                </PrimaryButton>
                <button
                  onClick={() => downloadResumePdf()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  <Download size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                  <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, lineHeight: 1 }}>
                    Download resume
                  </span>
                </button>
              </div>
            </div>

            {/* Exact SVG hero (with subtle green glow from the screen) */}
            <div className="hidden md:block flex-1 min-w-[260px]">
              <div className="relative w-full">
                <img
                  src="/lite-hero.svg"
                  alt="Hero illustration from portfolio SVG"
                  className="w-full h-auto select-none pointer-events-none"
                  style={{
                    display: "block",
                    filter: "drop-shadow(0 24px 80px rgba(0,0,0,0.85))",
                  }}
                />
                {/* Glow rising from the screen area */}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                >
                  <div
                    className="lite-hero-glow-plume"
                    style={{
                      position: "absolute",
                      left: "50.8%",
                      top: "31.5%",
                      width: "44%",
                      height: "52%",
                      transform: "translateX(-50%)",
                      background:
                        "radial-gradient(ellipse at 50% 70%, rgba(46,251,116,0.36) 0%, rgba(46,251,116,0.18) 35%, rgba(46,251,116,0.0) 72%)",
                      filter: "blur(22px)",
                      opacity: 0.9,
                    }}
                  />
                  <div
                    className="lite-hero-glow-core"
                    style={{
                      position: "absolute",
                      left: "50.8%",
                      top: "43.5%",
                      width: "26%",
                      height: "14%",
                      transform: "translateX(-50%)",
                      background:
                        "radial-gradient(ellipse at center, rgba(46,251,116,0.58) 0%, rgba(46,251,116,0.18) 45%, rgba(46,251,116,0.0) 76%)",
                      filter: "blur(10px)",
                      opacity: 0.95,
                    }}
                  />
                </div>
                <style>
                  {`@keyframes liteHeroGlowBreath {
                      0%, 100% { transform: translate3d(-50%, 6px, 0) scale(0.98); opacity: 0.45; }
                      50% { transform: translate3d(-50%, -8px, 0) scale(1.1); opacity: 0.95; }
                    }
                    @keyframes liteHeroGlowCore {
                      0%, 100% { transform: translate3d(-50%, 0, 0) scale(0.95); opacity: 0.55; }
                      50% { transform: translate3d(-50%, -3px, 0) scale(1.06); opacity: 1; }
                    }
                    .lite-hero-glow-plume {
                      animation: liteHeroGlowBreath 5.4s ease-in-out infinite;
                    }
                    .lite-hero-glow-core {
                      animation: liteHeroGlowCore 3.6s ease-in-out infinite;
                    }`}
                </style>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics strip — proof signals */}
        <section className="mt-10 lg:mt-12 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{
                    background: "rgba(12,16,24,0.85)",
                    border: `1px solid ${T.cardBorder}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}30` }}
                  >
                    <Icon size={18} style={{ color: m.accent }} />
                  </div>
                  <div>
                    <div
                      className="text-[28px] lg:text-[32px] leading-none font-['Bebas_Neue',sans-serif] tracking-[1px]"
                      style={{ color: m.accent }}
                    >
                      {m.value}
                    </div>
                    <div
                      className="mt-1 text-[13px]"
                      style={{ fontFamily: "'Cambay', sans-serif", color: T.inkMuted }}
                    >
                      {m.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Case studies (primary) */}
        <section id="case-studies" className="mt-10 lg:mt-14 text-left">
          <div className="mb-10 text-left">
            <div
              className="text-[11px] tracking-[5px] mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: ACCENT_GREEN }}
            >
              01 — CASE STUDIES
            </div>
            <h2
              className="text-[28px] lg:text-[36px] tracking-[0.5px] mb-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: T.ink }}
            >
              Skim first. Dive when you care.
            </h2>
            <p
              className="text-[15px] max-w-[640px]"
              style={{ fontFamily: "'Cambay', sans-serif", color: T.inkMuted, lineHeight: 1.6 }}
            >
              Each card links to the full narrative page + a live build.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {CASE_STUDIES.map((cs, i) => (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="lite-hover-card rounded-2xl p-5 flex flex-col"
                style={{
                  background: `linear-gradient(165deg, ${T.card} 0%, rgba(8,12,20,0.96) 100%)`,
                  border: `1px solid ${T.cardBorder}`,
                  ["--card-glow" as string]: cs.accent,
                  ["--card-glow-edge" as string]: `${cs.accent}33`,
                  ["--card-glow-soft" as string]: `${cs.accent}2E`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(15,23,42,0.85)", border: `1px solid ${T.cardBorder}` }}
                  >
                    {cs.id === "cpq" && <Cpu size={16} style={{ color: cs.accent }} />}
                    {cs.id === "plotsync" && <Map size={16} style={{ color: cs.accent }} />}
                    {cs.id === "exiro" && <Bot size={16} style={{ color: cs.accent }} />}
                  </div>
                  <Pill label={cs.domain} accent={cs.accent} />
                  <div
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ background: cs.accent, boxShadow: `0 0 10px ${cs.accent}55` }}
                  />
                </div>

                <h3
                  className="mt-4 text-[22px] leading-[1.05]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 0.5 }}
                >
                  {cs.title}
                </h3>

                <ul className="mt-3 flex-1 flex flex-col gap-2">
                  {cs.bullets.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2"
                      style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, lineHeight: "20px", color: T.inkMuted }}
                    >
                      <span className="mt-[8px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `${cs.accent}AA` }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-col gap-2 text-left">
                  <button
                    onClick={() => navigate(cs.caseStudyPath)}
                    className="w-full inline-flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:brightness-110 leading-none [&>span]:relative [&>span]:top-[2px]"
                    style={{
                      background: cs.accent,
                      color: cs.accent === ACCENT_GREEN ? DARK_GREEN_TEXT : "#fff",
                    }}
                  >
                    <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, lineHeight: 1 }}>
                      Read case study
                    </span>
                    <ArrowRight size={14} className="shrink-0" />
                  </button>
                  {cs.prototypeUrl ? (
                    <a
                      href={cs.prototypeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = T.surfaceHover;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <ExternalLink size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                      <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 13, lineHeight: 1 }}>Open prototype</span>
                      <ArrowRight size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Prototypes (secondary) */}
        <section id="prototypes" className="mt-12 lg:mt-16 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 text-left">
            <div className="min-w-0">
              <div
                className="text-[11px] tracking-[5px] mb-3"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: ACCENT_GREEN }}
              >
                02 — LIVE PROTOTYPES
              </div>
              <h2
                className="text-[24px] lg:text-[36px] tracking-[0.5px] mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: T.ink }}
              >
                Open in seconds.
              </h2>
              <p
                className="text-[15px] max-w-[520px]"
                style={{ fontFamily: "'Cambay', sans-serif", color: T.inkMuted, lineHeight: 1.6 }}
              >
                Interactive builds shipped to validate design decisions before production.
              </p>
            </div>
            <button
              onClick={() => navigate("/prototypes")}
              className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: 1 }}>View details</span>
              <ArrowRight size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROTOTYPES.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.liveUrl}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                target="_blank"
                rel="noopener noreferrer"
                className="lite-hover-card rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-colors"
                style={{
                  background: T.card,
                  border: `1px solid ${T.cardBorder}`,
                  ["--card-glow" as string]: p.accent,
                  ["--card-glow-edge" as string]: `${p.accent}33`,
                  ["--card-glow-soft" as string]: `${p.accent}2E`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.055)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = T.card;
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(15,23,42,0.85)", border: `1px solid ${T.cardBorder}` }}
                  >
                    {p.domain === "ENTERPRISE PRICING" && <Cpu size={16} style={{ color: p.accent }} />}
                    {p.domain === "REAL ESTATE AI" && <Map size={16} style={{ color: p.accent }} />}
                    {p.domain === "AI OPERATIONS" && <Bot size={16} style={{ color: p.accent }} />}
                    {p.domain === "SPATIAL TOOL" && <LayoutGrid size={16} style={{ color: p.accent }} />}
                    {p.domain === "GAME DESIGN" && <Activity size={16} style={{ color: p.accent }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 10,
                          letterSpacing: 3,
                          color: p.accent,
                          opacity: 0.95,
                        }}
                      >
                        {p.domain}
                      </span>
                      <span
                        className="px-2 py-[2px] rounded-[6px]"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: T.inkFaint,
                          border: `1px solid ${T.cardBorder}`,
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div
                      className="truncate"
                      style={{ fontFamily: "'Cambay', sans-serif", fontSize: 14, color: T.inkSoft }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="truncate mt-1"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                        color: T.inkFaint,
                      }}
                    >
                      {p.liveUrl.replace(/^https?:\/\//, "")}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div
                    className="w-[8px] h-[8px] rounded-full"
                    style={{ background: p.accent, boxShadow: `0 0 12px ${p.accent}55` }}
                  />
                  <ExternalLink size={15} style={{ color: "rgba(255,255,255,0.55)" }} />
                  <ArrowRight size={15} style={{ color: "rgba(255,255,255,0.55)" }} />
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Credibility strip */}
        <section className="mt-12 lg:mt-16 text-left">
          <div
            className="rounded-2xl p-6 flex flex-col lg:flex-row items-start justify-between gap-4"
            style={{
              background: "linear-gradient(165deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              border: `1px solid ${T.cardBorder}`,
            }}
          >
            <div className="max-w-[720px]">
              <div
                className="text-[10px] tracking-[4px] mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif", color: T.inkFaint }}
              >
                QUICK PROOF
              </div>
              <div
                className="text-[14px] leading-[1.7]"
                style={{ fontFamily: "'Cambay', sans-serif", color: T.inkMuted }}
              >
                Systems thinking + high-fidelity prototyping. Comfortable with ambiguity, constraints, and building the artifacts that make decisions obvious.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <SecondaryLinkButton href="mailto:imgaurav2693@gmail.com">
                <Mail size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
                <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: 1 }}>Email</span>
              </SecondaryLinkButton>
              <button
                onClick={() => navigate("/how-i-build")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-colors leading-none [&>span]:relative [&>span]:top-[2px]"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.inkSoft }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHover;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                }}
              >
                <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 12, lineHeight: 1 }}>How I build</span>
                <ArrowRight size={14} className="shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} />
              </button>
            </div>
          </div>
        </section>

        {/* Keyboard hint */}
        <div
          className="mt-10 pt-6 flex items-center justify-center gap-4 flex-wrap"
          style={{ borderTop: `1px solid ${T.cardBorder}` }}
        >
          <span className="flex items-center gap-1.5">
            <kbd
              className="px-2 py-0.5 rounded text-[10px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: T.inkFaint,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ↓
            </kbd>
            <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: T.inkFaint }}>
              Scroll to explore
            </span>
          </span>
          <span style={{ color: T.cardBorder }}>|</span>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <kbd
              className="px-2 py-0.5 rounded text-[10px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: T.inkFaint,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Esc
            </kbd>
            <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: T.inkFaint }}>
              Full portfolio
            </span>
          </button>
        </div>
        <style>
          {`
            @keyframes kineticIn {
              0% {
                opacity: 0;
                transform: translateY(14px) scale(0.98);
                filter: blur(7px);
              }
              70% {
                opacity: 1;
                transform: translateY(-1px) scale(1);
                filter: blur(0);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
              }
            }
            @keyframes kineticFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-1px); }
            }
            .kinetic-word {
              display: inline-block;
              opacity: 0;
              animation: kineticIn 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
              animation-delay: var(--d);
              will-change: transform, opacity, filter;
            }
            .kinetic-accent {
              text-shadow: 0 0 14px rgba(46,251,116,0.16);
            }
            .kinetic-word:hover {
              animation: kineticFloat 820ms ease-in-out infinite;
            }
            .lite-hover-card {
              transition: transform 260ms ease, box-shadow 260ms ease, background 260ms ease;
              will-change: transform, box-shadow;
            }
            .lite-hover-card:hover {
              transform: translateY(-3px);
              box-shadow:
                0 0 0 1px var(--card-glow-edge),
                0 0 26px var(--card-glow-soft),
                0 14px 34px rgba(0,0,0,0.42);
            }
          `}
        </style>
      </div>
    </div>
  );
}

