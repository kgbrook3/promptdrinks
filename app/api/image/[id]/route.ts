import { getImage } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getImage(params.id);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(data, {
    headers: {
      "content-type": "image/png",
      // Browser cache + Netlify edge/CDN cache so repeat loads skip the function.
      "cache-control": "public, max-age=31536000, immutable",
      "netlify-cdn-cache-control": "public, max-age=31536000, immutable, durable",
    },
  });
}
