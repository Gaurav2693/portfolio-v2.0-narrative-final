import { useRef, useState, useCallback, useEffect } from 'react';
import type React from 'react';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

/* ═══════════════════════════════════════════════════════════════════════
   CHAIR ROLL SOUND TUNER
   ──────────────────────
   Interactive sampler page — drag inside the pad to hear each preset
   in real-time. Pick a favorite, copy the values back into the room.
   ═══════════════════════════════════════════════════════════════════════ */

interface Preset {
  id: string;
  name: string;
  tag: string;
  desc: string;
  osc1Type: OscillatorType;
  osc1Hz: number;
  osc2Type: OscillatorType;
  osc2Hz: number;
  filterHz: number;
  filterQ: number;
  /** velocity → gain multiplier */
  gainK: number;
  /** max gain cap */
  gainMax: number;
  /** velocity → pitch ramp for osc1 */
  pitchK1: number;
  /** velocity → pitch ramp for osc2 */
  pitchK2: number;
  accent: string;
}

const PRESETS: Preset[] = [
  {
    id: 'current',
    name: 'Carpet Rumble',
    tag: 'CURRENT',
    desc: 'The default. Low sawtooth growl + mid triangle hum through a muffled low-pass. Feels like heavy casters on thick carpet.',
    osc1Type: 'sawtooth', osc1Hz: 55,
    osc2Type: 'triangle',  osc2Hz: 180,
    filterHz: 300, filterQ: 1.5,
    gainK: 0.018, gainMax: 0.035,
    pitchK1: 8, pitchK2: 12,
    accent: '#00A87C',
  },
  {
    id: 'deep-rubber',
    name: 'Deep Rubber',
    tag: 'VARIANT A',
    desc: 'Heavier, sub-bass-forward. The casters are big and soft, the floor barely complains. Almost subsonic at rest.',
    osc1Type: 'sawtooth', osc1Hz: 35,
    osc2Type: 'triangle',  osc2Hz: 110,
    filterHz: 200, filterQ: 2.0,
    gainK: 0.022, gainMax: 0.04,
    pitchK1: 6, pitchK2: 9,
    accent: '#6366F1',
  },
  {
    id: 'office-tile',
    name: 'Office Tile',
    tag: 'VARIANT B',
    desc: 'Brighter and snappier — the chair rolls easily on smooth vinyl tile. Lighter midrange presence, wider filter.',
    osc1Type: 'sawtooth', osc1Hz: 80,
    osc2Type: 'triangle',  osc2Hz: 240,
    filterHz: 450, filterQ: 1.0,
    gainK: 0.016, gainMax: 0.032,
    pitchK1: 10, pitchK2: 14,
    accent: '#F59E0B',
  },
  {
    id: 'hardwood',
    name: 'Hardwood Scrape',
    tag: 'VARIANT C',
    desc: 'Square-wave grit adds scraping overtones. Feels like bare casters on wooden planks — a little bit aggressive.',
    osc1Type: 'sawtooth', osc1Hz: 95,
    osc2Type: 'square',    osc2Hz: 300,
    filterHz: 600, filterQ: 0.8,
    gainK: 0.014, gainMax: 0.028,
    pitchK1: 12, pitchK2: 16,
    accent: '#EF4444',
  },
  {
    id: 'smooth-glide',
    name: 'Smooth Glide',
    tag: 'VARIANT D',
    desc: 'Sine base instead of sawtooth — almost no harmonics. The gentlest option, like a premium chair on a mat.',
    osc1Type: 'sine',      osc1Hz: 42,
    osc2Type: 'triangle',  osc2Hz: 150,
    filterHz: 250, filterQ: 2.5,
    gainK: 0.020, gainMax: 0.038,
    pitchK1: 5, pitchK2: 8,
    accent: '#06B6D4',
  },
  {
    id: 'creaky-caster',
    name: 'Creaky Caster',
    tag: 'VARIANT E',
    desc: 'Higher filter Q adds resonance — the casters sing. A lived-in feel, like a well-used desk chair with personality.',
    osc1Type: 'sawtooth', osc1Hz: 48,
    osc2Type: 'square',    osc2Hz: 165,
    filterHz: 280, filterQ: 3.0,
    gainK: 0.020, gainMax: 0.036,
    pitchK1: 7, pitchK2: 11,
    accent: '#A855F7',
  },
];

/* ── Shared AudioContext ─────────────────────────────────────────────── */
let _ctx: AudioContext | null = null;
function getCtx() { if (!_ctx) _ctx = new AudioContext(); return _ctx; }

interface LiveNodes {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  preset: Preset;
}

/* ═════════════════════════════════════════════════════════════════════ */

