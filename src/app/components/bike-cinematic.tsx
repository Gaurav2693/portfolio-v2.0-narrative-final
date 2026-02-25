import { useRef, useEffect, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   BIKE CINEMATIC — Engine Heartbeat → Terrain Roulette + Weather Window
   ─────────────────────────────────────────────────────────────────────
   Multi-phase cinematic animation for the adventure bike.
   Answers: "Why an adventure bike? Why not other formats?"

   Phase 1 — ENGINE HEARTBEAT (0-3s)
     Warm amber glow pulses beneath the bike.  Engine idle starts,
     RPM climbs with increasing vibration.  Startup flash + flicker.

   Phase 2 — TERRAIN ROULETTE + WEATHER (3-11s)
     5 surfaces morph beneath the bike with paired weather FX:
       ASPHALT + clear · GRAVEL + drizzle · MUD + downpour
       SNOW + snowfall · SAND + sandstorm
     Ground particles, weather particles, atmospheric tint.

   Phase 3 — RESOLUTION (11-14s)
     Weather fades.  Tagline glitch-decodes.  Engine settles.

   Renders via <canvas> (glow, particles, tachometer, dots)
   + HTML overlays (terrain label, tagline, subtitle).
   Sound via Web Audio API (engine oscillators + terrain impacts).
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Timing (ms) ─────────────────────────────────────────────────────── */
const TOTAL   = 14000;
const HB_END  = 3000;
const T_START = 3000;
const T_DUR   = 1600;
const T_END   = T_START + 5 * T_DUR;   // 11000
const R_START = T_END;

/* ── Terrains ────────────────────────────────────────────────────────── */
const TERRAINS = [
  { name: 'ASPHALT', sub: 'WHERE IT BEGINS',    ground: [42,42,42],      weather: 'clear'     },
  { name: 'GRAVEL',  sub: 'THE UNTAMED PATH',   ground: [107,90,62],     weather: 'drizzle'   },
  { name: 'MUD',     sub: 'WHERE OTHERS STOP',   ground: [74,53,32],      weather: 'rain'      },
  { name: 'SNOW',    sub: 'SILENCE ABOVE',       ground: [200,216,232],   weather: 'snow'      },
  { name: 'SAND',    sub: 'NO HORIZON',          ground: [184,152,80],    weather: 'sandstorm' },
] as const;

const GLITCH_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&*';
const TAGLINE  = 'EVERY FORECAST IS A GREEN LIGHT';
const SUBTITLE = '5 TERRAINS \u00B7 ONE MACHINE';

/* ── Math helpers ────────────────────────────────────────────────────── */
function easeOut(t: number) { return 1 - (1 - t) * (1 - t) * (1 - t); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

/* ── Particle ────────────────────────────────────────────────────────── */
interface WP {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; life: number; maxLife: number;
  type: 'rain' | 'snow' | 'sand' | 'splash' | 'heat';
}

const mkRain = (cw: number): WP => ({
  x: Math.random() * (cw + 60) - 30, y: -10 - Math.random() * 40,
  vx: -1.5 - Math.random() * 1.5, vy: 8 + Math.random() * 6,
  size: 1, opacity: 0.15 + Math.random() * 0.25,
  life: 0, maxLife: 100, type: 'rain',
});
const mkSnow = (cw: number): WP => ({
  x: Math.random() * (cw + 40) - 20, y: -5 - Math.random() * 20,
  vx: -0.8 + (Math.random() - 0.5) * 1.2, vy: 1.2 + Math.random() * 1.8,
  size: 1.5 + Math.random() * 3, opacity: 0.35 + Math.random() * 0.4,
  life: 0, maxLife: 280, type: 'snow',
});
const mkSand = (cw: number, ch: number): WP => ({
  x: cw + 10 + Math.random() * 30, y: Math.random() * ch * 0.7,
  vx: -4 - Math.random() * 5, vy: (Math.random() - 0.5) * 0.8,
  size: 0.5 + Math.random() * 1.5, opacity: 0.2 + Math.random() * 0.3,
  life: 0, maxLife: 200, type: 'sand',
});
const mkSplash = (cx: number, gy: number): WP => ({
  x: cx + (Math.random() - 0.5) * 80, y: gy,
  vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 3,
  size: 0.5 + Math.random(), opacity: 0.35 + Math.random() * 0.3,
  life: 0, maxLife: 25 + Math.random() * 15, type: 'splash',
});
const mkHeat = (cx: number, gy: number): WP => ({
  x: cx + (Math.random() - 0.5) * 100, y: gy - Math.random() * 30,
  vx: (Math.random() - 0.5) * 0.3, vy: -0.2 - Math.random() * 0.3,
  size: 3 + Math.random() * 5, opacity: 0.05 + Math.random() * 0.08,
  life: 0, maxLife: 80 + Math.random() * 40, type: 'heat',
});

/* ── Audio context singleton ─────────────────────────────────────────── */
let _ac: AudioContext | null = null;
function ac() { if (!_ac) _ac = new AudioContext(); return _ac; }

/* ═════════════════════════════════════════════════════════════════════ */

interface BikeCinematicProps {
  active: boolean;
  bikeBounds: { x: number; y: number; w: number; h: number };
  canvasWidth: number;
  canvasHeight: number;
}

export function BikeCinematic({
  active, bikeBounds: bk, canvasWidth: cw, canvasHeight: ch,
}: BikeCinematicProps) {

  /* ── Refs ──────────────────────────────────────────────────── */
  const cvRef       = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef(0);
  const t0Ref       = useRef(0);
  const ptsRef      = useRef<WP[]>([]);
  const tIdxRef     = useRef(-1);
  const resolvedRef = useRef(false);
  const glitchIvRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Sound refs */
  const oscRef  = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  /* DOM refs for 60-fps text updates (no re-render) */
  const terrainNameRef = useRef<HTMLDivElement>(null);
  const terrainSubRef  = useRef<HTMLDivElement>(null);
  const countRef       = useRef<HTMLDivElement>(null);
  const taglineRef     = useRef<HTMLDivElement>(null);
  const subtitleRef    = useRef<HTMLDivElement>(null);

  /* Stable bounds ref */
  const bkRef = useRef(bk);
  bkRef.current = bk;

  /* ── Engine sound ─────────────────────────────────────────── */
  const startEngine = useCallback(() => {
    try {
      /* Stop any lingering engine */
      oscRef.current.forEach(o => { try { o.stop(); } catch { /* */ } });
      oscRef.current = [];

      const ctx = ac();
      const now = ctx.currentTime;

      /* ── Phase 0: Mechanical kick (noise burst + pitch drop) ── */
      const kickBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
      const kickData = kickBuf.getChannelData(0);
      for (let i = 0; i < kickData.length; i++) {
        kickData[i] = (Math.random() * 2 - 1) * (1 - i / kickData.length);
      }
      const kick = ctx.createBufferSource(); kick.buffer = kickBuf;
      const kickFilt = ctx.createBiquadFilter();
      kickFilt.type = 'lowpass'; kickFilt.frequency.value = 900;
      kickFilt.frequency.setTargetAtTime(200, now, 0.04);
      const kickG = ctx.createGain();
      kickG.gain.setValueAtTime(0.07, now);
      kickG.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      kick.connect(kickFilt); kickFilt.connect(kickG); kickG.connect(ctx.destination);
      kick.start(now);

      /* ── Phase 1: Engine oscillators with stuttering start ──── */
      const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = 55;
      const o2 = ctx.createOscillator(); o2.type = 'sine';     o2.frequency.value = 110;
      const lfo = ctx.createOscillator(); lfo.type = 'sine';   lfo.frequency.value = 3;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.012;
      const main = ctx.createGain();

      o1.connect(main); o2.connect(main);
      lfo.connect(lfoG); lfoG.connect(main.gain);
      main.connect(ctx.destination);

      /* Stuttering envelope: kick → cough → cough → catch → idle */
      main.gain.setValueAtTime(0, now);
      main.gain.setValueAtTime(0, now + 0.15);
      main.gain.linearRampToValueAtTime(0.012, now + 0.3);   // first cough
      main.gain.linearRampToValueAtTime(0.003, now + 0.45);  // dip
      main.gain.linearRampToValueAtTime(0.018, now + 0.65);  // second cough
      main.gain.linearRampToValueAtTime(0.006, now + 0.8);   // small dip
      main.gain.linearRampToValueAtTime(0.022, now + 1.1);   // catches!
      main.gain.linearRampToValueAtTime(0.025, now + 1.8);   // smooth idle

      /* Stutter modulation: rapid square-wave gain mod for first 1s */
      const stutter = ctx.createOscillator(); stutter.type = 'square';
      stutter.frequency.value = 9;
      const stuttG = ctx.createGain(); stuttG.gain.value = 0.015;
      stutter.connect(stuttG); stuttG.connect(main.gain);
      stuttG.gain.setTargetAtTime(0, now + 0.6, 0.2);

      o1.start(now + 0.15); o2.start(now + 0.15);
      lfo.start(now + 0.15); stutter.start(now + 0.15);
      stutter.stop(now + 2);

      oscRef.current = [o1, o2, lfo];
      gainRef.current = main;
    } catch { /* Web Audio may be blocked */ }
  }, []);

  const updateRPM = useCallback((rpm: number) => {
    const f  = 55  + ((rpm - 800) / 5200) * 145;
    const lf = 3   + ((rpm - 800) / 5200) * 8;
    try {
      const t = ac().currentTime;
      oscRef.current[0]?.frequency.setTargetAtTime(f,      t, 0.08);
      oscRef.current[1]?.frequency.setTargetAtTime(f * 2,  t, 0.08);
      oscRef.current[2]?.frequency.setTargetAtTime(lf,     t, 0.08);
    } catch { /* */ }
  }, []);

  const stopEngine = useCallback(() => {
    try {
      if (gainRef.current) {
        gainRef.current.gain.setTargetAtTime(0, ac().currentTime, 0.35);
      }
      const refs = [...oscRef.current];
      setTimeout(() => { refs.forEach(o => { try { o.stop(); } catch { /* */ } }); }, 1200);
      oscRef.current = [];
      gainRef.current = null;
    } catch { /* */ }
  }, []);

  const playImpact = useCallback((idx: number) => {
    try {
      const ctx = ac();
      const hz = [200, 150, 100, 280, 160][idx];
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz;
      const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.04, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.start(); o.stop(ctx.currentTime + 0.12);
    } catch { /* */ }
  }, []);

  /* ── Main animation loop ──────────────────────────────────── */
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      stopEngine();
      ptsRef.current = [];
      tIdxRef.current = -1;
      resolvedRef.current = false;
      if (glitchIvRef.current) { clearInterval(glitchIvRef.current); glitchIvRef.current = null; }
      /* Reset text */
      [terrainNameRef, terrainSubRef, countRef, taglineRef, subtitleRef].forEach(r => {
        if (r.current) { r.current.style.opacity = '0'; }
      });
      /* Clear canvas */
      const cv = cvRef.current;
      if (cv) { const ctx = cv.getContext('2d'); ctx?.clearRect(0, 0, cv.width, cv.height); }
      return;
    }

    /* ── Start ─────────────────────────────────────────── */
    t0Ref.current = performance.now();
    tIdxRef.current = -1;
    resolvedRef.current = false;
    ptsRef.current = [];
    startEngine();

    const loop = (now: number) => {
      const ms = now - t0Ref.current;
      const el = Math.min(ms, TOTAL + 3000);                // hold resolve

      const b = bkRef.current;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const gy = b.y + b.h * 0.85;                          // ground-level Y
      const gRx = b.w * 1.5;
      const gRy = b.h * 0.25;

      /* ── Canvas setup ─────────────────────────────── */
      const cv = cvRef.current;
      if (!cv) { rafRef.current = requestAnimationFrame(loop); return; }
      const c = cv.getContext('2d');
      if (!c) { rafRef.current = requestAnimationFrame(loop); return; }
      const dpr = window.devicePixelRatio || 1;
      if (cv.width !== cw * dpr) {
        cv.width = cw * dpr; cv.height = ch * dpr;
        cv.style.width = `${cw}px`; cv.style.height = `${ch}px`;
        c.scale(dpr, dpr);
      }
      c.clearRect(0, 0, cw, ch);

      /* ── Phase detection ──────────────────────────── */
      const inHB  = el < HB_END;
      const inT   = el >= T_START && el < T_END;
      const inR   = el >= R_START;
      const tIdx  = inT ? Math.min(Math.floor((el - T_START) / T_DUR), 4) : (inR ? 4 : -1);
      const tProg = inT ? ((el - T_START) % T_DUR) / T_DUR : (inR ? 1 : 0);

      /* ── RPM ──────────────────────────────────────── */
      let rpm = 800;
      if (inHB) {
        rpm = 800 + easeOut(el / HB_END) * 5200;
      } else if (inT) {
        rpm = 3200 + Math.sin(el * 0.002) * 600;
      } else if (inR) {
        rpm = 3200 - easeOut(clamp((el - R_START) / 2000)) * 2400;
      }
      updateRPM(rpm);

      /* Global fade */
      const gA = clamp(el / 800);
      /* Resolve fade-out multiplier for FX */
      const rFade = inR ? (1 - clamp((el - R_START) / 2500)) : 1;

      /* ════════════════════════════════════════════════
         CANVAS RENDERING
         ════════════════════════════════════════════════ */

      /* ── 1. Startup flash (0-400ms) ─────────────── */
      if (el < 400) {
        const fa = (1 - el / 400) * 0.35;
        c.save(); c.globalAlpha = fa;
        const fg = c.createRadialGradient(cx, cy, 0, cx, cy, b.w * 1.2);
        fg.addColorStop(0, 'rgba(255,200,100,1)');
        fg.addColorStop(0.5, 'rgba(255,150,50,0.5)');
        fg.addColorStop(1, 'transparent');
        c.fillStyle = fg;
        c.fillRect(cx - b.w * 2, cy - b.h * 2, b.w * 4, b.h * 4);
        c.restore();
      }

      /* ── 2. Terrain ground zone ─────────────────── */
      if ((inT || inR) && tIdx >= 0) {
        const t = TERRAINS[tIdx];
        const prev = tIdx > 0 ? TERRAINS[tIdx - 1] : t;
        const blend = inT ? clamp(tProg / 0.18) : 1;
        const gc = [
          lerp(prev.ground[0], t.ground[0], blend),
          lerp(prev.ground[1], t.ground[1], blend),
          lerp(prev.ground[2], t.ground[2], blend),
        ];
        c.save();
        c.globalAlpha = 0.32 * gA * rFade;
        const grd = c.createRadialGradient(cx, gy, 0, cx, gy, gRx);
        const base = `rgb(${Math.round(gc[0])},${Math.round(gc[1])},${Math.round(gc[2])})`;
        grd.addColorStop(0, base);
        grd.addColorStop(0.55, base.replace('rgb', 'rgba').replace(')', ',0.35)'));
        grd.addColorStop(1, 'transparent');
        c.fillStyle = grd;
        c.beginPath(); c.ellipse(cx, gy, gRx, gRy, 0, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      /* ── 3. Engine glow ─────────────────────────── */
      {
        let glowBase: number;
        if (inHB) {
          /* Flicker during startup (0-1s), then smooth */
          const startup = clamp(el / 1200);
          const flicker = el < 1000
            ? 0.3 + Math.abs(Math.sin(el * 0.03) * Math.sin(el * 0.011)) * 0.7
            : 1;
          glowBase = startup * flicker;
        } else if (inR) {
          glowBase = 0.55 * (1 - clamp((el - R_START) / 2800)) + 0.15;
        } else {
          glowBase = 0.6;
        }
        const pulse = 0.7 + Math.sin(el * 0.004 * Math.PI) * 0.3;
        const glowA = glowBase * pulse * 0.28 * gA;

        if (glowA > 0.004) {
          c.save(); c.globalAlpha = glowA;
          const g1 = c.createRadialGradient(cx, cy + b.h * 0.2, 0, cx, cy + b.h * 0.2, b.w * 1.3);
          g1.addColorStop(0, 'rgba(255,149,0,0.65)');
          g1.addColorStop(0.3, 'rgba(255,120,0,0.28)');
          g1.addColorStop(0.6, 'rgba(255,80,0,0.08)');
          g1.addColorStop(1, 'transparent');
          c.fillStyle = g1;
          c.fillRect(cx - b.w * 2, cy - b.h, b.w * 4, b.h * 3);
          c.restore();

          /* Secondary cool exhaust glow (rear) */
          c.save(); c.globalAlpha = glowA * 0.35;
          const g2 = c.createRadialGradient(cx - b.w * 0.3, cy + b.h * 0.15, 0, cx - b.w * 0.3, cy + b.h * 0.15, b.w * 0.6);
          g2.addColorStop(0, 'rgba(100,180,255,0.3)');
          g2.addColorStop(0.5, 'rgba(80,140,220,0.08)');
          g2.addColorStop(1, 'transparent');
          c.fillStyle = g2;
          c.fillRect(cx - b.w * 1.5, cy - b.h * 0.5, b.w * 2, b.h * 2);
          c.restore();
        }
      }

      /* ── 4. Tachometer arc (top-right) ──────────── */
      {
        const arcCx = cw - 38;
        const arcCy = 38;
        const arcR = 22;
        const rpmN = clamp((rpm - 800) / 5200);
        const startA = Math.PI * 0.75;
        const endA   = Math.PI * 2.25;
        const tachAlpha = gA * (inHB || inT ? 1 : (1 - clamp((el - R_START) / 1500)));

        if (tachAlpha > 0.01) {
          c.save(); c.globalAlpha = tachAlpha;

          /* Background track */
          c.strokeStyle = 'rgba(255,255,255,0.06)';
          c.lineWidth = 2;
          c.beginPath(); c.arc(arcCx, arcCy, arcR, startA, endA); c.stroke();

          /* Filled portion — green to amber */
          const arcColor = rpmN > 0.7
            ? `rgba(255,${Math.round(149 - (rpmN - 0.7) * 200)},0,0.8)`
            : 'rgba(0,168,124,0.8)';
          c.strokeStyle = arcColor;
          c.lineWidth = 2.5;
          c.lineCap = 'round';
          c.beginPath();
          c.arc(arcCx, arcCy, arcR, startA, startA + rpmN * (endA - startA));
          c.stroke();

          /* RPM text */
          c.fillStyle = arcColor;
          c.font = "10px 'Courier New', monospace";
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(`${Math.round(rpm)}`, arcCx, arcCy - 1);
          c.fillStyle = 'rgba(255,255,255,0.25)';
          c.font = "6px 'Courier New', monospace";
          c.fillText('RPM', arcCx, arcCy + 9);

          c.restore();
        }
      }

      /* ── 5. Spawn particles ─────────────────────── */
      const pts = ptsRef.current;
      if (inT && tIdx >= 0) {
        const w = TERRAINS[tIdx].weather;
        const fadeEnv = clamp(tProg / 0.12) * (tProg > 0.85 ? clamp((1 - tProg) / 0.15) : 1);

        if (w === 'clear'     && Math.random() < 0.15 * fadeEnv) pts.push(mkHeat(cx, gy));
        if (w === 'drizzle'   && Math.random() < 0.3  * fadeEnv) pts.push(mkRain(cw));
        if (w === 'rain') {
          for (let i = 0; i < Math.ceil(3 * fadeEnv); i++) pts.push(mkRain(cw));
          if (Math.random() < 0.4 * fadeEnv) pts.push(mkSplash(cx, gy));
        }
        if (w === 'snow'      && Math.random() < 0.45 * fadeEnv) pts.push(mkSnow(cw));
        if (w === 'sandstorm') { for (let i = 0; i < Math.ceil(2 * fadeEnv); i++) pts.push(mkSand(cw, ch)); }
      }

      /* ── 6. Update & render particles ───────────── */
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy; p.life++;

        if (p.type === 'snow')   p.vx += Math.sin(el * 0.003 + p.x * 0.01) * 0.008;
        if (p.type === 'splash') p.vy += 0.15;

        const lr = p.life / p.maxLife;
        const fade = lr < 0.1 ? lr / 0.1 : lr > 0.8 ? (1 - lr) / 0.2 : 1;
        const alpha = p.opacity * fade * gA;

        if (p.life >= p.maxLife || p.y > ch + 20 || p.x < -30 || p.x > cw + 30) {
          pts.splice(i, 1); continue;
        }

        c.save();
        switch (p.type) {
          case 'rain':
            c.strokeStyle = `rgba(170,205,255,${alpha})`;
            c.lineWidth = 0.8;
            c.beginPath(); c.moveTo(p.x, p.y);
            c.lineTo(p.x + p.vx * 2.5, p.y + p.vy * 2.5); c.stroke();
            break;
          case 'snow':
            c.fillStyle = `rgba(255,255,255,${alpha})`;
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            break;
          case 'sand':
            c.fillStyle = `rgba(220,190,120,${alpha})`;
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            c.strokeStyle = `rgba(200,170,100,${alpha * 0.25})`;
            c.lineWidth = 0.5;
            c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 5, p.y); c.stroke();
            break;
          case 'splash':
            c.fillStyle = `rgba(170,210,255,${alpha})`;
            c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill();
            break;
          case 'heat': {
            const wx = p.x + Math.sin(el * 0.005 + p.y * 0.1) * p.size;
            c.fillStyle = `rgba(255,200,100,${alpha * 0.4})`;
            c.beginPath(); c.ellipse(wx, p.y, p.size * 1.5, p.size * 0.5, 0, 0, Math.PI * 2);
            c.fill(); break;
          }
        }
        c.restore();
      }

      /* ── 7. Atmospheric tint ────────────────────── */
      if (inT && tIdx >= 0) {
        const w = TERRAINS[tIdx].weather;
        const fEnv = clamp(tProg / 0.12) * (tProg > 0.85 ? clamp((1 - tProg) / 0.15) : 1);
        if (w === 'sandstorm') { c.save(); c.globalAlpha = 0.055 * fEnv; c.fillStyle = '#c4a050'; c.fillRect(0, 0, cw, ch); c.restore(); }
        if (w === 'snow')      { c.save(); c.globalAlpha = 0.035 * fEnv; c.fillStyle = '#c0d0f0'; c.fillRect(0, 0, cw, ch); c.restore(); }
        if (w === 'rain')      { c.save(); c.globalAlpha = 0.045 * fEnv; c.fillStyle = '#1a2040'; c.fillRect(0, 0, cw, ch); c.restore(); }
      }

      /* ── 8. Progress dots ───────────────────────── */
      if ((inT || inR) && gA > 0.01) {
        const completedIdx = inR ? 4 : tIdx;
        const dotY = ch - 18;
        const gap = 14;
        const startX = cw / 2 - (4 * gap) / 2;
        const dotAlpha = gA * (inR ? (1 - clamp((el - R_START) / 1800)) : 1);

        if (dotAlpha > 0.01) {
          c.save(); c.globalAlpha = dotAlpha;
          for (let d = 0; d < 5; d++) {
            const dx = startX + d * gap;
            c.beginPath(); c.arc(dx, dotY, 2.5, 0, Math.PI * 2);
            c.fillStyle = d <= completedIdx ? '#00A87C' : 'rgba(255,255,255,0.08)';
            c.fill();
          }
          c.restore();
        }
      }

      /* ════════════════════════════════════════════════
         TEXT OVERLAY UPDATES (via DOM refs, zero re-renders)
         ════════════════════════════════════════════════ */

      /* ── Terrain label ─────────────────────────── */
      if (inT && tIdx !== tIdxRef.current) {
        tIdxRef.current = tIdx;
        playImpact(tIdx);

        const ne = terrainNameRef.current;
        const se = terrainSubRef.current;
        const ce = countRef.current;
        if (ne) {
          ne.style.transition = 'none';
          ne.textContent = TERRAINS[tIdx].name;
          ne.style.opacity = '0';
          ne.style.transform = 'translateX(-50%) translateY(10px)';
          requestAnimationFrame(() => {
            ne.style.transition = 'opacity 380ms cubic-bezier(0.22,1,0.36,1), transform 380ms cubic-bezier(0.22,1,0.36,1)';
            ne.style.opacity = '1';
            ne.style.transform = 'translateX(-50%) translateY(0)';
          });
        }
        if (se) {
          se.style.transition = 'none';
          se.textContent = TERRAINS[tIdx].sub;
          se.style.opacity = '0';
          se.style.transform = 'translateX(-50%) translateY(6px)';
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (!se) return;
              se.style.transition = 'opacity 350ms ease 80ms, transform 350ms ease 80ms';
              se.style.opacity = '0.4';
              se.style.transform = 'translateX(-50%) translateY(0)';
            }, 0);
          });
        }
        if (ce) {
          ce.textContent = `${tIdx + 1} / 5`;
          ce.style.opacity = '0.35';
        }
      }

      /* Fade out terrain label at tail of each terrain phase */
      if (inT && tProg > 0.76) {
        const fo = (tProg - 0.76) / 0.24;
        const ne = terrainNameRef.current;
        const se = terrainSubRef.current;
        if (ne) { ne.style.opacity = String(1 - fo); ne.style.transform = `translateX(-50%) translateY(${-5 * fo}px)`; }
        if (se) { se.style.opacity = String(0.4 * (1 - fo)); }
      }

      /* Hide terrain text during resolve */
      if (inR) {
        if (terrainNameRef.current) terrainNameRef.current.style.opacity = '0';
        if (terrainSubRef.current) terrainSubRef.current.style.opacity = '0';
        if (countRef.current) countRef.current.style.opacity = '0';
      }

      /* ── Tagline glitch-decode (resolve phase) ── */
      if (inR && !resolvedRef.current) {
        resolvedRef.current = true;
        const te = taglineRef.current;
        const se = subtitleRef.current;
        if (te) {
          te.style.opacity = '1';
          const resolved = new Array(TAGLINE.length).fill(false);
          let frame = 0;
          glitchIvRef.current = setInterval(() => {
            frame++;
            let out = '';
            for (let i = 0; i < TAGLINE.length; i++) {
              if (resolved[i]) { out += TAGLINE[i]; continue; }
              if (TAGLINE[i] === ' ') { resolved[i] = true; out += ' '; continue; }
              if (frame > i * 1.4 + 3) { resolved[i] = true; out += TAGLINE[i]; continue; }
              out += GLITCH_POOL[Math.floor(Math.random() * GLITCH_POOL.length)];
            }
            te.textContent = out;
            if (resolved.every(Boolean)) {
              if (glitchIvRef.current) clearInterval(glitchIvRef.current);
              glitchIvRef.current = null;
              /* Show subtitle after decode completes */
              setTimeout(() => {
                if (se) {
                  se.textContent = SUBTITLE;
                  se.style.opacity = '1';
                  se.style.transform = 'translateX(-50%) translateY(0)';
                }
              }, 350);
            }
          }, 38);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      stopEngine();
      if (glitchIvRef.current) { clearInterval(glitchIvRef.current); glitchIvRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* ── Computed text positions (relative to bike) ─────────── */
  const labelTop = Math.min(bk.y + bk.h + 18, ch - 85);

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 11 }}>
      {/* Effects canvas */}
      <canvas
        ref={cvRef}
        className="absolute"
        style={{ left: 0, top: 0, width: cw, height: ch }}
      />

      {/* Terrain name — large */}
      <div
        ref={terrainNameRef}
        style={{
          position: 'absolute',
          left: '50%', top: labelTop,
          transform: 'translateX(-50%) translateY(10px)',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24, letterSpacing: 8,
          color: 'rgba(255,255,255,0.82)',
          opacity: 0,
          textShadow: '0 2px 16px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      />

      {/* Terrain subtitle */}
      <div
        ref={terrainSubRef}
        style={{
          position: 'absolute',
          left: '50%', top: labelTop + 28,
          transform: 'translateX(-50%) translateY(6px)',
          fontFamily: "'Cambay', sans-serif",
          fontSize: 8, letterSpacing: 3,
          color: 'rgba(255,255,255,0.4)',
          opacity: 0,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      />

      {/* Terrain count */}
      <div
        ref={countRef}
        style={{
          position: 'absolute',
          left: '50%', top: labelTop + 42,
          transform: 'translateX(-50%)',
          fontFamily: "'Cambay', sans-serif",
          fontSize: 8, letterSpacing: 2,
          color: 'rgba(255,255,255,0.3)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Tagline (resolve) */}
      <div
        ref={taglineRef}
        style={{
          position: 'absolute',
          left: '50%', top: labelTop + 6,
          transform: 'translateX(-50%)',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 18, letterSpacing: 5,
          color: '#00A87C',
          opacity: 0,
          transition: 'opacity 600ms ease',
          textShadow: '0 0 24px rgba(0,168,124,0.35)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      />

      {/* Subtitle (resolve) */}
      <div
        ref={subtitleRef}
        style={{
          position: 'absolute',
          left: '50%', top: labelTop + 30,
          transform: 'translateX(-50%) translateY(5px)',
          fontFamily: "'Cambay', sans-serif",
          fontSize: 8, letterSpacing: 2.5,
          color: 'rgba(255,255,255,0.32)',
          opacity: 0,
          transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}