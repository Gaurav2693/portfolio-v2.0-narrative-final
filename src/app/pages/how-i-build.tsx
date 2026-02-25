import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUp, ArrowLeft } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   HOW I BUILD THINGS NOW — Editorial Article Page
   ────────────────────────────────────────────────
   Full-width article layout with warm off-white background,
   sticky left sidebar progress indicator, and clean editorial feel.
   Connected to the "How I Think" room (Room 03).
   ═══════════════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'section-01', label: '01' },
  { id: 'section-02', label: '02' },
  { id: 'section-03', label: '03' },
  { id: 'section-04', label: '04' },
  { id: 'section-05', label: '05' },
  { id: 'section-06', label: '06' },
];

export default function HowIBuild() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  /* ── Scroll spy ────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 200;
      let current = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.offsetTop <= scrollY) {
          current = i;
        }
      });
      setActiveIndex(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const registerRef = useCallback((index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: '#F5F4F0',
        fontFamily: "'Inter', sans-serif",
        color: '#1A1A1A',
      }}
    >
      {/* ═══ STICKY LEFT SIDEBAR — Progress Indicator ══════════════ */}
      <div
        className="fixed left-0 top-0 h-screen hidden lg:flex flex-col items-start justify-center z-40"
        style={{ width: 160, paddingLeft: 48 }}
      >
        {/* Progress track — relative container for vertical line + dots */}
        <div className="relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Continuous vertical line */}
          <div
            style={{
              position: 'absolute',
              left: 3.5, /* center of 8px dot */
              top: 4,
              bottom: 4,
              width: 1,
              background: '#D4D1CB',
            }}
          />

          {SECTIONS.map((section, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            const isFilled = isActive || isPast;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(i)}
                className="relative flex items-center cursor-pointer group"
                style={{
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  marginTop: i === 0 ? 0 : 28,
                  gap: 10,
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isFilled ? '#1A1A1A' : 'transparent',
                    border: isFilled ? '1px solid #1A1A1A' : '1px solid #BBBAB5',
                    transition: 'background 200ms ease, border-color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isFilled) {
                      e.currentTarget.style.background = '#555';
                      e.currentTarget.style.borderColor = '#555';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFilled) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#BBBAB5';
                    }
                  }}
                />

                {/* Label */}
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: '0.05em',
                    color: '#BBBAB5',
                    transition: 'color 200ms ease',
                  }}
                >
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom label — "Back to How I Think" */}
        <button
          onClick={() => navigate('/')}
          className="absolute bottom-8 left-0 flex items-center gap-1.5 cursor-pointer group"
          style={{
            paddingLeft: 48,
            background: 'none',
            border: 'none',
          }}
        >
          <ArrowUp
            size={10}
            style={{ color: '#BBBAB5' }}
            className="group-hover:translate-y-[-1px] transition-transform"
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              fontWeight: 400,
              color: '#BBBAB5',
              whiteSpace: 'nowrap',
            }}
          >
            Back to How I Think
          </span>
        </button>
      </div>

      {/* ═══ MAIN CONTENT AREA ═══════════════════════════════════════ */}
      <main className="w-full lg:pl-[160px]" style={{ minHeight: '100vh' }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: 720,
            paddingTop: 80,
            paddingBottom: 120,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          {/* ── Intro Block ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 0 }}>
            {/* Mobile back */}
            <button
              onClick={() => navigate('/')}
              className="lg:hidden flex items-center gap-2 cursor-pointer mb-8"
              style={{ color: '#999' }}
            >
              <ArrowLeft size={14} style={{ color: '#999' }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: '#999',
                }}
              >
                Back
              </span>
            </button>

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 48,
                fontWeight: 600,
                lineHeight: 1.1,
                color: '#1A1A1A',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              How I Build Things Now
            </h1>

            {/* Subtext */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.6,
                color: '#888',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              From blank Figma frame to live URL — and what I've learned doing it
            </p>

            {/* Horizontal rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #E0DED9',
                marginTop: 32,
                marginBottom: 0,
              }}
            />
          </div>

          {/* ── Stage 01: Thinking in Figma ──────────────────────────── */}
          <section
            id="section-01"
            ref={registerRef(0)}
            style={{ paddingTop: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 01
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Thinking in Figma
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Everything starts here. Not because Figma is sacred, but because spatial thinking is how I process product problems. IA, flows, visual language — all of it gets shaped before I write a line of code.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Figma flow — Stillroom canvas IA]
              </span>
            </div>

            {/* Section rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #E0DED9',
                marginTop: 48,
                marginBottom: 0,
              }}
            />
          </section>

          {/* ── Stage 02: Rapid Exploration with Figma Make ────────────── */}
          <section
            id="section-02"
            ref={registerRef(1)}
            style={{ paddingTop: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 02
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Rapid Exploration with Figma Make
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Once a direction exists, I use Figma Make to stress-test it fast. I'm not treating the output as final — I'm using it to find out whether the idea is strong enough to carry forward. It's accelerated ideation, not finished design.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Side-by-side Make explorations]
              </span>
            </div>

            {/* Section rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #E0DED9',
                marginTop: 48,
                marginBottom: 0,
              }}
            />
          </section>

          {/* ── Stage 03: Locking and Refining ─────────────────────────── */}
          <section
            id="section-03"
            ref={registerRef(2)}
            style={{ paddingTop: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 03
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Locking and Refining
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              When a direction holds up, I refine it properly — edge cases, micro-interactions, spacing, cohesion. This is where the experience gets shaped. I move between Figma and Make until the product feels mature.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Before / after refinement frames]
              </span>
            </div>

            {/* Heavier divider — signals transition from design to build */}
            <hr
              style={{
                border: 'none',
                borderTop: '2px solid #D4D1CB',
                marginTop: 48,
                marginBottom: 0,
              }}
            />
          </section>

          {/* ── Stage 04: Design to Code with Codex ────────────────────── */}
          <section
            id="section-04"
            ref={registerRef(3)}
            style={{ paddingTop: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 04
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Design to Code with Codex
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              With stable design intent, I bring Codex in. Frontend components, layout logic, interaction states — I stay closely involved to make sure UX doesn't get diluted in translation. AI speeds this up. It doesn't replace the judgment calls.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Component code or implementation screenshot]
              </span>
            </div>

            {/* Section rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #E0DED9',
                marginTop: 48,
                marginBottom: 0,
              }}
            />
          </section>

          {/* ── Stage 05: Functional Validation ────────────────────────── */}
          <section
            id="section-05"
            ref={registerRef(4)}
            style={{ paddingTop: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 05
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Functional Validation
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              APIs connect, data flows get tested, state stabilizes. This is where a prototype stops performing and starts behaving. The design either holds under real conditions — or reveals what needs fixing.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Vercel preview or live prototype screenshot]
              </span>
            </div>

            {/* Section rule */}
            <hr
              style={{
                border: 'none',
                borderTop: '1px solid #E0DED9',
                marginTop: 48,
                marginBottom: 0,
              }}
            />
          </section>

          {/* ── Stage 06: Git and Deployment ────────────────────────────── */}
          <section
            id="section-06"
            ref={registerRef(5)}
            style={{ paddingTop: 80, paddingBottom: 80 }}
          >
            {/* Stage label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888',
              }}
            >
              Stage 06
            </div>

            {/* Stage title */}
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 600,
                lineHeight: 1.3,
                color: '#1A1A1A',
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Git and Deployment
            </h2>

            {/* Body text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.7,
                color: '#3A3A3A',
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Everything moves through Git — structured commits, branch experiments, decision documentation. Deployment via Vercel: instant previews, clean CI/CD, reliable rollback. Shipping feels like iteration, not risk.
            </p>

            {/* Placeholder block */}
            <div
              style={{
                width: '100%',
                height: 220,
                background: '#E8E6E0',
                borderRadius: 8,
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: '#AAA9A4',
                }}
              >
                [Placeholder: Git commit log or Vercel dashboard]
              </span>
            </div>

            {/* No divider — 80px open space handled by paddingBottom */}
          </section>

          {/* ── Closing Block ──────────────────────────────────────────── */}
          <div
            style={{
              background: '#1A1A1A',
              padding: 48,
              borderRadius: 12,
              width: '100%',
            }}
          >
            {/* Label */}
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: '#888888',
              }}
            >
              What this actually taught me
            </div>

            {/* Main text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.8,
                color: '#F5F4F0',
                maxWidth: 560,
                marginTop: 20,
                marginBottom: 0,
              }}
            >
              When I designed Stillroom's canvas interactions in Figma and then had to implement them myself, I made three different decisions I wouldn't have made from a handoff. That feedback loop is the point. Design decisions get better when you're accountable for the final build.
            </p>

            {/* Inline link */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              style={{
                display: 'inline-block',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: '#888888',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                marginTop: 24,
                cursor: 'pointer',
              }}
            >
              See Stillroom →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}