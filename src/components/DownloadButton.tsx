"use client";

import { useState } from "react";
import type { Episode } from "@/lib/catalog";
import { t, type Lang } from "@/lib/i18n";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const s = t(lang);

  const openClass =
    className ??
    "inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900";

  const downloadClass =
    className ??
    "inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

  function handleOpen() {
    if (openHref) {
      window.location.href = openHref;
      return;
    }
    if (!pageUrl) return;
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDownload() {
    if (downloadUrl) return;
    if (!episode.slug) return;
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/episode-download?slug=${encodeURIComponent(episode.slug)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { downloadUrl?: string };
      if (!data.downloadUrl) return;

      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = "";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setIsDownloading(false);
    }
  }

  // If both URLs are available, show both buttons side-by-side.
  if (downloadUrl && pageUrl) {
    if (!showDownload && showOpen) {
      return (
        <button type="button" onClick={handleOpen} className={openClass}>
          {s.open}
        </button>
      );
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
          <button type="button" onClick={handleOpen} className={openClass}>
            {s.open}
          </button>
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
      return (
        <button type="button" onClick={handleOpen} className={openClass}>
          {s.open}
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleOpen} className={openClass}>
          {s.open}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={downloadClass}
        >
          {isDownloading ? "..." : s.download}
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

