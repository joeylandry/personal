import { CoastlineBreeze } from './coastline-breeze';

/**
 * Contour field.
 *
 * One hand-drawn coastal curve, repeated with a small vertical offset and
 * falling opacity — the look of a topographic survey of a neck of land.
 * Purely decorative; never announced.
 *
 * With `breeze`, the field is turned over so the lines fall toward the right,
 * pinned at its right edge, and the lines fly together from there like
 * strings in an onshore wind (coastline-breeze.tsx), cropped at the box's
 * left edge. Under reduced motion they sit still.
 */
const CURVE =
  'M-40 232C60 214 118 236 186 206c58-26 74-74 148-88 78-15 132 30 196 2 62-27 70-84 140-100 44-10 78 2 116 18';

// With `breeze`, the field ends (and the strings are tied) here, on the
// curve's gentler middle stretch rather than its steep climb at the far end.
const BREEZE_POLE = 560;

export function Coastline({
  lines = 9,
  gap = 15,
  className = '',
  opacity = 0.5,
  breeze = false,
}: {
  lines?: number;
  gap?: number;
  className?: string;
  opacity?: number;
  breeze?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${breeze ? BREEZE_POLE : 700} 400`}
      preserveAspectRatio={breeze ? 'xMaxYMid slice' : 'xMidYMid slice'}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      <g transform={breeze ? 'matrix(1 0 0 -1 0 400)' : undefined}>
        {Array.from({ length: lines }, (_, index) => {
          const t = index / Math.max(lines - 1, 1);
          return (
            <path
              key={index}
              d={CURVE}
              data-coast-line=""
              transform={`translate(0 ${index * gap}) scale(1 ${1 - t * 0.06})`}
              stroke={index % 4 === 0 ? 'var(--accent-graphic)' : 'currentColor'}
              strokeWidth={index % 4 === 0 ? 1.1 : 0.85}
              opacity={0.5 - t * 0.34}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>
      {breeze ? <CoastlineBreeze curve={CURVE} pole={BREEZE_POLE} /> : null}
    </svg>
  );
}
