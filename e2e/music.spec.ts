import { expect, test, type Page } from '@playwright/test';
import { mockListening } from '../lib/spotify-mock';

/**
 * The site's record player end to end: the turntable, the live player's rows,
 * the hero's mini record and the header's island, all on one shared `<audio>`
 * element. Preview lookups are answered with short local WAV files (one per
 * song, so the test can tell which is playing) and the live player is fed the
 * mock listening data.
 */

const PINNED = '5HVcJTb111CdGVwJWPyZcn';

/** `seconds` of quiet 8 kHz mono WAV. */
function wav(seconds: number): Buffer {
  const samples = Math.round(8000 * seconds);
  const buffer = Buffer.alloc(44 + samples, 128);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(8000, 24);
  buffer.writeUInt32LE(8000, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples, 40);
  return buffer;
}

async function stubPreviews(page: Page, { seconds = 30, missing = [] as string[], slow = 0 } = {}) {
  const audio = wav(seconds);
  await page.route('**/api/preview/*', async (route) => {
    const id = route.request().url().split('/').pop()!;
    if (slow) await new Promise((resolve) => setTimeout(resolve, slow));
    await route.fulfill({ json: { url: missing.includes(id) ? null : `/test-audio/${id}.wav` } });
  });
  await page.route('**/test-audio/*', (route) =>
    route.fulfill({ contentType: 'audio/wav', body: audio }),
  );
  await page.route('**/api/now-playing', (route) =>
    route.fulfill({ json: mockListening(Date.now()) }),
  );
  await page.route('https://open.spotify.com/**', (route) => route.abort());
}

/** What the record player's `<audio>` element is doing. */
const audio = (page: Page) =>
  page.evaluate(() => {
    const element = document.querySelector<HTMLAudioElement>('audio[data-record-player]');
    return {
      count: document.querySelectorAll('audio[data-record-player]').length,
      paused: element?.paused ?? true,
      src: element?.currentSrc.split('/').pop() ?? '',
      time: element?.currentTime ?? 0,
    };
  });

