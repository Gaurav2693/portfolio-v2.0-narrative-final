import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { Page, SectionLabel, action, link } from '@/components/chrome';
import { Reveal } from '@/components/reveal';
import { Clip } from '@/components/clip';
import { buildPages, findBuild } from '@/lib/builds';
import { asset } from '@/lib/assets';

export default function Build() {
  const { slug } = useParams();
  const b = findBuild(slug);
  const hero = useRef<HTMLDivElement>(null);

  // Hero entrance: text rises in, the clip settles from the right.
  useEffect(() => {
    if (!b || !hero.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(hero.current.querySelectorAll('[data-in]'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 })
      .fromTo(hero.current.querySelector('[data-clip]'), { opacity: 0, x: 24, scale: 0.98 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.15);
    return () => { tl.kill(); };
  }, [b]);

  if (!b) return <Navigate to="/#builds" replace />;

  const idx = buildPages.findIndex((x) => x.slug === b.slug);
  const next = buildPages[(idx + 1) % buildPages.length];

  return (
    <Page title={b.title}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section ref={hero} className="grid items-center gap-8 py-10 md:min-h-[66vh] md:grid-cols-[1.1fr_0.9fr] md:py-12">
        <div>
          <p data-in className="mb-5 flex flex-wrap items-center gap-3 text-xs">
            <Link to="/#builds" className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink"><ArrowLeft size={13} /> Builds</Link>
            <span className="text-ink-3">·</span>
            <span className="rounded border border-line px-1.5 py-0.5 text-[11px]">{b.status}</span>
            <span className="text-ink-3">{b.year}</span>
          </p>
          <h1 data-in className="text-[44px] font-semibold leading-[1.02] tracking-[-.045em] sm:text-[64px] lg:text-[76px]">{b.title}</h1>
          <p data-in className="mt-6 max-w-[480px] text-lg leading-8 text-ink-2">{b.tagline}</p>
          <p data-in className="mt-6 flex flex-wrap gap-2">
            {b.stack.map((s) => <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-2">{s}</span>)}
          </p>
          <div data-in className="mt-8 flex flex-wrap items-center gap-6">
            {b.links.map((l, i) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={i === 0 ? action : link}>{l.label} <ArrowUpRight size={15} /></a>
            ))}
            {b.links.length === 0 && <span className="text-sm text-ink-3">No public link yet.</span>}
          </div>
        </div>
        <div data-clip className="justify-self-center">
          <Clip name={b.clip} label={b.clipLabel} className="size-[280px] sm:size-[360px] md:size-[400px]" />
        </div>
      </section>

      {/* ── What ─────────────────────────────────────────────── */}
      <section className="border-t border-line py-14">
        <Reveal><SectionLabel number="01">What it is</SectionLabel></Reveal>
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <Reveal stagger={0.1} className="max-w-[640px] space-y-5 text-base leading-7">
            {b.what.map((t, i) => <p key={i}>{t}</p>)}
          </Reveal>
          <Reveal>
            <dl className="divide-y divide-line border-y border-line text-sm">
              {b.facts.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[96px_1fr] gap-4 py-3"><dt className="text-ink-2">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section className="border-t border-line py-14">
        <Reveal><SectionLabel number="02" aside="Brief on purpose. The decisions, not the diary.">How I built it</SectionLabel></Reveal>
        <Reveal stagger={0.08} className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {b.process.map((s, i) => (
            <div key={s.title} className="grid grid-cols-[28px_1fr] gap-3 border-t border-line pt-5">
              <span className="text-xs text-ink-3 tabular-nums">0{i + 1}</span>
              <div><h3 className="font-semibold">{s.title}</h3><p className="mt-2 text-sm leading-6 text-ink-2">{s.body}</p></div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── Screens ──────────────────────────────────────────── */}
      <section className="border-t border-line py-14">
        <Reveal><SectionLabel number="03">Screens</SectionLabel></Reveal>
        {b.screens.length > 0 ? (
          <Reveal stagger={0.08} className="grid gap-6 sm:grid-cols-2">
            {b.screens.map((s) => (
              <figure key={s.src} className="grid gap-2">
                <div className="overflow-hidden rounded-md border border-line bg-panel"><img src={asset(s.src)} alt={s.caption} className="block w-full" loading="lazy" /></div>
                <figcaption className="text-xs text-ink-2">{s.caption}</figcaption>
              </figure>
            ))}
          </Reveal>
        ) : (
          <Reveal className="grid gap-6 sm:grid-cols-2">
            {[0, 1].map((k) => <div key={k} className="flex aspect-[1.6] items-center justify-center rounded-md border border-dashed border-line text-xs uppercase tracking-wider text-ink-3">screenshot coming</div>)}
          </Reveal>
        )}
      </section>

      {/* ── Links + next ─────────────────────────────────────── */}
      <section className="grid gap-8 border-t border-line py-14 sm:grid-cols-2">
        <Reveal>
          <SectionLabel number="04">Links</SectionLabel>
          <div className="flex flex-wrap items-center gap-6">
            {b.links.length > 0 ? b.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={link}>{l.label} <ArrowUpRight size={15} /></a>) : <span className="text-sm text-ink-3">Nothing public yet.</span>}
          </div>
          {b.note && <p className="mt-5 max-w-[46ch] text-sm leading-6 text-ink-2">{b.note}</p>}
        </Reveal>
        <Reveal className="sm:justify-self-end sm:text-right">
          <p className="text-xs uppercase tracking-wider text-ink-2">Next build</p>
          <Link to={`/builds/${next.slug}`} className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold tracking-tight hover:underline underline-offset-4">{next.title} <ArrowRight size={20} /></Link>
          <p className="mt-1 text-sm text-ink-2">{next.tagline}</p>
        </Reveal>
      </section>
    </Page>
  );
}
