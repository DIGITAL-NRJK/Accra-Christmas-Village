import type { MetadataRoute } from "next";

const routes = [
  "",
  "/map",
  "/programme",
  "/stands",
  "/sponsors",
  "/practical-info",
  "/safety",
  "/faq",
  "/portal",
  "/admin",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://accra-christmas-village.netlify.app";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-07-03"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
