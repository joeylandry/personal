import type { Project } from './types';

/**
 * Projects. Cards, case-study pages, sitemap entries and structured data all
 * read from this one array.
 */
export const projects: Project[] = [
  {
    slug: 'nyes-neck',
    name: 'Nyes Neck Clothing & Apparel',
    shortName: 'Nyes Neck',
    kind: 'E-commerce · Brand',
    role: 'Founder, designer & full-stack developer',
    year: '2025—present',
    status: 'live',
    featured: true,
    order: 1,
    accent: 'sea',
    tagline: 'An online store for the apparel brand that grew out of my childhood fundraiser.',
    summary:
      'Nyes Neck is a Cape Cod apparel brand I started in 2025. It grew out of a fundraiser I ran for nine years as a kid, and part of every sale goes to St. Jude Children’s Research Hospital. I designed the brand and built the store with Next.js, Sanity and Printful.',
    liveUrl: 'https://www.nyesneck.shop',
    repoUrl: 'https://github.com/joeylandry/nyes_neck',
    highlights: ['Next.js 16', 'Sanity CMS', 'Printful', 'Tailwind 4'],
    stack: [
      { label: 'Framework', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript'] },
      { label: 'Interface', items: ['Tailwind CSS 4', 'Responsive storefront architecture'] },
      {
        label: 'Content',
        items: ['Sanity CMS', 'Sanity image pipeline', 'Crop & hotspot control'],
      },
      {
        label: 'Commerce',
        items: ['Printful product sync', 'Variant, size, color & pricing model'],
      },
      { label: 'Platform', items: ['Formspree contact route', 'SEO & sitemap', 'Vercel'] },
    ],
    image: {
      src: '/images/projects/nyes-neck.webp',
      alt: 'The Nyes Neck shop page: the “Nyes Neck Collection” heading with 42 styles, grid-density and sort controls, and a Sweatshirts row of three crewnecks and a hoodie, each embroidered with the small red, white and navy pennant logo.',
      width: 2000,
      height: 1140,
      illustrated: false,
    },
    caseStudy: {
      statement:
        'An apparel store for Nyes Neck, a brand named after the Cape Cod neighborhood where my fundraiser started.',
      context: [
        'In 2013, when I was nine, I sold lemonade and bracelets in Nyes Neck and raised $50 for Make-A-Wish Massachusetts and Rhode Island. With help from the neighborhood it became a yearly thing with movie nights, raffles, apparel and live music, and over nine years it raised more than $20,000.',
        'In 2025 I started Nyes Neck Clothing & Apparel to keep it going all year instead of once a summer. Part of the proceeds go to St. Jude Children’s Research Hospital.',
      ],
      owned: [
        'The brand: the name, the look and the apparel designs.',
        'The whole storefront, including the shop, product pages and contact form.',
        'The Sanity setup, so I can change collections and photos without redeploying.',
        'The Printful integration that keeps products, sizes, colors and prices in sync.',
        'SEO, hosting on Vercel, and keeping it all running.',
      ],
      decisions: [
        {
          title: 'Borrow the look from the Cape',
          body: 'The design uses the coastline, the light and the colors of the water around Nyes Neck. I wanted it to feel like the place it’s named after.',
        },
        {
          title: 'Mention the charity once',
          body: 'The site explains where the brand came from and where part of the money goes. I didn’t want every page asking people to donate.',
        },
      ],
      architecture: [
        {
          title: 'Frontend',
          body: 'Next.js 16 with the App Router, React 19 and TypeScript, styled with Tailwind CSS 4. Catalog and product pages render on the server.',
        },
        {
          title: 'Content',
          body: 'Sanity stores products, collections and the shop layout. Its image pipeline handles resizing, and crop and hotspot settings keep product photos framed well at every size the store uses.',
        },
        {
          title: 'Products',
          body: 'Printful prints and ships the orders. Variants, sizes, colors, prices, stock and mockups sync from Printful so the store and the print shop always match.',
        },
        {
          title: 'Hosting',
          body: 'Deployed on Vercel. The contact form goes through Formspree, and the site has a sitemap, canonical URLs and Open Graph tags.',
        },
      ],
      constraints: [
        {
          title: 'Two places own product data',
          body: 'Printful knows about variants and stock. Sanity knows about the story, collections and layout. Most of the work was deciding which system owns each field, then combining them into one product type the pages can render.',
        },
      ],
      outcome: [
        'Live at nyesneck.shop.',
        'Part of each sale goes to St. Jude Children’s Research Hospital.',
        'I can update collections and photos without touching the code.',
      ],
    },
  },

  {
    slug: 'arlington-brewing-company',
    name: 'Arlington Brewing Company',
    shortName: 'Arlington Brewing',
    kind: 'Client work · Content platform',
    role: 'Designer & full-stack developer',
    year: '2025',
    status: 'launched',
    featured: true,
    order: 2,
    accent: 'amber',
    tagline: 'The website for a local brewery, from first build to launch.',
    summary:
      'The public website for Arlington Brewing Company, with pages for their beers, events and taproom, plus a map of where to buy their beer. The team keeps it up to date themselves through Sanity.',
    liveUrl: 'https://www.drinkarlingtonbeer.com',
    repoUrl: 'https://github.com/joeylandry/abco-site',
    highlights: ['Next.js 16', 'Sanity CMS', 'Leaflet', 'Geocoding'],
    stack: [
      { label: 'Framework', items: ['Next.js 16', 'React 19', 'TypeScript'] },
      { label: 'Interface', items: ['Tailwind CSS 4', 'Responsive production implementation'] },
      { label: 'Content', items: ['Sanity CMS', 'Sanity Vision'] },
      { label: 'Maps', items: ['Leaflet', 'Beer-finder data & geocoding workflow'] },
      { label: 'Platform', items: ['Vercel'] },
    ],
    image: {
      src: '/images/projects/arlington-brewing.webp',
      alt: 'The Arlington Brewing Company homepage: a full-bleed photo of a smiling bartender at the outdoor tap stand, overlaid with the white water-tower logo, the headline “Great community deserves great beer” and Explore Beers and Visit Us buttons, under a navigation bar with a Beer Finder link.',
      width: 2000,
      height: 1178,
      illustrated: false,
    },
    caseStudy: {
      statement:
        'The website for Arlington Brewing Company: their beers, events, taproom info, and a map of where to buy their beer.',
      context: [
        'Arlington Brewing needed a proper website. It had to tell their story, keep a current list of beers, announce events, and answer the question customers ask most: where can I buy this?',
        'They also needed to run it without me. If only I could update the site, it would be out of date within a week.',
      ],
      owned: [
        'Design and development of the whole site.',
        'Beer pages, event pages and taproom info.',
        'The beer finder map.',
        'The Sanity setup the team uses to keep the site current.',
        'Getting it from development to public launch with the Arlington team.',
      ],
      decisions: [
        {
          title: 'Put the beer finder in the main nav',
          body: 'The thing people most want to know is where to buy the beer, so the finder is one click from any page and answers that on a map.',
        },
        {
          title: 'Organize content the way the team talks',
          body: 'The CMS is built around beers, events and places, which is how the brewery already thinks about the business. Adding a new release means filling in one form.',
        },
        {
          title: 'Keep the age gate quick',
          body: 'Beer sites need an age gate. I kept it to one step and made sure it works with a keyboard and a screen reader.',
        },
      ],
      architecture: [
        {
          title: 'Frontend',
          body: 'Next.js 16, React 19 and TypeScript, styled with Tailwind CSS 4. I designed it for phones first, since people use the beer finder while standing in a store.',
        },
        {
          title: 'Content',
          body: 'Sanity holds beers, events, taproom details and locations. I used Sanity Vision to query content while building and debugging.',
        },
        {
          title: 'Beer finder',
          body: 'A Leaflet map plots the stores and bars that carry their beer. The brewery’s account list goes through a geocoding step to get coordinates, and since the addresses aren’t formatted consistently, that step has to cope with messy input.',
        },
      ],
      outcome: [
        'Live at drinkarlingtonbeer.com.',
        'Includes the age gate, beer pages, events, taproom info and the beer finder.',
        'The brewery team updates the content themselves.',
      ],
      next: [
        'Show on the map how recently each location was restocked.',
        'Let the team schedule event and release posts ahead of time.',
        'Add structured data for events so they show up properly in search results.',
      ],
    },
  },

  {
    slug: 'joeylandry-com',
    name: 'joeylandry.com',
    shortName: 'This site',
    kind: 'Personal site · Engineering',
    role: 'Designer & full-stack developer',
    year: '2026',
    status: 'live',
    featured: false,
    order: 3,
    accent: 'gold',
    tagline: 'How this site is built.',
    recursionTrigger: 'this site',
    summary:
      'My personal site, built with Next.js and Tailwind. All the text lives in typed content files, the contact form runs through its own API route, and tests check every page for accessibility and color contrast.',
    highlights: ['Next.js 16', 'Tailwind 4', 'Vitest', 'Playwright'],
    stack: [
      { label: 'Framework', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript'] },
      {
        label: 'Interface',
        items: ['Tailwind CSS 4', 'Semantic surface tokens', 'Geist Sans & Mono'],
      },
      { label: 'Content', items: ['Typed content modules', 'JSON-LD', 'Generated OG images'] },
      { label: 'Platform', items: ['Contact API with Resend or Formspree', 'Vercel'] },
      { label: 'Quality', items: ['Vitest', 'Playwright', 'Automated contrast checks'] },
    ],
    image: {
      src: '/images/projects/joeylandry-com.svg',
      alt: 'Illustrated cover for joeylandry.com: a browser window containing a smaller copy of the same browser window, nested again and again toward a vanishing point, in gold on midnight ink.',
      width: 1600,
      height: 1000,
      illustrated: true,
    },
    caseStudy: {
      statement: 'My personal site, the one you’re on now.',
      context: [
        'I wanted a portfolio that’s easy to keep up to date. All the text lives in a few TypeScript files, and every page, the sitemap and the social preview images are generated from them.',
      ],
      owned: [
        'The design, the code and the writing.',
        'The contact form API, including validation, spam checks and rate limiting.',
        'The project cover art and the script that generates it.',
        'Unit and end-to-end tests.',
      ],
      architecture: [
        {
          title: 'Pages',
          body: 'Next.js 16 App Router, React 19 and TypeScript. Every page except the contact endpoint is prerendered at build time, and each project page is generated from the content files.',
        },
        {
          title: 'Styling',
          body: 'Tailwind CSS 4 with a dark theme and a light theme. Each section picks one, and the colors in both are checked against WCAG AA contrast.',
        },
        {
          title: 'Contact form',
          body: 'The API route validates input on the server, uses a honeypot field and a minimum fill time to catch bots, and rate limits by IP. Messages go out through Resend or Formspree.',
        },
      ],
      outcome: [
        'Tests check every page for heading order, keyboard use, visible focus and WCAG AA contrast.',
        'Adding a project means adding one entry to a content file.',
      ],
    },
  },
];

/** Featured projects in display order. */
export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Previous/next navigation within the featured set, wrapping at the ends. */
export function getProjectNeighbors(slug: string): { previous: Project; next: Project } | null {
  const list = featuredProjects;
  const index = list.findIndex((project) => project.slug === slug);
  if (index === -1 || list.length < 2) return null;
  const previous = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];
  if (!previous || !next) return null;
  return { previous, next };
}

/** Display host for a URL, e.g. "nyesneck.shop". */
export function displayHost(url: string): string {
  return new URL(url).host.replace(/^www\./, '');
}

export const statusLabels: Record<Project['status'], string> = {
  live: 'Live',
  launched: 'Live · Launched',
  exploratory: 'Exploratory',
};
