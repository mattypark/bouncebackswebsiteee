import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up past Bouncebackwebsite
  // and try to resolve modules from /Users/matthewpark/Downloads/current-projects.
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // Old Wix pages → redirect to relevant current pages
      { source: "/collection-locations", destination: "/request-bin", permanent: true },
      { source: "/the-team", destination: "/about", permanent: true },
      { source: "/shipping-policy", destination: "/", permanent: true },
      { source: "/terms-conditions", destination: "/", permanent: true },
      { source: "/retro-pickle-t-shirt", destination: "/bb-1", permanent: true },
      { source: "/shop", destination: "/bb-1", permanent: true },
    ];
  },
};

export default nextConfig;
