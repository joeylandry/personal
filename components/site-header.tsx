'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { navLinks } from '@/lib/site';
import { profile } from '@/content';
import { Monogram } from './monogram';
import { LinkedInGlyph } from './glyphs';
import { MusicIsland } from './music-island';

/** How far in from the right edge a swipe can start and still open the drawer. */
const EDGE_ZONE = 32;
/** Movement before a touch commits to being a horizontal drag or a scroll. */
const AXIS_LOCK = 8;
/** A flick faster than this (px per ms) settles the drawer in its direction. */
const FLICK_SPEED = 0.4;

/**
 * Swipe the mobile drawer open from the right edge of the screen, and swipe it
 * closed again. The drawer follows the finger while dragging, then settles open
 * or closed by how far it travelled or how fast it was flicked. Vertical moves
 * are left alone so the page still scrolls.
 */
function useSwipeDrawer({
  open,
  settle,
  panelRef,
  overlayRef,
}: {
  open: boolean;
  settle: (open: boolean) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 767.98px)');
    let drag: {
      startX: number;
      startY: number;
      lastX: number;
      lastT: number;
      velocity: number;
      width: number;
      axis: 'x' | 'y' | null;
    } | null = null;

    // How far the drawer is open, 0 to 1, for a finger at clientX.
    const progressAt = (clientX: number) => {
      if (!drag) return open ? 1 : 0;
      const dx = clientX - drag.startX;
      const travelled = open ? 1 - dx / drag.width : -dx / drag.width;
      return Math.min(1, Math.max(0, travelled));
    };

    const paint = (progress: number | null) => {
      const panel = panelRef.current;
      const overlay = overlayRef.current;
      if (!panel || !overlay) return;
      if (progress === null) {
        panel.removeAttribute('data-dragging');
        overlay.removeAttribute('data-dragging');
        panel.style.removeProperty('--drawer-progress');
        overlay.style.removeProperty('--drawer-progress');
        return;
      }
      panel.setAttribute('data-dragging', '');
      overlay.setAttribute('data-dragging', '');
      panel.style.setProperty('--drawer-progress', String(progress));
      overlay.style.setProperty('--drawer-progress', String(progress));
    };

    const onStart = (event: TouchEvent) => {
      if (!narrow.matches || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const panel = panelRef.current;
      if (!touch || !panel) return;
      if (!open && touch.clientX < window.innerWidth - EDGE_ZONE) return;
      drag = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastT: event.timeStamp,
        velocity: 0,
        width: panel.offsetWidth || window.innerWidth,
        axis: null,
      };
    };

    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!drag || !touch) return;
      const dx = touch.clientX - drag.startX;
      const dy = touch.clientY - drag.startY;
      if (drag.axis === null) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (drag.axis === 'y') {
        drag = null;
        return;
      }
      event.preventDefault();
      const elapsed = event.timeStamp - drag.lastT;
      if (elapsed > 0) drag.velocity = (touch.clientX - drag.lastX) / elapsed;
      drag.lastX = touch.clientX;
      drag.lastT = event.timeStamp;
      paint(progressAt(touch.clientX));
    };

    const onEnd = () => {
      if (!drag) return;
      if (drag.axis === 'x') {
        const progress = progressAt(drag.lastX);
        let next = progress > 0.5;
        if (drag.velocity < -FLICK_SPEED) next = true;
        if (drag.velocity > FLICK_SPEED) next = false;
        paint(null);
        settle(next);
      }
      drag = null;
    };

    const onCancel = () => {
      if (drag?.axis === 'x') paint(null);
      drag = null;
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onCancel);
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
    };
  }, [open, settle, panelRef, overlayRef]);
}

/**
 * Sticky header.
 *
 * Transparent over the homepage hero, then a midnight bar with a hairline once
 * the page scrolls. Every other page opens straight into content, some of it on
 * paper, so there the bar is solid from the start and contrast never depends on
 * what happens to be behind it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const openedBySwipe = useRef(false);

  const onHome = pathname === '/';
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Lock the page behind the open drawer, and close it if the viewport grows
  // past the breakpoint where the drawer no longer exists.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    const wide = window.matchMedia('(min-width: 768px)');
    const onWide = () => wide.matches && setOpen(false);
    wide.addEventListener('change', onWide);
    return () => {
      root.style.overflow = previous;
      wide.removeEventListener('change', onWide);
    };
  }, [open]);

  const settle = useCallback(
    (next: boolean) => {
      if (next && !open) openedBySwipe.current = true;
      setOpen(next);
    },
    [open],
  );
  useSwipeDrawer({ open, settle, panelRef, overlayRef });

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
    // A swipe is a touch gesture, so leave focus alone rather than ringing the
    // first link; opening from the keyboard or the toggle still lands on it.
    if (!openedBySwipe.current) {
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    }
    openedBySwipe.current = false;
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <header
        data-site-header
        className={[
          'surface-ink sticky top-0 z-50 text-fg transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled || open || !onHome
            ? 'border-b border-rule bg-ink/96 backdrop-blur-md supports-[backdrop-filter]:bg-ink/88'
            : 'border-b border-transparent bg-transparent backdrop-blur-[0px]',
        ].join(' ')}
      >
        <div className="wrap relative flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
          <MusicIsland />
          <Link
            href="/"
            className="group flex items-center gap-3 focus-visible:outline-offset-4"
            aria-label={`${profile.name}, home`}
          >
            <Monogram className="h-6 w-8 text-fg transition-colors duration-200 group-hover:text-detail" />
            <span className="header-name flex flex-col leading-none">
              <span className="text-sm font-medium tracking-tight">{profile.name}</span>
              <span className="meta mt-1 hidden text-[0.625rem] text-faint sm:block">
                Software Engineer
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const current = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  className={['link link-nav text-sm', current ? 'text-fg' : 'text-muted'].join(
                    ' ',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href="https://www.linkedin.com/in/josephlandry/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors duration-200 hover:text-accent"
              aria-label="Joey Landry on LinkedIn (opens in a new tab)"
            >
              <LinkedInGlyph className="h-5 w-5" />
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
      </header>

      {/* The drawer sits outside the header: the header's backdrop-filter would
          otherwise become the containing block for anything fixed inside it. */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        onClick={close}
        className="nav-drawer-overlay md:hidden"
        data-open={open}
      />
      <div
        id="mobile-nav"
        ref={panelRef}
        inert={!open}
        data-open={open}
        className="nav-drawer surface-ink border-l border-rule bg-ink md:hidden"
      >
        <nav aria-label="Primary" className="flex flex-col px-6 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              className="rule-b flex items-center justify-between py-4 text-base text-fg aria-[current=page]:text-accent"
            >
              {link.label}
              <span aria-hidden="true" className="meta text-faint">
                →
              </span>
            </Link>
          ))}
          <a
            href="https://www.linkedin.com/in/josephlandry/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between py-4 text-base text-fg"
          >
            LinkedIn
            <LinkedInGlyph className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </>
  );
}
