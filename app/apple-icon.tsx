import { ImageResponse } from 'next/og';
import { MONOGRAM_J, MONOGRAM_L } from '@/components/monogram';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const alt = 'JL monogram';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#071018',
      }}
    >
      <svg width="132" height="108" viewBox="3.5 1 33 27" fill="none">
        <path d="M3.5 27h33" stroke="#72D6C9" strokeWidth="1.6" />
        <path fill="#F4F0E8" d={MONOGRAM_J} />
        <path fill="#F4F0E8" d={MONOGRAM_L} />
      </svg>
    </div>,
    size,
  );
}
