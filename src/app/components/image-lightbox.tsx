import { useEffect, useRef, useState, useCallback } from 'react';
import { X, ZoomIn } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   IMAGE LIGHTBOX — Cinematic Gallery Viewer with Zoom Loupe
   ──────────────────────────────────────────────────────────
   Full-screen viewer with a performant zoom loupe that uses direct
   DOM manipulation (refs + CSS vars) instead of React state — zero
   re-renders during mouse tracking for buttery-smooth 60fps.

   The loupe shows a 2.5x magnified region following the cursor,
   rendered via background-image + background-position on a clipped div.
   ═══════════════════════════════════════════════════════════════════════ */

interface ImageLightboxProps {
  src: string;
  alt: string;
  accent?: string;
  caption?: string;
  onClose: () => void;
}

const LOUPE_DIAMETER = 160;
const ZOOM_FACTOR = 2.5;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function ImageLightbox({
  src,
  alt,
  accent = '#00A87C',
  caption,
  onClose,
}: ImageLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isHoveringRef = useRef(false);

  const [entered, setEntered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  /* Entrance animation */
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
  }, []);

  /* Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* ─── Performant mouse tracking via refs ─── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!imgRef.current || !loupeRef.current || !imgContainerRef.current) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = imgContainerRef.current!;
      const loupe = loupeRef.current!;
      const img = imgRef.current!;

      const cRect = container.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();

      /* Mouse position relative to the rendered image */
      const mx = e.clientX - iRect.left;
      const my = e.clientY - iRect.top;
      const iw = iRect.width;
      const ih = iRect.height;

      /* Normalized 0..1 position within the image */
      const nx = mx / iw;
      const ny = my / ih;

      /* Loupe position (centered on cursor, relative to container) */
      const lx = e.clientX - cRect.left - LOUPE_DIAMETER / 2;
      const ly = e.clientY - cRect.top - LOUPE_DIAMETER / 2;

      /* Background sizing: image scaled by ZOOM_FACTOR */
      const bgW = iw * ZOOM_FACTOR;
      const bgH = ih * ZOOM_FACTOR;

      /* Background position so the cursor point is centered in loupe */
      const bgX = -(nx * bgW - LOUPE_DIAMETER / 2);
      const bgY = -(ny * bgH - LOUPE_DIAMETER / 2);

      loupe.style.transform = `translate(${lx}px, ${ly}px)`;
      loupe.style.backgroundSize = `${bgW}px ${bgH}px`;
      loupe.style.backgroundPosition = `${bgX}px ${bgY}px`;

      /* Only show when inside image bounds */
      const inside = mx >= 0 && mx <= iw && my >= 0 && my <= ih;
      loupe.style.opacity = inside ? '1' : '0';
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (loupeRef.current) {
      loupeRef.current.style.transition = 'opacity 200ms ease';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    if (loupeRef.current) {
      loupeRef.current.style.opacity = '0';
    }
  }, []);

  /* Attach listeners to the container (not via React for perf) */
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 9999,
        background: entered ? 'rgba(8,8,8,0.94)' : 'rgba(8,8,8,0)',
        transition: `background 500ms ${EASE}`,
        cursor: 'default',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* ── Close button ── */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 flex items-center gap-2 px-3 py-2
                   rounded-full cursor-pointer select-none
                   bg-white/[0.04] hover:bg-white/[0.10]
                   border border-white/[0.06] hover:border-white/[0.12]
                   transition-all duration-300"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-8px)',
          transition: `all 400ms ${EASE} 250ms`,
        }}
        title="Close (Esc)"
      >
        <X size={14} className="text-white/40" />
        <span style={{
          fontFamily: "'Cambay', sans-serif",
          fontSize: 10,
          letterSpacing: 1.5,
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
        }}>
          ESC
        </span>
      </button>

      {/* ── Caption ── */}
      {caption && (
        <div
          className="mb-6 flex items-center gap-3"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(-12px)',
            transition: `all 550ms ${EASE} 150ms`,
          }}
        >
          <div style={{
            width: 20, height: 1,
            background: `linear-gradient(to right, transparent, ${accent}66)`,
          }} />
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 15,
            letterSpacing: 6,
            color: `${accent}88`,
          }}>
            {caption}
          </span>
          <div style={{
            width: 20, height: 1,
            background: `linear-gradient(to left, transparent, ${accent}66)`,
          }} />
        </div>
      )}

      {/* ── Image container ── */}
      <div
        ref={imgContainerRef}
        className="relative"
        style={{
          width: '82vw',
          maxWidth: 1100,
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
          transition: `all 600ms ${EASE} 80ms`,
          cursor: 'crosshair',
        }}
      >
        {/* Cinematic frame border */}
        <div
          className="absolute -inset-[1px] rounded-lg pointer-events-none"
          style={{
            border: `1px solid rgba(255,255,255,0.04)`,
            boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 1px ${accent}15`,
          }}
        />

        {/* Main image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setImgLoaded(true)}
          className="rounded-lg select-none"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '72vh',
            display: 'block',
            objectFit: 'contain',
          }}
        />

        {/* ── Zoom loupe (pure DOM, no React state) ── */}
        <div
          ref={loupeRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: LOUPE_DIAMETER,
            height: LOUPE_DIAMETER,
            borderRadius: '50%',
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'transform, background-position',
            /* Ring styling */
            border: `1.5px solid ${accent}55`,
            boxShadow: `
              0 0 0 1px rgba(0,0,0,0.6),
              0 0 40px rgba(0,0,0,0.5),
              0 0 20px ${accent}10,
              inset 0 0 30px rgba(0,0,0,0.15)
            `,
            /* Subtle vignette inside loupe */
            backgroundBlendMode: 'normal',
          }}
        >
          {/* Inner ring */}
          <div
            className="absolute inset-[2px] rounded-full pointer-events-none"
            style={{ border: `0.5px solid rgba(255,255,255,0.06)` }}
          />
          {/* Center crosshair - horizontal */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 1,
              background: `${accent}44`,
            }}
          />
          {/* Center crosshair - vertical */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1,
              height: 12,
              background: `${accent}44`,
            }}
          />
        </div>

        {/* Zoom indicator badge (top-left corner) */}
        {imgLoaded && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1
                       rounded-full pointer-events-none"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: entered ? 0.6 : 0,
              transition: `opacity 600ms ${EASE} 500ms`,
            }}
          >
            <ZoomIn size={10} className="text-white/40" />
            <span style={{
              fontFamily: "'Cambay', sans-serif",
              fontSize: 9,
              letterSpacing: 0.5,
              color: 'rgba(255,255,255,0.4)',
            }}>
              {ZOOM_FACTOR}x
            </span>
          </div>
        )}
      </div>

      {/* ── Bottom hint ── */}
      <div
        className="mt-5 flex items-center gap-4"
        style={{
          opacity: entered && imgLoaded ? 0.35 : 0,
          transition: `opacity 600ms ${EASE} 500ms`,
        }}
      >
        <span style={{
          fontFamily: "'Cambay', sans-serif",
          fontSize: 10,
          letterSpacing: 1.5,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
        }}>
          Hover to magnify
        </span>
        <div style={{
          width: 3, height: 3, borderRadius: '50%',
          background: `${accent}44`,
        }} />
        <span style={{
          fontFamily: "'Cambay', sans-serif",
          fontSize: 10,
          letterSpacing: 1.5,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
        }}>
          ESC to close
        </span>
      </div>
    </div>
  );
}
