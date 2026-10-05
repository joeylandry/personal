import { unstable_cache } from 'next/cache';
import { fetchProfile, fetchTrackPreview, spotifyMock } from './spotify';
import type { SpotifyProfile, TrackPreview } from './spotify';
import { mockProfile, mockTrackPreview } from './spotify-mock';

/**
 * Cached server reads for the About page's music section.
 *
 * `unstable_cache` rather than per-`fetch` caching because the Web API calls
 * sit behind a token refresh that must never be cached itself; wrapping the
 * whole read keeps the page static (re-rendered at most once per window)
 * instead of making every visit hit Spotify. The readers throw on failure, so
 * a miss is never stored: the fallback below is served and the next render
 * tries again.
 */

const cachedTrackPreview = unstable_cache(fetchTrackPreview, ['spotify-track-preview'], {
  revalidate: 86_400,
});

const cachedProfile = unstable_cache(fetchProfile, ['spotify-profile'], { revalidate: 3_600 });

/** The pinned song's label, or null to show a neutral one. */
export async function getTrackPreview(id: string): Promise<TrackPreview | null> {
  if (spotifyMock()) return mockTrackPreview;
  try {
    return await cachedTrackPreview(id);
  } catch {
    return null;
  }
}

/** The public profile preview, or null for the static card. */
export async function getSpotifyProfile(userId: string): Promise<SpotifyProfile | null> {
  if (spotifyMock()) return mockProfile;
  try {
    return await cachedProfile(userId);
  } catch {
    return null;
  }
}
