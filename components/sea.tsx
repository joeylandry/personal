'use client';

import { useEffect, useRef } from 'react';

/**
 * Breaking sea.
 *
 * Three bands of water in perspective, painted back to front so each hides the
 * one behind it. Breakers rise out of the swell, steepen, throw a lip forward
 * and plunge, bursting into spray and leaving whitewater that drifts on with
 * the wave.
 *
 * Purely decorative and never announced. It pauses off-screen and in
 * background tabs, and under `prefers-reduced-motion` it draws one still frame.
 */

type Rgb = [number, number, number];
type Layer = {
  depth: number;
  /** Rest height of the water, as a fraction of the sea box. */
  base: number;
  swell: number;
  breakerHeight: number;
  breakerWidth: number;
  maxBreakers: number;
  speed: number;
};
type Breaker = {
  x: number;
  age: number;
  life: number;
  height: number;
  width: number;
  speed: number;
  crashed: boolean;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  layer: number;
  /** Whitewater rides the surface; spray flies free until it lands. */
  surface: boolean;
  offset: number;
};

const LAYERS: Layer[] = [
  {
    depth: 0,
    base: 0.34,
    swell: 0.012,
    breakerHeight: 0.1,
    breakerWidth: 0.09,
    maxBreakers: 3,
    speed: 18,
  },
  {
    depth: 0.5,
    base: 0.56,
    swell: 0.018,
    breakerHeight: 0.19,
    breakerWidth: 0.13,
    maxBreakers: 2,
    speed: 30,
  },
  {
    depth: 1,
    base: 0.82,
    swell: 0.024,
    breakerHeight: 0.34,
    breakerWidth: 0.18,
    maxBreakers: 2,
    speed: 44,
  },
];
const MAX_PARTICLES = 700;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};
const random = (min: number, max: number) => min + Math.random() * (max - min);

function parseColor(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) {
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
  }
  const rgb = value.match(/rgba?\(([^)]+)\)/)?.[1];
  if (rgb) {
    const [r = 0, g = 0, b = 0] = rgb.split(/[ ,/]+/).map(Number);
    return [r, g, b];
  }
  return fallback;
}

const mix = (a: Rgb, b: Rgb, t: number, alpha = 1) =>
  `rgba(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t)).join(',')},${alpha})`;

