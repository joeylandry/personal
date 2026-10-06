/**
 * Contour field.
 *
 * One hand-drawn coastal curve, repeated with a small vertical offset and
 * falling opacity — the look of a topographic survey of a neck of land.
 * Purely decorative; never announced.
 */
const CURVE =
  'M-40 232C60 214 118 236 186 206c58-26 74-74 148-88 78-15 132 30 196 2 62-27 70-84 140-100 44-10 78 2 116 18';

export function Coastline({
  lines = 9,
  gap = 15,
  className = '',
  opacity = 0.5,
}: {
  lines?: number;
  gap?: number;
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 700 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      {Array.from({ length: lines }, (_, index) => {
        const t = index / Math.max(lines - 1, 1);
        return (
          <path
            key={index}
            d={CURVE}
            transform={`translate(0 ${index * gap}) scale(1 ${1 - t * 0.06})`}
            stroke={index % 4 === 0 ? 'var(--accent-graphic)' : 'currentColor'}
            strokeWidth={index % 4 === 0 ? 1.1 : 0.85}
            opacity={0.5 - t * 0.34}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
