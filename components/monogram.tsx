/**
 * The JL monogram.
 *
 * Two grotesk strokes on a shared baseline, with the L's foot continuing past
 * the mark as a horizon line — the coastal half of "Midnight Coastal Lab".
 * Drawn rather than imported so it inherits color from its surface.
 */
export function Monogram({
  className,
  horizon = true,
  title,
}: {
  className?: string;
  /** The accent horizon extending from the L. */
  horizon?: boolean;
  /** Accessible name. Omit inside a labelled link to avoid double-reading. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 44 38"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {horizon ? (
        <path
          d="M0 30.25h44"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <path
        d="M17 6v16.5a7 7 0 0 1-14 0"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="square"
      />
      <path
        d="M27.5 6v24.25H41"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
