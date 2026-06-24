import { getStore } from "@netlify/blobs";
import type { Cocktail, CocktailSummary } from "./types";

const COCKTAIL_STORE = "cocktails";
const IMAGE_STORE = "cocktail-images";

function cocktailStore() {
  return getStore({ name: COCKTAIL_STORE, consistency: "strong" });
}

function imageStore() {
  return getStore({ name: IMAGE_STORE, consistency: "strong" });
}

export async function saveCocktail(cocktail: Cocktail): Promise<void> {
  await cocktailStore().setJSON(cocktail.id, cocktail);
}

export async function getCocktail(id: string): Promise<Cocktail | null> {
  return (await cocktailStore().get(id, { type: "json" })) as Cocktail | null;
}

export async function listCocktails(): Promise<CocktailSummary[]> {
  const store = cocktailStore();
  const { blobs } = await store.list();
  const items = await Promise.all(
    blobs.map(async (b) => (await store.get(b.key, { type: "json" })) as Cocktail | null)
  );
  return items
    .filter((c): c is Cocktail => Boolean(c))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(({ id, name, tagline, prompt, imageUrl, createdAt }) => ({
      id,
      name,
      tagline,
      prompt,
      imageUrl,
      createdAt,
    }));
}

export async function saveImage(id: string, bytes: Buffer): Promise<void> {
  // Pass a clean, definitely-typed ArrayBuffer — @netlify/blobs rejects the
  // ArrayBuffer | SharedArrayBuffer union that bytes.buffer is typed as.
  const ab = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  await imageStore().set(id, ab);
}

export async function getImage(id: string): Promise<ArrayBuffer | null> {
  return (await imageStore().get(id, { type: "arrayBuffer" })) as ArrayBuffer | null;
}
