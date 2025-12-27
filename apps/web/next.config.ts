import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: [
    '@impulsar/ui',
    '@impulsar/stellar-sdk',
    '@impulsar/contracts',  // API contracts (TypeScript interfaces)
    '@impulsar/dtos',       // CRITICAL: DTO serialization/deserialization for API calls
    '@impulsar/core',       // CRITICAL: Date helpers, validators, formatters used by frontend
    '@impulsar/config'      // Environment validation, API endpoints
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
};

export default config;

