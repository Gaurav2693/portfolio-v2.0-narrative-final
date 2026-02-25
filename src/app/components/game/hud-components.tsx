import { useState, useEffect } from 'react';

// HUD / Signal Integrity Bar
// Primary health metaphor - decreases on damage, recovers during calm play
export function SignalIntegrityBar({ 
  value = 100, 
  isLow = false 
}: { 
  value?: number; 
  isLow?: boolean;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isLow) {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isLow]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] text-gray-500 font-['Cambay',sans-serif] uppercase tracking-wider">
        Signal
      </div>
      <div className="w-[160px] h-[3px] bg-[#1A1A1A] rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isLow 
              ? pulse ? 'bg-gray-500' : 'bg-gray-600'
              : 'bg-gray-300'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-[8px] text-gray-600 font-['Cambay',sans-serif] tabular-nums">
        {value}%
      </div>
    </div>
  );
}

// HUD / Momentum Indicator
// Shows player velocity/momentum during movement
export function MomentumIndicator({ 
  velocity = 0 
}: { 
  velocity?: number;
}) {
  const normalizedVelocity = Math.min(Math.abs(velocity), 100);
  
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] text-gray-500 font-['Cambay',sans-serif] uppercase tracking-wider">
        Momentum
      </div>
      <div className="flex items-center gap-2">
        <div className="w-[80px] h-[2px] bg-[#1A1A1A] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-400 transition-all duration-150"
            style={{ width: `${normalizedVelocity}%` }}
          />
        </div>
        <div className="text-[8px] text-gray-600 font-['Cambay',sans-serif] tabular-nums w-[24px]">
          {Math.round(velocity)}
        </div>
      </div>
    </div>
  );
}

// HUD / Contact State Indicator
// Shows grounded vs airborne state
export function ContactStateIndicator({ 
  isGrounded = true 
}: { 
  isGrounded?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-[6px] h-[6px] rounded-full transition-all duration-200 ${
          isGrounded 
            ? 'bg-gray-400' 
            : 'bg-gray-600'
        }`}
      />
      <div className="text-[9px] text-gray-500 font-['Cambay',sans-serif] uppercase tracking-wider">
        {isGrounded ? 'Grounded' : 'Airborne'}
      </div>
    </div>
  );
}

// HUD / Hazard Proximity Indicator
// Appears only when near active hazards
export function HazardProximityIndicator({ 
  isVisible = false,
  distance = 100
}: { 
  isVisible?: boolean;
  distance?: number;
}) {
  if (!isVisible) return null;

  const opacity = Math.max(0, Math.min(1, (100 - distance) / 100));

  return (
    <div 
      className="flex items-center gap-2 transition-opacity duration-300"
      style={{ opacity }}
    >
      <div className="w-[8px] h-[8px] border border-gray-500 rounded-sm animate-pulse" />
      <div className="text-[9px] text-gray-500 font-['Cambay',sans-serif] uppercase tracking-wider">
        Hazard Active
      </div>
    </div>
  );
}

// HUD / Landing Feedback
// Brief visual feedback for landing quality
export function LandingFeedback({ 
  type = 'none' 
}: { 
  type?: 'none' | 'perfect' | 'hard';
}) {
  if (type === 'none') return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div 
        className={`text-[10px] font-['Cambay',sans-serif] uppercase tracking-wider animate-pulse ${
          type === 'perfect' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {type === 'perfect' ? '+Signal' : 'Impact'}
      </div>
    </div>
  );
}

// HUD / Main Container
// Manages clean vs diagnostic mode
export function HUDContainer({ 
  mode = 'clean',
  signalIntegrity = 100,
  momentum = 0,
  isGrounded = true,
  hazardProximity = { isVisible: false, distance: 100 },
  landingFeedback = 'none'
}: {
  mode?: 'clean' | 'diagnostic';
  signalIntegrity?: number;
  momentum?: number;
  isGrounded?: boolean;
  hazardProximity?: { isVisible: boolean; distance: number };
  landingFeedback?: 'none' | 'perfect' | 'hard';
}) {
  const isLowSignal = signalIntegrity < 30;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top-left: Signal Integrity (always visible) */}
      <div className="absolute top-6 left-6">
        <SignalIntegrityBar value={signalIntegrity} isLow={isLowSignal} />
      </div>

      {/* Bottom-left: Momentum (diagnostic mode only) */}
      {mode === 'diagnostic' && (
        <div className="absolute bottom-6 left-6">
          <MomentumIndicator velocity={momentum} />
        </div>
      )}

      {/* Bottom-right: Context indicators (diagnostic mode only) */}
      {mode === 'diagnostic' && (
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
          <ContactStateIndicator isGrounded={isGrounded} />
          <HazardProximityIndicator 
            isVisible={hazardProximity.isVisible} 
            distance={hazardProximity.distance} 
          />
        </div>
      )}

      {/* Center: Landing feedback (brief, contextual) */}
      <LandingFeedback type={landingFeedback} />
    </div>
  );
}
