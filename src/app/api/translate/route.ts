import { NextResponse } from "next/server";

type Lang = "fr" | "en" | "ar";

const cache = new Map<string, string>();

async function translateViaGoogle(text: string, to: Lang): Promise<string> {
  // Public endpoint without API key. Rate limits may apply.
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=auto&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Translate failed (${res.status})`);
  }

  const data: unknown = await res.json();

  // Expected format: [ [ [translated, original, ...], ... ] , ...]
  const arr = data as any;
  const segments = arr?.[0];
  if (!Array.isArray(segments)) return "";

  const translated = segments
    .map((seg: any) => (Array.isArray(seg) ? seg?.[0] : undefined))
    .filter((x: any) => typeof x === "string" && x.length > 0)
    .join("");

  return translated;
}

export async function POST(req: Request) {
  const body = (await req.json()) as { text?: string; to?: Lang };
  const text = body?.text?.trim();
  const to = body?.to;

  if (!text) {
    return NextResponse.json({ translated: "" }, { status: 400 });
  }
  if (!to || (to !== "fr" && to !== "en" && to !== "ar")) {
    return NextResponse.json({ translated: "" }, { status: 400 });
  }

  if (to === "en") {
    return NextResponse.json({ translated: text });
  }

  const key = `${to}::${text}`;
  const cached = cache.get(key);
  if (cached) {
    return NextResponse.json({ translated: cached });
  }

  try {
    const translated = await translateViaGoogle(text, to);
    const normalized = translated?.trim() || "";
    cache.set(key, normalized || text);
    return NextResponse.json({ translated: normalized || text });
  } catch {
    // Fallback to original text on translation errors.
    return NextResponse.json({ translated: text });
  }
}

