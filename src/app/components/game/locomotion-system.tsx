import { useState, useEffect, useCallback } from 'react';

// GIF Assets for character states
import idleGif from "figma:asset/5ebd7a3b00419310625953cf85699753d48e657c.png";
import walkGif from "figma:asset/ccdf127dde2b965a914fee2bf5b6d2a3cd9b3bfa.png";
import runGif from "figma:asset/48dc3f24ed04f9a0b485d7c438ad9dffc0283857.png";
import slideGif from "figma:asset/f8643f3befad3a7ccd72f6980bd62fcdbe46c1a8.png";
import jumpGif from "figma:asset/8dae146f258ffc9c969710d371e398e260d43fd4.png";
import hurt1Gif from "figma:asset/f4e5dde789dd65271b5628df821f165172784339.png";
import hurt2Gif from "figma:asset/795eb6926734d295eb166d79372357b1ad87f107.png";
import deathGif from "figma:asset/dc25c06ba1bd6f70d9dd1fd93ff62070bb90d0d4.png";

// State Layering Model
export type LocomotionState = 'idle' | 'walk' | 'run' | 'jump' | 'slide';
export type ActionState = 'shoot' | null;
export type ReactiveState = 'hurt1' | 'hurt2' | 'death' | null;

export type MomentumTier = 'none' | 'low' | 'high' | 'locked' | 'preserved';

interface StateSystemProps {
  onSignalChange?: (delta: number) => void;
  onMomentumChange?: (value: number) => void;
}

