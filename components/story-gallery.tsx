import Image from 'next/image';
import { storyPhotos } from '@/content';
import { Pennant } from './pennant';
import { Reveal } from './reveal';
import { Section } from './section';

/** The fundraiser years in photos — the evidence behind the origin story. */
export function StoryGallery() {
  return (
    <Section surface="ink" labelledBy="story-gallery-heading">
      <div className="wrap py-20 md:py-28">
        <Reveal>
          <p className="meta section-label flex items-center gap-3">
            From the archive
            <Pennant className="h-3.5 w-auto" />
          </p>
          <h2 id="story-gallery-heading" className="mt-5 text-title font-medium">
            Nine summers in Nyes Neck.
          </h2>
        </Reveal>

        {/* Landscape shots crop to a common 4:3; the portrait one spans two rows. */}
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {storyPhotos.map((photo, index) => {
            const tall = photo.height > photo.width;
            return (
              <Reveal
                key={photo.src}
                delay={Math.min(index, 4) * 60}
                className={photo.wide ? 'sm:col-span-2 lg:col-span-3' : tall ? 'sm:row-span-2' : ''}
              >
                <figure className="flex h-full flex-col">
                  <div
                    className={[
                      'relative overflow-hidden border border-rule bg-raised',
                      photo.wide
                        ? 'aspect-[4/3] sm:aspect-[21/9]'
                        : tall
                          ? 'aspect-[3/4] sm:aspect-auto sm:flex-1'
                          : 'aspect-[4/3]',
                    ].join(' ')}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes={
                        photo.wide
                          ? '100vw'
                          : '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
                      }
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm leading-snug text-muted">
                    {photo.caption}
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
