import { profile } from '@/content';
import { Cta } from './cta';
import { MountainScene } from './mountain-scene';
import { Reveal } from './reveal';

export function Hero() {
  const { hero } = profile;

  return (
    <section
      aria-labelledby="hero-heading"
      className="surface-ink relative isolate overflow-hidden bg-ink text-fg"
    >
      {/* Decorative field: fine grid above, night in the White Mountains below. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-field absolute inset-0 opacity-50" />
        <MountainScene className="absolute inset-x-0 bottom-0 h-[62%] w-full text-fog md:h-[78%]" />
      </div>

      <div className="wrap grid gap-x-10 gap-y-14 pt-14 pb-16 md:grid-cols-12 md:pt-16 md:pb-24 lg:pt-20">
        <div className="md:col-span-8">
          <Reveal>
            {/* An eyebrow over the headline, not a rival to it. The name is
                already in the header, so small screens drop it and keep the
                role, which is the part that positions him. */}
            <p className="meta section-label text-[0.8125rem] tracking-[0.12em] text-accent sm:text-sm md:whitespace-nowrap">
              <span className="text-muted">
                <span className="hidden whitespace-nowrap text-fg sm:inline">{profile.name}</span>
                <span className="hidden sm:inline"> · </span>
                <span className="sm:whitespace-nowrap">
                  Software Engineer &amp; Independent Builder
                </span>
              </span>
            </p>
          </Reveal>

          <h1 id="hero-heading" className="mt-6 text-display font-medium md:mt-8">
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

          <Reveal delay={350}>
            <p className="measure mt-8 text-lead text-muted">{hero.support}</p>
          </Reveal>

          <Reveal delay={430}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Cta href={hero.primaryCta.href}>{hero.primaryCta.label}</Cta>
              <Cta href={hero.secondaryCta.href} variant="outline" arrow={false} external>
                {hero.secondaryCta.label}
              </Cta>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
