import { useState } from 'react';

export default function GameCanvas() {
  const [selectedResolution, setSelectedResolution] = useState<'primary' | 'tablet' | 'mobile'>('primary');

  const resolutions = {
    primary: { width: 1440, height: 720, label: '1440 × 720 (Primary)' },
    tablet: { width: 1024, height: 512, label: '1024 × 512 (Tablet)' },
    mobile: { width: 390, height: 844, label: '390 × 844 (Mobile)' },
  };

  const current = resolutions[selectedResolution];
  const safeAreaPadding = 0.1; // 10% padding

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Game Canvas</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">Primary design resolution and responsive variants</p>
      </div>

      {/* Resolution Selector */}
      <div className="flex gap-3 mb-8">
        {(Object.keys(resolutions) as Array<keyof typeof resolutions>).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedResolution(key)}
            className={`px-4 py-2 rounded font-['Cambay',sans-serif] text-sm transition-colors ${
              selectedResolution === key
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {resolutions[key].label}
          </button>
        ))}
      </div>

      {/* Canvas Container */}
      <div className="flex justify-center items-center">
        <div className="relative" style={{ width: current.width, height: current.height }}>
          {/* Main Frame */}
          <div className="w-full h-full border border-gray-700 bg-[#1A1A1A] relative">
            {/* Safe Area Overlay */}
            <div
              className="absolute border border-dashed border-gray-600 pointer-events-none"
              style={{
                top: `${safeAreaPadding * 100}%`,
                left: `${safeAreaPadding * 100}%`,
                right: `${safeAreaPadding * 100}%`,
                bottom: `${safeAreaPadding * 100}%`,
              }}
            >
              <div className="absolute -top-5 left-0 text-xs text-gray-600 font-['Cambay',sans-serif]">
                Safe Area (10% padding)
              </div>
            </div>

            {/* Ground Reference Line */}
            <div
              className="absolute left-0 right-0 border-t border-dashed border-gray-700"
              style={{ bottom: '30%' }}
            >
              <div className="absolute -top-5 left-4 text-xs text-gray-600 font-['Cambay',sans-serif]">
                Ground Reference
              </div>
            </div>

            {/* Canvas Info */}
            <div className="absolute bottom-4 right-4 text-xs text-gray-600 font-['Cambay',sans-serif]">
              {current.width} × {current.height}
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-8 max-w-2xl">
        <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-3">Canvas Guidelines</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-['Cambay',sans-serif]">
          <li>• Safe area ensures content visibility across devices</li>
          <li>• Ground reference is a non-visual guide for vertical positioning</li>
          <li>• All game elements should be designed within these boundaries</li>
        </ul>
      </div>
    </div>
  );
}
