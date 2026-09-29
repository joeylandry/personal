/** The Nyes Neck burgee: navy over red, a white N on each half. Decorative. */
export function Pennant({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 86 50" aria-hidden="true" focusable="false" className={className}>
      <path d="M0 0L86 25H0Z" fill="#35355a" />
      <path d="M0 25H86L0 50Z" fill="#e8452c" />
      <path d="M4 21V4h3l6 10V4h3v17h-3L7 11v10ZM4 46V29h3l6 10V29h3v17h-3L7 36v10Z" fill="#fff" />
    </svg>
  );
}
