import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  displayHost,
  explorations,
  featuredProjects,
  getProject,
  getProjectNeighbors,
  profile,
  projects,
  skillGroups,
  socials,
  statusLabels,
  timeline,
} from '@/content';

const ROOT = join(__dirname, '..');

describe('projects', () => {
  it('features the two production client and brand sites', () => {
    expect(featuredProjects.map((p) => p.slug)).toEqual(['nyes-neck', 'arlington-brewing-company']);
  });

  it('keeps this site as an unfeatured write-up', () => {
    expect(getProject('joeylandry-com')?.featured).toBe(false);
  });

  it('has unique slugs and unique ordering', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const orders = featuredProjects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('uses url-safe slugs', () => {
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s has valid external links',
    (_slug, project) => {
      for (const url of [project.liveUrl, project.repoUrl].filter(Boolean) as string[]) {
        expect(() => new URL(url)).not.toThrow();
        expect(new URL(url).protocol).toBe('https:');
      }
    },
  );

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s ships a local image with real alt text',
    (_slug, project) => {
      expect(project.image.src.startsWith('/')).toBe(true);
      expect(existsSync(join(ROOT, 'public', project.image.src))).toBe(true);
      expect(project.image.alt.length).toBeGreaterThan(40);
      expect(project.image.alt.toLowerCase()).not.toMatch(/^(image|screenshot|photo) of/);
      expect(project.image.width).toBeGreaterThan(0);
      expect(project.image.height).toBeGreaterThan(0);
    },
  );

  it.each(projects.map((p) => [p.slug, p] as const))(
    '%s has a complete case study',
    (_slug, project) => {
      const cs = project.caseStudy;
      expect(cs.statement.length).toBeGreaterThan(30);
      expect(cs.context.length).toBeGreaterThan(0);
      expect(cs.owned.length).toBeGreaterThan(2);
      expect(cs.architecture.length).toBeGreaterThan(1);
      expect(cs.outcome.length).toBeGreaterThan(1);
      // Optional sections are either absent or non-empty.
      for (const section of [cs.decisions, cs.constraints, cs.next]) {
        if (section) expect(section.length).toBeGreaterThan(0);
      }
      const blocks = [...(cs.decisions ?? []), ...cs.architecture, ...(cs.constraints ?? [])];
      for (const block of blocks) {
        expect(block.title.length).toBeGreaterThan(3);
        expect(block.body.length).toBeGreaterThan(40);
      }
    },
  );

  it('declares a stack for every project and matching highlight chips', () => {
    for (const project of projects) {
      expect(project.stack.length).toBeGreaterThan(2);
      expect(project.highlights.length).toBeGreaterThan(2);
      expect(statusLabels[project.status]).toBeTruthy();
    }
  });

  it('wraps previous/next navigation around the featured set', () => {
    const first = getProjectNeighbors('nyes-neck');
    expect(first?.previous.slug).toBe('arlington-brewing-company');
    expect(first?.next.slug).toBe('arlington-brewing-company');

    // Unfeatured projects sit outside the loop.
    expect(getProjectNeighbors('joeylandry-com')).toBeNull();
    expect(getProjectNeighbors('does-not-exist')).toBeNull();
  });

  it('only offers the recursion joke where the tagline can carry it', () => {
    for (const project of projects) {
      if (project.recursionTrigger) {
        expect(project.tagline).toContain(project.recursionTrigger);
        // The joke replaces the live link; a real one would be skipped.
        expect(project.liveUrl).toBeUndefined();
      }
    }
    expect(projects.filter((p) => p.recursionTrigger)).toHaveLength(1);
  });

  it('looks projects up by slug', () => {
    expect(getProject('nyes-neck')?.name).toBe('Nyes Neck Clothing & Apparel');
    expect(getProject('nope')).toBeUndefined();
  });

  it('derives display hosts without the www prefix', () => {
    expect(displayHost('https://www.nyesneck.shop')).toBe('nyesneck.shop');
    expect(displayHost('https://drinkarlingtonbeer.com')).toBe('drinkarlingtonbeer.com');
  });
});

describe('portfolio boundary', () => {
  const haystack = JSON.stringify({ projects, profile, timeline, skillGroups, explorations });

  it.each(['chonchos', 'space shooters', 'sgedu.site', 'homework', 'class assignment'])(
    'never surfaces retired work: %s',
    (term) => {
      expect(haystack.toLowerCase()).not.toContain(term);
    },
  );

  it('links the GitHub profile rather than enumerating repositories', () => {
    expect(socials.some((s) => s.href === 'https://github.com/joeylandry')).toBe(true);
  });
});

describe('voice', () => {
  const prose = JSON.stringify({ projects, profile, explorations, skillGroups });

  it.each([
    'passionate developer',
    'innovative solution',
    'cutting-edge',
    'pixel-perfect',
    'results-driven',
    'leveraging',
    'lorem ipsum',
    'synergy',
  ])('avoids the phrase "%s"', (phrase) => {
    expect(prose.toLowerCase()).not.toContain(phrase);
  });
});

describe('experience', () => {
  it('lists newest first by end date, with ongoing roles at the top', () => {
    // `null` means "present", which sorts above every finished entry.
    const keys = timeline.map((entry) => entry.end ?? '9999-99');
    expect([...keys].sort().reverse()).toEqual(keys);
  });

  it('uses YYYY-MM keys and never ends before it starts', () => {
    for (const entry of timeline) {
      expect(entry.start).toMatch(/^\d{4}-\d{2}$/);
      if (entry.end !== null) {
        expect(entry.end).toMatch(/^\d{4}-\d{2}$/);
        expect(entry.end >= entry.start).toBe(true);
      }
    }
  });

  it('marks the ongoing role as current', () => {
    for (const entry of timeline) {
      expect(entry.current ?? false).toBe(entry.end === null);
    }
  });

  it('marks exactly one current role', () => {
    expect(timeline.filter((entry) => entry.current)).toHaveLength(1);
  });

  it('records the Tufts degree with its distinction', () => {
    const tufts = timeline.find((entry) => entry.kind === 'education');
    expect(tufts?.org).toBe('Tufts University');
    expect(tufts?.distinction).toBe('cum laude');
  });

  it('omits high school entirely', () => {
    expect(JSON.stringify(timeline).toLowerCase()).not.toContain('high school');
  });
});

describe('profile', () => {
  it('states the verified fundraising total', () => {
    expect(JSON.stringify(profile.impact)).toContain('$20,000+');
  });

  it('keeps the hero headline short', () => {
    expect(profile.hero.headline.length).toBeGreaterThan(0);
    expect(profile.hero.headline.join(' ').length).toBeLessThan(90);
  });

  it('exposes three explorations with unique titles', () => {
    expect(explorations).toHaveLength(3);
    expect(new Set(explorations.map((item) => item.title)).size).toBe(3);
  });

  it('uses https for every social link', () => {
    for (const social of socials) {
      expect(new URL(social.href).protocol).toBe('https:');
    }
  });

  it('disclaims employer affiliation in the footer', () => {
    expect(profile.footerNote.toLowerCase()).toContain('not affiliated');
  });
});
