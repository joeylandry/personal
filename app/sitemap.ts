import type { MetadataRoute } from 'next';
import { projects, publishedNotes } from '@/content';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...['/work', '/about', '/giving', '/blog', '/contact'].map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/work/${project.slug}`),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...publishedNotes
      .filter((note) => !note.draft)
      .map((note) => ({
        url: absoluteUrl(`/blog/${note.slug}`),
        lastModified: new Date(`${note.date}T12:00:00Z`),
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      })),
  ];
}
