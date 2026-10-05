'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

/**
 * A timeline that assembles itself as you scroll. Each chapter's photos enter
 * at full width, then shrink into their column while the rail draws down to
 * meet them, the node lights up and the chapter's text fades in beside it.
 *
 * Children are `[data-chapter]` items, each holding a `.tl-photos` element.
 * Progress is written to the DOM as custom properties and the stylesheet does
 * the rest. Until the effect switches on (`data-forming`), and always under
 * reduced motion, the timeline renders in its finished state.
 */
export function FormingTimeline({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const chapters = Array.from(list.querySelectorAll<HTMLElement>('[data-chapter]')).flatMap(
      (item) => {
        const photos = item.querySelector<HTMLElement>('.tl-photos');
        return photos ? [{ item, photos }] : [];
      },
    );
    if (chapters.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;

      // Read everything first, then write, so a frame lays out once.
      const listRect = list.getBoundingClientRect();
      const reads = chapters.map(({ item, photos }) => {
        // offset* ignore transforms, so these are the formed geometry.
        const width = photos.offsetWidth;
        const height = photos.offsetHeight;
        const top = item.getBoundingClientRect().top + photos.offsetTop;
        const full = item.clientWidth;
        return { width, height, top, full, left: photos.offsetLeft };
      });

      list.style.setProperty(
        '--rail',
        clamp((viewport * 0.5 - listRect.top) / listRect.height).toFixed(4),
      );

      chapters.forEach(({ item }, index) => {
        const { width, height, top, full, left } = reads[index]!;
        if (!width || !height) return;

        // Full size while the photo's top is low in the viewport, formed by
        // the time it reaches the upper third.
        const start = viewport * 0.88;
        const end = viewport * 0.3;
        const raw = clamp((start - top) / (start - end));
        const formed = smooth(raw);

        // "Full size": the chapter's whole width, but never taller than most
        // of the screen, and never smaller than the formed photo.
        const scale = Math.max(1, Math.min(full / width, (viewport * 0.8) / height, 2.2));
        const shift = (full - width * scale) / 2 - left;

        item.style.setProperty('--tl-scale', (1 + (scale - 1) * (1 - formed)).toFixed(4));
        item.style.setProperty('--tl-shift', `${(shift * (1 - formed)).toFixed(2)}px`);
        item.style.setProperty('--tl-text', smooth(clamp((raw - 0.4) / 0.5)).toFixed(4));
        item.style.setProperty('--tl-node', smooth(clamp((raw - 0.55) / 0.35)).toFixed(4));
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    list.setAttribute('data-forming', '');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(list);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resize.disconnect();
      if (frame) cancelAnimationFrame(frame);
      list.removeAttribute('data-forming');
    };
  }, []);

  return (
    <ol ref={ref} className={`forming-timeline ${className}`.trim()}>
      {children}
    </ol>
  );
}
