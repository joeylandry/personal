import type { ReactNode } from 'react';
import { Reveal } from './reveal';

/**
 * A full-bleed band of the page. Surface choice drives the entire color
 * context inside it, which is how the page alternates between midnight and
 * paper without every section becoming the same dark rectangle.
 */
export function Section({
  id,
  surface = 'ink',
  accent,
  children,
  className = '',
  divider = true,
  labelledBy,
}: {
  id?: string;
  surface?: 'ink' | 'paper';
  /**
   * Project accent for this band.
   *
   * It must sit on the same element as the surface class, not on an ancestor:
   * each surface declares its own `--accent`, so an accent applied further up
   * the tree would be overwritten the moment a surface element intervened.
   */
  accent?: 'sea' | 'amber' | 'gold';
  children: ReactNode;
  className?: string;
  /** Hairline at the top edge. */
  divider?: boolean;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        surface === 'ink' ? 'surface-ink' : 'surface-paper',
        accent ? `accent-${accent}` : '',
        'relative bg-bg text-fg',
        divider ? 'rule-t' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}

/**
 * Standard section masthead: a mono label, an editorial title, and an optional
 * lead paragraph, laid out asymmetrically against the grid.
 */
export function SectionHeading({
  label,
  title,
  lead,
  id,
  aside,
}: {
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  /** Right-hand column content, e.g. a link or a count. */
  aside?: ReactNode;
}) {
  return (
    <header className="grid gap-x-10 gap-y-6 md:grid-cols-12">
      <Reveal className="md:col-span-8">
        <p className="meta section-label">{label}</p>
        <h2 id={id} className="mt-5 text-title font-medium text-fg">
          {title}
        </h2>
        {lead ? <p className="measure mt-5 text-lead text-muted">{lead}</p> : null}
      </Reveal>
      {aside ? (
        <Reveal delay={80} className="flex items-end md:col-span-4 md:justify-end md:pb-1.5">
          {aside}
        </Reveal>
      ) : null}
    </header>
  );
}
