import { useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   HERO PARTICLES — Floating data-node constellation
   ─────────────────────────────────────────────────
   Canvas-based particle system with connecting lines.
   Nodes drift lazily; nearby nodes form glowing edges.
   Mouse proximity causes gentle repulsion.
   ═══════════════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  rgb: [number, number, number];
  pulse: number;
  pulseSpeed: number;
}

const COLORS: [number, number, number][] = [
  [64, 240, 170],   // #40F0AA
  [0, 234, 255],    // #00EAFF
  [64, 240, 170],
  [0, 234, 255],
  [200, 200, 220],  // soft white
];

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const COUNT = Math.min(60, Math.floor((w * h) / 25000));
    const particles: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.4,
        rgb: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.008 + Math.random() * 0.015,
      });
    }

    const CONNECTION_DIST = 150;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update & draw particles
      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const pAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const [r, g, b] = p.rgb;

        // Mouse repulsion
        const dmx = p.x - mx;
        const dmy = p.y - my;
        const dMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dMouse < 120 && dMouse > 0) {
          const force = (120 - dMouse) / 120 * 0.4;
          p.vx += (dmx / dMouse) * force;
          p.vy += (dmy / dMouse) * force;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r + 3);
        grad.addColorStop(0, `rgba(${r},${g},${b},${pAlpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(64,240,170,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.7 }}
    />
  );
}