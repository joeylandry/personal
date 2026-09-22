import type { Metadata } from 'next';
import { Coastline } from '@/components/coastline';
import { Cta } from '@/components/cta';
import { featuredProjects } from '@/content';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="surface-ink relative isolate overflow-hidden bg-ink text-fg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-field absolute inset-0 opacity-60" />
        <Coastline
          className="absolute -bottom-[10%] left-0 h-[70%] w-full text-fog"
          opacity={0.3}
        />
      </div>

      <div className="wrap flex min-h-[70vh] flex-col justify-center py-24">
        <p className="meta section-label">Error 404</p>
        <h1 className="mt-6 text-display font-medium">
          Off the map<span className="text-accent">.</span>
        </h1>
        <p className="measure mt-6 text-lead text-muted">
          This page doesn&apos;t exist — or it did, and it moved. The work below is a better place
          to land.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Cta href="/">Back home</Cta>
          <Cta href="/work" variant="outline" arrow={false}>
            See the work
          </Cta>
        </div>

        <ul className="mt-16 grid gap-px border-t border-rule sm:grid-cols-3">
          {featuredProjects.map((project) => (
            <li key={project.slug} className={`accent-${project.accent} py-6 sm:pr-6`}>
              <Link href={`/work/${project.slug}`} className="link-on text-sm font-medium">
                {project.name}
              </Link>
              <p className="mt-2 text-sm text-muted">{project.kind}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
