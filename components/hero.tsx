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
      {/* Scenic backdrop: a dawn sky, sunrise over the mountains, a light scrim for the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, #0b2140 0%, #1b4a80 30%, #4f86c0 44%, #f0b27e 56%, #ffdca3 64%)',
        }}
      >
        <MountainScene className="absolute inset-x-0 bottom-0 h-[62%] w-full md:h-[66%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/55 via-60% to-transparent md:bg-gradient-to-r md:from-ink/70 md:via-ink/30 md:via-50% md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="wrap grid gap-x-10 gap-y-14 pt-14 pb-48 md:grid-cols-12 md:pt-16 md:pb-64 lg:pt-20">
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
