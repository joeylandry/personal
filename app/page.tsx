import type { Metadata } from 'next';
import { FeaturedWork } from '@/components/featured-work';
import { Hero } from '@/components/hero';
import { jsonLdString, profilePageSchema } from '@/lib/jsonld';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(profilePageSchema()) }}
      />
      <Hero />
      <FeaturedWork teaser />
    </>
  );
}
