'use client';

import { PINNED_EMBED_HEIGHT, PINNED_MOUNT_ID } from '@/lib/pinned-player';

/**
 * Lives in the root layout, so it survives client-side navigation: the one
 * Spotify embed the whole site plays through. The records (the hero's mini
 * record and the About turntable) are the controls, and the music keeps going
 * as you browse.
 *
 * Transparent and behind the page, but in the viewport and not display:none:
 * browsers throttle or refuse to play from frames that are hidden or off
 * screen.
 */
export function PinnedHost() {
  return (
    <div
      id={PINNED_MOUNT_ID}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 -z-10 w-[300px] overflow-hidden opacity-0"
      style={{ height: PINNED_EMBED_HEIGHT }}
    />
  );
}
