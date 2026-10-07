'use client';

import { useEffect, useRef } from 'react';

/**
 * A striped flag, outlined only, stretched over the whole box it sits in.
 *
 * The left edge is the pole: straight and still. The stripe borders and the
 * free right edge ripple in a slow wave that runs out from the pole, freer
 * the farther it gets. Idles while off screen; under reduced motion it holds
 * a single frame. Purely decorative; never announced.
 */
const W = 1000;
const H = 600;
const INSET = 36; // keeps the outer borders inside the box when they billow
const SAMPLES = 80;
const WAVELENGTH = 380;
const SPEED = 60; // viewBox units per second, from the pole outward
const AMPLITUDE = 24; // at the free edge

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
  const last = (row: { x: number; y: number }[]) => row[row.length - 1]!;
  const edge = rows
    .map((row, i) => `${i === 0 ? 'M' : 'L'}${last(row).x.toFixed(1)} ${last(row).y.toFixed(1)}`)
    .join('');
  const pole = `M0 ${INSET}V${H - INSET}`;
  return { borders, edge, pole };
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
    const edge = svg.querySelector<SVGPathElement>('[data-flag-edge]');

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const next = flagPaths(stripes, (now - start) / 1000);
      borders.forEach((path, i) => path.setAttribute('d', next.borders[i] ?? ''));
      edge?.setAttribute('d', next.edge);
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
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      <path d={initial.pole} stroke="currentColor" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      <path
        data-flag-edge=""
        d={initial.edge}
        stroke="currentColor"
        strokeWidth={0.9}
        vectorEffect="non-scaling-stroke"
      />
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
