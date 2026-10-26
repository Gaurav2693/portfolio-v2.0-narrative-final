// The Cost of Attention — slide content. Edit copy here, not in the component.
// Pin positions are % of the screenshot (left, top). Keep them on the thing they describe.

export type Pin = { x: number; y: number; text: string };
export type Fig = { src: string; alt: string; pins?: Pin[] };

export type Slide =
  | { kind: 'title'; eyebrow: string; title: string; lead: string; facts: [string, string][]; art?: string }
  | { kind: 'text'; chapter: string; title: string; body: string[]; aside?: { label: string; value: string; tone?: 'red' }[]; quote?: string; art?: string }
  | { kind: 'split'; chapter: string; title: string; left: { label: string; title: string; body: string; note: string; tone?: 'red' }; right: { label: string; title: string; body: string; note: string }; foot?: string; art?: string }
  | { kind: 'figure'; chapter: string; title: string; fig: Fig; legend: { title: string; items: string[]; note?: string } }
  | { kind: 'states'; chapter: string; title: string; rows: { label: string; src: string; alt: string }[]; legend: { title: string; items: string[]; note?: string } }
  | { kind: 'decision'; chapter: string; title: string; cost: { items: string[]; ledger: [string, string][] }; did: { title: string; body: string[] }; art?: string }
  | { kind: 'ledger'; chapter: string; title: string; body: string[]; rows: { k: string; v: string; tone?: 'red' }[] }
  | { kind: 'close'; chapter: string; title: string; points: [string, string][]; quote: string; art?: string };

import { asset } from '@/lib/assets';
const img = (n: string) => asset(`coa/${n}.png`);

