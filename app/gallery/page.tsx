import { listCocktails } from "@/lib/store";
import GalleryBrowser from "@/components/GalleryBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Cocktail Gallery",
};

export default async function Gallery({
  searchParams,
}: {
  searchParams?: { sort?: string };
}) {
  let cocktails: Awaited<ReturnType<typeof listCocktails>> = [];
  try {
    cocktails = await listCocktails();
  } catch {
    cocktails = [];
  }

  const initialSort = searchParams?.sort === "loved" ? "loved" : "newest";

  return (
    <>
      <div className="section-head">
        <h2>The Cocktail Gallery</h2>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          {cocktails.length} drink{cocktails.length === 1 ? "" : "s"} invented
        </span>
      </div>

      {cocktails.length === 0 ? (
        <p className="empty">No cocktails yet. Head to the home page and mix the first one. 🍸</p>
      ) : (
        <GalleryBrowser cocktails={cocktails} initialSort={initialSort} />
      )}
    </>
  );
}
