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

/** Tools and languages, grouped loosely. Limited to what the projects above use. */
export const skillGroups: SkillGroup[] = [
  {
    label: 'Frontend',
    items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    label: 'Backend & data',
    items: [
      'Node.js',
      'REST APIs',
      'PostgreSQL',
      'Drizzle ORM',
      'Database design',
      'Authentication',
    ],
  },
  {
    label: 'CMS & e-commerce',
    items: ['Sanity', 'Printful', 'Formspree', 'Content modeling'],
  },
  {
    label: 'Maps',
    items: ['Leaflet', 'Geocoding'],
  },
  {
    label: 'Other languages',
    items: ['Python', 'SQL', 'Java', 'C'],
  },
  {
    label: 'Workflow',
    items: ['Git', 'Agile', 'Testing', 'Linting & type checking', 'Vercel'],
  },
];
