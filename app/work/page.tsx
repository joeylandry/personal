import type { Metadata } from 'next';
import { ProjectListItem } from '@/components/project-row';
import { Section, SectionHeading } from '@/components/section';
import { featuredProjects } from '@/content';
import { collectionSchema, jsonLdString } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Production projects designed and built by Joey Landry: Nyes Neck Clothing & Apparel, Arlington Brewing Company and this site.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work — Joey Landry',
    description:
      'Production projects designed and built by Joey Landry: e-commerce, a brewery content platform and this site itself.',
    url: '/work',
  },
};

export default function WorkPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(collectionSchema()) }}
      />
      <Section surface="ink" divider={false} className="pt-16 pb-4 md:pt-24">
        <div className="wrap">
          <SectionHeading
            label="Work"
            title="Everything I've shipped and still maintain."
            lead="A short list by design. Each project is live, built end to end, and has a case study covering the decisions behind it."
            aside={<p className="meta text-faint">{featuredProjects.length} projects</p>}
          />
        </div>
      </Section>

      <Section surface="ink" divider={false} className="pb-16 md:pb-24">
        <div className="wrap mt-10">
          {featuredProjects.map((project) => (
            <ProjectListItem key={project.slug} project={project} />
          ))}
        </div>
        <div className="wrap">
          <p className="meta pt-8 text-faint">
            Coursework and experiments live on{' '}
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
    </>
  );
}
