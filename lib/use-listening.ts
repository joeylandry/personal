'use client';

import { useSyncExternalStore } from 'react';
import type { Listening } from './spotify';

/**
 * One poll of `/api/now-playing` shared by every component on the page (the
 * player and the footer ticker), running only while something is subscribed
 * and the tab is visible.
 */

const POLL_MS = 20_000;

export interface ListeningState {
  /** Null until the first response lands. */
  data: Listening | null;
  /** When `data` was received, for extrapolating progress between polls. */
  receivedAt: number;
}

let state: ListeningState = { data: null, receivedAt: 0 };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

function emit(next: ListeningState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function poll() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (listeners.size === 0) return;

  if (document.visibilityState === 'visible' && !inFlight) {
    inFlight = true;
    try {
      const response = await fetch('/api/now-playing');
      if (response.ok) emit({ data: (await response.json()) as Listening, receivedAt: Date.now() });
    } catch {
      // Keep showing the last good answer.
    } finally {
      inFlight = false;
    }
  }
  if (listeners.size > 0) timer = setTimeout(poll, POLL_MS);
}

/** Polls again now, e.g. when the current song should have ended. */
export function refreshListening() {
  void poll();
}

function onVisible() {
  if (document.visibilityState === 'visible') void poll();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    document.addEventListener('visibilitychange', onVisible);
    void poll();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) clearTimeout(timer);
      timer = null;
    }
  };
}

const serverState: ListeningState = { data: null, receivedAt: 0 };

export function useListening(): ListeningState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}
