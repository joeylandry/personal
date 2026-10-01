'use client';

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type Ref,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { ProjectImage } from '@/content';
import { LivePreview } from './live-preview';

/**
 * The recursion easter egg.
 *
 * This site lists itself as a project, so its live preview and "live site"
 * link point back here. Clicking either snapshots the page you are actually
 * looking at and loads it into the site's own preview box, whose preview box
 * then loads the page, and so on — a hall of mirrors — then zooms into it
 * forever, gets increasingly upset about it, and finally admits it was a joke.
 * Where there is no preview box on the page, the copies open in browser
 * windows stacked on top of the page instead.
 *
 * Without JavaScript the trigger is an ordinary link to `href`, which is the
 * honest version of the same joke: it takes you to the page you are already on.
 */
export function RecursionTrigger({
  children,
  href = '/work',
  className = '',
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const { start, overlay } = useRecursion();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, etc.) behave like a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const link = event.currentTarget;
    // The project's own preview box, when it sits beside this link.
    start(link, link.closest('article')?.querySelector<HTMLElement>('[data-recursion-portal]'));
  };

  return (
    <>
      <a href={href} onClick={onClick} aria-haspopup="dialog" className={className}>
        {children}
      </a>
      {overlay}
    </>
  );
}

/** This site's live preview of itself: clicking it loads the page into the box. */
export function RecursionPreview({ name, fallback }: { name: string; fallback: ProjectImage }) {
  const { start, overlay } = useRecursion();

  const open = (link: HTMLAnchorElement) =>
    start(link, link.querySelector<HTMLElement>('[data-recursion-portal]'));

  return (
    <>
      <LivePreview url="/" host="joeylandry.org" name={name} fallback={fallback} onOpen={open} />
      {overlay}
    </>
  );
}

function useRecursion() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  /** `trigger` gets focus back afterwards; `portal` is the box to nest into. */
  const start = (trigger: HTMLElement, portal?: HTMLElement | null) => {
    triggerRef.current = trigger;
    setSnapshot(takeSnapshot(portal ?? null));
  };

  const close = useCallback(() => {
    setSnapshot(null);
    triggerRef.current?.focus();
  }, []);

  const overlay = snapshot
    ? createPortal(<RecursionOverlay snapshot={snapshot} onClose={close} />, document.body)
    : null;

  return { start, overlay };
}

/* -------------------------------------------------------------------------- */

type Line = {
  at: number;
  text: string;
  /** Position within the viewport, in percent, and a tilt in degrees. */
  x: number;
  y: number;
  tilt: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
};

const SCRIPT: Line[] = [
  { at: 4000, text: 'recurse', x: 18, y: 20, tilt: -6, size: 'sm' },
  { at: 4700, text: 'recurse', x: 76, y: 30, tilt: 5, size: 'sm' },
  { at: 5400, text: 'recurse…', x: 28, y: 76, tilt: -3, size: 'md' },
  {
    at: 6200,
    text: 'I am going into an endless recursive cycle.',
    x: 50,
    y: 38,
    tilt: -2,
    size: 'lg',
  },
  { at: 7500, text: 'recurse recurse recurse', x: 70, y: 82, tilt: 7, size: 'md' },
  { at: 8300, text: 'you broke the site.', x: 36, y: 64, tilt: -8, size: 'lg' },
  { at: 9100, text: 'recurse recurse recurse recurse', x: 62, y: 14, tilt: 4, size: 'md' },
  { at: 9800, text: 'someone find the base case', x: 30, y: 30, tilt: 6, size: 'md' },
  { at: 10600, text: 'how do I STOPPP??!!', x: 50, y: 52, tilt: -4, size: 'xl' },
  { at: 11500, text: 'STOPPPPPPPP', x: 58, y: 78, tilt: 9, size: 'xl' },
];

/** Captions still on screen at once; older ones drop off. */
const VISIBLE_LINES = 6;

/*
 * Timeline, in ms. The first beat is meant to be believable. With a preview
 * box, the box starts loading as if you had followed its link, and the page
 * it loads is this one, whose box loads it again, and again. Without one, the
 * page just looks like it reloaded (a pure CSS flash, .recursion-reload, 1.1s),
 * then one browser window opens on top of it, then another inside that. Only
 * once every copy has loaded does it start to zoom and the captions, counter
 * and stop button appear.
 */
const FIRST_WINDOW = 1700;
const FIRST_LOAD = 750;
const LOAD_STEP = 420;
const ZOOM_AT = 3700;
const PANIC_AT = 8200;
const OVERFLOW_AT = 12000;
const COLLAPSE_AT = 12700;
const FACE_AT = 13300;

