/**
 * Music. The About page renders this as a copy of my Spotify profile: the
 * library, the profile header and top artists are a hand-kept snapshot (Spotify
 * only shares them through scopes the live token doesn't ask for), while the
 * now-playing panel and player bar read Spotify live (see `lib/spotify.ts`).
 * Images are in `public/images/spotify/`.
 */
export const listening = {
  label: 'On the speakers',
  title: 'What’s playing.',
  lead: 'My Spotify, more or less as it looks on my laptop — and whatever is actually on right now, live.',
  profileUrl: 'https://open.spotify.com/user/joeylandry7',
  profile: {
    name: 'Joey Landry',
    photo: '/images/spotify/profile.webp',
    stats: ['78 Public Playlists', '19 Followers', '429 Following'],
  },
  topArtists: {
    title: 'Top artists this month',
    note: 'Snapshot from October 2026',
    artists: [
      { name: 'Sammy Rae & The Friends', image: '/images/spotify/sammy-rae.webp' },
      { name: 'Rhye', image: '/images/spotify/rhye.webp' },
      { name: 'Royel Otis', image: '/images/spotify/royel-otis.webp' },
      { name: 'The Growlers', image: '/images/spotify/the-growlers.webp' },
    ],
  },
  /** "Your Library", top to bottom. A null image draws the Liked Songs heart. */
  library: [
    { title: 'Liked Songs', kind: 'Playlist', by: 'Joey Landry', image: null, pinned: true },
    {
      title: '🙏',
      kind: 'Playlist',
      by: 'Joey Landry',
      image: '/images/spotify/prayer.webp',
      pinned: true,
    },
    {
      title: 'The Bible in a Year (with Fr. Mike Schmitz)',
      kind: 'Podcast',
      by: 'Ascension',
      image: '/images/spotify/bible-in-a-year.webp',
      pinned: true,
    },
    {
      title: 'in His Presence',
      kind: 'Playlist',
      by: 'MOB DON',
      image: '/images/spotify/in-his-presence.webp',
      pinned: true,
    },
    { title: 'PAWSA', kind: 'Artist', by: null, image: '/images/spotify/pawsa.webp', pinned: true },
    {
      title: 'autumn vintage jazz',
      kind: 'Playlist',
      by: 'mrsjennaredish',
      image: '/images/spotify/autumn-vintage-jazz.webp',
      pinned: false,
    },
    {
      title: 'House Classics Mix',
      kind: 'Playlist',
      by: 'Made for Joey Landry',
      image: '/images/spotify/house-classics-mix.webp',
      pinned: false,
    },
    {
      title: 'vibecode',
      kind: 'Playlist',
      by: 'Joey Landry',
      image: '/images/spotify/vibecode.webp',
      pinned: false,
    },
  ],
  /**
   * What the player shows when nothing comes back from Spotify live — the
   * song that was on when the snapshot was taken.
   */
  onRepeat: {
    title: 'TAKE ME HIGH',
    artist: 'PAWSA',
    art: '/images/spotify/take-me-high.webp',
    url: 'https://open.spotify.com/search/TAKE%20ME%20HIGH%20PAWSA',
    durationMs: 213_000,
    progressMs: 9_000,
  },
  pinned: {
    label: 'My mind currently',
    /** The id from an open.spotify.com/track/… link. */
    spotifyId: '5HVcJTb111CdGVwJWPyZcn',
  },
} as const;

export function spotifyTrackUrl(id: string): string {
  return `https://open.spotify.com/track/${id}`;
}

export function spotifyEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
}

export function spotifyArtistSearchUrl(name: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(name)}/artists`;
}
