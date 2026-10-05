import { listening, spotifyEmbedUrl } from '@/content';
import { ExternalLink } from './external-link';
import { LivePlayer } from './live-player';
import { Section, SectionHeading } from './section';

/** About page: the pinned song, and the live player beside it. */
export function ListeningSection() {
  const { pinned } = listening;

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

        <div className="mt-12 grid items-start gap-8 md:mt-16 md:grid-cols-2 md:gap-10">
          <div>
            <p className="meta text-accent">{pinned.label}</p>
            {/* Spotify's own embed plays a preview without any setup, and works without JavaScript. */}
            <iframe
              title={`${pinned.label} — Spotify player`}
              src={spotifyEmbedUrl(pinned.spotifyId)}
              width="100%"
              height="152"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="mt-5 block rounded-xl border-0"
            />
          </div>
          <LivePlayer />
        </div>
      </div>
    </Section>
  );
}
