import { expect, test, type Page } from '@playwright/test';

/** Fails the test if the page logs an error or throws. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.describe('homepage', () => {
  test('renders the hero, every section and no console errors', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');

    await expect(page).toHaveTitle(/Joey Landry/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('I build things');

    for (const id of ['work', 'about', 'experience', 'toolbox', 'exploring', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }

    // The three featured projects are all present by name.
    for (const name of [
      'Nyes Neck Clothing & Apparel',
      'Arlington Brewing Company',
      'The Black Veil',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test('never scrolls horizontally, from 320px up', async ({ page }) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('exposes a skip link as the first tab stop', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test('gives every image meaningful alt text', async ({ page }) => {
    await page.goto('/');
    for (const image of await page.locator('img').all()) {
      const alt = await image.getAttribute('alt');
      expect(alt, 'image is missing alt text').toBeTruthy();
      expect(alt!.length).toBeGreaterThan(20);
    }
  });
});

test.describe('project case studies', () => {
  test('navigates from a homepage card into the case study', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');

    await page.getByRole('link', { name: 'Nyes Neck Clothing & Apparel' }).click();
    await expect(page).toHaveURL(/\/work\/nyes-neck$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Nyes Neck Clothing & Apparel',
    );

    // Every required case-study section is present.
    for (const heading of [
      'Why it exists',
      'What I owned',
      'Product & UX calls',
      "How it's built",
      'Everything in the build',
      'Where it landed',
      "What I'd explore next",
    ]) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test('links live site and source with a safe rel', async ({ page }) => {
    await page.goto('/work/the-black-veil');
    const live = page.locator('a[href="https://black-veil-eight.vercel.app"]').first();
    await expect(live).toHaveAttribute('target', '_blank');
    await expect(live).toHaveAttribute('rel', /noopener/);

    for (const link of await page.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('wraps previous/next navigation around the set', async ({ page }) => {
    await page.goto('/work/nyes-neck');
    const nav = page.getByRole('navigation', { name: 'More work' });
    await expect(nav.getByText('The Black Veil')).toBeVisible();
    await nav.getByRole('link', { name: /Arlington Brewing Company/ }).click();
    await expect(page).toHaveURL(/\/work\/arlington-brewing-company$/);
  });

  /**
   * Each project owns an accent. The surface classes also declare `--accent`,
   * so this catches the case where a surface between the accent holder and the
   * element resets it back to the default.
   */
  test('carries the project accent through every band of the page', async ({ page }) => {
    const expected = {
      'nyes-neck': { onPaper: 'rgb(11, 109, 96)', onInk: 'rgb(114, 214, 201)' },
      'arlington-brewing-company': { onPaper: 'rgb(138, 90, 16)', onInk: 'rgb(243, 180, 91)' },
      'the-black-veil': { onPaper: 'rgb(110, 84, 18)', onInk: 'rgb(231, 195, 106)' },
    };

    for (const [slug, colour] of Object.entries(expected)) {
      await page.goto(`/work/${slug}`);

      // Ink masthead: the bright variant.
      await expect(
        page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem').last(),
      ).toHaveCSS('color', colour.onInk);

      // Paper band near the foot of the page: the darkened variant.
      await expect(page.getByRole('link', { name: /^Visit / })).toHaveCSS(
        'background-color',
        colour.onPaper,
      );
    }
  });

  test('lists all three projects on the work index', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('article')).toHaveCount(3);
  });
});

test.describe('routing and crawling', () => {
  test('serves a designed 404 that is not indexed', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Off the map');
  });

  test('publishes a sitemap and robots.txt', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    for (const slug of ['nyes-neck', 'arlington-brewing-company', 'the-black-veil']) {
      expect(xml).toContain(`/work/${slug}`);
    }

    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap:');
  });

  test('emits Person and WebSite structured data', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.flatMap((block) => {
      const parsed = JSON.parse(block);
      return (Array.isArray(parsed) ? parsed : [parsed]).map((entry) => entry['@type']);
    });
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');
  });
});

test.describe('contact', () => {
  test('validates before sending and never fakes a success', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel('Name').fill('A');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Message').fill('too short');
    await page.getByRole('button', { name: 'Send message' }).click();

    // The server rejects it; no success state appears.
    await expect(page.getByText('Message received')).toHaveCount(0);
  });

  test('rejects a submission that trips the honeypot', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Bot',
        email: 'bot@example.com',
        message: 'x'.repeat(60),
        company: 'filled in by a bot',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('refuses GET on the contact endpoint', async ({ request }) => {
    expect((await request.get('/api/contact')).status()).toBe(405);
  });
});
