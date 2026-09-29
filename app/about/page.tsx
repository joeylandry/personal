import type { Metadata } from 'next';
import { Exploring } from '@/components/exploring';
import { OriginStory } from '@/components/origin-story';
import { Toolbox } from '@/components/toolbox';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Joey Landry: the Nyes Neck fundraiser, Tufts, Fidelity, the tools he uses and what he is interested in.',
  alternates: { canonical: '/about' },
  openGraph: { title: 'About — Joey Landry', url: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <OriginStory />
      <Toolbox />
      <Exploring />
    </>
  );
}
