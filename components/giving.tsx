import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { GivingChapter } from '@/content';
import { giving } from '@/content';
import { ExternalLink } from './external-link';
import { Corners } from './frame';
import { TimelineTrack } from './giving-timeline';
import { PhotoLightbox } from './photo-lightbox';
import { Reveal } from './reveal';
import { Section } from './section';
import { ShootingStars } from './shooting-stars';
import { WishingFlight } from './wishing-flight';

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

/** Every timeline photo in order, so the gallery steps through them all. */
const timelinePhotos = giving.chapters.flatMap((chapter) => chapter.photos);

/**
 * One fundraiser: the photos at their own aspect ratio (opening full size in a
 * gallery), the caption, then the story. From md up the photos sit mini beside
 * their year.
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
            gallery={timelinePhotos}
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

/**
 * One stop on the spine: its node, the hairline over to the card, the year,
 * then the card itself. Even steps sit left of the spine from md up, odd ones
 * right.
 */
function TimelineStep({
  index,
  year,
  tuck = false,
  children,
}: {
  index: number;
  year: string;
  /** Pull the step up beside the one before so the two columns interleave. */
  tuck?: boolean;
  children: ReactNode;
}) {
  const left = index % 2 === 0;
  return (
    <li
      data-step
      className={`giving-step relative pl-10 md:grid md:grid-cols-2 md:gap-x-20 md:pl-0 ${
        tuck ? 'md:-mt-48' : ''
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
          {year}
        </p>
        <Reveal className="mt-3">{children}</Reveal>
      </div>
    </li>
  );
}

export function GivingTimeline() {
  return (
    <Section surface="paper" labelledBy="giving-timeline-heading">
      <div className="wrap pt-14 pb-20 md:pt-16 md:pb-28">
        <div>
          <p className="meta section-label">Make-A-Wish · Nyes Neck</p>
          <h2 id="giving-timeline-heading" className="mt-5 text-title font-medium">
            Where it all began.
          </h2>
        </div>

        {/* The spine fades out below the last step and fades back in at the
            top of GivingNext, past the thank-you. */}
        <TimelineTrack className="mt-8 md:mt-10">
          {giving.chapters.map((chapter, index) => (
            <TimelineStep
              key={chapter.title}
              index={index}
              year={chapter.year ?? 'Early years'}
              tuck={index > 0}
            >
              <ChapterCard chapter={chapter} left={index % 2 === 0} />
            </TimelineStep>
          ))}
        </TimelineTrack>
      </div>
    </Section>
  );
}

export function GivingThanks() {
  const { thanks } = giving;
  return (
    <Section surface="ink" labelledBy="giving-thanks-heading">
      <div className="wrap grid items-center gap-x-12 gap-y-8 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5 md:col-start-1 md:row-start-1">
          <h2 id="giving-thanks-heading" className="text-2xl font-medium tracking-tight md:text-3xl">
            {thanks.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">{thanks.reply}</p>
        </div>
        <figure className="md:col-span-7 md:col-start-6 md:row-start-1">
          <div className="relative border border-rule bg-raised p-1.5">
            <Corners />
            <Image
              src={thanks.image.src}
              alt={thanks.image.alt}
              width={thanks.image.width}
              height={thanks.image.height}
              sizes="(min-width: 1024px) 40rem, (min-width: 768px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="meta mt-3 text-faint">{thanks.image.caption}</figcaption>
        </figure>
      </div>
    </Section>
  );
}

/**
 * The timeline after the thank-you. The spine fades in from the top of the
 * band, as if it had run on behind the thank-you, passes the St. Jude stop and
 * ends at the Now node.
 */
export function GivingNext() {
  const { next, now } = giving;
  const first = giving.chapters.length;
  return (
    <Section surface="paper" labelledBy="giving-next-heading">
      <div className="wrap pb-20 md:pb-28">
        <TimelineTrack continues>
          <TimelineStep index={first} year={next.year}>
            <article>
              <PhotoLightbox
                photos={[next.photo]}
                layout="single"
                sizes="(min-width: 768px) 36vw, 100vw"
              />
              <p className="meta mt-3 text-faint">{next.photo.caption}</p>
              <h2
                id="giving-next-heading"
                className="mt-5 text-xl font-medium tracking-tight md:text-2xl"
              >
                {next.title}
              </h2>
              <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-muted">
                {next.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
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
            </article>
          </TimelineStep>

          <TimelineStep index={first + 1} year={now.year} tuck>
            <article>
              <h3 className="text-xl font-medium tracking-tight md:text-2xl">{now.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{now.body}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <Link href="/contact" className="link-on font-medium text-fg">
                  Get involved <span aria-hidden="true">→</span>
                </Link>
                <ExternalLink href={next.shopUrl} className="link text-muted hover:text-fg" arrow>
                  Shop the cause
                </ExternalLink>
              </div>
            </article>
          </TimelineStep>
        </TimelineTrack>
      </div>
    </Section>
  );
}
