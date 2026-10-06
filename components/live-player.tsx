'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { formatDuration, timeAgo } from '@/lib/format';
import type { NowPlaying, RecentPlay, Track } from '@/lib/spotify';
import { canOptimizeImage } from '@/lib/spotify-images';
import { refreshListening, useListening } from '@/lib/use-listening';
import { playOnRecord, usePinned } from '@/lib/pinned-player';

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

interface PlayerState {
  current: NowPlaying | null;
  playing: boolean;
  /** Extrapolated position of `current`, in ms. */
  progress: number;
  now: number;
  /** The song in the big slot: what's on, or the last thing played. */
  lead: Track;
  /** When `lead` came from history, when it played. */
  leadPlayedAt: string | null;
  history: RecentPlay[];
}

/**
 * Everything the player variants share: the polled data, a progress estimate
 * that runs between polls, and an early re-poll when the song should have
 * ended. Null while loading (`undefined`) or when there's nothing to show.
 */
function usePlayer(): PlayerState | null | undefined {
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

  if (data === null) return undefined;
  if (!data.configured || (!current && data.recent.length === 0)) return null;

  const lead = current?.track ?? data.recent[0]!.track;
  const history = (current ? data.recent : data.recent.slice(1)).filter(
    (play) => play.track.id !== current?.track.id,
  );
  return {
    current,
    playing,
    progress,
    now,
    lead,
    leadPlayedAt: current ? null : (data.recent[0]?.playedAt ?? null),
    history,
  };
}

/* ---------------------------------------------------------------------------
   Building blocks, shared by the full and compact players
   --------------------------------------------------------------------------- */

/** Rounded album art with a soft drop shadow, like Apple Music's. */
export function Artwork({
  track,
  className = '',
  sizes,
  shadow = true,
}: {
  track: Track;
  className?: string;
  /** `sizes` for next/image; the art is rendered at the box's size. */
  sizes: string;
  shadow?: boolean;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-white/10 ${shadow ? 'glass-art-shadow' : ''} ${className}`}
    >
      {track.art ? (
        <Image
          src={track.art}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!canOptimizeImage(track.art)}
          className="object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center text-white/40">
          <NoteGlyph />
        </span>
      )}
    </div>
  );
}

function NoteGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="40%" height="40%" fill="currentColor" aria-hidden="true">
      <path d="M17 3.5v10.8a3.2 3.2 0 1 1-1.6-2.77V7.3L9.6 8.6v7.7a3.2 3.2 0 1 1-1.6-2.77V5.5a1 1 0 0 1 .78-.98l7.2-1.6A1 1 0 0 1 17 3.5Z" />
    </svg>
  );
}

/** Puts a song from Spotify's history on the site's record player. */
function sample(track: Track) {
  playOnRecord({
    id: track.id,
    title: track.title,
    artist: track.artist,
    art: track.art,
    url: track.url,
  });
}

/** True while this song is the one spinning on the site's record. */
function useOnRecord(track: Track): boolean {
  const { track: onRecord, playing } = usePinned();
  return playing && onRecord?.id === track.id;
}

function SmallPlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="40%" height="40%" fill="currentColor" aria-hidden="true">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}

/** A frosted play button over a song's artwork: "put this on the record". */
function SampleButton({ track, className = '' }: { track: Track; className?: string }) {
  const onRecord = useOnRecord(track);
  return (
    <button
      type="button"
      onClick={() => sample(track)}
      aria-label={`Play ${track.title} on the record player`}
      className={`glass-sample ${className}`}
    >
      {onRecord ? <EqBars playing /> : <SmallPlayGlyph />}
    </button>
  );
}

/** The album art again, blown up and blurred into a coloured glow behind the glass. */
function Ambient({ track }: { track: Track }) {
  return (
    <div aria-hidden="true" className="glass-ambient">
      {track.art ? (
        <>
          {['glass-ambient-a', 'glass-ambient-b'].map((layer) => (
            <Image
              key={layer}
              src={track.art!}
              alt=""
              fill
              sizes="96px"
              unoptimized={!canOptimizeImage(track.art!)}
              className={`${layer} object-cover`}
            />
          ))}
        </>
      ) : (
        <div className="glass-ambient-fallback" />
      )}
      <div className="glass-ambient-tint" />
    </div>
  );
}

/** The small capsule in the corner: equaliser plus state. */
function StatusPill({ state }: { state: PlayerState }) {
  const label = state.playing ? 'Now playing' : state.current ? 'Paused' : 'Last played';
  return (
    <p className="glass-pill">
      {state.current ? <EqBars playing={state.playing} /> : null}
      <span>{label}</span>
    </p>
  );
}

/** Rounded progress capsule with elapsed time and time remaining, Apple style. */
function ProgressCapsule({ current, progress }: { current: NowPlaying; progress: number }) {
  const duration = current.track.durationMs;
  return (
    <div>
      <div
        role="progressbar"
        aria-label="Song progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration / 1000)}
        aria-valuenow={Math.round(progress / 1000)}
        aria-valuetext={`${formatDuration(progress)} of ${formatDuration(duration)}`}
        className="glass-progress"
      >
        <div
          className="glass-progress-fill"
          style={{ width: `${Math.min(100, (progress / duration) * 100)}%` }}
        />
      </div>
      <div
        aria-hidden="true"
        className="mt-2 flex justify-between text-[11px] font-medium text-white/50 tabular-nums"
      >
        <span>{formatDuration(progress)}</span>
        <span>−{formatDuration(duration - progress)}</span>
      </div>
    </div>
  );
}

/** Title and artist, linking out to the song. */
function TrackTitle({ track, size }: { track: Track; size: 'lg' | 'sm' }) {
  return (
    <div className="min-w-0">
      <a
        href={track.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block truncate font-semibold tracking-tight text-white transition-opacity hover:opacity-75 ${
          size === 'lg' ? 'text-xl sm:text-2xl lg:text-[1.75rem] lg:leading-tight' : 'text-[15px]'
        }`}
      >
        {track.title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p
        className={`truncate text-white/65 ${size === 'lg' ? 'mt-1 text-base sm:text-lg' : 'text-[13px]'}`}
      >
        {track.artist}
      </p>
      {size === 'lg' ? (
        <p className="mt-0.5 truncate text-sm text-white/40 sm:text-base">{track.album}</p>
      ) : null}
    </div>
  );
}

