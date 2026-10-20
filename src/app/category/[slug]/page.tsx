import { notFound } from "next/navigation";
import EpisodeListItem from "@/components/EpisodeListItem";
import { getCatalog, getCategoryBySlug } from "@/lib/catalog";
import type { Lang } from "@/lib/i18n";
import TranslateText from "@/components/TranslateText";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const lang = "fr" as Lang;
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          <TranslateText
            text={category.name}
            lang={lang}
            enabled={lang !== "en"}
          />
        </h1>
        {category.description ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            <TranslateText
              text={category.description}
              lang={lang}
              enabled={lang !== "en"}
            />
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {category.episodes.map((episode) => (
          <EpisodeListItem key={episode.slug} episode={episode} lang={lang} />
        ))}
      </div>
    </main>
  );
}

