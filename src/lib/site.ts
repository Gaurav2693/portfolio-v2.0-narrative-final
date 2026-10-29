// Single place to edit copy, links and the two case studies.
// Anything marked TODO is a link or asset only you can fill in.

export const site = {
  name: 'Gaurav Mishra',
  role: 'Design Engineer',
  location: 'Bengaluru, India',
  status: 'Open to FDE & design-engineer roles',
  email: 'imgaurav2693@gmail.com',
  linkedin: 'https://www.linkedin.com/in/gauravmystrey',
  github: 'https://github.com/Gaurav2693',
  resume: 'Gaurav-Mishra-Resume.pdf', // in /public; replace the file to update
  headline: ['I design systems', 'for complicated', 'decisions.'],
  subline:
    'Enterprise telecom — billing, CPQ, agent tools. I prototype in code, so I know what a decision costs before engineering has to tell me.',
};

export type CaseStudy = {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  facts: [string, string][];
  gated?: boolean;
  draft?: string; // shown as a badge on the card when the study is still being rewritten
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'cost-of-attention',
    eyebrow: 'US telecom · Business Hub + Business 360',
    title: 'The Cost of Attention',
    lead: 'Designing billing urgency that two different people can live with: the agent who has to collect, and the customer who still has a business to run.',
    facts: [
      ['Role', 'Sole UX designer, embedded'],
      ['Decision', 'Phased a persistent banner after engineering priced it'],
      ['Status', 'Agent side shipped · customer side in build'],
    ],
    gated: true,
  },
  {
    slug: 'cpq',
    eyebrow: 'US telecom · Sales quoting',
    title: 'CPQ 2.0 & Express Quote',
    lead: 'A 47-step quoting tool rebuilt as four stages, then a second, faster path once the data showed customers stop listening at fifteen minutes.',
    facts: [
      ['Role', 'Sole designer · design system · Express Quote frontend'],
      ['Decision', 'Two paths decided by the system, not one shorter path'],
      ['Status', 'Both shipped · 700+ daily users'],
    ],
    gated: true,
  },
];

export type Build = {
  title: string;
  what: string;
  stack: string;
  href: string; // TODO: live link or clip
  image?: string; // drop a 1600×1000 screenshot into /public/builds/ and reference it here
  status?: string;
};

export const builds: Build[] = [
  { title: 'BY1 Batcar', what: 'Vehicle-combat game: drive, then switch to turret mode.', stack: 'Babylon.js · Mixamo · Meshy', href: '#', status: 'In progress' },
  { title: 'SKYFLAP', what: '3D airport intelligence; picked up by the official Three.js account.', stack: 'Three.js', href: '#' },
  { title: 'Batcave', what: 'A short film and a fully lit cave scene, built from scratch.', stack: 'Three.js', href: '#' },
  { title: 'Lanterns', what: 'Orthographic diorama told as a story, one posed beat at a time.', stack: 'Three.js · rigged character', href: '#', status: 'In progress' },
  { title: 'RONIN', what: 'Orchestration workspace for running AI agents without modes.', stack: 'React · micro-frontends', href: 'https://roninos.app', status: 'Alpha' },
  { title: '1 Element a Day', what: 'Fifteen UI elements, each built, annotated and shipped in a day.', stack: 'React · vermilion system', href: '#' },
];

export const earlier = ['PlotSync', 'Exiro AI', 'UDIS', 'Still World'];
