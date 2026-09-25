import Link from 'next/link';
import type { CaseStudyBlock, Project } from '@/content';
import { displayHost, statusLabels } from '@/content';
import { ExternalLink, OutboundArrow } from './external-link';
import { RecursionTrigger } from './recursion';
import { Reveal } from './reveal';

/** Masthead for a case study: identity, status and the two outbound links. */
export function CaseStudyHeader({ project }: { project: Project }) {
  return (
    <div className="wrap relative pt-16 pb-14 md:pt-24 md:pb-20">
      <Reveal>
        <nav aria-label="Breadcrumb" className="meta">
          <ol className="flex flex-wrap items-center gap-2 text-faint">
            <li>
              <Link href="/" className="link hover:text-fg">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/work" className="link hover:text-fg">
                Work
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-accent">
              {project.shortName}
            </li>
          </ol>
        </nav>
      </Reveal>

      <Reveal delay={60}>
        <p className="meta mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-faint">
          <span className="flex items-center gap-2 text-accent">
            <span
              aria-hidden="true"
              className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-accent"
            />
            {statusLabels[project.status]}
          </span>
          <span aria-hidden="true">·</span>
          {project.kind}
        </p>
        <h1 className="mt-5 text-display font-medium">{project.name}</h1>
        <p className="measure mt-6 text-lead text-muted">{project.caseStudy.statement}</p>
      </Reveal>

      <Reveal delay={140}>
        <dl className="mt-12 grid gap-x-8 gap-y-6 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="meta text-faint">Role</dt>
            <dd className="mt-2 text-sm text-fg">{project.role}</dd>
          </div>
          <div>
            <dt className="meta text-faint">Year</dt>
            <dd className="mt-2 text-sm text-fg">{project.year}</dd>
          </div>
          <div>
            <dt className="meta text-faint">Live</dt>
            <dd className="mt-2 text-sm">
              {project.liveUrl ? (
                <ExternalLink href={project.liveUrl} className="link-on text-accent" arrow>
                  {displayHost(project.liveUrl)}
                </ExternalLink>
              ) : project.recursionTrigger ? (
                <RecursionTrigger className="link-on text-accent">
                  {project.name}
                  <OutboundArrow />
                </RecursionTrigger>
              ) : (
                <span className="text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="meta text-faint">Source</dt>
            <dd className="mt-2 text-sm">
              {project.repoUrl ? (
                <ExternalLink href={project.repoUrl} className="link-on text-accent" arrow>
                  GitHub
                </ExternalLink>
              ) : (
                <span className="text-muted">Private</span>
              )}
            </dd>
          </div>
        </dl>
      </Reveal>
    </div>
  );
}

/** A titled prose section of the case study. */
export function CaseSection({
  label,
  title,
  children,
  id,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="rule-t grid gap-x-10 gap-y-6 py-12 md:grid-cols-12 md:py-16"
    >
      <Reveal className="md:col-span-4">
        <p className="meta section-label">{label}</p>
        <h2 id={id} className="mt-4 text-heading font-medium tracking-tight">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={80} className="md:col-span-7 md:col-start-6">
        {children}
      </Reveal>
    </section>
  );
}

export function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="measure space-y-5 text-lead text-muted">
      {items.map((item) => (
        <p key={item.slice(0, 28)}>{item}</p>
      ))}
    </div>
  );
}

/** Bulleted facts with a hairline marker instead of a dot. */
export function RuledList({ items }: { items: string[] }) {
  return (
    <ul className="measure space-y-0">
      {items.map((item) => (
        <li key={item.slice(0, 28)} className="rule-t flex gap-4 py-4 first:border-t-0 first:pt-0">
          <span aria-hidden="true" className="mt-2.5 h-px w-4 flex-none bg-accent" />
          <span className="text-[0.95rem] leading-relaxed text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Titled blocks used for decisions, architecture and constraints. */
export function BlockList({ items }: { items: CaseStudyBlock[] }) {
  return (
    <div className="space-y-0">
      {items.map((item) => (
        <div key={item.title} className="rule-t py-6 first:border-t-0 first:pt-0">
          <h3 className="text-base font-medium tracking-tight text-fg">{item.title}</h3>
          <p className="measure mt-2.5 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Stack index, grouped by purpose. */
export function StackTable({ project }: { project: Project }) {
  return (
    <dl className="space-y-0">
      {project.stack.map((group) => (
        <div
          key={group.label}
          className="rule-t grid gap-x-8 gap-y-2 py-5 first:border-t-0 first:pt-0 sm:grid-cols-3"
        >
          <dt className="meta text-faint sm:pt-0.5">{group.label}</dt>
          <dd className="sm:col-span-2">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Previous / next navigation across the featured set. */
export function ProjectNav({ previous, next }: { previous: Project; next: Project }) {
  return (
    <nav aria-label="More work" className="wrap grid gap-px sm:grid-cols-2">
      <Link
        href={`/work/${previous.slug}`}
        className={`accent-${previous.accent} group rule-t py-10 sm:pr-8`}
      >
        <p className="meta text-faint">
          <span aria-hidden="true">←</span> Previous
        </p>
        <p className="mt-3 text-heading font-medium tracking-tight underline-offset-4 group-hover:underline">
          {previous.name}
        </p>
        <p className="mt-2 text-sm text-accent">{previous.tagline}</p>
      </Link>
      <Link
        href={`/work/${next.slug}`}
        className={`accent-${next.accent} group rule-t py-10 sm:border-l sm:border-rule sm:pl-8 sm:text-right`}
      >
        <p className="meta text-faint">
          Next <span aria-hidden="true">→</span>
        </p>
        <p className="mt-3 text-heading font-medium tracking-tight underline-offset-4 group-hover:underline">
          {next.name}
        </p>
        <p className="mt-2 text-sm text-accent">{next.tagline}</p>
      </Link>
    </nav>
  );
}
