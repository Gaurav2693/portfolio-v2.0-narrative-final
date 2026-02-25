import { motion } from 'motion/react';

/* ── Section heading — chapter label + title + optional subtitle ──── */

interface SectionHeadingProps {
  chapter: string;
  title: string;
  subtitle?: string;
  accent?: string;
}

export function SectionHeading({ chapter, title, subtitle, accent = '#00A87C' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-10"
    >
      <div className="font-['Bebas_Neue',sans-serif] text-[11px] tracking-[5px] mb-3" style={{ color: accent }}>{chapter}</div>
      <h2 className="font-['Bebas_Neue',sans-serif] text-[36px] text-white/95 tracking-[1px] leading-[1.1] mb-2">{title}</h2>
      {subtitle && <p className="font-['Cambay',sans-serif] text-[15px] text-white/50 leading-[1.6] max-w-[640px]">{subtitle}</p>}
    </motion.div>
  );
}
