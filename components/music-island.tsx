'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { togglePinned, usePinned } from '@/lib/pinned-player';
import type { RecordTrack } from '@/lib/pinned-player';
import { canOptimizeImage } from '@/lib/spotify-images';
import { EqBars } from './live-player';
import { PlayGlyph } from './vinyl';

/** How long a press must last to open the island instead of following it. */
const HOLD_MS = 450;

function Art({ song, className }: { song: RecordTrack; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-white/10 ${className}`}>
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
    </span>
  );
}

/**
 * The site's record, in the header on phones, after the Dynamic Island.
 *
 * Nothing until something has played on the site's record player. Then a
 * small black pill sits in the middle of the header: the song's album art on
 * the left, the waveform on the right. A tap goes straight to the spinning
 * record on the About page; a press-and-hold grows it in place into the song,
 * its artist and a play/pause button, as iOS does, and a tap outside or
 * Escape folds it back. It drives the same shared player as the hero's mini
 * record and the About turntable.
 */
export function MusicIsland() {
  const { status, playing, audible, started, track, pinned } = usePinned();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const router = useRouter();

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

  useEffect(
    () => () => {
      if (hold.current) clearTimeout(hold.current);
    },
    [],
  );

  const song = track ?? pinned;
  if (!started || status !== 'ready' || !song) return null;

  const startHold = () => {
    held.current = false;
    hold.current = setTimeout(() => {
      held.current = true;
      setOpen(true);
    }, HOLD_MS);
  };
  const endHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };

  return (
    <div ref={ref} data-open={open} className="music-island md:hidden">
      {open ? (
        <div className="flex h-full items-center gap-3 p-2.5 pr-3">
          <Art song={song} className="size-12 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{song.title}</p>
            <p className="truncate text-xs text-white/60">
              {song.artist ?? (track ? 'Sampling' : 'Site sound currently')}
            </p>
          </div>
          <span className="flex items-center">
            <EqBars playing={audible} />
          </span>
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
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(event) => event.preventDefault()}
          onClick={() => {
            // A long press opened the island; don't also follow it.
            if (held.current) {
              held.current = false;
              return;
            }
            router.push('/about#record');
          }}
          aria-label={`${playing ? 'Playing' : 'Paused'}: ${song.title}. Go to the record player`}
          className="music-island-pill"
        >
          <Art song={song} className="size-[1.375rem] rounded-[0.4rem]" />
          <span className="flex h-full items-center">
            <EqBars playing={audible} />
          </span>
        </button>
      )}
    </div>
  );
}
