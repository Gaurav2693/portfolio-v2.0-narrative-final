export function HeroThought() {
  return <div data-hero="thought" className="pointer-events-none invisible absolute z-20 left-[27%] top-2 h-[100px] w-[190px] origin-bottom-left rounded-[43%_46%_38%_48%] bg-paper opacity-0" aria-hidden="true">
    <svg viewBox="0 0 190 100" className="absolute inset-0 size-full overflow-visible fill-none stroke-ink" strokeWidth="1.4"><path data-hero="outline" pathLength="1" d="M20 77C-9 61 3 27 25 20C46 -1 79 5 99 8C136 -2 181 15 184 42C203 69 169 93 142 91C96 106 47 97 20 77Z"/></svg>
    <svg data-hero="mess" viewBox="0 0 190 100" className="absolute inset-0 size-full fill-none stroke-ink" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M45 30Q125 4 144 58T63 57Q16 81 63 25M55 38L132 61M120 30Q53 88 132 75" strokeDasharray="3 4"/>
      <rect x="35" y="23" width="29" height="18" rx="2" transform="rotate(-12 50 32)" fill="var(--paper)"/>
      <rect x="116" y="22" width="32" height="19" rx="2" transform="rotate(9 132 31)" fill="var(--paper)"/>
      <rect x="75" y="60" width="30" height="19" rx="2" transform="rotate(-7 90 70)" fill="var(--paper)"/>
      <path d="m65 44 3 5 4-5m40 8 5-3-5-2M82 22q5-8 10 0t-4 8m0 6h.1"/>
    </svg>
    <svg data-hero="order" viewBox="0 0 190 100" className="invisible absolute inset-0 size-full fill-paper stroke-ink opacity-0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M95 37v14H53v12m42-12h42v12" fill="none"/>
      <rect x="76" y="17" width="38" height="21" rx="2"/><rect x="34" y="64" width="38" height="21" rx="2"/><rect x="118" y="64" width="38" height="21" rx="2"/>
      <path d="m87 27 5 4 10-8m-57 53 5 4 10-8m69 4 5 4 10-8" fill="none"/>
    </svg>
    <span className="absolute -bottom-3 left-10 size-2 rounded-full border border-ink bg-paper"/>
    <span className="absolute -bottom-6 left-8 size-1 rounded-full border border-ink bg-paper"/>
  </div>;
}
