import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LOAD_GRACE,
  LOAD_TIMEOUT,
  PRESS_GRACE,
  createRecordPlayer,
  type RecordTrack,
} from '@/lib/pinned-player';
import { FakeEmbed, type FakeEmbedOptions } from './support/fake-spotify-embed';

const PINNED = 'pinned';
const song = (id: string): RecordTrack => ({
  id,
  title: `Song ${id}`,
  artist: 'Artist',
  art: null,
  url: `https://open.spotify.com/track/${id}`,
});

/**
 * A record player on a fake embed, with a log of every `playing` value the
 * records showed, so a test can say "never flickered".
 */
function setup(opts: Partial<FakeEmbedOptions> = {}, { reject = false } = {}) {
  let embed: FakeEmbed | null = null;
  const opened: string[] = [];
  const player = createRecordPlayer({
    createEmbed: async (uri) => {
      if (reject) throw new Error('blocked');
      embed = new FakeEmbed(uri, opts);
      return embed;
    },
    openUrl: (url) => opened.push(url),
  });
  const shown: boolean[] = [];
  let renders = 0;
  player.subscribe(() => {
    renders += 1;
    const { playing } = player.getState();
    if (shown.at(-1) !== playing) shown.push(playing);
  });
  player.loadPinned(PINNED, song(PINNED));
  return {
    player,
    opened,
    shown,
    renders: () => renders,
    get embed() {
      if (!embed) throw new Error('embed not created yet');
      return embed;
    },
    state: () => player.getState(),
  };
}

const advance = (ms: number) => vi.advanceTimersByTimeAsync(ms);

/** Sets up and waits for the embed to be ready. */
async function ready(opts: Partial<FakeEmbedOptions> = {}) {
  const t = setup(opts);
  await advance(1000);
  expect(t.state().status).toBe('ready');
  t.shown.length = 0;
  return t;
}

