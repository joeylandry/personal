'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { StoryPhoto } from '@/content';
import { Corners } from './frame';

/**
 * Photo thumbnails that open a full-screen gallery.
 *
 * The gallery is a native modal <dialog> (focus trap, Esc to close and focus
 * return for free), portalled to <body> so no transformed ancestor can shift
 * it. It shows `gallery` (the thumbnails' own photos by default) as a
 * swipeable strip, like a phone's photo viewer: swipe, scroll or use the
 * arrows and arrow keys, or pick a photo from the thumbnails along the bottom.
 *
 * The gallery is for wider screens only. On phones the photos already fill
 * the column, so a tap does nothing. Each thumbnail is a real link to the
 * image file, so without JavaScript it still opens the full photo.
 *
 * Layouts:
 * - `single`: one cropped thumbnail at a fixed height.
 * - `mosaic`: the first photo as a tall tile, the rest stacked beside it.
 * - `natural`: one photo at its own aspect ratio, never cropped.
 * - `row`: every photo side by side at its own aspect ratio, never cropped.
 *   Each tile's share of the row follows its aspect ratio, so the tiles come
 *   out the same height.
 */
export function PhotoLightbox({
  photos,
  gallery = photos,
  layout = 'single',
  sizes,
  className = '',
}: {
  photos: StoryPhoto[];
  /** Every photo the gallery steps through; defaults to `photos`. */
  gallery?: StoryPhoto[];
  layout?: 'single' | 'mosaic' | 'natural' | 'row';
  sizes: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // False while server rendering and hydrating, true after: the portal needs <body>.
  const mounted = useSyncExternalStore(subscribeNothing, onClient, onServer);
  const captionId = useId();
  const count = gallery.length;
  const current = gallery[index] ?? gallery[0];

  /** Brings photo `next` to the middle of the strip. */
  const go = useCallback(
    (next: number, behavior: ScrollBehavior = 'smooth') => {
      const strip = stripRef.current;
      const target = (next + count) % count;
      setIndex(target);
      strip?.scrollTo({ left: target * strip.clientWidth, behavior });
    },
    [count],
  );

  const open = (event: MouseEvent<HTMLAnchorElement>, photo: StoryPhoto) => {
    // Let modified clicks (new tab, save link) behave like any link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Phones get no gallery.
    if (!window.matchMedia('(min-width: 48rem)').matches) return;
    dialogRef.current?.showModal();
    go(
      Math.max(
        gallery.findIndex((item) => item.src === photo.src),
        0,
      ),
      'instant',
    );
  };

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Hold the page still while the dialog is open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const sync = () => {
      document.documentElement.style.overflow = dialog.open ? 'hidden' : '';
    };
    const observer = new MutationObserver(sync);
    observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    return () => {
      observer.disconnect();
      document.documentElement.style.overflow = '';
    };
  }, [mounted]);

  if (!current) return null;

  const thumb = (photo: StoryPhoto, tileClass: string, fit = true, style?: CSSProperties) => (
    <a
      key={photo.src}
      style={style}
      href={photo.src}
      onClick={(event) => open(event, photo)}
      aria-haspopup="dialog"
      aria-label={`View full size: ${photo.alt}`}
      className={`group/thumb relative block overflow-hidden bg-raised max-md:pointer-events-none ${tileClass}`}
    >
      <Image
        src={photo.src}
        alt=""
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        className={
          fit
            ? 'h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover/thumb:scale-[1.03]'
            : 'h-auto w-full'
        }
      />
      <span
        aria-hidden="true"
        className="meta absolute right-2 bottom-2 flex items-center gap-1.5 bg-[rgb(7_16_24/0.72)] px-2 py-1 text-[0.65rem] text-[#f7f9fb] opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 max-md:hidden"
      >
        <ExpandIcon />
        View
      </span>
    </a>
  );

  const [lead] = photos;
  const viewer = (
    <dialog
      ref={dialogRef}
      aria-labelledby={captionId}
      className="giving-lightbox surface-ink"
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          go(index + 1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          go(index - 1);
        }
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-6 px-6 pt-5">
          <span className="meta text-muted">{count > 1 ? `${index + 1} / ${count}` : ''}</span>
          <LightboxButton label="Close" onClick={close} autoFocus>
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </LightboxButton>
        </div>

        <div className="relative min-h-0 flex-1">
          <div
            ref={stripRef}
            className="giving-lightbox-strip flex h-full"
            onScroll={(event) => {
              const strip = event.currentTarget;
              const settled = Math.round(strip.scrollLeft / strip.clientWidth);
              if (settled !== index && settled >= 0 && settled < count) setIndex(settled);
            }}
          >
            {gallery.map((photo, position) => (
              <figure
                key={photo.src}
                aria-hidden={position !== index}
                className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center px-20 py-4"
                onClick={(event) => {
                  // A click beside the photo closes, like a click on the backdrop.
                  if (event.target === event.currentTarget) close();
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 1024px) 80vw, 100vw"
                  // Load the photo on screen and its neighbours straight away.
                  loading={Math.abs(position - index) <= 1 ? 'eager' : 'lazy'}
                  className="h-auto max-h-[calc(100%-2.5rem)] w-auto max-w-full object-contain"
                />
                <figcaption
                  id={position === index ? captionId : undefined}
                  className="meta mt-4 shrink-0 text-center text-muted"
                >
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          {count > 1 ? (
            <>
              <span className="absolute top-1/2 left-5 -translate-y-1/2">
                <LightboxButton label="Previous photo" onClick={() => go(index - 1)}>
                  <Chevron direction="left" />
                </LightboxButton>
              </span>
              <span className="absolute top-1/2 right-5 -translate-y-1/2">
                <LightboxButton label="Next photo" onClick={() => go(index + 1)}>
                  <Chevron direction="right" />
                </LightboxButton>
              </span>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="flex justify-center gap-2 overflow-x-auto px-6 pt-2 pb-5">
            {gallery.map((photo, position) => (
              <button
                key={photo.src}
                type="button"
                aria-label={`Show photo ${position + 1}: ${photo.alt}`}
                aria-current={position === index}
                onClick={() => go(position)}
                className={`h-14 shrink-0 overflow-hidden border transition-[opacity,border-color] duration-300 ${
                  position === index
                    ? 'border-detail opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-90'
                }`}
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </dialog>
  );

  return (
    <>
      <div className={`relative border border-rule bg-raised p-1.5 ${className}`.trim()}>
        <Corners />
        {layout === 'mosaic' && photos.length > 1 ? (
          <div className="grid h-56 grid-cols-3 grid-rows-2 gap-1.5 md:h-60">
            {photos.map((photo, position) =>
              thumb(photo, position === 0 ? 'row-span-2' : 'col-span-2'),
            )}
          </div>
        ) : layout === 'row' ? (
          <div className="flex gap-1.5">
            {photos.map((photo) =>
              thumb(photo, 'min-w-0', true, {
                // Grow factors are scaled up so they never sum below 1, where flex
                // would leave part of the row empty.
                flex: `${(100 * photo.width) / photo.height} 1 0%`,
                aspectRatio: `${photo.width} / ${photo.height}`,
              }),
            )}
          </div>
        ) : lead ? (
          layout === 'natural' ? (
            thumb(lead, '', false)
          ) : (
            thumb(lead, 'h-56 md:h-60')
          )
        ) : null}
      </div>

      {mounted ? createPortal(viewer, document.body) : null}
    </>
  );
}

const subscribeNothing = () => () => {};
const onClient = () => true;
const onServer = () => false;

function LightboxButton({
  label,
  onClick,
  autoFocus = false,
  children,
}: {
  label: string;
  onClick: () => void;
  autoFocus?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      autoFocus={autoFocus}
      className="flex h-9 w-9 items-center justify-center border border-rule-strong text-fg transition-colors hover:border-detail hover:text-detail"
    >
      {children}
    </button>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path
        d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3">
      <path
        d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
      />
    </svg>
  );
}
