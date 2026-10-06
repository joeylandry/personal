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
    title: 'Born and raised in New England.',
    body: [
      'I spent my summers in Nyes Neck on Cape Cod, studied computer science at Tufts just outside Boston, and now live in southern New Hampshire. I’m drawn to places with history and character, especially anywhere near the water.',
      'Outside of work, I enjoy cooking, staying active at the gym and on the trails, and hosting friends and family. There is usually music playing, and my cat, Donny, is rarely far away.',
      'I’m happiest when I’m building something or working through a new idea. My family, my friends and the places I come from matter a great deal to me, and they shape much of what I make.',
    ],
    /** Pull-quote rendered as an editorial aside. */
    aside: {
      quote: 'Engineer by day. Builder after hours.',
      caption: 'The short version.',
    },
  },

  /** Off-the-clock list beside the About intro. From Joey's own writing. */
  offClock: [
    { label: 'Cooking', detail: 'Cooking and baking for friends and family' },
    { label: 'Outdoors', detail: 'Hiking, swimming and time near the water' },
    { label: 'Hosting', detail: 'Bringing people together over good food and music' },
    { label: 'Cape Cod', detail: 'Nyes Neck will always feel like home' },
    { label: 'Donny', detail: 'My orange cat and constant companion' },
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
