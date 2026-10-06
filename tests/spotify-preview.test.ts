import { describe, expect, it } from 'vitest';
import { isTrackId, parsePreviewUrl } from '@/lib/spotify-preview';

const MP3 = 'https://p.scdn.co/mp3-preview/8b5b0e3a6a9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d';

describe('preview lookup', () => {
  it("reads the track page's og:audio tag", () => {
    const html = `<head><meta property="og:audio" content="${MP3}?cid=abc&amp;x=1"/></head>`;
    expect(parsePreviewUrl(html)).toBe(`${MP3}?cid=abc&x=1`);
  });

  it("reads the embed page's escaped JSON", () => {
    const html = `<script>{"audioPreview":{"url":"${MP3.replaceAll('/', '\\/')}"}}</script>`;
    expect(parsePreviewUrl(html)).toBe(MP3);
    expect(parsePreviewUrl(`{"url":"${MP3}?cid=1\\u0026a=2"}`)).toBe(`${MP3}?cid=1&a=2`);
  });

  it('finds nothing in a page without one', () => {
    expect(parsePreviewUrl('<html><meta property="og:title" content="Song"></html>')).toBeNull();
  });

  it('only looks up real track ids', () => {
    expect(isTrackId('5HVcJTb111CdGVwJWPyZcn')).toBe(true);
    expect(isTrackId('mock-1')).toBe(true);
    expect(isTrackId('../../etc')).toBe(false);
    expect(isTrackId('5HVcJTb111CdGVwJWPyZcn?x')).toBe(false);
  });
});
