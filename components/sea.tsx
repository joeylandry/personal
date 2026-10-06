'use client';

import { useEffect, useRef } from 'react';

/**
 * Line-drawn breakers.
 *
 * Short waves surface anywhere across the hero. Each one draws itself on as a
 * wavy line, rises, and curls over at its leading edge into nested spirals,
 * with spray blowing off the lip. While it curls, its oldest end dissolves
 * the way it was drawn, until only the curl is left and that unwinds too.
 *
 * Purely decorative and never announced. It pauses off-screen and in
 * background tabs, and under `prefers-reduced-motion` it draws one still frame.
 */

type Rgb = [number, number, number];
type Wave = {
  x: number;
  y: number;
  /** Length of the run-up before the curl. */
  length: number;
  height: number;
  lines: number;
  age: number;
  life: number;
  phase: number;
  /** 0..1, how close the wave feels: brighter and bolder when near. */
  near: number;
};
type Spray = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const CURL = Math.PI * 5;
const MAX_SPRAY = 240;

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

const mix = (a: Rgb, b: Rgb, t: number) =>
  `rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t)).join(',')})`;

export function Sea({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const styles = getComputedStyle(canvas);
    const white: Rgb = [240, 252, 250];
    const seaRgb = parseColor(styles.getPropertyValue('--accent-graphic'), [114, 214, 201]);
    const crest = mix(seaRgb, white, 0.2);
    const sea = mix(seaRgb, white, 0);
    const fog = mix(parseColor(styles.color, [159, 177, 189]), white, 0);

    let width = 0;
    let height = 0;
    /** One length unit so waves keep their proportions on any screen. */
    let unit = 1;
    let frame = 0;
    let visible = true;
    let last = performance.now();
    let timer = 0;
    let seeded = false;
    const waves: Wave[] = [];
    const spray: Spray[] = [];

    const capacity = () => Math.round(Math.min(9, Math.max(4, (width * height) / 160000)));

    const spawn = (age = 0) => {
      for (let attempt = 0; attempt < 8; attempt++) {
        const near = Math.random();
        const length = unit * random(0.22, 0.4) * (0.7 + near * 0.5);
        const x = random(-0.1 * width, width - length * 0.9);
        const y = random(0.14, 0.94) * height;
        const crowded = waves.some(
          (w) =>
            Math.abs(w.y - y) < (w.height + length * 0.3) * 0.9 &&
            Math.abs(w.x - x) < (w.length + length) * 0.85,
        );
        if (crowded) continue;
        const life = random(6, 9);
        waves.push({
          x,
          y,
          length,
          height: length * random(0.24, 0.34),
          lines: Math.random() < 0.55 ? 3 : 2,
          age,
          life,
          phase: random(0, Math.PI * 2),
          near,
        });
        return;
      }
    };

    /** Everything needed to draw one wave at its current age. */
    const geometry = (w: Wave) => {
      const p = w.age / w.life;
      const drift = w.length * 0.12 * w.age;
      const rise = smooth(0.08, 0.5, p);
      const sweep = CURL * smooth(0.42, 0.88, p);
      const radius = w.height * 0.55;
      const gap = Math.max(3.5, w.height * 0.13);
      // The run-up draws on quickly, easing as it reaches the crest.
      const head = w.length * (1 - (1 - clamp(p / 0.45)) ** 2);
      const curlLength = radius * CURL * 0.43;
      const tail = smooth(0.55, 1, p) * (w.length + curlLength);

      const point = (s: number, offset: number) => {
        const toCrest = smooth(0.3, 1, s / w.length);
        const wobble =
          w.height *
          0.14 *
          (1 - toCrest) *
          Math.sin((s / (w.length * 0.42)) * Math.PI * 2 - w.age * 2.4 + w.phase);
        return {
          x: w.x + drift + s,
          y: w.y + offset - w.height * rise * toCrest ** 1.5 - wobble,
        };
      };
      const top = point(w.length, 0);
      const center = { x: top.x, y: top.y + radius };
      // The curl winds two and a half times, tightening to almost nothing. The
      // lines start nested and draw together as they wind, ending as one line.
      const curlAt = (offset: number, angle: number) => {
        const t = angle / CURL;
        const start = radius - offset * (1 - smooth(0, 0.6, t));
        const r = start * Math.max(0.03, (1 - t) ** 1.3);
        const theta = -Math.PI / 2 + angle;
        return { x: center.x + r * Math.cos(theta), y: center.y + r * Math.sin(theta) };
      };
      return { p, sweep, radius, gap, head, tail, curlLength, point, center, curlAt };
    };

    const step = (dt: number) => {
      const scale = unit / 1000;
      timer -= dt;
      if (waves.length < capacity() && timer <= 0) {
        spawn();
        timer = random(0.5, 1.4);
      }

      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        if (!w) continue;
        w.age += dt;
        if (w.age >= w.life) {
          waves.splice(i, 1);
          continue;
        }
        const g = geometry(w);
        const tip = g.curlAt(0, g.sweep);
        const size = 0.5 + w.near * 0.5;

        // Wind tears spray off the lip as it curls over.
        if (g.p > 0.5 && g.p < 0.9 && Math.random() < dt * 22 * size && spray.length < MAX_SPRAY) {
          const life = random(0.4, 0.9);
          spray.push({
            x: tip.x,
            y: tip.y,
            vx: random(30, 120) * scale,
            vy: -random(20, 90) * scale,
            life,
            max: life,
          });
        }
      }

      for (const s of spray) {
        s.life -= dt;
        s.vy += 420 * scale * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      for (let i = spray.length - 1; i >= 0; i--) {
        if ((spray[i]?.life ?? 0) <= 0) spray.splice(i, 1);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const stride = 4;

      for (const w of waves) {
        const g = geometry(w);
        const strength = (0.28 + w.near * 0.42) * smooth(0, 0.04, g.p);

        for (let line = 0; line < w.lines; line++) {
          const offset = line * g.gap;
          ctx.strokeStyle = line === 0 ? crest : line === 2 ? sea : fog;
          ctx.globalAlpha = strength * (1 - line * 0.28);
          ctx.lineWidth = (line === 0 ? 1.4 : 1) * (0.8 + w.near * 0.5);
          ctx.beginPath();
          let started = false;
          const to = (x: number, y: number) => {
            if (started) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            started = true;
          };

          // The run-up, from wherever the tail has dissolved to, up to the head.
          // Lower lines start a little later, so the bundle tapers at the back.
          const from = Math.max(g.tail, line * g.gap * 2);
          for (let s = from; s < g.head; s += stride) {
            const pt = g.point(s, offset);
            to(pt.x, pt.y);
          }
          if (g.head > from) {
            const end = g.point(g.head, offset);
            to(end.x, end.y);
          }

          // The curl, nested inside the line above. Once the tail reaches it,
          // it unwinds from the outside in.
          const unwound = Math.max(0, (g.tail - w.length) / g.curlLength) * CURL;
          if (g.radius > offset && g.sweep > unwound) {
            for (let angle = unwound; angle < g.sweep; angle += 0.08) {
              const pt = g.curlAt(offset, angle);
              to(pt.x, pt.y);
            }
            const end = g.curlAt(offset, g.sweep);
            to(end.x, end.y);
          }
          ctx.stroke();
        }
      }

      // Spray: short streaks thrown off the lip.
      ctx.strokeStyle = crest;
      ctx.lineWidth = 1;
      for (const s of spray) {
        ctx.globalAlpha = 0.6 * (s.life / s.max);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const seed = () => {
      if (seeded) return;
      seeded = true;
      // Start mid-set so the first frame already has waves at every stage.
      const count = capacity();
      for (let n = 0; n < count; n++) spawn(random(0.5, 6));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      unit = Math.min(width, 1400);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
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
