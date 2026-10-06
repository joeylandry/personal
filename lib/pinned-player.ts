'use client';

import { useSyncExternalStore } from 'react';
import { createAudioRecord, hasPreview } from './record-audio';

/**
 * One player for the site's records, shared by all of them.
 *
 * It plays songs' 30-second previews through a single `<audio>` element
 * (`lib/record-audio.ts`) that outlives client-side navigation, so the music
 * keeps going as you browse. The home hero's mini record, the About page's
 * turntable, the live player's rows and the header's island all read this
 * store and call into it, which is what keeps them in step. Any other song
 * (one from the live player's history, say) can be put on the record with
 * `playOnRecord`, and `backToPinned` puts the pick back.
 *
 * The player answers late, out of order, or not at all (a slow network, a
 * phone refusing to play), so the store tracks what the visitor asked for
 * (play or pause) and shows that straight away, then only believes the
 * player again once it agrees or a grace period runs out. The state machine
 * takes the player as an `EmbedController`, the interface of Spotify's
 * iFrame embed it used to drive, and is covered against a deliberately
 * misbehaving one in `tests/pinned-player.test.ts`.
 */

/** Height of Spotify's plain embed, the fallback when the player can't start. */
export const PINNED_EMBED_HEIGHT = 80;

/** What the embed reports, several times a second while it plays. */
export interface PlaybackData {
  isPaused: boolean;
  isBuffering?: boolean;
  /** Milliseconds. */
  position: number;
  /** Milliseconds; 0 until the song has loaded. */
  duration: number;
  /** The song the update is about; newer versions of the embed send it. */
  playingURI?: string;
}

export interface PlaybackUpdate {
  data: PlaybackData;
}

export interface EmbedController {
  addListener(event: 'ready', callback: () => void): void;
  addListener(event: 'playback_update', callback: (event: PlaybackUpdate) => void): void;
  loadUri(uri: string): void;
  play(): void;
  pause(): void;
  resume(): void;
  seek(seconds: number): void;
  togglePlay(): void;
  destroy(): void;
}

export type PinnedStatus = 'idle' | 'loading' | 'ready' | 'failed';

/** A song on the record. */
export interface RecordTrack {
  id: string;
  title: string;
  artist: string | null;
  art: string | null;
  url: string;
}

export interface PinnedState {
  status: PinnedStatus;
  /**
   * The needle is down: the song is playing or about to. Follows the
   * visitor's last press straight away, so the buttons never lag.
   */
  playing: boolean;
  /**
   * Sound is actually coming out: playing, not buffering, and past the start.
   * The waveforms follow this so they only move with the music.
   */
  audible: boolean;
  /** The song on the record when it isn't the pinned one; null means the pick. */
  track: RecordTrack | null;
  /** The pick itself, as the records describe it; for the header's island. */
  pinned: RecordTrack | null;
  /** True once anything has been played; the header's island shows from then on. */
  started: boolean;
}

/** How long a newly loaded song gets to start before the record believes the embed again. */
export const LOAD_GRACE = 8000;
/** How long a play or pause press gets to take before the record believes the embed again. */
export const PRESS_GRACE = 3000;
/** When to send `play()` (or `pause()`) again if the embed hasn't done as asked. */
const RETRIES = [1000, 2500];
/** How long the embed gets to be ready before the records fall back to a plain embed. */
export const LOAD_TIMEOUT = 12_000;
/** How close to the end counts as the end, in ms. */
const END_SLACK = 400;
/** How long past the expected end, with no word from the embed, before the record stops anyway. */
const END_OVERRUN = 1500;
/** A newly loaded song can't be further in than the time since loading plus this. */
const LOAD_POSITION_SLACK = 1500;
/** Updates this soon after loading a song are about the one it replaced. */
const STRAGGLER_WINDOW = 500;

const uriFor = (id: string) => `spotify:track:${id}`;

type Pending =
  /** A new song was loaded and should start. */
  | { kind: 'load'; at: number }
  /** Play was pressed (resume, or restart after the end). */
  | { kind: 'play'; at: number }
  | { kind: 'pause'; at: number };

export interface PlayerDeps {
  /** Creates the embed with `uri` loaded; rejects if it can't. */
  createEmbed(uri: string): Promise<EmbedController>;
  /** Opens a song on Spotify when the embed is unavailable. */
  openUrl(url: string): void;
  /** False when a song is known to be unplayable here (no preview); it opens on Spotify instead. */
  canPlay?: (id: string) => boolean;
  now?: () => number;
}

export interface RecordPlayerStore {
  getState(): PinnedState;
  subscribe(listener: () => void): () => void;
  loadPinned(trackId: string, pinned?: RecordTrack): void;
  togglePinned(): void;
  playOnRecord(track: RecordTrack): void;
  backToPinned(): void;
}

