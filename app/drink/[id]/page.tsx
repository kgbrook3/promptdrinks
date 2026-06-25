import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCocktail } from "@/lib/store";
import CocktailCard from "@/components/CocktailCard";
import ShareButtons from "@/components/ShareButtons";
import CheersButton from "@/components/CheersButton";
import ShareCard from "@/components/ShareCard";

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
  if (!cocktail) return { title: "Drink not found" };

  const base = siteBase();
  const image = cocktail.imageUrl ? `${base}${cocktail.imageUrl}` : undefined;
  const ogTitle = `${cocktail.name} — PromptDrinks`;
  const description =
    cocktail.tagline || cocktail.description || `A cocktail inspired by "${cocktail.prompt}".`;

  return {
    title: cocktail.name,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: "article",
      url: `${base}/drink/${cocktail.id}`,
      siteName: "PromptDrinks",
      images: image ? [{ url: image, width: 1024, height: 1024, alt: cocktail.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function DrinkPage({ params }: { params: { id: string } }) {
  const cocktail = await getCocktail(params.id);
  if (!cocktail) notFound();

  const shareText = cocktail.tagline || `A cocktail inspired by "${cocktail.prompt}"`;

  const recipeText = [
    cocktail.name,
    cocktail.tagline ? `${cocktail.tagline}\n` : "",
    "Ingredients:",
    ...cocktail.ingredients.map((i) => `- ${i}`),
    "",
    "Instructions:",
    ...cocktail.instructions.map((s, i) => `${i + 1}. ${s}`),
    "",
    `Made with PromptDrinks — ${siteBase()}/drink/${cocktail.id}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: cocktail.name,
    description: cocktail.description || shareText,
    image: cocktail.imageUrl ? [`${siteBase()}${cocktail.imageUrl}`] : undefined,
    recipeCategory: cocktail.mocktail ? "Mocktail" : "Cocktail",
    recipeYield: "1 drink",
    keywords: cocktail.prompt,
    recipeIngredient: cocktail.ingredients,
    recipeInstructions: cocktail.instructions.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: s,
    })),
    author: { "@type": "Organization", name: "PromptDrinks" },
  };

  return (
    <div className="drink-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/gallery" className="back-link">
        ← Back to gallery
      </Link>
      <CocktailCard cocktail={cocktail} />
      <div className="cheers-row">
        <CheersButton id={cocktail.id} initial={cocktail.cheers ?? 0} />
      </div>
      <ShareButtons
        title={cocktail.name}
        text={shareText}
        imageUrl={cocktail.imageUrl || undefined}
        recipeText={recipeText}
      />
      <div className="sharecard-row">
        <ShareCard
          name={cocktail.name}
          tagline={cocktail.tagline}
          imageUrl={cocktail.imageUrl || undefined}
          mocktail={cocktail.mocktail}
        />
      </div>
    </div>
  );
}
