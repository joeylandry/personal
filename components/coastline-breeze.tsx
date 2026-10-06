'use client';

import { useEffect, useRef } from 'react';

/**
 * Wind for the contour field (coastline.tsx).
 *
 * Renders nothing visible: it finds the field's lines and, every frame,
 * redraws the shared curve like strings tied to an invisible flag pole at
 * the field's right edge. The breeze comes off the water from the right; a
 * slow wave runs from the pole out to the loose ends, which fly the most.
 * Never starts under reduced motion, and idles while the field is off
 * screen.
 */
const SAMPLES = 120;
const WAVELENGTH = 300;
const SPEED = 46; // viewBox units per second, from the pole outward (leftward)
const AMPLITUDE = 18; // at the loose ends
const REACH = 260; // how far from the pole the strings fly fully loose

/** `pole` is the viewBox x of the field's right edge, where the strings are tied. */
export function CoastlineBreeze({ curve, pole }: { curve: string; pole: number }) {
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
      const gust = 0.8 + 0.2 * Math.sin(t * 0.21) + 0.12 * Math.sin(t * 0.53 + 1.7);
      let d = '';
      for (let i = 0; i <= SAMPLES; i++) {
        const x = xs[i] ?? 0;
        const y = ys[i] ?? 0;
        // Still at the pole, freer the farther the string flies from it.
        const loose = Math.min(Math.max((pole - x) / REACH, 0), 1);
        const slack = loose * loose * (3 - 2 * loose);
        // Plus sign: the wave travels toward smaller x, downwind from the pole.
        const phase = k * x + t * SPEED * k;
        const wave = Math.sin(phase) + 0.3 * Math.sin(phase * 1.7 + 0.8);
        const dy = AMPLITUDE * gust * slack * wave;
        // The loose ends also pull a touch downwind (leftward).
        const dx = -5 * gust * slack * (1 + Math.cos(phase)) * 0.5;
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
  }, [curve, pole]);

  return <g ref={anchor} />;
}
