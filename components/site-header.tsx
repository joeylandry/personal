'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { navLinks } from '@/lib/site';
import { profile } from '@/content';
import { Monogram } from './monogram';
import { GitHubGlyph } from './glyphs';

/**
 * Sticky header.
 *
 * Transparent over the hero, then a midnight bar with a hairline once the page
 * scrolls — it stays ink-surfaced on every section so contrast never depends on
 * what happens to be behind it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const onHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Track which homepage section is in view for aria-current.
  useEffect(() => {
    // Off the homepage `onHome` gates every read of `active`, so a stale value
    // is never rendered and does not need clearing here.
    if (!onHome || typeof IntersectionObserver === 'undefined') return;
    const ids = navLinks.map((link) => link.href.split('#')[1]).filter(Boolean) as string[];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [onHome]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape to close, and keep focus inside the open panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const firstLink = panelRef.current?.querySelector<HTMLElement>('a[href]');
    firstLink?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <header
      data-site-header
      className={[
        'surface-ink sticky top-0 z-50 text-fg transition-colors duration-300',
        scrolled || open
          ? 'border-b border-rule bg-ink/96 backdrop-blur-md supports-[backdrop-filter]:bg-ink/88'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div className="wrap flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-offset-4"
          aria-label={`${profile.name} — home`}
        >
          <Monogram className="h-6 w-7 text-fg transition-colors duration-200 group-hover:text-accent" />
          <span className="flex flex-col leading-none">
            <span className="text-sm font-medium tracking-tight">{profile.name}</span>
            <span className="meta mt-1 hidden text-[0.625rem] text-faint sm:block">
              Software Engineer
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const id = link.href.split('#')[1];
            const current = onHome && id === active;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? 'true' : undefined}
                className={[
                  'link text-sm transition-colors duration-200',
                  current ? 'text-accent' : 'text-muted hover:text-fg',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/joeylandry"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors duration-200 hover:text-accent"
            aria-label="Joey Landry on GitHub (opens in a new tab)"
          >
            <GitHubGlyph className="h-5 w-5" />
          </a>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-fg md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            {open ? (
              <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.6" />
            ) : (
              <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="1.6" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="surface-ink border-t border-rule bg-ink md:hidden"
      >
        <nav aria-label="Primary" className="wrap flex flex-col py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rule-b flex items-center justify-between py-4 text-base text-fg"
            >
              {link.label}
              <span aria-hidden="true" className="meta text-faint">
                ↘
              </span>
            </Link>
          ))}
          <a
            href="https://github.com/joeylandry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between py-4 text-base text-fg"
          >
            GitHub
            <GitHubGlyph className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </header>
  );
}
