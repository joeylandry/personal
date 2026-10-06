'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { togglePinned, usePinned } from '@/lib/pinned-player';
import { canOptimizeImage } from '@/lib/spotify-images';
import { EqBars } from './live-player';
import { PlayGlyph, Vinyl } from './vinyl';

/**
 * The site's record, in the header on phones, after the Dynamic Island.
 *
 * Nothing until something has played on the site's record player. Then a
 * small black pill sits in the middle of the header: the spinning disc on the
 * left, the waveform on the right. Tapping it expands it in place into the
 * song, its artist and a play/pause button; tapping outside or Escape folds it
 * back. It drives the same shared player as the hero's mini record and the
 * About turntable, so it is how the music gets paused from any page.
 */
export function MusicIsland() {
  const { status, playing, started, track, pinned } = usePinned();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fold back on a tap anywhere else, or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const song = track ?? pinned;
  if (!started || status !== 'ready' || !song) return null;

  return (
    <div ref={ref} data-open={open} className="music-island md:hidden">
      {open ? (
        <div className="flex items-center gap-3 p-2.5 pr-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
            {song.art ? (
              <Image
                src={song.art}
                alt=""
                fill
                sizes="48px"
                unoptimized={!canOptimizeImage(song.art)}
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{song.title}</p>
            <p className="truncate text-xs text-white/60">
              {song.artist ?? (track ? 'Sampling' : 'My mind currently')}
            </p>
          </div>
          <EqBars playing={playing} />
          <button
            type="button"
            onClick={togglePinned}
            aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black transition-[scale] duration-200 active:scale-95"
          >
            <PlayGlyph playing={playing} size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label={`${playing ? 'Playing' : 'Paused'}: ${song.title}. Show controls`}
          className="flex h-full w-full items-center justify-between px-1.5"
        >
          <span className="block size-[1.375rem]">
            <Vinyl art={song.art} playing={playing} sizes="22px" className="record-solo" />
          </span>
          <span className="pr-1.5">
            <EqBars playing={playing} />
          </span>
        </button>
      )}
    </div>
  );
}
