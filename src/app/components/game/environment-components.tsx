// Background (Far) - Large structural silhouettes
export function BackgroundFarElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Large structural frame */}
      <rect x="50" y="20" width="300" height="160" fill="none" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="2" />
      <rect x="60" y="30" width="280" height="140" fill="none" stroke="rgba(60, 60, 65, 0.2)" strokeWidth="1" />
      
      {/* Vertical shaft silhouette */}
      <rect x="150" y="0" width="80" height="200" fill="rgba(50, 50, 55, 0.2)" />
      <line x1="160" y1="0" x2="160" y2="200" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="1" />
      <line x1="220" y1="0" x2="220" y2="200" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="1" />
      
      {/* Large support beams */}
      <rect x="0" y="100" width="400" height="8" fill="rgba(55, 55, 60, 0.25)" />
      <rect x="0" y="150" width="400" height="6" fill="rgba(55, 55, 60, 0.2)" />
    </svg>
  );
}

// Background (Mid) - Pipes, conduits, indicators
export function BackgroundMidElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Horizontal pipes */}
      <g>
        <rect x="0" y="60" width="400" height="12" fill="rgba(80, 80, 85, 0.4)" />
        <line x1="0" y1="62" x2="400" y2="62" stroke="rgba(100, 100, 105, 0.3)" strokeWidth="1" />
        <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="1" />
        {/* Pipe joints */}
        <rect x="100" y="58" width="8" height="16" fill="rgba(90, 90, 95, 0.5)" />
        <rect x="250" y="58" width="8" height="16" fill="rgba(90, 90, 95, 0.5)" />
      </g>
      
      {/* Vertical conduit */}
      <g>
        <rect x="80" y="0" width="16" height="200" fill="rgba(75, 75, 80, 0.35)" />
        <line x1="82" y1="0" x2="82" y2="200" stroke="rgba(95, 95, 100, 0.3)" strokeWidth="1" />
        <line x1="94" y1="0" x2="94" y2="200" stroke="rgba(95, 95, 100, 0.3)" strokeWidth="1" />
      </g>
      
      {/* Cable bundles */}
      <line x1="20" y1="30" x2="380" y2="35" stroke="rgba(70, 70, 75, 0.4)" strokeWidth="2" />
      <line x1="20" y1="32" x2="380" y2="37" stroke="rgba(70, 70, 75, 0.3)" strokeWidth="1" />
      
      {/* Blinking indicators (static state shown) */}
      <circle cx="150" cy="50" r="3" fill="rgba(100, 100, 105, 0.6)" />
      <circle cx="300" cy="120" r="3" fill="rgba(100, 100, 105, 0.6)" />
      <circle cx="200" cy="180" r="3" fill="rgba(100, 100, 105, 0.6)" />
    </svg>
  );
}

// Foreground - Rails, grates, panels
export function ForegroundElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Top rail */}
      <g>
        <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(90, 90, 95, 0.5)" strokeWidth="3" />
        <line x1="0" y1="42" x2="400" y2="42" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="1" />
        {/* Rail supports */}
        <rect x="100" y="40" width="4" height="20" fill="rgba(85, 85, 90, 0.5)" />
        <rect x="200" y="40" width="4" height="20" fill="rgba(85, 85, 90, 0.5)" />
        <rect x="300" y="40" width="4" height="20" fill="rgba(85, 85, 90, 0.5)" />
      </g>
      
      {/* Floor grate */}
      <g>
        <rect x="50" y="160" width="120" height="20" fill="rgba(70, 70, 75, 0.4)" />
        {/* Grate pattern */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line 
            key={i}
            x1={50 + i * 10} 
            y1="162" 
            x2={50 + i * 10} 
            y2="178" 
            stroke="rgba(50, 50, 55, 0.6)" 
            strokeWidth="1" 
          />
        ))}
      </g>
      
      {/* Broken panel */}
      <g>
        <rect x="250" y="100" width="80" height="60" fill="rgba(75, 75, 80, 0.45)" />
        <rect x="255" y="105" width="70" height="50" fill="rgba(65, 65, 70, 0.3)" />
        {/* Panel damage */}
        <line x1="260" y1="110" x2="280" y2="145" stroke="rgba(85, 85, 90, 0.5)" strokeWidth="2" />
        <line x1="300" y1="115" x2="315" y2="150" stroke="rgba(85, 85, 90, 0.5)" strokeWidth="2" />
      </g>
    </svg>
  );
}

