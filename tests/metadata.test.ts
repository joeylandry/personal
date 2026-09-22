import { describe, expect, it } from 'vitest';
import { featuredProjects, projects } from '@/content';
import {
  breadcrumbSchema,
  collectionSchema,
  jsonLdString,
  personSchema,
  profilePageSchema,
  projectSchema,
  websiteSchema,
} from '@/lib/jsonld';
import { absoluteUrl, navLinks, siteTitle, siteUrl } from '@/lib/site';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('site urls', () => {
  it('never carries a trailing slash', () => {
    expect(siteUrl.endsWith('/')).toBe(false);
  });

  it('builds absolute urls from site-relative paths', () => {
    expect(absoluteUrl('/work')).toBe(`${siteUrl}/work`);
    expect(absoluteUrl('/')).toBe(`${siteUrl}/`);
    expect(absoluteUrl('/work/nyes-neck')).toBe(`${siteUrl}/work/nyes-neck`);
  });

  it('uses a descriptive default title', () => {
    expect(siteTitle).toBe('Joey Landry — Software Engineer & Builder');
  });

  it('points every nav link at a real destination', () => {
    const ids = ['work', 'about', 'experience', 'contact'];
    expect(navLinks.map((link) => link.href.split('#')[1])).toEqual(ids);
  });
});

describe('structured data', () => {
  it('describes the person', () => {
    const schema = personSchema();
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('Joey Landry');
    expect(schema.sameAs).toContain('https://github.com/joeylandry');
    expect(schema.sameAs).toContain('https://www.linkedin.com/in/josephlandry/');
  });

  it('never publishes a street address, phone number or private email', () => {
    const graph = JSON.stringify([
      personSchema(),
      websiteSchema(),
      profilePageSchema(),
      collectionSchema(),
      ...projects.map(projectSchema),
    ]);
    expect(graph).not.toMatch(/streetAddress/);
    expect(graph).not.toMatch(/telephone/);
    expect(graph).not.toMatch(/[\w.+-]+@(?!example)[\w-]+\.[\w.]+/);
  });

  it('links the website to the person', () => {
    expect(websiteSchema().publisher).toEqual({ '@id': `${siteUrl}/#person` });
  });

  it('describes each project as a creative work', () => {
    for (const project of projects) {
      const schema = projectSchema(project);
      expect(schema['@type']).toBe('CreativeWork');
      expect(schema.url).toBe(absoluteUrl(`/work/${project.slug}`));
      expect(schema.image).toBe(absoluteUrl(project.image.src));
    }
  });

  it('builds ordered breadcrumbs', () => {
    const crumbs = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work' },
    ]);
    expect(crumbs.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });

  it('escapes angle brackets so a script tag cannot break out', () => {
    expect(jsonLdString({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('sitemap and robots', () => {
  it('lists the homepage, the work index and every project', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(absoluteUrl('/'));
    expect(urls).toContain(absoluteUrl('/work'));
    for (const project of featuredProjects) {
      expect(urls).toContain(absoluteUrl(`/work/${project.slug}`));
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('allows crawling while keeping the api private', () => {
    const rules = robots();
    expect(rules.sitemap).toBe(absoluteUrl('/sitemap.xml'));
    const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(rule?.allow).toBe('/');
    expect(rule?.disallow).toBe('/api/');
  });
});
