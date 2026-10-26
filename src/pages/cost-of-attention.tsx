import { ArrowUpRight } from 'lucide-react';
import { Page, action } from '@/components/chrome';
import { Reveal } from '@/components/reveal';
import { site, caseStudies } from '@/lib/site';

// Placeholder until the full study is dropped in. The deck itself carries the
// Brightspeed "Protected prototype" gate (code on request) — keep that when embedding.
const study = caseStudies.find((s) => s.slug === 'cost-of-attention')!;

export default function CostOfAttention() {
  return (
    <Page title={study.title}>
      <Reveal stagger={0.08} className="grid min-h-[70vh] content-center gap-6 py-16">
        <p className="text-xs uppercase tracking-wider text-ink-2">{study.eyebrow}</p>
        <h1 className="max-w-[640px] text-[40px] font-semibold leading-[1.1] tracking-[-.045em] sm:text-[58px]">{study.title}</h1>
        <p className="max-w-[560px] text-lg leading-8 text-ink-2">{study.lead}</p>
        <dl className="grid max-w-[560px] gap-2 border-t border-line pt-5 text-sm">
          {study.facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[84px_1fr] gap-3"><dt className="text-ink-2">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <p className="max-w-[560px] text-sm leading-6 text-ink-2">This study contains client work and opens with an access code. Ask for one and I’ll send it the same day.</p>
        <a href={`mailto:${site.email}?subject=Access%20code%20for%20${encodeURIComponent(study.title)}`} className={`${action} self-start`}>
          Request access <ArrowUpRight size={16} />
        </a>
      </Reveal>
    </Page>
  );
}
