import type { Note } from './types';

/**
 * Notes — hot takes, opinions and half-built ideas. Newest first.
 *
 * To post: add an object to the top of this list. Set `draft: true` to read it
 * on a preview deploy before it goes live.
 */
export const notes: Note[] = [
  {
    slug: 'sonos-let-me-fix-your-app',
    title: 'Sonos, let me fix your app.',
    dek: 'Two years, one CEO and a tab bar later, the best-sounding speakers in my house still have the most frustrating remote. A hot take, and an application.',
    date: '2026-10-05',
    tags: ['Hot take', 'Product', 'Sonos'],
    draft: true,
    body: [
      {
        type: 'p',
        text: 'I love my Sonos speakers. I do not love opening the Sonos app. Those two sentences shouldn’t both be true about the same product — and for a company whose whole pitch is “it just works in every room,” the app isn’t a side feature. The app is the product. The speakers are the part you can see.',
      },
      { type: 'h', text: 'What happened' },
      {
        type: 'p',
        text: 'On May 7, 2024, Sonos shipped a ground-up redesign of its app. It looked cleaner. It also launched without things people used every day: sleep timers, alarms, editing queues, managing a local music library. Speakers went missing from the app. Volume lagged. Screen-reader support regressed. The company apologised, spent the rest of the year rebuilding features it had removed, and in January 2025 its CEO stepped down.',
      },
      {
        type: 'p',
        text: 'The repair has been slow and public. In July 2026 the app got its tab bar back — Home, System, Search — as an opt-in setting. In September, “Sonos 27” added presets and, more interestingly, a public MCP server so AI agents can drive your speakers directly.',
      },
      { type: 'h', text: 'My take: this was an engineering failure, not a design one' },
      {
        type: 'p',
        text: 'People argue about the layout, but the layout was never the real problem. The problem is that a rewrite went out the door before it could do everything the old app did, on hardware that lives on flaky home Wi-Fi, for customers who own systems that cost thousands of dollars. That’s a release-engineering decision. You don’t replace a remote control people use twenty times a day with one that’s missing buttons.',
      },
      {
        type: 'list',
        items: [
          'Parity is a launch gate, not a roadmap. Every feature in the old app gets a row in a checklist, and the new app doesn’t ship to everyone until every row is green.',
          'Roll out behind flags, by cohort. Let the people who want the new thing opt in, measure them, then widen. Sonos eventually did exactly this with the 2026 navigation toggle — two years late.',
          'Measure “time to music.” Cold open to sound coming out of the right room is the only metric that matters. Put a budget on it, and fail the build when it regresses.',
          'Treat discovery as the core product. Finding speakers on a messy home network is the hard part. It deserves the best engineers on the team, the most tests, and a lab full of bad routers.',
          'Keep the old app alive until the new one wins on merit. Users should leave because the new one is better, not because the old one stopped working.',
        ],
      },
      { type: 'h', text: 'The actually-good news' },
      {
        type: 'p',
        text: 'Here’s the spicy part: the MCP server might be the smartest thing Sonos has done in years. An AI agent doesn’t care about your navigation hierarchy. If “play something mellow in the kitchen and turn the living room down” works reliably from any assistant, half the arguments about where the buttons live go away. But it only works if the control layer underneath is rock solid — which is the same work the app needed in the first place.',
      },
      {
        type: 'quote',
        text: 'Not a new app, but a new way of navigating Sonos inside the app you already have.',
        cite: 'Tom Conrad, Sonos CEO, on the 2026 navigation update',
      },
      {
        type: 'p',
        text: 'That’s the right instinct: fix it in place, ship it incrementally, let people opt in. I’d like to help make the rest of it feel that way. I build full-stack products end to end, I care a lot about the boring reliability work that makes software feel effortless, and I have very strong opinions about where the sleep timer should go.',
      },
      {
        type: 'p',
        text: 'Sonos — my contact page is open.',
      },
    ],
    sources: [
      {
        label: 'What Hi-Fi — Sonos boss resigns following disastrous app redesign',
        href: 'https://www.whathifi.com/news/sonos-boss-resigns-following-disastrous-app-redesign',
      },
      {
        label: 'TechRadar — 2024: the year Sonos slipped',
        href: 'https://www.techradar.com/televisions/2024-the-year-sonos-slipped',
      },
      {
        label: 'Sonos Community — July 14, 2026 app and player updates',
        href: 'https://en.community.sonos.com/product-updates/14th-july-2026-new-sonos-app-player-updates-now-available-6934332',
      },
      {
        label: 'Engadget — “Sonos 27” refreshes the app and lets AI agents control your system',
        href: 'https://www.engadget.com/2248252/sonos-27-brings-a-refreshed-ui-to-the-app-and-lets-ai-agents-control-your-system/',
      },
    ],
  },
];

/** Drafts show in development and on Vercel previews only. */
const showDrafts = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview';

export const publishedNotes = notes
  .filter((note) => showDrafts || !note.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getNote(slug: string): Note | undefined {
  return publishedNotes.find((note) => note.slug === slug);
}
