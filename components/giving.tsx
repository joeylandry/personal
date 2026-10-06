import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { GivingChapter, StoryPhoto } from '@/content';
import { giving } from '@/content';
import { ExternalLink } from './external-link';
import { TimelineTrack } from './giving-timeline';
import { Pennant } from './pennant';
import { PhotoLightbox } from './photo-lightbox';
import { Reveal } from './reveal';
import { Section } from './section';
import { ShootingStars } from './shooting-stars';

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
        <ShootingStars className="absolute -top-10 -right-40 h-[440px] w-[840px] max-w-none text-sea opacity-75 md:inset-0 md:h-full md:w-full" />
      </div>

      <div className="wrap relative grid gap-x-10 gap-y-12 pt-10 pb-20 md:grid-cols-12 md:pt-14 md:pb-28">
        <div className="md:col-span-7">
          <h1 id="giving-heading" className="text-title font-medium">
            {intro.title}
          </h1>
          <div className="measure mt-8 space-y-5 text-lead text-muted">
            {intro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9 md:pt-2">
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
 * One fundraiser: the photos at their own aspect ratio (opening full size in a
 * gallery), the caption, then the story. From md up the photos sit mini beside
 * their year; TimelineTrack zooms them in from the middle of the timeline the
 * first time the reader scrolls to them.
 */
function ChapterCard({ chapter, left }: { chapter: GivingChapter; left: boolean }) {
  const [first] = chapter.photos;
  const multiple = chapter.photos.length > 1;
  // Width over height of the whole row of photos, so the stylesheet can size
  // the row by its height.
  const ratio = chapter.photos.reduce((sum, photo) => sum + photo.width / photo.height, 0);
  return (
    <article>
      <div
        className={`giving-photo-slot ${left ? 'md:ml-auto' : ''}`}
        style={{ '--ratio': ratio.toFixed(4) } as CSSProperties}
      >
        <div className="giving-photo">
          <PhotoLightbox
            photos={chapter.photos}
            layout="row"
            sizes={`(min-width: 768px) ${Math.round(50 / chapter.photos.length)}vw, ${Math.round(100 / chapter.photos.length)}vw`}
          />
        </div>
      </div>
      <p className="meta mt-3 text-faint">
        {multiple ? `${chapter.photos.length} photos` : first?.caption}
      </p>
      <h3 className="mt-5 text-xl font-medium tracking-tight md:text-2xl">{chapter.title}</h3>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{chapter.body}</p>
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
                  <Reveal className="mt-3">
                    <ChapterCard chapter={chapter} left={left} />
                  </Reveal>
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
          <PhotoLightbox
            photos={[thanks.image]}
            layout="natural"
            sizes="(min-width: 1024px) 56rem, 100vw"
          />
          <p className="meta mt-3 text-faint">{thanks.image.caption}</p>
        </div>
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

export function GivingClosing() {
  return (
    <Section surface="ink">
      <div className="wrap py-20 text-center md:py-28">
        <div>
          <p className="mx-auto max-w-3xl text-title font-medium tracking-tight">
            {giving.closing}
          </p>
        </div>
      </div>
    </Section>
  );
}
