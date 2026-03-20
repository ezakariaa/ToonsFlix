import { NextResponse } from "next/server";
import { getEpisodeBySlug, getEpisodeDetailsFromPageUrl } from "@/lib/catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const found = await getEpisodeBySlug(slug);
  if (!found) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  const details = await getEpisodeDetailsFromPageUrl(found.episode);
  return NextResponse.json(details);
}

