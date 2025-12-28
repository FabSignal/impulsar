import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const asyncStorageShim = resolve(process.cwd(), 'shims/async-storage');

const config: NextConfig = {
  transpilePackages: [
    '@impulsar/ui',
    '@impulsar/stellar-sdk',
    '@impulsar/contracts', // API contracts (TypeScript interfaces)
    '@impulsar/dtos', // CRITICAL: DTO serialization/deserialization for API calls
    '@impulsar/core', // CRITICAL: Date helpers, validators, formatters used by frontend
    '@impulsar/config', // Environment validation, API endpoints
  ],
  // CRITICAL: All internal packages used by frontend MUST be listed...
  // PRODUCTION-ALIGNED: Proxy API requests using environment variable
  // Change NEXT_PUBLIC_API_URL to switch between localhost/staging/production
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@react-native-async-storage/async-storage': asyncStorageShim,
      },
    },
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve = webpackConfig.resolve || {};
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias || {}),
      '@react-native-async-storage/async-storage': asyncStorageShim,
    };
    return webpackConfig;
  },
};

export default config;
