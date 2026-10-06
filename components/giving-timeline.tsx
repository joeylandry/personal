'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The Giving timeline's spine.
 *
 * Writes how far the reader has scrolled through the list to `--spine-progress`
 * (0 to 1), which draws the spine's fill, and marks each step `data-reached`
 * once its node crosses the reading line so the node lights up.
 *
 * From md up, each chapter's photos also zoom home. Laid out mini beside their
 * year, they are scaled up and centered on the spine while in the lower half
 * of the viewport, then shrink by their corners into place as they rise toward
 * the top of the viewport. Once a photo is home it stays there for the rest of
 * the visit, even when the reader scrolls back up. Phones and reduced motion
 * skip the zoom.
 *
 * All of it is written straight to the DOM on an animation frame: it drives
 * CSS and nothing renders from it.
 *
 * Without JavaScript the stylesheet shows the spine fully drawn, every node
 * lit and every photo at home, so the static page reads as a finished
 * timeline.
 */

/** The reading line, as a fraction of the viewport height from the top. */
const READING_LINE = 0.62;
/** Where a step's node sits below the top of the step, in pixels. */
const NODE_OFFSET = 22;
/**
 * Where a photo starts shrinking and where it is home, as fractions of the
 * viewport height from the top, measured at the top of its slot. Both sit high
 * enough that the whole zoomed photo is on screen while it shrinks.
 */
const ZOOM_START = 0.45;
const ZOOM_END = 0.15;
/** The zoomed photo's largest height, in pixels, and share of the viewport height. */
const ZOOM_MAX_HEIGHT = 320;
const ZOOM_VIEWPORT_HEIGHT = 0.42;
/** The zoomed photo's largest width, as a share of the timeline's width. */
const ZOOM_MAX_WIDTH = 0.7;

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
    const wide = window.matchMedia('(min-width: 48rem)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    // How far each photo has come home, which only ever grows.
    const home = new Map<HTMLElement, number>();
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
      zoom(box);
    };

    function zoom(box: DOMRect) {
      const animate = wide.matches && !still.matches;
      const start = window.innerHeight * ZOOM_START;
      const end = window.innerHeight * ZOOM_END;
      const spine = box.left + box.width / 2;
      const maxHeight = Math.min(ZOOM_MAX_HEIGHT, window.innerHeight * ZOOM_VIEWPORT_HEIGHT);
      for (const photo of photos) {
        // The slot keeps the photo's home size and position; only the photo moves.
        const slot = photo.parentElement ?? photo;
        const rect = slot.getBoundingClientRect();
        const reached = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
        const progress = Math.max(home.get(photo) ?? 0, reached);
        home.set(photo, progress);

        const step = photo.closest<HTMLElement>('[data-step]');
        if (!animate || progress >= 1 || rect.width === 0) {
          photo.style.transform = '';
          photo.removeAttribute('data-zoom');
          if (step) step.style.zIndex = '';
          continue;
        }

        const ratio = rect.width / rect.height;
        const width = Math.min(maxHeight * ratio, box.width * ZOOM_MAX_WIDTH);
        const scale = Math.max(width / rect.width, 1);
        const shift = spine - (rect.left + rect.width / 2);
        // Ease out, so the photo settles gently into place.
        const away = (1 - progress) ** 2;
        photo.style.transform = `translateX(${(shift * away).toFixed(1)}px) scale(${(1 + (scale - 1) * away).toFixed(4)})`;
        photo.setAttribute('data-zoom', 'true');
        // Lift the step so the zoomed photo floats over its neighbours.
        if (step) step.style.zIndex = '1';
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    wide.addEventListener('change', schedule);
    still.addEventListener('change', schedule);
    return () => {
      wide.removeEventListener('change', schedule);
      still.removeEventListener('change', schedule);
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
