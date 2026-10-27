import { useEffect, useRef, useState } from 'react';
import type { gsap } from 'gsap';
import { createHeroTimeline } from '@/lib/hero-timeline';
import { asset } from '@/lib/assets';

type Playback = 'loading' | 'idle' | 'playing' | 'paused' | 'reduced' | 'unavailable';
export function useHeroPerformance() {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [playback, setPlayback] = useState<Playback>('loading');
  const [ready, setReady] = useState(false);
  const autoPlayed = useRef(false);
  const isVisible = useRef(false);
  const userPaused = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    if (!root.current) return;
    let disposed = false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const image = new Image();
    const finish = new Image();
    const scene = root.current;
    timeline.current = createHeroTimeline(scene, () => setPlayback('idle'));
    const syncVisibility = () => {
      if (disposed || reduced.current || !image.complete || !image.naturalWidth || !finish.naturalWidth) return;
      const visible = isVisible.current && !document.hidden;
      if (visible && !autoPlayed.current) {
        autoPlayed.current = true;
        timeline.current?.restart();
        setPlayback('playing');
      } else if (!visible) {
        timeline.current?.pause();
      } else if (!userPaused.current && (timeline.current?.progress() ?? 1) < 1) {
        timeline.current?.resume();
        setPlayback('playing');
      }
    };
    const syncMotion = () => {
      reduced.current = media.matches;
      if (media.matches) {
        timeline.current?.pause(0);
        setPlayback('reduced');
      } else {
        setPlayback(image.naturalWidth ? 'idle' : 'loading');
        syncVisibility();
      }
    };
    image.onload = () => {
      if (disposed) return;
      if (image.naturalWidth && finish.naturalWidth) { setReady(true); syncMotion(); }
    };
    image.onerror = () => { if (!disposed) setPlayback('unavailable'); };
    finish.onload = image.onload;
    finish.onerror = image.onerror;
    image.src = asset('hero-handdrawn-frames.png');
    finish.src = asset('hero-gentle-finish.png');
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
      syncVisibility();
    }, { threshold: 0.35 });
    observer.observe(scene);
    media.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncVisibility);
    syncMotion();
    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      finish.onload = null;
      finish.onerror = null;
      observer.disconnect();
      media.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncVisibility);
      timeline.current?.revert();
      timeline.current = null;
    };
  }, []);

  const replay = () => {
    if (!ready || reduced.current) return;
    autoPlayed.current = true;
    userPaused.current = false;
    timeline.current?.restart().play(2.8);
    setPlayback('playing');
  };
  const togglePause = () => {
    if (playback === 'playing' || playback === 'idle') {
      userPaused.current = true;
      timeline.current?.pause();
      setPlayback('paused');
    } else if (playback === 'paused') {
      userPaused.current = false;
      timeline.current?.resume();
      setPlayback('playing');
    }
  };
  return { root, playback, ready, replay, togglePause };
}
