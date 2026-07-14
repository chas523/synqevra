import type { NextConfig } from "next";

const shouldUseStandaloneOutput =
  process.env.CI === "true" || process.env.NEXT_STANDALONE === "true";

const nextConfig: NextConfig = {
  output: shouldUseStandaloneOutput ? "standalone" : undefined,
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@medplum/react",
      "lucide-react",
    ],
  },
  transpilePackages: [
    "@medplum/react",
    "@mantine/core",
    "@mantine/hooks",
    "@mantine/notifications",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/**",
      },
      // If deployed onto an external bucket, the protocol/hostname would be added here.
      // For local development we use localhost.
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3003/api/:path*"
        },
        {
          source: "/fhir/:path*",
          destination: "http://localhost:3003/fhir/:path*"
        },
        {
          source: "/tb-assets/:path*",
          destination: "http://localhost:8088/assets/:path*"
        },
        {
          source: "/public-assets/:path*",
          destination: "http://localhost:9000/public-assets/:path*"
        },
      ],
    };
  },
};

export default nextConfig;
