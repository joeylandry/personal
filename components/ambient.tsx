'use client';

import { useEffect } from 'react';

/**
 * A few pixels of parallax on elements marked `.parallax`. Strictly optional
 * to the experience: it bails out entirely under `prefers-reduced-motion`.
 */
export function Ambient() {
  useEffect(() => {
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
