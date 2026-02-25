import { useRef, useEffect, useCallback, useState } from 'react';
import { Sun, ChevronDown, ChevronUp } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   PAPER FLYING FX  +  VOLUMETRIC ROOM AMBIENCE  v2
   ─────────────────────────────────────────────────────────────────────
   Ambient canvas layer for the Thinking Room (Room 03).

   Features:
   1. CORNER LIGHT SOURCE — Single unified origin at the top-right apex
      where both walls converge. Powers volumetric cone, god-ray fingers,
      ambient fill, bloom, and colour-temperature gradient.

   2. FLYING PAPERS — 16 depth-sorted sheets with 3D tumble, sinusoidal
      drift, mouse-hover disturbance (force-field push + spin boost),
      raised opacity, and every ~4th paper tinted from a colour palette.

   3. VOLUMETRIC DEPTH — Depth fog (bottom-heavier), ground haze,
      corner occlusion darkening, directional paper shadows from light
      source, warm→cool colour shift, and dust motes concentrated near
      the light origin.

   4. LIGHT CONTROLS — Exported as <LightControlsPanel>, to be rendered
      OUTSIDE the zoom/pan transform by the parent.

   Renders on a single <canvas> at the room's native 805 × 609 resolution.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Room dimensions ─────────────────────────────────────────────── */
const AW = 805;
const AH = 609;

/* ── Light source origin — top-right apex where both walls meet ── */
const LIGHT_OX = 500;
const LIGHT_OY = 18;

/* ── Paper config ────────────────────────────────────────────────── */
const NUM_PAPERS = 16;
const PAPER_CREAM: [number, number, number] = [255, 250, 240];
const PAPER_LINE_CLR = [200, 195, 185];

/* Colour palette for every ~4th/5th paper */
const PAPER_COLORS: [number, number, number][] = [
  [0, 168, 124],     // teal (accent)
  [212, 160, 23],    // amber / gold
  [224, 112, 80],    // soft coral
  [91, 139, 160],    // dusty blue
  [139, 111, 174],   // muted lavender
];

/* ── Helpers ──────────────────────────────────────────────────────── */
function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo); }
function clamp(v: number, lo: number, hi: number) { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* 3×3 rotation matrix from Euler angles (XYZ) */
function rotMatrix(rx: number, ry: number, rz: number) {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);
  return [
    cy * cz,                  cy * sz,                 -sy,
    sx * sy * cz - cx * sz,   sx * sy * sz + cx * cz,   sx * cy,
    cx * sy * cz + sx * sz,   cx * sy * sz - sx * cz,   cx * cy,
  ];
}

function project(lx: number, ly: number, lz: number, m: number[], s: number): [number, number] {
  return [(m[0] * lx + m[1] * ly + m[2] * lz) * s, (m[3] * lx + m[4] * ly + m[5] * lz) * s];
}

/* ── Shared control types ────────────────────────────────────────── */
export interface LightCtrl {
  intensity: number;
  temperature: number;
  coneSpread: number;
  volumetric: number;
  fog: number;
  dust: number;
  disturbance: number;
}

export const LIGHT_DEFAULTS: LightCtrl = {
  intensity: 65,
  temperature: 40,
  coneSpread: 50,
  volumetric: 55,
  fog: 35,
  dust: 60,
  disturbance: 80,
};

/* ── Temperature → RGB ───────────────────────────────────────────── */
function tempToRGB(t: number): [number, number, number] {
  const n = t / 100;
  return [
    Math.round(lerp(255, 210, n)),
    Math.round(lerp(220, 230, n)),
    Math.round(lerp(150, 255, n)),
  ];
}

/* ── Paper struct ────────────────────────────────────────────────── */
interface Paper {
  x: number; y: number; z: number;
  rx: number; ry: number; rz: number;
  vrx: number; vry: number; vrz: number;
  dvx: number; dvy: number;
  dvrx: number; dvry: number; dvrz: number;
  w: number; h: number;
  phase: number; driftAmp: number; driftFreq: number; vyBase: number;
  color: [number, number, number];
  isColored: boolean;
}

