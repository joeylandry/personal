import { NextResponse } from 'next/server';
import { getListening } from '@/lib/spotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * What's on right now, plus the last few plays.
 *
 * Every visitor polls this, so the CDN holds each answer for a few seconds:
 * Spotify sees at most a handful of requests a minute however busy the site
 * is, and "live" still means live to anyone watching the progress bar.
 *
 * With `SPOTIFY_MOCK=1` set (local preview only), `getListening` returns a
 * fixed sample payload instead: a song that is always playing plus a few
 * recent plays, so the player can be designed without Spotify credentials.
 */
export async function GET() {
  const listening = await getListening();
  return NextResponse.json(listening, {
    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' },
  });
}
