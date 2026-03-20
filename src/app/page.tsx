import Link from "next/link";
import { cookies } from "next/headers";
import { getCatalog } from "@/lib/catalog";
import { normalizeLang, t, type Lang } from "@/lib/i18n";
import TranslateText from "@/components/TranslateText";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const lang = normalizeLang((await cookies()).get("tt_lang")?.value) as Lang;
  const s = t(lang);
  const catalog = await getCatalog();
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const filteredCategories = query
    ? catalog.categories.filter((category) => {
        const haystack = [
          category.name,
          category.description ?? "",
          ...category.episodes.map((e) => e.title),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : catalog.categories;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{s.categoriesTitle}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {s.catalogSubtitle}
        </p>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          {s.noSearchResults}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <div className="flex items-start gap-4">
              {category.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.thumbnailUrl}
                  alt=""
                  className="h-14 w-14 flex-none rounded-xl bg-white object-contain ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
                  loading="lazy"
                />
              ) : (
                <div className="h-14 w-14 flex-none rounded-xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="truncate text-base font-semibold text-zinc-900 group-hover:underline dark:text-zinc-50">
                    <TranslateText
                      text={category.name}
                      lang={lang}
                      enabled={lang !== "en"}
                    />
                  </h2>
                  <div className="flex-none rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {s.episodesLabel(category.episodes.length)}
                  </div>
                </div>

                {category.description ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
                    <TranslateText
                      text={category.description}
                      lang={lang}
                      enabled={lang !== "en"}
                    />
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
