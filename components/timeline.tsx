import { timeline } from '@/content';
import { Reveal } from './reveal';
import { Section, SectionHeading } from './section';

/**
 * Experience and education in one column, newest first. Deliberately compact:
 * the work above is the evidence, this is the trajectory.
 */
export function Timeline() {
  return (
    <Section id="experience" surface="paper" labelledBy="experience-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading
          id="experience-heading"
          label="Experience"
          title="Where I've been building."
          lead="Kept high-level on purpose — internal project detail stays internal."
        />

        <ol className="mt-14 md:mt-20">
          {timeline.map((entry, index) => (
            <Reveal
              as="li"
              key={`${entry.org}-${entry.start}`}
              delay={index * 60}
              className="rule-t grid gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:py-10"
            >
              <div className="md:col-span-3">
                <p className="meta flex items-center gap-2.5 text-faint">
                  {entry.current ? (
                    <span
                      aria-hidden="true"
                      className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-accent"
                    />
                  ) : null}
                  {entry.period}
                </p>
                {entry.location ? (
                  <p className="mt-2 text-xs text-faint">{entry.location}</p>
                ) : null}
              </div>

              <div className="md:col-span-9">
                <h3 className="text-lg font-medium tracking-tight text-fg">
                  {entry.title}
                  {entry.distinction ? (
                    <span className="ml-2.5 align-middle text-sm font-normal text-accent italic">
                      {entry.distinction}
                    </span>
                  ) : null}
                </h3>
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
