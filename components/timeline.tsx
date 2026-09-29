import { timeline } from '@/content';
import { Reveal } from './reveal';
import { Section, SectionHeading } from './section';

/** Experience and education in one column, newest first. */
export function Timeline() {
  return (
    <Section id="experience" surface="paper" divider={false} labelledBy="experience-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading id="experience-heading" level={1} title="Experience" />

        <ol className="mt-14 md:mt-20">
          {timeline.map((entry) => (
            <Reveal
              as="li"
              key={`${entry.org}-${entry.start}`}
              className="rule-t grid gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:py-10"
            >
              <div className="md:col-span-3">
                <p className="text-sm text-faint">{entry.period}</p>
                {entry.location ? (
                  <p className="mt-2 text-xs text-faint">{entry.location}</p>
                ) : null}
              </div>

              <div className="md:col-span-9">
                <h2 className="text-lg font-medium tracking-tight text-fg">
                  {entry.title}
                  {entry.distinction ? (
                    <span className="ml-2.5 align-middle text-sm font-normal text-accent italic">
                      {entry.distinction}
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {entry.org}
                  {/* Only education needs labelling; a job title already says it. */}
                  {entry.kind === 'education' ? (
                    <span className="meta ml-3 text-faint">Education</span>
                  ) : null}
                </p>

                {entry.notes.length > 0 ? (
                  <ul className="measure mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
                    {entry.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : null}

                {entry.skills ? (
                  <p className="meta mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-faint">
                    {entry.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
