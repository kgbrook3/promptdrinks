"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// Decorative rising bubbles for the hero (left %, size px, delay s, duration s).
const BUBBLES = [
  { left: 6, size: 16, delay: 0, dur: 9 },
  { left: 18, size: 9, delay: 2.5, dur: 11 },
  { left: 30, size: 22, delay: 1, dur: 8 },
  { left: 42, size: 7, delay: 3.5, dur: 12 },
  { left: 54, size: 13, delay: 0.6, dur: 10 },
  { left: 66, size: 10, delay: 2, dur: 9.5 },
  { left: 78, size: 18, delay: 1.4, dur: 8.5 },
  { left: 90, size: 8, delay: 3, dur: 11.5 },
];

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll to the result when a NEW drink appears (not on image update).
  useEffect(() => {
    if (cocktail) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [cocktail?.id]);

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
        <div className="bubbles" aria-hidden="true">
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: `${b.left}%`,
                width: b.size,
                height: b.size,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.dur}s`,
              }}
            />
          ))}
        </div>
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

      <div ref={resultRef}>
        {cocktail && (
          <>
            <CocktailCard cocktail={cocktail} imageLoading={imageLoading} />
            <p className="permalink-row">
              <Link className="permalink" href={`/drink/${cocktail.id}`}>
                Open &amp; share this drink →
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
