/** @type {import('next').NextConfig} */
// Next.js configuration file
// Configure build settings, environment variables, and other Next.js options
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable experimental features if needed
  experimental: {
    // Add experimental features here
  },
  // Image optimization configuration
  images: {
    domains: [],
    remotePatterns: [],
    // Allow local storage paths for portfolio uploads
    unoptimized: process.env.NODE_ENV === 'development', // Disable optimization in dev for local files
  },
};

module.exports = nextConfig;

