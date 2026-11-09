import type { Note } from './types';

/**
 * Blog posts: hot takes, opinions and half-built ideas. Newest first.
 *
 * To post: add an object to the top of this list. Set `draft: true` to read it
 * on a preview deploy before it goes live.
 */
export const notes: Note[] = [
  {
    slug: 'democrat-vs-republican-by-the-books',
    title: 'What it actually means to be a Democrat or a Republican.',
    dek: 'Before I figure out where I land, I wanted the by-the-book version: what the law says a party is, what each party says it stands for, and how both of them got here.',
    date: '2026-11-09',
    tags: ['Politics', 'History', 'The scale'],
    draft: true,
    body: [
      {
        type: 'p',
        text: 'Everybody has an opinion about Democrats and Republicans. Far fewer people can tell you what either word actually means. So before I give my own take, I wanted to start with the boring, factual version: the legal definition, what each party officially says it believes, and how 230 years of history shaped them. No spin, just the record, with sources at the bottom.',
      },
      { type: 'h', text: 'What the law says a party is' },
      {
        type: 'p',
        text: 'Here is the first surprise: political parties are not in the Constitution. Not once. Many of the founders actively worried about them. James Madison spent Federalist No. 10 on the danger of “factions,” and George Washington used his 1796 Farewell Address to warn that the “spirit of party” could be turned against the country itself.',
      },
      {
        type: 'p',
        text: 'Parties showed up anyway, and federal law eventually defined them. Under federal election law (52 U.S.C. § 30101), a “political party” is an association, committee or organization that nominates a candidate for federal office whose name appears on the ballot as that organization’s candidate. That is the whole legal definition. It says nothing about beliefs, values or issues. Legally, a party is a group that puts names on ballots.',
      },
      { type: 'h', text: 'What makes you a Democrat or a Republican' },
      {
        type: 'p',
        text: 'Legally speaking, not much. There is no membership card, no dues and no oath. Party affiliation is set by each state, not the federal government:',
      },
      {
        type: 'list',
        items: [
          'In roughly 30 states plus Washington, D.C., you can register as a Democrat or a Republican when you register to vote. That registration is the closest thing to an official, legal party membership.',
          'In the rest of the states, voters don’t register by party at all. There, you are a Democrat or Republican mostly because you say you are, or because of which primary ballot you ask for.',
          'Courts treat parties as private associations with First Amendment rights. In California Democratic Party v. Jones (2000), the Supreme Court said a party has a right to decide who picks its nominees, which is why primary rules vary so much from state to state.',
        ],
      },
      {
        type: 'p',
        text: 'So by the books, being a Democrat or a Republican is a label you choose, not a set of beliefs you are required to hold.',
      },
      { type: 'h', text: 'What each party says it stands for' },
      {
        type: 'p',
        text: 'The closest thing each party has to an official definition of itself is its national platform, adopted every four years at the convention. Summarized as fairly as I can:',
      },
      {
        type: 'list',
        items: [
          'Democrats generally describe the government as a tool to expand opportunity and protect people: a stronger social safety net, broader access to health care, labor and civil rights protections, environmental regulation, and taxes that ask more of the wealthy and corporations.',
          'Republicans generally describe the government as something to keep limited so people and markets can thrive: lower taxes, less regulation, a strong military and border security, gun rights, traditional and religious values, and more power left to the states.',
        ],
      },
      {
        type: 'p',
        text: 'Political scientists usually map this onto a left-right spectrum: Democrats are the party of the center-left (liberal), Republicans the party of the center-right (conservative). Those words carry most of the meaning people put into the party names today. But as the history shows, the parties haven’t always lined up that way.',
      },
      { type: 'h', text: 'How the Democrats got here' },
      {
        type: 'list',
        items: [
          '1790s: Thomas Jefferson and James Madison organize the Democratic-Republican Party to oppose Alexander Hamilton’s Federalists and a strong central government. Democrats trace their roots to it.',
          '1828: Andrew Jackson’s supporters build the modern Democratic Party around the “common man” and suspicion of banks and elites. The Democratic National Committee is formed in 1848, making it one of the oldest active political parties in the world.',
          '1850s–1860s: The party splits over slavery. Southern Democrats lead secession, and after the Civil War the “Solid South” votes Democratic for nearly a century, including during Jim Crow.',
          '1896: William Jennings Bryan pulls the party toward farmers, workers and populism.',
          '1930s: Franklin Roosevelt’s New Deal turns the Democrats into the party of an active federal government. Black voters, long loyal to the party of Lincoln, start moving toward the Democrats.',
          '1960s: Lyndon Johnson signs the Civil Rights Act of 1964 and the Voting Rights Act of 1965. Many white Southern conservatives begin drifting away from the party over the following decades.',
          '1990s to today: Bill Clinton’s “New Democrats” move toward the center on economics, and the party’s coalition increasingly leans on cities, suburbs, younger voters and college graduates.',
        ],
      },
      { type: 'h', text: 'How the Republicans got here' },
      {
        type: 'list',
        items: [
          '1854: The Republican Party forms in opposition to the Kansas-Nebraska Act and the spread of slavery into new territories. Its early meetings are traditionally traced to Ripon, Wisconsin.',
          '1860: Abraham Lincoln becomes the first Republican president. Republicans in Congress go on to pass the 13th, 14th and 15th Amendments, ending slavery and guaranteeing citizenship, equal protection and the vote regardless of race.',
          'Late 1800s: The party becomes associated with business, industry and protective tariffs, and picks up the nickname the “Grand Old Party,” or GOP.',
          '1912: Theodore Roosevelt splits off to run as a Progressive, showing the party once had a strong reform wing of its own.',
          '1964–1980: Barry Goldwater’s campaign and then Ronald Reagan’s reshape the party around smaller government, lower taxes, anti-communism and social conservatism. The South gradually becomes Republican.',
          '2016 to today: Donald Trump pulls the party toward populism, tighter immigration and skepticism of free trade, and its coalition increasingly leans on rural voters and Americans without college degrees.',
        ],
      },
      { type: 'h', text: 'The plot twist: the parties traded places' },
      {
        type: 'p',
        text: 'If you only remember one thing from the history, make it this. The party of Lincoln was the more progressive party on civil rights in the 1860s, and the Democratic Party was home to the segregationist South for generations. Over the 20th century, starting with the New Deal and accelerating after the civil rights era, the coalitions largely swapped. Historians still argue about how fast it happened and why, but almost none of them argue that it didn’t happen.',
      },
      {
        type: 'p',
        text: 'Even the symbols are newer than you think. The Democratic donkey started as an insult hurled at Andrew Jackson, and cartoonist Thomas Nast made both the donkey and the Republican elephant famous in the 1870s. Red states and blue states? Those colors only stuck after TV networks used them on election night in 2000.',
      },
      { type: 'h', text: 'Where most people actually fall' },
      {
        type: 'p',
        text: 'Here is the part that sets up everything I want to do next. For more than a decade, the single largest group in Gallup’s polling hasn’t been Democrats or Republicans. It has been independents, roughly four in ten Americans. Most of them lean one way, but they don’t want the label.',
      },
      {
        type: 'p',
        text: 'And individual views are messier than the parties. Pew Research has found that a large share of Americans hold a mix of liberal and conservative positions rather than lining up neatly on one side. Research from More in Common found that Democrats and Republicans badly overestimate how extreme the other side’s views are. We think the gap between us is roughly twice as wide as it really is.',
      },
      { type: 'h', text: 'My take (coming soon)' },
      {
        type: 'p',
        text: 'This is where I’ll add my own view on each side: what I agree with, what I don’t, and where I think I actually land on the scale below.',
      },
      { type: 'h', text: 'The scale: where do you fall?' },
      {
        type: 'p',
        text: 'Move along the scale below to see what people at each spot tend to believe, and how many Americans are actually there. My bet going in was that the middle is a lot more crowded than the internet makes it look. The data agrees.',
      },
      { type: 'scale' },
    ],
    sources: [
      {
        label: '52 U.S.C. § 30101: federal definition of a political party (Cornell LII)',
        href: 'https://www.law.cornell.edu/uscode/text/52/30101',
      },
      {
        label: 'Federalist No. 10, James Madison (Library of Congress)',
        href: 'https://guides.loc.gov/federalist-papers/text-1-10',
      },
      {
        label: 'Washington’s Farewell Address, 1796 (U.S. Senate)',
        href: 'https://www.senate.gov/artandhistory/history/resources/pdf/Washingtons_Farewell_Address.pdf',
      },
      {
        label: 'California Democratic Party v. Jones, 530 U.S. 567 (2000) (Oyez)',
        href: 'https://www.oyez.org/cases/1999/99-401',
      },
      {
        label: 'Ballotpedia: partisan affiliations of registered voters by state',
        href: 'https://ballotpedia.org/Partisan_affiliations_of_registered_voters',
      },
      {
        label: 'The American Presidency Project: every national party platform',
        href: 'https://www.presidency.ucsb.edu/documents/app-categories/elections-and-transitions/party-platforms',
      },
      {
        label: 'Britannica: Democratic Party',
        href: 'https://www.britannica.com/topic/Democratic-Party',
      },
      {
        label: 'Britannica: Republican Party',
        href: 'https://www.britannica.com/topic/Republican-Party',
      },
      {
        label: 'National Archives: the 14th Amendment',
        href: 'https://www.archives.gov/milestone-documents/14th-amendment',
      },
      {
        label: 'National Archives: the Civil Rights Act of 1964',
        href: 'https://www.archives.gov/milestone-documents/civil-rights-act',
      },
      {
        label: 'U.S. House: party divisions in Congress since 1789',
        href: 'https://history.house.gov/Institution/Party-Divisions/Party-Divisions/',
      },
      {
        label: 'Gallup: party affiliation over time',
        href: 'https://news.gallup.com/poll/15370/party-affiliation.aspx',
      },
      {
        label: 'Pew Research Center: Political Polarization in the American Public',
        href: 'https://www.pewresearch.org/politics/2014/06/12/political-polarization-in-the-american-public/',
      },
      {
        label: 'More in Common: The Perception Gap',
        href: 'https://perceptiongap.us/',
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
