'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import type { ProjectImage } from '@/content';
import { Corners } from './frame';

/**
 * Desktop viewport the thumbnail renders the live site at before scaling down.
 * The iframe is exactly this size: sites size heroes in viewport units, so a
 * taller frame blows them up instead of revealing more of the page.
 */
const VIEWPORT = { width: 1440, height: 900 };

const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups';

/**
 * A live, scaled-down view of a project's production site, with no static
 * cover in front of it. It loads before it scrolls into view, so the site is
 * already there when you reach it. Clicking opens the site in a new tab — or,
 * when `onOpen` is given, hands the click to that instead.
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
  // A page already inside a preview keeps its own previews still, so this
  // site's thumbnail of itself stops at one level instead of nesting forever.
  const nested = useSyncExternalStore(noop, isNested, () => false);

  // Scale the desktop-sized iframe to fit the card, and load it well ahead of
  // time: once the page itself has settled, or sooner if the card is near.
  // By the time it scrolls into view the site has already drawn.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    if (nested) return;
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
      { rootMargin: '300% 0px' },
    );
    reveal.observe(node);
    const preload = () => setVisible(true);
    let idle = 0;
    const settle = () => {
      idle = window.setTimeout(preload, 500);
    };
    if (document.readyState === 'complete') settle();
    else window.addEventListener('load', settle, { once: true });
    return () => {
      resize.disconnect();
      reveal.disconnect();
      window.removeEventListener('load', settle);
      window.clearTimeout(idle);
    };
  }, [nested]);

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
      className="group/preview relative block w-full border border-rule bg-raised text-left transition-colors hover:border-detail focus-visible:border-detail"
      aria-label={`Open ${name} (${host})`}
    >
      <Corners className="z-10 transition-[width,height,border-color] duration-500 ease-out group-hover/preview:h-5 group-hover/preview:w-5 group-hover/preview:border-detail group-focus-visible/preview:h-5 group-focus-visible/preview:w-5 group-focus-visible/preview:border-detail" />
      <div
        ref={viewportRef}
        aria-hidden="true"
        data-recursion-portal
        className="relative overflow-hidden"
        style={{ aspectRatio: `${VIEWPORT.width} / ${VIEWPORT.height}` }}
      >
        {nested ? (
          <Image
            src={fallback.src}
            alt=""
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-top"
          />
        ) : null}
        {visible && scale > 0 ? (
          <iframe
            src={url}
            title={`${name}, live site`}
            tabIndex={-1}
            aria-hidden="true"
            scrolling="no"
            inert
            sandbox={SANDBOX}
            // A beat past the load event, for sites that draw after it.
            onLoad={() => window.setTimeout(() => setLoaded(true), 200)}
            className={[
              'preview-page pointer-events-none absolute top-0 left-0 origin-top-left border-0',
              // Kept out of sight until the site has drawn, so there is never
              // a blank white frame — just the card surface, then the site.
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            style={
              {
                width: VIEWPORT.width,
                height: VIEWPORT.height,
                '--preview-scale': scale,
              } as CSSProperties
            }
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

const noop = () => () => {};
const isNested = () => window.self !== window.top;
