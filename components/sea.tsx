'use client';

import { useEffect, useRef } from 'react';

/**
 * Breaking sea, drawn in line.
 *
 * Three bands of water in perspective, each a stack of contour lines, drawn
 * back to front so each band hides the lines behind it. Breakers rise out of
 * the swell and steepen, and their lines curl over into nested spirals before
 * collapsing in a burst of spray.
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
  life: number;
  max: number;
  layer: number;
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
    maxBreakers: 3,
    speed: 30,
  },
  {
    depth: 1,
    base: 0.82,
    swell: 0.024,
    breakerHeight: 0.34,
    breakerWidth: 0.18,
    maxBreakers: 3,
    speed: 44,
  },
];
const MAX_PARTICLES = 300;

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
    const white: Rgb = [240, 252, 250];
    const fog = mix(parseColor(styles.color, [159, 177, 189]), white, 0);

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
        const life = random(5.5, 8);
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

    const emit = (particle: Omit<Particle, 'max'>) => {
      if (particles.length >= MAX_PARTICLES) return;
      particles.push({ ...particle, max: particle.life });
    };

    /**
     * The curl of a pitching lip: a spiral that leaves the crest, runs forward
     * and down, and winds back in on itself. Lines further down the wave start
     * on a smaller radius, so their curls nest inside the first one.
     */
    const curlOf = (layer: number, b: Breaker) => {
      const { p, h, front } = shape(b);
      const out = smooth(0.4, 0.72, p) * (1 - smooth(0.8, 0.96, p));
      const crestY = surface(layer, b.x);
      const radius = h * 0.55;
      const sweep = out * Math.PI * 1.75;
      const center = { x: b.x, y: crestY + radius };
      const at = (start: number, angle: number) => {
        const r = start * (1 - (0.55 * angle) / (Math.PI * 1.75));
        const theta = -Math.PI / 2 + angle;
        return { x: center.x + r * Math.cos(theta), y: center.y + r * Math.sin(theta) };
      };
      return { p, h, front, crestY, radius, sweep, at, tip: at(radius, sweep), live: out > 0.02 };
    };

    const step = (dt: number) => {
      const scale = unit / 1000;
      for (const [layer, list] of breakers.entries()) {
        const spec = LAYERS[layer];
        if (!spec) continue;
        timers[layer] = (timers[layer] ?? 0) - dt;
        if (list.length < spec.maxBreakers && (timers[layer] ?? 0) <= 0) {
          spawn(layer);
          timers[layer] = random(0.8, 2.2);
        }
        for (let i = list.length - 1; i >= 0; i--) {
          const b = list[i];
          if (!b) continue;
          b.age += dt;
          b.x += b.speed * dt;
          const lip = curlOf(layer, b);
          const size = 0.4 + spec.depth * 0.6;

          // Wind tears spray off the lip as it pitches.
          if (lip.p > 0.5 && lip.p < 0.82 && Math.random() < dt * 40 * size) {
            emit({
              x: lip.tip.x + random(-0.5, 0.5) * lip.radius,
              y: lip.crestY + random(-4, 4) * scale,
              vx: random(40, 140) * scale,
              vy: -random(30, 110) * scale,
              life: random(0.5, 1.1),
              layer,
            });
          }

          // The plunge: a burst of spray as the lip hits the water.
          if (!b.crashed && lip.p >= 0.78) {
            b.crashed = true;
            for (let n = 0; n < 40 * size; n++) {
              emit({
                x: lip.tip.x + random(-0.3, 0.3) * lip.front,
                y: lip.crestY + lip.radius * 2,
                vx: b.speed + random(-80, 180) * scale,
                vy: -random(80, 420) * scale * size,
                life: random(0.7, 1.6),
                layer,
              });
            }
          }
          if (b.age >= b.life) list.splice(i, 1);
        }
      }

      for (const s of particles) {
        s.life -= dt;
        s.vy += 420 * scale * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // Spray that falls back into the water is gone.
        if (s.vy > 0 && s.y > surface(s.layer, s.x)) s.life = 0;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        if ((particles[i]?.life ?? 0) <= 0) particles.splice(i, 1);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;
      const stride = width < 640 ? 5 : 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const [layer, spec] of LAYERS.entries()) {
        const curls = (breakers[layer] ?? []).map((b) => curlOf(layer, b)).filter((c) => c.live);
        const lines = 3 + Math.round(spec.depth * 3);
        const gap = Math.max(4, (5 + spec.depth * 8) * (unit / 1000));
        const strength = 0.22 + spec.depth * 0.45;

        // Blank out whatever lies behind this band, so lines never tangle
        // through the water in front of them. Nothing is painted, only erased.
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(-20, height);
        for (let x = -20; x <= width + 20; x += stride) ctx.lineTo(x, surface(layer, x));
        ctx.lineTo(width + 20, height);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        for (let line = 0; line < lines; line++) {
          const offset = line * gap;
          const fade = 1 - (line / lines) * 0.7;
          ctx.strokeStyle =
            line === 0 ? mix(sea, white, 0.2) : line % 3 === 0 ? mix(sea, white, 0) : fog;
          ctx.globalAlpha = strength * fade;
          ctx.lineWidth = (line === 0 ? 1.4 : 1) * (0.8 + spec.depth * 0.6);

          ctx.beginPath();
          for (let x = -20; x <= width + 20; x += stride) {
            const y = surface(layer, x) + offset;
            if (x === -20) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Each line curls over at the crest, nested inside the line above.
          for (const curl of curls) {
            const start = curl.radius - offset;
            if (start < 3) continue;
            ctx.beginPath();
            const first = curl.at(start, 0);
            ctx.moveTo(first.x, first.y);
            for (let angle = 0.12; angle <= curl.sweep; angle += 0.12) {
              const point = curl.at(start, angle);
              ctx.lineTo(point.x, point.y);
            }
            const end = curl.at(start, curl.sweep);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        }

        // Spray: short streaks thrown off the lip.
        ctx.strokeStyle = mix(sea, white, 0.35);
        ctx.lineWidth = 1;
        for (const s of particles) {
          if (s.layer !== layer) continue;
          ctx.globalAlpha = strength * (s.life / s.max);
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
          ctx.stroke();
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
