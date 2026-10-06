import { listening, spotifyEmbedUrl, spotifyTrackUrl } from '@/content';
import { getSpotifyProfile, getTopArtists, getTrackPreview } from '@/lib/spotify-cache';
import { ExternalLink } from './external-link';
import { LivePlayer } from './live-player';
import { RecordPlayer } from './record-player';
import { Section, SectionHeading } from './section';
import { SpotifyProfileCard } from './spotify-profile';

/**
 * About page music: the pinned song as a spinning record beside the live player
 * on glass (stacked on smaller screens), then a preview of the public Spotify
 * profile.
 */
export async function ListeningSection() {
  const { pinned, profile } = listening;
  const [preview, spotifyProfile, topArtists] = await Promise.all([
    getTrackPreview(pinned.spotifyId),
    getSpotifyProfile(listening.profileId),
    getTopArtists(),
  ]);

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

        {/* Side by side on desktop; the record takes the full row when Spotify isn't connected. */}
        <div className="mt-12 grid gap-16 md:mt-16 md:gap-24 lg:items-start lg:gap-8 lg:[&:has(>:nth-child(2))]:grid-cols-2">
          <RecordPlayer
            trackId={pinned.spotifyId}
            eyebrow={pinned.label}
            preview={preview}
            embedUrl={spotifyEmbedUrl(pinned.spotifyId)}
            trackUrl={preview?.url ?? spotifyTrackUrl(pinned.spotifyId)}
          />
          <LivePlayer />
        </div>

        <div className="mt-6 md:mt-8">
          <SpotifyProfileCard
            profile={spotifyProfile}
            url={listening.profileUrl}
            username={listening.profileId}
            fallbackName={profile.name}
            fallbackAvatar={profile.avatar}
            topArtists={topArtists}
            topArtistsLabel={profile.topArtistsLabel}
            label={profile.label}
            blurb={profile.blurb}
            cta={profile.cta}
          />
        </div>
      </div>
    </Section>
  );
}
