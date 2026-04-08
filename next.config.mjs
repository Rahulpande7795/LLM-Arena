/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
