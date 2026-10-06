import type { Metadata } from 'next';
import { GivingIntro, GivingNext, GivingThanks, GivingTimeline } from '@/components/giving';

export const metadata: Metadata = {
  title: 'Giving',
  description:
    'Nine years of Nyes Neck fundraisers that raised more than $20,000 for Make-A-Wish Massachusetts and Rhode Island, and how that work continues with St. Jude.',
  alternates: { canonical: '/giving' },
  openGraph: { title: 'Giving | Joey Landry', url: '/giving' },
};

export default function GivingPage() {
  return (
    <>
      <GivingIntro />
      <GivingTimeline />
      <GivingThanks />
      <GivingNext />
    </>
  );
}
