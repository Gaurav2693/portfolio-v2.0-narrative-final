// Segment templates using existing environment components
// Each segment fits within one screen width (1440px primary canvas)

// SEGMENT / FLAT
// Purpose: Teach rhythm and timing
export function SegmentFlat() {
  return (
    <svg width="1440" height="720" viewBox="0 0 1440 720" className="w-full h-auto">
      {/* Background (Far) - Structural frame */}
      <g opacity="0.8">
        <rect x="200" y="80" width="1040" height="560" fill="none" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="3" />
        <rect x="0" y="400" width="1440" height="10" fill="rgba(55, 55, 60, 0.25)" />
      </g>

      {/* Background (Mid) - Pipes and indicator */}
      <g opacity="0.9">
        <rect x="0" y="200" width="1440" height="16" fill="rgba(80, 80, 85, 0.4)" />
        <line x1="0" y1="203" x2="1440" y2="203" stroke="rgba(100, 100, 105, 0.3)" strokeWidth="2" />
        <rect x="400" y="198" width="10" height="20" fill="rgba(90, 90, 95, 0.5)" />
        <rect x="1000" y="198" width="10" height="20" fill="rgba(90, 90, 95, 0.5)" />
        <circle cx="720" cy="180" r="4" fill="rgba(100, 100, 105, 0.6)" />
      </g>

      {/* ENTRY ZONE (left) */}
      <rect x="0" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="100" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        ENTRY
      </text>

      {/* Single ground platform */}
      <g>
        <rect x="150" y="550" width="1140" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="150" y1="550" x2="1290" y2="550" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <line x1="150" y1="564" x2="1290" y2="564" stroke="rgba(75, 75, 80, 0.6)" strokeWidth="1" />
        {/* Support structures */}
        <rect x="300" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="600" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="900" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="1200" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* HAZARD 1: Vent at mid-segment */}
      <g>
        <rect x="600" y="450" width="40" height="100" fill="rgba(75, 75, 80, 0.8)" />
        {/* Vent grill */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line 
            key={i}
            x1="603" 
            y1={455 + i * 8} 
            x2="637" 
            y2={455 + i * 8} 
            stroke="rgba(60, 60, 65, 0.9)" 
            strokeWidth="3" 
          />
        ))}
        {/* Timing indicator (visible before activation) */}
        <rect x="605" y="443" width="30" height="4" fill="rgba(100, 100, 105, 0.7)" />
      </g>

      {/* HAZARD 2: Energy conduit near exit */}
      <g>
        <rect x="1050" y="430" width="20" height="120" fill="rgba(80, 80, 85, 0.8)" />
        <rect x="1054" y="435" width="12" height="110" fill="rgba(100, 100, 105, 0.6)" />
        {/* Energy pulses (static) */}
        <rect x="1056" y="445" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
        <rect x="1056" y="490" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
        <rect x="1056" y="530" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
      </g>

      {/* COLLECTIBLE 1: Safe zone after entry */}
      <g>
        <rect x="330" y="518" width="20" height="20" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
        <rect x="336" y="524" width="8" height="8" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="344" cy="528" r="3" fill="rgba(130, 130, 135, 0.9)" />
      </g>

      {/* COLLECTIBLE 2: Safe zone before hazard 1 */}
      <g>
        <polygon 
          points="480,523 492,535 480,547 468,535" 
          fill="none" 
          stroke="rgba(110, 110, 115, 0.8)" 
          strokeWidth="3" 
        />
        <polygon 
          points="480,529 486,535 480,541 474,535" 
          fill="rgba(120, 120, 125, 0.7)" 
        />
      </g>

      {/* Foreground - Top rail */}
      <g opacity="0.9">
        <line x1="0" y1="140" x2="1440" y2="140" stroke="rgba(90, 90, 95, 0.5)" strokeWidth="4" />
        <line x1="0" y1="143" x2="1440" y2="143" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="2" />
        <rect x="400" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
        <rect x="800" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
        <rect x="1200" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
      </g>

      {/* EXIT ZONE (right) */}
      <rect x="1240" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="1340" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        EXIT
      </text>
    </svg>
  );
}

