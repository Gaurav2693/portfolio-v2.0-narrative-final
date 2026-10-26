import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { PortfolioArt } from '@/components/portfolio-art';
import { AnimatedHero } from '@/components/animated-hero';
import { CostOfAttentionArt, CpqArt } from '@/components/study-art';
import { Reveal } from '@/components/reveal';
import { Clip } from '@/components/clip';
import { Page, SectionLabel, action, link } from '@/components/chrome';
import { site, caseStudies, builds, earlier } from '@/lib/site';
import { buildPages } from '@/lib/builds';

const studyArt = { 'cost-of-attention': CostOfAttentionArt, cpq: CpqArt } as const;

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  // Entrance: eyebrow, headline lines, subline, buttons rise in sequence.
  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = ref.current.querySelectorAll('[data-in]');
    const tween = gsap.fromTo(items, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
    return () => { tween.kill(); };
  }, []);
  return (
    <section id="home" className="grid items-center gap-8 py-10 md:min-h-[62vh] md:grid-cols-[1.1fr_0.9fr] md:py-12">
      <div ref={ref}>
        <p data-in className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em]">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
          {site.status}
        </p>
        <h1 className="max-w-[600px] text-[40px] font-semibold leading-[1.1] tracking-[-.045em] sm:text-[58px]">
          <span data-in className="block">{site.headline[0]}</span>
          <span data-in className="block">{site.headline[1]}</span>
          <span data-in className="relative inline-block">
            {site.headline[2]}
            <svg aria-hidden="true" viewBox="0 0 270 12" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full fill-none stroke-current">
              <path className="pencil-underline" pathLength="1" d="M2 8Q114 1 268 5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p data-in className="mt-7 max-w-[420px] text-base leading-7 text-ink-2">{site.subline}</p>
        <div data-in className="mt-8 flex flex-wrap items-center gap-6">
          <a className={action} href="#work">See the two case studies <ArrowRight size={16} /></a>
          <a className={link} href="#builds">Or what I’ve built <ArrowRight size={16} /></a>
        </div>
      </div>
      <AnimatedHero />
    </section>
  );
}

export default function Home() {
  return (
    <Page>
      <a href="#work" className="sr-only focus:not-sr-only">Skip to work</a>
      <Hero />

      {/* ── Work ───────────────────────────────────────────────── */}
      <section id="work" className="border-t border-line py-14">
        <Reveal><SectionLabel number="01" aside="Two studies. Decisions, costs, what shipped.">Case studies</SectionLabel></Reveal>
        <Reveal stagger={0.12} className="grid gap-8 md:grid-cols-2">
          {caseStudies.map((s) => {
            const Art = studyArt[s.slug as keyof typeof studyArt];
            return (
              <Link key={s.slug} to={`/work/${s.slug}`} className="group flex flex-col rounded-lg border border-line transition-colors hover:border-ink">
                <div className="flex aspect-[1.8] items-center justify-center border-b border-line bg-panel px-8 text-ink">
                  {Art ? <Art className="h-full w-full max-w-[380px] transition-transform duration-300 group-hover:-translate-y-1" /> : null}
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-xs uppercase tracking-wider text-ink-2">{s.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-base leading-7 text-ink-2">{s.lead}</p>
                  <dl className="mt-5 grid gap-2 border-t border-line pt-5 text-sm">
                    {s.facts.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[84px_1fr] gap-3">
                        <dt className="text-ink-2">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className={`${link} mt-6 self-start`}>
                    Read the study <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  {s.gated && <span className="mt-3 text-xs text-ink-2">Client work · access code on request</span>}
                </div>
              </Link>
            );
          })}
        </Reveal>
      </section>

      {/* ── Builds ─────────────────────────────────────────────── */}
      <section id="builds" className="border-t border-line py-14">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <Reveal><SectionLabel number="02" aside="Things I built myself, mostly in 3D.">Builds</SectionLabel></Reveal>
          <Reveal className="-mb-2 -mt-6 justify-self-end"><Clip name="3d-play" label="Gaurav juggling a cube, a sphere and a small terrain tile" className="size-36 md:size-44" /></Reveal>
        </div>
        <Reveal stagger={0.08} className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {buildPages.map((b) => (
            <Link key={b.slug} to={`/builds/${b.slug}`} className="group block">
              <div className="relative flex aspect-[1.6] items-center justify-center overflow-hidden rounded-md border border-line bg-panel transition-colors group-hover:border-ink">
                <Clip name={b.clip} label={b.clipLabel} bg="bg-panel" className="h-[88%] w-auto transition-transform duration-500 group-hover:scale-[1.04]" />
                <span className="absolute left-3 top-3 rounded border border-line bg-paper px-1.5 py-0.5 text-[11px]">{b.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight">{b.title}</h3>
                <ArrowRight size={16} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-1 text-sm leading-6 text-ink-2">{b.tagline}</p>
              <p className="mt-1 text-xs text-ink-3">{b.stack.slice(0, 3).join(' · ')}</p>
            </Link>
          ))}
          {builds.filter((b) => b.title === '1 Element a Day').map((b) => (
            <a key={b.title} href={b.href} className="group block">
              <div className="relative aspect-[1.6] overflow-hidden rounded-md border border-line bg-panel transition-colors group-hover:border-ink">
                {b.image ? <img src={b.image} alt={`${b.title} screenshot`} className="size-full object-cover" loading="lazy" /> : <span className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-wider text-ink-3">screenshot</span>}
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold tracking-tight">{b.title}</h3>
                <ArrowUpRight size={16} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-1 text-sm leading-6 text-ink-2">{b.what}</p>
              <p className="mt-1 text-xs text-ink-3">{b.stack}</p>
            </a>
          ))}
        </Reveal>
        <Reveal as="p" className="mt-10 text-sm text-ink-2">Earlier: {earlier.join(' · ')}.</Reveal>
      </section>

      {/* ── About ──────────────────────────────────────────────── */}
      <section id="about" className="border-t border-line py-14">
        <Reveal><SectionLabel number="03">About</SectionLabel></Reveal>
        <div className="grid items-start gap-10 md:grid-cols-[1fr_200px]">
          <Reveal stagger={0.1} className="max-w-[640px] space-y-5 text-base leading-7">
            <p>Senior product designer at Infinite Computer Solutions, embedded as the only UX designer on Brightspeed’s business platforms: quoting, billing, and the tools agents use on calls.</p>
            <p>Seven years in, self-taught across design and engineering. I prototype the interfaces I design, in React, Three.js and Babylon.js, because a working thing settles an argument faster than a mock does.</p>
            <p>I use AI heavily to build and to draw. The character on this page is generated to my own definition, and I’d rather say that than hide it.</p>
            <p className="text-ink-2">Based in {site.location}.</p>
          </Reveal>
          <Reveal delay={0.2}><Clip name="bicycle" label="Gaurav riding a bicycle" className="mx-auto size-48 md:mx-0 md:size-52" /></Reveal>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────── */}
      <section id="contact" className="grid items-center gap-8 border-t border-line py-14 sm:grid-cols-2">
        <Reveal>
          <SectionLabel number="04">Let’s talk</SectionLabel>
          <p className="max-w-[420px] text-base leading-7 text-ink-2">Hiring for a design-engineer or forward-deployed role, or want the full version of a study? Email is fastest.</p>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <a className={action} href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={16} /></a>
            <a className={link} href={site.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className={link} href={site.github} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="flex items-center justify-center">
          <PortfolioArt crop={[488, 904, 105, 84]} label="Gaurav waving hello" className="w-44" />
        </Reveal>
      </section>
    </Page>
  );
}
