import { type NextRequest, NextResponse } from "next/server";

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#F5F5F0"/>
  <rect x="160" y="140" width="80" height="80" rx="8" fill="#D6D3CB"/>
  <circle cx="175" cy="168" r="10" fill="#F5F5F0"/>
  <polygon points="160,220 200,175 240,220" fill="#F5F5F0"/>
  <polygon points="195,205 225,175 255,220 195,220" fill="#C8C5BC"/>
</svg>`;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return placeholder();

  const res = await tryFetch(url);
  if (!res) return placeholder();

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "content-type": res.headers.get("content-type") ?? "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
  });
}

async function tryFetch(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url);
    if (res.ok && isImage(res)) return res;
  } catch {}

  if (url.startsWith("https://")) {
    try {
      const res = await fetch(url.replace("https://", "http://"));
      if (res.ok && isImage(res)) return res;
    } catch {}
  }

  return null;
}

function isImage(res: Response): boolean {
  return (res.headers.get("content-type") ?? "").startsWith("image/");
}

function placeholder() {
  return new NextResponse(PLACEHOLDER_SVG, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=60",
    },
  });
}
