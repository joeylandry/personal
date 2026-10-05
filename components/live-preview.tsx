'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { ProjectImage } from '@/content';

/** Desktop viewport the thumbnail renders the live site at before scaling down. */
const VIEWPORT = { width: 1440, height: 900 };

const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups';

/**
 * A live, scaled-down view of a project's production site. The static cover
 * shows until the iframe has loaded (or if the site refuses to be framed), and
 * clicking opens the site in a new tab — or, when `onOpen` is given, hands the
 * click to that instead.
 */
export function LivePreview({
  url,
  host,
  name,
  fallback,
  onOpen,
}: {
  url: string;
  host: string;
  name: string;
  fallback: ProjectImage;
  /** Replaces the new-tab link for plain clicks (modified clicks still open a tab). */
  onOpen?: (link: HTMLAnchorElement) => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Scale the desktop-sized iframe to fit the card, and only load it on approach.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    // A page already inside a preview keeps its own previews still, so this
    // site's thumbnail of itself stops at one level instead of nesting forever.
    if (window.self !== window.top) return;
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

  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onOpen) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(event.currentTarget);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={open}
      className="group/preview block w-full border border-rule bg-raised text-left transition-colors hover:border-detail focus-visible:border-detail"
      aria-label={`Open ${name} (${host})`}
    >
      <div
        ref={viewportRef}
        aria-hidden="true"
        data-recursion-portal
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
            scrolling="no"
            inert
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
        {/* Sits over the iframe so wheel and touch gestures scroll the page,
            never the thumbnail (Safari ignores pointer-events on iframes). */}
        <span aria-hidden="true" className="absolute inset-0" />
        <span className="meta pointer-events-none absolute right-3 bottom-3 bg-ink/86 px-2.5 py-1.5 text-fog opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/preview:opacity-100 group-focus-visible/preview:opacity-100">
          Click to open
        </span>
      </div>
    </a>
  );
}
