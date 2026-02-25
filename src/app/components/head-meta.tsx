import { useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
   HEAD META — SEO & Open Graph tags for gauravmishra.design
   ──────────────────────────────────────────────────────────
   Programmatically sets document.title, meta description, OG tags,
   Twitter card, canonical URL, and favicon links.
   Runs once on mount.
   ═══════════════════════════════════════════════════════════════════════ */

const SITE_URL = 'https://gauravmishra.design';
const TITLE = 'Gaurav Mishra — Product Designer';
const DESCRIPTION =
  'Portfolio of Gaurav Mishra. Product Designer specializing in enterprise UX, design systems, and interactive prototyping. Explore case studies, isometric room experiences, and engineering-driven design.';

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.sizes
    ? `link[rel="${rel}"][sizes="${extra.sizes}"]`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (extra) Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function HeadMeta() {
  useEffect(() => {
    // Title
    document.title = TITLE;

    // Basic meta
    setMeta('description', DESCRIPTION);
    setMeta('author', 'Gaurav Mishra');
    setMeta('theme-color', '#08080E');

    // Open Graph
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:url', SITE_URL);
    setMetaProperty('og:title', TITLE);
    setMetaProperty('og:description', DESCRIPTION);
    setMetaProperty('og:site_name', 'GauravMishra.design');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', TITLE);
    setMeta('twitter:description', DESCRIPTION);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = SITE_URL;

    // Favicons
    setLink('icon', '/favicon-32x32.svg', { type: 'image/svg+xml' });
    setLink('icon', '/favicon-16x16.svg', { sizes: '16x16', type: 'image/svg+xml' });
    setLink('icon', '/favicon-48x48.svg', { sizes: '48x48', type: 'image/svg+xml' });
    setLink('apple-touch-icon', '/favicon-180x180.svg', { sizes: '180x180' });
  }, []);

  return null;
}
