"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";

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
  const shouldTranslate = enabled ?? true;
  const [translated, setTranslated] = useState<string | null>(null);

  const key = useMemo(() => `${lang}::${text}`, [lang, text]);

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
      if (lang === "en") {
        setTranslated(null);
        return;
      }

      setTranslated(null);

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, to: lang }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { translated?: string };
        if (cancelled) return;
        if (typeof data.translated === "string") {
          setTranslated(data.translated);
        }
      } catch {
        // Keep original text on errors.
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [key, lang, shouldTranslate, text]);

  return (
    <span className={className ?? undefined}>{translated ?? text}</span>
  );
}

