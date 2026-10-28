// Shared slide model for the long-scroll case studies (Cost of Attention, CPQ).
// Pin positions are % of the screenshot (left, top). Keep them on the thing they describe.

export type Pin = { x: number; y: number; text: string };
export type Fig = { src: string; alt: string; pins?: Pin[] };

export type Slide = { nav: string } & (
  | { kind: 'title'; eyebrow: string; title: string; lead: string; facts: [string, string][]; art?: string }
  | { kind: 'text'; chapter: string; title: string; body: string[]; aside?: { label: string; value: string; tone?: 'red' }[]; quote?: string; art?: string }
  | { kind: 'split'; chapter: string; title: string; left: { label: string; title: string; body: string; note: string; tone?: 'red' }; right: { label: string; title: string; body: string; note: string }; foot?: string; art?: string }
  | { kind: 'figure'; chapter: string; title: string; art?: string; fig: Fig; legend: { title: string; items: string[]; note?: string } }
  | { kind: 'states'; chapter: string; title: string; rows: { label: string; src: string; alt: string }[]; legend: { title: string; items: string[]; note?: string } }
  | { kind: 'decision'; chapter: string; title: string; cost: { label?: string; items: string[]; ledger: [string, string][] }; did: { label?: string; title: string; body: string[] }; art?: string }
  | { kind: 'grid'; chapter: string; title: string; intro?: string; shots: { src: string; alt: string; caption: string }[]; note?: string }
  | { kind: 'ledger'; chapter: string; title: string; body: string[]; rows: { k: string; v: string; tone?: 'red' }[] }
  | { kind: 'close'; chapter: string; title: string; points: [string, string][]; quote: string; art?: string }
);

export type Study = {
  slug: string;
  title: string;
  eyebrow: string;
  artDir: string; // /public/<artDir>/art/<name>.png for slide art
  next: { to: string; label: string };
  slides: Slide[];
};
