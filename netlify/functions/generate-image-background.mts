import { getStore } from "@netlify/blobs";

// Background functions (filename ends in -background) run asynchronously with no
// 26s sync limit — up to 15 minutes — so we can generate high-quality images.
const IMAGE_MODEL = process.env.IMAGE_MODEL || "gpt-image-1";
const IMAGE_SIZE = process.env.IMAGE_SIZE || "1024x1024";
const IMAGE_QUALITY = process.env.IMAGE_QUALITY || "high";

function buildPrompt(imagePrompt: string): string {
  return (
    `Professional, photorealistic cocktail photography for a high-end cocktail menu. ` +
    `${imagePrompt}. The drink is the clear hero, centered in appropriate glassware ` +
    `with realistic ice, condensation, and a fresh garnish. Moody upscale bar setting ` +
    `softly blurred behind it, warm cinematic lighting, shallow depth of field as if shot ` +
    `on a 50mm lens, crisp focus on the glass, rich saturated color, subtle reflections and ` +
    `highlights. No text, no logos, no watermarks, no hands or people.`
  );
}

export default async (req: Request): Promise<Response> => {
  try {
    const { id, imagePrompt } = await req.json();
    if (!id || !imagePrompt) {
      return new Response("Missing id or imagePrompt", { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const body: Record<string, unknown> = {
      model: IMAGE_MODEL,
      prompt: buildPrompt(imagePrompt),
      size: IMAGE_SIZE,
      n: 1,
    };
    if (IMAGE_MODEL.startsWith("gpt-image")) body.quality = IMAGE_QUALITY;

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Image API failed:", res.status, await res.text());
      return new Response("Image API failed", { status: 502 });
    }

    const data = await res.json();
    let buf: Buffer | null = null;
    const b64 = data?.data?.[0]?.b64_json;
    if (b64) {
      buf = Buffer.from(b64, "base64");
    } else if (data?.data?.[0]?.url) {
      const r = await fetch(data.data[0].url);
      buf = Buffer.from(await r.arrayBuffer());
    }
    if (!buf) return new Response("No image data", { status: 502 });

    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    await getStore({ name: "cocktail-images", consistency: "strong" }).set(id, ab);

    const cocktails = getStore({ name: "cocktails", consistency: "strong" });
    const cocktail = (await cocktails.get(id, { type: "json" })) as
      | { imageUrl?: string }
      | null;
    if (cocktail) {
      cocktail.imageUrl = `/api/image/${id}`;
      await cocktails.setJSON(id, cocktail);
    }

    return new Response("ok");
  } catch (err) {
    console.error("Background image generation error:", err);
    return new Response("error", { status: 500 });
  }
};
