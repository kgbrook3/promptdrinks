"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CocktailSummary } from "@/lib/types";
import { cdnImage } from "@/lib/img";

type Filter = "all" | "cocktail" | "mocktail";
type Sort = "newest" | "loved";

export default function GalleryBrowser({
  cocktails,
  initialSort = "newest",
}: {
  cocktails: CocktailSummary[];
  initialSort?: Sort;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>(initialSort);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = cocktails.filter((c) => {
      if (filter === "mocktail" && !c.mocktail) return false;
      if (filter === "cocktail" && c.mocktail) return false;
      if (q && !`${c.name} ${c.prompt}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return [...list].sort((a, b) =>
      sort === "loved"
        ? (b.cheers ?? 0) - (a.cheers ?? 0)
        : a.createdAt < b.createdAt
        ? 1
        : -1
    );
  }, [cocktails, query, filter, sort]);

  return (
    <>
      <div className="gallery-controls">
        <input
          className="gallery-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search drinks or prompts…"
          aria-label="Search drinks"
        />
        <div className="sort-tabs">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All
          </button>
          <button
            className={filter === "cocktail" ? "active" : ""}
            onClick={() => setFilter("cocktail")}
          >
            🍸 Cocktails
          </button>
          <button
            className={filter === "mocktail" ? "active" : ""}
            onClick={() => setFilter("mocktail")}
          >
            🧃 Mocktails
          </button>
        </div>
        <div className="sort-tabs">
          <button className={sort === "newest" ? "active" : ""} onClick={() => setSort("newest")}>
            Newest
          </button>
          <button className={sort === "loved" ? "active" : ""} onClick={() => setSort("loved")}>
            🥂 Most loved
          </button>
        </div>
      </div>

      <p className="results-count">
        {results.length} drink{results.length === 1 ? "" : "s"}
      </p>

      {results.length === 0 ? (
        <p className="empty">No drinks match. Try a different search or filter.</p>
      ) : (
        <div className="grid">
          {results.map((c) => (
            <Link className="tile" href={`/drink/${c.id}`} key={c.id}>
              <div className="thumb">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cdnImage(c.imageUrl, { w: 400, h: 400 })}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                  />
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
