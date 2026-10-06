import type { Note } from './types';

/**
 * Blog posts: hot takes, opinions and half-built ideas. Newest first.
 *
 * To post: add an object to the top of this list. Set `draft: true` to read it
 * on a preview deploy before it goes live.
 */
export const notes: Note[] = [
  {
    slug: 'sonos-let-me-fix-your-app',
    title: 'Sonos can’t market its way out of a broken app.',
    dek: 'I built a whole marketing presentation on Sonos this semester. My verdict: the comeback plan is smart, but the ads can only promise what the app actually delivers.',
    date: '2026-10-05',
    tags: ['Hot take', 'Marketing', 'Sonos'],
    body: [
      {
        type: 'p',
        text: 'It’s a Saturday night, friends are over, and you want the same song playing in the kitchen, the living room and out on the deck. With Sonos, that used to take about five seconds. You opened the app, grouped the rooms, hit play, and it just worked. That “just worked” feeling was the entire brand.',
      },
      {
        type: 'p',
        text: 'For a marketing class this semester, my group put together a presentation on Sonos: how it grew, how it fell, and how it is trying to climb back. I came out of it with a strong opinion, and since I’m a software engineer who also owns more Sonos speakers than I probably should, I figured I would share it.',
      },
      { type: 'h', text: 'How Sonos used to grow' },
      {
        type: 'p',
        text: 'The original Sonos strategy was simple. Sell one great speaker, make it reliable, and let the system do the rest. A household starts with one speaker for around $400, falls in love with it, and slowly adds a second, a third and a soundbar. Before long that one $400 purchase is a $2,000+ system spread across the house.',
      },
      {
        type: 'p',
        text: 'Sonos barely had to advertise. The product was the marketing. Customers trusted it, told their friends about it, and kept coming back for more speakers. Reliability built trust, trust built word of mouth, and word of mouth built the ecosystem.',
      },
      { type: 'h', text: 'The app that broke the loop' },
      {
        type: 'p',
        text: 'Then came May 2024. Sonos shipped a ground-up rebuild of its app, and it launched missing features people used every day: sleep timers, alarms, queue editing and accessibility options. Speakers disappeared from the app. Multi-room grouping, the one thing Sonos is known for, stopped working for a lot of people.',
      },
      {
        type: 'p',
        text: 'The fallout was brutal. Fixing the app was projected to cost $20 million to $30 million, the company laid people off, and the redesign wiped out hundreds of millions of dollars in market value. In January 2025, CEO Patrick Spence stepped down, and board member Tom Conrad (who helped build Pandora) took over with a clear mandate: fix reliability first.',
      },
      {
        type: 'p',
        text: 'Here is the part that stuck with me. The app didn’t just annoy existing customers. It broke the growth engine. Nobody buys a fifth speaker for a system that can’t find the first four.',
      },
      { type: 'h', text: 'The comeback plan' },
      {
        type: 'p',
        text: 'The new strategy flips the old one. Instead of quietly letting the product sell itself, Sonos is going marketing-led:',
      },
      {
        type: 'list',
        items: [
          'Existing customers first. Upselling more speakers into homes that already own Sonos is a lot cheaper than finding brand new customers.',
          'Portable speakers as the new front door. The old starter speaker (the Play:1) only lived inside your house. Roam and Move go outside, to the beach and on the boat, which lowers the commitment for someone trying Sonos for the first time.',
          'Selling the feeling, not the specs. Sonos’s marketing leans on emotion (big, colorful “Brilliant Sound” visuals, real people in real homes) instead of drivers and wattage.',
        ],
      },
      {
        type: 'p',
        text: 'On paper, I like it. Going back to the ecosystem model and focusing on lifetime value is the right instinct. Sonos already knows its best customer is the one who already owns a speaker.',
      },
      { type: 'h', text: 'My take: the ads are writing checks the app has to cash' },
      {
        type: 'p',
        text: 'So the question is, can emotional storytelling rebuild a broken brand promise? I don’t think it can, at least not by itself.',
      },
      {
        type: 'p',
        text: 'Sonos never won on emotion. It won on reliability. People didn’t fall for a speaker because a commercial made them feel something. They fell for it because it worked every single time they pressed play. When an ad tells you to “feel more,” and then the app takes 20 seconds to find the kitchen, the ad actually makes things worse. It reminds you of exactly what you lost.',
      },
      {
        type: 'p',
        text: 'Marketing can bring people back to the door. Only the product can keep them inside. That is why the most important “marketing” Sonos has done lately is not a campaign at all:',
      },
      {
        type: 'list',
        items: [
          'In July 2026, the app finally got a real tab bar back (Home, System and Search), offered as an opt-in setting so nobody gets forced into another surprise redesign.',
          'In September, Sonos 27 refreshed the app again and opened a public MCP server, which lets AI assistants control your speakers directly. If “play something mellow in the kitchen” works from any assistant, half the arguments about where the buttons live go away.',
          'Both updates rolled out gradually and let people choose. That is the exact opposite of what went wrong in 2024.',
        ],
      },
      {
        type: 'quote',
        text: 'Not a new app, but a new way of navigating Sonos inside the app you already have.',
        cite: 'Tom Conrad, Sonos CEO, on the 2026 navigation update',
      },
      {
        type: 'p',
        text: 'That line is the whole lesson. Fix it in place, ship it in steps, and let customers opt in. Once the app is boring again (and I mean that as the highest compliment), the marketing will finally have something true to say.',
      },
      { type: 'h', text: 'What I would do' },
      {
        type: 'p',
        text: 'If I were in the room, my advice would be short. Treat feature parity as a launch requirement, not a roadmap. Measure “time to music,” from opening the app to sound coming out of the right room, and never let it get slower. Put your best engineers on speaker discovery, because finding devices on messy home Wi-Fi is the hard part. And hold the big campaigns until the reviews say the app is good again, because trust is earned in the app long before it is earned in an ad.',
      },
      {
        type: 'p',
        text: 'I still love my speakers, and I’m genuinely rooting for Sonos. I build products end to end, I care a lot about the unglamorous reliability work that makes software feel effortless, and I have very strong opinions about where the sleep timer should go. Sonos, my contact page is open.',
      },
    ],
    sources: [
      {
        label: 'Fast Company: Sonos CEO steps down following a disastrous app redesign',
        href: 'https://www.fastcompany.com/91259432/sonos-ceo-steps-down-following-a-disastrous-app-redesign',
      },
      {
        label: 'Billboard: Sonos CEO Patrick Spence resigns after app redesign fallout',
        href: 'https://www.billboard.com/pro/sonos-ceo-patrick-spence-resigns-after-app-redesign-layoffs/',
      },
      {
        label: 'TechRadar: “Not a new app, but a new way of navigating”',
        href: 'https://www.techradar.com/audio/multi-room/not-a-new-app-but-a-new-way-of-navigating-the-sonos-app',
      },
      {
        label: 'Sonos Community: July 14, 2026 app and player updates',
        href: 'https://en.community.sonos.com/product-updates/14th-july-2026-new-sonos-app-player-updates-now-available-6934332',
      },
      {
        label: 'Engadget: “Sonos 27” refreshes the app and lets AI agents control your system',
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
