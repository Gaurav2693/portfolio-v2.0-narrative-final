// Slide content data for all three case studies
export const getSlideContent = (studyId: string, slideIndex: number) => {
  const slides: Record<string, Array<{ title: string; content: any }>> = {
    pqe: [
      // Slide 1 - Executive Summary
      {
        title: "Price Quotation Engine",
        content: {
          type: "executive-v2"
        }
      },
      // Slide 2 - System Context (moved from Slide 3)
      {
        title: "System Context & Users",
        content: {
          type: "context",
          description: "Enterprise CPQ system used by sales agents to configure Internet, VoIP, and Ethernet services for large customers including schools, hospitals, colleges, and enterprise campuses. Agents generate, sign, and lock complex price configurations per customer premises.",
          businessRisk: "Legacy CPQ caused delays, pricing errors, and misconfigured orders—creating high risk of losing enterprise deals for a US-based ISP due to slow and error-prone workflows.",
          emphasis: "If left unresolved, the system itself was becoming a reason deals were lost.",
          users: [
            {
              role: "Sales Executives",
              responsibilities: "Quote creation, deal closure",
              context: "Used daily under time pressure with high accountability for pricing accuracy and configuration correctness"
            },
            {
              role: "Admin / Approval Authorities",
              responsibilities: "Discounts, validations",
              context: "Gate-keeping role ensuring compliance with business rules and pricing policies"
            }
          ],
          userCharacteristics: "Professionally competent sales agents familiar with CPQ 1.0 but not system experts",
          userRisk: "Pricing mistakes and misconfigurations directly impacted deal success",
          flowSteps: ["Product Configuration", "Pricing Rules & Discounts", "Approval Routing"],
          riskZone: "Configuration decisions made in isolation triggered approval failures 3-5 days later, requiring complete quote regeneration"
        }
      },
      // Slide 3 - The Core Problem
      {
        title: "The Core Problem",
        content: {
          type: "core-problem",
          surfaceIssues: [
            "Complex",
            "Slow",
            "Confusing"
          ],
          rootCause: {
            title: "Root Cause",
            emphasis: [
              "Excessive cognitive load",
              "Lack of system guidance during high-stakes decision making"
            ]
          },
          failuresObserved: [
            "Wrong price",
            "Wrong configuration",
            "Wrong approvals"
          ],
          closingLine: "Users didn't fail because they were careless — they failed because the system was never designed to support human decision-making."
        }
      },
      // Slide 4 - Constraints & Non-Negotiables
      {
        title: "Constraints & Non-Negotiables",
        content: {
          type: "constraints",
          integrations: [
            "Salesforce",
            "SAP BRIM",
            "Order Management",
            "O2, SQE, EOM",
            "AMS, C360",
            "DocuSign"
          ],
          nonNegotiableConstraints: [
            "Legacy APIs",
            "Fixed response times",
            "Strict data contracts",
            "Security and compliance requirements",
            "Mandatory approval flows"
          ],
          uxPositioning: {
            constraint: "Backend constraints could not be changed.",
            approach: "UX focused on absorbing complexity instead of exposing it."
          }
        }
      },
      // Slide 5 - Success Criteria
      {
        title: "Success Criteria",
        content: {
          type: "success-criteria",
          leadershipMetrics: [
            "Speed of quote creation",
            "Accuracy of pricing and configuration"
          ],
          uxSuccessSignals: [
            "Fewer errors",
            "Faster completion",
            "Reduced back-and-forth",
            "Clear CTAs for complex actions"
          ],
          baselineInsight: "CPQ 1.0 required constant manual input, causing frustration and fatigue.",
          keyElements: [
            "Live Snapshot window",
            "Step progression bar"
          ],
          elementImpact: "These two elements fundamentally changed user confidence."
        }
      },
      // Slide 6 - System Mental Model
      {
        title: "System Mental Model",
        content: {
          type: "mental-model",
          designLogic: "Workflow broken into 4 steps based on cognitive load and turnaround time.",
          cognitiveLoadDistribution: [
            { step: 1, load: 40, label: "Foundational accuracy" },
            { step: 2, load: 20, label: "Configuration" },
            { step: 3, load: 20, label: "Pricing" },
            { step: 4, load: 20, label: "Review" }
          ],
          mentalModelPrinciples: [
            "Linear progression for safety",
            "Progressive disclosure to reduce overwhelm",
            "Ability to navigate back and forth without losing state"
          ],
          emphasize: "The system flexes — not the user."
        }
      },
      // Slide 7 - Key Flow: Offer Management (Before → After)
      {
        title: "Key Flow: Offer Management",
        content: {
          type: "offer-management-flow",
          before: [
            "No visibility into discount approval status",
            "No clarity on approved vs requested discounts",
            "OMT comments lived outside the system"
          ],
          after: [
            "Live Snapshot shows discount status per product",
            "Approved vs requested discounts clearly visible",
            "OMT comments surfaced inline"
          ],
          omtExperience: [
            "Conditional approval screens",
            "Mandatory comments",
            "Ability to edit discounts",
            "UI parity between Sales and OMT views"
          ],
          outcome: [
            "Reduced ambiguity",
            "Faster decision-making"
          ]
        }
      },
      // Slide 8 - UX Decisions & Trade-offs
      {
        title: "UX Decisions & Trade-offs",
        content: {
          type: "ux-decisions",
          decisionsMade: [
            "Real-time visual feedback over static forms",
            "Embedded educational callouts without interrupting flow"
          ],
          tradeoffs: {
            context: "Flexibility vs Safety",
            prioritization: "Safety prioritized using progressive disclosure",
            retained: "Navigation freedom retained via step progression bar"
          },
          defendedDecision: {
            title: "Introduction of cart and cart flow",
            impact: "Enabled full configuration review before finalizing"
          },
          iterationDepth: {
            component: "Product details section",
            iterations: 23,
            goal: "Reduce errors"
          }
        }
      },
      // Slide 9 - Edge Cases, Errors & Safety
      {
        title: "Edge Cases, Errors & Safety",
        content: {
          type: "edge-cases-safety",
          qualityProcess: {
            pipeline: "QA + UX + Engineering pipeline via Jira",
            tracked: "Functional, usability, and UI issues tracked and resolved"
          },
          errorHandling: [
            "Graceful warnings for invalid configurations",
            "Clear system feedback before irreversible actions"
          ],
          asyncFailures: [
            "DocuSign",
            "Credit checks"
          ],
          resolution: [
            "API rerouting",
            "Explicit success/failure messaging"
          ],
          behavioralImpact: "Live Snapshot feedback changed user behavior from defensive to confident."
        }
      },
      // Slide 10 - Design System & Scalability
      {
        title: "Design System & Scalability",
        content: {
          type: "design-system-scalability",
          designFoundation: [
            "Material Design principles",
            "Modern React runtime"
          ],
          scalabilityApproach: {
            description: "Core components reused across:",
            categories: [
              "Product categories",
              "Scenarios (Install, Change, Disconnect, Add)"
            ]
          },
          systemAdaptation: "System adapts via configuration, not redesign.",
          benefits: [
            "Faster onboarding of new products",
            "Lower maintenance cost",
            "Predictable user experience"
          ]
        }
      },
      // Slide 11 - Learnings & Reflection
      {
        title: "Outcomes & Impact",
        content: {
          type: "outcomes-summary",
          operationalImprovements: [
            { metric: "Quote Time", improvement: "↓ 42%", description: "Reduced time per quote" },
            { metric: "Error Rate", improvement: "↓ 81%", description: "Lower configuration errors" },
            { metric: "Training Time", improvement: "↓ 60%", description: "Reduced onboarding period" }
          ],
          behavioralShift: {
            title: "Behavioral Shift",
            changes: [
              "Sales agents gained confidence in system guidance",
              "Fewer escalations and rework cycles",
              "Users trusted real-time validation feedback"
            ]
          },
          businessImpact: {
            title: "Business Impact",
            outcomes: [
              { label: "Faster deal turnaround", icon: "speed" },
              { label: "Fewer downstream issues", icon: "quality" },
              { label: "CPQ became an enabler instead of a bottleneck", icon: "transform" }
            ]
          },
          closingStatement: "The system didn't just work better—it changed how people worked."
        }
      },
      // Slide 12 - Broader Applicability
      {
        title: "Reflection & Learnings",
        content: {
          type: "reflection",
          screenshot: "figma:asset/ddc0eccf77a4ec64a9c10b1f58f66cc9dad89bc1.png",
          screenshotAlt: "CPQ Workflow with Live Snapshot panel showing real-time quote generation status",
          livePreviewUrl: "https://cpq-dashboard-v2.vercel.app",
          whatWorked: {
            title: "What Worked",
            items: [
              { label: "Cognitive-load-driven structure", impact: "Reduced mental burden by distributing complexity across steps" },
              { label: "Live Snapshot as trust anchor", impact: "Real-time feedback transformed user confidence" },
              { label: "Guardrails with flexibility", impact: "Safety without sacrificing user autonomy" }
            ]
          },
          whatCouldImprove: {
            title: "What Could Improve",
            items: [
              { label: "Adaptive layouts earlier", consideration: "Responsive design should have been prioritized from initial wireframes" },
              { label: "Role-based shortcuts for experienced users", consideration: "Power users needed faster paths once they mastered the system" },
              { label: "Deeper instrumentation for decision analytics", consideration: "More granular tracking of user decision patterns would inform future iterations" }
            ]
          },
          closingLine: "Enterprise UX is not about removing complexity — it's about placing it where humans can handle it best."
        }
      }
    ],
    exiro: [
      // Slide 1 - Executive Summary
      {
        title: "Exiro AI Platform",
        content: {
          type: "exiro-executive"
        }
      },
      // Slide 2 - Product Overview
      {
        title: "Product Overview",
        content: {
          type: "product-overview",
          description: "Exiro is an AI-powered voice automation platform designed to handle enterprise customer communication workflows.\nThe system routes calls through ML-driven voice agents capable of interpreting intent, executing predefined workflows, and generating real-time conversational responses.",
          ecosystemTitle: "The product ecosystem includes:",
          ecosystemItems: [
            "AI voice agent configuration",
            "Knowledge base ingestion from documents and websites",
            "Conversation monitoring dashboards",
            "Call transcript and analytics review interfaces",
            "Subscription and SaaS onboarding layers"
          ]
        }
      },
      // Slide 3 - Platform Architecture
      {
        title: "Platform Architecture",
        content: {
          type: "architecture-layers",
          description: "The product appears structured across four primary operational layers:",
          layers: [
            {
              name: "Acquisition Layer",
              items: [
                "Marketing site, pricing flows, authentication screens"
              ]
            },
            {
              name: "Configuration Layer",
              items: [
                "AI agent design interfaces",
                "Knowledge base upload and linking",
                "Workflow definition modules"
              ]
            },
            {
              name: "Execution Layer",
              items: [
                "Automated voice conversations",
                "AI-driven call routing and interaction handling"
              ]
            },
            {
              name: "Monitoring Layer",
              items: [
                "Analytics dashboards",
                "Conversation transcripts",
                "Performance visibility panels"
              ]
            }
          ]
        }
      },
      // Slide 4 - AI Agent Configuration Experience
      {
        title: "AI Agent Configuration Experience",
        content: {
          type: "config-experience",
          description: "Wireframes indicate a configurable AI agent environment including:",
          features: [
            "Agent simulator interfaces",
            "Knowledge base ingestion from external sources",
            "Workflow definition screens",
            "Testing interfaces before deployment"
          ],
          uxImplication: {
            title: "Observed UX implication:",
            text: "Configuration appears powerful but potentially complex, requiring careful onboarding design and progressive disclosure to reduce cognitive load."
          }
        }
      },
      // Slide 5 - Knowledge Base Integration Layer
      {
        title: "Knowledge Base Integration Layer",
        content: {
          type: "knowledge-pipeline",
          description: "The platform supports AI training through structured knowledge ingestion:",
          sources: [
            "Website content ingestion",
            "Document uploads",
            "Structured data linking",
            "Knowledge source management interfaces"
          ],
          uxConsideration: {
            title: "UX consideration:",
            text: "These flows require strong clarity, validation feedback, and transparency to ensure user confidence in AI-generated responses."
          }
        }
      },
      // Slide 6 - Conversation Monitoring & Oversight
      {
        title: "Conversation Monitoring & Oversight",
        content: {
          type: "monitoring-dashboard",
          description: "Operational dashboards observed include:",
          metrics: [
            "Call duration tracking",
            "Captured minutes metrics",
            "Inbound and outbound call visibility",
            "Conversation transcript review",
            "Historical interaction tracking"
          ],
          oversight: "These interfaces indicate a human oversight loop where operators monitor AI activity and performance."
        }
      },
      // Slide 7 - Potential UX Gap Analysis
      {
        title: "Potential UX Gap Analysis",
        content: {
          type: "ux-gap-analysis",
          gaps: [
            {
              title: "Agent Setup Flow",
              problem: "Complex configuration may increase cognitive load.",
              solution: "Guided onboarding patterns could improve usability."
            },
            {
              title: "AI Automation Visibility",
              problem: "Limited explainability can impact operator trust.",
              solution: "Clear status communication may strengthen confidence."
            },
            {
              title: "Analytics Interpretation",
              problem: "Fragmented insights may slow operational decisions.",
              solution: "Unified intelligence views could enhance clarity."
            }
          ]
        }
      },
      // Slide 8 - Product Experience Insights
      {
        title: "Product Experience Insights",
        content: {
          type: "product-insights",
          intro: "AI-driven enterprise products require careful balance between automation efficiency and human oversight.",
          statement: "Clear feedback loops, explainability, and workflow visibility are critical for adoption in operational environments.",
          priorities: [
            "Transparency of AI actions",
            "Reduction of cognitive load",
            "Fast operational decision support"
          ]
        }
      },
      // Slide 9 - Operational Impact Potential
      {
        title: "Operational Impact Potential",
        content: {
          type: "operational-impact",
          intro: "Improved UX clarity in voice automation platforms can contribute to:",
          impacts: [
            "Faster communication workflows",
            "Increased agent productivity",
            "Stronger trust in automated systems",
            "Better operational visibility"
          ],
          note: "No speculative metrics included."
        }
      },
      // Slide 10 - Project Context Transparency
      {
        title: "Project Context Transparency",
        content: {
          type: "project-context",
          intro: "This case study reflects a UX/UI audit and product experience analysis of an existing AI voice automation platform.",
          clarification: "The work focuses on interface evaluation, workflow understanding, and potential UX improvement opportunities rather than original product design ownership."
        }
      },
      // Slide 11 - Key Learnings
      {
        title: "Key Learnings",
        content: {
          type: "key-learnings",
          intro: "Working with an inherited AI product context strengthened my understanding of:",
          learnings: [
            "Human-AI collaboration challenges",
            "Enterprise workflow complexity",
            "Trust-building interaction design",
            "Operational dashboard usability"
          ]
        }
      }
    ],
    plotsync: Array(12).fill(null).map((_, i) => ({
      title: `PlotSync Slide ${i + 1}`,
      content: { type: "placeholder", slideNumber: i + 1, caseStudy: "PlotSync" }
    }))
  };

  return slides[studyId]?.[slideIndex] || { title: "Slide Not Found", content: { type: "error" } };
};