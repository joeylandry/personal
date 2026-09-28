import type { Metadata } from 'next';
import { FeaturedWork } from '@/components/featured-work';
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
      <FeaturedWork />
    </>
  );
}
