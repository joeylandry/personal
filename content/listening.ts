/**
 * Music. The pinned track is set by hand and changes whenever it changes; the
 * live player and the profile card below it read Spotify (see `lib/spotify.ts`).
 */
export const listening = {
  label: 'On the Sonos',
  title: 'What’s playing?',
  lead: 'Explore the music in my life.',
  pinned: {
    label: 'Currently: Site sound',
    /** How the pinned song is named in running text, e.g. "Back to site sound". */
    name: 'site sound',
    /** The id from an open.spotify.com/track/… link. */
    spotifyId: '5HVcJTb111CdGVwJWPyZcn',
  },
  /** The Spotify username in `profileUrl`, used for the public profile preview. */
  profileId: 'joeylandry7',
  profileUrl: 'https://open.spotify.com/user/joeylandry7',
  profile: {
    label: 'Profile',
    /** Shown when the profile itself can't be read. */
    name: 'Joey Landry',
    /** Joey's Spotify profile photo, used whenever Spotify doesn't send one. */
    avatar: '/images/spotify/avatar.jpg',
    topArtistsLabel: 'Top artists this month',
    blurb: 'Public playlists, mixes and whatever is on repeat this week.',
    cta: 'Browse my Spotify',
  },
} as const;

export function spotifyTrackUrl(id: string): string {
  return `https://open.spotify.com/track/${id}`;
}

export function spotifyTrackUri(id: string): string {
  return `spotify:track:${id}`;
}

export function spotifyEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
}
