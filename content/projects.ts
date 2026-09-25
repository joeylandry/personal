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
        'With help from the neighborhood, that experiment kept expanding — movie nights, raffles, apparel, live music, community events — and over eight years it raised more than $20,000.',
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
    slug: 'the-black-veil',
    name: 'The Black Veil',
    shortName: 'The Black Veil',
    kind: 'Immersive product · Security',
    role: 'Creator & full-stack developer',
    year: '2025—2026',
    status: 'live',
    featured: true,
    order: 3,
    accent: 'gold',
    tagline: 'A Prohibition-era mystery with a real authentication system behind it.',
    summary:
      'An immersive 1920s masquerade mystery that combines a historical-fiction archive, guest RSVP and event operations, signed sessions and magic-link auth, and a server-verified security CTF with a twelve-lab engineering track.',
    liveUrl: 'https://black-veil-eight.vercel.app',
    repoUrl: 'https://github.com/joeylandry/black-veil',
    highlights: ['PostgreSQL', 'Drizzle ORM', 'HMAC sessions', 'CTF'],
    stack: [
      { label: 'Framework', items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4'] },
      { label: 'Data', items: ['PostgreSQL', 'Drizzle ORM', 'Schema migrations'] },
      { label: 'Auth', items: ['HMAC-signed httpOnly sessions', 'One-time magic links'] },
      {
        label: 'Security',
        items: ['Server-only flag & grading logic', 'Seven verified CTF trials'],
      },
      {
        label: 'Systems',
        items: [
          'Ephemeral PGlite SQL sandbox',
          'Optional Resend email',
          'Admin, RSVP & archive tooling',
        ],
      },
    ],
    image: {
      src: '/images/projects/the-black-veil.svg',
      alt: 'Illustrated cover for The Black Veil: a gold art-deco masquerade mask over radiating 1920s fan rays, layered with archive document cards and a terminal line standing in for the security challenges.',
      width: 1600,
      height: 1000,
      illustrated: true,
    },
    caseStudy: {
      statement:
        'An immersive 1920s Prohibition-era masquerade mystery that runs on a real product stack: a sourced historical-fiction archive, guest accounts and event operations, and a server-verified security CTF.',
      context: [
        'The Black Veil is a historical-fiction invitation and archive set in Manchester, New Hampshire, between 1921 and 1926.',
        'It is one experience wearing three hats: a narrative archive to read, an event that real guests RSVP to and attend, and a set of security challenges to solve. Each of those would normally be its own application.',
        'The interesting problem was making them one coherent system — where the story, the guest list and the challenges share an identity model instead of sitting in separate silos.',
      ],
      owned: [
        'The concept, the narrative design and the historical research framing.',
        'The typed archive: newspapers, photographs, police documents, telegrams, notices and invitations, each carrying provenance metadata.',
        'The guest system: RSVP ledger, persistent accounts, signed sessions and cross-device magic-link resume.',
        'Seven in-world CTF trials with server-verified flags.',
        'A twelve-lab "Restoration Bench" engineering track.',
        'The staff review flow for in-person point claims, and the unified scoring that ties every track together.',
      ],
      decisions: [
        {
          title: 'Provenance is a first-class field',
          body: 'Every archive item declares what it is. Real history and fiction sit side by side in the same interface, and the metadata separates them explicitly — the story works better when the seams are honest, and it keeps invented events from being mistaken for the record.',
        },
        {
          title: 'Identity had to survive a party',
          body: 'Guests open the invitation on a phone in a hallway and come back on a laptop days later. Persistent accounts with one-time magic links mean someone can resume across devices without a password, which is the only auth flow that actually fits the moment.',
        },
        {
          title: 'One score, three ways to earn it',
          body: 'Online CTF trials, the engineering labs and in-person point claims all feed one scoreboard. A staff review flow gates the in-person claims, so the physical event and the software stay in sync.',
        },
        {
          title: 'Teach the stack, not just the puzzle',
          body: 'The Restoration Bench covers git, containers, CI, IAM, SQL, code review, debugging and security concepts across twelve labs — the challenges people asked for once they finished the story.',
        },
      ],
      architecture: [
        {
          title: 'Application',
          body: 'Next.js 16, React 19, TypeScript and Tailwind CSS 4, with custom admin, RSVP, archive and CTF systems built on top rather than assembled from off-the-shelf pieces.',
        },
        {
          title: 'Data',
          body: 'PostgreSQL with Drizzle ORM and schema migrations. The archive, the guest ledger and the scoring model are all typed end to end.',
        },
        {
          title: 'Authentication',
          body: 'HMAC-signed httpOnly session cookies and one-time magic links, with optional Resend integration for delivery. Private invitation access is gated on the server.',
        },
        {
          title: 'Challenge integrity',
          body: 'Flag and grading logic is server-only. Nothing that decides whether an answer is correct is shipped to the browser.',
        },
        {
          title: 'SQL sandbox',
          body: 'An ephemeral PGlite instance runs guest-authored, read-only SQL exercises — real query execution with no path to the production database.',
        },
      ],
      constraints: [
        {
          title: 'A CTF whose client cannot be trusted',
          body: 'The whole point of a capture-the-flag is that players will inspect anything you give them. Keeping flags and grading server-only, and giving the SQL labs a throwaway database instead of a connection, is what makes the challenges real rather than decorative.',
        },
        {
          title: 'Fiction with a duty of care',
          body: 'Writing invented documents about a real city in a real decade means being deliberate about sourcing. Provenance metadata is the mechanism that keeps the fiction from quietly becoming someone’s history.',
        },
      ],
      outcome: [
        'A working end-to-end product: archive, guest accounts, event operations, seven server-verified CTF trials and a twelve-lab engineering track, under one scoring system.',
        'Guests can receive a private invitation, RSVP, and resume on another device through a magic link.',
        'Staff can review and approve in-person point claims against the same scoreboard as the online challenges.',
        'Challenge answers, flags and event data stay private by design — they are not in the client bundle, and they are not in this case study.',
      ],
      next: [
        'Making the archive easier to author, so new chapters do not require a developer.',
        'Sharper challenge telemetry — where people get stuck, and which hints actually unblock them.',
        'Running the format again with a different city and decade, reusing the engine.',
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
