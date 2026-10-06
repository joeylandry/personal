/** The Nyes Neck logo: a navy-over-red pennant with a white N on each half. Decorative. */
export function Pennant({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1609 951" aria-hidden="true" focusable="false" className={className}>
      <path d="M0 0L1609 462H0Z" fill="#032654" />
      <path d="M0 462H1609L0 951Z" fill="#e80000" />
      <path
        d="M56 124H107L240 301V125H297V415H250L111 231V415H56ZM56 498H107L240 675V499H297V795H252L111 606V795H56Z"
        fill="#fff"
      />
    </svg>
  );
}
