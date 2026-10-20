"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Episode } from "@/lib/catalog";
import DownloadButton from "@/components/DownloadButton";
import type { Lang } from "@/lib/i18n";
import TranslateText from "@/components/TranslateText";


export default function EpisodeListItem({
  episode,
  lang,
}: {
  episode: Episode;
  lang: Lang;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIsVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "250px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);


  return (
    <div
      ref={ref}
      className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex min-w-0 items-start gap-4">
        {episode.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={episode.thumbnailUrl}
            alt=""
            className="h-16 w-12 flex-none rounded-md object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
            loading="lazy"
          />
        ) : null}

        <div className="min-w-0">
          <Link
            href={`/episode/${episode.slug}`}
            className="block truncate text-base font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            <TranslateText
              text={episode.title}
              lang={lang}
              enabled={lang !== "en" && isVisible}
              className="inherit"
            />
          </Link>
          {episode.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              <TranslateText
                text={episode.description}
                lang={lang}
                enabled={lang !== "en" && isVisible}
                className="inherit"
              />
            </p>
          ) : null}
        </div>
      </div>

      <DownloadButton
        episode={episode}
        lang={lang}
        showDownload={false}
        openHref={`/episode/${episode.slug}`}
      />
    </div>
  );
}

