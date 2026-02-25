import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import svgCompact from '@/imports/svg-kib3ma6icy';
import { Radar, Code2, ShieldCheck, Bike, BookOpen, Eye, Route } from 'lucide-react';
import { downloadResumePdf } from './resume-download';

/* ═══════════════════════════════════════════════════════════════════════
   ACCORDION OVERLAY — v2 (Full Welcome + Accordion)
   ─────────────────────────────────────────────────
   Two modes:
   1. FULL  — the landing welcome panel (wider, taller) with full
      identity card, 3 case studies, CTAs. Shown on first load.
   2. ACCORDION — 5 vertically stacked sections that fold/unfold.

   Behavior (Accordion mode):
   - When NOT hovering the overlay -> all ultra-compact
   - When hovering -> activeSection shows compact, rest ultra-compact
   - Click a section -> it becomes the activeSection
   - Studio room defaults Introduction / Garage defaults My Personal
   ═══════════════════════════════════════════════════════════════════════ */

const EMAIL = 'imgaurav2693@gmail.com';

const STUDIO_NARRATIVE = '\u201CWhere pricing errors cost deals, AI decisions need trust, and operators work under pressure. This is where the thinking happens.\u201D';

const FULL_BIO = 'I design enterprise platforms where pricing errors cost deals, AI decisions need human trust, and operators work under pressure. Previously at Infinite Computer Solutions.';

const CASE_STUDIES = [
  {
    id: 'pqe',
    title: 'Price Quotation Engine',
    domain: 'ENTERPRISE CPQ',
    domainColor: '#00A87C',
    accentDark: '#00A87C',
    duration: '6 months',
    metrics: [
      { label: 'Pricing errors reduced', value: '81%' },
      { label: 'Quote completion time', value: '42%' },
    ],
    available: true,
  },
  {
    id: 'plotsync',
    title: 'PlotSync Platform',
    domain: 'REAL ESTATE',
    domainColor: '#FF6B35',
    accentDark: '#FF6B35',
    duration: '4 months',
    metrics: [
      { label: 'Decision time reduced', value: '45%' },
    ],
    available: true,
  },
  {
    id: 'exiro',
    title: 'Exiro AI Platform',
    domain: 'AI AUTOMATION',
    domainColor: '#7C3AED',
    accentDark: '#7C3AED',
    duration: '4 months',
    metrics: [
      { label: 'Operator intervention', value: '40%' },
      { label: 'Manual handling time', value: '35%' },
    ],
    available: true,
    reportStyle: true as const,
    reportNumber: 'EXR-2025-001',
    classification: 'CONFIDENTIAL',
    status: 'AUDIT COMPLETE',
    findings: [
      { id: '01', label: 'Operator intervention reduced', value: '↓ 40%' },
      { id: '02', label: 'Manual handling time reduced', value: '↓ 35%' },
    ],
  },
];

type SectionId = 'introduction' | 'how-i-work' | 'my-personal' | 'prototyping' | 'personal-projects';

interface AccordionOverlayProps {
  currentRoom: 'studio' | 'garage' | 'room3' | 'room4';
  onOpenStudy: (studyId: string) => void;
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
  visible: boolean;
  /** When true, overlay stays mounted but fades to 0 opacity (assembly phase) */
  dimmed?: boolean;
  visitedRooms: Set<string>;
  onOpenNarrative?: (id: 'my-personal' | 'prototyping') => void;
}

/* ── Shared SVG Icons ─────────────────────────────────────────────── */

function ExpandIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <g clipPath="url(#clip_expand_acc)">
        <path d="M6.875 1.375H9.625V4.125" stroke="white" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
        <path d="M4.125 9.625H1.375V6.875" stroke="white" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
        <path d="M9.625 1.375L6.41667 4.58333" stroke="white" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
        <path d="M1.375 9.625L4.58333 6.41667" stroke="white" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916667" />
      </g>
      <defs>
        <clipPath id="clip_expand_acc">
          <rect fill="white" height="11" width="11" />
        </clipPath>
      </defs>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <g clipPath="url(#clip_email_acc)">
        <path d={svgCompact.p2218e600} stroke="white" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.913846" />
        <path d={svgCompact.p34047700} stroke="white" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.913846" />
      </g>
      <defs>
        <clipPath id="clip_email_acc">
          <rect fill="white" height="11" width="11" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <g clipPath="url(#clip_resume_acc)">
        <path d={svgCompact.pb949880} stroke="white" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.913846" />
        <path d={svgCompact.p321ab280} stroke="white" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.913846" />
        <path d="M5.5 6.875V1.375" stroke="white" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.913846" />
      </g>
      <defs>
        <clipPath id="clip_resume_acc">
          <rect fill="white" height="11" width="11" />
        </clipPath>
      </defs>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d={svgCompact.p15126280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
      <path d="M3 4.5H1V10.5H3V4.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
      <path d={svgCompact.p22b49200} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <g clipPath="url(#clip_ig_acc)">
        <path d={svgCompact.p6a70d00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
        <path d={svgCompact.p4280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
        <path d="M8.74997 3.25H8.75587" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
      </g>
      <defs>
        <clipPath id="clip_ig_acc">
          <rect fill="white" height="12" width="12" />
        </clipPath>
      </defs>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d={svgCompact.pa85bf0} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
    </svg>
  );
}

function CheckmarkIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2V8M5 8L2.5 5.5M5 8L7.5 5.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function ArrowRightSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6H9.5" stroke="white" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 2.5L9.5 6L6 9.5" stroke="white" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── CTA Bar (shared between compact and ultra-compact intro) ──────── */

function CTABar({ emailCopied, onCopyEmail, playClick }: {
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] w-full">
      <button
        onClick={onCopyEmail}
        className="flex items-center gap-[5px] px-[11px] h-[28.5px] rounded-[7px] cursor-pointer transition-colors relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.35)] inset-0 pointer-events-none rounded-[7px]" />
        <EmailIcon />
        <span className="font-['Cambay',sans-serif] text-[12px] text-white/65 text-center">
          {emailCopied ? 'Copied!' : 'Email'}
        </span>
      </button>
      <button
        onClick={() => { playClick(); downloadResumePdf(); }}
        className="flex items-center gap-[5px] px-[11px] h-[28.5px] rounded-[7px] cursor-pointer transition-colors relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: 'none' }}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.35)] inset-0 pointer-events-none rounded-[7px]" />
        <ResumeIcon />
        <span className="font-['Cambay',sans-serif] text-[12px] text-white/65">Resume</span>
      </button>
      <div className="flex-1" />
      <a href="https://www.linkedin.com/in/imgaurav2693/" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[28px] rounded-[6px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[6px]" />
        <LinkedInIcon />
      </a>
      <a href="https://www.instagram.com/dark_wizard2693/" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[28px] rounded-[6px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[6px]" />
        <InstagramIcon />
      </a>
      <a href="https://wa.me/918384089382" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[28px] rounded-[6px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[6px]" />
        <WhatsAppIcon />
      </a>
    </div>
  );
}

/* ── Full-Size CTA Bar (larger for full view) ────────────────────── */

function CTABarFull({ emailCopied, onCopyEmail, playClick }: {
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
}) {
  return (
    <div className="flex items-center gap-[8px] w-full">
      <button
        onClick={onCopyEmail}
        className="flex items-center gap-[6px] px-[13px] h-[34px] rounded-[8px] cursor-pointer transition-colors relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] inset-0 pointer-events-none rounded-[8px]" />
        <EmailIcon />
        <span className="font-['Cambay',sans-serif] text-[13px] text-white text-center">
          {emailCopied ? 'Copied!' : 'Email'}
        </span>
      </button>
      <button
        onClick={() => { playClick(); downloadResumePdf(); }}
        className="flex items-center gap-[6px] px-[13px] h-[34px] rounded-[8px] cursor-pointer transition-colors relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', border: 'none' }}
      >
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] inset-0 pointer-events-none rounded-[8px]" />
        <ResumeIcon />
        <span className="font-['Cambay',sans-serif] text-[13px] text-white">Resume</span>
      </button>
    </div>
  );
}

/* ── Social Links Row ──────────────────────────────────────────── */

function SocialLinksRow() {
  return (
    <div className="flex items-center gap-[6px]">
      <a href="https://www.linkedin.com/in/imgaurav2693/" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[32px] rounded-[7px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[7px]" />
        <LinkedInIcon />
      </a>
      <a href="https://www.instagram.com/dark_wizard2693/" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[32px] rounded-[7px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[7px]" />
        <InstagramIcon />
      </a>
      <a href="https://wa.me/918384089382" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center size-[32px] rounded-[7px] relative shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.04)] inset-0 pointer-events-none rounded-[7px]" />
        <WhatsAppIcon />
      </a>
    </div>
  );
}

/* ── Expand Button ──────────────────────────────────────────────── */

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center cursor-pointer transition-colors shrink-0"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      title="Expand section"
    >
      <ExpandIcon />
    </button>
  );
}

/* ── Green Dot Badge ───────────────────────────────────────────── */

function OpenToWorkBadge({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const isLg = size === 'lg';
  return (
    <div className="flex items-center gap-[6px]">
      <div className="relative" style={{ width: isLg ? 8 : 7, height: isLg ? 8 : 7 }}>
        <div className="absolute inset-0 bg-[#27c840] rounded-full" />
        <div className="absolute bg-[#27c840] rounded-full"
          style={{
            width: isLg ? 14 : 12,
            height: isLg ? 14 : 12,
            left: isLg ? -3 : -2.5,
            top: isLg ? -3 : -2.5,
            opacity: 0.18,
          }} />
      </div>
      <span
        className="font-['Bebas_Neue',sans-serif] tracking-[2.5px] text-white/50 uppercase"
        style={{ fontSize: isLg ? 12 : 9, letterSpacing: isLg ? '3px' : '2.5px' }}
      >
        Open to work
      </span>
    </div>
  );
}

/* ── Divider ───────────────────────────────────────────────────── */

function Divider() {
  return (
    <div className="h-px w-full"
      style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }} />
  );
}

/* ── Hover-aware Compact Case Study Row ──────────────────────────── */