// SEGMENT / VERTICAL
// Purpose: Test spatial judgment without speed pressure
export function SegmentVertical() {
  return (
    <svg width="1440" height="720" viewBox="0 0 1440 720" className="w-full h-auto">
      {/* Background (Far) */}
      <g opacity="0.8">
        <rect x="200" y="80" width="1040" height="560" fill="none" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="3" />
        <rect x="500" y="0" width="100" height="720" fill="rgba(50, 50, 55, 0.2)" />
        <line x1="510" y1="0" x2="510" y2="720" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="2" />
      </g>

      {/* Background (Mid) */}
      <g opacity="0.9">
        <rect x="0" y="200" width="1440" height="16" fill="rgba(80, 80, 85, 0.4)" />
        <line x1="0" y1="203" x2="1440" y2="203" stroke="rgba(100, 100, 105, 0.3)" strokeWidth="2" />
        <rect x="900" y="0" width="20" height="720" fill="rgba(75, 75, 80, 0.35)" />
        <circle cx="350" cy="180" r="4" fill="rgba(100, 100, 105, 0.6)" />
        <circle cx="1100" cy="450" r="4" fill="rgba(100, 100, 105, 0.6)" />
      </g>

      {/* ENTRY ZONE */}
      <rect x="0" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="100" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        ENTRY
      </text>

      {/* Entry platform (ground level) */}
      <g>
        <rect x="150" y="550" width="300" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="150" y1="550" x2="450" y2="550" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="220" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="380" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* Mid platform (elevated - 1 level up) */}
      <g>
        <rect x="550" y="430" width="340" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="550" y1="430" x2="890" y2="430" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="620" y="444" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="820" y="444" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* Exit platform (back to ground) */}
      <g>
        <rect x="1000" y="550" width="290" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="1000" y1="550" x2="1290" y2="550" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="1070" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="1220" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* HAZARD: Crusher on mid platform (punishes panic) */}
      <g>
        <rect x="710" y="360" width="60" height="20" fill="rgba(90, 90, 95, 0.85)" />
        <rect x="714" y="364" width="52" height="12" fill="rgba(110, 110, 115, 0.6)" />
        {/* Piston shaft (visible from above) */}
        <rect x="737" y="340" width="10" height="20" fill="rgba(85, 85, 90, 0.7)" />
        <line x1="739" y1="340" x2="739" y2="360" stroke="rgba(70, 70, 75, 0.8)" strokeWidth="1" />
        {/* Warning indicator */}
        <circle cx="742" cy="385" r="5" fill="rgba(120, 120, 125, 0.7)" />
      </g>

      {/* COLLECTIBLE 1: On entry platform (suggests upward path) */}
      <g>
        <rect x="380" y="518" width="20" height="20" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
        <rect x="386" y="524" width="8" height="8" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="394" cy="528" r="3" fill="rgba(130, 130, 135, 0.9)" />
        {/* Visual guide pointing up */}
        <line x1="390" y1="510" x2="390" y2="490" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
      </g>

      {/* COLLECTIBLE 2: On mid platform (safe spot) */}
      <g>
        <circle cx="600" cy="405" r="14" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
        <circle cx="600" cy="405" r="7" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="600" cy="405" r="4" fill="rgba(130, 130, 135, 0.9)" />
      </g>

      {/* COLLECTIBLE 3: Before drop (suggests downward exit) */}
      <g>
        <polygon 
          points="930,523 942,535 930,547 918,535" 
          fill="none" 
          stroke="rgba(110, 110, 115, 0.8)" 
          strokeWidth="3" 
        />
        <polygon 
          points="930,529 936,535 930,541 924,535" 
          fill="rgba(120, 120, 125, 0.7)" 
        />
        {/* Visual guide pointing down */}
        <line x1="930" y1="555" x2="930" y2="545" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
      </g>

      {/* Foreground - Rail */}
      <g opacity="0.9">
        <line x1="0" y1="140" x2="1440" y2="140" stroke="rgba(90, 90, 95, 0.5)" strokeWidth="4" />
        <rect x="500" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
        <rect x="1000" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
      </g>

      {/* EXIT ZONE */}
      <rect x="1240" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="1340" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        EXIT
      </text>
    </svg>
  );
}

