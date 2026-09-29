import { profile } from '@/content';
import { Coastline } from './coastline';
import { Section } from './section';

export function OriginStory() {
  const { about, impact } = profile;

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
            <blockquote className="mt-12 border-l border-accent pl-6">
              <p className="text-heading font-medium tracking-tight text-fg">
                “{about.aside.quote}”
              </p>
              <footer className="meta mt-3 text-faint">{about.aside.caption}</footer>
            </blockquote>
          </div>
        </div>

        {/* Impact ledger — verified milestones only. */}
        <div className="md:col-span-4 md:col-start-9">
          <h2 className="meta text-faint">Make-A-Wish · Nyes Neck</h2>
          <ol className="mt-6 space-y-0">
            {impact.map((entry) => (
              <li key={entry.year} className="rule-t py-5 first:border-t-0 first:pt-0">
                <p className="meta text-accent">{entry.year}</p>
                <p className="mt-2 text-xl font-medium tracking-tight text-fg">{entry.value}</p>
                <p className="mt-1.5 text-sm leading-snug text-muted">{entry.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
