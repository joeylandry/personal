import type { StoryPhoto } from './types';

/**
 * Photos from the Nyes Neck fundraiser years, oldest first. Captions describe
 * only what the photo shows; nobody else in frame is named.
 */
export const storyPhotos: StoryPhoto[] = [
  {
    src: '/images/story/lemonade-stand.jpg',
    alt: 'Joey as a kid standing beside a hand-painted “Lemanade” sign and a striped table of bracelets strung with colored lights, on a lawn in front of a gray-shingled porch.',
    width: 1024,
    height: 768,
    caption: '2013 — lemonade and bracelets. The first $50.',
  },
  {
    src: '/images/story/games-night.jpg',
    alt: 'Joey behind a small table by the water, with a hand-lettered whiteboard: Games Night tonight, $2, 7:30–8:30 pm at the Beach Field, profits to the Make-A-Wish Foundation.',
    width: 768,
    height: 1024,
    caption: 'Games night at the Beach Field. $2 at the door.',
  },
  {
    src: '/images/story/make-a-wish-booth.jpg',
    alt: 'A white pop-up tent with a Make-A-Wish Massachusetts and Rhode Island banner over two striped tables, with the harbor behind it.',
    width: 517,
    height: 334,
    caption: 'The table by the harbor.',
  },
  {
    src: '/images/story/movie-night.jpg',
    alt: 'Kids on blankets in a backyard at dusk, watching a movie projected onto a sheet hung on a wooden fence.',
    width: 1024,
    height: 768,
    caption: 'Backyard movie nights.',
  },
  {
    src: '/images/story/make-a-wish-tent.jpg',
    alt: 'Joey and a friend under a white tent with Make-A-Wish banners, behind tables of folded T-shirts, a hung sweatshirt and rows of navy gift bags.',
    width: 1024,
    height: 768,
    caption: 'Apparel and gift bags under the Make-A-Wish tent.',
  },
  {
    src: '/images/story/dock-sunset.jpg',
    alt: 'The sun setting over calm water at the end of a long wooden dock, one person sitting alone at the far end, a jetty of rocks and a few shingled houses on the point to the left.',
    width: 1024,
    height: 769,
    caption: 'Sundown from the dock.',
    wide: true,
  },
];

/** The cat — the other half of "a guy and a cat in the woods". */
export const catPhotos: StoryPhoto[] = [
  {
    src: '/images/cat/woods.jpg',
    alt: 'An orange tabby sitting on a mossy boulder in a sunlit forest, ferns behind, looking off to the side.',
    width: 360,
    height: 480,
    caption: 'Out in the woods.',
  },
  {
    src: '/images/cat/close-up.jpg',
    alt: 'Extreme close-up of an orange tabby staring into the camera, wide-eyed, with the tip of its tongue out, on a sunny wood floor.',
    width: 900,
    height: 1200,
    caption: 'Code review.',
  },
  {
    src: '/images/cat/window.jpg',
    alt: 'An orange tabby lounging on a window seat with one paw stretched along the sill, gazing out at houses and gardens.',
    width: 768,
    height: 1024,
    caption: 'Monitoring production.',
  },
  {
    src: '/images/cat/floor.jpg',
    alt: 'An orange tabby rolled onto its back on a hardwood floor in a doorway, paws in the air, looking at the camera.',
    width: 768,
    height: 1024,
    caption: 'Out of office.',
  },
];
