import Link from "next/link";
import Generator from "@/components/Generator";
import { listCocktails } from "@/lib/store";
import type { CocktailSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

function Tile({ c }: { c: CocktailSummary }) {
  return (
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
  );
}

export default async function Home() {
  let all: CocktailSummary[] = [];
  try {
    all = await listCocktails();
  } catch {
    all = [];
  }

  const recent = all.slice(0, 8);
  const topLoved = [...all]
    .filter((c) => (c.cheers ?? 0) > 0)
    .sort((a, b) => (b.cheers ?? 0) - (a.cheers ?? 0))
    .slice(0, 4);

  return (
    <>
      <Generator />

      {topLoved.length > 0 && (
        <>
          <div className="section-head">
            <h2>🥂 Most loved</h2>
            <Link href="/gallery?sort=loved" style={{ color: "var(--accent)", fontWeight: 600 }}>
              See the leaderboard →
            </Link>
          </div>
          <div className="grid">
            {topLoved.map((c) => (
              <Tile c={c} key={c.id} />
            ))}
          </div>
        </>
      )}

      {recent.length > 0 && (
        <>
          <div className="section-head">
            <h2>Recently mixed</h2>
            <Link href="/gallery" style={{ color: "var(--accent)", fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div className="grid">
            {recent.map((c) => (
              <Tile c={c} key={c.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
