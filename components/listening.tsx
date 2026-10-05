import Image from 'next/image';
import { listening, spotifyArtistSearchUrl, spotifyEmbedUrl } from '@/content';
import { ExternalLink } from './external-link';
import { NowPlayingPanel, PlayerBar } from './live-player';
import { Section, SectionHeading } from './section';

/** Spotify's pushpin, beside the pinned items in the library. */
function Pin() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-label="Pinned"
      role="img"
      className="size-3 shrink-0 fill-[#1ed760]"
    >
      <path d="M8.8 1.1a1.4 1.4 0 012 0l4.1 4.1a1.4 1.4 0 010 2l-2.6 2.6.3 2.4a1 1 0 01-.3.8l-1 1a.7.7 0 01-1 0L7.1 10.8 2.2 15.7a.7.7 0 11-1-1L6 9.9 2.9 6.8a.7.7 0 010-1l1-1a1 1 0 01.8-.3l2.4.3z" />
    </svg>
  );
}

function LikedSongsArt() {
  return (
    <div className="grid size-12 shrink-0 place-items-center rounded bg-[linear-gradient(135deg,#450af5,#8e8ee5_60%,#c4efd9)]">
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-5 fill-white">
        <path d="M8 14.2 6.9 13.2C3 9.7.5 7.4.5 4.6.5 2.4 2.2.7 4.4.7c1.3 0 2.5.6 3.6 1.6C9 1.3 10.3.7 11.6.7c2.2 0 3.9 1.7 3.9 3.9 0 2.8-2.5 5.1-6.4 8.6z" />
      </svg>
    </div>
  );
}

/** "Your Library", down the left of the window. */
function Library() {
  return (
    <div className="rounded-lg bg-[#121212] p-3">
      <p className="px-2 pt-1 font-bold text-white">Your Library</p>
      <div aria-hidden="true" className="mt-4 flex gap-2 px-2">
        {['Playlists', 'Podcasts', 'Albums'].map((chip) => (
          <span key={chip} className="rounded-full bg-[#2a2a2a] px-3 py-1.5 text-sm text-white">
            {chip}
          </span>
        ))}
      </div>
      <ul className="mt-3">
        {listening.library.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 rounded-md p-2 hover:bg-[#1f1f1f]"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                width={48}
                height={48}
                className={`size-12 shrink-0 object-cover ${item.kind === 'Artist' ? 'rounded-full' : 'rounded'}`}
              />
            ) : (
              <LikedSongsArt />
            )}
            <div className="min-w-0">
              <p className={`truncate ${item.image ? 'text-white' : 'text-[#1ed760]'}`}>
                {item.title}
              </p>
              <p className="flex items-center gap-1.5 truncate text-sm text-[#b3b3b3]">
                {item.pinned ? <Pin /> : null}
                <span className="truncate">
                  {item.by ? `${item.kind} • ${item.by}` : item.kind}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The profile page in the middle of the window: header, top artists, the pinned song. */
function Profile() {
  const { profile, topArtists, pinned } = listening;

  return (
    <div className="overflow-hidden rounded-lg bg-[#121212]">
      {/* Opaque base colour under the gradient, so the text has a measurable background. */}
      <div className="bg-[#5b1d2a] bg-[linear-gradient(180deg,#7a2638_0%,#5b1d2a_70%,#3a1520_100%)] px-5 pt-8 pb-6 @container sm:px-7">
        <div className="flex flex-col gap-5 @2xl:flex-row @2xl:items-end @2xl:gap-7">
          <Image
            src={profile.photo}
            alt="Joey with two friends under a party tent"
            width={208}
            height={208}
            priority={false}
            className="size-32 shrink-0 rounded-full object-cover shadow-[0_8px_40px_rgb(0_0_0/0.5)] @lg:size-44 @2xl:size-52"
          />
          <div className="min-w-0">
            <p className="text-sm text-white">Profile</p>
            <p className="mt-1 text-[clamp(2.5rem,11cqw,5.5rem)] leading-none whitespace-nowrap font-black tracking-[-0.04em] text-white">
              {profile.name}
            </p>
            <p className="mt-4 flex flex-wrap text-sm text-white">
              {profile.stats.map((stat, i) => (
                <span key={stat} className="whitespace-nowrap">
                  {i > 0 ? <span className="mx-1.5">•</span> : null}
                  {stat}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[linear-gradient(180deg,rgb(91_29_42/0.35),transparent_8rem)] px-5 pt-6 pb-7 @container sm:px-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{topArtists.title}</h3>
            <p className="mt-1 text-sm text-[#b3b3b3]">{topArtists.note}</p>
          </div>
          <ExternalLink
            href={listening.profileUrl}
            className="shrink-0 text-sm font-bold text-[#b3b3b3] hover:text-white hover:underline"
          >
            Show all
          </ExternalLink>
        </div>

        <ul className="-mx-2 mt-5 grid grid-cols-2 gap-1 @lg:grid-cols-4">
          {topArtists.artists.map((artist) => (
            <li key={artist.name}>
              <ExternalLink
                href={spotifyArtistSearchUrl(artist.name)}
                className="group block rounded-lg p-2 transition-colors hover:bg-[#1f1f1f]"
              >
                <span className="relative block aspect-square overflow-hidden rounded-full bg-[#282828]">
                  <Image
                    src={artist.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 12rem, 45vw"
                    className="scale-[1.04] object-cover"
                  />
                </span>
                <span className="mt-3 block text-white">{artist.name}</span>
                <span className="mt-0.5 block text-sm text-[#b3b3b3]">Artist</span>
              </ExternalLink>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-2xl font-bold tracking-tight text-white">{pinned.label}</h3>
        {/* Spotify's own embed plays a preview without any setup, and works without JavaScript. */}
        <iframe
          title={`${pinned.label} — Spotify player`}
          src={spotifyEmbedUrl(pinned.spotifyId)}
          width="100%"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="mt-4 block rounded-xl border-0"
        />
      </div>
    </div>
  );
}

/** About page: my Spotify, recreated — library, profile, and what's on right now. */
export function ListeningSection() {
  return (
    <Section id="listening" surface="ink" labelledBy="listening-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading
          id="listening-heading"
          label={listening.label}
          title={listening.title}
          lead={listening.lead}
          aside={
            <ExternalLink
              href={listening.profileUrl}
              arrow
              className="link meta text-muted hover:text-fg"
            >
              Spotify
            </ExternalLink>
          }
        />

        <div className="spotify mt-12 overflow-hidden rounded-xl bg-black p-2 font-sans shadow-[0_30px_80px_var(--shadow-key)] ring-1 ring-white/10 md:mt-16">
          <div aria-hidden="true" className="flex items-center gap-2 px-2 pt-1 pb-3">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="grid gap-2 xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
            <div className="order-2 xl:order-1">
              <Library />
            </div>
            <div className="order-1 xl:order-2">
              <Profile />
            </div>
            <div className="order-3 rounded-lg bg-[#121212] p-4">
              <NowPlayingPanel />
            </div>
          </div>
          <PlayerBar />
        </div>
      </div>
    </Section>
  );
}
