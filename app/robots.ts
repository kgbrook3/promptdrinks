import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://promptdrinks.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
