import { Layers } from 'lucide-react';

/* ── Wireframe / hi-fi screenshot card ─────────────────────────────── */

interface WireframeCardProps {
  src: string;
  label: string;
  caption: string;
  accent?: string;
  accentDim?: string;
}

export function WireframeCard({
  src,
  label,
  caption,
  accent = '#00A87C',
  accentDim = 'var(--cpq-accent-dim)',
}: WireframeCardProps) {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden group"
      style={{
        backgroundColor: 'var(--cpq-glass)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--cpq-glass-border)',
      }}
    >
      {/* Label bar */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid var(--cpq-glass-border)' }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: accentDim }}>
          <Layers size={10} style={{ color: accent }} />
        </div>
        <span className="font-['Bebas_Neue',sans-serif] text-[10px] tracking-[3px] text-white/40">{label}</span>
      </div>
      {/* Image container with warm paper tint */}
      <div className="relative bg-[#F8F4EF]">
        <img
          src={src}
          alt={caption}
          className="w-full block transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ display: 'block' }}
        />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)' }}
        />
      </div>
      {/* Caption */}
      <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--cpq-glass-border)' }}>
        <p className="font-['Cambay',sans-serif] text-[12px] text-white/40 leading-[1.5]">{caption}</p>
      </div>
    </div>
  );
}