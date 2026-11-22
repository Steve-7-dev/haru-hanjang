import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  transpilePackages: [],
};

export default nextConfig;
