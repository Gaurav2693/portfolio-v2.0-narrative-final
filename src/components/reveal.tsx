import { useEffect, useRef, type ReactNode, type ElementType } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Wrap anything in <Reveal> and it fades/rises in when it scrolls into view.
// `stagger` animates the direct children one after another instead of the wrapper.
export function Reveal({ children, as: Tag = 'div', className = '', delay = 0, stagger, ...rest }: { children: ReactNode; as?: ElementType; className?: string; delay?: number; stagger?: number } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = stagger ? Array.from(el.children) : [el];
    targets.forEach((t) => t.classList.add('reveal'));
    const tween = gsap.to(targets, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay, stagger: stagger ?? 0,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onComplete: () => targets.forEach((t) => t.classList.add('is-in')),
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [delay, stagger]);
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
