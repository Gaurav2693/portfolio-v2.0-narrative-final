import { useState, useCallback, memo } from 'react';
import InteractiveRoomBg from './interactive-room-bg';
import InteractiveGarageBg from './interactive-garage-bg';
import InteractiveThinkingBg from './interactive-thinking-bg';
import InteractivePrototypeBg from './interactive-prototype-bg';

/* ═══════════════════════════════════════════════════════════════════════
   AXONOMETRIC STACK  —  Phase 2 (Live Rooms)
   ────────────────────
   A CSS 3D isometric view of all 4 rooms as stacked floor plates.
   Each floor renders the ACTUAL room artwork via `preview` mode —
   the rooms render their Figma SVGs without any interaction layers,
   rAF loops, canvases, or event listeners.

   Color correction: Rooms in normal mode get dark-themed wall colors
   via DOM manipulation (which preview mode skips). We compensate by
   overlaying each room's dark-theme BG color via mix-blend-mode so
   the miniature previews match the dark aesthetic.

   Performance contract:
   - Zero rAF loops (rooms skip them in preview mode)
   - Zero interaction canvases (ForceField, dust, FX all skipped)
   - Only hover/click CSS transitions on floor plates
   - `contain: strict` on each room's preview wrapper
   - `pointerEvents: none` on the room artwork layer
   ═══════════════════════════════════════════════════════════════════════ */

type RoomId = 'studio' | 'garage' | 'room3' | 'room4';

interface FloorMeta {
  id: RoomId;
  floor: string;
  name: string;
  accent: string;
  /** Dark-theme background color for this room */
  darkBg: string;
  /** How much to darken the raw Figma artwork (0 = none, 1 = full overlay) */
  tintOpacity: number;
}

const FLOORS: FloorMeta[] = [
  {
    id: 'studio', floor: '01', name: 'THE DESIGN STUDIO',
    accent: '#00EAFF', darkBg: '#C8CDD8', tintOpacity: 0.0,
  },
  {
    id: 'garage', floor: '02', name: 'THE GARAGE',
    accent: '#F59E0B', darkBg: '#1a1510', tintOpacity: 0.72,
  },
  {
    id: 'room3', floor: '03', name: 'HOW I THINK',
    accent: '#40F0AA', darkBg: '#0d1a17', tintOpacity: 0.68,
  },
  {
    id: 'room4', floor: '04', name: 'PROTOTYPE LAB',
    accent: '#E8501A', darkBg: '#0D1118', tintOpacity: 0.65,
  },
];

/* ── Layout constants ── */
const PLATE_W = 805;
const PLATE_H = 609;
const FLOOR_GAP = 90;
const TOTAL_H = FLOORS.length * PLATE_H + (FLOORS.length - 1) * FLOOR_GAP;

/* ── Memoized room previews to prevent re-renders on hover ── */
const StudioPreview = memo(() => <InteractiveRoomBg preview />);
const GaragePreview = memo(() => <InteractiveGarageBg preview />);
const ThinkingPreview = memo(() => <InteractiveThinkingBg preview />);
const PrototypePreview = memo(() => <InteractivePrototypeBg preview />);
StudioPreview.displayName = 'StudioPreview';
GaragePreview.displayName = 'GaragePreview';
ThinkingPreview.displayName = 'ThinkingPreview';
PrototypePreview.displayName = 'PrototypePreview';

const ROOM_PREVIEWS: Record<RoomId, React.FC> = {
  studio: StudioPreview,
  garage: GaragePreview,
  room3:  ThinkingPreview,
  room4:  PrototypePreview,
};

interface AxonometricStackProps {
  onSelectRoom: (room: RoomId) => void;
  currentRoom: RoomId;
}

