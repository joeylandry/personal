import type { Exploration, SocialLink } from './types';

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
  signature: 'midnight vibecoder',

  hero: {
    eyebrow: 'Joey Landry · Merrimack, NH',
    headline: ['Building software', 'alone in the woods', 'with a cat.'],
    support:
      "I'm a software engineer at Fidelity and a Tufts CS graduate. After hours, I design and build full-stack products, from community-powered commerce and local-business discovery to tools that make giving back easier.",
    primaryCta: { label: "See what I've built", href: '/work' },
    secondaryCta: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/josephlandry/' },
  },

  /** Short bio used for meta descriptions and structured data. */
  metaDescription:
    'Joey Landry is a software engineer at Fidelity and a Tufts CS graduate who designs and ships full-stack products after hours: e-commerce, content platforms and location tools.',

  about: {
    kicker: 'About me',
    title: 'Happiest on the water, or halfway through building something.',
    body: [
      'I grew up spending every summer in Nyes Neck, a small neighborhood on Cape Cod. Weekends meant boat days out to Bassetts Island, sunsets over Buzzards Bay and a neighborhood that showed up for each other. A lot of who I am still comes from that place.',
      'I like making things, and I like doing it with my own hands. That started with handmade signs and custom Nyes Neck merch for my fundraisers, and somewhere along the way it turned into software. Today I’m a software engineer at Fidelity, a Tufts CS grad, and the person who stays up too late building one more feature on a side project.',
      'Outside of code, you will find me camping on Bassetts Island with my best friend (a tradition we keep every summer), cooking over a fire, or on whatever dance floor is playing Whitney Houston. I care about community, I love a good party, and I am happiest when I can bring people together.',
    ],
    /** Pull-quote rendered as an editorial aside. */
    aside: {
      quote: 'Engineer by day. Builder after hours.',
      caption: 'The short version.',
    },
  },

  /** Off-the-clock list beside the About intro. From Joey's own writing. */
  offClock: [
    { label: 'Boat days', detail: 'Buzzards Bay, out to Bassetts Island' },
    { label: 'Camping', detail: 'One night on Bassetts Island, every summer' },
    { label: 'On repeat', detail: 'Remi Wolf, and Whitney Houston on any dance floor' },
    { label: 'Cooking', detail: 'Steaks over a campfire, and the occasional bake' },
    { label: 'Building', detail: 'Side projects, usually late at night, usually with Donny' },
  ],

  contact: {
    kicker: 'Contact',
    headline: 'Have an idea that should exist?',
    body: "I'm always interested in thoughtful products, ambitious builds, and people working on something real.",
  },

  footerNote:
    'Designed and built by Joey Landry. Independent projects are my own and are not affiliated with or endorsed by my employer.',
} as const;

export const socials: SocialLink[] = [
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
    body: 'How much of the distance between an idea and a working product AI actually removes, and which parts of engineering judgement it does not.',
  },
  {
    index: '02',
    title: 'AI and cybersecurity',
    body: 'The new attack surfaces AI creates, how it changes vulnerability discovery, and where it can carry real weight in defensive automation. An active interest, and the direction I am reading and building toward.',
  },
  {
    index: '03',
    title: 'Small products, real communities',
    body: 'Focused digital products that make a specific group of people better off (a neighborhood, a taproom, a table of friends) rather than software built for everyone and no one.',
  },
];
