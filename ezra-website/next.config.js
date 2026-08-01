/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  // NOTE: output: 'export' removed so Vercel can serve the site properly.
  // Static files in public/ (including /downloads/) are served by Vercel automatically.
}

module.exports = nextConfig
