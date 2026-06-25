import type { MetadataRoute } from "next";
import { listCocktails } from "@/lib/store";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://promptdrinks.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let drinks: Awaited<ReturnType<typeof listCocktails>> = [];
  try {
    drinks = await listCocktails();
  } catch {
    drinks = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "daily", priority: 0.8 },
  ];

  const drinkRoutes: MetadataRoute.Sitemap = drinks.map((d) => ({
    url: `${SITE_URL}/drink/${d.id}`,
    lastModified: d.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...drinkRoutes];
}
