import { timeline } from '@/content';
import { Section } from './section';

/**
 * About page: the degree, in one slim band. The full work history lives on
 * LinkedIn, so this is the only part of it the site repeats.
 */
export function Education() {
  const degrees = timeline.filter((entry) => entry.kind === 'education');
  if (degrees.length === 0) return null;

  return (
    <Section id="education" surface="ink" labelledBy="education-heading">
      <div className="wrap grid gap-x-10 gap-y-6 py-12 md:grid-cols-12 md:py-16">
        <h2 id="education-heading" className="meta text-detail md:col-span-3 md:pt-1.5">
          Education
        </h2>
        <ul className="space-y-6 md:col-span-9">
          {degrees.map((entry) => (
            <li key={`${entry.org}-${entry.start}`}>
              <p className="text-heading font-medium tracking-tight text-fg">
                {entry.title}
                {entry.distinction ? (
                  <span className="ml-3 align-middle text-base font-normal text-accent italic">
                    {entry.distinction}
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-muted">
                {entry.org} <span className="meta ml-2 text-faint">{entry.period}</span>
              </p>
              {entry.notes.map((note) => (
                <p key={note} className="mt-1 text-sm text-faint">
                  {note}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
