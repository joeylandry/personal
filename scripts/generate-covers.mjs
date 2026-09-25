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

/* ----------------------------------------------------------- joeylandry.com */

function recursiveSite() {
  // A browser window showing this site, which shows a browser window showing
  // this site, which… Each level is the previous one scaled about the centre.
  const windows = [];
  let x = 250;
  let y = 150;
  let w = 1100;
  let h = 700;
  for (let depth = 0; depth < 11; depth += 1) {
    const bar = h * 0.085;
    const stroke = round(Math.max(0.6, 2.4 - depth * 0.22));
    const opacity = round(Math.max(0.18, 0.95 - depth * 0.08));
    const dot = (i) =>
      `<circle cx="${round(x + bar * (0.55 + i * 0.5))}" cy="${round(y + bar / 2)}" r="${round(bar * 0.14)}" fill="${GOLD}" opacity="0.6"/>`;
    const pill = `<rect x="${round(x + w * 0.3)}" y="${round(y + bar * 0.24)}" width="${round(w * 0.4)}" height="${round(bar * 0.52)}" rx="${round(bar * 0.26)}" fill="none" stroke="${GOLD}" stroke-width="${round(stroke * 0.6)}" opacity="0.55"/>`;
    const url =
      depth < 4
        ? `<text x="${round(x + w / 2)}" y="${round(y + bar * 0.62)}" fill="${GOLD}" font-family="ui-monospace, 'SFMono-Regular', Menlo, monospace" font-size="${round(bar * 0.3)}" letter-spacing="${round(bar * 0.03)}" text-anchor="middle">joeylandry.com</text>`
        : '';
    windows.push(`<g opacity="${opacity}">
      <rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="#0A141C" stroke="${GOLD}" stroke-width="${stroke}"/>
      <path d="M${round(x)} ${round(y + bar)}H${round(x + w)}" stroke="${GOLD}" stroke-width="${round(stroke * 0.6)}" opacity="0.5"/>
      ${dot(0)}${dot(1)}${dot(2)}${pill}${url}
    </g>`);

    // The next window sits centred in the content area below the bar.
    const nw = w * 0.8;
    const nh = h * 0.8;
    const contentTop = y + bar;
    x += (w - nw) / 2;
    y = contentTop + (h - bar - nh) / 2;
    w = nw;
    h = nh;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="tunnel" cx="0.5" cy="0.55" r="0.75">
      <stop offset="0" stop-color="#132330"/>
      <stop offset="1" stop-color="${INK}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#tunnel)"/>
  ${grid(80, GOLD, 0.05)}
  ${windows.join('')}
  ${corners(96, 96, W - 192, H - 192, GOLD)}
  ${monoText(150, 940, 'NEXT.JS · TAILWIND · TYPED CONTENT', { size: 17, fill: FOG })}
  ${monoText(W - 150, 940, 'SEE: JOEYLANDRY.COM', { size: 17, fill: GOLD, anchor: 'end' })}
</svg>`;
}

/* ------------------------------------------------------------------- write */

const covers = {
  'nyes-neck.svg': nyesNeck(),
  'arlington-brewing.svg': arlington(),
  'joeylandry-com.svg': recursiveSite(),
};

mkdirSync(OUT, { recursive: true });
for (const [name, svg] of Object.entries(covers)) {
  const minified = svg.replace(/\n\s*/g, ' ').replace(/>\s+</g, '><').trim();
  writeFileSync(join(OUT, name), `${minified}\n`, 'utf8');
  console.log(`wrote ${name} (${(minified.length / 1024).toFixed(1)} kB)`);
}
// INK and PAPER_2 are referenced by gradients above; keep the palette together.
void INK;
