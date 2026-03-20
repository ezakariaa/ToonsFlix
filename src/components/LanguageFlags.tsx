"use client";

import { usePathname, useSearchParams } from "next/navigation";

type Lang = "fr" | "en" | "ar";

function setLangCookie(lang: Lang) {
  // 1 year
  document.cookie = `tt_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export default function LanguageFlags({ value }: { value: Lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;

  function choose(lang: Lang) {
    setLangCookie(lang);
    // Force a full reload so the server layout picks up the cookie immediately.
    window.location.href = current || "/";
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
      <select
        value={value}
        onChange={(e) => choose(e.target.value as Lang)}
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

