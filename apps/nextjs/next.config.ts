import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import NextBundleAnalyzer from "@next/bundle-analyzer";
import createJiti from "jiti";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/app/config/env");

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const config: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/image/:path*",
        destination: "http://localhost:8000/image/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        port: "8000",
        hostname: "xd1rty.ru",
        protocol: "http",
        pathname: "/image/**",
      },
      {
        port: "9000",
        hostname: "localhost",
        protocol: "http",
        pathname: "/images/**",
      },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/ui",
    "@acme/validators",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withBundleAnalyzer(config);
