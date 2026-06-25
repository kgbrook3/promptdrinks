import Link from "next/link";
import { listCocktails } from "@/lib/store";

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

  const sort = searchParams?.sort === "loved" ? "loved" : "newest";
  if (sort === "loved") {
    cocktails = [...cocktails].sort((a, b) => (b.cheers ?? 0) - (a.cheers ?? 0));
  }

  return (
    <>
      <div className="section-head">
        <h2>The Cocktail Gallery</h2>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          {cocktails.length} drink{cocktails.length === 1 ? "" : "s"} invented
        </span>
      </div>

      {cocktails.length > 0 && (
        <div className="sort-tabs">
          <Link className={sort === "newest" ? "active" : ""} href="/gallery">
            Newest
          </Link>
          <Link className={sort === "loved" ? "active" : ""} href="/gallery?sort=loved">
            🥂 Most loved
          </Link>
        </div>
      )}

      {cocktails.length === 0 ? (
        <p className="empty">No cocktails yet. Head to the home page and mix the first one. 🍸</p>
      ) : (
        <div className="grid">
          {cocktails.map((c) => (
            <Link className="tile" href={`/drink/${c.id}`} key={c.id}>
              <div className="thumb">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} />
                ) : (
                  <span>🍸</span>
                )}
                {(c.cheers ?? 0) > 0 && <span className="thumb-cheers">🥂 {c.cheers}</span>}
                {c.mocktail && <span className="thumb-badge">Mocktail</span>}
              </div>
              <div className="tile-body">
                <h3>{c.name}</h3>
                <p>“{c.prompt}”</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
