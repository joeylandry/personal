import { credibility } from '@/content';
import { Reveal } from './reveal';

/**
 * Four verified signals, read as one line. No invented numbers, no logo wall.
 */
export function CredibilityStrip() {
  return (
    <section aria-label="Credentials" className="surface-ink rule-t bg-ink text-fg">
      <div className="wrap grid grid-cols-2 md:grid-cols-4">
        {credibility.map((signal, index) => (
          <Reveal
            key={signal.label}
            delay={index * 70}
            className={[
              'py-7 md:py-9',
              index % 2 === 1 ? 'border-l border-rule pl-5 md:pl-8' : 'pr-5 md:pr-8',
              index > 1 ? 'rule-t md:border-t-0' : '',
              index === 2 ? 'md:border-l md:border-rule md:pl-8' : '',
              index === 3 ? 'md:pl-8' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <p className="text-heading font-medium tracking-tight text-fg">{signal.value}</p>
            <p className="mt-2 text-sm leading-snug text-muted">{signal.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
