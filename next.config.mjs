/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.symlinks = true;
    return config;
  },
};

export default nextConfig;
