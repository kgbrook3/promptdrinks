// Build a Netlify Image CDN URL that resizes + converts our stored PNG to WebP,
// cached at the edge. Falls back to the raw URL for anything unexpected.
// Docs: https://docs.netlify.com/image-cdn/overview/
export function cdnImage(
  url: string | undefined,
  opts: { w: number; h?: number; q?: number }
): string {
  if (!url || !url.startsWith("/api/image/")) return url ?? "";
  const p = new URLSearchParams();
  p.set("url", url);
  p.set("w", String(opts.w));
  if (opts.h) {
    p.set("h", String(opts.h));
    p.set("fit", "cover");
  }
  p.set("fm", "webp");
  p.set("q", String(opts.q ?? 72));
  return `/.netlify/images?${p.toString()}`;
}
