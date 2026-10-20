"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function TranslateText({
  text,
  lang,
  enabled,
  className,
}: {
  text: string;
  lang: Lang;
  enabled?: boolean;
  className?: string;
}) {
  const { lang: activeLang } = useLanguage();
  const currentLang = activeLang ?? lang;
  const shouldTranslate = enabled ?? true;
  const [translated, setTranslated] = useState<string | null>(null);

  const key = useMemo(() => `${currentLang}::${text}`, [currentLang, text]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!shouldTranslate) {
        setTranslated(null);
        return;
      }
      if (!text) {
        setTranslated(null);
        return;
      }
      if (currentLang === "en") {
        setTranslated(null);
        return;
      }

      setTranslated(null);

      try {
        const url =
          "https://translate.googleapis.com/translate_a/single" +
          `?client=gtx&sl=auto&tl=${encodeURIComponent(currentLang)}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (cancelled) return;
        const segments = Array.isArray(data) && Array.isArray(data[0])
          ? data[0]
          : [];
        const result = segments
          .map((segment) => (Array.isArray(segment) ? segment[0] : undefined))
          .filter((value): value is string => typeof value === "string")
          .join("");
        if (result) setTranslated(result);
      } catch {
        // Keep original text on errors.
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [key, currentLang, shouldTranslate, text]);

  return (
    <span className={className ?? undefined}>{translated ?? text}</span>
  );
}

