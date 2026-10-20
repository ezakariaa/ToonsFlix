"use client";

import Link from "next/link";
import type { Episode } from "@/lib/catalog";
import { t, type Lang } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function DownloadButton({
  episode,
  className,
  lang = "fr",
  showDownload = true,
  showOpen = true,
  openHref,
}: {
  episode: Episode;
  className?: string;
  lang?: Lang;
  showDownload?: boolean;
  showOpen?: boolean;
  openHref?: string;
}) {
  const { downloadUrl, pageUrl } = episode;
  const { lang: activeLang } = useLanguage();
  const s = t(activeLang || lang);

  const openClass =
    className ??
    "inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900";

  const downloadClass =
    className ??
    "inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

  function handleOpen() {
    if (!pageUrl) return;
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  }

  const openControl = openHref ? (
    <Link className={openClass} href={openHref}>
      {s.open}
    </Link>
  ) : (
    <button type="button" onClick={handleOpen} className={openClass}>
      {s.open}
    </button>
  );

  // If both URLs are available, show both buttons side-by-side.
  if (downloadUrl && pageUrl) {
    if (!showDownload && showOpen) {
      return openControl;
    }
    if (!showOpen && showDownload) {
      return (
        <a className={downloadClass} href={downloadUrl} download>
          {s.download}
        </a>
      );
    }
    return (
      <div className="flex items-center gap-2">
        {showOpen ? (
          openControl
        ) : null}
        <a className={downloadClass} href={downloadUrl} download>
          {s.download}
        </a>
      </div>
    );
  }

  if (downloadUrl) {
    if (!showDownload) {
      return (
        <button type="button" disabled className={openClass}>
          {s.unavailable}
        </button>
      );
    }
    return (
      <a className={downloadClass} href={downloadUrl} download>
        {s.download}
      </a>
    );
  }

  if (pageUrl) {
    if (!showOpen) {
      return (
        <button type="button" disabled className={openClass}>
          {s.unavailable}
        </button>
      );
    }
    if (!showDownload) {
      return openControl;
    }
    return (
      <div className="flex items-center gap-2">
        {openControl}
        <button type="button" disabled className={downloadClass}>
          {s.unavailable}
        </button>
      </div>
    );
  }

  return (
    <button type="button" disabled className={openClass}>
      {s.unavailable}
    </button>
  );
}

