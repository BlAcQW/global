import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships ESM; transpile it so Next bundles it cleanly.
  transpilePackages: ["three"],
};

export default nextConfig;
