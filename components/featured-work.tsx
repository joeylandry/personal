import Link from 'next/link';
import { featuredProjects } from '@/content';
import { ProjectRow } from './project-row';
import { Section, SectionHeading } from './section';

export function FeaturedWork() {
  return (
    <Section id="work" surface="paper" labelledBy="work-heading" className="py-20 md:py-28">
      <div className="wrap">
        <SectionHeading
          id="work-heading"
          label="Recent work"
          title="Current projects, all in production."
          lead="Every project here is live, built end to end, and actively maintained — from design and front end through backend and deployment."
          aside={
            <Link href="/work" className="link-on text-sm font-medium text-fg">
              All work →
            </Link>
          }
        />

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {featuredProjects.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </div>

        <p className="meta mt-20 border-t border-rule pt-6 text-faint normal-case tracking-normal">
          Project visuals are authored covers, not screenshots of the live sites.
        </p>
        <p className="meta mt-3 text-faint">
          More code, including coursework and experiments, lives on{' '}
          <a
            href="https://github.com/joeylandry"
            target="_blank"
            rel="noopener noreferrer"
            className="link text-accent"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
