'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * An American flag, outlined only, waving: thirteen stripes with a cluster of
 * twinkling stars in the top-left corner, seen as a crop of the cloth.
 *
 * The stripe borders ripple in a slow wave that runs out from an unseen pole
 * off the left, freer the farther it gets. The stripes fade out as they run
 * into the stars, which have no border or field behind them: nothing but
 * points of light, gathered in bunches like star clusters across the corner
 * with a thin scatter between them. Every star ripples with the cloth and
 * twinkles on its own beat, swelling and brightening as it flashes.
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

// The stripes fade out inside an oval around the corner the stars fill, and
// are fully drawn again beyond it, so nothing below or beside the stars is bare.
const FADE_CENTRE = { x: CROP_X, y: 12 };
const FADE_RADIUS = 440;
const FADE_SQUASH = 0.8; // the oval is a little shorter than it is wide

type Star = {
  x: number;
  y: number;
  size: number; // stroke width in px
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
const SKY = { x: CROP_X, y: 12, width: 300, height: 240 };
const STAR_COUNT = 320;
const CLUSTERS = 7;
const CLUSTERED = 0.6; // share of the stars that belong to a cluster
const STRAYS = 16; // loners that drift out just past the corner's edge

const STARS: Star[] = (() => {
  const random = mulberry32(11);
  // Roughly normal, so a cluster is dense in the middle and ragged at its edge.
  const bell = () => (random() + random() + random() - 1.5) / 1.5;
  const place = () => ({
    // Raising to a power crowds stars toward the corner and thins them outward.
    x: SKY.x + SKY.width * random() ** 1.1,
    y: SKY.y + SKY.height * random() ** 1.1,
  });
  const centres = Array.from({ length: CLUSTERS }, () => ({
    ...place(),
    spread: 14 + random() * 22,
  }));
  const sky = Array.from({ length: STAR_COUNT }, () => {
    // Stars stay inside the oval where the stripes are fully faded out, so
    // none ride over a visible stripe. A star that lands outside is thrown
    // again, not pushed back to the edge, which would draw a curved line.
    let dx = 0;
    let dy = 0;
    for (let tries = 0; tries < 40; tries++) {
      const centre = centres[Math.floor(random() * CLUSTERS)]!;
      const at =
        random() < CLUSTERED
          ? { x: centre.x + bell() * centre.spread * 1.5, y: centre.y + bell() * centre.spread * 1.2 }
          : place();
      dx = at.x - SKY.x;
      dy = at.y - SKY.y;
      if (dx >= 0 && dy >= 0 && Math.hypot(dx / SKY.width, dy / SKY.height) <= 1) break;
      dx = 0;
      dy = 0;
    }
    return {
      x: SKY.x + dx,
      y: SKY.y + dy,
      size: 1 + random() ** 2.2 * 3.4,
      period: 1.4 + random() * 3,
      seed: random() * Math.PI * 2,
      accent: random() < 0.25,
    };
  });
  // A few stars wander out slightly past the corner, mostly off its right side.
  const strays = Array.from({ length: STRAYS }, () => {
    const angle = (random() * 0.5 - 0.05) * Math.PI; // from just above level to well down
    const reach = 1.05 + random() ** 1.5 * 0.3;
    return {
      x: SKY.x + SKY.width * reach * Math.cos(angle),
      y: SKY.y + SKY.height * reach * Math.sin(angle),
      size: 1 + random() * 1.6,
      period: 1.4 + random() * 3,
      seed: random() * Math.PI * 2,
      accent: random() < 0.25,
    };
  });
  return [...sky, ...strays];
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
        path.setAttribute('stroke-width', star.width.toFixed(2));
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
        <radialGradient
          id={`${fadeId}-grad`}
          gradientUnits="userSpaceOnUse"
          cx={FADE_CENTRE.x}
          cy={FADE_CENTRE.y}
          r={FADE_RADIUS}
          gradientTransform={`translate(${FADE_CENTRE.x} ${FADE_CENTRE.y}) scale(1 ${FADE_SQUASH}) translate(${-FADE_CENTRE.x} ${-FADE_CENTRE.y})`}
        >
          <stop offset="0" stopColor="#000" />
          <stop offset="0.75" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id={fadeId} maskUnits="userSpaceOnUse" x={CROP_X} y={-H} width={CROP_W} height={H * 3}>
          <rect x={CROP_X} y={-H} width={CROP_W} height={H * 3} fill={`url(#${fadeId}-grad)`} />
        </mask>
      </defs>
      <g opacity={opacity}>
        {/* The stripes fade out as they run into the corner of stars. */}
        <g mask={`url(#${fadeId})`}>{initial.borders.map((d, index) => border(d, index))}</g>
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
