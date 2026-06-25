"use client";

import { useState } from "react";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src; // same-origin, so the canvas stays untainted
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const ir = img.width / img.height;
  const dr = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > dr) {
    sh = img.height;
    sw = sh * dr;
    sx = (img.width - sw) / 2;
  } else {
    sw = img.width;
    sh = sw / dr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
    last = last.slice(0, -1);
  }
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

export default function ShareCard({
  name,
  tagline,
  imageUrl,
  mocktail,
}: {
  name: string;
  tagline?: string;
  imageUrl?: string;
  mocktail?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const W = 1080;
      const H = 1080;
      const photoH = 760;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#0e0b14";
      ctx.fillRect(0, 0, W, H);

      if (imageUrl) {
        try {
          const img = await loadImage(imageUrl);
          drawCover(ctx, img, 0, 0, W, photoH);
        } catch {
          ctx.fillStyle = "#171221";
          ctx.fillRect(0, 0, W, photoH);
        }
      } else {
        ctx.fillStyle = "#171221";
        ctx.fillRect(0, 0, W, photoH);
        ctx.fillStyle = "#3a3350";
        ctx.font = "150px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🍸", W / 2, photoH / 2 + 55);
        ctx.textAlign = "left";
      }

      // Fade the photo into the panel.
      const fade = ctx.createLinearGradient(0, photoH - 180, 0, photoH);
      fade.addColorStop(0, "rgba(14,11,20,0)");
      fade.addColorStop(1, "#0e0b14");
      ctx.fillStyle = fade;
      ctx.fillRect(0, photoH - 180, W, 180);

      // Accent bar.
      const bar = ctx.createLinearGradient(72, 0, 192, 0);
      bar.addColorStop(0, "#ff5e8a");
      bar.addColorStop(1, "#ffb65e");
      ctx.fillStyle = bar;
      ctx.fillRect(72, photoH + 40, 120, 6);

      // Name.
      ctx.textAlign = "left";
      ctx.fillStyle = "#f3eefb";
      ctx.font = "700 56px sans-serif";
      const nameLines = wrap(ctx, name, W - 144, 2);
      let y = photoH + 118;
      for (const l of nameLines) {
        ctx.fillText(l, 72, y);
        y += 66;
      }

      // Tagline.
      if (tagline) {
        ctx.fillStyle = "#ffb65e";
        ctx.font = "italic 30px sans-serif";
        const tagLines = wrap(ctx, tagline, W - 144, 2);
        y += 4;
        for (const l of tagLines) {
          ctx.fillText(l, 72, y);
          y += 42;
        }
      }

      // Footer brand.
      ctx.fillStyle = "#a99fc4";
      ctx.font = "600 26px sans-serif";
      ctx.fillText("🍸 PromptDrinks · promptdrinks.com", 72, H - 46);

      if (mocktail) {
        ctx.fillStyle = "#ffb65e";
        ctx.font = "700 24px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("MOCKTAIL", W - 72, photoH + 78);
        ctx.textAlign = "left";
      }

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${name} — PromptDrinks.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="share-btn" onClick={download} disabled={busy}>
      {busy ? "Building…" : "🖼️ Download share card"}
    </button>
  );
}
