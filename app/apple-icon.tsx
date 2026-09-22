import { ImageResponse } from 'next/og';

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
      <svg width="124" height="107" viewBox="0 0 44 38" fill="none">
        <path d="M0 30.25h44" stroke="#72D6C9" strokeWidth="1.6" />
        <path
          d="M17 6v16.5a7 7 0 0 1-14 0"
          stroke="#F4F0E8"
          strokeWidth="3.6"
          strokeLinecap="square"
        />
        <path d="M27.5 6v24.25H41" stroke="#F4F0E8" strokeWidth="3.6" strokeLinecap="square" />
      </svg>
    </div>,
    size,
  );
}
