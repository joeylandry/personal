/** Small inline icons. Decorative by default — labels live on the control. */

export function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M3.6 1.6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM2.2 6h2.8v8H2.2V6Zm4.6 0h2.7v1.1h.04c.38-.68 1.3-1.4 2.68-1.4 2.86 0 3.39 1.78 3.39 4.1V14h-2.83v-3.64c0-.87-.02-1.98-1.25-1.98-1.25 0-1.44.93-1.44 1.92V14H6.8V6Z" />
    </svg>
  );
}

export function MailGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" stroke="currentColor" strokeWidth="1.3" />
      <path d="m1.6 3.6 6.4 5 6.4-5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
