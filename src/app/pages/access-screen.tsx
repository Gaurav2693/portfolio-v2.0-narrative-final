import { useState, useEffect, useRef } from "react";
import type React from "react";
import { useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Sun, Moon, Download } from "lucide-react";
import { useTheme } from "@/app/context/theme-context";
import { useSound } from "@/app/context/sound-context";
import { downloadResumePdf } from "@/app/components/resume-download";

const CORRECT_CODE = "5467";

export default function AccessScreen() {
  const [code, setCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { playClick, soundEnabled, volume } = useSound();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  // Play soft success sound
  const playSuccessSound = () => {
    if (!soundEnabled || volume === 0) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a gentle, soft confirmation tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.15); // E5 note
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      setTimeout(() => {
        audioContext.close();
      }, 450);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.toLowerCase().trim() === CORRECT_CODE.toLowerCase()) {
      setIsSuccess(true);
      setErrorMessage("");
      playSuccessSound();
      
      // Navigate to command center after liquid expansion animation
      setTimeout(() => {
        navigate("/");
      }, 700);
    } else {
      setErrorMessage("That code doesn't seem to be correct.");
      setCode("");
      inputRef.current?.focus();
    }
  };

  // Dark/light theme colors
  const bgColor = theme === 'dark' ? '#000000' : '#f5f5f5';
  const cardBgColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const mutedTextColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
  const inputBgColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const inputBorderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
  const liquidColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 px-4`}
      style={{
        backgroundColor: theme === "dark" ? "#ffffff" : "#000000",
      }}
    >
      {/* Theme Toggle Button - Top Right */}
      <motion.button
        onClick={() => {
          playClick();
          toggleTheme();
        }}
        className="absolute top-8 right-20 h-[40px] w-[40px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: cardBgColor,
          color: textColor,
          boxShadow: theme === 'dark' 
            ? '0 2px 12px rgba(255, 255, 255, 0.1)' 
            : '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.button>

      {/* Download Resume Button - Top Right */}
      <motion.button
        onClick={() => { playClick(); downloadResumePdf(); }}
        className="absolute top-8 right-8 h-[40px] w-[40px] flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: cardBgColor,
          color: textColor,
          border: 'none',
          boxShadow: theme === 'dark' 
            ? '0 2px 12px rgba(255, 255, 255, 0.1)' 
            : '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        aria-label="Download resume"
      >
        <Download className="w-5 h-5" />
      </motion.button>

      {/* Success liquid expansion */}
      {isSuccess && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: liquidColor,
            zIndex: 50,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: [0, 0.6, 1],
                  scale: [0, 2, 3],
                  borderRadius: ['50%', '40%', '0%'],
                }
          }
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}

      {/* Card Container - 524x266px */}
      <motion.div
        className="relative z-10 rounded-2xl overflow-hidden"
        style={{
          width: '524px',
          minHeight: '266px',
          backgroundColor: cardBgColor,
          boxShadow: theme === 'dark' 
            ? '0 8px 32px rgba(255, 255, 255, 0.12), 0 2px 8px rgba(255, 255, 255, 0.08)' 
            : '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: theme === 'dark'
            ? [
                '0 8px 32px rgba(255, 255, 255, 0.12), 0 2px 8px rgba(255, 255, 255, 0.08)',
                '0 8px 40px rgba(255, 255, 255, 0.18), 0 2px 12px rgba(255, 255, 255, 0.12)',
                '0 8px 32px rgba(255, 255, 255, 0.12), 0 2px 8px rgba(255, 255, 255, 0.08)',
              ]
            : [
                '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                '0 8px 40px rgba(0, 0, 0, 0.18), 0 2px 12px rgba(0, 0, 0, 0.10)',
                '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
              ]
        }}
        transition={{ 
          duration: 0.5, 
          delay: 0.2,
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {/* Liquid morphing shape - appears on focus */}
        {isFocused && !isSuccess && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: '300px',
              height: '200px',
              backgroundColor: liquidColor,
              filter: 'blur(50px)',
              zIndex: 0,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: [0.5, 1.1, 1],
                    borderRadius: ['50%', '40%', '45%'],
                  }
            }
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 px-12 py-10 flex flex-col items-center text-center">
          {/* Headline */}
          <h1
            className="font-['Caladea',sans-serif] text-[24px] leading-[1.2] mb-3"
            style={{ color: textColor, fontWeight: 600 }}
          >
            This work is meant to be entered deliberately.
          </h1>

          {/* Supporting text */}
          <p
            className="font-['Cambay',sans-serif] text-[13px] leading-[1.5] mb-6"
            style={{ color: mutedTextColor, maxWidth: '380px' }}
          >
            The systems here explore real trade-offs and irreversible decisions. This space is intentionally protected.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
            {/* Label */}
            <label
              htmlFor="access-code"
              className="font-['Cambay',sans-serif] text-[11px] mb-2 block text-left"
              style={{ color: mutedTextColor, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}
            >
              Access code required
            </label>

            {/* Input */}
            <input
              ref={inputRef}
              id="access-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your access code"
              className="font-['Cambay',sans-serif] w-full px-4 py-3 rounded-xl text-[14px] transition-all duration-300 mb-4"
              style={{
                backgroundColor: inputBgColor,
                color: textColor,
                border: `1.5px solid ${isFocused ? textColor : inputBorderColor}`,
                outline: 'none',
              }}
              autoComplete="off"
              autoFocus
            />

            {/* Error message */}
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-['Cambay',sans-serif] text-[12px] mb-4 text-left"
                style={{ color: mutedTextColor }}
              >
                {errorMessage}
              </motion.p>
            )}

            {/* Primary button */}
            <motion.button
              type="submit"
              className="font-['Cambay',sans-serif] w-full px-6 py-3 rounded-xl text-[15px] mb-4 relative overflow-hidden"
              style={{
                backgroundColor: textColor,
                color: cardBgColor,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Liquid fill effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                }}
                initial={{ y: '100%' }}
                animate={
                  shouldReduceMotion
                    ? {}
                    : isButtonHovered
                    ? {
                        y: '0%',
                        transition: {
                          duration: 0.6,
                          ease: [0.65, 0, 0.35, 1],
                        },
                      }
                    : {
                        y: '100%',
                        transition: {
                          duration: 0.4,
                          ease: [0.65, 0, 0.35, 1],
                        },
                      }
                }
              />
              
              {/* Button text */}
              <span className="relative z-10">Enter Dashboard →</span>
            </motion.button>

            {/* Secondary text - Guest access coming soon */}
            <p
              className="font-['Cambay',sans-serif] text-[12px]"
              style={{
                color: mutedTextColor,
              }}
            >
              Guest access · Feature coming soon
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}