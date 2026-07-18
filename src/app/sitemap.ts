import type { MetadataRoute } from "next";
import { listPublishedVendorBrandProfiles } from "@/db/vendor-branding";

export const dynamic = "force-dynamic";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://accra-christmas-village.netlify.app";
  const vendorProfiles = await listPublishedVendorBrandProfiles();

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date("2026-07-18"),
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...vendorProfiles.map(({ profile }) => ({
      url: `${baseUrl}/vendors/${profile.slug}`,
      lastModified: profile.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
