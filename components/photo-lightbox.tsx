'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { StoryPhoto } from '@/content';
import { Corners } from './frame';

/**
 * Photo thumbnails that open full size.
 *
 * Thumbnails stay small and cropped so a chapter reads at a glance; the
 * uncropped photo opens in a native modal <dialog>, which brings the focus
 * trap, Esc to close and focus return for free. Each thumbnail is a real link
 * to the image file, so without JavaScript it still opens the full photo.
 *
 * Layouts:
 * - `single`: one cropped thumbnail at a fixed height.
 * - `mosaic`: the first photo as a tall tile, the rest stacked beside it.
 * - `natural`: one photo at its own aspect ratio, never cropped.
 */
export function PhotoLightbox({
  photos,
  layout = 'single',
  sizes,
  className = '',
}: {
  photos: StoryPhoto[];
  layout?: 'single' | 'mosaic' | 'natural';
  sizes: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const captionId = useId();
  const count = photos.length;
  const current = photos[index] ?? photos[0];

  const open = (event: MouseEvent<HTMLAnchorElement>, next: number) => {
    // Let modified clicks (new tab, save link) behave like any link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setIndex(next);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => dialogRef.current?.close(), []);
  const step = useCallback(
    (delta: number) => setIndex((value) => (value + delta + count) % count),
    [count],
  );

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
  }, []);

  if (!current) return null;

  const thumb = (photo: StoryPhoto, position: number, tileClass: string, fit = true) => (
    <a
      key={photo.src}
      href={photo.src}
      onClick={(event) => open(event, position)}
      aria-haspopup="dialog"
      aria-label={`View full size: ${photo.alt}`}
      className={`group/thumb relative block overflow-hidden bg-raised ${tileClass}`}
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
        className="meta absolute right-2 bottom-2 flex items-center gap-1.5 bg-[rgb(7_16_24/0.72)] px-2 py-1 text-[0.65rem] text-[#f7f9fb] opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100"
      >
        <ExpandIcon />
        View
      </span>
    </a>
  );

  return (
    <>
      <div className={`relative border border-rule bg-raised p-1.5 ${className}`.trim()}>
        <Corners />
        {layout === 'mosaic' && count > 1 ? (
          <div className="grid h-56 grid-cols-3 grid-rows-2 gap-1.5 md:h-60">
            {photos.map((photo, position) =>
              thumb(photo, position, position === 0 ? 'row-span-2' : 'col-span-2'),
            )}
          </div>
        ) : layout === 'natural' ? (
          thumb(current, 0, '', false)
        ) : (
          thumb(current, 0, 'h-56 md:h-60')
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={captionId}
        className="giving-lightbox surface-ink"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog itself.
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (count < 2) return;
          if (event.key === 'ArrowRight') step(1);
          if (event.key === 'ArrowLeft') step(-1);
        }}
      >
        <figure className="flex max-h-full flex-col items-center">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full border border-rule object-contain"
          />
          <figcaption
            id={captionId}
            className="mt-4 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 text-fg"
          >
            <span className="meta text-muted">
              {count > 1 ? `${index + 1} / ${count} · ` : ''}
              {current.caption}
            </span>
            <span className="flex items-center gap-2">
              {count > 1 ? (
                <>
                  <LightboxButton label="Previous photo" onClick={() => step(-1)}>
                    <Chevron direction="left" />
                  </LightboxButton>
                  <LightboxButton label="Next photo" onClick={() => step(1)}>
                    <Chevron direction="right" />
                  </LightboxButton>
                </>
              ) : null}
              <LightboxButton label="Close" onClick={close} autoFocus>
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </LightboxButton>
            </span>
          </figcaption>
        </figure>
      </dialog>
    </>
  );
}

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
