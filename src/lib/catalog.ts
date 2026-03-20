export type Episode = {
  slug: string;
  title: string;
  description?: string;

  // URL de la page de l'épisode (optionnel, si tu l'as).
  pageUrl?: string;

  // Image/thumbnail (optionnel).
  thumbnailUrl?: string;

  // URL directe vers un fichier téléchargeable (optionnel, si tu l'as).
  downloadUrl?: string;
};

export type Category = {
  slug: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  episodes: Episode[];
};

export type Catalog = {
  categories: Category[];
};

import { CATEGORY_IMAGE_OVERRIDES } from "@/lib/categoryImages";

const BASE_URL = "https://www.toontales.net";

function decodeHtmlEntities(input: string): string {
  // Minimal HTML entity decoding for ToonTales strings.
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#38;/g, "&")
    .replace(/&#34;/g, '"')
    .replace(/&#(\d+);/g, (_, n: string) => {
      const codePoint = Number.parseInt(n, 10);
      if (Number.isNaN(codePoint)) return "";
      return String.fromCodePoint(codePoint);
    });
}

function slugFromUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  const parts = trimmed.split("/");
  return parts[parts.length - 1] ?? trimmed;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      // ToonTales may block “bot-like” requests without a user-agent.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 6 * 60 * 60 },
  });

  if (!res.ok) {
    throw new Error(`ToonTales fetch failed (${res.status}) for ${url}`);
  }

  return res.text();
}

