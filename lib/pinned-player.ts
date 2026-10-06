'use client';

import { useSyncExternalStore } from 'react';

/**
 * One player for the site's pinned song, shared by every record on the site.
 *
 * Spotify's iFrame API drives a single embed that lives in the root layout
 * (see `components/pinned-host.tsx`), so the song keeps playing across
 * client-side navigation. The home hero's mini record and the About page's
 * turntable both read this store and call `togglePinned`, which is what keeps
 * them in step: press play on either and both spin. Any other song (one from the live player's history, say) can be put
 * on the record with `playOnRecord`, and `backToPinned` puts the pick back.
 */

const IFRAME_API = 'https://open.spotify.com/embed/iframe-api/v1';
/** The element in the layout that Spotify swaps its embed into. */
export const PINNED_MOUNT_ID = 'pinned-player-mount';
export const PINNED_EMBED_HEIGHT = 80;

interface PlaybackUpdate {
  data: {
    isPaused: boolean;
    isBuffering?: boolean;
    position: number;
    duration: number;
    /** The song the update is about; older embeds leave it out. */
    playingURI?: string;
  };
}

interface EmbedController {
  addListener(event: 'ready', callback: () => void): void;
  addListener(event: 'playback_update', callback: (event: PlaybackUpdate) => void): void;
  loadUri(uri: string): void;
  play(): void;
  togglePlay(): void;
  destroy(): void;
}

interface SpotifyIFrameApi {
  createController(
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: EmbedController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
  }
}

/** Loads the iFrame API once per page, however many records ask for it. */
let apiPromise: Promise<SpotifyIFrameApi> | null = null;

function loadIframeApi(): Promise<SpotifyIFrameApi> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      previous?.(api);
      resolve(api);
    };
    const script = document.createElement('script');
    script.src = IFRAME_API;
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      script.remove();
      reject(new Error('Spotify iFrame API failed to load'));
    };
    document.body.appendChild(script);
  });
  return apiPromise;
}

export type PinnedStatus = 'idle' | 'loading' | 'ready' | 'failed';

/** A song on the record other than the pinned one. */
export interface RecordTrack {
  id: string;
  title: string;
  artist: string | null;
  art: string | null;
  url: string;
}

export interface PinnedState {
  status: PinnedStatus;
  playing: boolean;
  /** The song on the record when it isn't the pinned one; null means the pick. */
  track: RecordTrack | null;
  /** The pick itself, as the records describe it; for the header's island. */
  pinned: RecordTrack | null;
  /** True once anything has played; the header's island shows from then on. */
  started: boolean;
}

let state: PinnedState = {
  status: 'idle',
  playing: false,
  track: null,
  pinned: null,
  started: false,
};
const listeners = new Set<() => void>();
let controller: EmbedController | null = null;
let pinnedId: string | null = null;
/** A song asked for before the embed was ready; it goes on as soon as it is. */
let queued: RecordTrack | null = null;
/** A song just loaded that should start; cleared once it has. */
let pending: { uri: string; checks: number; timer: ReturnType<typeof setTimeout> } | null = null;
/** The embed's latest word on the pending song, if any since it was loaded. */
let lastUpdate: PlaybackUpdate['data'] | null = null;

/**
 * Loads a song into the embed and starts it. A `play()` sent straight after
 * `loadUri()` can be dropped before the new song is ready (notably on phones),
 * so it is sent again, but only once the embed says the song is loaded and
 * still sitting at the start. `play()` always starts from the top, so a blind
 * retry would restart a song that had already begun.
 */
function loadAndPlay(id: string) {
  if (!controller) return;
  const uri = `spotify:track:${id}`;
  clearPending();
  lastUpdate = null;
  controller.loadUri(uri);
  controller.play();
  pending = { uri, checks: 0, timer: setTimeout(checkStarted, 900) };
}

function checkStarted() {
  if (!pending) return;
  const update = lastUpdate;
  if (update && update.isPaused && !update.isBuffering && update.position === 0) {
    controller?.play();
  }
  pending.checks += 1;
  if (pending.checks >= 5) {
    pending = null;
    return;
  }
  pending.timer = setTimeout(checkStarted, 900);
}

function clearPending() {
  if (pending) clearTimeout(pending.timer);
  pending = null;
}

function set(patch: Partial<PinnedState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/**
 * Creates the shared embed the first time a record asks for it. Gives up
 * after 12 seconds (a blocked or slow script), and the records fall back to
 * Spotify's plain embed or a link.
 */
export function loadPinned(trackId: string, pinned?: RecordTrack) {
  pinnedId ??= trackId;
  if (pinned && !state.pinned) set({ pinned });
  if (state.status !== 'idle') return;
  set({ status: 'loading' });
  let ready = false;

  const giveUp = () => {
    if (ready) return;
    controller?.destroy();
    controller = null;
    set({ status: 'failed', playing: false });
  };
  const timeout = setTimeout(giveUp, 12_000);

  loadIframeApi()
    .then((api) => {
      const mount = document.getElementById(PINNED_MOUNT_ID);
      if (!mount) throw new Error('Pinned player mount missing');
      const target = document.createElement('div');
      mount.replaceChildren(target);
      api.createController(
        target,
        { uri: `spotify:track:${trackId}`, width: '100%', height: PINNED_EMBED_HEIGHT },
        (created) => {
          controller = created;
          created.addListener('ready', () => {
            if (ready) return;
            ready = true;
            clearTimeout(timeout);
            set({ status: 'ready' });
            if (queued) {
              const next = queued;
              queued = null;
              playOnRecord(next);
            }
          });
          created.addListener('playback_update', (event) => {
            const playing = !event.data.isPaused;
            const { playingURI } = event.data;
            if (pending && (!playingURI || playingURI === pending.uri)) {
              lastUpdate = event.data;
              // Playing, or paused part-way through by hand: either way it started.
              if (playing || event.data.position > 0) clearPending();
            }
            set({ playing, started: state.started || playing });
          });
        },
      );
    })
    .catch(() => {
      clearTimeout(timeout);
      giveUp();
    });
}

/** Play or pause the shared song. A no-op until the embed is ready. */
export function togglePinned() {
  controller?.togglePlay();
}

/** Puts a song on the record and starts it, on every record at once. */
export function playOnRecord(track: RecordTrack) {
  if (state.status === 'failed') {
    window.open(track.url, '_blank', 'noopener,noreferrer');
    return;
  }
  if (!controller || state.status !== 'ready') {
    queued = track;
    if (pinnedId) loadPinned(pinnedId);
    return;
  }
  loadAndPlay(track.id);
  set({ track: track.id === pinnedId ? null : track });
}

/** Puts the pinned song back on the record. */
export function backToPinned() {
  if (!controller || !pinnedId) return;
  loadAndPlay(pinnedId);
  set({ track: null });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverState: PinnedState = {
  status: 'idle',
  playing: false,
  track: null,
  pinned: null,
  started: false,
};

export function usePinned(): PinnedState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}
