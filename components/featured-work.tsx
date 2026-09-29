import Link from 'next/link';
import { featuredProjects, projects } from '@/content';
import { ProjectRow } from './project-row';
import { Section, SectionHeading } from './section';

/**
 * The featured projects. On /work it opens the page; on the homepage it is a
 * teaser section under the hero, pointing on to the full work page.
 */
export function FeaturedWork({ teaser = false }: { teaser?: boolean }) {
  const thisSite = projects.find((project) => project.slug === 'joeylandry-com');

  return (
    <Section
      id="work"
      surface="paper"
      divider={teaser}
      labelledBy="work-heading"
      className={teaser ? 'py-20 md:py-28' : 'py-16 md:py-24'}
    >
      <div className="wrap">
        <SectionHeading
          id="work-heading"
          level={teaser ? 2 : 1}
          title={teaser ? 'Recent work' : 'Work'}
          lead="Websites I designed, built and still look after."
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

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {featuredProjects.map((project, index) => (
            <ProjectRow
              key={project.slug}
              project={project}
              index={index}
              headingLevel={teaser ? 3 : 2}
            />
          ))}
        </div>

        <p className="mt-20 border-t border-rule pt-6 text-sm text-muted">
          More code, including coursework and experiments, is on{' '}
          <a
            href="https://github.com/joeylandry"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-accent"
          >
            GitHub
          </a>
          .
          {thisSite ? (
            <>
              {' '}
              There&apos;s also a short write-up on{' '}
              <Link href={`/work/${thisSite.slug}`} className="link text-accent">
                how this site is built
              </Link>
              .
            </>
          ) : null}
        </p>
      </div>
    </Section>
  );
}
