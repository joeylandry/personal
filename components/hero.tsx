import Image from 'next/image';
import Link from 'next/link';
import { donny, profile } from '@/content';
import { Cta } from './cta';
import { Reveal } from './reveal';

export function Hero() {
  const { hero } = profile;

  return (
    <section
      aria-labelledby="hero-heading"
      className="surface-ink relative isolate overflow-hidden bg-ink text-fg"
    >
      {/* Backdrop: fall foliage over a mountain lake, with a scrim on the copy side. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/hero-foliage.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink/30 md:bg-gradient-to-r md:from-ink/80 md:via-ink/45 md:via-55% md:to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="wrap grid gap-x-10 gap-y-14 pt-14 pb-20 md:grid-cols-12 md:pt-16 md:pb-32 lg:pt-20">
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

        {/* Meet Donny: the cat in the headline. */}
        <Reveal delay={510} className="md:col-span-4 md:self-end">
          <Link
            href="/about#donny"
            className="group flex items-center gap-5 border border-rule bg-ink/55 p-4 backdrop-blur-md transition-colors hover:border-accent md:flex-col md:items-start md:p-5"
          >
            <span className="relative block aspect-square w-24 shrink-0 overflow-hidden border border-rule md:w-full">
              <Image
                src={donny.headshot.src}
                alt={donny.headshot.alt}
                fill
                sizes="(min-width: 768px) 28vw, 96px"
                className="object-cover object-[50%_35%]"
              />
            </span>
            <span className="block">
              <span className="meta block text-accent">The cat</span>
              <span className="mt-2 block text-xl font-medium tracking-tight text-fg">
                Meet {donny.name}.
              </span>
              <span className="mt-1.5 block text-sm leading-snug text-muted">
                Coworker, code reviewer, professional napper.{' '}
                <span className="whitespace-nowrap text-fg group-hover:text-accent">More →</span>
              </span>
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
