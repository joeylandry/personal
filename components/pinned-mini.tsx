'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { TrackPreview } from '@/lib/spotify';
import { backToPinned, loadPinned, togglePinned, usePinned } from '@/lib/pinned-player';
import { canOptimizeImage } from '@/lib/spotify-images';
import { ExternalLink } from './external-link';
import { EqBars } from './live-player';
import { PlayGlyph } from './vinyl';

/**
 * The song's position, run forward between the embed's updates while it
 * plays, so the scrubber moves smoothly.
 */
function usePosition(playing: boolean, position: number, duration: number, at: number) {
  const [now, setNow] = useState(at);
  useEffect(() => {
    if (!playing) return;
    const tick = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(tick);
  }, [playing, at]);
  const elapsed = playing ? position + Math.max(0, now - at) : position;
  return duration > 0 ? Math.min(elapsed, duration) : 0;
}

function SpeakerGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={11} height={11} aria-hidden="true" fill="currentColor">
      <path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />
      <path
        d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4M18.2 6.2a8.2 8.2 0 0 1 0 11.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SkipGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" fill="currentColor">
      <path d="M3 6.9v10.2a.9.9 0 0 0 1.4.75L11.5 13v4.1a.9.9 0 0 0 1.4.75l7.7-5.1a.9.9 0 0 0 0-1.5L12.9 6.15a.9.9 0 0 0-1.4.75V11L4.4 6.15A.9.9 0 0 0 3 6.9Z" />
    </svg>
  );
}

/**
 * The site's sound, for the home hero, as a mini Now Playing: one compact
 * row of album art, the song and artist, and play / forward, with a hairline
 * of progress along the bottom, on Apple's frosted dark card. It drives the same
 * shared player as the About page's turntable and the header's island.
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
  const { status, playing, track, position, duration, at } = usePinned();
  const elapsed = usePosition(playing, position, duration, at);

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
  const ready = status === 'ready';
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div className="mini-now-playing relative flex items-center gap-2.5 overflow-hidden rounded-2xl py-2 pr-2 pl-2 text-white">
      <span className="relative block size-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
        {art ? (
          <Image
            src={art}
            alt=""
            fill
            sizes="40px"
            unoptimized={!canOptimizeImage(art)}
            className="object-cover"
          />
        ) : null}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[0.625rem] leading-none font-semibold tracking-wide text-white/50 uppercase">
          <SpeakerGlyph />
          Site sound
          {playing ? (
            <span className="ml-1 flex scale-75 items-center">
              <EqBars playing />
            </span>
          ) : null}
        </p>
        <p className="mt-1 truncate text-sm leading-tight font-semibold tracking-tight">{title}</p>
        <p className="truncate text-xs leading-tight text-white/55">
          {artist ?? (
            <Link href="/about#listening" className="hover:text-white">
              {track ? 'Sampling' : 'On the turntable'}
            </Link>
          )}
        </p>
      </div>

      {status === 'failed' ? (
        <ExternalLink
          href={trackUrl}
          arrow
          className="shrink-0 px-1.5 text-xs font-medium text-white/70 hover:text-white"
        >
          Spotify
        </ExternalLink>
      ) : (
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={togglePinned}
            disabled={!ready}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            className="grid size-8 place-items-center rounded-full transition-[scale] duration-200 active:scale-90 disabled:opacity-40"
          >
            <PlayGlyph playing={playing} size={20} />
          </button>
          <button
            type="button"
            onClick={backToPinned}
            disabled={!ready || !track}
            aria-label="Back to the site's song"
            className="grid size-8 place-items-center rounded-full text-white/85 transition-[scale,color] duration-200 hover:text-white active:scale-90 disabled:opacity-35"
          >
            <SkipGlyph />
          </button>
        </div>
      )}

      {duration > 0 ? (
        <div
          role="progressbar"
          aria-label="Song progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration / 1000)}
          aria-valuenow={Math.round(elapsed / 1000)}
          className="absolute inset-x-4 bottom-[3px] h-0.5 overflow-hidden rounded-full bg-white/15"
        >
          <div className="h-full bg-white/75" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </div>
  );
}
