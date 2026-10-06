'use client';

import { useEffect, useRef } from 'react';

/**
 * The Giving hero as a ride through space with the two wishing stars.
 *
 * After the dance through space in WALL-E: the pair flies on over rolling
 * hills while spiralling around each other, and a chase camera follows them
 * like a drone. The pair holds its lane in the gap between the story and the
 * stats, bobbing only as far as the camera lags on the climbs and drops; the
 * world does the moving. Stars stream past in layers (near ones fast and
 * bright, far ones slow and faint), the camera banks into the hills, shooting
 * stars cut across now and then, and the pointer steers the camera a little.
 * One star leaves a clean, tapering streak; the other sprays a soft trail of
 * puffs, the fire extinguisher to the first one's thruster.
 *
 * Drawn on a canvas sized to the section. Once it runs it marks its wrapper
 * `data-flight="on"`, which hides the drawn still frame (ShootingStars) and
 * fades the canvas in. Without JavaScript, or under reduced motion, it never
 * starts, and the still frame stays. It pauses while off screen or in a hidden
 * tab. Purely decorative; never announced.
 *
 * The lane is measured from the elements marked `data-flight-from` (the text
 * the pair flies to the right of) and `data-flight-to` (the column it flies to
 * the left of). When they stack, on phones, the lane sits near the right edge.
 */

/** Forward speed through the world, in px per second at full scale. */
const SPEED = 170;
/** Seconds for one full turn of the pair around each other. */
const TURN = 3.6;
/** Seconds a point stays on the streak behind the leading star. */
const TRAIL = 1.2;
/** Seconds a puff of spray lasts, and how many leave per second. */
const PUFF_LIFE = 1.2;
const PUFF_RATE = 46;
/** How quickly the camera catches up with the pair, per second. */
const CAMERA_FOLLOW = 2.2;
/** How quickly the camera answers the pointer, per second. */
const STEER_FOLLOW = 3;
/** Furthest the pointer can steer the camera, in px at full scale. */
const STEER = { x: 60, y: 40 };
/** Background stars per million square px of canvas. */
const STAR_DENSITY = 150;
/** Seconds between shooting stars, at least and at most. */
const SHOOT_EVERY = [1.8, 4.5] as const;

interface Point {
  x: number;
  y: number;
}

interface Puff extends Point {
  vx: number;
  vy: number;
  born: number;
}

/** A background star: where it sits on its layer, its depth, and its twinkle. */
interface Star extends Point {
  /** 0.12 (far, slow, faint) to 1 (near, fast, bright). */
  depth: number;
  phase: number;
}

/** A shooting star, in screen space, crossing on its own heading. */
interface Shot extends Point {
  vx: number;
  vy: number;
  born: number;
  life: number;
  length: number;
}

