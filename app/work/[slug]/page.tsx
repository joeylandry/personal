import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  BlockList,
  CaseSection,
  CaseStudyHeader,
  Paragraphs,
  ProjectNav,
  RuledList,
  StackTable,
} from '@/components/case-study';
import { Coastline } from '@/components/coastline';
import { Cta, ctaClassName } from '@/components/cta';
import { Frame } from '@/components/frame';
import { RecursionTrigger } from '@/components/recursion';
import { Reveal } from '@/components/reveal';
import { Section } from '@/components/section';
import { displayHost, getProject, getProjectNeighbors, projects } from '@/content';
import { breadcrumbSchema, jsonLdString, projectSchema } from '@/lib/jsonld';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: 'Not found' };

  const title = `${project.name} — ${project.kind}`;
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: project.summary,
      url: `/work/${project.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const neighbors = getProjectNeighbors(project.slug);
  const { caseStudy } = project;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString([
            projectSchema(project),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Work', path: '/work' },
              { name: project.name, path: `/work/${project.slug}` },
            ]),
          ]),
        }}
      />

      {/* Masthead */}
      <div
        className={`surface-ink accent-${project.accent} relative isolate overflow-hidden bg-ink text-fg`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="grid-field absolute inset-0 opacity-60" />
          <Coastline
            className="absolute -right-[10%] -bottom-[20%] h-[85%] w-[80%] text-fog"
            opacity={0.32}
          />
        </div>
        <CaseStudyHeader project={project} />
      </div>

      {/* Lead visual */}
      <Section surface="paper" accent={project.accent} divider={false} className="py-14 md:py-20">
        <div className="wrap">
          <Reveal>
            <Frame
              image={project.image}
              caption={project.liveUrl ? displayHost(project.liveUrl) : undefined}
              priority
              sizes="(min-width: 1280px) 1100px, 100vw"
            />
          </Reveal>
        </div>
      </Section>

      {/* Narrative */}
      <Section surface="paper" accent={project.accent} divider={false} className="pb-8">
        <div className="wrap">
          <CaseSection id="context" label="Context" title="Why it exists">
            <Paragraphs items={caseStudy.context} />
          </CaseSection>

          <CaseSection id="owned" label="Ownership" title="What I owned">
            <RuledList items={caseStudy.owned} />
          </CaseSection>

          <CaseSection id="decisions" label="Decisions" title="Product & UX calls">
            <BlockList items={caseStudy.decisions} />
          </CaseSection>
        </div>
      </Section>

      {/* Technical half, on ink */}
      <Section surface="ink" accent={project.accent}>
        <div className="wrap">
          <CaseSection id="architecture" label="Architecture" title="How it's built">
            <BlockList items={caseStudy.architecture} />
          </CaseSection>

          <CaseSection id="stack" label="Stack" title="Everything in the build">
            <StackTable project={project} />
          </CaseSection>

          {caseStudy.constraints ? (
            <CaseSection id="constraints" label="Constraints" title="The hard parts">
              <BlockList items={caseStudy.constraints} />
            </CaseSection>
          ) : null}
        </div>
      </Section>

      {/* Outcome */}
      <Section surface="paper" accent={project.accent}>
        <div className="wrap">
          <CaseSection id="outcome" label="Outcome" title="Where it landed">
            <RuledList items={caseStudy.outcome} />
          </CaseSection>

          <CaseSection id="next" label="Next" title="What I'd explore next">
            <p className="measure mb-6 text-sm text-faint italic">
              Directions I&apos;m considering — none of this is built yet.
            </p>
            <RuledList items={caseStudy.next} />
          </CaseSection>

          <div className="rule-t flex flex-wrap items-center gap-4 py-12">
            {project.liveUrl ? (
              <Cta href={project.liveUrl} external>
                Visit {displayHost(project.liveUrl)}
              </Cta>
            ) : null}
            {project.recursionTrigger ? (
              <RecursionTrigger className={ctaClassName()}>Visit {project.name}</RecursionTrigger>
            ) : null}
            {project.repoUrl ? (
              <Cta href={project.repoUrl} variant="outline" arrow={false} external>
                View source
              </Cta>
            ) : null}
          </div>
        </div>
      </Section>

      {neighbors ? (
        <Section surface="ink" divider={false} className="pb-4">
          <ProjectNav previous={neighbors.previous} next={neighbors.next} />
        </Section>
      ) : null}
    </article>
  );
}
