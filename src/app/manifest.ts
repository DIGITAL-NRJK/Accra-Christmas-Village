import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Accra Christmas Village",
    short_name: "ACV",
    description: "Visitor guide, participant portal and organizer admin.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf6",
    theme_color: "#17211d",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