// SEGMENT / MIXED
// Purpose: Combine timing + positioning
export function SegmentMixed() {
  return (
    <svg width="1440" height="720" viewBox="0 0 1440 720" className="w-full h-auto">
      {/* Background (Far) */}
      <g opacity="0.8">
        <rect x="200" y="80" width="1040" height="560" fill="none" stroke="rgba(60, 60, 65, 0.3)" strokeWidth="3" />
        <rect x="220" y="100" width="1000" height="520" fill="none" stroke="rgba(60, 60, 65, 0.2)" strokeWidth="2" />
        <rect x="0" y="350" width="1440" height="10" fill="rgba(55, 55, 60, 0.25)" />
      </g>

      {/* Background (Mid) */}
      <g opacity="0.9">
        <rect x="0" y="200" width="1440" height="16" fill="rgba(80, 80, 85, 0.4)" />
        <line x1="0" y1="203" x2="1440" y2="203" stroke="rgba(100, 100, 105, 0.3)" strokeWidth="2" />
        <rect x="800" y="0" width="20" height="720" fill="rgba(75, 75, 80, 0.35)" />
        <line x1="40" y1="120" x2="1400" y2="130" stroke="rgba(70, 70, 75, 0.4)" strokeWidth="3" />
        <circle cx="450" cy="280" r="4" fill="rgba(100, 100, 105, 0.6)" />
        <circle cx="950" cy="500" r="4" fill="rgba(100, 100, 105, 0.6)" />
      </g>

      {/* ENTRY ZONE */}
      <rect x="0" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="100" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        ENTRY
      </text>

      {/* FLAT ENTRY: Ground platform */}
      <g>
        <rect x="150" y="550" width="350" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="150" y1="550" x2="500" y2="550" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="230" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="420" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* VERTICAL MIDDLE: Two-level structure */}
      <g>
        {/* Lower platform */}
        <rect x="600" y="480" width="180" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="600" y1="480" x2="780" y2="480" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="640" y="494" width="8" height="70" fill="rgba(85, 85, 90, 0.7)" />
        
        {/* Upper platform */}
        <rect x="680" y="380" width="200" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="680" y1="380" x2="880" y2="380" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="730" y="394" width="8" height="70" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="830" y="394" width="8" height="70" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* FLAT EXIT: Ground platform */}
      <g>
        <rect x="980" y="550" width="310" height="14" fill="rgba(95, 95, 100, 0.8)" />
        <line x1="980" y1="550" x2="1290" y2="550" stroke="rgba(115, 115, 120, 0.6)" strokeWidth="3" />
        <rect x="1050" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
        <rect x="1220" y="564" width="8" height="100" fill="rgba(85, 85, 90, 0.7)" />
      </g>

      {/* PRIMARY HAZARD: Vent on flat entry (timing test) */}
      <g>
        <rect x="350" y="450" width="40" height="100" fill="rgba(75, 75, 80, 0.8)" />
        {/* Vent grill */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line 
            key={i}
            x1="353" 
            y1={455 + i * 8} 
            x2="387" 
            y2={455 + i * 8} 
            stroke="rgba(60, 60, 65, 0.9)" 
            strokeWidth="3" 
          />
        ))}
        <rect x="355" y="443" width="30" height="4" fill="rgba(100, 100, 105, 0.7)" />
      </g>

      {/* SECONDARY HAZARD: Energy pulses on vertical section (positioning test) */}
      <g>
        <rect x="770" y="400" width="20" height="80" fill="rgba(80, 80, 85, 0.8)" />
        <rect x="774" y="405" width="12" height="70" fill="rgba(100, 100, 105, 0.6)" />
        <rect x="776" y="415" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
        <rect x="776" y="445" width="8" height="4" fill="rgba(110, 110, 115, 0.8)" />
      </g>

      {/* COLLECTIBLE 1: Entry zone (guidance) */}
      <g>
        <rect x="250" y="518" width="20" height="20" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
        <rect x="256" y="524" width="8" height="8" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="264" cy="528" r="3" fill="rgba(130, 130, 135, 0.9)" />
      </g>

      {/* COLLECTIBLE 2: Mid platform (suggests safe path) */}
      <g>
        <circle cx="780" cy="355" r="14" fill="none" stroke="rgba(110, 110, 115, 0.8)" strokeWidth="3" />
        <circle cx="780" cy="355" r="7" fill="rgba(120, 120, 125, 0.6)" />
        <circle cx="780" cy="355" r="4" fill="rgba(130, 130, 135, 0.9)" />
        <line x1="780" y1="341" x2="780" y2="330" stroke="rgba(110, 110, 115, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
      </g>

      {/* Foreground - Broken panel for depth */}
      <g opacity="0.9">
        <line x1="0" y1="140" x2="1440" y2="140" stroke="rgba(90, 90, 95, 0.5)" strokeWidth="4" />
        <rect x="600" y="140" width="5" height="25" fill="rgba(85, 85, 90, 0.5)" />
        
        {/* Broken panel on right */}
        <rect x="1100" y="300" width="100" height="80" fill="rgba(75, 75, 80, 0.45)" />
        <rect x="1105" y="305" width="90" height="70" fill="rgba(65, 65, 70, 0.3)" />
        <line x1="1110" y1="310" x2="1130" y2="340" stroke="rgba(85, 85, 90, 0.5)" strokeWidth="2" />
      </g>

      {/* EXIT ZONE */}
      <rect x="1240" y="0" width="200" height="720" fill="rgba(50, 50, 55, 0.1)" />
      <text x="1340" y="680" fill="rgba(100, 100, 105, 0.5)" fontSize="12" textAnchor="middle" fontFamily="Cambay, sans-serif">
        EXIT
      </text>
    </svg>
  );
}
