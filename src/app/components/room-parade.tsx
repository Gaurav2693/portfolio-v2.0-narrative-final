import { useRef, useEffect, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import { useParadeNavigation } from '../hooks/use-parade-navigation';
import InteractiveRoomBg from './interactive-room-bg';
import InteractiveGarageBg from './interactive-garage-bg';
import InteractiveThinkingBg from './interactive-thinking-bg';
import InteractivePrototypeBg from './interactive-prototype-bg';

/* ═══════════════════════════════════════════════════════════════════════
   ROOM PARADE  —  Phase 3B + Phase 4  (Journey-integrated depth stack)
   ────────────────────────────────────────────────────────────────────
   Visual depth-stack of room previews.

   Two modes:
   A) **Self-driven** (default) — owns its own `useParadeNavigation`
      spring and wheel handler. Used standalone or for testing.
   B) **Externally-driven** — parent provides `externalControl` flag.
      No internal spring or wheel handler. Instead, parent calls
      `paradeRef.current.updateFrame(roomFocusIndex)` every rAF frame
      with a float room index (0-3). The parade applies depth transforms
      from that value. This is used by the scroll journey system.

   In both modes, the parade exposes a `RoomParadeHandle` via
   `forwardRef` + `useImperativeHandle`.
   ═══════════════════════════════════════════��═══════════════════════════ */

type RoomId = 'studio' | 'garage' | 'room3' | 'room4';

interface FloorMeta {
  id: RoomId;
  index: number;
  floor: string;
  name: string;
  tagline: string;
  accent: string;
  darkBg: string;
}

const FLOORS: FloorMeta[] = [
  { id: 'studio', index: 0, floor: '01', name: 'THE DESIGN STUDIO',  tagline: 'Where ideas take shape',           accent: '#00EAFF', darkBg: '#C8CDD8' },
  { id: 'garage', index: 1, floor: '02', name: 'THE GARAGE',         tagline: 'Tools, process & craft',           accent: '#F59E0B', darkBg: '#1a1510' },
  { id: 'room3',  index: 2, floor: '03', name: 'HOW I THINK',        tagline: 'Mental models & frameworks',       accent: '#40F0AA', darkBg: '#0d1a17' },
  { id: 'room4',  index: 3, floor: '04', name: 'PROTOTYPE LAB',      tagline: 'Engineering & rapid prototyping',  accent: '#E8501A', darkBg: '#0D1118' },
];

const ROOM_COUNT = FLOORS.length;
const CARD_W = 805;
const CARD_H = 609;

/* ── Memoized room previews ── */
const StudioPreview  = memo(() => <InteractiveRoomBg preview />);
const GaragePreview  = memo(() => <InteractiveGarageBg preview />);
const ThinkingPreview = memo(() => <InteractiveThinkingBg preview />);
const PrototypePreview = memo(() => <InteractivePrototypeBg preview />);
StudioPreview.displayName = 'StudioPreview';
GaragePreview.displayName = 'GaragePreview';
ThinkingPreview.displayName = 'ThinkingPreview';
PrototypePreview.displayName = 'PrototypePreview';
const PREVIEWS: React.FC[] = [StudioPreview, GaragePreview, ThinkingPreview, PrototypePreview];

/* ── Depth transform math ── */
function computeCardTransforms(distance: number) {
  if (distance >= 0) {
    const t = Math.min(distance, 3.5);
    return {
      y: t * 48, z: t * -320, scale: 1 - t * 0.12,
      opacity: Math.max(0.02, 1 - t * 0.58), blur: t * 2.2,
      rotateX: t * 1.8, zIndex: 10 - Math.round(t),
    };
  } else {
    const t = Math.min(Math.abs(distance), 2);
    return {
      y: distance * 220, z: t * -180, scale: 1 - t * 0.1,
      opacity: Math.max(0, 1 - t * 1.1), blur: t * 3,
      rotateX: -t * 1.2, zIndex: 10 - Math.round(t),
    };
  }
}

function applyTransforms(el: HTMLElement, tf: ReturnType<typeof computeCardTransforms>) {
  el.style.transform = `translateY(${tf.y}px) translateZ(${tf.z}px) scale(${tf.scale}) rotateX(${tf.rotateX}deg)`;
  el.style.opacity = String(tf.opacity);
  el.style.filter = tf.blur > 0.1 ? `blur(${tf.blur}px)` : 'none';
}

/* ═══════════════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════════════ */

export interface RoomParadeHandle {
  /** Call every rAF frame with the float room focus index (0-3).
      Updates all card transforms, labels, rail dots via direct DOM. */
  updateFrame: (roomFocusIndex: number) => void;
  /** Jump to a room index (for goTo from floor rail clicks) */
  goTo: (index: number) => void;
}

interface RoomParadeProps {
  onSelectRoom: (room: RoomId) => void;
  currentRoom: RoomId;
  /** If true, skip internal spring/wheel — parent drives via handle */
  externalControl?: boolean;
  /** Integer active room index from parent (for mount decisions when external) */
  externalActiveIndex?: number;
  /** Called when user clicks a non-focused room in external mode.
      Parent should navigate the journey to step (roomIndex + 1). */
  onNavigateToRoom?: (roomIndex: number) => void;
}

const RoomParade = forwardRef<RoomParadeHandle, RoomParadeProps>(function RoomParade(
  { onSelectRoom, currentRoom, externalControl = false, externalActiveIndex, onNavigateToRoom },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const railDotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const railLabelsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const initialIdx = FLOORS.findIndex(f => f.id === currentRoom);
  const safeInitial = initialIdx >= 0 ? initialIdx : 0;

  /* ── Internal navigation (only when NOT externally controlled) ── */
  const nav = useParadeNavigation({
    count: ROOM_COUNT,
    initialIndex: safeInitial,
    stiffness: 0.038,
    damping: 0.73,
    wheelCooldown: 850,
  });

  /* ── Shared DOM update function ── */
  const updateDOM = useCallback((focusIndex: number) => {
    FLOORS.forEach((floor, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const tf = computeCardTransforms(i - focusIndex);
      applyTransforms(el, tf);
      el.style.zIndex = String(tf.zIndex);
    });

    const snapIdx = Math.round(focusIndex);
    const floor = FLOORS[Math.max(0, Math.min(ROOM_COUNT - 1, snapIdx))];
    if (labelRef.current) {
      labelRef.current.textContent = floor.name;
      labelRef.current.style.color = '#ffffff';
    }
    if (taglineRef.current) {
      taglineRef.current.textContent = floor.tagline;
      taglineRef.current.style.color = floor.accent;
    }

    FLOORS.forEach((f, i) => {
      const dot = railDotsRef.current[i];
      const label = railLabelsRef.current[i];
      const dist = Math.abs(i - focusIndex);
      const isNear = dist < 0.6;
      if (dot) {
        dot.style.backgroundColor = isNear ? f.accent : '#444';
        dot.style.boxShadow = isNear ? `0 0 10px ${f.accent}88` : 'none';
        dot.style.width = isNear ? '8px' : '5px';
        dot.style.height = isNear ? '8px' : '5px';
      }
      if (label) {
        label.style.color = isNear ? f.accent : '#555';
        label.style.opacity = isNear ? '1' : '0.5';
      }
    });
  }, []);

  /* ── Expose imperative handle ── */
  useImperativeHandle(ref, () => ({
    updateFrame: updateDOM,
    goTo: nav.goTo,
  }), [updateDOM, nav.goTo]);

  /* ── Self-driven mode: attach wheel + frame callback ── */
  useEffect(() => {
    if (externalControl) return;
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => nav.handleWheel(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [externalControl, nav.handleWheel]);

  useEffect(() => {
    if (externalControl) return;
    nav.onFrame(updateDOM);
  }, [externalControl, nav.onFrame, updateDOM]);

  /* ── Initial positioning ── */
  useEffect(() => {
    updateDOM(safeInitial);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derive activeIndex for rendering decisions ── */
  const activeIndex = externalControl
    ? (externalActiveIndex ?? safeInitial)
    : nav.activeIndex;

  const isAnimating = externalControl ? false : nav.isAnimating;

  /* ── Click ── */
  const handleCardClick = useCallback((index: number) => {
    if (index === activeIndex) {
      onSelectRoom(FLOORS[index].id);
    } else if (!externalControl) {
      nav.goTo(index);
    } else if (onNavigateToRoom) {
      onNavigateToRoom(index);
    }
  }, [activeIndex, onSelectRoom, externalControl, nav.goTo, onNavigateToRoom]);

  /* ── Floor-rail click ── */
  const handleRailClick = useCallback((index: number) => {
    if (externalControl) {
      if (index === activeIndex) {
        onSelectRoom(FLOORS[index].id);
      } else if (onNavigateToRoom) {
        onNavigateToRoom(index);
      }
    } else {
      nav.goTo(index);
    }
  }, [externalControl, activeIndex, onSelectRoom, nav.goTo, onNavigateToRoom]);

  const activeFloor = FLOORS[Math.max(0, Math.min(ROOM_COUNT - 1, activeIndex))];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: '#07070C' }}
    >
      {/* ── Ambient background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 45% 45%, ${activeFloor.accent}06 0%, transparent 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      {/* ── Perspective container ── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 46%' }}
      >
        <div style={{ position: 'relative', width: CARD_W, height: CARD_H, transformStyle: 'preserve-3d' }}>
          {FLOORS.map((floor, i) => {
            const Preview = PREVIEWS[i];
            const shouldMount = Math.abs(i - activeIndex) <= 1;
            return (
              <div
                key={floor.id}
                ref={el => { cardRefs.current[i] = el; }}
                onClick={() => handleCardClick(i)}
                style={{
                  position: 'absolute', inset: 0, width: CARD_W, height: CARD_H,
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transformStyle: 'preserve-3d', willChange: 'transform, opacity, filter',
                  backgroundColor: floor.darkBg,
                }}
              >
                {shouldMount && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <Preview />
                  </div>
                )}
                {!shouldMount && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: floor.darkBg }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.05) 40%, transparent 100%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${floor.accent}33, transparent)`, pointerEvents: 'none' }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Room info ── */}
      <div
        className="absolute pointer-events-none"
        style={{ left: '50%', bottom: 85, transform: 'translateX(-50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <div ref={taglineRef} style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: activeFloor.accent, textTransform: 'uppercase', opacity: 0.8 }}>
          {activeFloor.tagline}
        </div>
        <div ref={labelRef} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: '0.1em', color: '#ffffff', lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>
          {activeFloor.name}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
          ROOM {activeFloor.floor} OF {String(ROOM_COUNT).padStart(2, '0')}
        </div>
      </div>

      {/* ── Floor rail ── */}
      <div className="absolute flex flex-col items-center gap-5" style={{ right: 36, top: '50%', transform: 'translateY(-50%)' }}>
        {FLOORS.map((floor, i) => (
          <button
            key={floor.id}
            onClick={() => handleRailClick(i)}
            className="flex items-center gap-3 cursor-pointer group"
            style={{ background: 'none', border: 'none', padding: '4px 0' }}
          >
            <span
              ref={el => { railLabelsRef.current[i] = el; }}
              style={{
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 10, fontWeight: 600,
                letterSpacing: '0.05em', color: i === activeIndex ? floor.accent : '#555',
                opacity: i === activeIndex ? 1 : 0.5, transition: 'color 0.3s ease, opacity 0.3s ease',
                minWidth: 18, textAlign: 'right',
              }}
            >
              {floor.floor}
            </span>
            <div
              ref={el => { railDotsRef.current[i] = el; }}
              style={{
                width: i === activeIndex ? 8 : 5, height: i === activeIndex ? 8 : 5,
                borderRadius: '50%', backgroundColor: i === activeIndex ? floor.accent : '#444',
                boxShadow: i === activeIndex ? `0 0 10px ${floor.accent}88` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          </button>
        ))}
      </div>

      {/* ── Hints ── */}
      {!isAnimating && (
        <div className="absolute pointer-events-none" style={{ left: '50%', bottom: 38, transform: 'translateX(-50%)', textAlign: 'center', animation: 'paradeHintPulse 2.5s ease-in-out infinite' }}>
          <span style={{ fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
            Click room to enter
          </span>
        </div>
      )}
      {!isAnimating && activeIndex > 0 && (
        <div className="absolute pointer-events-none" style={{ left: '50%', top: 28, transform: 'translateX(-50%)', animation: 'paradeArrowUp 2s ease-in-out infinite' }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 9L8 2L15 9" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
      {!isAnimating && activeIndex < ROOM_COUNT - 1 && (
        <div className="absolute pointer-events-none" style={{ left: '50%', bottom: 15, transform: 'translateX(-50%)', animation: 'paradeArrowDown 2s ease-in-out infinite' }}>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1L8 8L15 1" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}

      <style>{`
        @keyframes paradeHintPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes paradeArrowUp { 0%, 100% { opacity: 0.6; transform: translateX(-50%) translateY(0); } 50% { opacity: 0.2; transform: translateX(-50%) translateY(-3px); } }
        @keyframes paradeArrowDown { 0%, 100% { opacity: 0.6; transform: translateX(-50%) translateY(0); } 50% { opacity: 0.2; transform: translateX(-50%) translateY(3px); } }
      `}</style>
    </div>
  );
});

export default RoomParade;