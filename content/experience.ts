import type { SkillGroup, TimelineEntry } from './types';

/**
 * Experience and education. Verified, high-level and deliberately free of
 * invented responsibilities, team names, internal systems or business impact.
 */
export const timeline: TimelineEntry[] = [
  {
    org: 'Fidelity Investments',
    title: 'Associate Software Engineer',
    period: 'Aug 2026 — Present',
    start: '2026-08',
    end: null,
    location: 'Merrimack, New Hampshire',
    kind: 'work',
    current: true,
    notes: ['Full-time, after completing the Fidelity LEAP internship path.'],
  },
  {
    org: 'Tufts University',
    title: 'B.S. Computer Science',
    period: 'Sep 2022 — May 2026',
    start: '2022-09',
    end: '2026-05',
    kind: 'education',
    distinction: 'cum laude',
    notes: ['Bachelor of Science in Computer Science.'],
  },
  {
    org: 'Fidelity Investments',
    title: 'Software Engineer Intern',
    period: 'Jun — Aug 2025',
    start: '2025-06',
    end: '2025-08',
    location: 'Merrimack, New Hampshire',
    kind: 'work',
    notes: ['Summer internship on the LEAP path.'],
    skills: ['Full-stack development', 'Agile', 'TypeScript', 'React', 'Python', 'Version control'],
  },
  {
    org: 'Distributor Corporation of New England',
    title: 'Software Development Intern',
    period: 'May — Aug 2024',
    start: '2024-05',
    end: '2024-08',
    location: 'Malden, Massachusetts',
    kind: 'work',
    notes: ['Worked across software infrastructure and project planning.'],
  },
  {
    org: 'Tufts University',
    title: 'Student Worker',
    period: 'Jan — May 2024',
    start: '2024-01',
    end: '2024-05',
    kind: 'work',
    notes: ['Part-time during the spring semester.'],
  },
];

/**
 * Capabilities grouped by what they are actually for. Scoped to the production
 * work on this site — no badge wall, no tools that are not represented above.
 */
export const skillGroups: SkillGroup[] = [
  {
    label: 'Product engineering',
    blurb: 'The layer people actually touch.',
    items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'HTML', 'CSS', 'Responsive design'],
  },
  {
    label: 'Backend & data',
    blurb: 'State, identity and the contracts between them.',
    items: [
      'Node.js patterns',
      'REST & API routes',
      'PostgreSQL',
      'Drizzle ORM',
      'Database design',
      'Authentication & session design',
    ],
  },
  {
    label: 'Content & commerce',
    blurb: 'Systems a non-developer can run after launch.',
    items: [
      'Sanity CMS',
      'Printful integration',
      'Formspree',
      'Content modeling',
      'E-commerce architecture',
    ],
  },
  {
    label: 'Maps & discovery',
    blurb: 'Putting things where people can find them.',
    items: ['Leaflet', 'Geocoding & data synchronization', 'Location-aware interfaces'],
  },
  {
    label: 'Also working in',
    blurb: 'Languages outside the front of the stack.',
    items: ['Python', 'SQL', 'Java', 'C'],
  },
  {
    label: 'Engineering workflow',
    blurb: 'How the work gets shipped and kept honest.',
    items: [
      'Git & version control',
      'Agile collaboration',
      'CI concepts',
      'Testing',
      'Linting & type checking',
      'Vercel deployment',
    ],
  },
];
