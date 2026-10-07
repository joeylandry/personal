import { expect, test } from '@playwright/test';
import { mockListening } from '../lib/spotify-mock';

/** The hero's two-faced music card: my ears first, the site sound on swap or scroll. */

test.describe('hero music card', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/now-playing', (route) =>
      route.fulfill({ json: mockListening(Date.now()) }),
    );
    await page.route('https://open.spotify.com/**', (route) => route.abort());
    await page.goto('/');
  });

  const face = (page: import('@playwright/test').Page, side: 'left' | 'right') =>
    page.locator(`.hero-sound-face[data-side="${side}"]`);

  test('opens on what is playing in my ears and links to the listening section', async ({
    page,
  }) => {
    await expect(face(page, 'left')).toHaveAttribute('data-active', 'true');
    await expect(face(page, 'left')).toContainText('Playing in my ears');
    await expect(face(page, 'left').getByRole('link')).toHaveAttribute('href', '/about#listening');
  });

  test('swaps to the site sound and back from the dots', async ({ page }) => {
    await expect(face(page, 'left')).toHaveAttribute('data-active', 'true');
    await page.getByRole('button', { name: 'Show the site sound' }).click();
    await expect(face(page, 'right')).toHaveAttribute('data-active', 'true');
    await expect(face(page, 'right')).toContainText('Site sound');
    await page.getByRole('button', { name: /in my ears/ }).click();
    await expect(face(page, 'left')).toHaveAttribute('data-active', 'true');
  });

  test('flips to the site sound once, as the card scrolls away', async ({ page }) => {
    await expect(face(page, 'left')).toHaveAttribute('data-active', 'true');
    await page.evaluate(() => {
      const card = document.querySelector('.hero-sound')!;
      window.scrollBy(0, card.getBoundingClientRect().bottom - 100);
    });
    await expect(face(page, 'right')).toHaveAttribute('data-active', 'true');
  });
});
