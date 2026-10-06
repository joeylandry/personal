'use client';

import { useEffect, useRef } from 'react';

/**
 * Wind for the contour field (coastline.tsx).
 *
 * Renders nothing visible: it finds the field's lines and, every frame,
 * redraws the shared curve with a long, slow wave rolling in from the right,
 * so the lines drift together like loose strings in a beach breeze. Nothing
 * holds either end down; the whole length moves alike, swelling and easing
 * with the gusts. Never starts under reduced motion, and idles while the
 * field is off screen.
 */
const SAMPLES = 120;
const WAVELENGTH = 520;
const SPEED = 38; // viewBox units per second, right to left
const AMPLITUDE = 13;

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
    const k = (Math.PI * 2) / WAVELENGTH;

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      // Gusts: slow, uneven swells in strength, like an onshore breeze.
      const gust = 0.75 + 0.18 * Math.sin(t * 0.16) + 0.1 * Math.sin(t * 0.41 + 1.7);
      let d = '';
      for (let i = 0; i <= SAMPLES; i++) {
        const x = xs[i] ?? 0;
        const y = ys[i] ?? 0;
        // Plus sign: the wave travels toward smaller x, downwind from the right.
        const phase = k * x + t * SPEED * k;
        const wave = Math.sin(phase) + 0.3 * Math.sin(phase * 1.7 + 0.8);
        const dy = AMPLITUDE * gust * wave;
        // The breeze also nudges the lines a touch downwind (leftward).
        const dx = -4 * gust * (1 + Math.cos(phase)) * 0.5;
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
