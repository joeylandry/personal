'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { TrackPreview } from '@/lib/spotify';
import {
  backToPinned,
  loadPinned,
  restartPinned,
  togglePinned,
  usePinned,
} from '@/lib/pinned-player';
import { canOptimizeImage } from '@/lib/spotify-images';
import { ExternalLink } from './external-link';
import { EqBars } from './live-player';
import { PlayGlyph } from './vinyl';

/** m:ss, as the Now Playing scrubber shows it. */
function clock(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

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
    <svg viewBox="0 0 24 24" width={13} height={13} aria-hidden="true" fill="currentColor">
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

function SkipGlyph({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden="true"
      fill="currentColor"
      style={back ? { scale: '-1 1' } : undefined}
    >
      <path d="M3 6.9v10.2a.9.9 0 0 0 1.4.75L11.5 13v4.1a.9.9 0 0 0 1.4.75l7.7-5.1a.9.9 0 0 0 0-1.5L12.9 6.15a.9.9 0 0 0-1.4.75V11L4.4 6.15A.9.9 0 0 0 3 6.9Z" />
    </svg>
  );
}

/**
 * The site's sound, for the home hero, as a mini Now Playing: album art,
 * the song and artist, a scrubber with elapsed and remaining time, and
 * back / play / forward, on Apple's frosted dark card. It drives the same
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
    <div className="mini-now-playing rounded-[1.375rem] p-3.5 text-white">
      <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wide text-white/55 uppercase">
        <SpeakerGlyph />
        Site sound
        <span className="ml-auto flex items-center">{playing ? <EqBars playing /> : null}</span>
      </p>

      <div className="mt-3 flex items-center gap-3">
        <span className="relative block size-14 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-[0_4px_14px_rgb(0_0_0/0.45)]">
          {art ? (
            <Image
              src={art}
              alt=""
              fill
              sizes="56px"
              unoptimized={!canOptimizeImage(art)}
              className="object-cover"
            />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] leading-tight font-semibold tracking-tight">
            {title}
          </p>
          <p className="mt-0.5 truncate text-sm leading-tight text-white/60">
            {artist ?? (
              <Link href="/about#listening" className="hover:text-white">
                {track ? 'Sampling' : 'On the turntable'}
              </Link>
            )}
          </p>
        </div>
      </div>

      {status === 'failed' ? (
        <ExternalLink
          href={trackUrl}
          arrow
          className="mt-3 inline-flex text-sm font-medium text-white/70 hover:text-white"
        >
          Play on Spotify
        </ExternalLink>
      ) : (
        <>
          <div className="mt-3.5">
            <div
              role="progressbar"
              aria-label="Song progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration / 1000)}
              aria-valuenow={Math.round(elapsed / 1000)}
              className="h-1 overflow-hidden rounded-full bg-white/20"
            >
              <div className="h-full rounded-full bg-white/80" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[0.625rem] font-medium text-white/45 tabular-nums">
              <span>{clock(elapsed)}</span>
              <span>{duration > 0 ? `-${clock(duration - elapsed)}` : '--:--'}</span>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-center gap-7">
            <button
              type="button"
              onClick={restartPinned}
              disabled={!ready}
              aria-label="Back to the start"
              className="grid size-9 place-items-center rounded-full text-white/85 transition-[scale,color] duration-200 hover:text-white active:scale-90 disabled:opacity-40"
            >
              <SkipGlyph back />
            </button>
            <button
              type="button"
              onClick={togglePinned}
              disabled={!ready}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
              className="grid size-10 place-items-center rounded-full text-white transition-[scale] duration-200 active:scale-90 disabled:opacity-40"
            >
              <PlayGlyph playing={playing} size={28} />
            </button>
            <button
              type="button"
              onClick={backToPinned}
              disabled={!ready || !track}
              aria-label="Back to the site's song"
              className="grid size-9 place-items-center rounded-full text-white/85 transition-[scale,color] duration-200 hover:text-white active:scale-90 disabled:opacity-40"
            >
              <SkipGlyph />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