export function useStateSystem({ 
  onSignalChange,
  onMomentumChange 
}: StateSystemProps) {
  // State Layers
  const [locomotionState, setLocomotionState] = useState<LocomotionState>('idle');
  const [actionState, setActionState] = useState<ActionState>(null);
  const [reactiveState, setReactiveState] = useState<ReactiveState>(null);
  
  const [frame, setFrame] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [previousLocomotion, setPreviousLocomotion] = useState<LocomotionState>('idle');

  // Calculate momentum tier
  const getMomentumTier = useCallback((): MomentumTier => {
    if (locomotionState === 'slide') return 'locked';
    if (locomotionState === 'jump') return 'preserved';
    if (momentum === 0) return 'none';
    if (momentum <= 30) return 'low';
    return 'high';
  }, [locomotionState, momentum]);

  // Animation frame management
  useEffect(() => {
    // Reactive states override animations
    if (reactiveState === 'death') {
      setFrame(0);
      return;
    }

    let interval: NodeJS.Timeout;
    
    if (locomotionState === 'idle') {
      setFrame(0);
    } else if (locomotionState === 'walk') {
      // Walk animation: 8 frames, moderate speed
      interval = setInterval(() => {
        setFrame(prev => (prev + 1) % 8);
      }, 120); // ~8 FPS
    } else if (locomotionState === 'run') {
      // Run animation: 11 frames, faster speed
      interval = setInterval(() => {
        setFrame(prev => (prev + 1) % 11);
      }, 80); // ~12 FPS
    } else if (locomotionState === 'jump') {
      setFrame(0); // Placeholder
    } else if (locomotionState === 'slide') {
      setFrame(0); // Placeholder
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [locomotionState, reactiveState]);

  // Momentum management
  useEffect(() => {
    // Death or reactive states freeze momentum
    if (reactiveState === 'death') return;

    let momentumInterval: NodeJS.Timeout;

    if (locomotionState === 'run' && isMoving) {
      // Momentum builds over time during run
      momentumInterval = setInterval(() => {
        setMomentum(prev => {
          const newMomentum = Math.min(100, prev + 5);
          onMomentumChange?.(newMomentum);
          return newMomentum;
        });
      }, 200);
    } else if (locomotionState === 'walk' && isMoving) {
      // Walk maintains low momentum
      setMomentum(30);
      onMomentumChange?.(30);
    } else if (locomotionState === 'idle') {
      // Idle decays momentum and recovers signal
      if (momentum > 0) {
        momentumInterval = setInterval(() => {
          setMomentum(prev => {
            const newMomentum = Math.max(0, prev - 10);
            onMomentumChange?.(newMomentum);
            return newMomentum;
          });
        }, 200);
      }
      
      // Signal recovery during idle
      const recoveryInterval = setInterval(() => {
        onSignalChange?.(2); // +2% signal per interval
      }, 500);

      return () => {
        clearInterval(recoveryInterval);
        if (momentumInterval) clearInterval(momentumInterval);
      };
    } else if (locomotionState === 'slide') {
      // Slide: locked momentum that decays
      momentumInterval = setInterval(() => {
        setMomentum(prev => {
          const newMomentum = Math.max(30, prev - 3);
          onMomentumChange?.(newMomentum);
          return newMomentum;
        });
      }, 150);

      // Signal drain during slide
      const drainInterval = setInterval(() => {
        onSignalChange?.(-1);
      }, 300);

      return () => {
        clearInterval(momentumInterval);
        clearInterval(drainInterval);
      };
    } else if (locomotionState === 'jump') {
      // Jump: momentum preserved, signal frozen (no change)
    }

    return () => {
      if (momentumInterval) clearInterval(momentumInterval);
    };
  }, [locomotionState, isMoving, momentum, onSignalChange, onMomentumChange, reactiveState]);

  // Action state signal drain (Shoot)
  useEffect(() => {
    if (actionState === 'shoot' && reactiveState !== 'death') {
      const shootDrainInterval = setInterval(() => {
        onSignalChange?.(-1.5); // Signal drain while shooting
      }, 200);

      return () => clearInterval(shootDrainInterval);
    }
  }, [actionState, reactiveState, onSignalChange]);

  // Validate transition
  const canTransition = useCallback((newState: LocomotionState): boolean => {
    // Death prevents all transitions
    if (reactiveState === 'death') return false;
    
    // Can't transition to the same state
    if (locomotionState === newState) return true; // Allow for button highlighting

    // Allowed transitions
    if (locomotionState === 'idle') {
      return newState === 'walk';
    }
    if (locomotionState === 'walk') {
      return ['idle', 'run', 'jump'].includes(newState);
    }
    if (locomotionState === 'run') {
      return ['walk', 'idle', 'jump', 'slide'].includes(newState);
    }
    if (locomotionState === 'jump') {
      // During jump, cannot manually transition (auto-exits only)
      return false;
    }
    if (locomotionState === 'slide') {
      // During slide, cannot manually transition (auto-exits only)
      return false;
    }

    return false;
  }, [locomotionState, reactiveState]);

  // Handle locomotion transitions
  const transitionTo = useCallback((newState: LocomotionState) => {
    if (!canTransition(newState)) {
      console.warn(`Invalid transition: ${locomotionState} → ${newState}`);
      return;
    }

    // Abrupt stop from run causes signal loss
    if (locomotionState === 'run' && newState === 'idle' && momentum > 50) {
      const penalty = Math.floor(momentum / 10);
      onSignalChange?.(-penalty);
    }

    setPreviousLocomotion(locomotionState);
    setLocomotionState(newState);
    setIsMoving(newState !== 'idle');
    
    // Auto-exit for Slide (fixed duration)
    if (newState === 'slide') {
      setTimeout(() => {
        setLocomotionState('walk');
        setIsMoving(true);
      }, 1200); // Slide duration: 1.2 seconds
    }
    
    // Auto-exit for Jump (returns based on momentum)
    if (newState === 'jump') {
      setTimeout(() => {
        // Return to Walk or Run based on current momentum
        const currentMomentum = momentum;
        if (currentMomentum > 50) {
          setLocomotionState('run');
        } else {
          setLocomotionState('walk');
        }
        setIsMoving(true);
      }, 800); // Jump duration: 0.8 seconds
    }
  }, [locomotionState, momentum, onSignalChange, canTransition]);

  // Handle action layer
  const triggerAction = useCallback((action: ActionState) => {
    // Cannot shoot during reactive states
    if (reactiveState) return;
    
    // Can only shoot during walk, run, jump, slide
    if (['walk', 'run', 'jump', 'slide'].includes(locomotionState)) {
      setActionState(action);
      
      // Auto-clear shoot after duration
      if (action === 'shoot') {
        setTimeout(() => setActionState(null), 300); // 300ms shoot duration
      }
    }
  }, [locomotionState, reactiveState]);

  // Handle reactive layer
  const triggerReactive = useCallback((reactive: ReactiveState) => {
    setReactiveState(reactive);

    if (reactive === 'hurt1') {
      // Light damage: reduce momentum, small signal penalty
      setMomentum(prev => Math.max(0, prev - 20));
      onSignalChange?.(-5);
      onMomentumChange?.(Math.max(0, momentum - 20));

      // Return to Walk after interrupt
      setTimeout(() => {
        setReactiveState(null);
        setLocomotionState('walk');
        setIsMoving(true);
      }, 400);
    } else if (reactive === 'hurt2') {
      // Heavy damage: reset to low momentum, large signal penalty
      setMomentum(30);
      onMomentumChange?.(30);
      onSignalChange?.(-15);

      // Force to Idle after interrupt
      setTimeout(() => {
        setReactiveState(null);
        setLocomotionState('idle');
        setIsMoving(false);
      }, 700);
    } else if (reactive === 'death') {
      // Terminal: freeze all systems
      setMomentum(0);
      setActionState(null);
      setIsMoving(false);
      // Death persists (no timeout)
    }
  }, [locomotionState, momentum, onSignalChange, onMomentumChange]);

  return {
    // State layers
    locomotionState,
    actionState,
    reactiveState,
    
    // Metadata
    frame,
    momentum,
    momentumTier: getMomentumTier(),
    
    // Actions
    transitionTo,
    triggerAction,
    triggerReactive,
    canTransition,
    
    CharacterSprite: () => {
      // Reactive states override display
      if (reactiveState === 'death') {
        return (
          <div 
            style={{
              width: "160px",
              height: "128px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto"
            }}
          >
            <img 
              src={deathGif}
              alt="Death"
              className="block"
              style={{
                imageRendering: "pixelated",
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto"
              }}
            />
          </div>
        );
      }
      if (reactiveState === 'hurt1') {
        return (
          <div 
            style={{
              width: "160px",
              height: "128px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto"
            }}
          >
            <img 
              src={hurt1Gif}
              alt="Hurt 1"
              className="block"
              style={{
                imageRendering: "pixelated",
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto"
              }}
            />
          </div>
        );
      }
      if (reactiveState === 'hurt2') {
        return (
          <div 
            style={{
              width: "160px",
              height: "128px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto"
            }}
          >
            <img 
              src={hurt2Gif}
              alt="Hurt 2"
              className="block"
              style={{
                imageRendering: "pixelated",
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto"
              }}
            />
          </div>
        );
      }

      // Locomotion display with consistent styling
      const gifStyle = {
        imageRendering: "pixelated" as const,
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "auto"
      };

      const containerStyle = {
        width: "160px",
        height: "128px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        margin: "0 auto"
      };

      if (locomotionState === 'idle') {
        return (
          <div style={containerStyle}>
            <img src={idleGif} alt="Idle" className="block" style={gifStyle} />
          </div>
        );
      } else if (locomotionState === 'walk') {
        return (
          <div style={containerStyle}>
            <img src={walkGif} alt="Walk" className="block" style={gifStyle} />
          </div>
        );
      } else if (locomotionState === 'run') {
        return (
          <div style={containerStyle}>
            <img src={runGif} alt="Run" className="block" style={gifStyle} />
          </div>
        );
      } else if (locomotionState === 'jump') {
        return (
          <div style={{...containerStyle, alignItems: "center"}}>
            <img src={jumpGif} alt="Jump" className="block" style={gifStyle} />
          </div>
        );
      } else if (locomotionState === 'slide') {
        return (
          <div style={{...containerStyle, alignItems: "center"}}>
            <img src={slideGif} alt="Slide" className="block" style={gifStyle} />
          </div>
        );
      }
      
      return null;
    }
  };
}

// Standalone character display with controls
export function LocomotionDemo() {
  const [signalIntegrity, setSignalIntegrity] = useState(100);
  const [currentMomentum, setCurrentMomentum] = useState(0);

  const handleSignalChange = useCallback((delta: number) => {
    setSignalIntegrity(prev => Math.max(0, Math.min(100, prev + delta)));
  }, []);

  const handleMomentumChange = useCallback((value: number) => {
    setCurrentMomentum(value);
  }, []);

  const locomotion = useStateSystem({ 
    onSignalChange: handleSignalChange,
    onMomentumChange: handleMomentumChange
  });

  return (
    <div className="w-full">
      {/* Character Display */}
      <div className="mb-6 p-8 border border-gray-800 bg-[#0F0F0F] rounded-sm flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <locomotion.CharacterSprite />
          
          {/* Action State Indicator */}
          {locomotion.actionState && (
            <div className="mt-3 text-xs text-yellow-500 font-['Cambay',sans-serif] border border-yellow-900 rounded px-3 py-1 inline-block">
              [Shooting - Action Layer Active]
            </div>
          )}
        </div>
      </div>

      {/* State Info - Enhanced with Layers */}
      <div className="mb-6 p-4 border border-gray-800 bg-[#1A1A1A] rounded-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-['Cambay',sans-serif]">
          <div>
            <div className="text-gray-500 mb-1">Locomotion Layer</div>
            <div className="text-gray-300 uppercase">{locomotion.locomotionState}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Action Layer</div>
            <div className="text-gray-300">{locomotion.actionState || 'None'}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Reactive Layer</div>
            <div className={locomotion.reactiveState ? 'text-red-400' : 'text-gray-300'}>
              {locomotion.reactiveState || 'None'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Momentum ({locomotion.momentumTier})</div>
            <div className="text-gray-300 tabular-nums">{locomotion.momentum}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Signal</div>
            <div className="text-gray-300 tabular-nums">{signalIntegrity}%</div>
          </div>
        </div>
      </div>

      {/* Locomotion Controls */}
      <div className="p-4 border border-gray-800 bg-[#1A1A1A] rounded-sm mb-4">
        <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-3">Locomotion Layer (Exclusive)</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => locomotion.transitionTo('idle')}
            disabled={!locomotion.canTransition('idle')}
            className={`px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
              locomotion.locomotionState === 'idle' 
                ? 'bg-gray-700 text-white' 
                : locomotion.canTransition('idle')
                ? 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                : 'bg-gray-950 text-gray-700 cursor-not-allowed'
            }`}
          >
            Idle
          </button>
          <button
            onClick={() => locomotion.transitionTo('walk')}
            disabled={!locomotion.canTransition('walk')}
            className={`px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
              locomotion.locomotionState === 'walk' 
                ? 'bg-gray-700 text-white' 
                : locomotion.canTransition('walk')
                ? 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                : 'bg-gray-950 text-gray-700 cursor-not-allowed'
            }`}
          >
            Walk
          </button>
          <button
            onClick={() => locomotion.transitionTo('run')}
            disabled={!locomotion.canTransition('run')}
            className={`px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
              locomotion.locomotionState === 'run' 
                ? 'bg-gray-700 text-white' 
                : locomotion.canTransition('run')
                ? 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                : 'bg-gray-950 text-gray-700 cursor-not-allowed'
            }`}
          >
            Run
          </button>
          <button
            onClick={() => locomotion.transitionTo('jump')}
            disabled={!locomotion.canTransition('jump')}
            className={`px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
              locomotion.locomotionState === 'jump' 
                ? 'bg-gray-700 text-white' 
                : locomotion.canTransition('jump')
                ? 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                : 'bg-gray-950 text-gray-700 cursor-not-allowed'
            }`}
          >
            Jump
          </button>
          <button
            onClick={() => locomotion.transitionTo('slide')}
            disabled={!locomotion.canTransition('slide')}
            className={`px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
              locomotion.locomotionState === 'slide' 
                ? 'bg-gray-700 text-white' 
                : locomotion.canTransition('slide')
                ? 'bg-gray-900 text-gray-500 hover:bg-gray-800'
                : 'bg-gray-950 text-gray-700 cursor-not-allowed'
            }`}
          >
            Slide
          </button>
        </div>
      </div>

      {/* Action Layer Controls */}
      <div className="p-4 border border-gray-800 bg-[#1A1A1A] rounded-sm mb-4">
        <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-3">Action Layer (Overlay)</div>
        <div className="flex gap-2">
          <button
            onClick={() => locomotion.triggerAction('shoot')}
            disabled={locomotion.reactiveState !== null || !['walk', 'run', 'jump', 'slide'].includes(locomotion.locomotionState)}
            className="px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors bg-yellow-900 text-yellow-300 hover:bg-yellow-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            Shoot
          </button>
          <div className="text-xs text-gray-600 font-['Cambay',sans-serif] flex items-center ml-2">
            Available during: Walk, Run, Jump, Slide
          </div>
        </div>
      </div>

      {/* Reactive Layer Controls */}
      <div className="p-4 border border-gray-800 bg-[#1A1A1A] rounded-sm mb-4">
        <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-3">Reactive Layer (Interrupting)</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => locomotion.triggerReactive('hurt1')}
            disabled={locomotion.reactiveState !== null}
            className="px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors bg-red-900 text-red-300 hover:bg-red-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            Hurt 1 (Light)
          </button>
          <button
            onClick={() => locomotion.triggerReactive('hurt2')}
            disabled={locomotion.reactiveState !== null}
            className="px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors bg-red-900 text-red-300 hover:bg-red-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            Hurt 2 (Heavy)
          </button>
          <button
            onClick={() => locomotion.triggerReactive('death')}
            disabled={locomotion.reactiveState === 'death'}
            className="px-4 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors bg-gray-900 text-gray-400 hover:bg-gray-800 disabled:bg-gray-950 disabled:text-gray-700 disabled:cursor-not-allowed"
          >
            Death (Terminal)
          </button>
        </div>
      </div>

      {/* State Behaviors */}
      <div className="mt-6 p-4 border border-gray-800 bg-[#0F0F0F] rounded-sm">
        <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-3">Current Behavior</div>
        <div className="text-xs text-gray-600 font-['Cambay',sans-serif] leading-relaxed">
          {locomotion.locomotionState === 'idle' && (
            <>
              <strong className="text-gray-500">Idle:</strong> Default state. Gun-down posture. 
              Enables signal recovery (+2% per 0.5s). Momentum decays.
            </>
          )}
          {locomotion.locomotionState === 'walk' && (
            <>
              <strong className="text-gray-500">Walk:</strong> Gun-up posture. Low momentum (30). 
              No signal penalty. Immediate transition from idle.
            </>
          )}
          {locomotion.locomotionState === 'run' && (
            <>
              <strong className="text-gray-500">Run:</strong> Gun-up posture. Momentum builds over time (max 100). 
              Abrupt stop to idle causes signal loss based on momentum.
            </>
          )}
          {locomotion.locomotionState === 'jump' && (
            <>
              <strong className="text-gray-500">Jump:</strong> Gun-up posture. Momentum preserved from entry state. 
              Signal frozen during jump. Entry from Walk or Run only.
            </>
          )}
          {locomotion.locomotionState === 'slide' && (
            <>
              <strong className="text-gray-500">Slide:</strong> Gun-up posture. Locked momentum that decays. 
              Signal drains during slide. Entry from Run only.
            </>
          )}
        </div>
      </div>
    </div>
  );
}