function CaseStudyRowCompact({ study, onOpen, playClick }: {
  study: typeof CASE_STUDIES[0];
  onOpen: () => void;
  playClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => { playClick(); onOpen(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-[8px] px-[11px] h-[56px] rounded-[8px] text-left cursor-pointer relative group"
      style={{
        background: hovered ? `${study.accentDark}0C` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? `${study.accentDark}20` : 'rgba(255,255,255,0.04)'}`,
        transform: hovered ? 'translateX(2px)' : 'translateX(0)',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        className="rounded-full shrink-0"
        style={{
          width: 3,
          height: hovered ? 22 : 16,
          background: study.accentDark,
          opacity: hovered ? 0.8 : 0.5,
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="font-['Bebas_Neue',sans-serif] text-[8px] tracking-[2px] uppercase mt-[8px]"
          style={{
            color: study.domainColor,
            opacity: hovered ? 1 : 0.85,
            transition: 'opacity 0.2s ease',
          }}
        >
          {study.domain}
        </p>
        <div className="flex items-center gap-[5px]">
          <p
            className="font-['Cambay',sans-serif] text-[13px] leading-[19px] truncate"
            style={{
              color: hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)',
              transition: 'color 0.2s ease',
            }}
          >
            {study.title}
          </p>
          {study.id === 'exiro' && (
            <span
              className="font-['JetBrains_Mono',monospace] text-[7px] tracking-[1px] px-[4px] py-px rounded-[2px] shrink-0"
              style={{ color: '#7C3AEDcc', background: '#7C3AED14', border: '1px solid #7C3AED25' }}
            >
              REPORT
            </span>
          )}
        </div>
      </div>
      <span
        className="text-[10px] font-medium shrink-0"
        style={{
          color: hovered ? study.domainColor : 'rgba(255,255,255,0.2)',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        &rarr;
      </span>
    </button>
  );
}

/* ── Hover-aware Case Study Card (Full Welcome) ──────────────────── */

function CaseStudyCardFull({ study, onOpen, playClick }: {
  study: typeof CASE_STUDIES[0];
  onOpen: () => void;
  playClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => {
        if (study.available) { playClick(); onOpen(); }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-left rounded-[12px] overflow-hidden cursor-pointer group"
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${study.accentDark}0A 0%, rgba(11,105,26,0.05) 100%)`
          : 'rgba(11,105,26,0.05)',
        border: `1px solid ${hovered ? `${study.accentDark}30` : 'rgba(255,255,255,0.04)'}`,
        opacity: study.available ? 1 : 0.7,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 4px 20px ${study.accentDark}12, 0 0 0 1px ${study.accentDark}08`
          : 'none',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      disabled={!study.available}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-[12px] rounded-r-full"
        style={{
          width: hovered ? 4 : 3,
          height: 'calc(100% - 24px)',
          background: study.accentDark,
          opacity: hovered ? 0.7 : 0.4,
          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      <div className="px-[18px] pt-[16px] pb-[14px]">
        {/* Domain + Duration row */}
        <div className="flex items-center justify-between mb-[6px]">
          <span
            className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2.5px] uppercase"
            style={{
              color: study.domainColor,
              opacity: hovered ? 1 : 0.85,
              transition: 'opacity 0.2s ease',
            }}
          >
            {study.domain}
          </span>
          <span className="font-['Cambay',sans-serif] text-[12px] text-white/60">
            {study.duration}
          </span>
        </div>

        {/* Title */}
        <p
          className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.2px] mb-[8px]"
          style={{
            color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)',
            transition: 'color 0.2s ease',
          }}
        >
          {study.title}
        </p>

        {/* Metrics */}
        <div className="flex items-center gap-[16px] mb-[8px]">
          {study.metrics.map((m, i) => (
            <div key={i} className="flex items-center gap-[6px]">
              <CheckmarkIcon color={study.domainColor} />
              <span className="font-['Cambay',sans-serif] text-[13px] text-white/50">
                {m.label}{' '}
                <span className="text-white/80" style={{ fontWeight: 700 }}>{m.value}</span>
              </span>
            </div>
          ))}
        </div>

        {/* View Full Study / In progress */}
        <div className="flex items-center gap-[4px]">
          {study.available ? (
            <>
              <span
                className="font-['Cambay',sans-serif] text-[13px]"
                style={{
                  color: hovered ? study.domainColor : 'rgba(255,255,255,1)',
                  transition: 'color 0.2s ease',
                }}
              >
                View Full Study
              </span>
              <div style={{
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                opacity: hovered ? 0.6 : 0.35,
              }}>
                <ArrowRightSmall />
              </div>
            </>
          ) : (
            <span className="font-['Cambay',sans-serif] italic text-[13px] text-white/50">
              In progress
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FULL WELCOME VIEW — The landing panel
   ═══════════════════════════════════════════════════════════════════ */

/* ── Exiro Audit Report Card ─────────────────────────────────────── */
function ExiroReportCard({ study, onOpen, playClick }: {
  study: typeof CASE_STUDIES[2];
  onOpen: () => void;
  playClick: () => void;
}) {
  const PURPLE = '#7C3AED';
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => { playClick(); onOpen(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-left rounded-[12px] overflow-hidden cursor-pointer group"
      style={{
        background: hovered ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.03)',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.10)'}`,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? '0 4px 24px rgba(124,58,237,0.10), 0 0 0 1px rgba(124,58,237,0.06)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Diagonal classified stripes — top-right corner */}
      <div
        className="absolute top-0 right-0 w-[60px] h-[60px] pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${PURPLE}, ${PURPLE} 1px, transparent 1px, transparent 5px)`,
        }}
      />

      {/* Left accent — double bar for report */}
      <div className="absolute left-0 top-[12px] flex flex-col gap-[3px]" style={{ height: 'calc(100% - 24px)' }}>
        <div className="w-[2px] flex-1 rounded-r-full" style={{ background: PURPLE, opacity: hovered ? 0.75 : 0.5, transition: 'opacity 0.2s ease' }} />
        <div className="w-[2px] flex-1 rounded-r-full" style={{ background: PURPLE, opacity: hovered ? 0.45 : 0.25, transition: 'opacity 0.2s ease' }} />
      </div>

      <div className="px-[18px] pt-[14px] pb-[14px]">
        {/* Top row: report number + classification stamp */}
        <div className="flex items-center justify-between mb-[8px]">
          <span
            className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[1.5px]"
            style={{ color: `${PURPLE}90` }}
          >
            REPORT // {study.reportNumber}
          </span>
          {/* Audit Complete stamp */}
          <span
            className="font-['Bebas_Neue',sans-serif] text-[8px] tracking-[2px] px-[7px] py-[2px] rounded-[3px]"
            style={{
              color: `${PURPLE}cc`,
              border: `1px solid ${PURPLE}30`,
              background: `${PURPLE}08`,
            }}
          >
            {study.status}
          </span>
        </div>

        {/* Classification line */}
        <div className="flex items-center gap-[8px] mb-[4px]">
          <span
            className="font-['Bebas_Neue',sans-serif] text-[9px] tracking-[2px] uppercase"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            CLASSIFICATION
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span
            className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[2.5px] uppercase"
            style={{ color: PURPLE }}
          >
            {study.domain}
          </span>
        </div>

        {/* Title + Report badge */}
        <div className="flex items-center gap-[8px] mb-[2px]">
          <p
            className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.2px] text-white"
          >
            {study.title}
          </p>
          <span
            className="font-['JetBrains_Mono',monospace] text-[8px] tracking-[1.5px] px-[6px] py-[1px] rounded-[3px] shrink-0 translate-y-px"
            style={{
              color: `${PURPLE}dd`,
              background: `${PURPLE}14`,
              border: `1px solid ${PURPLE}25`,
            }}
          >
            REPORT
          </span>
        </div>

        {/* Duration as document metadata */}
        <span
          className="font-['JetBrains_Mono',monospace] text-[9px] text-white/45 mb-[10px] block"
        >
          Duration: {study.duration} &middot; {study.classification}
        </span>

        {/* Findings — numbered report entries */}
        <div
          className="rounded-[6px] px-[10px] py-[8px] mb-[10px]"
          style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px dashed rgba(124,58,237,0.10)',
          }}
        >
          <span
            className="font-['Bebas_Neue',sans-serif] text-[8px] tracking-[2px] block mb-[5px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            KEY FINDINGS
          </span>
          {study.findings.map((f) => (
            <div key={f.id} className="flex items-center gap-[8px] py-[2px]">
              <span
                className="font-['JetBrains_Mono',monospace] text-[9px] shrink-0"
                style={{ color: `${PURPLE}80` }}
              >
                §{f.id}
              </span>
              <span className="font-['Cambay',sans-serif] text-[12px] text-white/65 flex-1">
                {f.label}
              </span>
              <span
                className="font-['JetBrains_Mono',monospace] text-[12px] shrink-0"
                style={{ color: `${PURPLE}cc`, fontWeight: 700 }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* CTA: Open Full Report */}
        <div className="flex items-center gap-[4px]">
          <span className="font-['Cambay',sans-serif] text-[13px]"
            style={{ color: hovered ? PURPLE : 'rgba(255,255,255,1)', transition: 'color 0.2s ease' }}>
            Open Full Report
          </span>
          <div style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)', opacity: hovered ? 0.6 : 0.35 }}>
            <ArrowRightSmall />
          </div>
        </div>
      </div>
    </button>
  );
}

