import type { ReactNode } from 'react';

/* ── Pull-quote with accent gradient bar ───────────────────────────── */

interface NarrativeQuoteProps {
  children: ReactNode;
  attribution?: string;
  accent?: string;
}

export function NarrativeQuote({ children, attribution, accent = '#00A87C' }: NarrativeQuoteProps) {
  return (
    <div className="relative pl-6 py-2 my-8">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }} />
      <p className="font-['Caladea',serif] text-[18px] text-white/70 italic leading-[1.7]">{children}</p>
      {attribution && <p className="font-['Cambay',sans-serif] text-[12px] text-white/38 mt-3 tracking-[1px]">{attribution}</p>}
    </div>
  );
}
