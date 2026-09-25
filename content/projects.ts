import type { Project } from './types';

/**
 * The featured body of work. Production-first and deliberately short.
 *
 * Everything here is verified: live URLs, repositories, roles and technical
 * scope. Cards, case-study pages, sitemap entries and structured data all read
 * from this one array, so they cannot drift apart.
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
    tagline: 'My childhood fundraiser, rebuilt as a modern storefront.',
    summary:
      'A Cape Cod lifestyle and apparel brand that grew out of nine years of fundraising for Make-A-Wish, now a mission-driven store with a portion of proceeds supporting St. Jude Children’s Research Hospital. I own the brand, the design and the whole stack — Next.js storefront, Sanity content operations, and a Printful product boundary.',
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
      src: '/images/projects/nyes-neck.svg',
      alt: 'Illustrated cover for Nyes Neck Clothing & Apparel: sea-glass contour lines shaped like a Cape Cod neck of land, with an apparel product grid and a sunrise band above the horizon.',
      width: 1600,
      height: 1000,
      illustrated: true,
    },
    caseStudy: {
      statement:
        'A Cape Cod lifestyle and apparel brand built as a real storefront, where the product catalog, the brand story and the charitable mission are all the same system.',
      context: [
        'In 2013, at nine years old, I sold lemonade and bracelets in Nyes Neck and raised $50 for Make-A-Wish Massachusetts and Rhode Island.',
        'With help from the neighborhood, that experiment kept expanding — movie nights, raffles, apparel, live music, community events — and over nine years it raised more than $20,000.',
        'After Tufts I wanted to bring the idea back as something permanent instead of an annual event. Nyes Neck Clothing & Apparel is that: a brand inspired by Nyes Neck and Cape Cod, with a portion of proceeds supporting St. Jude Children’s Research Hospital and a long-term ambition to widen that impact.',
      ],
      owned: [
        'The brand itself — name, positioning, visual direction and the story the store tells.',
        'Product design and the apparel line.',
        'The full storefront implementation: routing, layout, catalog, product detail, cart-adjacent flows and contact.',
        'The content model in Sanity, so the shop can be merchandised without a deploy.',
        'The Printful integration boundary and the product data shape it feeds.',
        'SEO foundations, deployment and ongoing maintenance.',
      ],
      decisions: [
        {
          title: 'Let the place do the branding',
          body: 'The store is inspired by a specific neck of land on Cape Cod, so the design leans on coastline, light and texture rather than generic streetwear tropes. The result reads as a place before it reads as a shop.',
        },
        {
          title: 'Merchandising belongs to content, not code',
          body: 'Collections, shop layout, imagery, crop and hotspot are all editable in Sanity. Rearranging the store is a content change, not a pull request — which is what makes it maintainable as a one-person operation.',
        },
        {
          title: 'The mission is stated, not performed',
          body: 'The charitable side is presented plainly — what the brand grew out of and where a portion of proceeds goes — without turning every page into an appeal.',
        },
      ],
      architecture: [
        {
          title: 'Storefront',
          body: 'Next.js 16 App Router with React 19 and TypeScript. Server components render catalog and product pages; Tailwind CSS 4 carries a small, tokenized design system across breakpoints.',
        },
        {
          title: 'Content layer',
          body: 'Sanity models products, collections and shop layout. The Sanity image pipeline handles derivatives, with crop and hotspot control so product photography stays composed at every aspect ratio the storefront uses.',
        },
        {
          title: 'Product synchronization',
          body: 'A Printful boundary keeps product metadata, variants, sizes, colors, pricing, availability and mockups in sync, so the fulfilment catalog and the storefront describe the same reality.',
        },
        {
          title: 'Platform',
          body: 'A Formspree-backed contact route, SEO foundations — canonical URL, Open Graph metadata, robots and sitemap — and deployment on Vercel.',
        },
      ],
      constraints: [
        {
          title: 'Two sources of product truth',
          body: 'Print-on-demand owns variants and availability; the CMS owns story, collections and layout. Most of the interesting work was deciding which system owns which field, and shaping one product type the storefront can render without knowing where each value came from.',
        },
      ],
      outcome: [
        'The storefront is live at nyesneck.shop, designed and built end to end by me.',
        'The brand continues the Nyes Neck fundraiser that raised more than $20,000 for Make-A-Wish Massachusetts and Rhode Island.',
        'A portion of proceeds supports St. Jude Children’s Research Hospital.',
        'Merchandising, collections and imagery are editable without touching the codebase.',
      ],
      next: [
        'Deeper collection storytelling — tying each drop to a specific place or moment on the Cape.',
        'A clearer, public accounting of charitable impact as volume grows.',
        'Richer product media, including lifestyle photography shot on location.',
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
    tagline: 'A brewery’s website, taken from development to public launch.',
    summary:
      'A production website and content platform for a growing local brewery: beer pages, events, taproom information and a location-aware beer finder, plus a CMS the team actually uses to keep it current.',
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
      src: '/images/projects/arlington-brewing.svg',
      alt: 'Illustrated cover for Arlington Brewing Company: an amber map plane with location pins marking where the beer is available, beside a row of beer-can silhouettes standing in for the catalog.',
      width: 1600,
      height: 1000,
      illustrated: true,
    },
    caseStudy: {
      statement:
        'A website and content platform that lets a growing brewery publish its story, manage its catalog, promote events, and help people find its beer.',
      context: [
        'Arlington Brewing Company needed a real website, not a placeholder — somewhere to tell its story, keep a beer catalog current, announce events and answer the question customers ask most: where can I actually get this?',
        'Just as important, the team needed to run it themselves. A site that only I could update would start decaying the week after launch.',
      ],
      owned: [
        'Design and full-stack implementation of the production site.',
        'Beer catalog and beer detail pages.',
        'Event pages and taproom information.',
        'A location-aware beer finder built on Leaflet.',
        'The content model and CMS setup the team uses to keep the site current.',
        'Taking the project from development through public launch, working with the Arlington Brewing team.',
      ],
      decisions: [
        {
          title: 'The beer finder is the point',
          body: '"Where can I buy this?" is the highest-intent question on a brewery site. Answering it on a map, in one interaction, matters more than any amount of homepage copy.',
        },
        {
          title: 'Model the catalog the way the brewery thinks',
          body: 'Content types follow how the team already talks about their product — beers, events, places — so publishing feels like describing the business rather than filling in a developer’s schema.',
        },
        {
          title: 'The age gate stays out of the way',
          body: 'Alcohol sites need an age gate. It is built to be quick, accessible and keyboard-usable, and to not become the memorable part of visiting the site.',
        },
        {
          title: 'Built to be handed over',
          body: 'Every piece of the site that changes week to week — beers, events, taproom details, locations — is content. The deploy is for code, not for a new can release.',
        },
      ],
      architecture: [
        {
          title: 'Application',
          body: 'Next.js 16 with React 19 and TypeScript, styled with Tailwind CSS 4 and implemented responsively for phones first — the beer finder is used standing in a store aisle.',
        },
        {
          title: 'Content',
          body: 'Sanity models beers, events, taproom details and locations, with Sanity Vision available for querying content during development and debugging.',
        },
        {
          title: 'Location experience',
          body: 'A Leaflet map renders the beer finder, backed by a data and geocoding workflow that turns the brewery’s list of accounts into coordinates the map can plot.',
        },
        {
          title: 'Delivery',
          body: 'Deployed on Vercel and shipped publicly with the Arlington Brewing team.',
        },
      ],
      constraints: [
        {
          title: 'Addresses are messy',
          body: 'Real distribution lists are not clean data. The geocoding workflow has to tolerate inconsistent address formatting and still produce a map that is trustworthy enough to send someone across town.',
        },
      ],
      outcome: [
        'The site is live at drinkarlingtonbeer.com and was taken from development through public launch.',
        'The production experience includes an age gate, beer catalog and detail content, events, taproom information and location discovery.',
        'The brewery team can publish and update content without developer involvement.',
      ],
      next: [
        'Richer availability signals on the finder, so a pin communicates freshness as well as location.',
        'Event and release content that can be scheduled ahead of time.',
        'Structured data for events, so listings surface properly in search.',
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
    featured: true,
    order: 3,
    accent: 'gold',
    tagline: 'The portfolio you are reading, which makes it a recursive project.',
    recursionTrigger: 'recursive',
    summary:
      'A personal site built like a product: one typed content layer feeding every page, card, sitemap entry and social image, a two-surface design system that clears WCAG AA by construction, a validated contact API, and a test suite that checks the copy as carefully as the code.',
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
      statement:
        'A personal site treated as a small product: typed content, a deliberate design system, honest imagery and a test suite, so it stays accurate as the work it describes keeps changing.',
      context: [
        'A portfolio is usually the least maintained thing an engineer owns. It gets written once, drifts out of date, and quietly starts describing someone who no longer exists.',
        'I wanted one that behaves like the rest of my work: every fact stored once, every page generated from it, and a build that fails when something stops being true.',
      ],
      owned: [
        'Visual direction, typography and the two-surface design system.',
        'The typed content layer and every word of copy in it.',
        'Routing, metadata, structured data, sitemap and generated social images.',
        'The contact endpoint: validation, spam resistance and rate limiting.',
        'The authored project covers and the script that generates them.',
        'Unit and end-to-end tests, including accessibility and contrast checks.',
      ],
      decisions: [
        {
          title: 'Copy is data, not markup',
          body: 'Every sentence lives in typed modules under content/. Components never hardcode copy, so cards, case studies, the sitemap and structured data all read the same source and cannot disagree with each other.',
        },
        {
          title: 'Illustrations that admit they are illustrations',
          body: 'Project covers are authored artwork rather than screenshots, and the interface says so in a caption. A fabricated product capture would be a small lie on the first thing people look at.',
        },
        {
          title: 'Complete without JavaScript',
          body: 'Scroll reveals are opt-in: content is visible by default and only animates once a script has confirmed it can. With scripts disabled or reduced motion requested, the page is simply finished.',
        },
      ],
      architecture: [
        {
          title: 'Application',
          body: 'Next.js 16 App Router with React 19 and TypeScript. Every page except the contact endpoint is statically prerendered, with per-project routes generated from the content layer.',
        },
        {
          title: 'Design system',
          body: 'Two surfaces, midnight ink and warm paper, expressed as semantic custom properties declared through Tailwind 4 utilities. One class on a section swaps its entire colour context, and each project accent resolves to an AA-safe value on either surface.',
        },
        {
          title: 'Metadata',
          body: 'Canonical URLs, JSON-LD, the sitemap and per-route Open Graph images are derived from the same project data the pages render, so adding a project updates all of them.',
        },
        {
          title: 'Contact',
          body: 'A server route validates independently of the client, carries a honeypot and minimum fill time, applies a per-IP rate limit, and reports honestly when no delivery provider is configured.',
        },
      ],
      constraints: [
        {
          title: 'Base case',
          body: 'Describing a site from inside that same site is, strictly speaking, recursion. The hard part was making sure it terminates.',
        },
      ],
      outcome: [
        'The site you are reading: statically generated, accessible, and driven entirely by typed content.',
        'Tests assert content integrity, heading order, keyboard operation, focus visibility and WCAG AA contrast on every route.',
        'Adding or retiring a project is a single content change; routes, metadata and navigation follow.',
      ],
      next: [
        'Real product captures to sit alongside the authored covers.',
        'Short write-ups on individual engineering decisions, published from the same content layer.',
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
