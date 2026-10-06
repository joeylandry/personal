'use client';

import Link from 'next/link';
import type { TrackPreview } from '@/lib/spotify';
import { PINNED_EMBED_HEIGHT, PINNED_MOUNT_ID, togglePinned, usePinned } from '@/lib/pinned-player';
import { PlayGlyph, Vinyl } from './vinyl';

/**
 * Lives in the root layout, so it survives client-side navigation.
 *
 * It holds the one Spotify embed the whole site plays through (kept off
 * screen; the records are the controls), and a floating mini record that
 * appears once the song has been started, so it can be paused from any page.
 * The dock steps aside while one of the records is on screen.
 */
export function PinnedDock({
  eyebrow,
  preview,
}: {
  eyebrow: string;
  preview: TrackPreview | null;
}) {
  const { status, playing, started, visibleRecords } = usePinned();
  const title = preview?.title ?? eyebrow;
  const shown = started && status === 'ready' && visibleRecords === 0;

  return (
    <>
      {/* Spotify's iFrame API swaps its player in here. Transparent and
          behind the page, but in the viewport and not display:none: browsers
          throttle or refuse to play from frames that are hidden or off screen. */}
      <div
        id={PINNED_MOUNT_ID}
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 -z-10 w-[300px] overflow-hidden opacity-0"
        style={{ height: PINNED_EMBED_HEIGHT }}
      />

      <div
        data-print-hide
        aria-hidden={!shown}
        inert={!shown}
        className={[
          'fixed right-4 bottom-4 z-40 transition-[opacity,translate] duration-300 ease-out md:right-6 md:bottom-6',
          shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        ].join(' ')}
      >
        <div className="surface-ink flex items-center gap-3 rounded-full border border-rule bg-ink/85 py-1.5 pr-2 pl-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md">
          <Link
            href="/about#listening"
            aria-label={`${title}, on the About page`}
            className="block size-11 shrink-0"
          >
            <Vinyl
              art={preview?.art ?? null}
              playing={playing}
              sizes="44px"
              className="record-solo"
            />
          </Link>
          <div className="max-w-[9.5rem] min-w-0 sm:max-w-[12rem]">
            <p className="meta truncate text-[0.625rem] text-detail">{eyebrow}</p>
            <p className="truncate text-sm font-medium text-fg">{title}</p>
          </div>
          <button
            type="button"
            onClick={togglePinned}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-fg text-ink transition-[scale] duration-200 hover:scale-105"
          >
            <PlayGlyph playing={playing} size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
