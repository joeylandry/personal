'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { formatDuration, timeAgo } from '@/lib/format';
import { refreshListening, useListening } from '@/lib/use-listening';
import { listening } from '@/content';
import { ExternalLink } from './external-link';

/*
 * The Dynamic Island's music waveform, ported from anaclumos/dynamic-island
 * (MIT, src/MusicEqualizer.tsx + MusicEqualizerStick.tsx): six 2px sticks with
 * base lengths of 50/60/90/100/90/60%, each looping every 1.1s through five
 * random lengths around its base. Lengths are in 28ths of the box, as there.
 */
const EQ_BASES = [50, 60, 90, 100, 90, 60];
const EQ_SPAN = 28;

/** Five random lengths around `base` (0-100), as fractions of the box. */
function eqLoop(base: number): number[] {
  return Array.from({ length: 5 }, () => {
    const length = (Math.floor(Math.random() * EQ_SPAN) - EQ_SPAN) / 2 + (base / 100) * EQ_SPAN;
    return Math.max(length / EQ_SPAN, 0.1);
  });
}

/** The Dynamic Island's six-stick waveform; frozen under reduced motion. */
export function EqBars({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  // Lengths are rolled after hydration, straight onto the sticks, so the
  // server markup stays deterministic. Until then the sticks rest.
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    Array.from(box.children).forEach((stick, i) => {
      eqLoop(EQ_BASES[i]!).forEach((length, step) =>
        (stick as HTMLElement).style.setProperty(`--eq-${step}`, `${length * 100}%`),
      );
    });
    box.dataset.rolled = 'true';
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="eq inline-flex h-3.5 items-center gap-[2.5px]"
      data-playing={playing}
    >
      {EQ_BASES.map((base, i) => (
        <span key={i} style={{ '--eq-rest': `${base - 25}%` } as CSSProperties} />
      ))}
    </span>
  );
}

