import type { Metadata } from 'next';
import { Exploring } from '@/components/exploring';
import { OriginStory } from '@/components/origin-story';
import { StoryGallery } from '@/components/story-gallery';
import { Toolbox } from '@/components/toolbox';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Joey Landry — from Nyes Neck on Cape Cod to software engineering: the story, the tools he reaches for and what he is exploring next.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About — Joey Landry', url: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <OriginStory />
      <StoryGallery />
      <Toolbox />
      <Exploring />
    </>
  );
}
