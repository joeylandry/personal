'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * An American flag, outlined only, waving: thirteen stripes with a field of
 * stars in the top-left corner, seen as a crop of the cloth.
 *
 * The stripe borders ripple in a slow wave that runs out from an unseen pole
 * off the left, freer the farther it gets. The stripes fade out as they run
 * into the star field, which has no border of its own: nine outlined stars
 * ride the same ripple and each grows and shrinks on its own beat, like
 * flashing briefly. The box that holds it is meant to be tilted slightly,
 * like a camera angle. Idles while off screen; under reduced motion it holds
 * a single frame with the stars at rest size. Purely decorative; never
 * announced.
 */
const W = 1000;
const H = 600;
const INSET = 36; // keeps the outer borders inside the box when they billow
const SAMPLES = 80;
const WAVELENGTH = 380;
const SPEED = 60; // viewBox units per second, from the pole outward
const AMPLITUDE = 28; // at the free edge
const CROP_X = 150; // the visible window along the flag, in viewBox units
const CROP_W = W - CROP_X;
const STRIPES = 13;
const CANTON_ROWS = 7; // stripes the star field spans, as on the real flag

// Stars: three staggered rows of three, upper-left of the cloth.
const STAR_RADIUS = 26;
const STAR_REST = 0.7; // size under reduced motion
const STAR_PERIOD = 2.5; // seconds per grow-and-shrink
const STAR_ROWS_Y = [100, 178, 256];
const STAR_COLS_X = [200, 290, 380];
const STAR_STAGGER = 45;
const STARS = STAR_ROWS_Y.flatMap((y, row) =>
  STAR_COLS_X.map((x, col) => ({ x: x + (row % 2 ? STAR_STAGGER : 0), y, seed: row * 3 + col })),
);

// The stripes are fully visible from FADE_END, and gone before the first star.
const FADE_START = 380;
const FADE_END = 560;

const stripeSpan = (stripes: number) => (H - INSET * 2) / stripes;

/** How far the cloth is pushed off its resting height at `x`. */
function ripple(x: number, t: number, rowPhase: number) {
  const gust = 0.8 + 0.2 * Math.sin(t * 0.21) + 0.12 * Math.sin(t * 0.53 + 1.7);
  const k = (Math.PI * 2) / WAVELENGTH;
  const loose = x / W;
  const slack = loose * loose * (3 - 2 * loose);
  const phase = k * x - t * SPEED * k + rowPhase;
  const wave = Math.sin(phase) + 0.3 * Math.sin(phase * 1.7 + 0.8);
  return AMPLITUDE * gust * slack * wave;
}

function starPath(cx: number, cy: number, radius: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.4;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }
  return `${d}Z`;
}

function flagPaths(stripes: number, t: number, animated: boolean) {
  const span = stripeSpan(stripes);
  const borders: string[] = [];
  for (let line = 0; line <= stripes; line++) {
    const baseY = INSET + span * line;
    let d = '';
    for (let i = 0; i <= SAMPLES; i++) {
      const x = (W * i) / SAMPLES;
      const y = baseY + ripple(x, t, line * 0.35);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    borders.push(d);
  }
  const stars = STARS.map(({ x, y, seed }) => {
    const rowPhase = ((y - INSET) / span) * 0.35;
    const beat = 0.5 + 0.5 * Math.sin((t / STAR_PERIOD) * Math.PI * 2 + seed * 1.9);
    const size = animated ? 0.15 + 0.85 * beat ** 3 : STAR_REST;
    return starPath(x, y + ripple(x, t, rowPhase), STAR_RADIUS * size);
  });
  return { borders, stars };
}

export function StripedFlag({
  className = '',
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const fadeId = `flag-fade-${useId().replace(/:/g, '')}`;
  const initial = flagPaths(STRIPES, 0, false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const borders = Array.from(svg.querySelectorAll<SVGPathElement>('[data-flag-border]'));
    const stars = Array.from(svg.querySelectorAll<SVGPathElement>('[data-flag-star]'));

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const next = flagPaths(STRIPES, (now - start) / 1000, true);
      borders.forEach((path, i) => path.setAttribute('d', next.borders[i] ?? ''));
      stars.forEach((path, i) => path.setAttribute('d', next.stars[i] ?? ''));
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
  }, []);

  const border = (d: string, index: number) => (
    <path
      key={index}
      data-flag-border=""
      d={d}
      stroke={index % 2 === 0 ? 'var(--accent-graphic)' : 'currentColor'}
      strokeWidth={index % 2 === 0 ? 1.1 : 0.85}
      vectorEffect="non-scaling-stroke"
    />
  );

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
      <defs>
        <linearGradient id={`${fadeId}-grad`} gradientUnits="userSpaceOnUse" x1={FADE_START} x2={FADE_END}>
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={fadeId} maskUnits="userSpaceOnUse" x={CROP_X} y={-H} width={CROP_W} height={H * 3}>
          <rect x={CROP_X} y={-H} width={CROP_W} height={H * 3} fill={`url(#${fadeId}-grad)`} />
        </mask>
      </defs>
      {/* The stripes beside the star field fade out as they run into it. */}
      <g mask={`url(#${fadeId})`}>
        {initial.borders.slice(0, CANTON_ROWS + 1).map((d, index) => border(d, index))}
      </g>
      {initial.borders.slice(CANTON_ROWS + 1).map((d, index) => border(d, index + CANTON_ROWS + 1))}
      {initial.stars.map((d, index) => (
        <path
          key={index}
          data-flag-star=""
          d={d}
          stroke={index % 2 === 0 ? 'var(--accent-graphic)' : 'currentColor'}
          strokeWidth={0.9}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
