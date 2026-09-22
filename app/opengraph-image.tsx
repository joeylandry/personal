import { ImageResponse } from 'next/og';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';

export const alt = 'Joey Landry — Software Engineer & Builder';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Software Engineer & Independent Builder"
      title="I build things that work, feel alive, and mean something."
      meta="github.com/joeylandry"
    />,
    { ...size, fonts: ogFonts() },
  );
}
