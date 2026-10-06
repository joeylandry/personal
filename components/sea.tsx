'use client';

import { useEffect, useRef } from 'react';

/**
 * Wind-blown sea.
 *
 * The animated version of the contour field: stacked wave lines in
 * perspective, each built from a few Gerstner (trochoidal) waves so crests
 * peak and troughs stay round, the way real swell looks. Groups of waves build
 * and fall away, foam picks out the crests that break, and spray blows off
 * them downwind.
 *
 * Purely decorative and never announced. It pauses off-screen and in
 * background tabs, and under `prefers-reduced-motion` it draws one still frame.
 */

type Component = { k: number; amp: number; speed: number; steep: number };
type Spray = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const LINES = 16;
const MAX_SPRAY = 140;
/** Three waves per line: the main swell, a cross sea and wind chop. */
const COMPONENTS: Component[] = [
  { k: 1, amp: 1, speed: 1, steep: 0.72 },
  { k: 1.9, amp: 0.36, speed: 1.35, steep: 0.18 },
  { k: 4.3, amp: 0.12, speed: 2.1, steep: 0.08 },
];

export function Sea({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const styles = getComputedStyle(canvas);
    const sea = styles.getPropertyValue('--accent-graphic').trim() || '#72d6c9';
    const fog = styles.color || '#9fb1bd';
    const water = styles.getPropertyValue('--bg').trim() || '#071018';

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last = performance.now();
    let time = Math.random() * 100;
    const spray: Spray[] = [];
    // Per-line phase offsets so neighbouring lines never move in lockstep.
    const offsets = Array.from({ length: LINES }, () =>
      COMPONENTS.map(() => Math.random() * Math.PI * 2),
    );

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;

      const step = width < 640 ? 7 : 5;
      // Wind pushes spray to the right and a touch upward.
      const wind = 38;

      for (let line = 0; line < LINES; line++) {
        // 0 at the horizon, 1 at the viewer: lines bunch up as they recede.
        const depth = line / (LINES - 1);
        const near = depth ** 1.5;
        const base = height * (0.12 + 0.95 * near);
        const scale = 0.28 + near * 1.15;
        const wavelength = (width / 3.2) * scale;
        const k0 = (Math.PI * 2) / wavelength;
        const amp0 = Math.min(width * 0.02, 28) * scale;
        const phase = offsets[line] ?? [];

        const points: { x: number; y: number; crest: number }[] = [];
        for (let x0 = -60; x0 <= width + 60; x0 += step) {
          // Wave groups: the swell builds and fades as sets roll through.
          const group =
            0.55 + 0.45 * Math.sin(x0 * 0.0021 * (1.4 - near * 0.6) - time * 0.32 + line * 0.9);
          let x = x0;
          let y = base;
          let crest = 0;
          for (const [c, comp] of COMPONENTS.entries()) {
            const k = k0 * comp.k;
            const amp = amp0 * comp.amp * (c === 0 ? group : 1);
            const omega = Math.sqrt(k * 9.8 * 60) * 0.55 * comp.speed;
            const theta = k * x0 - omega * time + (phase[c] ?? 0);
            // Gerstner: points slide toward the crest, which sharpens it. The
            // steepness values sum below 1 so a line never loops over itself.
            const q = comp.steep / (k * amp0 * comp.amp);
            x -= q * amp * Math.sin(theta);
            y -= amp * Math.cos(theta);
            if (c === 0) crest = Math.max(0, Math.cos(theta)) ** 8 * group * group;
          }
          points.push({ x, y, crest });
        }

        // Each wave hides part of the one behind it, so troughs read as
        // depth rather than a stack of transparent lines.
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = water;
        ctx.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.lineTo(width + 60, height);
        ctx.lineTo(-60, height);
        ctx.closePath();
        ctx.fill();

        const alpha = 0.14 + near * 0.36;
        ctx.lineWidth = line % 4 === 0 ? 1.1 : 0.85;
        ctx.strokeStyle = line % 4 === 0 ? sea : fog;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();

        // Foam: retrace the breaking crests brighter and heavier.
        ctx.strokeStyle = sea;
        ctx.lineWidth = 1 + near * 1.1;
        ctx.globalAlpha = Math.min(0.9, alpha * 2.2);
        ctx.beginPath();
        let previous = points[0];
        let open = false;
        for (const p of points) {
          if (p.crest > 0.35 && previous) {
            if (!open) ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(p.x, p.y);
            open = true;
            // The strongest crests throw spray, more of it close up.
            if (
              dt > 0 &&
              p.crest > 0.7 &&
              spray.length < MAX_SPRAY &&
              Math.random() < 0.08 * near * dt * 60
            ) {
              const max = 0.7 + Math.random() * 0.9;
              spray.push({
                x: p.x,
                y: p.y,
                vx: wind * (0.6 + Math.random()) * scale,
                vy: -(14 + Math.random() * 22) * scale,
                life: max,
                max,
              });
            }
          } else {
            open = false;
          }
          previous = p;
        }
        ctx.stroke();
      }

      // Spray: short streaks that arc downwind and fade.
      ctx.strokeStyle = sea;
      ctx.lineCap = 'round';
      for (const s of spray) s.life -= dt;
      for (let i = spray.length - 1; i >= 0; i--) {
        if ((spray[i]?.life ?? 0) <= 0) spray.splice(i, 1);
      }
      for (const s of spray) {
        s.vy += 30 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const t = s.life / s.max;
        ctx.globalAlpha = 0.5 * t;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.06, s.y - s.vy * 0.06);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      draw(dt);
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
      draw(0);
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