/** Ready, then the pinned song started and audible. */
async function playingPinned(opts: Partial<FakeEmbedOptions> = {}) {
  const t = await ready(opts);
  t.player.togglePinned();
  await advance(2500);
  expect(t.embed.audible).toBe(true);
  expect(t.state()).toMatchObject({ playing: true, audible: true });
  t.shown.length = 0;
  t.shown.push(true);
  return t;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('record player: loading', () => {
  it('becomes ready once the embed is', async () => {
    const t = setup();
    expect(t.state().status).toBe('loading');
    expect(t.state().pinned?.id).toBe(PINNED);
    await advance(1000);
    expect(t.state()).toMatchObject({ status: 'ready', playing: false, started: false });
  });

  it('falls back when the embed cannot be created, and opens songs on Spotify', async () => {
    const t = setup({}, { reject: true });
    await advance(10);
    expect(t.state().status).toBe('failed');
    t.player.playOnRecord(song('x'));
    expect(t.opened).toEqual(['https://open.spotify.com/track/x']);
  });

  it('falls back after a timeout, and comes back if the embed turns up late', async () => {
    const t = setup({ readyDelay: LOAD_TIMEOUT + 3000 });
    await advance(LOAD_TIMEOUT + 10);
    expect(t.state().status).toBe('failed');
    await advance(3000);
    expect(t.state().status).toBe('ready');
    t.player.togglePinned();
    await advance(1500);
    expect(t.embed.audible).toBe(true);
  });

  it('plays a song asked for before the embed was ready, once it is', async () => {
    const t = setup();
    t.player.playOnRecord(song('early'));
    t.player.togglePinned(); // not ready: ignored, not queued
    await advance(2500);
    expect(t.embed.uri).toBe('spotify:track:early');
    expect(t.embed.audible).toBe(true);
    expect(t.state()).toMatchObject({ playing: true, audible: true, track: { id: 'early' } });
  });

  it('only loads one embed however many records ask', async () => {
    const create = vi.fn(async (uri: string) => new FakeEmbed(uri));
    const player = createRecordPlayer({ createEmbed: create, openUrl: () => {} });
    player.loadPinned(PINNED);
    player.loadPinned(PINNED);
    player.loadPinned('other');
    await advance(1000);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe('record player: play and pause', () => {
  it('shows a press straight away, and the waveform only once sound comes out', async () => {
    const t = await ready({ bufferMs: 600 });
    t.player.togglePinned();
    expect(t.state()).toMatchObject({ playing: true, audible: false, started: true });
    await advance(300);
    expect(t.state()).toMatchObject({ playing: true, audible: false });
    await advance(1200);
    expect(t.state()).toMatchObject({ playing: true, audible: true });
    expect(t.embed.log).toEqual(['resume']);
  });

  it('pauses with pause(), never a blind toggle', async () => {
    const t = await playingPinned();
    t.player.togglePinned();
    expect(t.state().playing).toBe(false);
    await advance(500);
    expect(t.embed.paused).toBe(true);
    expect(t.embed.log).not.toContain('toggle');
  });

  it("doesn't flicker back to playing on an update sent before the pause landed", async () => {
    const t = await playingPinned({ latency: 300 });
    t.player.togglePinned();
    // An update the embed sent just before it got the pause.
    t.embed.emit();
    await advance(1000);
    expect(t.shown).toEqual([true, false]);
    expect(t.embed.paused).toBe(true);
  });

  it('stays in step when the controls disagree with the embed (no inverted buttons)', async () => {
    const t = await playingPinned();
    // Paused from outside the site (lock screen, another tab's media keys).
    t.embed.paused = true;
    t.embed.emit();
    expect(t.state().playing).toBe(false);
    // So the next press plays, rather than pausing something already paused.
    t.player.togglePinned();
    await advance(1000);
    expect(t.embed.audible).toBe(true);
    expect(t.state().playing).toBe(true);
  });

  it('keeps the needle down while the song buffers mid-play', async () => {
    const t = await playingPinned();
    t.embed.buffering = true;
    t.embed.emit();
    expect(t.state()).toMatchObject({ playing: true, audible: false });
    // A press now pauses, as the button says.
    t.player.togglePinned();
    await advance(500);
    expect(t.embed.paused).toBe(true);
    expect(t.state().playing).toBe(false);
  });

  it('gives up honestly when autoplay is refused, and the next press plays', async () => {
    const t = await ready({ blockPlays: 3 });
    t.player.togglePinned();
    expect(t.state().playing).toBe(true);
    await advance(PRESS_GRACE + 100);
    expect(t.embed.paused).toBe(true);
    expect(t.state()).toMatchObject({ playing: false, audible: false });
    t.player.togglePinned();
    await advance(1000);
    expect(t.embed.audible).toBe(true);
    expect(t.state()).toMatchObject({ playing: true, audible: true });
  });

  it('retries a play the embed missed', async () => {
    const t = await ready({ blockPlays: 1 });
    t.player.togglePinned();
    await advance(2000);
    expect(t.embed.log).toEqual(['resume', 'blocked', 'resume']);
    expect(t.embed.audible).toBe(true);
    expect(t.shown).toEqual([true]);
  });

  it("doesn't re-render the records for updates that change nothing", async () => {
    const t = await playingPinned();
    const before = t.renders();
    await advance(5000);
    expect(t.renders()).toBe(before);
  });
});

describe('record player: the sample running out', () => {
  for (const endMode of ['reset', 'at-end', 'stall', 'overrun'] as const) {
    it(`stops the record when the sample ends (${endMode})`, async () => {
      const t = await playingPinned({ endMode, duration: 10_000 });
      await advance(13_000);
      expect(t.state()).toMatchObject({ playing: false, audible: false });
      expect(t.shown).toEqual([true, false]);
      // Silence, whatever the embed last claimed.
      await advance(500);
      expect(t.embed.audible).toBe(false);
    });

    it(`starts again from the top after it ran out (${endMode})`, async () => {
      const t = await playingPinned({ endMode, duration: 10_000 });
      await advance(13_000);
      t.player.togglePinned();
      expect(t.state().playing).toBe(true);
      await advance(1500);
      expect(t.embed.audible).toBe(true);
      expect(t.embed.position).toBeLessThan(2000);
      expect(t.state()).toMatchObject({ playing: true, audible: true });
    });
  }

  it("doesn't take a stale end-of-song update for the restart ending at once", async () => {
    const t = await playingPinned({ endMode: 'at-end', duration: 10_000 });
    await advance(13_000);
    t.player.togglePinned();
    // The embed repeats where it was before the seek landed.
    t.embed.emit({ isPaused: false, position: 10_000 });
    expect(t.state().playing).toBe(true);
    await advance(1500);
    expect(t.state()).toMatchObject({ playing: true, audible: true });
  });

  it("doesn't call a pause near the start a finished song", async () => {
    const t = await playingPinned();
    t.player.togglePinned();
    await advance(500);
    t.embed.seek(0);
    await advance(500);
    t.player.togglePinned();
    await advance(1000);
    expect(t.embed.log.filter((c) => c === 'play')).toEqual([]);
    expect(t.state().playing).toBe(true);
  });
});

describe('record player: switching songs', () => {
  const variants: [string, Partial<FakeEmbedOptions>][] = [
    ['commands held while loading', { loadMode: 'queue' }],
    ['commands lost, ready again', { loadMode: 'drop' }],
    ['commands lost silently', { loadMode: 'drop-silent' }],
    ['slow phone load', { loadMode: 'drop-silent', loadDelay: 2000, latency: 150 }],
    ['old-song stragglers', { straggler: true }],
    ['old-song stragglers, with URIs', { straggler: true, sendUri: true }],
    ['slow buffering', { bufferMs: 1500 }],
  ];

  for (const [name, opts] of variants) {
    it(`plays the new song without the needle lifting (${name})`, async () => {
      const t = await playingPinned(opts);
      await advance(8000); // well into the pinned song
      t.player.playOnRecord(song('next'));
      expect(t.state()).toMatchObject({ playing: true, audible: false, track: { id: 'next' } });
      await advance(5000);
      expect(t.embed.uri).toBe('spotify:track:next');
      expect(t.embed.audible).toBe(true);
      expect(t.state()).toMatchObject({ playing: true, audible: true });
      expect(t.shown).toEqual([true]);
    });

    it(`switches from a paused record (${name})`, async () => {
      const t = await ready(opts);
      t.player.playOnRecord(song('next'));
      await advance(5000);
      expect(t.embed.audible).toBe(true);
      expect(t.state()).toMatchObject({ playing: true, audible: true, started: true });
      expect(t.shown).toEqual([true]);
    });
  }

  it('lands on the last of several quick picks, without flicker', async () => {
    const t = await playingPinned({ straggler: true, loadMode: 'drop' });
    for (const id of ['a', 'b', 'c']) {
      t.player.playOnRecord(song(id));
      await advance(150);
    }
    await advance(5000);
    expect(t.embed.uri).toBe('spotify:track:c');
    expect(t.embed.audible).toBe(true);
    expect(t.state()).toMatchObject({ playing: true, audible: true, track: { id: 'c' } });
    expect(t.shown).toEqual([true]);
  });

  it('stays paused when paused while the new song loads', async () => {
    const t = await playingPinned({ loadDelay: 1500 });
    t.player.playOnRecord(song('next'));
    await advance(300);
    t.player.togglePinned();
    expect(t.state().playing).toBe(false);
    await advance(6000);
    expect(t.embed.audible).toBe(false);
    expect(t.state().playing).toBe(false);
  });

  it('gives up if the new song never starts', async () => {
    const t = await playingPinned({ loadMode: 'drop-silent', loadDelay: 20_000 });
    t.player.playOnRecord(song('next'));
    await advance(LOAD_GRACE + 100);
    expect(t.state()).toMatchObject({ playing: false, audible: false });
    expect(t.state().track?.id).toBe('next');
  });

  it('plays or pauses the song already on the record rather than starting it over', async () => {
    const t = await ready();
    t.player.playOnRecord(song('next'));
    await advance(5000);
    const loads = t.embed.log.filter((c) => c.startsWith('load')).length;
    t.player.playOnRecord(song('next'));
    await advance(500);
    expect(t.embed.paused).toBe(true);
    expect(t.state().playing).toBe(false);
    const at = t.embed.position;
    t.player.playOnRecord(song('next'));
    await advance(1000);
    expect(t.embed.audible).toBe(true);
    expect(t.embed.position).toBeGreaterThanOrEqual(at);
    expect(t.embed.log.filter((c) => c.startsWith('load'))).toHaveLength(loads);
  });

  it('treats the pick, found in the history, as the pick', async () => {
    const t = await ready();
    t.player.playOnRecord(song(PINNED));
    await advance(1500);
    expect(t.embed.log.filter((c) => c.startsWith('load'))).toEqual([]);
    expect(t.embed.audible).toBe(true);
    expect(t.state()).toMatchObject({ playing: true, track: null });
  });

  it('puts the pick back', async () => {
    const t = await ready();
    t.player.playOnRecord(song('next'));
    await advance(3000);
    t.player.backToPinned();
    expect(t.state()).toMatchObject({ track: null, playing: true });
    await advance(3000);
    expect(t.embed.uri).toBe(`spotify:track:${PINNED}`);
    expect(t.embed.audible).toBe(true);
    expect(t.shown).toEqual([true]);
  });

  it('runs out a sampled song too, then restarts that song', async () => {
    const t = await ready({ duration: 10_000 });
    t.player.playOnRecord(song('next'));
    await advance(14_000);
    expect(t.state().playing).toBe(false);
    t.player.togglePinned();
    await advance(1500);
    expect(t.embed.uri).toBe('spotify:track:next');
    expect(t.embed.audible).toBe(true);
  });
});

describe('record player: soak', () => {
  /**
   * Random presses at random moments against a misbehaving embed. Whatever
   * happens, once things settle the records agree with what you can hear.
   */
  it('always settles on what the embed is actually doing', async () => {
    let seed = Number(process.env.SEED ?? 7);
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let round = 0; round < Number(process.env.ROUNDS ?? 25); round += 1) {
      const t = await ready({
        latency: Math.floor(random() * 250),
        loadDelay: Math.floor(random() * 1500),
        loadMode: (['queue', 'drop', 'drop-silent'] as const)[Math.floor(random() * 3)],
        straggler: random() < 0.5,
        sendUri: random() < 0.5,
        bufferMs: Math.floor(random() * 800),
        endMode: (['reset', 'at-end', 'stall', 'overrun'] as const)[Math.floor(random() * 4)],
        duration: 6000,
      });
      for (let press = 0; press < 12; press += 1) {
        const roll = random();
        if (roll < 0.45) t.player.togglePinned();
        else if (roll < 0.85) t.player.playOnRecord(song(`s${Math.floor(random() * 3)}`));
        else t.player.backToPinned();
        await advance(Math.floor(random() * 2500));
      }
      await advance(LOAD_GRACE + 4000);
      expect(t.state().playing, `round ${round}`).toBe(!t.embed.paused);
      expect(t.state().audible, `round ${round}`).toBe(t.embed.audible);
      const id = t.state().track?.id ?? PINNED;
      expect(t.embed.uri, `round ${round}`).toBe(`spotify:track:${id}`);
    }
  });
});
