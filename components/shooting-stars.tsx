/**
 * Shooting-star field.
 *
 * The Giving page's sibling to the About page's contour lines, and a nod to
 * the Make-A-Wish star: two wishing stars whose trails are drawn as a fan of
 * contour lines sweeping up from the lower left, a few small streaks that
 * shoot across now and then, and faint points of light.
 *
 * Everything sits at fixed positions so the server and client render the same
 * markup. The small streaks only move, and the points of light only drift
 * past, while animating; at rest, and under reduced motion (the global rule
 * cancels the animation), they sit at their drawn positions, so the still
 * frame is the full picture. Once WishingFlight takes over, the drawn wishing
 * stars step aside for the live pair. Purely decorative; never announced.
 */

/** A wishing star: its head, the heading of its trail, and the trail's shape. */
interface Swoosh {
  x: number;
  y: number;
  /** Degrees; negative climbs toward the upper right. */
  angle: number;
  length: number;
  /** Contour lines in the trail, fanning out toward the tail. */
  lines: number;
  gap: number;
  /** How far the trail bows below a straight line. */
  bow: number;
}

const SWOOSHES: Swoosh[] = [
  { x: 870, y: 104, angle: -18, length: 860, lines: 7, gap: 10, bow: 64 },
  { x: 1392, y: 560, angle: -13, length: 640, lines: 5, gap: 8, bow: 44 },
];

/** A small shooting star: head, heading, trail length, and its timing. */
interface Streak {
  x: number;
  y: number;
  angle: number;
  length: number;
  /** Seconds per cycle. */
  cycle: number;
  /** Seconds into the cycle at page load, so they never fire together. */
  offset: number;
}

const STREAKS: Streak[] = [
  { x: 1300, y: 96, angle: 26, length: 150, cycle: 12, offset: 3 },
  { x: 760, y: 70, angle: 24, length: 110, cycle: 17, offset: 10 },
  { x: 1230, y: 400, angle: 28, length: 130, cycle: 15, offset: 7 },
  { x: 520, y: 650, angle: 24, length: 120, cycle: 19, offset: 14 },
];

/** Faint points of light: x, y, radius, and a twinkle offset in seconds. */
const POINTS: [number, number, number, number][] = [
  [660, 150, 1.3, 0],
  [900, 52, 1, 1.4],
  [1180, 230, 1.5, 2.6],
  [1360, 300, 1, 3.1],
  [1080, 420, 1.2, 1.9],
  [880, 610, 1, 0.4],
  [1240, 690, 1.4, 2.2],
  [420, 120, 0.9, 3.6],
  [80, 60, 1.1, 1.1],
  [300, 700, 0.9, 2.9],
  [1420, 160, 0.9, 0.6],
  [980, 300, 0.8, 3.3],
];

/** A four-point sparkle, the head of a wishing star. */
const SPARKLE = 'M0 -9L1.3 -1.3L9 0L1.3 1.3L0 9L-1.3 1.3L-9 0L-1.3 -1.3Z';

export function ShootingStars({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="giving-star-glow">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {/* Trails are clear at the tail and brighten into the head. */}
        {[...SWOOSHES, ...STREAKS].map((star, index) => (
          <linearGradient
            key={index}
            id={`giving-trail-${index}`}
            gradientUnits="userSpaceOnUse"
            x1={-star.length}
            y1="0"
            x2="0"
            y2="0"
          >
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.75" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="1" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
        ))}
      </defs>

      {/* The field drifts left and wraps: a second copy follows one viewBox to the right. */}
      <g className="giving-drift">
        {[0, 1440].map((shift) => (
          <g key={shift} transform={shift ? `translate(${shift} 0)` : undefined}>
            {POINTS.map(([cx, cy, r, delay]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="currentColor"
                className="giving-twinkle"
                style={{ animationDelay: `-${delay}s` }}
              />
            ))}
          </g>
        ))}
      </g>

      {SWOOSHES.map((swoosh, index) => (
        <g
          key={`${swoosh.x}-${swoosh.y}`}
          className="giving-swoosh"
          transform={`translate(${swoosh.x} ${swoosh.y}) rotate(${swoosh.angle})`}
        >
          {/* Every contour starts a little lower at the tail and meets at the head. */}
          {Array.from({ length: swoosh.lines }, (_, line) => {
            const t = line / Math.max(swoosh.lines - 1, 1);
            const drop = line * swoosh.gap;
            return (
              <path
                key={line}
                d={`M${-swoosh.length} ${drop}C${-swoosh.length * 0.55} ${drop + swoosh.bow} ${-swoosh.length * 0.2} ${swoosh.bow * 0.35} 0 0`}
                stroke={`url(#giving-trail-${index})`}
                strokeWidth={line === 0 ? 1.2 : 0.8}
                opacity={0.6 - t * 0.42}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <circle r="18" fill="url(#giving-star-glow)" opacity="0.6" />
          <path d={SPARKLE} transform={`rotate(${-swoosh.angle})`} fill="currentColor" />
        </g>
      ))}

      {STREAKS.map((streak, index) => (
        <g
          key={`${streak.x}-${streak.y}`}
          transform={`translate(${streak.x} ${streak.y}) rotate(${streak.angle})`}
          opacity="0.7"
        >
          <g
            className="giving-shoot"
            style={{
              animationDuration: `${streak.cycle}s`,
              animationDelay: `-${streak.offset}s`,
            }}
          >
            {/* A tapered sliver: a hairline at the tail, a little over a pixel at the head. */}
            <path
              d={`M${-streak.length} 0L-2 -1.1Q0 0 -2 1.1Z`}
              fill={`url(#giving-trail-${SWOOSHES.length + index})`}
            />
            <circle r="6" fill="url(#giving-star-glow)" />
            <circle r="1.4" fill="currentColor" />
          </g>
        </g>
      ))}
    </svg>
  );
}
