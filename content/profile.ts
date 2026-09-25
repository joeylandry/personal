import type { CredibilitySignal, Exploration, SocialLink } from './types';

export const profile = {
  name: 'Joey Landry',
  /** Formal name used in structured data. */
  legalName: 'Joseph Landry',
  initials: 'JL',
  role: 'Software Engineer & Independent Builder',
  /** Employment line. Kept factual — no endorsement implied. */
  employer: 'Fidelity Investments',
  employerRole: 'Associate Software Engineer',
  location: 'New Hampshire',
  /** Neighbourhood-level coastal reference behind the brand. Decorative. */
  origin: 'Nyes Neck · Cape Cod',
  coordinates: '41.63° N · 70.36° W',
  statusLine: 'Based in New Hampshire · Building after dark',
  signature: 'midnight vibecoder',

  hero: {
    eyebrow: 'Joey Landry · Software Engineer & Independent Builder',
    headline: ['I build things that work,', 'feel alive,', 'and mean something.'],
    support:
      "I'm a software engineer at Fidelity and a Tufts CS graduate. After hours, I design and ship full-stack products — from community-powered commerce to brewery discovery.",
    primaryCta: { label: "See what I've built", href: '/#work' },
    secondaryCta: { label: 'GitHub', href: 'https://github.com/joeylandry' },
  },

  /** Short bio used for meta descriptions and structured data. */
  metaDescription:
    'Joey Landry is a software engineer at Fidelity and a Tufts CS graduate who designs and ships full-stack products after hours — e-commerce, content platforms and location tools.',

  about: {
    kicker: 'Origin',
    title: 'I like the moment an idea stops being hypothetical.',
    body: [
      'That started early. At nine, I set up a lemonade stand and sold bracelets in a Cape Cod neighborhood called Nyes Neck. The first year raised $50 for Make-A-Wish Massachusetts and Rhode Island.',
      'The neighborhood kept showing up. Over eight years it grew into movie nights, raffles, apparel, live music and community events, and together we raised more than $20,000.',
      'At Tufts I learned how to turn that same instinct into software. Today I am an associate software engineer at Fidelity, and outside of work I keep building: storefronts, content platforms, location tools and event systems.',
      'The thread is ownership. I like the whole path — from a rough idea to something real people can actually use.',
    ],
    /** Pull-quote rendered as an editorial aside. */
    aside: {
      quote: 'Engineer by day. Builder after dark.',
      caption: 'The short version.',
    },
  },

  /** Milestones for the origin/impact story. Verified facts only. */
  impact: [
    { year: '2013', label: 'A lemonade stand and bracelets in Nyes Neck', value: '$50 raised' },
    { year: '2013—2021', label: 'Movie nights, raffles, apparel, live music', value: '8 years' },
    {
      year: 'Total',
      label: 'Raised for Make-A-Wish Massachusetts and Rhode Island',
      value: '$20,000+',
    },
    { year: 'Today', label: 'Nyes Neck Clothing & Apparel supports St. Jude', value: 'Ongoing' },
  ],

  contact: {
    kicker: 'Contact',
    headline: 'Have an idea that should exist?',
    body: "I'm always interested in thoughtful products, ambitious builds, and people working on something real.",
  },

  footerNote:
    'Designed and built by Joey Landry. Independent projects are my own and are not affiliated with or endorsed by my employer.',
} as const;

export const credibility: CredibilitySignal[] = [
  { value: 'Fidelity', label: 'Software Engineer' },
  { value: 'Tufts', label: 'B.S. Computer Science · cum laude' },
  { value: '$20K+', label: 'Raised for Make-A-Wish' },
  { value: 'Shipped', label: 'Production sites for real organizations' },
];

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
    index: '01',
    title: 'AI-assisted development',
    body: 'How much of the distance between an idea and a working product AI actually removes — and which parts of engineering judgement it does not.',
  },
  {
    index: '02',
    title: 'AI and cybersecurity',
    body: 'The new attack surfaces AI creates, how it changes vulnerability discovery, and where it can carry real weight in defensive automation. An active interest, and the direction I am reading and building toward.',
  },
  {
    index: '03',
    title: 'Small products, real communities',
    body: 'Focused digital products that make a specific group of people better off — a neighborhood, a taproom, a table of friends — rather than software built for everyone and no one.',
  },
];
