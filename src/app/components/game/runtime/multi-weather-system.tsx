import { useEffect, useRef } from 'react';

export type WeatherType = 'clear' | 'rain' | 'storm' | 'snow' | 'fog' | 'dust';

interface Particle {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  size?: number;
  drift?: number;
}

interface MultiWeatherSystemProps {
  width: number;
  height: number;
  cameraX: number;
  cameraY: number;
  weatherType: WeatherType;
  onLightningFlash: () => void;
  isPaused?: boolean;
}

export function MultiWeatherSystem({ 
  width, 
  height, 
  cameraX, 
  cameraY, 
  weatherType, 
  onLightningFlash,
  isPaused
}: MultiWeatherSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const lastLightningRef = useRef<number>(0);
  const fogOffsetRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles based on weather type
    const initializeParticles = () => {
      particlesRef.current = [];
      
      switch (weatherType) {
        case 'clear':
          // No particles
          break;
          
        case 'rain':
        case 'storm':
          // 300 rain drops (heavy) - REDUCED INTENSITY
          for (let i = 0; i < 300; i++) {
            particlesRef.current.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speed: 5 + Math.random() * 3, // Reduced from 12+8
              length: 10 + Math.random() * 8, // Reduced from 20+15
              opacity: 0.25 + Math.random() * 0.3, // Reduced from 0.4+0.5
            });
          }
          break;
          
        case 'snow':
          // 200 snowflakes - REDUCED INTENSITY
          for (let i = 0; i < 200; i++) {
            particlesRef.current.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speed: 0.5 + Math.random() * 0.8, // Reduced from 1+2
              length: 0, // Not used for snow
              opacity: 0.3 + Math.random() * 0.3, // Reduced from 0.4+0.4
              size: 1.5 + Math.random() * 2, // Reduced from 2+3
              drift: Math.random() * 1 - 0.5, // Reduced from 2-1
            });
          }
          break;
          
        case 'fog':
          // No particles - fog is overlay based
          break;
          
        case 'dust':
          // 250 dust particles - REDUCED INTENSITY
          for (let i = 0; i < 250; i++) {
            particlesRef.current.push({
              x: Math.random() * width,
              y: Math.random() * height,
              speed: 1 + Math.random() * 1.5, // Reduced from 3+4
              length: 0,
              opacity: 0.15 + Math.random() * 0.2, // Reduced from 0.2+0.3
              size: 0.8 + Math.random() * 1.5, // Reduced from 1+2
              drift: 1 + Math.random() * 1.5, // Reduced from 2+3
            });
          }
          break;
      }
    };

    initializeParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Weather-specific rendering
      switch (weatherType) {
        case 'clear':
          // Nothing to render
          break;
          
        case 'rain':
        case 'storm':
          // Rain drops
          particlesRef.current.forEach((drop) => {
            drop.y += drop.speed;
            drop.x += 0.2; // Reduced from 0.5 - less diagonal drift

            if (drop.y > height) {
              drop.y = -drop.length;
              drop.x = Math.random() * width;
            }
            if (drop.x > width) drop.x = 0;

            ctx.strokeStyle = `rgba(200, 200, 200, ${drop.opacity})`;
            ctx.lineWidth = weatherType === 'storm' ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
          });

          // Lightning for storm only
          if (weatherType === 'storm') {
            const now = Date.now();
            if (now - lastLightningRef.current > 3000 + Math.random() * 5000) {
              lastLightningRef.current = now;
              onLightningFlash();
            }
          }
          break;
          
        case 'snow':
          // Snowflakes
          particlesRef.current.forEach((flake) => {
            flake.y += flake.speed;
            flake.x += Math.sin(flake.y * 0.01) * (flake.drift || 0); // Reduced from 0.02 - slower drift

            if (flake.y > height) {
              flake.y = -10;
              flake.x = Math.random() * width;
            }
            if (flake.x < 0) flake.x = width;
            if (flake.x > width) flake.x = 0;

            ctx.fillStyle = `rgba(220, 220, 220, ${flake.opacity})`;
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.size || 2, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
          
        case 'fog':
          // Animated fog layers - REDUCED SPEED
          fogOffsetRef.current += 0.08; // Reduced from 0.2
          
          // Multiple fog layers with different speeds
          for (let layer = 0; layer < 3; layer++) {
            const offset = (fogOffsetRef.current * (1 + layer * 0.3)) % width;
            const opacity = 0.15 - layer * 0.03;
            
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, `rgba(150, 150, 150, 0)`);
            gradient.addColorStop(0.5, `rgba(150, 150, 150, ${opacity})`);
            gradient.addColorStop(1, `rgba(150, 150, 150, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-offset, layer * (height / 3), width * 2, height / 3);
          }
          break;
          
        case 'dust':
          // Dust storm particles
          particlesRef.current.forEach((particle) => {
            particle.y += particle.speed;
            particle.x += particle.drift || 0;

            if (particle.y > height) {
              particle.y = -10;
              particle.x = Math.random() * width;
            }
            if (particle.x > width) particle.x = 0;
            if (particle.x < 0) particle.x = width;

            ctx.fillStyle = `rgba(160, 160, 165, ${particle.opacity})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size || 1, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (!isPaused) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, weatherType, onLightningFlash, isPaused]);

  // Fog overlay (outside canvas)
  const fogOpacity = weatherType === 'fog' ? 0.25 : 0;

  return (
    <>
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
      {/* Fog static overlay */}
      {weatherType === 'fog' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(140, 140, 145, ${fogOpacity})`,
            pointerEvents: 'none',
            zIndex: 99,
          }}
        />
      )}
    </>
  );
}