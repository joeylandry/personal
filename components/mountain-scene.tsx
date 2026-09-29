/**
 * Night in the White Mountains.
 *
 * Layered ridgelines receding into haze, a pine treeline, and on a small
 * rise a figure at a laptop with a cat beside him — the whole brand in one
 * picture: a guy, a cat, alone in the woods, building software. Purely
 * decorative; never announced.
 */

/** Deterministic pseudo-random so server and client render the same scene. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** A three-tier pine silhouette standing on (x, base). */
function pine(x: number, base: number, h: number) {
  const w = h * 0.3;
  const tier = (top: number, bottom: number, half: number) =>
    `M${x} ${top}L${x + half} ${bottom}L${x - half} ${bottom}Z`;
  return [
    tier(base - h, base - h * 0.55, w * 0.55),
    tier(base - h * 0.75, base - h * 0.28, w * 0.8),
    tier(base - h * 0.5, base - h * 0.04, w),
    `M${x - 1.2} ${base - h * 0.05}h2.4V${base}h-2.4Z`,
  ].join('');
}

const FAR_RIDGE =
  'M0 300L90 262L160 280L250 214L320 250L380 228L470 170L540 214L610 196L700 232L780 188L850 150L930 204L1010 176L1090 222L1200 190V500H0Z';
const MID_RIDGE =
  'M0 352L80 318L170 338L260 290L350 330L430 302L520 262L600 306L690 286L770 318L860 270L950 242L1040 290L1120 268L1200 300V500H0Z';
const NEAR_RIDGE =
  'M0 408L110 382L220 398L330 364L450 392L560 372L660 396L760 376L860 356L930 340L990 350L1080 380L1200 366V500H0Z';

const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: rand(i + 1) * 1200,
  y: rand(i + 101) * 210,
  r: 0.5 + rand(i + 201) * 0.9,
  o: 0.25 + rand(i + 301) * 0.5,
}));

// Treeline along the foot of the near ridge.
const TREES = Array.from({ length: 64 }, (_, i) => {
  const x = i * 19 + rand(i + 401) * 12;
  return { x, h: 26 + rand(i + 501) * 34 };
});

export function MountainScene({
  className = '',
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ opacity }}
    >
      <defs>
        <radialGradient id="screen-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--accent-graphic)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent-graphic)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ridge-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.13" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Stars and a thin moon. */}
      {STARS.map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="currentColor" opacity={star.o} />
      ))}
      <path d="M1062 70a26 26 0 1 0 22 40a22 22 0 1 1-22-40Z" fill="currentColor" opacity={0.55} />

      {/* Ridges, far to near. */}
      <path d={FAR_RIDGE} fill="url(#ridge-haze)" />
      <path d={MID_RIDGE} fill="var(--color-ink-high)" />
      <path
        d={MID_RIDGE}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.18}
        vectorEffect="non-scaling-stroke"
      />
      <path d={NEAR_RIDGE} fill="var(--color-ink-raised)" />

      <path d="M840 360C900 334 990 330 1060 373V500H840Z" fill="var(--color-ink-raised)" />

      {/* Treeline. */}
      <path
        d={TREES.map((tree) => pine(tree.x, 470 - tree.h * 0.2, tree.h)).join('')}
        fill="var(--color-ink)"
      />
      <path d="M0 440H1200V500H0Z" fill="var(--color-ink)" />

      {/* The rise: a guy, a laptop, a cat. */}
      <g>
        <ellipse cx="948" cy="330" rx="46" ry="30" fill="url(#screen-glow)" />

        {/* Person, seated, facing the laptop. */}
        <g fill="var(--color-ink)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1}>
          <circle cx="928" cy="298" r="7" />
          <path d="M920 306C914 318 914 332 918 344H940L946 334L952 332V326L938 320C936 314 934 308 932 306Z" />
          <path d="M918 344H966V350H918Z" />
        </g>

        {/* Laptop. */}
        <path d="M950 332L964 318L968 320L956 334Z" fill="var(--accent-graphic)" opacity={0.9} />
        <path d="M944 334H966V337H944Z" fill="currentColor" opacity={0.5} />

        {/* Cat, sitting, tail curled. */}
        <g fill="var(--color-ink)" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1}>
          <path d="M986 356C982 346 983 336 988 330L986 322L991 327H997L1002 322L1001 330C1006 336 1007 346 1003 356Z" />
          <path d="M1003 354C1012 354 1016 348 1013 342" fill="none" strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
}
