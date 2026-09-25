import { ImageResponse } from 'next/og';
import { featuredProjects } from '@/content';
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';

export const alt = 'Recent work — Joey Landry';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Recent work"
      title="Three products, all in production."
      meta={featuredProjects.map((project) => project.shortName).join(' · ')}
    />,
    { ...size, fonts: ogFonts() },
  );
}
