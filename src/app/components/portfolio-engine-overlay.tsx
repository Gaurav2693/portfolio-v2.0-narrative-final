import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Microscope, Gamepad2 } from 'lucide-react';
import { useTheme } from '@/app/context/theme-context';
import { useSound } from '@/app/context/sound-context';
import FooterDisclaimer from '@/app/components/footer-disclaimer';

interface PortfolioEngineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PortfolioEngineOverlay({ isOpen, onClose }: PortfolioEngineOverlayProps) {
  const { theme } = useTheme();
  const { playClick } = useSound();

  // Theme colors
  const bgColor = theme === 'dark' ? '#000000' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#0a0a0a';
  const mutedColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  const borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const cardBg = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const accentColor = theme === 'dark' ? '#4ade80' : '#22c55e';
  const accentColorSubtle = theme === 'dark' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(34, 197, 94, 0.1)';

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    playClick();
    onClose();
  };

  const techStack = [
    'Figma Make',
    'React',
    'Tailwind',
    'Rive',
    'Interactive Prototyping'
  ];

  const experimentalModules = [
    {
      title: 'Thinking Models Canvas',
      description: 'Interactive framework for testing AI reasoning patterns',
      icon: <Sparkles className="w-6 h-6" strokeWidth={2} />,
    },
    {
      title: 'Game Interaction Lab',
      description: 'Physics-based game mechanics for exploring constraint design',
      icon: <Gamepad2 className="w-6 h-6" strokeWidth={2} />,
    },
    {
      title: 'Evidence & Metrics',
      description: 'Exploratory studies and decision-making frameworks',
      icon: <Microscope className="w-6 h-6" strokeWidth={2} />,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Overlay Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full z-[101] overflow-y-auto"
            style={{
              backgroundColor: bgColor,
              width: '600px',
              maxWidth: '90vw',
              boxShadow: theme === 'dark' 
                ? '-20px 0 60px rgba(0, 0, 0, 0.5)' 
                : '-20px 0 60px rgba(0, 0, 0, 0.15)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              duration: 0.4, 
              ease: [0.22, 1, 0.36, 1] // ease-out cubic bezier
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-8 right-8 p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: cardBg,
                color: textColor,
              }}
              aria-label="Close overlay"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Content */}
            <div className="px-12 py-16 space-y-12">
              {/* Section 1: Title */}
              <motion.section
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative">
                  <h1 
                    className="font-['Caladea',serif] text-[48px] leading-tight relative z-10"
                    style={{ color: textColor }}
                  >
                    Portfolio Engine
                  </h1>
                  {/* Subtle green glow accent */}
                  <div 
                    className="absolute -left-2 top-0 w-1 h-full rounded-full"
                    style={{ 
                      backgroundColor: accentColor,
                      boxShadow: `0 0 20px ${accentColorSubtle}, 0 0 40px ${accentColorSubtle}`
                    }}
                  />
                </div>
                <p 
                  className="font-['Cambay',sans-serif] text-[18px] leading-[28px]"
                  style={{ color: mutedColor }}
                >
                  This portfolio is designed as a living product — not just a showcase.
                </p>
              </motion.section>

              {/* Divider */}
              <div 
                className="h-[1px]"
                style={{ backgroundColor: borderColor }}
              />

              {/* Section 2: Design Philosophy */}
              <motion.section
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 
                  className="font-['Caladea',serif] text-[32px] leading-tight"
                  style={{ color: textColor }}
                >
                  Design Philosophy
                </h2>
                <p 
                  className="font-['Cambay',sans-serif] text-[16px] leading-[26px]"
                  style={{ color: mutedColor }}
                >
                  I believe in constraint-driven design and systems thinking. Every interaction 
                  in this portfolio reflects principles I apply to enterprise product design: 
                  clarity over decoration, intention over trend, and performance over complexity. 
                  This platform serves as both a demonstration of approach and a testing ground 
                  for concepts before they reach production systems.
                </p>
              </motion.section>

              {/* Section 3: Technical Stack */}
              <motion.section
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 
                  className="font-['Caladea',serif] text-[32px] leading-tight"
                  style={{ color: textColor }}
                >
                  Technical Stack
                </h2>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech, index) => (
                    <motion.div
                      key={tech}
                      className="px-4 py-2 rounded-lg font-['Cambay',sans-serif] text-[14px] font-medium"
                      style={{
                        backgroundColor: cardBg,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    >
                      {tech}
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Section 4: Experimental Modules */}
              <motion.section
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 
                  className="font-['Caladea',serif] text-[32px] leading-tight"
                  style={{ color: textColor }}
                >
                  Experimental Modules
                </h2>
                <div className="space-y-4">
                  {experimentalModules.map((module, index) => (
                    <motion.div
                      key={module.title}
                      className="p-6 rounded-2xl space-y-3 relative overflow-hidden"
                      style={{
                        backgroundColor: cardBg,
                        border: `1px solid ${borderColor}`,
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {/* Subtle green gradient overlay on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `linear-gradient(135deg, ${accentColorSubtle} 0%, transparent 50%)`,
                          opacity: 0,
                        }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div 
                        className="flex items-center gap-3 relative z-10"
                        style={{ color: accentColor }}
                      >
                        {module.icon}
                        <h3 
                          className="font-['Cambay',sans-serif] font-bold text-[18px]"
                          style={{ color: textColor }}
                        >
                          {module.title}
                        </h3>
                      </div>
                      <p 
                        className="font-['Cambay',sans-serif] text-[15px] leading-[24px] relative z-10"
                        style={{ color: mutedColor }}
                      >
                        {module.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Section 5: Closing Statement */}
              <motion.section
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <p 
                  className="font-['Cambay',sans-serif] text-[16px] leading-[26px] italic"
                  style={{ color: mutedColor }}
                >
                  "This platform helps me test ideas before applying them to enterprise product design."
                </p>
              </motion.section>

              {/* Footer Disclaimer */}
              <FooterDisclaimer />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}