import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTheme } from '@/app/context/theme-context';
import { useSound } from '@/app/context/sound-context';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import { Home, Briefcase, Microscope, Sparkles, Play, Mail, Palette, Wrench } from 'lucide-react';

interface NavItem {
  id: string;
  path: string;
  icon: 'home' | 'briefcase' | 'microscope' | 'sparkles' | 'play' | 'mail' | 'palette' | 'wrench';
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', path: '/', icon: 'home', label: 'Command Center' },
  { id: 'prototypes', path: '/prototypes', icon: 'wrench', label: 'Prototypes' },
  { id: 'game', path: '/game/play', icon: 'play', label: 'INERTIA' },
];

/**
 * Global Navigation Sidebar
 * Positioned on the right edge with theme-aware colors and smooth animations
 * Animates in only once when the app first loads
 * Hidden on mobile (<1024px) - MobileBottomNav is used instead
 */
export default function NavigationSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { playClick } = useSound();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(() => {
    return sessionStorage.getItem('navSidebarAnimated') === 'true';
  });
  
  const [showNavigationHint, setShowNavigationHint] = useState(() => {
    return !sessionStorage.getItem('navHintDismissed');
  });

  /* ── Sequential glow-pulse state ──────────────────────────────────
     One-time per session: room dims, each sidebar icon springs to life
     with a bright glow in sequence, then everything returns to normal.
     ────────────────────────────────────────────────────────────────── */
  const [pulseActive, setPulseActive] = useState(false);
  const [roomDimmed, setRoomDimmed] = useState(false);

  useEffect(() => {
    // disabled — pulse animation not yet wired
  }, []);
  
  // Mark the animation as shown after it completes
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('navSidebarAnimated', 'true');
        setHasAnimated(true);
      }, 400); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);
  
  // Auto-dismiss navigation hint after 8 seconds
  useEffect(() => {
    if (showNavigationHint) {
      const timer = setTimeout(() => {
        setShowNavigationHint(false);
        sessionStorage.setItem('navHintDismissed', 'true');
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [showNavigationHint]);
  
  // Dismiss hint on any interaction
  const handleAnyInteraction = () => {
    if (showNavigationHint) {
      setShowNavigationHint(false);
      sessionStorage.setItem('navHintDismissed', 'true');
    }
  };

  // Theme-aware colors
  const sidebarBg = theme === 'dark' ? 'bg-white' : 'bg-black';
  
  const getButtonColors = (itemId: string) => {
    const itemPath = navItems.find(item => item.id === itemId)?.path;
    // For home button, also match legacy routes
    const isActive = itemId === 'home' 
      ? (location.pathname === itemPath || location.pathname === '/')
      : location.pathname === itemPath;
    const isHovered = hoveredId === itemId;
    
    if (theme === 'dark') {
      // Dark theme: white sidebar
      return {
        bg: isActive ? 'bg-black' : isHovered ? 'bg-[#f0f0f0]' : 'bg-white',
        icon: isActive ? 'white' : '#1e1e1e',
      };
    } else {
      // Light theme: black sidebar
      return {
        bg: isActive ? 'bg-white' : isHovered ? 'bg-[#2a2a2a]' : 'bg-black',
        icon: isActive ? 'black' : 'white',
      };
    }
  };

  const handleNavClick = (path: string) => {
    playClick();
    navigate(path);
  };

  const handleItemClick = (item: NavItem) => {
    playClick();
    if (item.path) {
      navigate(item.path);
    }
  };

  const renderIcon = (iconType: string, strokeColor: string) => {
    const iconProps = {
      className: "size-full",
      stroke: strokeColor,
      strokeWidth: 2,
      fill: "none"
    };
    
    switch (iconType) {
      case 'home':
        return <Home {...iconProps} />;
      case 'briefcase':
        return <Briefcase {...iconProps} />;
      case 'microscope':
        return <Microscope {...iconProps} />;
      case 'mail':
        return <Mail {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'play':
        return <Play {...iconProps} />;
      case 'palette':
        return <Palette {...iconProps} />;
      case 'wrench':
        return <Wrench {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <>
        {/* Navigation Hint - Shows on first visit */}
        {showNavigationHint && (
          <div 
            className="hidden lg:block absolute right-[70px] top-[355px] z-[60] pointer-events-none"
            onClick={handleAnyInteraction}
          >
            <div 
              className="relative"
              style={{
                animation: 'fadeInFromLeft 0.6s ease-out 1.5s both',
              }}
            >
              {/* Hint Text Card */}
              <div 
                className="px-4 py-3 rounded-xl shadow-2xl"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <p 
                  className="font-['Cambay',sans-serif] font-bold text-[14px] whitespace-nowrap"
                  style={{ 
                    color: theme === 'dark' ? '#000000' : '#ffffff',
                  }}
                >
                  Explore my work →
                </p>
              </div>
              
              {/* Pulsing Ring Animation */}
              <div 
                className="absolute right-[-24px] top-[50%] w-[40px] h-[40px] rounded-full"
                style={{
                  transform: 'translateY(-50%)',
                  border: `2px solid ${theme === 'dark' ? '#ffffff' : '#000000'}`,
                  animation: 'pulseRing 2s ease-out infinite',
                }}
              />
            </div>
          </div>
        )}

        {/* Pulsing Glow Behind Sidebar - Shows on first visit */}
        {showNavigationHint && (
          <div 
            className="hidden lg:block absolute right-0 top-[315px] w-[46px] h-[329px] rounded-bl-[11px] rounded-tl-[11px] pointer-events-none z-[45]"
            style={{
              background: theme === 'dark' 
                ? 'radial-gradient(circle at center, rgba(255, 255, 255, 0.4), transparent 70%)'
                : 'radial-gradient(circle at center, rgba(0, 0, 0, 0.3), transparent 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* ── Room dim overlay during pulse sequence ─────────────── */}
        {/* disabled — pulse not active on this component */}

        <div 
          className={`hidden lg:block absolute ${sidebarBg} h-[329px] right-0 rounded-bl-[11px] rounded-tl-[11px] top-[315px] w-[46px] shadow-lg transition-all duration-300 ease-in-out z-50`}
          style={{ 
            animation: hasAnimated ? 'none' : 'slideInFromRight 0.4s ease-out'
          }}
          onClick={handleAnyInteraction}
          onMouseEnter={handleAnyInteraction}
        >
          <div className="relative h-full">
            {navItems.map((item, index) => {
              const colors = getButtonColors(item.id);
              const topPosition = 10 + (index * 40);
              const pulseDelay = `${index * 350}ms`;

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`absolute ${colors.bg} rounded-[7px] size-[32px] left-[7px] hover:scale-105 active:scale-95`}
                      style={{
                        top: `${topPosition}px`,
                        transition: 'all 200ms ease-in-out',
                      }}
                      aria-label={item.label}
                    >
                      <div className="absolute left-[5.5px] size-[21px] top-[5.5px]">
                        {renderIcon(item.icon, colors.icon)}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <style>{`
            @keyframes slideInFromRight {
              from {
                transform: translateX(100px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes fadeInFromLeft {
              from {
                transform: translateX(-20px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes pulseRing {
              0% {
                transform: translateY(-50%) scale(0.5);
                opacity: 0.5;
              }
              50% {
                transform: translateY(-50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateY(-50%) scale(0.5);
                opacity: 0.5;
              }
            }
            
            @keyframes pulseGlow {
              0% { opacity: 0.3; }
              50% { opacity: 0.5; }
              100% { opacity: 0.3; }
            }

            @keyframes navIconSpringPulse {
              0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(232,80,26,0);
                filter: brightness(1);
              }
              18% {
                transform: scale(1.35);
                box-shadow: 0 0 20px 8px rgba(232,80,26,0.7), 0 0 50px 16px rgba(232,80,26,0.25);
                filter: brightness(1.6);
              }
              40% {
                transform: scale(0.9);
                box-shadow: 0 0 10px 4px rgba(232,80,26,0.3);
                filter: brightness(1.2);
              }
              58% {
                transform: scale(1.1);
                box-shadow: 0 0 12px 5px rgba(232,80,26,0.2);
                filter: brightness(1.1);
              }
              75% {
                transform: scale(0.97);
                box-shadow: 0 0 5px 2px rgba(232,80,26,0.08);
                filter: brightness(1.03);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(232,80,26,0);
                filter: brightness(1);
              }
            }

            @keyframes navGlowRing {
              0% {
                transform: scale(0.5);
                opacity: 0.5;
              }
              50% {
                transform: scale(1);
                opacity: 1;
              }
              100% {
                transform: scale(0.5);
                opacity: 0.5;
              }
            }
          `}</style>
        </div>
      </>
    </TooltipProvider>
  );
}