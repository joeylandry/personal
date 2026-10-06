'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The Giving timeline's spine.
 *
 * Writes how far the reader has scrolled through the list to `--spine-progress`
 * (0 to 1), which draws the spine's fill, and marks each step `data-reached`
 * once its node crosses the reading line so the node lights up. Both are
 * written straight to the DOM on an animation frame: they drive CSS and
 * nothing renders from them.
 *
 * Without JavaScript the stylesheet shows the spine fully drawn and every node
 * lit, so the static page reads as a finished timeline.
 *
 * The timeline can be split across bands: the spine fades out below the last
 * step, and a `continues` track fades it back in from the top of a later band
 * and stops it at that band's last node, so it reads as one line passing
 * behind whatever sits between.
 */

/** The reading line, as a fraction of the viewport height from the top. */
const READING_LINE = 0.62;
/** Where a step's node sits below the top of the step, in pixels. */
const NODE_OFFSET = 22;

export function TimelineTrack({
  children,
  className = '',
  continues = false,
}: {
  children: ReactNode;
  className?: string;
  /** Bring the spine in from the top of the band and end it at the last node. */
  continues?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const spine = list.querySelector<HTMLElement>('.giving-spine');
    const steps = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      // Measured on the spine itself, which can reach past the list.
      const box = (spine ?? list).getBoundingClientRect();
      const progress = Math.min(Math.max((line - box.top) / box.height, 0), 1);
      list.style.setProperty('--spine-progress', progress.toFixed(4));
      for (const step of steps) {
        const reached = step.getBoundingClientRect().top + NODE_OFFSET <= line;
        step.setAttribute('data-reached', String(reached));
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
    <div
      ref={ref}
      data-continues={continues || undefined}
      className={`giving-track ${className}`.trim()}
    >
      <span aria-hidden="true" className="giving-spine" />
      <ol className="relative space-y-14 md:space-y-16">{children}</ol>
    </div>
  );
}
