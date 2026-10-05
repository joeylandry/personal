/**
 * Live listening, read from Spotify on the server.
 *
 * Spotify only exposes "currently playing" and "recently played" for the
 * account that authorised the app, so this runs on a long-lived refresh token
 * minted once with `npm run spotify:token`. With any of the three variables
 * unset, every call resolves to "not configured" and the UI quietly falls back
 * to the pinned track — it never renders a broken player.
 */

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API = 'https://api.spotify.com/v1';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Album art, ~300px. Null for local files and some podcasts. */
  art: string | null;
  url: string;
  durationMs: number;
}

export interface NowPlaying {
  track: Track;
  isPlaying: boolean;
  progressMs: number;
}

export interface RecentPlay {
  track: Track;
  playedAt: string;
}

export interface Listening {
  configured: boolean;
  nowPlaying: NowPlaying | null;
  recent: RecentPlay[];
}

function credentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

/** Access tokens last an hour; reuse one per server instance until it is close to expiry. */
let cached: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  const creds = credentials();
  if (!creds) return null;
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: creds.refreshToken }),
  });
  if (!response.ok) return null;

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

/* Only the fields we read from Spotify's payloads. */
interface SpotifyImage {
  url: string;
  width: number | null;
}
interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: SpotifyImage[] };
  external_urls: { spotify: string };
}

/** Picks the image closest to 300px, which is plenty for a 2x thumbnail. */
function pickArt(images: SpotifyImage[]): string | null {
  if (images.length === 0) return null;
  const sorted = [...images].sort(
    (a, b) => Math.abs((a.width ?? 300) - 300) - Math.abs((b.width ?? 300) - 300),
  );
  return sorted[0]?.url ?? null;
}

export function toTrack(raw: SpotifyTrack): Track {
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists.map((artist) => artist.name).join(', '),
    album: raw.album.name,
    art: pickArt(raw.album.images),
    url: raw.external_urls.spotify,
    durationMs: raw.duration_ms,
  };
}

/** Parses `/me/player/currently-playing`. Ads, podcasts and an idle player read as nothing. */
export function toNowPlaying(raw: unknown): NowPlaying | null {
  const data = raw as {
    is_playing?: boolean;
    progress_ms?: number | null;
    currently_playing_type?: string;
    item?: SpotifyTrack | null;
  } | null;
  if (!data?.item || data.currently_playing_type !== 'track') return null;
  return {
    track: toTrack(data.item),
    isPlaying: Boolean(data.is_playing),
    progressMs: data.progress_ms ?? 0,
  };
}

/** Parses `/me/player/recently-played`, dropping back-to-back repeats of the same song. */
export function toRecent(raw: unknown): RecentPlay[] {
  const items = (raw as { items?: { track: SpotifyTrack; played_at: string }[] })?.items ?? [];
  const plays: RecentPlay[] = [];
  for (const item of items) {
    if (plays.at(-1)?.track.id === item.track.id) continue;
    plays.push({ track: toTrack(item.track), playedAt: item.played_at });
  }
  return plays;
}

async function get(path: string, token: string): Promise<unknown | null> {
  const response = await fetch(`${API}${path}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  // 204: nothing is playing.
  if (response.status === 204 || !response.ok) return null;
  return response.json();
}

export async function getListening(recentLimit = 6): Promise<Listening> {
  const token = await accessToken().catch(() => null);
  if (!token) return { configured: credentials() !== null, nowPlaying: null, recent: [] };

  const [current, recent] = await Promise.all([
    get('/me/player/currently-playing', token).catch(() => null),
    // Ask for extra so de-duplicating repeats still fills the list.
    get(`/me/player/recently-played?limit=${recentLimit * 2}`, token).catch(() => null),
  ]);

  return {
    configured: true,
    nowPlaying: toNowPlaying(current),
    recent: toRecent(recent).slice(0, recentLimit),
  };
}
