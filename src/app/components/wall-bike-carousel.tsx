import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ImageLightbox } from './image-lightbox';

import imgRider from 'figma:asset/a85a30a35cba0ac33e726998c0d2d6126df3464d.png';
import imgMagnetic from 'figma:asset/25910c769f14760044a3d51798859d3308478bb7.png';
import imgArmor from 'figma:asset/ada58d5c144fb61a5f7d7b566d8d2276fcf8606c.png';

/* ═══════════════════════════════════════════════════════════════════════
   WALL BIKE CAROUSEL — Left Wall Isometric Photo Carousel
   ─────────────────────────────────────────────────────────
   Appears when the bike is clicked and the engine roars to life.
   Auto-advancing square carousel with 3 riding journey photos,
   dot navigation, crossfade transitions, and lightbox on click.
   ═══════════════════════════════════════════════════════════════════════ */

const SLIDES = [
  { src: imgRider,    alt: 'The Rider',    caption: 'THE RIDER',    objectPos: 'center 25%' },
  { src: imgMagnetic, alt: 'Magnetic Hill', caption: 'MAGNETIC HILL', objectPos: 'center 35%' },
  { src: imgArmor,    alt: 'The Road',     caption: 'THE ROAD',     objectPos: 'center 30%' },
];

const INTERVAL = 3800;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface WallBikeCarouselProps {
  active: boolean;
  entered: boolean;
  accent?: string;
}

export function WallBikeCarousel({
  active,
  entered,
  accent = '#FF9500',
}: WallBikeCarouselProps) {
  const [visible, setVisible] = useState(false);
  const [frameIn, setFrameIn] = useState(false);
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRefs = useRef<number[]>([]);
  const autoRef = useRef<number>(0);
  const ac = accent;

  /* ── Mount / unmount animation ── */
  useEffect(() => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];

    if (active && entered) {
      const t0 = window.setTimeout(() => setVisible(true), 80);
      const t1 = window.setTimeout(() => setFrameIn(true), 250);
      timerRefs.current.push(t0, t1);
    } else {
      setFrameIn(false);
      setLightboxOpen(false);
      setCurrent(0);
      const t = window.setTimeout(() => setVisible(false), 400);
      timerRefs.current.push(t);
    }

    return () => timerRefs.current.forEach(t => clearTimeout(t));
  }, [active, entered]);

  /* ── Auto-advance ── */
  useEffect(() => {
    if (!frameIn || lightboxOpen) {
      clearInterval(autoRef.current);
      return;
    }
    autoRef.current = window.setInterval(() => {
      setCurrent(p => (p + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(autoRef.current);
  }, [frameIn, lightboxOpen]);

  /* ── Manual dot click ── */
  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    /* Reset auto-advance timer */
    clearInterval(autoRef.current);
    autoRef.current = window.setInterval(() => {
      setCurrent(p => (p + 1) % SLIDES.length);
    }, INTERVAL);
  }, []);

  if (!visible && !active) return null;

  const slide = SLIDES[current];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: visible ? 1 : 0,
          transition: `opacity 450ms ${EASE}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'none',
        }}
      >
        {/* Top accent rule */}
        <div
          style={{
            width: frameIn ? '100%' : '0%',
            height: 1,
            background: `linear-gradient(to right, ${ac}, transparent)`,
            transition: `width 700ms ${EASE}`,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />

        {/* Square carousel frame */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            position: 'relative',
            opacity: frameIn ? 1 : 0,
            transform: frameIn ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
            transition: `opacity 550ms ${EASE}, transform 550ms ${EASE}`,
            pointerEvents: frameIn ? 'auto' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Outer frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 3,
              overflow: 'hidden',
              background: '#141414',
              border: `1.5px solid rgba(255,255,255,0.05)`,
              boxShadow: `0 3px 14px rgba(0,0,0,0.6), 0 0 0 0.5px ${ac}15`,
              transition: `border-color 300ms ${EASE}, box-shadow 300ms ${EASE}`,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${ac}40`;
              el.style.boxShadow = `0 3px 20px rgba(0,0,0,0.7), 0 0 14px ${ac}20`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.05)';
              el.style.boxShadow = `0 3px 14px rgba(0,0,0,0.6), 0 0 0 0.5px ${ac}15`;
            }}
          >
            {/* Inner accent trim */}
            <div
              style={{
                position: 'absolute',
                inset: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: `0.5px solid ${ac}18`,
              }}
            >
              {/* Crossfade image stack */}
              {SLIDES.map((s, i) => (
                <img
                  key={s.caption}
                  src={s.src}
                  alt={s.alt}
                  draggable={false}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: s.objectPos,
                    display: 'block',
                    opacity: i === current && frameIn ? 0.92 : 0,
                    transition: `opacity 800ms ${EASE}`,
                    filter: 'contrast(1.05) brightness(0.82)',
                  }}
                />
              ))}
            </div>

            {/* Bottom gradient */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '35%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Caption */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 5,
                right: 5,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <span
                key={current}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 7,
                  letterSpacing: 2.5,
                  color: `${ac}aa`,
                  opacity: 1,
                  animation: 'carousel-caption-in 600ms ease-out',
                }}
              >
                {slide.caption}
              </span>
              <span
                style={{
                  fontFamily: "'Cambay', sans-serif",
                  fontSize: 4.5,
                  letterSpacing: 0.6,
                  color: 'rgba(255,255,255,0.18)',
                }}
              >
                {String(current + 1).padStart(2, '0')}/{String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Dot navigation */}
            <div
              style={{
                position: 'absolute',
                bottom: 3,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 3,
                pointerEvents: 'auto',
              }}
            >
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                  style={{
                    width: i === current ? 10 : 4,
                    height: 2.5,
                    borderRadius: 2,
                    border: 'none',
                    background: i === current ? ac : 'rgba(255,255,255,0.2)',
                    opacity: i === current ? 0.9 : 0.5,
                    transition: `all 400ms ${EASE}`,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Top-right badge */}
            <div
              style={{
                position: 'absolute',
                top: 3,
                right: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: ac,
                  opacity: 0.6,
                  animation: 'carousel-pulse 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontFamily: "'Cambay', sans-serif",
                  fontSize: 4,
                  letterSpacing: 0.8,
                  color: 'rgba(255,255,255,0.15)',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </span>
            </div>

            {/* Progress bar (auto-advance indicator) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                overflow: 'hidden',
              }}
            >
              <div
                key={`${current}-${frameIn}`}
                style={{
                  height: '100%',
                  background: `linear-gradient(to right, transparent, ${ac})`,
                  opacity: 0.5,
                  animation: frameIn && !lightboxOpen
                    ? `carousel-progress ${INTERVAL}ms linear`
                    : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom accent detail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: ac,
              opacity: frameIn ? 0.5 : 0,
              transition: `opacity 600ms ${EASE}`,
            }}
          />
          <span
            style={{
              fontFamily: "'Cambay', sans-serif",
              fontSize: 5,
              letterSpacing: 1,
              color: 'rgba(255,255,255,0.2)',
              opacity: frameIn ? 1 : 0,
              transition: `opacity 600ms ${EASE} 100ms`,
              textTransform: 'uppercase',
            }}
          >
            The Journey
          </span>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes carousel-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes carousel-caption-in {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes carousel-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* Lightbox — portalled to body */}
      {lightboxOpen && createPortal(
        <ImageLightbox
          src={slide.src}
          alt={slide.alt}
          accent={ac}
          caption={slide.caption}
          onClose={() => setLightboxOpen(false)}
        />,
        document.body,
      )}
    </>
  );
}
