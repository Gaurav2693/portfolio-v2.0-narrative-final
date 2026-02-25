import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ImageLightbox } from './image-lightbox';

import imgArmor from 'figma:asset/ada58d5c144fb61a5f7d7b566d8d2276fcf8606c.png';
import imgGrip from 'figma:asset/c8ccd80f097d3cc358064e42bc017a8d674a96f7.png';

/* ═══════════════════════════════════════════════════════════════════════
   WALL PHOTO FRAME — Single Square Isometric Wall Frame
   ─────────────────────────────────────────────────────
   Shows ONE photo frame on the left wall when a specific object
   is clicked:
     jacket      → imgArmor / "THE ARMOR"  (riders & gear, landscape)
     ridingshoes → imgGrip  / "THE GRIP"   (group at highest pass)

   Click the frame to open a full-screen lightbox with blur-focus lens.
   ═══════════════════════════════════════════════════════════════════════ */

interface WallPhotoFramesProps {
  clickedId: string | null;
  entered: boolean;
  accent?: string;
  /** Legacy — ignored, we use Figma assets now */
  image1?: string;
  image2?: string;
  caption1?: string;
  caption2?: string;
}

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function WallPhotoFrames({
  clickedId,
  entered,
  accent = '#00A87C',
  caption1 = 'THE ARMOR',
  caption2 = 'THE GRIP',
}: WallPhotoFramesProps) {
  const isJacket = clickedId === 'jacket';
  const isShoes = clickedId === 'ridingshoes';
  const active = isJacket || isShoes;

  const [visible, setVisible] = useState(false);
  const [frameIn, setFrameIn] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRefs = useRef<number[]>([]);

  /* Pick the active image + caption */
  const imgSrc = isJacket ? imgArmor : imgGrip;
  const caption = isJacket ? caption1 : caption2;
  const idx = isJacket ? 1 : 2;
  const ac = accent;

  useEffect(() => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];

    if (active && entered) {
      const t0 = window.setTimeout(() => setVisible(true), 50);
      const t1 = window.setTimeout(() => setFrameIn(true), 180);
      timerRefs.current.push(t0, t1);
    } else {
      setFrameIn(false);
      setLightboxOpen(false);
      const t1 = window.setTimeout(() => setVisible(false), 320);
      timerRefs.current.push(t1);
    }

    return () => timerRefs.current.forEach(t => clearTimeout(t));
  }, [active, entered]);

  /* Close lightbox when switching objects */
  useEffect(() => {
    // Only close if we moved to a completely different object category
    // (not jacket/shoes), or if nothing is selected AND lightbox is open
    if (lightboxOpen && !isJacket && !isShoes) {
      setLightboxOpen(false);
    }
  }, [clickedId]);

  if (!visible && !active) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: visible ? 1 : 0,
          transition: `opacity 400ms ${EASE}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          /* Allow pointer events on the frame for click-to-open */
          pointerEvents: 'none',
        }}
      >
        {/* Top accent rule */}
        <div
          style={{
            width: frameIn ? '100%' : '0%',
            height: 1,
            background: `linear-gradient(to right, ${ac}, transparent)`,
            transition: `width 600ms ${EASE}`,
            opacity: 0.4,
            flexShrink: 0,
          }}
        />

        {/* Single frame */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            position: 'relative',
            opacity: frameIn ? 1 : 0,
            transform: frameIn ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity 500ms ${EASE}, transform 500ms ${EASE}`,
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
              background: '#1a1a1a',
              border: '2px solid rgba(255,255,255,0.06)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              transition: `border-color 300ms ${EASE}, box-shadow 300ms ${EASE}`,
            }}
            className="group"
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${ac}33`;
              el.style.boxShadow = `0 2px 16px rgba(0,0,0,0.6), 0 0 12px ${ac}15`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(255,255,255,0.06)';
              el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            }}
          >
            {/* Inner accent trim */}
            <div
              style={{
                position: 'absolute',
                inset: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${ac}22`,
              }}
            >
              {/* Armor image (jacket click) */}
              <img
                src={imgArmor}
                alt={caption1}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 30%',
                  display: 'block',
                  opacity: frameIn && isJacket ? 0.88 : 0,
                  transition: `opacity 600ms ${EASE}`,
                  filter: 'contrast(1.08) brightness(0.85)',
                }}
              />
              {/* Grip image (shoes click) */}
              <img
                src={imgGrip}
                alt={caption2}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 40%',
                  display: 'block',
                  opacity: frameIn && isShoes ? 0.88 : 0,
                  transition: `opacity 600ms ${EASE}`,
                  filter: 'contrast(1.08) brightness(0.85)',
                }}
              />
            </div>

            {/* Caption gradient bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 16,
                background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                paddingBottom: 2,
                paddingLeft: 4,
                paddingRight: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 6.5,
                  letterSpacing: 2.2,
                  color: `${ac}99`,
                }}
              >
                {caption}
              </span>
              <span
                style={{
                  fontFamily: "'Cambay', sans-serif",
                  fontSize: 4.5,
                  letterSpacing: 0.8,
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                CLICK TO VIEW
              </span>
            </div>

            {/* Top-right index badge */}
            <div
              style={{
                position: 'absolute',
                top: 3,
                right: 4,
                fontFamily: "'Cambay', sans-serif",
                fontSize: 5,
                letterSpacing: 1,
                color: 'rgba(255,255,255,0.15)',
              }}
            >
              0{idx}
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
              opacity: frameIn ? 0.45 : 0,
              transition: `opacity 600ms ${EASE}`,
            }}
          />
          <span
            style={{
              fontFamily: "'Cambay', sans-serif",
              fontSize: 5,
              letterSpacing: 1,
              color: 'rgba(255,255,255,0.18)',
              opacity: frameIn ? 1 : 0,
              transition: `opacity 600ms ${EASE} 100ms`,
              textTransform: 'uppercase',
            }}
          >
            {caption}
          </span>
        </div>
      </div>

      {/* Lightbox — portalled to body to escape all transforms/clips */}
      {lightboxOpen && createPortal(
        <ImageLightbox
          src={imgSrc}
          alt={caption}
          accent={ac}
          caption={caption}
          onClose={() => setLightboxOpen(false)}
        />,
        document.body,
      )}
    </>
  );
}