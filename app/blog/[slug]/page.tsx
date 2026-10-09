import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/external-link';
import { Monogram } from '@/components/monogram';
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
    alternates: { canonical: `/blog/${note.slug}` },
    robots: note.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: note.title,
      description: note.dek,
      url: `/blog/${note.slug}`,
      publishedTime: note.date,
    },
    twitter: { card: 'summary_large_image', title: note.title, description: note.dek },
  };
}

function Block({ block, release = false }: { block: NoteBlock; release?: boolean }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>;
    case 'h':
      return release ? (
        <h2 className="pt-2 font-serif text-lg font-bold text-ink">{block.text}</h2>
      ) : (
        <h2 className="pt-6 text-heading font-medium text-fg">{block.text}</h2>
      );
    case 'quote':
      return (
        <figure className="border-l-2 border-detail py-1 pl-6">
          <blockquote className={release ? 'text-lead text-ink' : 'text-lead text-fg'}>
            “{block.text}”
          </blockquote>
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
              <span aria-hidden="true" className="absolute left-0 text-detail">
                {release ? '•' : '→'}
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

  if (note.letterhead) {
    const { office, label, headline } = note.letterhead;
    return (
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString([
              articleSchema(note),
              breadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: note.title, path: `/blog/${note.slug}` },
              ]),
            ]),
          }}
        />
        <Section divider={false} labelledBy="note-heading">
          <div className="wrap py-12 md:py-20">
            <p className="meta mx-auto max-w-[44rem] text-faint">
              <Link href="/blog" className="link hover:text-fg">
                Blog
              </Link>
              <span aria-hidden="true"> / </span>
              Statement
              {note.draft ? <span className="ml-2 text-accent">Draft, not live</span> : null}
            </p>
            <div className="mx-auto mt-6 max-w-[44rem] bg-paper px-6 py-12 font-serif text-ink shadow-2xl md:px-16 md:py-16">
              <header className="text-center">
                <Monogram className="mx-auto h-14 w-auto text-ink" title="Joey Landry" />
                <p className="mt-5 text-3xl tracking-tight uppercase md:text-4xl">Joey Landry</p>
              </header>
              <p className="mt-10 text-center text-lg font-bold">{office}</p>
              <div className="mt-8 text-[1.0625rem]">
                <p className="font-bold uppercase">{label}</p>
                <p>
                  <time dateTime={note.date}>{formatDate(note.date)}</time>
                </p>
              </div>
              <h1 id="note-heading" className="mt-8 text-center text-xl leading-snug font-bold">
                {headline}
              </h1>
              <div className="mt-8 space-y-5 text-[1.0625rem] leading-relaxed">
                {note.body.map((block, index) => (
                  <Block key={index} block={block} release />
                ))}
              </div>
              <p aria-hidden="true" className="mt-10 text-center font-bold tracking-widest">
                ###
              </p>
            </div>
            <p className="mx-auto mt-10 max-w-[44rem]">
              <Link href="/blog" className="link meta text-muted hover:text-fg">
                ← All posts
              </Link>
            </p>
          </div>
        </Section>
      </article>
    );
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString([
            articleSchema(note),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: note.title, path: `/blog/${note.slug}` },
            ]),
          ]),
        }}
      />
      <Section divider={false} labelledBy="note-heading">
        <div className="wrap py-16 md:py-24">
          <div className="mx-auto max-w-[42rem]">
            <p className="meta text-faint">
              <Link href="/blog" className="link hover:text-fg">
                Blog
              </Link>
              <span aria-hidden="true"> / </span>
              <time dateTime={note.date}>{formatDate(note.date)}</time>
              {note.draft ? <span className="ml-2 text-accent">Draft, not live</span> : null}
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
              <Link href="/blog" className="link meta text-muted hover:text-fg">
                ← All posts
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </article>
  );
}
