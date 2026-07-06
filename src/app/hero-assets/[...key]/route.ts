import { heroImageStorage } from "@/lib/storage";

function storageKeyFromSegments(segments: string[] | undefined) {
  const key = segments?.join("/") ?? "";

  if (!key || key.includes("..")) {
    return "";
  }

  return key;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key?: string[] }> },
) {
  const { key } = await params;
  const storageKey = storageKeyFromSegments(key);

  if (!storageKey) {
    return new Response("Hero image not found", { status: 404 });
  }

  let file: Blob | null = null;

  try {
    file = await heroImageStorage.get(storageKey);
  } catch (error) {
    console.error("Failed to read hero image storage object.", {
      storageKey,
      error,
    });

    return new Response("Hero image storage unavailable", { status: 503 });
  }

  if (!file) {
    return new Response("Hero image not found", { status: 404 });
  }

  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": file.type || "application/octet-stream",
  });

  if (file.size) {
    headers.set("Content-Length", String(file.size));
  }

  return new Response(file, { headers });
}
