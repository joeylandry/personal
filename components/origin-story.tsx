import { profile, timeline } from '@/content';
import { Coastline } from './coastline';
import { Section } from './section';

export function OriginStory() {
  const { about, offClock } = profile;
  const degrees = timeline.filter((entry) => entry.kind === 'education');

  return (
    <Section
      id="about"
      surface="ink"
      divider={false}
      labelledBy="about-heading"
      className="overflow-hidden"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Coastline
          className="absolute -top-[18%] -left-[20%] h-[110%] w-[90%] text-fog"
          opacity={0.42}
          lines={11}
          gap={19}
        />
      </div>

      <div className="wrap relative grid gap-x-10 gap-y-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <div>
            <p className="meta section-label">{about.kicker}</p>
            <h1 id="about-heading" className="mt-5 text-title font-medium">
              {about.title}
            </h1>
          </div>

          <div className="measure mt-8 space-y-5 text-lead text-muted">
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div>
            <blockquote className="mt-12 border-l border-detail pl-6">
              <p className="text-heading font-medium tracking-tight text-fg">
                “{about.aside.quote}”
              </p>
              <footer className="meta mt-3 text-faint">{about.aside.caption}</footer>
            </blockquote>
          </div>
        </div>

        {/* Off the clock: the things that aren't on a resume. */}
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="meta text-faint">Off the clock</h2>
          <ul className="mt-6">
            {offClock.map((entry) => (
              <li key={entry.label} className="rule-t py-5 first:border-t-0 first:pt-0">
                <p className="meta text-detail">{entry.label}</p>
                <p className="mt-2 text-base leading-snug text-fg">{entry.detail}</p>
              </li>
            ))}
          </ul>

          {/* The degree. The full work history lives on LinkedIn, so this is
              the only part of it the site repeats. */}
          {degrees.length > 0 ? (
            <>
              <h2 className="meta mt-14 text-faint">Education</h2>
              <ul className="mt-6">
                {degrees.map((entry) => (
                  <li
                    key={`${entry.org}-${entry.start}`}
                    className="rule-t py-5 first:border-t-0 first:pt-0"
                  >
                    <p className="meta text-detail">{entry.org}</p>
                    <p className="mt-2 text-base leading-snug text-fg">
                      {entry.title}
                      {entry.distinction ? (
                        <span className="ml-2 text-accent italic">{entry.distinction}</span>
                      ) : null}
                    </p>
                    <p className="meta mt-2 text-faint">{entry.period}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
