import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ToneCraft — AI characters that speak",
  description: "Create AI characters, chat with them, and hear them speak with Fish Audio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <nav className="sticky top-0 z-10 border-b border-line bg-ink/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em]">
              <span className="inline-block size-2.5 bg-accent shadow-[0_0_12px_#ff2a4d]" />
              TONECRAFT
            </Link>
            <div className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest text-mute">
              <Link href="/" className="transition hover:text-accent">Gallery</Link>
              <Link href="/studio" className="transition hover:text-accent">Studio</Link>
              <Link href="/create" className="border border-accent px-3 py-1.5 text-accent transition hover:bg-accent hover:text-ink">
                + Create
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
