/**
 * Music. The pinned track is set by hand and changes whenever it changes; the
 * live player beside it reads Spotify (see `lib/spotify.ts`).
 */
export const listening = {
  label: 'On the speakers',
  title: 'What’s playing.',
  lead: 'One song I can’t shake, and whatever is actually on right now — live from my Spotify.',
  pinned: {
    label: 'My mind currently',
    /** The id from an open.spotify.com/track/… link. */
    spotifyId: '5HVcJTb111CdGVwJWPyZcn',
  },
  profileUrl: 'https://open.spotify.com/user/joeylandry7',
} as const;

export function spotifyTrackUrl(id: string): string {
  return `https://open.spotify.com/track/${id}`;
}

export function spotifyEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
}
