'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * A left-to-right political scale. Hover, drag or tap along the track (or use
 * the arrow keys) and the panel below says what people at that spot tend to
 * believe.
 *
 * The five zones and their shares come from Pew Research Center's 2014
 * ideological consistency scale, which scored Americans on ten questions
 * across issues instead of asking them to label themselves.
 */

type Zone = {
  label: string;
  /** Share of U.S. adults in this zone, Pew 2014. */
  share: number;
  party: string;
  summary: string;
  beliefs: string[];
};

const zones: Zone[] = [
  {
    label: 'Consistently liberal',
    share: 12,
    party: 'The progressive wing of the Democratic Party.',
    summary:
      'Out here, you see government as the main tool for fixing unfairness, and you think it should be doing a lot more.',
    beliefs: [
      'Health care is a right, and a single government plan like Medicare for All is the way to get there.',
      'The wealthy and big corporations should pay much higher taxes to fund public programs.',
      'Climate change is an emergency that calls for fast, large-scale government action.',
      'Systemic racism and inequality are built into institutions and need direct policy fixes.',
      'Abortion should be legal, and immigration policy should center on a path to citizenship.',
    ],
  },
  {
    label: 'Mostly liberal',
    share: 22,
    party: 'Mainstream Democrats.',
    summary:
      'You lean left on most things, but you want change that can actually pass, and you like markets more than the far left does.',
    beliefs: [
      'Expand health coverage, but by building on what exists, like the Affordable Care Act.',
      'Raise taxes on high earners, while keeping a market economy with guardrails.',
      'Act on climate through incentives, clean energy investment and regulation.',
      'Stricter gun laws such as universal background checks, without banning guns outright.',
      'Secure the border and create a legal path for immigrants already here.',
    ],
  },
  {
    label: 'Mixed',
    share: 39,
    party: 'Independents, swing voters and people in both parties who break ranks.',
    summary:
      'This is the biggest group by far. You pick and choose issue by issue, and neither party fully speaks for you.',
    beliefs: [
      'You might be pro-gun and pro-choice, or want lower taxes and stronger environmental rules.',
      'Government should help people who need it, but it wastes money and should be held to account.',
      'You care more about results, like prices, jobs and safety, than about ideology.',
      'Compromise is a good thing, and you get tired of both sides fighting.',
      'You may vote for different parties in different elections, or not feel at home in either.',
    ],
  },
  {
    label: 'Mostly conservative',
    share: 18,
    party: 'Mainstream Republicans.',
    summary:
      'You lean right on most things: keep government smaller, keep taxes lower and protect traditions that work.',
    beliefs: [
      'Lower taxes and fewer regulations are the best way to grow the economy and create jobs.',
      'Government programs should be smaller and run closer to home, by states and communities.',
      'A strong military, enforced immigration laws and a secure border come first.',
      'Protect gun rights under the Second Amendment.',
      'Support for abortion limits and a big role for faith, family and community.',
    ],
  },
  {
    label: 'Consistently conservative',
    share: 9,
    party: 'The most conservative wing of the Republican Party.',
    summary:
      'Out here, you see big government as the main threat to freedom, and you want it cut back sharply.',
    beliefs: [
      'Shrink the federal government dramatically and cut most regulation.',
      'Very low taxes and minimal spending, including on major safety-net programs.',
      'Strict limits on immigration and strong enforcement, including deportations.',
      'Gun rights are close to absolute, and most gun control is unconstitutional.',
      'Abortion should be banned or tightly restricted, and traditional values should guide policy.',
    ],
  },
];

const commonGround = [
  'Elections should be fair, secure and trusted by everyone who loses them.',
  'Kids deserve good schools and a shot at doing better than their parents.',
  'Prices for housing, groceries and health care are too high.',
  'Hard work should be enough to afford a decent life.',
  'Veterans should be taken care of.',
  'Politicians spend too much time fighting and not enough time fixing things.',
  'Freedom of speech and religion matter.',
];

const maxShare = Math.max(...zones.map((zone) => zone.share));

function zoneAt(position: number) {
  return Math.min(zones.length - 1, Math.max(0, Math.floor((position / 100) * zones.length)));
}

