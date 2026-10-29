# Line-art to generate

Same character and stroke language as `public/website-assets.png`: black 1.5px ink on white,
rounded caps, no fills except white, no colour, no shading. Hoodie, glasses, headphones around
the neck. Export each as a transparent PNG at 2× (or SVG if the tool allows), then either add
it to the sprite sheet and crop with `PortfolioArt`, or drop it in `/public` and use `<img>`.

Prompt stem (paste before each item):

> Minimal black line-art illustration, single-weight 1.5px ink on pure white, rounded line caps,
> no colour, no fills, no shading, no background. Same character as the reference: young man,
> curly black hair, round glasses, hoodie, headphones around his neck. Clean vector look.

## 1. Case study card — The Cost of Attention (replaces `CostOfAttentionArt`)
Two screens side by side. Left screen has a thick alert bar across the top and a "Collect" button
in it (the agent). Right screen has a calm billing tile with a small carousel and dots (the
customer). Under both, a single bracket joins them to one small database/cylinder icon: same data,
different hierarchy. No character. 16:9, elements centred, generous margin.

## 2. Case study card — CPQ (replaces `CpqArt`)
Left: a tall form with many rows of tiny fields, slightly overwhelming. An arrow to the right.
Right: three speech bubbles stacked like a chat, the last one with a tick. No character. 16:9.

## 3. Hero finish pose (optional, replaces last frame of the kick animation)
Character standing relaxed, one hand pointing down and to the right, a small "↓" scribble near
the hand, slight smile. Same proportions as the existing 12-frame sheet so it slots in.

## 4. Builds section header spot (optional, small, 1:1)
Character sitting cross-legged with a laptop, a tiny wireframe car and a tiny plane floating above
the screen (BY1 and SKYFLAP). Playful, not detailed.

## 5. About spot — already covered
`[148,747,104,133]` from the sheet (holding a mug) is used. Nothing new needed.

## 6. Contact spot — already covered
`[488,904,105,84]` from the sheet (waving) is used. Nothing new needed.

## Not needed any more
The "How I work" icons row, the three UI-sketch project thumbnails, the "View all projects" strip,
and the speech-bubble "Let's build something great together" blob. Those sections are gone.

## Builds thumbnails
These should be real screenshots, not drawings: 1600×1000 PNG each in `/public/builds/`,
referenced from `builds[].image` in `lib/site.ts`. Dark 3D frames on the white page look good as
long as the card border stays.
