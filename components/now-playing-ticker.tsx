'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useListening } from '@/lib/use-listening';
import { EqBars } from './live-player';

/**
 * One quiet line in the footer while a song is actually playing. Silent
 * otherwise — the full player on the About page covers "last played".
 */
export function NowPlayingTicker() {
  const { data } = useListening();
  const current = data?.nowPlaying;
  const viewport = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const label = current?.isPlaying ? `${current.track.title} · ${current.track.artist}` : '';

  // When the line is wider than its slot, scroll it by exactly the overflow.
  useEffect(() => {
    const box = viewport.current;
    const line = text.current;
    if (!box || !line) return;
    const measure = () => {
      const overflow = Math.ceil(line.scrollWidth - box.clientWidth);
      box.dataset.scroll = overflow > 0 ? 'true' : 'false';
      box.style.setProperty('--ticker-shift', `${-Math.max(overflow, 0)}px`);
      box.style.setProperty('--ticker-time', `${Math.max(overflow, 0) / 30 + 4}s`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [label]);

  if (!current?.isPlaying) return null;

  return (
    <Link
      href="/about#listening"
      className="ticker-eq group meta flex min-w-0 items-center gap-2.5 text-faint hover:text-fg"
    >
      <EqBars playing />
      <span className="shrink-0 text-detail">Now playing</span>
      <span ref={viewport} className="ticker-viewport min-w-0 flex-1 overflow-hidden">
        <span ref={text} className="ticker-text inline-block whitespace-nowrap normal-case tracking-normal">
          {label}
        </span>
      </span>
    </Link>
  );
}
