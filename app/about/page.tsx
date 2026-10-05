import type { Metadata } from 'next';
import { DonnySection } from '@/components/donny';
import { Education } from '@/components/education';
import { Exploring } from '@/components/exploring';
import { ListeningSection } from '@/components/listening';
import { OriginStory } from '@/components/origin-story';
import { Toolbox } from '@/components/toolbox';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Joey Landry, from Nyes Neck on Cape Cod to software engineering: the story, the tools he reaches for and what he is exploring next.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About | Joey Landry', url: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <OriginStory />
      <Education />
      <DonnySection />
      <ListeningSection />
      <Toolbox />
      <Exploring />
    </>
  );
}
