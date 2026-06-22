import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    ppr: false,
    reactCompiler: false,
  },
  images: {
    // Skip Next.js image optimization — TMDB and Clerk both serve from their
    // own fast global CDNs with already-sized images. On Render free tier,
    // the AVIF/WebP conversion pipeline adds 10-15s of CPU overhead per new
    // page with 20+ posters, far worse than serving originals directly.
    unoptimized: true,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@watchblitz/types': require('path').resolve(__dirname, '../../packages/types/src'),
      '@watchblitz/config': require('path').resolve(__dirname, '../../packages/config/src'),
      '@watchblitz/utils': require('path').resolve(__dirname, '../../packages/utils/src'),
    }
    return config
  },
}

export default nextConfig
