'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { formatDuration, timeAgo } from '@/lib/format';
import type { Track } from '@/lib/spotify';
import { refreshListening, useListening } from '@/lib/use-listening';
import { ExternalLink } from './external-link';

/** The Dynamic Island's six-bar waveform; frozen under reduced motion. */
export function EqBars({ playing }: { playing: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="eq inline-flex h-3 items-center gap-[2px]"
      data-playing={playing}
    >
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function Art({ track, size }: { track: Track; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden border border-rule bg-ink-high"
      style={{ width: size, height: size }}
    >
      {track.art ? (
        <Image src={track.art} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : null}
    </div>
  );
}

/**
 * Ticks once a second while a song plays, so the bar moves between polls, and
 * twice a minute otherwise to keep "12m ago" honest.
 */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), active ? 1000 : 30_000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

/**
 * Sonos-style "now playing" card: the song on right now with a running
 * progress bar, or the last thing played, then a short history. Renders
 * nothing until Spotify is connected, so an unconfigured deploy just shows the
 * pinned track.
 */
export function LivePlayer() {
  const { data, receivedAt } = useListening();
  const playing = data?.nowPlaying?.isPlaying ?? false;
  const now = useNow(playing);
  const refreshedFor = useRef<string | null>(null);

  const current = data?.nowPlaying ?? null;
  const progress = current
    ? Math.min(
        current.track.durationMs,
        current.progressMs + (current.isPlaying ? Math.max(0, now - receivedAt) : 0),
      )
    : 0;

  // When the song should have ended, ask what came next rather than waiting out the poll.
  useEffect(() => {
    if (!current?.isPlaying || progress < current.track.durationMs) return;
    if (refreshedFor.current === current.track.id) return;
    refreshedFor.current = current.track.id;
    refreshListening();
  }, [current, progress]);

  if (data === null) {
    return (
      <div aria-hidden="true" className="h-[22rem] animate-pulse border border-rule bg-raised" />
    );
  }
  if (!data.configured || (!current && data.recent.length === 0)) return null;

  const lead = current?.track ?? data.recent[0]!.track;
  const history = (current ? data.recent : data.recent.slice(1)).filter(
    (play) => play.track.id !== current?.track.id,
  );

  return (
    <div className="border border-rule bg-raised p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        {current ? <EqBars playing={playing} /> : null}
        <p className="meta text-detail">
          {playing ? 'Now playing' : current ? 'Paused' : 'Last played'}
        </p>
        {!current && data.recent[0] ? (
          <p className="meta ml-auto text-faint">{timeAgo(data.recent[0].playedAt, now)}</p>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-5">
        <Art track={lead} size={96} />
        <div className="min-w-0">
          <ExternalLink
            href={lead.url}
            className="link block truncate text-lg font-medium tracking-tight text-fg"
          >
            {lead.title}
          </ExternalLink>
          <p className="mt-1 truncate text-sm text-muted">{lead.artist}</p>
          <p className="mt-0.5 truncate text-sm text-faint">{lead.album}</p>
        </div>
      </div>

      {current ? (
        <div className="mt-5">
          <div
            role="progressbar"
            aria-label="Song progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(current.track.durationMs / 1000)}
            aria-valuenow={Math.round(progress / 1000)}
            aria-valuetext={`${formatDuration(progress)} of ${formatDuration(current.track.durationMs)}`}
            className="h-1 overflow-hidden bg-rule"
          >
            <div
              className="h-full bg-accent transition-[width] duration-1000 ease-linear"
              style={{ width: `${(progress / current.track.durationMs) * 100}%` }}
            />
          </div>
          <div className="meta mt-2 flex justify-between text-faint">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(current.track.durationMs)}</span>
          </div>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div className="mt-7">
          <p className="meta text-faint">Recently played</p>
          <ol className="mt-3">
            {history.slice(0, 5).map((play) => (
              <li key={play.playedAt} className="rule-t flex items-center gap-3 py-2.5">
                <Art track={play.track} size={36} />
                <div className="min-w-0 flex-1">
                  <ExternalLink
                    href={play.track.url}
                    className="link block truncate text-sm text-fg"
                  >
                    {play.track.title}
                  </ExternalLink>
                  <p className="truncate text-xs text-muted">{play.track.artist}</p>
                </div>
                <p className="meta shrink-0 text-faint">{timeAgo(play.playedAt, now)}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
