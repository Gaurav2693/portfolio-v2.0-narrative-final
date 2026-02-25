import { useTheme } from '@/app/context/theme-context';

interface FooterDisclaimerProps {
  className?: string;
}

export default function FooterDisclaimer({ className = '' }: FooterDisclaimerProps) {
  const { theme } = useTheme();
  
  // Theme-aware colors
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const mutedTextColor = theme === 'dark' ? 'text-white/50' : 'text-black/50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/10';
  
  return (
    <div className={`border-t ${borderColor} pt-[16px] ${className}`}>
      <div className="flex flex-col gap-[12px]">
        <h4 className={`font-['Cambay',sans-serif] font-bold text-[11px] uppercase tracking-[0.8px] ${textColor}`}>
          Disclaimer
        </h4>
        
        <div className="flex flex-col gap-[10px]">
          <p className={`font-['Cambay',sans-serif] text-[11px] leading-[16px] tracking-[0.11px] ${mutedTextColor}`}>
            Some projects presented here include conceptual work, reconstructed case studies, or sanitized versions of enterprise experiences to respect confidentiality agreements.
          </p>
          
          <p className={`font-['Cambay',sans-serif] text-[11px] leading-[16px] tracking-[0.11px] ${mutedTextColor}`}>
            All work reflects my design thinking, process, and contributions unless otherwise specified.
          </p>
          
          <p className={`font-['Cambay',sans-serif] text-[11px] leading-[16px] tracking-[0.11px] ${mutedTextColor}`}>
            Unauthorized reproduction or redistribution of this content is not permitted.
          </p>
          
          <p className={`font-['Cambay',sans-serif] text-[10px] leading-[15px] tracking-[0.1px] ${mutedTextColor} italic mt-[4px]`}>
            Certain explorations were developed with AI-assisted prototyping tools as part of my design experimentation workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