export default function ChairSoundTuner() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('current');
  const [muted, setMuted] = useState(false);
  const nodesRef = useRef<LiveNodes | null>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const velRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const rafRef = useRef(0);
  const speedRef = useRef(0);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const active = PRESETS.find(p => p.id === activeId)!;

  /* Build / rebuild audio nodes for the active preset */
  const buildNodes = useCallback((preset: Preset) => {
    /* Tear down old */
    if (nodesRef.current) {
      try { nodesRef.current.osc1.stop(); } catch { /* */ }
      try { nodesRef.current.osc2.stop(); } catch { /* */ }
      nodesRef.current.osc1.disconnect();
      nodesRef.current.osc2.disconnect();
      nodesRef.current.filter.disconnect();
      nodesRef.current.gain.disconnect();
      nodesRef.current = null;
    }
    try {
      const ctx = getCtx();
      const osc1 = ctx.createOscillator();
      osc1.type = preset.osc1Type;
      osc1.frequency.value = preset.osc1Hz;
      const osc2 = ctx.createOscillator();
      osc2.type = preset.osc2Type;
      osc2.frequency.value = preset.osc2Hz;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = preset.filterHz;
      filter.Q.value = preset.filterQ;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      nodesRef.current = { osc1, osc2, filter, gain, preset };
    } catch { /* */ }
  }, []);

  /* Switch preset */
  useEffect(() => {
    buildNodes(active);
    return () => {
      if (nodesRef.current) {
        try { nodesRef.current.osc1.stop(); } catch { /* */ }
        try { nodesRef.current.osc2.stop(); } catch { /* */ }
        nodesRef.current.osc1.disconnect();
        nodesRef.current.osc2.disconnect();
        nodesRef.current.filter.disconnect();
        nodesRef.current.gain.disconnect();
        nodesRef.current = null;
      }
    };
  }, [active, buildNodes]);

  /* rAF loop — smoothes velocity and drives audio */
  useEffect(() => {
    let frameCount = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const v = velRef.current;
      /* Decay */
      v.x *= 0.88;
      v.y *= 0.88;
      const speed = Math.sqrt(v.x * v.x + v.y * v.y);
      speedRef.current = speed;
      /* Update display every ~6 frames for performance */
      frameCount++;
      if (frameCount % 6 === 0) setLiveSpeed(speed);

      const n = nodesRef.current;
      if (!n || muted) {
        if (n) n.gain.gain.setTargetAtTime(0, getCtx().currentTime, 0.02);
        return;
      }
      const ctx = getCtx();
      const now = ctx.currentTime;
      const p = n.preset;
      const vol = Math.min(speed * p.gainK, p.gainMax);
      n.gain.gain.setTargetAtTime(vol, now, 0.04);
      n.osc1.frequency.setTargetAtTime(p.osc1Hz + speed * p.pitchK1, now, 0.06);
      n.osc2.frequency.setTargetAtTime(p.osc2Hz + speed * p.pitchK2, now, 0.06);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [muted]);

  /* Pad mouse tracking */
  const onPadMove = useCallback((e: React.MouseEvent) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const v = velRef.current;
    v.x = x - v.px;
    v.y = y - v.py;
    v.px = x;
    v.py = y;
  }, []);

  const onPadLeave = useCallback(() => {
    velRef.current.x = 0;
    velRef.current.y = 0;
  }, []);

  const onPadEnter = useCallback((e: React.MouseEvent) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    velRef.current.px = e.clientX - rect.left;
    velRef.current.py = e.clientY - rect.top;
  }, []);

  /* Speed meter segments */
  const meterPct = Math.min(liveSpeed / 12, 1);

  return (
    <div className="min-h-screen" style={{ background: '#0C0C0E', color: '#E0E0E0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ArrowLeft size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.4)' }}>BACK</span>
          </button>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 10, letterSpacing: 5, color: 'rgba(206,48,46,0.5)' }}>ROOM 03 · SOUND LAB</div>
            <h1 style={{ fontFamily: "'Caladea', serif", fontSize: 20, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>Chair Roll Sound Tuner</h1>
          </div>
        </div>
        <button onClick={() => setMuted(m => !m)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer" style={{ background: muted ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${muted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
          {muted ? <VolumeX size={14} style={{ color: 'rgba(239,68,68,0.7)' }} /> : <Volume2 size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: muted ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.4)' }}>{muted ? 'UNMUTE' : 'AUDIO ON'}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8" style={{ minHeight: 'calc(100vh - 65px)' }}>
        {/* Left: Preset cards */}
        <div className="flex-1 flex flex-col gap-3">
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>SELECT PRESET</div>
          {PRESETS.map(p => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className="text-left rounded-xl p-4 transition-all duration-200 cursor-pointer"
                style={{
                  background: isActive ? `linear-gradient(135deg, ${p.accent}12 0%, ${p.accent}04 100%)` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? p.accent + '30' : 'rgba(255,255,255,0.04)'}`,
                  boxShadow: isActive ? `0 0 20px ${p.accent}10` : 'none',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: isActive ? p.accent : 'rgba(255,255,255,0.1)', boxShadow: isActive ? `0 0 8px ${p.accent}80` : 'none', transition: 'all 300ms ease' }} />
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: isActive ? p.accent : 'rgba(255,255,255,0.5)' }}>{p.name}</span>
                  <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.15)', marginLeft: 'auto' }}>{p.tag}</span>
                </div>
                <p style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11.5, lineHeight: 1.55, color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)' }}>{p.desc}</p>

                {/* Parameter pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    `${p.osc1Type.toUpperCase()} ${p.osc1Hz}Hz`,
                    `${p.osc2Type.toUpperCase()} ${p.osc2Hz}Hz`,
                    `LPF ${p.filterHz}Hz`,
                    `Q ${p.filterQ}`,
                  ].map((label, i) => (
                    <span key={i} className="px-2 py-0.5 rounded" style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9.5, letterSpacing: 0.5, background: isActive ? `${p.accent}10` : 'rgba(255,255,255,0.03)', color: isActive ? `${p.accent}AA` : 'rgba(255,255,255,0.15)', border: `1px solid ${isActive ? `${p.accent}18` : 'rgba(255,255,255,0.03)'}` }}>{label}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Interactive drag pad */}
        <div className="w-[380px] flex flex-col gap-5 flex-shrink-0">
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>DRAG PAD</div>

          {/* The pad */}
          <div
            ref={padRef}
            onMouseMove={onPadMove}
            onMouseLeave={onPadLeave}
            onMouseEnter={onPadEnter}
            className="relative rounded-2xl overflow-hidden cursor-crosshair"
            style={{
              width: '100%',
              aspectRatio: '1',
              background: `radial-gradient(ellipse at center, ${active.accent}08 0%, transparent 70%), rgba(255,255,255,0.015)`,
              border: `1px solid ${active.accent}18`,
              transition: 'border-color 400ms ease, background 400ms ease',
            }}
          >
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.06 }}>
              {Array.from({ length: 9 }, (_, i) => {
                const pct = ((i + 1) / 10) * 100;
                return (
                  <g key={i}>
                    <line x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="white" strokeWidth="0.5" />
                    <line x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="white" strokeWidth="0.5" />
                  </g>
                );
              })}
            </svg>

            {/* Center chair icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${active.accent}08`, border: `1px solid ${active.accent}15` }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                    <path d="M17 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                    <path d="M12 18V6" />
                    <path d="M7 10h10" />
                    <path d="M6 6h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z" />
                  </svg>
                </div>
                {/* Pulsing ring when active */}
                <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${active.accent}25`, animation: liveSpeed > 0.5 ? 'tuner-pulse 1.2s ease-in-out infinite' : 'none', opacity: Math.min(liveSpeed / 5, 1) }} />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none" style={{ fontFamily: "'Cambay', sans-serif", fontSize: 10.5, letterSpacing: 0.8, color: 'rgba(255,255,255,0.18)' }}>
              Move your mouse here to hear the sound
            </div>
          </div>

          {/* Speed meter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.2)' }}>VELOCITY</span>
              <span style={{ fontFamily: "'Cambay', sans-serif", fontSize: 11, color: active.accent, opacity: 0.7 }}>{liveSpeed.toFixed(1)} px/f</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="h-full rounded-full transition-all duration-75" style={{ width: `${meterPct * 100}%`, background: `linear-gradient(90deg, ${active.accent}60, ${active.accent})`, boxShadow: meterPct > 0.05 ? `0 0 8px ${active.accent}40` : 'none' }} />
            </div>
          </div>

          {/* Live frequency display */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>LIVE OUTPUT</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>OSC 1</div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 14, color: active.accent, opacity: 0.8 }}>{(active.osc1Hz + liveSpeed * active.pitchK1).toFixed(0)} <span style={{ fontSize: 9, opacity: 0.5 }}>Hz</span></div>
              </div>
              <div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>OSC 2</div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 14, color: active.accent, opacity: 0.8 }}>{(active.osc2Hz + liveSpeed * active.pitchK2).toFixed(0)} <span style={{ fontSize: 9, opacity: 0.5 }}>Hz</span></div>
              </div>
              <div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>GAIN</div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 14, color: active.accent, opacity: 0.8 }}>{(Math.min(liveSpeed * active.gainK, active.gainMax) * 1000).toFixed(1)} <span style={{ fontSize: 9, opacity: 0.5 }}>×10⁻³</span></div>
              </div>
              <div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.15)', marginBottom: 2 }}>FILTER</div>
                <div style={{ fontFamily: "'Cambay', sans-serif", fontSize: 14, color: active.accent, opacity: 0.8 }}>{active.filterHz} <span style={{ fontSize: 9, opacity: 0.5 }}>Hz LP</span></div>
              </div>
            </div>
          </div>

          {/* Copy hint */}
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <p style={{ fontFamily: "'Cambay', sans-serif", fontSize: 10.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.2)' }}>
              Pick the preset that feels right, then tell me which one to apply to the gaming chair in Room 03. I'll update the frequencies, filter, and gain scaling.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tuner-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}