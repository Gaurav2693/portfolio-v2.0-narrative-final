import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Volume2, Sun, Moon, Download, Info } from "lucide-react";
import { useTheme } from "@/app/context/theme-context";
import { useSound } from "@/app/context/sound-context";
import VolumeControl from "@/app/components/volume-control";
import PortfolioEngineOverlay from "@/app/components/portfolio-engine-overlay";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";
import { downloadResumePdf } from "./resume-download";

export default function Header() {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { playClick } = useSound();
  const [hasAnimated, setHasAnimated] = useState(() => {
    // Check if the animation has already been shown during this session
    return sessionStorage.getItem('headerAnimated') === 'true';
  });
  
  // Mark the animation as shown after it completes
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('headerAnimated', 'true');
        setHasAnimated(true);
      }, 600); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);
  
  // Theme-aware colors
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const strokeColor = theme === 'dark' ? 'white' : 'black';
  
  return (
    <TooltipProvider delayDuration={300}>
      {/* Logo */}
      <div 
        className={`absolute flex items-center h-[57px] left-[67px] top-[42px] font-['Coiny',sans-serif] text-[32px] tracking-[0.32px] ${textColor}`}
        style={{
          animation: hasAnimated ? 'none' : 'fadeInUp 0.5s ease-out 0.2s both'
        }}
      >
        <Link to="/" onClick={playClick} className="relative">
          <span className="gradient-text">GauravMishra.design</span>
        </Link>
      </div>
      
      {/* Navigation Container - Only Volume and Theme Controls */}
      <div 
        className="absolute right-[67px] top-[50px] flex items-center gap-[16px]"
        style={{
          animation: hasAnimated ? 'none' : 'fadeIn 0.5s ease-out 0.3s both'
        }}
      >
        {/* Volume Control Group - Volume Icon + Slider */}
        <div 
          className="relative flex items-center gap-[8px]"
          onMouseEnter={() => setIsVolumeHovered(true)}
          onMouseLeave={() => setIsVolumeHovered(false)}
        >
          {/* Volume Control Slider */}
          <VolumeControl isVisible={isVolumeHovered} />
          
          {/* Volume Icon Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`relative h-[32px] w-[32px] flex items-center justify-center rounded-full ${textColor} hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                aria-label="Volume control"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust volume</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Theme Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleTheme}
              className={`relative h-[32px] w-[32px] flex items-center justify-center rounded-full ${textColor} hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
          </TooltipContent>
        </Tooltip>

        {/* Download Resume Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { playClick(); downloadResumePdf(); }}
              className={`relative h-[32px] w-[32px] flex items-center justify-center rounded-full ${textColor} hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer`}
              style={{ background: 'none', border: 'none' }}
              aria-label="Download resume"
            >
              <Download className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download Resume</p>
          </TooltipContent>
        </Tooltip>

        {/* Portfolio Engine Info Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOverlayOpen(true)}
              className={`relative h-[32px] w-[32px] flex items-center justify-center rounded-full ${textColor} hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              aria-label="Portfolio Engine Info"
            >
              <Info className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Portfolio Engine Info</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* Horizontal Line (header divider) */}
      <div 
        className="absolute h-0 left-[56px] top-[122px] w-[1204px]"
        style={{
          animation: hasAnimated ? 'none' : 'fadeIn 0.5s ease-out 0.1s both'
        }}
      >
        <div className="absolute inset-[-0.5px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1204 0.5">
            <line className="animate-drawLine" stroke={strokeColor} strokeWidth="0.5" x2="1204" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>

      {/* Portfolio Engine Overlay */}
      <PortfolioEngineOverlay isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </TooltipProvider>
  );
}