// Interactive Platforms
export function PlatformElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Standard flat platform */}
      <g>
        <rect x="50" y="150" width="140" height="12" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="50" y1="150" x2="190" y2="150" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="2" />
        <line x1="50" y1="162" x2="190" y2="162" stroke="rgba(75, 75, 80, 0.6)" strokeWidth="1" />
        {/* Support structure */}
        <rect x="80" y="162" width="6" height="38" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="150" y="162" width="6" height="38" fill="rgba(85, 85, 90, 0.7)" />
      </g>
      
      {/* Step-up platform */}
      <g>
        <rect x="220" y="100" width="100" height="12" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="220" y1="100" x2="320" y2="100" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="2" />
        <line x1="220" y1="112" x2="320" y2="112" stroke="rgba(75, 75, 80, 0.6)" strokeWidth="1" />
        <rect x="250" y="112" width="6" height="38" fill="rgba(85, 85, 90, 0.7)" />
      </g>
      
      {/* Small step platform */}
      <g>
        <rect x="340" y="130" width="50" height="10" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="340" y1="130" x2="390" y2="130" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="2" />
      </g>
    </svg>
  );
}

// Hazards - Mechanical only
export function HazardElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Vertical crusher (top position) */}
      <g>
        <rect x="80" y="20" width="40" height="16" fill="rgba(90, 90, 95, 0.85)" />
        <rect x="82" y="22" width="36" height="12" fill="rgba(110, 110, 115, 0.6)" />
        {/* Piston shaft */}
        <rect x="96" y="0" width="8" height="20" fill="rgba(85, 85, 90, 0.7)" />
        <line x1="98" y1="0" x2="98" y2="20" stroke="rgba(70, 70, 75, 0.8)" strokeWidth="1" />
        {/* Warning indicator */}
        <circle cx="100" cy="30" r="4" fill="rgba(120, 120, 125, 0.7)" />
      </g>
      
      {/* Vent with periodic discharge */}
      <g>
        <rect x="250" y="120" width="30" height="60" fill="rgba(75, 75, 80, 0.8)" />
        {/* Vent grill */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line 
            key={i}
            x1="252" 
            y1={125 + i * 7} 
            x2="278" 
            y2={125 + i * 7} 
            stroke="rgba(60, 60, 65, 0.9)" 
            strokeWidth="2" 
          />
        ))}
        {/* Energy indicator */}
        <rect x="255" y="115" width="20" height="3" fill="rgba(100, 100, 105, 0.7)" />
      </g>
      
      {/* Exposed energy conduit */}
      <g>
        <rect x="350" y="80" width="20" height="80" fill="rgba(80, 80, 85, 0.8)" />
        <rect x="354" y="85" width="12" height="70" fill="rgba(100, 100, 105, 0.6)" />
        {/* Energy pulses (static representation) */}
        <rect x="356" y="90" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
        <rect x="356" y="120" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
        <rect x="356" y="145" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
      </g>
    </svg>
  );
}

// Collectibles - Data objects
export function CollectibleElements() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Data cube */}
      <g>
        <rect x="100" y="80" width="16" height="16" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="2" />
        <rect x="104" y="84" width="8" height="8" fill="rgba(120, 120, 125, 0.6)" />
        {/* Accent marker (placeholder for accent color) */}
        <circle cx="112" cy="92" r="3" fill="rgba(130, 130, 135, 0.9)" />
      </g>
      
      {/* Data shard */}
      <g>
        <polygon 
          points="220,100 228,108 220,116 212,108" 
          fill="none" 
          stroke="rgba(110, 110, 115, 0.8)" 
          strokeWidth="2" 
        />
        <polygon 
          points="220,104 224,108 220,112 216,108" 
          fill="rgba(120, 120, 125, 0.7)" 
        />
      </g>
      
      {/* Signal node */}
      <g>
        <circle cx="320" cy="140" r="12" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="2" />
        <circle cx="320" cy="140" r="6" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="320" cy="140" r="3" fill="rgba(130, 130, 135, 0.9)" />
        {/* Connection lines */}
        <line x1="320" y1="128" x2="320" y2="120" stroke="rgba(110, 110, 115, 0.5)" strokeWidth="1" />
        <line x1="308" y1="140" x2="300" y2="140" stroke="rgba(110, 110, 115, 0.5)" strokeWidth="1" />
        <line x1="332" y1="140" x2="340" y2="140" stroke="rgba(110, 110, 115, 0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
}
