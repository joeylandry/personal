/**
 * Image hosts allowed in `next.config.ts`. Anything else (Spotify does move
 * things around) is shown unoptimized rather than failing the render.
 */
const IMAGE_HOSTS =
  /^https:\/\/(i\.scdn\.co|mosaic\.scdn\.co|[a-z0-9-]+\.spotifycdn\.com|platform-lookaside\.fbsbx\.com)\//;

export function canOptimizeImage(url: string): boolean {
  return IMAGE_HOSTS.test(url);
}