function FullWelcomeView({
  onExplore,
  onOpenStudy,
  emailCopied,
  onCopyEmail,
  playClick,
}: {
  onExplore: () => void;
  onOpenStudy: (id: string) => void;
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col px-[26px] pt-[20px] pb-[20px] overflow-y-auto scrollbar-minimal">
        {/* Open to work badge */}
        <div className="mb-[8px]">
          <OpenToWorkBadge size="lg" />
        </div>

        {/* Name */}
        <h2 className="font-['Bebas_Neue',sans-serif] text-[48px] leading-[37px] tracking-[0.5px] text-white mb-[6px]">
          Gaurav Mishra
        </h2>

        {/* Title */}
        <p className="font-['Cambay',sans-serif] text-[15px] leading-[22.5px] tracking-[0.5px] text-[#27c840] mb-[10px]">
          Product Designer
        </p>

        {/* Bio */}
        <p className="font-['Cambay',sans-serif] text-[14px] leading-[22px] text-white/80 mb-[18px]">
          {FULL_BIO}
        </p>

        {/* Case Studies Header */}
        <p className="font-['Bebas_Neue',sans-serif] text-[20px] leading-[16.5px] tracking-[3px] text-white uppercase mb-[14px]">
          Case Studies
        </p>

        {/* Case Study Cards — with single glow sweep on mount */}
        <div className="relative flex flex-col gap-[10px] mb-[18px]">
          {/* Glow strip sweep */}
          <div
            className="pointer-events-none absolute left-0 right-0 z-10"
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent 0%, #40F0AA88 30%, #40F0AACC 50%, #40F0AA88 70%, transparent 100%)',
              boxShadow: '0 0 20px 6px #40F0AA44, 0 0 60px 12px #40F0AA22',
              animation: 'caseStudyGlowSweep 1.8s cubic-bezier(0.25,0.46,0.45,0.94) 2.6s both',
            }}
          />
          {CASE_STUDIES.filter(s => s.available).map((study) => {
            /* ── Exiro gets the report-style card ── */
            if (study.id === 'exiro' && 'reportStyle' in study) {
              return (
                <ExiroReportCard
                  key={study.id}
                  study={study as typeof CASE_STUDIES[2]}
                  onOpen={() => onOpenStudy(study.id)}
                  playClick={playClick}
                />
              );
            }
            /* ── Generic case study card ── */
            return (
              <CaseStudyCardFull
                key={study.id}
                study={study}
                onOpen={() => onOpenStudy(study.id)}
                playClick={playClick}
              />
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="mb-[14px]">
          <CTABarFull emailCopied={emailCopied} onCopyEmail={onCopyEmail} playClick={playClick} />
        </div>

        {/* Social Links */}
        <SocialLinksRow />
      </div>

      {/* Explore Button — sticky at bottom */}
      <div className="px-[26px] pb-[20px] pt-[8px] shrink-0">
        <Divider />
        <button
          onClick={() => { playClick(); onExplore(); }}
          className="w-full mt-[12px] flex items-center justify-center gap-[8px] py-[11px] rounded-[10px] cursor-pointer transition-all duration-300 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #00A87C 0%, #009167 100%)',
          }}
        >
          <span className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px] text-white uppercase">
            Explore Command Center
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            <path d="M7 3L11 7L7 11" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTRODUCTION SECTION - Compact View (~413px)
   ══════���════════════════════════════════════════════════════════════ */

function IntroductionCompact({
  onExpand, onOpenStudy, emailCopied, onCopyEmail, playClick,
}: {
  onExpand: () => void;
  onOpenStudy: (id: string) => void;
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
}) {
  return (
    <div className="flex flex-col px-[20px] pt-[18px] pb-[16px] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between mb-0">
        <div className="h-[15px]" />
        <ExpandButton onClick={onExpand} />
      </div>

      {/* Open to work badge */}
      <div className="mb-[4px]">
        <OpenToWorkBadge />
      </div>

      {/* Name */}
      <h2 className="font-['Bebas_Neue',sans-serif] text-[36px] leading-[28px] tracking-[0.5px] text-white mb-[4px]">
        Gaurav Mishra
      </h2>

      {/* Title */}
      <p className="font-['Cambay',sans-serif] text-[13px] leading-[19.5px] tracking-[0.3px] text-[#27c840] mb-[12px]">
        Product Designer
      </p>

      <Divider />

      {/* Narrative quote */}
      <p className="font-['Cambay',sans-serif] italic text-[13px] leading-[20px] text-white/65 mt-[10px] mb-[10px]">
        {STUDIO_NARRATIVE}
      </p>

      {/* Case study buttons */}
      <div className="relative flex flex-col gap-[6px] mb-[12px]">
        {/* Glow strip sweep */}
        <div
          className="pointer-events-none absolute left-0 right-0 z-10"
          style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #40F0AA88 30%, #40F0AACC 50%, #40F0AA88 70%, transparent 100%)',
            boxShadow: '0 0 20px 6px #40F0AA44, 0 0 60px 12px #40F0AA22',
            animation: 'caseStudyGlowSweep 1.8s cubic-bezier(0.25,0.46,0.45,0.94) 2.6s both',
          }}
        />
        {CASE_STUDIES.filter(s => s.available).map((study) => (
          <CaseStudyRowCompact
            key={study.id}
            study={study}
            onOpen={() => onOpenStudy(study.id)}
            playClick={playClick}
          />
        ))}
      </div>

      <Divider />

      {/* CTA Bar */}
      <div className="mt-[12px]">
        <CTABar emailCopied={emailCopied} onCopyEmail={onCopyEmail} playClick={playClick} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTRODUCTION SECTION - Ultra-Compact View (~120px)
   ═══════════════════════════════════════════════════════════════════ */

function IntroductionUltraCompact({
  onExpand, emailCopied, onCopyEmail, playClick,
}: {
  onExpand: () => void;
  emailCopied: boolean;
  onCopyEmail: () => void;
  playClick: () => void;
}) {
  return (
    <div className="overflow-hidden">
      {/* Top section: badge + expand + name */}
      <div className="px-[20px] pt-[18px]">
        <div className="flex items-center justify-between mb-[4px]">
          <OpenToWorkBadge />
          <ExpandButton onClick={onExpand} />
        </div>
        <h2 className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
          Gaurav Mishra
        </h2>
      </div>

      {/* CTA bar */}
      <div className="px-[20px] pt-[10px] pb-[14px]">
        <CTABar emailCopied={emailCopied} onCopyEmail={onCopyEmail} playClick={playClick} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GENERIC SECTION - Ultra-Compact Title Bar (64px)
   ═══════════════════════════════════════════════════════════════════ */

function SectionTitleBar({ title, onExpand }: { title: string; onExpand: () => void }) {
  return (
    <div className="h-[64px] overflow-hidden flex items-center justify-between px-[20px]">
      <p className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
        {title}
      </p>
      <ExpandButton onClick={onExpand} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOW I WORK — Compact View
   ═══════════════════════════════════════════════════════════════════ */

function HowIWorkCompact({ onExpand }: { onExpand: () => void }) {
  const phases = [
    {
      id: '01',
      icon: Radar,
      title: 'Map the System',
      color: '#40F0AA',
      desc: 'Constraints first. Business rules, operator workflows, pressure points \u2014 the system reveals the design.',
    },
    {
      id: '02',
      icon: Code2,
      title: 'Build at Fidelity',
      color: '#E8501A',
      desc: 'The problem chooses the tool. Sketch, Figma, or code \u2014 whatever reaches truth fastest.',
    },
    {
      id: '03',
      icon: ShieldCheck,
      title: 'Prove Under Pressure',
      color: '#7C3AED',
      desc: 'Real operators, real data, real stakes. If it survives the floor, it ships.',
    },
  ];

  const signals = [
    { label: 'Systems over screens', color: '#40F0AA' },
    { label: 'Pressure reveals flaws', color: '#E8501A' },
    { label: 'Ship proof, not decks', color: '#7C3AED' },
  ];

  return (
    <div className="flex flex-col px-[20px] pt-[18px] pb-[16px] overflow-hidden">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
          How I Work
        </p>
        <ExpandButton onClick={onExpand} />
      </div>
      <Divider />

      {/* Philosophy */}
      <p className="font-['Cambay',sans-serif] italic text-[13px] leading-[20px] text-white/50 mt-[10px] mb-[12px]">
        I don't follow a process. I follow the problem.
      </p>

      {/* Signal flow phases */}
      <div className="relative flex flex-col gap-0 mb-[12px]">
        {/* Vertical connection line */}
        <div
          className="absolute left-[15px] top-[34px] bottom-[34px] w-px"
          style={{
            background: 'linear-gradient(to bottom, #40F0AA33, #E8501A33, #7C3AED33)',
          }}
        />

        {phases.map((phase, i) => {
          const Icon = phase.icon;
          return (
            <div key={phase.id} className="relative flex gap-[12px] py-[8px]">
              {/* Node */}
              <div
                className="relative z-10 flex items-center justify-center shrink-0"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `${phase.color}0C`,
                  border: `1px solid ${phase.color}20`,
                }}
              >
                <Icon size={14} color={phase.color} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-[1px]">
                <div className="flex items-center gap-[6px] mb-[2px]">
                  <span
                    className="font-['JetBrains_Mono',monospace] text-[8px] tracking-[1.5px] shrink-0"
                    style={{ color: `${phase.color}80` }}
                  >
                    {phase.id}
                  </span>
                  <span
                    className="font-['Cambay',sans-serif] text-[13px] text-white/80"
                  >
                    {phase.title}
                  </span>
                </div>
                <p className="font-['Cambay',sans-serif] text-[12px] leading-[18px] text-white/40">
                  {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Divider />

      {/* Operating signals */}
      <div className="mt-[8px]">
        <p
          className="font-['JetBrains_Mono',monospace] text-[8px] tracking-[2px] text-white/25 uppercase mb-[6px]"
        >
          operating signals
        </p>
        <div className="flex flex-wrap gap-[5px]">
          {signals.map((s) => (
            <span
              key={s.label}
              className="font-['Cambay',sans-serif] text-[11px] px-[8px] py-[3px] rounded-[4px]"
              style={{
                color: `${s.color}AA`,
                background: `${s.color}0A`,
                border: `1px solid ${s.color}18`,
              }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MY PERSONAL — Compact View
   ═══════════════════════════════════════════════════════════════════ */

function MyPersonalCompact({ onExpand }: { onExpand: () => void }) {
  const fragments = [
    { color: '#E8501A', icon: Bike, text: 'Ladakh, Changthang Valley. Long rides, empty highways.' },
    { color: '#40F0AA', icon: Eye, text: 'Military campuses. Cities, people, patterns.' },
    { color: '#7C3AED', icon: BookOpen, text: 'Hitchhiker\u2019s Guide, Meditations, Sherlock Holmes.' },
    { color: '#FFB033', icon: Route, text: 'Systems, not surfaces. Engineered experience.' },
  ];

  return (
    <div className="flex flex-col px-[20px] pt-[18px] pb-[16px] overflow-hidden">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
          My Personal
        </p>
        <ExpandButton onClick={onExpand} />
      </div>
      <Divider />

      {/* Compact fragment list */}
      <div className="flex flex-col gap-[8px] mt-[12px]">
        {fragments.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.color} className="flex items-center gap-[10px]">
              <Icon size={11} color={f.color} strokeWidth={1.5} style={{ opacity: 0.6 }} />
              <p className="font-['Cambay',sans-serif] text-[12px] leading-[17px] text-white/40">
                {f.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PROTOTYPING — Compact View
   ═══════════════════════════════════════════════════════════════════ */

function PrototypingCompact({ onExpand }: { onExpand: () => void }) {
  const spectrum = [
    { fidelity: 'THINK', color: '#7A7A90',
      narrative: 'Pen, paper, Miro. Shape before screen.',
    },
    {
      fidelity: 'DESIGN',
      color: '#E8501A',
      narrative: 'Figma daily. Flows, systems, spatial reasoning.',
    },
    {
      fidelity: 'BUILD',
      color: '#40F0AA',
      narrative: 'React, Next.js, Tailwind. Ship live, validate.',
    },
  ];

  return (
    <div className="flex flex-col px-[20px] pt-[18px] pb-[16px] overflow-hidden">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
          Prototyping
        </p>
        <ExpandButton onClick={onExpand} />
      </div>
      <Divider />

      {/* Fidelity spectrum — condensed */}
      <div className="relative flex flex-col gap-0 mt-[12px]">
        {/* Vertical gradient line */}
        <div
          className="absolute left-[3px] top-[6px] bottom-[6px] w-px"
          style={{
            background: 'linear-gradient(to bottom, #7A7A9030, #E8501A30, #40F0AA50)',
          }}
        />

        {spectrum.map((s) => (
          <div key={s.fidelity} className="relative flex gap-[14px] py-[5px]">
            <div className="relative z-10 shrink-0 mt-[4px]">
              <div
                className="rounded-full"
                style={{ width: 7, height: 7, background: s.color, opacity: 0.6, boxShadow: `0 0 8px ${s.color}30` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="font-['JetBrains_Mono',monospace] text-[8px] tracking-[2px] block mb-[2px]"
                style={{ color: `${s.color}90` }}
              >{s.fidelity}</span>
              <p className="font-['Cambay',sans-serif] text-[12px] leading-[17px] text-white/40">{s.narrative}</p>
            </div>
          </div>
        ))}
      </div>

      <p
        className="font-['Cambay',sans-serif] text-[11px] leading-[17px] mt-[10px]"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        I don&apos;t just hand off. I validate.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PERSONAL PROJECTS — Compact View
   ═══════════════════════════════════════════════════════════════════ */

function PersonalProjectsCompact({ onExpand }: { onExpand: () => void }) {
  const projects = [
    {
      name: 'INERTIA',
      type: 'GAME DESIGN',
      typeColor: '#FFB033',
      desc: 'Side-scrolling game with weather physics & color signal systems',
    },
    {
      name: 'Stillroom',
      type: 'SPATIAL TOOL',
      typeColor: '#00EAFF',
      desc: 'Infinite canvas for spatial reasoning & mental model mapping',
    },
  ];

  return (
    <div className="flex flex-col px-[20px] pt-[18px] pb-[16px] overflow-hidden">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Bebas_Neue',sans-serif] text-[32px] leading-[28px] tracking-[0.5px] text-white">
          Personal Projects
        </p>
        <ExpandButton onClick={onExpand} />
      </div>
      <Divider />

      <div className="flex flex-col gap-[6px] mt-[10px]">
        {projects.map((proj) => (
          <div
            key={proj.name}
            className="flex flex-col px-[10px] py-[8px] rounded-[8px]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-[6px] mb-[2px]">
              <span
                className="font-['Bebas_Neue',sans-serif] text-[8px] tracking-[2px] uppercase"
                style={{ color: proj.typeColor }}
              >
                {proj.type}
              </span>
            </div>
            <p className="font-['Cambay',sans-serif] text-[14px] text-white/70 mb-[1px]">
              {proj.name}
            </p>
            <p className="font-['Cambay',sans-serif] text-[11px] leading-[17px] text-white/35">
              {proj.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN ACCORDION OVERLAY COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

/* ── Section → Room mapping ──────────────────────────────────────── */
const SECTION_ROOM_MAP: Record<SectionId, string> = {
  'introduction': 'studio',
  'my-personal': 'garage',
  'how-i-work': 'room3',       // future room
  'prototyping': 'room4',      // future room
  'personal-projects': 'room5', // future room
};

export default function AccordionOverlay({
  currentRoom, onOpenStudy, emailCopied, onCopyEmail, playClick, visible,
  dimmed = false, visitedRooms, onOpenNarrative,
}: AccordionOverlayProps) {
  /* ── View mode: full welcome or accordion ────────────────────── */
  const [viewMode, setViewMode] = useState<'full' | 'accordion'>('full');

  const [activeSection, setActiveSection] = useState<SectionId>('introduction');
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Default active section per room
  useEffect(() => {
    if (currentRoom === 'studio') {
      setActiveSection('introduction');
    } else if (currentRoom === 'garage') {
      setActiveSection('my-personal');
    } else if (currentRoom === 'room3') {
      setActiveSection('how-i-work');
    } else if (currentRoom === 'room4') {
      setActiveSection('prototyping');
    }
  }, [currentRoom]);

  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovering(false);
    }, 400);
  }, []);

  const handleSectionClick = useCallback((sectionId: SectionId) => {
    playClick();
    setActiveSection(sectionId);
    setIsHovering(true);
  }, [playClick]);

  const handleExplore = useCallback(() => {
    setViewMode('accordion');
  }, []);

  /* ── Expand button always goes to full mode ──────────────────── */
  const handleExpandToFull = useCallback(() => {
    playClick();
    setViewMode('full');
  }, [playClick]);

  // For the active room, intro stays compact even without hover on first load
  const [hasInteracted, setHasInteracted] = useState(false);
  const showDefaultCompact = !hasInteracted ? true : isHovering;

  useEffect(() => {
    if (isHovering) setHasInteracted(true);
  }, [isHovering]);

  // Reset hasInteracted when room changes
  useEffect(() => {
    setHasInteracted(false);
  }, [currentRoom]);

  /* ── All sections definition ─────────────────────────────────── */
  const allSections: { id: SectionId; title: string }[] = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'how-i-work', title: 'How I Work' },
    { id: 'my-personal', title: 'My Personal' },
    { id: 'prototyping', title: 'Prototyping' },
    { id: 'personal-projects', title: 'Personal Projects' },
  ];

  /* ── Filter visible sections based on visited rooms ──────────── */
  const visibleSections = allSections.filter(section => {
    const requiredRoom = SECTION_ROOM_MAP[section.id];
    return visitedRooms ? visitedRooms.has(requiredRoom) : requiredRoom === 'studio';
  });

  const isSectionCompact = (sectionId: SectionId) => {
    if (sectionId === activeSection) {
      return showDefaultCompact;
    }
    return activeSection === sectionId && isHovering;
  };

  /* ── Dimension config per view mode ──────────────────────────── */
  const isFullMode = viewMode === 'full';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute z-30 overflow-hidden"
          style={{
            left: 20,
            top: 20,
            background: 'linear-gradient(to bottom, rgba(0,40,38,0.92) 0%, rgba(6,6,6,0.95) 40%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 18,
            backdropFilter: 'blur(2px)',
            pointerEvents: dimmed ? 'none' : 'auto',
          }}
          initial={{ x: -440, opacity: 0 }}
          animate={{
            x: 0,
            opacity: dimmed ? 0 : 1,
            width: isFullMode ? 400 : 308,
            height: isFullMode ? 853 : 'auto',
          }}
          exit={{ x: -440, opacity: 0 }}
          transition={{
            x: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: dimmed ? 0.25 : 0.4 },
            width: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            height: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          onMouseEnter={viewMode === 'accordion' ? handleMouseEnter : undefined}
          onMouseLeave={viewMode === 'accordion' ? handleMouseLeave : undefined}
        >
          {/* Keyframes for glow sweep */}
          <style>{`
            @keyframes caseStudyGlowSweep {
              0%   { top: -4px; opacity: 0; }
              8%   { opacity: 1; }
              85%  { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>

          <AnimatePresence mode="wait">
            {isFullMode ? (
              /* ═══ FULL WELCOME VIEW ═══════════════════════════════ */
              <motion.div
                key="full-welcome"
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FullWelcomeView
                  onExplore={handleExplore}
                  onOpenStudy={onOpenStudy}
                  emailCopied={emailCopied}
                  onCopyEmail={onCopyEmail}
                  playClick={playClick}
                />
              </motion.div>
            ) : (
              /* ═══ ACCORDION VIEW ═══════════════════════════════════ */
              <motion.div
                key="accordion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col">
                  {visibleSections.map((section, index) => {
                    const expanded = isSectionCompact(section.id);
                    const isIntro = section.id === 'introduction';

                    return (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{
                          opacity: { duration: 0.4, delay: 0.1 },
                          height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                        }}
                      >
                        {/* Section separator (not before first) */}
                        {index > 0 && (
                          <div className="px-[20px]">
                            <Divider />
                          </div>
                        )}

                        {/* Section content with animated height */}
                        <motion.div
                          layout
                          className="overflow-hidden cursor-pointer"
                          onClick={() => !expanded && handleSectionClick(section.id)}
                          animate={{ opacity: 1 }}
                          transition={{
                            layout: { type: 'spring', damping: 28, stiffness: 280 },
                            opacity: { duration: 0.2 },
                          }}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {expanded ? (
                              <motion.div
                                key={`${section.id}-compact`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isIntro ? (
                                  <IntroductionCompact
                                    onExpand={handleExpandToFull}
                                    onOpenStudy={onOpenStudy}
                                    emailCopied={emailCopied}
                                    onCopyEmail={onCopyEmail}
                                    playClick={playClick}
                                  />
                                ) : section.id === 'how-i-work' ? (
                                  <HowIWorkCompact onExpand={handleExpandToFull} />
                                ) : section.id === 'my-personal' ? (
                                  <MyPersonalCompact onExpand={() => { playClick(); onOpenNarrative?.('my-personal'); }} />
                                ) : section.id === 'prototyping' ? (
                                  <PrototypingCompact onExpand={() => { playClick(); onOpenNarrative?.('prototyping'); }} />
                                ) : (
                                  <PersonalProjectsCompact onExpand={handleExpandToFull} />
                                )}
                              </motion.div>
                            ) : (
                              <motion.div
                                key={`${section.id}-ultra`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isIntro ? (
                                  <IntroductionUltraCompact
                                    onExpand={handleExpandToFull}
                                    emailCopied={emailCopied}
                                    onCopyEmail={onCopyEmail}
                                    playClick={playClick}
                                  />
                                ) : (
                                  <SectionTitleBar
                                    title={section.title}
                                    onExpand={handleExpandToFull}
                                  />
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}