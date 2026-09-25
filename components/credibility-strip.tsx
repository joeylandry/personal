import { credibility } from '@/content';
import { Reveal } from './reveal';

/**
 * Verified signals, read as one line. No invented numbers, no logo wall.
 */
export function CredibilityStrip() {
  const count = credibility.length;

  return (
    <section aria-label="Credentials" className="surface-ink rule-t bg-ink text-fg">
      <div className="wrap grid grid-cols-2 lg:grid-cols-5">
        {credibility.map((signal, index) => {
          // In the two-column layout an odd final item spans the full row.
          const spansRow = count % 2 === 1 && index === count - 1;
          return (
            <Reveal
              key={signal.label}
              delay={index * 70}
              className={[
                'py-7 md:py-9',
                spansRow ? 'col-span-2 lg:col-span-1' : '',
                index % 2 === 1 ? 'border-l border-rule pl-5 md:pl-8' : 'pr-5 md:pr-8',
                index > 1 ? 'rule-t lg:border-t-0' : '',
                index > 0 ? 'lg:border-l lg:border-rule lg:pl-6' : '',
                'lg:pr-6',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <p className="text-heading font-medium tracking-tight text-fg">{signal.value}</p>
              <p className="mt-2 text-sm leading-snug text-muted">{signal.label}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
