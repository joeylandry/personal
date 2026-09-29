import type { StoryPhoto } from './types';

/**
 * The Giving page: nine years of Nyes Neck fundraisers for Make-A-Wish
 * Massachusetts and Rhode Island, then what carries on through Nyes Neck
 * Clothing & Apparel. Captions are placeholders until Joey writes his own.
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
    kicker: 'Giving',
    title: 'Nine years, one neighborhood, $20,000+ for Make-A-Wish.',
    body: [
      'When I was nine, I got my first glimpse of the joy Make-A-Wish brings to children with critical illnesses, and I wanted to help. So I started where I was: Nyes Neck, a small neighborhood on Cape Cod.',
      'It began with a lemonade stand and grew, summer after summer, into games nights, movie nights, apparel, gift bags and live music — with the whole neighborhood showing up. Together we raised more than $20,000 for Make-A-Wish Massachusetts and Rhode Island.',
    ],
    quote:
      'I have been given an amazing opportunity to help provide life-changing experiences for wish children.',
  },

  /** Oldest first, ordered by the date each photo was taken. */
  chapters: [
    {
      year: '2013',
      title: 'Where it started',
      body: 'A lemonade stand and bracelets on the lawn in Nyes Neck. The very first fundraiser.',
      photos: [
        {
          src: '/images/giving/2013-lemonade-stand.jpg',
          alt: 'Joey at nine beside a hand-painted “Lemanade” sign and a striped table of bracelets strung with colored lights, on a lawn in front of a gray-shingled porch.',
          width: 1600,
          height: 1200,
          caption: 'Lemonade and bracelets, 2013.',
        },
      ],
    },
    {
      year: '2014',
      title: 'Games night at the Beach Field',
      body: 'Two dollars at the door, 7:30 to 8:30, rain date next Monday. Profits went to Make-A-Wish.',
      photos: [
        {
          src: '/images/giving/2014-games-night.jpg',
          alt: 'Joey behind a small table by the water, with a hand-lettered whiteboard: Games Night tonight, $2, 7:30–8:30 pm at the Beach Field, profits to the Make-A-Wish Foundation.',
          width: 768,
          height: 1024,
          caption: 'Games night, 2014.',
        },
      ],
    },
    {
      title: 'The table by the harbor',
      body: 'A pop-up tent, two striped tables and a Make-A-Wish banner, set up where the neighborhood walks by the water.',
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
      body: 'A sheet on the fence, a projector and a lawn full of blankets. Movie-night gift bags and s’mores kits became a summer staple.',
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
      body: 'By 2019 the table had become a tent: shirts, sweatshirts and rows of gift bags, all for Make-A-Wish.',
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
      title: 'The last one: live music after the annual meeting',
      body: 'My final fundraiser before college — a live band under the tent after the Nyes Neck annual meeting. It pushed the total past $20,000.',
      photos: [
        {
          src: '/images/giving/2021-annual-meeting.jpg',
          alt: 'A hand-drawn sign on a split-rail fence reading “Nyes Neck, Sat 10th, Annual Meeting 5pm”, with a crowd gathered under a white tent by the water behind it.',
          width: 768,
          height: 1024,
          caption: 'The annual meeting, 5 pm.',
        },
        {
          src: '/images/giving/2021-live-music.jpg',
          alt: 'A four-piece band — bass, drums, guitar and keyboard — playing under a white tent strung with lights and a Make-A-Wish banner.',
          width: 969,
          height: 810,
          caption: 'The band.',
        },
        {
          src: '/images/giving/2021-tent-party.jpg',
          alt: 'A crowd dancing under a tent lit purple and blue at night, with Make-A-Wish banners along the back wall.',
          width: 1600,
          height: 1200,
          caption: 'Under the tent, after dark.',
        },
      ],
    },
  ] satisfies GivingChapter[],

  thanks: {
    kicker: 'From Make-A-Wish',
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
    kicker: 'What’s next',
    title: 'Continuing where I left off — with St. Jude.',
    body: [
      'Nyes Neck Clothing & Apparel carries the same purpose forward. It’s a brand inspired by Nyes Neck and Cape Cod, and a portion of proceeds supports St. Jude Children’s Research Hospital.',
      'The long-term goal is to build a nonprofit around this work, helping children in need and people affected by domestic violence. Until then, the shop keeps giving back.',
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
    'Thank you to everyone who has supported Nyes Neck, Make-A-Wish, and every fundraiser along the way.',
};
