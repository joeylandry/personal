import Link from 'next/link';
import { featuredProjects } from '@/content';
import { ProjectRow } from './project-row';
import { Section, SectionHeading } from './section';

/**
 * The featured projects. On /work it opens the page; on the homepage it is a
 * teaser section under the hero, pointing on to the full work page.
 */
export function FeaturedWork({ teaser = false }: { teaser?: boolean }) {
  return (
    <Section
      id="work"
      surface="paper"
      divider={teaser}
      labelledBy="work-heading"
      className={teaser ? 'pt-12 pb-20 md:pt-16 md:pb-28' : 'py-16 md:py-24'}
    >
      <div className="wrap">
        <SectionHeading
          id="work-heading"
          level={teaser ? 2 : 1}
          label={teaser ? undefined : 'Work'}
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
