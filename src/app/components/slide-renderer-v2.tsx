import { motion } from "motion/react";
import svgPaths from "../../imports/svg-uzk3buezt0";

export function ExecutiveSlideV2() {
  return (
    <div className="relative w-[1155px] h-[661px] bg-[#1e1e1e] rounded-[8px]">
      {/* Icon/Logo - Top Left */}
      <div className="absolute left-[51px] top-[55px]">
        <svg className="w-[156px] h-[132px]" fill="none" preserveAspectRatio="none" viewBox="0 0 156 132">
          <g clipPath="url(#clip0_exec_slide)">
            <path d={svgPaths.p289e1d80} fill="white" />
            <path d={svgPaths.p3b8df900} fill="white" />
            <path d={svgPaths.p163c5a00} fill="white" />
            <path d={svgPaths.p2bb0d00} fill="white" />
            <path d={svgPaths.p20607600} fill="white" />
            <path d={svgPaths.p1bbd4f00} fill="white" />
            <path d={svgPaths.p2da35f00} fill="#00A87C" />
          </g>
          <defs>
            <clipPath id="clip0_exec_slide">
              <rect fill="white" height="132" width="156" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* Title - To the right of icon */}
      <p className="absolute left-[255px] top-[58px] font-['Cambay',sans-serif] font-bold text-[32px] leading-[38.88px] tracking-[0.32px] text-white">
        Price Quotation Engine
      </p>

      {/* Subtitle - Below title */}
      <p className="absolute left-[255px] top-[102px] font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-white">
        Designing clarity inside enterprise complexity
      </p>

      {/* Badge 1: UX Designer / Product Designer */}
      <div className="absolute left-[255px] top-[142px] bg-[#009167] h-[40px] rounded-[8px] flex items-center justify-center px-[16px] gap-[10px]">
        <svg className="w-[18px] h-[18px]" fill="none" preserveAspectRatio="none" viewBox="0 0 25.8334 18.0834">
          <path d={svgPaths.p6587680} fill="white" />
        </svg>
        <span className="font-['Cambay',sans-serif] font-bold text-[16px] leading-[16px] tracking-[0.48px] text-white whitespace-nowrap">
          UX Designer / Product Designer
        </span>
      </div>

      {/* Badge 2: 6 Months - 3px gap from first badge */}
      <div className="absolute left-[569px] top-[142px] bg-[#009167] h-[40px] rounded-[8px] flex items-center justify-center px-[16px] gap-[8px]">
        <svg className="w-[17px] h-[18px]" fill="none" preserveAspectRatio="none" viewBox="0 0 17 18">
          <path d={svgPaths.p12689b00} fill="white" />
        </svg>
        <span className="font-['Cambay',sans-serif] font-bold text-[16px] leading-[16px] tracking-[0.48px] text-white">
          6 Months
        </span>
      </div>

      {/* Divider Line */}
      <div className="absolute left-[51px] top-[210px] w-[1059px] h-[1px] bg-[rgba(255,255,255,0.2)]" />

      {/* Body Text Section */}
      <div className="absolute left-[70px] top-[245px] w-[510px]">
        <p className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-white mb-[16px]">
          Enterprise CPQ systems sit at the intersection of sales, pricing, approvals, billing, and order management — often built on legacy architecture that prioritizes process over people.
        </p>
        <p className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-white mb-[24px]">
          This project re-imagines a legacy CPQ into a modern Price Quotation Engine designed to help sales agents think clearly, act confidently, and quote accurately — even under heavy system constraints.
        </p>
        <p className="font-['Cambay',sans-serif] font-bold text-[16px] leading-[24px] tracking-[0.16px] text-white mb-[12px]">
          The focus was simple:
        </p>
        <ul className="space-y-[6px]">
          <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00FFA3] flex items-start">
            <span className="mr-[8px]">•</span>
            <span>Increase Speed & Accuracy</span>
          </li>
          <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00FFA3] flex items-start">
            <span className="mr-[8px]">•</span>
            <span>Reduce cognitive load</span>
          </li>
          <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00FFA3] flex items-start">
            <span className="mr-[8px]">•</span>
            <span>Preserve flexibility without compromising control</span>
          </li>
        </ul>
      </div>

      {/* Right Side Dashboard Mockup */}
      <div className="absolute left-[644px] top-[245px] w-[439px] h-[298px]">
        {/* Top dark bar */}
        <motion.div
          className="absolute left-0 top-0 w-full h-[45px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        />

        {/* Left Column - Small Bars */}
        <motion.div
          className="absolute left-0 top-[63px] w-[190px] h-[20px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute left-0 top-[91px] w-[190px] h-[20px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        />
        <motion.div
          className="absolute left-0 top-[119px] w-[190px] h-[22px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div
          className="absolute left-0 top-[149px] w-[190px] h-[22px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute left-0 top-[179px] w-[190px] h-[20px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 2.5 }}
        />
        <motion.div
          className="absolute left-0 top-[207px] w-[190px] h-[20px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 3 }}
        />

        {/* Right Column - Green Chart */}
        <motion.div
          className="absolute right-0 top-[63px] w-[200px] h-[164px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
        />

        {/* Bottom dark bar */}
        <motion.div
          className="absolute left-0 top-[245px] w-full h-[45px] rounded-[5px]"
          animate={{ backgroundColor: ["#3d3d3d", "#009167", "#3d3d3d"] }}
          transition={{ duration: 4, repeat: Infinity, delay: 3.5 }}
        />
      </div>
    </div>
  );
}
