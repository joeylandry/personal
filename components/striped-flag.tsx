'use client';

import { useEffect, useRef } from 'react';

/**
 * A striped flag, outlined only, seen as a tight crop of its rippling middle.
 *
 * The stripe borders ripple in a slow wave that runs out from an unseen pole
 * off the left, freer the farther it gets. Only the wavy stretch is in frame
 * (the still pole end and the free edge are cropped away), and the box that
 * holds it is meant to be tilted slightly, like a camera angle. Idles while
 * off screen; under reduced motion it holds a single frame. Purely
 * decorative; never announced.
 */
const W = 1000;
const H = 600;
const INSET = 36; // keeps the outer borders inside the box when they billow
const SAMPLES = 80;
const WAVELENGTH = 380;
const SPEED = 60; // viewBox units per second, from the pole outward
const AMPLITUDE = 24; // at the free edge
const CROP_X = 450; // the visible window along the flag, in viewBox units
const CROP_W = 500;

function flagPaths(stripes: number, t: number) {
  const gust = 0.8 + 0.2 * Math.sin(t * 0.21) + 0.12 * Math.sin(t * 0.53 + 1.7);
  const k = (Math.PI * 2) / WAVELENGTH;
  const rows: { x: number; y: number }[][] = [];
  for (let line = 0; line <= stripes; line++) {
    const baseY = INSET + ((H - INSET * 2) * line) / stripes;
    const row: { x: number; y: number }[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = (W * i) / SAMPLES;
      const loose = x / W;
      const slack = loose * loose * (3 - 2 * loose);
      const phase = k * x - t * SPEED * k + line * 0.35;
      const wave = Math.sin(phase) + 0.3 * Math.sin(phase * 1.7 + 0.8);
      row.push({ x, y: baseY + AMPLITUDE * gust * slack * wave });
    }
    rows.push(row);
  }
  const borders = rows.map((row) =>
    row.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(''),
  );
  return { borders };
}

export function StripedFlag({
  stripes = 7,
  className = '',
  opacity = 0.5,
}: {
  stripes?: number;
  className?: string;
  opacity?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const initial = flagPaths(stripes, 0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const borders = Array.from(svg.querySelectorAll<SVGPathElement>('[data-flag-border]'));

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const next = flagPaths(stripes, (now - start) / 1000);
      borders.forEach((path, i) => path.setAttribute('d', next.borders[i] ?? ''));
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
    };
  }, [stripes]);

  return (
    <svg
      ref={svgRef}
      viewBox={`${CROP_X} 0 ${CROP_W} ${H}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      {initial.borders.map((d, index) => (
        <path
          key={index}
          data-flag-border=""
          d={d}
          stroke={index % 2 === 0 ? 'var(--accent-graphic)' : 'currentColor'}
          strokeWidth={index % 2 === 0 ? 1.1 : 0.85}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