export default function AxonometricStack({ onSelectRoom, currentRoom }: AxonometricStackProps) {
  const [hoveredFloor, setHoveredFloor] = useState<RoomId | null>(null);

  const handleFloorClick = useCallback((id: RoomId) => {
    onSelectRoom(id);
  }, [onSelectRoom]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#08080E' }}
    >
      {/* ── Perspective camera ── */}
      <div
        style={{
          perspective: '2200px',
          perspectiveOrigin: '50% 42%',
        }}
      >
        {/* ── Isometric rotation wrapper ──
             Native room dimensions (805x609) used for pixel-perfect artwork.
             Scale adjusted to fit inside the 1315x893 card after rotation. */}
        <div
          style={{
            position: 'relative',
            width: PLATE_W,
            height: TOTAL_H,
            transformStyle: 'preserve-3d',
            transform: 'rotateX(55deg) rotateY(-45deg) scale(0.33)',
            transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* ── Vertical spine (elevator shaft) ── */}
          <div
            style={{
              position: 'absolute',
              left: PLATE_W / 2 - 1,
              top: 0,
              width: 2,
              height: TOTAL_H,
              background: 'linear-gradient(to bottom, rgba(64,240,170,0.0) 0%, rgba(64,240,170,0.10) 10%, rgba(64,240,170,0.10) 90%, rgba(64,240,170,0.0) 100%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* ── Floor plates with live room artwork ── */}
          {FLOORS.map((floor, i) => {
            const isActive = currentRoom === floor.id;
            const isHovered = hoveredFloor === floor.id;
            const yOffset = i * (PLATE_H + FLOOR_GAP);
            const RoomPreview = ROOM_PREVIEWS[floor.id];

            return (
              <div
                key={floor.id}
                onClick={() => handleFloorClick(floor.id)}
                onMouseEnter={() => setHoveredFloor(floor.id)}
                onMouseLeave={() => setHoveredFloor(null)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: yOffset,
                  width: PLATE_W,
                  height: PLATE_H,
                  cursor: 'pointer',
                  transformStyle: 'preserve-3d',
                  transform: isHovered ? 'translateZ(28px)' : 'translateZ(0px)',
                  transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  zIndex: isHovered ? 10 : 1,
                }}
              >
                {/* ── Floor plate container ── */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: floor.darkBg,
                    border: `1px solid ${isHovered || isActive ? floor.accent + '50' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: isHovered
                      ? `0 0 80px ${floor.accent}20, 0 30px 60px rgba(0,0,0,0.7)`
                      : isActive
                        ? `0 0 40px ${floor.accent}12, 0 15px 40px rgba(0,0,0,0.5)`
                        : '0 10px 40px rgba(0,0,0,0.5)',
                    transition: 'border-color 0.4s ease, box-shadow 0.5s ease',
                  }}
                >
                  {/* ── Live room artwork (non-interactive) ── */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                    }}
                  >
                    <RoomPreview />
                  </div>

                  {/* ── Dark-theme color correction overlay ──
                       The rooms' Figma SVGs have their original export colors
                       (e.g. blue for Garage, teal for Prototype). In normal mode,
                       these get overridden via DOM manipulation. In preview mode,
                       we approximate the dark theme by overlaying the target BG
                       color with mix-blend-mode: multiply. This darkens the light
                       Figma backgrounds to the intended palette while preserving
                       the furniture/object silhouettes. */}
                  {floor.tintOpacity > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: floor.darkBg,
                        opacity: floor.tintOpacity,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* ── Darkening veil for label readability ── */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: isHovered
                        ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.1) 100%)'
                        : 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.2) 100%)',
                      transition: 'background 0.4s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* ── Top accent edge glow ── */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '5%',
                      right: '5%',
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${floor.accent}${isHovered ? '88' : '44'}, transparent)`,
                      transition: 'all 0.4s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* ── Room name overlay (bottom-left) ── */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 28,
                      bottom: 24,
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 14,
                        letterSpacing: '0.35em',
                        color: floor.accent,
                        opacity: isHovered ? 0.95 : 0.6,
                        transition: 'opacity 0.3s ease',
                        lineHeight: 1,
                      }}
                    >
                      ROOM {floor.floor}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 42,
                        letterSpacing: '0.08em',
                        color: '#ffffff',
                        opacity: isHovered ? 1 : 0.75,
                        transition: 'opacity 0.3s ease',
                        lineHeight: 1,
                        textShadow: '0 2px 16px rgba(0,0,0,0.8)',
                      }}
                    >
                      {floor.name}
                    </span>
                  </div>
                </div>

                {/* ── Floor number label (floating right) ── */}
                <div
                  style={{
                    position: 'absolute',
                    right: -110,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: isHovered || isActive ? floor.accent : '#555',
                      boxShadow: isHovered ? `0 0 12px ${floor.accent}99` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                      fontSize: 24,
                      fontWeight: 700,
                      color: isHovered || isActive ? floor.accent : '#555',
                      opacity: isHovered ? 1 : 0.6,
                      letterSpacing: '0.05em',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {floor.floor}
                  </span>
                </div>

                {/* ── Active room indicator (left side) ── */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: -55,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: floor.accent,
                        boxShadow: `0 0 14px ${floor.accent}bb`,
                        animation: 'axonPulse 2s ease-in-out infinite',
                      }}
                    />
                  </div>
                )}

                {/* ── "Depth" edge (bottom face illusion) ── */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: -8,
                    height: 8,
                    borderRadius: '0 0 8px 8px',
                    background: `linear-gradient(to bottom, rgba(30,30,40,0.8), rgba(15,15,20,0.4))`,
                    transform: 'rotateX(-90deg)',
                    transformOrigin: 'top center',
                    opacity: 0.7,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: '#7A7A90',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}
        >
          Select a floor to enter
        </span>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes axonPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
