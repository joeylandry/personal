'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { canOptimizeImage } from '@/lib/spotify-images';
import type { TrackPreview } from '@/lib/spotify';
import { ExternalLink } from './external-link';
import { EqBars } from './live-player';

/**
 * The pinned song as a record on a turntable.
 *
 * Spotify's own embed plays the audio (a preview with no login); its iFrame
 * API reports real play/pause state, which spins the record up and lets it
 * coast to a stop. Without JavaScript, or if the API script never arrives, the
 * plain embed iframe still plays the song and the record simply stays still.
 */

const IFRAME_API = 'https://open.spotify.com/embed/iframe-api/v1';
/** 33⅓ rpm, in degrees per millisecond. */
const RPM_33 = (100 / 3) * (360 / 60_000);
const EMBED_HEIGHT = 80;

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

/** Loads the iFrame API once per page, however many times the player mounts. */
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

type Status = 'loading' | 'ready' | 'failed';

/**
 * Spins the element at 33⅓ rpm while `playing`, easing up to speed and
 * coasting down afterwards. Does nothing under reduced motion.
 */
function useSpin(ref: RefObject<HTMLElement | null>, playing: boolean) {
  const playingRef = useRef(playing);
  const angle = useRef(0);
  const speed = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    playingRef.current = playing;
    if (frame.current !== null) return;
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let last = performance.now();
    const tick = (time: number) => {
      const dt = Math.min(64, time - last);
      last = time;
      const target = playingRef.current ? 1 : 0;
      // Spin-up is quick like a direct-drive deck; spin-down coasts.
      const tau = target ? 320 : 1100;
      speed.current += (target - speed.current) * (1 - Math.exp(-dt / tau));
      angle.current = (angle.current + speed.current * RPM_33 * dt) % 360;
      if (ref.current) ref.current.style.transform = `rotate(${angle.current}deg)`;
      if (target === 0 && speed.current < 0.002) {
        speed.current = 0;
        frame.current = null;
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [playing, ref]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    [],
  );
}

function PlayGlyph({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}

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
  const [status, setStatus] = useState<Status>('loading');
  const [playing, setPlaying] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EmbedController | null>(null);
  const discRef = useRef<HTMLDivElement>(null);
  useSpin(discRef, playing);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let ready = false;

    const giveUp = () => {
      if (cancelled || ready) return;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      mount.replaceChildren();
      setStatus('failed');
    };
    // A blocked or slow script shouldn't leave a skeleton where the player goes.
    const timeout = setTimeout(giveUp, 12_000);

    loadIframeApi()
      .then((api) => {
        if (cancelled) return;
        const target = document.createElement('div');
        mount.replaceChildren(target);
        api.createController(
          target,
          { uri: `spotify:track:${trackId}`, width: '100%', height: EMBED_HEIGHT },
          (controller) => {
            if (cancelled) {
              controller.destroy();
              return;
            }
            controllerRef.current = controller;
            controller.addListener('ready', () => {
              if (cancelled) return;
              ready = true;
              setStatus('ready');
            });
            controller.addListener('playback_update', (event) => {
              if (!cancelled) setPlaying(!event.data.isPaused);
            });
          },
        );
      })
      .catch(giveUp);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controllerRef.current?.destroy();
      controllerRef.current = null;
      mount.replaceChildren();
    };
  }, [trackId]);

  const title = preview?.title ?? eyebrow;
  const art = preview?.art ?? null;

  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
      {/* The turntable. Decorative apart from the play button on the label. */}
      <div className="md:col-span-7">
        <div className="turntable" data-playing={playing}>
          <div className="turntable-platter" aria-hidden="true" />
          <div ref={discRef} className="record" aria-hidden="true">
            <div className="record-label">
              {art ? (
                <Image
                  src={art}
                  unoptimized={!canOptimizeImage(art)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 200px, 30vw"
                  className="object-cover"
                />
              ) : (
                <span className="record-label-blank">
                  <span className="meta">{eyebrow}</span>
                </span>
              )}
            </div>
          </div>
          <div className="record-sheen" aria-hidden="true" />
          <div className="record-spindle" aria-hidden="true" />
          {status === 'ready' ? (
            <button
              type="button"
              onClick={() => controllerRef.current?.togglePlay()}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
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
          <span>{playing ? 'Spinning now' : 'Press play to drop the needle'}</span>
        </p>

        <div className="relative mt-4 overflow-hidden rounded-xl" style={{ height: EMBED_HEIGHT }}>
          {status === 'loading' ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse rounded-xl bg-raised"
            />
          ) : null}
          {/* Spotify's iFrame API swaps its own player in here. */}
          <div ref={mountRef} className="relative [&_iframe]:block [&_iframe]:rounded-xl" />
          {status === 'failed' ? (
            <iframe
              title={`${title}, Spotify player`}
              src={embedUrl}
              width="100%"
              height={EMBED_HEIGHT}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block rounded-xl border-0"
            />
          ) : null}
          <noscript>
            <iframe
              title={`${title}, Spotify player`}
              src={embedUrl}
              width="100%"
              height={EMBED_HEIGHT}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ position: 'relative', display: 'block', border: 0, borderRadius: 12 }}
            />
          </noscript>
        </div>

        <ExternalLink
          href={trackUrl}
          arrow
          className="link meta mt-5 inline-flex items-center text-faint hover:text-fg"
        >
          Open in Spotify
        </ExternalLink>
      </div>
    </div>
  );
}
