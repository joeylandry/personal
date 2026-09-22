import { expect, test, type Page } from '@playwright/test';

/* ------------------------------------------------------------------ colour */

type Rgb = [number, number, number];

function parse(color: string): Rgb | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match?.[1]) return null;
  const parts = match[1].split(',').map((value) => parseFloat(value));
  const [r, g, b, a] = parts;
  if (r === undefined || g === undefined || b === undefined) return null;
  if (a !== undefined && a < 0.99) return null; // translucent: skip rather than guess
  return [r, g, b];
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

/** Every text node's colour against the nearest opaque ancestor background. */
async function sample(page: Page) {
  return page.evaluate(() => {
    const results: {
      text: string;
      color: string;
      background: string;
      size: number;
      weight: number;
    }[] = [];

    const backgroundOf = (node: Element | null): string => {
      while (node) {
        const value = getComputedStyle(node).backgroundColor;
        if (value && !value.includes('rgba(0, 0, 0, 0)')) return value;
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };

    for (const element of Array.from(document.querySelectorAll('body *'))) {
      const own = Array.from(element.childNodes)
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent?.trim() ?? '')
        .join(' ')
        .trim();
      if (own.length < 2) continue;

      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      results.push({
        text: own.slice(0, 48),
        color: style.color,
        background: backgroundOf(element),
        size: parseFloat(style.fontSize),
        weight: Number(style.fontWeight) || 400,
      });
    }
    return results;
  });
}

const ROUTES = [
  '/',
  '/work',
  '/work/nyes-neck',
  '/work/arlington-brewing-company',
  '/work/the-black-veil',
];

test.describe('colour contrast', () => {
  for (const route of ROUTES) {
    test(`meets WCAG AA on ${route}`, async ({ page }) => {
      await page.goto(route);
      // Reveal everything so off-screen text is measured too.
      await page.evaluate(() => {
        document
          .querySelectorAll('.reveal')
          .forEach((node) => node.setAttribute('data-shown', 'true'));
      });
      await page.waitForTimeout(250);

      const failures: string[] = [];
      for (const entry of await sample(page)) {
        const fg = parse(entry.color);
        const bg = parse(entry.background);
        if (!fg || !bg) continue;

        // WCAG large text: >=24px, or >=18.66px when bold.
        const large = entry.size >= 24 || (entry.size >= 18.66 && entry.weight >= 700);
        const required = large ? 3 : 4.5;
        const ratio = contrast(fg, bg);
        if (ratio < required) {
          failures.push(
            `"${entry.text}" ${ratio.toFixed(2)}:1 (needs ${required}) ${entry.color} on ${entry.background}`,
          );
        }
      }
      expect(failures, failures.join('\n')).toEqual([]);
    });
  }
});

test.describe('keyboard and assistive technology', () => {
  test('has one h1 and a sensible heading order', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    const levels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4')).map((node) =>
        Number(node.tagName.slice(1)),
      ),
    );
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!, `heading jump at index ${i}`).toBeLessThanOrEqual(1);
    }
  });

  test('declares the main landmarks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header[data-site-header]')).toHaveCount(1);
    await expect(page.locator('main#main')).toHaveCount(1);
    // contentinfo excludes the <footer> nested inside a blockquote, which is
    // scoped to its sectioning element and is not a landmark.
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    // Below the md breakpoint the primary nav lives behind the menu button,
    // so the landmark is exposed once the panel is open.
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await page.getByRole('button', { name: 'Open menu' }).click();
    }
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);
  });

  test('shows a visible focus ring on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab'); // skip link
    await page.keyboard.press('Tab'); // home / monogram
    const outline = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return null;
      const style = getComputedStyle(active);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(outline?.style).not.toBe('none');
    expect(parseFloat(outline?.width ?? '0')).toBeGreaterThan(0);
  });

  test('every link and button has an accessible name', async ({ page }) => {
    await page.goto('/');
    for (const role of ['link', 'button'] as const) {
      for (const node of await page.getByRole(role).all()) {
        const name = (await node.getAttribute('aria-label')) ?? (await node.innerText());
        expect(name.trim().length, `${role} without a name`).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, traps focus, closes on Escape and returns focus', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const panel = page.locator('#mobile-nav');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Work' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('navigates from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('#mobile-nav').getByRole('link', { name: 'Contact' }).click();
    await expect(page.locator('#mobile-nav')).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
  });
});

test.describe('motion and progressive enhancement', () => {
  test('shows all content immediately under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hidden = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.reveal'));
      return nodes.filter((node) => Number(getComputedStyle(node).opacity) < 0.99).length;
    });
    expect(hidden).toBe(0);
  });

  test('stays readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Sections far down the page must be visible without an observer running.
    await expect(
      page.getByRole('heading', { name: /Where I.{0,3}ve been building/ }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Nyes Neck Clothing/ }).first()).toBeVisible();
    await context.close();
  });
});
