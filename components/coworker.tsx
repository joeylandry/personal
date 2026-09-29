import Image from 'next/image';
import { catPhotos } from '@/content';
import { Reveal } from './reveal';
import { Section } from './section';

/** A guy, a cat, alone in the woods building software — this is Donny, the cat. */
export function Coworker() {
  return (
    <Section surface="ink" labelledBy="coworker-heading">
      <div className="wrap py-20 md:py-28">
        <Reveal>
          <p className="meta section-label">After hours</p>
          <h2 id="coworker-heading" className="mt-5 text-title font-medium">
            The coworker: Donny.
          </h2>
          <p className="measure mt-5 text-lead text-muted">
            Every late-night build ships with a second opinion.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
          {catPhotos.map((photo, index) => (
            <Reveal key={photo.src} delay={index * 60}>
              <figure>
                <div className="relative aspect-[3/4] overflow-hidden border border-rule bg-raised">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="meta mt-3 text-faint">{photo.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
