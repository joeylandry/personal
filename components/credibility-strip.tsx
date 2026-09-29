import { credibility } from '@/content';
import { ExternalLink } from './external-link';
import { Reveal } from './reveal';

/**
 * Three verified signals, each lit in its own accent. No invented numbers,
 * no logo wall.
 */
export function CredibilityStrip() {
  return (
    <section aria-label="Credentials" className="surface-ink rule-t bg-ink text-fg">
      <div className="wrap grid gap-4 py-10 md:grid-cols-3 md:gap-5 md:py-14">
        {credibility.map((signal, index) => (
          <Reveal key={signal.value} delay={index * 90} className={`accent-${signal.accent}`}>
            <div className="cred-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-raised p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="meta text-accent">{signal.kicker}</span>
                <span className="font-mono text-xs text-faint tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <p className="mt-8 text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] leading-none font-semibold tracking-tight whitespace-nowrap text-fg">
                {signal.href ? (
                  <ExternalLink href={signal.href} className="link hover:text-accent" arrow>
                    {signal.value}
                  </ExternalLink>
                ) : (
                  signal.value
                )}
              </p>

              <span
                aria-hidden="true"
                className="cred-bar mt-5 block h-0.5 rounded-full bg-accent"
              />

              <p className="mt-4 text-sm leading-snug text-muted">{signal.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
