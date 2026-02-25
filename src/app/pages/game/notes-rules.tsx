export default function NotesRules() {
  const coreRules = [
    'This game rewards precision, not speed.',
    'Visual restraint is more important than visual density.',
    'Effects must communicate state, not spectacle.',
    'One accent color per screen maximum.',
    'If something feels aggressive, it is likely wrong.',
  ];

  const designPrinciples = [
    {
      title: 'Minimalism',
      description: 'Every element must justify its existence. Remove before adding.',
    },
    {
      title: 'Signal Survival',
      description: 'The game is about navigating through noise to find clarity.',
    },
    {
      title: 'Precision Over Speed',
      description: 'Reward careful decision-making, not reflexes alone.',
    },
    {
      title: 'Restraint',
      description: 'Visual and interaction design should feel restrained, not explosive.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-['Cambay',sans-serif] mb-2">Notes / Rules</h1>
        <p className="text-sm text-gray-500 font-['Cambay',sans-serif]">
          Core principles and design constraints
        </p>
      </div>

      {/* Core Rules */}
      <div className="mb-12 max-w-3xl">
        <h2 className="text-lg font-['Cambay',sans-serif] mb-6 text-gray-300">Core Rules</h2>
        <div className="space-y-4">
          {coreRules.map((rule, index) => (
            <div
              key={index}
              className="border border-gray-800 bg-[#1A1A1A] p-5 rounded-sm"
            >
              <div className="flex items-start gap-4">
                <span className="text-gray-600 font-['Cambay',sans-serif] text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-sm font-['Cambay',sans-serif] leading-relaxed">
                  {rule}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Principles */}
      <div className="mb-12 max-w-3xl">
        <h2 className="text-lg font-['Cambay',sans-serif] mb-6 text-gray-300">Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designPrinciples.map((principle) => (
            <div
              key={principle.title}
              className="border border-gray-800 bg-[#1A1A1A] p-6 rounded-sm"
            >
              <h3 className="text-sm font-['Cambay',sans-serif] mb-3 text-white">
                {principle.title}
              </h3>
              <p className="text-xs text-gray-600 font-['Cambay',sans-serif] leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Constraints */}
      <div className="max-w-3xl border-t border-gray-800 pt-8">
        <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-4">Implementation Status</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Environment layer system designed and documented
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Environment components created in neutral greys
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Segment assembly system defined with visual examples
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              World rules and constraints documented
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Component naming convention established
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Three segment templates created (Flat, Vertical, Mixed)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Segment grammar documented (teaches, punishes, reinforces)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              HUD and player feedback system designed
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Clean Mode (portfolio) and Diagnostic Mode (systems review) implemented
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Core locomotion states integrated (Idle, Walk, Run)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Posture-based intent system (gun-down vs gun-up)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-xs text-gray-500 font-['Cambay',sans-serif]">
              Signal/momentum integration with locomotion
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-4">Pending (Separate Phases)</h3>
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
              ⏳ Character sprites and animations
            </p>
            <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
              ⏳ Accent color selection and application
            </p>
            <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
              ⏳ Motion and animation implementation
            </p>
            <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
              ⏳ Gameplay logic and state management
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl border-t border-gray-800 pt-8 mt-8">
        <h3 className="text-sm font-['Cambay',sans-serif] text-gray-400 mb-4">Critical Constraints</h3>
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
            • This setup is a foundation only
          </p>
          <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
            • Do not interpret creatively
          </p>
          <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
            • Do not "improve" visuals beyond specifications
          </p>
          <p className="text-xs text-gray-600 font-['Cambay',sans-serif]">
            • Do not introduce themes or stylization prematurely
          </p>
        </div>
      </div>
    </div>
  );
}