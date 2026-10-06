import type { StoryPhoto } from './types';

/**
 * The Giving page: nine years of Nyes Neck fundraisers for Make-A-Wish
 * Massachusetts and Rhode Island, then what carries on through Nyes Neck
 * Clothing & Apparel. Copy is based on Joey’s account of the fundraisers.
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
    title: 'It started with a lemonade stand.',
    body: [
      'When I was nine, I learned about Make-A-Wish and the experiences it creates for children with critical illnesses. Granting a single wish costs about $20,000, so I set that as my goal and started with a lemonade stand in Nyes Neck, the Cape Cod neighborhood where I spent my summers.',
      'Over the next nine summers I organized games nights, movie nights, raffles and apparel sales. Not every event worked, but each year I learned from it and the neighborhood continued to support the cause. By 2021, we had raised more than $20,000 for Make-A-Wish Massachusetts and Rhode Island.',
    ],
    /** Headline figures beside the title. The last one is the chapter still being written. */
    stats: [
      { value: '$20,000+', label: 'Raised for Make-A-Wish Massachusetts and Rhode Island' },
      { value: '9 years', label: 'Summer fundraisers in Nyes Neck, 2013 to 2021' },
      {
        value: 'Now',
        label: 'Continuing the work for St. Jude through Nyes Neck Clothing & Apparel',
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
      title: 'The first fundraiser',
      body: 'Lemonade, iced tea and handmade bracelets on the lawn, under a hand-painted sign. It raised $50 and gave me a place to start.',
      photos: [
        {
          src: '/images/giving/2013-lemonade-stand.jpg',
          alt: 'Joey at nine beside a hand-painted “Lemanade” sign and a striped table of bracelets strung with colored lights, on a lawn in front of a gray-shingled porch.',
          width: 1600,
          height: 1200,
          caption: 'The first stand, 2013.',
        },
      ],
    },
    {
      year: '2014',
      title: 'Games night at the Beach Field',
      body: 'Two dollars at the door for an hour of games at the Beach Field. Not every event that summer drew a crowd: one movie night had two kids, and a games night was canceled for lack of interest. Those setbacks taught me to plan around what people actually wanted to attend.',
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
      title: 'Setting up by the harbor',
      body: 'A pop-up tent, two tables and a Make-A-Wish banner. Most of the fundraisers ran during the day, so I set up near the water where beach-goers and neighbors would pass by.',
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
      body: 'A projector, a sheet on the fence and a lawn full of blankets. Movie nights drew a steady crowd, and gift bags and s’mores kits became a regular part of each summer.',
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
      body: 'By 2019 the table had grown into a tent with shirts, sweatshirts and gift bags, all supporting Make-A-Wish. Each summer raised more than the last, though the total was still several thousand dollars short of the goal.',
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
      title: 'The final fundraiser: the first Nyes Neck Gala',
      body: 'My last summer before college. The neighborhood gathers each year for its annual meeting, so I organized an event to follow it: a tent, a live band and the first Nyes Neck apparel. The evening brought the total past $20,000.',
      photos: [
        {
          src: '/images/giving/2021-annual-meeting.jpg',
          alt: 'A hand-drawn sign on a split-rail fence reading “Nyes Neck, Sat 10th, Annual Meeting 5pm”, with a crowd gathered under a white tent by the water behind it.',
          width: 768,
          height: 1024,
          caption: 'The Nyes Neck annual meeting, 2021.',
        },
        {
          src: '/images/giving/2021-live-music.jpg',
          alt: 'A four-piece band (bass, drums, guitar and keyboard) playing under a white tent strung with lights and a Make-A-Wish banner.',
          width: 969,
          height: 810,
          caption: 'Live music under the tent.',
        },
        {
          src: '/images/giving/2021-tent-party.jpg',
          alt: 'A crowd dancing under a tent lit purple and blue at night, with Make-A-Wish banners along the back wall.',
          width: 1600,
          height: 1200,
          caption: 'The gala after dark.',
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
  },

  next: {
    title: 'Continuing the work with St. Jude.',
    body: [
      'The apparel first sold under the tent in 2021 is now Nyes Neck Clothing & Apparel, a brand inspired by Nyes Neck and Cape Cod. A portion of proceeds supports St. Jude Children’s Research Hospital.',
      'In the future, I hope to build a nonprofit focused on supporting children in need and people affected by domestic violence. For now, the shop continues to give back.',
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

  closing:
    'Thank you to my family, my neighbors, and everyone who showed up for Make-A-Wish along the way.',
};
