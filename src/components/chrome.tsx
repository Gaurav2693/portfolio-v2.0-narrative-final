import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { site } from '@/lib/site';

export const action =
  'inline-flex items-center justify-center gap-3 rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-2';
export const link =
  'inline-flex items-center gap-2 text-sm font-medium underline decoration-ink-3 underline-offset-4 hover:decoration-ink';

const NAV = [
  { label: 'Work', href: '/#work' },
  { label: 'Builds', href: '/#builds' },
  { label: 'About', href: '/#about' },
];

export function SectionLabel({ number, children, aside }: { number: string; children: React.ReactNode; aside?: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-3">
      <span className="text-xs text-ink-3 tabular-nums">{number}</span>
      <h2 className="text-sm font-semibold uppercase tracking-wider">{children}</h2>
      <span className="ml-1 h-px w-12 self-center bg-line" />
      {aside && <span className="ml-auto hidden text-sm text-ink-2 sm:block">{aside}</span>}
    </div>
  );
}

export function Header() {
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const home = pathname === '/';
  return (
    <header className="sticky top-0 z-30 -mx-6 flex h-20 items-center justify-between border-b border-line bg-paper/85 px-6 backdrop-blur sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16">
      <Link to="/" aria-label={`${site.name} home`} className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-2xl">G</span>
        <span>
          <strong className="block text-sm">{site.name}</strong>
          <span className="text-xs text-ink-2">{site.role}</span>
        </span>
      </Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
        {NAV.map((n) => (
          home
            ? <a key={n.label} href={n.href.replace('/', '')} className="text-sm hover:underline underline-offset-4">{n.label}</a>
            : <Link key={n.label} to={n.href} className="text-sm hover:underline underline-offset-4">{n.label}</Link>
        ))}
        <ThemeToggle />
        <a href={home ? '#contact' : '/#contact'} className={action}>Let’s talk <ArrowUpRight size={15} /></a>
      </nav>
      <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)} className="p-2">
          {menu ? <X /> : <Menu />}
        </button>
      </div>
      {menu && (
        <nav className="absolute right-6 top-20 z-20 flex w-56 flex-col gap-5 rounded-md border border-line bg-paper p-6 shadow-lg md:hidden">
          {[...NAV, { label: 'Let’s talk', href: '/#contact' }].map((n) => (
            <Link key={n.label} to={n.href} onClick={() => setMenu(false)}>{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-line py-6 text-xs text-ink-2">
      <span>© {new Date().getFullYear()} {site.name}</span>
      <span>{site.location}</span>
    </footer>
  );
}

export function Page({ children, title }: { children: React.ReactNode; title?: string }) {
  if (typeof document !== 'undefined') document.title = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
  return (
    <main className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
