'use client';

import Link from 'next/link';
import { useListening } from '@/lib/use-listening';
import { EqBars } from './live-player';

/**
 * One quiet line in the footer while a song is actually playing. Silent
 * otherwise — the full player on the About page covers "last played".
 */
export function NowPlayingTicker() {
  const { data } = useListening();
  const current = data?.nowPlaying;
  if (!current?.isPlaying) return null;

  return (
    <Link
      href="/about#listening"
      className="group meta flex min-w-0 items-center gap-2.5 text-faint hover:text-fg"
    >
      <EqBars playing />
      <span className="shrink-0 text-detail">Now playing</span>
      <span className="truncate normal-case tracking-normal">
        {current.track.title} · {current.track.artist}
      </span>
    </Link>
  );
}
