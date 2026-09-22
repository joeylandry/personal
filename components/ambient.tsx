'use client';

import { useEffect } from 'react';

/**
 * Two ambient behaviours, both strictly optional to the experience:
 *
 * 1. A day-to-night accent shift driven by the visitor's local clock.
 * 2. A few pixels of parallax on elements marked `.parallax`.
 *
 * Both bail out entirely under `prefers-reduced-motion`, and neither is
 * required to read the page.
 */
export function Ambient() {
  useEffect(() => {
    const root = document.documentElement;

    const hour = new Date().getHours();
    const night = hour >= 19 || hour < 6;
    root.dataset.daypart = night ? 'night' : 'day';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.parallax'));
    if (nodes.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewport + 200) continue;
        // -1 .. 1 across the viewport, scaled to a maximum of 6px.
        const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
        node.style.setProperty('--parallax', `${(-progress * 6).toFixed(2)}px`);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
