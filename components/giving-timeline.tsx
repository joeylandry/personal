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
 * Each step's photos (`[data-grow]`) also start at full size: as wide as the
 * track, at the photo's own aspect ratio, centered over the spine. As the step
 * rises toward the reading line they shrink and slide into their card, the
 * crop closing in to the thumbnail, while the card's text fades up beneath.
 * That runs on custom properties too (see `.giving-track[data-growing]`).
 *
 * Without JavaScript the stylesheet shows the spine fully drawn and every node
 * lit, so the static page reads as a finished timeline; under reduced motion
 * the photos sit in their cards from the start.
 */

/** The reading line, as a fraction of the viewport height from the top. */
const READING_LINE = 0.62;
/** Where a step's node sits below the top of the step, in pixels. */
const NODE_OFFSET = 22;
/** Photos are full size while their top is below this line, as a viewport fraction… */
const GROW_START = 0.9;
/** …and settled into their card by the time it reaches this one. */
const GROW_END = 0.5;
/** The tallest a full-size photo gets, as a viewport fraction. */
const GROW_MAX_HEIGHT = 0.72;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smooth = (value: number) => value * value * (3 - 2 * value);
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

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
    const grow = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const growers = steps.map((step) => {
      const slot = step.querySelector<HTMLElement>('[data-grow]');
      const card = slot?.firstElementChild;
      if (!slot || !(card instanceof HTMLElement)) return null;
      // Only a single photo opens up to its own shape; a mosaic just scales.
      const aspect = Number(slot.dataset.aspect) || 0;
      return { slot, tile: card.querySelector('a'), image: card.querySelector('img'), aspect };
    });
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const line = viewport * READING_LINE;
      const box = list.getBoundingClientRect();
      const progress = Math.min(Math.max((line - box.top) / box.height, 0), 1);
      list.style.setProperty('--spine-progress', progress.toFixed(4));

      // Read all geometry before writing any of it, so a frame lays out once.
      // The slots are never transformed, so their boxes are the settled ones.
      const reads = steps.map((step, index) => {
        const grower = grow ? growers[index] : null;
        return {
          top: step.getBoundingClientRect().top,
          slot: grower?.slot.getBoundingClientRect(),
          tileHeight: grower?.tile?.offsetHeight ?? 0,
          imageHeight: grower?.image?.offsetHeight ?? 0,
        };
      });

      steps.forEach((step, index) => {
        const read = reads[index]!;
        step.setAttribute('data-reached', String(read.top + NODE_OFFSET <= line));

        const grower = growers[index];
        const slot = read.slot;
        if (!grower || !slot || !slot.width || !slot.height) return;

        const start = viewport * GROW_START;
        const end = viewport * GROW_END;
        const raw = clamp01((start - slot.top) / (start - end));
        const settled = smooth(raw);

        // Full size: the track's width at the photo's own shape (a mosaic
        // keeps its shape), no taller than most of the screen.
        const aspect = grower.aspect || slot.width / slot.height;
        const maxHeight = viewport * GROW_MAX_HEIGHT;
        const fullWidth = Math.min(box.width, maxHeight * aspect);
        const fullHeight = fullWidth / aspect;
        const scaleX = lerp(fullWidth / slot.width, 1, settled);
        const scaleY = lerp(fullHeight / slot.height, 1, settled);
        const shift = lerp(box.left + (box.width - fullWidth) / 2 - slot.left, 0, settled);

        // Counter-scale the image so it never stretches: scaled back to
        // uniform, and just large enough to cover the opened-up tile.
        let imageX = 1;
        let imageY = 1;
        if (grower.aspect && read.tileHeight && read.imageHeight) {
          const cover = Math.max(scaleX, (scaleY * read.tileHeight) / read.imageHeight);
          imageX = cover / scaleX;
          imageY = cover / scaleY;
        }

        const style = step.style;
        style.setProperty('--grow-shift', `${shift.toFixed(2)}px`);
        style.setProperty('--grow-x', scaleX.toFixed(4));
        style.setProperty('--grow-y', scaleY.toFixed(4));
        style.setProperty('--grow-image-x', imageX.toFixed(4));
        style.setProperty('--grow-image-y', imageY.toFixed(4));
        style.setProperty('--grow-text', smooth(clamp01((raw - 0.45) / 0.55)).toFixed(4));
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    if (grow) list.setAttribute('data-growing', '');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      list.removeAttribute('data-growing');
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
