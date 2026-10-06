'use client';

import { useEffect, useId, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

/**
 * One player for the site's pinned song, shared by every record on the site.
 *
 * Spotify's iFrame API drives a single embed that lives in the root layout
 * (see `components/pinned-dock.tsx`), so the song keeps playing across
 * client-side navigation. The home hero's mini record, the About page's
 * turntable and the floating dock all read this store and call `togglePinned`,
 * which is what keeps them in step: press play on any of them and they all
 * spin.
 */

const IFRAME_API = 'https://open.spotify.com/embed/iframe-api/v1';
/** The element in the layout that Spotify swaps its embed into. */
export const PINNED_MOUNT_ID = 'pinned-player-mount';
export const PINNED_EMBED_HEIGHT = 80;

interface PlaybackUpdate {
  data: { isPaused: boolean; isBuffering?: boolean; position: number; duration: number };
}

interface EmbedController {
  addListener(event: 'ready', callback: () => void): void;
  addListener(event: 'playback_update', callback: (event: PlaybackUpdate) => void): void;
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

export interface PinnedState {
  status: PinnedStatus;
  playing: boolean;
  /** True once the song has played at all; the dock only shows after that. */
  started: boolean;
  /** How many records are on screen right now; the dock hides while any is. */
  visibleRecords: number;
}

let state: PinnedState = { status: 'idle', playing: false, started: false, visibleRecords: 0 };
const listeners = new Set<() => void>();
const visible = new Set<string>();
let controller: EmbedController | null = null;

function set(patch: Partial<PinnedState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/**
 * Creates the shared embed the first time a record asks for it. Gives up
 * after 12 seconds (a blocked or slow script), and the records fall back to
 * Spotify's plain embed or a link.
 */
export function loadPinned(trackId: string) {
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
            ready = true;
            clearTimeout(timeout);
            set({ status: 'ready' });
          });
          created.addListener('playback_update', (event) => {
            const playing = !event.data.isPaused;
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

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverState: PinnedState = {
  status: 'idle',
  playing: false,
  started: false,
  visibleRecords: 0,
};

export function usePinned(): PinnedState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}

/** Counts a record as on screen while it is, so the floating dock can step aside. */
export function useRecordOnScreen(ref: RefObject<HTMLElement | null>) {
  const id = useId();
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) visible.add(id);
      else visible.delete(id);
      set({ visibleRecords: visible.size });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      visible.delete(id);
      set({ visibleRecords: visible.size });
    };
  }, [id, ref]);
}
