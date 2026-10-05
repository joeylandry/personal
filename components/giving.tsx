import Image from 'next/image';
import Link from 'next/link';
import type { GivingChapter, StoryPhoto } from '@/content';
import { giving } from '@/content';
import { ExternalLink } from './external-link';
import { Pennant } from './pennant';
import { Section } from './section';

/** A captioned photo at its natural aspect ratio, never cropped. */
function Photo({
  photo,
  sizes,
  priority = false,
  className = '',
}: {
  photo: StoryPhoto;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden border border-rule bg-raised">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          priority={priority}
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
    <Section id="giving" surface="ink" divider={false} labelledBy="giving-heading">
      <div className="wrap grid gap-x-10 gap-y-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <div>
            <p className="meta section-label">{intro.kicker}</p>
            <h1 id="giving-heading" className="mt-5 text-title font-medium">
              {intro.title}
            </h1>
          </div>
          <div className="measure mt-8 space-y-5 text-lead text-muted">
            {intro.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <dl className="space-y-6">
            {[
              { value: '$20,000+', label: 'Raised for Make-A-Wish Massachusetts and Rhode Island' },
              { value: '9 years', label: '2013 to 2021, every summer in Nyes Neck' },
            ].map((stat) => (
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
          </blockquote>
        </div>
      </div>
    </Section>
  );
}

/** Photos for one chapter: one photo full width, three as a portrait plus a stack. */
function ChapterPhotos({ chapter }: { chapter: GivingChapter }) {
  const [first, ...rest] = chapter.photos;
  if (!first) return null;
  if (rest.length === 0) {
    const portrait = first.height > first.width;
    return (
      <Photo
        photo={first}
        sizes="(min-width: 768px) 60vw, 100vw"
        className={portrait ? 'mx-auto max-w-md md:mx-0' : ''}
      />
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Photo photo={first} sizes="(min-width: 768px) 30vw, 100vw" />
      <div className="space-y-6">
        {rest.map((photo) => (
          <Photo key={photo.src} photo={photo} sizes="(min-width: 768px) 30vw, 100vw" />
        ))}
      </div>
    </div>
  );
}

export function GivingTimeline() {
  return (
    <Section surface="paper" labelledBy="giving-timeline-heading">
      <div className="wrap py-20 md:py-28">
        <div>
          <p className="meta section-label">Make-A-Wish · Nyes Neck</p>
          <h2 id="giving-timeline-heading" className="mt-5 text-title font-medium">
            The fundraisers, in order.
          </h2>
        </div>

        <ol className="mt-14 md:mt-20">
          {giving.chapters.map((chapter) => (
            <li
              key={chapter.title}
              className="grid gap-x-10 gap-y-8 border-t border-rule py-12 md:grid-cols-12 md:py-16"
            >
              <div className="md:col-span-4">
                <div className="md:sticky md:top-28">
                  <p className="meta text-detail">{chapter.year ?? 'Early years'}</p>
                  <h3 className="mt-3 text-heading font-medium tracking-tight">{chapter.title}</h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{chapter.body}</p>
                </div>
              </div>
              <div className="md:col-span-8">
                <ChapterPhotos chapter={chapter} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function GivingThanks() {
  const { thanks } = giving;
  return (
    <Section surface="ink" labelledBy="giving-thanks-heading">
      <div className="wrap py-20 md:py-28">
        <div>
          <p className="meta section-label">{thanks.kicker}</p>
          <h2 id="giving-thanks-heading" className="measure mt-5 text-title font-medium">
            {thanks.title}
          </h2>
        </div>
        <div className="mt-12">
          <Photo photo={thanks.image} sizes="(min-width: 1280px) 1200px, 100vw" />
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
            <p className="meta section-label flex items-center gap-3">
              {next.kicker}
              <Pennant className="h-3.5 w-auto" />
            </p>
            <h2 id="giving-next-heading" className="mt-5 text-title font-medium">
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
