import Link from 'next/link';
import { featuredProjects } from '@/content';
import { ProjectRow } from './project-row';
import { Section, SectionHeading } from './section';

/**
 * The featured projects. On the homepage it is a teaser under the hero; /work
 * opens with the same section, so the two read identically. Only the heading
 * level and the right-hand aside change.
 */
export function FeaturedWork({ teaser = false }: { teaser?: boolean }) {
  return (
    <Section
      id="work"
      surface="paper"
      divider={teaser}
      labelledBy="work-heading"
      className="pt-12 pb-20 md:pt-16 md:pb-28"
    >
      <div className="wrap">
        <SectionHeading
          id="work-heading"
          level={teaser ? 2 : 1}
          title="Recent Work"
          lead="Every project here is live, built end to end, and actively maintained."
          aside={
            teaser ? (
              <Link href="/work" className="link-on text-sm font-medium text-fg">
                All work →
              </Link>
            ) : (
              <p className="meta text-faint">{featuredProjects.length} projects</p>
            )
          }
        />

        <div className="mt-10 space-y-20 md:mt-14 md:space-y-28">
          {featuredProjects.map((project, index) => (
            <ProjectRow
              key={project.slug}
              project={project}
              index={index}
              headingLevel={teaser ? 3 : 2}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
