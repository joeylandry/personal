import { profile } from '@/content';
import { Coastline } from './coastline';
import { Cta } from './cta';
import { Reveal } from './reveal';

export function Hero() {
  const { hero } = profile;

  return (
    <section
      aria-labelledby="hero-heading"
      className="surface-ink relative isolate overflow-hidden bg-ink text-fg"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Coastline
          className="absolute -right-[14%] -bottom-[6%] h-[68%] w-[130%] text-fog sm:-right-[6%] sm:w-[92%]"
          opacity={0.3}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="wrap pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28">
        <Reveal className="max-w-4xl">
          <h1 id="hero-heading" className="text-display font-medium">
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="measure mt-8 text-lead text-muted">{hero.support}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Cta href={hero.primaryCta.href}>{hero.primaryCta.label}</Cta>
            <Cta href={hero.secondaryCta.href} variant="outline" arrow={false} external>
              {hero.secondaryCta.label}
            </Cta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
