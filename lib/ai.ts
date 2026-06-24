// Server-only helpers that talk to Claude (recipe) and an image API (photo).

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "gpt-image-1";
const IMAGE_SIZE = process.env.IMAGE_SIZE || "1024x1024";
// "low" keeps gpt-image-1 fast enough to finish inside the serverless timeout.
const IMAGE_QUALITY = process.env.IMAGE_QUALITY || "low";

export interface GeneratedRecipe {
  name: string;
  tagline: string;
  description: string;
  glassware: string;
  garnish: string;
  ingredients: string[];
  instructions: string[];
  imagePrompt: string;
}

const COCKTAIL_TOOL = {
  name: "create_cocktail",
  description: "Return a fully specified, original cocktail inspired by the user's prompt.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Creative, evocative cocktail name." },
      tagline: { type: "string", description: "A short, punchy one-line tagline." },
      description: {
        type: "string",
        description: "2-3 sentence description of the drink, its flavor and the connection to the prompt.",
      },
      glassware: { type: "string", description: "The glass it is served in." },
      garnish: { type: "string", description: "The garnish." },
      ingredients: {
        type: "array",
        items: { type: "string" },
        description: "Ingredients with measurements, e.g. '2 oz gin'.",
      },
      instructions: {
        type: "array",
        items: { type: "string" },
        description: "Ordered step-by-step preparation instructions.",
      },
      imagePrompt: {
        type: "string",
        description:
          "A vivid prompt for an image model to render a professional photo of this exact cocktail, including glass, color, garnish and setting. No text in the image.",
      },
    },
    required: [
      "name",
      "tagline",
      "description",
      "glassware",
      "garnish",
      "ingredients",
      "instructions",
      "imagePrompt",
    ],
  },
};

export async function generateRecipe(prompt: string): Promise<GeneratedRecipe> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      tool_choice: { type: "tool", name: COCKTAIL_TOOL.name },
      tools: [COCKTAIL_TOOL],
      messages: [
        {
          role: "user",
          content: `Invent an original cocktail that creatively captures the vibe, theme, or meaning of this input: "${prompt}". It can be alcoholic or a mocktail if that fits better. Be imaginative and make it genuinely mixable.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const toolUse = (data.content || []).find((c: any) => c.type === "tool_use");
  if (!toolUse?.input) throw new Error("Claude did not return a structured recipe.");
  return toolUse.input as GeneratedRecipe;
}

// Generates an image and returns raw PNG bytes.
export async function generateImage(imagePrompt: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: `Professional, appetizing cocktail photography. ${imagePrompt}. Soft studio lighting, shallow depth of field, no text or watermarks.`,
      size: IMAGE_SIZE,
      n: 1,
      // gpt-image-1 supports low|medium|high; dall-e-3 uses standard|hd, so only
      // send quality for gpt-image-* to avoid an invalid-parameter error.
      ...(IMAGE_MODEL.startsWith("gpt-image") ? { quality: IMAGE_QUALITY } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) return Buffer.from(b64, "base64");

  // Some models/configs return a URL instead of base64.
  const url = data?.data?.[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    const arrayBuffer = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Image API returned no image data.");
}
