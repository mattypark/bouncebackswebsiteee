import type { MetadataRoute } from "next";
import { PACKS } from "@/lib/shopify-products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.bouncebackpickle.com";

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/bb-1`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), priority: 0.9 },
    ...PACKS.map((p) => ({
      url: `${baseUrl}/shop/${p.pack}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    { url: `${baseUrl}/locations`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/request-bin`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/account`, lastModified: new Date(), priority: 0.5 },
  ];
}
