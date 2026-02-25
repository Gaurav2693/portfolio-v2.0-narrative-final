import { motion } from "motion/react";
import { useState, useEffect } from "react";
import cpqScreenshot from "figma:asset/457a2961d273570c4cdf85e4d500a2b73eb24fe7.png";
import exiroScreenshot from "figma:asset/9eea0ee67707096baa56a8233c3151f51fd92eb3.png";
import pqeWorkflowScreenshot from "figma:asset/df0bd6dfbddb1e5479b132edde875ab131bddca1.png";
import svgPaths from "../../imports/svg-pqms248kqa";
import { ExecutiveSlideV2 } from "./slide-renderer-v2";
import { ExiroExecutiveSlide } from "./exiro-executive-slide";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SlideRendererProps {
  content: any;
}

export function SlideRenderer({ content }: SlideRendererProps) {
  if (!content) return null;

  switch (content.type) {
    case "executive-v2":
      return <ExecutiveSlideV2 />;

    case "exiro-executive":
      return <ExiroExecutiveSlide />;

    case "executive-OLD-v2":
      return (
        <div className="relative w-full h-full min-h-[600px] bg-[#1e1e1e] rounded-[8px] overflow-hidden">
          {/* Icon/Logo */}
          <div className="absolute left-[64px] top-[72px]">
            <svg className="w-[156px] h-[132px]" fill="none" preserveAspectRatio="none" viewBox="0 0 156 132">
              <g clipPath="url(#clip0_exec_v2)">
                <path d={svgPaths.p289e1d80} fill="white" />
                <path d={svgPaths.p3b8df900} fill="white" />
                <path d={svgPaths.p163c5a00} fill="white" />
                <path d={svgPaths.p2bb0d00} fill="white" />
                <path d={svgPaths.p20607600} fill="white" />
                <path d={svgPaths.p1bbd4f00} fill="white" />
                <path d={svgPaths.p2da35f00} fill="#00A87C" />
              </g>
              <defs>
                <clipPath id="clip0_exec_v2">
                  <rect fill="white" height="132" width="156" />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Title */}
          <p className="absolute left-[255px] top-[75px] font-['Cambay',sans-serif] font-bold text-[32px] leading-[38.88px] tracking-[0.32px] text-white w-[678px]">
            Price Quotation Engine
          </p>

          {/* Subtitle - Centered */}
          <p className="absolute left-[362.5px] top-[121px] font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-white text-center -translate-x-1/2">
            Designing clarity inside enterprise complexity
          </p>

          {/* Badge 1 */}
          <div className="absolute left-[255px] top-[161px] w-[301px] h-[40px] bg-[#009167] rounded-[8px] flex items-center px-[16px] gap-[10px]">
            <svg className="w-[25.8334px] h-[18.0834px]" fill="none" preserveAspectRatio="none" viewBox="0 0 25.8334 18.0834">
              <path d={svgPaths.p6587680} fill="white" />
            </svg>
            <span className="font-['Cambay',sans-serif] font-bold text-[16px] leading-[38.88px] tracking-[0.48px] text-white">
              UX Designer / Product Designer
            </span>
          </div>

          {/* Badge 2 */}
          <div className="absolute left-[566px] top-[161px] w-[142px] h-[40px] bg-[#009167] rounded-[8px] flex items-center justify-center px-[16px] gap-[8px]">
            <svg className="w-[17px] h-[18px]" fill="none" preserveAspectRatio="none" viewBox="0 0 17 18">
              <path d={svgPaths.p12689b00} fill="white" />
            </svg>
            <span className="font-['Cambay',sans-serif] font-bold text-[16px] leading-[38.88px] tracking-[0.48px] text-white">
              6 Months
            </span>
          </div>

          {/* Divider */}
          <div className="absolute left-[51px] top-[229px] w-[1059px] h-[1px] bg-[rgba(255,255,255,0.2)]" />

          {/* Body Content */}
          <div className="absolute left-[70px] top-[264px] w-[510px]">
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
              <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00A87C] flex items-start">
                <span className="mr-[8px]">•</span>
                <span>Increase Speed & Accuracy</span>
              </li>
              <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00A87C] flex items-start">
                <span className="mr-[8px]">•</span>
                <span>Reduce cognitive load</span>
              </li>
              <li className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00A87C] flex items-start">
                <span className="mr-[8px]">•</span>
                <span>Preserve flexibility without compromising control</span>
              </li>
            </ul>
          </div>

          {/* Right Side Dashboard - Positioned at exact coordinates */}
          <div className="absolute left-[644px] top-[264px] w-[439px] h-[298px]">
            {/* Top Bar */}
            <motion.div
              className="absolute left-0 top-0 w-[439px] h-[47.893px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 20px rgba(0,168,124,0.5)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 0 }}
            />

            {/* Small bars - left column with exact positioning */}
            <motion.div
              className="absolute left-0 top-[58.54px] w-[216.016px] h-[23.06px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute left-0 top-[90.46px] w-[216.016px] h-[23.06px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute left-0 top-[120.62px] w-[216.016px] h-[24.833px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            />
            <motion.div
              className="absolute left-0 top-[152.55px] w-[216.016px] h-[24.833px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
            />
            <motion.div
              className="absolute left-0 top-[184.48px] w-[216.016px] h-[23.06px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 2.5 }}
            />
            <motion.div
              className="absolute left-0 top-[216.4px] w-[216.016px] h-[23.06px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 25px rgba(0,168,124,0.8)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 3 }}
            />

            {/* Green Chart - right column */}
            <motion.div
              className="absolute left-[229px] top-[58.79px] w-[210px] h-[180.422px] bg-[#009167] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 30px rgba(0,168,124,0.6)", "0 0 60px rgba(0,168,124,1)", "0 0 30px rgba(0,168,124,0.6)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Bottom Bar */}
            <motion.div
              className="absolute left-0 top-[250.11px] w-[439px] h-[47.893px] bg-[#2c2c2c] rounded-[5px]"
              animate={{
                boxShadow: ["0 0 0px rgba(0,168,124,0)", "0 0 20px rgba(0,168,124,0.5)", "0 0 0px rgba(0,168,124,0)"]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 3.5 }}
            />

            {/* Moving radial light across the entire dashboard group */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-[5px] overflow-hidden"
              style={{
                background: "radial-gradient(circle 200px at 50% 50%, rgba(0,168,124,0.5) 0%, transparent 70%)"
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      );

    case "executive":
      return (
        <div className="flex flex-col gap-[24px]">
          <div className="flex items-center gap-[32px]">
            <div className="flex-1">
              <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px] mb-[12px]">
                <span className="text-[rgba(255,255,255,0.6)]">Role:</span> {content.role}
              </p>
              <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px] mb-[12px]">
                <span className="text-[rgba(255,255,255,0.6)]">Duration:</span> {content.duration}
              </p>
              <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
                <span className="text-[rgba(255,255,255,0.6)]">Domain:</span> {content.domain}
              </p>
            </div>
          </div>
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          <p className="font-['Cambay',sans-serif] font-bold text-[20px] text-white leading-[26px] tracking-[0.2px]">
            {content.impact}
          </p>
        </div>
      );

    case "problem":
      return (
        <div className="flex flex-col gap-[20px]">
          <p className="font-['Cambay',sans-serif] text-[18px] text-white leading-[23.4px] tracking-[0.18px]">
            {content.description}
          </p>
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          
          {content.surfaceIssues && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.6)] mb-[12px] tracking-[0.14px]">
                  Surface-level symptoms:
                </p>
                <div className="flex gap-[12px]">
                  {content.surfaceIssues.map((issue: string, idx: number) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[12px] py-[6px]">
                      <p className="font-['Cambay',sans-serif] text-[14px] text-white tracking-[0.14px]">
                        {issue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.rootCause && (
            <>
              <div className="bg-[rgba(255,176,51,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FFB033] mb-[12px] tracking-[0.16px]">
                  {content.rootCause.title}
                </p>
                <ul className="space-y-[8px]">
                  {content.rootCause.items.map((item: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.failures && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[16px] tracking-[0.16px]">
                  Failures Observed
                </p>
                <div className="grid grid-cols-3 gap-[12px]">
                  {content.failures.map((failure: any, idx: number) => (
                    <div key={idx} className="bg-[rgba(255,68,68,0.1)] rounded-[6px] p-[12px]">
                      <p className="font-['Cambay',sans-serif] font-bold text-[14px] text-[#FF4444] mb-[6px] tracking-[0.14px]">
                        {failure.label}
                      </p>
                      <p className="font-['Cambay',sans-serif] text-[12px] text-[rgba(255,255,255,0.8)] leading-[15.6px] tracking-[0.12px]">
                        {failure.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.closingStatement && (
            <p className="font-['Cambay',sans-serif] font-bold text-[17px] text-white leading-[22.1px] tracking-[0.17px] italic">
              {content.closingStatement}
            </p>
          )}
          
          <ul className="space-y-[16px]">
            {content.bullets?.map((bullet: string, idx: number) => (
              <li key={idx} className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px] flex items-start">
                <span className="mr-[12px]">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "context":
      return (
        <div className="flex flex-col gap-[24px]">
          {content.description && (
            <>
              <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
                {content.description}
              </p>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.businessRisk && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                  Business Risk
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] leading-[18.2px] tracking-[0.14px]">
                  {content.businessRisk}
                </p>
              </div>
              
              {content.emphasis && (
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FFB033] leading-[20.8px] tracking-[0.16px] italic">
                  {content.emphasis}
                </p>
              )}
              
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.users && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[24px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[16px] tracking-[0.16px]">
                  Primary Users
                </p>
                <div className="grid grid-cols-2 gap-[16px]">
                  {content.users.map((user: any, idx: number) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.05)] rounded-[6px] p-[16px]">
                      <p className="font-['Cambay',sans-serif] font-bold text-[14px] text-white mb-[8px] tracking-[0.14px]">
                        {user.role}
                      </p>
                      <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.6)] mb-[8px] tracking-[0.13px]">
                        {user.responsibilities}
                      </p>
                      <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px]">
                        {user.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-[12px]">
                {content.userCharacteristics && (
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                    <span className="font-bold">User Profile:</span> {content.userCharacteristics}
                  </p>
                )}
                {content.userRisk && (
                  <p className="font-['Cambay',sans-serif] text-[14px] text-[#FFB033] leading-[18.2px] tracking-[0.14px]">
                    <span className="font-bold">Risk:</span> {content.userRisk}
                  </p>
                )}
              </div>
              
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[24px]">
            <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[16px] tracking-[0.16px]">
              Decision Flow
            </p>
            <div className="flex items-center gap-[16px]">
              {content.flowSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex items-center gap-[16px] flex-1">
                  <div className={`flex-1 rounded-[4px] p-[12px] ${idx === 1 ? 'bg-[rgba(0,168,124,0.2)]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
                    <p className="font-['Cambay',sans-serif] text-[14px] text-white tracking-[0.14px]">{step}</p>
                  </div>
                  {idx < content.flowSteps.length - 1 && <div className="text-white">→</div>}
                </div>
              ))}
            </div>
          </div>
          
          {content.riskZone && (
            <>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
              <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
                <span className="font-bold">Risk Zone:</span> {content.riskZone}
              </p>
            </>
          )}
        </div>
      );

    case "signals":
      return (
        <div className="flex flex-col gap-[20px]">
          {content.leadershipMetrics && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                  Leadership Success Metrics
                </p>
                <ul className="space-y-[8px]">
                  {content.leadershipMetrics.map((metric: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                  UX Success Signals
                </p>
                <ul className="space-y-[8px]">
                  {content.uxSignals?.map((signal: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.baselineInsight && (
            <>
              <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] leading-[18.2px] tracking-[0.14px]">
                <span className="font-bold">Baseline:</span> {content.baselineInsight}
              </p>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.criticalElements && (
            <>
              <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[16px] tracking-[0.16px]">
                  Critical UI Elements
                </p>
                <div className="space-y-[12px]">
                  {content.criticalElements.map((element: any, idx: number) => (
                    <div key={idx}>
                      <p className="font-['Cambay',sans-serif] font-bold text-[14px] text-white mb-[4px] tracking-[0.14px]">
                        {element.name}
                      </p>
                      <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px]">
                        {element.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {content.confidenceStatement && (
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white leading-[20.8px] tracking-[0.16px] italic">
                  {content.confidenceStatement}
                </p>
              )}
              
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.items?.map((item: any, idx: number) => (
            <div key={idx} className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[8px] tracking-[0.16px]">
                {item.label}
              </p>
              <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] leading-[18.2px] tracking-[0.14px]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      );

    case "principles":
      return (
        <div className="flex flex-col gap-[20px]">
          <p className="font-['Cambay',sans-serif] text-[16px] text-[rgba(255,255,255,0.8)] leading-[20.8px] tracking-[0.16px] mb-[8px]">
            {content.intro}
          </p>
          <div className="space-y-[16px]">
            {content.principles?.map((principle: any, idx: number) => (
              <div key={idx} className="flex items-start gap-[16px]">
                <div className="size-[8px] rounded-full bg-[#00A87C] flex-shrink-0 mt-[6px]" />
                <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
                  <span className="font-bold">{principle.title}</span> — {principle.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "explorations":
      return (
        <div className="flex flex-col gap-[24px]">
          {content.items?.map((item: any, idx: number) => (
            <div key={idx} className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                {item.title}
              </p>
              <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] leading-[18.2px] tracking-[0.14px] mb-[12px]">
                {item.description}
              </p>
              <p className="font-['Cambay',sans-serif] text-[14px] text-[#FFB033] leading-[18.2px] tracking-[0.14px]">
                <span className="font-bold">Rejected:</span> {item.rejection}
              </p>
            </div>
          ))}
        </div>
      );

    case "feature-improvement":
      return (
        <div className="flex flex-col gap-[24px]">
          <div className="grid grid-cols-2 gap-[20px]">
            <div className="bg-[rgba(255,68,68,0.1)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FF4444] mb-[12px] tracking-[0.16px]">
                Before
              </p>
              <ul className="space-y-[8px]">
                {content.before?.map((item: string, idx: number) => (
                  <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                    <span className="mr-[12px]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[12px] tracking-[0.16px]">
                After
              </p>
              <ul className="space-y-[8px]">
                {content.after?.map((item: string, idx: number) => (
                  <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                    <span className="mr-[12px]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          
          {content.omtExperience && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                  {content.omtExperience.title}
                </p>
                <ul className="space-y-[8px]">
                  {content.omtExperience.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.outcome && (
            <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[12px] tracking-[0.16px]">
                {content.outcome.title}
              </p>
              <div className="flex gap-[16px]">
                {content.outcome.results?.map((result: string, idx: number) => (
                  <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[16px] py-[8px]">
                    <p className="font-['Cambay',sans-serif] text-[14px] text-white tracking-[0.14px]">
                      {result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case "design-decisions":
      return (
        <div className="flex flex-col gap-[24px]">
          <div>
            <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] mb-[12px] tracking-[0.14px]">
              {content.decisionsIntro}
            </p>
            <div className="space-y-[8px]">
              {content.decisions?.map((decision: string, idx: number) => (
                <div key={idx} className="flex items-center gap-[12px]">
                  <div className="size-[6px] rounded-full bg-[#00A87C] flex-shrink-0" />
                  <p className="font-['Cambay',sans-serif] text-[15px] text-white tracking-[0.15px]">
                    {decision}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          
          {content.tradeoffs && (
            <>
              <div className="bg-[rgba(255,176,51,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FFB033] mb-[12px] tracking-[0.16px]">
                  {content.tradeoffs.title}
                </p>
                <div className="space-y-[8px]">
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                    <span className="font-bold">Challenge:</span> {content.tradeoffs.challenge}
                  </p>
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                    <span className="font-bold">Resolution:</span> {content.tradeoffs.resolution}
                  </p>
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                    <span className="font-bold">Retention:</span> {content.tradeoffs.retention}
                  </p>
                </div>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.defendedDecision && (
            <>
              <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[8px] tracking-[0.16px]">
                  {content.defendedDecision.title}
                </p>
                <p className="font-['Cambay',sans-serif] font-bold text-[15px] text-white mb-[8px] tracking-[0.15px]">
                  {content.defendedDecision.decision}
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] leading-[18.2px] tracking-[0.14px] mb-[8px]">
                  <span className="font-bold">Rationale:</span> {content.defendedDecision.rationale}
                </p>
                <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.7)] leading-[16.9px] tracking-[0.13px] italic">
                  {content.defendedDecision.context}
                </p>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.iterationDepth && (
            <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
              <div className="flex items-start justify-between mb-[12px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white tracking-[0.16px]">
                  {content.iterationDepth.focus}
                </p>
                <div className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[12px] py-[4px]">
                  <p className="font-['Cambay',sans-serif] font-bold text-[14px] text-[#FFB033] tracking-[0.14px]">
                    {content.iterationDepth.iterations}
                  </p>
                </div>
              </div>
              <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.6)] mb-[8px] tracking-[0.14px]">
                <span className="font-bold">Goal:</span> {content.iterationDepth.goal}
              </p>
              <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                <span className="font-bold">Outcome:</span> {content.iterationDepth.outcome}
              </p>
            </div>
          )}
        </div>
      );

    case "failure-handling":
      return (
        <div className="flex flex-col gap-[24px]">
          {content.qualityProcess && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[8px] tracking-[0.16px]">
                  {content.qualityProcess.title}
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] mb-[12px] tracking-[0.14px]">
                  {content.qualityProcess.pipeline}
                </p>
                <ul className="space-y-[6px]">
                  {content.qualityProcess.tracked?.map((item: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[13px] text-white leading-[16.9px] tracking-[0.13px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.errorHandling && (
            <>
              <div className="bg-[rgba(255,176,51,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FFB033] mb-[12px] tracking-[0.16px]">
                  {content.errorHandling.title}
                </p>
                <ul className="space-y-[8px]">
                  {content.errorHandling.principles?.map((principle: string, idx: number) => (
                    <li key={idx} className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px] flex items-start">
                      <span className="mr-[12px]">•</span>
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.asyncFailures && (
            <>
              <div className="bg-[rgba(255,68,68,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#FF4444] mb-[12px] tracking-[0.16px]">
                  {content.asyncFailures.title}
                </p>
                <div className="flex gap-[12px] mb-[16px]">
                  {content.asyncFailures.systems?.map((system: string, idx: number) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[12px] py-[6px]">
                      <p className="font-['Cambay',sans-serif] text-[13px] text-white tracking-[0.13px]">
                        {system}
                      </p>
                    </div>
                  ))}
                </div>
                {content.asyncFailures.resolution && (
                  <div className="space-y-[6px]">
                    <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                      <span className="font-bold">Method:</span> {content.asyncFailures.resolution.method}
                    </p>
                    <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                      <span className="font-bold">Implementation:</span> {content.asyncFailures.resolution.implementation}
                    </p>
                  </div>
                )}
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.behavioralImpact && (
            <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[8px] tracking-[0.16px]">
                {content.behavioralImpact.title}
              </p>
              <p className="font-['Cambay',sans-serif] font-bold text-[15px] text-white mb-[8px] leading-[19.5px] tracking-[0.15px]">
                {content.behavioralImpact.statement}
              </p>
              <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px] italic">
                {content.behavioralImpact.context}
              </p>
            </div>
          )}
        </div>
      );

    case "scalability":
      return (
        <div className="flex flex-col gap-[24px]">
          {content.designFoundation && (
            <>
              <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[12px] tracking-[0.16px]">
                  {content.designFoundation.title}
                </p>
                <div className="flex gap-[12px]">
                  {content.designFoundation.principles?.map((principle: string, idx: number) => (
                    <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[16px] py-[8px]">
                      <p className="font-['Cambay',sans-serif] text-[14px] text-white tracking-[0.14px]">
                        {principle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.scalabilityApproach && (
            <>
              <div className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[20px]">
                <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-[#00A87C] mb-[8px] tracking-[0.16px]">
                  {content.scalabilityApproach.title}
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-[rgba(255,255,255,0.8)] mb-[12px] tracking-[0.14px]">
                  {content.scalabilityApproach.description}
                </p>
                <div className="space-y-[12px]">
                  {content.scalabilityApproach.categories && (
                    <div>
                      <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.6)] mb-[6px] tracking-[0.13px]">
                        Categories:
                      </p>
                      <div className="flex flex-wrap gap-[8px]">
                        {content.scalabilityApproach.categories.map((category: string, idx: number) => (
                          <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[12px] py-[4px]">
                            <p className="font-['Cambay',sans-serif] text-[13px] text-white tracking-[0.13px]">
                              {category}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.scalabilityApproach.scenarios && (
                    <div>
                      <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.6)] mb-[6px] tracking-[0.13px]">
                        Scenarios:
                      </p>
                      <div className="flex flex-wrap gap-[8px]">
                        {content.scalabilityApproach.scenarios.map((scenario: string, idx: number) => (
                          <div key={idx} className="bg-[rgba(255,255,255,0.1)] rounded-[4px] px-[12px] py-[4px]">
                            <p className="font-['Cambay',sans-serif] text-[13px] text-white tracking-[0.13px]">
                              {scenario}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.adaptationModel && (
            <>
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white leading-[20.8px] tracking-[0.16px] italic">
                {content.adaptationModel}
              </p>
              <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
            </>
          )}
          
          {content.benefits && (
            <div>
              <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[16px] tracking-[0.16px]">
                {content.benefits.title}
              </p>
              <div className="space-y-[12px]">
                {content.benefits.items?.map((benefit: any, idx: number) => (
                  <div key={idx} className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[16px]">
                    <p className="font-['Cambay',sans-serif] font-bold text-[14px] text-white mb-[6px] tracking-[0.14px]">
                      {benefit.label}
                    </p>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px]">
                      {benefit.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case "interaction":
      return (
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
            {content.description}
          </p>
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          <div className="bg-[rgba(255,255,255,0.05)] rounded-[8px] p-[20px]">
            <p className="font-['Cambay',sans-serif] font-bold text-[16px] text-white mb-[16px] tracking-[0.16px]">
              Interaction States
            </p>
            <div className="space-y-[12px]">
              {content.states?.map((state: any, idx: number) => (
                <div key={idx} className="flex items-center gap-[12px]">
                  <div 
                    className={`size-[12px] rounded-full ${
                      state.color === 'neutral' ? 'bg-[rgba(255,255,255,0.3)]' :
                      state.color === 'warning' ? 'bg-[#FFB033]' :
                      'bg-[#FF4444]'
                    }`} 
                  />
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white tracking-[0.14px]">
                    <span className="font-bold">{state.label}:</span> {state.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "outcomes-summary":
      return (
        <div className="flex flex-col gap-[32px]">
          {/* Operational Improvements - Animated Metric Cards */}
          <div className="grid grid-cols-3 gap-[20px]">
            {content.operationalImprovements?.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[rgba(0,168,124,0.1)] rounded-[12px] p-[24px] border border-[rgba(0,168,124,0.3)] relative overflow-hidden"
              >
                {/* Animated background glow */}
                <motion.div
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-[rgba(0,168,124,0.2)] to-transparent"
                />
                
                <div className="relative z-10">
                  <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.6)] mb-[8px] tracking-[0.13px]">
                    {item.metric}
                  </p>
                  <motion.p
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                    className="font-['Cambay',sans-serif] font-bold text-[48px] text-[#00A87C] mb-[8px] leading-[1]"
                  >
                    {item.improvement}
                  </motion.p>
                  <p className="font-['Cambay',sans-serif] text-[14px] text-white leading-[18.2px] tracking-[0.14px]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider with animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
          />

          {/* Behavioral Shift */}
          {content.behavioralShift && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-[28px] border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center gap-[12px] mb-[16px]">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="size-[32px] rounded-full bg-gradient-to-br from-[#FFB033] to-[#FF8C33] flex items-center justify-center"
                >
                  <div className="size-[16px] rounded-full bg-white" />
                </motion.div>
                <p className="font-['Cambay',sans-serif] font-bold text-[18px] text-white tracking-[0.18px]">
                  {content.behavioralShift.title}
                </p>
              </div>
              <div className="space-y-[10px]">
                {content.behavioralShift.changes?.map((change: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + idx * 0.1 }}
                    className="flex items-center gap-[12px]"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                      className="size-[6px] rounded-full bg-[#FFB033] flex-shrink-0"
                    />
                    <p className="font-['Cambay',sans-serif] text-[15px] text-white leading-[19.5px] tracking-[0.15px]">
                      {change}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
          />

          {/* Business Impact */}
          {content.businessImpact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <p className="font-['Cambay',sans-serif] font-bold text-[18px] text-white mb-[20px] tracking-[0.18px]">
                {content.businessImpact.title}
              </p>
              <div className="space-y-[16px]">
                {content.businessImpact.outcomes?.map((outcome: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 + idx * 0.15 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="bg-gradient-to-r from-[rgba(0,168,124,0.15)] to-[rgba(0,168,124,0.05)] rounded-[8px] p-[20px] border border-[rgba(0,168,124,0.3)] flex items-center gap-[16px] cursor-default"
                  >
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          '0 0 0 0 rgba(0,168,124,0.4)',
                          '0 0 0 10px rgba(0,168,124,0)',
                          '0 0 0 0 rgba(0,168,124,0)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                      className="size-[40px] rounded-full bg-[#00A87C] flex items-center justify-center flex-shrink-0"
                    >
                      {outcome.icon === 'speed' && (
                        <svg className="size-[20px]" viewBox="0 0 24 24" fill="none">
                          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="white" />
                        </svg>
                      )}
                      {outcome.icon === 'quality' && (
                        <svg className="size-[20px]" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {outcome.icon === 'transform' && (
                        <svg className="size-[20px]" viewBox="0 0 24 24" fill="none">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white" />
                        </svg>
                      )}
                    </motion.div>
                    <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
                      {outcome.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Closing Statement */}
          {content.closingStatement && (
            <>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
              />
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="text-center"
              >
                <p className="font-['Cambay',sans-serif] font-bold text-[20px] text-white leading-[26px] tracking-[0.2px] italic">
                  {content.closingStatement}
                </p>
              </motion.div>
            </>
          )}
        </div>
      );

    case "learnings":
      return (
        <div className="flex flex-col gap-[20px]">
          <ul className="space-y-[16px]">
            {content.items?.map((item: any, idx: number) => (
              <li key={idx} className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px] flex items-start">
                <span className="mr-[12px]">•</span>
                <span>
                  <span className="font-bold">{item.title}</span> — {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "scale":
      return (
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Cambay',sans-serif] text-[18px] text-white leading-[23.4px] tracking-[0.18px]">
            {content.statement}
          </p>
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.2)]" />
          <div className="space-y-[16px]">
            <p className="font-['Cambay',sans-serif] text-[16px] text-white leading-[20.8px] tracking-[0.16px]">
              <span className="font-bold">Generalizes to:</span>
            </p>
            <ul className="space-y-[12px] pl-[16px]">
              {content.generalizes?.map((item: string, idx: number) => (
                <li key={idx} className="font-['Cambay',sans-serif] text-[16px] text-[rgba(255,255,255,0.8)] leading-[20.8px] tracking-[0.16px] flex items-start">
                  <span className="mr-[12px]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "reflection":
      return (
        <div className="flex flex-col gap-[28px]">
          {/* Screenshot in animated monitor mockup */}
          {content.screenshot && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Monitor Frame */}
              <div className="relative bg-gradient-to-b from-[rgba(60,60,60,1)] to-[rgba(40,40,40,1)] rounded-[16px] p-[20px] shadow-[0_0_80px_rgba(0,168,124,0.3)] border-2 border-[rgba(0,168,124,0.4)]">
                {/* Glow effect behind monitor */}
                <motion.div
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-[rgba(0,168,124,0.6)] to-[rgba(255,176,51,0.5)] rounded-[16px] blur-[50px] -z-10"
                />
                
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,168,124,0.15)] to-transparent rounded-[16px] pointer-events-none" />
                
                {/* Browser Chrome */}
                <div className="bg-[rgba(50,50,50,1)] rounded-t-[8px] px-[12px] py-[10px] flex items-center gap-[8px] border-b border-[rgba(255,255,255,0.15)] shadow-lg">
                  {/* Traffic lights */}
                  <div className="flex gap-[6px]">
                    <motion.div 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                      className="size-[10px] rounded-full bg-[#FF5F56]"
                    />
                    <motion.div 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
                      className="size-[10px] rounded-full bg-[#FFBD2E]"
                    />
                    <motion.div 
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
                      className="size-[10px] rounded-full bg-[#27C93F]"
                    />
                  </div>
                  {/* Address bar */}
                  <div className="flex-1 ml-[8px] bg-[rgba(20,20,20,1)] rounded-[6px] px-[12px] py-[4px] flex items-center gap-[8px]">
                    <svg className="size-[12px]" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="rgba(0,168,124,0.6)" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(0,168,124,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-['Cambay',sans-serif] text-[11px] text-[rgba(255,255,255,0.4)] tracking-[0.11px]">
                      cpq-workflow.enterprise.app
                    </span>
                  </div>
                </div>
                
                {/* Screen Content */}
                <div className="relative bg-[rgba(20,20,20,1)] rounded-b-[8px] overflow-hidden">
                  {/* Scanline effect */}
                  <motion.div
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-[rgba(0,168,124,0.1)] to-transparent z-20 pointer-events-none"
                  />
                  
                  {/* Screenshot */}
                  <img 
                    src={cpqScreenshot} 
                    alt={content.screenshotAlt || "CPQ Workflow Screenshot"}
                    className="w-full h-auto relative z-10"
                  />
                  
                  {/* Corner accent */}
                  <motion.div
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-0 right-0 size-[120px] bg-gradient-to-bl from-[rgba(0,168,124,0.3)] to-transparent pointer-events-none z-10"
                  />
                </div>
              </div>
              
              {/* Monitor Stand */}
              <div className="flex flex-col items-center">
                <div className="w-[60px] h-[20px] bg-gradient-to-b from-[rgba(60,60,60,1)] to-[rgba(45,45,45,1)] rounded-b-[4px] border-x border-[rgba(255,255,255,0.1)]" />
                <div className="w-[120px] h-[8px] bg-gradient-to-b from-[rgba(50,50,50,1)] to-[rgba(35,35,35,1)] rounded-[4px] border border-[rgba(255,255,255,0.1)]" />
              </div>
            </motion.div>
          )}

          {/* Live Preview CTA Button */}
          {content.livePreviewUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.a
                href={content.livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-[40px] py-[16px] rounded-[12px] border-2 border-[#00A87C] overflow-hidden group cursor-pointer"
              >
                {/* Liquid fill effect */}
                <motion.div
                  initial={{ y: '100%' }}
                  whileHover={{ y: '0%' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-[#00A87C] z-0"
                />
                
                {/* Animated wave effect on top of liquid */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%'],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent z-0"
                />

                {/* Button content */}
                <div className="relative z-10 flex items-center gap-[12px]">
                  <svg className="size-[20px]" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    />
                    <motion.path
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    />
                  </svg>
                  <span className="font-['Cambay',sans-serif] font-bold text-[16px] tracking-[0.16px] text-white group-hover:text-black transition-colors duration-300">
                    View Live Preview
                  </span>
                  <motion.svg
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="size-[16px]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14m-7-7l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white group-hover:text-black transition-colors duration-300"
                    />
                  </motion.svg>
                </div>
              </motion.a>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
          />

          {/* What Worked */}
          {content.whatWorked && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-[12px] mb-[20px]">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(0,168,124,0.4)',
                      '0 0 0 8px rgba(0,168,124,0)',
                      '0 0 0 0 rgba(0,168,124,0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="size-[28px] rounded-full bg-[#00A87C] flex items-center justify-center"
                >
                  <svg className="size-[16px]" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <p className="font-['Cambay',sans-serif] font-bold text-[18px] text-white tracking-[0.18px]">
                  {content.whatWorked.title}
                </p>
              </div>
              <div className="space-y-[12px]">
                {content.whatWorked.items?.map((item: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                    className="bg-[rgba(0,168,124,0.1)] rounded-[8px] p-[16px] border border-[rgba(0,168,124,0.2)]"
                  >
                    <p className="font-['Cambay',sans-serif] font-bold text-[15px] text-white mb-[6px] tracking-[0.15px]">
                      {item.label}
                    </p>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px]">
                      {item.impact}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
          />

          {/* What Could Improve */}
          {content.whatCouldImprove && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <div className="flex items-center gap-[12px] mb-[20px]">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="size-[28px] rounded-full bg-gradient-to-br from-[#FFB033] to-[#FF8C33] flex items-center justify-center"
                >
                  <svg className="size-[14px]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4v16m8-8H4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
                <p className="font-['Cambay',sans-serif] font-bold text-[18px] text-white tracking-[0.18px]">
                  {content.whatCouldImprove.title}
                </p>
              </div>
              <div className="space-y-[12px]">
                {content.whatCouldImprove.items?.map((item: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + idx * 0.1 }}
                    className="bg-[rgba(255,176,51,0.1)] rounded-[8px] p-[16px] border border-[rgba(255,176,51,0.2)]"
                  >
                    <p className="font-['Cambay',sans-serif] font-bold text-[15px] text-white mb-[6px] tracking-[0.15px]">
                      {item.label}
                    </p>
                    <p className="font-['Cambay',sans-serif] text-[13px] text-[rgba(255,255,255,0.8)] leading-[16.9px] tracking-[0.13px]">
                      {item.consideration}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Closing Line */}
          {content.closingLine && (
            <>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent origin-left"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 1.6 }}
                className="bg-gradient-to-br from-[rgba(0,168,124,0.15)] to-[rgba(0,168,124,0.05)] rounded-[12px] p-[32px] border border-[rgba(0,168,124,0.3)] text-center relative overflow-hidden"
              >
                <motion.div
                  animate={{ 
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(0,168,124,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(0,168,124,0.2) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 50%, rgba(0,168,124,0.2) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute inset-0"
                />
                <p className="font-['Cambay',sans-serif] font-bold text-[22px] text-white leading-[28.6px] tracking-[0.22px] italic relative z-10">
                  {content.closingLine}
                </p>
              </motion.div>
            </>
          )}
        </div>
      );

    case "placeholder":
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Cambay',sans-serif] text-[16px] text-[rgba(255,255,255,0.6)] tracking-[0.16px]">
            Slide content for {content.caseStudy} case study — Slide {content.slideNumber} of 12
          </p>
        </div>
      );

    case "product-overview":
      return (
        <div className="flex gap-[48px] h-full">
          {/* Left Column - Text Content */}
          <div className="flex-1 flex flex-col gap-[24px]">
            {/* Description */}
            <p className="font-['Cambay',sans-serif] text-[18px] leading-[27px] tracking-[0.18px] text-white whitespace-pre-line">
              {content.description}
            </p>

            {/* Ecosystem Title */}
            <p className="font-['Cambay',sans-serif] font-bold text-[18px] leading-[27px] tracking-[0.18px] text-white mt-[8px]">
              {content.ecosystemTitle}
            </p>

            {/* Ecosystem Items */}
            <ul className="space-y-[12px]">
              {content.ecosystemItems?.map((item: string, index: number) => (
                <li key={index} className="font-['Cambay',sans-serif] text-[16px] leading-[24px] tracking-[0.16px] text-[#00FFA3] flex items-start">
                  <span className="mr-[12px] mt-[2px]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Monitor Mockup with Screenshot */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-[520px]">
              {/* Monitor Frame */}
              <div className="relative">
                {/* Monitor Bezel */}
                <div className="relative bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-t-[16px] p-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  {/* Screen */}
                  <div className="relative bg-[#1a1a1a] rounded-[6px] overflow-hidden shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]">
                    <img 
                      src={exiroScreenshot}
                      alt="Exiro AI Platform Interface"
                      className="w-full h-auto block"
                    />
                    
                    {/* Screen Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Camera Notch */}
                  <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#0a0a0a] border border-[#333]" />
                </div>
                
                {/* Monitor Stand */}
                <div className="relative">
                  {/* Stand Neck */}
                  <div className="mx-auto w-[60px] h-[32px] bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a]" />
                  
                  {/* Stand Base */}
                  <div className="mx-auto w-[140px] h-[8px] bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.3)]" />
                </div>
                
                {/* Ambient Light Glow */}
                <div className="absolute inset-0 -z-10 blur-3xl opacity-25">
                  <div className="absolute inset-0 bg-gradient-radial from-[#00A87C] via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "architecture-layers":
      return (
        <div className="flex flex-col gap-[32px] h-full">
          {/* Description */}
          <p className="font-['Cambay',sans-serif] text-[18px] leading-[28px] text-white/90 tracking-[0.18px]">
            {content.description}
          </p>

          {/* Layered Diagram */}
          <div className="flex-1 flex flex-col gap-[16px] justify-center max-w-[800px]">
            {content.layers.map((layer: any, index: number) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                {/* Layer Container */}
                <div className="relative bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[20px] hover:border-[#00A87C]/40 transition-all duration-300">
                  {/* Layer Name */}
                  <h3 className="font-['Cambay',sans-serif] text-[20px] font-semibold text-[#00A87C] tracking-[0.2px] mb-[12px]">
                    {layer.name}
                  </h3>
                  
                  {/* Layer Items */}
                  <ul className="space-y-[8px]">
                    {layer.items.map((item: string, itemIndex: number) => (
                      <li
                        key={itemIndex}
                        className="font-['Cambay',sans-serif] text-[16px] text-white/70 tracking-[0.16px] flex items-start gap-[8px]"
                      >
                        <span className="text-[#00A87C] mt-[2px]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connection Line to Next Layer */}
                {index < content.layers.length - 1 && (
                  <div className="absolute left-[50%] bottom-[-16px] w-[2px] h-[16px] bg-gradient-to-b from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "config-experience":
      return (
        <div className="flex gap-[48px] h-full">
          {/* Left Column - Text Content */}
          <div className="flex-1 flex flex-col gap-[24px]">
            {/* Description */}
            <p className="font-['Cambay',sans-serif] text-[18px] leading-[28px] text-white/90 tracking-[0.18px]">
              {content.description}
            </p>

            {/* Feature List */}
            <ul className="space-y-[12px]">
              {content.features.map((feature: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className="font-['Cambay',sans-serif] text-[16px] text-white/70 tracking-[0.16px] flex items-start gap-[8px]"
                >
                  <span className="text-[#00A87C] mt-[2px]">•</span>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* UX Implication */}
            <div className="mt-[24px] pt-[24px] border-t border-white/10">
              <h3 className="font-['Cambay',sans-serif] text-[16px] font-semibold text-white/60 tracking-[0.16px] mb-[12px]">
                {content.uxImplication.title}
              </h3>
              <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/80 tracking-[0.16px] italic">
                {content.uxImplication.text}
              </p>
            </div>
          </div>

          {/* Right Column - Schematic UI Blocks */}
          <div className="flex-1 flex flex-col gap-[16px] justify-center">
            {/* UI Block 1 - Agent Simulator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[16px] h-[120px]"
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#00A87C]" />
                <div className="font-['Cambay',sans-serif] text-[14px] text-white/60 tracking-[0.14px]">Agent Simulator</div>
              </div>
              <div className="space-y-[6px]">
                <div className="h-[4px] w-[80%] bg-white/5 rounded" />
                <div className="h-[4px] w-[60%] bg-white/5 rounded" />
                <div className="h-[4px] w-[70%] bg-white/5 rounded" />
              </div>
            </motion.div>

            {/* UI Block 2 - Knowledge Base */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[16px] h-[100px]"
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#00A87C]" />
                <div className="font-['Cambay',sans-serif] text-[14px] text-white/60 tracking-[0.14px]">Knowledge Base</div>
              </div>
              <div className="space-y-[6px]">
                <div className="h-[4px] w-[90%] bg-white/5 rounded" />
                <div className="h-[4px] w-[75%] bg-white/5 rounded" />
              </div>
            </motion.div>

            {/* UI Block 3 - Workflow Definition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="relative bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[16px] h-[100px]"
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#00A87C]" />
                <div className="font-['Cambay',sans-serif] text-[14px] text-white/60 tracking-[0.14px]">Workflow Designer</div>
              </div>
              <div className="flex gap-[6px] items-center">
                <div className="w-[20px] h-[20px] border border-white/10 rounded-[4px]" />
                <div className="h-[2px] w-[12px] bg-white/10" />
                <div className="w-[20px] h-[20px] border border-white/10 rounded-[4px]" />
                <div className="h-[2px] w-[12px] bg-white/10" />
                <div className="w-[20px] h-[20px] border border-white/10 rounded-[4px]" />
              </div>
            </motion.div>
          </div>
        </div>
      );

    case "knowledge-pipeline":
      return (
        <div className="flex flex-col gap-[32px] h-full">
          {/* Description */}
          <p className="font-['Cambay',sans-serif] text-[18px] leading-[28px] text-white/90 tracking-[0.18px]">
            {content.description}
          </p>

          {/* Source List */}
          <ul className="space-y-[12px]">
            {content.sources.map((source: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="font-['Cambay',sans-serif] text-[16px] text-white/70 tracking-[0.16px] flex items-start gap-[8px]"
              >
                <span className="text-[#00A87C] mt-[2px]">•</span>
                <span>{source}</span>
              </motion.li>
            ))}
          </ul>

          {/* Data Pipeline Diagram */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-[24px] max-w-[900px] w-full">
              {/* Source Nodes */}
              <div className="flex flex-col gap-[12px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[12px] text-center min-w-[140px]"
                >
                  <div className="font-['Cambay',sans-serif] text-[14px] text-white/70 tracking-[0.14px]">
                    Websites
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[12px] text-center min-w-[140px]"
                >
                  <div className="font-['Cambay',sans-serif] text-[14px] text-white/70 tracking-[0.14px]">
                    Documents
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[12px] text-center min-w-[140px]"
                >
                  <div className="font-['Cambay',sans-serif] text-[14px] text-white/70 tracking-[0.14px]">
                    Structured Data
                  </div>
                </motion.div>
              </div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-[8px]"
              >
                <div className="h-[2px] w-[60px] bg-gradient-to-r from-[#00A87C]/40 to-[#00A87C]" />
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-[#00A87C]" />
              </motion.div>

              {/* Processing Node */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-[#1a1a1a] border border-[#00A87C]/40 rounded-[8px] p-[20px] text-center min-w-[140px]"
              >
                <div className="font-['Cambay',sans-serif] text-[14px] font-semibold text-[#00A87C] tracking-[0.14px] mb-[8px]">
                  Ingestion
                </div>
                <div className="font-['Cambay',sans-serif] text-[12px] text-white/50 tracking-[0.12px]">
                  Validation
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-[8px]"
              >
                <div className="h-[2px] w-[60px] bg-gradient-to-r from-[#00A87C]/40 to-[#00A87C]" />
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-[#00A87C]" />
              </motion.div>

              {/* Output Node */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="bg-[#1a1a1a] border border-[#00A87C]/40 rounded-[8px] p-[20px] text-center min-w-[140px]"
              >
                <div className="font-['Cambay',sans-serif] text-[14px] font-semibold text-[#00A87C] tracking-[0.14px] mb-[8px]">
                  Knowledge Base
                </div>
                <div className="font-['Cambay',sans-serif] text-[12px] text-white/50 tracking-[0.12px]">
                  AI Training
                </div>
              </motion.div>
            </div>
          </div>

          {/* UX Consideration */}
          <div className="pt-[24px] border-t border-white/10">
            <h3 className="font-['Cambay',sans-serif] text-[16px] font-semibold text-white/60 tracking-[0.16px] mb-[12px]">
              {content.uxConsideration.title}
            </h3>
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/80 tracking-[0.16px] italic">
              {content.uxConsideration.text}
            </p>
          </div>
        </div>
      );

    case "monitoring-dashboard":
      return (
        <div className="flex flex-col gap-[32px] h-full">
          {/* Description */}
          <p className="font-['Cambay',sans-serif] text-[18px] leading-[28px] text-white/90 tracking-[0.18px]">
            {content.description}
          </p>

          {/* Metrics List */}
          <ul className="space-y-[12px]">
            {content.metrics.map((metric: string, index: number) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="font-['Cambay',sans-serif] text-[16px] text-white/70 tracking-[0.16px] flex items-start gap-[8px]"
              >
                <span className="text-[#00A87C] mt-[2px]">•</span>
                <span>{metric}</span>
              </motion.li>
            ))}
          </ul>

          {/* Dashboard Visualization */}
          <div className="flex-1 grid grid-cols-2 gap-[16px] mt-[16px]">
            {/* Metric Card 1 - Call Duration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[20px] flex flex-col justify-between"
            >
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/50 tracking-[0.14px] mb-[12px]">
                Call Duration
              </div>
              <div className="font-['Cambay',sans-serif] text-[32px] font-semibold text-[#00A87C]">
                4:32
              </div>
              <div className="font-['Cambay',sans-serif] text-[12px] text-white/40 tracking-[0.12px] mt-[8px]">
                avg. minutes
              </div>
            </motion.div>

            {/* Metric Card 2 - Captured Minutes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[20px] flex flex-col justify-between"
            >
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/50 tracking-[0.14px] mb-[12px]">
                Captured Minutes
              </div>
              <div className="font-['Cambay',sans-serif] text-[32px] font-semibold text-[#00A87C]">
                1,247
              </div>
              <div className="font-['Cambay',sans-serif] text-[12px] text-white/40 tracking-[0.12px] mt-[8px]">
                total today
              </div>
            </motion.div>

            {/* Metric Card 3 - Inbound/Outbound Split */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[20px] flex flex-col"
            >
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/50 tracking-[0.14px] mb-[16px]">
                Call Distribution
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="flex-1">
                  <div className="flex justify-between mb-[4px]">
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/60 tracking-[0.12px]">Inbound</span>
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/80 tracking-[0.12px]">68%</span>
                  </div>
                  <div className="h-[6px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-full bg-[#00A87C]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[12px] mt-[12px]">
                <div className="flex-1">
                  <div className="flex justify-between mb-[4px]">
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/60 tracking-[0.12px]">Outbound</span>
                    <span className="font-['Cambay',sans-serif] text-[12px] text-white/80 tracking-[0.12px]">32%</span>
                  </div>
                  <div className="h-[6px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "32%" }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="h-full bg-white/30"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Metric Card 4 - Transcript Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-[8px] p-[20px] flex flex-col justify-between"
            >
              <div className="font-['Cambay',sans-serif] text-[14px] text-white/50 tracking-[0.14px] mb-[12px]">
                Transcripts
              </div>
              <div className="flex items-baseline gap-[8px]">
                <div className="font-['Cambay',sans-serif] text-[32px] font-semibold text-[#00A87C]">
                  342
                </div>
                <div className="font-['Cambay',sans-serif] text-[16px] text-white/40 tracking-[0.16px]">
                  / 378
                </div>
              </div>
              <div className="font-['Cambay',sans-serif] text-[12px] text-white/40 tracking-[0.12px] mt-[8px]">
                processed
              </div>
            </motion.div>
          </div>

          {/* Oversight Statement */}
          <div className="pt-[20px] border-t border-white/10">
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/70 tracking-[0.16px]">
              {content.oversight}
            </p>
          </div>
        </div>
      );

    case "ux-gap-analysis": {
      // Animated Problem → Solution Flow Diagram
      const GapFlowDiagram = ({ gap, index }: { gap: any; index: number }) => {
        return (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="flex items-center gap-[24px]"
          >
            {/* Problem Node */}
            <div className="flex-1 relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                className="bg-gradient-to-br from-[#FF4444]/20 to-[#FF4444]/5 border border-[#FF4444]/40 rounded-[12px] p-[20px] relative overflow-hidden"
              >
                {/* Pulsing alert icon */}
                <motion.div
                  animate={{ 
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className="absolute top-[12px] right-[12px] w-[8px] h-[8px] rounded-full bg-[#FF4444]"
                />
                
                <p className="font-['Cambay',sans-serif] text-[12px] text-[#FF4444] tracking-[0.8px] uppercase mb-[8px] font-medium">
                  Problem
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-white/80 leading-[20px] tracking-[0.14px]">
                  {gap.problem}
                </p>
              </motion.div>
            </div>

            {/* Animated Arrow with flowing particles */}
            <div className="relative w-[80px] h-[2px]">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                className="absolute inset-0 bg-gradient-to-r from-[#FF4444]/40 via-[#00A87C]/60 to-[#00A87C] origin-left"
              />
              
              {/* Flowing particle */}
              <motion.div
                animate={{ 
                  x: [0, 80, 80, 80],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.8 + index * 0.2,
                  times: [0, 0.4, 0.6, 1]
                }}
                className="absolute top-[-2px] left-0 w-[6px] h-[6px] rounded-full bg-[#00A87C] shadow-[0_0_12px_rgba(0,168,124,0.8)]"
              />
              
              {/* Arrow head */}
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 + index * 0.2 }}
                className="absolute right-[-6px] top-[-4px]"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M0 5L10 0L10 10L0 5Z" fill="#00A87C" />
                </svg>
              </motion.div>
            </div>

            {/* Solution Node */}
            <div className="flex-1 relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                className="bg-gradient-to-br from-[#00A87C]/20 to-[#00A87C]/5 border border-[#00A87C]/40 rounded-[12px] p-[20px] relative overflow-hidden"
              >
                {/* Success checkmark icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.2, type: "spring", stiffness: 200 }}
                  className="absolute top-[12px] right-[12px] w-[16px] h-[16px] rounded-full bg-[#00A87C]/20 flex items-center justify-center"
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#00A87C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                
                <p className="font-['Cambay',sans-serif] text-[12px] text-[#00A87C] tracking-[0.8px] uppercase mb-[8px] font-medium">
                  Solution
                </p>
                <p className="font-['Cambay',sans-serif] text-[14px] text-white/80 leading-[20px] tracking-[0.14px]">
                  {gap.solution}
                </p>
              </motion.div>
            </div>
          </motion.div>
        );
      };

      return (
        <div className="flex flex-col justify-center h-full gap-[32px] px-[60px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-[12px]"
          >
            <p className="font-['Cambay',sans-serif] text-[15px] text-white/50 tracking-[0.15px] leading-[24px]">
              Identifying opportunities for UX improvement
            </p>
          </motion.div>

          {/* Gap Analysis Flows */}
          <div className="flex flex-col gap-[28px]">
            {content.gaps.map((gap: any, index: number) => (
              <div key={index}>
                {/* Gap Title */}
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="font-['Cambay',sans-serif] text-[16px] font-semibold text-white tracking-[0.16px] mb-[12px]"
                >
                  {gap.title}
                </motion.h3>
                
                <GapFlowDiagram gap={gap} index={index} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "product-insights": {
      // Animated Balance Scale Diagram - Exact Figma Recreation
      return (
        <div className="flex flex-col items-center h-full gap-[22px] overflow-hidden">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            <h2 className="font-['Cambay',sans-serif] font-bold text-[32px] leading-[48px] text-white tracking-[0.32px]">
              {content.title}
            </h2>
          </motion.div>

          {/* Balance Scale Container - Exact Figma Layout */}
          <div className="relative w-[1044px] h-[524px] shrink-0">
            {/* Intro Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute left-[182px] top-[22px] w-[680px] h-[52px]"
            >
              <p className="absolute left-1/2 -translate-x-1/2 font-['Cambay',sans-serif] text-[15px] leading-[26px] text-[rgba(255,255,255,0.85)] text-center tracking-[0.15px] w-[639px]">
                {content.intro}
              </p>
            </motion.div>

            {/* Bottom Statement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="absolute left-[182px] top-[340px] w-[680px] h-[48px]"
            >
              <p className="absolute left-1/2 -translate-x-1/2 font-['Cambay',sans-serif] italic text-[14px] leading-[24px] text-[rgba(255,255,255,0.7)] text-center tracking-[0.14px] w-[611px]">
                {content.statement}
              </p>
            </motion.div>

            {/* Three Cards at Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className="absolute left-[182px] top-[416px] w-[680px] h-[66px] grid grid-cols-3 gap-[16px]"
            >
              {content.priorities?.map((priority: string, idx: number) => (
                <div
                  key={idx}
                  className="relative bg-[rgba(0,168,124,0.1)] border border-[rgba(0,168,124,0.3)] rounded-[8px] px-[15px] pt-[15px] pb-px"
                >
                  <p className="font-['Cambay',sans-serif] text-[13px] leading-[18px] text-[rgba(255,255,255,0.85)] text-center tracking-[0.13px]">
                    {priority}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Balance Scale - Container36 equivalent */}
            <div className="absolute left-[222px] top-[102px] w-[600px] h-[200px]">
              
              {/* Vertical Base - from fulcrum down */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute left-[289px] top-[136px] w-[2px] h-[81px] bg-gradient-to-b from-[#00a87c] to-[rgba(0,168,124,0.2)] origin-top"
              />

              {/* Left Box - Automation Efficiency */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute left-0 top-0 w-[240px] h-[80px]"
              >
                <div
                  className="absolute border border-[rgba(255,176,51,0.4)] border-solid h-[80px] left-0 rounded-[10px] top-0 w-[240px]"
                  style={{ backgroundImage: "linear-gradient(161.565deg, rgba(255, 176, 51, 0.2) 0%, rgba(255, 176, 51, 0.05) 100%)" }}
                >
                  {/* Icon Container */}
                  <div className="absolute left-[102.8px] top-[13.01px] w-[30.106px] h-[30.106px] flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 4.54, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-[rgba(255,176,51,0.2)] rounded-full w-[27.978px] h-[27.978px] flex items-center justify-center"
                    >
                      <svg className="w-[15.065px] h-[15.065px]" fill="none" viewBox="0 0 15.0648 15.0648">
                        <path d="M8.16011 1.25539L1.8831 8.7878H6.90471L6.27701 13.8094L12.554 6.277H7.53241L8.16011 1.25539Z" fill="#FFB033" />
                      </svg>
                    </motion.div>
                  </div>
                  
                  {/* Text Label */}
                  <div className="absolute left-[14px] top-[46px] w-[210px] h-[18px]">
                    <p className="absolute left-1/2 -translate-x-1/2 font-['Cambay',sans-serif] text-[12px] leading-[18px] text-[#ffb033] text-center tracking-[0.12px] whitespace-nowrap">
                      Automation Efficiency
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  className="absolute left-[119px] top-[80px] w-[2px] h-[47px] bg-[rgba(255,176,51,0.4)] origin-top"
                />
              </motion.div>

              {/* Right Box - Human Oversight */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute left-[360px] top-0 w-[240px] h-[80px]"
              >
                <div
                  className="absolute border border-[rgba(0,168,124,0.4)] border-solid h-[80px] left-0 rounded-[10px] top-0 w-[240px]"
                  style={{ backgroundImage: "linear-gradient(161.565deg, rgba(0, 168, 124, 0.2) 0%, rgba(0, 168, 124, 0.05) 100%)" }}
                >
                  {/* Icon Container */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[105.41px] top-[13.41px] w-[27.181px] h-[27.181px] bg-[rgba(0,168,124,0.2)] rounded-full flex items-center justify-center"
                  >
                    <svg className="w-[14.636px] h-[14.636px]" fill="none" viewBox="0 0 14.636 14.636">
                      <path d="M7.31801 7.318C8.66522 7.318 9.75735 6.22588 9.75735 4.87867C9.75735 3.53147 8.66522 2.43934 7.31801 2.43934C5.97081 2.43934 4.87868 3.53147 4.87868 4.87867C4.87868 6.22588 5.97081 7.318 7.31801 7.318Z" fill="#00A87C" opacity="0.6" />
                      <path d="M3.659 12.8065V11.5868C3.659 10.2396 4.75112 9.14749 6.09833 9.14749H8.53766C9.88484 9.14749 10.977 10.2396 10.977 11.5868V12.8065" stroke="#00A87C" strokeLinecap="round" strokeWidth="1.21967" />
                    </svg>
                  </motion.div>
                  
                  {/* Text Label */}
                  <div className="absolute left-[14px] top-[46px] w-[210px] h-[18px]">
                    <p className="absolute left-1/2 -translate-x-1/2 font-['Cambay',sans-serif] text-[12px] leading-[18px] text-[#00a87c] text-center tracking-[0.12px]">
                      Human Oversight
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  className="absolute left-[119px] top-[80px] w-[2px] h-[47px] bg-[rgba(0,168,124,0.4)] origin-top"
                />
              </motion.div>

              {/* Horizontal Beam */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="absolute left-[119px] top-[136px] w-[365px] h-px origin-center"
                style={{ 
                  background: "linear-gradient(to right, rgba(0,168,124,0.4), #00a87c 50%, rgba(0,168,124,0.4))"
                }}
              />

              {/* Fulcrum Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4, type: "spring", stiffness: 200 }}
                className="absolute left-[283px] top-[136px] w-[14px] h-[15px] rounded-full bg-[#00a87c] shadow-[0px_0px_20px_0px_rgba(0,168,124,0.6)]"
              />
            </div>
          </div>
        </div>
      );
    }



    case "operational-impact": {
      // Animated Rising Chart with Icons
      const impactIcons = [
        // Speed icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
        </svg>,
        // Productivity icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </svg>,
        // Trust icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>,
        // Visibility icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M22 12c-2.667 4-6 6-10 6s-7.333-2-10-6c2.667-4 6-6 10-6s7.333 2 10 6z" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      ];

      return (
        <div className="flex flex-col items-center justify-center h-full gap-[48px] px-[60px]">
          {/* Intro Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-[720px] text-center"
          >
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[30px] text-white/85 tracking-[0.17px]">
              {content.intro}
            </p>
          </motion.div>

          {/* Animated Rising Bar Chart */}
          <div className="grid grid-cols-4 gap-[24px] w-full max-w-[820px] items-end">
            {content.impacts.map((impact: string, index: number) => {
              const height = 120 + index * 20;
              const delay = 0.3 + index * 0.15;
              
              // Values for each bar
              const values = ["+15%", "+25%", "+35%", "+45%"];
              
              // Fixed gradient classes for each bar to avoid OKLAB color issues
              const gradientClasses = [
                "bg-gradient-to-t from-[rgba(0,168,124,0.3)] to-[rgba(0,168,124,0.1)]",
                "bg-gradient-to-t from-[rgba(0,168,124,0.45)] to-[rgba(0,168,124,0.2)]",
                "bg-gradient-to-t from-[rgba(0,168,124,0.6)] to-[rgba(0,168,124,0.3)]",
                "bg-gradient-to-t from-[rgba(0,168,124,0.75)] to-[rgba(0,168,124,0.4)]"
              ];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  className="flex flex-col items-center gap-[12px]"
                >
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
                    className={`w-full relative rounded-t-[8px] overflow-visible ${gradientClasses[index]}`}
                  >
                    {/* Pulsing glow at top */}
                    <motion.div
                      animate={{ 
                        opacity: [0.4, 0.8, 0.4],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[4px] bg-[#00A87C] rounded-full blur-[4px]"
                    />
                    
                    {/* Rising particles */}
                    <motion.div
                      animate={{ 
                        y: [height, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                        ease: "easeOut"
                      }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[4px] h-[4px] rounded-full bg-[#00A87C]"
                    />

                    {/* Value Label Above Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: delay + 1.0 }}
                      className="absolute top-[-50px] left-1/2 -translate-x-1/2"
                    >
                      <p className="font-['Cambay',sans-serif] font-bold text-[18px] leading-[24px] text-[#00A87C] tracking-[0.18px]">
                        {values[index]}
                      </p>
                    </motion.div>

                    {/* Icon at top */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, delay: delay + 0.8, type: "spring", stiffness: 200 }}
                      className="absolute top-[-28px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] rounded-full bg-[#00A87C] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,168,124,0.5)]"
                    >
                      {impactIcons[index]}
                    </motion.div>
                  </motion.div>

                  {/* Label */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: delay + 1.0 }}
                    className="font-['Cambay',sans-serif] text-[13px] leading-[18px] text-white/75 tracking-[0.13px] text-center h-[36px]"
                  >
                    {impact}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>

          {/* Base Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="w-full max-w-[820px] h-[2px] bg-gradient-to-r from-transparent via-[#00A87C]/40 to-transparent origin-center"
          />

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="max-w-[600px] text-center"
          >
            <p className="font-['Cambay',sans-serif] text-[13px] text-white/40 tracking-[0.13px] italic">
              {content.note}
            </p>
          </motion.div>
        </div>
      );
    }

    case "project-context": {
      // Animated Audit/Analysis Icon with scanning effect
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[56px] px-[80px]">
          {/* Animated Document/Audit Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Document Background */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative w-[120px] h-[140px] bg-gradient-to-br from-[#00A87C]/20 to-[#00A87C]/5 border-2 border-[#00A87C]/40 rounded-[8px] shadow-[0_0_30px_rgba(0,168,124,0.2)]"
            >
              {/* Document lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  className="absolute left-[16px] right-[16px] h-[2px] bg-[#00A87C]/30 origin-left"
                  style={{ top: `${32 + i * 20}px` }}
                />
              ))}

              {/* Scanning line effect */}
              <motion.div
                animate={{ 
                  y: [0, 140, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00A87C] to-transparent blur-[2px]"
                style={{ top: 0 }}
              />

              {/* Checkmark overlay */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 1.2, type: "spring", stiffness: 150 }}
                className="absolute -right-[16px] -top-[16px] w-[48px] h-[48px] rounded-full bg-[#00A87C] flex items-center justify-center shadow-[0_0_25px_rgba(0,168,124,0.6)]"
              >
                <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                  <path d="M2 10L9 17L22 3" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              {/* Pulsing glow */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-[-4px] border-2 border-[#00A87C]/40 rounded-[10px] pointer-events-none"
              />
            </motion.div>

            {/* Floating tags */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="absolute -left-[100px] top-[20px] px-[12px] py-[6px] bg-[#00A87C]/20 border border-[#00A87C]/40 rounded-[6px]"
            >
              <p className="font-['Cambay',sans-serif] text-[12px] text-[#00A87C] tracking-[0.12px] font-medium whitespace-nowrap">
                UX Audit
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="absolute -right-[120px] top-[60px] px-[12px] py-[6px] bg-[#00A87C]/20 border border-[#00A87C]/40 rounded-[6px]"
            >
              <p className="font-['Cambay',sans-serif] text-[12px] text-[#00A87C] tracking-[0.12px] font-medium whitespace-nowrap">
                Analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -bottom-[40px] left-1/2 -translate-x-1/2 px-[12px] py-[6px] bg-[#00A87C]/20 border border-[#00A87C]/40 rounded-[6px]"
            >
              <p className="font-['Cambay',sans-serif] text-[12px] text-[#00A87C] tracking-[0.12px] font-medium whitespace-nowrap">
                Evaluation
              </p>
            </motion.div>
          </motion.div>

          {/* Intro Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-center max-w-[780px]"
          >
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[32px] text-white/85 tracking-[0.17px]">
              {content.intro}
            </p>
          </motion.div>

          {/* Decorative Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-[120px] h-[2px] bg-gradient-to-r from-transparent via-[#00A87C]/40 to-transparent"
          />

          {/* Clarification Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="text-center max-w-[780px]"
          >
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/70 tracking-[0.16px] italic">
              {content.clarification}
            </p>
          </motion.div>
        </div>
      );
    }

    case "core-problem": {
      return (
        <div className="flex flex-col justify-center h-full gap-[56px] px-[100px]">
          {/* Surface Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[16px]">
              Surface-level issues
            </p>
            <div className="flex gap-[24px]">
              {content.surfaceIssues.map((issue: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="px-[24px] py-[12px] bg-white/5 border border-white/10 rounded-[6px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[24px] text-white/70 tracking-[0.16px]">
                    {issue}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Root Cause */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="max-w-[680px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[16px]">
              {content.rootCause.title}
            </p>
            {content.rootCause.emphasis.map((item: string, index: number) => (
              <motion.p
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.15 }}
                className="font-['Cambay',sans-serif] text-[18px] leading-[32px] text-white/85 tracking-[0.18px] mb-[8px]"
              >
                • {item}
              </motion.p>
            ))}
          </motion.div>

          {/* Failures Observed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[16px]">
              Failures observed
            </p>
            <div className="flex gap-[20px]">
              {content.failuresObserved.map((failure: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                  className="flex items-center gap-[8px]"
                >
                  <div className="w-[4px] h-[4px] rounded-full bg-red-400/70" />
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[24px] text-white/70 tracking-[0.16px]">
                    {failure}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Closing Line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.9 }}
            className="max-w-[800px] pt-[24px] border-t border-white/10"
          >
            <p className="font-['Cambay',sans-serif] text-[19px] leading-[34px] text-white tracking-[0.19px] italic">
              "{content.closingLine}"
            </p>
          </motion.div>
        </div>
      );
    }

    case "constraints": {
      return (
        <div className="flex flex-col justify-center h-full gap-[48px] px-[100px]">
          {/* Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[800px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[20px]">
              System Integrations
            </p>
            <div className="grid grid-cols-3 gap-[16px]">
              {content.integrations.map((integration: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
                  className="px-[20px] py-[14px] bg-white/[0.03] border border-white/10 rounded-[6px] text-center hover:bg-white/[0.06] transition-colors duration-300"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[22px] text-white/80 tracking-[0.15px]">
                    {integration}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Non-Negotiable Constraints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="w-full max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[20px]">
              Non-Negotiable Constraints
            </p>
            <div className="flex flex-col gap-[12px]">
              {content.nonNegotiableConstraints.map((constraint: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  className="flex items-center gap-[12px] px-[16px] py-[10px] bg-white/[0.02] rounded-[4px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-amber-400/60 flex-shrink-0" />
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/75 tracking-[0.16px]">
                    {constraint}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* UX Positioning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.8 }}
            className="max-w-[740px] pt-[20px] border-t border-white/10"
          >
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/60 tracking-[0.16px] mb-[8px]">
              {content.uxPositioning.constraint}
            </p>
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[30px] text-white/90 tracking-[0.17px]">
              {content.uxPositioning.approach}
            </p>
          </motion.div>
        </div>
      );
    }

    case "success-criteria": {
      return (
        <div className="flex flex-col justify-center h-full gap-[44px] px-[100px]">
          {/* Leadership Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[660px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[18px]">
              Leadership Success Metrics
            </p>
            <div className="flex flex-col gap-[12px]">
              {content.leadershipMetrics.map((metric: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                  className="flex items-center gap-[12px] px-[20px] py-[12px] bg-[#00A87C]/10 border border-[#00A87C]/20 rounded-[6px]"
                >
                  <div className="w-[8px] h-[8px] rounded-full bg-[#00A87C]" />
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/85 tracking-[0.16px]">
                    {metric}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* UX Success Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-[660px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[18px]">
              UX Success Signals
            </p>
            <div className="grid grid-cols-2 gap-[12px]">
              {content.uxSuccessSignals.map((signal: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.08 }}
                  className="px-[16px] py-[10px] bg-white/[0.04] border border-white/10 rounded-[4px] text-center"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/75 tracking-[0.15px]">
                    {signal}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Baseline Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/65 tracking-[0.16px]">
              {content.baselineInsight}
            </p>
          </motion.div>

          {/* Key Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="max-w-[740px] pt-[20px] border-t border-white/10"
          >
            <div className="flex gap-[24px] mb-[16px]">
              {content.keyElements.map((element: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.7 + index * 0.12 }}
                  className="px-[20px] py-[10px] bg-gradient-to-br from-[#00A87C]/20 to-[#00A87C]/5 border border-[#00A87C]/30 rounded-[6px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-[#00A87C] tracking-[0.15px] font-medium">
                    {element}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[30px] text-white tracking-[0.17px]">
              {content.elementImpact}
            </p>
          </motion.div>
        </div>
      );
    }

    case "mental-model": {
      return (
        <div className="flex flex-col justify-center h-full gap-[48px] px-[100px]">
          {/* Design Logic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-[720px]"
          >
            <p className="font-['Cambay',sans-serif] text-[18px] leading-[32px] text-white/85 tracking-[0.18px]">
              {content.designLogic}
            </p>
          </motion.div>

          {/* Cognitive Load Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[24px]">
              Cognitive Load Distribution
            </p>
            <div className="flex flex-col gap-[16px]">
              {content.cognitiveLoadDistribution.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 + index * 0.15 }}
                  className="relative"
                >
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[80px] flex-shrink-0">
                      <p className="font-['Cambay',sans-serif] text-[14px] leading-[20px] text-white/60 tracking-[0.14px]">
                        Step {item.step}
                      </p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-[36px] bg-white/5 rounded-[4px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.load}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + index * 0.15 }}
                          className="h-full bg-gradient-to-r from-[#00A87C]/60 to-[#00A87C]/30 flex items-center justify-end pr-[12px]"
                        >
                          <span className="font-['Cambay',sans-serif] text-[13px] leading-[20px] text-white font-medium">
                            {item.load}%
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="w-[180px] flex-shrink-0">
                      <p className="font-['Cambay',sans-serif] text-[14px] leading-[20px] text-white/70 tracking-[0.14px]">
                        {item.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mental Model Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="w-full max-w-[680px]"
          >
            <div className="flex flex-col gap-[12px]">
              {content.mentalModelPrinciples.map((principle: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.12 }}
                  className="flex items-center gap-[12px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-white/40" />
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/80 tracking-[0.16px]">
                    {principle}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Emphasize */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="max-w-[600px] pt-[24px] border-t border-white/10"
          >
            <p className="font-['Cambay',sans-serif] text-[20px] leading-[34px] text-white tracking-[0.2px] font-medium italic">
              "{content.emphasize}"
            </p>
          </motion.div>
        </div>
      );
    }

    case "offer-management-flow": {
      return (
        <div className="flex flex-col justify-center h-full gap-[40px] px-[100px]">
          {/* Before / After Comparison */}
          <div className="w-full max-w-[900px] grid grid-cols-2 gap-[32px]">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-[16px]"
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[24px] h-[24px] rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="font-['Cambay',sans-serif] text-[12px] text-red-400">✕</span>
                </div>
                <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase">
                  Before
                </p>
              </div>
              {content.before.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="px-[16px] py-[12px] bg-red-500/5 border border-red-500/20 rounded-[4px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/70 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-[16px]"
            >
              <div className="flex items-center gap-[8px] mb-[8px]">
                <div className="w-[24px] h-[24px] rounded-full bg-[#00A87C]/20 flex items-center justify-center">
                  <span className="font-['Cambay',sans-serif] text-[12px] text-[#00A87C]">✓</span>
                </div>
                <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase">
                  After
                </p>
              </div>
              {content.after.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="px-[16px] py-[12px] bg-[#00A87C]/10 border border-[#00A87C]/30 rounded-[4px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/85 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* OMT Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="w-full max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[16px]">
              OMT Experience
            </p>
            <div className="grid grid-cols-2 gap-[12px]">
              {content.omtExperience.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.0 + index * 0.08 }}
                  className="px-[16px] py-[10px] bg-white/[0.04] border border-white/10 rounded-[4px] text-center"
                >
                  <p className="font-['Cambay',sans-serif] text-[14px] leading-[22px] text-white/75 tracking-[0.14px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Outcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="pt-[20px] border-t border-white/10 w-full max-w-[600px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[12px]">
              Outcome
            </p>
            <div className="flex gap-[20px]">
              {content.outcome.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.12 }}
                  className="px-[20px] py-[10px] bg-[#00A87C]/15 border border-[#00A87C]/30 rounded-[6px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/90 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      );
    }

    case "ux-decisions": {
      return (
        <div className="flex flex-col justify-center h-full gap-[44px] px-[100px]">
          {/* Decisions Made */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[720px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[18px]">
              Key Decisions
            </p>
            <div className="flex flex-col gap-[12px]">
              {content.decisionsMade.map((decision: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                  className="flex items-start gap-[12px] px-[16px] py-[12px] bg-[#00A87C]/10 border border-[#00A87C]/20 rounded-[6px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-[#00A87C] mt-[9px] flex-shrink-0" />
                  <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/85 tracking-[0.16px]">
                    {decision}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trade-offs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-[720px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[18px]">
              Trade-offs
            </p>
            <div className="flex flex-col gap-[10px] px-[20px] py-[16px] bg-white/[0.03] border border-white/10 rounded-[6px]">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/65 tracking-[0.15px]"
              >
                <span className="text-white/50">Context:</span> {content.tradeoffs.context}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.95 }}
                className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/80 tracking-[0.15px]"
              >
                <span className="text-[#00A87C]">Prioritization:</span> {content.tradeoffs.prioritization}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/80 tracking-[0.15px]"
              >
                <span className="text-[#00A87C]">Retained:</span> {content.tradeoffs.retained}
              </motion.p>
            </div>
          </motion.div>

          {/* Defended Decision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="w-full max-w-[700px] px-[24px] py-[18px] bg-gradient-to-br from-[#00A87C]/15 to-[#00A87C]/5 border border-[#00A87C]/30 rounded-[6px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[8px]">
              Defended Decision
            </p>
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[28px] text-white tracking-[0.17px] mb-[6px] font-medium">
              {content.defendedDecision.title}
            </p>
            <p className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/75 tracking-[0.15px]">
              {content.defendedDecision.impact}
            </p>
          </motion.div>

          {/* Iteration Depth */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.6 }}
            className="pt-[20px] border-t border-white/10 w-full max-w-[600px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[12px]">
              Iteration Depth
            </p>
            <div className="flex items-center gap-[16px]">
              <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/70 tracking-[0.16px]">
                {content.iterationDepth.component}
              </p>
              <div className="px-[16px] py-[8px] bg-white/10 rounded-[4px]">
                <p className="font-['Cambay',sans-serif] text-[20px] leading-[28px] text-[#00A87C] font-bold">
                  {content.iterationDepth.iterations}
                </p>
              </div>
              <p className="font-['Cambay',sans-serif] text-[16px] leading-[26px] text-white/70 tracking-[0.16px]">
                iterations to {content.iterationDepth.goal}
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    case "edge-cases-safety": {
      return (
        <div className="flex flex-col justify-center h-full gap-[40px] px-[100px]">
          {/* Quality Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[740px] px-[24px] py-[18px] bg-white/[0.03] border border-white/10 rounded-[6px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[10px]">
              Quality Process
            </p>
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/80 tracking-[0.16px] mb-[6px]">
              {content.qualityProcess.pipeline}
            </p>
            <p className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/65 tracking-[0.15px]">
              {content.qualityProcess.tracked}
            </p>
          </motion.div>

          {/* Error Handling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[16px]">
              Error Handling
            </p>
            <div className="flex flex-col gap-[12px]">
              {content.errorHandling.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.12 }}
                  className="flex items-start gap-[12px] px-[16px] py-[12px] bg-amber-500/10 border border-amber-500/20 rounded-[6px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-amber-400 mt-[9px] flex-shrink-0" />
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[26px] text-white/80 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Async Failures & Resolution */}
          <div className="w-full max-w-[800px] grid grid-cols-2 gap-[24px]">
            {/* Async Failures */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col gap-[12px]"
            >
              <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[4px]">
                Async Failures Addressed
              </p>
              {content.asyncFailures.map((failure: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                  className="px-[16px] py-[10px] bg-red-500/10 border border-red-500/20 rounded-[4px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/75 tracking-[0.15px]">
                    {failure}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Resolution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col gap-[12px]"
            >
              <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[4px]">
                Resolution
              </p>
              {content.resolution.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                  className="px-[16px] py-[10px] bg-[#00A87C]/10 border border-[#00A87C]/30 rounded-[4px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/85 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Behavioral Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="max-w-[760px] pt-[20px] border-t border-white/10"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[12px]">
              Behavioral Impact
            </p>
            <p className="font-['Cambay',sans-serif] text-[18px] leading-[32px] text-white tracking-[0.18px]">
              {content.behavioralImpact}
            </p>
          </motion.div>
        </div>
      );
    }

    case "design-system-scalability": {
      return (
        <div className="flex flex-col justify-center h-full gap-[44px] px-[100px]">
          {/* Design Foundation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-[600px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[18px]">
              Design Foundation
            </p>
            <div className="flex gap-[16px]">
              {content.designFoundation.map((item: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                  className="px-[24px] py-[14px] bg-[#00A87C]/10 border border-[#00A87C]/30 rounded-[6px]"
                >
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/85 tracking-[0.15px]">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scalability Approach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-[680px]"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-white/50 tracking-[0.8px] uppercase mb-[16px]">
              Scalability Approach
            </p>
            <p className="font-['Cambay',sans-serif] text-[16px] leading-[28px] text-white/70 tracking-[0.16px] mb-[16px]">
              {content.scalabilityApproach.description}
            </p>
            <div className="flex flex-col gap-[12px]">
              {content.scalabilityApproach.categories.map((category: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.12 }}
                  className="flex items-center gap-[12px] px-[20px] py-[12px] bg-white/[0.04] border border-white/10 rounded-[6px]"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-white/40" />
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/80 tracking-[0.15px]">
                    {category}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Adaptation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="max-w-[700px]"
          >
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[30px] text-white tracking-[0.17px] italic">
              {content.systemAdaptation}
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="w-full max-w-[740px] pt-[20px] border-t border-white/10"
          >
            <p className="font-['Cambay',sans-serif] text-[14px] leading-[24px] text-[#00A87C] tracking-[0.8px] uppercase mb-[18px]">
              Benefits
            </p>
            <div className="grid grid-cols-3 gap-[12px]">
              {content.benefits.map((benefit: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  className="px-[16px] py-[12px] bg-[#00A87C]/10 border border-[#00A87C]/20 rounded-[6px] text-center"
                >
                  <p className="font-['Cambay',sans-serif] text-[14px] leading-[22px] text-white/80 tracking-[0.14px]">
                    {benefit}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      );
    }

    case "key-learnings": {
      // Simplified grid layout matching other slides
      return (
        <div className="flex flex-col items-center justify-center h-full gap-[48px] px-[80px]">
          {/* Intro Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-[720px]"
          >
            <p className="font-['Cambay',sans-serif] text-[17px] leading-[30px] text-white/85 tracking-[0.17px]">
              {content.intro}
            </p>
          </motion.div>

          {/* Learning Items Grid */}
          <div className="grid grid-cols-2 gap-[24px] w-full max-w-[760px]">
            {content.learnings.map((learning: string, index: number) => {
              const delay = 0.3 + index * 0.15;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  className="relative bg-gradient-to-br from-[#00A87C]/15 to-[#00A87C]/5 border border-[#00A87C]/30 rounded-[12px] px-[28px] py-[24px]"
                >
                  {/* Corner accent */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: delay + 0.2 }}
                    className="absolute top-[-6px] left-[-6px] w-[12px] h-[12px] rounded-full bg-[#00A87C] shadow-[0_0_12px_rgba(0,168,124,0.6)]"
                  />
                  
                  <p className="font-['Cambay',sans-serif] text-[15px] leading-[24px] text-white/90 tracking-[0.15px]">
                    {learning}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="font-['Cambay',sans-serif] text-[16px] text-[rgba(255,255,255,0.6)] tracking-[0.16px]">
            Content not available
          </p>
        </div>
      );
  }
}