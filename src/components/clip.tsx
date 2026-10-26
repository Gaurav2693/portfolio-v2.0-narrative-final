import { asset } from '@/lib/assets';

// Looping line-art animation from /public/clips/<name>.mp4 (white background).
// The wrapper paints the page colour and isolates blending, so in dark mode the
// inverted clip's black background screens away and only the ink stays visible.
export function Clip({ name, label, className = '', bg = 'bg-paper' }: { name: string; label: string; className?: string; bg?: 'bg-paper' | 'bg-panel' }) {
  return (
    <span className={`clip-wrap block isolate overflow-hidden ${bg} ${className}`} role="img" aria-label={label}>
      <video className="clip block size-full object-contain" src={asset(`clips/${name}.mp4`)} autoPlay muted loop playsInline preload="auto" />
    </span>
  );
}

export const clipNames = ['3d-play', 'bicycle', 'whiteboard'] as const;
export type ClipName = (typeof clipNames)[number];
