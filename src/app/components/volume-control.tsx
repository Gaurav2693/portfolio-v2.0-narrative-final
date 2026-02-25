import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '@/app/context/theme-context';
import { useSound } from '@/app/context/sound-context';

interface VolumeControlProps {
  isVisible: boolean;
}

export default function VolumeControl({ isVisible }: VolumeControlProps) {
  const [volume, setVolume] = useState(7); // 0-10 scale
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { playClick, setVolume: setContextVolume } = useSound();
  
  const steps = 10;
  const stepWidth = 100 / steps; // percentage per step

  // Theme-aware colors
  const sliderBg = theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#d5d5d5]';
  const sliderTrack = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#e5e5e5]';
  const handleBg = theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-[#2a2a2a]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const barActive = theme === 'dark' ? 'bg-white' : 'bg-black';
  const barInactive = theme === 'dark' ? 'bg-white/20' : 'bg-black/20';
  const screwColor = theme === 'dark' ? 'bg-white/30' : 'bg-black/30';
  const borderColor = theme === 'dark' ? 'border-white/20' : 'border-black/20';

  useEffect(() => {
    // Update context volume (0-1 range)
    setContextVolume(volume / 10);
  }, [volume, setContextVolume]);

  const handleInteraction = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const handleWidth = 20; // Width of the handle (scaled down from 40)
    const usableWidth = rect.width - handleWidth;
    const offsetX = clientX - rect.left - (handleWidth / 2);
    const percentage = Math.max(0, Math.min(100, (offsetX / usableWidth) * 100));
    
    // Snap to nearest step
    const newStep = Math.round((percentage / 100) * steps);
    const clampedStep = Math.max(0, Math.min(steps, newStep));
    
    if (clampedStep !== volume) {
      setVolume(clampedStep);
      playClick(); // Satisfying click on each step
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, volume]);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleInteraction(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`select-none transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[20px] pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slider Container - Scaled to 50% */}
      <div 
        ref={sliderRef}
        className={`relative w-[140px] h-[30px] ${sliderBg} rounded-[4px] border ${borderColor} shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] cursor-pointer transition-all duration-200 ${isHovered ? 'shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Decorative corner screws - scaled down */}
        <div className={`absolute top-[3px] left-[3px] w-[3px] h-[3px] rounded-full ${screwColor}`}>
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-[1.5px] h-[0.25px] ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`} />
          </div>
        </div>
        <div className={`absolute top-[3px] right-[3px] w-[3px] h-[3px] rounded-full ${screwColor}`}>
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-[0.25px] h-[1.5px] ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`} />
          </div>
        </div>
        <div className={`absolute bottom-[3px] left-[3px] w-[3px] h-[3px] rounded-full ${screwColor}`}>
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-[1.5px] h-[0.25px] ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'} rotate-45`} />
          </div>
        </div>
        <div className={`absolute bottom-[3px] right-[3px] w-[3px] h-[3px] rounded-full ${screwColor}`}>
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`w-[0.25px] h-[1.5px] ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'} rotate-45`} />
          </div>
        </div>

        {/* Track with notches - scaled down */}
        <div className={`absolute left-[10px] right-[10px] top-1/2 -translate-y-1/2 h-[12px] ${sliderTrack} rounded-[2px] shadow-[inset_0_0.5px_1.5px_rgba(0,0,0,0.5)]`}>
          {/* Step indicator bars */}
          <div className="absolute inset-0 flex items-center justify-around px-[4px]">
            {Array.from({ length: steps }).map((_, index) => (
              <div
                key={index}
                className={`w-[1.5px] h-[7px] rounded-[0.5px] transition-all duration-150 ${
                  index < volume ? barActive : barInactive
                } ${index < volume ? 'shadow-[0_0_2px_currentColor]' : ''}`}
                style={{
                  transform: index < volume ? 'scaleY(1.1)' : 'scaleY(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Tick marks - scaled down */}
        <div className="absolute left-[10px] right-[10px] top-[2px] flex justify-between px-[2px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`text-[6px] font-['Cambay',sans-serif] font-bold ${textColor} opacity-40`}
            >
              {index * 2}
            </div>
          ))}
        </div>

        {/* Draggable Handle - scaled down */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-[20px] h-[24px] ${handleBg} rounded-[3px] border ${borderColor} shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-100 ${
            isDragging ? 'scale-105 shadow-[0_3px_6px_rgba(0,0,0,0.4)]' : ''
          } ${isHovered && !isDragging ? 'scale-102' : ''}`}
          style={{
            left: `calc(${(volume / steps) * 100}% - 10px + 10px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Handle grip lines - scaled down */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.5px]">
            <div className={`w-[10px] h-[1px] rounded-full ${theme === 'dark' ? 'bg-white/30' : 'bg-black/30'}`} />
            <div className={`w-[10px] h-[1px] rounded-full ${theme === 'dark' ? 'bg-white/30' : 'bg-black/30'}`} />
            <div className={`w-[10px] h-[1px] rounded-full ${theme === 'dark' ? 'bg-white/30' : 'bg-black/30'}`} />
          </div>

          {/* Handle indicator dot - scaled down */}
          <div className={`absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[2px] h-[2px] rounded-full ${volume === 0 ? 'bg-red-500' : barActive} ${volume > 0 ? 'shadow-[0_0_3px_currentColor]' : ''}`} />
        </div>

        {/* Volume number display - scaled down */}
        <div className={`absolute -bottom-[12px] left-1/2 -translate-x-1/2 text-[8px] font-['Cambay',sans-serif] font-bold ${textColor} opacity-60 transition-opacity duration-200 ${isHovered || isDragging ? 'opacity-100' : ''}`}>
          {volume * 10}%
        </div>
      </div>
    </div>
  );
}
