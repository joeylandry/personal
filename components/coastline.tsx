import type { CSSProperties } from 'react';

/**
 * Contour field.
 *
 * One hand-drawn coastal curve, repeated with a small vertical offset and
 * falling opacity — the look of a topographic survey of a neck of land.
 * Purely decorative; never announced.
 *
 * With `breeze`, the field moves like an onshore wind: each line sways on a
 * slightly later beat than the one above it, so a gust rolls through the
 * whole survey, and faint streaks of light ride along a few of the lines.
 * Under reduced motion it sits still at its drawn position.
 */
const CURVE =
  'M-40 232C60 214 118 236 186 206c58-26 74-74 148-88 78-15 132 30 196 2 62-27 70-84 140-100 44-10 78 2 116 18';

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
      viewBox="0 0 700 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`${breeze ? 'coast-breeze' : ''} ${className}`}
      style={{ opacity }}
    >
      {Array.from({ length: lines }, (_, index) => {
        const t = index / Math.max(lines - 1, 1);
        const transform = `translate(0 ${index * gap}) scale(1 ${1 - t * 0.06})`;
        const accent = index % 4 === 0;
        const line = (
          <path
            d={CURVE}
            transform={transform}
            stroke={accent ? 'var(--accent-graphic)' : 'currentColor'}
            strokeWidth={accent ? 1.1 : 0.85}
            opacity={0.5 - t * 0.34}
            vectorEffect="non-scaling-stroke"
          />
        );
        if (!breeze) return <g key={index}>{line}</g>;

        return (
          <g key={index} className="coast-line" style={{ '--i': index } as CSSProperties}>
            {line}
            {index % 3 === 1 ? (
              <path
                d={CURVE}
                transform={transform}
                pathLength={1000}
                className="coast-gust"
                stroke={accent ? 'var(--accent-graphic)' : 'currentColor'}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
