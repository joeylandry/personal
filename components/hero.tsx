import { profile } from '@/content';
import { Coastline } from './coastline';
import { Cta } from './cta';
import { Reveal } from './reveal';

const specs = [
  { key: 'Location', value: 'New Hampshire' },
  { key: 'Origin', value: 'Nyes Neck · Cape Cod' },
  { key: 'Now', value: 'Associate SWE, Fidelity' },
  { key: 'After dark', value: 'Independent products' },
];

export function Hero() {
  const { hero } = profile;

  return (
    <section
      aria-labelledby="hero-heading"
      className="surface-ink relative isolate overflow-hidden bg-ink text-fg"
    >
      {/* Decorative field: fine grid above, contour survey below. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-field absolute inset-0 opacity-70" />
        <Coastline
          className="absolute -right-[14%] -bottom-[6%] h-[68%] w-[130%] text-fog sm:-right-[6%] sm:w-[92%]"
          opacity={0.38}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="wrap grid gap-x-10 gap-y-14 pt-24 pb-16 md:grid-cols-12 md:pt-32 md:pb-24 lg:pt-40">
        <div className="md:col-span-8">
          <Reveal>
            {/* The name is already in the header, so small screens drop it
                and keep the role, which is the part that positions him. */}
            <p className="meta section-label text-sm text-accent sm:text-base">
              <span className="text-muted">
                <span className="hidden sm:inline">{profile.name} · </span>
                Software Engineer &amp; Independent Builder
              </span>
            </p>
          </Reveal>

          <h1 id="hero-heading" className="mt-7 text-display font-medium">
            {hero.headline.map((line, index) => (
              <Reveal as="span" key={line} delay={index * 90} className="block">
                {index === hero.headline.length - 1 ? (
                  <>
                    {line.replace(/\.$/, '')}
                    <span className="text-accent">.</span>
                  </>
                ) : (
                  line
                )}
              </Reveal>
            ))}
          </h1>

          <Reveal delay={260}>
            <p className="measure mt-8 text-lead text-muted">{hero.support}</p>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Cta href={hero.primaryCta.href}>{hero.primaryCta.label}</Cta>
              <Cta href={hero.secondaryCta.href} variant="outline" arrow={false} external>
                {hero.secondaryCta.label}
              </Cta>
            </div>
          </Reveal>
        </div>

        {/* Spec rail — the lab half of the identity. */}
        <Reveal
          delay={420}
          className="md:col-span-4 md:self-end md:border-l md:border-rule md:pl-8"
        >
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-1 md:gap-y-4">
            {specs.map((spec) => (
              <div key={spec.key} className="rule-t pt-3 md:border-t-0 md:pt-0">
                <dt className="meta text-faint">{spec.key}</dt>
                <dd className="mt-1.5 text-sm text-fg">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <div className="wrap rule-t flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5">
        <p className="meta flex items-center gap-2.5 text-muted">
          <span
            aria-hidden="true"
            className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-accent"
          />
          {profile.statusLine}
        </p>
        <p className="meta hidden text-faint sm:block">
          Scroll <span aria-hidden="true">↓</span>
        </p>
      </div>
    </section>
  );
}
