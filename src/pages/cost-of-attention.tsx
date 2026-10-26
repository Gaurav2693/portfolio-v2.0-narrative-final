import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, X, Maximize2 } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
gsap.registerPlugin(ScrollTrigger);
import { Clip } from '@/components/clip';
import { Header, Footer } from '@/components/chrome';
import { coa, type Slide } from '@/lib/coa';
import { site } from '@/lib/site';
import { asset } from '@/lib/assets';

/* ── Small pieces ────────────────────────────────────────────── */

const CLIPS = ['attention-character', 'whiteboard', '3d-play'];

/* ── Lightbox: any screenshot opens full-size on click ───────── */
type Pic = { src: string; alt: string; pins?: { x: number; y: number; text?: string }[] };
const LightboxCtx = createContext<(pic: Pic) => void>(() => {});

function Lightbox({ pic, onClose }: { pic: Pic | null; onClose: () => void }) {
  useEffect(() => {
    if (!pic) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', on);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', on); document.body.style.overflow = ''; };
  }, [pic, onClose]);
  if (!pic) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={pic.alt} onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-paper/95 p-4 backdrop-blur-sm sm:p-10">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-line bg-paper text-ink hover:border-ink sm:right-6 sm:top-6"><X size={16} /></button>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-full max-w-[1600px] overflow-hidden rounded-md border border-line bg-paper shadow-2xl">
        <img src={pic.src} alt={pic.alt} className="block max-h-[88vh] w-auto max-w-full" />
        {pic.pins?.map((pin, i) => (
          <span key={i} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper shadow-[0_0_0_2px_var(--paper)]">{i + 1}</span>
            {pin.text && <span className="pointer-events-none absolute left-1/2 top-9 z-10 w-max max-w-[260px] -translate-x-1/2 rounded bg-ink px-2.5 py-1.5 text-xs leading-5 text-paper opacity-0 transition-opacity group-hover:opacity-100">{pin.text}</span>}
          </span>
        ))}
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-wider text-ink-3">Esc or click outside to close · hover a number</p>
    </div>
  );
}

const eyebrow = 'text-[11px] font-semibold uppercase tracking-[.16em] text-ink-2';
const h = 'text-[28px] font-semibold leading-[1.12] tracking-[-.035em] sm:text-[40px] lg:text-[46px]';
const p = 'text-[15px] leading-7 text-ink-2 sm:text-base';

// Optional line-art for a slide. Drops in from /public/coa/art/<name>.png when you add it;
// until then a quiet dashed slot shows where it goes (see ILLUSTRATIONS.md).
function Art({ name, className = '' }: { name?: string; className?: string }) {
  const [missing, setMissing] = useState(false);
  if (!name) return null;
  if (CLIPS.includes(name)) return <Clip name={name} label="" className={className} />;
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

function Shot({ src, alt, pins }: { src: string; alt: string; pins?: { x: number; y: number; text?: string }[] }) {
  const open = useContext(LightboxCtx);
  return (
    <div data-s className="group relative self-start overflow-hidden rounded-md border border-line bg-paper">
      <button type="button" onClick={() => open({ src, alt, pins })} aria-label={`Open ${alt} full size`} className="block w-full cursor-zoom-in">
        <img src={src} alt={alt} className="block w-full" loading="lazy" />
      </button>
      <span className="pointer-events-none absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-line bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 size={13} /></span>
      {pins?.map((pin, i) => (
        <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
          <span className="flex size-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper shadow-[0_0_0_2px_var(--paper)]">{i + 1}</span>
        </span>
      ))}
    </div>
  );
}

function StateShot({ src, alt }: { src: string; alt: string }) {
  const open = useContext(LightboxCtx);
  return (
    <button type="button" onClick={() => open({ src, alt })} aria-label={`Open ${alt} full size`} className="block w-full cursor-zoom-in overflow-hidden rounded-md border border-line transition-colors hover:border-ink">
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </button>
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
          <Art name={s.art} className="aspect-square w-full max-w-[300px] justify-self-center md:max-w-[400px]" />
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
            <Art name={s.art} className="hidden h-44 w-72 md:block" />
          </div>
        </div>
      );
    case 'figure':
      return (
        <div className="grid gap-6">
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <h2 data-s className={`${h} max-w-[26ch] !text-[24px] sm:!text-[30px] lg:!text-[34px]`}>{s.title}</h2>
            {s.art && <Art name={s.art} className="hidden h-36 w-56 md:block" />}
          </div>
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
                  <StateShot src={r.src} alt={r.alt} />
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
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <p data-s className="max-w-[30ch] border-l-2 border-ink pl-5 text-xl leading-snug sm:text-2xl">{s.quote}</p>
            <Link data-s to="/#work" className="inline-flex items-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-ink-2">Back to work <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      );
  }
}

