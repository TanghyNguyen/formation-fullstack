import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guitar App - Manche interactif",
  description: "Visualisez gammes et accords sur le manche de guitare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav
          className="px-6 py-0 flex h-15"
          style={{
            background: "var(--panel)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/"
            className="inline-flex items-center px-5 py-3 text-base font-semibold transition-colors"
            style={{
              color: "var(--accent)",
              borderBottom: "2px solid var(--accent)",
            }}
          >
            Gammes
          </Link>
          <Link
            href="/chords"
            className="inline-flex items-center px-5 py-3 text-sm font-semibold transition-colors"
            style={{
              color: "var(--muted)",
              borderBottom: "2px solid transparent",
            }}
          >
            Accords
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
