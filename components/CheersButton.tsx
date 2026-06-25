"use client";

import { useEffect, useState } from "react";

export default function CheersButton({
  id,
  initial,
}: {
  id: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);
  const [cheered, setCheered] = useState(false);
  const [pop, setPop] = useState(false);

  const storageKey = `pd-cheered-${id}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setCheered(true);
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  async function cheer() {
    if (cheered) return;
    setCheered(true);
    setCount((c) => c + 1);
    setPop(true);
    setTimeout(() => setPop(false), 400);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch("/api/cheers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && typeof data.cheers === "number") setCount(data.cheers);
    } catch {
      /* keep optimistic count */
    }
  }

  return (
    <button
      type="button"
      className={`cheers-btn${cheered ? " cheered" : ""}${pop ? " pop" : ""}`}
      onClick={cheer}
      aria-pressed={cheered}
      aria-label={cheered ? "You cheered this drink" : "Cheers this drink"}
    >
      <span className="cheers-glass">🥂</span>
      <span className="cheers-count">{count}</span>
      <span className="cheers-label">{cheered ? "Cheered" : "Cheers"}</span>
    </button>
  );
}
