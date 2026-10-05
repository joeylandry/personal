import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/external-link';
import { Section } from '@/components/section';
import { getNote, publishedNotes } from '@/content';
import type { NoteBlock } from '@/content';
import { formatDate } from '@/lib/format';
import { articleSchema, breadcrumbSchema, jsonLdString } from '@/lib/jsonld';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedNotes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: 'Not found' };

  return {
    title: note.title,
    description: note.dek,
    alternates: { canonical: `/notes/${note.slug}` },
    robots: note.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: note.title,
      description: note.dek,
      url: `/notes/${note.slug}`,
      publishedTime: note.date,
    },
    twitter: { card: 'summary_large_image', title: note.title, description: note.dek },
  };
}

function Block({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>;
    case 'h':
      return <h2 className="pt-6 text-heading font-medium text-fg">{block.text}</h2>;
    case 'quote':
      return (
        <figure className="border-l-2 border-accent py-1 pl-6">
          <blockquote className="text-lead text-fg">“{block.text}”</blockquote>
          {block.cite ? (
            <figcaption className="meta mt-3 text-faint">{block.cite}</figcaption>
          ) : null}
        </figure>
      );
    case 'list':
      return (
        <ul className="space-y-4">
          {block.items.map((item) => (
            <li key={item} className="relative pl-6">
              <span aria-hidden="true" className="absolute left-0 text-accent">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      );
  }
}

export default async function NotePage({ params }: Params) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString([
            articleSchema(note),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Notes', path: '/notes' },
              { name: note.title, path: `/notes/${note.slug}` },
            ]),
          ]),
        }}
      />
      <Section divider={false} labelledBy="note-heading">
        <div className="wrap py-16 md:py-24">
          <div className="mx-auto max-w-[42rem]">
            <p className="meta text-faint">
              <Link href="/notes" className="link hover:text-fg">
                Notes
              </Link>
              <span aria-hidden="true"> / </span>
              <time dateTime={note.date}>{formatDate(note.date)}</time>
              {note.draft ? <span className="ml-2 text-accent">Draft — not live</span> : null}
            </p>
            <h1 id="note-heading" className="mt-6 text-title font-medium text-fg">
              {note.title}
            </h1>
            <p className="mt-6 text-lead text-muted">{note.dek}</p>
            <p className="meta mt-6 text-faint">{note.tags.join(' · ')}</p>

            <div className="rule-t mt-10 space-y-6 pt-10 text-[1.0625rem] leading-relaxed text-muted">
              {note.body.map((block, index) => (
                <Block key={index} block={block} />
              ))}
            </div>

            {note.sources?.length ? (
              <div className="rule-t mt-14 pt-8">
                <h2 className="meta text-faint">Sources</h2>
                <ul className="mt-4 space-y-2.5">
                  {note.sources.map((source) => (
                    <li key={source.href}>
                      <ExternalLink
                        href={source.href}
                        arrow
                        className="link text-sm text-muted hover:text-fg"
                      >
                        {source.label}
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-14">
              <Link href="/notes" className="link meta text-muted hover:text-fg">
                ← All notes
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </article>
  );
}
