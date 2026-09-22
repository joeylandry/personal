import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Ambient } from '@/components/ambient';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { profile } from '@/content';
import { jsonLdString, personSchema, websiteSchema } from '@/lib/jsonld';
import { siteTitle, siteUrl } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s — Joey Landry',
  },
  description: profile.metaDescription,
  applicationName: 'Joey Landry',
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    'Joey Landry',
    'software engineer',
    'full-stack developer',
    'Next.js',
    'TypeScript',
    'New Hampshire',
    'Tufts University',
    'portfolio',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: profile.name,
    title: siteTitle,
    description: profile.metaDescription,
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: profile.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#071018',
  colorScheme: 'dark light',
};

/**
 * Marks the document as script-enabled before first paint. Every motion effect
 * is gated on this flag, which is what keeps the no-JavaScript reading path
 * complete rather than blank.
 */
const JS_FLAG = "document.documentElement.dataset.js='on'";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString([personSchema(), websiteSchema()]) }}
        />
      </head>
      <body className="surface-ink bg-ink text-fg antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Ambient />
      </body>
    </html>
  );
}
