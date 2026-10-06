import Image from 'next/image';
import Link from 'next/link';
import type { GivingChapter, StoryPhoto } from '@/content';
import { giving } from '@/content';
import { ExternalLink } from './external-link';
import { Corners } from './frame';
import { TimelineTrack } from './giving-timeline';
import { Pennant } from './pennant';
import { PhotoLightbox } from './photo-lightbox';
import { Section } from './section';
import { ShootingStars } from './shooting-stars';
import { WishingFlight } from './wishing-flight';

/** A captioned photo at its natural aspect ratio, never cropped. */
function Photo({ photo, sizes }: { photo: StoryPhoto; sizes: string }) {
  return (
    <figure>
      <div className="overflow-hidden border border-rule bg-raised">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
      <figcaption className="meta mt-3 text-faint">{photo.caption}</figcaption>
    </figure>
  );
}

export function GivingIntro() {
  const { intro } = giving;
  return (
    <Section
      id="giving"
      surface="ink"
      divider={false}
      labelledBy="giving-heading"
      className="overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <ShootingStars className="giving-static absolute -top-10 -right-40 h-[440px] w-[840px] max-w-none text-sea opacity-75 md:inset-0 md:h-full md:w-full" />
        <WishingFlight className="text-sea opacity-75" />
      </div>

      <div className="wrap relative grid gap-x-10 gap-y-12 pt-10 pb-20 md:grid-cols-12 md:pt-14 md:pb-28">
        <div className="md:col-span-7">
          <h1 id="giving-heading" className="text-title font-medium">
            {intro.title}
          </h1>
          <div data-flight-from className="measure mt-8 space-y-5 text-lead text-muted">
            {intro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div data-flight-to className="md:col-span-4 md:col-start-9 md:pt-2">
          <dl className="space-y-6">
            {intro.stats.map((stat) => (
              <div key={stat.value} className="rule-t pt-5 first:border-t-0 first:pt-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <p className="text-title font-medium tracking-tight text-accent">{stat.value}</p>
                  <p className="mt-1.5 text-sm leading-snug text-muted">{stat.label}</p>
                </dd>
              </div>
            ))}
          </dl>
          <blockquote className="mt-10 border-l border-detail pl-6">
            <p className="text-lg leading-snug text-fg">“{intro.quote}”</p>
            <footer className="meta mt-3 text-faint">{intro.quoteYear}</footer>
          </blockquote>
        </div>
      </div>
    </Section>
  );
}

/**
 * One fundraiser: thumbnails that open full size, the caption, then the story.
 * `data-grow` marks the photos the timeline shows at full size before they
 * shrink into their thumbnail (see TimelineTrack).
 */
function ChapterCard({ chapter }: { chapter: GivingChapter }) {
  const [first] = chapter.photos;
  const multiple = chapter.photos.length > 1;
  return (
    <article>
      <div
        data-grow
        data-aspect={!multiple && first ? (first.width / first.height).toFixed(4) : undefined}
      >
        <PhotoLightbox
          photos={chapter.photos}
          layout={multiple ? 'mosaic' : 'single'}
          sizes="(min-width: 768px) 60vw, 100vw"
        />
      </div>
      <div className="giving-card-text">
        <p className="meta mt-3 text-faint">
          {multiple ? `${chapter.photos.length} photos` : first?.caption}
        </p>
        <h3 className="mt-5 text-xl font-medium tracking-tight md:text-2xl">{chapter.title}</h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{chapter.body}</p>
      </div>
    </article>
  );
}

export function GivingTimeline() {
  return (
    <Section surface="paper" labelledBy="giving-timeline-heading">
      <div className="wrap py-20 md:py-28">
        <div>
          <p className="meta section-label">Make-A-Wish · Nyes Neck</p>
          <h2 id="giving-timeline-heading" className="mt-5 text-title font-medium">
            Where it all began.
          </h2>
        </div>

        {/* Cards alternate either side of the spine from md up, each tucked
            up beside the one before so the two columns interleave. */}
        <TimelineTrack className="mt-14 md:mt-20">
          {giving.chapters.map((chapter, index) => {
            const left = index % 2 === 0;
            return (
              <li
                key={chapter.title}
                data-step
                className={`giving-step relative pl-10 md:grid md:grid-cols-2 md:gap-x-20 md:pl-0 ${
                  index > 0 ? 'md:-mt-48' : ''
                }`}
              >
                <span aria-hidden="true" className="giving-node" />
                <span
                  aria-hidden="true"
                  className={`giving-link hidden md:block ${left ? 'right-1/2' : 'left-1/2'}`}
                />
                <div className={left ? 'md:col-start-1' : 'md:col-start-2'}>
                  <p
                    className={`giving-year font-mono text-2xl leading-[44px] font-medium tracking-tight ${
                      left ? 'md:text-right' : ''
                    }`}
                  >
                    {chapter.year ?? 'Early years'}
                  </p>
                  <div className="mt-3">
                    <ChapterCard chapter={chapter} />
                  </div>
                </div>
              </li>
            );
          })}
        </TimelineTrack>
      </div>
    </Section>
  );
}

export function GivingThanks() {
  const { thanks } = giving;
  return (
    <Section surface="ink" labelledBy="giving-thanks-heading">
      <div className="wrap py-20 md:py-28">
        <h2 id="giving-thanks-heading" className="measure text-title font-medium">
          {thanks.title}
        </h2>
        <div className="mt-12 max-w-4xl">
          <div className="relative border border-rule bg-raised p-1.5">
            <Corners />
            <Image
              src={thanks.image.src}
              alt={thanks.image.alt}
              width={thanks.image.width}
              height={thanks.image.height}
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="h-auto w-full"
            />
          </div>
          <p className="meta mt-3 text-faint">{thanks.image.caption}</p>
        </div>
        <p className="measure mt-12 text-lead font-medium">{thanks.reply}</p>
      </div>
    </Section>
  );
}

export function GivingNext() {
  const { next } = giving;
  return (
    <Section surface="paper" labelledBy="giving-next-heading">
      <div className="wrap grid items-center gap-x-10 gap-y-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <div>
            <Pennant className="h-9 w-auto" />
            <h2 id="giving-next-heading" className="mt-6 text-title font-medium">
              {next.title}
            </h2>
          </div>
          <div className="mt-8 space-y-5 text-lead text-muted">
            {next.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <ExternalLink href={next.shopUrl} className="link-on font-medium text-fg" arrow>
                Visit nyesneck.shop
              </ExternalLink>
              <Link href="/work/nyes-neck" className="link text-muted hover:text-fg">
                How the shop is built
              </Link>
              <ExternalLink href={next.stJudeUrl} className="link text-muted hover:text-fg" arrow>
                St. Jude
              </ExternalLink>
            </div>
          </div>
        </div>
        <div className="md:col-span-7">
          <Photo photo={next.photo} sizes="(min-width: 768px) 55vw, 100vw" />
        </div>
      </div>
    </Section>
  );
}
