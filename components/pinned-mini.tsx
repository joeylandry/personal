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
  const { status, playing, track } = usePinned();

  useEffect(() => loadPinned(trackId), [trackId]);

  const title = track?.title ?? preview?.title ?? eyebrow;
  const art = track ? track.art : (preview?.art ?? null);
  const artist = track ? track.artist : (preview?.artist ?? null);

  return (
    <div className="flex items-center gap-4 border border-rule bg-ink/55 p-3.5 backdrop-blur-md md:p-4">
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
            className="absolute inset-0 m-auto grid size-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-[scale,background-color] duration-200 hover:scale-110 hover:bg-black/60"
          >
            <PlayGlyph playing={playing} size={12} />
          </button>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="meta flex items-center gap-2 text-detail">
          {track ? 'Sampling' : eyebrow}
          {playing ? <EqBars playing /> : null}
        </p>
        <p className="mt-1.5 truncate text-base font-medium tracking-tight text-fg">{title}</p>
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
