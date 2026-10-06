/**
 * Sample data for previewing the music section without Spotify.
 *
 * Run `SPOTIFY_MOCK=1 npm run dev` and every Spotify reader (the live player's
 * `/api/now-playing`, the pinned record's label and the profile card) answers
 * with these fixed, made-up tracks instead of calling Spotify. The cover art is
 * inline SVG, so the preview works offline too. Never set it in production.
 */
import type { Artist, Listening, SpotifyProfile, Track, TrackPreview } from './spotify';

/** A made-up album cover: a soft two-tone gradient with a sun or a horizon. */
function cover(from: string, to: string, motif: 'sun' | 'waves' | 'rings' | 'grid'): string {
  const shapes = {
    sun: `<circle cx="150" cy="128" r="58" fill="${to}" opacity=".9"/><rect y="186" width="300" height="114" fill="#000" opacity=".22"/>`,
    waves: `<path d="M0 190q37-24 75 0t75 0 75 0 75 0v110H0z" fill="#fff" opacity=".16"/><path d="M0 222q37-24 75 0t75 0 75 0 75 0v78H0z" fill="#fff" opacity=".2"/>`,
    rings: `<g fill="none" stroke="#fff" opacity=".28"><circle cx="150" cy="150" r="40"/><circle cx="150" cy="150" r="75"/><circle cx="150" cy="150" r="110"/></g>`,
    grid: `<g stroke="#fff" opacity=".14"><path d="M0 60h300M0 120h300M0 180h300M0 240h300M60 0v300M120 0v300M180 0v300M240 0v300"/></g><rect x="90" y="90" width="120" height="120" rx="8" fill="${to}" opacity=".85"/>`,
  }[motif];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapes}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function track(
  id: string,
  title: string,
  artist: string,
  album: string,
  art: string,
  durationMs: number,
): Track {
  return { id, title, artist, album, art, url: 'https://open.spotify.com', durationMs };
}

const NOW = track(
  'mock-now',
  'Harbor Lights',
  'The Low Tides',
  'Slack Water',
  cover('#1b1f4b', '#f08a7e', 'sun'),
  214_000,
);

const RECENT: Track[] = [
  track(
    'mock-1',
    'Northbound After Midnight',
    'Coastal Radio',
    'Night Ferry',
    cover('#1b1f4b', '#72d6c9', 'waves'),
    198_000,
  ),
  track(
    'mock-2',
    'Paper Moons',
    'June Avenue',
    'Paper Moons',
    cover('#5b2a48', '#f08a7e', 'rings'),
    241_000,
  ),
  track(
    'mock-3',
    'Everything at Once, Slowly',
    'Hollis & the Weather',
    'Low Pressure',
    cover('#233329', '#a6d785', 'grid'),
    187_000,
  ),
  track(
    'mock-4',
    'Static Bloom',
    'Marisol Vega',
    'Static Bloom',
    cover('#3a2a12', '#e7c36a', 'sun'),
    226_000,
  ),
  track(
    'mock-5',
    'Long Exposure',
    'The Low Tides',
    'Slack Water',
    cover('#0b2235', '#5aa9e6', 'waves'),
    205_000,
  ),
];

/**
 * A song that is always playing, its progress derived from the clock so the
 * bar moves and the "song ended, ask again" path gets exercised every few
 * minutes. History timestamps are relative to `now`.
 */
export function mockListening(now: number): Listening {
  const minutesAgo = [4, 9, 17, 46, 131];
  return {
    configured: true,
    nowPlaying: { track: NOW, isPlaying: true, progressMs: now % NOW.durationMs },
    recent: RECENT.map((item, index) => ({
      track: item,
      playedAt: new Date(now - minutesAgo[index]! * 60_000).toISOString(),
    })),
  };
}

export const mockTrackPreview: TrackPreview = {
  title: 'Sample Song',
  artist: 'Sample Artist',
  art: cover('#2b1d4e', '#72d6c9', 'rings'),
  url: 'https://open.spotify.com',
};

export const mockProfile: SpotifyProfile = {
  name: 'Joey Landry',
  avatar: null,
  url: 'https://open.spotify.com/user/joeylandry7',
  followers: 128,
  playlists: [
    ['Deep Work', '#10242f', '#72d6c9', 'grid', 64],
    ['Cape Drives', '#0f4c5c', '#f3b45b', 'sun', 41],
    ['Late Commits', '#1b1f4b', '#9b8cff', 'rings', 88],
    ['Sunday Coffee', '#3a2a12', '#e7c36a', 'waves', 27],
    ['Gym, Reluctantly', '#4a1020', '#ff7a59', 'grid', 52],
    ['On Repeat', '#233329', '#a6d785', 'rings', 30],
  ].map(([name, from, to, motif, tracks], index) => ({
    id: `mock-playlist-${index}`,
    name: name as string,
    cover: cover(from as string, to as string, motif as 'sun'),
    url: 'https://open.spotify.com/user/joeylandry7',
    tracks: tracks as number,
  })),
};

export const mockTopArtists: Artist[] = [
  ['The Low Tides', '#1b1f4b', '#f08a7e', 'sun'],
  ['Coastal Radio', '#0f4c5c', '#72d6c9', 'waves'],
  ['June Avenue', '#5b2a48', '#f08a7e', 'rings'],
  ['Marisol Vega', '#3a2a12', '#e7c36a', 'sun'],
  ['Hollis & the Weather', '#233329', '#a6d785', 'grid'],
  ['Night Ferry', '#10242f', '#9b8cff', 'rings'],
].map(([name, from, to, motif], index) => ({
  id: `mock-artist-${index}`,
  name: name as string,
  image: cover(from as string, to as string, motif as 'sun'),
  url: 'https://open.spotify.com',
}));
