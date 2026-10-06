'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The Giving timeline's spine.
 *
 * Writes how far the reader has scrolled through the list to `--spine-progress`
 * (0 to 1), which draws the spine's fill, and marks each step `data-reached`
 * once its node crosses the reading line so the node lights up. Each step's
 * photos get `--shrink` (0 to 1): they sit at full size until their top meets
 * the reading line, then shrink as they rise toward the top of the viewport.
 * All of it is written straight to the DOM on an animation frame: it drives
 * CSS and nothing renders from it.
 *
 * Without JavaScript the stylesheet shows the spine fully drawn, every node
 * lit and every photo at full size, so the static page reads as a finished
 * timeline.
 */

/** The reading line, as a fraction of the viewport height from the top. */
const READING_LINE = 0.62;
/** Where a step's node sits below the top of the step, in pixels. */
const NODE_OFFSET = 22;
/** Where a photo finishes shrinking, as a fraction of the viewport height. */
const SHRINK_END = 0.18;

export function TimelineTrack({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    const photos = Array.from(list.querySelectorAll<HTMLElement>('.giving-photo'));
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      const box = list.getBoundingClientRect();
      const progress = Math.min(Math.max((line - box.top) / box.height, 0), 1);
      list.style.setProperty('--spine-progress', progress.toFixed(4));
      for (const step of steps) {
        const reached = step.getBoundingClientRect().top + NODE_OFFSET <= line;
        step.setAttribute('data-reached', String(reached));
      }
      const end = window.innerHeight * SHRINK_END;
      for (const photo of photos) {
        // Measured from the photo's wrapper, whose top does not move as it shrinks.
        const top = (photo.parentElement ?? photo).getBoundingClientRect().top;
        const shrink = Math.min(Math.max((line - top) / (line - end), 0), 1);
        photo.style.setProperty('--shrink', shrink.toFixed(4));
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div ref={ref} className={`giving-track ${className}`.trim()}>
      <span aria-hidden="true" className="giving-spine" />
      <ol className="relative space-y-14 md:space-y-16">{children}</ol>
    </div>
  );
}
