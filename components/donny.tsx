import Image from 'next/image';
import type { StoryPhoto } from '@/content';
import { donny } from '@/content';
import { Section } from './section';

function Tile({ photo }: { photo: StoryPhoto }) {
  return (
    <div>
      <figure>
        <div className="relative aspect-[4/5] overflow-hidden border border-rule bg-raised">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 336px, 50vw"
            className="object-cover"
          />
        </div>
        <figcaption className="meta mt-3 text-faint">{photo.caption}</figcaption>
      </figure>
    </div>
  );
}

/** About page: Donny as a kitten and now, two photos each. */
export function DonnySection() {
  const rows = [
    { label: 'Kitty', photos: donny.then },
    { label: 'Now', photos: donny.now },
  ];

  return (
    <Section id="donny" surface="ink" labelledBy="donny-heading">
      <div className="wrap py-20 md:py-28">
        <div>
          <p className="meta section-label">My business partner</p>
          <h2 id="donny-heading" className="mt-5 text-title font-medium">
            Meet {donny.name}.
          </h2>
          <p className="measure mt-5 text-lead text-muted">
            He has never written a line of code, but he has sat on the keyboard for most of mine.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-x-6 gap-y-6 md:grid-cols-12">
              <p className="meta text-detail md:col-span-1 md:pt-1">{row.label}</p>
              <div className="grid max-w-2xl grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:col-span-11">
                {row.photos.map((photo) => (
                  <Tile key={photo.src} photo={photo} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
