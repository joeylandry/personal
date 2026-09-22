/**
 * Generates the three project cover illustrations.
 *
 * These are authored artwork, not screenshots: the live sites could not be
 * captured from the build environment, and a fabricated "screenshot" would
 * misrepresent the products. Each cover abstracts what its project actually
 * does, in that project's accent color.
 *
 * Regenerate with:  node scripts/generate-covers.mjs
 * Replace with real captures by dropping <slug>.png into public/images/projects
 * and updating `image` in content/projects.ts.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images', 'projects');
const W = 1600;
const H = 1000;

const INK = '#071018';
const PAPER = '#F4F0E8';
const PAPER_2 = '#E6DFD0';
const SEA = '#72D6C9';
const SEA_DEEP = '#0B6D60';
const AMBER = '#F3B45B';
const GOLD = '#E7C36A';
const FOG = '#9FB1BD';

const round = (n) => Number(n.toFixed(2));

/** Fine technical grid. */
function grid(step, color, opacity) {
  const lines = [];
  for (let x = step; x < W; x += step) {
    lines.push(`<path d="M${x} 0V${H}"/>`);
  }
  for (let y = step; y < H; y += step) {
    lines.push(`<path d="M0 ${y}H${W}"/>`);
  }
  return `<g stroke="${color}" stroke-width="1" opacity="${opacity}">${lines.join('')}</g>`;
}

/** Stacked coastline contours. */
function contours({ base, count, gap, color, accent, opacity, yOffset = 0 }) {
  const paths = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    paths.push(
      `<path d="${base}" transform="translate(0 ${round(yOffset + i * gap)})" stroke="${
        i % 4 === 0 ? accent : color
      }" stroke-width="${i % 4 === 0 ? 2 : 1.3}" opacity="${round(opacity * (1 - t * 0.72))}"/>`,
    );
  }
  return `<g fill="none">${paths.join('')}</g>`;
}

