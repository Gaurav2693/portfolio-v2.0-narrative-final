import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Wrench, Brain, Cpu } from 'lucide-react';
import { Layers } from 'lucide-react';
import { useSound } from '@/app/context/sound-context';

/* ═══════════════════════════════════════════════════════════════════════
   ROOM DOCK  —  Right-edge quick room switcher
   ─────────────────────────────────────────────
   Dark glass vertical rail with 4 room icons.
   Hover → callout slides left with room name + tagline.
   Active room = accent glow + right bar indicator.
   Only rendered inside the Command Center room system.
   ═══════════════════════════════════════════════════════════════════════ */

type RoomId = 'studio' | 'garage' | 'room3' | 'room4';

interface RoomMeta {
  id: RoomId;
  name: string;
  tagline: string;
  accent: string;
  icon: typeof Monitor;
}

const ROOMS: RoomMeta[] = [
  { id: 'studio',  name: 'STUDIO',        tagline: 'Creative workspace',            accent: '#00EAFF', icon: Monitor },
  { id: 'garage',  name: 'GARAGE',         tagline: 'Tools & process',               accent: '#F59E0B', icon: Wrench },
  { id: 'room3',   name: 'THINKING',       tagline: 'Mental models & frameworks',    accent: '#40F0AA', icon: Brain },
  { id: 'room4',   name: 'PROTOTYPE LAB',  tagline: 'Engineering & prototyping',     accent: '#E8501A', icon: Cpu },
];

interface RoomDockProps {
  currentRoom: RoomId;
  onSwitchRoom: (room: RoomId) => void;
  onEnterOverview?: () => void;
}

