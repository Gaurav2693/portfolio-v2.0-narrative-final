import { memo, useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   CYBER PROTO 4 OVERLAY — Premium cyberpunk interaction FX
   ─────────────────────────────────────────────────────────────────────
   Renders a multi-layered holographic / cyberpunk effect around Proto 4
   when hovered or clicked, plus the PQE Engine case study content
   rendered directly on the display's isometric screen surface.

   Proto 4's screen is a parallelogram (30° skewY, standard isometric):
     path p333c7f80: M22.6455 96.6064 ... → corners at:
       TL ≈ (21.3, 97.4)   TR ≈ (44.1, 110.5)
       BL ≈ (21.25, 126.9)  BR ≈ (44.0, 140.0)
     = a 22.8×29.5 rect, skewY(30deg), origin top-left.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Palette ─────────────────────────────────────────────────────────── */
const CYAN      = '#00EAFF';
const CYAN_DIM  = 'rgba(0,234,255,0.12)';
const CYAN_MED  = 'rgba(0,234,255,0.35)';
const MINT      = '#40F0AA';
const HOT_PINK  = '#FF2D6B';
const ORANGE    = '#E8501A';

/* ── Geometry extend beyond object bounds for FX ─────────────────── */
const PAD_X  = 24;
const PAD_TOP = 40;
const PAD_BOT = 32;

/* ── Exact screen parallelogram (in Proto 4's 65.252×152.824 viewBox) ── *
 * Derived from SVG path p210a400 (#F1F1F1 fill = the main white face).   *
 * Left edge runs vertically at x≈1.7;  right edge at x≈55.3.            *
 * Right edge is ~31px lower than left → skewY ≈ atan(31/54) = 30°       */
const SCR = {
  x: 1.5,      // left origin in Proto 4 local coords
  y: 6.55,     // top origin (shifted down 1px from 5.55)
  w: 54.0,     // width before skew (covers the full face width)
  h: 88.5,     // height of each vertical edge
  skew: 30,    // degrees — standard isometric
};

/* ── Glitch text decoder ──────────────────────────────────────────── */
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?<>{}[]';
function useGlitchDecode(target: string, active: boolean, speed = 40) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active) { setText(''); return; }
    let idx = 0;
    let tick = 0;
    const iv = setInterval(() => {
      tick++;
      if (tick % 2 === 0 && idx < target.length) idx++;
      const decoded = target.slice(0, idx);
      const scramble = Array.from({ length: target.length - idx }, () =>
        GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      ).join('');
      setText(decoded + scramble);
      if (idx >= target.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [active, target, speed]);
  return text;
}

/* ═════════════════════════════════════════════════════════════════════ */

interface Props {
  isHovered: boolean;
  isClicked: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  liftPx: number;
  scale: number;
  ease: string;
  dur: string;
}

function CyberProto4Overlay({
  isHovered, isClicked, x, y, w, h, liftPx, scale, ease, dur,
}: Props) {
  const active = isHovered || isClicked;
  const titleText = useGlitchDecode('PQE ENGINE', active, 35);
  const subText = useGlitchDecode('CASE STUDY', isClicked, 50);

  /* Extended bounds for FX container */
  const ex = x - PAD_X;
  const ey = y - PAD_TOP;
  const ew = w + PAD_X * 2;
  const eh = h + PAD_TOP + PAD_BOT;
  const ix = PAD_X;
  const iy = PAD_TOP;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          ISOMETRIC SCREEN CONTENT — tracks clone lift + scale
          ────────────────────────────────────────────────────────────
          The screen is a 30° skewed parallelogram. Content inside the
          skewed container naturally appears "on" the isometric surface.
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: `transform ${dur} ${ease}`,
          zIndex: 14,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(-${liftPx}px)`,
            transition: `transform ${dur} ${ease}`,
          }}
        >
          {/* The isometric screen panel: skewY(30deg) from top-left origin */}
          <div
            style={{
              position: 'absolute',
              left: SCR.x,
              top: SCR.y,
              width: SCR.w,
              height: SCR.h,
              transform: `skewY(${SCR.skew}deg)`,
              transformOrigin: '0 0',
              background: 'linear-gradient(180deg, #0a0a18 0%, #0E0E16 50%, #080814 100%)',
              borderRadius: '0.5px',
              overflow: 'hidden',
            }}
          >
            {/* ── Subtle grid ─────────────────────────────────── */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(0,234,255,0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,234,255,0.04) 1px, transparent 1px)
                `,
                backgroundSize: '4px 4px',
              }}
            />

            {/* ── Content (designed for ~23×30px) ─────────────── */}
            <div style={{ position: 'relative', padding: '2px 2px 1.5px', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/* Top status dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1.5 }}>
                <div style={{ width: 1.5, height: 1.5, borderRadius: '50%', background: active ? CYAN : '#334', boxShadow: active ? `0 0 3px ${CYAN}` : 'none', transition: 'all 400ms' }} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 2.8, letterSpacing: 1, color: CYAN, opacity: 0.8 }}>PQE</span>
                <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 2, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>v3</span>
              </div>

              {/* Divider */}
              <div style={{ height: '0.3px', background: `linear-gradient(90deg, ${CYAN}44, ${CYAN}11)`, marginBottom: 1.5 }} />

              {/* Title */}
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 3.8,
                letterSpacing: 1.2,
                color: '#fff',
                lineHeight: 1,
                textShadow: active ? `0 0 4px ${CYAN_DIM}` : 'none',
                display: 'block',
                marginBottom: 0.5,
              }}>
                PQE ENGINE
              </span>
              <span style={{
                fontFamily: "'Cambay', sans-serif",
                fontSize: 2,
                color: ORANGE,
                letterSpacing: 0.5,
                display: 'block',
                marginBottom: 2,
              }}>
                CASE STUDY
              </span>

              {/* Mini metric bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 2 }}>
                {[
                  { w: '82%', c: CYAN },
                  { w: '94%', c: MINT },
                  { w: '67%', c: ORANGE },
                ].map((bar, i) => (
                  <div key={i} style={{ height: '0.8px', background: 'rgba(255,255,255,0.06)', borderRadius: '0.5px' }}>
                    <div style={{
                      width: bar.w,
                      height: '100%',
                      borderRadius: '0.5px',
                      background: `linear-gradient(90deg, ${bar.c}88, ${bar.c}33)`,
                    }} />
                  </div>
                ))}
              </div>

              {/* Mini metric numbers */}
              <div style={{ display: 'flex', gap: 1.5, marginBottom: 1.5 }}>
                {[
                  { v: '94', c: MINT },
                  { v: '87', c: CYAN },
                  { v: '91', c: ORANGE },
                ].map((m, i) => (
                  <span key={i} style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 3.2,
                    color: m.c,
                    lineHeight: 1,
                    opacity: 0.8,
                  }}>{m.v}</span>
                ))}
              </div>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Bottom status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div style={{
                  width: 1.2, height: 1.2, borderRadius: '50%',
                  background: active ? MINT : '#334',
                  boxShadow: active ? `0 0 2px ${MINT}` : 'none',
                  transition: 'all 400ms',
                }} />
                <span style={{
                  fontFamily: "'Cambay', sans-serif",
                  fontSize: 1.8,
                  color: active ? MINT : 'rgba(255,255,255,0.2)',
                  letterSpacing: 0.3,
                  transition: 'color 400ms',
                }}>
                  {active ? 'ACTIVE' : 'STBY'}
                </span>
              </div>
            </div>

            {/* ── Scan overlay on hover ──────────────────────── */}
            {active && (
              <div
                className="cyb4-screen-scan"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(180deg, transparent 0%, ${CYAN}08 48%, ${CYAN}18 50%, ${CYAN}08 52%, transparent 100%)`,
                  backgroundSize: '100% 200%',
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* ── Edge glow ────────────────────────────────── */}
            {active && (
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '0.5px',
                boxShadow: isClicked
                  ? `inset 0 0 4px ${CYAN}44, 0 0 3px ${CYAN}33`
                  : `inset 0 0 2px ${CYAN}22, 0 0 1px ${CYAN}11`,
                transition: 'box-shadow 400ms ease',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CYBERPUNK FX OVERLAY (hover/click activated)
          ──────────────────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: ex,
          top: ey,
          width: ew,
          height: eh,
          zIndex: 16,
          opacity: active ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        {/* ── Holographic base projection ─────────────────────── */}
        <div
          style={{
            position: 'absolute',
            left: ix - 15,
            bottom: -10,
            width: w + 30,
            height: 50,
            background: `radial-gradient(ellipse at 50% 20%, ${CYAN_MED} 0%, ${CYAN_DIM} 35%, transparent 70%)`,
            opacity: isClicked ? 0.9 : 0.4,
            transition: 'opacity 500ms ease',
            animation: active ? 'cyb4-base-pulse 3s ease-in-out infinite' : 'none',
          }}
        />

        {/* ── Energy pulse rings (click only) ────────────────── */}
        {isClicked && (
          <>
            <div className="cyb4-ring cyb4-ring-1" style={{ left: ix + w / 2, top: iy + h - 5 }} />
            <div className="cyb4-ring cyb4-ring-2" style={{ left: ix + w / 2, top: iy + h - 5 }} />
            <div className="cyb4-ring cyb4-ring-3" style={{ left: ix + w / 2, top: iy + h - 5 }} />
          </>
        )}

        {/* ── Neon border frame (isometric parallelogram) ─────── */}
        <svg
          className="absolute"
          style={{
            left: ix + SCR.x - 2,
            top: iy + SCR.y - 2,
            width: SCR.w + 4,
            height: SCR.h + SCR.w * Math.tan(SCR.skew * Math.PI / 180) + 4,
            overflow: 'visible',
          }}
          fill="none"
        >
          {/* Parallelogram outline matching the screen shape */}
          <polygon
            points={`2,2 ${SCR.w + 2},${2 + SCR.w * Math.tan(SCR.skew * Math.PI / 180)} ${SCR.w + 2},${2 + SCR.h + SCR.w * Math.tan(SCR.skew * Math.PI / 180)} 2,${2 + SCR.h}`}
            stroke={CYAN}
            strokeWidth={isClicked ? 1.2 : 0.6}
            strokeOpacity={isClicked ? 0.7 : 0.3}
            fill="none"
            filter="url(#cyb4-glow)"
            style={{
              strokeDasharray: isClicked ? 'none' : '4 3',
              animation: active ? 'cyb4-dash 8s linear infinite' : 'none',
            }}
          />
          <defs>
            <filter id="cyb4-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={isClicked ? 3 : 1.5} />
            </filter>
          </defs>
        </svg>

        {/* ── Corner brackets (at parallelogram corners) ──────── */}
        {active && (() => {
          const skOff = SCR.w * Math.tan(SCR.skew * Math.PI / 180); // ~13.2
          const cTL = { x: ix + SCR.x, y: iy + SCR.y };
          const cTR = { x: ix + SCR.x + SCR.w, y: iy + SCR.y + skOff };
          const cBR = { x: ix + SCR.x + SCR.w, y: iy + SCR.y + SCR.h + skOff };
          const cBL = { x: ix + SCR.x, y: iy + SCR.y + SCR.h };
          const sz = 6;
          return (
            <>
              <div className="cyb4-corner" style={{
                left: cTL.x - 2, top: cTL.y - 2, width: sz, height: sz,
                borderLeft: `1.5px solid ${CYAN}`, borderTop: `1.5px solid ${CYAN}`,
                animationDelay: '0ms',
              }} />
              <div className="cyb4-corner" style={{
                left: cTR.x - sz + 2, top: cTR.y - 2, width: sz, height: sz,
                borderRight: `1.5px solid ${CYAN}`, borderTop: `1.5px solid ${CYAN}`,
                animationDelay: '60ms',
              }} />
              <div className="cyb4-corner" style={{
                left: cBR.x - sz + 2, top: cBR.y - sz + 2, width: sz, height: sz,
                borderRight: `1.5px solid ${CYAN}`, borderBottom: `1.5px solid ${CYAN}`,
                animationDelay: '120ms',
              }} />
              <div className="cyb4-corner" style={{
                left: cBL.x - 2, top: cBL.y - sz + 2, width: sz, height: sz,
                borderLeft: `1.5px solid ${CYAN}`, borderBottom: `1.5px solid ${CYAN}`,
                animationDelay: '180ms',
              }} />
            </>
          );
        })()}

        {/* ── Scan line (follows parallelogram) ──────────────── */}
        {active && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: ix + SCR.x - 1,
              top: iy + SCR.y,
              width: SCR.w + 2,
              height: SCR.h + SCR.w * Math.tan(SCR.skew * Math.PI / 180),
            }}
          >
            <div
              className="cyb4-scanline"
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: 1.5,
                background: `linear-gradient(90deg, transparent 0%, ${CYAN} 20%, ${CYAN} 80%, transparent 100%)`,
                opacity: isClicked ? 0.6 : 0.3,
                boxShadow: `0 0 6px ${CYAN}, 0 0 12px ${CYAN_DIM}`,
                transform: `skewY(${SCR.skew}deg)`,
                transformOrigin: '0 0',
              }}
            />
          </div>
        )}

        {/* ── Data streams (click only, inside parallelogram) ─── */}
        {isClicked && (
          <div
            className="absolute overflow-hidden"
            style={{
              left: ix + SCR.x,
              top: iy + SCR.y,
              width: SCR.w,
              height: SCR.h,
              transform: `skewY(${SCR.skew}deg)`,
              transformOrigin: '0 0',
              mixBlendMode: 'screen',
            }}
          >
            {[0.2, 0.4, 0.6, 0.8].map((xp, i) => (
              <div
                key={i}
                className="cyb4-datastream"
                style={{
                  position: 'absolute',
                  left: `${xp * 100}%`,
                  top: 0,
                  width: 0.5,
                  height: '100%',
                  background: `linear-gradient(180deg, transparent 0%, ${MINT}44 30%, ${CYAN}66 50%, ${MINT}44 70%, transparent 100%)`,
                  animationDelay: `${i * 400}ms`,
                  animationDuration: `${1800 + i * 300}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Holographic shimmer (parallelogram) ────────────── */}
        {active && (
          <div
            className="cyb4-shimmer"
            style={{
              position: 'absolute',
              left: ix + SCR.x,
              top: iy + SCR.y,
              width: SCR.w,
              height: SCR.h,
              transform: `skewY(${SCR.skew}deg)`,
              transformOrigin: '0 0',
              overflow: 'hidden',
              opacity: isClicked ? 0.12 : 0.05,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ── Title label (above parallelogram, on left wall axis) */}
        {active && (
          <div
            style={{
              position: 'absolute',
              left: ix + SCR.x,
              top: iy + SCR.y - 16,
              width: SCR.w + 20,
              transform: `skewY(${SCR.skew}deg)`,
              transformOrigin: '0 100%',
              opacity: titleText.length > 0 ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          >
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 6,
              letterSpacing: 2,
              color: CYAN,
              textShadow: `0 0 4px ${CYAN_MED}, 0 0 10px ${CYAN_DIM}`,
              whiteSpace: 'nowrap',
            }}>
              {titleText}
            </span>
            <div style={{
              marginTop: 1,
              height: '0.5px',
              background: `linear-gradient(90deg, ${CYAN_MED}, transparent)`,
              animation: 'cyb4-line-grow 600ms ease-out forwards',
            }} />
          </div>
        )}

        {/* ── Status readout (below parallelogram, click only) ── */}
        {isClicked && (
          <div
            style={{
              position: 'absolute',
              left: ix + SCR.x,
              top: iy + SCR.y + SCR.h + 4,
              width: SCR.w + 20,
              transform: `skewY(${SCR.skew}deg)`,
              transformOrigin: '0 0',
            }}
          >
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 5,
              letterSpacing: 1.5,
              color: MINT,
              textShadow: `0 0 3px ${MINT}44`,
              display: 'block',
            }}>
              {subText}
            </span>
            <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="cyb4-data-dot" style={{ background: CYAN, animationDelay: '0ms' }} />
              <span style={{
                fontFamily: "'Cambay', sans-serif",
                fontSize: 3,
                letterSpacing: 0.5,
                color: 'rgba(0,234,255,0.5)',
              }}>
                SYS.READY
              </span>
              <div className="cyb4-data-dot" style={{ background: MINT, animationDelay: '500ms' }} />
            </div>
          </div>
        )}

        {/* ── Ambient particles (click only) ─────────────────── */}
        {isClicked && (
          <div className="absolute" style={{
            left: ix + SCR.x - 8,
            top: iy + SCR.y - 8,
            width: SCR.w + 16,
            height: SCR.h + SCR.w * Math.tan(SCR.skew * Math.PI / 180) + 16,
          }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const radius = 18 + (i % 3) * 6;
              const cx = (SCR.w + 16) / 2;
              const cy = (SCR.h + 16) / 2 + 6;
              return (
                <div
                  key={i}
                  className="cyb4-particle"
                  style={{
                    position: 'absolute',
                    left: cx + Math.cos(angle) * radius,
                    top: cy + Math.sin(angle) * radius,
                    width: 1.5,
                    height: 1.5,
                    borderRadius: '50%',
                    background: i % 3 === 0 ? CYAN : i % 3 === 1 ? MINT : HOT_PINK,
                    animationDelay: `${i * 250}ms`,
                    animationDuration: `${2000 + i * 200}ms`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* ── Chromatic aberration (click only) ───────────────── */}
        {isClicked && (() => {
          const skOff = SCR.w * Math.tan(SCR.skew * Math.PI / 180);
          const pts = `${SCR.x},${SCR.y} ${SCR.x + SCR.w},${SCR.y + skOff} ${SCR.x + SCR.w},${SCR.y + SCR.h + skOff} ${SCR.x},${SCR.y + SCR.h}`;
          return (
            <>
              <svg className="absolute" style={{ left: ix + 0.5, top: iy, width: w, height: h, overflow: 'visible' }} fill="none">
                <polygon points={pts} stroke={HOT_PINK} strokeWidth="0.4" opacity="0.15" style={{ animation: 'cyb4-chroma-r 4s ease-in-out infinite' }} />
              </svg>
              <svg className="absolute" style={{ left: ix - 0.5, top: iy, width: w, height: h, overflow: 'visible' }} fill="none">
                <polygon points={pts} stroke={CYAN} strokeWidth="0.4" opacity="0.15" style={{ animation: 'cyb4-chroma-b 4s ease-in-out infinite' }} />
              </svg>
            </>
          );
        })()}
      </div>

      {/* ── Keyframes ─────────────────────────────────────────────── */}
      <style>{`
        .cyb4-corner {
          position: absolute;
          animation: cyb4-corner-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cyb4-corner-in {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }

        .cyb4-scanline {
          animation: cyb4-scan 3s ease-in-out infinite;
        }
        @keyframes cyb4-scan {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes cyb4-dash {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -28; }
        }

        @keyframes cyb4-base-pulse {
          0%, 100% { transform: scaleX(1) scaleY(1); opacity: 0.4; }
          50%      { transform: scaleX(1.08) scaleY(1.15); opacity: 0.7; }
        }

        .cyb4-datastream {
          animation: cyb4-stream ease-in-out infinite;
          opacity: 0;
        }
        @keyframes cyb4-stream {
          0%   { opacity: 0; transform: translateY(-20%); }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(120%); }
        }

        .cyb4-shimmer {
          background-image: linear-gradient(
            135deg,
            transparent 20%,
            rgba(0,234,255,0.3) 40%,
            rgba(64,240,170,0.2) 50%,
            rgba(0,234,255,0.3) 60%,
            transparent 80%
          );
          background-size: 300% 300%;
          animation: cyb4-shimmer-move 4s ease-in-out infinite;
        }
        @keyframes cyb4-shimmer-move {
          0%   { background-position: 100% 100%; }
          50%  { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        @keyframes cyb4-line-grow {
          0%   { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        .cyb4-data-dot {
          width: 1.5px;
          height: 1.5px;
          border-radius: 50%;
          animation: cyb4-dot-pulse 1.5s ease-in-out infinite;
        }
        @keyframes cyb4-dot-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.8); }
        }

        .cyb4-particle {
          animation: cyb4-float ease-in-out infinite;
          opacity: 0;
        }
        @keyframes cyb4-float {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          25%  { opacity: 0.8; transform: translateY(-2px) scale(1); }
          50%  { opacity: 0.5; transform: translateY(-4px) scale(0.8); }
          75%  { opacity: 0.7; transform: translateY(-2px) scale(1.1); }
          100% { opacity: 0; transform: translateY(0) scale(0.5); }
        }

        .cyb4-ring {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          border: 1px solid rgba(0,234,255,0.3);
          transform: translate(-50%, -50%);
          animation: cyb4-ring-expand 3s ease-out infinite;
        }
        .cyb4-ring-2 { animation-delay: 1s; }
        .cyb4-ring-3 { animation-delay: 2s; }
        @keyframes cyb4-ring-expand {
          0%   { width: 8px; height: 4px; opacity: 0.6; border-color: rgba(0,234,255,0.5); }
          100% { width: 80px; height: 30px; opacity: 0; border-color: rgba(0,234,255,0); }
        }

        @keyframes cyb4-chroma-r {
          0%, 100% { transform: translate(0.3px, 0); }
          25%      { transform: translate(1px, -0.3px); }
          50%      { transform: translate(0.2px, 0.3px); }
          75%      { transform: translate(0.8px, 0); }
        }
        @keyframes cyb4-chroma-b {
          0%, 100% { transform: translate(-0.3px, 0); }
          25%      { transform: translate(-0.8px, 0.3px); }
          50%      { transform: translate(-1px, -0.2px); }
          75%      { transform: translate(-0.5px, 0); }
        }

        .cyb4-screen-scan {
          animation: cyb4-screen-scan-move 4s ease-in-out infinite;
        }
        @keyframes cyb4-screen-scan-move {
          0%   { background-position: 0% 100%; }
          50%  { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
      `}</style>
    </>
  );
}

export default memo(CyberProto4Overlay);