export function Sea({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const styles = getComputedStyle(canvas);
    const sea = parseColor(styles.getPropertyValue('--accent-graphic'), [114, 214, 201]);
    const ink = parseColor(styles.getPropertyValue('--bg'), [7, 16, 24]);
    const white: Rgb = [240, 252, 250];
    const foam = mix(sea, white, 0.6);

    let width = 0;
    let height = 0;
    let seaTop = 0;
    let seaHeight = 0;
    /** One length unit so the waves keep their proportions on any screen. */
    let unit = 1;
    let frame = 0;
    let visible = true;
    let last = performance.now();
    let time = Math.random() * 100;
    let seeded = false;

    const breakers: Breaker[][] = LAYERS.map(() => []);
    const timers = LAYERS.map(() => 0);
    const particles: Particle[] = [];
    const phases = LAYERS.map(() => [random(0, 6.3), random(0, 6.3)] as const);

    const shape = (b: Breaker) => {
      const p = b.age / b.life;
      const collapse = smooth(0.74, 1, p);
      const steep = smooth(0.15, 0.6, p);
      const spread = 1 + collapse * 1.6;
      return {
        p,
        h: b.height * smooth(0, 0.55, p) * (1 - collapse * 0.9),
        back: b.width * spread,
        front: b.width * (1 - 0.72 * steep) * spread,
      };
    };

    const surface = (layer: number, x: number) => {
      const spec = LAYERS[layer];
      const [a = 0, b = 0] = phases[layer] ?? [];
      if (!spec) return height;
      const k = (Math.PI * 2) / (unit * 0.45);
      let y =
        seaTop +
        spec.base * seaHeight -
        spec.swell *
          unit *
          (Math.sin(x * k - time * 0.9 + a) * 0.65 + Math.sin(x * k * 2.3 + time * 0.6 + b) * 0.35);
      for (const breaker of breakers[layer] ?? []) {
        const { h, back, front } = shape(breaker);
        const dx = x - breaker.x;
        const w = dx < 0 ? back : front;
        y -= h * Math.exp(-((dx / w) ** 2));
      }
      return y;
    };

    const spawn = (layer: number, age?: number) => {
      const spec = LAYERS[layer];
      const list = breakers[layer];
      if (!spec || !list) return;
      const w = spec.breakerWidth * unit;
      for (let attempt = 0; attempt < 6; attempt++) {
        const x = random(-0.05 * width, 0.7 * width);
        if (list.some((b) => Math.abs(b.x - x) < w * 3)) continue;
        const life = random(6.5, 9.5);
        list.push({
          x,
          age: age ?? 0,
          life,
          height: spec.breakerHeight * unit * random(0.75, 1.1) * 0.6,
          width: w * random(0.85, 1.15),
          speed: spec.speed * (unit / 1000) * random(0.8, 1.2),
          crashed: (age ?? 0) / life > 0.8,
        });
        return;
      }
    };

    const emit = (particle: Omit<Particle, 'max' | 'offset'> & { offset?: number }) => {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({ offset: 0, ...particle, max: particle.life });
    };

    const lipOf = (layer: number, b: Breaker) => {
      const { p, h, front } = shape(b);
      const out = smooth(0.45, 0.7, p) * (1 - smooth(0.8, 0.95, p));
      const fall = smooth(0.62, 0.82, p);
      const crestY = surface(layer, b.x);
      const reach = front * (0.6 + 1.7 * out);
      return {
        p,
        h,
        front,
        crestY,
        live: p > 0.42 && p < 0.95,
        tip: { x: b.x + reach, y: crestY + h * (0.04 + 0.92 * fall) },
        outer: { x: b.x + reach * 0.85, y: crestY - h * 0.2 * out },
        inner: { x: b.x + reach * 0.72, y: crestY + h * 0.38 },
        face: b.x + front * 0.55,
      };
    };

    const step = (dt: number) => {
      const scale = unit / 1000;
      for (const [layer, list] of breakers.entries()) {
        const spec = LAYERS[layer];
        if (!spec) continue;
        timers[layer] = (timers[layer] ?? 0) - dt;
        if (list.length < spec.maxBreakers && (timers[layer] ?? 0) <= 0) {
          spawn(layer);
          timers[layer] = random(1.5, 3.5);
        }
        for (let i = list.length - 1; i >= 0; i--) {
          const b = list[i];
          if (!b) continue;
          b.age += dt;
          b.x += b.speed * dt;
          const lip = lipOf(layer, b);
          const size = 0.4 + spec.depth * 0.6;

          // Wind tears spray off the lip as it pitches.
          if (lip.p > 0.5 && lip.p < 0.82 && Math.random() < dt * 40 * size) {
            emit({
              x: lip.tip.x - random(0, lip.front),
              y: lip.crestY + random(-4, 4) * scale,
              vx: random(40, 140) * scale,
              vy: -random(30, 110) * scale,
              r: random(0.8, 2) * size,
              life: random(0.5, 1.1),
              layer,
              surface: false,
            });
          }

          // The plunge: a burst of spray and a bank of whitewater.
          if (!b.crashed && lip.p >= 0.8) {
            b.crashed = true;
            for (let n = 0; n < 110 * size; n++) {
              emit({
                x: lip.tip.x + random(-0.3, 0.3) * lip.front,
                y: lip.tip.y,
                vx: b.speed + random(-80, 180) * scale,
                vy: -random(80, 420) * scale * size,
                r: random(1, 3.2) * size,
                life: random(0.7, 1.6),
                layer,
                surface: false,
              });
            }
            for (let n = 0; n < 95 * size; n++) {
              emit({
                x: lip.tip.x + random(-1, 2.2) * lip.front,
                y: 0,
                vx: b.speed * random(0.5, 1.5),
                vy: 0,
                r: random(3, 13) * size * (unit / 1000 + 0.3),
                life: random(2.5, 5),
                layer,
                surface: true,
                offset: random(-4, 16) * size,
              });
            }
          }
          if (b.age >= b.life) list.splice(i, 1);
        }
      }

      for (const s of particles) {
        s.life -= dt;
        if (s.surface) {
          s.x += s.vx * dt;
          s.vx *= 1 - dt * 0.6;
        } else {
          s.vy += 420 * scale * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          // Spray that falls back in becomes a fleck of foam on the water.
          if (s.vy > 0 && s.y > surface(s.layer, s.x)) {
            s.surface = true;
            s.vx *= 0.4;
            s.r *= 1.6;
            s.life = Math.min(s.life + 0.8, 1.6);
            s.max = s.life;
          }
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        if ((particles[i]?.life ?? 0) <= 0) particles.splice(i, 1);
      }
    };

    // A soft round dab of foam, stamped for every bubble of whitewater and spray.
    const dab = document.createElement('canvas');
    dab.width = dab.height = 64;
    const dabCtx = dab.getContext('2d');
    if (dabCtx) {
      const glow = dabCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, foam);
      glow.addColorStop(0.45, mix(sea, white, 0.6, 0.55));
      glow.addColorStop(1, mix(sea, white, 0.6, 0));
      dabCtx.fillStyle = glow;
      dabCtx.fillRect(0, 0, 64, 64);
    }

    /**
     * Traces one band's surface left to right. Where a breaker is pitching,
     * the path runs over the crest, out along the lip to its tip and back
     * underneath to the face, so the lip is part of the wave and the hollow
     * under it stays open: the barrel.
     */
    const trace = (layer: number, stride: number, lips: ReturnType<typeof lipOf>[]) => {
      const sorted = [...lips].sort((a, b) => a.face - b.face);
      let next = 0;
      let x = -20;
      ctx.moveTo(x, surface(layer, x));
      while (x <= width + 20) {
        const lip = sorted[next];
        const root = lip ? lip.face - lip.front * 0.55 : Infinity;
        if (lip && x >= root) {
          ctx.lineTo(root, lip.crestY);
          ctx.quadraticCurveTo(lip.outer.x, lip.outer.y, lip.tip.x, lip.tip.y);
          ctx.quadraticCurveTo(lip.inner.x, lip.inner.y, lip.face, surface(layer, lip.face));
          x = lip.face;
          next++;
        } else {
          ctx.lineTo(x, surface(layer, x));
        }
        x += stride;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;
      const stride = width < 640 ? 5 : 4;

      for (const [layer, spec] of LAYERS.entries()) {
        const top = seaTop + spec.base * seaHeight - spec.breakerHeight * unit * 0.6;
        const tone = 0.1 + spec.depth * 0.2;
        const lips = (breakers[layer] ?? []).map((b) => lipOf(layer, b)).filter((l) => l.live);

        // The shadowed inside of each barrel, seen through the hollow.
        ctx.globalAlpha = 1;
        ctx.fillStyle = mix(ink, sea, tone * 0.35);
        for (const lip of lips) {
          ctx.beginPath();
          ctx.moveTo(lip.face, surface(layer, lip.face));
          ctx.quadraticCurveTo(lip.inner.x, lip.inner.y, lip.tip.x, lip.tip.y);
          ctx.lineTo(lip.tip.x, surface(layer, lip.tip.x) + 2);
          ctx.closePath();
          ctx.fill();
        }

        // The body of the water.
        const body = ctx.createLinearGradient(0, top, 0, height);
        body.addColorStop(0, mix(ink, sea, tone + 0.12));
        body.addColorStop(0.35, mix(ink, sea, tone * 0.55));
        body.addColorStop(1, mix(ink, sea, 0.03));
        ctx.fillStyle = body;
        ctx.beginPath();
        trace(layer, stride, lips);
        ctx.lineTo(width + 20, height);
        ctx.lineTo(-20, height);
        ctx.closePath();
        ctx.fill();

        // A glint along the surface, brightest close up.
        ctx.strokeStyle = mix(sea, white, 0.15, 0.18 + spec.depth * 0.3);
        ctx.lineWidth = 1 + spec.depth * 0.6;
        ctx.beginPath();
        trace(layer, stride, lips);
        ctx.stroke();

        // White water feathering off each lip.
        ctx.strokeStyle = foam;
        ctx.lineCap = 'round';
        for (const lip of lips) {
          const strength = smooth(0.42, 0.6, lip.p);
          ctx.globalAlpha = strength * (0.3 + spec.depth * 0.35);
          ctx.lineWidth = 1.5 + spec.depth * 2.5;
          ctx.beginPath();
          const root = lip.face - lip.front * 0.55;
          ctx.moveTo(root - lip.front * 0.5, surface(layer, root - lip.front * 0.5));
          ctx.quadraticCurveTo(root - lip.front * 0.1, lip.crestY, root, lip.crestY);
          ctx.quadraticCurveTo(lip.outer.x, lip.outer.y, lip.tip.x, lip.tip.y);
          ctx.stroke();
        }

        // Whitewater and spray belonging to this band.
        for (const s of particles) {
          if (s.layer !== layer) continue;
          const t = s.life / s.max;
          const y = s.surface ? surface(layer, s.x) + s.offset : s.y;
          const r = s.r * (s.surface ? 1.4 + 0.6 * (1 - t) : 1.6);
          ctx.globalAlpha =
            (s.surface ? 0.38 : 0.65) * Math.min(1, t * 1.5) * (0.55 + spec.depth * 0.45);
          ctx.drawImage(dab, s.x - r, y - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const seed = () => {
      if (seeded) return;
      seeded = true;
      // Start mid-set so the first frame already has waves breaking.
      for (const [layer, spec] of LAYERS.entries()) {
        for (let n = 0; n < spec.maxBreakers; n++) spawn(layer, random(1, 6));
      }
      const hero = breakers[LAYERS.length - 1]?.[0];
      if (hero) hero.age = hero.life * 0.66;
      if (!reduced.matches) for (let n = 0; n < 40; n++) step(1 / 30);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      seaHeight = Math.min(height, Math.max(460, width * 0.62));
      seaTop = height - seaHeight;
      unit = Math.min(width, seaHeight * 1.6);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      step(dt);
      draw();
      frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame && visible && !document.hidden && !reduced.matches) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const refresh = () => {
      stop();
      resize();
      seed();
      draw();
      schedule();
    };

    const resizer = new ResizeObserver(refresh);
    resizer.observe(canvas);

    const watcher = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) schedule();
      else stop();
    });
    watcher.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : schedule());
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', refresh);

    refresh();

    return () => {
      stop();
      resizer.disconnect();
      watcher.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', refresh);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={`block h-full w-full ${className}`} />
  );
}
