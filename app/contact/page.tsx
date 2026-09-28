import type { Metadata } from 'next';
import { Contact } from '@/components/contact';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Joey Landry.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact — Joey Landry', url: '/contact' },
};

export default function ContactPage() {
  return <Contact />;
}