/**
 * "Recently played" as an iOS list: rounded art, inset separators, and a
 * rounded highlight across the whole row. Tapping a row puts that song on the
 * site's record player; the arrow beside it opens it in Spotify.
 */
function RecentList({ plays, now }: { plays: RecentPlay[]; now: number }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="glass-panel">
      <h3 id={headingId} className="px-3 pt-2 pb-1 text-[15px] font-semibold text-white">
        Recently played
      </h3>
      <ol className="mt-1">
        {plays.map((play) => (
          <RecentRow key={play.playedAt} play={play} now={now} />
        ))}
      </ol>
    </section>
  );
}

function Skeleton({ variant }: { variant: 'full' | 'compact' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-raised ${
        variant === 'full' ? 'h-[30rem] rounded-[28px] lg:h-[24rem]' : 'h-28 rounded-[22px]'
      }`}
    />
  );
}

/* ---------------------------------------------------------------------------
   The player
   --------------------------------------------------------------------------- */

/**
 * Apple-style "now playing" card on frosted glass over the album's own colours:
 * the song on right now with a running progress capsule, or the last thing
 * played, then a short history. Renders nothing until Spotify is connected, so
 * an unconfigured deploy just shows the pinned record.
 *
 * `variant="compact"` is the widget-sized version (art, title, progress; no
 * history) for tighter spots such as the home hero.
 */
export function LivePlayer({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const state = usePlayer();
  if (state === undefined) return <Skeleton variant={variant} />;
  if (state === null) return null;

  const { current, lead, history, now, progress, playing } = state;

  if (variant === 'compact') {
    return (
      <div className="glass-card rounded-[22px]" data-playing={playing}>
        <Ambient track={lead} />
        <div className="relative flex items-center gap-3.5 p-3.5">
          <Artwork track={lead} sizes="56px" className="size-14 rounded-xl" />
          <div className="min-w-0 flex-1">
            <TrackTitle track={lead} size="sm" />
            {current ? (
              <div className="mt-2">
                <ProgressCapsule current={current} progress={progress} />
              </div>
            ) : null}
          </div>
          {current ? (
            <span className="self-start pt-1">
              <EqBars playing={playing} />
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  const recent = history.slice(0, 5);
  return (
    <div className="glass-card rounded-[24px] sm:rounded-[32px]" data-playing={playing}>
      <Ambient track={lead} />
      <div
        className={`relative grid gap-6 p-4 sm:p-7 lg:gap-8 lg:p-8 ${
          recent.length > 0 ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : ''
        }`}
      >
        <div className="flex min-w-0 flex-col p-1 sm:p-0">
          <div className="flex items-center justify-between gap-3">
            <StatusPill state={state} />
            {state.leadPlayedAt ? (
              <p className="text-xs font-medium text-white/50">
                {timeAgo(state.leadPlayedAt, now)}
              </p>
            ) : (
              <p className="text-xs font-medium text-white/50">Live from Spotify</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 sm:mt-8 sm:gap-6 lg:flex-1">
            <div className="relative shrink-0">
              <Artwork
                track={lead}
                sizes="(min-width: 1024px) 224px, (min-width: 640px) 168px, 96px"
                className="glass-art size-24 rounded-2xl sm:size-42 lg:size-56"
              />
              <SampleButton
                track={lead}
                className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3"
              />
            </div>
            <TrackTitle track={lead} size="lg" />
          </div>

          {current ? (
            <div className="mt-6 sm:mt-8">
              <ProgressCapsule current={current} progress={progress} />
            </div>
          ) : null}
        </div>

        {recent.length > 0 ? <RecentList plays={recent} now={now} /> : null}
      </div>
    </div>
  );
}

function RecentRow({ play, now }: { play: RecentPlay; now: number }) {
  const onRecord = useOnRecord(play.track);
  return (
    <li className="ios-row flex items-center">
      <button
        type="button"
        onClick={() => sample(play.track)}
        aria-label={`Play ${play.track.title} by ${play.track.artist} on the record player`}
        className="ios-row-link min-w-0 flex-1 text-left"
        data-on-record={onRecord}
      >
        <span className="relative shrink-0">
          <Artwork track={play.track} sizes="44px" shadow={false} className="size-11 rounded-lg" />
          <span className="ios-row-play" aria-hidden="true">
            {onRecord ? <EqBars playing /> : <SmallPlayGlyph />}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-white">
            {play.track.title}
          </span>
          <span className="block truncate text-[13px] text-white/55">{play.track.artist}</span>
        </span>
        <span className="shrink-0 text-xs text-white/40 tabular-nums">
          {onRecord ? 'On the record' : timeAgo(play.playedAt, now)}
        </span>
      </button>
      <a
        href={play.track.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${play.track.title} on Spotify (opens in a new tab)`}
        className="ios-row-out"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
          <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </a>
    </li>
  );
}
