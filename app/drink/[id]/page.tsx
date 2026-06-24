import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCocktail } from "@/lib/store";
import CocktailCard from "@/components/CocktailCard";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

// Netlify sets URL to the site's primary address; fall back for other hosts.
function siteBase(): string {
  return process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "https://promptdrinks.com";
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const cocktail = await getCocktail(params.id);
  if (!cocktail) return { title: "Drink not found — PromptDrinks" };

  const base = siteBase();
  const image = cocktail.imageUrl ? `${base}${cocktail.imageUrl}` : undefined;
  const title = `${cocktail.name} — PromptDrinks`;
  const description =
    cocktail.tagline || cocktail.description || `A cocktail inspired by "${cocktail.prompt}".`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${base}/drink/${cocktail.id}`,
      siteName: "PromptDrinks",
      images: image ? [{ url: image, width: 1024, height: 1024, alt: cocktail.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function DrinkPage({ params }: { params: { id: string } }) {
  const cocktail = await getCocktail(params.id);
  if (!cocktail) notFound();

  const shareText = cocktail.tagline || `A cocktail inspired by "${cocktail.prompt}"`;

  return (
    <div className="drink-page">
      <Link href="/gallery" className="back-link">
        ← Back to gallery
      </Link>
      <CocktailCard cocktail={cocktail} />
      <ShareButtons title={cocktail.name} text={shareText} />
    </div>
  );
}
