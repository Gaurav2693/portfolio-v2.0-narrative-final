import { useEffect, useRef, useState } from 'react';
import { GameLoop } from '@/app/components/game/runtime/game-loop';
import { InputState } from '@/app/components/game/runtime/input';
import { 
  createPlayer, 
  updatePhysics, 
  Platform, 
  PlayerPhysics 
} from '@/app/components/game/runtime/physics';
import { 
  createPlayerState, 
  updateState, 
  PlayerState 
} from '@/app/components/game/runtime/state-machine';
import {
  BackgroundFarElements,
  BackgroundMidElements,
  ForegroundElements,
} from '@/app/components/game/environment-components';
import { MultiWeatherSystem, WeatherType } from '@/app/components/game/runtime/multi-weather-system';
import { useSound } from '@/app/context/sound-context';

// Import character GIFs
import idleGif from "figma:asset/5ebd7a3b00419310625953cf85699753d48e657c.png";
import walkGif from "figma:asset/ccdf127dde2b965a914fee2bf5b6d2a3cd9b3bfa.png";
import runGif from "figma:asset/48dc3f24ed04f9a0b485d7c438ad9dffc0283857.png";
import jumpGif from "figma:asset/8dae146f258ffc9c969710d371e398e260d43fd4.png";
import slideGif from "figma:asset/f8643f3befad3a7ccd72f6980bd62fcdbe46c1a8.png";
import shootGif from "figma:asset/c39268ffdd2e29bc37f4e9ea623e9d6603eda440.png";
import hurt1Gif from "figma:asset/f4e5dde789dd65271b5628df821f165172784339.png";
import hurt2Gif from "figma:asset/795eb6926734d295eb166d79372357b1ad87f107.png";
import deathGif from "figma:asset/dc25c06ba1bd6f70d9dd1fd93ff62070bb90d0d4.png";

// Level data structure
interface LevelData {
  id: string;
  name: string;
  platforms: Platform[];
  spawnPoint: { x: number; y: number };
  exitZone: { x: number; y: number; width: number; height: number };
  worldWidth: number;
  deathY: number; // Fall below this Y = death
}

// Level 1: FLAT - Safe platform run with small gaps and hazard preview
const LEVEL_1: LevelData = {
  id: 'level_1',
  name: 'FLAT',
  spawnPoint: { x: 100, y: 486 },
  exitZone: { x: 2850, y: 450, width: 100, height: 150 },
  worldWidth: 3200,
  deathY: 800,
  platforms: [
    // Spawn platform
    { x: 0, y: 550, width: 400, height: 50 },
    
    // Small gap 1
    { x: 480, y: 550, width: 320, height: 50 },
    
    // Small gap 2
    { x: 880, y: 550, width: 400, height: 50 },
    
    // Hazard preview zone (visual marker later)
    { x: 1360, y: 550, width: 200, height: 50 },
    
    // Safe runway
    { x: 1640, y: 550, width: 600, height: 50 },
    
    // Small elevation
    { x: 2320, y: 500, width: 350, height: 30 },
    
    // Exit platform
    { x: 2750, y: 550, width: 400, height: 50 },
  ],
};

// Level 2: MIXED - Flat entry → vertical middle → flat exit
const LEVEL_2: LevelData = {
  id: 'level_2',
  name: 'MIXED',
  spawnPoint: { x: 100, y: 486 },
  exitZone: { x: 2700, y: 300, width: 100, height: 250 },
  worldWidth: 3200,
  deathY: 800,
  platforms: [
    // Flat entry
    { x: 0, y: 550, width: 500, height: 50 },
    { x: 580, y: 550, width: 300, height: 50 },
    
    // Vertical section: ascending stairs
    { x: 950, y: 500, width: 200, height: 30 },
    { x: 1100, y: 450, width: 180, height: 30 },
    { x: 1230, y: 400, width: 180, height: 30 },
    { x: 1360, y: 350, width: 200, height: 30 },
    
    // High platform runway
    { x: 1620, y: 350, width: 450, height: 30 },
    
    // Descending stairs
    { x: 2130, y: 400, width: 180, height: 30 },
    { x: 2260, y: 450, width: 180, height: 30 },
    
    // Flat exit
    { x: 2500, y: 500, width: 600, height: 50 },
  ],
};

