'use client';

import { useEffect, useRef } from 'react';

/**
 * The Giving hero's two wishing stars, dancing.
 *
 * A live take on the drawn pair in ShootingStars, after the dance through
 * space in WALL-E: the two ride a rolling, hilly loop across the hero while
 * spiralling around each other, trading places in front and behind. One
 * leaves a clean, tapering streak; the other sprays a soft trail of puffs, the
 * fire extinguisher to the first one's thruster.
 *
 * Drawn on a canvas sized to the section. Once it runs it marks its wrapper
 * `data-flight="on"`, which hides the drawn pair and fades the canvas in.
 * Without JavaScript, or under reduced motion, it never starts, and the drawn
 * pair stays as the still frame. It pauses while off screen or in a hidden
 * tab. Purely decorative; never announced.
 */

/** Seconds for the pair to fly the whole loop across the hero. */
const LOOP = 24;
/** Seconds for one full turn of the pair around each other. */
const TURN = 3.6;
/** Seconds a point stays on the streak behind the leading star. */
const TRAIL = 1.8;
/** Seconds a puff of spray lasts, and how many leave per second. */
const PUFF_LIFE = 1.4;
const PUFF_RATE = 46;
/** Where in the loop the pair starts, so they open mid-flight. */
const START = 5;

interface Point {
  x: number;
  y: number;
}

interface Puff extends Point {
  vx: number;
  vy: number;
  born: number;
}

/** The pair's shared heading point: one loop across, over hills. */
function center(t: number, width: number, height: number): Point {
  const theta = (2 * Math.PI * t) / LOOP;
  return {
    x: width * (0.5 + 0.4 * Math.sin(theta)),
    y: height * (0.48 + 0.2 * Math.sin(2 * theta + 0.5) + 0.07 * Math.sin(5 * theta)),
  };
}

/**
 * Both stars at time t: each spirals around the shared heading point on
 * opposite sides, along the direction of travel, so they weave like a double
 * helix. `depth` runs -1 (behind) to 1 (in front).
 */
function pair(t: number, width: number, height: number, scale: number) {
  const here = center(t, width, height);
  const ahead = center(t + 0.02, width, height);
  const behind = center(t - 0.02, width, height);
  const dx = ahead.x - behind.x;
  const dy = ahead.y - behind.y;
  const length = Math.hypot(dx, dy) || 1;
  const tx = dx / length;
  const ty = dy / length;
  const theta = (2 * Math.PI * t) / LOOP;
  const phi = (2 * Math.PI * t) / TURN;
  // They drift apart and come back together a few times each loop.
  const radius = scale * (30 + 28 * (0.5 + 0.5 * Math.sin(3 * theta + 1)));
  const side = radius * Math.sin(phi);
  const along = radius * 0.35 * Math.cos(phi);
  const offset = { x: -ty * side + tx * along, y: tx * side + ty * along };
  const depth = Math.cos(phi);
  return {
    heading: { x: tx, y: ty },
    stars: [
      { x: here.x + offset.x, y: here.y + offset.y, depth },
      { x: here.x - offset.x, y: here.y - offset.y, depth: -depth },
    ] as const,
  };
}

/** A four-point sparkle centered on the origin, as in ShootingStars. */
function sparkle(context: CanvasRenderingContext2D, size: number) {
  const inner = size * 0.145;
  context.beginPath();
  context.moveTo(0, -size);
  context.lineTo(inner, -inner);
  context.lineTo(size, 0);
  context.lineTo(inner, inner);
  context.lineTo(0, size);
  context.lineTo(-inner, inner);
  context.lineTo(-size, 0);
  context.lineTo(-inner, -inner);
  context.closePath();
  context.fill();
}

export function WishingFlight({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const color = getComputedStyle(canvas).color;
    let width = 0;
    let height = 0;
    let scale = 1;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      scale = Math.min(Math.max(width / 1440, 0.55), 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const streak: (Point & { t: number })[] = [];
    const sprayLine: (Point & { t: number })[] = [];
    const puffs: Puff[] = [];
    let time = START;
    let owed = 0;
    let last = 0;
    let frame = 0;
    let visible = true;

    const drawTrail = (points: (Point & { t: number })[], widest: number, strongest: number) => {
      context.lineCap = 'round';
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1];
        const to = points[index];
        if (!from || !to) continue;
        const fresh = 1 - (time - to.t) / TRAIL;
        if (fresh <= 0) continue;
        context.globalAlpha = strongest * fresh ** 1.6;
        context.lineWidth = 0.3 + widest * fresh;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }
    };

    const draw = (now: number) => {
      frame = 0;
      // Clamp the step so a stalled tab does not jump the pair across the page.
      const step = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += step;

      const { heading, stars } = pair(time, width, height, scale);
      streak.push({ x: stars[0].x, y: stars[0].y, t: time });
      sprayLine.push({ x: stars[1].x, y: stars[1].y, t: time });
      while (streak[0] && time - streak[0].t > TRAIL) streak.shift();
      while (sprayLine[0] && time - sprayLine[0].t > TRAIL) sprayLine.shift();

      // The extinguisher sprays back against the heading, fanning out a little.
      owed += step * PUFF_RATE;
      while (owed >= 1) {
        owed -= 1;
        const spread = (Math.random() - 0.5) * 50;
        puffs.push({
          x: stars[1].x,
          y: stars[1].y,
          vx: -heading.x * 40 - heading.y * spread,
          vy: -heading.y * 40 + heading.x * spread,
          born: time,
        });
      }
      while (puffs[0] && time - puffs[0].born > PUFF_LIFE) puffs.shift();

      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.strokeStyle = color;

      for (const puff of puffs) {
        const age = (time - puff.born) / PUFF_LIFE;
        const elapsed = time - puff.born;
        context.globalAlpha = 0.2 * (1 - age) ** 1.4;
        context.beginPath();
        context.arc(
          puff.x + puff.vx * elapsed,
          puff.y + puff.vy * elapsed,
          scale * (1.5 + 9 * age),
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      drawTrail(sprayLine, 0.9 * scale, 0.35);
      drawTrail(streak, 2.2 * scale, 0.75);

      // The star behind is drawn first, so the one in front passes over it.
      for (const star of [...stars].sort((a, b) => a.depth - b.depth)) {
        const size = 1 + 0.22 * star.depth;
        const glowRadius = 20 * scale * size;
        context.save();
        context.translate(star.x, star.y);
        const glow = context.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'transparent');
        context.fillStyle = glow;
        context.globalAlpha = 0.35 + 0.15 * star.depth;
        context.beginPath();
        context.arc(0, 0, glowRadius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = color;
        context.globalAlpha = 0.85 + 0.15 * star.depth;
        context.rotate(time * 0.6);
        sparkle(context, 9 * scale * size);
        context.restore();
      }
      context.globalAlpha = 1;

      schedule();
    };

    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const pause = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const onVisibility = () => (document.hidden ? pause() : schedule());

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) schedule();
      else pause();
    });
    const sizer = new ResizeObserver(resize);

    resize();
    observer.observe(canvas);
    sizer.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    host.dataset.flight = 'on';
    schedule();

    return () => {
      pause();
      observer.disconnect();
      sizer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      delete host.dataset.flight;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`giving-flight absolute inset-0 h-full w-full ${className}`.trim()}
    />
  );
}
