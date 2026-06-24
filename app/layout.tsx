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
          <p>PromptDrinks — every drink is invented on the spot. Please sip responsibly.</p>
        </footer>
      </body>
    </html>
  );
}