const LEVELS = [LEVEL_1, LEVEL_2];

// Animation visual offsets (relative to bottom-center anchor)
const ANIMATION_OFFSETS: Record<string, { x: number; y: number }> = {
  idle: { x: 0, y: 0 },
  walk: { x: 0, y: 0 },
  run: { x: 0, y: 0 },
  jump: { x: 0, y: -2 },
  slide: { x: 0, y: 6 },
  shoot: { x: 0, y: 0 },
  hurt_1: { x: 0, y: 0 },
  hurt_2: { x: 0, y: 0 },
  death: { x: 0, y: 10 },
};

// World sprite dimensions (locked for consistency)
const SPRITE_RENDER_HEIGHT = 102; // Reduced by 20% (128 * 0.8)
const SPRITE_RENDER_WIDTH = 102; // Reduced by 20% (128 * 0.8)

interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function checkRectCollision(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

export default function GamePlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [deathTriggered, setDeathTriggered] = useState(false);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('rain');
  const [weatherPaused, setWeatherPaused] = useState(false);
  const pauseTimerRef = useRef<number | null>(null);
  
  // Sound system
  const { playClick, playLaserShot, playGameAction, playThunder, startRain, stopRain } = useSound();
  
  // Track previous input state to detect key presses
  const prevInputRef = useRef({
    shootPressed: false,
    slidePressed: false,
    hurt1Pressed: false,
    hurt2Pressed: false,
    jumpPressed: false,
  });
  
  // Game state
  const physicsRef = useRef<PlayerPhysics>(createPlayer(LEVELS[0].spawnPoint.x, LEVELS[0].spawnPoint.y));
  const stateRef = useRef<PlayerState>(createPlayerState());
  const inputRef = useRef<InputState>(new InputState());
  const cameraRef = useRef<Camera>({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const gameLoopRef = useRef<GameLoop | null>(null);

  // Force React re-render
  const [, forceUpdate] = useState({});

  const currentLevel = LEVELS[currentLevelIndex];

  const respawnPlayer = () => {
    const physics = physicsRef.current;
    const state = stateRef.current;
    const camera = cameraRef.current;

    physics.pos.x = currentLevel.spawnPoint.x;
    physics.pos.y = currentLevel.spawnPoint.y;
    physics.vel.x = 0;
    physics.vel.y = 0;
    physics.grounded = false;
    physics.coyoteTimer = 0;
    physics.jumpBufferTimer = 0;
    state.locomotion = 'idle';
    state.momentum = 0;
    state.facingRight = true;
    state.stateTimer = 0;
    state.stateLocked = false;
    state.shootCooldown = 0;
    state.knockbackApplied = false;
    camera.x = 0;
    camera.targetX = 0;
    camera.y = 0;
    camera.targetY = 0;
    setDeathTriggered(false);
    setLevelComplete(false); // Clear level complete state
  };

  const loadLevel = (levelIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    setLevelComplete(false);
    respawnPlayer();
  };

  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      }
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    const physics = physicsRef.current;
    const state = stateRef.current;
    const camera = cameraRef.current;

    input.init();

    const update = (dt: number) => {
      input.update();

      // Check if any input is active
      const anyInputActive = 
        input.left || input.right || input.jumpPressed || 
        input.runHeld || input.shootPressed || input.slidePressed ||
        input.hurt1Pressed || input.hurt2Pressed || input.resetPressed;

      // Pause weather when player interacts
      if (anyInputActive) {
        setWeatherPaused(true);
        
        // Clear existing timer
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
        }
        
        // Set new timer to resume after 500ms of no input
        pauseTimerRef.current = window.setTimeout(() => {
          setWeatherPaused(false);
        }, 500);
      }

      // Detect key press transitions and play sounds
      const prevInput = prevInputRef.current;
      
      // Shoot sound - fires every time J is pressed
      if (input.shootPressed && !prevInput.shootPressed) {
        console.log('🔫 SHOOT SOUND TRIGGERED');
        playLaserShot();
      }
      
      // Slide sound
      if (input.slidePressed && !prevInput.slidePressed) {
        console.log('🛝 SLIDE SOUND TRIGGERED');
        playGameAction();
      }
      
      // Jump sound
      if (input.jumpPressed && !prevInput.jumpPressed) {
        console.log('⬆️ JUMP SOUND TRIGGERED');
        playGameAction();
      }
      
      // Hurt sounds
      if (input.hurt1Pressed && !prevInput.hurt1Pressed) {
        console.log('💥 HURT1 SOUND TRIGGERED');
        playGameAction();
      }
      if (input.hurt2Pressed && !prevInput.hurt2Pressed) {
        console.log('💥💥 HURT2 SOUND TRIGGERED');
        playGameAction();
      }
      
      // Update prev input state
      prevInput.shootPressed = input.shootPressed;
      prevInput.slidePressed = input.slidePressed;
      prevInput.jumpPressed = input.jumpPressed;
      prevInput.hurt1Pressed = input.hurt1Pressed;
      prevInput.hurt2Pressed = input.hurt2Pressed;

      // Reset on R key
      if (input.resetPressed) {
        console.log('🔄 RESET SOUND TRIGGERED');
        playGameAction();
        respawnPlayer();
        return;
      }

      // Don't update if level complete
      if (levelComplete) return;

      // Update state machine first (may modify physics)
      updateState(state, physics, input, dt);

      // Check for death boundary (falling below world)
      if (physics.pos.y > currentLevel.deathY && !deathTriggered) {
        console.log('Death boundary triggered');
        setDeathTriggered(true);
        state.locomotion = 'death';
        state.stateTimer = 2.0;
        state.stateLocked = true;
        physics.vel.x = 0;
        physics.vel.y = 0;
      }

      // Check if death animation complete - respawn
      if (deathTriggered && state.locomotion === 'death' && state.stateTimer <= 0) {
        respawnPlayer();
      }

      // Update physics with state context
      // Slide and shoot should NOT be treated as "locked" - they allow physics to continue
      const isLocked = state.stateLocked && state.locomotion !== 'shoot' && state.locomotion !== 'slide';
      const isSliding = state.locomotion === 'slide';
      updatePhysics(physics, input, currentLevel.platforms, dt, isLocked, isSliding);

      // Check for exit zone collision
      const playerCollisionBox = {
        x: physics.pos.x,
        y: physics.pos.y,
        w: physics.size.x,
        h: physics.size.y,
      };
      const exitZone = currentLevel.exitZone;
      if (checkRectCollision(
        playerCollisionBox.x, playerCollisionBox.y, playerCollisionBox.w, playerCollisionBox.h,
        exitZone.x, exitZone.y, exitZone.width, exitZone.height
      )) {
        setLevelComplete(true);
      }

      // Update camera
      camera.targetX = physics.pos.x - viewportWidth * 0.35;
      camera.targetY = physics.pos.y - 300;

      // Smooth camera follow
      const smoothingFactor = 1 - Math.pow(0.001, dt);
      camera.x = lerp(camera.x, camera.targetX, smoothingFactor);
      camera.y = lerp(camera.y, camera.targetY, smoothingFactor * 0.3);

      // Clamp camera
      if (camera.x < 0) camera.x = 0;
      if (camera.y < -100) camera.y = -100;
      if (camera.y > 100) camera.y = 100;
    };

    const render = () => {
      forceUpdate({});
    };

    const loop = new GameLoop(update, render);
    gameLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      input.cleanup();
    };
  }, [viewportWidth, currentLevel, levelComplete, deathTriggered]);

  const getSpriteForState = (locomotion: string) => {
    switch (locomotion) {
      case 'idle': return idleGif;
      case 'walk': return walkGif;
      case 'run': return runGif;
      case 'jump': return jumpGif;
      case 'slide': return slideGif;
      case 'shoot': return shootGif;
      case 'hurt_1': return hurt1Gif;
      case 'hurt_2': return hurt2Gif;
      case 'death': return deathGif;
      default: return idleGif;
    }
  };

  const physics = physicsRef.current;
  const state = stateRef.current;
  const camera = cameraRef.current;

  // Calculate sprite render position from bottom-center anchor
  // Collision box: physics.pos is top-left, size is 64x64
  // Anchor point: bottom-center of collision box
  const anchorX = physics.pos.x + physics.size.x / 2; // Center X
  const anchorY = physics.pos.y + physics.size.y; // Bottom Y
  
  // Apply animation-specific offset
  const offset = ANIMATION_OFFSETS[state.locomotion] || { x: 0, y: 0 };
  
  // Sprite renders from its center point
  const spriteX = anchorX - SPRITE_RENDER_WIDTH / 2 + offset.x;
  const spriteY = anchorY - SPRITE_RENDER_HEIGHT + offset.y;

  return (
    <div className="w-full h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">
      {/* Game viewport */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#1A1A1A]">
        {/* Premium UI Overlay - INERTIA Branding */}
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="flex items-center justify-between p-6">
            {/* Left: Game Title */}
            <div className="pointer-events-auto">
              <h1 className="text-2xl font-['Exo_2',sans-serif] font-bold text-white tracking-[0.2em] uppercase">
                INERTIA
              </h1>
              <div className="text-[9px] font-['Cambay',sans-serif] text-gray-500 tracking-wider uppercase mt-1">
                Precision Platformer
              </div>
            </div>

            {/* Right: Level & Weather Info */}
            <div className="pointer-events-auto flex items-center gap-6">
              {/* Level Display */}
              <div className="text-right">
                <div className="text-[9px] font-['Cambay',sans-serif] text-gray-600 uppercase tracking-wider mb-1">
                  Current Level
                </div>
                <div className="text-sm font-['Exo_2',sans-serif] text-white uppercase tracking-wider">
                  {currentLevel.name}
                </div>
              </div>

              {/* Weather Display */}
              <div className="text-right">
                <div className="text-[9px] font-['Cambay',sans-serif] text-gray-600 uppercase tracking-wider mb-1">
                  Atmosphere
                </div>
                <div className="text-sm font-['Exo_2',sans-serif] text-white uppercase tracking-wider">
                  {currentWeather}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objective - Top Center */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 text-[10px] font-['Cambay',sans-serif] text-gray-600 uppercase tracking-wider">
          Objective: Reach Exit
        </div>

        {/* Controls overlay - Top Right - Refined */}
        <div className="absolute top-20 right-6 z-10 bg-black/60 backdrop-blur-sm px-4 py-3 border border-gray-800">
          <div className="text-[9px] font-['Cambay',sans-serif] text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-800 pb-2">
            Controls
          </div>
          <div className="text-[10px] font-['Cambay',sans-serif] text-gray-400 space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Move</span>
              <span className="text-white font-mono">A/D ←/→</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Run</span>
              <span className="text-white font-mono">Shift</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Jump</span>
              <span className="text-white font-mono">W / Space</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Shoot</span>
              <span className="text-white font-mono">J</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Slide</span>
              <span className="text-white font-mono">K</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-gray-800 pt-1 mt-1">
              <span className="text-gray-600">Restart</span>
              <span className="text-white font-mono">R</span>
            </div>
          </div>
        </div>

        {/* Level Complete Overlay - Premium Design */}
        {levelComplete && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="text-center space-y-6 px-8">
              {/* Title */}
              <div className="space-y-2">
                <div className="text-4xl font-['Exo_2',sans-serif] font-bold text-white uppercase tracking-[0.3em]">
                  Run Complete
                </div>
                <div className="text-sm font-['Cambay',sans-serif] text-gray-500 uppercase tracking-wider">
                  Level {currentLevel.name} Cleared
                </div>
              </div>

              {/* Divider */}
              <div className="w-32 h-[1px] bg-gray-700 mx-auto" />

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    playClick();
                    respawnPlayer();
                  }}
                  className="px-6 py-3 text-xs font-['Cambay',sans-serif] uppercase tracking-[0.2em] bg-transparent text-white border border-gray-700 hover:bg-gray-900 hover:border-gray-600 transition-all"
                >
                  Restart Level
                </button>
                {currentLevelIndex < LEVELS.length - 1 && (
                  <button
                    onClick={() => {
                      playClick();
                      loadLevel(currentLevelIndex + 1);
                    }}
                    className="px-6 py-3 text-xs font-['Cambay',sans-serif] uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all"
                  >
                    Next Level →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* World container */}
        <div
          style={{
            position: 'absolute',
            width: `${currentLevel.worldWidth}px`,
            height: '100%',
            transform: `translate(${-camera.x}px, ${-camera.y}px)`,
          }}
        >
          {/* Background Far Layer (parallax 0.15x) */}
          <div
            style={{
              position: 'absolute',
              left: camera.x * 0.15,
              top: 50,
              opacity: 0.5,
            }}
          >
            <BackgroundFarElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 600 + camera.x * 0.15,
              top: 100,
              opacity: 0.5,
            }}
          >
            <BackgroundFarElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1200 + camera.x * 0.15,
              top: 80,
              opacity: 0.5,
            }}
          >
            <BackgroundFarElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1800 + camera.x * 0.15,
              top: 90,
              opacity: 0.5,
            }}
          >
            <BackgroundFarElements />
          </div>

          {/* Background Mid Layer (parallax 0.35x) */}
          <div
            style={{
              position: 'absolute',
              left: camera.x * 0.35,
              top: 120,
              opacity: 0.7,
            }}
          >
            <BackgroundMidElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 700 + camera.x * 0.35,
              top: 150,
              opacity: 0.7,
            }}
          >
            <BackgroundMidElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1400 + camera.x * 0.35,
              top: 100,
              opacity: 0.7,
            }}
          >
            <BackgroundMidElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 2100 + camera.x * 0.35,
              top: 130,
              opacity: 0.7,
            }}
          >
            <BackgroundMidElements />
          </div>

          {/* Platforms (collision layer) */}
          {currentLevel.platforms.map((platform, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
              }}
            >
              <svg width={platform.width} height={platform.height} viewBox={`0 0 ${platform.width} ${platform.height}`}>
                <rect x="0" y="0" width={platform.width} height={platform.height} fill="rgba(95, 95, 100, 0.8)" />
                <line x1="0" y1="0" x2={platform.width} y2="0" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="2" />
                <line x1="0" y1={platform.height} x2={platform.width} y2={platform.height} stroke="rgba(75, 75, 80, 0.6)" strokeWidth="1" />
              </svg>
            </div>
          ))}

          {/* Exit Zone - Visual indicator */}
          <div
            style={{
              position: 'absolute',
              left: currentLevel.exitZone.x,
              top: currentLevel.exitZone.y,
              width: currentLevel.exitZone.width,
              height: currentLevel.exitZone.height,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-[10px] font-['Cambay',sans-serif] text-gray-500 uppercase tracking-wider">
              Exit
            </div>
          </div>

          {/* Player */}
          <div
            style={{
              position: 'absolute',
              left: spriteX,
              top: spriteY,
              width: SPRITE_RENDER_WIDTH,
              height: SPRITE_RENDER_HEIGHT,
              transform: state.facingRight ? 'scaleX(1)' : 'scaleX(-1)',
            }}
          >
            <img
              src={getSpriteForState(state.locomotion)}
              alt={`Player ${state.locomotion}`}
              style={{
                width: '100%',
                height: '100%',
                imageRendering: 'pixelated',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Foreground Layer (subtle depth) */}
          <div
            style={{
              position: 'absolute',
              left: 100,
              top: 200,
              opacity: 0.6,
            }}
          >
            <ForegroundElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 800,
              top: 250,
              opacity: 0.6,
            }}
          >
            <ForegroundElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 1600,
              top: 180,
              opacity: 0.6,
            }}
          >
            <ForegroundElements />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 2400,
              top: 220,
              opacity: 0.6,
            }}
          >
            <ForegroundElements />
          </div>
        </div>

        {/* Weather System - Rain and Lightning */}
        <MultiWeatherSystem
          width={viewportWidth}
          height={containerRef.current?.clientHeight || 600}
          cameraX={camera.x}
          cameraY={camera.y}
          weatherType={currentWeather}
          isPaused={weatherPaused}
          onLightningFlash={() => {
            setLightningFlash(true);
            playThunder();
            setTimeout(() => setLightningFlash(false), 150);
          }}
        />

        {/* Lightning Flash Overlay */}
        {lightningFlash && (
          <div
            className="absolute inset-0 bg-white pointer-events-none"
            style={{
              opacity: 0.4,
              animation: 'lightning 0.15s ease-out',
              zIndex: 200,
            }}
          />
        )}
      </div>

      {/* Debug / Telemetry Panel */}
      <div className="bg-[#0F0F0F] border-t border-gray-800 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Controls Row - Level & Weather Selectors */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            {/* Level Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-['Cambay',sans-serif] text-gray-600 uppercase tracking-wider">
                Select Level:
              </span>
              {LEVELS.map((level, idx) => (
                <button
                  key={level.id}
                  onClick={() => {
                    playClick();
                    loadLevel(idx);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-['Cambay',sans-serif] uppercase tracking-wider transition-all ${
                    currentLevelIndex === idx
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>

            {/* Weather Selector */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-['Cambay',sans-serif] text-gray-600 uppercase tracking-wider">
                Atmosphere:
              </span>
              <div className="flex gap-1.5">
                {(['clear', 'rain', 'storm', 'snow', 'fog', 'dust'] as WeatherType[]).map((weather) => (
                  <button
                    key={weather}
                    onClick={() => {
                      playClick();
                      setCurrentWeather(weather);
                    }}
                    className={`px-2.5 py-1 text-[9px] font-['Cambay',sans-serif] uppercase tracking-wider transition-all ${
                      currentWeather === weather
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {weather}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Data */}
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-4 text-xs font-['Cambay',sans-serif]">
            <div>
              <div className="text-gray-600 mb-1">Level</div>
              <div className="text-white font-mono">{currentLevel.name}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">State</div>
              <div className="text-white font-mono">{state.locomotion.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Timer</div>
              <div className="text-white font-mono">{state.stateTimer.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Locked</div>
              <div className={`font-mono ${state.stateLocked ? 'text-yellow-500' : 'text-gray-600'}`}>
                {state.stateLocked ? 'YES' : 'NO'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Shoot CD</div>
              <div className="text-white font-mono">{state.shootCooldown.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Momentum</div>
              <div className="text-white font-mono">{state.momentum}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Grounded</div>
              <div className="text-white font-mono">{physics.grounded ? 'YES' : 'NO'}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">X</div>
              <div className="text-white font-mono">{Math.round(physics.pos.x)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Y</div>
              <div className="text-white font-mono">{Math.round(physics.pos.y)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">VX</div>
              <div className="text-white font-mono">{Math.round(physics.vel.x)}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">VY</div>
              <div className="text-white font-mono">{Math.round(physics.vel.y)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}