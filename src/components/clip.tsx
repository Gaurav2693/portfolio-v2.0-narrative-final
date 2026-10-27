import { useRef } from 'react';
import { asset } from '@/lib/assets';

// Looping line-art animation from /public/clips/<name>.mp4 (white background).
// The wrapper paints the page colour and isolates blending, so in dark mode the
// inverted clip's black background screens away and only the ink stays visible.
// hoverPlay: sits on its first frame and only loops while the pointer is over its parent card (.group).
export function Clip({ name, label, className = '', bg = 'bg-paper', hoverPlay = false }: { name: string; label: string; className?: string; bg?: 'bg-paper' | 'bg-panel'; hoverPlay?: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  const play = () => { v.current?.play().catch(() => {}); };
  const stop = () => { if (v.current) { v.current.pause(); v.current.currentTime = 0; } };
  return (
    <span className={`clip-wrap block isolate overflow-hidden ${bg} ${className}`} role="img" aria-label={label} onMouseEnter={hoverPlay ? play : undefined} onMouseLeave={hoverPlay ? stop : undefined}>
      <video ref={v} className="clip block size-full object-contain" src={asset(`clips/${name}.mp4`)} autoPlay={!hoverPlay} muted loop playsInline preload="auto" />
    </span>
  );
}

export const clipNames = ['3d-play', 'bicycle', 'whiteboard'] as const;
export type ClipName = (typeof clipNames)[number];
