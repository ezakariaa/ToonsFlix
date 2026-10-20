import { getCatalog } from "@/lib/catalog";

export const dynamic = "force-static";

export async function GET() {
  const catalog = await getCatalog();
  const items = catalog.categories.flatMap((category) => [
    {
      id: `c:${category.slug}`,
      type: "category" as const,
      title: category.name,
      subtitle: `${category.episodes.length} episodes`,
      href: `/category/${category.slug}`,
      thumbnailUrl: category.thumbnailUrl,
      searchText: `${category.name} ${category.description ?? ""}`,
    },
    ...category.episodes.map((episode) => ({
      id: `e:${episode.slug}`,
      type: "episode" as const,
      title: episode.title,
      subtitle: category.name,
      href: `/episode/${episode.slug}`,
      thumbnailUrl: episode.thumbnailUrl,
      searchText: `${episode.title} ${category.name}`,
    })),
  ]);

  return Response.json(items);
}