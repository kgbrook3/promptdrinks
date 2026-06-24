import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateRecipe, generateImage } from "@/lib/ai";
import { saveCocktail, saveImage } from "@/lib/store";
import type { Cocktail } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Please enter something." }, { status: 400 });
    }
    const cleanPrompt = prompt.trim().slice(0, 500);

    const recipe = await generateRecipe(cleanPrompt);
    const id = randomUUID();

    let imageUrl = "";
    try {
      const bytes = await generateImage(recipe.imagePrompt);
      await saveImage(id, bytes);
      imageUrl = `/api/image/${id}`;
    } catch (imgErr) {
      // Recipe still works without an image.
      console.error("Image generation failed:", imgErr);
    }

    const cocktail: Cocktail = {
      id,
      prompt: cleanPrompt,
      name: recipe.name,
      tagline: recipe.tagline,
      description: recipe.description,
      glassware: recipe.glassware,
      garnish: recipe.garnish,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    await saveCocktail(cocktail);
    return NextResponse.json(cocktail);
  } catch (err: any) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong generating your cocktail." },
      { status: 500 }
    );
  }
}
