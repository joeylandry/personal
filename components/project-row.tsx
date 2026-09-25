import Link from 'next/link';
import type { Project } from '@/content';
import { displayHost, statusLabels } from '@/content';
import { ExternalLink, OutboundArrow } from './external-link';
import { Frame } from './frame';
import { RecursionTrigger } from './recursion';
import { Reveal } from './reveal';

/**
 * A featured project, presented as an editorial spread rather than a card in a
 * grid. Image and text swap sides down the page so the rhythm stays alive.
 */
export function ProjectRow({ project, index }: { project: Project; index: number }) {
  const flipped = index % 2 === 1;
  const number = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`accent-${project.accent} group grid items-center gap-x-10 gap-y-8 md:grid-cols-12`}
    >
      <Reveal
        className={['md:col-span-7', flipped ? 'md:order-2 md:col-start-6' : 'md:order-1'].join(
          ' ',
        )}
      >
        <Link href={`/work/${project.slug}`} tabIndex={-1} aria-hidden="true" className="block">
          <Frame
            image={project.image}
            sizes="(min-width: 768px) 58vw, 100vw"
            className="[&_figcaption]:hidden"
          >
            {/* Hover detail: the stack, revealed on the image itself. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-rule bg-ink/86 px-4 py-2.5 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
              {project.highlights.map((item) => (
                <span key={item} className="meta text-fog">
                  {item}
                </span>
              ))}
            </div>
          </Frame>
        </Link>
      </Reveal>

      <Reveal
        delay={100}
        className={['md:col-span-5', flipped ? 'md:order-1 md:col-start-1' : 'md:order-2'].join(
          ' ',
        )}
      >
        <p className="meta flex items-center gap-3 text-faint">
          <span className="text-accent">{number}</span>
          <span aria-hidden="true" className="h-px w-6 bg-rule-strong" />
          {project.kind}
        </p>

        <h3 className="mt-5 text-heading font-medium tracking-tight">
          <Link href={`/work/${project.slug}`} className="link-on">
            {project.name}
          </Link>
        </h3>

        <p className="mt-3 text-lead text-accent">
          <Tagline project={project} />
        </p>
        <p className="measure mt-4 text-[0.95rem] leading-relaxed text-muted">{project.summary}</p>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-rule pt-5">
          <div>
            <dt className="meta text-faint">Role</dt>
            <dd className="mt-1.5 text-sm text-fg">{project.role}</dd>
          </div>
          <div>
            <dt className="meta text-faint">Year</dt>
            <dd className="mt-1.5 text-sm text-fg">{project.year}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href={`/work/${project.slug}`} className="link-on font-medium text-fg">
            Read the case study
          </Link>
          {project.liveUrl ? (
            <ExternalLink href={project.liveUrl} className="link text-muted hover:text-fg" arrow>
              {displayHost(project.liveUrl)}
            </ExternalLink>
          ) : null}
          {project.recursionTrigger ? (
            <RecursionTrigger className="link text-muted hover:text-fg">
              {project.name}
              <OutboundArrow />
            </RecursionTrigger>
          ) : null}
          {project.repoUrl ? (
            <ExternalLink href={project.repoUrl} className="link text-muted hover:text-fg" arrow>
              Source
            </ExternalLink>
          ) : null}
        </div>
      </Reveal>
    </article>
  );
}

/**
 * The tagline, with the project's recursion trigger word (if any) turned into
 * a quiet link. Only the first occurrence is linked.
 */
function Tagline({ project }: { project: Project }) {
  const word = project.recursionTrigger;
  const at = word ? project.tagline.indexOf(word) : -1;
  if (!word || at === -1) return project.tagline;

  return (
    <>
      {project.tagline.slice(0, at)}
      <RecursionTrigger
        href={`/work/${project.slug}`}
        className="underline decoration-dotted decoration-1 underline-offset-[5px] hover:decoration-solid"
      >
        {word}
      </RecursionTrigger>
      {project.tagline.slice(at + word.length)}
    </>
  );
}

/** Compact listing used on the work index. */
export function ProjectListItem({ project }: { project: Project }) {
  return (
    <article className={`accent-${project.accent} group rule-b py-10`}>
      <Link href={`/work/${project.slug}`} className="grid gap-x-10 gap-y-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <Frame image={project.image} sizes="(min-width: 768px) 32vw, 100vw" />
        </div>
        <div className="md:col-span-8">
          <p className="meta flex flex-wrap items-center gap-x-3 gap-y-1 text-faint">
            <span className="text-accent">{statusLabels[project.status]}</span>
            <span aria-hidden="true">·</span>
            {project.kind}
            <span aria-hidden="true">·</span>
            {project.year}
          </p>
          <h2 className="mt-4 text-heading font-medium tracking-tight underline-offset-4 group-hover:underline">
            {project.name}
          </h2>
          <p className="mt-3 text-lead text-accent">{project.tagline}</p>
          <p className="measure mt-4 text-[0.95rem] leading-relaxed text-muted">
            {project.summary}
          </p>
          <p className="meta mt-6 flex flex-wrap gap-x-4 gap-y-1 text-faint">
            {project.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        </div>
      </Link>
    </article>
  );
}
