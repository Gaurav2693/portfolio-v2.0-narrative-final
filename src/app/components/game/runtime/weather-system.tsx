import { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface WeatherSystemProps {
  width: number;
  height: number;
  cameraX: number;
  cameraY: number;
  onLightningFlash: () => void;
}

export function WeatherSystem({ width, height, cameraX, cameraY, onLightningFlash }: WeatherSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainDropsRef = useRef<RainDrop[]>([]);
  const animationFrameRef = useRef<number>();
  const lastLightningRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize rain drops
    if (rainDropsRef.current.length === 0) {
      for (let i = 0; i < 150; i++) {
        rainDropsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 8 + Math.random() * 4,
          length: 15 + Math.random() * 10,
          opacity: 0.3 + Math.random() * 0.4,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw rain drops
      rainDropsRef.current.forEach((drop) => {
        // Update position
        drop.y += drop.speed;
        drop.x += 0.5; // Slight diagonal movement

        // Reset if off screen
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        if (drop.x > width) {
          drop.x = 0;
        }

        // Draw rain drop
        ctx.strokeStyle = `rgba(200, 200, 200, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();
      });

      // Random lightning flashes
      const now = Date.now();
      if (now - lastLightningRef.current > 4000 + Math.random() * 6000) {
        lastLightningRef.current = now;
        onLightningFlash();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, onLightningFlash]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
}