function makePaper(idx: number): Paper {
  const isColored = idx % 4 === 3 || idx % 5 === 4;
  const color: [number, number, number] = isColored
    ? PAPER_COLORS[Math.floor(rand(0, PAPER_COLORS.length))]
    : PAPER_CREAM;
  return {
    x: rand(AW * 0.05, AW * 0.85),
    y: rand(-AH * 0.2, AH * 1.1),
    z: rand(0.15, 0.95),
    rx: rand(0, Math.PI * 2), ry: rand(0, Math.PI * 2), rz: rand(0, Math.PI * 2),
    vrx: rand(-0.003, 0.003), vry: rand(-0.005, 0.005), vrz: rand(-0.002, 0.002),
    dvx: 0, dvy: 0, dvrx: 0, dvry: 0, dvrz: 0,
    w: rand(14, 24), h: rand(18, 30),
    phase: rand(0, Math.PI * 2),
    driftAmp: rand(0.15, 0.4),
    driftFreq: rand(0.0006, 0.0015),
    vyBase: rand(0.04, 0.12),
    color,
    isColored,
  };
}

/* ── Dust mote ───────────────────────────────────────────────────── */
interface Mote {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number; maxLife: number;
}

function makeMote(): Mote {
  const t = Math.pow(rand(0, 1), 0.6);
  const angle = rand(Math.PI * 0.3, Math.PI * 0.75);
  const dist = t * 380;
  return {
    x: LIGHT_OX + Math.cos(angle) * dist + rand(-60, 60),
    y: LIGHT_OY + Math.sin(angle) * dist + rand(-20, 20),
    vx: rand(-0.06, 0.06),
    vy: rand(0.02, 0.09),
    size: rand(0.5, 2.0),
    life: 0,
    maxLife: rand(220, 550),
  };
}

/* ── God-ray finger offsets ──────────────────────────────────────── */
const GOD_RAYS = [
  { angle: Math.PI * 0.38, width: 18, len: 320, phase: 0 },
  { angle: Math.PI * 0.48, width: 22, len: 360, phase: 1.2 },
  { angle: Math.PI * 0.56, width: 16, len: 290, phase: 2.8 },
  { angle: Math.PI * 0.65, width: 20, len: 340, phase: 4.1 },
  { angle: Math.PI * 0.72, width: 14, len: 260, phase: 5.5 },
];

/* ═══════════════════════════════════════════════════════════════════
   CANVAS COMPONENT — renders inside the room viewport
   ═══════════════════════════════════════════════════════════════════ */

interface FxProps { active: boolean; lampOn: boolean; ctrl: LightCtrl; }

