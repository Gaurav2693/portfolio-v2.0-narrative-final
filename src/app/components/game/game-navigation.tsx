import { Link, useLocation } from 'react-router';

export function GameNavigation() {
  const location = useLocation();

  const pages = [
    { path: '/game/canvas', label: 'Game Canvas' },
    { path: '/game/environment-layers', label: 'Environment Layers' },
    { path: '/game/ui-hud', label: 'UI / HUD' },
    { path: '/game/character', label: 'Character' },
    { path: '/game/motion-states', label: 'Motion & States' },
    { path: '/game/color-signal-system', label: 'Color & Signal System' },
    { path: '/game/notes-rules', label: 'Notes / Rules' },
    { path: '/game/play', label: 'Play' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0A0A0A] border-b border-gray-800 z-50">
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
        {/* Home Link */}
        <Link
          to="/"
          className="px-3 py-2 text-xs font-['Cambay',sans-serif] text-gray-600 hover:text-white transition-colors whitespace-nowrap mr-2"
        >
          ← Portfolio
        </Link>

        {/* Page Links */}
        {pages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className={`px-3 py-2 rounded text-xs font-['Cambay',sans-serif] transition-colors whitespace-nowrap ${
              isActive(page.path)
                ? 'bg-white text-black'
                : 'text-gray-500 hover:text-white hover:bg-gray-900'
            }`}
          >
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}