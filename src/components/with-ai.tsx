import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { Clip } from '@/components/clip';
import { SectionLabel } from '@/components/chrome';

// "How I work with AI" — a four-stage pipeline. AI shows up as tools with a job,
// the way Figma does, and each stage ends on the decision that stays with me.
// To use real brand marks later: give Tool an `icon` and render it before the name.

type ToolTag = { name: string; job: string; mine?: boolean };

const stages: { title: string; line: string; tools: ToolTag[]; decide: string }[] = [
  {
    title: 'Frame',
    line: 'Brief, constraints, information architecture. Written by me before any model sees it.',
    tools: [{ name: 'Me', job: 'brief + IA', mine: true }, { name: 'Figma', job: 'structure' }, { name: 'Claude', job: 'sparring' }],
    decide: 'What we are solving, and what is out of scope.',
  },
  {
    title: 'Route',
    line: 'Each task goes to the model built for it. Same brief to two models when the answer matters; keep the better reasoning.',
    tools: [{ name: 'Claude', job: 'code · structure' }, { name: 'GPT', job: 'images · frames' }, { name: 'Haiku-class', job: 'drafts · bulk' }, { name: 'Opus-class', job: 'architecture' }],
    decide: 'Which model, at what cost, for which step.',
  },
  {
    title: 'Build',
    line: 'Prototype in code. The model scaffolds; I own interaction, hierarchy, and the cuts.',
    tools: [{ name: 'Claude Code', job: 'scaffold' }, { name: 'React · Three.js', job: 'the thing' }, { name: 'Me', job: 'taste · cuts', mine: true }],
    decide: 'A working thing settles the argument. I argue with working things.',
  },
  {
    title: 'Ship',
    line: 'Deploy, trace the cost, say what shipped and what did not.',
    tools: [{ name: 'Vercel', job: 'deploy' }, { name: 'Langfuse', job: 'traces · cost' }, { name: 'Me', job: 'status', mine: true }],
    decide: 'Shipped, in progress, proposed. Never blurred.',
  },
];

function Tool({ t }: { t: ToolTag }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] leading-none ${t.mine ? 'border-ink bg-ink text-paper' : 'border-line text-ink'}`}>
      <span className="font-semibold">{t.name}</span>
      <span className={t.mine ? 'text-paper/70' : 'text-ink-3'}>{t.job}</span>
    </span>
  );
}

export function WithAI() {
  return (
    <section id="with-ai" className="border-t border-line py-14">
      <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
        <Reveal>
          <SectionLabel number="04">How I work with AI</SectionLabel>
          <p className="-mt-3 max-w-[56ch] text-base leading-7 text-ink-2">
            AI is a tool with a job, like Figma. Routing work between models is systems thinking: cost, latency and quality are a budget, not a vibe. RONIN is this habit turned into software.
          </p>
        </Reveal>
        <Reveal className="-mb-4 justify-self-center md:justify-self-end"><Clip name="3d-play" label="Gaurav juggling a cube, a sphere and a small terrain tile" className="size-36 md:size-40" /></Reveal>
      </div>

      <Reveal stagger={0.1} className="mt-8 grid gap-4 md:grid-cols-4 md:gap-0">
        {stages.map((s, i) => (
          <div key={s.title} className="relative grid content-start gap-4 rounded-md border border-line p-5 md:rounded-none md:border-y md:border-l md:border-r-0 md:first:rounded-l-md md:last:rounded-r-md md:last:border-r">
            {i < stages.length - 1 && <ArrowRight size={14} className="absolute -right-[7px] top-6 z-10 hidden rounded-full bg-paper text-ink-3 md:block" />}
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-ink-3 tabular-nums">0{i + 1}</span>
              <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
            </div>
            <p className="text-sm leading-6 text-ink-2">{s.line}</p>
            <div className="flex flex-wrap gap-1.5">{s.tools.map((t) => <Tool key={t.name + t.job} t={t} />)}</div>
            <p className="mt-auto border-t border-line pt-3 text-[13px] leading-5"><span className="text-ink-3">Decide · </span>{s.decide}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
