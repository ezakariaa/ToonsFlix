import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";
import {
  getCatalog,
  getEpisodeBySlug,
  getEpisodeDetailsFromPageUrl,
} from "@/lib/catalog";
import { t, type Lang } from "@/lib/i18n";
import TranslateText from "@/components/TranslateText";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.categories.flatMap((category) =>
    category.episodes.map((episode) => ({ slug: episode.slug })),
  );
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const lang = "fr" as Lang;
  const s = t(lang);
  const { slug } = await params;
  const found = await getEpisodeBySlug(slug);
  if (!found) notFound();

  const { episode, category } = found;
  const details = await getEpisodeDetailsFromPageUrl(episode);
  const episodeWithDetails = { ...episode, ...details };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/category/${category.slug}`}
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          {s.backToPrefix}
          <TranslateText
            text={category.name}
            lang={lang}
            enabled={lang !== "en"}
          />
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex gap-6">
          {episodeWithDetails.thumbnailUrl ? (
            <Image
              src={episodeWithDetails.thumbnailUrl}
              alt={episodeWithDetails.title}
              width={224}
              height={144}
              className="h-36 w-56 flex-shrink-0 rounded-xl object-cover"
            />
          ) : null}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">
              <TranslateText
                text={episodeWithDetails.title}
                lang={lang}
                enabled={lang !== "en"}
              />
            </h1>
            {episodeWithDetails.description ? (
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <TranslateText
                  text={episodeWithDetails.description}
                  lang={lang}
                  enabled={lang !== "en"}
                />
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <DownloadButton
                episode={episodeWithDetails}
                lang={lang}
                showOpen={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {episodeWithDetails.downloadUrl ? (
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-xl border border-zinc-200 bg-black dark:border-zinc-800"
              // ToonTales fournit un fichier mp4 directement dans downloadUrl.
              src={episodeWithDetails.downloadUrl}
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Vidéo indisponible pour cet épisode.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

