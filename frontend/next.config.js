/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    // Server-side only — Next.js SSR calls backend directly via Docker DNS
    INTERNAL_API_URL: process.env.INTERNAL_API_URL || 'http://backend:5000',
    // Client-side — browser calls go through nginx proxy at /api/*
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_ADSENSE_ID: process.env.NEXT_PUBLIC_ADSENSE_ID || '',
  },
}

module.exports = nextConfig
