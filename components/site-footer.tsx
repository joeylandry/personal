import Link from 'next/link';
import { featuredProjects, profile, socials } from '@/content';
import { navLinks } from '@/lib/site';
import { Monogram } from './monogram';
import { ExternalLink } from './external-link';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-ink rule-t relative overflow-hidden bg-ink text-fg">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Monogram className="h-8 w-[2.667rem] text-fg" title={`${profile.name} monogram`} />
          <p className="measure-tight mt-6 text-sm leading-relaxed text-muted">
            {profile.footerNote}
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="meta text-faint">Site</h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link text-sm text-muted hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/work" className="link text-sm text-muted hover:text-fg">
                All work
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="meta text-faint">Projects</h2>
          <ul className="mt-5 space-y-3">
            {featuredProjects.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="link text-sm text-muted hover:text-fg"
                >
                  {project.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className="meta text-faint">Elsewhere</h2>
          <ul className="mt-5 space-y-3">
            {socials.map((social) => (
              <li key={social.href}>
                <ExternalLink href={social.href} className="link text-sm text-muted hover:text-fg">
                  {social.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap rule-t py-6">
        <p className="text-sm text-faint">
          © {year} {profile.name}
        </p>
      </div>
    </footer>
  );
}
