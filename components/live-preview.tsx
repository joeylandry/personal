'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ProjectImage } from '@/content';

/** Desktop viewport the thumbnail renders the live site at before scaling down. */
const VIEWPORT = { width: 1440, height: 900 };

const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups';

function BrowserBar({ host, children }: { host: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-rule bg-ink-raised px-3 py-2">
      <span aria-hidden="true" className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </span>
      <span className="meta min-w-0 flex-1 truncate rounded-sm bg-ink px-3 py-1 text-center text-[0.6875rem] normal-case tracking-normal text-fog">
        {host}
      </span>
      {children}
    </div>
  );
}

/**
 * A live, scaled-down view of a project's production site. The static cover
 * shows until the iframe has loaded (or if the site refuses to be framed), and
 * clicking opens the site full size in a browser-style window.
 */
export function LivePreview({
  url,
  host,
  name,
  fallback,
}: {
  url: string;
  host: string;
  name: string;
  fallback: ProjectImage;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  // Scale the desktop-sized iframe to fit the card, and only load it on approach.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const resize = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / VIEWPORT.width);
    });
    resize.observe(node);
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          reveal.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    reveal.observe(node);
    return () => {
      resize.disconnect();
      reveal.disconnect();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/preview block w-full cursor-zoom-in border border-rule bg-raised text-left transition-colors hover:border-accent focus-visible:border-accent"
        aria-label={`Open a live preview of ${name} (${host})`}
      >
        <BrowserBar host={host} />
        <div
          ref={viewportRef}
          aria-hidden="true"
          className="relative overflow-hidden"
          style={{ aspectRatio: `${VIEWPORT.width} / ${VIEWPORT.height}` }}
        >
          <Image
            src={fallback.src}
            alt=""
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-top"
          />
          {visible && scale > 0 ? (
            <iframe
              src={url}
              title={`${name} — live site`}
              tabIndex={-1}
              aria-hidden="true"
              loading="lazy"
              sandbox={SANDBOX}
              onLoad={() => setLoaded(true)}
              className={[
                'pointer-events-none absolute top-0 left-0 origin-top-left border-0 bg-white transition-opacity duration-500',
                loaded ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              style={{
                width: VIEWPORT.width,
                height: VIEWPORT.height,
                transform: `scale(${scale})`,
              }}
            />
          ) : null}
          <span className="meta pointer-events-none absolute right-3 bottom-3 bg-ink/86 px-2.5 py-1.5 text-fog opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100">
            Live · click to open
          </span>
        </div>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (event.target === event.currentTarget) setOpen(false);
        }}
        aria-label={`${name} — live site`}
        className="surface-ink m-auto h-[88vh] w-[min(1400px,94vw)] max-w-none overflow-hidden border border-rule bg-ink p-0 text-fg backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
      >
        {open ? (
          <div className="flex h-full flex-col">
            <BrowserBar host={host}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="meta link shrink-0 text-[0.6875rem] text-fog hover:text-fg"
              >
                New tab ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="meta shrink-0 px-1 text-[0.6875rem] text-fog hover:text-fg"
                aria-label="Close preview"
              >
                Close ✕
              </button>
            </BrowserBar>
            <iframe
              src={url}
              title={`${name} — live site`}
              sandbox={SANDBOX}
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