export const coa = {
  title: 'The Cost of Attention',
  eyebrow: 'Brightspeed · Business Hub + Business 360',
  slides: <Slide[]>[
    {
      kind: 'title',
      eyebrow: 'Case study · Brightspeed',
      title: 'The Cost of Attention',
      lead: 'Designing billing urgency that two different people can live with: the agent who has to collect, and the customer who still has a business to run.',
      facts: [['Role', 'Sole UX designer, embedded'], ['Surfaces', 'Agent (B360) · Customer (Hub)'], ['Owned', 'Interaction model, hierarchy, phasing'], ['Status', 'Agent side shipped · Hub phase 1 in build']],
      art: 'opener',
    },
    {
      kind: 'text',
      chapter: '01 · The problem',
      title: 'Businesses owed money across several accounts, and nothing in the product said so loudly enough.',
      body: [
        'A business customer manages multiple Billing Account Numbers, often across locations. An overdue balance gets smeared across them. Some accounts had been overdue for more than a year while services kept running.',
        'The business asked for one thing: a banner on the Hub landing page. There was real overdue-account data behind the ask. There was no success metric, and no evidence that a banner would recover more than any other treatment.',
      ],
      aside: [
        { label: 'Illustrative balance', value: '$1,774 across 3 accounts' },
        { label: 'Customers with ≤ 3 BANs', value: '~99.8% (reported)' },
        { label: 'Session timeout', value: '~2 h inactivity' },
        { label: 'Success metric defined', value: 'none', tone: 'red' },
      ],
      quote: 'How do we make financial urgency persistent without blocking the work the customer logged in to do?',
    },
    {
      kind: 'split',
      chapter: '02 · Two audiences',
      title: 'One overdue account. Two people looking at it, who need opposite things.',
      left: { label: 'Business 360 · agent', title: 'Risk has to be unmissable.', body: 'The agent is on a call, helping a customer buy or change services. If the account is three stages into dunning, the agent must see it, know the save window, and be able to collect right there.', note: 'Treatment: a resolution bar, always on top, with the one number that matters.', tone: 'red' },
      right: { label: 'Business Hub · customer', title: 'Risk has to stay out of the way.', body: 'A hospital admin logs in to move a Voice line or check a static IP. She needs to know about the balance. She does not need to be stopped by it on every screen.', note: 'Treatment: visible, non-blocking, account-by-account, with a path to pay.' },
      foot: 'The data behind both views is the same dunning state. The information hierarchy is what changes by role.',
      art: 'two-audiences',
    },
    {
      kind: 'figure',
      chapter: '03 · Business 360',
      title: 'The agent view: a bar, not a banner.',
      fig: {
        src: img('b360-01-collapsed'), alt: 'Business 360 account page with a past-due resolution bar across the top',
        pins: [
          { x: 35.6, y: 16.6, text: 'Header pill mirrors the bar. Status and bar never disagree.' },
          { x: 7.3, y: 26.7, text: 'The one number first. Everything else is context for it.' },
          { x: 23, y: 25.1, text: 'Stage 3 of 5 in plain words, with the consequence and its date.' },
          { x: 89, y: 26.7, text: 'Collect is primary and pre-filled. Send PURL for customers who pay themselves.' },
          { x: 7, y: 44.9, text: 'The tile grid is untouched. The bar sits above it.' },
        ],
      },
      legend: { title: 'What the bar does', items: ['Status pill and bar are driven by the same state.', 'Past-due amount leads. Big, red, tabular.', 'Dunning stage, next consequence, and date in one line.', 'Collect and Send PURL are one click from the bar.', 'Nothing below moves. Zero rework of the tiles.'], note: 'Selected after four iterations: docked drawer, resolution bar, guided resolution, and a stakeholder variant.' },
    },
    {
      kind: 'figure',
      chapter: '03 · Business 360',
      title: 'Expanded, it answers the question the agent is about to be asked.',
      fig: {
        src: img('b360-02-expanded'), alt: 'Resolution bar expanded: financial summary, five-step dunning lifecycle, communications, risk dates',
        pins: [
          { x: 6, y: 44.9, text: 'Financial: total, oldest invoice, when dunning started, last payment.' },
          { x: 37.6, y: 38.5, text: 'Lifecycle stepper. Past due → Reminder → Final notice → Suspend → Disconnect.' },
          { x: 32, y: 44.9, text: 'One plain-language sentence under the stepper: this is the save window.' },
          { x: 83, y: 48.1, text: 'Restoration amount. The minimum that lifts the suspension, often less than the full balance.' },
        ],
      },
      legend: { title: 'The detail layer', items: ['Financial summary in ledger order.', 'Five-stage dunning lifecycle, current stage highlighted.', 'A plain-language line naming the moment.', 'Restoration amount: the smallest payment that restores service, shown apart from the full balance.'], note: 'The restoration amount came out of reading the dunning data, not the brief. Agents negotiate; the interface should give them the floor.' },
    },
    {
      kind: 'states',
      chapter: '03 · Business 360',
      title: 'The bar is a state machine, not a warning.',
      rows: [
        { label: 'Action needed', src: img('bar-1-action'), alt: 'Bar: past due, final notice sent, Collect button' },
        { label: 'Collecting', src: img('bar-2-charge'), alt: 'Bar replaced by an inline charge form' },
        { label: 'Pending', src: img('bar-3-pending'), alt: 'Bar: payment received, posts within one hour, suspension on hold' },
        { label: 'Cleared', src: img('bar-4-paid'), alt: 'Bar: payment posted, account exited dunning' },
      ],
      legend: { title: 'What changes between states', items: ['Collect swaps the bar for the charge form in place. The agent never leaves the account.', 'Pending is honest about posting lag: suspension on hold, no notices fire.', 'Cleared turns amber, not green. Dunning exited; the account is still watched.', 'Receipt emailed and an account note logged automatically. No cleanup.'], note: 'Persistence shipped here first. The stakes are operational and the surface is one screen.' },
    },
    {
      kind: 'figure',
      chapter: '04 · Business Hub',
      title: 'The customer view I proposed: the banner the business asked for, with structure.',
      fig: {
        src: img('hub-banner'), alt: 'Business Hub home with a full-width past-due banner: total, oldest due date, last payment, Pay Now',
        pins: [
          { x: 17, y: 46.6, text: 'Count first: 3 of your accounts. Then the total.' },
          { x: 41, y: 48.6, text: 'Total past due across BANs, account count under it.' },
          { x: 52, y: 48.6, text: 'Oldest due date and days overdue. Last payment with its BAN.' },
          { x: 67, y: 47.5, text: 'Pay Now goes straight to a multi-account checkout.' },
          { x: 13.4, y: 76, text: 'Additive. Existing tiles stay as they were, which also exposes their weakness.' },
        ],
      },
      legend: { title: 'Intended behaviour · not shipped', items: ['Lead with the number of accounts affected.', 'One total, never a vague alarm.', 'Dates and last-payment context inline.', 'Primary action to a single checkout.', 'On navigation this collapses into a persistent strip across Billing, Services and Contacts.'], note: 'The strip is what made this expensive. See the decision slide.' },
    },
    {
      kind: 'figure',
      chapter: '04 · Business Hub',
      title: 'What is actually being built: the existing billing tile, made to work.',
      fig: {
        src: img('hub-tiles'), alt: 'Business Hub home where the billing tile shows a past-due pill, per-account carousel, alert line and Pay Now',
        pins: [
          { x: 12.7, y: 36.3, text: 'Red pill on the tile header: 3 accounts past due.' },
          { x: 44, y: 42.3, text: 'Account 1 of 3. Per BAN, because ~99.8% of customers have three or fewer.' },
          { x: 12.8, y: 53.6, text: 'Amount owed, due date with days overdue, last payment. Same three facts, per account.' },
          { x: 47, y: 52.2, text: 'Arrow and dots to step through BANs.' },
          { x: 19.5, y: 64.2, text: 'Alert line and Pay Now kept inside the tile. The rest of the page is untouched.' },
        ],
      },
      legend: { title: 'Phase 1 scope · in build', items: ['Past-due pill on the tile.', 'Per-BAN carousel instead of a blended total.', 'Amount, due date, last payment per account.', 'Explicit paging controls.', 'Alert and Pay Now contained in the tile.'], note: 'Known gap: one account at a time, no combined total. The banner carried the total; the tile does not yet.' },
    },
    {
      kind: 'figure',
      chapter: '05 · Pay flow',
      title: 'Pay one, several, or all. The checkout respects how businesses actually settle.',
      fig: {
        src: img('hub-pay-review'), alt: 'Pay past-due balances, step 2 of 3: one account selected, card on file, total, Pay button',
        pins: [
          { x: 19.6, y: 24.3, text: 'The subtitle states the rule: pay one, several or all in a single checkout.' },
          { x: 87.7, y: 23.8, text: 'Three steps, visible.' },
          { x: 10.3, y: 31.3, text: 'Selection summary with location, so a finance admin can tell BANs apart by site.' },
          { x: 75.4, y: 35.4, text: 'Card or ACH. Business checking is first-class.' },
          { x: 65, y: 66, text: 'Posting can take up to 24 hours. Said before the click, not after.' },
        ],
      },
      legend: { title: 'Why partial payment matters', items: ['Businesses dispute one invoice and pay the rest. Forcing the full total would stall everything.', 'Progress is explicit.', 'Accounts identified by site.', 'ACH alongside card.', 'Posting lag disclosed up front.'] },
    },
    {
      kind: 'figure',
      chapter: '05 · Pay flow',
      title: 'The reminder survived, inside the flow instead of across the app.',
      fig: {
        src: img('hub-pay-confirm'), alt: 'Payment submitted confirmation with a reminder that two accounts still have a past-due balance and a Pay remaining button',
        pins: [
          { x: 52.4, y: 39.2, text: 'Confirmation of what was paid, which account, which card, with a reference.' },
          { x: 52.4, y: 58.6, text: 'The remaining balance stays on screen after a partial payment. The persistence hypothesis, scoped to the one moment it costs nothing.' },
          { x: 94.4, y: 58.8, text: 'Pay remaining loops back into the same checkout with the other accounts preselected.' },
        ],
      },
      legend: { title: 'The trade', items: ['Clear receipt for the part that was paid.', 'The debt that is left stays visible, at the point of highest intent.', 'One tap to continue.'], note: 'A cross-app strip needed a new component, API changes, responsive work and regression testing. A reminder on the confirmation screen needed none of that.' },
    },
    {
      kind: 'decision',
      chapter: '06 · The constraint',
      title: 'A persistent banner was not a visual change. Engineering priced it, and the price was fair.',
      cost: { items: ['UX spec and approval cycle', 'A new banner component and changes to how billing API data is consumed and shaped', 'Persistence across screens, responsive layout adjustments', 'Integration and regression testing across the existing Hub'], ledger: [['Estimate discussed', '~3 sprints'], ['Elsewhere described as', '~2 mo dev + 3 wk test']] },
      did: { title: 'Phase it.', body: ['Phase 1, in progress: fix the existing billing tile so it surfaces per-account overdue state and a path to pay.', 'Phase 2, proposed: the landing banner and persistent strip, when capacity allows.', 'I defended the problem, not my solution. The business supported the concept. Engineering chose the feasible path. The banner is not shipped, and this deck does not pretend otherwise.'] },
      art: 'whiteboard',
    },
    {
      kind: 'ledger',
      chapter: '07 · Measurement',
      title: 'No success metric was defined. So none is claimed.',
      body: ['Real overdue-account data set the context. It did not show that a persistent banner recovers more than an improved tile. Nothing here has been A/B tested.', 'If Phase 2 is funded, the fair test compares the persistent treatment against the enhanced tile, segmented by dunning stage and BAN count.'],
      rows: [{ k: 'Payment initiation and completion after exposure', v: 'proposed' }, { k: 'Change in overdue balance, time-to-payment', v: 'proposed' }, { k: 'Escalations to collections', v: 'proposed' }, { k: 'Billing-related support contacts', v: 'proposed' }, { k: 'Dismissals, repeat exposure, alert fatigue', v: 'proposed' }, { k: 'Recovery uplift', v: 'not measured', tone: 'red' }],
    },
    {
      kind: 'ledger',
      chapter: '08 · What changed for me',
      title: 'I learned to read the billing APIs. That is where the restoration amount and the posting lag came from.',
      body: ['Not building the backend. Reading the response shapes, seeing which fields existed and which did not. Once I could see the data, the engineering estimate stopped being abstract and the phasing conversation became a design conversation.'],
      rows: [{ k: 'Dunning stage and dates', v: 'in the API → stepper' }, { k: 'Restoration amount', v: 'in the API → risk panel' }, { k: 'Posting window', v: 'in the API → pending state' }, { k: 'Per-BAN past due', v: 'in the API → carousel' }, { k: 'Cross-screen banner state', v: 'not in the API → cost', tone: 'red' }],
    },
    {
      kind: 'close',
      chapter: '09 · What this demonstrates',
      title: 'None of the patterns are new. The judgment is in where each one was allowed to live.',
      points: [['Role-specific urgency', 'Unmissable for the agent, non-blocking for the customer, same data underneath.'], ['Attention without obstruction', 'The customer keeps managing services while the balance stays visible.'], ['Multi-account clarity', 'Per-BAN breakdown, not a blended total.'], ['Actionability', 'Restoration amount, partial payment, Pay remaining. A path, not a warning.'], ['Technical judgment', 'Phased my preferred interaction after understanding its cost.'], ['Honest status', 'One surface shipped, one in progress, one proposed. No invented uplift.']],
      quote: 'Screens show the interface. Decisions show the design work.',
      art: 'closing',
    },
  ],
};
