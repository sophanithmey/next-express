import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Isolate dev cache from production build output to prevent `yarn build` from corrupting a running `yarn dev` server
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

export default nextConfig;
