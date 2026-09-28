import type { Metadata } from 'next';
import { Timeline } from '@/components/timeline';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Experience and education of Joey Landry, software engineer.',
  alternates: { canonical: '/experience' },
  openGraph: { title: 'Experience — Joey Landry', url: '/experience' },
};

export default function ExperiencePage() {
  return <Timeline />;
}
