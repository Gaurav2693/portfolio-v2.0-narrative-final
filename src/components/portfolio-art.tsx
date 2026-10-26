import type { CSSProperties } from 'react';
import { asset } from '@/lib/assets';
export function PortfolioArt({ crop, label, className = '' }: { crop: [number, number, number, number]; label: string; className?: string }) {
  const [x,y,w,h] = crop;
  return <span role="img" aria-label={label} className={`relative block overflow-hidden art ${className}`} style={{ aspectRatio: `${w}/${h}` }}><img src={asset('website-assets.png')} alt="" draggable={false} style={{ position:'absolute',maxWidth:'none',width:`${1536/w*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%` } as CSSProperties}/></span>;
}
