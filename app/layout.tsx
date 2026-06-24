import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptDrinks — Type anything, get a cocktail",
  description:
    "Type anything and PromptDrinks invents a bespoke cocktail: name, photo, ingredients and instructions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            Prompt<span>Drinks</span>
          </Link>
          <nav>
            <Link href="/">Mix</Link>
            <Link href="/gallery">Gallery</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="social-links">
            <a
              href="https://www.instagram.com/promptdrinks/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PromptDrinks on Instagram"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/PromptDrinks/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PromptDrinks on Facebook"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"
                />
              </svg>
            </a>
          </div>
          <p>PromptDrinks — every drink is invented on the spot. Please sip responsibly.</p>
        </footer>
      </body>
    </html>
  );
}