const monoText = (x, y, text, { size = 20, fill = FOG, spacing = 3.4, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="ui-monospace, 'SFMono-Regular', Menlo, monospace" font-size="${size}" letter-spacing="${spacing}" text-anchor="${anchor}">${text}</text>`;

const corners = (x, y, w, h, color) => {
  const s = 16;
  return `<g stroke="${color}" stroke-width="2" fill="none">
    <path d="M${x} ${y + s}V${y}h${s}"/>
    <path d="M${x + w - s} ${y}h${s}v${s}"/>
    <path d="M${x + w} ${y + h - s}V${y + h}h-${s}"/>
    <path d="M${x + s} ${y + h}h-${s}v-${s}"/>
  </g>`;
};

/* ---------------------------------------------------------------- Nyes Neck */

function nyesNeck() {
  const coast =
    'M-100 560C120 520 260 590 420 540c150-47 190-158 380-186 200-30 330 66 486 12 150-52 180-168 340-206';

  const tee = (x, y, scale, stroke, fill) => `
    <g transform="translate(${x} ${y}) scale(${scale})" fill="${fill}" stroke="${stroke}" stroke-width="${round(2 / scale)}" stroke-linejoin="round">
      <path d="M34 10 46 4c4 9 14 9 18 0l12 6 18 16-12 12-8-7v73H32V31l-8 7-12-12z"/>
    </g>`;

  const cards = [0, 1, 2]
    .map((i) => {
      const x = 880 + i * 220;
      const y = 560;
      return `<g>
        <rect x="${x}" y="${y}" width="190" height="270" fill="${PAPER}" stroke="${SEA_DEEP}" stroke-opacity="0.35" stroke-width="1.5"/>
        ${tee(x + 45, y + 55, 1.0, SEA_DEEP, i === 1 ? SEA : 'none')}
        <path d="M${x + 22} ${y + 218}h84" stroke="${SEA_DEEP}" stroke-opacity="0.55" stroke-width="5"/>
        <path d="M${x + 22} ${y + 240}h48" stroke="${SEA_DEEP}" stroke-opacity="0.25" stroke-width="4"/>
      </g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${PAPER}"/>
      <stop offset="1" stop-color="${PAPER_2}"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${AMBER}" stop-opacity="0"/>
      <stop offset="0.45" stop-color="${AMBER}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${AMBER}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${grid(80, SEA_DEEP, 0.07)}
  <circle cx="1180" cy="250" r="86" fill="${AMBER}" opacity="0.22"/>
  <circle cx="1180" cy="250" r="86" fill="none" stroke="${AMBER}" stroke-width="2" opacity="0.6"/>
  <path d="M0 250h${W}" stroke="url(#sun)" stroke-width="2"/>
  ${contours({ base: coast, count: 14, gap: 26, color: SEA_DEEP, accent: SEA_DEEP, opacity: 0.5 })}
  ${cards}
  ${corners(96, 96, W - 192, H - 192, SEA_DEEP)}
  ${monoText(120, 150, 'NYES NECK CLOTHING &#38; APPAREL', { size: 24, fill: SEA_DEEP })}
  ${monoText(120, 190, 'CAPE COD · SINCE A LEMONADE STAND', { size: 18, fill: '#4A5C68' })}
  ${monoText(120, 858, 'NEXT.JS · SANITY · PRINTFUL', { size: 17, fill: '#4A5C68' })}
  ${monoText(W - 120, 858, 'NYESNECK.SHOP', { size: 17, fill: SEA_DEEP, anchor: 'end' })}
</svg>`;
}

/* -------------------------------------------------------- Arlington Brewing */

function arlington() {
  // Tip lands exactly on (x, y) at any scale.
  const pin = (x, y, scale, color, filled) => {
    const s = 2.2 * scale;
    return `
    <g transform="translate(${round(x - 12 * s)} ${round(y - 23 * s)}) scale(${round(s)})">
      <path d="M12 23s8-9.6 8-14.6A8 8 0 1 0 4 8.4C4 13.4 12 23 12 23z"
        fill="${filled ? color : '#0E1116'}" fill-opacity="${filled ? 0.9 : 0.55}"
        stroke="${color}" stroke-width="1.5"/>
      <circle cx="12" cy="8.4" r="3" fill="${filled ? '#0E1116' : color}"/>
    </g>`;
  };

  const can = (x, y, color, opacity) => `
    <g opacity="${opacity}">
      <rect x="${x}" y="${y}" width="96" height="220" rx="12" fill="none" stroke="${color}" stroke-width="3"/>
      <rect x="${x}" y="${y + 74}" width="96" height="62" fill="${color}" opacity="0.22"/>
      <path d="M${x} ${y + 74}h96M${x} ${y + 136}h96" stroke="${color}" stroke-width="3"/>
      <path d="M${x + 22} ${y + 18}h52" stroke="${color}" stroke-width="3" opacity="0.7"/>
      <path d="M${x + 20} ${y + 176}h56M${x + 20} ${y + 194}h34" stroke="${color}" stroke-width="3" opacity="0.4"/>
    </g>`;

  const roads = [
    'M620 1000C660 820 760 760 900 720c160-46 240-130 260-260',
    'M520 200c120 120 180 160 360 190 180 30 280 110 320 250',
    'M1600 540c-180 20-300 60-420 140-110 74-200 100-340 92',
  ]
    .map(
      (d, i) =>
        `<path d="${d}" fill="none" stroke="${AMBER}" stroke-width="${i === 0 ? 3 : 2}" opacity="${i === 0 ? 0.45 : 0.25}"/>`,
    )
    .join('');

  const pins = [
    [780, 400, 1, false],
    [1080, 330, 1, false],
    [1240, 620, 1.35, true],
    [900, 700, 1, false],
    [1380, 470, 0.85, false],
    [660, 620, 0.85, false],
  ]
    .map(([x, y, s, f]) => pin(x, y, s, AMBER, f))
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="glow" cx="0.72" cy="0.5" r="0.62">
      <stop offset="0" stop-color="#2A2113"/>
      <stop offset="1" stop-color="#0E1116"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${grid(64, AMBER, 0.09)}
  <g opacity="0.5">${roads}</g>
  <circle cx="1240" cy="620" r="150" fill="none" stroke="${AMBER}" stroke-width="1.5" opacity="0.5"/>
  <circle cx="1240" cy="620" r="230" fill="none" stroke="${AMBER}" stroke-width="1.5" opacity="0.28"/>
  <circle cx="1240" cy="620" r="310" fill="none" stroke="${AMBER}" stroke-width="1.5" opacity="0.14"/>
  ${pins}
  <g>
    ${can(150, 500, AMBER, 0.95)}
    ${can(268, 500, AMBER, 0.6)}
    ${can(386, 500, AMBER, 0.35)}
  </g>
  ${corners(96, 96, W - 192, H - 192, AMBER)}
  ${monoText(150, 160, 'ARLINGTON BREWING COMPANY', { size: 24, fill: AMBER })}
  ${monoText(150, 200, 'BEER FINDER · EVENTS · TAPROOM', { size: 18, fill: FOG })}
  ${monoText(150, 860, 'NEXT.JS · SANITY · LEAFLET', { size: 17, fill: FOG })}
  ${monoText(W - 150, 860, 'DRINKARLINGTONBEER.COM', { size: 17, fill: AMBER, anchor: 'end' })}
</svg>`;
}

/* ------------------------------------------------------------ The Black Veil */

function blackVeil() {
  const rays = [];
  const cx = 800;
  const cy = 1180;
  for (let i = 0; i <= 30; i += 1) {
    const angle = Math.PI + (i / 30) * Math.PI;
    const x = cx + Math.cos(angle) * 1250;
    const y = cy + Math.sin(angle) * 1250;
    rays.push(
      `<path d="M${cx} ${cy}L${round(x)} ${round(y)}" stroke="${GOLD}" stroke-width="${
        i % 5 === 0 ? 2 : 1
      }" opacity="${round(0.24 - Math.abs(i - 15) * 0.006)}"/>`,
    );
  }

  const card = (x, y, rotate, opacity) => `
    <g transform="rotate(${rotate} ${x + 110} ${y + 75})" opacity="${opacity}">
      <rect x="${x}" y="${y}" width="220" height="150" fill="#0B0E14" stroke="${GOLD}" stroke-width="1.6" stroke-opacity="0.55"/>
      <path d="M${x + 20} ${y + 32}h120M${x + 20} ${y + 58}h180M${x + 20} ${y + 80}h150M${x + 20} ${y + 102}h168M${x + 20} ${y + 124}h96"
        stroke="${GOLD}" stroke-width="3" opacity="0.32"/>
    </g>`;

  const mask = `
    <g fill="none" stroke="${GOLD}" stroke-width="3.5">
      <path d="M800 372c-78-52-176-58-224-24-46 33-40 108 12 142 60 39 152 22 212-40 60 62 152 79 212 40 52-34 58-109 12-142-48-34-146-28-224 24z"
        fill="#0B0E14" fill-opacity="0.85"/>
      <path d="M646 424c20-26 60-26 82 0-22 24-62 24-82 0z" fill="#05070B" stroke-width="2.5"/>
      <path d="M872 424c22-26 62-26 82 0-20 24-60 24-82 0z" fill="#05070B" stroke-width="2.5"/>
      <path d="M612 372c34-20 84-18 112 4M876 376c28-22 78-24 112-4" stroke-width="2" opacity="0.7"/>
      <path d="M800 402v56" stroke-width="2" opacity="0.6"/>
      <path d="M576 452c-54 18-92 46-112 84M1024 452c54 18 92 46 112 84" stroke-width="2" opacity="0.45"/>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="veil" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0" stop-color="#101620"/>
      <stop offset="1" stop-color="#05070B"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <g>${rays.join('')}</g>
  ${grid(80, GOLD, 0.05)}
  <circle cx="800" cy="430" r="300" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.28"/>
  <circle cx="800" cy="430" r="356" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.14"/>
  ${card(150, 640, -7, 0.85)}
  ${card(1230, 660, 6, 0.7)}
  ${mask}
  <g>
    <rect x="560" y="820" width="480" height="58" fill="#0B0E14" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="1.5"/>
    ${monoText(586, 857, '&#62; trial 03 · verified', { size: 20, fill: GOLD, spacing: 2 })}
    <rect x="${586 + 302}" y="838" width="12" height="24" fill="${GOLD}" opacity="0.8"/>
  </g>
  ${corners(96, 96, W - 192, H - 192, GOLD)}
  ${monoText(800, 170, 'THE BLACK VEIL', { size: 28, fill: GOLD, anchor: 'middle', spacing: 10 })}
  ${monoText(800, 212, 'MANCHESTER, N.H. · 1921—1926', { size: 17, fill: FOG, anchor: 'middle' })}
  ${monoText(150, 940, 'POSTGRES · DRIZZLE · HMAC SESSIONS', { size: 17, fill: FOG })}
  ${monoText(W - 150, 940, 'ARCHIVE · RSVP · CTF', { size: 17, fill: GOLD, anchor: 'end' })}
</svg>`;
}

/* ------------------------------------------------------------------- write */

const covers = {
  'nyes-neck.svg': nyesNeck(),
  'arlington-brewing.svg': arlington(),
  'the-black-veil.svg': blackVeil(),
};

mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries(covers)) {
  const minified = svg.replace(/\n\s*/g, ' ').replace(/>\s+</g, '><').trim();
  writeFileSync(join(OUT, name), `${minified}\n`, 'utf8');
  console.log(`wrote ${name} (${(minified.length / 1024).toFixed(1)} kB)`);
}
// INK and PAPER_2 are referenced by gradients above; keep the palette together.
void INK;
