'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { TrackPreview } from '@/lib/spotify';
import { loadPinned, togglePinned, usePinned } from '@/lib/pinned-player';
import { ExternalLink } from './external-link';
import { EqBars } from './live-player';
import { PlayGlyph, Vinyl } from './vinyl';

/**
 * The site's song in miniature, for the home hero: a small spinning record
 * with a play button, wired to the same shared player as the About page's
 * turntable.
 */
export function PinnedMini({
  trackId,
  eyebrow,
  preview,
  trackUrl,
}: {
  trackId: string;
  eyebrow: string;
  preview: TrackPreview | null;
  trackUrl: string;
}) {
  const { status, playing, audible, track } = usePinned();

  useEffect(
    () =>
      loadPinned(trackId, {
        id: trackId,
        title: preview?.title ?? eyebrow,
        artist: preview?.artist ?? null,
        art: preview?.art ?? null,
        url: trackUrl,
      }),
    [trackId, preview, eyebrow, trackUrl],
  );

  const title = track?.title ?? preview?.title ?? eyebrow;
  const art = track ? track.art : (preview?.art ?? null);
  const artist = track ? track.artist : (preview?.artist ?? null);

  return (
    // The whole card plays and pauses on a click; the play button stays the
    // keyboard and screen-reader control, and links inside keep their own.
    <div
      onClick={(event) => {
        if (status !== 'ready') return;
        if ((event.target as HTMLElement).closest('a, button')) return;
        togglePinned();
      }}
      className={`group flex w-full items-center gap-4 border border-rule bg-ink/55 p-3.5 backdrop-blur-md transition-colors duration-300 hover:border-detail md:p-4 ${
        status === 'ready' ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative size-[4.5rem] shrink-0">
        <Vinyl
          art={art}
          playing={playing}
          sizes="72px"
          className="record-solo shadow-[0_6px_16px_rgb(0_0_0/0.55)]"
        />
        {status === 'ready' ? (
          <button
            type="button"
            onClick={togglePinned}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            className="absolute inset-0 m-auto grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-[scale,background-color] duration-200 group-hover:scale-110 group-hover:bg-black/60"
          >
            <PlayGlyph playing={playing} size={12} />
          </button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="meta flex items-center gap-2 text-accent">
          {track ? 'Sampling' : eyebrow}
          {playing ? (
            // The bars paint in --muted; tint them sea here.
            <span className="inline-flex [--muted:var(--accent-detail)]">
              <EqBars playing={audible} />
            </span>
          ) : null}
        </p>
        <p className="mt-1.5 truncate text-base font-medium tracking-tight text-fg transition-colors duration-300 group-hover:text-detail">
          {title}
        </p>
        {status === 'failed' ? (
          <ExternalLink
            href={trackUrl}
            arrow
            className="link mt-0.5 inline-flex text-sm text-muted hover:text-fg"
          >
            Play on Spotify
          </ExternalLink>
        ) : (
          <p className="mt-0.5 truncate text-sm text-muted">
            {artist ?? (
              <Link href="/about#listening" className="link hover:text-fg">
                On the turntable
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
