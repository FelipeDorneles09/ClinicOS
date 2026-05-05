/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    // INTERNAL_API_URL is used server-side (inside Docker network: http://api:3001/api)
    // Falls back to localhost for local dev without Docker
    const destination = process.env.INTERNAL_API_URL || "http://localhost:3001/api";
    return [
      {
        source: "/api/:path*",
        destination: `${destination}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
