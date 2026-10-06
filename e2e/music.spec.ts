import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { mockListening } from '../lib/spotify-mock';

/**
 * The site's record player end to end: the turntable, the live player's rows,
 * the hero's mini record and the header's island, all on one shared player.
 * Spotify's iFrame API is swapped for `fixtures/fake-iframe-api.js`, which
 * behaves like the embed (late commands, loading, updates, a sample that runs
 * out), and the live player is fed the mock listening data.
 */

const FAKE_API = readFileSync(join(__dirname, 'fixtures/fake-iframe-api.js'), 'utf8');
const PINNED_URI = 'spotify:track:5HVcJTb111CdGVwJWPyZcn';

interface FakeSpotify {
  controllers: number;
  uri: string | null;
  paused: boolean;
  position: number;
  log: string[];
}

async function stubSpotify(
  page: Page,
  { options = {}, apiFails = false }: { options?: object; apiFails?: boolean } = {},
) {
  await page.addInitScript((value) => {
    (window as unknown as { __fakeSpotifyOptions: object }).__fakeSpotifyOptions = value;
  }, options);
  await page.route('https://open.spotify.com/**', (route) => {
    if (!apiFails && route.request().url().includes('/embed/iframe-api/')) {
      return route.fulfill({ contentType: 'text/javascript', body: FAKE_API });
    }
    return route.abort();
  });
  await page.route('**/api/now-playing', (route) =>
    route.fulfill({ json: mockListening(Date.now()) }),
  );
}

const embed = (page: Page) =>
  page.evaluate(() => (window as unknown as { __fakeSpotify: FakeSpotify }).__fakeSpotify);

/** Waits until the fake embed is (or isn't) making sound, on `uri` if given. */
async function expectSound(page: Page, playing: boolean, uri?: string) {
  await expect
    .poll(async () => {
      const state = await embed(page);
      return !state.paused && (uri === undefined || state.uri === uri);
    })
    .toBe(playing);
}

