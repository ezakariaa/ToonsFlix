import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

type SearchItem = {
  id: string;
  type: "category" | "episode";
  title: string;
  subtitle?: string;
  href: string;
  thumbnailUrl?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] as SearchItem[] });
  }

  const catalog = await getCatalog();
  const items: SearchItem[] = [];
  const seen = new Set<string>();

  for (const category of catalog.categories) {
    const categoryHaystack = `${category.name} ${category.description ?? ""}`.toLowerCase();
    if (categoryHaystack.includes(q)) {
      const key = `c:${category.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          id: key,
          type: "category",
          title: category.name,
          subtitle: `${category.episodes.length} episodes`,
          href: `/category/${category.slug}`,
          thumbnailUrl: category.thumbnailUrl,
        });
      }
    }

    for (const ep of category.episodes) {
      const episodeHaystack = `${ep.title} ${ep.description ?? ""}`.toLowerCase();
      if (!episodeHaystack.includes(q)) continue;
      const key = `e:${ep.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: key,
        type: "episode",
        title: ep.title,
        subtitle: category.name,
        href: `/episode/${ep.slug}`,
        thumbnailUrl: ep.thumbnailUrl,
      });
    }
  }

  return NextResponse.json({ items: items.slice(0, 10) });
}

