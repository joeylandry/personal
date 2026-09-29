import { skillGroups } from '@/content';
import { Reveal } from './reveal';
import { Section, SectionHeading } from './section';

/** Tools and languages, grouped loosely. */
export function Toolbox() {
  return (
    <Section id="toolbox" surface="ink" labelledBy="toolbox-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading
          id="toolbox-heading"
          title="Tools I use"
          lead="Mostly the ones I've used on the projects on this site."
        />

        <div className="mt-14 grid gap-x-10 gap-y-0 md:mt-20 md:grid-cols-2">
          {skillGroups.map((group) => (
            <Reveal key={group.label} className="rule-t py-7 md:py-8">
              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-5">
                <h3 className="text-base font-medium tracking-tight text-fg sm:col-span-2">
                  {group.label}
                </h3>
                {/* Spacing separates the items. Drawn separators dangle at the
                    start of a wrapped line, which reads as a typo. */}
                <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm sm:col-span-3 sm:pt-0.5">
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
