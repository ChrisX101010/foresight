/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Wallet-adapter and Solana libs ship CJS + use node built-ins. Keep them out of the
  // Edge runtime bundle and let the browser polyfills kick in only where needed.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  // Note: DFlow requests go through the /api/dflow/[...path] route handler
  // (src/app/api/dflow/[...path]/route.ts) rather than a rewrite, because
  // we inject the x-api-key header server-side. Leaving this here for docs.
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
    '@kamino-finance/klend-sdk',
  ],
};

module.exports = nextConfig;
