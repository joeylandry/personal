import type { StoryPhoto } from './types';

/** Donny, the cat — the other half of "a guy and a cat in the woods". */
export const donny = {
  name: 'Donny',
  /** Home-page hero card. */
  headshot: {
    src: '/images/donny/close-up.jpg',
    alt: 'Donny, an orange tabby, staring straight into the camera, wide-eyed, with the tip of the tongue out.',
    width: 900,
    height: 1200,
    caption: 'Donny.',
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
      src: '/images/donny/kitten-sky.jpg',
      alt: 'Donny as a kitten held up in one hand against a bright blue sky, mouth open mid-meow.',
      width: 482,
      height: 360,
      caption: 'Loud from day one.',
    },
  ],
  now: [
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
  headshot: StoryPhoto;
  then: StoryPhoto[];
  now: StoryPhoto[];
};
