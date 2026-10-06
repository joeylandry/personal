import { listening, spotifyEmbedUrl, spotifyTrackUrl } from '@/content';
import { getSpotifyProfile, getTopArtists, getTrackPreview } from '@/lib/spotify-cache';
import { ExternalLink } from './external-link';
import { LivePlayer } from './live-player';
import { RecordPlayer } from './record-player';
import { Section, SectionHeading } from './section';
import { SpotifyProfileCard } from './spotify-profile';

/**
 * About page music: the pinned song as a spinning record, the live player on
 * glass below it, then a preview of the public Spotify profile.
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

        <div className="mt-12 md:mt-16">
          <RecordPlayer
            trackId={pinned.spotifyId}
            eyebrow={pinned.label}
            preview={preview}
            embedUrl={spotifyEmbedUrl(pinned.spotifyId)}
            trackUrl={preview?.url ?? spotifyTrackUrl(pinned.spotifyId)}
          />
        </div>

        <div className="mt-16 space-y-6 md:mt-24 md:space-y-8">
          <LivePlayer />
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
