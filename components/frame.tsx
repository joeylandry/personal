import Image from 'next/image';
import type { ProjectImage } from '@/content';

/**
 * Editorial image frame.
 *
 * A hairline, four corner ticks and a mono caption rail. When the artwork is an
 * authored illustration rather than a capture of the live product, the caption
 * says so — the frame never pretends to be a screenshot.
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
        <Corners />
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
            <span className="text-faint normal-case tracking-normal">
              Illustrated cover — not a screenshot
            </span>
          ) : null}
        </figcaption>
      )}
    </figure>
  );
}

function Corners() {
  const shared = 'absolute h-2 w-2 border-tick';
  return (
    <span aria-hidden="true">
      <span className={`${shared} -top-px -left-px border-t border-l`} />
      <span className={`${shared} -top-px -right-px border-t border-r`} />
      <span className={`${shared} -bottom-px -left-px border-b border-l`} />
      <span className={`${shared} -right-px -bottom-px border-r border-b`} />
    </span>
  );
}
