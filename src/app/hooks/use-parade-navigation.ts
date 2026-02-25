import { useRef, useEffect, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   USE-PARADE-NAVIGATION  —  Phase 3A Scroll Infrastructure
   ────────────────────────────────────────────────────────
   Spring-animated index navigation for a vertical depth-stack parade.

   Responsibilities:
   1. Maintains a `targetIndex` (integer, 0…count-1) that represents
      which item the user WANTS to be focused.
   2. Runs a spring-physics rAF loop that smoothly interpolates a
      `focusIndex` (float) toward `targetIndex`. This float drives
      continuous depth transforms in the visual layer.
   3. Reports a settled `activeIndex` (integer, snapped) for UI labels,
      floor rail active state, etc. — only updates after spring settles.
   4. Provides a wheel handler that advances/retreats with cooldown.
   5. Provides a `scrollTo(index)` imperative method.

   Performance contract:
   - rAF loop only runs while spring is in motion. Zero cost at rest.
   - The `focusIndex` is updated via a callback (not React state) so
     the visual layer can read it from a ref — zero React re-renders
     during animation.
   - Only `activeIndex` triggers React re-renders, and only on settle.
   ═══════════════════════════════════════════════════════════════════════ */

interface ParadeNavigationConfig {
  /** Total number of items (floors/rooms) */
  count: number;
  /** Which index to start on */
  initialIndex?: number;
  /** Spring stiffness — higher = snappier (default 0.04) */
  stiffness?: number;
  /** Spring damping — lower = more overshoot (default 0.74) */
  damping?: number;
  /** Minimum wheel delta to register as intentional scroll (default 25) */
  wheelThreshold?: number;
  /** Cooldown (ms) between wheel-driven index changes (default 900) */
  wheelCooldown?: number;
}

interface ParadeNavigationReturn {
  /** Current float focus index — continuously updated during spring. Read from ref for perf. */
  focusIndexRef: React.RefObject<number>;
  /** Settled integer index — only changes when spring finishes. Safe for React renders. */
  activeIndex: number;
  /** Integer target that the spring is moving toward */
  targetIndex: number;
  /** Navigate to a specific index (clamped) */
  goTo: (index: number) => void;
  /** Go to next item */
  goNext: () => void;
  /** Go to previous item */
  goPrev: () => void;
  /** Attach this to a container's wheel event (via ref + useEffect) */
  handleWheel: (e: WheelEvent) => void;
  /** Whether the spring is currently animating */
  isAnimating: boolean;
  /** Register a callback that fires every rAF frame during spring motion.
      The callback receives the current float focusIndex. Use this to
      drive DOM transforms without React re-renders. */
  onFrame: (cb: (focusIndex: number) => void) => void;
}

export function useParadeNavigation(config: ParadeNavigationConfig): ParadeNavigationReturn {
  const {
    count,
    initialIndex = 0,
    stiffness = 0.04,
    damping = 0.74,
    wheelThreshold = 25,
    wheelCooldown = 900,
  } = config;

  const [targetIndex, setTargetIndex] = useState(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  const focusIndexRef = useRef(initialIndex);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const frameCallbackRef = useRef<((fi: number) => void) | null>(null);
  const targetRef = useRef(initialIndex);

  // Keep targetRef in sync
  useEffect(() => { targetRef.current = targetIndex; }, [targetIndex]);

  // ── Spring animation loop ──
  useEffect(() => {
    const THRESHOLD = 0.0008;

    const tick = () => {
      const target = targetRef.current;
      const curr = focusIndexRef.current;
      const diff = target - curr;

      velocityRef.current += diff * stiffness;
      velocityRef.current *= damping;
      focusIndexRef.current += velocityRef.current;

      // Notify frame callback (DOM transforms)
      frameCallbackRef.current?.(focusIndexRef.current);

      if (Math.abs(diff) < THRESHOLD && Math.abs(velocityRef.current) < THRESHOLD) {
        // Settled
        focusIndexRef.current = target;
        velocityRef.current = 0;
        frameCallbackRef.current?.(target);
        setActiveIndex(target);
        setIsAnimating(false);
        return; // stop loop
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Only start if we're animating
    if (isAnimating) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isAnimating, stiffness, damping]);

  // ── Trigger animation when target changes ──
  const prevTargetRef = useRef(initialIndex);
  useEffect(() => {
    if (targetIndex !== prevTargetRef.current) {
      prevTargetRef.current = targetIndex;
      setIsAnimating(true);
    }
  }, [targetIndex]);

  // ── Navigation methods ──
  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(count - 1, index));
    setTargetIndex(clamped);
  }, [count]);

  const goNext = useCallback(() => {
    setTargetIndex(prev => Math.min(prev + 1, count - 1));
  }, [count]);

  const goPrev = useCallback(() => {
    setTargetIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // ── Wheel handler ──
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) return; // zoom gesture
    if (Math.abs(e.deltaY) < wheelThreshold) return; // trackpad noise
    if (wheelCooldownRef.current) return;

    e.preventDefault();

    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIdx = Math.max(0, Math.min(count - 1, targetRef.current + direction));

    if (nextIdx === targetRef.current) return;

    wheelCooldownRef.current = true;
    setTargetIndex(nextIdx);

    setTimeout(() => { wheelCooldownRef.current = false; }, wheelCooldown);
  }, [count, wheelThreshold, wheelCooldown]);

  // ── Frame callback registration ──
  const onFrame = useCallback((cb: (focusIndex: number) => void) => {
    frameCallbackRef.current = cb;
  }, []);

  return {
    focusIndexRef,
    activeIndex,
    targetIndex,
    goTo,
    goNext,
    goPrev,
    handleWheel,
    isAnimating,
    onFrame,
  };
}
