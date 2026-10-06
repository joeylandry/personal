'use client';

import { useEffect, useRef } from 'react';

/**
 * Flag lines.
 *
 * The stripe edges of a huge flag, drawn as lines only, flying in a slow
 * onshore breeze. The pole sits just past the right edge of the box; the
 * loose end reaches the box's left edge. A long wave runs from the pole out
 * to the loose end, growing as the cloth gets freer, and each edge lags the
 * one above it a touch so the folds cross the flag on a diagonal, the way
 * real cloth moves. Right at the pole the edges bend down to where they
 * are tied, as if staked to the ground just past the screen's right edge.
 *
 * Geometry is worked in the box's own pixels (the viewBox tracks its size),
 * and each edge is a smooth spline, so the motion stays fluid at any size.
 * Under reduced motion it draws one still frame. Purely decorative.
 */
const EDGES = 12;
const SAMPLES = 48;
const PERIOD = 6.5; // seconds for one fold to pass a point
const GUST_PERIOD = 19; // seconds for the breeze to swell and ease
const TIE = 0.12; // share of the width, from the pole, where the edges bend down to be tied

// What the server renders, before the box is measured.
const FALLBACK = { width: 1480, height: 1300 };

type Size = { width: number; height: number };

function edgePaths({ width, height }: Size, time: number): string[] {
  const flagHeight = Math.min(height * 0.8, 1040);
  const top = Math.max((height - flagHeight) / 2, 0) + flagHeight * 0.02;
  const spacing = flagHeight / (EDGES - 1);
  const wavelength = Math.min(Math.max(width * 0.42, 360), 720);
  const amplitude = Math.min(Math.max(spacing * 0.75, 26), 64);
  const tilt = Math.min(width * 0.06, 90); // loose end rides a little higher
  const drop = Math.min(Math.max(spacing * 1.6, 50), 150); // how far the tied ends bend down
  const k = (Math.PI * 2) / wavelength;
  const omega = (Math.PI * 2) / PERIOD;
  const gust = 0.86 + 0.14 * Math.sin((Math.PI * 2 * time) / GUST_PERIOD);

  const paths: string[] = [];
  const xs = new Float64Array(SAMPLES + 1);
  const ys = new Float64Array(SAMPLES + 1);

  for (let edge = 0; edge < EDGES; edge++) {
    const lag = edge * 0.22;
    for (let i = 0; i <= SAMPLES; i++) {
      // s: 0 at the pole (right), 1 at the loose end (left).
      const s = i / SAMPLES;
      const distance = s * width;
      // Pinned only at the pole itself; past the tie the whole flag moves.
      const tied = smooth(s / TIE);
      const free = smooth(s / (TIE * 1.5)) * (0.45 + 0.55 * s);
      const phase = k * distance - omega * time - lag;
      const wave = Math.sin(phase) + 0.22 * Math.sin(1.9 * phase + 1.1);
      const lift = amplitude * gust * free * wave;
      xs[i] = width - distance + amplitude * 0.12 * gust * free * Math.cos(phase);
      ys[i] = top + edge * spacing * (1 + 0.04 * s) - tilt * s + drop * (1 - tied) + lift;
    }
    paths.push(spline(xs, ys));
  }
  return paths;
}

/** 0 at or below 0, 1 at or above 1, easing in and out between. */
function smooth(value: number): number {
  const v = Math.min(Math.max(value, 0), 1);
  return v * v * (3 - 2 * v);
}

/** A smooth path through the points (Catmull-Rom as cubic Béziers). */
function spline(xs: Float64Array, ys: Float64Array): string {
  const n = xs.length;
  const at = (i: number) => Math.min(Math.max(i, 0), n - 1);
  let d = `M${xs[0]!.toFixed(2)} ${ys[0]!.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = at(i - 1);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = xs[i]! + (xs[p2]! - xs[p0]!) / 6;
    const c1y = ys[i]! + (ys[p2]! - ys[p0]!) / 6;
    const c2x = xs[p2]! - (xs[p3]! - xs[i]!) / 6;
    const c2y = ys[p2]! - (ys[p3]! - ys[i]!) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${xs[p2]!.toFixed(2)} ${ys[p2]!.toFixed(2)}`;
  }
  return d;
}

export function FlagLines({
  className = '',
  opacity = 0.42,
}: {
  className?: string;
  opacity?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const lines = Array.from(svg.querySelectorAll<SVGPathElement>('path'));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let size: Size = FALLBACK;
    let frame = 0;
    let visible = true;
    const start = performance.now();

    const draw = (time: number) => {
      const paths = edgePaths(size, time);
      lines.forEach((line, index) => line.setAttribute('d', paths[index] ?? ''));
    };
    const tick = (now: number) => {
      draw((now - start) / 1000);
      frame = visible ? requestAnimationFrame(tick) : 0;
    };
    const play = () => {
      if (!still && visible && !frame) frame = requestAnimationFrame(tick);
    };

    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      size = { width, height };
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      if (still || !frame) draw(still ? 0 : (performance.now() - start) / 1000);
    });
    const onScreen = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      play();
    });
    resize.observe(svg);
    onScreen.observe(svg);
    play();

    return () => {
      resize.disconnect();
      onScreen.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  const initial = edgePaths(FALLBACK, 0);
  return (
    <svg
      ref={svgRef}
      data-flag-lines=""
      viewBox={`0 0 ${FALLBACK.width} ${FALLBACK.height}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      {initial.map((d, index) => {
        const t = index / (EDGES - 1);
        const accent = index % 4 === 0;
        return (
          <path
            key={index}
            d={d}
            stroke={accent ? 'var(--accent-graphic)' : 'currentColor'}
            strokeWidth={accent ? 1.1 : 0.85}
            opacity={0.5 - t * 0.3}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
