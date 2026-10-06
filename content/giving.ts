import type { StoryPhoto } from './types';

/**
 * The Giving page: nine years of Nyes Neck fundraisers for Make-A-Wish
 * Massachusetts and Rhode Island, then what carries on through Nyes Neck
 * Clothing & Apparel. Copy follows Joey's own account of the fundraisers.
 */

export interface GivingChapter {
  /** Year label on the timeline; omitted when the date is unknown. */
  year?: string;
  title: string;
  body: string;
  photos: StoryPhoto[];
}

export const giving = {
  intro: {
    title: 'At nine years old, my charitable career started.',
    body: [
      'When I was nine, I got my first glimpse of the joy Make-A-Wish brings to kids with critical illnesses, and I wanted to help. Then I read that granting one wish costs about $20,000, so that became my goal. I started where I was: a lemonade stand on the lawn in Nyes Neck, a small neighborhood on Cape Cod.',
      'It did not happen overnight. Every summer I tried something new (games nights, movie nights, raffles, apparel), and plenty of it flopped. I kept adapting, the neighborhood kept showing up, and by 2021 we had raised more than $20,000 for Make-A-Wish Massachusetts and Rhode Island.',
    ],
    /** Headline figures beside the title: the goal, the total raised, and where it goes now. */
    stats: [
      { value: '1 wish', label: 'The goal from the start. Granting one costs about $20,000' },
      {
        value: '$20,000+',
        label: 'Raised for Make-A-Wish Massachusetts and Rhode Island, 2013 to 2021',
      },
      {
        value: 'St. Jude',
        label:
          'Children’s Research Hospital, supported today by a portion of Nyes Neck Clothing & Apparel proceeds',
      },
    ],
    quote:
      'I have been given an amazing opportunity to help provide life-changing experiences for wish children.',
    quoteYear: '2021',
  },

  /** Oldest first, ordered by the date each photo was taken. */
  chapters: [
    {
      year: '2013',
      title: 'My first fundraiser',
      body: 'Lemonade, iced tea and bracelets on the lawn, under a hand-painted sign (spelling was not my strongest subject yet). It was a small start, but it was a start.',
      photos: [
        {
          src: '/images/giving/2013-lemonade-stand.jpg',
          alt: 'Joey at nine beside a hand-painted “Lemanade” sign and a striped table of bracelets strung with colored lights, on a lawn in front of a gray-shingled porch.',
          width: 1600,
          height: 1200,
          caption: 'Lemonade and bracelets. I raised only $50.',
        },
      ],
    },
    {
      year: '2014',
      title: 'Games night at the Beach Field',
      body: 'Two dollars at the door, 7:30 to 8:30 at the Beach Field, rain date next Monday. Not every night worked: I was crushed at 10 when only two kids showed up to Movie Night, and again a week later when I had to cancel Games Night for lack of interest. I kept going anyway.',
      photos: [
        {
          src: '/images/giving/2014-games-night.jpg',
          alt: 'Joey behind a small table by the water, with a hand-lettered whiteboard: Games Night tonight, $2, 7:30 to 8:30 pm at the Beach Field, profits to the Make-A-Wish Foundation.',
          width: 768,
          height: 1024,
          caption: 'Games night, 2014.',
        },
      ],
    },
    {
      title: 'The table by the harbor',
      body: 'A pop-up tent, two striped tables and a Make-A-Wish banner. My fundraisers ran in the daytime, so I set up by the water to catch beach-goers (and a few early arrivals to the annual meeting) on their way by.',
      photos: [
        {
          src: '/images/giving/harbor-table.jpg',
          alt: 'A white pop-up tent with a Make-A-Wish Massachusetts and Rhode Island banner over two striped tables, with the harbor behind it.',
          width: 517,
          height: 334,
          caption: 'The Make-A-Wish table by the harbor.',
        },
      ],
    },
    {
      year: '2016',
      title: 'Backyard movie nights',
      body: 'A sheet on the fence, a projector and a lawn full of blankets. This time the kids came, and movie-night gift bags and s’mores kits became a summer staple.',
      photos: [
        {
          src: '/images/giving/2016-movie-night.jpg',
          alt: 'Kids on blankets in a backyard at dusk, watching a movie projected onto a sheet hung on a wooden fence.',
          width: 1024,
          height: 768,
          caption: 'Movie night, 2016.',
        },
      ],
    },
    {
      year: '2019',
      title: 'Apparel and gift bags',
      body: 'By 2019 the table had become a tent: shirts, sweatshirts and rows of gift bags, all for Make-A-Wish. Each summer went better than the last, but I was still thousands of dollars short of $20,000.',
      photos: [
        {
          src: '/images/giving/2019-apparel-tent.jpg',
          alt: 'Joey and a friend under a white tent with Make-A-Wish banners, behind tables of folded T-shirts, a hung sweatshirt and rows of navy gift bags.',
          width: 1024,
          height: 768,
          caption: 'The apparel tent, 2019.',
        },
      ],
    },
    {
      year: '2021',
      title: 'The last one: the first Nyes Neck Gala',
      body: 'My final summer before college. The whole neighborhood gathers once a year for the annual meeting (to debate the “dock,” among other fiery topics), so this time I took over when it ended: a tent, a live band, and the first ever Nyes Neck apparel. By dark the colored lights were on and everyone was dancing. It pushed the total past $20,000.',
      photos: [
        {
          src: '/images/giving/2021-annual-meeting.jpg',
          alt: 'A hand-drawn sign on a split-rail fence reading “Nyes Neck, Sat 10th, Annual Meeting 5pm”, with a crowd gathered under a white tent by the water behind it.',
          width: 768,
          height: 1024,
          caption: 'The annual meeting, always at 5 pm.',
        },
        {
          src: '/images/giving/2021-live-music.jpg',
          alt: 'A four-piece band (bass, drums, guitar and keyboard) playing under a white tent strung with lights and a Make-A-Wish banner.',
          width: 969,
          height: 810,
          caption: 'The band: my best friend and his siblings.',
        },
        {
          src: '/images/giving/2021-tent-party.jpg',
          alt: 'A crowd dancing under a tent lit purple and blue at night, with Make-A-Wish banners along the back wall.',
          width: 1600,
          height: 1200,
          caption: 'By dark, the colored lights came on.',
        },
      ],
    },
  ] satisfies GivingChapter[],

  thanks: {
    title: 'A thank-you from Make-A-Wish Massachusetts and Rhode Island.',
    image: {
      src: '/images/giving/make-a-wish-thank-you.jpg',
      alt: 'Make-A-Wish Massachusetts and Rhode Island thank-you graphic headlined “Joey Landry raises over $20K for Make-A-Wish Massachusetts and Rhode Island!”, telling the story of the Nyes Neck fundraisers and thanking Joey and the Nyes Neck community, beside a photo of a smiling wish child at a drum set.',
      width: 2000,
      height: 1428,
      caption: 'Make-A-Wish Massachusetts and Rhode Island.',
    },
    /** My reply, set under the graphic. */
    reply:
      'Thank you to my family, my neighbors, and everyone who showed up for Make-A-Wish along the way.',
  },

  /** Picks the timeline back up past the thank-you: where the work went next. */
  next: {
    year: '2026',
    title: 'Continuing where I left off, with St. Jude.',
    body: [
      'The Nyes Neck apparel started as a fundraiser under the tent in 2021. Now it is Nyes Neck Clothing & Apparel, a brand inspired by Nyes Neck and Cape Cod, and a portion of proceeds supports St. Jude Children’s Research Hospital.',
    ],
    photo: {
      src: '/images/giving/dock-sunset.jpg',
      alt: 'The sun setting over calm water at the end of a long wooden dock, one person sitting alone at the far end, a jetty of rocks and shingled houses on the point to the left.',
      width: 1024,
      height: 769,
      caption: 'Nyes Neck at sundown.',
    },
    shopUrl: 'https://www.nyesneck.shop',
    stJudeUrl: 'https://www.stjude.org',
  },

  /**
   * The timeline's last stop: the part still being written. The nonprofit is
   * in the works, so the copy asks for help shaping it, not for donations.
   */
  now: {
    year: 'Now',
    title: 'Still going. Want to help?',
    body: 'I’m working toward a nonprofit that helps children in need and people affected by domestic violence. It’s early, and I’d love help shaping it, whether that’s an idea, an introduction, or a hand at the next event under the tent.',
  },
};
