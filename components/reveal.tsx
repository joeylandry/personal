'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * Scroll-triggered reveal.
 *
 * The hidden state is applied by CSS only when `[data-js="on"]` is present on
 * <html>, so content is fully readable without JavaScript, and reduced-motion
 * users get the final state immediately from the stylesheet.
 *
 * The shown flag is written straight to the DOM rather than held in React
 * state: it drives a CSS transition and nothing else renders from it, so a
 * state update here would only cost a re-render.
 *
 * `immediate` plays the reveal as soon as the page loads instead of waiting for
 * the element to scroll into view, so a staggered sequence (the home hero)
 * runs start to finish in one go.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  immediate = false,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger in milliseconds. Keep small — this is punctuation, not a show. */
  delay?: number;
  className?: string;
  /** Reveal on page load rather than on scroll. */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute('data-shown', 'true');

    if (immediate) {
      // Wait a frame so the hidden state is painted and the transition runs.
      const frame = requestAnimationFrame(show);
      return () => cancelAnimationFrame(frame);
    }

    if (typeof IntersectionObserver === 'undefined') {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-shown="false"
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