/** Zone colors: a calm blue on the left, a calm red on the right. */
function tint(index: number) {
  const t = index / (zones.length - 1);
  if (t < 0.5) return `color-mix(in srgb, #5b8def ${(1 - t * 2) * 100}%, #9fb1bd)`;
  return `color-mix(in srgb, #e5675a ${(t - 0.5) * 200}%, #9fb1bd)`;
}

export function PoliticalScale() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const active = zoneAt(position);
  const zone = zones[active] ?? zones[2]!;

  function moveTo(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(99.9, Math.max(0, next)));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    moveTo(event.clientX);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    // A mouse previews on hover; touch and pen only move while pressed.
    if (event.pointerType === 'mouse' || dragging) moveTo(event.clientX);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = 100 / zones.length;
    const center = (index: number) => index * step + step / 2;
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = center(active - 1);
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = center(active + 1);
    if (event.key === 'Home') next = center(0);
    if (event.key === 'End') next = center(zones.length - 1);
    if (next === null) return;
    event.preventDefault();
    setPosition(Math.min(center(zones.length - 1), Math.max(center(0), next)));
  }

  return (
    <figure className="my-4 rounded-sm border border-rule bg-raised p-5 md:p-7">
      <figcaption className="meta text-faint">
        Hover, drag or tap the scale. Bar height is how many Americans are there.
      </figcaption>

      {/* How many people sit in each zone. */}
      <div aria-hidden="true" className="mt-6 flex h-28 items-end gap-1.5">
        {zones.map((z, index) => (
          <div key={z.label} className="flex h-full flex-1 flex-col justify-end">
            <span
              className={`meta mb-1.5 text-center transition-colors ${index === active ? 'text-fg' : 'text-faint'}`}
            >
              {z.share}%
            </span>
            <div
              className="rounded-t-sm transition-opacity duration-200"
              style={{
                height: `${(z.share / maxShare) * 100}%`,
                background: tint(index),
                opacity: index === active ? 1 : 0.35,
              }}
            />
          </div>
        ))}
      </div>

      {/* The track itself. */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Political scale, left to right"
        aria-valuemin={1}
        aria-valuemax={zones.length}
        aria-valuenow={active + 1}
        aria-valuetext={`${zone.label}, ${zone.share}% of Americans`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={onKeyDown}
        className="relative mt-2 h-10 cursor-pointer touch-none rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <div
          className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${zones.map((_, index) => tint(index)).join(', ')})`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--fg)] shadow-md transition-[left] duration-75"
          style={{ left: `${position}%`, background: tint(active) }}
        />
      </div>
      <div className="meta mt-1 flex justify-between text-faint">
        <span>← Left</span>
        <span>Center</span>
        <span>Right →</span>
      </div>

      {/* What people here tend to believe. */}
      <div aria-live="polite" className="rule-t mt-6 pt-6">
        <p className="meta" style={{ color: tint(active) }}>
          {zone.label} · {zone.share}% of Americans
        </p>
        <p className="mt-3 text-lead text-fg">{zone.summary}</p>
        <p className="mt-2 text-sm text-faint">Usually: {zone.party}</p>
        <ul className="mt-5 space-y-3 text-muted">
          {zone.beliefs.map((belief) => (
            <li key={belief} className="relative pl-6">
              <span aria-hidden="true" className="absolute left-0 text-detail">
                →
              </span>
              {belief}
            </li>
          ))}
        </ul>
      </div>

      {/* The part that does not move. */}
      <div className="rule-t mt-8 pt-6">
        <p className="meta text-faint">What almost everyone agrees on, wherever they sit</p>
        <ul className="mt-4 grid gap-3 text-muted sm:grid-cols-2">
          {commonGround.map((item) => (
            <li key={item} className="relative pl-6">
              <span aria-hidden="true" className="absolute left-0 text-detail">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-xs text-faint">
        Zones and shares: Pew Research Center, 2014 ideological consistency scale (10 questions
        across issues). Beliefs are typical positions, not requirements. Plenty of people in every
        zone break from them.
      </p>
    </figure>
  );
}
