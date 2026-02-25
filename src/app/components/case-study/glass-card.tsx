import type { CSSProperties, ReactNode } from 'react';

/* ── Glass card wrapper ──────────────────────────────────────────────
   Uses CSS custom properties set by each case study page:
     --cpq-glass, --cpq-glass-border, --cpq-glass-hover
   ──────────────────────────────────────────────────────────────────── */

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className = '', hover = false, style: extraStyle }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        backgroundColor: hover ? 'var(--cpq-glass-hover)' : 'var(--cpq-glass)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--cpq-glass-border)',
        backdropFilter: 'blur(12px)',
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}
