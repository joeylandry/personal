import Image from 'next/image';
import { canOptimizeImage } from '@/lib/spotify-images';
import type { Artist, SpotifyProfile } from '@/lib/spotify';
import { OutboundArrow } from './external-link';

/* Spotify's own palette, so the card reads as a little piece of the app. */
const SPOTIFY_GREEN = '#1ed760';

function plural(count: number, word: string): string {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`;
}

/** The Spotify mark, drawn rather than imported. Decorative. */
function SpotifyMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="12" fill={SPOTIFY_GREEN} />
      <path
        d="M6.2 9.4c3.7-1.1 8.4-.8 11.6 1.1M6.8 12.6c3.1-.9 6.9-.6 9.6 1M7.4 15.6c2.5-.7 5.4-.5 7.6.8"
        fill="none"
        stroke="#000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Thumb({
  src,
  sizes,
  className,
}: {
  src: string | null;
  sizes: string;
  className: string;
}) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-white/10 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          unoptimized={!canOptimizeImage(src)}
          className="object-cover"
        />
      ) : null}
    </span>
  );
}

/**
 * A small piece of the Spotify app: the profile header (photo, name,
 * followers), the top three artists this month, and a few public playlists as
 * rows, with Spotify's black, white and green. With `profile` null (Spotify
 * not configured or not answering) it keeps the header, wearing Joey's own
 * photo, and the link out.
 */
export function SpotifyProfileCard({
  profile,
  url,
  username,
  fallbackName,
  fallbackAvatar,
  topArtists = [],
  topArtistsLabel,
  label,
  blurb,
  cta,
}: {
  profile: SpotifyProfile | null;
  url: string;
  /** Shown, with `fallbackName`, when the profile itself couldn't be read. */
  username: string;
  fallbackName: string;
  /** Used whenever Spotify doesn't send a profile photo. */
  fallbackAvatar: string;
  /** Empty leaves the row out, e.g. before the token has `user-top-read`. */
  topArtists?: Artist[];
  topArtistsLabel: string;
  label: string;
  blurb: string;
  cta: string;
}) {
  const name = profile?.name ?? fallbackName;
  const avatar = profile?.avatar ?? fallbackAvatar;
  const href = profile?.url ?? url;
  const playlists = profile?.playlists.slice(0, 3) ?? [];
  const artists = topArtists.slice(0, 3);
  const stats = profile
    ? [
        profile.followers !== null ? plural(profile.followers, 'follower') : null,
        profile.playlists.length > 0 ? plural(profile.playlists.length, 'playlist') : null,
      ].filter(Boolean)
    : [`@${username}`];
  const hasLists = artists.length > 0 || playlists.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#121212] text-white shadow-[0_24px_60px_-28px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
      <div className="bg-[linear-gradient(180deg,rgb(160_72_112/0.55),rgb(18_18_18/0)_85%)]">
        <div className="grid gap-x-10 gap-y-8 p-5 sm:p-7 lg:grid-cols-2">
          {/* Left: who, then their top artists. */}
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <Thumb
                  src={avatar}
                  sizes="112px"
                  className="size-20 rounded-full shadow-[0_8px_24px_rgb(0_0_0/0.5)] sm:size-28"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/80">{label}</p>
                  <p className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-4xl">
                    {name}
                  </p>
                  <p className="mt-1.5 text-sm text-white/70">
                    {stats.length > 0 ? stats.join(' • ') : blurb}
                  </p>
                </div>
              </div>
              <SpotifyMark className="size-6 shrink-0 sm:size-7" />
            </div>

            {artists.length > 0 ? (
              <div className="mt-7">
                <p className="text-base font-bold tracking-tight">{topArtistsLabel}</p>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {artists.map((artist) => (
                    <li key={artist.id}>
                      <a
                        href={artist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md p-2 transition-colors duration-200 hover:bg-white/10 focus-visible:bg-white/10"
                      >
                        <Thumb
                          src={artist.image}
                          sizes="96px"
                          className="mx-auto aspect-square w-full max-w-24 rounded-full shadow-[0_8px_24px_rgb(0_0_0/0.5)]"
                        />
                        <span className="mt-2 block truncate text-sm font-semibold">
                          {artist.name}
                        </span>
                        <span className="block text-xs text-white/60">Artist</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Right: playlists as app-style rows, then the way in. */}
          <div className="flex min-w-0 flex-col">
            {playlists.length > 0 ? (
              <>
                <p className="text-base font-bold tracking-tight lg:mt-1">Playlists</p>
                <ul className="mt-2">
                  {playlists.map((playlist) => (
                    <li key={playlist.id}>
                      <a
                        href={playlist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="-mx-2 flex items-center gap-3 rounded-md p-2 transition-colors duration-200 hover:bg-white/10 focus-visible:bg-white/10"
                      >
                        <Thumb src={playlist.cover} sizes="56px" className="size-14 rounded" />
                        <span className="min-w-0">
                          <span className="block truncate text-base font-medium">
                            {playlist.name}
                          </span>
                          <span className="block truncate text-sm text-white/60">
                            {playlist.tracks !== null
                              ? `${plural(playlist.tracks, 'song')} • `
                              : ''}
                            {name}
                          </span>
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : hasLists ? null : (
              <p className="max-w-[40ch] text-sm text-white/70 lg:mt-1">{blurb}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-6">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-6 py-3 text-sm font-bold text-black transition-[transform,background-color] duration-200 hover:scale-[1.04] hover:bg-[#3be477] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {cta}
                <OutboundArrow />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              {playlists.length > 0 ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full px-5 py-3 text-sm font-bold text-white ring-1 ring-white/40 transition-[box-shadow,transform] duration-200 hover:scale-[1.04] hover:ring-white"
                >
                  See all playlists
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
