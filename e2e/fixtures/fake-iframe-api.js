/**
 * Served in place of Spotify's iFrame API (https://open.spotify.com/embed/iframe-api/v1)
 * by `e2e/music.spec.ts`, so the site's record player can be driven without
 * reaching Spotify. It behaves like the real embed in the ways that matter:
 * commands arrive a moment late, a new song takes a while to load, playback
 * updates stream in while it plays, and the 30-second sample runs out.
 *
 * `window.__fakeSpotify` exposes the embed's real state for assertions and
 * `window.__fakeSpotifyOptions` (set before the page loads) tunes it.
 */
(() => {
  const opts = Object.assign(
    {
      latency: 40,
      readyDelay: 200,
      loadDelay: 300,
      bufferMs: 150,
      updateEvery: 250,
      duration: 30000,
    },
    window.__fakeSpotifyOptions,
  );
  const fake = (window.__fakeSpotify = {
    controllers: 0,
    uri: null,
    paused: true,
    buffering: false,
    position: 0,
    loading: true,
    log: [],
  });

  function createController(element, options, callback) {
    fake.controllers += 1;
    fake.uri = options.uri;
    const frame = document.createElement('div');
    frame.dataset.fakeSpotifyEmbed = '';
    element.replaceWith(frame);

    const listeners = { ready: [], playback_update: [] };
    let ticker = null;
    const emit = () => {
      const data = {
        isPaused: fake.paused,
        isBuffering: fake.buffering,
        position: fake.position,
        duration: fake.loading ? 0 : opts.duration,
      };
      listeners.playback_update.forEach((listener) => listener({ data }));
    };
    const stop = () => {
      clearInterval(ticker);
      ticker = null;
    };
    const tick = () => {
      if (fake.paused) return;
      if (!fake.buffering) fake.position += opts.updateEvery;
      if (fake.position >= opts.duration) {
        fake.paused = true;
        fake.position = 0;
        stop();
      }
      emit();
    };
    const start = (fromStart) => {
      if (fromStart || fake.position >= opts.duration) fake.position = 0;
      fake.paused = false;
      fake.buffering = true;
      emit();
      setTimeout(() => {
        fake.buffering = false;
        emit();
      }, opts.bufferMs);
      stop();
      ticker = setInterval(tick, opts.updateEvery);
    };
    let queue = [];
    const loaded = () => {
      fake.loading = false;
      listeners.ready.forEach((listener) => listener());
      const held = queue;
      queue = [];
      held.forEach((run) => run());
      emit();
    };
    const command = (name, run) =>
      setTimeout(() => {
        const go = () => {
          fake.log.push(name);
          run();
        };
        if (fake.loading) queue.push(go);
        else go();
      }, opts.latency);

    const controller = {
      addListener(event, listener) {
        listeners[event].push(listener);
      },
      loadUri(uri) {
        setTimeout(() => {
          fake.log.push(`load ${uri}`);
          fake.uri = uri;
          fake.loading = true;
          fake.paused = true;
          fake.position = 0;
          stop();
          setTimeout(loaded, opts.loadDelay);
        }, opts.latency);
      },
      play: () => command('play', () => start(true)),
      resume: () => command('resume', () => start(false)),
      pause: () =>
        command('pause', () => {
          fake.paused = true;
          fake.buffering = false;
          stop();
          emit();
        }),
      seek: (seconds) =>
        command('seek', () => {
          fake.position = seconds * 1000;
          emit();
        }),
      togglePlay: () =>
        command('toggle', () => {
          if (fake.paused) start(false);
          else {
            fake.paused = true;
            stop();
            emit();
          }
        }),
      destroy: stop,
    };
    callback(controller);
    setTimeout(loaded, opts.readyDelay);
  }

  window.onSpotifyIframeApiReady?.({ createController });
})();
