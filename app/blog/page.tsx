import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, SectionHeading } from '@/components/section';
import { StripedFlag } from '@/components/striped-flag';
import { publishedNotes } from '@/content';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Hot takes, opinions and half-built ideas from Joey Landry on software, products and the apps that should be better.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Blog | Joey Landry', url: '/blog' },
};

export default function BlogPage() {
  return (
    <Section id="blog" divider={false} labelledBy="blog-heading" className="overflow-hidden">
      {/* A striped flag, outlined only, cropped to its rippling middle and
          tilted a few degrees so the stripes climb toward the right. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <StripedFlag className="absolute top-1/2 left-1/2 h-[150%] w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-6 text-fog" opacity={0.42} />
      </div>

      <div className="wrap relative py-16 md:py-24">
        <SectionHeading
          level={1}
          id="blog-heading"
          title="Hot takes & half-built ideas."
          lead="Short opinions on software and the products I use every day, mostly the ones I think I could make better."
        />

        {publishedNotes.length === 0 ? (
          <p className="meta mt-14 text-faint md:mt-20">The first one is still cooking.</p>
        ) : (
          <ol className="mt-14 md:mt-20">
            {publishedNotes.map((note) => (
              <li key={note.slug} className="rule-t">
                <Link
                  href={`/blog/${note.slug}`}
                  className="group grid gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:py-10"
                >
                  <div className="meta text-faint md:col-span-3 md:pt-1.5">
                    <time dateTime={note.date}>{formatDate(note.date)}</time>
                    {note.draft ? <span className="ml-2 text-accent">Draft</span> : null}
                  </div>
                  <div className="md:col-span-9">
                    <h2 className="text-heading font-medium text-fg transition-colors duration-200 group-hover:text-accent">
                      {note.title}
                    </h2>
                    <p className="measure mt-3 text-muted">{note.dek}</p>
                    <p className="meta mt-4 text-faint">{note.tags.join(' · ')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Section>
  );
}
