"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  id: string;
  type: "category" | "episode";
  title: string;
  subtitle?: string;
  href: string;
  thumbnailUrl?: string;
  searchText: string;
};

export default function HeaderSearch({
  placeholder,
}: {
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const [catalogItems, setCatalogItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${basePath}/search-index.json`)
      .then((response) => (response.ok ? response.json() : []))
      .then((items: SearchItem[]) => {
        if (!cancelled) setCatalogItems(items);
      })
      .catch(() => {
        if (!cancelled) setCatalogItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    const value = q.trim();
    if (value.length < 2) return [];
    const normalized = value.toLowerCase();
    return catalogItems
      .filter((item) => item.searchText.toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [catalogItems, q]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(items.length > 0);
  }

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={onSubmit}>
        <input
          type="search"
          value={q}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
      </form>

      {open && items.length > 0 ? (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  className="h-10 w-10 flex-none rounded object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                  loading="lazy"
                />
              ) : (
                <div className="h-10 w-10 flex-none rounded bg-zinc-100 dark:bg-zinc-800" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