/** Whatever the player should show: a live track, or the snapshot's fallback. */
interface Shown {
  title: string;
  artist: string;
  art: string | null;
  url: string;
  durationMs: number;
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
 * The song on right now with its running progress, or the last thing played,
 * or — before Spotify answers, or on a deploy without it — the snapshot's song.
 */
function useLiveTrack() {
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

  const recent = data?.recent ?? [];
  const lastPlayed = current ? null : (recent[0] ?? null);
  const fallback = listening.onRepeat;

  const track: Shown = current?.track ?? lastPlayed?.track ?? fallback;
  const status = playing
    ? 'Now playing'
    : current
      ? 'Paused'
      : lastPlayed
        ? `Last played · ${timeAgo(lastPlayed.playedAt, now)}`
        : 'On repeat';
  const history = (current ? recent : recent.slice(1)).filter(
    (play) => play.track.id !== current?.track.id,
  );

  return {
    track,
    status,
    playing,
    live: Boolean(current),
    progress: current ? progress : lastPlayed ? 0 : fallback.progressMs,
    history,
    now,
  };
}

function Art({
  src,
  size,
  className = '',
}: {
  src: string | null;
  size: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded bg-[#282828] ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : null}
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 text-[#1ed760]">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path d="M4.6 8.3l2.2 2.2 4.6-4.7" fill="none" stroke="#000" strokeWidth="1.7" />
    </svg>
  );
}

/** Spotify's right-hand panel: big cover, title, and a short history when live. */
export function NowPlayingPanel() {
  const { track, status, playing, live, history, now } = useLiveTrack();

  return (
    <div>
      <div className="flex items-center gap-2.5">
        {live ? <EqBars playing={playing} /> : null}
        <p className="text-sm font-bold text-white">{status}</p>
      </div>
      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-lg bg-[#282828]">
        {track.art ? (
          <Image
            src={track.art}
            alt=""
            fill
            sizes="(min-width: 1024px) 18rem, 80vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <ExternalLink
            href={track.url}
            className="block truncate text-2xl font-bold tracking-tight text-white hover:underline"
          >
            {track.title}
          </ExternalLink>
          <p className="mt-0.5 truncate text-sm text-[#b3b3b3]">{track.artist}</p>
        </div>
        <span className="mt-2">
          <Check />
        </span>
      </div>

      {history.length > 0 ? (
        <div className="mt-6 rounded-lg bg-[#242424] p-4">
          <p className="text-sm font-bold text-white">Recently played</p>
          <ol className="mt-3 space-y-3">
            {history.slice(0, 4).map((play) => (
              <li key={play.playedAt} className="flex items-center gap-3">
                <Art src={play.track.art} size={40} />
                <div className="min-w-0 flex-1">
                  <ExternalLink
                    href={play.track.url}
                    className="block truncate text-sm text-white hover:underline"
                  >
                    {play.track.title}
                  </ExternalLink>
                  <p className="truncate text-xs text-[#b3b3b3]">{play.track.artist}</p>
                </div>
                <p className="shrink-0 text-xs text-[#b3b3b3]">{timeAgo(play.playedAt, now)}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/* Spotify's transport glyphs, drawn small. Decorative: this player can't steer mine. */
const glyph = 'size-4 fill-current';
const Shuffle = () => (
  <svg viewBox="0 0 16 16" className={glyph} aria-hidden="true">
    <path d="M13.2 2.5l2.3 2.2-2.3 2.3v-1.5h-1.4c-.9 0-1.7.4-2.2 1.1L5.7 12a4 4 0 01-3.2 1.6H.5V12h2a2.4 2.4 0 001.9-1L8.3 5.6a4 4 0 013.4-1.6h1.5zM.5 3.9h2a4 4 0 013.2 1.6l.6.8-1 1.3-.9-1.1a2.4 2.4 0 00-1.9-1H.5zm8.5 6.4l.6.8c.5.7 1.3 1.1 2.2 1.1h1.4v-1.5l2.3 2.3-2.3 2.2v-1.5h-1.5a4 4 0 01-3.2-1.6l-.5-.6z" />
  </svg>
);
const Previous = () => (
  <svg viewBox="0 0 16 16" className={glyph} aria-hidden="true">
    <path d="M3.3 1a.7.7 0 01.7.7v5.1l9.3-5.4a.7.7 0 011 .6v12a.7.7 0 01-1 .6L4 9.2v5.1a.7.7 0 01-1.4 0V1.7a.7.7 0 01.7-.7z" />
  </svg>
);
const Next = () => (
  <svg viewBox="0 0 16 16" className={glyph} aria-hidden="true">
    <path d="M12.7 1a.7.7 0 00-.7.7v5.1L2.7 1.4a.7.7 0 00-1 .6v12a.7.7 0 001 .6L12 9.2v5.1a.7.7 0 001.4 0V1.7a.7.7 0 00-.7-.7z" />
  </svg>
);
const Repeat = () => (
  <svg viewBox="0 0 16 16" className={glyph} aria-hidden="true">
    <path d="M0 4.75A3.75 3.75 0 013.75 1h8.5A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1 1-1.06 1.06L6.94 12.7l2.81-2.8 1.06 1.06-.99 1h2.43a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25h-8.5A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75z" />
  </svg>
);

/** The bar along the bottom of the window: current song, transport, progress. */
export function PlayerBar() {
  const { track, playing, live, progress } = useLiveTrack();
  const pct = track.durationMs ? (progress / track.durationMs) * 100 : 0;

  return (
    <div className="grid items-center gap-4 px-2 py-3 sm:grid-cols-[1fr_minmax(0,2fr)_1fr]">
      <div className="flex min-w-0 items-center gap-3">
        <Art src={track.art} size={56} />
        <div className="min-w-0">
          <p className="truncate text-sm text-white">{track.title}</p>
          <p className="truncate text-xs text-[#b3b3b3]">{track.artist}</p>
        </div>
        <Check />
      </div>

      <div className="min-w-0">
        <div
          aria-hidden="true"
          className="hidden items-center justify-center gap-6 text-[#b3b3b3] sm:flex"
        >
          <span className="text-[#1ed760]">
            <Shuffle />
          </span>
          <Previous />
          <span className="grid size-8 place-items-center rounded-full bg-white text-black">
            {playing ? (
              <svg viewBox="0 0 16 16" className="size-3.5 fill-current">
                <rect x="3" y="2" width="3.5" height="12" rx=".7" />
                <rect x="9.5" y="2" width="3.5" height="12" rx=".7" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="size-3.5 fill-current">
                <path d="M3.5 2.1a.7.7 0 011-.6l10 5.9a.7.7 0 010 1.2l-10 5.9a.7.7 0 01-1-.6z" />
              </svg>
            )}
          </span>
          <Next />
          <Repeat />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#b3b3b3] sm:mt-2">
          <span className="w-9 text-right tabular-nums">{formatDuration(progress)}</span>
          <div
            role="progressbar"
            aria-label="Song progress"
            aria-valuemin={0}
            aria-valuemax={Math.round(track.durationMs / 1000)}
            aria-valuenow={Math.round(progress / 1000)}
            aria-valuetext={`${formatDuration(progress)} of ${formatDuration(track.durationMs)}`}
            className="h-1 flex-1 overflow-hidden rounded-full bg-[#4d4d4d]"
          >
            <div
              className={`h-full rounded-full bg-white ${live ? 'transition-[width] duration-1000 ease-linear' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-9 tabular-nums">{formatDuration(track.durationMs)}</span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden items-center justify-end gap-3 text-[#b3b3b3] sm:flex"
      >
        <svg viewBox="0 0 16 16" className={glyph}>
          <path d="M9.7 2.1A.7.7 0 0111 2.6v10.8a.7.7 0 01-1.2.5L6.2 10.6H2.7A1.7 1.7 0 011 8.9V7.1c0-.9.8-1.7 1.7-1.7h3.5z" />
        </svg>
        <span className="h-1 w-24 rounded-full bg-white" />
      </div>
    </div>
  );
}
