'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * The recursion easter egg.
 *
 * This site lists itself as a project, so its "live site" link points back
 * here. Clicking it (or the word "recursive" in its tagline) plays a short,
 * deliberately overdramatic infinite zoom before admitting it was a joke.
 *
 * Without JavaScript the trigger is an ordinary link to `href`, which is the
 * honest version of the same joke: it takes you to the page you are already on.
 */
export function RecursionTrigger({
  children,
  href = '/',
  className = '',
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const start = (event: MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new tab, etc.) behave like a normal link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <a ref={triggerRef} href={href} onClick={start} aria-haspopup="dialog" className={className}>
        {children}
      </a>
      {open ? createPortal(<RecursionOverlay onClose={close} />, document.body) : null}
    </>
  );
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
  { at: 150, text: 'recurse', x: 18, y: 20, tilt: -6, size: 'sm' },
  { at: 650, text: 'recurse', x: 74, y: 28, tilt: 5, size: 'sm' },
  { at: 1100, text: 'recurse…', x: 30, y: 74, tilt: -3, size: 'md' },
  {
    at: 1600,
    text: 'I am going into an endless recursive cycle.',
    x: 50,
    y: 40,
    tilt: -2,
    size: 'lg',
  },
  { at: 2500, text: 'recurse recurse recurse', x: 70, y: 80, tilt: 7, size: 'md' },
  { at: 2950, text: 'you broke the site.', x: 38, y: 67, tilt: -8, size: 'lg' },
  { at: 3350, text: 'recurse recurse recurse recurse', x: 62, y: 14, tilt: 4, size: 'md' },
  { at: 3750, text: 'how do I STOPPP??!!', x: 50, y: 52, tilt: -4, size: 'xl' },
];

const PANIC_AT = 2900;
const OVERFLOW_AT = 4400;
const COLLAPSE_AT = 4900;
const FACE_AT = 5500;

/** Each nested window is the previous one at this scale. */
const RATIO = 0.8;
const DEPTH = 18;

const sizes: Record<Line['size'], string> = {
  sm: 'text-2xl md:text-4xl',
  md: 'text-3xl md:text-5xl',
  lg: 'text-3xl md:text-6xl max-w-[18ch]',
  xl: 'text-5xl md:text-8xl max-w-[12ch]',
};

type Stage = 'spiral' | 'collapse' | 'face';

function RecursionOverlay({ onClose }: { onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [stage, setStage] = useState<Stage>('spiral');
  const tunnelRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Timeline: a single clock drives the captions, the stack counter and the
  // zoom, so everything stays in step.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const began = performance.now();
    let phase = 0;
    let last = began;
    let frame = 0;

    const tick = (now: number) => {
      const t = now - began;
      const dt = (now - last) / 1000;
      last = now;

      // Zoom speeds up the longer it runs, like it is losing control.
      const speed = 0.7 + (t / 1000) ** 2 * 0.55;
      phase += dt * speed;

      const node = tunnelRef.current;
      if (node && !reduced) {
        const scale = (1 / RATIO) ** (phase % 1);
        const spin = Math.sin(t / 420) * Math.min(t / 260, 14);
        node.style.transform = `scale(${scale}) rotate(${spin}deg)`;
      }

      setElapsed(t);
      if (t < FACE_AT) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const collapse = window.setTimeout(() => setStage('collapse'), COLLAPSE_AT);
    const face = window.setTimeout(() => setStage('face'), FACE_AT);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(collapse);
      window.clearTimeout(face);
    };
  }, []);

  // Modal housekeeping: lock scroll, Escape closes, focus stays inside.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    skipRef.current?.focus();

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
  const depth = Math.min(Math.floor(2 ** (elapsed / 330)), 10_000);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recursion"
      className="surface-ink accent-gold fixed inset-0 z-[200] overflow-hidden bg-ink text-fg"
    >
      {stage !== 'face' ? (
        <>
          <div
            aria-hidden="true"
            className={`recursion-stage absolute inset-0 ${
              stage === 'collapse' ? 'recursion-collapse' : ''
            }`}
          >
            <div className="recursion-frame">
              <div ref={tunnelRef} className="recursion-tunnel">
                <Window depth={0} />
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 ${panicking ? 'recursion-shake' : ''}`}
          >
            {SCRIPT.filter((line) => elapsed >= line.at).map((line) => (
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
                <span className="bg-ink/80 px-2 box-decoration-clone">{line.text}</span>
              </p>
            ))}
          </div>

          <p
            aria-hidden="true"
            className="meta absolute bottom-6 left-4 font-mono text-accent md:left-8"
          >
            {elapsed >= OVERFLOW_AT
              ? 'RangeError: Maximum call stack size exceeded'
              : `call stack · recurse() × ${depth.toLocaleString('en-US')}`}
          </p>

          <p className="sr-only" aria-live="polite">
            The site starts zooming into itself, forever.
          </p>

          <button
            ref={skipRef}
            type="button"
            onClick={onClose}
            className="meta absolute top-5 right-4 border border-rule-strong bg-ink px-3 py-2 text-fg transition-colors hover:border-accent hover:text-accent md:right-8"
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

/**
 * A browser window showing this site, which contains a browser window… Every
 * level is styled identically, which is what lets the zoom loop seamlessly.
 * Geometry lives in globals.css and must agree with RATIO.
 */
function Window({ depth }: { depth: number }) {
  return (
    <div className="recursion-window">
      <div className="recursion-bar">
        <span />
        <span />
        <span />
        <em>joeylandry.com</em>
      </div>
      {depth < DEPTH ? (
        <div className="recursion-child">
          <Window depth={depth + 1} />
        </div>
      ) : null}
    </div>
  );
}
