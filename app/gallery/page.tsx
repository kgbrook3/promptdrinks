import Link from "next/link";
import { listCocktails } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Cocktail Gallery",
};

export default async function Gallery() {
  let cocktails: Awaited<ReturnType<typeof listCocktails>> = [];
  try {
    cocktails = await listCocktails();
  } catch {
    cocktails = [];
  }

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
