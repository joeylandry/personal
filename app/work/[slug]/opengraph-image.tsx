import { ImageResponse } from 'next/og';
import { getProject, projects } from '@/content';
import { OG_ACCENTS, OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from '@/lib/og';

export const alt = 'Case study — Joey Landry';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  return new ImageResponse(
    <OgCard
      eyebrow={project?.kind ?? 'Recent work'}
      title={project?.tagline ?? 'Recent work'}
      meta={project?.name ?? 'Joey Landry'}
      accent={project ? OG_ACCENTS[project.accent] : undefined}
    />,
    { ...size, fonts: ogFonts() },
  );
}
