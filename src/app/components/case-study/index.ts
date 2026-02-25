/* ═══════════════════════════════════════════════════════════════════════
   CASE STUDY — Shared Component Library
   ─────────────────────────────────────
   Reusable primitives for FAANG-style narrative case study pages.
   Each component reads from CSS custom properties (--cpq-glass, etc.)
   set by the parent page, and accepts an optional `accent` color prop
   so different case studies can theme independently.

   Usage:
     import { GlassCard, SectionHeading, FadeIn } from '../components/case-study';
   ═══════════════════════════════════════════════════════════════════════ */

export { GlassCard } from './glass-card';
export { SectionHeading } from './section-heading';
export { FadeIn } from './fade-in';
export { MetricCard } from './metric-card';
export { NarrativeQuote } from './narrative-quote';
export { WireframeCard } from './wireframe-card';
export { DoodlePlaceholder } from './doodle-placeholder';
