// Interim line-art for the two work cards. Same stroke language as the character
// (1.5px black, rounded caps). Replace with generated illustrations once you have them:
// see ILLUSTRATIONS.md for the brief.

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function CostOfAttentionArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 200" className={className} aria-hidden="true" {...stroke}>
      {/* agent screen: bar on top */}
      <rect x="18" y="26" width="150" height="110" rx="4" />
      <rect x="28" y="36" width="130" height="18" rx="2" />
      <path d="M36 45h26M70 45h40M128 41v8" />
      <path d="M28 66h52M28 80h130M28 94h130M28 108h80" />
      {/* customer screen: tile with carousel */}
      <rect x="192" y="26" width="150" height="110" rx="4" />
      <path d="M202 36h130M202 46h60" />
      <rect x="202" y="58" width="62" height="68" rx="3" />
      <path d="M210 70h30M210 82h46M210 96h22" />
      <circle cx="233" cy="116" r="1.5" fill="currentColor" /><circle cx="241" cy="116" r="1.5" /><circle cx="249" cy="116" r="1.5" />
      <rect x="274" y="58" width="58" height="68" rx="3" />
      <path d="M282 70h30M282 82h42" />
      {/* the same data underneath */}
      <path d="M93 148v14h174v-14" />
      <path d="M180 162v12" />
      <rect x="150" y="174" width="60" height="16" rx="8" />
      <path d="M160 182h40" strokeDasharray="2 3" />
    </svg>
  );
}

export function CpqArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 200" className={className} aria-hidden="true" {...stroke}>
      {/* dense form */}
      <rect x="18" y="20" width="130" height="160" rx="4" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <path d={`M28 ${36 + i * 16}h34`} />
          <rect x="70" y={30 + i * 16} width="68" height="10" rx="2" />
        </g>
      ))}
      {/* arrow */}
      <path d="M160 100h32M186 92l8 8-8 8" />
      {/* guided conversation */}
      <path d="M212 44h86a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-74l-12 10z" />
      <path d="M224 58h50M224 68h30" />
      <path d="M342 98h-86a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h74l12 10z" />
      <path d="M262 112h50M262 122h24" />
      <rect x="212" y="150" width="130" height="24" rx="12" />
      <path d="M226 162h60" strokeDasharray="2 3" />
      <path d="M320 158l4 4 8-8" />
    </svg>
  );
}
