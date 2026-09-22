import { featuredProjects, profile, socials, timeline } from '@/content';
import type { Project } from '@/content';
import { absoluteUrl, siteName, siteTitle, siteUrl } from './site';

/**
 * Structured data. Kept in one place so the graph stays consistent across
 * routes and can be asserted in tests.
 */

const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    alternateName: profile.legalName,
    url: siteUrl,
    jobTitle: profile.employerRole,
    description: profile.metaDescription,
    worksFor: { '@type': 'Organization', name: profile.employer },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Tufts University',
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'NH',
      addressCountry: 'US',
    },
    knowsAbout: [
      'Full-stack web development',
      'Next.js',
      'TypeScript',
      'E-commerce architecture',
      'Content modeling',
      'Authentication and session design',
      'AI-assisted software development',
      'Cybersecurity',
    ],
    sameAs: socials.map((social) => social.href),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    url: siteUrl,
    name: siteTitle,
    description: profile.metaDescription,
    inLanguage: 'en-US',
    publisher: { '@id': personId },
  };
}

export function projectSchema(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/work/${project.slug}#project`),
    name: project.name,
    headline: project.tagline,
    description: project.summary,
    url: absoluteUrl(`/work/${project.slug}`),
    ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    creator: { '@id': personId },
    author: { '@id': personId },
    keywords: project.stack.flatMap((group) => group.items).join(', '),
    image: absoluteUrl(project.image.src),
    isPartOf: { '@id': websiteId },
  };
}

export function collectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': absoluteUrl('/work#collection'),
    url: absoluteUrl('/work'),
    name: 'Selected work — Joey Landry',
    isPartOf: { '@id': websiteId },
    about: { '@id': personId },
    hasPart: featuredProjects.map((project) => ({
      '@type': 'CreativeWork',
      name: project.name,
      url: absoluteUrl(`/work/${project.slug}`),
    })),
  };
}

export function profilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/#profile'),
    url: siteUrl,
    name: siteTitle,
    mainEntity: { '@id': personId },
    about: { '@id': personId },
    significantLink: featuredProjects.map((project) => absoluteUrl(`/work/${project.slug}`)),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Education and employment history, for the experience route. */
export function experienceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    url: siteUrl,
    hasOccupation: timeline
      .filter((entry) => entry.kind === 'work')
      .map((entry) => ({
        '@type': 'Occupation',
        name: entry.title,
        occupationLocation: entry.location ? { '@type': 'Place', name: entry.location } : undefined,
        hiringOrganization: { '@type': 'Organization', name: entry.org },
      })),
  };
}

/** Serializes a schema object for a <script type="application/ld+json"> tag. */
export function jsonLdString(schema: object | object[]): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export { siteName };