/** Waits until `id` is (or nothing is) audibly playing. */
async function expectSound(page: Page, id: string | null) {
  await expect
    .poll(async () => {
      const state = await audio(page);
      return state.paused ? null : state.src.replace('.wav', '');
    })
    .toBe(id);
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

const turntableCta = (page: Page) => page.locator('#listening .glass-cta');

test.describe('record player', () => {
  test('plays and pauses from the turntable', async ({ page }) => {
    const errors = trackErrors(page);
    await stubPreviews(page);
    await page.goto('/about#listening');

    const cta = turntableCta(page);
    await expect(cta).toBeEnabled();
    await expect(cta).toHaveText('Play');
    await cta.click();
    await expect(cta).toHaveText('Pause');
    await expectSound(page, PINNED);
    await expect(page.locator('#listening .turntable')).toHaveAttribute('data-playing', 'true');

    await cta.click();
    await expect(cta).toHaveText('Play');
    await expectSound(page, null);
    const at = (await audio(page)).time;
    await page.waitForTimeout(800);
    await expect(cta).toHaveText('Play');

    // Resumes where it was, not from the top.
    await cta.click();
    await expectSound(page, PINNED);
    expect((await audio(page)).time).toBeGreaterThanOrEqual(at);
    expect(errors).toEqual([]);
  });

  test('samples a song from the live player, and puts the pick back', async ({ page }) => {
    const errors = trackErrors(page);
    await stubPreviews(page);
    await page.goto('/about#listening');
    await expect(turntableCta(page)).toBeEnabled();

    await page.getByRole('button', { name: /^Play Northbound After Midnight by/ }).click();
    await expectSound(page, 'mock-1');
    const playingRow = page.getByRole('button', {
      name: 'Pause Northbound After Midnight on the record player',
    });
    await expect(playingRow).toContainText('On the record');
    await expect(page.locator('#listening').getByRole('heading', { level: 3 }).first()).toHaveText(
      'Northbound After Midnight',
    );

    // Tapping it again pauses it, and again resumes it, without starting over.
    await playingRow.click();
    await expectSound(page, null);
    const at = (await audio(page)).time;
    await page
      .getByRole('button', { name: 'Play Northbound After Midnight on the record player' })
      .click();
    await expectSound(page, 'mock-1');
    expect((await audio(page)).time).toBeGreaterThanOrEqual(at);

    // Straight on to another song.
    await page.getByRole('button', { name: /^Play Paper Moons by/ }).click();
    await expectSound(page, 'mock-2');
    await expect(turntableCta(page)).toHaveText('Pause');

    await page.getByRole('button', { name: /^Back to site sound$/i }).click();
    await expectSound(page, PINNED);
    await expect(page.getByRole('button', { name: /^Back to/i })).toHaveCount(0);
    expect((await audio(page)).count).toBe(1);
    expect(errors).toEqual([]);
  });

  test("plays a song whose preview wasn't looked up yet", async ({ page }) => {
    await stubPreviews(page, { slow: 700 });
    await page.goto('/about#listening');
    await expect(turntableCta(page)).toBeEnabled();
    // Straight away, before any lookup has answered.
    await page.getByRole('button', { name: /^Play Static Bloom by/ }).click();
    await expect(turntableCta(page)).toHaveText('Pause');
    await expectSound(page, 'mock-4');
  });

  test('keeps playing across pages', async ({ page }) => {
    await stubPreviews(page);
    await page.goto('/about#listening');
    await turntableCta(page).click();
    await expectSound(page, PINNED);

    await page.getByRole('link', { name: /home$/ }).click();
    await expect(page).toHaveURL(/\/$/);
    const mini = page.getByRole('button', { name: /^Pause / }).first();
    await expect(mini).toBeVisible();
    await expectSound(page, PINNED);
    await mini.click();
    await expectSound(page, null);
    expect((await audio(page)).count).toBe(1);
  });

  test('lifts the needle when the sample runs out, and plays it again from the top', async ({
    page,
  }) => {
    await stubPreviews(page, { seconds: 2 });
    await page.goto('/about#listening');
    const cta = turntableCta(page);
    await cta.click();
    await expectSound(page, PINNED);
    await expect(cta).toHaveText('Play', { timeout: 6000 });
    await expect(page.locator('#listening .turntable')).toHaveAttribute('data-playing', 'false');

    await cta.click();
    await expect(cta).toHaveText('Pause');
    await expectSound(page, PINNED);
    expect((await audio(page)).time).toBeLessThan(1.5);
  });

  test('opens a song with no preview on Spotify', async ({ page }) => {
    await stubPreviews(page, { missing: ['mock-3'] });
    await page.goto('/about#listening');
    await expect(turntableCta(page)).toBeEnabled();
    await page.evaluate(() => {
      const opened: string[] = [];
      (window as unknown as { __opened: string[] }).__opened = opened;
      window.open = (url) => {
        opened.push(String(url));
        return null;
      };
    });
    const row = page.getByRole('button', { name: /^Play Everything at Once, Slowly by/ });
    // Once its lookup has come back empty.
    await expect
      .poll(async () => {
        await row.click();
        return page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.length);
      })
      .toBeGreaterThan(0);
    await expectSound(page, null);
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
    await stubPreviews(page);
    await page.goto('/');
    const island = page.locator('.music-island');
    await expect(island).toHaveCount(0);

    const play = page.getByRole('button', { name: /^Play / }).first();
    await expect(play).toBeVisible();
    await play.tap();
    await expectSound(page, PINNED);
    await expect(island).toBeVisible();

    // Hold: grows into the controls, and the release doesn't follow the link.
    await press(page, '.music-island-pill', 700);
    await expect(island).toHaveAttribute('data-open', 'true');
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(/\/$/);

    await island.getByRole('button', { name: /^Pause / }).tap();
    await expectSound(page, null);
    await island.getByRole('button', { name: /^Play / }).tap();
    await expectSound(page, PINNED);

    // A tap elsewhere folds it back.
    await page.getByRole('heading', { level: 1 }).tap();
    await expect(island).toHaveAttribute('data-open', 'false');

    // A tap goes to the turntable, with the music still on.
    await press(page, '.music-island-pill', 60);
    await expect(page).toHaveURL(/\/about#record$/);
    await expect(turntableCta(page)).toHaveText('Pause');
    await expectSound(page, PINNED);
    expect(errors).toEqual([]);
  });
});
