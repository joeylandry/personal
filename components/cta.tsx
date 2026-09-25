import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink } from './external-link';

const base =
  'group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-medium tracking-tight transition-colors duration-200 focus-visible:outline-2';

const variants = {
  /** Filled accent — one per view, reserved for the primary action.
   *  Both the fill and its text flip per surface so the pair always clears AA. */
  solid: 'bg-accent text-accent-fg hover:bg-fg hover:text-bg',
  /** Hairline outline for secondary actions. */
  outline: 'border border-rule-strong text-fg hover:border-accent hover:text-accent',
} as const;

type Variant = keyof typeof variants;

/** CTA styling for elements that are not a plain link, e.g. the recursion trigger. */
export function ctaClassName(variant: Variant = 'solid', className = ''): string {
  return `${base} ${variants[variant]} ${className}`.trim();
}

function Inner({ children, arrow }: { children: ReactNode; arrow: boolean }) {
  return (
    <>
      {children}
      {arrow ? (
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1"
        >
          <path
            d="M2 8h11M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      ) : null}
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