/* ── Long scroll + navigation tree ──────────────────────────── */

type TreeNode = { chapter: string; items: { i: number; label: string }[] };

function buildTree(slides: Slide[]): TreeNode[] {
  const tree: TreeNode[] = [];
  slides.forEach((sl, i) => {
    const chapter = 'chapter' in sl ? sl.chapter : 'Case study';
    const last = tree[tree.length - 1];
    if (last && last.chapter === chapter) last.items.push({ i, label: sl.nav });
    else tree.push({ chapter, items: [{ i, label: sl.nav }] });
  });
  return tree;
}

export default function CostOfAttention() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pic, setPic] = useState<Pic | null>(null);
  const main = useRef<HTMLDivElement>(null);
  const tree = buildTree(coa.slides);

  useEffect(() => { document.title = `${coa.title} — ${site.name}`; }, []);

  // Which section is in view → active item in the tree.
  useEffect(() => {
    const sections = Array.from(main.current?.querySelectorAll<HTMLElement>('[data-sec]') ?? []);
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(Number((vis[0].target as HTMLElement).dataset.sec));
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((el) => io.observe(el));
    const onScroll = () => { const d = document.documentElement; setProgress(d.scrollTop / (d.scrollHeight - d.clientHeight)); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  // Each section's blocks rise in the first time it scrolls into view.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = Array.from(main.current?.querySelectorAll<HTMLElement>('[data-sec]') ?? []);
    const tweens = sections.map((sec, k) => {
      const items = sec.querySelectorAll('[data-s]');
      if (k === 0) return gsap.fromTo(items, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
      return gsap.fromTo(items, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, scrollTrigger: { trigger: sec, start: 'top 80%', once: true } });
    });
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  const go = (i: number) => document.getElementById(`s${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <LightboxCtx.Provider value={setPic}>
    <main className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
      <Header />
      {/* reading progress */}
      <div className="fixed left-0 top-0 z-40 h-0.5 w-full bg-transparent"><div className="h-full bg-ink transition-[width] duration-150" style={{ width: `${progress * 100}%` }} /></div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        {/* ── tree ─────────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <nav aria-label="Sections" className="sticky top-28 grid gap-5 py-10 text-[13px]">
            <Link to="/#work" className="inline-flex items-center gap-2 text-ink-2 hover:text-ink"><ArrowLeft size={13} /> Work</Link>
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-ink-3">{coa.title}</p>
            {tree.map((node) => {
              const open = node.items.some((it) => it.i === active);
              return (
                <div key={node.chapter} className="grid gap-1.5">
                  <button type="button" onClick={() => go(node.items[0].i)} className={`text-left leading-5 transition-colors ${open ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}>{node.chapter}</button>
                  {node.items.length > 1 && (
                    <ul className="ml-2 grid gap-1 border-l border-line">
                      {node.items.map((it) => (
                        <li key={it.i}>
                          <button type="button" onClick={() => go(it.i)} aria-current={active === it.i ? 'location' : undefined}
                            className={`-ml-px block w-full border-l pl-3 text-left leading-5 transition-colors ${active === it.i ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}>{it.label}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* ── sections ─────────────────────────────────────── */}
        <div ref={main} className="min-w-0">
          {coa.slides.map((sl, k) => (
            <section key={k} id={`s${k + 1}`} data-sec={k} className={`scroll-mt-28 border-b border-line py-14 ${k === 0 ? 'min-h-[70vh] content-center' : ''}`}>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <span className={eyebrow}>{'chapter' in sl ? sl.chapter : 'Case study'}</span>
                <span className="text-[11px] tabular-nums text-ink-3">{String(k + 1).padStart(2, '0')} / {coa.slides.length}</span>
              </div>
              <Body s={sl} />
            </section>
          ))}
          <div className="flex items-center justify-between gap-4 py-10 text-sm">
            <Link to="/#work" className="inline-flex items-center gap-2 text-ink-2 hover:text-ink"><ArrowLeft size={14} /> All work</Link>
            <Link to="/work/cpq" className="inline-flex items-center gap-2 font-medium hover:underline underline-offset-4">Next study: Brightquote CPQ <ArrowRight size={14} /></Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
    <Lightbox pic={pic} onClose={() => setPic(null)} />
    </LightboxCtx.Provider>
  );
}
