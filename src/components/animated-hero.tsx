import { asset } from '@/lib/assets';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { PortfolioArt } from '@/components/portfolio-art';
import { HeroThought } from '@/components/hero-thought';
import { useHeroPerformance } from '@/hooks/use-hero-performance';

export function AnimatedHero() {
  const { root, playback, ready, replay, togglePause } = useHeroPerformance();
  const animated = ready && playback !== 'reduced' && playback !== 'unavailable';
  return <div ref={root} className="group mx-auto w-full max-w-[400px]">
    <div className="relative isolate aspect-[480/600] w-full overflow-hidden" aria-label="An illustrated Gaurav turns a tangled system into an organized diagram with a playful roundhouse kick.">
      <HeroThought/>
      <svg aria-hidden="true" viewBox="0 0 320 12" className="pointer-events-none absolute bottom-20 left-[10%] z-10 h-3 w-[80%] fill-none stroke-line"><path d="M3 7Q77 4 151 7T316 6" strokeWidth="1" strokeLinecap="round"/></svg>
      {ready && <span aria-hidden="true" className="pointer-events-none absolute bottom-10 right-0 z-10 size-32 bg-size-[200%_200%] bg-no-repeat art" style={{ backgroundImage: `url(${asset('hero-gentle-finish.png')})`, backgroundPosition: '100% 100%' }}/>}
      <span data-hero="question" aria-hidden="true" className="pointer-events-none invisible absolute left-[20%] top-[27%] text-3xl opacity-0">?</span>
      <button type="button" onClick={replay} disabled={!animated} aria-label="Replay Gaurav’s roundhouse animation" className="absolute left-[4%] bottom-16 aspect-square w-[92%] rounded-lg disabled:cursor-default">
        <span data-hero="actor" className="relative block size-full">
          {Array.from({ length: 12 }, (_, index) => <span key={index} data-hero="pose" data-frame={index} aria-hidden="true" className={`art absolute inset-0 block size-full bg-size-[400%_300%] bg-no-repeat ${animated ? '' : 'invisible'}`} style={{ backgroundImage: ready ? `url(${asset('hero-handdrawn-frames.png')})` : undefined, backgroundPosition: `${(index % 4) * (100 / 3)}% ${Math.floor(index / 4) * 50}%`, opacity: index === 0 ? 1 : 0, transform: `translate(${[-4, 0, 0, 0, -5, 0, 0, 0, 5, 4, 0, 0][index]}%, ${[0, 0, 0, 0, 3.3, 3.3, 4.5, 3.3, 7.7, 7.7, 7.7, 7.7][index]}%)` }}/>) }
          {[0, 1, 2].map(index => <span key={`finish-${index}`} data-hero="pose" data-frame={12 + index} aria-hidden="true" className={`art absolute inset-0 block size-full bg-size-[200%_200%] bg-no-repeat ${animated ? '' : 'invisible'}`} style={{ backgroundImage: ready ? `url(${asset('hero-gentle-finish.png')})` : undefined, backgroundPosition: `${(index % 2) * 100}% ${Math.floor(index / 2) * 100}%`, opacity: 0, transform: `translate(${[0, 9, 6][index]}%, 6%)` }}/>) }
          {!animated && <PortfolioArt crop={[459,123,140,232]} label="Gaurav standing with glasses, hoodie, and headphones" className="absolute bottom-0 left-1/2 w-[57%] -translate-x-1/2"/>}
        </span>
      </button>
      <span data-hero="box" aria-hidden="true" className="pointer-events-none invisible absolute left-[57%] top-[22%] flex h-6 w-8 items-center justify-center rounded-[3px] border-[1.5px] border-ink bg-paper text-sm opacity-0">?</span>
      <span data-hero="impact" aria-hidden="true" className="pointer-events-none invisible absolute right-[10%] top-[49%] opacity-0"><Sparkles size={52} strokeWidth={1}/></span>
    </div>
    <div className="relative z-30 space-y-2 bg-paper px-2 pb-3 text-center">
      <p data-hero="caption" className="min-h-14 whitespace-normal break-words py-2 text-sm leading-7 text-ink-2">Take a moment. Have a look around.</p>
      {animated && <div className="flex items-center justify-center gap-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
        <button onClick={replay} className="inline-flex min-h-9 items-center gap-2 text-xs text-ink-2 hover:text-ink"><RotateCcw size={13}/>A little chaos, on replay</button>
        {(playback === 'playing' || playback === 'paused' || playback === 'idle') && <button onClick={togglePause} aria-label={playback === 'paused' ? 'Resume animation' : 'Pause animation'} className="flex size-9 items-center justify-center text-ink-2 hover:text-ink">{playback === 'paused' ? <Play size={14}/> : <Pause size={14}/>}</button>}
      </div>}
      <span className="sr-only" role="status">{playback === 'idle' && ready ? 'Animation complete. The complicated system is now organized.' : ''}</span>
    </div>
  </div>;
}
