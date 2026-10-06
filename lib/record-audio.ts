'use client';

import type { EmbedController, PlaybackUpdate } from './pinned-player';

/**
 * The site's record player, playing songs' 30-second previews through one
 * `<audio>` element of its own (see `lib/spotify-preview.ts` for why not
 * Spotify's embed). It speaks the same interface as the embed, so the state
 * machine in `lib/pinned-player.ts` drives it unchanged.
 *
 * Phones only let a page start sound from inside a tap, so every `play()`
 * here calls `audio.play()` straight away. Preview URLs are looked up ahead
 * of time (`prefetchPreviews`) so a song's file is usually in hand when it's
 * tapped; when it isn't, a moment of silence is played inside the tap to
 * unlock the element, and the song follows as soon as its URL arrives.
 */

/** Track id → preview URL, or null when the song has none. */
const previews = new Map<string, string | null>();
const lookups = new Map<string, Promise<string | null>>();

function lookUp(id: string): Promise<string | null> {
  const known = previews.get(id);
  if (known !== undefined) return Promise.resolve(known);
  let lookup = lookups.get(id);
  if (!lookup) {
    lookup = fetch(`/api/preview/${encodeURIComponent(id)}`)
      .then((response) => (response.ok ? response.json() : { url: null }))
      .then(({ url }: { url: string | null }) => {
        previews.set(id, url);
        return url;
      })
      .catch(() => null) // offline: not remembered, so a later tap asks again
      .finally(() => lookups.delete(id));
    lookups.set(id, lookup);
  }
  return lookup;
}

/** Looks up previews before they're needed, so a tap can play at once. */
export function prefetchPreviews(ids: string[]) {
  ids.forEach((id) => void lookUp(id));
}

/** False once a song is known to have no preview; true or unknown otherwise. */
export function hasPreview(id: string): boolean {
  return previews.get(id) !== null;
}

/** A tenth of a second of silence, as a WAV, for unlocking the element inside a tap. */
function silence(): string {
  const samples = 800;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) =>
    [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, 'data');
  view.setUint32(40, samples, true);
  bytes.fill(128, 44); // 8-bit silence sits at the midpoint
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
}

const idOf = (uri: string) => uri.split(':').pop() ?? uri;

class AudioRecord implements EmbedController {
  private audio: HTMLAudioElement;
  private uri: string;
  /** The element holds the song's preview (not nothing, or the unlocking silence). */
  private loaded = false;
  /** Play was asked for before the preview's URL arrived. */
  private wantPlay = false;
  private readyListeners: (() => void)[] = [];
  private updateListeners: ((event: PlaybackUpdate) => void)[] = [];

  constructor(uri: string) {
    this.uri = uri;
    this.audio = document.createElement('audio');
    this.audio.preload = 'auto';
    this.audio.dataset.recordPlayer = '';
    this.audio.hidden = true;
    document.body.append(this.audio);
    for (const event of [
      'play',
      'playing',
      'pause',
      'waiting',
      'timeupdate',
      'seeked',
      'ended',
      'loadedmetadata',
    ]) {
      this.audio.addEventListener(event, () => this.emit());
    }
    this.audio.addEventListener('error', () => {
      if (!this.loaded) return;
      // The file is gone (an expired URL, say): forget it, and say so.
      previews.delete(idOf(this.uri));
      this.loaded = false;
      this.emit(true);
    });
    this.load(uri);
    setTimeout(() => this.readyListeners.forEach((listener) => listener()), 0);
  }

  addListener(event: 'ready', callback: () => void): void;
  addListener(event: 'playback_update', callback: (event: PlaybackUpdate) => void): void;
  addListener(event: string, callback: (() => void) | ((event: PlaybackUpdate) => void)) {
    if (event === 'ready') this.readyListeners.push(callback as () => void);
    else this.updateListeners.push(callback as (event: PlaybackUpdate) => void);
  }

  private emit(stopped = false) {
    if (!this.loaded && !stopped) return;
    const { audio } = this;
    const duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
    const data = {
      isPaused: stopped || audio.paused,
      isBuffering: !stopped && !audio.paused && audio.readyState < 3,
      position: stopped ? 0 : audio.currentTime * 1000,
      duration: stopped ? 0 : duration,
      playingURI: this.uri,
    };
    this.updateListeners.forEach((listener) => listener({ data }));
  }

  private setSource(url: string | null) {
    if (!url) {
      this.loaded = false;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.emit(true);
      return;
    }
    this.loaded = true;
    this.audio.src = url;
  }

  private load(uri: string) {
    this.uri = uri;
    this.wantPlay = false;
    const id = idOf(uri);
    const known = previews.get(id);
    if (known !== undefined) {
      this.setSource(known);
      return;
    }
    this.loaded = false;
    this.audio.pause();
    void lookUp(id).then((url) => {
      if (this.uri !== uri) return;
      this.setSource(url);
      if (url && this.wantPlay) this.start();
    });
  }

  private start() {
    this.wantPlay = false;
    this.audio.play().catch(() => this.emit());
  }

  /** Not loaded yet: play silence now, inside the tap, so the song may follow. */
  private unlock() {
    this.wantPlay = true;
    this.audio.src = silence();
    this.audio.play().catch(() => {});
  }

  loadUri(uri: string) {
    this.load(uri);
  }

  play() {
    if (!this.loaded) return this.unlock();
    this.audio.currentTime = 0;
    this.start();
  }

  resume() {
    if (!this.loaded) return this.unlock();
    this.start();
  }

  pause() {
    this.wantPlay = false;
    this.audio.pause();
  }

  seek(seconds: number) {
    if (this.loaded) this.audio.currentTime = seconds;
  }

  togglePlay() {
    if (this.audio.paused) this.resume();
    else this.pause();
  }

  destroy() {
    this.audio.pause();
    this.audio.remove();
  }
}

export function createAudioRecord(uri: string): EmbedController {
  return new AudioRecord(uri);
}
