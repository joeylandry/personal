'use client';

import { useEffect, useRef } from 'react';
import type { TrackPreview } from '@/lib/spotify';
import {
  PINNED_EMBED_HEIGHT,
  loadPinned,
  togglePinned,
  usePinned,
  useRecordOnScreen,
} from '@/lib/pinned-player';
import { ExternalLink } from './external-link';
import { EqBars } from './live-player';
import { PlayGlyph, Vinyl } from './vinyl';

/**
 * The pinned song as a record on a turntable.
 *
 * It plays through the site's one shared Spotify player (`lib/pinned-player`),
 * so it is the same song, in the same state, as the hero's mini record and
 * the floating dock: start it here and it keeps playing as you browse. If
 * Spotify's iFrame API never arrives, Spotify's plain embed takes the place of
 * the controls, and without JavaScript a `<noscript>` embed still plays it.
 */
export function RecordPlayer({
  trackId,
  eyebrow,
  preview,
  embedUrl,
  trackUrl,
}: {
  trackId: string;
  /** Small label above the title, e.g. "My mind currently". */
  eyebrow: string;
  /** Title, artist and art for the label; null shows a neutral label. */
  preview: TrackPreview | null;
  embedUrl: string;
  trackUrl: string;
}) {
  const { status, playing } = usePinned();
  const deckRef = useRef<HTMLDivElement>(null);
  useRecordOnScreen(deckRef);

  useEffect(() => loadPinned(trackId), [trackId]);

  const title = preview?.title ?? eyebrow;
  const art = preview?.art ?? null;
  const label = playing ? `Pause ${title}` : `Play ${title}`;

  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
      {/* The turntable. Decorative apart from the play button on the label. */}
      <div className="md:col-span-7">
        <div ref={deckRef} className="turntable" data-playing={playing}>
          <div className="turntable-platter" aria-hidden="true" />
          <Vinyl
            art={art}
            playing={playing}
            sizes="(min-width: 768px) 200px, 30vw"
            blankLabel={eyebrow}
          />
          <div className="record-sheen" aria-hidden="true" />
          <div className="record-spindle" aria-hidden="true" />
          {status === 'ready' ? (
            <button
              type="button"
              onClick={togglePinned}
              aria-label={label}
              className="record-button"
            >
              <PlayGlyph playing={playing} />
            </button>
          ) : null}
          <svg className="tonearm" viewBox="0 0 80 260" aria-hidden="true">
            <defs>
              <linearGradient id="tonearm-metal" x1="0" x2="1">
                <stop offset="0" stopColor="#c9d3d9" />
                <stop offset="0.5" stopColor="#f4f7f9" />
                <stop offset="1" stopColor="#8d9aa3" />
              </linearGradient>
            </defs>
            <circle cx="52" cy="34" r="24" fill="#16232c" stroke="rgb(255 255 255 / 0.1)" />
            <circle cx="52" cy="34" r="12" fill="url(#tonearm-metal)" />
            <rect x="46" y="4" width="12" height="16" rx="3" fill="#2a3a44" />
            <path
              d="M52 34 L52 176 Q52 200 36 214"
              fill="none"
              stroke="url(#tonearm-metal)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect
              x="22"
              y="208"
              width="22"
              height="34"
              rx="4"
              transform="rotate(38 33 225)"
              fill="#24323b"
              stroke="rgb(255 255 255 / 0.18)"
            />
          </svg>
        </div>
      </div>

      <div className="md:col-span-5">
        <p className="meta text-detail">{eyebrow}</p>
        <h3 className="mt-4 text-heading font-semibold text-fg">{title}</h3>
        {preview?.artist ? <p className="mt-2 text-lead text-muted">{preview.artist}</p> : null}

        <p className="mt-6 flex items-center gap-2.5 text-sm text-muted" aria-live="polite">
          <EqBars playing={playing} />
          <span>
            {playing ? 'Spinning now, all over the site' : 'Press play to drop the needle'}
          </span>
        </p>

        {status === 'failed' ? (
          <iframe
            title={`${title}, Spotify player`}
            src={embedUrl}
            width="100%"
            height={PINNED_EMBED_HEIGHT}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="mt-4 block rounded-xl border-0"
          />
        ) : (
          <button
            type="button"
            onClick={togglePinned}
            disabled={status !== 'ready'}
            aria-label={label}
            className="glass-cta mt-5 disabled:cursor-wait disabled:opacity-60"
          >
            <PlayGlyph playing={playing} size={16} />
            {playing ? 'Pause' : 'Play'}
          </button>
        )}
        <noscript>
          <iframe
            title={`${title}, Spotify player`}
            src={embedUrl}
            width="100%"
            height={PINNED_EMBED_HEIGHT}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ display: 'block', marginTop: 16, border: 0, borderRadius: 12 }}
          />
        </noscript>

        <p className="mt-5">
          <ExternalLink
            href={trackUrl}
            arrow
            className="link meta inline-flex items-center text-faint hover:text-fg"
          >
            Open in Spotify
          </ExternalLink>
        </p>
      </div>
    </div>
  );
}
