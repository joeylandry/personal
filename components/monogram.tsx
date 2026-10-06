/**
 * The JL monogram.
 *
 * Solid grotesk letters on a 40×30 grid: shared cap height and baseline, one
 * stroke weight. The J's bowl dips 0.6 below the L's foot: a round letter that
 * only touches the baseline at one point reads as floating, so it overshoots,
 * as round letters do in any typeface. A sea-colored hairline horizon sits
 * below the baseline, the coastal half of "Midnight Coastal Lab".
 * Drawn rather than imported so it inherits color from its surface.
 */
export const MONOGRAM_J = 'M13.5 1h4v15a7 7.6 0 0 1-14 0h4a3 3.6 0 0 0 6 0z';
export const MONOGRAM_L = 'M22.5 1h4v18h10v4h-14z';

export function Monogram({
  className,
  horizon = true,
  title,
}: {
  className?: string;
  /** The sea horizon beneath the letters. */
  horizon?: boolean;
  /** Accessible name. Omit inside a labelled link to avoid double-reading. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 30"
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
          d="M3.5 27.5h33"
          stroke="var(--accent-sea)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <path d={MONOGRAM_J} fill="currentColor" />
      <path d={MONOGRAM_L} fill="currentColor" />
    </svg>
  );
}
