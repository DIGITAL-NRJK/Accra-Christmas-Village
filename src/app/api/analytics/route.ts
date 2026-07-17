import { incrementAnonymousPageView } from "@/db/queries";

const devices = ["mobile", "tablet", "desktop"];
const sources = ["direct", "internal", "search", "social", "referral"];
const excludedPrefixes = ["/admin", "/portal", "/sign-in", "/sign-up", "/api", "/documents", "/hero-assets"];

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1024) return new Response(null, { status: 413 });
  const body = await request.json().catch(() => null) as { path?: unknown; device?: unknown; source?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path.slice(0, 160) : "";
  const device = typeof body?.device === "string" ? body.device : "";
  const source = typeof body?.source === "string" ? body.source : "";
  if (!path.startsWith("/") || path.includes("?") || excludedPrefixes.some((prefix) => path.startsWith(prefix)) || !devices.includes(device) || !sources.includes(source)) {
    return new Response(null, { status: 400 });
  }
  await incrementAnonymousPageView({ path, device, source });
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
