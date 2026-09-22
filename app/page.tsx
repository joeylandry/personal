import type { Metadata } from 'next';
import { Contact } from '@/components/contact';
import { CredibilityStrip } from '@/components/credibility-strip';
import { Exploring } from '@/components/exploring';
import { FeaturedWork } from '@/components/featured-work';
import { Hero } from '@/components/hero';
import { OriginStory } from '@/components/origin-story';
import { Timeline } from '@/components/timeline';
import { Toolbox } from '@/components/toolbox';
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
      <CredibilityStrip />
      <FeaturedWork />
      <OriginStory />
      <Timeline />
      <Toolbox />
      <Exploring />
      <Contact />
    </>
  );
}
