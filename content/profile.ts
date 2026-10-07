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
    title: 'A New Englander who is usually making something.',
    body: [
      'I’m New England from start to finish. I spent my summers in Nyes Neck on Cape Cod, went to Tufts just outside Boston, and now call southern New Hampshire home. I love places with a little history and character: an old neighborhood, a diner that hasn’t changed in decades, or anywhere near the water.',
      'Outside of work, you will usually find me cooking, at the gym, out on a hike or in the water. I love good food, a good cocktail and any excuse to have people over (and yes, I put way too much thought into the details of a party). There is almost always music playing somewhere in the background, and Donny, my orange cat, is never far away.',
      'I am happiest when I am making something or chasing down a new idea. I care a lot about my family, my friends and the places that made me. I’m curious by nature, a little obsessive about the projects I love, and rarely bored.',
    ],
    /** Pull-quote rendered as an editorial aside. */
    aside: {
      quote: 'Engineer by day. Builder after hours.',
      caption: 'The short version.',
    },
  },

  /** Off-the-clock list beside the About intro. From Joey's own writing. */
  offClock: [
    { label: 'In the kitchen', detail: 'Cooking, baking and feeding whoever shows up' },
    { label: 'Outside somewhere', detail: 'Hiking, swimming, or anywhere near the water' },
    { label: 'Playing host', detail: 'Good food, cocktails, music and a full house' },
    { label: 'Cape Cod bound', detail: 'Nyes Neck will always feel like home' },
    { label: 'Donny duty', detail: 'Life with one very involved orange cat' },
  ],

  contact: {
    kicker: 'Contact',
    headline: 'Have an idea that should exist?',
    body: "I'm always interested in thoughtful products, ambitious builds, and people working on something real.",
  },
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