/** Each window of the page is the previous one at this scale. */
const RATIO = 0.62;
const DEPTH = 6;
/**
 * A preview box wider than this share of the screen (phones) nests too
 * slowly to read as a tunnel; the windows are used instead.
 */
const MAX_PORTAL = 0.7;
/** Nest until the innermost copy is about this share of the screen. */
const SMALLEST = 0.02;

const sizes: Record<Line['size'], string> = {
  sm: 'text-2xl md:text-4xl',
  md: 'text-3xl md:text-5xl',
  lg: 'text-3xl md:text-6xl max-w-[18ch]',
  xl: 'text-5xl md:text-8xl max-w-[12ch]',
};

type Stage = 'spiral' | 'collapse' | 'face';

function RecursionOverlay({ snapshot, onClose }: { snapshot: Snapshot; onClose: () => void }) {
  const geo = useMemo(() => geometry(snapshot), [snapshot]);
  const [elapsed, setElapsed] = useState(0);
  const [stage, setStage] = useState<Stage>('spiral');
  const tunnelRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Timeline. The zoom and wobble run as Web Animations so the compositor can
  // scale the already-painted pages; driving the transform from script makes
  // the browser repaint every copy of the site every frame. A single
  // clock then only has to steer their speed and drive the captions.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const began = performance.now();
    let frame = 0;
    let zoom: Animation | undefined;
    let wobble: Animation | undefined;

    const spin = tunnelRef.current;
    const tunnel = spin?.firstElementChild;
    if (!reduced && spin && tunnel) {
      // Scale geometrically, not linearly, so the zoom keeps a steady pace
      // through each level instead of lurching every time it wraps.
      const steps = 16;
      const frames = Array.from({ length: steps + 1 }, (_, i) => ({
        transform: `scale(${(1 / geo.ratio) ** (i / steps)})`,
      }));
      zoom = tunnel.animate(frames, { duration: 1000, iterations: Infinity, easing: 'linear' });
      zoom.pause();

      // A wobble that grows as it loses control: sampled, then handed off.
      const length = (COLLAPSE_AT - ZOOM_AT) / 1000;
      const keyframes = Array.from({ length: 49 }, (_, i) => {
        const z = (i / 48) * length;
        const angle = Math.sin(z * 2.2) * Math.min(z * 1.6, 12);
        return { transform: `rotate(${angle.toFixed(2)}deg)` };
      });
      wobble = spin.animate(keyframes, {
        duration: length * 1000,
        delay: ZOOM_AT,
        fill: 'both',
      });
    }

    const tick = (now: number) => {
      const t = now - began;
      if (zoom && t >= ZOOM_AT) {
        if (zoom.playState !== 'running') zoom.play();
        // Hold still while the copies load, then zoom faster and faster.
        const z = (t - ZOOM_AT) / 1000;
        zoom.updatePlaybackRate(0.3 + z * z * 0.07);
      }
      setElapsed(t);
      if (t < FACE_AT) frame = window.setTimeout(() => tick(performance.now()), 66);
    };
    // ~15 updates a second is plenty for captions and the counter.
    frame = window.setTimeout(() => tick(performance.now()), 0);

    const collapse = window.setTimeout(() => setStage('collapse'), COLLAPSE_AT);
    const face = window.setTimeout(() => setStage('face'), FACE_AT);

    return () => {
      window.clearTimeout(frame);
      window.clearTimeout(collapse);
      window.clearTimeout(face);
      zoom?.cancel();
      wobble?.cancel();
    };
  }, [geo]);

  // Modal housekeeping: lock scroll, Escape closes, focus stays inside.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        // Only ever one control on screen at a time.
        event.preventDefault();
        (closeRef.current ?? skipRef.current)?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (stage === 'face') closeRef.current?.focus();
  }, [stage]);

  const panicking = elapsed >= PANIC_AT && stage === 'spiral';
  const zooming = elapsed >= ZOOM_AT;
  const depth = Math.min(Math.floor(2 ** (Math.max(0, elapsed - ZOOM_AT) / 700)), 100_000);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Recursion"
      tabIndex={-1}
      className="outline-none surface-ink accent-gold fixed inset-0 z-[200] overflow-hidden bg-ink text-fg"
    >
      {stage !== 'face' ? (
        <>
          <div
            aria-hidden="true"
            className={`recursion-stage absolute inset-0 ${zooming ? 'recursion-vignette' : ''} ${
              stage === 'collapse' ? 'recursion-collapse' : ''
            }`}
          >
            <Tunnel ref={tunnelRef} snapshot={snapshot} geo={geo} />
          </div>

          {/* A plain navigation progress bar: the "it's just reloading" beat.
              With a preview box, the loading happens in the box instead. */}
          {geo.portal ? null : <div aria-hidden="true" className="recursion-nav-progress" />}

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ${panicking ? 'recursion-shake' : ''}`}
          >
            {SCRIPT.filter((line) => elapsed >= line.at)
              .slice(-VISIBLE_LINES)
              .map((line) => (
                <p
                  key={line.at}
                  className={`recursion-line absolute max-w-[92vw] font-mono leading-[1.05] font-medium tracking-tight text-fg ${sizes[line.size]}`}
                  style={
                    {
                      left: `${line.x}%`,
                      top: `${line.y}%`,
                      '--tilt': `${line.tilt}deg`,
                    } as CSSProperties
                  }
                >
                  <span className="bg-ink/90 px-2 box-decoration-clone">{line.text}</span>
                </p>
              ))}
          </div>

          {zooming ? (
            <p
              aria-hidden="true"
              className="recursion-fade-in meta absolute bottom-6 left-4 bg-ink/90 px-2 py-1 font-mono text-accent md:left-8"
            >
              {elapsed >= OVERFLOW_AT
                ? 'RangeError: Maximum call stack size exceeded'
                : `call stack · recurse() × ${depth.toLocaleString('en-US')}`}
            </p>
          ) : null}

          <p className="sr-only" aria-live="polite">
            The site loads itself inside itself, then starts zooming in, forever.
          </p>

          <button
            ref={skipRef}
            type="button"
            onClick={onClose}
            className={`meta absolute top-5 right-4 border border-rule-strong bg-ink px-3 py-2 text-fg transition-[color,border-color,opacity] duration-300 hover:border-accent hover:text-accent focus-visible:opacity-100 md:right-8 ${
              zooming ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Stop recursing
          </button>
        </>
      ) : (
        <div className="recursion-face absolute inset-0 grid place-items-center px-6 text-center">
          <div aria-live="polite">
            <p
              aria-hidden="true"
              className="font-mono text-[7rem] leading-none text-accent md:text-[10rem]"
            >
              <span className="inline-block rotate-90">:/</span>
            </p>
            <h2 className="mt-10 text-heading font-medium tracking-tight">
              You didn&apos;t break the site!
            </h2>
            <p className="mt-3 text-lead text-muted">It was just a joke..</p>
            <p className="mt-1 text-sm text-faint">(Sorry if it wasn&apos;t funny.)</p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="mt-10 inline-flex items-center justify-center bg-accent px-6 py-3.5 text-sm font-medium tracking-tight text-accent-fg transition-colors hover:bg-fg hover:text-bg"
            >
              Back to the (non-recursive) site
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type Snapshot = {
  /** The page's markup at the moment of the click, minus scripts and ids. */
  html: string;
  bodyClass: string;
  scrollY: number;
  width: number;
  height: number;
  /** Where the preview box's viewport sits on screen, if there is one. */
  portal: { x: number; y: number; width: number } | null;
};

/**
 * Copies the live page. The copies are inert, hidden from assistive
 * technology, and never hydrated — they are pictures of the site made of the
 * site, which is the whole joke.
 */
function takeSnapshot(portal: HTMLElement | null): Snapshot {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // For the copies to nest into the box exactly, the box has to have the
  // screen's shape. Reshape it just long enough to measure and copy it; the
  // overlay covers the page before the browser paints again.
  let frame: Snapshot['portal'] = null;
  let restore = () => {};
  if (portal && portal.getBoundingClientRect().width / width <= MAX_PORTAL) {
    const { aspectRatio } = portal.style;
    portal.style.aspectRatio = `${width} / ${height}`;
    restore = () => {
      portal.style.aspectRatio = aspectRatio;
    };
    const rect = portal.getBoundingClientRect();
    if (rect.width > 0) frame = { x: rect.left, y: rect.top, width: rect.width };
  }

  const clone = document.body.cloneNode(true) as HTMLElement;
  restore();
  clone.querySelectorAll('script, noscript, iframe').forEach((node) => node.remove());
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  // Anything still waiting to scroll into view would otherwise stay invisible.
  clone.querySelectorAll('.reveal').forEach((node) => node.setAttribute('data-shown', 'true'));
  return {
    html: clone.innerHTML,
    bodyClass: document.body.className,
    scrollY: window.scrollY,
    width,
    height,
    portal: frame,
  };
}

type Geometry = {
  w: number;
  h: number;
  /** Each nested page is its parent at this scale. */
  ratio: number;
  /** How many copies deep the tunnel goes. */
  depth: number;
  /** Nesting into the page's own preview box, rather than into windows. */
  portal: boolean;
  /** Height of a nested window's title bar, in the parent's pixels. */
  bar: number;
  /** Where the nested page's top-left corner sits inside its parent. */
  x: number;
  y: number;
};

function geometry({ width: w, height: h, portal }: Snapshot): Geometry {
  if (portal) {
    const ratio = portal.width / w;
    const depth = Math.min(Math.max(Math.ceil(Math.log(SMALLEST) / Math.log(ratio)), 3), 8);
    return { w, h, ratio, depth, portal: true, bar: 0, x: portal.x, y: portal.y };
  }
  const bar = Math.round(Math.max(26, h * 0.045));
  const x = (w * (1 - RATIO)) / 2;
  const y = (h - (bar + h * RATIO)) / 2 + bar;
  return { w, h, ratio: RATIO, depth: DEPTH, portal: false, bar, x, y };
}

/**
 * The page, containing a copy of the page, containing… Each level maps onto
 * the next by `p → (x, y) + ratio·p`, whose fixed point is `(x, y) / (1 −
 * ratio)`. Zooming by 1/ratio about that point lands exactly on the next
 * level, so the zoom can wrap forever without a seam.
 *
 * Memoised: the overlay re-renders every frame for its captions, and every
 * copy of the site should not be reconciled sixty times a second.
 */
const Tunnel = memo(function Tunnel({
  snapshot,
  geo,
  ref,
}: {
  snapshot: Snapshot;
  geo: Geometry;
  ref: Ref<HTMLDivElement>;
}) {
  const origin = `${geo.x / (1 - geo.ratio)}px ${geo.y / (1 - geo.ratio)}px`;

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0"
      style={{ width: geo.w, height: geo.h, transformOrigin: origin }}
    >
      <div
        className={`${geo.portal ? '' : 'recursion-reload '}will-change-transform`}
        style={{ width: geo.w, height: geo.h, transformOrigin: origin }}
      >
        <Level snapshot={snapshot} geo={geo} depth={0} />
      </div>
    </div>
  );
});

function Level({ snapshot, geo, depth }: { snapshot: Snapshot; geo: Geometry; depth: number }) {
  const pageRef = useRef<HTMLDivElement>(null);

  // Open every copy at the scroll position the visitor was actually at.
  useLayoutEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = snapshot.scrollY;
  }, [snapshot.scrollY]);

  const inner = (
    <div
      className="origin-top-left"
      style={{ width: geo.w, height: geo.h, transform: `scale(${geo.ratio})` }}
    >
      <Level snapshot={snapshot} geo={geo} depth={depth + 1} />
    </div>
  );

  return (
    <div className="recursion-level" style={{ width: geo.w, height: geo.h }}>
      <div
        ref={pageRef}
        inert
        className={`recursion-page ${snapshot.bodyClass}`}
        dangerouslySetInnerHTML={{ __html: snapshot.html }}
      />
      {depth >= geo.depth ? null : geo.portal ? (
        <div
          className="recursion-portal"
          style={
            {
              left: geo.x,
              top: geo.y,
              width: geo.w * geo.ratio,
              height: geo.h * geo.ratio,
              // Every copy mounts at once, so each time is absolute: this box
              // starts loading when its own page appears and finishes a step later.
              '--start': `${depth === 0 ? 0 : FIRST_LOAD + (depth - 1) * LOAD_STEP}ms`,
              '--ready': `${FIRST_LOAD + depth * LOAD_STEP}ms`,
            } as CSSProperties
          }
        >
          <span className="recursion-portal-progress" />
          <div className="recursion-portal-page">{inner}</div>
        </div>
      ) : (
        <div
          className="recursion-window"
          style={
            {
              left: geo.x,
              top: geo.y - geo.bar,
              width: geo.w * geo.ratio,
              // Every window mounts at once, so each delay is absolute, not relative.
              '--delay': `${FIRST_WINDOW + depth * LOAD_STEP}ms`,
            } as CSSProperties
          }
        >
          <div className="recursion-bar" style={{ height: geo.bar }}>
            <span className="recursion-dot" />
            <span className="recursion-dot" />
            <span className="recursion-dot" />
            <span className="recursion-spinner" />
            <span className="recursion-url">joeylandry.org</span>
            <span className="recursion-progress" />
          </div>
          <div
            className="relative overflow-hidden"
            style={{ width: geo.w * geo.ratio, height: geo.h * geo.ratio }}
          >
            {inner}
          </div>
        </div>
      )}
    </div>
  );
}
