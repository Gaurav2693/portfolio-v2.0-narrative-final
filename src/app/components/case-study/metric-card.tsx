import { motion } from 'motion/react';
import type { ElementType } from 'react';
import { GlassCard } from './glass-card';

/* ── Big metric card for impact section ────────────────────────────── */

interface MetricCardProps {
  value: string;
  label: string;
  icon: ElementType;
  delay?: number;
  attribution?: string;
  accent?: string;
  accentDim?: string;
}

export function MetricCard({
  value,
  label,
  icon: Icon,
  delay = 0,
  attribution,
  accent = '#00A87C',
  accentDim = 'var(--cpq-accent-dim)',
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard className="text-center py-8">
        <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: accentDim }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <div className="font-['Bebas_Neue',sans-serif] text-[42px] tracking-[1px] mb-1" style={{ color: accent }}>{value}</div>
        <div className="font-['Cambay',sans-serif] text-[13px] text-white/50">{label}</div>
        {attribution && <div className="font-['Cambay',sans-serif] text-[10px] text-white/20 mt-2 italic">{attribution}</div>}
      </GlassCard>
    </motion.div>
  );
}