import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink } from './external-link';

const base =
  'group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium tracking-tight transition-colors duration-200 focus-visible:outline-2';

const variants = {
  /** Filled accent — one per view, reserved for the primary action.
   *  Both the fill and its text flip per surface so the pair always clears AA. */
  solid:
    'border border-transparent bg-accent text-accent-fg hover:bg-action-hover hover:text-action-hover-fg',
  /** The outline in sea, warming to amber on hover: the solid action's
   *  opposite at rest and on hover, while staying clear. */
  sea: 'border border-sea text-sea hover:border-amber hover:text-amber',
  /** Hairline outline for secondary actions. */
  outline: 'border border-rule-strong text-fg hover:border-detail hover:text-accent',
} as const;

type Variant = keyof typeof variants;

/** CTA styling for elements that are not a plain link, e.g. the recursion trigger. */
export function ctaClassName(variant: Variant = 'solid', className = ''): string {
  return `${base} ${variants[variant]} ${className}`.trim();
}

/** The CTA arrow; nudges right when its `group` ancestor is hovered. */
export function CtaArrow({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Inner({ children, arrow }: { children: ReactNode; arrow: boolean }) {
  return (
    <>
      {children}
      {arrow ? <CtaArrow /> : null}
    </>
  );
}

export function Cta({
  href,
  children,
  variant = 'solid',
  arrow = true,
  external = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  external?: boolean;
  className?: string;
}) {
  const classes = ctaClassName(variant, className);

  if (external || /^https?:/.test(href)) {
    return (
      <ExternalLink href={href} className={classes}>
        <Inner arrow={arrow}>{children}</Inner>
      </ExternalLink>
    );
  }

  return (
    <Link href={href} className={classes}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}
