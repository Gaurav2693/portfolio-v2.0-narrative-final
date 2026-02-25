import { 
  BackgroundFarElements,
  BackgroundMidElements,
  ForegroundElements,
  PlatformElements,
  HazardElements,
  CollectibleElements
} from '@/app/components/game/environment-components';
import { SegmentAssemblyDemo } from '@/app/components/game/segment-assembly-demo';
import { SegmentFlat, SegmentVertical, SegmentMixed } from '@/app/components/game/segment-templates';

export default function EnvironmentLayers() {
  const layers = [
    { 
      id: 1,
      name: 'Background (Far)', 
      description: 'Large structural silhouettes',
      motion: 'Very slow parallax',
      Component: BackgroundFarElements,
      notes: 'No interaction. Defines world scale.'
    },
    { 
      id: 2,
      name: 'Background (Mid)', 
      description: 'Pipes, frames, conduits',
      motion: 'Subtle parallax + occasional blinking indicators',
      Component: BackgroundMidElements,
      notes: 'Slow flicker allowed on indicators. No player interaction.'
    },
    { 
      id: 3,
      name: 'Foreground', 
      description: 'Rails, grates, broken panels',
      motion: 'Static depth layer',
      Component: ForegroundElements,
      notes: 'Can partially occlude player. Adds depth without blocking gameplay.'
    },
    { 
      id: 4,
      name: 'Interactive Platforms', 
      description: 'Flat platforms and steps',
      motion: 'Static collision surfaces',
      Component: PlatformElements,
      notes: 'Player collision layer. Moderate vertical offsets only (1-2 levels).'
    },
    { 
      id: 5,
      name: 'Hazards', 
      description: 'Mechanical hazards',
      motion: 'Learnable patterns',
      Component: HazardElements,
      notes: 'Must have visible timing. Telegraphed, not random. First encounter teaches behavior.'
    },
    { 
      id: 6,
      name: 'Collectibles', 
      description: 'Data objects',
      motion: 'Subtle pulse allowed',
      Component: CollectibleElements,
      notes: 'Visually distinct from hazards. Accent color permitted here only.'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Environment Layers</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Industrial environment system — Mechanical ruins
        </p>
      </div>

      {/* World Identity */}
      <div className="mb-8 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-3xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-3">World Identity</h2>
        <p className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed mb-3">
          Industrial / Mechanical ruins. Machine space built for function, not beauty.
        </p>
        <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
          <div>• Shafts, platforms, vents, rails, pipes, service corridors</div>
          <div>• No sci-fi fantasy shapes, no cyberpunk neon, no organic terrain</div>
          <div>• World feels subtly alive: slow parallax, gentle flicker, occasional mechanical motion</div>
          <div>• Moderate verticality: 1-2 platform levels, no extreme shafts</div>
        </div>
      </div>

      {/* Layer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden"
          >
            {/* Layer Header */}
            <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-['Cambay',sans-serif]">{layer.name}</h3>
                <span className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                  Layer {layer.id}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-['Cambay',sans-serif] mb-1">
                {layer.description}
              </p>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                {layer.motion}
              </p>
            </div>

            {/* Component Preview */}
            <div className="p-6 bg-[#0F0F0F] flex items-center justify-center min-h-[220px]">
              <layer.Component />
            </div>

            {/* Layer Notes */}
            <div className="p-4 border-t border-gray-800">
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif] leading-relaxed">
                {layer.notes}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Connection System */}
      <div className="mb-12 p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Segment Connection System</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-3">
          <p>
            <strong className="text-gray-400">Run Structure:</strong> Finite sequences of connected segments. 
            Each segment has clear start and end. No endless looping.
          </p>
          <p>
            <strong className="text-gray-400">Segment Transition:</strong> Use gate, lift, or corridor to connect segments. 
            Visual closure at end of run (shutdown sequence, exit door).
          </p>
          <p>
            <strong className="text-gray-400">Assembly Method:</strong> Layer components horizontally. 
            Background layers extend full width. Platform and hazard layers arranged for moderate vertical navigation (1-2 levels).
          </p>
        </div>
      </div>

      {/* World Rules */}
      <div className="mb-12 max-w-4xl">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">World Design Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Rules */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Color Usage</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
              <div>• Environment stays mostly neutral</div>
              <div>• Accent color ONLY on: hazards, collectibles, active machinery</div>
              <div>• Max: One accent color per screen</div>
              <div>• No gradients on world geometry</div>
            </div>
          </div>

          {/* Motion Rules */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Motion & Feedback</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
              <div>• Allowed: Slow parallax, gentle flicker, soft pulses</div>
              <div>• Not allowed: Constant shaking, aggressive camera motion</div>
              <div>• Feedback: Clear but restrained (no explosions or screen-filling effects)</div>
            </div>
          </div>

          {/* Hazard Philosophy */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Hazard Philosophy</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
              <div>• Semi-random but learnable patterns</div>
              <div>• Must have visible timing or pattern</div>
              <div>• First encounter teaches behavior</div>
              <div>• No instant, unfair deaths</div>
            </div>
          </div>

          {/* Verticality */}
          <div className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm">
            <h3 className="text-xs font-['Cambay',sans-serif] text-gray-300 mb-3">Verticality: Moderate</h3>
            <div className="text-xs text-gray-600 font-['Cambay',sans-serif] space-y-1">
              <div>• Allowed: 1-2 platform levels, short ladders, recoverable drops</div>
              <div>• Not allowed: Extreme shafts, wall running, continuous vertical climb</div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Naming Convention */}
      <div className="max-w-3xl p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm mb-12">
        <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Component Naming</h2>
        <div className="text-xs text-gray-500 font-['Cambay',sans-serif] space-y-2">
          <div><code className="text-gray-400">Env/BG-Far/*</code> — Background far layer elements</div>
          <div><code className="text-gray-400">Env/BG-Mid/*</code> — Background mid layer elements</div>
          <div><code className="text-gray-400">Env/FG/*</code> — Foreground layer elements</div>
          <div><code className="text-gray-400">Env/Platform/*</code> — Interactive platform components</div>
          <div><code className="text-gray-400">Env/Hazard/*</code> — Mechanical hazard types</div>
          <div><code className="text-gray-400">Env/Collectible/*</code> — Data object variants</div>
        </div>
      </div>

      {/* Assembled Segment Example */}
      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-2">Assembled Segment Example</h2>
          <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
            See how all layers compose together to create a complete game segment
          </p>
        </div>
        <div className="border border-gray-800 bg-[#1A1A1A] rounded-sm p-6">
          <SegmentAssemblyDemo />
        </div>
      </div>

      {/* Segment Templates */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-lg font-['Cambay',sans-serif] text-gray-300 mb-2">Segment Templates</h2>
          <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
            Reusable micro-units that assemble into finite runs. Each template fits within one screen width.
          </p>
        </div>
        
        {/* Template Previews */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Segment / Flat */}
          <div className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
              <h3 className="text-sm font-['Cambay',sans-serif] mb-1">Segment / Flat</h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                Purpose: Teach rhythm and timing
              </p>
            </div>
            <div className="p-6 bg-[#0F0F0F]">
              <SegmentFlat />
            </div>
            <div className="p-4 border-t border-gray-800">
              <div className="grid grid-cols-3 gap-4 text-xs font-['Cambay',sans-serif]">
                <div>
                  <div className="text-gray-400 mb-2">What it teaches:</div>
                  <div className="text-gray-600">Movement + hazard cadence. Player learns basic timing patterns.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it punishes:</div>
                  <div className="text-gray-600">Rushing without observing patterns. Ignoring hazard indicators.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it reinforces:</div>
                  <div className="text-gray-600">Patience. Pattern recognition. Safe timing windows.</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  <strong className="text-gray-400">Rules:</strong> Single ground platform • 1-2 hazards with visible timing • 
                  1-2 collectibles placed safely • No vertical jumps required
                </div>
              </div>
            </div>
          </div>

          {/* Segment / Vertical */}
          <div className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
              <h3 className="text-sm font-['Cambay',sans-serif] mb-1">Segment / Vertical</h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                Purpose: Test spatial judgment without speed pressure
              </p>
            </div>
            <div className="p-6 bg-[#0F0F0F]">
              <SegmentVertical />
            </div>
            <div className="p-4 border-t border-gray-800">
              <div className="grid grid-cols-3 gap-4 text-xs font-['Cambay',sans-serif]">
                <div>
                  <div className="text-gray-400 mb-2">What it teaches:</div>
                  <div className="text-gray-600">Vertical positioning. Reading elevation changes. Safe descent timing.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it punishes:</div>
                  <div className="text-gray-600">Panic climbing. Ignoring collectible path guidance. Hasty drops.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it reinforces:</div>
                  <div className="text-gray-600">Observation before action. Using collectibles as visual guides. Controlled movement.</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  <strong className="text-gray-400">Rules:</strong> 1-2 platform height difference max • One recoverable drop OR ladder/lift • 
                  Hazards placed to punish panic, not patience • Collectibles suggest path
                </div>
              </div>
            </div>
          </div>

          {/* Segment / Mixed */}
          <div className="border border-gray-800 bg-[#1A1A1A] rounded-sm overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0F0F0F]">
              <h3 className="text-sm font-['Cambay',sans-serif] mb-1">Segment / Mixed</h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                Purpose: Combine timing + positioning
              </p>
            </div>
            <div className="p-6 bg-[#0F0F0F]">
              <SegmentMixed />
            </div>
            <div className="p-4 border-t border-gray-800">
              <div className="grid grid-cols-3 gap-4 text-xs font-['Cambay',sans-serif]">
                <div>
                  <div className="text-gray-400 mb-2">What it teaches:</div>
                  <div className="text-gray-600">Integration of timing and spatial skills. Multi-phase navigation. Hazard layering.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it punishes:</div>
                  <div className="text-gray-600">Single-skill reliance. Ignoring environment structure. Blind progression.</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">What it reinforces:</div>
                  <div className="text-gray-600">Mastery without aggression. Reading full segment layout. Precision over speed.</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 font-['Cambay',sans-serif]">
                  <strong className="text-gray-400">Rules:</strong> Flat entry → vertical middle → flat exit • 
                  One primary + one secondary hazard • Collectibles as guidance, not reward spam • No blind jumps
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Design Rules */}
        <div className="p-6 border border-gray-800 bg-[#0F0F0F] rounded-sm max-w-4xl">
          <h3 className="text-sm font-['Cambay',sans-serif] text-gray-300 mb-4">Segment Design Rules (Strict)</h3>
          <div className="text-xs text-gray-500 font-['Cambay',sans-serif] leading-relaxed space-y-2">
            <div>• No more than 3 hazards per segment</div>
            <div>• Every hazard must be visible before activation</div>
            <div>• Collectibles must never force damage</div>
            <div>• Platforms must visually communicate solidity (support structures required)</div>
            <div>• No segment should feel faster than the previous one</div>
            <div>• Entry zone (left 200px) and exit zone (right 200px) must remain clear for transitions</div>
          </div>
        </div>
      </div>
    </div>
  );
}