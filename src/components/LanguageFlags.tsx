"use client";

import { useLanguage } from "@/components/LanguageProvider";

type Lang = "fr" | "en" | "ar";

export default function LanguageFlags() {
  const { lang, setLang } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label="Choix de langue"
        className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <option value="en">🇬🇧 EN</option>
        <option value="fr">🇫🇷 FR</option>
        <option value="ar">🇸🇦 AR</option>
      </select>
    </label>
  );
}

