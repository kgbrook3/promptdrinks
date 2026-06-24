"use client";

import { useEffect, useState } from "react";

export default function ShareButtons({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setCanNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const enc = encodeURIComponent;
  const shareText = `${title} — ${text}`;

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      /* user cancelled */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="share">
      <span className="share-label">Share this drink</span>
      <div className="share-btns">
        {canNative && (
          <button type="button" onClick={nativeShare} className="share-btn">
            Share…
          </button>
        )}
        <a
          className="share-btn"
          href={`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <a
          className="share-btn"
          href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <a
          className="share-btn"
          href={`https://wa.me/?text=${enc(`${shareText} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="share-btn"
          href={`mailto:?subject=${enc(title)}&body=${enc(`${shareText}\n\n${url}`)}`}
        >
          Email
        </a>
        <button type="button" onClick={copyLink} className="share-btn">
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
