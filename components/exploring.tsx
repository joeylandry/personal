import { explorations } from '@/content';
import { Reveal } from './reveal';
import { Section, SectionHeading } from './section';

export function Exploring() {
  return (
    <Section id="exploring" surface="paper" labelledBy="exploring-heading">
      <div className="wrap py-20 md:py-28">
        <SectionHeading
          id="exploring-heading"
          label="What I'm exploring"
          title="Open questions I keep circling back to."
        />

        <div className="mt-14 grid gap-x-10 gap-y-0 md:mt-20 md:grid-cols-3">
          {explorations.map((item, index) => (
            <Reveal
              key={item.index}
              delay={index * 80}
              className="rule-t py-8 md:border-t md:py-10"
            >
              <p className="meta text-accent">{item.index}</p>
              <h3 className="mt-4 text-lg font-medium tracking-tight text-fg">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted md:pr-6">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
