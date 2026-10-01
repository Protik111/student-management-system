import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained `.next/standalone` build for minimal Docker images.
  output: "standalone",
  experimental: {
    // Bump Server Action body limit so we can accept PDF/DOCX uploads up to 10MB
    // through a Server Action (multipart/form-data) instead of a route handler.
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
