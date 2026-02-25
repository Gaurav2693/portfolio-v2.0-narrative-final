import { useEffect, useRef } from 'react';
import { useSound } from '@/app/context/sound-context';

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL INTERACTION SOUNDS — Event Delegation
   ──────────────────────────────────────────────────────────────────────
   Adds hover + click sounds to ALL interactive elements across the
   entire app via a single document-level event listener pair.

   Targets: <button>, <a>, [role="button"], [data-sound],
            .cursor-pointer, any element with an onClick.

   Exclusions:
   - Elements with [data-no-sound] are silenced
   - Throttles hover sounds to max 1 per 80ms to prevent rapid-fire
   - Click sounds are de-duplicated if the component already calls
     playClick (via a short cooldown window)
   ═══════════════════════════════════════════════════════════════════════ */

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  '[data-sound]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'summary',
  'label[for]',
].join(',');

function isInteractive(el: HTMLElement): boolean {
  // Direct match
  if (el.matches(INTERACTIVE_SELECTOR)) return true;
  // Has cursor-pointer class
  if (el.classList.contains('cursor-pointer')) return true;
  // Has inline cursor:pointer style
  if (el.style.cursor === 'pointer') return true;
  // Check computed style for cursor:pointer (throttled — only on closest ancestors)
  const computed = window.getComputedStyle(el);
  if (computed.cursor === 'pointer') return true;
  return false;
}

function findInteractiveAncestor(el: HTMLElement, depth = 4): HTMLElement | null {
  let current: HTMLElement | null = el;
  for (let i = 0; i < depth && current; i++) {
    if (current.hasAttribute('data-no-sound')) return null;
    if (isInteractive(current)) return current;
    current = current.parentElement;
  }
  return null;
}

export default function GlobalInteractionSounds() {
  const { playClick, playHover } = useSound();

  // Throttle refs
  const lastHoverTime = useRef(0);
  const lastClickTime = useRef(0);
  const lastHoveredEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const HOVER_THROTTLE = 80;  // ms between hover sounds
    const CLICK_THROTTLE = 60;  // ms between click sounds

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = findInteractiveAncestor(target);
      if (!interactive) return;

      // Don't re-trigger on the same element
      if (interactive === lastHoveredEl.current) return;
      lastHoveredEl.current = interactive;

      // Throttle
      const now = performance.now();
      if (now - lastHoverTime.current < HOVER_THROTTLE) return;
      lastHoverTime.current = now;

      playHover();
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const related = e.relatedTarget as HTMLElement | null;

      // If leaving an interactive element entirely, clear the ref
      const interactive = findInteractiveAncestor(target);
      if (interactive && interactive === lastHoveredEl.current) {
        if (!related || !interactive.contains(related)) {
          lastHoveredEl.current = null;
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = findInteractiveAncestor(target);
      if (!interactive) return;

      // Throttle to prevent double-fire with manual playClick calls
      const now = performance.now();
      if (now - lastClickTime.current < CLICK_THROTTLE) return;
      lastClickTime.current = now;

      playClick();
    };

    document.addEventListener('mouseover', onMouseOver, { passive: true, capture: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true, capture: true });
    document.addEventListener('click', onClick, { passive: true, capture: true });

    return () => {
      document.removeEventListener('mouseover', onMouseOver, true);
      document.removeEventListener('mouseout', onMouseOut, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [playClick, playHover]);

  return null; // No DOM output — pure side-effect component
}
