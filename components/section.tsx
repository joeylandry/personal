import type { ReactNode } from 'react';

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
  level = 2,
}: {
  /** Mono label above the title. Omit to lead with the title alone. */
  label?: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  /** Right-hand column content, e.g. a link or a count. */
  aside?: ReactNode;
  /** 1 when the section opens its own page. */
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <header className="grid gap-x-10 gap-y-6 md:grid-cols-12">
      <div className="md:col-span-8">
        {label ? <p className="meta section-label">{label}</p> : null}
        <Heading id={id} className={`${label ? 'mt-5 ' : ''}text-title font-medium text-fg`}>
          {title}
        </Heading>
        {lead ? <p className="measure mt-5 text-lead text-muted">{lead}</p> : null}
      </div>
      {aside ? (
        <div className="flex items-end md:col-span-4 md:justify-end md:pb-1.5">{aside}</div>
      ) : null}
    </header>
  );
}
