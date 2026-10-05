import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Notes became the Blog.
      { source: '/notes', destination: '/blog', permanent: true },
      { source: '/notes/:slug', destination: '/blog/:slug', permanent: true },
      // The experience page folded into About.
      { source: '/experience', destination: '/about#education', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Spotify album art for the live player.
    remotePatterns: [{ protocol: 'https', hostname: 'i.scdn.co' }],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
