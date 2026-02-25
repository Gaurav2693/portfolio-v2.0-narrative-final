
# Portfolio App v2.0 Narrative Final

Immersive portfolio experience built with React + Vite, exported from Figma and hardened for production deployment on Vercel.

Live production:
- `https://gauravmishra.design`
- `https://www.gauravmishra.design`
- `https://portfolio-app-v20-narrative-final.vercel.app`

## What This Project Includes

- Narrative-first hero and interactive portfolio storytelling
- Animated scene layers, UI overlays, and cinematic transitions
- Sound-enabled loading and environment interactions
- Multiple case study flows (CPQ, Exiro, PlotSync)
- Responsive variations for compact/mobile layouts

## Tech Stack

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI primitives
- Fontsource for self-hosted font delivery
- Vercel for hosting and domain routing

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Preview local production build:

```bash
npm run preview
```

## Deployment (Vercel)

Project: `portfolio-app-v2.0-narrative-final`

Deploy preview:

```bash
npx vercel deploy
```

Deploy production:

```bash
npx vercel deploy --prod
```

## Domain Configuration

Custom domain is attached to production:

- Apex: `gauravmishra.design`
- Subdomain: `www.gauravmishra.design`

Both resolve through Vercel DNS (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).

## Font & Rendering Hardening (Important)

This project uses Figma-exported class names such as:

- `Bebas_Neue:Regular`
- `Cambay:Regular`
- `Cambay:Bold`
- `Cambay:Italic`
- `Inter:Medium`
- `JetBrains_Mono:Regular`
- `Exo_2`

To ensure fonts render correctly in Vercel/live environments:

1. `@fontsource/*` packages are imported in `src/styles/fonts.css`
2. Figma alias font-families are mapped with explicit `@font-face` rules
3. Fallback selectors force font-family application when arbitrary class tokens are not compiled as expected

This prevents fallback system fonts in the hero/header on live preview and production.

## Build Notes

- Figma asset imports (`figma:asset/...`) are resolved via a Vite alias in `vite.config.ts`
- Large JS bundles exist by design due to rich media/cinematic sections; optional future optimization can split heavy routes and scenes

## Project Structure (Key Paths)

- `src/app/components/` - hand-authored app components and wrappers
- `src/imports/` - Figma-exported component files
- `src/styles/fonts.css` - fontsource imports + alias mapping
- `src/styles/theme.css` - global theme tokens and text effect behavior
- `vite.config.ts` - Vite setup, aliases, and plugins

## Credits

Original design source:
- `https://www.figma.com/design/kboDPZiuC9cWBXLNMia69Z/portfolio-app-v2.0-narrative`

Font families:
- Bebas Neue, Cambay, Inter, JetBrains Mono, Exo 2 (via Fontsource)
  
