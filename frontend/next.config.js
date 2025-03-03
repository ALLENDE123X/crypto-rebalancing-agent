/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['near.org'],
  },
  // Allow CORS for AWS Lambda API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_LAMBDA_API_URL 
          ? `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}/:path*`
          : '/api/:path*',
      },
    ];
  },
  webpack(config) {
    // Add polyfills and fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
      http: false,
      https: false,
      zlib: false,
    };
    
    // Fix __webpack_require__.a issue
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    return config;
  },
};

module.exports = nextConfig; 