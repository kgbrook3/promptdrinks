import Link from "next/link";
import Generator from "@/components/Generator";
import { listCocktails } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  let recent: Awaited<ReturnType<typeof listCocktails>> = [];
  try {
    recent = (await listCocktails()).slice(0, 8);
  } catch {
    recent = [];
  }

  return (
    <>
      <Generator />

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
              <div className="tile" key={c.id}>
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
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
