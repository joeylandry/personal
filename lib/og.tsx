import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';

/**
 * Shared social-card artwork.
 *
 * Rendered with Satori, which supports a flexbox subset only — every layout
 * here is explicit flex, and all styles are inline.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

const INK = '#071018';
const PAPER = '#F4F0E8';
const FOG = '#9FB1BD';
const SEA = '#72D6C9';

function font(file: string) {
  return readFileSync(join(process.cwd(), 'assets', 'fonts', file));
}

export function ogFonts() {
  return [
    {
      name: 'Geist',
      data: font('Geist-Regular.ttf'),
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Geist',
      data: font('Geist-Medium.ttf'),
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'Geist Mono',
      data: font('GeistMono-Regular.ttf'),
      weight: 400 as const,
      style: 'normal' as const,
    },
  ];
}

/** The JL monogram, drawn to match the site mark. */
function Mark({ accent }: { accent: string }) {
  return (
    <svg width="72" height="62" viewBox="0 0 44 38" fill="none">
      <path d="M0 30.25h44" stroke={accent} strokeWidth="1" />
      <path d="M17 6v16.5a7 7 0 0 1-14 0" stroke={PAPER} strokeWidth="3.4" strokeLinecap="square" />
      <path d="M27.5 6v24.25H41" stroke={PAPER} strokeWidth="3.4" strokeLinecap="square" />
    </svg>
  );
}

/** Contour rule stack, echoing the coastline motif. */
function Contours({ accent }: { accent: string }) {
  return (
    <svg
      width="1200"
      height="320"
      viewBox="0 0 700 400"
      fill="none"
      style={{ position: 'absolute', bottom: -40, left: 0, opacity: 0.35 }}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <path
          key={index}
          d="M-40 232C60 214 118 236 186 206c58-26 74-74 148-88 78-15 132 30 196 2 62-27 70-84 140-100 44-10 78 2 116 18"
          transform={`translate(0 ${index * 15})`}
          stroke={index % 4 === 0 ? accent : FOG}
          strokeWidth={index % 4 === 0 ? 1.4 : 1}
          opacity={0.55 - index * 0.045}
        />
      ))}
    </svg>
  );
}

export function OgCard({
  eyebrow,
  title,
  meta,
  accent = SEA,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  accent?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: INK,
        color: PAPER,
        fontFamily: 'Geist',
        padding: '64px 72px',
        position: 'relative',
      }}
    >
      {/* Grid field */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          backgroundImage: `linear-gradient(to right, rgba(159,177,189,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(159,177,189,0.10) 1px, transparent 1px)`,
          backgroundSize: '88px 88px',
        }}
      />
      <Contours accent={accent} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Mark accent={accent} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>Joey Landry</div>
          <div
            style={{
              fontFamily: 'Geist Mono',
              fontSize: 15,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: FOG,
              marginTop: 4,
            }}
          >
            {eyebrow}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
        <div
          style={{
            fontSize: title.length > 46 ? 64 : 78,
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid rgba(159,177,189,0.22)`,
          paddingTop: 22,
          fontFamily: 'Geist Mono',
          fontSize: 17,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: FOG,
        }}
      >
        <div style={{ display: 'flex', color: accent }}>{meta}</div>
        <div style={{ display: 'flex' }}>Engineer by day · Builder after hours</div>
      </div>
    </div>
  );
}

export const OG_ACCENTS = {
  sea: SEA,
  amber: '#F3B45B',
  gold: '#E7C36A',
} as const;
