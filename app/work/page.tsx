import type { Metadata } from 'next';
import { FeaturedWork } from '@/components/featured-work';
import { collectionSchema, jsonLdString } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Websites designed and built by Joey Landry: Nyes Neck Clothing & Apparel and Arlington Brewing Company.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work — Joey Landry',
    description:
      'Websites designed and built by Joey Landry: an apparel store and a brewery website.',
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
      <FeaturedWork />
    </>
  );
}