export default function RoomDock({ currentRoom, onSwitchRoom, onEnterOverview }: RoomDockProps) {
  const { playClick } = useSound();
  const [hoveredId, setHoveredId] = useState<RoomId | null>(null);
  const [hasAnimated, setHasAnimated] = useState(() =>
    sessionStorage.getItem('roomDockAnimated') === 'true'
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Sequential glow-pulse state ──────────────────────────────────
     One-time per session: each dock icon springs to life with its
     accent-colored glow in sequence, then returns to normal.
     ────────────────────────────────────────────────────────────────── */
  const [pulseIndex, setPulseIndex] = useState(-1); // -1 = not started, 0-3 = pulsing that icon, 4 = done

  useEffect(() => {
    // Start sequence 1.5s after mount
    const startDelay = setTimeout(() => setPulseIndex(0), 1500);

    // Each icon pulses for ~700ms, staggered 650ms apart for lengthier feel
    const timers: ReturnType<typeof setTimeout>[] = [startDelay];
    for (let i = 1; i <= 4; i++) {
      timers.push(setTimeout(() => setPulseIndex(i), 1500 + i * 650));
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!hasAnimated) {
      const t = setTimeout(() => {
        sessionStorage.setItem('roomDockAnimated', 'true');
        setHasAnimated(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [hasAnimated]);

  const handleClick = (room: RoomId) => {
    if (room === currentRoom) return;
    playClick();
    onSwitchRoom(room);
  };

  const handleMouseEnter = (id: RoomId) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => setHoveredId(null), 120);
  };

  return (
    <div
      className="hidden lg:flex absolute right-0 z-50 flex-col items-center"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        animation: hasAnimated ? 'none' : 'roomDockSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        opacity: hasAnimated ? 1 : 0,
      }}
    >
      {/* ── Rail background ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(14,14,22,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '11px 0 0 11px',
          boxShadow: '-6px 0 30px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.04)',
        }}
      />

      {/* ── Icons ── */}
      <div
        className="relative flex flex-col items-center gap-[6px]"
        style={{ padding: '14px 7px' }}
      >
        {ROOMS.map((room, i) => {
          const isActive = currentRoom === room.id;
          const isHovered = hoveredId === room.id;
          const isPulsing = pulseIndex === i;

          return (
            <div
              key={room.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(room.id)}
              onMouseLeave={handleMouseLeave}
              style={{
                animation: hasAnimated
                  ? 'none'
                  : `roomDockIconFadeIn 0.35s ease-out ${0.3 + i * 0.08}s both`,
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="roomDockActiveBar"
                  style={{
                    position: 'absolute',
                    right: -7,
                    top: 4,
                    bottom: 4,
                    width: 3,
                    borderRadius: '2px 0 0 2px',
                    backgroundColor: room.accent,
                    boxShadow: `0 0 8px ${room.accent}66`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon button */}
              <button
                onClick={() => handleClick(room.id)}
                aria-label={`Go to ${room.name}`}
                className="relative flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: isPulsing
                    ? `${room.accent}20`
                    : isActive
                      ? `${room.accent}10`
                      : isHovered
                        ? 'rgba(255,255,255,0.04)'
                        : 'transparent',
                  cursor: isActive ? 'default' : 'pointer',
                  transform: isPulsing
                    ? 'scale(1.18)'
                    : isHovered && !isActive
                      ? 'scale(1.06)'
                      : 'scale(1)',
                  boxShadow: isPulsing
                    ? `0 0 24px 8px ${room.accent}44, 0 0 48px 16px ${room.accent}18`
                    : isActive
                      ? `0 0 12px 2px ${room.accent}22`
                      : 'none',
                  transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background-color 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                {/* Soft glow halo — no borders */}
                {isPulsing && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: 14,
                      background: `radial-gradient(circle, ${room.accent}18 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <room.icon
                  size={18}
                  strokeWidth={isPulsing ? 2.2 : 1.8}
                  fill={isPulsing ? room.accent : 'none'}
                  style={{
                    color: isPulsing
                      ? room.accent
                      : isActive
                        ? room.accent
                        : isHovered
                          ? '#c8c8d8'
                          : '#7A7A90',
                    transition: 'color 0.35s ease, filter 0.35s ease, fill 0.35s ease',
                    filter: isPulsing
                      ? `drop-shadow(0 0 10px ${room.accent}CC) drop-shadow(0 0 4px ${room.accent}88)`
                      : isActive
                        ? `drop-shadow(0 0 4px ${room.accent}55)`
                        : 'none',
                  }}
                />
              </button>

              {/* ── Hover callout ── */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={() => handleMouseEnter(room.id)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      position: 'absolute',
                      right: 44,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 60,
                      pointerEvents: 'auto',
                    }}
                  >
                    {/* Arrow pointer */}
                    <div
                      style={{
                        position: 'absolute',
                        right: -5,
                        top: '50%',
                        transform: 'translateY(-50%) rotate(45deg)',
                        width: 10,
                        height: 10,
                        backgroundColor: '#111118',
                        boxShadow: '2px -2px 6px rgba(0,0,0,0.3)',
                      }}
                    />
                    {/* Panel */}
                    <div
                      style={{
                        position: 'relative',
                        backgroundColor: '#111118',
                        borderRadius: 8,
                        padding: '8px 14px',
                        minWidth: 160,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
                      }}
                    >
                      {/* Top accent line */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 12,
                          right: 12,
                          height: 1,
                          background: `linear-gradient(90deg, transparent, ${room.accent}55, transparent)`,
                          borderRadius: 1,
                        }}
                      />
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          color: room.accent,
                          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                          lineHeight: 1,
                          marginBottom: 4,
                        }}
                      >
                        {room.name}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11,
                          color: '#7A7A90',
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {room.tagline}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 5,
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: room.accent,
                            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                            opacity: 0.7,
                          }}
                        >
                          ● CURRENT
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* ── Separator + Overview button ── */}
        {onEnterOverview && (
          <>
            <div
              style={{
                width: 20,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                margin: '2px 0',
              }}
            />
            <button
              onClick={onEnterOverview}
              aria-label="Building overview"
              className="relative flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(64,240,170,0.08)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <Layers
                size={18}
                strokeWidth={1.8}
                style={{
                  color: '#7A7A90',
                  transition: 'color 0.3s ease',
                }}
              />
            </button>
          </>
        )}
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes roomDockSlideIn {
          from { transform: translateY(-50%) translateX(100%); opacity: 0; }
          to   { transform: translateY(-50%) translateX(0);    opacity: 1; }
        }
        @keyframes roomDockIconFadeIn {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}