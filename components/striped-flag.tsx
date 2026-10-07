'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * An American flag, outlined only, waving: thirteen stripes with a cluster of
 * twinkling stars in the top-left corner, seen as a crop of the cloth.
 *
 * The stripe borders ripple in a slow wave that runs out from an unseen pole
 * off the left, freer the farther it gets. The stripes fade out as they run
 * into the stars, which have no border or field behind them: a scatter of
 * points of light of every size, packed densest at the very corner and
 * thinning out across it, with a few glinting through as tiny crosses (the
 * same sky as the giving page's shooting stars). Every star ripples with the
 * cloth and twinkles on its own beat, the glints growing and shrinking as
 * they flash.
 * The box that holds it is meant to be tilted slightly, like a camera angle.
 * Idles while off screen; under reduced motion it holds a single frame.
 * Purely decorative; never announced.
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

// The stripes are fully visible from FADE_END, and gone before the first star.
const FADE_START = 300;
const FADE_END = 540;

type Star = {
  x: number;
  y: number;
  glint: boolean;
  size: number; // dots: stroke width in px; glints: arm length in viewBox units
  period: number; // seconds per twinkle
  seed: number;
  accent: boolean;
};

/** Small deterministic generator, so server and client draw the same sky. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The sky fills the top-left corner of the cloth, edge to edge.
const SKY = { x: CROP_X, y: 12, width: 380, height: 290 };
const DOTS = 100;
const GLINTS = 14;

const STARS: Star[] = (() => {
  const random = mulberry32(11);
  return Array.from({ length: DOTS + GLINTS }, (_, i) => {
    const glint = i >= DOTS;
    return {
      // Raising to a power crowds stars toward the corner and thins them outward.
      x: SKY.x + SKY.width * random() ** 1.35,
      y: SKY.y + SKY.height * random() ** 1.35,
      glint,
      size: glint ? 3 + random() * 4 : 1 + random() ** 2.2 * 3.2,
      period: 1.4 + random() * 3,
      seed: random() * Math.PI * 2,
      accent: random() < 0.25,
    };
  });
})();

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

/** A tiny cross of two hairlines: the glint of a bright star. */
function glintPath(cx: number, cy: number, r: number) {
  return (
    `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}H${(cx + r).toFixed(1)}` +
    `M${cx.toFixed(1)} ${(cy - r).toFixed(1)}V${(cy + r).toFixed(1)}`
  );
}

function flagState(stripes: number, t: number, animated: boolean) {
  const span = stripeSpan(stripes);
  const borders: string[] = [];
  for (let line = 0; line <= stripes; line++) {
    const baseY = INSET + span * line;
    let d = '';
    for (let i = 0; i <= SAMPLES; i++) {
      const x = (W * i) / SAMPLES;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(baseY + ripple(x, t, line * 0.35)).toFixed(1)}`;
    }
    borders.push(d);
  }
  const stars = STARS.map((star) => {
    const y = star.y + ripple(star.x, t, ((star.y - INSET) / span) * 0.35);
    const beat = animated
      ? 0.5 + 0.5 * Math.sin((t / star.period) * Math.PI * 2 + star.seed)
      : 0.7;
    const bright = animated ? 0.2 + 0.8 * beat ** 2 : 0.8;
    if (star.glint) {
      const scale = animated ? 0.2 + 0.8 * beat ** 3 : 0.7;
      return { d: glintPath(star.x, y, star.size * scale), opacity: bright, width: 0.8 };
    }
    return {
      d: `M${star.x.toFixed(1)} ${y.toFixed(1)}h0.01`,
      opacity: bright,
      width: star.size * (animated ? 0.6 + 0.8 * beat : 1),
    };
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
  const initial = flagState(STRIPES, 0, false);

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
      const next = flagState(STRIPES, (now - start) / 1000, true);
      borders.forEach((path, i) => path.setAttribute('d', next.borders[i] ?? ''));
      stars.forEach((path, i) => {
        const star = next.stars[i];
        if (!star) return;
        path.setAttribute('d', star.d);
        path.setAttribute('opacity', star.opacity.toFixed(2));
        if (!STARS[i]?.glint) path.setAttribute('stroke-width', star.width.toFixed(2));
      });
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
      <g opacity={opacity}>
        {/* The stripes beside the stars fade out as they run into them. */}
        <g mask={`url(#${fadeId})`}>
          {initial.borders.slice(0, CANTON_ROWS + 1).map((d, index) => border(d, index))}
        </g>
        {initial.borders.slice(CANTON_ROWS + 1).map((d, index) => border(d, index + CANTON_ROWS + 1))}
      </g>
      {/* Stars are drawn at full strength: points of light, not part of the cloth's linework. */}
      {initial.stars.map((star, index) => {
        const spec = STARS[index]!;
        return (
          <path
            key={index}
            data-flag-star=""
            d={star.d}
            opacity={star.opacity}
            stroke={spec.accent ? 'var(--accent-graphic)' : 'currentColor'}
            strokeWidth={star.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
