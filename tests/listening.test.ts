import { describe, expect, it } from 'vitest';
import { notes } from '@/content';
import { formatDate, formatDuration, timeAgo } from '@/lib/format';
import { toNowPlaying, toRecent } from '@/lib/spotify';

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