const INITIAL: PinnedState = {
  status: 'idle',
  playing: false,
  audible: false,
  track: null,
  pinned: null,
  started: false,
};

/**
 * The record player's state machine, with the embed passed in so tests can
 * drive it with a simulated one. The site uses the single instance below.
 */
export function createRecordPlayer(deps: PlayerDeps): RecordPlayerStore {
  const now = deps.now ?? (() => Date.now());
  let state: PinnedState = INITIAL;
  const listeners = new Set<() => void>();

  let controller: EmbedController | null = null;
  let pinnedId: string | null = null;
  /** The song loaded in the embed. */
  let loadedId: string | null = null;
  /** A song asked for before the embed was ready; it goes on as soon as it is. */
  let queued: RecordTrack | null = null;

  let pending: Pending | null = null;
  let graceTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimers: ReturnType<typeof setTimeout>[] = [];

  /** True once the song (or its 30-second sample) has run out. */
  let ended = false;
  /** Where the embed last said the song was, for telling a finish from a fresh start. */
  let lastPosition = 0;
  let lastDuration = 0;
  /**
   * Fires when the song should have run out. The embed doesn't always say
   * when a sample ends (it can stop sending updates while still reporting
   * "playing"), so every update pushes this back; if none arrives by then,
   * the record stops anyway.
   */
  let endTimer: ReturnType<typeof setTimeout> | null = null;

  function set(patch: Partial<PinnedState>) {
    const next = { ...state, ...patch };
    const keys = Object.keys(next) as (keyof PinnedState)[];
    if (keys.every((key) => next[key] === state[key])) return;
    state = next;
    listeners.forEach((listener) => listener());
  }

  function clearEndTimer() {
    if (endTimer) clearTimeout(endTimer);
    endTimer = null;
  }

  function clearPending() {
    if (graceTimer) clearTimeout(graceTimer);
    retryTimers.forEach(clearTimeout);
    graceTimer = null;
    retryTimers = [];
    pending = null;
  }

  /**
   * Waits for the embed to do as asked, sending the command again a couple
   * of times (a `play()` straight after `loadUri()` can land before the new
   * song is ready, notably on phones). If it never does, the record stops
   * pretending and the next update decides.
   */
  function awaitEmbed(kind: Pending['kind'], resend: () => void) {
    clearPending();
    pending = { kind, at: now() };
    const mine = pending;
    retryTimers = RETRIES.map((delay) =>
      setTimeout(() => {
        if (pending === mine) resend();
      }, delay),
    );
    graceTimer = setTimeout(
      () => {
        if (pending !== mine) return;
        clearPending();
        // A press that never took: show what the embed last said.
        if (kind === 'pause') return;
        set({ playing: false, audible: false });
      },
      kind === 'load' ? LOAD_GRACE : PRESS_GRACE,
    );
  }

  /** The song ran out: lift the needle and let the record stop. */
  function finish() {
    clearEndTimer();
    clearPending();
    ended = true;
    set({ playing: false, audible: false });
  }

  function onUpdate({ data }: PlaybackUpdate) {
    const { isPaused, isBuffering = false, position, duration, playingURI } = data;

    // An update about another song: one still in flight from the song this replaced.
    if (playingURI && loadedId && playingURI !== uriFor(loadedId)) return;

    if (pending) {
      const elapsed = now() - pending.at;
      if (pending.kind === 'pause') {
        if (!isPaused) return;
      } else {
        // An update from before the press: the old song, or the end of this one.
        if (isPaused) return;
        if (pending.kind === 'load' && !playingURI) {
          // Without URIs, the old song is told apart by timing: nothing new
          // plays this soon, nor further in than the time since loading.
          if (elapsed < STRAGGLER_WINDOW || position > elapsed + LOAD_POSITION_SLACK) return;
        }
        if (pending.kind === 'play' && duration > 0 && position >= duration - END_SLACK) return;
        // It's starting: no more nudging, and nothing is news until sound comes out.
        retryTimers.forEach(clearTimeout);
        retryTimers = [];
        if (isBuffering || position <= 0) return;
      }
      clearPending();
    }

    const atEnd = duration > 0 && position >= duration - END_SLACK;
    if (!isPaused && atEnd) {
      // Still "playing" at the end of the sample: pause it so it agrees with the record.
      controller?.pause();
      finish();
      return;
    }
    // Paused at the end, or back at the start straight after nearly reaching it: run out.
    const wasNearEnd = lastDuration > 0 && lastPosition >= lastDuration - END_OVERRUN;
    if (isPaused && (atEnd || (position === 0 && wasNearEnd && state.playing))) {
      lastPosition = 0;
      finish();
      return;
    }

    lastPosition = position;
    lastDuration = duration;
    clearEndTimer();
    const playing = !isPaused;
    if (playing) {
      ended = false;
      if (duration > 0) endTimer = setTimeout(finish, duration - position + END_OVERRUN);
    }
    set({
      playing,
      audible: playing && !isBuffering && position > 0,
      started: state.started || playing,
    });
  }

  /** Loads a song into the embed and starts it; the record keeps spinning through the switch. */
  function load(id: string) {
    if (!controller) return;
    const embed = controller;
    ended = false;
    lastPosition = 0;
    lastDuration = 0;
    clearEndTimer();
    loadedId = id;
    embed.loadUri(uriFor(id));
    embed.play();
    awaitEmbed('load', () => embed.play());
    set({ playing: true, audible: false, started: true });
  }

  function play() {
    if (!controller) return;
    const embed = controller;
    if (ended) {
      // Run out: start again from the top.
      ended = false;
      lastPosition = 0;
      embed.seek(0);
      embed.play();
      awaitEmbed('play', () => embed.play());
    } else {
      embed.resume();
      awaitEmbed('play', () => embed.resume());
    }
    set({ playing: true, audible: false, started: true });
  }

  function pause() {
    if (!controller) return;
    const embed = controller;
    clearEndTimer();
    embed.pause();
    awaitEmbed('pause', () => embed.pause());
    set({ playing: false, audible: false });
  }

  function onReady() {
    if (state.status !== 'ready') set({ status: 'ready' });
    if (queued) {
      const next = queued;
      queued = null;
      playOnRecord(next);
    } else if (pending?.kind === 'load') {
      // The new song finished loading after the play() meant for it.
      controller?.play();
    }
  }

  /**
   * Creates the shared embed the first time a record asks for it. If it isn't
   * ready within `LOAD_TIMEOUT` (a blocked or slow script) the records fall
   * back to Spotify's plain embed or a link, and come back if it turns up late.
   */
  function loadPinned(trackId: string, pinned?: RecordTrack) {
    pinnedId ??= trackId;
    if (pinned && !state.pinned) set({ pinned });
    if (state.status !== 'idle') return;
    set({ status: 'loading' });
    loadedId = trackId;

    const timeout = setTimeout(() => {
      if (state.status === 'loading') set({ status: 'failed', playing: false, audible: false });
    }, LOAD_TIMEOUT);

    deps
      .createEmbed(uriFor(trackId))
      .then((created) => {
        controller = created;
        created.addListener('ready', () => {
          clearTimeout(timeout);
          onReady();
        });
        created.addListener('playback_update', onUpdate);
      })
      .catch(() => {
        clearTimeout(timeout);
        queued = null;
        set({ status: 'failed', playing: false, audible: false });
      });
  }

  /** Play or pause the song on the record; one that has run out starts again from the top. */
  function togglePinned() {
    if (!controller || state.status !== 'ready') return;
    const song = state.track ?? state.pinned;
    if (!state.playing && loadedId && deps.canPlay?.(loadedId) === false && song) {
      deps.openUrl(song.url);
      return;
    }
    if (state.playing) pause();
    else play();
  }

  /**
   * Puts a song on the record and starts it, on every record at once. The
   * song already on the record plays or pauses instead of starting over.
   */
  function playOnRecord(track: RecordTrack) {
    if (state.status === 'failed' || deps.canPlay?.(track.id) === false) {
      deps.openUrl(track.url);
      return;
    }
    if (!controller || state.status !== 'ready') {
      queued = track;
      if (pinnedId) loadPinned(pinnedId);
      return;
    }
    const onRecord = track.id === pinnedId ? null : track;
    if (track.id === loadedId) {
      set({ track: onRecord });
      togglePinned();
      return;
    }
    load(track.id);
    set({ track: onRecord });
  }

  /** Puts the pinned song back on the record. */
  function backToPinned() {
    if (!controller || !pinnedId || state.status !== 'ready') return;
    if (loadedId !== pinnedId) load(pinnedId);
    set({ track: null });
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    loadPinned,
    togglePinned,
    playOnRecord,
    backToPinned,
  };
}

/* ---------------------------------------------------------------------------
   The site's one record player
   --------------------------------------------------------------------------- */

const player = createRecordPlayer({
  createEmbed: async (uri) => createAudioRecord(uri),
  openUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  canPlay: hasPreview,
});

export const { loadPinned, togglePinned, playOnRecord, backToPinned } = player;

export function usePinned(): PinnedState {
  return useSyncExternalStore(player.subscribe, player.getState, () => INITIAL);
}