export function PaperFlyingFx({ active, lampOn, ctrl }: FxProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const papersRef = useRef<Paper[]>([]);
  const motesRef = useRef<Mote[]>([]);
  const t0Ref = useRef(0);
  const ctrlRef = useRef(ctrl);
  useEffect(() => { ctrlRef.current = ctrl; }, [ctrl]);

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false });

  /* ── Mouse tracking ─────────────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cv = cvRef.current;
      if (!cv) return;
      const r = cv.getBoundingClientRect();
      if (r.width < 1) return;
      mouseRef.current.x = (e.clientX - r.left) * (AW / r.width);
      mouseRef.current.y = (e.clientY - r.top) * (AH / r.height);
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); };
  }, []);

  /* ── Init ───────────────────────────────────────────────────────── */
  const init = useCallback(() => {
    const papers: Paper[] = [];
    for (let i = 0; i < NUM_PAPERS; i++) papers.push(makePaper(i));
    papersRef.current = papers;
    const motes: Mote[] = [];
    const mc = Math.round(55 * (ctrlRef.current.dust / 100));
    for (let i = 0; i < mc; i++) motes.push(makeMote());
    motesRef.current = motes;
    t0Ref.current = performance.now();
  }, []);

  /* ── Render loop ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    if (papersRef.current.length === 0) init();

    const loop = () => {
      const cv = cvRef.current;
      if (!cv) { rafRef.current = requestAnimationFrame(loop); return; }
      const c = cv.getContext('2d');
      if (!c) { rafRef.current = requestAnimationFrame(loop); return; }

      const dpr = window.devicePixelRatio || 1;
      const pw = Math.round(AW * dpr);
      if (cv.width !== pw) { cv.width = pw; cv.height = Math.round(AH * dpr); c.scale(dpr, dpr); }
      c.clearRect(0, 0, AW, AH);

      const now = performance.now();
      const el = now - t0Ref.current;
      const lampMul = lampOn ? 1 : 0.18;
      const K = ctrlRef.current;
      const intMul = (K.intensity / 100) * lampMul;
      const [lr, lg, lb] = tempToRGB(K.temperature);
      const spreadRad = (K.coneSpread / 180) * Math.PI;
      const volMul = K.volumetric / 100;
      const fogMul = K.fog / 100;
      const distRadius = K.disturbance;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mAct = mouseRef.current.active;

      /* ═══ 1. CORNER OCCLUSION DARKENING ═══════════════════════ */
      {
        const oa = 0.08 * fogMul;
        if (oa > 0.002) {
          c.save(); c.globalAlpha = oa;
          const g1 = c.createRadialGradient(0, AH, 10, 0, AH, AH * 0.55);
          g1.addColorStop(0, 'rgba(0,0,0,0.5)'); g1.addColorStop(1, 'transparent');
          c.fillStyle = g1; c.fillRect(0, 0, AW, AH);
          const g2 = c.createRadialGradient(AW, AH, 10, AW, AH, AH * 0.45);
          g2.addColorStop(0, 'rgba(0,0,0,0.35)'); g2.addColorStop(1, 'transparent');
          c.fillStyle = g2; c.fillRect(0, 0, AW, AH);
          c.restore();
        }
      }

      /* ═══ 2. VOLUMETRIC CONE from corner light ════════════════ */
      {
        const coneAlpha = 0.055 * intMul * volMul;
        if (coneAlpha > 0.002) {
          const baseAngle = Math.PI * 0.53;
          const halfSpread = spreadRad * 0.5;
          const coneLen = 420;
          const breath = 0.88 + Math.sin(el * 0.0007) * 0.12;
          const a = coneAlpha * breath;
          const la = baseAngle - halfSpread;
          const ra = baseAngle + halfSpread;
          const lx = LIGHT_OX + Math.cos(la) * coneLen;
          const ly = LIGHT_OY + Math.sin(la) * coneLen;
          const rx = LIGHT_OX + Math.cos(ra) * coneLen;
          const ry = LIGHT_OY + Math.sin(ra) * coneLen;

          c.save();
          const grad = c.createRadialGradient(
            LIGHT_OX, LIGHT_OY, 6,
            LIGHT_OX + Math.cos(baseAngle) * coneLen * 0.5,
            LIGHT_OY + Math.sin(baseAngle) * coneLen * 0.5,
            coneLen * 0.65,
          );
          grad.addColorStop(0, `rgba(${lr},${lg},${lb},${a * 1.8})`);
          grad.addColorStop(0.25, `rgba(${lr},${lg},${lb},${a * 1.0})`);
          grad.addColorStop(0.6, `rgba(${lr},${lg},${lb},${a * 0.35})`);
          grad.addColorStop(1, 'transparent');
          c.beginPath();
          c.moveTo(LIGHT_OX - 4, LIGHT_OY);
          c.lineTo(LIGHT_OX + 4, LIGHT_OY);
          c.lineTo(rx, ry); c.lineTo(lx, ly);
          c.closePath();
          c.fillStyle = grad; c.fill();
          c.restore();
        }
      }

      /* ═══ 3. GOD-RAY FINGERS ══════════════════════════════════ */
      {
        const rayAlpha = 0.025 * intMul * volMul;
        if (rayAlpha > 0.002) {
          for (const ray of GOD_RAYS) {
            const flicker = 0.6 + Math.sin(el * 0.0012 + ray.phase) * 0.3 + Math.sin(el * 0.003 + ray.phase * 1.7) * 0.1;
            const a = rayAlpha * flicker;
            if (a < 0.002) continue;
            const ca = Math.cos(ray.angle); const sa = Math.sin(ray.angle);
            const ex = LIGHT_OX + ca * ray.len; const ey = LIGHT_OY + sa * ray.len;
            const nx = -sa; const ny = ca;
            const hw = ray.width * 0.5;

            c.save();
            c.globalAlpha = a;
            c.globalCompositeOperation = 'lighter';
            const rg = c.createLinearGradient(LIGHT_OX, LIGHT_OY, ex, ey);
            rg.addColorStop(0, `rgba(${lr},${lg},${lb},0.6)`);
            rg.addColorStop(0.3, `rgba(${lr},${lg},${lb},0.25)`);
            rg.addColorStop(0.7, `rgba(${lr},${lg},${lb},0.08)`);
            rg.addColorStop(1, 'transparent');
            c.fillStyle = rg;
            c.beginPath();
            c.moveTo(LIGHT_OX + nx * 2, LIGHT_OY + ny * 2);
            c.lineTo(LIGHT_OX - nx * 2, LIGHT_OY - ny * 2);
            c.lineTo(ex - nx * hw, ey - ny * hw);
            c.lineTo(ex + nx * hw, ey + ny * hw);
            c.closePath(); c.fill();
            c.restore();
          }
        }
      }

      /* ═══ 4. BLOOM at light origin ════════════════════════════ */
      {
        const bA = 0.22 * intMul;
        if (bA > 0.005) {
          c.save();
          c.globalAlpha = bA;
          const b1 = c.createRadialGradient(LIGHT_OX, LIGHT_OY, 0, LIGHT_OX, LIGHT_OY, 35);
          b1.addColorStop(0, `rgba(${lr},${lg},${lb},0.7)`); b1.addColorStop(0.4, `rgba(${lr},${lg},${lb},0.2)`); b1.addColorStop(1, 'transparent');
          c.fillStyle = b1; c.beginPath(); c.arc(LIGHT_OX, LIGHT_OY, 35, 0, Math.PI * 2); c.fill();
          c.globalAlpha = bA * 0.4;
          const b2 = c.createRadialGradient(LIGHT_OX, LIGHT_OY, 0, LIGHT_OX, LIGHT_OY, 90);
          b2.addColorStop(0, `rgba(${lr},${lg},${lb},0.25)`); b2.addColorStop(0.5, `rgba(${lr},${lg},${lb},0.06)`); b2.addColorStop(1, 'transparent');
          c.fillStyle = b2; c.beginPath(); c.arc(LIGHT_OX, LIGHT_OY, 90, 0, Math.PI * 2); c.fill();
          c.restore();
        }
      }

      /* ═══ 5. DUST MOTES ══════════════════════════════════════ */
      const motes = motesRef.current;
      const tgtMotes = Math.round(55 * (K.dust / 100));
      while (motes.length < tgtMotes) motes.push(makeMote());
      while (motes.length > tgtMotes) motes.pop();

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.x += m.vx; m.y += m.vy; m.life++;
        const lr2 = m.life / m.maxLife;
        const fadeIn = clamp(lr2 / 0.12, 0, 1);
        const fadeOut = lr2 > 0.75 ? 1 - (lr2 - 0.75) / 0.25 : 1;
        const dToLight = Math.sqrt((m.x - LIGHT_OX) ** 2 + (m.y - LIGHT_OY) ** 2);
        const proxBright = clamp(1 - dToLight / 400, 0.15, 1);
        const mAlpha = fadeIn * fadeOut * intMul * 0.5 * proxBright;
        if (mAlpha > 0.004) {
          c.save(); c.globalAlpha = mAlpha;
          const mg = c.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 2.2);
          mg.addColorStop(0, `rgba(${lr},${lg},${lb},0.65)`); mg.addColorStop(1, 'transparent');
          c.fillStyle = mg; c.beginPath(); c.arc(m.x, m.y, m.size * 2.2, 0, Math.PI * 2); c.fill();
          c.restore();
        }
        if (m.life >= m.maxLife || m.y > AH + 20 || m.x < -20 || m.x > AW + 20) motes[i] = makeMote();
      }

      /* ═══ 6. ATMOSPHERIC DEPTH FOG ════════════════════════════ */
      {
        const fA = 0.028 * fogMul * lampMul;
        if (fA > 0.002) {
          c.save(); c.globalAlpha = fA;
          const fg = c.createLinearGradient(0, AH * 0.3, 0, AH);
          fg.addColorStop(0, 'transparent');
          fg.addColorStop(0.4, 'rgba(20,20,25,0.15)');
          fg.addColorStop(0.7, 'rgba(20,20,25,0.35)');
          fg.addColorStop(1, 'rgba(20,20,25,0.55)');
          c.fillStyle = fg; c.fillRect(0, 0, AW, AH);
          c.restore();
        }
      }

      /* ═══ 7. GROUND HAZE ══════════════════════════════════════ */
      {
        const hA = 0.018 * fogMul * lampMul;
        if (hA > 0.002) {
          c.save(); c.globalAlpha = hA;
          const gh = c.createLinearGradient(0, AH * 0.78, 0, AH);
          gh.addColorStop(0, 'transparent');
          gh.addColorStop(0.3, `rgba(${lr},${lg},${lb},0.08)`);
          gh.addColorStop(1, `rgba(${lr},${lg},${lb},0.2)`);
          c.fillStyle = gh; c.fillRect(0, AH * 0.65, AW, AH * 0.35);
          c.restore();
        }
      }

      /* ═══ 8. WARM→COOL COLOUR SHIFT ══════════════════════════ */
      {
        const ctA = 0.012 * intMul;
        if (ctA > 0.002) {
          c.save(); c.globalAlpha = ctA;
          const tg = c.createRadialGradient(LIGHT_OX, LIGHT_OY, 30, LIGHT_OX, LIGHT_OY, AW * 0.8);
          tg.addColorStop(0, `rgba(${lr},${lg},${lb},0.15)`);
          tg.addColorStop(0.4, `rgba(${lr},${lg},${lb},0.04)`);
          tg.addColorStop(0.7, 'transparent');
          tg.addColorStop(1, 'rgba(80,100,140,0.06)');
          c.fillStyle = tg; c.fillRect(0, 0, AW, AH);
          c.restore();
        }
      }

      /* ═══ 9. LIGHT FALLOFF ═══════════════════════════════════ */
      {
        const foA = 0.02 * intMul;
        if (foA > 0.002) {
          c.save(); c.globalAlpha = foA;
          c.globalCompositeOperation = 'lighter';
          const fo = c.createRadialGradient(LIGHT_OX, LIGHT_OY, 20, LIGHT_OX, LIGHT_OY, 350);
          fo.addColorStop(0, `rgba(${lr},${lg},${lb},0.2)`);
          fo.addColorStop(0.5, `rgba(${lr},${lg},${lb},0.05)`);
          fo.addColorStop(1, 'transparent');
          c.fillStyle = fo; c.fillRect(0, 0, AW, AH);
          c.restore();
        }
      }

      /* ═══ 10. FLYING PAPERS ══════════════════════════════════ */
      const papers = papersRef.current;

      for (const p of papers) {
        /* Mouse disturbance force field */
        if (mAct) {
          const dx = p.x - mx; const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < distRadius && dist > 1) {
            const str = (1 - dist / distRadius) * 1.8;
            p.dvx += (dx / dist) * str * 0.6;
            p.dvy += (dy / dist) * str * 0.4;
            p.dvrx += rand(-0.015, 0.015) * str;
            p.dvry += rand(-0.02, 0.02) * str;
            p.dvrz += rand(-0.01, 0.01) * str;
          }
        }
        p.dvx *= 0.955; p.dvy *= 0.955;
        p.dvrx *= 0.96; p.dvry *= 0.96; p.dvrz *= 0.96;

        p.x += Math.sin(el * p.driftFreq + p.phase) * p.driftAmp;
        p.y += p.vyBase;
        p.x += Math.sin(el * 0.0003 + p.phase * 2) * 0.15;
        p.x += p.dvx; p.y += p.dvy;
        p.rx += p.vrx + p.dvrx;
        p.ry += p.vry + p.dvry;
        p.rz += p.vrz + p.dvrz;

        if (p.y > AH + p.h * 3) { p.y = -p.h * 4; p.x = rand(AW * 0.05, AW * 0.85); }
        if (p.x < -p.w * 5) p.x = AW + p.w * 2;
        if (p.x > AW + p.w * 5) p.x = -p.w * 2;
      }

      papers.sort((a, b) => a.z - b.z);

      for (const p of papers) {
        const scale = 0.5 + p.z * 0.7;
        const alpha = (0.28 + p.z * 0.52) * lampMul;
        if (alpha < 0.01) continue;

        const m = rotMatrix(p.rx, p.ry, p.rz);
        const hw = p.w * 0.5; const hh = p.h * 0.5;
        const corners: [number, number][] = [
          project(-hw, -hh, 0, m, scale), project(hw, -hh, 0, m, scale),
          project(hw, hh, 0, m, scale), project(-hw, hh, 0, m, scale),
        ];

        /* Directional shadow from corner light */
        const sdx = p.x - LIGHT_OX; const sdy = p.y - LIGHT_OY;
        const sDist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
        const sOff = clamp(sDist / 250, 0.5, 3.5);
        const sNx = (sdx / sDist) * sOff; const sNy = (sdy / sDist) * sOff;
        c.save(); c.globalAlpha = alpha * 0.25;
        c.fillStyle = 'rgba(0,0,0,0.1)';
        c.beginPath();
        c.moveTo(p.x + corners[0][0] + sNx, p.y + corners[0][1] + sNy);
        for (let i = 1; i < 4; i++) c.lineTo(p.x + corners[i][0] + sNx, p.y + corners[i][1] + sNy);
        c.closePath(); c.fill(); c.restore();

        /* Paper face */
        c.save(); c.globalAlpha = alpha;
        const dL = Math.sqrt((p.x - LIGHT_OX) ** 2 + (p.y - LIGHT_OY) ** 2);
        const bright = clamp(1 - dL / 450, 0, 0.4) * intMul;
        const [pr, pg, pb] = p.color;
        c.fillStyle = `rgb(${Math.round(clamp(pr + bright * (255 - pr), 0, 255))},${Math.round(clamp(pg + bright * (255 - pg), 0, 255))},${Math.round(clamp(pb + bright * (255 - pb), 0, 255))})`;
        c.beginPath();
        c.moveTo(p.x + corners[0][0], p.y + corners[0][1]);
        for (let i = 1; i < 4; i++) c.lineTo(p.x + corners[i][0], p.y + corners[i][1]);
        c.closePath(); c.fill();

        /* Ruled lines (cream papers) or sheen (coloured papers) */
        if (!p.isColored) {
          c.strokeStyle = `rgba(${PAPER_LINE_CLR[0]},${PAPER_LINE_CLR[1]},${PAPER_LINE_CLR[2]},${0.3 * alpha})`;
          c.lineWidth = 0.3;
          for (let li = 1; li <= 4; li++) {
            const t = li / 5; const ly = -hh + t * p.h;
            const [lx1, ly1] = project(-hw * 0.85, ly, 0, m, scale);
            const [lx2, ly2] = project(hw * 0.85, ly, 0, m, scale);
            c.beginPath(); c.moveTo(p.x + lx1, p.y + ly1); c.lineTo(p.x + lx2, p.y + ly2); c.stroke();
          }
        } else {
          c.globalAlpha = alpha * 0.12;
          c.fillStyle = 'rgba(255,255,255,0.4)';
          const [s1x, s1y] = project(-hw * 0.3, -hh * 0.8, 0, m, scale);
          const [s2x, s2y] = project(hw * 0.3, -hh * 0.3, 0, m, scale);
          const [s3x, s3y] = project(hw * 0.3, -hh * 0.5, 0, m, scale);
          const [s4x, s4y] = project(-hw * 0.3, -hh * 0.9, 0, m, scale);
          c.beginPath();
          c.moveTo(p.x + s1x, p.y + s1y); c.lineTo(p.x + s2x, p.y + s2y);
          c.lineTo(p.x + s3x, p.y + s3y); c.lineTo(p.x + s4x, p.y + s4y);
          c.closePath(); c.fill(); c.globalAlpha = alpha;
        }

        /* Edge */
        c.strokeStyle = p.isColored
          ? `rgba(${Math.max(pr - 40, 0)},${Math.max(pg - 40, 0)},${Math.max(pb - 40, 0)},${0.3 * alpha})`
          : `rgba(180,175,165,${0.2 * alpha})`;
        c.lineWidth = 0.4;
        c.beginPath();
        c.moveTo(p.x + corners[0][0], p.y + corners[0][1]);
        for (let i = 1; i < 4; i++) c.lineTo(p.x + corners[i][0], p.y + corners[i][1]);
        c.closePath(); c.stroke();
        c.restore();
      }

      /* ═══ 11. LIGHT SCATTERING OVERLAY ═══════════════════════ */
      {
        const scA = 0.015 * intMul * (0.85 + Math.sin(el * 0.001) * 0.15);
        if (scA > 0.002) {
          c.save(); c.globalAlpha = scA;
          c.globalCompositeOperation = 'lighter';
          const sg = c.createRadialGradient(LIGHT_OX, LIGHT_OY + 80, 15, LIGHT_OX, LIGHT_OY + 80, 220);
          sg.addColorStop(0, `rgba(${lr},${lg},${lb},0.2)`);
          sg.addColorStop(0.5, `rgba(${lr},${lg},${lb},0.06)`);
          sg.addColorStop(1, 'transparent');
          c.fillStyle = sg; c.fillRect(LIGHT_OX - 240, 0, 480, 400);
          c.restore();
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, lampOn, init]);

  return (
    <canvas
      ref={cvRef}
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: AW, height: AH, zIndex: 11 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LIGHT CONTROLS PANEL — rendered by parent outside zoom transform
   ═══════════════════════════════════════════════════════════════════ */

interface CtrlPanelProps {
  ctrl: LightCtrl;
  setCtrl: React.Dispatch<React.SetStateAction<LightCtrl>>;
  lampOn: boolean;
  entered: boolean;
}

export function LightControlsPanel({ ctrl, setCtrl, lampOn, entered }: CtrlPanelProps) {
  const [open, setOpen] = useState(false);
  const [lr, lg, lb] = tempToRGB(ctrl.temperature);

  const Slider = ({ label, k, min = 0, max = 100 }: { label: string; k: keyof LightCtrl; min?: number; max?: number }) => (
    <label className="flex items-center gap-2">
      <span className="w-[82px] text-[10px] text-white/50 tracking-[0.4px] font-['Cambay',sans-serif] shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} step={1}
        value={ctrl[k]}
        onChange={e => setCtrl(prev => ({ ...prev, [k]: +e.target.value }))}
        className="flex-1 h-1 appearance-none bg-white/[0.08] rounded-full cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00A87C] [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,168,124,0.4)]
          [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00A87C] [&::-moz-range-thumb]:border-0"
      />
      <span className="w-7 text-right text-[10px] text-white/35 font-['Cambay',sans-serif] tabular-nums">{ctrl[k]}</span>
    </label>
  );

  return (
    <div
      className="absolute bottom-14 left-5 z-[28] transition-all duration-[1600ms] ease-out"
      style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateY(0)' : 'translateY(8px)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150"
        title="Ambient Light Controls"
      >
        <Sun size={13} style={{ color: lampOn ? `rgb(${lr},${lg},${lb})` : undefined, opacity: lampOn ? 0.8 : 0.35 }} />
        <span className="text-[10px] font-['Cambay',sans-serif] tracking-[0.5px]">LIGHT</span>
        {open ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
      </button>

      {open && (
        <div className="absolute bottom-full mb-1.5 left-0 w-[260px] bg-black/60 backdrop-blur-xl rounded-xl border border-white/[0.06] px-3.5 py-3 flex flex-col gap-2">
          <div className="text-[9px] text-white/25 tracking-[1.2px] font-['Cambay',sans-serif] uppercase mb-0.5">Ambient Controls</div>
          <Slider label="Intensity" k="intensity" />
          <Slider label="Temperature" k="temperature" />
          <Slider label="Cone Spread" k="coneSpread" min={15} max={80} />
          <Slider label="Volumetric" k="volumetric" />
          <Slider label="Fog Density" k="fog" />
          <Slider label="Dust Amount" k="dust" />
          <Slider label="Disturbance" k="disturbance" min={30} max={150} />
          <button
            onClick={() => setCtrl(LIGHT_DEFAULTS)}
            className="mt-1 text-[9px] text-[#00A87C]/50 hover:text-[#00A87C]/80 tracking-[0.8px] font-['Cambay',sans-serif] self-end transition-colors"
          >
            RESET DEFAULTS
          </button>
        </div>
      )}
    </div>
  );
}
