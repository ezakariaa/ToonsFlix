import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LanguageFlags from "@/components/LanguageFlags";
import HeaderSearch from "@/components/HeaderSearch";
import { LanguageProvider } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ToonsFlix - Episodes",
  description: "Catalogue d'épisodes (catégories + liste + page de détail).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = t("fr");

  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <header className="border-b border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-semibold whitespace-nowrap shrink-0"
              >
                <span aria-hidden>🎬</span>
                <span>ToonsFlix</span>
              </Link>
              <div className="flex min-w-0 flex-1 justify-center px-2">
                <HeaderSearch placeholder={s.searchPlaceholder} />
              </div>
              <div className="shrink-0">
                <LanguageFlags />
              </div>
            </div>
          </header>
          <div className="flex-1">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}
