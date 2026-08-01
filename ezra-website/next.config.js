/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  // GitHub Pages hosts at /Ezra-programming-lang/
  // Set basePath only in production (not in local dev)
  basePath: isProd ? '/Ezra-programming-lang' : '',
  assetPrefix: isProd ? '/Ezra-programming-lang/' : '',
}

module.exports = nextConfig