function extractMetaContent(
  html: string,
  selector: "og:title" | "description" | "og:image",
): string | undefined {
  if (selector === "og:title") {
    const m = html.match(
      /property=["']og:title["']\s+content=["']([^"']+)["']/i,
    );
    return m?.[1];
  }

  if (selector === "og:image") {
    const m = html.match(
      /property=["']og:image["']\s+content=["']([^"']+)["']/i,
    );
    return m?.[1];
  }

  // meta name="description"
  const m = html.match(
    /name=["']description["']\s+content=["']([^"']+)["']/i,
  );
  return m?.[1];
}

function extractSeriesList(homeHtml: string): Array<{ slug: string; name: string }> {
  const result: Array<{ slug: string; name: string }> = [];
  const seen = new Set<string>();
  const re =
    /<a[^>]+href=["']https:\/\/www\.toontales\.net\/series\/([^\/"']+)\/["'][^>]*>([^<]+)<\/a>/gi;

  for (const match of homeHtml.matchAll(re)) {
    const slug = match[1];
    const name = decodeHtmlEntities(match[2].trim());
    if (!slug || !name) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push({ slug, name });
  }

  return result;
}

function extractEpisodesFromSeries(seriesHtml: string): Episode[] {
  const episodes: Episode[] = [];

  // Each episode card wraps an image with the <a href="/short/..."><img alt="...">
  // structure observed in the series HTML.
  const re =
    /<a[^>]+href=["'](https:\/\/www\.toontales\.net\/short\/[^\/"']+)\/?["'][^>]*>\s*<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi;

  const seen = new Set<string>();

  for (const match of seriesHtml.matchAll(re)) {
    const pageUrl = match[1].endsWith("/")
      ? match[1]
      : `${match[1]}/`;
    const thumbnailUrl = match[2]?.trim();
    const title = decodeHtmlEntities((match[3] ?? "").trim());
    const slug = slugFromUrl(pageUrl);

    if (!slug || !title) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    episodes.push({ slug, title, pageUrl, thumbnailUrl });
  }

  return episodes;
}

function extractMaxSeriesPage(seriesHtml: string): number {
  // Pagination links look like: /series/<slug>/page/2/
  // We take the max page number present in the HTML. If no pagination, returns 1.
  let maxPage = 1;
  const re = /\/page\/(\d+)\/?/gi;
  for (const match of seriesHtml.matchAll(re)) {
    const n = Number.parseInt(match[1] ?? "", 10);
    if (!Number.isNaN(n) && n > maxPage) maxPage = n;
  }
  return maxPage;
}

function uniqEpisodesBySlug(episodes: Episode[]): Episode[] {
  const seen = new Set<string>();
  const out: Episode[] = [];
  for (const ep of episodes) {
    if (!ep.slug) continue;
    if (seen.has(ep.slug)) continue;
    seen.add(ep.slug);
    out.push(ep);
  }
  return out;
}

async function fetchAllEpisodesForSeries(seriesSlug: string): Promise<Episode[]> {
  const baseSeriesUrl = `${BASE_URL}/series/${seriesSlug}/`;
  const firstHtml = await fetchText(baseSeriesUrl);

  const maxDetected = extractMaxSeriesPage(firstHtml);
  const maxPages =
    Number.parseInt(process.env.TOONTALES_MAX_PAGES_PER_SERIES ?? "", 10) ||
    maxDetected;
  const pagesToFetch = Math.max(1, Math.min(maxPages, maxDetected));

  const all: Episode[] = [];
  all.push(...extractEpisodesFromSeries(firstHtml));

  // Fetch remaining pages sequentially to be gentle with the upstream site.
  for (let page = 2; page <= pagesToFetch; page++) {
    const pageHtml = await fetchText(`${baseSeriesUrl}page/${page}/`);
    all.push(...extractEpisodesFromSeries(pageHtml));
  }

  return uniqEpisodesBySlug(all);
}

async function buildCatalogIndex(): Promise<Catalog> {
  const homeHtml = await fetchText(`${BASE_URL}/`);
  const seriesList = extractSeriesList(homeHtml);

  const categories: Category[] = [];

  for (const series of seriesList) {
    const seriesUrl = `${BASE_URL}/series/${series.slug}/`;
    const seriesHtml = await fetchText(seriesUrl);

    const ogTitle = extractMetaContent(seriesHtml, "og:title");
    const description = extractMetaContent(seriesHtml, "description");
    const ogImage = extractMetaContent(seriesHtml, "og:image");

    categories.push({
      slug: series.slug,
      name: decodeHtmlEntities(ogTitle ?? series.name),
      description: description ? decodeHtmlEntities(description) : undefined,
      thumbnailUrl:
        CATEGORY_IMAGE_OVERRIDES[series.slug] ?? (ogImage ? ogImage.trim() : undefined),
      episodes: await fetchAllEpisodesForSeries(series.slug),
    });
  }

  return { categories };
}

// Small in-process memoization (per server runtime).
const getCatalogIndexMemo = (async () => {
  let cached: Catalog | null = null;
  let cachedAt = 0;
  const TTL_MS = 30 * 60 * 1000; // 30 minutes

  return async function getCatalogIndexCached(): Promise<Catalog> {
    const now = Date.now();
    if (cached && now - cachedAt < TTL_MS) return cached;
    cached = await buildCatalogIndex();
    cachedAt = now;
    return cached;
  };
})();

export async function getCatalog(): Promise<Catalog> {
  const getCatalogIndexCached = await getCatalogIndexMemo;
  return getCatalogIndexCached();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const catalog = await getCatalog();
  return catalog.categories.find((c) => c.slug === slug);
}

export async function getEpisodeBySlug(
  episodeSlug: string,
): Promise<{ episode: Episode; category: Category } | undefined> {
  const catalog = await getCatalog();
  for (const category of catalog.categories) {
    const episode = category.episodes.find((e) => e.slug === episodeSlug);
    if (episode) return { episode, category };
  }
  return undefined;
}

export async function getEpisodeDetailsFromPageUrl(
  episode: Pick<Episode, "pageUrl" | "slug" | "title">,
): Promise<Pick<Episode, "description" | "downloadUrl" | "title">> {
  if (!episode.pageUrl) {
    return { description: undefined, downloadUrl: undefined, title: episode.title };
  }

  const shortHtml = await fetchText(episode.pageUrl);

  const ogTitle = extractMetaContent(shortHtml, "og:title");
  const description = extractMetaContent(shortHtml, "description");

  // Video URL is present in JSON-LD as contentUrl: "...mp4"
  const contentUrlMatch = shortHtml.match(
    /contentUrl["']\s*:\s*"([^"']+?\.mp4[^"']*)"/i,
  );
  const directMp4 =
    contentUrlMatch?.[1] ??
    shortHtml.match(/https?:\/\/[^"' ]+?\.mp4[^"' ]*/i)?.[0];

  return {
    title: ogTitle ? decodeHtmlEntities(ogTitle) : episode.title,
    description: description ? decodeHtmlEntities(description) : undefined,
    downloadUrl: directMp4 ? directMp4.trim() : undefined,
  };
}

