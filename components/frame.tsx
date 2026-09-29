import Image from 'next/image';
import type { ProjectImage } from '@/content';

/**
 * Editorial image frame.
 *
 * A hairline border and a caption. When the artwork is an illustration rather
 * than a capture of the live product, the caption says so.
 */
export function Frame({
  image,
  caption,
  priority = false,
  sizes = '(min-width: 1024px) 60vw, 100vw',
  className = '',
  children,
}: {
  image: ProjectImage;
  /** Mono text on the caption rail, typically the live domain. */
  caption?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <figure className={`relative ${className}`.trim()}>
      <div className="relative border border-rule bg-raised">
        <div className="parallax overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            priority={priority}
            unoptimized={image.src.endsWith('.svg')}
            className="h-auto w-full"
          />
        </div>
        {children}
      </div>
      {(caption || image.illustrated) && (
        <figcaption className="meta mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          {caption ? <span className="text-accent">{caption}</span> : <span />}
          {image.illustrated ? (
            <span className="text-faint normal-case tracking-normal">Illustration</span>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}
