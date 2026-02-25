import {
  GRAVITY,
  WALK_MAX_SPEED,
  RUN_MAX_SPEED,
  ACCEL,
  FRICTION,
  JUMP_VELOCITY,
  COYOTE_TIME,
  JUMP_BUFFER,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
} from './constants';
import { InputState } from './input';

export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerPhysics {
  pos: Vec2;
  vel: Vec2;
  size: Vec2;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
}

export function createPlayer(x: number, y: number): PlayerPhysics {
  return {
    pos: { x, y },
    vel: { x: 0, y: 0 },
    size: { x: PLAYER_WIDTH, y: PLAYER_HEIGHT },
    grounded: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
  };
}

export function updatePhysics(
  player: PlayerPhysics,
  input: InputState,
  platforms: Platform[],
  dt: number,
  isLocked = false,
  isSliding = false
): void {
  // Horizontal movement (only if not locked by state)
  if (!isLocked) {
    const targetSpeed = input.runHeld ? RUN_MAX_SPEED : WALK_MAX_SPEED;
    
    if (input.left) {
      // Moving left
      if (player.vel.x > -targetSpeed) {
        // Need to accelerate left (or decelerate from right)
        player.vel.x -= ACCEL * dt;
        if (player.vel.x < -targetSpeed) {
          player.vel.x = -targetSpeed;
        }
      } else if (player.vel.x < -targetSpeed) {
        // Going faster than target, decelerate to target
        player.vel.x += FRICTION * dt;
        if (player.vel.x > -targetSpeed) {
          player.vel.x = -targetSpeed;
        }
      }
    } else if (input.right) {
      // Moving right
      if (player.vel.x < targetSpeed) {
        // Need to accelerate right (or decelerate from left)
        player.vel.x += ACCEL * dt;
        if (player.vel.x > targetSpeed) {
          player.vel.x = targetSpeed;
        }
      } else if (player.vel.x > targetSpeed) {
        // Going faster than target, decelerate to target
        player.vel.x -= FRICTION * dt;
        if (player.vel.x < targetSpeed) {
          player.vel.x = targetSpeed;
        }
      }
    } else {
      // Apply friction to stop
      if (player.vel.x > 0) {
        player.vel.x -= FRICTION * dt;
        if (player.vel.x < 0) player.vel.x = 0;
      } else if (player.vel.x < 0) {
        player.vel.x += FRICTION * dt;
        if (player.vel.x > 0) player.vel.x = 0;
      }
    }
  } else if (isSliding) {
    // During slide: apply reduced friction to maintain momentum
    const slideFriction = FRICTION * 0.8; // Reduced friction for longer slide
    if (player.vel.x > 0) {
      player.vel.x -= slideFriction * dt;
      if (player.vel.x < 0) player.vel.x = 0;
    } else if (player.vel.x < 0) {
      player.vel.x += slideFriction * dt;
      if (player.vel.x > 0) player.vel.x = 0;
    }
    
    // Clamp slide speed to allow burst momentum
    const maxSlideSpeed = RUN_MAX_SPEED * 1.6;
    if (Math.abs(player.vel.x) > maxSlideSpeed) {
      player.vel.x = player.vel.x > 0 ? maxSlideSpeed : -maxSlideSpeed;
    }
  } else {
    // Locked by hurt/death: apply natural friction
    const naturalFriction = FRICTION * 0.4;
    if (player.vel.x > 0) {
      player.vel.x -= naturalFriction * dt;
      if (player.vel.x < 0) player.vel.x = 0;
    } else if (player.vel.x < 0) {
      player.vel.x += naturalFriction * dt;
      if (player.vel.x > 0) player.vel.x = 0;
    }
  }

  // Coyote time: allow jumping shortly after leaving ground
  if (player.grounded) {
    player.coyoteTimer = COYOTE_TIME;
  } else {
    player.coyoteTimer -= dt;
  }

  // Jump buffer: remember jump input for a short time
  if (input.jumpPressed) {
    player.jumpBufferTimer = JUMP_BUFFER;
  } else {
    player.jumpBufferTimer -= dt;
  }

  // Jump logic (disabled during slide or locked states except shoot)
  if (!isLocked && !isSliding && player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
    player.vel.y = JUMP_VELOCITY;
    player.grounded = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
  }

  // Apply gravity
  player.vel.y += GRAVITY * dt;

  // Integrate velocity
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  // Reset grounded state before collision detection
  player.grounded = false;

  // Collision detection and resolution
  for (const platform of platforms) {
    const playerBottom = player.pos.y + player.size.y;
    const playerTop = player.pos.y;
    const playerLeft = player.pos.x;
    const playerRight = player.pos.x + player.size.x;

    const platformTop = platform.y;
    const platformBottom = platform.y + platform.height;
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;

    // Ground stick tolerance: if within 2px above platform and moving down slowly, snap
    const distanceAbovePlatform = platformTop - playerBottom;
    if (
      distanceAbovePlatform >= -2 &&
      distanceAbovePlatform <= 2 &&
      player.vel.y >= -50 &&
      playerLeft < platformRight &&
      playerRight > platformLeft
    ) {
      // Snap to platform top
      player.pos.y = Math.floor(platformTop - player.size.y);
      player.vel.y = 0;
      player.grounded = true;
      continue; // Skip full AABB check for this platform
    }

    // Full AABB collision check
    const collision = checkAABB(
      playerLeft,
      playerTop,
      player.size.x,
      player.size.y,
      platformLeft,
      platformTop,
      platform.width,
      platform.height
    );

    if (collision) {
      // Calculate overlap on each axis
      const overlapTop = playerBottom - platformTop;
      const overlapBottom = platformBottom - playerTop;
      const overlapLeft = playerRight - platformLeft;
      const overlapRight = platformRight - playerLeft;

      // Find minimum overlap (prioritize vertical for grounded detection)
      const minOverlap = Math.min(overlapTop, overlapBottom, overlapLeft, overlapRight);

      if (minOverlap === overlapTop && player.vel.y > 0) {
        // Landing on top - snap to exact integer position
        player.pos.y = Math.floor(platformTop - player.size.y);
        player.vel.y = 0;
        player.grounded = true;
      } else if (minOverlap === overlapBottom && player.vel.y < 0) {
        // Hit ceiling
        player.pos.y = platformBottom;
        player.vel.y = 0;
      } else if (minOverlap === overlapLeft && player.vel.x > 0) {
        // Hit right side
        player.pos.x = platformLeft - player.size.x;
        player.vel.x = 0;
      } else if (minOverlap === overlapRight && player.vel.x < 0) {
        // Hit left side
        player.pos.x = platformRight;
        player.vel.x = 0;
      }
    }
  }
}

function checkAABB(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}