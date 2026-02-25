import { useState } from 'react';

export function SegmentAssemblyDemo() {
  const [showLayer, setShowLayer] = useState({
    bgFar: true,
    bgMid: true,
    platforms: true,
    hazards: true,
    collectibles: true,
    foreground: true,
  });

  return (
    <div className="w-full">
      {/* Layer Toggles */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, bgFar: !prev.bgFar }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.bgFar ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          BG Far
        </button>
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, bgMid: !prev.bgMid }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.bgMid ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          BG Mid
        </button>
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, platforms: !prev.platforms }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.platforms ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          Platforms
        </button>
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, hazards: !prev.hazards }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.hazards ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          Hazards
        </button>
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, collectibles: !prev.collectibles }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.collectibles ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          Collectibles
        </button>
        <button
          onClick={() => setShowLayer(prev => ({ ...prev, foreground: !prev.foreground }))}
          className={`px-3 py-1 rounded text-xs font-['Cambay',sans-serif] transition-colors ${
            showLayer.foreground ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-500'
          }`}
        >
          Foreground
        </button>
      </div>

      {/* Assembled Segment Preview */}
      <div className="relative w-full h-[400px] bg-[#0A0A0A] border border-gray-800 rounded-sm overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          {/* Background (Far) */}
          {showLayer.bgFar && (
            <g opacity="1">
              {/* Large frame structure */}
              <rect x="100" y="40" width="600" height="320" fill="none" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="3" />
              <rect x="120" y="60" width="560" height="280" fill="none" stroke="rgba(60, 60, 65, 0.2)" strokeWidth="2" />
              
              {/* Vertical shaft */}
              <rect x="350" y="0" width="100" height="400" fill="rgba(50, 50, 55, 0.2)" />
              <line x1="360" y1="0" x2="360" y2="400" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="2" />
              <line x1="440" y1="0" x2="440" y2="400" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="2" />
              
              {/* Support beams */}
              <rect x="0" y="200" width="800" height="10" fill="rgba(55, 55, 60, 0.25)" />
              <rect x="0" y="300" width="800" height="8" fill="rgba(55, 55, 60, 0.2)" />
            </g>
          )}

          {/* Background (Mid) */}
          {showLayer.bgMid && (
            <g opacity="1">
              {/* Horizontal pipes */}
              <rect x="0" y="120" width="800" height="16" fill="rgba(80, 80, 85, 0.4)" />
              <line x1="0" y1="123" x2="800" y2="123" stroke="rgba(100, 100, 105, 0.3)" strokeWidth="2" />
              <line x1="0" y1="133" x2="800" y2="133" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="2" />
              <rect x="200" y="118" width="10" height="20" fill="rgba(90, 90, 95, 0.5)" />
              <rect x="500" y="118" width="10" height="20" fill="rgba(90, 90, 95, 0.5)" />
              
              {/* Vertical conduit */}
              <rect x="650" y="0" width="20" height="400" fill="rgba(75, 75, 80, 0.35)" />
              <line x1="653" y1="0" x2="653" y2="400" stroke="rgba(95, 95, 100, 0.3)" strokeWidth="2" />
              
              {/* Cable bundle */}
              <line x1="40" y1="60" x2="760" y2="70" stroke="rgba(70, 70, 75, 0.4)" strokeWidth="3" />
              
              {/* Indicators */}
              <circle cx="300" cy="100" r="4" fill="rgba(100, 100, 105, 0.6)" />
              <circle cx="600" cy="240" r="4" fill="rgba(100, 100, 105, 0.6)" />
            </g>
          )}

          {/* Interactive Platforms */}
          {showLayer.platforms && (
            <g opacity="1">
              {/* Entry platform */}
              <rect x="20" y="320" width="180" height="14" fill="rgba(95, 95, 100, 0.8)" />
              <line x1="20" y1="320" x2="200" y2="320" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
              <rect x="60" y="334" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              <rect x="160" y="334" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              
              {/* Mid platform (elevated) */}
              <rect x="260" y="240" width="160" height="14" fill="rgba(95, 95, 100, 0.8)" />
              <line x1="260" y1="240" x2="420" y2="240" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
              <rect x="300" y="254" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              <rect x="380" y="254" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              
              {/* Exit platform */}
              <rect x="600" y="320" width="180" height="14" fill="rgba(95, 95, 100, 0.8)" />
              <line x1="600" y1="320" x2="780" y2="320" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
              <rect x="640" y="334" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              <rect x="740" y="334" width="8" height="66" fill="rgba(85, 85, 90, 0.7)" />
              
              {/* Small step */}
              <rect x="480" y="280" width="60" height="12" fill="rgba(95, 95, 100, 0.8)" />
              <line x1="480" y1="280" x2="540" y2="280" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
            </g>
          )}

          {/* Hazards */}
          {showLayer.hazards && (
            <g opacity="1">
              {/* Crusher (at top position) */}
              <rect x="150" y="50" width="60" height="20" fill="rgba(90, 90, 95, 0.85)" />
              <rect x="154" y="54" width="52" height="12" fill="rgba(110, 110, 115, 0.6)" />
              <rect x="177" y="30" width="10" height="20" fill="rgba(85, 85, 90, 0.7)" />
              <circle cx="182" cy="65" r="5" fill="rgba(120, 120, 125, 0.7)" />
              
              {/* Vent */}
              <rect x="520" y="180" width="40" height="80" fill="rgba(75, 75, 80, 0.8)" />
              {Array.from({ length: 10 }).map((_, i) => (
                <line 
                  key={i}
                  x1="523" 
                  y1={185 + i * 7} 
                  x2="557" 
                  y2={185 + i * 7} 
                  stroke="rgba(60, 60, 65, 0.9)" 
                  strokeWidth="3" 
                />
              ))}
              <rect x="525" y="173" width="30" height="4" fill="rgba(100, 100, 105, 0.7)" />
            </g>
          )}

          {/* Collectibles */}
          {showLayer.collectibles && (
            <g opacity="1">
              {/* Data cube on entry platform */}
              <rect x="92" y="298" width="20" height="20" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
              <rect x="98" y="304" width="8" height="8" fill="rgba(120, 120, 125, 0.6)" />
              <circle cx="106" cy="308" r="3" fill="rgba(130, 130, 135, 0.9)" />
              
              {/* Signal node on mid platform */}
              <circle cx="340" cy="220" r="14" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
              <circle cx="340" cy="220" r="7" fill="rgba(120, 120, 125, 0.6)" />
              <circle cx="340" cy="220" r="4" fill="rgba(130, 130, 135, 0.9)" />
              <line x1="340" y1="206" x2="340" y2="195" stroke="rgba(110, 110, 115, 0.5)" strokeWidth="2" />
              
              {/* Data shard before exit */}
              <polygon 
                points="680,295 692,307 680,319 668,307" 
                fill="none" 
                stroke="rgba(110, 110, 115, 0.8)" 
                strokeWidth="3" 
              />
              <polygon 
                points="680,301 686,307 680,313 674,307" 
                fill="rgba(120, 120, 125, 0.7)" 
              />
            </g>
          )}

          {/* Foreground */}
          {showLayer.foreground && (
            <g opacity="1">
              {/* Top rail */}
              <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(90, 90, 95, 0.5)" strokeWidth="4" />
              <line x1="0" y1="83" x2="800" y2="83" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="2" />
              <rect x="200" y="80" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
              <rect x="400" y="80" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
              <rect x="600" y="80" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
              
              {/* Floor grate section */}
              <rect x="460" y="340" width="120" height="25" fill="rgba(70, 70, 75, 0.4)" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line 
                  key={i}
                  x1={460 + i * 10} 
                  y1="343" 
                  x2={460 + i * 10} 
                  y2="362" 
                  stroke="rgba(50, 50, 55, 0.6)" 
                  strokeWidth="2" 
                />
              ))}
            </g>
          )}
        </svg>

        {/* Segment Label */}
        <div className="absolute top-4 left-4 px-3 py-2 bg-black/80 rounded text-xs text-gray-400 font-['Cambay',sans-serif]">
          Segment Example — Entry → Mid Platform → Exit
        </div>
      </div>

      {/* Assembly Notes */}
      <div className="mt-4 text-xs text-gray-500 font-['Cambay',sans-serif]">
        Toggle layers to see composition. This segment demonstrates moderate verticality (1 level jump),
        hazard placement (crusher + vent), and collectible distribution (3 data objects).
      </div>
    </div>
  );
}
