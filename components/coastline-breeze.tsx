'use client';

import { useEffect, useRef } from 'react';

/**
 * Wind for the contour field (coastline.tsx).
 *
 * Renders nothing visible: it finds the field's lines and, every frame,
 * redraws the shared curve with a wave travelling downwind along it, so the
 * lines flap together like strings held at the left edge. The wave grows
 * toward the free end and swells and eases with the gusts. Never starts
 * under reduced motion, and idles while the field is off screen.
 */
const SAMPLES = 120;
const WAVELENGTH = 300;
const SPEED = 140; // viewBox units per second, left to right
const AMPLITUDE = 16;

export function CoastlineBreeze({ curve }: { curve: string }) {
  const anchor = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = anchor.current?.ownerSVGElement;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lines = Array.from(svg.querySelectorAll<SVGPathElement>('[data-coast-line]'));
    if (lines.length === 0) return;

    // Sample the hand-drawn curve once; the wind only bends it.
    const guide = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    guide.setAttribute('d', curve);
    svg.appendChild(guide);
    const length = guide.getTotalLength();
    const xs = new Float32Array(SAMPLES + 1);
    const ys = new Float32Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) {
      const point = guide.getPointAtLength((i / SAMPLES) * length);
      xs[i] = point.x;
      ys[i] = point.y;
    }
    guide.remove();
    const x0 = xs[0] ?? 0;
    const span = (xs[SAMPLES] ?? 0) - x0 || 1;
    const k = (Math.PI * 2) / WAVELENGTH;

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      // Gusts: slow, uneven swells in strength.
      const gust = 0.7 + 0.22 * Math.sin(t * 0.37) + 0.12 * Math.sin(t * 1.13 + 1.7);
      let d = '';
      for (let i = 0; i <= SAMPLES; i++) {
        const x = xs[i] ?? 0;
        const y = ys[i] ?? 0;
        const u = (x - x0) / span; // 0 at the held end, 1 at the free end
        const reach = 0.15 + 0.85 * u * u;
        const phase = k * x - t * SPEED * k;
        const wave =
          Math.sin(phase) + 0.35 * Math.sin(phase * 2.3 + 0.8) + 0.15 * Math.sin(phase * 4.1 - t);
        const dy = AMPLITUDE * gust * reach * wave;
        // A little stretch downwind as the line is pulled taut.
        const dx = 6 * gust * u * Math.cos(phase);
        d += `${i === 0 ? 'M' : 'L'}${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
      }
      for (const line of lines) line.setAttribute('d', d);
      frame = visible ? requestAnimationFrame(draw) : 0;
    };

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    observer.observe(svg);
    frame = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      for (const line of lines) line.setAttribute('d', curve);
    };
  }, [curve]);

  return <g ref={anchor} />;
}
