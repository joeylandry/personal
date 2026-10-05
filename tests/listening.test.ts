import { describe, expect, it } from 'vitest';
import { notes } from '@/content';
import { formatDate, formatDuration, timeAgo } from '@/lib/format';
import {
  parseOEmbed,
  toNowPlaying,
  toPlaylists,
  toProfile,
  toRecent,
  toTrackPreview,
} from '@/lib/spotify';
import { canOptimizeImage } from '@/lib/spotify-images';
import { mockListening, mockProfile } from '@/lib/spotify-mock';

const track = (id: string, name = `Song ${id}`) => ({
  id,
  name,
  duration_ms: 200_000,
  artists: [{ name: 'A' }, { name: 'B' }],
  album: {
    name: 'Album',
    images: [
      { url: 'big', width: 640 },
      { url: 'mid', width: 300 },
      { url: 'small', width: 64 },
    ],
  },
  external_urls: { spotify: `https://open.spotify.com/track/${id}` },
});

describe('spotify parsing', () => {
  it('reads a playing track', () => {
    const now = toNowPlaying({
      is_playing: true,
      progress_ms: 42_000,
      currently_playing_type: 'track',
      item: track('x'),
    });
    expect(now).toEqual({
      isPlaying: true,
      progressMs: 42_000,
      track: expect.objectContaining({ id: 'x', artist: 'A, B', art: 'mid' }),
    });
  });

  it('treats an idle player, ads and podcasts as nothing playing', () => {
    expect(toNowPlaying(null)).toBeNull();
    expect(toNowPlaying({ currently_playing_type: 'ad', item: null })).toBeNull();
    expect(toNowPlaying({ currently_playing_type: 'episode', item: track('p') })).toBeNull();
  });

  it('collapses back-to-back repeats in recent plays', () => {
    const recent = toRecent({
      items: [
        { track: track('a'), played_at: '2026-10-05T12:03:00Z' },
        { track: track('a'), played_at: '2026-10-05T12:00:00Z' },
        { track: track('b'), played_at: '2026-10-05T11:56:00Z' },
        { track: track('a'), played_at: '2026-10-05T11:52:00Z' },
      ],
    });
    expect(recent.map((play) => play.track.id)).toEqual(['a', 'b', 'a']);
    expect(toRecent(null)).toEqual([]);
  });
});

describe('pinned track label', () => {
  const url = 'https://open.spotify.com/track/x';

  it('reads title and art from oEmbed, which has no artist', () => {
    expect(
      parseOEmbed(
        { title: ' My Song ', thumbnail_url: 'https://image-cdn-ak.spotifycdn.com/image/abc' },
        url,
      ),
    ).toEqual({
      title: 'My Song',
      artist: null,
      art: 'https://image-cdn-ak.spotifycdn.com/image/abc',
      url,
    });
  });

  it('rejects an oEmbed answer without a title, and drops non-https art', () => {
    expect(parseOEmbed(null, url)).toBeNull();
    expect(parseOEmbed({ title: '' }, url)).toBeNull();
    expect(parseOEmbed({ title: 'T', thumbnail_url: 'http://x' }, url)?.art).toBeNull();
  });

  it('reads the full label from the Web API track', () => {
    expect(toTrackPreview(track('x'))).toEqual({
      title: 'Song x',
      artist: 'A, B',
      art: 'mid',
      url: 'https://open.spotify.com/track/x',
    });
    expect(toTrackPreview({ error: { status: 404 } })).toBeNull();
    expect(toTrackPreview(null)).toBeNull();
  });
});

