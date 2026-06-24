"use client";

import { useState } from "react";
import type { Cocktail } from "@/lib/types";
import CocktailCard from "./CocktailCard";

const SUGGESTIONS = [
  "a rainy Sunday in Lisbon",
  "my first heartbreak",
  "victory after a marathon",
  "a haunted New Orleans jazz bar",
  "the color teal",
  "late-night coding session",
];

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);

  async function generate(value: string) {
    const text = value.trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setCocktail(null);
    try {
      // Step 1: get the recipe (fast) and show it immediately.
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setCocktail(data);
      setLoading(false);

      // Step 2: generate the image separately so this never times out.
      if (data.id && data.imagePrompt) {
        setImageLoading(true);
        try {
          const imgRes = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: data.id, imagePrompt: data.imagePrompt }),
          });
          const imgData = await imgRes.json();
          if (imgRes.ok && imgData.imageUrl) {
            setCocktail((prev) => (prev ? { ...prev, imageUrl: imgData.imageUrl } : prev));
          }
        } catch {
          // Leave the placeholder if the image step fails; recipe still stands.
        } finally {
          setImageLoading(false);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1>
          Type anything.
          <br />
          Get a <span className="grad">cocktail</span>.
        </h1>
        <p className="sub">
          A mood, a memory, a movie, a color — anything. PromptDrinks invents a bespoke
          cocktail with its own name, photo, and recipe.
        </p>

        <form
          className="prompt-form"
          onSubmit={(e) => {
            e.preventDefault();
            generate(prompt);
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type anything…"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Mixing…" : "Mix it"}
          </button>
        </form>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => {
                setPrompt(s);
                generate(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <div className="error">{error}</div>}
      </section>

      {loading && (
        <div className="loading">
          <div className="shaker">🍸</div>
          <p>Shaking up something inspired by your prompt…</p>
        </div>
      )}

      {cocktail && <CocktailCard cocktail={cocktail} imageLoading={imageLoading} />}
    </>
  );
}
