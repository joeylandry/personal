import Image from 'next/image';
import { canOptimizeImage } from '@/lib/spotify-images';
import type { SpotifyProfile } from '@/lib/spotify';
import { OutboundArrow } from './external-link';

function plural(count: number, word: string): string {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`;
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--color-sea),var(--color-amber))] shadow-[0_8px_24px_-8px_rgb(0_0_0/0.6)] ring-1 ring-white/15 sm:size-20">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="80px"
          unoptimized={!canOptimizeImage(src)}
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-xl font-semibold text-ink sm:text-2xl"
        >
          {name
            .split(/\s+/)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
    </div>
  );
}

/**
 * A preview of the public Spotify profile: who, how many followers, and the
 * newest public playlists, each linking out. With `profile` null (Spotify not
 * configured or not answering) it is a plain card with the same link.
 */
export function SpotifyProfileCard({
  profile,
  url,
  username,
  fallbackName,
  label,
  blurb,
  cta,
}: {
  profile: SpotifyProfile | null;
  url: string;
  /** Shown, with `fallbackName`, when the profile itself couldn't be read. */
  username: string;
  fallbackName: string;
  label: string;
  blurb: string;
  cta: string;
}) {
  const name = profile?.name ?? fallbackName;
  const stats = profile
    ? [
        profile.followers !== null ? plural(profile.followers, 'follower') : null,
        profile.playlists.length > 0 ? plural(profile.playlists.length, 'public playlist') : null,
      ].filter(Boolean)
    : [`@${username}`];

  return (
    <div className="glass-card glass-card-quiet rounded-[24px] sm:rounded-[32px]">
      <div className="relative p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar src={profile?.avatar ?? null} name={name} />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">{label}</p>
              <p className="mt-1 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {name}
              </p>
              <p className="mt-0.5 text-sm text-white/55">
                {stats.length > 0 ? stats.join(' · ') : blurb}
              </p>
            </div>
          </div>
          <a
            href={profile?.url ?? url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-cta self-start sm:self-auto"
          >
            {cta}
            <OutboundArrow />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>

        {profile && profile.playlists.length > 0 ? (
          <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 lg:mt-10 lg:grid-cols-6">
            {profile.playlists.map((playlist) => (
              <li key={playlist.id}>
                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl outline-offset-4"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 shadow-[0_14px_30px_-14px_rgb(0_0_0/0.7)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.02] group-focus-visible:-translate-y-1">
                    {playlist.cover ? (
                      <Image
                        src={playlist.cover}
                        unoptimized={!canOptimizeImage(playlist.cover)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 180px, 30vw"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="mt-2.5 block truncate text-[13px] font-medium text-white sm:mt-3 sm:text-[15px]">
                    {playlist.name}
                  </span>
                  {playlist.tracks !== null ? (
                    <span className="block text-xs text-white/50 sm:text-[13px]">
                      {plural(playlist.tracks, 'song')}
                    </span>
                  ) : null}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-[46ch] text-base text-white/60">{blurb}</p>
        )}
      </div>
    </div>
  );
}
