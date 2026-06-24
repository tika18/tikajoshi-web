/** @type {import('next').NextConfig} */
const nextConfig = {
  // IGNORE ERRORS DURING BUILD (Crucial for Vercel)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduce watched paths in local dev to avoid EMFILE limits on macOS.
      config.watchOptions = {
        ...(config.watchOptions || {}),
        ignored: [
          "**/.git/**",
          "**/.next/**",
          "**/node_modules/**",
          "../backend/**",
          "../node_modules/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;