/**
 * Content types for the site.
 *
 * Everything a visitor reads lives in `content/*` as typed data. Layout code
 * never hardcodes copy, so content can be edited without touching components,
 * and `tests/content.test.ts` can assert integrity across the whole site.
 */

/** Where a project currently stands. Surfaced honestly in the UI. */
export type ProjectStatus = 'live' | 'launched' | 'exploratory';

export interface StackGroup {
  /** e.g. "Framework", "Data", "Content" */
  label: string;
  items: string[];
}

/** A named block of case-study prose. */
export interface CaseStudyBlock {
  title: string;
  body: string;
}

export interface CaseStudy {
  /** One sentence. What the product is, in plain language. */
  statement: string;
  /** Why the project exists. */
  context: string[];
  /** Explicit ownership — what Joey personally did. */
  owned: string[];
  /** Product and UX decisions, each with reasoning. */
  decisions: CaseStudyBlock[];
  /** How it is built. */
  architecture: CaseStudyBlock[];
  /** Genuinely hard constraints. Omitted when there is nothing verified to say. */
  constraints?: CaseStudyBlock[];
  /** Verified outcomes only. No invented metrics. */
  outcome: string[];
  /** Forward product thinking, clearly labelled as not-yet-built. */
  next: string[];
}

export interface ProjectImage {
  /** Path under /public. */
  src: string;
  /** Meaningful alt text, never "screenshot of website". */
  alt: string;
  width: number;
  height: number;
  /**
   * True when `src` is an authored illustration rather than a capture of the
   * live product. Drives the honest caption under the frame.
   */
  illustrated: boolean;
}

export interface Project {
  slug: string;
  /** Display name. */
  name: string;
  /** Short label for nav, cards and breadcrumbs. */
  shortName: string;
  /** Category line, e.g. "E-commerce · Brand". */
  kind: string;
  role: string;
  year: string;
  status: ProjectStatus;
  featured: boolean;
  /** Sort order within featured work. */
  order: number;
  /** One line, headline-grade. */
  tagline: string;
  /** Two to three sentences for cards and meta descriptions. */
  summary: string;
  liveUrl?: string;
  repoUrl?: string;
  /** Domain shown as a mono caption. Derived from liveUrl at build. */
  stack: StackGroup[];
  /** Compact stack chips for cards — a subset of `stack`. */
  highlights: string[];
  image: ProjectImage;
  /** Accent token name applied to this project's sections. */
  accent: 'sea' | 'amber' | 'gold';
  caseStudy: CaseStudy;
}

export interface TimelineEntry {
  org: string;
  title: string;
  /** e.g. "Aug 2026 — Present" */
  period: string;
  /** ISO-ish sortable start (YYYY-MM). */
  start: string;
  /**
   * ISO-ish sortable end (YYYY-MM), or null while ongoing. The timeline is
   * ordered by this, newest first, so a degree finished in 2026 sits above an
   * internship that started later than the degree did.
   */
  end: string | null;
  location?: string;
  kind: 'work' | 'education';
  /** Short, verified notes. Never invented responsibilities. */
  notes: string[];
  /** Publicly associated skills, when no project detail is public. */
  skills?: string[];
  /** e.g. "cum laude" */
  distinction?: string;
  current?: boolean;
}

export interface SkillGroup {
  label: string;
  /** One line explaining what this group is for. */
  blurb: string;
  items: string[];
}

export interface Exploration {
  index: string;
  title: string;
  body: string;
}

export interface CredibilitySignal {
  value: string;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}
