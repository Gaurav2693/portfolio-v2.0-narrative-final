import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ThemeToggle } from '@/components/theme-toggle';
import { Clip, clipNames, type ClipName } from '@/components/clip';
import { coa, type Slide } from '@/lib/coa';
import { site } from '@/lib/site';
import { asset } from '@/lib/assets';

/* ── Small pieces ────────────────────────────────────────────── */

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[.16em] text-ink-2';
const h = 'text-[28px] font-semibold leading-[1.12] tracking-[-.035em] sm:text-[40px] lg:text-[46px]';
const p = 'text-[15px] leading-7 text-ink-2 sm:text-base';

// Optional line-art for a slide. Drops in from /public/coa/art/<name>.png when you add it;
// until then a quiet dashed slot shows where it goes (see ILLUSTRATIONS.md).
function Art({ name, className = '' }: { name?: string; className?: string }) {
  const [missing, setMissing] = useState(false);
  if (!name) return null;
  if ((clipNames as readonly string[]).includes(name)) return <Clip name={name as ClipName} label="" className={className} />;
  if (missing) return <div className={`flex items-center justify-center rounded-md border border-dashed border-line text-[11px] uppercase tracking-wider text-ink-3 ${className}`}>art · {name}</div>;
  return <img src={asset(`coa/art/${name}.png`)} alt="" className={`art object-contain ${className}`} onError={() => setMissing(true)} />;
}

function Num({ n }: { n: number }) {
  return <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-paper tabular-nums">{n}</span>;
}

function Legend({ title, items, note }: { title: string; items: string[]; note?: string }) {
  return (
    <div data-s className="grid content-start gap-3 text-sm">
      <h3 className="text-base font-semibold">{title}</h3>
      <ol className="grid gap-2.5">
        {items.map((t, i) => (
          <li key={i} className="grid grid-cols-[20px_1fr] items-start gap-3 leading-6 text-ink-2"><Num n={i + 1} /><span>{t}</span></li>
        ))}
      </ol>
      {note && <p className="border-t border-line pt-3 text-[13px] leading-6 text-ink-3">{note}</p>}
    </div>
  );
}

function Shot({ src, alt, pins }: { src: string; alt: string; pins?: { x: number; y: number }[] }) {
  return (
    <div data-s className="relative overflow-hidden rounded-md border border-line bg-paper">
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
      {pins?.map((pin, i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
          <span className="flex size-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper shadow-[0_0_0_2px_var(--paper)]">{i + 1}</span>
        </span>
      ))}
    </div>
  );
}

