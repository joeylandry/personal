/**
 * Live listening, read from Spotify on the server.
 *
 * Spotify only exposes "currently playing" and "recently played" for the
 * account that authorised the app, so this runs on a long-lived refresh token
 * minted once with `npm run spotify:token`. With any of the three variables
 * unset, every call resolves to "not configured" and the UI quietly falls back
 * to the pinned track; it never renders a broken player.
 *
 * Set `SPOTIFY_MOCK=1` to preview everything locally with fixed sample data
 * (see `lib/spotify-mock.ts`); no credentials or network needed.
 */

import { mockListening } from './spotify-mock';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API = 'https://api.spotify.com/v1';
const OEMBED = 'https://open.spotify.com/oembed';

/** True when `SPOTIFY_MOCK=1`: every reader returns sample data instead of calling Spotify. */
export function spotifyMock(): boolean {
  return process.env.SPOTIFY_MOCK?.trim() === '1';
}

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

/** Enough of one song to label a record: from the Web API when configured, else oEmbed. */
export interface TrackPreview {
  title: string;
  /** Null when only oEmbed answered, which doesn't name the artist. */
  artist: string | null;
  art: string | null;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string | null;
  url: string;
  /** Null when Spotify leaves the count out. */
  tracks: number | null;
}

export interface SpotifyProfile {
  name: string;
  avatar: string | null;
  url: string;
  followers: number | null;
  playlists: Playlist[];
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

/** Parses `/v1/tracks/{id}` into a record label. */
export function toTrackPreview(raw: unknown): TrackPreview | null {
  const data = raw as Partial<SpotifyTrack> | null;
  if (!data?.name || !data.artists || !data.album?.images || !data.external_urls?.spotify) {
    return null;
  }
  const track = toTrack(data as SpotifyTrack);
  return { title: track.title, artist: track.artist || null, art: track.art, url: track.url };
}

/**
 * Parses Spotify's oEmbed answer for a track. It carries the song title and
 * cover but not the artist, so `artist` stays null.
 */
export function parseOEmbed(raw: unknown, url: string): TrackPreview | null {
  const data = raw as { title?: unknown; thumbnail_url?: unknown } | null;
  const title = typeof data?.title === 'string' ? data.title.trim() : '';
  if (!title) return null;
  const art =
    typeof data?.thumbnail_url === 'string' && data.thumbnail_url.startsWith('https://')
      ? data.thumbnail_url
      : null;
  return { title, artist: null, art, url };
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  public?: boolean | null;
  images?: SpotifyImage[] | null;
  owner?: { id?: string } | null;
  external_urls?: { spotify?: string };
  /** `tracks` until early 2026, `items` after; read whichever is there. */
  tracks?: { total?: number } | null;
  items?: { total?: number } | null;
}

/**
 * Parses `/v1/users/{id}/playlists`: public playlists the user owns, in
 * Spotify's order, skipping empty ones (they have no cover worth showing).
 */
export function toPlaylists(raw: unknown, ownerId: string, limit = 6): Playlist[] {
  const items = (raw as { items?: (SpotifyPlaylist | null)[] } | null)?.items ?? [];
  const playlists: Playlist[] = [];
  for (const item of items) {
    if (!item?.id || !item.name) continue;
    if (item.public === false) continue;
    if (item.owner?.id && item.owner.id !== ownerId) continue;
    const tracks = item.tracks?.total ?? item.items?.total ?? null;
    if (tracks === 0) continue;
    playlists.push({
      id: item.id,
      name: item.name,
      cover: pickArt(item.images ?? []),
      url: item.external_urls?.spotify ?? `https://open.spotify.com/playlist/${item.id}`,
      tracks,
    });
    if (playlists.length === limit) break;
  }
  return playlists;
}

/** Parses `/v1/users/{id}` plus its playlists into the profile card. */
export function toProfile(
  rawUser: unknown,
  rawPlaylists: unknown,
  userId: string,
): SpotifyProfile | null {
  const user = rawUser as {
    id?: string;
    display_name?: string | null;
    images?: SpotifyImage[] | null;
    followers?: { total?: number | null } | null;
    external_urls?: { spotify?: string };
  } | null;
  if (!user?.id) return null;
  return {
    name: user.display_name?.trim() || user.id,
    avatar: pickArt(user.images ?? []),
    url: user.external_urls?.spotify ?? `https://open.spotify.com/user/${user.id}`,
    followers: typeof user.followers?.total === 'number' ? user.followers.total : null,
    playlists: toPlaylists(rawPlaylists, userId),
  };
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

/**
 * The pinned song's title, artist and art. Tries the Web API (which names the
 * artist) when configured, then oEmbed (no credentials). Throws when neither
 * answers, so a caching caller doesn't keep a miss for a day; the caller
 * supplies the neutral fallback.
 */
export async function fetchTrackPreview(id: string): Promise<TrackPreview> {
  const url = `https://open.spotify.com/track/${id}`;
  const token = await accessToken().catch(() => null);
  if (token) {
    const preview = toTrackPreview(await get(`/tracks/${id}`, token).catch(() => null));
    if (preview) return preview;
  }
  const response = await fetch(`${OEMBED}?url=${encodeURIComponent(url)}`, {
    next: { revalidate: 86_400 },
  });
  if (!response.ok) throw new Error(`Spotify oEmbed answered ${response.status}`);
  const preview = parseOEmbed(await response.json(), url);
  if (!preview) throw new Error('Spotify oEmbed had no title');
  return preview;
}

/**
 * A public profile and its public playlists. Null when Spotify isn't
 * configured; throws when it is but doesn't answer, for the same reason as above.
 */
export async function fetchProfile(userId: string): Promise<SpotifyProfile | null> {
  const token = await accessToken().catch(() => null);
  if (!token) {
    if (credentials()) throw new Error('Spotify token refresh failed');
    return null;
  }
  const id = encodeURIComponent(userId);
  const [user, playlists] = await Promise.all([
    get(`/users/${id}`, token),
    get(`/users/${id}/playlists?limit=20`, token).catch(() => null),
  ]);
  const profile = toProfile(user, playlists, userId);
  if (!profile) throw new Error('Spotify profile unavailable');
  return profile;
}

export async function getListening(recentLimit = 6): Promise<Listening> {
  if (spotifyMock()) return mockListening(Date.now());
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