/** Fails the test if the page throws. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

const turntableCta = (page: Page) => page.locator('#listening .glass-cta');

test.describe('record player', () => {
  test('plays and pauses from the turntable', async ({ page }) => {
    const errors = trackErrors(page);
    await stubSpotify(page);
    await page.goto('/about#listening');

    const cta = turntableCta(page);
    await expect(cta).toBeEnabled();
    await expect(cta).toHaveText('Play');
    await cta.click();
    // The press shows straight away, before the embed answers.
    await expect(cta).toHaveText('Pause');
    await expectSound(page, true, PINNED_URI);
    await expect(page.locator('#listening .turntable')).toHaveAttribute('data-playing', 'true');

    await cta.click();
    await expect(cta).toHaveText('Play');
    await expectSound(page, false);
    // Held: no update in flight flips it back.
    await page.waitForTimeout(800);
    await expect(cta).toHaveText('Play');
    expect((await embed(page)).log).not.toContain('toggle');
    expect(errors).toEqual([]);
  });

  test('samples a song from the live player, and puts the pick back', async ({ page }) => {
    const errors = trackErrors(page);
    await stubSpotify(page);
    await page.goto('/about#listening');
    await expect(turntableCta(page)).toBeEnabled();

    const row = page.getByRole('button', { name: /^Play Northbound After Midnight by/ });
    await row.click();
    await expectSound(page, true, 'spotify:track:mock-1');
    const playingRow = page.getByRole('button', {
      name: 'Pause Northbound After Midnight on the record player',
    });
    await expect(playingRow).toBeVisible();
    await expect(playingRow).toContainText('On the record');
    await expect(page.locator('#listening').getByRole('heading', { level: 3 }).first()).toHaveText(
      'Northbound After Midnight',
    );

    // Tapping it again pauses it, rather than starting it over.
    await playingRow.click();
    await expectSound(page, false);
    await expect(
      page.getByRole('button', { name: 'Play Northbound After Midnight on the record player' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Play Northbound After Midnight on the record player' })
      .click();
    await expectSound(page, true, 'spotify:track:mock-1');
    expect((await embed(page)).log.filter((c) => c.startsWith('load'))).toHaveLength(1);

    // Another song, straight from one to the next.
    await page.getByRole('button', { name: /^Play Paper Moons by/ }).click();
    await expectSound(page, true, 'spotify:track:mock-2');
    await expect(turntableCta(page)).toHaveText('Pause');

    await page.getByRole('button', { name: /^Back to my mind currently$/i }).click();
    await expectSound(page, true, PINNED_URI);
    await expect(page.getByRole('button', { name: /^Back to/i })).toHaveCount(0);
    expect((await embed(page)).controllers).toBe(1);
    expect(errors).toEqual([]);
  });

  test('keeps playing across pages, on the same embed', async ({ page }) => {
    await stubSpotify(page);
    await page.goto('/about#listening');
    await turntableCta(page).click();
    await expectSound(page, true, PINNED_URI);

    await page.getByRole('link', { name: /home$/ }).click();
    await expect(page).toHaveURL(/\/$/);
    const mini = page.getByRole('button', { name: /^Pause / });
    await expect(mini.first()).toBeVisible();
    await expectSound(page, true, PINNED_URI);
    await mini.first().click();
    await expectSound(page, false);
    expect((await embed(page)).controllers).toBe(1);
  });

  test('lifts the needle when the sample runs out, and plays it again from the top', async ({
    page,
  }) => {
    await stubSpotify(page, { options: { duration: 2000 } });
    await page.goto('/about#listening');
    const cta = turntableCta(page);
    await cta.click();
    await expectSound(page, true);
    await expect(cta).toHaveText('Play', { timeout: 6000 });
    await expect(page.locator('#listening .turntable')).toHaveAttribute('data-playing', 'false');

    await cta.click();
    await expect(cta).toHaveText('Pause');
    await expectSound(page, true, PINNED_URI);
  });

  test('falls back to Spotify when the iFrame API is blocked', async ({ page }) => {
    await stubSpotify(page, { apiFails: true });
    await page.goto('/about#listening');
    await expect(page.locator('#listening iframe[title$="Spotify player"]')).toBeVisible();
    await page.evaluate(() => {
      const opened: string[] = [];
      (window as unknown as { __opened: string[] }).__opened = opened;
      window.open = (url) => {
        opened.push(String(url));
        return null;
      };
    });
    await page.getByRole('button', { name: /^Play Northbound After Midnight by/ }).click();
    expect(
      await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened),
    ).toEqual(['https://open.spotify.com']);
  });
});

test.describe('music island', () => {
  test.skip(({ isMobile }) => !isMobile, 'The island is for phones');

  /** A real touch press, held for `ms`, through the DevTools protocol. */
  async function press(page: Page, selector: string, ms: number) {
    const box = await page.locator(selector).boundingBox();
    if (!box) throw new Error(`${selector} not visible`);
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await page.waitForTimeout(ms);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  test('shows once something plays; a hold opens the controls, a tap goes to the record', async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await stubSpotify(page);
    await page.goto('/');
    const island = page.locator('.music-island');
    await expect(island).toHaveCount(0);

    const play = page.getByRole('button', { name: /^Play / }).first();
    await expect(play).toBeVisible();
    await play.click();
    await expectSound(page, true, PINNED_URI);
    await expect(island).toBeVisible();

    // Hold: grows into the controls, and the release doesn't follow the link.
    await press(page, '.music-island-pill', 700);
    await expect(island).toHaveAttribute('data-open', 'true');
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/\/$/);

    await island.getByRole('button', { name: /^Pause / }).tap();
    await expectSound(page, false);
    await expect(island.getByRole('button', { name: /^Play / })).toBeVisible();
    await island.getByRole('button', { name: /^Play / }).tap();
    await expectSound(page, true, PINNED_URI);

    // A tap elsewhere folds it back.
    await page.getByRole('heading', { level: 1 }).tap();
    await expect(island).toHaveAttribute('data-open', 'false');

    // A tap goes to the turntable, with the music still on.
    await press(page, '.music-island-pill', 60);
    await expect(page).toHaveURL(/\/about#record$/);
    await expect(turntableCta(page)).toHaveText('Pause');
    await expectSound(page, true, PINNED_URI);
    expect(errors).toEqual([]);
  });
});
