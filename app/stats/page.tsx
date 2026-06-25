import Link from "next/link";
import { listCocktails } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stats",
};

const STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "at", "to", "and", "or", "my", "your", "with",
  "for", "from", "is", "it", "as", "by", "be", "this", "that", "first", "after",
  "before", "into", "out", "up", "down", "over", "i", "you", "me", "we", "day",
  "feeling", "night", "morning",
]);

function topWords(prompts: string[], n: number): { word: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of prompts) {
    for (const raw of p.toLowerCase().split(/[^a-z']+/)) {
      const w = raw.trim();
      if (w.length < 3 || STOPWORDS.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export default async function Stats() {
  let all: Awaited<ReturnType<typeof listCocktails>> = [];
  try {
    all = await listCocktails();
  } catch {
    all = [];
  }

  const total = all.length;
  const mocktails = all.filter((c) => c.mocktail).length;
  const cocktails = total - mocktails;
  const totalCheers = all.reduce((s, c) => s + (c.cheers ?? 0), 0);
  const avgCheers = total ? (totalCheers / total).toFixed(1) : "0";

  const topLoved = [...all]
    .filter((c) => (c.cheers ?? 0) > 0)
    .sort((a, b) => (b.cheers ?? 0) - (a.cheers ?? 0))
    .slice(0, 5);

  // Drinks per day for the last 14 days.
  const days: { label: string; key: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString(undefined, { day: "numeric" }), count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  for (const c of all) {
    const key = c.createdAt.slice(0, 10);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].count++;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const words = topWords(all.map((c) => c.prompt), 12);

  if (total === 0) {
    return (
      <>
        <div className="section-head">
          <h2>PromptDrinks by the numbers</h2>
        </div>
        <p className="empty">No drinks yet — mix the first one and the stats will fill in. 🍸</p>
      </>
    );
  }

  return (
    <>
      <div className="section-head">
        <h2>PromptDrinks by the numbers</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="num">{total}</div>
          <div className="lbl">drinks invented</div>
        </div>
        <div className="stat-card">
          <div className="num">{cocktails}</div>
          <div className="lbl">cocktails</div>
        </div>
        <div className="stat-card">
          <div className="num">{mocktails}</div>
          <div className="lbl">mocktails</div>
        </div>
        <div className="stat-card">
          <div className="num">{totalCheers}</div>
          <div className="lbl">total cheers 🥂</div>
        </div>
        <div className="stat-card">
          <div className="num">{avgCheers}</div>
          <div className="lbl">avg cheers / drink</div>
        </div>
      </div>

      <div className="stat-section">
        <h3>Drinks mixed — last 14 days</h3>
        <div className="chart">
          {days.map((d) => (
            <div className="bar-wrap" key={d.key} title={`${d.count} on ${d.key}`}>
              <div className="bar" style={{ height: `${(d.count / maxDay) * 100}%` }} />
              <span className="bar-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {words.length > 0 && (
        <div className="stat-section">
          <h3>What people are mixing about</h3>
          <div className="word-cloud">
            {words.map((w) => (
              <span className="word-chip" key={w.word}>
                {w.word} <b>{w.count}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {topLoved.length > 0 && (
        <div className="stat-section">
          <h3>🥂 Most loved</h3>
          <ol className="loved-list">
            {topLoved.map((c) => (
              <li key={c.id}>
                <Link href={`/drink/${c.id}`}>{c.name}</Link>
                <span className="loved-count">{c.cheers} cheers</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
