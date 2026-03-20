import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import LanguageFlags from "@/components/LanguageFlags";
import HeaderSearch from "@/components/HeaderSearch";
import { normalizeLang, t, type Lang } from "@/lib/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = normalizeLang(cookieStore.get("tt_lang")?.value) as Lang;
  const s = t(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
              <LanguageFlags value={lang} />
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
