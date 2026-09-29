import type { StoryPhoto } from './types';

/** Donny, the cat — the other half of "a guy and a cat in the woods". */
export const donny = {
  name: 'Donny',
  /** Home-page showcase: out in the woods. */
  woods: {
    src: '/images/donny/woods.jpg',
    alt: 'Donny, an orange tabby, sitting on a mossy boulder in a sunlit forest, ferns behind, looking off to the side.',
    width: 360,
    height: 480,
    caption: 'Out in the woods with Donny.',
  },
  then: [
    {
      src: '/images/donny/kitten-desk.jpg',
      alt: 'Donny as a kitten in a checkered collar, sitting on a desk and looking into the camera next to a guitar headstock.',
      width: 1086,
      height: 724,
      caption: 'First day on the job.',
    },
    {
      src: '/images/donny/kitten-bongo.jpg',
      alt: 'Donny as a kitten sitting on top of a bongo drum, mid nose-lick, with a lamp and a wooden chest behind.',
      width: 724,
      height: 1086,
      caption: 'On drums.',
    },
    {
      src: '/images/donny/kitten-sky.jpg',
      alt: 'Donny as a kitten held up in one hand against a bright blue sky, mouth open mid-meow.',
      width: 482,
      height: 360,
      caption: 'Loud from day one.',
    },
  ],
  now: [
    {
      src: '/images/donny/close-up.jpg',
      alt: 'Close-up of Donny grown up, staring into the camera wide-eyed with the tip of the tongue out, on a sunny wood floor.',
      width: 900,
      height: 1200,
      caption: 'Code review.',
    },
    {
      src: '/images/donny/window.jpg',
      alt: 'Donny grown up, lounging on a window seat with one paw stretched along the sill, gazing outside.',
      width: 768,
      height: 1024,
      caption: 'Monitoring production.',
    },
    {
      src: '/images/donny/floor.jpg',
      alt: 'Donny grown up, belly-up on a hardwood floor in a doorway, paws in the air.',
      width: 768,
      height: 1024,
      caption: 'Out of office.',
    },
  ],
} satisfies {
  name: string;
  woods: StoryPhoto;
  then: StoryPhoto[];
  now: StoryPhoto[];
};
