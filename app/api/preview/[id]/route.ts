import { NextResponse } from 'next/server';
import { spotifyMock } from '@/lib/spotify';
import { fetchPreviewUrl, isTrackId } from '@/lib/spotify-preview';

export const runtime = 'nodejs';

/**
 * `{ url }`: the song's 30-second preview MP3, or null when it has none, for
 * the site's record player. Held by the CDN for a day either way.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isTrackId(id)) return NextResponse.json({ url: null }, { status: 400 });
  const url = spotifyMock() ? null : await fetchPreviewUrl(id);
  return NextResponse.json(
    { url },
    {
      headers: {
        'Cache-Control': url
          ? 'public, s-maxage=86400, stale-while-revalidate=604800'
          : 'public, s-maxage=600',
      },
    },
  );
}
