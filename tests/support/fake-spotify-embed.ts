import type { EmbedController, PlaybackUpdate } from '@/lib/pinned-player';

/**
 * A stand-in for Spotify's iFrame API embed, run on fake timers, that can be
 * told to misbehave the ways the real one does: commands arriving late,
 * `play()` lost while a new song loads, updates still in flight for the
 * previous song, a sample that runs out silently, autoplay refused.
 */
export interface FakeEmbedOptions {
  /** postMessage delay for each command, ms. */
  latency: number;
  /** Time until the first `ready`, ms. */
  readyDelay: number;
  /** Time `loadUri` takes to load the new song, ms. */
  loadDelay: number;
  /**
   * What happens to commands sent while a song loads: held until it has
   * (`queue`), lost but `ready` fires again (`drop`), or lost silently.
   */
  loadMode: 'queue' | 'drop' | 'drop-silent';
  /** Send one more update for the old song just after `loadUri`. */
  straggler: boolean;
  /** Include `playingURI` in updates. */
  sendUri: boolean;
  /** Buffering after play before sound comes out, ms. */
  bufferMs: number;
  /** How often updates arrive while playing, ms. */
  updateEvery: number;
  duration: number;
  /**
   * How the 30-second sample ends: paused back at 0 (`reset`), paused at the
   * end (`at-end`), updates just stop while still "playing" (`stall`), or it
   * keeps reporting "playing" at the end (`overrun`).
   */
  endMode: 'reset' | 'at-end' | 'stall' | 'overrun';
  /** How many play/resume commands to refuse, as autoplay rules do. */
  blockPlays: number;
}

export const DEFAULTS: FakeEmbedOptions = {
  latency: 40,
  readyDelay: 300,
  loadDelay: 400,
  loadMode: 'queue',
  straggler: false,
  sendUri: false,
  bufferMs: 200,
  updateEvery: 500,
  duration: 30_000,
  endMode: 'reset',
  blockPlays: 0,
};

export class FakeEmbed implements EmbedController {
  uri: string;
  paused = true;
  buffering = false;
  position = 0;
  loading = true;
  destroyed = false;
  /** Every command the embed actually carried out, for assertions. */
  log: string[] = [];
  opts: FakeEmbedOptions;

  private readyListeners: (() => void)[] = [];
  private updateListeners: ((event: PlaybackUpdate) => void)[] = [];
  private queue: (() => void)[] = [];
  private ticker: ReturnType<typeof setInterval> | null = null;
  private stalled = false;

  constructor(uri: string, opts: Partial<FakeEmbedOptions> = {}) {
    this.uri = uri;
    this.opts = { ...DEFAULTS, ...opts };
    setTimeout(() => this.finishLoading(true), this.opts.readyDelay);
  }

  addListener(event: 'ready', callback: () => void): void;
  addListener(event: 'playback_update', callback: (event: PlaybackUpdate) => void): void;
  addListener(event: string, callback: (() => void) | ((event: PlaybackUpdate) => void)) {
    if (event === 'ready') this.readyListeners.push(callback as () => void);
    else this.updateListeners.push(callback as (event: PlaybackUpdate) => void);
  }

  /** Whether sound is coming out right now. */
  get audible() {
    return !this.paused && !this.buffering && !this.loading;
  }

  emit(overrides: Partial<PlaybackUpdate['data']> = {}) {
    const data = {
      isPaused: this.paused,
      isBuffering: this.buffering,
      position: this.position,
      duration: this.loading ? 0 : this.opts.duration,
      ...(this.opts.sendUri ? { playingURI: this.uri } : {}),
      ...overrides,
    };
    this.updateListeners.forEach((listener) => listener({ data }));
  }

  private finishLoading(first = false) {
    if (this.destroyed) return;
    this.loading = false;
    if (first || this.opts.loadMode !== 'drop-silent')
      this.readyListeners.forEach((listener) => listener());
    const held = this.queue;
    this.queue = [];
    held.forEach((command) => command());
    this.emit();
  }

  private command(name: string, run: () => void) {
    setTimeout(() => {
      if (this.destroyed) return;
      if (this.loading) {
        if (this.opts.loadMode === 'queue') this.queue.push(() => this.run(name, run));
        return;
      }
      this.run(name, run);
    }, this.opts.latency);
  }

  private run(name: string, run: () => void) {
    this.log.push(name);
    run();
  }

  private startTicking() {
    this.stopTicking();
    this.stalled = false;
    this.ticker = setInterval(() => this.tick(), this.opts.updateEvery);
  }

  private stopTicking() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
  }

  private tick() {
    if (this.paused || this.stalled) return;
    if (!this.buffering) this.position += this.opts.updateEvery;
    if (this.position >= this.opts.duration) {
      this.position = this.opts.duration;
      switch (this.opts.endMode) {
        case 'reset':
          this.paused = true;
          this.position = 0;
          this.stopTicking();
          break;
        case 'at-end':
          this.paused = true;
          this.stopTicking();
          break;
        case 'stall':
          // Silence, but nobody says so: no more updates.
          this.paused = true;
          this.stalled = true;
          this.stopTicking();
          return;
        case 'overrun':
          break;
      }
    }
    this.emit();
  }

  private start(fromStart: boolean) {
    if (this.opts.blockPlays > 0) {
      this.opts.blockPlays -= 1;
      this.log.push('blocked');
      return;
    }
    if (fromStart || this.position >= this.opts.duration) this.position = 0;
    this.paused = false;
    this.buffering = this.opts.bufferMs > 0;
    this.emit();
    if (this.buffering) {
      setTimeout(() => {
        this.buffering = false;
        this.emit();
      }, this.opts.bufferMs);
    }
    this.startTicking();
  }

  loadUri(uri: string) {
    setTimeout(() => {
      if (this.destroyed) return;
      if (this.opts.straggler && !this.paused) {
        // One last word about the old song, a little further on.
        this.emit({ position: this.position + 300 });
      }
      this.log.push(`load ${uri}`);
      this.uri = uri;
      this.loading = true;
      this.paused = true;
      this.buffering = false;
      this.position = 0;
      this.stopTicking();
      setTimeout(() => this.finishLoading(), this.opts.loadDelay);
    }, this.opts.latency);
  }

  play() {
    this.command('play', () => this.start(true));
  }

  resume() {
    this.command('resume', () => this.start(false));
  }

  pause() {
    this.command('pause', () => {
      this.paused = true;
      this.buffering = false;
      this.stopTicking();
      this.emit();
    });
  }

  seek(seconds: number) {
    this.command('seek', () => {
      this.position = seconds * 1000;
      this.emit();
    });
  }

  togglePlay() {
    this.command('toggle', () => {
      if (this.paused) this.start(false);
      else {
        this.paused = true;
        this.stopTicking();
        this.emit();
      }
    });
  }

  destroy() {
    this.destroyed = true;
    this.stopTicking();
  }
}
