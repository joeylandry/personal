import type { AnchorHTMLAttributes, ReactNode } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  /** Renders a small outbound glyph after the label. */
  arrow?: boolean;
};

/**
 * Anchor for off-site destinations. Always opens in a new tab with a safe rel,
 * and announces that it does so for screen-reader users.
 */
export function ExternalLink({ href, children, arrow = false, className, ...rest }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
      {arrow ? <OutboundArrow /> : null}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** The small outbound glyph, also used by links that only look outbound. */
export function OutboundArrow() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      fill="none"
      aria-hidden="true"
      className="ml-1.5 inline-block translate-y-[-1px]"
    >
      <path
        d="M3 9 9 3M4.25 3H9v4.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}
