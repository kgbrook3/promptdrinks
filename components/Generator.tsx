"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { Cocktail } from "@/lib/types";
import CocktailCard from "./CocktailCard";

// A big pool of prompt ideas. The chips and typewriter pull random subsets,
// so every visit / shuffle feels fresh.
const IDEAS = [
  "a rainy Sunday in Lisbon",
  "my first heartbreak",
  "victory after a marathon",
  "a haunted New Orleans jazz bar",
  "the color teal",
  "late-night coding session",
  "the smell of an old bookshop",
  "my grandmother's kitchen",
  "a first-day-of-summer feeling",
  "a midnight thunderstorm",
  "winning the lottery",
  "a quiet morning in Kyoto",
  "the last day of school",
  "a neon-lit cyberpunk city",
  "falling in love in Paris",
  "a cozy cabin in the snow",
  "the taste of nostalgia",
  "a wild night in Vegas",
  "stargazing in the desert",
  "your favorite 90s song",
  "a dragon's treasure hoard",
  "Friday at 5pm",
  "a walk on a foggy beach",
  "an astronaut's first spacewalk",
  "a hidden speakeasy",
  "a sun-drenched vineyard",
  "the calm after a storm",
  "a carnival at dusk",
];

// Return n unique random items from arr (Fisher–Yates partial shuffle).
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

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

// Pre-computed "cheers" sparkle burst particles (direction + glyph).
const CHEERS_GLYPHS = ["✨", "✨", "🥂", "🍸", "✨", "🎉"];
const CHEERS_PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (360 / 16) * i + (Math.random() * 18 - 9);
  const dist = 70 + Math.random() * 55;
  const rad = (angle * Math.PI) / 180;
  return {
    tx: Math.round(Math.cos(rad) * dist),
    ty: Math.round(Math.sin(rad) * dist),
    glyph: CHEERS_GLYPHS[i % CHEERS_GLYPHS.length],
    delay: Math.random() * 0.08,
  };
});

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [placeholder, setPlaceholder] = useState("Type anything…");
  const [cheers, setCheers] = useState(false);
  // Deterministic initial slices (so server + first client render match), then
  // randomized on mount to avoid a hydration mismatch.
  const [suggestions, setSuggestions] = useState<string[]>(() => IDEAS.slice(0, 6));
  const [phrases, setPhrases] = useState<string[]>(() => IDEAS.slice(0, 8));
  const resultRef = useRef<HTMLDivElement>(null);

  // Randomize the chips + typewriter phrases once, on first load.
  useEffect(() => {
    setSuggestions(sample(IDEAS, 6));
    setPhrases(sample(IDEAS, 8));
  }, []);

  function shuffleSuggestions() {
    setSuggestions(sample(IDEAS, 6));
  }

  // Smoothly scroll to the result + celebrate when a NEW drink appears.
  useEffect(() => {
    if (!cocktail) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setCheers(true);
    const t = setTimeout(() => setCheers(false), 1000);
    return () => clearTimeout(t);
  }, [cocktail?.id]);

  // Typewriter placeholder that cycles through example prompts while empty.
  useEffect(() => {
    if (prompt || phrases.length === 0) return; // pause once the user types
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        setPlaceholder(`Try: ${phrase.slice(0, charIdx)}`);
        if (charIdx === phrase.length) {
          deleting = true;
          timer = setTimeout(tick, 1700);
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        charIdx--;
        setPlaceholder(`Try: ${phrase.slice(0, charIdx)}`);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    };

    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [prompt, phrases]);

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

      // Step 2: generate the image out-of-band so this never times out.
      if (data.id && data.imagePrompt) {
        generateImageFor(data.id, data.imagePrompt);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  // Kicks off the high-quality image: tries the no-timeout background function
  // and polls for the result; falls back to the synchronous route (e.g. local dev).
  async function generateImageFor(id: string, imagePrompt: string) {
    setImageLoading(true);
    try {
      let background = false;
      try {
        const bg = await fetch("/.netlify/functions/generate-image-background", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id, imagePrompt }),
        });
        background = bg.status === 202 || bg.ok;
      } catch {
        background = false;
      }

      if (background) {
        // Poll the image route until the photo exists (up to ~2 min).
        for (let i = 0; i < 48; i++) {
          await new Promise((r) => setTimeout(r, 2500));
          try {
            const probe = await fetch(`/api/image/${id}`, {
              method: "HEAD",
              cache: "no-store",
            });
            if (probe.ok) {
              setCocktail((prev) =>
                prev && prev.id === id ? { ...prev, imageUrl: `/api/image/${id}` } : prev
              );
              return;
            }
          } catch {
            /* keep polling */
          }
        }
        return; // gave up; recipe still stands with the placeholder
      }

      // Fallback: synchronous endpoint.
      const imgRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, imagePrompt }),
      });
      const imgData = await imgRes.json();
      if (imgRes.ok && imgData.imageUrl) {
        setCocktail((prev) =>
          prev && prev.id === id ? { ...prev, imageUrl: imgData.imageUrl } : prev
        );
      }
    } catch {
      /* leave placeholder; recipe still stands */
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <>
      {cheers && (
        <div className="cheers" aria-hidden="true">
          {CHEERS_PARTICLES.map((p, i) => (
            <span
              key={i}
              className="cheer"
              style={
                {
                  "--tx": `${p.tx}px`,
                  "--ty": `${p.ty}px`,
                  animationDelay: `${p.delay}s`,
                } as CSSProperties
              }
            >
              {p.glyph}
            </span>
          ))}
        </div>
      )}

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
            placeholder={placeholder}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "Mixing…" : "Mix it"}
          </button>
        </form>

        <div className="suggestions">
          {suggestions.map((s) => (
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
          <button
            type="button"
            className="shuffle-chip"
            disabled={loading}
            onClick={shuffleSuggestions}
            aria-label="Shuffle ideas"
          >
            ↻ Shuffle
          </button>
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
