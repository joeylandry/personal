import { skillGroups } from '@/content';
import { Reveal } from './reveal';
import { Section, SectionHeading } from './section';

/**
 * Capabilities grouped by purpose. Typeset as a technical index rather than a
 * wall of badges — what the tools are for matters more than how many there are.
 */
export function Toolbox() {
  return (
    <Section id="toolbox" surface="ink" labelledBy="toolbox-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading
          id="toolbox-heading"
          label="Toolbox"
          title="What I reach for, and why."
          lead="Scoped to the things I've actually shipped with — the production work above is where each of these earned its place."
        />

        <div className="mt-14 grid gap-x-10 gap-y-0 md:mt-20 md:grid-cols-2">
          {skillGroups.map((group, index) => (
            <Reveal key={group.label} delay={index * 50} className="rule-t py-7 md:py-8">
              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <h3 className="text-base font-medium tracking-tight text-fg">{group.label}</h3>
                  <p className="mt-1.5 text-sm leading-snug text-muted">{group.blurb}</p>
                </div>
                {/* Spacing separates the items. Drawn separators dangle at the
                    start of a wrapped line, which reads as a typo. */}
                <ul className="meta flex flex-wrap gap-x-6 gap-y-2.5 text-faint sm:col-span-3 sm:pt-1">
                  {group.items.map((item) => (
                    <li key={item} className="text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
