import type { Note } from './types';

/**
 * Blog posts: hot takes, opinions and half-built ideas. Newest first.
 *
 * To post: add an object to the top of this list. Set `draft: true` to read it
 * on a preview deploy before it goes live.
 */
export const notes: Note[] = [
  {
    slug: 'the-friend-i-almost-missed',
    title: 'The friend I almost missed, and why I’m planning to run.',
    dek: 'A school newspaper, a kitchen with no eggs, and a stair climb for 9/11 taught me the same lesson about unity. It’s the reason I’m soft-launching a run for president for when I turn 35.',
    date: '2026-10-07',
    tags: ['Unity', 'Personal', 'Soft launch'],
    body: [
      {
        type: 'p',
        text: 'Let me get the big part out of the way first. When I turn 35, the minimum age to be president of the United States, I plan to run. This is the soft launch. There is no campaign, no platform and no logo yet, and I’m a software engineer with a day job, so consider this the very early, very honest version of the announcement.',
      },
      {
        type: 'p',
        text: 'This post is not about a party or a policy. It is about the one idea I would want a campaign built on, and I can trace it back to a kitchen, a school newspaper and a lot of stairs.',
      },
      { type: 'h', text: 'Two editorials, side by side' },
      {
        type: 'p',
        text: 'In high school, I asked the advisor of our school newspaper if I could write an editorial on a major national story. I felt strongly about it, and I could not understand why so many people saw it differently. She said yes, and she knew it would be a good one because another student had already volunteered to write the opposing side.',
      },
      {
        type: 'p',
        text: 'My first draft ran four pages and was, to put it kindly, a little too emotional. Revising it taught me something I still use. I started writing down the questions I had at the beginning of my research and answering each one with what I found. The draft got more organized, and, to my surprise, a lot more diplomatic. Tone follows curiosity.',
      },
      {
        type: 'p',
        text: 'A few weeks later, both editorials ran side by side. I remember wondering who the other writer was. I did not know her. All I knew was that she saw the world very differently than I did, and that was enough for me to form an opinion of her without ever speaking to her.',
      },
      { type: 'h', text: 'The kitchen with no eggs' },
      {
        type: 'p',
        text: 'A little over a year later, I found out that the writer, Zoe, was the older sister of my best friend. One afternoon we got stuck together at his house, just the two of us. It was awkward, as you would expect from two people who had spent a year assuming the worst about each other.',
      },
      {
        type: 'p',
        text: 'We decided to bake, and about ten minutes in we realized the kitchen had almost nothing in it. No eggs, not even the basics. So we went to the store together, came back, and kept going, and somewhere between the mixing bowl and the speaker we were dancing and singing along to “I Wanna Dance with Somebody.” Whitney Houston’s voice did what no argument ever could. We were laughing, trading songs and cracking jokes, and quietly becoming friends.',
      },
      {
        type: 'p',
        text: 'Later the conversation turned serious, and we talked about what we actually value. Zoe was just herself. She wasn’t softening anything or telling me what I wanted to hear. Somewhere in that conversation I forgot that we were the same two people who had written opposing editorials the year before.',
      },
      {
        type: 'quote',
        text: 'Befriending Zoe did not make my beliefs any less solid. It taught me how to be firm in them and open-minded at the same time.',
      },
      {
        type: 'p',
        text: 'I think about how close I came to missing her. If I had let my opinions decide who she was before I met her, I would never have known the generous, thoughtful person who has wished for my success and happiness ever since. That is the whole lesson, and I keep relearning it. Getting to know someone costs an afternoon. Not getting to know them can cost a friendship.',
      },
      { type: 'h', text: 'A hundred and ten flights up' },
      {
        type: 'p',
        text: 'This year I took part in Fidelity’s 9/11 Memorial Stair Climb, more than 110 flights alongside friends, colleagues, firefighters, police officers and first responders. People pushed themselves, cheered each other on and moved as one group. The climb was hard, but it is nothing compared to what first responders faced that day, and nobody there pretended otherwise.',
      },
      {
        type: 'p',
        text: 'I was not alive on September 11, 2001, yet the day has always felt personal to me. That is why remembering has to be passed from one generation to the next. What I take from it is how people responded. In the face of unimaginable tragedy, they came together across every difference in background, perspective and opinion. They did not stop to ask what anyone believed before they helped.',
      },
      { type: 'h', text: 'What I mean by unity' },
      {
        type: 'p',
        text: 'Unity does not mean agreeing. Zoe and I still would not have written the same editorial. It means a few simple habits that are easy to say and hard to practice:',
      },
      {
        type: 'list',
        items: [
          'Get to know the person before you decide who they are. An afternoon together beats a year of assumptions.',
          'Hold your beliefs firmly and hold the person across from you gently. Those two things do not compete.',
          'Ask the question before you write the answer. Curiosity makes you more convincing, not less.',
          'Remember the shared dignity underneath every disagreement. We can disagree and still respect one another.',
        ],
      },
      {
        type: 'p',
        text: 'I think we have lost sight of this as a country. We have gotten very good at the editorial and very bad at the kitchen. I want to spend my career getting better at the kitchen.',
      },
      { type: 'h', text: 'So, the plan' },
      {
        type: 'p',
        text: 'Between now and 35, the plan is boring on purpose. Keep building things, keep serving my community, keep showing up at the climbs and the cleanups, and keep having real conversations with people who see the world differently than I do. I will write more here as I go, including the things I get wrong. If I ever do stand on a ballot, I want the record to show that I spent these years practicing what I would ask the country to do.',
      },
      {
        type: 'p',
        text: 'If you disagree with me about almost everything, you are exactly who I want to hear from. My contact page is open, and I promise to bring eggs. 🇺🇸',
      },
    ],
  },
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
