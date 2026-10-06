/**
 * A song's 30-second preview, as a plain MP3 the site can play itself.
 *
 * The Web API stopped returning `preview_url`, but the public track page
 * still names the preview in its `og:audio` tag, and the embed page carries
 * it in its data. Playing that file through the site's own `<audio>` element
 * (see `lib/record-audio.ts`) is what lets a tap on a phone make sound: iOS
 * only lets a page start audio from a tap in that same page, and a command
 * passed into Spotify's cross-origin embed doesn't count.
 */

const PREVIEW = /https:\/\/p\.scdn\.co\/mp3-preview\/[A-Za-z0-9]+(?:\?[^"'\s<>\\]*)?/;

/** Spotify track ids are 22 base-62 characters; the mock data uses `mock-…`. */
export function isTrackId(id: string): boolean {
  return /^[A-Za-z0-9]{22}$/.test(id) || /^mock-[a-z0-9-]{1,20}$/.test(id);
}

/** The first preview MP3 named in a Spotify page's HTML, or null. */
export function parsePreviewUrl(html: string): string | null {
  const decoded = html
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&');
  return decoded.match(PREVIEW)?.[0] ?? null;
}

const PAGES = (id: string) => [
  `https://open.spotify.com/track/${id}`,
  `https://open.spotify.com/embed/track/${id}`,
];

/** Looks the preview up; null when the song has none (or Spotify didn't answer). */
export async function fetchPreviewUrl(id: string): Promise<string | null> {
  for (const page of PAGES(id)) {
    try {
      const response = await fetch(page, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; joeylandry.org preview lookup)' },
        next: { revalidate: 86_400 },
      });
      if (!response.ok) continue;
      const url = parsePreviewUrl(await response.text());
      if (url) return url;
    } catch {
      // Try the next page.
    }
  }
  return null;
}
