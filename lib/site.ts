/**
 * Site-wide constants derived from the environment.
 *
 * `NEXT_PUBLIC_SITE_URL` drives canonical URLs, the sitemap, robots, JSON-LD
 * and social images. It falls back to the Vercel deployment URL and then to
 * localhost so preview builds still produce valid absolute URLs.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}

export const siteUrl = resolveSiteUrl();

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, `${siteUrl}/`).toString();
}

export const siteName = 'Joey Landry';
export const siteTitle = 'Joey Landry — Software Engineer & Builder';

/**
 * Optional public contact address. When unset the UI falls back to LinkedIn
 * rather than rendering a dead mail button.
 */
export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;

export const navLinks = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' },
] as const;

/**
 * Build timestamp, rendered as a small mono detail. Evaluated once per build so
 * pages stay static.
 */
export const buildStamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