describe('spotify profile', () => {
  const playlist = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    name: `List ${id}`,
    public: true,
    owner: { id: 'me' },
    images: [{ url: `cover-${id}`, width: 300 }],
    external_urls: { spotify: `https://open.spotify.com/playlist/${id}` },
    tracks: { total: 12 },
    ...extra,
  });

  it('keeps public, non-empty playlists the user owns, up to the limit', () => {
    const lists = toPlaylists(
      {
        items: [
          playlist('a'),
          playlist('private', { public: false }),
          playlist('followed', { owner: { id: 'someone-else' } }),
          playlist('empty', { tracks: { total: 0 } }),
          null,
          playlist('renamed', { tracks: undefined, items: { total: 7 }, images: [] }),
          playlist('c'),
        ],
      },
      'me',
      2,
    );
    expect(lists).toEqual([
      {
        id: 'a',
        name: 'List a',
        cover: 'cover-a',
        url: 'https://open.spotify.com/playlist/a',
        tracks: 12,
      },
      {
        id: 'renamed',
        name: 'List renamed',
        cover: null,
        url: 'https://open.spotify.com/playlist/renamed',
        tracks: 7,
      },
    ]);
    expect(toPlaylists(null, 'me')).toEqual([]);
  });

  it('reads the user, falling back to the id for a missing name', () => {
    const profile = toProfile(
      {
        id: 'me',
        display_name: 'Joey',
        images: [
          { url: 'small', width: 64 },
          { url: 'large', width: 300 },
        ],
        followers: { total: 42 },
        external_urls: { spotify: 'https://open.spotify.com/user/me' },
      },
      { items: [playlist('a')] },
      'me',
    );
    expect(profile).toMatchObject({
      name: 'Joey',
      avatar: 'large',
      followers: 42,
      url: 'https://open.spotify.com/user/me',
    });
    expect(profile?.playlists).toHaveLength(1);

    expect(toProfile({ id: 'me', display_name: null }, null, 'me')).toEqual({
      name: 'me',
      avatar: null,
      url: 'https://open.spotify.com/user/me',
      followers: null,
      playlists: [],
    });
    expect(toProfile(null, null, 'me')).toBeNull();
  });

  it('only optimizes images from configured hosts', () => {
    expect(canOptimizeImage('https://i.scdn.co/image/abc')).toBe(true);
    expect(canOptimizeImage('https://image-cdn-fa.spotifycdn.com/image/abc')).toBe(true);
    expect(canOptimizeImage('https://example.com/i.scdn.co/abc')).toBe(false);
    expect(canOptimizeImage('data:image/svg+xml,abc')).toBe(false);
  });
});

describe('mock data', () => {
  it('always has a song playing within its length, and some history', () => {
    const now = Date.parse('2026-10-05T12:00:00Z');
    const mock = mockListening(now);
    expect(mock.configured).toBe(true);
    expect(mock.nowPlaying?.isPlaying).toBe(true);
    expect(mock.nowPlaying!.progressMs).toBeLessThan(mock.nowPlaying!.track.durationMs);
    expect(mock.recent.length).toBeGreaterThan(0);
    expect(mockProfile.playlists.length).toBe(6);
  });
});

describe('format', () => {
  it('formats durations and relative times', () => {
    expect(formatDuration(213_000)).toBe('3:33');
    expect(formatDuration(5_000)).toBe('0:05');
    const now = Date.parse('2026-10-05T12:00:00Z');
    expect(timeAgo('2026-10-05T11:59:40Z', now)).toBe('just now');
    expect(timeAgo('2026-10-05T11:48:00Z', now)).toBe('12m ago');
    expect(timeAgo('2026-10-05T09:00:00Z', now)).toBe('3h ago');
    expect(timeAgo('2026-10-03T12:00:00Z', now)).toBe('2d ago');
  });

  it('formats note dates without shifting a day', () => {
    expect(formatDate('2026-10-05')).toBe('October 5, 2026');
  });
});

describe('notes', () => {
  it('have unique url-safe slugs, real dates and https sources', () => {
    const slugs = notes.map((note) => note.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const note of notes) {
      expect(note.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(note.date))).toBe(false);
      expect(note.body.length).toBeGreaterThan(0);
      for (const source of note.sources ?? []) {
        expect(new URL(source.href).protocol).toBe('https:');
      }
    }
  });
});
