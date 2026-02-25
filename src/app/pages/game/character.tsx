import { LocomotionDemo } from '@/app/components/game/locomotion-system';

import idleGif from "figma:asset/5ebd7a3b00419310625953cf85699753d48e657c.png";
import walkGif from "figma:asset/ccdf127dde2b965a914fee2bf5b6d2a3cd9b3bfa.png";
import runGif from "figma:asset/48dc3f24ed04f9a0b485d7c438ad9dffc0283857.png";
import slideGif from "figma:asset/f8643f3befad3a7ccd72f6980bd62fcdbe46c1a8.png";
import jumpGif from "figma:asset/8dae146f258ffc9c969710d371e398e260d43fd4.png";
import hurt1Gif from "figma:asset/f4e5dde789dd65271b5628df821f165172784339.png";
import hurt2Gif from "figma:asset/795eb6926734d295eb166d79372357b1ad87f107.png";
import shootGif from "figma:asset/c39268ffdd2e29bc37f4e9ea623e9d6603eda440.png";
import deathGif from "figma:asset/dc25c06ba1bd6f70d9dd1fd93ff62070bb90d0d4.png";

export default function Character() {
  // Locomotion Layer States (Exclusive)
  const locomotionStates = [
    {
      name: 'Idle',
      layer: 'Locomotion',
      description: 'Gun-down posture • Default state',
      Component: () => (
        <div 
          style={{
            width: "160px",
            height: "128px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            margin: "0 auto"
          }}
        >
          <img 
            src={idleGif}
            alt="Character Idle"
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
      ),
      behavior: [
        'Gun-down posture (not engaged)',
        'Momentum: 0 (None tier)',
        'Signal: Recovers +2% per 0.5s',
        'Entry: From any state via deceleration'
      ]
    },
    {
      name: 'Walk',
      layer: 'Locomotion',
      description: 'Gun-up posture • Low momentum',
      Component: () => (
        <div 
          style={{
            width: "160px",
            height: "128px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            margin: "0 auto"
          }}
        >
          <img 
            src={walkGif}
            alt="Character Walk"
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
      ),
      behavior: [
        'Gun-up posture (ready)',
        'Momentum: 30 (Low tier)',
        'Signal: Stable (no change)',
        'Entry: From Idle, Run, Jump, Slide'
      ]
    },
    {
      name: 'Run',
      layer: 'Locomotion',
      description: 'Gun-up posture • High momentum',
      Component: () => (
        <div 
          style={{
            width: "160px",
            height: "128px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            margin: "0 auto"
          }}
        >
          <img 
            src={runGif}
            alt="Character Run"
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
      ),
      behavior: [
        'Gun-up posture maintained',
        'Momentum: Builds to 100 (High tier)',
        'Signal: Slow drain',
        'Entry: From Walk, Jump, Slide'
      ]
    },
    {
      name: 'Jump',
      layer: 'Locomotion',
      description: 'Gun-up posture • Airborne',
      Component: () => (
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
            src={jumpGif}
            alt="Character Jump"
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
      ),
      behavior: [
        'Gun-up posture in air',
        'Momentum: Preserved from entry',
        'Signal: Frozen (no change)',
        'Entry: From Walk or Run only'
      ]
    },
    {
      name: 'Slide',
      layer: 'Locomotion',
      description: 'Gun-up posture • Skill-based',
      Component: () => (
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
            src={slideGif}
            alt="Character Slide"
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
      ),
      behavior: [
        'Gun-up posture low to ground',
        'Momentum: Locked, decaying',
        'Signal: Active drain',
        'Entry: From Run only (skill move)'
      ]
    }
  ];

  // Action Layer States (Overlay)
  const actionStates = [
    {
      name: 'Shoot',
      layer: 'Action',
      description: 'Overlay state • Does not replace locomotion',
      Component: () => (
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
            src={shootGif}
            alt="Character Shoot"
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
      ),
      behavior: [
        'Can occur during Walk, Run, Jump, Slide',
        'Does NOT replace locomotion state',
        'Signal: Increased drain while active',
        'Disabled during Hurt or Death states'
      ]
    }
  ];

  // Reactive Layer States (Interrupting)
  const reactiveStates = [
    {
      name: 'Hurt 1',
      layer: 'Reactive',
      description: 'Light damage • Short interrupt',
      Component: () => (
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
            alt="Light Damage"
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
      ),
      behavior: [
        'Short interrupt (400ms)',
        'Momentum: Reduced by 20',
        'Signal: -5% penalty',
        'Exit: Returns to Walk'
      ]
    },
    {
      name: 'Hurt 2',
      layer: 'Reactive',
      description: 'Heavy damage • Long interrupt',
      Component: () => (
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
            alt="Heavy Damage"
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
      ),
      behavior: [
        'Longer interrupt (700ms)',
        'Momentum: Reset to 30',
        'Signal: -15% penalty',
        'Exit: Forced to Walk or Idle'
      ]
    },
    {
      name: 'Death',
      layer: 'Reactive',
      description: 'Terminal state • No exits',
      Component: () => (
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
            alt="Death State"
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
      ),
      behavior: [
        'Terminal state (no recovery)',
        'Momentum: Frozen at 0',
        'Signal: Frozen',
        'Disables all input and transitions'
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Character</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Extended state machine with locomotion, action, and reactive layers
        </p>
      </div>

      {/* State Layering Model */}
      <div className="mb-8 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-3">State Layering Model</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <div>
            <strong className="text-gray-400">Locomotion Layer (Exclusive):</strong> Only one active at a time. 
            Controls movement type and posture. States: Idle, Walk, Run, Jump, Slide.
          </div>
          <div>
            <strong className="text-gray-400">Action Layer (Overlay):</strong> Can coexist with locomotion states. 
            Does not replace locomotion. States: Shoot (overlays Walk/Run/Jump/Slide).
          </div>
          <div>
            <strong className="text-gray-400">Reactive Layer (Interrupting):</strong> Temporarily or permanently 
            interrupts all other layers. States: Hurt 1, Hurt 2, Death (terminal).
          </div>
        </div>
      </div>

      {/* Interactive Locomotion Demo */}
      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-2">Interactive Locomotion System</h2>
          <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
            Test state transitions and observe signal/momentum behavior
          </p>
        </div>
        <div className="border border-gray-800 bg-[#1A1A1A] rounded-sm p-6">
          <LocomotionDemo />
        </div>
      </div>

      {/* Locomotion States Breakdown */}
      <div className="mb-12">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Locomotion States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {locomotionStates.map((state) => (
            <div
              key={state.name}
              className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
                <h3 className="text-sm font-['Cambay',sans-serif] mb-1">{state.name}</h3>
                <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  {state.description}
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F] flex items-center justify-center min-h-[180px]">
                <state.Component />
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-2">Behavior:</div>
                <ul className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
                  {state.behavior.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action States Breakdown */}
      <div className="mb-12">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Action States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {actionStates.map((state) => (
            <div
              key={state.name}
              className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
                <h3 className="text-sm font-['Cambay',sans-serif] mb-1">{state.name}</h3>
                <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  {state.description}
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F] flex items-center justify-center min-h-[180px]">
                <state.Component />
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-2">Behavior:</div>
                <ul className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
                  {state.behavior.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reactive States Breakdown */}
      <div className="mb-12">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Reactive States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reactiveStates.map((state) => (
            <div
              key={state.name}
              className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
                <h3 className="text-sm font-['Cambay',sans-serif] mb-1">{state.name}</h3>
                <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  {state.description}
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F] flex items-center justify-center min-h-[180px]">
                <state.Component />
              </div>

              <div className="p-4 border-t border-gray-800">
                <div className="text-xs text-gray-400 font-['Cambay',sans-serif] mb-2">Behavior:</div>
                <ul className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
                  {state.behavior.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Transition Rules */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Locomotion Transition Rules</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <div>
            <strong className="text-gray-400">Idle ↔ Walk:</strong> Immediate bidirectional transition. 
            Gun raises on entry, lowers on exit. No signal cost either direction.
          </div>
          <div>
            <strong className="text-gray-400">Walk ↔ Run:</strong> Smooth acceleration/deceleration. 
            Momentum builds 30→100 or drops 100→30. No penalties for controlled transitions.
          </div>
          <div>
            <strong className="text-gray-400">Walk/Run → Jump:</strong> Entry from Walk or Run only. 
            Momentum preserved during jump. Returns to Walk or Run based on momentum on landing.
          </div>
          <div>
            <strong className="text-gray-400">Run → Slide:</strong> Entry from Run only (skill-based). 
            Momentum locked and decaying. Exit to Walk or Run when slide ends.
          </div>
          <div>
            <strong className="text-gray-400">Run → Idle (Abrupt):</strong> If momentum {"\u003E"} 50, 
            signal penalty = momentum / 10. Teaches controlled deceleration via Walk state.
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <strong className="text-gray-400">Forbidden Transitions:</strong> Idle→Jump, Idle→Slide, 
            Walk→Slide. These enforce momentum-based state gating.
          </div>
        </div>
      </div>

      {/* Momentum Tiers */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Momentum Tiers & State Gating</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <div>
            <strong className="text-gray-400">None (0):</strong> Idle state only. 
            No movement, signal recovery active.
          </div>
          <div>
            <strong className="text-gray-400">Low (30):</strong> Walk state. 
            Controlled movement, stable signal, can transition to Run or Jump.
          </div>
          <div>
            <strong className="text-gray-400">High (31-100):</strong> Run state. 
            Fast movement, momentum builds over time, enables Slide and Jump.
          </div>
          <div>
            <strong className="text-gray-400">Locked:</strong> Slide state only. 
            Momentum frozen but decaying, cannot be changed during slide.
          </div>
          <div>
            <strong className="text-gray-400">Preserved:</strong> Jump state only. 
            Momentum from entry state maintained during airborne phase.
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <strong className="text-gray-400">Design Intent:</strong> Momentum tier determines which states 
            are accessible. Prevents instant high-momentum states without buildup.
          </div>
        </div>
      </div>

      {/* Signal and Momentum Integration */}
      <div className="mb-12 max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Signal & Momentum Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signal Behavior */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Signal Integrity</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-2 leading-relaxed">
              <div><strong className="text-gray-500">During Idle:</strong> Recovers +2% per 0.5s</div>
              <div><strong className="text-gray-500">During Walk:</strong> No change (neutral)</div>
              <div><strong className="text-gray-500">During Run:</strong> No passive change</div>
              <div><strong className="text-gray-500">On Abrupt Stop:</strong> -penalty if momentum {">"} 50</div>
            </div>
          </div>

          {/* Momentum Behavior */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Momentum System</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-2 leading-relaxed">
              <div><strong className="text-gray-500">During Idle:</strong> Decays -10 per 0.2s to zero</div>
              <div><strong className="text-gray-500">During Walk:</strong> Maintains steady 30</div>
              <div><strong className="text-gray-500">During Run:</strong> Builds +5 per 0.2s (max 100)</div>
              <div><strong className="text-gray-500">Purpose:</strong> Affects landing impact, stop penalty</div>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Alignment */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Sprite Preservation</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-2">
          <p>
            <strong className="text-gray-400">No rescaling:</strong> Sprites used at original dimensions. 
            Pixel-perfect rendering maintained with imageRendering: pixelated.
          </p>
          <p>
            <strong className="text-gray-400">Baseline alignment:</strong> All frames share common ground baseline. 
            No vertical drift during animation.
          </p>
          <p>
            <strong className="text-gray-400">Frame timing:</strong> Walk = 120ms per frame (~8 FPS), 
            Run = 80ms per frame (~12 FPS). Idle is static.
          </p>
        </div>
      </div>

      {/* What's Not Included */}
      <div className="max-w-3xl p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">State Machine Summary</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] space-y-3">
          <div>
            <strong className="text-gray-400">Completed:</strong> 5 locomotion states (Idle, Walk, Run, Jump, Slide), 
            1 action state (Shoot), 3 reactive states (Hurt 1, Hurt 2, Death). 
            State layering model with exclusive, overlay, and interrupting behaviors.
          </div>
          <div>
            <strong className="text-gray-400">Deferred (Intentional):</strong> Crouch, sprint, reload, melee, combo states. 
            These were excluded to maintain a minimal, focused state set.
          </div>
          <div>
            <strong className="text-gray-400">Next Phase:</strong> Animations for Jump, Slide, Shoot, Hurt, Death. 
            This phase focused on logic, rules, and structure only.
          </div>
        </div>
        <p className="text-xs text-gray-600 font-['Cambay',sans-serif] mt-4">
          This is a production-ready vertical slice state machine that can scale to a full shooter.
        </p>
      </div>
    </div>
  );
}