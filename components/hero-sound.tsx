'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { usePinned } from '@/lib/pinned-player';
import type { Track } from '@/lib/spotify';
import { useListening } from '@/lib/use-listening';
import { Artwork, EqBars } from './live-player';
import { PinnedMini } from './pinned-mini';

type Face = 'ears' | 'site';

/** The card has scrolled this far up (as a share of the viewport) when it flips to the site sound. */
const SCROLL_SWITCH_AT = 0.25;
/** How often, while nobody is touching it, the card hops to the other face. */
const HOP_EVERY_MS = 12_000;
/** After this many hops it stops, on the site sound. */
const MAX_HOPS = 4;
const HOP_MS = 800;
/** Past this long without an answer from Spotify, the card settles on the site sound. */
const GIVE_UP_MS = 4_000;
/** How far a horizontal drag must travel to count as a swipe. */
const SWIPE_PX = 40;

/** What's playing in my ears right now (or what was last), linking to the listening section. */
function EarsCard({ lead, playing }: { lead: Track | null; playing: boolean }) {
  return (
    <Link
      href="/about#listening"
      className="group flex w-full items-center gap-4 border border-rule bg-ink/55 p-3.5 backdrop-blur-md transition-colors duration-300 hover:border-detail md:p-4"
    >
      <div aria-hidden="true" className="relative size-[4.5rem] shrink-0">
        {lead ? (
          <Artwork track={lead} sizes="72px" className="size-full rounded-lg" />
        ) : (
          <div aria-hidden="true" className="size-full animate-pulse rounded-lg bg-raised" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="meta flex items-center gap-2 text-accent">
          {playing ? 'Playing in my ears' : 'Last in my ears'}
          {playing ? (
            <span className="inline-flex [--muted:var(--accent-detail)]">
              <EqBars playing />
            </span>
          ) : null}
        </p>
        <p className="mt-1.5 truncate text-base font-medium tracking-tight text-fg">
          {lead?.title ?? ' '}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted transition-colors group-hover:text-fg">
          {lead?.artist ?? ' '}
        </p>
      </div>
    </Link>
  );
}

/**
 * The hero's music card, with two faces: what's playing in my ears (live from
 * Spotify, linking to the listening section) and the site sound (the playable
 * record). It opens on my ears, flips to the site sound once, as the card
 * scrolls away, and until someone touches it hops between the two every so
 * often to catch the eye. Swipe, or tap a dot, to swap by hand.
 */
export function HeroSound(props: {
  trackId: string;
  eyebrow: string;
  preview: Parameters<typeof PinnedMini>[0]['preview'];
  trackUrl: string;
}) {
  const { data } = useListening();
  const { playing: siteSoundOn } = usePinned();
  const [face, setFace] = useState<Face>('ears');
  const [hop, setHop] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const faceRef = useRef<Face>('ears');
  const inView = useRef(false);
  const hovering = useRef(false);
  const interacted = useRef(false);
  const siteSoundRef = useRef(false);
  const hopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const lead = data?.configured ? (data.nowPlaying?.track ?? data.recent[0]?.track ?? null) : null;
  const earsPlaying = data?.nowPlaying?.isPlaying ?? false;
  // Until Spotify answers (or clearly won't), keep the ears face as a placeholder.
  const hasEars = lead !== null || (data === null && !gaveUp);
  const shown: Face = hasEars ? face : 'site';

  useEffect(() => {
    faceRef.current = shown;
    siteSoundRef.current = siteSoundOn;
  });

  useEffect(() => {
    const id = setTimeout(() => setGaveUp(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(
    () => () => {
      if (hopTimer.current) clearTimeout(hopTimer.current);
    },
    [],
  );

  const show = useCallback((next: Face, animate: boolean) => {
    setFace(next);
    if (!animate) return;
    setHop(true);
    if (hopTimer.current) clearTimeout(hopTimer.current);
    hopTimer.current = setTimeout(() => setHop(false), HOP_MS);
  }, []);

  // Track whether the card is on screen at all.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = Boolean(entry?.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Once, as the card scrolls up and away, flip to the site sound while it's still in sight.
  useEffect(() => {
    if (!hasEars) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    const check = () => {
      const el = root.current;
      if (!el || done) return;
      if (interacted.current) {
        done = true;
        return;
      }
      const { bottom } = el.getBoundingClientRect();
      if (bottom > Math.max(160, window.innerHeight * SCROLL_SWITCH_AT)) return;
      done = true;
      window.removeEventListener('scroll', check);
      if (faceRef.current !== 'site') show('site', bottom > 0 && !reduced);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [hasEars, show]);

  // Until someone touches it, hop to the other face now and then, then rest on the site sound.
  useEffect(() => {
    if (!hasEars) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let hops = 0;
    const id = setInterval(() => {
      if (interacted.current) return clearInterval(id);
      // Never pull the card out from under someone looking away or listening.
      if (hovering.current || !inView.current || document.hidden || siteSoundRef.current) return;
      hops += 1;
      const last = hops >= MAX_HOPS;
      const next: Face = last ? 'site' : faceRef.current === 'ears' ? 'site' : 'ears';
      if (next !== faceRef.current) show(next, true);
      if (last) clearInterval(id);
    }, HOP_EVERY_MS);
    return () => clearInterval(id);
  }, [hasEars, show]);

  const choose = (next: Face) => {
    interacted.current = true;
    show(next, false);
  };

  const onPointerDown = (event: PointerEvent) => {
    interacted.current = true;
    swiped.current = false;
    swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || !hasEars) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    // Swiping left pulls the right-hand face (the site sound) into view.
    swiped.current = true;
    show(dx < 0 ? 'site' : 'ears', false);
  };

  return (
    <div
      ref={root}
      className="w-full sm:max-w-sm"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') hovering.current = true;
      }}
      onPointerLeave={() => (hovering.current = false)}
      // A swipe that ends on a card must not also play it or follow its link.
      onClickCapture={(event) => {
        if (!swiped.current) return;
        swiped.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <div className="hero-sound" data-hop={hop}>
        {hasEars ? (
          <div
            className="hero-sound-face"
            data-side="left"
            data-active={shown === 'ears'}
            inert={shown !== 'ears'}
          >
            <EarsCard lead={lead} playing={earsPlaying} />
          </div>
        ) : null}
        <div
          className="hero-sound-face"
          data-side="right"
          data-active={shown === 'site'}
          inert={shown !== 'site'}
        >
          <PinnedMini {...props} />
        </div>
      </div>

      {hasEars ? (
        <div className="mt-1.5 flex justify-center">
          {(
            [
              ['ears', 'Show what’s playing in my ears'],
              ['site', 'Show the site sound'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => choose(value)}
              aria-label={label}
              aria-pressed={shown === value}
              className="hero-sound-dot"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
