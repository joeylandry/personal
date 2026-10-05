/**
 * Shooting-star field.
 *
 * The Giving page's sibling to the About page's contour lines, and a nod to
 * the Make-A-Wish star: two wishing stars whose trails are drawn as a fan of
 * contour lines sweeping up from the lower left, a few small streaks that
 * shoot across now and then, and faint points of light.
 *
 * Everything sits at fixed positions so the server and client render the same
 * markup. The small streaks only move while animating; at rest, and under
 * reduced motion (the global rule cancels the animation), they sit at their
 * drawn positions, so the still frame is the full picture. Purely decorative;
 * never announced.
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
  // From the left, heading right: falling, level, and climbing.
  { x: 760, y: 70, angle: 24, length: 110, cycle: 17, offset: 10 },
  { x: 380, y: 260, angle: 40, length: 100, cycle: 16, offset: 1 },
  { x: 220, y: 480, angle: 12, length: 95, cycle: 21, offset: 17 },
  { x: 600, y: 520, angle: 30, length: 150, cycle: 18, offset: 8 },
  { x: 520, y: 650, angle: -20, length: 120, cycle: 19, offset: 14 },
  { x: 960, y: 520, angle: -35, length: 115, cycle: 18, offset: 4 },
  { x: 470, y: 580, angle: -25, length: 110, cycle: 20, offset: 13 },
  // From the right, heading left.
  { x: 1300, y: 96, angle: 155, length: 150, cycle: 12, offset: 3 },
  { x: 1080, y: 180, angle: 135, length: 170, cycle: 13, offset: 9 },
  { x: 1400, y: 300, angle: 168, length: 140, cycle: 11, offset: 6 },
  { x: 340, y: 470, angle: 150, length: 130, cycle: 15, offset: 2 },
  { x: 720, y: 600, angle: 160, length: 140, cycle: 17, offset: 15 },
  { x: 1230, y: 400, angle: 200, length: 130, cycle: 15, offset: 7 },
  { x: 640, y: 380, angle: 212, length: 135, cycle: 14, offset: 12 },
  { x: 800, y: 440, angle: 190, length: 120, cycle: 13, offset: 5 },
  { x: 1180, y: 620, angle: 220, length: 125, cycle: 16, offset: 11 },
  // Straight down and straight up, now and then.
  { x: 900, y: 220, angle: 82, length: 120, cycle: 22, offset: 18 },
  { x: 280, y: 160, angle: 100, length: 105, cycle: 24, offset: 6.5 },
  { x: 1120, y: 560, angle: -78, length: 110, cycle: 25, offset: 21 },
  // A little shower from the right: three near-parallel streaks a beat apart.
  { x: 1020, y: 120, angle: 148, length: 160, cycle: 23, offset: 20 },
  { x: 1080, y: 170, angle: 148, length: 120, cycle: 23, offset: 19.6 },
  { x: 1000, y: 210, angle: 148, length: 100, cycle: 23, offset: 19.2 },
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
  [560, 420, 1, 2.4],
  [1320, 520, 1.2, 0.9],
  [740, 260, 0.8, 4.1],
  [200, 300, 1, 1.7],
  [1100, 720, 0.9, 3.8],
  [620, 30, 1.1, 2],
  [250, 440, 1, 0.8],
  [470, 495, 1.2, 2.7],
  [690, 470, 0.9, 1.5],
  [380, 560, 1, 3.4],
  [610, 580, 1.1, 0.2],
  [150, 520, 0.9, 2.1],
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

      {SWOOSHES.map((swoosh, index) => (
        <g
          key={`${swoosh.x}-${swoosh.y}`}
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
