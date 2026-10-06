'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { canOptimizeImage } from '@/lib/spotify-images';

/** 33⅓ rpm, in degrees per millisecond. */
const RPM_33 = (100 / 3) * (360 / 60_000);

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

/**
 * The record itself: grooves, the album art as its label, and the spin.
 * Sized by its container; the turntable, the hero's mini player and the
 * floating dock all draw this same disc.
 */
export function Vinyl({
  art,
  playing,
  sizes,
  blankLabel,
  className = '',
}: {
  art: string | null;
  playing: boolean;
  sizes: string;
  /** Shown on the label when there is no art. */
  blankLabel?: string;
  className?: string;
}) {
  const discRef = useRef<HTMLDivElement>(null);
  useSpin(discRef, playing);

  return (
    <div ref={discRef} className={`record ${className}`} aria-hidden="true">
      <div className="record-label">
        {art ? (
          <Image
            src={art}
            unoptimized={!canOptimizeImage(art)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <span className="record-label-blank">
            {blankLabel ? <span className="meta">{blankLabel}</span> : null}
          </span>
        )}
      </div>
    </div>
  );
}

export function PlayGlyph({ playing, size = 22 }: { playing: boolean; size?: number }) {
  return playing ? (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1.2" />
      <rect x="14" y="5" width="4" height="14" rx="1.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" />
    </svg>
  );
}
