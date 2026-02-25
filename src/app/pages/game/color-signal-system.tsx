export default function ColorSignalSystem() {
  const baseNeutrals = [
    { name: 'Near-Black', token: 'game-neutral-black', description: 'Primary background' },
    { name: 'Charcoal', token: 'game-neutral-charcoal', description: 'Secondary surfaces' },
    { name: 'Soft White', token: 'game-neutral-white', description: 'Primary text / UI' },
    { name: 'Muted Grey', token: 'game-neutral-grey', description: 'Inactive elements' },
  ];

  const signalAccents = [
    { name: 'Primary Signal', token: 'game-signal-primary', description: 'Main interaction color' },
    { name: 'Secondary Signal', token: 'game-signal-secondary', description: 'Support accent' },
    { name: 'Warning Signal', token: 'game-signal-warning', description: 'Hazard / danger' },
    { name: 'Neutral Data', token: 'game-signal-data', description: 'Information display' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Color & Signal System</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Semantic color tokens only — no hex values assigned
        </p>
      </div>

      {/* Base Neutrals */}
      <div className="mb-12">
        <h2 className="text-lg font-['Cambay',sans-serif] mb-6 text-gray-300">Base Neutrals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {baseNeutrals.map((color) => (
            <div key={color.token} className="border border-gray-800 bg-[#1A1A1A] p-4 rounded-sm">
              {/* Color Swatch Placeholder */}
              <div className="w-full h-24 bg-gray-800 border border-gray-700 mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                    No Value
                  </span>
                </div>
              </div>

              {/* Token Info */}
              <h3 className="text-sm font-['Cambay',sans-serif] mb-1">{color.name}</h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif] mb-2">
                {color.description}
              </p>
              <code className="text-xs text-gray-500 font-mono">{color.token}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Accents */}
      <div className="mb-12">
        <h2 className="text-lg font-['Cambay',sans-serif] mb-6 text-gray-300">Signal Accents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {signalAccents.map((color) => (
            <div key={color.token} className="border border-gray-800 bg-[#1A1A1A] p-4 rounded-sm">
              {/* Color Swatch Placeholder */}
              <div className="w-full h-24 bg-gray-800 border border-gray-700 mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-['Cambay',sans-serif]">
                    No Value
                  </span>
                </div>
              </div>

              {/* Token Info */}
              <h3 className="text-sm font-['Cambay',sans-serif] mb-1">{color.name}</h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif] mb-2">
                {color.description}
              </p>
              <code className="text-xs text-gray-500 font-mono">{color.token}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Color Rules */}
      <div className="max-w-2xl">
        <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-3">Color Rules</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-['Cambay',sans-serif]">
          <li>• Hex values have not been assigned yet</li>
          <li>• These are semantic tokens only</li>
          <li>• One accent color per screen maximum</li>
          <li>• Visual restraint is more important than visual density</li>
        </ul>
      </div>
    </div>
  );
}
