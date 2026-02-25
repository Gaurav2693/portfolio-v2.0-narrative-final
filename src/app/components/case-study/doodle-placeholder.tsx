import { Layers } from 'lucide-react';

/* ── Placeholder for doodle slots not yet illustrated ──────────────── */

interface DoodlePlaceholderProps {
  label: string;
  aspect?: string;
  hint?: string;
  accent?: string;
  accentDim?: string;
}

export function DoodlePlaceholder({
  label,
  aspect = '16/9',
  hint,
  accent = '#00A87C',
  accentDim = 'var(--cpq-accent-dim)',
}: DoodlePlaceholderProps) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3"
      style={{
        aspectRatio: aspect,
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015), rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
        border: `2px dashed ${accent}33`,
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: accentDim }}>
        <Layers size={20} style={{ color: accent }} />
      </div>
      <p className="font-['Bebas_Neue',sans-serif] text-[14px] tracking-[3px] text-white/40">{label}</p>
      {hint && <p className="font-['Cambay',sans-serif] text-[11px] text-white/25 max-w-[280px] text-center">{hint}</p>}
    </div>
  );
}
