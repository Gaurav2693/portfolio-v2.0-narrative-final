import { PlayerPhysics } from './physics';
import { RUN_MAX_SPEED, WALK_MAX_SPEED } from './constants';
import { InputState } from './input';

export type LocomotionState = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'jump' 
  | 'shoot' 
  | 'slide' 
  | 'hurt_1' 
  | 'hurt_2' 
  | 'death';

export interface PlayerState {
  locomotion: LocomotionState;
  momentum: number; // 0-100
  signal: number; // 0-100
  facingRight: boolean;
  stateTimer: number; // Timer for temporary states
  stateLocked: boolean; // True when state cannot be interrupted
  shootCooldown: number; // Cooldown between shots
  knockbackApplied: boolean; // Prevents double knockback
}

export function createPlayerState(): PlayerState {
  return {
    locomotion: 'idle',
    momentum: 0,
    signal: 100,
    facingRight: true,
    stateTimer: 0,
    stateLocked: false,
    shootCooldown: 0,
    knockbackApplied: false,
  };
}

export function updateState(
  state: PlayerState,
  physics: PlayerPhysics,
  input: InputState,
  dt: number
): void {
  // Update timers
  if (state.stateTimer > 0) {
    state.stateTimer -= dt;
    if (state.stateTimer < 0) {
      state.stateTimer = 0;
    }
  }

  if (state.shootCooldown > 0) {
    state.shootCooldown -= dt;
    if (state.shootCooldown < 0) {
      state.shootCooldown = 0;
    }
  }

  // Compute momentum from velocity (0-100 scale)
  const absVelX = Math.abs(physics.vel.x);
  state.momentum = Math.round((absVelX / RUN_MAX_SPEED) * 100);
  if (state.momentum > 100) state.momentum = 100;

  // Update facing direction (only when not locked)
  if (!state.stateLocked) {
    if (input.left && !input.right) {
      state.facingRight = false;
    } else if (input.right && !input.left) {
      state.facingRight = true;
    }
  }

  // STATE RESOLUTION (priority order, respecting locks)
  
  // 1. DEATH - Highest priority, always wins
  if (input.deathPressed) {
    console.log('DEATH triggered');
    state.locomotion = 'death';
    state.stateTimer = 2.0; // Long death animation
    state.stateLocked = true;
    physics.vel.x = 0;
    physics.vel.y = 0;
    return;
  }

  // Continue death animation
  if (state.locomotion === 'death') {
    // Stay in death until timer expires (could trigger respawn)
    return;
  }

  // 2. HURT_2 - High priority damage state
  if (input.hurt2Pressed && !state.stateLocked) {
    console.log('HURT_2 triggered');
    state.locomotion = 'hurt_2';
    state.stateTimer = 0.45;
    state.stateLocked = true;
    state.knockbackApplied = false;
  }

  if (state.locomotion === 'hurt_2') {
    // Apply knockback once
    if (!state.knockbackApplied) {
      physics.vel.x = state.facingRight ? -250 : 250; // Knockback opposite to facing
      physics.vel.y = -180; // Upward knockback
      state.knockbackApplied = true;
    }
    
    // Stay locked until timer expires
    if (state.stateTimer > 0) {
      return;
    } else {
      state.stateLocked = false;
    }
  }

  // 3. HURT_1 - Medium priority damage state
  if (input.hurt1Pressed && !state.stateLocked) {
    console.log('HURT_1 triggered');
    state.locomotion = 'hurt_1';
    state.stateTimer = 0.30;
    state.stateLocked = true;
    state.knockbackApplied = false;
  }

  if (state.locomotion === 'hurt_1') {
    // Apply knockback once
    if (!state.knockbackApplied) {
      physics.vel.x = state.facingRight ? -150 : 150; // Smaller knockback
      physics.vel.y = -120;
      state.knockbackApplied = true;
    }
    
    // Stay locked until timer expires
    if (state.stateTimer > 0) {
      return;
    } else {
      state.stateLocked = false;
    }
  }

  // 4. SLIDE - Requires grounded + fast movement
  const slideThreshold = 60;
  
  if (input.slidePressed && !state.stateLocked && physics.grounded && absVelX > slideThreshold) {
    console.log('SLIDE triggered', absVelX);
    state.locomotion = 'slide';
    state.stateTimer = 0.35;
    state.stateLocked = true;
    state.knockbackApplied = false;
    
    // Apply momentum burst in current direction
    if (physics.vel.x > 0) {
      physics.vel.x += 120;
    } else if (physics.vel.x < 0) {
      physics.vel.x -= 120;
    }
  }

  if (state.locomotion === 'slide') {
    // Stay in slide until timer expires
    if (state.stateTimer > 0) {
      // Slide physics handled in physics.ts
      return;
    } else {
      state.stateLocked = false;
    }
  }

  // 5. SHOOT - Can be tapped/held with cooldown
  if (input.shootPressed && state.shootCooldown <= 0 && !state.stateLocked) {
    console.log('SHOOT triggered');
    state.locomotion = 'shoot';
    state.stateTimer = 0.18;
    state.shootCooldown = 0.12; // Cooldown before next shot
    
    // Micro recoil: reduce velocity by 6%
    physics.vel.x *= 0.94;
  }

  if (state.locomotion === 'shoot') {
    // Movement and jumping allowed during shoot
    if (state.stateTimer > 0) {
      // Stay in shoot but don't lock movement
      if (!physics.grounded) {
        // If we leave ground, transition to jump
        state.locomotion = 'jump';
      }
      return;
    }
    // Timer expired, fall through to locomotion
  }

  // 6. JUMP - In air or recently jumped
  if (!physics.grounded || physics.vel.y < -50) {
    state.locomotion = 'jump';
    return;
  }

  // 7. Grounded locomotion based on velocity
  if (absVelX < 5) {
    state.locomotion = 'idle';
  } else if (absVelX < WALK_MAX_SPEED * 0.8) {
    state.locomotion = 'walk';
  } else {
    state.locomotion = 'run';
  }

  // Signal remains at 100 for now (no decay mechanics yet)
  state.signal = 100;
}