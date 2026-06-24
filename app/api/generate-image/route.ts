import { NextResponse } from "next/server";
import { generateImage } from "@/lib/ai";
import { saveImage, updateCocktailImage } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Step 2 of 2: generate the photo for an already-created cocktail and attach it.
export async function POST(req: Request) {
  try {
    const { id, imagePrompt } = await req.json();
    if (!id || !imagePrompt) {
      return NextResponse.json({ error: "Missing id or imagePrompt." }, { status: 400 });
    }

    const bytes = await generateImage(imagePrompt);
    await saveImage(id, bytes);
    const imageUrl = `/api/image/${id}`;
    await updateCocktailImage(id, imageUrl);

    return NextResponse.json({ imageUrl });
  } catch (err: any) {
    console.error("Image generation failed:", err);
    return NextResponse.json(
      { error: err?.message || "Image generation failed." },
      { status: 500 }
    );
  }
}
