export default function MotionStates() {
  const statePlaceholders = [
    'Idle',
    'Movement',
    'Jump / Fall',
    'Interaction',
    'Damage / Recovery',
    'Special State',
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Motion & States</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Empty placeholders for animation and state logic
        </p>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statePlaceholders.map((state) => (
          <div
            key={state}
            className="border border-gray-800 bg-[#1A1A1A] p-6 rounded-sm"
          >
            {/* Placeholder Frame */}
            <div className="w-full h-40 border border-dashed border-gray-700 bg-[#0F0F0F] mb-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-700 font-['Cambay',sans-serif]">
                  No Motion Defined
                </span>
              </div>
            </div>

            {/* State Name */}
            <h3 className="text-sm font-['Cambay',sans-serif]">{state}</h3>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mt-12 max-w-2xl">
        <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-3">Motion Notes</h3>
        <ul className="text-xs text-gray-600 space-y-1 font-['Cambay',sans-serif]">
          <li>• No animation or prototype logic has been added</li>
          <li>• States are placeholders for future work</li>
          <li>• Motion should communicate state, not spectacle</li>
        </ul>
      </div>
    </div>
  );
}
