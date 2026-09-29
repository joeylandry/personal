/**
 * Sunrise over the White Mountains in autumn.
 *
 * A bright, scenic backdrop: a dawn sky warming toward the horizon, a low sun,
 * hazy blue ridges receding into the distance and nearer hillsides in fall
 * foliage, with a dark pine treeline in front. Purely decorative; never
 * announced.
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
  ].join('');
}

/** A rounded deciduous crown: the fall-foliage texture on the near hills. */
function crown(x: number, y: number, r: number) {
  return `M${x - r} ${y}a${r} ${r * 0.9} 0 1 1 ${r * 2} 0a${r} ${r * 0.5} 0 0 1 ${-r * 2} 0Z`;
}

const RIDGES = [
  // Farthest: pale haze just under the horizon glow.
  {
    d: 'M0 262L70 248L150 256L240 224L300 238L380 214L450 226L530 200L610 218L700 196L780 212L860 190L950 206L1040 186L1120 204L1200 194V500H0Z',
    fill: '#9fb3cf',
  },
  {
    d: 'M0 292L90 270L170 284L260 250L340 272L420 246L510 266L590 236L680 262L760 240L850 258L930 230L1020 254L1110 238L1200 252V500H0Z',
    fill: '#7389ad',
  },
  {
    d: 'M0 330L100 300L200 318L290 286L380 310L470 282L560 306L650 280L740 300L830 272L920 296L1010 276L1110 298L1200 284V500H0Z',
    fill: '#556c93',
  },
];

// Near hillsides in fall colour, back to front.
const NEAR_HILL =
  'M0 372L120 346L250 362L380 330L520 356L640 336L780 350L900 322L1030 344L1200 330V500H0Z';
const FRONT_HILL =
  'M0 408L140 384L290 400L430 376L590 396L730 380L880 398L1020 374L1200 390V500H0Z';

const FOLIAGE = ['#c8502a', '#e07a2e', '#e9a13b', '#b8392a', '#d9c04a', '#9c3b26'];

const NEAR_CROWNS = Array.from({ length: 420 }, (_, i) => {
  const x = rand(i + 1) * 1200;
  const y = 350 + rand(i + 101) * 62;
  return { x, y, r: 3.5 + rand(i + 201) * 4.5, c: FOLIAGE[i % FOLIAGE.length] };
});

const FRONT_CROWNS = Array.from({ length: 360 }, (_, i) => {
  const x = rand(i + 1301) * 1200;
  const y = 390 + rand(i + 1401) * 60;
  return { x, y, r: 5 + rand(i + 1501) * 6, c: FOLIAGE[(i + 3) % FOLIAGE.length] };
});

const PINES = Array.from({ length: 110 }, (_, i) => {
  const x = i * 11 + rand(i + 601) * 8;
  return { x, h: 22 + rand(i + 701) * 34 };
});

export function MountainScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="1" />
          <stop offset="0.12" stopColor="#ffe3a0" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ffb566" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="valley-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd89a" stopOpacity="0" />
          <stop offset="1" stopColor="#ffd89a" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      <circle cx="930" cy="214" r="190" fill="url(#sun-glow)" />
      <circle cx="930" cy="214" r="15" fill="#fff8e6" />

      {RIDGES.map((ridge) => (
        <path key={ridge.fill} d={ridge.d} fill={ridge.fill} />
      ))}
      <rect y="200" width="1200" height="140" fill="url(#valley-haze)" />

      <path d={NEAR_HILL} fill="#7a3a2a" />
      {NEAR_CROWNS.map((tree, i) => (
        <path key={i} d={crown(tree.x, tree.y, tree.r)} fill={tree.c} opacity={0.85} />
      ))}

      <path d={FRONT_HILL} fill="#5a2a1f" />
      {FRONT_CROWNS.map((tree, i) => (
        <path key={i} d={crown(tree.x, tree.y, tree.r)} fill={tree.c} />
      ))}

      <path d={PINES.map((tree) => pine(tree.x, 480, tree.h)).join('')} fill="#13251c" />
      <path d="M0 470H1200V500H0Z" fill="#13251c" />
    </svg>
  );
}
