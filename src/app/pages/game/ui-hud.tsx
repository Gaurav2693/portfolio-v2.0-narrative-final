import { useState } from 'react';
import { 
  HUDContainer,
  SignalIntegrityBar,
  MomentumIndicator,
  ContactStateIndicator,
  HazardProximityIndicator
} from '@/app/components/game/hud-components';

export default function UIHud() {
  // Demo state controls
  const [mode, setMode] = useState<'clean' | 'diagnostic'>('clean');
  const [signalIntegrity, setSignalIntegrity] = useState(100);
  const [momentum, setMomentum] = useState(0);
  const [isGrounded, setIsGrounded] = useState(true);
  const [hazardProximity, setHazardProximity] = useState({ isVisible: false, distance: 100 });
  const [landingFeedback, setLandingFeedback] = useState<'none' | 'perfect' | 'hard'>('none');

  // Simulate landing feedback
  const triggerLanding = (type: 'perfect' | 'hard') => {
    setLandingFeedback(type);
    setTimeout(() => setLandingFeedback('none'), 800);
    
    if (type === 'perfect') {
      setSignalIntegrity(prev => Math.min(100, prev + 5));
    } else {
      setSignalIntegrity(prev => Math.max(0, prev - 10));
    }
  };

  const hudStates = [
    {
      id: 1,
      name: 'Signal Integrity',
      description: 'Primary health metaphor',
      position: 'Top-left',
      behavior: 'Decreases on hazard contact, poor landings, panic movement. Recovers during calm play.',
      Component: () => (
        <SignalIntegrityBar value={signalIntegrity} isLow={signalIntegrity < 30} />
      ),
    },
    {
      id: 2,
      name: 'Momentum',
      description: 'Velocity indicator',
      position: 'Bottom-left',
      behavior: 'Shows during movement. Helps judge landing safety and timing.',
      Component: () => <MomentumIndicator velocity={momentum} />,
    },
    {
      id: 3,
      name: 'Contact State',
      description: 'Grounded vs airborne',
      position: 'Bottom-right',
      behavior: 'Confirms player state. Small dot indicator.',
      Component: () => <ContactStateIndicator isGrounded={isGrounded} />,
    },
    {
      id: 4,
      name: 'Hazard Proximity',
      description: 'Contextual warning',
      position: 'Bottom-right',
      behavior: 'Appears only when near active hazards. Fades based on distance.',
      Component: () => (
        <HazardProximityIndicator 
          isVisible={hazardProximity.isVisible} 
          distance={hazardProximity.distance} 
        />
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">UI / HUD</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Player feedback system — Restrained and contextual
        </p>
      </div>

      {/* HUD Philosophy */}
      <div className="mb-8 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-3xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-3">HUD Philosophy</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-2">
          <p>
            <strong className="text-gray-400">Communicate state clearly</strong> — 
            Players understand their status without interpretation lag.
          </p>
          <p>
            <strong className="text-gray-400">Stay visually restrained</strong> — 
            No screen clutter, no flashing warnings, no arcade effects.
          </p>
          <p>
            <strong className="text-gray-400">Never distract from gameplay</strong> — 
            HUD fades into background during play, activates only when relevant.
          </p>
          <p>
            <strong className="text-gray-400">Scale to additional systems</strong> — 
            Foundation supports future mechanics without redesign.
          </p>
        </div>
      </div>

      {/* Mode Toggle and Live Demo */}
      <div className="mb-12">
        <div className="mb-4 flex items-center gap-4">
          <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300">Live HUD Demo</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('clean')}
              className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
                mode === 'clean' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
              }`}
            >
              Clean Mode
            </button>
            <button
              onClick={() => setMode('diagnostic')}
              className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
                mode === 'diagnostic' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
              }`}
            >
              Diagnostic Mode
            </button>
          </div>
        </div>

        {/* HUD Preview Canvas */}
        <div className="relative w-full h-[500px] border border-gray-800 bg-[#0F0F0F] rounded-sm overflow-hidden">
          {/* Game world placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-700 font-['Cambay',sans-serif]">
              <div className="text-xs mb-4">Game Canvas (HUD overlay shown)</div>
              <div className="text-xs text-gray-800">
                {mode === 'clean' ? 'Clean Mode: Signal Integrity only' : 'Diagnostic Mode: All indicators visible'}
              </div>
            </div>
          </div>

          {/* HUD Overlay */}
          <HUDContainer
            mode={mode}
            signalIntegrity={signalIntegrity}
            momentum={momentum}
            isGrounded={isGrounded}
            hazardProximity={hazardProximity}
            landingFeedback={landingFeedback}
          />
        </div>

        {/* Demo Controls */}
        <div className="mt-4 p-4 border border-gray-800 bg-[#1A1A1A] rounded-sm">
          <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-3">Demo Controls</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Signal Integrity */}
            <div>
              <label className="text-xs text-gray-500 font-['Cambay',sans-serif] block mb-2">
                Signal: {signalIntegrity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={signalIntegrity}
                onChange={(e) => setSignalIntegrity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Momentum */}
            <div>
              <label className="text-xs text-gray-500 font-['Cambay',sans-serif] block mb-2">
                Momentum: {momentum}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={momentum}
                onChange={(e) => setMomentum(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Contact State */}
            <div>
              <label className="text-xs text-gray-500 font-['Cambay',sans-serif] block mb-2">
                Contact State
              </label>
              <button
                onClick={() => setIsGrounded(!isGrounded)}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-['Cambay',sans-serif]"
              >
                Toggle: {isGrounded ? 'Grounded' : 'Airborne'}
              </button>
            </div>

            {/* Hazard Proximity */}
            <div>
              <label className="text-xs text-gray-500 font-['Cambay',sans-serif] block mb-2">
                Hazard Proximity
              </label>
              <button
                onClick={() => setHazardProximity(prev => ({ 
                  isVisible: !prev.isVisible, 
                  distance: 50 
                }))}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-['Cambay',sans-serif]"
              >
                Toggle Warning
              </button>
            </div>

            {/* Landing Feedback */}
            <div className="flex gap-2">
              <button
                onClick={() => triggerLanding('perfect')}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-['Cambay',sans-serif]"
              >
                Perfect Landing
              </button>
              <button
                onClick={() => triggerLanding('hard')}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs font-['Cambay',sans-serif]"
              >
                Hard Landing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HUD State Components */}
      <div className="mb-12">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">HUD Components</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hudStates.map((state) => (
            <div
              key={state.name}
              className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-['Cambay',sans-serif]">{state.name}</h3>
                  <span className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                    {state.position}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  {state.description}
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F]">
                <state.Component />
              </div>

              <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-gray-600 font-['Cambay',sans-serif] leading-relaxed">
                  {state.behavior}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUD Modes Explanation */}
      <div className="mb-12 max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Two HUD Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clean Mode */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Clean Mode</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-2 leading-relaxed">
              <p><strong className="text-gray-500">Purpose:</strong> Portfolio showcase presentation</p>
              <p><strong className="text-gray-500">Shows:</strong> Signal Integrity only</p>
              <p><strong className="text-gray-500">Philosophy:</strong> Minimal distraction, maximum clarity</p>
              <p><strong className="text-gray-500">Use case:</strong> Final player experience</p>
            </div>
          </div>

          {/* Diagnostic Mode */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Diagnostic Mode</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-2 leading-relaxed">
              <p><strong className="text-gray-500">Purpose:</strong> Systems thinking demonstration</p>
              <p><strong className="text-gray-500">Shows:</strong> All state indicators + context warnings</p>
              <p><strong className="text-gray-500">Philosophy:</strong> Transparency for design review</p>
              <p><strong className="text-gray-500">Use case:</strong> Interview portfolio walk-through</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Integrity System */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Signal Integrity System</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <p>
            <strong className="text-gray-400">Core health metaphor:</strong> Signal Integrity represents player viability.
            Not "hit points" — a signal that degrades under stress and recovers during calm play.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-400 mb-2">Decreases on:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Hazard contact</li>
                <li>• Poor landings (high velocity)</li>
                <li>• Repeated panic movement</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Recovers slowly during:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Calm movement</li>
                <li>• Standing still</li>
                <li>• Successful timing sequences</li>
              </ul>
            </div>
          </div>
          <p className="mt-4">
            <strong className="text-gray-400">Visual behavior:</strong> Subtle pulse when low. 
            No flashing red panic effects. Clear but calm degradation.
          </p>
        </div>
      </div>

      {/* Physics Feedback */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Physics Feedback</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-2">
          <div><strong className="text-gray-400">Grounded:</strong> Small confirmation indicator (dot)</div>
          <div><strong className="text-gray-400">Airborne:</strong> Momentum indicator activates</div>
          <div><strong className="text-gray-400">Hard landing:</strong> Brief center feedback + signal dip</div>
          <div><strong className="text-gray-400">Perfect landing:</strong> Micro reward (+5% signal gain)</div>
        </div>
        <p className="text-xs text-gray-600 font-['Cambay',sans-serif] mt-4">
          NO arcade effects. NO screen shake beyond micro-feedback. Clarity over spectacle.
        </p>
      </div>

      {/* Design Notes */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">What Each Indicator Teaches</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <div>
            <strong className="text-gray-400">Signal Integrity:</strong> Teaches consequence awareness. 
            Players learn to avoid hazards not through instant death, but through signal degradation.
          </div>
          <div>
            <strong className="text-gray-400">Momentum:</strong> Teaches landing judgment. 
            Players see velocity before impact, learning to control descent.
          </div>
          <div>
            <strong className="text-gray-400">Contact State:</strong> Teaches state awareness. 
            Confirms grounded vs airborne without guessing.
          </div>
          <div>
            <strong className="text-gray-400">Hazard Proximity:</strong> Teaches observation over reaction. 
            Warning appears before danger, rewarding preparation.
          </div>
        </div>
      </div>

      {/* Why Clutter is Avoided */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Why Clutter is Intentionally Avoided</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-2">
          <p>
            This game is about <strong className="text-gray-400">precision, not information overload</strong>. 
            Every HUD element must earn its screen space.
          </p>
          <p>
            <strong className="text-gray-400">No score counters:</strong> The goal is completion, not points.
          </p>
          <p>
            <strong className="text-gray-400">No lives system:</strong> Signal Integrity is continuous, not discrete.
          </p>
          <p>
            <strong className="text-gray-400">No timers:</strong> Precision matters more than speed.
          </p>
          <p>
            <strong className="text-gray-400">No minimap:</strong> World is authored and learnable, not randomized.
          </p>
          <p className="mt-4">
            The player should focus on <strong className="text-gray-400">the world, not the interface</strong>.
          </p>
        </div>
      </div>

      {/* Scalability */}
      <div className="max-w-4xl p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">How the HUD Scales to More Systems</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <p>
            The HUD layout reserves space for future mechanics without cluttering current experience:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-gray-400 mb-2">Potential additions (top-left):</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Secondary resource bar</li>
                <li>• Ability cooldowns</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Potential additions (bottom):</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Equipment state</li>
                <li>• Environmental conditions</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Potential additions (context):</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Interaction prompts</li>
                <li>• Objective markers</li>
              </ul>
            </div>
          </div>
          <p className="mt-4">
            <strong className="text-gray-400">Design principle:</strong> Start minimal, add only when necessary.
            Every new element must pass the "does this reduce friction?" test.
          </p>
        </div>
      </div>
    </div>
  );
}
