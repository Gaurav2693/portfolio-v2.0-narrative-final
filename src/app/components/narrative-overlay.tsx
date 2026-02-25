/* ═══════════════════════════════════════════════════════════════════════
   NARRATIVE OVERLAY — Deep editorial views for My Personal & Prototyping
   ─────────────────────
   Long-scroll magazine-style narratives that overlay the room artwork.
   Triggered by ExpandButton in the accordion compact views.
   Accordion stays visible alongside. Rebuilt v3.
   ═══════════════════════════════════════════════════════════════════════ */

import { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, X, Bike, Eye, BookOpen, Route, Wrench, Layers, Terminal, CheckCircle2, Gamepad2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

/* ── Image URLs ──────────────────────────────────────────────────────── */
const IMG = {
  ladakh: 'https://images.unsplash.com/photo-1720908673795-5316978cb1e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWRha2glMjBjaGFuZ3RoYW5nJTIwdmFsbGV5JTIwbW91bnRhaW4lMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzcxOTQ4OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  highway: 'https://images.unsplash.com/photo-1648490794049-e0942ba6429f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGhpZ2h3YXklMjBsb25nJTIwcm9hZCUyMHNvbGl0YXJ5JTIwam91cm5leXxlbnwxfHx8fDE3NzE5NDg5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  moto: 'https://images.unsplash.com/photo-1761048802175-755861239548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwbW91bnRhaW4lMjBwYXNzJTIwaGltYWxheWElMjByb2FkfGVufDF8fHx8MTc3MTk0ODkxMHww&ixlib=rb-4.1.0&q=80&w=1080',
  books: 'https://images.unsplash.com/photo-1643050079091-1d4a51e07ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbW9vZHklMjBib29rcyUyMHJlYWRpbmclMjBwaGlsb3NvcGh5JTIwc3RhY2t8ZW58MXx8fHwxNzcxOTQ4OTExfDA&ixlib=rb-4.1.0&q=80&w=1080',
  city: 'https://images.unsplash.com/photo-1767392057263-999a31a38f66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGNpdHklMjBzdHJlZXQlMjBuaWdodCUyMG1vb2R5JTIwYXRtb3NwaGVyaWN8ZW58MXx8fHwxNzcxOTQ4OTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  code: 'https://images.unsplash.com/photo-1753998943228-73470750c597?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RlJTIwZWRpdG9yJTIwZGFyayUyMHNjcmVlbiUyMGRldmVsb3BlciUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5NDg5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  sketch: 'https://images.unsplash.com/photo-1611079830811-865ff4428d17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW4lMjBwYXBlciUyMHNrZXRjaCUyMHdpcmVmcmFtZSUyMG5vdGVib29rJTIwZGVzaWdufGVufDF8fHx8MTc3MTk0ODkxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  gaming: 'https://images.unsplash.com/photo-1632854285149-9bfbf80f0c28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBzZXR1cCUyMGRhcmslMjByb29tJTIwY29udHJvbGxlciUyMG1vb2R5fGVufDF8fHx8MTc3MTk0OTY1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
};

/* ── Shared sub-components ───────────────────────────────────────────── */

function NarrativeDivider({ color = 'rgba(255,255,255,0.06)' }: { color?: string }) {
  return <div className="w-full h-px my-[24px]" style={{ background: color }} />;
}

function PullQuote({ text, color = '#40F0AA' }: { text: string; color?: string }) {
  return (
    <div className="relative pl-[20px] my-[28px]">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
        style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
      />
      <p
        className="font-['Cambay',sans-serif] italic text-[15px] leading-[24px]"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        {text}
      </p>
    </div>
  );
}

function SectionLabel({ text, color = '#7A7A90' }: { text: string; color?: string }) {
  return (
    <span
      className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[3px] uppercase block mb-[10px]"
      style={{ color }}
    >
      {text}
    </span>
  );
}

function NarrativeImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="my-[24px] rounded-[12px] overflow-hidden relative">
      <ImageWithFallback
        src={src}
        alt={alt}
        className="w-full h-[200px] object-cover"
        style={{ filter: 'brightness(0.7) saturate(0.85)' }}
      />
      {/* Dark gradient overlay for mood */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(14,14,22,0.7) 0%, transparent 50%)' }}
      />
      {caption && (
        <p
          className="absolute bottom-[10px] left-[14px] right-[14px] font-['Cambay',sans-serif] text-[10px] leading-[15px]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-['Cambay',sans-serif] text-[13.5px] leading-[22px] mb-[16px]"
      style={{ color: 'rgba(255,255,255,0.48)' }}
    >
      {children}
    </p>
  );
}

function SectionHeading({ children, color = '#ffffff' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="font-['Bebas_Neue',sans-serif] text-[24px] leading-[22px] tracking-[1px] block mb-[14px]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function IconChip({ icon: Icon, label, color }: { icon: typeof Bike; label: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-[8px] mr-[6px] mb-[6px]"
      style={{ background: `${color}10`, border: `1px solid ${color}18` }}
    >
      <Icon size={11} color={color} strokeWidth={1.5} />
      <span
        className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[1px]"
        style={{ color: `${color}90` }}
      >
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════ */

function ScrollProgress({ scrollRef, color = '#40F0AA' }: { scrollRef: React.RefObject<HTMLDivElement | null>; color?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setProgress(scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [scrollRef]);

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] z-10">
      <div
        className="h-full rounded-full"
        style={{
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, transparent, ${color})`,
          boxShadow: `0 0 12px ${color}40`,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HEADER BAR — shared between both narratives
   ═══════════════════════════════════════════════════════════════════════ */

function NarrativeHeader({ title, onBack, onClose }: { title: string; onBack: () => void; onClose: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-[24px] py-[14px] shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-[8px] cursor-pointer group"
        style={{ background: 'none', border: 'none' }}
      >
        <ArrowLeft size={14} color="#7A7A90" strokeWidth={1.5} style={{ transition: 'transform 0.2s', }} />
        <span
          className="font-['Cambay',sans-serif] text-[12px]"
          style={{ color: '#7A7A90', transition: 'color 0.2s' }}
        >
          Back
        </span>
      </button>

      <span
        className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[3px] uppercase"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        {title}
      </span>

      <button
        onClick={onClose}
        className="flex items-center justify-center size-[28px] rounded-full cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
      >
        <X size={13} color="#7A7A90" strokeWidth={1.5} />
      </button>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   MY PERSONAL — Deep Narrative
   ═══════════════════════════════════════════════════════════════════════ */

function MyPersonalNarrative({ onClose }: { onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full">
      <ScrollProgress scrollRef={scrollRef} color="#E8501A" />
      <NarrativeHeader title="My Personal" onBack={onClose} onClose={onClose} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-minimal">
        <div className="px-[28px] pt-[24px] pb-[48px] max-w-[620px] mx-auto">

          {/* ── Hero ──────────────────────────────────────────────── */}
          <span
            className="font-['Bebas_Neue',sans-serif] text-[42px] leading-[36px] tracking-[1px] block mb-[8px]"
            style={{ color: '#ffffff' }}
          >
            Beyond the Screen
          </span>
          <p
            className="font-['Cambay',sans-serif] text-[14px] leading-[22px] mb-[20px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            I am not constantly creating. I am usually processing.
          </p>

          <NarrativeImage
            src={IMG.ladakh}
            alt="Changthang Valley, Ladakh"
            caption="Changthang Valley, Ladakh — somewhere above 17,000 ft"
          />

          {/* ── Chapter 1: The Ride ──────────────────────────────── */}
          <SectionLabel text="Chapter 01" color="#E8501A" />
          <SectionHeading>The Ride</SectionHeading>

          <BodyText>
            I ride long stretches, sometimes alone. There is something about an empty highway —
            helmet on, engine steady — that strips away every layer of overthinking. The world
            reduces to what is immediately in front of you. Road. Horizon. Decisions.
          </BodyText>

          <NarrativeImage
            src={IMG.moto}
            alt="Mountain pass motorcycle"
            caption="Himalayan passes — where decisions are final"
          />

          <BodyText>
            Ladakh. Changthang Valley. When I reached the highest motorable pass in the world,
            I realized something that stayed: the end result matters, but how you get there
            matters more. That is where the memories live. The stories we tell ourselves
            are built on those memories — not the destination photo, but the switchback at
            4 AM when you were not sure the road continued.
          </BodyText>

          <PullQuote
            text="There is a moment when speed stabilizes and everything goes quiet. Not physically quiet — mentally quiet. Alert, but not anxious. Focused, but not forced."
            color="#E8501A"
          />

          <BodyText>
            Design, at its best, feels exactly like that. Stable momentum. Controlled speed.
            Clarity without noise. Not the frantic energy of a deadline crunch, but the
            measured confidence of knowing you have read the road correctly.
          </BodyText>

          <BodyText>
            Riding taught me risk calibration — not avoidance, calibration. You learn when to
            lean into a curve and when to brake before it. That instinct translates directly
            into design decisions: when to push a concept further, when to pull back,
            when the data says one thing but the terrain says another.
          </BodyText>

          <NarrativeDivider color="rgba(232,80,26,0.15)" />

          {/* ── Chapter 2: The Observer ──────────────────────────── */}
          <SectionLabel text="Chapter 02" color="#40F0AA" />
          <SectionHeading>The Observer</SectionHeading>

          <NarrativeImage
            src={IMG.city}
            alt="City streets at night"
            caption="Observing patterns where nobody is performing"
          />

          <BodyText>
            I grew up on military campuses. Not one — several, across the country. Every few
            years, a new city, a new school, a new social circle to decode. That kind of
            upbringing teaches you to read rooms fast, understand hierarchies instinctively,
            and value structure not as rigidity but as a foundation that makes freedom possible.
          </BodyText>

          <BodyText>
            System discipline was the water I swam in. Everything had a protocol. Everything
            had a reason. And when you grow up inside that, you start seeing systems everywhere —
            in how cities are laid out, in how people move through a market, in how a
            conversation flows or collapses.
          </BodyText>

          <PullQuote
            text="Coming out of the safety net of engineering taught me ownership. Nobody structures your path for you."
            color="#40F0AA"
          />

          <BodyText>
            So I observe. Cities, people, patterns. Not creating content. Not documenting for
            an audience. Usually processing something. The most useful design insights I have
            had came from watching how real people behave when they think nobody is watching —
            how they navigate a crowded station, how they hesitate before a door, how they
            scan a menu. None of that happens in a usability lab.
          </BodyText>

          <BodyText>
            Small circle, not loud social scenes. I think a lot about systems, life trajectories,
            long-term bets. The kind of thinking that does not look productive but produces
            the clearest decisions six months later.
          </BodyText>

          <NarrativeDivider color="rgba(64,240,170,0.15)" />

          {/* ── Chapter 3: The Reader ────────────────────────────── */}
          <SectionLabel text="Chapter 03" color="#7C3AED" />
          <SectionHeading>The Reader</SectionHeading>

          <NarrativeImage
            src={IMG.books}
            alt="Books stacked in moody light"
            caption="Design, philosophy, psychology, strategy, fiction"
          />

          <BodyText>
            I read across lanes — design, philosophy, psychology, strategy, fiction, non-fiction.
            Not to accumulate knowledge as a trophy, but because different disciplines teach
            you to see the same problem from angles your own field never would.
          </BodyText>

          <div className="my-[20px] flex flex-col gap-[14px]">
            {[
              {
                title: "The Hitchhiker's Guide to the Galaxy",
                author: 'Douglas Adams',
                insight: 'For the absurdity. For the reminder that the universe does not care about your deadline, and that the best response to chaos is curiosity mixed with a towel.',
                color: '#FFB033',
              },
              {
                title: 'Meditations',
                author: 'Marcus Aurelius',
                insight: 'For the discipline. An emperor writing private notes to himself about controlling what he can and releasing what he cannot. The original design system for a human mind.',
                color: '#40F0AA',
              },
              {
                title: 'Sherlock Holmes',
                author: 'Arthur Conan Doyle',
                insight: 'For the pattern recognition. For the practice of seeing what everyone looks at but nobody notices. The gap between observation and deduction is where design lives.',
                color: '#E8501A',
              },
            ].map((book) => (
              <div
                key={book.title}
                className="relative pl-[16px] py-[12px] pr-[14px] rounded-[10px]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div
                  className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-full"
                  style={{ background: `${book.color}40` }}
                />
                <span
                  className="font-['Cambay',sans-serif] text-[13px] block"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {book.title}
                </span>
                <span
                  className="font-['Cambay',sans-serif] text-[11px] block mb-[6px]"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {book.author}
                </span>
                <span
                  className="font-['Cambay',sans-serif] text-[12px] leading-[19px] block"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {book.insight}
                </span>
              </div>
            ))}
          </div>

          <BodyText>
            I write when something feels unresolved in my head. Not for an audience — to think
            clearly. Writing is debugging for thoughts. The act of forcing a vague idea into
            sentences reveals whether you actually understand it or were just comfortable
            with the blur.
          </BodyText>

          <NarrativeDivider color="rgba(124,58,237,0.15)" />

          {/* ── Chapter 4: The Player ────────────────────────────── */}
          <SectionLabel text="Chapter 04" color="#3B82F6" />
          <SectionHeading>The Player</SectionHeading>

          <NarrativeImage
            src={IMG.gaming}
            alt="Gaming setup in dark room"
            caption="Where downtime becomes pattern training"
          />

          <BodyText>
            I game. A lot. Not casually — with intent. RPGs, third-person shooters, first-person
            shooters. The Witcher. Ghost of Tsushima. God of War. Uncharted. The kind of games
            where the world-building is as important as the mechanics, where every environment
            tells a story the dialogue never mentions.
          </BodyText>

          <BodyText>
            RPGs taught me something designers rarely talk about: the power of pacing. A great
            RPG does not dump its entire world on you in the first hour. It reveals just enough
            to make you curious, gates complexity behind progression, and trusts you to discover
            the rest. That is information architecture. That is onboarding. That is exactly what
            most enterprise products get catastrophically wrong.
          </BodyText>

          <PullQuote
            text="Every game is a UX case study disguised as entertainment. The ones that survive are the ones where the system respects the player."
            color="#3B82F6"
          />

          <BodyText>
            Shooters — the tactical ones — are about spatial awareness and split-second
            prioritization. What is the threat? Where is the cover? What do I sacrifice to gain
            position? Those are the same trade-offs in any complex interface: what do you show,
            what do you hide, what costs the user if they miss it?
          </BodyText>

          {/* Game genre cards */}
          <div className="my-[20px] flex flex-col gap-[10px]">
            {[
              {
                genre: 'RPG',
                lesson: 'Pacing, world-building, progressive disclosure. The system reveals itself as the player earns context.',
                color: '#3B82F6',
              },
              {
                genre: 'TPS / FPS',
                lesson: 'Spatial awareness, threat prioritization, split-second decisions under constraints. Interface hierarchy under pressure.',
                color: '#E8501A',
              },
              {
                genre: 'FIFA',
                lesson: 'Real-time strategy with imperfect control. Reading patterns, anticipating movement, adjusting mid-play. No undo button.',
                color: '#40F0AA',
              },
            ].map((g) => (
              <div
                key={g.genre}
                className="relative pl-[16px] py-[10px] pr-[14px] rounded-[10px]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div
                  className="absolute left-0 top-[8px] bottom-[8px] w-[3px] rounded-full"
                  style={{ background: `${g.color}40` }}
                />
                <span
                  className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[2px] block mb-[4px]"
                  style={{ color: `${g.color}90` }}
                >
                  {g.genre}
                </span>
                <span
                  className="font-['Cambay',sans-serif] text-[12px] leading-[19px] block"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {g.lesson}
                </span>
              </div>
            ))}
          </div>

          <BodyText>
            And FIFA — that is its own category. Real-time strategy with imperfect control.
            You cannot pause. You cannot undo. You read the field, anticipate the run, and
            commit. Sometimes you are wrong. The best players are not the ones who never lose
            possession — they are the ones who recover fastest. That mentality translates
            directly into how I handle design reviews, stakeholder feedback, and the moment
            a prototype breaks in front of people.
          </BodyText>

          <BodyText>
            People underestimate what gaming teaches. Pattern recognition under time pressure.
            Systems thinking through play. The instinct to explore before you exploit. Every
            well-designed game is a masterclass in UX — the ones that survive are the ones
            where the system respects the player enough to let them fail intelligently.
          </BodyText>

          <NarrativeDivider color="rgba(59,130,246,0.15)" />

          {/* ── Chapter 5: Engineered Experience ─────────────────── */}
          <SectionLabel text="Chapter 05" color="#FFB033" />
          <SectionHeading>Engineered Experience</SectionHeading>

          <BodyText>
            Mechanical engineering exposure made me care about systems, not surfaces. A machine
            does not work because it looks right — it works because every part is in the right
            relationship with every other part. Tolerance, load, friction, flow. The invisible
            architecture determines everything.
          </BodyText>

          <BodyText>
            So I do not approach design as decoration. I approach it as engineered experience.
            Every interaction has a load path. Every layout has structural integrity or it does not.
            The visual layer is the surface of a much deeper system, and if the system is
            broken, no amount of polish will save it.
          </BodyText>

          <PullQuote
            text="The tools you work with should feel as intentional as the work you make."
            color="#FFB033"
          />

          <NarrativeImage
            src={IMG.highway}
            alt="Long empty highway"
            caption="Stable momentum. Controlled speed. Clarity without noise."
          />

          {/* ── Closing ──────────────────────────────────────────── */}
          <NarrativeDivider />

          <div className="flex flex-wrap gap-[4px] mb-[20px]">
            <IconChip icon={Bike} label="RIDER" color="#E8501A" />
            <IconChip icon={Eye} label="OBSERVER" color="#40F0AA" />
            <IconChip icon={BookOpen} label="READER" color="#7C3AED" />
            <IconChip icon={Gamepad2} label="PLAYER" color="#3B82F6" />
            <IconChip icon={Route} label="SYSTEMS" color="#FFB033" />
          </div>

          <p
            className="font-['Cambay',sans-serif] italic text-[13px] leading-[20px]"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            &ldquo;Funny with people I know. Obsessively ambitious on the inside.&rdquo;
            <br />
            Controlled intensity with dry humor underneath.
          </p>

          {/* Bottom spacer for comfortable scroll end */}
          <div className="h-[40px]" />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   PROTOTYPING — Deep Narrative
   ═══════════════════════════════════════════════════════════════════════ */

function PrototypingNarrative({ onClose }: { onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full">
      <ScrollProgress scrollRef={scrollRef} color="#40F0AA" />
      <NarrativeHeader title="Prototyping" onBack={onClose} onClose={onClose} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-minimal">
        <div className="px-[28px] pt-[24px] pb-[48px] max-w-[620px] mx-auto">

          {/* ── Hero ──────────────────────────────────────────────── */}
          <span
            className="font-['Bebas_Neue',sans-serif] text-[42px] leading-[36px] tracking-[1px] block mb-[8px]"
            style={{ color: '#ffffff' }}
          >
            How I Build
          </span>
          <p
            className="font-['Cambay',sans-serif] text-[14px] leading-[22px] mb-[20px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            I do not treat tools as identity. They are execution mediums.
          </p>

          <NarrativeImage
            src={IMG.sketch}
            alt="Sketches and wireframes on paper"
            caption="Where every idea starts — before it earns a pixel"
          />

          {/* ── Phase 1: THINK ───────────────────────────────────── */}
          <SectionLabel text="Phase 01 — Think" color="#7A7A90" />
          <SectionHeading>Before the Screen</SectionHeading>

          <BodyText>
            Pen and paper when thinking gets messy. Miro when the system needs mapping.
            I do not rush to a screen. The problem has to have shape before I touch a tool.
          </BodyText>

          <BodyText>
            There is a discipline in refusing to design before you understand. Most design
            processes start with wireframes. Mine starts with questions. What is the system?
            Who are the actors? Where does the information flow break? What does the user
            already believe before they arrive?
          </BodyText>

          <PullQuote
            text="The problem decides what it needs, and I meet it there. Not with the tool I am most comfortable with, but with the tool that reveals the answer fastest."
            color="#7A7A90"
          />

          <BodyText>
            A notebook margin. A whiteboard. A sticky note on my desk. The goal at this
            stage is never fidelity — it is forcing the idea into the physical world before
            it evaporates. Ideas in your head feel complete. On paper, they reveal every gap.
          </BodyText>

          <NarrativeDivider color="rgba(122,122,144,0.15)" />

          {/* ── Phase 2: DESIGN ──────────────────────────────────── */}
          <SectionLabel text="Phase 02 — Design" color="#E8501A" />
          <SectionHeading>Structure and Flow</SectionHeading>

          <BodyText>
            Figma, daily. It is the environment where structure becomes visible — where
            component systems take shape, where flows reveal their logic or expose their
            contradictions. When stakeholders need to see it, when the system needs spatial
            reasoning, when pixel decisions start to matter.
          </BodyText>

          <BodyText>
            Figma Make for structured exploration — when I need to think through interaction,
            not just layout. The difference between a static comp and an interactive prototype
            is the difference between describing a place and walking through it. Static frames
            lie. They show you the happy path and hide every edge case.
          </BodyText>

          {/* Tool stack visualization */}
          <div
            className="my-[24px] p-[18px] rounded-[12px]"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span
              className="font-['JetBrains_Mono',monospace] text-[9px] tracking-[2px] block mb-[12px]"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              DAILY STACK
            </span>
            <div className="flex flex-wrap gap-[4px]">
              {[
                { label: 'FIGMA', color: '#E8501A' },
                { label: 'FIGMA MAKE', color: '#E8501A' },
                { label: 'VS CODE', color: '#40F0AA' },
                { label: 'REACT', color: '#40F0AA' },
                { label: 'NEXT.JS', color: '#40F0AA' },
                { label: 'TAILWIND', color: '#40F0AA' },
                { label: 'VERCEL', color: '#7C3AED' },
                { label: 'GITHUB', color: '#7C3AED' },
                { label: 'MIRO', color: '#FFB033' },
                { label: 'PEN + PAPER', color: '#FFB033' },
              ].map((t) => (
                <span
                  key={t.label}
                  className="font-['JetBrains_Mono',monospace] text-[8px] tracking-[1.5px] px-[8px] py-[4px] rounded-[6px]"
                  style={{ color: `${t.color}80`, background: `${t.color}0A`, border: `1px solid ${t.color}15` }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          <PullQuote
            text="But Figma alone never tells you if something actually works. A prototype that does not move under real data, real latency, and real fingers is a hypothesis pretending to be an answer."
            color="#E8501A"
          />

          <NarrativeDivider color="rgba(232,80,26,0.15)" />

          {/* ── Phase 3: BUILD ───────────────────────────────────── */}
          <SectionLabel text="Phase 03 — Build" color="#40F0AA" />
          <SectionHeading>Code as Proof</SectionHeading>

          <NarrativeImage
            src={IMG.code}
            alt="Code editor dark workspace"
            caption="Where design meets reality — and reality wins"
          />

          <BodyText>
            VS Code. React. Next.js. Tailwind. Vercel for deployment. GitHub for versioning.
            I write less code than I debug and troubleshoot — but enough to ship live
            environments, control interactions, prototype system logic, and understand
            the constraints that make or break a design.
          </BodyText>

          <BodyText>
            There is an honesty in code that mockups do not have. A Figma frame will let
            you overlap three elements and call it a design. Code will not. Code forces you
            to answer: what happens when this data is missing? When the screen is half the
            width? When the API takes four seconds? When the user does the thing you
            did not plan for?
          </BodyText>

          <PullQuote
            text="I do not just hand off. I validate. That difference matters."
            color="#40F0AA"
          />

          <BodyText>
            The gap between &ldquo;designed&rdquo; and &ldquo;built&rdquo; is where most
            products lose their soul. Details that were intentional in the comp become
            &ldquo;nice to have&rdquo; in development. Interactions that were the whole
            point get scoped down to a fade. I stay in that gap because someone has to.
          </BodyText>

          <NarrativeDivider color="rgba(64,240,170,0.15)" />

          {/* ── The Portfolio as Proof ─────────────────────────── */}
          <SectionLabel text="Proof" color="#40F0AA" />
          <SectionHeading>The Medium Is the Message</SectionHeading>

          <BodyText>
            The most interesting prototype I have built is the thing you are looking at
            right now. This portfolio. Not because it is flashy — because the format itself
            demonstrates the thinking before anyone reads a single case study.
          </BodyText>

          <div
            className="my-[20px] flex flex-col gap-[10px]"
          >
            {[
              { label: 'Information hierarchy', desc: 'Rooms as narrative containers, not decoration' },
              { label: 'Interaction thinking', desc: 'Every click, scroll, and transition is intentional' },
              { label: 'Narrative sequencing', desc: 'You discover the work in an order that builds context' },
              { label: 'Emotional pacing', desc: 'The rooms breathe — they are not trying to impress you constantly' },
              { label: 'Technical execution', desc: 'React, Motion, Tone.js, isometric rendering — built, not assembled' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-[10px]">
                <CheckCircle2
                  size={13}
                  color="#40F0AA"
                  strokeWidth={1.5}
                  className="shrink-0 mt-[4px]"
                  style={{ opacity: 0.5 }}
                />
                <div>
                  <span
                    className="font-['Cambay',sans-serif] text-[12.5px] block"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="font-['Cambay',sans-serif] text-[11.5px] block"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <NarrativeDivider />

          {/* ── Closing ──────────────────────────────────────────── */}
          <SectionLabel text="Signal" color="#40F0AA" />

          <BodyText>
            This portfolio is not just for a job. It is driven by three things: proof of
            capability — not screenshots, but thinking. Control of narrative — I do not want
            my work reduced to thumbnails. And personal standard — I want something that
            represents the tier I am aiming for.
          </BodyText>

          <PullQuote
            text="It is not just a portfolio. It is a calibration exercise."
            color="#40F0AA"
          />

          {/* Live build badge */}
          <div className="flex items-center gap-[8px] mt-[24px]">
            <div
              className="rounded-full"
              style={{
                width: 7,
                height: 7,
                background: '#40F0AA',
                boxShadow: '0 0 10px #40F0AA50, 0 0 20px #40F0AA20',
              }}
            />
            <span
              className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[3px]"
              style={{ color: '#40F0AA70' }}
            >
              LIVE BUILD
            </span>
          </div>

          <div className="flex flex-wrap gap-[4px] mt-[16px]">
            <IconChip icon={Wrench} label="THINK" color="#7A7A90" />
            <IconChip icon={Layers} label="DESIGN" color="#E8501A" />
            <IconChip icon={Terminal} label="BUILD" color="#40F0AA" />
          </div>

          {/* Bottom spacer */}
          <div className="h-[40px]" />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT — Narrative Overlay Container
   ═══════════════════════════════════════════════════════════════════════ */

export type NarrativeType = 'my-personal' | 'prototyping' | null;

export default function NarrativeOverlay({
  activeNarrative,
  onClose,
}: {
  activeNarrative: NarrativeType;
  onClose: () => void;
}) {
  if (!activeNarrative) return null;

  return (
    <motion.div
      key={activeNarrative}
      className="absolute z-20 rounded-[20px] overflow-hidden"
      style={{
        left: 340,
        top: 20,
        right: 20,
        bottom: 20,
        background: 'linear-gradient(165deg, rgba(14,14,22,0.96) 0%, rgba(10,10,18,0.98) 40%, rgba(12,12,20,0.97) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        contain: 'strict',
      }}
      initial={{ opacity: 0, x: 40, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {activeNarrative === 'my-personal' ? (
        <MyPersonalNarrative onClose={onClose} />
      ) : (
        <PrototypingNarrative onClose={onClose} />
      )}
    </motion.div>
  );
}