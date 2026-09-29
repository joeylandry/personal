import Image from 'next/image';
import type { StoryPhoto } from '@/content';
import { donny } from '@/content';
import { Reveal } from './reveal';
import { Section } from './section';

function Tile({ photo, delay }: { photo: StoryPhoto; delay: number }) {
  return (
    <Reveal delay={delay}>
      <figure>
        <div className="relative aspect-[4/5] overflow-hidden border border-rule bg-raised">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 30vw, 50vw"
            className="object-cover"
          />
        </div>
        <figcaption className="meta mt-3 text-faint">{photo.caption}</figcaption>
      </figure>
    </Reveal>
  );
}

/** About page: Donny then and now. */
export function DonnySection() {
  const rows = [
    { label: 'Then', photos: donny.then },
    { label: 'Now', photos: donny.now },
  ];

  return (
    <Section id="donny" surface="ink" labelledBy="donny-heading">
      <div className="wrap py-20 md:py-28">
        <Reveal>
          <p className="meta section-label">The coworker</p>
          <h2 id="donny-heading" className="mt-5 text-title font-medium">
            Meet {donny.name}.
          </h2>
          <p className="measure mt-5 text-lead text-muted">
            Every late-night build ships with a second opinion.
          </p>
        </Reveal>

        <div className="mt-12 space-y-12">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-x-6 gap-y-6 md:grid-cols-12">
              <p className="meta text-accent md:col-span-1 md:pt-1">{row.label}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:col-span-11">
                {row.photos.map((photo, index) => (
                  <Tile key={photo.src} photo={photo} delay={index * 60} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Home page: a small card — the guy and the cat, out in the woods. */
export function DonnyCard() {
  const photo = donny.woods;

  return (
    <Section surface="ink" labelledBy="donny-card-heading">
      <div className="wrap py-16 md:py-20">
        <Reveal className="grid items-center gap-8 sm:grid-cols-[10rem_1fr] md:grid-cols-[12rem_1fr] md:gap-12">
          <div className="relative aspect-[3/4] w-40 overflow-hidden border border-rule bg-raised md:w-48">
            <Image src={photo.src} alt={photo.alt} fill sizes="192px" className="object-cover" />
          </div>
          <div>
            <p className="meta section-label">After hours</p>
            <h2 id="donny-card-heading" className="mt-4 text-heading font-medium tracking-tight">
              A guy, a cat, and a laptop in the woods.
            </h2>
            <p className="measure mt-4 text-[0.95rem] leading-relaxed text-muted">
              Most of what you see here gets built after hours, somewhere quiet, with {donny.name}{' '}
              supervising.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
