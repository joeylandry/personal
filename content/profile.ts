import type { Exploration, SocialLink } from './types';

export const profile = {
  name: 'Joey Landry',
  /** Formal name used in structured data. */
  legalName: 'Joseph Landry',
  initials: 'JL',
  role: 'Software Engineer',
  /** Employment line. Kept factual — no endorsement implied. */
  employer: 'Fidelity Investments',
  employerRole: 'Associate Software Engineer',
  location: 'New Hampshire',

  hero: {
    headline: ["Hi, I'm Joey.", 'I write software at Fidelity and build websites on the side.'],
    support:
      'I studied computer science at Tufts. Outside of work I built the online store for Nyes Neck, an apparel brand that grew out of a fundraiser I started when I was nine, and the website for Arlington Brewing Company.',
    primaryCta: { label: 'See my work', href: '/work' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/joeylandry' },
  },

  /** Short bio used for meta descriptions and structured data. */
  metaDescription:
    'Joey Landry is a software engineer at Fidelity and a Tufts computer science graduate. On the side he builds websites, including the Nyes Neck apparel store and the Arlington Brewing Company site.',

  about: {
    title: 'About me',
    body: [
      'When I was nine, I set up a lemonade stand and sold bracelets in Nyes Neck, a neighborhood on Cape Cod. I raised $50 that first year and gave it to Make-A-Wish Massachusetts and Rhode Island.',
      'The neighbors got involved and it kept growing. Over the next nine years we added movie nights, raffles, apparel and live music, and raised more than $20,000 in total.',
      'I studied computer science at Tufts and graduated cum laude in 2026. I interned at Fidelity in 2025 and started there full time as an associate software engineer in August 2026.',
      "Outside of work I build websites. Right now that's mostly Nyes Neck Clothing & Apparel, an online store that keeps the fundraiser going and gives part of its proceeds to St. Jude, and the site for Arlington Brewing Company. I've also worked on location tools, event systems and a few security games.",
    ],
  },

  /** Milestones for the origin/impact story. Verified facts only. */
  impact: [
    { year: '2013', label: 'A lemonade stand and bracelets in Nyes Neck', value: '$50 raised' },
    { year: '2013–2021', label: 'Movie nights, raffles, apparel, live music', value: '9 years' },
    {
      year: 'Total',
      label: 'Raised for Make-A-Wish Massachusetts and Rhode Island',
      value: '$20,000+',
    },
    { year: 'Today', label: 'Nyes Neck Clothing & Apparel supports St. Jude', value: 'Ongoing' },
  ],

  contact: {
    headline: 'Get in touch',
    body: "Send me a message with the form, or find me on LinkedIn. I'm happy to hear about projects, jobs, or anything else.",
  },

  footerNote:
    'Designed and built by Joey Landry. Independent projects are my own and are not affiliated with or endorsed by my employer.',
} as const;

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/joeylandry', handle: '@joeylandry' },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/josephlandry/',
    handle: 'in/josephlandry',
  },
];

export const explorations: Exploration[] = [
  {
    title: 'AI-assisted development',
    body: 'I use AI tools a lot when I code. I want to know which parts of the job they actually speed up, and which parts still need someone to think carefully.',
  },
  {
    title: 'AI and cybersecurity',
    body: 'How AI changes the way vulnerabilities get found and exploited, and how it can help on the defensive side. This is what I read about most right now.',
  },
  {
    title: 'Sites for small, local groups',
    body: 'Websites and tools for a specific group of people, like a neighborhood, a brewery or a group of friends. Most of what I have built so far fits here.',
  },
];