function Ledger({ rows }: { rows: { k: string; v: string; tone?: 'red' }[] }) {
  return (
    <dl data-s className="divide-y divide-line border-y border-line text-sm">
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[1fr_auto] items-baseline gap-6 py-3">
          <dt className="text-ink-2">{r.k}</dt>
          <dd className={`text-right tabular-nums ${r.tone === 'red' ? 'text-red-600 dark:text-red-400' : ''}`}>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Slide bodies ────────────────────────────────────────────── */

function Body({ s }: { s: Slide }) {
  switch (s.kind) {
    case 'title':
      return (
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6">
            <p data-s className={eyebrow}>{s.eyebrow}</p>
            <h1 data-s className="text-[44px] font-semibold leading-[1.02] tracking-[-.045em] sm:text-[64px] lg:text-[80px]">{s.title}</h1>
            <p data-s className="max-w-[560px] text-lg leading-8 text-ink-2">{s.lead}</p>
            <dl data-s className="grid max-w-[520px] gap-2 border-t border-line pt-4 text-sm">
              {s.facts.map(([k, v]) => <div key={k} className="grid grid-cols-[84px_1fr] gap-3"><dt className="text-ink-2">{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <Art name={s.art} className="hidden aspect-square w-full max-w-[380px] justify-self-center md:block" />
        </div>
      );
    case 'text':
      return (
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <div className="grid content-start gap-6">
            <h2 data-s className={h}>{s.title}</h2>
            {s.body.map((t, i) => <p key={i} data-s className={`${p} max-w-[60ch]`}>{t}</p>)}
            {s.quote && <p data-s className="mt-2 max-w-[34ch] border-l-2 border-ink pl-5 text-xl leading-snug sm:text-2xl">{s.quote}</p>}
          </div>
          {s.aside && (
            <dl data-s className="self-start divide-y divide-line border-y border-line text-sm md:mt-2">
              {s.aside.map((a) => (
                <div key={a.label} className="grid gap-1 py-4">
                  <dt className={eyebrow}>{a.label}</dt>
                  <dd className={`text-xl tabular-nums ${a.tone === 'red' ? 'text-red-600 dark:text-red-400' : ''}`}>{a.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );
    case 'split':
      return (
        <div className="grid gap-8">
          <h2 data-s className={`${h} max-w-[24ch]`}>{s.title}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[s.left, s.right].map((c) => (
              <div key={c.label} data-s className={`grid content-start gap-3 rounded-md border p-6 ${'tone' in c && c.tone === 'red' ? 'border-ink' : 'border-line'}`}>
                <p className={eyebrow}>{c.label}</p>
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className={p}>{c.body}</p>
                <p className="text-sm leading-6"><b className="font-semibold">{c.note.split(':')[0]}:</b>{c.note.slice(c.note.indexOf(':') + 1)}</p>
              </div>
            ))}
          </div>
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            {s.foot && <p data-s className={`${p} max-w-[70ch]`}>{s.foot}</p>}
            <Art name={s.art} className="hidden h-28 w-56 md:block" />
          </div>
        </div>
      );
    case 'figure':
      return (
        <div className="grid gap-6">
          <h2 data-s className={`${h} max-w-[26ch] !text-[24px] sm:!text-[30px] lg:!text-[34px]`}>{s.title}</h2>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Shot src={s.fig.src} alt={s.fig.alt} pins={s.fig.pins} />
            <Legend title={s.legend.title} items={s.fig.pins ? s.fig.pins.map((pn) => pn.text) : s.legend.items} note={s.legend.note} />
          </div>
        </div>
      );
    case 'states':
      return (
        <div className="grid gap-6">
          <h2 data-s className={`${h} max-w-[26ch] !text-[24px] sm:!text-[30px] lg:!text-[34px]`}>{s.title}</h2>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-3">
              {s.rows.map((r) => (
                <div key={r.label} data-s className="grid items-center gap-3 sm:grid-cols-[110px_1fr]">
                  <span className={eyebrow}>{r.label}</span>
                  <div className="overflow-hidden rounded-md border border-line"><img src={r.src} alt={r.alt} className="block w-full" loading="lazy" /></div>
                </div>
              ))}
            </div>
            <Legend {...s.legend} />
          </div>
        </div>
      );
    case 'decision':
      return (
        <div className="grid gap-8">
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <h2 data-s className={`${h} max-w-[26ch]`}>{s.title}</h2>
            <Art name={s.art} className="hidden size-44 md:block" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div data-s className="grid content-start gap-4 rounded-md border border-line p-6">
              <p className={eyebrow}>What the strip would have cost</p>
              <ol className="grid gap-2.5 text-sm">{s.cost.items.map((t, i) => <li key={i} className="grid grid-cols-[20px_1fr] gap-3 leading-6 text-ink-2"><Num n={i + 1} /><span>{t}</span></li>)}</ol>
              <dl className="divide-y divide-line border-t border-line text-sm">{s.cost.ledger.map(([k, v]) => <div key={k} className="grid grid-cols-[1fr_auto] gap-4 py-2.5"><dt className="text-ink-2">{k}</dt><dd className="tabular-nums">{v}</dd></div>)}</dl>
            </div>
            <div data-s className="grid content-start gap-4 rounded-md border border-ink p-6">
              <p className={eyebrow}>What we did instead</p>
              <h3 className="text-2xl font-semibold">{s.did.title}</h3>
              {s.did.body.map((t, i) => <p key={i} className={p}>{t}</p>)}
            </div>
          </div>
        </div>
      );
    case 'ledger':
      return (
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="grid content-start gap-5">
            <h2 data-s className={h}>{s.title}</h2>
            {s.body.map((t, i) => <p key={i} data-s className={`${p} max-w-[58ch]`}>{t}</p>)}
          </div>
          <Ledger rows={s.rows} />
        </div>
      );
    case 'close':
      return (
        <div className="grid gap-8">
          <h2 data-s className={`${h} max-w-[26ch]`}>{s.title}</h2>
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.points.map(([t, b], i) => (
              <div key={t} data-s className="grid grid-cols-[20px_1fr] gap-3 border-t border-line pt-4"><Num n={i + 1} /><div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm leading-6 text-ink-2">{b}</p></div></div>
            ))}
          </div>
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto_auto]">
            <p data-s className="max-w-[30ch] border-l-2 border-ink pl-5 text-xl leading-snug sm:text-2xl">{s.quote}</p>
            <Art name={s.art} className="hidden h-28 w-40 md:block" />
            <Link data-s to="/#work" className="inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-2">Back to work <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      );
  }
}

/* ── Deck ────────────────────────────────────────────────────── */

export default function CostOfAttention() {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = coa.slides.length;
  const played = useRef<Set<number>>(new Set());

  useEffect(() => { document.title = `${coa.title} — ${site.name}`; }, []);

  const go = useCallback((to: number) => {
    const el = track.current; if (!el) return;
    const idx = Math.max(0, Math.min(n - 1, to));
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
  }, [n]);

  // Track the active slide from scroll position.
  useEffect(() => {
    const el = track.current; if (!el) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setI(Math.round(el.scrollLeft / el.clientWidth))); };
    el.addEventListener('scroll', on, { passive: true });
    return () => { el.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  // Keyboard: ← → space, Home/End.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(i + 1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1); }
      if (e.key === 'Home') go(0);
      if (e.key === 'End') go(n - 1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [i, go, n]);

  // Animate a slide's blocks in the first time it becomes active.
  useEffect(() => {
    const el = track.current; if (!el) return;
    if (played.current.has(i)) return;
    played.current.add(i);
    const slide = el.children[i] as HTMLElement | undefined; if (!slide) return;
    const items = slide.querySelectorAll('[data-s]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set(items, { opacity: 1, x: 0 }); return; }
    gsap.fromTo(items, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, delay: 0.05 });
  }, [i]);

  // Pre-hide blocks of slides not yet shown, so the entrance has something to do.
  useEffect(() => {
    const el = track.current; if (!el) return;
    Array.from(el.children).forEach((s, k) => { if (k !== 0) gsap.set(s.querySelectorAll('[data-s]'), { opacity: 0 }); });
  }, []);

  const chapter = (s: Slide) => ('chapter' in s ? s.chapter : 'Case study');

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      {/* header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6 sm:px-10">
        <Link to="/#work" className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"><ArrowLeft size={15} /> Work</Link>
        <p className="hidden text-sm text-ink-2 sm:block"><span className="text-ink">{coa.title}</span> · {coa.eyebrow}</p>
        <ThemeToggle />
      </header>

      {/* slides */}
      <div ref={track} className="deck-track flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden" aria-live="polite">
        {coa.slides.map((s, k) => (
          <section key={k} aria-label={`Slide ${k + 1} of ${n}`} aria-hidden={k !== i} className="grid h-full w-full shrink-0 snap-start grid-rows-[auto_1fr] overflow-y-auto px-6 py-6 sm:px-10 sm:py-8">
            <div className="mx-auto mb-5 flex w-full max-w-[1200px] items-baseline justify-between gap-4 border-b border-line pb-3">
              <span className={eyebrow}>{chapter(s)}</span>
              <span className="text-[11px] tabular-nums text-ink-3">{String(k + 1).padStart(2, '0')} / {n}</span>
            </div>
            <div className="mx-auto grid w-full max-w-[1200px] content-center"><Body s={s} /></div>
          </section>
        ))}
      </div>

      {/* nav */}
      <nav aria-label="Slide navigation" className="flex h-14 shrink-0 items-center gap-4 border-t border-line px-6 sm:px-10">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm hover:border-ink disabled:opacity-30 disabled:hover:border-line"><ArrowLeft size={14} /> Prev</button>
        <div className="relative h-px flex-1 bg-line"><span className="absolute left-0 top-0 h-px bg-ink transition-[width] duration-300" style={{ width: `${((i + 1) / n) * 100}%` }} /></div>
        <span className="hidden text-[11px] text-ink-3 sm:block">← → to move</span>
        <button type="button" onClick={() => go(i + 1)} disabled={i === n - 1} className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm hover:border-ink disabled:opacity-30 disabled:hover:border-line">Next <ArrowRight size={14} /></button>
      </nav>
    </div>
  );
}


