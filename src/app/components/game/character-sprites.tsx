// Character sprite frames - preserved exactly as provided
// No scaling or modifications applied
// Images imported using figma:asset scheme

import { useEffect, useState, useRef } from "react";

import idleSprite from "figma:asset/a89d86777414ace99c27a5a383256c1230e87b15.png";
import walkSprite from "figma:asset/73800660c4941a9699b245cc0961f4665eacc852.png";
import runSprite from "figma:asset/da295aaa41ee3263092cba0130f8f0cbc4990e85.png";

// Character / Idle (gun down)
export function CharacterIdle() {
  return (
    <div className="inline-block">
      <img
        src={idleSprite}
        alt="Character Idle"
        className="block"
        style={{
          imageRendering: "pixelated",
          width: "auto",
          height: "auto",
          maxHeight: "140px",
        }}
        onError={(e) => {
          console.error("Failed to load Idle sprite");
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

// Character / Walk (gun up) - animation frames
export function CharacterWalk() {
  // Walk cycle: 8 frames at 10fps, each frame is 128px wide
  const frameWidth = 128;
  const totalFrames = 8;
  const fps = 10;
  const frameDuration = 1000 / fps; // ms per frame

  const [currentFrame, setCurrentFrame] = useState(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current >= frameDuration) {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
        lastFrameTimeRef.current = timestamp;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [frameDuration, totalFrames]);

  return (
    <div
      className="inline-block overflow-hidden"
      style={{ width: frameWidth, height: 128 }}
    >
      <img
        src={walkSprite}
        alt="Character Walk"
        className="block"
        style={{
          imageRendering: "pixelated",
          transform: `translateX(-${currentFrame * frameWidth}px)`,
          height: "128px",
          width: "auto",
        }}
        onError={(e) => {
          console.error("Failed to load Walk sprite");
        }}
      />
    </div>
  );
}

// Character / Run (gun up) - animation frames
export function CharacterRun({
  frame = 0,
}: {
  frame?: number;
}) {
  // Run cycle has 11 frames
  const frameWidth = 140; // approximate frame width from sprite sheet
  const totalFrames = 11;
  const currentFrame = frame % totalFrames;

  return (
    <div
      className="inline-block overflow-hidden"
      style={{ width: frameWidth, height: 140 }}
    >
      <img
        src={runSprite}
        alt="Character Run"
        className="block"
        style={{
          imageRendering: "pixelated",
          transform: `translateX(-${currentFrame * frameWidth}px)`,
          width: "auto",
          height: "auto",
          maxHeight: "140px",
        }}
        onError={(e) => {
          console.error("Failed to load Run sprite");
        }}
      />
    </div>
  );
}