/** Height of the hills under the pair at forward distance s, as a fraction of the canvas. */
function hills(s: number) {
  return 0.34 * Math.sin(s / 520) + 0.16 * Math.sin(s / 210 + 1.3) + 0.02 * Math.sin(s / 90);
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

/** Wraps a value into [0, size). */
function wrap(value: number, size: number) {
  return ((value % size) + size) % size;
}

export function WishingFlight({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const section = canvas?.closest('section');
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !section || !context) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const color = getComputedStyle(canvas).color;
    let width = 0;
    let height = 0;
    let scale = 1;
    /** The pair's lane on screen, and how far either side of it they may roam. */
    let lane = { x: 0, y: 0, room: 40 };
    let stars: Star[] = [];

    const measure = () => {
      const box = canvas.getBoundingClientRect();
      const from = section.querySelector('[data-flight-from]')?.getBoundingClientRect();
      const to = section.querySelector('[data-flight-to]')?.getBoundingClientRect();
      if (from && to && to.left > from.right + 40) {
        lane = {
          x: (from.right + to.left) / 2 - box.left,
          y: height * 0.46,
          room: (to.left - from.right) / 2,
        };
      } else {
        lane = { x: width * 0.84, y: height * 0.4, room: width * 0.12 };
      }
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      scale = Math.min(Math.max(width / 1440, 0.55), 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      measure();
      // A fresh field for the new size; most stars far, a few near.
      const count = Math.round((width * height * STAR_DENSITY) / 1e6);
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        depth: 0.12 + 0.88 * Math.random() ** 2.2,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const streak: (Point & { t: number })[] = [];
    const sprayLine: (Point & { t: number })[] = [];
    const puffs: Puff[] = [];
    const shots: Shot[] = [];
    let time = 0;
    let distance = 0;
    let camera: Point | null = null;
    let cameraRise = 0;
    const steer = { x: 0, y: 0 };
    const steerTarget = { x: 0, y: 0 };
    let nextShot = 1;
    let owed = 0;
    let last = 0;
    let frame = 0;
    let visible = true;

    /** The pair's shared center in the world at forward distance s. */
    const path = (s: number): Point => ({ x: s, y: height * hills(s / scale) });

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = section.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      const inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;
      steerTarget.x = inside ? x : 0;
      steerTarget.y = inside ? y : 0;
    };

    const drawTrail = (
      points: (Point & { t: number })[],
      toScreen: (point: Point) => Point,
      widest: number,
      strongest: number,
    ) => {
      context.lineCap = 'round';
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1];
        const to = points[index];
        if (!from || !to) continue;
        const fresh = 1 - (time - to.t) / TRAIL;
        if (fresh <= 0) continue;
        const a = toScreen(from);
        const b = toScreen(to);
        context.globalAlpha = strongest * fresh ** 1.6;
        context.lineWidth = 0.3 + widest * fresh;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    };

    const draw = (now: number) => {
      frame = 0;
      // Clamp the step so a stalled tab does not jump the ride ahead.
      const step = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += step;
      distance += SPEED * scale * step;

      // The pair: a shared center on the hills, the two spiralling around it.
      const center = path(distance);
      const ahead = path(distance + 4);
      const dx = ahead.x - center.x;
      const dy = ahead.y - center.y;
      const length = Math.hypot(dx, dy) || 1;
      const heading = { x: dx / length, y: dy / length };
      const phi = (2 * Math.PI * time) / TURN;
      // They drift apart and back together, never wider than the lane allows.
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.7 + 1);
      const radius = Math.min(scale * (26 + 26 * breathe), lane.room * 0.7);
      const side = radius * Math.sin(phi);
      const along = radius * 0.35 * Math.cos(phi);
      const offset = {
        x: -heading.y * side + heading.x * along,
        y: heading.x * side + heading.y * along,
      };
      const depth = Math.cos(phi);
      const pair = [
        { x: center.x + offset.x, y: center.y + offset.y, depth },
        { x: center.x - offset.x, y: center.y - offset.y, depth: -depth },
      ] as const;

      // The chase camera: locked to the pair going forward, lagging on the
      // hills so the climbs and drops show, steered a touch by the pointer.
      camera ??= { x: center.x, y: center.y };
      const view = camera;
      const follow = 1 - Math.exp(-step * CAMERA_FOLLOW);
      const previousY = view.y;
      view.x = center.x;
      view.y += (center.y - view.y) * follow;
      cameraRise = step ? (view.y - previousY) / step : cameraRise;
      const turn = 1 - Math.exp(-step * STEER_FOLLOW);
      steer.x += (steerTarget.x - steer.x) * turn;
      steer.y += (steerTarget.y - steer.y) * turn;
      const look = { x: steer.x * STEER.x * scale, y: steer.y * STEER.y * scale };

      const toScreen = (point: Point): Point => ({
        x: point.x - view.x + lane.x,
        y: point.y - view.y + lane.y,
      });

      streak.push({ x: pair[0].x, y: pair[0].y, t: time });
      sprayLine.push({ x: pair[1].x, y: pair[1].y, t: time });
      while (streak[0] && time - streak[0].t > TRAIL) streak.shift();
      while (sprayLine[0] && time - sprayLine[0].t > TRAIL) sprayLine.shift();

      // The extinguisher sprays back against the heading, fanning out a little.
      owed += step * PUFF_RATE;
      while (owed >= 1) {
        owed -= 1;
        const spread = (Math.random() - 0.5) * 50;
        puffs.push({
          x: pair[1].x,
          y: pair[1].y,
          vx: -heading.x * 40 - heading.y * spread,
          vy: -heading.y * 40 + heading.x * spread,
          born: time,
        });
      }
      while (puffs[0] && time - puffs[0].born > PUFF_LIFE) puffs.shift();

      // Shooting stars cut across the far sky now and then.
      if (time >= nextShot) {
        const [soonest, latest] = SHOOT_EVERY;
        nextShot = time + soonest + Math.random() * (latest - soonest);
        const angle = Math.PI * (0.82 + Math.random() * 0.12);
        const speed = (520 + Math.random() * 380) * scale;
        shots.push({
          x: width * (0.35 + Math.random() * 0.75),
          y: height * Math.random() * 0.55,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          born: time,
          life: 0.9 + Math.random() * 0.5,
          length: (90 + Math.random() * 90) * scale,
        });
      }
      while (shots[0] && time - shots[0].born > shots[0].life) shots.shift();

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const ratio = canvas.width / (width || 1);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = color;
      context.strokeStyle = color;

      // Bank into the hills, and lean a little toward the pointer.
      const bank = Math.max(-0.07, Math.min(0.07, (cameraRise / (SPEED * scale)) * 0.18));
      context.save();
      context.translate(lane.x, lane.y);
      context.rotate(bank + steer.x * 0.015);
      context.translate(-lane.x, -lane.y);

      // The field streams past in layers; near stars smear into short streaks.
      const padX = width * 0.2;
      const padY = height * 0.3;
      const spanX = width + padX * 2;
      const spanY = height + padY * 2;
      const velocity = SPEED * scale;
      context.lineCap = 'round';
      for (const star of stars) {
        const x = wrap(star.x * spanX - (view.x + look.x) * star.depth, spanX) - padX;
        const y = wrap(star.y * spanY - (view.y + look.y) * star.depth * 0.6, spanY) - padY;
        const glint = 0.75 + 0.25 * Math.sin(time * (1 + star.depth * 2) + star.phase);
        context.globalAlpha = (0.12 + 0.7 * star.depth) * glint;
        const radius = 0.4 + star.depth * 1.2;
        if (star.depth > 0.55) {
          // A bright point with a fainter smear trailing behind it.
          const smear = velocity * star.depth * 0.08;
          context.lineWidth = radius * 1.2;
          context.globalAlpha *= 0.4;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + smear, y + cameraRise * star.depth * 0.048);
          context.stroke();
          context.globalAlpha /= 0.4;
        }
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      for (const shot of shots) {
        const age = (time - shot.born) / shot.life;
        const elapsed = time - shot.born;
        const headX = shot.x + shot.vx * elapsed;
        const headY = shot.y + shot.vy * elapsed;
        const speed = Math.hypot(shot.vx, shot.vy) || 1;
        const tailX = headX - (shot.vx / speed) * shot.length;
        const tailY = headY - (shot.vy / speed) * shot.length;
        const fade = Math.min(age * 6, 1) * (1 - age);
        const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, color);
        context.strokeStyle = gradient;
        context.globalAlpha = 0.8 * fade;
        context.lineWidth = 1.2 * scale + 0.4;
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(headX, headY);
        context.stroke();
        context.globalAlpha = fade;
        context.beginPath();
        context.arc(headX, headY, 1.3, 0, Math.PI * 2);
        context.fill();
      }
      context.strokeStyle = color;
      context.restore();

      // The pair, its streak and its spray ride in the camera's frame.
      for (const puff of puffs) {
        const age = (time - puff.born) / PUFF_LIFE;
        const elapsed = time - puff.born;
        const at = toScreen({ x: puff.x + puff.vx * elapsed, y: puff.y + puff.vy * elapsed });
        context.globalAlpha = 0.2 * (1 - age) ** 1.4;
        context.beginPath();
        context.arc(at.x, at.y, scale * (1.5 + 9 * age), 0, Math.PI * 2);
        context.fill();
      }
      drawTrail(sprayLine, toScreen, 0.9 * scale, 0.35);
      drawTrail(streak, toScreen, 2.2 * scale, 0.75);

      // The star behind is drawn first, so the one in front passes over it.
      for (const star of [...pair].sort((a, b) => a.depth - b.depth)) {
        const at = toScreen(star);
        const size = 1 + 0.22 * star.depth;
        const glowRadius = 20 * scale * size;
        context.save();
        context.translate(at.x, at.y);
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
    window.addEventListener('pointermove', onPointer, { passive: true });
    host.dataset.flight = 'on';
    schedule();

    return () => {
      pause();
      observer.disconnect();
      sizer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
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
