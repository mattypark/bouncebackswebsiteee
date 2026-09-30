import type { NextConfig } from "next";
import path from "path";

// PostHog goes through our own domain (/ingest) so ad blockers don't drop
// page views. US region; NEXT_PUBLIC_POSTHOG_REGION=eu for an EU project.
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";

const nextConfig: NextConfig = {
  // PostHog's API paths end in a slash; Next would otherwise redirect them
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `https://${posthogHost}-assets.i.posthog.com/static/:path*` },
      { source: "/ingest/:path*", destination: `https://${posthogHost}.i.posthog.com/:path*` },
    ];
  },

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
      { source: "/retro-pickle-t-shirt", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
