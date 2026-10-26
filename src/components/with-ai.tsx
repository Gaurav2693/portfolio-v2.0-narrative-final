import { Reveal } from '@/components/reveal';
import { Clip } from '@/components/clip';
import { SectionLabel } from '@/components/chrome';

// "How I work with AI" — the split that matters is not which tool, but who decides what.
// Each step names what the model does and what stays with me. Edit copy here.

const steps: { title: string; ai: string; me: string; proof?: string }[] = [
  {
    title: 'The brief is mine',
    ai: 'Nothing yet. A model given a vague brief returns a confident, vague answer.',
    me: 'Write the problem, the constraint, and who it is for, in plain words. If I cannot write it in a paragraph, I am not ready to build it.',
  },
  {
    title: 'Research fans out, I narrow',
    ai: 'Pulls precedents, options, API shapes, the three ways other people solved this.',
    me: 'Kill most of it. Keep what the brief actually needs. The useful part is never the longest part.',
    proof: 'Reading the billing API this way is where the restoration amount in The Cost of Attention came from.',
  },
  {
    title: 'Structure before pixels',
    ai: 'Drafts the PRD and the state list once I have given it the information architecture.',
    me: 'Decide the IA, the states, and what is phase one versus phase two. Scope is a design decision, not a project-management one.',
  },
  {
    title: 'Prototype in code',
    ai: 'Scaffolds. Boilerplate, wiring, the first version of anything repetitive.',
    me: 'The interaction, the hierarchy, and the cuts. A working thing settles an argument faster than a mock does, so I argue with working things.',
  },
  {
    title: 'Draw to a definition',
    ai: 'Generates the character and the loops on this site, frame by frame, to a definition I wrote.',
    me: 'The definition, the direction, which frames survive. I can draw; I chose generation for speed, and I say so rather than hide it.',
  },
];

const rules = [
  ['Deadline before clarity', 'I fix the analysis window first, then commit to the best option available inside it. Waiting for full clarity is a decision too, usually the expensive one.'],
  ['Cost before preference', 'My preferred interaction gets priced by engineering before it gets defended. If the price is fair, I phase it.'],
  ['Honest status', 'Shipped, in progress, proposed. Three words, never blurred. A portfolio that invents uplift is a portfolio I cannot defend in a room.'],
];

export function WithAI() {
  return (
    <section id="with-ai" className="border-t border-line py-14">
      <Reveal><SectionLabel number="04" aside="The tool changes. Who decides does not.">How I work with AI</SectionLabel></Reveal>

      <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
        {/* left: clip + rules */}
        <div className="grid content-start gap-8">
          <Reveal><Clip name="3d-play" label="Gaurav juggling a cube, a sphere and a small terrain tile" className="mx-auto size-56 lg:mx-0 lg:size-64" /></Reveal>
          <Reveal stagger={0.1} className="grid gap-5">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-ink-2">How I decide</p>
            {rules.map(([t, b]) => (
              <div key={t} className="border-t border-line pt-4">
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-2">{b}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* right: steps with the AI / me split */}
        <Reveal stagger={0.09} className="grid">
          <div className="hidden grid-cols-[32px_1fr_1fr] gap-6 border-b border-line pb-3 text-[11px] font-semibold uppercase tracking-[.16em] text-ink-2 sm:grid">
            <span />
            <span>What the model does</span>
            <span>What I decide</span>
          </div>
          {steps.map((s, i) => (
            <div key={s.title} className="grid gap-x-6 gap-y-2 border-b border-line py-6 sm:grid-cols-[32px_1fr_1fr]">
              <span className="text-xs text-ink-3 tabular-nums sm:row-span-3 sm:pt-1">0{i + 1}</span>
              <h3 className="font-semibold sm:col-span-2">{s.title}</h3>
              <p className="text-sm leading-6 text-ink-2 sm:col-start-2"><span className="mr-2 inline-block rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-3 sm:hidden">AI</span>{s.ai}</p>
              <p className="text-sm leading-6 sm:col-start-3"><span className="mr-2 inline-block rounded border border-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider sm:hidden">Me</span>{s.me}</p>
              {s.proof && <p className="text-[13px] leading-6 text-ink-3 sm:col-span-2 sm:col-start-2">↳ {s.proof}</p>}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
